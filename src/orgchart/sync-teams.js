// Sync the all-teams roster: curated src/data/teams-membership.json + agent names  ->  src/data/teams-roster.json
//   node orgchart/sync-teams.js                 write the roster, warn about agents with no membership or no role line
//   node orgchart/sync-teams.js --json-missing  read-only: print JSON [{id, name, team, missing, hint?}] to stdout and
//                                               write nothing. missing = "role" (on a team, no curated role line) or
//                                               "membership" (an existing agent on no team, no chart and not marked
//                                               notPublic; team is null, hint = a team suggested by a group chat).
//                                               Current real names, for curating locally, not for publishing.
//   options: --agents <dir> (default /home/box/agent-data/agents) --roles <json> --membership <json> --out <json>
//
// Membership comes ONLY from the hand-curated src/data/teams-membership.json (team, optional sub-team, agent ids).
// Group chats are not needed: a deleted or missing group chat never removes anyone. A group chat that still exists can
// only add a HINT for an uncurated agent (teams-config.json hintGroups); it never puts anyone on the page by itself.
// Reads ONLY each profile's "name" and each group.json's "memberIds"; the directory name is the agent id. Descriptions
// and every other profile field are never read. An agent id in the membership file that no longer exists is skipped.
// Team order and sub-team labels come from teams-config.json; role lines and display names from teams-roles.json
// (team -> id -> entry). The roster file is public, so it holds only: agent id, team, sub-team membership and the
// PUBLIC name (the curated displayName when there is one, else the agent's name). Agents on a team with no curated
// role line are stored as an id only (no name), are listed in a warning (console only) and are left off the page.
// Agents with no membership are listed in a warning and stay off the page until someone curates them.
const fs = require("fs");
const path = require("path");

const argv = process.argv;
const arg = (k, d) => { const i = argv.indexOf(k); return i > 0 ? argv[i + 1] : d; };
const SRC = path.join(__dirname, "..");
const AGENTS = arg("--agents", "/home/box/agent-data/agents");
const CONFIG = path.join(SRC, "data", "teams-config.json");
const ROLES = arg("--roles", path.join(SRC, "data", "teams-roles.json"));
const MEMBERSHIP = arg("--membership", path.join(SRC, "data", "teams-membership.json"));
const NEXA_MEMBERSHIP = path.join(SRC, "data", "nexa-membership.json"); // agents placed on the Nexa chart count as placed
const OUT = arg("--out", path.join(SRC, "data", "teams-roster.json"));
const JSON_MISSING = argv.includes("--json-missing");
const log = JSON_MISSING ? (...a) => console.error(...a) : (...a) => console.log(...a); // keep stdout pure JSON
const warn = (...a) => console.warn(...a);

const readJSON = (f) => JSON.parse(fs.readFileSync(f, "utf8"));
const entry = (roles, team, id) => { const e = roles[team] && roles[team][id]; return e && typeof e.role === "string" && e.role.trim() ? e : null; };

// [{team, id, name?}] for every roster member with no curated role line (name only when the caller has it)
function missingRoles(roster, roles, realName = () => undefined) {
  return roster.teams.flatMap((t) => t.members.filter((m) => !entry(roles, t.name, m.id)).map((m) => ({ team: t.name, id: m.id, name: realName(m.id) })));
}
function warnMissing(missing) {
  if (!missing.length) return;
  warn(`\nWARNING: ${missing.length} bot(s) have no curated role line in src/data/teams-roles.json and are LEFT OFF the page:`);
  for (const m of missing) warn(`  - ${m.name ? m.name + "  " : ""}(team: ${m.team}, id: ${m.id})`);
  warn("Add an entry by hand (team -> id -> { name or displayName, role }) to put them on the page.\n");
}
function warnUnplaced(unplaced) {
  if (!unplaced.length) return;
  warn(`\nWARNING: ${unplaced.length} agent(s) are on no team in src/data/teams-membership.json (nor on the Nexa chart) and are LEFT OFF the page:`);
  for (const m of unplaced) warn(`  - ${m.name}  (id: ${m.id})${m.hint ? `  hint from a group chat: ${m.hint}` : ""}`);
  warn("Add them to a team in teams-membership.json (and a role line in teams-roles.json), or to notPublic if they must never be shown.\n");
}
module.exports = { missingRoles, warnMissing, entry };

function readAgents() {
  const agents = {}, groupsById = {}; // id -> real name (memory only); group id -> memberIds
  for (const id of fs.readdirSync(AGENTS)) {
    const pf = path.join(AGENTS, id, "profile.json");
    if (!fs.existsSync(pf)) continue;
    const name = String(readJSON(pf).name || "").trim(); // name only
    if (!name) continue;
    const gf = path.join(AGENTS, id, "group.json");
    if (fs.existsSync(gf)) groupsById[id] = (readJSON(gf).memberIds || []).map(String);
    else agents[id] = name;
  }
  return { agents, groupsById };
}

