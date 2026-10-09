/**
 * Stroke time slider: onset → day 14 on a log axis (the first hours get as much room as the following days), with
 * milestones, play, the phase narrative and what to do, the key numbers, and the REAL CT that matches this stage
 * (openly licensed case images from imaging/real — different patients illustrate different stages).
 */
import { useEffect, useMemo, useState } from 'react';
import { useNeuroUI, setNeuroMinutes, recanalize } from './neuroStore';
import { evolve, courseOf, phaseAt, MILESTONES, toU, fromU, fmtTime, EVO_MAX, type Course } from './evolution';
import { loadReal, type RealItem } from '../scene/imaging/RealExamples';
import { RealCaseCard } from '../scene/imaging/RealCase';

/** real CT items for this course, the one that best fits the minute first */
export function useStageCT(course: Course, minutes: number, sah: boolean) {
  const [items, setItems] = useState<RealItem[]>([]);
  useEffect(() => { let on = true; loadReal().then((x) => on && setItems(x.filter((i) => i.kind === 'ct-ischemic' || i.kind === 'ct-ich'))); return () => { on = false; }; }, []);
  return useMemo(() => {
    const kind = course === 'ischemic' ? 'ct-ischemic' : 'ct-ich';
    const pool = items.filter((i) => i.kind === kind && i.stage && (!sah || (i.findings ?? []).includes('sah')) && (sah || !(i.findings ?? []).includes('sah') || (i.findings ?? []).includes('ich')));
    const fits = pool.filter((i) => minutes >= i.stage!.fromMin && minutes <= i.stage!.toMin).sort((a, b) => (a.stage!.toMin - a.stage!.fromMin) - (b.stage!.toMin - b.stage!.fromMin));
    const all = [...pool].sort((a, b) => a.stage!.fromMin - b.stage!.fromMin || a.stage!.toMin - b.stage!.toMin);
    return { now: fits, all };
  }, [items, course, minutes, sah]);
}

/** play at a constant speed along the log axis: the whole fortnight in ~45 s */
export function useEvolutionClock() {
  const playing = useNeuroUI((s) => s.playing);
  useEffect(() => {
    if (!playing) return; let raf = 0, last = performance.now();
    const loop = (now: number) => { raf = requestAnimationFrame(loop); const dt = Math.min(0.1, (now - last) / 1000); last = now;
      const m = fromU(toU(useNeuroUI.getState().state.minutes) + dt / 45); setNeuroMinutes(m); if (m >= EVO_MAX - 1) useNeuroUI.getState().set({ playing: false }); };
    raf = requestAnimationFrame(loop); return () => cancelAnimationFrame(raf);
  }, [playing]);
}

