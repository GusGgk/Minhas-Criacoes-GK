'use client';

import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { useEffect, useRef, useState } from 'react';
import type { Locale, StoryStep } from '@/lib/content/types';

gsap.registerPlugin(ScrollTrigger);

export function PinnedNarrative({ locale, steps }: { locale: Locale; steps: StoryStep[] }) {
  const sectionRef = useRef<HTMLElement>(null);
  const visualRef = useRef<HTMLDivElement>(null);
  const [active, setActive] = useState(0);

  useEffect(() => {
    const section = sectionRef.current;
    const visual = visualRef.current;
    if (!section || !visual) return;
    const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    const media = gsap.matchMedia();

    media.add('(min-width: 901px)', () => {
      if (reduced) return;
      const pin = ScrollTrigger.create({
        trigger: section,
        start: 'top top',
        end: 'bottom bottom',
        pin: visual,
        pinSpacing: false,
        anticipatePin: 1,
      });
      const triggers = gsap.utils.toArray<HTMLElement>('.story-step', section).map((step, index) =>
        ScrollTrigger.create({
          trigger: step,
          start: 'top center',
          end: 'bottom center',
          onEnter: () => setActive(index),
          onEnterBack: () => setActive(index),
        }),
      );
      return () => { pin.kill(); triggers.forEach((trigger) => trigger.kill()); };
    });

    media.add('(max-width: 900px)', () => {
      const triggers = gsap.utils.toArray<HTMLElement>('.story-step', section).map((step, index) =>
        ScrollTrigger.create({
          trigger: step,
          start: 'top 70%',
          onEnter: () => setActive(index),
          onEnterBack: () => setActive(index),
        }),
      );
      return () => triggers.forEach((trigger) => trigger.kill());
    });
    return () => media.revert();
  }, [steps]);

  const current = steps[active];

  return (
    <section ref={sectionRef} id="motivos" className="story" aria-labelledby="story-title">
      <div className="story__rail">
        <div className="story__heading">
          <p className="section-kicker">{locale === 'pt' ? 'POR QUE EU FAÇO' : 'WHY I MAKE THINGS'}</p>
          <h2 id="story-title">{locale === 'pt' ? 'Cinco motivos, e uma coisa minha em cada um.' : 'Five reasons, and something of mine behind each.'}</h2>
        </div>
        {steps.map((step, index) => (
          <article key={step.id} className={`story-step ${active === index ? 'is-active' : ''}`} data-step={index}>
            <span className="story-step__index">{step.index}</span>
            <div>
              <p>{step.eyebrow[locale]}</p>
              <h3>{step.title[locale]}</h3>
              <div className="story-step__body"><span style={{ background: step.accent }} />{step.body[locale]}</div>
            </div>
          </article>
        ))}
      </div>

      <div ref={visualRef} className="story__visual" aria-hidden="true" style={{ '--active-accent': current.accent } as React.CSSProperties}>
        <div className="story__visual-grid" />
        <div className="stack-object">
          {steps.map((step, index) => {
            const delta = index - active;
            return (
              <div
                key={step.id}
                className={`stack-layer ${index === active ? 'is-active' : ''}`}
                style={{
                  '--layer-accent': step.accent,
                  transform: `translate3d(${delta * 6}px, ${delta * 31}px, ${-Math.abs(delta) * 42}px) rotateX(62deg) rotateZ(-20deg)`,
                  opacity: Math.abs(delta) > 2 ? 0.16 : 0.35 + (index === active ? 0.65 : 0),
                  zIndex: steps.length - Math.abs(delta),
                } as React.CSSProperties}
              >
                <span>{step.index}</span><i />
              </div>
            );
          })}
          <div className="stack-core"><span>{current.stat[locale]}</span></div>
        </div>
        <div className="story__visual-meta">
          <span>{locale === 'pt' ? 'GK / MOTIVOS' : 'GK / REASONS'}</span>
          <strong>{current.index} — {current.title[locale].toUpperCase()}</strong>
          <span>{locale === 'pt' ? 'PULSO' : 'IMPULSE'} {String(active + 1).padStart(2, '0')} / {String(steps.length).padStart(2, '0')}</span>
        </div>
      </div>
    </section>
  );
}
