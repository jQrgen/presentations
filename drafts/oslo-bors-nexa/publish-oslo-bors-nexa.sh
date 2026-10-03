#!/bin/bash
# DISABLED (3 Oct 2026): this article was published at 03:12 without a traceable approval from jQrgen and was taken down.
# Kept here for history only. Do not run it until jQrgen has approved publication himself; then move it back to src/
# (REPO below assumes src/) and remove this guard.
echo "oslo-bors-nexa is an unapproved draft: publishing needs jQrgen's explicit approval" >&2; exit 1
# Build and publish https://jqrgen.github.io/presentations/oslo-bors-nexa/ (final, no draft banner, no noindex)
# plus its entry on the home timeline (docs/index.html, from data/articles.json).
# Copies ONLY these paths to gh-pages, so nothing else there changes (never use orgchart/publish.sh, which copies
# the whole docs/ working tree). Usage: bash src/publish-oslo-bors-nexa.sh  (on main; needs gh logged in as jQrgen)
set -euo pipefail
export GIT_TERMINAL_PROMPT=0 GH_PROMPT_DISABLED=1
REPO="$(cd "$(dirname "$0")/.." && pwd)"; cd "$REPO"
exec 9>"${TMPDIR:-/tmp}/presentations-publish.lock"; flock -w 600 9 || { echo "another publish is running"; exit 1; }
[ "$(git rev-parse --abbrev-ref HEAD)" = main ] || { echo "check out main first"; exit 1; }
git diff --cached --quiet || { echo "something is already staged; commit or unstage it first"; exit 1; }
WT=""; cleanup() { [ -n "$WT" ] && git worktree remove --force "$WT" 2>/dev/null || true; git worktree prune; }; trap cleanup EXIT
git worktree prune
git pull -q --ff-only origin main
PAGES=(oslo-bors-nexa index.html)
FILES=(src/build-oslo-bors-nexa.js src/oslo-bors-nexa-terms.json src/publish-oslo-bors-nexa.sh src/data/articles.json)
# 1. build (the builder runs its own banned-terms gate and deletes the page if it fails) + home timeline
(cd src && node build-oslo-bors-nexa.js --final && node home.js data ../docs https://github.com/jQrgen/presentations >/dev/null)
! grep -qE 'noindex|class="draft"' docs/oslo-bors-nexa/index.html || { echo "draft markers still in page"; exit 1; }
# 2. commit only these files on main
git add "${FILES[@]}" "${PAGES[@]/#/docs/}"
git diff --cached --quiet || git commit -q -m "Article: Nexa-Børs, could Oslo Børs run shares as Nexa tokens and still follow Norwegian rules? (/oslo-bors-nexa/, NO+EN, sourced, share bars, dividends as a krone e-money token); on the home timeline"
# 3. gh-pages: replace only these paths
git fetch -q origin gh-pages
WT="$(mktemp -d)"
git worktree add -q "$WT" -B gh-pages origin/gh-pages
for p in "${PAGES[@]}"; do rm -rf "$WT/$p"; mkdir -p "$(dirname "$WT/$p")"; cp -R "$REPO/docs/$p" "$WT/$p"; done
(cd "$WT" && git add -A "${PAGES[@]}" && { git diff --cached --quiet || git commit -q -m "Publish oslo-bors-nexa, index.html (only these paths)"; })
if [ -z "$(git rev-list origin/main..main)" ] && [ -z "$(git rev-list origin/gh-pages..gh-pages)" ]; then echo "unchanged, nothing to publish"; exit 0; fi
git push -q --atomic origin main gh-pages
gh api -X POST repos/jQrgen/presentations/pages/builds >/dev/null || echo "note: Pages build request failed (push still done)"
echo "published $(git rev-parse --short main) / gh-pages $(git rev-parse --short gh-pages)"
