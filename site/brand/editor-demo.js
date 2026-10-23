// Builds the demo site the editor-gallery screenshots use (site/brand/editor-demo/index.html + content.json).
// It is the editor's own demo page (repo-root index.html, same markup and data-dy markers) with every visible
// line refilled from site-config.json, so the shots match the current /web wording and prices.
// Only render-editor.js uses it (it serves these two files in place of /index.html and /content.json);
// the editor and the repo-root demo files are not changed.
// Usage: node site/brand/editor-demo.js
const fs=require('fs'),path=require('path');const ROOT=path.join(__dirname,'..','..');
const C=require('../../site-config.json'),P=C.prices,G=C.pricing,K=G.check,FF=G.buildHandOver,CO=G.buildCare;
const strip=s=>String(s).replace(/<[^>]+>/g,''),esc=s=>String(s).replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;');
const fill=s=>String(s).replace(/\{(\w+)\}/g,(m,k)=>k==='email'?C.trader.email.value:P[k].value);
const pr=k=>[P[k].prefix,P[k].value,P[k].unit].filter(Boolean).join(' ');
const inc=C.included,by=t=>inc.find(x=>x.t===t);
let h=fs.readFileSync(path.join(ROOT,'index.html'),'utf8');
function el(m){const re=new RegExp('<([a-z0-9]+) data-dy="'+m+'"[^>]*>');const o=h.match(re);if(!o)throw new Error('no element '+m);
 const s=o.index,tag=o[1],c=h.indexOf('</'+tag+'>',s+o[0].length);if(c<0)throw new Error('no close '+m);return {s,open:o[0],tag,inner:[s+o[0].length,c],end:c+tag.length+3};}
