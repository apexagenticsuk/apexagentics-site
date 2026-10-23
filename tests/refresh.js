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
const idx=pages[0][1];const spans=[...idx.matchAll(/<span class="price"[^>]*data-provisional[^>]*>[\s\S]*?<\/span>(\s*<span class="prov">)?/g)];
ok('every provisional price has its tag',spans.length>0&&spans.every(m=>m[1]));
for(const [f,s] of pages){const t=text(s);ok(f+': no "testimonial"',!/testimonial/i.test(t)&&!/testimonial/i.test(s));
 const cs=(t.match(/coming soon/gi)||[]).length,allowed=(t.match(/Email coming soon/g)||[]).length;ok(f+': "coming soon" only in contact placeholder',cs===allowed&&allowed<=1&&(f!=='web/index.html'||C.trader.email.value||/data-allow="contact-placeholder">Email coming soon</.test(s)));
 ok(f+': no "refresh of" near Dave Young',!/refresh of[\s\S]{0,200}Dave Young|Dave Young[\s\S]{0,200}refresh of/i.test(t));
 ok(f+(f==='404.html'?': error page keeps noindex':': public mode, no robots meta (indexable)'),C.public===true&&(f==='404.html'?/<meta name="robots" content="noindex, nofollow">/.test(s):!/name="robots"/.test(s)));}
ok('robots.txt: old repo-root site still Disallow: /, dist allows crawling with Sitemap line',/User-agent: \*\s*\nDisallow: \/\s*$/m.test(fs.readFileSync(path.join(root,'robots.txt'),'utf8'))&&fs.readFileSync(path.join(dist,'robots.txt'),'utf8')==='User-agent: *\nAllow: /\n\nSitemap: https://apexagentics.co.uk/sitemap.xml\n');
ok('privacy page exists at web/privacy.html and links from footer',fs.existsSync(path.join(dist,'web/privacy.html'))&&/<footer[\s\S]*href="\/web\/privacy"/.test(idx)&&!/privacy\.html/.test(idx));
if(!C.flags.daveYoungApproved){const hits=walk(dist).filter(f=>/dave/i.test(path.basename(f))||/Dave Young/i.test(fs.readFileSync(f,'latin1')));ok('flag false: no Dave Young name or screenshots in dist',hits.length===0,hits.join());}
ok('no form that can submit',!/<form|type="submit"|<button/i.test(idx));
for(const [f,s] of pages){const t=text(s).replace('How long we keep it','');/* only exemption: the privacy page retention heading */ok(f+': no timeframe text',!/\b\d+\s*(-|to)?\s*\d*\s*(working\s+)?(hours?|days?|weeks?|months?)\b|timescale|how long|turnaround|within a/i.test(t));
 if(!C.flags.showLegalLine)ok(f+': legal line/owner placeholders hidden',!/\[OWNER NAME\]|\[POSTAL ADDRESS\]|\[RESPONSIBLE PERSON\]|trading name of/.test(s));}
ok('no bare "Apex"',!pages.some(([f,s])=>/\bApex\b(?!\s+Agentics)/.test(text(s))));
const tokRe=/(gh[pousr]_[A-Za-z0-9]{20,}|github_pat_[A-Za-z0-9_]{20,}|sk-[A-Za-z0-9]{20,}|AKIA[0-9A-Z]{16}|xox[baprs]-[A-Za-z0-9-]{10,}|-----BEGIN [A-Z ]*PRIVATE KEY|CLOUDFLARE_API_TOKEN=\S{20,})/;
const bad=walk(root).filter(f=>/\.(html|js|json|css|md|sh|py|txt|svg|env)$/.test(f)&&!/package-lock/.test(f)&&f!==__filename&&tokRe.test(fs.readFileSync(f,'utf8')));ok('no token-like strings in repo',bad.length===0,bad.join());
{const leaks=walk(dist).filter(f=>/\.(html|css|txt)$/.test(f)).filter(f=>{const s=text(fs.readFileSync(f,'utf8'));return /\[[A-Z][A-Z0-9 :_.-]*\]|TBC/.test(s)});ok('no bracketed placeholder or TBC in dist text',leaks.length===0,leaks.join());}
{const tracked=require('child_process').execFileSync('git',['ls-files'],{cwd:root,encoding:'utf8'}).split('\n').filter(Boolean).map(f=>path.join(root,f));const hits=[...tracked,...walk(dist)].filter(f=>f!==__filename&&fs.existsSync(f)&&new RegExp('ka'+'ne','i').test(fs.readFileSync(f,'latin1')));ok('no owner first name in tracked files or dist (this file skipped)',hits.length===0,hits.join());}
{const bad=walk(dist).filter(f=>/\.html$/.test(f)&&/fixed[ -]price/i.test(fs.readFileSync(f,'utf8')));ok('no "fixed price" wording in dist',bad.length===0,bad.join());}
{const css=fs.readFileSync(path.join(dist,'site.css'),'utf8');const small=[...css.matchAll(/(\.(?:prov|ctag|eyebrow|num|lead-tag)[^{]*)\{[^}]*font-size:(\d+)px/g)].filter(m=>+m[2]<14).map(m=>m[1]+' '+m[2]);ok('badges and tags at least 14px',small.length===0,small.join());}
{const s=fs.readFileSync(path.join(dist,'web/index.html'),'utf8');ok('VAT answer is exactly "No VAT is added to our prices." and the old line is gone',/<summary>Do you add VAT\?<\/summary><p>No VAT is added to our prices\.<\/p>/.test(s)&&!/Prices are final/.test(s));}
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
process.exit(fail?1:0);
