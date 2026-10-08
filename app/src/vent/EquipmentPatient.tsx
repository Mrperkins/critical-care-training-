import { session } from './session';
import { ventNumbers } from './numbers';

/** Procedural stretcher scene; circuit and chest excursion read the actual shared mechanics. */
export function EquipmentPatient() {
  const excursion=1+Math.min(.12,(session.m.V[0]+session.m.V[1])*.12);
  const n=ventNumbers(session), g=session.snap;
  const disconnected=session.circuitFault==='disconnect'||session.circuitFault==='both';
  const child=session.pt.p.age<18;
  return <div className="equipment-patient">
    <svg viewBox="0 0 600 400" role="img" aria-label="Full patient on a stretcher, connected by an endotracheal tube and circuit to the ventilator and monitor">
      <rect x="145" y="24" width="188" height="344" rx="22" fill="#47596a" stroke="#99acb8" strokeWidth="3" /><rect x="154" y="33" width="170" height="322" rx="16" fill="#9db1ba" />
      <rect x="170" y="45" width="133" height="70" rx="16" fill="#d0d8d9" />
      <circle cx="235" cy="78" r={child?35:30} fill={g.spo2<.85?'#9a929d':'#c8a895'} />
      <path d="M216 106L211 122Q179 125 174 161L165 248Q165 259 176 262Q188 262 190 250L204 183L205 265L208 342H230L235 270L239 342H261L265 265L266 183L280 250Q284 262 295 260Q307 256 305 246L295 161Q291 125 256 122L253 106" fill="#c5a492" />
      <path d="M202 242Q235 250 269 242L275 342H198Z" fill="#294455" />
      <g className="chest-excursion" style={{transform:`scale(${excursion})`,transformOrigin:'235px 150px'}}><path d="M231 125Q205 124 205 152V187Q214 207 230 187ZM239 125Q266 124 266 152V187Q257 207 240 187Z" fill={g.spo2<.88?'#6c7898':'#88acbb'} opacity=".65" /><path d="M235 115V162M235 162L217 181M235 162L253 181" stroke="#d8e8ed" strokeWidth="4" fill="none" /></g>
      <path d="M235 87V118" stroke="#cfdbdb" strokeWidth="6" /><path d={disconnected?'M235 92H337V145M360 175V224H424':'M235 92H350V224H424'} stroke={disconnected?'#d38286':'#74bdcc'} strokeWidth="9" fill="none" />
      <rect x="423" y="188" width="133" height="120" rx="12" fill="#607480" /><rect x="435" y="201" width="109" height="72" rx="6" fill="#071b24" /><path d="M453 287H519M486 309V359M463 359H510" stroke="#a0b2bd" strokeWidth="8" />
      <circle cx="522" cy="289" r="8" fill="#d9e2e3" /><text x="490" y="225" textAnchor="middle" fill="#79cfbf" fontSize="14">{session.m.s.mode}</text><text x="490" y="249" textAnchor="middle" fill="#cbdce6" fontSize="12">Vte {Math.round(n.vte)} mL</text>
      <rect x="408" y="43" width="156" height="103" rx="10" fill="#314756" /><rect x="418" y="54" width="136" height="82" rx="5" fill="#071b24" /><text x="428" y="78" fill="#a5d59c" fontSize="14">HR {Math.round(g.hr)}</text><text x="428" y="101" fill="#82bddc" fontSize="14">SpO₂ {Math.round(g.spo2*100)}%</text><text x="428" y="125" fill="#efc878" fontSize="14">MAP {Math.round(g.map)}</text>
      <path d="M418 105H369V174H265" stroke="#859fae" strokeWidth="2" fill="none" />
    </svg>
    {child && <p>Pediatric patient · {session.pt.p.weightKg} kg</p>}
    <dl className="equipment-vitals"><div><dt>SpO₂</dt><dd>{Math.round(g.spo2*100)}%</dd></div><div><dt>HR</dt><dd>{Math.round(g.hr)}/min</dd></div><div><dt>MAP</dt><dd>{Math.round(g.map)} mmHg</dd></div><div><dt>EtCO₂</dt><dd>{Math.round(g.etco2)} mmHg</dd></div></dl>
    <p className="muted small">Chest excursion follows simulated lung volume. Oxygenation and pressure follow gas exchange and cardiac output; the schematic is not a clinical prediction.</p>
  </div>;
}
