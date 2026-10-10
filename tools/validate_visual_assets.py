"""Validate shipped molecular GLBs, their manifests, and the inline app syntax."""

import hashlib
import json
from pathlib import Path
import re
import struct
import subprocess
import tempfile

import numpy as np

ROOT = Path(__file__).resolve().parents[1]


def validate_glb(target):
    path = ROOT / target['localPath']
    data = path.read_bytes()
    assert struct.unpack_from('<III', data) == (0x46546C67, 2, len(data)), path
    size, kind = struct.unpack_from('<II', data, 12)
    assert kind == 0x4E4F534A, path
    doc = json.loads(data[20:20 + size])
    binary_size, kind = struct.unpack_from('<II', data, 20 + size)
    binary = data[28 + size:]
    assert kind == 0x004E4942 and len(binary) == binary_size, path
    assert not doc.get('images') and not doc['buffers'][0].get('uri'), path
    assert hashlib.sha256(data).hexdigest() == target['sha256'], path
    assert len(doc['meshes']) == target['expectedChainCount'], path

    def array(accessor_id):
        accessor = doc['accessors'][accessor_id]
        view = doc['bufferViews'][accessor['bufferView']]
        count = accessor['count'] * {'SCALAR': 1, 'VEC3': 3}[accessor['type']]
        dtype = {5126: '<f4', 5125: '<u4'}[accessor['componentType']]
        offset = view.get('byteOffset', 0) + accessor.get('byteOffset', 0)
        assert offset + count * 4 <= len(binary), path
        result = np.frombuffer(binary, dtype=dtype, count=count, offset=offset)
        assert np.isfinite(result).all(), path
        return result

    triangles = 0
    for mesh in doc['meshes']:
        assert mesh['name'].startswith(target['pdb'] + ' chain '), path
        for primitive in mesh['primitives']:
            positions = array(primitive['attributes']['POSITION']).reshape(-1, 3)
            normals = array(primitive['attributes']['NORMAL']).reshape(-1, 3)
            indices = array(primitive['indices'])
            assert len(positions) == len(normals), path
            assert indices.max() < len(positions), path
            assert len(indices) % 3 == 0, path
            assert np.allclose(np.linalg.norm(normals, axis=1), 1, atol=1e-5), path
            assert primitive['material'] < len(doc['materials']), path
            triangles += len(indices) // 3
    assert triangles == target['derivedMeshTriangles'], path
    assert 20000 <= triangles <= 60000, path
    print(f"{target['pdb']}: {len(doc['meshes'])} chains, {triangles:,} triangles, integrity valid")


def main():
    manifest = json.loads((ROOT / 'models/molecular.assets.json').read_text())
    for target in manifest['targets'].values():
        if target.get('localPath'):
            validate_glb(target)
    html = (ROOT / 'index.html').read_text()
    assert 'var sw=var sw=' not in html, 'Duplicate declaration regression'
    scripts = re.findall(r'<script(?:\s[^>]*)?>(.*?)</script>', html, re.S)
    with tempfile.TemporaryDirectory() as folder:
        for i, script in enumerate(scripts):
            if not script.strip():
                continue
            path = Path(folder) / f'inline-{i}.js'
            path.write_text(script)
            result = subprocess.run(['node', '--check', str(path)], capture_output=True, text=True)
            if result.returncode:
                raise AssertionError(result.stderr[-1200:])
    assert '__CCCameraTargets' in html, 'semantic camera registry missing from the bundle'
    for ref in ('models/cell/markdragan-human-cell/cell.opt.glb', 'models/molecular/'):
        assert ref in html, f'loader for {ref} missing from the bundle'
    print('App syntax and malformed-replacement guard passed')


def validate_real_images():
    """Real clinical media: licence on the whitelist, checksums, real media signatures, provenance, docs in sync."""
    import importlib.util
    spec = importlib.util.spec_from_file_location('clinical_media', Path(__file__).resolve().parent / 'clinical_media.py')
    cm = importlib.util.module_from_spec(spec); spec.loader.exec_module(cm)
    base = ROOT / 'imaging' / 'real'
    man = json.loads((base / 'manifest.json').read_text())
    ok = set(man['accepted'])
    listed = set()
    for it in man['items']:
        assert it['license'] in ok, f"{it['file']}: licence {it['license']} not accepted"
        assert not re.search(r'\b(NC|ND|SA)\b', it['license']), it['file']
        for key in ('author', 'source', 'licenseUrl', 'changes', 'caption'):
            assert it.get(key), f"{it['file']}: missing {key}"
        if 'provenance' in it:  # media ingested by tools/clinical_media.py
            p = it['provenance']
            for key in ('pageUrl', 'originalUrl', 'retrieved', 'originalFormat', 'originalSha256', 'licenseEvidence', 'verifiedBy'):
                assert p.get(key), f"{it['id']}: provenance missing {key}"
            q = it.get('quiz')
            assert it.get('teach') and q and 0 <= q['answer'] < len(q['options']), f"{it['id']}: teaching content incomplete"
            if it['file'].endswith('.mp4'):
                assert it.get('webm') and it.get('poster'), f"{it['id']}: MP4 needs a WebM and a poster"
        for k in ('file', 'poster', 'webm', 'original'):
            if k in it:
                path = base / it[k]
                data = path.read_bytes()
                assert hashlib.sha256(data).hexdigest() == it[k + 'Sha256'], f'{it[k]}: checksum mismatch'
                kind = cm.sniff(path)
                want = {'.jpg': 'image/jpeg', '.jpeg': 'image/jpeg', '.png': 'image/png', '.mp4': 'video/mp4', '.webm': 'video/webm', '.ogv': 'video/ogg', '.avi': 'video/x-msvideo'}[path.suffix.lower()]
                assert kind == want, f'{it[k]}: bytes are {kind}, extension says {want}'
                listed.add(it[k])
    for it in man.get('pending', []):
        assert it['licenseClaimed'] in ok, f"{it['id']}: claimed licence not accepted"
        assert it.get('pageUrl') and it.get('fetch') and it.get('quiz') and it.get('teach'), f"{it['id']}: pending entry incomplete"
        assert not any(base.glob(it['id'] + '.*')), f"{it['id']}: media on disk but still pending — run the ingest"
    media = ('.jpg', '.jpeg', '.png', '.mp4', '.webm', '.gif', '.ogv', '.avi', '.mov')
    on_disk = {p.name for p in base.iterdir() if p.suffix.lower() in media}
    src = base / 'source'
    if src.exists():
        on_disk |= {'source/' + p.name for p in src.iterdir() if p.suffix.lower() in media}  # *.fetch.json = fetch records
    assert on_disk == listed, f'unlisted or missing real images: {sorted(on_disk ^ listed)}'
    for name, fn in cm.DOCS.items():
        assert (base / name).read_text() == fn(man), f'imaging/real/{name} is stale — run: python tools/clinical_media.py docs'
    print(f'Real images: {len(man["items"])} items ({len(man.get("pending", []))} pending), licences, checksums, signatures and docs valid')


if __name__ == '__main__':
    main()
    validate_real_images()
