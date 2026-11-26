// Histórico de tudo o que se fez no painel (quem, quando, o quê, de onde). Só a Dra. Paula vê pelo painel;
// a cópia completa para o DBeaver sai com npm run banco.
import { ehAprovadora, json } from '../../painel/servidor.js';

export async function onRequestGet({ env, data }) {
  if (!ehAprovadora(data.usuario)) return json({ erro: 'Só a Dra. Paula vê o histórico.' }, 403);
  const { results } = await env.BANCO.prepare(
    'SELECT quando, usuario, acao, titulo, detalhe, ip FROM registro ORDER BY id DESC LIMIT 300').all();
  return json(results);
}
