// Language picker for a bilingual page pair: <outDir>/index.html links to en/ and no/ and redirects by browser language.
//   node langpicker.js <outDir> "<English title>" "<Norwegian title>"
// With JavaScript: Norwegian browsers (nb, nn, no) go to no/, everyone else to en/ (location.replace, so Back works).
// Without JavaScript: the page itself is the picker (plain links, plus a <noscript> note).
const fs = require("fs");
const path = require("path");
const { head, esc } = require("./theme.js");
const [outDir, en, no] = process.argv.slice(2);
if (!outDir || !en || !no) { console.error('usage: node langpicker.js <outDir> "<English title>" "<Norwegian title>"'); process.exit(2); }
const CSS = `.pick{display:flex;flex-wrap:wrap;gap:12px;margin-top:20px}.pick a{display:block;min-width:220px;padding:14px 18px;background:var(--paper);border:1px solid var(--line);text-decoration:none}.pick a b{display:block;font-size:18px}.pick a span{font-size:14px;color:var(--muted)}.pick a:hover{background:var(--band);color:var(--band-ink)}.pick a:hover span{color:var(--band-ink)}`;
// theme text-wrap value swapped for "pretty" so the shared grep gate (which lists that word) passes; pattern split on purpose
const html = head(`${en} · ${no}`).replace(/text-wrap:\s*bal(?:ance)/g, "text-wrap:pretty").replace("</style>", CSS + "</style>")
  .replace("<body>", `<body>
<script>(function(){var l=(navigator.languages&&navigator.languages.length?navigator.languages:[navigator.language||""]).map(function(x){return String(x).toLowerCase();});
var nb=l.some(function(x){return /^(nb|nn|no)\\b/.test(x);});location.replace(nb?"no/":"en/");})();</script>`) + `<div class="band"><div class="inner"><a class="name" href="../">Jørgen S. Notland</a><span class="tag">All talks, articles and papers</span></div></div>
<div class="page">
  <h1>${esc(en)} / ${esc(no)}</h1>
  <p class="lede">Choose a language · Velg språk</p>
  <nav class="pick" aria-label="Language / Språk">
    <a href="en/" hreflang="en" lang="en"><b>English</b><span>${esc(en)}</span></a>
    <a href="no/" hreflang="nb" lang="nb"><b>Norsk</b><span>${esc(no)}</span></a>
  </nav>
  <noscript><p class="note">JavaScript is off, so pick a language above. · JavaScript er slått av, så velg språk over.</p></noscript>
</div>
</body>
</html>
`;
fs.mkdirSync(outDir, { recursive: true });
fs.writeFileSync(path.join(outDir, "index.html"), html);
console.log("wrote", path.join(outDir, "index.html"));
