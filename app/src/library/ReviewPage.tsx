/**
 * Clinical review: everything written during the rebuild that a clinician has not yet signed off, in one place.
 * Each item can be marked "Looks right" or "Needs a change" with a note. The marks stay in this browser; "Copy my
 * review" puts them on the clipboard as plain text to send back.
 */
import { useMemo, useState } from 'react';
import { DISEASES } from '../atlas/registry';
import { PATIENTS } from '../atlas/patients';
import { CASE_BY_ID } from '../challenge/sceneCases';
import { MISSIONS } from './missions';

type Mark = { ok?: boolean; note?: string };
const KEY = 'ccp.review.v1';
const load = (): Record<string, Mark> => { try { return JSON.parse(localStorage.getItem(KEY) ?? '{}'); } catch { return {}; } };
/** cases that gained new decisions in the rebuild, and how many decisions each had before */
export const EXTENDED: Record<string, number> = { 'case-abd-fast-spleen': 2, 'case-abd-aaa': 3, 'case-neuro-m1l': 2, 'case-neuro-uncal': 2, 'case-neuro-evd': 2, 'case-heart-vsd': 2, 'case-img-cxr-tension': 2, 'case-img-cxr-ards': 2, 'case-lines-pph': 2 };
interface Item { id: string; title: string; text: string; detail?: string }
export function reviewGroups(): { key: string; title: string; about: string; items: Item[] }[] {
  const cases: Item[] = Object.entries(EXTENDED).flatMap(([id, from]) => { const c = CASE_BY_ID[id]; return c ? c.questions.slice(from).map((q, i) => ({ id: `${id}:${from + i}`, title: `${c.title} · decision ${from + i + 1}`, text: `${q.update ? `${q.update} ` : ''}${q.q} → ${q.options[q.answer]}`, detail: `${q.explain} Other choices: ${q.options.filter((_, k) => k !== q.answer).join(' / ')}` })) : []; });
  return [
    { key: 'cases', title: 'New case decisions', about: 'Decisions added so cases move on in time. Check the keyed answer, the explanation and the wrong choices.', items: cases },
    { key: 'patients', title: 'Patient vignettes', about: 'The one-line patient each condition lesson opens on. Check the picture and the numbers are believable.', items: DISEASES.filter((d) => PATIENTS[d.id]).map((d) => ({ id: `patient:${d.id}`, title: d.title, text: PATIENTS[d.id] })) },
    { key: 'missions', title: 'Missions', about: 'Framing only: each call is an existing case.', items: MISSIONS.map((m) => ({ id: `mission:${m.id}`, title: m.title, text: m.brief, detail: m.legs.map((l) => l.label).join(' → ') })) },
  ];
}

export function ReviewPage() {
  const groups = useMemo(reviewGroups, []); const [marks, setMarks] = useState<Record<string, Mark>>(load); const [open, setOpen] = useState<string>('cases'); const [copied, setCopied] = useState(false);
  const set = (id: string, m: Mark) => setMarks((all) => { const next = { ...all, [id]: { ...all[id], ...m } }; try { localStorage.setItem(KEY, JSON.stringify(next)); } catch { /* storage unavailable */ } return next; });
  const total = groups.reduce((n, g) => n + g.items.length, 0); const done = groups.reduce((n, g) => n + g.items.filter((i) => marks[i.id]?.ok != null).length, 0);
  const copy = () => {
    const lines = groups.flatMap((g) => [`## ${g.title}`, ...g.items.filter((i) => marks[i.id]?.ok != null || marks[i.id]?.note).map((i) => `- [${marks[i.id]?.ok === true ? 'OK' : marks[i.id]?.ok === false ? 'CHANGE' : 'NOTE'}] ${i.title}${marks[i.id]?.note ? ` — ${marks[i.id]!.note}` : ''}`)]);
    void navigator.clipboard?.writeText(`Clinical review (${done}/${total} marked)\n${lines.join('\n')}`).then(() => { setCopied(true); setTimeout(() => setCopied(false), 2500); }).catch(() => undefined);
  };
  return (
    <div className="lib-page rv">
      <h1 className="lib-display">Clinical review</h1>
      <p className="lib-lede">New clinical wording from the rebuild that has not been signed off. {done} of {total} marked. Marks are saved on this device.</p>
      <div className="rv-top"><div className="rv-bar" role="img" aria-label={`${done} of ${total} reviewed`}><i style={{ width: `${total ? (done / total) * 100 : 0}%` }} /></div><button className="lib-btn" onClick={copy}>{copied ? 'Copied' : 'Copy my review'}</button></div>
      <p className="rv-note">Not on this list, and also not yet clinically reviewed: the narrated audio (computer voice, 536 recordings), the 32 case conferences, and the three ventilator alarm replies added earlier. They are labelled in place.</p>
      {groups.map((g) => { const n = g.items.filter((i) => marks[i.id]?.ok != null).length; return (
        <section key={g.key} className="rv-group">
          <button className="rv-head" aria-expanded={open === g.key} onClick={() => setOpen(open === g.key ? '' : g.key)}><b>{g.title}</b><span>{n}/{g.items.length}</span></button>
          {open === g.key && <><p className="rv-about">{g.about}</p><ol className="rv-list">{g.items.map((i) => { const m = marks[i.id] ?? {}; return (
            <li key={i.id} className={m.ok === true ? 'ok' : m.ok === false ? 'change' : ''}>
              <b>{i.title}</b><p>{i.text}</p>{i.detail && <p className="rv-detail">{i.detail}</p>}
              <div className="rv-acts"><button aria-pressed={m.ok === true} onClick={() => set(i.id, { ok: m.ok === true ? undefined : true })}>Looks right</button><button aria-pressed={m.ok === false} onClick={() => set(i.id, { ok: m.ok === false ? undefined : false })}>Needs a change</button>
                <input aria-label={`Note for ${i.title}`} placeholder="Note (optional)" value={m.note ?? ''} onChange={(e) => set(i.id, { note: e.target.value })} /></div>
            </li>); })}</ol></>}
        </section>); })}
    </div>
  );
}