function sync() {
  const cfg = readJSON(CONFIG), roles = readJSON(ROLES), mem = readJSON(MEMBERSHIP);
  const { agents, groupsById } = readAgents();
  const notPublic = new Set(((mem.notPublic || {}).ids || []).map(String));
  const nexaIds = fs.existsSync(NEXA_MEMBERSHIP) ? Object.keys(readJSON(NEXA_MEMBERSHIP).agents || {}) : [];
  const teamNames = cfg.teams.map((t) => t.name);
  const gone = new Set();
  // team -> { all: Set, subs: { subteam -> Set } }, existing agents only
  const byTeam = Object.fromEntries(cfg.teams.map((t) => [t.name, { all: new Set(), subs: Object.fromEntries((t.subteams || []).map((s) => [s.name, new Set()])) }]));
  for (const e of mem.membership || []) {
    const t = byTeam[e.team];
    if (!t) { warn(`WARNING: teams-membership.json names team "${e.team}", which is not in teams-config.json (skipped)`); continue; }
    if (e.subteam && !t.subs[e.subteam]) { warn(`WARNING: teams-membership.json names sub-team "${e.team} / ${e.subteam}", which is not in teams-config.json (skipped)`); continue; }
    for (const m of e.members || []) {
      const id = String(m.id);
      if (notPublic.has(id)) { console.error(`ERROR: agent ${id} is listed as notPublic but also on team "${e.team}"; fix teams-membership.json`); process.exit(1); }
      if (!agents[id]) { gone.add(id); continue; } // deleted agent: dropped
      t.all.add(id);
      if (e.subteam) t.subs[e.subteam].add(id);
    }
  }
  if (gone.size) log(`note: ${gone.size} curated agent id(s) no longer exist and are skipped: ${[...gone].join(", ")}`);

  const teams = cfg.teams.map((tc) => {
    const t = byTeam[tc.name];
    const curated = Object.keys(roles[tc.name] || {});
    const ord = (a, b) => ((curated.indexOf(a) + 1) || 999) - ((curated.indexOf(b) + 1) || 999) || a.localeCompare(b);
    const members = [...t.all].sort(ord).map((id) => {
      const e = entry(roles, tc.name, id);
      if (!e) return { id }; // uncurated: id only, never the real name
      if (!e.displayName && e.name && e.name !== agents[id]) warn(`WARNING: ${tc.name} / ${id}: curated name "${e.name}" differs from the agent's current name "${agents[id]}"`);
      return { id, name: e.displayName || agents[id] };
    });
    if (!members.length) warn(`WARNING: team "${tc.name}" has no members`);
    const out = { name: tc.name, members };
    if ((tc.subteams || []).length) out.subteams = tc.subteams.map((s) => ({ name: s.name, ...(s.label ? { label: s.label } : {}), memberIds: [...t.subs[s.name]].sort(ord) }));
    return out;
  });

  // existing agents placed nowhere (group chats may hint where they belong, but never place anyone)
  const placed = new Set([...teams.flatMap((t) => t.members.map((m) => m.id)), ...nexaIds, ...notPublic]);
  const hintOf = (id) => Object.entries(cfg.hintGroups || {}).filter(([g]) => (groupsById[g] || []).includes(id))
    .map(([, h]) => h.team + (h.subteam ? " / " + h.subteam : "")).filter((h) => teamNames.includes(h.split(" / ")[0])).join(", ");
  const unplaced = Object.keys(agents).filter((id) => !placed.has(id)).sort((a, b) => agents[a].localeCompare(agents[b]))
    .map((id) => ({ id, name: agents[id], ...(hintOf(id) ? { hint: hintOf(id) } : {}) }));
  const missing = missingRoles({ teams }, roles, (id) => agents[id]);
  if (JSON_MISSING) {
    const rows = [...missing.map(({ id, name, team }) => ({ id, name, team, missing: "role" })),
      ...unplaced.map(({ id, name, hint }) => ({ id, name, team: null, missing: "membership", ...(hint ? { hint } : {}) }))];
    process.stdout.write(JSON.stringify(rows, null, 2) + "\n");
    return;
  }
  const data = { source: "jQrgen's AI agent roster (ids, teams and public names only)", teams };
  let updated = new Date().toLocaleDateString("en-CA", { timeZone: "Europe/Oslo" });
  if (fs.existsSync(OUT)) { const { updated: u, ...rest } = readJSON(OUT); if (JSON.stringify(rest) === JSON.stringify(data)) updated = u; }
  fs.writeFileSync(OUT, JSON.stringify({ updated, ...data }, null, 2) + "\n");
  log("roster", OUT, teams.map((t) => `${t.name}: ${t.members.length}`).join(", "), "· updated", updated);
  warnMissing(missing);
  warnUnplaced(unplaced);
  if (!missing.length) log("role check: every roster bot has a curated role line");
  if (!unplaced.length) log("membership check: every existing agent is on a team, on the Nexa chart or marked notPublic");
}

if (require.main === module) sync();
