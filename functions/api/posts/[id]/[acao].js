// Aprovar ou recusar: só a Dra. Paula. Aprovar publica (pede um build novo do site).
import { idValido, ehAprovadora, criarSlug, hojeBrasilia, json } from '../../../../painel/servidor.js';
import { buscarPost, registrar, atualizarSite } from '../../../../painel/banco.js';

export async function onRequestPost(ctx) {
  const { params, env, data, request } = ctx;
  if (!ehAprovadora(data.usuario)) return json({ erro: 'Só a Dra. Paula pode aprovar ou recusar.' }, 403);
  if (!['aprovar', 'recusar'].includes(params.acao) || !idValido(params.id)) return json({ erro: 'Ação inválida.' }, 404);
  const post = await buscarPost(env.BANCO, params.id);
  if (!post || post.status === 'excluida') return json({ erro: 'Postagem não encontrada.' }, 404);
  if (post.status === 'aprovada') return json({ erro: 'Esta notícia já está publicada.' }, 409);

  const agora = new Date().toISOString();
  if (params.acao === 'recusar') {
    const { motivo } = await request.json().catch(() => ({}));
    const texto = String(motivo ?? '').trim().slice(0, 500);
    await env.BANCO.prepare("UPDATE postagens SET status = 'recusada', decidida = ?, decidida_por = ?, motivo = ? WHERE id = ?")
      .bind(agora, data.usuario, texto, post.id).run();
    await registrar(ctx, 'recusou', { post, detalhe: texto });
  } else {
    const usados = (await env.BANCO.prepare('SELECT slug FROM postagens WHERE slug IS NOT NULL').all()).results.map((r) => r.slug);
    const slug = criarSlug(post.titulo, usados);
    await env.BANCO.prepare("UPDATE postagens SET status = 'aprovada', decidida = ?, decidida_por = ?, motivo = NULL, data = ?, slug = ? WHERE id = ?")
      .bind(agora, data.usuario, hojeBrasilia(), slug, post.id).run();
    await registrar(ctx, 'aprovou', { post, detalhe: `/noticias/${slug}/` });
    atualizarSite(ctx, post);
  }
  return json(await buscarPost(env.BANCO, post.id));
}
