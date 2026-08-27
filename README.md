# Minhas Criações GK

Arquivo criativo de Gustavo Giacoia Kumagai. A versão 2 separa interface, conteúdo, animações, persistência e painel administrativo — o antigo `index.html` autocontido de aproximadamente 15 MB não faz mais parte da aplicação.

## O que existe agora

- Home bilíngue em React/Vinext, com conteúdo renderizado no servidor.
- Wireframe procedural em Canvas 2D, sensível ao cursor e ao scroll.
- Scroll suave com Lenis e narrativa com GSAP ScrollTrigger (`pin: true` no desktop).
- Transições dark/light, métricas animadas, cards com parallax e tipografia cinética.
- CMS próprio em `/admin` para criar, editar, destacar, ocultar, reordenar e excluir projetos.
- Upload de imagens para R2; registros e ordem em D1.
- Login do painel via ChatGPT, com autorização adicional por `ADMIN_EMAILS`.
- Favicon GK em múltiplos tamanhos, Open Graph, Twitter Card, manifest, robots e sitemap.
- Fallback local com todo o conteúdo original caso a base ainda não esteja disponível.

## Estrutura

```text
app/
  admin/                 painel administrativo
  api/                   conteúdo público, CRUD e mídia
  layout.tsx             metadados globais
  page.tsx               home renderizada no servidor
components/
  admin/                 editor do CMS
  motion/                canvas, Lenis e reveals
  site/                  seções da experiência
db/
  bootstrap.ts           inicialização e seed idempotente
  schema.ts              schema D1/Drizzle
drizzle/                 migrations versionadas
lib/
  auth/                  autorização do painel
  content/               tipos, fallback, validação e repositório
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

Na primeira execução com D1 vazio, os oito projetos atuais são inseridos automaticamente. O frontend mantém um fallback equivalente, por isso a página continua útil mesmo antes da base ser conectada.

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
- O canvas é decorativo; todo o conteúdo relevante permanece no DOM.
- A resolução do canvas é limitada e ele pausa fora da viewport.
- Imagens de projetos carregam sob demanda.
- Links, botões e painel são navegáveis por teclado.

## Autor

Desenvolvido por Gustavo Giacoia Kumagai.
