// Nexa team org chart: docs/nexa-team/index.html, generated from the AI team roster.
//
//   node orgchart/build-orgchart.js            # snapshot the roster (if the agents dir exists), then render
//   node orgchart/build-orgchart.js --render   # render only, from src/data/nexa-team.json
//   options: --agents <dir> (default /home/box/agent-data/agents), --out <docsDir> (default ../docs)
//
// Roster source: <agents>/*/profile.json (name, description). A directory with group.json is a group chat
// (memberIds = agent directory names). Only Nexa team agents are published; ids, paths and descriptions are not.
// The snapshot keeps its "updated" date unless the published content changes, so re-running is idempotent.
const fs = require("fs");
const path = require("path");
const { head, esc } = require("../theme.js");

const arg = (k, d) => { const i = process.argv.indexOf(k); return i > 0 ? process.argv[i + 1] : d; };
const RENDER_ONLY = process.argv.includes("--render");
const AGENTS = arg("--agents", "/home/box/agent-data/agents");
const SRC = path.join(__dirname, "..");
const DOCS = path.resolve(arg("--out", path.join(SRC, "..", "docs")));
const SNAP = path.join(SRC, "data", "nexa-team.json");

// ---- who is not part of the Nexa team (private / generic bots and their group)
const EXCLUDE_IDS = new Set(["680befcc-f236-40de-a77d-7f0930ecb7d0", "207cf11b-c754-45d8-b61a-404d9cb352f2"]);
const EXCLUDE_NAMES = new Set(["Grok Bot", "Personal trainer", "Nutritionist", "Padel coach", "Kenyan run coach", "Personal health team"]);
const isNexa = (p) => /\bnexa\b/i.test(`${p.name} ${p.description || ""}`);

// ---- departments (report to jQrgen via Nexa Team Lead). Unknown Nexa agents land in Unassigned.
const TOP = ["jQrgen", "Nexa Team Lead"];
const DEPARTMENTS = [
  ["Strategy", ["Nexa strategist"]],
  ["Leadership", ["Nexa lead dev", "Nexa chief scientist"]],
  ["Engineering", ["Nexa core dev", "Nexa solution architect", "Rostrum dev", "Wally Dev", "Nexa game dev", "Nexa FPGA engineer", "Nexa security & audit"]],
  ["Product & Design", ["Nexa product manager", "Nexa designer", "Presentations"]],
  ["Go-to-market & Community", ["Marketing strategy", "Nexa media & communications", "Nexa DevRel & BON grants", "Nexa community manager", "Nexa exchanges & conferences"]],
  ["On-chain trading", ["Nexa trading strategist", "Nebula Trader", "Nexa on-chain analyst", "Nexa risk manager", "Nexa quant dev"]],
];
const LEADS = new Set(["Nexa trading strategist"]);
const GROUP_ORDER = ["Team Nexa", "Nexa leadership", "Nexa lead devs", "Nexa devs", "Nexa product", "Nexa go-to-market", "Nexa security", "Nexa on-chain trading"];

// ---- one-line role summaries (curated; new agents fall back to a line derived from their description)
const SUMMARY = {
  "Nexa Team Lead": "Coordinates the team: priorities, owners, follow-ups and status",
  "Nexa strategist": "Overall strategy, positioning, Scandinavia-first plan and goals",
  "Nexa lead dev": "Technical direction: architecture, roadmap, protocol changes",
  "Nexa chief scientist": "Protocol and consensus research, papers, design reviews",
  "Nexa core dev": "Full node, consensus, Tailstorm, block size and releases",
  "Nexa solution architect": "Reference architectures and integrations for builders",
  "Rostrum dev": "Rostrum, Nexa's Electrum-protocol indexing server",
  "Wally Dev": "Wally Wallet on Android, desktop and iOS",
  "Nexa game dev": "Games on Nexa and game-jam starter kits",
  "Nexa FPGA engineer": "NexaPow mining hardware: FPGA and HDL design",
  "Nexa security & audit": "Security reviews, threat models and audit prep",
  "Nexa product manager": "Developer product roadmap: wallet, SDKs, APIs, docs",
  "Nexa designer": "Design across the team, with design thinking",
  "Presentations": "Talks, pitch decks and these pages",
  "Marketing strategy": "Developer marketing plan, campaigns and events",
  "Nexa media & communications": "Announcements, posts, newsletters, content calendar",
  "Nexa DevRel & BON grants": "Developer onboarding, tutorials and BON grants",
  "Nexa community manager": "Developer community channels, updates, onboarding",
  "Nexa exchanges & conferences": "Exchange listings and conferences to attend",
  "Nexa trading strategist": "Leads the desk: a written, testable trading plan",
  "Nebula Trader": "Market analyst: exchanges, liquidity, price, volume",
  "Nexa on-chain analyst": "Trading signals from on-chain flows and token activity",
  "Nexa risk manager": "Position limits, loss limits and stop rules",
  "Nexa quant dev": "Data collectors, backtesting and paper trading",
};
function derive(desc) {
  let d = String(desc || "").replace(/\s*\([^)]*\)/g, "").replace(/\s+/g, " ").trim();
  const sents = d.split(/(?<=\.)\s+/).filter((s) => !/^(Covers the|jQrgen |Your job|Member of|Before adding|Ask jQrgen|Never )/.test(s));
  let s = (sents[1] || sents[0] || "").replace(/\.$/, "").split(/[:;]/)[0];
  return s.length > 70 ? s.slice(0, 67).replace(/\s+\S*$/, "") + "…" : s;
}

