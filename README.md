# Presentations, talks, articles and papers

**Live site: https://jqrgen.github.io/presentations/**

Personal site of Jørgen S. Notland: slide decks, a [talks archive](https://jqrgen.github.io/presentations/talks/), [Medium articles](https://jqrgen.github.io/presentations/articles/) and [academic papers](https://jqrgen.github.io/presentations/papers/).

- `docs/` is the published site. The `gh-pages` branch holds a copy of `docs/` at its root, which is what GitHub Pages serves; `.gitlab-ci.yml` mirrors it to GitLab Pages as a staging copy.
- `src/data/` holds the content: `talks.json`, `articles.json`, `papers.json`. Edit these and rebuild.
- `src/` holds the generators: `home.js` (front page), `cards.js` (year-grouped archives), `viewer.js` + `site.js` (browser viewer for new decks), `build.js` + `chart.js` + `content-*.js` (the Nexa deck as .pptx). Nexa branding is used only inside that deck's slides; the site itself uses the plain theme in `theme.js`.

## Rebuild

```bash
cd src && npm install && ./build-site.sh
```
