/**
 * Cell scenes: the sliced-open cell (heart, nerve or textbook cell) and the membrane close-up.
 * Everything that moves comes from the simulator; everything it does to the cell (size,
 * excitability, charge) comes from the patient model.
 */
import { useEffect, useMemo, useRef } from 'react';
import * as THREE from 'three';
import { useFrame, useThree } from '@react-three/fiber';
import { Html } from '@react-three/drei';
import { bench } from '../bench';
import { useLabUI } from '../labStore';
import { makeSim } from './build';
import { cellModel, targetCounts, SPECIES, defaultCellType, type Story, type CellType } from './model';
import type { CellSim, Particle } from './sim';
import { live, actionPotential, neuronSpike } from './live';
import { WholeCell } from './whole';
import { Patch } from './patch';
import { PATCH_OFF, CLIP } from './common';

export { PATCH_OFF, CLIP };
let traceOwner: CellSim | null = null;

export function NewCell({ story }: { story: Story }) {
  const gl = useThree((s) => s.gl); useEffect(() => { gl.localClippingEnabled = true; }, [gl]);
  const sel = useLabUI((s) => s.cellType); const lab = useLabUI((s) => s.lab); const cellType: CellType = sel ?? defaultCellType(lab);
  const sims = useMemo(() => ({ cell: makeSim(story, cellType, 'cell'), patch: makeSim(story, cellType, 'patch', 5) }), [story, cellType]);
  const key = useRef({ ver: -1, lab: '', sims: null as unknown });
  const whole = useRef<THREE.Group>(null), patch = useRef<THREE.Group>(null);
  useFrame((_, dtRaw) => {
    const ui = useLabUI.getState();
    if (bench.version !== key.current.ver || ui.lab !== key.current.lab || key.current.sims !== sims) {
      key.current = { ver: bench.version, lab: ui.lab, sims };
      const m = cellModel(ui.lab, bench.snap, bench.pt, cellType);
      if (m) { sims.cell.setModel(m, targetCounts(m, sims.cell.cfg.scale)); sims.patch.setModel(m, targetCounts(m, sims.patch.cfg.scale)); live.model = m; }
    }
    live.cell = sims.cell; live.patch = sims.patch;
    for (let rem = Math.min(0.25, dtRaw); rem > 1e-4; rem -= 0.05) { const h = Math.min(0.05, rem); sims.cell.step(h); sims.patch.step(h); }
    const m = live.model; const zoom = ui.cellView === 'zoom';
    if (m) {
      const sim = zoom ? sims.patch : sims.cell;
      const vm = m.fire === 'beat' ? actionPotential(sim.beatClock, m.rmp, m.beat) : m.fire === 'spike' ? neuronSpike(sim.beatClock, m.rmp, m.beat) : m.rmp; live.vm = vm;
      const tr = live.trace; if (traceOwner !== sim) { traceOwner = sim; tr.n = 0; tr.i = 0; } tr.t[tr.i] = sim.time; tr.v[tr.i] = vm; tr.i = (tr.i + 1) % tr.t.length; tr.n = Math.min(tr.t.length, tr.n + 1);
    }
    if (whole.current) whole.current.visible = !zoom; if (patch.current) patch.current.visible = zoom;
  });
  return (
    <>
      <group ref={whole}><WholeCell sim={sims.cell} cellType={cellType} /></group>
      <group ref={patch} position={PATCH_OFF} visible={false}><Patch sim={sims.patch} cellType={cellType} /></group>
      <Picker sims={sims} />
    </>
  );
}

/* ================================================================== tap a molecule to name it */
function Picker({ sims }: { sims: { cell: CellSim; patch: CellSim } }) {
  const three = useThree(); const tip = useRef<THREE.Group>(null); const tipEl = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const el = three.gl.domElement; let down: { x: number; y: number } | null = null;
    const onDown = (e: PointerEvent) => { down = { x: e.clientX, y: e.clientY }; };
    const onUp = (e: PointerEvent) => {
      if (!down || Math.hypot(e.clientX - down.x, e.clientY - down.y) > 6) { down = null; return; } down = null;
      const ui = useLabUI.getState(); const zoom = ui.cellView === 'zoom'; const sim = zoom ? sims.patch : sims.cell; const r = el.getBoundingClientRect();
      const root = tip.current?.parent; if (!root) return; const base = root.matrixWorld.clone(); if (zoom) base.multiply(new THREE.Matrix4().makeTranslation(PATCH_OFF.x, PATCH_OFF.y, PATCH_OFF.z));
      let best: Particle | null = null, bd = (zoom ? 30 : 22) ** 2; const v = new THREE.Vector3();
      for (const p of sim.particles) {
        if (p.state === 'dead' || p.alpha < 0.3) continue; v.copy(p.pos).applyMatrix4(base);
        v.project(three.camera); if (v.z > 1) continue; const sx = (v.x * 0.5 + 0.5) * r.width, sy = (-v.y * 0.5 + 0.5) * r.height; const dd = (sx - (e.clientX - r.left)) ** 2 + (sy - (e.clientY - r.top)) ** 2; if (dd < bd) { bd = dd; best = p; }
      }
      ui.set({ picked: best ? { sim: zoom ? 'patch' : 'cell', id: best.id } : null });
    };
    el.addEventListener('pointerdown', onDown); el.addEventListener('pointerup', onUp);
    return () => { el.removeEventListener('pointerdown', onDown); el.removeEventListener('pointerup', onUp); };
  }, [three, sims]);
  useFrame(() => {
    const pk = useLabUI.getState().picked; const g = tip.current; if (!g) return;
    const sim = pk?.sim === 'patch' ? sims.patch : sims.cell; const p = pk ? sim.particles.find((x) => x.id === pk.id && x.state !== 'dead') : null;
    g.visible = !!p; if (!p) return;
    g.position.copy(p.pos).add(pk!.sim === 'patch' ? PATCH_OFF : new THREE.Vector3());
    const m = live.model; const st = m?.species.find((x) => x.key === p.sp); const sp = SPECIES[p.sp];
    const v = p.comp === 'in' ? st?.inside ?? 0 : st?.outside ?? 0; const vs = v < 0.01 ? '0.0001' : v < 10 ? v.toFixed(1) : v.toFixed(0);
    const conc = st && p.sp !== 'w' && p.sp !== 'osm' ? ` · ${p.comp === 'in' ? 'inside' : 'outside'} the cell: ${vs} ${sp.unit}` : '';
    if (tipEl.current) tipEl.current.innerHTML = `<b style="color:${sp.color}">${sp.label}</b> ${sp.name}<br><span>${p.doing}${conc}</span>`;
  });
  return <group ref={tip}><Html zIndexRange={[30, 0]} style={{ pointerEvents: 'none' }}><div className="picktip" ref={tipEl} /></Html></group>;
}
