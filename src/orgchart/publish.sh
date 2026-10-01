#!/bin/bash
# Refresh the Nexa team org chart from the AI team roster and republish https://jqrgen.github.io/presentations/nexa-team/
# Usage: bash src/orgchart/publish.sh   (from anywhere; needs gh logged in as jQrgen, and setup-git done)
# Does nothing (no commit, no push) when the roster has not changed.
set -euo pipefail
export GIT_TERMINAL_PROMPT=0 GH_PROMPT_DISABLED=1   # unattended: never wait for a prompt
REPO="$(cd "$(dirname "$0")/../.." && pwd)"; cd "$REPO"
# one publisher at a time (both publish scripts share this lock); a second run waits up to 10 min, then fails
exec 9>"${TMPDIR:-/tmp}/presentations-publish.lock"; flock -w 600 9 || { echo "another publish is running"; exit 1; }
[ "$(git rev-parse --abbrev-ref HEAD)" = main ] || { echo "check out main first"; exit 1; }
WT=""; cleanup() { [ -n "$WT" ] && git worktree remove --force "$WT" 2>/dev/null || true; git worktree prune; }; trap cleanup EXIT
git worktree prune
git pull -q --ff-only origin main
(cd src && node orgchart/build-orgchart.js && node home.js data ../docs https://github.com/jQrgen/presentations >/dev/null)
git add docs/nexa-team src/data/nexa-team.json src/data/nexa-contributions.json docs/index.html
git diff --cached --quiet || git commit -q -m "Nexa team org chart: refresh from the team roster"
git fetch -q origin gh-pages
if [ -z "$(git rev-list origin/main..main)" ] && git diff --quiet origin/gh-pages main:docs; then echo "org chart unchanged, nothing to publish"; exit 0; fi
# gh-pages = a copy of docs/ at the root (worktree in a temp dir)
WT="$(mktemp -d)"
git worktree add -q "$WT" -B gh-pages origin/gh-pages
(cd "$WT" && git rm -rq . && cp -R "$REPO/docs/." . && git add -A && { git diff --cached --quiet || git commit -q -m "Publish site"; })
git push -q --atomic origin main gh-pages
gh api -X POST repos/jQrgen/presentations/pages/builds >/dev/null   # pushes alone have not been triggering Pages builds
echo "published $(git rev-parse --short main) / gh-pages $(git rev-parse --short gh-pages); Pages build requested"
