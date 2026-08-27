'use client';

import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { useEffect, useRef, type ReactNode } from 'react';

gsap.registerPlugin(ScrollTrigger);

export function Reveal({ children, className = '', delay = 0 }: { children: ReactNode; className?: string; delay?: number }) {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const element = ref.current;
    if (!element || window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
    const context = gsap.context(() => {
      gsap.fromTo(
        element,
        { y: 38, opacity: 0, clipPath: 'inset(0 0 100% 0)' },
        {
          y: 0,
          opacity: 1,
          clipPath: 'inset(0 0 0% 0)',
          duration: 1.05,
          delay,
          ease: 'power4.out',
          scrollTrigger: { trigger: element, start: 'top 88%', once: true },
        },
      );
    }, element);
    return () => context.revert();
  }, [delay]);

  return <div ref={ref} className={className}>{children}</div>;
}
