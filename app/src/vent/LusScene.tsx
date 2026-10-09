/** Lung ultrasound of the ventilated patient: four probe zones read from the model; each zone shows the real clip of that pattern. */
import { useEffect, useMemo, useState } from 'react';
import { session } from './session';
import { lusFromVent, lusSummary, LUS_ZONES, type LusZone, type LusZoneId } from './lus';
import { RealStudy } from '../scene/imaging/RealStudy';
import { useHideFindings } from '../challenge/caseStore';
import { create } from 'zustand';
/** selected probe zone (lessons can point the probe) */
export const useLusUI = create<{ zone: LusZoneId; set: (z: LusZoneId) => void }>((set) => ({ zone: 'R-ant', set: (zone) => set({ zone }) }));

function useZones() {
  const key = (zs: LusZone[]) => JSON.stringify(zs);
  const [k, setK] = useState(() => key(lusFromVent(session)));
  useEffect(() => { const id = setInterval(() => { const n = key(lusFromVent(session)); setK((o) => (o === n ? o : n)); }, 700); return () => clearInterval(id); }, []);
  return useMemo(() => JSON.parse(k) as LusZone[], [k]);
}

/** Finding keys for one zone, most important first; the first is required of any clip shown. */
export function lusKeys(z: LusZone): string[] {
  if (z.lungPoint) return ['lung_point', 'ptx_us'];
  if (!z.sliding && !z.lungPulse) return ['absent_sliding', 'ptx_us'];
  if (z.lungPulse) return ['lung_pulse', 'consolidation'];
  const k: string[] = [];
  if (z.effusion > 0.2) k.push('pleural_effusion');
  if (z.white) k.push('whitelung', 'blines'); else if (z.bLines >= 3) k.push('blines', 'interstitial_syndrome');
  if (z.consolidation > 0.3) k.push('consolidation');
  if (!k.length) k.push('alines', 'sliding');
  return k;
}

export function LusScene() {
  const hide = useHideFindings(); const zs = useZones(); const sel = useLusUI((s) => s.zone); const setSel = useLusUI.getState().set; const z = zs.find((x) => x.id === sel)!;
  const want = lusKeys(z); const name = LUS_ZONES.find((x) => x.id === sel)!.name;
  return (
    <div className="imaging lus-view">
      <div className="lus-zones" role="group" aria-label="Probe zone">
        {zs.map((x) => { const nm = LUS_ZONES.find((l) => l.id === x.id)!.name; return <button key={x.id} className={x.id === sel ? 'on' : ''} aria-pressed={x.id === sel} onClick={() => setSel(x.id)}>
          <span>{nm.replace(' (posterolateral)', '')}</span>{!hide && <small className={x.sliding || x.lungPulse ? '' : 'bad'}>{x.sliding ? (x.white ? 'white lung' : x.bLines >= 3 ? `${x.bLines} B-lines` : x.consolidation > 0.3 ? 'consolidation' : 'A-lines') : x.lungPoint ? 'lung point' : x.lungPulse ? 'lung pulse' : 'no sliding'}</small>}
        </button>; })}
      </div>
      <RealStudy kinds={['lus', 'ptxlus', 'pleuraleff']} want={want} required={[want[0]]} label="lung ultrasound clip" hide={hide}
        reading={[`${name}: ${z.pattern}.`, `M-mode: ${z.mmode}.`, ...lusSummary(zs)]}
        missing={want[0] === 'lung_pulse' ? 'A real lung-pulse clip has not been sourced yet. Lung pulse: no sliding, but the pleural line twitches with each heartbeat — the lung is touching the chest wall but not ventilated.' : undefined} />
    </div>
  );
}
