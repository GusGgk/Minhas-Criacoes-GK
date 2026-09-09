import { categories, creations } from './creations';
import type { SiteContent } from './types';

/**
 * The safety net. The database is the source of truth once the panel has been
 * used, but if it is unreachable — or has not been seeded yet — the site still
 * renders this, so a connection problem never shows an empty wall.
 */
export const defaultContent: SiteContent = {
  hero: {
    eyebrow: { pt: 'CRIAÇÕES DO GUSTAVO · 2026', en: 'GUSTAVO’S MAKES · 2026' },
    title: {
      pt: 'Tudo o que eu quis ver existindo.',
      en: 'Everything I wanted to see exist.',
    },
    lead: {
      pt: 'Crio em várias frentes, e nem tudo tem a ver com programar: um canal de futebol com 26 milhões de visualizações, uma marca que ajudei a construir do zero, meus estudos organizados do meu jeito, uma fase de atleta, um dia de voluntariado numa escola pública e coisas feitas rindo com os amigos.',
      en: 'I create on several fronts, and not all of it has to do with code: a football channel with 26 million views, a brand I helped build from scratch, my studies organised my own way, a phase as an athlete, a volunteering day at a public school and things made laughing with friends.',
    },
  },
  categories,
  creations,
};
