"""Real clinical media: fetch originals with licence evidence, ingest them into imaging/real/, regenerate the docs.

    python tools/clinical_media.py fetch  --out DIR [--only ID ...]   # needs open internet (not this project's build box)
    python tools/clinical_media.py ingest --from DIR [--only ID ...]  # verify, transcode, promote pending -> items
    python tools/clinical_media.py docs                              # rewrite ATTRIBUTION.md, ASSET_MANIFEST.md, assets.json

`imaging/real/manifest.json` is the single source of truth. Entries under "pending" carry the teaching content and
where the original lives; `fetch` downloads each original and writes DIR/<id>/meta.json with what the source itself
says (licence, authors, dates, checksums) plus the exact evidence string. `ingest` refuses anything whose licence is
not on the accepted list or differs from the claim, anything that is not the media it says it is (an HTML error page
saved as .jpg), and supplementary items whose caption carries a third-party credit.

Transcoding keeps the clinical picture intact: no crop, no mirror, no speed or direction change, no filters other
than padding odd dimensions to even by one black pixel and downscaling (aspect kept) only if wider than 1280 px.
Audio is dropped. MP4 = H.264 CRF 20 yuv420p +faststart, WebM = VP9 CRF 30.
"""
from __future__ import annotations

import argparse
import datetime as dt
import hashlib
import html
import json
import re
import shutil
import subprocess
import sys
import urllib.parse
import urllib.request
import urllib.error
from pathlib import Path

import os
ROOT = Path(os.environ.get('CLINICAL_MEDIA_ROOT') or Path(__file__).resolve().parents[1])
REAL = ROOT / 'imaging' / 'real'
SRC = REAL / 'source'
MAN = REAL / 'manifest.json'
UA = 'critical-care-training-media-fetch/1.0 (https://github.com/Mrperkins/critical-care-training-; teaching app)'
KEEP_ORIGINAL_MAX = 15 * 1024 * 1024
MAX_W = 1280
LICENSE_URLS = {
    'CC0': 'https://creativecommons.org/publicdomain/zero/1.0/',
    'CC BY 2.0': 'https://creativecommons.org/licenses/by/2.0/',
    'CC BY 3.0': 'https://creativecommons.org/licenses/by/3.0/',
    'CC BY 4.0': 'https://creativecommons.org/licenses/by/4.0/',
}
THIRD_PARTY = re.compile(r'courtesy|reproduced (?:with|by) permission|used with permission|©|\(c\)\s*\d{4}|copyright', re.I)


# ── shared ──────────────────────────────────────────────────────────────────────────────────────────────────────
def load() -> dict:
    return json.loads(MAN.read_text())


def save(m: dict) -> None:
    MAN.write_text(json.dumps(m, indent=1, ensure_ascii=False) + '\n')


def sha256(p: Path) -> str:
    return hashlib.sha256(p.read_bytes()).hexdigest()


def strip_tags(s: str) -> str:
    return re.sub(r'\s+', ' ', html.unescape(re.sub(r'<[^>]+>', ' ', s or ''))).strip()


def norm_license(s: str) -> str | None:
    """'CC0' / 'cc-by-2.0' / 'CC BY 4.0' / a creativecommons.org URL -> canonical short name, else None."""
    s = (s or '').strip()
    u = re.search(r'creativecommons\.org/(?:publicdomain/zero/1\.0|licenses/([a-z-]+)/(\d\.\d))', s, re.I)
    if u:
        if u.group(1) is None:
            return 'CC0'
        kind = u.group(1).lower()
        return f'CC BY {u.group(2)}' if kind == 'by' else f"CC {kind.upper().replace('-', ' ')} {u.group(2)}"
    t = re.sub(r'[\s_-]+', ' ', s.upper())
    if t in ('CC0', 'CC0 1.0', 'CC ZERO', 'PUBLIC DOMAIN DEDICATION'):
        return 'CC0'
    m = re.fullmatch(r'CC ([A-Z ]+?) (\d\.\d)(?: INTERNATIONAL| GENERIC| UNPORTED)?', t)
    return f'CC {m.group(1)} {m.group(2)}' if m else None


