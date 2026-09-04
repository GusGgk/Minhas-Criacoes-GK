'use client';

import { useCallback, useEffect, useState } from 'react';
import { SmoothScroll } from '@/components/motion/SmoothScroll';
import { Hero } from './Hero';
import { CreationsWall } from './CreationsWall';
import { CreationSolo } from './CreationSolo';
import { Lightbox, type LightboxState } from './Lightbox';
import { Footer } from './Footer';
import type { GalleryImage, Locale, SiteContent } from '@/lib/content/types';

type Theme = 'dark' | 'light';

/** Which creation is open, kept in the URL so a single one can be linked to. */
function slugFromLocation() {
  if (typeof window === 'undefined') return null;
  return new URLSearchParams(window.location.search).get('c');
}

export function CreationsExperience({ content }: { content: SiteContent }) {
  const [locale, setLocale] = useState<Locale>('pt');
  /** starts dark to match the server render; the pre-paint script has already
      put the real choice on <html>, and the effect below catches up to it. */
  const [theme, setTheme] = useState<Theme>('dark');
  const [openSlug, setOpenSlug] = useState<string | null>(null);
  const [lightbox, setLightbox] = useState<LightboxState>(null);

  useEffect(() => {
    const frame = window.requestAnimationFrame(() => {
      const saved = window.localStorage.getItem('gk-locale');
      if (saved === 'pt' || saved === 'en') setLocale(saved);
      else if (!navigator.language.toLowerCase().startsWith('pt')) setLocale('en');
      setTheme(document.documentElement.dataset.theme === 'light' ? 'light' : 'dark');
      setOpenSlug(slugFromLocation());
    });
    return () => window.cancelAnimationFrame(frame);
  }, []);

  useEffect(() => {
    document.documentElement.lang = locale === 'pt' ? 'pt-BR' : 'en';
  }, [locale]);

  // Back and forward move between the wall and whatever was open.
  useEffect(() => {
    const onPop = () => setOpenSlug(slugFromLocation());
    window.addEventListener('popstate', onPop);
    return () => window.removeEventListener('popstate', onPop);
  }, []);

  const select = useCallback((slug: string) => {
    window.history.pushState(null, '', `?c=${encodeURIComponent(slug)}`);
    setOpenSlug(slug);
    window.scrollTo({ top: 0 });
  }, []);

  const close = useCallback(() => {
    window.history.pushState(null, '', window.location.pathname);
    setOpenSlug(null);
    window.scrollTo({ top: 0 });
  }, []);

  const toggleLocale = () => setLocale((current) => {
    const next = current === 'pt' ? 'en' : 'pt';
    window.localStorage.setItem('gk-locale', next);
    return next;
  });

  const toggleTheme = () => setTheme((current) => {
    const next = current === 'dark' ? 'light' : 'dark';
    document.documentElement.dataset.theme = next;
    window.localStorage.setItem('gk-theme', next);
    return next;
  });

  const openGallery = useCallback((images: GalleryImage[], index: number) => setLightbox({ images, index }), []);
  const closeGallery = useCallback(() => setLightbox(null), []);
  const moveGallery = useCallback((index: number) => setLightbox((s) => (s ? { ...s, index } : s)), []);

  const open = content.creations.find((creation) => creation.slug === openSlug) ?? null;
  const openCategory = open ? content.categories.find((c) => c.id === open.categoryId) ?? null : null;

  return (
    <SmoothScroll>
      <main className={`site-shell ${open ? 'is-solo' : ''}`}>
        {open && openCategory ? (
          <CreationSolo
            key={open.id}
            creation={open}
            category={openCategory}
            locale={locale}
            onClose={close}
            onOpen={openGallery}
          />
        ) : (
          <>
            <Hero
              locale={locale}
              onToggleLocale={toggleLocale}
              theme={theme}
              onToggleTheme={toggleTheme}
              content={content}
            />
            <CreationsWall
              categories={content.categories}
              creations={content.creations}
              locale={locale}
              onSelect={select}
            />
            <Footer key={locale} locale={locale} />
          </>
        )}
      </main>
      <Lightbox state={lightbox} locale={locale} onClose={closeGallery} onNavigate={moveGallery} />
    </SmoothScroll>
  );
}
