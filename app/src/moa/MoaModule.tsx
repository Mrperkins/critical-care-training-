/** Drugs module: mechanism graph (SVG) + patient response from an existing engine + Lesson Director. */
import { useEffect, useMemo, useRef, useState } from 'react';
import { useUI } from '../app/store';
import { Seg } from '../vent/VentPanel';
import { director, useDirector } from '../director/director';
import { DirectorPlayer } from '../director/Player';
import { useMoa } from './moaStore';
import { MECH, MOA_GROUPS, MECHANISMS, withContext } from './registry';
import { emphasis, branches, compare, LEVELS, mainDrug, type Level } from './modes';
import { ADVERSE, TIMECOURSE, lessonsForDrug } from './meta';
import { lessonById } from '../director/lessonIndex';
import { openLesson } from '../app/navigate';
import { Knob } from '../vent/VentPanel';
import { snapshotBench, restoreBench } from './benchAdapter';
import { layout, ranks } from './layout';
import { moaTimeline } from './moaTimeline';
import type { MechKind, MechanismDefinition } from './types';
import { SceneWrap } from '../scene/labels';

const KIND: Record<MechKind, { c: string; name: string }> = {
  drug: { c: '#d3b27a', name: 'Drug' }, receptor: { c: '#a98bf0', name: 'Receptor' }, transducer: { c: '#5fd0c4', name: 'G protein / transducer' },
  messenger: { c: '#6fb7ff', name: 'Second messenger' }, channel: { c: '#f2a65a', name: 'Channel' }, enzyme: { c: '#f2a65a', name: 'Enzyme' },
  cell: { c: '#ff8a8a', name: 'Cell effect' }, organ: { c: '#e65a5a', name: 'Organ effect' }, vital: { c: '#f2eee8', name: 'Vital sign' },
};
const NW = 176, NH = 46;
/** squeeze a label into the node box when it would overflow (approximate glyph width in px) */
const fit = (t: string, w: number) => (t.length * w > NW - 12 ? { textLength: NW - 12, lengthAdjust: 'spacingAndGlyphs' as const } : {});

export function MoaModule() {
  const defId = useMoa((s) => s.defId); const ctx = useMoa((s) => s.ctx); const def = useMemo(() => withContext(MECH[defId], ctx), [defId, ctx]);
  // bench-based demos borrow the Labs patient: remember it on entry, give it back on exit
  useEffect(() => { snapshotBench(); return () => restoreBench(); }, []);
  const tl = useMemo(() => moaTimeline(def), [def]);
  const mode = useUI((s) => s.mode);
  useEffect(() => { director.load(tl, false); director.seek(0); return () => director.unload(); }, [tl]);
  // Explore and Compare: the whole chain is lit and the learner owns the dose; Guided: the Director drives it
  const moaMode = useMoa((s) => s.mode);
  useEffect(() => { if (moaMode === 'guided') { director.seek(0); return; } director.pause(); const r = ranks(def); useMoa.getState().set({ lit: Math.max(...Object.values(r)), exposure: 1 }); def.patient?.exposure(1); }, [moaMode, def]);
  useEffect(() => { (window as unknown as { __CCMoa: unknown }).__CCMoa = { store: useMoa, timeline: () => tl }; }, [tl]);
  return (
    <main className="stage moa-stage">
      <section className="scene-pane">
        <SceneWrap className="moa-wrap" labels={false}><MechGraph def={def} /><Selectivity def={def} /></SceneWrap>
      </section>
      <aside id="controls" tabIndex={-1} className="side-pane" aria-label="Controls and readings"><h2 className="sr-only">Controls and readings</h2>
        <ReturnBanner />
        <section className="card story">
          <div className="moa-groups">{MOA_GROUPS.map((g) => <div key={g.label} className="moa-group"><div className="eyebrow">{g.label}</div><div className="chips" role="group" aria-label={g.label}>{g.ids.map((id) => MECH[id]).map((m) => <button key={m.id} className={`chip${m.id === defId ? ' on' : ''}`} aria-pressed={m.id === defId} onClick={() => useMoa.getState().set({ defId: m.id, ctx: null })}>{m.drug}</button>)}</div></div>)}</div>
          <p className="muted" style={{ marginTop: 10 }}>{def.drugClass}</p>
          {def.contexts && <div className="moa-ctx"><div className="eyebrow">Same drug, different patient</div><Seg small value={ctx ?? def.contexts[0].id} options={def.contexts.map((c) => [c.id, c.label] as [string, string])} onChange={(v) => useMoa.getState().set({ ctx: v })} /><p className="muted small">{(def.contexts.find((c) => c.id === ctx) ?? def.contexts[0]).note}</p></div>}
        </section>
        <ModeBar def={def} />
        {moaMode === 'guided' && <DirectorPlayer />}
        {moaMode === 'explore' && <ExploreCard def={def} />}
        {moaMode === 'compare' && <CompareCard def={def} />}
        <Vitals def={def} />
        <AdverseCard def={def} />
        <TimeCard id={def.id} />
        <LessonsCard id={def.id} />
        {mode !== 'explore' && <p className="muted small" style={{ padding: '0 4px' }}>Challenge and Simulate views for drugs are coming; Guided, Explore and Compare above cover learning.</p>}
        <p className="credit">Mechanism graph: original teaching summary. Patient response: {def.patient ? <>{def.patient.engine} ({def.patient.scenario}) — an existing engine of this app; the drug layer only sets exposure.</> : 'none yet (see above).'}</p>
      </aside>
    </main>
  );
}

