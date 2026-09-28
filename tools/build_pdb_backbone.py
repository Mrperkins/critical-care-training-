"""Build a compact, browser safe glTF backbone mesh from a PDB mmCIF.

Requires numpy and biopython. Geometry is visual only: no atomistic contacts,
gating, or pump kinetics are inferred from this mesh. Run as:
  python tools/build_pdb_backbone.py /tmp/9RON.cif models/molecular/9ron-backbone.glb
"""

import json
import struct
import sys
from pathlib import Path

import numpy as np
from Bio.PDB import MMCIFParser


def ribbon(coords, center, scale, sides=12):
    vertices, normals, indices = [], [], []
    strip = []

    def flush():
        if len(strip) < 2:
            strip.clear()
            return
        base = len(vertices)
        for i, point in enumerate(strip):
            tangent = strip[min(i + 1, len(strip) - 1)] - strip[max(i - 1, 0)]
            tangent /= np.linalg.norm(tangent)
            reference = np.array([0., 1., 0.])
            if abs(np.dot(reference, tangent)) > .9:
                reference = np.array([1., 0., 0.])
            first = np.cross(tangent, reference)
            first /= np.linalg.norm(first)
            second = np.cross(tangent, first)
            for j in range(sides):
                angle = 2 * np.pi * j / sides
                normal = first * np.cos(angle) + second * np.sin(angle)
                vertices.append(((point + normal * .85 - center) * scale).tolist())
                normals.append(normal.tolist())
            if i:
                for j in range(sides):
                    a = base + (i - 1) * sides + j
                    b = base + (i - 1) * sides + (j + 1) % sides
                    c = base + i * sides + j
                    d = base + i * sides + (j + 1) % sides
                    indices.extend((a, c, b, b, c, d))
        strip.clear()

    for point in coords:
        if strip and np.linalg.norm(point - strip[-1]) > 5.2:
            flush()
        strip.append(point)
    flush()
    return np.array(vertices, dtype='<f4'), np.array(normals, dtype='<f4'), np.array(indices, dtype='<u4')


def build(src, dest):
    structure_id = Path(src).stem.split('-')[0].upper()
    structure = MMCIFParser(QUIET=True).get_structure('pdb', src)
    chains = {}
    for chain in structure[0]:
        positions = [residue['CA'].coord.astype(float) for residue in chain
                     if residue.has_id('CA') and residue['CA'].element == 'C']
        if len(positions) >= 20:
            chains[chain.id] = np.array(positions)
    if not chains:
        raise ValueError('No protein chains with at least 20 C-alpha positions found')
    all_points = np.concatenate(list(chains.values()))
    if not np.isfinite(all_points).all():
        raise ValueError('Non-finite source coordinates')
    center = (all_points.min(axis=0) + all_points.max(axis=0)) / 2
    scale = 2.4 / max(all_points.max(axis=0) - all_points.min(axis=0))
    blob = bytearray()
    buffer_views, accessors, meshes = [], [], []
    palettes = ([('alpha1', [.88, .67, .30, 1]), ('beta1', [.39, .72, .67, 1]), ('FXYD', [.62, .52, .82, 1])]
                if structure_id == '9RON' else
                [(f'chain {chain_id}', [
                    [.95, .58, .38, 1], [.39, .72, .67, 1], [.62, .52, .82, 1], [.75, .80, .42, 1]][i % 4])
                 for i, chain_id in enumerate(chains)])
    materials = [
        {'name': name, 'pbrMetallicRoughness': {'baseColorFactor': color, 'metallicFactor': 0.08, 'roughnessFactor': 0.62}, 'doubleSided': True}
        for name, color in palettes
    ]

    def add_array(data, target, kind, count, bounds=False):
        while len(blob) % 4:
            blob.append(0)
        index = len(buffer_views)
        raw = data.tobytes()
        buffer_views.append({'buffer': 0, 'byteOffset': len(blob), 'byteLength': len(raw), 'target': target})
        blob.extend(raw)
        accessor = {'bufferView': index, 'componentType': 5125 if kind == 'SCALAR' else 5126, 'count': count, 'type': kind}
        if bounds:
            accessor['min'] = data.min(axis=0).tolist()
            accessor['max'] = data.max(axis=0).tolist()
        accessors.append(accessor)
        return len(accessors) - 1

    triangles = 0
    for material, (chain_id, coords) in enumerate(chains.items()):
        v, n, faces = ribbon(coords, center, scale)
        if not len(faces):
            continue
        pos = add_array(v, 34962, 'VEC3', len(v), True)
        normal = add_array(n, 34962, 'VEC3', len(n))
        index = add_array(faces, 34963, 'SCALAR', len(faces))
        meshes.append({'name': f'{structure_id} chain {chain_id}', 'primitives': [{'attributes': {'POSITION': pos, 'NORMAL': normal}, 'indices': index, 'material': material}]})
        triangles += len(faces) // 3
    scene = {'asset': {'version': '2.0', 'generator': 'critical-care-training PDB backbone simplifier'},
             'scene': 0, 'scenes': [{'nodes': list(range(len(meshes)))}],
             'nodes': [{'mesh': i} for i in range(len(meshes))], 'meshes': meshes,
             'materials': materials, 'buffers': [{'byteLength': len(blob)}],
             'bufferViews': buffer_views, 'accessors': accessors}
    json_bytes = json.dumps(scene, separators=(',', ':')).encode()
    json_bytes += b' ' * (-len(json_bytes) % 4)
    blob.extend(b'\0' * (-len(blob) % 4))
    total = 12 + 8 + len(json_bytes) + 8 + len(blob)
    Path(dest).parent.mkdir(parents=True, exist_ok=True)
    Path(dest).write_bytes(struct.pack('<III', 0x46546C67, 2, total) + struct.pack('<II', len(json_bytes), 0x4E4F534A) + json_bytes + struct.pack('<II', len(blob), 0x004E4942) + blob)
    print(f'{len(meshes)} chains, {triangles} triangles, {total} bytes')


if __name__ == '__main__':
    build(sys.argv[1], sys.argv[2])
