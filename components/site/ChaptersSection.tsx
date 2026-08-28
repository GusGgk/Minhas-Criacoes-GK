'use client';

import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { useCallback, useEffect, useState } from 'react';
import { Chapter } from './Chapter';
import { ChapterNav } from './ChapterNav';
import { Lightbox, type LightboxState } from './Lightbox';
import type { Chapter as ChapterType, GalleryImage, Locale, StoryStep } from '@/lib/content/types';

gsap.registerPlugin(ScrollTrigger);

export function ChaptersSection({ chapters, steps, locale }: { chapters: ChapterType[]; steps: StoryStep[]; locale: Locale }) {
  const reasonOf = (chapter: ChapterType) => steps.find((step) => step.id === chapter.reasonId);
  const [lightbox, setLightbox] = useState<LightboxState>(null);

  const open = useCallback((images: GalleryImage[], index: number) => setLightbox({ images, index }), []);
  const close = useCallback(() => setLightbox(null), []);
  const navigate = useCallback((index: number) => setLightbox((state) => (state ? { ...state, index } : state)), []);

  // Display type is loaded async and reflows a long page, which would leave
  // reveals stuck on stale trigger positions.
  useEffect(() => {
    let cancelled = false;
    document.fonts?.ready.then(() => { if (!cancelled) ScrollTrigger.refresh(); });
    return () => { cancelled = true; };
  }, [chapters, locale]);

  const shots = chapters.reduce((total, chapter) => {
    const inBlocks = chapter.blocks.reduce((count, block) => {
      if (block.kind === 'gallery') return count + block.images.length;
      if (block.kind === 'entries') return count + block.entries.filter((entry) => entry.document).length;
      return count;
    }, 0);
    return total + inBlocks + (chapter.cover ? 1 : 0);
  }, 0);

  return (
    <>
      <section id="capitulos" className="chapters" aria-labelledby="chapters-title">
        <div className="chapters__intro">
          <p className="section-kicker">{locale === 'pt' ? 'ÍNDICE' : 'INDEX'}</p>
          <h2 id="chapters-title">
            {locale === 'pt' ? 'Sete frentes, na ordem em que aconteceram comigo.' : 'Seven fronts, in the order they happened to me.'}
          </h2>
          <p>
            {locale === 'pt'
              ? `Cada uma tem as fotos e os registros que sobraram dela — ${shots} imagens no total — e o motivo que fez aquilo existir.`
              : `Each one keeps the photos and records it left behind — ${shots} images in total — and the reason that made it exist.`}
          </p>
        </div>

        <ol className="chapters__toc">
          {chapters.map((chapter) => (
            <li key={chapter.id} style={{ '--chapter-accent': chapter.accent } as React.CSSProperties}>
              <a href={`#${chapter.anchor}`}>
                <span className="chapters__toc-index">{chapter.index}</span>
                <span className="chapters__toc-name">{chapter.title[locale]}</span>
                <span className="chapters__toc-kicker">
                  <i aria-hidden="true" style={{ background: reasonOf(chapter)?.accent }} />
                  {chapter.kicker[locale]}
                </span>
                <span className="chapters__toc-arrow" aria-hidden="true">↘</span>
              </a>
            </li>
          ))}
        </ol>
      </section>

      {chapters.map((chapter) => (
        <Chapter key={`${chapter.id}-${locale}`} chapter={chapter} locale={locale} reason={reasonOf(chapter)} onOpen={open} />
      ))}

      <ChapterNav chapters={chapters} locale={locale} />
      <Lightbox state={lightbox} locale={locale} onClose={close} onNavigate={navigate} />
    </>
  );
}
