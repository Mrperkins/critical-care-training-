/**
 * Priority-channel YouTube discovery for Critical Care Videos.
 *
 * Uses the official YouTube Data API. It crawls the uploads playlists for
 * CriticalCareNow, Lecturio Medical and Lecturio Nursing, classifies likely
 * critical-care material, and writes a REVIEW QUEUE only.
 *
 * Usage:
 *   YOUTUBE_API_KEY=... npm run video:discover
 *
 * Optional:
 *   CHANNEL_VIDEO_LIMIT=500 YOUTUBE_API_KEY=... npm run video:discover
 */
import fs from 'node:fs';
import path from 'node:path';

type Intent = 'learn' | 'setup' | 'perform' | 'manage' | 'troubleshoot' | 'case-review';

type PriorityChannel = {
  id: string;
  label: string;
  channelId: string;
  uploadsPlaylistId: string;
};

type Rule = {
  id: string;
  terms: string[];
  category: string;
  subcategory: string;
  intents: Intent[];
  tags: string[];
  weight?: number;
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
  matchedRules: string[];
  relevanceScore: number;
  shortCandidate: boolean;
  shortSignals: string[];
  needsShortVerification: boolean;
  embeddable: boolean;
  url: string;
  thumbnail?: string;
  pairedLongFormYoutubeId?: string;
  reviewStatus: 'review';
};

const KEY = process.env.YOUTUBE_API_KEY;
if (!KEY) throw new Error('YOUTUBE_API_KEY is required. Keep it server-side; never ship it in the browser bundle.');
const LIMIT = Math.max(25, Math.min(2000, Number(process.env.CHANNEL_VIDEO_LIMIT || 500)));

const CHANNELS: PriorityChannel[] = [
  { id: 'criticalcarenow', label: 'CriticalCareNow', channelId: 'UCDDtgNzqvUC8235U8iq4SUA', uploadsPlaylistId: 'UUDDtgNzqvUC8235U8iq4SUA' },
  { id: 'lecturio-medical', label: 'Lecturio Medical', channelId: 'UCbYmF43dpGHz8gi2ugiXr0Q', uploadsPlaylistId: 'UUbYmF43dpGHz8gi2ugiXr0Q' },
  { id: 'lecturio-nursing', label: 'Lecturio Nursing', channelId: 'UCLpMl5BTrOwTDwAJ69Q4-sg', uploadsPlaylistId: 'UULpMl5BTrOwTDwAJ69Q4-sg' },
];

