/**
 * Atlas anatomy in 3D: the HuBMAP Visible Human Male or Female reference body (CC BY 4.0) with the organs that
 * carry the condition highlighted and the rest ghosted. Maternal conditions show the library's term placenta,
 * amnion and cord in place; pediatric congenital-heart conditions open the real 3D congenital heart instead.
 * Pathology marks (blood, clot, oedema) are 3D overlays sized by the illustrative state, not measurements.
 */
import { useEffect, useMemo, useRef, useState } from 'react';
import * as THREE from 'three';
import { CameraControls } from '@react-three/drei';
import { useFrame, useThree } from '@react-three/fiber';
import { loadBodyAsset, type BodyAsset } from '../asset/body';
import { StudioCanvas } from '../scene/Studio';
import { HeartScene } from '../heart/HeartScene';
import { loadHeartPreset, useHeartUI } from '../heart/heartStore';
import type { DiseaseDefinition, DiseaseState } from './types';
import { SkeletonLayer, PericardiumLayer, ConductionLayer, DeepBrainLayer, UpperAirwayLayer, PulmonaryEmbolusLayer, DissectionLayer, AneurysmLayer, PleuralLayer } from './AtlasLayers';
import { BRAINSTEM, RIBS } from '../asset/anatomy';
import { affectedOrgans, bodySexFor, isPregnant, usesAdultReference, HEART_PRESET_FOR, FEMALE_ORGANS, MALE_ORGANS, ORGAN_COLOR, type OrganId } from './anatomy3d';

function useReducedMotion() {
  const [reduced, setReduced] = useState(() => window.matchMedia('(prefers-reduced-motion: reduce)').matches);
  useEffect(() => { const q = window.matchMedia('(prefers-reduced-motion: reduce)'); const f = () => setReduced(q.matches); q.addEventListener('change', f); return () => q.removeEventListener('change', f); }, []);
  return reduced;
}
const PREGNANCY_PARTS: OrganId[] = ['placenta', 'amnion', 'cord'];

/** Bounding box of the given meshes in body space (meshes are in body space already). */
function boxOf(body: BodyAsset, ids: string[]) {
  const b = new THREE.Box3();
  for (const id of ids) { const m = body.meshes[id]; if (!m) continue; m.geometry.computeBoundingBox(); b.union(m.geometry.boundingBox!); }
  return b;
}

function Camera({ body, focus, whole, boost = 1 }: { body: BodyAsset; focus: string[]; whole: boolean; boost?: number }) {
  const controls = useRef<CameraControls>(null); const reduced = useReducedMotion();
  const aspect = useThree((s) => s.size.width / Math.max(1, s.size.height));
  useEffect(() => {
    const box = whole ? boxOf(body, ['skin']) : boxOf(body, focus);
    const p = box.getCenter(new THREE.Vector3()); const size = Math.max(whole ? 18 : 1.6, box.getSize(new THREE.Vector3()).length() * (whole ? 1 : 1.25 * boost));
    const distance = size / (2 * Math.tan(THREE.MathUtils.degToRad(17))) * Math.max(1, 1 / aspect);
    controls.current?.setLookAt(p.x + distance * 0.18, p.y + distance * 0.08, p.z + distance, p.x, p.y, p.z, !reduced);
  }, [body, focus.join(), whole, aspect, reduced, boost]); // eslint-disable-line react-hooks/exhaustive-deps
  return <CameraControls ref={controls} makeDefault smoothTime={0.65} minDistance={0.8} maxDistance={60} />;
}

