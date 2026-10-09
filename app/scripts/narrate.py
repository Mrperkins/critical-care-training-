#!/usr/bin/env python3
"""
Renders narration with the app's one natural neural narrator (Kokoro-82M v1.0 ONNX, Apache-2.0, voice in
src/audio/narrator.ts) from narration/jobs.json (scripts/narration-jobs.ts).

Clinical text is spoken the way clinicians say it: acronyms are spelled letter by letter from explicit phonemes
(the phonemiser would otherwise read "ICU" as a word or "A" as the article), word-acronyms are said as words
(PEEP, MAP, STEMI, ROSC), chemical subscripts and units are expanded (CO₂ → "C O two", cmH₂O → "centimeters of
water"), and symbols become words. Audio: 24 kHz mono, high-pass at 70 Hz, loudness-normalised to −18 LUFS,
MP3 at 48 kb/s (episodes, which run for hours, at 32 kb/s).

usage: python3 scripts/narrate.py --model kokoro-v1.0.onnx --voices voices-v1.0.bin --jobs narration/jobs.json
                                  --out OUT [--shard i --of n] [--skip narration/done.json] [--only id,id]
Writes OUT/<target>/<id>.mp3 and OUT/meta-<shard>.json ({id: {hash, seconds, bytes, target}}).
"""
import argparse, json, re, subprocess, sys, tempfile, time
from pathlib import Path

# ------------------------------------------------------------------ text → speech-ready text
LETTER_IPA = {'A': 'eɪ', 'B': 'biː', 'C': 'siː', 'D': 'diː', 'E': 'iː', 'F': 'ɛf', 'G': 'dʒiː', 'H': 'eɪtʃ', 'I': 'aɪ', 'J': 'dʒeɪ',
              'K': 'keɪ', 'L': 'ɛl', 'M': 'ɛm', 'N': 'ɛn', 'O': 'oʊ', 'P': 'piː', 'Q': 'kjuː', 'R': 'ɑːɹ', 'S': 'ɛs', 'T': 'tiː', 'U': 'juː',
              'V': 'viː', 'W': 'dʌbəljuː', 'X': 'ɛks', 'Y': 'waɪ', 'Z': 'ziː'}
DIGIT_WORD = {'0': 'zero', '1': 'one', '2': 'two', '3': 'three', '4': 'four', '5': 'five', '6': 'six', '7': 'seven', '8': 'eight', '9': 'nine'}
SUB = str.maketrans('₀₁₂₃₄₅₆₇₈₉²³', '012345678923')
# acronyms said as words (case as written in the source)
AS_WORDS = {'PEEP': 'peep', 'MAP': 'map', 'FAST': 'fast', 'eFAST': 'e fast', 'STEMI': 'stemmy', 'ROSC': 'rosk', 'RASS': 'rass', 'HELLP': 'help',
            'GABA': 'gabba', 'DOPES': 'dopes', 'CAM': 'cam', 'POCUS': 'poe-kuss', 'CLABSI': 'clab-see', 'PICS': 'pics', 'LEFT': 'left',
            'ECMO': 'ek-mo', 'AIDS': 'aids', 'NOAC': 'no-ack', 'DOAC': 'doe-ack', 'MODS': 'mods', 'SIRS': 'sirs', 'PLAX': 'plax', 'PSAX': 'pea-sax',
            'TEG': 'teg', 'ROTEM': 'row-tem', 'BURP': 'burp', 'SOAP': 'soap', 'SBAR': 'ess-bar', 'APRV': 'A P R V', 'NICE': 'nice', 'HIT': 'hit'}
CAPS_WORDS = {'NOT', 'AND', 'OR', 'NO', 'YES', 'NEVER', 'ALWAYS', 'BELOW', 'ABOVE', 'ONLY', 'ALL', 'STOP', 'NOW', 'REAL', 'TRUE', 'FALSE', 'RIGHT', 'LEFT', 'CAROTID',
              'ARTERY', 'VEIN', 'FIXED', 'IN', 'OUT', 'UP', 'DOWN', 'ON', 'OFF', 'BEFORE', 'AFTER', 'THEN', 'DO', 'DON', 'WHY', 'WHAT', 'HOW', 'BUT', 'IS', 'THE', 'THIS', 'ONE', 'TWO'}
