import { describe, expect, it } from 'vitest';
import fs from 'node:fs';
import path from 'node:path';
import { NORMAL_CXR, type CxrState } from '../src/vent/cxr';
import { lusFromCxr } from '../src/vent/lus';
import { emptyAbdomen } from '../src/abdomen/state';
import {
  selectAbdomenRealReference,
  selectCxrRealReference,
  selectLusRealReference,
} from '../src/scene/imaging/realStateReference';

const cxr = (patch: Partial<CxrState>): CxrState => ({
  ...NORMAL_CXR,
  ...patch,
  side: patch.side ?? [
    { ...NORMAL_CXR.side[0] },
    { ...NORMAL_CXR.side[1] },
  ],
});

const shippedRealIds = new Set(
  (JSON.parse(fs.readFileSync(path.resolve('../imaging/real/manifest.json'), 'utf8')) as { items: { id: string }[] }).items.map((x) => x.id),
);

describe('state-matched real clinical references', () => {
  it('maps clear, ARDS, cardiogenic oedema and pneumothorax CXR states to honest references', () => {
    expect(selectCxrRealReference(cxr({}))?.id).toBe('bfefde5d');
    expect(selectCxrRealReference(cxr({ ards: 1, side: [{ ...NORMAL_CXR.side[0], opacity: 0.8 }, { ...NORMAL_CXR.side[1], opacity: 0.8 }] }))?.id).toBe('cxr-ards-2019');
    expect(selectCxrRealReference(cxr({ edema: 1, ctr: 0.62, side: [{ ...NORMAL_CXR.side[0], effusion: 0.45 }, { ...NORMAL_CXR.side[1], effusion: 0.45 }] }))?.id).toBe('cxr-chf-haggstrom');
    expect(selectCxrRealReference(cxr({ side: [{ ...NORMAL_CXR.side[0], ptx: 0.6 }, { ...NORMAL_CXR.side[1] }] }))?.id).toBe('ptx-expiratory');
  });

  it('uses the treatment series when a pneumothorax state includes a chest drain', () => {
    const st = cxr({ drain: true, side: [{ ...NORMAL_CXR.side[0], ptx: 0.25 }, { ...NORMAL_CXR.side[1] }] });
    expect(selectCxrRealReference(st)?.id).toBe('ptx-series-bonilla');
  });

  it('withholds a CXR reference when no shipped media honestly matches hyperinflation', () => {
    expect(selectCxrRealReference(cxr({ hyperinflation: 0.8, ctr: 0.42 }))).toBeNull();
  });

  it('matches lung-ultrasound reference to the selected zone, not another zone in the exam', () => {
    const normal = lusFromCxr(cxr({})).find((z) => z.id === 'L-ant')!;
    expect(selectLusRealReference(normal)?.id).toBe('lus-sliding-gillman2012');

    const ptx = lusFromCxr(cxr({ side: [{ ...NORMAL_CXR.side[0], ptx: 0.9 }, { ...NORMAL_CXR.side[1] }] }));
    expect(selectLusRealReference(ptx.find((z) => z.id === 'R-ant')!)?.id).toBe('lus-absent-sliding-gillman');
    expect(selectLusRealReference(ptx.find((z) => z.id === 'L-ant')!)?.id).toBe('lus-sliding-gillman2012');
  });

  it('prefers a lung point, effusion, consolidation, white lung and B-lines when those are the selected-zone finding', () => {
    const base = lusFromCxr(cxr({}))[0];
    expect(selectLusRealReference({ ...base, sliding: false, lungPoint: true, lungPulse: false })?.id).toBe('lus-lung-point-gillman');
    expect(selectLusRealReference({ ...base, effusion: 0.7 })?.id).toBe('pleural-fluid-gillman');
    expect(selectLusRealReference({ ...base, aLines: false, bLines: 0, consolidation: 0.8 })?.id).toBe('lus-hepatisation-gillman');
    expect(selectLusRealReference({ ...base, aLines: false, bLines: 9, white: true })?.id).toBe('whitelung');
    expect(selectLusRealReference({ ...base, aLines: false, bLines: 4, white: false })?.id).toBe('lus-blines-gargani');
  });

  it('shows abdominal real media only for modeled FAST-positive or AAA states', () => {
    expect(selectAbdomenRealReference(emptyAbdomen())).toBeNull();

    const fast = emptyAbdomen();
    fast.freeFluidMl = 1000;
    fast.injury.liver = 4;
    expect(selectAbdomenRealReference(fast)?.id).toBe('fast-ruq-positive');

    const aaa = emptyAbdomen();
    aaa.aaa.diameterCm = 5.5;
    expect(selectAbdomenRealReference(aaa)?.id).toBe('aaa-us-sagittal-haggstrom');
  });

  it('only selects reference IDs that are actually shipped in the real-media manifest', () => {
    const candidates = [
      selectCxrRealReference(cxr({})),
      selectCxrRealReference(cxr({ ards: 1 })),
      selectCxrRealReference(cxr({ edema: 1 })),
      selectCxrRealReference(cxr({ side: [{ ...NORMAL_CXR.side[0], ptx: 0.7 }, { ...NORMAL_CXR.side[1] }] })),
      selectLusRealReference({ ...lusFromCxr(cxr({}))[0], sliding: false, lungPoint: true, lungPulse: false }),
      selectLusRealReference({ ...lusFromCxr(cxr({}))[0], aLines: false, bLines: 8, white: true }),
      selectAbdomenRealReference(Object.assign(emptyAbdomen(), { aaa: { diameterCm: 4.5, rupture: 'none' as const } })),
    ].filter((x): x is NonNullable<typeof x> => x != null);

    for (const match of candidates) expect(shippedRealIds.has(match.id), match.id).toBe(true);
  });

  it('does not invent tamponade or IVC physiology from the abdominal model', () => {
    const st = emptyAbdomen();
    st.retroMl = 800;
    st.freeAir = true;
    const match = selectAbdomenRealReference(st);
    expect(match).toBeNull();
  });
});
