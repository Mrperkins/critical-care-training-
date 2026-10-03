/**
 * Invasive-lines 3D bedside: patient supine on a bed (head of bed adjustable), see-through skin,
 * the heart's chambers and valves beating in time with the synthesiser, the great vessels, a
 * right radial arterial line and a right internal-jugular central line with its tip at the
 * cavo-atrial junction, the transducer pole with pressure bag, and the levelling line from the
 * transducer's air–fluid interface to the phlebostatic axis.
 */
import { useEffect, useMemo, useRef } from 'react';
import * as THREE from 'three';
import { useFrame, useThree } from '@react-three/fiber';
import { CameraControls, Html } from '@react-three/drei';
import { StudioCanvas, damp, IS_PHONE } from '../scene/Studio';
import { LabelChip } from '../scene/labels';
import type { BodyAsset } from '../asset/body';
import type { LinesAsset } from '../asset/lines';
import { lines } from './session';
import { useLinesUI, type LinesView } from './linesStore';
import { useUI } from '../app/store';
import { buildVessels, mergeTubes, VESSEL_LABELS, type Vessel } from './vessels';

type V3 = [number, number, number];
const PIVOT = { y: -0.9, z: -1.25 };
const POLE = new THREE.Vector3(-7.6, 0, 5.4);
const BASIS = new THREE.Matrix4().makeBasis(new THREE.Vector3(0, 0, -1), new THREE.Vector3(-1, 0, 0), new THREE.Vector3(0, 1, 0));
const placement = (bedTop: number) => BASIS.clone().setPosition(-0.9, bedTop + 1.25, 0);
const hobMatrix = (deg: number) => { const a = THREE.MathUtils.degToRad(deg); return new THREE.Matrix4().makeTranslation(0, PIVOT.y, PIVOT.z).multiply(new THREE.Matrix4().makeRotationX(a)).multiply(new THREE.Matrix4().makeTranslation(0, -PIVOT.y, -PIVOT.z)); };
/** a body-frame point after the head-of-bed bend (still in body frame) */
const bendPoint = (p: THREE.Vector3, hobDeg: number) => { const dy = p.y - PIVOT.y; const k = Math.min(1, Math.max(0, (dy + 0.25) / 0.6)); const a = THREE.MathUtils.degToRad(hobDeg) * k * k * (3 - 2 * k); const qz = p.z - PIVOT.z; return new THREE.Vector3(p.x, PIVOT.y + dy * Math.cos(a) - qz * Math.sin(a), PIVOT.z + dy * Math.sin(a) + qz * Math.cos(a)); };
/** body-frame point → world (includes bed height and head-of-bed angle) */
const toWorld = (p: THREE.Vector3) => { const s = lines.setup; return p.clone().applyMatrix4(hobMatrix(s.hob)).applyMatrix4(placement(s.bedH / 10)); };

/* ------------------------------------------------------------------ anatomy paths (body frame, dm) */
const vesselCache = new WeakMap<LinesAsset, Vessel[]>();
export const vesselsOf = (asset: LinesAsset) => { let v = vesselCache.get(asset); if (!v) { v = buildVessels(asset); vesselCache.set(asset, v); } return v; };
const radialOf = (asset: LinesAsset) => vesselsOf(asset).find((v) => v.id === 'radR')!;
/** where the arterial cannula sits (end of the right radial artery) and its distance from the aortic root */
const wristPoint = (asset: LinesAsset) => { const r = radialOf(asset); return r.pts[r.pts.length - 1].clone(); };
const wristDist = (asset: LinesAsset) => { const r = radialOf(asset); return r.s0 + new THREE.CatmullRomCurve3(r.pts, false, 'centripetal').getLength(); };
const CVC_ENTRY = new THREE.Vector3(-0.52, 6.78, 0.62);
function cvcPath(migrated: boolean) {
  const pts = [CVC_ENTRY, new THREE.Vector3(-0.46, 6.55, 0.26), new THREE.Vector3(-0.42, 6.15, 0.25), new THREE.Vector3(-0.36, 5.9, 0.25), new THREE.Vector3(-0.28, 5.62, 0.22), new THREE.Vector3(-0.26, 5.3, 0.2), new THREE.Vector3(-0.25, 5.03, 0.2)];
  if (migrated) pts.push(new THREE.Vector3(-0.18, 4.8, 0.32), new THREE.Vector3(-0.06, 4.62, 0.45), new THREE.Vector3(0.12, 4.58, 0.58));
  return new THREE.CatmullRomCurve3(pts, false, 'centripetal');
}