SPELL = {'pH', 'aPTT', 'eGFR', 'mRNA', 'cAMP', 'cGMP'}
ROMAN = {'II': 'two', 'III': 'three', 'IV': 'four', 'VII': 'seven', 'IX': 'nine', 'X': 'ten', 'XII': 'twelve', 'XIII': 'thirteen'}
UNITS = [
    (r'cmH[₂2]O', 'centimeters of water'), (r'mmHg', 'millimeters of mercury'), (r'mL/kg/h(?:r)?\b', 'milliliters per kilogram per hour'),
    (r'mL/kg\b', 'milliliters per kilogram'), (r'mL/min\b', 'milliliters per minute'), (r'mL/h(?:r)?\b', 'milliliters per hour'), (r'L/min\b', 'liters per minute'),
    (r'mcg/kg/min\b|µg/kg/min\b|μg/kg/min\b', 'micrograms per kilogram per minute'), (r'mcg/min\b|µg/min\b', 'micrograms per minute'),
    (r'mg/kg\b', 'milligrams per kilogram'), (r'mg/dL\b', 'milligrams per deciliter'), (r'mmol/L\b', 'millimoles per liter'), (r'mEq/L\b', 'milliequivalents per liter'),
    (r'g/dL\b', 'grams per deciliter'), (r'\bmL\b', 'milliliters'), (r'\bmcg\b|µg|μg', 'micrograms'), (r'\bmg\b', 'milligrams'), (r'\bkg\b', 'kilograms'),
    (r'\bmmol\b', 'millimoles'), (r'\bmEq\b', 'milliequivalents'), (r'\bcm\b', 'centimeters'), (r'\bmm\b', 'millimeters'), (r'\bms\b', 'milliseconds'),
    (r'\bL\b(?=\s|[.,;:])', 'liters'), (r'/min\b', ' per minute'), (r'(\d)\s?h\b', r'\1 hours'), (r'(\d)\s?min\b', r'\1 minutes'), (r'(\d)\s?s\b', r'\1 seconds'),
    (r'(\d)\s?°C', r'\1 degrees Celsius'), (r'(\d)\s?°', r'\1 degrees'),
]
SYMBOLS = [(r'\s*→\s*', ', then '), (r'≈\s*', 'about '), (r'~\s*(?=\d)', 'about '), (r'≥\s*', 'at least '), (r'≤\s*', 'at most '), (r'>\s*(?=\d)', 'more than '),
           (r'<\s*(?=\d)', 'less than '), (r'±', ' plus or minus '), (r'×', ' times '), (r'\s=\s', ' equals '), (r'(\d)\s?%', r'\1 percent'), (r'…', '... '),
           (r'[“”]', '"'), (r'’', "'"), (r'\s—\s|—', ', '), (r'(\d)\s?–\s?(\d)', r'\1 to \2'), (r'\s–\s', ', '), (r'\s/\s', ' or '), (r'&', ' and ')]

def spell_ipa(word: str) -> str:
    """'ICU' → explicit letter-name phonemes: secondary stress on each letter, primary on the last (aɪ siː ˈjuː)."""
    parts = [LETTER_IPA[ch.upper()] for ch in word if ch.isalpha() and ch.upper() in LETTER_IPA]
    return ''.join(('ˌ' if i < len(parts) - 1 else 'ˈ') + p for i, p in enumerate(parts))

TOKEN = re.compile(r"\b([A-Za-z]*[A-Z][A-Za-z]*\d*[a-z]?|[A-Za-z]+\d+[A-Za-z]*)\b")

def normalise(text: str, glossary: dict) -> list:
    """Returns segments: ('t', text) for the phonemiser and ('p', phonemes) for acronyms."""
    t = text.translate(SUB)
    for a, b in glossary.items():  # project pronunciation glossary (word respellings only; acronyms handled below)
        if not re.fullmatch(r'[A-Z₀-₉0-9]+', a): t = re.sub(rf'\b{re.escape(a)}\b', b, t)
    for a, b in UNITS: t = re.sub(a, b, t)
    for a, b in SYMBOLS: t = re.sub(a, b, t)
    t = re.sub(r'\b(factors?|grade|class|stage|type|phase|zone|level|lead|cranial nerve)\s+(II|III|IV|VII|IX|X|XII|XIII)\b', lambda m: f'{m.group(1)} {ROMAN[m.group(2)]}', t, flags=re.I)
    t = re.sub(r'\b(II|VII|IX)\b', lambda m: ROMAN[m.group(1)], t)  # clotting factors listed without the word "factor"
    t = re.sub(r'\b(nine|seven|two),? and X\b', r'\1 and ten', t)
    t = re.sub(r'(?<=[A-Z0-9])/(?=[A-Z])', ' ', t)  # PK/PD, MR/AR
    t = re.sub(r'[ \t]+', ' ', t).strip()
    segs, pos = [], 0
    for m in TOKEN.finditer(t):
        w = m.group(1)
        if w in AS_WORDS:
            rep = ('t', AS_WORDS[w])
        else:
            letters = re.sub(r'\d+[a-z]?$', '', w); tail = w[len(letters):]
            caps = sum(c.isupper() for c in letters); low_run = max((len(x) for x in re.findall(r'[a-z]+', letters)), default=0)
            plural = bool(re.fullmatch(r'[A-Z]{2,}s', letters))
            if plural: letters = letters[:-1]
            if w in CAPS_WORDS: segs.append(('t', t[pos:m.start()])); segs.append(('t', w.lower())); pos = m.end(); continue
            is_acronym = w in SPELL or (low_run <= 1 and ((len(letters) >= 2 and caps >= 2) or (caps >= 1 and bool(tail))))
            if not is_acronym:
                continue
            # lower-case letters inside an acronym (PaCO2, ScvO2, aPTT, pH) are spoken as letters too
            ipa = spell_ipa(letters) + ('z' if plural else '')
            tail_words = ' '.join(DIGIT_WORD[d] for d in re.sub(r'[a-z]', '', tail)) if tail else ''
            if tail and re.search(r'[a-z]$', tail): tail_words += ' ' + tail[-1]
            segs.append(('t', t[pos:m.start()])); segs.append(('p', ipa)); pos = m.end()
            if tail_words: segs.append(('t', ' ' + tail_words + ' '))
            continue
        segs.append(('t', t[pos:m.start()])); segs.append(rep); pos = m.end()
    segs.append(('t', t[pos:]))
    return [s for s in segs if s[1]]

