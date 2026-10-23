// Renders the concept phone mock-ups (concepts.html, names from site-config.json) to PNG at 2x,
// plus two crops of each scene's left-hand handset at 4x: top 4:5 -> /tmp/cmock-<key>-phone-raw.png (the card's <760px source)
// and top 9:16 -> /tmp/cmock-<key>-view-raw.png (the on-page viewer's <760px image),
// then site/brand/concepts-img.py writes optimised WebP and a PNG fallback to site/img.
const {chromium}=require('playwright');const path=require('path');const C=require('../../site-config.json');
const names=Object.fromEntries(C.concepts.items.map(c=>[c.key,c.name]));
(async()=>{const b=await chromium.launch({executablePath:process.env.CHROME||'/usr/bin/google-chrome',args:['--no-sandbox','--allow-file-access-from-files']});
for(const k of ['cafe','plumber','studio','included']){const inc=k==='included';
 const p=await b.newPage({viewport:inc?{width:470,height:960}:{width:1200,height:800},deviceScaleFactor:2});
 await p.goto('file://'+path.join(__dirname,'concepts.html')+'?k='+k+'&names='+encodeURIComponent(JSON.stringify(names)));
 await p.evaluate(()=>document.fonts.ready);
 const ok=await p.evaluate(async()=>{await Promise.all(['700 40px SG','500 16px IT','400 16px IT','italic 40px IS'].map(f=>document.fonts.load(f)));return ['700 40px SG','500 16px IT','400 16px IT','italic 40px IS'].every(f=>document.fonts.check(f))});
 if(!ok)throw new Error('fonts not loaded');await p.waitForTimeout(150);
 await p.screenshot({path:`/tmp/cmock-${k}-raw.png`,omitBackground:inc});console.log('rendered',k);await p.close();
 if(!inc){// phone crops: the left-hand handset at 4x, so its text reads on a phone
  // the viewer page is 1200 tall and the scene is not clipped: the plumber and studio handsets (scaled up) run below the 800px scene, and the 9:16 crop needs more of them
  for(const [tag,ratio,ref,VH] of [['phone',5/4,292,800],['view',16/9,374,1200]]){
  const q=await b.newPage({viewport:{width:1200,height:VH},deviceScaleFactor:4});
  await q.goto('file://'+path.join(__dirname,'concepts.html')+'?k='+k+'&names='+encodeURIComponent(JSON.stringify(names)));
  await q.evaluate(async()=>{await document.fonts.ready;await Promise.all(['700 40px SG','500 16px IT','400 16px IT','italic 40px IS'].map(f=>document.fonts.load(f)));});if(tag==='view')await q.addStyleTag({content:'html,body,.scene{overflow:visible!important}'});await q.waitForTimeout(150);
  // two crops of the handset, full width from the top: 4:5 for the card (judged at 292 CSS px, the card at 390) and tall 9:16 for the on-page viewer (judged at 374 CSS px, the viewer at 390)
  const m=await q.evaluate(([ratio,ref])=>{const ph=[...document.querySelectorAll('.ph')].sort((a,b)=>a.getBoundingClientRect().left-b.getBoundingClientRect().left)[0],r=ph.getBoundingClientRect(),s=r.width/ph.offsetWidth,W=r.width,H=Math.round(W*ratio),sz=[];
   const tw=document.createTreeWalker(ph,NodeFilter.SHOW_TEXT);let n;while(n=tw.nextNode()){if(!n.textContent.trim())continue;const e=n.parentElement,b=e.getBoundingClientRect();if(b.top>r.top+H||b.bottom<r.top)continue;sz.push([parseFloat(getComputedStyle(e).fontSize)*s*ref/W,n.textContent.trim().slice(0,24)]);}
   return {clip:{x:r.left,y:r.top,width:W,height:H},sz}},[ratio,ref]);
  if(m.clip.y+m.clip.height>VH)throw new Error(tag+' crop runs off the scene: '+k);
  await q.screenshot({path:`/tmp/cmock-${k}-${tag}-raw.png`,clip:m.clip});
  m.sz.sort((a,b)=>a[0]-b[0]);console.log(tag,k,'text at',ref,'CSS px wide: min',m.sz[0][0].toFixed(1),'px ('+m.sz[0][1]+')',m.sz.map(x=>x[0].toFixed(1)+' '+x[1]).join(' | '));
  await q.close();}}}
await b.close()})();
