import Lenis from 'lenis';
// o.lenis=false skips smooth scroll (holding page has nothing to scroll); o.orb passes host/centre/radius to the orb; o.magnet picks magnetic elements
export function init(gsap, o = {}) {
  if (o.lenis !== false) {
    const lenis = new Lenis({ lerp: 0.1 });
    gsap.ticker.add(t => lenis.raf(t * 1000)); gsap.ticker.lagSmoothing(0);
    import('gsap/ScrollTrigger').then(({ ScrollTrigger }) => lenis.on('scroll', ScrollTrigger.update));
  }
  // custom cursor
  const c = document.createElement('div'); c.className = 'cursor'; c.setAttribute('aria-hidden', 'true'); document.body.append(c);
  const xTo = gsap.quickTo(c, 'x', { duration: .25, ease: 'power3' }), yTo = gsap.quickTo(c, 'y', { duration: .25, ease: 'power3' });
  // hidden (CSS opacity 0) until the first real mouse move, so it never sits at 0,0 in the top-left
  addEventListener('mousemove', e => { gsap.set(c, { x: e.clientX, y: e.clientY }); c.classList.add('seen'); }, { once: true });
  addEventListener('pointermove', e => { xTo(e.clientX); yTo(e.clientY); });
  document.querySelectorAll('a,summary').forEach(a => { a.addEventListener('pointerenter', () => c.classList.add('on')); a.addEventListener('pointerleave', () => c.classList.remove('on')); });
  // magnetic buttons
  document.querySelectorAll(o.magnet || '.btn').forEach(b => {
    const k = o.magnetK || .3;
    const bx = gsap.quickTo(b, 'x', { duration: .4, ease: 'elastic.out(1,.4)' }), by = gsap.quickTo(b, 'y', { duration: .4, ease: 'elastic.out(1,.4)' });
    b.addEventListener('pointermove', e => { const r = b.getBoundingClientRect(); bx((e.clientX - r.left - r.width / 2) * k); by((e.clientY - r.top - r.height / 2) * k); });
    b.addEventListener('pointerleave', () => { bx(0); by(0); });
  });
  // OGL orb after idle; CSS gradient stays as the static fallback
  (window.requestIdleCallback || setTimeout)(() => import('./orb.js').then(m => m.orb(o.orb)).catch(() => {}));
}
