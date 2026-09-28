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
    for ref in ('models/cell/markdragan-human-cell/cell.glb', 'models/molecular/'):
        assert ref in html, f'loader for {ref} missing from the bundle'
    print('App syntax and malformed-replacement guard passed')


if __name__ == '__main__':
    main()
