'use client';

import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { useEffect, useRef, useState } from 'react';

gsap.registerPlugin(ScrollTrigger);

export function MetricValue({ value }: { value: string }) {
  const ref = useRef<HTMLSpanElement>(null);
  const [display, setDisplay] = useState(value.match(/\d/) ? value.replace(/\d/g, '0') : value);

  useEffect(() => {
    const element = ref.current;
    const match = value.match(/\d+(?:[.,]\d+)?/);
    if (!element || !match || window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      setDisplay(value);
      return;
    }

    const target = Number(match[0].replace(',', '.'));
    const decimals = match[0].includes(',') || match[0].includes('.') ? 1 : 0;
    const state = { current: 0 };
    const tween = gsap.to(state, {
      current: target,
      duration: 1.5,
      ease: 'power3.out',
      paused: true,
      onUpdate: () => {
        const numeric = state.current.toFixed(decimals).replace('.', ',');
        setDisplay(value.replace(match[0], numeric.padStart(match[0].length, '0')));
      },
    });
    const trigger = ScrollTrigger.create({ trigger: element, start: 'top 92%', once: true, onEnter: () => tween.play() });
    return () => { trigger.kill(); tween.kill(); };
  }, [value]);

  return <span ref={ref}>{display}</span>;
}
