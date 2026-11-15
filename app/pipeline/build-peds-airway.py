"""
The real airway of the three children in the pediatric anatomy models, taken from their own CT images.

Air is unambiguous on CT, so the airway is not drawn by anyone: it is every voxel of air inside the body that is
connected to the windpipe and is not lung. Output: public/models/peds-<band>-airway.glb in the same coordinates as
peds-<band>.glb, measurements in peds-airway.json, and a side-view picture per scan in pipeline/previews so the
result can be checked by eye. Source and license as build-peds-anatomy.py (Pediatric-CT-SEG, CC BY 4.0).
"""
import glob, importlib.util, json, os, sys
import numpy as np
HERE = os.path.dirname(os.path.abspath(__file__)); DATA = os.path.join(HERE, '.peds-data'); OUT = os.path.join(HERE, '..', 'public', 'models'); PREV = os.path.join(HERE, 'previews')
sp = importlib.util.spec_from_file_location('anat', os.path.join(HERE, 'build-peds-anatomy.py')); anat = importlib.util.module_from_spec(sp); sp.loader.exec_module(anat)
SER = json.load(open(os.path.join(HERE, 'peds-airway-series.json'))); CAND = {x['patient']: x for v in anat.CAND.values() for x in v}

def load_ct(folder):
    import pydicom
    ds = [pydicom.dcmread(f) for f in glob.glob(os.path.join(folder, '**', '*.dcm'), recursive=True)]
    ds = [d for d in ds if getattr(d, 'Modality', '') == 'CT' and hasattr(d, 'ImagePositionPatient')]; ds.sort(key=lambda d: float(d.ImagePositionPatient[2]))
    hu = np.stack([d.pixel_array.astype(np.float32) * float(getattr(d, 'RescaleSlope', 1)) + float(getattr(d, 'RescaleIntercept', 0)) for d in ds])
    z = np.array([float(d.ImagePositionPatient[2]) for d in ds]); x0, y0 = map(float, ds[0].ImagePositionPatient[:2]); dy, dx = map(float, ds[0].PixelSpacing)
    return hu, z, (x0, y0, dx, dy)

def lung_mask(structs, shape, z, geo):
    from skimage.draw import polygon
    x0, y0, dx, dy = geo; m = np.zeros(shape, dtype=bool)
    for k in ('lung_l', 'lung_r'):
        for zz, p in structs.get(k, []):
            i = int(np.argmin(np.abs(z - zz)))
            if abs(z[i] - zz) > 3: continue
            rr, cc = polygon((p[:, 1] - y0) / dy, (p[:, 0] - x0) / dx, shape[1:]); m[i, rr, cc] = True
    return m

