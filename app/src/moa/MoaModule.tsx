/** Drugs module: mechanism graph (SVG) + patient response from an existing engine + Lesson Director. */
import { useEffect, useMemo, useRef, useState } from 'react';
import { useUI } from '../app/store';
import { director, useDirector } from '../director/director';
import { DirectorPlayer } from '../director/Player';
import { useMoa } from './moaStore';
import { MECHANISMS, MECH } from './registry';
import { layout, ranks } from './layout';
import { moaTimeline } from './moaTimeline';
import type { MechKind, MechanismDefinition } from './types';

const KIND: Record<MechKind, { c: string; name: string }> = {
  drug: { c: '#d3b27a', name: 'Drug' }, receptor: { c: '#a98bf0', name: 'Receptor' }, transducer: { c: '#5fd0c4', name: 'G protein / transducer' },
  messenger: { c: '#6fb7ff', name: 'Second messenger' }, channel: { c: '#f2a65a', name: 'Channel' }, enzyme: { c: '#f2a65a', name: 'Enzyme' },
  cell: { c: '#ff8a8a', name: 'Cell effect' }, organ: { c: '#e65a5a', name: 'Organ effect' }, vital: { c: '#f2eee8', name: 'Vital sign' },
};
const NW = 176, NH = 46;

export function MoaModule() {
  const defId = useMoa((s) => s.defId); const def = MECH[defId];
  const tl = useMemo(() => moaTimeline(def), [def]);
  const mode = useUI((s) => s.mode);
  useEffect(() => { director.load(tl, false); director.seek(0); return () => director.unload(); }, [tl]);
  useEffect(() => { (window as unknown as { __CCMoa: unknown }).__CCMoa = { store: useMoa, timeline: () => tl }; }, [tl]);
  return (
    <main className="stage moa-stage">
      <section className="scene-pane">
        <div className="scene-wrap moa-wrap"><MechGraph def={def} /><Selectivity def={def} /></div>
      </section>
      <aside className="side-pane">
        <section className="card story">
          <div className="chips" role="list">{MECHANISMS.map((m) => <button key={m.id} role="listitem" className={`chip${m.id === defId ? ' on' : ''}`} onClick={() => useMoa.getState().set({ defId: m.id })}>{m.drug}</button>)}</div>
          <p className="muted" style={{ marginTop: 10 }}>{def.drugClass}</p>
        </section>
        <DirectorPlayer />
        <Vitals def={def} />
        {mode !== 'explore' && <p className="muted small" style={{ padding: '0 4px' }}>Learn, Challenge and Simulate views for drugs are coming; the narrated mechanism above is the lesson.</p>}
        <p className="credit">Mechanism graph: original teaching summary. Patient response: {def.patient?.engine ?? '—'} ({def.patient?.scenario}) — an existing engine of this app; the drug layer only sets exposure.</p>
      </aside>
    </main>
  );
}

function MechGraph({ def }: { def: MechanismDefinition }) {
  // size the canvas to the graph (one step per causal layer); flow top → bottom when the pane is tall
  const box = useRef<HTMLDivElement>(null); const [vertical, setVertical] = useState(false);
  useEffect(() => { const el = box.current; if (!el) return; const ro = new ResizeObserver(() => setVertical(el.clientWidth / Math.max(1, el.clientHeight) < 1.35)); ro.observe(el); return () => ro.disconnect(); }, []);
  const { W, H } = useMemo(() => { const r = ranks(def); const cols: Record<number, number> = {}; Object.values(r).forEach((k) => { cols[k] = (cols[k] ?? 0) + 1; }); const steps = Math.max(...Object.values(r)), wide = Math.max(...Object.values(cols));
    return vertical ? { W: Math.max(820, 214 * wide + 180), H: Math.max(720, 84 * steps + 90) } : { W: 200 * steps + 220, H: Math.max(360, 92 * wide + 80) }; }, [def, vertical]);
  const placed = useMemo(() => layout(def, W, H, vertical), [def, W, H, vertical]); const at = Object.fromEntries(placed.map((p) => [p.node.id, p]));
  const lit = useMoa((s) => s.lit); const hover = useMoa((s) => s.hover); const set = useMoa.getState().set;
  const on = (id: string) => at[id].rank <= lit;
  const hv = hover ? def.nodes.find((n) => n.id === hover) : null;
  return (
    <div className="moa-graph" ref={box}>
      <svg preserveAspectRatio="xMidYMid meet" viewBox={`0 0 ${W} ${H}`} role="img" aria-label={`${def.drug} mechanism of action`}>
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
            <g key={i} className={`moa-edge${live ? ' live' : ''}${inh ? ' inh' : ''}${none ? ' none' : ''}`} style={{ color: none ? '#8a939a' : inh ? '#6fb7ff' : '#d3b27a' }}>
              <path d={d} fill="none" stroke="currentColor" strokeWidth={live ? 2.2 : 1.2} strokeDasharray={none ? '5 5' : undefined} markerEnd={none ? undefined : inh ? 'url(#bar)' : 'url(#arr)'} />
              {live && [0, 0.33, 0.66].map((o) => <circle key={o} r="3.6" fill="currentColor" filter="url(#glow)"><animateMotion dur="1.6s" begin={`${o * 1.6}s`} repeatCount="indefinite" path={d} /></circle>)}
              {e.label && <text x={mx + (vertical ? 6 : 0)} y={my - 6} className="moa-elbl" textAnchor={vertical ? 'start' : 'middle'}>{e.label}</text>}
            </g>
          );
        })}
        {placed.map((p) => {
          const k = KIND[p.node.kind]; const live = on(p.node.id);
          return (
            <g key={p.node.id} className={`moa-node${live ? ' live' : ''}${hover === p.node.id ? ' hover' : ''}`} transform={`translate(${p.x - NW / 2},${p.y - NH / 2})`} onMouseEnter={() => set({ hover: p.node.id })} onMouseLeave={() => set({ hover: null })} onClick={() => set({ hover: p.node.id })}>
              <rect width={NW} height={NH} rx="10" fill={live ? k.c : 'rgba(255,255,255,.04)'} fillOpacity={live ? 0.2 : 1} stroke={k.c} strokeOpacity={live ? 0.95 : 0.35} strokeWidth={live ? 1.6 : 1} filter={live ? 'url(#glow)' : undefined} />
              <text x={NW / 2} y={p.node.sub ? 19 : 28} textAnchor="middle" className="moa-lbl">{p.node.label}</text>
              {p.node.sub && <text x={NW / 2} y={35} textAnchor="middle" className="moa-sub">{p.node.sub}</text>}
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
  if (!def.patient) return null; const r = def.patient.readouts();
  const fx = (v: number, d = 0) => v.toFixed(d);
  return (
    <section className="card nums">
      <div className="card-h"><h3>Patient response</h3><span className="muted small">{def.patient.scenario} · {def.patient.doseLabel(u)}</span></div>
      <div className="numgrid">{r.map((x) => <div key={x.id} className="num"><span className="nl">{x.label}</span><span className="nv">{fx(x.value, x.digits)}</span><span className="nu">{x.unit}</span></div>)}</div>
    </section>
  );
}
