// Excluir uma postagem. Uma notícia já publicada só a Dra. Paula pode tirar do ar (e o site se atualiza).
// Nada some do banco: a postagem fica marcada como "excluida" e o registro guarda quem fez; só a foto é apagada.
import { idValido, ehAprovadora, json } from '../../../painel/servidor.js';
import { buscarPost, registrar, atualizarSite } from '../../../painel/banco.js';

export async function onRequestDelete(ctx) {
  const { params, env, data } = ctx;
  const post = idValido(params.id) && (await buscarPost(env.BANCO, params.id));
  if (!post || post.status === 'excluida') return json({ erro: 'Postagem não encontrada.' }, 404);
  if (post.status === 'aprovada' && !ehAprovadora(data.usuario)) return json({ erro: 'Só a Dra. Paula pode tirar do ar uma notícia publicada.' }, 403);

  await env.BANCO.batch([
    env.BANCO.prepare("UPDATE postagens SET status = 'excluida', excluida = ?, excluida_por = ? WHERE id = ?").bind(new Date().toISOString(), data.usuario, post.id),
    env.BANCO.prepare('DELETE FROM fotos WHERE id = ?').bind(post.id),
  ]);
  const publicada = post.status === 'aprovada';
  await registrar(ctx, publicada ? 'tirou_do_site' : 'excluiu', { post, detalhe: `estava ${post.status}` });
  if (publicada) atualizarSite(ctx, post);
  return json({ ok: true });
}
