'use client';

import { useEffect, useRef, useState } from 'react';
import type { Locale } from '@/lib/content/types';

const glyphs = 'GK+*01/<>#';

export function Footer({ locale }: { locale: Locale }) {
  const ref = useRef<HTMLElement>(null);
  const finalText = locale === 'pt' ? 'VAMOS CRIAR ALGO?' : 'SHALL WE MAKE SOMETHING?';
  const [scrambled, setScrambled] = useState(finalText);

  useEffect(() => {
    const element = ref.current;
    if (!element || window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
    let played = false;
    const observer = new IntersectionObserver(([entry]) => {
      if (!entry.isIntersecting || played) return;
      played = true;
      let iteration = 0;
      const interval = window.setInterval(() => {
        setScrambled(finalText.split('').map((letter, index) => {
          if (letter === ' ') return ' ';
          if (index < iteration) return letter;
          return glyphs[Math.floor(Math.random() * glyphs.length)];
        }).join(''));
        iteration += 0.75;
        if (iteration >= finalText.length) {
          window.clearInterval(interval);
          setScrambled(finalText);
        }
      }, 45);
    }, { threshold: 0.45 });
    observer.observe(element);
    return () => observer.disconnect();
  }, [finalText]);

  return (
    <footer ref={ref} className="footer">
      <div className="footer__top">
        <p>GUSTAVO GIACOIA KUMAGAI · 2026</p>
        <a href="https://gustavo-giacoia.vercel.app/" target="_blank" rel="noreferrer">{locale === 'pt' ? 'PORTFÓLIO TÉCNICO ↗' : 'TECH PORTFOLIO ↗'}</a>
      </div>
      <a className="footer__cta" href="mailto:contato@gusgk.com.br" aria-label={finalText}>
        <span aria-hidden="true">{scrambled}</span>
        <i aria-hidden="true">↗</i>
      </a>
      <div className="footer__bottom">
        <span>MINHAS CRIAÇÕES GK</span>
        <span>{locale === 'pt' ? 'FEITO COM CURIOSIDADE' : 'BUILT WITH CURIOSITY'}</span>
        <a href="#top">{locale === 'pt' ? 'VOLTAR AO TOPO ↑' : 'BACK TO TOP ↑'}</a>
      </div>
    </footer>
  );
}