/** Per-organ deformation for the condition (scale about the organ's own centre; placenta repositioned for previa). */
function organPose(id: OrganId, d: DiseaseDefinition, s: DiseaseState, body: BodyAsset): { scale: number; offset?: THREE.Vector3; rotX?: number } {
  const unilateral = ['tension', 'pleural-air', 'pleural-blood', 'trauma'].includes(d.variant);
  if (id.startsWith('lung') && affectedOrgans(d).includes(id) && (!unilateral || id === 'lung_R')) return { scale: 1 - 0.42 * s.collapse + 0.15 * s.overdistension };
  if (id === 'brain' && d.anatomy === 'brain') return { scale: 1 + 0.03 * s.edema };
  if (id === 'heart' && d.anatomy === 'heart' && ['pump', 'congestion'].includes(d.variant)) return { scale: 1 + 0.18 * (s.pumpLoss + s.fluid) / 2 };
  if (id === 'heart' && d.variant === 'pericardial') return { scale: 1 - 0.07 * s.pressure }; // diastolic filling restricted by the effusion
  if (id === 'heart' && d.variant === 'tension') return { scale: 1, offset: new THREE.Vector3(0.12 * s.pressure, 0, 0) }; // mediastinal shift away from the tension side
  if (id === 'ovary_R' && d.variant === 'torsion') return { scale: 1 + 1.4 * s.edema + 0.6 * s.obstruction };
  if (id.startsWith('ovary') && d.variant === 'follicles') return { scale: 1.5 + 0.5 * s.endocrine };
  if (id === 'uterus' && (d.variant === 'postpartum' || d.variant === 'atony')) return { scale: 3.4 + 0.8 * s.pumpLoss }; // postpartum fundus near the umbilicus
  if (id === 'placenta' && d.variant === 'previa') {
    const amn = boxOf(body, ['amnion']); const pl = boxOf(body, ['placenta']);
    const target = new THREE.Vector3((amn.min.x + amn.max.x) / 2, amn.min.y + 0.35, (amn.min.z + amn.max.z) / 2);
    return { scale: 0.9, offset: target.sub(pl.getCenter(new THREE.Vector3())), rotX: Math.PI / 2 };
  }
  return { scale: 1 };
}

function Organ({ body, id, active, state, disease, xray = false }: { body: BodyAsset; id: OrganId; active: boolean; state: DiseaseState; disease: DiseaseDefinition; xray?: boolean }) {
  const mesh = useRef<THREE.Mesh<THREE.BufferGeometry, THREE.MeshStandardMaterial>>(null); const reduced = useReducedMotion();
  const centre = useMemo(() => boxOf(body, [id]).getCenter(new THREE.Vector3()), [body, id]);
  const geometry = useMemo(() => body.meshes[id].geometry.clone().translate(-centre.x, -centre.y, -centre.z), [body, id, centre]);
  const amnion = id === 'amnion';
  const material = useMemo(() => new THREE.MeshStandardMaterial({ color: ORGAN_COLOR[id], roughness: amnion ? 0.25 : 0.62, transparent: true, side: amnion ? THREE.DoubleSide : THREE.FrontSide }), [id, amnion]);
  const pose = useMemo(() => organPose(id, disease, state, body), [id, disease, state, body]);
  const target = useMemo(() => new THREE.Vector3(pose.scale, pose.scale, pose.scale), [pose.scale]);
  const position = useMemo(() => centre.clone().add(pose.offset ?? new THREE.Vector3()), [centre, pose.offset]);
  const color = useMemo(() => {
    const c = new THREE.Color(ORGAN_COLOR[id]);
    if (active) c.lerp(new THREE.Color('#4b2236'), state.ischemia * 0.7).lerp(new THREE.Color('#6985a6'), (amnion ? 0 : state.fluid) * 0.5).lerp(new THREE.Color('#c25b4f'), state.inflammation * 0.35);
    return c;
  }, [id, active, amnion, state.ischemia, state.fluid, state.inflammation]);
  useEffect(() => () => { geometry.dispose(); material.dispose(); }, [geometry, material]);
  useFrame((_, dt) => {
    const m = mesh.current; if (!m) return; const u = reduced ? 1 : 1 - Math.exp(-4 * Math.min(dt, 0.1));
    m.scale.lerp(target, u); m.material.color.lerp(color, u);
    m.material.opacity = amnion ? (active ? 0.22 : 0.1) : active ? (xray ? 0.22 : 1) : 0.1; m.material.depthWrite = active && !amnion && !xray;
  });
  return <mesh ref={mesh} geometry={geometry} material={material} position={position} rotation={[pose.rotX ?? 0, 0, 0]} dispose={null} />;
}

function Skin({ body, whole }: { body: BodyAsset; whole: boolean }) {
  const material = useMemo(() => new THREE.MeshStandardMaterial({ color: '#b99b87', transparent: true, depthWrite: false, roughness: 0.7 }), []);
  material.opacity = whole ? 0.3 : 0.05;
  useEffect(() => () => material.dispose(), [material]);
  return <mesh geometry={body.meshes.skin.geometry} material={material} dispose={null} />;
}