def sniff(p: Path) -> str:
    """What the bytes really are — catches an HTML page saved under a media extension."""
    b = p.read_bytes()[:64]
    if b[:3] == b'\xff\xd8\xff':
        return 'image/jpeg'
    if b[:8] == b'\x89PNG\r\n\x1a\n':
        return 'image/png'
    if b[:4] == b'OggS':
        return 'video/ogg'
    if b[:4] == b'RIFF' and b[8:12] == b'AVI ':
        return 'video/x-msvideo'
    if b[4:8] == b'ftyp':
        return 'video/mp4' if b[8:11] != b'qt ' else 'video/quicktime'
    if b[:4] == b'\x1a\x45\xdf\xa3':
        return 'video/webm'
    head = b.lstrip().lower()
    if head.startswith((b'<!doctype', b'<html', b'<?xml', b'{')):
        raise SystemExit(f'{p}: this is a web page / text, not media')
    raise SystemExit(f'{p}: unrecognised media signature {b[:12]!r}')


def probe(p: Path) -> dict:
    out = subprocess.run(['ffprobe', '-v', 'error', '-show_streams', '-show_format', '-of', 'json', str(p)], capture_output=True, text=True, check=True)
    j = json.loads(out.stdout)
    v = next(s for s in j['streams'] if s['codec_type'] == 'video')
    dur = float(j['format'].get('duration') or v.get('duration') or 0)
    rate = next((r for r in (v.get('avg_frame_rate'), v.get('r_frame_rate')) if r and not r.startswith('0/')), '0/1')
    n, d = (float(x) for x in rate.split('/')) if '/' in rate else (float(rate), 1.0)
    return {'w': int(v['width']), 'h': int(v['height']), 'codec': v['codec_name'], 'duration': round(dur, 3), 'fps': round(n / d, 3) if d else 0,
            'audio': any(s['codec_type'] == 'audio' for s in j['streams'])}


def ff(*args: str) -> None:
    subprocess.run(['ffmpeg', '-hide_banner', '-loglevel', 'error', '-y', *args], check=True)


def decodes_clean(p: Path) -> None:
    r = subprocess.run(['ffmpeg', '-v', 'error', '-i', str(p), '-f', 'null', '-'], capture_output=True, text=True)
    assert r.returncode == 0 and not r.stderr.strip(), f'{p.name} does not decode cleanly: {r.stderr[:400]}'


# ── fetch (open internet) ───────────────────────────────────────────────────────────────────────────────────────
def get(url: str) -> bytes:
    req = urllib.request.Request(url, headers={'User-Agent': UA})
    with urllib.request.urlopen(req, timeout=120) as r:
        return r.read()


def commons_meta(title: str) -> tuple[dict, str]:
    api = 'https://commons.wikimedia.org/w/api.php?' + urllib.parse.urlencode({
        'action': 'query', 'format': 'json', 'formatversion': '2', 'prop': 'imageinfo', 'titles': title,
        'iiprop': 'url|sha1|size|mime|extmetadata'})
    return json.loads(get(api)), api


def parse_commons(doc: dict, api: str, title: str) -> dict:
    page = doc['query']['pages'][0]
    assert not page.get('missing'), f'{title}: not on Commons'
    ii = page['imageinfo'][0]; em = ii.get('extmetadata', {})
    val = lambda k: strip_tags(em.get(k, {}).get('value', ''))
    lic = norm_license(val('LicenseShortName')) or norm_license(val('LicenseUrl'))
    return {
        'originalUrl': ii['url'], 'pageUrl': ii.get('descriptionurl') or f"https://commons.wikimedia.org/wiki/{urllib.parse.quote(title.replace(' ', '_'))}",
        'originalName': title.split(':', 1)[1], 'mime': ii.get('mime'), 'bytes': ii.get('size'), 'sha1': ii.get('sha1'),
        'width': ii.get('width'), 'height': ii.get('height'),
        'license': lic, 'licenseUrl': val('LicenseUrl') or LICENSE_URLS.get(lic or '', ''),
        'licenseEvidence': f"Wikimedia Commons API extmetadata for {title}: LicenseShortName = “{val('LicenseShortName')}”, "
                           f"UsageTerms = “{val('UsageTerms')}” ({api})",
        'authors': re.split(r'\s+(?:Author info|Consent note|Reusing images)\b', val('Artist'))[0].replace(' ,', ',').strip(' -'), 'credit': val('Credit'), 'published': val('DateTimeOriginal') or val('DateTime'),
        'description': val('ImageDescription'), 'restrictions': val('Restrictions'),
    }


EPMC = 'https://www.ebi.ac.uk/europepmc/webservices/rest'


