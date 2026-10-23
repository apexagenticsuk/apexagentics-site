// Renders the three example form mock-ups (forms.html, wording from site-config.json) to PNG at 2x,
// then site/brand/forms-img.py writes optimised WebP (600w, 1200w) and PNG (1200w) to site/img.
const {chromium}=require('playwright');const path=require('path');const C=require('../../site-config.json');
(async()=>{const b=await chromium.launch({executablePath:process.env.CHROME||'/usr/bin/google-chrome',args:['--no-sandbox','--allow-file-access-from-files']});
const p=await b.newPage({viewport:{width:600,height:780},deviceScaleFactor:2});
const brand=C.concepts.items.find(c=>c.key==='cafe').name;
for(const x of C.otherServices.examples){await p.goto('file://'+path.join(__dirname,'forms.html'));await p.evaluate(([x,b])=>window.render(x,b),[x,brand]);
 await p.evaluate(()=>document.fonts.ready);const ok=await p.evaluate(()=>[...document.fonts].every(f=>f.status!=='error'));if(!ok)throw new Error('font failed');
 await p.screenshot({path:`/tmp/form-${x.id}-raw.png`});console.log('rendered',x.id)}
await b.close()})();
