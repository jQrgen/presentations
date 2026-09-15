#!/bin/bash
# Rebuilds the whole site into ./site (docs/ = published pages, src/ = sources). Run from the src directory.
set -e
HERE="$(cd "$(dirname "$0")" && pwd)"; cd "$HERE"
WS="${WS:-$HERE/..}"; OUT="${OUT:-$HERE/site}"; REPO="${REPO_URL:-https://github.com/jQrgen/presentations}"
D="$OUT/docs"; rm -rf "$OUT"; mkdir -p "$D/talks/files" "$D/nexa-vs-bitcoin-ethereum" "$OUT/src/brand" "$OUT/src/data"
# Nexa deck: viewers (slides rendered earlier into site-en/site-no), pptx + pdf
PPTX_URL="../Nexa-vs-Bitcoin-Ethereum.pptx" PDF_URL="../Nexa-vs-Bitcoin-Ethereum.pdf" node site.js en >/dev/null
PPTX_URL="../Nexa-vs-Bitcoin-Ethereum-NO.pptx" PDF_URL="../Nexa-vs-Bitcoin-Ethereum-NO.pdf" node site.js no >/dev/null
cp -R site-en "$D/nexa-vs-bitcoin-ethereum/en"; cp -R site-no "$D/nexa-vs-bitcoin-ethereum/no"
rm -f "$D/nexa-vs-bitcoin-ethereum/en/nexa-logo.svg" "$D/nexa-vs-bitcoin-ethereum/no/nexa-logo.svg"
cp "$WS/Nexa-vs-Bitcoin-Ethereum.pptx" "$WS/Nexa-vs-Bitcoin-Ethereum-NO.pptx" "$D/nexa-vs-bitcoin-ethereum/"
cp render/Nexa-vs-Bitcoin-Ethereum.pdf render-no/Nexa-vs-Bitcoin-Ethereum-NO.pdf "$D/nexa-vs-bitcoin-ethereum/"
# old talks as original PDFs
cp talk1/render/deck.pdf "$D/talks/files/patch.pdf"; cp pages/public/patch/cover.png "$D/talks/files/patch-cover.png"
cp oldtalks/tobm-2017.pdf "$D/talks/files/tobm-2017.pdf"; cp oldtalks/tobm-2017-cover.png "$D/talks/files/tobm-2017-cover.png"
cp oldtalks/bitcoin-securities-2018.pdf "$D/talks/files/bitcoin-securities-2018.pdf"; cp oldtalks/bitcoin-securities-2018-cover.png "$D/talks/files/bitcoin-securities-2018-cover.png"
# pages
node home.js data "$D" "$REPO"
node cards.js data/talks.json "$D/talks" talks "$REPO"
node cards.js data/articles.json "$D/articles" articles "$REPO"
node cards.js data/papers.json "$D/papers" papers "$REPO"
touch "$D/.nojekyll"
# sources
cp build.js chart.js content-en.js content-no.js site.js viewer.js theme.js cards.js home.js gl_commit.py package.json build-site.sh "$OUT/src/"
cp brand/*.svg "$OUT/src/brand/"; cp data/*.json "$OUT/src/data/"
cat > "$OUT/.gitlab-ci.yml" <<'YML'
# Mirrors docs/ to GitLab Pages (GitHub Pages serves docs/ directly).
pages:
  stage: deploy
  image: alpine:3.20
  script:
    - mkdir -p public && cp -R docs/. public/
  artifacts:
    paths: [public]
  rules:
    - if: $CI_COMMIT_BRANCH == $CI_DEFAULT_BRANCH
YML
cat > "$OUT/README.md" <<'MD'
# Presentations, talks, articles and papers

Personal site of Jørgen S. Notland: slide decks, a talks archive, Medium articles and academic papers.

- `docs/` is the published site (GitHub Pages serves it from the main branch; `.gitlab-ci.yml` mirrors it to GitLab Pages).
- `src/data/` holds the content: `talks.json`, `articles.json`, `papers.json`. Edit these and rebuild.
- `src/` holds the generators: `home.js` (front page), `cards.js` (year-grouped archives), `viewer.js` + `site.js` (browser viewer for new decks), `build.js` + `chart.js` + `content-*.js` (the Nexa deck as .pptx). Nexa branding is used only inside that deck's slides; the site itself uses the plain theme in `theme.js`.

## Rebuild

```bash
cd src && npm install && ./build-site.sh
```
MD
echo "site: $(find "$OUT" -type f | wc -l) files, $(du -sh "$OUT" | cut -f1)"
