import { useMemo, useState } from 'react';
import { lab } from './lab';
import { useUI } from '../app/store';
import { ABG_PRESETS } from '../scenarios/abg';
import { ABG_ACTIONS } from '../scenarios/abgChallenges';
import { interpret, type Disorder } from '../physiology/interpret';
import { AcidBaseMap, SampleCards } from './AbgPanel';
import { AbgTable } from '../vent/VentSim';
import type { Snapshot } from '../physiology/patient';

const PRIMARY: [string, (d: Disorder[], hagma: boolean) => boolean][] = [
  ['Respiratory acidosis', (d) => d.length === 1 && d[0] === 'resp acidosis'],
  ['Respiratory alkalosis', (d) => d.length === 1 && d[0] === 'resp alkalosis'],
  ['Metabolic acidosis — high anion gap', (d, h) => d.length === 1 && d[0] === 'met acidosis' && h],
  ['Metabolic acidosis — normal anion gap', (d, h) => d.length === 1 && d[0] === 'met acidosis' && !h],
  ['Metabolic alkalosis', (d) => d.length === 1 && d[0] === 'met alkalosis'],
  ['Two primary disorders (mixed)', (d) => d.length > 1],
];
let seed = Date.now() % 100000; const rnd = () => ((seed = (seed * 16807) % 2147483647) / 2147483647);

