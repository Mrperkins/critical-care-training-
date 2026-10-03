/**
 * The sliced-open cell: anatomy (anatomy/cells.ts), transporter studs on the rim, ions in the
 * cytosol under the glassy cut face and in the fluid around the cell, and labels.
 */
import { useEffect, useMemo, useRef, useState } from 'react';
import * as THREE from 'three';
import { LabelChip, useSceneLabelMode } from '../../scene/labels';
import { useFrame, useThree } from '@react-three/fiber';
import { Html } from '@react-three/drei';
import { useLabUI, useLabelMode } from '../labStore';
import { TRANSPORTERS, SPECIES, type TransporterKind, type SpeciesKey, type CellType } from './model';
import type { CellSim, Particle } from './sim';
import { buildCell, type BuiltCell } from './anatomy/cells';
import { live } from './live';
import { OpenCell } from './openAssets';
import { Sprites, Studs, CLIP, focusNow } from './common';

const cache = new Map<CellType, BuiltCell>();
export function getCell(type: CellType) { let c = cache.get(type); if (!c) { c = buildCell(type, CLIP); cache.set(type, c); } return c; }

export function WholeCell({ sim, cellType }: { sim: CellSim; cellType: CellType }) {
  const built = useMemo(() => getCell(cellType), [cellType]);
  // the round textbook cell can use the vendored high-fidelity model (HIGH/MEDIUM tiers); procedural geometry otherwise
  const tier = useLabUI((s) => s.visualTier); const [openReady, setOpenReady] = useState(false);
  useEffect(() => { if (cellType !== 'round' || tier === 'low') setOpenReady(false); }, [cellType, tier]);
  const useOpen = cellType === 'round' && tier !== 'low';
  const all = useRef<THREE.Group>(null), body = useRef<THREE.Group>(null), ghost = useRef<THREE.Group>(null);
  const ghostMat = useMemo(() => new THREE.LineDashedMaterial({ color: '#dff2ff', dashSize: 0.09, gapSize: 0.07, transparent: true, opacity: 0 }), []);
  const ghostLines = useMemo(() => built.outline.map((l) => { const g = new THREE.BufferGeometry().setFromPoints([...l, l[0]].map((v) => new THREE.Vector3(v.x, built.def.cut + 0.09, v.y))); const line = new THREE.Line(g, ghostMat); line.computeLineDistances(); return line; }), [built, ghostMat]);
  useFrame((st) => {
    const m = live.model; const s = sim.scale; body.current?.scale.setScalar(s);
    const b = m?.fire === 'beat' ? sim.beatPulse : 0; all.current?.scale.set(1 - 0.05 * b, 1 + 0.015 * b, 1 + 0.015 * b);
    CLIP.constant = built.def.cut * s + 0.0005; // world y of the slice (the cell group sits at y = 0)
    const depol = m ? Math.max(0, Math.min(1, (m.rmp - m.rmpNormal) / Math.max(4, m.threshold - m.rmpNormal))) : 0;
    const hyper = m ? Math.max(0, Math.min(1, (m.rmpNormal - m.rmp) / 15)) : 0;
    const f = focusNow(); const pulse = f.kind === 'vm' || f.kind === 'threshold' || f.kind === 'volume' ? 0.06 + 0.05 * Math.sin(st.clock.elapsedTime * 4) : 0;
    built.tick(st.clock.elapsedTime, { beat: b, spike: m?.fire === 'spike' ? sim.beatPulse : 0, depol, hyper, swell: Math.min(1, Math.abs(sim.vol - 1) * 5), glow: (m?.fire === 'none' ? 0 : sim.beatPulse * 0.35) + pulse });
    const d = Math.abs(sim.vol - 1); ghostMat.opacity = Math.min(0.85, d * 9) * (f.kind === 'volume' ? 1 : 0.75); if (ghost.current) ghost.current.visible = d > 0.01;
  });
  return (
    <group ref={all}>
      <group ref={body}><primitive object={built.root} visible={!useOpen || !openReady} />{useOpen && <OpenCell onReady={setOpenReady} />}<OrganelleLabels built={built} /></group>
      <group ref={ghost}>{ghostLines.map((l, i) => <primitive key={i} object={l} />)}</group>
      <Studs sim={sim} size={cellType === 'neuron' ? 1.3 : 1.5} />
      <Sprites sim={sim} size={0.17} only="in" order={3} />
      <Sprites sim={sim} size={0.17} only="out" order={9} />
      <TransportLabels sim={sim} built={built} />
    </group>
  );
}

