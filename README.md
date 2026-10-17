# Apex Agentics site (preview)

One-page static site, served from `main` on GitHub Pages. Hidden from search engines on purpose (noindex, nofollow on every page, robots.txt disallows all).

- `content.json`: single source of truth for shared content (prices, testimonials, contact, logo setting `brand.logo` = A, B or C, siteUrl). Price amounts stay empty until owner approves.
- `content.js`: applies `content.json` and editor overlays to the page. `tools/prerender.js` bakes it into the HTML so first paint needs no script.
- `admin/`: visual editor. Open `/admin/` and choose demo mode (no key needed).
- `tools/rebuild.sh`: run after changing `index.html` or `content.json` (needs Playwright and Chrome).
- Tests: serve with `python3 -m http.server 8834`, then `node tests/build.js` and `node tests/editor.js`.

Every [BRACKET] on the page is a visible placeholder to be replaced with confirmed content.