function MechGraph({ def }: { def: MechanismDefinition }) {
  // size the canvas to the graph (one step per causal layer); flow top → bottom when the pane is tall
  const box = useRef<HTMLDivElement>(null); const [vertical, setVertical] = useState(false);
  useEffect(() => { const el = box.current; if (!el) return; const ro = new ResizeObserver(() => setVertical(el.clientWidth / Math.max(1, el.clientHeight) < 1.35)); ro.observe(el); return () => ro.disconnect(); }, []);
  const { W, H } = useMemo(() => { const r = ranks(def); const cols: Record<number, number> = {}; Object.values(r).forEach((k) => { cols[k] = (cols[k] ?? 0) + 1; }); const steps = Math.max(...Object.values(r)), wide = Math.max(...Object.values(cols));
    return vertical ? { W: Math.max(820, 214 * Math.min(4, wide) + 180), H: Math.max(720, (wide > 4 ? 120 : 84) * steps + 90) } : { W: 200 * steps + 220, H: Math.max(360, 92 * wide + 80) }; }, [def, vertical]);
  const placed = useMemo(() => layout(def, W, H, vertical), [def, W, H, vertical]); const at = Object.fromEntries(placed.map((p) => [p.node.id, p]));
  const lit = useMoa((s) => s.lit); const hover = useMoa((s) => s.hover); const set = useMoa.getState().set;
  const on = (id: string) => at[id].rank <= lit;
  const level = useMoa((s) => s.level); const branch = useMoa((s) => s.branch); const focus = useMoa((s) => s.focus); const adverse = useMoa((s) => s.adverse); const moaMode = useMoa((s) => s.mode);
  const emph = useMemo(() => emphasis(def, { level, branch, focus, adverse, adverseIds: ADVERSE[def.id]?.nodes ?? [] }), [def, level, branch, focus, adverse]);
  const hv = hover ? def.nodes.find((n) => n.id === hover) : null;
  return (
    <div className="moa-graph" ref={box}>
      <svg preserveAspectRatio="xMidYMid meet" viewBox={`0 0 ${W} ${H}`} role="group" aria-label={`${def.drug} mechanism of action`}>
        <defs>
          <marker id="arr" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="7" markerHeight="7" orient="auto-start-reverse"><path d="M0,0 L10,5 L0,10 z" fill="currentColor" /></marker>
          <marker id="bar" viewBox="0 0 10 10" refX="5" refY="5" markerWidth="8" markerHeight="8" orient="auto"><path d="M5,0 L5,10" stroke="currentColor" strokeWidth="3" /></marker>
          <filter id="glow"><feGaussianBlur stdDeviation="4" result="b" /><feMerge><feMergeNode in="b" /><feMergeNode in="SourceGraphic" /></feMerge></filter>
        </defs>
        {def.edges.map((e, i) => {
          const a = at[e.from], b = at[e.to];
          const [x1, y1, x2, y2] = vertical ? [a.x, a.y + NH / 2, b.x, b.y - NH / 2 - 4] : [a.x + NW / 2, a.y, b.x - NW / 2 - 4, b.y]; const mx = (x1 + x2) / 2, my = (y1 + y2) / 2;
          const d = vertical ? `M${x1},${y1} C${x1},${my} ${x2},${my} ${x2},${y2}` : `M${x1},${y1} C${mx},${y1} ${mx},${y2} ${x2},${y2}`; const none = e.effect === 'none'; const live = on(e.from) && on(e.to) && !none; const inh = e.sign < 0;
          return (
            <g key={i} className={`moa-edge${live ? ' live' : ''}${inh ? ' inh' : ''}${none ? ' none' : ''}${emph[e.from] === 'dim' || emph[e.to] === 'dim' ? ' dim' : ''}`} style={{ color: none ? '#8a939a' : inh ? '#6fb7ff' : '#d3b27a' }}>
              <path d={d} fill="none" stroke="currentColor" strokeWidth={live ? 2.2 : 1.2} strokeDasharray={none ? '5 5' : undefined} markerEnd={none ? undefined : inh ? 'url(#bar)' : 'url(#arr)'} />
              {live && [0, 0.33, 0.66].map((o) => <circle key={o} r="3.6" fill="currentColor" filter="url(#glow)"><animateMotion dur="1.6s" begin={`${o * 1.6}s`} repeatCount="indefinite" path={d} /></circle>)}
              {e.label && <text x={mx + (vertical ? 6 : 0)} y={my - 6} className="moa-elbl" textAnchor={vertical ? 'start' : 'middle'}>{e.label}</text>}
            </g>
          );
        })}
        {placed.map((p) => {
          const k = KIND[p.node.kind]; const live = on(p.node.id);
          return (
            <g key={p.node.id} className={`moa-node${live ? ' live' : ''}${hover === p.node.id ? ' hover' : ''} e-${emph[p.node.id]}`} transform={`translate(${p.x - NW / 2},${p.y - NH / 2})`} onMouseEnter={() => set({ hover: p.node.id })} onMouseLeave={() => set({ hover: null })}
              onClick={() => set(moaMode === 'explore' ? { focus: focus === p.node.id ? null : p.node.id, hover: p.node.id } : { hover: p.node.id })} role="button" tabIndex={0} aria-label={`${p.node.label}${p.node.explain ? ': ' + p.node.explain : ''}`}
              onKeyDown={(ev) => { if (ev.key === 'Enter' || ev.key === ' ') { ev.preventDefault(); set(moaMode === 'explore' ? { focus: focus === p.node.id ? null : p.node.id, hover: p.node.id } : { hover: p.node.id }); } }}>
              {emph[p.node.id] === 'adverse' && <text x={NW - 10} y={14} textAnchor="middle" className="moa-adv">⚠</text>}
              <rect width={NW} height={NH} rx="10" fill={live ? k.c : 'rgba(255,255,255,.04)'} fillOpacity={live ? 0.2 : 1} stroke={k.c} strokeOpacity={live ? 0.95 : 0.35} strokeWidth={live ? 1.6 : 1} filter={live ? 'url(#glow)' : undefined} />
              <text x={NW / 2} y={p.node.sub ? 19 : 28} textAnchor="middle" className="moa-lbl" {...fit(p.node.label, 7.4)}>{p.node.label}</text>
              {p.node.sub && <text x={NW / 2} y={35} textAnchor="middle" className="moa-sub" {...fit(p.node.sub, 5.8)}>{p.node.sub}</text>}
            </g>
          );
        })}
      </svg>
      <div className="moa-key">{(['drug', 'receptor', 'transducer', 'messenger', 'enzyme', 'organ', 'vital'] as MechKind[]).map((k) => <span key={k}><i style={{ background: KIND[k].c }} />{KIND[k].name}</span>)}<span><i className="inh" />Inhibits</span></div>
      {hv?.explain && <div className="moa-tip"><b>{hv.label}</b> {hv.explain}</div>}
    </div>
  );
}

