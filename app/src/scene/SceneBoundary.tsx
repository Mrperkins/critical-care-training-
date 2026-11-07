import { Component, type ReactNode } from 'react';

/** Graphics failures must not remove the lesson, navigation or clinical controls. */
export class SceneBoundary extends Component<{ children: ReactNode; label: string; onRetry?: () => void }, { failed: boolean }> {
  state = { failed: false };
  static getDerivedStateFromError() { return { failed: true }; }
  render() {
    if (!this.state.failed) return this.props.children;
    return <SceneUnavailable label={this.props.label} onRetry={() => { this.props.onRetry?.(); this.setState({ failed: false }); }} />;
  }
}
export function SceneUnavailable({ label, onRetry }: { label: string; onRetry?: () => void }) {
  return <section className="scene-unavailable" aria-label={label}>
    <div>
      <svg viewBox="0 0 64 64" width="64" height="64" aria-hidden="true"><path d="M32 8v21m0-5c-8 0-9 6-15 11s-9 9-9 15c0 6 6 8 12 4s10-12 12-22c2 10 6 18 12 22s12 2 12-4c0-6-3-10-9-15s-7-11-15-11" fill="none" stroke="currentColor" strokeWidth="2" /></svg>
      <h2>3D view unavailable</h2>
      <p>This browser could not start the anatomy renderer. You can still use lessons, waveforms, real imaging and clinical controls.</p>
      <div className="actions">
        <button className="act primary" onClick={() => {
          const pane = document.querySelector<HTMLElement>('.side-pane');
          document.querySelector<HTMLButtonElement>('[data-context-button]')?.click();
          pane?.focus(); pane?.scrollIntoView({ block: 'start' });
        }}>Open learning context</button>
        {onRetry && <button className="act" onClick={onRetry}>Retry 3D view</button>}
      </div>
    </div>
  </section>;
}
/** One capability check per mounted renderer; release the temporary context immediately. */
export function supportsWebGL() {
  try {
    const c = document.createElement('canvas');
    const gl = c.getContext('webgl2') ?? c.getContext('webgl');
    if (!gl) return false;
    gl.getExtension('WEBGL_lose_context')?.loseContext();
    return true;
  } catch { return false; }
}
