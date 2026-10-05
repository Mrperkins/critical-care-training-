import fs from 'node:fs';
import path from 'node:path';
import { MENTAL_REPS } from '../src/audio/catalog';
import {
  mentalRepVoiceStates,
  type DurableVoiceManifest,
  type MentalRepVoiceState,
} from './audio-voice-state';

const manifestPath = path.resolve('public/audio/voice/manifest.json');
const manifest = fs.existsSync(manifestPath)
  ? JSON.parse(fs.readFileSync(manifestPath, 'utf8')) as DurableVoiceManifest
  : { assets: [] };

const states = mentalRepVoiceStates(MENTAL_REPS, manifest);
const items = states.filter((item) => item.status !== 'current');
const byRep = Object.fromEntries(MENTAL_REPS.map((rep) => {
  const repItems = items.filter((item) => item.repId === rep.id);
  return [rep.id, {
    title: rep.title,
    missing: repItems.filter((item) => item.status === 'missing').length,
    stale: repItems.filter((item) => item.status === 'stale').length,
    needsRender: repItems.length,
  }];
}).filter(([, value]) => (value as { needsRender: number }).needsRender > 0));

const compactItem = (item: MentalRepVoiceState) => ({
  id: item.id,
  repId: item.repId,
  beatId: item.beatId,
  repTitle: item.repTitle,
  beatTitle: item.beatTitle,
  phase: item.phase,
  status: item.status,
  text: item.text,
  transcriptHash: item.transcriptHash,
  suggestedFile: item.suggestedFile,
  words: item.words,
  characters: item.characters,
  ...(item.currentAsset ? {
    staleAsset: {
      file: item.currentAsset.file,
      transcriptHash: item.currentAsset.transcriptHash ?? null,
      reviewed: item.currentAsset.reviewed ?? false,
      published: item.currentAsset.published ?? false,
      provider: item.currentAsset.provider ?? null,
      durationSeconds: item.currentAsset.durationSeconds ?? null,
    },
  } : {}),
});

const report = {
  generatedAt: new Date().toISOString(),
  counts: {
    mentalRepBeats: states.length,
    durableManifestAssets: manifest.assets?.length ?? 0,
    current: states.filter((item) => item.status === 'current').length,
    missing: states.filter((item) => item.status === 'missing').length,
    stale: states.filter((item) => item.status === 'stale').length,
    needsRender: items.length,
    renderWords: items.reduce((sum, item) => sum + item.words, 0),
    renderCharacters: items.reduce((sum, item) => sum + item.characters, 0),
  },
  byRep,
  items: items.map(compactItem),
};

const out = path.resolve('../review');
fs.mkdirSync(out, { recursive: true });
const outputPath = path.join(out, 'mental-rep-voice-refresh.json');
fs.writeFileSync(outputPath, JSON.stringify(report, null, 2) + '\n');
console.log(
  `${report.counts.needsRender} Mental Rep voice clips need render: ` +
  `${report.counts.missing} missing + ${report.counts.stale} stale · ` +
  `${report.counts.renderCharacters} characters`
);
