import cv2, numpy as np, json, sys
from scipy.ndimage import binary_fill_holes
src, names, out = sys.argv[1], json.loads(sys.argv[2]), sys.argv[3]
import os; os.makedirs(out,exist_ok=True)
im=cv2.imread(src).astype(np.float32)
d=255-im.min(axis=2)
m=(d>28).astype(np.uint8)
mc=cv2.morphologyEx(m,cv2.MORPH_CLOSE,np.ones((7,7),np.uint8))
n,lab,st,cen=cv2.connectedComponentsWithStats(mc)
idx=[i for i in range(1,n) if st[i,4]>150]
idx.sort(key=lambda i:(st[i,1]//120, st[i,0]))
groups={}
for k,i in enumerate(idx):
  nm=names.get(str(k))
  if nm: groups.setdefault(nm,[]).append(i)
meta={}
for nm,ids in groups.items():
  xs=[st[i,0] for i in ids]; ys=[st[i,1] for i in ids]; xe=[st[i,0]+st[i,2] for i in ids]; ye=[st[i,1]+st[i,3] for i in ids]
  p=6; x0,y0,x1,y1=max(0,min(xs)-p),max(0,min(ys)-p),max(xe)+p,max(ye)+p
  sub=lab[y0:y1,x0:x1]
  filled=np.zeros(sub.shape,bool); inner=np.zeros(sub.shape,bool)
  for i in ids:
    comp=(sub==i); f=binary_fill_holes(comp)
    filled|=cv2.dilate(f.astype(np.uint8),np.ones((5,5),np.uint8))>0
    inner|=cv2.erode(f.astype(np.uint8),np.ones((3,3),np.uint8))>0
  dd=d[y0:y1,x0:x1]
  a=np.where(inner,1.0,np.clip(dd/90.0,0,1))*filled
  c=im[y0:y1,x0:x1]
  aa=np.maximum(a,1e-3)[...,None]
  col=np.clip((c-(1-aa)*255)/aa,0,255)
  rgba=np.dstack([col[...,::-1],a*255]).astype(np.uint8)
  cv2.imwrite(f'{out}/{nm}.png',cv2.cvtColor(rgba,cv2.COLOR_RGBA2BGRA))
  meta[nm]=[int(x0),int(y0),int(x1-x0),int(y1-y0)]
json.dump(meta,open(f'{out}/meta.json','w'),indent=0)
print(len(meta),'piezas')
