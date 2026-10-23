// Holding page (/) motion. Only loaded by the inline loader on desktop with a fine pointer and motion allowed
// (phones, reduced motion and no-JS never fetch it). The page is complete in HTML; this only animates it.
import { gsap } from 'gsap';
import { SplitText } from 'gsap/SplitText';
gsap.registerPlugin(SplitText);
const h = document.querySelector('.home-h1'), card = document.querySelector('.dcard');
const show = () => { for (const el of [h, card]) if (el) { el.style.animation = 'none'; el.style.visibility = 'visible'; } };
document.fonts.ready.then(() => {
  const s = SplitText.create(h, { type: 'lines,chars', mask: 'lines', aria: 'auto' });
  show();
  gsap.from(s.chars, { yPercent: 118, duration: 1.25, ease: 'expo.out', stagger: .045 });
  gsap.from(card, { autoAlpha: 0, y: 28, duration: 1.1, ease: 'power3.out', delay: .55 });
}).catch(show);
addEventListener('load', () => import('./desktop.js').then(m => m.init(gsap, { lenis: false, magnet: '.dcard', magnetK: .08, orb: { host: '.home-orb', c: [0, 0], r: .72 } })));