function Selectivity({ def }: { def: MechanismDefinition }) {
  if (!def.selectivity) return null;
  return (
    <div className="moa-sel" aria-label="Receptor selectivity">
      <div className="eyebrow">Receptor activity</div>
      {def.selectivity.map((s) => <div key={s.receptor} className="moa-sel-row"><span>{s.receptor}</span><i><b style={{ width: `${s.activity * 100}%` }} /></i></div>)}
    </div>
  );
}

function Vitals({ def }: { def: MechanismDefinition }) {
  useUI((s) => s.pulse); useDirector((s) => s.t);
  const u = useMoa((s) => s.exposure);
  if (!def.patient) return def.patientNote ? <section className="card nums"><div className="card-h"><h3>Patient response</h3></div><p className="muted small">{def.patientNote}</p></section> : null; const r = def.patient.readouts();
  const fx = (v: number, d = 0) => v.toFixed(d);
  return (
    <section className="card nums">
      <div className="card-h"><h3>Patient response</h3><span className="muted small">{def.patient.scenario} · {def.patient.doseLabel(u)}</span></div>
      <div className="numgrid">{r.map((x) => <div key={x.id} className="num"><span className="nl">{x.label}</span><span className="nv">{fx(x.value, x.digits)}</span><span className="nu">{x.unit}</span></div>)}</div>
    </section>
  );
}

