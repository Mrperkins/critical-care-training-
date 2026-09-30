"""Offline self-test for tools/clinical_media.py: source parsers on fixture responses, then a full ingest of
throwaway test-pattern media into a temporary copy of imaging/real/ (nothing in the repo is touched).

    python tools/test_clinical_media.py
"""
import json
import os
import shutil
import subprocess
import sys
import tempfile
from pathlib import Path

HERE = Path(__file__).resolve().parent

COMMONS = {'query': {'pages': [{'title': 'File:X.jpg', 'imageinfo': [{
    'url': 'https://upload.wikimedia.org/wikipedia/commons/c/c6/X.jpg', 'descriptionurl': 'https://commons.wikimedia.org/wiki/File:X.jpg',
    'sha1': 'abc', 'size': 1000, 'mime': 'image/jpeg', 'width': 800, 'height': 1000,
    'extmetadata': {'LicenseShortName': {'value': 'CC0'}, 'LicenseUrl': {'value': 'http://creativecommons.org/publicdomain/zero/1.0/deed.en'},
                    'UsageTerms': {'value': 'Creative Commons Zero, Public Domain Dedication'},
                    'Artist': {'value': '<a href="//commons.wikimedia.org/wiki/User:Someone">A. Person</a>'},
                    'DateTimeOriginal': {'value': '2020-01-02'}, 'ImageDescription': {'value': 'An <b>expiratory</b> film'}}}]}]}}

SPRINGER = '''<html><head>
<meta name="citation_title" content="Point-of-care ultrasound to evaluate volume status">
<meta name="citation_author" content="Alex One"><meta name="citation_author" content="Bo Two"><meta name="citation_author" content="Cy Three">
<meta name="citation_journal_title" content="Some Journal"><meta name="citation_publication_date" content="2026/03/01">
<meta name="citation_doi" content="10.1186/s44348-026-00078-5"><meta name="citation_volume" content="4"><meta name="citation_firstpage" content="12">
</head><body>
<div id="MOESM1"><h3><a href="https://static-content.springer.com/esm/art%3A10.1186%2Fs44348-026-00078-5/MediaObjects/44348_2026_78_MOESM1_ESM.avi">Supplementary Material 1</a></h3>
<p>Video S1. IVC followed to the right atrium.</p></div>
<div id="MOESM2"><h3><a href="https://static-content.springer.com/esm/art%3A10.1186%2Fs44348-026-00078-5/MediaObjects/44348_2026_78_MOESM2_ESM.avi">Supplementary Material 2</a></h3>
<p>Video S2. IJV and carotid; the vein collapses.</p></div>
<p>Rights and permissions</p><p>Open Access This article is licensed under a Creative Commons Attribution 4.0 International License, which permits use.
<a href="http://creativecommons.org/licenses/by/4.0/">http://creativecommons.org/licenses/by/4.0/</a></p></body></html>'''


def check(cond, msg):
    if not cond:
        raise SystemExit('FAIL: ' + msg)
    print('ok  ', msg)