def parse_epmc(search: dict, xml: str, doi: str, esm: int) -> dict:
    """Europe PMC record + JATS full text: licence element, authors, and supplementary item <esm> with its caption."""
    import xml.etree.ElementTree as ET
    res = [r for r in search.get('resultList', {}).get('result', []) if (r.get('doi') or '').lower() == doi.lower()]
    assert res, f'{doi}: not found in Europe PMC'
    r = res[0]; root = ET.fromstring(xml); XL = '{http://www.w3.org/1999/xlink}href'
    lic_el = root.find('.//permissions/license')
    assert lic_el is not None, f'{doi}: no <license> in the full text'
    lic_txt = strip_tags(ET.tostring(lic_el, encoding='unicode'))
    lic = norm_license(lic_el.get(XL, '')) or next((norm_license(u) for u in re.findall(r'https?://creativecommons\.org/[a-z/]+\d\.\d/?', ET.tostring(lic_el, encoding='unicode'))), None)
    sups = root.findall('.//supplementary-material')
    pick = [x for x in sups if any(re.search(rf'MOESM{esm}_ESM', m.get(XL, '')) for m in x.iter('media'))] or (sups[esm - 1:esm] if len(sups) >= esm else [])
    assert pick, f'{doi}: supplementary item {esm} not in the full text'
    sup = pick[0]; media = next(sup.iter('media')); href = media.get(XL)
    caption = strip_tags(ET.tostring(sup, encoding='unicode'))[:900]
    authors = [strip_tags(' '.join(filter(None, [n.findtext('given-names'), n.findtext('surname')]))) for n in root.findall('.//contrib[@contrib-type="author"]/name')]
    return {
        'pmcid': r['pmcid'], 'mediaName': href, 'pageUrl': f"https://doi.org/{doi}",
        'license': lic, 'licenseUrl': LICENSE_URLS.get(lic or '', ''),
        'licenseEvidence': f"Europe PMC full text of {r['pmcid']} (doi {doi}), <license>: “{lic_txt[:300]}”; supplementary item {esm} caption checked for a separate credit.",
        'authors': ', '.join(authors) or r.get('authorString', ''), 'title': strip_tags(r.get('title', '')).rstrip('.'),
        'publication': (r.get('journalInfo') or {}).get('journal', {}).get('title', ''), 'published': r.get('firstPublicationDate', ''), 'doi': doi,
        'volume': (r.get('journalInfo') or {}).get('volume', ''), 'firstpage': r.get('pageInfo', ''),
        'description': caption, 'thirdParty': bool(THIRD_PARTY.search(caption)),
    }


def fetch_epmc(doi: str, esm: int) -> tuple[dict, bytes]:
    import io, zipfile
    q = f'{EPMC}/search?' + urllib.parse.urlencode({'query': f'DOI:"{doi}"', 'resultType': 'core', 'format': 'json'})
    search = json.loads(get(q)); pmcid = search['resultList']['result'][0]['pmcid']
    meta = parse_epmc(search, get(f'{EPMC}/{pmcid}/fullTextXML').decode('utf-8'), doi, esm)
    zurl = f'{EPMC}/{pmcid}/supplementaryFiles'
    z = zipfile.ZipFile(io.BytesIO(get(zurl)))
    names = [n for n in z.namelist() if Path(n).name == Path(meta['mediaName']).name]
    assert names, f"{pmcid}: {meta['mediaName']} not in the supplementary archive ({z.namelist()[:12]})"
    meta.update(originalUrl=f"{zurl} → {names[0]}", originalName=Path(names[0]).name)
    return meta, z.read(names[0])


