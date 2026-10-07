import { useEffect, useMemo, useRef, useState } from 'react';
import { CHANNEL_COLLECTIONS, VIDEO_CATEGORIES, VIDEO_LIBRARY, filterVideoLibrary, pairedLongForm, youtubeThumbnailUrl, youtubeWatchUrl } from './catalog';
import type { ClinicalVideo, VideoFormat, VideoIntent, VideoLevel } from './types';

type Sort = 'featured' | 'newest' | 'shortest' | 'az';
type VideoView = 'feed' | 'browse';
type PlayerTarget =
  | { kind: 'video'; video: ClinicalVideo }
  | { kind: 'playlist'; label: string; playlistId: string; channelId: string };

type YTPlayer = {
  playVideo: () => void;
  pauseVideo: () => void;
  mute: () => void;
  unMute: () => void;
  seekTo: (seconds: number, allowSeekAhead?: boolean) => void;
  destroy: () => void;
};

declare global {
  interface Window {
    YT?: {
      Player: new (el: HTMLElement, opts: {
        host?: string;
        videoId: string;
        playerVars?: Record<string, string | number>;
        events?: {
          onReady?: (event: { target: YTPlayer }) => void;
          onStateChange?: (event: { data: number; target: YTPlayer }) => void;
        };
      }) => YTPlayer;
      PlayerState?: { ENDED: number };
    };
    onYouTubeIframeAPIReady?: () => void;
  }
}

let youtubeApiPromise: Promise<void> | null = null;
function loadYouTubeApi() {
  if (window.YT?.Player) return Promise.resolve();
  if (youtubeApiPromise) return youtubeApiPromise;
  youtubeApiPromise = new Promise<void>((resolve) => {
    const previous = window.onYouTubeIframeAPIReady;
    window.onYouTubeIframeAPIReady = () => { previous?.(); resolve(); };
    const existing = document.querySelector<HTMLScriptElement>('script[src="https://www.youtube.com/iframe_api"]');
    if (!existing) {
      const script = document.createElement('script');
      script.src = 'https://www.youtube.com/iframe_api';
      script.async = true;
      document.head.appendChild(script);
    }
  });
  return youtubeApiPromise;
}

const INTENTS: { id: VideoIntent; label: string }[] = [
  { id: 'learn', label: 'Learn it' },
  { id: 'setup', label: 'Set it up' },
  { id: 'perform', label: 'Perform it' },
  { id: 'manage', label: 'Manage it' },
  { id: 'troubleshoot', label: 'Troubleshoot it' },
  { id: 'case-review', label: 'See cases' },
];

const fmtDuration = (seconds?: number) => {
  if (!seconds) return null;
  const m = Math.floor(seconds / 60);
  const s = String(seconds % 60).padStart(2, '0');
  return `${m}:${s}`;
};

const videoEmbed = (videoId: string) =>
  `https://www.youtube-nocookie.com/embed/${encodeURIComponent(videoId)}?autoplay=1&rel=0&playsinline=1`;

const playlistEmbed = (playlistId: string) =>
  `https://www.youtube-nocookie.com/embed/videoseries?list=${encodeURIComponent(playlistId)}&autoplay=1&rel=0&playsinline=1`;

function FeedPlayer({ video, muted }: { video: ClinicalVideo; muted: boolean }) {
  // React owns only this wrapper. YouTube is allowed to replace/remove the child
  // node it receives without racing React's reconciler during feed transitions.
  const host = useRef<HTMLDivElement>(null);
  const player = useRef<YTPlayer | null>(null);

  useEffect(() => {
    let cancelled = false;
    let mountNode: HTMLDivElement | null = null;

    loadYouTubeApi().then(() => {
      if (cancelled || !host.current || !window.YT?.Player) return;

      mountNode = document.createElement('div');
      mountNode.className = 'video-feed-player-mount';
      host.current.replaceChildren(mountNode);

      player.current = new window.YT.Player(mountNode, {
        host: 'https://www.youtube-nocookie.com',
        videoId: video.youtubeId,
        playerVars: {
          autoplay: 1,
          playsinline: 1,
          rel: 0,
          controls: 1,
          loop: 1,
          playlist: video.youtubeId,
        },
        events: {
          onReady: ({ target }) => {
            if (muted) target.mute(); else target.unMute();
            target.playVideo();
          },
          onStateChange: ({ data, target }) => {
            if (data === window.YT?.PlayerState?.ENDED) {
              target.seekTo(0, true);
              target.playVideo();
            }
          },
        },
      });
    });

    return () => {
      cancelled = true;
      try { player.current?.destroy(); } catch { /* YouTube may already have removed its iframe. */ }
      player.current = null;
      if (host.current) host.current.replaceChildren();
      mountNode = null;
    };
  }, [video.youtubeId]);

  useEffect(() => {
    const p = player.current;
    if (!p) return;
    try {
      if (muted) p.mute(); else p.unMute();
      p.playVideo();
    } catch {
      // Player may be between destruction and replacement during a fast scroll.
    }
  }, [muted]);

  return <div className="video-feed-player" ref={host} />;
}

