import { useEffect, useState, type ReactNode } from 'react';
import type { MentalRepBeat } from './types';

/** procedures whose beats without a specific visual still show the procedure's rendered anatomy (not an abstract diagram) */
const REP_ANATOMY: Record<string, [string, string]> = {
  'rep-io': ['io-landmark', 'Proximal tibia: flat anteromedial surface ~2 cm below the tuberosity'],
  'rep-pac': ['pac-pa', 'The catheter’s course: SVC → RA → tricuspid → RV → pulmonary valve → PA'],
  'rep-evd': ['evd-level', 'EVD to the foramen of Monro; the level runs through the tragus'],
  'rep-us-piv': ['piv', 'Forearm veins and the brachial artery'],
  'rep-efast': ['efast-map', 'eFAST windows on the real body'], 'rep-pocus-shock': ['efast-map', 'POCUS windows on the real body'],
  'rep-rsi': ['airway-overview', 'Upper airway against the skull and cervical spine'], 'rep-post-intubation': ['airway-overview', 'Upper airway and trachea'],
};
export function RepVisual({ beat, repId }: { beat: MentalRepBeat; repId?: string }) {
  const key = beat.visual ?? beat.phase;
  const anat = !beat.visual && repId ? REP_ANATOMY[repId] : undefined;
  if (anat && beat.phase !== 'debrief' && beat.phase !== 'decision') return <Render3D k={anat[0]} title={beat.title} caption={anat[1]} />;
  if (key === 'efast-ruq') return <RealFast />;
  if (key === 'ijv-real') return <RealIjv />;
  if (key === 'medication-prep') return <Medication />;
  if (key === 'epi-source') return <EpiPrep step="source" />;
  if (key === 'epi-flush') return <EpiPrep step="flush" />;
  if (key === 'epi-dilution') return <EpiPrep step="dilute" />;
  if (key === 'epi-label') return <EpiPrep step="label" />;
  if (key === 'monitor-response') return <Monitor />;
  if (key === 'blood-circuit') return <Blood />;
  if (key === 'artery-ultrasound') return <RealRep k={key} fallback={<NoMedia what="ultrasound clip" />} />;
  if (key === 'transducer-system') return <Transducer />;
  if (key === 'arterial-waveform') return <ArtWave />;
  if (key === 'square-wave-test') return <SquareWave />;
  if (key === 'efast-map' || key === 'pocus-map' || key === 'pocus-integrate') return <Render3D k="efast-map" title={key === 'efast-map' ? 'a repeatable sweep' : key === 'pocus-map' ? 'POCUS shock survey' : 'integrate the shock model'} caption="Probe windows on the real body: RUQ (Morison’s pouch), LUQ (splenorenal), subxiphoid, suprapubic, both anterior chests" />;
  if (key === 'efast-luq' || key === 'efast-pelvis' || key === 'efast-cardiac' || key === 'efast-lung') return <RealRep k={key} fallback={<NoMedia what="ultrasound clip" />} />;
  if (key === 'chest-wall-anatomy') return <RealRep k={key} fallback={<NoMedia what="chest-wall image" />} />;
  if (key === 'drain-system' || key === 'drain-water-seal') return <RealRep k={key} fallback={<Drain active={key === 'drain-water-seal'} />} />;
  if (key === 'evd-level') return <Render3D k="evd-level" title="patient reference → level → ordered height" caption="Catheter from Kocher’s point to the foramen of Monro; the level plane runs through the tragus (external auditory meatus)" />;
  if (key === 'vent-check') return <Vent />;
  if (key === 'io-landmark') return <Render3D k="io-landmark" title="proximal tibia · prove the bony landmark" caption="Flat anteromedial tibia ~2 cm below the tuberosity, needle perpendicular to the bone" />;
  if (key === 'piv-map') return <Render3D k="piv" title="map the veins before the needle" caption="Right forearm: cephalic (lateral), basilic (medial), median cubital across the fossa — brachial artery deep and medial" />;
  if (key === 'piv-tip') return <RealRep k={key} fallback={<NoMedia what="ultrasound clip" />} />;
  if (key === 'piv-confirm') return <Render3D k="piv" title="confirm: in the vein, away from the artery" caption="Cannula in the median cubital vein; the brachial artery runs deeper and medial" />;
  if (key === 'airway-overview' || key === 'airway-preoxygenation') return <Render3D k="airway-overview" title={key === 'airway-preoxygenation' ? 'preoxygenation + rescue' : 'airway plan before induction'} caption="Tongue, pharynx, epiglottis, larynx and trachea against the skull, mandible and cervical spine" />;
  if (key === 'post-tube') return <RealRep k={key} fallback={<NoMedia what="chest film" />} />;
  if (key === 'sedation-lines') return <Sedation />;
  if (key.startsWith('pac-')) { const c = key.replace('pac-', ''); return <Render3D k={'pac-' + c} title={'PA catheter · ' + ({ ra: 'RA', rv: 'RV', pa: 'PA', wedge: 'WEDGE' } as Record<string, string>)[c]} caption={({ ra: 'Balloon in the right atrium: low pressure, a and v waves', rv: 'Through the tricuspid valve: systolic rises, diastolic stays low', pa: 'Past the pulmonary valve: diastolic steps up — the dicrotic notch appears', wedge: 'Advanced to wedge in a right pulmonary artery branch: the balloon occludes, the trace falls to a left-atrial waveform' } as Record<string, string>)[c] ?? ''} />; }
  if (key === 'crrt-circuit') return <Crrt />;
  if (key === 'ecmo-circuit' || key === 'ecmo-return') return <Ecmo mode={key} />;
  if (key === 'iabp-wave' || key === 'iabp-errors') return <Iabp errors={key === 'iabp-errors'} />;
  if (key === 'seizure-timeline' || key === 'seizure-eeg') return <Seizure mode={key} />;
  if (key === 'pocus-lung' || key === 'pocus-venous' || key === 'pocus-abdomen' || key === 'pocus-heart') return <RealRep k={key} fallback={<NoMedia what="ultrasound clip" />} />;
  return <PhaseVisual beat={beat} />;
}

