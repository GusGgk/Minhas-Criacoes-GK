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
          <span>{locale === 'pt' ? 'SEMPRE INVENTANDO ALGO' : 'ALWAYS MAKING SOMETHING'}</span>
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
          <a className="menu-link" href="#arquivo">{locale === 'pt' ? 'ARQUIVO' : 'ARCHIVE'} <span>↘</span></a>
        </div>
      </header>

      <section id="top" className="hero">
        <div className="hero__copy">
          <p className="eyebrow"><span />{hero.eyebrow[locale]}</p>
          <h1>{hero.title[locale]}</h1>
          <p className="hero__lead">{hero.lead[locale]}</p>
          <div className="hero__cta-row">
            <a className="primary-cta" href="#arquivo">
              <span>{locale === 'pt' ? 'EXPLORAR O ARQUIVO' : 'EXPLORE THE ARCHIVE'}</span>
              <i aria-hidden="true">↘</i>
            </a>
            <span className="hero__hint">{locale === 'pt' ? 'Mova o cursor' : 'Move your cursor'}</span>
          </div>
        </div>

        <div className="hero__visual">
          <PrismCanvas locale={locale} />
        </div>

        <div className="hero__index" aria-label={locale === 'pt' ? 'Resumo do arquivo' : 'Archive summary'}>
          <span>01 — {locale === 'pt' ? 'IDEIAS' : 'IDEAS'}</span>
          <span>02 — {locale === 'pt' ? 'TESTES' : 'EXPERIMENTS'}</span>
          <span>03 — {locale === 'pt' ? 'MEMÓRIAS' : 'MEMORIES'}</span>
          <span>04 — {locale === 'pt' ? 'PROJETOS' : 'PROJECTS'}</span>
        </div>
      </section>

    </>
  );
}
