import type { Chapter } from './types';

/**
 * The narrative spine of the site, recovered from the first version.
 * Prose lives here instead of the CMS: the panel exists to add new creations,
 * not to rewrite the personal part of each chapter.
 */
export const chapters: Chapter[] = [
  {
    id: 'midia',
    layout: 'broadcast',
    reasonId: 'curiosity',
    marquee: { pt: 'CANAL DECISÃO', en: 'CANAL DECISÃO' },
    anchor: 'midia',
    index: '01',
    nav: { pt: 'Mídia', en: 'Media' },
    kicker: { pt: 'CONTEÚDO & MÍDIA', en: 'CONTENT & MEDIA' },
    title: { pt: 'Vídeo e criação de conteúdo', en: 'Video and content creation' },
    lead: {
      pt: 'Um canal já está no ar; o outro ainda está saindo do papel.',
      en: 'One channel is already live; the other is still taking shape.',
    },
    body: [
      {
        pt: 'No Canal Decisão, faço vídeos de futebol com reações, desafios, previsões e debates. Também cuido da edição no CapCut, do roteiro ao corte final.',
        en: 'On Canal Decisão, I make football videos with reactions, challenges, predictions and debates. I also edit everything in CapCut, from the script to the final cut.',
      },
      {
        pt: 'Também organizei a identidade do canal em um manual com o logotipo, os ícones e a arte dos membros.',
        en: 'I also put together a brand guide for the channel, covering the logo, icons and artwork for members.',
      },
    ],
    accent: '#ff6b4a',
    tone: 'ink',
    cover: {
      id: 'decisao-banner',
      src: '/media/decisao/banner-canal.png',
      caption: { pt: 'Banner do Canal Decisão', en: 'Canal Decisão banner' },
    },
    link: { href: 'https://www.youtube.com/@ocanaldecisao', label: { pt: '@ocanaldecisao ↗', en: '@ocanaldecisao ↗' } },
    coveredSlugs: ['canal-decisao'],
    blocks: [
      {
        kind: 'stats',
        id: 'decisao-stats',
        label: { pt: 'YOUTUBE · FUTEBOL', en: 'YOUTUBE · FOOTBALL' },
        note: { pt: 'instantâneo · ago/2026', en: 'snapshot · aug/2026' },
        metrics: [
          { id: 'subs', value: '25,1 mil', label: { pt: 'inscritos', en: 'subscribers' } },
          { id: 'videos', value: '320', label: { pt: 'vídeos', en: 'videos' } },
          { id: 'views', value: '26,6 mi', label: { pt: 'visualizações', en: 'views' } },
          { id: 'hours', value: '94,5 mil', label: { pt: 'horas assistidas', en: 'hours watched' } },
        ],
      },
      {
        kind: 'gallery',
        id: 'decisao-brand',
        label: { pt: 'IDENTIDADE DO CANAL', en: 'CHANNEL IDENTITY' },
        images: [
          { id: 'd1', src: '/media/decisao/logo-preta.jpg', caption: { pt: 'Logotipo — fundo claro', en: 'Logo — light background' } },
          { id: 'd2', src: '/media/decisao/logo-branca.jpg', caption: { pt: 'Logotipo — fundo escuro', en: 'Logo — dark background' } },
          { id: 'd3', src: '/media/decisao/icone-sem-fundo.png', caption: { pt: 'Ícone sem fundo', en: 'Icon, no background' }, fit: 'contain', background: '#14100e' },
          { id: 'd4', src: '/media/decisao/exploracao-1.png', caption: { pt: 'Exploração de identidade', en: 'Identity exploration' } },
          { id: 'd5', src: '/media/decisao/exploracao-2.png', caption: { pt: 'Variação do ícone', en: 'Icon variation' } },
          { id: 'd6', src: '/media/decisao/estudo-icone.png', caption: { pt: 'Primeiros estudos', en: 'Early studies' } },
          { id: 'd7', src: '/media/decisao/membros.png', caption: { pt: 'Arte dos membros', en: 'Members artwork' } },
        ],
      },
    ],
  },
  {
    id: 'marca',
    layout: 'manual',
    reasonId: 'deep-dive',
    anchor: 'marca',
    index: '02',
    nav: { pt: 'Marca', en: 'Brand' },
    kicker: { pt: 'DESIGN & MARCA', en: 'DESIGN & BRAND' },
    title: { pt: 'Mirtillo', en: 'Mirtillo' },
    lead: {
      pt: 'É o projeto de marca com que mais me identifico hoje.',
      en: 'This is the brand project I connect with the most today.',
    },
    body: [
      {
        pt: 'Ajudei a construir a Mirtillo desde o começo: posicionamento, cores, tipografia, jeito de falar e o mascote Berry. Hoje, tudo isso está organizado em um manual de marca. É o projeto em que mais gosto de experimentar com design.',
        en: 'I helped build Mirtillo from the start: positioning, colors, typography, tone of voice and the mascot Berry. It is all organized in a brand guide now. This is where I most enjoy experimenting with design.',
      },
      {
        pt: 'A Mirtillo é feita em equipe, e o marketplace ainda está em desenvolvimento.',
        en: 'Mirtillo is a team effort, and the marketplace is still in development.',
      },
    ],
    accent: '#f6c760',
    tone: 'paper',
    cover: {
      id: 'mirtillo-app',
      src: '/media/mirtillo/mirtillo-app.png',
      caption: { pt: 'Aplicação da marca', en: 'Brand application' },
    },
    footnote: {
      pt: 'Manual de Marca Mirtillo · v2.0 · documento interno · julho de 2026',
      en: 'Mirtillo Brand Manual · v2.0 · internal document · July 2026',
    },
    coveredSlugs: ['mirtillo'],
    blocks: [
      {
        kind: 'quote',
        id: 'mirtillo-tagline',
        text: { pt: 'Você cria. A Mirtillo mostra o próximo passo.', en: 'You create. Mirtillo shows the next step.' },
        source: { pt: 'A gente acredita em você.', en: 'We believe in you.' },
      },
      {
        kind: 'swatches',
        id: 'mirtillo-palette',
        label: { pt: 'PALETA OFICIAL', en: 'OFFICIAL PALETTE' },
        colors: [
          { id: 'mirtillo-blue', name: 'Mirtillo Blue', hex: '#304FEC', text: '#ffffff' },
          { id: 'deep-blue', name: 'Deep Blue', hex: '#102A67', text: '#ffffff' },
          { id: 'leaf-green', name: 'Leaf Green', hex: '#6BC339', text: '#0d2210' },
          { id: 'deep-green', name: 'Deep Green', hex: '#239A40', text: '#ffffff' },
          { id: 'soft-lilac', name: 'Soft Lilac', hex: '#EEF1FF', text: '#111943' },
          { id: 'ink', name: 'Ink', hex: '#111943', text: '#ffffff' },
          { id: 'ice', name: 'Ice', hex: '#F8F9FD', text: '#111943' },
          { id: 'white', name: 'White', hex: '#FFFFFF', text: '#111943' },
        ],
      },
      {
        kind: 'gallery',
        id: 'mirtillo-assets',
        label: { pt: 'ATIVOS VISUAIS', en: 'VISUAL ASSETS' },
        note: {
          pt: 'O Berry deixa a comunicação da Mirtillo mais próxima e ajuda a explicar as coisas de um jeito simples. É mascote, não logotipo.',
          en: 'Berry makes the Mirtillo voice feel more approachable and helps explain things simply. A mascot, not a logo.',
        },
        images: [
          { id: 'm2', src: '/media/mirtillo/mirtillo-logo.webp', caption: { pt: 'Logotipo', en: 'Logo' }, fit: 'contain', background: '#EEF1FF' },
          { id: 'm3', src: '/media/mirtillo/mirtillo-icon-v2.png', caption: { pt: 'Ícone', en: 'Icon' }, fit: 'contain', background: '#12172a' },
          { id: 'm4', src: '/media/mirtillo/mirtillo-berry.webp', caption: { pt: 'Berry 3D', en: 'Berry 3D' }, fit: 'contain' },
        ],
      },
      {
        kind: 'entries',
        id: 'mirtillo-archetypes',
        label: { pt: 'ARQUÉTIPOS', en: 'ARCHETYPES' },
        entries: [
          {
            id: 'mentor',
            title: { pt: 'Mentor', en: 'Mentor' },
            meta: { pt: 'PRINCIPAL', en: 'PRIMARY' },
            body: { pt: 'Clareza, método e próximo passo.', en: 'Clarity, method and the next step.' },
          },
          {
            id: 'aliado',
            title: { pt: 'Aliado', en: 'Ally' },
            meta: { pt: 'PRINCIPAL', en: 'PRIMARY' },
            body: { pt: 'Está junto, incentiva e não julga.', en: 'Sticks around, encourages, never judges.' },
          },
          {
            id: 'cuidador',
            title: { pt: 'Cuidador', en: 'Caregiver' },
            meta: { pt: 'SECUNDÁRIO', en: 'SECONDARY' },
            body: { pt: 'Reduz ansiedade, vergonha e fricção.', en: 'Eases anxiety, shame and friction.' },
          },
        ],
      },
      {
        kind: 'chips',
        id: 'mirtillo-traits',
        label: { pt: 'TIPOGRAFIA E TRAÇOS · PLUS JAKARTA SANS', en: 'TYPOGRAPHY AND TRAITS · PLUS JAKARTA SANS' },
        items: [
          { pt: 'Acolhedora', en: 'Warm' },
          { pt: 'Simples', en: 'Simple' },
          { pt: 'Inovadora', en: 'Innovative' },
          { pt: 'Jovem', en: 'Young' },
          { pt: 'Prática', en: 'Practical' },
        ],
      },
    ],
  },
  {
    id: 'estudos',
    layout: 'split',
    reasonId: 'deep-dive',
    visual: 'constellation',
    anchor: 'estudos',
    index: '03',
    nav: { pt: 'Estudos', en: 'Studies' },
    kicker: { pt: 'ESTUDOS & SISTEMAS', en: 'STUDIES & SYSTEMS' },
    title: { pt: 'Como eu organizo o que aprendo', en: 'How I organize what I learn' },
    lead: {
      pt: 'Uso dois sistemas para organizar os estudos: um mais livre e outro mais estruturado.',
      en: 'I use two systems to organize my studies: one is flexible and the other is more structured.',
    },
    body: [
      {
        pt: 'No Notion, organizo as matérias da faculdade e os cursos que faço por fora. Lá ficam meus cronogramas, anotações e revisões.',
        en: 'I use Notion for college subjects and the courses I take on the side. My schedules, notes and reviews all stay there.',
      },
      {
        pt: 'Uso o Obsidian como uma memória dos meus estudos. Guardo o material bruto em raw/, e o Claude Code me ajuda a organizar tudo em wiki/ e a relacionar conceitos, fontes e disciplinas.',
        en: 'I use Obsidian as a memory for my studies. I keep rough material in raw/, and Claude Code helps me organize it in wiki/ and connect concepts, sources and subjects.',
      },
    ],
    accent: '#68c9ff',
    tone: 'ink',
    coveredSlugs: ['sistema-notion'],
    blocks: [
      {
        kind: 'quote',
        id: 'notion-quote',
        panel: 'a',
        text: {
          pt: 'Montei esse modelo para organizar todas as matérias, períodos e aulas em um só lugar.',
          en: 'I built this setup to keep my subjects, semesters and classes together in one place.',
        },
        source: { pt: 'NOTION', en: 'NOTION' },
      },
      {
        kind: 'gallery',
        id: 'notion-gallery',
        panel: 'a',
        label: { pt: 'SISTEMA DE ESTUDOS NO NOTION', en: 'NOTION STUDY SYSTEM' },
        note: { pt: '7 registros do sistema', en: '7 shots of the system' },
        images: [
          { id: 'n1', src: '/media/notion/notion-01-cover-planner.png', caption: { pt: 'Capa do planner', en: 'Planner cover' } },
          { id: 'n2', src: '/media/notion/notion-02-periodos.png', caption: { pt: 'Grade de períodos', en: 'Period grid' } },
          { id: 'n3', src: '/media/notion/notion-03-calendario.png', caption: { pt: 'Calendário de tarefas', en: 'Task calendar' } },
          { id: 'n4', src: '/media/notion/notion-04-habilidades.png', caption: { pt: 'Stack em estudo', en: 'Stacks in progress' } },
          { id: 'n5', src: '/media/notion/notion-05-materias-periodo.png', caption: { pt: 'Matérias do período', en: 'Subjects of the term' } },
          { id: 'n6', src: '/media/notion/notion-06-aulas-materia.png', caption: { pt: 'Aulas da matéria', en: 'Classes of a subject' } },
          { id: 'n7', src: '/media/notion/notion-07-anotacao-aula.png', caption: { pt: 'Anotação de aula', en: 'Class notes' } },
        ],
      },
      {
        kind: 'chips',
        id: 'obsidian-vault',
        panel: 'b',
        label: { pt: 'BASE DE CONHECIMENTO NO OBSIDIAN · CLAUDE CODE', en: 'OBSIDIAN KNOWLEDGE BASE · CLAUDE CODE' },
        items: [
          { pt: 'raw/', en: 'raw/' },
          { pt: 'wiki/fontes/', en: 'wiki/fontes/' },
          { pt: 'wiki/conceitos/', en: 'wiki/conceitos/' },
          { pt: 'wiki/entidades/', en: 'wiki/entidades/' },
          { pt: 'wiki/sinteses/', en: 'wiki/sinteses/' },
          { pt: 'wiki/perguntas/', en: 'wiki/perguntas/' },
        ],
      },
      {
        kind: 'quote',
        id: 'obsidian-quote',
        panel: 'b',
        text: {
          pt: 'Eu guardo as notas no Obsidian e uso o LLM para organizar e conectar o conteúdo.',
          en: 'I keep the notes in Obsidian and use an LLM to organize and connect the content.',
        },
        source: { pt: 'OBSIDIAN', en: 'OBSIDIAN' },
      },
    ],
  },
  {
    id: 'esporte',
    layout: 'contact-sheet',
    reasonId: 'trace',
    anchor: 'esporte',
    index: '04',
    nav: { pt: 'Esporte', en: 'Sports' },
    kicker: { pt: 'ESPORTE', en: 'SPORTS' },
    title: { pt: 'Antes de programar, eu jogava', en: 'Before I coded, I played' },
    lead: {
      pt: 'Joguei futebol como atleta e participei de alguns campeonatos.',
      en: 'I played football competitively and took part in a few tournaments.',
    },
    body: [
      {
        pt: 'Registros de quando eu jogava futebol de forma mais profissional. É uma fase que acabou, mas que ainda aparece no meu jeito de trabalhar em equipe.',
        en: 'Records from when I played football at a more competitive level. That phase is over, but it still shows up in how I work with a team.',
      },
    ],
    accent: '#76d796',
    tone: 'paper',
    coveredSlugs: ['futebol'],
    blocks: [
      {
        kind: 'gallery',
        id: 'esporte-gallery',
        label: { pt: 'FUTEBOL', en: 'FOOTBALL' },
        images: [
          { id: 'e1', src: '/media/esporte/partida.jpg', caption: { pt: 'Partida', en: 'Match' } },
          { id: 'e2', src: '/media/esporte/equipe.jpg', caption: { pt: 'Equipe', en: 'Team' } },
          { id: 'e3', src: '/media/esporte/campeonato.jpg', caption: { pt: 'Campeonato', en: 'Tournament' } },
          { id: 'e4', src: '/media/esporte/premiacao.jpg', caption: { pt: 'Premiação', en: 'Award' } },
        ],
      },
    ],
  },
  {
    id: 'voluntariado',
    layout: 'photo-essay',
    reasonId: 'affection',
    anchor: 'voluntariado',
    index: '05',
    nav: { pt: 'Voluntariado', en: 'Volunteering' },
    kicker: { pt: 'IMPACTO SOCIAL', en: 'SOCIAL IMPACT' },
    title: { pt: 'Dia do Voluntário', en: 'Volunteer Day' },
    lead: {
      pt: 'Participei do mutirão anual da Fundação Telefônica Vivo para reformar uma escola pública.',
      en: 'I joined the annual Fundação Telefônica Vivo volunteer day to help renovate a public school.',
    },
    body: [
      {
        pt: 'Fui voluntário no Colégio Estadual Deputado Olívio Belich. Ajudei na jardinagem, participei das atividades com as crianças e acompanhei de perto a reforma da escola.',
        en: 'I volunteered at Colégio Estadual Deputado Olívio Belich, helping with the garden, spending time with the children and taking part in the school renovation.',
      },
    ],
    accent: '#76d7c4',
    tone: 'ink',
    cover: {
      id: 'v1',
      src: '/media/voluntariado/01-grupo.jpg',
      caption: {
        pt: 'Jardinagem e interação com as crianças — Colégio Est. Dep. Olívio Belich',
        en: 'Gardening and time with the kids — Colégio Est. Dep. Olívio Belich',
      },
    },
    coveredSlugs: ['dia-do-voluntario'],
    blocks: [
      {
        kind: 'gallery',
        id: 'voluntariado-gallery',
        label: { pt: 'FUNDAÇÃO TELEFÔNICA VIVO', en: 'FUNDAÇÃO TELEFÔNICA VIVO' },
        images: [
          { id: 'v2', src: '/media/voluntariado/02-camiseta.jpg', caption: { pt: 'Camiseta oficial — voluntário Vivo', en: 'Official Vivo volunteer shirt' } },
          { id: 'v3', src: '/media/voluntariado/03-selfie.jpg', caption: { pt: 'Antes de começar o dia', en: 'Before the day started' } },
          { id: 'v4', src: '/media/voluntariado/04-equipe-video.jpg', caption: { pt: 'Registro da equipe de vídeo', en: 'The video crew at work' } },
          { id: 'v5', src: '/media/voluntariado/05-mural.jpg', caption: { pt: 'Pintura do mural', en: 'Painting the mural' } },
          { id: 'v6', src: '/media/voluntariado/06-jardim.jpg', caption: { pt: 'Jardim remodelado', en: 'The renovated garden' } },
        ],
      },
    ],
  },
  {
    id: 'comprovacoes',
    layout: 'dossier',
    reasonId: 'trace',
    anchor: 'comprovacoes',
    index: '06',
    nav: { pt: 'Comprovações', en: 'Records' },
    kicker: { pt: 'COMPROVAÇÕES', en: 'RECORDS' },
    title: { pt: 'Registros e certificados', en: 'Records and certificates' },
    lead: {
      pt: 'Três documentos da PUCPR: duas declarações do curso e do Centro Acadêmico, e a da bolsa de pesquisa.',
      en: 'Three documents from PUCPR: two declarations from the course and the student union, and one for the research grant.',
    },
    body: [
      {
        pt: 'Represento a minha turma de Engenharia de Software desde março de 2025 — quatro períodos letivos até agora — e sou tesoureiro do CABES, o Centro Acadêmico do curso. As duas declarações saíram em 7 de agosto de 2026.',
        en: 'I have represented my Software Engineering class since March 2025 — four terms so far — and I am the treasurer of CABES, the course student union. Both declarations were issued on 7 August 2026.',
      },
      {
        pt: 'Também participei do PIBEP 2026, o programa de bolsas da PUCPR, de 22 de abril a 17 de junho, com 40 horas. Foi nesse período que trabalhei na interface do NewsScope, o projeto de iniciação científica orientado pela professora Lisiane Reips.',
        en: 'I also took part in PIBEP 2026, the PUCPR grant programme, from 22 April to 17 June, totalling 40 hours. That is when I worked on the NewsScope interface, the undergraduate research project supervised by professor Lisiane Reips.',
      },
    ],
    accent: '#b7a6ff',
    tone: 'paper',
    footnote: {
      pt: 'Documentos originais da PUCPR. Nas imagens publicadas aqui, CPF, registro acadêmico e assinaturas foram ocultados.',
      en: 'Original PUCPR documents. In the images published here, ID numbers and signatures are hidden.',
    },
    coveredSlugs: ['newscope-pibic'],
    blocks: [
      {
        kind: 'entries',
        id: 'cabes',
        label: { pt: 'CABES · REPRESENTAÇÃO', en: 'CABES · REPRESENTATION' },
        entries: [
          {
            id: 'representante',
            title: { pt: 'Representante de Turma', en: 'Class Representative' },
            meta: { pt: 'PUCPR · 03/2025 – 08/2026 · quatro períodos', en: 'PUCPR · 03/2025 – 08/2026 · four terms' },
            body: {
              pt: 'Como representante, faço a ponte entre a turma, a coordenação e os professores, levando dúvidas e demandas dos alunos.',
              en: 'As class representative, I connect students with the course coordinators and professors, bringing them questions and requests from the class.',
            },
            document: {
              id: 'c1',
              src: '/media/comprovacoes/declaracao-representante-turma.png',
              caption: { pt: 'Declaração de atuação como Representante de Turma — Coordenação do curso, PUCPR', en: 'Declaration of service as Class Representative — course coordination, PUCPR' },
              fit: 'contain',
            },
          },
          {
            id: 'tesoureiro',
            title: { pt: 'Tesoureiro — CABES', en: 'Treasurer — CABES' },
            meta: { pt: 'CABES · declaração de 07/08/2026', en: 'CABES · declaration of 07/08/2026' },
            body: {
              pt: 'No CABES, ajudo a cuidar das finanças, organizar eventos e prestar contas dos recursos.',
              en: 'I help look after the student union finances, organize events and account for the resources.',
            },
            document: {
              id: 'c2',
              src: '/media/comprovacoes/declaracao-tesoureiro-cabes.png',
              caption: { pt: 'Declaração de exercício do cargo de Tesoureiro — CABES, PUCPR', en: 'Declaration of service as Treasurer — CABES, PUCPR' },
              fit: 'contain',
            },
          },
        ],
      },
      {
        kind: 'quote',
        id: 'pibic-excerpt',
        text: {
          pt: 'Com orientação da professora Lisiane Reips, trabalhei na interface web do ENoW, uma ferramenta que coleta, filtra e classifica notícias. O frontend foi desenvolvido com React.js, Tailwind CSS e Shadcn UI.',
          en: 'Under the guidance of professor Lisiane Reips, I worked on the web interface for ENoW, a tool that collects, filters and classifies news. The frontend was built with React.js, Tailwind CSS and Shadcn UI.',
        },
        source: {
          pt: 'NewsScope: Interface Web para Análise Automatizada de Notícias com ENoW',
          en: 'NewsScope: Web Interface for Automated News Analysis with ENoW',
        },
      },
      {
        kind: 'gallery',
        id: 'pibic-docs',
        label: { pt: 'PIBIC · INICIAÇÃO CIENTÍFICA', en: 'PIBIC · UNDERGRADUATE RESEARCH' },
        images: [
          {
            id: 'pibep',
            src: '/media/comprovacoes/certificado-pibep.png',
            caption: { pt: 'Declaração de participação no PIBEP 2026 — PUCPR, 40 horas', en: 'PIBEP 2026 participation declaration — PUCPR, 40 hours' },
            fit: 'contain',
          },
          {
            id: 'feedback',
            src: '/media/comprovacoes/feedback-professor.png',
            caption: { pt: 'A PUCPR sobre o NewsScope, orientado pela professora Lisiane Reips', en: 'PUCPR on NewsScope, supervised by professor Lisiane Reips' },
            fit: 'contain',
          },
        ],
      },
    ],
  },
  {
    id: 'amigos',
    layout: 'playful',
    reasonId: 'play',
    anchor: 'amigos',
    index: '07',
    nav: { pt: 'Amigos', en: 'Friends' },
    kicker: { pt: 'PROJETOS PESSOAIS', en: 'PERSONAL PROJECTS' },
    title: { pt: 'Feitos por gostar, não por obrigação', en: 'Made because I wanted to, not because I had to' },
    lead: {
      pt: 'Um presente pra alguém importante e um jogo feito rindo com amigos.',
      en: 'A gift for someone important and a game made laughing with friends.',
    },
    body: [
      {
        pt: 'Fiz um site de presente para uma pessoa importante para mim. Foi um projeto pessoal, sem cliente e sem prazo — feito com carinho.',
        en: 'I made a website as a gift for someone important to me. It was a personal project with no client and no deadline — made with care.',
      },
      {
        pt: 'O ABIMABALL nasceu entre amigos, sem muita pretensão. Ele é simples, cheio de piadas internas e foi bem mais divertido de criar do que de jogar.',
        en: 'ABIMABALL was born among friends, with no big ambitions. It is simple, full of inside jokes and was much more fun to build than to play.',
      },
    ],
    accent: '#ff7fac',
    tone: 'ink',
    coveredSlugs: ['site-presente', 'abimaball'],
    blocks: [
      {
        kind: 'gallery',
        id: 'amigos-gallery',
        label: { pt: 'DOIS PROJETOS SEM PRAZO', en: 'TWO PROJECTS WITH NO DEADLINE' },
        images: [
          { id: 'p1', src: '/media/pessoais/site-presente.png', caption: { pt: 'Um site de presente', en: 'A gift, as a website' } },
          { id: 'p2', src: '/media/pessoais/abimaball.png', caption: { pt: 'ABIMABALL — Java', en: 'ABIMABALL — Java' } },
        ],
      },
      {
        kind: 'entries',
        id: 'amigos-links',
        label: { pt: 'ONDE VER', en: 'WHERE TO SEE THEM' },
        entries: [
          {
            id: 'site-presente',
            title: { pt: 'Um site de presente', en: 'A gift, as a website' },
            meta: { pt: 'PROJETO PESSOAL · 2025', en: 'PERSONAL PROJECT · 2025' },
            body: { pt: 'Feito com carinho, sem prazo.', en: 'Made with care, no deadline.' },
            href: 'https://gusggk.github.io/WebSite_by_My_GirlFriend/index-intro.html',
          },
          {
            id: 'abimaball',
            title: { pt: 'ABIMABALL', en: 'ABIMABALL' },
            meta: { pt: 'JAVA · JOGO · modo brincadeira', en: 'JAVA · GAME · just for fun' },
            body: { pt: 'Um jogo simples, feito rindo.', en: 'A simple game, made laughing.' },
            href: 'https://github.com/GusGgk/AbimaBall',
          },
        ],
      },
    ],
  },
];
