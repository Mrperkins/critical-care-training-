import type { ReactNode } from 'react';
import type { MentalRepBeat } from './types';
import { resolveRepVisualKey } from './repVisualRouting';

export function RepVisual({ beat, repId }: { beat: MentalRepBeat; repId?: string }) {
  const key = resolveRepVisualKey(repId, beat);
  if (key === 'efast-ruq') return <RealFast />;
  if (key === 'ijv-real') return <RealIjv />;
  if (key === 'medication-prep') return <Medication />;
  if (key === 'epi-source') return <EpiPrep step="source" />;
  if (key === 'epi-flush') return <EpiPrep step="flush" />;
  if (key === 'epi-dilution') return <EpiPrep step="dilute" />;
  if (key === 'epi-label') return <EpiPrep step="label" />;
  if (key === 'monitor-response') return <Monitor />;
  if (key === 'blood-circuit') return <Blood />;
  if (key === 'artery-ultrasound') return <ArteryUs />;
  if (key === 'ij-landmarks') return <IjLandmarks />;
  if (key === 'ij-setup') return <IjSetup />;
  if (key === 'transducer-system') return <Transducer />;
  if (key === 'arterial-waveform') return <ArtWave />;
  if (key === 'square-wave-test') return <SquareWave />;
  if (key === 'efast-map') return <EfastMap />;
  if (key === 'efast-luq' || key === 'efast-pelvis' || key === 'efast-cardiac' || key === 'efast-lung') return <UsWindow name={key.replace('efast-', '').toUpperCase()} />;
  if (key === 'chest-wall-anatomy') return <ChestWall />;
  if (key === 'drain-system' || key === 'drain-water-seal') return <Drain active={key === 'drain-water-seal'} />;
  if (key === 'evd-level') return <Evd />;
  if (key === 'vent-check') return <Vent />;
  if (key.startsWith('io-')) return <Io mode={key} />;
  if (key === 'piv-map' || key === 'piv-tip' || key === 'piv-confirm') return <Piv mode={key} />;
  if (key === 'airway-overview' || key === 'airway-preoxygenation') return <Airway mode={key} />;
  if (key === 'post-tube') return <PostTube />;
  if (key === 'sedation-lines') return <Sedation />;
  if (key.startsWith('pac-')) return <Pac chamber={key.replace('pac-','')} />;
  if (key === 'crrt-circuit') return <Crrt />;
  if (key === 'ecmo-circuit' || key === 'ecmo-return') return <Ecmo mode={key} />;
  if (key === 'iabp-wave' || key === 'iabp-errors') return <Iabp errors={key === 'iabp-errors'} />;
  if (key.startsWith('seizure-')) return <Seizure mode={key} />;
  if (key.startsWith('ij-sequence-')) return <IjSequence mode={key} />;
  if (key.startsWith('mtp-')) return <Mtp mode={key} />;
  if (key.startsWith('eschar-')) return <Escharotomy mode={key} />;
  if (key.startsWith('finger-thorax-')) return <FingerThoracostomy mode={key} />;
  if (key.startsWith('cric-')) return <Cricothyrotomy mode={key} />;
  if (key.startsWith('pericard-')) return <Pericardiocentesis mode={key} />;
  if (key.startsWith('thorac-')) return <Thoracentesis mode={key} />;
  if (key.startsWith('tvp-')) return <TransvenousPacing mode={key} />;
  if (key.startsWith('dialysis-')) return <DialysisCatheter mode={key} />;
  if (key.startsWith('pocus-')) return <Pocus mode={key} />;
  return <PhaseVisual beat={beat} />;
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
function ArteryUs(){return <Frame title="distal radial artery · surface map + ultrasound"><svg viewBox="0 0 600 420">
  <rect className="rv-soft" x="38" y="62" width="235" height="300" rx="12"/>
  <path className="rv-bone" d="M78 95q18 125 12 225"/><text className="small" x="88" y="82">RADIAL STYLOID</text>
  <path className="rv-line" d="M205 90q-22 125-18 240"/><text className="small" x="206" y="78">FCR TENDON</text>
  <path className="rv-line gold" d="M145 105q-6 112 2 220"/><circle className="rv-dot" cx="147" cy="212" r="7"/><text className="small" x="145" y="347">artery lies between tendon + styloid</text>
  <path className="rv-sector" d="M430 58L300 362h260z"/>
  <ellipse className="rv-vessel" cx="432" cy="252" rx="52" ry="36"/><text className="small" x="432" y="257">ARTERY</text>
  <ellipse className="rv-ring" cx="350" cy="300" rx="30" ry="20"/><text className="small" x="350" y="305">VEIN</text>
  <path className="rv-needle" d="M310 132L422 240"/><circle className="rv-dot" cx="422" cy="240" r="7"/>
  <text className="small" x="430" y="385">prove compressibility + pulse · reacquire true tip before every advance</text>
</svg></Frame>}
function Transducer(){return <Frame title="level the measurement system to the patient"><svg viewBox="0 0 600 420">
  <path className="rv-body" d="M42 72h205v250H42z"/><path className="rv-line" d="M145 72v250"/>
  <path className="rv-rib" d="M62 135h165M62 170h165M62 205h165M62 240h165"/>
  <circle className="rv-dot" cx="205" cy="240" r="8"/><text className="small" x="145" y="360">4th interspace × mid-axillary line</text>
  <path className="rv-line gold" d="M205 240h150"/><text className="small" x="280" y="225">HORIZONTAL LEVEL</text>
  <rect className="rv-soft" x="355" y="202" width="76" height="76" rx="8"/><text className="small" x="393" y="245">ZERO</text>
  <path className="rv-line" d="M431 240h80"/><rect className="rv-label" x="511" y="188" width="62" height="104" rx="8"/><text className="small" x="542" y="234">MON</text>
  <path className="rv-line gold" d="M393 98v104"/><rect className="rv-soft" x="354" y="55" width="78" height="44" rx="8"/><text className="small" x="393" y="82">PRESSURE</text>
  <text className="small" x="300" y="397">below reference = falsely high · above reference = falsely low</text>
</svg></Frame>}
function ArtWave(){return <Frame title="read waveform + number"><svg viewBox="0 0 600 420"><path className="rv-grid" d="M60 90v260M160 90v260M260 90v260M360 90v260M460 90v260M560 90v260M60 140h500M60 210h500M60 280h500M60 350h500"/><path className="rv-wave" d="M60 315c22 0 33-12 42-80 8-60 21-96 35-96 19 0 35 71 55 98 14 19 27 28 44 32l14-20 15 32c20 24 37 34 60 34 22 0 34-13 43-80 9-60 22-96 36-96 20 0 36 72 56 98 15 19 27 28 44 32l14-20 15 32c17 22 35 34 77 34"/><text className="small" x="70" y="75">upstroke · systolic peak · dicrotic notch · runoff</text></svg></Frame>}
function SquareWave(){return <Frame title="dynamic response"><svg viewBox="0 0 600 420"><path className="rv-wave" d="M55 295h80v-150h145v150c10-65 25-65 35 0 10-43 22-43 31 0 9-28 19-28 27 0 8-17 17-17 24 0h145"/><text className="small" x="115" y="125">flush</text><text className="small" x="300" y="335">inspect oscillations after release</text></svg></Frame>}
function EfastMap(){return <Frame title="a repeatable sweep"><svg viewBox="0 0 600 420"><path className="rv-body" d="M300 55c-42 0-66 31-66 71v35c-62 30-94 84-92 163h316c2-79-30-133-92-163v-35c0-40-24-71-66-71z"/><circle className="rv-dot" cx="215" cy="210" r="10"/><circle className="rv-dot" cx="385" cy="210" r="10"/><circle className="rv-dot" cx="300" cy="285" r="10"/><circle className="rv-dot" cx="300" cy="180" r="10"/><circle className="rv-dot" cx="195" cy="150" r="8"/><circle className="rv-dot" cx="405" cy="150" r="8"/><text className="small" x="155" y="352">RUQ · LUQ · pelvis · heart · pleura</text></svg></Frame>}
function UsWindow({name}:{name:string}){
  if(name==='RUQ') return <Frame title="RUQ · liver → kidney → diaphragm"><svg viewBox="0 0 600 420">
    <path className="rv-sector" d="M300 50L78 370h444z"/><ellipse className="rv-organ" cx="265" cy="200" rx="128" ry="76"/><text className="small" x="235" y="175">LIVER</text>
    <ellipse className="rv-ring" cx="365" cy="257" rx="58" ry="38"/><text className="small" x="365" y="262">R KIDNEY</text>
    <path className="rv-line gold" d="M130 145q170-100 340 0"/><text className="small" x="300" y="112">DIAPHRAGM</text>
    <path className="rv-fluid" d="M310 229q55 18 105 0q-48 33-96 28z"/><text className="small" x="432" y="232">HEPATORENAL RECESS</text>
    <text className="small" x="300" y="397">mid-axillary · sweep interface + inferior liver tip + lower thorax</text>
  </svg></Frame>;
  if(name==='LUQ') return <Frame title="LUQ · spleen → kidney → diaphragm"><svg viewBox="0 0 600 420">
    <path className="rv-sector" d="M300 50L78 370h444z"/><ellipse className="rv-organ" cx="260" cy="194" rx="94" ry="62"/><text className="small" x="245" y="190">SPLEEN</text>
    <ellipse className="rv-ring" cx="365" cy="260" rx="58" ry="38"/><text className="small" x="365" y="265">L KIDNEY</text>
    <path className="rv-line gold" d="M145 135q155-86 315 0"/><text className="small" x="300" y="105">DIAPHRAGM</text>
    <path className="rv-fluid" d="M300 230q52 20 105 0q-45 31-96 27z"/><text className="small" x="433" y="233">SPLENORENAL</text>
    <text className="small" x="300" y="397">posterior axillary · sweep splenorenal + subphrenic + lower thorax</text>
  </svg></Frame>;
  if(name==='PELVIS') return <Frame title="pelvis · pubic bone → bladder → dependent spaces"><svg viewBox="0 0 600 420">
    <path className="rv-sector" d="M300 50L78 370h444z"/><rect className="rv-bone" x="245" y="320" width="110" height="25" rx="10"/><text className="small" x="300" y="370">PUBIC SYMPHYSIS</text>
    <ellipse className="rv-vessel" cx="300" cy="235" rx="105" ry="72"/><text className="small" x="300" y="240">BLADDER</text>
    <path className="rv-fluid" d="M205 290q95 35 190 0q-70 65-190 0z"/><text className="small" x="425" y="305">DEPENDENT SPACE</text>
    <path className="rv-line gold" d="M170 180h260"/><text className="small" x="300" y="155">sweep transverse + longitudinal</text>
  </svg></Frame>;
  if(name==='CARDIAC') return <Frame title="subxiphoid · liver window → chambers → pericardium"><svg viewBox="0 0 600 420">
    <path className="rv-sector" d="M300 50L78 370h444z"/><ellipse className="rv-organ" cx="215" cy="280" rx="100" ry="55"/><text className="small" x="215" y="285">LIVER</text>
    <path className="rv-soft" d="M260 160q65-70 120 0q65-70 118 0q12 75-119 132q-132-57-119-132z"/><path className="rv-line gold" d="M379 155v128"/>
    <text className="small" x="330" y="210">RV</text><text className="small" x="425" y="210">LV</text><path className="rv-ring" d="M250 140q130-100 255 8"/>
    <text className="small" x="388" y="115">PERICARDIAL BOUNDARY</text><text className="small" x="300" y="397">xiphoid = inferior sternum · probe immediately below · flatten toward abdomen</text>
  </svg></Frame>;
  if(name==='LUNG') return <Frame title="lung · rib shadows prove the pleural line"><svg viewBox="0 0 600 420">
    <path className="rv-sector" d="M300 50L78 370h444z"/><ellipse className="rv-ring" cx="210" cy="180" rx="42" ry="78"/><ellipse className="rv-ring" cx="390" cy="180" rx="42" ry="78"/>
    <text className="small" x="210" y="92">RIB SHADOW</text><text className="small" x="390" y="92">RIB SHADOW</text><path className="rv-line gold" d="M210 270h180"/>
    <text className="small" x="300" y="300">PLEURAL LINE</text><path className="rv-wave" d="M230 330h45l15-20 18 40 18-20h44"/>
    <text className="small" x="300" y="397">watch sliding dynamically · compare matched zones · one absent sign is not the diagnosis</text>
  </svg></Frame>;
  return <Frame title={name}><svg viewBox="0 0 600 420"><text className="small" x="300" y="210">rebuild anatomy before interpretation</text></svg></Frame>;
}
function RealFast(){return <Frame title="real positive RUQ FAST" real><div className="rv-realmedia"><video controls playsInline muted poster="../imaging/real/fast-ruq-positive.jpg"><source src="../imaging/real/fast-ruq-positive.mp4" type="video/mp4"/><source src="../imaging/real/fast-ruq-positive.webm" type="video/webm"/></video><span>Gillman et al. · CC BY 2.0</span></div></Frame>}
function IjSetup(){return <Frame title="IJ sterile setup · lay out the entire Seldinger sequence"><svg viewBox="0 0 600 420">
  <rect className="rv-soft" x="35" y="58" width="160" height="92" rx="10"/><text className="small" x="115" y="86">MAXIMAL BARRIER</text><text className="small" x="115" y="106">cap · mask · gown · gloves</text><text className="small" x="115" y="126">large sterile drape</text>
  <rect className="rv-soft" x="220" y="58" width="160" height="92" rx="10"/><text className="small" x="300" y="86">STERILE PROBE</text><text className="small" x="300" y="106">cover probe + cable</text><text className="small" x="300" y="126">sterile gel outside</text>
  <rect className="rv-soft" x="405" y="58" width="160" height="92" rx="10"/><text className="small" x="485" y="86">CATHETER</text><text className="small" x="485" y="106">pre-flush every lumen</text><text className="small" x="485" y="126">close / cap ports</text>
  <path className="rv-line gold" d="M70 225h460"/><circle className="rv-dot" cx="95" cy="225" r="7"/><circle className="rv-dot" cx="180" cy="225" r="7"/><circle className="rv-dot" cx="270" cy="225" r="7"/><circle className="rv-dot" cx="360" cy="225" r="7"/><circle className="rv-dot" cx="450" cy="225" r="7"/><circle className="rv-dot" cx="530" cy="225" r="7"/>
  <text className="small" x="95" y="205">NEEDLE</text><text className="small" x="180" y="205">WIRE</text><text className="small" x="270" y="205">SCALPEL</text><text className="small" x="360" y="205">DILATOR</text><text className="small" x="450" y="205">CVC</text><text className="small" x="530" y="205">DRESS</text>
  <rect className="rv-label" x="75" y="285" width="180" height="58" rx="8"/><text className="small" x="165" y="312">LOCAL ANESTHETIC READY</text><text className="small" x="165" y="329">before puncture</text>
  <rect className="rv-label" x="345" y="285" width="180" height="58" rx="8"/><text className="small" x="435" y="312">SHARPS CONTAINER</text><text className="small" x="435" y="329">within reach</text>
  <text className="small" x="300" y="392">map first → sterile field → re-identify vein → needle enters</text>
</svg></Frame>}
function IjLandmarks(){return <Frame title="right IJ · surface triangle → ultrasound proof"><svg viewBox="0 0 600 420">
  <path className="rv-body" d="M82 45q95-25 190 0v285H82z"/><path className="rv-line" d="M128 84l48 218M226 84l-50 218M82 302h190"/>
  <text className="small" x="112" y="70">SCM STERNAL HEAD</text><text className="small" x="238" y="70">SCM CLAVICULAR HEAD</text><text className="small" x="178" y="325">CLAVICLE</text>
  <circle className="rv-dot" cx="158" cy="210" r="8"/><text className="small" x="118" y="232">CAROTID · medial</text>
  <circle className="rv-ring gold" cx="205" cy="210" r="16"/><text className="small" x="221" y="194">IJ target region</text>
  <path className="rv-sector" d="M430 60L300 356h260z"/><ellipse className="rv-ring" cx="394" cy="250" rx="42" ry="37"/><text className="small" x="394" y="255">CAROTID</text>
  <ellipse className="rv-vessel" cx="478" cy="245" rx="58" ry="38"/><text className="small" x="478" y="250">IJ</text>
  <path className="rv-line gold" d="M478 196v-58"/><text className="small" x="476" y="118">compress → release</text>
  <text className="small" x="430" y="388">sweep cephalad/caudad · inspect overlap · rotate to long axis</text>
</svg></Frame>}
function RealIjv(){return <Frame title="real IJV long-axis clip" real><div className="rv-realmedia"><video controls playsInline muted poster="../imaging/real/ijv-2026-video-s2.jpg"><source src="../imaging/real/ijv-2026-video-s2.mp4" type="video/mp4"/><source src="../imaging/real/ijv-2026-video-s2.webm" type="video/webm"/></video><span>Shaul et al. · CC BY 4.0</span></div></Frame>}
function ChestWall(){return <Frame title="count ribs → choose interspace by indication → cross-check safe triangle"><svg viewBox="0 0 600 420">
  <path className="rv-body" d="M42 45q118-32 220 20q36 18 76 0q102-52 220-20v300q-120 38-258 0q-138 38-258 0z"/>
  <path className="rv-line" d="M300 65v210"/><circle className="rv-dot" cx="300" cy="118" r="7"/><text className="small" x="300" y="101">STERNAL ANGLE · 2nd RIB</text>
  <path className="rv-rib" d="M115 145q185-48 370 0M105 180q195-48 390 0M96 215q204-48 408 0M90 250q210-48 420 0M86 285q214-48 428 0"/>
  <text className="small" x="520" y="148">2</text><text className="small" x="526" y="183">3</text><text className="small" x="530" y="218">4</text><text className="small" x="535" y="253">5</text><text className="small" x="538" y="288">6</text>
  <path className="rv-line gold" d="M404 303L455 118M404 303L340 115M340 115L455 118"/><text className="small" x="470" y="120">latissimus anterior edge</text><text className="small" x="334" y="95">pectoralis lateral edge</text>
  <circle className="rv-dot" cx="410" cy="232" r="8"/><text className="small" x="430" y="225">4th ICS · common PTX reference</text>
  <circle className="rv-dot" cx="407" cy="268" r="8"/><text className="small" x="430" y="284">5th ICS · fluid / hemothorax reference</text>
  <path className="rv-line bad" d="M112 321h115"/><text className="small" x="168" y="310">NV bundle hugs</text><text className="small" x="168" y="327">inferior rib border</text>
  <text className="small" x="300" y="392">target gap chosen → palpate rib below → enter over that rib’s superior border</text>
</svg></Frame>}
function Drain({active}:{active:boolean}){return <Frame title={active?'water seal: read the system':'build the drain system'}><svg viewBox="0 0 600 420"><path className="rv-line" d="M90 95v80c0 25 18 42 44 42h80v80"/><rect className="rv-soft" x="180" y="275" width="315" height="105" rx="10"/><path className="rv-water" d="M195 345h285v25H195z"/><path className={active?'rv-bubble active':'rv-bubble'} d="M250 345v-48M335 345v-62M420 345v-37"/><circle className="rv-ring gold" cx="90" cy="75" r="25"/><text className="small" x="225" y="404">patient → tubing → unit → chambers</text></svg></Frame>}
function Evd(){return <Frame title="ear landmark → horizontal zero → ordered chamber height"><svg viewBox="0 0 600 420">
  <circle className="rv-head" cx="145" cy="175" r="92"/><path className="rv-line" d="M80 175q65-44 128 0"/>
  <path className="rv-ring" d="M210 153q34 22 3 54q-18 20-36 0q-14-20 8-30q18-8 25-24"/><circle className="rv-dot" cx="188" cy="184" r="7"/>
  <text className="small" x="150" y="245">TRAGUS = cartilage in front of ear canal</text>
  <path className="rv-line gold" d="M188 184h230"/><text className="small" x="305" y="168">TRUE HORIZONTAL ZERO</text>
  <circle className="rv-ring gold" cx="145" cy="174" r="15"/><text className="small" x="145" y="143">≈ FOM</text>
  <rect className="rv-soft" x="414" y="66" width="104" height="268" rx="8"/><path className="rv-water" d="M434 265h62v42h-62z"/>
  <path className="rv-line" d="M405 184h122M405 134h122M405 234h122"/><text className="small" x="466" y="47">EVD SCALE</text>
  <circle className="rv-ring" cx="362" cy="317" r="25"/><text className="small" x="362" y="321">OFF?</text><path className="rv-line" d="M387 317h75"/>
  <text className="small" x="300" y="382">move? close ordered pathway → reposition → re-find patient reference → re-level → set height → restore ordered state</text>
</svg></Frame>}
function Vent(){return <Frame title="patient → tube → circuit → ventilator"><svg viewBox="0 0 600 420"><circle className="rv-head" cx="110" cy="160" r="60"/><path className="rv-line" d="M165 170h170"/><path className="rv-line gold" d="M265 170v75"/><rect className="rv-soft" x="335" y="85" width="160" height="215" rx="15"/><path className="rv-wave" d="M360 225h25l12-70 18 115 16-45h37"/><text className="small" x="362" y="120">VENT</text><text className="small" x="200" y="150">trace the circuit</text></svg></Frame>}
function Io({mode}:{mode:string}) {
  if(mode==='io-place') return <Frame title="stabilize · depth mark visible · drill 90° to bone"><svg viewBox="0 0 600 420">
    <path className="rv-bone" d="M245 115q-20 110-10 235h130q10-125-10-235z"/>
    <path className="rv-needle" d="M300 45v130"/><circle className="rv-dot" cx="300" cy="96" r="7"/>
    <text className="small" x="390" y="92">black depth mark still visible above skin before drilling</text>
    <path className="rv-line gold" d="M180 175h240"/><text className="small" x="300" y="160">skin surface</text>
    <text className="small" x="300" y="385">stabilize leg · driver perpendicular · stop after cortex gives and hub seats</text>
  </svg></Frame>;
  if(mode==='io-confirm') return <Frame title="extension set → flush → watch the limb"><svg viewBox="0 0 600 420">
    <rect className="rv-label" x="75" y="95" width="130" height="70" rx="10"/><text className="small" x="140" y="127">IO HUB</text><text className="small" x="140" y="147">STABLE</text>
    <path className="rv-line gold" d="M205 130h115"/><rect className="rv-soft" x="320" y="95" width="150" height="70" rx="10"/><text className="small" x="395" y="127">PRIMED EXTENSION</text><text className="small" x="395" y="147">SET</text>
    <path className="rv-line" d="M395 165v85"/><rect className="rv-soft" x="330" y="250" width="130" height="65" rx="10"/><text className="small" x="395" y="278">FLUSH</text><text className="small" x="395" y="298">per protocol</text>
    <text className="small" x="250" y="360">easy flow + no swelling around site = functional evidence</text>
  </svg></Frame>;
  if(mode==='io-comp') return <Frame title="swelling or pain outside expected pattern = stop"><svg viewBox="0 0 600 420">
    <path className="rv-bone" d="M255 70q-18 130-8 285h106q10-155-8-285z"/>
    <circle className="rv-ring gold" cx="300" cy="150" r="24"/><path className="rv-line bad" d="M245 150q55-58 110 0q-55 58-110 0z"/>
    <text className="small" x="300" y="230">new swelling / coolness / firmness</text>
    <text className="small" x="300" y="268">STOP INFUSION · reassess placement and limb perfusion</text>
    <text className="small" x="300" y="330">compartment pressure can rise even when the device initially worked</text>
  </svg></Frame>;
  return <Frame title="adult proximal tibia · build the landmark from the knee"><svg viewBox="0 0 600 420">
    <ellipse className="rv-ring" cx="300" cy="72" rx="78" ry="36"/><text className="small" x="300" y="77">PATELLA</text>
    <path className="rv-line" d="M300 108v46"/><circle className="rv-ring" cx="300" cy="168" r="18"/><text className="small" x="300" y="145">TIBIAL TUBEROSITY</text>
    <path className="rv-bone" d="M270 187q-22 88-14 180h88q8-92-14-180z"/>
    <path className="rv-line gold" d="M300 168l-45 48"/><circle className="rv-dot" cx="255" cy="216" r="10"/>
    <text className="small" x="157" y="211">~2 cm medial</text><text className="small" x="185" y="235">flat anteromedial tibia</text>
    <path className="rv-line" d="M105 88h100"/><text className="small" x="155" y="73">alternate anchor</text><text className="small" x="155" y="105">~3 cm below patella</text>
    <path className="rv-needle" d="M255 125v80"/><text className="small" x="390" y="195">needle 90° to bone</text>
    <text className="small" x="300" y="397">EZ-IO-style adult example · other sites/ages get their own landmark sequence</text>
  </svg></Frame>;
}
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
function Airway({mode}:{mode:string}){return <Frame title={mode==='airway-preoxygenation'?'position → preoxygenate → rescue':'airway plan before induction'}><svg viewBox="0 0 600 420">
  <circle className="rv-head" cx="145" cy="150" r="70"/><circle className="rv-dot" cx="195" cy="145" r="6"/><text className="small" x="190" y="128">EAM</text>
  <path className="rv-body" d="M72 220q70-35 146 0v118H72z"/><circle className="rv-dot" cx="178" cy="250" r="6"/><text className="small" x="162" y="276">STERNAL NOTCH</text>
  <path className="rv-line gold" d="M195 145l-17 105"/><text className="small" x="74" y="365">ramp when needed until ear-canal level aligns with sternal notch</text>
  <path className="rv-soft" d="M82 135q34-45 78-10q25 21 17 56q-40 25-82 0q-20-20-13-46z"/><text className="small" x="128" y="205">MASK · SEAL</text>
  <rect className="rv-soft" x="330" y="52" width="218" height="56" rx="10"/><text className="small" x="439" y="76">PLAN A · LARYNGOSCOPE</text><text className="small" x="439" y="94">TUBE · CUFF · BOUGIE</text>
  <rect className="rv-soft" x="330" y="130" width="218" height="56" rx="10"/><text className="small" x="439" y="154">SUCTION ON</text><text className="small" x="439" y="172">BAG-MASK + CAPNOGRAPHY</text>
  <rect className="rv-soft" x="330" y="208" width="218" height="56" rx="10"/><text className="small" x="439" y="232">BACKUP SGA</text><text className="small" x="439" y="250">RESCUE OXYGENATION</text>
  <rect className="rv-soft" x="330" y="286" width="218" height="56" rx="10"/><text className="small" x="439" y="310">FRONT-OF-NECK KIT</text><text className="small" x="439" y="328">ROLE + LOCATION KNOWN</text>
  {mode==='airway-preoxygenation'&&<path className="rv-wave" d="M220 322h55l14-32 17 64 16-32h45"/>}
</svg></Frame>}
function PostTube(){return <Frame title="first five minutes"><svg viewBox="0 0 600 420"><circle className="rv-head" cx="95" cy="115" r="42"/><path className="rv-line gold" d="M125 120h105"/><rect className="rv-soft" x="230" y="84" width="105" height="72" rx="9"/><text className="small" x="282" y="112">ETCO₂</text><path className="rv-wave" d="M247 137h15v-16h32v16h22"/><path className="rv-line" d="M335 120h92"/><rect className="rv-soft" x="427" y="80" width="105" height="80" rx="9"/><text className="small" x="479" y="112">VENT</text><text className="small" x="479" y="132">SETTINGS</text><text className="big" x="90" y="285">86/50</text><text className="small" x="90" y="310">reassess pressure · oxygenation · sedation</text></svg></Frame>}
function Sedation(){return <Frame title="analgesia + sedation + goal"><svg viewBox="0 0 600 420"><rect className="rv-label" x="75" y="85" width="135" height="70" rx="8"/><text className="small" x="142" y="112">PAIN?</text><text className="small" x="142" y="135">analgesia</text><rect className="rv-soft" x="232" y="85" width="135" height="70" rx="8"/><text className="small" x="299" y="112">TARGET</text><text className="small" x="299" y="135">RASS / exam</text><rect className="rv-soft" x="389" y="85" width="135" height="70" rx="8"/><text className="small" x="456" y="112">PHYSIOLOGY</text><text className="small" x="456" y="135">BP · HR · vent</text><path className="rv-line gold" d="M142 155v110h314v-110"/><rect className="rv-soft" x="210" y="265" width="180" height="72" rx="9"/><text className="small" x="300" y="296">REASSESS TARGET</text><text className="small" x="300" y="317">not just the infusion</text></svg></Frame>}
function Pac({chamber}:{chamber:string}){const cfg:any={ra:['RA',38,12],rv:['RV',110,6],pa:['PA',110,28],wedge:['WEDGE',22,12]};const [name,sys,dia]=cfg[chamber]||cfg.ra;return <Frame title={"PA catheter · "+name}><svg viewBox="0 0 600 420">
  <path className="rv-line" d="M72 86v248"/><circle className={chamber==='ra'?'rv-dot':'rv-ring'} cx="72" cy="112" r="11"/><circle className={chamber==='rv'?'rv-dot':'rv-ring'} cx="72" cy="178" r="11"/><circle className={chamber==='pa'?'rv-dot':'rv-ring'} cx="72" cy="244" r="11"/><circle className={chamber==='wedge'?'rv-dot':'rv-ring'} cx="72" cy="310" r="11"/>
  <text className="small" x="112" y="117">RA · a/c/v atrial waves</text><text className="small" x="112" y="183">RV · systolic jump / diastolic near 0</text><text className="small" x="112" y="249">PA · diastolic step-up + pulmonic notch</text><text className="small" x="112" y="315">WEDGE · atrial-type occlusion trace</text>
  <path className="rv-grid" d="M320 92v245M390 92v245M460 92v245M530 92v245M300 145h270M300 215h270M300 285h270M300 337h270"/>
  <path className="rv-wave" d={chamber==='ra'?'M300 270q20-48 40 0q20 48 40 0q20-30 40 0q20 38 40 0q20-48 40 0q20 48 40 0q20-30 40 0':chamber==='wedge'?'M300 280q27-26 54 0q27 30 54 0q27-26 54 0q27 30 54 0q27-26 54 0':chamber==='rv'?'M300 315q20-180 45 0q20-180 45 0q20-180 45 0q20-180 45 0q20-180 45 0q20-180 45 0':'M300 315q20-160 45 0q10 0 18-28q12 40 27 28q20-160 45 0q10 0 18-28q12 40 27 28q20-160 45 0'}/>
  <text className="big" x="315" y="76">{name}</text><text className="small" x="515" y="76">{sys}/{dia} schematic</text>
  {chamber==='ra'&&<><text className="small" x="335" y="190">a = atrial contraction</text><text className="small" x="335" y="212">c = early ventricular systole</text><text className="small" x="335" y="234">v = atrial filling</text></>}
  {chamber==='rv'&&<><text className="small" x="350" y="118">systolic rise</text><text className="small" x="350" y="340">diastolic returns low · no PA notch yet</text></>}
  {chamber==='pa'&&<><circle className="rv-dot" cx="363" cy="287" r="5"/><text className="small" x="430" y="276">dicrotic notch = pulmonic closure</text></>}
  {chamber==='wedge'&&<><text className="small" x="340" y="126">lower-amplitude atrial-type waveform</text><text className="small" x="340" y="340">measure at respiratory timing required · commonly end expiration</text></>}
  <text className="small" x="300" y="382">{chamber==='wedge'?'inflate only for measurement · deflate promptly':'waveform first · catheter depth second'}</text>
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
function DialysisCatheter({mode}:{mode:string}) {
  if(mode==='dialysis-pressure') return <Frame title="access pulls · return pushes"><svg viewBox="0 0 600 420">
    <circle className="rv-ring gold" cx="110" cy="210" r="48"/><text className="small" x="110" y="214">PATIENT</text>
    <path className="rv-line gold" d="M158 180h135"/><text className="small" x="225" y="162">ACCESS · usually NEGATIVE</text>
    <rect className="rv-soft" x="293" y="145" width="110" height="70" rx="10"/><text className="small" x="348" y="187">PUMP</text>
    <path className="rv-line" d="M403 240h115"/><text className="small" x="462" y="222">RETURN · POSITIVE</text>
    <path className="rv-line" d="M518 240q40 0 40-30q0-30-40-30"/><text className="small" x="300" y="330">more negative access = harder draw · higher positive return = harder push back</text>
  </svg></Frame>;
  if(mode==='dialysis-trace') return <Frame title="trace every centimeter from catheter to circuit"><svg viewBox="0 0 600 420">
    <rect className="rv-label" x="55" y="110" width="125" height="80" rx="10"/><text className="small" x="118" y="142">CATHETER</text><text className="small" x="118" y="161">2 LUMENS</text>
    <path className="rv-line gold" d="M180 135h115"/><path className="rv-line" d="M180 165h115"/>
    <rect className="rv-soft" x="295" y="105" width="130" height="90" rx="10"/><text className="small" x="360" y="137">CLAMPS · HUBS</text><text className="small" x="360" y="157">KINKS · LUERS</text>
    <path className="rv-line gold" d="M425 135h110"/><path className="rv-line" d="M425 165h110"/>
    <text className="small" x="300" y="285">look under patient · mattress edge · bed rail · dressing</text>
    <text className="small" x="300" y="335">read lumen labels · do not trust color alone</text>
  </svg></Frame>;
  if(mode==='dialysis-position') return <Frame title="patient position can change catheter geometry"><svg viewBox="0 0 600 420">
    <circle className="rv-head" cx="210" cy="100" r="48"/><path className="rv-body" d="M150 155q60-30 120 0v160H150z"/>
    <path className="rv-line gold" d="M220 135q20 70 45 110"/><text className="small" x="330" y="125">IJ: return head/neck toward neutral</text>
    <path className="rv-line" d="M270 300h120"/><text className="small" x="410" y="306">femoral: reduce hip flexion</text>
    <text className="small" x="300" y="370">watch pressures while position changes · reproducible improvement suggests geometry</text>
  </svg></Frame>;
  if(mode==='dialysis-test') return <Frame title="sterile lumen test · aspirate gently · never force"><svg viewBox="0 0 600 420">
    <rect className="rv-soft" x="75" y="90" width="130" height="70" rx="10"/><text className="small" x="140" y="132">CLAMPED</text>
    <path className="rv-line gold" d="M205 125h110"/><rect className="rv-label" x="315" y="92" width="120" height="66" rx="10"/><text className="small" x="375" y="131">SYRINGE</text>
    <path className="rv-line" d="M435 125h85"/><text className="small" x="300" y="230">remove lock per policy → release clamp → aspirate</text>
    <text className="small" x="300" y="275">free return? sluggish? none?</text>
    <text className="small" x="300" y="330">resistance / swelling / pain = STOP · do not push harder</text>
  </svg></Frame>;
  if(mode==='dialysis-reverse') return <Frame title="line reversal = temporary test or bridge"><svg viewBox="0 0 600 420">
    <rect className="rv-label" x="70" y="110" width="120" height="60" rx="10"/><text className="small" x="130" y="146">ACCESS</text>
    <rect className="rv-label" x="410" y="110" width="120" height="60" rx="10"/><text className="small" x="470" y="146">RETURN</text>
    <path className="rv-line gold" d="M190 125q110-80 220 0"/><path className="rv-line" d="M190 155q110 80 220 0"/>
    <text className="small" x="300" y="270">trace new blood direction out loud before restart</text>
    <text className="small" x="300" y="320">may increase recirculation · not a definitive normal configuration</text>
  </svg></Frame>;
  if(mode==='dialysis-escalate') return <Frame title="persistent dysfunction needs a catheter diagnosis"><svg viewBox="0 0 600 420">
    <circle className="rv-ring gold" cx="120" cy="130" r="40"/><text className="small" x="120" y="135">CLOT?</text>
    <circle className="rv-ring" cx="300" cy="130" r="40"/><text className="small" x="300" y="135">SHEATH?</text>
    <circle className="rv-ring" cx="480" cy="130" r="40"/><text className="small" x="480" y="135">TIP?</text>
    <path className="rv-line gold" d="M120 190h360"/><text className="small" x="300" y="230">protocolized thrombolytic · imaging · exchange · new access</text>
    <text className="small" x="300" y="320">do not improvise medication dose or keep repeating forceful bedside maneuvers</text>
  </svg></Frame>;
  if(mode==='dialysis-danger') return <Frame title="some alarms mean stop troubleshooting and treat the patient"><svg viewBox="0 0 600 420">
    <circle className="rv-ring gold" cx="300" cy="150" r="62"/><text className="small" x="300" y="155">STOP</text>
    <path className="rv-line bad" d="M175 275h250"/><text className="small" x="300" y="260">AIR · CRACK · OPEN HUB · BLEEDING</text>
    <text className="small" x="300" y="315">unstable infection · thrombosis symptoms · patient deterioration</text>
  </svg></Frame>;
  return <Frame title="dialysis catheter troubleshooting"><svg viewBox="0 0 600 420">
    <path className="rv-line gold" d="M75 180h450"/><circle className="rv-dot" cx="120" cy="180" r="7"/><circle className="rv-dot" cx="260" cy="180" r="7"/><circle className="rv-dot" cx="400" cy="180" r="7"/><circle className="rv-dot" cx="510" cy="180" r="7"/>
    <text className="small" x="120" y="160">PRESSURE</text><text className="small" x="260" y="160">TRACE</text><text className="small" x="400" y="160">TEST</text><text className="small" x="510" y="160">ESCALATE</text>
    <text className="small" x="300" y="300">mechanical causes first · never force a resistant lumen</text>
  </svg></Frame>;
}

function TransvenousPacing({mode}:{mode:string}) {
  if(mode==='tvp-setup') return <Frame title="temporary transvenous pacing system"><svg viewBox="0 0 600 420">
    <rect className="rv-soft" x="35" y="55" width="150" height="82" rx="10"/><text className="small" x="110" y="86">INTRODUCER</text><text className="small" x="110" y="108">SHEATH + US</text>
    <rect className="rv-soft" x="225" y="55" width="150" height="82" rx="10"/><text className="small" x="300" y="86">BIPOLAR LEAD</text><text className="small" x="300" y="108">BALLOON + MARKS</text>
    <rect className="rv-soft" x="415" y="55" width="150" height="82" rx="10"/><text className="small" x="490" y="86">GENERATOR</text><text className="small" x="490" y="108">RATE · OUTPUT · SENSE</text>
    <path className="rv-line gold" d="M110 220h380"/><circle className="rv-dot" cx="130" cy="220" r="7"/><circle className="rv-dot" cx="300" cy="220" r="7"/><circle className="rv-dot" cx="470" cy="220" r="7"/>
    <text className="small" x="130" y="202">ACCESS</text><text className="small" x="300" y="202">LEAD</text><text className="small" x="470" y="202">CAPTURE</text>
    <text className="small" x="300" y="340">transcutaneous pads stay on as backup while invasive pacing is built</text>
  </svg></Frame>;
  if(mode==='tvp-access') return <Frame title="right IJ introducer reference"><svg viewBox="0 0 600 420">
    <path className="rv-body" d="M70 55q95-25 190 0v285H70z"/><path className="rv-line" d="M118 90l45 210M222 90l-59 210M70 300h190"/>
    <text className="small" x="160" y="330">SCM heads + clavicle</text><circle className="rv-dot" cx="148" cy="210" r="8"/><text className="small" x="113" y="232">CAROTID</text>
    <circle className="rv-ring gold" cx="203" cy="210" r="18"/><text className="small" x="226" y="214">IJ</text>
    <path className="rv-line gold" d="M288 250h100"/><rect className="rv-label" x="388" y="210" width="130" height="80" rx="12"/><text className="small" x="453" y="241">INTRODUCER</text><text className="small" x="453" y="261">SHEATH</text>
    <text className="small" x="405" y="335">wire out · sheath aspirated/flushed · sheath secured before pacing lead</text>
  </svg></Frame>;
  if(mode==='tvp-generator') return <Frame title="generator controls are active clinical variables"><svg viewBox="0 0 600 420">
    <rect className="rv-soft" x="105" y="55" width="390" height="300" rx="18"/>
    <circle className="rv-ring gold" cx="190" cy="150" r="45"/><circle className="rv-ring gold" cx="300" cy="150" r="45"/><circle className="rv-ring gold" cx="410" cy="150" r="45"/>
    <text className="small" x="190" y="154">RATE</text><text className="small" x="300" y="154">OUTPUT</text><text className="small" x="410" y="154">SENSE</text>
    <path className="rv-wave" d="M145 270h45l12-28 15 56 15-28h44l12-28 15 56 15-28h44"/>
    <text className="small" x="300" y="325">watch native beats, pacing spikes, QRS response and inhibition behavior</text>
  </svg></Frame>;
  if(mode==='tvp-lead') return <Frame title="balloon stays deflated inside sheath"><svg viewBox="0 0 600 420">
    <rect className="rv-soft" x="65" y="110" width="180" height="80" rx="14"/><text className="small" x="155" y="145">INTRODUCER SHEATH</text>
    <path className="rv-line gold" d="M105 150h365"/><circle className="rv-ring gold" cx="315" cy="150" r="18"/><circle className="rv-dot" cx="355" cy="150" r="6"/><circle className="rv-dot" cx="380" cy="150" r="6"/>
    <text className="small" x="320" y="110">balloon + distal electrodes must clear sheath</text>
    <path className="rv-line bad" d="M180 205v85"/><text className="small" x="180" y="316">NO BALLOON INFLATION INSIDE SHEATH</text>
    <text className="small" x="300" y="365">use catheter markings and actual sheath length · common adult reference ≈ 20 cm</text>
  </svg></Frame>;
  if(mode==='tvp-advance') return <Frame title="float RA → RV while rhythm stays visible"><svg viewBox="0 0 600 420">
    <path className="rv-soft" d="M110 205q70-115 165-35q70-105 170-10q45 100-120 180q-170-70-215-135z"/>
    <text className="small" x="210" y="170">RA</text><text className="small" x="350" y="235">RV</text>
    <path className="rv-line gold" d="M85 95q105 55 155 105q60 62 112 50"/><circle className="rv-ring gold" cx="352" cy="250" r="18"/>
    <path className="rv-wave" d="M345 75h32l10-22 14 44 14-22h38"/><text className="small" x="420" y="118">paced wide QRS / LBBB pattern</text>
    <text className="small" x="300" y="385">VT/VF, marked ectopy or resistance = stop and withdraw to safer position</text>
  </svg></Frame>;
  if(mode==='tvp-capture') return <Frame title="electrical capture ≠ mechanical capture"><svg viewBox="0 0 600 420">
    <path className="rv-wave" d="M55 135h40v-65h12v65h58l14-45 20 90 20-45h58"/><text className="small" x="165" y="210">PACER SPIKE → PACED QRS</text>
    <path className="rv-wave gold" d="M320 135h40l14-28 18 56 18-28h85"/><text className="small" x="410" y="210">ARTERIAL / PLETH PULSE</text>
    <path className="rv-line gold" d="M165 255h245"/><text className="small" x="290" y="290">rates must match</text>
    <text className="small" x="300" y="355">electrical QRS without pulse = no useful mechanical capture</text>
  </svg></Frame>;
  if(mode==='tvp-threshold') return <Frame title="find threshold · then restore safety margin"><svg viewBox="0 0 600 420">
    <path className="rv-line gold" d="M95 120h410"/><circle className="rv-dot" cx="390" cy="120" r="8"/><text className="small" x="390" y="95">capture lost</text>
    <path className="rv-line" d="M95 220h410"/><circle className="rv-dot" cx="345" cy="220" r="8"/><text className="small" x="345" y="195">capture returns = threshold</text>
    <path className="rv-line gold" d="M345 280h120"/><text className="small" x="405" y="315">final output above threshold</text>
    <text className="small" x="300" y="375">record threshold · rising threshold later may mean lead or physiology changed</text>
  </svg></Frame>;
  if(mode==='tvp-secure') return <Frame title="secure sheath → lead → cable → generator"><svg viewBox="0 0 600 420">
    <rect className="rv-soft" x="50" y="110" width="120" height="65" rx="10"/><text className="small" x="110" y="148">SHEATH</text>
    <path className="rv-line gold" d="M170 142h115"/><rect className="rv-label" x="285" y="110" width="120" height="65" rx="10"/><text className="small" x="345" y="148">LEAD DEPTH</text>
    <path className="rv-line" d="M405 142h80"/><rect className="rv-soft" x="460" y="102" width="100" height="80" rx="10"/><text className="small" x="510" y="148">GEN</text>
    <path className="rv-line" d="M250 225q75 55 150 0"/><text className="small" x="325" y="295">strain relief loop</text>
    <text className="small" x="300" y="365">record depth · mode · rate · output · sensitivity · threshold · mechanical-capture method</text>
  </svg></Frame>;
  if(mode==='tvp-troubleshoot') return <Frame title="spike → QRS → pulse: find the broken link"><svg viewBox="0 0 600 420">
    <circle className="rv-ring gold" cx="125" cy="180" r="45"/><circle className="rv-ring" cx="300" cy="180" r="45"/><circle className="rv-ring" cx="475" cy="180" r="45"/>
    <text className="small" x="125" y="185">SPIKE</text><text className="small" x="300" y="185">QRS</text><text className="small" x="475" y="185">PULSE</text>
    <path className="rv-line gold" d="M170 180h85M345 180h85"/><text className="small" x="210" y="160">capture?</text><text className="small" x="388" y="160">mechanical?</text>
    <text className="small" x="300" y="300">then check depth · cable · power · output · sensitivity · patient</text>
    <text className="small" x="300" y="350">transcutaneous backup remains immediately available</text>
  </svg></Frame>;
  return <Frame title="temporary pacing · electrical and mechanical system"><svg viewBox="0 0 600 420">
    <path className="rv-wave" d="M60 150h40v-60h12v60h55l14-38 18 76 18-38h60"/><path className="rv-wave gold" d="M335 150h45l14-28 18 56 18-28h80"/>
    <text className="small" x="170" y="220">paced ECG</text><text className="small" x="425" y="220">mechanical pulse</text>
    <text className="small" x="300" y="340">bridge to definitive therapy · reversible cause treatment continues</text>
  </svg></Frame>;
}

function Thoracentesis({mode}:{mode:string}) {
  if(mode==='thorac-position') return <Frame title="upright + supported when feasible"><svg viewBox="0 0 600 420">
    <circle className="rv-head" cx="250" cy="95" r="42"/><path className="rv-body" d="M205 135q45-25 90 0l38 160H167z"/>
    <path className="rv-line gold" d="M205 168l-85 58M295 168l85 58"/><rect className="rv-soft" x="72" y="226" width="356" height="42" rx="8"/>
    <text className="small" x="250" y="325">lean slightly forward · forearms supported · posterior interspaces open</text>
    <text className="small" x="250" y="355">recumbent / ventilated patient = ultrasound chooses the actual dependent pocket</text>
  </svg></Frame>;
  if(mode==='thorac-map') return <Frame title="rib + pleural fluid + lung + diaphragm + solid organ"><svg viewBox="0 0 600 420">
    <path className="rv-sector" d="M300 45L70 365h460z"/>
    <ellipse className="rv-ring" cx="175" cy="130" rx="45" ry="72"/><ellipse className="rv-ring" cx="425" cy="130" rx="45" ry="72"/><text className="small" x="175" y="65">RIB</text><text className="small" x="425" y="65">RIB</text>
    <path className="rv-fluid" d="M150 235q150-70 300 0v78H150z"/><text className="small" x="300" y="285">PLEURAL FLUID</text>
    <path className="rv-line gold" d="M115 315q185-85 370 0"/><text className="small" x="300" y="350">DIAPHRAGM</text>
    <ellipse className="rv-soft" cx="280" cy="185" rx="78" ry="42"/><text className="small" x="280" y="190">COMPRESSED LUNG</text>
    <text className="small" x="300" y="395">measure skin→fluid depth and safe depth above diaphragm through respiration</text>
  </svg></Frame>;
  if(mode==='thorac-rib') return <Frame title="enter over the superior border of the lower rib"><svg viewBox="0 0 600 420">
    <ellipse className="rv-rib" cx="300" cy="160" rx="160" ry="38"/><ellipse className="rv-rib" cx="300" cy="265" rx="160" ry="38"/>
    <text className="small" x="300" y="165">RIB ABOVE</text><text className="small" x="300" y="270">RIB BELOW</text>
    <path className="rv-line bad" d="M165 198h115"/><text className="small" x="220" y="215">intercostal vein / artery / nerve under rib above</text>
    <path className="rv-needle" d="M135 340L235 288"/><circle className="rv-dot" cx="235" cy="288" r="7"/><text className="small" x="370" y="332">needle rides just over superior border of lower rib</text>
  </svg></Frame>;
  if(mode==='thorac-setup') return <Frame title="sampling + drainage system ready before puncture"><svg viewBox="0 0 600 420">
    <rect className="rv-soft" x="40" y="65" width="150" height="75" rx="10"/><text className="small" x="115" y="95">LOCAL ANESTHETIC</text><text className="small" x="115" y="116">SMALL + LONG NEEDLE</text>
    <rect className="rv-soft" x="225" y="65" width="150" height="75" rx="10"/><text className="small" x="300" y="95">NEEDLE-CATHETER</text><text className="small" x="300" y="116">SYRINGE + STOPCOCK</text>
    <rect className="rv-soft" x="410" y="65" width="150" height="75" rx="10"/><text className="small" x="485" y="95">DRAIN TUBING</text><text className="small" x="485" y="116">BAG + SPECIMENS</text>
    <path className="rv-line gold" d="M95 235h410"/><circle className="rv-dot" cx="130" cy="235" r="7"/><circle className="rv-dot" cx="280" cy="235" r="7"/><circle className="rv-dot" cx="430" cy="235" r="7"/>
    <text className="small" x="130" y="215">MAP</text><text className="small" x="280" y="215">ANESTHETIZE</text><text className="small" x="430" y="215">ACCESS + DRAIN</text>
    <text className="small" x="300" y="350">stopcock prevents an open path from pleural space to room air</text>
  </svg></Frame>;
  if(mode==='thorac-anesthesia') return <Frame title="anesthetize layer by layer and learn the pleural depth"><svg viewBox="0 0 600 420">
    <rect className="rv-soft" x="95" y="55" width="410" height="52" rx="8"/><text className="small" x="300" y="86">SKIN / SUBCUTANEOUS</text>
    <rect className="rv-soft" x="95" y="107" width="410" height="62" rx="8"/><text className="small" x="300" y="143">INTERCOSTAL MUSCLE</text>
    <rect className="rv-label" x="95" y="169" width="410" height="35" rx="8"/><text className="small" x="300" y="192">PARIETAL PLEURA · PAIN-SENSITIVE</text>
    <path className="rv-fluid" d="M95 204h410v112H95z"/><text className="small" x="300" y="265">PLEURAL FLUID</text>
    <path className="rv-needle" d="M300 35v190"/><circle className="rv-dot" cx="300" cy="225" r="7"/>
    <text className="small" x="300" y="352">first fluid return = note skin→pleural depth</text>
  </svg></Frame>;
  if(mode==='thorac-access') return <Frame title="fluid return → stop needle → thread catheter"><svg viewBox="0 0 600 420">
    <path className="rv-fluid" d="M95 195q205-35 410 0v135H95z"/><text className="small" x="300" y="290">PLEURAL SPACE</text>
    <path className="rv-needle" d="M150 80L290 210"/><circle className="rv-dot" cx="290" cy="210" r="7"/>
    <path className="rv-line gold" d="M290 210q85 10 145 55"/><text className="small" x="430" y="250">FLEXIBLE CATHETER</text>
    <text className="small" x="300" y="372">free fluid return = needle stops · catheter advances · needle comes out</text>
  </svg></Frame>;
  if(mode==='thorac-drain') return <Frame title="sample first · then controlled therapeutic drainage"><svg viewBox="0 0 600 420">
    <rect className="rv-soft" x="65" y="95" width="130" height="90" rx="10"/><text className="small" x="130" y="128">PLEURAL</text><text className="small" x="130" y="149">CATHETER</text>
    <path className="rv-line gold" d="M195 140h120"/><circle className="rv-ring gold" cx="335" cy="140" r="30"/><text className="small" x="335" y="145">3-WAY</text>
    <path className="rv-line" d="M365 140h95"/><rect className="rv-soft" x="460" y="95" width="90" height="100" rx="10"/><text className="small" x="505" y="135">BAG</text>
    <path className="rv-line" d="M335 170v70"/><rect className="rv-label" x="270" y="240" width="130" height="55" rx="8"/><text className="small" x="335" y="273">SAMPLE SYRINGE</text>
    <text className="small" x="300" y="355">watch symptoms · BP · oxygenation · stop for pain, dyspnea, hypotension, resistance</text>
  </svg></Frame>;
  if(mode==='thorac-finish') return <Frame title="close system → remove catheter → seal site"><svg viewBox="0 0 600 420">
    <circle className="rv-ring gold" cx="120" cy="150" r="34"/><text className="small" x="120" y="155">CLOSE</text><path className="rv-line gold" d="M154 150h110"/>
    <path className="rv-line" d="M264 150h92"/><text className="small" x="310" y="132">REMOVE CATHETER</text>
    <rect className="rv-label" x="395" y="115" width="125" height="70" rx="8"/><text className="small" x="458" y="145">DRESSING</text>
    <path className="rv-wave" d="M105 280h45l14-30 17 60 18-30h55"/><text className="small" x="180" y="338">then reassess lung + patient</text>
  </svg></Frame>;
  return <Frame title="thoracentesis · indication → map → access → drain → recheck"><svg viewBox="0 0 600 420">
    <path className="rv-fluid" d="M85 220q215-80 430 0v100H85z"/><path className="rv-line gold" d="M100 250q200-105 400 0"/>
    <text className="small" x="300" y="355">ultrasound before puncture · no blind low posterior stick</text>
    <path className="rv-wave" d="M165 100h45l14-28 18 56 18-28h55"/><text className="small" x="245" y="165">SpO₂ · BP · symptoms</text>
  </svg></Frame>;
}

function Pericardiocentesis({mode}:{mode:string}) {
  if(mode==='pericard-map') return <Frame title="scan every window · choose the shortest safe fluid path"><svg viewBox="0 0 600 420">
    <path className="rv-body" d="M95 55q205-55 410 0v285H95z"/>
    <ellipse className="rv-soft" cx="300" cy="205" rx="88" ry="105"/><text className="small" x="300" y="204">HEART</text>
    <ellipse className="rv-ring gold" cx="300" cy="205" rx="118" ry="138"/><text className="small" x="300" y="365">PERICARDIAL FLUID</text>
    <circle className="rv-dot" cx="170" cy="176" r="7"/><text className="small" x="116" y="154">PARASTERNAL</text>
    <circle className="rv-dot" cx="225" cy="300" r="7"/><text className="small" x="180" y="330">APICAL</text>
    <circle className="rv-dot" cx="332" cy="338" r="7"/><text className="small" x="370" y="340">SUBXIPHOID</text>
    <path className="rv-line gold" d="M170 176l65 15"/><path className="rv-line" d="M225 300l30-38"/><path className="rv-line" d="M332 338l-2-74"/>
    <text className="small" x="300" y="392">largest accessible pocket · shortest skin-to-fluid distance · no lung/liver/vessel in path</text>
  </svg></Frame>;
  if(mode==='pericard-setup') return <Frame title="sterile image-guided drainage system"><svg viewBox="0 0 600 420">
    <rect className="rv-soft" x="38" y="60" width="150" height="78" rx="10"/><text className="small" x="113" y="90">STERILE PROBE</text><text className="small" x="113" y="112">SHEATH + GEL</text>
    <rect className="rv-soft" x="225" y="60" width="150" height="78" rx="10"/><text className="small" x="300" y="90">NEEDLE + SYRINGE</text><text className="small" x="300" y="112">WIRE · DILATOR</text>
    <rect className="rv-soft" x="412" y="60" width="150" height="78" rx="10"/><text className="small" x="487" y="90">PIGTAIL DRAIN</text><text className="small" x="487" y="112">STOPCOCK · BAG</text>
    <path className="rv-line gold" d="M90 226h420"/><circle className="rv-dot" cx="120" cy="226" r="7"/><circle className="rv-dot" cx="260" cy="226" r="7"/><circle className="rv-dot" cx="400" cy="226" r="7"/><circle className="rv-dot" cx="510" cy="226" r="7"/>
    <text className="small" x="120" y="208">MAP</text><text className="small" x="260" y="208">NEEDLE</text><text className="small" x="400" y="208">WIRE</text><text className="small" x="510" y="208">DRAIN</text>
    <rect className="rv-label" x="170" y="285" width="260" height="60" rx="8"/><text className="small" x="300" y="313">ECG · BP · SpO₂ · RESUSCITATION READY</text><text className="small" x="300" y="332">before puncture</text>
  </svg></Frame>;
  if(mode==='pericard-needle') return <Frame title="needle moves only when the true tip is known"><svg viewBox="0 0 600 420">
    <path className="rv-sector" d="M300 42L80 365h440z"/>
    <ellipse className="rv-ring gold" cx="336" cy="250" rx="105" ry="72"/><text className="small" x="336" y="332">PERICARDIAL FLUID</text>
    <ellipse className="rv-soft" cx="336" cy="245" rx="68" ry="48"/><text className="small" x="336" y="250">MYOCARDIUM</text>
    <path className="rv-needle" d="M130 120L250 220"/><circle className="rv-dot" cx="250" cy="220" r="7"/>
    <text className="small" x="185" y="98">TRUE NEEDLE TIP</text>
    <path className="rv-line bad" d="M255 220l95 28"/><text className="small" x="445" y="242">do not advance blind toward myocardium</text>
    <text className="small" x="300" y="392">needle moves → needle stops → probe reacquires tip → next advance</text>
  </svg></Frame>;
  if(mode==='pericard-confirm') return <Frame title="prove pericardial position before wire or drain"><svg viewBox="0 0 600 420">
    <ellipse className="rv-ring gold" cx="300" cy="210" rx="130" ry="115"/><ellipse className="rv-soft" cx="300" cy="210" rx="88" ry="75"/>
    <text className="small" x="300" y="214">HEART</text><text className="small" x="300" y="348">PERICARDIAL SPACE</text>
    <circle className="rv-dot" cx="215" cy="290" r="5"/><circle className="rv-dot" cx="245" cy="312" r="5"/><circle className="rv-dot" cx="275" cy="300" r="5"/>
    <text className="small" x="125" y="330">agitated-saline bubbles should stay outside chamber if used for confirmation</text>
    <path className="rv-wave" d="M390 125h35l12-30 16 60 16-30h50"/><text className="small" x="454" y="186">ectopy / ST change = stop + withdraw</text>
  </svg></Frame>;
  if(mode==='pericard-wire') return <Frame title="wire control → short dilation → pigtail"><svg viewBox="0 0 600 420">
    <ellipse className="rv-ring gold" cx="300" cy="220" rx="135" ry="105"/><ellipse className="rv-soft" cx="300" cy="220" rx="88" ry="65"/>
    <path className="rv-line gold" d="M125 105q115 70 145 120q38 50 98 35"/><text className="small" x="135" y="88">GUIDEWIRE</text>
    <rect className="rv-label" x="390" y="200" width="120" height="42" rx="18"/><text className="small" x="450" y="226">PIGTAIL</text>
    <path className="rv-line" d="M330 275q55 35 90 0q38-30 70 8"/>
    <text className="small" x="300" y="372">one hand owns wire · dilator only through soft tissue tract · catheter follows wire</text>
  </svg></Frame>;
  if(mode==='pericard-drain') return <Frame title="decompress to physiology · keep reassessing"><svg viewBox="0 0 600 420">
    <ellipse className="rv-ring gold" cx="205" cy="205" rx="105" ry="90"/><ellipse className="rv-soft" cx="205" cy="205" rx="72" ry="58"/><path className="rv-line gold" d="M260 248q65 22 90 72"/>
    <rect className="rv-soft" x="365" y="255" width="110" height="78" rx="10"/><text className="small" x="420" y="285">DRAINAGE</text><text className="small" x="420" y="306">SYSTEM</text>
    <path className="rv-wave" d="M330 105h35l12-30 16 60 16-30h75"/><text className="small" x="405" y="165">BP · ETCO₂ · PERFUSION</text>
    <text className="small" x="300" y="388">repeat echo + hemodynamics · do not chase an arbitrary empty sac</text>
  </svg></Frame>;
  return <Frame title="tamponade physiology → drain only if anatomy and indication agree"><svg viewBox="0 0 600 420">
    <ellipse className="rv-ring gold" cx="210" cy="210" rx="110" ry="115"/><ellipse className="rv-soft" cx="210" cy="210" rx="72" ry="78"/><text className="small" x="210" y="214">HEART</text>
    <path className="rv-wave" d="M365 145h35l12-30 16 60 16-30h75"/><text className="small" x="440" y="205">shock + effusion + echo physiology</text>
    <text className="small" x="300" y="370">traumatic hemopericardium may need operative drainage</text>
  </svg></Frame>;
}

function Cricothyrotomy({mode}:{mode:string}) {
  if(mode==='cric-landmark') return <Frame title="thyroid cartilage → membrane → cricoid"><svg viewBox="0 0 600 420">
    <path className="rv-body" d="M220 45q80-30 160 0l-30 310H250z"/>
    <path className="rv-rib" d="M250 110q50-45 100 0l-18 55h-64z"/><text className="small" x="300" y="84">THYROID CARTILAGE</text>
    <rect className="rv-label" x="270" y="166" width="60" height="36" rx="8"/><text className="small" x="300" y="189">CTM</text>
    <ellipse className="rv-ring" cx="300" cy="235" rx="45" ry="24"/><text className="small" x="300" y="240">CRICOID</text>
    <path className="rv-line gold" d="M160 175h110"/><text className="small" x="120" y="162">soft depression</text><text className="small" x="120" y="181">between firm cartilages</text>
    <path className="rv-line" d="M300 259v86"/><text className="small" x="300" y="382">keep larynx stabilized and midline</text>
  </svg></Frame>;
  if(mode==='cric-setup') return <Frame title="rescue airway equipment order"><svg viewBox="0 0 600 420">
    <rect className="rv-soft" x="40" y="75" width="110" height="65" rx="8"/><text className="small" x="95" y="113">SCALPEL</text>
    <rect className="rv-soft" x="170" y="75" width="110" height="65" rx="8"/><text className="small" x="225" y="105">HOOK /</text><text className="small" x="225" y="123">HEMOSTAT</text>
    <rect className="rv-soft" x="300" y="75" width="110" height="65" rx="8"/><text className="small" x="355" y="113">BOUGIE</text>
    <rect className="rv-soft" x="430" y="75" width="110" height="65" rx="8"/><text className="small" x="485" y="105">CUFFED</text><text className="small" x="485" y="123">TUBE</text>
    <path className="rv-line gold" d="M95 180h390"/><circle className="rv-dot" cx="95" cy="180" r="6"/><circle className="rv-dot" cx="225" cy="180" r="6"/><circle className="rv-dot" cx="355" cy="180" r="6"/><circle className="rv-dot" cx="485" cy="180" r="6"/>
    <rect className="rv-label" x="95" y="245" width="160" height="64" rx="8"/><text className="small" x="175" y="274">SUCTION + BVM</text><text className="small" x="175" y="292">READY</text>
    <rect className="rv-label" x="345" y="245" width="160" height="64" rx="8"/><text className="small" x="425" y="274">WAVEFORM</text><text className="small" x="425" y="292">CAPNOGRAPHY</text>
  </svg></Frame>;
  if(mode==='cric-skin') return <Frame title="vertical skin incision · then re-palpate"><svg viewBox="0 0 600 420">
    <path className="rv-body" d="M225 50q75-25 150 0l-28 300H253z"/>
    <path className="rv-line gold" d="M300 120v155"/><text className="small" x="360" y="190">VERTICAL MIDLINE SKIN INCISION</text>
    <circle className="rv-dot" cx="300" cy="198" r="8"/><text className="small" x="185" y="305">re-palpate CTM through open skin</text>
  </svg></Frame>;
  if(mode==='cric-membrane') return <Frame title="horizontal membrane incision"><svg viewBox="0 0 600 420">
    <path className="rv-rib" d="M220 110q80-50 160 0l-24 58H244z"/><text className="small" x="300" y="90">THYROID</text>
    <rect className="rv-label" x="245" y="170" width="110" height="55" rx="10"/><text className="small" x="300" y="202">CTM</text>
    <ellipse className="rv-ring" cx="300" cy="265" rx="62" ry="28"/><text className="small" x="300" y="270">CRICOID</text>
    <path className="rv-line gold" d="M250 197h100"/><text className="small" x="410" y="202">horizontal cut</text>
    <path className="rv-line bad" d="M300 225v95"/><text className="small" x="300" y="350">do not sweep blade deep</text>
  </svg></Frame>;
  if(mode==='cric-open') return <Frame title="maintain the opening · guide goes caudal"><svg viewBox="0 0 600 420">
    <rect className="rv-label" x="170" y="110" width="260" height="55" rx="10"/><text className="small" x="300" y="144">CRICOTHYROID OPENING</text>
    <path className="rv-line gold" d="M300 165v155"/><path className="rv-line" d="M300 320l-15-24M300 320l15-24"/><text className="small" x="360" y="255">BOUGIE / HOOK</text>
    <text className="small" x="300" y="365">direction = caudal toward lungs</text>
  </svg></Frame>;
  if(mode==='cric-tube') return <Frame title="tube caudal · cuff just inside"><svg viewBox="0 0 600 420">
    <rect className="rv-soft" x="250" y="70" width="100" height="280" rx="45"/><text className="small" x="300" y="96">TRACHEA</text>
    <path className="rv-line gold" d="M300 120v165"/><rect className="rv-label" x="260" y="182" width="80" height="38" rx="18"/><text className="small" x="300" y="206">CUFF</text>
    <text className="small" x="410" y="192">balloon just inside airway</text>
    <path className="rv-line bad" d="M300 285v55"/><text className="small" x="420" y="328">avoid unnecessary depth</text>
  </svg></Frame>;
  return <Frame title="prove tracheal ventilation"><svg viewBox="0 0 600 420">
    <path className="rv-wave" d="M65 200h45v-55h70v55h50v-55h70v55h50"/><text className="small" x="205" y="125">SUSTAINED ETCO₂</text>
    <path className="rv-body" d="M360 95q75-35 150 0v190q-75 30-150 0z"/><path className="rv-line gold" d="M435 112v145"/>
    <text className="small" x="435" y="320">bilateral chest rise + ventilation</text>
  </svg></Frame>;
}

function FingerThoracostomy({mode}:{mode:string}) {
  if(mode==='finger-thorax-setup') return <Frame title="simple thoracostomy setup"><svg viewBox="0 0 600 420">
    <rect className="rv-soft" x="45" y="70" width="145" height="78" rx="10"/><text className="small" x="117" y="98">SCALPEL</text><text className="small" x="117" y="120">STERILE FIELD</text>
    <rect className="rv-soft" x="225" y="70" width="145" height="78" rx="10"/><text className="small" x="297" y="98">CURVED KELLY</text><text className="small" x="297" y="120">DEPTH CONTROL</text>
    <rect className="rv-soft" x="405" y="70" width="145" height="78" rx="10"/><text className="small" x="477" y="98">VENTED SEAL</text><text className="small" x="477" y="120">OR TUBE SYSTEM</text>
    <path className="rv-line gold" d="M85 242h430"/><circle className="rv-dot" cx="120" cy="242" r="7"/><circle className="rv-dot" cx="300" cy="242" r="7"/><circle className="rv-dot" cx="480" cy="242" r="7"/>
    <text className="small" x="120" y="222">mark</text><text className="small" x="300" y="222">open pleura</text><text className="small" x="480" y="222">seal / tube</text>
    <text className="small" x="300" y="350">suction + monitoring remain visible during the procedure</text>
  </svg></Frame>;
  if(mode==='finger-thorax-incision') return <Frame title="2–3 cm transverse skin incision"><svg viewBox="0 0 600 420">
    <path className="rv-rib" d="M85 150q215-65 430 0M78 235q222-65 444 0"/><text className="small" x="515" y="145">rib above</text><text className="small" x="520" y="230">rib below</text>
    <path className="rv-line gold" d="M210 198h180"/><text className="small" x="300" y="185">TRANSVERSE INCISION</text>
    <path className="rv-line" d="M300 198v68"/><text className="small" x="300" y="292">open skin + SQ to chest wall · do not stab deep</text>
  </svg></Frame>;
  if(mode==='finger-thorax-dissection') return <Frame title="lower rib = the rail"><svg viewBox="0 0 600 420">
    <ellipse className="rv-rib" cx="300" cy="235" rx="145" ry="45"/><text className="small" x="300" y="240">RIB BELOW TARGET</text>
    <path className="rv-needle" d="M120 105L265 200"/><circle className="rv-dot" cx="265" cy="200" r="7"/>
    <path className="rv-line gold" d="M265 200q25-40 70-48"/><text className="small" x="380" y="155">walk over superior border</text>
    <path className="rv-line bad" d="M300 276v72"/><text className="small" x="405" y="320">bundle is under rib above</text>
    <text className="small" x="300" y="392">finger near clamp tip limits uncontrolled depth</text>
  </svg></Frame>;
  if(mode==='finger-thorax-entry') return <Frame title="pleural pop → spread, not plunge"><svg viewBox="0 0 600 420">
    <rect className="rv-soft" x="55" y="65" width="490" height="58" rx="9"/><text className="small" x="300" y="100">CHEST WALL / INTERCOSTAL TISSUE</text>
    <path className="rv-line gold" d="M300 123v82"/><circle className="rv-dot" cx="300" cy="208" r="8"/><text className="small" x="360" y="205">PLEURAL GIVE / POP</text>
    <path className="rv-fluid" d="M140 235q160-45 320 0v110H140z"/><text className="small" x="300" y="295">PLEURAL SPACE</text>
    <path className="rv-line bad" d="M300 224v110"/><text className="small" x="415" y="338">do not drive clamp deeper</text>
  </svg></Frame>;
  if(mode==='finger-thorax-sweep') return <Frame title="finger confirmation"><svg viewBox="0 0 600 420">
    <path className="rv-body" d="M75 90h450v240H75z"/><path className="rv-line gold" d="M300 90v110"/><ellipse className="rv-ring gold" cx="300" cy="230" rx="65" ry="92"/>
    <text className="small" x="300" y="235">GLOVED FINGER</text><text className="small" x="300" y="350">feel inside chest wall · sweep for adhesions · prove pleural cavity</text>
  </svg></Frame>;
  if(mode==='finger-thorax-seal') return <Frame title="simple thoracostomy endpoint"><svg viewBox="0 0 600 420">
    <circle className="rv-ring gold" cx="150" cy="205" r="52"/><text className="small" x="150" y="202">OPEN</text><text className="small" x="150" y="220">TRACT</text>
    <path className="rv-line gold" d="M202 205h100"/><rect className="rv-soft" x="302" y="155" width="105" height="100" rx="10"/><text className="small" x="354" y="195">VENTED</text><text className="small" x="354" y="214">SEAL</text>
    <path className="rv-line" d="M407 205h90"/><rect className="rv-soft" x="470" y="160" width="85" height="90" rx="10"/><text className="small" x="512" y="198">OR</text><text className="small" x="512" y="217">TUBE</text>
    <text className="small" x="300" y="332">do not seal first if a chest tube is immediately following</text>
  </svg></Frame>;
  return <Frame title="decompress → then prove physiology changed"><svg viewBox="0 0 600 420">
    <path className="rv-wave" d="M60 140h55l14-30 17 60 18-30h70"/><text className="small" x="150" y="200">SpO₂ / ETCO₂ / BP</text>
    <path className="rv-wave" d="M340 140h48l16-32 18 64 18-32h72"/><text className="small" x="425" y="200">VENT PRESSURE / VOLUME</text>
    <path className="rv-line gold" d="M110 285h380"/><text className="small" x="300" y="270">before → decompression → after</text>
    <text className="small" x="300" y="345">no improvement? recheck tract, side, diagnosis, hemorrhage and airway</text>
  </svg></Frame>;
}

function IjSequence({mode}:{mode:string}) {
  if(mode==='ij-sequence-confirm') return <Frame title="needle tip in vein · prove venous access before dilation"><svg viewBox="0 0 600 420">
    <path className="rv-sector" d="M300 45L75 365h450z"/><ellipse className="rv-vessel" cx="360" cy="245" rx="78" ry="48"/><text className="small" x="360" y="250">IJ</text>
    <ellipse className="rv-ring" cx="205" cy="248" rx="55" ry="45"/><text className="small" x="205" y="253">CAROTID</text>
    <path className="rv-needle" d="M120 110L315 225"/><circle className="rv-dot" cx="315" cy="225" r="7"/><text className="small" x="210" y="95">TRUE NEEDLE TIP</text>
    <text className="small" x="300" y="390">venous return + ultrasound location · no dilation until access makes sense</text>
  </svg></Frame>;
  if(mode==='ij-sequence-wire') return <Frame title="wire enters through needle · one hand always owns it"><svg viewBox="0 0 600 420">
    <ellipse className="rv-vessel" cx="300" cy="230" rx="120" ry="70"/><text className="small" x="300" y="235">IJ LUMEN</text>
    <path className="rv-line gold" d="M95 95q110 55 155 120q45 65 130 45"/><text className="small" x="145" y="75">GUIDEWIRE</text>
    <circle className="rv-dot" cx="95" cy="95" r="7"/><text className="small" x="190" y="340">never release proximal wire · resistance/ectopy = stop</text>
  </svg></Frame>;
  if(mode==='ij-sequence-dilate') return <Frame title="skin nick → dilator over wire → soft tissue only"><svg viewBox="0 0 600 420">
    <path className="rv-line gold" d="M300 55v280"/><text className="small" x="340" y="80">WIRE</text>
    <rect className="rv-soft" x="150" y="150" width="300" height="48" rx="8"/><text className="small" x="300" y="180">SKIN / SUBCUTANEOUS TISSUE</text>
    <path className="rv-needle" d="M255 100l45 95"/><text className="small" x="190" y="100">DILATOR</text>
    <path className="rv-line bad" d="M255 215l45 100"/><text className="small" x="390" y="285">do not bury dilator to arbitrary depth</text>
  </svg></Frame>;
  if(mode==='ij-sequence-catheter') return <Frame title="catheter over wire → wire out → every lumen proven"><svg viewBox="0 0 600 420">
    <path className="rv-line gold" d="M130 90q100 55 155 140q50 75 145 40"/><text className="small" x="175" y="72">WIRE</text>
    <path className="rv-line" d="M145 115q90 58 140 132q45 65 125 42"/><text className="small" x="435" y="285">CATHETER</text>
    <rect className="rv-label" x="95" y="310" width="125" height="55" rx="8"/><text className="small" x="157" y="343">WIRE OUT</text>
    <rect className="rv-soft" x="245" y="310" width="125" height="55" rx="8"/><text className="small" x="307" y="343">ASPIRATE</text>
    <rect className="rv-soft" x="395" y="310" width="125" height="55" rx="8"/><text className="small" x="457" y="343">FLUSH / CAP</text>
  </svg></Frame>;
  return <Frame title="resistance or unexpected anatomy = stop and re-map"><svg viewBox="0 0 600 420">
    <circle className="rv-ring gold" cx="300" cy="165" r="58"/><text className="small" x="300" y="170">STOP</text>
    <path className="rv-line bad" d="M120 285h360"/><text className="small" x="300" y="270">wire resistance · ectopy · swelling · wrong structure</text>
    <text className="small" x="300" y="330">do not force the next Seldinger step</text>
  </svg></Frame>;
}

function Mtp({mode}:{mode:string}) {
  if(mode==='mtp-source') return <Frame title="transfusion buys time · source control stops bleeding"><svg viewBox="0 0 600 420">
    <circle className="rv-ring gold" cx="120" cy="170" r="55"/><text className="small" x="120" y="175">BLEED</text>
    <path className="rv-line gold" d="M175 170h95"/><rect className="rv-soft" x="270" y="125" width="120" height="90" rx="10"/><text className="small" x="330" y="160">BLOOD</text><text className="small" x="330" y="180">BUYS TIME</text>
    <path className="rv-line" d="M390 170h80"/><rect className="rv-label" x="455" y="95" width="110" height="150" rx="10"/><text className="small" x="510" y="130">OR</text><text className="small" x="510" y="155">IR</text><text className="small" x="510" y="180">OB CONTROL</text><text className="small" x="510" y="205">ENDOSCOPY</text>
    <text className="small" x="300" y="325">if source control has not advanced, resuscitation has not solved the central problem</text>
  </svg></Frame>;
  if(mode==='mtp-phys') return <Frame title="transfusion changes physiology too"><svg viewBox="0 0 600 420">
    <rect className="rv-soft" x="55" y="85" width="120" height="80" rx="10"/><text className="small" x="115" y="118">TEMP</text><text className="small" x="115" y="140">WARM</text>
    <rect className="rv-soft" x="195" y="85" width="120" height="80" rx="10"/><text className="small" x="255" y="118">iCa</text><text className="small" x="255" y="140">TREND</text>
    <rect className="rv-soft" x="335" y="85" width="120" height="80" rx="10"/><text className="small" x="395" y="118">FIBRINOGEN</text><text className="small" x="395" y="140">PLATELETS</text>
    <rect className="rv-soft" x="475" y="85" width="70" height="80" rx="10"/><text className="small" x="510" y="118">pH</text><text className="small" x="510" y="140">TREND</text>
    <path className="rv-line gold" d="M90 245h420"/><text className="small" x="300" y="230">component/adjunct changes follow actual trigger or pathway</text>
    <text className="small" x="300" y="330">warm patient + products · repeat key labs as hemorrhage evolves</text>
  </svg></Frame>;
  if(mode==='mtp-response') return <Frame title="prove perfusion is improving"><svg viewBox="0 0 600 420">
    <path className="rv-wave" d="M65 125h40l14-30 18 60 18-30h75"/><text className="small" x="150" y="195">BP / pulse / ETCO₂</text>
    <rect className="rv-soft" x="285" y="85" width="115" height="80" rx="10"/><text className="small" x="342" y="116">MENTAL</text><text className="small" x="342" y="138">STATUS</text>
    <rect className="rv-soft" x="430" y="85" width="115" height="80" rx="10"/><text className="small" x="487" y="116">BLOOD</text><text className="small" x="487" y="138">LOSS</text>
    <path className="rv-line gold" d="M90 270h420"/><text className="small" x="300" y="255">after each meaningful step → patient again</text>
    <text className="small" x="300" y="335">endpoint = improving perfusion + hemorrhage control, not a unit count</text>
  </svg></Frame>;
  return <Frame title="MTP is a room system, not a stack of bags"><svg viewBox="0 0 600 420">
    <rect className="rv-label" x="35" y="70" width="120" height="80" rx="10"/><text className="small" x="95" y="102">BLOOD</text><text className="small" x="95" y="122">BANK</text>
    <path className="rv-line gold" d="M155 110h80"/><rect className="rv-soft" x="235" y="70" width="130" height="80" rx="10"/><text className="small" x="300" y="102">WARMER /</text><text className="small" x="300" y="122">RAPID INFUSER</text>
    <path className="rv-line gold" d="M365 110h80"/><rect className="rv-soft" x="445" y="70" width="120" height="80" rx="10"/><text className="small" x="505" y="102">PATIENT</text><text className="small" x="505" y="122">ACCESS</text>
    <rect className="rv-soft" x="80" y="235" width="120" height="65" rx="10"/><text className="small" x="140" y="272">VERIFY</text>
    <rect className="rv-soft" x="240" y="235" width="120" height="65" rx="10"/><text className="small" x="300" y="272">TRACK</text>
    <rect className="rv-soft" x="400" y="235" width="120" height="65" rx="10"/><text className="small" x="460" y="272">SOURCE</text>
    <text className="small" x="300" y="365">assign roles before cooler arrival · one person owns product/time tally</text>
  </svg></Frame>;
}

function Escharotomy({mode}:{mode:string}) {
  if(mode==='eschar-extremity') return <Frame title="extremity release · mark both lines before cutting"><svg viewBox="0 0 600 420">
    <path className="rv-body" d="M255 42q45-20 90 0l25 120-18 190h-104l-18-190z"/>
    <path className="rv-line gold" d="M250 66q-22 120-18 270"/><path className="rv-line gold" d="M350 66q22 120 18 270"/>
    <text className="small" x="205" y="75">MID-MEDIAL</text><text className="small" x="395" y="75">MID-LATERAL</text>
    <circle className="rv-ring" cx="262" cy="160" r="18"/><text className="small" x="138" y="165">medial epicondyle · ulnar nerve behind</text>
    <circle className="rv-ring" cx="344" cy="268" r="18"/><text className="small" x="425" y="273">fibular head/neck · peroneal nerve</text>
    <circle className="rv-ring" cx="272" cy="332" r="18"/><text className="small" x="118" y="350">medial malleolus · posterior tibial bundle behind</text>
    <text className="small" x="300" y="395">start ~1 cm before burn · cross involved joint · finish ~1 cm beyond burn</text>
  </svg></Frame>;
  if(mode==='eschar-depth') return <Frame title="depth endpoint · eschar opens to subcutaneous fat"><svg viewBox="0 0 600 420">
    <rect className="rv-soft" x="75" y="70" width="450" height="55" rx="8"/><text className="small" x="300" y="103">RIGID ESCHAR / FULL-THICKNESS SKIN</text>
    <rect className="rv-label" x="75" y="125" width="450" height="105" rx="8"/><text className="small" x="300" y="180">SUBCUTANEOUS FAT · STOP DEPTH</text>
    <rect className="rv-soft" x="75" y="230" width="450" height="58" rx="8"/><text className="small" x="300" y="264">DEEP FASCIA · DO NOT ENTER FOR ESCHAROTOMY</text>
    <rect className="rv-soft" x="75" y="288" width="450" height="62" rx="8"/><text className="small" x="300" y="324">MUSCLE</text>
    <path className="rv-line gold" d="M300 44v136"/><path className="rv-line bad" d="M300 230v118"/>
    <text className="small" x="390" y="155">edges separate / fat bulges</text><text className="small" x="392" y="253">fasciotomy is a different operation</text>
  </svg></Frame>;
  if(mode==='eschar-chest') return <Frame title="thoracic release · free a mobile chest-wall plate"><svg viewBox="0 0 600 420">
    <path className="rv-body" d="M135 55q165-48 330 0l55 290H80z"/>
    <path className="rv-line gold" d="M205 78v238M395 78v238"/><text className="small" x="182" y="65">ANTERIOR AXILLARY</text><text className="small" x="418" y="65">ANTERIOR AXILLARY</text>
    <path className="rv-line gold" d="M205 316q95 55 190 0"/><text className="small" x="300" y="370">SUBCOSTAL / EPIGASTRIC CONNECTOR IF NEEDED</text>
    <path className="rv-line" d="M160 112h280"/><text className="small" x="300" y="102">clavicular region</text>
    <text className="small" x="300" y="205">release the rigid “breastplate”</text>
    <text className="small" x="300" y="397">reassess chest excursion · airway pressure · delivered volume</text>
  </svg></Frame>;
  if(mode==='eschar-setup') return <Frame title="setup · cut only after the map and monitoring exist"><svg viewBox="0 0 600 420">
    <rect className="rv-soft" x="55" y="70" width="140" height="80" rx="10"/><text className="small" x="125" y="98">DOPPLER</text><text className="small" x="125" y="120">PULSE-OX</text>
    <rect className="rv-soft" x="230" y="70" width="140" height="80" rx="10"/><text className="small" x="300" y="98">STERILE FIELD</text><text className="small" x="300" y="120">DRAPES · GLOVES</text>
    <rect className="rv-soft" x="405" y="70" width="140" height="80" rx="10"/><text className="small" x="475" y="98">SCALPEL / CAUTERY</text><text className="small" x="475" y="120">HEMOSTASIS READY</text>
    <path className="rv-line gold" d="M90 235h420"/><circle className="rv-dot" cx="140" cy="235" r="8"/><circle className="rv-dot" cx="300" cy="235" r="8"/><circle className="rv-dot" cx="460" cy="235" r="8"/>
    <text className="small" x="140" y="215">baseline</text><text className="small" x="300" y="215">mark</text><text className="small" x="460" y="215">release</text>
    <text className="small" x="300" y="325">analgesia / sedation plan · local anesthetic in viable margins when required</text>
  </svg></Frame>;
  if(mode==='eschar-aftercare') return <Frame title="aftercare · the physiology must stay improved"><svg viewBox="0 0 600 420">
    <path className="rv-line gold" d="M75 110h450"/><circle className="rv-dot" cx="135" cy="110" r="8"/><circle className="rv-dot" cx="300" cy="110" r="8"/><circle className="rv-dot" cx="465" cy="110" r="8"/>
    <text className="small" x="135" y="90">HEMOSTASIS</text><text className="small" x="300" y="90">DRESS OPEN RELEASE</text><text className="small" x="465" y="90">RECHECK</text>
    <path className="rv-wave" d="M95 250h50l14-35 18 70 18-35h55"/><text className="small" x="170" y="315">distal Doppler / pulse-ox</text>
    <path className="rv-wave" d="M350 250h42l15-28 18 56 18-28h62"/><text className="small" x="430" y="315">airway pressure / delivered volume</text>
    <text className="small" x="300" y="382">edema continues to evolve · serial exams continue after the release</text>
  </svg></Frame>;
  return <Frame title="constricting burn · prove the problem before release"><svg viewBox="0 0 600 420">
    <ellipse className="rv-ring gold" cx="190" cy="205" rx="85" ry="125"/><path className="rv-line bad" d="M105 205h170"/><text className="small" x="190" y="205">RIGID ESCHAR</text>
    <path className="rv-wave" d="M340 150h40l14-30 17 60 18-30h65"/><text className="small" x="420" y="205">DOPPLER / DISTAL FLOW</text>
    <path className="rv-wave" d="M340 280h38l13-28 17 56 16-28h70"/><text className="small" x="420" y="335">CHEST EXCURSION / VENT</text>
  </svg></Frame>;
}

function Seizure({mode}:{mode:string}) {
  if(mode==='seizure-eeg') return <Frame title="convulsions stopped · brain may not have"><svg viewBox="0 0 600 420"><path className="rv-wave" d="M55 210l18-60 18 118 18-96 18 62 18-112 18 142 18-110 18 56 18-82 18 108 18-74 18 38 18-95 18 133 18-118 18 92 18-62 18 42 18-78 18 100-18 22"/><text className="small" x="300" y="310">persistent altered state → consider EEG</text></svg></Frame>;
  if(mode==='seizure-support') return <Frame title="protect physiology while the clock keeps running"><svg viewBox="0 0 600 420">
    <rect className="rv-soft" x="35" y="70" width="120" height="70" rx="10"/><text className="small" x="95" y="102">SUCTION</text><text className="small" x="95" y="120">ON</text>
    <rect className="rv-soft" x="175" y="70" width="120" height="70" rx="10"/><text className="small" x="235" y="102">OXYGEN /</text><text className="small" x="235" y="120">BVM</text>
    <rect className="rv-soft" x="315" y="70" width="120" height="70" rx="10"/><text className="small" x="375" y="102">ECG + SpO₂</text><text className="small" x="375" y="120">MONITOR</text>
    <rect className="rv-soft" x="455" y="70" width="110" height="70" rx="10"/><text className="small" x="510" y="102">GLUCOSE</text><text className="small" x="510" y="120">EARLY</text>
    <path className="rv-line gold" d="M90 240h420"/><text className="small" x="300" y="225">IV if fast · approved alternate route if access delays therapy</text>
    <text className="small" x="300" y="330">stabilization and medication sequence run in parallel</text>
  </svg></Frame>;
  if(mode==='seizure-first' || mode==='seizure-second') return <Frame title={mode==='seizure-first'?'first-line · full protocol dose · mark time':'treatment phase changed · prepare next-line therapy'}><svg viewBox="0 0 600 420">
    <rect className="rv-label" x="65" y="85" width="150" height="85" rx="10"/><text className="small" x="140" y="115">ACTIVE PROTOCOL</text><text className="small" x="140" y="137">{mode==='seizure-first'?'FIRST-LINE ROW':'NEXT-LINE ROW'}</text>
    <rect className="rv-soft" x="255" y="85" width="135" height="85" rx="10"/><text className="small" x="322" y="115">READ DRUG +</text><text className="small" x="322" y="137">CONCENTRATION</text>
    <rect className="rv-soft" x="430" y="85" width="115" height="85" rx="10"/><text className="small" x="487" y="115">DOSE →</text><text className="small" x="487" y="137">VOLUME</text>
    <path className="rv-line gold" d="M140 230h347"/><circle className="rv-dot" cx="140" cy="230" r="7"/><circle className="rv-dot" cx="322" cy="230" r="7"/><circle className="rv-dot" cx="487" cy="230" r="7"/>
    <text className="small" x="300" y="305">{mode==='seizure-first'?'give complete dose · mark completion time · start reassessment interval':'verify access · program pump/syringe · airway/rescue setup occurs in parallel'}</text>
  </svg></Frame>;
  if(mode==='seizure-airway') return <Frame title="airway escalation does not stop seizure treatment"><svg viewBox="0 0 600 420">
    <rect className="rv-soft" x="55" y="70" width="150" height="80" rx="10"/><text className="small" x="130" y="102">SUCTION +</text><text className="small" x="130" y="122">OXYGENATION</text>
    <rect className="rv-soft" x="225" y="70" width="150" height="80" rx="10"/><text className="small" x="300" y="102">AIRWAY +</text><text className="small" x="300" y="122">RESCUE PLAN</text>
    <rect className="rv-soft" x="395" y="70" width="150" height="80" rx="10"/><text className="small" x="470" y="102">POST-TUBE</text><text className="small" x="470" y="122">SEDATION</text>
    <path className="rv-wave" d="M95 250h42l14-30 18 60 18-30h70"/><text className="small" x="175" y="315">paralysis can hide ongoing seizure</text>
    <path className="rv-line gold" d="M330 250h175"/><text className="small" x="418" y="235">continue seizure-control pathway</text>
  </svg></Frame>;
  return <Frame title="status is a time problem"><svg viewBox="0 0 600 420"><path className="rv-line gold" d="M75 220h450"/><circle className="rv-dot" cx="140" cy="220" r="9"/><circle className="rv-dot" cx="295" cy="220" r="9"/><circle className="rv-dot" cx="450" cy="220" r="9"/><text className="small" x="140" y="190">recognize</text><text className="small" x="295" y="190">first-line</text><text className="small" x="450" y="190">escalate</text><text className="small" x="300" y="278">do not restart the same ineffective loop</text></svg></Frame>;
}
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
