"""Convert the user-supplied lazarys USDZ to a self-contained glTF 2.0 GLB.

Requirements: usd-core==26.8, numpy, Pillow. No decimation or synthetic meshes.
Usage: python pipeline/convert-ventilator.py Medical_Ventilator.usdz
"""
import hashlib
import io
import json
from pathlib import Path
import struct
import sys
import zipfile

import numpy as np
from PIL import Image
from pxr import Usd, UsdGeom, UsdShade

source = Path(sys.argv[1]).resolve()
out = Path(__file__).resolve().parents[1] / 'public/models'
stage = Usd.Stage.Open(str(source))
archive = zipfile.ZipFile(source)
cache = UsdGeom.XformCache()
data = bytearray()
gltf = {'asset': {'version': '2.0', 'generator': 'Critical Care Training USDZ converter'},
        'buffers': [], 'bufferViews': [], 'accessors': [], 'images': [], 'textures': [],
        'samplers': [{'magFilter': 9729, 'minFilter': 9987, 'wrapS': 10497, 'wrapT': 10497}],
        'materials': [], 'meshes': [], 'nodes': [], 'scenes': [{'nodes': []}], 'scene': 0}

def view(raw, target=None):
    while len(data) % 4:
        data.append(0)
    item = {'buffer': 0, 'byteOffset': len(data), 'byteLength': len(raw)}
    if target:
        item['target'] = target
    gltf['bufferViews'].append(item)
    data.extend(raw)
    return len(gltf['bufferViews']) - 1

def accessor(a, kind, component=5126):
    a = np.ascontiguousarray(a, dtype='<u4' if component == 5125 else '<f4')
    item = {'bufferView': view(a.tobytes(), 34963 if component == 5125 else 34962),
            'componentType': component, 'count': len(a), 'type': kind}
    if kind == 'VEC3':
        item.update(min=a.min(0).tolist(), max=a.max(0).tolist())
    gltf['accessors'].append(item)
    return len(gltf['accessors']) - 1

def texture(raw, mime):
    gltf['images'].append({'bufferView': view(raw), 'mimeType': mime})
    gltf['textures'].append({'source': len(gltf['images']) - 1, 'sampler': 0})
    return {'index': len(gltf['textures']) - 1}

def png(im):
    b = io.BytesIO()
    im.save(b, format='PNG')
    return b.getvalue()

def image_for(material, slot):
    prim = stage.GetPrimAtPath(str(material.GetPath()) + '/tex_' + slot)
    asset = prim.GetAttribute('inputs:file').Get()
    return archive.read(asset.path)

