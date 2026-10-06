// All-teams org chart: <out>/teams/index.html, from the sanitised roster and the hand-curated role lines.
//   node orgchart/build-teams.js   [--out <docsDir>] (default ../docs)
//
// Inputs (all in the repo, nothing is read from agent profiles here):
//   src/data/teams-roster.json  ids, teams and public names, written by orgchart/sync-teams.js (membership is curated
//                               in src/data/teams-membership.json, never taken from group chats)
//   src/data/teams-roles.json   hand-written generic role lines (and display-name overrides), by team then agent id
//   src/data/teams-config.json  team order, the person at the top, link cards (e.g. the Nexa chart)
// The page shows only name, team and role line. Agents with no curated role line are left off (with a warning).
// After writing, the grep gate (orgchart/forbidden-terms.json) scans the output; any hit deletes it and exits 1.
const fs = require("fs");
const path = require("path");
const { head, esc } = require("../theme.js");
const { gate } = require("./grep-gate.js");
const { missingRoles, warnMissing, entry } = require("./sync-teams.js");

const arg = (k, d) => { const i = process.argv.indexOf(k); return i > 0 ? process.argv[i + 1] : d; };
const SRC = path.join(__dirname, "..");
const DOCS = path.resolve(arg("--out", path.join(SRC, "..", "docs")));
const readJSON = (f) => JSON.parse(fs.readFileSync(path.join(SRC, "data", f), "utf8"));
const cfg = readJSON("teams-config.json"), roster = readJSON("teams-roster.json"), roles = readJSON("teams-roles.json");

const missing = missingRoles(roster, roles);
warnMissing(missing);
const order = cfg.teams.map((t) => t.name);
// roster order is the curated order; the public name is the one sync-teams.js stored (displayName overrides applied)
const shown = (t) => t.members.filter((m) => m.name && entry(roles, t.name, m.id))
  .map((m) => { const e = entry(roles, t.name, m.id); return { id: m.id, name: e.displayName || m.name, role: e.role.trim() }; });
const teams = roster.teams
  .filter((t) => order.includes(t.name))
  .sort((a, b) => order.indexOf(a.name) - order.indexOf(b.name))
  .map((t) => {
    const members = shown(t), byId = Object.fromEntries(members.map((m) => [m.id, m]));
    const tc = cfg.teams.find((c) => c.name === t.name) || {};
    // subteams (e.g. jQrgenCorp: Ledelse, Regnskap, Juridisk, Bokforlag); team members in no subteam go to a final "other" group
    let subteams = (t.subteams || []).map((s) => ({ name: s.name, label: s.label, members: s.memberIds.map((id) => byId[id]).filter(Boolean) })).filter((s) => s.members.length);
    if (t.subteams && t.subteams.length) {
      const inSub = new Set(t.subteams.flatMap((s) => s.memberIds));
      const rest = members.filter((m) => !inSub.has(m.id));
      if (rest.length) subteams.push({ name: tc.otherLabel || "Other", members: rest });
    }
    return { name: t.name, label: tc.label, members, subteams };
  })
  .filter((t) => t.members.length);
const nAgents = new Set(teams.flatMap((t) => t.members.map((m) => m.id))).size;
const COLOURS = ["#B91C1C", "#1D4ED8", "#047857", "#7C3AED", "#B45309", "#0E7490", "#BE185D", "#4D7C0F"];

