#!/usr/bin/env python3
"""
Merges rendered narration (scripts/narrate.py shard outputs) into the repository:
  vo       → repo-root vo/<id>.mp3            + app/public/vo/narration.json   (visual app, served at vo/)
  rep      → repo-root audio/narration/<id>.mp3 + app/public/audio/voice/manifest.json (audio app, served at audio/narration/)
  episode  → same as rep
Clips no longer in narration/jobs.json are dropped from both metadata files (and their files deleted).
usage: python3 scripts/narration_collect.py <dir with meta-*.json and vo/ rep/ episode/> (run from app/)
"""
import hashlib, json, shutil, sys
from pathlib import Path

APP = Path(__file__).resolve().parent.parent; ROOT = APP.parent
src = Path(sys.argv[1]); spec = json.loads((APP / 'narration/jobs.json').read_text()); narr = spec['narrator']
jobs = {j['id']: j for j in spec['jobs']}
meta = {}
for m in sorted(src.glob('**/meta-*.json')): meta.update(json.loads(m.read_text()))

vo_meta_p = APP / 'public/vo/narration.json'; vo_meta = json.loads(vo_meta_p.read_text()) if vo_meta_p.exists() else {}
man_p = APP / 'public/audio/voice/manifest.json'; man = json.loads(man_p.read_text()) if man_p.exists() else {'assets': []}
assets = {a['id']: a for a in man['assets'] if a.get('narrationHash')}  # older non-Kokoro assets are replaced wholesale
(ROOT / 'vo').mkdir(exist_ok=True); (ROOT / 'audio/narration').mkdir(parents=True, exist_ok=True)
n = 0
for id_, m in meta.items():
    j = jobs.get(id_)
    if not j or j['hash'] != m['hash']: continue
    f = next(src.glob(f"**/{m['target']}/{id_}.mp3"), None)
    if not f: continue
    if m['target'] == 'vo':
        shutil.copyfile(f, ROOT / 'vo' / f'{id_}.mp3'); vo_meta[id_] = {'hash': m['hash'], 'seconds': m['seconds']}
    else:
        shutil.copyfile(f, ROOT / 'audio/narration' / f'{id_}.mp3')
        assets[id_] = {'id': id_, 'file': f'narration/{id_}.mp3', 'narrationHash': m['hash'], 'transcriptHash': j.get('transcriptHash') or j['hash'],
                       'durationSeconds': m['seconds'], 'sha256': hashlib.sha256(f.read_bytes()).hexdigest(), 'reviewed': False, 'published': False,
                       'voice': narr['label'], 'provider': f"{narr['engine']}, {narr['license']}", 'note': 'Rendered offline from the canonical transcript; listening and clinical review pending.'}
    n += 1
# drop clips whose line no longer exists
for id_ in [i for i in vo_meta if i not in jobs]: vo_meta.pop(id_); (ROOT / 'vo' / f'{id_}.mp3').unlink(missing_ok=True)
for id_ in [i for i in assets if i not in jobs]: assets.pop(id_); (ROOT / 'audio/narration' / f'{id_}.mp3').unlink(missing_ok=True)
vo_meta_p.write_text(json.dumps(dict(sorted(vo_meta.items())), indent=1) + '\n')
man['assets'] = sorted(assets.values(), key=lambda a: a['id']); man_p.write_text(json.dumps(man, indent=2) + '\n')
# the previous clip stores are superseded once every line of that kind has a current clip
def have(i): return (vo_meta.get(i) or {}).get('hash') or (assets.get(i) or {}).get('narrationHash')
cur = lambda t: all(have(i) == j['hash'] for i, j in jobs.items() if j['target'] == t)
if cur('vo'):
    for f in ['public/vo/vo.json', 'public/vo/hashes.json']: (APP / f).unlink(missing_ok=True)
if cur('rep'):
    for f in (APP / 'public/audio/voice').glob('*.mp3'): f.unlink()
    (APP / 'public/audio/voice/import.json').unlink(missing_ok=True)
print(f'collected {n} clips · vo {len(vo_meta)} · audio {len(assets)} (vo complete: {cur("vo")}, reps complete: {cur("rep")}, episodes complete: {cur("episode")})')
