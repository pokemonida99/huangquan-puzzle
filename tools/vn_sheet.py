import sys
from pathlib import Path
from PIL import Image
R=Path(__file__).resolve().parent.parent
fs=sorted((R/"art/vn").glob("*.webp"))
keys=sys.argv[1:]
if keys: fs=[f for f in fs if f.stem.split("-")[0] in keys]
tw,th=220,330
cols=7
rows=(len(fs)+cols-1)//cols
sheet=Image.new("RGB",(cols*tw,rows*th*2),(0,0,0))
for i,f in enumerate(fs):
    im=Image.open(f); im.thumbnail((tw-4,th-4))
    for j,bg in enumerate([(30,30,40),(235,235,225)]):
        c=Image.new("RGB",(tw,th),bg); c.paste(im,((tw-im.width)//2,th-im.height),im)
        sheet.paste(c,((i%cols)*tw,(i//cols)*th*2+j*th))
sheet.save(R/"work/vn/sheet.png")
