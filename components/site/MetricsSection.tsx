'use client';

import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { useEffect, useRef } from 'react';
import { MetricValue } from './MetricValue';
import type { Locale, Metric } from '@/lib/content/types';

gsap.registerPlugin(ScrollTrigger);

export function MetricsSection({ locale, metrics }: { locale: Locale; metrics: Metric[] }) {
  const sectionRef = useRef<HTMLElement>(null);

  useEffect(() => {
    const section = sectionRef.current;
    if (!section || window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
    const context = gsap.context(() => {
      gsap.from('.metric-card', {
        y: 90,
        rotate: (index) => index % 2 ? 2.5 : -2.5,
        opacity: 0,
        duration: 1.2,
        stagger: 0.12,
        ease: 'power4.out',
        scrollTrigger: { trigger: '.metrics__grid', start: 'top 82%', once: true },
      });
      gsap.to('.metrics__marquee-inner', {
        xPercent: -25,
        ease: 'none',
        scrollTrigger: { trigger: section, start: 'top bottom', end: 'bottom top', scrub: 0.6 },
      });
    }, section);
    return () => context.revert();
  }, []);

  return (
    <section ref={sectionRef} id="arquivo" className="metrics" aria-labelledby="metrics-title">
      <div className="metrics__marquee" aria-hidden="true">
        <div className="metrics__marquee-inner">
          <span>IDEIAS EM MOVIMENTO</span><i>✦</i><span>IDEAS IN MOTION</span><i>✦</i>
          <span>IDEIAS EM MOVIMENTO</span><i>✦</i><span>IDEAS IN MOTION</span><i>✦</i>
        </div>
      </div>
      <div className="metrics__inner">
        <div className="section-intro section-intro--dark">
          <p className="section-kicker">{locale === 'pt' ? 'UM ARQUIVO SEM HIERARQUIA' : 'AN ARCHIVE WITHOUT RANKINGS'}</p>
          <h2 id="metrics-title">{locale === 'pt' ? 'Algumas coisas cresceram. Outras só precisavam existir.' : 'Some things grew. Others simply needed to exist.'}</h2>
          <p>{locale === 'pt' ? 'Aqui, alcance, afeto, aprendizado e diversão dividem a mesma prateleira.' : 'Here, reach, affection, learning and fun all share the same shelf.'}</p>
        </div>
        <div className="metrics__grid">
          {metrics.map((metric, index) => (
            <article key={metric.id} className={`metric-card metric-card--${index + 1}`}>
              <span className="metric-card__index">0{index + 1}</span>
              <strong><MetricValue value={metric.value} /></strong>
              <p>{metric.label[locale]}</p>
              <span className="metric-card__line" />
            </article>
          ))}
        </div>
      </div>
      <div className="theme-bridge" aria-hidden="true"><span /></div>
    </section>
  );
}
