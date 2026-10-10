// @vitest-environment node
/**
 * Skeleton, pericardium, deep brain and heart internals: facts about the built assets that a rebuild must not break
 * (sides, frame, fit quality, physiologic timing) and how the Atlas uses them.
 */
import { describe, expect, it } from 'vitest';
import fs from 'node:fs';
import { NodeIO } from '@gltf-transform/core';
import { ALL_EXTENSIONS } from '@gltf-transform/extensions';
import { MeshoptDecoder } from 'meshoptimizer';
import { atlasLayers } from '../src/atlas/PatientScene';
import { DISEASE_BY_ID } from '../src/atlas/registry';
import { effusionThickness, type PericardiumMapping } from '../src/asset/anatomy';
import type { DiseaseState } from '../src/atlas/types';
import { vesselCentrelines } from '../src/heart/heartGeometry';

const json = (f: string) => JSON.parse(fs.readFileSync('public/models/' + f, 'utf8'));
const body = json('body.mapping.json').centres as Record<string, number[]>;
async function names(file: string) {
  await MeshoptDecoder.ready;
  const io = new NodeIO().registerExtensions(ALL_EXTENSIONS).registerDependencies({ 'meshopt.decoder': MeshoptDecoder });
  return (await io.read('public/models/' + file)).getRoot().listNodes().filter((n) => n.getMesh()).map((n) => n.getName());
}

describe('skeleton', () => {
  const m = json('skeleton.mapping.json');
  it('has the whole axial skeleton, both shoulder girdles and the pelvis and legs', async () => {
    const n = new Set(await names('skeleton.glb'));
    for (const id of ['skull', 'mandible', 'C1', 'C7', 'T1', 'T12', 'L5', 'sacrum', 'manubrium', 'sternum_body', 'xiphoid', 'clavicle_L', 'scapula_R', 'hip_L', 'femur_R', 'tibia_L']) expect(n.has(id), id).toBe(true);
    for (let i = 1; i <= 12; i++) { expect(n.has('rib_L' + i)).toBe(true); expect(n.has('rib_R' + i)).toBe(true); }
  }, 30000);
  it('puts the patient’s left bones at +X, like every organ in the body frame', () => {
    expect(body.kidney_L[0]).toBeGreaterThan(0);
    for (const id of ['rib_L5', 'clavicle_L', 'femur_L', 'scapula_L']) expect(m.centres[id][0], id).toBeGreaterThan(0);
    for (const id of ['rib_R5', 'clavicle_R', 'femur_R', 'scapula_R']) expect(m.centres[id][0], id).toBeLessThan(0);
  });
  it('was fitted inside the skin and around the lungs (the fit report is measured, not assumed)', () => {
    expect(m.fit.axialBoneVerticesOutsideSkin).toBeLessThan(0.01);
    expect(m.fit.skullVerticesOutsideSkin).toBeLessThan(0.01);
    expect(m.fit.ribVerticesInsideLung).toBeLessThan(0.08);
    expect(m.fit.l5ToSacrumGapMm).toBeLessThan(5);
  });
  it('carries the share-alike notice for the BodyParts3D bones', () => {
    expect(m.attribution.some((a: { license: string }) => a.license === 'CC BY-SA 2.1 JP')).toBe(true);
    expect(m.license).toMatch(/CC BY-SA/);
  });
});

describe('pericardium', () => {
  const m = json('pericardium.mapping.json') as PericardiumMapping;
  it('encloses the heart with an anatomically sized sac', () => {
    expect(m.sac.enclosedMl).toBeGreaterThan(400); expect(m.sac.enclosedMl).toBeLessThan(1100);
    const c = m.sac.centre; const h = body.heart; expect(Math.hypot(c[0] - h[0], c[1] - h[1], c[2] - h[2])).toBeLessThan(0.4);
  });
  it('turns an effusion volume into a plausible sac displacement', () => {
    const t500 = effusionThickness(m, 500) * 100; // mm
    expect(t500).toBeGreaterThan(5); expect(t500).toBeLessThan(25);
    expect(effusionThickness(m, 0)).toBe(0);
  });
  it('measures a subxiphoid depth in the usual 4–9 cm range', () => {
    expect(m.subxiphoid.depthDm).not.toBeNull(); expect(m.subxiphoid.depthDm! * 10).toBeGreaterThan(4); expect(m.subxiphoid.depthDm! * 10).toBeLessThan(9);
  });
});

