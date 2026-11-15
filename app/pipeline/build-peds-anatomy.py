"""
Real pediatric anatomy from expert-contoured CT.

Source: Pediatric-CT-SEG (Jordan P, et al. 2021, The Cancer Imaging Archive, doi:10.7937/TCIA.X0H0-1706),
CC BY 4.0: chest-abdomen-pelvis CT of children aged 5 days to 16 years with up to 29 organs contoured by experts.
This script reads the contours (DICOM RTSTRUCT) for a shortlist of patients, picks for each age band the scan
with the most complete set of organs, and turns every contoured organ into a surface mesh in that child's own
coordinates. Nothing is sculpted, scaled or moved: each organ is where the experts drew it, at its real size.

Usage:
  python build-peds-anatomy.py --download      # fetch the shortlist's RTSTRUCT series (needs open internet)
  python build-peds-anatomy.py                 # build app/public/models/peds-<band>.glb + peds-anatomy.json
"""
import argparse, glob, json, os, re, sys
import numpy as np

HERE = os.path.dirname(os.path.abspath(__file__)); DATA = os.path.join(HERE, '.peds-data'); OUT = os.path.join(HERE, '..', 'public', 'models')
CAND = json.load(open(os.path.join(HERE, 'peds-candidates.json')))
MUST = ['lung_l', 'lung_r', 'heart', 'liver', 'kidney_l', 'kidney_r', 'skin']
# triangle budget per structure (the body surface and skeleton carry the shape; small organs need few)
BUDGET = {'skin': 14000, 'bones': 22000, 'lung_l': 5000, 'lung_r': 5000, 'liver': 5000, 'heart': 4000, 'small_intestine': 6000, 'large_intestine': 6000}
COLOR = {'skin': [222, 184, 160], 'bones': [226, 220, 204], 'lung_l': [222, 150, 150], 'lung_r': [222, 150, 150], 'heart': [176, 48, 48], 'liver': [128, 62, 44], 'spleen': [112, 52, 84],
         'kidney_l': [150, 74, 58], 'kidney_r': [150, 74, 58], 'stomach': [214, 150, 128], 'small_intestine': [222, 170, 140], 'large_intestine': [196, 140, 112], 'bladder': [222, 200, 120],
         'thymus': [232, 196, 150], 'esophagus': [196, 128, 110], 'pancreas': [226, 190, 120], 'spinal_canal': [240, 226, 150], 'gall_bladder': [90, 130, 70], 'duodenum': [214, 160, 130],
         'adrenal_l': [220, 180, 90], 'adrenal_r': [220, 180, 90], 'rectum': [186, 130, 108]}

def norm(name):
    n = re.sub(r'[^a-z0-9]+', '_', name.lower()).strip('_')
    n = re.sub(r'^(left|l)_(.*)$', r'\2_l', n); n = re.sub(r'^(right|r)_(.*)$', r'\2_r', n)
    n = re.sub(r'_(left|lt)$', '_l', n); n = re.sub(r'_(right|rt)$', '_r', n)
    return {'gallbladder': 'gall_bladder', 'lungs_l': 'lung_l', 'lungs_r': 'lung_r', 'body': 'skin', 'external': 'skin', 'bone': 'bones', 'spinal_cord': 'spinal_canal', 'small_bowel': 'small_intestine', 'large_bowel': 'large_intestine', 'femoral_head_l': 'femur_head_l', 'femoral_head_r': 'femur_head_r'}.get(n, n)

def read_rtstruct(path):
    """{organ: [(z_mm, Nx2 xy_mm)]} from one RTSTRUCT file (closed planar contours, axial)."""
    import pydicom
    ds = pydicom.dcmread(path); names = {r.ROINumber: r.ROIName for r in ds.StructureSetROISequence}; out = {}
    for rc in getattr(ds, 'ROIContourSequence', []):
        name = norm(names.get(rc.ReferencedROINumber, '')); cs = []
        for c in getattr(rc, 'ContourSequence', []):
            if getattr(c, 'ContourGeometricType', 'CLOSED_PLANAR') != 'CLOSED_PLANAR': continue
            p = np.asarray(c.ContourData, dtype=float).reshape(-1, 3)
            if len(p) >= 3: cs.append((float(np.round(p[:, 2].mean(), 2)), p[:, :2]))
        if name and cs: out[name] = cs
    return out

def spacing(structs):
    z = np.unique(np.concatenate([[c[0] for c in cs] for cs in structs.values()])); d = np.diff(z); d = d[d > 0.2]
    return float(np.median(d)) if len(d) else 2.0

def volume_ml(cs, dz):
    a = 0.0
    for _, p in cs: x, y = p[:, 0], p[:, 1]; a += abs(np.dot(x, np.roll(y, 1)) - np.dot(y, np.roll(x, 1))) / 2
    return a * dz / 1000.0

