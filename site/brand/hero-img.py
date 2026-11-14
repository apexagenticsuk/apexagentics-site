# Derives the /web/ hero pictures from the existing concept viewer crops (site/img/concept-<key>-view-1125.webp, 9:16).
# No new artwork: the same three concept handsets, resized for the hero fan -> site/img/hero-<key>-360/540/720.webp.
# Usage: python3 site/brand/hero-img.py
import os
from PIL import Image
img=os.path.join(os.path.dirname(os.path.abspath(__file__)),'..','img')
for k in ['cafe','plumber','studio']:
    im=Image.open(f'{img}/concept-{k}-view-1125.webp').convert('RGB')
    for w in (360,540,720):
        im.resize((w,w*16//9),Image.LANCZOS).save(f'{img}/hero-{k}-{w}.webp','WEBP',quality=68,method=6)
    print(k,*[os.path.getsize(f'{img}/hero-{k}-{w}.webp')//1024 for w in (360,540,720)],'KB')
