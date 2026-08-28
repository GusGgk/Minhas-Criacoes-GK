'use client';

/* eslint-disable @next/next/no-img-element -- chapter covers are static assets sized by CSS. */

import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { useEffect, useRef } from 'react';
import { ConstellationCanvas } from '@/components/motion/ConstellationCanvas';
import { ChapterBlocks, type OpenGallery } from './ChapterBlocks';
import type { Chapter as ChapterType, GalleryImage, Locale, StoryStep } from '@/lib/content/types';

gsap.registerPlugin(ScrollTrigger);

function Cover({
  image,
  locale,
  onOpen,
  className,
}: {
  image: GalleryImage;
  locale: Locale;
  onOpen: OpenGallery;
  className: string;
}) {
  return (
    <figure className={className}>
      <button
        type="button"
        onClick={() => onOpen([image], 0)}
        aria-label={`${locale === 'pt' ? 'Ampliar' : 'Open'}: ${image.caption[locale]}`}
      >
        <img src={image.src} alt={image.caption[locale]} loading="lazy" decoding="async" />
        <span aria-hidden="true">⤢</span>
      </button>
      <figcaption>{image.caption[locale]}</figcaption>
    </figure>
  );
}

export function Chapter({
  chapter,
  locale,
  reason,
  onOpen,
}: {
  chapter: ChapterType;
  locale: Locale;
  reason?: StoryStep;
  onOpen: OpenGallery;
}) {
  const ref = useRef<HTMLElement>(null);
  const bannerCover = chapter.layout === 'broadcast' ? chapter.cover : undefined;
  const insetCover = chapter.layout === 'broadcast' ? undefined : chapter.cover;

  useEffect(() => {
    const section = ref.current;
    if (!section || window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
    const context = gsap.context(() => {
      gsap.from('.chapter__head > *', {
        y: 40,
        opacity: 0,
        duration: 1,
        stagger: 0.09,
        ease: 'power4.out',
        scrollTrigger: { trigger: '.chapter__head', start: 'top 84%', once: true },
      });
      gsap.utils.toArray<HTMLElement>('.chapter-block').forEach((block) => {
        gsap.from(block, {
          y: 54,
          opacity: 0,
          duration: 1.05,
          ease: 'power4.out',
          scrollTrigger: { trigger: block, start: 'top 88%', once: true },
        });
      });
      const banner = section.querySelector('.chapter__banner img');
      if (banner) {
        gsap.fromTo(banner, { scale: 1.14 }, {
          scale: 1,
          ease: 'none',
          scrollTrigger: { trigger: '.chapter__banner', start: 'top bottom', end: 'bottom top', scrub: 0.7 },
        });
      }
      const strip = section.querySelector('.chapter__marquee-inner');
      if (strip) {
        gsap.to(strip, {
          xPercent: -30,
          ease: 'none',
          scrollTrigger: { trigger: section, start: 'top bottom', end: 'bottom top', scrub: 0.6 },
        });
      }
    }, section);
    return () => context.revert();
  }, [locale]);

  return (
    <section
      ref={ref}
      id={chapter.anchor}
      className={`chapter chapter--${chapter.tone} chapter--${chapter.layout}`}
      style={{ '--chapter-accent': chapter.accent } as React.CSSProperties}
      aria-labelledby={`chapter-${chapter.id}-title`}
    >
      {bannerCover && <Cover image={bannerCover} locale={locale} onOpen={onOpen} className="chapter__banner" />}

      <div className="chapter__inner">
        <header className="chapter__head">
          <p className="chapter__index">
            <span>{chapter.index}</span>
            {chapter.kicker[locale]}
          </p>
          <h2 id={`chapter-${chapter.id}-title`}>{chapter.title[locale]}</h2>
          <p className="chapter__lead">{chapter.lead[locale]}</p>
          {reason && (
            <a className="chapter__reason" href="#motivos">
              <i aria-hidden="true" style={{ background: reason.accent }} />
              {locale === 'pt' ? 'MOTIVO' : 'REASON'} {reason.index} · {reason.title[locale].toUpperCase()}
            </a>
          )}
        </header>

        <div className="chapter__body">
          {insetCover && <Cover image={insetCover} locale={locale} onOpen={onOpen} className="chapter__cover" />}
          <div className="chapter__prose">
            {chapter.body.map((paragraph) => <p key={paragraph.pt}>{paragraph[locale]}</p>)}
            {chapter.link && (
              <a className="chapter__link" href={chapter.link.href} target="_blank" rel="noreferrer">
                {chapter.link.label[locale]}
              </a>
            )}
          </div>
        </div>

        <ChapterBlocks
          blocks={chapter.blocks}
          locale={locale}
          onOpen={onOpen}
          trailing={chapter.visual === 'constellation' ? <ConstellationCanvas locale={locale} accent={chapter.accent} /> : undefined}
        />

        {chapter.footnote && <p className="chapter__footnote">{chapter.footnote[locale]}</p>}
      </div>

      {chapter.marquee && (
        <div className="chapter__marquee" aria-hidden="true">
          <div className="chapter__marquee-inner">
            {Array.from({ length: 6 }, (_, index) => (
              <span key={index}>{chapter.marquee![locale]}<i>✦</i></span>
            ))}
          </div>
        </div>
      )}
    </section>
  );
}
