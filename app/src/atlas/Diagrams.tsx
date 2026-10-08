import { useId } from 'react';
import type { DiseaseDefinition, DiseaseState } from './types';

const RED = '#dc6c74', BLUE = '#78baf0', GOLD = '#efc878', TEAL = '#60c7b5';
export function PatientDiagram({ disease }: { disease: DiseaseDefinition }) {
  const child = disease.population === 'child' || disease.population === 'neonate';
  const y = disease.anatomy === 'brain' ? 54 : ['ovaries', 'uterus', 'placenta'].includes(disease.anatomy) ? 280 : disease.target.includes('abdominal') || disease.variant.includes('abdominal') ? 245 : disease.variant.includes('pelvic') ? 285 : 155;
  return <svg viewBox="0 0 600 390" role="img" aria-label={`${disease.population} patient, ${disease.anatomy.replaceAll('-', ' ')} highlighted`}>
    <g fill="#263844" stroke="#698291" strokeWidth="2">
      <ellipse cx="300" cy="54" rx={child ? 36 : 27} ry={child ? 41 : 34} />
      <path d="M282 87L280 103Q249 107 245 124L210 235Q208 249 220 253Q232 255 237 242L264 168L263 273L269 360Q270 373 283 373Q296 373 296 360L300 287L305 360Q305 373 318 373Q332 373 332 360L337 273L335 168L362 242Q368 255 380 253Q392 249 389 235L355 124Q350 107 320 103L318 87" />
    </g>
    <path d="M300 114V280M273 152H327" stroke={RED} strokeWidth="5" opacity=".65" />
    <path d="M298 132Q268 114 267 154V197Q278 214 292 196V151M306 132Q331 115 333 155V195Q321 212 309 196" fill={BLUE} opacity=".22" />
    {disease.population === 'maternal' && <ellipse cx="300" cy="248" rx="45" ry="50" fill="#b68b89" opacity=".5" />}
    <circle cx="300" cy={y} r={y === 54 ? 33 : 48} fill={TEAL} fillOpacity=".12" stroke={TEAL} strokeWidth="2" />
    <path d={`M350 ${y}H445`} stroke={TEAL} strokeWidth="2" />
    <text x="452" y={y + 5} fill="#dce8ef" fontSize="15">{disease.anatomy.split('-')[0]}</text>
    <text x="300" y="388" textAnchor="middle" fill="#9cb0bf" fontSize="13">Patient → region → mechanism</text>
  </svg>;
}

function Airway({ d, s }: { d: DiseaseDefinition; s: DiseaseState }) {
  const upper = ['upper', 'subglottic', 'pediatric-airway'].includes(d.variant);
  const lumen = Math.max(8, 42 * (1 - .72 * s.obstruction));
  return <g>
    <path d="M278 40V125L195 182M322 40V125L405 182" fill="none" stroke="#ad7d77" strokeWidth="22" />
    <path d="M300 35V127M300 127L197 194M300 127L403 194" fill="none" stroke={BLUE} strokeWidth={18 * (1 - .8 * s.obstruction)} className="atlas-flow" />
    {[-1, 1].map(side => <g key={side} transform={`translate(${300 + side * 108},245)`}>
      <circle r="70" fill="#9e6d6b" stroke={RED} strokeWidth={4 + s.inflammation * 15} />
      <circle r={lumen} fill="#0b1b29" stroke={BLUE} strokeWidth="3" />
      {d.variant === 'aspiration' && Array.from({ length: 6 }, (_, i) => <circle key={i} cx={-18 + i * 7} cy={Math.sin(i) * 15} r={3 + s.obstruction * 5} fill={GOLD} />)}
      {d.variant === 'bronchioles' && <path d="M-20 -12Q0 18 20 -12M-24 15Q0-5 24 15" stroke={GOLD} strokeWidth={s.obstruction * 9} fill="none" />}
    </g>)}
    {upper && <ellipse cx="300" cy="80" rx={32 * s.obstruction} ry="24" stroke={RED} strokeWidth="10" fill="#9e6d6b" />}
    <text x="300" y="340" textAnchor="middle" fill="#a9bfce" fontSize="14">Airway cross-section · {upper ? 'upper-airway' : 'conducting-airway'} narrowing</text>
  </g>;
}