def parse_springer(page: str, url: str, esm: int) -> dict:
    metas = lambda n: [html.unescape(x) for x in re.findall(rf'<meta\s+name="{n}"\s+content="([^"]*)"', page)]
    one = lambda n: (metas(n) or [''])[0]
    lic_urls = sorted({norm_license(u) for u in re.findall(r'https?://creativecommons\.org/[a-z/]+\d\.\d/?', page)} - {None})
    assert len(lic_urls) == 1, f'{url}: expected one Creative Commons licence link, found {lic_urls}'
    phrase = re.search(r'This article is licensed under a (Creative Commons [^.<]+?Licen[cs]e)', strip_tags(page))
    links = re.findall(rf'https://static-content\.springer\.com/esm/[^"\s]+?MOESM{esm}_ESM\.[A-Za-z0-9]+', page)
    assert links, f'{url}: supplementary item {esm} not found'
    link = html.unescape(links[0])
    at = page.find(links[0]); block = strip_tags(page[max(0, at - 600): at + 2500])
    cap = re.search(r'(Supplementary (?:Material|Information|Video)[^.]*?' + str(esm) + r'.*?)(?:Supplementary (?:Material|Information|Video)|Rights and permissions|$)', block)
    caption = (cap.group(1) if cap else block)[:900]
    return {
        'originalUrl': link, 'pageUrl': url, 'originalName': link.rsplit('/', 1)[1],
        'license': lic_urls[0], 'licenseUrl': LICENSE_URLS.get(lic_urls[0], ''),
        'licenseEvidence': f"Article page {url}: “{phrase.group(0) if phrase else 'Creative Commons link'}” and licence link → {lic_urls[0]}; "
                           f"supplementary item {esm} caption checked for a separate third-party credit (none).",
        'authors': ', '.join(metas('citation_author')), 'title': one('citation_title'), 'publication': one('citation_journal_title'),
        'published': one('citation_publication_date') or one('citation_online_date'), 'doi': one('citation_doi'),
        'volume': one('citation_volume'), 'firstpage': one('citation_firstpage'),
        'description': caption, 'thirdParty': bool(THIRD_PARTY.search(caption)),
    }


def fetch_one(it: dict, out: Path) -> dict:
    f = it['fetch']; d = out / it['id']; d.mkdir(exist_ok=True)
    if f['type'] == 'commons':
        doc, api = commons_meta(f['title']); meta = parse_commons(doc, api, f['title'])
        if it.get('articleDoi'):
            meta['doi'] = it['articleDoi']
    elif f['type'] == 'springer':
        data = None
        try:
            page = get(f['article']).decode('utf-8', 'replace')
            try:
                meta = parse_springer(page, f['article'], f['esm'])
            except AssertionError as e:
                t = re.search(r'<title>(.*?)</title>', page, re.S)
                raise AssertionError(f"{e} (page {len(page):,} chars, title “{(t.group(1).strip() if t else '?')[:80]}”)")
        except BaseException as e:  # publisher page blocked or changed → the same article through Europe PMC
            gh('warning', it['id'], f'publisher page unusable, trying Europe PMC: {type(e).__name__}: {e}')
            meta, data = fetch_epmc(it['articleDoi'], f['esm'])
        if data is not None:
            return finish_fetch(it, d, meta, data)
    else:
        raise SystemExit(f"{it['id']}: unknown fetch type {f['type']}")
    return finish_fetch(it, d, meta, get(meta['originalUrl']))


def finish_fetch(it: dict, d: Path, meta: dict, data: bytes) -> dict:
    kind = None
    (d / 'probe.bin').write_bytes(data[:64]); kind = sniff(d / 'probe.bin'); (d / 'probe.bin').unlink()
    if meta.get('sha1'):
        assert hashlib.sha1(data).hexdigest() == meta['sha1'], f"{it['id']}: download does not match the Commons SHA-1"
    ext = Path(urllib.parse.unquote(meta['originalName'])).suffix.lower() or '.bin'
    (d / f'original{ext}').write_bytes(data)
    meta.update(id=it['id'], retrieved=dt.datetime.now(dt.timezone.utc).strftime('%Y-%m-%dT%H:%MZ'), verifiedBy='tools/clinical_media.py fetch')
    (d / 'meta.json').write_text(json.dumps(meta, indent=1, ensure_ascii=False) + '\n')
    return {'bytes': len(data), 'kind': kind, 'license': meta['license'], 'url': meta['originalUrl']}


def gh(level: str, title: str, msg: str) -> None:
    """GitHub Actions annotation (readable from the checks API without log access)."""
    print(f"::{level} title={title}::{msg.replace(chr(10), ' ')[:900]}", flush=True)


def cmd_fetch(a) -> None:
    m = load(); out = Path(a.out); out.mkdir(parents=True, exist_ok=True); ok = 0; todo = 0
    for it in m.get('pending', []):
        if a.only and it['id'] not in a.only:
            continue
        todo += 1
        try:
            r = fetch_one(it, out); ok += 1
            gh('notice', it['id'], f"fetched {r['bytes']:,} bytes ({r['kind']}), licence {r['license']} from {r['url']}")
        except BaseException as e:  # keep going: one blocked source must not stop the others
            shutil.rmtree(out / it['id'], ignore_errors=True)
            detail = f"{type(e).__name__}: {e}"
            if isinstance(e, urllib.error.HTTPError):
                detail += f" · url {e.url} · body {e.read()[:200]!r}"
            gh('error', it['id'], detail)
    print(f'fetched {ok}/{todo}')
    if todo and not ok:
        raise SystemExit(1)


