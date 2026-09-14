import { PortraitReveal } from '@/components/motion/PortraitReveal';
import { LINKS } from '@/lib/links';
import type { Locale, SiteContent } from '@/lib/content/types';

/* Inline so they take currentColor and follow the theme; no icon font, no request. */
function GitHubMark() {
  return (
    <svg viewBox="0 0 24 24" width="17" height="17" aria-hidden="true" focusable="false">
      <path fill="currentColor" d="M12 .3a12 12 0 0 0-3.8 23.4c.6.1.8-.3.8-.6v-2c-3.3.7-4-1.6-4-1.6-.6-1.4-1.4-1.8-1.4-1.8-1.1-.7.1-.7.1-.7 1.2.1 1.8 1.2 1.8 1.2 1.1 1.9 2.8 1.3 3.5 1 .1-.8.4-1.3.8-1.6-2.7-.3-5.5-1.3-5.5-5.9 0-1.3.5-2.4 1.2-3.2-.1-.3-.5-1.5.1-3.2 0 0 1-.3 3.3 1.2a11.5 11.5 0 0 1 6 0c2.3-1.5 3.3-1.2 3.3-1.2.7 1.7.2 2.9.1 3.2.8.8 1.2 1.9 1.2 3.2 0 4.6-2.8 5.6-5.5 5.9.4.4.8 1.1.8 2.2v3.3c0 .3.2.7.8.6A12 12 0 0 0 12 .3" />
    </svg>
  );
}

function InstagramMark() {
  return (
    <svg viewBox="0 0 24 24" width="17" height="17" aria-hidden="true" focusable="false" fill="none" stroke="currentColor" strokeWidth="1.9" strokeLinecap="round">
      <rect x="3" y="3" width="18" height="18" rx="5.2" />
      <circle cx="12" cy="12" r="4" />
      <circle cx="17.3" cy="6.7" r="1" fill="currentColor" stroke="none" />
    </svg>
  );
}

export function Hero({ locale, onToggleLocale, theme, onToggleTheme, content }: {
  locale: Locale;
  onToggleLocale: () => void;
  theme: 'dark' | 'light';
  onToggleTheme: () => void;
  content: SiteContent;
}) {
  const hero = content.hero;

  return (
    <>
      <header className="topbar">
        <a className="brand" href="#top" aria-label="Minhas Criações GK — início">
          <span className="brand__mark" aria-hidden="true" />
          <span className="brand__name">{locale === 'pt' ? 'MINHAS CRIAÇÕES' : 'MY CREATIONS'}</span>
        </a>
        <div className="topbar__meta" aria-hidden="true">
          <span>CURITIBA · BR</span>
          <span className="status-dot" />
          <span>{locale === 'pt' ? 'SEMPRE FAZENDO ALGO' : 'ALWAYS MAKING SOMETHING'}</span>
        </div>
        <div className="topbar__actions">
          <button
            type="button"
            className="locale-toggle"
            onClick={onToggleLocale}
            aria-label={locale === 'pt' ? 'Switch to English' : 'Mudar para português'}
          >
            <span className={locale === 'pt' ? 'is-active' : ''}>PT</span>
            <span>/</span>
            <span className={locale === 'en' ? 'is-active' : ''}>EN</span>
          </button>
          <button
            type="button"
            className="theme-toggle"
            onClick={onToggleTheme}
            aria-pressed={theme === 'light'}
            aria-label={locale === 'pt'
              ? (theme === 'dark' ? 'Mudar para o tema claro' : 'Mudar para o tema escuro')
              : (theme === 'dark' ? 'Switch to the light theme' : 'Switch to the dark theme')}
          >
            <i aria-hidden="true" />
            <span>{locale === 'pt' ? (theme === 'dark' ? 'CLARO' : 'ESCURO') : (theme === 'dark' ? 'LIGHT' : 'DARK')}</span>
          </button>
          <a className="menu-link" href="#parede">{locale === 'pt' ? 'Ver a parede' : 'See the wall'} <span>↘</span></a>
        </div>
      </header>

      <section id="top" className="hero">
        <div className="hero__copy">
          <p className="eyebrow"><span />{hero.eyebrow[locale]}</p>
          <h1>{hero.title[locale]}</h1>
          <p className="hero__lead">{hero.lead[locale]}</p>
          <div className="hero__cta-row">
            <a className="primary-cta" href="#parede">
              <span>{locale === 'pt' ? 'Descer pra parede' : 'Down to the wall'}</span>
              <i aria-hidden="true">↘</i>
            </a>
            <a className="secondary-cta" href={LINKS.portfolio} target="_blank" rel="noreferrer">
              <span>{locale === 'pt' ? 'Portfólio técnico' : 'Technical portfolio'}</span>
              <i aria-hidden="true">↗</i>
            </a>
            <span className="hero__social">
              <a href={LINKS.github} target="_blank" rel="noreferrer" aria-label="GitHub — GusGgk" title="GitHub">
                <GitHubMark />
              </a>
              <a href={LINKS.instagram} target="_blank" rel="noreferrer" aria-label="Instagram — @_gustavo.gk" title="Instagram">
                <InstagramMark />
              </a>
            </span>
          </div>
          <p className="hero__hint">
            <span className="hero__hint--hover">{locale === 'pt' ? 'Passe o mouse no retrato' : 'Hover the portrait'}</span>
            <span className="hero__hint--touch">{locale === 'pt' ? 'Toque no retrato' : 'Touch the portrait'}</span>
          </p>
        </div>

        <div className="hero__visual">
          <PortraitReveal locale={locale} />
        </div>
      </section>

    </>
  );
}
