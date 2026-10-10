/**
 * Canonical Visible Human chamber geometry for MI Locator.
 *
 * Both the historical Infarct Atlas coronary asset and the high-detail cardiac
 * atlas come from the same HuBMAP / Visible Human Male source and the same
 * registered body frame. To retain MI territory/ischemia shaders and picking,
 * the existing clinically authored *teaching* weights are projected from each
 * original chamber onto the higher-resolution chamber surface using nearest
 * surface vertices. Registration is measured first, and rejected rather than
 * silently shifting, scaling or stretching a heart.
 *
 * This is a spatial approximation of territory masks, not a validated
 * myocardial perfusion map. Original coronary vessels, lesions and masks stay
 * intact and are not replaced by cosmetically generated geometry.
 */
import * as THREE from 'three';
import { loadHeartHD } from '../../asset/anatomy';
import type { HeartAsset } from './heartAsset';

export const CANONICAL_CHAMBERS = {
  myocardium_LV: 'lv',
  myocardium_RV: 'rv',
  atrium_LA: 'la',
  atrium_RA: 'ra',
} as const;

const ATTR = ['aRegA','aRegB','aAO','aFat','aCh','aS','aW'] as const;
type ChamberId = keyof typeof CANONICAL_CHAMBERS;
export type ProjectionStats = { id: ChamberId; count: number; p95Dm: number; maxDm: number; withinThreshold: number };
export type CanonicalAtlasResult = { asset: HeartAsset; stats: ProjectionStats[]; accepted: boolean; reason?: string };

const SAMPLE_GRID_DM = 0.045; // search cell; no rescaling of actual anatomy
const TOLERANCE_DM = 0.12; // 12 mm spatial map tolerance, NOT anatomy-validation threshold

function indexKey(x: number, y: number, z: number): string {
  return `${Math.floor(x/SAMPLE_GRID_DM)},${Math.floor(y/SAMPLE_GRID_DM)},${Math.floor(z/SAMPLE_GRID_DM)}`;
}
export function projectChamber(source: THREE.BufferGeometry, detailed: THREE.BufferGeometry, id: ChamberId, sourceWorld = new THREE.Matrix4()): { geometry: THREE.BufferGeometry; stats: ProjectionStats } {
  const a = source.getAttribute('position');
  const b = detailed.getAttribute('position');
  if (!a || !b || a.count < 10 || b.count < 10) throw Error('Missing chamber vertices: ' + id);
  for (const key of ATTR) if (!source.getAttribute(key)) throw Error('Territory mapping missing ' + key + ' on ' + id);
  // MI's meshopt GLB may store positions behind a de-quantisation node matrix;
  // the canonical anatomy loader already bakes its transforms. Compare WORLD coordinates.
  const srcCoords = new Float32Array(a.count * 3);
  const scratch = new THREE.Vector3();
  const bins = new Map<string, number[]>();
  for (let i = 0; i < a.count; i++) {
    scratch.set(a.getX(i),a.getY(i),a.getZ(i)).applyMatrix4(sourceWorld);
    srcCoords[3*i]=scratch.x;srcCoords[3*i+1]=scratch.y;srcCoords[3*i+2]=scratch.z;
    const key = indexKey(scratch.x,scratch.y,scratch.z);
    const row = bins.get(key);
    if (row) row.push(i); else bins.set(key, [i]);
  }
  const geo = detailed.clone();
  const projected = Object.fromEntries(ATTR.map((key) => {
    const at = source.getAttribute(key);
    return [key, new Float32Array(b.count * at.itemSize)];
  })) as Record<(typeof ATTR)[number], Float32Array>;
  const errors = new Float32Array(b.count);
  let within=0, far=0; const cell=SAMPLE_GRID_DM;
  for(let i=0;i<b.count;i++){
    const px=b.getX(i),py=b.getY(i),pz=b.getZ(i);
    const cx=Math.floor(px/cell),cy=Math.floor(py/cell),cz=Math.floor(pz/cell);
    let best=-1,d2=Infinity;
    // Adjacent bins normally suffice. Search further only for gapped structures.
    for(let radius=1;radius<=4;radius++){
      for(let dx=-radius;dx<=radius;dx++)for(let dy=-radius;dy<=radius;dy++)for(let dz=-radius;dz<=radius;dz++){
        if(radius>1 && Math.max(Math.abs(dx),Math.abs(dy),Math.abs(dz))!==radius)continue;
        const cells=bins.get(`${cx+dx},${cy+dy},${cz+dz}`);if(!cells)continue;
        for(const j of cells){
          const ex=srcCoords[3*j]-px,ey=srcCoords[3*j+1]-py,ez=srcCoords[3*j+2]-pz;const d=ex*ex+ey*ey+ez*ez;
          if(d<d2){d2=d;best=j;}
        }
      }
      if(best>=0 && d2 < (radius*cell)*(radius*cell))break;
    }
    const dist=best<0 ? Infinity:Math.sqrt(d2);
    errors[i]=dist; if(dist<=TOLERANCE_DM)within++;else far++;
    if(best<0)continue;
    for(const k of ATTR){
      const src=source.getAttribute(k), size=src.itemSize, out=projected[k];
      for(let j=0;j<size;j++)out[i*size+j]=j===0?src.getX(best):j===1?src.getY(best):j===2?src.getZ(best):src.getW(best);
    }
  }
  for(const k of ATTR)geo.setAttribute(k,new THREE.BufferAttribute(projected[k],source.getAttribute(k).itemSize));
  geo.computeBoundingSphere();
  // Efficient percentile: sample at most 2000 measurements rather than sorting ~400k vertices.
  const sample:number[]=[];const stride=Math.max(1,Math.floor(b.count/2000));
  for(let i=0;i<b.count;i+=stride)sample.push(errors[i]);
  sample.sort((x,y)=>x-y);
  const stats={id,count:b.count,p95Dm:sample[Math.floor((sample.length-1)*.95)],maxDm:Math.max(...sample),withinThreshold:within/b.count};
  void far;
  return { geometry:geo,stats };
}

