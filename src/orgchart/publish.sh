#!/bin/bash
# Refresh the Nexa team org chart from the AI team roster and publish ONLY its own paths to
# https://jqrgen.github.io/presentations/nexa-team/
# Usage: bash src/orgchart/publish.sh [--dry-run] [page ...]   (from anywhere, on main; needs gh logged in as jQrgen)
#   page     a directory under docs/ to publish. Default, and the only ones allowed: ALLOWED_PAGES below (what the
#            org chart builder generates). Anything else is refused: other pages have their own scoped publish
#            scripts, and a page that is not on gh-pages yet needs jQrgen's own approval before its first publication.
#   --dry-run  build, run every gate, build the gh-pages commit in a temp worktree and print exactly which paths
#            would change on main and on gh-pages, then stop (no commit on main, no push).
# Same pattern as publish-jqrgencorp-regnskap.sh: build -> gates -> commit only these files (on a fresh, fetched main)
# -> copy ONLY these directories onto a fresh, fetched gh-pages -> pull --rebase both on top of the remote -> verify
# that nothing outside these paths changed -> push both atomically. It never runs "git rm -r ." on gh-pages and never copies the whole docs/ tree,
# so pages it does not own (articles, previews, Tailstorm, drafts) are never added, deleted or overwritten.
# It no longer regenerates the home timeline (docs/index.html): that belongs to the article publish scripts.
# Any failure stops before anything is pushed. Does nothing when nothing changed.
set -euo pipefail
export GIT_TERMINAL_PROMPT=0 GH_PROMPT_DISABLED=1   # unattended: never wait for a prompt
ALLOWED_PAGES=(nexa-team)                                            # what build-orgchart.js writes under docs/
MAIN_FILES=(src/data/nexa-team.json src/data/nexa-contributions.json)  # roster snapshot + its hand-kept input (main only)

DRY=0; PAGES=()
for a in "$@"; do
  case "$a" in
    -n|--dry-run) DRY=1 ;;
    -h|--help) sed -n '2,17p' "$0"; exit 0 ;;
    -*) echo "unknown option: $a" >&2; exit 2 ;;
    *) PAGES+=("${a%/}") ;;
  esac
