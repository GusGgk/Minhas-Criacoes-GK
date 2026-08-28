# Minhas Criações GK

Arquivo criativo de Gustavo Giacoia Kumagai: sete frentes de trabalho e de vida, cada uma com as fotos e os registros que deixou. A versão 2 separa interface, conteúdo, animações, persistência e painel administrativo — o antigo `index.html` autocontido de aproximadamente 15 MB não faz mais parte da aplicação.

## O que existe agora

- Home bilíngue em React/Next.js, com conteúdo renderizado no servidor.
- Sete capítulos narrativos (mídia, marca, estudos, esporte, voluntariado, comprovações, amigos), cada um com texto pessoal, galeria legendada e lightbox.
- Base cromática única: um só fundo escuro do topo ao rodapé, com separação por elevação e por cor de acento — sem alternar entre claro e escuro.
- Um único sistema de cards para todo tipo de projeto (3D, marca, UI, foto): mesma moldura, mesmo raio, e só três proporções (`--ratio-wide`, `--ratio-square`, `--ratio-doc`).
- Cada arquivo varia só na composição — `layout`: banner e filmstrip no canal, banda de paleta na marca, painel duplo nos estudos, grade 4-up no esporte, capa e mosaico no voluntariado, documentos nas comprovações e dois cartões largos nos projetos com amigos.
- Cada capítulo declara o `reasonId` do motivo que o originou e mostra o link de volta para a seção de motivos, ligando a abertura abstrata ao arquivo concreto.
- Índice dos capítulos no topo da narrativa e barra flutuante de navegação com destaque da seção atual.
- Wireframe procedural em Canvas 2D, sensível ao cursor e ao scroll.
- Scroll suave com Lenis e narrativa com GSAP ScrollTrigger (`pin: true` no desktop).
- Transições dark/light, métricas animadas, cards com parallax e tipografia cinética.
- CMS próprio em `/admin` para criar, editar, destacar, ocultar, reordenar e excluir projetos.
- Upload de imagens para o Vercel Blob; registros e ordem em Postgres (Neon).
- Login do painel via GitHub (Auth.js), com autorização por `ADMIN_EMAILS`.
- Favicon GK em múltiplos tamanhos, Open Graph, Twitter Card, manifest, robots e sitemap.
- Fallback local com todo o conteúdo original caso a base ainda não esteja disponível.
- Arquivo aberto no final: mostra apenas o que o CMS tem e nenhum capítulo já conta.

## Estrutura

```text
auth.ts                  configuração do Auth.js (GitHub + allowlist)
app/
  admin/                 painel administrativo
  api/auth/              rotas do Auth.js
  api/                   conteúdo público, CRUD e mídia
  layout.tsx             metadados globais
  page.tsx               home renderizada no servidor
components/
  admin/                 editor do CMS
  motion/                canvas do hero, constelação do vault, Lenis e reveals
  site/                  seções da experiência
db/
  index.ts               cliente Drizzle sobre Neon (Postgres)
  bootstrap.ts           criação das tabelas e seed idempotente
  schema.ts              schema Postgres/Drizzle
drizzle/                 migrations versionadas
lib/
  auth/                  autorização do painel
  content/               tipos, capítulos, fallback, validação e repositório
public/
  media/                 imagens e fontes extraídas do bundle antigo
scripts/
  extract-legacy-assets.mjs
  generate-favicon.mjs
```

## Desenvolvimento

Requer Node.js 22.13 ou mais recente.

```bash
npm install
cp .env.example .env.local   # preencha as variáveis
npm run dev
```

O endereço local é mostrado no terminal. Sem `DATABASE_URL` o site roda inteiro pelo fallback local (`lib/content/default-content.ts`); o `/admin` só abre com `ADMIN_EMAILS` definido e login pelo GitHub.

Comandos úteis:

```bash
npm run typecheck
npm run lint
npm run build
npm run db:generate   # gera migration a partir de db/schema.ts
npm run db:migrate    # aplica as migrations em DATABASE_URL (opcional; ver abaixo)
npm run assets:favicon
```

## Conteúdo e painel

A narrativa dos sete capítulos mora em `lib/content/chapters.ts`, versionada junto com o código: é a parte pessoal do site, com as fotos, as legendas e o texto de cada fase. Cada capítulo declara em `coveredSlugs` os projetos que já conta por inteiro.

O painel serve para o que vem depois. `db/bootstrap.ts` cria as tabelas (`CREATE TABLE IF NOT EXISTS`) e, na primeira execução com a base vazia, insere os oito projetos atuais — nenhum passo manual. Se preferir migrations rastreadas, rode `npm run db:migrate` numa base limpa antes do primeiro acesso. A seção final da home lista só os itens do CMS que nenhum capítulo cobre — enquanto não houver nenhum, ela mostra o espaço reservado para a próxima ideia. O frontend mantém um fallback equivalente, por isso a página continua útil mesmo antes da base ser conectada.

Em produção, defina `ADMIN_EMAILS` com os e-mails da conta do GitHub liberados (separados por vírgula). Sem essa lista, a versão de produção bloqueia todas as escritas e mostra uma instrução segura no painel.

O formulário aceita imagens JPEG, PNG, WebP ou AVIF de até 8 MB. O arquivo vai para o Vercel Blob e a URL pública é salva no item do CMS.

## Publicação no Vercel

1. **Storage → Neon**: crie a base; a integração injeta `DATABASE_URL`.
2. **Storage → Blob**: crie a store; injeta `BLOB_READ_WRITE_TOKEN`.
3. **Settings → Environment Variables**: `AUTH_SECRET` (`openssl rand -base64 33`), `AUTH_GITHUB_ID`, `AUTH_GITHUB_SECRET`, `ADMIN_EMAILS`.
4. **GitHub → Developer settings → OAuth Apps**: novo app com callback `https://SEU-DOMINIO/api/auth/callback/github`.
5. Faça o deploy. Na primeira requisição as tabelas são criadas e semeadas.
6. Valide a URL publicada antes de apontar o DNS de `criacoes.gusgk.com.br`.

## Acessibilidade e desempenho

- `prefers-reduced-motion` desativa scroll suave, pin e movimentos contínuos.
- A camada de movimento é independente do styling: Lenis, os `pin`/`scrub` do ScrollTrigger e os contadores dependem apenas dos seletores `.metric-card`, `.metrics__grid`, `.metrics__marquee-inner`, `.story-step`, `.story__visual`, `.chapter__head`, `.chapter-block`, `.chapter__banner`, `.chapter__marquee-inner` e `.project-card`. Enquanto esses ganchos existirem no DOM, cor e layout podem mudar à vontade.
- O canvas é decorativo; todo o conteúdo relevante permanece no DOM.
- A resolução do canvas é limitada e ele pausa fora da viewport.
- Imagens de projetos carregam sob demanda.
- Links, botões e painel são navegáveis por teclado.

## Autor

Desenvolvido por Gustavo Giacoia Kumagai.
