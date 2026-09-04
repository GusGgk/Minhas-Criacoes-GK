import type { Category, Creation } from './types';

/**
 * The shelves of the cabin. Order is the order they appear on the wall, which is
 * roughly how much of my life each one took, not how impressive it looks.
 */
export const categories: Category[] = [
  { id: 'video', name: { pt: 'Vídeo', en: 'Video' }, accent: '#ff6b4a' },
  { id: 'marca', name: { pt: 'Design de marca', en: 'Brand design' }, accent: '#5b74ff' },
  { id: 'estudo', name: { pt: 'Estudo', en: 'Study' }, accent: '#5cc6f5' },
  { id: 'futebol', name: { pt: 'Futebol', en: 'Football' }, accent: '#6ecf8e' },
  { id: 'voluntariado', name: { pt: 'Voluntariado', en: 'Volunteering' }, accent: '#5ccfbb' },
  { id: 'certificados', name: { pt: 'Certificados estudantis', en: 'Student records' }, accent: '#ad9cf7' },
  { id: 'pessoais', name: { pt: 'Projetos pessoais', en: 'Personal projects' }, accent: '#ff7fac' },
  { id: 'jogos', name: { pt: 'Jogos', en: 'Games' }, accent: '#f3c257' },
  {
    id: 'desenhos',
    name: { pt: 'Pinturas e desenhos', en: 'Paintings and drawings' },
    accent: '#cf8bf0',
    empty: {
      pt: 'Prateleira montada, ainda sem nada digitalizado.',
      en: 'Shelf is built, nothing scanned onto it yet.',
    },
  },
];

