// Lista as postagens (quem entrou) e recebe uma nova, que sempre começa aguardando aprovação.
import { validarPost, json } from '../../../painel/servidor.js';
import { listarPosts, registrar } from '../../../painel/banco.js';

export const onRequestGet = async ({ env }) => json(await listarPosts(env.BANCO));

export async function onRequestPost(ctx) {
  const { request, env, data } = ctx;
  const form = await request.formData().catch(() => null);
  if (!form) return json({ erro: 'Formulário inválido.' }, 400);
  const { erro, dados } = validarPost(form);
  if (erro) return json({ erro }, 400);

  const { foto, titulo, texto, link, categoria } = dados;
  const post = { id: crypto.randomUUID(), titulo, texto, link, categoria, tipoFoto: foto.type, autor: data.usuario, status: 'pendente', criada: new Date().toISOString() };
  await env.BANCO.batch([
    env.BANCO.prepare('INSERT INTO postagens (id, titulo, texto, link, categoria, tipo_foto, autor, status, criada) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)')
      .bind(post.id, titulo, texto, link || null, categoria || null, foto.type, post.autor, post.status, post.criada),
    env.BANCO.prepare('INSERT INTO fotos (id, tipo, dados) VALUES (?, ?, ?)').bind(post.id, foto.type, await foto.arrayBuffer()),
  ]);
  await registrar(ctx, 'enviou', { post });
  return json(post, 201);
}