describe('deep brain', () => {
  const m = json('neuro.mapping.json');
  it('labels sides by position (the HuBMAP-placed Allen labels are mirrored)', () => {
    for (const k of ['putamen', 'thalamus', 'caudate', 'lat_ventricle', 'internal_capsule']) { expect(m.centres[k + '_L'][0], k).toBeGreaterThan(0); expect(m.centres[k + '_R'][0], k).toBeLessThan(0); }
  });
  it('has adult-range volumes for the key structures', () => {
    const v = m.volumesMl as Record<string, number>;
    expect(v.putamen_L).toBeGreaterThan(3); expect(v.putamen_L).toBeLessThan(12);
    expect(v.thalamus_L).toBeGreaterThan(5); expect(v.thalamus_L).toBeLessThan(16);
    expect(v.lat_ventricle_L).toBeGreaterThan(5); expect(v.lat_ventricle_L).toBeLessThan(30);
    expect(v.internal_capsule_L).toBeGreaterThan(3); expect(v.internal_capsule_L).toBeLessThan(15);
  });
  it('marks the internal capsule as reconstructed', () => { expect(m.derived.internal_capsule).toMatch(/Reconstructed/); });
});

describe('heart internals', () => {
  const m = json('heart-internals.mapping.json');
  it('places the SA node on the right atrium and the LV papillary muscles on the left', () => {
    expect(m.parts.sa_node.centre[0]).toBeLessThan(0);
    expect(m.parts.pap_lv_anterolateral.centre[0]).toBeGreaterThan(m.parts.pap_rv_anterior.centre[0]);
  });
  it('activates the ventricles with physiologic timing (PR ≈ 120–200 ms, QRS < 120 ms)', () => {
    const a = m.activation; expect(a.hisStart).toBeGreaterThanOrEqual(100); expect(a.hisStart).toBeLessThanOrEqual(200);
    const qrs = a.lastVentricularActivation - a.hisStart; expect(qrs).toBeGreaterThan(50); expect(qrs).toBeLessThan(120);
  });
});

