// Banco do painel: Cloudflare D1 (SQLite), ligado ao projeto com o nome BANCO. Guarda postagens, fotos e o registro de tudo
// o que se faz no painel. Para abrir no DBeaver: npm run banco (baixa uma cópia .sqlite; veja o README).

const ESQUEMA = [
  `CREATE TABLE IF NOT EXISTS postagens (
    id TEXT PRIMARY KEY,
    titulo TEXT NOT NULL,
    texto TEXT NOT NULL,
    link TEXT,
    categoria TEXT,
    tipo_foto TEXT NOT NULL,
    autor TEXT NOT NULL,
    status TEXT NOT NULL CHECK (status IN ('pendente', 'aprovada', 'recusada', 'excluida')),
    criada TEXT NOT NULL,
    decidida TEXT,
    decidida_por TEXT,
    motivo TEXT,
    data TEXT,
    slug TEXT UNIQUE,
    excluida TEXT,
    excluida_por TEXT
  )`,
  // a foto fica separada para a lista de postagens não carregar os bytes
  `CREATE TABLE IF NOT EXISTS fotos (id TEXT PRIMARY KEY, tipo TEXT NOT NULL, dados BLOB NOT NULL)`,
  // registro: uma linha por ação, nunca apagada pelo painel
  `CREATE TABLE IF NOT EXISTS registro (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    quando TEXT NOT NULL,
    usuario TEXT,
    acao TEXT NOT NULL,
    postagem_id TEXT,
    titulo TEXT,
    detalhe TEXT,
    ip TEXT,
    navegador TEXT
  )`,
  'CREATE INDEX IF NOT EXISTS registro_quando ON registro (quando)',
  // para o DBeaver: o registro no horário de Brasília (o banco grava em UTC; o Brasil não tem mais horário de verão)
  `CREATE VIEW IF NOT EXISTS v_registro AS
    SELECT id, datetime(quando, '-3 hours') AS quando_brasilia, usuario, acao, titulo, detalhe, ip, navegador, postagem_id
    FROM registro ORDER BY id DESC`,
];

let pronto = null;
/** Cria as tabelas na primeira chamada de cada instância (não faz nada se já existem). */
export function prepararBanco(db) {
  pronto ??= db.batch(ESQUEMA.map((s) => db.prepare(s))).catch((e) => { pronto = null; throw e; });
  return pronto;
}

const CAMPOS = `id, titulo, texto, link, categoria, tipo_foto AS tipoFoto, autor, status, criada, decidida,
  decidida_por AS decididaPor, motivo, data, slug`;

export const buscarPost = (db, id) => db.prepare(`SELECT ${CAMPOS} FROM postagens WHERE id = ?`).bind(id).first();

export async function listarPosts(db, status) {
  const sql = status
    ? db.prepare(`SELECT ${CAMPOS} FROM postagens WHERE status = ? ORDER BY criada DESC`).bind(status)
    : db.prepare(`SELECT ${CAMPOS} FROM postagens WHERE status <> 'excluida' ORDER BY criada DESC`);
  return (await sql.all()).results;
}

/** Anota uma ação no registro, com quem fez, de onde (IP) e por qual navegador. */
export function registrar(ctx, acao, { usuario = ctx.data?.usuario, post = null, detalhe = '' } = {}) {
  const h = ctx.request.headers;
  return ctx.env.BANCO.prepare(
    'INSERT INTO registro (quando, usuario, acao, postagem_id, titulo, detalhe, ip, navegador) VALUES (?, ?, ?, ?, ?, ?, ?, ?)',
  ).bind(new Date().toISOString(), usuario ?? null, acao, post?.id ?? null, post?.titulo ?? null, String(detalhe).slice(0, 1000),
    h.get('CF-Connecting-IP'), (h.get('User-Agent') ?? '').slice(0, 300)).run();
}

/** Pede ao Cloudflare Pages um build novo (segredo DEPLOY_HOOK) e anota no registro se o pedido foi aceito. */
export function atualizarSite(ctx, post) {
  if (!ctx.env.DEPLOY_HOOK) return;
  ctx.waitUntil(fetch(ctx.env.DEPLOY_HOOK, { method: 'POST' })
    .then((r) => `Cloudflare respondeu ${r.status}`, (e) => `falhou: ${e.message}`)
    .then((detalhe) => registrar(ctx, 'pedir_atualizacao_do_site', { post, detalhe })));
}
