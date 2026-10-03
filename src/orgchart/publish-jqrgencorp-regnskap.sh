#!/bin/bash
# Build and publish the jQrgenCorp accounting article: https://jqrgen.github.io/presentations/jqrgencorp-regnskap/
# Usage: bash src/orgchart/publish-jqrgencorp-regnskap.sh   (from anywhere, on main; needs gh logged in as jQrgen, and setup-git done)
# Order: build page (with its privacy gates) -> gate again -> commit only this page's files -> copy ONLY this page to gh-pages -> push.
# Unlike publish.sh / publish-teams.sh it does not copy all of docs/ to gh-pages, so other pages on gh-pages are left exactly as they are.
# Any failure stops before anything is pushed. Does nothing when nothing changed.
set -euo pipefail
export GIT_TERMINAL_PROMPT=0 GH_PROMPT_DISABLED=1   # unattended: never wait for a prompt
REPO="$(cd "$(dirname "$0")/../.." && pwd)"; cd "$REPO"
# one publisher at a time (shares the lock with the other publish scripts); a second run waits up to 10 min, then fails
exec 9>"${TMPDIR:-/tmp}/presentations-publish.lock"; flock -w 600 9 || { echo "another publish is running"; exit 1; }
[ "$(git rev-parse --abbrev-ref HEAD)" = main ] || { echo "check out main first"; exit 1; }
git diff --cached --quiet || { echo "something is already staged; commit or unstage it first"; exit 1; }
WT=""; cleanup() { [ -n "$WT" ] && git worktree remove --force "$WT" 2>/dev/null || true; git worktree prune; }; trap cleanup EXIT
git worktree prune
git pull -q --ff-only origin main
PAGE=docs/jqrgencorp-regnskap
FILES=(src/share.js src/social.js src/orgchart/build-jqrgencorp-regnskap.js src/orgchart/jqrgencorp-regnskap-terms.json src/orgchart/publish-jqrgencorp-regnskap.sh)
# 1. build (the builder runs the term gate and the digit gate and removes its output on a hit)
(cd src && node orgchart/build-jqrgencorp-regnskap.js)
# 2. term gate again, on the page and the builder (the term list itself is not scanned)
(cd src && node orgchart/grep-gate.js ../$PAGE orgchart/build-jqrgencorp-regnskap.js share.js social.js --terms orgchart/jqrgencorp-regnskap-terms.json)
# 3. commit only this page's files
git add "$PAGE" "${FILES[@]}"
git diff --cached --quiet || git commit -q -m "${1:-jQrgenCorp accounting article (NO/EN): Folio MCP + Fiken API + Grok Bot}"
# 4. gh-pages: replace only this page's directory
git fetch -q origin gh-pages
WT="$(mktemp -d)"
git worktree add -q "$WT" -B gh-pages origin/gh-pages
rm -rf "$WT/jqrgencorp-regnskap" && cp -R "$REPO/$PAGE" "$WT/jqrgencorp-regnskap"
(cd "$WT" && node "$REPO/src/orgchart/grep-gate.js" jqrgencorp-regnskap --terms "$REPO/src/orgchart/jqrgencorp-regnskap-terms.json" \
  && git add -A jqrgencorp-regnskap && { git diff --cached --quiet || git commit -q -m "Publish jqrgencorp-regnskap"; })
if [ -z "$(git rev-list origin/main..main)" ] && [ -z "$(git rev-list origin/gh-pages..gh-pages)" ]; then echo "article unchanged, nothing to publish"; exit 0; fi
git push -q --atomic origin main gh-pages
gh api -X POST repos/jQrgen/presentations/pages/builds >/dev/null   # pushes alone have not been triggering Pages builds
echo "published $(git rev-parse --short main) / gh-pages $(git rev-parse --short gh-pages); Pages build requested: https://jqrgen.github.io/presentations/jqrgencorp-regnskap/"
