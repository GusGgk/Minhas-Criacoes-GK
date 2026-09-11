'use client';

/* eslint-disable @next/next/no-img-element -- two cut-outs stacked 1:1; next/image would wrap each in its own box and break the overlay. */

import { useEffect, useRef } from 'react';
import type { Locale } from '@/lib/content/types';

/**
 * The portrait in the hero. Two photographs on one canvas, aligned pupil to
 * pupil in scripts/portrait: me now underneath, me as a kid on top behind a
 * mask that follows the pointer. Wherever the cursor goes the kid shows
 * through — the reveal Lando Norris's site does with a helmet.
 *
 * The window is not one circle but three soft ones chained behind the
 * pointer, each a little smaller and a little slower than the one before,
 * each with its own slow wobble. Moving fast they stretch into a comet;
 * standing still they settle into a blob that keeps breathing. The union is
 * the shape — the browser adds the three mask layers.
 *
 * Only the mask moves. The images never re-render; every frame is a handful
 * of custom-property writes and a composite.
 */

/** how far each node trails the one before it, in ms to close ~63% of the gap */
const FOLLOW_TAU = [70, 115, 165];
/** each node's size relative to the lead one */
const NODE_SCALE = [1, 0.82, 0.68];
/** how long the shape takes to bloom in and shrink away */
const BLOOM_TAU = 190;
/** lead radius as a fraction of the canvas width */
const RADIUS = 0.29;
/** on touch screens there is nothing to hover, so the shape wanders on its own */
const DRIFT_RADIUS = 0.24;
/** the one-time sweep across the face after load, so the reveal is not a secret */
const INTRO_DELAY = 900;
const INTRO_LENGTH = 1700;

type Vec = { x: number; y: number };

const ease = (t: number) => 0.5 - Math.cos(Math.PI * Math.min(Math.max(t, 0), 1)) / 2;

export function PortraitReveal({ locale }: { locale: Locale }) {
  const frame = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const element = frame.current;
    if (!element) return;

    const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    const canHover = window.matchMedia('(hover: hover) and (pointer: fine)').matches;

    // Everything is in fractions of the box (0..1), so a resize costs nothing.
    const target: Vec = { x: 0.5, y: 0.42 };
    const nodes: Vec[] = NODE_SCALE.map(() => ({ x: 0.5, y: 0.42 }));
    let targetRadius = 0;
    let radius = 0;
    let inside = false;
    let raf = 0;
    let last = 0;
    let introAt = canHover && !reduced ? performance.now() + INTRO_DELAY : -1;

    // Pixels, not percentages: a percentage in mask-position aligns that point
    // of the mask image with the same point of the box (background-position
    // rules), which is not "centre the circle here".
    const paint = (now: number) => {
      const width = element.clientWidth;
      const height = element.clientHeight;
      // a slow breath on top of the bloom, so a still shape is never frozen
      const breath = reduced ? 1 : 1 + 0.045 * Math.sin(now / 640);
      nodes.forEach((node, i) => {
        element.style.setProperty(`--x${i}`, `${(node.x * width).toFixed(1)}px`);
        element.style.setProperty(`--y${i}`, `${(node.y * height).toFixed(1)}px`);
        element.style.setProperty(`--r${i}`, `${(radius * breath * NODE_SCALE[i] * width).toFixed(1)}px`);
      });
    };

    const tick = (now: number) => {
      const dt = last ? Math.min(now - last, 64) : 16;
      last = now;
      const t = now / 1000;

      if (introAt > 0 && !inside) {
        // One pass from cheek to cheek, then away. Pointer contact cancels it.
        const progress = (now - introAt) / INTRO_LENGTH;
        if (progress >= 0) {
          target.x = 0.36 + 0.28 * ease(progress);
          target.y = 0.41 + 0.03 * Math.sin(progress * Math.PI);
          targetRadius = progress < 1 ? RADIUS * 0.8 : 0;
        }
        if (progress > 1.6) introAt = -1;
      } else if (!canHover && !reduced) {
        // A slow figure-eight over the face; touch below overrides it.
        if (!inside) {
          target.x = 0.5 + 0.17 * Math.sin(t * 0.55);
          target.y = 0.4 + 0.11 * Math.sin(t * 1.1 + 1.2);
        }
        targetRadius = DRIFT_RADIUS;
      }

      // Each node chases the previous one; the trailing two also orbit a
      // little, which is what keeps the still shape from being a circle.
      let lead = target;
      nodes.forEach((node, i) => {
        const k = 1 - Math.exp(-dt / FOLLOW_TAU[i]);
        const wobble = i === 0 || reduced ? 0 : 0.028 * radius * i;
        const goalX = lead.x + wobble * Math.cos(t * (1.3 + 0.5 * i) + i * 2.1);
        const goalY = lead.y + wobble * Math.sin(t * (1.7 - 0.3 * i) + i * 1.4);
        node.x += (goalX - node.x) * k;
        node.y += (goalY - node.y) * k;
        lead = node;
      });
      radius += (targetRadius - radius) * (1 - Math.exp(-dt / BLOOM_TAU));
      paint(now);

      // Sleep only when there is nothing left to show; a visible shape keeps
      // breathing, a drifting one keeps drifting.
      const gone = radius < 0.0005 && targetRadius === 0 && introAt < 0;
      if (gone && (canHover || reduced)) {
        radius = 0;
        paint(now);
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
      introAt = -1;
      targetRadius = RADIUS;
      if (reduced) {
        // Still follows the hand, just without the trailing motion.
        nodes.forEach((node) => { node.x = target.x; node.y = target.y; });
        radius = targetRadius;
        paint(performance.now());
        return;
      }
      wake();
    };

    const onLeave = () => {
      inside = false;
      if (canHover) targetRadius = 0;
      if (reduced) {
        radius = 0;
        paint(performance.now());
        return;
      }
      wake();
    };

    element.addEventListener('pointermove', onMove);
    element.addEventListener('pointerdown', onMove);
    element.addEventListener('pointerleave', onLeave);
    element.addEventListener('pointercancel', onLeave);
    if (!canHover) element.addEventListener('pointerup', onLeave);

    paint(performance.now());
    if (introAt > 0 || (!canHover && !reduced)) wake();

    // The stored positions are fractions, so a resize only needs a repaint.
    const resized = new ResizeObserver(() => paint(performance.now()));
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
