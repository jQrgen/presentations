// Adds the share buttons from share.js to a hand-written article page (one that has no builder). Idempotent:
// earlier injected blocks (between the share:begin/end markers) are removed first.
//   node inject-share.js <file.html> <url> <title> [en|no] [--after <html snippet>] [--css-vars "<css declarations>"]
// Default placement: right after the first </h1>'s next <p>…</p> byline if --after is not given, and again before </article>.
const fs = require("fs");
const share = require("./share.js");
const [file, url, title, lang = "en"] = process.argv.slice(2);
const opt = (k) => { const i = process.argv.indexOf(k); return i > 0 ? process.argv[i + 1] : undefined; };
if (!file || !url || !title) { console.error("usage: node inject-share.js <file.html> <url> <title> [en|no] [--after <snippet>] [--css-vars <decls>]"); process.exit(2); }
let s = fs.readFileSync(file, "utf8").replace(/\n?<!-- share:begin -->[\s\S]*?<!-- share:end -->/g, "");
const vars = opt("--css-vars");
const css = `\n<!-- share:begin --><style>${share.CSS}${vars ? `.share{${vars}}\n` : ""}</style><!-- share:end -->`;
const bar = `\n<!-- share:begin -->${share.bar({ url, title, lang })}<!-- share:end -->`;
const js = `\n<!-- share:begin -->${share.SCRIPT}<!-- share:end -->`;
const need = (cond, what) => { if (!cond) { console.error(`inject-share: ${what} not found in ${file}`); process.exit(1); } };
need(s.includes("\n</head>"), "</head>"); need(s.includes("\n</body>"), "</body>");
s = s.replace("\n</head>", css + "\n</head>");
const after = opt("--after");
if (after) { need(s.includes(after), "--after snippet"); s = s.replace(after, after + bar); }
else { const m = s.match(/<\/h1>\s*(<p>[\s\S]*?<\/p>)?/); need(m, "</h1>"); s = s.replace(m[0], m[0].trimEnd() + bar + m[0].slice(m[0].trimEnd().length)); }
if (s.includes("</article>")) s = s.replace("\n</article>", bar + "\n</article>");
s = s.replace("\n</body>", js + "\n</body>");
fs.writeFileSync(file, s);
console.log("inject-share: share buttons added to", file);
