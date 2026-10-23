// Mobile-safe entry. Content is fully rendered in HTML; this only adds motion. Nothing runs under reduced motion.
import { gsap } from 'gsap';
import { SplitText } from 'gsap/SplitText';
const rm = matchMedia('(prefers-reduced-motion: reduce)').matches;
const fine = matchMedia('(hover: hover) and (pointer: fine)').matches;
// phone swipe strips: page dots follow the scroll position (not motion, so also under reduced motion)
document.querySelectorAll('.works, .fgal').forEach(row => {
  const dots = row.parentElement.querySelectorAll(`:scope > .swipe-ui .sdots i`); if (!dots.length) return;
  row.addEventListener('scroll', () => { const kids = [...row.children]; let best = 0, d = 1e9; kids.forEach((k, i) => { const x = Math.abs(k.getBoundingClientRect().left - row.getBoundingClientRect().left - parseFloat(getComputedStyle(row).paddingLeft)); if (x < d) { d = x; best = i; } }); dots.forEach((el, i) => el.classList.toggle('on', i === best)); const ui = row.parentElement.querySelector(':scope > .swipe-ui'); ui.classList.toggle('at-end', best === kids.length - 1); const live = ui.querySelector('[aria-live]'), msg = `Card ${best + 1} of ${kids.length}`; if (live.textContent !== msg) live.textContent = msg; }, { passive: true });
});
if (!rm) {
  gsap.registerPlugin(SplitText);
  // 2. hero headline line-by-line (aria-label is on the h1 in HTML; split children are aria-hidden)
  const h = document.querySelector('.hero h1');
  if (h) document.fonts.ready.then(() => {
    const s = SplitText.create(h, { type: 'lines', mask: 'lines', aria: 'hidden' });
    gsap.from(s.lines, { yPercent: 110, duration: 1.1, ease: 'expo.out', stagger: 0.09 });
  });
  // FAQ: smooth open/close on native <details> (keyboard and screen readers keep native behaviour)
  document.querySelectorAll('details').forEach(d => {
    const sum = d.querySelector('summary'), body = d.querySelector('summary + *');
    sum.addEventListener('click', ev => {
      ev.preventDefault();
      if (d.open) { d.classList.add('shut'); gsap.to(body, { height: 0, opacity: 0, duration: .35, ease: 'power2.inOut', onComplete: () => { d.open = false; d.classList.remove('shut'); gsap.set(body, { clearProps: 'all' }); } }); }
      else { d.open = true; gsap.from(body, { height: 0, opacity: 0, duration: .45, ease: 'power2.out', clearProps: 'all' }); }
    });
  });
  // 4. work image reveal (clip-path + scale)
  const work = document.querySelectorAll('.reveal');
  import('gsap/ScrollTrigger').then(({ ScrollTrigger }) => {
    gsap.registerPlugin(ScrollTrigger);
    // every section: text fades/slides in as it enters (content is in the HTML, so JS-off shows it all)
    gsap.set([...document.querySelectorAll('.sr')].filter(el => el.getBoundingClientRect().top > innerHeight * .9), { autoAlpha: 0, y: 36 });
    const steps = document.querySelectorAll('.steps.big li');
    if (steps.length) { document.querySelector('.steps-wrap').classList.add('js-steps'); gsap.set(steps, { '--p': 0 }); const lit = () => steps.forEach(li => { const v = parseFloat(gsap.getProperty(li, '--p')); li.classList.toggle('lit', v > 0.001); li.classList.toggle('done', v > 0.999); }); gsap.timeline({ onUpdate: lit, scrollTrigger: { trigger: '.steps-wrap', start: 'top 85%', end: 'bottom 85%', scrub: true } }).to(steps, { '--p': 1, ease: 'none', stagger: 1, duration: 1 }); }
    // anchor jumps (e.g. Get in touch -> #contact-note) can skip past triggers: reveal everything at or above the viewport
    const showUpTo = () => gsap.to([...document.querySelectorAll('.sr')].filter(el => el.getBoundingClientRect().top < innerHeight), { autoAlpha: 1, y: 0, duration: .5, overwrite: 'auto' });
    addEventListener('hashchange', () => requestAnimationFrame(showUpTo)); if (location.hash) requestAnimationFrame(showUpTo);
    ScrollTrigger.batch('.sr', { start: 'top 90%', once: true, onEnter: b => gsap.to(b, { autoAlpha: 1, y: 0, duration: .9, ease: 'power3.out', stagger: .08, overwrite: 'auto' }) });
    work.forEach(el => gsap.fromTo(el, { clipPath: 'inset(18% 10% 18% 10% round 24px)', scale: 1.08 },
      { clipPath: 'inset(0% 0% 0% 0% round 20px)', scale: 1, ease: 'power3.out', duration: 1.2,
        scrollTrigger: { trigger: el, start: 'top 85%' } }));
  });
  // 1,3,7 desktop only: Lenis, cursor, magnetic buttons, OGL orb
  if (fine && innerWidth >= 1024) addEventListener('load', () => import('./desktop.js').then(m => m.init(gsap)));
}