function ReturnBanner() {
  const r = useMoa((s) => s.returnTo); if (!r) return null;
  const mm = `${Math.floor(r.t / 60)}:${String(Math.floor(r.t % 60)).padStart(2, '0')}`;
  return <button className="card moa-return" onClick={() => { useMoa.getState().set({ returnTo: null }); openLesson(r.lessonId, r.t); }}>↩ Back to the lesson <b>{r.title}</b> at {mm} — the same patient, the same moment</button>;
}

function ModeBar({ def }: { def: MechanismDefinition }) {
  const m = useMoa(); const br = branches(def);
  return (
    <section className="card moa-modes">
      <div className="nd-row"><span className="muted small">Mode</span><Seg small value={m.mode} options={[['guided', 'Guided'], ['explore', 'Explore'], ['compare', 'Compare']]} onChange={(v) => m.set({ mode: v as typeof m.mode, focus: null })} /></div>
      <div className="nd-row"><span className="muted small">Level</span><Seg small value={m.level} options={LEVELS} onChange={(v) => m.set({ level: v as Level })} /></div>
      {br.length > 0 && <div className="nd-row"><span className="muted small">Branches</span><div className="chips"><button className={`chip${!m.branch ? ' on' : ''}`} onClick={() => m.set({ branch: null })}>Show all</button>{br.map((b) => <button key={b.id} className={`chip${m.branch === b.id ? ' on' : ''}`} onClick={() => m.set({ branch: b.id })}>{b.label} only</button>)}</div></div>}
      <div className="chips"><button className={`chip${m.adverse ? ' on bad' : ''}`} aria-pressed={m.adverse} onClick={() => m.set({ adverse: !m.adverse })}>⚠ Adverse effects</button></div>
      {m.branch && <p className="muted small">Only the {br.find((b) => b.id === m.branch)?.label} branch is drawn; the patient response still reflects the whole drug.</p>}
    </section>
  );
}

function ExploreCard({ def }: { def: MechanismDefinition }) {
  useUI((s) => s.pulse); const u = useMoa((s) => s.exposure); const focus = useMoa((s) => s.focus); const n = focus ? def.nodes.find((x) => x.id === focus) : null;
  return (
    <section className="card">
      <div className="card-h"><h3>Explore</h3><span className="muted small">click any node</span></div>
      {def.patient && <Knob label="Dose" value={Math.round(u * 100)} min={0} max={100} step={5} unit=" %" onChange={(v) => { def.patient!.exposure(v / 100); useMoa.getState().set({ exposure: v / 100 }); useUI.getState().set({ pulse: useUI.getState().pulse + 1 }); }} hint={def.patient.doseLabel(u)} />}
      {n ? <p className="explain"><b>{n.label}.</b> {n.explain ?? n.sub ?? ''} <span className="muted small">Highlighted: everything upstream that causes it and everything downstream it causes.</span></p>
        : <p className="muted small">Pick a node to trace what drives it and what it drives. Start at {def.nodes.find((x) => x.id === mainDrug(def))?.label}.</p>}
    </section>
  );
}

