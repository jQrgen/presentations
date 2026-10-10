// Article page: "Nexa tokens explained: groups, authorities and the token description document"
//   node build-article-nexa-tokens.js [--out <docsDir>]   (default ../docs) -> <out>/articles/nexa-tokens-explained/index.html
// Text comes from articles/nexa-tokens-explained.md. Same page shell, theme and share bar as build-article-nexa-trading.js;
// the converter also handles ### headings, fenced code, tables, ordered and one level of nested lists, and [text](url) links.
// No cover image yet, so the card is "summary" without og:image.
const fs = require("fs");
const path = require("path");
const { CSS, esc } = require("./theme.js");
const share = require("./share.js");

const arg = (k, d) => { const i = process.argv.indexOf(k); return i > 0 ? process.argv[i + 1] : d; };
const DOCS = path.resolve(arg("--out", path.join(__dirname, "..", "docs")));
const SLUG = "articles/nexa-tokens-explained";
const URL = `https://jqrgen.com/presentations/${SLUG}/`;
const DESC = "A developer tutorial on Nexa's native tokens: group IDs, amounts, subgroups and NFTs, authority flags, the signed token description document, and the pitfalls, with spec and source references.";
const NETWORKS = ["x", "linkedin", "reddit", "hackernews"];

const md = fs.readFileSync(path.join(__dirname, "articles", "nexa-tokens-explained.md"), "utf8");
// Inline: `code` (protected first), [text](https-url), **bold**, *italic*, bare https URLs.
const inline = (t) => {
  const codes = [];
  let h = esc(t).replace(/`([^`]+)`/g, (m, c) => { codes.push(`<code>${c}</code>`); return `\u0000${codes.length - 1}\u0000`; });
  const links = [];
  h = h.replace(/\[([^\]]+)\]\((https:\/\/[^\s)]+)\)/g, (m, txt, u) => { links.push(`<a href="${u}">${txt}</a>`); return `\u0001${links.length - 1}\u0001`; });
  h = h.replace(/\*\*([^*]+)\*\*/g, "<strong>$1</strong>")
    .replace(/(^|[^\w*])\*([^*\s][^*]*?)\*(?!\w)/g, "$1<em>$2</em>")
    .replace(/(^|[\s(])(https:\/\/[^\s)<|]+)/g, (m, pre, u) => `${pre}<a href="${u}">${u}</a>`);
  return h.replace(/\u0001(\d+)\u0001/g, (m, i) => links[i]).replace(/\u0000(\d+)\u0000/g, (m, i) => codes[i]);
};
// Block parser for what the article uses: # ## ### headings, ---, ``` fences, | tables |, "- " and "1. " lists (one nested level), paragraphs.
const lines = md.split("\n");
let title = "", byline = "", body = [], para = [];
const flushP = () => { if (para.length) { body.push(`<p>${inline(para.join(" "))}</p>`); para = []; } };
const isItem = (l) => /^\s*(- |\d+\. )/.test(l);
for (let i = 0; i < lines.length; ) {
  const l = lines[i];
  if (!l.trim()) { flushP(); i++; continue; }
  if (l.startsWith("```")) { flushP(); const lang = l.slice(3).trim(); const buf = []; i++;
    while (i < lines.length && !lines[i].startsWith("```")) buf.push(lines[i++]); i++;
    body.push(`<pre><code${lang ? ` class="language-${lang}"` : ""}>${esc(buf.join("\n"))}</code></pre>`); continue; }
  if (l.startsWith("# ")) { flushP(); title = l.slice(2).trim(); i++; continue; }
  if (!byline && /^\*By /.test(l)) { flushP(); byline = l.replace(/^\*|\*$/g, ""); i++; continue; }
  if (l.trim() === "---") { flushP(); body.push("<hr>"); i++; continue; }
  const hm = l.match(/^(#{2,3}) (.*)$/);
  if (hm) { flushP(); const n = hm[1].length; body.push(`<h${n}>${inline(hm[2])}</h${n}>`); i++; continue; }
  if (l.startsWith("|")) { flushP(); const rows = []; while (i < lines.length && lines[i].startsWith("|")) rows.push(lines[i++]);
    const cells = (r) => r.trim().replace(/^\||\|$/g, "").split("|").map((c) => c.trim());
    const [hd, , ...rest] = rows;
    body.push(`<div class="tbl"><table>\n<thead><tr>${cells(hd).map((c) => `<th>${inline(c)}</th>`).join("")}</tr></thead>\n<tbody>\n${rest.map((r) => `<tr>${cells(r).map((c) => `<td>${inline(c)}</td>`).join("")}</tr>`).join("\n")}\n</tbody></table></div>`); continue; }
  if (isItem(l) && !/^\s/.test(l)) { flushP();
    // collect the list block: top-level items, indented sub-items and indented continuation paragraphs
    const items = []; const ordered = /^\d+\. /.test(l);
    while (i < lines.length) {
      const x = lines[i];
      if (/^(- |\d+\. )/.test(x)) { items.push({ text: [x.replace(/^(- |\d+\. )/, "")], subs: [], subOrdered: false, after: [] }); i++; continue; }
      if (/^\s+(- |\d+\. )/.test(x) && items.length) { const it = items[items.length - 1]; it.subOrdered = /^\s+\d+\. /.test(x); it.subs.push(x.replace(/^\s+(- |\d+\. )/, "")); i++; continue; }
      if (!x.trim() && i + 1 < lines.length && /^\s+\S/.test(lines[i + 1]) && items.length) { i++; continue; }
      if (/^\s+\S/.test(x) && items.length) { const it = items[items.length - 1]; (it.subs.length ? it.after : it.text).push(x.trim()); i++; continue; }
      if (x.trim() && !isItem(x) && items.length && !/^(#|\||```|---)/.test(x)) { items[items.length - 1].text.push(x.trim()); i++; continue; }
      break;
    }
    const tag = ordered ? "ol" : "ul";
    body.push(`<${tag}>\n${items.map((it) => { const st = it.subOrdered ? "ol" : "ul";
      return `  <li>${inline(it.text.join(" "))}${it.subs.length ? `\n    <${st}>${it.subs.map((s) => `<li>${inline(s)}</li>`).join("")}</${st}>` : ""}${it.after.length ? `<p>${inline(it.after.join(" "))}</p>` : ""}</li>`; }).join("\n")}\n</${tag}>`); continue; }
  para.push(l.trim()); i++;
}
flushP();
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
<meta property="og:locale" content="en_GB">
<meta property="article:published_time" content="2026-10-10">
<meta property="article:author" content="Jørgen S. Notland">
<meta name="twitter:card" content="summary">
<meta name="twitter:site" content="@jQrgensn">
<meta name="twitter:creator" content="@jQrgensn">
<meta name="twitter:title" content="${esc(title)}">
<meta name="twitter:description" content="${esc(DESC)}">
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
article h3{font-size:18px;font-weight:600;margin:22px 0 6px}
article hr{border:0;border-top:1px solid var(--line);margin:28px 0}
article ol{padding-left:24px}
article li>ul,article li>ol{margin:4px 0}
article pre{background:var(--ground);border:1px solid var(--line);padding:12px 14px;overflow-x:auto;font-size:13.5px;line-height:1.5}
article pre code{background:none;padding:0;font-size:inherit}
article .tbl{overflow-x:auto;margin:14px 0}
article table{border-collapse:collapse;font-size:14.5px;line-height:1.45;color:var(--ink-2)}
article th,article td{border:1px solid var(--line);padding:6px 8px;text-align:left;vertical-align:top}
article th{background:var(--ground);font-weight:600}
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
${share.top({ url: URL, title, lang: "en", networks: NETWORKS })}
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
