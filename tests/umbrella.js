// Umbrella structure tests (static, no server): root holding page, /web paths, link checker,
// public switch both ways, sitemap + canonical, _redirects, owner-name scan of dist and commits.
const fs=require('fs'),path=require('path'),os=require('os'),{execFileSync}=require('child_process');
const root=path.join(__dirname,'..'),dist=path.join(root,'dist');let fail=0;
const ok=(n,c,x)=>{console.log((c?'PASS ':'FAIL ')+n+(c||!x?'':' -> '+x));if(!c)fail++;};
const C=JSON.parse(fs.readFileSync(path.join(root,'site-config.json'),'utf8'));const SITE=C.siteUrl.replace(/\/+$/,'');
const build=(cfg,out)=>{let env=process.env;if(cfg){const f=path.join(os.tmpdir(),'apex-cfg-'+process.pid+'.json');fs.writeFileSync(f,JSON.stringify(cfg));env={...env,SITE_CONFIG:f};}execFileSync('node',[path.join(root,'site/build.js'),out],{env});};
build(null,dist);
const walk=(d,o=[])=>{for(const f of fs.readdirSync(d)){const p=path.join(d,f);fs.statSync(p).isDirectory()?walk(p,o):o.push(p);}return o;};
const read=f=>fs.readFileSync(path.join(dist,f),'utf8');
const text=s=>s.replace(/<script[\s\S]*?<\/script>/g,' ').replace(/<head>[\s\S]*?<\/head>/,' ').replace(/<[^>]+>/g,' ').replace(/&amp;/g,'&').replace(/\s+/g,' ').trim();
const em=C.trader.email.value,mt='mailto:'+em;
// --- layout
for(const f of ['index.html','web/index.html','web/privacy.html','404.html','robots.txt','sitemap.xml','_redirects','site.css','js/main.js'])ok('dist has '+f,fs.existsSync(path.join(dist,f)));
ok('old top-level privacy.html is gone (privacy lives at /web/privacy)',!fs.existsSync(path.join(dist,'privacy.html')));
// --- root holding page
const home=read('index.html'),web=read('web/index.html'),priv=read('web/privacy.html');
{const h1=[...home.matchAll(/<h1[^>]*>([\s\S]*?)<\/h1>/g)].map(m=>m[1]);ok('rebrand v3 root: one h1, and it is only the UK logo (alt "Apex Agentics UK"), so the name is shown once (no big text heading repeating it)',h1.length===1&&/^<img class="slot-logo home-logo" src="\/img\/logo\/apex-agentics-uk-on-dark\.svg" alt="Apex Agentics UK" width="\d+" height="\d+">$/.test(h1[0]),h1.join('|'));
 ok('rebrand v3 root: the one line "Modern technology for UK businesses." sits straight under the logo heading (from config home.tagline)',C.home.tagline==='Modern technology for UK businesses.'&&/<\/h1><p class="home-h1 home-tag">Modern technology for UK businesses\.<\/p><a class="dcard"/.test(home)&&(home.match(/Modern technology for UK businesses\./g)||[]).length>=1);}
{// logo slots (Shift logo): config fields; / shows the UK lockup, /web shows the Web lockup; an empty src renders nothing
 const LG=[['UK',C.home.logo,'apex-agentics-uk-on-dark.svg'],['Web',C.webLogo,'apex-agentics-web-on-dark.svg']];
 ok('logo slots in config point at the Shift lockups with alt text and width/height',LG.every(([n,L,f])=>L.src==='/img/logo/'+f&&L.alt==='Apex Agentics '+n&&L.width>0&&L.height>0));
 ok('logo files exist in dist and are SVGs with no metadata (only <svg> and <path>)',LG.every(([,L])=>{const s=read(L.src.slice(1));return /^<svg\b/.test(s)&&![...s.matchAll(/<([a-zA-Z][\w:-]*)/g)].some(m=>!['svg','path'].includes(m[1]));}));
 const lg=(L,cls)=>`<img class="${cls}" src="${L.src}" alt="${L.alt}" width="${L.width}" height="${L.height}">`;
 ok('logo renders on /: UK lockup <img> with alt "Apex Agentics UK", width and height',home.includes(lg(C.home.logo,'slot-logo home-logo')));
 ok('logo renders on /web/: Web lockup in the header (linking to /web/) and footer, alt "Apex Agentics Web"',new RegExp('<header[\\s\\S]*?<a class="logo" href="/web/">'+lg(C.webLogo,'slot-logo').replace(/[.*+?^${}()|[\]\\/]/g,'\\$&')+'</a>').test(web)&&/<footer[\s\S]*<img class="slot-logo" src="\/img\/logo\/apex-agentics-web-on-dark.svg" alt="Apex Agentics Web"/.test(web));
 ok('/ shows only the UK logo, /web only the Web logo',!home.includes('apex-agentics-web-on-dark')&&!web.includes('apex-agentics-uk-on-dark'));
 const d=fs.mkdtempSync(path.join(os.tmpdir(),'apex-logo-'));build({...C,home:{...C.home,logo:{...C.home.logo,src:''}},webLogo:{...C.webLogo,src:''}},d);
 const h2=fs.readFileSync(path.join(d,'index.html'),'utf8'),w2=fs.readFileSync(path.join(d,'web/index.html'),'utf8');
 ok('logo slots emptied: no <img> on /, /web falls back to the text wordmark',!/<img\b/.test(h2)&&!/slot-logo/.test(h2+w2)&&/<a class="logo" href="\/web\/">[\s\S]*?Apex Agentics <span class="ldiv">Web<\/span><\/a>/.test(w2)&&/<h1 class="home-brand">Apex Agentics UK<\/h1>/.test(h2));
 fs.rmSync(d,{recursive:true,force:true});}
