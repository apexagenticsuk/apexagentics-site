// Editor gallery: takes three real screenshots of the editor (admin/, demo mode, demo site) and frames them.
// Usage: node site/brand/render-editor.js [base]   (base serves the repo root, default http://localhost:8834)
// 0. Run node site/brand/editor-demo.js first: the shots use that demo site (current /web wording), served in place of /index.html and /content.json.
// 1. Opens base/admin/ in demo mode at 1280x800 (4x; the demo header shows the Shift logo, option 1), the same set-up as tests/editor.js, and captures:
//    reorder: section selected, Reorder sections panel open, a row being dragged (mouse still held down);
//    add:     the Add a section window, opened from a real '+ Add section here' button;
//    image:   a picture clicked and replaced through the Picture panel's file input (the editor's own upload), then described in its own field.
//    Adding a whole page is not shown: the Pages tools are hidden in every mode, so it can't be done in the editor.
// Each shot is cropped to the panel it shows (a 16:10 window from the top: reorder 820 and picture 960 CSS px, right-aligned; add 960, centred).
// Each shot also gets a 4:5 phone crop for the card (phoneCrop: reorder and picture panels at full panel width, picture anchored to its buttons; add from a 280x720 window, the Add a section window only) -> /tmp/emock-<key>-phone-raw.png,
// and a tall 9:16 crop for the on-page viewer on phones (panels with 10px of the left padding trimmed; add from a 360x720 window) -> /tmp/emock-<key>-view-raw.png.
// 2. Frames each one in site/brand/editor.html (label from site-config.json) -> /tmp/emock-<key>-raw.png.
// Then site/brand/editor-img.py writes WebP and a PNG fallback to site/img.
const {chromium}=require('playwright');const path=require('path');const C=require('../../site-config.json');
const BASE=process.argv[2]||'http://localhost:8834';const LOGO=process.env.APEX_LOGO_DIR||'/workspace/apex-logos/web/option-1/svg';
// crop: a 16:10 window (the frame's shape) around the panel being shown, so the panel reads on a phone
// The window is W wide, starts at the top (so the editor's toolbar shows), and is centred on the panel or, with right, ends at the right edge (the side panel).
async function crop(p,sel,W,right){const r=await p.locator(sel).first().boundingBox();if(!r)throw new Error('crop: no '+sel);const H=W*10/16;
 const x=right?1280-W:Math.min(Math.max(0,r.x+r.width/2-W/2),1280-W);
 if(r.x<x||r.x+Math.min(r.width,1280-r.x)>x+W||r.y+40>H)throw new Error('crop: '+sel+' does not fit in the window');return p.screenshot({clip:{x,y:0,width:W,height:H}});}const ROOT=path.join(__dirname,'..','..');
// phoneCrop: a window around the union of the given parts of a panel. Two uses:
//  the card's <760px source: 4:5, judged at 292 CSS px wide (the card at 390);
//  the viewer's <760px image: tall 9:16 (o.ratio 16/9), judged at 374 CSS px wide (o.ref; the viewer at 390 less 8px each side).
// o.px widens (or, negative, trims) the window each side; o.left trims the left side only (the side panels' rows run to the right edge); o.bottom anchors it to the bottom of the parts; o.top is the space kept above them.
// Logs the text size each line would show at o.ref CSS px; stops if the window cuts visible panel text at the sides (text already clipped by its own box, e.g. an ellipsis, counts as its visible part).
async function phoneCrop(p,k,sels,o={}){const {px=0,left=0,bottom=false,ratio=5/4,ref=292,top=8,tag='phone'}=o;let u=null;for(const s of sels){const r=await p.locator(s).first().boundingBox();if(!r)throw new Error('phoneCrop: no '+s);u=u?{x1:Math.min(u.x1,r.x),y1:Math.min(u.y1,r.y),x2:Math.max(u.x2,r.x+r.width),y2:Math.max(u.y2,r.y+r.height)}:{x1:r.x,y1:r.y,x2:r.x+r.width,y2:r.y+r.height};}
 const V=p.viewportSize();u.x1+=left;let W=Math.min(u.x2-u.x1+2*px,V.width),H=Math.round(W*ratio);if(H>V.height)throw new Error('phoneCrop: too tall '+k);
 let x=Math.min(Math.max(0,(u.x1+u.x2)/2-W/2),V.width-W),y=Math.min(Math.max(0,bottom?u.y2+top-H:u.y1-top),V.height-H);if(u.y2>y+H)console.log(tag,k,'note: parts below',Math.round(y+H),'are cut');const clip={x,y,width:W,height:H};
 const sz=await p.evaluate(([c,ref])=>{const out=[],cut=[];const tw=document.createTreeWalker(document.body,NodeFilter.SHOW_TEXT);let n;while(n=tw.nextNode()){const t=n.textContent.trim();if(!t)continue;const e=n.parentElement;if(!e.offsetParent&&getComputedStyle(e).position!=='fixed')continue;const rg=document.createRange();rg.selectNodeContents(n);const rb=rg.getBoundingClientRect(),b={left:rb.left,right:rb.right,top:rb.top,bottom:rb.bottom,width:rb.width};for(let a=e;a&&a!==document.body;a=a.parentElement){const ov=getComputedStyle(a).overflowX;if(ov!=='visible'){const ab=a.getBoundingClientRect();b.left=Math.max(b.left,ab.left);b.right=Math.min(b.right,ab.right);}}b.width=Math.max(0,b.right-b.left);if(!b.width||b.left>=c.x+c.width||b.right<=c.x||b.top>=c.y+c.height||b.bottom<=c.y)continue;const st=getComputedStyle(e);if(st.visibility==='hidden'||+st.opacity===0)continue;if(e.closest('#pickm, #side')&&(b.left<c.x-.5||b.right>c.x+c.width+.5))cut.push(t.slice(0,24)+" ["+Math.round(b.left-c.x)+","+Math.round(c.x+c.width-b.right)+"]");out.push([parseFloat(st.fontSize)*ref/c.width,t.slice(0,24)]);}return {out:out.sort((a,b)=>a[0]-b[0]),cut};},[clip,ref]);
 if(sz.cut.length)throw new Error(tag+' '+k+': the window cuts text at the side: '+sz.cut.join(' | '));
 console.log(tag,k,JSON.stringify(clip),'text at',ref,'CSS px wide:',sz.out.map(x=>x[0].toFixed(1)+' '+x[1]).join(' | '));
 return p.screenshot({clip});}
