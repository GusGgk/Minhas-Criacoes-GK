'use client';

import { useEffect, useRef, useState } from 'react';
import type { Chapter, Locale } from '@/lib/content/types';

/** Floating index of the chapters — appears only while the reader is inside them. */
export function ChapterNav({ chapters, locale }: { chapters: Chapter[]; locale: Locale }) {
  const [active, setActive] = useState<string | null>(null);
  const listRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const sections = chapters
      .map((chapter) => document.getElementById(chapter.anchor))
      .filter((section): section is HTMLElement => Boolean(section));
    if (!sections.length) return;

    // The chapter occupying the middle of the viewport wins, so a tall chapter
    // does not hand the highlight over to its neighbour while still on screen.
    const observer = new IntersectionObserver(
      () => {
        const middle = window.innerHeight / 2;
        const current = sections.find((section) => {
          const { top, bottom } = section.getBoundingClientRect();
          return top <= middle && bottom >= middle;
        });
        setActive(current ? current.id : null);
      },
      { rootMargin: '-50% 0px -50% 0px', threshold: 0 },
    );
    sections.forEach((section) => observer.observe(section));
    return () => observer.disconnect();
  }, [chapters]);

  useEffect(() => {
    const list = listRef.current;
    if (!list || !active) return;
    const item = list.querySelector<HTMLElement>(`[data-anchor="${active}"]`);
    if (item) item.scrollIntoView({ block: 'nearest', inline: 'center', behavior: 'smooth' });
  }, [active]);

  const currentAccent = chapters.find((chapter) => chapter.anchor === active)?.accent ?? '#ff6b4a';

  return (
    <nav
      className={`chapter-nav ${active ? 'is-visible' : ''}`}
      aria-label={locale === 'pt' ? 'Índice das criações' : 'Index of the work'}
      style={{ '--nav-accent': currentAccent } as React.CSSProperties}
    >
      <span className="chapter-nav__title">{locale === 'pt' ? 'CRIAÇÕES' : 'WORK'}</span>
      <div ref={listRef} className="chapter-nav__list">
        {chapters.map((chapter) => (
          <a
            key={chapter.id}
            data-anchor={chapter.anchor}
            className={chapter.anchor === active ? 'is-active' : ''}
            style={{ '--item-accent': chapter.accent } as React.CSSProperties}
            href={`#${chapter.anchor}`}
            aria-current={chapter.anchor === active ? 'true' : undefined}
          >
            <i>{chapter.index}</i>
            {chapter.nav[locale]}
          </a>
        ))}
      </div>
    </nav>
  );
}