/* ------------------------------------------------------------------ materials */
/** the same head-of-bed bend the skin uses, for vessels that cross the hip */
function addBend(sh: THREE.WebGLProgramParametersWithUniforms, uHob: { value: number }) {
  sh.uniforms.uHob = uHob;
  sh.vertexShader = sh.vertexShader.replace('#include <common>', '#include <common>\nuniform float uHob;')
    .replace('#include <beginnormal_vertex>', `#include <beginnormal_vertex>\n{ float dy0 = position.y - (${PIVOT.y.toFixed(2)}); float a0 = uHob * smoothstep(-0.25, 0.35, dy0); objectNormal = vec3(objectNormal.x, objectNormal.y * cos(a0) - objectNormal.z * sin(a0), objectNormal.y * sin(a0) + objectNormal.z * cos(a0)); }`)
    .replace('#include <begin_vertex>', `#include <begin_vertex>\n{ float dy = transformed.y - (${PIVOT.y.toFixed(2)}); float ang = uHob * smoothstep(-0.25, 0.35, dy); float cs = cos(ang), sn = sin(ang); float qz = transformed.z - (${PIVOT.z.toFixed(2)}); transformed.y = ${PIVOT.y.toFixed(2)} + dy * cs - qz * sn; transformed.z = ${PIVOT.z.toFixed(2)} + dy * sn + qz * cs; }`);
}
function skinMaterial(uHob: { value: number }) {
  const m = new THREE.MeshPhysicalMaterial({ color: '#d6a58c', roughness: 0.52, sheen: 0.6, sheenColor: new THREE.Color('#ffd7c4'), clearcoat: 0.15, clearcoatRoughness: 0.6, transparent: true, opacity: 0.6, depthWrite: false, side: THREE.FrontSide });
  m.onBeforeCompile = (sh) => {
    sh.uniforms.uHob = uHob;
    const bend = `float dy = transformed.y - (${PIVOT.y.toFixed(2)}); float ang = uHob * smoothstep(-0.25, 0.35, dy); float cs = cos(ang), sn = sin(ang);`;
    sh.vertexShader = sh.vertexShader.replace('#include <common>', '#include <common>\nuniform float uHob;')
      .replace('#include <beginnormal_vertex>', `#include <beginnormal_vertex>\n{ float dy0 = position.y - (${PIVOT.y.toFixed(2)}); float a0 = uHob * smoothstep(-0.25, 0.35, dy0); objectNormal = vec3(objectNormal.x, objectNormal.y * cos(a0) - objectNormal.z * sin(a0), objectNormal.y * sin(a0) + objectNormal.z * cos(a0)); }`)
      .replace('#include <begin_vertex>', `#include <begin_vertex>\n{ ${bend} float qz = transformed.z - (${PIVOT.z.toFixed(2)}); transformed.y = ${PIVOT.y.toFixed(2)} + dy * cs - qz * sn; transformed.z = ${PIVOT.z.toFixed(2)} + dy * sn + qz * cs; }`)
      .replace('#include <dithering_fragment>', '#include <dithering_fragment>\n{ float f = pow(1.0 - abs(dot(normalize(vNormal), normalize(vViewPosition))), 2.0); gl_FragColor.a = clamp(gl_FragColor.a + f * 0.3 * (1.0 - gl_FragColor.a), 0.0, 1.0); }');
  };
  m.customProgramCacheKey = () => 'lines-skin';
  return m;
}
const wet = (color: string, opts: Partial<THREE.MeshPhysicalMaterialParameters> = {}) => new THREE.MeshPhysicalMaterial({ color, roughness: 0.38, clearcoat: 0.6, clearcoatRoughness: 0.3, sheen: 0.4, sheenColor: new THREE.Color('#ffd0c8'), ...opts });

/* ------------------------------------------------------------------ scene */
export function LinesScene({ body, asset }: { body: BodyAsset; asset: LinesAsset }) {
  return (
    <StudioCanvas camera={{ position: [4, 14, 26], fov: 30 }} fog={false}>
      <Room />
      <Bed />
      <Patient body={body} asset={asset} />
      <Pole asset={asset} />
      <Rig asset={asset} />
    </StudioCanvas>
  );
}

function useSetupVersion() { useUI((s) => s.pulse); return `${lines.setup.bedH}|${lines.setup.hob}|${lines.setup.transH}|${lines.art.fault}|${lines.cvp.fault}|${lines.art.stopcock}|${lines.cvp.stopcock}|${lines.art.bag}`; }

function Room() {
  return (<group>
    <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0, 0]} receiveShadow><circleGeometry args={[30, 64]} /><meshStandardMaterial color="#26282c" roughness={0.9} /></mesh>
  </group>);
}

function Bed() {
  const v = useSetupVersion(); void v; const top = lines.setup.bedH / 10; const hob = THREE.MathUtils.degToRad(lines.setup.hob);
  const mat = useMemo(() => new THREE.MeshStandardMaterial({ color: '#dfe3e8', roughness: 0.85 }), []); const frame = useMemo(() => new THREE.MeshStandardMaterial({ color: '#8b9097', roughness: 0.4, metalness: 0.6 }), []);
  return (<group>
    {/* foot section */}
    <mesh material={mat} position={[4.9, top - 0.75, 0]}><boxGeometry args={[9.8, 1.5, 9]} /></mesh>
    {/* head section hinged at the hip */}
    <group position={[0, top, 0]} rotation={[0, 0, -hob]}><mesh material={mat} position={[-5.3, -0.75, 0]}><boxGeometry args={[10.6, 1.5, 9]} /></mesh></group>
    <mesh material={frame} position={[0, top - 1.8, 0]}><boxGeometry args={[21, 0.5, 8.4]} /></mesh>
    {[-9.5, 9].map((x) => [-3.8, 3.8].map((z) => <mesh key={`${x}${z}`} material={frame} position={[x, (top - 2) / 2, z]}><cylinderGeometry args={[0.18, 0.18, top - 2, 12]} /></mesh>))}
  </group>);
}

