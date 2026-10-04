/**
 * Modality-agnostic image panel for synthetic clinical images (CT / CTA / perfusion, chest X-ray,
 * ultrasound…): draws an RGBA image from a pure renderer onto a canvas, with caption and overlay
 * children. Each module keeps its own renderer; this is the shared presentation.
 */
import { useEffect, useRef, type ReactNode } from 'react';

export interface RgbaImage { rgba: Uint8ClampedArray; w: number; h: number }
export function ImagePanel({ draw, deps, caption, aria, className, children }: { draw: () => RgbaImage; deps: unknown[]; caption: string; aria?: string; className?: string; children?: ReactNode }) {
  const ref = useRef<HTMLCanvasElement>(null);
  useEffect(() => {
    const id = requestAnimationFrame(() => {
      const c = ref.current; if (!c) return; const img = draw();
      c.width = img.w; c.height = img.h; const ctx = c.getContext('2d')!; const d = ctx.createImageData(img.w, img.h); d.data.set(img.rgba); ctx.putImageData(d, 0, 0);
    });
    return () => cancelAnimationFrame(id);
  }, deps); // eslint-disable-line react-hooks/exhaustive-deps
  return (
    <figure className={`img-panel${className ? ` ${className}` : ''}`}>
      <canvas ref={ref} aria-label={aria ?? caption} />
      <figcaption>{caption}</figcaption>
      {children}
    </figure>
  );
}
