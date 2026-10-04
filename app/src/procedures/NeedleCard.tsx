/** Needle thoracostomy cross-section: layers, ribs with the neurovascular bundle, the needle's path; insertion decompresses the REAL vent 'ptx' patient. */
import { Knob } from '../vent/VentPanel';
import { useNeedle, setNeedle, insertNeedle } from './needleStore';
import { needlePath, SITES, type NeedleSite, type RibPos, type Habitus } from './needle';

const PX = 24; // px per cm
export function NeedleCard() {
  const { input, inserted } = useNeedle(); const r = needlePath(input);
  const W = 520, H = 260, top = 18, x0 = 30, x1 = 370;
  const y = (cm: number) => top + cm * PX;
  const fill: Record<string, string> = { skin: '#d9a38a', fat: '#e8cf8f', muscle: '#b5524a', intercostal: '#8f3d3a', pleura: '#e6e1d6', space: input.tension ? 'rgba(124,196,212,.18)' : 'rgba(124,196,212,.06)', lung: '#e7a0a5' };
  const SHORT: Record<string, string> = { space: input.tension ? 'Pleural air (tension)' : 'Pleural space', muscle: SITES[input.site].muscle.split(' / ')[0], fat: 'Subcutaneous fat', intercostal: 'Intercostals' };
  const labY: Record<string, number> = {}; let prevY = -99;
  for (const l of r.layers) { const want = y((l.from + Math.min(l.to, l.from + 2)) / 2) + 3; prevY = Math.max(want, prevY + 11); labY[l.id] = prevY; }
  const icL = r.layers.find((l) => l.id === 'intercostal')!;
  const ribY = (icL.from + icL.to) / 2; const upperX = 120, lowerX = 300;
  const entryX = input.rib === 'overLower' ? lowerX - 52 : input.rib === 'underUpper' ? upperX + 52 : lowerX;
  const shown = inserted ? r.depth : Math.min(r.depth, 0); const ang = (input.angle * Math.PI) / 180;
  const tipX = entryX + Math.tan(ang) * shown * PX, tipY = y(shown);
  const pick = <T extends string>(label: string, cur: T, opts: [T, string][], on: (v: T) => void) => (
    <div className="nd-row"><span className="muted small">{label}</span><div className="chips">{opts.map(([k, l]) => <button key={k} className={`chip${cur === k ? ' on' : ''}`} onClick={() => on(k)}>{l}</button>)}</div></div>);
  return (
    <section className="card needle">
      <div className="card-h"><h3>Needle thoracostomy</h3><span className="muted small">{SITES[input.site].short} · wall {r.wall.toFixed(1)} cm</span></div>
      <svg viewBox={`0 0 ${W} ${H}`} className="dr-svg" role="img" aria-label={`Chest wall ${r.wall.toFixed(1)} centimetres; ${r.summary}`}>
        {r.layers.map((l) => <g key={l.id}><rect x={x0} y={y(l.from)} width={x1 - x0} height={Math.max(1.5, (Math.min(l.to, 9.9) - l.from) * PX)} fill={fill[l.id]} opacity={l.id === 'lung' ? 0.55 : 0.8} />
          <text x={x1 + 6} y={labY[l.id]} className="dr-lab">{SHORT[l.id] ?? l.name}</text></g>)}
        {[upperX, lowerX].map((x, i) => <g key={x}><ellipse cx={x} cy={y(ribY)} rx={34} ry={14} className="nd-rib" /><text x={x} y={y(ribY) + 3} className="dr-lab c">{i ? 'lower rib' : 'upper rib'}</text></g>)}
        {/* neurovascular bundle in the costal groove under the upper rib: vein, artery, nerve */}
        {[['#5b7fd6', -9], ['#d8483f', 0], ['#e9d27a', 9]].map(([c, dx]) => <circle key={String(dx)} cx={upperX + 22 + Number(dx)} cy={y(ribY) + 17} r={4} fill={String(c)} />)}
        <text x={upperX + 22} y={y(ribY) + 32} className="dr-lab c">V A N</text>
        <line x1={entryX} y1={top - 12} x2={entryX} y2={top} className="nd-aim" />
        {inserted && <><line x1={entryX} y1={top} x2={tipX} y2={tipY} className={`nd-needle ${r.outcome}`} /><circle cx={tipX} cy={tipY} r={3.5} className={`nd-tip ${r.outcome}`} /></>}
        {inserted && r.outcome === 'decompressed' && [0, 1, 2].map((i) => <text key={i} x={tipX + 10 + i * 12} y={tipY - 6 - i * 8} className="nd-air">↑</text>)}
        <line x1={x0 - 8} x2={x0 - 8} y1={y(0)} y2={y(r.wall)} className="nd-scale" /><text x={x0 - 12} y={y(r.wall / 2)} className="dr-lab" textAnchor="end" transform={`rotate(-90 ${x0 - 12} ${y(r.wall / 2)})`}>{r.wall.toFixed(1)} cm</text>
        <line x1={x0} x2={x0 + input.length * PX} y1={H - 8} y2={H - 8} className="nd-cath" /><text x={x0 + input.length * PX + 4} y={H - 5} className="dr-lab">{input.length} cm catheter</text>
      </svg>
      {pick<NeedleSite>('Site', input.site, (Object.keys(SITES) as NeedleSite[]).map((k) => [k, SITES[k].short]), (v) => setNeedle({ site: v }))}
      {pick<RibPos>('At the rib', input.rib, [['overLower', 'Over the top of the rib below'], ['underUpper', 'Under the rib above'], ['midRib', 'On the rib']], (v) => setNeedle({ rib: v }))}
      {pick<Habitus>('Patient', input.habitus, [['thin', 'Thin'], ['average', 'Average'], ['obese', 'Obese']], (v) => setNeedle({ habitus: v }))}
      {pick<'5' | '8'>('Catheter', String(input.length) as '5' | '8', [['5', '5 cm'], ['8', '8 cm']], (v) => setNeedle({ length: +v }))}
      <Knob label="Angle from perpendicular" value={input.angle} min={0} max={50} step={5} unit="°" onChange={(v) => setNeedle({ angle: v })} hint="Perpendicular to the chest wall is the shortest path" />
      <div className="wf-foot"><button className="chip on" onClick={insertNeedle}>Insert</button><button className="linkish" onClick={() => setNeedle({ stopAtAir: input.stopAtAir === false })}>{input.stopAtAir === false ? 'Advancing to the hub' : 'Stopping at air return'} (toggle)</button></div>
      <p className="muted small">{SITES[input.site].note}</p>
      {inserted && <p className={`explain ${r.outcome === 'decompressed' && !r.injuries.length ? 'ok' : 'bad'}`}><b>{r.outcome === 'decompressed' ? '✓ Decompressed. ' : r.outcome === 'short' ? '✗ Too short. ' : r.outcome === 'rib' ? '✗ On the rib. ' : '✗ '}</b>{r.summary}</p>}
      {inserted && r.injuries.length > 0 && <ul className="dr-find">{r.injuries.map((i) => <li key={i} className="bad">{i}</li>)}</ul>}
      <p className="muted small" style={{ marginTop: 6 }}>Wall thicknesses are illustrative teaching values; real patients vary widely. Follow your local protocol for site and device.</p>
    </section>
  );
}
