// Grep gate for the all-teams page: fail (exit 1) if any forbidden term appears in the given files/dirs.
//   node orgchart/grep-gate.js <file-or-dir> [...]   [--terms <json>] (default: orgchart/forbidden-terms.json)
// Case-insensitive substring match; the term list lives in forbidden-terms.json so it can be extended.
const fs = require("fs");
const path = require("path");

const DEFAULT_TERMS = path.join(__dirname, "forbidden-terms.json");
const loadTerms = (f = DEFAULT_TERMS) => {
  const t = JSON.parse(fs.readFileSync(f, "utf8")).terms;
  if (!Array.isArray(t) || !t.length || t.some((x) => typeof x !== "string" || !x.trim())) throw new Error(`bad term list in ${f}`);
  return t;
};
const files = (p) => (fs.statSync(p).isDirectory() ? fs.readdirSync(p).flatMap((e) => files(path.join(p, e))) : [p]);

function scan(targets, terms = loadTerms()) {
  const hits = [];
  for (const f of targets.flatMap(files)) {
    const lines = fs.readFileSync(f, "utf8").split("\n");
    lines.forEach((line, i) => {
      const l = line.toLowerCase();
      for (const t of terms) if (l.includes(t.toLowerCase())) hits.push({ file: f, line: i + 1, term: t });
    });
  }
  return hits;
}
// prints a report; returns true when clean (never prints the matched text itself, only file, line and term)
function gate(targets, terms = loadTerms()) {
  const n = targets.flatMap(files).length;
  const hits = scan(targets, terms);
  if (!hits.length) { console.log(`grep gate: PASS (${n} file(s), ${terms.length} terms)`); return true; }
  console.error(`grep gate: FAIL, ${hits.length} hit(s) in ${n} file(s):`);
  for (const h of hits) console.error(`  ${h.file}:${h.line}  term "${h.term}"`);
  return false;
}
module.exports = { scan, gate, loadTerms };

if (require.main === module) {
  const argv = process.argv.slice(2);
  const ti = argv.indexOf("--terms");
  const terms = loadTerms(ti >= 0 ? argv[ti + 1] : undefined);
  const targets = argv.filter((a, i) => ti < 0 || (i !== ti && i !== ti + 1));
  if (!targets.length) { console.error("usage: node orgchart/grep-gate.js <file-or-dir> [...] [--terms <json>]"); process.exit(2); }
  for (const t of targets) if (!fs.existsSync(t)) { console.error(`grep gate: FAIL, missing ${t}`); process.exit(1); }
  process.exit(gate(targets, terms) ? 0 : 1);
}
