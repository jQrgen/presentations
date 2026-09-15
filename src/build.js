// Usage: node build.js <output.pptx> <en|no>
// Nexa brand styling: dark zinc ground, gold accent, Nexa logo (brand/*.svg from nexa.org/brand).
const pptxgen = require("pptxgenjs");
const React = require("react");
const ReactDOMServer = require("react-dom/server");
const sharp = require("sharp");
const Fi = require("react-icons/fi");
const fs = require("fs");
const path = require("path");
const { renderPng } = require("./chart.js");

const OUT = process.argv[2] || "Nexa-fundamentals.pptx";
const LANG = process.argv[3] || "en";
const T = require(`./content-${LANG}.js`);

// Nexa palette (nexa.org): near-black ground, zinc surfaces, gold accent from the logo
const BG = "0A0A0F";
const SURFACE = "18181B";
const SURFACE2 = "27272A";
const LINE = "2E2E35";
const INK = "FFFFFF";
const BODY = "E4E4E7";
const MUTED = "A1A1AA";
const WHITE = "FFFFFF";
const GOLD = "F2CD3A";
const GOLD_BRIGHT = "FFE144";
const GOLD_TINT = "26210F";
const BTC = "F7931A";
const BTC_TINT = "2A1A0C";
const ETH = "627EEA";
const ETH_TINT = "1A1F3A";

const FONT = "Calibri";
const W = 13.333;
const H = 7.5;
const MARGIN = 0.6;
const GAP = 0.3;
const CARD_W = (W - 2 * MARGIN - 2 * GAP) / 3;
const CARD_X = [MARGIN, MARGIN + CARD_W + GAP, MARGIN + 2 * (CARD_W + GAP)];

async function iconData(name, color) {
  let svg = ReactDOMServer.renderToStaticMarkup(
    React.createElement(Fi[name], { size: 256, strokeWidth: 2 })
  );
  svg = svg.replace(/currentColor/g, "#" + color);
  const buf = await sharp(Buffer.from(svg)).png().toBuffer();
  return "image/png;base64," + buf.toString("base64");
}

async function svgToPngData(file, width) {
  const buf = await sharp(path.join(__dirname, file)).resize({ width }).png().toBuffer();
  return "image/png;base64," + buf.toString("base64");
}

const pres = new pptxgen();
pres.layout = "LAYOUT_WIDE";
pres.author = "Nexa";
pres.title = T.fileTitle;

let slideNo = 0;
let LOGO = {};

function footer(slide) {
  slideNo += 1;
  slide.addImage({ data: LOGO.mark, x: MARGIN, y: H - 0.55, w: 0.28, h: 0.27 });
  slide.addText(T.footer, {
    x: MARGIN + 0.36, y: H - 0.5, w: 3, h: 0.3,
    fontFace: FONT, fontSize: 10, color: MUTED,
    align: "left", isTextBox: true, margin: 0,
  });
  slide.addText(String(slideNo), {
    x: W - MARGIN - 0.6, y: H - 0.5, w: 0.6, h: 0.3,
    fontFace: FONT, fontSize: 10, color: MUTED,
    align: "right", isTextBox: true, margin: 0,
  });
}

function newSlide() {
  const s = pres.addSlide();
  s.background = { color: BG };
  return s;
}

function title(slide, text, opts = {}) {
  slide.addText(text, {
    x: MARGIN, y: 0.45, w: W - 2 * MARGIN, h: 1.1,
    fontFace: FONT, fontSize: opts.size || 30, bold: true,
    color: INK, align: "left", valign: "top",
    isTextBox: true, margin: 0,
  });
}

function card(slide, x, y, w, h, fill) {
  slide.addShape(pres.shapes.ROUNDED_RECTANGLE, {
    x, y, w, h, fill: { color: fill || SURFACE },
    line: { color: LINE, width: 0.75 }, rectRadius: 0.12,
  });
}