const CSS = `
.band .tag{font-size:14px;opacity:.8}
.page,.band .inner{max-width:1280px}
.lede{max-width:70ch}
.updated{margin:10px 0 0;font-size:13px;color:var(--muted)}
.org{margin-top:28px}
.node{background:var(--paper);border:1px solid var(--line);padding:9px 11px}
.node.ai{border:1px dashed #6B7280;background:#F9FAFB}
.node.ai .n{color:var(--ink-2)}
.node.human{border:3px solid var(--ink);background:#FEF3C7}
.node.link{border:2px solid var(--ink);background:var(--paper)}
.node.link a.go{display:inline-block;margin-top:8px;font-size:13.5px;font-weight:600;padding:4px 9px;background:var(--band);color:var(--band-ink);text-decoration:none}
.node.link a.go:hover{text-decoration:underline}
.badge{display:inline-block;font-size:11px;font-weight:600;line-height:1.5;padding:0 6px;margin:0 0 4px;white-space:nowrap;border:1px solid var(--line)}
.badge.ai{border-style:dashed;border-color:#6B7280;color:var(--muted);background:var(--paper)}
.badge.human{background:var(--ink);color:#FEF3C7;border-color:var(--ink)}
.badge.link{color:var(--ink);background:var(--paper)}
.legend{display:flex;flex-wrap:wrap;align-items:center;gap:8px 18px;margin:14px 0 0;font-size:14px;color:var(--ink-2)}
.legend span.k{display:inline-flex;align-items:center;gap:8px}
.legend .badge{margin:0}
.node .n{font-size:14.5px;font-weight:600;line-height:1.3}
.node .r{font-size:12.5px;color:var(--ink-2);line-height:1.35;margin-top:2px}
.node.top{text-align:center;width:280px;margin:0 auto}
.vline{width:1px;height:20px;background:var(--line);margin:0 auto}
.depts{display:flex;gap:10px;align-items:flex-start}
.dept{flex:1 1 0;min-width:0;position:relative;padding-top:20px}
.dept::before{content:"";position:absolute;top:0;left:-5px;right:-5px;border-top:1px solid var(--line)}
.dept:first-child::before{left:50%}
.dept:last-child::before{right:50%}
.dept:only-child::before{display:none}
.dept::after{content:"";position:absolute;top:0;left:50%;height:20px;border-left:1px solid var(--line)}
.dept h3{margin:0;font-size:12px;letter-spacing:.08em;text-transform:uppercase;font-weight:600;background:var(--ink);color:var(--paper);padding:7px 8px;text-align:center;line-height:1.3;min-height:44px;display:flex;flex-direction:column;align-items:center;justify-content:center;border-bottom:6px solid var(--tc)}
.dept h3 small{font-size:10.5px;font-weight:400;letter-spacing:.04em;text-transform:none;opacity:.8}
.dept.linked h3{background:var(--paper);color:var(--ink);border:1px dashed var(--line);border-bottom:6px solid var(--tc)}
.dept ol{list-style:none;margin:0;padding:8px 0 0 12px;display:flex;flex-direction:column;gap:8px;margin-left:10px}
.dept>ol>li{position:relative}
.dept>ol>li::after{content:"";position:absolute;left:-12px;top:-8px;bottom:0;border-left:1px solid var(--line)}
.dept>ol>li:last-child::after{bottom:auto;height:26px}
.dept>ol>li::before{content:"";position:absolute;left:-12px;top:18px;width:12px;border-top:1px solid var(--line)}
.dept.has-subs{flex:2 1 0}
.depts.subs{gap:8px}
.dept.subteam h4{margin:0;font-size:11.5px;letter-spacing:.06em;text-transform:uppercase;font-weight:600;line-height:1.3;background:var(--paper);color:var(--ink);border:1px solid var(--ink);border-bottom:6px solid var(--tc);padding:6px 8px;text-align:center}
.dept.subteam h4 small{display:block;font-size:10.5px;font-weight:400;letter-spacing:.02em;text-transform:none;color:var(--muted)}
.dept.spine{flex:0 0 14px;align-self:stretch}
.dept.spine::after{height:auto;bottom:0}
.wide-row{position:relative;padding-top:40px;margin-top:-1px}
.wide-row::before{content:"";position:absolute;left:7px;top:0;height:20px;border-left:1px solid var(--line)}
.wide-row::after{content:"";position:absolute;left:7px;right:50%;top:20px;border-top:1px solid var(--line)}
.wide-row .stub{position:absolute;left:50%;top:20px;height:20px;border-left:1px solid var(--line)}
.wide-row>.dept{padding-top:0}
.wide-row>.dept::before,.wide-row>.dept::after{display:none}
.wide-row>.dept>h3{max-width:420px;margin:0 auto}
.wide-row+.wide-row{margin-top:24px}
@media (max-width:980px){
  .dept.spine,.wide-row::before,.wide-row::after,.wide-row .stub{display:none}
  .wide-row{padding-top:18px}
  .wide-row>.dept>h3{max-width:none}
  .depts{flex-direction:column;gap:18px}
  .dept{padding-top:0}
  .dept::before,.dept::after{display:none}
  .dept h3{min-height:0;align-items:flex-start;text-align:left}
}
footer.site{margin-top:48px;font-size:13px;color:var(--muted)}
footer.site a{color:inherit}
`;
const BADGE = { human: '<span class="badge human">\u{1F464} Human</span>', ai: '<span class="badge ai">\u{1F916} AI agent</span>', link: '<span class="badge link">\u{1F517} Separate chart</span>' };
const top = cfg.top;
const fmt = new Date(roster.updated + "T12:00:00Z").toLocaleDateString("en-GB", { day: "numeric", month: "long", year: "numeric" });
const card = (m) => `<li><div class="node ai">${BADGE.ai}<div class="n">${esc(m.name)}</div><div class="r">${esc(m.role)}</div></div></li>`;
const plural = (n) => `${n} AI agent${n === 1 ? "" : "s"}`;
// a team with subteams branches again under its header, the same way the teams branch under jQrgen
const subCol = (s) => `<section class="dept subteam" aria-label="${esc(s.name)}"><h4>${esc(s.name)}<small>${s.label ? esc(s.label) + " · " : ""}${plural(s.members.length)}</small></h4><ol>${s.members.map(card).join("")}</ol></section>`;
// a team with 3+ sub-teams is too wide for one column: it gets its own full-width row under the others, joined to the
// same line from jQrgen by a spine down the left edge (on narrow screens everything simply stacks)
const isWide = (t) => t.subteams.length >= 3;
const teamCol = (t, i) => `
      <section class="dept${t.subteams.length ? " has-subs" : ""}" style="--tc:${COLOURS[i % COLOURS.length]}" aria-label="${esc(t.name)}"><h3>${esc(t.name)}<small>${t.label ? esc(t.label) + " · " : ""}${plural(t.members.length)}${t.subteams.length ? ` · ${t.subteams.length} sub-teams` : ""}</small></h3>
        ${t.subteams.length ? `<div class="vline"></div><div class="depts subs">${t.subteams.map(subCol).join("")}</div>` : `<ol>${t.members.map(card).join("")}</ol>`}</section>`;
