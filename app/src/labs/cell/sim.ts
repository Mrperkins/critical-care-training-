/**
 * Particle simulator for the cell scenes. Molecules diffuse inside their compartment (inside the
 * cell / outside it) and can only cross the membrane through a transporter: the Na⁺/K⁺ pump runs
 * visible 3 Na⁺ out / 2 K⁺ in cycles, channels pass one ion at a time, aquaporins pass water.
 * Counts are steered toward the targets from model.ts, so every crossing the learner sees is the
 * physiology engine's net flux (plus the matching back-flux that keeps a steady state steady).
 * Pure TS on top of three's Vector3; no rendering. Deterministic for a given seed.
 */
import * as THREE from 'three';
import type { CellModel, SpeciesKey, Targets, TransporterKind } from './model';

export type Comp = 'in' | 'out';
export interface Shape {
  /** signed distance to the membrane at scale 1 (< 0 inside the cell) */
  sdf(p: THREE.Vector3): number;
  /** where inside particles may be (e.g. the cytosol under a slice); defaults to sdf */
  sdfIn?(p: THREE.Vector3): number;
  /** inside the drawable outer region */
  outer(p: THREE.Vector3): boolean;
  /** half thickness of the membrane incl. particle radius */
  margin: number;
  sampleIn(r: () => number, out: THREE.Vector3): THREE.Vector3;
  sampleOut(r: () => number, out: THREE.Vector3): THREE.Vector3;
  /** a point near the edge of the outer region (where plasma exchange happens) */
  sampleEdge(r: () => number, out: THREE.Vector3): THREE.Vector3;
  /** can the cell change size? (a membrane patch cannot) */
  scalable: boolean;
}

export type PState = 'free' | 'move' | 'held' | 'fade-in' | 'fade-out' | 'dead';
export interface Particle {
  id: number; sp: SpeciesKey; comp: Comp; dest: Comp;
  pos: THREE.Vector3; vel: THREE.Vector3;
  state: PState; alpha: number;
  /** tween */ from: THREE.Vector3; to: THREE.Vector3; t: number; dur: number; next: (() => void) | null;
  /** what it is doing, for tap-to-identify */ doing: string;
  site: number;
}
export interface Site {
  i: number; kind: TransporterKind; pos: THREE.Vector3; n: THREE.Vector3;
  /** pump: 0 = open to the inside (E1), 1 = open to the outside (E2) */ phase: number; phaseTo: number;
  /** 0–1 glow while something passes */ flash: number;
  /** Na⁺ channel: 0 = gate open/ready, 1 = inactivated (plugged) */ gate: number; inactivated: boolean;
  /** channel opened by a beat */ open: number;
  busy: boolean; busyT: number; timer: number; step: string; cargo: Particle[];
  /** ATP just used (pump), for the zoom view */ atp: number;
  count: number;
}
export interface SiteSpec { kind: TransporterKind; pos: THREE.Vector3; n: THREE.Vector3 }
export interface SimConfig {
  /** speed particles travel to a transporter (units/s) */ speed: number;
  /** diffusion strength */ sigma: number;
  /** distance of a transporter's mouth from the membrane mid-plane */ mouth: number;
  /** time to pass through a channel (s) */ transit: number;
  /** pump cycles per second per pump at rate 1 */ pumpCycle: number;
  /** particles added/removed at the edge per second */ exchange: number;
  /** max channel crossings started per second, per species */ flow: number;
  sites: SiteSpec[];
  /** count scale (whole cell 1, membrane patch ~0.4) */ scale: number;
}

const V = () => new THREE.Vector3();
const K_ROUTE: Partial<Record<SpeciesKey, { in?: TransporterKind; out?: TransporterKind }>> = {
  k: { out: 'kchan' }, na: { in: 'nachan' }, ca: { in: 'cachan' }, w: { in: 'aqp', out: 'aqp' }, osm: { in: 'vrac', out: 'vrac' },
};
const DOING: Record<string, string> = {
  free_in: 'inside the cell (cytosol)', free_out: 'outside the cell (extracellular fluid)',
};