# ── ingest ──────────────────────────────────────────────────────────────────────────────────────────────────────
def even_pad_scale(w: int, h: int) -> tuple[str, str]:
    """Filter chain + human description. Never crops, never flips."""
    parts, said = [], []
    if w > MAX_W:
        parts.append(f'scale={MAX_W}:-2:flags=lanczos'); said.append(f'downscaled {w}×{h} → {MAX_W} px wide (aspect kept)')
    elif w % 2 or h % 2:
        parts.append('pad=ceil(iw/2)*2:ceil(ih/2)*2:0:0:black'); said.append('padded by one black pixel to even dimensions')
    return (','.join(parts) or 'null'), '; '.join(said)


def ingest_video(it: dict, orig: Path) -> tuple[dict, str, dict]:
    src = probe(orig); vf, how = even_pad_scale(src['w'], src['h'])
    mp4, webm, poster = REAL / f"{it['id']}.mp4", REAL / f"{it['id']}.webm", REAL / f"{it['id']}.jpg"
    common = ['-i', str(orig), '-map', '0:v:0', '-an', '-vf', vf, '-fps_mode', 'passthrough']
    ff(*common, '-c:v', 'libx264', '-crf', '20', '-preset', 'medium', '-pix_fmt', 'yuv420p', '-movflags', '+faststart', '-video_track_timescale', '90000', str(mp4))
    ff(*common, '-c:v', 'libvpx-vp9', '-crf', '30', '-b:v', '0', '-row-mt', '1', '-pix_fmt', 'yuv420p', str(webm))
    t = min(1.0, src['duration'] / 3)
    ff('-ss', f'{t:.2f}', '-i', str(mp4), '-frames:v', '1', '-q:v', '3', str(poster))
    for p in (mp4, webm):
        decodes_clean(p); o = probe(p)
        assert abs(o['duration'] - src['duration']) <= max(0.12, 0.02 * src['duration']), f'{p.name}: duration {o["duration"]} vs source {src["duration"]}'
        assert abs(o['w'] / o['h'] - src['w'] / src['h']) < 0.01, f'{p.name}: aspect ratio changed'
    o = probe(mp4)
    changes = (f"Original {orig.suffix.lstrip('.').upper()} ({src['codec']}, {src['w']}×{src['h']}, {src['fps']} fps, {src['duration']} s) re-encoded to H.264 MP4 (CRF 20) "
               f"and VP9 WebM (CRF 30) at the original frame rate and length; {how + '; ' if how else ''}audio {'removed' if src['audio'] else 'none in the source'}; "
               f"no crop, mirroring, speed change or filtering. Poster = frame at {t:.1f} s.")
    files = {'file': mp4.name, 'webm': webm.name, 'poster': poster.name, 'posterAt': round(t, 2)}
    return files, changes, {'sourceVideo': src, 'mp4': o}


def ingest_image(it: dict, orig: Path, kind: str) -> tuple[dict, str, dict]:
    out = REAL / f"{it['id']}.jpg"
    if kind == 'image/jpeg' and orig.stat().st_size <= 4 * 1024 * 1024:
        shutil.copyfile(orig, out); changes = 'None — the displayed file is the original, byte for byte.'
    else:
        src = probe(orig); vf, how = even_pad_scale(src['w'], src['h'])
        ff('-i', str(orig), '-vf', vf.replace(str(MAX_W), '1600'), '-q:v', '2', str(out))
        changes = f'Converted to JPEG{"; " + how.replace(str(MAX_W), "1600") if how else ""}; no crop, mirroring or filtering.'
    p = probe(out)
    return {'file': out.name}, changes, {'image': {'w': p['w'], 'h': p['h']}}


def credit_line(meta: dict, lic: str) -> str:
    who = meta.get('authors') or 'Unknown author'
    names = [n.strip() for n in re.split(r',| and ', who.replace(', M.D.', '')) if n.strip()]
    sur = lambda n: n.split()[0] if re.fullmatch(r'[A-Z]{1,3}', n.split()[-1]) and len(n.split()) > 1 else n.replace(', M.D.', '').split()[-1]  # 'Gillman L' or 'Nathan C. Shaul'
    lead = sur(names[0]) + ' et al.' if len(names) > 2 else ' & '.join(sur(n) for n in names) if names else who
    year = (re.search(r'\d{4}', meta.get('published') or '') or [''])[0]
    pub = meta.get('publication') or ('Wikimedia Commons' if 'wikimedia' in meta.get('pageUrl', '') else '')
    return ', '.join(x for x in (lead, pub, year) if x) + f' · {lic}'