function FeedCard({
  video,
  active,
  muted,
  setMuted,
  register,
  openVideo,
}: {
  video: ClinicalVideo;
  active: boolean;
  muted: boolean;
  setMuted: (value: boolean) => void;
  register: (id: string, node: HTMLElement | null) => void;
  openVideo: (video: ClinicalVideo) => void;
}) {
  return <article
    ref={(node) => register(video.id, node)}
    data-video-id={video.id}
    className={`video-feed-card${active ? ' active' : ''}`}
    aria-label={video.title}
  >
    <div className="video-feed-media">
      {active
        ? <FeedPlayer video={video} muted={muted} />
        : <img src={youtubeThumbnailUrl(video)} alt="" loading="lazy" />}
    </div>
    <div className="video-feed-info">
      <div className="video-feed-copy">
        <div className="video-feed-meta">
          <span>{video.format === 'short' ? 'SHORT' : 'VIDEO'}</span>
          <span>{video.level}</span>
          {fmtDuration(video.durationSeconds) && <span>{fmtDuration(video.durationSeconds)}</span>}
        </div>
        <h3>{video.title}</h3>
        <b>{video.channel}</b>
        <p>{video.summary}</p>
        <div className="video-feed-tags">{video.intents.slice(0, 3).map((tag) => <span key={tag}>{INTENTS.find((item) => item.id === tag)?.label ?? tag}</span>)}</div>
      </div>
      <div className="video-feed-actions" aria-label="Feed actions">
        <button onClick={() => setMuted(!muted)} aria-label={muted ? 'Turn sound on' : 'Mute feed'}>
          <span aria-hidden="true">{muted ? '🔇' : '🔊'}</span><small>{muted ? 'Sound' : 'Mute'}</small>
        </button>
        <button onClick={() => openVideo(video)} aria-label="Open expanded player">
          <span aria-hidden="true">⛶</span><small>Expand</small>
        </button>
        <a href={youtubeWatchUrl(video)} target="_blank" rel="noreferrer" aria-label="Open on YouTube">
          <span aria-hidden="true">↗</span><small>YouTube</small>
        </a>
      </div>
      {active && muted && <button className="video-feed-sound-hint" onClick={() => setMuted(false)}>Tap for sound</button>}
    </div>
  </article>;
}

