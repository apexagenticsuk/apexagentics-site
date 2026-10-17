(function(){var d=document,h=d.documentElement;
var editing=false;try{editing=window.parent!==window&&!!window.parent.DYE;}catch(e){editing=/[?&]edit/.test(location.search);}
/* placeholder links go nowhere until a real number exists */
d.addEventListener('click',function(e){var a=e.target.closest&&e.target.closest('a[data-ph-link]');if(a)e.preventDefault();});
d.addEventListener('click',function(e){var a=e.target.closest&&e.target.closest('#mnav a');if(a){var m=d.getElementById('mnav'),b=d.querySelector('button.ham');m.classList.remove('open');if(b)b.setAttribute('aria-expanded','false');}});
d.addEventListener('keydown',function(e){if(e.key!=='Escape')return;var m=d.getElementById('mnav'),b=d.querySelector('button.ham');if(m&&m.classList.contains('open')){m.classList.remove('open');if(b){b.setAttribute('aria-expanded','false');b.focus();}}});
/* the form sends nowhere: it only says so */
d.addEventListener('submit',function(e){var f=e.target;if(!f||!f.classList||!f.classList.contains('enq'))return;e.preventDefault();var m=f.querySelector('.msg');if(m)m.textContent='This form is a placeholder and sends nothing yet.';});
/* subtle scroll fade: an enhancement only, never hides content without script, skipped for reduced motion or editing */
if(editing||!('IntersectionObserver' in window)||matchMedia('(prefers-reduced-motion: reduce)').matches||innerHeight>1500)return;
var io;try{io=new IntersectionObserver(function(es){es.forEach(function(x){if(x.isIntersecting){x.target.classList.add('in');io.unobserve(x.target);}});},{rootMargin:'0px 0px -6% 0px',threshold:0});}catch(e){return;}
h.classList.add('js-rv');var n=0;
function showAll(){d.querySelectorAll('.rv:not(.in)').forEach(function(el){el.classList.add('in');});}
d.querySelectorAll('main>section:not(.hero) .wrap>*,.card,.pcard,.case').forEach(function(el){if(el.classList.contains('rv'))return;el.classList.add('rv');el.style.setProperty('--d',(n++%4)*60+'ms');io.observe(el);});
addEventListener('beforeprint',showAll);setTimeout(showAll,6000);
})();
