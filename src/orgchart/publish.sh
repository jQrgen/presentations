#!/bin/bash
# Refresh the Nexa team org chart from the AI team roster and publish ONLY its own paths to the nexa-team/ page.
# Usage: bash src/orgchart/publish.sh [--dry-run] [page ...]   (needs gh logged in as the repo owner)
#   page       a directory under docs/ to publish. Default, and the only ones allowed: ALLOWED_PAGES below (what the org
#              chart builder generates). Anything else is refused: other pages have their own scoped publish scripts,
#              and a page that is not on gh-pages yet needs jQrgen's own approval before its first publication.
#   --dry-run  do everything except the push: build, commit in temp worktrees, run every gate, and print exactly
#              which paths would change on main and on gh-pages.
# How it works (same scoping idea as publish-jqrgencorp-regnskap.sh, but nothing is read from or written to a working tree):
#   1. fetch main and gh-pages explicitly and record their SHAs (MBASE, GBASE)
#   2. build the org chart inside a fresh temp worktree of MBASE (committed inputs only), commit only its output there
#   3. copy ONLY the listed pages from that worktree onto a fresh temp worktree of GBASE and commit
#   4. check that nothing outside the listed paths differs from MBASE/GBASE, run every gate on these exact trees
#   5. push both commits atomically (no force). If the remote moved, repeat 1-5 on the new bases (at most 3 times).
# The checkout this script lives in is only used as the git object store (fetch, temp worktrees): its working tree,
# index and branches are never read, written, staged, pulled or merged, so other agents' uncommitted files can't leak.
set -euo pipefail
export GIT_TERMINAL_PROMPT=0 GH_PROMPT_DISABLED=1   # unattended: never wait for a prompt
LOCK=/tmp/presentations-publish.lock                # fixed path, shared by all publish scripts (not $TMPDIR)
ALLOWED_PAGES=(nexa-team)                           # what build-orgchart.js writes under docs/
MAIN_OUT=(src/data/nexa-team.json)                  # the builder's roster snapshot (main only, never on gh-pages)
TRIES=3
NET_TIMEOUT=120

DRY=0; PAGES=()
for a in "$@"; do
  case "$a" in
    -n|--dry-run) DRY=1 ;;
    -h|--help) sed -n '2,17p' "$0"; exit 0 ;;
    -*) echo "unknown option: $a" >&2; exit 2 ;;
    *) PAGES+=("${a%/}") ;;
  esac
