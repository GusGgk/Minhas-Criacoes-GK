'use client';

/* eslint-disable @next/next/no-img-element -- two cut-outs stacked 1:1; next/image would wrap each in its own box and break the overlay. */

import { useEffect, useRef } from 'react';
import type { Locale } from '@/lib/content/types';

/**
 * The portrait in the hero. Two photographs on one canvas, aligned pupil to
 * pupil in scripts/portrait: me now underneath, me as a kid on top behind a
 * circular mask. The mask follows the pointer, so wherever the cursor goes
 * the kid shows through — the reveal Lando Norris's site does with a helmet.
 *
 * Only the mask moves. The images never re-render; the circle is a radial
 * gradient whose size and position are custom properties, so each frame is
 * one style write and a composite, not a repaint of two 1200px images.
 */

/** how far behind the pointer the circle trails, in ms to close ~63% of the gap */
const FOLLOW_TAU = 85;
/** how long the circle takes to bloom in and shrink away */
const BLOOM_TAU = 190;
/** circle radius as a fraction of the canvas width */
const RADIUS = 0.3;
/** on touch screens there is nothing to hover, so the circle wanders on its own */
const DRIFT_RADIUS = 0.24;

type Vec = { x: number; y: number };

export function PortraitReveal({ locale }: { locale: Locale }) {
  const frame = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const element = frame.current;
    if (!element) return;

    const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    const canHover = window.matchMedia('(hover: hover) and (pointer: fine)').matches;

    // Everything is in fractions of the box (0..1), so a resize costs nothing.
    const target: Vec = { x: 0.5, y: 0.42 };
    const current: Vec = { x: 0.5, y: 0.42 };
    let targetRadius = 0;
    let radius = 0;
    let inside = false;
    let raf = 0;
    let last = 0;

    // Pixels, not percentages: a percentage in mask-position aligns that point
    // of the mask image with the same point of the box (background-position
    // rules), which is not "centre the circle here".
    const paint = () => {
      const width = element.clientWidth;
      const height = element.clientHeight;
      element.style.setProperty('--mx', `${(current.x * width).toFixed(1)}px`);
      element.style.setProperty('--my', `${(current.y * height).toFixed(1)}px`);
      element.style.setProperty('--r', `${(radius * width).toFixed(1)}px`);
    };

    const settled = () =>
      Math.abs(target.x - current.x) < 0.0005 &&
      Math.abs(target.y - current.y) < 0.0005 &&
      Math.abs(targetRadius - radius) < 0.0005;

    const tick = (now: number) => {
      const dt = last ? Math.min(now - last, 64) : 16;
      last = now;

      if (!canHover && !reduced) {
        // A slow figure-eight over the face; touch below overrides it.
        const t = now / 1000;
        if (!inside) {
          target.x = 0.5 + 0.17 * Math.sin(t * 0.55);
          target.y = 0.4 + 0.11 * Math.sin(t * 1.1 + 1.2);
        }
        targetRadius = DRIFT_RADIUS;
      }

      const follow = 1 - Math.exp(-dt / FOLLOW_TAU);
      const bloom = 1 - Math.exp(-dt / BLOOM_TAU);
      current.x += (target.x - current.x) * follow;
      current.y += (target.y - current.y) * follow;
      radius += (targetRadius - radius) * bloom;
      paint();

      // Keep the loop alive while drifting; otherwise sleep once settled.
      if (settled() && (canHover || reduced)) {
        raf = 0;
        last = 0;
        return;
      }
      raf = requestAnimationFrame(tick);
    };

    const wake = () => {
      if (!raf) raf = requestAnimationFrame(tick);
    };

    const place = (event: PointerEvent) => {
      const box = element.getBoundingClientRect();
      target.x = (event.clientX - box.left) / box.width;
      target.y = (event.clientY - box.top) / box.height;
    };

    const onMove = (event: PointerEvent) => {
      place(event);
      inside = true;
      targetRadius = RADIUS;
      if (reduced) {
        // Still follows the hand, just without the trailing motion.
        current.x = target.x;
        current.y = target.y;
        radius = targetRadius;
        paint();
        return;
      }
      wake();
    };

    const onLeave = () => {
      inside = false;
      if (canHover) targetRadius = 0;
      if (reduced) {
        radius = 0;
        paint();
        return;
      }
      wake();
    };

    element.addEventListener('pointermove', onMove);
    element.addEventListener('pointerdown', onMove);
    element.addEventListener('pointerleave', onLeave);
    element.addEventListener('pointercancel', onLeave);
    if (!canHover) element.addEventListener('pointerup', onLeave);

    paint();
    if (!canHover && !reduced) wake();

    // The stored position is a fraction, so a resize only needs a repaint.
    const resized = new ResizeObserver(paint);
    resized.observe(element);

    return () => {
      resized.disconnect();
      element.removeEventListener('pointermove', onMove);
      element.removeEventListener('pointerdown', onMove);
      element.removeEventListener('pointerleave', onLeave);
      element.removeEventListener('pointercancel', onLeave);
      element.removeEventListener('pointerup', onLeave);
      if (raf) cancelAnimationFrame(raf);
    };
  }, []);

  const label = locale === 'pt'
    ? 'Retrato de Gustavo hoje. Onde o cursor passa, aparece ele quando criança.'
    : 'Portrait of Gustavo today. Wherever the cursor goes, he appears as a kid.';

  return (
    <div ref={frame} className="portrait" role="img" aria-label={label}>
      <img className="portrait__now" src="/media/retrato/agora.webp" alt="" draggable={false} />
      <img className="portrait__then" src="/media/retrato/crianca.webp" alt="" draggable={false} />
    </div>
  );
}
