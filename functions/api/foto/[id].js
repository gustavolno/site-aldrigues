// Foto de uma postagem: pública se a notícia foi aprovada; antes disso, só para quem entrou no painel.
import { idValido, json } from '../../../painel/servidor.js';

export async function onRequestGet({ params, env, data }) {
  const id = String(params.id).replace(/\.\w+$/, '');
  const foto = idValido(id) && (await env.BANCO.prepare(
    "SELECT f.tipo, f.dados, p.status FROM fotos f JOIN postagens p ON p.id = f.id WHERE f.id = ?").bind(id).first());
  if (!foto || (foto.status !== 'aprovada' && !data.usuario)) return json({ erro: 'Foto não encontrada.' }, 404);
  // o D1 entrega BLOB como lista de números
  return new Response(new Uint8Array(foto.dados), { headers: { 'Content-Type': foto.tipo, 'X-Content-Type-Options': 'nosniff' } });
}
