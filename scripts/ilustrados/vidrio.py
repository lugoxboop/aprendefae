# Recorte de objetos de Gemini sobre verde croma (guia-estilo-imagenes.md, «Objetos ilustrados»).
# vidrio.py archivo.webp : vuelve neutro-azulado el vidrio translúcido y quita verdes residuales
import sys
from PIL import Image; import numpy as np
p=sys.argv[1]
im=np.asarray(Image.open(p).convert('RGBA')).astype(np.float32)
a=im[...,3]; semi=(a<235)&(a>0)
lum=(im[...,0]*.3+im[...,1]*.59+im[...,2]*.11)
for c,t in zip(range(3),(0.86,0.92,1.04)):
    im[...,c]=np.where(semi, np.clip(lum*t+20,0,255), im[...,c])
im[...,3]=np.where(semi, a*0.6, a)
R,G,B=im[...,0],im[...,1],im[...,2]
g=(G>R+12)&(G>B)
im[...,1]=np.where(g,(R+B)/2+(G-(R+B)/2)*0.25,G)
im[...,2]=np.where(g,np.maximum(B,G*0.95),B)
Image.fromarray(im.clip(0,255).astype(np.uint8),'RGBA').save(p,quality=88,method=6)
