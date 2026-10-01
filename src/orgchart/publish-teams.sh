#!/bin/bash
# Refresh the all-teams org chart and publish https://jqrgen.github.io/presentations/teams/
# Usage: bash src/orgchart/publish-teams.sh   (from anywhere, on main; needs gh logged in as jQrgen, and setup-git done)
# Order: sync roster -> build page -> grep gate -> commit -> publish. Any failure stops before anything is pushed.
# Does nothing (no commit, no push) when nothing changed. Does not touch the Nexa page, its data or its allowlist.
set -euo pipefail
REPO="$(cd "$(dirname "$0")/../.." && pwd)"; cd "$REPO"
[ "$(git rev-parse --abbrev-ref HEAD)" = main ] || { echo "publish-teams: check out main first (merge the teams-orgchart branch)"; exit 1; }
git pull -q --ff-only origin main
# 1. sync: box profiles/groups -> src/data/teams-roster.json (names, teams, ids only; warns about bots with no role line)
(cd src && node orgchart/sync-teams.js)
# 2. build: docs/teams/index.html (build-teams.js already runs the grep gate on its output and exits 1 on a hit)
(cd src && node orgchart/build-teams.js)
# 3. grep gate again, on the page and on every teams data file and script that goes into the public repo
#    (everything except the term list itself, orgchart/forbidden-terms.json)
GATED=(../docs/teams data/teams-roster.json data/teams-roles.json data/teams-config.json
  orgchart/sync-teams.js orgchart/build-teams.js orgchart/grep-gate.js orgchart/publish-teams.sh)
(cd src && node orgchart/grep-gate.js "${GATED[@]}")
# 4. publish
git add docs/teams src/data/teams-roster.json
git diff --cached --quiet || git commit -q -m "All-teams org chart: refresh from the team roster"
git fetch -q origin gh-pages
if [ -z "$(git rev-list origin/main..main)" ] && git diff --quiet origin/gh-pages main:docs; then echo "teams chart unchanged, nothing to publish"; exit 0; fi
# gh-pages = a copy of docs/ at the root (worktree in a temp dir)
WT="$(mktemp -d)"
git worktree add -q "$WT" -B gh-pages origin/gh-pages
(cd "$WT" && git rm -rq . && cp -R "$REPO/docs/." . && node "$REPO/src/orgchart/grep-gate.js" teams && git add -A && { git diff --cached --quiet || git commit -q -m "Publish site"; })
git push -q origin main gh-pages
git worktree remove --force "$WT"
gh api -X POST repos/jQrgen/presentations/pages/builds >/dev/null   # pushes alone have not been triggering Pages builds
echo "published $(git rev-parse --short main) / gh-pages $(git rev-parse --short gh-pages); Pages build requested: https://jqrgen.github.io/presentations/teams/"
