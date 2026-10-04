import { EPISODES } from './catalog';
import { DOMAIN_LABELS } from './mastery';
import type { AudioEpisode, CriticalCareDomain } from './types';

export interface ExpertTrack {
  id: string;
  title: string;
  promise: string;
  domains: CriticalCareDomain[];
  episodes: AudioEpisode[];
}

const order: CriticalCareDomain[] = [
  'foundations','respiratory','hemodynamics','cardiac','neuro','renal-metabolic',
  'infectious','hematology','pharmacology','imaging-monitoring','procedures','gi-hepatic',
  'endocrine','toxicology','transplant','trauma-burns','obstetric',
  'peds-neonatal','recovery','communication-systems','multisystem'
];

const promise: Partial<Record<CriticalCareDomain,string>> = {
  foundations:'Become fluent in the pressure, flow and language used everywhere else in critical care.',
  respiratory:'Reason from mechanics and gas exchange through ventilator strategy and failure.',
  hemodynamics:'Think in flow, tone, venous return, oxygen delivery and testable shock models.',
  cardiac:'Integrate pump failure, RV physiology, obstruction, invasive hemodynamics and mechanical support.',
  neuro:'Protect cerebral perfusion, recognize deterioration and reason through ICP, seizures and neuroprognosis.',
  'renal-metabolic':'Master acid-base, DKA/HHS, renal support and the physiology hidden inside laboratory values.',
  infectious:'Treat sepsis as source + host + antimicrobial exposure + evolving circulatory physiology.',
  hematology:'Understand transfusion, hemorrhage and coagulation as interacting systems rather than isolated lab numbers.',
  pharmacology:'Choose vasoactives, analgesia and sedation from physiology, receptor effects and tradeoffs.',
  'imaging-monitoring':'Turn waveforms and bedside imaging into physiologic evidence rather than decorative data.',
  procedures:'Understand why, when and how procedures fail—not just the mechanical sequence.',
  'gi-hepatic':'Manage liver failure, GI hemorrhage, pancreatitis and nutrition as multisystem critical illness.',
  endocrine:'Recognize endocrine crises by the organ failure they cause, not just the hormone level.',
  toxicology:'Use toxicodynamics, acid-base and electrophysiology to build the antidote/support strategy.',
  transplant:'Reason through rejection, immune deficit, altered anatomy and drug toxicity without premature closure.',
  'trauma-burns':'Balance hemorrhage, brain perfusion, burn shock and airway injury under competing priorities.',
  obstetric:'Apply pregnancy-specific physiology to hemorrhage, hypertensive disease and cardiac failure.',
  'peds-neonatal':'Think from age, size, transition physiology and circulation topology—not scaled-down adult care.',
  recovery:'Treat liberation, weakness, delirium and long-term recovery as part of ICU care from day one.',
  'communication-systems':'Build expertise in uncertainty, prognosis, goals of care and high-stakes communication.',
  multisystem:'Practice the messy cases where several organ systems are right at the same time.',
};

export const EXPERT_TRACKS: ExpertTrack[] = order.map((domain) => {
  const episodes = EPISODES.filter((e) => e.domain === domain).sort((a,b) => a.level-b.level || a.minutes-b.minutes);
  return {
    id: domain,
    title: DOMAIN_LABELS[domain],
    promise: promise[domain] ?? 'Build progressive critical-care mastery in this domain.',
    domains:[domain],
    episodes,
  };
}).filter((t) => t.episodes.length);

export const TRACK_BY_ID = Object.fromEntries(EXPERT_TRACKS.map((t)=>[t.id,t])) as Record<string,ExpertTrack>;
