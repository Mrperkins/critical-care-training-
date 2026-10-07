import { useEffect, useMemo, useRef, useState } from 'react';
import { CHANNEL_COLLECTIONS, VIDEO_CATEGORIES, VIDEO_LIBRARY, VIDEO_SKILL_COLLECTIONS, canAutoplayInFeed, filterVideoLibrary, pairedLongForm, videoMatchesSkill, videoProvider, videoSourceUrl, youtubeThumbnailUrl } from './catalog';
import type { VideoSkillCollectionId } from './catalog';
import { buildFeedEmbedUrl, inFeedPreloadWindow, mostVisibleVideoId } from './feed';
import type { ClinicalVideo, VideoFormat, VideoIntent, VideoLevel } from './types';

type Sort = 'featured' | 'newest' | 'shortest' | 'az';
type VideoView = 'feed' | 'browse';
type FeedKind = 'all' | 'shorts' | 'skills' | 'deep';
type PlayerTarget =
  | { kind: 'video'; video: ClinicalVideo }
  | { kind: 'playlist'; label: string; playlistId: string; channelId: string };

type YTPlayer = {
  playVideo: () => void;
  pauseVideo: () => void;
  stopVideo: () => void;
  mute: () => void;
  unMute: () => void;
  seekTo: (seconds: number, allowSeekAhead?: boolean) => void;
  getIframe: () => HTMLIFrameElement;
};

