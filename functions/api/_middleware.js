// Porta de entrada de toda a API do painel (/api/*): prepara o banco, lê a sessão e barra quem não entrou.
import { lerCookie, lerSessao, json } from '../../painel/servidor.js';
import { prepararBanco } from '../../painel/banco.js';

const PUBLICAS = ['/api/entrar', '/api/publicadas']; // /api/foto/* decide sozinha (foto de notícia aprovada é pública)

export async function onRequest(ctx) {
  const { request, env, data } = ctx;
  if (!env.BANCO || !(env.SEGREDO_SESSAO?.length >= 32)) return json({ erro: 'Painel não configurado no Cloudflare (veja o README).' }, 500);
  await prepararBanco(env.BANCO);

  const caminho = new URL(request.url).pathname.replace(/\/$/, '');
  data.usuario = await lerSessao(lerCookie(request.headers.get('Cookie'), 'sessao'), env.SEGREDO_SESSAO);

  // além do cookie SameSite=Strict: toda alteração tem de vir do próprio painel, que manda este cabeçalho
  if (request.method !== 'GET' && request.headers.get('X-Painel') !== '1') return json({ erro: 'Requisição recusada.' }, 403);
  if (!data.usuario && !PUBLICAS.includes(caminho) && !caminho.startsWith('/api/foto/')) return json({ erro: 'Entre de novo no painel.' }, 401);

  const resposta = await ctx.next();
  const final = new Response(resposta.body, resposta);
  final.headers.set('Cache-Control', 'no-store');
  return final;
}
