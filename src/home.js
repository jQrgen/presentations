// Builds the single front page: every talk, article and paper in one timeline, grouped by year, newest first.
// Usage: node home.js <dataDir> <outDir> <repoUrl>
const fs = require("fs");
const path = require("path");
const { head, foot, esc } = require("./theme.js");

const [dataDir, outDir, repoUrl] = process.argv.slice(2);
const load = (f, section) => JSON.parse(fs.readFileSync(path.join(dataDir, f), "utf8")).map((t) => ({ ...t, section }));
const items = [...load("talks.json", "Talk"), ...load("articles.json", "Article"), ...load("papers.json", "Paper")]
  .sort((a, b) => b.year - a.year || (b.sort || "").localeCompare(a.sort || "") || a.title.localeCompare(b.title));
const counts = { Talk: 0, Article: 0, Paper: 0 };
items.forEach((t) => counts[t.section]++);
const years = [...new Set(items.map((t) => t.year))];

// talks.json links are written relative to /talks/; papers and articles are absolute
const rel = (h) => (h.startsWith("../") ? h.slice(3) : h.startsWith("files/") ? "talks/" + h : h);
const ext = (h) => (/^https?:/.test(h) ? ' rel="noopener"' : "");

const EXTRA = `
.band .inner{gap:8px 18px}
.band .tag{font-size:14px;opacity:.8}
.counts{margin:10px 0 0;font-size:13px;color:var(--muted)}
.counts a{color:var(--ink)}
.kind{display:inline-flex;align-items:center;gap:8px}
.kind .sec{padding:2px 7px;border:1px solid var(--line);color:var(--ink);letter-spacing:.08em}
.kind .sec.talk{background:var(--band);color:var(--band-ink);border-color:var(--band)}
.years{display:flex;flex-wrap:wrap;gap:6px 14px;margin:18px 0 0;padding:0;list-style:none;font-size:14px}
.years a{color:var(--ink)}
`;

const card = (t) => {
  const sec = t.section;
  const kindText = t.kind ? esc(t.kind) : "";
  const first = t.links && t.links[0];
  return `
      <li class="item${t.thumb ? "" : " no-thumb"}">
        ${t.thumb ? `<figure class="thumb"><img src="${esc(rel(t.thumb))}" alt="" width="1600" height="900" loading="lazy"></figure>` : ""}
        <div class="body">
          <span class="kind"><span class="sec ${sec.toLowerCase()}">${sec.toUpperCase()}</span>${kindText}</span>
          <h3>${first ? `<a href="${esc(rel(first.href))}"${ext(first.href)}>${esc(t.title)}</a>` : esc(t.title)}</h3>
          <p class="where">${esc([t.meta, t.place].filter(Boolean).join(" · "))}${t.date ? ` <span class="date">${esc(t.date)}</span>` : ""}</p>
          ${t.authors ? `<p class="authors">${esc(t.authors)}</p>` : ""}
          ${t.description ? `<p class="desc">${esc(t.description)}</p>` : ""}
          ${t.citations && t.citations.length ? `<p class="cites"><b>${esc(String(t.citations[0].count))} citations</b> <span>${t.citations.map((c) => `${esc(c.source)}: ${esc(String(c.count))}`).join(" · ")}</span></p>` : ""}
          ${t.links && t.links.length ? `<ul class="links">${t.links.map((l) => `<li><a href="${esc(rel(l.href))}"${l.download ? " download" : ""}${l.primary ? ' class="primary"' : ""}${ext(l.href)}>${esc(l.label)}</a></li>`).join("")}</ul>` : ""}
          ${t.note ? `<p class="note">${esc(t.note)}</p>` : ""}
        </div>
      </li>`;
};

const html = head("Jørgen S. Notland").replace("</style>", EXTRA + "</style>") + `<div class="band"><div class="inner">
    <a class="name" href="./">Jørgen S. Notland</a>
    <span class="tag">Talks, articles and papers</span>
  </div></div>
<div class="page">
  <header>
    <h1>Talks, articles and papers</h1>
    <p class="lede">Everything in one timeline, newest first. New decks open in the browser with speaker notes and can be downloaded as PowerPoint or PDF; older talks are kept as the original slides. Citation counts on papers are per source, as the sources overlap.</p>
    <p class="counts">${counts.Talk} talks · ${counts.Article} articles · ${counts.Paper} papers · ${years[years.length - 1]}–${years[0]}</p>
    <ul class="years">${years.map((y) => `<li><a href="#y${y}">${y}</a></li>`).join("")}</ul>
  </header>
${years.map((y) => `
  <section class="year" aria-labelledby="y${y}">
    <h2 id="y${y}">${y}</h2>
    <ol>${items.filter((t) => t.year === y).map(card).join("")}
    </ol>
  </section>`).join("")}` + foot(repoUrl, repoUrl.replace(/^https?:\/\//, ""));

fs.mkdirSync(outDir, { recursive: true });
fs.writeFileSync(path.join(outDir, "index.html"), html);
console.log("wrote", path.join(outDir, "index.html"), items.length, "items,", years.length, "years");