def airway(hu, z, geo, lungs):
    """Air inside the body, joined to the windpipe, outside the lungs."""
    from scipy import ndimage as ndi
    dz = float(np.median(np.diff(z))); x0, y0, dx, dy = geo
    body = np.zeros(hu.shape, dtype=bool)
    for i in range(len(hu)):
        lab, n = ndi.label(hu[i] > -350)
        if n: body[i] = ndi.binary_fill_holes(lab == (np.argmax(np.bincount(lab.ravel())[1:]) + 1))
    inner = ndi.binary_erosion(body, structure=np.ones((1, 3, 3), bool), iterations=2)
    apex_i = int(np.nonzero(lungs.any((1, 2)))[0].max()) if lungs is not None and lungs.any() else None
    if apex_i is None or z[-1] - z[apex_i] < 4: return None, {}                 # no lung apex in the scan: it starts below the windpipe
    ys, xs = np.nonzero(body.any(0)); cx = xs.mean(); width = xs.max() - xs.min(); a = None
    for thr in (-800, -700, -600):                                              # a small child's windpipe is a few voxels wide: allow for blurring
        air = (hu < thr) & inner
        if lungs is not None: air &= ~ndi.binary_dilation(lungs, structure=np.ones((1, 3, 3), bool), iterations=1)
        lab, n = ndi.label(air)
        if not n: continue
        # seed: just above the lung apices the only central pocket of air is the windpipe
        votes = {}
        for i in range(apex_i, min(len(z), apex_i + max(2, int(12 / dz)))):
            l2, m = ndi.label(air[i])
            for k in range(1, m + 1):
                blob = l2 == k; area = blob.sum() * dx * dy; by, bx = np.nonzero(blob)
                if 6 <= area <= 400 and abs(bx.mean() - cx) < 0.15 * width: g = int(lab[i][blob][0]); votes[g] = votes.get(g, 0) + 1
        if not votes: continue
        k = max(votes, key=votes.get); cand = lab == k; ml = cand.sum() * dx * dy * dz / 1000
        if ml > 60: continue                                                    # leaked into a lung: not usable at this threshold
        a = cand; break
    if a is None: return None, {}
    # measurements: walk down from the top; the carina is where one lumen becomes two for good
    area = a.sum((1, 2)) * dx * dy; idx = np.nonzero(area)[0]; top, bot = idx.max(), idx.min(); carina = None
    for i in range(top, bot - 1, -1):
        _, c = ndi.label(a[i])
        if c >= 2 and i - 2 >= bot and ndi.label(a[i - 1])[1] >= 2 and ndi.label(a[i - 2])[1] >= 2: carina = i; break
    tr = area[carina + 1: top + 1] if carina is not None else area[idx]
    d = 2 * np.sqrt(np.median(tr[tr > 0]) / np.pi) if len(tr) else 0
    info = {'slice_mm': round(dz, 2), 'airway_ml': round(float(a.sum() * dx * dy * dz / 1000), 2), 'trachea_diameter_mm': round(float(d), 1),
            'trachea_length_seen_mm': round(float((top - carina) * dz), 1) if carina is not None else None, 'carina_found': carina is not None,
            'cut_at_top_of_scan': bool(top >= len(z) - 2), 'ct_above_airway_top_mm': round(float((len(z) - 1 - top) * dz), 1), 'scan_mm': round(float(z[-1] - z[0]), 1)}
    return a, info

def preview(hu, z, geo, a, lungs, path):
    from PIL import Image
    dz = float(np.median(np.diff(z))); x0, y0, dx, dy = geo
    xi = int(np.nonzero(a)[2].mean()) if a is not None and a.any() else hu.shape[2] // 2
    sag = np.clip((hu[:, :, xi] + 1000) / 1400, 0, 1)[::-1]; rgb = np.stack([sag] * 3, -1)
    if a is not None: m = a[:, :, max(0, xi - 2): xi + 3].any(2)[::-1]; rgb[m] = [0.1, 0.9, 1.0]
    cor_y = int(np.nonzero(a)[1].mean()) if a is not None and a.any() else hu.shape[1] // 2
    cor = np.clip((hu[:, cor_y, :] + 1000) / 1400, 0, 1)[::-1]; rgb2 = np.stack([cor] * 3, -1)
    if a is not None: m2 = a.any(1)[::-1]; rgb2[m2] = [0.1, 0.9, 1.0]
    f = dz / dy; h = int(rgb.shape[0] * f)
    im = Image.fromarray((rgb * 255).astype(np.uint8)).resize((rgb.shape[1], h)); im2 = Image.fromarray((rgb2 * 255).astype(np.uint8)).resize((rgb2.shape[1], h))
    out = Image.new('RGB', (im.width + im2.width, h)); out.paste(im, (0, 0)); out.paste(im2, (im.width, 0)); s = 420 / h
    os.makedirs(PREV, exist_ok=True); out.resize((int(out.width * s), 420)).save(path, quality=80)

