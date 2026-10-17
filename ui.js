(function(){var d=document,h=d.documentElement;
var editing=false;try{editing=window.parent!==window&&!!window.parent.DYE;}catch(e){editing=/[?&]edit/.test(location.search);}
d.addEventListener('click',function(e){var a=e.target.closest&&e.target.closest('#mnav a');if(a){var m=d.getElementById('mnav'),b=d.querySelector('button.ham');m.classList.remove('open');if(b)b.setAttribute('aria-expanded','false');}});
d.addEventListener('keydown',function(e){if(e.key!=='Escape')return;var m=d.getElementById('mnav'),b=d.querySelector('button.ham');if(m&&m.classList.contains('open')){m.classList.remove('open');if(b){b.setAttribute('aria-expanded','false');b.focus();}}});
/* the contact form checks its fields and says plainly that it is not connected yet. It never sends anything anywhere. */
var MSG={name:'Please enter your name.',email:'Please enter your email address.',website:'Please enter your website address.',change:'Please tell us what you would like to change.'};
function check(f){var first=null;[].slice.call(f.querySelectorAll('input,textarea')).forEach(function(i){var e=i.parentNode.querySelector('.err'),v=i.value.trim(),m='';
  if(i.required&&!v)m=MSG[i.name]||'Please fill this in.';
  else if(i.name==='email'&&v&&!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v))m='Please check your email address: it should look like name@example.co.uk.';
  else if(i.name==='website'&&v&&!/^(https?:\/\/)?[^\s.]+\.[^\s]{2,}$/.test(v))m='Please check your website address: it should look like www.example.co.uk.';
  if(e)e.textContent=m;i.setAttribute('aria-invalid',m?'true':'false');if(m&&!first)first=i;});return first;}
d.addEventListener('submit',function(e){var f=e.target;if(!f||!f.classList||!f.classList.contains('enq'))return;e.preventDefault();if(editing)return;var m=f.querySelector('.msg'),bad=check(f);
  if(bad){if(m)m.textContent='Please fix the highlighted fields.';bad.focus();return;}
  if(m)m.textContent="Thank you. This form isn't connected yet, so nothing has been sent.";});
d.addEventListener('input',function(e){var i=e.target;if(i.closest&&i.closest('.enq')&&i.getAttribute('aria-invalid')==='true'){var er=i.parentNode.querySelector('.err');if(er&&i.value.trim()){er.textContent='';i.setAttribute('aria-invalid','false');}}});
/* subtle scroll fade: an enhancement only, never hides content without script, skipped for reduced motion or editing */
if(editing||!('IntersectionObserver' in window)||matchMedia('(prefers-reduced-motion: reduce)').matches||innerHeight>1500)return;
var io;try{io=new IntersectionObserver(function(es){es.forEach(function(x){if(x.isIntersecting){x.target.classList.add('in');io.unobserve(x.target);}});},{rootMargin:'0px 0px -6% 0px',threshold:0});}catch(e){return;}
h.classList.add('js-rv');var n=0;
function showAll(){d.querySelectorAll('.rv:not(.in)').forEach(function(el){el.classList.add('in');});}
d.querySelectorAll('main>section:not(.hero) .wrap>*,.card,.pcard,.case').forEach(function(el){if(el.classList.contains('rv'))return;el.classList.add('rv');el.style.setProperty('--d',(n++%4)*60+'ms');io.observe(el);});
addEventListener('beforeprint',showAll);setTimeout(showAll,6000);
})();
