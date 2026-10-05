import { useEffect, useState } from 'react';
import { RealCaseCard } from './RealCase';
import { loadReal, type RealItem } from './RealExamples';
import type { RealReferenceMatch } from './realStateReference';

export function StateRealFinding({ match }: { match: RealReferenceMatch | null }) {
  const [item, setItem] = useState<RealItem | null>(null);

  useEffect(() => {
    let alive = true;
    if (!match) {
      setItem(null);
      return () => { alive = false; };
    }
    loadReal().then((items) => {
      if (!alive) return;
      setItem(items.find((x) => x.id === match.id) ?? null);
    });
    return () => { alive = false; };
  }, [match?.id]);

  if (!match || !item) return null;
  return (
    <section className="real rc-wrap">
      <div className="real-h">
        <div>
          <h4>{match.label}</h4>
          <span className="img-note">{match.reason}</span>
        </div>
        <span className="img-note">Reference patient — laterality, timing, body habitus and exact anatomy may differ from the simulation.</span>
      </div>
      <RealCaseCard it={item} />
    </section>
  );
}
