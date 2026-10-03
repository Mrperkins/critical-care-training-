import { EPISODES, MENTAL_REPS } from './catalog';
import { masteryScore } from './progress';
import { reviewDue } from './review';
import type { AudioEpisode, MasteryState, MentalRep } from './types';

function need(id: string, mastery: Record<string, MasteryState>) {
  const s = mastery[id]; if (!s) return 1.15;
  const weak = 1 - masteryScore(s) / 100;
  const overdue = reviewDue(s) ? .2 : 0;
  return weak + overdue;
}
function score(concepts: string[], mastery: Record<string, MasteryState>) {
  if (!concepts.length) return 0;
  const values = concepts.map((id) => need(id, mastery)).sort((a,b) => b-a);
  // Let the weakest two concepts dominate without making broad lessons win solely because they have more tags.
  return values.slice(0,2).reduce((a,b) => a+b,0) / Math.min(2, values.length);
}
export function recommendedEpisode(mastery: Record<string, MasteryState>, completed: Record<string,string>): AudioEpisode {
  return [...EPISODES].sort((a,b) => {
    const freshA = completed[a.id] ? -.15 : 0, freshB = completed[b.id] ? -.15 : 0;
    return score(b.concepts, mastery)+freshB - (score(a.concepts, mastery)+freshA);
  })[0] ?? EPISODES[0];
}
export function recommendedRep(mastery: Record<string, MasteryState>, completed: Record<string,string>): MentalRep {
  return [...MENTAL_REPS].sort((a,b) => {
    const freshA = completed[a.id] ? -.15 : 0, freshB = completed[b.id] ? -.15 : 0;
    return score(b.concepts, mastery)+freshB - (score(a.concepts, mastery)+freshA);
  })[0] ?? MENTAL_REPS[0];
}
