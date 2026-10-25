// Apex Agentics Web: on-page picture viewer for the /web gallery (no libraries).
// Each a.wfull[data-view] still links to the full-size WebP, so without this script a tap simply opens the picture.
// Opens a native <dialog>: focus goes to Close; Close, Esc, a click outside the picture or Back closes it; focus returns to the picture.
// Phones (max-width:759px) load <data-view>-750/1125.webp (9:16 crop, JPEG fallback); larger screens load the 2400px WebP fitted to the screen.
// Pinch-zoom is never blocked: this script leaves touch handling and the viewport meta alone.
(function(){
  var d=document.querySelector('dialog.viewer');
  if(!d||typeof d.showModal!=='function')return;
  var img=d.querySelector('img'),src=d.querySelectorAll('source'),btn=d.querySelector('.vclose'),opener=null,pushed=false;
  function ours(){return !!(history.state&&history.state.apexViewer);}
  function open(a){
    var v=a.getAttribute('data-view'),pic=a.querySelector('img'),alt=pic?pic.alt:'';
    src[0].srcset=v+'-750.webp 750w, '+v+'-1125.webp 1125w';
    src[1].srcset=v+'-750.jpg';
    img.src=a.getAttribute('href');img.alt=alt;
    d.setAttribute('aria-label',alt);
    opener=a;d.showModal();d.scrollTop=0;btn.focus();
    try{history.pushState({apexViewer:1},'');pushed=true;}catch(err){pushed=false;}
  }
  function shut(){
    if(!d.open)return;
    if(pushed&&ours())history.back(); // popstate below closes the dialog
    else d.close();
  }
  document.addEventListener('click',function(ev){
    var a=ev.target.closest&&ev.target.closest('a.wfull[data-view]');
    if(!a||ev.defaultPrevented||ev.button!==0||ev.metaKey||ev.ctrlKey||ev.shiftKey||ev.altKey)return;
    ev.preventDefault();open(a);
  });
  btn.addEventListener('click',shut);
  d.addEventListener('cancel',function(ev){ev.preventDefault();shut();}); // Esc
  d.addEventListener('click',function(ev){if(ev.target===d||ev.target.classList.contains('vstage'))shut();}); // backdrop / outside the picture
  window.addEventListener('popstate',function(){if(d.open){pushed=false;d.close();}}); // Back
  d.addEventListener('close',function(){
    if(pushed&&ours())history.back();
    pushed=false;
    if(opener){opener.focus({preventScroll:true});opener=null;}
  });
})();
// Editor card "Reorder sections" (button.rdemo): CSS plays it on hover/focus. On touch screens it autoplays while mostly on screen; a tap pauses or plays it. Nothing runs under reduced motion (CSS shows a still frame).
(function(){
  var rm=window.matchMedia&&matchMedia('(prefers-reduced-motion: reduce)').matches;
  var fine=window.matchMedia&&matchMedia('(hover: hover) and (pointer: fine)').matches;
  document.querySelectorAll('.rdemo').forEach(function(el){
    if(rm)return;
    var set=function(on){el.classList.toggle('play',on);el.setAttribute('aria-pressed',on?'true':'false');};
    if(!fine&&'IntersectionObserver' in window){new IntersectionObserver(function(es){es.forEach(function(en){if(!el.dataset.paused)set(en.isIntersecting);});},{threshold:.6}).observe(el);}
    el.addEventListener('click',function(){var on=!el.classList.contains('play');set(on);el.dataset.paused=on?'':'1';});
  });
})();