export function VideoLibrary() {
  const [view, setView] = useState<VideoView>('feed');
  const [query, setQuery] = useState('');
  const [category, setCategory] = useState<string | null>(null);
  const [subcategory, setSubcategory] = useState<string | null>(null);
  const [format, setFormat] = useState<VideoFormat | null>(null);
  const [level, setLevel] = useState<VideoLevel | null>(null);
  const [intent, setIntent] = useState<VideoIntent | null>(null);
  const [sort, setSort] = useState<Sort>('featured');
  const [channel, setChannel] = useState<string | null>(null);
  const [player, setPlayer] = useState<PlayerTarget | null>(null);
  const [activeFeedId, setActiveFeedId] = useState<string | null>(null);
  const [feedMuted, setFeedMuted] = useState(true);
  const libraryRef = useRef<HTMLElement>(null);
  const feedNodes = useRef(new Map<string, HTMLElement>());

  const categoryDef = VIDEO_CATEGORIES.find((item) => item.id === category);
  const videos = useMemo(() => {
    const filtered = filterVideoLibrary({ query, category, subcategory, format, level, intent }).filter((video) => !channel || video.channel === channel);
    return [...filtered].sort((a, b) => {
      if (sort === 'newest') return (b.published ?? '').localeCompare(a.published ?? '');
      if (sort === 'shortest') return (a.durationSeconds ?? Number.MAX_SAFE_INTEGER) - (b.durationSeconds ?? Number.MAX_SAFE_INTEGER);
      if (sort === 'az') return a.title.localeCompare(b.title);
      if (view === 'feed') {
        const formatBias = Number(b.format === 'short') - Number(a.format === 'short');
        if (formatBias) return formatBias;
      }
      return Number(!!b.featured) - Number(!!a.featured) || a.title.localeCompare(b.title);
    });
  }, [query, category, subcategory, format, level, intent, sort, channel, view]);

  useEffect(() => {
    if (view !== 'feed' || videos.length === 0) return;
    if (!activeFeedId || !videos.some((video) => video.id === activeFeedId)) setActiveFeedId(videos[0].id);
  }, [view, videos, activeFeedId]);

  useEffect(() => {
    if (view !== 'feed') return;
    const root = libraryRef.current;
    if (!root) return;

    const observer = new IntersectionObserver((entries) => {
      const visible = entries
        .filter((entry) => entry.isIntersecting)
        .sort((a, b) => b.intersectionRatio - a.intersectionRatio)[0];
      if (visible) {
        const id = (visible.target as HTMLElement).dataset.videoId;
        if (id) setActiveFeedId(id);
      }
    }, {
      root,
      rootMargin: '-20% 0px -20% 0px',
      threshold: [0.01, 0.15, 0.35, 0.55],
    });

    for (const node of feedNodes.current.values()) observer.observe(node);
    return () => observer.disconnect();
  }, [view, videos]);

  const registerFeedNode = (id: string, node: HTMLElement | null) => {
    if (node) feedNodes.current.set(id, node);
    else feedNodes.current.delete(id);
  };

  const selectCategory = (id: string | null) => {
    setCategory(id);
    setSubcategory(null);
  };

  const clear = () => {
    setQuery('');
    setCategory(null);
    setSubcategory(null);
    setFormat(null);
    setLevel(null);
    setIntent(null);
    setSort('featured');
    setChannel(null);
  };

  const openVideo = (video: ClinicalVideo) => {
    setPlayer({ kind: 'video', video });
    window.setTimeout(() => document.getElementById('video-player')?.scrollIntoView({ behavior: 'smooth', block: 'start' }), 0);
  };

  const openChannel = (source: typeof CHANNEL_COLLECTIONS[number]) => {
    setPlayer({ kind: 'playlist', label: source.label, playlistId: source.uploadsPlaylistId, channelId: source.channelId });
    window.setTimeout(() => document.getElementById('video-player')?.scrollIntoView({ behavior: 'smooth', block: 'start' }), 0);
  };

  return <main ref={libraryRef} className={`video-library video-view-${view}`}>
    <section className="video-hero">
      <div>
        <span className="eyebrow">{view === 'feed' ? 'Swipe · watch · keep learning' : 'Watch here · stay in the learning flow'}</span>
        <h2>Critical Care Videos</h2>
        <p>{view === 'feed'
          ? 'A vertical autoplay feed built from the curated CriticalCareNow, Lecturio Medical and Lecturio Nursing library. Swipe to the next video; only the visible video plays.'
          : 'Browse YouTube teaching directly inside the app, then narrow the indexed library by device, procedure, topic and learning goal.'}</p>
      </div>
      <div className="video-view-switch" role="group" aria-label="Video view">
        <button className={view === 'feed' ? 'on' : ''} onClick={() => { setPlayer(null); setView('feed'); }}>Feed</button>
        <button className={view === 'browse' ? 'on' : ''} onClick={() => setView('browse')}>Browse</button>
      </div>
    </section>

    {view === 'feed' && <>
      <section className="video-feed-filterbar" aria-label="Feed filters">
        <div className="video-feed-filter-scroll">
          <button className={channel == null ? 'on' : ''} onClick={() => setChannel(null)}>All sources</button>
          {CHANNEL_COLLECTIONS.map((item) => <button key={item.id} className={channel === item.label ? 'on' : ''} onClick={() => setChannel(channel === item.label ? null : item.label)}>{item.label}</button>)}
          <i aria-hidden="true" />
          <button className={format == null ? 'on' : ''} onClick={() => setFormat(null)}>All videos</button>
          <button className={format === 'short' ? 'on' : ''} onClick={() => setFormat(format === 'short' ? null : 'short')}>Shorts</button>
          <button className={format === 'long' ? 'on' : ''} onClick={() => setFormat(format === 'long' ? null : 'long')}>Deep dives</button>
        </div>
      </section>
      {videos.length ? <section className="video-feed" aria-label="Autoplay critical-care video feed">
        {videos.map((video) => <FeedCard
          key={video.id}
          video={video}
          active={activeFeedId === video.id}
          muted={feedMuted}
          setMuted={setFeedMuted}
          register={registerFeedNode}
          openVideo={openVideo}
        />)}
      </section> : <div className="video-empty video-feed-empty">
        <b>No indexed videos match this feed filter yet.</b>
        <p>Switch sources or format, or use Browse to explore the complete priority-channel upload collections.</p>
        <button onClick={clear}>Reset feed</button>
      </div>}
      <div className="video-feed-note">Scroll normally through the feed. The card entering the center of this workspace becomes active and the previous player is torn down safely. Autoplay begins muted; tap “Sound” once to unmute.</div>
    </>}

    {view === 'browse' && <>
      {player && <section id="video-player" className="video-player-shell" aria-label="In-app YouTube player">
        <div className="video-player-head">
          <div>
            <span className="eyebrow">{player.kind === 'playlist' ? 'Channel collection' : 'Now playing'}</span>
            <h3>{player.kind === 'playlist' ? player.label : player.video.title}</h3>
            <p>{player.kind === 'playlist'
              ? 'Browse this channel’s upload stream without leaving Critical Care.'
              : `${player.video.channel} · ${player.video.level}`}</p>
          </div>
          <button className="video-close" onClick={() => setPlayer(null)} aria-label="Close video player">✕</button>
        </div>
        <div className="video-embed-wrap">
          <iframe
            key={player.kind === 'playlist' ? player.playlistId : player.video.youtubeId}
            src={player.kind === 'playlist' ? playlistEmbed(player.playlistId) : videoEmbed(player.video.youtubeId)}
            title={player.kind === 'playlist' ? `${player.label} YouTube uploads` : player.video.title}
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
            referrerPolicy="strict-origin-when-cross-origin"
            allowFullScreen
          />
        </div>
        <div className="video-player-foot">
          <span>{player.kind === 'playlist'
            ? 'Use the YouTube playlist controls inside the player to move through the channel.'
            : 'When you are finished, stay here and continue into related videos, lessons, Mental Reps and simulations.'}</span>
          <a href={player.kind === 'playlist'
            ? `https://www.youtube.com/channel/${player.channelId}/videos`
            : youtubeWatchUrl(player.video)} target="_blank" rel="noreferrer">Open on YouTube ↗</a>
        </div>
      </section>}

      <section className="video-channels">
        <div className="video-section-head">
          <div><span className="eyebrow">Priority sources</span><h3>Browse complete channel uploads</h3></div>
          <span className="muted small">In-app YouTube player</span>
        </div>
        <div className="video-channel-grid">
          {CHANNEL_COLLECTIONS.map((source) => <button key={source.id} onClick={() => openChannel(source)}>
            <span className="video-channel-play" aria-hidden="true">▶</span>
            <b>{source.label}</b>
            <p>{source.description}</p>
            <small>Play channel uploads →</small>
          </button>)}
        </div>
      </section>

      <section className="video-searchbar" aria-label="Video search and sorting">
        <label>
          <span className="sr-only">Search critical care videos</span>
          <input value={query} onChange={(e) => setQuery(e.target.value)} placeholder="Search chest tube, EVD, ReVel, APRV, push-dose pressors…" />
        </label>
        <select value={sort} onChange={(e) => setSort(e.target.value as Sort)} aria-label="Sort videos">
          <option value="featured">Featured</option>
          <option value="newest">Newest</option>
          <option value="shortest">Shortest</option>
          <option value="az">A–Z</option>
        </select>
      </section>

      <section className="video-category-section">
        <div className="video-section-head"><div><span className="eyebrow">Browse indexed videos</span><h3>What are you working on?</h3></div>{category && <button className="linkish" onClick={() => selectCategory(null)}>View all categories</button>}</div>
        <div className="video-category-grid">
          {VIDEO_CATEGORIES.map((item) => {
            const count = VIDEO_LIBRARY.filter((video) => video.reviewStatus === 'listed' && video.category === item.id).length;
            return <button key={item.id} className={category === item.id ? 'on' : ''} onClick={() => selectCategory(category === item.id ? null : item.id)}>
              <b>{item.label}</b><span>{item.description}</span><small>{count ? `${count} indexed` : 'Index expanding'}</small>
            </button>;
          })}
        </div>
      </section>

      <section className="video-filters" aria-label="Video filters">
        <div className="video-filter-row"><span>Channel</span><div className="chips">
          <button className={`chip${channel == null ? ' on' : ''}`} onClick={() => setChannel(null)}>All</button>
          {CHANNEL_COLLECTIONS.map((item) => <button key={item.id} className={`chip${channel === item.label ? ' on' : ''}`} onClick={() => setChannel(channel === item.label ? null : item.label)}>{item.label}</button>)}
        </div></div>
        {categoryDef && <div className="video-filter-row"><span>Topic</span><div className="chips">
          <button className={`chip${subcategory == null ? ' on' : ''}`} onClick={() => setSubcategory(null)}>All</button>
          {categoryDef.subcategories.map((item) => <button key={item.id} className={`chip${subcategory === item.id ? ' on' : ''}`} onClick={() => setSubcategory(subcategory === item.id ? null : item.id)}>{item.label}</button>)}
        </div></div>}
        <div className="video-filter-row"><span>Goal</span><div className="chips">
          <button className={`chip${intent == null ? ' on' : ''}`} onClick={() => setIntent(null)}>Any</button>
          {INTENTS.map((item) => <button key={item.id} className={`chip${intent === item.id ? ' on' : ''}`} onClick={() => setIntent(intent === item.id ? null : item.id)}>{item.label}</button>)}
        </div></div>
        <div className="video-filter-row"><span>Format</span><div className="chips">
          <button className={`chip${format == null ? ' on' : ''}`} onClick={() => setFormat(null)}>All</button>
          <button className={`chip${format === 'short' ? ' on' : ''}`} onClick={() => setFormat(format === 'short' ? null : 'short')}>Shorts</button>
          <button className={`chip${format === 'long' ? ' on' : ''}`} onClick={() => setFormat(format === 'long' ? null : 'long')}>Long form</button>
        </div></div>
        <div className="video-filter-row"><span>Level</span><div className="chips">
          <button className={`chip${level == null ? ' on' : ''}`} onClick={() => setLevel(null)}>Any</button>
          {(['foundational','intermediate','advanced'] as VideoLevel[]).map((item) => <button key={item} className={`chip${level === item ? ' on' : ''}`} onClick={() => setLevel(level === item ? null : item)}>{item}</button>)}
        </div></div>
      </section>

      <section className="video-results">
        <div className="video-section-head">
          <div><span className="eyebrow">Indexed library</span><h3>{videos.length} video{videos.length === 1 ? '' : 's'}</h3></div>
          {(query || category || subcategory || format || level || intent || channel) && <button className="linkish" onClick={clear}>Clear filters</button>}
        </div>
        {videos.length ? <div className="video-grid">{videos.map((video) => {
          const pair = pairedLongForm(video);
          return <article key={video.id} className="video-card">
            <button className="video-thumb" onClick={() => openVideo(video)} aria-label={`Play ${video.title} in app`}>
              <img src={youtubeThumbnailUrl(video)} alt="" loading="lazy" />
              <span className="video-play" aria-hidden="true">▶</span>
              <em>{video.format === 'short' ? 'SHORT' : 'VIDEO'}{fmtDuration(video.durationSeconds) ? ` · ${fmtDuration(video.durationSeconds)}` : ''}</em>
            </button>
            <div className="video-card-body">
              <div className="video-meta"><span>{video.level}</span><span>{video.channel}</span></div>
              <h4>{video.title}</h4>
              <p>{video.summary}</p>
              <div className="video-tags">{video.intents.slice(0, 3).map((tag) => <span key={tag}>{INTENTS.find((item) => item.id === tag)?.label ?? tag}</span>)}</div>
              <div className="video-actions">
                <button className="video-watch-inapp" onClick={() => openVideo(video)}>▶ Watch in app</button>
                {pair && <button className="deep-link video-related" onClick={() => openVideo(pair)}>Full lesson: {pair.title} →</button>}
                <a href={youtubeWatchUrl(video)} target="_blank" rel="noreferrer">YouTube ↗</a>
              </div>
            </div>
          </article>;
        })}</div> : <div className="video-empty">
          <b>No indexed videos match these filters yet.</b>
          <p>The three priority-channel collections above are still available while automated classification expands this shelf.</p>
          <button onClick={clear}>Clear filters</button>
        </div>}
      </section>
    </>}

    <section className="video-boundary">
      <b>Curated learning resources, not protocol.</b>
      <span>YouTube videos play through YouTube’s official embedded player. Device setup and procedures should be checked against current manufacturer instructions, local policy and medical direction.</span>
    </section>
  </main>;
}
