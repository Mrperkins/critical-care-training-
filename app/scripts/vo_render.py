#!/usr/bin/env python3
"""
Renders narration clips for every line in public/vo/lines.json that has no clip yet (or whose text changed)
with an offline neural voice (Kokoro-82M, Apache-2.0, voice bf_emma), then encodes each clip like the
existing ones (MP3, 22.05 kHz mono, 24 kb/s). Clips go to a cache folder; scripts/vo-pack.ts packs them.

usage: python3 scripts/vo_render.py <model.onnx> <voices.bin> <cache_dir> [--only id1,id2]
"""
import hashlib, json, os, re, subprocess, sys
from pathlib import Path

VOICE, LANG, SPEED = 'bf_emma', 'en-gb', 1.0

# spoken forms for the abbreviations and symbols that appear in lesson text
SAY = [
    (r'PaCO₂|PaCO2', 'P A C O 2'), (r'PaO₂|PaO2', 'P A O 2'), (r'PvO₂|PvO2', 'P V O 2'), (r'FiO₂|FiO2', 'F I O 2'),
    (r'SpO₂|SpO2', 'S P O 2'), (r'SvO₂|SvO2', 'S V O 2'), (r'ScvO₂', 'S C V O 2'), (r'EtCO₂|EtCO2', 'end-tidal C O 2'), (r'DO₂', 'D O 2'), (r'CaO₂', 'C A O 2'),
    (r'\bPO₂|\bPO2\b', 'P O 2'), (r'\bCO₂|\bCO2\b', 'C O 2'), (r'\bO₂|\bO2\b', 'oxygen'),
    (r'cmH₂O|cmH2O', 'centimetres of water'), (r'mmHg', 'millimetres of mercury'), (r'mL/kg', 'millilitres per kilo'), (r'\bmL\b', 'millilitres'),
    (r'µg/kg/min', 'micrograms per kilo per minute'), (r'\bkg\b', 'kilos'), (r'\bcm\b', 'centimetres'), (r'\bmm\b', 'millimetres'),
    (r'\bCVP\b', 'C V P'), (r'\bCOPD\b', 'C O P D'), (r'\bARDS\b', 'A R D S'), (r'\bCT\b', 'C T'), (r'\bECG\b', 'E C G'), (r'\bQRS\b', 'Q R S'),
    (r'\bPPV\b', 'P P V'), (r'\bPIP\b', 'P I P'), (r'\bCPR\b', 'C P R'), (r'\bSVC\b', 'S V C'), (r'\bRV\b', 'R V'), (r'\bLV\b', 'L V'), (r'\bATP\b', 'A T P'),
    (r'\bVSD\b', 'V S D'), (r'\bASD\b', 'A S D'), (r'\bPDA\b', 'P D A'), (r'\bPFO\b', 'P F O'), (r'\bICP\b', 'I C P'), (r'\bCPP\b', 'C P P'), (r'\bEVD\b', 'E V D'),
    (r'\bIVC\b', 'I V C'), (r'\bICU\b', 'I C U'), (r'\bPPHN\b', 'P P H N'), (r'\bNIV\b', 'N I V'), (r'\bTXA\b', 'T X A'), (r'\bPPH\b', 'P P H'), (r'\bFRC\b', 'F R C'),
    (r'\bPEEP\b', 'peep'), (r'\bMAP\b', 'map'), (r'\bFAST\b', 'fast'), (r'\bLEFT\b', 'left'), (r'\bPR\b', 'P R'), (r'\bIJ\b', 'I J'), (r'\bAAA\b', 'triple A'),
    (r'×', ' times '), (r'=', ' equals '), (r'(\d)\s?%', r'\1 percent'), (r'≈', 'about '), (r'→', ', then '), (r'₂', '2'), (r'½', 'half'),
]
def spoken(t: str) -> str:
    for a, b in SAY: t = re.sub(a, b, t)
    return re.sub(r'\s+', ' ', t).strip()

def main():
    model, voices, cache = sys.argv[1], sys.argv[2], Path(sys.argv[3]); cache.mkdir(parents=True, exist_ok=True)
    only = set(sys.argv[sys.argv.index('--only') + 1].split(',')) if '--only' in sys.argv else None
    root = Path(__file__).resolve().parent.parent
    lines = json.loads((root / 'public/vo/lines.json').read_text())
    packed = set(json.loads((root / 'public/vo/vo.json').read_text()).keys()) if (root / 'public/vo/vo.json').exists() else set()
    hashes_p = root / 'public/vo/hashes.json'; hashes = json.loads(hashes_p.read_text()) if hashes_p.exists() else {}
    todo = []
    for l in lines:
        h = hashlib.sha1((VOICE + '|' + spoken(l['t'])).encode()).hexdigest()[:12]
        if only is not None and l['id'] not in only: continue
        mp3 = cache / f"{l['id']}.mp3"
        # an original clip (no hash recorded) is kept; ours are re-rendered only if the text changed
        if l['id'] in packed and l['id'] not in hashes: continue
        if hashes.get(l['id']) == h and (mp3.exists() or l['id'] in packed): continue
        todo.append((l, h))
    print(len(todo), 'clips to render', flush=True)
    if not todo: return
    from kokoro_onnx import Kokoro; import soundfile as sf
    k = Kokoro(model, voices)
    for i, (l, h) in enumerate(todo):
        s, sr = k.create(spoken(l['t']), voice=VOICE, speed=SPEED, lang=LANG)
        wav = cache / f"{l['id']}.wav"; sf.write(wav, s, sr)
        subprocess.run(['ffmpeg', '-loglevel', 'error', '-y', '-i', str(wav), '-ar', '22050', '-ac', '1', '-b:a', '24k', str(cache / f"{l['id']}.mp3")], check=True)
        wav.unlink(); hashes[l['id']] = h; hashes_p.write_text(json.dumps(hashes, indent=1, sort_keys=True))
        print(f"{i + 1}/{len(todo)} {l['id']} {len(s) / sr:.1f}s", flush=True)

if __name__ == '__main__': main()
