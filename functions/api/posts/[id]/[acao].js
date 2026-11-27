// Publicar um rascunho (depois do OK da Dra. Paula pelo WhatsApp): pede um build novo do site.
import { idValido, criarSlug, hojeBrasilia, json } from '../../../../painel/servidor.js';
import { buscarPost, registrar, atualizarSite } from '../../../../painel/banco.js';

export async function onRequestPost(ctx) {
  const { params, env, data } = ctx;
  if (params.acao !== 'aprovar' || !idValido(params.id)) return json({ erro: 'Ação inválida.' }, 404);
  const post = await buscarPost(env.BANCO, params.id);
  if (!post || post.status === 'excluida') return json({ erro: 'Postagem não encontrada.' }, 404);
  if (post.status === 'aprovada') return json({ erro: 'Esta notícia já está publicada.' }, 409);

  const usados = (await env.BANCO.prepare('SELECT slug FROM postagens WHERE slug IS NOT NULL').all()).results.map((r) => r.slug);
  const slug = criarSlug(post.titulo, usados);
  await env.BANCO.prepare("UPDATE postagens SET status = 'aprovada', decidida = ?, decidida_por = ?, motivo = NULL, data = ?, slug = ? WHERE id = ?")
    .bind(new Date().toISOString(), data.usuario, hojeBrasilia(), slug, post.id).run();
  await registrar(ctx, 'aprovou', { post, detalhe: `/noticias/${slug}/` });
  atualizarSite(ctx, post);
  return json(await buscarPost(env.BANCO, post.id));
}