// icon on a coloured disc: dark glyph on gold/orange, white glyph on indigo
function disc(slide, x, y, size, color, icon) {
  slide.addShape(pres.shapes.OVAL, {
    x, y, w: size, h: size, fill: { color }, line: { color, width: 0 },
  });
  const glyph = color === ETH ? icon.white : icon.dark;
  const g = size * 0.52;
  slide.addImage({ data: glyph, x: x + (size - g) / 2, y: y + (size - g) / 2, w: g, h: g });
}

// Three cards: icon disc, bold label, description
function cards(slide, items, opts = {}) {
  const y = opts.y ?? 1.85;
  const h = opts.h ?? 4.0;
  items.forEach((it, i) => {
    const x = CARD_X[i];
    card(slide, x, y, CARD_W, h);
    disc(slide, x + 0.3, y + 0.3, 0.7, it.color || GOLD, it.icon);
    slide.addText(it.label, {
      x: x + 0.3, y: y + 1.2, w: CARD_W - 0.6, h: 0.7,
      fontFace: FONT, fontSize: 18, bold: true, color: INK,
      valign: "top", isTextBox: true, margin: 0,
    });
    slide.addText(it.desc, {
      x: x + 0.3, y: y + 1.95, w: CARD_W - 0.6, h: h - 2.25,
      fontFace: FONT, fontSize: 15, color: BODY, valign: "top",
      isTextBox: true, margin: 0, paraSpaceAfter: 6,
    });
  });
}

// Three comparison columns headed by a chain name pill
function compare(slide, cols, opts = {}) {
  const y = opts.y ?? 1.85;
  const h = opts.h ?? 4.0;
  cols.forEach((c, i) => {
    const x = CARD_X[i];
    card(slide, x, y, CARD_W, h, c.tint);
    slide.addShape(pres.shapes.ROUNDED_RECTANGLE, {
      x: x + 0.3, y: y + 0.3, w: 1.9, h: 0.5, fill: { color: c.color },
      line: { color: c.color, width: 0 }, rectRadius: 0.25,
    });
    slide.addText(c.name, {
      x: x + 0.3, y: y + 0.3, w: 1.9, h: 0.5,
      fontFace: FONT, fontSize: 14, bold: true, color: c.color === ETH ? WHITE : BG,
      align: "center", valign: "middle", isTextBox: true, margin: 0,
    });
    slide.addText(c.head, {
      x: x + 0.3, y: y + 1.05, w: CARD_W - 0.6, h: 0.75,
      fontFace: FONT, fontSize: 18, bold: true, color: INK,
      valign: "top", isTextBox: true, margin: 0,
    });
    slide.addText(c.desc, {
      x: x + 0.3, y: y + 1.85, w: CARD_W - 0.6, h: h - 2.15,
      fontFace: FONT, fontSize: 15, color: BODY, valign: "top",
      isTextBox: true, margin: 0, paraSpaceAfter: 6,
    });
  });
}

// Row of three large stat callouts
function stats(slide, items, opts = {}) {
  const y = opts.y ?? 1.9;
  const h = opts.h ?? 2.0;
  items.forEach((s, i) => {
    const x = CARD_X[i];
    card(slide, x, y, CARD_W, h, s.tint);
    slide.addText(s.name, {
      x: x + 0.3, y: y + 0.2, w: CARD_W - 0.6, h: 0.35,
      fontFace: FONT, fontSize: 12, bold: true, color: s.color,
      isTextBox: true, margin: 0, charSpacing: 1,
    });
    slide.addText(s.value, {
      x: x + 0.3, y: y + 0.55, w: CARD_W - 0.6, h: 0.9,
      fontFace: FONT, fontSize: s.size || 40, bold: true, color: INK,
      valign: "middle", isTextBox: true, margin: 0,
    });
    slide.addText(s.label, {
      x: x + 0.3, y: y + 1.45, w: CARD_W - 0.6, h: 0.45,
      fontFace: FONT, fontSize: 12, color: MUTED, valign: "top",
      isTextBox: true, margin: 0,
    });
  });
}