const blob = (key: string, pos: THREE.Vector3, r: [number, number, number], color: string, opacity = 1) =>
  <mesh key={key} position={pos} scale={r}><sphereGeometry args={[1, 22, 16]} /><meshStandardMaterial color={color} roughness={0.5} transparent={opacity < 1} opacity={opacity} depthWrite={opacity >= 1} /></mesh>;

/** Blood, clot and fluid marks placed on the real organ surfaces. */
function Pathology({ body, d, s, layered = false }: { body: BodyAsset; d: DiseaseDefinition; s: DiseaseState; layered?: boolean }) {
  const c = (ids: string[]) => boxOf(body, ids).getCenter(new THREE.Vector3());
  const top = (ids: string[]) => { const b = boxOf(body, ids); return new THREE.Vector3((b.min.x + b.max.x) / 2, b.max.y, (b.min.z + b.max.z) / 2); };
  const out: JSX.Element[] = []; const bl = s.bleeding;
  if ((d.variant === 'clot' && !layered) || d.variant === 'afe') out.push(blob('pe', c(['heart']).add(new THREE.Vector3(-0.05, 0.55, -0.05)), [0.09, 0.12, 0.09], d.variant === 'afe' ? '#d9d2b4' : '#7d1f30'));
  if (d.anatomy === 'aorta' && ['aneurysm', 'rupture'].includes(d.variant) && !layered) { const a = boxOf(body, ['aorta']); out.push(blob('aaa', new THREE.Vector3(a.getCenter(new THREE.Vector3()).x, a.min.y + 0.55, a.getCenter(new THREE.Vector3()).z + 0.05), [0.2 + s.overdistension * 0.25, 0.42, 0.2 + s.overdistension * 0.25], '#b6595f')); }
  if (d.variant === 'rupture' && bl > 0.02 && !layered) { const a = boxOf(body, ['aorta']); out.push(blob('rp', new THREE.Vector3(a.max.x + 0.2, a.min.y + 0.6, a.min.z), [0.3 * bl + 0.1, 0.35 * bl + 0.1, 0.25], '#8a1d2f', 0.85)); }
  if (d.variant === 'dissection' && !layered) { const a = boxOf(body, ['aorta']); out.push(blob('fl', new THREE.Vector3(a.getCenter(new THREE.Vector3()).x + 0.06, a.max.y - 0.35, a.max.z - 0.05), [0.07, 0.35, 0.07], '#d8c3a5', 0.9)); }
  if (d.variant === 'pericardial' && !layered) out.push(blob('pc', c(['heart']), [0.62, 0.72, 0.6].map((v) => v + 0.15 * s.fluid) as [number, number, number], '#75a3c7', 0.18 + s.fluid * 0.25));
  if (['pleural-blood', 'trauma'].includes(d.variant) && bl > 0.02 && !layered) { const l = boxOf(body, ['lung_R']); out.push(blob('hx', new THREE.Vector3(l.min.x + 0.25, l.min.y + 0.25, l.min.z + 0.3), [0.25, 0.12 + 0.3 * bl, 0.3], '#7d1f30', 0.85)); }
  if (d.anatomy === 'brain' && (d.variant === 'trauma' || (d.variant === 'ich' && !layered))) out.push(blob('ich', c(['brain']).add(new THREE.Vector3(0.22, 0.05, 0.1)), [0.08 + 0.12 * bl, 0.07 + 0.1 * bl, 0.09 + 0.1 * bl], '#6d1726'));
  if (d.variant === 'sah') out.push(blob('sah', boxOf(body, ['brain']).getCenter(new THREE.Vector3()).setY(boxOf(body, ['brain']).min.y + 0.12), [0.32, 0.03 + 0.04 * bl, 0.25], '#7d1f30', 0.8));
  if (d.variant === 'core-penumbra' && s.ischemia > 0.05) out.push(blob('core', c(['brain']).add(new THREE.Vector3(0.3, 0.12, 0.05)), [0.1 + 0.18 * s.ischemia, 0.1 + 0.16 * s.ischemia, 0.12 + 0.15 * s.ischemia], '#4b2236', 0.85));
  if (d.variant === 'abdominal-blood' && bl > 0.02) { const l = boxOf(body, ['liver', 'spleen']); out.push(blob('hp', new THREE.Vector3((l.min.x + l.max.x) / 2, l.min.y - 0.25, l.max.z - 0.1), [0.55 * bl + 0.15, 0.12 + 0.2 * bl, 0.25], '#7d1f30', 0.7)); }
  if (['pelvic-blood', 'maternal-blood', 'uterine-blood', 'postpartum', 'atony'].includes(d.variant) && bl > 0.02) out.push(blob('pv', c(['uterus']).add(new THREE.Vector3(0, -0.25, 0.05)), [0.18 + 0.25 * bl, 0.08 + 0.15 * bl, 0.15 + 0.15 * bl], '#7d1f30', 0.8));
  if (d.variant === 'abruption' && bl > 0.02) { const pl = c(['placenta']); const dir = pl.clone().sub(c(['amnion'])).normalize(); out.push(blob('ab', pl.add(dir.multiplyScalar(0.35)), [0.25 + 0.3 * bl, 0.2 + 0.25 * bl, 0.08 + 0.08 * bl], '#5e1424', 0.9)); }
  if (d.variant === 'tubal') { const t = boxOf(body, ['tube_R']); out.push(blob('ect', new THREE.Vector3(t.min.x + 0.12, (t.min.y + t.max.y) / 2, (t.min.z + t.max.z) / 2), [0.1 + 0.08 * s.overdistension, 0.09 + 0.07 * s.overdistension, 0.09], '#8b4a55')); if (bl > 0.05) out.push(blob('hemo', c(['uterus']).add(new THREE.Vector3(0, -0.2, -0.3)), [0.2 * bl + 0.08, 0.1, 0.18], '#7d1f30', 0.8)); }
  if (d.variant === 'lesions') [[-0.35, 0.05, -0.2], [0.35, 0.1, -0.15], [0.05, -0.15, -0.35], [-0.1, 0.25, 0.2]].forEach(([x, y, z], i) => out.push(blob('en' + i, c(['uterus']).add(new THREE.Vector3(x, y, z)), [0.04 + 0.03 * s.inflammation, 0.04, 0.04], '#3e1d33')));
  if (d.variant === 'follicles') (['ovary_L', 'ovary_R'] as const).forEach((o) => { const oc = c([o]); for (let i = 0; i < 6; i++) { const a = (i / 6) * Math.PI * 2; out.push(blob(o + i, oc.clone().add(new THREE.Vector3(Math.cos(a) * 0.1, Math.sin(a) * 0.17, 0.06)), [0.035, 0.035, 0.035], '#e8dccf', 0.95)); } });
  if ((d.variant === 'subglottic' || d.variant === 'upper') && !layered) { const a = boxOf(body, ['airway']); out.push(blob('sg', new THREE.Vector3((a.min.x + a.max.x) / 2, a.max.y - 0.75, (a.min.z + a.max.z) / 2 + 0.05), [0.1 + 0.05 * s.edema, 0.12, 0.1 + 0.05 * s.edema], '#c25b4f', 0.55)); }
  if (['diffuse-fluid', 'focal-fluid', 'hydrostatic-fluid'].includes(d.variant) && s.fluid > 0.02) (['lung_L', 'lung_R'] as const).forEach((l) => { if (d.variant === 'focal-fluid' && l === 'lung_L') return; const b = boxOf(body, [l]); out.push(blob('fl' + l, new THREE.Vector3((b.min.x + b.max.x) / 2, b.min.y + (b.max.y - b.min.y) * (d.variant === 'hydrostatic-fluid' ? 0.25 : 0.4), b.min.z + 0.35), [0.3, 0.2 + 0.25 * s.fluid, 0.28], '#6f9ec2', 0.25 + 0.4 * s.fluid)); });
  if ((d.variant === 'pleural-air' || d.variant === 'tension') && !layered) { const l = top(['lung_R']); out.push(blob('ptx', l.add(new THREE.Vector3(-0.1, -0.2, 0.1)), [0.35, 0.3 + 0.4 * s.collapse, 0.35], '#cfe3ee', 0.18)); }
  return <group>{out}</group>;
}