function CompareCard({ def }: { def: MechanismDefinition }) {
  const other = useMoa((s) => s.compareId); const group = MOA_GROUPS.find((g) => g.ids.includes(def.id));
  const pool = MECHANISMS.filter((m) => m.id !== def.id && (m.patient || m.contexts));
  const ordered = [...pool.filter((m) => group?.ids.includes(m.id)), ...pool.filter((m) => !group?.ids.includes(m.id))];
  const b = other ? withContext(MECH[other], null) : null;
  const res = useMemo(() => { if (!b || !def.patient) return null; const r = compare(def, b); def.patient.exposure(useMoa.getState().exposure); return r; }, [def, b]); // eslint-disable-line react-hooks/exhaustive-deps
  const f = (x: number) => `${x > 0 ? '+' : ''}${Math.abs(x) >= 10 ? x.toFixed(0) : x.toFixed(1)}`;
  return (
    <section className="card">
      <div className="card-h"><h3>Compare</h3><span className="muted small">change from no drug to the demo dose</span></div>
      <div className="chips">{ordered.slice(0, 12).map((m) => <button key={m.id} className={`chip${other === m.id ? ' on' : ''}`} onClick={() => useMoa.getState().set({ compareId: m.id })}>{m.drug}</button>)}</div>
      {!def.patient && <p className="muted small">This drug has no patient model yet, so there is nothing to compare.</p>}
      {res && b && <>
        {!res.sameScenario && <p className="muted small">Different demo patients ({def.patient!.scenario} vs {b.patient!.scenario}) — compare directions, not exact numbers.</p>}
        {res.rows.length ? <table className="cmp"><thead><tr><th /><th>{def.drug}</th><th>{b.drug}</th></tr></thead><tbody>{res.rows.map((r) => <tr key={r.id}><td>{r.label}</td><td className={r.a > 0 ? 'up' : r.a < 0 ? 'dn' : ''}>{f(r.a)} <small>{r.unit}</small></td><td className={r.b > 0 ? 'up' : r.b < 0 ? 'dn' : ''}>{f(r.b)} <small>{r.unit}</small></td></tr>)}</tbody></table>
          : <p className="muted small">These two act on different systems (no shared read-outs) — compare their graphs instead.</p>}
        <p className="muted small"><b>{b.drug}</b> — {b.drugClass}.</p>
      </>}
    </section>
  );
}

function AdverseCard({ def }: { def: MechanismDefinition }) {
  const on = useMoa((s) => s.adverse); const a = ADVERSE[def.id]; if (!on || !a) return null;
  return <section className="card"><div className="card-h"><h3>⚠ Adverse effects</h3></div><p className="small">{a.note}</p>{a.nodes.length === 0 && <p className="muted small">None of these are drawn as nodes in this graph.</p>}</section>;
}

const LOGX = (m: number) => Math.log10(Math.max(0.2, m));
function TimeCard({ id }: { id: string }) {
  const t = TIMECOURSE[id]; if (!t) return null;
  const W = 260, L = LOGX(0.2), R = LOGX(3000), X = (m: number) => 60 + ((LOGX(m) - L) / (R - L)) * (W - 70);
  const bar = (y: number, r: [number, number], label: string, cls: string) => <g><text x={4} y={y + 8} className="dr-lab">{label}</text><rect x={X(r[0])} y={y} width={Math.max(3, X(r[1]) - X(r[0]))} height={10} rx={3} className={cls} /></g>;
  const fmt = (m: number) => (m < 1 ? `${Math.round(m * 60)} s` : m < 60 ? `${Math.round(m)} min` : m < 1440 ? `${+(m / 60).toFixed(1)} h` : `${+(m / 1440).toFixed(1)} d`);
  const rng = (r: [number, number]) => (r[0] === r[1] ? fmt(r[0]) : `${fmt(r[0])}–${fmt(r[1])}`);
  return (
    <section className="card">
      <div className="card-h"><h3>Time course</h3><span className="muted small">{t.route} · typical</span></div>
      <svg viewBox={`0 0 ${W} 70`} className="dr-svg tc-svg" role="img" aria-label={`Onset ${rng(t.onset)}, peak ${rng(t.peak)}, duration ${rng(t.duration)}`}>
        {bar(4, t.onset, 'onset', 'tc-on')}{bar(20, t.peak, 'peak', 'tc-pk')}{bar(36, t.duration, 'duration', 'tc-du')}
        {[[1, '1 min'], [10, '10 min'], [60, '1 h'], [360, '6 h'], [1440, '1 d']].map(([m, l]) => <g key={l as string}><line x1={X(m as number)} x2={X(m as number)} y1={2} y2={52} className="tc-grid" /><text x={X(m as number)} y={64} textAnchor="middle" className="dr-lab">{l}</text></g>)}
      </svg>
      <p className="muted small">Onset {rng(t.onset)} · peak {rng(t.peak)} · duration / offset {rng(t.duration)}.{t.note ? ` ${t.note}` : ''} Teaching ranges — patients and products vary.</p>
    </section>
  );
}

function LessonsCard({ id }: { id: string }) {
  const ls = lessonsForDrug(id).map((l) => lessonById(l)).filter(Boolean) as NonNullable<ReturnType<typeof lessonById>>[]; if (!ls.length) return null;
  return <section className="card"><div className="card-h"><h3>Used in lessons</h3></div><div className="chips">{ls.map((l) => <button key={l.tl.id} className="chip" onClick={() => openLesson(l.tl.id)}>{l.tl.title} →</button>)}</div></section>;
}