def mesh(a, z, geo, centre):
    from skimage.measure import marching_cubes
    from scipy.ndimage import gaussian_filter, zoom
    import trimesh
    x0, y0, dx, dy = geo; dz = float(np.median(np.diff(z))); idx = np.nonzero(a); lo = [max(0, i.min() - 3) for i in idx]; hi = [i.max() + 4 for i in idx]
    v = a[lo[0]:hi[0], lo[1]:hi[1], lo[2]:hi[2]].astype(np.float32); f = max(1, int(round(dz / dx)))
    v = np.pad(v, 1); v = gaussian_filter(zoom(v, (f, 1, 1), order=1), (0.5 * f / 2 + 0.3, 0.7, 0.7))
    vs, fs, _, _ = marching_cubes(v, 0.45, spacing=(dz / f, dy, dx))
    p = np.c_[vs[:, 2] + x0 + (lo[2] - 1) * dx, vs[:, 1] + y0 + (lo[1] - 1) * dy, vs[:, 0] + z[lo[0]] - dz]
    m = trimesh.Trimesh(vertices=p, faces=fs, process=True)
    if len(m.faces) > 9000:
        try: m = m.simplify_quadric_decimation(face_count=9000)
        except Exception as e: print('  decimation skipped:', e)
    trimesh.smoothing.filter_taubin(m, lamb=0.5, nu=-0.53, iterations=6)
    q = (m.vertices - centre) / 1000.0; m.vertices = np.c_[q[:, 0], q[:, 2], -q[:, 1]]; m.fix_normals()
    return m

def main():
    from idc_index import IDCClient
    import trimesh
    want = [(b, v['patient'], v['ct']) for b, v in SER['chosen'].items()] + [(None, v['patient'], v['ct']) for v in SER['neck']]
    os.makedirs(DATA, exist_ok=True); c = IDCClient()
    c.download_from_selection(seriesInstanceUID=[w[2] for w in want], downloadDir=os.path.join(DATA, 'ct'), dirTemplate='%PatientID')
    c.download_from_selection(seriesInstanceUID=[CAND[w[1]]['rtstruct'] for w in want if w[1] in CAND], downloadDir=os.path.join(DATA, 'rt'), dirTemplate='%PatientID')
    report = {'source': 'Pediatric-CT-SEG, The Cancer Imaging Archive, doi:10.7937/TCIA.X0H0-1706', 'license': 'CC BY 4.0', 'method': 'air inside the body on CT, connected to the windpipe, outside the expert lung outlines', 'models': {}, 'other_scans': []}
    for band, pid, _ in want:
        try:
            hu, z, geo = load_ct(os.path.join(DATA, 'ct', pid)); rt = glob.glob(os.path.join(DATA, 'rt', pid, '**', '*.dcm'), recursive=True)
            structs = anat.read_rtstruct(rt[0]) if rt else {}; lungs = lung_mask(structs, hu.shape, z, geo) if structs else None
            a, info = airway(hu, z, geo, lungs); info.update({'patient': pid, 'age': CAND.get(pid, {}).get('age'), 'sex': CAND.get(pid, {}).get('sex')})
            if lungs is not None and lungs.any(): info['ct_above_lung_apex_mm'] = round(float(z[-1] - z[np.nonzero(lungs.any((1, 2)))[0].max()]), 1)
            preview(hu, z, geo, a, lungs, os.path.join(PREV, f'{band or "scan"}-{pid[-8:]}.jpg')); print(band, pid, info)
            if band and a is None: report['models'][band] = {**info, 'airway': False, 'why': 'this scan starts below the windpipe'}
            if band and a is not None:
                ref = structs.get('skin') or max(structs.values(), key=len); rp = np.concatenate([p for _, p in ref]); centre = np.array([rp[:, 0].mean(), rp[:, 1].mean(), min(zz for zz, _ in ref)])
                m = mesh(a, z, geo, centre); info['tris'] = int(len(m.faces)); sc = trimesh.Scene(); sc.add_geometry(m, node_name='airway', geom_name='airway'); sc.export(os.path.join(OUT, f'peds-{band}-airway.glb'))
                report['models'][band] = info
            elif not band: report['other_scans'].append(info)
        except Exception as e:
            import traceback; traceback.print_exc(); print('FAILED', band, pid, e)
    json.dump(report, open(os.path.join(OUT, 'peds-airway.json'), 'w'), indent=1)
    if not report['models']: sys.exit('no airway was built')

if __name__ == '__main__': main()
