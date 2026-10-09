import { useEffect, useState, type ReactNode } from 'react';
import type { MentalRepBeat } from './types';

export function RepVisual({ beat }: { beat: MentalRepBeat }) {
  const key = beat.visual ?? beat.phase;
  if (key === 'efast-ruq') return <RealFast />;
  if (key === 'ijv-real') return <RealIjv />;
  if (key === 'medication-prep') return <Medication />;
  if (key === 'epi-source') return <EpiPrep step="source" />;
  if (key === 'epi-flush') return <EpiPrep step="flush" />;
  if (key === 'epi-dilution') return <EpiPrep step="dilute" />;
  if (key === 'epi-label') return <EpiPrep step="label" />;
  if (key === 'monitor-response') return <Monitor />;
  if (key === 'blood-circuit') return <Blood />;
  if (key === 'artery-ultrasound') return <RealRep k={key} fallback={<ArteryUs />} />;
  if (key === 'transducer-system') return <Transducer />;
  if (key === 'arterial-waveform') return <ArtWave />;
  if (key === 'square-wave-test') return <SquareWave />;
  if (key === 'efast-map') return <EfastMap />;
  if (key === 'efast-luq' || key === 'efast-pelvis' || key === 'efast-cardiac' || key === 'efast-lung') return <RealRep k={key} fallback={<UsWindow name={key.replace('efast-', '').toUpperCase()} />} />;
  if (key === 'chest-wall-anatomy') return <RealRep k={key} fallback={<ChestWall />} />;
  if (key === 'drain-system' || key === 'drain-water-seal') return <RealRep k={key} fallback={<Drain active={key === 'drain-water-seal'} />} />;
  if (key === 'evd-level') return <Evd />;
  if (key === 'vent-check') return <Vent />;
  if (key === 'io-landmark') return <RealRep k={key} fallback={<Io />} />;
  if (key === 'piv-map' || key === 'piv-tip') return <RealRep k={key} fallback={<Piv mode={key} />} />;
  if (key === 'piv-confirm') return <Piv mode={key} />;
  if (key === 'airway-overview' || key === 'airway-preoxygenation') return <Airway mode={key} />;
  if (key === 'post-tube') return <RealRep k={key} fallback={<PostTube />} />;
  if (key === 'sedation-lines') return <Sedation />;
  if (key.startsWith('pac-')) return <Pac chamber={key.replace('pac-','')} />;
  if (key === 'crrt-circuit') return <Crrt />;
  if (key === 'ecmo-circuit' || key === 'ecmo-return') return <Ecmo mode={key} />;
  if (key === 'iabp-wave' || key === 'iabp-errors') return <Iabp errors={key === 'iabp-errors'} />;
  if (key === 'seizure-timeline' || key === 'seizure-eeg') return <Seizure mode={key} />;
  if (key === 'pocus-lung' || key === 'pocus-venous' || key === 'pocus-abdomen') return <RealRep k={key} fallback={<Pocus mode={key} />} />;
  if (key.startsWith('pocus-')) return <Pocus mode={key} />;
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
  'artery-ultrasound': { keys: ['radial_artery_us'], title: 'real artery ultrasound' },
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
function ArteryUs(){return <Frame title="keep the tip in view"><svg viewBox="0 0 600 420"><path className="rv-sector" d="M300 65L90 365h420z"/><circle className="rv-vessel" cx="305" cy="255" r="55"/><path className="rv-needle" d="M110 130L294 244"/><circle className="rv-dot" cx="294" cy="244" r="7"/><text className="small" x="330" y="260">artery</text><text className="small" x="95" y="112">needle</text></svg></Frame>}
function Transducer(){return <Frame title="the line is a measurement system"><svg viewBox="0 0 600 420"><circle className="rv-vessel" cx="95" cy="225" r="37"/><path className="rv-line" d="M132 225h155"/><rect className="rv-soft" x="287" y="190" width="72" height="70" rx="8"/><text className="small" x="323" y="230">ZERO</text><path className="rv-line" d="M359 225h105"/><rect className="rv-label" x="464" y="175" width="75" height="100" rx="8"/><text className="small" x="501" y="215">MON</text><path className="rv-line gold" d="M323 85v105"/><rect className="rv-soft" x="285" y="48" width="76" height="42" rx="8"/><text className="small" x="323" y="74">PRESSURE</text></svg></Frame>}
function ArtWave(){return <Frame title="read waveform + number"><svg viewBox="0 0 600 420"><path className="rv-grid" d="M60 90v260M160 90v260M260 90v260M360 90v260M460 90v260M560 90v260M60 140h500M60 210h500M60 280h500M60 350h500"/><path className="rv-wave" d="M60 315c22 0 33-12 42-80 8-60 21-96 35-96 19 0 35 71 55 98 14 19 27 28 44 32l14-20 15 32c20 24 37 34 60 34 22 0 34-13 43-80 9-60 22-96 36-96 20 0 36 72 56 98 15 19 27 28 44 32l14-20 15 32c17 22 35 34 77 34"/><text className="small" x="70" y="75">upstroke · systolic peak · dicrotic notch · runoff</text></svg></Frame>}
function SquareWave(){return <Frame title="dynamic response"><svg viewBox="0 0 600 420"><path className="rv-wave" d="M55 295h80v-150h145v150c10-65 25-65 35 0 10-43 22-43 31 0 9-28 19-28 27 0 8-17 17-17 24 0h145"/><text className="small" x="115" y="125">flush</text><text className="small" x="300" y="335">inspect oscillations after release</text></svg></Frame>}
function EfastMap(){return <Frame title="a repeatable sweep"><svg viewBox="0 0 600 420"><path className="rv-body" d="M300 55c-42 0-66 31-66 71v35c-62 30-94 84-92 163h316c2-79-30-133-92-163v-35c0-40-24-71-66-71z"/><circle className="rv-dot" cx="215" cy="210" r="10"/><circle className="rv-dot" cx="385" cy="210" r="10"/><circle className="rv-dot" cx="300" cy="285" r="10"/><circle className="rv-dot" cx="300" cy="180" r="10"/><circle className="rv-dot" cx="195" cy="150" r="8"/><circle className="rv-dot" cx="405" cy="150" r="8"/><text className="small" x="155" y="352">RUQ · LUQ · pelvis · heart · pleura</text></svg></Frame>}
function UsWindow({name}:{name:string}){return <Frame title={name}><svg viewBox="0 0 600 420"><path className="rv-sector" d="M300 62L95 365h410z"/><ellipse className="rv-organ" cx="255" cy="218" rx="110" ry="68"/><ellipse className="rv-vessel" cx="354" cy="270" rx="55" ry="32"/><path className="rv-fluid" d="M275 253q63 18 118-4q-40 42-96 37z"/><text className="small" x="180" y="132">sweep, do not snapshot</text></svg></Frame>}
function RealFast(){return <Frame title="real positive RUQ FAST" real><div className="rv-realmedia"><video controls playsInline muted poster="../imaging/real/fast-ruq-positive.jpg"><source src="../imaging/real/fast-ruq-positive.mp4" type="video/mp4"/><source src="../imaging/real/fast-ruq-positive.webm" type="video/webm"/></video><span>Gillman et al. · CC BY 2.0</span></div></Frame>}
function RealIjv(){return <Frame title="real IJV long-axis clip" real><div className="rv-realmedia"><video controls playsInline muted poster="../imaging/real/ijv-2026-video-s2.jpg"><source src="../imaging/real/ijv-2026-video-s2.mp4" type="video/mp4"/><source src="../imaging/real/ijv-2026-video-s2.webm" type="video/webm"/></video><span>Shaul et al. · CC BY 4.0</span></div></Frame>}
function ChestWall(){return <Frame title="orient to the safe triangle"><svg viewBox="0 0 600 420">
  <path className="rv-body" d="M70 55q120-35 230 25q110-60 230-25v255q-115 45-230 5q-115 40-230-5z"/>
  <path className="rv-line" d="M170 92q40 95 58 208M430 92q-40 95-58 208"/>
  <path className="rv-line gold" d="M228 300h144M228 300L285 115M372 300L315 115"/>
  <text className="small" x="160" y="78">pectoralis major</text><text className="small" x="440" y="78">latissimus dorsi</text>
  <text className="small" x="300" y="333">~5th intercostal-space level</text><text className="small" x="300" y="105">apex below axilla</text>
  <circle className="rv-dot" cx="300" cy="235" r="9"/><text className="small" x="300" y="218">target zone</text>
  <g transform="translate(82 315) scale(.62)">
    <ellipse className="rv-rib" cx="195" cy="45" rx="60" ry="24"/><ellipse className="rv-rib" cx="405" cy="45" rx="60" ry="24"/>
    <path className="rv-line bad" d="M195 68v25"/><path className="rv-line gold" d="M405 18v-24"/>
    <text className="small" x="195" y="112">bundle under rib</text><text className="small" x="405" y="-12">enter over rib below</text>
  </g>
</svg></Frame>}
function Drain({active}:{active:boolean}){return <Frame title={active?'water seal: read the system':'build the drain system'}><svg viewBox="0 0 600 420"><path className="rv-line" d="M90 95v80c0 25 18 42 44 42h80v80"/><rect className="rv-soft" x="180" y="275" width="315" height="105" rx="10"/><path className="rv-water" d="M195 345h285v25H195z"/><path className={active?'rv-bubble active':'rv-bubble'} d="M250 345v-48M335 345v-62M420 345v-37"/><circle className="rv-ring gold" cx="90" cy="75" r="25"/><text className="small" x="225" y="404">patient → tubing → unit → chambers</text></svg></Frame>}
function Evd(){return <Frame title="patient reference → level → ordered height"><svg viewBox="0 0 600 420">
  <circle className="rv-head" cx="175" cy="188" r="104"/><path className="rv-line" d="M111 190q64-45 128 0"/>
  <circle className="rv-dot" cx="238" cy="200" r="8"/><text className="small" x="177" y="225">TRAGUS / EAM</text>
  <path className="rv-line gold" d="M238 200h210"/><text className="small" x="338" y="186">ZERO REFERENCE</text>
  <circle className="rv-ring gold" cx="175" cy="185" r="18"/><text className="small" x="175" y="155">≈ FORAMEN OF MONRO LEVEL</text>
  <rect className="rv-soft" x="430" y="82" width="82" height="245" rx="8"/><path className="rv-water" d="M445 262h52v38h-52z"/>
  <path className="rv-line" d="M420 200h102M420 150h102M420 250h102"/><text className="small" x="470" y="64">DRAIN SCALE</text>
  <text className="small" x="300" y="365">re-level after any head / bed position change</text>
</svg></Frame>}
function Vent(){return <Frame title="patient → tube → circuit → ventilator"><svg viewBox="0 0 600 420"><circle className="rv-head" cx="110" cy="160" r="60"/><path className="rv-line" d="M165 170h170"/><path className="rv-line gold" d="M265 170v75"/><rect className="rv-soft" x="335" y="85" width="160" height="215" rx="15"/><path className="rv-wave" d="M360 225h25l12-70 18 115 16-45h37"/><text className="small" x="362" y="120">VENT</text><text className="small" x="200" y="150">trace the circuit</text></svg></Frame>}
function Io(){return <Frame title="proximal tibia · prove the bony landmark"><svg viewBox="0 0 600 420">
  <path className="rv-bone" d="M235 55c-38 28-48 88-30 142l34 123c8 29 29 46 61 46s53-17 61-46l34-123c18-54 8-114-30-142-38 19-92 19-130 0z"/>
  <circle className="rv-ring" cx="300" cy="157" r="18"/><text className="small" x="300" y="132">tibial tuberosity</text>
  <circle className="rv-dot" cx="280" cy="205" r="10"/><path className="rv-line gold" d="M280 205l-105-38"/>
  <text className="small" x="112" y="156">flat anteromedial target</text>
  <path className="rv-line bad" d="M300 75h115"/><text className="small" x="468" y="80">joint / growth-zone awareness</text>
  <text className="small" x="300" y="395">different site? restart with that device-specific landmark sequence</text>
</svg></Frame>}

function Piv({mode}:{mode:string}){return <Frame title="ultrasound-guided peripheral IV"><svg viewBox="0 0 600 420">
  <path className="rv-sector" d="M300 55L95 365h410z"/>
  <ellipse className="rv-vessel" cx="330" cy="245" rx="70" ry="44"/><text className="small" x="330" y="250">VEIN</text>
  <ellipse className="rv-ring" cx="215" cy="305" rx="38" ry="25"/><text className="small" x="215" y="310">ARTERY</text>
  <circle className="rv-ring gold" cx="420" cy="315" r="24"/><text className="small" x="420" y="320">NERVE</text>
  <path className="rv-needle" d="M125 135L308 233"/><circle className="rv-dot" cx="308" cy="233" r="7"/>
  {mode==='piv-map'&&<><path className="rv-line gold" d="M330 198v-62"/><text className="small" x="330" y="115">map depth · course · branch points</text><text className="small" x="300" y="385">target + artery + nerve + safe path</text></>}
  {mode==='piv-confirm'&&<><path className="rv-line gold" d="M310 235q48 20 95 0"/><text className="small" x="405" y="278">catheter intraluminal</text></>}
  <text className="small" x="150" y="120">true needle tip</text>
</svg></Frame>}
function Airway({mode}:{mode:string}){return <Frame title={mode==='airway-preoxygenation'?'preoxygenation + rescue':'airway plan before induction'}><svg viewBox="0 0 600 420">
  <circle className="rv-head" cx="145" cy="175" r="72"/><path className="rv-line gold" d="M118 126q58 2 85 38"/><path className="rv-line" d="M194 180q62 12 94 64"/>
  <path className="rv-soft" d="M74 150q35-52 82-12q28 24 18 65q-42 30-88 1q-23-24-12-54z"/><text className="small" x="123" y="222">MASK · SEAL</text>
  <rect className="rv-soft" x="36" y="286" width="132" height="54" rx="9"/><text className="small" x="102" y="309">SUCTION</text><text className="small" x="102" y="327">ON + IN REACH</text>
  <rect className="rv-soft" x="330" y="62" width="210" height="58" rx="10"/><text className="small" x="435" y="87">PLAN A · LARYNGOSCOPE</text><text className="small" x="435" y="105">TUBE · CUFF · BOUGIE</text>
  <rect className="rv-soft" x="330" y="145" width="210" height="58" rx="10"/><text className="small" x="435" y="170">BAG-MASK + ADJUNCTS</text><text className="small" x="435" y="188">CAPNOGRAPHY READY</text>
  <rect className="rv-soft" x="330" y="228" width="210" height="58" rx="10"/><text className="small" x="435" y="253">BACKUP SGA</text><text className="small" x="435" y="271">RESCUE OXYGENATION</text>
  <rect className="rv-soft" x="330" y="311" width="210" height="58" rx="10"/><text className="small" x="435" y="336">FRONT-OF-NECK KIT</text><text className="small" x="435" y="354">ROLE + LOCATION KNOWN</text>
  {mode==='airway-preoxygenation'&&<><path className="rv-wave" d="M188 325h70l16-35 18 70 17-35h42"/><text className="small" x="266" y="390">watch reserve · optimize before paralysis</text></>}
</svg></Frame>}
function PostTube(){return <Frame title="first five minutes"><svg viewBox="0 0 600 420"><circle className="rv-head" cx="95" cy="115" r="42"/><path className="rv-line gold" d="M125 120h105"/><rect className="rv-soft" x="230" y="84" width="105" height="72" rx="9"/><text className="small" x="282" y="112">ETCO₂</text><path className="rv-wave" d="M247 137h15v-16h32v16h22"/><path className="rv-line" d="M335 120h92"/><rect className="rv-soft" x="427" y="80" width="105" height="80" rx="9"/><text className="small" x="479" y="112">VENT</text><text className="small" x="479" y="132">SETTINGS</text><text className="big" x="90" y="285">86/50</text><text className="small" x="90" y="310">reassess pressure · oxygenation · sedation</text></svg></Frame>}
function Sedation(){return <Frame title="analgesia + sedation + goal"><svg viewBox="0 0 600 420"><rect className="rv-label" x="75" y="85" width="135" height="70" rx="8"/><text className="small" x="142" y="112">PAIN?</text><text className="small" x="142" y="135">analgesia</text><rect className="rv-soft" x="232" y="85" width="135" height="70" rx="8"/><text className="small" x="299" y="112">TARGET</text><text className="small" x="299" y="135">RASS / exam</text><rect className="rv-soft" x="389" y="85" width="135" height="70" rx="8"/><text className="small" x="456" y="112">PHYSIOLOGY</text><text className="small" x="456" y="135">BP · HR · vent</text><path className="rv-line gold" d="M142 155v110h314v-110"/><rect className="rv-soft" x="210" y="265" width="180" height="72" rx="9"/><text className="small" x="300" y="296">REASSESS TARGET</text><text className="small" x="300" y="317">not just the infusion</text></svg></Frame>}
function Pac({chamber}:{chamber:string}){const cfg:any={ra:['RA',38,12],rv:['RV',110,6],pa:['PA',110,28],wedge:['WEDGE',22,12]};const [name,sys,dia]=cfg[chamber]||cfg.ra;const order=['ra','rv','pa','wedge'];return <Frame title={"PA catheter · "+name}><svg viewBox="0 0 600 420">
  <path className="rv-line" d="M72 86v248"/><circle className={chamber==='ra'?'rv-dot':'rv-ring'} cx="72" cy="112" r="11"/><circle className={chamber==='rv'?'rv-dot':'rv-ring'} cx="72" cy="178" r="11"/><circle className={chamber==='pa'?'rv-dot':'rv-ring'} cx="72" cy="244" r="11"/><circle className={chamber==='wedge'?'rv-dot':'rv-ring'} cx="72" cy="310" r="11"/>
  <text className="small" x="112" y="117">RA · low pressure</text><text className="small" x="112" y="183">RV · systolic jump / low diastolic</text><text className="small" x="112" y="249">PA · diastolic step-up + notch</text><text className="small" x="112" y="315">WEDGE · balloon maneuver only</text>
  <path className="rv-grid" d="M320 92v245M390 92v245M460 92v245M530 92v245M300 145h270M300 215h270M300 285h270M300 337h270"/>
  <path className="rv-wave" d={chamber==='ra'?'M300 270q20-48 40 0q20 48 40 0q20-30 40 0q20 38 40 0q20-48 40 0q20 48 40 0q20-30 40 0':chamber==='wedge'?'M300 280q27-26 54 0q27 30 54 0q27-26 54 0q27 30 54 0q27-26 54 0':chamber==='rv'?'M300 315q20-180 45 0q20-180 45 0q20-180 45 0q20-180 45 0q20-180 45 0q20-180 45 0':'M300 315q20-160 45 0q10 0 18-28q12 40 27 28q20-160 45 0q10 0 18-28q12 40 27 28q20-160 45 0'}/>
  <text className="big" x="315" y="76">{name}</text><text className="small" x="515" y="76">{sys}/{dia} schematic</text>
  <text className="small" x="300" y="382">{chamber==='wedge'?'inflate only for measurement · deflate promptly':'waveform first · depth second'}</text>
</svg></Frame>}
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

function Pocus({mode}:{mode:string}) {
  if(mode==='pocus-map') return <Frame title="POCUS shock survey"><svg viewBox="0 0 600 420"><circle className="rv-head" cx="300" cy="80" r="42"/><path className="rv-body" d="M235 122q-80 48-72 194h274q8-146-72-194z"/><circle className="rv-dot" cx="300" cy="175" r="8"/><circle className="rv-dot" cx="225" cy="190" r="8"/><circle className="rv-dot" cx="375" cy="190" r="8"/><circle className="rv-dot" cx="245" cy="275" r="8"/><circle className="rv-dot" cx="355" cy="275" r="8"/><text className="small" x="300" y="365">heart · lungs · venous context · abdomen</text></svg></Frame>;
  if(mode==='pocus-heart') return <Frame title="cardiac windows · prove orientation"><svg viewBox="0 0 600 420">
    <path className="rv-body" d="M72 65q83-25 166 0l28 260H45z"/><circle className="rv-dot" cx="154" cy="252" r="8"/><text className="small" x="154" y="278">SUBXIPHOID</text>
    <circle className="rv-dot" cx="178" cy="145" r="8"/><text className="small" x="178" y="128">L STERNAL BORDER</text><circle className="rv-dot" cx="102" cy="205" r="8"/><text className="small" x="95" y="189">APEX</text>
    <path className="rv-line gold" d="M154 252q48-44 82-22"/><text className="small" x="220" y="247">liver window → heart</text>
    <path className="rv-soft" d="M340 142q52-66 104 0q56-66 105 0q15 78-105 137q-119-59-104-137z"/><path className="rv-line gold" d="M444 137v130"/>
    <text className="small" x="405" y="195">RV</text><text className="small" x="487" y="195">LV</text><text className="small" x="445" y="316">identify chambers before interpreting</text>
  </svg></Frame>;
  if(mode==='pocus-lung') return <Frame title="lung windows · prove the pleural line"><svg viewBox="0 0 600 420">
    <rect className="rv-soft" x="55" y="72" width="230" height="250" rx="10"/><ellipse className="rv-ring" cx="112" cy="150" rx="32" ry="55"/><ellipse className="rv-ring" cx="230" cy="150" rx="32" ry="55"/>
    <path className="rv-line gold" d="M112 213h118"/><text className="small" x="170" y="238">PLEURAL LINE</text><text className="small" x="112" y="105">RIB SHADOW</text><text className="small" x="230" y="105">RIB SHADOW</text>
    <path className="rv-body" d="M355 68h170v270H355z"/><path className="rv-line" d="M440 68v270M355 158h170M355 248h170"/>
    <circle className="rv-dot" cx="395" cy="115" r="6"/><circle className="rv-dot" cx="485" cy="115" r="6"/><circle className="rv-dot" cx="395" cy="205" r="6"/><circle className="rv-dot" cx="485" cy="205" r="6"/>
    <text className="small" x="440" y="368">match zones side-to-side · then interpret pattern</text>
  </svg></Frame>;
  if(mode==='pocus-venous') return <Frame title="IVC · prove vessel identity first"><svg viewBox="0 0 600 420">
    <path className="rv-organ" d="M62 110q110-70 218 20q-20 123-188 132q-56-65-30-152z"/><text className="small" x="137" y="165">LIVER WINDOW</text>
    <path className="rv-vessel" d="M220 98q28 96 10 230"/><path className="rv-line gold" d="M220 98q28 96 10 230"/><text className="small" x="255" y="182">IVC → RA</text>
    <path className="rv-ring" d="M330 98q-22 104 5 230"/><text className="small" x="360" y="180">AORTA</text>
    <path className="rv-wave" d="M405 242q22-68 44 0q22 42 44 0q22-68 44 0"/><text className="small" x="470" y="160">watch respiration</text><text className="small" x="470" y="295">course + wall + pulsatility</text>
    <text className="small" x="300" y="382">context for shock physiology · not an automatic fluid command</text>
  </svg></Frame>;
  if(mode==='pocus-abdomen') return <Frame title="abdominal anchors · repeatable sequence"><svg viewBox="0 0 600 420">
    <rect className="rv-soft" x="42" y="64" width="235" height="125" rx="10"/><text className="small" x="74" y="88">RUQ</text><ellipse className="rv-organ" cx="120" cy="130" rx="48" ry="30"/><ellipse className="rv-ring" cx="205" cy="138" rx="30" ry="22"/><path className="rv-line gold" d="M72 103h152"/><text className="small" x="158" y="178">liver · kidney · diaphragm</text>
    <rect className="rv-soft" x="323" y="64" width="235" height="125" rx="10"/><text className="small" x="355" y="88">LUQ</text><ellipse className="rv-organ" cx="405" cy="130" rx="40" ry="28"/><ellipse className="rv-ring" cx="492" cy="138" rx="30" ry="22"/><path className="rv-line gold" d="M354 103h165"/><text className="small" x="442" y="178">spleen · kidney · diaphragm</text>
    <rect className="rv-soft" x="42" y="225" width="235" height="125" rx="10"/><text className="small" x="74" y="250">PELVIS</text><ellipse className="rv-vessel" cx="160" cy="295" rx="62" ry="35"/><text className="small" x="160" y="300">BLADDER ANCHOR</text>
    <rect className="rv-soft" x="323" y="225" width="235" height="125" rx="10"/><text className="small" x="355" y="250">AORTA</text><ellipse className="rv-vessel" cx="438" cy="292" rx="38" ry="32"/><path className="rv-line gold" d="M438 324v38"/><text className="small" x="490" y="300">identify + follow distally</text>
    <text className="small" x="300" y="392">negative FAST ≠ retroperitoneum excluded · repeat when physiology changes</text>
  </svg></Frame>;
  return <Frame title="integrate the shock model"><svg viewBox="0 0 600 420"><circle className="rv-ring gold" cx="300" cy="205" r="64"/><text className="small" x="300" y="202">WORKING</text><text className="small" x="300" y="220">MODEL</text><circle className="rv-ring" cx="110" cy="120" r="42"/><circle className="rv-ring" cx="490" cy="120" r="42"/><circle className="rv-ring" cx="110" cy="310" r="42"/><circle className="rv-ring" cx="490" cy="310" r="42"/><path className="rv-line" d="M148 137l95 42M452 137l-95 42M148 293l95-42M452 293l-95-42"/><text className="small" x="110" y="124">HEART</text><text className="small" x="490" y="124">LUNG</text><text className="small" x="110" y="314">VEIN</text><text className="small" x="490" y="314">ABD</text></svg></Frame>;
}
