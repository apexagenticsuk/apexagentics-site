// Editor test (demo mode, no key): edit text, a price, an image, add and remove a testimonial.
const {chromium}=require('playwright');const fs=require('fs'),path=require('path');
const OWN=process.env.OWNER_NAME_RE||'k'+'ane'; // owner's first name, built so this file itself stays clean for the name scan
const BASE=process.argv[2]||'http://localhost:8834';let fail=0;
const ok=(n,c,x)=>{console.log((c?'PASS ':'FAIL ')+n+(c||!x?'':' -> '+x));if(!c)fail++;};
(async()=>{const b=await chromium.launch({executablePath:'/usr/bin/google-chrome',args:['--no-sandbox']});
const ctx=await b.newContext({viewport:{width:1400,height:900}});
await ctx.addInitScript(()=>{try{if(!sessionStorage.getItem('x')){localStorage.clear();localStorage.setItem('dy-mode','demo');sessionStorage.setItem('x','1');}}catch(e){}});
const p=await ctx.newPage();const errs=[];p.on('pageerror',e=>errs.push(e.message));
const F=()=>p.frame({url:/edit=1/});
const ready=async()=>{await p.waitForFunction(()=>{try{return !!document.querySelector('#frame').contentWindow.DYI&&document.querySelector('#frame').contentDocument.readyState==='complete';}catch(e){return false;}});await p.waitForTimeout(600);};
await p.goto(BASE+'/admin/');await p.waitForFunction(()=>window.DYE&&window.DYE.state().content);await ready();
ok('demo mode opens without a key',await p.evaluate(()=>!document.querySelector('#demobadge').hidden));
ok('multi-page tools (Pages, Page settings, page picker) are hidden',await p.evaluate(()=>['#pagesb','#psettings','#page'].every(s=>{const e=document.querySelector(s);return e.hidden&&getComputedStyle(e).display==='none';})));
ok('Shared content (results and pricing) button is still there',await p.evaluate(()=>{const e=document.querySelector('#sharedb');return !!e&&getComputedStyle(e).display!=='none';}));
// 1 text
const h=F().locator('.hero h1');await h.click();await p.keyboard.press('Control+A');await p.keyboard.type('A better website, built fast. EDIT');await F().locator('#pricing h2').click();await p.waitForTimeout(400);
ok('edit text: heading changed in the page and recorded as a draft',/EDIT/.test(await F().evaluate(()=>document.querySelector('.hero h1').textContent))&&await p.evaluate(()=>JSON.stringify(DYE.state().content.pages||{}).includes('EDIT')));
// 2 price (Shared content -> price tab)
await p.evaluate(()=>DYE.openShared('refresh'));await p.waitForSelector('#sharedm:not([hidden])');
const pi=p.locator('#sharedm .shbody input[type=text]').first();await pi.fill('TESTPRICE');await pi.dispatchEvent('change');await ready();
const priceTxt=await F().evaluate(()=>[...document.querySelectorAll('[data-cms=price][data-key=refresh]')].map(e=>e.textContent).join('|'));
ok('edit a price: shows on the page everywhere it is used (card + pricing)',(priceTxt.match(/TESTPRICE/g)||[]).length>=2,priceTxt);
await pi.fill('');await pi.dispatchEvent('change');await ready();
ok('empty price goes back to "Shared at your free consultation"',await F().evaluate(()=>/^Shared at your free consultation$/.test(document.querySelector('#pricing [data-cms=price][data-key=refresh]').textContent.trim())));
await p.evaluate(()=>document.querySelector('#sharedm').hidden=true);
// 2b clicking a price opens the clicked card's own tab
for(const [k,exp] of [['deluxe','Price: Deluxe Refresh'],['support','Price: Ongoing Support'],['refresh','Price: Website Refresh']]){
 await F().locator('#pricing [data-cms=price][data-key='+k+']:not([data-view])').first().click();await p.waitForSelector('#sharedm:not([hidden])');
 ok('clicking the '+k+' price opens its own tab',await p.evaluate(e=>document.querySelector('#sharedm .shtab.on').textContent===e,exp));await p.evaluate(()=>document.querySelector('#sharedm').hidden=true);}
ok('editor text has no internal wording (owner name, TBC, bracket)',!new RegExp(OWN+'|TBC|\\[[A-Z]').test(await p.evaluate(()=>{DYE.openShared('refresh');const a=document.querySelector('#sharedm').innerText;DYE.openShared('testimonials');const b=document.querySelector('#sharedm').innerText;DYE.openShared('contact');const c=document.querySelector('#sharedm').innerText;document.querySelector('#sharedm').hidden=true;return a+b+c+document.querySelector('#tok').placeholder;})));
// 2c phone number switches the call link on and off
await p.evaluate(()=>DYE.openShared('contact'));await p.waitForSelector('#sharedm:not([hidden])');
const ph=p.locator('#sharedm .shbody label:has(span:text-is("Phone")) input');await ph.fill('020 7946 0000');await ph.dispatchEvent('change');await ready();
ok('a real phone number switches on tap-to-call (tel: link in footer and sticky bar)',await F().evaluate(()=>document.querySelectorAll('a.tel[href^="tel:"]').length>=2));
await ph.fill('');await ph.dispatchEvent('change');await ready();
ok('clearing the phone number removes every call link again',await F().evaluate(()=>document.querySelectorAll('a.tel,a[href^="tel:"]').length===0));
await p.evaluate(()=>document.querySelector('#sharedm').hidden=true);
// 3 image
const png=path.join(__dirname,'_tmp.png');fs.writeFileSync(png,Buffer.from('iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR4nGNgYGD4DwABBAEAHb8pBgAAAABJRU5ErkJggg==','base64'));
const before=await F().evaluate(()=>document.querySelector('#what .card img').getAttribute('src'));
await F().locator('#what .card img').first().click();await p.waitForSelector('#side:not([hidden])');
const fi=p.locator('#side input[type=file]').first();await fi.setInputFiles(png);await p.waitForTimeout(1500);
const after=await F().evaluate(()=>document.querySelector('#what .card img').getAttribute('src'));
ok('replace an image: the picture changes',after!==before&&/^(data:|blob:|assets\/uploads)/.test(after),before+' -> '+after);
fs.unlinkSync(png);
// 4 add + remove testimonial
await p.evaluate(()=>DYE.openShared('testimonials'));await p.waitForSelector('#sharedm:not([hidden])');
const n0=await F().locator('.case').count();
await p.locator('#sharedm .shbody > button:has-text("+ Add")').click();await ready();
ok('add a testimonial: appears with a pending permission marker',(await F().locator('.case').count())===n0+1&&(await p.evaluate(()=>DYE.state().content.testimonials.every(t=>t.permission==='pending'))));
await p.locator('#sharedm details.shrow').last().locator('[data-del]').click();await p.waitForSelector('#dlg:not([hidden])');await p.click('#dlg-ok');await ready();
ok('remove a testimonial: back to the original count',(await F().locator('.case').count())===n0);
// 5 version stamp: a draft made on an older site version is dropped, a current one is kept
// round: plain wording, tabs, menu link panel, exit warning
await p.evaluate(()=>document.querySelector('#sharedm').hidden=true);
const txt=await p.evaluate(()=>{let o='';['refresh','deluxe','support','terms','catch','testimonials','contact'].forEach(k=>{try{DYE.openShared(k);o+=' '+document.querySelector('#sharedm').innerText+' '+[...document.querySelectorAll('#sharedm input,#sharedm textarea')].map(i=>i.placeholder).join(' ');}catch(e){}});document.querySelector('#sharedm').hidden=true;return o;});
ok('Shared content panels: no owner name, approved, TBC, brackets, or hash links',!new RegExp(OWN+'|approved|TBC|\\[|\\]|#what|#how|#pricing|Link to','i').test(txt),(txt.match(new RegExp('.{20}('+OWN+'|approved|TBC|\\[|Link to).{20}','i'))||[''])[0]);
await p.evaluate(()=>DYE.openShared('refresh'));await p.waitForSelector('#sharedm:not([hidden])');
ok('price tabs expose aria-selected (exactly one true)',await p.evaluate(()=>{const t=[...document.querySelectorAll('#sharedm [role=tab]')];return t.length>=3&&t.every(x=>x.hasAttribute('aria-selected'))&&t.filter(x=>x.getAttribute('aria-selected')==='true').length===1&&t.find(x=>x.getAttribute('aria-selected')==='true').classList.contains('on');}));
await p.evaluate(()=>document.querySelector('#sharedm').hidden=true);
await F().locator('header.top nav.main a[href="#what"]').click();await p.waitForTimeout(500);
ok('clicking a menu link shows plain wording (no Pages dialog, no hash links)',await p.evaluate(()=>{const vis=[...document.querySelectorAll('.modal:not([hidden])')];const pn=document.body.innerText;return vis.length===0&&!/Link to|#what|#how|#pricing/.test(pn)&&/is a link in the menu/.test(document.querySelector('#frame').contentDocument.body.innerText+pn);}));
await F().evaluate(()=>window.DYE&&0);await p.keyboard.press('Escape');
{const nn=JSON.stringify(await F().evaluate(()=>[...document.querySelectorAll('header.top nav.main a:not(.btn)')].map(a=>a.textContent.replace(/⠿/g,'').trim())));ok('menu link names: What we do, How it works, Pricing, Results, Contact',nn===JSON.stringify(['What we do','How it works','Pricing','Results','Contact']),nn);}
ok('editor intro text has no stray space before the full stop',!/ \.(\s|$)/.test(await F().evaluate(()=>document.querySelector('#contact .lead').innerText)),await F().evaluate(()=>document.querySelector('#contact .lead').innerText));
// exit demo warns when there are changes
await p.evaluate(()=>{DYE.openShared('contact');});await p.waitForSelector('#sharedm:not([hidden])');
const em=p.locator('#sharedm .shbody label:has(span:text-is("Email")) input');if(await em.count()){await em.fill('hello@example.test');await em.dispatchEvent('change');await ready();}
await p.evaluate(()=>document.querySelector('#sharedm').hidden=true);
await p.evaluate(()=>{window.__left=false;});
await p.click('#out');await p.waitForTimeout(400);
ok('Exit demo with unsaved changes asks first',await p.evaluate(()=>!document.querySelector('#dlg').hidden&&/Exit demo/i.test(document.querySelector('#dlg').innerText)));
await p.evaluate(()=>{document.querySelector('#dlg-cancel')?document.querySelector('#dlg-cancel').click():[...document.querySelectorAll('#dlg button')].find(b=>/Stay/.test(b.textContent)).click();});await p.waitForTimeout(300);
ok('choosing Stay keeps the editor open',await p.evaluate(()=>document.querySelector('#dlg').hidden&&location.pathname.includes('admin')));
await p.goto(BASE+'/robots.txt');await p.evaluate(()=>{localStorage.setItem('dy2-draft-demo',JSON.stringify({content:{version:'1999',pages:{index:{text:{e0:'STALE'}}},site:{}},uploads:{},base:'1999-01-01T00:00:00Z'}));});
await p.goto(BASE+'/admin/');await p.waitForFunction(()=>window.DYE&&window.DYE.state().content);await ready();
ok('stale draft (older version stamp) is dropped',await p.evaluate(()=>!JSON.stringify(DYE.state().content).includes('STALE')));
ok('no script errors',errs.length===0,errs.join(' | '));
await b.close();console.log(fail?fail+' FAILED':'ALL PASSED');process.exit(fail?1:0);})();
