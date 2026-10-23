// Render the share image and icons from the HTML templates in this folder with Playwright (real self-hosted fonts).
// node site/brand/render.js  -> site/static/og.png, favicon.ico (16+32), apple-touch-icon.png (180). build.js copies site/static/* to dist/.
const {chromium}=require('playwright'),fs=require('fs'),path=require('path');
const here=__dirname,out=path.join(here,'..','static');fs.mkdirSync(out,{recursive:true});
const url=f=>'file://'+path.join(here,f);
// ICO with PNG-encoded entries (valid since Windows Vista, supported by all current browsers)
const ico=imgs=>{const h=Buffer.alloc(6+16*imgs.length);h.writeUInt16LE(0,0);h.writeUInt16LE(1,2);h.writeUInt16LE(imgs.length,4);let off=h.length;
 imgs.forEach(([s,png],k)=>{const e=6+16*k;h.writeUInt8(s>=256?0:s,e);h.writeUInt8(s>=256?0:s,e+1);h.writeUInt8(0,e+2);h.writeUInt8(0,e+3);h.writeUInt16LE(1,e+4);h.writeUInt16LE(32,e+6);h.writeUInt32LE(png.length,e+8);h.writeUInt32LE(off,e+12);off+=png.length;});
 return Buffer.concat([h,...imgs.map(x=>x[1])]);};
(async()=>{const b=await chromium.launch({executablePath:process.env.CHROME||'/usr/bin/google-chrome',args:['--no-sandbox','--allow-file-access-from-files']});
 const p=await (await b.newContext({viewport:{width:1200,height:630},deviceScaleFactor:1})).newPage();
 await p.goto(url('og.html'));await p.evaluate(()=>document.fonts.ready);
 const fonts=await p.evaluate(()=>['700 10px "Space Grotesk"','italic 400 10px "Instrument Serif"','500 10px "Inter Tight"'].map(f=>document.fonts.check(f)));
 if(!fonts.every(Boolean))throw new Error('share image fonts not loaded '+fonts);
 await p.screenshot({path:path.join(out,'og.png'),clip:{x:0,y:0,width:1200,height:630}});
 const icon=async(s,r)=>{await p.setViewportSize({width:s,height:s});await p.goto(url('icon.html')+`?s=${s}${r?'&r=1':''}`);return p.screenshot({clip:{x:0,y:0,width:s,height:s},omitBackground:true});};
 fs.writeFileSync(path.join(out,'favicon.ico'),ico([[16,await icon(16,true)],[32,await icon(32,true)]]));
 fs.writeFileSync(path.join(out,'apple-touch-icon.png'),await icon(180,false));
 await b.close();for(const f of fs.readdirSync(out))console.log(f,fs.statSync(path.join(out,f)).size+' bytes');})();
