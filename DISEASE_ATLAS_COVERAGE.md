# Disease atlas implementation coverage

Source coverage, not browser or clinical validation. Every entry has a four-step Director lesson, progressive mechanism diagram, Explore controls, a decision case, clinical distinction and references. Adult conditions can also open the existing whole-body 3D asset with procedural pathology overlays. Pediatric and reproductive anatomy currently use schematics.

## Conditions

### Respiratory

| Condition | Population | Modality | Semantic focus |
| --- | --- | --- | --- |
| Asthma | adult | airway | lung.airway |
| COPD / emphysema | adult | alveoli | lung.alveolus |
| Severe bronchospasm / air trapping | adult | airway | lung.airway |
| Auto-PEEP | adult | alveoli | lung.alveolus |
| Pneumonia | adult | alveoli | lung.alveolus |
| ARDS | adult | alveoli | lung.alveolus |
| Cardiogenic pulmonary edema | adult | alveoli | lung.edema |
| Atelectasis | adult | alveoli | lung.collapsed |
| Simple pneumothorax | adult | pleura | lung.pleura |
| Tension pneumothorax | adult | pleura | lung.pleura |
| Hemothorax | adult | pleura | lung.pleura |
| Pulmonary embolism | adult | pulmonary-vessels | lung.pulmonary_artery |
| Upper-airway obstruction | adult | airway | lung.airway |
| Aspiration | adult | airway | lung.airway |

### Cardiovascular

| Condition | Population | Modality | Semantic focus |
| --- | --- | --- | --- |
| STEMI / acute MI | adult | heart | heart.coronary |
| Cardiogenic shock | adult | heart | heart.lv |
| Acute decompensated heart failure | adult | heart | heart.lv |
| Right-ventricular failure | adult | heart | heart.rv |
| Cardiac tamponade | adult | heart | heart.pericardium |
| Major tachydysrhythmia concepts | adult | heart | heart.conduction |
| Major bradydysrhythmia concepts | adult | heart | heart.conduction |
| Aortic dissection | adult | aorta | aorta.thoracic |
| Abdominal aortic aneurysm | adult | aorta | aorta.abdominal |
| Rupturing AAA | adult | aorta | aorta.abdominal |
| Hypertensive emergency | adult | circulation | circulation.systemic |

### Neuro

| Condition | Population | Modality | Semantic focus |
| --- | --- | --- | --- |
| Large-vessel ischemic stroke | adult | brain | brain.mca |
| Ischemic core vs penumbra | adult | brain | brain.mca |
| Intracerebral hemorrhage | adult | brain | brain.hemorrhage |
| Subarachnoid hemorrhage | adult | brain | brain.cow |
| Cerebral edema | adult | brain | brain.whole |
| Rising ICP | adult | brain | brain.ventricles |
| Herniation | adult | brain | brain.brainstem |
| Seizure / status epilepticus | adult | brain | brain.whole |
| Traumatic brain injury | adult | brain | brain.hemorrhage |

### Shock & trauma

| Condition | Population | Modality | Semantic focus |
| --- | --- | --- | --- |
| Hemorrhagic shock | adult | circulation | circulation.systemic |
| Distributive / septic shock | adult | circulation | circulation.systemic |
| Anaphylactic shock | adult | circulation | body.chest |
| Obstructive shock | adult | circulation | body.chest |
| Chest trauma | adult | pleura | lung.pleura |
| Abdominal hemorrhage | adult | circulation | body.abdomen |
| Pelvic hemorrhage | adult | circulation | body.pelvis |
| Burns / capillary leak | adult | circulation | circulation.systemic |

### Metabolic & toxicology

| Condition | Population | Modality | Semantic focus |
| --- | --- | --- | --- |
| DKA | adult | chemistry | cell.mitochondria |
| Severe hyperkalemia | adult | chemistry | membrane.kir |
| Severe hypoglycemia | adult | chemistry | cell.mitochondria |
| Metabolic acidosis | adult | chemistry | cell.whole |
| Opioid toxicity | adult | chemistry | brain.brainstem |
| Sympathomimetic physiology | adult | chemistry | blood.chemistry |

### Airway & breathing

| Condition | Population | Modality | Semantic focus |
| --- | --- | --- | --- |
| Pediatric airway differences | child | airway | lung.airway |
| Croup | child | airway | lung.airway |
| Bronchiolitis | child | airway | lung.airway |
| Pediatric asthma | child | airway | lung.airway |
| Pediatric respiratory failure | child | alveoli | lung.whole |
| Pediatric ventilation principles | child | alveoli | lung.alveolus |