const RULES: Rule[] = [
  { id:'chest-drain', terms:['chest tube','chest drain','water seal','pleural drain','pneumothorax','hemothorax'], category:'devices', subcategory:'chest-drainage', intents:['learn','setup','manage','troubleshoot'], tags:['chest tube','chest drain','pleural drainage'], weight:4 },
  { id:'ventilator', terms:['mechanical ventilation','ventilator','ventilation','peep','aprv','pressure control','volume control','auto-peep','vent waveform','ventilator waveform','dyssynchrony','revel ventilator','ltv 1200','hamilton ventilator','servo ventilator'], category:'airway-vent', subcategory:'modes', intents:['learn','setup','manage','troubleshoot'], tags:['ventilator','mechanical ventilation'], weight:4 },
  { id:'ards', terms:['ards','acute respiratory distress'], category:'airway-vent', subcategory:'ards', intents:['learn','manage','case-review'], tags:['ARDS','oxygenation','lung protective ventilation'], weight:5 },
  { id:'obstructive-vent', terms:['asthma','copd','air trapping','dynamic hyperinflation','status asthmaticus'], category:'airway-vent', subcategory:'asthma-copd', intents:['learn','manage','troubleshoot'], tags:['asthma','COPD','auto-PEEP'], weight:3 },
  { id:'airway', terms:['intubation','airway','laryngoscopy','bougie','cricothyrotomy','cricothyroidotomy','rapid sequence intubation','rsi','dsi'], category:'procedures', subcategory:'airway', intents:['learn','perform','troubleshoot'], tags:['airway','intubation','RSI'], weight:4 },
  { id:'vascular', terms:['central line','central venous','arterial line','a-line','vascular access','intraosseous','io access','iv insertion','start an iv','iv catheter','intravenous catheter'], category:'procedures', subcategory:'vascular-access', intents:['learn','setup','perform','manage'], tags:['vascular access','central line','arterial line','IV catheter'], weight:4 },
  { id:'iv-tubing', terms:['iv tubing','primary line','secondary line','iv piggyback','ivpb','infusion pump','sapphire pump','infusomat','perfusor','braun space'], category:'devices', subcategory:'infusion-pumps', intents:['learn','setup','manage','troubleshoot'], tags:['IV tubing','IV piggyback','infusion pump'], weight:5 },
  { id:'hfnc-device', terms:['high flow nasal cannula','high-flow nasal cannula','hfnc','airvo','optiflow'], category:'devices', subcategory:'high-flow', intents:['learn','setup','manage','troubleshoot'], tags:['HFNC','AIRVO','Optiflow','high flow'], weight:5 },
  { id:'tracheostomy', terms:['tracheostomy care','trach care','tracheostomy suction','trach suction'], category:'procedures', subcategory:'tracheostomy', intents:['learn','setup','perform','manage','troubleshoot'], tags:['tracheostomy','trach care','airway'], weight:6 },
  { id:'enteral-access', terms:['nasogastric tube','ng tube','salem sump','gastric decompression','feeding tube'], category:'procedures', subcategory:'enteral-access', intents:['learn','setup','perform','manage','troubleshoot'], tags:['NG tube','nasogastric tube','enteral access'], weight:6 },
  { id:'venipuncture', terms:['venipuncture','blood draw','draw labs','order of draw'], category:'procedures', subcategory:'venipuncture', intents:['learn','setup','perform'], tags:['venipuncture','blood draw','labs'], weight:5 },
  { id:'med-admin-skill', terms:['medication administration','rights of medication administration','seven rights','7 rights','iv push medication'], category:'procedures', subcategory:'medication-admin', intents:['learn','setup','perform'], tags:['medication administration','medication safety'], weight:4 },
  { id:'transducer', terms:['transducer','leveling','zeroing','square wave test','overdamped','underdamped'], category:'procedures', subcategory:'transducers', intents:['setup','manage','troubleshoot'], tags:['transducer','leveling','zeroing'], weight:4 },
  { id:'shock', terms:['shock','septic shock','hemorrhagic shock','obstructive shock','distributive shock','hypovolemic shock'], category:'hemodynamics', subcategory:'shock', intents:['learn','manage','case-review'], tags:['shock','perfusion'], weight:4 },
  { id:'vasoactives', terms:['norepinephrine','epinephrine','vasopressin','phenylephrine','dobutamine','milrinone','vasopressor','inotrope','pressor'], category:'hemodynamics', subcategory:'vasoactives', intents:['learn','manage'], tags:['vasoactive','vasopressor','inotrope'], weight:3 },
  { id:'push-dose', terms:['push dose','push-dose','bolus pressor'], category:'procedures', subcategory:'pressors', intents:['setup','perform'], tags:['push-dose pressor'], weight:6 },
  { id:'pac', terms:['pulmonary artery catheter','swan ganz','swan-ganz','cardiac output','wedge pressure','pcwp'], category:'hemodynamics', subcategory:'pac', intents:['learn','setup','manage','troubleshoot'], tags:['PA catheter','PCWP','cardiac output'], weight:5 },
  { id:'iabp', terms:['iabp','intra-aortic balloon','balloon pump'], category:'devices', subcategory:'iabp', intents:['learn','setup','manage','troubleshoot'], tags:['IABP','mechanical support'], weight:6 },
  { id:'ecmo', terms:['ecmo','extracorporeal membrane oxygenation','vv ecmo','va ecmo'], category:'devices', subcategory:'ecmo', intents:['learn','manage','troubleshoot'], tags:['ECMO','mechanical support'], weight:6 },
  { id:'crrt', terms:['crrt','continuous renal replacement','cvvh','cvvhd','cvvhdf'], category:'devices', subcategory:'monitors', intents:['learn','setup','manage','troubleshoot'], tags:['CRRT','renal replacement'], weight:5 },
  { id:'stroke', terms:['stroke','large vessel occlusion','lvo','ischemic stroke','thrombectomy'], category:'neuro', subcategory:'lvo', intents:['learn','manage','case-review'], tags:['stroke','LVO'], weight:4 },
  { id:'hemorrhage-neuro', terms:['intracerebral hemorrhage','intracranial hemorrhage','subarachnoid hemorrhage','ich','sah'], category:'neuro', subcategory:'ich-sah', intents:['learn','manage','case-review'], tags:['ICH','SAH'], weight:5 },
  { id:'icp', terms:['intracranial pressure','icp','herniation','cerebral perfusion pressure','cpp'], category:'neuro', subcategory:'icp', intents:['learn','manage','troubleshoot'], tags:['ICP','CPP','herniation'], weight:5 },
  { id:'evd', terms:['external ventricular drain','evd','ventriculostomy'], category:'neuro', subcategory:'evd', intents:['learn','setup','manage','troubleshoot'], tags:['EVD','ICP','CSF'], weight:6 },
  { id:'seizure', terms:['status epilepticus','seizure'], category:'neuro', subcategory:'seizure', intents:['learn','manage','case-review'], tags:['seizure','status epilepticus'], weight:3 },
  { id:'stemi', terms:['stemi','myocardial infarction','acute coronary syndrome','acs'], category:'cardiac', subcategory:'stemi', intents:['learn','manage','case-review'], tags:['STEMI','ACS'], weight:4 },
  { id:'arrhythmia', terms:['ventricular tachycardia','ventricular fibrillation','atrial fibrillation','arrhythmia','bradycardia','tachycardia'], category:'cardiac', subcategory:'arrhythmia', intents:['learn','manage','case-review'], tags:['arrhythmia','ECG'], weight:3 },
  { id:'cardiogenic', terms:['cardiogenic shock','acute heart failure','right ventricular failure','rv failure'], category:'cardiac', subcategory:'cardiogenic-shock', intents:['learn','manage','case-review'], tags:['cardiogenic shock','heart failure'], weight:5 },
  { id:'aorta', terms:['aortic dissection','aortic aneurysm','aaa','thoracic aortic'], category:'cardiac', subcategory:'aorta', intents:['learn','manage','case-review'], tags:['aortic dissection','AAA'], weight:5 },
  { id:'hemorrhage', terms:['massive transfusion','whole blood','hemorrhage','hemorrhagic','blood transfusion','transfusion'], category:'trauma', subcategory:'massive-transfusion', intents:['learn','setup','manage','case-review'], tags:['hemorrhage','transfusion','whole blood'], weight:4 },
  { id:'tbi', terms:['traumatic brain injury','tbi'], category:'trauma', subcategory:'tbi', intents:['learn','manage','case-review'], tags:['TBI','neurotrauma'], weight:5 },
  { id:'abg', terms:['arterial blood gas','abg','acid base','acid-base','metabolic acidosis','respiratory acidosis','metabolic alkalosis','respiratory alkalosis'], category:'labs-pocus', subcategory:'abg', intents:['learn','case-review'], tags:['ABG','acid-base'], weight:4 },
  { id:'dka', terms:['diabetic ketoacidosis','dka','hyperkalemia','potassium'], category:'labs-pocus', subcategory:'electrolytes', intents:['learn','manage','case-review'], tags:['DKA','electrolytes'], weight:4 },
  { id:'pocus', terms:['pocus','point of care ultrasound','point-of-care ultrasound','lung ultrasound','fast exam','e-fast','efast','ivc ultrasound'], category:'labs-pocus', subcategory:'lung-us', intents:['learn','perform','case-review'], tags:['POCUS','ultrasound'], weight:5 },
  { id:'peds-critical', terms:['pediatric shock','pediatric airway','pediatric critical','pediatric resuscitation'], category:'peds-neonatal', subcategory:'peds-shock', intents:['learn','manage','case-review'], tags:['pediatric','critical care'], weight:4 },
  { id:'neonatal', terms:['neonatal ventilation','newborn resuscitation','neonatal resuscitation','neonatal critical'], category:'peds-neonatal', subcategory:'neonatal-vent', intents:['learn','setup','manage'], tags:['neonatal','ventilation'], weight:5 },
];

