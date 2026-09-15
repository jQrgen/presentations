// Builds the site's front page: featured decks (from talks.json entries marked featured) plus section tiles.
// Usage: node home.js <dataDir> <outDir> <repoUrl>
const fs = require("fs");
const path = require("path");
const { band, head, foot, esc } = require("./theme.js");

const [dataDir, outDir, repoUrl] = process.argv.slice(2);
const load = (f) => JSON.parse(fs.readFileSync(path.join(dataDir, f), "utf8"));
const talks = load("talks.json"), articles = load("articles.json"), papers = load("papers.json");
const featured = talks.filter((t) => t.featured);
const rel = (h) => (h.startsWith("../") ? h.slice(3) : h.startsWith("files/") ? "talks/" + h : h);
const ext = (h) => (/^https?:/.test(h) ? ' rel="noopener"' : "");

const EXTRA = `
.featured{list-style:none;margin:26px 0 0;padding:0;display:grid;gap:18px}
.tiles{display:grid;grid-template-columns:repeat(auto-fit,minmax(220px,1fr));gap:14px;margin:40px 0 0}
.tile{display:block;background:var(--paper);border:1px solid var(--line);padding:18px 20px;color:var(--ink);text-decoration:none}
.tile:hover h2{text-decoration:underline}
.tile h2{font-size:22px;font-weight:500;margin:0 0 4px}
.tile p{margin:0;color:var(--muted);font-size:14px}
.tile .n{font-size:34px;font-weight:400;letter-spacing:-.02em;display:block;margin-bottom:6px;font-variant-numeric:tabular-nums}
`;

const card = (t) => `
    <li class="item">
      ${t.thumb ? `<figure class="thumb"><img src="${esc(rel(t.thumb))}" alt="" width="1600" height="900"></figure>` : ""}
      <div class="body">
        <h3>${esc(t.title)}</h3>
        <p class="where">${esc([t.meta, t.place].filter(Boolean).join(" · "))} <span class="date">${esc(t.date)}</span></p>
        ${t.description ? `<p class="desc">${esc(t.description)}</p>` : ""}
        <ul class="links">${(t.links || []).map((l) => `<li><a href="${esc(rel(l.href))}"${l.download ? " download" : ""}${l.primary ? ' class="primary"' : ""}${ext(l.href)}>${esc(l.label)}</a></li>`).join("")}</ul>
      </div>
    </li>`;

const html = head("Jørgen S. Notland") .replace("</style>", EXTRA + "</style>") + band("presentations", "") + `
<div class="page">
  <header>
    <h1>Presentations</h1>
    <p class="lede">Slide decks, talks, articles and papers by Jørgen S. Notland. New decks open in the browser with speaker notes and can be downloaded as PowerPoint or PDF; older talks are kept as the original slides.</p>
  </header>
  <ol class="featured">${featured.map(card).join("")}
  </ol>
  <div class="tiles">
    <a class="tile" href="talks/"><span class="n">${talks.length}</span><h2>Talks</h2><p>${Math.min(...talks.map((t) => t.year))}–${Math.max(...talks.map((t) => t.year))}, grouped by year</p></a>
    <a class="tile" href="articles/"><span class="n">${articles.length}</span><h2>Articles</h2><p>On Medium, ${Math.min(...articles.map((t) => t.year))}–${Math.max(...articles.map((t) => t.year))}</p></a>
    <a class="tile" href="papers/"><span class="n">${papers.length}</span><h2>Papers</h2><p>Theses, a conference paper and a presentation, with citation counts</p></a>
  </div>` + foot(repoUrl, repoUrl.replace(/^https?:\/\//, ""));

fs.mkdirSync(outDir, { recursive: true });
fs.writeFileSync(path.join(outDir, "index.html"), html);
console.log("wrote", path.join(outDir, "index.html"), "featured:", featured.length);
