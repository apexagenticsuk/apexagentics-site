# Derives the /web/ hero pictures from the existing concept viewer crops (site/img/concept-<key>-view-1125.webp, 9:16).
# Those crops include the concept card colour around the handset. The hero fan shows the phone only, so the card
# is cleared. All three crops share one handset outline (taken from the studio crop); nothing else is redrawn.
# Output: site/img/hero-<key>-360/540/720.webp, phone intact, surround transparent.
# Usage: python3 site/brand/hero-img.py
import os
from PIL import Image, ImageFilter
img=os.path.join(os.path.dirname(os.path.abspath(__file__)),'..','img')

def phone_mask(im):
    # The handset bezel is a dark neutral rim. Fill between its left and right edges, then add one pixel
    # so the rim's outer edge is kept, and drop that extra pixel where it is still the coloured card.
    w,h=im.size
    px=im.load()
    def lum(p):
        return 0.2126*p[0]+0.7152*p[1]+0.0722*p[2]
    def bezel(p):
        L=lum(p)
        return 10<=L<=52 and max(p)-min(p)<=26
    edges=[None]*h
    for y in range(h):
        xl=next((x for x in range(w) if bezel(px[x,y])), None)
        if xl is None: continue
        xr=next((x for x in range(w-1,-1,-1) if bezel(px[x,y])), None)
        if xr and 200*w/720<xr-xl<620*w/720:
            edges[y]=(xl,xr)
    def med(vals):
        s=sorted(vals)
        return s[len(s)//2]
    smooth=edges[:]
    for y in range(h):
        if edges[y] is None: continue
        win=[edges[i] for i in range(max(0,y-3),min(h,y+4)) if edges[i]]
        if len(win)>=3:
            smooth[y]=(med(a for a,b in win), med(b for a,b in win))
    mask=Image.new('L',(w,h),0)
    mp=mask.load()
    for y,e in enumerate(smooth):
        if not e: continue
        for x in range(e[0],e[1]+1):
            mp[x,y]=255
    grown=mask.filter(ImageFilter.MaxFilter(3))
    gp=grown.load()
    for y in range(h):
        for x in range(w):
            if gp[x,y] and not mp[x,y]:
                p=px[x,y]
                if max(p)-min(p)>16 or lum(p)>90:
                    gp[x,y]=0
    covered=grown.histogram()[255]/(w*h)
    if not 0.55<=covered<=0.8:
        raise SystemExit(f'phone mask covered {covered:.2f} of the crop; expected the handset only')
    return grown

studio=Image.open(f'{img}/concept-studio-view-1125.webp').convert('RGB')
mask=phone_mask(studio)
for k in ['cafe','plumber','studio']:
    im=Image.open(f'{img}/concept-{k}-view-1125.webp').convert('RGBA')
    if im.size!=mask.size: raise SystemExit(f'{k} crop {im.size} != studio {mask.size}')
    im.putalpha(mask)
    for w in (360,540,720):
        im.resize((w,w*16//9),Image.LANCZOS).save(f'{img}/hero-{k}-{w}.webp','WEBP',quality=68,method=6)
    print(k,*[os.path.getsize(f'{img}/hero-{k}-{w}.webp')//1024 for w in (360,540,720)],'KB')