const STOP = new Set(['the','and','for','with','from','into','your','this','that','how','what','why','critical','care','video','tutorial','review','part']);

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

async function uploads(channel: PriorityChannel) {
  const ids: string[] = [];
  let pageToken = '';
  while (ids.length < LIMIT) {
    const page = await youtube('playlistItems', {
      part: 'contentDetails',
      playlistId: channel.uploadsPlaylistId,
      maxResults: '50',
      ...(pageToken ? { pageToken } : {}),
    });
    for (const item of page.items ?? []) {
      const id = item.contentDetails?.videoId;
      if (id) ids.push(String(id));
      if (ids.length >= LIMIT) break;
    }
    pageToken = String(page.nextPageToken || '');
    if (!pageToken) break;
  }
  return ids;
}

async function details(ids: string[]) {
  const out: any[] = [];
  for (let i = 0; i < ids.length; i += 50) {
    const page = await youtube('videos', {
      part: 'snippet,contentDetails,status',
      id: ids.slice(i, i + 50).join(','),
      maxResults: '50',
    });
    out.push(...(page.items ?? []));
  }
  return out;
}

function classify(title: string, description: string) {
  const text = `${title}\n${description}`.toLowerCase();
  const matched = RULES.map((rule) => {
    const hits = rule.terms.filter((term) => text.includes(term.toLowerCase()));
    return { rule, hits, score: hits.length * (rule.weight ?? 1) };
  }).filter((x) => x.score > 0).sort((a,b) => b.score - a.score);

  const primary = matched[0];
  if (!primary) return null;

  const intents = Array.from(new Set(matched.slice(0,4).flatMap((x) => x.rule.intents)));
  const tags = Array.from(new Set(matched.slice(0,5).flatMap((x) => x.rule.tags)));
  return {
    category: primary.rule.category,
    subcategory: primary.rule.subcategory,
    intents,
    tags,
    matchedRules: matched.map((x) => x.rule.id),
    relevanceScore: matched.reduce((n,x) => n + x.score, 0),
  };
}