export function AbgChallenge() {
  useUI((s) => s.pulse);
  const [round, setRound] = useState(0); const [score, setScore] = useState({ right: 0, total: 0 });
  const [a1, setA1] = useState<number | null>(null); const [a2, setA2] = useState<number | null>(null); const [a3, setA3] = useState<number | null>(null);
  const [before, setBefore] = useState<Snapshot | null>(null);
  const caseData = useMemo(() => {
    const pool = ABG_PRESETS.filter((p) => p.id !== 'normal'); const p = pool[Math.floor(rnd() * pool.length)];
    lab.load(p.id);
    // vary severity ±15 % so no two cases look identical
    const pp = lab.pt.p; for (const k of ['drive', 'ketoneProd', 'lactateProd', 'otherUA', 'lowVQ', 'shunt'] as const) (pp as unknown as Record<string, number>)[k] = (pp as unknown as Record<string, number>)[k] * (0.85 + 0.3 * rnd());
    lab.fastForward(15);
    const g = lab.snap; const it = interpret({ pH: g.pH, paco2: g.paco2, hco3: g.hco3, pao2: g.pao2, fio2: lab.pt.p.fio2, na: g.na, cl: g.cl, albumin: g.albumin, age: lab.pt.p.age });
    const primary = PRIMARY.findIndex(([, f]) => f(it.primary, it.hagma));
    const compOpts = ['Appropriate compensation', 'Plus a respiratory acidosis (under-breathing)', 'Plus a respiratory alkalosis (over-breathing)', 'Plus a metabolic alkalosis', 'Plus a metabolic acidosis'];
    const sec = it.secondary[0]; const comp = !sec ? 0 : sec === 'resp acidosis' ? 1 : sec === 'resp alkalosis' ? 2 : sec === 'met alkalosis' ? 3 : 4;
    const act = ABG_ACTIONS[p.id]; const order = [0, 1, 2, 3].sort(() => rnd() - 0.5);
    return { p, it, primary: primary < 0 ? 5 : primary, compOpts, comp: it.primary.length > 1 ? -1 : comp, act, order, snap: { ...g, vbg: { ...g.vbg } } };
  }, [round]); // eslint-disable-line react-hooks/exhaustive-deps
  const next = () => { setA1(null); setA2(null); setA3(null); setBefore(null); setRound(round + 1); };
  const mark = (ok: boolean) => setScore((s) => ({ right: s.right + (ok ? 1 : 0), total: s.total + 1 }));
  const g = caseData.snap;
  return (
    <div className="chal-run">
      <section className="card"><div className="card-h"><div className="eyebrow">Blood-gas challenge · case {round + 1}</div><span className="pill">{score.right}/{score.total}</span></div>
        <h2 className="h2">{caseData.p.story}</h2>
        <div className="abg-row"><span className="abg-t">Arterial gas{lab.pt.vent ? ' · ventilated' : ` · FiO₂ ${lab.pt.p.fio2.toFixed(2)}`}</span>
          <span>pH <b>{g.pH.toFixed(2)}</b></span><span>PaCO₂ <b>{g.paco2.toFixed(0)}</b></span><span>PaO₂ <b>{g.pao2.toFixed(0)}</b></span><span>HCO₃⁻ <b>{g.hco3.toFixed(0)}</b></span><span>Lac <b>{g.lactate.toFixed(1)}</b></span><span>Na⁺ <b>{g.na.toFixed(0)}</b></span><span>Cl⁻ <b>{g.cl.toFixed(0)}</b></span><span>Alb <b>{g.albumin.toFixed(1)}</b></span>
        </div>
      </section>
      <section className="card"><h3>1 · What is the primary disturbance?</h3>
        <div className="opts">{PRIMARY.map(([l], i) => <button key={l} disabled={a1 != null} className={`opt${a1 != null && i === caseData.primary ? ' right' : ''}${a1 === i && i !== caseData.primary ? ' wrong' : ''}`} onClick={() => { setA1(i); mark(i === caseData.primary); }}>{l}</button>)}</div>
        {a1 != null && <div className="reveal"><b>{caseData.it.summary}.</b> {caseData.it.steps.slice(0, 2).map((s) => s.text).join(' ')}</div>}
      </section>
      {a1 != null && caseData.comp >= 0 && <section className="card"><h3>2 · Is the compensation appropriate?</h3>
        <div className="opts">{caseData.compOpts.map((l, i) => <button key={l} disabled={a2 != null} className={`opt${a2 != null && i === caseData.comp ? ' right' : ''}${a2 === i && i !== caseData.comp ? ' wrong' : ''}`} onClick={() => { setA2(i); mark(i === caseData.comp); }}>{l}</button>)}</div>
        {a2 != null && <div className="reveal">{caseData.it.steps.filter((s) => s.key === 'comp' || s.key === 'ag').map((s) => <p key={s.key} style={{ margin: '0 0 6px' }}><b>{s.title}.</b> {s.text}</p>)}</div>}
      </section>}
      {a1 != null && (a2 != null || caseData.comp < 0) && <section className="card"><h3>3 · What will you do?</h3>
        <div className="opts">{caseData.order.map((k) => { const l = caseData.act.options[k]; return <button key={l} disabled={a3 != null} className={`opt${a3 != null && k === caseData.act.answer ? ' right' : ''}${a3 === k && k !== caseData.act.answer ? ' wrong' : ''}`} onClick={() => { setA3(k); mark(k === caseData.act.answer); setBefore({ ...lab.snap, vbg: { ...lab.snap.vbg } }); caseData.act.apply(lab); lab.fastForward(caseData.act.ffMin); useUI.getState().set({ pulse: useUI.getState().pulse + 1 }); }}>{l}</button>; })}</div>
        {a3 != null && <div className="reveal"><b>{a3 === caseData.act.answer ? 'Right.' : `Best: ${caseData.act.options[caseData.act.answer]}.`}</b> {caseData.act.explain} <em>The model has run the correct treatment for {caseData.act.ffMin >= 60 ? `${caseData.act.ffMin / 60} h` : `${caseData.act.ffMin} min`}:</em>
          {before && <AbgTable rows={[{ t: 'Before', g: before, fio2: 0 }, { t: 'After', g: lab.snap, fio2: 0 }]} />}
        </div>}
      </section>}
      {a3 != null && <button className="act primary" onClick={next}>Next case →</button>}
      <SampleCards />
      <AcidBaseMap />
    </div>
  );
}