export class CellSim {
  shape: Shape; cfg: SimConfig; particles: Particle[] = []; sites: Site[] = [];
  model: CellModel | null = null; targets: Targets = {};
  /** displayed cell volume (relaxes toward the model's) and the uniform scale it implies */
  vol = 1; scale = 1;
  time = 0; beatClock = 0; beatPulse = 0; beats = 0;
  private rnd: () => number; private nextId = 1; private flowAcc: Partial<Record<SpeciesKey, number>> = {};
  private tmp = V(); private tmp2 = V(); private grad = V();
  private seeded = false; private swapClock = 0; private exAccSp: Partial<Record<SpeciesKey, number>> = {};
  /** callbacks on sim time (pausing the sim pauses them) */
  private timers: { left: number; fn: () => void }[] = [];
  later(fn: () => void, s: number) { this.timers.push({ left: s, fn }); }

  constructor(shape: Shape, cfg: SimConfig, seed = 7) {
    this.shape = shape; this.cfg = cfg;
    let s = seed >>> 0; this.rnd = () => ((s = (s * 1664525 + 1013904223) >>> 0) / 4294967296);
    this.sites = cfg.sites.map((sp, i) => ({ i, kind: sp.kind, pos: sp.pos.clone(), n: sp.n.clone().normalize(), phase: 0, phaseTo: 0, flash: 0, gate: 0, inactivated: false, open: 0, busy: false, busyT: 0, timer: this.rnd() * 2, step: 'idle', cargo: [], atp: 0, count: 0 }));
  }

  /* ---------------------------------------------------------------- geometry at the current scale */
  sdf(p: THREE.Vector3) { const s = this.scale; return this.shape.sdf(this.tmp2.copy(p).divideScalar(s)) * s; }
  sdfIn(p: THREE.Vector3) { if (!this.shape.sdfIn) return this.sdf(p); const s = this.scale; return this.shape.sdfIn(this.tmp2.copy(p).divideScalar(s)) * s; }
  private gradient(p: THREE.Vector3, out: THREE.Vector3, inside = false) {
    const e = 0.01; const x = p.x, y = p.y, z = p.z; const f = (a: number, b: number, c: number) => (inside ? this.sdfIn(this.tmp.set(a, b, c)) : this.sdf(this.tmp.set(a, b, c)));
    return out.set(f(x + e, y, z) - f(x - e, y, z), f(x, y + e, z) - f(x, y - e, z), f(x, y, z + e) - f(x, y, z - e)).normalize();
  }
  /** site position/normal at the current scale */
  sitePos(s: Site, out: THREE.Vector3) { return out.copy(s.pos).multiplyScalar(this.scale); }
  mouth(s: Site, side: Comp, out: THREE.Vector3, jitter = 0) {
    this.sitePos(s, out).addScaledVector(s.n, (side === 'out' ? 1 : -1) * this.cfg.mouth);
    if (jitter) out.add(this.tmp.set(this.rnd() - 0.5, this.rnd() - 0.5, this.rnd() - 0.5).multiplyScalar(jitter));
    return out;
  }
  private okAt(p: THREE.Vector3, comp: Comp) { const m = this.shape.margin; return comp === 'in' ? this.sdfIn(p) < -m : this.sdf(p) > m && this.shape.outer(p); }

