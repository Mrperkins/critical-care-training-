import type { MasteryState } from './types';

export interface ReviewPrompt {
  id: string;
  concept: string;
  question: string;
  options: string[];
  answer: number;
  explain: string;
}

export const REVIEW_PROMPTS: ReviewPrompt[] = [
  {
    id: 'rv-peep', concept: 'rv-failure',
    question: 'A patient with severe RV failure becomes hypotensive after intubation. Which explanation best fits the physiology?',
    options: [
      'Positive pressure can reduce venous return and increase RV afterload at the same time',
      'PEEP always increases LV preload',
      'Intubation directly lowers hemoglobin',
      'Positive pressure always lowers pulmonary vascular resistance',
    ],
    answer: 0,
    explain: 'The failing RV can be hit from both sides: less venous return and more effective pulmonary vascular load, especially with overdistension, hypoxemia, hypercapnia or acidosis.',
  },
  {
    id: 'do2-spo2', concept: 'oxygen-delivery',
    question: 'Which patient can have a normal SpO₂ and still have critically low oxygen delivery?',
    options: [
      'A patient with severe anemia and very low cardiac output',
      'A patient with normal hemoglobin and normal cardiac output',
      'A patient whose SpO₂ increased from 96% to 97%',
      'A patient breathing room air with normal perfusion',
    ],
    answer: 0,
    explain: 'DO₂ depends strongly on hemoglobin and cardiac output as well as arterial saturation. Saturation alone cannot establish adequate oxygen delivery.',
  },
  {
    id: 'fluid-response', concept: 'fluid-responsiveness',
    question: 'A positive passive-leg-raise response tells you most directly that…',
    options: [
      'Stroke volume is likely to increase if preload increases',
      'The patient definitely needs IV fluid',
      'The patient can safely tolerate any amount of fluid',
      'CVP must be low',
    ],
    answer: 0,
    explain: 'Responsiveness is not the same as need or tolerance. The next question is whether fluid is the best and safest way to increase preload.',
  },
  {
    id: 'drive', concept: 'driving-pressure',
    question: 'Plateau pressure is 27 cmH₂O and total PEEP is 12 cmH₂O. What is the driving pressure?',
    options: ['15 cmH₂O', '39 cmH₂O', '12 cmH₂O', '27 cmH₂O'],
    answer: 0,
    explain: 'Driving pressure is plateau pressure minus total PEEP: 27 − 12 = 15 cmH₂O.',
  },
  {
    id: 'art-low', concept: 'arterial-line',
    question: 'If an arterial-line transducer is positioned substantially below its reference level, the displayed pressure tends to be…',
    options: ['Falsely high', 'Falsely low', 'Unchanged', 'Zero'],
    answer: 0,
    explain: 'A lower transducer adds hydrostatic pressure to the measured column, producing a falsely high displayed pressure.',
  },
  {
    id: 'fast-neg', concept: 'efast',
    question: 'Which statement about a negative FAST is most accurate?',
    options: [
      'It does not exclude small-volume or retroperitoneal bleeding and may need repeating',
      'It rules out abdominal injury',
      'It rules out hemorrhage if blood pressure is normal',
      'It is more sensitive for retroperitoneal than intraperitoneal blood',
    ],
    answer: 0,
    explain: 'FAST is a focused search for free fluid in specific spaces. Early, small-volume and retroperitoneal hemorrhage can be missed.',
  },
  {
    id: 'ivc', concept: 'venous-return',
    question: 'Why can CVP rise while venous return and cardiac output fall?',
    options: [
      'The pressure at the right atrium can rise enough to reduce the gradient driving venous return',
      'CVP and venous return must always move together',
      'Higher CVP always means more circulating volume',
      'Venous return is determined only by heart rate',
    ],
    answer: 0,
    explain: 'Venous return depends on a pressure gradient. Raising downstream right-atrial pressure can shrink that gradient even while the measured CVP rises.',
  },
  {
    id: 'uncertainty', concept: 'uncertainty',
    question: 'Which behavior best represents expert reasoning under uncertainty?',
    options: [
      'State the working model, confidence, expected response and what finding would prove it wrong',
      'Choose one diagnosis early and defend it consistently',
      'Avoid committing to any model until every test is back',
      'Treat the most abnormal number first',
    ],
    answer: 0,
    explain: 'Expert reasoning is calibrated and revisable: commit provisionally, predict, observe, and update when reality contradicts the model.',
  },
];

const DAY = 86_400_000;
export function nextIntervalDays(s?: MasteryState) {
  if (!s || s.exposures === 0) return 0;
  const accuracy = s.correct / Math.max(1, s.exposures);
  const avgConfidence = s.confidence.length ? s.confidence.reduce((a, b) => a + b, 0) / s.confidence.length : 50;
  if (accuracy < .6 || avgConfidence < 45) return 1;
  if (s.exposures < 3) return 3;
  if (accuracy < .85) return 7;
  if (s.exposures < 6) return 14;
  return 30;
}

export function reviewDue(s?: MasteryState, now = Date.now()) {
  if (!s?.lastSeen) return true;
  return now >= new Date(s.lastSeen).getTime() + nextIntervalDays(s) * DAY;
}

export function duePrompts(mastery: Record<string, MasteryState>, now = Date.now()) {
  return REVIEW_PROMPTS.filter((q) => reviewDue(mastery[q.concept], now))
    .sort((a, b) => {
      const A = mastery[a.concept], B = mastery[b.concept];
      if (!A && B) return -1; if (A && !B) return 1;
      return (A?.lastSeen ?? '').localeCompare(B?.lastSeen ?? '');
    });
}