def main():
    tmp = Path(tempfile.mkdtemp())
    try:
        root = tmp / 'repo'; (root / 'imaging').mkdir(parents=True)
        shutil.copytree(HERE.parent / 'imaging' / 'real', root / 'imaging' / 'real')
        os.environ['CLINICAL_MEDIA_ROOT'] = str(root)
        sys.path.insert(0, str(HERE)); import clinical_media as cm  # noqa: E402

        check(cm.norm_license('CC0') == 'CC0' and cm.norm_license('cc-by-2.0') == 'CC BY 2.0' and cm.norm_license('CC BY 4.0 International') == 'CC BY 4.0', 'licence names normalise')
        check(cm.norm_license('https://creativecommons.org/licenses/by-nc/4.0/') == 'CC BY NC 4.0', 'NC licence URL is recognised as NC')
        c = cm.parse_commons(COMMONS, 'API', 'File:X.jpg')
        check(c['license'] == 'CC0' and c['authors'] == 'A. Person' and 'LicenseShortName = “CC0”' in c['licenseEvidence'], 'Commons metadata parsed with evidence')
        s1 = cm.parse_springer(SPRINGER, 'https://link.springer.com/article/10.1186/s44348-026-00078-5', 1)
        s2 = cm.parse_springer(SPRINGER, 'https://link.springer.com/article/10.1186/s44348-026-00078-5', 2)
        check(s1['license'] == 'CC BY 4.0' and s1['originalUrl'].endswith('MOESM1_ESM.avi') and s2['originalUrl'].endswith('MOESM2_ESM.avi'), 'Springer licence and supplementary links parsed')
        check('Video S1' in s1['description'] and 'Video S2' in s2['description'] and not s1['thirdParty'], 'supplementary captions found, no third-party credit')
        check(cm.parse_springer(SPRINGER.replace('Video S2.', 'Video S2 courtesy of X.'), 'u', 2)['thirdParty'], 'third-party credit in a caption is flagged')

        page = tmp / 'page.jpg'; page.write_text('<!DOCTYPE html><html>error</html>')
        try:
            cm.sniff(page); check(False, 'HTML saved as .jpg is rejected')
        except SystemExit:
            check(True, 'HTML saved as .jpg is rejected')

        # throwaway test-pattern media standing in for the downloads (never shipped)
        src = tmp / 'dl'
        for pid, kind in (('ptx-expiratory', 'img'), ('fast-ruq-positive', 'ogv'), ('ivc-2026-video-s1', 'avi')):
            d = src / pid; d.mkdir(parents=True)
            if kind == 'img':
                subprocess.run(['ffmpeg', '-v', 'error', '-f', 'lavfi', '-i', 'testsrc=s=801x1001', '-frames:v', '1', str(d / 'original.jpg')], check=True)
                meta = {**c, 'license': 'CC0'}
            else:
                codec = ['-c:v', 'libtheora'] if kind == 'ogv' else ['-c:v', 'mjpeg']
                subprocess.run(['ffmpeg', '-v', 'error', '-f', 'lavfi', '-i', 'testsrc=s=641x481:r=25:d=3', '-f', 'lavfi', '-i', 'sine=d=3', '-shortest', *codec,
                                str(d / f'original.{kind}')], check=True)
                meta = {**(s1 if kind == 'avi' else c), 'license': 'CC BY 2.0' if kind == 'ogv' else 'CC BY 4.0'}
            meta.update(id=pid, retrieved='2026-09-30T00:00Z', originalName=f'original.{kind}', sha1=None)
            (d / 'meta.json').write_text(json.dumps(meta))
        # a licence mismatch must stop ingest
        bad = src / 'ijv-2026-video-s2'; shutil.copytree(src / 'ivc-2026-video-s1', bad)
        mj = json.loads((bad / 'meta.json').read_text()); mj['license'] = 'CC BY-SA 4.0'; (bad / 'meta.json').write_text(json.dumps(mj))
        try:
            cm.main(['ingest', '--from', str(src), '--only', 'ijv-2026-video-s2']); check(False, 'share-alike licence is refused')
        except SystemExit:
            check(True, 'share-alike licence is refused')

        cm.main(['ingest', '--from', str(src), '--only', 'ptx-expiratory', 'fast-ruq-positive', 'ivc-2026-video-s1'])
        m = json.loads((root / 'imaging/real/manifest.json').read_text())
        ids = {i['id']: i for i in m['items']}
        check({'ptx-expiratory', 'fast-ruq-positive', 'ivc-2026-video-s1'} <= set(ids) and [p['id'] for p in m['pending']] == ['ijv-2026-video-s2'], 'ingested items promoted, the refused one stays pending')
        check(ids['ptx-expiratory']['changes'].startswith('None') and ids['ptx-expiratory']['provenance']['preserved'], 'small JPEG shipped byte-for-byte')
        f = ids['fast-ruq-positive']; q = f['provenance']['qc']
        check(f['file'].endswith('.mp4') and f['webm'].endswith('.webm') and f['poster'].endswith('.jpg') and f.get('original', '').startswith('source/'), 'MP4, WebM, poster and preserved source')
        check(q['mp4']['w'] == 642 and q['mp4']['h'] == 482 and abs(q['mp4']['duration'] - 3) < 0.15 and not q['mp4']['audio'], 'odd size padded (not cropped), length kept, audio dropped')
        check('no crop, mirroring' in f['changes'] and f['credit'].endswith('CC BY 2.0'), 'changes and credit recorded')
        sys.argv = ['v']; import importlib.util
        spec = importlib.util.spec_from_file_location('v', HERE / 'validate_visual_assets.py'); v = importlib.util.module_from_spec(spec); spec.loader.exec_module(v)
        v.ROOT = root; v.validate_real_images()
        check(True, 'validator accepts the ingested set')
        (root / 'imaging/real/stray.webm').write_bytes(b'x')
        try:
            v.validate_real_images(); check(False, 'validator rejects unlisted media')
        except AssertionError:
            check(True, 'validator rejects unlisted media')
    finally:
        shutil.rmtree(tmp)
    print('clinical media self-test passed')


if __name__ == '__main__':
    main()
