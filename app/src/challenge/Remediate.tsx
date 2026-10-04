/** After a miss: the concepts this challenge tests, each with the lesson or drug mechanism that teaches it. */
import { CHALLENGE_CONCEPTS, CONCEPTS } from '../curriculum/catalog';
import { titleOf } from '../curriculum/titles';
import { MECH } from '../moa/registry';
import { openLesson, openDrug } from '../app/navigate';

export function Remediate({ id, ok }: { id: string; ok: boolean }) {
  const cs = CHALLENGE_CONCEPTS[id] ?? []; if (ok || !cs.length) return null;
  return (
    <div className="remediate" role="note">
      <b className="small">Review:</b>
      {cs.map((k) => <div key={k} className="rem-row"><span className="muted small">{CONCEPTS[k].name}</span><div className="chips">{CONCEPTS[k].remediate.map((r) => 'lesson' in r
        ? <button key={r.lesson} className="chip" onClick={() => openLesson(r.lesson)}>Learn: {titleOf(r.lesson)} →</button>
        : <button key={r.drug} className="chip" onClick={() => openDrug(r.drug)}>Drug: {MECH[r.drug]?.drug ?? r.drug} →</button>)}</div></div>)}
    </div>
  );
}
