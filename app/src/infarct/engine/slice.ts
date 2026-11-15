/**
 * Short-axis cross-section of the real ventricular meshes.
 *
 * Cuts a closed myocardium mesh with a plane, chains the cut edges into loops (epicardium outside, endocardium inside),
 * and triangulates the wall ring between them. Each cap vertex carries `aDepth` — 0 on the endocardium, 1 on the
 * epicardium — so a shader can show ischaemia spreading from the inner layer outward, and the coronary territory
 * weights (aRegA/aRegB) interpolated from the cut edge, so the ring is coloured by the same territories as the surface.
 */
import * as THREE from 'three';

export interface SliceLoop { pts: THREE.Vector2[]; p3: THREE.Vector3[]; regA: number[][]; regB: number[][]; area: number }

const EPS = 1e-9;

/** Cut `geo` (indexed, body frame) with the plane through `point` with normal `normal`. Returns null if it misses. */
export function sliceSection(geo: THREE.BufferGeometry, point: THREE.Vector3, normal: THREE.Vector3): THREE.BufferGeometry | null {
  const loops = sliceLoops(geo, point, normal); if (!loops.length) return null;
  return capGeometry(loops, normal);
}

/** The closed cut loops of a mesh against a plane, in plane coordinates (u, v) and body frame. */
export function sliceLoops(geo: THREE.BufferGeometry, point: THREE.Vector3, normal: THREE.Vector3): SliceLoop[] {
  const n = normal.clone().normalize();
  const pos = geo.getAttribute('position'); const A = geo.getAttribute('aRegA'); const B = geo.getAttribute('aRegB');
  const idx = geo.getIndex(); const triCount = idx ? idx.count / 3 : pos.count / 3;
  const vi = (k: number) => (idx ? idx.getX(k) : k);
  const dist = new Float32Array(pos.count);
  for (let i = 0; i < pos.count; i++) dist[i] = (pos.getX(i) - point.x) * n.x + (pos.getY(i) - point.y) * n.y + (pos.getZ(i) - point.z) * n.z;
  // each crossing edge (a, b) gives one point; points are shared between the two triangles that share the edge
  const pts = new Map<number, { p: THREE.Vector3; a: number[]; b: number[] }>();
  const adj = new Map<number, number[]>();
  const SH = 1 << 21;
  const edgePoint = (a: number, b: number) => {
    const key = a < b ? a * SH + b : b * SH + a;
    if (!pts.has(key)) {
      const t = dist[a] / (dist[a] - dist[b]);
      const p = new THREE.Vector3(pos.getX(a), pos.getY(a), pos.getZ(a)).lerp(new THREE.Vector3(pos.getX(b), pos.getY(b), pos.getZ(b)), t);
      const lerp4 = (X: THREE.BufferAttribute | THREE.InterleavedBufferAttribute | undefined) => X ? [0, 1, 2, 3].map((c) => { const g = (i: number) => (c === 0 ? X.getX(i) : c === 1 ? X.getY(i) : c === 2 ? X.getZ(i) : X.getW(i)); return g(a) + (g(b) - g(a)) * t; }) : [0, 0, 0, 0];
      pts.set(key, { p, a: lerp4(A), b: lerp4(B) });
    }
    return key;
  };
  const link = (k1: number, k2: number) => { if (k1 === k2) return; (adj.get(k1) ?? adj.set(k1, []).get(k1)!).push(k2); (adj.get(k2) ?? adj.set(k2, []).get(k2)!).push(k1); };
  for (let f = 0; f < triCount; f++) {
    const v = [vi(f * 3), vi(f * 3 + 1), vi(f * 3 + 2)]; const s = v.map((i) => dist[i] >= 0);
    if (s[0] === s[1] && s[1] === s[2]) continue;
    const cut: number[] = [];
    for (let e = 0; e < 3; e++) { const a = v[e], b = v[(e + 1) % 3]; if (s[e] !== s[(e + 1) % 3] && Math.abs(dist[a] - dist[b]) > EPS) cut.push(edgePoint(a, b)); }
    if (cut.length === 2) link(cut[0], cut[1]);
  }
  // walk the graph into closed loops (open chains — holes in the mesh — are dropped)
  const u = (Math.abs(n.y) < 0.9 ? new THREE.Vector3(0, 1, 0) : new THREE.Vector3(1, 0, 0)).cross(n).normalize();
  const w = n.clone().cross(u);
  const seen = new Set<number>(); const loops: SliceLoop[] = [];
  for (const start of adj.keys()) {
    if (seen.has(start)) continue;
    const chain = [start]; seen.add(start); let prev = -1, cur = start, closed = false;
    for (let guard = 0; guard < 200000; guard++) {
      const next = (adj.get(cur) ?? []).find((k) => k !== prev && (!seen.has(k) || (k === start && chain.length > 2)));
      if (next === undefined) break;
      if (next === start) { closed = true; break; }
      chain.push(next); seen.add(next); prev = cur; cur = next;
    }
    if (!closed || chain.length < 3) continue;
    const p3 = chain.map((k) => pts.get(k)!.p);
    const p2 = p3.map((p) => { const d = p.clone().sub(point); return new THREE.Vector2(d.dot(u), d.dot(w)); });
    const area = THREE.ShapeUtils.area(p2);
    if (Math.abs(area) < 1e-7) continue;
    loops.push({ pts: p2, p3, regA: chain.map((k) => pts.get(k)!.a), regB: chain.map((k) => pts.get(k)!.b), area });
  }
  return loops;
}

