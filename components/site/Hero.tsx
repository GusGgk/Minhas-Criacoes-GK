import { PrismCanvas } from '@/components/motion/PrismCanvas';
import type { Locale, SiteContent } from '@/lib/content/types';

export function Hero({ locale, onToggleLocale, content }: { locale: Locale; onToggleLocale: () => void; content: SiteContent }) {
  const hero = content.hero;

  return (
    <>
      <header className="topbar">
        <a className="brand" href="#top" aria-label="Minhas Criações GK — início">
          <span className="brand__mark"><b>G</b><i>K</i></span>
          <span className="brand__name">{locale === 'pt' ? 'MINHAS CRIAÇÕES' : 'MY CREATIONS'}</span>
        </a>
        <div className="topbar__meta" aria-hidden="true">
          <span>SÃO PAULO · BR</span>
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
          <a className="menu-link" href="#capitulos">{locale === 'pt' ? 'VER AS CRIAÇÕES' : 'SEE THE WORK'} <span>↘</span></a>
        </div>
      </header>

      <section id="top" className="hero">
        <div className="hero__copy">
          <p className="eyebrow"><span />{hero.eyebrow[locale]}</p>
          <h1>{hero.title[locale]}</h1>
          <p className="hero__lead">{hero.lead[locale]}</p>
          <div className="hero__cta-row">
            <a className="primary-cta" href="#capitulos">
              <span>{locale === 'pt' ? 'COMEÇAR A VER' : 'START LOOKING'}</span>
              <i aria-hidden="true">↘</i>
            </a>
            <span className="hero__hint">{locale === 'pt' ? 'Mova o cursor' : 'Move your cursor'}</span>
          </div>
        </div>

        <div className="hero__visual">
          <PrismCanvas locale={locale} />
        </div>

        <div className="hero__index" aria-label={locale === 'pt' ? 'As sete frentes' : 'The seven fronts'}>
          {content.chapters.map((chapter) => (
            <a key={chapter.id} href={`#${chapter.anchor}`}>
              {chapter.index} — {chapter.nav[locale].toUpperCase()}
            </a>
          ))}
        </div>
      </section>

    </>
  );
}