export const creations: Creation[] = [
  {
    id: 'decisao',
    signature: 'broadcast',
    slug: 'canal-decisao',
    categoryId: 'video',
    name: { pt: 'Canal Decisão', en: 'Canal Decisão' },
    tagline: {
      pt: 'Um canal de futebol que comecei só pra ver se alguém assistiria.',
      en: 'A football channel I started just to see if anyone would watch.',
    },
    year: { pt: 'desde 2023', en: 'since 2023' },
    cover: {
      id: 'decisao-banner',
      src: '/media/decisao/banner-canal.png',
      caption: { pt: 'Banner do canal', en: 'Channel banner' },
    },
    body: [
      {
        pt: 'Faço vídeos de futebol com reações, desafios, previsões e debates. A edição é minha também, no CapCut, do roteiro ao corte final.',
        en: 'I make football videos with reactions, challenges, predictions and debates. I edit them too, in CapCut, from script to final cut.',
      },
      {
        pt: 'Trezentos e vinte vídeos depois, ainda quero saber até onde vai.',
        en: 'Three hundred and twenty videos later, I still want to know how far it goes.',
      },
    ],
    link: { href: 'https://www.youtube.com/@ocanaldecisao', label: { pt: 'Abrir o canal', en: 'Open the channel' } },
    blocks: [
      {
        kind: 'stats',
        id: 'decisao-stats',
        note: { pt: 'medido em agosto de 2026', en: 'measured in August 2026' },
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
        label: { pt: 'A identidade que montei pro canal', en: 'The identity I put together for it' },
        images: [
          { id: 'd1', src: '/media/decisao/logo-preta.jpg', caption: { pt: 'Logotipo em fundo claro', en: 'Logo on light' } },
          { id: 'd2', src: '/media/decisao/logo-branca.jpg', caption: { pt: 'Logotipo em fundo escuro', en: 'Logo on dark' } },
          { id: 'd3', src: '/media/decisao/icone-sem-fundo.png', caption: { pt: 'Ícone sem fundo', en: 'Icon, no background' }, fit: 'contain', background: '#14100e' },
          { id: 'd4', src: '/media/decisao/exploracao-1.png', caption: { pt: 'Exploração de identidade', en: 'Identity exploration' } },
          { id: 'd5', src: '/media/decisao/exploracao-2.png', caption: { pt: 'Variação do ícone', en: 'Icon variation' } },
          { id: 'd6', src: '/media/decisao/estudo-icone.png', caption: { pt: 'Primeiros estudos', en: 'Early studies' } },
          { id: 'd7', src: '/media/decisao/membros.png', caption: { pt: 'Arte dos membros', en: 'Member artwork' } },
        ],
      },
    ],
  },

  {
    id: 'mirtillo',
    signature: 'palette',
    slug: 'mirtillo',
    categoryId: 'marca',
    name: { pt: 'Mirtillo', en: 'Mirtillo' },
    tagline: {
      pt: 'A marca que ajudei a construir do zero, e onde mais gosto de mexer.',
      en: 'The brand I helped build from scratch, and where I most like to tinker.',
    },
    year: { pt: 'manual v2.0, 2026', en: 'manual v2.0, 2026' },
    cover: {
      id: 'mirtillo-app',
      src: '/media/mirtillo/mirtillo-app.png',
      caption: { pt: 'A marca aplicada', en: 'The brand applied' },
    },
    body: [
      {
        pt: 'Entrei desde o começo: posicionamento, cores, tipografia, jeito de falar e o mascote Berry. Hoje tudo isso está organizado num manual, já na segunda versão.',
        en: 'I was there from the start: positioning, colours, typography, tone of voice and the mascot Berry. It is all organised in a manual now, already on its second version.',
      },
      {
        pt: 'A Mirtillo é feita em equipe, e o marketplace ainda está em desenvolvimento.',
        en: 'Mirtillo is a team effort, and the marketplace is still in development.',
      },
    ],
    footnote: {
      pt: 'Manual de marca interno, julho de 2026.',
      en: 'Internal brand manual, July 2026.',
    },
    blocks: [
      {
        kind: 'quote',
        id: 'mirtillo-tagline',
        text: { pt: 'Você cria. A Mirtillo mostra o próximo passo.', en: 'You create. Mirtillo shows the next step.' },
        source: { pt: 'A gente acredita em você', en: 'We believe in you' },
      },
      {
        kind: 'swatches',
        id: 'mirtillo-palette',
        label: { pt: 'A paleta oficial', en: 'The official palette' },
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
        label: { pt: 'Os ativos', en: 'The assets' },
        note: {
          pt: 'O Berry é mascote, não logotipo. Ele existe pra deixar a conversa mais próxima.',
          en: 'Berry is a mascot, not a logo. He exists to make the conversation feel closer.',
        },
        images: [
          { id: 'm2', src: '/media/mirtillo/mirtillo-logo.webp', caption: { pt: 'Logotipo', en: 'Logo' }, fit: 'contain', background: '#EEF1FF' },
          { id: 'm3', src: '/media/mirtillo/mirtillo-icon-v2.png', caption: { pt: 'Ícone', en: 'Icon' }, fit: 'contain', background: '#12172a' },
          { id: 'm4', src: '/media/mirtillo/mirtillo-berry.webp', caption: { pt: 'Berry em 3D', en: 'Berry in 3D' }, fit: 'contain' },
        ],
      },
      {
        kind: 'entries',
        id: 'mirtillo-archetypes',
        label: { pt: 'Os três arquétipos que guiam o tom', en: 'The three archetypes behind the tone' },
        entries: [
          {
            id: 'mentor',
            title: { pt: 'Mentor', en: 'Mentor' },
            meta: { pt: 'principal', en: 'primary' },
            body: { pt: 'Clareza, método e próximo passo.', en: 'Clarity, method and the next step.' },
          },
          {
            id: 'aliado',
            title: { pt: 'Aliado', en: 'Ally' },
            meta: { pt: 'principal', en: 'primary' },
            body: { pt: 'Está junto, incentiva e não julga.', en: 'Sticks around, encourages, never judges.' },
          },
          {
            id: 'cuidador',
            title: { pt: 'Cuidador', en: 'Caregiver' },
            meta: { pt: 'secundário', en: 'secondary' },
            body: { pt: 'Reduz ansiedade, vergonha e fricção.', en: 'Eases anxiety, shame and friction.' },
          },
        ],
      },
      {
        kind: 'chips',
        id: 'mirtillo-traits',
        label: { pt: 'Como ela soa, em Plus Jakarta Sans', en: 'How it sounds, set in Plus Jakarta Sans' },
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
    id: 'notion',
    signature: 'deal',
    slug: 'sistema-notion',
    categoryId: 'estudo',
    name: { pt: 'Meu sistema no Notion', en: 'My Notion system' },
    tagline: {
      pt: 'Onde moram os períodos, as matérias, as aulas e as revisões.',
      en: 'Where the terms, subjects, classes and reviews live.',
    },
    year: { pt: 'em uso', en: 'in use' },
    body: [
      {
        pt: 'Montei esse modelo pra organizar as matérias da faculdade e os cursos que faço por fora no mesmo lugar. Cronograma, anotação e revisão ficam tudo ali.',
        en: 'I built this to keep my college subjects and the courses I take on the side in one place. Schedule, notes and reviews all sit there.',
      },
    ],
    blocks: [
      {
        kind: 'gallery',
        id: 'notion-gallery',
        label: { pt: 'Sete telas do sistema', en: 'Seven screens of it' },
        images: [
          { id: 'n1', src: '/media/notion/notion-01-cover-planner.png', caption: { pt: 'Capa do planner', en: 'Planner cover' } },
          { id: 'n2', src: '/media/notion/notion-02-periodos.png', caption: { pt: 'Grade de períodos', en: 'Term grid' } },
          { id: 'n3', src: '/media/notion/notion-03-calendario.png', caption: { pt: 'Calendário de tarefas', en: 'Task calendar' } },
          { id: 'n4', src: '/media/notion/notion-04-habilidades.png', caption: { pt: 'Stack em estudo', en: 'Stack in progress' } },
          { id: 'n5', src: '/media/notion/notion-05-materias-periodo.png', caption: { pt: 'Matérias do período', en: 'Subjects of the term' } },
          { id: 'n6', src: '/media/notion/notion-06-aulas-materia.png', caption: { pt: 'Aulas da matéria', en: 'Classes of a subject' } },
          { id: 'n7', src: '/media/notion/notion-07-anotacao-aula.png', caption: { pt: 'Anotação de aula', en: 'Class notes' } },
        ],
      },
    ],
  },

  {
    id: 'obsidian',
    signature: 'graph',
    slug: 'vault-obsidian',
    categoryId: 'estudo',
    name: { pt: 'Meu vault no Obsidian', en: 'My Obsidian vault' },
    tagline: {
      pt: 'A memória bruta do que eu estudo, costurada por um LLM.',
      en: 'The raw memory of what I study, stitched together by an LLM.',
    },
    year: { pt: 'em uso', en: 'in use' },
    visual: 'constellation',
    body: [
      {
        pt: 'Guardo o material cru em raw/ e o Claude Code me ajuda a organizar tudo em wiki/, ligando conceitos, fontes e disciplinas que eu não teria ligado sozinho.',
        en: 'I keep the raw material in raw/ and Claude Code helps me organise it into wiki/, connecting concepts, sources and subjects I would not have connected on my own.',
      },
    ],
    blocks: [
      {
        kind: 'chips',
        id: 'obsidian-vault',
        label: { pt: 'Como o vault é dividido', en: 'How the vault is split' },
        items: [
          { pt: 'raw/', en: 'raw/' },
          { pt: 'wiki/fontes/', en: 'wiki/fontes/' },
          { pt: 'wiki/conceitos/', en: 'wiki/conceitos/' },
          { pt: 'wiki/entidades/', en: 'wiki/entidades/' },
          { pt: 'wiki/sinteses/', en: 'wiki/sinteses/' },
          { pt: 'wiki/perguntas/', en: 'wiki/perguntas/' },
        ],
      },
    ],
  },

  {
    id: 'atleta',
    signature: 'reel',
    slug: 'futebol',
    categoryId: 'futebol',
    name: { pt: 'Quando eu jogava', en: 'When I played' },
    tagline: {
      pt: 'Uma fase que acabou e ainda aparece no meu jeito de trabalhar em equipe.',
      en: 'A phase that ended and still shows up in how I work with a team.',
    },
    year: { pt: 'arquivo', en: 'archive' },
    body: [
      {
        pt: 'Joguei como atleta e participei de alguns campeonatos. Essas fotos não viraram projeto nenhum, e mesmo assim eu guardei todas.',
        en: 'I played competitively and took part in a few tournaments. These photos never became a project, and I kept every one of them anyway.',
      },
    ],
    blocks: [
      {
        kind: 'gallery',
        id: 'esporte-gallery',
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
    id: 'voluntario',
    signature: 'essay',
    slug: 'dia-do-voluntario',
    categoryId: 'voluntariado',
    name: { pt: 'Dia do Voluntário', en: 'Volunteer Day' },
    tagline: {
      pt: 'Um mutirão pra reformar uma escola pública em Curitiba.',
      en: 'A working bee to renovate a public school in Curitiba.',
    },
    year: { pt: '2025', en: '2025' },
    cover: {
      id: 'v1',
      src: '/media/voluntariado/01-grupo.jpg',
      caption: {
        pt: 'Jardinagem e interação com as crianças, no Colégio Est. Dep. Olívio Belich',
        en: 'Gardening and time with the kids, at Colégio Est. Dep. Olívio Belich',
      },
    },
    body: [
      {
        pt: 'Fui voluntário no Colégio Estadual Deputado Olívio Belich, pelo mutirão anual da Fundação Telefônica Vivo. Ajudei na jardinagem, participei das atividades com as crianças e acompanhei de perto a reforma.',
        en: 'I volunteered at Colégio Estadual Deputado Olívio Belich, through the yearly Fundação Telefônica Vivo working bee. I helped with the garden, joined the activities with the children and followed the renovation up close.',
      },
    ],
    blocks: [
      {
        kind: 'gallery',
        id: 'voluntariado-gallery',
        images: [
          { id: 'v2', src: '/media/voluntariado/02-camiseta.jpg', caption: { pt: 'Camiseta oficial de voluntário', en: 'Official volunteer shirt' } },
          { id: 'v3', src: '/media/voluntariado/03-selfie.jpg', caption: { pt: 'Antes de começar o dia', en: 'Before the day started' } },
          { id: 'v4', src: '/media/voluntariado/04-equipe-video.jpg', caption: { pt: 'A equipe de vídeo trabalhando', en: 'The video crew at work' } },
          { id: 'v5', src: '/media/voluntariado/05-mural.jpg', caption: { pt: 'Pintura do mural', en: 'Painting the mural' } },
          { id: 'v6', src: '/media/voluntariado/06-jardim.jpg', caption: { pt: 'O jardim remodelado', en: 'The garden, remade' } },
        ],
      },
    ],
  },

  {
    id: 'representante',
    signature: 'dossier',
    slug: 'representante-de-turma',
    categoryId: 'certificados',
    name: { pt: 'Representante de turma', en: 'Class representative' },
    tagline: {
      pt: 'Quatro períodos fazendo a ponte entre a turma e a coordenação.',
      en: 'Four terms bridging my class and the course coordination.',
    },
    year: { pt: '03/2025 até agora', en: '03/2025 to now' },
    cover: {
      id: 'c1',
      src: '/media/comprovacoes/declaracao-representante-turma.png',
      caption: { pt: 'Declaração emitida pela coordenação do curso', en: 'Declaration issued by the course coordination' },
      fit: 'contain',
    },
    body: [
      {
        pt: 'Levo dúvidas e demandas da turma até a coordenação e os professores, e trago a resposta de volta. São quatro períodos letivos, cerca de dois anos.',
        en: 'I take questions and requests from my class to the coordination and the professors, and bring the answer back. Four terms so far, about two years.',
      },
    ],
    footnote: {
      pt: 'Documento da PUCPR. Escondi CPF, registro acadêmico e a assinatura de quem emitiu.',
      en: 'PUCPR document. I hid the ID numbers and the signature of whoever issued it.',
    },
    blocks: [],
  },

  {
    id: 'tesoureiro',
    signature: 'dossier',
    slug: 'tesoureiro-cabes',
    categoryId: 'certificados',
    name: { pt: 'Tesoureiro do CABES', en: 'CABES treasurer' },
    tagline: {
      pt: 'Cuidando das contas do centro acadêmico do meu curso.',
      en: 'Looking after the books of my course student union.',
    },
    year: { pt: 'declaração de agosto de 2026', en: 'declared August 2026' },
    cover: {
      id: 'c2',
      src: '/media/comprovacoes/declaracao-tesoureiro-cabes.png',
      caption: { pt: 'Declaração emitida pelo CABES', en: 'Declaration issued by CABES' },
      fit: 'contain',
    },
    body: [
      {
        pt: 'No CABES ajudo a planejar e controlar os recursos, organizar eventos e prestar contas do que entra e sai.',
        en: 'At CABES I help plan and track the money, organise events and account for what comes in and goes out.',
      },
    ],
    footnote: {
      pt: 'Documento da PUCPR. Escondi CPF, registro acadêmico e a assinatura de quem emitiu.',
      en: 'PUCPR document. I hid the ID numbers and the signature of whoever issued it.',
    },
    blocks: [],
  },

  {
    id: 'pibep',
    signature: 'dossier',
    slug: 'pibep-newscope',
    categoryId: 'certificados',
    name: { pt: 'Iniciação científica', en: 'Undergraduate research' },
    tagline: {
      pt: 'Quarenta horas construindo a interface do NewsScope.',
      en: 'Forty hours building the NewsScope interface.',
    },
    year: { pt: 'abr a jun de 2026', en: 'Apr to Jun 2026' },
    body: [
      {
        pt: 'Participei do PIBEP 2026, o programa de bolsas da PUCPR, de 22 de abril a 17 de junho. Nesse período trabalhei na interface web do ENoW, uma ferramenta que coleta, filtra e classifica notícias, sob orientação da professora Lisiane Reips.',
        en: 'I took part in PIBEP 2026, the PUCPR grant programme, from 22 April to 17 June. In that window I worked on the web interface for ENoW, a tool that collects, filters and classifies news, supervised by professor Lisiane Reips.',
      },
      {
        pt: 'O frontend saiu em React, Tailwind e Shadcn UI, pensado pra quem não programa conseguir explorar os dados.',
        en: 'The frontend came out in React, Tailwind and Shadcn UI, built so people who do not code can explore the data.',
      },
    ],
    blocks: [
      {
        kind: 'gallery',
        id: 'pibic-docs',
        images: [
          {
            id: 'pibep',
            src: '/media/comprovacoes/certificado-pibep.png',
            caption: { pt: 'Declaração de participação, 40 horas', en: 'Participation declaration, 40 hours' },
            fit: 'contain',
          },
          {
            id: 'feedback',
            src: '/media/comprovacoes/feedback-professor.png',
            caption: { pt: 'A PUCPR escrevendo sobre o projeto', en: 'PUCPR writing about the project' },
            fit: 'contain',
          },
        ],
      },
    ],
  },

  {
    id: 'site-presente',
    signature: 'gift',
    slug: 'site-de-presente',
    categoryId: 'pessoais',
    name: { pt: 'Um site de presente', en: 'A website as a gift' },
    tagline: {
      pt: 'Sem cliente, sem prazo e sem outro motivo.',
      en: 'No client, no deadline and no other reason.',
    },
    year: { pt: '2025', en: '2025' },
    cover: {
      id: 'p1',
      src: '/media/pessoais/site-presente.png',
      caption: { pt: 'A capa do site', en: 'The site cover' },
    },
    body: [
      {
        pt: 'Fiz um site inteiro de presente pra uma pessoa importante. É o único projeto meu que não precisava existir pra nada.',
        en: 'I built a whole website as a gift for someone important. It is the only project of mine that did not need to exist for anything.',
      },
    ],
    link: {
      href: 'https://gusggk.github.io/WebSite_by_My_GirlFriend/index-intro.html',
      label: { pt: 'Abrir o site', en: 'Open the site' },
    },
    blocks: [],
  },

  {
    id: 'abimaball',
    signature: 'arcade',
    slug: 'abimaball',
    categoryId: 'jogos',
    name: { pt: 'ABIMABALL', en: 'ABIMABALL' },
    tagline: {
      pt: 'Um jogo em Java que nasceu de piada interna.',
      en: 'A Java game born out of an inside joke.',
    },
    year: { pt: '2025', en: '2025' },
    cover: {
      id: 'p2',
      src: '/media/pessoais/abimaball.png',
      caption: { pt: 'O jogo rodando', en: 'The game running' },
    },
    body: [
      {
        pt: 'Simples, cheio de piada interna, e bem mais divertido de programar do que de jogar. Fizemos entre amigos, sem pretensão nenhuma.',
        en: 'Simple, full of inside jokes, and far more fun to build than to play. We made it among friends, with no ambition at all.',
      },
    ],
    link: { href: 'https://github.com/GusGgk/AbimaBall', label: { pt: 'Ver o código', en: 'See the code' } },
    blocks: [],
  },
];