vertices = triangles = 0
for prim in stage.Traverse():
    if prim.GetTypeName() != 'Mesh':
        continue
    mesh = UsdGeom.Mesh(prim)
    material = UsdShade.MaterialBindingAPI(prim).ComputeBoundMaterial()[0]
    name = str(material.GetPath()).split('/')[-1]
    base_raw = image_for(material, 'base')
    base = Image.open(io.BytesIO(base_raw))
    rough = Image.open(io.BytesIO(image_for(material, 'roughness'))).convert('L')
    metal = Image.open(io.BytesIO(image_for(material, 'metallic'))).convert('L').resize(rough.size)
    # glTF packs roughness in G and metallic in B, preserving each source map.
    mr = Image.merge('RGB', (Image.new('L', rough.size, 255), rough, metal))
    mat = {'name': name, 'pbrMetallicRoughness': {
        'baseColorTexture': texture(base_raw, 'image/png' if base_raw[:4] == b'\x89PNG' else 'image/jpeg'),
        'metallicFactor': 1, 'roughnessFactor': 1,
        'metallicRoughnessTexture': texture(png(mr), 'image/png')},
        'normalTexture': texture(image_for(material, 'normal'), 'image/jpeg'),
        'occlusionTexture': texture(image_for(material, 'occlusion'), 'image/jpeg')}
    if base.mode == 'RGBA':
        mat['alphaMode'] = 'BLEND'
    gltf['materials'].append(mat)
    pts = np.asarray(mesh.GetPointsAttr().Get(), dtype=float)
    transform = np.asarray(cache.GetLocalToWorldTransform(prim), dtype=float)
    pts = (np.c_[pts, np.ones(len(pts))] @ transform)[:, :3]
    # USD centimeters -> meters. Leave source origin and axes intact for repeatability.
    pts *= UsdGeom.GetStageMetersPerUnit(stage)
    normals = np.asarray(mesh.GetNormalsAttr().Get(), dtype=float)
    assert mesh.GetNormalsInterpolation() == 'vertex'
    normals = normals @ np.linalg.inv(transform[:3, :3]).T
    normals /= np.linalg.norm(normals, axis=1)[:, None]
    uv = np.asarray(UsdGeom.PrimvarsAPI(prim).GetPrimvar('st0').ComputeFlattened(), dtype=float)
    assert len(uv) == len(pts)
    uv[:, 1] = 1 - uv[:, 1]  # USD lower-left -> glTF upper-left texture origin.
    counts = np.asarray(mesh.GetFaceVertexCountsAttr().Get())
    assert np.all(counts == 3), 'Source must already be triangulated'
    indices = np.asarray(mesh.GetFaceVertexIndicesAttr().Get(), dtype=np.uint32)
    assert mesh.GetOrientationAttr().Get() == 'rightHanded'
    assert np.all(np.isfinite(pts)) and indices.max() < len(pts)
    attrs = {'POSITION': accessor(pts, 'VEC3'), 'NORMAL': accessor(normals, 'VEC3'),
             'TEXCOORD_0': accessor(uv, 'VEC2')}
    gltf['meshes'].append({'name': name, 'primitives': [{'attributes': attrs,
        'indices': accessor(indices, 'SCALAR', 5125), 'material': len(gltf['materials']) - 1}]})
    gltf['nodes'].append({'name': name, 'mesh': len(gltf['meshes']) - 1})
    gltf['scenes'][0]['nodes'].append(len(gltf['nodes']) - 1)
    vertices += len(pts)
    triangles += len(indices) // 3

gltf['buffers'] = [{'byteLength': len(data)}]
meta = json.dumps(gltf, separators=(',', ':')).encode()
meta += b' ' * (-len(meta) % 4)
data.extend(b'\0' * (-len(data) % 4))
glb = struct.pack('<III', 0x46546c67, 2, 28 + len(meta) + len(data))
glb += struct.pack('<II', len(meta), 0x4e4f534a) + meta
glb += struct.pack('<II', len(data), 0x004e4942) + data
out.mkdir(exist_ok=True)
(out / 'medical-ventilator.glb').write_bytes(glb)
provenance = {'title': 'Medical Ventilator', 'creator': 'lazarys',
    'source': 'https://sketchfab.com/3d-models/medical-ventilator-a03a99fab9314aab96fd41ec69acf1a3',
    'sourceShortUrl': 'https://skfb.ly/oSHxK', 'license': 'CC BY 4.0',
    'licenseUrl': 'https://creativecommons.org/licenses/by/4.0/',
    'sourceFile': source.name, 'sourceSha256': hashlib.sha256(source.read_bytes()).hexdigest(),
    'changes': 'Converted user-supplied USDZ to GLB; baked world transforms and centimeter units; inverted UV V for glTF; packed source metalness and roughness maps. Original triangles, normals and 1024px textures retained. No decimation or generated geometry. Application adds a live educational display.',
    'vertices': vertices, 'triangles': triangles,
    'reference': 'Visual training equipment; authored device markings and hose routing are not a clinical device specification.'}
(out / 'medical-ventilator.provenance.json').write_text(json.dumps(provenance, indent=2) + '\n')
print(f'{vertices} vertices, {triangles} triangles, {len(glb)} bytes')
