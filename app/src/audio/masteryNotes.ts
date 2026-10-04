export interface MasteryNote {
  mechanism: string;
  bedside: string;
  traps: string[];
  integration: string;
}

/**
 * Canonical expert teaching notes used to deepen deterministic audio scripts.
 * These are content-source notes, not bedside protocols. They intentionally emphasize
 * mechanism, interpretation, uncertainty and cross-system effects over memorized recipes.
 */
export const MASTERY_NOTES: Record<string, MasteryNote> = {
  'preload': {
    mechanism:'Preload is the myocardial fiber-loading condition before contraction. It is influenced by venous return, ventricular compliance, pericardial pressure and intrathoracic pressure, so a measured filling pressure is only an imperfect surrogate.',
    bedside:'Interpret filling pressure together with volume response, congestion, ventricular geometry and the pressure surrounding the heart. A CVP of 14 can mean very different things in RV failure, tamponade and positive-pressure ventilation.',
    traps:['Equating CVP with circulating volume.','Assuming fluid responsiveness means fluid is indicated or tolerated.'],
    integration:'Ask what changed the effective distending pressure of the ventricle, not merely what changed the monitor number.'
  },
  'venous-return': {
    mechanism:'Venous return depends on the pressure gradient from the systemic venous reservoir toward the right atrium and on resistance to that flow. Mean systemic filling pressure and right-atrial pressure can move independently.',
    bedside:'A rise in right-atrial pressure can reduce venous return even when the patient appears more “full.” Venoconstriction can recruit unstressed volume and change the upstream pressure without adding external fluid.',
    traps:['Treating a high CVP as proof of adequate forward flow.','Ignoring abdominal, thoracic or pericardial pressure as downstream resistance.'],
    integration:'Predict how fluid, venoconstriction, PEEP and RV failure each alter the venous-return gradient.'
  },
  'stressed-volume': {
    mechanism:'Only part of the vascular blood volume generates recoil pressure that drives venous return. Venous tone can convert unstressed volume into stressed volume and raise mean systemic filling pressure.',
    bedside:'A vasoactive drug can sometimes improve venous return partly by changing venous capacitance, not only by raising arterial pressure.',
    traps:['Thinking venous tone is clinically irrelevant.','Assuming every preload increase requires a fluid bolus.'],
    integration:'Separate total blood volume from the fraction that is actively generating circulatory pressure.'
  },
  'fluid-responsiveness': {
    mechanism:'Fluid responsiveness asks whether stroke volume rises with increased preload. It does not answer whether the patient needs fluid, whether fluid is safe, or whether another intervention would better address the problem.',
    bedside:'Use dynamic tests when their assumptions are valid and interpret the change in flow, not merely pressure. Then ask whether the patient can tolerate the added volume.',
    traps:['Using static filling pressure as a responsiveness test.','Treating a positive test as an automatic fluid order.'],
    integration:'Pair responsiveness with fluid tolerance and a clear therapeutic endpoint.'
  },
  'rv-failure': {
    mechanism:'The RV is thin-walled and highly sensitive to acute afterload. When it dilates, wall stress rises, coronary perfusion can fall and septal shift can reduce LV filling.',
    bedside:'Track systemic pressure, venous congestion, echo geometry, oxygenation, CO2, acid-base status and ventilator pressures together. Small changes in PVR or intrathoracic pressure can have large hemodynamic consequences.',
    traps:['Reflexively giving fluid to every hypotensive RV patient.','Focusing on systemic pressure while ignoring worsening RV dilation and congestion.'],
    integration:'Every intervention should be judged by its effects on RV preload, RV afterload, contractility and coronary perfusion.'
  },
  'pvr': {
    mechanism:'Pulmonary vascular resistance reflects the combined behavior of alveolar and extra-alveolar vessels and is affected by lung volume, oxygen, CO2, pH and pulmonary vascular disease.',
    bedside:'Both severe derecruitment and overdistension can raise RV afterload. Hypoxemia, hypercapnia and acidosis can compound the problem.',
    traps:['Assuming more PEEP always lowers PVR by recruiting lung.','Ignoring gas chemistry as an RV afterload intervention.'],
    integration:'Interpret ventilator changes through both lung mechanics and the pulmonary circulation.'
  },
  'ventricular-interdependence': {
    mechanism:'The ventricles share a septum and a constrained pericardial space. Acute RV pressure or volume loading can shift the septum and reduce LV diastolic filling.',
    bedside:'A falling LV stroke volume in RV failure may occur despite apparently adequate intravascular volume because geometry, not supply, is limiting filling.',
    traps:['Treating LV output and RV function as separate systems.','Calling septal flattening a descriptive echo finding without hemodynamic meaning.'],
    integration:'When one ventricle enlarges or its pressure rises, ask what that does to the other ventricle’s filling conditions.'
  },
  'ppv-hemodynamics': {
    mechanism:'Positive intrathoracic pressure can reduce the gradient for venous return, change transmural ventricular pressures and alter PVR depending on lung volume and recruitability.',
    bedside:'Post-intubation hypotension may reflect vasodilation, reduced venous return, increased RV afterload, auto-PEEP or previously compensated shock becoming unmasked.',
    traps:['Attributing every post-intubation pressure drop to induction medication.','Assuming positive pressure has a single predictable effect on both ventricles.'],
    integration:'Think preload, RV afterload and LV transmural afterload separately.'
  },
  'peep': {
    mechanism:'PEEP can prevent end-expiratory collapse and recruit unstable lung units, but can also overdistend already-open units and transmit pressure to the thorax.',
    bedside:'Judge a PEEP change by oxygenation, compliance, driving pressure, hemodynamics and the disease’s recruitability rather than by oxygen saturation alone.',
    traps:['Chasing oxygenation while ignoring falling cardiac output.','Assuming higher PEEP is either universally protective or universally harmful.'],
    integration:'The useful PEEP is the one that improves the whole patient, not just the alveolar oxygen number.'
  },
  'driving-pressure': {
    mechanism:'Driving pressure is plateau pressure minus total PEEP and reflects tidal pressure applied to the respiratory system relative to available compliance.',
    bedside:'A fixed tidal volume can impose very different stress depending on how much functional lung is available. Trend driving pressure alongside plateau pressure and mechanics.',
    traps:['Calculating from peak rather than plateau pressure.','Treating a threshold as a substitute for understanding lung size and mechanics.'],
    integration:'Connect driving pressure to compliance, tidal volume, recruitability and mechanical power.'
  },
  'compliance': {
    mechanism:'Compliance is change in volume divided by change in pressure; elastance is its inverse. Respiratory-system compliance includes both lung and chest-wall contributions.',
    bedside:'Use peak and plateau pressures to separate resistive from elastic loading, then ask whether chest wall, abdomen or lung is responsible.',
    traps:['Calling every high airway pressure “stiff lungs.”','Ignoring chest-wall and abdominal mechanics.'],
    integration:'A ventilator pressure only becomes physiologic information when flow state and pressure component are known.'
  },
  'ards': {
    mechanism:'ARDS produces heterogeneous inflammatory lung injury, shunt, edema and a reduced aerated “baby lung,” making regional overdistension possible even at seemingly modest tidal volumes.',
    bedside:'Integrate gas exchange, compliance, recruitability, prone response, driving pressure and hemodynamics rather than treating the P/F ratio alone.',
    traps:['Equating severe hypoxemia with universal recruitability.','Improving oxygenation at the cost of excessive distending pressure or RV load.'],
    integration:'ARDS management is a tradeoff between oxygenation, mechanical injury and circulation.'
  },
  'mechanical-power': {
    mechanism:'Mechanical power expresses the energy transferred from the ventilator to the respiratory system per unit time. Pressure, tidal volume, flow and respiratory rate all contribute.',
    bedside:'A patient may have an acceptable tidal volume and plateau pressure yet receive a high cumulative energy load because of rate, flow or excessive pressure swings.',
    traps:['Treating mechanical power as one magic cutoff.','Ignoring spontaneous respiratory effort as another source of lung stress.'],
    integration:'Think about injury as repeated energy delivery to vulnerable lung tissue.'
  },
  'dead-space': {
    mechanism:'Dead-space ventilation reaches regions that do not effectively eliminate CO2 because perfusion is absent or inadequate, or because gas remains in conducting airways.',
    bedside:'Rising minute-ventilation requirement, widening PaCO2–EtCO2 gap or unexpectedly low EtCO2 can signal increasing dead space when ventilation is otherwise unchanged.',
    traps:['Equating all hypercapnia with low minute ventilation.','Using EtCO2 as a fixed conversion to PaCO2 in shock.'],
    integration:'CO2 is a ventilation-perfusion signal as well as a ventilation signal.'
  },
  'oxygen-delivery': {
    mechanism:'Oxygen delivery equals cardiac output multiplied by arterial oxygen content, which is dominated by hemoglobin-bound oxygen rather than dissolved oxygen.',
    bedside:'Normal saturation can coexist with critically low delivery in severe anemia or low-flow shock. Ask about hemoglobin and flow whenever tissue perfusion looks worse than the pulse oximeter.',
    traps:['Using SpO2 as a proxy for whole-body oxygen delivery.','Forgetting that raising saturation from already-high levels adds little content.'],
    integration:'Saturation tells you how full the carriers are; hemoglobin tells you how many carriers exist; cardiac output tells you how fast they move.'
  },
  'oxygen-extraction': {
    mechanism:'Tissues can increase extraction when delivery falls, lowering venous oxygen saturation until extraction reserve is exhausted. High venous saturation can also be abnormal when extraction is impaired or flow is maldistributed.',
    bedside:'Interpret SvO2 or ScvO2 alongside cardiac output, hemoglobin, arterial saturation, metabolic demand and shock phenotype.',
    traps:['Calling a high venous saturation reassuring in every patient.','Treating low venous saturation as a diagnosis instead of a physiologic clue.'],
    integration:'Use venous saturation to ask whether delivery and demand are appropriately matched.'
  },
  'shock': {
    mechanism:'Shock is inadequate effective tissue perfusion and oxygen utilization, not merely hypotension. Flow, vascular tone, capacitance, congestion and extraction can fail in different combinations.',
    bedside:'Phenotype the circulation repeatedly. A patient can move from one dominant mechanism to another during resuscitation.',
    traps:['Naming shock once and never revisiting the model.','Treating MAP as the only endpoint.'],
    integration:'Choose interventions that both treat the suspected mechanism and generate information about whether the model was correct.'
  },
  'lactate': {
    mechanism:'Lactate rises from multiple pathways including adrenergic glycolysis, impaired clearance and cellular metabolic changes; it is not a direct meter of tissue hypoxia.',
    bedside:'Trend lactate with perfusion, liver function, catecholamine exposure and clinical trajectory. A falling value can be reassuring but should not override a deteriorating patient.',
    traps:['Assuming every elevated lactate mandates more fluid.','Equating “clearance” with literal removal of all pathology.'],
    integration:'Use lactate as one dynamic metabolic signal inside the larger perfusion model.'
  },
  'acid-base': {
    mechanism:'pH reflects interacting respiratory and metabolic processes. Compensation has expected patterns, so deviations can expose mixed disorders that a single pH label hides.',
    bedside:'Calculate the anion gap, correct for relevant confounders, compare compensation and consider chloride, albumin and lactate in context.',
    traps:['Calling a normal pH normal acid-base physiology.','Treating bicarbonate concentration as if it identifies the mechanism by itself.'],
    integration:'Acid-base analysis should lead back to the disease process causing the disturbance.'
  },
  'strong-ion': {
    mechanism:'The physicochemical framework explains acid-base state through PCO2, strong-ion difference and total weak acids. Chloride-rich states lower SID and can create metabolic acidosis.',
    bedside:'Use the model to understand hyperchloremia and hypoalbuminemia while still translating findings into familiar bicarbonate and anion-gap language.',
    traps:['Treating Stewart and traditional approaches as mutually exclusive.','Using a complex framework when a simpler analysis already explains the patient.'],
    integration:'Different frameworks should converge on the same physiology, not compete for identity.'
  },
  'icp-cpp': {
    mechanism:'CPP is the pressure gradient available to drive cerebral blood flow and is influenced by arterial pressure, ICP, venous pressure and autoregulation. Intracranial compliance falls as compensatory reserve is exhausted.',
    bedside:'Interpret ICP as a dynamic system with waveform, position, venous drainage, CO2 and sedation effects. A “normal” MAP does not guarantee adequate cerebral perfusion.',
    traps:['Treating ICP and CPP as isolated targets.','Ignoring neck position, intrathoracic pressure and venous outflow.'],
    integration:'Protect the brain by preserving oxygenation and perfusion while minimizing factors that increase intracranial volume or venous pressure.'
  },
  'evd': {
    mechanism:'An external ventricular drain uses a hydrostatic height reference to define the pressure at which CSF drains while also allowing ICP monitoring depending on system configuration.',
    bedside:'Level to the ordered reference point, manage clamping during movement according to policy, and re-level after position changes before interpreting pressure or drainage.',
    traps:['Moving the bed without reconsidering the drainage height.','Treating drainage amount independently of chamber position and patient physiology.'],
    integration:'The drain is both a therapeutic pathway and a measurement system; position can change both.'
  },
  'arterial-line': {
    mechanism:'An arterial catheter transmits pressure through a fluid-filled system to a transducer. Accuracy depends on leveling, zeroing and the dynamic response of the tubing-transducer system.',
    bedside:'Read the waveform before trusting systolic and diastolic values. Mean pressure is often less distorted by damping than pulse extremes.',
    traps:['Treating a monitor number as direct truth.','Ignoring hydrostatic error from transducer height.'],
    integration:'The patient, catheter, tubing, transducer and monitor form one measurement system.'
  },
  'waveform-damping': {
    mechanism:'Overdamping blunts high-frequency components and narrows pulse pressure; underdamping/resonance exaggerates oscillations and can overstate systolic pressure.',
    bedside:'Use a fast-flush or dynamic-response assessment and inspect for air, clot, tubing compliance, extra stopcocks and catheter position.',
    traps:['Changing vasoactive therapy before checking waveform quality.','Assuming all waveform distortion comes from the catheter tip.'],
    integration:'Validate the measurement system before treating the measurement.'
  },
  'efast': {
    mechanism:'eFAST uses focused ultrasound windows to look for pericardial, intraperitoneal and pleural pathology. Sensitivity depends on volume, timing, operator technique and where pathology is located.',
    bedside:'Use a repeatable sweep rather than one frozen image and repeat the exam when physiology changes.',
    traps:['Calling one negative scan a permanent rule-out.','Interpreting an image without proving orientation and anatomy first.'],
    integration:'eFAST is a time-stamped piece of evidence inside trauma physiology, not a substitute for the rest of the evaluation.'
  },
  'transfusion': {
    mechanism:'Transfusion changes oxygen-carrying capacity, hemostatic components and intravascular volume while introducing risks including reactions, electrolyte changes and volume complications.',
    bedside:'Match product to the clinical problem, verify identity meticulously and reassess the patient during the early phase when reactions can emerge.',
    traps:['Treating every anemia value as an automatic transfusion trigger.','Focusing on pump settings while missing a transfusion reaction.'],
    integration:'A blood product is a physiologic therapy with an intended endpoint, not just a bag to finish.'
  },
  'push-dose-pressor': {
    mechanism:'A push-dose vasopressor is a short-duration vasoactive bridge whose effect depends on concentration, receptor profile, circulation time and underlying shock physiology.',
    bedside:'Use standardized local concentrations, explicit labeling, independent verification and immediate reassessment while definitive support is being prepared.',
    traps:['Improvising concentration from memory under stress.','Repeating doses when an absent response may reflect the wrong diagnosis, line failure or dosing error.'],
    integration:'The procedure is safe physiology-guided medication use, not merely drawing up a syringe.'
  },
  'medication-safety': {
    mechanism:'High-risk medication harm often arises from system failures: concentration mismatch, unlabeled syringes, look-alike products, route errors and communication breakdowns.',
    bedside:'Standardize concentration, isolate the preparation task, label immediately and use closed-loop verification before administration.',
    traps:['Relying on expertise to replace a safety system.','Assuming urgency makes verification optional.'],
    integration:'Design the workflow so a single cognitive slip is unlikely to reach the patient.'
  },
  'chest-tube': {
    mechanism:'Pleural drainage restores pressure relationships by providing a path for air or fluid to leave the pleural space. Tube position and system function determine whether that path remains effective.',
    bedside:'Assess patient physiology and the drainage system together after placement. Trace the entire system when improvement is absent or deterioration occurs.',
    traps:['Assuming a tube in the chest is necessarily in the pleural space.','Ignoring tubing kinks, clot, migration or disconnection.'],
    integration:'The procedure is not finished until the system is functioning and the patient response makes sense.'
  },
  'central-line': {
    mechanism:'Central venous access uses a wire-guided pathway from needle to catheter; the highest-risk errors occur when vessel identity, needle-tip position or wire location is assumed rather than confirmed.',
    bedside:'Map anatomy before puncture, keep the true needle tip accounted for, confirm venous placement by reliable methods and maintain continuous wire control.',
    traps:['Using blood color alone to distinguish vein from artery.','Dilating before confirming wire position in the intended vessel.'],
    integration:'Each stage should contain an explicit safety checkpoint before moving to the next irreversible step.'
  },
  'io-access': {
    mechanism:'Intraosseous access reaches the medullary venous network through bone cortex, providing rapid vascular access when conventional access is delayed.',
    bedside:'Use the approved landmark and device-specific technique, then confirm stability, flush behavior and surrounding tissue integrity repeatedly.',
    traps:['Assuming every device that enters bone is intramedullary and usable.','Forgetting ongoing extravasation/compartment-risk checks.'],
    integration:'Speed matters, but landmark discipline and confirmation remain part of the procedure.'
  },
  'vent-troubleshooting': {
    mechanism:'Acute ventilator deterioration can originate from the patient, tube, circuit or machine. Peak and plateau pressures help separate resistance from compliance when measurements are trustworthy.',
    bedside:'Look at the patient first, rescue oxygenation/ventilation if the device cannot be trusted, then trace from patient to tube to circuit to machine.',
    traps:['Staring at the ventilator while the patient deteriorates.','Treating every high-pressure alarm as bronchospasm.'],
    integration:'Use pressure pattern, capnography, exam and circuit inspection to localize the problem quickly.'
  },
  'massive-transfusion': {
    mechanism:'Major hemorrhage produces loss of oxygen-carrying capacity, volume and hemostatic components while hypothermia, hypocalcemia, dilution and acidosis can worsen coagulation.',
    bedside:'Activate the hemorrhage system early, warm the resuscitation, track calcium/coagulation/temperature and never lose sight of definitive source control.',
    traps:['Running product delivery as a logistics task disconnected from physiology.','Allowing source control to become secondary to transfusion mechanics.'],
    integration:'Resuscitation buys time; source control ends the hemorrhage.'
  },
  'source-control': {
    mechanism:'Antibiotics cannot sterilize every infected collection, necrotic tissue or infected device. Persistent nidus can sustain inflammatory and microbial burden despite apparently appropriate antimicrobial therapy.',
    bedside:'Ask early whether drainage, debridement, device removal or surgery is required and whether it is actually happening.',
    traps:['Escalating antibiotic breadth when the real failure is lack of source control.','Waiting for complete hemodynamic normalization before addressing a time-sensitive source.'],
    integration:'Sepsis treatment is host support plus antimicrobials plus definitive control of the source.'
  },
  'antimicrobial-pkpd': {
    mechanism:'Critical illness alters volume of distribution, protein binding and clearance. Drug efficacy depends on whether exposure matches the relevant PK/PD target.',
    bedside:'Account for augmented renal clearance, AKI, CRRT, fluid shifts and obesity rather than assuming standard dosing produces standard exposure.',
    traps:['Reducing doses reflexively in early sepsis because creatinine is high.','Ignoring extracorporeal clearance.'],
    integration:'The antimicrobial choice and the exposure strategy are separate decisions.'
  },
  'crrt': {
    mechanism:'CRRT uses diffusion, convection and ultrafiltration to control solute, acid-base and volume continuously. Prescribed dose can differ substantially from delivered dose.',
    bedside:'Separate total effluent from net patient fluid removal and interpret access, filter and return pressures as clues to the physical circuit.',
    traps:['Calling every effluent liter “fluid removed from the patient.”','Ignoring downtime and clotting when assessing delivered therapy.'],
    integration:'CRRT is both renal support and a hemodynamic intervention.'
  },
  'pa-catheter': {
    mechanism:'A pulmonary artery catheter samples pressures through right heart and pulmonary circulation and can estimate flow and oxygen extraction. Every derived variable depends on valid waveforms and measurement assumptions.',
    bedside:'Level and zero first, recognize RA/RV/PA/wedge waveforms, validate wedge and interpret serial pressures with cardiac output and SvO2.',
    traps:['Treating a wedge number without validating the waveform.','Using one hemodynamic snapshot as a diagnosis.'],
    integration:'Use invasive hemodynamics to test and refine a model, not to collect isolated targets.'
  },
  'ecmo': {
    mechanism:'ECMO drains venous blood, pumps it through a membrane lung and returns it to the circulation. VV supports gas exchange; VA additionally supports systemic flow and changes cardiac loading conditions.',
    bedside:'Follow blood through drainage, pump, oxygenator and return while considering native heart/lung function and cannula position.',
    traps:['Equating pump RPM with effective support.','Ignoring recirculation, LV distension or differential hypoxemia.'],
    integration:'The circuit and the native circulation are one coupled system.'
  },
  'sedation-analgesia': {
    mechanism:'Analgesics and sedatives alter pain, awareness, respiratory drive, vascular tone and neurologic assessment. Deep sedation is a physiologic intervention with downstream consequences.',
    bedside:'Separate pain, anxiety, delirium, dyssynchrony and hypoxemia before escalating sedation; use an explicit target and reassess it.',
    traps:['Using paralysis as evidence of comfort.','Treating agitation as a medication deficiency without finding the cause.'],
    integration:'Sedation strategy should serve a clinical goal, not simply silence movement.'
  },
  'delirium': {
    mechanism:'Delirium reflects acute brain dysfunction shaped by illness, medications, sleep disruption, sensory deprivation, immobility and environmental stressors.',
    bedside:'Identify reversible drivers, lighten unnecessary sedation, restore sleep-wake cues, mobilize when feasible and involve family/orientation strategies.',
    traps:['Calling hypoactive delirium “calm.”','Treating delirium exclusively with sedating medication.'],
    integration:'Brain recovery depends on the entire ICU environment, not one drug.'
  },
  'goals-care': {
    mechanism:'Goals-of-care decisions align treatments with the patient’s values and realistic outcomes. Prognosis is probabilistic and changes with response over time.',
    bedside:'Use best-case/worst-case/most-likely framing and time-limited trials with explicit endpoints when uncertainty remains.',
    traps:['Presenting procedures as neutral menu choices without recommendation.','Using false precision to avoid discussing uncertainty.'],
    integration:'A high-quality critical-care plan includes what outcome the patient would consider worth the burdens of treatment.'
  },
  'septic-shock': {
    mechanism:'Septic shock can combine vasoplegia, venous pooling, myocardial dysfunction, endothelial leak and disturbed microcirculation. Cardiac output may be low, normal or high.',
    bedside:'Reassess vascular tone, flow, congestion and perfusion after each intervention rather than assuming a fixed distributive phenotype.',
    traps:['Reducing sepsis to “low SVR.”','Using lactate or MAP alone as the resuscitation target.'],
    integration:'Source control, antimicrobial exposure and circulatory support must progress in parallel.'
  },
  'cardiogenic-shock': {
    mechanism:'Cardiogenic shock is inadequate forward flow from pump failure, often accompanied by elevated filling pressures and congestion. RV, LV and biventricular phenotypes behave differently.',
    bedside:'Track flow, pressure, congestion, coronary perfusion, rhythm and mechanical complications; escalate support when pharmacology cannot restore effective circulation.',
    traps:['Treating all cardiogenic shock with the same inotrope/pressor pattern.','Ignoring congestion while chasing blood pressure.'],
    integration:'The support strategy should match the failing ventricle and the cause of pump failure.'
  },
  'pe': {
    mechanism:'Large pulmonary embolic obstruction abruptly raises RV afterload, causing RV dilation, reduced LV filling and potential obstructive shock; gas exchange often reflects increased dead space.',
    bedside:'Look for RV strain, low-flow signs and widening PaCO2–EtCO2 gap; be cautious with induction and excessive positive pressure in a preload- and RV-dependent circulation.',
    traps:['Assuming clear lungs mean respiratory physiology is benign.','Intubating without preparing for hemodynamic collapse.'],
    integration:'Massive PE is primarily a circulation problem expressed through the pulmonary vasculature.'
  },
  'tamponade': {
    mechanism:'When pericardial pressure approaches chamber filling pressure, diastolic filling becomes constrained and the ventricles compete within a fixed space.',
    bedside:'Interpret echo and hemodynamics together, especially respiratory variation, chamber collapse and venous congestion.',
    traps:['Waiting for the complete classic triad.','Ignoring how positive pressure can further reduce venous return.'],
    integration:'Tamponade is a pressure-gradient problem whose definitive solution is relief of pericardial constraint.'
  },
  'vasopressors': {
    mechanism:'Vasoactive drugs alter arterial tone, venous tone, contractility and heart rate to different degrees. The same MAP response can hide very different effects on flow and myocardial demand.',
    bedside:'Choose the agent from the dominant deficit and define what improvement and toxicity should look like before titration.',
    traps:['Treating MAP increase as proof of improved perfusion.','Ignoring venous effects and cardiac workload.'],
    integration:'Use vasoactive drugs to correct a physiologic mechanism, not to normalize a monitor number.'
  },
  'coagulopathy': {
    mechanism:'Hemostasis depends on platelets, fibrinogen, coagulation factors, fibrinolysis, calcium, pH and temperature. Critical illness can produce simultaneous bleeding and thrombosis risk.',
    bedside:'Interpret conventional labs and viscoelastic tests in the clinical context and replace the failing component rather than one arbitrary number.',
    traps:['Equating INR with whole-blood clot quality.','Ignoring fibrinogen, platelet function, temperature and calcium.'],
    integration:'Coagulation is a dynamic system, not a single laboratory pathway.'
  },
  'cognitive-bias': {
    mechanism:'Anchoring, confirmation bias and premature closure arise because fast pattern recognition is useful but can overcommit to the first plausible model.',
    bedside:'Name the finding that does not fit, generate at least one alternative mechanism and use treatment response as new diagnostic evidence.',
    traps:['Confusing confidence with probability.','Interpreting unexpected response as “refractory disease” without revisiting the diagnosis.'],
    integration:'Expertise includes knowing when your model should lose credibility.'
  },
  'drain-troubleshooting': {
    mechanism:'A pleural drain can fail because pathology persists, the tube is malpositioned/occluded, connections leak, or the drainage system is configured incorrectly.',
    bedside:'Trace from patient to skin entry, tubing, connections, water seal and suction; correlate with respiratory/hemodynamic changes and pleural imaging.',
    traps:['Milking or manipulating tubing without understanding the problem.','Assuming bubbling always means the same thing.'],
    integration:'Device behavior is meaningful only when interpreted with the patient and the physical circuit.'
  },
  'etco2-gap': {
    mechanism:'EtCO2 reflects gas from the best-perfused ventilated alveoli, while PaCO2 reflects mixed arterial CO2. Increasing alveolar dead space often widens the arterial-to-end-tidal difference.',
    bedside:'Trend the gap in shock, PE and changing pulmonary perfusion rather than applying a fixed correction factor.',
    traps:['Assuming EtCO2 is always a constant number below PaCO2.','Attributing low EtCO2 only to hyperventilation.'],
    integration:'Capnography is a circulation signal when pulmonary blood flow changes.'
  },
  'hemoperitoneum': {
    mechanism:'Free intraperitoneal blood accumulates in dependent spaces, but early volume, clot, body habitus and retroperitoneal bleeding can limit ultrasound detection.',
    bedside:'Sweep RUQ, LUQ and pelvis in more than one view and repeat when physiology changes.',
    traps:['Treating a negative FAST as exclusion of significant hemorrhage.','Confusing physiologic deterioration with “discordant” imaging rather than repeating the exam.'],
    integration:'Ultrasound sensitivity changes with time; trauma evaluation must remain dynamic.'
  },
  'herniation': {
    mechanism:'When intracranial pressure gradients exceed compensatory reserve, brain tissue shifts across fixed boundaries, compressing cranial nerves, vessels and brainstem structures.',
    bedside:'Recognize trajectory—declining consciousness, pupillary asymmetry, motor changes and evolving brainstem physiology—while protecting oxygenation and cerebral perfusion.',
    traps:['Waiting for the complete Cushing response.','Aggressively lowering systemic pressure in a patient whose CPP is already threatened.'],
    integration:'Temporizing therapy buys time for definitive imaging/neurosurgical treatment; it does not solve the underlying lesion.'
  },
  'ptx-us': {
    mechanism:'Pleural ultrasound infers apposition or separation of pleural layers through sliding, B-lines, lung pulse, M-mode patterns and lung point.',
    bedside:'Absent sliding raises suspicion but is nonspecific; lung point is more specific when present in the appropriate context.',
    traps:['Diagnosing pneumothorax from absent sliding alone.','Forgetting apnea, pleurodesis, mainstem intubation or severe lung disease as alternatives.'],
    integration:'Use multiple signs and the patient’s physiology rather than one binary image feature.'
  },
  'dka': {
    mechanism:'Insulin deficiency and counter-regulatory hormones drive ketogenesis, osmotic diuresis and major total-body electrolyte deficits even when serum levels initially appear normal or high.',
    bedside:'Track volume status, potassium, sodium/osmolality, anion gap and acid-base trajectory through treatment.',
    traps:['Treating glucose normalization as resolution of DKA.','Forgetting that insulin can rapidly expose profound potassium depletion.'],
    integration:'DKA therapy changes physiology continuously; every lab value belongs to a time point in that transition.'
  },
  'acute-liver-failure': {
    mechanism:'Abrupt loss of hepatic synthetic and metabolic function can cause hyperammonemia, hypoglycemia, vasodilation, coagulopathy, renal failure and cerebral edema.',
    bedside:'Trend neurologic status, glucose, acid-base, renal function and hemodynamics while involving a transplant-capable center early.',
    traps:['Treating elevated INR as the only measure of severity.','Assuming chronic-cirrhosis physiology applies directly to acute failure.'],
    integration:'Acute liver failure is a brain-circulation-metabolism emergency with a time-sensitive transplant decision.'
  },
  'hepatic-encephalopathy': {
    mechanism:'Hepatic encephalopathy reflects impaired detoxification and altered neurotransmission, often worsened by infection, bleeding, constipation, medications or electrolyte disturbance.',
    bedside:'Search for precipitants and competing causes of altered mental status; ammonia supports context but should not replace the clinical diagnosis.',
    traps:['Treating the ammonia level rather than the patient.','Missing infection, bleeding or sedative accumulation.'],
    integration:'The mental-status change is often a sign of a broader systemic problem that can be corrected.'
  },
  'gi-hemorrhage': {
    mechanism:'Severe GI bleeding combines blood loss with source-specific physiology such as portal hypertension and can rapidly create airway, perfusion and coagulation problems.',
    bedside:'Resuscitate while mobilizing definitive endoscopic/interventional control and managing anticoagulant/coagulopathy issues.',
    traps:['Delaying source control until every vital sign normalizes.','Intubating reflexively without considering the hemodynamic cost.'],
    integration:'Resuscitation and source control are simultaneous workflows.'
  },
  'acute-pancreatitis': {
    mechanism:'Pancreatic inflammation can drive systemic capillary leak, third spacing, vasodilation, ARDS, AKI and later necrotic/infectious complications.',
    bedside:'Reassess volume needs frequently, support organ failure, start nutrition thoughtfully and distinguish sterile inflammatory deterioration from later infection.',
    traps:['Continuing aggressive fluid long after responsiveness is lost.','Assuming every fever or leukocytosis means infected necrosis.'],
    integration:'The disease evolves from inflammatory resuscitation to organ support and sometimes source control.'
  },
  'nutrition': {
    mechanism:'Critical illness changes protein turnover, insulin sensitivity and energy use. Nutrition cannot fully reverse catabolism but route, timing and protein strategy influence recovery.',
    bedside:'Prefer enteral feeding when feasible, assess aspiration/hemodynamic risk and monitor tolerance rather than chasing an exact calorie number immediately.',
    traps:['Equating calories with adequate nutrition.','Overfeeding unstable patients or missing refeeding risk.'],
    integration:'Nutrition, mobility and ventilator liberation are connected recovery interventions.'
  },
  'refeeding': {
    mechanism:'Reintroducing carbohydrate after prolonged undernutrition raises insulin and shifts phosphate, potassium and magnesium intracellularly while increasing thiamine demand.',
    bedside:'Identify high-risk patients before feeding escalation and monitor electrolytes and cardiopulmonary/neurologic response.',
    traps:['Waiting for severe hypophosphatemia before recognizing risk.','Increasing calories rapidly because initial feeding was tolerated.'],
    integration:'The dangerous part is the metabolic transition, not the food itself.'
  },
  'hhs': {
    mechanism:'HHS is dominated by severe hyperosmolality and free-water deficit with relatively little ketoacidosis. Neurologic dysfunction tracks osmotic disturbance and underlying illness.',
    bedside:'Follow effective osmolality, sodium trajectory, volume status and neurologic state while glucose falls.',
    traps:['Treating HHS as DKA with fewer ketones.','Correcting glucose rapidly without watching osmolality and sodium.'],
    integration:'The treatment target is gradual restoration of water and osmolality, not merely glucose normalization.'
  },
  'adrenal-crisis': {
    mechanism:'Cortisol deficiency impairs vascular responsiveness and stress metabolism; mineralocorticoid deficiency can add sodium loss and hyperkalemia depending on the cause.',
    bedside:'Consider it in refractory shock with compatible history or electrolyte/glucose clues and recognize that treatment can rapidly change vasopressor needs.',
    traps:['Waiting for confirmatory testing in an unstable high-suspicion patient.','Assuming normal potassium excludes all adrenal insufficiency.'],
    integration:'Endocrine failure can masquerade as undifferentiated shock.'
  },
  'thyroid-storm': {
    mechanism:'Severe thyrotoxicosis amplifies metabolic demand and adrenergic signaling, producing fever, CNS dysfunction, arrhythmia and sometimes high-output then decompensated heart failure.',
    bedside:'Recognize the syndrome clinically and treat the precipitant while addressing adrenergic effects and thyroid hormone production/release in appropriate sequence.',
    traps:['Relying on one thyroid hormone value to define severity.','Using aggressive rate control without considering decompensated pump failure.'],
    integration:'The thyroid state magnifies stress physiology across multiple organs.'
  },
  'myxedema-coma': {
    mechanism:'Extreme hypothyroidism reduces metabolic rate, ventilatory drive and cardiac performance while impairing free-water handling and thermoregulation.',
    bedside:'Anticipate hypoventilation, bradycardia, hypotension, hyponatremia and hypothermia; consider adrenal coverage while treating.',
    traps:['Aggressive external rewarming that worsens vasodilation.','Missing ventilatory failure because oxygen saturation appears acceptable.'],
    integration:'The syndrome is global metabolic slowing with limited cardiovascular and respiratory reserve.'
  },
  'toxic-alcohols': {
    mechanism:'Methanol and ethylene glycol parent compounds create early osmolar burden while toxic metabolites later produce high-anion-gap acidosis and organ-specific injury.',
    bedside:'Use time course, osmolar gap, anion gap, visual/renal findings and acid-base state together; antidotal blockade and dialysis solve different kinetic problems.',
    traps:['Waiting for a confirmatory level when physiology strongly supports toxicity.','Assuming a normal osmolar gap late in presentation is reassuring.'],
    integration:'As parent alcohol is metabolized, the osmolar gap can fall while toxicity worsens.'
  },
  'salicylate-toxicity': {
    mechanism:'Salicylates stimulate respiration, uncouple oxidative phosphorylation and create mixed respiratory alkalosis/metabolic acidosis; lower blood pH increases nonionized drug penetration into tissues.',
    bedside:'Preserve compensatory ventilation, monitor acid-base trajectory and consider alkalinization/extracorporeal removal when severity warrants.',
    traps:['Calling a near-normal pH reassuring.','Intubating without matching the patient’s extraordinary minute ventilation.'],
    integration:'Acid-base management is toxicokinetic management because pH changes tissue distribution.'
  },
  'bb-ccb-toxicity': {
    mechanism:'Beta blockade reduces chronotropy/inotropy while calcium-channel blockade can add profound vasodilation and impaired insulin release/metabolism; phenotype varies by agent.',
    bedside:'Treat pump failure, vasoplegia and metabolic consequences in parallel rather than expecting one antidote to reverse every mechanism.',
    traps:['Using heart rate alone to judge severity.','Stopping after a transient pressure response without reassessing flow and perfusion.'],
    integration:'The dominant shock mechanism should guide the support strategy.'
  },
  'sodium-channel-toxicity': {
    mechanism:'Fast sodium-channel blockade slows phase-zero depolarization, widening QRS and predisposing to hypotension, ventricular dysrhythmia and seizure.',
    bedside:'Use ECG morphology and hemodynamics as dynamic toxicity markers and understand why sodium loading/alkalinization can improve channel conduction in selected poisonings.',
    traps:['Waiting for a serum drug concentration.','Treating a wide-complex toxicologic rhythm as ordinary monomorphic VT without mechanism context.'],
    integration:'Electrophysiology is the antidote map.'
  },
  'transplant-physiology': {
    mechanism:'Transplanted organs have altered anatomy, denervation or surgical connections while rejection, infection, ischemia and medication toxicity can produce overlapping dysfunction.',
    bedside:'Use time-from-transplant, organ type, immunosuppression and prior complications to shape the differential.',
    traps:['Calling every graft problem rejection.','Stopping immunosuppression reflexively during critical illness.'],
    integration:'The patient’s immune state, graft physiology and drug exposure are inseparable.'
  },
  'immunosuppression': {
    mechanism:'Different immune deficits predispose to different organisms and alter inflammatory presentation. Immunosuppressants also create renal, neurologic, metabolic and drug-interaction toxicity.',
    bedside:'Match infection risk to the immune defect and timeline while checking for drug toxicity and interaction.',
    traps:['Expecting fever or leukocytosis to be reliable.','Ignoring antimicrobial–immunosuppressant interactions.'],
    integration:'The host response may be muted even when infection is severe.'
  },
  'burn-shock': {
    mechanism:'Major burns create inflammatory capillary leak, evaporative loss and changing vascular permeability. Formula estimates cannot account for individual response or fluid creep.',
    bedside:'Use a formula as an initial estimate, then titrate to perfusion and organ endpoints while watching for over-resuscitation.',
    traps:['Treating the formula as a fixed prescription.','Chasing urine output with unlimited crystalloid despite worsening edema/compartment physiology.'],
    integration:'Burn resuscitation is dynamic shock management, not arithmetic.'
  },
  'inhalation-injury': {
    mechanism:'Fire exposure can cause thermal upper-airway edema, chemical lower-airway injury and systemic carbon monoxide/cyanide toxicity—three distinct processes.',
    bedside:'Assess for progressive airway edema, bronchial injury and systemic toxin physiology separately; early airway control may be safer before edema peaks in selected patients.',
    traps:['Using soot alone as diagnosis.','Assuming normal pulse oximetry excludes carbon monoxide exposure.'],
    integration:'The airway, lung and cellular oxygen-utilization problems can coexist.'
  },
  'traumatic-brain-injury': {
    mechanism:'Primary injury is followed by potentially preventable secondary injury from hypoxemia, hypotension, impaired cerebral perfusion, edema and temperature/metabolic stress.',
    bedside:'Prioritize oxygenation and perfusion while integrating ICP/CPP with extracranial hemorrhage and ventilation needs.',
    traps:['Permissive hypotension without considering severe TBI.','Overventilating chronically after an acute herniation concern has passed.'],
    integration:'Trauma resuscitation sometimes contains competing pressure goals; make the tradeoff explicit.'
  },
  'ob-hemorrhage': {
    mechanism:'Pregnancy expands plasma volume and changes hemostasis, allowing major blood loss before classic hypotension. Uterine atony and other obstetric sources require rapid source-specific treatment.',
    bedside:'Mobilize source control and hemorrhage resuscitation simultaneously and pay particular attention to fibrinogen, calcium and temperature.',
    traps:['Underestimating blood loss because BP is initially preserved.','Treating transfusion as a substitute for uterine/source control.'],
    integration:'Obstetric hemorrhage is hemorrhagic shock in a circulation with different reserve and source-control options.'
  },
  'preeclampsia-eclampsia': {
    mechanism:'Preeclampsia is a multisystem endothelial/placental disorder that can cause severe hypertension, cerebral edema/seizure, renal injury, pulmonary edema, liver injury and thrombocytopenia.',
    bedside:'Recognize severe features across organ systems, prevent/treat seizure and control dangerous pressure while coordinating definitive obstetric management.',
    traps:['Focusing only on blood pressure.','Giving large fluid loads to a patient with endothelial leak and pulmonary-edema risk.'],
    integration:'Maternal stabilization and obstetric management are linked, not sequential.'
  },
  'peripartum-cardiomyopathy': {
    mechanism:'Pregnancy-associated systolic dysfunction can emerge late in pregnancy or postpartum, producing congestion and low output while symptoms can resemble normal peripartum physiology.',
    bedside:'Look for orthopnea, hypoxemia, pulmonary edema, ventricular dysfunction and shock rather than dismissing dyspnea as normal postpartum change.',
    traps:['Missing heart failure because edema and tachycardia seem expected.','Forgetting pregnancy/postpartum constraints on some therapies.'],
    integration:'Apply ordinary pump-failure physiology inside an extraordinary physiologic state.'
  },
  'pediatric-shock': {
    mechanism:'Children can maintain blood pressure through tachycardia and vasoconstriction until late, while higher metabolic demand makes oxygen-delivery failure progress quickly.',
    bedside:'Use age-adjusted physiology, mental status, perfusion, pulse quality and urine output rather than waiting for hypotension.',
    traps:['Using adult thresholds.','Calling a normal pediatric BP reassuring despite poor perfusion.'],
    integration:'Pediatric shock is often compensated until it suddenly is not.'
  },
  'neonatal-transition': {
    mechanism:'At birth, lung expansion and oxygenation lower PVR while placental separation raises SVR, changing flow across the ductus arteriosus and foramen ovale.',
    bedside:'Persistent high PVR or structural heart disease can preserve fetal shunt patterns and produce severe hypoxemia.',
    traps:['Interpreting neonatal oxygenation without pre/post-ductal context.','Assuming adult circulation physiology immediately after birth.'],
    integration:'The first minutes to days of life are a rapidly changing pressure-and-resistance experiment.'
  },
  'congenital-heart': {
    mechanism:'Critical congenital lesions can be organized by whether systemic flow, pulmonary flow or mixing depends on a shunt/ductus and by how Qp and Qs respond to resistance changes.',
    bedside:'Think topology before lesion names: where can blood go, where must it mix, and what changes if PVR or SVR moves?',
    traps:['Treating oxygen as universally beneficial without considering shunt balance.','Memorizing lesions without understanding circulation geometry.'],
    integration:'A diagram of flow often explains the patient better than the diagnosis label.'
  },
  'pediatric-airway': {
    mechanism:'Small airway radius magnifies resistance, metabolic demand is higher and functional residual capacity is smaller, so pediatric respiratory reserve is limited.',
    bedside:'Anticipate rapid desaturation, apparatus dead-space effects and resistance from small tubes or secretions; size equipment thoughtfully.',
    traps:['Using adult ventilator assumptions on small patients.','Ignoring dead space added by connectors/sensors.'],
    integration:'Tiny geometric changes can create large physiologic consequences.'
  },
  'vent-weaning': {
    mechanism:'A spontaneous breathing trial tests whether the patient can assume the work of breathing, but extubation also requires airway protection and manageable post-extubation risk.',
    bedside:'When a trial fails, distinguish respiratory muscle load, cardiac dysfunction, weakness, sedation, airway issues and unresolved disease.',
    traps:['Repeating failed SBTs without diagnosing why.','Equating SBT success with guaranteed extubation success.'],
    integration:'Liberation is a diagnostic stress test followed by an airway decision.'
  },
  'recovery-weakness': {
    mechanism:'Inflammation, immobility, neuropathy, myopathy, sedation and undernutrition can cause profound ICU-acquired weakness and prolonged post-ICU disability.',
    bedside:'Build mobility, delirium prevention, nutrition and sedation minimization into daily care rather than starting “rehab” only after organ failure resolves.',
    traps:['Interpreting generalized weakness only as deconditioning.','Separating recovery planning from ventilator liberation.'],
    integration:'Survival is not the only outcome; function is a critical-care endpoint.'
  },
  'iabp': {
    mechanism:'IABP inflates in diastole to augment aortic diastolic pressure and deflates before systole to reduce LV afterload. Benefit depends on timing and native rhythm/hemodynamics.',
    bedside:'Use the arterial waveform to judge inflation near the dicrotic notch and presystolic deflation; compare assisted and unassisted beats.',
    traps:['Treating augmentation number alone as success.','Allowing late deflation to increase LV afterload.'],
    integration:'The waveform should show you the mechanism the device is trying to create.'
  },
  'mechanical-circulatory-support': {
    mechanism:'Temporary MCS devices unload or bypass different portions of the circulation. Device selection depends on LV, RV, biventricular and/or oxygenation failure.',
    bedside:'Understand where blood is removed, where it returns, what ventricle is unloaded and how native circulation interacts with the device.',
    traps:['Choosing a device by shock severity without matching anatomy/physiology.','Ignoring hemolysis, limb ischemia, ventricular distension and device-device interactions.'],
    integration:'Follow the blood and ask what pressure/flow relationship the device is changing.'
  },
  'status-epilepticus': {
    mechanism:'Persistent seizure activity becomes increasingly self-sustaining while causing metabolic demand, hypoxemia, acidosis, hyperthermia and neuronal injury.',
    bedside:'Treat promptly in phases, support physiology and consider ongoing nonconvulsive seizure when convulsions stop but mental status does not recover.',
    traps:['Giving repeated subtherapeutic first-line doses instead of changing treatment phase.','Assuming motor quiet means electrical seizure has ended.'],
    integration:'Time is part of the pathophysiology.'
  },
  'brain-death-neuroprognosis': {
    mechanism:'Neuroprognostication estimates future neurologic outcome using timed, multimodal evidence. Death by neurologic criteria is a separate formal determination requiring strict prerequisites and examination.',
    bedside:'Control confounders such as sedatives, hypothermia and metabolic derangement before making high-stakes conclusions.',
    traps:['Conflating prognosis with death determination.','Creating a self-fulfilling prophecy through premature withdrawal based on early uncertain signs.'],
    integration:'Expert communication includes the limits of what is known and the timing required to know more.'
  },
  'ultrasound-piv': {
    mechanism:'Ultrasound-guided peripheral access depends on selecting a vessel whose depth, diameter and course match the catheter and on tracking the actual needle tip.',
    bedside:'Scan before puncture, use multiple planes, advance enough catheter into the lumen and confirm function without soft-tissue infiltration.',
    traps:['Following the needle shaft while losing the tip.','Using a catheter too short for a deep vessel.'],
    integration:'Success is durable intraluminal catheter position, not merely blood return.'
  },
  'airway-rsi': {
    mechanism:'RSI changes oxygenation, ventilation, sympathetic tone and intrathoracic pressure abruptly. Physiologically difficult airways fail because the circulation or gas exchange cannot tolerate that transition.',
    bedside:'Prepare oxygenation, hemodynamics, suction, primary/backup devices, rescue ventilation and post-intubation support before induction.',
    traps:['Treating RSI as laryngoscopy plus drugs.','Ignoring severe RV failure, metabolic acidosis or shock until after apnea begins.'],
    integration:'The airway procedure includes the minutes before and after tube passage.'
  },
  'post-intubation': {
    mechanism:'Intubation creates a new physiologic state: airway resistance, mean intrathoracic pressure, sedation, ventilation and venous return all change at once.',
    bedside:'Confirm tube with waveform capnography, set disease-appropriate ventilation, establish analgesia/sedation and reassess hypotension or hypoxemia mechanistically.',
    traps:['Declaring success at tube confirmation.','Forgetting analgesia/sedation in a paralyzed patient.'],
    integration:'The first five minutes determine whether airway control becomes physiologic rescue or a new source of instability.'
  },
  'uncertainty': {
    mechanism:'Clinical decisions are made with incomplete information. Calibrated reasoning assigns provisional probability, makes predictions and updates when new data contradict the model.',
    bedside:'State confidence, name disconfirming evidence and define what response you expect from a treatment if the model is correct.',
    traps:['Equating uncertainty with indecision.','Becoming more confident simply because the same hypothesis has been repeated.'],
    integration:'A model that cannot be falsified is not useful clinical reasoning.'
  },
  'multisystem-tradeoffs': {
    mechanism:'Organ-support interventions frequently redistribute risk: PEEP can help oxygenation but worsen RV load; fluids can increase flow but worsen congestion; sedation can improve synchrony but obscure neurologic assessment.',
    bedside:'Before intervening, name the intended benefit, the organ/system at risk and the signal that would tell you the tradeoff has become unfavorable.',
    traps:['Optimizing one organ in isolation.','Treating guideline targets as independent goals that can all be maximized simultaneously.'],
    integration:'Expert critical care is often choosing the least harmful global strategy rather than a perfect organ-specific intervention.'
  }
  'sodium-disorders': { mechanism:'Serum sodium is primarily a water-to-solute concentration signal. Brain cells adapt to chronic tonicity change, making rapid reversal dangerous even when the number is very abnormal.', bedside:'Define tonicity, symptom severity and likely chronicity before choosing a correction strategy; monitor the trajectory frequently because therapy itself can change water excretion.', traps:['Treating sodium concentration as total-body sodium.','Correcting chronic dysnatremia according to urgency of the number rather than neurologic risk.'], integration:'Think in tonicity and brain adaptation, not sodium alone.' },
  'potassium-disorders': { mechanism:'Potassium gradients determine membrane excitability. Serum concentration reflects total-body balance plus rapid transcellular shifts driven by insulin, catecholamines, acid-base state and cell injury.', bedside:'When dangerous ECG or muscle findings are present, separate immediate membrane stabilization, temporary redistribution and definitive potassium removal.', traps:['Assuming a normal ECG eliminates severe hyperkalemia risk.','Confusing a transcellular shift with total-body potassium excess or depletion.'], integration:'Treat the membrane now while solving where the potassium came from and where it can go.' },
  'aki': { mechanism:'AKI represents impaired filtration and homeostasis from hemodynamic, tubular, interstitial, vascular, obstructive or mixed mechanisms; creatinine is delayed and does not identify cause.', bedside:'Use trajectory, urine output, hemodynamics, nephrotoxins, urinalysis and obstruction assessment to build the phenotype, then support volume/electrolyte/acid-base physiology.', traps:['Calling all oliguria “pre-renal.”','Starting or withholding renal support based on creatinine alone.'], integration:'Kidney injury is a syndrome; the treatment target is the mechanism and the homeostatic consequence.' },
  'divalent-electrolytes': { mechanism:'Calcium, magnesium and phosphate participate in membrane stability, contraction, ATP biology and neuromuscular function, so derangements can produce arrhythmia, weakness, seizure or shock.', bedside:'Interpret ionized calcium when physiology demands it and anticipate depletion during massive transfusion, refeeding, diuresis and extracorporeal therapy.', traps:['Treating total calcium without considering binding/albumin.','Replacing one electrolyte while ignoring coupled magnesium or phosphate abnormalities.'], integration:'Electrolytes are interacting physiologic variables, not independent laboratory chores.' },
  'hypoglycemia': { mechanism:'The brain depends heavily on circulating glucose and has limited fuel reserve, so severe hypoglycemia can rapidly cause seizure, coma and adrenergic stress.', bedside:'Correct glucose immediately while identifying ongoing insulin/drug effect, hepatic failure, adrenal disease, sepsis or nutritional depletion that can make recurrence likely.', traps:['Stopping after one normal repeat glucose.','Attributing persistent altered mental status to hypoglycemia after the glucose has been corrected without reassessment.'], integration:'Treat the neuroglycopenia fast, then treat the reason it happened.' },
  'pituitary-crisis': { mechanism:'Pituitary dysfunction can remove ACTH, TSH or ADH signaling and pituitary apoplexy can add acute mass effect, producing a mixed endocrine-neurologic emergency.', bedside:'Consider secondary adrenal insufficiency, sodium/water disturbance and visual/cranial-nerve findings together, especially in sudden headache with shock or hyponatremia.', traps:['Replacing thyroid hormone before protecting against adrenal insufficiency in a suspicious crisis.','Missing diabetes insipidus or water-balance changes as the course evolves.'], integration:'Pituitary emergencies cross endocrine, neurologic and osmotic physiology.' },
  'coronary-ischemia': { mechanism:'Myocardial ischemia reduces contractility and electrical stability and can cause papillary muscle, septal or free-wall mechanical complications after infarction.', bedside:'When a patient with ACS suddenly develops shock, pulmonary edema or a new murmur, broaden beyond “more ischemia” to mechanical failure and rhythm disturbance.', traps:['Treating the ECG diagnosis while missing a mechanical complication.','Using vasopressor escalation as a substitute for reperfusion or structural intervention.'], integration:'Reperfusion, rhythm and mechanical hemodynamics must be managed as one evolving syndrome.' },
  'arrhythmias': { mechanism:'Rhythm affects cardiac output through rate, filling time, AV synchrony and ventricular activation; the same rate can be tolerated or catastrophic depending on reserve.', bedside:'First ask whether the rhythm is causing instability or compensating for another problem, then identify the electrical mechanism and choose synchronization, pacing or medication accordingly.', traps:['Treating compensatory sinus tachycardia as the primary disease.','Using a rate target without considering filling, stroke volume and perfusion.'], integration:'Rhythm management is hemodynamic management performed through electrophysiology.' },
  'electrolyte-arrhythmia': { mechanism:'Potassium, magnesium and calcium alter resting membrane potential, channel function and action-potential duration, changing conduction and repolarization.', bedside:'Use ECG morphology as evidence of membrane toxicity and correct the responsible electrolyte while monitoring for rapid electrical change.', traps:['Waiting for a numeric threshold despite toxic ECG findings.','Correcting potassium without magnesium when refractory ectopy or QT-related risk persists.'], integration:'The ECG is a real-time readout of electrolyte physiology.' },
  'valvular-emergencies': { mechanism:'Critical stenosis creates fixed outflow obstruction while acute regurgitation abruptly raises upstream pressure and reduces effective forward flow; loading interventions therefore have lesion-specific effects.', bedside:'Identify the lesion and dominant problem—fixed output, pulmonary edema, low coronary perfusion or regurgitant volume—before applying generic shock treatment.', traps:['Aggressively reducing preload in severe fixed obstruction.','Treating acute severe regurgitation like chronic compensated valve disease.'], integration:'Valve anatomy defines the permitted hemodynamic strategy.' },
  'aortic-emergencies': { mechanism:'Aortic wall disruption or aneurysmal rupture can cause hemorrhage, branch-vessel malperfusion, acute aortic regurgitation or tamponade.', bedside:'Reduce shear/impulse when appropriate while preserving organ perfusion and accelerating definitive surgical/endovascular evaluation.', traps:['Lowering blood pressure without controlling tachycardia/shear in dissection.','Missing tamponade or malperfusion because chest pain has improved.'], integration:'The aorta can fail as both a conduit and a source of catastrophic secondary organ ischemia.' },
  'post-arrest': { mechanism:'After ROSC, ischemia-reperfusion injury can produce myocardial stunning, vasoplegia, cerebral injury and systemic inflammation while the precipitating cause may remain active.', bedside:'Control oxygenation, ventilation, temperature and hemodynamics while pursuing cause and delaying definitive neurologic prognosis until confounders and timing are appropriate.', traps:['Hyperoxygenating or hyperventilating automatically after ROSC.','Making early neurologic predictions during sedation, hypothermia or metabolic confounding.'], integration:'ROSC ends cardiac arrest; it begins post-arrest critical care.' },
  'obstructive-airway': { mechanism:'Asthma and COPD create expiratory flow limitation; when expiratory time is insufficient, trapped gas raises end-expiratory alveolar pressure and thoracic volume.', bedside:'Look for expiratory flow failing to reach baseline, rising pressures and hemodynamic compromise; reduce air trapping by addressing obstruction and allowing time to exhale.', traps:['Responding to hypercapnia by reflexively increasing rate.','Mistaking high peak pressure from resistance for poor compliance.'], integration:'In obstructive disease, time is a ventilator setting.' },
  'auto-peep': { mechanism:'Intrinsic PEEP is residual positive alveolar pressure caused by incomplete exhalation and dynamic hyperinflation, increasing inspiratory threshold load and intrathoracic pressure.', bedside:'Detect it from flow curves and appropriate expiratory holds, then reduce minute-ventilation demand or increase expiratory time as physiology permits.', traps:['Adding external PEEP without understanding the auto-PEEP mechanism.','Increasing respiratory rate when breath stacking is already present.'], integration:'The next breath should not begin before the previous one has physically had time to leave.' },
  'vent-synchrony': { mechanism:'Dyssynchrony occurs when ventilator trigger, flow, inspiratory time or cycling does not match the patient’s neural respiratory demand.', bedside:'Use waveform pattern and bedside observation to distinguish trigger delay, flow starvation, premature/late cycling and double triggering before escalating sedation.', traps:['Calling every struggle “agitation.”','Suppressing respiratory drive without correcting a mismatched ventilator setting.'], integration:'Synchrony is a patient-machine control problem, not merely a sedation problem.' },
  'parenchymal-lung': { mechanism:'Alveolar filling, interstitial disease and inflammatory injury impair gas exchange through varying combinations of shunt, diffusion limitation, reduced compliance and heterogeneous recruitability.', bedside:'Combine imaging pattern, mechanics, history and hemodynamics to distinguish pneumonia, hydrostatic edema, ARDS and chronic interstitial disease.', traps:['Treating all bilateral opacities as ARDS.','Using oxygenation response alone to infer recruitability.'], integration:'The same chest image can represent very different mechanics and circulatory problems.' },
  'pulmonary-edema': { mechanism:'Hydrostatic pulmonary edema develops when pulmonary capillary pressure drives fluid into interstitium/alveoli faster than lymphatic clearance can compensate.', bedside:'Use noninvasive positive pressure and afterload/preload strategy according to the circulatory lesion while reassessing blood pressure and forward flow.', traps:['Treating every B-line pattern as volume overload.','Diuresing a hypotensive patient without understanding the valve/ventricular physiology.'], integration:'Pulmonary edema is often a cardiac pressure problem expressed in the lung.' },
  'hemoptysis': { mechanism:'Life-threatening hemoptysis threatens ventilation by flooding conducting airways, often before blood loss itself becomes the dominant problem.', bedside:'Protect the nonbleeding lung, prepare airway isolation strategies, correct reversible coagulopathy and mobilize bronchoscopic/interventional source control.', traps:['Supine positioning that allows blood to contaminate both lungs.','Focusing on hemoglobin while airway patency is deteriorating.'], integration:'In massive hemoptysis, the airway is the hemorrhage-control battleground.' },
  'pleural-effusion': { mechanism:'Pleural fluid changes lung/chest-wall mechanics and may reflect hydrostatic, inflammatory, malignant or infected processes; loculation changes drainability.', bedside:'Use ultrasound to assess volume, complexity, diaphragm/lung relationships and a safe procedural window while integrating the cause and need for source control.', traps:['Draining every effusion simply because it is visible.','Calling complex septated fluid an uncomplicated transudate based on history alone.'], integration:'Pleural ultrasound should answer both “what is it?” and “does it need intervention?”' },
  'cns-infection': { mechanism:'Meningeal or parenchymal infection can trigger edema, seizures, altered cerebral perfusion and systemic shock; antimicrobial delay can be harmful.', bedside:'Stabilize airway/perfusion and initiate appropriate empiric therapy promptly while deciding whether imaging/instability alters lumbar-puncture timing.', traps:['Delaying antimicrobials for an unsafe or logistically delayed LP.','Missing encephalitis because CSF findings are initially subtle.'], integration:'Diagnostic sequencing must never obstruct time-sensitive treatment of a high-risk CNS infection.' },
  'device-infection': { mechanism:'Foreign material permits biofilm and persistent microbial adherence, making infection harder to clear without removing or exchanging the source device when feasible.', bedside:'Assess every invasive device for necessity and source potential, obtain appropriate cultures and pair antimicrobial therapy with device/source decisions.', traps:['Broadening antibiotics indefinitely while leaving an infected device in place.','Removing essential access without a replacement plan in an unstable patient.'], integration:'A device can be both lifesaving infrastructure and the uncontrolled source.' },
  'antimicrobial-resistance': { mechanism:'Resistance emerges from organism biology plus selective pressure; empiric breadth should match host/severity/local epidemiology and then contract as evidence accumulates.', bedside:'Use prior cultures, recent exposure, local antibiogram and syndrome to choose empiric therapy, then deliberately de-escalate or stop when justified.', traps:['Equating “sicker” with unlimited antimicrobial breadth.','Failing to reassess antibiotics after cultures and source data return.'], integration:'Stewardship is not undertreatment; it is repeated matching of therapy to the probability landscape.' },
  'intraabdominal-infection': { mechanism:'Perforation, abscess, biliary obstruction and ischemic bowel create ongoing contamination or necrotic source that antibiotics alone may not control.', bedside:'In persistent shock, ask whether drainage, decompression or surgery is delayed and whether anatomy makes the source inaccessible to medical therapy.', traps:['Escalating vasopressors while source control stalls.','Attributing persistent lactate to sepsis alone despite possible ischemic bowel.'], integration:'For many abdominal infections, the definitive antimicrobial is a procedure.' },
  'stroke-lvo': { mechanism:'Large-vessel occlusion abruptly reduces regional cerebral blood flow; collateral circulation temporarily sustains penumbral tissue until reperfusion or infarction occurs.', bedside:'Recognize cortical/LVO syndromes, protect oxygenation and perfusion, establish last-known-well and move rapidly toward imaging/reperfusion pathways.', traps:['Lowering blood pressure reflexively before reperfusion strategy is defined.','Letting transport/airway procedures unnecessarily delay thrombectomy-capable care.'], integration:'Time, collaterals and perfusion determine how much brain remains salvageable.' },
  'ich-sah': { mechanism:'Intracranial hemorrhage causes direct tissue injury and mass effect; SAH adds aneurysm rebleeding, hydrocephalus and later delayed ischemic complications.', bedside:'Control blood pressure thoughtfully, reverse relevant anticoagulation, watch ICP/hydrocephalus and preserve cerebral perfusion while neurosurgical/aneurysm treatment proceeds.', traps:['Driving pressure so low that CPP is compromised.','Missing evolving hydrocephalus in a patient whose mental status declines.'], integration:'Hemorrhage management is simultaneously bleeding control, pressure control and brain perfusion management.' },
  'sah-dci': { mechanism:'Delayed cerebral ischemia after aneurysmal SAH involves vasospasm and broader microcirculatory/perfusion dysfunction, typically separated in time from the initial bleed.', bedside:'Track new focal deficits or reduced consciousness after the aneurysm is secured, maintain nimodipine when appropriate and escalate perfusion/vascular evaluation.', traps:['Assuming every late decline is sedation or hydrocephalus.','Confusing rebleeding risk management with later DCI hemodynamic goals.'], integration:'SAH changes phase over days; the correct hemodynamic concern changes with it.' },
  'neuromuscular-failure': { mechanism:'Neuromuscular weakness reduces effective ventilation and cough despite structurally normal lungs, and bulbar dysfunction adds aspiration/airway risk.', bedside:'Trend respiratory strength, secretion handling, bulbar function and gas exchange rather than waiting for SpO2 to fall.', traps:['Using oxygen saturation as the main marker of ventilatory reserve.','Sedating a weak patient in a way that masks declining respiratory mechanics.'], integration:'Ventilatory failure can be a muscle problem before it is a lung problem.' },
  'spinal-cord-injury': { mechanism:'High spinal cord injury can impair sympathetic tone and respiratory mechanics, producing neurogenic shock and weakness while hemorrhage remains a competing trauma diagnosis.', bedside:'Maintain spinal protection while distinguishing vasodilatory/bradycardic neurogenic physiology from blood loss and supporting oxygenation/perfusion.', traps:['Calling hypotension neurogenic before excluding hemorrhage.','Ignoring diaphragmatic/intercostal weakness in apparently stable oxygenation.'], integration:'Spinal injury changes both circulation and respiratory mechanics.' },
  'hit': { mechanism:'HIT antibodies activate platelets through PF4 complexes, making thrombocytopenia a marker of a strongly prothrombotic immune syndrome.', bedside:'Estimate pretest probability first, stop heparin and use appropriate non-heparin anticoagulation when probability warrants while confirmatory testing proceeds.', traps:['Ordering HIT testing for every ICU platelet fall.','Withholding anticoagulation simply because the platelet count is low in likely HIT.'], integration:'The feared complication is thrombosis, not the platelet number itself.' },
  'hypercoagulable-state': { mechanism:'Inflammation, malignancy, immobility, endothelial injury and devices can shift critical illness toward thrombosis even when routine coagulation tests appear prolonged.', bedside:'Assess VTE/device thrombosis risk independently from PT/aPTT and adapt prophylaxis or treatment to bleeding risk and mechanism.', traps:['Assuming prolonged INR means the patient is auto-anticoagulated.','Missing catheter thrombosis because the line still flushes.'], integration:'Bleeding tests and thrombosis biology are related but not interchangeable.' },
  'oncologic-emergencies': { mechanism:'Cancer can cause abrupt metabolic, rheologic or compressive emergencies including tumor lysis, leukostasis and malignant airway/vascular obstruction.', bedside:'Recognize the syndrome early, stabilize organ physiology and coordinate disease-specific therapy such as cytoreduction or metabolic control.', traps:['Treating tumor lysis electrolyte abnormalities one by one without controlling ongoing cell breakdown.','Missing leukostasis because total leukocyte count is not extreme.'], integration:'The malignancy can be the direct mechanism of organ failure, not merely background history.' },
  'bowel-ischemia': { mechanism:'Mesenteric hypoperfusion or arterial/venous occlusion causes intestinal ischemia, barrier failure and necrosis; examination can lag behind tissue injury.', bedside:'Maintain suspicion when pain, acidosis/lactate and shock exceed abdominal findings and accelerate definitive imaging/surgical evaluation.', traps:['Waiting for peritoneal signs before considering ischemia.','Attributing rising lactate entirely to global shock.'], integration:'Disproportion between physiology and examination is itself a diagnostic clue.' },
  'abdominal-compartment': { mechanism:'Elevated intra-abdominal pressure compresses venous return, renal perfusion and diaphragm excursion while increasing thoracic pressures and reducing organ blood flow.', bedside:'Consider bladder pressure/abdominal tension when ventilation, urine output and hemodynamics worsen together after resuscitation or edema.', traps:['Treating oliguria with more fluid when pressure is the cause.','Escalating ventilator pressure without recognizing abdominal mechanics.'], integration:'One pressure compartment can simultaneously create renal, respiratory and circulatory failure.' },
  'clinical-pharmacokinetics': { mechanism:'Critical illness changes volume of distribution, protein binding, hepatic metabolism and renal/extracorporeal clearance, so dose-exposure relationships become dynamic.', bedside:'Reassess dosing after fluid shifts, organ failure, CRRT/ECMO or interacting drugs instead of treating the admission dose as permanent.', traps:['Assuming creatinine alone predicts drug clearance.','Ignoring protein binding and circuit sequestration for highly bound/lipophilic drugs.'], integration:'Drug dosing is a moving physiology problem.' },
  'icu-quality-safety': { mechanism:'ICU harm often arises from complex-system vulnerabilities: communication failures, device exposure, medication process variation and missed deterioration.', bedside:'Use structured handoffs, daily necessity review, checklists and measured quality cycles while distinguishing process defects from individual blame.', traps:['Responding to every event with education alone.','Collecting quality metrics without linking them to a changeable process.'], integration:'Expert clinicians improve the system that surrounds individual decisions.' },
  'ethics-life-support': { mechanism:'Withholding and withdrawing life-sustaining treatment are ethically grounded in patient goals, proportionality and decision authority; stopping a burdensome intervention is not stopping care.', bedside:'Clarify values, prognosis and surrogate authority, recommend a plan aligned with goals and use conflict-resolution resources when disagreement persists.', traps:['Framing withdrawal as “doing nothing.”','Offering technically possible treatments without discussing whether they can achieve the patient’s goals.'], integration:'Critical-care expertise includes knowing when an intervention no longer serves the person it is meant to help.' },
  'organ-donation': { mechanism:'Donation decisions occur only after appropriate death determination pathways and authorization; donor physiology can then require intensive hemodynamic, endocrine and respiratory management.', bedside:'Maintain strict separation between death determination and donation while supporting organs according to established donor-management processes.', traps:['Allowing donation considerations to influence death determination.','Assuming critical-care work ends once death by neurologic criteria is established.'], integration:'Ethical separation and excellent physiology management are both required.' },
  'critical-care-echo': { mechanism:'Focused critical-care echo uses a limited reproducible view set to answer urgent questions about ventricular function, pericardial fluid and gross loading/shock phenotype.', bedside:'Acquire multiple views and interpret them with hemodynamics rather than relying on one qualitative image such as “small IVC” or one ventricular window.', traps:['Making comprehensive structural diagnoses from a focused exam.','Interpreting chamber size without pressure/loading context.'], integration:'Focused echo is hypothesis-driven bedside physiology, not miniature comprehensive echocardiography.' },
  'lung-ultrasound': { mechanism:'Lung ultrasound uses pleural motion and reverberation/consolidation artifacts to infer air-fluid-tissue relationships near the pleural surface.', bedside:'Scan multiple standardized zones and combine A-lines, B-lines, consolidation, effusion and pleural signs with mechanics and clinical context.', traps:['Treating B-lines as synonymous with cardiogenic edema.','Using one negative window to exclude focal lung disease.'], integration:'Lung ultrasound is a pattern map that becomes diagnostic only after physiology and distribution are considered.' },
};

export function noteFor(id:string){ return MASTERY_NOTES[id]; }
