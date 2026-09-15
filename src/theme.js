// Personal-site theme, modelled on nerdekollektivet.no: system font, black on light grey,
// white panels with hairline black borders, a black band for the site name. No accent colour.
const esc = (s) => String(s).replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");

const CSS = `
:root{
  color-scheme:light;
  --ground:#E5E7EB; --paper:#FFFFFF; --band:#000000; --band-ink:#FFFFFF;
  --ink:#000000; --ink-2:#1F2937; --muted:#4B5563; --line:#000000; --hair:#D1D5DB;
  --sans:system-ui,-apple-system,"Segoe UI",Roboto,Helvetica,Arial,sans-serif;
}
*{box-sizing:border-box}
body{margin:0;background:var(--ground);color:var(--ink);font-family:var(--sans);font-size:16px;line-height:1.5;-webkit-font-smoothing:antialiased}
a{color:var(--ink)}
a:focus-visible{outline:2px solid var(--ink);outline-offset:2px}
.band{background:var(--band);color:var(--band-ink)}
.band .inner{max-width:1080px;margin:0 auto;padding:22px 24px;display:flex;flex-wrap:wrap;align-items:baseline;gap:8px 28px}
.band .name{font-size:22px;font-weight:400;letter-spacing:.01em;color:var(--band-ink);text-decoration:none}
.band nav{display:flex;flex-wrap:wrap;gap:4px 22px;margin-left:auto}
.band nav a{color:var(--band-ink);text-decoration:none;font-size:15px;padding:4px 0;border-bottom:2px solid transparent;opacity:.8}
.band nav a:hover{opacity:1}
.band nav a[aria-current="page"]{opacity:1;border-bottom-color:var(--band-ink)}
.page{max-width:1080px;margin:0 auto;padding:36px 24px 72px}
h1{font-size:30px;font-weight:500;letter-spacing:-.01em;margin:0 0 8px;text-wrap:balance}
.lede{margin:0;color:var(--ink-2);max-width:62ch}
.count{margin:10px 0 0;font-size:13px;color:var(--muted)}
.year{display:grid;grid-template-columns:96px 1fr;gap:20px;align-items:start;margin-top:36px}
@media (max-width:700px){.year{grid-template-columns:1fr;gap:8px}}
.year h2{font-size:30px;font-weight:400;margin:0;letter-spacing:-.02em;font-variant-numeric:tabular-nums;position:sticky;top:12px}
.year ol{list-style:none;margin:0;padding:0;display:grid;grid-template-columns:1fr;gap:14px}
.item{display:grid;grid-template-columns:minmax(200px,2fr) 3fr;background:var(--paper);border:1px solid var(--line)}
.item.no-thumb{grid-template-columns:1fr}
@media (max-width:700px){.item{grid-template-columns:1fr}}
.thumb{margin:0;background:#000;aspect-ratio:16/9;border-right:1px solid var(--line)}
@media (max-width:700px){.thumb{border-right:0;border-bottom:1px solid var(--line)}}
.thumb img{display:block;width:100%;height:100%;object-fit:cover}
.body{padding:16px 22px 18px;display:flex;flex-direction:column;gap:6px}
.kind{font-size:12px;letter-spacing:.08em;text-transform:uppercase;color:var(--muted)}
.body h3{font-size:19px;font-weight:500;letter-spacing:-.01em;margin:0;text-wrap:balance}
.body h3 a{color:var(--ink);text-decoration:none}
.body h3 a:hover{text-decoration:underline}
.where{margin:0;font-size:14px;color:var(--muted)}
.where .date{color:var(--ink-2)}
.authors{margin:0;font-size:14px;color:var(--ink-2)}
.desc{margin:2px 0 0;color:var(--ink-2);max-width:66ch;font-size:15px}
.cites{margin:4px 0 0;font-size:14px;color:var(--ink)}
.cites b{font-weight:600}
.cites span{color:var(--muted)}
.links{list-style:none;margin:8px 0 0;padding:0;display:flex;flex-wrap:wrap;gap:8px 10px}
.links a{display:inline-block;color:var(--ink);text-decoration:none;font-size:14px;padding:5px 10px;border:1px solid var(--line);background:var(--paper)}
.links a.primary{background:var(--band);color:var(--band-ink)}
.links a:hover{text-decoration:underline}
.note{margin:6px 0 0;font-size:13px;color:var(--muted)}
footer.site{margin-top:48px;font-size:13px;color:var(--muted)}
footer.site a{color:inherit}
`;

const NAV = [["Presentations", "presentations"], ["Talks", "talks"], ["Articles", "articles"], ["Papers", "papers"]];

// depth: "" for the root page, "../" for a section page one level down, "../../" two levels down
function band(current, depth) {
  const href = (k) => (k === "presentations" ? `${depth || "./"}` : `${depth}${k}/`);
  return `<div class="band"><div class="inner">
    <a class="name" href="${depth || "./"}">Jørgen S. Notland</a>
    <nav aria-label="Sections">${NAV.map(([l, k]) => `<a href="${href(k)}"${k === current ? ' aria-current="page"' : ""}>${l}</a>`).join("")}</nav>
  </div></div>`;
}

const head = (title) => `<!doctype html>
<html lang="en">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width,initial-scale=1">
<title>${esc(title)}</title>
<style>${CSS}</style>
</head>
<body>`;

const foot = (repoUrl, repoText) => `
  <footer class="site">Source: <a href="${esc(repoUrl)}">${esc(repoText)}</a></footer>
</div>
</body>
</html>
`;

module.exports = { CSS, band, head, foot, esc, NAV };