const VIEW={ratio:16/9,ref:374,tag:'view'};

(async()=>{const b=await chromium.launch({executablePath:process.env.CHROME||'/usr/bin/google-chrome',args:['--no-sandbox','--allow-file-access-from-files']});
async function editor(vp){const ctx=await b.newContext({viewport:vp||{width:1280,height:800},deviceScaleFactor:4});
 await ctx.addInitScript(()=>{try{if(!sessionStorage.getItem('x')){localStorage.clear();localStorage.setItem('dy-mode','demo');sessionStorage.setItem('x','1');}}catch(e){}});
 // serve the demo site refilled with the current /web wording (site/brand/editor-demo.js) in place of the repo-root demo page
 await ctx.route(u=>(/\/index\.html$/.test(u.pathname)||/\/content\.json$/.test(u.pathname))&&!/\/admin\//.test(u.pathname),r=>{const f=/\.json$/.test(new URL(r.request().url()).pathname)?'content.json':'index.html';r.fulfill({path:path.join(__dirname,'editor-demo',f),contentType:f==='index.html'?'text/html; charset=utf-8':'application/json'});});
 // the demo site's header logo: the Shift logo, option 1 (on-light for the light header, on-dark for dark tones), in place of the old lowercase wordmark
 await ctx.route(u=>/\/assets\/logos\/logo-[a-z0-9-]+-(light|dark)\.svg$/.test(u.pathname),r=>{const d=/-dark\.svg$/.test(new URL(r.request().url()).pathname);r.fulfill({path:path.join(LOGO,d?'lockup-on-dark.svg':'lockup-on-light.svg'),contentType:'image/svg+xml'});});
 const p=await ctx.newPage();const errs=[];p.on('pageerror',e=>errs.push(e.message));
 await p.goto(BASE+'/admin/');await p.waitForFunction(()=>window.DYE&&window.DYE.state().content);await p.waitForTimeout(2500);
 return {ctx,p,errs,F:()=>p.frame({url:/edit=1/})};}
const shots={},phones={},views={};
{// reorder
 const {ctx,p,errs,F}=await editor();
 await F().evaluate(()=>{const s=document.querySelector('#how');window.scrollTo(0,s.offsetTop-70)});await p.waitForTimeout(400);
 await F().locator('#how h2').click();await p.waitForTimeout(400);await p.keyboard.press('Escape');await p.waitForTimeout(300);
 await p.locator('#selbar button:has-text("Reorder")').last().click();await p.waitForSelector('#side:not([hidden]) .rlist');await p.waitForTimeout(400);
 const h=await p.locator('#side .ritem .rh').nth(2).boundingBox(),t=await p.locator('#side .ritem').nth(1).boundingBox();
 await p.mouse.move(h.x+h.width/2,h.y+h.height/2);await p.mouse.down();
 for(let i=1;i<=8;i++){await p.mouse.move(h.x+h.width/2+6,h.y+h.height/2-(h.y-t.y+10)*i/8);await p.waitForTimeout(40);}
 await p.waitForTimeout(300);
 if(!(await p.locator('.ritem.drag').count()))throw new Error('reorder: no row being dragged');
 shots.reorder=await crop(p,'#side',820,1);phones.reorder=await phoneCrop(p,'reorder',(process.env.PR||'#side .sidehd').split(','));views.reorder=await phoneCrop(p,'reorder',['#side .sidehd'],{...VIEW,left:10});
 await p.mouse.up();await p.waitForTimeout(1200);
 const ord=await F().evaluate(()=>[...document.querySelectorAll('section[id]')].map(s=>s.id).slice(0,3).join());
 if(ord!=='top,how,what')throw new Error('reorder: drag did not move the section ('+ord+')');
 if(errs.length)throw new Error(errs.join(' | '));await ctx.close();}
{// add a section
 const {ctx,p,errs,F}=await editor();
 await F().evaluate(()=>{const s=document.querySelector('#how');window.scrollTo(0,s.offsetTop-260)});await p.waitForTimeout(400);
 await F().locator('#how').locator('xpath=preceding-sibling::*[contains(@class,"dy-addsec")][1]//button').click({force:true});
 await p.waitForSelector('#pickm:not([hidden])');await p.waitForTimeout(300);
 await p.locator('#pickm button').filter({hasText:'Text + image'}).first().hover();await p.waitForTimeout(300);
 shots.add=await crop(p,'#pickm .mc',960);
 if(errs.length)throw new Error(errs.join(' | '));await ctx.close();}
{// add a section, phone versions: the same steps in phone-sized windows, so the window's own narrow layout is shown.
 // card (<760px): a 280x720 window, cropped to the Add a section window only (no editor toolbar above it), so its text reads at about 15px on a 390 phone;
 // viewer (<760px): a 360x720 window, tall 9:16 crop of the Add a section window (title, hint and the first layouts).
 for(const [w,o,dst] of [[280,{top:0},phones],[360,{...VIEW,top:0},views]]){const {ctx,p,errs,F}=await editor({width:w,height:720});
 await F().evaluate(()=>{const s=document.querySelector('#how');window.scrollTo(0,s.offsetTop-260)});await p.waitForTimeout(400);
 await F().locator('#how').locator('xpath=preceding-sibling::*[contains(@class,"dy-addsec")][1]//button').click({force:true});
 await p.waitForSelector('#pickm:not([hidden])');await p.waitForTimeout(300);
 await p.locator('#pickm button').filter({hasText:'Text + image'}).first().hover();await p.waitForTimeout(300);
 dst.add=await phoneCrop(p,'add',(process.env.PA||'#pickm .mc').split(','),o);
 if(errs.length)throw new Error(errs.join(' | '));await ctx.close();}}
{// change a picture
 const {ctx,p,errs,F}=await editor();
 await F().evaluate(()=>{const e=document.querySelector('#what .eyebrow'),n=document.querySelector('header').getBoundingClientRect().height;window.scrollTo(0,e.getBoundingClientRect().top+window.scrollY-n-24)});await p.waitForTimeout(400);
 const before=await F().evaluate(()=>document.querySelector('#what .card img').currentSrc);
 await F().locator('#what .card img').first().click();await p.waitForSelector('#side:not([hidden])');await p.waitForTimeout(300);
 await p.locator('#side input[type=file]').first().setInputFiles(path.join(ROOT,'site/img/concept-cafe-2400.png'));await p.waitForTimeout(1800);
 const after=await F().evaluate(()=>document.querySelector('#what .card img').currentSrc);
 if(after===before||!/^data:image/.test(after))throw new Error('image: picture was not replaced');
 // describe the new picture in the panel's own field (the café concept's alt text from config)
 const alt=C.concepts.items.find(c=>c.key==='cafe').alt;const fld=p.locator('#side input:not([type=file]), #side textarea').first();await fld.fill(alt);await fld.press('Tab');await p.waitForTimeout(500);
 if((await F().evaluate(()=>document.querySelector('#what .card img').alt))!==alt)throw new Error('image: description was not saved');
 shots.image=await crop(p,'#side',960,1);phones.image=await phoneCrop(p,'image',(process.env.PI||'#side .sidehd,#side button:has-text("Original picture")').split(','),{bottom:true});views.image=await phoneCrop(p,'image',['#side .sidehd','#side button:has-text("Original picture")'],{...VIEW,left:10,bottom:true});
 if(errs.length)throw new Error(errs.join(' | '));await ctx.close();}
const fp=await b.newPage({viewport:{width:1200,height:800},deviceScaleFactor:2});
for(const k of Object.keys(phones))require('fs').writeFileSync(`/tmp/emock-${k}-phone-raw.png`,phones[k]);
for(const k of Object.keys(views))require('fs').writeFileSync(`/tmp/emock-${k}-view-raw.png`,views[k]);
for(const k of Object.keys(shots)){const raw=`/tmp/eraw-${k}.png`;require('fs').writeFileSync(raw,shots[k]);
 await fp.goto('file://'+path.join(__dirname,'editor.html')+'?img='+encodeURIComponent('file://'+raw)+'&label='+encodeURIComponent(C.editorGallery.label));
 await fp.evaluate(async()=>{await document.fonts.load('500 14px IT');const i=document.getElementById('s');if(!i.complete)await new Promise(r=>i.onload=r);});
 if(!(await fp.evaluate(()=>document.fonts.check('500 14px IT'))))throw new Error('font not loaded');
 await fp.screenshot({path:`/tmp/emock-${k}-raw.png`});console.log('rendered',k);}
await b.close()})().catch(e=>{console.error(e.message);process.exit(1);});
