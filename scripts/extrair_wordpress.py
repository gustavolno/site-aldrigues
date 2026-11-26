"""Extrai o conteúdo do site WordPress baixado (site-bruto) para o projeto novo: áreas, páginas e notícias em .md (corpo HTML limpo).
Uso: python -I extrair.py <pasta site-bruto> <pasta do projeto>"""
import html
import json
import re
import sys
import urllib.request
from html.parser import HTMLParser
from pathlib import Path

BRUTO, PROJ = Path(sys.argv[1]), Path(sys.argv[2])
PERMITIDAS = {"p", "h2", "h3", "h4", "ul", "ol", "li", "strong", "b", "em", "i", "a", "blockquote", "br"}
PULAR = {"h5", "h6", "script", "style", "noscript", "svg", "form", "iframe", "button", "select", "textarea", "nav", "header", "footer"}


class Limpo(HTMLParser):
    def __init__(self):
        super().__init__(convert_charrefs=True)
        self.out, self.pulo = [], 0

    def handle_starttag(self, t, a):
        if t in PULAR:
            self.pulo += 1
        if self.pulo:
            return
        t = "h2" if t == "h1" else t
        if t in PERMITIDAS:
            if t == "a":
                href = dict(a).get("href") or ""
                href = re.sub(r"^https?://(www\.)?aldriguescandido\.adv\.br", "", href)
                self.out.append(f'<a href="{html.escape(href)}">' if href and not href.startswith("#") else "<a>")
            else:
                self.out.append(f"<{t}>")
        elif t in ("div", "section", "span") and self.out and not self.out[-1].endswith("\n"):
            self.out.append(" ")

    def handle_endtag(self, t):
        if t in PULAR:
            self.pulo = max(0, self.pulo - 1)
            return
        if self.pulo:
            return
        t = "h2" if t == "h1" else t
        if t in PERMITIDAS and t != "br":
            self.out.append(f"</{t}>\n" if t in ("p", "h2", "h3", "h4", "li", "ul", "ol", "blockquote") else f"</{t}>")

    def handle_data(self, d):
        if not self.pulo:
            self.out.append(html.escape(re.sub(r"\s+", " ", d)))


def limpar(fragmento: str) -> str:
    p = Limpo()
    p.feed(fragmento)
    s = "".join(p.out)
    s = re.sub(r"<a>(.*?)</a>", r"\1", s, flags=re.S)
    for _ in range(3):
        s = re.sub(r"<(p|h2|h3|h4|li|strong|b|em|i|ul|ol|blockquote)>\s*</\1>\n?", "", s)
    s = re.sub(r"<br>\s*(?=</p>)", "", s)
    s = re.sub(r"\n\s*\n+", "\n", s)
    s = re.sub(r"[ \t]+", " ", s)
    return "\n".join(l.strip() for l in s.splitlines() if l.strip())


def ler(f: Path) -> str:
    """Nomes de notícia passam de 260 caracteres no caminho: o prefixo \?\ libera caminho longo no Windows."""
    return open("\\\\?\\" + str(f.resolve()), encoding="utf-8", errors="ignore").read()


def meta(t: str, prop: str) -> str:
    m = re.search(rf'<meta (?:property|name)="{re.escape(prop)}" content="([^"]*)"', t)
    return re.sub(r"\s+", " ", re.sub(r"<[^>]+>", " ", html.unescape(m.group(1)))).strip() if m else ""


def titulo(t: str) -> str:
    return meta(t, "og:title").replace(" - Aldrigues Cândido Advocacia", "").strip()


def entre(t: str, inicio: str, fim: str) -> str:
    i = t.find(inicio)
    if i < 0:
        return ""
    j = t.find(fim, i)
    trecho = t[i:j if j > 0 else len(t)]
    return trecho[trecho.find(">") + 1:]   # sem o resto da tag de abertura


def fm(d: dict) -> str:
    return "---\n" + "".join(f"{k}: {json.dumps(v, ensure_ascii=False)}\n" for k, v in d.items()) + "---\n"


def baixar(url: str, destino: Path) -> bool:
    if destino.exists():
        return True
    try:
        req = urllib.request.Request(url, headers={"User-Agent": "Mozilla/5.0"})
        with urllib.request.urlopen(req, timeout=30) as r:
            destino.write_bytes(r.read())
        return True
    except Exception as e:
        print("imagem falhou", url[:80], e)
        return False


redirects = []

# ── notícias ──
dn, di = PROJ / "src/conteudo/noticias", PROJ / "public/img/noticias"
dn.mkdir(parents=True, exist_ok=True); di.mkdir(parents=True, exist_ok=True)
for f in sorted(BRUTO.glob("20[0-9][0-9]_*.html")):
    t = ler(f)
    corpo = entre(t, "elementor-widget-theme-post-content", 'data-elementor-type="footer"')
    corpo = corpo.split("Compartilhe essa matéria")[0]   # o resto é botão de compartilhar e "Adicionadas recentemente"
    ano, mes, dia, slug = f.stem.split("_", 3)
    img = meta(t, "og:image")
    nome_img = ""
    if img:
        ext = re.search(r"\.(jpe?g|png|webp|gif)", img, re.I)
        nome_img = f"{slug[:60]}.{ext.group(1).lower() if ext else 'jpg'}"
        if not baixar(re.sub(r"\?.*$", "", img).replace("i0.wp.com/", ""), di / nome_img):   # o CDN (i0.wp.com) dá 404; o servidor do site tem
            nome_img = ""
    (dn / f"{slug}.md").write_text(fm({"titulo": titulo(t), "data": f"{ano}-{mes}-{dia}", "resumo": meta(t, "og:description"),
                                          "imagem": f"/img/noticias/{nome_img}" if nome_img else ""}) + limpar(corpo) + "\n", encoding="utf-8")
    redirects.append((f"/{ano}/{mes}/{dia}/{slug}/", f"/noticias/{slug}/"))

# ── páginas (áreas e institucionais) ──
dp = PROJ / "src/conteudo/paginas"
dp.mkdir(parents=True, exist_ok=True)
for f in sorted(BRUTO.glob("*.html"), key=lambda f: ("-novo" in f.stem, f.stem)):   # a versão "-novo" vence a antiga de mesmo nome
    if re.match(r"20\d\d_", f.name) or f.stem in ("home", "teste", "noticias"):
        continue
    t = ler(f)
    corpo = entre(t, 'data-elementor-type="wp-page"', 'data-elementor-type="footer"')
    novo = re.sub(r"-novo(-\d)?$", "", f.stem)
    tit = re.sub(r"\s*novo$", "", titulo(t), flags=re.I)
    corpo = re.sub(rf"<(h2|p)>\s*{re.escape(tit)}\s*</\1>\n?", "", limpar(corpo), flags=re.I)   # o título já sai no topo da página
    (dp / f"{novo}.md").write_text(fm({"titulo": tit, "antigo": f"/{f.stem}/", "descricao": meta(t, "og:description")}) + corpo + "\n",
                                   encoding="utf-8")
    redirects.append((f"/{f.stem}/", f"/{novo}/"))

(PROJ / "public/_redirects").write_text("".join(f"{a} {b} 301\n" for a, b in redirects if a != b) + "/noticias/page/* /noticias/ 301\n", encoding="utf-8")
print(len(list(dn.glob("*.md"))), "notícias;", len(list(dp.glob("*.md"))), "páginas;", len(redirects), "redirecionamentos")

# self-check do limpador
assert limpar('<div><h1>T</h1><p>a <b>b</b><script>x</script></p><p> </p></div>') == "<h2>T</h2>\n<p>a <b>b</b></p>"