done
[ ${#PAGES[@]} -gt 0 ] || PAGES=("${ALLOWED_PAGES[@]}")
for p in "${PAGES[@]}"; do
  case "$p" in ""|/*|*..*|.*|*/*) echo "refusing path '$p': give a top-level page directory under docs/, e.g. nexa-team" >&2; exit 1 ;; esac
  ok=0; for q in "${ALLOWED_PAGES[@]}"; do [ "$p" = "$q" ] && ok=1; done
  [ $ok = 1 ] || { echo "refusing '$p': not an org chart path (allowed: ${ALLOWED_PAGES[*]}); publish it with its own script once jQrgen has approved it" >&2; exit 1; }
done
say() { if [ $DRY = 1 ]; then echo "[publish.sh dry-run] $*"; else echo "[publish.sh] $*"; fi; }
inside() { local f="$1" p; for p in "${PAGES[@]}"; do case "$f" in "$p"/*) return 0 ;; esac; done; return 1; }

REPO="$(cd "$(dirname "$0")/../.." && pwd)"; cd "$REPO"
# one publisher at a time (all publish scripts share this lock); a second run waits up to 10 min, then fails
exec 9>"${TMPDIR:-/tmp}/presentations-publish.lock"; flock -w 600 9 || { echo "another publish is running" >&2; exit 1; }
[ "$(git rev-parse --abbrev-ref HEAD)" = main ] || { echo "check out main first" >&2; exit 1; }
git diff --cached --quiet || { echo "something is already staged; commit or unstage it first" >&2; exit 1; }
# temp worktrees (fresh copies of the remote branches); removed on exit, whatever happens
WTS=(); NEWWT=""
newwt() { NEWWT="$(mktemp -d)"; WTS+=("$NEWWT"); git worktree add -q --detach "$NEWWT" "$1"; }
cleanup() { local d; for d in "${WTS[@]}"; do git worktree remove --force "$d" 2>/dev/null || true; done; git worktree prune; }
trap cleanup EXIT
git worktree prune
git pull -q --ff-only origin main
git fetch -q origin gh-pages

# 1. build: only the org chart
(cd src && node orgchart/build-orgchart.js)
DOCPATHS=("${PAGES[@]/#/docs/}")

# 2. grep gate (health and financial terms): the shared list on the pages, their data and scripts; the Nexa D-SCOR
#    page's extra list on the pages and data. Any hit stops before anything is committed.
(cd src && node orgchart/grep-gate.js "${DOCPATHS[@]/#/../}" data/nexa-team.json data/nexa-contributions.json orgchart/build-orgchart.js orgchart/publish.sh \
  && node orgchart/grep-gate.js "${DOCPATHS[@]/#/../}" data/nexa-team.json data/nexa-contributions.json --terms orgchart/nexa-team-dscor-terms.json)

# 3. approval gate: refuse anything that is not already approved and public
for p in "${PAGES[@]}"; do
  git cat-file -e "origin/gh-pages:$p" 2>/dev/null || { echo "refusing '$p': not on gh-pages yet; a first publication needs jQrgen's approval" >&2; exit 1; }
  if grep -rlIiE 'name="robots"[^>]*noindex|class="draft"|UTKAST|DRAFT, not published' "docs/$p" >/dev/null; then
    echo "refusing '$p': draft markers (noindex / draft banner) found:" >&2; grep -rlIiE 'name="robots"[^>]*noindex|class="draft"|UTKAST|DRAFT, not published' "docs/$p" >&2; exit 1
  fi
done
# every link from these pages to another page on this site must point at something already live on gh-pages
# (or inside these paths), so the org chart can never link to, or advertise, an unpublished draft
git ls-tree -r --name-only origin/gh-pages > "${TMPDIR:-/tmp}/ghp-files.$$"
node - "${TMPDIR:-/tmp}/ghp-files.$$" "${PAGES[@]}" <<'JS'
const fs = require("fs"), path = require("path");
const [list, ...pages] = process.argv.slice(2);
const live = new Set(fs.readFileSync(list, "utf8").split("\n").filter(Boolean));
const files = (p) => fs.statSync(p).isDirectory() ? fs.readdirSync(p).flatMap((e) => files(path.join(p, e))) : [p];
const BASE = "https://jqrgen.github.io/presentations/";
const exists = (rel) => { rel = rel.replace(/^\/+/, ""); return live.has(rel) || live.has(path.posix.join(rel, "index.html")) || rel === "" && live.has("index.html")
  || pages.some((p) => rel === p || rel.startsWith(p + "/")); };
const bad = [];
for (const p of pages) for (const f of files(path.join("docs", p)).filter((f) => /\.html?$/.test(f))) {
  const html = fs.readFileSync(f, "utf8");
  for (const m of html.matchAll(/\b(?:href|src)\s*=\s*"([^"]*)"/gi)) {
    let u = m[1].split("#")[0].split("?")[0]; if (!u) continue;
    let rel;
    if (u.toLowerCase().startsWith(BASE)) rel = u.slice(BASE.length);
    else if (/^[a-z][a-z0-9+.-]*:|^\/\//i.test(u)) continue;                 // other sites, mailto:, data:
    else if (u.startsWith("/presentations/")) rel = u.slice("/presentations/".length);
    else rel = path.posix.normalize(path.posix.join(path.posix.dirname(path.relative("docs", f).split(path.sep).join("/")), u));
    if (rel.startsWith("..")) { bad.push(`${f}: ${m[1]} (outside the site)`); continue; }
    if (!exists(rel.replace(/\/$/, ""))) bad.push(`${f}: ${m[1]}`);
  }
}
if (bad.length) { console.error("approval gate: FAIL, links to pages that are not live on gh-pages:\n  " + bad.join("\n  ")); process.exit(1); }
console.log(`approval gate: PASS (all site links from ${pages.join(", ")} point at live pages)`);
JS
rm -f "${TMPDIR:-/tmp}/ghp-files.$$"

# 4. main: build the commit in a fresh worktree of the fetched remote main, from ONLY these files, and rebase it
#    on top of the remote. The shared checkout's other uncommitted files (other agents' work) are never staged,
#    stashed, committed or published.
ME=(-c user.name="$(git config user.name || echo jQrgen)" -c user.email="$(git config user.email || echo 3964957+jQrgen@users.noreply.github.com)")
newwt origin/main; MWT="$NEWWT"
for f in "${DOCPATHS[@]}" "${MAIN_FILES[@]}"; do rm -rf "${MWT:?}/$f"; mkdir -p "$(dirname "$MWT/$f")"; cp -R "$REPO/$f" "$MWT/$f"; done
(cd "$MWT" && git add -A -- "${DOCPATHS[@]}" "${MAIN_FILES[@]}" \
  && { git diff --cached --quiet || git "${ME[@]}" commit -q -m "Nexa team org chart: refresh from the team roster (${PAGES[*]})"; })
git -C "$MWT" pull -q --rebase origin main
MCHANGED="$(git -C "$MWT" diff --name-only origin/main HEAD)"
while IFS= read -r f; do
  [ -z "$f" ] && continue; ok=0; [ "${f#docs/}" != "$f" ] && inside "${f#docs/}" && ok=1
  for m in "${MAIN_FILES[@]}"; do [ "$f" = "$m" ] && ok=1; done
  [ $ok = 1 ] || { echo "abort: main change outside the org chart paths: $f" >&2; exit 1; }
done <<< "$MCHANGED"

# 5. gh-pages: a fresh worktree of the fetched remote branch (detached, so no local gh-pages branch is reset);
#    replace only these directories, rebase on the remote, then prove that only these paths differ from it
newwt origin/gh-pages; WT="$NEWWT"
for p in "${PAGES[@]}"; do rm -rf "${WT:?}/$p"; cp -R "$REPO/docs/$p" "$WT/$p"; done
(cd "$WT" && node "$REPO/src/orgchart/grep-gate.js" "${PAGES[@]}" \
  && git add -A -- "${PAGES[@]}" \
  && { git diff --cached --quiet || git "${ME[@]}" commit -q -m "Publish ${PAGES[*]} (org chart; only these paths)"; })
git -C "$WT" pull -q --rebase origin gh-pages
CHANGED="$(git -C "$WT" diff --name-only origin/gh-pages HEAD)"
while IFS= read -r f; do [ -z "$f" ] || inside "$f" || { echo "abort: gh-pages change outside ${PAGES[*]}: $f" >&2; exit 1; }; done <<< "$CHANGED"

if [ $DRY = 1 ]; then
  say "main: base $(git rev-parse --short origin/main); paths that would change:"
  if [ -n "$MCHANGED" ]; then git -C "$MWT" diff --stat origin/main HEAD | sed 's/^/    /'; else echo "    (none)"; fi
  say "main: other uncommitted files in this checkout (left alone, never committed or published):"
  git status --porcelain | grep -vF -f <(printf '%s\n' "${DOCPATHS[@]}" "${MAIN_FILES[@]}") | sed 's/^/    /' || echo "    (none)"
  say "gh-pages: base $(git rev-parse --short origin/gh-pages); paths that would change:"
  if [ -n "$CHANGED" ]; then git -C "$WT" diff --stat origin/gh-pages HEAD | sed 's/^/    /'; else echo "    (none: org chart unchanged)"; fi
  say "gh-pages: every other path stays byte-identical ($(git -C "$WT" ls-tree -r --name-only HEAD | grep -cvE "^($(IFS='|'; echo "${PAGES[*]}"))/") files outside ${PAGES[*]})"
  say "stopping here: nothing committed, nothing pushed"; exit 0
fi
if [ -z "$MCHANGED" ] && [ -z "$CHANGED" ]; then echo "org chart unchanged, nothing to publish"; exit 0; fi

# 6. push both branches at once (atomic: either both land or neither does)
git push -q --atomic origin "$(git -C "$MWT" rev-parse HEAD):refs/heads/main" "$(git -C "$WT" rev-parse HEAD):refs/heads/gh-pages"
git fetch -q origin main gh-pages
# bring this checkout up to date: stage only our files (identical to what was pushed) so the fast-forward can take them;
# other agents' edits stay as they are. If the fast-forward is not possible, unstage ours again and say so.
git add -- "${DOCPATHS[@]}" "${MAIN_FILES[@]}"
git merge -q --ff-only origin/main 2>/dev/null || { git reset -q -- "${DOCPATHS[@]}" "${MAIN_FILES[@]}"; echo "note: pushed, but this checkout could not fast-forward; run git pull here"; }
gh api -X POST repos/jQrgen/presentations/pages/builds >/dev/null || echo "note: Pages build request failed (push done)"
echo "published main $(git rev-parse --short origin/main) / gh-pages $(git rev-parse --short origin/gh-pages) (${PAGES[*]} only); Pages build requested"
