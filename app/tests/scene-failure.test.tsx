// @vitest-environment jsdom
import { act } from 'react';
import { createRoot } from 'react-dom/client';
import { describe, expect, it, vi } from 'vitest';
import { SceneBoundary, supportsWebGL } from '../src/scene/SceneBoundary';

function FailedScene(): never { throw new Error('Error creating WebGL context'); }
describe('graphics failure containment', () => {
  it('retains sibling lesson and navigation when a scene throws', async () => {
    (globalThis as unknown as { IS_REACT_ACT_ENVIRONMENT: boolean }).IS_REACT_ACT_ENVIRONMENT = true;
    const report = vi.spyOn(console, 'error').mockImplementation(() => {});
    const container = document.createElement('div'); document.body.append(container); const root = createRoot(container);
    try {
      await act(async () => root.render(<><button>Learn</button><SceneBoundary label="Lung anatomy"><FailedScene /></SceneBoundary><aside>ARDS lesson and patient controls</aside></>));
      expect(container.textContent).toContain('3D view unavailable');
      expect(container.textContent).toContain('ARDS lesson and patient controls');
      expect(container.querySelector('button')?.textContent).toBe('Learn');
    } finally { await act(async () => root.unmount()); container.remove(); report.mockRestore(); }
  });
  it('handles absent contexts and releases a successful probe context', () => {
    const context = vi.spyOn(HTMLCanvasElement.prototype, 'getContext').mockReturnValue(null);
    expect(supportsWebGL()).toBe(false);
    const lose = vi.fn();
    context.mockReturnValue({ getExtension: () => ({ loseContext: lose }) } as unknown as RenderingContext);
    expect(supportsWebGL()).toBe(true); expect(lose).toHaveBeenCalledOnce(); context.mockRestore();
  });
});
