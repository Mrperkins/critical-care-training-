/** Infusion calculator (pure maths from drip.ts) for the pump/drip workflows. */
import { useState } from 'react';
import { Knob } from '../vent/VentPanel';
import { concMcgPerMl, mlPerHour, mcgKgMin } from './drip';

export function DripCard() {
  const [kg, setKg] = useState(80); const [mg, setMg] = useState(4); const [ml, setMl] = useState(250); const [dose, setDose] = useState(0.1);
  const c = concMcgPerMl(mg, ml); const rate = mlPerHour(dose, kg, c);
  return (
    <section className="card">
      <div className="card-h"><h3>Infusion calculator</h3><span className="muted small">{c.toFixed(c < 10 ? 1 : 0)} µg/mL</span></div>
      <Knob label="Weight" value={kg} min={40} max={160} step={1} unit=" kg" onChange={setKg} />
      <Knob label="Drug in bag" value={mg} min={1} max={16} step={1} unit=" mg" onChange={setMg} />
      <Knob label="Bag volume" value={ml} min={50} max={500} step={50} unit=" mL" onChange={setMl} />
      <Knob label="Dose" value={dose} min={0.01} max={1} step={0.01} unit=" µg/kg/min" onChange={setDose} />
      <p className="explain ok"><b>{rate.toFixed(1)} mL/h</b> = {dose} × {kg} × 60 ÷ {c.toFixed(1)} — check: {rate.toFixed(1)} mL/h × {c.toFixed(1)} µg/mL ÷ ({kg} × 60) = {mcgKgMin(rate, kg, c).toFixed(2)} µg/kg/min</p>
    </section>
  );
}