const set=(m,t)=>{const e=el(m);h=h.slice(0,e.inner[0])+t+h.slice(e.inner[1]);};
const del=m=>{const e=el(m);h=h.slice(0,e.s)+h.slice(e.end);};
const attr=(m,a,v)=>{const e=el(m);const o=e.open.replace(new RegExp(' '+a+'="[^"]*"'),' '+a+'="'+v+'"');h=h.slice(0,e.s)+o+h.slice(e.s+e.open.length);};
// head
const title=C.webPage.title;
h=h.replace(/<title>[^<]*<\/title>/,'<title>'+esc(title)+'</title>').replace(/(<meta (?:name="description"|property="og:description") content=")[^"]*/g,'$1'+esc(strip(C.hero.lead))).replace(/(<meta property="og:title" content=")[^"]*/,'$1'+esc(title));
// header nav (labels also come from content.json nav) and the header button
const nav=[['what','Included'],['how','How it works'],['pricing','Prices'],['results','About'],['contact','Contact']];
['e6 a2 t1','e7 a3 t2','e8 a4 t3','e9 a5 t4','e10 a6 t5'].forEach((m,i)=>set(m,nav[i][1]));
['e17 a8 t7','e18 a9 t8','e19 a10 t9','e20 a11 t10','e21 a12 t11'].forEach((m,i)=>set(m,nav[i][1]));
set('e11 a7 t6',esc(C.hero.button));attr('e11 a7 t6','href','#pricing');
// hero
set('e7 t0',esc(C.hero.heading));set('e8 t1',esc(strip(C.hero.punch))+' '+esc(C.hero.lead));set('e10 a0 t2',esc(C.hero.button));attr('e10 a0 t2','href','#pricing');del('e11 t3');
// #what: two of the "What your visitors get" points (no prices here)
set('e14 t4','Included');set('e15 t5','What your visitors get');
const a=by('Made for phones first'),b=by('Easy to keep up to date');
set('e19 t6',esc(a.t));set('e20 t7',esc(a.d));del('e21 L1');del('e25 t11');
set('e29 t12',esc(b.t));set('e30 t13',esc(b.d));del('e31 L2');del('e35 t17');
// #how: the /web steps (Talk, Build, Launch)
set('e39 t18','Process');set('e40 t19','How it works');
set('e43 t20','<b data-dy="e44">Talk.</b> Tell us about your business.');set('e45 t21','<b data-dy="e46">Build.</b> We design and build your site.');set('e47 t22','<b data-dy="e48">Launch.</b> Check it, then it goes live.');
// #pricing: the three /web price cards
set('e51 t23','Prices');set('e52 t24',esc(strip(G.heading)));del('e53 t25');
set('e56 t26',esc(K.title));set('e57 t27',esc(P.check.tag));attr('e58','data-key','check');del('e59');set('e60 t28','Best for: '+esc(K.bestFor));set('e62 a1 t29',esc(G.enquiry.label));
set('e64 t30',esc(FF.title));set('e65 t31',esc(FF.badge));attr('e66','data-key','refresh');set('e67 t32',esc(FF.options[0].includes));
set('e69 t33',esc(P.newSite.label)+' '+esc(pr('newSite')));set('e70 t34',esc(P.refresh.label)+' '+esc(pr('refresh')));set('e71 t35',esc(FF.options[1].includes));del('e72 t36');del('e73 t37');
set('e74 t38','Best for: '+esc(FF.bestFor));set('e76 a2 t39',esc(G.enquiry.label));
set('e78 t40',esc(CO.title));del('e79 t41');attr('e80','data-key','monthly');attr('e81','data-key','monthly');set('e83 a3 t42',esc(G.enquiry.label));
const careLine=CO.includes.map(fill).join(' '),careHead=CO.headline.replace(/\{(\w+)\}/g,(m,k)=>P[k].value);
// prices are filled in by content.js from content.json; the same text is written here so the page is right before it runs
h=h.replace(/(<p data-dy="e58"[^>]*>)<span class="tbc">[^<]*<\/span>/,'$1'+esc(P.check.value)).replace(/(<p data-dy="e66"[^>]*>)<span class="tbc">[^<]*<\/span>/,'$1'+esc(pr('refresh'))).replace(/(<p data-dy="e80"[^>]*>)<span class="tbc">[^<]*<\/span>/,'$1'+esc(careHead)).replace(/(<p data-dy="e81"[^>]*>)<\/p>/,'$1'+esc(careLine)+'</p>');
set('e86 t43','Tell us what you need using the contact section below.');
// #results -> About (no names, no case study)
set('e89 t44','About');set('e91 t45',esc(C.about.statement));set('e92 t46',esc(C.about.bio));del('e94 t47');
// #contact
set('e98 t49',esc(C.contact.heading));set('e99 t50',esc(C.contact.intro));del('e101 t51');del('e102');
// sticky button
set('e26 a13 t12',esc(C.closing.button));
// content.json for the demo: prices, terms, contact and nav from config; no testimonials
const c=JSON.parse(fs.readFileSync(path.join(ROOT,'content.json'),'utf8'));
c._help='Demo content for the editor-gallery screenshots only (built by site/brand/editor-demo.js from site-config.json).';
c.prices={check:{name:K.title,unit:P.check.tag,amount:P.check.value,small:''},refresh:{name:FF.title,unit:'one-off',amount:pr('refresh'),small:''},
 monthly:{name:CO.title,unit:P.monthly.unit,amount:careHead,small:careLine},vat:G.vatLine,cancellation:''};
c.testimonials=[];if(c.dims)Object.keys(c.dims).filter(k=>/dave/i.test(k)).forEach(k=>delete c.dims[k]);c.catch='';c.contact=Object.assign({},c.contact,{email:C.trader.email.value});
c.nav=c.nav.map((n,i)=>Object.assign({},n,{label:nav[i][1]}));c.seo={index:{title,description:strip(C.hero.lead)}};
h=h.replace('<div data-dy="e93" class="cases" data-cms="testimonials">','<div data-dy="e93" class="cases" data-cms="testimonials" hidden>');
h=h.replace(/<div data-dy="e93" class="cases" data-cms="testimonials" hidden>[\s\S]*?<\/article><\/div>/,'<div data-dy="e93" class="cases" data-cms="testimonials" hidden></div>');
const out=path.join(__dirname,'editor-demo');fs.mkdirSync(out,{recursive:true});
const bad=/free consultation|Ongoing Support|Shared at|Deluxe|Dave|Young1|£(39|49|99)\b|minutes|form isn|consultation/i;
const visible=strip(h.replace(/<script[\s\S]*?<\/script>/g,'')),cj=JSON.stringify({prices:c.prices,nav:c.nav,seo:c.seo,testimonials:c.testimonials});
if(bad.test(visible)||bad.test(cj))throw new Error('demo still has old wording: '+((visible.match(bad)||cj.match(bad))[0]));
fs.writeFileSync(path.join(out,'index.html'),h);fs.writeFileSync(path.join(out,'content.json'),JSON.stringify(c,null,2)+'\n');console.log('wrote',out);