// ---- snapshot
function snapshot() {
  const dirs = fs.readdirSync(AGENTS).filter((d) => fs.existsSync(path.join(AGENTS, d, "profile.json")));
  const agents = {}, groups = [];
  for (const d of dirs) {
    if (EXCLUDE_IDS.has(d)) continue;
    const p = JSON.parse(fs.readFileSync(path.join(AGENTS, d, "profile.json"), "utf8"));
    if (EXCLUDE_NAMES.has(p.name)) continue;
    const g = path.join(AGENTS, d, "group.json");
    if (fs.existsSync(g)) groups.push({ name: p.name, ids: JSON.parse(fs.readFileSync(g, "utf8")).memberIds || [] });
    else if (isNexa(p)) agents[d] = p;
  }
  const deptOf = {}; DEPARTMENTS.forEach(([dep, names]) => names.forEach((n) => (deptOf[n] = dep)));
  const gl = groups.map((g) => ({ name: g.name, members: g.ids.filter((id) => agents[id]).map((id) => agents[id].name) }))
    .filter((g) => g.members.length)
    .sort((a, b) => ((GROUP_ORDER.indexOf(a.name) + 1) || 99) - ((GROUP_ORDER.indexOf(b.name) + 1) || 99) || a.name.localeCompare(b.name));
  const members = Object.values(agents).map((p) => ({
    name: p.name,
    role: SUMMARY[p.name] || derive(p.description),
    department: p.name === "Nexa Team Lead" ? "Team lead" : deptOf[p.name] || "Unassigned",
    ...(LEADS.has(p.name) ? { lead: true } : {}),
    groups: gl.filter((g) => g.members.includes(p.name)).map((g) => g.name),
  })).sort((a, b) => a.name.localeCompare(b.name));
  const data = { source: "jQrgen's AI team roster", departments: DEPARTMENTS.map(([d]) => d), members, groups: gl };
  let updated = new Date().toLocaleDateString("en-CA", { timeZone: "Europe/Oslo" });
  if (fs.existsSync(SNAP)) {
    const old = JSON.parse(fs.readFileSync(SNAP, "utf8"));
    const { updated: u, ...rest } = old;
    if (JSON.stringify(rest) === JSON.stringify(data)) updated = u;
  }
  fs.writeFileSync(SNAP, JSON.stringify({ updated, ...data }, null, 2) + "\n");
  console.log("snapshot", SNAP, members.length, "members,", gl.length, "groups, updated", updated);
}