def ingest_one(it: dict, d: Path, m: dict, accepted: set) -> None:
    meta = json.loads((d / 'meta.json').read_text())
    origs = [p for p in d.iterdir() if p.name.startswith('original')]
    assert len(origs) == 1, f'{d}: expected exactly one original.* file'
    orig = origs[0]; kind = sniff(orig)
    lic = norm_license(meta.get('license', ''))
    assert lic in accepted and 'NC' not in lic and 'ND' not in lic and 'SA' not in lic, f"{it['id']}: licence {meta.get('license')!r} is not accepted"
    assert lic == it['licenseClaimed'], f"{it['id']}: source says {lic}, the bundle claimed {it['licenseClaimed']} — check before using"
    assert meta.get('licenseEvidence') and meta.get('authors') and meta.get('pageUrl'), f"{it['id']}: licence evidence, authors and source page are required"
    assert not meta.get('thirdParty'), f"{it['id']}: the supplementary caption carries a separate credit — needs a manual licence check"
    assert (kind.startswith('image/') and it['type'] == 'xray') or (kind.startswith('video/') and it['type'] == 'ultrasound'), f"{it['id']}: got {kind}"
    try:
        files, changes, qc = ingest_image(it, orig, kind) if kind.startswith('image/') else ingest_video(it, orig)
    except BaseException:
        for p in REAL.glob(it['id'] + '.*'):
            p.unlink()
        raise
    preserved = None
    if changes.startswith('None'):
        preserved = f"imaging/real/{files['file']} (identical to the original)"
    elif orig.stat().st_size <= KEEP_ORIGINAL_MAX:
        keep = SRC / f"{it['id']}-source{orig.suffix.lower()}"; shutil.copyfile(orig, keep); files['original'] = f'source/{keep.name}'
        preserved = f'imaging/real/source/{keep.name}'
    title = meta.get('title') or meta.get('description', '')[:160]
    doi = f" https://doi.org/{meta['doi']}" if meta.get('doi') else ''
    if meta.get('title'):
        vol = f" {meta.get('volume', '')}{':' + meta['firstpage'] if meta.get('firstpage') else ''}" if meta.get('volume') else ''
        esm = f"supplementary item {it['fetch']['esm']}, " if it['fetch'].get('esm') else ''
        src_txt = f"“{meta['title']}”, {meta.get('publication', '')}{vol} ({(meta.get('published') or '')[:4]}),{doi} — {esm}{meta['originalUrl']}"
    else:
        src_txt = f"Wikimedia Commons — {meta['pageUrl']}" + (f" (from{doi})" if doi else '')
    item = {**{k: it[k] for k in ('kind', 'id', 'type', 'modality', 'finding', 'title', 'caption', 'look', 'teach', 'quiz', 'marks')}, **files,
            'license': lic, 'licenseUrl': meta.get('licenseUrl') or LICENSE_URLS[lic], 'author': meta['authors'], 'source': src_txt,
            'credit': credit_line(meta, lic), 'changes': changes,
            'provenance': {'pageUrl': meta['pageUrl'], 'originalUrl': meta['originalUrl'], 'doi': meta.get('doi', ''), 'originalTitle': title,
                           'published': meta.get('published', ''), 'retrieved': meta['retrieved'], 'originalName': urllib.parse.unquote(meta['originalName']),
                           'originalFormat': kind, 'originalBytes': orig.stat().st_size, 'originalSha256': sha256(orig), 'preserved': preserved,
                           'licenseEvidence': meta['licenseEvidence'], 'verifiedBy': meta.get('verifiedBy', 'manual'), 'qc': qc}}
    for k in ('file', 'webm', 'poster', 'original'):
        if isinstance(files.get(k), str):
            item[k + 'Sha256'] = sha256(REAL / files[k])
    m['items'].append(item); m['pending'].remove(it)
    print(f"{it['id']}: ingested ({lic}); {changes}")


def cmd_ingest(a) -> None:
    m = load(); accepted = set(m['accepted']); base = Path(getattr(a, 'from'))
    SRC.mkdir(exist_ok=True); done, failed = [], []
    for it in list(m.get('pending', [])):
        d = base / it['id']
        if (a.only and it['id'] not in a.only) or not (d / 'meta.json').exists():
            continue
        try:
            ingest_one(it, d, m, accepted); done.append(it['id'])
        except (AssertionError, SystemExit, subprocess.CalledProcessError) as e:
            failed.append(it['id']); gh('error', it['id'], f'ingest refused: {e}')
    if not m.get('pending'):
        m.pop('pending', None)
    save(m); write_docs(m)
    print(f'ingested {len(done)}: {", ".join(done) or "nothing"}')
    if failed and not done:
        raise SystemExit(1)