function Alveoli({ d, s }: { d: DiseaseDefinition; s: DiseaseState }) {
  return <g>
    <path d="M65 292Q300 205 535 292" fill="none" stroke={RED} strokeWidth="24" opacity=".55" />
    <path d="M65 292Q300 205 535 292" fill="none" stroke={RED} strokeWidth="4" className="atlas-flow" opacity={1 - s.flowLoss} />
    {Array.from({ length: 8 }, (_, i) => {
      const x = 113 + (i % 4) * 124, y = 103 + Math.floor(i / 4) * 125;
      const affected = d.variant !== 'focal-fluid' || i >= 5;
      const r = 43 * (1 + s.overdistension * .35) * (1 - (affected ? s.collapse : 0) * .6);
      return <g key={i} transform={`translate(${x},${y})`}>
        <circle r={r + s.edema * 8} fill="none" stroke={RED} strokeWidth={3 + s.inflammation * 7} />
        <circle r={r} fill="#243a49" stroke={BLUE} strokeWidth={d.variant === 'emphysema' ? 1 : 3} strokeDasharray={d.variant === 'emphysema' ? `${18 * (1 + s.overdistension)} 18` : undefined} />
        {affected && s.fluid > .02 && <ellipse cy={r * (1 - s.fluid)} rx={r * .83} ry={r * s.fluid * .55} fill={BLUE} opacity=".8" />}
        {s.shunt > .05 && <path d={`M${-r} ${r+10}H${r}`} stroke={d.variant === 'hydrostatic-fluid' ? RED : '#9272ad'} strokeWidth={2 + s.shunt * 8} />}
      </g>;
    })}
    <text x="300" y="340" textAnchor="middle" fill="#a9bfce" fontSize="14">Air spaces above · perfusion below · schematic cross-section</text>
  </g>;
}

function Pleura({ d, s }: { d: DiseaseDefinition; s: DiseaseState }) {
  const blood = d.variant === 'pleural-blood' || d.variant === 'trauma';
  return <g>
    <path d="M280 65Q177 20 134 123Q104 205 142 310H279Z" fill="#263b49" stroke="#8d9fb0" strokeWidth="3" />
    <path d="M320 65Q423 20 466 123Q496 205 458 310H321Z" fill="#263b49" stroke="#8d9fb0" strokeWidth="3" />
    <path d="M280 85Q190 50 159 136Q134 201 163 284H278Z" fill="#a27376" />
    <g transform={`translate(${335 - s.pressure * 20},185) scale(${1 - .55 * s.collapse},${1 - .3 * s.collapse}) translate(-335,-185)`}>
      <path d="M326 85Q414 50 446 136Q471 201 442 284H326Z" fill="#a27376" />
    </g>
    {blood ? <path d={`M322 ${310 - 115 * s.bleeding}H464Q487 240 458 310H321Z`} fill={RED} opacity=".7" /> : <path d={`M329 75Q425 34 467 143L${445 - s.collapse * 60} 255L335 285Z`} fill={BLUE} opacity={.1 + s.collapse * .5} />}
    <path d={`M${300 - s.pressure * 35} 75V300`} stroke={GOLD} strokeWidth="8" />
    {s.pressure > .1 && <path d="M399 183H320L340 170M320 183L340 196" fill="none" stroke={GOLD} strokeWidth="4" />}
    <text x="300" y="340" textAnchor="middle" fill="#a9bfce" fontSize="14">Pleural {blood ? 'blood' : 'gas'} · lung recoil · {d.variant === 'tension' ? 'pressure / mediastinal shift' : 'space occupation'}</text>
  </g>;
}