function Patient({ body, asset }: { body: BodyAsset; asset: LinesAsset }) {
  const uHob = useMemo(() => ({ value: 0 }), []); const skinM = useMemo(() => { const m = skinMaterial(uHob); if (useLinesUI.getState().skin === 'solid') { m.opacity = 1; m.transparent = false; m.depthWrite = true; } return m; }, [uHob]);
  const outer = useRef<THREE.Group>(null); const inner = useRef<THREE.Group>(null);
  const M = asset.meshes; const labels = useLinesUI((s) => s.labels); const view = useLinesUI((s) => s.view);
  const mats = useMemo(() => ({
    ra: wet('#6c5a9a', { transparent: true, opacity: 0.55, depthWrite: false, emissive: new THREE.Color('#3040ff'), emissiveIntensity: 0 }),
    rv: wet('#7a5e8e', { transparent: true, opacity: 0.45, depthWrite: false }),
    la: wet('#b0464a', { transparent: true, opacity: 0.45, depthWrite: false }), lv: wet('#a8373c', { transparent: true, opacity: 0.4, depthWrite: false }),
    valve: wet('#f0e2c6', { roughness: 0.5 }), aorta: wet('#c23a36', { emissive: new THREE.Color('#ff2a1a'), emissiveIntensity: 0 }), vein: wet('#46569e'), pulm: wet('#6b64b0'), pulmv: wet('#c4474a'), portal: wet('#6a5a92'),
  }), []);
  const chambers = useRef<Record<string, THREE.Mesh | null>>({});
  const ccache = useMemo(() => Object.fromEntries(['ra', 'la', 'rv', 'lv', 'septum', 'tricuspid', 'mitral', 'aortic_valve', 'pulm_valve'].map((k) => [k, new THREE.Vector3(...asset.mapping.centres[k])])), [asset]);
  // the whole vascular tree: source meshes (thorax/abdomen) + limb, neck and head vessels from skin landmarks
  const vessels = useMemo(() => vesselsOf(asset), [asset]); const wDist = useMemo(() => wristDist(asset), [asset]);
  const artTree = useMemo(() => mergeTubes(vessels.filter((v) => v.kind === 'artery')), [vessels]);
  const venTree = useMemo(() => mergeTubes(vessels.filter((v) => v.kind === 'vein')), [vessels]);
  const wave = useMemo(() => ({ uFront: { value: -9 }, uAmp: { value: 0 } }), []);
  const artM = useMemo(() => { const m = wet('#c8403a', { emissive: new THREE.Color('#5a0a08'), emissiveIntensity: 0.6 }); m.onBeforeCompile = (sh) => { addBend(sh, uHob); sh.uniforms.uFront = wave.uFront; sh.uniforms.uAmp = wave.uAmp; sh.vertexShader = sh.vertexShader.replace('#include <common>', '#include <common>\nattribute float aS; varying float vS;').replace('#include <begin_vertex>', '#include <begin_vertex>\nvS = aS;'); sh.fragmentShader = sh.fragmentShader.replace('#include <common>', '#include <common>\nvarying float vS; uniform float uFront; uniform float uAmp;').replace('#include <emissivemap_fragment>', '#include <emissivemap_fragment>\n{ float d = vS - uFront; float band = exp(-d*d/0.5) * uAmp; totalEmissiveRadiance += vec3(1.0, 0.3, 0.2) * band * 1.5; }'); }; m.customProgramCacheKey = () => 'artwave-bend'; return m; }, [wave, uHob]);
  const venM = useMemo(() => { const m = wet('#4f62b0', { emissive: new THREE.Color('#0c1440'), emissiveIntensity: 0.6 }); m.onBeforeCompile = (sh) => addBend(sh, uHob); m.customProgramCacheKey = () => 'vein-bend'; return m; }, [uHob]);
  const cvcKey = lines.cvp.fault === 'migrated'; useSetupVersion();
  const cvc = useMemo(() => new THREE.TubeGeometry(cvcPath(cvcKey), 90, 0.022, 8), [cvcKey]);
  const tipPos = useMemo(() => cvcPath(cvcKey).getPoint(1), [cvcKey]);
  const wrist = useMemo(() => wristPoint(asset), [asset]);
  const cathM = useMemo(() => new THREE.MeshPhysicalMaterial({ color: '#f4f6f8', roughness: 0.3, clearcoat: 1 }), []);
  const clotM = useMemo(() => wet('#4a0c10'), []);
  useFrame((st, dtRaw) => {
    const dt = Math.min(0.05, dtRaw); const s = lines.setup; const h = lines.heart; const c = lines.circ; const t = h.t;
    uHob.value = damp(uHob.value, THREE.MathUtils.degToRad(s.hob), 6, dt);
    if (outer.current) { outer.current.matrixAutoUpdate = false; outer.current.matrix.copy(placement(s.bedH / 10)); }
    if (inner.current) { inner.current.matrixAutoUpdate = false; const a = uHob.value; inner.current.matrix.copy(new THREE.Matrix4().makeTranslation(0, PIVOT.y, PIVOT.z).multiply(new THREE.Matrix4().makeRotationX(a)).multiply(new THREE.Matrix4().makeTranslation(0, -PIVOT.y, -PIVOT.z))); }
    // chamber motion from the beat engine
    const lv = h.v[h.v.length - 1]; const la = h.a[h.a.length - 1];
    const vs = lv ? (() => { const u = t - lv.tq - lv.pep; return u < 0 ? 0 : u < lv.et ? Math.sin((Math.PI / 2) * Math.min(1, u / (lv.et * 0.6))) : Math.max(0, 1 - (u - lv.et) / 0.12); })() : 0;
    const as = la && c.rhythm !== 'af' ? Math.exp(-(((t - la.tp - 0.1) / 0.05) ** 2)) : 0.15 * Math.sin(t * 40) ** 2;
    const setScale = (k: string, s0: number) => { const m = chambers.current[k]; if (!m) return; const cc = ccache[k]; m.matrixAutoUpdate = false; m.matrix.makeTranslation(cc.x, cc.y, cc.z).multiply(new THREE.Matrix4().makeScale(s0, s0, s0)).multiply(new THREE.Matrix4().makeTranslation(-cc.x, -cc.y, -cc.z)); };
    setScale('ra', 1 - 0.07 * as); setScale('la', 1 - 0.07 * as); setScale('rv', 1 - 0.07 * vs); setScale('lv', 1 - 0.08 * vs); setScale('septum', 1 - 0.05 * vs);
    // valves: AV valves shut in systole, semilunar valves open in ejection
    mats.valve.emissive.setRGB(0.2 * vs, 0.15 * vs, 0.05 * vs); mats.valve.emissiveIntensity = 1;
    // pressure cues: RA glow ∝ CVP, aorta ∝ central pressure
    mats.ra.emissiveIntensity = Math.min(1, Math.max(0, (h.ra - 2) / 22)) * 0.9;
    mats.aorta.emissiveIntensity = Math.min(1, Math.max(0, (h.ao - 60) / 90)) * 0.7;
    // pulse wavefront travelling to the wrist in the pulse transit time
    // pulse front: reaches the radial cannula in the pulse transit time, and keeps going to the feet
    if (lv) { const u = t - lv.tq - lv.pep; wave.uFront.value = (u / c.ptt) * wDist; wave.uAmp.value = u < c.ptt * 3.2 ? Math.min(1, lv.sv / 70) : 0; }
    // skin: see-through / solid / off (close anatomical views always cut away)
    const sm = useLinesUI.getState().skin; const close = ['heart', 'neck', 'wrist', 'vessels'].includes(useLinesUI.getState().view);
    const op = sm === 'off' ? 0 : useLinesUI.getState().view === 'vessels' ? 0.2 : close ? 0.35 : sm === 'solid' ? 1 : 0.6; skinM.opacity = damp(skinM.opacity, op, 8, dt); skinM.visible = skinM.opacity > 0.02;
    const solid = skinM.opacity > 0.97; if (skinM.depthWrite !== solid) { skinM.depthWrite = solid; skinM.transparent = !solid; skinM.needsUpdate = true; }
    void st;
  });
  const lbl = (text: string, p: V3 | THREE.Vector3, cls = '', info?: string) => <group position={p as never}><Html center zIndexRange={[20, 0]} style={{ pointerEvents: 'none' }}><LabelChip className={`blabel ${cls}`} text={text} info={info} important={cls.includes('b-bad')} /></Html></group>;
  const heartClose = view === 'heart';
  return (
    <group ref={outer}>
      <mesh geometry={body.meshes.skin.geometry} material={skinM} renderOrder={10} />
      <mesh geometry={artTree} material={artM} /><mesh geometry={venTree} material={venM} />
      {labels && view === 'vessels' && VESSEL_LABELS.map((l) => { const v = vessels.find((x) => x.id === l.id); if (!v) return null; const p = new THREE.CatmullRomCurve3(v.pts, false, 'centripetal').getPointAt(l.t); return <group key={l.id} position={bendPoint(p, lines.setup.hob)}><Html zIndexRange={[20, 0]} style={{ pointerEvents: 'none' }}><LabelChip className={`blabel lead ${v.side === 'R' ? 'lead-l' : 'lead-r'} ${v.kind === 'artery' ? 'b-rbc' : 'b-o2'}`} text={l.text ?? v.name} /></Html></group>; })}
      {labels && view === 'vessels' && ([['Aorta', [0.14, 2.6, 0.2], 'r', 'b-rbc'], ['Inferior vena cava', [-0.2, 2.4, 0.1], 'l', 'b-o2'], ['Superior vena cava', [-0.3, 5.35, 0.2], 'l', 'b-o2'], ['Portal vein', [-0.2, 3.55, 0.25], 'l', 'b-plt'], ['Renal artery & vein', [0.6, 2.85, 0.05], 'r', ''], ['Pulmonary artery', [0.25, 5.3, 0.2], 'r', 'b-o2'], ['Celiac trunk / SMA', [0.12, 3.55, 0.4], 'r', 'b-rbc'], ['Iliac veins', [-0.3, 1.2, 0.2], 'l', 'b-o2']] as [string, V3, string, string][]).map(([t, p, side, c]) => <group key={t} position={bendPoint(new THREE.Vector3(...p), lines.setup.hob)}><Html zIndexRange={[20, 0]} style={{ pointerEvents: 'none' }}><LabelChip className={`blabel lead lead-${side} ${c}`} text={t} /></Html></group>)}
      <group ref={inner}>
        {(['ra', 'la', 'rv', 'lv'] as const).map((k) => <mesh key={k} ref={(r) => { chambers.current[k] = r; }} geometry={M[k].geometry} material={mats[k]} renderOrder={5} />)}
        <mesh ref={(r) => { chambers.current.septum = r; }} geometry={M.septum.geometry} material={mats.lv} renderOrder={5} />
        {['tricuspid', 'mitral', 'aortic_valve', 'pulm_valve'].map((k) => <mesh key={k} geometry={M[k].geometry} material={mats.valve} />)}
        <mesh geometry={M.aorta.geometry} material={mats.aorta} /><mesh geometry={M.arch_branches.geometry} material={mats.aorta} />
        <mesh geometry={M.pulm_art.geometry} material={mats.pulm} />
        <mesh geometry={M.svc.geometry} material={mats.vein} /><mesh geometry={M.ivc.geometry} material={mats.vein} /><mesh geometry={M.brachio_veins.geometry} material={mats.vein} />
        <mesh geometry={M.coronary_art.geometry} material={mats.aorta} /><mesh geometry={M.cardiac_veins.geometry} material={mats.vein} />
        <mesh geometry={M.pulm_veins.geometry} material={mats.pulmv} />
        <mesh geometry={M.abd_arteries.geometry} material={mats.aorta} /><mesh geometry={M.abd_veins.geometry} material={mats.vein} /><mesh geometry={M.portal.geometry} material={mats.portal} />
        {/* central venous catheter inside the veins, and the radial cannula */}
        <mesh geometry={cvc} material={cathM} renderOrder={6} />
        <mesh position={tipPos} material={cathM}><sphereGeometry args={[0.035, 12, 10]} /></mesh>
        <mesh position={wrist} material={cathM}><sphereGeometry args={[0.04, 12, 10]} /></mesh>
        {lines.art.fault === 'clot' && <mesh position={wrist} material={clotM}><sphereGeometry args={[0.07, 12, 10]} /></mesh>}
        {labels && heartClose && <>
          {lbl('Right atrium', [-0.62, 4.72, 0.6], 'b-o2')}
          {lbl('Right ventricle', [0.05, 4.22, 0.95], 'b-o2')}
          {lbl('Tricuspid valve', ccache.tricuspid.clone().add(new THREE.Vector3(-0.42, -0.12, 0.4)))}
          {lbl('Left ventricle', [0.85, 4.5, 0.45], 'b-rbc')}
          {lbl('Aorta', [0.35, 5.55, 0.45], 'b-rbc')}
          {lbl('Pulmonary artery', [0.55, 5.25, 0.5], 'b-o2')}
          {lbl('Superior vena cava', [-0.75, 5.5, 0.3], 'b-o2')}
          {lbl(cvcKey ? 'Catheter tip — in the RV!' : 'CVC tip at the cavo-atrial junction', tipPos.clone().add(new THREE.Vector3(-0.55, -0.12, 0.3)), cvcKey ? 'b-bad' : '', cvcKey ? 'cvc tip in the rv' : 'cvc tip')}
        </>}
        {labels && view === 'neck' && <>
          {lbl('Right internal jugular vein', [-1.25, 6.55, 0.35], 'b-o2')}
          {lbl('Common carotid artery', [0.35, 6.75, 0.3], 'b-rbc')}
          {lbl('Central line enters here', CVC_ENTRY.clone().add(new THREE.Vector3(-0.35, 0.25, 0.2)))}
          {lbl('Superior vena cava', [-0.75, 5.45, 0.3], 'b-o2')}
          {lbl(cvcKey ? 'Tip in the RV!' : 'Tip: cavo-atrial junction', tipPos.clone().add(new THREE.Vector3(-0.45, -0.1, 0.3)), cvcKey ? 'b-bad' : '', cvcKey ? 'cvc tip in the rv' : 'cvc tip')}
        </>}
        {labels && view === 'wrist' && <>
          {lbl('Radial artery', wrist.clone().add(new THREE.Vector3(0.1, 0.9, 0.3)), 'b-rbc')}
          {lbl(lines.art.fault === 'clot' ? 'Clot at the catheter tip' : '20 G arterial cannula', wrist.clone().add(new THREE.Vector3(-0.45, -0.15, 0.3)), lines.art.fault === 'clot' ? 'b-bad' : '', lines.art.fault === 'clot' ? 'catheter clot' : 'arterial cannula')}
        </>}
        {labels && view === 'bed' && <>
          {lbl('Central line (right IJ)', CVC_ENTRY.clone().add(new THREE.Vector3(-0.6, 0.35, 0.4)), 'b-o2')}
          {lbl('Radial arterial line', wrist.clone().add(new THREE.Vector3(-0.3, 0.2, 0.6)), 'b-rbc')}
        </>}
      </group>
    </group>
  );
}

