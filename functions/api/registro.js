// Histórico de tudo o que se fez no painel (quem, quando, o quê, de onde). Aparece no painel;
// a cópia completa para o DBeaver sai com npm run banco.
import { json } from '../../painel/servidor.js';

export async function onRequestGet({ env }) {
  const { results } = await env.BANCO.prepare(
    'SELECT quando, usuario, acao, titulo, detalhe, ip FROM registro ORDER BY id DESC LIMIT 300').all();
  return json(results);
}
