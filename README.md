# Minhas Criações GK

Portfólio pessoal de Gustavo Giacoia Kumagai que reúne projetos, criações e experiências para além do desenvolvimento de software.

O site apresenta trabalhos de conteúdo e mídia, identidade visual, sistemas de estudo, esporte, voluntariado, registros acadêmicos e projetos pessoais. A interface também oferece conteúdo em português e inglês.

## Tecnologias

- HTML5
- CSS3
- JavaScript

O projeto é uma página estática e autocontida: os recursos necessários para exibição estão empacotados no próprio arquivo `index.html`. Não há etapa de instalação ou build.

## Executar localmente

Você pode abrir o arquivo `index.html` diretamente no navegador. Para reproduzir um ambiente semelhante ao de produção, use um servidor HTTP local.

Com Python:

```bash
python -m http.server 8000
```

Depois, acesse `http://localhost:8000`.

## Deploy na Vercel

1. Importe este repositório na Vercel.
2. Em **Framework Preset**, selecione **Other**.
3. Não defina comandos de build ou diretório de saída.
4. Inicie o deploy.

A página principal precisa se chamar `index.html` e permanecer na raiz do repositório. Assim, a Vercel consegue servi-la automaticamente na rota `/`.

## Estrutura

```text
.
├── index.html  # Aplicação completa
└── README.md   # Documentação do projeto
```

## Autor

Desenvolvido por Gustavo Giacoia Kumagai.
