import fs from 'node:fs';
import path from 'node:path';
import {
  validateVoiceImportRequest,
  type VoiceImportRequest,
  type VoiceLine,
  type VoiceManifest,
} from './audio-voice-import-contract';

const voiceDir = path.resolve('public/audio/voice');
const requestPath = path.join(voiceDir, 'import.json');
const linesPath = path.join(voiceDir, 'lines.json');
const manifestPath = path.join(voiceDir, 'manifest.json');

const request = JSON.parse(fs.readFileSync(requestPath, 'utf8')) as VoiceImportRequest;
const lines = JSON.parse(fs.readFileSync(linesPath, 'utf8')) as VoiceLine[];
const manifest = fs.existsSync(manifestPath)
  ? JSON.parse(fs.readFileSync(manifestPath, 'utf8')) as VoiceManifest
  : { assets: [] };

const errors = validateVoiceImportRequest(request, lines, manifest);
if (errors.length) {
  console.error('voice import preflight failed:');
  for (const error of errors) console.error(`- ${error}`);
  process.exitCode = 1;
} else {
  console.log(`voice import preflight passed: ${request.assets?.length ?? 0} requested assets`);
}
