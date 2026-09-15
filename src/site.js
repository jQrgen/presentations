// Builds site-<lang>/index.html: the browser viewer for the Nexa deck (titles and notes from content-<lang>.js).
// Usage: node site.js <en|no>   (env PPTX_URL, PDF_URL and HOME_URL add the download / overview links)
const path = require("path");
const { writeViewer } = require("./viewer.js");

const LANG = process.argv[2] || "en";
const T = require(`./content-${LANG}.js`);
const ORDER = ["title", "critique", "perTx", "chart", "absolute", "ntnu", "ewaste", "fair", "scale", "payments", "tokens", "capd", "contracts", "norway", "table", "closing"];

const META = {
  en: { pageTitle: "Nexa vs Bitcoin and Ethereum", meta: "16 slides · Jørgen S. Notland · Norway 2026" },
  no: { pageTitle: "Nexa mot Bitcoin og Ethereum", meta: "16 slides · Jørgen S. Notland · Norge 2026" },
}[LANG];

const spec = {
  lang: LANG,
  pageTitle: META.pageTitle,
  meta: META.meta,
  slides: ORDER.map((k) => ({ title: k === "title" ? T[k].headline : T[k].title, notes: T[k].notes })),
  pptxUrl: process.env.PPTX_URL || "",
  pdfUrl: process.env.PDF_URL || "",
  depth: "../../",
};

const out = writeViewer(spec, path.join(__dirname, `site-${LANG}`));
console.log("wrote", out, "slides:", spec.slides.length);
