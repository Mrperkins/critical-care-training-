/**
 * Overlay for the new cell scenes: view switch (whole / cutaway / membrane), live readouts
 * (membrane potential trace or cell-volume gauge), a legend with real concentrations, and the
 * cause → effect stepper that also drives what the 3D scene highlights.
 */
import { useEffect, useRef } from 'react';
import { useUI } from '../../app/store';
import { useLabUI } from '../labStore';
import { live } from './live';
import { SPECIES, TRANSPORTERS, CELL_TYPES, type Focus, type SpeciesKey, type CellModel } from './model';
import type { LabelMode, VisualTier } from '../labStore';
import { getCell } from './whole';
import { OPEN_CELL_CREDIT } from './openAssets';
import type { CellView } from './build';

/** Master labels on/off switch (shared by every microscopic view). */
export function LabelsToggle() {
  const on = useLabUI((s) => s.labelsOn);
  return <button className={`tgl${on ? ' on' : ''}`} aria-pressed={on} onClick={() => useLabUI.getState().set({ labelsOn: !on })}>Labels: {on ? 'On' : 'Off'}</button>;
}
/** Collapsible header for the readout panel. */
export function GaugeHead({ title, short, value, bad }: { title: string; short: string; value: React.ReactNode; bad?: boolean }) {
  const open = useLabUI((s) => s.gaugeOpen);
  return <button className="cg-h cg-toggle" aria-expanded={open} onClick={() => useLabUI.getState().set({ gaugeOpen: !open })}><span><span className="long">{title}</span><span className="short">{short}</span></span><b className={bad ? 'bad' : ''}>{value}</b><i className="cg-chev" aria-hidden="true">{open ? '−' : '+'}</i></button>;
}

const sameFocus = (a: Focus | null, b: Focus) => !!a && JSON.stringify(a) === JSON.stringify(b);

export function goCellView(v: CellView) {
  const ui = useLabUI.getState(); if (v === ui.cellView) return;
  const zoomSwitch = v === 'zoom' || ui.cellView === 'zoom';
  if (!zoomSwitch) { ui.set({ cellView: v, picked: null }); return; }
  ui.set({ veil: 1 });
  setTimeout(() => { useLabUI.getState().set({ cellView: v, picked: null }); setTimeout(() => useLabUI.getState().set({ veil: 0 }), 120); }, 260);
}

import { useDirector } from '../../director/director';

