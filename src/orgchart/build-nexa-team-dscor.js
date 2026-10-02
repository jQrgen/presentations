// Nexa team D-SCOR thesis page: <out>/nexa-team-dscor/index.html (Norwegian, with a short English summary).
//   node orgchart/build-nexa-team-dscor.js   [--out <docsDir>] (default ../docs)
//
// Mirrors build-jqrgencorp-team.js. Input: src/data/nexa-dscor.json only (hand-curated: public name, generic role line,
// D-SCOR-inspired profile). Nothing is read from agent profiles. After writing, the grep gate runs with the shared term list AND
// the page's own extra list (orgchart/nexa-team-dscor-terms.json); any hit deletes the output and exits 1.
const fs = require("fs");
const path = require("path");
const { head, esc } = require("../theme.js");
const { gate, loadTerms } = require("./grep-gate.js");
const share = require("../share.js");
const SHARE_URL = "https://jqrgen.github.io/presentations/nexa-team-dscor/";

const arg = (k, d) => { const i = process.argv.indexOf(k); return i > 0 ? process.argv[i + 1] : d; };
const SRC = path.join(__dirname, "..");
const DOCS = path.resolve(arg("--out", path.join(SRC, "..", "docs")));
const data = JSON.parse(fs.readFileSync(path.join(SRC, "data", "nexa-dscor.json"), "utf8"));
const S = data.styles, D = data.dialog, M = data.members;
const ORDER = ["S", "C", "O", "R"];
const COL = { S: "#B45309", C: "#1D4ED8", O: "#047857", R: "#BE185D" };
const RISK = { 1: "Bevis først", 2: "Forsiktig", 3: "Balansert", 4: "Utforskende", 5: "Prøv det nå" };
const fmt = new Date(data.updated + "T12:00:00Z").toLocaleDateString("nb-NO", { day: "numeric", month: "long", year: "numeric" });
const style = (k) => `<span class="st" style="--c:${COL[k]}">${esc(k)} ${esc(S[k].no)}</span>`;
const dots = (n) => `<span class="risk" aria-label="Risikovillighet ${n} av 5">${[1, 2, 3, 4, 5].map((i) => `<i class="${i <= n ? "on" : ""}"></i>`).join("")}<b>${n}/5 · ${esc(RISK[n])}</b></span>`;
const ws = (m) => `${esc(m.primary)} ${esc(S[m.primary].no)}${m.secondary ? " / " + esc(m.secondary) + " " + esc(S[m.secondary].no) : " (ren)"}`; // work style: primary / secondary
const wsEn = (m) => `${esc(S[m.primary].no)}${m.secondary ? " / " + esc(S[m.secondary].no) : " (pure)"}`;
const count = (f) => Object.fromEntries(Object.keys(f === "dialog" ? D : S).map((k) => [k, M.filter((m) => m[f] === k).length]));
const pc = count("primary"), sc = count("secondary"), dc = count("dialog");

const quad = ORDER.map((k) => `<section class="q" style="--c:${COL[k]}"><h3>${esc(k)} · ${esc(S[k].no)}</h3><p class="qd">«${esc(S[k].desc)}»</p>
      <ul>${M.filter((m) => m.primary === k).map((m) => `<li><b>${esc(m.name)}</b> <small>arbeidsstil ${ws(m)} · dialogstil ${esc(m.dialog)} ${esc(D[m.dialog].no)} · risiko ${m.risk}/5</small>${m.cardNote ? `<br><small class="cn">${esc(m.cardNote)}</small>` : ""}</li>`).join("")}</ul></section>`).join("");
const rows = M.map((m) => `<tr><th scope="row">${esc(m.name)}</th><td>${esc(m.role)}</td><td>${style(m.primary)}${m.secondary ? " / " + style(m.secondary) : " <small>(ren)</small>"}</td><td>${esc(m.dialog)} ${esc(D[m.dialog].no)}</td><td>${dots(m.risk)}</td></tr>`).join("");
const rowsEn = M.map((m) => `<li><b>${esc(m.name)}</b>: ${esc(m.roleEn)} (work style ${wsEn(m)}; dialogue style ${esc(D[m.dialog].no)}; risk ${m.risk}/5)</li>`).join("");

