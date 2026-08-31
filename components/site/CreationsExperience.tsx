'use client';

import { useEffect, useState } from 'react';
import { SmoothScroll } from '@/components/motion/SmoothScroll';
import { Hero } from './Hero';
import { MetricsSection } from './MetricsSection';
import { PinnedNarrative } from './PinnedNarrative';
import { ChaptersSection } from './ChaptersSection';
import { ProjectArchive } from './ProjectArchive';
import { Footer } from './Footer';
import type { Locale, SiteContent } from '@/lib/content/types';

type Theme = 'dark' | 'light';

export function CreationsExperience({ content }: { content: SiteContent }) {
  const [locale, setLocale] = useState<Locale>('pt');
  /** starts dark to match the server render; the pre-paint script has already
      put the real choice on <html>, and the effect below catches up to it. */
  const [theme, setTheme] = useState<Theme>('dark');

  useEffect(() => {
    const frame = window.requestAnimationFrame(() => {
      const saved = window.localStorage.getItem('gk-locale');
      if (saved === 'pt' || saved === 'en') setLocale(saved);
      else if (!navigator.language.toLowerCase().startsWith('pt')) setLocale('en');
    });
    return () => window.cancelAnimationFrame(frame);
  }, []);

  useEffect(() => {
    document.documentElement.lang = locale === 'pt' ? 'pt-BR' : 'en';
  }, [locale]);

  useEffect(() => {
    const frame = window.requestAnimationFrame(() => {
      setTheme(document.documentElement.dataset.theme === 'light' ? 'light' : 'dark');
    });
    return () => window.cancelAnimationFrame(frame);
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

  const coveredSlugs = content.chapters.flatMap((chapter) => chapter.coveredSlugs);

  return (
    <SmoothScroll>
      <main className="site-shell">
        <Hero locale={locale} onToggleLocale={toggleLocale} theme={theme} onToggleTheme={toggleTheme} content={content} />
        <MetricsSection locale={locale} metrics={content.metrics} />
        <PinnedNarrative locale={locale} steps={content.story} />
        <ChaptersSection chapters={content.chapters} steps={content.story} locale={locale} />
        <ProjectArchive locale={locale} projects={content.projects} coveredSlugs={coveredSlugs} />
        <Footer key={locale} locale={locale} />
      </main>
    </SmoothScroll>
  );
}
