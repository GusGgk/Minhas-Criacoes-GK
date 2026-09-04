'use client';

/* eslint-disable @next/next/no-img-element -- covers are static assets sized by CSS. */

import { gsap } from 'gsap';
import { useEffect, useRef } from 'react';
import { ConstellationCanvas } from '@/components/motion/ConstellationCanvas';
import { ChapterBlocks, type OpenGallery } from './ChapterBlocks';
import type { Category, Creation, Locale } from '@/lib/content/types';

type Timeline = gsap.core.Timeline;

/**
 * Each creation announces itself differently. The card system underneath stays
 * identical — only the choreography changes, and only one creation is ever on
 * screen, so the variety reads as character instead of as a collage.
 */
const entrances: Record<string, (tl: Timeline) => void> = {
  // The channel leads with reach: the numbers land first and hard.
  broadcast: (tl) => {
    tl.from('.chapter-stats div', { y: 30, opacity: 0, duration: 0.5, stagger: 0.07, ease: 'power3.out' }, 0.1)
      .from('.chapter-block--gallery .chapter-shot', { xPercent: 14, opacity: 0, duration: 0.55, stagger: 0.05, ease: 'power2.out' }, 0.3);
  },
  // The brand leads with colour: the palette sweeps across like a paint pass.
  palette: (tl) => {
    tl.from('.chapter-swatch span', { scaleX: 0, transformOrigin: 'left center', duration: 0.42, stagger: 0.045, ease: 'power2.inOut' }, 0.05)
      .from('.chapter-block--quote', { opacity: 0, y: 20, duration: 0.5, ease: 'power2.out' }, 0.1)
      .from('.chapter-entry', { y: 24, opacity: 0, duration: 0.45, stagger: 0.07, ease: 'power3.out' }, 0.4);
  },
  // The planner gets dealt onto the table, screen by screen.
  deal: (tl) => {
    tl.from('.chapter-shot', {
      y: 46,
      opacity: 0,
      rotate: (i: number) => (i % 2 ? 3.5 : -3.5),
      duration: 0.5,
      stagger: 0.06,
      ease: 'power3.out',
    }, 0.1);
  },
  // The vault settles, then the graph switches on last.
  graph: (tl) => {
    tl.from('.chapter-chips span', { y: 14, opacity: 0, duration: 0.36, stagger: 0.05, ease: 'power2.out' }, 0.1)
      .from('.constellation', { opacity: 0, scale: 0.94, duration: 0.7, ease: 'power2.out' }, 0.2);
  },
  // Old match photos, run through like a reel.
  reel: (tl) => {
    tl.from('.chapter-shot', { opacity: 0, scale: 1.06, duration: 0.34, stagger: 0.08, ease: 'power2.out' }, 0.1);
  },
  // A photo essay: the cover breathes open before the rest follows.
  essay: (tl) => {
    tl.from('.solo__cover img', { scale: 1.1, duration: 1.5, ease: 'power2.out' }, 0)
      .from('.chapter-shot', { y: 30, opacity: 0, duration: 0.5, stagger: 0.06, ease: 'power3.out' }, 0.45);
  },
  // A document, drawn out of the folder.
  dossier: (tl) => {
    tl.from('.solo__cover', { y: 40, opacity: 0, duration: 0.62, ease: 'power3.out' }, 0.05)
      .from('.chapter-shot', { y: 26, opacity: 0, duration: 0.5, stagger: 0.09, ease: 'power3.out' }, 0.3);
  },
  // The gift: nothing snaps, everything warms up.
  gift: (tl) => {
    tl.from('.solo__cover', { opacity: 0, scale: 0.97, duration: 0.95, ease: 'power1.out' }, 0)
      .fromTo('.solo__wash', { opacity: 0.2 }, { opacity: 1, duration: 1.1, ease: 'sine.inOut' }, 0);
  },
  // A game made for fun, so it lands with a bounce.
  arcade: (tl) => {
    tl.from('.solo__cover', { y: 54, opacity: 0, duration: 0.7, ease: 'back.out(1.7)' }, 0.05);
  },
};

