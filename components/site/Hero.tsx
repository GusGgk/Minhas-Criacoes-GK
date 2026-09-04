import { LifeTimeline } from '@/components/motion/LifeTimeline';
import type { Locale, SiteContent } from '@/lib/content/types';

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
          <span className="brand__mark"><b>G</b><i>K</i></span>
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
            <span className="hero__hint">{locale === 'pt' ? 'Percorra a linha' : 'Follow the line'}</span>
          </div>
        </div>

        <div className="hero__visual">
          <LifeTimeline locale={locale} />
        </div>
      </section>

    </>
  );
}