describe('atlas layers', () => {
  const s = (p: Partial<DiseaseState>): DiseaseState => ({ obstruction: 0, collapse: 0, overdistension: 0, fluid: 0, bleeding: 0, edema: 0, inflammation: 0, ischemia: 0, pressure: 0, flowLoss: 0, volumeLoss: 0, pumpLoss: 0, shunt: 0, electrical: 0, metabolic: 0, endocrine: 0, ...p });
  it('fills the real pericardium in tamponade, more with more fluid', () => {
    const d = DISEASE_BY_ID.tamponade; expect(atlasLayers(d, s({ fluid: 0.9 })).pericardium!).toBeGreaterThan(atlasLayers(d, s({ fluid: 0.2 })).pericardium!);
  });
  it('animates conduction faster in tachycardia, slower with AV delay in bradycardia', () => {
    expect(atlasLayers(DISEASE_BY_ID.tachydysrhythmia, s({ electrical: 1 })).conduction!.hr).toBeGreaterThan(140);
    const b = atlasLayers(DISEASE_BY_ID.bradydysrhythmia, s({ electrical: 1 })).conduction!; expect(b.hr).toBeLessThan(45); expect(b.avDelay).toBeGreaterThan(100);
  });
  it('puts a hypertensive ICH in the left putamen next to the internal capsule', () => {
    const b = atlasLayers(DISEASE_BY_ID.ich, s({ bleeding: 0.5 })).brain!; expect(b.ich).toBe('putamen_L'); expect(b.highlight).toContain('internal_capsule_L');
  });
  it('swells the supraglottis in upper-airway obstruction and narrows the subglottis in croup', () => {
    expect(atlasLayers(DISEASE_BY_ID['upper-airway-obstruction'], s({ edema: 0.8 })).airway).toEqual({ edema: 0.8, site: 'supraglottic' });
    expect(atlasLayers(DISEASE_BY_ID.croup, s({ obstruction: 0.6 })).airway!.site).toBe('subglottic');
  });
  it('shapes pathology on the real vessels and pleura instead of placeholder blobs', () => {
    const pe = atlasLayers(DISEASE_BY_ID['pulmonary-embolism'], s({ obstruction: 0.8 })); expect(pe.pe!.extent).toBe(0.8); expect(pe.xray).toContain('lung_R');
    expect(atlasLayers(DISEASE_BY_ID['aortic-dissection'], s({ obstruction: 0.6, pressure: 0.7 })).dissection).toEqual({ compression: 0.6, wallStress: 0.7 });
    expect(atlasLayers(DISEASE_BY_ID['rupturing-aaa'], s({ overdistension: 0.8, bleeding: 0.9 })).aneurysm).toEqual({ dilation: 0.8, bleeding: 0.9 });
    expect(atlasLayers(DISEASE_BY_ID.hemothorax, s({ bleeding: 0.7 })).pleural).toEqual({ air: 0, blood: 0.7 });
    expect(atlasLayers(DISEASE_BY_ID['tension-pneumothorax'], s({ collapse: 0.8 })).pleural!.air).toBe(0.8);
  });
  it('measures the pulmonary arteries and aorta on the correct sides', () => {
    const v = vesselCentrelines();
    expect(v.lpa[v.lpa.length - 1].p.x).toBeGreaterThan(0.3); expect(v.rpa[v.rpa.length - 1].p.x).toBeLessThan(-0.1); // patient left / right
    expect(v.desc[v.desc.length - 1].p.z).toBeLessThan(v.asc[0].p.z); // descending aorta is posterior to the root
    expect(v.asc.every((w) => w.r > 0.04 && w.r < 0.09)).toBe(true); // ~1.6–3.6 cm calibre
  });
  it('shows the right-sided decompression ribs in tension pneumothorax', () => {
    expect(atlasLayers(DISEASE_BY_ID['tension-pneumothorax'], s({})).bones).toEqual(['rib_R2', 'rib_R3', 'rib_R4', 'rib_R5']);
  });
});

describe('upper airway', () => {
  const m = json('upper-airway.mapping.json'); const c = m.centres as Record<string, number[]>; const lm = m.landmarks;
  it('has the real laryngeal cartilages and the landmark-built soft tissue', async () => {
    const n = new Set(await names('upper-airway.glb'));
    for (const id of ['thyroid_cartilage', 'cricoid_cartilage', 'arytenoid_L', 'arytenoid_R', 'epiglottis', 'trachea', 'vocal_fold_L', 'vocal_fold_R', 'cricothyroid_membrane', 'pharynx', 'tongue', 'soft_palate']) expect(n.has(id), id).toBe(true);
  }, 30000);
  it('places the cricothyroid membrane between thyroid and cricoid, ~1 cm tall and a few mm under the skin', () => {
    const ctm = lm.cricothyroidMembrane;
    expect(ctm.heightMm).toBeGreaterThan(6); expect(ctm.heightMm).toBeLessThan(14);
    expect(ctm.skinDepthMm).toBeGreaterThan(2); expect(ctm.skinDepthMm).toBeLessThan(20);
    expect(ctm.centre[1]).toBeLessThan(lm.anteriorCommissure[1]); // below the vocal folds
  });
  it('keeps sides and the front-to-back order: tongue and larynx in front of the pharynx, pharynx in front of the spine', () => {
    expect(c.vocal_fold_L[0]).toBeGreaterThan(0); expect(c.vocal_fold_R[0]).toBeLessThan(0); expect(c.arytenoid_L[0]).toBeGreaterThan(0);
    const verts = lm.vertebralFaces as Record<string, number[]>;
    expect(c.cricoid_cartilage[2]).toBeGreaterThan(c.pharynx[2]);
    expect(c.pharynx[2]).toBeGreaterThan(verts.C5[2]);
    expect(c.tongue[2]).toBeGreaterThan(c.pharynx[2]);
  });
  it('says which parts are schematic', () => { expect(m.schematic).toMatch(/schematic/); });
});

