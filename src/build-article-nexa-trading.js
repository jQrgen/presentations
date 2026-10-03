// Article page: "Not Exchange HFT: Building Automated Trading Products on Nexa"
//   node build-article-nexa-trading.js [--out <docsDir>]   (default ../docs) -> <out>/articles/nexa-automated-trading/index.html
// Text comes verbatim from articles/nexa-automated-trading.md (the claim-checked article, [C#] markers removed, byline set).
// The converter below only handles what that file uses: # / ## headings, ---, paragraphs, "- " lists, **bold**, *italic*, `code`, bare URLs.
// cover.png (1200x630, the og/twitter image) sits next to the page and is made once, not by this script.
// Share bar (X, LinkedIn, Reddit, Hacker News, copy link) under the byline and at the end; OpenGraph + Twitter card tags.
const fs = require("fs");
const path = require("path");
const { CSS, esc } = require("./theme.js");
const share = require("./share.js");

const arg = (k, d) => { const i = process.argv.indexOf(k); return i > 0 ? process.argv[i + 1] : d; };
const DOCS = path.resolve(arg("--out", path.join(__dirname, "..", "docs")));
const SLUG = "articles/nexa-automated-trading";
const URL = `https://jqrgen.github.io/presentations/${SLUG}/`;
const IMAGE = URL + "cover.png";
const DESC = "Fast, cheap, on-chain settlement for automated and algorithmic trading products: what Nexa gives you today, what changes with Tailstorm, and where the limits are.";
const NETWORKS = ["x", "linkedin", "reddit", "hackernews"];

const md = fs.readFileSync(path.join(__dirname, "articles", "nexa-automated-trading.md"), "utf8");
const inline = (t) => esc(t)
  .replace(/`([^`]+)`/g, "<code>$1</code>")
  .replace(/\*\*([^*]+)\*\*/g, "<strong>$1</strong>")
  .replace(/\*([^*]+)\*/g, "<em>$1</em>")
  .replace(/(^|[\s(])(https:\/\/[^\s)<]+)/g, (m, pre, u) => `${pre}<a href="${u}">${u}</a>`);

let title = "", byline = "", body = [], list = null;
const flush = () => { if (list) { body.push(`<ul>\n${list.map((li) => `  <li>${inline(li)}</li>`).join("\n")}\n</ul>`); list = null; } };
for (const block of md.split(/\n\s*\n/)) {
  const b = block.trim(); if (!b) continue;
  if (b.startsWith("# ")) { flush(); title = b.slice(2).trim(); continue; }
  if (!byline && /^\*By /.test(b)) { flush(); byline = b.replace(/^\*|\*$/g, ""); continue; }
  if (b === "---") { flush(); continue; }   // the rule under the byline; the page has its own spacing
  if (b.startsWith("## ")) { flush(); body.push(`<h2>${inline(b.slice(3))}</h2>`); continue; }
  if (b.split("\n").every((l) => l.startsWith("- "))) { flush(); list = b.split("\n").map((l) => l.slice(2)); flush(); continue; }
  flush(); body.push(`<p>${inline(b.replace(/\n/g, " "))}</p>`);
}
flush();
if (!title || !byline) { console.error("title or byline not found"); process.exit(1); }

const bar = share.bar({ url: URL, title, lang: "en", networks: NETWORKS });
const html = `<!doctype html>
<html lang="en">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width,initial-scale=1">
<title>${esc(title)} · Jørgen S. Notland</title>
<meta name="description" content="${esc(DESC)}">
<meta name="author" content="Jørgen S. Notland">
<link rel="canonical" href="${URL}">
<meta property="og:type" content="article">
<meta property="og:site_name" content="Jørgen S. Notland">
<meta property="og:title" content="${esc(title)}">
<meta property="og:description" content="${esc(DESC)}">
<meta property="og:url" content="${URL}">
<meta property="og:image" content="${IMAGE}">
<meta property="og:image:width" content="1200">
<meta property="og:image:height" content="630">
<meta property="og:image:alt" content="${esc(title)}">
<meta property="og:locale" content="en_GB">
<meta property="article:published_time" content="2026-10-03">
<meta property="article:author" content="Jørgen S. Notland">
<meta name="twitter:card" content="summary_large_image">
<meta name="twitter:site" content="@jQrgensn">
<meta name="twitter:creator" content="@jQrgensn">
<meta name="twitter:title" content="${esc(title)}">
<meta name="twitter:description" content="${esc(DESC)}">
<meta name="twitter:image" content="${IMAGE}">
<meta name="twitter:image:alt" content="${esc(title)}">
<style>${CSS.replace(/text-wrap:[a-z]+/g, "text-wrap:pretty")}
article{background:var(--paper);border:1px solid var(--line);padding:32px 36px 36px;max-width:760px;margin:0 auto}
@media (max-width:700px){article{padding:22px 18px 26px}}
article h1{font-size:32px;line-height:1.2}
article .byline{margin:0 0 4px;color:var(--muted);font-size:15px}
article h2{font-size:22px;font-weight:500;margin:30px 0 8px}
article p,article li{max-width:68ch;color:var(--ink-2);font-size:17px;line-height:1.6}
article ul{padding-left:22px}
article li{margin:6px 0}
article code{font-size:.92em;background:var(--ground);padding:1px 4px}
${share.CSS}</style>
</head>
<body>
<div class="band"><div class="inner">
    <a class="name" href="../../">Jørgen S. Notland</a>
    <nav aria-label="Sections"><a href="../../">Talks, articles and papers</a></nav>
  </div></div>
<main class="page">
<article>
<h1>${esc(title)}</h1>
<p class="byline">${inline(byline)}</p>
${bar}
${body.join("\n")}
${bar}
</article>
<footer class="site">Source: <a href="https://github.com/jQrgen/presentations">github.com/jQrgen/presentations</a></footer>
</main>
${share.SCRIPT}
</body>
</html>
`;
const out = path.join(DOCS, SLUG); fs.mkdirSync(out, { recursive: true });
fs.writeFileSync(path.join(out, "index.html"), html);
console.log("wrote", path.join(out, "index.html"));
