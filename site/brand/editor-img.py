# Converts /tmp/emock-<key>-raw.png (2400x1600, from render-editor.js) to editor-<key>-600/1200/2400.webp and editor-<key>-1200.png in site/img.
import os
from PIL import Image
out=os.path.join(os.path.dirname(__file__),'..','img')
for k in ['reorder','add','image']:
    im=Image.open(f'/tmp/emock-{k}-raw.png').convert('RGB')
    for w in (600,1200,2400):
        (im if w==2400 else im.resize((w,w*2//3),Image.LANCZOS)).save(f'{out}/editor-{k}-{w}.webp','WEBP',quality=84,method=6)
    im.resize((1200,800),Image.LANCZOS).quantize(256,method=Image.Quantize.MEDIANCUT,dither=Image.Dither.FLOYDSTEINBERG).save(f'{out}/editor-{k}-1200.png',optimize=True)
    print(k,*[os.path.getsize(f'{out}/editor-{k}-{s}')//1024 for s in ['600.webp','1200.webp','2400.webp','1200.png']],'KB')
# Phone crops (/tmp/emock-<key>-phone-raw.png, 4:5, from render-editor.js): editor-<key>-phone-600/900.webp + editor-<key>-phone-600.jpg (fallback), used below 760px wide.
for k in ['reorder','add','image']:
    im=Image.open(f'/tmp/emock-{k}-phone-raw.png').convert('RGB')
    for w in (600,900):
        im.resize((w,w*5//4),Image.LANCZOS).save(f'{out}/editor-{k}-phone-{w}.webp','WEBP',quality=84,method=6)
    im.resize((600,750),Image.LANCZOS).save(f'{out}/editor-{k}-phone-600.jpg','JPEG',quality=85,optimize=True,progressive=True)
    print(k,'phone',*[os.path.getsize(f'{out}/editor-{k}-phone-{s}')//1024 for s in ['600.webp','900.webp','600.jpg']],'KB')
# Viewer crops (/tmp/emock-<key>-view-raw.png, 9:16, from render-editor.js): editor-<key>-view-750/1125.webp + editor-<key>-view-750.jpg (fallback), opened by the on-page viewer below 760px wide.
for k in ['reorder','add','image']:
    im=Image.open(f'/tmp/emock-{k}-view-raw.png').convert('RGB')
    for w in (750,1125):
        im.resize((w,w*16//9),Image.LANCZOS).save(f'{out}/editor-{k}-view-{w}.webp','WEBP',quality=84,method=6)
    im.resize((750,1333),Image.LANCZOS).save(f'{out}/editor-{k}-view-750.jpg','JPEG',quality=85,optimize=True,progressive=True)
    print(k,'view',im.size,*[os.path.getsize(f'{out}/editor-{k}-view-{s}')//1024 for s in ['750.webp','1125.webp','750.jpg']],'KB')