const fx = (v: number) => (v >= 10 ? Math.round(v) : v.toFixed(1));
export function EvolutionCard() {
  const st = useNeuroUI((s) => s.state); const sys = useNeuroUI((s) => s.sys); const playing = useNeuroUI((s) => s.playing); const preset = useNeuroUI((s) => s.preset); const set = useNeuroUI.getState().set;
  const course = courseOf(st); const ev = useMemo(() => evolve(st, sys), [st, sys]);
  const sah = st.hemorrhage?.kind === 'sah';
  const ct = useStageCT(sah ? 'ich' : course, st.minutes, sah);
  if (course === 'none' && !sah) return null;
  const c = course === 'none' ? 'ich' : course; const ph = phaseAt(c, st.minutes); const u = toU(st.minutes);
  const occluded = Object.keys(st.occlusion).length > 0; const shown = ct.now[0];
  return (
    <section className="card evo" aria-label="Stroke time course">
      <div className="card-h"><h3>{ph.title}</h3><span className="evo-t">{fmtTime(st.minutes)}</span></div>
      <div className="evo-track">
        <input type="range" min={0} max={1000} step={1} value={Math.round(u * 1000)} aria-label="Time since onset" aria-valuetext={fmtTime(st.minutes)}
          onChange={(e) => { set({ playing: false }); setNeuroMinutes(fromU(+e.target.value / 1000)); }} style={{ ['--p' as string]: `${u * 100}%` }} />
        <div className="evo-ticks" aria-hidden="true">{MILESTONES[c].map(([m, l]) => <button key={m} type="button" tabIndex={-1} style={{ left: `${toU(m) * 100}%` }} className={st.minutes >= m ? 'past' : ''} onClick={() => { set({ playing: false }); setNeuroMinutes(m); }}><i />{l}</button>)}</div>
        {st.recanalizedAt != null && <span className="evo-reopen" style={{ left: `${toU(st.recanalizedAt) * 100}%` }} title={`Reopened at ${fmtTime(st.recanalizedAt)}`} aria-hidden="true">▲</span>}
      </div>
      <div className="btn-row">
        <button className={`tgl${playing ? ' on' : ''}`} onClick={() => { if (!playing && st.minutes >= EVO_MAX - 1) setNeuroMinutes(0); set({ playing: !playing }); }}>{playing ? '❚❚ Pause' : '▶ Play'}</button>
        {occluded && (st.recanalizedAt == null
          ? <button className="tgl" onClick={recanalize}>Reopen the artery now</button>
          : <button className="tgl on" onClick={() => set({ state: { ...st, recanalizedAt: null } })}>Reopened at {fmtTime(st.recanalizedAt)} · undo</button>)}
      </div>
      <p className="evo-text">{ph.text}</p>
      <p className="evo-act"><b>What matters now:</b> {ph.act}</p>
      <div className="numgrid evo-nums">
        {c === 'ischemic' ? <>
          <div className="num"><span className="nl">Core</span><span className="nv">{fx(ev.coreMl)}</span><span className="nu">mL dead</span></div>
          <div className="num"><span className="nl">Penumbra</span><span className="nv">{fx(ev.penumbraMl)}</span><span className="nu">mL at risk</span></div>
          <div className="num"><span className="nl">Swelling</span><span className="nv">{Math.round(ev.swelling * 100)}</span><span className="nu">% of peak</span></div>
          <div className="num"><span className="nl">Midline shift</span><span className="nv">{ev.midlineShiftMm.toFixed(0)}</span><span className="nu">mm</span></div>
        </> : sah ? <div className="num"><span className="nl">Blood</span><span className="nv">subarachnoid</span><span className="nu">cisterns & fissures</span></div> : <>
          <div className="num"><span className="nl">Haematoma</span><span className="nv">{fx(ev.hematomaMl)}</span><span className="nu">mL</span></div>
          <div className="num"><span className="nl">Oedema</span><span className="nv">{fx(ev.pheMl)}</span><span className="nu">mL around it</span></div>
          <div className="num"><span className="nl">Midline shift</span><span className="nv">{ev.midlineShiftMm.toFixed(0)}</span><span className="nu">mm</span></div>
          <div className="num"><span className="nl">On CT</span><span className="nv">{st.minutes < 180 ? 'mixed' : ev.clotDensity > 0.9 ? 'bright' : ev.clotDensity > 0.62 ? 'fading' : 'near iso'}</span><span className="nu">{ev.active > 0.3 ? 'still bleeding' : 'clot'}</span></div>
        </>}
      </div>
      {(ev.ht > 0.15 || ev.ivh > 0.35 || ev.hydro > 0.2) && <div className="evo-flags">{ev.ht > 0.15 && <span className="pill bad">Haemorrhagic transformation</span>}{ev.ivh > 0.35 && <span className="pill bad">Blood in the ventricles</span>}{ev.hydro > 0.2 && <span className="pill bad">Hydrocephalus</span>}</div>}
      <StageCT ct={ct} shown={shown} course={c} />
      {preset && <p className="muted small evo-note">The 3D cut shows the model of the tissue; the image above is a real patient at this stage.</p>}
    </section>
  );
}

function StageCT({ ct, shown, course }: { ct: { now: RealItem[]; all: RealItem[] }; shown?: RealItem; course: 'ischemic' | 'ich' }) {
  const [open, setOpen] = useState<string | null>(null); const cur = ct.all.find((i) => i.id === open);
  if (!ct.all.length) return null;
  return (
    <div className="evo-ct">
      <div className="eyebrow">Real CT at this stage</div>
      {shown ? <button type="button" className="evo-ct-main" onClick={() => setOpen(open === shown.id ? null : shown.id)} aria-expanded={open === shown.id}>
        <img src={`imaging/real/${shown.file}`} alt={shown.caption} loading="lazy" />
        <span className="evo-ct-cap"><b>{shown.title}</b> {shown.caption}<small>{shown.credit} · tap to study</small></span>
      </button> : <p className="muted small">No openly licensed real image for exactly this moment — pick one from the timeline below.</p>}
      <div className="evo-strip" role="list" aria-label={`Real ${course === 'ischemic' ? 'ischaemic' : 'haemorrhagic'} stroke images across time`}>
        {ct.all.map((i) => <button key={i.id} role="listitem" type="button" className={`evo-th${shown?.id === i.id ? ' on' : ''}`} title={`${i.title} · ${i.stage!.label}`}
          onClick={() => { useNeuroUI.getState().set({ playing: false }); setNeuroMinutes(Math.max(i.stage!.fromMin, Math.min(i.stage!.toMin, Math.sqrt((i.stage!.fromMin + 1) * (i.stage!.toMin + 1))))); }}>
          <img src={`imaging/real/${i.file}`} alt="" loading="lazy" /><span>{i.stage!.label}</span></button>)}
      </div>
      {cur && <RealCaseCard it={cur} />}
    </div>
  );
}
