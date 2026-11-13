// Apex Agentics Web: page behaviour, no libraries. Every page is complete in HTML and CSS; this only adds the extras below.
// Nothing here hides content before it runs, so a blocked or failed script still leaves the whole page readable.
const rm = matchMedia('(prefers-reduced-motion: reduce)').matches;
const $$ = (s, r = document) => [...r.querySelectorAll(s)];

// Phone swipe strips: the dots and the 'Card 1 of 3' live text follow the scroll position (not motion, so also under reduced motion)
$$('.works, .fgal').forEach(row => {
  const ui = row.parentElement.querySelector(':scope > .swipe-ui'); if (!ui) return;
  const dots = $$('.sdots i', ui), live = ui.querySelector('[aria-live]'); let raf = 0;
  const sync = () => {
    raf = 0; const kids = [...row.children], pad = parseFloat(getComputedStyle(row).paddingLeft), x0 = row.getBoundingClientRect().left + pad;
    let best = 0, d = 1e9; kids.forEach((k, i) => { const x = Math.abs(k.getBoundingClientRect().left - x0); if (x < d) { d = x; best = i; } });
    dots.forEach((el, i) => el.classList.toggle('on', i === best)); ui.classList.toggle('at-end', best === kids.length - 1);
    const msg = `Card ${best + 1} of ${kids.length}`; if (live && live.textContent !== msg) live.textContent = msg;
  };
  row.addEventListener('scroll', () => { if (!raf) raf = requestAnimationFrame(sync); }, { passive: true });
});

// Header: a hairline once the page has scrolled, and the current section marked in the nav
const top = document.querySelector('.top');
if (top) { const on = () => top.classList.toggle('scrolled', scrollY > 8); on(); addEventListener('scroll', on, { passive: true }); }
const links = $$('.tnav a').map(a => [a, document.getElementById((a.getAttribute('href').split('#')[1] || ''))]).filter(x => x[1]);
if (links.length && 'IntersectionObserver' in window) {
  const seen = new Map();
  const io = new IntersectionObserver(es => {
    es.forEach(e => seen.set(e.target, e.isIntersecting));
    const cur = links.find(([, s]) => seen.get(s));
    links.forEach(([a]) => { const on = !!cur && a === cur[0]; a.classList.toggle('on', on); if (on) a.setAttribute('aria-current', 'true'); else a.removeAttribute('aria-current'); });
  }, { rootMargin: '-45% 0px -50% 0px' });
  links.forEach(([, s]) => io.observe(s));
}

// Motion (skipped entirely under reduced motion): sections ease in as they arrive, and the How it works line draws itself.
// Only elements still below the fold are prepared, so nothing already on screen is ever hidden.
if (!rm && 'IntersectionObserver' in window) {
  const below = el => el.getBoundingClientRect().top > innerHeight * .92;
  const els = $$('.sr, .reveal').filter(below);
  els.forEach(el => el.classList.add('pre'));
  const show = el => { el.classList.add('in'); io.unobserve(el); };
  const io = new IntersectionObserver(es => {
    const hit = es.filter(e => e.isIntersecting).map(e => e.target);
    hit.forEach((el, i) => { el.style.transitionDelay = Math.min(i, 5) * 70 + 'ms'; show(el); });
  }, { rootMargin: '0px 0px -8% 0px', threshold: .01 });
  els.forEach(el => io.observe(el));
  // an anchor jump (header nav, 'See prices') can skip past elements: show everything at or above the viewport
  const catchUp = () => els.forEach(el => { if (!el.classList.contains('in') && el.getBoundingClientRect().top < innerHeight) { el.style.transitionDelay = '0ms'; show(el); } });
  addEventListener('hashchange', () => requestAnimationFrame(catchUp)); addEventListener('scrollend', catchUp);
  const steps = document.querySelector('.steps-wrap');
  if (steps && below(steps)) {
    steps.classList.add('js-steps');
    new IntersectionObserver((es, o) => { if (es.some(e => e.isIntersecting)) { steps.classList.add('go'); o.disconnect(); } }, { rootMargin: '0px 0px -18% 0px', threshold: .2 }).observe(steps);
  }
}
