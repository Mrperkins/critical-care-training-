# Case conference editorial standard

The requested format is a clinical conference told through concise slides and an independently useful speaker script. The October 22 reference is [the ECG case lecture supplied by the user](https://www.youtube.com/watch?v=e9wfkausRGA). Video analysis identified a sequence of short history/examination slides, a differential question, annotated diagnostic evidence, the clinical outcome and take-home teaching. The reference informs presentation structure; its patient cases and dialogue are not copied into this synthetic collection.

## The two tracks

**On screen:** age, weight or pregnancy timing; a few history and examination clues; readable vital signs and laboratory values; a focused interpretation question; concise priorities; response to treatment; a titled synopsis. Keep narrative slides to four short points and approximately 65 words including their title. Numeric data panels are exempt from that word budget.

**In the recording:** establish the scene, tell the history, describe all essential visual findings verbally, surface a plausible early interpretation, explain which clue changes it, weigh uncertainty, justify priorities and follow the response. The clinical source record supplies the complete factual story, while the separately authored commentary adds interpretation. Do not infer additional patient observations from the topic label.

| Beat | Slide task | Speaker task |
|---|---|---|
| Handoff | Brief patient context and presenting problem | Establish what brought the patient to this moment |
| Bedside | High-value examination clues | Explain what those findings mean together |
| Observations | Vital signs with support and timing | Interpret the cluster and its trajectory |
| Investigation | Labs, including deliberately absent tests | Connect results to the story and identify limitations |
| Evidence | Diagnostic findings or attributed comparison | Describe evidence for the listener and discuss uncertainty |
| Decision | One clinically meaningful fork | Ask the question, then allow a four-second reflection pause |
| Discussion | Concise management priorities | Explain why the priorities follow from the evidence |
| Course | Actual authored response and unresolved concerns | Reassess whether treatment changed the physiology |
| Synopsis | A titled synthesis and a few teaching points | Connect the turning point to the disease lesson |

## Example: a quieter child with asthma

The explicit diagnosis is life-threatening status asthmaticus with acute hypercapnic and hypoxemic respiratory failure. The conference introduces the child, mother's account, EMS findings, preceding treatment and the moment deterioration occurs. The observation slide shows the respiratory rate falling from 42 to 18 with shallow effort, alongside the current pressure and saturation. Eighteen lies within the cited observation range for a twelve-year-old, yet falling effort with drowsiness and poor air movement indicates exhaustion. Do not mislabel an in-range number as bradypnea or call it recovery without assessing effective ventilation.

The arterial gas is taught value by value: reference interval, acidemia, hypercapnia and hypoxemia, their mechanisms and their common associated signs. The airway decision follows the actual bedside decline. The subsequent synthetic course reports the interventions, repeat gas, pressure and oxygen response, extubation and final diagnosis. A repeat value that is improving but still abnormal must be described as such.

This information is staged across the case rather than placed on one dense slide. A listener receives the vital values, the bedside change, the reasoning and the response without needing to look at a tracing or tap an answer.

## Specialty and visual requirements

Pediatric and neonatal cases preserve age, measured weight and relevant gestational/postnatal context. Obstetric cases preserve gestation or postpartum day, maternal observations and fetal findings when relevant. A currently reassuring value never silently replaces the rest of the story.

Actual diagnostic reference images retain attribution and identify the separate patient. AI-generated scene illustrations are setting images, not diagnostic evidence. Where a new case needs an exact ECG, monitor trace, laboratory panel or trend, author it from the validated synthetic measurements or use an appropriate attributed reference; a generated photograph cannot establish a precise medical finding. Further case-specific diagnostic visuals and clinical review remain part of expanding the library.

Real radiographs, CT, ultrasound, fractures and congenital malformations must come from appropriately licensed clinical sources, never fabricated raster diagnostic images. The original film is preserved; annotation overlays identify the finding without altering the underlying study. Conference images appear during the diagnostic discussion without a quiz gate. Describe orientation, the expected anatomy, the abnormality, its meaning and its limitations aloud. Croup uses a real frontal steeple-sign film. The severe-croup differential compares that with a real lateral thumb-sign film while stating that the synthetic case ultimately has croup. Neither film is an instruction to move an unstable child to radiology.

## Every finding needs interpretation

Every authored vital sign, laboratory result or deliberately deferred test has a `FindingTeaching` record. The recording places it directly after the value: a sourced age, specimen and context-appropriate reference; the named abnormality or explicit statement that it is in range; its meaning in this patient; and commonly associated clinical signs. Possible associations are not additional examination findings. Do not imply that a normal initial potassium excludes DKA potassium depletion, that preserved pressure excludes shock, or that an adult lactate limit applies to a three-day-old newborn.

Distinguish healthy resting ranges, broad acceptable observations for unwell children, diagnostic thresholds and resuscitation targets. State when a nearby pediatric age band is being used. Identify arterial versus peripheral venous gas and the oxygen support. A treatment setting such as PEEP has no universal normal interval; explain its role and tolerance instead. A qualitative or deferred result must not acquire invented numeric values.

`clinicalReviews/` contains the case-specific diagnosis, EMS/referral context, interpretation and subsequent course for all 32 current cases. Shared references supply sourceable comparison facts; patient-specific interpretations and outcomes are authored, not generated from numerical cutoffs. This remains an initial case bank, not comprehensive exam coverage or clinical sign-off.

## Acceptance before release

- Every case has a separately authored screen outline and commentary for all nine beats.
- Every case names a disease process early, gives a concrete patient timeline and closes with the established diagnosis and a plausible outcome, including any remaining uncertainty.
- Every observation has its sourced reference, interpretation and common associations immediately narrated after the value. No missing interpretation can silently fall back to generic theory.
- Audio contains the complete clinical history, all data values and the reasoning, with no reliance on screen interaction.
- A decision pause is baked into the continuous MP3 and represented in measured chapter timing and the transcript.
- Changes to text, pause timing or narrator invalidate the recording and its saved resume position.
- Assembly rejects clips from an obsolete script plan. Media must fully decode before it is committed by the narration workflow.
- Clinical accuracy, source currency, pronunciation, pedagogical quality and physical mobile background playback still require their applicable reviews. Automated content checks do not establish human editorial or clinical sign-off.
