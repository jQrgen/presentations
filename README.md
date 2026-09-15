# Presentations, talks, articles and papers

Personal site of Jørgen S. Notland: slide decks, a talks archive, Medium articles and academic papers.

- `docs/` is the published site (GitHub Pages serves it from the main branch; `.gitlab-ci.yml` mirrors it to GitLab Pages).
- `src/data/` holds the content: `talks.json`, `articles.json`, `papers.json`. Edit these and rebuild.
- `src/` holds the generators: `home.js` (front page), `cards.js` (year-grouped archives), `viewer.js` + `site.js` (browser viewer for new decks), `build.js` + `chart.js` + `content-*.js` (the Nexa deck as .pptx). Nexa branding is used only inside that deck's slides; the site itself uses the plain theme in `theme.js`.

## Rebuild

```bash
cd src && npm install && ./build-site.sh
```
