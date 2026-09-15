// Generic slide viewer page in the personal-site theme (the slides themselves carry the deck's own branding).
//   const { writeViewer } = require("./viewer.js"); writeViewer(spec, outDir)
// spec: { lang, pageTitle, meta, slides: [{ title, notes }], pptxUrl?, pdfUrl?, homeUrl?, depth? }
// Slides are expected at <outDir>/slides/NN.png (1600x900).
const fs = require("fs");
const path = require("path");
const { band, head, esc } = require("./theme.js");

const UI = {
  en: { of: "of", prev: "Previous slide", next: "Next slide", notes: "Notes", fullscreen: "Fullscreen",
        notesHead: "Speaker notes", tocHead: "Slides", download: "Download .pptx", downloadPdf: "Download .pdf",
        hint: "← → to move between slides · N toggles notes · F for fullscreen", lang: "en" },
  no: { of: "av", prev: "Forrige slide", next: "Neste slide", notes: "Notater", fullscreen: "Fullskjerm",
        notesHead: "Talenotater", tocHead: "Slides", download: "Last ned .pptx", downloadPdf: "Last ned .pdf",
        hint: "← → for å bla · N viser notater · F for fullskjerm", lang: "nb" },
};

const EXTRA = `
.deck-head{display:flex;flex-wrap:wrap;align-items:baseline;gap:6px 18px;margin-bottom:16px}
.deck-head h1{font-size:24px;margin:0}
.deck-head .meta{font-size:14px;color:var(--muted)}
main{display:grid;grid-template-columns:minmax(0,1fr) 280px;gap:24px;align-items:start}
@media (max-width:900px){main{grid-template-columns:1fr}}
.frame{margin:0;background:#000;border:1px solid var(--line);overflow:hidden;aspect-ratio:16/9;position:relative;cursor:pointer;outline:none}
.frame:focus-visible{box-shadow:0 0 0 3px var(--ink)}
.frame img{display:block;width:100%;height:100%;object-fit:contain;user-select:none;-webkit-user-drag:none}
.frame:fullscreen{background:#000;cursor:none}
.controls{display:flex;flex-wrap:wrap;align-items:center;gap:8px 10px;margin-top:12px}
.controls button,.controls a.dl{font:500 14px var(--sans);color:var(--ink);background:var(--paper);border:1px solid var(--line);padding:7px 11px;cursor:pointer;line-height:1.2;text-decoration:none}
.controls button:hover,.controls a.dl:hover{text-decoration:underline}
.controls button:focus-visible{outline:2px solid var(--ink);outline-offset:2px}
.controls button[aria-pressed="true"]{background:var(--band);color:var(--band-ink)}
.counter{font-size:14px;color:var(--ink-2);min-width:64px;text-align:center;font-variant-numeric:tabular-nums}
.stitle{flex:1 1 240px;font-size:15px;font-weight:500;color:var(--ink);min-width:0}
.hint{margin:8px 0 0;font-size:13px;color:var(--muted)}
.notes{margin-top:20px;padding:16px 20px;background:var(--paper);border:1px solid var(--line)}
.notes h2{font-size:12px;letter-spacing:.08em;text-transform:uppercase;color:var(--muted);margin:0 0 8px;font-weight:500}
.notes p{margin:0;max-width:72ch;color:var(--ink-2);font-size:15.5px;line-height:1.6;white-space:pre-line}
.toc h2{font-size:12px;letter-spacing:.08em;text-transform:uppercase;color:var(--muted);margin:0 0 8px;font-weight:500}
.toc ol{list-style:none;margin:0;padding:0;display:flex;flex-direction:column;gap:2px}
.toc button{display:grid;grid-template-columns:28px 1fr;gap:8px;align-items:start;width:100%;text-align:left;font:400 14px/1.35 var(--sans);color:var(--ink-2);background:transparent;border:0;padding:7px 8px;cursor:pointer}
.toc button:hover{background:var(--paper)}
.toc button:focus-visible{outline:2px solid var(--ink);outline-offset:-2px}
.toc button[aria-current="true"]{background:var(--band);color:var(--band-ink)}
.toc .n{font-size:12px;line-height:1.6;color:var(--muted);text-align:right;padding-right:2px;font-variant-numeric:tabular-nums}
.toc button[aria-current="true"] .n{color:var(--band-ink)}
`;