/* ------------------------------------------------------------------ pole, transducers, tubing, level line */
function Pole({ asset }: { asset: LinesAsset }) {
  const ver = useSetupVersion(); const labels = useLinesUI((s) => s.labels); const view = useLinesUI((s) => s.view);
  const s = lines.setup; const th = s.transH / 10; const axisH = lines.axis / 10;
  const axisWorld = useMemo(() => toWorld(new THREE.Vector3(asset.mapping.landmarks.sideX - 0.05, 4.8, (asset.mapping.landmarks.chestZ[0] + asset.mapping.landmarks.chestZ[1]) / 2)), [ver, asset]); // eslint-disable-line react-hooks/exhaustive-deps
  const wristW = useMemo(() => toWorld(wristPoint(asset)), [ver, asset]); // eslint-disable-line react-hooks/exhaustive-deps
  const neckW = useMemo(() => toWorld(CVC_ENTRY), [ver]); // eslint-disable-line react-hooks/exhaustive-deps
  const tA = new THREE.Vector3(POLE.x + 0.45, th, POLE.z - 0.1), tC = new THREE.Vector3(POLE.x + 0.45, th, POLE.z + 0.45);
  const tubing = (from: THREE.Vector3, to: THREE.Vector3, sag: number, extra: boolean, kink: boolean) => {
    const mid = from.clone().lerp(to, 0.5); mid.y = Math.min(from.y, to.y) - sag; const pts = [from, from.clone().add(new THREE.Vector3(0, 0.1, 0.9)), mid, to.clone().add(new THREE.Vector3(0.4, -0.6, 0)), to];
    if (kink) pts.splice(1, 0, from.clone().add(new THREE.Vector3(0.25, 0.25, 0.1)), from.clone().add(new THREE.Vector3(0.05, 0.02, 0.35)));
    if (extra) { const c = mid.clone(); for (let k = 0; k < 10; k++) { const a = (k / 10) * Math.PI * 4; pts.splice(3 + k, 0, c.clone().add(new THREE.Vector3(Math.cos(a) * 0.9, Math.sin(a) * 0.9 - 0.4, k * 0.08))); } }
    return new THREE.TubeGeometry(new THREE.CatmullRomCurve3(pts, false, 'centripetal'), 160, 0.03, 8);
  };
  const aF = lines.art.fault, cF = lines.cvp.fault;
  const artTube = useMemo(() => tubing(wristW.clone().add(new THREE.Vector3(0, aF === 'disconnect' ? 0.25 : 0, aF === 'disconnect' ? 0.5 : 0)), tA, 2.2, aF === 'longTubing', aF === 'kink'), [ver]); // eslint-disable-line react-hooks/exhaustive-deps
  const cvpTube = useMemo(() => tubing(neckW.clone().add(new THREE.Vector3(0, cF === 'disconnect' ? 0.3 : 0, cF === 'disconnect' ? 0.4 : 0)), tC, 1.2, cF === 'longTubing', cF === 'kink'), [ver]); // eslint-disable-line react-hooks/exhaustive-deps
  const clear = useMemo(() => new THREE.MeshPhysicalMaterial({ color: '#e9f3ff', transmission: 0.6, roughness: 0.15, thickness: 0.1, transparent: true, opacity: 0.85 }), []);
  const bloody = useMemo(() => new THREE.MeshPhysicalMaterial({ color: '#8a1018', roughness: 0.3, clearcoat: 1, transparent: true, opacity: 0.9 }), []);
  const metal = useMemo(() => new THREE.MeshStandardMaterial({ color: '#b9bec6', metalness: 0.8, roughness: 0.3 }), []);
  const bagRef = useRef<THREE.Mesh>(null);
  const bag = lines.art.bag; const bagScale = 0.55 + 0.45 * Math.min(1, bag / 300);
  const levelErr = lines.levelErr; const lvlCol = Math.abs(levelErr) < 1.5 ? '#6fcf97' : '#e0645a';
  const dashLine = useMemo(() => {
    const a = new THREE.Vector3(POLE.x + 0.45, th, POLE.z), b = new THREE.Vector3(axisWorld.x, th, axisWorld.z); const len = a.distanceTo(b); const n = Math.max(2, Math.floor(len / 0.4));
    const g = new THREE.Group(); const m = new THREE.MeshBasicMaterial({ color: lvlCol, transparent: true, opacity: 0.9 }); const geo = new THREE.CylinderGeometry(0.035, 0.035, 0.24, 6); geo.rotateZ(Math.PI / 2);
    const dir = b.clone().sub(a).normalize(); const q = new THREE.Quaternion().setFromUnitVectors(new THREE.Vector3(1, 0, 0), dir);
    for (let i = 0; i < n; i++) { const d = new THREE.Mesh(geo, m); d.position.copy(a).addScaledVector(dir, (i + 0.5) * (len / n)); d.quaternion.copy(q); g.add(d); }
    return g; }, [ver]); // eslint-disable-line react-hooks/exhaustive-deps
  const bubble = (f: string, p: THREE.Vector3) => f === 'smallBubble' || f === 'largeBubble' ? <mesh position={p.clone().add(new THREE.Vector3(0.9, -0.9, 0.1))}><sphereGeometry args={[f === 'largeBubble' ? 0.11 : 0.055, 14, 10]} /><meshPhysicalMaterial color="#ffffff" transmission={0.9} roughness={0} thickness={0.1} /></mesh> : null;
  const stopcock = (p: THREE.Vector3, open: boolean) => <group position={p.clone().add(new THREE.Vector3(-0.35, 0, 0))}><mesh material={metal}><boxGeometry args={[0.3, 0.12, 0.12]} /></mesh><mesh position={[0, 0.12, 0]} rotation={[0, 0, open ? Math.PI / 2 : 0]}><boxGeometry args={[0.06, 0.3, 0.06]} /><meshStandardMaterial color={open ? '#e0645a' : '#3b82f6'} /></mesh></group>;
  return (<group>
    {/* pole and base */}
    <mesh material={metal} position={[POLE.x, 9, POLE.z]}><cylinderGeometry args={[0.1, 0.1, 18, 12]} /></mesh>
    <mesh material={metal} position={[POLE.x, 0.15, POLE.z]}><cylinderGeometry args={[1.4, 1.5, 0.2, 5]} /></mesh>
    {/* pressure bag + flush bag */}
    <group position={[POLE.x + 0.5, 15.4, POLE.z]}>
      <mesh ref={bagRef} scale={[bagScale, 1, bagScale]}><capsuleGeometry args={[0.75, 1.6, 8, 20]} /><meshPhysicalMaterial color="#e9eef5" roughness={0.6} transparent opacity={0.9} /></mesh>
      <mesh position={[0.9, 0.3, 0]}><cylinderGeometry args={[0.28, 0.28, 0.08, 24]} /><meshStandardMaterial color="#fafafa" /></mesh>
    </group>
    <mesh material={clear} geometry={useMemo(() => new THREE.TubeGeometry(new THREE.CatmullRomCurve3([new THREE.Vector3(POLE.x + 0.5, 14.2, POLE.z), new THREE.Vector3(POLE.x + 0.7, (14 + th) / 2, POLE.z + 0.2), new THREE.Vector3(POLE.x + 0.45, th + 0.3, POLE.z + 0.1)]), 40, 0.03, 6), [th])} />
    {/* transducer manifold (air–fluid interface = the stopcock on top) */}
    <mesh material={metal} position={[POLE.x + 0.3, th, POLE.z + 0.2]}><boxGeometry args={[0.2, 0.9, 1.3]} /></mesh>
    {[tA, tC].map((p, i) => <group key={i}><mesh position={p}><boxGeometry args={[0.5, 0.28, 0.32]} /><meshStandardMaterial color={i ? '#57b6ff' : '#ff5a57'} roughness={0.4} /></mesh>{stopcock(p, (i ? lines.cvp.stopcock : lines.art.stopcock) === 'air' || (i ? cF : aF) === 'openAir')}</group>)}
    <mesh geometry={artTube} material={aF === 'lowBag' || aF === 'disconnect' ? bloody : clear} />
    <mesh geometry={cvpTube} material={cF === 'lowBag' ? bloody : clear} />
    {bubble(aF, tA)}{bubble(cF, tC)}
    {aF === 'disconnect' && <mesh position={[wristW.x + 0.3, lines.setup.bedH / 10 + 0.02, wristW.z + 0.3]} rotation={[-Math.PI / 2, 0, 0]}><circleGeometry args={[0.9, 24]} /><meshStandardMaterial color="#6d0b12" roughness={0.2} /></mesh>}
    {/* levelling line and the phlebostatic axis */}
    <primitive object={dashLine} />
    <mesh position={axisWorld}><sphereGeometry args={[0.12, 16, 12]} /><meshBasicMaterial color="#e9b949" /></mesh>
    {Math.abs(levelErr) >= 1.5 && <mesh position={[axisWorld.x, (th + axisH) / 2, axisWorld.z]}><cylinderGeometry args={[0.02, 0.02, Math.abs(axisH - th), 6]} /><meshBasicMaterial color="#e0645a" /></mesh>}
    {labels && (view === 'bed' || view === 'level') && <>
      <group position={[axisWorld.x, axisWorld.y + 0.45, axisWorld.z]}><Html center zIndexRange={[20, 0]} style={{ pointerEvents: 'none' }}><LabelChip className="blabel b-plt" text="Phlebostatic axis" /></Html></group>
      <group position={[POLE.x + 0.4, th + 0.75, POLE.z + 0.6]}><Html center zIndexRange={[20, 0]} style={{ pointerEvents: 'none' }}><LabelChip className={`blabel ${Math.abs(levelErr) < 1.5 ? '' : 'b-bad'}`} info="transducer level" important text={Math.abs(levelErr) < 1.5 ? (IS_PHONE ? 'Transducers level' : 'Transducers level with the axis') : `${IS_PHONE ? '' : 'Transducer '}${Math.abs(levelErr).toFixed(0)} cm ${levelErr > 0 ? 'below' : 'above'} axis → ${levelErr > 0 ? '+' : '−'}${Math.abs(lines.hydro()).toFixed(1)} mmHg`} /></Html></group>
      {!IS_PHONE && <group position={[POLE.x + 1.6, 15.2, POLE.z]}><Html center zIndexRange={[20, 0]} style={{ pointerEvents: 'none' }}><LabelChip className={`blabel ${bag < 250 ? 'b-bad' : ''}`} info="pressure bag" important text={`Pressure bag ${Math.round(bag)} mmHg`} /></Html></group>}
      {aF === 'openAir' && <group position={[tA.x - 0.4, tA.y - 0.5, tA.z]}><Html center zIndexRange={[20, 0]} style={{ pointerEvents: 'none' }}><LabelChip className="blabel b-bad" important text="Stopcock open to air" /></Html></group>}
    </>}
  </group>);
}