describe('heart interior and conduction (measured landmarks)', () => {
  const m = json('heart-internals.mapping.json'); const lm = m.landmarks; const P = m.parts;
  const d = (a: number[], b: number[]) => Math.hypot(a[0] - b[0], a[1] - b[1], a[2] - b[2]) * 100; // mm
  it('places the SA node at the SVC–RA junction and the AV node at the apex of Koch’s triangle', () => {
    expect(d(P.sa_node.centre, lm.svcOrifice)).toBeLessThan(25);
    expect(lm.kochAvToCsMm).toBeGreaterThan(8); expect(lm.kochAvToCsMm).toBeLessThan(25); // Koch’s triangle ~ 15–20 mm
    expect(P.av_node.centre[1]).toBeGreaterThan(lm.csOstium[1]); // the AV node lies above the coronary-sinus ostium
    expect(d(P.av_node.centre, lm.centralFibrousBody)).toBeLessThan(20);
  });
  it('keeps the conduction system to true scale', () => {
    expect(P.sa_node.lengthMm).toBeGreaterThan(8); expect(P.sa_node.lengthMm).toBeLessThan(25);
    expect(P.his.lengthMm).toBeGreaterThan(10); expect(P.his.lengthMm).toBeLessThan(30);
  });
  it('runs the left bundle on the LV side and the right bundle on the RV side of the septum', () => {
    expect(P.lbb.centre[0]).toBeGreaterThan(P.rbb.centre[0] - 0.02);
    expect(P.purkinje_lv.centre[0]).toBeGreaterThan(P.purkinje_rv.centre[0]);
  });
  it('has the interior architecture as separate, labelled structures', () => {
    for (const id of ['moderator_band', 'limbus_fossa_ovalis', 'fossa_ovalis', 'valve_eustachian', 'valve_thebesian', 'tendon_todaro', 'supraventricular_crest', 'bachmann_bundle', 'internodal_anterior', 'internodal_middle', 'internodal_posterior', 'av_node_inferior_extension']) expect(P[id], id).toBeDefined();
  });
  it('ships full-resolution chambers with sculpted relief and no separate septum slab', async () => {
    const n = new Set(await names('heart-hd.glb')); for (const id of ['lv', 'rv', 'ra', 'la']) expect(n.has(id), id).toBe(true); expect(n.has('septum')).toBe(false);
    const hd = json('heart-hd.mapping.json'); const lv = hd.parts.find((p: { id: string }) => p.id === 'lv'); expect(lv.triangles).toBeGreaterThan(60000);
  }, 30000);
});

describe('cardiac innervation (nerves.glb)', () => {
  const m = json('nerves.mapping.json'); const a = m.anchors;
  it('ships every nerve the cardiac module draws', async () => {
    const { NERVE_IDS } = await import('../src/asset/anatomy');
    const n = await names('nerves.glb'); for (const id of NERVE_IDS) expect(n).toContain(id);
  });
  it('keeps right and left on the correct sides (+X = patient left)', () => {
    expect(a.vagus_R[0]).toBeLessThan(0); expect(a.vagus_L[0]).toBeGreaterThan(0);
    expect(a.phrenic_R[0]).toBeLessThan(0); expect(a.phrenic_L[0]).toBeGreaterThan(0);
    expect(a.sympathetic_trunk_R[0]).toBeLessThan(0); expect(a.sympathetic_trunk_L[0]).toBeGreaterThan(0);
  });
  it('places the sympathetic trunks posterior (paravertebral) and the phrenics anterior to them', () => {
    expect(a.sympathetic_trunk_R[2]).toBeLessThan(a.phrenic_R[2]); expect(a.sympathetic_trunk_L[2]).toBeLessThan(a.phrenic_L[2]);
  });
  it('puts the deep cardiac plexus above the heart, between the carina and the aortic arch', () => {
    const h = json('heart-internals.mapping.json').parts.sa_node.centre;
    expect(a.cardiac_plexus_deep[1]).toBeGreaterThan(h[1]);
  });
  it('labels landmark-built courses as schematic and carries the CC BY-SA attribution', () => {
    expect(m.schematic).toMatch(/schematic/); expect(m.license).toMatch(/CC BY-SA/);
  });
});