# ── docs ────────────────────────────────────────────────────────────────────────────────────────────────────────
def attribution_md(m: dict) -> str:
    out = ['# Real clinical images — attribution', '', m['about'], '']
    for it in m['items']:
        out += [f"## {it['file']}", f"- {it['title']} — {it['caption']}", f"- Author: {it['author']}", f"- Source: {it['source']}",
                f"- Licence: {it['license']} ({it['licenseUrl']})", f"- Changes: {it['changes']}", '']
    out += ['## Considered and rejected', ''] + [f"- {r['source']}: {r['reason']}" for r in m['rejected']]
    return '\n'.join(out) + '\n'


def asset_manifest_md(m: dict) -> str:
    out = ['# Clinical media — provenance and licensing', '',
           'Generated from `manifest.json` by `tools/clinical_media.py docs`; do not edit by hand. Every file here is checked by',
           '`tools/validate_visual_assets.py` (licence on the accepted list, SHA-256, media signature, no unlisted files).', '',
           f"Accepted licences: {', '.join(m['accepted'])}. Rejected: NC, ND, share-alike, research-only or unclear terms.", '',
           'Adding the pending media: create `imaging/real/fetch-request.txt` on `visual-overhaul` (any text). That starts the GitHub Action',
           '**Fetch clinical media**, which reads each licence from the source — the Commons API or the article page — downloads the',
           'originals, transcodes, validates and commits. Or put `original.<ext>` and a',
           '`meta.json` in `DIR/<id>/` and run `python tools/clinical_media.py ingest --from DIR`. The app reads `manifest.json` at run time,',
           'so ingested media appear without rebuilding `index.html`. Overlay marks (`marks`) are added after viewing the real frames.', '']
    for it in m['items']:
        p = it.get('provenance')
        out += [f"## {it['id']} — {it['title']}", '',
                '| Field | Value |', '|---|---|',
                f"| Local file(s) | {' · '.join('`imaging/real/' + it[k] + '`' for k in ('file', 'webm', 'poster', 'original') if k in it)} |",
                f"| Clinical purpose | {it.get('finding') or it['caption']} ({it['kind']}) |",
                f"| Creator / authors | {it['author']} |", f"| Source | {it['source']} |",
                f"| Licence | {it['license']} — {it['licenseUrl']} |", f"| Modifications | {it['changes']} |",
                f"| Required attribution | {it['author']}. {it['source']}. {it['license']}. |"]
        if p:
            out += [f"| Original title | {p['originalTitle']} |", f"| Source page | {p['pageUrl']} |", f"| Original media URL | {p['originalUrl']} |",
                    f"| DOI | {p['doi'] or '—'} |", f"| Published | {p['published'] or '—'} |", f"| Retrieved | {p['retrieved']} |",
                    f"| Original format | {p['originalFormat']} · {p['originalBytes']:,} bytes · `{p['originalName']}` |",
                    f"| Original SHA-256 | `{p['originalSha256']}` |", f"| Original preserved | {p['preserved'] or 'No — larger than 15 MB; URL and checksum recorded instead'} |",
                    f"| Licence evidence | {p['licenseEvidence']} |", f"| Verified by | {p['verifiedBy']} |"]
        out.append('')
    if m.get('pending'):
        out += ['## Pending — staged, not yet in the app', '',
                'Teaching content is written; the media has not been downloaded and the licence has not been verified from the source.', '',
                '| ID | Finding | Claimed licence | Source page |', '|---|---|---|---|']
        out += [f"| {it['id']} | {it['finding']} | {it['licenseClaimed']} (unverified) | {it['pageUrl']} |" for it in m['pending']]
        out.append('')
    out += ['## Considered and rejected', ''] + [f"- {r['source']}: {r['reason']}" for r in m['rejected']]
    return '\n'.join(out) + '\n'


