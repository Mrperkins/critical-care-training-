import { describe, expect, it } from 'vitest';
import type { MentalRep } from '../src/audio/types';
import {
  mentalRepVoiceStates,
  normalizeVoiceTranscript,
  voiceTranscriptHash,
  type DurableVoiceManifest,
} from '../scripts/audio-voice-state';

const rep: MentalRep = {
  id: 'rep-test',
  title: 'Test procedure',
  subtitle: 'Voice-state fixture',
  level: 3,
  domain: 'procedures',
  minutes: 3,
  concepts: [],
  disclaimer: 'Mental rehearsal fixture used only for deterministic voice-state tests.',
  beats: [
    { id: 'current', phase: 'arrival', title: 'Current', narration: '  Same   clinical transcript.  ' },
    { id: 'stale', phase: 'sequence', title: 'Stale', narration: 'This narration changed.' },
    { id: 'missing', phase: 'debrief', title: 'Missing', narration: 'This narration has never been rendered.' },
  ],
};

describe('Mental Rep durable voice state', () => {
  it('normalizes whitespace before hashing transcripts', () => {
    expect(normalizeVoiceTranscript('  one   two\nthree  ')).toBe('one two three');
    expect(voiceTranscriptHash('one   two\nthree')).toBe(voiceTranscriptHash(' one two three '));
  });

  it('separates current, stale and missing durable assets deterministically', () => {
    const manifest: DurableVoiceManifest = {
      assets: [
        {
          id: 'rep.rep-test.current',
          file: 'rep.rep-test.current.mp3',
          transcriptHash: voiceTranscriptHash('Same clinical transcript.'),
        },
        {
          id: 'rep.rep-test.stale',
          file: 'rep.rep-test.stale.old.mp3',
          transcriptHash: voiceTranscriptHash('Old narration.'),
          reviewed: true,
        },
      ],
    };

    const states = mentalRepVoiceStates([rep], manifest);
    expect(states.map((x) => [x.beatId, x.status])).toEqual([
      ['current', 'current'],
      ['stale', 'stale'],
      ['missing', 'missing'],
    ]);

    const stale = states.find((x) => x.beatId === 'stale')!;
    expect(stale.currentAsset?.file).toBe('rep.rep-test.stale.old.mp3');
    expect(stale.currentAsset?.reviewed).toBe(true);
    expect(stale.suggestedFile).toBe(`rep.rep-test.stale.v${stale.transcriptHash}.mp3`);

    const missing = states.find((x) => x.beatId === 'missing')!;
    expect(missing.currentAsset).toBeUndefined();
    expect(missing.text).toBe('This narration has never been rendered.');
  });

  it('never queues a durable asset whose transcript hash matches current narration', () => {
    const manifest: DurableVoiceManifest = {
      assets: rep.beats.map((beat) => ({
        id: `rep.${rep.id}.${beat.id}`,
        file: `rep.${rep.id}.${beat.id}.mp3`,
        transcriptHash: voiceTranscriptHash(beat.narration),
      })),
    };
    expect(mentalRepVoiceStates([rep], manifest).filter((x) => x.status !== 'current')).toEqual([]);
  });
});
