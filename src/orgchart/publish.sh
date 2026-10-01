#!/bin/bash
# Refresh the Nexa team org chart from the AI team roster and republish https://jqrgen.github.io/presentations/nexa-team/
# Usage: bash src/orgchart/publish.sh   (from anywhere; needs gh logged in as jQrgen, and setup-git done)
# Does nothing (no commit, no push) when the roster has not changed.
set -euo pipefail
REPO="$(cd "$(dirname "$0")/../.." && pwd)"; cd "$REPO"
git pull -q --ff-only origin main
(cd src && node orgchart/build-orgchart.js && node home.js data ../docs https://github.com/jQrgen/presentations >/dev/null)
git add docs/nexa-team src/data/nexa-team.json docs/index.html
git diff --cached --quiet || git commit -q -m "Nexa team org chart: refresh from the team roster"
git fetch -q origin gh-pages
if [ -z "$(git rev-list origin/main..main)" ] && git diff --quiet origin/gh-pages main:docs; then echo "org chart unchanged, nothing to publish"; exit 0; fi
# gh-pages = a copy of docs/ at the root (worktree in a temp dir)
WT="$(mktemp -d)"
git worktree add -q "$WT" -B gh-pages origin/gh-pages
(cd "$WT" && git rm -rq . && cp -R "$REPO/docs/." . && git add -A && { git diff --cached --quiet || git commit -q -m "Publish site"; })
git push -q origin main gh-pages
git worktree remove --force "$WT"
gh api -X POST repos/jQrgen/presentations/pages/builds >/dev/null   # pushes alone have not been triggering Pages builds
echo "published $(git rev-parse --short main) / gh-pages $(git rev-parse --short gh-pages); Pages build requested"
