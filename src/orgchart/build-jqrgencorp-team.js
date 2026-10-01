// jQrgenCorp D-SCOR thesis page: <out>/jqrgencorp-team/index.html (Norwegian, with a short English summary).
//   node orgchart/build-jqrgencorp-team.js   [--out <docsDir>] (default ../docs)
//
// Input: src/data/jqrgencorp-dscor.json only (hand-curated: public name, generic role line, D-SCOR-inspired profile).
// Nothing is read from agent profiles. After writing, the grep gate runs with the shared term list AND the page's own
// extra list (orgchart/jqrgencorp-team-terms.json); any hit deletes the output and exits 1.
const fs = require("fs");
const path = require("path");
const { head, esc } = require("../theme.js");
const { gate, loadTerms } = require("./grep-gate.js");

const arg = (k, d) => { const i = process.argv.indexOf(k); return i > 0 ? process.argv[i + 1] : d; };
const SRC = path.join(__dirname, "..");
const DOCS = path.resolve(arg("--out", path.join(SRC, "..", "docs")));
const data = JSON.parse(fs.readFileSync(path.join(SRC, "data", "jqrgencorp-dscor.json"), "utf8"));
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
const html = head("jQrgenCorp: et D-SCOR-inspirert AI-team").replace('<html lang="en">', '<html lang="nb">')
  .replace(/text-wrap:\s*bal(?:ance)/g, "text-wrap:pretty").replace("</style>", CSS + "</style>") + `<div class="band"><div class="inner">
    <a class="name" href="../">Jørgen S. Notland</a><span class="tag">Alle foredrag, artikler og papers</span>
  </div></div>
<div class="page">
  <header>
    <h1>jQrgenCorp: et D-SCOR-inspirert AI-team</h1>
    <p class="lede">jQrgenCorp er jQrgens (Jørgen S. Notland) selskap. Teamet består av én person, jQrgen, og ${M.length} AI-agenter. Denne siden forklarer hvorfor agentene har fått ulike, utfyllende arbeids- og dialogstiler, og hvordan det skal hjelpe teamet å levere på formålet.</p>
    <p class="updated">1 person · ${M.length} AI-agenter · Sist oppdatert <time datetime="${esc(data.updated)}">${esc(fmt)}</time> · <a href="#english">English summary</a></p>
  </header>

  <h2>Formål</h2>
  <p>jQrgenCorp skal grunnlegge finansielle tjenester i Norge og Europa, særlig blokkjedebaserte. Vi leter etter produkt–marked-match med metodene Y Combinator står for:</p>
  <ul>
    <li><b>Snakk med brukerne</b> før og mens vi bygger.</li>
    <li><b>Lanser raskt</b> og lær av ekte bruk, ikke av planer.</li>
    <li><b>Gjør ting som ikke skalerer</b> i starten, for å forstå behovet.</li>
    <li><b>Mål retensjon og vekst</b>, ikke bare aktivitet.</li>
    <li><b>Hold selskapet «default alive»</b>: utgiftene skal tåle at det tar tid å finne match.</li>
  </ul>
  <p>Finansielle tjenester er regulerte. Derfor må et lite team kunne to ting samtidig: eksperimentere dristig og raskt, og samtidig aldri ta snarveier på regelverk, penger og regnskap.</p>

  <h2>Hvorfor D-SCOR</h2>
  <p><a href="https://www.dscor.no/profilen">D-SCOR</a> er et norsk verktøy fra D-SCOR AS for bedre samarbeid. Modellen beskriver fire «likestilte» <b>arbeidsstiler</b> (hvordan man foretrekker å løse oppgaver) og fire <b>dialogstiler</b> (hvordan man tolker omgivelsene). Kjernen er at «Det er i mangfoldet vi finner potensialet», og at et team bør settes sammen slik at profilene utfyller hverandre.</p>
  <table class="p"><thead><tr><th>Arbeidsstil</th><th>D-SCORs beskrivelse</th><th>Dialogstil</th><th>D-SCORs beskrivelse</th></tr></thead><tbody>
    ${ORDER.map((k, i) => { const dk = Object.keys(D)[i]; return `<tr><td>${style(k)}</td><td>«${esc(S[k].desc)}»</td><td>${esc(dk)} ${esc(D[dk].no)}</td><td>«${esc(D[dk].desc)}»</td></tr>`; }).join("")}
  </tbody></table>
  <p class="note"><b>Ærlig merking.</b> Profilene her er <b>D-SCOR-inspirerte</b>: de er tildelt AI-agentene som et bevisst designvalg, ikke målt med D-SCORs spørreundersøkelse. Teamet består av AI-agenter, ikke mennesker, og en AI-agent kan ikke kartlegges eller sertifiseres. D-SCOR-ansvarlig er en AI-rolle basert på D-SCOR-modellen, ikke en sertifisert D-SCOR-rådgiver. Dette er ikke et offisielt D-SCOR-produkt eller en D-SCOR-sertifisering. Fordelingen i primær og sekundær stil, og skalaen for <b>risikovillighet (1–5)</b>, er jQrgenCorps egne tillegg og ikke en del av D-SCOR-modellen. jQrgenCorp er ikke tilknyttet, sertifisert av eller anbefalt av D-SCOR AS.</p>

  <h2>Profilkart</h2>
  <p>Agentene plassert etter primær arbeidsstil. Alle fire arbeidsstiler og alle fire dialogstiler er representert.</p>
  <div class="quad" role="group" aria-label="Profilkart">${quad}</div>
  <p class="counts">Primære arbeidsstiler: ${ORDER.map((k) => `${esc(S[k].no)} ${pc[k]}`).join(" · ")}. Sekundære arbeidsstiler: ${ORDER.map((k) => `${esc(S[k].no)} ${sc[k]}`).join(" · ")} (revisor har ingen, med vilje). Dialogstiler: ${Object.keys(D).map((k) => `${esc(D[k].no)} ${dc[k]}`).join(" · ")}.</p>

  <h2>Teamet</h2>
  <table class="p"><thead><tr><th>Agent</th><th>Rolle</th><th>Arbeidsstil (primær / sekundær)</th><th>Dialogstil</th><th>Risikovillighet</th></tr></thead><tbody>${rows}</tbody></table>

  <h2>Risikovillighet: et team i to hastigheter</h2>
  <p>Risikovillighet er ikke en egen dimensjon i D-SCOR, men den henger sammen med arbeidsstil-aksen mellom å trives i «ukjente situasjoner» og å foretrekke det som er «forutsigbare og godt planlagt». Vi har bevisst gitt teamet to hastigheter:</p>
  <ul>
    <li><b>Utforskerne</b> (strategist og forretningsutvikler, Starter, risiko 4) foreslår dristige veddemål og tester dem raskt og billig, med tydelige stoppkriterier.</li>
    <li><b>Kjernen</b> som berører penger, regnskap og regelverk (CFO, tax &amp; compliance, accountant og revisor, risiko 1–2) er konservativ og tar ingen snarveier.</li>
    <li><b>Limet</b> (stabssjef og D-SCOR-ansvarlig, risiko 3) holder samtalen i gang, gjør uenighet om til tydelige beslutninger og passer på at ingen side dominerer.</li>
  </ul>
  <p><b>Hvem har siste ord?</b> jQrgen, alltid. Under ham kan tax &amp; compliance (regulatorisk risiko) og CFO (økonomisk risiko) heise et rødt flagg som stopper en sak til jQrgen har bestemt seg. Revisoren rapporterer uavhengig direkte til jQrgen. Utforskernes høye risikovillighet gjelder idéer og eksperimenter, aldri penger eller regelverk.</p>

  <h2>Hvem utfordrer hvem</h2>
  <ul>
    <li>Forretningsutvikleren utfordrer strategen: «Hva er bevisene, og hva er den billigste testen som kan drepe idéen?»</li>
    <li>Strategen utfordrer forretningsutvikleren og CFO: «Tester vi for smått til å lære noe? Hva er oppsiden?»</li>
    <li>CFO utfordrer utforskerne på kostnad og tid per eksperiment, og på om vi fortsatt er «default alive».</li>
    <li>Tax &amp; compliance gjør regulatorisk forhåndssjekk før noe møter brukere, og foreslår lovlige måter å teste på.</li>
    <li>Utforskerne utfordrer bremsene tilbake: «Er dette et reelt hinder med kilde, eller bare forsiktighet?»</li>
    <li>Revisoren utfordrer regnskapet og kontrollene, uavhengig av resten av teamet.</li>
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
    <li><b>Fart der fart lønner seg.</b> To Startere sørger for at det alltid finnes et neste eksperiment, i tråd med «lanser raskt».</li>
    <li><b>Trygghet der feil er dyre.</b> Tre Kritikere og tre Organisatorer sørger for at regelverk, penger og regnskap holder, noe et regulert finansselskap ikke kan klare seg uten.</li>
    <li><b>Kontakt med brukerne.</b> Relasjonsbygger-trekk hos strategen, stabssjefen og admin trekker teamet ut mot brukere og partnere.</li>
    <li><b>Ulike dialogstiler med vilje, koblet til arbeidsstil.</b> Direkte agenter sier ubehagelige sannheter tidlig, pragmatiske holder fakta i fokus, engasjerte gir energi, og diplomatiske holder teamet samlet:<ul>${Object.keys(D).map((k) => `<li>${esc(k)} ${esc(D[k].no)}: ${M.filter((m) => m.dialog === k).map((m) => `${esc(m.name)} (arbeidsstil ${ws(m)})`).join(", ")}</li>`).join("")}</ul></li>
    <li><b>Jevnlig ettersyn.</b> D-SCOR-ansvarlig (en AI-rolle basert på D-SCOR-modellen) kjører en månedlig teamsjekk av sammensetning og samarbeid opp mot formålet, og en kvartalsvis medarbeiderundersøkelse om udekkede behov i teamet. Begge er interne, og resultatene publiseres aldri. Forslag til justeringer må godkjennes av jQrgen.</li>
  </ol>

  <section class="en" id="english" lang="en">
    <h2>English summary</h2>
    <p>jQrgenCorp is jQrgen's (Jørgen S. Notland) company. Its purpose is to found financial services in Norway and Europe, especially blockchain-based ones, finding product-market fit with Y Combinator methods: talk to users, launch fast, do things that don't scale, measure retention and growth, and stay default alive. The team is one person and ${M.length} AI agents. Each agent has been given a D-SCOR-inspired profile (work style and dialogue style, from the Norwegian D-SCOR model) chosen so that the profiles complement each other. The team runs at two speeds: bold explorers who test ideas fast and cheaply, and a conservative core that never cuts corners on money, books or regulation. jQrgen always has the final word on risk. Every agent shares one team value, "Struktur og lojalitet til systemet": follow the agreed structure, roles, owners, routines and approval rules, and speak up if the structure gets in the way. The D-SCOR lead runs a monthly team check and a quarterly internal staff survey about unmet needs in the team; results are never published. The profiles are assigned by design, not measured; the 1–5 risk-appetite scale is our own addition; the team consists of AI agents, the D-SCOR lead is an AI role based on the D-SCOR model, and this is not an official D-SCOR product or certification; jQrgenCorp is not affiliated with or endorsed by D-SCOR AS.</p>
    <ul>${rowsEn}</ul>
  </section>

  <footer class="site">Kilde for D-SCOR-begrepene: <a href="https://www.dscor.no/profilen">dscor.no/profilen</a> · Generert av src/orgchart/build-jqrgencorp-team.js fra src/data/jqrgencorp-dscor.json · <a href="https://github.com/jQrgen/presentations">github.com/jQrgen/presentations</a></footer>
</div>
</body>
</html>
`;

const out = path.join(DOCS, "jqrgencorp-team");
fs.mkdirSync(out, { recursive: true });
const file = path.join(out, "index.html");
fs.writeFileSync(file, html);
console.log("wrote", file, `(${M.length} agents)`);
const terms = [...loadTerms(), ...loadTerms(path.join(__dirname, "jqrgencorp-team-terms.json"))];
if (!gate([out], terms)) { fs.rmSync(file); console.error("build-jqrgencorp-team: grep gate failed, output removed"); process.exit(1); }
