// @vitest-environment jsdom
import { act } from 'react';
import { createRoot, type Root } from 'react-dom/client';
import { afterEach, beforeEach, expect, it, vi } from 'vitest';
import { VentWorkbench } from '../src/vent/VentWorkbench';
import { session } from '../src/vent/session';
vi.mock('../src/vent/Waveforms',()=>({Scalars:()=> <div>Scalars</div>,Loops:()=> <div>Loops</div>}));
let root:Root,container:HTMLDivElement;
beforeEach(()=>{(globalThis as unknown as {IS_REACT_ACT_ENVIRONMENT:boolean}).IS_REACT_ACT_ENVIRONMENT=true;
  Object.defineProperty(window,'matchMedia',{configurable:true,value:()=>({matches:false,addEventListener:vi.fn(),removeEventListener:vi.fn()})});
  vi.stubGlobal('requestAnimationFrame',vi.fn(()=>1)); vi.stubGlobal('cancelAnimationFrame',vi.fn());
  container=document.createElement('div');document.body.append(container);root=createRoot(container);
});
afterEach(async()=>{await act(async()=>root.unmount());container.remove();vi.unstubAllGlobals();});
const button=(name:string)=>{const b=[...container.querySelectorAll<HTMLButtonElement>('button')].find(b=>b.getAttribute('aria-label')===name||b.textContent?.trim()===name);if(!b)throw new Error(`Missing ${name}`);return b;};
it('touch-equivalent adjustment remains pending until Confirm, and Cancel restores active state',async()=>{
  await act(async()=>root.render(<VentWorkbench/>));
  const active=session.m.s.fio2;
  await act(async()=>[...container.querySelectorAll<HTMLButtonElement>('.equipment-settings button')].find(b=>b.querySelector('span')?.textContent==='FiO₂')!.click());
  await act(async()=>button('Increase FiO₂').click()); expect(session.m.s.fio2).toBe(active);
  await act(async()=>button('Confirm settings').click()); expect(session.m.s.fio2).toBeCloseTo(active+.01);
  await act(async()=>button('Increase FiO₂').click()); await act(async()=>button('Cancel edits').click());
  expect(session.m.s.fio2).toBeCloseTo(active+.01); expect(button('Confirm settings').disabled).toBe(true);
});
it('mobile view selection preserves the pending parameter and scene state',async()=>{
  await act(async()=>root.render(<VentWorkbench/>)); const initial=session.m.s.vt;
  await act(async()=>button('Increase Tidal volume').click());
  await act(async()=>button('Patient').click()); expect(container.querySelector('.equipment-workbench')?.classList.contains('equipment-pane-patient')).toBe(true);
  await act(async()=>button('Waveforms').click()); await act(async()=>button('Ventilator').click());
  expect(session.m.s.vt).toBe(initial); expect(button('Confirm settings').disabled).toBe(false);
  await act(async()=>button('Confirm settings').click()); expect(session.m.s.vt).toBeCloseTo(initial+.01);
});
