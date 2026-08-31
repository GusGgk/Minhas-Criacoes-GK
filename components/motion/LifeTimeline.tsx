'use client';

import { useEffect, useState, useSyncExternalStore } from 'react';
import { timeline } from '@/lib/content/timeline';
import type { Locale } from '@/lib/content/types';

/** how long a moment stays lit before the line moves on */
const DWELL = 4200;
const REDUCED_MOTION = '(prefers-reduced-motion: reduce)';

function subscribeToMotionPreference(onChange: () => void) {
  const query = window.matchMedia(REDUCED_MOTION);
  query.addEventListener('change', onChange);
  return () => query.removeEventListener('change', onChange);
}

export function LifeTimeline({ locale }: { locale: Locale }) {
  const [active, setActive] = useState(0);
  /** the line draws itself once, a beat after the hero settles */
  const [drawn, setDrawn] = useState(false);
  /** someone is reading a specific moment: stop advancing until they leave */
  const [held, setHeld] = useState(false);
  const reduced = useSyncExternalStore(
    subscribeToMotionPreference,
    () => window.matchMedia(REDUCED_MOTION).matches,
    () => false,
  );

  useEffect(() => {
    const id = window.setTimeout(() => setDrawn(true), 220);
    return () => window.clearTimeout(id);
  }, []);

  useEffect(() => {
    if (!drawn || held || reduced) return;
    const id = window.setTimeout(() => setActive((index) => (index + 1) % timeline.length), DWELL);
    return () => window.clearTimeout(id);
  }, [drawn, held, reduced, active]);

  const current = timeline[active];

  return (
    <div
      className="thread"
      data-drawn={drawn}
      style={{ '--thread-accent': current.accent } as React.CSSProperties}
      onPointerLeave={() => setHeld(false)}
    >
      <span className="thread__glow" aria-hidden="true" />
      <ol className="thread__list" aria-label={locale === 'pt' ? 'Linha do tempo' : 'Timeline'}>
        {timeline.map((moment, index) => (
          <li
            key={moment.id}
            className="moment"
            data-active={index === active}
            data-passed={index <= active}
            style={{ '--moment-accent': moment.accent, '--i': index } as React.CSSProperties}
          >
            <a
              href={moment.href}
              onPointerEnter={() => { setActive(index); setHeld(true); }}
              onFocus={() => { setActive(index); setHeld(true); }}
              onBlur={() => setHeld(false)}
            >
              <span className="moment__when">{moment.when[locale]}</span>
              <span className="moment__rail" aria-hidden="true"><i /></span>
              <span className="moment__body">
                <strong>{moment.title[locale]}</strong>
                <span className="moment__note"><span>{moment.note[locale]}</span></span>
              </span>
            </a>
          </li>
        ))}
      </ol>
    </div>
  );
}
