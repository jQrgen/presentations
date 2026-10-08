// DRAFT article (NO/EN toggle): "Nexa-Børs" - could Oslo Børs run shares as Nexa tokens and still follow Norwegian rules?
//   node build-oslo-bors-nexa.js   [--out <docsDir>] (default ../docs)   [--final]  (drops the DRAFT banner and noindex)
// Writes <out>/oslo-bors-nexa/index.html. Hand-written text only. After writing, the term gate (oslo-bors-nexa-terms.json)
// runs on the output; a hit deletes the output and exits 1. Not part of any publish script: publishing needs jQrgen's approval.
const fs = require("fs");
const path = require("path");
const { head, esc } = require("./theme.js");
const share = require("./share.js");
const { gate, loadTerms } = require("./orgchart/grep-gate.js");

const arg = (k, d) => { const i = process.argv.indexOf(k); return i > 0 ? process.argv[i + 1] : d; };
const FINAL = process.argv.includes("--final");
const DOCS = path.resolve(arg("--out", path.join(__dirname, "..", "docs")));
const URL = "https://jqrgen.github.io/presentations/oslo-bors-nexa/";
const CHECKED = "2026-10-03";
const TITLE_NO = "Nexa-Børs: kunne Oslo Børs kjørt aksjer som Nexa-tokens, og fortsatt fulgt norske regler?";
const TITLE_EN = "Nexa Exchange: could the Oslo Stock Exchange run shares as Nexa tokens and still follow Norwegian rules?";

// --- sources (shared by both languages) -----------------------------------------------------------------------
const S = {
  gt: ["Nexa spec: Group Tokenization", "https://spec.nexa.org/tokens/grouptokens/"],
  gth: ["Nexa source code: src/consensus/grouptokens.h (group and authority flags)", "https://gitlab.com/nexa/nexa/-/blob/dev/src/consensus/grouptokens.h"],
  rpc: ["Nexa RPC docs: token", "https://nexa.gitlab.io/nexa/commands/token/"],
  st: ["Nexa spec: Script Templates", "https://spec.nexa.org/addresses/scriptTemplates/"],
  ro: ["Nexa spec: Read-only transaction inputs", "https://spec.nexa.org/script/read-only-inputs/"],
  hf2: ["Nexa spec: Hard Fork 2", "https://spec.nexa.org/upgrades/hard-fork-2/"],
  vsl: ["Lovdata: verdipapirsentralloven (LOV-2019-03-15-6)", "https://lovdata.no/dokument/NL/lov/2019-03-15-6"],
  csdr: ["Finanstilsynet: CSDR", "https://www.finanstilsynet.no/tema/csdr/"],
  vps: ["Finanstilsynet, årsrapport 2022: infrastruktur på verdipapirområdet", "https://www.finanstilsynet.no/publikasjoner-og-analyser/arsrapport/arsrapport-2022/rapporter-fra-tilsynsomradene-for-2022/infrastruktur-pa-verdipapiromradet/"],
  a39: ["ESMA Interactive Single Rulebook: CSDR article 39, settlement finality", "https://www.esma.europa.eu/publications-and-data/interactive-single-rulebook/csdr/article-39-settlement-finality-0"],
  vphl: ["Lovdata: verdipapirhandelloven (LOV-2007-06-29-75), kapittel 8", "https://lovdata.no/dokument/NL/lov/2007-06-29-75"],
  dltno: ["Regjeringen.no: DLT-forordningen trer i kraft 1. august 2024", "https://www.regjeringen.no/no/aktuelt/endringer-i-verdipapirhandelloven-verdipapirfondloven-aif-loven-og-verdipapirsentralloven/id3046643/"],
  dlt: ["Forordning (EU) 2022/858, norsk tekst (Lovdata)", "https://lovdata.no/static/NLX3/32022r0858.pdf"],
  dlten: ["Regulation (EU) 2022/858 (EUR-Lex)", "https://eur-lex.europa.eu/eli/reg/2022/858/oj"],
  esma: ["ESMA: DLT Pilot Regime", "https://www.esma.europa.eu/esmas-activities/digital-finance-and-innovation/dlt-pilot-regime"],
  esmal: ["ESMA: List of authorised DLT market infrastructures (file dated January 2026)", "https://www.esma.europa.eu/sites/default/files/2026-01/Authorised_DLT_Market_Infrastructures.pdf"],
  enx: ["Euronext: Choosing a market", "https://www.euronext.com/en/listing/raise-capital/how-go-public/choosing-market"],
  asal: ["Lovdata: allmennaksjeloven kapittel 4 II, aksjeeierregisteret (§ 4-4)", "https://lovdata.no/dokument/NL/lov/1997-06-13-45/KAPITTEL_4-2"],
  bsl: ["Lovdata: betalingssystemloven kapittel 4 (endelig oppgjør)", "https://lovdata.no/dokument/NL/lov/1999-12-17-95/kap4"],
  mica: ["Finanstilsynet: kryptoeiendelsloven (MiCA)", "https://www.finanstilsynet.no/tema/kryptoeiendeler-mica/"],
  hvit: ["Lovdata: hvitvaskingsloven (LOV-2018-06-01-23) § 4", "https://lovdata.no/dokument/NL/lov/2018-06-01-23"],
  sbx: ["Finanstilsynet: regulatorisk sandkasse", "https://www.finanstilsynet.no/tema/fintech/finanstilsynets-regulatoriske-sandkasse/"],
  enxm: ["Euronext: monthly cash market statistics, August 2026 (sheet SM - Oslo, Number of trades - Total, single counted)", "https://live.euronext.com/sites/default/files/statistics/cash/monthly/Cash%20202608.xlsx"],
  enxd: ["Euronext: daily cash market statistics, 23 March 2026 (sheet Oslo, total trades)", "https://live.euronext.com/sites/default/files/statistics/cash/nextday/2017/Cash%2020260323.xlsx"],
  hrs: ["Pareto Securities: Børsenes åpningstider (Oslo Børs, kontinuerlig handel 09:00-16:20)", "https://paretosec.no/aksjehandel-pa-nett/annet/borsenes-apningstider"],
  optiq: ["Euronext: Euronext introduces Optiq, new technology platform (July 2018)", "https://www.euronext.com/en/investor-relations/financial-information/news/euronext-introduces-optiqr-new-technology-platform"],
  abs: ["Nexa spec: Design and operation of the adaptive blocksize feature", "https://spec.nexa.org/blocks/adaptive-blocksize/"],
  tail: ["Nexa spec: Tailstorm", "https://spec.nexa.org/blocks/tailstorm/"],
  scal: ["Nexa: Nexa's scaling strategy, how we enable over 100,000 TPS", "https://nexa.org/articles-database/nexas-scaling-strategy-how-we-enable-over-100000tps"],
  feat: ["Nexa: Features", "https://nexa.org/features"],
  expl: ["Nexa Explorer: Transaction Stats (Tx Rate, 24hr)", "https://explorer.nexa.org/tx-stats"],
  capd: ["Nexa spec: Counterparty and Protocol Discovery (CAPD)", "https://spec.nexa.org/network/capd/"],
  capdsrc: ["Nexa source code: src/capd/capd.h (CAPD message pool)", "https://gitlab.com/nexa/nexa/-/blob/dev/src/capd/capd.h"],
  m25: ["ESMA Interactive Single Rulebook: MiFIR article 25, obligation to maintain records", "https://www.esma.europa.eu/publications-and-data/interactive-single-rulebook/mifir/article-25-obligation-maintain-records"],
  rts25: ["European Commission: RTS 25 on the accuracy of business clocks, Delegated Regulation (EU) 2017/574", "https://ec.europa.eu/finance/securities/docs/isd/mifid/rts/160607-rts-25-annex_en.pdf"],
  m27: ["ESMA Interactive Single Rulebook: MiFID II article 27, best execution", "https://www.esma.europa.eu/publications-and-data/interactive-single-rulebook/mifid-ii/article-27-obligation-execute-orders"],
  emt: ["Finanstilsynet: e-pengetoken", "https://www.finanstilsynet.no/tema/kryptoeiendeler-mica/e-pengetoken/"],
  m48: ["ESMA Interactive Single Rulebook: MiCA article 48, requirements for offers and admission to trading of e-money tokens", "https://www.esma.europa.eu/publications-and-data/interactive-single-rulebook/mica/article-48-requirements-offer-public-or"],
  m49: ["ESMA Interactive Single Rulebook: MiCA article 49, issuance and redeemability of e-money tokens", "https://www.esma.europa.eu/publications-and-data/interactive-single-rulebook/mica/article-49-issuance-and-redeemability-e"],
  m51: ["ESMA Interactive Single Rulebook: MiCA article 51, white paper for e-money tokens", "https://www.esma.europa.eu/publications-and-data/interactive-single-rulebook/mica/article-51-content-and-form-crypto-asset"],
  emtreg: ["ESMA: interim MiCA register, issuers of e-money tokens (EMTWP.csv, file last modified 30 September 2026)", "https://www.esma.europa.eu/sites/default/files/2024-12/EMTWP.csv"],
  asal4: ["Lovdata: allmennaksjeloven kapittel 4 I (§ 4-2, rett til utbytte uten innføring i registeret)", "https://lovdata.no/dokument/NL/lov/1997-06-13-45/KAPITTEL_4"],
  asal8: ["Lovdata: allmennaksjeloven kapittel 8 (§ 8-2 beslutning om utbytte, § 8-3 utbetaling)", "https://lovdata.no/dokument/NL/lov/1997-06-13-45/KAPITTEL_8"],
  rec: ["Nordnet: Når har jeg rett til utbytte?", "https://www.nordnet.no/faq/selskapshendelser/utbytte/nar-har-jeg-rett-til-utbytte"],
  vpsk: ["Euronext Securities Oslo: Hva er en VPS-konto?", "https://csdclient.vps.no/pub/investor/hva-er-en-vps-konto/"],
  vpsca: ["Euronext Securities Oslo: Corporate actions detaljer (utbytte og kildeskatt)", "https://csdclient.vps.no/pub/utsteder/corporate-actions/corporate-actions-detaljer/"],
  kst: ["Skatteetaten: Melding om kildeskatt på aksjeutbytte", "https://www.skatteetaten.no/bedrift-og-organisasjon/skatt/skattemelding-naringsdrivende/fradrag/aksjer/kildeskatt-pa-aksjeutbytte/melding-om-kildeskatt-pa-aksjeutbytte/"],
  aro: ["Skatteetaten: Aksjonærregisteroppgaven", "https://www.skatteetaten.no/bedrift-og-organisasjon/rapportering-og-bransjer/aksjonarregisteroppgaven/"],
};
const ORDER = Object.keys(S);
const ref = (k) => { const n = ORDER.indexOf(k) + 1; if (!n) throw new Error("unknown source " + k); return `<sup><a class="ref" href="#src-${k}" title="${esc(S[k][0])}">[${n}]</a></sup>`; };
const R = (...ks) => ks.map(ref).join("");
const sources = (L) => `<ol class="src">${ORDER.map((k) => `<li id="src-${k}${L === "en" ? "-en" : ""}"><a href="${esc(S[k][1])}">${esc(S[k][0])}</a></li>`).join("")}</ol>`;
// labels: Fakta = sourced fact, Min lesning = my reading, Åpent = open question, Fiksjon = fiction
const TAG = { no: { fact: "Fakta", mine: "Min lesning", open: "Åpent spørsmål", fic: "Fiksjon" }, en: { fact: "Fact", mine: "My reading", open: "Open question", fic: "Fiction" } };
const tag = (L, t) => `<span class="tag-${t}">${TAG[L][t]}</span>`;

