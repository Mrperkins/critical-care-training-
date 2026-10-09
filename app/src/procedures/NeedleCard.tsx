/** Needle thoracostomy: the real site, then a to-scale depth chart (chest-wall layers vs catheter length); insertion decompresses the REAL vent 'ptx' patient. */
import { Knob } from '../vent/VentPanel';
import { useNeedle, setNeedle, insertNeedle } from './needleStore';
import { needlePath, SITES, type NeedleSite, type RibPos, type Habitus } from './needle';
import { RealStudy } from '../scene/imaging/RealStudy';

const LAYER_COL: Record<string, string> = { skin: '#c99682', fat: '#d8bf82', muscle: '#a5524b', intercostal: '#86413d', pleura: '#d9d4c8', space: '#6fb3c4', lung: '#d9939a' };
export function NeedleCard() {
  const { input, inserted } = useNeedle(); const r = needlePath(input);
  const span = Math.max(input.length, r.wall + 1.5); const pct = (cm: number) => `${Math.min(100, (cm / span) * 100)}%`;
  const pick = <T extends string>(label: string, cur: T, opts: [T, string][], on: (v: T) => void) => (
    <div className="nd-row"><span className="muted small">{label}</span><div className="chips">{opts.map(([k, l]) => <button key={k} className={`chip${cur === k ? ' on' : ''}`} onClick={() => on(k)}>{l}</button>)}</div></div>);
  return (
    <section className="card needle">
      <div className="card-h"><h3>Needle thoracostomy</h3><span className="muted small">{SITES[input.site].short} · wall {r.wall.toFixed(1)} cm</span></div>
      <RealStudy compact kinds={['procedure']} want={['needle_decompression_site']} required={['needle_decompression_site']} label="decompression site photo" reading={[`${SITES[input.site].short}: chest wall ${r.wall.toFixed(1)} cm here.`, r.summary]} />
      <div className="depth-chart" role="img" aria-label={`Depth chart: chest wall ${r.wall.toFixed(1)} centimetres, catheter ${input.length} centimetres${inserted ? `, tip reached ${r.depth.toFixed(1)} centimetres` : ''}`}>
        <div className="dc-bar">{r.layers.filter((l) => l.from < span).map((l) => <span key={l.id} style={{ left: pct(l.from), width: pct(Math.min(l.to, span) - l.from), background: LAYER_COL[l.id] ?? '#777' }} title={`${l.name}: ${l.from.toFixed(1)}–${Math.min(l.to, span).toFixed(1)} cm`} />)}</div>
        <div className="dc-cath" style={{ width: pct(input.length) }}><i>{input.length} cm catheter</i></div>
        {inserted && <div className={`dc-tip ${r.outcome}`} style={{ left: pct(r.depth) }} title={`tip at ${r.depth.toFixed(1)} cm`} />}
        <div className="dc-scale"><span>skin 0</span><span style={{ left: pct(r.wall) }}>pleura {r.wall.toFixed(1)} cm</span><span style={{ left: '100%' }}>{span.toFixed(0)} cm</span></div>
        <div className="dc-key">{r.layers.filter((l) => l.from < span).map((l) => <span key={l.id}><i style={{ background: LAYER_COL[l.id] ?? '#777' }} />{l.name}</span>)}</div>
      </div>
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
