import crypto from 'node:crypto';
import type { MentalRep } from '../src/audio/types';

export interface DurableVoiceManifestAsset {
  id: string;
  file: string;
  transcriptHash?: string;
  reviewed?: boolean;
  published?: boolean;
  voice?: string;
  provider?: string;
  sha256?: string;
  durationSeconds?: number;
  sourceUrl?: string;
  note?: string;
}

export interface DurableVoiceManifest {
  assets?: DurableVoiceManifestAsset[];
}

export type MentalRepVoiceStatus = 'current' | 'missing' | 'stale';

export interface MentalRepVoiceState {
  id: string;
  repId: string;
  beatId: string;
  repTitle: string;
  beatTitle: string;
  phase: string;
  text: string;
  transcriptHash: string;
  suggestedFile: string;
  words: number;
  characters: number;
  status: MentalRepVoiceStatus;
  currentAsset?: DurableVoiceManifestAsset;
}

export const normalizeVoiceTranscript = (text: string) => text.replace(/\s+/g, ' ').trim();

export const voiceTranscriptHash = (text: string) =>
  crypto.createHash('sha256').update(normalizeVoiceTranscript(text)).digest('hex').slice(0, 16);

export function mentalRepVoiceStates(reps: MentalRep[], manifest: DurableVoiceManifest): MentalRepVoiceState[] {
  const durable = new Map((manifest.assets ?? []).map((asset) => [asset.id, asset]));
  return reps.flatMap((rep) => rep.beats.map((beat) => {
    const id = `rep.${rep.id}.${beat.id}`;
    const text = normalizeVoiceTranscript(beat.narration);
    const transcriptHash = voiceTranscriptHash(text);
    const currentAsset = durable.get(id);
    const status: MentalRepVoiceStatus = !currentAsset
      ? 'missing'
      : currentAsset.transcriptHash === transcriptHash
        ? 'current'
        : 'stale';
    return {
      id,
      repId: rep.id,
      beatId: beat.id,
      repTitle: rep.title,
      beatTitle: beat.title,
      phase: beat.phase,
      text,
      transcriptHash,
      suggestedFile: `${id}.v${transcriptHash}.mp3`,
      words: text ? text.split(/\s+/).length : 0,
      characters: text.length,
      status,
      ...(currentAsset ? { currentAsset } : {}),
    };
  }));
}