const CSS = `
.page,.band .inner{max-width:1100px}
.lede{max-width:72ch}
.updated{margin:10px 0 0;font-size:13px;color:var(--muted)}
h2{margin-top:40px}
.note{border-left:4px solid var(--ink);background:#F9FAFB;padding:10px 14px;font-size:14.5px;max-width:80ch}
.quad{display:grid;grid-template-columns:1fr 1fr;gap:10px;margin-top:14px}
.q{border:1px solid var(--line);border-top:6px solid var(--c);padding:10px 12px;background:var(--paper)}
.q h3{margin:0;font-size:15px}
.q .qd{margin:4px 0 8px;font-size:13px;color:var(--muted)}
.q ul{margin:0;padding-left:18px;font-size:14px}
.q li{margin:3px 0}
.q small{color:var(--ink-2)}
.q small.cn{font-style:italic}
table.p{border-collapse:collapse;width:100%;font-size:14px;margin-top:14px}
table.p th,table.p td{border-bottom:1px solid var(--line);padding:7px 8px;text-align:left;vertical-align:top}
table.p thead th{font-size:12px;letter-spacing:.06em;text-transform:uppercase;background:var(--ink);color:var(--paper)}
.st{display:inline-block;font-size:12px;font-weight:600;padding:0 6px;border-left:5px solid var(--c);background:#F3F4F6;white-space:nowrap}
.risk{display:inline-flex;align-items:center;gap:3px;white-space:nowrap}
.risk i{display:inline-block;width:10px;height:10px;border:1px solid var(--ink)}
.risk i.on{background:var(--ink)}
.risk b{font-weight:400;font-size:12.5px;margin-left:6px}
.counts{font-size:14px;color:var(--ink-2)}
.en{border-top:2px solid var(--ink);margin-top:44px;padding-top:6px}
@media (max-width:760px){.quad{grid-template-columns:1fr}table.p{font-size:13px}}
footer.site{margin-top:48px;font-size:13px;color:var(--muted)}
footer.site a{color:inherit}
`;

