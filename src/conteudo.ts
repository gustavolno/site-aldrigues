// Conteúdo em Markdown (migrado do WordPress por scripts/extrair_wordpress.py). Uma notícia nova = um arquivo .md em src/conteudo/noticias.
type Md = { frontmatter: Record<string, string>; Content: any; compiledContent: () => string | Promise<string> };

const slugDe = (caminho: string) => caminho.split('/').pop()!.replace(/\.md$/, '');

export const paginas = Object.entries(import.meta.glob<Md>('./conteudo/paginas/*.md', { eager: true }))
  .map(([caminho, m]) => ({ slug: slugDe(caminho), ...m }));

// noticias-painel: as aprovadas no /painel/, gravadas pelo scripts/baixar-painel.mjs antes do build
export const noticias = Object.entries(import.meta.glob<Md>(['./conteudo/noticias/*.md', './conteudo/noticias-painel/*.md'], { eager: true }))
  .map(([caminho, m]) => ({ slug: slugDe(caminho), ...m }))
  .sort((a, b) => b.frontmatter.data.localeCompare(a.frontmatter.data));

export const pagina = (slug: string) => paginas.find((p) => p.slug === slug);

/** Descrição para o Google: o começo do texto, sem HTML. */
export async function resumo(m: Md, max = 155): Promise<string> {
  const t = String(await m.compiledContent()).replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ').trim();
  return t.length > max ? t.slice(0, t.lastIndexOf(' ', max)) + '…' : t;
}

// O WordPress não tinha categorias: deduz pelo título (primeira que bater). Para corrigir uma, ponha "categoria:" no .md.
const CATEGORIAS: [string, RegExp][] = [
  ['Saúde', /plano[s]? de saúde/i],
  ['Bancário', /empréstimos bancários/i],
  ['Previdenciário', /INSS|aposentad|previd|benefício|precatório|RPV|vida toda|retroativo|aeroviários/i],
  ['Trabalhista', /trabalh|emprego|gestante|FGTS|anistiad/i],
  ['Consumidor', /compra|escolar|viajar|aluguel/i],
  ['Penal', /domicílio|bebida/i],
];
export const categoria = (n: { frontmatter: Record<string, string> }) =>
  n.frontmatter.categoria || CATEGORIAS.find(([, re]) => re.test(n.frontmatter.titulo))?.[0] || 'Atualidades';

export const dataBR =(iso: string) =>
  new Date(`${iso}T12:00:00`).toLocaleDateString('pt-BR', { day: 'numeric', month: 'long', year: 'numeric' });
