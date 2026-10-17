/* Shared content editor: one place to edit content that appears on several pages. Edits go through DYE.change, so undo, drafts, preview and publish treat them like any other change. */
(function(){
var D=document,$=function(s){return D.querySelector(s);};
var DEFS={
 testimonials:{title:'Results and testimonials',note:'Each entry needs a permission flag. Leave it on “pending” until the person has said yes. Brackets like [QUOTE TBC] show on the page as marked placeholders.',path:'testimonials',kind:'list',label:function(t){return (t.name||'New entry')+(t.permission==='approved'?'':' · permission pending');},blank:function(){return {id:'t'+Date.now().toString(36),name:'New name',role:'',quote:'[QUOTE TBC]',result:'[FIGURE TBC]',link:'[Link: before and after]',permission:'pending'};},
  fields:[['name','Name','text'],['role','Who they are (for example: comedian)','text'],['quote','Quote (keep the brackets until a real quote is approved)','area'],['result','Results line (only once real numbers exist)','text'],['link','Before and after link (or keep the bracket)','text'],['permission','Permission to show this','select',[['pending','Pending'],['approved','Approved']]]]},
 refresh:{title:'Price: Website Refresh',note:'Leave the price empty and the card shows [PRICE TBC]. Only type a price after owner has approved it.',path:'prices.refresh',kind:'object',fields:[['amount','Price (empty until approved)','text'],['small','Small print under the price','text']]},
 support:{title:'Price: Ongoing Support',note:'Leave the price empty and the card shows [PRICE TBC per month]. Only type a price after owner has approved it.',path:'prices.support',kind:'object',fields:[['amount','Price per month (empty until approved)','text'],['small','Small print under the price','text']]},
 terms:{title:'VAT and cancellation',note:'Empty slots. They show as marked placeholders until wording has been approved.',path:'prices',kind:'object',fields:[['vat','VAT line','text'],['cancellation','Cancellation line','text']]},
 contact:{title:'Contact details',note:'Empty values show as marked placeholders. A phone number turns the call link on.',path:'contact',kind:'object',fields:[['email','Email','text'],['phone','Phone','text'],['location','Location','text'],['replyTime','Reply time (for example: within 2 working days)','text']]},
 brand:{title:'Logo',note:'Pick the logo direction. The files are in assets/logos.',path:'brand',kind:'object',fields:[['logo','Logo direction','select',[['A','A: peak with spark'],['B','B: rising chevrons'],['C','C: rounded badge']]]]}
};
var OPEN={},GEN=0;
var ORDER=['testimonials','refresh','support','terms','contact','brand'],cur='testimonials',modal=null;
function get(o,p){return p.split('.').reduce(function(a,k){return a==null?a:a[k];},o);}
function put(o,p,v){var a=p.split('.'),l=a.pop();a.forEach(function(k){o=o[k]=o[k]||{};});o[l]=v;}
function root(c,p){var a=p.split('.'),o=c;for(var i=0;i<a.length;i++){if(o[a[i]]==null)o[a[i]]=(i===a.length-1&&DEFS[cur]&&DEFS[cur].kind==='list')?[]:{};o=o[a[i]];}return o;}
function C(){return DYE.state().content;}
function IMG(p){var r=DYE.resolve(p);return /^(https?:|data:|blob:|\/|\.\.\/)/.test(r)?r:'../'+r;}
var MONS=['jan','feb','mar','apr','may','jun','jul','aug','sep','oct','nov','dec'];
/* typed dates: 2026-12-10, 10/12/2026, 10 Dec 2026, 10th December, Dec 10 2026 (no year = the year of the old date, else this year). Returns YYYY-MM-DD or '' */
function parseDate(t,old){t=String(t||'').trim().toLowerCase().replace(/(\d)(st|nd|rd|th)\b/g,'$1').replace(/[,.]/g,' ').replace(/\s+/g,' ').trim().replace(/^(mon|tue|tues|wed|thu|thur|thurs|fri|sat|sun)[a-z]*\.? /,'').replace(/ (mon|tue|tues|wed|thu|thur|thurs|fri|sat|sun)[a-z]*$/,'');var y=null,m=null,d=null,r;
  if((r=t.match(/^(\d{4})-(\d{1,2})-(\d{1,2})$/))){y=+r[1];m=+r[2];d=+r[3];}
  else if((r=t.match(/^(\d{1,2})[\/\- ](\d{1,2})(?:[\/\- ](\d{2,4}))?$/))){d=+r[1];m=+r[2];y=r[3]?+r[3]:null;}
  else if((r=t.match(/^(?:[a-z]+day )?(\d{1,2}) ([a-z]{3,9})(?: (\d{2,4}))?$/))){d=+r[1];m=MONS.indexOf(r[2].slice(0,3))+1;y=r[3]?+r[3]:null;}
  else if((r=t.match(/^(?:[a-z]+day )?([a-z]{3,9}) (\d{1,2})(?: (\d{2,4}))?$/))){m=MONS.indexOf(r[1].slice(0,3))+1;d=+r[2];y=r[3]?+r[3]:null;}
  else return '';
  if(y!=null&&y<100)y+=2000;if(y==null)y=/^\d{4}/.test(old||'')?+old.slice(0,4):new Date().getFullYear();
  if(!(m>=1&&m<=12&&d>=1&&d<=31))return '';var dt=new Date(Date.UTC(y,m-1,d));if(dt.getUTCMonth()!==m-1)return '';return y+'-'+(m<10?'0':'')+m+'-'+(d<10?'0':'')+d;}
window.DYE.parseDate=parseDate;
function el(t,cls,h){var e=D.createElement(t);if(cls)e.className=cls;if(h!=null)e.innerHTML=h;return e;}
function esc(s){return String(s==null?'':s).replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/"/g,'&quot;');}
function build(){modal=el('div','modal');modal.id='sharedm';modal.hidden=true;modal.innerHTML='<div class="mc wide"><button class="x" data-sclose aria-label="Close">✕</button><h2>Shared content</h2><p class="hint">Things that show on more than one page are edited here once. Changes appear everywhere they are used.</p><div class="shtabs" role="tablist"></div><div class="shbody"></div><div class="row"><button class="btn red" data-sclose>Done</button></div></div>';
  D.body.appendChild(modal);modal.onclick=function(e){if(e.target===modal||e.target.closest('[data-sclose]'))modal.hidden=true;};
  D.addEventListener('keydown',function(e){if(e.key==='Escape'&&modal&&!modal.hidden)modal.hidden=true;});}
function fieldEl(def,f,obj,onSet){var k=f[0],lab=f[1],ty=f[2],wrap=el('label','shf'),v=get(obj,k),inp;wrap.appendChild(el('span','',lab));
  if(ty==='bool'){inp=el('input');inp.type='checkbox';inp.checked=!!v;inp.onchange=function(){onSet(k,inp.checked);};wrap.className='shf chk';wrap.insertBefore(inp,wrap.firstChild);return wrap;}
  if(ty==='select'){inp=el('select');f[3].forEach(function(o){var op=el('option','',esc(o[1]));op.value=o[0];inp.appendChild(op);});inp.value=v||f[3][0][0];inp.onchange=function(){onSet(k,inp.value);};wrap.appendChild(inp);return wrap;}
  if(ty==='area'||ty==='lines'){inp=el('textarea');inp.maxLength=12000;inp.rows=ty==='lines'?6:3;inp.value=ty==='lines'?(v||[]).map(function(x){return (x.home?'*':'')+x.t;}).join('\n'):(v||'');
    inp.onchange=function(){onSet(k,ty==='lines'?inp.value.split('\n').map(function(l){return l.trim();}).filter(Boolean).map(function(l){var h=l.charAt(0)==='*';return {t:h?l.slice(1).trim():l,home:h};}):inp.value);};wrap.appendChild(inp);return wrap;}
  if(ty==='img'){var row=el('div','shimg'),im=el('img');im.alt='';im.src=v?IMG(v):'';im.hidden=!v;inp=el('input');inp.type='text';inp.value=v||'';inp.placeholder='assets/…';var up=el('button','btn ghost sm','Choose picture…');up.type='button';
    var fi=el('input');fi.type='file';fi.accept='image/*';fi.hidden=true;up.onclick=function(){fi.click();};fi.onchange=function(){if(!fi.files[0])return;DYE.upload(fi.files[0],1400).then(function(p){inp.value=p;im.src=IMG(p);im.hidden=false;onSet(k,p);}).catch(function(e){DYE.toast(e.message);});};
    inp.onchange=function(){im.src=inp.value?IMG(inp.value):'';im.hidden=!inp.value;onSet(k,inp.value.trim());};row.appendChild(im);row.appendChild(inp);row.appendChild(up);row.appendChild(fi);wrap.appendChild(row);return wrap;}
  if(ty==='date'){var drow=el('div','shdate'),pick=el('input'),msg=el('small','shmsg','');inp=el('input');inp.type='text';inp.value=v||'';inp.placeholder='e.g. Fri 4th Dec, 4 Dec 2026 or 04/12/2026';inp.setAttribute('aria-label',lab);pick.type='date';pick.value=/^\d{4}-\d\d-\d\d$/.test(v||'')?v:'';pick.title='Pick from a calendar';pick.setAttribute('aria-label',lab+' calendar');
    inp.onchange=function(){var iso=parseDate(inp.value,v);if(!iso){msg.textContent='I couldn’t read that date. Try Fri 4th Dec, 4 Dec 2026 or 04/12/2026.';msg.className='shmsg err';return;}msg.textContent=iso!==inp.value.trim()?'Saved as '+iso:'';msg.className='shmsg';inp.value=iso;pick.value=iso;v=iso;onSet(k,iso);};
    pick.onchange=function(){if(pick.value){inp.value=pick.value;inp.onchange();}};drow.appendChild(inp);drow.appendChild(pick);wrap.appendChild(drow);wrap.appendChild(msg);return wrap;}
  inp=el('input');inp.maxLength=ty==='url'?500:(f[3]||160);inp.type=ty==='url'?'url':'text';inp.value=ty==='csv'?(v||[]).join(', '):(v||'');
  inp.onchange=function(){onSet(k,ty==='csv'?inp.value.split(',').map(function(s){return s.trim();}).filter(Boolean):inp.value.trim());};wrap.appendChild(inp);return wrap;}
function render(keepIdx){var def=DEFS[cur],tabs=modal.querySelector('.shtabs'),body=modal.querySelector('.shbody');tabs.innerHTML='';var sc=modal.scrollTop,os=OPEN[cur]=OPEN[cur]||[],myGen=++GEN;
  ORDER.forEach(function(k){var b=el('button','shtab'+(k===cur?' on':''),esc(DEFS[k].title));b.type='button';b.setAttribute('role','tab');b.onclick=function(){cur=k;render();};tabs.appendChild(b);});
  body.innerHTML='';body.appendChild(el('p','hint',esc(def.note)));
  function change(fn){DYE.change(function(c){fn(c);},{reload:true});}
  function set(path,idx,k,v,sort){if(myGen!==GEN)return; /* a stale row (already re-drawn after a re-sort) must never edit another show */var ni=idx;
    change(function(c){var arr=idx==null?null:root(c,path),o=idx==null?root(c,path):arr[idx];put(o,k,v);
      if(sort&&k===sort&&arr){var dir=def.desc?-1:1,t=arr.map(function(x,n){return {x:x,n:n};});
        t.sort(function(a,b){var ka=String(a.x[sort]||(def.desc?'':'9999')),kb=String(b.x[sort]||(def.desc?'':'9999'));return ka<kb?-dir:ka>kb?dir:a.n-b.n;});
        t.forEach(function(e,n){arr[n]=e.x;});ni=arr.indexOf(o);}});
    if(sort&&k===sort&&idx!=null){if(ni!==idx)os.splice(ni,0,!!os.splice(idx,1)[0]);for(var q=0;q<os.length;q++)os[q]=false;os[ni]=true;render(ni);}}
  if(def.kind==='object'){var o=get(C(),def.path)||{},card=el('div','shrow');def.fields.forEach(function(f){card.appendChild(fieldEl(def,f,o,function(k,v){set(def.path,null,k,v);}));});body.appendChild(card);return;}
  var list=get(C(),def.path)||[];
  list.forEach(function(it,i){var d=el('details','shrow'),sm=el('summary','',esc(def.label(it)));d.open=!!os[i];d.addEventListener('toggle',function(){os[i]=d.open;});d.appendChild(sm);var tools=el('div','shtools','<button type="button" data-up title="Move up">↑</button><button type="button" data-dn title="Move down">↓</button><button type="button" data-del title="Delete">Delete</button>');
    d.appendChild(tools);def.fields.forEach(function(f){d.appendChild(fieldEl(def,f,it,function(k,v){set(def.path,i,k,v,def.sort);sm.textContent=def.label(get(C(),def.path)[i]||it);if(k==='title'&&!String(v||'').trim())DYE.toast('This one has no title yet. Please type one before you publish.',5000);}));});
    tools.querySelector('[data-up]').onclick=function(){if(i>0){change(function(c){var a=root(c,def.path);a.splice(i-1,0,a.splice(i,1)[0]);});os.splice(i-1,0,!!os.splice(i,1)[0]);render();}};
    tools.querySelector('[data-dn]').onclick=function(){if(i<list.length-1){change(function(c){var a=root(c,def.path);a.splice(i+1,0,a.splice(i,1)[0]);});os.splice(i+1,0,!!os.splice(i,1)[0]);render();}};
    tools.querySelector('[data-del]').onclick=function(){DYE.dialog({title:'Delete this?',text:'“'+def.label(it)+'” will be removed everywhere it is used.',ok:'Delete',cancel:'Keep it'}).then(function(r){if(r.ok){change(function(c){root(c,def.path).splice(i,1);});os.splice(i,1);render();}});};
    body.appendChild(d);});
  var add=el('button','btn gold sm','+ Add');add.type='button';add.onclick=function(){var n0=list.length;change(function(c){root(c,def.path).push(def.blank());});os[n0]=true;render();var ds=body.querySelectorAll('details');if(ds.length)ds[ds.length-1].scrollIntoView({block:'nearest'});};body.appendChild(add);modal.scrollTop=sc;if(keepIdx!=null){var kd=body.querySelectorAll('details')[keepIdx];if(kd){try{kd.scrollIntoView({block:'nearest'});var fi=kd.querySelector('input,textarea');}catch(e){}}}
  if(def.extra){var ex=def.extra,o2=get(C(),ex.path)||{},card=el('div','shrow');card.appendChild(el('h3','',esc(ex.title)));ex.fields.forEach(function(f){card.appendChild(fieldEl(def,f,o2,function(k,v){change(function(c){put(root(c,ex.path),k,v);});}));});body.appendChild(card);}}
window.DYE.openShared=function(key){if(!modal)build();if(key&&DEFS[key])cur=key;render();modal.hidden=false;};
window.DYE.sharedDefs=DEFS;
D.addEventListener('DOMContentLoaded',function(){var b=$('#sharedb');if(b)b.onclick=function(){DYE.openShared();};});
})();
