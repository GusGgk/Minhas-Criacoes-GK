'use client';

/* eslint-disable @next/next/no-img-element -- chapter media is served from /public and lazy-loaded below the fold. */

import { Fragment, type ReactNode } from 'react';
import { MetricValue } from './MetricValue';
import type { ChapterBlock, GalleryImage, Locale } from '@/lib/content/types';

export type OpenGallery = (images: GalleryImage[], index: number) => void;

function BlockLabel({ text, note }: { text?: string; note?: string }) {
  if (!text && !note) return null;
  return (
    <div className="chapter-block__label">
      {text && <span>{text}</span>}
      {note && <i>{note}</i>}
    </div>
  );
}

function GalleryFigure({
  image,
  locale,
  onOpen,
  className = '',
}: {
  image: GalleryImage;
  locale: Locale;
  onOpen: () => void;
  className?: string;
}) {
  return (
    <figure className={`chapter-shot ${className}`}>
      <button
        type="button"
        className="chapter-shot__frame"
        style={image.background ? { background: image.background } : undefined}
        onClick={onOpen}
        aria-label={`${locale === 'pt' ? 'Ampliar' : 'Open'}: ${image.caption[locale]}`}
      >
        <img
          src={image.src}
          alt={image.caption[locale]}
          loading="lazy"
          decoding="async"
          style={image.fit === 'contain' ? { objectFit: 'contain' } : undefined}
        />
        <span className="chapter-shot__zoom" aria-hidden="true">⤢</span>
      </button>
      <figcaption>{image.caption[locale]}</figcaption>
    </figure>
  );
}

function Block({ block, locale, onOpen }: { block: ChapterBlock; locale: Locale; onOpen: OpenGallery }) {
  switch (block.kind) {
    case 'gallery':
      return (
        <section className="chapter-block chapter-block--gallery">
          <BlockLabel text={block.label?.[locale]} note={block.note?.[locale]} />
          <div className="chapter-gallery" data-count={block.images.length}>
            {block.images.map((image, index) => (
              <GalleryFigure key={image.id} image={image} locale={locale} onOpen={() => onOpen(block.images, index)} />
            ))}
          </div>
        </section>
      );

    case 'stats':
      return (
        <section className="chapter-block chapter-block--stats">
          <BlockLabel text={block.label?.[locale]} note={block.note?.[locale]} />
          <dl className="chapter-stats">
            {block.metrics.map((metric) => (
              <div key={metric.id}>
                <dt><MetricValue value={metric.value} /></dt>
                <dd>{metric.label[locale]}</dd>
              </div>
            ))}
          </dl>
        </section>
      );

    case 'quote':
      return (
        <blockquote className="chapter-block chapter-block--quote">
          <p>{block.text[locale]}</p>
          {block.source && <cite>{block.source[locale]}</cite>}
        </blockquote>
      );

    case 'entries':
      return (
        <section className="chapter-block chapter-block--entries">
          <BlockLabel text={block.label?.[locale]} />
          <div className="chapter-entries">
            {block.entries.map((entry) => {
              const Wrapper = entry.href ? 'a' : 'article';
              const linkProps = entry.href ? { href: entry.href, target: '_blank', rel: 'noreferrer' } : {};
              return (
                <Wrapper key={entry.id} className="chapter-entry" {...linkProps}>
                  <div className="chapter-entry__head">
                    <h4>{entry.title[locale]}</h4>
                    <span>{entry.meta[locale]}</span>
                  </div>
                  <p>{entry.body[locale]}</p>
                  {entry.document && (
                    <GalleryFigure
                      image={entry.document}
                      locale={locale}
                      onOpen={() => onOpen([entry.document as GalleryImage], 0)}
                      className="chapter-shot--document"
                    />
                  )}
                  {entry.href && <span className="chapter-entry__arrow" aria-hidden="true">↗</span>}
                </Wrapper>
              );
            })}
          </div>
        </section>
      );

    case 'swatches':
      return (
        <section className="chapter-block chapter-block--swatches">
          <BlockLabel text={block.label?.[locale]} />
          <div className="chapter-swatches">
            {block.colors.map((color) => (
              <div key={color.id} className="chapter-swatch">
                <span style={{ background: color.hex, color: color.text }}>{color.name}</span>
                <i>{color.hex}</i>
              </div>
            ))}
          </div>
        </section>
      );

    case 'chips':
      return (
        <section className="chapter-block chapter-block--chips">
          <BlockLabel text={block.label?.[locale]} />
          <div className="chapter-chips">
            {block.items.map((item) => <span key={item.pt}>{item[locale]}</span>)}
          </div>
        </section>
      );

    default:
      return null;
  }
}

/**
 * Renders a chapter's blocks. When blocks declare a panel, they are grouped into
 * two columns instead of one stack — that is what makes the split layout read as
 * two systems side by side rather than one long list.
 */
export function ChapterBlocks({
  blocks,
  locale,
  onOpen,
  trailing,
}: {
  blocks: ChapterBlock[];
  locale: Locale;
  onOpen: OpenGallery;
  trailing?: ReactNode;
}) {
  const panelled = blocks.some((block) => block.panel);

  if (!panelled) {
    return (
      <div className="chapter__blocks">
        {blocks.map((block) => <Fragment key={block.id}><Block block={block} locale={locale} onOpen={onOpen} /></Fragment>)}
        {trailing}
      </div>
    );
  }

  const sideA = blocks.filter((block) => block.panel !== 'b');
  const sideB = blocks.filter((block) => block.panel === 'b');

  return (
    <div className="chapter__blocks chapter__blocks--panelled">
      <div className="chapter__panel">
        {sideA.map((block) => <Fragment key={block.id}><Block block={block} locale={locale} onOpen={onOpen} /></Fragment>)}
      </div>
      <div className="chapter__panel">
        {trailing}
        {sideB.map((block) => <Fragment key={block.id}><Block block={block} locale={locale} onOpen={onOpen} /></Fragment>)}
      </div>
    </div>
  );
}
