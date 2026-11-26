// Pública: as notícias aprovadas, lidas pelo build do site (scripts/baixar-painel.mjs). Só o que já está no site.
import { json } from '../../painel/servidor.js';
import { listarPosts } from '../../painel/banco.js';

export async function onRequestGet({ env }) {
  const aprovadas = await listarPosts(env.BANCO, 'aprovada');
  return json(aprovadas.map(({ id, slug, titulo, texto, link, categoria, data, tipoFoto }) => ({ id, slug, titulo, texto, link, categoria, data, tipoFoto })));
}
