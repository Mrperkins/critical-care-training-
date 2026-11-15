import { useMemo } from 'react';
import { vesselCentrelines } from '../heart/heartGeometry';
import { VolumeFlow } from '../scene/VolumeFlow';
import { useDirector } from '../director/director';
import type { DiseaseState } from './types';
/** The existing aortic path; diminished visual flow is qualitative, never calibrated cardiac output. */
export function MechanismCirculation({ state }: {state:DiseaseState}) {
  const path=useMemo(()=>{const v=vesselCentrelines();return [...v.asc,...v.desc];},[]);
  return <VolumeFlow path={path} color="#ef8570" label="Illustrative systemic perfusion" sample={()=>({
    time:window.matchMedia('(prefers-reduced-motion: reduce)').matches ? 0 : useDirector.getState().t,
    activity:1-state.flowLoss*.85, speed:1-state.flowLoss*.7,
  })} />;
}