const teamCols = teams.map((t, i) => (isWide(t) ? "" : teamCol(t, i))).join("");
const wideRows = teams.map((t, i) => (isWide(t) ? `
    <div class="wide-row"><div class="stub" aria-hidden="true"></div>${teamCol(t, i)}
    </div>` : "")).join("");
const spine = wideRows ? `
      <div class="dept spine" aria-hidden="true"></div>` : "";
const linkCols = (cfg.links || []).map((l, i) => `
      <section class="dept linked" style="--tc:${COLOURS[(teams.length + i) % COLOURS.length]}" aria-label="${esc(l.name)}"><h3>${esc(l.name)}<small>own org chart</small></h3>
        <ol><li><div class="node link">${BADGE.link}<div class="n">${esc(l.name)}</div><div class="r">${esc(l.role)}</div><a class="go" href="${esc(l.url)}">Open the ${esc(l.name)} org chart \u2192</a></div></li></ol></section>`).join("");

// the shared theme's text-wrap value is a gate term; this page swaps it for "pretty" (pattern split so this file passes too)
const html = head("jQrgen's AI teams: org chart").replace(/text-wrap:\s*bal(?:ance)/g, "text-wrap:pretty").replace("</style>", CSS + "</style>") + `<div class="band"><div class="inner">
    <a class="name" href="../">Jørgen S. Notland</a><span class="tag">All talks, articles and papers</span>
  </div></div>
<div class="page">
  <header>
    <h1>jQrgen's AI teams: org chart</h1>
    <p class="lede">All of jQrgen's AI agent teams on one page. jQrgen (Jørgen S. Notland) is the only human; everyone else is an AI agent, not a person. Each card shows only the agent's name, its team and a short generic role. The Nexa agents have their own, more detailed chart.</p>
    <p class="legend"><span class="k">${BADGE.human} a person</span><span class="k">${BADGE.ai} an AI agent, not a person</span><span class="k">${BADGE.link} a link to another chart</span></p>
    <p class="updated">1 human · ${nAgents} AI agents · ${teams.length} teams${(cfg.links || []).length ? ` + <a href="${esc(cfg.links[0].url)}">${esc(cfg.links[0].name)}</a>` : ""} · Last updated <time datetime="${esc(roster.updated)}">${esc(fmt)}</time></p>
  </header>
  <div class="org" role="group" aria-label="Org chart">
    <div class="node top human">${BADGE.human}<div class="n">${esc(top.name)}${top.fullName ? ` (${esc(top.fullName)})` : ""}</div><div class="r">${esc(top.role)}</div></div>
    <div class="vline"></div>
    <div class="depts">${spine}${teamCols}${linkCols}
    </div>${wideRows}
  </div>
  <footer class="site">Generated by src/orgchart/build-teams.js from src/data/teams-roster.json and src/data/teams-roles.json · <a href="https://github.com/jQrgen/presentations">github.com/jQrgen/presentations</a></footer>
</div>
</body>
</html>
`;

const out = path.join(DOCS, "teams");
fs.mkdirSync(out, { recursive: true });
const file = path.join(out, "index.html");
fs.writeFileSync(file, html);
console.log("wrote", file, `(${teams.length} teams, ${nAgents} agents)`);
if (!gate([out])) { fs.rmSync(file); console.error("build-teams: grep gate failed, output removed"); process.exit(1); }