  /* ---------------------------------------------------------------- particles */
  private make(sp: SpeciesKey, comp: Comp, where: 'in' | 'out' | 'edge', fade: boolean): Particle {
    const pos = V(); const r = this.rnd;
    for (let k = 0; k < 40; k++) {
      if (where === 'in') this.shape.sampleIn(r, pos).multiplyScalar(this.scale); else if (where === 'out') this.shape.sampleOut(r, pos); else this.shape.sampleEdge(r, pos);
      if (this.okAt(pos, comp)) break;
    }
    const p: Particle = { id: this.nextId++, sp, comp, dest: comp, pos, vel: V(), state: fade ? 'fade-in' : 'free', alpha: fade ? 0 : 1, from: V(), to: V(), t: 0, dur: 0, next: null, doing: '', site: -1 };
    p.doing = where === 'edge' ? 'just arrived from the blood' : DOING['free_' + comp];
    this.particles.push(p); return p;
  }
  count(sp: SpeciesKey, comp: Comp) { let n = 0; for (const p of this.particles) if (p.sp === sp && p.dest === comp && p.state !== 'fade-out' && p.state !== 'dead') n++; return n; }
  private freeOf(sp: SpeciesKey, comp: Comp, near?: THREE.Vector3, skip?: Set<Particle>): Particle | null {
    let best: Particle | null = null, bd = Infinity;
    for (const p of this.particles) {
      if (p.sp !== sp || p.comp !== comp || p.state !== 'free' || (skip && skip.has(p))) continue;
      const d = near ? p.pos.distanceToSquared(near) + this.rnd() * 0.6 : this.rnd(); if (d < bd) { bd = d; best = p; }
    }
    return best;
  }
  private moveTo(p: Particle, to: THREE.Vector3, speed: number, next: (() => void) | null, doing: string, minDur = 0.12) {
    p.state = 'move'; p.from.copy(p.pos); p.to.copy(to); p.t = 0; p.dur = Math.max(minDur, p.pos.distanceTo(to) / speed); p.next = next; p.doing = doing;
  }
  private release(p: Particle, comp: Comp, s: Site, doing: string) {
    p.comp = comp; p.dest = comp; p.state = 'free'; p.site = -1; p.doing = doing;
    p.vel.copy(s.n).multiplyScalar((comp === 'out' ? 1 : -1) * this.cfg.speed * 0.35);
  }

  /* ---------------------------------------------------------------- model */
  setModel(m: CellModel, t: Targets) {
    this.model = m; this.targets = t;
    // Na⁺ channels: a fraction of them sits inactivated at the resting potential
    const na = this.sites.filter((s) => s.kind === 'nachan');
    na.forEach((s, i) => { s.inactivated = (i + 0.5) / na.length > m.naAvail; });
    if (!this.seeded) { // first model: fill without fading
      this.vol = m.volume; this.scale = this.shape.scalable ? Math.cbrt(this.vol) : 1;
      for (const [sp, c] of Object.entries(t) as [SpeciesKey, { in: number; out: number }][]) {
        for (let i = 0; i < c.in; i++) this.make(sp, 'in', 'in', false);
        for (let i = 0; i < c.out; i++) this.make(sp, 'out', 'out', false);
      }
      this.seeded = true;
    }
    // species no longer shown fade away
    for (const p of this.particles) if (!(p.sp in t) && p.state !== 'dead') p.state = 'fade-out';
  }

