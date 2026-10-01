// Sync the all-teams roster: <agents>/*/profile.json + group.json  ->  src/data/teams-roster.json
//   node orgchart/sync-teams.js                 write the roster, warn about bots with no curated role line
//   node orgchart/sync-teams.js --json-missing  read-only: print JSON [{id, name, team}] of bots with no role line
//                                               to stdout (current real names; for drafting lines locally, not
//                                               for publishing) and write nothing
//   options: --agents <dir> (default /home/box/agent-data/agents) --roles <json> --out <json>
//
// Reads ONLY each profile's "name" and each group.json's "memberIds"; the directory name is the agent id.
// Descriptions and every other profile field are never read. Teams (and subteams) and how members are matched
// come from src/data/teams-config.json; role lines and display names from src/data/teams-roles.json
// (team -> id -> entry). The roster file is public, so it holds only: agent id, team, subteam membership and the
// PUBLIC name (the curated displayName when there is one, else the agent's name). Agents with no curated entry
// are stored as an id only (no name), are listed in a warning (on the console only) and are left off the page.
const fs = require("fs");
const path = require("path");

const argv = process.argv;
const arg = (k, d) => { const i = argv.indexOf(k); return i > 0 ? argv[i + 1] : d; };
const SRC = path.join(__dirname, "..");
const AGENTS = arg("--agents", "/home/box/agent-data/agents");
const CONFIG = path.join(SRC, "data", "teams-config.json");
const ROLES = arg("--roles", path.join(SRC, "data", "teams-roles.json"));
const OUT = arg("--out", path.join(SRC, "data", "teams-roster.json"));
const JSON_MISSING = argv.includes("--json-missing");
const log = JSON_MISSING ? (...a) => console.error(...a) : (...a) => console.log(...a); // keep stdout pure JSON

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

function readRoster() {
  const agents = {}, groups = {}, groupsById = {}; // id -> real name (memory only); group name / id -> memberIds
  for (const id of fs.readdirSync(AGENTS)) {
    const pf = path.join(AGENTS, id, "profile.json");
    if (!fs.existsSync(pf)) continue;
    const name = String(readJSON(pf).name || "").trim(); // name only
    if (!name) continue;
    const gf = path.join(AGENTS, id, "group.json");
    if (fs.existsSync(gf)) groups[name] = groupsById[id] = (readJSON(gf).memberIds || []).map(String);
    else agents[id] = name;
  }
  return { agents, groups, groupsById };
}

// ids matched by one team/subteam spec (group, groupId, ids, names, namePattern); only existing agents count
function match(spec, { agents, groups, groupsById }) {
  const ids = new Set();
  const add = (id) => { if (agents[id]) ids.add(id); };
  if (spec.groupId) { if (!groupsById[spec.groupId]) console.warn(`WARNING: group id ${spec.groupId} (${spec.name}) not found in ${AGENTS}`); (groupsById[spec.groupId] || []).forEach(add); }
  if (spec.group) { if (!groups[spec.group]) console.warn(`WARNING: group "${spec.group}" not found in ${AGENTS}`); (groups[spec.group] || []).forEach(add); }
  (spec.ids || []).map(String).forEach(add); // by agent id: survives renames
  (spec.names || []).forEach((n) => Object.keys(agents).filter((id) => agents[id] === n).forEach(add));
  if (spec.namePattern) { const re = new RegExp(spec.namePattern, "i"); Object.keys(agents).filter((id) => re.test(agents[id])).forEach(add); }
  return ids;
}

function sync() {
  const cfg = readJSON(CONFIG), roles = readJSON(ROLES), src = readRoster();
  const { agents } = src;
  const teams = cfg.teams.map((t) => {
    const ids = match(t, src);
    const subs = (t.subteams || []).map((s) => ({ s, ids: match(s, src) }));
    subs.forEach(({ ids: si }) => si.forEach((id) => ids.add(id)));
    const curated = Object.keys(roles[t.name] || {});
    const ord = (a, b) => ((curated.indexOf(a) + 1) || 999) - ((curated.indexOf(b) + 1) || 999) || a.localeCompare(b);
    const members = [...ids].sort(ord).map((id) => {
      const e = entry(roles, t.name, id);
      if (!e) return { id }; // uncurated: id only, never the real name
      if (!e.displayName && e.name && e.name !== agents[id]) console.warn(`WARNING: ${t.name} / ${id}: curated name "${e.name}" differs from the agent's current name "${agents[id]}"`);
      return { id, name: e.displayName || agents[id] };
    });
    if (!members.length) console.warn(`WARNING: team "${t.name}" has no members`);
    const out = { name: t.name, members };
    if (subs.length) out.subteams = subs.map(({ s, ids: si }) => ({ name: s.name, ...(s.label ? { label: s.label } : {}), memberIds: [...si].sort(ord) }));
    return out;
  });
  const missing = missingRoles({ teams }, roles, (id) => agents[id]);
  if (JSON_MISSING) { process.stdout.write(JSON.stringify(missing.map(({ id, name, team }) => ({ id, name, team })), null, 2) + "\n"); return; }
  const data = { source: "jQrgen's AI agent roster (ids, teams and public names only)", teams };
  let updated = new Date().toLocaleDateString("en-CA", { timeZone: "Europe/Oslo" });
  if (fs.existsSync(OUT)) { const { updated: u, ...rest } = readJSON(OUT); if (JSON.stringify(rest) === JSON.stringify(data)) updated = u; }
  fs.writeFileSync(OUT, JSON.stringify({ updated, ...data }, null, 2) + "\n");
  log("roster", OUT, teams.map((t) => `${t.name}: ${t.members.length}`).join(", "), "· updated", updated);
  warnMissing(missing);
  if (!missing.length) log("role check: every roster bot has a curated role line");
}

if (require.main === module) sync();
