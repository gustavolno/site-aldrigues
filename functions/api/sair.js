import { cookieSessao, json } from '../../painel/servidor.js';
import { registrar } from '../../painel/banco.js';

export async function onRequestPost(ctx) {
  await registrar(ctx, 'saiu');
  return json({ ok: true }, 200, { 'Set-Cookie': cookieSessao('', 0) });
}