  /* ---------------------------------------------------------------- transport */
  private leastBusy(kind: TransporterKind, near?: THREE.Vector3, needReady = false): Site | null {
    let best: Site | null = null, bd = Infinity;
    for (const s of this.sites) {
      if (s.kind !== kind || s.busy || (needReady && s.inactivated)) continue;
      const d = near ? this.sitePos(s, this.tmp).distanceToSquared(near) : this.rnd(); if (d < bd) { bd = d; best = s; }
    }
    return best;
  }
  /** One particle through a channel. */
  channel(sp: SpeciesKey, from: Comp, kind: TransporterKind, opts: { needReady?: boolean; consume?: boolean } = {}): boolean {
    const to: Comp = from === 'in' ? 'out' : 'in';
    const p = this.freeOf(sp, from); if (!p) return false;
    const s = this.leastBusy(kind, p.pos, opts.needReady); if (!s) return false;
    s.busy = true; s.busyT = 0; p.dest = to; p.site = s.i;
    const through = { kchan: 'the K⁺ channel', nachan: 'a Na⁺ channel', cachan: 'the L-type Ca²⁺ channel', aqp: 'an aquaporin', vrac: 'an osmolyte channel', pump: 'the pump' }[kind];
    const dir = to === 'out' ? 'leaving the cell' : 'entering the cell';
    this.moveTo(p, this.mouth(s, from, V(), 0.04), this.cfg.speed, () => {
      s.flash = 1; s.count++;
      this.moveTo(p, this.mouth(s, to, V(), 0.04), this.cfg.mouth * 2 / this.cfg.transit, () => {
        s.busy = false; this.release(p, to, s, `${dir} through ${through}`);
        if (opts.consume) { p.state = 'fade-out'; p.doing = 'entered and triggered contraction'; }
        else this.later(() => { if (p.state === 'free') p.doing = DOING['free_' + to]; }, 2.5);
      }, `${dir} through ${through}`);
    }, `heading for ${through}`);
    return true;
  }
  private pumpStep(s: Site, dt: number, rate: number) {
    s.phase += (s.phaseTo - s.phase) * Math.min(1, dt * 7);
    if (s.busy) return;
    s.timer -= dt; if (s.timer > 0) return;
    s.busy = true; s.busyT = 0; s.step = 'bind-na'; s.cargo = [];
    const skip = new Set<Particle>(); const nNa: Particle[] = [];
    for (let k = 0; k < 3; k++) { const p = this.freeOf('na', 'in', this.sitePos(s, this.tmp), skip); if (!p) break; skip.add(p); nNa.push(p); }
    let arrived = 0; const need = nNa.length;
    const flipOut = () => {
      s.step = 'flip-out'; s.phaseTo = 1; s.atp = 1; s.flash = 1;
      let done = 0; if (!need) return bindK();
      for (const p of nNa) this.moveTo(p, this.mouth(s, 'out', V(), 0.06), this.cfg.mouth * 2 / 0.45, () => { this.release(p, 'out', s, 'just pumped out by the Na⁺/K⁺ pump'); if (++done === need) bindK(); }, 'carried out by the pump (3 Na⁺ per ATP)');
    };
    const bindK = () => {
      s.step = 'bind-k'; const kk: Particle[] = []; const sk = new Set<Particle>();
      for (let k = 0; k < 2; k++) { const p = this.freeOf('k', 'out', this.sitePos(s, this.tmp), sk); if (!p) break; sk.add(p); kk.push(p); p.dest = 'in'; }
      if (!kk.length) return finish();
      let got = 0, done = 0;
      for (const p of kk) this.moveTo(p, this.mouth(s, 'out', V(), 0.06), this.cfg.speed, () => {
        p.state = 'held'; if (++got < kk.length) return;
        s.step = 'flip-in'; s.phaseTo = 0; s.flash = 1;
        for (const q of kk) this.moveTo(q, this.mouth(s, 'in', V(), 0.06), this.cfg.mouth * 2 / 0.45, () => { this.release(q, 'in', s, 'just brought in by the Na⁺/K⁺ pump'); if (++done === kk.length) finish(); }, 'carried in by the pump (2 K⁺ per ATP)');
      }, 'being picked up by the Na⁺/K⁺ pump');
    };
    const finish = () => { s.busy = false; s.step = 'idle'; s.count++; s.timer = (0.6 + 0.8 * this.rnd()) / Math.max(0.05, this.cfg.pumpCycle * rate); };
    if (!need) { flipOut(); return; }
    for (const p of nNa) { p.dest = 'out'; this.moveTo(p, this.mouth(s, 'in', V(), 0.06), this.cfg.speed, () => { p.state = 'held'; if (++arrived === need) flipOut(); }, 'being picked up by the Na⁺/K⁺ pump'); }
  }

