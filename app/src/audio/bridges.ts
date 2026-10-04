import type { CriticalCareDomain } from './types';

export interface VisualBridge {
  label: string;
  href: string;
  domain: CriticalCareDomain;
  note: string;
}

const q = (p: Record<string, string>) => '../?' + new URLSearchParams(p).toString();

/** Links from audio/mastery concepts back into the existing visual physiology product. */
export const VISUAL_BRIDGES: Record<string, VisualBridge> = {
  preload: { label: 'Open live hemodynamics', href: q({ module: 'lines', mode: 'explore' }), domain: 'hemodynamics', note: 'Manipulate pressures and volume on the live circulation.' },
  'venous-return': { label: 'Open shock hemodynamics', href: q({ module: 'lines', mode: 'explore' }), domain: 'hemodynamics', note: 'Watch filling pressure and flow diverge.' },
  'fluid-responsiveness': { label: 'Open live circulation', href: q({ module: 'lines', mode: 'explore' }), domain: 'hemodynamics', note: 'Connect a preload change to actual flow.' },
  'rv-failure': { label: 'Open the live heart', href: q({ module: 'heart', mode: 'explore' }), domain: 'cardiac', note: 'See pressure loading, shunt direction and ventricular interaction.' },
  pvr: { label: 'Open pulmonary circulation', href: q({ module: 'heart', mode: 'explore' }), domain: 'cardiac', note: 'Change pulmonary resistance and observe right-heart consequences.' },
  'ventricular-interdependence': { label: 'Open the live heart', href: q({ module: 'heart', mode: 'explore' }), domain: 'cardiac', note: 'See the two ventricles as a coupled system.' },
  'ppv-hemodynamics': { label: 'Open ventilator physiology', href: q({ module: 'vent', mode: 'explore' }), domain: 'respiratory', note: 'Change airway pressure while watching patient response.' },
  peep: { label: 'Manipulate PEEP', href: q({ module: 'vent', mode: 'explore' }), domain: 'respiratory', note: 'Recruitment, overdistension and pressure are visible together.' },
  'driving-pressure': { label: 'Open ventilator mechanics', href: q({ module: 'vent', mode: 'explore' }), domain: 'respiratory', note: 'Connect plateau pressure, PEEP and compliance.' },
  compliance: { label: 'Open respiratory mechanics', href: q({ module: 'vent', mode: 'explore' }), domain: 'respiratory', note: 'Separate resistance from compliance using the live model.' },
  ards: { label: 'Open ARDS lung', href: q({ module: 'vent', mode: 'learn' }), domain: 'respiratory', note: 'Guided visual ARDS physiology and recruitment.' },
  'dead-space': { label: 'Open gas exchange', href: q({ module: 'abg', mode: 'explore' }), domain: 'respiratory', note: 'Follow CO₂ from tissue to capillary to lung.' },
  'oxygen-delivery': { label: 'Open oxygen-delivery lesson', href: q({ module: 'lines', mode: 'learn' }), domain: 'hemodynamics', note: 'Connect hemoglobin, saturation and flow.' },
  'oxygen-extraction': { label: 'Open live hemodynamics', href: q({ module: 'lines', mode: 'explore' }), domain: 'hemodynamics', note: 'Relate flow to venous saturation and extraction.' },
  shock: { label: 'Open shock simulator', href: q({ module: 'lines', mode: 'learn' }), domain: 'hemodynamics', note: 'Compare hemorrhagic, distributive and cardiogenic physiology.' },
  lactate: { label: 'Open blood gas / labs', href: q({ module: 'abg', mode: 'explore' }), domain: 'renal-metabolic', note: 'Keep lactate inside the larger acid-base and perfusion model.' },
  'acid-base': { label: 'Open blood-gas trainer', href: q({ module: 'abg', mode: 'learn' }), domain: 'renal-metabolic', note: 'Visualize compensation and mixed disorders.' },
  'icp-cpp': { label: 'Open neurocritical care', href: q({ module: 'neuro', mode: 'learn' }), domain: 'neuro', note: 'See ICP, perfusion, herniation and imaging together.' },
  evd: { label: 'Open ICP / EVD lesson', href: q({ module: 'neuro', mode: 'learn' }), domain: 'procedures', note: 'Pair the mental rep with the visual ICP model.' },
  'arterial-line': { label: 'Open invasive lines', href: q({ module: 'lines', mode: 'learn' }), domain: 'procedures', note: 'Waveform and pressure monitoring in the live circulation.' },
  'waveform-damping': { label: 'Open line waveforms', href: q({ module: 'lines', mode: 'explore' }), domain: 'imaging-monitoring', note: 'Interrogate the monitoring system, not only the number.' },
  efast: { label: 'Open eFAST', href: q({ module: 'abdomen', mode: 'explore' }), domain: 'imaging-monitoring', note: 'Use synthetic ultrasound and real positive FAST media.' },
  'central-line': { label: 'Open IJ procedure lesson', href: q({ lesson: 'lines-cvc' }), domain: 'procedures', note: 'Real-time tip tracking and vessel confirmation.' },
  'chest-tube': { label: 'Open pleural procedure training', href: q({ module: 'vent', mode: 'learn' }), domain: 'procedures', note: 'Connect pleural mechanics, drain behavior and patient response.' },
  'vent-troubleshooting': { label: 'Open ventilator practice', href: q({ module: 'vent', mode: 'sim' }), domain: 'respiratory', note: 'Use the live ventilator and circuit-failure states.' },
};

export const bridgeFor = (concept: string) => VISUAL_BRIDGES[concept];
