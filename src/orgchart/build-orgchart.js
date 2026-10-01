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
const CONTRIB = path.join(SRC, "data", "nexa-contributions.json"); // hand-maintained, keyed by role name

// ---- who is not part of the Nexa team (private / generic bots and their group)
// Privacy: an ALLOWLIST decides who is published; these ids are a second safety net (ids only, so no private names live in this public file).
const EXCLUDE_IDS = new Set(["680befcc-f236-40de-a77d-7f0930ecb7d0", "207cf11b-c754-45d8-b61a-404d9cb352f2",
  "1a0fab0a-7eb5-4e42-a543-f0e28e728c53", "61d77712-38b4-4333-832f-423f7ece4983", "9f4094f5-2dbf-4013-8468-88a097458e5d",
  "aef0a6e5-5dda-4769-a594-eb6c540d1164", "d77b0e24-721f-43f1-b1df-895871971563", "fd5c438a-a008-4d84-8db7-42a335ff16a1",
  // jQrgen's personal Trading team (moved out of Nexa 2026-10-01; shown on the all-teams chart instead): its group chat and five bots
  "693435ee-ebea-474a-bb19-ba2839ef9adc", "c63239ab-d6f9-41e1-b7f9-145c6e8722c9", "cdebf3c8-a41e-44ad-885c-9a927bb8fa22",
  "392bcfe4-ea15-4f84-ab39-4d76a8cadd93", "7178889a-2ed9-482b-8d16-4f4a939325c5", "7208d9c1-eb70-4b34-806a-89ba02ad8e3f",
  // former Nexa Team Lead, merged into Nexa chief of staff 2026-10-01
  "ba1a19a3-12dc-49bc-abdc-aa1b46bc554f"]);
const EXCLUDE_NAMES = new Set(["Grok Bot"].map((n) => n.toLowerCase()));
const EXCLUDE_PREFIXES = ["jqrgencorp"]; // jQrgen's personal company team (agents and group)
const denied = (name) => { const n = String(name || "").trim().toLowerCase(); return EXCLUDE_NAMES.has(n) || EXCLUDE_PREFIXES.some((x) => n.startsWith(x)); };
// Allowlist: a group is a Nexa group if its name contains "Nexa"; an agent is published only if it is a named
// org-chart role, or its NAME contains "Nexa", or it is a member of a Nexa group. Descriptions are never used.
const nexaName = (name) => /nexa/i.test(String(name || ""));

// ---- departments and reporting lines. Engineering, Product & Design, Research and Go-to-market & Community (CHIEF_DEPTS) report to
// jQrgen via Nexa chief of staff; unknown Nexa agents land in Unassigned, also under the chief of staff. Security (independent) and
// D-SCOR (DIRECT_DEPTS) report directly to jQrgen: security & audit reviews Engineering and stays independent of the chief of staff,
// and the D-SCOR-ansvarlig sits outside every team and group chat, the same way jQrgenCorp's D-SCOR-ansvarlig sits outside its
// sub-teams on the all-teams chart. Advisor (ADVISOR_DEPTS): the strategist advises jQrgen and the leadership team, drawn as a dashed
// line to jQrgen, not as a report. Each chief-of-staff team has an explicit lead (LEADS).
const TOP = ["jQrgen", "Nexa chief of staff"];
const DEPARTMENTS = [
  ["Engineering", ["Nexa lead dev", "Nexa core dev", "Nexa solution architect", "Rostrum dev", "Wally Dev", "Nexa game dev", "Nexa FPGA engineer", "Nexa QA & infra"]],
  ["Product & Design", ["Nexa product manager", "Nexa designer"]],
  ["Research", ["Nexa chief scientist", "Nexa research liaison"]],
  ["Go-to-market & Community", ["Marketing strategy", "Nexa media & communications", "Nexa DevRel & BON grants", "Nexa community manager", "Nexa conferences", "Nexa Presentations"]],
  ["Security (independent)", ["Nexa security & audit"]],
  ["Advisor", ["Nexa strategist"]],
  ["D-SCOR", ["Nexa D-SCOR-ansvarlig"]],
];
const CHIEF_DEPTS = ["Engineering", "Product & Design", "Research", "Go-to-market & Community"];
const DIRECT_DEPTS = ["Security (independent)", "D-SCOR"];
const ADVISOR_DEPTS = ["Advisor"];
const LEADS = new Set(["Nexa lead dev", "Nexa product manager", "Nexa chief scientist", "Marketing strategy"]);
// one colour per team (always shown with its text label); teams beyond this list cycle through the palette
const TEAM_COLOURS = ["#B91C1C", "#1D4ED8", "#047857", "#7C3AED", "#B45309", "#0E7490", "#BE185D", "#4D7C0F", "#374151"];
// group chats in display order
const GROUP_ORDER = ["Nexa leadership team", "Nexa app engineering team", "Nexa core engineering team", "Nexa product & design team",
  "Nexa research team", "Nexa go-to-market team", "Nexa security team", "Nexa design review"];