/* ------------------------------------------------------------------ camera */
function Rig({ asset }: { asset: LinesAsset }) {
  const three = useThree(); const ref = useRef<CameraControls>(null); const view = useLinesUI((s) => s.view); const ver = useSetupVersion();
  const aspect = three.size.width / Math.max(1, three.size.height);
  useEffect(() => {
    if (!(aspect > 0.05) || !isFinite(aspect)) return;
    const M = hobMatrix(lines.setup.hob).premultiply(placement(lines.setup.bedH / 10));
    const wdir = (x: number, y: number, z: number) => new THREE.Vector3(x, y, z).transformDirection(M);
    const heartW = toWorld(new THREE.Vector3(-0.08, 5.05, 0.3)); const wristW = toWorld(wristPoint(asset)); const neckW = toWorld(new THREE.Vector3(-0.35, 6.1, 0.3)); const axisW = toWorld(new THREE.Vector3(asset.mapping.landmarks.sideX, 4.8, 0));
    type VD = { tgt: THREE.Vector3; size: [number, number]; dir: THREE.Vector3; up: THREE.Vector3 };
    const Y = new THREE.Vector3(0, 1, 0);
    const V: Record<LinesView, VD> = {
      bed: { tgt: new THREE.Vector3(IS_PHONE ? -4.5 : -3.4, IS_PHONE ? 11 : 10.2, 2.2), size: IS_PHONE ? [14, 15] : [17, 14], dir: new THREE.Vector3(0.55, 0.38, 0.85), up: Y },
      level: { tgt: new THREE.Vector3((axisW.x + POLE.x) / 2 - 0.5, (lines.axis + lines.setup.transH) / 20, 2.5), size: [10, 6.5], dir: new THREE.Vector3(0.05, 0.08, 1), up: Y },
      // anatomical views: look from the front of the body, head at the top of the screen, patient's right on screen-left
      heart: { tgt: heartW, size: [2.9, 2.4], dir: wdir(-0.1, -0.05, 1), up: wdir(0, 1, 0) },
      vessels: { tgt: new THREE.Vector3(0, 0, 0).applyMatrix4(new THREE.Matrix4().copy(placement(lines.setup.bedH / 10))).add(new THREE.Vector3(-0.9, 1.5, 0)), size: [11, 19.5], dir: new THREE.Vector3(0.05, 1, 0.12), up: new THREE.Vector3(-1, 0, 0) },
      neck: { tgt: neckW, size: [3.6, 3.2], dir: wdir(-0.45, 0, 1), up: wdir(0, 1, 0) },
      wrist: { tgt: wristW.clone().add(wdir(0, 0.6, 0)), size: [3.2, 3.2], dir: wdir(-0.2, 0, 1), up: wdir(0, 1, 0) },
    };
    const v = V[view]; const cam = three.camera as THREE.PerspectiveCamera; const t = Math.tan(THREE.MathUtils.degToRad(cam.fov / 2));
    const dist = Math.min(70, Math.max(v.size[1] / (2 * t), v.size[0] / (2 * t * aspect)) * 1.06 + 0.5);
    const d = v.dir.clone().normalize().multiplyScalar(dist);
    cam.up.copy(v.up); ref.current?.updateCameraUp();
    ref.current?.setLookAt(v.tgt.x + d.x, v.tgt.y + d.y, v.tgt.z + d.z, v.tgt.x, v.tgt.y, v.tgt.z, !(window as unknown as { __instant?: boolean }).__instant);
  }, [view, aspect, three.camera, view === 'level' || view === 'bed' ? '' : ver, asset]); // eslint-disable-line react-hooks/exhaustive-deps
  return <CameraControls ref={ref} makeDefault minDistance={1.5} maxDistance={60} smoothTime={0.6} />;
}