const CSS = `
.page,.band .inner{max-width:900px}
.band .tag{color:var(--band-ink);opacity:.7;font-size:14px}
.lede{max-width:70ch;font-size:17px}
.updated{margin:10px 0 0;font-size:13px;color:var(--muted)}
h2{margin-top:40px;font-size:22px;font-weight:600}
h3{margin-top:24px;font-size:17px}
p,li{max-width:75ch}
.toggle{display:inline-flex;border:1px solid var(--line);margin:16px 0 0;background:var(--paper)}
.toggle a{padding:6px 14px;text-decoration:none;font-size:14px;font-weight:600}
.toggle a[aria-current="true"]{background:var(--band);color:var(--band-ink)}
.js .lang{display:none}
.js.show-no .lang[lang="nb"],.js.show-en .lang[lang="en"]{display:block}
.lang + .lang{border-top:2px solid var(--line);margin-top:48px;padding-top:8px}
.js .lang + .lang{border-top:0;margin-top:0;padding-top:0}
.draft{background:#FEF3C7;border:2px dashed #B45309;padding:8px 14px;margin:16px 0 0;font-weight:600;font-size:14.5px}
.disc{border:1px solid var(--line);border-left:6px solid var(--ink);background:var(--paper);padding:10px 14px;font-size:14.5px;margin:18px 0}
.legend{font-size:14px;color:var(--ink-2)}
.day{background:var(--paper);border:1px solid var(--line);padding:6px 16px 10px;margin:14px 0}
.day dt{font-weight:700;font-variant-numeric:tabular-nums;margin-top:10px}
.day dd{margin:2px 0 0}
table{border-collapse:collapse;background:var(--paper);margin:12px 0;font-size:14.5px;width:100%}
th,td{border:1px solid var(--hair);padding:6px 9px;text-align:left;vertical-align:top}
thead th{background:#F3F4F6}
.ref{text-decoration:none;font-size:11.5px}
[class^="tag-"]{display:inline-block;font-size:11px;font-weight:700;letter-spacing:.05em;text-transform:uppercase;padding:1px 6px;margin-right:6px;border:1px solid currentColor;vertical-align:1px}
.tag-fact{color:#047857}.tag-mine{color:#1D4ED8}.tag-open{color:#B45309}.tag-fic{color:#BE185D}
ol.src{font-size:14px}
ol.src li{margin:3px 0;word-break:break-word}
`;

