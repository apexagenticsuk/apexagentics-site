// Playwright: root page at 375/390 (touch), 1280x800 and 1440x900, JS on/off and reduced motion (it loads no script at all); /web/ readable with JS off;
// icons + share image served; /web/ loads no animation libraries and has no custom cursor. Usage: node tests/root-page.js [baseUrl of dist]
const {chromium}=require('playwright');const BASE=process.argv[2]||'http://localhost:8851';let fail=0;
const ok=(n,c,x)=>{console.log((c?'PASS ':'FAIL ')+n+(c||!x?'':' -> '+x));if(!c)fail++;};
(async()=>{const b=await chromium.launch({executablePath:'/usr/bin/google-chrome',args:['--no-sandbox','--use-gl=angle','--use-angle=swiftshader','--enable-unsafe-swiftshader']});
const phone=vp=>({viewport:vp,isMobile:true,hasTouch:true});
for(const [n,o,js,rm] of [['375',phone({width:375,height:812}),true,'no-preference'],['390',phone({width:390,height:844}),true,'no-preference'],['375 no-JS',phone({width:375,height:812}),false,'no-preference'],['375 reduced',phone({width:375,height:812}),true,'reduce'],['1280',{viewport:{width:1280,height:800}},true,'no-preference'],['1440',{viewport:{width:1440,height:900}},true,'no-preference'],['1280 no-JS',{viewport:{width:1280,height:800}},false,'no-preference'],['1280 reduced',{viewport:{width:1280,height:800}},true,'reduce']]){
 const vp=o.viewport,desk=vp.width>=1024;const c=await b.newContext({...o,javaScriptEnabled:js,reducedMotion:rm});const p=await c.newPage();const errs=[];p.on('pageerror',e=>errs.push(e.message));
 const bad=[],jsReq=[];p.on('response',r=>{if(r.status()>=400)bad.push(r.status()+' '+r.url());});p.on('request',r=>{if(r.resourceType()==='script')jsReq.push(r.url());});
 await p.goto(BASE+'/',{waitUntil:'load'});await p.waitForTimeout(desk&&rm!=='reduce'?2400:400);
 const r=await p.evaluate(()=>{const v=el=>{const q=el&&el.getBoundingClientRect(),s=el&&getComputedStyle(el);return !!el&&q.width>0&&q.height>0&&s.visibility!=='hidden'&&+s.opacity>0;};const card=document.querySelector('a.dcard'),foot=document.querySelector('footer');
  return {h1:v(document.querySelector('h1')),h1n:document.querySelectorAll('h1').length,card:v(card),cardBottom:card.getBoundingClientRect().bottom,footBottom:foot.getBoundingClientRect().bottom+scrollY,docH:document.documentElement.scrollHeight,overflow:document.documentElement.scrollWidth-innerWidth,
   glow:getComputedStyle(document.querySelector('.hero'),'::before').animationName,orbCss:getComputedStyle(document.querySelector('.home-orb'),'::before').animationName,canvas:!!document.querySelector('.home-orb canvas.orb'),fx:document.documentElement.classList.contains('fx'),split:!!document.querySelector('.home-h1 [aria-hidden]'),h1label:document.querySelector('h1').getAttribute('aria-label')||document.querySelector('h1').textContent.replace(/\s+/g,' ').trim()||(document.querySelector('h1 img')||{}).alt,tag:v(document.querySelector('h1 + .home-tag')),cursor:!!document.querySelector('.cursor'),tris:document.querySelectorAll('.home-orb .tri').length,markW:document.querySelector('.home-orb').getBoundingClientRect().width,markLeft:Math.round(document.querySelector('.home-orb').getBoundingClientRect().left),cardRight:Math.round(card.getBoundingClientRect().right),font:document.fonts.check('700 40px "Space Grotesk"')}});
 ok(`${n}: one h1 (reads "Apex Agentics UK"), h1 and /web card visible`,r.h1n===1&&r.h1&&r.card&&r.h1label==='Apex Agentics UK'&&r.tag,r.h1label);ok(`${n}: card in first screen`,r.cardBottom<=vp.height,r.cardBottom);ok(`${n}: no horizontal overflow`,r.overflow<=0,r.overflow);
 if(desk)ok(`${n}: whole page incl. footer fits above the fold (${vp.width}x${vp.height})`,r.footBottom<=vp.height+0.5&&r.docH<=vp.height,`footer bottom ${r.footBottom}, doc ${r.docH}`);
 ok(`${n}: no failed requests or JS errors`,!bad.length&&!errs.length,bad.concat(errs).join());
 if(rm==='reduce'){ok(`${n}: hero glow and CSS orb animation off`,r.glow==='none'&&r.orbCss==='none',r.glow+' '+r.orbCss);ok(`${n}: no motion JS loaded`,jsReq.length===0&&!r.fx,jsReq.join());}
 ok(`${n}: no script is requested and there is no custom cursor`,jsReq.length===0&&!r.cursor,jsReq.join());
 ok(`${n}: the Shift mark is drawn (two shapes, on screen) and never covers the card`,r.tris===2&&r.markW>40&&(!desk||r.markLeft>=r.cardRight),JSON.stringify({tris:r.tris,markLeft:r.markLeft,cardRight:r.cardRight}));
 if(!js)ok(`${n}: no-JS shows heading and card without motion classes`,!r.fx&&!r.split);
 if(n==='375')ok(`${n}: Space Grotesk loaded`,r.font);
 await c.close();}
{const c=await b.newContext({viewport:{width:1280,height:800}});const p=await c.newPage();const js=[];p.on('request',r=>{if(r.resourceType()==='script')js.push(new URL(r.url()).pathname);});await p.goto(BASE+'/web/',{waitUntil:'networkidle'});await p.waitForTimeout(2200);
 const st=await p.evaluate(()=>({cursor:!!document.querySelector('.cursor'),dim:[...document.querySelectorAll('.hero h1,.hero .lead,.hero .hp,.hero .btn,.hero-art img,.proof')].filter(e=>{const s=getComputedStyle(e);return +s.opacity<1||s.visibility==='hidden'||e.getBoundingClientRect().height===0}).length}));
 ok('/web/ 1280: no custom cursor (the system pointer is used); hero fully visible once its entrance has played',!st.cursor&&st.dim===0,JSON.stringify(st));
 ok('/web/ 1280: only the two small scripts load (main.js, viewer.js), no animation libraries',js.length===2&&js.every(u=>/^\/js\/(main|viewer)\.js$/.test(u)),js.join());await c.close();}
{const c=await b.newContext({viewport:{width:375,height:812},javaScriptEnabled:false});const p=await c.newPage();await p.goto(BASE+'/web/');
 const t=await p.evaluate(()=>[...document.querySelectorAll('h1,#prices h2,#contact h2,footer')].map(e=>{const s=getComputedStyle(e);return e.getBoundingClientRect().height>0&&+s.opacity>0&&s.visibility!=='hidden'}));
 ok('/web/ no-JS: hero, prices, contact and footer visible',t.length===4&&t.every(Boolean),JSON.stringify(t));
 for(const [u,ct] of [['/favicon.ico',/icon/],['/apple-touch-icon.png',/png/],['/og.png',/png/]]){const r=await c.request.get(BASE+u);ok(`GET ${u} -> 200 (${ct.source})`,r.status()===200&&ct.test(r.headers()['content-type']||''),r.status()+' '+r.headers()['content-type']);}
 await c.close();}
await b.close();process.exit(fail?1:0);})();