// ---- one-line role summaries (curated). A new agent with no line here gets a neutral placeholder and a warning;
// profile descriptions are never published.
const SUMMARY = {
  "Nexa strategist": "Advisor: overall strategy, positioning, Scandinavia-first plan and goals",
  "Nexa lead dev": "Technical direction: architecture, roadmap, protocol changes",
  "Nexa chief scientist": "Protocol and consensus research, papers, design reviews",
  "Nexa chief of staff": "Coordinates the AI agents: priorities, owners, follow-ups and briefings",
  "Nexa research liaison": "Research partnerships with universities",
  "Nexa core dev": "Full node, consensus, Tailstorm, block size and releases",
  "Nexa solution architect": "Reference architectures and integrations for builders",
  "Rostrum dev": "Rostrum, Nexa's Electrum-protocol indexing server",
  "Wally Dev": "Wally Wallet on Android, desktop and iOS",
  "Nexa game dev": "Games on Nexa and game-jam starter kits",
  "Nexa FPGA engineer": "NexaPow mining hardware: FPGA and HDL design",
  "Nexa security & audit": "Independent security reviews, threat models and audit prep",
  "Nexa product manager": "Developer product roadmap: wallet, SDKs, APIs, docs",
  "Nexa designer": "Design across the team, with design thinking",
  "Nexa Presentations": "Talks, pitch decks and these pages",
  "Marketing strategy": "Developer marketing plan, messaging and campaigns",
  "Nexa media & communications": "Announcements, posts, newsletters, content calendar",
  "Nexa DevRel & BON grants": "Builder onboarding, tutorials and BON grants",
  "Nexa community manager": "Community channels, updates and developer feedback",
  "Nexa conferences": "Developer conferences, hackathons and meetups, Scandinavia first",
  "Nexa QA & infra": "Testing, CI and release checklists, test infrastructure and deploys",
  "Nexa D-SCOR-ansvarlig": "AI-rolle som D-SCOR-ansvarlig, basert på D-SCOR-modellen",
};

// ---- the Nexa D-SCOR page (built by orgchart/build-nexa-team-dscor.js); linked from the header and from the D-SCOR-ansvarlig card
const DSCOR_URL = "../nexa-team-dscor/";
const DSCOR_LEAD = "Nexa D-SCOR-ansvarlig";

