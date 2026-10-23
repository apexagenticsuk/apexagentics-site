# Converts /tmp/cmock-<key>-raw.png (from render-concepts.js) to optimised WebP and a PNG fallback in site/img.
# Concept scenes (2400x1600): concept-<key>-600/1200/2400.webp + concept-<key>-2400.png (fallback for browsers without WebP). Included phone (940x1920, transparent): phone-cafe-470/940.webp + phone-cafe-940.png.
import os
from PIL import Image
out=os.path.join(os.path.dirname(__file__),'..','img')
for k in ['cafe','plumber','studio']:
    im=Image.open(f'/tmp/cmock-{k}-raw.png').convert('RGB')
    for w in (600,1200,2400):
        (im if w==2400 else im.resize((w,w*2//3),Image.LANCZOS)).save(f'{out}/concept-{k}-{w}.webp','WEBP',quality=80 if w==2400 else 82,method=6)
    im.quantize(256,method=Image.Quantize.MEDIANCUT,dither=Image.Dither.FLOYDSTEINBERG).save(f'{out}/concept-{k}-2400.png',optimize=True)
    print(k,*[os.path.getsize(f'{out}/concept-{k}-{s}')//1024 for s in ['600.webp','1200.webp','2400.webp','2400.png']],'KB')
im=Image.open('/tmp/cmock-included-raw.png').convert('RGBA')
for w in (470,940):
    im.resize((w,w*960//470),Image.LANCZOS).save(f'{out}/phone-cafe-{w}.webp','WEBP',quality=84,method=6)
im.quantize(256,method=Image.Quantize.FASTOCTREE,dither=Image.Dither.FLOYDSTEINBERG).save(f'{out}/phone-cafe-940.png',optimize=True)
print('included',*[os.path.getsize(f'{out}/phone-cafe-{s}')//1024 for s in ['470.webp','940.webp','940.png']],'KB')
# Phone crops (from render-concepts.js, 4:5): concept-<key>-phone-600/900.webp + concept-<key>-phone-600.jpg (fallback), used below 760px wide.
for k in ['cafe','plumber','studio']:
    im=Image.open(f'/tmp/cmock-{k}-phone-raw.png').convert('RGB')
    for w in (600,900):
        im.resize((w,w*5//4),Image.LANCZOS).save(f'{out}/concept-{k}-phone-{w}.webp','WEBP',quality=84,method=6)
    im.resize((600,750),Image.LANCZOS).save(f'{out}/concept-{k}-phone-600.jpg','JPEG',quality=85,optimize=True,progressive=True)
    print(k,'phone',*[os.path.getsize(f'{out}/concept-{k}-phone-{s}')//1024 for s in ['600.webp','900.webp','600.jpg']],'KB')
# Viewer crops (/tmp/cmock-<key>-view-raw.png, 9:16, from render-concepts.js): concept-<key>-view-750/1125.webp + concept-<key>-view-750.jpg (fallback), opened by the on-page viewer below 760px wide.
for k in ['cafe','plumber','studio']:
    im=Image.open(f'/tmp/cmock-{k}-view-raw.png').convert('RGB')
    for w in (750,1125):
        im.resize((w,w*16//9),Image.LANCZOS).save(f'{out}/concept-{k}-view-{w}.webp','WEBP',quality=84,method=6)
    im.resize((750,1333),Image.LANCZOS).save(f'{out}/concept-{k}-view-750.jpg','JPEG',quality=85,optimize=True,progressive=True)
    print(k,'view',im.size,*[os.path.getsize(f'{out}/concept-{k}-view-{s}')//1024 for s in ['750.webp','1125.webp','750.jpg']],'KB')