/** Real, openly licensed media for a rep beat, chosen by finding keys from imaging/real/manifest.json. */
interface RealRepItem { id: string; kind: string; file: string; webm?: string; poster?: string; title: string; credit?: string; author: string; license: string; findings?: string[]; finding?: string }
let manifest: Promise<RealRepItem[]> | null = null;
const loadManifest = () => (manifest ??= fetch('../imaging/real/manifest.json').then((r) => (r.ok ? r.json() : { items: [] })).then((m) => m.items as RealRepItem[]).catch(() => []));
const REP_KEYS: Record<string, { keys: string[]; ids?: string[]; title: string }> = {
  'efast-luq': { keys: ['fast_luq_positive', 'fast_luq_negative'], title: 'real LUQ view' },
  'efast-pelvis': { keys: ['fast_pelvis_positive', 'fast_pelvis_negative'], title: 'real pelvic view' },
  'efast-cardiac': { keys: ['fast_pericardial_negative'], ids: ['tamponade-ginghina'], title: 'real subxiphoid view' },
  'efast-lung': { keys: ['sliding'], ids: ['lus-sliding-gillman2012', 'lus-lung-point-gillman'], title: 'real lung sliding' },
  'post-tube': { keys: ['ett_ok'], title: 'real film: tube above the carina' },
  'chest-wall-anatomy': { keys: ['needle_decompression_site', 'chest_wall'], title: 'real chest wall' },
  'drain-system': { keys: ['chest_drain_unit'], title: 'real chest drain unit' }, 'drain-water-seal': { keys: ['chest_drain_unit'], title: 'real water seal' },
  'io-landmark': { keys: ['io_tibia'], title: 'real proximal tibia landmark' },
  'artery-ultrasound': { keys: ['radial_artery_us'], ids: ['ij-needle-inplane-2025'], title: 'real vascular ultrasound · needle tip in plane' },
  'pocus-heart': { keys: ['fast_pericardial_negative'], ids: ['fast-pericardial-negative-subcostal-2020', 'tamponade-ginghina'], title: 'real subxiphoid view' },
  'piv-map': { keys: ['piv_us'], title: 'real vein ultrasound' }, 'piv-tip': { keys: ['ij_needle', 'piv_us'], title: 'real needle tip in a vein' },
  'pocus-lung': { keys: ['sliding'], ids: ['lus-sliding-gillman2012', 'blines'], title: 'real lung ultrasound' },
  'pocus-venous': { keys: ['ivc_collapsing'], ids: ['ivc-collapse-gillman'], title: 'real IVC' },
  'pocus-abdomen': { keys: ['fast_ruq_positive'], ids: ['fast-ruq-positive'], title: 'real RUQ view' },
};
function RealRep({ k, fallback }: { k: string; fallback: ReactNode }) {
  const want = REP_KEYS[k]; const [it, setIt] = useState<RealRepItem | null | undefined>(undefined);
  useEffect(() => { let on = true; loadManifest().then((items) => { if (!on) return;
    const byId = (want.ids ?? []).map((id) => items.find((x) => x.id === id)).find(Boolean);
    const byKey = items.find((x) => want.keys.some((w) => (x.findings ?? []).includes(w) || x.finding === w));
    setIt(byKey ?? byId ?? null); }); return () => { on = false; }; }, [k]); // eslint-disable-line react-hooks/exhaustive-deps
  if (it === undefined) return null;
  if (!it) return <>{fallback}</>;
  const src = (f: string) => `../imaging/real/${f}`;
  return <Frame title={want.title} real><div className="rv-realmedia">{it.file.endsWith('.mp4')
    ? <video controls playsInline muted loop autoPlay poster={it.poster ? src(it.poster) : undefined}><source src={src(it.file)} type="video/mp4" />{it.webm && <source src={src(it.webm)} type="video/webm" />}</video>
    : <img src={src(it.file)} alt={it.title} />}<span>{it.credit ?? `${it.author} · ${it.license}`}</span></div></Frame>;
}