function renderViewer(spec) {
  const U = UI[spec.lang] || UI.en;
  const slides = spec.slides.map((s, i) => ({ n: i + 1, title: s.title, notes: s.notes || "", img: `slides/${String(i + 1).padStart(2, "0")}.png` }));
  const hasNotes = slides.some((s) => s.notes.trim().length > 0);
  return head(spec.pageTitle).replace("</style>", EXTRA + "</style>").replace('<html lang="en">', `<html lang="${U.lang}">`) + band("presentations", spec.depth ?? "../../") + `
<div class="page">
  <header class="deck-head">
    <h1>${esc(spec.pageTitle)}</h1>
    <span class="meta">${esc(spec.meta)}</span>
  </header>
  <main>
    <section aria-label="${esc(spec.pageTitle)}">
      <figure class="frame" id="frame" tabindex="0">
        <img id="slide" src="${slides[0].img}" alt="${esc(slides[0].title)}" width="1600" height="900">
      </figure>
      <div class="controls">
        <button type="button" id="prev" aria-label="${esc(U.prev)}">←</button>
        <div class="counter"><span id="cur">1</span> ${esc(U.of)} ${slides.length}</div>
        <button type="button" id="next" aria-label="${esc(U.next)}">→</button>
        <div class="stitle" id="stitle">${esc(slides[0].title)}</div>${hasNotes ? `
        <button type="button" id="notesBtn" aria-pressed="true">${esc(U.notes)}</button>` : ""}
        <button type="button" id="fsBtn">${esc(U.fullscreen)}</button>${spec.pptxUrl ? `
        <a class="dl" href="${esc(spec.pptxUrl)}" download>${esc(U.download)}</a>` : ""}${spec.pdfUrl ? `
        <a class="dl" href="${esc(spec.pdfUrl)}" download>${esc(U.downloadPdf)}</a>` : ""}
      </div>
      <p class="hint">${esc(U.hint)}</p>${hasNotes ? `
      <div class="notes" id="notes">
        <h2>${esc(U.notesHead)}</h2>
        <p id="ntext">${esc(slides[0].notes)}</p>
      </div>` : ""}
    </section>
    <aside class="toc" aria-label="${esc(U.tocHead)}">
      <h2>${esc(U.tocHead)}</h2>
      <ol id="toc">
${slides.map((s) => `        <li><button type="button" data-n="${s.n}"${s.n === 1 ? ' aria-current="true"' : ""}><span class="n">${s.n}</span><span>${esc(s.title)}</span></button></li>`).join("\n")}
      </ol>
    </aside>
  </main>
</div>
<script>
(function(){
  var S = ${JSON.stringify(slides.map((s) => ({ t: s.title, n: s.notes, i: s.img })))};
  var cur = 0;
  var img = document.getElementById('slide'), curEl = document.getElementById('cur');
  var stitle = document.getElementById('stitle'), ntext = document.getElementById('ntext');
  var notes = document.getElementById('notes'), notesBtn = document.getElementById('notesBtn');
  var frame = document.getElementById('frame');
  var tocBtns = Array.prototype.slice.call(document.querySelectorAll('#toc button'));
  var cache = {};
  function preload(i){ if (i<0||i>=S.length||cache[i]) return; var im = new Image(); im.src = S[i].i; cache[i] = im; }
  function go(i, push){
    i = Math.max(0, Math.min(S.length-1, i));
    cur = i;
    img.src = S[i].i; img.alt = S[i].t;
    curEl.textContent = i+1; stitle.textContent = S[i].t; if (ntext) ntext.textContent = S[i].n;
    tocBtns.forEach(function(b, k){ if (k===i) b.setAttribute('aria-current','true'); else b.removeAttribute('aria-current'); });
    if (push !== false) { try { history.replaceState(null, '', '#' + (i+1)); } catch(e){} }
    preload(i+1); preload(i-1);
  }
  document.getElementById('prev').addEventListener('click', function(){ go(cur-1); });
  document.getElementById('next').addEventListener('click', function(){ go(cur+1); });
  frame.addEventListener('click', function(e){
    var r = frame.getBoundingClientRect();
    go(e.clientX - r.left < r.width * 0.25 ? cur-1 : cur+1);
  });
  tocBtns.forEach(function(b){ b.addEventListener('click', function(){ go(+b.dataset.n - 1); }); });
  if (notesBtn) {
    notesBtn.addEventListener('click', function(){
      var on = notesBtn.getAttribute('aria-pressed') !== 'true';
      notesBtn.setAttribute('aria-pressed', on ? 'true' : 'false');
      notes.hidden = !on;
      try { localStorage.setItem('deck-notes', on ? '1' : '0'); } catch(e){}
    });
    try { if (localStorage.getItem('deck-notes') === '0') { notesBtn.setAttribute('aria-pressed','false'); notes.hidden = true; } } catch(e){}
  }
  document.getElementById('fsBtn').addEventListener('click', function(){
    if (document.fullscreenElement) { document.exitFullscreen(); }
    else if (frame.requestFullscreen) { frame.requestFullscreen(); }
  });
  document.addEventListener('keydown', function(e){
    if (e.target && /^(INPUT|TEXTAREA)$/.test(e.target.tagName)) return;
    switch (e.key) {
      case 'ArrowRight': case 'PageDown': case ' ': e.preventDefault(); go(cur+1); break;
      case 'ArrowLeft': case 'PageUp': e.preventDefault(); go(cur-1); break;
      case 'Home': e.preventDefault(); go(0); break;
      case 'End': e.preventDefault(); go(S.length-1); break;
      case 'n': case 'N': if (notesBtn) notesBtn.click(); break;
      case 'f': case 'F': document.getElementById('fsBtn').click(); break;
    }
  });
  window.addEventListener('hashchange', function(){ var h = parseInt(location.hash.slice(1), 10); if (h>=1 && h<=S.length) go(h-1, false); });
  var h0 = parseInt(location.hash.slice(1), 10);
  go(h0>=1 && h0<=S.length ? h0-1 : 0, false);
})();
</script>
</body>
</html>
`;
}

function writeViewer(spec, outDir) {
  fs.mkdirSync(path.join(outDir, "slides"), { recursive: true });
  fs.writeFileSync(path.join(outDir, "index.html"), renderViewer(spec));
  return path.join(outDir, "index.html");
}

module.exports = { renderViewer, writeViewer };
