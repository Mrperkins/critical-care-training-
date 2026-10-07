import { useMemo, useState } from 'react';
import { VIDEO_CATEGORIES, VIDEO_LIBRARY, filterVideoLibrary, pairedLongForm, youtubeThumbnailUrl, youtubeWatchUrl } from './catalog';
import type { VideoFormat, VideoIntent, VideoLevel } from './types';

type Sort = 'featured' | 'newest' | 'shortest' | 'az';

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

export function VideoLibrary() {
  const [query, setQuery] = useState('');
  const [category, setCategory] = useState<string | null>(null);
  const [subcategory, setSubcategory] = useState<string | null>(null);
  const [format, setFormat] = useState<VideoFormat | null>(null);
  const [level, setLevel] = useState<VideoLevel | null>(null);
  const [intent, setIntent] = useState<VideoIntent | null>(null);
  const [sort, setSort] = useState<Sort>('featured');

  const categoryDef = VIDEO_CATEGORIES.find((item) => item.id === category);
  const videos = useMemo(() => {
    const filtered = filterVideoLibrary({ query, category, subcategory, format, level, intent });
    return [...filtered].sort((a, b) => {
      if (sort === 'newest') return (b.published ?? '').localeCompare(a.published ?? '');
      if (sort === 'shortest') return (a.durationSeconds ?? Number.MAX_SAFE_INTEGER) - (b.durationSeconds ?? Number.MAX_SAFE_INTEGER);
      if (sort === 'az') return a.title.localeCompare(b.title);
      return Number(!!b.featured) - Number(!!a.featured) || a.title.localeCompare(b.title);
    });
  }, [query, category, subcategory, format, level, intent, sort]);

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
  };

  return <main className="video-library">
    <section className="video-hero">
      <div>
        <span className="eyebrow">Shorts → deep dives → application</span>
        <h2>Critical Care Videos</h2>
        <p>Browse clinically useful external videos by topic, device and learning goal. Shorts can link directly to a paired long-form lesson when one has been reviewed and listed.</p>
      </div>
      <div className="video-hero-stat">
        <b>{VIDEO_LIBRARY.filter((video) => video.reviewStatus === 'listed').length}</b>
        <span>curated starter videos</span>
        <small>The catalog is intentionally curated before automated YouTube ingestion is turned on.</small>
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
      <div className="video-section-head"><div><span className="eyebrow">Browse by category</span><h3>What are you working on?</h3></div>{category && <button className="linkish" onClick={() => selectCategory(null)}>View all categories</button>}</div>
      <div className="video-category-grid">
        {VIDEO_CATEGORIES.map((item) => {
          const count = VIDEO_LIBRARY.filter((video) => video.reviewStatus === 'listed' && video.category === item.id).length;
          return <button key={item.id} className={category === item.id ? 'on' : ''} onClick={() => selectCategory(category === item.id ? null : item.id)}>
            <b>{item.label}</b><span>{item.description}</span><small>{count ? `${count} listed` : 'Catalog ready'}</small>
          </button>;
        })}
      </div>
    </section>

    <section className="video-filters" aria-label="Video filters">
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
        <div><span className="eyebrow">Curated library</span><h3>{videos.length} video{videos.length === 1 ? '' : 's'}</h3></div>
        {(query || category || subcategory || format || level || intent) && <button className="linkish" onClick={clear}>Clear filters</button>}
      </div>
      {videos.length ? <div className="video-grid">{videos.map((video) => {
        const pair = pairedLongForm(video);
        return <article key={video.id} className="video-card">
          <a className="video-thumb" href={youtubeWatchUrl(video)} target="_blank" rel="noreferrer" aria-label={`Watch ${video.title} on YouTube`}>
            <img src={youtubeThumbnailUrl(video)} alt="" loading="lazy" />
            <span className="video-play" aria-hidden="true">▶</span>
            <em>{video.format === 'short' ? 'SHORT' : 'VIDEO'}{fmtDuration(video.durationSeconds) ? ` · ${fmtDuration(video.durationSeconds)}` : ''}</em>
          </a>
          <div className="video-card-body">
            <div className="video-meta"><span>{video.level}</span><span>{video.channel}</span></div>
            <h4>{video.title}</h4>
            <p>{video.summary}</p>
            <div className="video-tags">{video.intents.slice(0, 3).map((tag) => <span key={tag}>{INTENTS.find((item) => item.id === tag)?.label ?? tag}</span>)}</div>
            <div className="video-actions">
              <a href={youtubeWatchUrl(video)} target="_blank" rel="noreferrer">Watch on YouTube ↗</a>
              {pair && <a className="deep-link" href={youtubeWatchUrl(pair)} target="_blank" rel="noreferrer">Full lesson: {pair.title} →</a>}
            </div>
          </div>
        </article>;
      })}</div> : <div className="video-empty">
        <b>No curated videos match these filters yet.</b>
        <p>Keep the filter if this is the category you want — the ingestion pipeline can fill the shelf as new videos are reviewed.</p>
        <button onClick={clear}>Clear filters</button>
      </div>}
    </section>

    <section className="video-boundary">
      <b>Curated learning resources, not protocol.</b>
      <span>External videos remain the creator's content and open on YouTube. Device setup and procedures should be checked against current manufacturer instructions, local policy and medical direction.</span>
    </section>
  </main>;
}
