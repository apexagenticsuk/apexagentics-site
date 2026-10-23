// Playwright: the How it works line must reach the end of the rule (within 1px) once scrolled, at 1280 and 375px,
// and the end dot must be lit. Usage: node tests/steps-line.js [baseUrl of dist]
const {chromium}=require('playwright');const BASE=process.argv[2]||'http://localhost:8851';let fail=0;
const ok=(n,c,x)=>{console.log((c?'PASS ':'FAIL ')+n+(x?' -> '+x:''));if(!c)fail++;};
(async()=>{const b=await chromium.launch({executablePath:'/usr/bin/google-chrome',args:['--no-sandbox']});
for(const [n,vp,rm] of [['1280',{width:1280,height:800},'no-preference'],['375',{width:375,height:812},'no-preference'],['375 reduced',{width:375,height:812},'reduce']]){
 const p=await b.newPage({viewport:vp,reducedMotion:rm});await p.goto(BASE+'/web/');await p.waitForTimeout(1000);
 for(let i=0;i<120;i++){const t=await p.evaluate(()=>document.querySelector('.steps-wrap').getBoundingClientRect().bottom);if(t<innerHeightSafe(vp))break;await p.mouse.wheel(0,200);await p.waitForTimeout(60);}
 await p.waitForTimeout(1200);
 const r=await p.evaluate(()=>{const lis=[...document.querySelectorAll('.steps.big li')];const last=lis[lis.length-1];const line=last.querySelector('.sline').getBoundingClientRect(),rule=last.getBoundingClientRect();const first=lis[0].querySelector('.sline').getBoundingClientRect();const end=getComputedStyle(last.querySelector('.sdot.end')).backgroundColor;return {lineRight:+line.right.toFixed(1),ruleRight:+rule.right.toFixed(1),lineLeft:+first.left.toFixed(1),ruleLeft:+lis[0].getBoundingClientRect().left.toFixed(1),endDot:end}});
 ok(`${n}: line right edge ${r.lineRight} vs rule ${r.ruleRight} (within 1px)`,Math.abs(r.lineRight-r.ruleRight)<=1);
 ok(`${n}: line starts at rule start (${r.lineLeft} vs ${r.ruleLeft})`,Math.abs(r.lineLeft-r.ruleLeft)<=1);
 ok(`${n}: end dot lit`,r.endDot==='rgb(124, 255, 178)',r.endDot);
 await p.close();}
await b.close();process.exit(fail?1:0);})();
function innerHeightSafe(vp){return vp.height*0.6;}