function Heart({ d, s }: { d: DiseaseDefinition; s: DiseaseState }) {
  return <g>
    {d.variant === 'pericardial' && <ellipse cx="300" cy="185" rx={115 + s.fluid * 25} ry="142" fill={BLUE} fillOpacity={s.fluid * .5} stroke={BLUE} strokeWidth={3 + s.fluid * 8} />}
    <path d="M305 78C215 16 141 121 194 226Q234 289 301 315Q370 284 411 224C465 120 387 13 305 78Z" fill="#825a64" stroke="#cf9291" strokeWidth="3" />
    <ellipse cx="259" cy="193" rx={d.variant === 'rv' ? 38 + s.pressure * 19 : 40} ry="73" fill="#29496a" />
    <ellipse cx="345" cy="199" rx={40 * (1 + s.pumpLoss * .3)} ry="83" fill="#824047" />
    <path d="M306 112V283" stroke="#cd9490" strokeWidth="13" />
    <path d="M250 220V90Q250 54 296 52H341M345 257V73Q349 22 397 50V100" stroke={BLUE} strokeWidth="11" fill="none" className="atlas-flow" opacity={1 - s.flowLoss * .75} />
    <path d="M343 125L379 187L363 254M342 161L322 205" stroke={GOLD} strokeWidth="5" fill="none" />
    {d.variant === 'coronary' && <><circle cx="369" cy="171" r={4 + s.obstruction * 12} fill={RED} /><path d="M373 180Q411 229 356 274L325 220Z" fill="#4e334b" opacity={s.ischemia} /></>}
    {['shunt', 'left-right', 'right-left', 'transition', 'duct'].includes(d.variant) && <path d={d.variant === 'right-left' ? 'M261 182H349L333 169M349 182L333 195' : 'M345 182H261L277 169M261 182L277 195'} stroke={TEAL} strokeWidth={3 + s.shunt * 9} fill="none" className="atlas-flow" />}
    {['tachy', 'brady'].includes(d.variant) && <path d="M225 113L270 120L305 185L346 260" stroke={GOLD} strokeWidth="5" fill="none" strokeDasharray={d.variant === 'brady' ? '8 18' : '5 5'} className="atlas-flow" />}
    <text x="254" y="201" fill="#dce8ef" textAnchor="middle">RV</text><text x="345" y="201" fill="#dce8ef" textAnchor="middle">LV</text>
    <text x="300" y="349" textAnchor="middle" fill="#a9bfce" fontSize="14">Chambers · coronary supply · filling and forward flow</text>
  </g>;
}

function Vessels({ d, s }: { d: DiseaseDefinition; s: DiseaseState }) {
  const pulmonary = d.anatomy === 'pulmonary-vessels'; const aneurysm = ['aneurysm', 'rupture'].includes(d.variant);
  return <g>
    <path d={pulmonary ? 'M300 305V155L160 75M300 155L440 75' : 'M300 30V315'} stroke="#8e5e66" strokeWidth="65" fill="none" />
    <path d={pulmonary ? 'M300 305V155L160 75M300 155L440 75' : 'M300 30V315'} stroke={pulmonary ? BLUE : RED} strokeWidth={25 * (1 - s.obstruction * .6)} fill="none" className="atlas-flow" opacity={1 - s.flowLoss * .6} />
    {aneurysm && <ellipse cx="300" cy="198" rx={32 + s.overdistension * 55} ry="80" fill="#8e5e66" stroke={RED} strokeWidth="5" />}
    {d.variant === 'dissection' && <><path d="M288 70Q326 170 291 300" stroke={GOLD} strokeWidth="4" fill="none" /><path d="M315 80V270" stroke={RED} strokeWidth={s.pressure * 22} opacity=".55" /></>}
    {d.variant === 'clot' && <ellipse cx="344" cy="130" rx={12 + s.obstruction * 17} ry="19" fill={RED} stroke={GOLD} strokeWidth="2" />}
    {s.bleeding > .02 && <ellipse cx="393" cy="215" rx={s.bleeding * 70} ry={s.bleeding * 82} fill={RED} opacity=".55" />}
    {d.variant === 'afe' && Array.from({length: 10}, (_, i) => <circle key={i} cx={160 + i * 27} cy={85 + (i % 3) * 39} r={3 + s.pressure * 6} fill={GOLD} opacity=".65" />)}
    <text x="300" y="349" textAnchor="middle" fill="#a9bfce" fontSize="14">{pulmonary ? 'Pulmonary arteries · flow and RV afterload' : 'Aortic lumen · wall · surrounding tissue'}</text>
  </g>;
}