  /* ---------------------------------------------------------------- step */
  step(dtRaw: number) {
    const dt = Math.min(0.05, Math.max(0, dtRaw)); this.time += dt; const m = this.model; if (!m) return;
    const cfg = this.cfg;
    // volume relaxes toward the model (water flux is what we show while it does)
    const prevVol = this.vol; this.vol += (m.volume - this.vol) * Math.min(1, dt * 0.55);
    if (this.shape.scalable) this.scale = Math.cbrt(this.vol);
    void prevVol;
    // timers
    for (let i = 0; i < this.timers.length; i++) { const t = this.timers[i]; t.left -= dt; if (t.left <= 0) { this.timers.splice(i--, 1); t.fn(); } }
    // sites
    const naIn = this.count('na', 'in'), naT = this.targets.na?.in ?? 1;
    const pumpRate = m.pumpRate * Math.min(1.8, Math.max(0.35, 0.55 + 0.45 * naIn / Math.max(1, naT)));
    for (const s of this.sites) {
      if (s.busy) { s.busyT += dt; if (s.busyT > 8) { s.busy = false; s.step = 'idle'; s.phaseTo = 0; s.timer = 0.5; } }
      s.flash = Math.max(0, s.flash - dt * 2.2); s.atp = Math.max(0, s.atp - dt * 1.4); s.open = Math.max(0, s.open - dt * 4);
      if (s.kind === 'nachan') s.gate += ((s.inactivated ? 1 : 0) - s.gate) * Math.min(1, dt * 3);
      if (s.kind === 'pump') this.pumpStep(s, dt, pumpRate);
    }
    // heartbeat: Na⁺ channels open and Na⁺ rushes in; Ca²⁺ enters through L-type channels
    this.beatPulse = Math.max(0, this.beatPulse - dt * 3);
    if (m.hr > 0) {
      this.beatClock += dt; const per = 60 / m.hr;
      if (this.beatClock >= per) {
        this.beatClock -= per; this.beats++; this.beatPulse = m.beat;
        for (const s of this.sites) if ((s.kind === 'nachan' && !s.inactivated) || s.kind === 'cachan') s.open = 1;
        const e = cfg.scale * 1.5 * m.beat * m.naAvail / 0.79; const burst = Math.floor(e) + (this.rnd() < e % 1 ? 1 : 0);
        // (the pump keeps pace in a living cell: skip the burst while it is still catching up)
        if (naIn <= naT + 1) for (let i = 0; i < burst; i++) this.channel('na', 'out', 'nachan', { needReady: true });
        if (this.targets.ca && this.rnd() < 0.9 * m.beat) this.channel('ca', 'out', 'cachan', { consume: true });
      }
    }
    // steer counts toward targets through the routes
    for (const [sp, tg] of Object.entries(this.targets) as [SpeciesKey, { in: number; out: number }][]) {
      const route = K_ROUTE[sp] ?? {}; const nIn = this.count(sp, 'in'), nOut = this.count(sp, 'out');
      const errIn = tg.in - nIn; this.flowAcc[sp] = (this.flowAcc[sp] ?? 0) + dt * cfg.flow * (sp === 'w' ? 1.6 : 1);
      if (this.flowAcc[sp]! >= 1) {
        this.flowAcc[sp] = 0;
        if (errIn >= 1 && route.in) {
          const ok = this.channel(sp, 'out', route.in);
          if (!ok && sp === 'osm') { const p = this.make(sp, 'out', 'out', true); const s = this.leastBusy('vrac'); if (s) p.pos.copy(this.mouth(s, 'out', V(), 0.3)); }
        } else if (errIn <= -1 && route.out) {
          if (this.channel(sp, 'in', route.out) && sp === 'k' && this.rnd() < m.kReturn) this.later(() => this.channel('k', 'out', 'kchan'), 0.3 + this.rnd() * 0.4);
        } else if (errIn <= -1 && !route.out && !route.in) { const p = this.freeOf(sp, 'in'); if (p) { p.state = 'fade-out'; p.dest = 'out'; } }
        else if (errIn >= 1 && !route.in && sp !== 'k' && sp !== 'na') this.make(sp, 'in', 'in', true);
      }
      // plasma exchange at the edge of the outer region
      const errOut = tg.out - nOut; this.exAccSp[sp] = (this.exAccSp[sp] ?? 0) + dt * cfg.exchange;
      if (this.exAccSp[sp]! >= 1 && Math.abs(errOut) >= (sp === 'osm' ? 1 : 2)) {
        this.exAccSp[sp] = 0;
        if (errOut > 0) { const p = this.make(sp, 'out', 'edge', true); p.doing = 'arriving from the blood'; }
        else { const p = this.farthestFree(sp); if (p) { p.state = 'fade-out'; p.dest = 'in'; p.doing = sp === 'osm' ? 'washing away' : 'carried away in the blood'; } }
      }
    }
    // aquaporins are never idle: a little water crosses both ways all the time
    if (this.targets.w) { this.swapClock += dt; if (this.swapClock > 1.4 / cfg.scale) { this.swapClock = 0; this.channel('w', 'out', 'aqp'); this.channel('w', 'in', 'aqp'); } }
    // move particles
    const sg = cfg.sigma, damp = Math.exp(-dt * 2.5);
    for (const p of this.particles) {
      if (p.state === 'dead') continue;
      if (p.state === 'fade-in') { p.alpha = Math.min(1, p.alpha + dt * 1.8); if (p.alpha >= 1) p.state = 'free'; }
      if (p.state === 'fade-out') { p.alpha -= dt * 1.5; if (p.alpha <= 0) { p.state = 'dead'; continue; } }
      if (p.state === 'move') {
        p.t += dt; const u = Math.min(1, p.t / p.dur); const e = u * u * (3 - 2 * u);
        p.pos.lerpVectors(p.from, p.to, e);
        if (u >= 1) { p.state = 'held'; const f = p.next; p.next = null; f?.(); }
        continue;
      }
      if (p.state === 'held') continue;
      p.vel.x = p.vel.x * damp + (this.rnd() - 0.5) * sg; p.vel.y = p.vel.y * damp + (this.rnd() - 0.5) * sg; p.vel.z = p.vel.z * damp + (this.rnd() - 0.5) * sg;
      this.tmp.copy(p.pos).addScaledVector(p.vel, dt);
      if (this.okAt(this.tmp, p.comp)) p.pos.copy(this.tmp);
      else { p.vel.multiplyScalar(-0.6); if (!this.okAt(p.pos, p.comp)) this.pushInto(p); }
    }
    // tidy
    if (this.particles.length > 40 && this.time % 1 < dt) this.particles = this.particles.filter((p) => p.state !== 'dead');
  }
  /** after the cell changes size, move a particle back to its own side */
  private pushInto(p: Particle) {
    const m = this.shape.margin;
    for (let k = 0; k < 6; k++) {
      const inside = p.comp === 'in'; const d = inside ? this.sdfIn(p.pos) : this.sdf(p.pos); this.gradient(p.pos, this.grad, inside);
      if (inside) { if (d < -m) return; p.pos.addScaledVector(this.grad, -(d + m * 1.6)); }
      else { if (d > m && this.shape.outer(p.pos)) return; if (d <= m) p.pos.addScaledVector(this.grad, m * 1.6 - d); else p.pos.multiplyScalar(0.97); }
    }
  }
  private farthestFree(sp: SpeciesKey) { let best: Particle | null = null, bd = -1; for (const p of this.particles) { if (p.sp !== sp || p.comp !== 'out' || p.state !== 'free') continue; const d = this.sdf(p.pos) + this.rnd() * 0.5; if (d > bd) { bd = d; best = p; } } return best; }
}