export function CellHud() {
  useUI((s) => s.pulse); const ui = useLabUI(); const m = live.model;
  // restart the story when the lab or its first step changes
  const sig = m ? m.labId + '|' + m.chain.map((c) => c.focus.kind + (c.tone ?? '')).join(',') + '|' + m.headline.split(' ')[0] : '';
  const last = useRef(''); useEffect(() => { if (sig !== last.current) { last.current = sig; useLabUI.getState().set({ step: 0, chipFocus: null, ...(useDirector.getState().tl ? {} : { cameraTargetId: null }) }); } }, [sig]); // a running lesson owns the camera
  useEffect(() => {
    if (!ui.autoplay) return; const id = setInterval(() => { const s = useLabUI.getState(); if (s.autoplay && live.model) s.set({ step: (s.step + 1) % Math.max(1, live.model.chain.length) }); }, 5200);
    return () => clearInterval(id);
  }, [ui.autoplay]);
  if (!m) return null;
  const n = m.chain.length; const step = ((ui.step % n) + n) % n; const cur = m.chain[step];
  return (
    <div className="cellhud">
      {m.cellType === 'round' && ui.visualTier !== 'low' && <div className="asset-credit">3D base: <a href={OPEN_CELL_CREDIT.url} target="_blank" rel="noreferrer">{OPEN_CELL_CREDIT.title}</a> · {OPEN_CELL_CREDIT.license}</div>}
      <div className="ch-views">
        <div className="seg small" role="group" aria-label="Cell type">{CELL_TYPES.map(([k, l, full]) => <button key={k} title={full} className={m.cellType === k ? 'on' : ''} onClick={() => ui.set({ cellType: k, picked: null, chipFocus: null })}>{l}</button>)}</div>
        <div className="seg small" role="group" aria-label="View">{([['whole', 'Cell'], ['zoom', 'Membrane']] as [CellView, string][]).map(([k, l]) => <button key={k} className={ui.cellView === k ? 'on' : ''} onClick={() => { ui.set({ cameraTargetId: null }); goCellView(k); }}>{l}</button>)}</div>
        {ui.cellView === 'whole' && <div className="seg small ch-focus" role="group" aria-label="Focus on organelle">{([['cell.nucleus', 'Nucleus', 'nucleus'], ['cell.mitochondria', 'Mito', 'mito'], ['cell.er', 'ER', 'rer'], ['cell.golgi', 'Golgi', 'golgi']] as const).filter(([, , a]) => getCell(ui.cellType ?? m.cellType).anchors.some((x) => x.key === a)).map(([id, l]) => <button key={id} className={ui.cameraTargetId === id ? 'on' : ''} onClick={() => ui.set({ cameraTargetId: ui.cameraTargetId === id ? null : id, cellView: 'whole', autoplay: false })}>{l}</button>)}</div>}
        {ui.cellView === 'zoom' && <div className="seg small ch-focus" role="group" aria-label="Focus on membrane protein">{([['membrane.nak_atpase', 'Na/K pump', 'pump'], ['membrane.nav', 'Nav1.5', 'nachan'], ['membrane.kir', 'Kir2.1', 'kchan'], ['membrane.aqp', 'AQP4', 'aqp']] as const).filter(([, , k]) => live.patch?.sites.some((x) => x.kind === k)).map(([id, l]) => <button key={id} className={ui.cameraTargetId === id ? 'on' : ''} onClick={() => ui.set({ cameraTargetId: ui.cameraTargetId === id ? null : id, autoplay: false })}>{l}</button>)}</div>}
        <div className="seg small ch-quality" role="group" aria-label="Cell visual quality">{([['high', 'High'], ['medium', 'Medium'], ['low', 'Low']] as [VisualTier, string][]).map(([k, l]) => <button key={k} className={ui.visualTier === k ? 'on' : ''} onClick={() => ui.set({ visualTier: k })}>{l}</button>)}</div>
        <LabelsToggle />
        {ui.labelsOn && <div className="seg small ch-labels" role="group" aria-label="Which labels">{([['organelles', 'Organelles'], ['transport', 'Transport']] as [LabelMode, string][]).map(([k, l]) => <button key={k} className={ui.labelMode === k ? 'on' : ''} onClick={() => ui.set({ labelMode: k })}>{l}</button>)}</div>}
      </div>
      {m.story === 'membrane' ? <VmPanel m={m} focus={cur?.focus} /> : <VolumePanel m={m} focus={cur?.focus} />}
      <div className="ch-bottom">
        <Legend m={m} />
        {cur && <div className={`ch-step tone-${cur.tone ?? 'none'}`}>
          <button className="ch-arrow" aria-label="Previous step" onClick={() => ui.set({ step: step - 1 + n, autoplay: false, chipFocus: null })}>‹</button>
          <div className="ch-text"><span className="ch-n">{step + 1}/{n}</span>{cur.text}</div>
          <button className="ch-arrow" aria-label="Next step" onClick={() => ui.set({ step: step + 1, autoplay: false, chipFocus: null })}>›</button>
          <button className="ch-play" aria-label={ui.autoplay ? 'Pause' : 'Play'} onClick={() => ui.set({ autoplay: !ui.autoplay })}>{ui.autoplay ? '❚❚' : '▶'}</button>
        </div>}
      </div>
      <div className="ch-veil" style={{ opacity: ui.veil }} />
    </div>
  );
}