declare global {
  interface Window {
    YT?: {
      Player: new (el: HTMLElement, opts: {
        host?: string;
        videoId?: string;
        playerVars?: Record<string, string | number>;
        events?: {
          onReady?: (event: { target: YTPlayer }) => void;
          onStateChange?: (event: { data: number; target: YTPlayer }) => void;
          onAutoplayBlocked?: (event: { target: YTPlayer }) => void;
          onError?: (event: { data: number; target: YTPlayer }) => void;
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

function FeedPlayer({
  video,
  active,
  muted,
  onAutoplayBlocked,
}: {
  video: ClinicalVideo;
  active: boolean;
  muted: boolean;
  onAutoplayBlocked: () => void;
}) {
  const iframe = useRef<HTMLIFrameElement>(null);
  const player = useRef<YTPlayer | null>(null);
  const ready = useRef(false);
  const activeRef = useRef(active);
  const mutedRef = useRef(muted);
  // Keep the iframe src stable while this card is preloaded. The first card
  // can begin muted autoplay before the JS API handshake even finishes.
  const initialAutoplay = useRef(active).current;
  const youtubeId = video.youtubeId ?? '';
  const src = useMemo(() => buildFeedEmbedUrl(youtubeId, window.location.origin, initialAutoplay), [youtubeId, initialAutoplay]);

  const syncPlayback = (target = player.current) => {
    if (!target || !ready.current) return;
    try {
      if (!activeRef.current) {
        target.pauseVideo();
        return;
      }

      // Always enter playback muted first. This avoids the browser rejecting
      // the playback request before we have a user gesture for sound.
      target.mute();
      target.playVideo();

      if (!mutedRef.current) {
        window.setTimeout(() => {
          if (!activeRef.current || !player.current) return;
          try {
            player.current.unMute();
            player.current.playVideo();
          } catch { /* iframe may have left the preload window */ }
        }, 60);
      }
    } catch { /* player may be transitioning between cards */ }
  };

  useEffect(() => {
    activeRef.current = active;
    mutedRef.current = muted;
    syncPlayback();
  }, [active, muted]);

  useEffect(() => {
    let cancelled = false;

    loadYouTubeApi().then(() => {
      if (cancelled || !iframe.current || !window.YT?.Player) return;

      // The iframe is created by React first. Per YouTube's documented
      // existing-iframe API path, YT.Player attaches to it instead of
      // replacing a React-owned DOM node.
      player.current = new window.YT.Player(iframe.current, {
        events: {
          onReady: ({ target }) => {
            if (cancelled) return;
            ready.current = true;
            syncPlayback(target);
          },
          onStateChange: ({ data, target }) => {
            if (data === window.YT?.PlayerState?.ENDED && activeRef.current) {
              target.seekTo(0, true);
              target.playVideo();
            }
          },
          onAutoplayBlocked: ({ target }) => {
            if (!activeRef.current) return;
            // Automatically fall back to muted playback rather than asking the
            // learner to hit Play.
            onAutoplayBlocked();
            try {
              target.mute();
              target.playVideo();
            } catch { /* leave the thumbnail/player available as a final fallback */ }
          },
          onError: ({ data }) => {
            console.warn(`YouTube feed playback error ${data} for ${video.youtubeId}`);
          },
        },
      });
    });

    return () => {
      cancelled = true;
      ready.current = false;
      try { player.current?.pauseVideo(); } catch { /* iframe is already leaving */ }
      // Do not call player.destroy(): React owns this existing iframe and will
      // remove it. Letting YouTube remove it first can trigger DOM reconciliation
      // errors during fast scrolling.
      player.current = null;
    };
  }, [youtubeId]);

  return <iframe
    ref={iframe}
    className="video-feed-player"
    src={src}
    title={video.title}
    allow="autoplay; encrypted-media; picture-in-picture; fullscreen"
    loading="eager"
    tabIndex={-1}
    referrerPolicy="strict-origin-when-cross-origin"
    allowFullScreen
  />;
}

function Html5FeedPlayer({ video, active, muted }: { video: ClinicalVideo; active: boolean; muted: boolean }) {
  const media = useRef<HTMLVideoElement>(null);
  useEffect(() => {
    const node = media.current;
    if (!node) return;
    node.muted = muted;
    if (active) {
      node.play().catch(() => { node.muted = true; void node.play().catch(() => undefined); });
    } else {
      node.pause();
    }
  }, [active, muted]);
  if (!video.mediaUrl) return null;
  return <video ref={media} className="video-feed-player" src={video.mediaUrl} muted={muted} playsInline loop preload="auto" />;
}

function ManufacturerResource({ video }: { video: ClinicalVideo }) {
  return <div className="video-manufacturer-resource">
    <span className="video-provider-badge">OFFICIAL MANUFACTURER</span>
    <b>{video.sourceLabel ?? video.channel}</b>
    <p>This manufacturer hosts the training on its own site. Open the official source for the current media, documentation or training experience.</p>
    <a href={videoSourceUrl(video)} target="_blank" rel="noreferrer">Open official training ↗</a>
  </div>;
}

function FeedMedia({
  video,
  active,
  hydrate,
  muted,
  setMuted,
}: {
  video: ClinicalVideo;
  active: boolean;
  hydrate: boolean;
  muted: boolean;
  setMuted: (value: boolean) => void;
}) {
  const provider = videoProvider(video);
  if (provider === 'external') return <ManufacturerResource video={video} />;
  if (!hydrate) {
    const thumb = youtubeThumbnailUrl(video);
    return thumb
      ? <img src={thumb} alt="" loading="lazy" />
      : <div className="video-provider-placeholder"><span>{video.channel}</span><b>{video.title}</b></div>;
  }
  if (provider === 'html5') return <Html5FeedPlayer video={video} active={active} muted={muted} />;
  if (provider === 'embed' && video.embedUrl) {
    return active
      ? <iframe className="video-feed-player" src={video.embedUrl} title={video.title} allow="autoplay; fullscreen; picture-in-picture" tabIndex={-1} allowFullScreen />
      : <div className="video-provider-placeholder"><span>{video.channel}</span><b>{video.title}</b></div>;
  }
  return <FeedPlayer video={video} active={active} muted={muted} onAutoplayBlocked={() => setMuted(true)} />;
}

function FeedCard({
  video,
  active,
  hydrate,
  muted,
  setMuted,
  register,
  openVideo,
}: {
  video: ClinicalVideo;
  active: boolean;
  hydrate: boolean;
  muted: boolean;
  setMuted: (value: boolean) => void;
  register: (id: string, node: HTMLElement | null) => void;
  openVideo: (video: ClinicalVideo) => void;
}) {
  return <article
    data-video-format={video.format}
    className={`video-feed-card${active ? ' active' : ''}`}
    aria-label={video.title}
  >
    <div ref={(node) => register(video.id, node)} data-video-id={video.id} className="video-feed-media">
      <FeedMedia video={video} active={active} hydrate={hydrate} muted={muted} setMuted={setMuted} />
    </div>
    <div className="video-feed-info">
      <div className="video-feed-copy">
        <div className="video-feed-meta">
          <span>{video.format === 'short' ? 'SHORT' : 'VIDEO'}</span>
          <span>{video.sourceClass === 'manufacturer' ? 'OFFICIAL' : video.level}</span>
          {fmtDuration(video.durationSeconds) && <span>{fmtDuration(video.durationSeconds)}</span>}
        </div>
        <h3>{video.title}</h3>
        <b>{video.channel}</b>
        <p>{video.summary}</p>
        <div className="video-feed-tags">{video.intents.slice(0, 3).map((tag) => <span key={tag}>{INTENTS.find((item) => item.id === tag)?.label ?? tag}</span>)}</div>
      </div>
      <div className="video-feed-actions" aria-label="Feed actions">
        {canAutoplayInFeed(video) && <button onClick={() => setMuted(!muted)} aria-label={muted ? 'Turn sound on' : 'Mute feed'}>
          <span aria-hidden="true">{muted ? '🔇' : '🔊'}</span><small>{muted ? 'Sound' : 'Mute'}</small>
        </button>}
        {videoProvider(video) !== 'external' && <button onClick={() => openVideo(video)} aria-label="Open expanded player">
          <span aria-hidden="true">⛶</span><small>Expand</small>
        </button>}
        <a href={videoSourceUrl(video)} target="_blank" rel="noreferrer" aria-label={video.sourceClass === 'manufacturer' ? 'Open official manufacturer training' : 'Open source'}>
          <span aria-hidden="true">↗</span><small>{video.sourceClass === 'manufacturer' ? 'Official' : 'Source'}</small>
        </a>
      </div>
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
  const [feedKind, setFeedKind] = useState<FeedKind>('all');
  const [skillCollection, setSkillCollection] = useState<VideoSkillCollectionId>('all');
  const [feedMuted, setFeedMuted] = useState(true);
  const libraryRef = useRef<HTMLElement>(null);
  const feedNodes = useRef(new Map<string, HTMLElement>());
  const feedRatios = useRef(new Map<string, number>());

  const manufacturerSources = useMemo(() => Array.from(new Set(
    VIDEO_LIBRARY.filter((video) => video.reviewStatus === 'listed' && video.sourceClass === 'manufacturer').map((video) => video.channel)
  )).sort(), []);

  const categoryDef = VIDEO_CATEGORIES.find((item) => item.id === category);
  const browseVideos = useMemo(() => {
    const filtered = filterVideoLibrary({ query, category, subcategory, format, level, intent }).filter((video) => !channel || video.channel === channel);
    return [...filtered].sort((a, b) => {
      if (sort === 'newest') return (b.published ?? '').localeCompare(a.published ?? '');
      if (sort === 'shortest') return (a.durationSeconds ?? Number.MAX_SAFE_INTEGER) - (b.durationSeconds ?? Number.MAX_SAFE_INTEGER);
      if (sort === 'az') return a.title.localeCompare(b.title);
      return Number(!!b.featured) - Number(!!a.featured) || a.title.localeCompare(b.title);
    });
  }, [query, category, subcategory, format, level, intent, sort, channel]);

  const feedVideos = useMemo(() => {
    let filtered = VIDEO_LIBRARY.filter((video) => video.reviewStatus === 'listed' && (!channel || video.channel === channel));
    if (feedKind === 'shorts') filtered = filtered.filter((video) => video.format === 'short');
    if (feedKind === 'deep') filtered = filtered.filter((video) => video.format === 'long');
    if (feedKind === 'skills') filtered = filtered.filter((video) => videoMatchesSkill(video, skillCollection));
    return [...filtered].sort((a, b) => {
      if (feedKind === 'all') {
        const formatBias = Number(b.format === 'short') - Number(a.format === 'short');
        if (formatBias) return formatBias;
      }
      const featuredBias = Number(!!b.featured) - Number(!!a.featured);
      if (featuredBias) return featuredBias;
      return (b.published ?? '').localeCompare(a.published ?? '') || a.title.localeCompare(b.title);
    });
  }, [channel, feedKind, skillCollection]);

  const feedCounts = useMemo(() => {
    const source = VIDEO_LIBRARY.filter((video) => video.reviewStatus === 'listed' && (!channel || video.channel === channel));
    return {
      all: source.length,
      shorts: source.filter((video) => video.format === 'short').length,
      skills: source.filter((video) => videoMatchesSkill(video, 'all')).length,
      deep: source.filter((video) => video.format === 'long').length,
    };
  }, [channel]);

  const skillCounts = useMemo(() => {
    const source = VIDEO_LIBRARY.filter((video) => video.reviewStatus === 'listed' && (!channel || video.channel === channel));
    return new Map(VIDEO_SKILL_COLLECTIONS.map((item) => [
      item.id,
      source.filter((video) => videoMatchesSkill(video, item.id)).length,
    ]));
  }, [channel]);

  const [activeFeedId, setActiveFeedId] = useState<string | null>(() => feedVideos[0]?.id ?? null);
  const activeFeedIndex = Math.max(0, feedVideos.findIndex((video) => video.id === activeFeedId));

  useEffect(() => {
    if (view !== 'feed' || feedVideos.length === 0) return;
    if (!activeFeedId || !feedVideos.some((video) => video.id === activeFeedId)) setActiveFeedId(feedVideos[0].id);
  }, [view, feedVideos, activeFeedId]);

  useEffect(() => {
    if (view !== 'feed') return;
    const root = libraryRef.current;
    if (!root) return;

    feedRatios.current.clear();
    const observer = new IntersectionObserver((entries) => {
      for (const entry of entries) {
        const id = (entry.target as HTMLElement).dataset.videoId;
        if (id) feedRatios.current.set(id, entry.isIntersecting ? entry.intersectionRatio : 0);
      }

      // YouTube's minimum-functionality rules require autoplay only after more
      // than half the player is visible. Switching at 51% also makes the feed
      // deterministic rather than depending on which observer entry fired last.
      const bestId = mostVisibleVideoId(feedVideos.map((video) => video.id), feedRatios.current, 0.51);
      if (bestId) setActiveFeedId(bestId);
    }, {
      root,
      threshold: [0, 0.25, 0.51, 0.75, 1],
    });

    for (const node of feedNodes.current.values()) observer.observe(node);
    return () => observer.disconnect();
  }, [view, feedVideos]);

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
    setView('browse');
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
          ? 'Autoplay critical-care video, Shorts and hands-on Skills in one scrollable feed, now combining educators with official manufacturer training.'
          : 'Browse indexed teaching from YouTube and manufacturer-hosted training sources, then narrow by device, procedure, topic and learning goal.'}</p>
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
          {manufacturerSources.map((name) => <button key={name} className={channel === name ? 'on' : ''} onClick={() => setChannel(channel === name ? null : name)}>{name}</button>)}
          <i aria-hidden="true" />
          <button className={feedKind === 'all' ? 'on' : ''} onClick={() => setFeedKind('all')}>For you <small>{feedCounts.all}</small></button>
          <button className={feedKind === 'shorts' ? 'on' : ''} onClick={() => setFeedKind('shorts')}>Shorts <small>{feedCounts.shorts}</small></button>
          <button className={feedKind === 'skills' ? 'on' : ''} onClick={() => setFeedKind('skills')}>Skills <small>{feedCounts.skills}</small></button>
          <button className={feedKind === 'deep' ? 'on' : ''} onClick={() => setFeedKind('deep')}>Deep dives <small>{feedCounts.deep}</small></button>
        </div>
        {feedKind === 'skills' && <div className="video-feed-filter-scroll video-skill-filter-scroll" aria-label="Clinical skill">
          {VIDEO_SKILL_COLLECTIONS.map((item) => {
            const count = skillCounts.get(item.id) ?? 0;
            return <button key={item.id} className={skillCollection === item.id ? 'on' : ''} disabled={count === 0} onClick={() => setSkillCollection(item.id)}>{item.label} <small>{count}</small></button>;
          })}
        </div>}
      </section>
      {feedVideos.length ? <section className="video-feed" aria-label={feedKind === 'skills' ? 'Autoplay clinical skills video feed' : 'Autoplay critical-care video feed'}>
        {feedVideos.map((video, index) => <FeedCard
          key={video.id}
          video={video}
          active={activeFeedId === video.id}
          hydrate={inFeedPreloadWindow(index, activeFeedIndex, 1)}
          muted={feedMuted}
          setMuted={setFeedMuted}
          register={registerFeedNode}
          openVideo={openVideo}
        />)}
      </section> : <div className="video-empty video-feed-empty">
        <b>No indexed videos match this feed filter yet.</b>
        <p>Switch sources or feed sections, or use Browse to explore the complete priority-channel upload collections.</p>
        <button onClick={clear}>Reset feed</button>
      </div>}
      <div className="video-feed-note">The current video starts muted automatically. The previous and next videos stay preloaded, so scrolling hands playback off immediately instead of waiting for a new YouTube player to load.</div>
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
          <div><span className="eyebrow">Indexed library</span><h3>{browseVideos.length} video{browseVideos.length === 1 ? '' : 's'}</h3></div>
          {(query || category || subcategory || format || level || intent || channel) && <button className="linkish" onClick={clear}>Clear filters</button>}
        </div>
        {browseVideos.length ? <div className="video-grid">{browseVideos.map((video) => {
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