// --- Norwegian ------------------------------------------------------------------------------------------------
const NO = `
<article class="lang" lang="nb" id="art-no">
  <header>
    <h1>${esc(TITLE_NO)}</h1>
    <p class="lede">Et tankeeksperiment med fotnoter: hva skjer hvis aksjer og obligasjoner på en norsk markedsplass blir tokens på blokkjeden Nexa, og alt fortsatt skal skje etter boka? Litt lek, mye lovtekst, og tydelig merking av hva som er fakta, hva som er min lesning og hva ingen vet ennå.</p>
    <p class="updated">Jørgen S. Notland (jQrgen) · kilder sjekket <time datetime="${CHECKED}">3. oktober 2026</time> · <a href="#en" data-l="en">English</a></p>
  </header>
  ${share.top({ url: URL, title: TITLE_NO, lang: "no" })}
  <p class="disc"><b>Ikke juridisk rådgivning.</b> Dette er en populærvitenskapelig drøfting, ikke juridisk, finansiell eller investeringsrådgivning, og ingen plan eller søknad. «Nexa-Børs» finnes ikke, og verken Oslo Børs, Euronext eller Finanstilsynet har noe med denne teksten å gjøre. Lovene endrer seg; sjekk alltid gjeldende tekst og spør en advokat.</p>
  <p class="legend">Merking: ${tag("no", "fact")} med kildehenvisning, ${tag("no", "mine")} er min egen tolkning, ${tag("no", "open")} er noe som ikke er avklart, ${tag("no", "fic")} er oppdiktet for moro skyld.</p>

  <h2>En handledag på Nexa-Børs</h2>
  <p>${tag("no", "fic")} Ingenting i denne boksen har skjedd. Det er en tenkt dag på en tenkt DLT-markedsplass.</p>
  <dl class="day">
    <dt>07:30</dt><dd>Kari åpner aksjeappen. Lommeboken hennes står allerede på mottakerlisten fordi meglerhuset har gjort kundekontrollen sin. Uten den slipper ikke tokenkontrakten aksjene inn, uansett hvor fint hun spør.</dd>
    <dt>09:00</dt><dd>Åpningsauksjon. Karis kjøpsordre har allerede fløyet ut som en liten CAPD-melding over Nexa-nettverket, utenfor blokkene. Ordrene matches av en regulert handelsplass, ikke av blokkjeden. Blokkjeden er arkivet og oppgjøret, ikke auksjonarius.</dd>
    <dt>09:00 og litt</dt><dd>Handelen gjøres opp: aksjetokens og oppgjørstokens bytter eier i samme transaksjon. Tailstorm gir en forpliktelse omtrent hvert sekund og en oppsummeringsblokk hvert annet minutt, så kaffen rekker så vidt å bli lunken.</dd>
    <dt>12:00</dt><dd>Selskapet deler ut utbytte. Ingen regneark sendes rundt: registeret tar et øyeblikksbilde av hvem som eide aksjetokens på avstemmingsdagen, og utbyttet lander som en NOK-stablecoin på Nexa rett i lommebøkene deres. Kari ser beløpet før lunsjen er spist, og kan bruke det eller løse det inn i kroner hos utstederen. (Hvordan, og hva som er uavklart, står <a href="#utbytte">lenger ned</a>.)</dd>
    <dt>14:15</dt><dd>En bruker mister telefonen og nøklene. Ingen panikk: kontoføreren har myndighet til å flytte aksjene etter en kontrollert prosess, akkurat som i dag. (Hvordan det skal se ut, er et av de åpne spørsmålene lenger ned.)</dd>
    <dt>16:25</dt><dd>Sluttauksjon. Finanstilsynet har lest det samme registeret hele dagen og fått rapportene sine. Ingen har sendt en eneste faks.</dd>
  </dl>

  <h2>Byggeklossene i Nexa</h2>
  <ul>
    <li>${tag("no", "fact")} <b>Tokens er innebygd i protokollen.</b> Hver tokentype har en gruppe-ID som står i selve transaksjonsutgangen, og nettverket sjekker at mengden inn og ut av hver gruppe stemmer, med mindre transaksjonen bruker en myndighet til å lage (mint) eller fjerne (melt) tokens.${R("gt")}</li>
    <li>${tag("no", "fact")} <b>Myndigheter («authorities») er egne utganger</b> med flagg som MINT, MELT, BATON (kan lage nye myndigheter), RESCRIPT og SUBGROUP.${R("gth", "rpc")} En myndighet kan opprettes uten rett til å lage flere myndigheter.${R("rpc")}</li>
    <li>${tag("no", "fact")} <b>Kovenanter.</b> En gruppe kan ha flagget COVENANT, som i kildekoden er beskrevet som at utgangens skriptmal må være den samme som inngangens. RESCRIPT-myndigheten kan endre denne malen.${R("gth", "rpc")} Skriptmaler er bygd for tre parter: innehaveren, den som bruker utgangen, og kovenantforfatteren.${R("st")}</li>
    <li>${tag("no", "fact")} <b>Lesbare innganger.</b> En transaksjon kan lese data fra en utgang uten å bruke den, noe spesifikasjonen nevner som nyttig for kovenanter.${R("ro")}</li>
    <li>${tag("no", "fact")} <b>Undergrupper</b> er barn av en gruppe, laget med SUBGROUP-myndigheten.${R("gth", "rpc")}</li>
    <li>${tag("no", "fact")} <b>Hard Fork 2</b> er planlagt aktivert på hovednettet 1. november 2026 (UTC). Den innfører Tailstorm, med omtrent ett sekunds forpliktelsesintervall og fortsatt to minutters oppgjørsrytme.${R("hf2")}</li>
    <li>${tag("no", "mine")} Ut fra dette kunne en aksje være en gruppe, aksjeklasser undergrupper, og kontoføreren eller verdipapirsentralen holde MINT-, MELT- og RESCRIPT-myndighetene. En kovenant kunne kreve at mottakeren står på en liste over kontrollerte kunder, eller at en registerfører signerer med. Nexa har ikke en ferdig «frys»- eller hvitlistefunksjon. Slike regler måtte skrives som skript, og det er et design, ikke noe som finnes i dag.</li>
  </ul>

  <h2>Reglene som gjelder i Norge</h2>
  <table>
    <thead><tr><th>Regel</th><th>Hva den sier (kort)</th></tr></thead>
    <tbody>
      <tr><td><b>Verdipapirsentralloven</b> (CSDR)</td><td>${tag("no", "fact")} CSDR, forordning (EU) nr. 909/2014, gjelder som norsk lov gjennom § 1-1.${R("vsl", "csdr")} Verdipapirsentralen ASA (Euronext Securities Oslo) fikk tillatelse etter CSDR i januar 2022 og tok den i bruk 1. mars 2022.${R("vps")}</td></tr>
      <tr><td><b>Endelig oppgjør</b></td><td>${tag("no", "fact")} CSDR artikkel 39: verdipapirsentralen skal definere når en overføringsordre er lagt inn og når den blir ugjenkallelig, offentliggjøre reglene om endelighet, og sørge for endelighet i sanntid eller i løpet av dagen, senest ved slutten av oppgjørsdagen. Transaksjoner mot kontanter mellom direkte deltakere skal gjøres opp som levering mot betaling.${R("a39")} Oppgjørsdirektivet (98/26/EF) er gjennomført i betalingssystemloven kapittel 4.${R("bsl")}</td></tr>
      <tr><td><b>Verdipapirhandelloven</b> (MiFID II, MiFIR)</td><td>${tag("no", "fact")} Loven regulerer handelsplasser og verdipapirforetak. Kapittel 8 gjør verdipapirmarkedsforordningen (MiFIR) og DLT-forordningen til norsk lov.${R("vphl")}</td></tr>
      <tr><td><b>DLT-pilotordningen</b> (forordning (EU) 2022/858)</td><td>${tag("no", "fact")} Gjelder i Norge gjennom verdipapirhandelloven § 8-2, i kraft fra 1. august 2024.${R("vphl", "dltno")} Den åpner for tre typer infrastruktur: DLT-basert multilateral handelsfasilitet (DLT-MHF), DLT-oppgjørssystem (DLT-OS) og en kombinasjon av de to (DLT-HOS). Bare aksjer i utstedere med markedsverdi under 500 millioner euro, obligasjoner med emisjonsstørrelse under 1 milliard euro og visse fondsandeler kan være med, og samlet markedsverdi kan ikke overstige 6 milliarder euro. En særskilt tillatelse gjelder i inntil seks år. Betalingsoppgjør skal skje i sentralbankpenger der det er praktisk mulig, ellers blant annet med «e-pengetokens». En DLT-MHF kan på vilkår gi privatpersoner direkte adgang.${R("dlt", "dlten")} Finanstilsynet gir tillatelsene, og ESMA har en koordinerende rolle.${R("esma")}</td></tr>
      <tr><td><b>Hvem har fått tillatelse?</b></td><td>${tag("no", "fact")} ESMAs liste (filen datert januar 2026, den som lenkes per 3. oktober 2026) viser seks godkjente DLT-markedsinfrastrukturer: i Tsjekkia, Tyskland (to), Litauen, Frankrike og Spania. Ingen av dem er norske.${R("esmal")}</td></tr>
      <tr><td><b>Allmennaksjeloven</b></td><td>${tag("no", "fact")} Et ASA skal ha aksjeeierregisteret sitt i en verdipapirsentral som har tillatelse eller er anerkjent etter CSDR, og registeret skal blant annet inneholde aksjeeiernes navn, fødselsdato og adresse.${R("asal")}</td></tr>
      <tr><td><b>MiCA</b></td><td>${tag("no", "fact")} Kryptoeiendelsloven (MiCA) gjelder kryptoeiendeler som ikke er dekket av annen finanslovgivning. En token som er et finansielt instrument, som en aksje, faller utenfor MiCA og under verdipapirreglene.${R("mica")}</td></tr>
      <tr><td><b>Hvitvaskingsloven</b></td><td>${tag("no", "fact")} Blant de rapporteringspliktige er verdipapirforetak, og verdipapirsentraler når de ikke bruker en ekstern kontofører som selv er rapporteringspliktig.${R("hvit")} Kundekontroll (KYC) følger altså med uansett teknologi.</td></tr>
      <tr><td><b>Finanstilsynet</b></td><td>${tag("no", "fact")} Tilsynsmyndighet for handelsplasser, verdipapirsentraler og DLT-ordningen.${R("csdr", "esma")} Den regulatoriske sandkassen tar imot søknader fortløpende. Konsesjonskravene gjelder fortsatt, men enkelte kan lempes der regelverket åpner for det, og tjenesten prøves ut på et fåtall kunder som skal vite at de er med i en sandkasse.${R("sbx")}</td></tr>
    </tbody>
  </table>

  <h2>Hvorfor ikke bare Oslo Børs, rett fram?</h2>
  <ul>
    <li>${tag("no", "fact")} Euronext driver to regulerte markeder i Oslo, Oslo Børs og Euronext Expand. Euronext Growth er en multilateral handelsfasilitet (MHF).${R("enx")}</li>
    <li>${tag("no", "fact")} DLT-pilotordningen gjelder MHF-er og oppgjørssystemer, ikke regulerte markeder, og har tak på størrelsen på utstederne.${R("dlt")}</li>
    <li>${tag("no", "mine")} Oslo Børs selv kan derfor ikke bare «bytte til Nexa» under dagens pilot, og de største selskapene er uansett for store. En realistisk vei er en egen DLT-MHF eller DLT-HOS for mindre utstedere og obligasjoner, med en verdipapirsentral som holder registeret.</li>
  </ul>

  <h2>Hva som må ha tillatelse</h2>
  <table>
    <thead><tr><th>Bit</th><th>Hva trengs</th></tr></thead>
    <tbody>
      <tr><td>Handelsplassen</td><td>${tag("no", "fact")} Et verdipapirforetak eller en markedsoperatør med tillatelse etter MiFID II, pluss særskilt tillatelse som DLT-MHF eller DLT-HOS fra Finanstilsynet.${R("dlt", "esma")}</td></tr>
      <tr><td>Registeret og oppgjøret</td><td>${tag("no", "fact")} En verdipapirsentral med særskilt tillatelse som DLT-OS, eventuelt med unntak fra enkelte CSDR-krav.${R("dlt")}</td></tr>
      <tr><td>Meglere og kundekontroll</td><td>${tag("no", "fact")} Verdipapirforetak etter verdipapirhandelloven, med plikter etter hvitvaskingsloven.${R("vphl", "hvit")}</td></tr>
      <tr><td>Kontantbenet</td><td>${tag("no", "fact")} Sentralbankpenger der det er praktisk mulig, ellers blant annet «e-pengetokens».${R("dlt")} Jeg har ikke funnet noe e-pengetoken i norske kroner i dag.${R("emtreg")} Se <a href="#utbytte">utbytteavsnittet</a>.</td></tr>
      <tr><td>Veiledning underveis</td><td>${tag("no", "mine")} Finanstilsynets sandkasse kan brukes til å avklare hvilke tillatelser som trengs og prøve ut tjenesten i liten skala.${R("sbx")}</td></tr>
    </tbody>
  </table>

  <h2 id="kapasitet">Holder kapasiteten?</h2>
  <p>Alle tall er hentet 3. oktober 2026. Kontinuerlig handel på Oslo Børs varer fra 09:00 til 16:20, altså 26 400 sekunder.${R("hrs")}</p>
  <table>
    <thead><tr><th>Hva</th><th>Tall</th></tr></thead>
    <tbody>
      <tr><td>Oslo Børs, snitt 2025</td><td>${tag("no", "fact")} 26 357 568 handler på 250 handelsdager${R("enxm")}, omtrent 4,0 handler i sekundet.</td></tr>
      <tr><td>Oslo Børs, januar–august 2026</td><td>${tag("no", "fact")} 20 928 836 handler på 166 dager${R("enxm")}, omtrent 4,8 i sekundet.</td></tr>
      <tr><td>Travleste dag jeg fant: 23. mars 2026</td><td>${tag("no", "fact")} 231 213 handler${R("enxd")}, omtrent 8,8 i sekundet i snitt over dagen. Toppene innenfor dagen er høyere.</td></tr>
      <tr><td>Ordremeldinger</td><td>${tag("no", "fact")} Euronexts plattform Optiq håndterte over 14 milliarder meldinger og 18,8 millioner handler fra 25. juni til juli 2018, alle Euronexts aksjemarkeder samlet${R("optiq")}, altså rundt 745 meldinger per handel. ${tag("no", "mine")} Brukt på Oslo blir det et grovt anslag på rundt 3 000 meldinger i sekundet i snitt, og flere på travle dager.</td></tr>
      <tr><td>Nexa i dag</td><td>${tag("no", "fact")} Blokkstørrelsen tilpasser seg bruken, men har et gulv på 100 KB per blokk, og det kommer en blokk omtrent hvert annet minutt.${R("abs")} Nexa oppgir selv at 100 000 transaksjoner i sekundet er omtrent 20 MB i sekundet, altså rundt 200 byte per transaksjon.${R("scal")} ${tag("no", "mine")} Det gir omtrent 4 transaksjoner i sekundet på gulvet, omtrent like mye som snittet på Oslo Børs og uten margin.</td></tr>
      <tr><td>Nexa etter Hard Fork 2 (1. november 2026)</td><td>${tag("no", "fact")} Gulvet blir 12 MB per to minutter, med Tailstorm-delblokker omtrent hvert sekund.${R("abs", "tail", "hf2")} ${tag("no", "mine")} Med 200 byte per transaksjon blir det rundt 500 transaksjoner i sekundet.</td></tr>
      <tr><td>Nexas mål</td><td>${tag("no", "fact")} Over 100 000 transaksjoner i sekundet er et uttalt mål${R("feat")}, ikke noe som er vist i drift.</td></tr>
      <tr><td>Faktisk bruk nå</td><td>${tag("no", "fact")} Rundt 0,01 til 0,02 transaksjoner i sekundet (24-timers snitt i utforskeren).${R("expl")}</td></tr>
    </tbody>
  </table>
  <p>${tag("no", "mine")} Etter Hard Fork 2 har Nexa på gulvet omtrent 57 ganger snittempoet på den travleste dagen jeg fant, for handler og nettet oppgjør. Forbeholdet er at en ekte levering-mot-betaling-transaksjon med aksjetoken, oppgjørstoken og kovenanter trolig er større enn 200 byte, så den reelle marginen er mindre. Ordremeldingene, rundt 3 000 i sekundet, får derimot ikke plass i blokkene. De trenger en annen kanal.</p>

  <h2 id="capd">Ordrestrømmen på CAPD i stedet for i blokkene</h2>
  <p>Nexa har en egen kanal for små meldinger som ikke skal i blokkjeden: CAPD (Counterparty and Protocol Discovery).</p>
  <ul>
    <li>${tag("no", "fact")} <b>Hva det er.</b> Spesifikasjonen beskriver CAPD som en kortvarig, desentralisert og anonym meldingstjeneste der deltakere kan finne motparter og gjennomføre protokoller med dem, og nevner handel og atomiske bytter som eksempler. Den kjører på Nexas fullnoder, mens klienter som lommebøker sender inn og søker etter meldinger.${R("capd")}</li>
    <li>${tag("no", "fact")} <b>Ikke på kjeden.</b> Meldingene ligger i et minnebasseng (msgPool) i hver node, ikke i blokker. Spesifikasjonen sier at bassenget typisk er på noen hundre MB og kan stilles inn${R("capd")}; standarden i kildekoden er 100 MB.${R("capdsrc")} Når det trengs bevis for at en melding er levert, viser spesifikasjonen til data i en vanlig transaksjon på kjeden.${R("capd")}</li>
    <li>${tag("no", "fact")} <b>Arbeidsbevis og prioritet.</b> Hver melding må ha et arbeidsbevis (proof of work) for å stoppe spam. Prioriteten regnes ut fra arbeidsbeviset, alderen og lengden: meldinger over en nominell størrelse på 100 byte får lavere prioritet i forhold til lengden, og prioriteten synker lineært til null etter omtrent ti minutter. Når bassenget er fullt, skyves meldingene med lavest prioritet ut, og hver node bestemmer selv hvilken prioritet den krever for å videresende.${R("capd")}</li>
    <li>${tag("no", "fact")} <b>Utløp og tilbaketrekking.</b> En melding kan ha et utløpstidspunkt i sekunder etter at den ble laget, og en «rescind»-hash som lar avsenderen trekke den tilbake. Spesifikasjonen anbefaler at meldinger som utløper innen fem minutter, ikke videresendes.${R("capd")}</li>
    <li>${tag("no", "fact")} <b>Filtrering.</b> De første 16 bytene i en melding kan brukes til å søke, og en klient kan be en node om å varsle hver gang en ny melding treffer søket.${R("capd")}</li>
    <li>${tag("no", "fact")} <b>Kapasitet.</b> Spesifikasjonen oppgir ingen tall for meldinger i sekundet eller forsinkelse. Den sier at alle «globale» meldinger over en viss prioritet sendes til alle noder, og at deling av meldingene mellom noder (sharding) ikke er implementert.${R("capd")}</li>
  </ul>
  <p>${tag("no", "mine")} <b>Slik kunne det virke.</b> Bud, tilbud og kanselleringer sendes som CAPD-meldinger, med for eksempel instrument og side i de 16 søkbare bytene. Handelsplassen abonnerer på dem, matcher ordrene i sin egen motor utenfor kjeden, og bare de ferdige handlene og oppgjørene går på kjeden som transaksjoner. Blokkene får da de rundt 9 handlene i sekundet, mens de rundt 3 000 ordremeldingene i sekundet går i CAPD. Det er et design, ikke noe som finnes i dag. Handelsplassen må uansett ta vare på alle ordrene selv, siden CAPD-meldingene forsvinner fra nodene.</p>

  <h2 id="utbytte">Utbytte i NOK-stablecoin, rett i lommeboken</h2>
  <p>${tag("no", "mine")} Hvis aksjene er tokens på Nexa, kan utbyttet også være det: et token i norske kroner som går rett til lommebøkene som holder aksjetokens, i stedet for kroner til en bankkonto. Her er hva reglene sier, hvordan det kunne virke, og hva som ikke er avklart.</p>

  <h3>Hva en NOK-stablecoin er etter loven</h3>
  <ul>
    <li>${tag("no", "fact")} En stablecoin knyttet til norske kroner vil være et e-pengetoken (EMT) etter MiCA, som gjelder i Norge gjennom kryptoeiendelsloven fra 1. juli 2025. Et e-pengetoken holder verdien stabil ved å vise til én offisiell valuta, og regnes som elektroniske penger.${R("mica", "emt", "m48")}</li>
    <li>${tag("no", "fact")} Bare foretak med tillatelse som bank, kredittforetak, finansieringsforetak eller e-pengeforetak kan utstede. Utstederen må varsle Finanstilsynet minst 40 virkedager før tilbudet, og melde og publisere et informasjonsdokument (white paper). Finanstilsynet godkjenner ikke dokumentet på forhånd.${R("emt", "m48", "m51")}</li>
    <li>${tag("no", "fact")} Innehaveren har et krav mot utstederen, og kan når som helst kreve tokenet innløst til pålydende, uten gebyr.${R("m49")}</li>
    <li>${tag("no", "fact")} DLT-pilotordningen tillater oppgjør i e-pengetokens der sentralbankpenger ikke er praktisk mulig.${R("dlt")}</li>
    <li>${tag("no", "fact")} <b>Finnes det et NOK-token i dag? Jeg har ikke funnet noe.</b> ESMAs midlertidige MiCA-register over utstedere av e-pengetokens (filen sist endret 30. september 2026) har 50 oppføringer fra 14 land. Ingen av dem har Norge som hjemland, og ingen nevner norske kroner.${R("emtreg")} Registeret har ingen egen kolonne for valuta, så jeg har søkt i navn og kommentarer. Det er et øyeblikksbilde, ikke en garanti.</li>
  </ul>

  <h3>Slik kunne det virke</h3>
  <ol>
    <li>${tag("no", "fact")} Generalforsamlingen vedtar utbyttet etter forslag fra styret.${R("asal8")}</li>
    <li>${tag("no", "mine")} Avstemmingsdagen blir en bestemt blokkhøyde. Verdipapirsentralen tar et øyeblikksbilde av alle utganger i aksjegruppen (og undergruppene, hvis det er flere aksjeklasser) ved den høyden, summerer per lommebok og kobler lommebøkene til aksjeeierne i registeret, som ligger utenfor kjeden.</li>
    <li>${tag("no", "mine")} Selskapet kjøper NOK-tokens fra en utsteder med tillatelse, betaler med kroner, og holder tilbake kildeskatten for utenlandske aksjonærer før noe sendes.</li>
    <li>${tag("no", "mine")} En batch-transaksjon (eller noen få, hvis listen er lang) bruker selskapets NOK-token-utganger og lager én utgang per aksjeeier i NOK-gruppen. Nettverket sjekker at mengden inn og ut av gruppen stemmer${R("gt")}, så transaksjonen er samtidig kvitteringen: alle kan se at summen går opp.</li>
    <li>${tag("no", "mine")} Aksjeeieren kan beholde tokenet, bruke det, eller løse det inn i kroner hos utstederen.${R("m49")}</li>
  </ol>

  <h3>Reglene for utbytte i dag</h3>
  <ul>
    <li>${tag("no", "fact")} Utbyttet tilfaller dem som er aksjeeiere når beslutningen treffes, om ikke noe annet fremgår av beslutningen. Utbetalingsdagen kan ikke settes senere enn seks måneder etter beslutningen.${R("asal8")} Retten til utbytte krever ikke at ervervet er innført i aksjeeierregisteret.${R("asal4")} I praksis får den utbyttet som eier aksjen ved utgangen av dagen før eks-dagen, og datoen fastsettes av generalforsamlingen.${R("rec")}</li>
    <li>${tag("no", "fact")} Med en VPS-konto, som opprettes hos en kontofører (oftest en bank eller megler), betales utbyttet direkte til bankkontoen som er registrert på kontoen.${R("vpsk")} Euronext Securities Oslo kan beregne og formidle utbyttet, og beregner og holder også tilbake kildeskatt.${R("vpsca")}</li>
    <li>${tag("no", "fact")} <b>Kildeskatt.</b> Det norske selskapet som betaler ut utbytte til utenlandske aksjonærer, skal trekke kildeskatt, rapportere den og betale den inn til Skatteetaten. Satsen er i utgangspunktet 25 prosent, lavere etter skatteavtaler eller fritaksmetoden. Er aksjonærens identitet og skattemessige status ukjent, skal det alltid trekkes 25 prosent.${R("kst")}</li>
    <li>${tag("no", "fact")} <b>Rapportering.</b> Alle aksje- og allmennaksjeselskap skal hvert år levere aksjonærregisteroppgaven, med frist 31. januar. Selskapene er fritatt når VPS står for innrapporteringen.${R("aro")}</li>
    <li>${tag("no", "mine")} Et token-utbytte slipper altså ikke baksiden: kildeskatten må trekkes før utbetaling og betales inn, og noen må rapportere hvem som fikk hva. Pseudonyme lommebøker holder ikke. Verdipapirsentralen må vite hvem og hvilket skatteland som står bak hver adresse, ellers blir det 25 prosent på alle utenlandske.</li>
  </ul>

  <h2>Åpne spørsmål og mine egne lesninger</h2>
  <ul>
    <li>${tag("no", "open")} <b>Endelighet på en åpen kjede.</b> Proof of work gir sannsynlighetsbasert endelighet, mens CSDR krever at systemet definerer et tydelig tidspunkt for når en ordre er ugjenkallelig.${R("a39")} Hvordan det skal forenes, og om en åpen, tillatelsesfri kjede kan godtas, har jeg ikke funnet noe tydelig svar på.</li>
    <li>${tag("no", "open")} <b>Oppgjørsdirektivet.</b> Ifølge forordningens fortale kan et DLT-OS som får unntak fra CSDRs deltakerkrav ikke utpekes etter oppgjørsdirektivet.${R("dlt")} Hva det betyr for rettsvernet ved konkurs, bør avklares.</li>
    <li>${tag("no", "open")} <b>Personopplysninger på en offentlig kjede.</b> Aksjeeierregisteret skal inneholde navn, fødselsdato og adresse.${R("asal")} ${tag("no", "mine")} Det kan ikke ligge i klartekst på en offentlig blokkjede. En løsning er at kjeden bare har pseudonyme adresser, mens verdipapirsentralen har koblingen til personene.</li>
    <li>${tag("no", "open")} <b>Holder CAPD for ordrestrømmen?</b> Rundt 3 000 meldinger i sekundet i snitt, og topper langt over det, er ikke noe spesifikasjonen sier noe om.${R("capd")} Om CAPD har kapasiteten og tilstrekkelig lav forsinkelse, og hva anbefalingen om ikke å videresende meldinger som utløper innen fem minutter betyr for kortlevde ordre, må testes.</li>
    <li>${tag("no", "open")} <b>Rettferdighet og rekkefølge.</b> CAPD har ingen felles global rekkefølge på meldingene, og prioriteten følger arbeidsbeviset.${R("capd")} ${tag("no", "mine")} Den som regner mer, eller sitter nær handelsplassens node, kan få ordren sin fram først, og andre kan se ordren før den er matchet. Handelsplassen måtte selv sette tidsstempel og rekkefølge når ordren kommer inn.</li>
    <li>${tag("no", "open")} <b>MiFID II-kravene.</b> En handelsplass skal ta vare på data om alle ordre i minst fem år${R("m25")}, synkronisere klokkene sine mot UTC med en nøyaktighet som avhenger av systemets forsinkelse (1 millisekund eller 100 mikrosekunder)${R("rts25")}, og meglerne har plikt til beste resultat for kunden.${R("m27")} Hvordan det gjøres med ordre som kommer via et åpent nettverk, er ikke avklart.</li>
    <li>${tag("no", "open")} <b>Hvem matcher?</b> Matchingen må fortsatt drives av en regulert handelsplass med tillatelse${R("dlt")}, ikke av nodene i nettverket. CAPD kan bare være transportkanalen.</li>
    <li>${tag("no", "open")} <b>Hvem holder nøklene?</b> Hvem som skal ha MINT-, MELT- og RESCRIPT-myndighetene, og hvordan rettskjennelser, arv, tapte nøkler og selskapshendelser håndteres, er designvalg som tilsynet måtte godta.</li>
    <li>${tag("no", "open")} <b>Utbytte i e-pengetoken i stedet for kroner på bankkonto.</b> I bestemmelsene om utbytte jeg har lest, står det ikke hva utbyttet skal betales i.${R("asal8")} Et e-pengetoken regnes som elektroniske penger, men aksjeeieren bytter et krav på sin egen bank mot et krav på tokenutstederen.${R("m48", "m49")} Om det kan regnes som vanlig kontantutbytte, eller om det må behandles som utdeling av noe annet, har jeg ikke funnet svar på.</li>
    <li>${tag("no", "open")} <b>Må aksjeeierne samtykke?</b> Kan generalforsamlingen eller vedtektene bestemme token-utbytte for alle, eller må hver aksjeeier velge det selv? ${tag("no", "mine")} Det tryggeste er trolig et valg: kroner til bankkonto som standard, NOK-token for dem som ber om det.</li>
    <li>${tag("no", "open")} <b>Hvem utsteder tokenet?</b> Det finnes ikke noe NOK-token i registeret i dag.${R("emtreg")} Noen med tillatelse må ville utstede ett, og på Nexa.</li>
    <li>${tag("no", "mine")} Tailstorm gjør Nexa raskere, men det er ikke fart som er flaskehalsen. Det er rettsvern, endelighet, styring og tillatelser.</li>
  </ul>

  <h2>Kilder</h2>
  ${sources("no")}
  ${share.bar({ url: URL, title: TITLE_NO, lang: "no" })}
  <p class="disc">Ikke juridisk rådgivning. «Nexa-Børs» er et tankeeksperiment. Det som er merket «Min lesning» og «Åpent spørsmål», er mine egne vurderinger, ikke fastslått rett.</p>
</article>`;

