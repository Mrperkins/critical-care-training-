/** IABP timing on the patient's own beat (Lines session): 1:2 aortic trace, timing controls, signatures and a quiz. */
import { useMemo } from 'react';
import { useUI } from '../app/store';
import { lines } from '../lines/session';
import { Knob } from '../vent/VentPanel';
import { iabpTrace, features, classify, IABP_PRESETS, type IabpError } from './iabp';
import { useIabp } from './iabpStore';

const ORDER: IabpError[] = ['ideal', 'earlyInflation', 'lateInflation', 'earlyDeflation', 'lateDeflation'];
export function IabpCard() {
  useUI((s) => s.pulse);
  const { timing, quiz, answer, set } = useIabp(); const n = lines.num;
  const base = { hr: Math.round(n.hr || 80), sys: Math.round(n.aoSys || 100), dia: Math.round(n.aoDia || 60) };
  const shown = quiz ? IABP_PRESETS[quiz].t : timing;
  const tr = useMemo(() => iabpTrace(base, shown), [base.hr, base.sys, base.dia, shown.inflate, shown.deflate]); // eslint-disable-line react-hooks/exhaustive-deps
  const f = features(tr); const cls = classify(shown);
  const W = 520, H = 170, T = tr.t[tr.t.length - 1]; const lo = Math.min(...tr.p) - 8, hi = Math.max(...tr.p) + 12;
  const X = (t: number) => 8 + (t / T) * (W - 16), Y = (p: number) => H - 14 - ((p - lo) / (hi - lo)) * (H - 30);
  const d = tr.t.map((t, i) => `${i ? 'L' : 'M'}${X(t).toFixed(1)},${Y(tr.p[i]).toFixed(1)}`).join('');
  const nextQuiz = () => { const cur = quiz ? ORDER.indexOf(quiz) : -1; const k = ORDER[(cur + 3) % ORDER.length]; set({ quiz: k, answer: null }); };
  const lab = (t: number, p: number, s: string, dy = -8) => <text x={X(t)} y={Y(p) + dy} textAnchor="middle" className="iabp-lab">{s}</text>;
  return (
    <section className="card iabp">
      <div className="card-h"><h3>IABP timing · 1:2</h3><span className="muted small">HR {base.hr} · aorta {base.sys}/{base.dia}</span></div>
      <svg viewBox={`0 0 ${W} ${H}`} className="iabp-svg" role="img" aria-label="Aortic pressure with balloon assist">
        <path d={d} className="iabp-trace" />
        {!quiz && <><line x1={X(tr.marks.inflate)} x2={X(tr.marks.inflate)} y1={14} y2={H - 10} className="iabp-inf" /><line x1={X(tr.marks.deflate)} x2={X(tr.marks.deflate)} y1={14} y2={H - 10} className="iabp-def" />
          <text x={X(tr.marks.inflate) + 3} y={H - 4} className="iabp-lab l">inflate</text><text x={X(tr.marks.deflate) + 3} y={H - 4} className="iabp-lab l">deflate</text></>}
        {lab(tr.tEj * 0.4, f.unassistedSys, 'systole')}{lab(tr.marks.inflate + 0.08, f.augPeak, 'augmentation')}
        {lab(tr.T - 0.01, f.baedp, 'BAEDP', 14)}{lab(tr.T + tr.tEj * 0.45, f.assistedSys, 'assisted systole')}{lab(2 * tr.T - 0.02, f.paedp, 'PAEDP', 14)}
      </svg>
      {quiz ? (
        <div className="iabp-quiz">
          <p className="muted small">Mystery trace: which timing error is this?</p>
          <div className="chips">{ORDER.map((k) => <button key={k} className={`chip${answer === k ? (k === quiz ? ' on' : ' bad') : ''}`} onClick={() => set({ answer: k })}>{IABP_PRESETS[k].name}</button>)}</div>
          {answer && <p className={`explain ${answer === quiz ? 'ok' : 'bad'}`}><b>{answer === quiz ? '✓ ' : `✗ It is ${IABP_PRESETS[quiz].name.toLowerCase()}. `}</b>{IABP_PRESETS[quiz].sign}</p>}
          <div className="wf-foot"><button className="linkish" onClick={nextQuiz}>Next trace</button><button className="linkish" onClick={() => set({ quiz: null, answer: null })}>Back to controls</button></div>
        </div>
      ) : (<>
        <div className="chips">{ORDER.map((k) => <button key={k} className={`chip${cls === k ? ' on' : ''}`} onClick={() => set({ timing: { ...IABP_PRESETS[k].t } })}>{IABP_PRESETS[k].name}</button>)}</div>
        <Knob label="Inflation vs dicrotic notch" value={Math.round(timing.inflate * 1000)} min={-150} max={150} step={10} unit=" ms" onChange={(v) => set({ timing: { ...timing, inflate: v / 1000 } })} hint="0 = at the notch (aortic valve closure)" />
        <Knob label="Deflation vs next systole" value={Math.round(timing.deflate * 1000)} min={-300} max={100} step={10} unit=" ms" onChange={(v) => set({ timing: { ...timing, deflate: v / 1000 } })} hint="Just before the next upstroke (≈ −40 ms)" />
        <div className="ln-flush"><div><span>Aug peak</span><b>{Math.round(f.augPeak)}</b></div><div><span>BAEDP / PAEDP</span><b className={f.baedp < f.paedp ? 'ok' : 'bad'}>{Math.round(f.baedp)} / {Math.round(f.paedp)}</b></div><div><span>Assisted / unassisted sys</span><b className={f.assistedSys < f.unassistedSys ? 'ok' : 'bad'}>{Math.round(f.assistedSys)} / {Math.round(f.unassistedSys)}</b></div><div><span>Timing</span><b className={cls === 'ideal' ? 'ok' : 'bad'}>{IABP_PRESETS[cls].name}</b></div></div>
        <p className={`explain ${cls === 'ideal' ? 'ok' : 'bad'}`}><b>{IABP_PRESETS[cls].name}.</b> {IABP_PRESETS[cls].sign} <i>{IABP_PRESETS[cls].risk}</i></p>
        <button className="linkish" onClick={nextQuiz}>Quiz me: mystery trace →</button>
      </>)}
      <p className="muted small" style={{ marginTop: 6 }}>Teaching waveform built on this patient’s aortic beat; timing values are illustrative. Real consoles time from the ECG or the pressure trace automatically.</p>
    </section>
  );
}
