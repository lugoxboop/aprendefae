import numpy as np,cv2,sys
from PIL import Image
a=np.array(Image.open('perro/torso_conbrazos.png')).astype(np.float32)
rgb=a[...,:3];al=a[...,3].copy()
H,W=al.shape
dark=(rgb.max(2)<110)&(al>100)
def fit(xr,yr):
  ys=[];xs=[]
  for y in range(*yr):
    c=np.where(dark[y,xr[0]:xr[1]])[0]
    if len(c): ys.append(y); xs.append(c.mean()+xr[0])
  return np.polyfit(ys,xs,1),min(ys),max(ys)
out=a.copy()
for side,xr,yr in [('L',(35,85),(72,140)),('R',(185,235),(92,140))]:
  (m,b),y0,y1=fit(xr,yr); print(side,m,b,y0,y1)
  ytop=None
  for y in range(y1,-1,-1):
    x=int(round(m*y+b))
    if al[y,x]<30: ytop=y; break
  for y in range(ytop,y1+12):
    x=m*y+b
    if side=='L': out[y,:max(0,int(x)-3),3]=0
    else: out[y,int(x)+4:,3]=0
  # contorno nuevo arriba del trazo original
  pts=np.array([[m*y+b,y] for y in (ytop,y0+2)],np.int32)
  cv2.polylines(out,[pts.reshape(-1,1,2)],False,(25,20,18,255),5,cv2.LINE_AA)
# limpiar islas
m2=(out[...,3]>20).astype(np.uint8); n,lab,st,_=cv2.connectedComponentsWithStats(m2)
big=1+np.argmax(st[1:,4]); out[...,3]*=(lab==big)
Image.fromarray(out.clip(0,255).astype(np.uint8)).save('perro/torso.png')
