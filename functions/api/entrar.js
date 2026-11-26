import { USUARIOS, senhaConfere, criarSessao, cookieSessao, json } from '../../painel/servidor.js';
import { registrar } from '../../painel/banco.js';

export async function onRequestPost(ctx) {
  const { usuario, senha } = await ctx.request.json().catch(() => ({}));
  const quem = USUARIOS[usuario] ? usuario : null;
  if (!senhaConfere(ctx.env, usuario, senha)) {
    await registrar(ctx, 'entrada_recusada', { usuario: quem, detalhe: quem ? 'senha errada' : `usuário inexistente: ${String(usuario).slice(0, 40)}` });
    // shortcut: só atrasa as tentativas erradas, sem bloqueio por IP. Se aparecer ataque, ligar o Rate Limiting do Cloudflare em /api/entrar.
    await new Promise((r) => setTimeout(r, 1000));
    return json({ erro: 'Usuário ou senha incorretos.' }, 401);
  }
  await registrar(ctx, 'entrou', { usuario });
  return json({ usuario, ...USUARIOS[usuario] }, 200, { 'Set-Cookie': cookieSessao(await criarSessao(usuario, ctx.env.SEGREDO_SESSAO)) });
}
