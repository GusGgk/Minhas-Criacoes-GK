'use client';

/* eslint-disable @next/next/no-img-element -- gallery images keep their intrinsic size inside the overlay. */

import { useCallback, useEffect } from 'react';
import type { GalleryImage, Locale } from '@/lib/content/types';

export type LightboxState = { images: GalleryImage[]; index: number } | null;

export function Lightbox({
  state,
  locale,
  onClose,
  onNavigate,
}: {
  state: LightboxState;
  locale: Locale;
  onClose: () => void;
  onNavigate: (index: number) => void;
}) {
  const total = state?.images.length ?? 0;

  const step = useCallback(
    (delta: number) => {
      if (!total) return;
      onNavigate((((state?.index ?? 0) + delta) % total + total) % total);
    },
    [onNavigate, state?.index, total],
  );

  useEffect(() => {
    if (!state) return;
    const onKey = (event: KeyboardEvent) => {
      if (event.key === 'Escape') onClose();
      if (event.key === 'ArrowRight') step(1);
      if (event.key === 'ArrowLeft') step(-1);
    };
    // Lenis drives the page with window.scrollTo, so the root has to be locked too.
    const previous = { root: document.documentElement.style.overflow, body: document.body.style.overflow };
    document.documentElement.style.overflow = 'hidden';
    document.body.style.overflow = 'hidden';
    window.addEventListener('keydown', onKey);
    return () => {
      document.documentElement.style.overflow = previous.root;
      document.body.style.overflow = previous.body;
      window.removeEventListener('keydown', onKey);
    };
  }, [state, onClose, step]);

  if (!state) return null;
  const current = state.images[state.index];

  return (
    <div className="lightbox" role="dialog" aria-modal="true" aria-label={current.caption[locale]}>
      <button type="button" className="lightbox__backdrop" onClick={onClose} aria-label={locale === 'pt' ? 'Fechar' : 'Close'} />
      <figure className="lightbox__frame">
        <img src={current.src} alt={current.caption[locale]} />
        <figcaption>
          <span>{current.caption[locale]}</span>
          <span>{String(state.index + 1).padStart(2, '0')} / {String(total).padStart(2, '0')}</span>
        </figcaption>
      </figure>
      {total > 1 && (
        <>
          <button type="button" className="lightbox__step lightbox__step--prev" onClick={() => step(-1)} aria-label={locale === 'pt' ? 'Anterior' : 'Previous'}>←</button>
          <button type="button" className="lightbox__step lightbox__step--next" onClick={() => step(1)} aria-label={locale === 'pt' ? 'Próxima' : 'Next'}>→</button>
        </>
      )}
      <button type="button" className="lightbox__close" onClick={onClose} aria-label={locale === 'pt' ? 'Fechar' : 'Close'}>✕</button>
    </div>
  );
}
