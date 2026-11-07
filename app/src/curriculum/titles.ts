/** Human titles for every catalog id, from the lessons and workflows themselves (one source of truth). */
import { DISEASES } from '../atlas/registry';
import { LESSON_HOSTS } from '../director/lessonIndex';
import { VENT_LESSONS } from '../lessons/vent';
import { ABG_LESSONS } from '../lessons/abg';
import { LAB_LESSONS } from '../lessons/labs';
import { LINES_LESSONS } from '../lines/lessons';
import { VENT_WORKFLOWS } from '../workflows/chestTube';
import { LINES_WORKFLOWS } from '../workflows/linesWorkflows';
import { CENTRAL_LINE } from '../procedures/centralLineFlow';
import { VENT_CHALLENGES } from '../scenarios/ventChallenges';
import { LAB_CASES } from '../scenarios/labCases';
import { LINES_CASES } from '../lines/cases';
import { ABG_PRESETS } from '../scenarios/abg';
import { SCENE_CASES } from '../challenge/sceneCases';

export const TITLES: Record<string, string> = {};
for (const h of LESSON_HOSTS) for (const t of h.timelines) TITLES[t.id] = t.title;
for (const l of [...VENT_LESSONS, ...ABG_LESSONS, ...LAB_LESSONS, ...LINES_LESSONS] as { id: string; title: string }[]) TITLES[l.id] = l.title;
for (const w of [...VENT_WORKFLOWS, ...LINES_WORKFLOWS, CENTRAL_LINE]) TITLES[w.id] = w.title;
for (const c of VENT_CHALLENGES as { id: string; title: string }[]) TITLES[`vent-${c.id}`] = c.title;
for (const c of LAB_CASES) TITLES[`lab-${c.id}`] = c.story.split('.')[0];
for (const c of LINES_CASES as { id: string; title: string }[]) TITLES[`lines-${c.id}`] = c.title;
for (const p of ABG_PRESETS) TITLES[`abg-${p.id}`] = p.name;
for (const c of SCENE_CASES) TITLES[c.id] = c.title;
for (const d of DISEASES) TITLES[`atlas-${d.id}`] = d.title;
export const titleOf = (id: string) => TITLES[id] ?? id;
