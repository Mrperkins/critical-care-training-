/**
 * YouTube discovery for the Critical Care Videos library.
 *
 * Uses the official YouTube Data API and writes a REVIEW QUEUE only.
 * Nothing discovered here is automatically exposed to learners.
 *
 * Usage:
 *   YOUTUBE_API_KEY=... npm run video:discover
 */
import fs from 'node:fs';
import path from 'node:path';

type Intent = 'learn' | 'setup' | 'perform' | 'manage' | 'troubleshoot' | 'case-review';

type DiscoveryQuery = {
  id: string;
  q: string;
  category: string;
  subcategory: string;
  intents: Intent[];
  tags: string[];
};

type Candidate = {
  youtubeId: string;
  title: string;
  channel: string;
  channelId: string;
  description: string;
  published: string;
  durationSeconds: number;
  category: string;
  subcategory: string;
  intents: Intent[];
  tags: string[];
  shortCandidate: boolean;
  shortSignals: string[];
  needsShortVerification: boolean;
  embeddable: boolean;
  url: string;
  thumbnail?: string;
  pairedLongFormYoutubeId?: string;
  discoveryQueryIds: string[];
  reviewStatus: 'review';
};

const KEY = process.env.YOUTUBE_API_KEY;
if (!KEY) throw new Error('YOUTUBE_API_KEY is required. Keep it server-side; never ship it in the browser bundle.');

const QUERIES: DiscoveryQuery[] = [
  { id: 'chest-drain', q: 'critical care chest tube drainage system setup Atrium Oasis', category: 'devices', subcategory: 'chest-drainage', intents: ['setup','manage','troubleshoot'], tags: ['chest tube','chest drain','water seal','suction'] },
  { id: 'vent-setup', q: 'critical care ventilator setup transport ventilator tutorial', category: 'devices', subcategory: 'ventilators', intents: ['setup','troubleshoot'], tags: ['ventilator','transport','setup'] },
  { id: 'vent-phys', q: 'ICU mechanical ventilation PEEP waveform auto PEEP critical care', category: 'airway-vent', subcategory: 'waveforms', intents: ['learn','troubleshoot'], tags: ['PEEP','waveform','auto-PEEP','ventilator'] },
  { id: 'evd', q: 'external ventricular drain EVD ICP setup leveling critical care', category: 'devices', subcategory: 'evd', intents: ['setup','manage','troubleshoot'], tags: ['EVD','ICP','CSF','leveling'] },
  { id: 'iabp', q: 'IABP setup timing troubleshooting critical care', category: 'devices', subcategory: 'iabp', intents: ['setup','manage','troubleshoot'], tags: ['IABP','balloon pump','timing'] },
  { id: 'push-dose', q: 'push dose pressor epinephrine norepinephrine EMS critical care', category: 'procedures', subcategory: 'pressors', intents: ['setup','perform'], tags: ['push-dose pressor','epinephrine','norepinephrine'] },
  { id: 'art-line', q: 'arterial line transducer setup leveling zeroing critical care', category: 'procedures', subcategory: 'transducers', intents: ['setup','manage','troubleshoot'], tags: ['arterial line','transducer','leveling','zeroing'] },
  { id: 'central-line', q: 'ultrasound central line setup critical care procedure', category: 'procedures', subcategory: 'vascular-access', intents: ['perform','setup'], tags: ['central line','ultrasound','vascular access'] },
  { id: 'peds-neonatal', q: 'pediatric neonatal ventilation critical care transport equipment', category: 'peds-neonatal', subcategory: 'neonatal-vent', intents: ['learn','setup','manage'], tags: ['pediatric','neonatal','ventilation','transport'] },
  { id: 'pocus', q: 'critical care POCUS FAST lung ultrasound tutorial', category: 'labs-pocus', subcategory: 'lung-us', intents: ['learn','perform'], tags: ['POCUS','FAST','lung ultrasound'] },
];

const STOP = new Set(['the','and','for','with','from','into','your','this','that','how','what','why','critical','care','video','tutorial','setup']);

function words(s: string) {
  return new Set(s.toLowerCase().replace(/[^a-z0-9]+/g, ' ').split(/\s+/).filter((w) => w.length > 2 && !STOP.has(w)));
}

function overlap(a: string, b: string) {
  const aa = words(a), bb = words(b);
  let n = 0;
  for (const w of aa) if (bb.has(w)) n += 1;
  return n;
}

function durationSeconds(iso: string) {
  const m = iso.match(/^PT(?:(\d+)H)?(?:(\d+)M)?(?:(\d+)S)?$/);
  if (!m) return 0;
  return Number(m[1] || 0) * 3600 + Number(m[2] || 0) * 60 + Number(m[3] || 0);
}

