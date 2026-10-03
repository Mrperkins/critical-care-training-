/**
 * Scrapes every static 3D label text from the scene sources (used by the glossary index and by the description
 * coverage test, so a new label without a description fails the tests). Paths are relative to app/.
 */
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

export type ModuleId = 'vent' | 'abg' | 'labs' | 'lines' | 'heart' | 'abdomen' | 'neuro';
export interface Scraped { text: string; module: ModuleId; info?: string }
const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..', 'src');
const read = (f: string) => fs.readFileSync(path.join(ROOT, f), 'utf8');
const all = (re: RegExp, s: string, g = 1) => [...s.matchAll(re)].map((m) => m[g]);

export function scrapeLabels(): Scraped[] {
  const out: Scraped[] = []; const add = (module: ModuleId, texts: string[]) => texts.forEach((text) => out.push({ text, module }));
  const lines = read('lines/LinesScene.tsx'), blood = read('labs/blood/BloodScene.tsx'), vessels = read('lines/vessels.ts');
  add('lines', [...all(/lbl\('([^']+)',/g, lines), ...all(/\['([^']+)', \[[-\d.]+, [-\d.]+, [-\d.]+\], '[lr]'/g, lines), ...all(/name: '([^']+)'/g, vessels), ...all(/text: '([^']+)'/g, vessels), 'Phlebostatic axis', 'Stopcock open to air']);
  add('labs', all(/lbl\('[a-z0-9]+', '([^']+)'/g, blood));
  add('heart', all(/tag\((?:V\([^)]*\)|new THREE\.Vector3\([^)]*\)), '([^'`]+)'/g, read('heart/HeartScene.tsx')));
  add('abdomen', all(/tag\((?:V\([^)]*\)|new THREE\.Vector3\([^)]*\)|ABD\.[a-z]+\.clone\(\)\.add\(V\([^)]*\)\)), '([^'`]+)'/g, read('abdomen/AbdomenScene.tsx')));
  add('vent', all(/tag\([^\n]*?, '([^']+)', '[a-z]+'\)\)/g, read('vent/LungScene.tsx')));
  const alv = read('vent/AlveolusScene.tsx'); add('vent', [...all(/\bt: '([^']+)'/g, alv), ...all(/label: '([^']+)'/g, alv), 'Alveolar gas', 'Red cell']);
  add('abg', all(/text="([^"]+)"/g, read('abg/AbgScene.tsx')));
  add('neuro', all(/\['[a-z0-9_]+', [\d.]+, '([^']+)'\]/g, read('neuro/NeuroScene.tsx')));
  add('labs', [...all(/\['([^']+)', \[[-\d.]+, [-\d.]+, [-\d.]+\]\]/g, read('labs/LabScene.tsx')), ...all(/\['([^']+)', \[SLAB/g, read('labs/cell/patch.tsx'))]);
  // whole-cell organelles (info key "cell <key>")
  const anat = fs.readdirSync(path.join(ROOT, 'labs/cell/anatomy')).map((f) => read(`labs/cell/anatomy/${f}`)).join('\n');
  for (const m of anat.matchAll(/key: '([a-z0-9_]+)', label: '([^']+)'/g)) out.push({ text: m[2], module: 'labs', info: `cell ${m[1]}` });
  for (const m of anat.matchAll(/label: \['([a-z0-9_]+)', '([^']+)'\]/g)) out.push({ text: m[2], module: 'labs', info: `cell ${m[1]}` });
  // transporters (descriptions registered by the cell model)
  for (const m of read('labs/cell/model.ts').matchAll(/short: '([^']+)'/g)) out.push({ text: m[1], module: 'labs' });
  // labels whose visible text is dynamic: explicit keys with a readable title
  const dyn: [string, string, ModuleId][] = [['VSD — ventricular septal defect', 'vsd', 'heart'], ['ASD — atrial septal defect', 'asd', 'heart'], ['PFO — patent foramen ovale', 'pfo', 'heart'], ['PDA — patent ductus arteriosus', 'pda', 'heart'],
    ['AAA — abdominal aortic aneurysm', 'aaa', 'abdomen'], ['Free air', 'free air', 'abdomen'], ['Pressure bag', 'pressure bag', 'lines'], ['Transducer level', 'transducer level', 'lines'], ['CVC tip at the cavo-atrial junction', 'cvc tip', 'lines'],
    ['CVC tip in the right ventricle', 'cvc tip in the rv', 'lines'], ['Arterial cannula', 'arterial cannula', 'lines'], ['Clot at the catheter tip', 'catheter clot', 'lines'], ['Core and penumbra', 'core and penumbra', 'neuro'],
    ['Extracellular fluid', 'extracellular fluid', 'labs'], ['Cytosol', 'cytosol', 'labs'], ['Bone marrow', 'bone marrow', 'labs'], ['Kidney', 'kidney', 'labs'], ['Liver', 'liver', 'labs'], ['Heart', 'heart', 'labs'], ['Brain', 'brain', 'labs'], ['Pancreas', 'pancreas', 'labs']];
  for (const [text, info, module] of dyn) out.push({ text, module, info });
  return out.filter((x) => x.text.length > 1);
}