/**
 * Prepare a separate HeartAsset; original remains untouched for instant fallback.
 * Geometry registration must pass on every chamber to prevent partially mixed organs.
 */
export async function loadCanonicalMIHeart(original: HeartAsset): Promise<CanonicalAtlasResult> {
  const layer=await loadHeartHD();
  const replacements:Partial<Record<ChamberId,THREE.Mesh>>={};const stats:ProjectionStats[]=[];
  try {
    for(const [legacy,canonical] of Object.entries(CANONICAL_CHAMBERS) as [ChamberId,string][]){
      const src=original.meshes[legacy],detail=layer.meshes[canonical];
      if(!src||!detail)throw Error('Missing corresponding Visible Human chamber: '+legacy);
      const out=projectChamber(src.geometry,detail.geometry,legacy,src.matrixWorld);
      stats.push(out.stats);
      const accepted=Number.isFinite(out.stats.p95Dm)&&out.stats.p95Dm<0.07&&out.stats.withinThreshold>0.94;
      if(!accepted)throw Error(`Unsafe anatomical correspondence ${legacy}: p95=${out.stats.p95Dm.toFixed(3)}dm, coverage=${out.stats.withinThreshold.toFixed(3)}`);
      const mesh=new THREE.Mesh(out.geometry);
      mesh.name=legacy;
      mesh.userData={...src.userData,sourceAsset:'heart-hd.glb',territoryProjection:'nearest source vertex; educational'};
      replacements[legacy]=mesh;
    }
    return { asset:{...original,meshes:{...original.meshes,...replacements}},stats,accepted:true };
  } catch(e){
    for(const mesh of Object.values(replacements))mesh?.geometry.dispose();
    return {asset:original,stats,accepted:false,reason:String(e)};
  }
}