async function youtube(endpoint: string, params: Record<string,string>) {
  const u = new URL(`https://www.googleapis.com/youtube/v3/${endpoint}`);
  for (const [k,v] of Object.entries(params)) u.searchParams.set(k, v);
  u.searchParams.set('key', KEY!);
  const res = await fetch(u);
  if (!res.ok) throw new Error(`YouTube API ${res.status}: ${await res.text()}`);
  return res.json() as Promise<any>;
}

const discovered = new Map<string, Candidate>();

for (const query of QUERIES) {
  const search = await youtube('search', {
    part: 'snippet',
    q: query.q,
    type: 'video',
    maxResults: '25',
    order: 'relevance',
    safeSearch: 'none',
    videoEmbeddable: 'true',
  });

  const ids = (search.items ?? []).map((item: any) => item.id?.videoId).filter(Boolean);
  if (!ids.length) continue;

  const detail = await youtube('videos', {
    part: 'snippet,contentDetails,status',
    id: ids.join(','),
    maxResults: '50',
  });

  for (const item of detail.items ?? []) {
    if (!item.status?.embeddable || item.status?.privacyStatus !== 'public') continue;
    const seconds = durationSeconds(item.contentDetails?.duration ?? '');
    const title = String(item.snippet?.title ?? '');
    const description = String(item.snippet?.description ?? '');
    const shortsHash = /(^|\s)#shorts?\b/i.test(`${title} ${description}`);
    const durationSignal = seconds > 0 && seconds <= 180;
    const shortSignals = [shortsHash ? '#shorts metadata' : '', durationSignal ? 'duration <= 180 seconds' : ''].filter(Boolean);
    // Duration alone does not prove YouTube classifies a video as a Short because the Data API
    // does not expose an isShort flag or aspect ratio. Human/API follow-up verification remains required.
    const shortCandidate = shortsHash || durationSignal;

    const prior = discovered.get(item.id);
    const base: Candidate = prior ?? {
      youtubeId: item.id,
      title,
      channel: String(item.snippet?.channelTitle ?? ''),
      channelId: String(item.snippet?.channelId ?? ''),
      description,
      published: String(item.snippet?.publishedAt ?? ''),
      durationSeconds: seconds,
      category: query.category,
      subcategory: query.subcategory,
      intents: [...query.intents],
      tags: [...query.tags],
      shortCandidate,
      shortSignals,
      needsShortVerification: shortCandidate,
      embeddable: true,
      url: `https://www.youtube.com/watch?v=${item.id}`,
      thumbnail: item.snippet?.thumbnails?.high?.url ?? item.snippet?.thumbnails?.medium?.url,
      discoveryQueryIds: [query.id],
      reviewStatus: 'review',
    };

    if (prior) {
      base.discoveryQueryIds = Array.from(new Set([...prior.discoveryQueryIds, query.id]));
      base.intents = Array.from(new Set([...prior.intents, ...query.intents]));
      base.tags = Array.from(new Set([...prior.tags, ...query.tags]));
    }
    discovered.set(item.id, base);
  }
}

const all = Array.from(discovered.values());
const longForm = all.filter((item) => !item.shortCandidate && item.durationSeconds >= 240);

for (const item of all.filter((candidate) => candidate.shortCandidate)) {
  const ranked = longForm
    .filter((candidate) => candidate.category === item.category || candidate.subcategory === item.subcategory)
    .map((candidate) => {
      let score = overlap(item.title, candidate.title) * 5 + overlap(item.description, candidate.description);
      if (candidate.channelId && candidate.channelId === item.channelId) score += 25;
      if (candidate.subcategory === item.subcategory) score += 12;
      return { candidate, score };
    })
    .filter((x) => x.score >= 10)
    .sort((a,b) => b.score - a.score);
  if (ranked[0]) item.pairedLongFormYoutubeId = ranked[0].candidate.youtubeId;
}

all.sort((a,b) => {
  if (a.shortCandidate !== b.shortCandidate) return Number(b.shortCandidate) - Number(a.shortCandidate);
  return b.published.localeCompare(a.published);
});

const out = path.resolve('review/youtube-video-candidates.json');
fs.mkdirSync(path.dirname(out), { recursive: true });
fs.writeFileSync(out, JSON.stringify({
  generatedAt: new Date().toISOString(),
  policy: {
    autoPublish: false,
    note: 'Discovery output only. Review clinical accuracy, source quality, currentness, device/IFU alignment, copyright/embed status, category tags and Short classification before adding to the learner catalog.',
  },
  queries: QUERIES,
  candidates: all,
}, null, 2));

console.log(`Wrote ${all.length} candidates to ${out}`);
console.log(`${all.filter((x) => x.shortCandidate).length} are Short candidates and require Short verification.`);
