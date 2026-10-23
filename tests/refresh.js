// Refresh build tests (Jim's plan step 8 + Ben's privacy page). Builds dist/ then fails on any rule break.
// Allowed exception: the exact string 'Email coming soon' (contact placeholder, data-allow) is the ONLY permitted 'coming soon'.
const fs=require('fs'),path=require('path'),{execFileSync}=require('child_process');
const root=path.join(__dirname,'..'),dist=path.join(root,'dist');let fail=0;
const ok=(n,c,x)=>{console.log((c?'PASS ':'FAIL ')+n+(c||!x?'':' -> '+x));if(!c)fail++;};
execFileSync('node',[path.join(root,'site/build.js'),dist]);
const C=JSON.parse(fs.readFileSync(path.join(root,'site-config.json'),'utf8'));
const walk=(d,o=[])=>{for(const f of fs.readdirSync(d)){if(['node_modules','.git'].includes(f))continue;const p=path.join(d,f);fs.statSync(p).isDirectory()?walk(p,o):o.push(p);}return o;};
// The Web division lives under /web/: old checks run on web/index.html, web/privacy.html and the site-wide 404.
const pages=['web/index.html','web/privacy.html','404.html'].map(f=>[f,fs.readFileSync(path.join(dist,f),'utf8')]);
const text=s=>s.replace(/<script[\s\S]*?<\/script>/g,' ').replace(/<[^>]+>/g,' ');
// price in HTML not from config: every £ figure must sit inside a data-price span, and the template has none
const tpl=fs.readFileSync(path.join(root,'site/build.js'),'utf8');
ok('no £ price hard-coded in template',!/£\s?\d/.test(tpl));
for(const [f,s] of pages){const stray=s.replace(/<span class="price"[^>]*>[\s\S]*?<\/span>(\s*<span class="prov">Estimate<\/span>)?/g,'');ok(f+': no price outside config price spans',!/£\s?\d|\[PRICE/.test(stray));}
const idx=pages[0][1];
// No estimates: no provisional price in config and the word 'Estimate' nowhere in the pricing or forms sections (markup or text).
{const secs=['prices','forms'].map(id=>(idx.match(new RegExp('<section id="'+id+'"[\\s\\S]*?<\\/section>'))||[''])[0]);
 ok('pricing and forms sections exist and contain no "Estimate" (any case)',secs.every(x=>x.length>0)&&secs.every(x=>!/estimate/i.test(x)));
 ok('no provisional price left in config or built page',![...Object.values(C.prices),...C.formAddons].some(v=>v&&v.provisional)&&!/data-provisional|class="prov">/.test(idx));}
for(const [f,s] of pages){const t=text(s);ok(f+': no "testimonial"',!/testimonial/i.test(t)&&!/testimonial/i.test(s));
 const cs=(t.match(/coming soon/gi)||[]).length,allowed=(t.match(/Email coming soon/g)||[]).length;ok(f+': "coming soon" only in contact placeholder',cs===allowed&&allowed<=1&&(f!=='web/index.html'||C.trader.email.value||/data-allow="contact-placeholder">Email coming soon</.test(s)));
 ok(f+': no "refresh of" near Dave Young',!/refresh of[\s\S]{0,200}Dave Young|Dave Young[\s\S]{0,200}refresh of/i.test(t));
 ok(f+(f==='404.html'?': error page keeps noindex':': public mode, no robots meta (indexable)'),C.public===true&&(f==='404.html'?/<meta name="robots" content="noindex, nofollow">/.test(s):!/name="robots"/.test(s)));}
ok('robots.txt: old repo-root site still Disallow: /, dist allows crawling with Sitemap line',/User-agent: \*\s*\nDisallow: \/\s*$/m.test(fs.readFileSync(path.join(root,'robots.txt'),'utf8'))&&fs.readFileSync(path.join(dist,'robots.txt'),'utf8')==='User-agent: *\nAllow: /\n\nSitemap: https://apexagentics.co.uk/sitemap.xml\n');
ok('privacy page exists at web/privacy.html and links from footer',fs.existsSync(path.join(dist,'web/privacy.html'))&&/<footer[\s\S]*href="\/web\/privacy"/.test(idx)&&!/privacy\.html/.test(idx));
if(!C.flags.daveYoungApproved){const hits=walk(dist).filter(f=>/dave/i.test(path.basename(f))||/Dave Young/i.test(fs.readFileSync(f,'latin1')));ok('flag false: no Dave Young name or screenshots in dist',hits.length===0,hits.join());}
{const btns=[...idx.matchAll(/<button\b[^>]*>/g)].map(m=>m[0]);const ex=(idx.match(/<div class="exform"[\s\S]*?<\/div>/g)||[]);
ok('no form that can submit (no <form>, no submit, no name=, every button is type=button inside an Example form)',!/<form|type="submit"|<(input|textarea|select)[^>]*\sname=|\saction=/i.test(idx)&&btns.length===2&&btns.every(b=>/type="button"/.test(b))&&ex.length===2&&ex.every(x=>/<button type="button"/.test(x)&&/class="ctag below">Example</.test(x)));}
for(const [f,s] of pages){const credit=' credit lasts '+C.prices.creditDays+' days from when we send your report.';const t=text(s).replace('How long we keep it','').split(credit).join(' ');/* only exemptions: the privacy retention heading and the check-credit window sentence from config */ok(f+': no timeframe text',!/\b\d+\s*(-|to)?\s*\d*\s*(working\s+)?(hours?|days?|weeks?|months?)\b|timescale|how long|turnaround|within a/i.test(t));
 if(!C.flags.showLegalLine)ok(f+': legal line/owner placeholders hidden',!/\[OWNER NAME\]|\[POSTAL ADDRESS\]|\[RESPONSIBLE PERSON\]|trading name of/.test(s));}
ok('no bare "Apex"',!pages.some(([f,s])=>/\bApex\b(?!\s+Agentics)/.test(text(s))));
const tokRe=/(gh[pousr]_[A-Za-z0-9]{20,}|github_pat_[A-Za-z0-9_]{20,}|sk-[A-Za-z0-9]{20,}|AKIA[0-9A-Z]{16}|xox[baprs]-[A-Za-z0-9-]{10,}|-----BEGIN [A-Z ]*PRIVATE KEY|CLOUDFLARE_API_TOKEN=\S{20,})/;
const bad=walk(root).filter(f=>/\.(html|js|json|css|md|sh|py|txt|svg|env)$/.test(f)&&!/package-lock/.test(f)&&f!==__filename&&tokRe.test(fs.readFileSync(f,'utf8')));ok('no token-like strings in repo',bad.length===0,bad.join());
{const leaks=walk(dist).filter(f=>/\.(html|css|txt)$/.test(f)).filter(f=>{const s=text(fs.readFileSync(f,'utf8'));return /\[[A-Z][A-Z0-9 :_.-]*\]|TBC/.test(s)});ok('no bracketed placeholder or TBC in dist text',leaks.length===0,leaks.join());}
{const tracked=require('child_process').execFileSync('git',['ls-files'],{cwd:root,encoding:'utf8'}).split('\n').filter(Boolean).map(f=>path.join(root,f));const hits=[...tracked,...walk(dist)].filter(f=>f!==__filename&&fs.existsSync(f)&&new RegExp('ka'+'ne','i').test(fs.readFileSync(f,'latin1')));ok('no owner first name in tracked files or dist (this file skipped)',hits.length===0,hits.join());}
{const bad=walk(dist).filter(f=>/\.html$/.test(f)&&/fixed[ -]price/i.test(fs.readFileSync(f,'utf8')));ok('no "fixed price" wording in dist',bad.length===0,bad.join());}
{const css=fs.readFileSync(path.join(dist,'site.css'),'utf8');const small=[...css.matchAll(/(\.(?:prov|ctag|eyebrow|num|lead-tag)[^{]*)\{[^}]*font-size:(\d+)px/g)].filter(m=>+m[2]<14).map(m=>m[1]+' '+m[2]);ok('badges and tags at least 14px',small.length===0,small.join());}
{const s=fs.readFileSync(path.join(dist,'web/index.html'),'utf8');ok('VAT answer is exactly "No VAT is added to our prices." and the old line is gone',/<summary>Do you add VAT\?<\/summary><p>No VAT is added to our prices\.<\/p>/.test(s)&&!/not VAT registered|full amount you pay/.test(s));
ok('VAT line under the price cards is exactly "Prices are final. No VAT is added."',C.pricing.vatLine==='Prices are final. No VAT is added.'&&/<\/div><p class="vatline">Prices are final\. No VAT is added\.<\/p>/.test(s)&&(s.match(/Prices are final/g)||[]).length===1);}
{const s=fs.readFileSync(path.join(dist,'web/index.html'),'utf8');const hrefs=[...s.matchAll(/href="([^"]*)">Get in touch</g)].map(m=>m[1]);const want=C.trader.email.value?'mailto:'+C.trader.email.value:'/web/#contact-note';ok('every Get in touch goes to '+want+(C.trader.email.value?'':' and the note exists'),hrefs.length>=2&&hrefs.every(h=>h===want)&&(C.trader.email.value||/id="contact-note"/.test(s)));}
for(const [f,s] of pages){const t=text(s).replace(/&#39;|&quot;/g,"'");const straight=t.match(/\w'\w|'\w|\w'/g);const backwards=t.match(/(^|[\s(])\u2019\w/g);ok(f+': typographic quotes (no straight quotes, no backwards \u2019 at word start)',!straight&&!backwards,(straight||backwards||[]).join(' '));}
{const s=fs.readFileSync(path.join(dist,'web/index.html'),'utf8');const cards=s.split('<article class="wcard"').slice(1);const strip=(s.match(/<section class="cstrip"[\s\S]*?<\/section>/)||[''])[0];
ok('every concept image is labelled Concept (per Work card, phone mock-up, one strip-level label)',cards.length===3&&cards.every(c=>/class="ctag below">Concept</.test(c.split('</article>')[0]))&&/class="phone[^"]*"[\s\S]*?ctag below">Concept</.test(s)&&(strip.match(/ctag below">Concept</g)||[]).length===1&&/strip-label"><span class="ctag below">Concept/.test(strip));}
{const s=fs.readFileSync(path.join(dist,'web/privacy.html'),'utf8');const want=[['What we collect','Your name, email address and what you write when you contact us.'],['Why','We use your details only to reply to your enquiry. We don\u2019t share your details or use them for marketing.'],['How long we keep it','We keep your messages only as long as we need to deal with your enquiry, then delete them.'],['Your rights','You can ask to see or delete your details by emailing us.']];
ok('privacy page has the 4 approved sections word for word',want.every(([h,p])=>s.includes(`<h2>${h}</h2><p>${p}</p>`)));
ok('privacy page: no placeholders or responsible-person/retention leftovers',!/\[[A-Z]|TBC|RESPONSIBLE|RETENTION|Who is responsible/i.test(s));
ok('privacy page: contact line only when email set',C.trader.email.value?s.includes('mailto:'+C.trader.email.value):!/<h2>Contact<\/h2>/.test(s));}
// Contact email: every contact button/link is a mailto to the config email; privacy shows the Contact line; name/legal lines stay hidden.
{const em=C.trader.email.value,mt='mailto:'+em;
 ok('config email is set',typeof em==='string'&&/^[^@\s]+@[^@\s]+\.[a-z]+$/i.test(em));
 ok('name/legal flags stay false',!C.flags.showLegalLine&&!C.flags.ownershipConfirmed&&!C.flags.daveYoungApproved);
 for(const [f,s] of pages){const git=[...s.matchAll(/<a [^>]*href="([^"]*)"[^>]*>Get in touch</g)].map(m=>m[1]);
  ok(f+': header Get in touch is a mailto to the config email',git.length>=1&&git.every(h=>h===mt),git.join());
  ok(f+': footer Contact line links to the config email',new RegExp('<footer[\\s\\S]*<p>Contact: <a href="'+mt+'">'+em+'</a></p>').test(s));
  const others=[...s.matchAll(/href="mailto:([^"]*)"/g)].map(m=>m[1]).filter(x=>x!==em);ok(f+': no mailto to any other address',others.length===0,others.join());
  ok(f+': no contact placeholder link left',!/href="\/(web\/)?#contact-note"/.test(s));
  ok(f+': no owner name or personal account',!new RegExp('ka'+'ne|jin'+'dal|ka'+'nejin'+'dal'+'business','i').test(s));}
 const idx=pages[0][1];
 ok('index: closing Get in touch button is a mailto',new RegExp('<a class="btn big" href="'+mt+'">Get in touch</a>').test(idx));
 ok('index: closing email line is a mailto link',idx.includes('<p class="cmail"><a href="'+mt+'">'+em+'</a></p>'));
 const pv=pages[1][1];
 ok('privacy: Contact line with the email',pv.includes('<h2>Contact</h2><p><a href="'+mt+'">'+em+'</a></p>'));
 ok('privacy: no name/responsible-person line',!/Responsible|Data controller|Who is responsible|\[OWNER NAME\]|\[TRADER NAME\]|\[RESPONSIBLE PERSON\]/i.test(pv)&&!pv.includes(C.trader.ownerName.value));
 ok('privacy: no legal/trading-name line',!/trading name|trading as|t\/a /i.test(text(pv))&&!pv.includes(C.footer.tradingLine));
 ok('privacy: public mode, no noindex',!/name="robots"/.test(pv));}
// Contact email is hello@apexagentics.co.uk: the old webmail address (domain built below so this file stays clean) is in no built file; every mailto on /, /web/, /web/privacy and 404 uses it.
{const HELLO='hello@apexagentics.co.uk',OLD=new RegExp('g'+'mail','i'),files=walk(dist).filter(f=>/\.(html|css|js|json|txt|xml|svg|webmanifest)$|_redirects$/.test(f));
 ok('config email is '+HELLO,C.trader.email.value===HELLO,C.trader.email.value);
 const hits=files.filter(f=>OLD.test(fs.readFileSync(f,'utf8'))).map(f=>path.relative(dist,f));ok('no old webmail address in any built file ('+files.length+' checked)',hits.length===0,hits.join());
 for(const f of ['index.html','web/index.html','web/privacy.html','404.html']){const s=fs.readFileSync(path.join(dist,f),'utf8'),m=[...s.matchAll(/href="mailto:([^"]*)"/g)].map(x=>x[1]);
  ok(f+': has mailto links and all use '+HELLO,m.length>0&&m.every(x=>x===HELLO),m.join());}}
// Pricing (pricing-jim): every £ figure comes from config, no +VAT, no Care tiers or old prices, one Start here badge, stories block empty of quotes/names/stars/logos.
{const all=['index.html','web/index.html','web/privacy.html','404.html'].map(f=>[f,fs.readFileSync(path.join(dist,f),'utf8')]);
 const allowed=new Set([...Object.values(C.prices).filter(v=>v&&v.value).map(v=>v.value),...C.formAddons.map(a=>a.value)]);
 for(const [f,s] of all){const t=text(s)+' '+[...s.matchAll(/content="([^"]*)"/g)].map(m=>m[1]).join(' ');const figs=t.match(/£\s?\d[\d,.]*/g)||[];const bad=figs.filter(x=>!allowed.has(x.replace(/\s/g,'').replace(/[.,]$/,'')));
  ok(f+': every £ figure is a config price ('+figs.length+' found)',bad.length===0,bad.join());
  ok(f+': no "+VAT" or "plus VAT" (any case)',!/\+\s*vat|plus\s+vat/i.test(s));
  ok(f+': no Care tiers or old price labels',!/\bCare\b|Care Plus|£19\b/.test(text(s))&&!/Website build|Deluxe|prices are estimates|Are your prices estimates/i.test(text(s)));
  ok(f+': no free-hosting claims',!/free hosting|free forever|hosting is free|saves? hosting fees/i.test(text(s)));}
 ok('config: Care tiers and old prices removed',!('careTiers' in C)&&!('build' in C.prices)&&!('deluxe' in C.prices));
 const P=C.prices;ok('config: new prices as briefed',P.check.value==='£50'&&P.check.tag==='introductory'&&P.creditDays===30&&P.newSite.value==='£595'&&P.refresh.value==='£495'&&P.monthly.value==='£39'&&P.changesMinutes===30&&P.domain.value==='£10'&&P.domain.unit==='a year');
 ok('form add-on prices unchanged (Simple £49, Detailed £99, Three forms £120)',JSON.stringify(C.formAddons.map(a=>[a.label,a.value]))==='[["Simple form","£49"],["Detailed form","£99"],["Three forms","£120"]]');
 {const w0=all[1][1],ex=w0.match(/<div class="exform"[\s\S]*?<\/div>/g)||[],fa=id=>C.formAddons.find(a=>a.id===id),O=C.otherServices;
  const line=a=>'<p class="pline">'+a.label+' <span class="price" data-price>from <b>'+a.value+'</b></span></p>';
  ok('Example forms carry their config prices: Enquiry = Simple form from £49, Booking = Detailed form from £99',ex.length===2&&O.examples[0].price==='simple'&&O.examples[1].price==='detailed'&&/<h3>Enquiry form<\/h3>/.test(ex[0])&&ex[0].includes(line(fa('simple')))&&/<h3>Booking form<\/h3>/.test(ex[1])&&ex[1].includes(line(fa('detailed')))&&fa('simple').value==='£49'&&fa('detailed').value==='£99');
  ok('bundle line "Three forms from £120" from config, once',O.bundle==='bundle'&&!/>3 forms\b/.test(w0)&&(w0.match(/<p class="bundle[^"]*">Three forms <span class="price" data-price>from <b>£120<\/b><\/span><\/p>/g)||[]).length===1);
  const fs0=(w0.match(/<section id="forms"[\s\S]*?<\/section>/)||[''])[0];
  ok('forms section: small label "Other services", main heading "Forms", the new description, no risk-templates note',O.eyebrow==='Other services'&&/<p class="eyebrow sr">Other services<\/p><h2 class="sr"><em>Forms<\/em><\/h2><p class="lead sr">Branded forms that work on phones and laptops, and can be saved or printed\.<\/p>/.test(fs0)&&(w0.match(/Other services/g)||[]).length===1&&!/risk/i.test(text(w0))&&!('disclaimer' in C.formSection));
  {const fx=fs0.match(/<div class="exform"[\s\S]*?<p class="exmsg"/g)||[];ok('each example form: button "Send (example)" with "Example only, nothing is sent" right next to it, from config',fx.length===2&&O.examples.every(x=>x.button==='Send (example)')&&O.exampleNote==='Example only, nothing is sent'&&fx.every(f=>/<div class="exsendrow"><button type="button" class="btn sm exsend"[^>]*>Send \(example\)<\/button><span class="exnote">Example only, nothing is sent<\/span><\/div>/.test(f)));}
  ok('each form price shown once (no duplicate price cards)',['£49','£99','£120'].every(v=>(text(w0).match(new RegExp(v.replace('£','£')+'\\b','g'))||[]).length===1));}
 const w=all[1][1],T=text(w);
 ok('exactly one "Start here" badge and zero "Most popular"',(w.match(/Start here/g)||[]).length===1&&!/Most popular/i.test(w)&&/<article class="card reveal feat pc-ff">[\s\S]{0,200}<span class="lead-tag">Start here<\/span>/.test(w));
 {const old=/Fire and forget|Comprehensive|Most popular/i,hits=walk(dist).filter(f=>old.test(fs.readFileSync(f,'utf8'))).map(f=>path.relative(dist,f));ok('old names (Fire and forget, Comprehensive, Most popular) in no built file',hits.length===0,hits.join());
  ok('old names not in config',!old.test(JSON.stringify(C)));}
 const card=c=>(w.match(new RegExp('<article class="card reveal[^"]*'+c+'"[\\s\\S]*?<\/article>'))||[''])[0];
 const chk=card('pc-check'),ff=card('pc-ff'),co=card('pc-co');
 ok('three price cards in order: check, Build and hand over, Build and care',chk&&ff&&co&&w.indexOf(chk)<w.indexOf(ff)&&w.indexOf(ff)<w.indexOf(co)&&/<h3>Website &amp; brand check<\/h3>/.test(chk)&&/<h3>Build and hand over<\/h3>/.test(ff)&&/<h3>Build and care<\/h3>/.test(co)&&text(co).includes('Everything in Build and hand over, plus:'));
 const ct=text(chk).replace(/\s+/g,' ');
 ok('check card: £50 introductory, fine print verbatim, best for',/<b>£50<\/b><\/span> <span class="prov itag">introductory<\/span>/.test(chk)&&ct.includes('Checks use only publicly visible information. We won\u2019t log in, scan for weaknesses or try to break in. This isn\u2019t a full security audit or penetration test.')&&ct.includes('The £50 credit lasts 30 days from when we send your report. It can be used once, against any build, and has no cash value.')&&ct.includes('The £50 credit comes off any build, whether a refresh or a new site.')&&!/comes off your build/i.test(w)&&ct.includes('We look at your home page, two other pages and your social accounts from the outside, then send you a written list of fixes.')&&ct.includes('Best for: Keeping your current site, but want a clear list of fixes.')&&chk.indexOf('written list of fixes.</p>')<chk.indexOf('<ul class="fine">'));
 const ft=text(ff).replace(/\s+/g,' ');
 ok('Build and hand over card: New website from £595 and Website refresh from £495, each with what it includes',/New website[\s\S]*from <b>£595<\/b> one-off/.test(ff)&&/Website refresh[\s\S]*from <b>£495<\/b> one-off/.test(ff)&&ft.includes('Up to five pages, built around your business, with a simple editor so you can make changes yourself.')&&ft.includes('We refresh your site, move it to hosting in your own name and hand it over. Moving off Wix or WordPress is quoted per job.')&&!/low-cost/i.test(w)&&ft.includes('Best for: Owners who want a new site they can run themselves.'));
 const cot=text(co).replace(/\s+/g,' ');
 ok('Build and care card: Owners best-for line, build figure AND monthly figure, 30 minutes, rolling, cancel by mailto',/£(495|595)/.test(cot)&&/£39/.test(cot)&&cot.includes('Best for: Owners who\u2019d rather we handle changes each month.')&&/<h3>Build and care<\/h3><p class="pline cohead"><span class="nw">From <span class="price" data-price data-inline><b>£495<\/b><\/span> one-off<\/span> <span class="nw">\+ <span class="price" data-price data-inline><b>£39<\/b><\/span> a month<\/span><\/p>/.test(co)&&C.pricing.buildCare.headline==='From {refresh} one-off + {monthly} a month'&&cot.replace(/ ([,).])/g,'$1').replace(/\( /g,'(').includes('Same build price as Build and hand over (refresh from £495, new site from £595), then from £39 a month.')&&!/From £495 to £595/.test(cot)&&cot.includes('30 minutes of changes each month. Unused minutes don\u2019t roll over. Hosting stays in your own account.')&&cot.includes('Rolling monthly, no minimum term.')&&co.includes('Cancel any time by emailing <a href="mailto:'+C.trader.email.value+'">'+C.trader.email.value+'</a>.'));
 {const fa=(w.match(/<summary>Any hidden costs\?<\/summary><p>([\s\S]*?)<\/p>/)||[])[1]||'';
 ok('hidden costs answer exact, £10 from config',text(fa).replace(/\s+/g,' ')==='No. The only extras are paid straight to other providers: your domain name ( about £10 a year ), hosting and email if you want it, all in your own name. With a New website or Website refresh, there\u2019s no monthly bill from us.'&&fa.includes('<span class="price" data-price data-inline>about <b>'+C.prices.domain.value+'</b> a year</span>')&&/\{domain\+\}/.test(C.faq.items.find(i=>i.q==='Any hidden costs?').a));}
 ok('FAQ "Any hidden costs?" present',/<summary>Any hidden costs\?<\/summary>/.test(w));
{const wi=w.indexOf('<section id="work"'),si=w.indexOf('<section id="stories"'),ws=(w.match(/<section id="work"[\s\S]*?<\/section>/)||[''])[0];
 ok('concept work section sits above the client stories line',wi>0&&si>wi&&/class="ctag below">Concept</.test(ws));}
 const st=(w.match(/<section id="stories"[\s\S]*?<\/section>/)||[''])[0];
 ok('Dave Young story flag off by default',C.flags.showDaveYoungStory===false);
 if(!C.flags.showDaveYoungStory)ok('stories block: placeholder only, no quote, name, star or logo',!!st&&text(st).replace(/\s+/g,' ').trim()==='Clients We\u2019re new, so there are no client stories yet. See our concept work above.'&&!/<blockquote|<q\b|<cite|<img|<svg|<picture|[\u201C\u201D"\u2605\u2606\u2B50]|&#9733;|star|logo|Dave|Young/i.test(st.replace(/<(\w+)\s[^>]*>/g,'<$1>')));}
process.exit(fail?1:0);