function Brain({ d, s }: { d: DiseaseDefinition; s: DiseaseState }) {
  const bleed = ['ich', 'trauma'].includes(d.variant);
  return <g>
    <ellipse cx="300" cy="173" rx="173" ry="136" fill="none" stroke="#9db0ba" strokeWidth="7" />
    <path d="M298 61Q183 24 146 118Q116 208 197 263Q249 292 299 259Q350 292 403 264Q484 208 454 118Q418 24 302 61Z" fill="#856c83" stroke="#ba96a5" strokeWidth={3 + s.edema * 8} />
    <path d="M300 68V260M200 84Q250 115 232 175Q201 209 247 252M397 84Q350 115 368 175Q399 209 353 252" fill="none" stroke="#493d56" strokeWidth="3" />
    <path d="M298 273V314" stroke="#aa8390" strokeWidth="25" />
    <path d="M301 302V224M301 224L200 136M301 224L400 136" stroke={RED} strokeWidth={5 * (1 - s.flowLoss * .7)} fill="none" opacity={.6 * (1 - s.flowLoss)} className="atlas-flow" />
    {d.variant === 'core-penumbra' && <><ellipse cx="220" cy="165" rx={30 + s.flowLoss * 54} ry={35 + s.flowLoss * 57} fill={GOLD} opacity=".65" /><ellipse cx="213" cy="166" rx={12 + s.ischemia * 40} ry={12 + s.ischemia * 49} fill="#56354f" /></>}
    {bleed && <><ellipse cx="369" cy="167" rx={18 + s.edema * 42} ry={22 + s.edema * 39} fill={GOLD} opacity=".3" /><ellipse cx="367" cy="166" rx={8 + s.bleeding * 34} ry={8 + s.bleeding * 38} fill={RED} /></>}
    {d.variant === 'sah' && <path d="M178 104Q156 145 175 200M420 103Q444 145 425 205M205 260Q300 297 395 260" fill="none" stroke={RED} strokeWidth={2 + s.bleeding * 12} />}
    {['edema', 'icp', 'herniation'].includes(d.variant) && <><ellipse cx="300" cy="163" rx={27 * (1 - s.pressure * .8)} ry="40" fill={BLUE} /><path d={`M290 253L300 ${273 + s.pressure * 33}L310 253`} stroke={d.variant === 'herniation' ? RED : GOLD} strokeWidth={4 + s.pressure * 8} fill="none" /></>}
    {d.variant === 'seizure' && <path d="M163 178L194 178L210 140L224 211L244 151L263 192L284 140L312 202L335 152L359 195L380 145L404 181H436" stroke={GOLD} strokeWidth={2 + s.electrical * 4} fill="none" className="atlas-flow" />}
    <text x="300" y="349" textAnchor="middle" fill="#a9bfce" fontSize="14">Brain tissue · skull boundary · perfusion / mass / electrical state</text>
  </g>;
}