// Three numbered points under a stats row
function points(slide, items, opts = {}) {
  const y = opts.y ?? 4.3;
  const h = opts.h ?? 2.3;
  items.forEach((p, i) => {
    const x = CARD_X[i];
    slide.addShape(pres.shapes.OVAL, {
      x, y, w: 0.42, h: 0.42, fill: { color: GOLD }, line: { color: GOLD, width: 0 },
    });
    slide.addText(String(i + 1), {
      x, y, w: 0.42, h: 0.42, fontFace: FONT, fontSize: 14, bold: true,
      color: BG, align: "center", valign: "middle", isTextBox: true, margin: 0,
    });
    slide.addText(p, {
      x: x + 0.6, y: y - 0.02, w: CARD_W - 0.6, h: h,
      fontFace: FONT, fontSize: 15, color: BODY, valign: "top",
      isTextBox: true, margin: 0,
    });
  });
}

// Chain colour sets, in Bitcoin / Ethereum / Nexa order
const CHAIN = [
  { color: BTC, tint: BTC_TINT },
  { color: ETH, tint: ETH_TINT },
  { color: GOLD, tint: GOLD_TINT },
];
const withChain = (arr) => arr.map((it, i) => ({ ...it, ...CHAIN[i] }));

async function build() {
  const ICON_NAMES = ["FiZap", "FiCpu", "FiTrendingUp", "FiRefreshCw", "FiMonitor", "FiBox", "FiUsers",
    "FiServer", "FiClock", "FiTag", "FiShield", "FiCode", "FiLayers", "FiPackage", "FiDroplet", "FiGlobe",
    "FiSmartphone", "FiDollarSign", "FiCheckCircle", "FiRadio", "FiRepeat"];
  const ic = {};
  for (const n of ICON_NAMES) ic[n] = { dark: await iconData(n, BG), white: await iconData(n, WHITE) };
  const withIcons = (arr, names, colors) =>
    arr.map((it, i) => ({ ...it, icon: ic[names[i]], color: colors ? colors[i] : GOLD }));

  LOGO = {
    mark: await svgToPngData("brand/nexa-logo-mark-cropped.svg", 600),
    type: await svgToPngData("brand/nexa-logo-mark-text-gold.svg", 1600),
  };

  // ---------- 1. Title ----------
  {
    const s = newSlide();
    const t = T.title;
    // logotype top-left, large logo mark as the hero on the right
    s.addImage({ data: LOGO.type, x: MARGIN, y: 0.7, w: 2.6, h: 2.6 * (243.65 / 1058.41) });
    const mh = 3.6, mw = mh * (308 / 298);
    s.addImage({ data: LOGO.mark, x: W - MARGIN - mw - 0.4, y: (H - mh) / 2 - 0.3, w: mw, h: mh });
    s.addText(t.headline, {
      x: MARGIN, y: 2.3, w: 7.9, h: 2.0, fontFace: FONT, fontSize: 40, bold: true,
      color: INK, valign: "top", isTextBox: true, margin: 0,
    });
    s.addText(t.sub, {
      x: MARGIN, y: 4.5, w: 7.9, h: 0.5, fontFace: FONT, fontSize: 20,
      color: BODY, isTextBox: true, margin: 0,
    });
    s.addText(t.place, {
      x: MARGIN, y: 5.05, w: 7.9, h: 0.4, fontFace: FONT, fontSize: 14,
      color: MUTED, isTextBox: true, margin: 0,
    });
    s.addText(t.name, {
      x: MARGIN, y: 5.7, w: 7.9, h: 0.4, fontFace: FONT, fontSize: 16, bold: true,
      color: GOLD, isTextBox: true, margin: 0,
    });
    s.addText(
      [
        { text: t.cred1, options: { breakLine: true } },
        { text: t.cred2 },
      ],
      { x: MARGIN, y: 6.1, w: 7.9, h: 0.7, fontFace: FONT, fontSize: 13,
        color: BODY, valign: "top", isTextBox: true, margin: 0, paraSpaceAfter: 2 }
    );
    s.addNotes(t.notes);
    footer(s);
  }

  // ---------- 2. The critique is mostly right ----------
  {
    const s = newSlide();
    const t = T.critique;
    title(s, t.title);
    cards(s, withIcons(t.cards, ["FiZap", "FiCpu", "FiTrendingUp"], [BTC, BTC, ETH]), { h: 3.7 });
    s.addText(t.tagline, {
      x: MARGIN, y: 5.95, w: W - 2 * MARGIN, h: 0.5, fontFace: FONT, fontSize: 18,
      italic: true, color: GOLD, isTextBox: true, margin: 0,
    });
    s.addNotes(t.notes);
    footer(s);
  }

  // ---------- 3. Energy per transaction ----------
  {
    const s = newSlide();
    const t = T.perTx;
    title(s, t.title);
    stats(s, t.stats.map((it, i) => ({ ...it, ...(i === 0 ? CHAIN[0] : CHAIN[2]) })));
    points(s, t.points);
    s.addNotes(t.notes);
    footer(s);
  }

  // ---------- 3b. The denominator chart ----------
  {
    const s = newSlide();
    const t = T.chart;
    const png = `chart-${LANG}.png`;
    await renderPng(LANG, png);
    const data = "image/png;base64," + fs.readFileSync(png).toString("base64");
    title(s, t.title);
    const ih = 5.35, iw = ih * (1100 / 650);
    s.addImage({ data, x: (W - iw) / 2, y: 1.2, w: iw, h: ih });
    s.addText(t.caption, {
      x: MARGIN, y: 6.6, w: W - 2 * MARGIN, h: 0.36, fontFace: FONT, fontSize: 10,
      color: MUTED, align: "center", isTextBox: true, margin: 0,
    });
    s.addNotes(t.notes);
    footer(s);
  }

  // ---------- 4. Absolute energy ----------
  {
    const s = newSlide();
    const t = T.absolute;
    title(s, t.title);
    compare(s, withChain(t.cols));
    s.addNotes(t.notes);
    footer(s);
  }

  // ---------- 5. NTNU: why efficiency is the environmental lever ----------
  {
    const s = newSlide();
    const t = T.ntnu;
    title(s, t.title);
    cards(s, withIcons(t.cards, ["FiDroplet", "FiLayers", "FiZap"]), { h: 3.85 });
    s.addText(t.citation, {
      x: MARGIN, y: 5.95, w: W - 2 * MARGIN, h: 0.6, fontFace: FONT, fontSize: 11,
      color: MUTED, isTextBox: true, margin: 0,
    });
    s.addNotes(t.notes);
    footer(s);
  }

  // ---------- 6. E-waste ----------
  {
    const s = newSlide();
    const t = T.ewaste;
    title(s, t.title);
    cards(s, withIcons(t.cards, ["FiServer", "FiMonitor", "FiRefreshCw"], [BTC, GOLD, GOLD]));
    s.addNotes(t.notes);
    footer(s);
  }

  // ---------- 7. Fair launch ----------
  {
    const s = newSlide();
    const t = T.fair;
    title(s, t.title);
    compare(s, withChain(t.cols));
    s.addNotes(t.notes);
    footer(s);
  }

  // ---------- 8. Scale ----------
  {
    const s = newSlide();
    const t = T.scale;
    title(s, t.title);
    stats(s, withChain(t.stats));
    points(s, t.points);
    s.addNotes(t.notes);
    footer(s);
  }

  // ---------- 9. Payments ----------
  {
    const s = newSlide();
    const t = T.payments;
    title(s, t.title);
    cards(s, withIcons(t.cards, ["FiClock", "FiDollarSign", "FiPackage"]));
    s.addNotes(t.notes);
    footer(s);
  }

  // ---------- 10. Tokens ----------
  {
    const s = newSlide();
    const t = T.tokens;
    title(s, t.title);
    cards(s, withIcons(t.cards, ["FiShield", "FiTag", "FiBox"]));
    s.addNotes(t.notes);
    footer(s);
  }

  // ---------- 10b. CAPD open outcry ----------
  {
    const s = newSlide();
    const t = T.capd;
    title(s, t.title);
    cards(s, withIcons(t.cards, ["FiRadio", "FiRepeat", "FiClock"]));
    s.addNotes(t.notes);
    footer(s);
  }

  // ---------- 11. Smart contracts ----------
  {
    const s = newSlide();
    const t = T.contracts;
    title(s, t.title);
    cards(s, withIcons(t.cards, ["FiCode", "FiLayers", "FiGlobe"]));
    s.addNotes(t.notes);
    footer(s);
  }

  // ---------- 12. Norway ----------
  {
    const s = newSlide();
    const t = T.norway;
    title(s, t.title);
    cards(s, withIcons(t.cards, ["FiDroplet", "FiZap", "FiSmartphone"], [GOLD, BTC, GOLD]));
    s.addNotes(t.notes);
    footer(s);
  }

  // ---------- 13. Comparison overview ----------
  {
    const s = newSlide();
    const t = T.table;
    title(s, t.title);
    const hdr = (text, color) => ({
      text, options: { bold: true, color: color === SURFACE2 || color === ETH ? WHITE : BG, fill: { color }, align: "center", valign: "middle", fontSize: 14 },
    });
    const cell = (text, fill, bold) => ({
      text, options: { color: bold ? INK : BODY, fill: { color: fill }, fontSize: 13, bold: !!bold, valign: "middle", margin: [6, 8, 6, 8] },
    });
    const hdrColors = [SURFACE2, BTC, ETH, GOLD];
    const tints = [SURFACE, BTC_TINT, ETH_TINT, GOLD_TINT];
    const rows = [
      t.header.map((h, i) => hdr(h, hdrColors[i])),
      ...t.rows.map((r) => r.map((c, i) => cell(c, tints[i], i === 0))),
    ];
    s.addTable(rows, {
      x: MARGIN, y: 1.85, w: W - 2 * MARGIN, colW: [2.3, 3.1, 3.1, 3.633],
      rowH: [0.5, 1.1, 1.1, 1.1, 1.1], fontFace: FONT,
      border: { type: "solid", color: BG, pt: 2 },
    });
    s.addNotes(t.notes);
    footer(s);
  }

  // ---------- 14. Closing ----------
  {
    const s = newSlide();
    const t = T.closing;
    title(s, t.title);
    const names = ["FiZap", "FiUsers", "FiCheckCircle"];
    t.cards.forEach((it, i) => {
      const x = CARD_X[i];
      const y = 1.85;
      const h = 3.9;
      card(s, x, y, CARD_W, h);
      disc(s, x + 0.3, y + 0.3, 0.7, GOLD, ic[names[i]]);
      s.addText(it.label, {
        x: x + 0.3, y: y + 1.2, w: CARD_W - 0.6, h: 0.5, fontFace: FONT, fontSize: 20, bold: true,
        color: GOLD, valign: "top", isTextBox: true, margin: 0,
      });
      s.addText(it.desc, {
        x: x + 0.3, y: y + 1.8, w: CARD_W - 0.6, h: h - 2.1, fontFace: FONT, fontSize: 15,
        color: BODY, valign: "top", isTextBox: true, margin: 0,
      });
    });
    s.addText(t.sources, {
      x: MARGIN, y: 6.0, w: W - 2 * MARGIN, h: 0.8, fontFace: FONT, fontSize: 11,
      color: MUTED, isTextBox: true, margin: 0,
    });
    s.addNotes(t.notes);
    footer(s);
  }

  await pres.writeFile({ fileName: OUT });
  console.log("wrote", OUT);
}

build().catch((e) => { console.error(e); process.exit(1); });