/** Which added anatomy each condition uses (male body). Effusion and haematoma volumes are illustrative, from the state. */
export function atlasLayers(d: DiseaseDefinition, s: DiseaseState) {
  const out: { bones: string[]; xray: OrganId[]; pericardium?: number; conduction?: { hr: number; avDelay?: number; dropEvery?: number }; brain?: { highlight?: string[]; ventricleScale?: number; ich?: string; ichMl?: number; show?: 'all' | 'ventricles' }; airway?: { edema: number; site?: 'supraglottic' | 'subglottic' }; pe?: { extent: number }; dissection?: { compression: number; wallStress: number }; aneurysm?: { dilation: number; bleeding: number }; pleural?: { air: number; blood: number } } = { bones: [], xray: [] };
  if (d.variant === 'tension' || d.variant === 'pleural-air') out.bones = ['rib_R2', 'rib_R3', 'rib_R4', 'rib_R5']; // 2nd ICS MCL · 4th–5th ICS AAL
  if (d.variant === 'trauma' && d.anatomy === 'pleura') out.bones = RIBS('R').slice(2, 8);
  if (d.variant === 'pericardial') out.pericardium = 40 + 460 * s.fluid;
  if (d.variant === 'upper') out.airway = { edema: Math.max(s.edema, s.obstruction), site: 'supraglottic' };
  if (d.variant === 'subglottic') out.airway = { edema: Math.max(s.edema, s.obstruction), site: 'subglottic' };
  if (d.variant === 'aspiration') out.airway = { edema: 0 };
  if (d.variant === 'clot') { out.pe = { extent: s.obstruction }; out.xray.push('lung_L', 'lung_R', 'heart'); } // the clot sits in the pulmonary arteries above and behind the heart
  if (d.variant === 'dissection') { out.dissection = { compression: s.obstruction, wallStress: s.pressure }; out.xray.push('aorta'); }
  if (d.anatomy === 'aorta' && (d.variant === 'aneurysm' || d.variant === 'rupture')) { out.aneurysm = { dilation: s.overdistension, bleeding: d.variant === 'rupture' ? s.bleeding : 0 }; out.xray.push('aorta'); }
  if (d.variant === 'pleural-air' || d.variant === 'tension') out.pleural = { air: s.collapse, blood: 0 };
  if (d.variant === 'pleural-blood') out.pleural = { air: 0, blood: s.bleeding };
  if (d.variant === 'trauma' && d.anatomy === 'pleura') out.pleural = { air: 0.3 * s.collapse, blood: 0.7 * s.bleeding };
  if (d.variant === 'tachy' || d.variant === 'brady') {
    out.xray.push('heart');
    out.conduction = d.variant === 'tachy' ? { hr: 80 + 90 * s.electrical } : { hr: 70 - 34 * s.electrical, avDelay: 160 * s.electrical, dropEvery: s.electrical > 0.7 ? 3 : 0 };
  }
  if (d.anatomy === 'brain') {
    out.xray.push('brain');
    const mass = Math.max(s.edema, s.pressure);
    if (d.variant === 'ich') out.brain = { ich: 'putamen_L', ichMl: 5 + 55 * s.bleeding, highlight: ['internal_capsule_L'], ventricleScale: 1 - 0.25 * mass };
    else if (d.variant === 'herniation') out.brain = { highlight: BRAINSTEM, ventricleScale: 1 - 0.4 * mass };
    else if (d.variant === 'icp' || d.variant === 'edema') out.brain = { show: 'ventricles', ventricleScale: 1 - 0.4 * mass };
    else out.brain = {};
  }
  return out;
}