function Circulation({ d, s }: { d: DiseaseDefinition; s: DiseaseState }) {
  return <g>
    <rect x="79" y="68" width="114" height="226" rx="18" fill="#172c3c" stroke="#9eafbd" strokeWidth="3" />
    <rect x="84" y={d.variant === 'maternal' ? 160 - s.endocrine * 75 : 78 + s.volumeLoss * 169} width="104" height={d.variant === 'maternal' ? 115 + s.endocrine * 75 : 206 * (1 - s.volumeLoss * .82)} rx="12" fill={RED} opacity=".65" />
    <path d="M194 164H256Q300 97 341 163H473V279H193" stroke="#485973" strokeWidth={d.variant === 'distributive' ? 22 + s.flowLoss * 13 : 22} fill="none" />
    <path d="M194 164H256Q300 97 341 163H473V279H193" stroke={RED} strokeWidth="5" fill="none" className="atlas-flow" opacity={1 - s.flowLoss * .8} />
    <circle cx="302" cy="161" r="35" fill="#835a64" stroke={RED} strokeWidth="3" />
    {s.pressure > .05 && <><path d="M395 149V179M409 149V179M423 149V179" stroke={GOLD} strokeWidth={2 + s.pressure * 5} /><circle cx="473" cy="221" r={13 + s.ischemia * 14} fill={GOLD} opacity={.1 + s.ischemia * .4} /></>}
    {s.obstruction > .05 && <rect x="353" y="148" width={10 + s.obstruction * 17} height="32" rx="5" fill={GOLD} />}
    {s.edema > .05 && Array.from({ length: 7 }, (_, i) => <circle key={i} cx={376 + i * 15} cy={194 + (i % 2) * 32} r={3 + s.edema * 10} fill={BLUE} opacity=".65" />)}
    {s.bleeding > .05 && <ellipse cx={d.variant.includes('pelvic') ? 302 : 414} cy="302" rx={s.bleeding * 60} ry={s.bleeding * 24} fill={RED} opacity=".7" />}
    <text x="136" y="53" textAnchor="middle" fill="#a9bfce">Circulating volume</text><text x="437" y="53" textAnchor="middle" fill="#a9bfce">Tissue circulation</text>
    <text x="300" y="349" textAnchor="middle" fill="#a9bfce" fontSize="14">Volume · pump · vascular tone · capillary barrier</text>
  </g>;
}

function Chemistry({ d, s }: { d: DiseaseDefinition; s: DiseaseState }) {
  const count = Math.round(d.variant === 'glucose' ? 27 - s.metabolic * 22 : 5 + s.metabolic * 22);
  return <g>
    <rect x="78" y="60" width="444" height="212" rx="44" fill="#192e3d" stroke={BLUE} strokeWidth="3" />
    <path d="M90 190H510" stroke="#8b6e86" strokeWidth="15" />
    {Array.from({ length: count }, (_, i) => <g key={i}>
      <circle cx={108 + (i % 10) * 42} cy={89 + Math.floor(i / 10) * 31} r="9" fill={d.variant === 'potassium' ? GOLD : RED} opacity=".8" />
    </g>)}
    <text x="300" y="51" textAnchor="middle" fill="#a9bfce">{d.variant === 'ketones' ? 'Ketones / acid · osmotic losses' : d.variant === 'potassium' ? 'Extracellular K⁺ · membrane excitability' : d.variant === 'glucose' ? 'Insufficient glucose → cellular energy loss' : d.variant === 'opioid' ? 'Respiratory drive ↓ → alveolar ventilation ↓ → CO₂ ↑' : d.variant === 'hellp' ? 'Hemolysis · liver injury · platelet depletion' : 'Chemistry → cellular function'}</text>
    <path d={`M100 305H210L230 ${305 - s.electrical * 35}L250 ${305 + s.electrical * 21}L270 ${305 - s.electrical * 28}L290 305H500`} stroke={GOLD} strokeWidth="3" fill="none" />
    <text x="300" y="349" textAnchor="middle" fill="#a9bfce" fontSize="14">Molecular burden is illustrative; waveform is not a diagnostic ECG</text>
  </g>;
}