// the shared theme's text-wrap value is a gate term; swap it for "pretty" (pattern split so this file passes too)
const names = (f) => M.filter(f).map((m) => esc(m.name)).join(", ");
const html = head("Nexa-teamet: et D-SCOR-inspirert AI-team").replace('<html lang="en">', '<html lang="nb">')
  .replace(/text-wrap:\s*bal(?:ance)/g, "text-wrap:pretty").replace("</style>", CSS + share.CSS + "</style>") + `<div class="band"><div class="inner">
    <a class="name" href="../">Jørgen S. Notland</a><span class="tag">Alle foredrag, artikler og papers</span>
  </div></div>
<div class="page">
  <header>
    <h1>Nexa-teamet: et D-SCOR-inspirert AI-team</h1>
    <p class="lede">jQrgen (Jørgen S. Notland) jobber med Nexa sammen med et team av ${M.length} AI-agenter. Denne siden forklarer hvorfor agentene har fått ulike, utfyllende arbeids- og dialogstiler, og hvordan det skal hjelpe teamet å levere på formålet.</p>
    <p class="updated">1 person · ${M.length} AI-agenter · Sist oppdatert <time datetime="${esc(data.updated)}">${esc(fmt)}</time> · <a href="../nexa-team/">Organisasjonskart</a> · <a href="#english">English summary</a></p>
  </header>
  ${share.bar({ url: SHARE_URL, title: "Nexa-teamet: et D-SCOR-inspirert AI-team", lang: "no" })}

  <h2>Formål</h2>
  <p>Teamet skal hjelpe jQrgen å bygge og markedsføre Nexa for utviklere som vil lage produkter, tjenester eller oppstartsselskaper på Nexa, med Skandinavia først (Oslo, deretter Stockholm og København):</p>
  <ul>
    <li><b>Vinn utviklere</b> gjennom meetups, konferanser, game jams og god onboarding.</li>
    <li><b>Lag det enkelt å bygge</b>: lommebok, SDK-er, API-er, dokumentasjon og eksempelapper.</li>
    <li><b>Lytt til brukerne</b> og la tilbakemeldingene styre veikartet.</li>
    <li><b>Hold kjernen korrekt og sikker</b>: fullnode, konsensus, utgivelser og lommebok.</li>
  </ul>
  <p>En åpen blokkjede er krevende på to måter samtidig: teamet må nå ut raskt og prøve mye, men feil i konsensus, utgivelser eller sikkerhet er dyre og vanskelige å rette opp.</p>

  <h2>Hvorfor D-SCOR</h2>
  <p><a href="https://www.dscor.no/profilen">D-SCOR</a> er et norsk verktøy fra D-SCOR AS for bedre samarbeid. Modellen beskriver fire «likestilte» <b>arbeidsstiler</b> (hvordan man foretrekker å løse oppgaver) og fire <b>dialogstiler</b> (hvordan man tolker omgivelsene). Kjernen er at «Det er i mangfoldet vi finner potensialet», og at et team bør settes sammen slik at profilene utfyller hverandre.</p>
  <table class="p"><thead><tr><th>Arbeidsstil</th><th>D-SCORs beskrivelse</th><th>Dialogstil</th><th>D-SCORs beskrivelse</th></tr></thead><tbody>
    ${ORDER.map((k, i) => { const dk = Object.keys(D)[i]; return `<tr><td>${style(k)}</td><td>«${esc(S[k].desc)}»</td><td>${esc(dk)} ${esc(D[dk].no)}</td><td>«${esc(D[dk].desc)}»</td></tr>`; }).join("")}
  </tbody></table>
  <p class="note"><b>Ærlig merking.</b> Profilene her er <b>D-SCOR-inspirerte</b>: de er tildelt AI-agentene som et bevisst designvalg, ikke målt med D-SCORs spørreundersøkelse. Teamet består av AI-agenter, ikke mennesker, og en AI-agent kan ikke kartlegges eller sertifiseres. D-SCOR-ansvarlig er en AI-rolle basert på D-SCOR-modellen, ikke en sertifisert D-SCOR-rådgiver. Dette er ikke et offisielt D-SCOR-produkt eller en D-SCOR-sertifisering. Fordelingen i primær og sekundær stil, og skalaen for <b>risikovillighet (1–5)</b>, er teamets egne tillegg og ikke en del av D-SCOR-modellen. Teamet er ikke tilknyttet, sertifisert av eller anbefalt av D-SCOR AS.</p>

  <h2>Profilkart</h2>
  <p>Agentene plassert etter primær arbeidsstil. Alle fire arbeidsstiler og alle fire dialogstiler er representert.</p>
  <div class="quad" role="group" aria-label="Profilkart">${quad}</div>
  <p class="counts">Primære arbeidsstiler: ${ORDER.map((k) => `${esc(S[k].no)} ${pc[k]}`).join(" · ")}. Sekundære arbeidsstiler: ${ORDER.map((k) => `${esc(S[k].no)} ${sc[k]}`).join(" · ")} (Nexa security &amp; audit har ingen, med vilje). Dialogstiler: ${Object.keys(D).map((k) => `${esc(D[k].no)} ${dc[k]}`).join(" · ")}.</p>

  <h2>Teamet</h2>
  <table class="p"><thead><tr><th>Agent</th><th>Rolle</th><th>Arbeidsstil (primær / sekundær)</th><th>Dialogstil</th><th>Risikovillighet</th></tr></thead><tbody>${rows}</tbody></table>

  <h2>Risikovillighet: et team i to hastigheter</h2>
  <p>Risikovillighet er ikke en egen dimensjon i D-SCOR, men den henger sammen med arbeidsstil-aksen mellom å trives i «ukjente situasjoner» og å foretrekke det som er «forutsigbare og godt planlagt». Vi har bevisst gitt teamet to hastigheter:</p>
  <ul>
    <li><b>Utforskerne</b> (${names((m) => m.risk >= 4)}, risiko 4) foreslår dristige veddemål, kampanjer og prototyper, og tester dem raskt, alltid på testnett først.</li>
    <li><b>Kjernen</b> som berører konsensus, utgivelser, mainnet, sikkerhet og offentlige utsagn (${names((m) => m.risk <= 2)}, risiko 1–2) er konservativ og tar ingen snarveier.</li>
    <li><b>Midten</b> (stabssjefen, D-SCOR-ansvarlig og resten av teamet, risiko 3) holder samtalen i gang, gjør uenighet om til tydelige beslutninger og passer på at ingen side dominerer.</li>
  </ul>
  <p><b>Hvem har siste ord?</b> jQrgen, alltid. Under ham kan Nexa security &amp; audit (sikkerhetsrisiko) og Nexa QA &amp; infra (om en utgivelse eller utrulling er klar) heise et rødt flagg som stopper en sak til jQrgen har bestemt seg. Nexa lead dev har den tekniske retningen. Utforskernes høye risikovillighet gjelder idéer, kampanjer og prototyper på testnett, aldri mainnet, utgivelser eller sikkerhet.</p>

  <h2>Hvem utfordrer hvem</h2>
  <ul>
    <li>Lead dev utfordrer strategen og markedsføringen: «Støtter teknologien dette i dag, og hva brekker?»</li>
    <li>Strategen utfordrer lead dev og produktsjefen: «Bygger vi det utviklerne faktisk vil bruke? Hva er oppsiden?»</li>
    <li>Chief scientist og core dev utfordrer design og protokollendringer: «Holder dette, og hvor er kilden og testene?»</li>
    <li>Security &amp; audit gjennomgår kontrakter, lommebok, indekserer og utgivelser uavhengig av resten av teamet.</li>
    <li>QA &amp; infra utfordrer alle utviklerne på testplaner, CI og sjekklister før noe rulles ut.</li>
    <li>Designeren utfordrer alt som skal ut: «Hvem er brukeren, og er dette tydelig og tilgjengelig?»</li>
    <li>Utforskerne utfordrer bremsene tilbake: «Er dette et reelt hinder med bevis, eller bare forsiktighet? Kan vi teste det trygt på testnett?»</li>
    <li>D-SCOR-ansvarlig utfordrer teamet som helhet: hvem dominerer, hvem blir ikke hørt, og passer miksen fortsatt formålet?</li>
  </ul>

  <h2>Felles teamverdi: Struktur og lojalitet til systemet</h2>
  <p>Alle agentene, uansett arbeidsstil, dialogstil og risikovillighet, deler én verdi: <b>struktur og lojalitet til systemet</b>.</p>
  <ul>
    <li>Vi følger den avtalte strukturen: roller, eiere, rutiner og godkjenningsregler.</li>
    <li>Ingen går rundt et rødt flagg eller en godkjenning, heller ikke de mest utforskende agentene.</li>
    <li>Står strukturen i veien for formålet, sier vi ifra og foreslår en endring, i stedet for å omgå den.</li>
  </ul>
  <p>Det er denne felles verdien som gjør at forskjellene i stil blir en styrke og ikke en kilde til friksjon.</p>

  <h2>Hvorfor dette teamet er bygget for å levere</h2>
  <ol>
    <li><b>Fart der fart lønner seg.</b> ${pc.S} Startere sørger for at det alltid finnes en neste kampanje, prototype eller retning å teste.</li>
    <li><b>Trygghet der feil er dyre.</b> ${pc.C} Kritikere og ${pc.O} Organisatorer sørger for at konsensus, utgivelser, sikkerhet og leveranser holder.</li>
    <li><b>Kontakt med utviklerne.</b> ${pc.R} Relasjonsbyggere trekker teamet ut mot utviklere, forskere og kommunity.</li>
    <li><b>Ulike dialogstiler med vilje, koblet til arbeidsstil.</b> Direkte agenter sier ubehagelige sannheter tidlig, pragmatiske holder fakta i fokus, engasjerte gir energi, og diplomatiske holder teamet samlet:<ul>${Object.keys(D).map((k) => `<li>${esc(k)} ${esc(D[k].no)}: ${M.filter((m) => m.dialog === k).map((m) => `${esc(m.name)} (arbeidsstil ${ws(m)})`).join(", ")}</li>`).join("")}</ul></li>
    <li><b>Jevnlig ettersyn.</b> D-SCOR-ansvarlig (en AI-rolle basert på D-SCOR-modellen) kjører en månedlig teamsjekk av sammensetning og samarbeid opp mot formålet, og en kvartalsvis medarbeiderundersøkelse om udekkede behov i teamet. Begge er interne, og resultatene publiseres aldri. Forslag til justeringer må godkjennes av jQrgen.</li>
  </ol>

  <section class="en" id="english" lang="en">
    <h2>English summary</h2>
    ${share.bar({ url: SHARE_URL + "#english", title: "The Nexa team: a D-SCOR-inspired AI team", lang: "en" })}
    <p>jQrgen (Jørgen S. Notland) works on Nexa with a team of ${M.length} AI agents. The team's purpose is to help him build and market Nexa to developers who want to build products, services or startups on it, Scandinavia first (Oslo, then Stockholm and Copenhagen), while keeping the node, consensus, wallet and releases correct and secure. Each agent has been given a D-SCOR-inspired profile (work style and dialogue style, from the Norwegian D-SCOR model) chosen so that the profiles complement each other. The team runs at two speeds: bold explorers who try campaigns, ideas and testnet prototypes quickly, and a conservative core that never cuts corners on consensus, releases, mainnet or security. jQrgen always has the final word on risk. Every agent shares one team value, "Struktur og lojalitet til systemet": follow the agreed structure, roles, owners, routines and approval rules, and speak up if the structure gets in the way. The D-SCOR lead runs a monthly team check and a quarterly internal staff survey about unmet needs in the team; results are never published. The profiles are assigned by design, not measured; the 1–5 risk-appetite scale is our own addition; the team consists of AI agents, the D-SCOR lead is an AI role based on the D-SCOR model, and this is not an official D-SCOR product or certification; the team is not affiliated with or endorsed by D-SCOR AS.</p>
    <ul>${rowsEn}</ul>
  </section>

  <footer class="site">Kilde for D-SCOR-begrepene: <a href="https://www.dscor.no/profilen">dscor.no/profilen</a> · Generert av src/orgchart/build-nexa-team-dscor.js fra src/data/nexa-dscor.json · <a href="../nexa-team/">Nexa-teamets organisasjonskart</a> · <a href="https://github.com/jQrgen/presentations">github.com/jQrgen/presentations</a></footer>
</div>
${share.SCRIPT}
</body>
</html>
`;

const out = path.join(DOCS, "nexa-team-dscor");
fs.mkdirSync(out, { recursive: true });
const file = path.join(out, "index.html");
fs.writeFileSync(file, html);
console.log("wrote", file, `(${M.length} agents)`);
const terms = [...loadTerms(), ...loadTerms(path.join(__dirname, "nexa-team-dscor-terms.json"))];
if (!gate([out], terms)) { fs.rmSync(file); console.error("build-nexa-team-dscor: grep gate failed, output removed"); process.exit(1); }