export function CreationSolo({
  creation,
  category,
  locale,
  onClose,
  onOpen,
}: {
  creation: Creation;
  category: Category;
  locale: Locale;
  onClose: () => void;
  onOpen: OpenGallery;
}) {
  const ref = useRef<HTMLElement>(null);

  useEffect(() => {
    const node = ref.current;
    if (!node) return;
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;

    const context = gsap.context(() => {
      // Shared opening: the room lights up and the name arrives. Every creation
      // gets this, so the site still feels like one place.
      const tl = gsap.timeline({ defaults: { overwrite: 'auto' } });
      tl.from('.solo__wash', { opacity: 0, duration: 0.5, ease: 'power2.out' }, 0)
        .from('.solo__head > *', { y: 26, opacity: 0, duration: 0.6, stagger: 0.06, ease: 'power3.out' }, 0)
        .from('.solo__stage', { y: 30, opacity: 0, duration: 0.65, ease: 'power3.out' }, 0.1);

      // Then whatever this particular creation does with the floor.
      const signature = creation.signature ? entrances[creation.signature] : undefined;
      if (signature) signature(tl);
      else tl.from('.chapter-block', { y: 26, opacity: 0, duration: 0.55, stagger: 0.05, ease: 'power3.out' }, 0.2);
    }, node);

    return () => context.revert();
  }, [creation.id, creation.signature]);

  useEffect(() => {
    const onKey = (event: KeyboardEvent) => { if (event.key === 'Escape') onClose(); };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [onClose]);

  return (
    <article
      ref={ref}
      className={`solo solo--${creation.signature ?? 'plain'}`}
      style={{ '--tone': category.accent } as React.CSSProperties}
      aria-labelledby={`solo-${creation.id}`}
    >
      <div className="solo__wash" aria-hidden="true" />

      <div className="solo__inner">
        <header className="solo__head">
          <button type="button" className="solo__back" onClick={onClose}>
            <i aria-hidden="true" />
            {locale === 'pt' ? 'Voltar pra parede' : 'Back to the wall'}
          </button>
          <p className="solo__shelf">{category.name[locale]}</p>
          <h1 id={`solo-${creation.id}`}>{creation.name[locale]}</h1>
          <p className="solo__tagline">{creation.tagline[locale]}</p>
        </header>

        <div className="solo__stage">
          {creation.cover && (
            <figure className="solo__cover">
              <button
                type="button"
                onClick={() => onOpen([creation.cover!], 0)}
                aria-label={locale === 'pt' ? `Ampliar: ${creation.cover.caption.pt}` : `Open: ${creation.cover.caption.en}`}
              >
                <img
                  src={creation.cover.src}
                  alt={creation.cover.caption[locale]}
                  style={creation.cover.fit === 'contain' ? { objectFit: 'contain' } : undefined}
                />
              </button>
              <figcaption>{creation.cover.caption[locale]}</figcaption>
            </figure>
          )}

          <div className="solo__prose">
            <p className="solo__year">{creation.year[locale]}</p>
            {creation.body.map((paragraph) => <p key={paragraph.pt}>{paragraph[locale]}</p>)}
            {creation.link && (
              <a className="solo__link" href={creation.link.href} target="_blank" rel="noreferrer">
                {creation.link.label[locale]}
              </a>
            )}
          </div>
        </div>

        {(creation.blocks.length > 0 || creation.visual) && (
          <ChapterBlocks
            blocks={creation.blocks}
            locale={locale}
            onOpen={onOpen}
            trailing={creation.visual === 'constellation'
              ? <ConstellationCanvas locale={locale} accent={category.accent} />
              : undefined}
          />
        )}

        {creation.footnote && <p className="solo__footnote">{creation.footnote[locale]}</p>}
      </div>
    </article>
  );
}
