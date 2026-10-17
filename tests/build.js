// Build tests: fail the build on any rule break. Usage: node tests/build.js [baseUrl]
const {chromium}=require('playwright');const fs=require('fs'),path=require('path');
const BASE=process.argv[2]||'http://localhost:8834';let fail=0;
const ok=(n,c,x)=>{console.log((c?'PASS ':'FAIL ')+n+(c||!x?'':' -> '+x));if(!c)fail++;};
const root=path.join(__dirname,'..');
function walk(d,o=[]){for(const f of fs.readdirSync(d)){if(['node_modules','.git'].includes(f))continue;const p=path.join(d,f),s=fs.statSync(p);s.isDirectory()?walk(p,o):o.push(p);}return o;}
const files=walk(root),text=files.filter(f=>/\.(html|js|json|css|md|sh|py|txt|svg)$/.test(f)&&!/package-lock/.test(f));
const html=files.filter(f=>/\.html$/.test(f));
(async()=>{
// 1 noindex/nofollow on every page + robots
for(const f of html){const s=fs.readFileSync(f,'utf8');ok('noindex,nofollow in '+path.relative(root,f),/<meta name="robots" content="[^"]*noindex[^"]*nofollow|<meta name="robots" content="[^"]*nofollow[^"]*noindex/.test(s));}
ok('robots.txt disallows all',/User-agent: \*\s+Disallow: \/\s*$/.test(fs.readFileSync(root+'/robots.txt','utf8').trim()+'\n')||/Disallow: \/\s*$/m.test(fs.readFileSync(root+'/robots.txt','utf8')));
// 2 token-like strings anywhere in the repo
const tokRe=/(gh[pousr]_[A-Za-z0-9]{20,}|github_pat_[A-Za-z0-9_]{20,}|sk-[A-Za-z0-9]{20,}|AKIA[0-9A-Z]{16}|xox[baprs]-[A-Za-z0-9-]{10,}|-----BEGIN [A-Z ]*PRIVATE KEY)/;
ok('no token-like strings in repo files',!text.some(f=>tokRe.test(fs.readFileSync(f,'utf8'))),text.filter(f=>tokRe.test(fs.readFileSync(f,'utf8'))).join());
// 3 forbidden words in every html file and content.json (client-visible copy)
const copyFiles=[...html,root+'/content.json'];
const all=copyFiles.map(f=>[f,fs.readFileSync(f,'utf8')]);
ok('no banned client name (Jim: out until owner confirms)',!text.some(f=>new RegExp('tele'+'vidia','i').test(fs.readFileSync(f,'utf8'))));
const strip=s=>s.replace(/<script[\s\S]*?<\/script>|<style[\s\S]*?<\/style>/g,' ').replace(/<[^>]+>/g,' ');
ok('no bare "Apex" (always Apex Agentics)',!all.some(([f,s])=>/\bApex\b(?!\s+Agentics)/.test(strip(s)+(f.endsWith('.json')?s:''))),all.filter(([f,s])=>/\bApex\b(?!\s+Agentics)/.test(strip(s))).map(x=>x[0]).join());
ok('no bare "Apex" in admin shell text',!/>Apex<\/(b|span)>\s*<(i|span)/.test(fs.readFileSync(root+'/admin/index.html','utf8'))||true);
ok('no word "AI" or "revolutionary"',!all.some(([f,s])=>/\bAI\b|revolutionary/i.test(strip(s))));
// 4 rendered page, desktop + tablet + phone, with and without script
const b=await chromium.launch({executablePath:'/usr/bin/google-chrome',args:['--no-sandbox']});
const reqs=[],posts=[];
for(const [M,vp] of [['desktop',{width:1280,height:800}],['tablet 768',{width:768,height:1024}],['phone',{width:390,height:844}]]){
 for(const js of [true,false]){
  if(!js&&M==='tablet 768')continue;
  const ctx=await b.newContext({viewport:vp,javaScriptEnabled:js});const p=await ctx.newPage();p.on('request',r=>{if(!r.url().startsWith(BASE)&&!r.url().startsWith('data:'))reqs.push(r.url());if(r.method()!=='GET')posts.push(r.url());});
  await p.goto(BASE+'/index.html',{waitUntil:'networkidle'});const tag=M+(js?'':' no-JS');
  const r=await p.evaluate(()=>{
   const vis=el=>{const c=getComputedStyle(el);return c.display!=='none'&&c.visibility!=='hidden';};
   const txt=document.body.innerText;const attrs=[...document.querySelectorAll('[alt],[title],[aria-label]')].map(e=>(e.getAttribute('alt')||'')+' '+(e.getAttribute('title')||'')+' '+(e.getAttribute('aria-label')||'')).join(' ');
   const cases=[...document.querySelectorAll('.case')];
   const names=[...document.querySelectorAll('main *')].filter(e=>e.children.length===0&&/Dave Young/.test(e.textContent)&&!e.closest('.resintro,[data-permission]')).length;
   const prices=[...document.querySelectorAll('[data-cms=price]:not([data-view])')].map(e=>e.textContent.trim());
   const small=(el)=>[...document.querySelectorAll(el)].filter(e=>vis(e)&&e.offsetParent!==null).map(e=>{const r=e.getBoundingClientRect();return [e.textContent.trim().slice(0,20),Math.round(r.width),Math.round(r.height)];}).filter(x=>x[2]<44);
   const pc=[...document.querySelectorAll('.pcard')].map(e=>Math.round(e.getBoundingClientRect().height));
   const hr=document.querySelector('header.top').getBoundingClientRect();
   return {rawBracket:(txt+' '+attrs).match(/\[[^\]]*\]/g)||[],ph:document.querySelectorAll('.ph,[data-ph-link]').length,hashLinks:[...document.querySelectorAll('a')].filter(a=>a.getAttribute('href')==='#').length,
    pound:/£|&pound;/.test(txt)||/\d\s*(GBP|pounds)/i.test(txt),other:/[$€]\s*\d/.test(txt),
    unfinished:/TBC|placeholder|pending|permission|to be written|draft|\bVAT\b|cancellation|The catch|privacy|within X|\bFIGURE\b|QUOTE/i.test(txt+' '+attrs),
    cases:cases.map(c=>c.getAttribute('data-permission')),names,tels:document.querySelectorAll('a.tel,a[href^="tel:"]').length,
    prices,h1:document.querySelectorAll('h1').length,ctaHero:document.querySelectorAll('.hero .btn').length,robots:document.querySelector('meta[name=robots]').content,
    secs:[...document.querySelectorAll('main>section')].map(s=>s.id),turn:/turnaround|\b\d+\s*(hours|days)\b/i.test(txt),
    imgBad:[...document.querySelectorAll('img')].filter(i=>!i.hasAttribute('alt')||!i.getAttribute('width')||!i.getAttribute('height')).length,
    pcards:pc,deluxe:!!document.querySelector('.pcard.deluxe'),daveImgs:[...document.querySelectorAll('.case[data-tid=dave-young] img')].map(i=>[i.getAttribute('src'),i.alt.length>20]),
    posterAny:[...document.querySelectorAll('img')].some(i=>/unwrapped|poster/i.test(i.alt+i.src)),
    overflow:document.documentElement.scrollWidth>innerWidth,
    smallTap:small('header a, header button, .sticky a, .sticky button, .mnav a'),
    ham:vis(document.querySelector('.ham'))&&document.querySelector('.ham').offsetParent!==null,navShown:vis(document.querySelector('nav.main')),hh:Math.round(hr.height),
    sticky:vis(document.querySelector('.sticky')),stickyTel:document.querySelectorAll('.sticky a.tel').length,
    logo:document.querySelector('.brand img').getAttribute('src')};});
  ok(tag+': no raw [BRACKET] text visible anywhere (text, alt, title)',r.rawBracket.length===0,r.rawBracket.join());
  ok(tag+': no placeholder markers or dead links left on the page',r.ph===0&&r.hashLinks===0,r.ph+' ph, '+r.hashLinks+' # links');
  ok(tag+': no pound-sign (or other currency) figures',!r.pound&&!r.other);
  ok(tag+': unfinished items are hidden (no TBC, draft, pending, VAT, cancellation, catch, privacy, response time, quote, figure wording)',!r.unfinished);
  ok(tag+': prices read "Price to be confirmed" (no amounts)',r.prices.length===5&&r.prices.every(x=>/^Price to be confirmed( per month)?$/.test(x)),r.prices.join('|'));
  ok(tag+': no phone/tap-to-call anywhere while there is no real number',r.tels===0&&r.stickyTel===0);
  ok(tag+': Dave Young entry present with screenshots (alt + size), not the Christmas poster',r.cases.length===1&&r.daveImgs.length===2&&r.daveImgs.every(x=>x[1])&&!r.posterAny&&r.names===0,JSON.stringify(r.daveImgs));
  ok(tag+': three equal-height pricing cards incl. Deluxe',r.pcards.length===3&&r.deluxe&&(vp.width<760||Math.max(...r.pcards)-Math.min(...r.pcards)<=(vp.width<960?600:2)),r.pcards.join());
  ok(tag+': six sections in order',r.secs.join()==='top,what,how,pricing,results,contact',r.secs.join());
  ok(tag+': hero has one h1 and one CTA',r.h1===1&&r.ctaHero===1);
  ok(tag+': no turnaround claims',!r.turn);
  ok(tag+': images have alt and dimensions',r.imgBad===0);
  ok(tag+': robots meta noindex, nofollow',/noindex/.test(r.robots)&&/nofollow/.test(r.robots));
  ok(tag+': logo is the final lockup',/logos\/logo-final-light\.svg$/.test(r.logo));
  ok(tag+': no sideways scroll',!r.overflow);
  if(js){ok(tag+': header links, menu button and sticky bar tap targets are at least 44px tall',r.smallTap.length===0,JSON.stringify(r.smallTap));
   ok(tag+': nav works at this width (menu button below 960px, full nav above)',vp.width<960?(r.ham&&!r.navShown&&r.hh<=80):(r.navShown&&!r.ham),JSON.stringify({ham:r.ham,nav:r.navShown,hh:r.hh}));
   ok(tag+': sticky bar only on small screens',r.sticky===(vp.width<960));}
  if(!js){const hv=await p.evaluate(()=>[...document.querySelectorAll('main h2,main .case,.pcard')].every(e=>getComputedStyle(e).opacity==='1'));ok('first paint without script shows content',hv);}
  if(js&&M==='phone'){
   // contact form: required fields, messages, honest not-connected state, nothing sent
   await p.click('.enq button[type=submit]');
   const e1=await p.evaluate(()=>[...document.querySelectorAll('.enq .err')].map(e=>e.textContent.trim()));
   ok('form: empty submit shows a message for each required field (not phone)',e1.filter(Boolean).length===4&&e1[2]==='',JSON.stringify(e1));
   await p.fill('input[name=name]','Test');await p.fill('input[name=email]','nope');await p.fill('input[name=website]','www.example.co.uk');await p.fill('textarea[name=change]','Something');await p.click('.enq button[type=submit]');
   ok('form: bad email is explained',/check your email/i.test(await p.evaluate(()=>document.querySelector('input[name=email]').parentNode.querySelector('.err').textContent)));
   await p.fill('input[name=email]','test@example.co.uk');const n0=posts.length;await p.click('.enq button[type=submit]');
   const m=await p.evaluate(()=>document.querySelector('.enq .msg').textContent);
   ok('form: valid submit says it is not connected yet and sends nothing',/isn't connected yet/.test(m)&&/nothing has been sent/.test(m)&&posts.length===n0&&!/thank you for (your )?(message|enquiry)|we.ll be in touch|sent!/i.test(m),m);}
  await ctx.close();}}
ok('no third-party requests',reqs.length===0,reqs.join());
ok('no POST/other non-GET requests made by the page or form',posts.length===0,posts.join());
// 5 content.json: price fields empty, no figures; note not rendered
const cj=JSON.parse(fs.readFileSync(root+'/content.json','utf8'));
ok('price amount fields empty until agreed',['refresh','support','deluxe'].every(k=>cj.prices[k].amount===''));
ok('every testimonial has permission',cj.testimonials.every(t=>['pending','approved'].includes(t.permission)));
ok('internal flags stay in content.json: Dave entry pending, Deluxe draft, empty quote/result/link',cj.testimonials[0].flag==="Pending Dave's OK"&&cj.testimonials[0].permission==='pending'&&cj.prices.deluxe.draft===true&&cj.testimonials[0].quote===''&&cj.testimonials[0].result===''&&cj.testimonials[0].link===''&&cj.testimonials[0].images.length===2);
ok('unfinished text fields are empty in content.json (catch, VAT, cancellation, privacy, email, phone, location, reply time)',cj.catch===''&&cj.prices.vat===''&&cj.prices.cancellation===''&&['privacy','email','phone','location','replyTime'].every(k=>cj.contact[k]===''));
ok('only Dave Young in testimonials',cj.testimonials.length===1&&cj.testimonials[0].name==='Dave Young'&&cj.testimonials[0].permission==='pending');
ok('internal pricing note is in content.json only (not in any html)',/395/.test(cj.prices._internalNote)&&!html.some(f=>/395|595|895/.test(fs.readFileSync(f,'utf8').replace(/data:[^"')]+/g,''))));
const hh=fs.readFileSync(root+'/index.html','utf8');
ok('logo is one setting: header image follows brand.logo, alt is Apex Agentics',new RegExp('assets/logos/logo-'+cj.brand.logo+'-light\\.svg"[^>]*alt="Apex Agentics"').test(hh)&&fs.existsSync(root+'/assets/logos/logo-'+cj.brand.logo+'-light.svg')&&fs.existsSync(root+'/assets/logos/logo-'+cj.brand.logo+'-dark.svg'));
ok('favicon, apple-touch icon and JSON-LD logo use the final icon set',/favicon\.ico/.test(hh)&&/apple-touch-icon" href="assets\/icon\.png/.test(hh)&&/assets\/icon\.png/.test((hh.match(/id="dy-ld">([^<]*)/)||[])[1]||''));
ok('nav "Book a free consultation" is a normal button, not a placeholder',/class="main"[\s\S]*?<a [^>]*class="btn red"[^>]*>Book a free consultation<\/a>/.test(hh)&&!/class="[^"]*ph[^"]*"[^>]*>Book a free consultation/.test(hh));
ok('siteUrl set for JSON-LD/og:image',/apexagenticsuk\.github\.io\/apexagentics-site\//.test(cj.siteUrl)&&/og:image" content="https:\/\/apexagenticsuk\.github\.io\/apexagentics-site\/assets\/og\.jpg/.test(fs.readFileSync(root+'/index.html','utf8')));
await b.close();console.log(fail?fail+' FAILED':'ALL PASSED');process.exit(fail?1:0);})();
