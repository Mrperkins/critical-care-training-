"""
Discovery: which children in the TotalSegmentator training set (Wasserthal et al., Zenodo 10047292, CC BY 4.0)
have a CT that covers the head and neck? Prints one line per child with the labelled structures that matter for
an airway model. Reads single files out of the remote zip, so nothing large is downloaded.
"""
import csv, io, json, sys, urllib.request
import numpy as np
REC = 'https://zenodo.org/api/records/10047292'
def main():
    rec = json.load(urllib.request.urlopen(REC)); files = {f['key']: f['links']['self'] for f in rec['files']}
    print('license', rec['metadata'].get('license'), 'files', {k: f['size'] for k, f in ((f['key'], f) for f in rec['files'])})
    from remotezip import RemoteZip
    z = RemoteZip(next(v for k, v in files.items() if k.endswith('.zip'))); names = z.namelist()
    meta = z.read(next(n for n in names if n.endswith('meta.csv'))).decode('utf-8', 'replace')
    rows = list(csv.DictReader(io.StringIO(meta), delimiter=';')); print('columns', list(rows[0].keys()), 'subjects', len(rows))
    def age(r):
        try: return float(r.get('age') or 'nan')
        except ValueError: return float('nan')
    ages = sorted(a for a in map(age, rows) if a == a); print('youngest ages', ages[:40])
    kids = [r for r in rows if age(r) <= 12]; print('children <= 12:', len(kids))
    for r in kids: print(' ', {k: r[k] for k in r if k in ('image_id', 'age', 'gender', 'study_type', 'scanner_model', 'pathology', 'pathology_location', 'split')})
    if not kids: return
    import nibabel as nib, tempfile, os
    out = []
    for r in kids:
        sid = r['image_id']; info = {'id': sid, 'age': r['age'], 'sex': r.get('gender'), 'study': r.get('study_type')}
        for lab in ('skull', 'trachea', 'brain', 'vertebrae_C3', 'lung_upper_lobe_left', 'thyroid_gland'):
            n = next((x for x in names if x.endswith(f'{sid}/segmentations/{lab}.nii.gz')), None)
            if not n: info[lab] = None; continue
            with tempfile.NamedTemporaryFile(suffix='.nii.gz', delete=False) as t: t.write(z.read(n)); p = t.name
            im = nib.load(p); a = np.asanyarray(im.dataobj) > 0; vox = float(np.prod(im.header.get_zooms()[:3])); info[lab] = round(float(a.sum()) * vox / 1000, 1)
            if lab == 'skull': info['shape'] = list(a.shape); info['zooms'] = [round(float(x), 2) for x in im.header.get_zooms()[:3]]
            os.unlink(p)
        print('  ->', info); out.append(info)
    json.dump(out, open('peds-airway-candidates.json', 'w'), indent=1)
if __name__ == '__main__': main()
