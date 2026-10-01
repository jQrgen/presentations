// Sync the all-teams roster: <agents>/*/profile.json + group.json  ->  src/data/teams-roster.json
//   node orgchart/sync-teams.js   [--agents <dir>] (default /home/box/agent-data/agents) [--roles <json>] [--out <json>]
//
// Reads ONLY each profile's "name" and each group.json's "memberIds"; the directory name is the agent id.
// Descriptions and every other profile field are never read. Teams and how members are matched come from
// src/data/teams-config.json; role lines and display names from src/data/teams-roles.json (team -> id -> entry).
// The roster file is public, so it holds only: agent id, team, and the PUBLIC name (the curated displayName
// when there is one, else the agent's name). Agents with no curated entry are stored as an id only (no name),
// are listed in a warning here (the only place their real name is shown, on the console) and are left off the page.
const fs = require("fs");
const path = require("path");

const arg = (k, d) => { const i = process.argv.indexOf(k); return i > 0 ? process.argv[i + 1] : d; };
const SRC = path.join(__dirname, "..");
const AGENTS = arg("--agents", "/home/box/agent-data/agents");
const CONFIG = path.join(SRC, "data", "teams-config.json");
const ROLES = arg("--roles", path.join(SRC, "data", "teams-roles.json"));
const OUT = arg("--out", path.join(SRC, "data", "teams-roster.json"));

const readJSON = (f) => JSON.parse(fs.readFileSync(f, "utf8"));
const entry = (roles, team, id) => { const e = roles[team] && roles[team][id]; return e && typeof e.role === "string" && e.role.trim() ? e : null; };

// [{team, id, name?}] for every roster member with no curated role line (name only when the caller has it)
function missingRoles(roster, roles, realName = () => undefined) {
  return roster.teams.flatMap((t) => t.members.filter((m) => !entry(roles, t.name, m.id)).map((m) => ({ team: t.name, id: m.id, name: realName(m.id) })));
}
function warnMissing(missing) {
  if (!missing.length) return;
  console.warn(`\nWARNING: ${missing.length} bot(s) have no curated role line in src/data/teams-roles.json and are LEFT OFF the page:`);
  for (const m of missing) console.warn(`  - ${m.name ? m.name + "  " : ""}(team: ${m.team}, id: ${m.id})`);
  console.warn("Add an entry by hand (team -> id -> { name or displayName, role }) to put them on the page.\n");
}
module.exports = { missingRoles, warnMissing, entry };

function sync() {
  const cfg = readJSON(CONFIG), roles = readJSON(ROLES);
  const agents = {}, groups = {}; // id -> real name (memory only) ; group name -> memberIds
  for (const id of fs.readdirSync(AGENTS)) {
    const pf = path.join(AGENTS, id, "profile.json");
    if (!fs.existsSync(pf)) continue;
    const name = String(readJSON(pf).name || "").trim(); // name only
    if (!name) continue;
    const gf = path.join(AGENTS, id, "group.json");
    if (fs.existsSync(gf)) groups[name] = (readJSON(gf).memberIds || []).map(String);
    else agents[id] = name;
  }
  const byName = (n) => Object.keys(agents).filter((id) => agents[id] === n);
  const teams = cfg.teams.map((t) => {
    const ids = new Set();
    if (t.group) {
      if (!groups[t.group]) console.warn(`WARNING: group "${t.group}" not found in ${AGENTS}`);
      (groups[t.group] || []).filter((id) => agents[id]).forEach((id) => ids.add(id));
    }
    (t.ids || []).map(String).filter((id) => agents[id]).forEach((id) => ids.add(id)); // by agent id: survives renames
    (t.names || []).forEach((n) => byName(n).forEach((id) => ids.add(id)));
    if (t.namePattern) { const re = new RegExp(t.namePattern, "i"); Object.keys(agents).filter((id) => re.test(agents[id])).forEach((id) => ids.add(id)); }
    const curated = Object.keys(roles[t.name] || {});
    const members = [...ids].map((id) => {
      const e = entry(roles, t.name, id);
      if (!e) return { id }; // uncurated: id only, never the real name
      if (!e.displayName && e.name && e.name !== agents[id]) console.warn(`WARNING: ${t.name} / ${id}: curated name "${e.name}" differs from the agent's current name "${agents[id]}"`);
      return { id, name: e.displayName || agents[id] };
    }).sort((a, b) => ((curated.indexOf(a.id) + 1) || 999) - ((curated.indexOf(b.id) + 1) || 999) || a.id.localeCompare(b.id));
    if (!members.length) console.warn(`WARNING: team "${t.name}" has no members`);
    return { name: t.name, members };
  });
  const data = { source: "jQrgen's AI agent roster (ids, teams and public names only)", teams };
  let updated = new Date().toLocaleDateString("en-CA", { timeZone: "Europe/Oslo" });
  if (fs.existsSync(OUT)) { const { updated: u, ...rest } = readJSON(OUT); if (JSON.stringify(rest) === JSON.stringify(data)) updated = u; }
  fs.writeFileSync(OUT, JSON.stringify({ updated, ...data }, null, 2) + "\n");
  console.log("roster", OUT, teams.map((t) => `${t.name}: ${t.members.length}`).join(", "), "· updated", updated);
  const missing = missingRoles({ teams }, roles, (id) => agents[id]);
  warnMissing(missing);
  if (!missing.length) console.log("role check: every roster bot has a curated role line");
}

if (require.main === module) sync();
