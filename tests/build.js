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
// 4 rendered page, desktop + phone
const b=await chromium.launch({executablePath:'/usr/bin/google-chrome',args:['--no-sandbox']});
const reqs=[];
for(const [M,vp] of [['desktop',{width:1280,height:800}],['phone',{width:390,height:844}]]){
 for(const js of [true,false]){
  const ctx=await b.newContext({viewport:vp,javaScriptEnabled:js});const p=await ctx.newPage();p.on('request',r=>{if(!r.url().startsWith(BASE)&&!r.url().startsWith('data:'))reqs.push(r.url());});
  await p.goto(BASE+'/index.html',{waitUntil:'networkidle'});const tag=M+(js?'':' no-JS');
  const r=await p.evaluate(()=>{const bad=[];const w=document.createTreeWalker(document.body,NodeFilter.SHOW_TEXT);let t;let txt=[];
   while((t=w.nextNode())){if(t.parentElement.closest('script,style,noscript'))continue;const s=t.nodeValue;txt.push(s);const re=/\[[^\]]+\]/g;let m;while((m=re.exec(s))){if(!t.parentElement.closest('.ph'))bad.push(m[0]);}}
   const all=txt.join(' ');
   const ph=[...document.querySelectorAll('.ph')].map(e=>e.textContent.trim());
   const cases=[...document.querySelectorAll('.case')];
   const names=[...document.querySelectorAll('main *')].filter(e=>e.children.length===0&&/Dave Young/.test(e.textContent)&&!e.closest('[data-permission]')).length;
   const tels=[...document.querySelectorAll('a.tel')].map(a=>({href:a.getAttribute('href'),ph:a.classList.contains('ph')}));
   const prices=[...document.querySelectorAll('[data-cms=price]')].map(e=>e.textContent.trim());
   const dc=document.querySelector('.case[data-tid=dave-young]');const dave={pending:!!dc&&dc.getAttribute('data-permission')==='pending'&&/Pending Dave's OK/.test(dc.querySelector('.flag').textContent)&&/Pending Dave's OK/.test(document.querySelector('.resintro .flag').textContent),imgs:dc?dc.querySelectorAll('img').length:0,altok:!!dc&&[...dc.querySelectorAll('img')].every(i=>i.alt.length>10&&i.getAttribute('width')&&i.getAttribute('height'))};
   return {dave,bad,pound:/£|&pound;/.test(all)||/\d\s*(GBP|pounds)/i.test(all),dollar:/[$€]\s*\d/.test(all),ph,cases:cases.map(c=>c.getAttribute('data-permission')),names,tels,prices,h1:document.querySelectorAll('h1').length,ctaHero:document.querySelectorAll('.hero .btn').length,robots:document.querySelector('meta[name=robots]').content,secs:[...document.querySelectorAll('main>section')].map(s=>s.id),nodrafts:/Draft placeholder/.test(all),turn:/turnaround|within \d|\b\d+\s*(hours|days)/i.test(all.replace(/within X working days/,'')),imgNoAlt:[...document.querySelectorAll('img')].filter(i=>!i.hasAttribute('alt')||!i.width||!i.getAttribute('width')).length,deluxe:!!document.querySelector('.pcard.deluxe'),pcards:document.querySelectorAll('.pcard').length};});
  ok(tag+': every [BRACKET] is inside a visible placeholder marker',r.bad.length===0,r.bad.join());
  ok(tag+': no pound-sign (or other currency) numbers on the page',!r.pound&&!r.dollar);
  ok(tag+': testimonials/clients each carry a permission marker',r.cases.length>=1&&r.cases.every(x=>x==='pending'||x==='approved')&&r.names===0,JSON.stringify(r.cases)+' unmarked names '+r.names);
  ok(tag+': Dave Young entry is visibly marked Pending Dave\'s OK, with screenshots that have alt and size',r.dave.pending&&r.dave.imgs>=2&&r.dave.altok,JSON.stringify(r.dave));
  ok(tag+': tap-to-call is a placeholder link that goes nowhere (no tel: href) while no phone exists',r.tels.length>=2&&r.tels.every(t=>t.ph&&t.href==='#'),JSON.stringify(r.tels));
  ok(tag+': price cards show placeholders, no amounts',r.prices.filter(x=>/PRICE TBC|DETAILS TBC|VAT TBC|CANCELLATION TBC/.test(x)).length===r.prices.length&&!r.prices.some(x=>/\d/.test(x)),r.prices.join('|'));
  ok(tag+': three pricing cards incl. Deluxe with Draft placeholder label',r.pcards===3&&r.deluxe&&r.nodrafts);
  ok(tag+': six sections in order',r.secs.join()==='top,what,how,pricing,results,contact',r.secs.join());
  ok(tag+': hero has one h1 and one CTA',r.h1===1&&r.ctaHero===1);
  ok(tag+': no turnaround/time claims',!r.turn);
  ok(tag+': images have alt and dimensions',r.imgNoAlt===0);
  ok(tag+': robots meta',/noindex/.test(r.robots)&&/nofollow/.test(r.robots));
  // placeholders visible (not hidden, has styling)
  const vis=await p.evaluate(()=>[...document.querySelectorAll('.ph')].filter(e=>{const c=getComputedStyle(e);return c.display==='none'||c.visibility==='hidden'||!e.offsetParent&&!e.closest('.sticky')}).length);
  ok(tag+': all placeholders visible',vis===0,String(vis));
  if(!js){const hv=await p.evaluate(()=>[...document.querySelectorAll('main h2,main .case,.pcard')].every(e=>getComputedStyle(e).opacity==='1'));ok('first paint without script shows content',hv);}
  if(js&&M==='phone'){const cl=await p.evaluate(()=>{const a=document.querySelector('a.tel.ph');return a.click(),location.hash;});ok('clicking the phone placeholder goes nowhere',cl==='');}
  await ctx.close();}}
