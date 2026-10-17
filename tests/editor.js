// Editor test (demo mode, no key): edit text, a price, an image, add and remove a testimonial.
const {chromium}=require('playwright');const fs=require('fs'),path=require('path');
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
// 1 text
const h=F().locator('.hero h1');await h.click();await p.keyboard.press('Control+A');await p.keyboard.type('A better website, built fast. EDIT');await F().locator('#pricing h2').click();await p.waitForTimeout(400);
ok('edit text: heading changed in the page and recorded as a draft',/EDIT/.test(await F().evaluate(()=>document.querySelector('.hero h1').textContent))&&await p.evaluate(()=>JSON.stringify(DYE.state().content.pages||{}).includes('EDIT')));
// 2 price (Shared content -> price tab)
await p.evaluate(()=>DYE.openShared('refresh'));await p.waitForSelector('#sharedm:not([hidden])');
const pi=p.locator('#sharedm .shbody input[type=text]').first();await pi.fill('TESTPRICE');await pi.dispatchEvent('change');await ready();
const priceTxt=await F().evaluate(()=>[...document.querySelectorAll('[data-cms=price][data-key=refresh]')].map(e=>e.textContent).join('|'));
ok('edit a price: shows on the page everywhere it is used (card + pricing)',(priceTxt.match(/TESTPRICE/g)||[]).length>=2,priceTxt);
await pi.fill('');await pi.dispatchEvent('change');await ready();
ok('empty price goes back to the [PRICE TBC] placeholder',await F().evaluate(()=>/\[PRICE TBC\]/.test(document.querySelector('#pricing [data-cms=price][data-key=refresh]').textContent)));
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
ok('add a testimonial: appears with a pending permission marker',(await F().locator('.case').count())===n0+1&&(await F().evaluate(()=>[...document.querySelectorAll('.case')].every(c=>c.getAttribute('data-permission')==='pending'))));
await p.locator('#sharedm details.shrow').last().locator('[data-del]').click();await p.waitForSelector('#dlg:not([hidden])');await p.click('#dlg-ok');await ready();
ok('remove a testimonial: back to the original count',(await F().locator('.case').count())===n0);
// 5 version stamp: a draft made on an older site version is dropped, a current one is kept
await p.goto(BASE+'/robots.txt');await p.evaluate(()=>{localStorage.setItem('dy2-draft-demo',JSON.stringify({content:{version:'1999',pages:{index:{text:{e0:'STALE'}}},site:{}},uploads:{},base:'1999-01-01T00:00:00Z'}));});
await p.goto(BASE+'/admin/');await p.waitForFunction(()=>window.DYE&&window.DYE.state().content);await ready();
ok('stale draft (older version stamp) is dropped',await p.evaluate(()=>!JSON.stringify(DYE.state().content).includes('STALE')));
ok('no script errors',errs.length===0,errs.join(' | '));
await b.close();console.log(fail?fail+' FAILED':'ALL PASSED');process.exit(fail?1:0);})();
