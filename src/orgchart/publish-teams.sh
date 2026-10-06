#!/bin/bash
# Refresh the all-teams org chart and publish ONLY its folder: https://jqrgen.github.io/presentations/teams/
# Usage: bash src/orgchart/publish-teams.sh   (from anywhere, on main; needs gh logged in as jQrgen, and setup-git done)
# Order: sync roster -> build page -> grep gate -> commit on main -> replace ONLY teams/ on gh-pages -> checks -> push.
# gh-pages also carries pages published from other branches that are not on main (e.g. tailstorm/, preview/), so it is
# never rebuilt from docs/: only its teams/ folder is replaced, every other path is left as it is, and the push is refused
# if anything outside teams/ would change. Any failure stops before anything is pushed. Does nothing (no commit, no push)
# when nothing changed. Never forces. Does not touch the Nexa page, its data or its allowlist.
set -euo pipefail
export GIT_TERMINAL_PROMPT=0 GH_PROMPT_DISABLED=1   # unattended: never wait for a prompt
PAGE=teams                                          # the only gh-pages path this script may change
LOCK=/tmp/presentations-publish.lock                # fixed path, shared by all publish scripts
REPO="$(cd "$(dirname "$0")/../.." && pwd)"; cd "$REPO"
# one publisher at a time (all publish scripts share this lock); a second run waits up to 10 min, then fails
exec 9>"$LOCK"; flock -w 600 9 || { echo "another publish is running"; exit 1; }
[ "$(git rev-parse --abbrev-ref HEAD)" = main ] || { echo "check out main first"; exit 1; }
WT=""; cleanup() { [ -n "$WT" ] && git worktree remove --force "$WT" 2>/dev/null || true; git worktree prune; }; trap cleanup EXIT
git worktree prune
git pull -q --ff-only origin main
# 1. sync: curated src/data/teams-membership.json + agent names -> src/data/teams-roster.json (names, teams, ids only;
#    warns about agents with no membership or no role line; group chats are never needed)
(cd src && node orgchart/sync-teams.js)
# 2. build: docs/teams/index.html (build-teams.js already runs the grep gate on its output and exits 1 on a hit)
(cd src && node orgchart/build-teams.js)
# 3. grep gate again, on the page and on every teams data file and script that goes into the public repo
#    (everything except the term list itself, orgchart/forbidden-terms.json)
GATED=(../docs/teams data/teams-roster.json data/teams-roles.json data/teams-config.json data/teams-membership.json
  orgchart/sync-teams.js orgchart/build-teams.js orgchart/grep-gate.js orgchart/publish-teams.sh)
(cd src && node orgchart/grep-gate.js "${GATED[@]}")
# 4. commit the refreshed page and roster on main (only these paths)
git add docs/teams src/data/teams-roster.json
git diff --cached --quiet || git commit -q -m "All-teams org chart: refresh from the team roster"
# 5. gh-pages: start from the live branch, replace only teams/
git fetch -q --no-tags origin +refs/heads/gh-pages:refs/remotes/origin/gh-pages
GBASE="$(git rev-parse --verify "refs/remotes/origin/gh-pages^{commit}")"
echo "gh-pages $(git rev-parse --short "$GBASE") top-level paths before:"; git ls-tree "$GBASE" | sed 's/^/  /'
git cat-file -e "$GBASE:$PAGE" 2>/dev/null || { echo "refusing: $PAGE/ is not on gh-pages yet; a first publication needs jQrgen's approval" >&2; exit 1; }
if [ -z "$(git rev-list origin/main..main)" ] && [ "$(git rev-parse "$GBASE:$PAGE")" = "$(git rev-parse "main:docs/$PAGE")" ]; then
  echo "teams chart unchanged, nothing to publish"; exit 0
fi
WT="$(mktemp -d /tmp/teams-publish.XXXXXX)"
git worktree add -q --detach "$WT" "$GBASE"
(cd "$WT" && rm -rf "./$PAGE" && cp -R "$REPO/docs/$PAGE" "./$PAGE" && node "$REPO/src/orgchart/grep-gate.js" "$PAGE" \
  && git add -A -- "$PAGE" && { git diff --cached --quiet || git commit -q -m "Publish teams (org chart; only this path)"; })
GHEAD="$(git -C "$WT" rev-parse HEAD)"
# 6. checks on the exact commit that gets pushed: on top of the live gh-pages, only teams/ changed, teams/ == main's docs/teams
git merge-base --is-ancestor "$GBASE" "$GHEAD" || { echo "abort: gh-pages commit is not on top of the fetched gh-pages" >&2; exit 1; }
while IFS= read -r f; do
  [ -z "$f" ] || [[ "$f" == "$PAGE/"* ]] || { echo "abort: gh-pages change outside $PAGE/: $f" >&2; exit 1; }
done <<< "$(git diff --name-only "$GBASE" "$GHEAD")"
others() { git ls-tree "$1" | awk -F'\t' -v p="$PAGE" '$2 != p'; }
diff <(others "$GBASE") <(others "$GHEAD") >/dev/null || { echo "abort: a top-level gh-pages path other than $PAGE/ would change" >&2; exit 1; }
[ "$(git rev-parse "$GHEAD:$PAGE")" = "$(git rev-parse "main:docs/$PAGE")" ] || { echo "abort: gh-pages $PAGE/ differs from main docs/$PAGE" >&2; exit 1; }
echo "gh-pages $(git rev-parse --short "$GHEAD") top-level paths after (only $PAGE/ may differ):"; git ls-tree "$GHEAD" | sed 's/^/  /'
# 7. push main and gh-pages together (atomic, never forced)
git push -q --atomic origin main "$GHEAD:refs/heads/gh-pages"
gh api -X POST repos/jQrgen/presentations/pages/builds >/dev/null || echo "note: Pages build request failed (push done)"   # pushes alone have not been triggering Pages builds
echo "published $(git rev-parse --short main) / gh-pages $(git rev-parse --short "$GHEAD") ($PAGE/ only); Pages build requested: https://jqrgen.github.io/presentations/teams/"
