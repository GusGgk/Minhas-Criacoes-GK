# Minhas Criações GK

Arquivo criativo de Gustavo Giacoia Kumagai: sete frentes de trabalho e de vida, cada uma com as fotos e os registros que deixou. A versão 2 separa interface, conteúdo, animações, persistência e painel administrativo — o antigo `index.html` autocontido de aproximadamente 15 MB não faz mais parte da aplicação.

## O que existe agora

- Home bilíngue em React/Vinext, com conteúdo renderizado no servidor.
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
- Upload de imagens para R2; registros e ordem em D1.
- Login do painel via ChatGPT, com autorização adicional por `ADMIN_EMAILS`.
- Favicon GK em múltiplos tamanhos, Open Graph, Twitter Card, manifest, robots e sitemap.
- Fallback local com todo o conteúdo original caso a base ainda não esteja disponível.
- Arquivo aberto no final: mostra apenas o que o CMS tem e nenhum capítulo já conta.

## Estrutura

```text
app/
  admin/                 painel administrativo
  api/                   conteúdo público, CRUD e mídia
  layout.tsx             metadados globais
  page.tsx               home renderizada no servidor
components/
  admin/                 editor do CMS
  motion/                canvas do hero, constelação do vault, Lenis e reveals
  site/                  seções da experiência
db/
  bootstrap.ts           inicialização e seed idempotente
  schema.ts              schema D1/Drizzle
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
npm run dev
```

O endereço local é mostrado no terminal. O ambiente de desenvolvimento do Sites fornece uma conta local para testar `/admin`.

Comandos úteis:

```bash
npm run typecheck
npm run lint
npm run build
npm run db:generate
npm run assets:favicon
```

## Conteúdo e painel

A narrativa dos sete capítulos mora em `lib/content/chapters.ts`, versionada junto com o código: é a parte pessoal do site, com as fotos, as legendas e o texto de cada fase. Cada capítulo declara em `coveredSlugs` os projetos que já conta por inteiro.

O painel serve para o que vem depois. Na primeira execução com D1 vazio, os oito projetos atuais são inseridos automaticamente. A seção final da home lista só os itens do CMS que nenhum capítulo cobre — enquanto não houver nenhum, ela mostra o espaço reservado para a próxima ideia. O frontend mantém um fallback equivalente, por isso a página continua útil mesmo antes da base ser conectada.

Em produção, configure pelo menos uma destas opções:

```env
ADMIN_EMAILS=seu-email@exemplo.com
ADMIN_USER_IDS=id-estavel-da-conta-no-site
```

Use vírgulas para liberar mais de uma conta. Na publicação pelo Sites, o ID do proprietário pode ser configurado sem expor o e-mail. Sem uma lista, a versão de produção bloqueia todas as escritas e mostra uma instrução segura no painel.

O formulário aceita imagens JPEG, PNG, WebP ou AVIF de até 8 MB. O arquivo vai para R2 e o caminho publicado é salvo no item do CMS.

## Publicação e domínio

O projeto está preparado para Sites com D1 e R2 declarados em `.openai/hosting.json`. O domínio `criacoes.gusgk.com.br` não deve ser apontado para a nova versão antes de a URL publicada ser validada. Enquanto isso, a versão já ligada à Vercel pode continuar no ar sem alteração de DNS.

## Acessibilidade e desempenho

- `prefers-reduced-motion` desativa scroll suave, pin e movimentos contínuos.
- A camada de movimento é independente do styling: Lenis, os `pin`/`scrub` do ScrollTrigger e os contadores dependem apenas dos seletores `.metric-card`, `.metrics__grid`, `.metrics__marquee-inner`, `.story-step`, `.story__visual`, `.chapter__head`, `.chapter-block`, `.chapter__banner`, `.chapter__marquee-inner` e `.project-card`. Enquanto esses ganchos existirem no DOM, cor e layout podem mudar à vontade.
- O canvas é decorativo; todo o conteúdo relevante permanece no DOM.
- A resolução do canvas é limitada e ele pausa fora da viewport.
- Imagens de projetos carregam sob demanda.
- Links, botões e painel são navegáveis por teclado.

## Autor

Desenvolvido por Gustavo Giacoia Kumagai.