function Reproductive({ d, s }: { d: DiseaseDefinition; s: DiseaseState }) {
  const pregnancy = d.population === 'maternal';
  const atony = ['atony', 'postpartum'].includes(d.variant);
  return <g>
    <path d="M259 114Q223 64 172 89L125 127M341 114Q377 64 428 89L475 127" fill="none" stroke="#b88a98" strokeWidth="13" />
    {[137, 463].map(x => <g key={x}><ellipse cx={x} cy="154" rx="36" ry="27" fill="#a7768b" stroke="#dba9b3" strokeWidth="3" />
      {d.variant === 'follicles' && Array.from({length: 9}, (_, i) => <circle key={i} cx={x + Math.cos(i * .7) * 24} cy={154 + Math.sin(i * .7) * 17} r={3 + s.endocrine * 4} fill={BLUE} stroke="#cee6ef" />)}
    </g>)}
    <path d={pregnancy ? 'M300 67Q207 65 203 166Q202 250 278 287L282 321H318L322 287Q398 250 397 166Q393 64 300 67Z' : 'M258 104Q300 142 342 104L355 134Q363 174 323 243L317 283H283L277 243Q237 174 245 134Z'} fill="#8b6071" stroke="#d6a0ac" strokeWidth={atony ? 4 + (1 - s.pumpLoss) * 10 : 7} />
    {pregnancy && !atony && <><ellipse cx="300" cy="177" rx="60" ry="80" fill="#213a4b" /><circle cx="295" cy="137" r="22" fill="#c5a394" /><path d="M299 159Q339 185 308 219Q277 243 273 208L269 183" fill="none" stroke="#c5a394" strokeWidth="18" /><path d="M330 172Q354 149 343 113" stroke={BLUE} strokeWidth="5" fill="none" className="atlas-flow" /></>}
    {pregnancy && <path d={d.variant === 'previa' ? 'M269 275Q300 259 330 275' : 'M211 138Q209 96 252 78'} stroke={RED} strokeWidth="22" fill="none" />}
    {d.variant === 'fetal-flow' && <><path d="M258 114Q218 150 247 199L259 182M247 199L232 185" stroke={RED} strokeWidth={3 + s.shunt * 4} fill="none" className="atlas-flow" /><path d="M330 202Q359 163 331 132L344 146M331 132L327 150" stroke={BLUE} strokeWidth={3 + s.shunt * 4} fill="none" className="atlas-flow" /></>}
    {d.variant === 'endothelium' && Array.from({length:6},(_,i) => <circle key={i} cx={217 + i * 33} cy="54" r={3 + s.edema * 7} fill={BLUE} />)}
    {d.variant === 'abruption' && <path d="M206 141Q197 98 250 72" stroke={GOLD} strokeWidth={3 + s.bleeding * 15} fill="none" />}
    {d.variant === 'lesions' && [[215,220],[390,238],[146,167],[326,252]].map(([x,y],i) => <circle key={i} cx={x} cy={y} r={4 + s.inflammation * 9} fill={RED} stroke={GOLD} strokeWidth="1" />)}
    {d.variant === 'tubal' && <ellipse cx="419" cy="92" rx={10 + s.overdistension * 27} ry="23" fill={GOLD} stroke={RED} strokeWidth="3" />}
    {d.variant === 'torsion' && <path d="M420 104L444 114L426 126L444 140" stroke={GOLD} strokeWidth={3 + s.obstruction * 7} fill="none" />}
    {s.bleeding > .05 && <ellipse cx="300" cy="334" rx={18 + s.bleeding * 72} ry={4 + s.bleeding * 15} fill={RED} opacity=".65" />}
    <text x="300" y="378" textAnchor="middle" fill="#a9bfce" fontSize="14">{pregnancy ? 'Uterus · placenta · maternal and fetal systems' : 'Uterus · tubes · ovaries · pelvic tissues'}</text>
  </g>;
}

export function DiseaseDiagram({ disease, state }: { disease: DiseaseDefinition; state: DiseaseState }) {
  const title = useId(); const props = { d: disease, s: state };
  return <svg viewBox="0 0 600 390" role="img" aria-labelledby={title} className="disease-diagram">
    <title id={title}>{`${disease.title}: ${disease.findings.map(f => `${f.label} ${Math.round(state[f.channel] * 100)} percent of illustrative range`).join('; ')}`}</title>
    {disease.anatomy === 'airway' ? <Airway {...props} /> : disease.anatomy === 'alveoli' ? <Alveoli {...props} /> : disease.anatomy === 'pleura' ? <Pleura {...props} /> : disease.anatomy === 'heart' ? <Heart {...props} /> : disease.anatomy === 'aorta' || disease.anatomy === 'pulmonary-vessels' ? <Vessels {...props} /> : disease.anatomy === 'brain' ? <Brain {...props} /> : disease.anatomy === 'circulation' ? <Circulation {...props} /> : disease.anatomy === 'chemistry' ? <Chemistry {...props} /> : <Reproductive {...props} />}
  </svg>;
}
