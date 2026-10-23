# Converts /tmp/form-<id>-raw.png (1200x1560) to optimised WebP at 600w and 1200w and a PNG at 1200w in site/img. Usage: python3 forms-img.py [id ...] (default: all three).
import sys,os
from PIL import Image
out=os.path.join(os.path.dirname(__file__),'..','img')
for i in sys.argv[1:] or ['risk','booking','enquiry']:  # pass ids to write only those
    im=Image.open(f'/tmp/form-{i}-raw.png').convert('RGB')
    im.save(f'{out}/form-{i}-1200.webp','WEBP',quality=80,method=6)
    im.resize((600,780),Image.LANCZOS).save(f'{out}/form-{i}-600.webp','WEBP',quality=82,method=6)
    im.quantize(256,method=Image.Quantize.MEDIANCUT,dither=Image.Dither.NONE).save(f'{out}/form-{i}-1200.png',optimize=True)
    print(i,*[os.path.getsize(f'{out}/form-{i}-{s}')//1024 for s in ['600.webp','1200.webp','1200.png']],'KB')
