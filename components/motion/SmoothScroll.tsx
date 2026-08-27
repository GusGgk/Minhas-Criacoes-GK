'use client';

import Lenis from 'lenis';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { useEffect, type ReactNode } from 'react';

gsap.registerPlugin(ScrollTrigger);

export function SmoothScroll({ children }: { children: ReactNode }) {
  useEffect(() => {
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;

    const lenis = new Lenis({
      lerp: 0.085,
      smoothWheel: true,
      syncTouch: false,
      anchors: true,
    });
    const update = (time: number) => lenis.raf(time * 1000);

    lenis.on('scroll', ScrollTrigger.update);
    gsap.ticker.add(update);
    gsap.ticker.lagSmoothing(0);

    return () => {
      gsap.ticker.remove(update);
      lenis.destroy();
    };
  }, []);

  return children;
}