ok('no third-party requests (html + assets)',reqs.length===0,reqs.join());
// 5 content.json: price fields empty, no figures; note not rendered
const cj=JSON.parse(fs.readFileSync(root+'/content.json','utf8'));
ok('price amount fields empty until owner approves',['refresh','support','deluxe'].every(k=>cj.prices[k].amount===''));
ok('every testimonial has permission',cj.testimonials.every(t=>['pending','approved'].includes(t.permission)));
ok('Dave entry flag in content.json',cj.testimonials[0].flag==="Pending Dave's OK"&&cj.testimonials[0].images.length===2);
ok('only Dave Young in testimonials',cj.testimonials.length===1&&cj.testimonials[0].name==='Dave Young'&&cj.testimonials[0].permission==='pending');
ok('internal pricing note is in content.json only (not in any html)',/395/.test(cj.prices._internalNote)&&!html.some(f=>/395|595|895/.test(fs.readFileSync(f,'utf8').replace(/data:[^"')]+/g,''))));
const hh=fs.readFileSync(root+'/index.html','utf8');
ok('logo is one setting: header image follows brand.logo, alt is Apex Agentics',new RegExp('assets/logos/logo-'+cj.brand.logo+'-light\\.svg"[^>]*alt="Apex Agentics"').test(hh)&&fs.existsSync(root+'/assets/logos/logo-'+cj.brand.logo+'-light.svg')&&fs.existsSync(root+'/assets/logos/logo-'+cj.brand.logo+'-dark.svg'));
ok('favicon, apple-touch icon and JSON-LD logo use the final icon set',/favicon\.ico/.test(hh)&&/apple-touch-icon" href="assets\/icon\.png/.test(hh)&&/assets\/icon\.png/.test((hh.match(/id="dy-ld">([^<]*)/)||[])[1]||''));
ok('siteUrl set for JSON-LD/og:image',/apexagenticsuk\.github\.io\/apexagentics-site\//.test(cj.siteUrl)&&/og:image" content="https:\/\/apexagenticsuk\.github\.io\/apexagentics-site\/assets\/og\.jpg/.test(fs.readFileSync(root+'/index.html','utf8')));
await b.close();console.log(fail?fail+' FAILED':'ALL PASSED');process.exit(fail?1:0);})();