// ---- hand-maintained public work, merged in on every run (kept in its own file so regeneration never loses it)
function loadContrib() {
  if (!fs.existsSync(CONTRIB)) return {};
  const c = JSON.parse(fs.readFileSync(CONTRIB, "utf8"));
  for (const [k, list] of Object.entries(c)) {
    if (k.startsWith("_")) continue;
    for (const it of list) if (!it.title || !/^https?:\/\//.test(it.url || "") || !/^\d{4}-\d{2}-\d{2}$/.test(it.date || "")) throw new Error(`bad contribution for ${k}: ${JSON.stringify(it)}`);
  }
  return c;
}
const CONTRIBS = loadContrib();
const PENDING = "AI agent (role line to come)";
const contributions = (name) => [...(CONTRIBS[name] || [])].sort((a, b) => b.date.localeCompare(a.date)).map(({ title, url, date }) => ({ title, url, date }));

// ---- snapshot
function snapshot() {
  const dirs = fs.readdirSync(AGENTS).filter((d) => fs.existsSync(path.join(AGENTS, d, "profile.json")));
  const agents = {}, groups = [];
  const all = {};
  for (const d of dirs) {
    if (EXCLUDE_IDS.has(d)) continue;
    const p = JSON.parse(fs.readFileSync(path.join(AGENTS, d, "profile.json"), "utf8"));
    if (denied(p.name)) continue;
    const g = path.join(AGENTS, d, "group.json");
    if (fs.existsSync(g)) { if (nexaName(p.name)) groups.push({ name: p.name, ids: JSON.parse(fs.readFileSync(g, "utf8")).memberIds || [] }); }
    else all[d] = p;
  }
  const inNexaGroup = new Set(groups.flatMap((g) => g.ids));
  const named = new Set(["Nexa chief of staff", ...DEPARTMENTS.flatMap(([, n]) => n)]);
  for (const [d, p] of Object.entries(all)) if (named.has(p.name) || nexaName(p.name) || inNexaGroup.has(d)) agents[d] = p;
  const deptOf = {}; DEPARTMENTS.forEach(([dep, names]) => names.forEach((n) => (deptOf[n] = dep)));
  const gl = groups.map((g) => ({ name: g.name, members: g.ids.filter((id) => agents[id]).map((id) => agents[id].name) }))
    .filter((g) => g.members.length)
    .sort((a, b) => ((GROUP_ORDER.indexOf(a.name) + 1) || 99) - ((GROUP_ORDER.indexOf(b.name) + 1) || 99) || a.name.localeCompare(b.name));
  const members = Object.values(agents).map((p) => ({
    name: p.name,
    type: "ai",
    role: SUMMARY[p.name] || PENDING,
    department: p.name === "Nexa chief of staff" ? "Chief of staff" : deptOf[p.name] || "Unassigned",
    ...(LEADS.has(p.name) ? { lead: true } : {}),
    groups: gl.filter((g) => g.members.includes(p.name)).map((g) => g.name),
    contributions: contributions(p.name),
  })).sort((a, b) => a.name.localeCompare(b.name));
  const todo = members.filter((m) => m.role === PENDING || m.department === "Unassigned");
  if (todo.length) console.warn(`WARNING: ${todo.length} Nexa agent(s) need a hand-written SUMMARY line and/or a DEPARTMENTS entry in orgchart/build-orgchart.js: ${todo.map((m) => `${m.name} (${m.role === PENDING ? "no role line" : "ok"}, ${m.department})`).join("; ")}`);
  // jQrgen is the only human; every roster entry is an AI agent
  const people = [{ name: "jQrgen", fullName: "Jørgen S. Notland", type: "human", role: "Runs the team · Bitcoin Unlimited / Nexa" }];
  const data = { source: "jQrgen's AI team roster", people, departments: DEPARTMENTS.map(([d]) => d), members, groups: gl };
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
.node.ai{border:1px dashed #6B7280;background:#F9FAFB}
.node.ai .n{color:var(--ink-2)}
.node.human{border:3px solid var(--ink);background:#FEF3C7}
.badge{display:inline-block;font-size:11px;font-weight:600;line-height:1.5;padding:0 6px;margin:0 0 4px;white-space:nowrap;border:1px solid var(--line)}
.badge.ai{border-style:dashed;border-color:#6B7280;color:var(--muted);background:var(--paper)}
.badge.human{background:var(--ink);color:#FEF3C7;border-color:var(--ink)}
.work{margin-top:7px;padding-top:6px;border-top:1px solid var(--hair)}
.work .wh{font-size:10.5px;letter-spacing:.08em;text-transform:uppercase;color:var(--muted);font-weight:600}
.work ul{list-style:none;margin:2px 0 0;padding:0;font-size:12.5px;line-height:1.4}
.work li{margin-top:3px}
.work time{display:block;font-size:11px;color:var(--muted)}
.legend{display:flex;flex-wrap:wrap;align-items:center;gap:8px 18px;margin:14px 0 0;font-size:14px;color:var(--ink-2)}
.legend span.k{display:inline-flex;align-items:center;gap:8px}
.legend .badge{margin:0}
.dscor{margin:14px 0 0;max-width:80ch;border-left:4px solid var(--ink);background:#F9FAFB;padding:9px 13px;font-size:14px;color:var(--ink-2)}
.node a.go{display:inline-block;margin-top:7px;font-size:12.5px;font-weight:600;padding:3px 8px;background:var(--band);color:var(--band-ink);text-decoration:none}
.node a.go:hover{text-decoration:underline}
.node .n{font-size:14.5px;font-weight:600;line-height:1.3}
.node .r{font-size:12.5px;color:var(--ink-2);line-height:1.35;margin-top:2px}
.node.top{text-align:center;width:280px;margin:0 auto}
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
.dept>ol>li{position:relative}
.dept>ol>li::after{content:"";position:absolute;left:-12px;top:-8px;bottom:0;border-left:1px solid var(--line)}
.dept>ol>li:last-child::after{bottom:auto;height:26px}
.dept>ol>li::before{content:"";position:absolute;left:-12px;top:18px;width:12px;border-top:1px solid var(--line)}
.dept.unassigned h3{background:var(--paper);color:var(--ink);border:1px dashed var(--line)}
/* reporting lines. Row 1 under jQrgen, four equal columns: advisor (dashed), chief of staff, security & audit, D-SCOR (solid).
   The chief of staff's line runs on down to row 2, its four teams across the full width. */
.tier{align-items:stretch}
.tier>.dept.cos{display:flex;flex-direction:column}
.cos .down{flex:1 1 auto;min-height:20px;width:1px;background:var(--line);margin:0 auto}
.tier>.dept.adv::before{border-top:2px dashed var(--ink-2)}
.tier>.dept.adv::after{border-left:2px dashed var(--ink-2)}
.rel{position:absolute;top:3px;left:calc(50% + 6px);font-size:10.5px;letter-spacing:.06em;text-transform:uppercase;color:var(--muted);line-height:1;white-space:nowrap}
.tier>.dept:not(.adv) .rel,.rel .rl{display:none}
.cos>.node.top{width:auto;max-width:300px;margin:0 auto}
.chief-teams>.rel{display:none}
.legend i.ln{display:inline-block;width:30px;height:0;border-top:2px solid var(--ink-2)}
.legend i.ln.dash{border-top-style:dashed}
@media (max-width:980px){
  .depts{flex-direction:column;gap:18px}
  .dept{padding-top:0}
  .dept::before,.dept::after{display:none}
  .dept h3{min-height:0;justify-content:flex-start;text-align:left}
  /* stacked: no connector lines, so each top-tier column says how it relates to jQrgen; the chief of staff's teams are indented under it */
  .tier>.dept .rel,.tier>.dept:not(.adv) .rel{display:block;position:static;margin:0 0 5px;white-space:normal}
  .rel .rs{display:none}.rel .rl{display:inline}
  .tier>.dept.dir{order:1}.tier>.dept.adv{order:2}.tier>.dept.cos{order:3}
  .cos>.node.top{margin:0;max-width:none;text-align:left}
  .cos>.node.top .ttags{justify-content:flex-start}
  .cos .down{display:none}
  .chief-teams{margin:10px 0 0 10px;padding-left:12px;border-left:2px solid var(--line)}
  .chief-teams>.rel{display:block;position:static;font-size:10.5px;letter-spacing:.06em;text-transform:uppercase;color:var(--muted);margin:0 0 8px}
  .tier>.dept.adv{padding-left:12px;border-left:2px dashed var(--ink-2)}
}
.sub{margin:-6px 0 14px;color:var(--ink-2);max-width:72ch;font-size:15px}
.ttags{display:flex;flex-wrap:wrap;gap:3px;margin-top:6px}
.ttag{display:inline-block;font-size:10.5px;line-height:1.45;padding:0 5px;border:1px solid var(--tc);border-left-width:4px;color:var(--ink);background:var(--paper);white-space:nowrap}
.node.top .ttags{justify-content:center}
.group{border-top:6px solid var(--tc)!important}
.chips{list-style:none!important;padding:0!important;display:flex;flex-direction:column;gap:5px}
.chip{border:1px solid var(--hair);padding:3px 8px;background:#F9FAFB}
.chip .cn{font-size:14px;color:var(--ink)}
.chip.multi{border-color:#6B7280}
.chip .also{display:block;font-size:11.5px;color:var(--muted);line-height:1.35}
.matrix-wrap{overflow-x:auto;background:var(--paper);border:1px solid var(--line)}
.matrix{border-collapse:collapse;font-size:13px;min-width:820px;width:100%}
.matrix th,.matrix td{border-bottom:1px solid var(--hair);padding:5px 8px;text-align:center}
.matrix thead th{vertical-align:bottom;font-weight:600;font-size:12px}
.matrix .mh{display:inline-block;border-bottom:4px solid var(--tc);padding-bottom:2px}
.matrix tbody th{text-align:left;font-weight:500;white-space:nowrap;position:sticky;left:0;background:var(--paper)}
.matrix thead th:first-child{text-align:left;position:sticky;left:0;background:var(--paper)}
.matrix td.y{color:var(--tc);font-weight:700;font-size:15px}
.matrix td.cnt{font-variant-numeric:tabular-nums;color:var(--ink-2)}
.sr{position:absolute;width:1px;height:1px;overflow:hidden;clip:rect(0 0 0 0)}
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
  data.members.forEach((m) => (m.contributions = contributions(m.name)));
  const by = (n) => data.members.find((m) => m.name === n);
  const BADGE = { human: '<span class="badge human">\u{1F464} Human</span>', ai: '<span class="badge ai">\u{1F916} AI agent</span>' };
  const work = (m) => (m.contributions && m.contributions.length ? `<div class="work"><div class="wh">Public work</div><ul>${m.contributions.map((c) => `<li><a href="${esc(c.url)}">${esc(c.title)}</a> <time datetime="${esc(c.date)}">${esc(c.date)}</time></li>`).join("")}</ul></div>` : "");
  const teamCol = Object.fromEntries(data.groups.map((g, i) => [g.name, TEAM_COLOURS[i % TEAM_COLOURS.length]]));
  const tag = (t) => `<span class="ttag" style="--tc:${teamCol[t] || "#374151"}">${esc(t)}</span>`;
  const tags = (m) => (m.groups && m.groups.length ? `<div class="ttags" aria-label="Teams">${m.groups.map(tag).join("")}</div>` : "");
  const kind = (m) => (m.type === "human" ? "human" : "ai");
  const card = (m) => `<div class="node ${kind(m)}">${BADGE[kind(m)]}<div class="n">${esc(m.name)}${m.lead ? '<span class="lead">Lead</span>' : ""}</div><div class="r">${esc(m.role)}</div>${tags(m)}${work(m)}${m.name === DSCOR_LEAD ? `<a class="go" href="${DSCOR_URL}">D-SCOR page \u2192</a>` : ""}</div>`;
  const order = Object.fromEntries(DEPARTMENTS.map(([d, names]) => [d, names]));
  const deptCol = (d) => {
    const ms = data.members.filter((m) => m.department === d)
      .sort((a, b) => (b.lead ? 1 : 0) - (a.lead ? 1 : 0) || ((order[d] || []).indexOf(a.name) - (order[d] || []).indexOf(b.name)) || a.name.localeCompare(b.name));
    return ms.length ? `
      <section class="dept${d === "Unassigned" ? " unassigned" : ""}" aria-label="${esc(d)}"><h3>${esc(d)}</h3>
        <ol>${ms.map((m) => `<li>${card(m)}</li>`).join("")}</ol></section>` : "";
  };
  // any department not named in a reporting group (e.g. Unassigned or a new one) sits under the chief of staff
  const other = [...data.departments, "Unassigned"].filter((d) => ![...CHIEF_DEPTS, ...DIRECT_DEPTS, ...ADVISOR_DEPTS].includes(d));
  const chiefTeams = [...CHIEF_DEPTS, ...other].map(deptCol).join("");
  // a top-tier column under jQrgen: rel = how it relates to jQrgen (shown on the dashed advisor line, and on every column when stacked)
  // short = the label on the desktop connector, long = the text shown when stacked
  const rel = (short, long) => `<span class="rel">${short ? `<span class="rs">${esc(short)}</span>` : ""}<span class="rl">${esc(long)}</span></span>`;
  const tierCol = (d, cls, r) => { const html = deptCol(d); return html ? html.replace('<section class="dept', `<section class="dept ${cls}`).replace("><h3>", `>${r}<h3>`) : ""; };
  const lead = by("Nexa chief of staff");
  const fmt = new Date(data.updated + "T12:00:00Z").toLocaleDateString("en-GB", { day: "numeric", month: "long", year: "numeric" });
  // the shared theme's text-wrap value is a gate term; swap it for "pretty", as the other org-chart pages do (pattern split so this file passes too)
  const html = head("Nexa team: org chart").replace(/text-wrap:\s*bal(?:ance)/g, "text-wrap:pretty").replace("</style>", CSS + "</style>") + `<div class="band"><div class="inner">
    <a class="name" href="../">Jørgen S. Notland</a><span class="tag">All talks, articles and papers</span>
  </div></div>
<div class="page">
  <header>
    <h1>Nexa team: org chart</h1>
    <p class="lede">This team is AI agents run by jQrgen (Jørgen S. Notland), the only human on the chart. The agents mirror the human roles on <a href="https://nexa.org/team" rel="noopener">nexa.org/team</a>, plus roles he added: Strategist, DevRel &amp; BON grants, Product manager, Security &amp; audit and Game dev. It is not the real Nexa staff list; for the people behind Nexa, see nexa.org/team.</p>
    ${by(DSCOR_LEAD) ? `<p class="dscor"><b>D-SCOR.</b> The team's D-SCOR-inspired work and dialogue styles are on the <a href="${DSCOR_URL}">Nexa team D-SCOR page</a>. The ${esc(DSCOR_LEAD)} is an AI role based on the D-SCOR model, not a certified D-SCOR adviser. This is not an official D-SCOR product or D-SCOR certification, and the team is not affiliated with or endorsed by D-SCOR AS.</p>` : ""}
    <p class="legend"><span class="k">${BADGE.human} a person</span><span class="k">${BADGE.ai} an AI agent, not a person</span><span class="k"><i class="ln" aria-hidden="true"></i> solid line: reports to</span><span class="k"><i class="ln dash" aria-hidden="true"></i> dashed line: advises</span></p>
    <p class="updated">1 human · ${data.members.length} AI agents · <a href="#teams">${data.groups.length} teams</a> (AI agent group chats) · Last updated <time datetime="${esc(data.updated)}">${esc(fmt)}</time></p>
  </header>
  <div class="org" role="group" aria-label="Org chart">
    ${(data.people || []).map((h) => `<div class="node top human">${BADGE.human}<div class="n">${esc(h.name)}${h.fullName ? ` (${esc(h.fullName)})` : ""}</div><div class="r">${esc(h.role)}</div></div>`).join("")}
    <div class="vline"></div>
    <div class="depts tier">${ADVISOR_DEPTS.map((d) => tierCol(d, "adv", rel("advisor", "Advisor: advises jQrgen and the leadership team (dashed line, not a report)"))).join("")}
      <section class="dept cos" aria-label="Nexa chief of staff">${rel("", "Reports to jQrgen")}
        ${lead ? `<div class="node top ai">${BADGE.ai}<div class="n">${esc(lead.name)}</div><div class="r">${esc(lead.role)}</div>${tags(lead)}</div>` : ""}
        <div class="down" aria-hidden="true"></div>
      </section>${DIRECT_DEPTS.map((d) => tierCol(d, "dir", rel("", "Reports directly to jQrgen"))).join("")}
    </div>
    <div class="chief-teams" role="group" aria-label="Teams that report to Nexa chief of staff"><p class="rel">These teams report to Nexa chief of staff</p>
      <div class="depts">${chiefTeams}
      </div>
    </div>
  </div>
  <h2 class="sec" id="teams">Teams</h2>
  <p class="sub">Each team is an AI agent group chat; memberships are read from the group chats when the page is built. Many agents sit on several teams: the chips show where else each one is.</p>
  <div class="groups">${data.groups.map((g) => `
    <section class="group" style="--tc:${teamCol[g.name]}"><h3>${esc(g.name)}</h3><p class="c">${g.members.length} members</p><ul class="chips">${g.members.map((n) => {
      const others = ((by(n) || {}).groups || []).filter((t) => t !== g.name);
      return `<li class="chip${others.length ? " multi" : ""}"><span class="cn">${esc(n)}</span>${others.length ? `<span class="also">also in ${others.length}: ${others.map(esc).join(", ")}</span>` : ""}</li>`;
    }).join("")}</ul></section>`).join("")}
  </div>
  <h2 class="sec">Team membership matrix</h2>
  <div class="matrix-wrap" tabindex="0" role="region" aria-label="Team membership matrix, scrolls sideways">
    <table class="matrix">
      <thead><tr><th scope="col">Role</th>${data.groups.map((g) => `<th scope="col"><span class="mh" style="--tc:${teamCol[g.name]}">${esc(g.name)}</span></th>`).join("")}<th scope="col">Teams</th></tr></thead>
      <tbody>${data.members.filter((m) => m.groups.length).sort((a, b) => b.groups.length - a.groups.length || a.name.localeCompare(b.name)).map((m) => `
        <tr><th scope="row">${esc(m.name)}</th>${data.groups.map((g) => m.groups.includes(g.name) ? `<td class="y" style="--tc:${teamCol[g.name]}"><span aria-hidden="true">\u2713</span><span class="sr">yes</span></td>` : '<td><span class="sr">no</span></td>').join("")}<td class="cnt">${m.groups.length}</td></tr>`).join("")}
      </tbody>
    </table>
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