// --- English --------------------------------------------------------------------------------------------------
const EN = `
<article class="lang" lang="en" id="art-en">
  <header>
    <h1>${esc(TITLE_EN)}</h1>
    <p class="lede">A thought experiment with footnotes: what if shares and bonds on a Norwegian market became tokens on the Nexa blockchain, and everything still had to go by the book? A bit of play, a lot of legal text, and clear labels for what is fact, what is my reading, and what nobody knows yet.</p>
    <p class="updated">Jørgen S. Notland (jQrgen) · sources checked <time datetime="${CHECKED}">3 October 2026</time> · <a href="#no" data-l="no">Norsk</a></p>
  </header>
  ${share.top({ url: URL + "#en", title: TITLE_EN, lang: "en" })}
  <p class="disc"><b>Not legal advice.</b> This is a popular-science discussion, not legal, financial or investment advice, and not a plan or an application. "Nexa Exchange" does not exist, and the Oslo Stock Exchange (Oslo Børs), Euronext and Finanstilsynet have nothing to do with this text. Laws change; always check the current text and ask a lawyer.</p>
  <p class="legend">Labels: ${tag("en", "fact")} with a source, ${tag("en", "mine")} is my own interpretation, ${tag("en", "open")} is something not settled, ${tag("en", "fic")} is made up for fun.</p>

  <h2>A trading day on the Nexa Exchange</h2>
  <p>${tag("en", "fic")} Nothing in this box has happened. It is an imagined day on an imagined DLT market.</p>
  <dl class="day">
    <dt>07:30</dt><dd>Kari opens her trading app. Her wallet is already on the allowed list because her broker did its customer checks. Without that, the token contract will not let the shares in, however nicely she asks.</dd>
    <dt>09:00</dt><dd>Opening auction. Kari's buy order has already flown out as a small CAPD message over the Nexa network, outside the blocks. Orders are matched by a regulated trading venue, not by the blockchain. The chain is the archive and the settlement, not the auctioneer.</dd>
    <dt>09:00 and a bit</dt><dd>The trade settles: share tokens and settlement tokens change hands in the same transaction. Tailstorm gives a commitment about every second and a summary block every two minutes, so the coffee barely has time to go lukewarm.</dd>
    <dt>12:00</dt><dd>The company pays a dividend. No spreadsheets are emailed around: the register takes a snapshot of who held the share tokens on the record date, and the dividend lands as a krone stablecoin on Nexa (a NOK-pegged token), straight in their wallets. Kari sees the amount before lunch is over, and can spend it or redeem it for kroner with the issuer. (How, and what is unsettled, is <a href="#dividend">further down</a>.)</dd>
    <dt>14:15</dt><dd>Someone loses their phone and their keys. No panic: the account operator has the authority to move the shares after a controlled process, just like today. (What that should look like is one of the open questions further down.)</dd>
    <dt>16:25</dt><dd>Closing auction. Finanstilsynet, the Norwegian FSA, has read the same register all day and received its reports. Nobody has sent a single fax.</dd>
  </dl>

  <h2>The Nexa building blocks</h2>
  <ul>
    <li>${tag("en", "fact")} <b>Tokens are built into the protocol.</b> Each token type has a group ID written into the transaction output itself, and the network checks that the amount in and out of each group balances, unless the transaction uses an authority to create (mint) or remove (melt) tokens.${R("gt")}</li>
    <li>${tag("en", "fact")} <b>Authorities are outputs of their own</b>, with flags such as MINT, MELT, BATON (can create new authorities), RESCRIPT and SUBGROUP.${R("gth", "rpc")} An authority can be created without the right to create further authorities.${R("rpc")}</li>
    <li>${tag("en", "fact")} <b>Covenants.</b> A group can carry the COVENANT flag, which the source code describes as the output's script template having to match the input's. The RESCRIPT authority can change that template.${R("gth", "rpc")} Script templates are designed for three parties: the holder, the spender and the covenant author.${R("st")}</li>
    <li>${tag("en", "fact")} <b>Read-only inputs.</b> A transaction can read data from an output without spending it, which the spec notes is useful for covenants.${R("ro")}</li>
    <li>${tag("en", "fact")} <b>Subgroups</b> are children of a group, created with the SUBGROUP authority.${R("gth", "rpc")}</li>
    <li>${tag("en", "fact")} <b>Hard Fork 2</b> is scheduled to activate on mainnet on 1 November 2026 (UTC). It brings Tailstorm, with roughly one-second commitment intervals and the same two-minute settlement cadence.${R("hf2")}</li>
    <li>${tag("en", "mine")} From this, a share could be a group, share classes subgroups, and the account operator or CSD could hold the MINT, MELT and RESCRIPT authorities. A covenant could require that the receiver is on a list of checked customers, or that a registrar co-signs. Nexa has no ready-made "freeze" or allow-list feature. Such rules would have to be written as scripts, and that is a design, not something that exists today.</li>
  </ul>

  <h2>The rules that apply in Norway</h2>
  <table>
    <thead><tr><th>Rule</th><th>What it says (briefly)</th></tr></thead>
    <tbody>
      <tr><td><b>Verdipapirsentralloven</b> (the CSD Act, CSDR)</td><td>${tag("en", "fact")} CSDR, Regulation (EU) No 909/2014, applies as Norwegian law through section 1-1.${R("vsl", "csdr")} Verdipapirsentralen ASA (Euronext Securities Oslo) was licensed under CSDR in January 2022 and started using the licence on 1 March 2022.${R("vps")}</td></tr>
      <tr><td><b>Settlement finality</b></td><td>${tag("en", "fact")} CSDR Article 39: the CSD must define when a transfer order is entered and when it becomes irrevocable, disclose its finality rules, and achieve finality in real time or intraday, and no later than the end of the settlement day. Securities-against-cash transactions between direct participants must settle delivery versus payment.${R("a39")} The Settlement Finality Directive (98/26/EC) is implemented in chapter 4 of betalingssystemloven, the Payment Systems Act.${R("bsl")}</td></tr>
      <tr><td><b>Verdipapirhandelloven</b> (Securities Trading Act; MiFID II, MiFIR)</td><td>${tag("en", "fact")} The Act regulates trading venues and investment firms. Its chapter 8 makes MiFIR and the DLT Regulation Norwegian law.${R("vphl")}</td></tr>
      <tr><td><b>DLT Pilot Regime</b> (Regulation (EU) 2022/858)</td><td>${tag("en", "fact")} Applies in Norway through section 8-2 of the Securities Trading Act, in force since 1 August 2024.${R("vphl", "dltno")} It allows three kinds of infrastructure: a DLT multilateral trading facility (DLT MTF), a DLT settlement system (DLT SS) and a combination of the two (DLT TSS). Only shares of issuers with a market value under €500 million, bonds with an issue size under €1 billion and certain fund units may take part, and the total market value may not exceed €6 billion. A specific permission lasts up to six years. Cash settlement should use central bank money where practical, otherwise for example e-money tokens. A DLT MTF may, under conditions, let private individuals in directly.${R("dlt", "dlten")} Finanstilsynet grants the permissions, and ESMA has a coordinating role.${R("esma")}</td></tr>
      <tr><td><b>Who has a permission?</b></td><td>${tag("en", "fact")} ESMA's list (the file dated January 2026, the one linked as of 3 October 2026) shows six authorised DLT market infrastructures: in Czechia, Germany (two), Lithuania, France and Spain. None of them is Norwegian.${R("esmal")}</td></tr>
      <tr><td><b>Allmennaksjeloven</b> (Public Limited Companies Act)</td><td>${tag("en", "fact")} An ASA must keep its shareholder register in a CSD licensed or recognised under CSDR, and the register must include, among other things, the shareholders' names, dates of birth and addresses.${R("asal")}</td></tr>
      <tr><td><b>MiCA</b></td><td>${tag("en", "fact")} Norway's crypto-assets act (MiCA) covers crypto-assets not covered by other financial legislation. A token that is a financial instrument, like a share, falls outside MiCA and under the securities rules.${R("mica")}</td></tr>
      <tr><td><b>Hvitvaskingsloven</b> (Anti-Money Laundering Act)</td><td>${tag("en", "fact")} The obliged entities include investment firms, and CSDs where the CSD does not use an external account operator that is itself obliged.${R("hvit")} So customer checks (KYC) come along whatever the technology.</td></tr>
      <tr><td><b>Finanstilsynet</b></td><td>${tag("en", "fact")} The supervisor of trading venues, CSDs and the DLT regime.${R("csdr", "esma")} Its regulatory sandbox takes applications on a rolling basis. Licence requirements still apply, but some may be eased where the rules allow, and the service is tried on a small number of customers who must be told they are in a sandbox.${R("sbx")}</td></tr>
    </tbody>
  </table>

  <h2>Why not just the Oslo Stock Exchange, straight away?</h2>
  <ul>
    <li>${tag("en", "fact")} Euronext operates two EU regulated markets in Oslo, the Oslo Stock Exchange (Oslo Børs) and Euronext Expand. Euronext Growth is a multilateral trading facility (MTF).${R("enx")}</li>
    <li>${tag("en", "fact")} The DLT Pilot Regime covers MTFs and settlement systems, not regulated markets, and caps the size of issuers.${R("dlt")}</li>
    <li>${tag("en", "mine")} So the Oslo Stock Exchange itself cannot simply "switch to Nexa" under today's pilot, and the largest companies are too big anyway. A realistic route is a separate DLT MTF or DLT TSS for smaller issuers and bonds, with a CSD keeping the register.</li>
  </ul>

  <h2>What needs a permission</h2>
  <table>
    <thead><tr><th>Piece</th><th>What it takes</th></tr></thead>
    <tbody>
      <tr><td>The trading venue</td><td>${tag("en", "fact")} An investment firm or market operator authorised under MiFID II, plus a specific permission as a DLT MTF or DLT TSS from Finanstilsynet.${R("dlt", "esma")}</td></tr>
      <tr><td>The register and settlement</td><td>${tag("en", "fact")} A CSD with a specific permission as a DLT SS, possibly with exemptions from certain CSDR requirements.${R("dlt")}</td></tr>
      <tr><td>Brokers and customer checks</td><td>${tag("en", "fact")} Investment firms under the Securities Trading Act, with duties under the Anti-Money Laundering Act.${R("vphl", "hvit")}</td></tr>
      <tr><td>The cash leg</td><td>${tag("en", "fact")} Central bank money where practical, otherwise for example e-money tokens.${R("dlt")} I have found no e-money token in Norwegian kroner today.${R("emtreg")} See <a href="#dividend">the dividend section</a>.</td></tr>
      <tr><td>Guidance on the way</td><td>${tag("en", "mine")} Finanstilsynet's sandbox could be used to clarify which permissions are needed and to try the service at small scale.${R("sbx")}</td></tr>
    </tbody>
  </table>

  <h2 id="capacity">Is there enough capacity?</h2>
  <p>All figures were retrieved on 3 October 2026. Continuous trading on the Oslo Stock Exchange runs from 09:00 to 16:20, which is 26,400 seconds.${R("hrs")}</p>
  <table>
    <thead><tr><th>What</th><th>Figure</th></tr></thead>
    <tbody>
      <tr><td>Oslo Stock Exchange, 2025 average</td><td>${tag("en", "fact")} 26,357,568 trades over 250 trading days${R("enxm")}, about 4.0 trades per second.</td></tr>
      <tr><td>Oslo Stock Exchange, January–August 2026</td><td>${tag("en", "fact")} 20,928,836 trades over 166 days${R("enxm")}, about 4.8 per second.</td></tr>
      <tr><td>Busiest day I found: 23 March 2026</td><td>${tag("en", "fact")} 231,213 trades${R("enxd")}, about 8.8 per second averaged over the day. Peaks within the day are higher.</td></tr>
      <tr><td>Order messages</td><td>${tag("en", "fact")} Euronext's Optiq platform handled more than 14 billion messages and 18.8 million trades from 25 June to July 2018, across all Euronext cash markets${R("optiq")}, so about 745 messages per trade. ${tag("en", "mine")} Applied to Oslo, that is a rough estimate of about 3,000 messages per second on average, and more on busy days.</td></tr>
      <tr><td>Nexa today</td><td>${tag("en", "fact")} The block size adapts to use, but has a floor of 100 KB per block, with a block about every two minutes.${R("abs")} Nexa itself says 100,000 transactions per second is about 20 MB per second, so about 200 bytes per transaction.${R("scal")} ${tag("en", "mine")} That gives about 4 transactions per second at the floor, roughly the Oslo Stock Exchange average and with no headroom.</td></tr>
      <tr><td>Nexa after Hard Fork 2 (1 November 2026)</td><td>${tag("en", "fact")} The floor becomes 12 MB per two minutes, with Tailstorm subblocks about every second.${R("abs", "tail", "hf2")} ${tag("en", "mine")} At 200 bytes per transaction that is about 500 transactions per second.</td></tr>
      <tr><td>Nexa's goal</td><td>${tag("en", "fact")} More than 100,000 transactions per second is a stated goal${R("feat")}, not something demonstrated in operation.</td></tr>
      <tr><td>Actual use now</td><td>${tag("en", "fact")} About 0.01 to 0.02 transactions per second (24-hour average on the explorer).${R("expl")}</td></tr>
    </tbody>
  </table>
  <p>${tag("en", "mine")} After Hard Fork 2, Nexa's floor gives roughly 57 times the average trade rate of the busiest day I found, for trades and netted settlement. The caveat is that a real delivery-versus-payment transaction with a share token, a settlement token and covenants is probably larger than 200 bytes, so the real margin is smaller. The order messages, about 3,000 per second, do not fit in the blocks. They need another channel.</p>

  <h2 id="capd-en">The order stream on CAPD instead of in blocks</h2>
  <p>Nexa has its own channel for small messages that are not meant for the blockchain: CAPD (Counterparty and Protocol Discovery).</p>
  <ul>
    <li>${tag("en", "fact")} <b>What it is.</b> The spec describes CAPD as a transient, decentralised, anonymous messaging service that lets participants discover counterparties and run protocols with them, naming trades and atomic swaps as examples. It runs on Nexa full nodes, while clients such as wallets submit and search for messages.${R("capd")}</li>
    <li>${tag("en", "fact")} <b>Not on chain.</b> Messages sit in a memory pool (msgPool) in each node, not in blocks. The spec says the pool is typically a few hundred MB and configurable${R("capd")}; the default in the source code is 100 MB.${R("capdsrc")} Where proof of delivery is needed, the spec points to data in an ordinary on-chain transaction.${R("capd")}</li>
    <li>${tag("en", "fact")} <b>Proof of work and priority.</b> Every message must carry proof of work to deter spam. Priority is computed from the proof of work, the age and the length: messages above a nominal size of 100 bytes get proportionally lower priority, and priority falls linearly to zero after about ten minutes. When the pool is full, the lowest-priority messages are pushed out, and each node sets the priority it requires before forwarding.${R("capd")}</li>
    <li>${tag("en", "fact")} <b>Expiry and rescinding.</b> A message can carry an expiry time in seconds after creation, and a rescind hash that lets the sender withdraw it. The spec recommends not relaying messages that expire within five minutes.${R("capd")}</li>
    <li>${tag("en", "fact")} <b>Filtering.</b> The first 16 bytes of a message can be searched, and a client can ask a node to notify it whenever a new message matches.${R("capd")}</li>
    <li>${tag("en", "fact")} <b>Capacity.</b> The spec publishes no figure for messages per second or latency. It says every "global" message above a certain priority is forwarded to every peer, and that sharding messages across nodes is not implemented.${R("capd")}</li>
  </ul>
  <p>${tag("en", "mine")} <b>How it could work.</b> Bids, offers and cancellations are broadcast as CAPD messages, with for example the instrument and side in the 16 searchable bytes. The venue subscribes to them, matches orders in its own engine off-chain, and only the final trades and settlements go on chain as transactions. The blocks then carry the roughly 9 trades per second, while the roughly 3,000 order messages per second go over CAPD. This is a design, not something that exists today. The venue would still have to keep every order itself, since CAPD messages disappear from the nodes.</p>

  <h2 id="dividend">Dividends in a krone stablecoin, straight to the wallet</h2>
  <p>${tag("en", "mine")} If the shares are tokens on Nexa, the dividend can be one too: a token in Norwegian kroner sent straight to the wallets holding the share tokens, instead of kroner to a bank account. Here is what the rules say, how it could work, and what is not settled.</p>

  <h3>What a krone stablecoin is in law</h3>
  <ul>
    <li>${tag("en", "fact")} A stablecoin tied to Norwegian kroner would be an e-money token (EMT) under MiCA, which applies in Norway through kryptoeiendelsloven from 1 July 2025. An e-money token keeps its value stable by referring to one official currency, and is deemed to be electronic money.${R("mica", "emt", "m48")}</li>
    <li>${tag("en", "fact")} Only firms licensed as a bank, credit company, finance company or e-money institution may issue one. The issuer must notify Finanstilsynet at least 40 working days before the offer, and notify and publish a white paper. Finanstilsynet does not approve the white paper beforehand.${R("emt", "m48", "m51")}</li>
    <li>${tag("en", "fact")} The holder has a claim on the issuer and can ask for the token to be redeemed at par at any time, free of charge.${R("m49")}</li>
    <li>${tag("en", "fact")} The DLT pilot regime allows settlement in e-money tokens where central bank money is not practical.${R("dlt")}</li>
    <li>${tag("en", "fact")} <b>Does a krone token exist today? I have not found one.</b> ESMA's interim MiCA register of e-money token issuers (file last modified 30 September 2026) has 50 entries from 14 countries. None has Norway as home country, and none mentions Norwegian kroner.${R("emtreg")} The register has no separate currency column, so I searched names and comments. It is a snapshot, not a guarantee.</li>
  </ul>

  <h3>How it could work</h3>
  <ol>
    <li>${tag("en", "fact")} The general meeting resolves the dividend on the board's proposal.${R("asal8")}</li>
    <li>${tag("en", "mine")} The record date becomes a specific block height. The CSD takes a snapshot of every output in the share group (and its subgroups, if there are several share classes) at that height, sums them per wallet, and links the wallets to the shareholders in the register, which is kept off-chain.</li>
    <li>${tag("en", "mine")} The company buys krone tokens from a licensed issuer, pays in kroner, and holds back withholding tax for foreign shareholders before anything is sent.</li>
    <li>${tag("en", "mine")} One batch transaction (or a few, if the list is long) spends the company's krone-token outputs and creates one output per shareholder in the krone token group. The network checks that the amounts in and out of the group match${R("gt")}, so the transaction is also the receipt: anyone can see the totals add up.</li>
    <li>${tag("en", "mine")} The shareholder can keep the token, spend it, or redeem it for kroner with the issuer.${R("m49")}</li>
  </ol>

  <h3>Dividend rules today</h3>
  <ul>
    <li>${tag("en", "fact")} The dividend goes to those who are shareholders when the resolution is made, unless the resolution says otherwise. The payment date cannot be later than six months after the resolution.${R("asal8")} The right to a dividend does not depend on the acquisition being entered in the shareholder register.${R("asal4")} In practice the dividend goes to whoever owns the share at the end of the day before the ex-date, and the date is set by the general meeting.${R("rec")}</li>
    <li>${tag("en", "fact")} With a VPS account, opened with an account operator (usually a bank or broker), the dividend is paid straight to the bank account registered on that account.${R("vpsk")} Euronext Securities Oslo can calculate and distribute the dividend, and also calculates and withholds withholding tax.${R("vpsca")}</li>
    <li>${tag("en", "fact")} <b>Withholding tax.</b> The Norwegian company paying dividends to foreign shareholders must withhold tax, report it and pay it to Skatteetaten. The starting rate is 25 percent, lower under tax treaties or the participation exemption. If the shareholder's identity and tax status are unknown, 25 percent must always be withheld.${R("kst")}</li>
    <li>${tag("en", "fact")} <b>Reporting.</b> Every Norwegian limited company files the shareholder register return (aksjonærregisteroppgaven) each year, due 31 January. Companies are exempt when VPS does the reporting.${R("aro")}</li>
    <li>${tag("en", "mine")} So a token dividend does not escape the back office: withholding tax must be deducted before payment and paid in, and someone must report who got what. Pseudonymous wallets are not enough. The CSD has to know who, and which tax country, is behind each address, or every foreign holder gets 25 percent withheld.</li>
  </ul>

  <h2>Open questions and my own readings</h2>
  <ul>
    <li>${tag("en", "open")} <b>Finality on an open chain.</b> Proof of work gives probabilistic finality, while CSDR requires the system to define a clear moment when an order is irrevocable.${R("a39")} How to reconcile the two, and whether an open, permissionless chain can be accepted, I have not found a clear answer to.</li>
    <li>${tag("en", "open")} <b>The Settlement Finality Directive.</b> According to the regulation's recitals, a DLT SS that is exempted from CSDR's participation rules cannot be designated under that directive.${R("dlt")} What that means for legal protection in an insolvency needs clarifying.</li>
    <li>${tag("en", "open")} <b>Personal data on a public chain.</b> The shareholder register must contain names, dates of birth and addresses.${R("asal")} ${tag("en", "mine")} That cannot sit in clear text on a public blockchain. One answer is that the chain holds only pseudonymous addresses while the CSD holds the link to the people.</li>
    <li>${tag("en", "open")} <b>Can CAPD carry the order stream?</b> About 3,000 messages per second on average, with peaks well above that, is something the spec says nothing about.${R("capd")} Whether CAPD has the throughput and low enough latency, and what the recommendation not to relay messages expiring within five minutes means for short-lived orders, needs testing.</li>
    <li>${tag("en", "open")} <b>Fairness and ordering.</b> CAPD has no shared global order of messages, and priority follows proof of work.${R("capd")} ${tag("en", "mine")} Whoever computes more, or sits close to the venue's node, may get their order in first, and others can see an order before it is matched. The venue would have to timestamp and sequence orders itself on arrival.</li>
    <li>${tag("en", "open")} <b>MiFID II requirements.</b> A trading venue must keep data on all orders for at least five years${R("m25")}, synchronise its clocks to UTC with an accuracy that depends on the system's latency (1 millisecond or 100 microseconds)${R("rts25")}, and brokers have a best-execution duty to their clients.${R("m27")} How to do that with orders arriving over an open network is not settled.</li>
    <li>${tag("en", "open")} <b>Who matches?</b> Matching must still be run by a licensed, regulated trading venue${R("dlt")}, not by the network's nodes. CAPD can only be the transport.</li>
    <li>${tag("en", "open")} <b>Who holds the keys?</b> Who gets the MINT, MELT and RESCRIPT authorities, and how court orders, inheritance, lost keys and corporate actions are handled, are design choices the supervisor would have to accept.</li>
    <li>${tag("en", "open")} <b>Dividends in an e-money token instead of kroner to a bank account.</b> The dividend provisions I have read do not say what the dividend must be paid in.${R("asal8")} An e-money token is deemed electronic money, but the shareholder swaps a claim on their own bank for a claim on the token issuer.${R("m48", "m49")} Whether that counts as an ordinary cash dividend, or must be treated as a distribution of something else, I have not found an answer to.</li>
    <li>${tag("en", "open")} <b>Must shareholders consent?</b> Can the general meeting or the articles impose a token dividend on everyone, or must each shareholder opt in? ${tag("en", "mine")} The safest is probably a choice: kroner to a bank account by default, the krone token for those who ask.</li>
    <li>${tag("en", "open")} <b>Who issues the token?</b> There is no krone e-money token in the register today.${R("emtreg")} Someone licensed would have to want to issue one, and on Nexa.</li>
    <li>${tag("en", "mine")} Tailstorm makes Nexa faster, but speed is not the bottleneck. Legal certainty, finality, governance and permissions are.</li>
  </ul>

  <h2>Sources</h2>
  ${sources("en")}
  ${share.bar({ url: URL + "#en", title: TITLE_EN, lang: "en" })}
  <p class="disc">Not legal advice. "Nexa Exchange" is a thought experiment. What is labelled "My reading" and "Open question" is my own assessment, not settled law.</p>
</article>`;