function Legend({ m }: { m: CellModel }) {
  const chip = useLabUI((s) => s.chipFocus);
  const fmt = (v: number) => (v < 0.01 ? '0.0001' : v < 10 ? v.toFixed(1) : v.toFixed(0));
  return (
    <div className="ch-legend">
      {m.species.map((s) => {
        const sp = SPECIES[s.key]; const f: Focus = { kind: 'species', key: s.key as SpeciesKey }; const on = sameFocus(chip, f);
        const text = s.key === 'w' ? `cell ${Math.round((live.cell?.vol ?? m.volume) * 100)} %` : s.key === 'osm' ? `${Math.round(m.osmolytes * 100)} % of normal` : `in ${fmt(s.inside)} · out ${fmt(s.outside)}`;
        return <button key={s.key} className={`lg-chip${on ? ' on' : ''}`} onClick={() => useLabUI.getState().set({ chipFocus: on ? null : f, autoplay: on })} title={sp.name}><i className={`gl gl-${s.key}`} style={{ background: sp.color, color: sp.ink }}>{s.key === 'w' ? '' : s.key === 'osm' ? '' : sp.label}</i><b>{s.key === 'w' ? 'Water' : s.key === 'osm' ? 'Osmolytes' : sp.label}</b><span>{text}</span></button>;
      })}
    </div>
  );
}

/* ------------------------------------------------------------------ membrane potential */
function VmPanel({ m, focus }: { m: CellModel; focus?: Focus }) {
  const ref = useRef<HTMLCanvasElement>(null); const val = useRef<HTMLSpanElement>(null);
  useEffect(() => {
    const c = ref.current!; const ctx = c.getContext('2d')!; let raf = 0; let w = 0, h = 0;
    const ro = new ResizeObserver(() => { const r = c.getBoundingClientRect(); const d = Math.min(2, devicePixelRatio || 1); w = r.width; h = r.height; c.width = w * d; c.height = h * d; ctx.setTransform(d, 0, 0, d, 0, 0); }); ro.observe(c);
    const Y = (mv: number) => 4 + (h - 8) * (1 - (mv + 105) / 145); // −105 … +40 mV
    const draw = () => {
      raf = requestAnimationFrame(draw); if (!w) return; const mm = live.model; if (!mm) return; const tr = live.trace;
      ctx.clearRect(0, 0, w, h);
      // threshold & resting lines
      ctx.setLineDash([3, 3]); ctx.strokeStyle = 'rgba(233,185,73,0.75)'; ctx.lineWidth = 1; ctx.beginPath(); ctx.moveTo(0, Y(mm.threshold)); ctx.lineTo(w, Y(mm.threshold)); ctx.stroke();
      ctx.strokeStyle = 'rgba(255,255,255,0.18)'; ctx.beginPath(); ctx.moveTo(0, Y(0)); ctx.lineTo(w, Y(0)); ctx.stroke(); ctx.setLineDash([]);
      ctx.fillStyle = 'rgba(233,185,73,0.9)'; ctx.font = '500 9.5px "IBM Plex Mono", monospace'; ctx.fillText(`threshold ${mm.threshold.toFixed(0)}`, 4, Y(mm.threshold) - 3);
      ctx.fillStyle = 'rgba(255,255,255,0.35)'; ctx.fillText('0 mV', w - 30, Y(0) - 3);
      // trace: last 3 s of sim time
      if (tr.n > 2) {
        const newest = tr.t[(tr.i - 1 + tr.t.length) % tr.t.length]; ctx.strokeStyle = '#7cc4d4'; ctx.lineWidth = 1.6; ctx.beginPath(); let first = true;
        for (let k = tr.n - 1; k >= 0; k--) { const ix = (tr.i - 1 - k + tr.t.length * 2) % tr.t.length; const age = newest - tr.t[ix]; if (age > 3 || age < 0) continue; const x = w * (1 - age / 3); const y = Y(tr.v[ix]); if (first) { ctx.moveTo(x, y); first = false; } else ctx.lineTo(x, y); }
        ctx.stroke();
      }
      if (val.current) val.current.textContent = `${live.vm > 0 ? '+' : ''}${live.vm.toFixed(0)} mV`;
    };
    raf = requestAnimationFrame(draw); return () => { cancelAnimationFrame(raf); ro.disconnect(); };
  }, []);
  const hot = focus?.kind === 'vm' || focus?.kind === 'threshold'; const open = useLabUI((s) => s.gaugeOpen);
  const gap = m.threshold - m.rmp, gapN = m.thrNormal - m.rmpNormal;
  return (
    <div className={`ch-gauge${hot ? ' hot' : ''}${open ? '' : ' closed'}`}>
      <GaugeHead title="Membrane potential" short="Voltage" value={<span ref={val}>{m.rmp.toFixed(0)} mV</span>} />
      <canvas ref={ref} className="cg-trace" aria-label="Membrane potential trace" />
      <div className="cg-row"><span>resting</span><b>{m.rmp.toFixed(0)}</b><span>gap to threshold</span><b className={Math.abs(gap - gapN) > 5 ? 'bad' : ''}>{gap.toFixed(0)} mV</b></div>
      {m.cellType !== 'round' && <div className={`cg-bar${focus?.kind === 'transporter' && focus.t === 'nachan' ? ' hot' : ''}`}><span>Na⁺ channels ready</span><div><i style={{ width: `${Math.round(m.naAvail * 100)}%`, background: TRANSPORTERS.nachan.color }} /></div><b>{Math.round(m.naAvail * 100)} %</b></div>}
      <div className={`cg-bar${focus?.kind === 'transporter' && focus.t === 'pump' ? ' hot' : ''}`}><span>Na⁺/K⁺ pump</span><div><i style={{ width: `${Math.min(100, m.pumpRate / 3 * 100)}%`, background: TRANSPORTERS.pump.color }} /></div><b>×{m.pumpRate.toFixed(1)}</b></div>
    </div>
  );
}