# ------------------------------------------------------------------ render
def to_phonemes(tok, segs, lang):
    out = []
    for kind, s in segs:
        if kind == 'p': out.append(' ' + s + ' ')
        else:
            lead = ' ' if s[:1].isspace() else ''; trail = ' ' if s[-1:].isspace() else ''
            core = s.strip()
            if core: out.append(lead + tok.phonemize(core, lang) + trail)
            else: out.append(' ')
    return re.sub(r'\s+', ' ', ''.join(out)).strip()

def encode(wav: Path, mp3: Path, kbps: int = 48):
    subprocess.run(['ffmpeg', '-hide_banner', '-loglevel', 'error', '-y', '-i', str(wav), '-af', 'highpass=f=70,loudnorm=I=-18:TP=-1.5:LRA=9',
                    '-ar', '24000', '-ac', '1', '-c:a', 'libmp3lame', '-b:a', f'{kbps}k', str(mp3)], check=True)

def main():
    ap = argparse.ArgumentParser()
    ap.add_argument('--model', required=True); ap.add_argument('--voices', required=True); ap.add_argument('--jobs', default='narration/jobs.json')
    ap.add_argument('--out', required=True); ap.add_argument('--shard', type=int, default=0); ap.add_argument('--of', type=int, default=1)
    ap.add_argument('--skip'); ap.add_argument('--only'); ap.add_argument('--glossary', default='public/audio/voice/pronunciations.json')
    a = ap.parse_args()
    import numpy as np, soundfile as sf
    from kokoro_onnx import Kokoro
    spec = json.loads(Path(a.jobs).read_text()); narr = spec['narrator']; jobs = spec['jobs']
    done = json.loads(Path(a.skip).read_text()) if a.skip and Path(a.skip).exists() else {}
    only = set(a.only.split(',')) if a.only else None
    todo = [j for j in jobs if (only is None or j['id'] in only) and done.get(j['id'], {}).get('hash') != j['hash']]
    # balance shards by characters
    todo.sort(key=lambda j: -len(j['text'])); shards = [[] for _ in range(a.of)]; load = [0] * a.of
    for j in todo: k = load.index(min(load)); shards[k].append(j); load[k] += len(j['text'])
    mine = shards[a.shard]
    gl = json.loads(Path(a.glossary).read_text()).get('terms', {}) if Path(a.glossary).exists() else {}
    k = Kokoro(a.model, a.voices); lang = 'en-us' if narr['voice'][0] == 'a' else 'en-gb'
    out = Path(a.out); meta = {}; t0 = time.time()
    print(f'shard {a.shard}/{a.of}: {len(mine)} of {len(todo)} jobs, {sum(len(j["text"]) for j in mine)} chars', flush=True)
    for n, j in enumerate(mine, 1):
        paras = [p for p in re.split(r'\n\s*\n', j['text']) if p.strip()]
        audio = []
        for i, p in enumerate(paras):
            ph = to_phonemes(k.tokenizer, normalise(p, gl), lang)
            s, sr = k.create(ph, voice=narr['voice'], speed=narr['speed'], lang=lang, is_phonemes=True)
            audio.append(s); audio.append(np.zeros(int(sr * (0.55 if i < len(paras) - 1 else 0.0)), dtype=np.float32))
        wavv = np.concatenate(audio) if audio else np.zeros(1, dtype=np.float32)
        dst = out / j['target'] / f"{j['id']}.mp3"; dst.parent.mkdir(parents=True, exist_ok=True)
        with tempfile.NamedTemporaryFile(suffix='.wav') as tmp:
            sf.write(tmp.name, wavv, sr); encode(Path(tmp.name), dst, 32 if j['target'] == 'episode' else 48)
        meta[j['id']] = {'hash': j['hash'], 'target': j['target'], 'seconds': round(len(wavv) / sr, 2), 'bytes': dst.stat().st_size}
        if n % 10 == 0 or n == len(mine): print(f'  {n}/{len(mine)} · {time.time() - t0:.0f}s', flush=True)
    (out / f'meta-{a.shard}.json').write_text(json.dumps(meta, indent=1))

if __name__ == '__main__':
    main()