// ---- render
const CSS = `
.band .tag{font-size:14px;opacity:.8}
.page,.band .inner{max-width:1280px}
.lede{max-width:70ch}
.updated{margin:10px 0 0;font-size:13px;color:var(--muted)}
h2.sec{font-size:22px;font-weight:500;margin:40px 0 14px;letter-spacing:-.01em}
.org{margin-top:28px}
.node{background:var(--paper);border:1px solid var(--line);padding:9px 11px}
.node .n{font-size:14.5px;font-weight:600;line-height:1.3}
.node .r{font-size:12.5px;color:var(--ink-2);line-height:1.35;margin-top:2px}
.node.top{background:var(--band);color:var(--band-ink);border-color:var(--band);text-align:center;width:260px;margin:0 auto}
.node.top .r{color:#D1D5DB}
.node .lead{display:inline-block;font-size:10.5px;letter-spacing:.08em;text-transform:uppercase;border:1px solid var(--line);padding:0 5px;margin-left:6px;vertical-align:2px;font-weight:500}
.vline{width:1px;height:20px;background:var(--line);margin:0 auto}
.depts{display:flex;gap:10px;align-items:flex-start}
.dept{flex:1 1 0;min-width:0;position:relative;padding-top:20px}
.dept::before{content:"";position:absolute;top:0;left:-5px;right:-5px;border-top:1px solid var(--line)}
.dept:first-child::before{left:50%}
.dept:last-child::before{right:50%}
.dept:only-child::before{display:none}
.dept::after{content:"";position:absolute;top:0;left:50%;height:20px;border-left:1px solid var(--line)}
.dept h3{margin:0;font-size:12px;letter-spacing:.08em;text-transform:uppercase;font-weight:600;background:var(--ink);color:var(--paper);padding:7px 8px;text-align:center;line-height:1.3;min-height:44px;display:flex;align-items:center;justify-content:center}
.dept ol{list-style:none;margin:0;padding:8px 0 0 12px;display:flex;flex-direction:column;gap:8px;margin-left:10px}
.dept li{position:relative}
.dept li::after{content:"";position:absolute;left:-12px;top:-8px;bottom:0;border-left:1px solid var(--line)}
.dept li:last-child::after{bottom:auto;height:26px}
.dept li::before{content:"";position:absolute;left:-12px;top:18px;width:12px;border-top:1px solid var(--line)}
.dept.unassigned h3{background:var(--paper);color:var(--ink);border:1px dashed var(--line)}
@media (max-width:980px){
  .depts{flex-direction:column;gap:18px}
  .dept{padding-top:0}
  .dept::before,.dept::after{display:none}
  .dept h3{min-height:0;justify-content:flex-start;text-align:left}
}
.groups{display:grid;grid-template-columns:repeat(auto-fill,minmax(240px,1fr));gap:12px}
.group{background:var(--paper);border:1px solid var(--line);padding:14px 16px}
.group h3{margin:0 0 6px;font-size:16px;font-weight:600}
.group .c{font-size:12px;color:var(--muted);margin:0 0 8px}
.group ul{margin:0;padding:0 0 0 18px;font-size:14px;line-height:1.55;color:var(--ink-2)}
footer.site{margin-top:48px;font-size:13px;color:var(--muted)}
footer.site a{color:inherit}
`;
function render() {
  const data = JSON.parse(fs.readFileSync(SNAP, "utf8"));
  const by = (n) => data.members.find((m) => m.name === n);
  const card = (m) => `<div class="node"><div class="n">${esc(m.name)}${m.lead ? '<span class="lead">Lead</span>' : ""}</div><div class="r">${esc(m.role)}</div></div>`;
  const order = Object.fromEntries(DEPARTMENTS.map(([d, names]) => [d, names]));
  const depts = [...data.departments, "Unassigned"].map((d) => {
    const ms = data.members.filter((m) => m.department === d)
      .sort((a, b) => (b.lead ? 1 : 0) - (a.lead ? 1 : 0) || ((order[d] || []).indexOf(a.name) - (order[d] || []).indexOf(b.name)) || a.name.localeCompare(b.name));
    return ms.length ? `
      <section class="dept${d === "Unassigned" ? " unassigned" : ""}" aria-label="${esc(d)}"><h3>${esc(d)}</h3>
        <ol>${ms.map((m) => `<li>${card(m)}</li>`).join("")}</ol></section>` : "";
  }).join("");
  const lead = by("Nexa Team Lead");
  const fmt = new Date(data.updated + "T12:00:00Z").toLocaleDateString("en-GB", { day: "numeric", month: "long", year: "numeric" });
  const html = head("Nexa team: org chart").replace("</style>", CSS + "</style>") + `<div class="band"><div class="inner">
    <a class="name" href="../">Jørgen S. Notland</a><span class="tag">All talks, articles and papers</span>
  </div></div>
<div class="page">
  <header>
    <h1>Nexa team: org chart</h1>
    <p class="lede">jQrgen's AI-assisted team setup. It mirrors the roles on <a href="https://nexa.org/team" rel="noopener">nexa.org/team</a>, plus roles he added: Strategist, DevRel &amp; BON grants, Product manager, Security &amp; audit and Game dev, and an on-chain trading desk.</p>
    <p class="updated">${data.members.length} roles · ${data.groups.length} group chats · Last updated <time datetime="${esc(data.updated)}">${esc(fmt)}</time></p>
  </header>
  <div class="org" role="tree" aria-label="Org chart">
    <div class="node top"><div class="n">jQrgen</div><div class="r">Bitcoin Unlimited / Nexa</div></div>
    <div class="vline"></div>
    ${lead ? `<div class="node top"><div class="n">${esc(lead.name)}</div><div class="r">${esc(lead.role)}</div></div>
    <div class="vline"></div>` : ""}
    <div class="depts">${depts}
    </div>
  </div>
  <h2 class="sec">Group chats</h2>
  <div class="groups">${data.groups.map((g) => `
    <section class="group"><h3>${esc(g.name)}</h3><p class="c">${g.members.length} members</p><ul>${g.members.map((n) => `<li>${esc(n)}</li>`).join("")}</ul></section>`).join("")}
  </div>
  <footer class="site">Generated by src/orgchart/build-orgchart.js from src/data/nexa-team.json · <a href="https://github.com/jQrgen/presentations">github.com/jQrgen/presentations</a></footer>
</div>
</body>
</html>
`;
  const out = path.join(DOCS, "nexa-team");
  fs.mkdirSync(out, { recursive: true });
  fs.writeFileSync(path.join(out, "index.html"), html);
  console.log("wrote", path.join(out, "index.html"));
}

if (!RENDER_ONLY && fs.existsSync(AGENTS)) snapshot();
render();
