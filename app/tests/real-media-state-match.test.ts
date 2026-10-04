import { describe, expect, it } from 'vitest';
import { NORMAL_CXR, type CxrState } from '../src/vent/cxr';
import { selectCxrReal, selectLusReal } from '../src/vent/realReference';
import type { LusZone } from '../src/vent/lus';
import { emptyAbdomen } from '../src/abdomen/state';
import { selectAbdomenReal } from '../src/abdomen/realReference';

const cxr = (patch: Partial<CxrState> = {}): CxrState => ({
  ...structuredClone(NORMAL_CXR),
  ...patch,
});

const zone = (patch: Partial<LusZone> = {}): LusZone => ({
  id: 'R-ant',
  sliding: true,
  lungPoint: false,
  lungPulse: false,
  aLines: true,
  bLines: 0,
  white: false,
  consolidation: 0,
  effusion: 0,
  mmode: 'seashore',
  pattern: 'Sliding with A-lines — aerated lung',
  ...patch,
});

describe('state-matched real clinical media', () => {
  it('chooses a clear film for a baseline chest and withholds mismatched hyperinflation media', () => {
    expect(selectCxrReal(cxr())?.id).toBe('bfefde5d');
    expect(selectCxrReal(cxr({ hyperinflation: 0.7 }))).toBeNull();
  });

  it('maps pneumothorax, ARDS and cardiogenic oedema to specific chest references', () => {
    const ptx = cxr(); ptx.side[0].ptx = 0.5;
    expect(selectCxrReal(ptx)?.id).toBe('ptx-expiratory');
    expect(selectCxrReal(cxr({ ards: 1 }))?.id).toBe('cxr-ards-2019');
    expect(selectCxrReal(cxr({ edema: 1, ctr: 0.62 }))?.id).toBe('cxr-chf-haggstrom');
  });

  it('maps collapse by side without pretending the reference patient is identical', () => {
    const left = cxr(); left.side[1].atelectasis = 0.9;
    const right = cxr(); right.side[0].atelectasis = 0.9;
    expect(selectCxrReal(left)?.id).toBe('cxr-left-collapse-child-2013');
    expect(selectCxrReal(right)?.id).toBe('cxr-collapse-before-after-2021');
  });

  it('selects lung-US media from the selected zone rather than the whole lung gallery', () => {
    expect(selectLusReal(zone())?.id).toBe('lus-sliding-gillman2012');
    expect(selectLusReal(zone({ lungPoint: true, sliding: false, mmode: 'barcode + lung point' }))?.id).toBe('lus-lung-point-gillman');
    expect(selectLusReal(zone({ sliding: false, aLines: true, mmode: 'barcode' }))?.id).toBe('lus-absent-sliding-gillman');
    expect(selectLusReal(zone({ bLines: 8, white: true, aLines: false }))?.id).toBe('whitelung');
    expect(selectLusReal(zone({ bLines: 4, aLines: false }))?.id).toBe('lus-blines-gargani');
    expect(selectLusReal(zone({ effusion: 0.7 }))?.id).toBe('pleural-fluid-gillman');
    expect(selectLusReal(zone({ lungPulse: true, sliding: false, consolidation: 0.8 }))?.id).toBe('lus-hepatisation-gillman');
  });

  it('shows abdominal references only when the model actually contains a FAST or aortic finding', () => {
    expect(selectAbdomenReal(emptyAbdomen())).toBeNull();

    const smallAaa = emptyAbdomen(); smallAaa.aaa.diameterCm = 4.2;
    expect(selectAbdomenReal(smallAaa)?.id).toBe('aaa-us-axial-haggstrom');

    const largeAaa = emptyAbdomen(); largeAaa.aaa.diameterCm = 6.4;
    expect(selectAbdomenReal(largeAaa)?.id).toBe('aaa-us-thrombus-haggstrom');

    const bleed = emptyAbdomen(); bleed.injury.liver = 4; bleed.freeFluidMl = 800;
    expect(selectAbdomenReal(bleed)?.id).toBe('fast-ruq-positive');
  });
});
