import type { LocalizedText } from './types';

export type TimelineMoment = {
  id: string;
  /** time marker printed in the rail: a date when it is documented, a word when it is not */
  when: LocalizedText;
  /** what happened to me, in my words — never the name of the project */
  title: LocalizedText;
  /** the personal line, revealed only while the moment is the active one */
  note: LocalizedText;
  accent: string;
  /** chapter anchor this moment opens */
  href: string;
};

/**
 * The hero timeline. Same reasoning as chapters.ts: this is the personal part,
 * so it lives in code and not in the CMS. It introduces the person, not the
 * work — the names of the projects belong to the chapters further down.
 */
export const timeline: TimelineMoment[] = [
  {
    id: 'campo',
    when: { pt: 'ANTES', en: 'BEFORE' },
    title: { pt: 'Aprendi em campo', en: 'Learned it on the pitch' },
    note: {
      pt: 'Muito antes da primeira linha de código, eu já treinava todo dia por um resultado que nunca dependia só de mim.',
      en: 'Long before my first line of code, I was training every day for a result that never depended on me alone.',
    },
    accent: '#76d796',
    href: '#esporte',
  },
  {
    id: 'turma',
    when: { pt: 'MAR 2025', en: 'MAR 2025' },
    title: { pt: 'Levantei a mão', en: 'I raised my hand' },
    note: {
      pt: 'Me ofereci pra representar a turma e nunca mais baixei a mão. Quatro períodos depois, também cuido do caixa do centro acadêmico.',
      en: 'I volunteered to represent my class and never lowered my hand. Four terms later, I also look after the student union treasury.',
    },
    accent: '#b7a6ff',
    href: '#comprovacoes',
  },
  {
    id: 'marca',
    when: { pt: '2025', en: '2025' },
    title: { pt: 'Dei rosto a uma ideia', en: 'Gave an idea a face' },
    note: {
      pt: 'Peguei um projeto ainda no papel e desenhei nome, cor, voz e jeito de aparecer. Já reescrevi o manual inteiro uma vez — e vou reescrever de novo.',
      en: 'I took a project still on paper and drew its name, colour, voice and way of showing up. I have rewritten the whole manual once — and I will do it again.',
    },
    accent: '#f6c760',
    href: '#marca',
  },
  {
    id: 'amigos',
    when: { pt: '2025', en: '2025' },
    title: { pt: 'Programei uma piada', en: 'I coded a joke' },
    note: {
      pt: 'Uma zoeira interna do grupo virou um jogo de verdade. Levei mais a sério do que precisava — e foi exatamente por isso que ficou bom.',
      en: 'An inside joke with my friends turned into an actual game. I took it more seriously than I needed to — which is exactly why it turned out good.',
    },
    accent: '#ff7fac',
    href: '#amigos',
  },
  {
    id: 'voluntariado',
    when: { pt: '2025', en: '2025' },
    title: { pt: 'Um dia fora de mim', en: 'A day outside myself' },
    note: {
      pt: 'Passei um dia inteiro numa escola pública, com tinta na mão e criança em volta. Nada ali tinha a ver com portfólio.',
      en: 'I spent a whole day in a public school, paint on my hands and kids all around. None of it had anything to do with a portfolio.',
    },
    accent: '#76d7c4',
    href: '#voluntariado',
  },
  {
    id: 'estudos',
    when: { pt: '2025–2026', en: '2025–2026' },
    title: { pt: 'Organizei minha cabeça', en: 'Organised my own head' },
    note: {
      pt: 'Cansei de perder o que aprendia, então construí um sistema só meu pra guardar tudo. Comecei em 2025 e continuo mexendo nele.',
      en: 'I got tired of losing what I learned, so I built a system of my own to keep all of it. I started in 2025 and I am still tuning it.',
    },
    accent: '#68c9ff',
    href: '#estudos',
  },
  {
    id: 'voz',
    when: { pt: '2026', en: '2026' },
    title: { pt: 'Falei em voz alta', en: 'I spoke out loud' },
    note: {
      pt: 'Publiquei o primeiro vídeo só pra ver se alguém ficava até o fim. Milhões de visualizações depois, ainda escrevo e corto cada um na mão.',
      en: 'I published the first video just to see if anyone would stay until the end. Millions of views later, I still write and cut every one of them by hand.',
    },
    accent: '#ff6b4a',
    href: '#midia',
  },
  {
    id: 'agora',
    when: { pt: 'AGORA', en: 'NOW' },
    title: { pt: 'Nunca faço uma coisa só', en: 'Never just one thing' },
    note: {
      pt: 'Sete frentes ao mesmo tempo, e nenhuma delas cabe dentro da outra. Esta página é onde elas finalmente se encontram.',
      en: 'Seven fronts at once, and none of them fits inside another. This page is where they finally meet.',
    },
    accent: '#e0b8a4',
    href: '#capitulos',
  },
];
