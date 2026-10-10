import { describe, expect, it } from 'vitest';
import * as THREE from 'three';
import { CANONICAL_CHAMBERS, projectChamber } from '../src/infarct/asset/canonicalHeart';
import { synchronizedMIClock } from '../src/infarct/engine/clock';
import { useStudyClock } from '../src/heart/studyClock';
import { useHeartUI } from '../src/heart/heartStore';

function syntheticHeart() {
  const g=new THREE.BufferGeometry();
  const pos:number[]=[];
  for(let i=0;i<32;i++)pos.push((i%4)*.02,Math.floor(i/4)*.02,.03*Math.sin(i));
  g.setAttribute('position',new THREE.Float32BufferAttribute(pos,3));
  for(const [k,n] of [['aRegA',4],['aRegB',4],['aAO',1],['aFat',1],['aCh',1],['aS',1],['aW',1]] as const){
    const arr=new Float32Array(32*n);
    for(let i=0;i<32;i++)arr[i*n]=(i%3===0?1:.5);
    g.setAttribute(k,new THREE.BufferAttribute(arr,n));
  }
  const hd=g.clone();
  return {g,hd};
}

describe('canonical 3D cardiac atlas',()=>{
  it('offers identical identified chambers to MI Locator and congenital heart',()=>{
    expect(CANONICAL_CHAMBERS).toEqual({myocardium_LV:'lv',myocardium_RV:'rv',atrium_LA:'la',atrium_RA:'ra'});
  });
  it('projects the original coronary territory data without changing source coordinates',()=>{
    const {g,hd}=syntheticHeart();
    const originalX=g.getAttribute('position').getX(0);
    const {geometry,stats}=projectChamber(g,hd,'myocardium_LV');
    expect(stats.withinThreshold).toBe(1);
    expect(stats.p95Dm).toBeLessThan(1e-4);
    expect(geometry.getAttribute('aRegA').count).toBe(32);
    expect(geometry.getAttribute('aRegB').count).toBe(32);
    expect(g.getAttribute('position').getX(0)).toBe(originalX);
    expect(geometry.getAttribute('aRegA').getX(0)).toBe(g.getAttribute('aRegA').getX(0));
    geometry.dispose();g.dispose();hd.dispose();
  });
  it('rejects missing clinical projection channels',()=>{
    const {g,hd}=syntheticHeart();g.deleteAttribute('aRegB');
    expect(()=>projectChamber(g,hd,'myocardium_LV')).toThrow(/Territory mapping missing/);
    g.dispose();hd.dispose();
  });
  it('uses one physiological time rather than running two independent clocks',()=>{
    const a=synchronizedMIClock(12.3,84),b=synchronizedMIClock(12.4,84);
    expect(b).toBeGreaterThan(a);
    expect(synchronizedMIClock(0,84)).toBeGreaterThan(-0.2);
    const state=useStudyClock.getState();
    expect(Number.isFinite(synchronizedMIClock(state.seconds,state.heartRate))).toBe(true);
  });
  it('preserves four-chamber default without enabling the resource-intensive two-canvas mode',()=>{
    expect(useHeartUI.getState().atlasPresentation).toBe('cutaway');
    expect(useHeartUI.getState().atlasMobileFocus).toBe('whole');
    useHeartUI.getState().set({atlasPresentation:'split',atlasMobileFocus:'conduction'});
    expect(useHeartUI.getState().atlasMobileFocus).toBe('conduction');
    useHeartUI.getState().set({atlasPresentation:'cutaway',atlasMobileFocus:'whole'});
  });
});
