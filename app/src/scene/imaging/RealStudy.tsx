/**
 * The imaging view for a live patient: the real, openly licensed image or clip whose findings best match what the
 * model says this patient's study would show, large, with the model's own reading beside it and other matching
 * real studies one tap away. Nothing here is drawn: if no real study carries the finding yet, the view says so
 * rather than showing a picture of something else.
 */
import { useEffect, useMemo, useState } from 'react';
import { loadReal, type RealItem } from './RealExamples';

/** Older manifest items were catalogued before finding keys existed. */
const IMPLICIT: Record<string, string[]> = {
  '3fd337c1': ['ards', 'ett_ok', 'portable'], '98c24e39': ['ards', 'portable'], bfefde5d: ['cxr_normal', 'portable'],
  'ptx-expiratory': ['ptx', 'ptx_left'], 'ptx-series-bonilla': ['ptx', 'chest_tube'],
  alines: ['alines', 'sliding'], blines: ['blines'], whitelung: ['whitelung', 'blines'],
  'lus-sliding-gillman2012': ['sliding', 'alines'], 'lus-lung-point-gillman': ['lung_point', 'ptx_us'], 'lus-absent-sliding-gillman': ['absent_sliding', 'ptx_us'],
  'pleural-fluid-gillman': ['pleural_effusion'], 'fast-ruq-positive': ['fast_ruq_positive'], 'tamponade-ginghina': ['fast_pericardial_positive', 'tamponade'],
  'ijv-2026-video-s2': ['ij_long_axis', 'ij_collapse'], 'ivc-2026-video-s1': ['ivc_plethoric'], 'ivc-collapse-gillman': ['ivc_collapsing'],
};
export const keysOf = (it: RealItem) => [...new Set([...(it.findings ?? []), ...(it.finding ? [it.finding] : []), ...(IMPLICIT[it.id] ?? [])])];

/**
 * Rank items for wanted finding keys (most important first). `required` keys must all be present (strict views such
 * as one FAST window); otherwise items need at least one wanted key. Findings the patient does not have cost points.
 */
export function rankReal(items: RealItem[], kinds: string[], want: string[], required: string[] = []): RealItem[] {
  const wantSet = new Set(want);
  return items.filter((it) => kinds.includes(it.kind)).map((it) => {
    const k = keysOf(it); let score = 0;
    want.forEach((w, i) => { if (k.includes(w)) score += (want.length - i) * 2; });
    if (it.finding && it.finding === want[0]) score += 1;
    score -= 0.6 * k.filter((x) => !wantSet.has(x) && !/^(portable|ett_ok|cxr_normal)$/.test(x)).length;
    return { it, score, ok: required.every((r) => k.includes(r)) && want.some((w) => k.includes(w)) };
  }).filter((x) => x.ok).sort((a, b) => b.score - a.score).map((x) => x.it);
}

export function useRealItems() {
  const [items, setItems] = useState<RealItem[] | null>(null);
  useEffect(() => { let on = true; loadReal().then((x) => on && setItems(x)); return () => { on = false; }; }, []);
  return items;
}

export function RealMedia({ it, className = '' }: { it: RealItem; className?: string }) {
  return it.file.endsWith('.mp4')
    ? <video key={it.id} className={className} poster={it.poster ? `imaging/real/${it.poster}` : undefined} muted loop autoPlay playsInline preload="metadata" aria-label={it.caption}>{it.webm && <source src={`imaging/real/${it.webm}`} type="video/webm" />}<source src={`imaging/real/${it.file}`} type="video/mp4" /></video>
    : <img key={it.id} className={className} src={`imaging/real/${it.file}`} alt={it.caption} />;
}
const creditOf = (it: RealItem) => (it as RealItem & { credit?: string }).credit ?? `${it.author} · ${it.license}`;

/**
 * kinds: manifest kinds to draw from. want: finding keys for this patient, most important first. required: keys a
 * study must carry to be shown at all. reading: the model's findings in words. hide: practice mode (no captions).
 */
export function RealStudy({ kinds, want, required = [], reading, hide = false, label, missing, children, compact = false }: {
  kinds: string[]; want: string[]; required?: string[]; reading: string[]; hide?: boolean; label: string; missing?: string; children?: React.ReactNode; compact?: boolean;
}) {
  const items = useRealItems(); const ranked = useMemo(() => (items ? rankReal(items, kinds, want, required) : []), [items, kinds.join(), want.join(), required.join()]); // eslint-disable-line react-hooks/exhaustive-deps
  const [pick, setPick] = useState<string | null>(null);
  useEffect(() => setPick(null), [want.join(), required.join()]); // eslint-disable-line react-hooks/exhaustive-deps
  if (!items) return <div className="loading">Loading real images…</div>;
  const it = ranked.find((x) => x.id === pick) ?? ranked[0];
  return (
    <div className={`study${compact ? ' compact' : ''}`}>
      <div className="study-frame">
        {it ? <RealMedia it={it} /> : <div className="study-missing"><b>No real {label} for this finding yet</b><span>{missing ?? 'The model’s reading is on the right. Real studies are added only when an openly licensed one has been checked.'}</span></div>}
        {children}
        {it && <span className="study-tag">Real patient</span>}
      </div>
      <aside className="study-side">
        {!hide && it && <><b className="study-t">{it.title}</b><p className="study-c">{it.caption}</p>{it.look?.length ? <ul className="study-look">{it.look.map((l) => <li key={l}>{l}</li>)}</ul> : null}</>}
        <h4>{hide ? 'Read the study' : 'This patient, from the model'}</h4>
        {hide ? <p className="muted small">Findings are hidden while you answer.</p> : <ul className="study-read">{reading.map((r) => <li key={r}>{r}</li>)}</ul>}
        {ranked.length > 1 && <div className="study-strip" role="group" aria-label={`Other real ${label}s with this finding`}>
          {ranked.slice(0, 8).map((x) => <button key={x.id} className={x.id === it?.id ? 'on' : ''} aria-pressed={x.id === it?.id} onClick={() => setPick(x.id)} title={hide ? undefined : x.title}>
            {x.file.endsWith('.mp4') ? <img src={`imaging/real/${x.poster ?? x.file.replace('.mp4', '.jpg')}`} alt="" /> : <img src={`imaging/real/${x.file}`} alt="" />}
          </button>)}
        </div>}
        {it && <p className="credit">{creditOf(it)} · different real patients illustrate the findings; teaching use only.</p>}
      </aside>
    </div>
  );
}
