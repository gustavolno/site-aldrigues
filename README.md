# Site da Aldrigues Cândido Advocacia

Site novo, em código, para substituir o WordPress de aldriguescandido.adv.br. Separado da Central.
Feito com [Astro](https://astro.build): gera páginas HTML prontas (pasta `dist/`), sem banco de dados e sem painel, então quase não tem o que invadir.

## Rodar no computador

```
npm install
npm run dev        # abre em http://localhost:4321 e atualiza sozinho ao salvar
npm run build      # gera a pasta dist/ (o que vai para a hospedagem)
```

## Onde mexer

| O quê | Onde |
|---|---|
| Telefone, WhatsApp, e-mail, endereços, horário | `src/config.ts` |
| Os botões "Do que você precisa?" e os grupos de áreas | `src/config.ts` (`PEDIDOS`, `GRUPOS`) |
| A frase de cada card de área | `src/config.ts` (`RESUMO_AREA`) |
| Categoria de uma notícia (deduzida do título) | linha `categoria: "..."` no .md, ou `CATEGORIAS` em `src/conteudo.ts` |
| Texto de uma área (ex.: Trabalhista) | `src/conteudo/paginas/trabalhista.md` |
| Notícia nova | criar `src/conteudo/noticias/<endereco-da-noticia>.md` copiando uma existente |
| Cores e letras | `src/styles/global.css` (topo do arquivo) |
| Topo, menu e rodapé | `src/layouts/Base.astro` |

## Painel de notícias (`/painel/`)

O Marketing envia as publicações do Instagram (foto, título, texto e link); só a Dra. Paula aprova. Ao aprovar, o
Cloudflare refaz o site sozinho e a notícia aparece em `/noticias/` em poucos minutos, como as outras.

| Peça | Onde |
|---|---|
| Tela do painel | `src/pages/painel.astro` |
| API (login, envio, aprovação) | `functions/api/` (Cloudflare Pages Functions) |
| Regras: senhas, sessão, validação, formato da notícia | `painel/servidor.js` (testes: `npm test`) |
| Banco: tabelas, registro de ações | `painel/banco.js` (as tabelas se criam sozinhas no primeiro acesso) |
| Traz as aprovadas para o site antes de cada build | `scripts/baixar-painel.mjs` (gera `src/conteudo/noticias-painel/`, fora do git) |
| Cópia do banco para o DBeaver | `npm run banco` → `banco/painel-noticias.sqlite` (fora do git) |

O banco é um **D1 do Cloudflare** (SQLite na nuvem, não depende de nenhum PC do escritório): tabelas `postagens`, `fotos` e
`registro`. O registro guarda cada ação (entrou, senha errada, enviou, aprovou, recusou, excluiu, tirou do site, atualização
do site), com quem, quando, IP e navegador, e o painel nunca apaga essas linhas. Uma postagem excluída continua no banco
marcada como `excluida`; só a foto é apagada. A Dra. Paula vê as últimas 300 ações na aba **Histórico** do painel.
As senhas são segredos do Cloudflare, nunca ficam no código.
O painel só funciona publicado no Cloudflare (no `npm run dev` a tela abre, mas não há API).

### Abrir o banco no DBeaver

1. Na primeira vez em cada computador (também no notebook novo): instalar o Node.js e rodar `npx wrangler login`, que abre o
   navegador para entrar na conta Cloudflare do escritório.
2. `npm run banco` baixa a cópia atual para `banco/painel-noticias.sqlite`. É uma foto do momento: rode de novo para atualizar.
3. No DBeaver: **Nova conexão → SQLite →** escolher esse arquivo. A visão `v_registro` mostra o registro no horário de Brasília
   (a tabela `registro` grava em UTC, 3 horas à frente).

Trocar de computador não exige migrar nada: o banco fica no Cloudflare.

### Configurar uma vez, no projeto do Cloudflare Pages

1. **Workers e Pages → D1 → Criar banco** com o nome `painel-noticias` (o `npm run banco` procura esse nome).
   No projeto: **Configurações → Vinculações → Banco D1**, nome da variável `BANCO`.
2. **Configurações → Variáveis e segredos**, tipo *Segredo*:
   - `SENHA_MARKETING` e `SENHA_PAULA`: senhas fortes, com pelo menos 12 caracteres (com menos, o login não abre).
   - `SEGREDO_SESSAO`: texto aleatório com pelo menos 32 caracteres. Para gerar: `node -e "console.log(crypto.randomUUID()+crypto.randomUUID())"`.
3. **Configurações → Build → Deploy hooks → Adicionar**. Copie o endereço gerado para o segredo `DEPLOY_HOOK`.
4. Faça um deploy. Depois crie a variável comum `PAINEL_URL` = endereço do site (ex.: `https://www.aldriguescandido.adv.br`)
   e faça outro deploy. A partir daí cada build traz as notícias aprovadas. Antes disso, o build falharia procurando um painel que ainda não existe.
5. Recomendado: **Segurança → Regras de limitação de taxa** em `/api/entrar` (o painel só atrasa as tentativas de senha erradas).

Use os itens 1 a 3 só no ambiente de *Produção*, para as prévias de teste não mexerem nas notícias reais.

- **Trocar uma senha:** mude o segredo e faça um deploy. Para tirar todo mundo do painel na hora, troque também o `SEGREDO_SESSAO`.
- **Se o painel estiver fora do ar no momento do build**, o build falha de propósito, para não publicar o site sem as notícias já aprovadas.

## Endereços antigos

`public/_redirects` manda cada endereço do WordPress para o novo (ex.: `/direito-penal-novo/` → `/direito-penal/`,
`/2020/03/06/noticia/` → `/noticias/noticia/`), para o Google não perder as páginas. Formato do Cloudflare Pages.

O conteúdo veio do site público com `scripts/extrair_wordpress.py` (migração de uma vez só, 25/11/2026; não precisa rodar de novo).

## Atualização pelo Anuário 2024/2025 (25/11/2026)

O PDF `Livro Escritorio Aldrigues Cândido - versão nova` trouxe: contatos e endereços (sede em Taguatinga e filial em Vila Velha;
a filial da Asa Sul saiu porque o anuário não a cita), o currículo da Dra. Wanessa (página `equipe.md`), o texto do escritório e
26 áreas novas (arquivos .md com `fonte: "Anuário 2024/2025 do escritório"`). As áreas que já existiam tinham o mesmo texto do anuário.
O vídeo de fundo da página inicial é `public/video/abertura.mp4` (comprimido do vídeo original, sem som); o pôster é `abertura.jpg`.

## Antes de publicar (confirmar com a Bruna)

- Qual celular atende o WhatsApp: o anuário traz (61) 99616-9232 e (61) 99301-9232 (`src/config.ts`).
- O anuário diz "fundado em 2005" numa página e "fundado em 2006" no currículo: o site evita citar o ano e diz "mais de 20 anos".
- Telefones da filial do ES: o anuário não traz; ficaram os do site antigo.
- As frases curtas dos cards de área (`RESUMO_AREA`) são texto novo: a Bruna precisa revisar.
- Equipe: o anuário só traz a fundadora; a lista do resto da equipe em `equipe.md` continua a do site antigo.
- Calculadora de fator previdenciário: refazer (hoje a página manda falar pelo WhatsApp).
- Formulário de contato com aviso por e-mail/WhatsApp: a fazer.
- PDFs antigos linkados em notícias (sentenças, tabela do FGTS) não foram trazidos: conferir se podem ser publicados (dados pessoais).

## Publicar (quando for a hora)

1. Endereço de teste: Cloudflare Pages ligado a este repositório, com a variável `TESTE=1` (o site sai com `noindex`, fora do Google).
2. Aprovado: tirar `TESTE`, apontar no DNS só os registros do site (`@` e `www`). **Não mexer nos registros de e-mail (MX, SPF, DKIM).**