function BodyScene({ disease, state, target }: { disease: DiseaseDefinition; state: DiseaseState; target: string }) {
  const sex = bodySexFor(disease);
  const [body, setBody] = useState<BodyAsset | null>(null); const [error, setError] = useState(false);
  useEffect(() => { let cancelled = false; setBody(null); loadBodyAsset(sex).then((a) => { if (!cancelled) setBody(a); }).catch(() => { if (!cancelled) setError(true); }); return () => { cancelled = true; }; }, [sex]);
  if (error) return <p role="alert">The 3D anatomy could not load. The condition’s findings are listed below.</p>;
  if (!body) return <p className="loading">Loading 3D anatomy…</p>;
  const organs = affectedOrgans(disease); const pregnant = isPregnant(disease);
  const list = (sex === 'female' ? FEMALE_ORGANS : MALE_ORGANS).filter((id) => body.meshes[id] && (!PREGNANCY_PARTS.includes(id) || pregnant));
  const focus = organs.filter((id) => body.meshes[id]).concat(pregnant && disease.anatomy === 'placenta' ? ['amnion'] : []);
  const a = body.mapping.attribution; const male = sex === 'male'; const layers = atlasLayers(disease, state);
  return <>
    <StudioCanvas camera={{ position: [0, 1, 34], fov: 34 }} fog={false} label={`${disease.title}: 3D ${sex} reference anatomy with the affected organs highlighted`}>
      <Skin body={body} whole={target === 'body.whole'} />
      {list.map((id) => <Organ key={id} body={body} id={id} active={organs.includes(id)} state={state} disease={disease} xray={layers.xray.includes(id)} />)}
      <Pathology body={body} d={disease} s={state} layered={male} />
      {male && <SkeletonLayer highlight={layers.bones} ghost={target === 'body.whole' ? 0.32 : 0.14} />}
      {male && layers.pericardium != null && <PericardiumLayer ml={layers.pericardium} blood={disease.variant === 'trauma'} />}
      {male && layers.conduction && <ConductionLayer {...layers.conduction} />}
      {male && layers.brain && <DeepBrainLayer {...layers.brain} />}
      {male && layers.airway && <UpperAirwayLayer {...layers.airway} />}
      {male && layers.pe && <PulmonaryEmbolusLayer {...layers.pe} />}
      {male && layers.dissection && <DissectionLayer {...layers.dissection} />}
      {male && layers.aneurysm && body.meshes.aorta && <AneurysmLayer aorta={body.meshes.aorta.geometry} kidneyY={boxOf(body, ['kidney_L', 'kidney_R']).getCenter(new THREE.Vector3()).y} {...layers.aneurysm} />}
      {male && layers.pleural && body.meshes.lung_R && <PleuralLayer lung={body.meshes.lung_R.geometry} {...layers.pleural} />}
      <Camera body={body} focus={focus} whole={target === 'body.whole'} boost={Math.max(1, ...focus.map((id) => organPose(id as OrganId, disease, state, body).scale))} />
    </StudioCanvas>
    <details className="credit"><summary>Sources &amp; model notes</summary>{a.title} — {a.creators}; {a.data}. <a href={a.licenseUrl} target="_blank" rel="noreferrer">{a.license}</a>. {a.changes}
      {usesAdultReference(disease) && ' Children are shown on the adult reference body: a child has a proportionally larger head, a shorter neck and a narrower, more anterior airway.'}
      {' '}Blood, clot, fluid and lesion marks are 3D overlays sized by the illustrative state, not measurements.
      {male && <> Bones: BodyParts3D, © The Database Center for Life Science, <a href="https://creativecommons.org/licenses/by-sa/2.1/jp/deed.en" target="_blank" rel="noreferrer">CC BY-SA 2.1 JP</a>, fitted onto the Visible Human Male (skull, spine, ribs, sternum, shoulder girdle, humeri); pelvis and legs from HuBMAP. Pericardium, deep brain and conduction system are built on the HuBMAP heart and Allen brain regions; the conduction fibre pattern is schematic, and the internal capsule is reconstructed from the surrounding white matter.</>}</details>
  </>;
}

function CongenitalHeart({ preset }: { preset: NonNullable<(typeof HEART_PRESET_FOR)[string]> }) {
  useEffect(() => { loadHeartPreset(preset); useHeartUI.getState().set({ target: 'heart.four_chamber', cut: 'auto' }); }, [preset]);
  return <><HeartScene /><p className="credit">Real HuBMAP heart (CC BY 4.0), opened to show the defect; blood colour follows the shunt model. The same heart is in Cardiac → Explore.</p></>;
}

export default function PatientScene({ disease, state, target }: { disease: DiseaseDefinition; state: DiseaseState; target: string }) {
  const preset = HEART_PRESET_FOR[disease.id];
  if (preset && target !== 'body.whole') return <CongenitalHeart preset={preset} />;
  return <BodyScene disease={disease} state={state} target={target} />;
}
