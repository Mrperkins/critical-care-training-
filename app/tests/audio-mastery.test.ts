import { describe, expect, it } from 'vitest';
import { EPISODES, MENTAL_REPS } from '../src/audio/catalog';
import { MASTERY, MASTERY_BY_ID } from '../src/audio/mastery';
import { MASTERY_NOTES } from '../src/audio/masteryNotes';
import { REVIEW_PROMPTS } from '../src/audio/review';

describe('critical care audio mastery model', () => {
  it('has unique concept, episode and Mental Rep ids', () => {
    const unique = (ids: string[]) => new Set(ids).size === ids.length;
    expect(unique(MASTERY.map((x) => x.id))).toBe(true);
    expect(unique(EPISODES.map((x) => x.id))).toBe(true);
    expect(unique(MENTAL_REPS.map((x) => x.id))).toBe(true);
  });

  it('keeps every prerequisite and related concept resolvable', () => {
    for (const c of MASTERY) {
      for (const p of c.prereq) expect(MASTERY_BY_ID[p], `${c.id} prerequisite -> ${p}`).toBeTruthy();
      for (const r of c.related) expect(MASTERY_BY_ID[r], `${c.id} related -> ${r}`).toBeTruthy();
    }
  });

  it('maps every episode and Mental Rep to real mastery concepts', () => {
    for (const e of EPISODES) for (const id of e.concepts) expect(MASTERY_BY_ID[id], `${e.id} -> ${id}`).toBeTruthy();
    for (const r of MENTAL_REPS) for (const id of r.concepts) expect(MASTERY_BY_ID[id], `${r.id} -> ${id}`).toBeTruthy();
  });

  it('gives every mastery concept expert teaching notes', () => {
    for (const c of MASTERY) {
      const n = MASTERY_NOTES[c.id];
      expect(n, `expert notes missing: ${c.id}`).toBeTruthy();
      expect(n.mechanism.length).toBeGreaterThan(40);
      expect(n.bedside.length).toBeGreaterThan(30);
      expect(n.traps.length).toBeGreaterThanOrEqual(2);
      expect(n.integration.length).toBeGreaterThan(30);
    }
  });

  it('gives every mastery concept at least one expertise-audio teaching path', () => {
    const covered = new Set(EPISODES.flatMap((e) => e.concepts));
    for (const c of MASTERY) expect(covered.has(c.id), `audio coverage missing: ${c.id}`).toBe(true);
  });

  it('gives every mastery concept spaced-retrieval coverage', () => {
    const ids = REVIEW_PROMPTS.map((q) => q.id);
    expect(new Set(ids).size).toBe(ids.length);
    const covered = new Set(REVIEW_PROMPTS.map((q) => q.concept));
    for (const c of MASTERY) expect(covered.has(c.id), `review coverage missing: ${c.id}`).toBe(true);
    for (const q of REVIEW_PROMPTS) {
      expect(MASTERY_BY_ID[q.concept], `${q.id} -> ${q.concept}`).toBeTruthy();
      expect(q.options).toHaveLength(4);
      expect(q.answer).toBeGreaterThanOrEqual(0);
      expect(q.answer).toBeLessThan(q.options.length);
      expect(q.explain.length).toBeGreaterThan(40);
    }
  });

  it('keeps the core procedural visualization set present', () => {
    const ids = new Set(MENTAL_REPS.map((r) => r.id));
    for (const id of [
      'rep-push-dose-pressor','rep-blood','rep-art-line','rep-efast','rep-chest-tube',
      'rep-central-line','rep-us-piv','rep-rsi','rep-post-intubation','rep-pac',
      'rep-crrt','rep-ecmo','rep-iabp','rep-sedation','rep-status',
      'rep-io','rep-vent-emergency','rep-evd','rep-mtp','rep-escharotomy','rep-finger-thoracostomy','rep-cricothyrotomy','rep-pericardiocentesis','rep-thoracentesis','rep-transvenous-pacing','rep-pocus-shock'
    ]) expect(ids.has(id), `Mental Rep missing: ${id}`).toBe(true);
  });

  it('requires reviewed durable audio before anything can be published', () => {
    for (const e of EPISODES.filter((x) => x.status === 'published')) {
      expect(e.voice?.reviewed).toBe(true);
      expect(e.voice?.src).toBeTruthy();
      expect(e.voice?.tier === 'premium-human' || e.voice?.tier === 'recorded-clinician').toBe(true);
    }
  });

  it('inline Mental Rep voice metadata never points at a stale transcript', () => {
    const normalize = (text: string) => text.replace(/\\s+/g, ' ').trim();
    for (const rep of MENTAL_REPS) {
      for (const beat of rep.beats) {
        if (!beat.voice) continue;
        expect(normalize(beat.voice.transcript), `${rep.id}/${beat.id} inline voice is stale`).toBe(normalize(beat.narration));
        expect(beat.voice.tier).toBe('premium-human');
      }
    }
  });

  it('Mental Reps include a debrief and an explicit training boundary', () => {
    for (const r of MENTAL_REPS) {
      expect(r.disclaimer.length).toBeGreaterThan(20);
      expect(r.beats.some((b) => b.phase === 'debrief')).toBe(true);
      expect(r.beats.length).toBeGreaterThanOrEqual(5);
    }
  });

  it('landmark-dependent Mental Reps explicitly rehearse anatomical orientation', () => {
    for (const id of ['rep-art-line','rep-efast','rep-chest-tube','rep-central-line','rep-io','rep-evd','rep-us-piv','rep-escharotomy','rep-finger-thoracostomy','rep-cricothyrotomy','rep-pericardiocentesis','rep-thoracentesis','rep-transvenous-pacing','rep-pocus-shock']) {
      const rep = MENTAL_REPS.find((x) => x.id === id)!;
      const orientation = rep.beats.filter((b) => b.phase === 'orientation');
      expect(orientation.length, `${id} needs an orientation beat`).toBeGreaterThan(0);
      expect(orientation.some((b) => b.narration.length > 180), `${id} orientation is too shallow`).toBe(true);
      expect(rep.beats.some((b) => /stop|re-orient|remap|identify|landmark|reference|anatom/i.test(b.narration)), `${id} needs explicit landmark logic`).toBe(true);
    }
  });

  it('core procedural Mental Reps keep literal hands-first choreography', () => {
    const required: Record<string, RegExp[]> = {
      'rep-blood': [/pick up the blood product/i, /blood-administration tubing/i, /in-line filter/i, /spike the verified unit/i, /stop flow immediately/i],
      'rep-art-line': [/flush bag/i, /stopcock/i, /select zero/i, /fast-flush/i],
      'rep-chest-tube': [/lay out the tube/i, /skin incision/i, /bluntly spread/i, /connect the tube immediately/i],
      'rep-central-line': [/nondominant hand/i, /needle tip/i, /before dilation/i, /guidewire/i],
      'rep-io': [/stabilize the leg/i, /black depth mark/i, /primed EZ-Connect extension set/i, /five to ten milliliters/i],
      'rep-us-piv': [/choose a catheter/i, /true tip/i, /thread the catheter/i, /connect the extension/i],
      'rep-rsi': [/suction in your dominant-hand reach/i, /cuff checked/i, /label every syringe/i, /final sweep/i],
      'rep-post-intubation': [/attach waveform capnography/i, /trace the tube and circuit/i, /predicted body weight/i, /analgesia and sedation/i],
      'rep-pocus-shock': [/below the xiphoid/i, /two rib shadows/i, /IVC/i, /pubic symphysis/i, /bladder/i],
      'rep-pac': [/pressure system/i, /right-atrial waveform/i, /abrupt change/i, /dicrotic notch/i, /deflate promptly/i],
      'rep-crrt': [/trace the blood path/i, /trace the non-blood fluids/i, /net patient-fluid-removal/i, /named pressure and its trend/i],
      'rep-ecmo': [/trace where blood is drained/i, /drainage limb/i, /pump speed and measured blood flow/i, /sweep-gas source/i, /return limb/i, /console in isolation/i],
      'rep-iabp': [/trigger source/i, /dicrotic notch/i, /assisted end-diastolic/i, /early inflation/i, /late deflation/i],
    };
    for (const [id, patterns] of Object.entries(required)) {
      const rep = MENTAL_REPS.find((x) => x.id === id)!;
      const script = rep.beats.map((b) => b.narration).join(' ');
      for (const pattern of patterns) expect(script, `${id} lost hands-first step ${pattern}`).toMatch(pattern);
    }
  });

  it('protocol-grade Mental Reps do not hide critical steps behind vague shorthand', () => {
    const banned = [
      /identify the correct site/i,
      /find the landmark/i,
      /use the standard approach/i,
      /obtain (?:pleural |vascular )?access/i,
      /prepare the system/i,
      /place (?:it|the line|the tube) in the usual/i,
      /confirm placement\.?$/i,
      /reassess the patient\.?$/i,
    ];
    for (const rep of MENTAL_REPS) {
      for (const beat of rep.beats) {
        for (const pattern of banned) {
          expect(beat.narration, `${rep.id}/${beat.id} hides a procedural step behind ${pattern}`).not.toMatch(pattern);
        }
      }
    }
  });


  it('protocol-grade Mental Reps preserve the physical procedure order', () => {
    const order: Record<string, string[]> = {
      'rep-push-dose-pressor': ['arrival','orient','equip','verify','give','comp','debrief'],
      'rep-blood': ['arrival','verify','setup','start','reaction','debrief'],
      'rep-art-line': ['arrival','anatomy','system','puncture','level','wave','square','debrief'],
      'rep-efast': ['arrival','orientation','ruq','luq','pelvis','cardiac','lung','repeat'],
      'rep-chest-tube': ['arrival','anatomy','setup','sequence','connect','failure','debrief'],
      'rep-central-line': ['arrival','scan','setup','tip','confirm','wire','dilate','catheter','comp','debrief'],
      'rep-io': ['arrival','landmark','place','confirm','comp','debrief'],
      'rep-vent-emergency': ['alarm','oxygen','trace','pressure','hemo','debrief'],
      'rep-evd': ['before','level','clamp','move','verify','debrief'],
      'rep-mtp': ['activate','roles','source','phys','response','debrief'],
      'rep-us-piv': ['scan','setup','tip','thread','confirm','debrief'],
      'rep-rsi': ['why','phys','oxygen','room','meds','commit','debrief'],
      'rep-post-intubation': ['confirm','pressure','vent','sed','recheck','debrief'],
      'rep-pac': ['zero','ra','rv','pa','wedge','integrate','debrief'],
      'rep-crrt': ['purpose','blood','transport','effluent','alarm','drugs','debrief'],
      'rep-ecmo': ['type','drain','pump','lung','return','mismatch','debrief'],
      'rep-iabp': ['why','inflate','deflate','early','late','debrief'],
      'rep-sedation': ['pain','goal','hemo','paralysis','reassess','debrief'],
      'rep-status': ['clock','support','first','second','airway','silent','debrief'],
      'rep-escharotomy': ['recognize','map','setup','release','reassess','chest','failure','aftercare','debrief'],
      'rep-finger-thoracostomy': ['recognize','landmark','setup','incision','dissect','enter','sweep','dress','reassess','debrief'],
      'rep-cricothyrotomy': ['recognize','landmark','setup','skin','membrane','open','tube','confirm','secure','debrief'],
      'rep-pericardiocentesis': ['recognize','map','setup','needle','fluid','wire','catheter','drain','recheck','failure','debrief'],
      'rep-thoracentesis': ['indication','position','map','rib','setup','anesthetize','access','sample','drain','finish','recheck','debrief'],
      'rep-transvenous-pacing': ['indication','equipment','access','connect','sheath','advance','capture','position','threshold','sense','secure','recheck','debrief'],
      'rep-pocus-shock': ['question','heart','lung','venous','abdomen','integrate','debrief'],
    };
    expect(Object.keys(order).sort()).toEqual(MENTAL_REPS.map((x) => x.id).sort());
    for (const [id, expected] of Object.entries(order)) {
      const rep = MENTAL_REPS.find((x) => x.id === id)!;
      expect(rep.beats.map((b) => b.id), `${id} procedure order changed`).toEqual(expected);
    }
  });

  it('protocol-grade Mental Reps retain their physical anchors, routes and proof steps', () => {
    const required: Record<string, RegExp[]> = {
      'rep-push-dose-pressor': [/read the label/i, /expel one milliliter/i, /nine milliliters/i, /one hundred micrograms/i, /label it/i],
      'rep-blood': [/in-line filter/i, /close the clamps/i, /visible air (?:is )?clear|clear(?:ed)? visible air/i, /patient identifiers/i, /stop flow immediately/i],
      'rep-art-line': [/radial styloid/i, /flexor carpi radialis/i, /thirty- to forty-five-degree angle/i, /true needle tip/i, /catheter-over-wire/i, /angiocatheter/i, /about two millimeters/i, /about ten minutes/i, /fourth intercostal space/i, /mid-axillary line/i, /open to atmosphere/i, /aortic-valve closure/i],
      'rep-efast': [/mid-axillary line/i, /hepatorenal recess/i, /posterior axillary line/i, /pubic bone/i, /xiphoid process/i, /two rib shadows/i],
      'rep-chest-tube': [/sternal angle/i, /second rib/i, /fourth intercostal space/i, /fifth intercostal space/i, /fifth rib for a fourth-space/i, /sixth rib for a fifth-space/i, /pectoralis major/i, /latissimus dorsi/i, /one-and-a-half- to two-centimeter/i, /gloved finger/i, /side hole/i],
      'rep-central-line': [/clavicle/i, /sternocleidomastoid/i, /carotid/i, /compressible/i, /maximal sterile barrier/i, /sterile probe cover/i, /pre-flush each catheter lumen/i, /forty-five-degree angle/i, /probe midpoint/i, /true needle tip/i, /J-tipped guidewire/i, /ten to fifteen centimeters/i, /dilator/i, /leave it in place/i, /vascular\/surgical consultation/i, /wire completely/i],
      'rep-io': [/patella/i, /tibial tuberosity/i, /two centimeters medial/i, /five millimeters/i, /ninety degrees/i, /one to two centimeters/i, /medullary space/i, /five to ten milliliters/i, /distal foot/i, /compartment compromise/i],
      'rep-vent-emergency': [/disconnect the ventilator/i, /manual resuscitation bag/i, /suction catheter/i, /peak inspiratory pressure/i, /plateau pressure/i, /expiratory flow/i],
      'rep-evd': [/tragus/i, /cartilaginous projection/i, /ear canal/i, /patient-to-drain/i, /horizontal/i, /re-level/i],
      'rep-mtp': [/cooler/i, /rapid infuser/i, /warmer/i, /unit label/i, /live tally/i, /source-control/i],
      'rep-us-piv': [/short and long axis/i, /compressibility/i, /true tip/i, /anterior vein wall/i, /thread the catheter/i, /soft-tissue expansion/i],
      'rep-rsi': [/external auditory meatus/i, /sternal notch/i, /suction/i, /laryngoscope/i, /cuff checked/i, /label every syringe/i, /final sweep/i, /compensatory minute ventilation/i],
      'rep-post-intubation': [/waveform capnography/i, /tube depth/i, /predicted body weight/i, /expiratory flow/i, /analgesia and sedation/i],
      'rep-pac': [/fourth intercostal space/i, /mid-axillary line/i, /a wave after the P wave/i, /right ventricle/i, /pulmonic-valve closure/i, /static column of blood/i, /end expiration/i, /deflate promptly/i],
      'rep-crrt': [/access limb/i, /blood pump/i, /filter/i, /return limb/i, /dialysate/i, /replacement solution/i, /effluent/i, /transmembrane pressure/i, /net patient-fluid-removal target/i, /therapy has actually been interrupted/i],
      'rep-ecmo': [/drainage limb/i, /pump speed/i, /measured blood flow/i, /sweep-gas/i, /membrane lung/i, /return limb/i, /recirculation/i],
      'rep-iabp': [/trigger source/i, /unassisted beat/i, /dicrotic notch/i, /inflation marker/i, /assisted end-diastolic/i, /late deflation/i],
      'rep-sedation': [/drug name and concentration/i, /pump channel/i, /trace the infusion/i, /sedation target/i, /not occluded or empty/i],
      'rep-status': [/active seizure protocol/i, /route you actually have/i, /read the .* concentration/i, /exact volume/i, /completion time/i, /next-line row/i],
      'rep-escharotomy': [/deep partial-thickness or full-thickness/i, /one centimeter beyond/i, /mid-lateral and mid-medial/i, /ulnar nerve/i, /medial epicondyle/i, /peroneal nerve/i, /posterior tibial/i, /subcutaneous fat/i, /do not deliberately enter the deep fascia/i, /anterior axillary lines/i, /costal margin/i, /Doppler/i, /gloved finger/i],
      'rep-finger-thoracostomy': [/mid-axillary line/i, /fourth or fifth intercostal space/i, /sternal angle/i, /second rib/i, /superior border/i, /two to three centimeters/i, /closed curved hemostat/i, /finger positioned close to the clamp tip/i, /pleural space/i, /gloved finger/i, /vented chest seal/i, /peak pressure/i],
      'rep-cricothyrotomy': [/thyroid cartilage/i, /cricothyroid membrane/i, /cricoid cartilage/i, /three to four finger widths/i, /vertical skin incision/i, /horizontal.*membrane/i, /direct it caudally/i, /cuff.*just inside/i, /waveform capnography/i, /bilateral chest rise/i, /secure/i],
      'rep-pericardiocentesis': [/pericardial effusion/i, /right-atrial or right-ventricular diastolic collapse/i, /subxiphoid, apical or parasternal/i, /skin-to-fluid depth/i, /internal thoracic vessel/i, /sterile sheath/i, /true needle tip/i, /agitated saline/i, /guidewire/i, /pigtail/i, /pericardial decompression syndrome/i, /operative or surgical drainage/i],
      'rep-thoracentesis': [/sit them upright/i, /forearms supported/i, /two rib shadows/i, /diaphragm/i, /liver/i, /spleen/i, /skin-to-fluid depth/i, /superior border of the rib below/i, /parietal pleura/i, /three-way stopcock/i, /thread the flexible catheter/i, /sample first/i, /re-expansion pulmonary edema/i, /mechanically ventilated/i],
      'rep-transvenous-pacing': [/transcutaneous pacing pads/i, /pulse generator/i, /bipolar pacing catheter/i, /balloon port/i, /right-internal-jugular/i, /introducer sheath/i, /balloon remains completely deflated/i, /twenty-centimeter/i, /left-bundle-branch-block pattern/i, /electrical capture/i, /mechanical capture/i, /capture threshold/i, /two to three times threshold/i, /demand pacing/i, /strain relief/i],
      'rep-pocus-shock': [/xiphoid/i, /inferior tip of the sternum/i, /left edge of the sternum/i, /point of maximal impulse/i, /two rib shadows/i, /pubic symphysis/i, /vertebral body/i, /aorta/i, /put the probe down/i, /make one prediction/i],
    };
    expect(Object.keys(required).sort(), 'every Mental Rep must have a protocol-grade anchor checklist').toEqual(MENTAL_REPS.map((x) => x.id).sort());
    for (const [id, patterns] of Object.entries(required)) {
      const rep = MENTAL_REPS.find((x) => x.id === id)!;
      const script = rep.beats.map((b) => b.narration).join(' ');
      for (const pattern of patterns) {
        expect(script, `${id} lost protocol-grade anchor ${pattern}`).toMatch(pattern);
      }
    }
  });
});
