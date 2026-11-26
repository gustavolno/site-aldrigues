// Painel de notícias: regras usadas pelas funções do Cloudflare (functions/api) e pelo build (scripts/baixar-painel.mjs).
// Sem dependências: só Web Crypto, que existe no Cloudflare e no Node. Testes: npm test.

/** Os dois logins. Quem é "aprovadora" decide o que vai para o site. */
export const USUARIOS = {
  marketing: { nome: 'Marketing', papel: 'autora' },
  paula: { nome: 'Dra. Paula', papel: 'aprovadora' },
};
export const CATEGORIAS = ['Previdenciário', 'Trabalhista', 'Saúde', 'Bancário', 'Consumidor', 'Penal', 'Atualidades'];
export const TIPOS_FOTO = { 'image/jpeg': 'jpg', 'image/png': 'png', 'image/webp': 'webp' };
export const MAX_FOTO = 1.5 * 1024 * 1024; // o D1 aceita até 2 MB por linha
const HORAS_SESSAO = 12;

const enc = new TextEncoder();
const b64url = (buf) => btoa(String.fromCharCode(...new Uint8Array(buf))).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');

async function assinar(segredo, texto) {
  const chave = await crypto.subtle.importKey('raw', enc.encode(segredo), { name: 'HMAC', hash: 'SHA-256' }, false, ['sign']);
  return b64url(await crypto.subtle.sign('HMAC', chave, enc.encode(texto)));
}

/** Compara sem vazar pelo tempo de resposta quantos caracteres batem. */
export function iguais(a, b) {
  const x = enc.encode(String(a)), y = enc.encode(String(b));
  let dif = x.length ^ y.length;
  for (let i = 0; i < Math.max(x.length, y.length); i++) dif |= (x[i] ?? 0) ^ (y[i] ?? 0);
  return dif === 0;
}

/** Confere usuário e senha contra os segredos SENHA_MARKETING e SENHA_PAULA do Cloudflare. */
export function senhaConfere(env, usuario, senha) {
  const certa = USUARIOS[usuario] && env[`SENHA_${String(usuario).toUpperCase()}`];
  // senha não configurada (ou curta demais) nunca abre o painel
  return typeof certa === 'string' && certa.length >= 12 && iguais(senha ?? '', certa);
}

/** Cookie de sessão: "usuario.validade.assinatura". Sem banco de sessões: a assinatura prova que fomos nós que emitimos. */
export async function criarSessao(usuario, segredo, agora = Date.now()) {
  const corpo = `${usuario}.${agora + HORAS_SESSAO * 3600e3}`;
  return `${corpo}.${await assinar(segredo, corpo)}`;
}
export async function lerSessao(valor, segredo, agora = Date.now()) {
  const [usuario, validade, assinatura, ...resto] = String(valor ?? '').split('.');
  if (resto.length || !USUARIOS[usuario] || !(Number(validade) > agora) || !assinatura) return null;
  return iguais(assinatura, await assinar(segredo, `${usuario}.${validade}`)) ? usuario : null;
}
export const lerCookie = (cabecalho, nome) =>
  (cabecalho ?? '').split(/;\s*/).map((p) => p.split('=')).find(([k]) => k === nome)?.slice(1).join('=') ?? null;
export const cookieSessao = (valor, maxAge = HORAS_SESSAO * 3600) =>
  `sessao=${valor}; Path=/; HttpOnly; Secure; SameSite=Strict; Max-Age=${maxAge}`;

/** Confere o formulário de nova notícia. Devolve { erro } ou { dados }. */
export function validarPost(form) {
  const titulo = String(form.get('titulo') ?? '').trim();
  const texto = String(form.get('texto') ?? '').replace(/\r\n/g, '\n').trim();
  const link = String(form.get('link') ?? '').trim();
  const categoria = String(form.get('categoria') ?? '').trim();
  const foto = form.get('foto');
  if (titulo.length < 5 || titulo.length > 160) return { erro: 'O título precisa ter entre 5 e 160 caracteres.' };
  if (texto.length < 20 || texto.length > 10000) return { erro: 'O texto precisa ter entre 20 e 10.000 caracteres.' };
  if (link && !/^https:\/\/(www\.)?instagram\.com\/(p|reel|tv)\/[\w-]+\/?(\?[\w=&%.-]*)?$/.test(link))
    return { erro: 'O link precisa ser de uma publicação do Instagram (https://www.instagram.com/p/...).' };
  if (categoria && !CATEGORIAS.includes(categoria)) return { erro: 'Categoria inválida.' };
  if (!foto || typeof foto === 'string' || !foto.size) return { erro: 'Escolha a foto da publicação.' };
  if (!TIPOS_FOTO[foto.type]) return { erro: 'A foto precisa ser JPG, PNG ou WebP.' };
  if (foto.size > MAX_FOTO) return { erro: 'A foto pode ter no máximo 1,5 MB. Use a imagem baixada do post do Instagram.' };
  return { dados: { titulo, texto, link, categoria, foto } };
}

/** Endereço da notícia a partir do título, sem repetir um que já existe. */
export function criarSlug(titulo, existentes = []) {
  const base = titulo.normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '').slice(0, 80).replace(/-$/, '') || 'noticia';
  let slug = base;
  for (let n = 2; existentes.includes(slug); n++) slug = `${base}-${n}`;
  return slug;
}

export const json = (dados, status = 200, cabecalhos = {}) =>
  new Response(JSON.stringify(dados), { status, headers: { 'Content-Type': 'application/json; charset=utf-8', ...cabecalhos } });
export const idValido = (id) => /^[0-9a-f-]{36}$/.test(String(id));
export const ehAprovadora = (usuario) => USUARIOS[usuario]?.papel === 'aprovadora';
/** Data de hoje em Brasília, no formato das notícias (2026-11-25). */
export const hojeBrasilia = () => new Date().toLocaleDateString('sv-SE', { timeZone: 'America/Sao_Paulo' });

const escapar = (s) => s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');

/** A notícia aprovada no mesmo formato dos .md de src/conteudo/noticias. O texto vira HTML escapado: nada do que se digita no painel vira código. */
export function paraMarkdown(post, imagem) {
  const paragrafos = post.texto.split(/\n{2,}/).map((p) => `<p>${escapar(p.trim()).replace(/\n/g, '<br>')}</p>`);
  const resumo = post.texto.replace(/[<>]/g, '').replace(/\s+/g, ' ').slice(0, 200);
  const linhas = [
    '---',
    `titulo: ${JSON.stringify(post.titulo)}`,
    `data: ${JSON.stringify(post.data)}`,
    `resumo: ${JSON.stringify(resumo)}`,
    `imagem: ${JSON.stringify(imagem)}`,
    ...(post.categoria ? [`categoria: ${JSON.stringify(post.categoria)}`] : []),
    'origem: "painel"',
    '---',
    ...paragrafos,
    ...(post.link ? [`<p><a href="${escapar(post.link)}" rel="noopener" target="_blank">Ver esta publicação no Instagram</a></p>`] : []),
  ];
  return linhas.join('\n') + '\n';
}