function inside(p: THREE.Vector2, poly: THREE.Vector2[]) {
  let c = false;
  for (let i = 0, j = poly.length - 1; i < poly.length; j = i++) {
    const a = poly[i], b = poly[j];
    if ((a.y > p.y) !== (b.y > p.y) && p.x < ((b.x - a.x) * (p.y - a.y)) / (b.y - a.y + 1e-12) + a.x) c = !c;
  }
  return c;
}

/** Nesting depth of each loop (0 = outermost). Even depths are solid regions, odd depths are holes. */
export function nesting(loops: SliceLoop[]) {
  return loops.map((l, i) => loops.reduce((d, o, j) => d + (j !== i && Math.abs(o.area) > Math.abs(l.area) && inside(l.pts[0], o.pts) ? 1 : 0), 0));
}

function distToLoop(p: THREE.Vector2, loop: THREE.Vector2[]) {
  let best = Infinity;
  for (let i = 0, j = loop.length - 1; i < loop.length; j = i++) {
    const a = loop[j], b = loop[i]; const abx = b.x - a.x, aby = b.y - a.y; const l2 = abx * abx + aby * aby || 1e-12;
    const t = Math.max(0, Math.min(1, ((p.x - a.x) * abx + (p.y - a.y) * aby) / l2)); const dx = a.x + abx * t - p.x, dy = a.y + aby * t - p.y;
    const d = dx * dx + dy * dy; if (d < best) best = d;
  }
  return Math.sqrt(best);
}

/** midpoint subdivisions of the triangulated ring, so the inner → outer depth varies inside each wall, not just along edges */
export const CAP_SUBDIVISIONS = 3;

/**
 * Triangulates the solid regions between loops into a cap. Each vertex gets aDepth = d(inner)/(d(inner)+d(outer)):
 * 0 on the endocardium, 1 on the outermost boundary (epicardium — or the mid-septum, where the LV and RV walls meet).
 */
export function capGeometry(loops: SliceLoop[], normal: THREE.Vector3, subdivisions = CAP_SUBDIVISIONS): THREE.BufferGeometry | null {
  const depth = nesting(loops);
  const P2: THREE.Vector2[] = [], P3: THREE.Vector3[] = [], RA: number[][] = [], RB: number[][] = [], D: number[] = [];
  let tris: number[][] = [];
  loops.forEach((outer, i) => {
    if (depth[i] % 2) return;
    const holes = loops.filter((h, j) => depth[j] === depth[i] + 1 && inside(h.pts[0], outer.pts));
    const faces = THREE.ShapeUtils.triangulateShape(outer.pts, holes.map((h) => h.pts));
    const base = P2.length; const top = depth[i] === 0;
    const vid: number[] = [];
    [outer, ...holes].forEach((l, k) => l.pts.forEach((p, q) => { vid.push(P2.length); P2.push(p.clone()); P3.push(l.p3[q].clone()); RA.push(l.regA[q]); RB.push(l.regB[q]); D.push(k === 0 && top ? 1 : 0); }));
    void base;
    // subdivide this region's triangles, then measure depth against its own boundaries
    let ts = faces.map((f) => [vid[f[0]], vid[f[1]], vid[f[2]]]);
    for (let s = 0; s < subdivisions; s++) {
      const mid = new Map<string, number>(); const next: number[][] = [];
      const m = (a: number, b: number) => { const key = a < b ? `${a}_${b}` : `${b}_${a}`; let k = mid.get(key); if (k === undefined) { k = P2.length; P2.push(P2[a].clone().add(P2[b]).multiplyScalar(0.5)); P3.push(P3[a].clone().add(P3[b]).multiplyScalar(0.5)); RA.push(RA[a].map((x, c) => (x + RA[b][c]) / 2)); RB.push(RB[a].map((x, c) => (x + RB[b][c]) / 2)); D.push(-1); mid.set(key, k); } return k; };
      for (const [a, b, c] of ts) { const ab = m(a, b), bc = m(b, c), ca = m(c, a); next.push([a, ab, ca], [ab, b, bc], [ca, bc, c], [ab, bc, ca]); }
      ts = next;
    }
    const innerLoops = holes.map((h) => h.pts);
    const used = new Set<number>(); ts.forEach((t) => t.forEach((v) => used.add(v)));
    for (const v of used) {
      if (D[v] >= 0) continue;
      if (!top || !innerLoops.length) { D[v] = top ? 1 : 0; continue; }
      const dOut = distToLoop(P2[v], outer.pts); const dIn = Math.min(...innerLoops.map((l) => distToLoop(P2[v], l)));
      D[v] = dIn / (dIn + dOut + 1e-9);
    }
    tris = tris.concat(ts);
  });
  if (!tris.length) return null;
  const g = new THREE.BufferGeometry();
  const pos = new Float32Array(P3.length * 3); P3.forEach((p, i) => { pos[i * 3] = p.x; pos[i * 3 + 1] = p.y; pos[i * 3 + 2] = p.z; });
  g.setAttribute('position', new THREE.BufferAttribute(pos, 3));
  const nn = normal.clone().normalize().negate(); const nrm = new Float32Array(pos.length); for (let i = 0; i < nrm.length; i += 3) { nrm[i] = nn.x; nrm[i + 1] = nn.y; nrm[i + 2] = nn.z; }
  g.setAttribute('normal', new THREE.BufferAttribute(nrm, 3));
  g.setAttribute('aDepth', new THREE.Float32BufferAttribute(D.map((d) => Math.max(0, d)), 1));
  g.setAttribute('aRegA', new THREE.Float32BufferAttribute(RA.flat(), 4));
  g.setAttribute('aRegB', new THREE.Float32BufferAttribute(RB.flat(), 4));
  g.setAttribute('aCh', new THREE.BufferAttribute(new Float32Array(P3.length).fill(1), 1));
  g.setIndex(tris.flat()); g.computeBoundingSphere();
  return g;
}