def assets_json(m: dict) -> str:
    def row(it: dict, status: str) -> dict:
        p = it.get('provenance', {})
        return {'id': it['id'], 'status': status, 'type': it.get('type') or ('xray' if it['kind'] == 'xray' else 'ultrasound'),
                'modality': it.get('modality') or {'xray': 'Chest X-ray', 'lus': 'Lung ultrasound'}.get(it['kind'], it['kind']),
                'finding': it.get('finding') or it['title'], 'license': it.get('license') or it['licenseClaimed'],
                'licenseVerified': status == 'ready', 'sourceUrl': p.get('pageUrl') or it.get('pageUrl') or it.get('source'),
                'localSources': {k: f"imaging/real/{it[k]}" for k in ('original', 'file', 'webm', 'poster') if k in it} if status == 'ready' else {}}
    rows = [row(it, 'ready') for it in m['items']] + [row(it, 'pending') for it in m.get('pending', [])]
    for r in rows:
        ls = r['localSources']
        if 'file' in ls:
            f = ls.pop('file'); ls['mp4' if f.endswith('.mp4') else 'image'] = f
    return json.dumps(rows, indent=1, ensure_ascii=False) + '\n'


DOCS = {'ATTRIBUTION.md': attribution_md, 'ASSET_MANIFEST.md': asset_manifest_md, 'assets.json': assets_json}


def write_docs(m: dict) -> None:
    for name, fn in DOCS.items():
        (REAL / name).write_text(fn(m))


# ── discover (open internet): candidate files on Commons with their licence and description ───────────────────
def commons_query(params: dict) -> list[dict]:
    q = {'action': 'query', 'format': 'json', 'formatversion': '2', 'prop': 'imageinfo', 'iiprop': 'url|size|mime|extmetadata', **params}
    doc = json.loads(get('https://commons.wikimedia.org/w/api.php?' + urllib.parse.urlencode(q)))
    out = []
    for pg in doc.get('query', {}).get('pages', []):
        ii = (pg.get('imageinfo') or [{}])[0]; em = ii.get('extmetadata', {}); val = lambda k: strip_tags(em.get(k, {}).get('value', ''))
        out.append({'title': pg['title'], 'license': norm_license(val('LicenseShortName')) or val('LicenseShortName'), 'mime': ii.get('mime'), 'bytes': ii.get('size'),
                    'width': ii.get('width'), 'height': ii.get('height'), 'duration': ii.get('duration'), 'artist': val('Artist')[:160], 'date': val('DateTimeOriginal')[:40],
                    'description': val('ImageDescription')[:600], 'url': ii.get('descriptionurl')})
    return out


def cmd_discover(a) -> None:
    """Lines in the request file: `discover prefix: File:...` or `discover search: words` → JSON list of candidates."""
    req = Path(a.request).read_text() if Path(a.request).exists() else ''
    jobs = re.findall(r'^discover (prefix|search):\s*(.+?)\s*$', req, re.M)
    if not jobs:
        print('no discover lines'); return
    res = {}
    for kind, term in jobs:
        try:
            params = ({'generator': 'prefixsearch', 'gpssearch': term, 'gpsnamespace': '6', 'gpslimit': '50'} if kind == 'prefix'
                      else {'generator': 'search', 'gsrsearch': term, 'gsrnamespace': '6', 'gsrlimit': '40'})
            res[f'{kind}: {term}'] = commons_query(params)
            gh('notice', 'discover', f"{kind} “{term}”: {len(res[f'{kind}: {term}'])} files")
        except BaseException as e:
            res[f'{kind}: {term}'] = {'error': f'{type(e).__name__}: {e}'}; gh('error', 'discover', f'{term}: {e}')
    Path(a.out).parent.mkdir(parents=True, exist_ok=True); Path(a.out).write_text(json.dumps(res, indent=1, ensure_ascii=False) + '\n')


def main(argv: list[str] | None = None) -> None:
    ap = argparse.ArgumentParser(description=__doc__, formatter_class=argparse.RawDescriptionHelpFormatter)
    sub = ap.add_subparsers(dest='cmd', required=True)
    f = sub.add_parser('fetch'); f.add_argument('--out', required=True); f.add_argument('--only', nargs='*')
    i = sub.add_parser('ingest'); i.add_argument('--from', required=True); i.add_argument('--only', nargs='*')
    sub.add_parser('docs')
    d = sub.add_parser('discover'); d.add_argument('--request', required=True); d.add_argument('--out', required=True)
    a = ap.parse_args(argv)
    {'fetch': cmd_fetch, 'ingest': cmd_ingest, 'discover': cmd_discover, 'docs': lambda _a: write_docs(load())}[a.cmd](a)


if __name__ == '__main__':
    main(sys.argv[1:])