def mesh(cs, dz, target, px=None):
    """Planar contours -> voxel mask (even-odd fill, so holes stay holes) -> smoothed marching-cubes surface in mm."""
    from skimage.draw import polygon
    from skimage.measure import marching_cubes
    from scipy.ndimage import gaussian_filter, zoom
    import trimesh
    pts = np.concatenate([p for _, p in cs]); lo = pts.min(0) - 4; hi = pts.max(0) + 4
    ext = float(max(hi - lo)); px = px or (1.0 if ext < 140 else 1.5 if ext < 260 else 2.0)
    zs = np.array([c[0] for c in cs]); z0 = zs.min() - 2 * dz; nz = int(round((zs.max() - zs.min()) / dz)) + 5
    nx = int(np.ceil((hi[0] - lo[0]) / px)) + 1; ny = int(np.ceil((hi[1] - lo[1]) / px)) + 1
    vol = np.zeros((nz, ny, nx), dtype=bool)
    for z, p in cs:
        k = int(round((z - z0) / dz)); rr, cc = polygon((p[:, 1] - lo[1]) / px, (p[:, 0] - lo[0]) / px, (ny, nx)); vol[k, rr, cc] ^= True
    f = max(1, int(round(dz / px)))                                  # resample between slices so the surface is not stair-stepped
    v = zoom(vol.astype(np.float32), (f, 1, 1), order=1); v = gaussian_filter(v, (0.9 * f / 2 + 0.4, 1.0, 1.0))
    if v.max() < 0.5: return None
    vs, fs, _, _ = marching_cubes(v, 0.5, spacing=(dz / f, px, px))
    m = trimesh.Trimesh(vertices=np.c_[vs[:, 2] + lo[0], vs[:, 1] + lo[1], vs[:, 0] + z0], faces=fs, process=True)
    if len(m.faces) > target:
        try: m = m.simplify_quadric_decimation(face_count=target)
        except Exception as e: print('  decimation skipped:', e)
    trimesh.smoothing.filter_taubin(m, lamb=0.5, nu=-0.53, iterations=8)
    return m

def build(structs, band, who):
    import trimesh
    dz = spacing(structs); sc = trimesh.Scene(); info = {}
    ref = structs.get('skin') or max(structs.values(), key=len); rp = np.concatenate([p for _, p in ref]); rz = [c[0] for c in ref]
    centre = np.array([rp[:, 0].mean(), rp[:, 1].mean(), min(rz)])
    for name, cs in sorted(structs.items()):
        m = mesh(cs, dz, BUDGET.get(name, 2500))
        if m is None or len(m.faces) < 20: continue
        # patient (x: to the patient's left, y: to the back, z: to the head), mm -> app (x right of screen = patient left, y up, z to the front), meters
        v = (m.vertices - centre) / 1000.0; m.vertices = np.c_[v[:, 0], v[:, 2], -v[:, 1]]; m.fix_normals()
        col = COLOR.get(name, [200, 170, 150]); m.visual = trimesh.visual.ColorVisuals(m, vertex_colors=np.tile(col + [255], (len(m.vertices), 1)))
        sc.add_geometry(m, node_name=name, geom_name=name)
        info[name] = {'ml': round(volume_ml(cs, dz), 1), 'slices': len({c[0] for c in cs}), 'tris': int(len(m.faces)), 'bounds_cm': np.round((m.bounds[1] - m.bounds[0]) * 100, 1).tolist()}
    os.makedirs(OUT, exist_ok=True); path = os.path.join(OUT, f'peds-{band}.glb'); sc.export(path)
    return {'band': band, **who, 'slice_mm': round(dz, 2), 'structures': info, 'bytes': os.path.getsize(path)}

def download():
    from idc_index import IDCClient
    uids = [x['rtstruct'] for v in CAND.values() for x in v]; os.makedirs(DATA, exist_ok=True)
    IDCClient().download_from_selection(seriesInstanceUID=uids, downloadDir=DATA, dirTemplate='%PatientID')

def main():
    ap = argparse.ArgumentParser(); ap.add_argument('--download', action='store_true'); a = ap.parse_args()
    if a.download: download()
    report = {'source': 'Pediatric-CT-SEG, The Cancer Imaging Archive, doi:10.7937/TCIA.X0H0-1706', 'license': 'CC BY 4.0', 'models': [], 'candidates': []}
    for band, cands in CAND.items():
        best = None
        for c in cands:
            files = glob.glob(os.path.join(DATA, c['patient'], '**', '*.dcm'), recursive=True)
            if not files: print('missing', c['patient']); continue
            try: s = read_rtstruct(files[0])
            except Exception as e: print('unreadable', c['patient'], e); continue
            zs = [z for cs in s.values() for z, _ in cs]; full = all(k in s for k in MUST)
            row = {**c, 'band': band, 'n': len(s), 'complete': full, 'span_mm': round(max(zs) - min(zs), 1), 'names': sorted(s)}
            report['candidates'].append(row); print(band, c['patient'], c['age'], c['sex'], 'structures', len(s), 'complete', full, 'span', row['span_mm'])
            score = (full, len(s), row['span_mm'])
            if best is None or score > best[0]: best = (score, c, s)
        if best is None: print('no usable scan for', band); continue
        _, c, s = best; print('->', band, 'uses', c['patient'])
        report['models'].append(build(s, band, {'patient': c['patient'], 'age': c['age'], 'sex': c['sex']}))
    json.dump(report, open(os.path.join(OUT, 'peds-anatomy.json'), 'w'), indent=1)
    if not report['models']: sys.exit('no models were built')

if __name__ == '__main__': main()
