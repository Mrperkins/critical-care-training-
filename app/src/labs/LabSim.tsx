import { useEffect, useRef, useState } from 'react';
import { bench } from './bench';
import { useLabUI } from './labStore';
import { useUI } from '../app/store';
import { EcgStrip, Membrane, KTreat } from './LabPanel';
import { ecgShape } from '../physiology/ecg';

/** Hyperkalaemia emergency in real time: the ECG and potassium evolve while you act; delay has consequences. */
export function LabSim() {
  useUI((s) => s.pulse);
  const lastT = useRef(0);
  const [started, setStarted] = useState(false); const [events, setEvents] = useState<string[]>([]); const [arrest, setArrest] = useState(false);
  const start = () => { bench.reset(); bench.pt.p.renal = 0.05; bench.set('k', 7.6); bench.pt.kBal += 0; bench.running = true; bench.physioSpeed = 20; lastT.current = 0; setEvents([]); setArrest(false); setStarted(true); useLabUI.getState().set({ lab: 'k', view: 'cell' }); };
  useEffect(() => () => { bench.running = false; bench.physioSpeed = 30; }, []);
  useEffect(() => {
    if (!started || arrest) return;
    const s = bench.snap; const sh = ecgShape({ kEff: s.kEffective, k: s.k, ca: bench.pt.p.ca, mg: bench.pt.p.mg });
    // ongoing potassium release (tissue injury) until removed
    const dtm = bench.pt.t - lastT.current; lastT.current = bench.pt.t; if (bench.pt.t < 90 && dtm > 0) bench.pt.kBal += dtm * 0.004;
    if (sh.sine > 0.6) { setArrest(true); setEvents((e) => [...e, `${Math.round(bench.pt.t)} min — sine wave → ventricular fibrillation. Calcium was ${s.active.some((a) => a.id === 'calcium') ? 'given but wore off' : 'not given'}.`]); bench.running = false; }
  });
  const t = bench.pt.t; const s = bench.snap;
  return (
    <div className="chal-run">
      <section className="card"><div className="eyebrow">Simulation · real time ×20</div><h2 className="h2">Hyperkalaemia on the monitor</h2>
        <p>Rhabdomyolysis after a long lie; kidneys shut down. Potassium is {started ? s.k.toFixed(1) : '7.6'} and still rising as muscle breaks down. The ECG and potassium keep evolving while you decide.</p>
        {!started ? <button className="act primary" onClick={start}>Start</button> : <div className="actions"><span className="clock">{Math.floor(t)} min</span><span className="pill">{`K⁺ ${s.k.toFixed(1)} · effective ${s.kEffective.toFixed(1)}`}</span><button className="act" onClick={start}>Restart</button></div>}
        {arrest && <div className="reveal"><b>Cardiac arrest.</b> The membrane lost its safety margin. In the real world: calcium first — it works in minutes — then shift, then remove.</div>}
        {events.length > 0 && <ul className="look">{events.map((e) => <li key={e}>{e}</li>)}</ul>}
      </section>
      <EcgStrip /><Membrane />{started && <KTreat />}
    </div>
  );
}