function OrganelleLabels({ built }: { built: BuiltCell }) {
  const mode = useLabelMode(); const three = useThree(); const phone = typeof window !== 'undefined' && window.matchMedia('(max-width: 760px)').matches;
  const keep = phone ? built.anchors.filter((a) => ['nucleus', 'membrane', 'mito', 'rer', 'golgi', 'myofibril', 'disc', 'nissl', 'dendrite', 'myelin', 'hillock', 'ttub', 'lyso', 'centriole', 'spines'].includes(a.key)) : built.anchors;
  const groups = useRef<(THREE.Group | null)[]>([]), labels = useRef<(HTMLDivElement | null)[]>([]), lines = useRef<(HTMLSpanElement | null)[]>([]);
  const tmp = useMemo(() => new THREE.Vector3(), []);
  // greedy layout in screen space: each label keeps its dot on the structure and slides up/down on a leader line until it no longer overlaps another
  useFrame(() => {
    if (mode !== 'organelles') return; const W = three.size.width, H = three.size.height;
    const items = keep.map((_, i) => { const g = groups.current[i]; if (!g) return null; g.getWorldPosition(tmp).project(three.camera); return { i, x: (tmp.x * 0.5 + 0.5) * W, y: (-tmp.y * 0.5 + 0.5) * H, w: (labels.current[i]?.offsetWidth ?? 120) + 4 }; }).filter(Boolean) as { i: number; x: number; y: number; w: number }[];
    items.sort((a, b) => a.y - b.y); const placed: { x: number; y: number; w: number }[] = [];
    for (const it of items) {
      let dy = 0; for (const c of [0, -22, 22, -44, 44, -66, 66, -88, 88, -110, 110]) { const r = { x: it.x + 9, y: it.y + c - 10, w: it.w }; if (!placed.some((q) => r.x < q.x + q.w && q.x < r.x + r.w && r.y < q.y + 20 && q.y < r.y + 20)) { dy = c; break; } }
      placed.push({ x: it.x + 9, y: it.y + dy - 10, w: it.w });
      const el = labels.current[it.i], ln = lines.current[it.i]; if (el) el.style.transform = `translate(9px, ${dy - 10}px)`; if (ln) { ln.style.top = `${Math.min(0, dy)}px`; ln.style.height = `${Math.abs(dy)}px`; }
    }
  });
  if (mode !== 'organelles') return null;
  return (<group>{keep.map((a, i) => <group key={a.key} position={a.pos} ref={(r) => { groups.current[i] = r; }}><Html zIndexRange={[20, 0]} style={{ pointerEvents: 'none' }}><div className="oanc"><i className="odot" /><span className="oline" ref={(r) => { lines.current[i] = r; }} /><LabelChip className="olabel" ref={(r) => { labels.current[i] = r as unknown as HTMLDivElement; }} text={a.label} info={`cell ${a.key}`} /></div></Html></group>)}</group>);
}

function TransportLabels({ sim, built }: { sim: CellSim; built: BuiltCell }) {
  const mode = useLabelMode(); const on = mode === 'transport'; const shown = useSceneLabelMode() !== 'off';
  const kinds = useMemo(() => [...new Set(sim.sites.map((s) => s.kind))] as TransporterKind[], [sim]);
  const refs = useRef<(THREE.Group | null)[]>([]); const three = useThree(); const pick = useRef<Record<string, number>>({}); const clock = useRef(0);
  const tracer = useRef<THREE.Group>(null); const tracerText = useRef<HTMLDivElement>(null); const tracerP = useRef<Particle | null>(null);
  const tmp = useMemo(() => ({ p: new THREE.Vector3(), c: new THREE.Vector3(), n: new THREE.Vector3() }), []);
  useFrame((_, dt) => {
    if (!on) return; clock.current -= dt; const parent = refs.current[0]?.parent; const mw = parent?.matrixWorld;
    if (clock.current <= 0 && mw) {
      clock.current = 0.8; tmp.c.copy(three.camera.position); const chosen: THREE.Vector3[] = [];
      for (const k of kinds) { let best = -1, bs = -Infinity; const bp = new THREE.Vector3(); for (const s of sim.sites) { if (s.kind !== k) continue; sim.sitePos(s, tmp.p).applyMatrix4(mw); tmp.n.copy(tmp.c).sub(tmp.p).normalize(); let sc = tmp.n.dot(s.n) + (pick.current[k] === s.i ? 0.2 : 0); for (const q of chosen) { const dd = q.distanceTo(tmp.p); if (dd < 1.8) sc -= (1.8 - dd) * 1.5; } if (sc > bs) { bs = sc; best = s.i; bp.copy(tmp.p); } } if (best >= 0) { pick.current[k] = best; chosen.push(bp); } }
    }
    kinds.forEach((k, i) => { const g = refs.current[i]; const si = pick.current[k]; if (!g || si === undefined) return; const s = sim.sites[si]; g.position.copy(sim.sitePos(s, tmp.p)).addScaledVector(s.n, 0.34).add(new THREE.Vector3(0, 0.12, 0)); });
    const f = focusNow(); const m = live.model; const key: SpeciesKey | undefined = f.kind === 'species' ? f.key : m?.species.find((x) => x.emph >= 1)?.key;
    let tp = tracerP.current;
    if (!tp || tp.state === 'dead' || tp.state === 'fade-out' || tp.sp !== key || (tp.state === 'free' && Math.random() < dt / 3)) { tp = sim.particles.find((p) => p.sp === key && (p.state === 'move' || p.state === 'held')) ?? sim.particles.find((p) => p.sp === key && p.state === 'free') ?? null; tracerP.current = tp; }
    if (tracer.current) { tracer.current.visible = !!tp; if (tp) tracer.current.position.copy(tp.pos); }
    if (tracerText.current && tp) tracerText.current.textContent = `${SPECIES[tp.sp].label} · ${tp.doing}`;
  });
  if (!on) return null;
  const o = built.def.out; const outside = new THREE.Vector3(o.cx - o.rx * 0.75, built.def.cut + 0.6, -o.rz * 0.55);
  return (<group>
    {kinds.map((k, i) => <group key={k} ref={(r) => { refs.current[i] = r; }}><Html center zIndexRange={[20, 0]} style={{ pointerEvents: 'none' }}><LabelChip className={`tag3d tk tk-${k}`} text={TRANSPORTERS[k].short} /></Html></group>)}
    <group position={outside}><Html center zIndexRange={[20, 0]} style={{ pointerEvents: 'none' }}><LabelChip className="tag3d zone" text="Outside · extracellular fluid" info="extracellular fluid" /></Html></group>
    {shown && <group ref={tracer}><Html zIndexRange={[21, 0]} style={{ pointerEvents: 'none' }}><div className="tracer" ref={tracerText} /></Html></group>}
  </group>);
}
