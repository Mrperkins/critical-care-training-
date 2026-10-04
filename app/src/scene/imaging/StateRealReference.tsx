import { useEffect, useState } from 'react';
import { RealCaseCard } from './RealCase';
import { loadReal, type RealItem } from './RealExamples';

export interface StateRealMatch {
  id: string;
  label: string;
  reason: string;
  caveat?: string;
}

export function StateRealReference({ match }: { match: StateRealMatch | null }) {
  const [item, setItem] = useState<RealItem | null>(null);
  useEffect(() => {
    let alive = true;
    if (!match) { setItem(null); return () => { alive = false; }; }
    loadReal().then((items) => {
      if (!alive) return;
      setItem(items.find((x) => x.id === match.id) ?? null);
    });
    return () => { alive = false; };
  }, [match?.id]);

  if (!match || !item) return null;
  return (
    <section className="real rc-wrap state-real">
      <div className="real-h">
        <div><h4>{match.label}</h4><span className="img-note">{match.reason}</span></div>
        <span className="img-note">{match.caveat ?? 'Reference patient — acquisition, timing, laterality and exact anatomy may differ from the simulation.'}</span>
      </div>
      <RealCaseCard it={item} />
    </section>
  );
}
