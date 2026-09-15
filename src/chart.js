// Port of "The Denominator Chart" artifact (log-log energy-per-transaction chart)
// to a static SVG, rasterised with sharp. Usage: node chart.js <en|no> <out.png>
const sharp = require("sharp");

const LABELS = {
  en: {
    xAxis: "Transactions per second (throughput, log scale)",
    yAxis: "kWh per transaction (log scale)",
    ceiling: "Bitcoin’s protocol ceiling · ~7 TPS since 2010",
    gap: ["less energy per", "transaction, whatever", "the network burns"],
    below: ["Below the ceiling", "the two chains are", "identical: same", "miners, same joules", "per transaction."],
    btcToday: ["Bitcoin today · 7.5 TPS", "{btc} kWh per transaction", "≈ two weeks of a home’s electricity"],
    btcFlat: ["Bitcoin: flat at {btc} kWh per tx", "more demand, same 7 TPS, same cost"],
    nexaNow: ["Nexa today · 42,000 TPS (benchmarked)", "{now} kWh per transaction", "{rNow} less than Bitcoin"],
    blitz: ["Nexa with Blitz", "100,000 TPS · projected", "{bl} kWh per transaction", "≈ two phone charges"],
    legend: ["Nexa", "Nexa with Blitz (projected)", "Bitcoin", "Both chains below the ceiling"],
    fmtInt: (n) => n.toLocaleString("en-US"),
    dec: ".",
  },
  no: {
    xAxis: "Transaksjoner per sekund (gjennomstrømning, log-skala)",
    yAxis: "kWh per transaksjon (log-skala)",
    ceiling: "Bitcoins protokolltak · ~7 TPS siden 2010",
    gap: ["mindre energi per", "transaksjon, uansett", "hva nettverket brenner"],
    below: ["Under taket", "er kjedene", "identiske: samme", "minere, samme joule", "per transaksjon."],
    btcToday: ["Bitcoin i dag · 7,5 TPS", "{btc} kWh per transaksjon", "≈ to ukers strøm for en bolig"],
    btcFlat: ["Bitcoin: flatt på {btc} kWh per tx", "mer etterspørsel, samme 7 TPS, samme kostnad"],
    nexaNow: ["Nexa i dag · 42 000 TPS (målt)", "{now} kWh per transaksjon", "{rNow} mindre enn Bitcoin"],
    blitz: ["Nexa med Blitz", "100 000 TPS · anslått", "{bl} kWh per transaksjon", "≈ to mobilladinger"],
    legend: ["Nexa", "Nexa med Blitz (anslått)", "Bitcoin", "Begge kjedene under taket"],
    fmtInt: (n) => n.toLocaleString("nb-NO").replace(/\s/g, " "),
    dec: ",",
  },
};

const C = {
  nexa: "#F2CD3A", btc: "#F7931A", both: "#A1A1AA",
  ink: "#FFFFFF", ink2: "#E4E4E7", muted: "#A1A1AA",
  grid: "#26262C", axis: "#3F3F46", surface: "#18181B",
};
const FONT = "Helvetica Neue, Helvetica, Arial, sans-serif";

