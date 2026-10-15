import type { DiseaseState } from './types';
export interface MechanismChapter {
  title: string; say: string; state: Partial<DiseaseState>;
  focus?: 'patient' | 'heart' | 'airway';
  checkpoint?: { prompt: string; answer: string };
}
export interface Explainer { outcome: string; chapters: MechanismChapter[]; sources: {title:string;url:string}[] }
const c = (title:string, say:string, state:Partial<DiseaseState>, focus?:MechanismChapter['focus'], checkpoint?:MechanismChapter['checkpoint']):MechanismChapter => ({title,say,state,focus,checkpoint});
/** Qualitative comparisons only: channel values are visual intensities, never predicted patient measurements. */
export const EXPLAINERS: Record<string, Explainer> = {
  'pulmonary-embolism': {
    outcome: 'Connect pulmonary obstruction to dead space, RV strain and reduced systemic flow.',
    sources: [{title:'AHA / ACC · Acute pulmonary embolism guideline (2026)',url:'https://professional.heart.org/en/science-news/2026-guideline-for-the-evaluation-and-management-of-acute-pulmonary-embolism-in-adults'}],
    chapters: [
      c('Baseline · two pumps in series','Follow the route from right heart through lungs to left heart. Compare this baseline with obstruction.',{},'patient'),
      c('Clot · pulmonary arterial obstruction','A clot narrows the pulmonary arterial pathway. Its location and burden vary between patients.',{obstruction:.75}),
      c('Dead space · air without enough blood','Ventilation can persist while regional perfusion falls: this is a dead-space mechanism, distinct from shunt.',{obstruction:.75,flowLoss:.65}),
      c('RV afterload · pressure rises','The right ventricle faces greater resistance and may dilate or fail in severe pulmonary embolism.',{obstruction:.75,flowLoss:.65,pressure:.7,pumpLoss:.3},'heart'),
      c('Downstream · less LV filling','Severe RV dysfunction reduces blood reaching the left heart and can compromise systemic perfusion.',{obstruction:.75,flowLoss:.85,pressure:.8,pumpLoss:.65},'heart',{prompt:'Why can blood pressure fall when the clot is in the lungs?',answer:'The ventricles work in series. Failing RV output reduces LV filling and systemic output.'}),
      c('Reassess · the obstruction persists','Supporting oxygenation alone does not remove the obstruction. Management depends on clinical severity and bleeding risk.',{obstruction:.75,flowLoss:.65,pressure:.65,pumpLoss:.4},'patient'),
    ],
  },
  'pulmonary-edema': {
    outcome:'Distinguish hydrostatic flooding from permeability injury and follow the cardiac cause.',
    sources:[{title:'NHLBI · Heart failure',url:'https://www.nhlbi.nih.gov/health/heart-failure'}],
    chapters:[
      c('Baseline · dry air spaces','Locate the left heart and pulmonary circulation before following fluid into the lungs.',{},'patient'),
      c('Upstream · pulmonary venous pressure','Elevated left-sided filling pressure raises hydrostatic pressure in pulmonary capillaries.',{pressure:.8},'heart'),
      c('Interstitial fluid · then flooding','Fluid accumulates outside capillaries and may enter alveoli as hydrostatic forces overwhelm clearance.',{pressure:.8,fluid:.7}),
      c('Shunt · perfusion continues','Flooded units receive blood but ventilate poorly. Oxygenation deteriorates as shunt increases.',{pressure:.8,fluid:.85,shunt:.7}),
      c('Support · aeration can improve','Positive pressure may improve aeration in an appropriate patient while the cardiac cause and excess fluid persist.',{pressure:.8,fluid:.85,shunt:.4},undefined,{prompt:'Does better oxygenation prove the fluid has cleared?',answer:'No. Improved aeration can improve gas exchange before the hydrostatic cause or accumulated fluid resolves.'}),
      c('Recovery · address the cause','This illustrative later state follows lower filling pressure and fluid clearance; the response and time course vary.',{pressure:.3,fluid:.45,shunt:.3},'patient'),
    ],
  },
  ards: {
    outcome:'Separate barrier injury, flooding, collapse and shunt from the response to ventilatory support.',
    sources:[{title:'ATS · ARDS management guideline update (2024)',url:'https://pmc.ncbi.nlm.nih.gov/articles/PMC10870893/'}],
    chapters:[
      c('Baseline · an intact barrier','Compare aerated lungs with the subsequent permeability injury. The visual sequence is illustrative.',{},'patient'),
      c('Injury · barrier inflammation','Inflammatory injury disrupts the alveolar-capillary barrier. Fluid crosses more readily.',{inflammation:.8}),
      c('Leak · permeability edema','Protein-rich fluid enters air spaces. This differs from isolated hydrostatic pulmonary edema.',{inflammation:.8,fluid:.75}),
      c('Instability · aerated lung shrinks','Flooding and surfactant dysfunction promote unstable units and collapse, leaving less lung available for ventilation.',{inflammation:.8,fluid:.75,collapse:.7}),
      c('Shunt · blood bypasses ventilation','Perfusion through poorly aerated units contributes to hypoxemia.',{inflammation:.8,fluid:.75,collapse:.7,shunt:.8}),
      c('PEEP · an illustrative response','Some recruitable units reopen with appropriate PEEP. Barrier injury and edema remain in this comparison.',{inflammation:.8,fluid:.75,collapse:.4,shunt:.5},undefined,{prompt:'Which changes first here: aeration or barrier healing?',answer:'Aeration improves first in this example. PEEP does not instantly repair the barrier or clear edema.'}),
      c('Tradeoff · overdistension and circulation','Excess pressure can overdistend aerated regions and impair circulation. Reassess mechanics, oxygenation and hemodynamics.',{inflammation:.8,fluid:.75,collapse:.4,shunt:.5,overdistension:.65,flowLoss:.4}),
      c('Reassess · individualized protection','Protective ventilation balances recruitment against injury. These fractions do not prescribe a PEEP setting or predict recovery.',{inflammation:.8,fluid:.75,collapse:.4,shunt:.5,overdistension:.2,flowLoss:.15},'patient'),
    ],
  },
  'septic-shock': {
    outcome:'Follow vascular tone, capillary leak and organ perfusion as separate processes.',
    sources:[{title:'SCCM · Surviving Sepsis Campaign adult guidelines (2026)',url:'https://www.sccm.org/clinical-resources/guidelines/guidelines/surviving-sepsis-campaign-international-guidelines-for-management-of-sepsis-and-septic-shock-2026'}],
    chapters:[
      c('Baseline · circulating volume and tone','Locate the circulation and organs that depend on sustained perfusion.',{},'patient'),
      c('Inflammation · loss of vascular tone','The host response to infection can cause vasodilation and disturb blood-flow distribution.',{inflammation:.8}),
      c('Leak · effective volume falls','Capillary leak and venous pooling can reduce effective circulating volume even when total body fluid increases.',{inflammation:.8,volumeLoss:.55,edema:.5}),
      c('Perfusion · organs at risk','Impaired perfusion threatens organ function. Blood pressure alone does not describe all microcirculatory changes.',{inflammation:.8,volumeLoss:.55,edema:.5,flowLoss:.8},'patient'),
      c('Resuscitation · reassess the response','Fluid and vasopressor support can improve circulation, but response varies and fluid accumulation can cause harm.',{inflammation:.8,volumeLoss:.25,edema:.5,flowLoss:.45},undefined,{prompt:'Does an improved pressure mean the infection is controlled?',answer:'No. Hemodynamic support does not replace prompt antimicrobials, source control and reassessment.'}),
      c('Ongoing care · the cause remains','Follow perfusion and fluid tolerance while treating the infection. This comparison leaves inflammatory injury visible.',{inflammation:.8,volumeLoss:.25,edema:.5,flowLoss:.45},'patient'),
    ],
  },
  tamponade: {
    outcome:'Explain why pericardial pressure restricts filling and reduces output.',
    sources:[{title:'ESC · Cardiac tamponade: a clinical challenge',url:'https://www.escardio.org/communities/councils/cardiology-practice/scientific-documents-and-publications/ejournal/volume-15/Cardiac-tamponade-a-clinical-challenge/'}],
    chapters:[
      c('Baseline · room to fill','Locate the pericardial sac surrounding the heart.',{},'patient'),
      c('Effusion · fluid accumulates','Pericardial fluid accumulates. The rate of accumulation and pericardial compliance affect tolerance.',{fluid:.45}),
      c('Pressure · a constrained space','Rising pericardial pressure impedes cardiac filling; effusion volume alone does not establish tamponade.',{fluid:.75,pressure:.8}),
      c('Filling · chambers constrained','Low-pressure chambers are vulnerable. Reduced diastolic filling limits the volume available for ejection.',{fluid:.75,pressure:.8,flowLoss:.6},'heart'),
      c('Output · obstructive shock','Severe filling restriction reduces cardiac output even without primary loss of myocardial contractility.',{fluid:.75,pressure:.9,flowLoss:.85},'heart',{prompt:'Is the initiating problem a weak pump or impaired filling?',answer:'Impaired filling from external pressure. This is obstructive physiology, although other problems can coexist.'}),
      c('Decompression · illustrative response','Relieving pericardial pressure can restore filling. This simplified comparison does not simulate the drainage procedure.',{fluid:.25,pressure:.2,flowLoss:.25},'patient'),
    ],
  },
  anaphylaxis: {
    outcome:'Recognize simultaneous airway, breathing and circulatory mechanisms.',
    sources:[{title:'Resuscitation Council UK · Emergency treatment of anaphylaxis',url:'https://www.resus.org.uk/library/additional-guidance/guidance-anaphylaxis/emergency-treatment-anaphylactic-reactions'}],
    chapters:[
      c('Baseline · several systems at risk','Anaphylaxis can rapidly affect airway, breathing and circulation; the order and combination vary.',{},'patient'),
      c('Mediators · vascular leak and dilation','Mediator release can dilate vessels and increase permeability, reducing effective circulating volume.',{inflammation:.8,edema:.4,volumeLoss:.5}),
      c('Airway · edema narrows the lumen','Upper-airway edema can threaten airflow. Skin findings may be absent.',{inflammation:.8,edema:.75,volumeLoss:.5,obstruction:.65},'airway'),
      c('Breathing · bronchoconstriction','Lower-airway narrowing adds resistance and may coexist with upper-airway obstruction.',{inflammation:.8,edema:.75,volumeLoss:.5,obstruction:.8},'airway'),
      c('Circulation · distributive shock','Vasodilation and leak reduce venous return and organ perfusion.',{inflammation:.8,edema:.75,volumeLoss:.7,obstruction:.8,flowLoss:.75},'patient',{prompt:'Will an antihistamine reverse life-threatening airway or circulatory compromise?',answer:'No. Intramuscular adrenaline is first-line treatment; urgent support and reassessment are required.'}),
      c('Response · reassess all systems','After first-line treatment, reassess airway, breathing and circulation. Improvement may be incomplete and symptoms can recur.',{inflammation:.6,edema:.5,volumeLoss:.4,obstruction:.35,flowLoss:.35},'patient'),
    ],
  },
  'auto-peep': {
    outcome:'Connect incomplete exhalation to trapped gas, trigger load and reduced venous return.',
    sources:[{title:'NHLBI · Asthma',url:'https://www.nhlbi.nih.gov/health/asthma'},{title:'NHLBI · COPD',url:'https://www.nhlbi.nih.gov/health/copd'}],
    chapters:[
      c('Baseline · time to empty','Compare complete exhalation with the next breath arriving before the lungs finish emptying.',{},'patient'),
      c('Resistance · slower emptying','Airway narrowing increases expiratory resistance. Asthma and COPD can produce this mechanism.',{obstruction:.7},'airway'),
      c('Breath stacking · gas remains','When exhalation time is insufficient, successive breaths increase end-expiratory volume.',{obstruction:.7,overdistension:.65}),
      c('Intrinsic PEEP · pressure persists','Trapped gas leaves alveolar pressure above applied PEEP at end expiration.',{obstruction:.7,overdistension:.8,pressure:.8}),
      c('Trigger load · effort before flow','The patient may need to overcome trapped pressure before triggering an assisted breath.',{obstruction:.7,overdistension:.8,pressure:.8},undefined,{prompt:'Does the set PEEP display capture all end-expiratory pressure?',answer:'No. Intrinsic PEEP adds trapped pressure. Measurement depends on patient effort and the assessment method.'}),
      c('Circulation · hyperinflation has a cost','High intrathoracic pressure can impede venous return and contribute to hemodynamic compromise.',{obstruction:.7,overdistension:.8,pressure:.8,flowLoss:.6},'heart'),
      c('More time · an illustrative response','Longer exhalation can reduce trapping while airway resistance remains. Reassess waveforms, pressures and circulation.',{obstruction:.7,overdistension:.35,pressure:.3,flowLoss:.25}),
    ],
  },
};
