#!/usr/bin/env bash
# Bundle local JS (GSAP+SplitText, Lenis, OGL from node_modules, no CDN) into site/js with code splitting.
set -e; cd "$(dirname "$0")/.."; rm -rf site/js
npx esbuild site/src/main.js site/src/home.js --bundle --splitting --format=esm --minify --outdir=site/js --chunk-names=c-[hash] --legal-comments=linked