function buildSvg(lang) {
  const L = LABELS[lang];
  const SPY = 365 * 86400;
  const energy = 138;
  const BTC_TPS = 7.5, NEXA_NOW = 42000, NEXA_BLITZ = 100000;
  const W = 1100, H = 650, M = { l: 80, r: 36, t: 30, b: 60 };
  const PW = W - M.l - M.r, PH = H - M.t - M.b;
  const XD = [0, 6], YD = [-2, 4];
  const lg = Math.log10;
  const sx = (v) => M.l + (lg(v) - XD[0]) / (XD[1] - XD[0]) * PW;
  const sy = (v) => M.t + (YD[1] - lg(v)) / (YD[1] - YD[0]) * PH;
  const K = energy * 1e9 / SPY;
  const kwh = (tps) => K / tps;

  const roundSf = (v, sf) => { const p = Math.pow(10, Math.floor(lg(Math.abs(v))) - (sf - 1)); return Math.round(v / p) * p; };
  const fmtKwh = (v) => {
    let s;
    if (v >= 100) return L.fmtInt(roundSf(v, 2));
    if (v >= 10) s = v.toFixed(1); else if (v >= 1) s = v.toFixed(2); else s = v.toFixed(3);
    return s.replace(".", L.dec);
  };
  const fmtRatio = (r) => L.fmtInt(roundSf(r, 2)) + "×";
  const tick = (v) => (v >= 1 ? L.fmtInt(v) : String(v).replace(".", L.dec));
  const esc = (s) => String(s).replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/"/g, "&quot;");
  const vals = { btc: fmtKwh(kwh(BTC_TPS)), now: fmtKwh(kwh(NEXA_NOW)), bl: fmtKwh(kwh(NEXA_BLITZ)), rNow: fmtRatio(NEXA_NOW / BTC_TPS) };
  const fill = (s) => s.replace(/\{(\w+)\}/g, (_, k) => vals[k]);

  const STYLE = {
    tick: `font-family="${FONT}" font-size="11.5" font-weight="500" fill="${C.muted}"`,
    axisTitle: `font-family="${FONT}" font-size="12.5" fill="${C.muted}"`,
    strong: `font-family="${FONT}" font-size="12.5" font-weight="700" fill="${C.ink}"`,
    ann: `font-family="${FONT}" font-size="12" fill="${C.ink2}"`,
    annMuted: `font-family="${FONT}" font-size="12" fill="${C.muted}"`,
    big: `font-family="${FONT}" font-size="27" font-weight="700" fill="${C.ink}"`,
  };
  const text = (x, y, str, st, anchor) => `<text x="${x}" y="${y}" ${STYLE[st]}${anchor ? ` text-anchor="${anchor}"` : ""}>${esc(fill(str))}</text>`;
  const block = (x, y, lines, anchor, lh = 15) => lines.map((l, i) => text(x, y + i * lh, l[0], l[1], anchor)).join("");

  const yBtc = sy(kwh(BTC_TPS)), xCeil = sx(BTC_TPS);
  const xNow = sx(NEXA_NOW), yNow = sy(kwh(NEXA_NOW));
  const xBl = sx(NEXA_BLITZ), yBl = sy(kwh(NEXA_BLITZ));
  const right = M.l + PW, bottom = M.t + PH;
  let s = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${W} ${H}" width="${W}" height="${H}">`;
  s += `<rect width="${W}" height="${H}" fill="${C.surface}"/>`;

  for (let d = YD[0]; d <= YD[1]; d++) {
    const y = sy(Math.pow(10, d));
    s += `<line x1="${M.l}" x2="${right}" y1="${y}" y2="${y}" stroke="${C.grid}" stroke-width="1"/>`;
    s += text(M.l - 10, y + 4, tick(Math.pow(10, d)), "tick", "end");
  }
  for (let d = XD[0]; d <= XD[1]; d++) {
    const x = sx(Math.pow(10, d));
    s += `<line x1="${x}" x2="${x}" y1="${M.t}" y2="${bottom}" stroke="${C.grid}" stroke-width="1"/>`;
    s += text(x, bottom + 20, tick(Math.pow(10, d)), "tick", "middle");
  }
  for (let d = XD[0]; d < XD[1]; d++) for (let m = 2; m < 10; m++) {
    const x = sx(m * Math.pow(10, d));
    s += `<line x1="${x}" x2="${x}" y1="${bottom}" y2="${bottom + 4}" stroke="${C.axis}" stroke-width="1"/>`;
  }
  for (let d = YD[0]; d < YD[1]; d++) for (let m = 2; m < 10; m++) {
    const y = sy(m * Math.pow(10, d));
    s += `<line x1="${M.l - 4}" x2="${M.l}" y1="${y}" y2="${y}" stroke="${C.axis}" stroke-width="1"/>`;
  }
  s += `<line x1="${M.l}" x2="${right}" y1="${bottom}" y2="${bottom}" stroke="${C.axis}" stroke-width="1"/>`;
  s += `<line x1="${M.l}" x2="${M.l}" y1="${M.t}" y2="${bottom}" stroke="${C.axis}" stroke-width="1"/>`;
  s += text(M.l + PW / 2, H - 14, L.xAxis, "axisTitle", "middle");
  s += `<text ${STYLE.axisTitle} text-anchor="middle" transform="translate(18 ${M.t + PH / 2}) rotate(-90)">${esc(L.yAxis)}</text>`;

  // ceiling
  s += `<line x1="${xCeil}" x2="${xCeil}" y1="${M.t}" y2="${bottom}" stroke="${C.axis}" stroke-width="1" stroke-dasharray="3 3"/>`;
  s += text(xCeil + 8, bottom - 10, L.ceiling, "annMuted");

  // lines
  const line = (x1, y1, x2, y2, color, dash) =>
    `<path d="M${x1} ${y1} L${x2} ${y2}" fill="none" stroke="${color}" stroke-width="2.5" stroke-linecap="round"${dash ? ` stroke-dasharray="7 6"` : ""}/>`;
  s += line(sx(1), sy(K), xCeil, yBtc, C.both);
  s += line(xCeil, yBtc, right, yBtc, C.btc);
  s += line(xCeil, yBtc, xNow, yNow, C.nexa);
  s += line(xNow, yNow, xBl, yBl, C.nexa, true);

  // gap bracket
  s += `<path d="M${xBl - 5} ${yBtc + 8} h10 M${xBl} ${yBtc + 8} V${yBl - 12} M${xBl - 5} ${yBl - 12} h10" fill="none" stroke="${C.muted}" stroke-width="1"/>`;
  const yMid = (yBtc + yBl) / 2;
  s += text(xBl + 12, yMid - 6, fmtRatio(NEXA_BLITZ / BTC_TPS), "big");
  s += block(xBl + 12, yMid + 14, L.gap.map((t) => [t, "ann"]));

  // markers
  const ring = (cx, cy, color, hollow) =>
    `<circle cx="${cx}" cy="${cy}" r="7" fill="${C.surface}"/>` +
    (hollow ? `<circle cx="${cx}" cy="${cy}" r="4.5" fill="${C.surface}" stroke="${color}" stroke-width="2"/>`
            : `<circle cx="${cx}" cy="${cy}" r="5" fill="${color}"/>`);
  s += ring(xCeil, yBtc, C.btc);
  s += ring(xNow, yNow, C.nexa);
  s += ring(xBl, yBl, C.nexa, true);

  // annotations
  const B = L.below; s += block(M.l + 10, yBtc + 58, [[B[0], "strong"], ...B.slice(1).map((t) => [t, "ann"])]);
  const T1 = L.btcToday; s += block(xCeil + 14, yBtc - 44, [[T1[0], "strong"], [T1[1], "ann"], [T1[2], "annMuted"]]);
  const T2 = L.btcFlat; s += block(right - 4, yBtc - 22, [[T2[0], "strong"], [T2[1], "annMuted"]], "end");
  const T3 = L.nexaNow; s += block(xNow - 12, yNow + 18, [[T3[0], "strong"], [T3[1], "ann"], [T3[2], "annMuted"]], "end");
  const T4 = L.blitz; s += block(xBl + 12, yBl - 16, [[T4[0], "strong"], [T4[1], "ann"], [T4[2], "ann"], [T4[3], "annMuted"]]);

  // legend (top-left inside plot)
  const lx = M.l + 10, ly = M.t + 14;
  const items = [[L.legend[0], C.nexa, false], [L.legend[1], C.nexa, true], [L.legend[2], C.btc, false], [L.legend[3], C.both, false]];
  let cx = lx;
  items.forEach(([label, color, dash]) => {
    s += `<line x1="${cx}" x2="${cx + 22}" y1="${ly}" y2="${ly}" stroke="${color}" stroke-width="2.5" stroke-linecap="round"${dash ? ` stroke-dasharray="5 4"` : ""}/>`;
    s += `<text x="${cx + 28}" y="${ly + 4}" ${STYLE.ann}>${esc(label)}</text>`;
    cx += 28 + label.length * 6.6 + 22;
  });

  s += "</svg>";
  return s;
}

async function renderPng(lang, out) {
  const svg = buildSvg(lang);
  await sharp(Buffer.from(svg), { density: 240 }).png().toFile(out);
  return out;
}

module.exports = { buildSvg, renderPng };

if (require.main === module) {
  const lang = process.argv[2] || "en";
  const out = process.argv[3] || `chart-${lang}.png`;
  renderPng(lang, out).then((f) => console.log("wrote", f)).catch((e) => { console.error(e); process.exit(1); });
}
