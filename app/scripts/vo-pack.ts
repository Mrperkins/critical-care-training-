/**
 * Packs narration clips into public/vo/vo.json (base64 MP3 by clip id) for inlining / publishing.
 * Keeps clips already packed; adds or replaces those found in <dir> (rendered by scripts/vo_render.py).
 * Drops clips whose id no longer appears in public/vo/lines.json.
 */
import fs from 'node:fs'; import path from 'node:path';
const dir = process.argv[2]; const lines: { id: string }[] = JSON.parse(fs.readFileSync('public/vo/lines.json', 'utf8'));
const prev: Record<string, string> = fs.existsSync('public/vo/vo.json') ? JSON.parse(fs.readFileSync('public/vo/vo.json', 'utf8')) : {};
// a clip counts only once the renderer has recorded its hash (written after the MP3 is complete)
const done: Record<string, string> = fs.existsSync('public/vo/hashes.json') ? JSON.parse(fs.readFileSync('public/vo/hashes.json', 'utf8')) : {};
const out: Record<string, string> = {}; let missing = 0, added = 0, bytes = 0;
for (const l of lines) {
  const f = dir ? path.join(dir, l.id + '.mp3') : '';
  if (f && fs.existsSync(f) && done[l.id]) { out[l.id] = fs.readFileSync(f).toString('base64'); added++; } else if (prev[l.id]) out[l.id] = prev[l.id]; else { missing++; continue; }
  bytes += Buffer.from(out[l.id], 'base64').length;
}
fs.writeFileSync('public/vo/vo.json', JSON.stringify(out));
console.log(Object.keys(out).length, 'clips (', added, 'from', dir, '),', (bytes / 1e6).toFixed(2), 'MB,', missing, 'missing');
