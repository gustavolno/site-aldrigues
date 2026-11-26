// Mapa do site para o Google (sem dependência extra): todas as páginas geradas.
import type { APIRoute } from 'astro';
import { paginas, noticias } from '../conteudo';

const fora = ['contato', 'cartao-escritorio', 'consultoria-aldrigues-candido-advocacia'];
export const GET: APIRoute = ({ site }) => {
  const caminhos = ['/', '/areas-de-atuacao/', '/noticias/', '/contato/',
    ...paginas.filter((p) => !fora.includes(p.slug)).map((p) => `/${p.slug}/`),
    ...noticias.map((n) => `/noticias/${n.slug}/`)];
  const xml = `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${caminhos
    .map((c) => `  <url><loc>${new URL(c, site)}</loc></url>`).join('\n')}\n</urlset>\n`;
  return new Response(xml, { headers: { 'Content-Type': 'application/xml' } });
};
