/**
 * Guided, narrated ventilator lessons (data only). Each step declares the state it needs —
 * scenario, settings, holds, interventions — and the running model does the rest, so what
 * the narrator describes is what the waveforms and lungs actually do at that moment.
 */
import type { VentSettings } from '../physiology/mechanics';
import type { DyssId } from '../scenarios/dyssynchrony';
import type { VentView } from '../app/store';

export interface StepSetup {
  scenario?: string; dyss?: DyssId | null; settings?: Partial<VentSettings>; view?: VentView; pmus?: boolean;
  hold?: 'i' | 'e'; act?: 'bronchodilator' | 'suction' | 'decompress' | 'bronchoscopy'; ff?: number;
}
export type Focus = 'pressure' | 'flow' | 'volume' | 'loops' | 'numbers' | 'lungs' | 'gas';
export interface LessonStep { id: string; title: string; say: string; setup?: StepSetup; focus?: Focus[]; tryIt?: string }
export interface Lesson { id: string; title: string; level: string; blurb: string; steps: LessonStep[] }

export const VENT_LESSONS: Lesson[] = [
  {
    id: 'eom', title: 'One equation runs the ventilator', level: 'Novice', blurb: 'PIP, plateau, PEEP, resistance, compliance and the time constant — from one line of physics.',
    steps: [
      { id: 'eom1', title: 'The equation of motion', setup: { scenario: 'normal', settings: { mode: 'VC', vt: 0.45, rr: 14, flow: 50, pattern: 'square', pause: 0, peep: 5 }, view: 'front' }, focus: ['lungs'],
        say: 'Every pressure on a ventilator screen comes from one equation. Airway pressure equals resistance times flow, plus volume divided by compliance, plus PEEP. The ventilator is pushing gas through a tube and a tree of airways, and stretching an elastic lung that already sits at PEEP. Watch the lungs: each breath, the bases move down with the diaphragm.' },
      { id: 'eom2', title: 'Square flow, rising pressure', focus: ['pressure', 'flow'],
        say: 'In volume control with a square wave, flow is constant during inspiration. Look at the pressure trace. It jumps up the instant flow starts. That jump is resistance times flow. After the jump, pressure keeps climbing in a straight line, because as volume goes in, the elastic lung pushes back harder. The top of that climb is the peak inspiratory pressure, PIP.' },
      { id: 'eom3', title: 'Stop the flow: plateau', setup: { hold: 'i' }, focus: ['pressure', 'numbers'],
        say: 'Now an inspiratory hold. The valves close and flow drops to zero. With no flow, the resistance term disappears, so the pressure falls from the peak to a plateau. What is left is purely elastic: how hard the stretched lung and chest wall are pushing back. That is the plateau pressure. The drop from peak to plateau tells you about the airways. The plateau tells you about the lung.' },
      { id: 'eom4', title: 'Driving pressure and compliance', focus: ['numbers'],
        say: 'Plateau minus PEEP is the driving pressure. It is the pressure needed to fit this tidal volume into this lung. Divide the tidal volume by the driving pressure and you get static compliance. Normal is about sixty to eighty milliliters per centimeter of water. The coloured bar under the numbers splits the peak pressure into its three parts: PEEP, elastic, and resistive.' },
      { id: 'eom5', title: 'Passive exhalation and tau', focus: ['flow', 'volume'],
        say: 'Expiration is passive. The lung empties like a spring through a narrow tube, so flow is highest at the start and decays exponentially. The time constant, tau, is resistance times compliance. After one tau, about sixty three percent of the breath is out. After three tau, about ninety five percent. Here tau is under half a second, so the lung is empty long before the next breath.' },
    ],
  },
  {
    id: 'rc', title: 'Resistance or compliance?', level: 'Novice', blurb: 'The high-pressure alarm, solved with one inspiratory hold.',
    steps: [
      { id: 'rc1', title: 'Narrow airways', setup: { scenario: 'asthma', settings: { rr: 12, pause: 0.4 }, view: 'airway' }, focus: ['pressure', 'lungs'],
        say: 'This is severe bronchospasm. The airways in the translucent lungs are narrowed and inflamed. Look at the pressure: the peak is high, but the plateau after the pause is almost normal. The gap between them is huge. Resistance has gone up, compliance has not. The pressure is being spent pushing gas through the airways, not stretching the alveoli.' },
      { id: 'rc2', title: 'Open the airways', setup: { act: 'bronchodilator' }, focus: ['pressure', 'lungs', 'numbers'],
        say: 'A bronchodilator relaxes the smooth muscle. Airway resistance depends on the fourth power of the radius, so a small increase in calibre makes a large drop in resistance. Watch the airways widen, and the peak pressure fall toward the plateau. Time is compressed here: fifteen minutes of drug effect in about fifteen seconds.' },
      { id: 'rc3', title: 'A stiff lung', setup: { scenario: 'ards', settings: { pause: 0.4, rr: 16 }, view: 'side' }, focus: ['pressure', 'numbers'],
        say: 'Now a stiff, injured lung. Peak and plateau have both risen, and the gap between them is normal. The same tidal volume needs much more pressure to fit, because a large part of the lung is collapsed and the rest is stiff. That is a compliance problem.' },
      { id: 'rc4', title: 'The rule', focus: ['numbers'],
        say: 'So, when the high-pressure alarm sounds, do an inspiratory hold. High peak with a normal plateau means resistance: kinked or bitten tube, secretions, bronchospasm. High peak with a high plateau means compliance: pneumothorax, mainstem intubation, pulmonary oedema, abdominal distension, or a stiff chest wall.' },
    ],
  },
  {
    id: 'vcpc', title: 'Volume control vs pressure control', level: 'Intermediate', blurb: 'What you set, and what you get.',
    steps: [
      { id: 'vp1', title: 'Volume control', setup: { scenario: 'normal', settings: { mode: 'VC', vt: 0.45, rr: 14, flow: 50, pattern: 'square', pause: 0 }, view: 'front' }, focus: ['pressure', 'flow', 'volume'],
        say: 'In volume control you choose the tidal volume and the flow. The ventilator guarantees them, and pressure is whatever it takes. If the lung gets stiffer, or the airway narrows, pressure rises. That protects minute ventilation, but you must watch the pressures.' },
      { id: 'vp2', title: 'Pressure control', setup: { settings: { mode: 'PC', pinsp: 13, ti: 1.0 } }, focus: ['pressure', 'flow', 'volume'],
        say: 'In pressure control you choose the pressure above PEEP and the inspiratory time. The pressure trace is now a square. Flow is high at first, then decays as the lung fills and the pressure difference shrinks. Tidal volume is the result. Here it is similar to before.' },
      { id: 'vp3', title: 'Make the lung stiff', setup: { scenario: 'ards', settings: { mode: 'PC', pinsp: 13, ti: 1.0, rr: 14, peep: 5 }, view: 'side' }, focus: ['volume', 'numbers'],
        say: 'Same pressure control settings, but now in a stiff ARDS lung. The pressure is capped, so the volume falls. Look at the tidal volume: much smaller. In pressure modes, a falling tidal volume is your warning sign, just as a rising pressure is in volume modes.' },
      { id: 'vp4', title: 'Decelerating flow', setup: { settings: { mode: 'VC', vt: 0.42, rr: 18, flow: 60, pattern: 'decel' } }, focus: ['flow', 'pressure'],
        say: 'Volume control can also use a decelerating flow pattern. It delivers the volume with a lower peak pressure and a more even distribution between fast and slow lung units. The plateau does not change, because the volume and the lung are the same.' },
    ],
  },
  {
    id: 'peep', title: 'PEEP, recruitment and overdistension', level: 'Intermediate', blurb: 'Open the lung, keep it open — and know when to stop.',
    steps: [
      { id: 'pe1', title: 'The collapsed, dependent lung', setup: { scenario: 'ards', settings: { mode: 'VC', vt: 0.42, rr: 22, peep: 5, flow: 60, pattern: 'square', pause: 0.3 }, view: 'side' }, focus: ['lungs', 'gas'],
        say: 'This patient lies on their back. In ARDS, the heavy, wet lung collapses under its own weight, so the posterior, dependent regions are dark and airless. Blood still flows past them, but it picks up no oxygen. That is shunt, and it is why this patient is hypoxic despite a high FiO₂.' },
      { id: 'pe2', title: 'Raise PEEP', setup: { settings: { peep: 14 } }, focus: ['lungs', 'loops', 'gas'],
        say: 'Now raise PEEP to fourteen. Collapsed units need a higher pressure to open than to stay open. As PEEP rises, the dark posterior lung turns pink: those units are recruited. The same tidal volume now goes into more alveoli, so the driving pressure falls and compliance improves. Watch the oxygen saturation climb as shunt falls.' },
      { id: 'pe3', title: 'Too much', setup: { settings: { peep: 22, vt: 0.42 } }, focus: ['lungs', 'loops', 'numbers', 'gas'],
        say: 'Now PEEP twenty two. The anterior lung, which was already open, turns pale: it is over-stretched. The pressure volume loop flattens at the top, compliance falls again, and the plateau is above thirty. High intrathoracic pressure also squeezes the great veins, so venous return and blood pressure fall. More PEEP is not always better.' },
      { id: 'pe4', title: 'Find the middle', setup: { settings: { peep: 14, vt: 0.42 }, ff: 30 }, focus: ['numbers', 'gas'],
        say: 'The best PEEP opens the collapsed lung without over-stretching the open lung. At the bedside we look for the lowest driving pressure, an acceptable plateau, and oxygenation, while watching blood pressure. Try it yourself in explore mode.' },
    ],
  },
  {
    id: 'auto', title: 'Auto-PEEP and the time constant', level: 'Intermediate', blurb: 'Why obstructed lungs need time to empty.',
    steps: [
      { id: 'au1', title: 'Flow that never reaches zero', setup: { scenario: 'asthma', settings: { mode: 'VC', vt: 0.5, rr: 24, flow: 50, pattern: 'square', pause: 0 }, view: 'airway' }, focus: ['flow', 'lungs'],
        say: 'In severe asthma the time constant is long. Look at the expiratory flow: it is still negative when the next breath begins. The lung has not finished emptying. Each breath leaves a little gas behind, until the lung sits at a higher volume. That trapped gas has pressure: intrinsic PEEP, or auto-PEEP.' },
      { id: 'au2', title: 'Measure it', setup: { hold: 'e' }, focus: ['pressure', 'numbers'],
        say: 'An expiratory hold closes the valves at the end of expiration. The trapped alveolar pressure equilibrates with the airway, and the pressure rises above set PEEP. The difference is auto-PEEP. It adds to plateau pressure, compresses the heart, and makes the patient work harder to trigger.' },
      { id: 'au3', title: 'Give it time', setup: { settings: { rr: 12, flow: 80 } }, focus: ['flow', 'volume', 'numbers'],
        say: 'The most powerful fix is expiratory time. Lower the rate, and shorten inspiration with a higher flow. Now expiratory flow reaches zero before the next breath, and the auto-PEEP disappears. Carbon dioxide may rise. In asthma that is usually accepted: permissive hypercapnia.' },
    ],
  },
  {
    id: 'sync', title: 'Triggering, cycling and dyssynchrony', level: 'Advanced', blurb: 'Reading the patient through the ventilator.',
    steps: [
      { id: 'sy1', title: 'Pressure support', setup: { scenario: 'normal', dyss: null, settings: { mode: 'PSV', ps: 10, peep: 5, cyclePct: 25, trigFlow: 2 }, view: 'front', pmus: true }, focus: ['pressure', 'flow'],
        say: 'In pressure support the patient starts every breath. The red dashed line is the patient’s own muscle effort, which the ventilator cannot see directly. When the effort pulls enough flow past the trigger threshold, the ventilator delivers a set pressure. It stops when flow has fallen to a set percentage of the peak flow: the cycle-off criterion.' },
      { id: 'sy2', title: 'Premature cycling', setup: { dyss: 'premature', scenario: 'normal', settings: { mode: 'PSV', ps: 14, cyclePct: 60 }, pmus: true }, focus: ['flow', 'pressure'],
        say: 'Here the cycle-off threshold is sixty percent. The breath ends while the red effort line is still rising: the patient is still inhaling, but the ventilator has stopped. Look for the dip in expiratory flow right after cycling, and sometimes a second breath.' },
      { id: 'sy3', title: 'Delayed cycling', setup: { dyss: 'delayed', scenario: 'copd', settings: { mode: 'PSV', ps: 14, cyclePct: 5 }, pmus: true }, focus: ['flow', 'pressure'],
        say: 'In COPD the flow decays slowly. With a cycle-off of five percent, the ventilator keeps inflating long after the patient has finished. The effort line goes negative: the patient is actively pushing to exhale against the machine. Raising the cycle-off percentage fixes it.' },
      { id: 'sy4', title: 'Ineffective efforts', setup: { dyss: 'ineffective', scenario: 'copd', pmus: true }, focus: ['flow'],
        say: 'Now watch the expiratory flow between breaths. Small upward bumps appear with each red effort, but no breath follows. Trapped gas means the patient must first overcome auto-PEEP before any flow reaches the sensor. These are ineffective efforts. Try the challenges to diagnose and fix each dyssynchrony yourself.' },
    ],
  },
];