const allCandidates: Candidate[] = [];
const stats: Record<string, { scanned: number; matched: number; embeddable: number }> = {};

for (const channel of CHANNELS) {
  const ids = await uploads(channel);
  const rows = await details(ids);
  let matchedCount = 0, embeddableCount = 0;

  for (const item of rows) {
    if (item.status?.privacyStatus !== 'public') continue;
    const embeddable = item.status?.embeddable === true;
    if (embeddable) embeddableCount += 1;

    const title = String(item.snippet?.title ?? '');
    const description = String(item.snippet?.description ?? '');
    const classification = classify(title, description);
    if (!classification) continue;
    matchedCount += 1;

    const seconds = durationSeconds(item.contentDetails?.duration ?? '');
    const shortsHash = /(^|\s)#shorts?\b/i.test(`${title} ${description}`);
    const durationSignal = seconds > 0 && seconds <= 180;
    const shortSignals = [shortsHash ? '#shorts metadata' : '', durationSignal ? 'duration <= 180 seconds' : ''].filter(Boolean);
    const shortCandidate = shortsHash || durationSignal;

    allCandidates.push({
      youtubeId: String(item.id),
      title,
      channel: channel.label,
      channelId: channel.channelId,
      description,
      published: String(item.snippet?.publishedAt ?? ''),
      durationSeconds: seconds,
      ...classification,
      shortCandidate,
      shortSignals,
      needsShortVerification: shortCandidate,
      embeddable,
      url: `https://www.youtube.com/watch?v=${item.id}`,
      thumbnail: item.snippet?.thumbnails?.high?.url ?? item.snippet?.thumbnails?.medium?.url,
      reviewStatus: 'review',
    });
  }

  stats[channel.id] = { scanned: rows.length, matched: matchedCount, embeddable: embeddableCount };
  console.log(`${channel.label}: scanned ${rows.length}; matched ${matchedCount}; embeddable ${embeddableCount}`);
}

const embeddableCandidates = allCandidates.filter((x) => x.embeddable);
const longForm = embeddableCandidates.filter((item) => !item.shortCandidate && item.durationSeconds >= 240);

for (const item of embeddableCandidates.filter((candidate) => candidate.shortCandidate)) {
  const ranked = longForm
    .filter((candidate) => candidate.channelId === item.channelId || candidate.category === item.category || candidate.subcategory === item.subcategory)
    .map((candidate) => {
      let score = overlap(item.title, candidate.title) * 6 + overlap(item.description, candidate.description);
      if (candidate.channelId === item.channelId) score += 25;
      if (candidate.subcategory === item.subcategory) score += 15;
      if (candidate.category === item.category) score += 8;
      return { candidate, score };
    })
    .filter((x) => x.score >= 12)
    .sort((a,b) => b.score - a.score);
  if (ranked[0]) item.pairedLongFormYoutubeId = ranked[0].candidate.youtubeId;
}

embeddableCandidates.sort((a,b) =>
  b.relevanceScore - a.relevanceScore ||
  Number(b.shortCandidate) - Number(a.shortCandidate) ||
  b.published.localeCompare(a.published)
);

const out = path.resolve('review/youtube-video-candidates.json');
fs.mkdirSync(path.dirname(out), { recursive: true });
fs.writeFileSync(out, JSON.stringify({
  generatedAt: new Date().toISOString(),
  channelVideoLimit: LIMIT,
  channels: CHANNELS,
  stats,
  policy: {
    autoPublish: false,
    note: 'Priority-channel discovery only. Review clinical accuracy/currentness, device/IFU alignment, tags, Short classification and proposed pairings before listing individual videos.',
  },
  candidates: embeddableCandidates,
}, null, 2));

console.log(`Wrote ${embeddableCandidates.length} embeddable critical-care candidates to ${out}`);
console.log(`${embeddableCandidates.filter((x) => x.shortCandidate).length} are Short candidates and require Short verification.`);
