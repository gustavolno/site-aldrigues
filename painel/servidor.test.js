// npm test
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { senhaConfere, criarSessao, lerSessao, lerCookie, validarPost, criarSlug, paraMarkdown } from './servidor.js';

const SEGREDO = 'segredo-de-teste-com-mais-de-32-caracteres';

test('senha: confere só a certa, e nunca com senha não configurada ou curta', () => {
  const env = { SENHA_MARKETING: 'senha-forte-123', SENHA_PAULA: 'curta' };
  assert.equal(senhaConfere(env, 'marketing', 'senha-forte-123'), true);
  assert.equal(senhaConfere(env, 'marketing', 'senha-forte-12'), false);
  assert.equal(senhaConfere(env, 'paula', 'curta'), false);
  assert.equal(senhaConfere({}, 'paula', ''), false);
  assert.equal(senhaConfere(env, 'admin', 'senha-forte-123'), false);
});

test('sessão: válida, vencida, adulterada e de outro usuário', async () => {
  const s = await criarSessao('marketing', SEGREDO, 1000);
  assert.equal(await lerSessao(s, SEGREDO, 2000), 'marketing');
  assert.equal(await lerSessao(s, SEGREDO, 1000 + 13 * 3600e3), null);
  assert.equal(await lerSessao(s, 'outro-segredo-com-mais-de-32-caracteres', 2000), null);
  assert.equal(await lerSessao(s.replace('marketing', 'paula'), SEGREDO, 2000), null);
  assert.equal(await lerSessao(s + '.x', SEGREDO, 2000), null);
  assert.equal(await lerSessao(null, SEGREDO), null);
});

test('cookie', () => {
  assert.equal(lerCookie('a=1; sessao=abc.def=; b=2', 'sessao'), 'abc.def=');
  assert.equal(lerCookie('', 'sessao'), null);
});

const form = (o) => { const f = new FormData(); for (const [k, v] of Object.entries(o)) f.set(k, v); return f; };
const foto = (tipo = 'image/jpeg', bytes = 10) => new File([new Uint8Array(bytes)], 'f', { type: tipo });
const ok = { titulo: 'Novo prazo do INSS', texto: 'Texto da publicação com mais de vinte letras.', link: 'https://www.instagram.com/p/AbC_12-x/', foto: foto() };

test('validação do formulário', () => {
  assert.ok(validarPost(form(ok)).dados);
  assert.ok(validarPost(form({ ...ok, link: '' })).dados, 'link é opcional');
  assert.match(validarPost(form({ ...ok, titulo: 'Oi' })).erro, /título/);
  assert.match(validarPost(form({ ...ok, link: 'https://evil.com/p/x' })).erro, /Instagram/);
  assert.match(validarPost(form({ ...ok, link: 'javascript:alert(1)' })).erro, /Instagram/);
  assert.match(validarPost(form({ ...ok, foto: foto('image/svg+xml') })).erro, /JPG/);
  assert.match(validarPost(form({ ...ok, foto: foto('image/png', 2 * 1024 * 1024) })).erro, /1,5 MB/);
  assert.match(validarPost(form({ ...ok, categoria: 'Outra' })).erro, /Categoria/);
});

test('slug sem acento e sem repetir', () => {
  assert.equal(criarSlug('Revisão da Vida Toda: o que muda?'), 'revisao-da-vida-toda-o-que-muda');
  assert.equal(criarSlug('Limbo', ['limbo', 'limbo-2']), 'limbo-3');
  assert.equal(criarSlug('!!!'), 'noticia');
});

test('markdown: texto escapado, parágrafos e frontmatter', () => {
  const md = paraMarkdown({ titulo: 'Título "com" aspas', data: '2026-11-25', texto: 'Um <script>x</script>\nlinha\n\nDois', link: ok.link, categoria: 'Trabalhista' }, '/img/painel/a.jpg');
  assert.match(md, /^titulo: "Título \\"com\\" aspas"$/m);
  assert.match(md, /<p>Um &lt;script&gt;x&lt;\/script&gt;<br>linha<\/p>\n<p>Dois<\/p>/);
  assert.match(md, /categoria: "Trabalhista"/);
  assert.match(md, /Ver esta publicação no Instagram/);
  assert.doesNotMatch(md, /<script>/);
});
