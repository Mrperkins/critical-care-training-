/** Packs rendered narration clips (MP3) into public/vo/vo.json for inlining. */
import fs from 'node:fs'; import path from 'node:path';
const dir = process.argv[2]; const lines: { id: string }[] = JSON.parse(fs.readFileSync('public/vo/lines.json', 'utf8'));
const out: Record<string, string> = {}; let missing = 0, bytes = 0;
for (const l of lines) { const f = path.join(dir, l.id + '.mp3'); if (fs.existsSync(f)) { const b = fs.readFileSync(f); out[l.id] = b.toString('base64'); bytes += b.length; } else missing++; }
fs.writeFileSync('public/vo/vo.json', JSON.stringify(out));
console.log(Object.keys(out).length, 'clips,', (bytes / 1e6).toFixed(2), 'MB,', missing, 'missing');