ok('root: a card/button links to /web/',/<a class="dcard" href="\/web\/">/.test(home));
ok('root: footer Contact mailto to the config email',new RegExp('<footer[\\s\\S]*<p>Contact: <a href="'+mt+'">'+em+'</a></p>').test(home));
ok('root: no mailto to any other address',[...home.matchAll(/href="mailto:([^"]*)"/g)].every(m=>m[1]===em));
ok('root: footer links to the privacy page /web/privacy',/<footer[\s\S]*<a href="\/web\/privacy">Privacy notice<\/a>/.test(home));
{const hrefs=[...home.matchAll(/<a [^>]*href="([^"]*)"/g)].map(m=>m[1]).filter(h=>!/^mailto:|^#/.test(h));ok('root: only internal links are /web/ and /web/privacy',hrefs.length>0&&hrefs.every(h=>h==='/web/'||h==='/web/privacy'),hrefs.join());}
{// no invented wording: every visible text chunk on the root page already appears on the Web site (index or privacy),
 // apart from the two lines the owners gave for / in rebrand v3 (home.tagline, home.card)
 const webText=text(web)+' '+text(priv)+' '+[...web.matchAll(/<img class="slot-logo"[^>]*alt="([^"]+)"/g)].map(m=>m[1]).join(' ');/* the /web logo shows its alt text as lettering */const chunks=home.replace(/<head>[\s\S]*?<\/head>/,'').replace(/<script[\s\S]*?<\/script>/g,'').split(/<(?!span class="ldiv")[^>]+>/).map(s=>s.replace(/<[^>]+>/g,'').replace(/\s+/g,' ').trim()).filter(Boolean);
 const extra=chunks.filter(c=>!webText.includes(c)&&c!==C.home.tagline&&c!==C.home.card);ok('root: every visible text chunk already exists on the Web site, or is the given tagline or card line',extra.length===0,extra.join(' | '));
 const t=text(home);ok('root: no other divisions, figures or timeframes',!/division|consult|agency|software|marketing|automation|\bAI\b|labs?\b|studios\b|coming soon|launching|soon|\d/i.test(t.replace(em,'')),t);
 ok('rebrand v3 root: description meta is the tagline "Modern technology for UK businesses."',(home.match(/<meta name="description" content="([^"]*)"/)||[])[1]===C.home.tagline&&C.home.tagline==='Modern technology for UK businesses.');}
{// motion JS: no external script tag; one inline loader that only adds /js/home.js on desktop (fine pointer, >=1024px, motion allowed)
 const sc=[...home.matchAll(/<script([^>]*)>([\s\S]*?)<\/script>/g)];
 ok('root: phones get no JS - only one inline loader, no external script tags',sc.length===1&&sc[0][1]===''&&!/<script[^>]+src=/.test(home),sc.length);
 const L=sc[0]?sc[0][2]:'';ok('root: loader is gated on reduced motion, fine pointer and width >= 1024 and loads /js/home.js',/prefers-reduced-motion: reduce/.test(L)&&/\(hover: hover\) and \(pointer: fine\)/.test(L)&&/innerWidth>=1024/.test(L)&&/\/js\/home\.js/.test(L));
 ok('dist has js/home.js (holding-page motion entry)',fs.existsSync(path.join(dist,'js/home.js')));}
{// brand name: logo heading (image alt) + card label only
 const t=text(home),body=home.slice(home.indexOf('<body'));ok('rebrand v3 root: "Apex Agentics" appears once in visible text (the card label) and "Apex Agentics UK" once in the body (the logo alt)',(t.match(/Apex Agentics/g)||[]).length===1&&(body.match(/Apex Agentics UK/g)||[]).length===1,(t.match(/Apex Agentics/g)||[]).length+'/'+(body.match(/Apex Agentics UK/g)||[]).length);
 ok('root: exactly one h1 and one h2 (card label)',(home.match(/<h1[\s>]/g)||[]).length===1&&(home.match(/<h2[\s>]/g)||[]).length===1);
 const cp=(home.match(/<p class="dcard-p">([^<]*)<\/p>/)||[])[1];ok('rebrand v3 root: Web card text reads "Fast, modern websites for small businesses, at competitive prices." (config home.card) and does not repeat the name',cp==='Fast, modern websites for small businesses, at competitive prices.'&&C.home.card===cp,cp);
 ok('root: card label is the "Apex Agentics Web" wordmark',/<h2 class="dcard-h">Apex Agentics <span class="ldiv">Web<\/span><\/h2>/.test(home));}
// --- Open Graph / Twitter card
for(const [f,s,u] of [['index.html',home,'/'],['web/index.html',web,'/web/']]){
 const m=k=>{const r=s.match(new RegExp('<meta (?:property|name)="'+k+'" content="([^"]*)">'));return r&&r[1];};
 ok(f+': og:title, og:description, og:type present',!!m('og:title')&&!!m('og:description')&&m('og:type')==='website');
 ok(f+': og:url is canonical '+SITE+u,m('og:url')===SITE+u,m('og:url'));
 ok(f+': og:image and twitter:image are absolute https URLs to a file in dist',['og:image','twitter:image'].every(k=>/^https:\/\/apexagentics\.co\.uk\/[^"]+\.(png|jpg)$/.test(m(k)||'')&&fs.existsSync(path.join(dist,new URL(m(k)).pathname))),m('og:image'));
 ok(f+': twitter:card summary_large_image',m('twitter:card')==='summary_large_image');
 {const want=u==='/'?['Apex Agentics UK','Apex Agentics UK']:['Apex Agentics Web | Fast, modern websites for small businesses','Apex Agentics Web'],tt=(s.match(/<title>([^<]*)<\/title>/)||[])[1];
  ok(f+': rebrand v3: <title>, og:title and twitter:title are "'+want[0]+'"; og:site_name and og:image:alt are "'+want[1]+'"',tt===want[0]&&m('og:title')===want[0]&&m('twitter:title')===want[0]&&m('og:site_name')===want[1]&&m('og:image:alt')===want[1],[tt,m('og:title'),m('twitter:title'),m('og:site_name'),m('og:image:alt')].join(' / '));}}
{const hd=(web.match(/<header class="top">[\s\S]*?<\/header>/)||[''])[0],ft=(web.match(/<footer class="foot">[\s\S]*?<\/footer>/)||[''])[0];
 ok('rebrand v3: /web/ header and footer logos say "Apex Agentics Web"; the footer link back to / says "Apex Agentics UK"; / heading says "Apex Agentics UK"',/<a class="logo" href="\/web\/"><img class="slot-logo" src="[^"]+" alt="Apex Agentics Web"/.test(hd)&&/<a href="\/web\/" class="logo flogo"><img class="slot-logo" src="[^"]+" alt="Apex Agentics Web"/.test(ft)&&/<a href="\/">Apex Agentics UK<\/a>/.test(ft)&&/<h1 class="home-brand"><img [^>]*alt="Apex Agentics UK"[^>]*><\/h1>/.test(home));}
{const b=fs.readFileSync(path.join(dist,'og.png'));const w=b.readUInt32BE(16),h=b.readUInt32BE(20);
 ok('og.png: PNG 1200x630 under 300KB',b.slice(1,4).toString()==='PNG'&&w===1200&&h===630&&b.length<300*1024,`${w}x${h} ${b.length}B`);
 ok('share image template and renderer saved in the repo',['site/brand/og.html','site/brand/render.js'].every(f=>fs.existsSync(path.join(root,f))));}
// --- rebrand v4: two share images. / keeps og.png (UK option-1 lockup); /web/ gets og-web.png (Shift option-1 lockup). Privacy title and 404 logo say Apex Agentics Web.
{const img=(s,k)=>(s.match(new RegExp('<meta (?:property|name)="'+k+'" content="([^"]*)">'))||[])[1];
 ok('rebrand v4: / og:image and twitter:image are '+SITE+'/og.png',img(home,'og:image')===SITE+'/og.png'&&img(home,'twitter:image')===SITE+'/og.png',img(home,'og:image'));
 ok('rebrand v4: /web/ og:image and twitter:image are '+SITE+'/og-web.png',img(web,'og:image')===SITE+'/og-web.png'&&img(web,'twitter:image')===SITE+'/og-web.png',img(web,'og:image'));
 const b=fs.readFileSync(path.join(dist,'og-web.png')),w=b.readUInt32BE(16),h=b.readUInt32BE(20);
 ok('og-web.png: PNG 1200x630 (same size as og.png) under 300KB, and not the same picture as og.png',b.slice(1,4).toString()==='PNG'&&w===1200&&h===630&&b.length<300*1024&&!b.equals(fs.readFileSync(path.join(dist,'og.png'))),`${w}x${h} ${b.length}B`);
 const t=fs.readFileSync(path.join(root,'site/brand/og.html'),'utf8'),r=fs.readFileSync(path.join(root,'site/brand/render.js'),'utf8');
 ok('share template: ?b=web uses the Web lockup, otherwise the UK lockup; renderer writes og.png from uk and og-web.png from web',/\/img\/logo\/apex-agentics-'\+b\+'-on-dark\.svg'/.test(t)&&/get\('b'\)==='web'\?'web':'uk'/.test(t)&&r.includes("[['uk','og.png'],['web','og-web.png']]"));
 const L='/workspace/apex-logos/',pairs=[['uk','uk'],['web','web']].map(([a,o])=>[path.join(root,'site/img/logo/apex-agentics-'+a+'-on-dark.svg'),L+o+'/option-1/svg/lockup-on-dark.svg']);
 if(fs.existsSync(L))ok('share-image lockups are the option-1 files (UK for /, Shift for /web/)',pairs.every(([x,y])=>fs.readFileSync(x).equals(fs.readFileSync(y))));
 ok('rebrand v4: privacy <title> is "Privacy notice | Apex Agentics Web"',/<title>Privacy notice \| Apex Agentics Web<\/title>/.test(priv));
 ok('rebrand v5: 404 <title> is "Page not found | Apex Agentics Web" (from webLogo.alt)',/<title>Page not found \| Apex Agentics Web<\/title>/.test(read('404.html')));
 const nh=(read('404.html').match(/<header class="top">[\s\S]*?<\/header>/)||[''])[0];
 ok('rebrand v4: 404 header logo is the Apex Agentics Web lockup linking to /web/',/<a class="logo" href="\/web\/"><img class="slot-logo" src="\/img\/logo\/apex-agentics-web-on-dark\.svg" alt="Apex Agentics Web"/.test(nh)&&!/class="mark"/.test(nh),nh.slice(0,160));}
// --- icons
{const b=fs.readFileSync(path.join(dist,'favicon.ico'));const n=b.readUInt16LE(4),sz=[...Array(n)].map((_,k)=>b[6+16*k]).sort((x,y)=>x-y);
 ok('favicon.ico: real ICO with 16px and 32px images',b.readUInt16LE(0)===0&&b.readUInt16LE(2)===1&&sz.join()==='16,32',sz.join());
 const a=fs.readFileSync(path.join(dist,'apple-touch-icon.png'));
 {const v=fs.existsSync(path.join(dist,'favicon.svg'))?read('favicon.svg'):'';ok('favicon.svg exists: the Shift mark (bone + signal) on Ink, no metadata',/^<svg\b/.test(v)&&v.includes('#F2EFE9')&&v.includes('#7CFFB2')&&v.includes('#0B0D10')&&![...v.matchAll(/<([a-zA-Z][\w:-]*)/g)].some(m=>!['svg','path','rect'].includes(m[1])));}
 for(const f of ['index.html','web/index.html','web/privacy.html','404.html'])ok(f+': links /favicon.svg as an SVG icon',read(f).includes('<link rel="icon" href="/favicon.svg" type="image/svg+xml">'));ok('apple-touch-icon.png: PNG 180x180',a.slice(1,4).toString()==='PNG'&&a.readUInt32BE(16)===180&&a.readUInt32BE(20)===180);
 for(const f of ['index.html','web/index.html','web/privacy.html','404.html'])ok(f+': links /favicon.ico and /apple-touch-icon.png',read(f).includes('<link rel="icon" href="/favicon.ico"')&&read(f).includes('<link rel="apple-touch-icon" href="/apple-touch-icon.png">'));}
ok('root: no bare "Apex"',!/\bApex\b(?!\s+Agentics)/.test(text(home)));
{const css=read('site.css');ok('CSS: reduced-motion turns off root card motion and hero glow',/prefers-reduced-motion:reduce\)\{\.dcard,\.dcard::after\{transition:none\}/.test(css)&&/prefers-reduced-motion:reduce\)\{\.hero::before\{animation:none\}/.test(css));
 ok('CSS: palette Ink/Bone/Signal/Muted/Line',['#0B0D10','#F2EFE9','#7CFFB2','#8A9099','#1E232A'].every(c=>css.includes(c)));
 ok('CSS: self-hosted Space Grotesk, Inter Tight, Instrument Serif',['Space Grotesk','Inter Tight','Instrument Serif'].every(f=>new RegExp("@font-face\\{font-family:'"+f+"'[^}]*url\\(fonts/").test(css)));}
// --- /web wordmark + links
ok('/web header logo reads "Apex Agentics Web" (img alt) and links to /web/',/<header[\s\S]*?<a class="logo" href="\/web\/"><img class="slot-logo" src="[^"]+" alt="Apex Agentics Web"/.test(web));
for(const [f,s] of [['web/index.html',web],['web/privacy.html',priv],['404.html',read('404.html')]]){
 ok(f+': skip link to #main and main#main exists',/<a class="skip" href="#main">/.test(s)&&/<main id="main"/.test(s));
 ok(f+': footer links to / and /web/ and /web/privacy',/<footer[\s\S]*href="\/"[\s\S]*href="\/web\/#work"[\s\S]*href="\/web\/privacy"/.test(s));
 ok(f+': no relative href/src (works at /web and /web/)',![...s.matchAll(/\s(?:href|src)="([^"]*)"/g)].some(m=>!/^(\/|#|mailto:|https:)/.test(m[1])));}
{const nf=read('404.html');ok('404: links back to / and /web/',/<a class="btn" href="\/">/.test(nf)&&/<a class="tlink" href="\/web\/">/.test(nf));}
// --- link checker: every internal href/src/srcset in dist HTML, CSS url() and JS chunk import resolves to a file (Pages rules)
const redirects=Object.fromEntries(read('_redirects').trim().split('\n').map(l=>l.split(/\s+/)));
const pageUrl=f=>f==='404.html'?'/some/missing/deep/path':'/'+f.replace(/index\.html$/,'').replace(/\.html$/,'');
const ids=f=>new Set([...read(f).matchAll(/\sid="([^"]+)"/g)].map(m=>m[1]));
const resolveFile=(u,hops=0)=>{const p=decodeURIComponent(u.split(/[?#]/)[0]);if(redirects[p]&&hops<3)return resolveFile(redirects[p],hops+1);
 const c=p.endsWith('/')?[p+'index.html']:[p,p+'.html',p+'/index.html'];return c.map(x=>x.slice(1)).find(x=>fs.existsSync(path.join(dist,x))&&fs.statSync(path.join(dist,x)).isFile());};
const broken=[];let checked=0;
for(const abs of walk(dist).filter(f=>f.endsWith('.html'))){const f=path.relative(dist,abs),s=read(f),base='https://x'+pageUrl(f);
 const refs=[...s.matchAll(/\s(?:href|src)="([^"]+)"/g)].map(m=>m[1]).concat(...[...s.matchAll(/\ssrcset="([^"]+)"/g)].map(m=>m[1].split(',').map(x=>x.trim().split(/\s+/)[0])));
 for(const r of refs){if(/^(mailto:|data:)/.test(r)||/^https?:/.test(r)&&!r.startsWith('https://x'))continue;checked++;const u=new URL(r,base);
  if(r.startsWith('#')){if(r!=='#'&&!ids(f).has(r.slice(1)))broken.push(f+' '+r);continue;}
  const tf=resolveFile(u.pathname);if(!tf){broken.push(f+' '+r);continue;}
  if(u.hash&&tf.endsWith('.html')&&!ids(tf).has(u.hash.slice(1)))broken.push(f+' '+r+' (anchor)');}}
for(const m of read('site.css').matchAll(/url\((?!["']?(?:data:|#|%23))["']?([^"')]+)/g)){checked++;if(!resolveFile(new URL(m[1],'https://x/site.css').pathname))broken.push('site.css '+m[1]);}
for(const jf of walk(path.join(dist,'js')).filter(f=>f.endsWith('.js'))){const s=fs.readFileSync(jf,'utf8');for(const m of s.matchAll(/(?:import\(|from)\s*"(\.\/[^"]+)"/g)){checked++;if(!fs.existsSync(path.join(path.dirname(jf),m[1])))broken.push(path.relative(dist,jf)+' '+m[1]);}}
ok(`link checker: all ${checked} internal href/src/srcset/url()/imports resolve (anchors included)`,broken.length===0&&checked>50,broken.join(', '));
ok('_redirects: /privacy and /privacy.html -> /web/privacy (301), target exists',redirects['/privacy']==='/web/privacy'&&redirects['/privacy.html']==='/web/privacy'&&/\/privacy \/web\/privacy 301/.test(read('_redirects'))&&resolveFile('/web/privacy')==='web/privacy.html');
ok('_redirects: no www/host redirects inside Pages',!/www\.|https?:/.test(read('_redirects')));
// --- canonical + sitemap
const want={'index.html':'/','web/index.html':'/web/','web/privacy.html':'/web/privacy'};
for(const [f,u] of Object.entries(want)){const c=[...read(f).matchAll(/<link rel="canonical" href="([^"]*)">/g)].map(m=>m[1]);ok(f+': canonical '+SITE+u,c.length===1&&c[0]===SITE+u,c.join());}
ok('404: no canonical',!/rel="canonical"/.test(read('404.html')));
{const sm=read('sitemap.xml');const locs=[...sm.matchAll(/<loc>([^<]*)<\/loc>/g)].map(m=>m[1]);
 ok('sitemap.xml: valid urlset with exactly /, /web/, /web/privacy on apexagentics.co.uk',/^<\?xml version="1.0" encoding="UTF-8"\?>\n<urlset xmlns="http:\/\/www.sitemaps.org\/schemas\/sitemap\/0.9">/.test(sm)&&JSON.stringify(locs)===JSON.stringify(['https://apexagentics.co.uk/','https://apexagentics.co.uk/web/','https://apexagentics.co.uk/web/privacy']),locs.join());}
// --- public switch, both ways
ok('config: public is true (launch)',C.public===true);
const pagesOf=d=>['index.html','web/index.html','web/privacy.html','404.html'].map(f=>[f,fs.readFileSync(path.join(d,f),'utf8')]);
const NOI='<meta name="robots" content="noindex, nofollow">';
for(const [f,s] of pagesOf(dist))ok('dist (public): '+f+(f==='404.html'?' keeps noindex (error page)':' has no noindex'),f==='404.html'?s.includes(NOI):!/name="robots"/.test(s));
ok('dist (public): robots.txt allows crawling and points to the sitemap',read('robots.txt')==='User-agent: *\nAllow: /\n\nSitemap: https://apexagentics.co.uk/sitemap.xml\n');
ok('dist (public): legal/name flags stay false',C.flags.showLegalLine===false&&C.flags.ownershipConfirmed===false&&C.flags.daveYoungApproved===false);
{const d=fs.mkdtempSync(path.join(os.tmpdir(),'apex-pub-'));build({...C,public:true},d);
 for(const [f,s] of pagesOf(d))ok('public:true: '+f+(f==='404.html'?' keeps noindex (error page)':' has no noindex'),f==='404.html'?s.includes(NOI):!/name="robots"/.test(s));
 ok('public:true: robots.txt allows crawling and points to the sitemap',fs.readFileSync(path.join(d,'robots.txt'),'utf8')==='User-agent: *\nAllow: /\n\nSitemap: https://apexagentics.co.uk/sitemap.xml\n');
 ok('public:true: canonicals unchanged',Object.entries(want).every(([f,u])=>fs.readFileSync(path.join(d,f),'utf8').includes(`<link rel="canonical" href="${SITE}${u}">`)));
 const d2=fs.mkdtempSync(path.join(os.tmpdir(),'apex-priv-'));build({...C,public:false},d2);
 ok('public back to false: noindex and Disallow return',pagesOf(d2).every(([,s])=>s.includes(NOI))&&fs.readFileSync(path.join(d2,'robots.txt'),'utf8')==='User-agent: *\nDisallow: /\n');
 fs.rmSync(d,{recursive:true,force:true});fs.rmSync(d2,{recursive:true,force:true});}
// --- hidden lines + owner names (regex built from parts so this file stays clean)
ok('flags showLegalLine/ownershipConfirmed/daveYoungApproved stay false',!C.flags.showLegalLine&&!C.flags.ownershipConfirmed&&!C.flags.daveYoungApproved);
const NAME=new RegExp(['ka'+'ne','jin'+'dal','ka'+'nejin'+'dal'+'business-dev'].join('|'),'i');
{const hits=walk(dist).filter(f=>NAME.test(fs.readFileSync(f,'latin1')));ok('no owner name/account anywhere in dist',hits.length===0,hits.join());}
{const log=execFileSync('git',['log','--format=%an %ae %cn %ce %B'],{cwd:root,encoding:'utf8'});ok('no owner name/account in commit authors or messages on this branch',!NAME.test(log));
 const au=new Set(execFileSync('git',['log','-20','--format=%an <%ae>|%cn <%ce>'],{cwd:root,encoding:'utf8'}).trim().split('\n'));ok('recent commits authored as Apex Agentics <no-reply@apexagentics.invalid>',[...au].every(a=>a==='Apex Agentics <no-reply@apexagentics.invalid>|Apex Agentics <no-reply@apexagentics.invalid>'),[...au].join());}
process.exit(fail?1:0);