done
[[ ${#PAGES[@]} -gt 0 ]] || PAGES=("${ALLOWED_PAGES[@]}")
for p in "${PAGES[@]}"; do
  case "$p" in ""|/*|*..*|.*|*/*|*[!A-Za-z0-9._-]*) echo "refusing path '$p': give a top-level page directory under docs/, e.g. nexa-team" >&2; exit 1 ;; esac
  ok=0; for q in "${ALLOWED_PAGES[@]}"; do [[ "$p" = "$q" ]] && ok=1; done
  [[ $ok = 1 ]] || { echo "refusing '$p': not an org chart path (allowed: ${ALLOWED_PAGES[*]}); publish it with its own script once jQrgen has approved it" >&2; exit 1; }
done
DOCPATHS=("${PAGES[@]/#/docs/}")
say() { if [[ $DRY = 1 ]]; then echo "[publish.sh dry-run] $*"; else echo "[publish.sh] $*"; fi; }
# is $1 (a path relative to the gh-pages root) inside one of the listed pages?
inside() { local p; for p in "${PAGES[@]}"; do [[ "$1" == "$p/"* ]] && return 0; done; return 1; }
REPO="$(cd "$(dirname "$0")/../.." && pwd)"
G() { git -C "$REPO" "$@"; }
# every network call made while holding the lock is bounded (timeout, plus git's own stall detection)
GNET() { timeout "$NET_TIMEOUT" git -C "$REPO" -c http.lowSpeedLimit=1000 -c http.lowSpeedTime=30 "$@"; }

# one publisher at a time; a second run waits up to 10 min, then fails. flock is released when this process exits.
exec 9>"$LOCK"; flock -w 600 9 || { echo "another publish is running" >&2; exit 1; }

TMP="$(mktemp -d /tmp/orgchart-publish.XXXXXX)"; WTS=()
cleanup() { local d; for d in "${WTS[@]}"; do G worktree remove --force "$d" >/dev/null 2>&1 || true; done; rm -rf "$TMP"; G worktree prune; }
trap cleanup EXIT
# worktrees left registered by a killed earlier run (we hold the lock, so no other run of this script is using them)
G worktree prune
G worktree list --porcelain | sed -n 's#^worktree \(/tmp/orgchart-publish\.[^/]*/.*\)$#\1#p' | while IFS= read -r d; do
  G worktree remove --force "$d" >/dev/null 2>&1 || true; done
newwt() { NEWWT="$TMP/$1"; G worktree add -q --detach "$NEWWT" "$2"; WTS+=("$NEWWT"); }

ORIGIN_URL="$(G remote get-url origin)"
# owner/repo from the origin URL; PUBLISH_GH_REPO overrides it (for a local test remote)
GH_REPO="${PUBLISH_GH_REPO:-}"
[[ -n "$GH_REPO" ]] || GH_REPO="$(sed -E 's#^(https://github\.com/|git@github\.com:|ssh://git@github\.com/)##; s#\.git$##; s#/$##' <<< "$ORIGIN_URL")"
[[ "$GH_REPO" =~ ^[A-Za-z0-9_.-]+/[A-Za-z0-9_.-]+$ ]] || { echo "can't derive owner/repo from origin ($ORIGIN_URL)" >&2; exit 1; }
SITE="https://$(tr '[:upper:]' '[:lower:]' <<< "${GH_REPO%%/*}").github.io/${GH_REPO#*/}/"
NAME="$(G config user.name || true)"; EMAIL="$(G config user.email || true)"
[[ -n "$NAME" && -n "$EMAIL" ]] || { echo "set git user.name and user.email first" >&2; exit 1; }
ID=(-c "user.name=$NAME" -c "user.email=$EMAIL")

# draft/noindex detector + site link checker (node, whole-file parsing; any read error is a failure)
cat > "$TMP/approval-gate.js" <<'JS'
// usage: node approval-gate.js <site-url> <gh-pages worktree> <page>...
// FAIL (exit 1) if a listed page is a draft/noindex, or links to anything on this site that is not a live, non-draft page.
const fs = require("fs"), path = require("path");
const [SITE, ROOT, ...PAGES] = process.argv.slice(2);
const sitePath = new URL(SITE).pathname;                         // e.g. /presentations/
const ROBOTS = new Set(["robots", "googlebot", "googlebot-news", "bingbot", "x-robots-tag"]);
const attrs = (tag) => { const a = {}; const body = tag.replace(/^<\s*[^\s>\/]+/, "").replace(/\/?>$/, "");
  for (const m of body.matchAll(/([^\s=\/>"']+)(?:\s*=\s*(?:"([^"]*)"|'([^']*)'|([^\s"'=<>`]+)))?/g))
    a[m[1].toLowerCase()] = (m[2] ?? m[3] ?? m[4] ?? "").replace(/&amp;/g, "&");
  return a; };
const tags = (html) => [...html.replace(/<!--[\s\S]*?-->/g, "").matchAll(/<[a-zA-Z][^>]*>/g)].map((m) => m[0]);
function draftReasons(file) {
  const html = fs.readFileSync(file, "utf8");                    // throws on any read error -> exit 1 below
  const why = [];
  for (const t of tags(html)) {
    const a = attrs(t), tn = (t.match(/^<\s*([^\s>\/]+)/) || [])[1].toLowerCase();
    if (tn === "meta" && ROBOTS.has((a.name || a["http-equiv"] || "").toLowerCase()) && /noindex|\bnone\b/i.test(a.content || "")) why.push(`noindex meta (${t.slice(0, 80)})`);
    if ((a.class || "").split(/\s+/).some((c) => /^draft$/i.test(c))) why.push(`class "draft" (${t.slice(0, 60)})`);
  }
  if (/UTKAST|DRAFT, not published/.test(html)) why.push("draft banner text");
  return why;
}
const files = (p) => fs.statSync(p).isDirectory() ? fs.readdirSync(p).flatMap((e) => files(path.join(p, e))) : [p];
// every URL-ish value in a page: href/src/action/poster/data, srcset, meta content (refresh, og:url, ...), CSS url()
function urls(html) {
  const out = [];
  for (const t of tags(html)) {
    const a = attrs(t);
    for (const k of ["href", "src", "action", "poster", "data", "formaction", "cite", "background"]) if (a[k] !== undefined) out.push(a[k]);
    for (const k of ["srcset", "imagesrcset"]) if (a[k]) for (const part of a[k].split(",")) out.push(part.trim().split(/\s+/)[0]);
    if (a.content !== undefined) {
      if ((a["http-equiv"] || "").toLowerCase() === "refresh") { const m = a.content.match(/url\s*=\s*['"]?([^'"]+)/i); if (m) out.push(m[1].trim()); }
      else if (/^(https?:)?\/\/|^\//i.test(a.content.trim())) out.push(a.content.trim());
    }
  }
  for (const m of html.matchAll(/url\(\s*(?:"([^"]*)"|'([^']*)'|([^)\s]*))\s*\)/gi)) out.push(m[1] ?? m[2] ?? m[3]);
  return out.map((u) => u.trim()).filter(Boolean);
}
const site = new URL(SITE);
const bad = [];
const target = (rel) => { rel = rel.replace(/^\/+/, ""); const f = path.join(ROOT, rel);
  if (rel === "" || rel.endsWith("/")) return fs.existsSync(path.join(f, "index.html")) ? path.join(f, "index.html") : null;
  if (fs.existsSync(f) && fs.statSync(f).isFile()) return f;
  if (fs.existsSync(path.join(f, "index.html"))) return path.join(f, "index.html");
  return null; };
try {
  for (const p of PAGES) {
    const dir = path.join(ROOT, p);
    if (!fs.existsSync(path.join(dir, "index.html"))) { bad.push(`${p}/index.html missing`); continue; }
    for (const f of files(dir).filter((f) => /\.html?$/i.test(f))) {
      for (const r of draftReasons(f)) bad.push(`${path.relative(ROOT, f)} is a draft: ${r}`);
      const pageRel = path.relative(ROOT, f).split(path.sep).join("/");
      for (const raw of urls(fs.readFileSync(f, "utf8"))) {
        if (/^(#|mailto:|tel:|data:|javascript:)/i.test(raw)) continue;
        let u; try { u = new URL(raw, site.origin + sitePath + pageRel); } catch { bad.push(`${pageRel}: unparseable URL ${raw}`); continue; }
        if (u.host !== site.host) continue;                                       // another site
        if (raw.startsWith("/") && !raw.startsWith("//") && !raw.startsWith(sitePath)) { bad.push(`${pageRel}: root-absolute link outside ${sitePath}: ${raw}`); continue; }
        if (!u.pathname.startsWith(sitePath)) continue;                           // same host, another repo's site
        const rel = decodeURIComponent(u.pathname.slice(sitePath.length));
        const t = target(rel);
        if (!t) { bad.push(`${pageRel}: links to ${raw}, which is not on gh-pages`); continue; }
        if (/\.html?$/i.test(t)) for (const r of draftReasons(t)) bad.push(`${pageRel}: links to ${raw}, a draft page (${r})`);
      }
    }
  }
} catch (e) { console.error(`approval gate: FAIL, ${e.message}`); process.exit(1); }
if (bad.length) { console.error("approval gate: FAIL\n  " + [...new Set(bad)].join("\n  ")); process.exit(1); }
console.log(`approval gate: PASS (${PAGES.join(", ")}: no draft/noindex, every site link points at a live, non-draft page)`);
JS

attempt=0
while :; do
  attempt=$((attempt + 1))
  # 1. explicit fetch into the remote-tracking refs (works with narrowed refspecs too); record the bases
  GNET fetch -q --no-tags origin +refs/heads/main:refs/remotes/origin/main +refs/heads/gh-pages:refs/remotes/origin/gh-pages
  MBASE="$(G rev-parse --verify "refs/remotes/origin/main^{commit}")"
  GBASE="$(G rev-parse --verify "refs/remotes/origin/gh-pages^{commit}")"
  for d in "${WTS[@]}"; do G worktree remove --force "$d"; done; WTS=()
  rm -rf "${TMP:?}/main" "${TMP:?}/gh-pages"

  # 2. build in a fresh worktree of MBASE (committed builder, theme and nexa-contributions.json only); commit only its output
  newwt main "$MBASE"; MWT="$NEWWT"
  (cd "$MWT/src" && node orgchart/build-orgchart.js)
  (cd "$MWT" && git add -A -- "${DOCPATHS[@]}" "${MAIN_OUT[@]}" \
    && { git diff --cached --quiet || git "${ID[@]}" commit -q -m "Nexa team org chart: refresh from the team roster (${PAGES[*]})"; })

  # 3. copy ONLY the listed pages from that same tree onto a fresh worktree of GBASE
  newwt gh-pages "$GBASE"; GWT="$NEWWT"
  for p in "${PAGES[@]}"; do
    git -C "$GWT" cat-file -e "$GBASE:$p" 2>/dev/null || { echo "refusing '$p': not on gh-pages yet; a first publication needs jQrgen's approval" >&2; exit 1; }
    rm -rf "${GWT:?}/$p"; cp -R "$MWT/docs/$p" "$GWT/$p"
  done
  (cd "$GWT" && git add -A -- "${PAGES[@]}" \
    && { git diff --cached --quiet || git "${ID[@]}" commit -q -m "Publish ${PAGES[*]} (org chart; only these paths)"; })

  # 4a. the commits sit directly on the recorded bases and change nothing outside the listed paths
  if ! git -C "$MWT" merge-base --is-ancestor "$MBASE" HEAD || ! git -C "$GWT" merge-base --is-ancestor "$GBASE" HEAD; then
    echo "abort: commits are not on top of the fetched bases" >&2; exit 1
  fi
  MCHANGED="$(git -C "$MWT" diff --name-only "$MBASE" HEAD)"
  GCHANGED="$(git -C "$GWT" diff --name-only "$GBASE" HEAD)"
  while IFS= read -r f; do
    [[ -z "$f" ]] && continue; ok=0; [[ "$f" == docs/* ]] && inside "${f#docs/}" && ok=1
    for m in "${MAIN_OUT[@]}"; do [[ "$f" = "$m" ]] && ok=1; done
    [[ $ok = 1 ]] || { echo "abort: main change outside the org chart paths: $f" >&2; exit 1; }
  done <<< "$MCHANGED"
  while IFS= read -r f; do [[ -z "$f" ]] || inside "$f" || { echo "abort: gh-pages change outside ${PAGES[*]}: $f" >&2; exit 1; }; done <<< "$GCHANGED"
  for p in "${PAGES[@]}"; do diff -r -q "$MWT/docs/$p" "$GWT/$p" >/dev/null || { echo "abort: gh-pages $p differs from main docs/$p" >&2; exit 1; }; done

  # 4b. every gate, once, on the exact trees that get pushed (gate code and term lists from the fetched main)
  GATE=(node "$MWT/src/orgchart/grep-gate.js")
  ON_GHP=("${PAGES[@]/#/$GWT/}"); ON_MAIN=("${DOCPATHS[@]/#/$MWT/}" "$MWT/src/data/nexa-team.json" "$MWT/src/data/nexa-contributions.json")
  "${GATE[@]}" "${ON_GHP[@]}" "${ON_MAIN[@]}" "$MWT/src/orgchart/build-orgchart.js" "$MWT/src/orgchart/publish.sh"   # privacy terms (forbidden-terms.json)
  "${GATE[@]}" "${ON_GHP[@]}" "${ON_MAIN[@]}" --terms "$MWT/src/orgchart/nexa-team-dscor-terms.json"                 # D-SCOR terms
  node "$TMP/approval-gate.js" "$SITE" "$GWT" "${PAGES[@]}"                                                           # drafts + links

  if [[ $DRY = 1 ]]; then
    say "main: base $(git -C "$MWT" rev-parse --short "$MBASE"); paths that would change:"
    if [[ -n "$MCHANGED" ]]; then git -C "$MWT" diff --stat "$MBASE" HEAD | sed 's/^/    /'; else echo "    (none)"; fi
    say "gh-pages: base $(git -C "$GWT" rev-parse --short "$GBASE"); paths that would change:"
    if [[ -n "$GCHANGED" ]]; then git -C "$GWT" diff --stat "$GBASE" HEAD | sed 's/^/    /'; else echo "    (none: org chart unchanged)"; fi
    n=0; while IFS= read -r f; do inside "$f" || n=$((n + 1)); done < <(git -C "$GWT" ls-tree -r --name-only HEAD)
    say "gh-pages: every other path stays byte-identical ($n files outside ${PAGES[*]})"
    say "the checkout at $REPO was not read, written or staged (only fetched into); stopping here, nothing pushed"
    exit 0
  fi
  if [[ -z "$MCHANGED" && -z "$GCHANGED" ]]; then echo "org chart unchanged, nothing to publish"; exit 0; fi

  # 5. push both at once (atomic, never forced); if the remote moved meanwhile, start over on the new bases
  MHEAD="$(git -C "$MWT" rev-parse HEAD)"; GHEAD="$(git -C "$GWT" rev-parse HEAD)"
  if GNET push -q --atomic origin "$MHEAD:refs/heads/main" "$GHEAD:refs/heads/gh-pages"; then break; fi
  [[ $attempt -lt $TRIES ]] || { echo "push rejected $attempt times (remote keeps moving); nothing published" >&2; exit 1; }
  say "push rejected (attempt $attempt/$TRIES); re-fetching, rebuilding on the new bases and re-running every gate"
  sleep $((attempt * 2))
done
timeout "$NET_TIMEOUT" gh api -X POST "repos/$GH_REPO/pages/builds" >/dev/null || echo "note: Pages build request failed (push done)"
echo "published main $(git -C "$MWT" rev-parse --short "$MHEAD") / gh-pages $(git -C "$GWT" rev-parse --short "$GHEAD") (${PAGES[*]} only); Pages build requested: ${SITE}${PAGES[0]}/"
