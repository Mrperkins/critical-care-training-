import { useState } from 'react';

/** Educational, stepwise ABG interpretation. Not a clinical decision-support device. */
type Gas = { ph:number; co2:number; hco3:number; na:number; cl:number; albumin:number; story:string };
const CASES:Gas[] = [
  { ph:7.23,co2:24,hco3:10,na:140,cl:102,albumin:4,story:'A patient with hyperglycemia, tachypnea and dehydration.' },
  { ph:7.28,co2:62,hco3:28,na:139,cl:101,albumin:4,story:'A patient with COPD and increasing somnolence.' },
  { ph:7.52,co2:27,hco3:22,na:140,cl:104,albumin:4,story:'A patient with acute tachypnea and pleuritic chest discomfort.' },
  { ph:7.49,co2:48,hco3:35,na:138,cl:96,albumin:4,story:'A patient with several days of vomiting.' },
];
const ranges = { ph:'7.35–7.45',co2:'35–45 mmHg',hco3:'22–26 mEq/L' };
export function AbgGuidedCourse() {
  const [index,setIndex]=useState(0),[step,setStep]=useState(0),[answer,setAnswer]=useState(''),[revealed,setRevealed]=useState(false);
  const g=CASES[index], acid=g.ph<7.35, alkaline=g.ph>7.45;
  const direction=acid?'Acidemia':alkaline?'Alkalemia':'Normal pH';
  const respiratory=acid?g.co2>45:alkaline?g.co2<35:false;
  const primary=respiratory?'Respiratory': 'Metabolic';
  const expected=step===0?direction:step===1?primary:step===2?(g.hco3<22?'Low':g.hco3>26?'High':'Normal'):'';
  const options=step===0?['Acidemia','Normal pH','Alkalemia']:step===1?['Respiratory','Metabolic']:['Low','Normal','High'];
  const gap=g.na-(g.cl+g.hco3), correctedGap=gap+2.5*(4-g.albumin);
  const winter=1.5*g.hco3+8;
  const detail=step===0?`Compare pH ${g.ph.toFixed(2)} with ${ranges.ph}. The pH establishes the direction, not the cause.`:
    step===1?`PaCO₂ ${g.co2} (${ranges.co2}) moves pH in the opposite direction; HCO₃⁻ ${g.hco3} (${ranges.hco3}) moves it in the same direction. Identify the variable explaining the pH.`:
    `HCO₃⁻ is ${g.hco3} mEq/L. Calculate anion gap = Na − (Cl + HCO₃) = ${gap.toFixed(1)}; albumin-corrected gap = ${correctedGap.toFixed(1)}. If metabolic acidosis is present, Winter's expected PaCO₂ = ${winter.toFixed(1)} ± 2 mmHg; measured PaCO₂ = ${g.co2}. Consider mixed disorders if outside this range.`;
  const reset=(next:number)=>{setIndex(next);setStep(0);setAnswer('');setRevealed(false);};
  return <section className="card" aria-label="Guided arterial blood gas course">
    <div className="card-h"><span className="eyebrow">ABG Mastery · guided interpretation</span><span className="pill">Case {index+1}/{CASES.length}</span></div>
    <h3>Read the gas, one decision at a time</h3>
    <p>{g.story}</p>
    <div className="abg-row"><span>pH <b>{g.ph.toFixed(2)}</b></span><span>PaCO₂ <b>{g.co2}</b></span><span>HCO₃⁻ <b>{g.hco3}</b></span><span>Na <b>{g.na}</b></span><span>Cl <b>{g.cl}</b></span><span>Albumin <b>{g.albumin}</b></span></div>
    <p className="muted small">Reference ranges: pH {ranges.ph}; PaCO₂ {ranges.co2}; HCO₃⁻ {ranges.hco3}. Synthetic educational cases.</p>
    <h4>{['1. Determine acidemia or alkalemia','2. Identify the primary process','3. Evaluate bicarbonate and the gap'][step]}</h4>
    <div className="opts">{options.map(option=><button key={option} className={`opt${revealed&&option===expected?' right':''}${revealed&&answer===option&&answer!==expected?' wrong':''}`} disabled={revealed} aria-pressed={answer===option} onClick={()=>setAnswer(option)}>{option}</button>)}</div>
    <button className="act" disabled={!answer||revealed} onClick={()=>setRevealed(true)}>Check reasoning</button>
    {revealed&&<div className="reveal" role="status"><b>{answer===expected?'Correct.':`Review: ${expected}.`}</b><p>{detail}</p>
      {step<2?<button className="act primary" onClick={()=>{setStep(step+1);setAnswer('');setRevealed(false);}}>Continue guided interpretation</button>:
      <button className="act primary" onClick={()=>reset((index+1)%CASES.length)}>Next case</button>}
    </div>}
    <p className="muted small">Teaching tool only. Clinical interpretation also requires patient context, oxygenation, compensation and review for mixed disorders.</p>
  </section>;
}
