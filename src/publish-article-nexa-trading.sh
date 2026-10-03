#!/bin/bash
# Build and publish the article https://jqrgen.github.io/presentations/articles/nexa-automated-trading/
# plus the pages it touches: the home timeline (docs/index.html, from data/articles.json) and the Nexa team org chart
# (docs/nexa-team, 'Public work' from data/nexa-contributions.json), with the same build and grep gates as orgchart/publish.sh.
# Usage: bash src/publish-article-nexa-trading.sh   (from anywhere, on main; needs gh logged in as jQrgen)
# Like publish-jqrgencorp-regnskap.sh it copies ONLY these paths to gh-pages, so nothing else there changes
# (orgchart/publish.sh copies the whole docs/ working tree, untracked drafts included).
set -euo pipefail
export GIT_TERMINAL_PROMPT=0 GH_PROMPT_DISABLED=1
REPO="$(cd "$(dirname "$0")/.." && pwd)"; cd "$REPO"
exec 9>"${TMPDIR:-/tmp}/presentations-publish.lock"; flock -w 600 9 || { echo "another publish is running"; exit 1; }
[ "$(git rev-parse --abbrev-ref HEAD)" = main ] || { echo "check out main first"; exit 1; }
git diff --cached --quiet || { echo "something is already staged; commit or unstage it first"; exit 1; }
WT=""; cleanup() { [ -n "$WT" ] && git worktree remove --force "$WT" 2>/dev/null || true; git worktree prune; }; trap cleanup EXIT
git worktree prune
git pull -q --ff-only origin main
PAGES=(articles/nexa-automated-trading nexa-team index.html)
FILES=(src/share.js src/build-article-nexa-trading.js src/articles/nexa-automated-trading.md src/publish-article-nexa-trading.sh
       src/data/articles.json src/data/nexa-team.json src/data/nexa-contributions.json)
# 1. build: article, org chart, home timeline
(cd src && node build-article-nexa-trading.js && node orgchart/build-orgchart.js && node home.js data ../docs https://github.com/jQrgen/presentations >/dev/null)
# 2. gates: the shared public-page term list on the article; the org chart's own gates as in publish.sh
(cd src && node orgchart/grep-gate.js ../docs/articles/nexa-automated-trading build-article-nexa-trading.js articles/nexa-automated-trading.md share.js \
  && node orgchart/grep-gate.js ../docs/nexa-team data/nexa-team.json data/nexa-contributions.json orgchart/build-orgchart.js orgchart/publish.sh \
  && node orgchart/grep-gate.js ../docs/nexa-team data/nexa-team.json data/nexa-contributions.json --terms orgchart/nexa-team-dscor-terms.json)
# 3. commit only these files on main
git add "${FILES[@]}" "${PAGES[@]/#/docs/}"
git diff --cached --quiet || git commit -q -m "Article: Not Exchange HFT: Building Automated Trading Products on Nexa (/articles/nexa-automated-trading/, share bar X/LinkedIn/Reddit/HN/copy link, OG + Twitter card); on the home timeline; credited on the org chart (Marketing strategy, Nexa media & communications)"
# 4. gh-pages: replace only these paths
git fetch -q origin gh-pages
WT="$(mktemp -d)"
git worktree add -q "$WT" -B gh-pages origin/gh-pages
for p in "${PAGES[@]}"; do rm -rf "$WT/$p"; mkdir -p "$(dirname "$WT/$p")"; cp -R "$REPO/docs/$p" "$WT/$p"; done
(cd "$WT" && git add -A "${PAGES[@]}" && { git diff --cached --quiet || git commit -q -m "Publish articles/nexa-automated-trading, nexa-team, index.html (only these paths)"; })
if [ -z "$(git rev-list origin/main..main)" ] && [ -z "$(git rev-list origin/gh-pages..gh-pages)" ]; then echo "unchanged, nothing to publish"; exit 0; fi
git push -q --atomic origin main gh-pages
gh api -X POST repos/jQrgen/presentations/pages/builds >/dev/null
echo "published $(git rev-parse --short main) / gh-pages $(git rev-parse --short gh-pages); Pages build requested"