const DRAFT = FINAL ? "" : `\n  <p class="draft" role="note">UTKAST, ikke publisert · DRAFT, not published</p>`;
const html = head(TITLE_NO).replace('<html lang="en">', '<html lang="nb">')
  .replace("<title>", `<meta name="description" content="${esc(TITLE_EN)} A playful but sourced thought experiment, in Norwegian and English.">\n<link rel="canonical" href="${URL}">\n${FINAL ? "" : '<meta name="robots" content="noindex">\n'}<title>`)
  .replace(/text-wrap:\s*bal(?:ance)/g, "text-wrap:pretty").replace("</style>", CSS + share.CSS + "</style>")
  .replace("<body>", `<body>\n<script>document.documentElement.classList.add("js", location.hash === "#en" ? "show-en" : "show-no")</script>`) + `<div class="band"><div class="inner">
    <a class="name" href="../">Jørgen S. Notland</a><span class="tag">Alle foredrag, artikler og papers · All talks, articles and papers</span>
  </div></div>
<div class="page">${DRAFT}
  <nav class="toggle" aria-label="Språk / Language"><a href="#no" data-l="no" lang="nb">Norsk</a><a href="#en" data-l="en" lang="en">English</a></nav>
${NO}
${EN}
  <footer class="site">Generert av src/build-oslo-bors-nexa.js · <a href="https://github.com/jQrgen/presentations">github.com/jQrgen/presentations</a></footer>
</div>
${share.SCRIPT}
<script>
(function () {
  var root = document.documentElement;
  function show(l) {
    root.classList.toggle("show-no", l === "no"); root.classList.toggle("show-en", l === "en");
    document.querySelectorAll(".toggle a").forEach(function (a) { a.setAttribute("aria-current", String(a.dataset.l === l)); });
    document.title = l === "en" ? ${JSON.stringify(TITLE_EN)} : ${JSON.stringify(TITLE_NO)};
    root.lang = l === "en" ? "en" : "nb";
  }
  document.querySelectorAll("a[data-l]").forEach(function (a) { a.addEventListener("click", function (e) { e.preventDefault(); history.replaceState(null, "", "#" + a.dataset.l); show(a.dataset.l); window.scrollTo(0, 0); }); });
  // source links inside the hidden language would point at the other article: rewrite EN refs to the EN list
  document.querySelectorAll('article[lang="en"] a.ref').forEach(function (a) { a.setAttribute("href", a.getAttribute("href") + "-en"); });
  show(location.hash === "#en" ? "en" : "no");
})();
</script>
</body>
</html>
`;

const out = path.join(DOCS, "oslo-bors-nexa");
fs.mkdirSync(out, { recursive: true });
const file = path.join(out, "index.html");
fs.writeFileSync(file, html);
console.log("wrote", file, FINAL ? "(final)" : "(DRAFT)");
if (!gate([out], loadTerms(path.join(__dirname, "oslo-bors-nexa-terms.json")))) { fs.rmSync(file); console.error("build-oslo-bors-nexa: grep gate failed, output removed"); process.exit(1); }
