from PIL import Image
import os
d=os.path.join(os.path.dirname(__file__),'..','img');os.makedirs(d,exist_ok=True)
for k in ['cafe','plumber','studio']:
    im=Image.open(f'/tmp/concept-{k}.png').convert('RGB')
    for w in (600,1200):
        r=im.resize((w,w*2//3),Image.LANCZOS)
        r.save(f'{d}/concept-{k}-{w}.avif',quality=55);r.save(f'{d}/concept-{k}-{w}.webp',quality=78)