/** A still rendered from the app's real 3D anatomy models (pipeline/build-rep-stills.ts overlays + HuBMAP / BodyParts3D /
 *  Z-Anatomy meshes) — the audio app shows rendered anatomy, never a drawing of it. */
function Render3D({ k, title, caption }: { k: string; title: string; caption: string }) {
  return <Frame title={title} real><div className="rv-realmedia rv-render"><img src={`visuals/${k}.webp`} alt={caption} /><span>3D render · real anatomy models · {caption}</span></div></Frame>;
}
/** Real media could not load (offline before it was cached): say so rather than drawing a stand-in. */
function NoMedia({ what }: { what: string }) {
  return <Frame title="real media"><div className="rv-nomedia">The real {what} loads when you are online.</div></Frame>;
}
function Frame({ title, children, real = false }: { title: string; children: ReactNode; real?: boolean }) {
  return <div className={`rviz${real ? ' real' : ''}`}><div className="rviz-title">{title}</div>{children}</div>;
}
function PhaseVisual({beat}:{beat:MentalRepBeat}) {
  const title=beat.title.toLowerCase();
  if(beat.phase==='equipment') return <Frame title={beat.title}><svg viewBox="0 0 600 420"><rect className="rv-soft" x="75" y="95" width="120" height="85" rx="10"/><rect className="rv-soft" x="240" y="95" width="120" height="85" rx="10"/><rect className="rv-soft" x="405" y="95" width="120" height="85" rx="10"/><path className="rv-line gold" d="M135 220h330"/><circle className="rv-dot" cx="135" cy="220" r="7"/><circle className="rv-dot" cx="300" cy="220" r="7"/><circle className="rv-dot" cx="465" cy="220" r="7"/><text className="small" x="135" y="138">PRIMARY</text><text className="small" x="300" y="138">BACKUP</text><text className="small" x="465" y="138">RESCUE</text><text className="small" x="300" y="280">prepare the whole system before starting</text></svg></Frame>;
  if(beat.phase==='decision') return <Frame title={beat.title}><svg viewBox="0 0 600 420"><circle className="rv-ring gold" cx="300" cy="100" r="38"/><path className="rv-line" d="M300 138v58M300 196L175 285M300 196l125 89"/><rect className="rv-soft" x="80" y="285" width="190" height="70" rx="10"/><rect className="rv-soft" x="330" y="285" width="190" height="70" rx="10"/><text className="small" x="300" y="105">MODEL</text><text className="small" x="175" y="322">IF THIS IS TRUE</text><text className="small" x="425" y="322">WHAT WOULD REFUTE IT?</text></svg></Frame>;
  if(beat.phase==='complication') return <Frame title={beat.title}><svg viewBox="0 0 600 420"><path className="rv-line gold" d="M85 210h155"/><circle className="rv-ring gold" cx="300" cy="210" r="54"/><path className="rv-line bad" d="M338 172l95-95M338 248l95 95"/><path className="rv-line" d="M354 210h155"/><text className="small" x="300" y="214">STOP</text><text className="small" x="445" y="63">PATIENT?</text><text className="small" x="455" y="370">DEVICE?</text><text className="small" x="472" y="198">MODEL?</text></svg></Frame>;
  if(beat.phase==='confirmation') return <Frame title={beat.title}><svg viewBox="0 0 600 420"><circle className="rv-ring gold" cx="180" cy="205" r="62"/><path className="rv-line gold" d="M145 205l25 28 52-68"/><path className="rv-line" d="M242 205h120"/><path className="rv-wave" d="M362 205h28l12-50 18 92 18-62 18 20h70"/><text className="small" x="180" y="305">confirm placement / function</text><text className="small" x="446" y="305">then confirm physiology</text></svg></Frame>;
  if(beat.phase==='debrief') return <Frame title={beat.title}><svg viewBox="0 0 600 420"><path className="rv-line gold" d="M95 125h410M95 210h410M95 295h410"/><circle className="rv-dot" cx="145" cy="125" r="8"/><circle className="rv-dot" cx="145" cy="210" r="8"/><circle className="rv-dot" cx="145" cy="295" r="8"/><text className="small" x="310" y="115">what was the goal?</text><text className="small" x="310" y="200">what changed?</text><text className="small" x="310" y="285">what would you do differently next time?</text></svg></Frame>;
  if(beat.phase==='sequence') return <Frame title={beat.title}><svg viewBox="0 0 600 420"><circle className="rv-ring gold" cx="120" cy="210" r="34"/><circle className="rv-ring" cx="300" cy="210" r="34"/><circle className="rv-ring" cx="480" cy="210" r="34"/><path className="rv-line gold" d="M154 210h112M334 210h112"/><text className="small" x="120" y="215">1</text><text className="small" x="300" y="215">2</text><text className="small" x="480" y="215">3</text><text className="small" x="300" y="290">deliberate sequence · reassess between irreversible steps</text></svg></Frame>;
  return <Frame title={beat.title}><svg viewBox="0 0 600 420"><circle className="rv-ring" cx="300" cy="210" r="120"/><circle className="rv-ring gold" cx="300" cy="210" r="70"/><path className="rv-line" d="M80 210h440M300 50v320"/><circle className="rv-dot" cx="300" cy="210" r="8"/><text className="small" x="300" y="365">{title}</text></svg></Frame>;
}
function EpiPrep({step}:{step:'source'|'flush'|'dilute'|'label'}){
  const title=step==='source'?'read the source concentration':step==='flush'?'leave 9 mL saline':step==='dilute'?'100 mcg ÷ 10 mL = 10 mcg/mL':'label before it leaves your hand';
  return <Frame title={title}><svg viewBox="0 0 600 420">
    <rect className="rv-soft" x="55" y="80" width="190" height="78" rx="12"/><text className="small" x="150" y="105">CARDIAC EPINEPHRINE</text><text x="150" y="132">1 mg / 10 mL</text><text className="small" x="150" y="150">100 mcg/mL source</text>
    <rect className="rv-soft" x="55" y="215" width="300" height="48" rx="22"/><path className="rv-line" d="M325 215v48"/><text className="small" x="190" y="244">{step==='flush'?'9 mL saline remains':step==='dilute'||step==='label'?'9 mL saline + 1 mL epi':'10 mL saline flush'}</text>
    {step==='flush'&&<><path className="rv-line bad" d="M355 239h95"/><text className="small" x="455" y="232">EXPEL 1 mL</text></>}
    {(step==='dilute'||step==='label')&&<><path className="rv-line gold" d="M245 158v54"/><text className="small" x="330" y="188">DRAW 1 mL SOURCE</text><text className="big" x="390" y="290">10 mcg/mL</text></>}
    {step==='label'&&<><rect className="rv-label" x="315" y="315" width="225" height="62" rx="8"/><text x="427" y="340">EPINEPHRINE</text><text className="small" x="427" y="360">10 mcg/mL</text></>}
    {step==='source'&&<><path className="rv-line gold" d="M275 119h205"/><text className="small" x="382" y="105">0.1 mg/mL</text><text className="small" x="382" y="136">= 100 mcg/mL</text></>}
  </svg></Frame>;
}
function Medication(){return <Frame title="one drug · one workspace"><svg viewBox="0 0 600 420"><rect className="rv-soft" x="82" y="95" width="120" height="210" rx="12"/><rect className="rv-ink" x="107" y="70" width="70" height="35" rx="5"/><text x="142" y="182">VIAL</text><path className="rv-line gold" d="M245 210h245"/><rect className="rv-soft" x="235" y="187" width="250" height="46" rx="20"/><path className="rv-line" d="M460 187v46"/><rect className="rv-label" x="275" y="260" width="165" height="62" rx="6"/><text x="357" y="286">LABEL</text><text className="small" x="357" y="305">drug · concentration</text></svg></Frame>}
function Monitor(){return <Frame title="physiology is the endpoint"><svg viewBox="0 0 600 420"><text className="big" x="86" y="95">82/48</text><text className="small" x="89" y="120">MAP 59</text><path className="rv-wave" d="M55 245l45 0 14-20 12 82 16-120 17 58 25 0 18-28 14 90 17-126 18 64 28 0 15-22 14 84 18-120 16 58 44 0 15-24 15 86 19-126 18 64 48 0"/><circle className="rv-dot" cx="500" cy="92" r="7"/><text className="small" x="475" y="120">REASSESS</text></svg></Frame>}
function Blood(){return <Frame title="product → filter → patient"><svg viewBox="0 0 600 420"><path className="rv-bag" d="M95 65h145v175c0 28-22 50-50 50h-45c-28 0-50-22-50-50z"/><text x="167" y="138">RBC</text><path className="rv-line bad" d="M167 290v60h138"/><rect className="rv-soft" x="285" y="325" width="48" height="40" rx="4"/><text className="small" x="309" y="351">FILTER</text><path className="rv-line" d="M333 345h125l55-60"/><circle className="rv-ring gold" cx="522" cy="270" r="25"/><text className="small" x="455" y="390">verify identity before connection</text></svg></Frame>}
function Transducer(){return <Frame title="the line is a measurement system"><svg viewBox="0 0 600 420"><circle className="rv-vessel" cx="95" cy="225" r="37"/><path className="rv-line" d="M132 225h155"/><rect className="rv-soft" x="287" y="190" width="72" height="70" rx="8"/><text className="small" x="323" y="230">ZERO</text><path className="rv-line" d="M359 225h105"/><rect className="rv-label" x="464" y="175" width="75" height="100" rx="8"/><text className="small" x="501" y="215">MON</text><path className="rv-line gold" d="M323 85v105"/><rect className="rv-soft" x="285" y="48" width="76" height="42" rx="8"/><text className="small" x="323" y="74">PRESSURE</text></svg></Frame>}
function ArtWave(){return <Frame title="read waveform + number"><svg viewBox="0 0 600 420"><path className="rv-grid" d="M60 90v260M160 90v260M260 90v260M360 90v260M460 90v260M560 90v260M60 140h500M60 210h500M60 280h500M60 350h500"/><path className="rv-wave" d="M60 315c22 0 33-12 42-80 8-60 21-96 35-96 19 0 35 71 55 98 14 19 27 28 44 32l14-20 15 32c20 24 37 34 60 34 22 0 34-13 43-80 9-60 22-96 36-96 20 0 36 72 56 98 15 19 27 28 44 32l14-20 15 32c17 22 35 34 77 34"/><text className="small" x="70" y="75">upstroke · systolic peak · dicrotic notch · runoff</text></svg></Frame>}
function SquareWave(){return <Frame title="dynamic response"><svg viewBox="0 0 600 420"><path className="rv-wave" d="M55 295h80v-150h145v150c10-65 25-65 35 0 10-43 22-43 31 0 9-28 19-28 27 0 8-17 17-17 24 0h145"/><text className="small" x="115" y="125">flush</text><text className="small" x="300" y="335">inspect oscillations after release</text></svg></Frame>}
function RealFast(){return <Frame title="real positive RUQ FAST" real><div className="rv-realmedia"><video controls playsInline muted poster="../imaging/real/fast-ruq-positive.jpg"><source src="../imaging/real/fast-ruq-positive.mp4" type="video/mp4"/><source src="../imaging/real/fast-ruq-positive.webm" type="video/webm"/></video><span>Gillman et al. · CC BY 2.0</span></div></Frame>}
function RealIjv(){return <Frame title="real IJV long-axis clip" real><div className="rv-realmedia"><video controls playsInline muted poster="../imaging/real/ijv-2026-video-s2.jpg"><source src="../imaging/real/ijv-2026-video-s2.mp4" type="video/mp4"/><source src="../imaging/real/ijv-2026-video-s2.webm" type="video/webm"/></video><span>Shaul et al. · CC BY 4.0</span></div></Frame>}
function Drain({active}:{active:boolean}){return <Frame title={active?'water seal: read the system':'build the drain system'}><svg viewBox="0 0 600 420"><path className="rv-line" d="M90 95v80c0 25 18 42 44 42h80v80"/><rect className="rv-soft" x="180" y="275" width="315" height="105" rx="10"/><path className="rv-water" d="M195 345h285v25H195z"/><path className={active?'rv-bubble active':'rv-bubble'} d="M250 345v-48M335 345v-62M420 345v-37"/><circle className="rv-ring gold" cx="90" cy="75" r="25"/><text className="small" x="225" y="404">patient → tubing → unit → chambers</text></svg></Frame>}
function Vent(){return <Frame title="patient → tube → circuit → ventilator"><svg viewBox="0 0 600 420"><circle className="rv-head" cx="110" cy="160" r="60"/><path className="rv-line" d="M165 170h170"/><path className="rv-line gold" d="M265 170v75"/><rect className="rv-soft" x="335" y="85" width="160" height="215" rx="15"/><path className="rv-wave" d="M360 225h25l12-70 18 115 16-45h37"/><text className="small" x="362" y="120">VENT</text><text className="small" x="200" y="150">trace the circuit</text></svg></Frame>}
function Sedation(){return <Frame title="analgesia + sedation + goal"><svg viewBox="0 0 600 420"><rect className="rv-label" x="75" y="85" width="135" height="70" rx="8"/><text className="small" x="142" y="112">PAIN?</text><text className="small" x="142" y="135">analgesia</text><rect className="rv-soft" x="232" y="85" width="135" height="70" rx="8"/><text className="small" x="299" y="112">TARGET</text><text className="small" x="299" y="135">RASS / exam</text><rect className="rv-soft" x="389" y="85" width="135" height="70" rx="8"/><text className="small" x="456" y="112">PHYSIOLOGY</text><text className="small" x="456" y="135">BP · HR · vent</text><path className="rv-line gold" d="M142 155v110h314v-110"/><rect className="rv-soft" x="210" y="265" width="180" height="72" rx="9"/><text className="small" x="300" y="296">REASSESS TARGET</text><text className="small" x="300" y="317">not just the infusion</text></svg></Frame>}
function Crrt(){return <Frame title="CRRT · trace every fluid path"><svg viewBox="0 0 600 420">
  <circle className="rv-ring gold" cx="65" cy="205" r="34"/><text className="small" x="65" y="209">PATIENT</text>
  <path className="rv-line bad" d="M99 180h88"/><text className="small" x="143" y="165">ACCESS</text><circle className="rv-dot" cx="182" cy="180" r="6"/><text className="small" x="182" y="145">P access</text>
  <circle className="rv-soft" cx="235" cy="180" r="38"/><text className="small" x="235" y="184">PUMP</text>
  <path className="rv-line bad" d="M273 180h47"/><rect className="rv-soft" x="320" y="115" width="120" height="135" rx="12"/><text className="small" x="380" y="170">FILTER</text><text className="small" x="380" y="191">TMP / resistance</text>
  <path className="rv-line gold" d="M440 180h82q28 0 28 30v82q0 36-42 36H100q-35 0-35-72"/><circle className="rv-dot" cx="510" cy="180" r="6"/><text className="small" x="500" y="154">P return</text><text className="small" x="492" y="350">RETURN</text>
  <path className="rv-line" d="M350 55v60"/><text className="small" x="350" y="40">DIALYSATE</text><path className="rv-line" d="M410 55v60"/><text className="small" x="430" y="40">REPLACEMENT</text>
  <path className="rv-line" d="M380 250v83"/><text className="small" x="380" y="358">EFFLUENT</text><text className="small" x="245" y="390">effluent dose ≠ net patient fluid removal</text>
</svg></Frame>}
function Ecmo({mode}:{mode:string}){return <Frame title="ECMO · trace drainage → pump → membrane → return"><svg viewBox="0 0 600 420">
  <circle className="rv-ring gold" cx="58" cy="205" r="34"/><text className="small" x="58" y="209">PATIENT</text>
  <path className="rv-line bad" d="M92 177h94"/><text className="small" x="140" y="158">DRAINAGE</text><path className="rv-wave" d="M110 195h18l9-10 9 20 9-10h18"/>
  <circle className="rv-soft" cx="230" cy="177" r="40"/><text className="small" x="230" y="171">PUMP</text><text className="small" x="230" y="190">RPM ≠ FLOW</text>
  <path className="rv-line" d="M270 177h55"/><rect className="rv-soft" x="325" y="110" width="128" height="134" rx="18"/><text className="small" x="389" y="165">MEMBRANE</text><text className="small" x="389" y="185">LUNG</text>
  <path className="rv-line gold" d="M453 177h82q25 0 25 28v92q0 32-42 32H92q-34 0-34-71"/><text className="small" x="505" y="158">RETURN</text>
  <path className="rv-line" d="M389 52v58"/><text className="small" x="389" y="35">SWEEP GAS</text><path className="rv-line" d="M325 275h128"/><text className="small" x="389" y="298">pre/post membrane check</text>
  {mode==='ecmo-return'&&<><path className="rv-wave" d="M300 347h34l13-37 18 68 18-31h62"/><text className="small" x="378" y="397">native circulation + circuit return</text></>}
</svg></Frame>}
function Iabp({errors}:{errors:boolean}){return <Frame title={errors?'IABP timing errors':'IABP timing · use the arterial trace'}><svg viewBox="0 0 600 420">
  <path className="rv-grid" d="M45 98v250M145 98v250M245 98v250M345 98v250M445 98v250M545 98v250M45 150h510M45 220h510M45 290h510M45 350h510"/>
  <path className="rv-wave" d="M48 315q23-172 50 0q16 0 28-50q15 72 44 50q23-172 50 0q16 0 28-50q15 72 44 50q23-172 50 0q16 0 28-50q15 72 44 50q23-172 50 0"/>
  <circle className="rv-dot" cx="126" cy="265" r="6"/><circle className="rv-dot" cx="248" cy="265" r="6"/><text className="small" x="187" y="246">DICROTIC NOTCH</text>
  <path className={errors?'rv-line bad':'rv-line gold'} d={errors?'M108 125v218M295 125v218':'M128 125v218M315 125v218'}/><text className="small" x="392" y="88">TRIGGER · arterial / ECG</text>
  <text className="small" x="330" y="375">{errors?'compare marker with notch and next systolic upstroke':'inflate at closure · deflate before next systole'}</text>
  <text className="small" x="126" y="344">assisted EDP</text><text className="small" x="248" y="344">augmentation</text>
</svg></Frame>}
function Seizure({mode}:{mode:string}){return <Frame title={mode==='seizure-eeg'?'convulsions stopped · brain may not have':'status is a time problem'}><svg viewBox="0 0 600 420">{mode==='seizure-eeg'?<><path className="rv-wave" d="M55 210l18-60 18 118 18-96 18 62 18-112 18 142 18-110 18 56 18-82 18 108 18-74 18 38 18-95 18 133 18-118 18 92 18-62 18 42 18-78 18 100 18-56 18 22"/><text className="small" x="300" y="310">persistent altered state → consider EEG</text></>:<><path className="rv-line gold" d="M75 220h450"/><circle className="rv-dot" cx="140" cy="220" r="9"/><circle className="rv-dot" cx="295" cy="220" r="9"/><circle className="rv-dot" cx="450" cy="220" r="9"/><text className="small" x="140" y="190">recognize</text><text className="small" x="295" y="190">first-line</text><text className="small" x="450" y="190">escalate</text><text className="small" x="300" y="278">do not restart the same ineffective loop</text></>}</svg></Frame>}