/* ------------------------------------------------------------------ cell volume */
function VolumePanel({ m, focus }: { m: CellModel; focus?: Focus }) {
  const vol = live.cell?.vol ?? m.volume; const pct = Math.round(vol * 100);
  const pos = (v: number) => `${Math.min(100, Math.max(0, (v - 0.8) / 0.4 * 100))}%`;
  const hot = focus?.kind === 'volume'; const open = useLabUI((s) => s.gaugeOpen);
  return (
    <div className={`ch-gauge${hot ? ' hot' : ''}${open ? '' : ' closed'}`}>
      <GaugeHead title="Cell volume" short="Volume" value={`${pct} %`} bad={Math.abs(vol - 1) > 0.05} />
      <div className="cg-vol"><div className="cg-track"><i className="cg-norm" style={{ left: '50%' }} /><i className="cg-now" style={{ left: pos(vol) }} /><i className="cg-tgt" style={{ left: pos(m.volume) }} /></div><div className="cg-ticks"><span>80 %</span><span>normal</span><span>120 %</span></div></div>
      <div className="cg-row"><span>plasma osmolality</span><b className={Math.abs(m.plasmaOsm - 290) > 12 ? 'bad' : ''}>{m.plasmaOsm.toFixed(0)}</b></div>
      <div className={`cg-bar${focus?.kind === 'transporter' && focus.t === 'vrac' ? ' hot' : ''}`}><span>Osmolytes inside</span><div><i style={{ width: `${Math.min(100, m.osmolytes / 1.3 * 100)}%`, background: SPECIES.osm.color }} /></div><b>{Math.round(m.osmolytes * 100)} %</b></div>
      <div className="cg-row"><span>brain adapted to Na⁺</span><b>{m.naBrain.toFixed(0)}</b></div>
    </div>
  );
}

/** Side-pane card: every step of the story, tappable. */
export function CellStory() {
  useUI((s) => s.pulse); const ui = useLabUI(); const m = live.model; if (!m) return null;
  const n = m.chain.length; const step = ((ui.step % n) + n) % n;
  return (
    <section className="card cellstory">
      <div className="card-h"><h3>What’s happening in the cell</h3><span className="muted small">{m.headline}</span></div>
      <ol className="story">{m.chain.map((c, i) => <li key={i} className={`${i === step ? 'on' : ''} tone-${c.tone ?? 'none'}`}><button onClick={() => ui.set({ step: i, autoplay: false, chipFocus: null })}>{c.text}</button></li>)}</ol>
      <p className="muted small">Tap any molecule in the scene to name it. Every crossing you see goes through a named transporter at the rate the patient model sets; particle numbers are drawn on a compressed scale, the numbers in the legend are real.</p>
    </section>
  );
}
