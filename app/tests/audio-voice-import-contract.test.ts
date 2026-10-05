import { describe, expect, it } from 'vitest';
import {
  expectedVoiceFile,
  validateVoiceImportRequest,
  type VoiceImportRequest,
  type VoiceLine,
  type VoiceManifest,
} from '../scripts/audio-voice-import-contract';

const lines: VoiceLine[] = [
  { id: 'rep.rep-test.one', transcriptHash: 'aaaaaaaaaaaaaaaa' },
  { id: 'rep.rep-test.two', transcriptHash: 'bbbbbbbbbbbbbbbb' },
];

const validRequest = (): VoiceImportRequest => ({
  assets: [{
    id: 'rep.rep-test.one',
    transcriptHash: 'aaaaaaaaaaaaaaaa',
    file: expectedVoiceFile('rep.rep-test.one', 'aaaaaaaaaaaaaaaa'),
    url: 'https://example.com/one.mp3',
  }],
});

describe('voice import request contract', () => {
  it('accepts a current hash, versioned filename, and unique http(s) URL', () => {
    expect(validateVoiceImportRequest(validRequest(), lines)).toEqual([]);
  });

  it('rejects stale transcript hashes before download', () => {
    const request = validRequest();
    request.assets![0].transcriptHash = 'cccccccccccccccc';
    expect(validateVoiceImportRequest(request, lines).join('\n')).toMatch(/does not match canonical/);
  });

  it('rejects an unversioned or wrong destination filename', () => {
    const request = validRequest();
    request.assets![0].file = 'rep.rep-test.one.mp3';
    expect(validateVoiceImportRequest(request, lines).join('\n')).toMatch(/file must be rep\.rep-test\.one\.vaaaaaaaaaaaaaaaa\.mp3/);
  });

  it('rejects duplicate URLs assigned to different line ids', () => {
    const request: VoiceImportRequest = {
      assets: [
        ...validRequest().assets!,
        {
          id: 'rep.rep-test.two',
          transcriptHash: 'bbbbbbbbbbbbbbbb',
          file: expectedVoiceFile('rep.rep-test.two', 'bbbbbbbbbbbbbbbb'),
          url: 'https://example.com/one.mp3',
        },
      ],
    };
    expect(validateVoiceImportRequest(request, lines).join('\n')).toMatch(/url is already assigned/);
  });

  it('rejects accidental re-import of a durable current asset unless replacement is explicit', () => {
    const manifest: VoiceManifest = {
      assets: [{
        id: 'rep.rep-test.one',
        transcriptHash: 'aaaaaaaaaaaaaaaa',
        file: expectedVoiceFile('rep.rep-test.one', 'aaaaaaaaaaaaaaaa'),
      }],
    };
    expect(validateVoiceImportRequest(validRequest(), lines, manifest).join('\n')).toMatch(/already current/);

    const replacement = validRequest();
    replacement.assets![0].replaceCurrent = true;
    expect(validateVoiceImportRequest(replacement, lines, manifest)).toEqual([]);
  });

  it('rejects missing URLs and non-http protocols', () => {
    const missing = validRequest();
    delete missing.assets![0].url;
    expect(validateVoiceImportRequest(missing, lines).join('\n')).toMatch(/url is required/);

    const badScheme = validRequest();
    badScheme.assets![0].url = 'file:///tmp/one.mp3';
    expect(validateVoiceImportRequest(badScheme, lines).join('\n')).toMatch(/http\(s\)/);
  });
});
