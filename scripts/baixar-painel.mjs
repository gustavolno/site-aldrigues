// Roda sozinho antes de cada build (npm run build): traz do painel as notícias publicadas, com as fotos,
// e grava como .md em src/conteudo/noticias-painel. A partir daí viram páginas como as outras notícias.
// Só age com PAINEL_URL definido (no Cloudflare Pages: o endereço do próprio site). Sem ele, o build usa só os .md do projeto.
import fs from 'node:fs';
import { paraMarkdown, TIPOS_FOTO } from '../painel/servidor.js';

const PASTA_MD = 'src/conteudo/noticias-painel';
const PASTA_IMG = 'public/img/painel';
const base = process.env.PAINEL_URL;

for (const p of [PASTA_MD, PASTA_IMG]) { fs.rmSync(p, { recursive: true, force: true }); fs.mkdirSync(p, { recursive: true }); }
if (!base) { console.log('[painel] PAINEL_URL não definido: build sem as notícias do painel.'); process.exit(0); }

// Se o painel não responder, o build falha de propósito: publicar sem elas tiraria do ar o que já foi aprovado.
const resposta = await fetch(new URL('/api/publicadas', base));
if (!resposta.ok) throw new Error(`[painel] ${base}/api/publicadas respondeu ${resposta.status}`);
const posts = await resposta.json();

const usados = fs.readdirSync('src/conteudo/noticias').map((f) => f.replace(/\.md$/, ''));
for (const post of posts) {
  let slug = post.slug;
  for (let n = 2; usados.includes(slug); n++) slug = `${post.slug}-${n}`; // não sobrescreve notícia antiga com o mesmo endereço
  usados.push(slug);

  const foto = await fetch(new URL(`/api/foto/${post.id}`, base));
  if (!foto.ok) throw new Error(`[painel] foto de "${post.titulo}" respondeu ${foto.status}`);
  const arquivo = `${post.id}.${TIPOS_FOTO[post.tipoFoto] ?? 'jpg'}`;
  fs.writeFileSync(`${PASTA_IMG}/${arquivo}`, Buffer.from(await foto.arrayBuffer()));
  fs.writeFileSync(`${PASTA_MD}/${slug}.md`, paraMarkdown(post, `/img/painel/${arquivo}`));
}
console.log(`[painel] ${posts.length} notícia(s) aprovada(s) trazida(s).`);
