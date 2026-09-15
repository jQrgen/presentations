// Builds a card archive page (talks, articles, papers) grouped by year, newest first.
// Usage: node cards.js <items.json> <outDir> <section> <repoUrl>
// Item fields: year, sort (YYYY-MM-DD), date, title, meta, place, authors, kind, description, thumb,
//              citations [{source, count, href}], note, links [{label, href, primary, download}]
const fs = require("fs");
const path = require("path");
const { band, head, foot, esc } = require("./theme.js");

const [src, outDir, section, repoUrl] = process.argv.slice(2);
const items = JSON.parse(fs.readFileSync(src, "utf8")).sort((a, b) => b.year - a.year || (b.sort || "").localeCompare(a.sort || "") || a.title.localeCompare(b.title));

const SECTIONS = {
  talks: { title: "Talks", lede: "Talks and presentations, newest first. New decks open in the browser with speaker notes; older talks are kept as the original slides." },
  articles: { title: "Articles", lede: "Articles on Medium, newest first. Mostly Nexa, Bitcoin scaling and the legal side of smart contracts." },
  papers: { title: "Papers", lede: "Academic work: theses, a peer-reviewed conference paper and the preprint and presentation that go with it. Citation counts are per source, as they overlap." },
};
const S = SECTIONS[section];
const years = [...new Set(items.map((t) => t.year))];
const ext = (h) => (/^https?:/.test(h) ? ' rel="noopener"' : "");

const card = (t) => `
      <li class="item${t.thumb ? "" : " no-thumb"}">
        ${t.thumb ? `<figure class="thumb"><img src="${esc(t.thumb)}" alt="" width="1600" height="900" loading="lazy"></figure>` : ""}
        <div class="body">
          ${t.kind ? `<span class="kind">${esc(t.kind)}</span>` : ""}
          <h3>${t.links && t.links[0] ? `<a href="${esc(t.links[0].href)}"${ext(t.links[0].href)}>${esc(t.title)}</a>` : esc(t.title)}</h3>
          <p class="where">${esc([t.meta, t.place].filter(Boolean).join(" · "))}${t.date ? ` <span class="date">${esc(t.date)}</span>` : ""}</p>
          ${t.authors ? `<p class="authors">${esc(t.authors)}</p>` : ""}
          ${t.description ? `<p class="desc">${esc(t.description)}</p>` : ""}
          ${t.citations && t.citations.length ? `<p class="cites"><b>${esc(String(t.citations[0].count))} citations</b> <span>${t.citations.map((c) => `${esc(c.source)}: ${esc(String(c.count))}`).join(" · ")}</span></p>` : ""}
          ${t.links && t.links.length ? `<ul class="links">${t.links.map((l) => `<li><a href="${esc(l.href)}"${l.download ? " download" : ""}${l.primary ? ' class="primary"' : ""}${ext(l.href)}>${esc(l.label)}</a></li>`).join("")}</ul>` : ""}
          ${t.note ? `<p class="note">${esc(t.note)}</p>` : ""}
        </div>
      </li>`;

const html = head(`${S.title} · Jørgen S. Notland`) + band(section, "../") + `
<div class="page">
  <header>
    <h1>${esc(S.title)}</h1>
    <p class="lede">${esc(S.lede)}</p>
    <p class="count">${items.length} ${section === "papers" ? "publications" : section} · ${years[years.length - 1]}–${years[0]}</p>
  </header>
${years.map((y) => `
  <section class="year" aria-labelledby="y${y}">
    <h2 id="y${y}">${y}</h2>
    <ol>${items.filter((t) => t.year === y).map(card).join("")}
    </ol>
  </section>`).join("")}` + foot(repoUrl, repoUrl.replace(/^https?:\/\//, ""));

fs.mkdirSync(outDir, { recursive: true });
fs.writeFileSync(path.join(outDir, "index.html"), html);
console.log("wrote", path.join(outDir, "index.html"), section, items.length, "items, years:", years.join(", "));