### Perfusion & metabolism

| Condition | Population | Modality | Semantic focus |
| --- | --- | --- | --- |
| Pediatric shock | child | circulation | circulation.systemic |
| Dehydration | child | circulation | body.abdomen |
| Pediatric sepsis | child | circulation | circulation.systemic |
| Pediatric DKA | child | chemistry | cell.mitochondria |

### Neuro & trauma

| Condition | Population | Modality | Semantic focus |
| --- | --- | --- | --- |
| Pediatric seizure / status | child | brain | brain.whole |
| Pediatric trauma | child | circulation | circulation.systemic |

### Congenital circulation

| Condition | Population | Modality | Semantic focus |
| --- | --- | --- | --- |
| Congenital-heart physiology foundations | child | heart | heart.four_chamber |
| Left-to-right shunt concepts | child | heart | heart.vsd |
| Right-to-left shunt concepts | child | heart | heart.rv |

### Neonatal

| Condition | Population | Modality | Semantic focus |
| --- | --- | --- | --- |
| Neonatal respiratory distress | neonate | alveoli | lung.alveolus |
| Neonatal ventilation concepts | neonate | alveoli | lung.alveolus |
| Transitional circulation | neonate | heart | heart.pda |
| Duct-dependent circulation | neonate | heart | heart.pda |

### Gynecology & women’s health

| Condition | Population | Modality | Semantic focus |
| --- | --- | --- | --- |
| PCOS | female | ovaries | ovary.left |
| Endometriosis | female | uterus | uterus.whole |
| Ectopic pregnancy | female | uterus | ovary.right |
| Ovarian torsion | female | ovaries | ovary.right |
| Severe abnormal uterine bleeding | female | uterus | uterus.whole |

### Normal pregnancy

| Condition | Population | Modality | Semantic focus |
| --- | --- | --- | --- |
| Normal maternal physiologic changes | maternal | circulation | circulation.systemic |
| Normal fetal / placental circulation | maternal | placenta | placenta |

### Obstetric emergencies

| Condition | Population | Modality | Semantic focus |
| --- | --- | --- | --- |
| Placenta previa | maternal | placenta | placenta |
| Placental abruption | maternal | placenta | placenta |
| Preeclampsia | maternal | placenta | placenta |
| Eclampsia | maternal | brain | brain.whole |
| HELLP syndrome | maternal | chemistry | body.abdomen |
| Postpartum hemorrhage | maternal | uterus | uterus.whole |
| Uterine atony | maternal | uterus | uterus.whole |
| Major obstetric hemorrhage | maternal | circulation | body.pelvis |
| Amniotic fluid embolism | maternal | pulmonary-vessels | lung.pulmonary_artery |
| Peripartum cardiomyopathy | maternal | heart | heart.lv |

## Ventilator equipment simulation

Modes: Volume assist/control, Pressure control, Pressure support, SIMV, PRVC, CPAP, APRV.

| Scenario | Objective |
| --- | --- |
| ARDS | Balance gas exchange, recruitment, plateau pressure and perfusion. |
| Severe asthma | Relieve obstruction and restore enough expiratory time. |
| COPD with auto-PEEP | Reduce trapped pressure and inspect patient triggering. |
| Cardiogenic pulmonary edema | Support recruitment while watching cardiac output. |
| Pneumonia / hypoxemic failure | Support asymmetric gas exchange without excessive stretch. |
| Tension pneumothorax | Distinguish pleural compression from airway resistance and inspect perfusion after decompression. |
| Post-intubation hypotension | Inspect the pressure–preload tradeoff and reassess perfusion. |
| High peak / normal plateau | Use a hold to distinguish resistive from elastic pressure. |
| High peak / high plateau | Measure plateau and identify an elastic pressure burden. |
| Tube obstruction | Identify the tube problem and observe the response to suction. |
| Circuit leak | Compare delivered and exhaled ventilation; restore the circuit. |
| Circuit disconnection | Recognize lost ventilation and restore circuit continuity. |
| Pediatric asthma · 20 kg | Use child-sized settings and inspect expiratory emptying. |

Patient physiology is the existing VentSession / Mechanics / SyntheticPatient model. Pending settings only reach that engine after valid confirmation. The patient and equipment scene is procedural SVG; numerical monitoring, ABG and waveform data come from the shared engine.

Real imaging comparators are identified in app/src/atlas/media.ts and reuse the shipped media manifest and attribution.

Release status: full production-build browser QA, exact viewport matrix, mobile Learn touch verification, anatomy/scene quality review and merge/Pages deployment remain open. See UI_FINAL_REVIEW.md.
