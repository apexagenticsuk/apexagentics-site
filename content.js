/* Apex Agentics site: applies content.json (made in the visual editor at /admin/) to the built page.
   With no edits, built pages are left exactly as they are. Elements carry stable ids in data-dy="...". */
(function(){
var ICONS={"instagram": {"title": "Instagram", "color": "#E4405F", "svg": "<svg viewBox=\"0 0 24 24\" aria-hidden=\"true\" focusable=\"false\"><path d=\"M7.0301.084c-1.2768.0602-2.1487.264-2.911.5634-.7888.3075-1.4575.72-2.1228 1.3877-.6652.6677-1.075 1.3368-1.3802 2.127-.2954.7638-.4956 1.6365-.552 2.914-.0564 1.2775-.0689 1.6882-.0626 4.947.0062 3.2586.0206 3.6671.0825 4.9473.061 1.2765.264 2.1482.5635 2.9107.308.7889.72 1.4573 1.388 2.1228.6679.6655 1.3365 1.0743 2.1285 1.38.7632.295 1.6361.4961 2.9134.552 1.2773.056 1.6884.069 4.9462.0627 3.2578-.0062 3.668-.0207 4.9478-.0814 1.28-.0607 2.147-.2652 2.9098-.5633.7889-.3086 1.4578-.72 2.1228-1.3881.665-.6682 1.0745-1.3378 1.3795-2.1284.2957-.7632.4966-1.636.552-2.9124.056-1.2809.0692-1.6898.063-4.948-.0063-3.2583-.021-3.6668-.0817-4.9465-.0607-1.2797-.264-2.1487-.5633-2.9117-.3084-.7889-.72-1.4568-1.3876-2.1228C21.2982 1.33 20.628.9208 19.8378.6165 19.074.321 18.2017.1197 16.9244.0645 15.6471.0093 15.236-.005 11.977.0014 8.718.0076 8.31.0215 7.0301.0839m.1402 21.6932c-1.17-.0509-1.8053-.2453-2.2287-.408-.5606-.216-.96-.4771-1.3819-.895-.422-.4178-.6811-.8186-.9-1.378-.1644-.4234-.3624-1.058-.4171-2.228-.0595-1.2645-.072-1.6442-.079-4.848-.007-3.2037.0053-3.583.0607-4.848.05-1.169.2456-1.805.408-2.2282.216-.5613.4762-.96.895-1.3816.4188-.4217.8184-.6814 1.3783-.9003.423-.1651 1.0575-.3614 2.227-.4171 1.2655-.06 1.6447-.072 4.848-.079 3.2033-.007 3.5835.005 4.8495.0608 1.169.0508 1.8053.2445 2.228.408.5608.216.96.4754 1.3816.895.4217.4194.6816.8176.9005 1.3787.1653.4217.3617 1.056.4169 2.2263.0602 1.2655.0739 1.645.0796 4.848.0058 3.203-.0055 3.5834-.061 4.848-.051 1.17-.245 1.8055-.408 2.2294-.216.5604-.4763.96-.8954 1.3814-.419.4215-.8181.6811-1.3783.9-.4224.1649-1.0577.3617-2.2262.4174-1.2656.0595-1.6448.072-4.8493.079-3.2045.007-3.5825-.006-4.848-.0608M16.953 5.5864A1.44 1.44 0 1 0 18.39 4.144a1.44 1.44 0 0 0-1.437 1.4424M5.8385 12.012c.0067 3.4032 2.7706 6.1557 6.173 6.1493 3.4026-.0065 6.157-2.7701 6.1506-6.1733-.0065-3.4032-2.771-6.1565-6.174-6.1498-3.403.0067-6.156 2.771-6.1496 6.1738M8 12.0077a4 4 0 1 1 4.008 3.9921A3.9996 3.9996 0 0 1 8 12.0077\"/></svg>"}, "tiktok": {"title": "TikTok", "color": "#25F4EE", "svg": "<svg viewBox=\"0 0 24 24\" aria-hidden=\"true\" focusable=\"false\"><path d=\"M12.525.02c1.31-.02 2.61-.01 3.91-.02.08 1.53.63 3.09 1.75 4.17 1.12 1.11 2.7 1.62 4.24 1.79v4.03c-1.44-.05-2.89-.35-4.2-.97-.57-.26-1.1-.59-1.62-.93-.01 2.92.01 5.84-.02 8.75-.08 1.4-.54 2.79-1.35 3.94-1.31 1.92-3.58 3.17-5.91 3.21-1.43.08-2.86-.31-4.08-1.03-2.02-1.19-3.44-3.37-3.65-5.71-.02-.5-.03-1-.01-1.49.18-1.9 1.12-3.72 2.58-4.96 1.66-1.44 3.98-2.13 6.15-1.72.02 1.48-.04 2.96-.04 4.44-.99-.32-2.15-.23-3.02.37-.63.41-1.11 1.04-1.36 1.75-.21.51-.15 1.07-.14 1.61.24 1.64 1.82 3.02 3.5 2.87 1.12-.01 2.19-.66 2.77-1.61.19-.33.4-.67.41-1.06.1-1.79.06-3.57.07-5.36.01-4.03-.01-8.05.02-12.07z\"/></svg>"}, "facebook": {"title": "Facebook", "color": "#1877F2", "svg": "<svg viewBox=\"0 0 24 24\" aria-hidden=\"true\" focusable=\"false\"><path d=\"M9.101 23.691v-7.98H6.627v-3.667h2.474v-1.58c0-4.085 1.848-5.978 5.858-5.978.401 0 .955.042 1.468.103a8.68 8.68 0 0 1 1.141.195v3.325a8.623 8.623 0 0 0-.653-.036 26.805 26.805 0 0 0-.733-.009c-.707 0-1.259.096-1.675.309a1.686 1.686 0 0 0-.679.622c-.258.42-.374.995-.374 1.752v1.297h3.919l-.386 2.103-.287 1.564h-3.246v8.245C19.396 23.238 24 18.179 24 12.044c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.628 3.874 10.35 9.101 11.647Z\"/></svg>"}, "youtube": {"title": "YouTube", "color": "#FF0000", "svg": "<svg viewBox=\"0 0 24 24\" aria-hidden=\"true\" focusable=\"false\"><path d=\"M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z\"/></svg>"}, "x": {"title": "X (Twitter)", "color": "#FFFFFF", "svg": "<svg viewBox=\"0 0 24 24\" aria-hidden=\"true\" focusable=\"false\"><path d=\"M14.234 10.162 22.977 0h-2.072l-7.591 8.824L7.251 0H.258l9.168 13.343L.258 24H2.33l8.016-9.318L16.749 24h6.993zm-2.837 3.299-.929-1.329L3.076 1.56h3.182l5.965 8.532.929 1.329 7.754 11.09h-3.182z\"/></svg>"}, "vimeo": {"title": "Vimeo", "color": "#1AB7EA", "svg": "<svg viewBox=\"0 0 24 24\" aria-hidden=\"true\" focusable=\"false\"><path d=\"M23.9765 6.4168c-.105 2.338-1.739 5.5429-4.894 9.6088-3.2679 4.247-6.0258 6.3699-8.2898 6.3699-1.409 0-2.578-1.294-3.553-3.881l-1.9179-7.1138c-.719-2.584-1.488-3.878-2.312-3.878-.179 0-.806.378-1.8809 1.132l-1.129-1.457a315.06 315.06 0 003.501-3.1279c1.579-1.368 2.765-2.085 3.5539-2.159 1.867-.18 3.016 1.1 3.447 3.838.465 2.953.789 4.789.971 5.5069.5389 2.45 1.1309 3.674 1.7759 3.674.502 0 1.256-.796 2.265-2.385 1.004-1.589 1.54-2.797 1.612-3.628.144-1.371-.395-2.061-1.614-2.061-.574 0-1.167.121-1.777.391 1.186-3.8679 3.434-5.7568 6.7619-5.6368 2.4729.06 3.6279 1.664 3.4929 4.7969z\"/></svg>"}};
window.DY_ICONS=ICONS;
var ACCENTS={blue:['#2F5BFF','#2444D4','#0B1B3A','#2F5BFF']};
window.DY_ACCENTS=ACCENTS;
var BUILTIN=['index'];
var DEFAULT_NAV=[{key:'what',label:'What we do',href:'#what',show:'menu'},{key:'how',label:'How it works',href:'#how',show:'menu'},{key:'pricing',label:'Pricing',href:'#pricing',show:'menu'},{key:'results',label:'Results',href:'#results',show:'menu'},{key:'contact',label:'Contact',href:'#contact',show:'menu'}];
function esc(s){return String(s==null?'':s).replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;');}
function uid(p){return (p||'b')+Date.now().toString(36)+Math.random().toString(36).slice(2,6);}

/* ---------- block & section library (shared with the editor) ---------- */
var CARD=function(n){return {img:{src:['assets/support_upgrade_600.webp','assets/support_trust_600.webp','assets/support_speed_600.webp'][n%3],alt:''},title:['Card title','Card title','Card title'][n%3],text:'A short description. Click to change it.',btnLabel:'Find out more',btnUrl:'#contact'};};
var BLOCKS={
 heading:{label:'Heading',icon:'H',make:function(){return {type:'heading',text:'New <span class="r">heading</span>',size:'big'};}},
 text:{label:'Text paragraph',icon:'¶',make:function(){return {type:'text',text:'Write something here. Click this text to change it.',style:'normal'};}},
 image:{label:'Image',icon:'🖼',make:function(){return {type:'image',img:{src:'assets/support_upgrade_600.webp',alt:'Apex Agentics'},caption:''};}},
 imageLeft:{label:'Image + text (image left)',icon:'◧',make:function(){return {type:'imageText',side:'left',img:{src:'assets/support_upgrade_600.webp',alt:'Apex Agentics'},title:'A heading <span class="r">here</span>',text:'Some text to go with the picture. Click to change it.',btnLabel:'Find out more',btnUrl:'#contact'};}},
 imageRight:{label:'Image + text (image right)',icon:'◨',make:function(){var b=BLOCKS.imageLeft.make();b.side='right';return b;}},
 button:{label:'Button',icon:'⬭',make:function(){return {type:'button',label:'Book a free consultation',url:'#contact',style:'red'};}},
 spacer:{label:'Spacer',icon:'↕',make:function(){return {type:'divider',kind:'space'};}},
 divider:{label:'Divider line',icon:'—',make:function(){return {type:'divider',kind:'line'};}},
 cta:{label:'Contact / booking',icon:'☎',make:function(){return {type:'cta',title:'Let’s talk about your <span class="r">website</span>.',text:'Tell us what is not working.',btnLabel:'Book a free consultation',btnUrl:'#contact'};}},
 socials:{label:'Social links',icon:'＠',make:function(){return {type:'socials'};}},
 cards2:{label:'2 cards',icon:'▥',make:function(){return {type:'cards',cols:2,items:[CARD(0),CARD(1)]};}},
 cards3:{label:'3 cards',icon:'▥▥',make:function(){return {type:'cards',cols:3,items:[CARD(0),CARD(1),CARD(2)]};}},
 faq:{label:'Questions & answers',icon:'?',make:function(){return {type:'faq',items:[{q:'How long is the show?',a:'Usually about an hour. Click to change this answer.'},{q:'Where does Dave perform?',a:'Ireland, the UK and Spain.'},{q:'How do I book?',a:'Call 087 261 6317 or use the booking page.'}]};}},
 hero:{label:'Hero banner',icon:'▀',hidden:true,make:function(){return {type:'hero',img:{src:'assets/hero_960.webp',alt:''},title:'Page <span class="r">title</span>',text:'A short line under the title.'};}}
};
var SECTIONS={
 hero:{label:'Hero banner',bare:true,blocks:['hero']},
 textImage:{label:'Text + image',blocks:['imageLeft']},
 cards:{label:'Cards',blocks:[['heading','What we <span class="r">do</span>'],'cards3']},
 cta:{label:'Call-to-action band',bg:'red',blocks:['cta']},
 faq:{label:'FAQ',blocks:[['heading','Questions'],'faq']},
 blank:{label:'Heading + text',blocks:['heading','text']},
 empty:{label:'Blank section',blocks:[]}
};
var PAGE_TEMPLATES={blank:{label:'Blank (heading + text)',secs:['blank']},standard:{label:'Standard: banner, text + image, enquiry band',secs:['hero','textImage','cta']}};
function makeBlock(k){var d=k,txt=null;if(Array.isArray(k)){d=k[0];txt=k[1];}var b=BLOCKS[d].make();if(txt)b.text=txt;b.id=uid('b');return b;}
function makeSection(k){var t=SECTIONS[k];var s={blocks:t.blocks.map(makeBlock)};if(t.bare)s.bare=true;if(t.bg)s.bg=t.bg;return s;}
window.DY_LIB={BLOCKS:BLOCKS,SECTIONS:SECTIONS,PAGE_TEMPLATES:PAGE_TEMPLATES,makeBlock:makeBlock,makeSection:makeSection,uid:uid,BUILTIN:BUILTIN,DEFAULT_NAV:DEFAULT_NAV};
if(window.DY_SHELL)return;

var file=(location.pathname.split('/').pop()||'index.html').replace(/\.html$/,'')||'index',QS=new URLSearchParams(location.search);
var EDIT=QS.has('edit'),PREV=QS.get('preview')==='1',PAGE=file;
if(file==='page'&&QS.get('p'))PAGE=QS.get('p');if((EDIT||PREV)&&QS.get('as'))PAGE=QS.get('as');
var SHELL=null;try{if(window.parent!==window&&window.parent.DYE)SHELL=window.parent.DYE;}catch(e){}
if(EDIT&&!SHELL){location.replace('admin/?page='+encodeURIComponent(PAGE));return;}
var DIMS={};function AD(h){return String(h).replace(/<img\b([^>]*?)\ssrc="([^"]+)"([^>]*)>/g,function(m,a,s,b){if(/\swidth=/.test(a+b))return m;var d=DIMS[s];return d?'<img'+a+' src="'+s+'"'+b+' width="'+d[0]+'" height="'+d[1]+'">':m;});}
var EDITING=!!SHELL,RES=function(s){return s;};
function ORD(n){return (n%100>=11&&n%100<=13)?'th':({1:'st',2:'nd',3:'rd'}[n%10]||'th');}
var DOW=['Sun','Mon','Tue','Wed','Thu','Fri','Sat'],MON=['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];
function telOf(p){var d=String(p||'').replace(/[^\d+]/g,'');return d;}
function safeUrl(u){u=String(u||'');return /^\s*(javascript|data):/i.test(u)?'#':u;}
function socialHTML(list){return (list||[]).filter(function(x){return x&&x.url;}).map(function(x){var i=ICONS[x.network]||{title:x.network||'Link',color:'#FFFFFF',svg:'<svg viewBox="0 0 24 24" aria-hidden="true" focusable="false"><circle cx="12" cy="12" r="9" fill="none" stroke="currentColor" stroke-width="2"/></svg>'};
  return '<a href="'+esc(safeUrl(x.url))+'" target="_blank" rel="noopener" aria-label="Apex Agentics on '+esc(i.title)+'" title="'+esc(i.title)+'" style="--bc:'+i.color+'">'+i.svg+'</a>';}).join('');}

/* ---- sanitise stored HTML: only simple inline formatting survives ---- */
var OK_TAGS={SPAN:1,B:1,I:1,EM:1,STRONG:1,SMALL:1,BR:1,A:1,CITE:1,SUP:1};
function clean(html){var t=document.createElement('template');t.innerHTML=String(html||'');
  (function walk(n){Array.prototype.slice.call(n.childNodes).forEach(function(k){if(k.nodeType===1){
    if(!OK_TAGS[k.tagName]){if(/^(SCRIPT|STYLE|IFRAME|OBJECT|EMBED|svg)$/i.test(k.tagName)){k.remove();return;}walk(k);while(k.firstChild)k.parentNode.insertBefore(k.firstChild,k);k.remove();return;}
    Array.prototype.slice.call(k.attributes).forEach(function(a){var nm=a.name.toLowerCase();if(!/^(class|href|target|rel|style|title)$/.test(nm)||(nm==='href'&&/^\s*(javascript|data):/i.test(a.value))||(nm==='style'&&/url\(|expression/i.test(a.value)))k.removeAttribute(a.name);});
    walk(k);}else if(k.nodeType!==3)k.remove();});})(t.content);return t.innerHTML;}
window.DY_clean=clean;


/* ---------- shared collections (single source: content.json) ---------- */
function ATTR(el,n,d){var v=el.getAttribute('data-'+n);return v==null||v===''?d:v;}
/* Unfinished items are hidden or shown as plain "to be confirmed" wording. Raw [BRACKET] text never reaches the page. */
function ph(s){return esc(String(s==null?'':s).replace(/\[[^\]]*\]/g,'').replace(/\s+/g,' ').trim());}
function clean1(v){v=String(v==null?'':v).trim();return /\[[^\]]*\]/.test(v)?'':v;}
function showHTML(){return '';}
function logoSrc(c,tone){var k=String((c.brand||{}).logo||'final').toLowerCase();if(!/^[a-z0-9-]+$/.test(k))k='final';return 'assets/logos/logo-'+k+'-'+(tone||'light')+'.svg';}
function logoHTML(c,tone){var nm=(c.brand||{}).name||'Apex Agentics';return '<img src="'+esc(RES(logoSrc(c,tone)))+'" alt="'+esc(nm)+'" width="170" height="25">';}
function imgsHTML(t){var L=(t.images||[]).filter(function(i){return i&&i.src;});if(!L.length)return '';return '<figure class="shots">'+L.map(function(i){return '<img src="'+esc(RES(i.src))+'" alt="'+esc(i.alt||'')+'" loading="lazy">';}).join('')+(t.imageCaption?'<figcaption>'+esc(t.imageCaption)+'</figcaption>':'')+'</figure>';}
function tcardHTML(t){var perm=t.permission==='approved'?'approved':'pending',q=clean1(t.quote),res=clean1(t.result),lk=clean1(t.link),h='';
  h+=imgsHTML(t);
  if(q)h+='<blockquote><p>'+esc(q)+'</p></blockquote>';
  if(q||!(t.images||[]).length)h+='<p class="who"><b>'+esc(t.name||'')+'</b>'+(t.role?', '+esc(t.role):'')+'.</p>';
  if(res)h+='<p class="res">'+esc(res)+'</p>';
  if(lk)h+='<p class="lnk"><a class="ul" href="'+esc(safeUrl(lk))+'" target="_blank" rel="noopener">Before and after</a></p>';
  return '<article class="case" data-permission="'+perm+'" data-tid="'+esc(t.id||'')+'">'+h+'</article>';}
function priceHTML(c,key,view){var P=c.prices||{},p=P[key]||{};
  if(view==='small')return clean1(p.small)?esc(clean1(p.small)):'';
  var a=clean1(p.amount);return a?esc(a):'<span class="tbc">'+(key==='support'?'Price to be confirmed per month':'Price to be confirmed')+'</span>';}
function telHTML(ct,cls){var d=telOf(ct.phone);return d?'<a class="tel'+(cls?' '+cls:'')+'" href="tel:'+esc(d)+'">'+esc(ct.phone)+'</a>':'';}
function mailHTML(ct){var e=clean1(ct.email);return e?'<a class="ul" href="mailto:'+esc(e)+'">'+esc(e)+'</a>':'';}
function contactHTML(ct,view){var m=mailHTML(ct),t=telHTML(ct),l=clean1(ct.location),r=clean1(ct.replyTime);
  if(view==='phone')return telHTML(ct,'call');
  if(view==='reply')return r?' '+esc(r):'';
  if(view==='loc')return esc(l);
  if(view==='foot')return '<b>Apex Agentics</b>'+(m?'<span>'+m+'</span>':'')+(t?'<span>'+t+'</span>':'')+(l?'<span>'+esc(l)+'</span>':'');
  return (m||t)?'<p class="direct">'+m+(m&&t?' ':'')+t+'</p>':'';}
function shared(c,root){root=root||document;var P=c.prices||{};
  root.querySelectorAll('[data-cms]').forEach(function(el){var k=el.getAttribute('data-cms'),v=ATTR(el,'view',''),h=null;
    if(k==='testimonials')h=(c.testimonials||[]).map(tcardHTML).join('');
    else if(k==='price')h=priceHTML(c,ATTR(el,'key','refresh'),v);
    else if(k==='terms'){var a=clean1(P.vat),b=clean1(P.cancellation);h=(a?'<span>'+esc(a)+'</span> ':'')+(b?'<span>'+esc(b)+'</span>':'');}
    else if(k==='catch'){var ct=clean1(c.catch);h=ct?'<h3>The catch</h3><p>'+esc(ct)+'</p>':'';}
    else if(k==='privacy')h=clean1((c.contact||{}).privacy)?esc(clean1(c.contact.privacy)):'';
    else if(k==='logo')h=logoHTML(c,ATTR(el,'tone','light'));
    else if(k==='contact')h=contactHTML(c.contact||{},v);
    if(h!==null)el.innerHTML=AD(h);});}
function siteBase(c){var u=c.siteUrl||(location.origin+location.pathname.replace(/[^\/]*$/,''));return u.replace(/\/?$/,'/');}
function ldJSON(c){var base=siteBase(c),ct=c.contact||{};
  var org={'@type':'Organization',name:'Apex Agentics',url:base,logo:base+'assets/icon.png'};if(ct.email)org.email=ct.email;if(ct.phone)org.telephone=ct.phone;
  return JSON.stringify({'@context':'https://schema.org','@graph':[org,{'@type':'WebSite',name:'Apex Agentics',url:base}]});}
function ldApply(c){if(EDITING||PREV)return;var s=document.getElementById('dy-ld');if(!s){s=document.createElement('script');s.type='application/ld+json';s.id='dy-ld';document.head.appendChild(s);}s.textContent=ldJSON(c);}

/* ---------- blocks ---------- */
function F(tag,cls,path,val,ph){val=val||'';if(!val&&!EDITING)return '';return '<'+tag+(cls?' class="'+cls+'"':'')+' data-bf="'+path+'"'+(ph?' data-ph="'+esc(ph)+'"':'')+'>'+clean(val)+'</'+tag+'>';}
function IM(path,img,cls){img=img||{};return '<img'+(cls?' class="'+cls+'"':'')+' data-bi="'+path+'" src="'+esc(RES(img.src||'assets/hero_960.webp'))+'" alt="'+esc(img.alt||'')+'" loading="lazy">';}
var BSTY=['red','gold','ghost','call'];
function BT(lp,up,label,url,style,sp,sm){if(!label&&!EDITING)return '';var ext=/^https?:/.test(url||'');style=BSTY.indexOf(style)>-1?style:'red';return '<a class="btn '+style+(sm?' sm':'')+'" href="'+esc(safeUrl(url||'#'))+'" data-bl="'+up+'" data-bf="'+lp+'"'+(sp?' data-bs="'+sp+'"':'')+' data-ph="Button text"'+(ext?' target="_blank" rel="noopener"':'')+'>'+clean(label||'')+'</a>';}
function ytId(u){u=String(u||'').trim();if(/^[\w-]{11}$/.test(u))return u;if(!/youtu\.?be|youtube(-nocookie)?\.com/i.test(u))return '';var m=u.match(/(?:youtu\.be\/|[?&]v=|\/embed\/|\/shorts\/|\/live\/|\/v\/|\/e\/)([\w-]{11})(?![\w-])/);return m?m[1]:'';}
function blockHTML(b,group){var t=b.type,h='',cls='blk blk-'+t,tag='div';
  switch(t){
  case 'heading':h=b.size==='small'?F('h3','sub','text',b.text,'Heading'):F('h2','sec','text',b.text,'Heading');break;
  case 'text':h=F('p',b.style==='big'?'big':'','text',b.text,'Type your text');break;
  case 'image':h='<figure>'+IM('img',b.img)+F('figcaption','','caption',b.caption,'')+'</figure>';break;
  case 'imageText':cls+=' '+(b.side==='right'?'right':'left');h=IM('img',b.img)+'<div>'+F('h2','sec','title',b.title,'Heading')+F('p','big','text',b.text,'')+((b.btnLabel||EDITING)?'<div class="btnrow">'+BT('btnLabel','btnUrl',b.btnLabel,b.btnUrl,b.btnStyle||'red','btnStyle')+'</div>':'')+'</div>';break;
  case 'button':cls+=' btnrow';h=BT('label','url',b.label,b.url,b.style,'style');break;
  case 'divider':h=b.kind==='line'?'<hr>':'';cls+=b.kind==='line'?' line':' space';break;
  case 'cta':h='<div>'+F('h3','','title',T(b.title),'Heading')+F('p','','text',T(b.text),'')+'</div><div class="btnrow">'+BT('btnLabel','btnUrl',b.btnLabel,b.btnUrl,b.btnStyle||'gold','btnStyle')+'</div>';break;
  case 'socials':h='<div class="socials" data-cms="socials"></div>';break;
  case 'cards':cls+=' c'+(b.cols===2?2:3);h=(b.items||[]).map(function(it,i){var p='items.'+i+'.';return '<div class="card">'+(it.img&&it.img.src?IM(p+'img',it.img):'')+F('h3','',p+'title',it.title,'Title')+F('p','',p+'text',it.text,'')+((it.btnLabel||EDITING)?'<div class="btnrow">'+BT(p+'btnLabel',p+'btnUrl',it.btnLabel,it.btnUrl,it.btnStyle||'red',p+'btnStyle',1)+'</div>':'')+'</div>';}).join('');break;
  case 'faq':h=(b.items||[]).map(function(q,i){return '<details'+(EDITING?' open':'')+'>'+F('summary','','items.'+i+'.q',q.q,'Question')+F('p','','items.'+i+'.a',q.a,'Answer')+'</details>';}).join('');break;
  case 'hero':cls='bhero photo blk blk-hero';h=IM('img',b.img)+'<div class="txt"><div class="wrap">'+F('h1','','title',b.title,'Title')+F('p','','text',b.text,'Short line')+'</div></div>';break;
  default:return '';}
  return '<'+tag+' class="'+cls+'" data-bid="'+esc(b.id)+'" data-bgroup="'+esc(group)+'">'+h+'</'+tag+'>';}
function secEl(id,s){var t=document.createElement('template'),inner=(s.blocks||[]).map(function(b){return blockHTML(b,'sec:'+id);}).join('');
  t.innerHTML=AD(s.bare?'<div class="blk-bare" data-nsec="'+esc(id)+'">'+inner+'</div>':'<section class="blk-sec'+(s.bg&&s.bg!=='plain'?' bg-'+s.bg:'')+'" data-nsec="'+esc(id)+'"><div class="wrap">'+inner+(EDITING&&!inner?'<p class="dy-empty">Empty section</p>':'')+'</div></section>');return t.content.firstChild;}

/* ---------- stable ids from data-dy ---------- */
function index(){
  var R={page:PAGE,by:{site:{},page:{}},ids:new Map(),orig:{site:{},page:{}},items:{},itemKey:new Map(),listOf:new Map(),sections:[],secId:new Map(),blocks:new Set()};
  function reg(el,sc,k,id){var o=R.ids.get(el)||{scope:sc};o[k]=id;R.ids.set(el,o);R.by[sc][id]=el;}
  R.reg=reg;
  Array.prototype.slice.call(document.querySelectorAll('[data-dy]')).forEach(function(el){
    var sc=el.closest('header.top,footer,.sticky')?'site':'page';
    el.getAttribute('data-dy').split(' ').forEach(function(id){var k=id.charAt(0);if(!id)return;
      if(k==='s'){if(el.parentElement===document.body||el.parentElement.matches('body>main')){R.sections.push(el);R.secId.set(el,id);R.by.page[id]=el;}return;}
      reg(el,sc,k,id);
      if(k==='t'){R.blocks.add(el);R.orig[sc][id]=el.innerHTML;}
      if(k==='L'){var ch=Array.prototype.slice.call(el.children);R.items[id]=ch;R.items[id].sep=(ch[0]&&ch[0].nextSibling&&ch[0].nextSibling.nodeType===3)?ch[0].nextSibling.nodeValue:'';ch.forEach(function(it,j){R.itemKey.set(it,String(j));R.listOf.set(it,id);});}});});
  return R;
}
function scopeEdits(c,sc){if(sc==='site')return c.site||{};return (c.pages||{})[PAGE]||{};}
function heroBg(){var hi=document.querySelector('.hero>img');if(!hi)return;var src=hi.getAttribute('src')||'',st=document.getElementById('dy-hero');
  if(/assets\/banner_hero\.jpg$/.test(src)){if(st)st.remove();return;}if(!st){st=document.createElement('style');st.id='dy-hero';document.head.appendChild(st);}st.textContent='.hero:before{background-image:url("'+src.replace(/["\\]/g,'')+'")}';}
function pageHref(c,key){var cu=(c.custom||{})[key];if(!cu||!(EDIT||PREV))return key+'.html';return cu.base?cu.base+'.html?as='+encodeURIComponent(key):'page.html?p='+encodeURIComponent(key);}
function navLink(c,it,cur){var ext=!!it.href,h=ext?it.href:pageHref(c,it.key);return '<a href="'+esc(safeUrl(h))+'"'+(it.key===cur&&!ext&&it.key!=='index'?' class="cur"':'')+(/^https?:/.test(h)?' target="_blank" rel="noopener"':'')+'>'+esc(it.label)+'</a>';}
function buildNav(c){var items=c.nav;if(!items)return;var cur=PAGE;
  var main=document.querySelector('nav.main');if(main){var btn=main.querySelector('a.btn');main.innerHTML=items.filter(function(x){return x.show==='menu'&&x.key!=='index';}).map(function(x){return navLink(c,x,cur);}).join('');if(btn)main.appendChild(btn);}
  var m=document.getElementById('mnav');if(m)m.innerHTML=items.filter(function(x){return x.show==='menu';}).map(function(x){return navLink(c,x,cur);}).join('');
  var f=document.querySelector('footer .flinks');if(f)f.innerHTML=items.filter(function(x){return x.show!=='none';}).map(function(x){return navLink(c,x,'');}).join('');}
function seo(c){var s=(c.seo||{})[PAGE],cu=(c.custom||{})[PAGE];var title=(s&&s.title)||(cu&&cu.title?cu.title+' | Apex Agentics':'');if(title)document.title=title;
  if(s&&s.description!=null&&s.description!==''){var m=document.querySelector('meta[name=description]');if(!m){m=document.createElement('meta');m.name='description';document.head.appendChild(m);}m.content=s.description;}}
function T(s,c){c=c||window.DY_C||{};s=String(s==null?'':s);var n=0;while(n++<4&&/\{[\w.]+\}/.test(s))s=s.replace(/\{([\w.]+)\}/g,function(m,p){var v=p.split('.').reduce(function(a,k){return a==null?a:a[k];},c);return(v==null||typeof v==='object')?m:v;});return s;}
function apply(c,R,res){window.DY_C=c;
  DIMS=c.dims||{};
  RES=res||function(s){return s;};
  var P=scopeEdits(c,'page'),lists=P.lists||{};
  Object.keys(lists).forEach(function(L){var par=R.by.page[L],items=R.items[L];if(!par||!items)return;
    var out=[];lists[L].forEach(function(key){var base=items[+String(key).split('~')[0]];if(!base)return;var el=base;
      if(String(key).indexOf('~')>-1){el=base.cloneNode(true);var a=[base].concat(Array.prototype.slice.call(base.querySelectorAll('*'))),b=[el].concat(Array.prototype.slice.call(el.querySelectorAll('*')));
        a.forEach(function(x,j){var o=R.ids.get(x);if(!o)return;var y=b[j],suf='@'+L+':'+key;['t','i','a','e'].forEach(function(k){if(o[k]){R.reg(y,o.scope,k,o[k]+suf);if(k==='t'){R.blocks.add(y);R.orig[o.scope][o[k]+suf]=R.orig[o.scope][o[k]];}}});});}
      R.itemKey.set(el,String(key));R.listOf.set(el,L);out.push(el);});
    while(par.firstChild)par.removeChild(par.firstChild);
    out.forEach(function(el,j){if(j&&items.sep)par.appendChild(document.createTextNode(items.sep));par.appendChild(el);});});
  ['site','page'].forEach(function(sc){var E=scopeEdits(c,sc);
    Object.keys(E.text||{}).forEach(function(id){var el=R.by[sc][id];if(el)el.innerHTML=clean(E.text[id]);});
    Object.keys(E.img||{}).forEach(function(id){var el=R.by[sc][id],v=E.img[id];if(!el||!v)return;if(v.src){el.setAttribute('src',RES(v.src));el.removeAttribute('srcset');}if(v.alt!=null)el.setAttribute('alt',v.alt);});
    Object.keys(E.link||{}).forEach(function(id){var el=R.by[sc][id],h=E.link[id];if(el&&h!=null){el.setAttribute('href',safeUrl(h));if(/^https?:/.test(h)){el.setAttribute('target','_blank');el.setAttribute('rel','noopener');}else el.removeAttribute('target');}});
    Object.keys(E.style||{}).forEach(function(id){var el=R.by[sc][id],v=E.style[id];if(!el||BSTY.indexOf(v)<0)return;if(!el.dataset.dyOs)el.dataset.dyOs=BSTY.filter(function(k){return el.classList.contains(k);})[0]||'red';BSTY.forEach(function(k){el.classList.remove(k);});el.classList.add(v);});});
  /* blocks added inside existing sections */
  Object.keys(P.ins||{}).forEach(function(an){var el=R.by.page[an];var L=P.ins[an]||[];if(!el||!el.parentNode||!L.length)return;
    var html=AD(L.map(function(b){return blockHTML(b,'ins:'+an);}).join('')),t=document.createElement('template');
    var par=el.parentElement;t.innerHTML=(par===document.body||par.matches('body>main')||R.secId.has(par))?'<div class="wrap blk-ins">'+html+'</div>':html;el.after(t.content);});
  /* new sections */
  var foot=document.querySelector('body>footer');R.newSecs={};
  Object.keys(P.secs||{}).forEach(function(id){var el=secEl(id,P.secs[id]);R.newSecs[id]=el;R.secId.set(el,id);R.by.page[id]=el;R.sections.push(el);});
  var ord=(P.order||[]).slice();Object.keys(R.newSecs).forEach(function(id){if(ord.indexOf(id)<0)ord.push(id);});
  if(P.order||Object.keys(R.newSecs).length){var all=R.sections.map(function(s){return R.secId.get(s);});ord=ord.filter(function(x){return all.indexOf(x)>-1;});
    all.forEach(function(x){if(ord.indexOf(x)<0)ord.splice(all.indexOf(x),0,x);});var rt=document.querySelector('body>main');ord.forEach(function(id){if(rt)rt.appendChild(R.by.page[id]);else document.body.insertBefore(R.by.page[id],foot);});}
  (P.hidden||[]).forEach(function(id){var el=R.by.page[id];if(el){if(EDITING)el.classList.add('dy-hidden');else el.style.display='none';}});
  window.DY_C=c;shared(c);ldApply(c);
  buildNav(c);seo(c);heroBg();
    if(file==='page'&&!(c.custom||{})[PAGE]&&!EDITING){var nf=document.createElement('section');nf.innerHTML='<div class="wrap"><h1 class="sec">Page not found</h1><p class="lead"><a class="ul" href="index.html">Back to the home page</a></p></div>';var mm=document.querySelector('body>main');if(mm)mm.appendChild(nf);else document.body.insertBefore(nf,foot);}
}
window.DY={shared:shared,heroBg:heroBg,showHTML:showHTML,ph:ph,socialHTML:socialHTML,telOf:telOf,esc:esc,blockHTML:blockHTML,ytId:ytId,PAGE:PAGE};

if(SHELL){var R=index();var st=SHELL.state();apply(st.content,R,SHELL.resolve);window.DY.R=R;
  var l=document.createElement('link');l.rel='stylesheet';l.href='admin/inline.css';document.head.appendChild(l);
  var s=document.createElement('script');s.src='admin/inline.js';document.body.appendChild(s);return;}
if(PREV){var d=null;try{d=JSON.parse(localStorage.getItem('dy-preview')||'null');}catch(e){}
  if(d&&d.content){var up=d.uploads||{};apply(d.content,index(),function(p){return up[p]||p;});
    var b=document.createElement('div');b.style.cssText='position:fixed;left:0;right:0;bottom:0;z-index:9999;background:#f6c343;color:#111;font:700 14px Inter,sans-serif;text-align:center;padding:10px';b.innerHTML='PREVIEW of unpublished changes. Not live yet. <a href="admin/?page='+encodeURIComponent(PAGE)+'" style="text-decoration:underline">Back to the editor</a>';document.body.appendChild(b);
    document.querySelectorAll('a[href]').forEach(function(a){var h=a.getAttribute('href');if(/^https?:|^tel:|^mailto:|^#/.test(h)||!/\.html/.test(h))return;a.setAttribute('href',h+(h.indexOf('?')>-1?'&':'?')+'preview=1');});return;}}
fetch('content.json',{cache:'no-store'}).then(function(r){if(!r.ok)throw 0;return r.json();}).then(function(c){apply(c,index());}).catch(function(){/* keep the page as built */});
})();
