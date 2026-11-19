import cv2, numpy as np
from scipy import ndimage as nd
def load(n): return cv2.imread(f'p/{n}.png',cv2.IMREAD_UNCHANGED).astype(np.float32)
def save(n,a): cv2.imwrite(f'p/{n}.png',np.clip(a,0,255).astype(np.uint8))
# piezas con huecos blancos encerrados: n = cuántos huecos (los más grandes), alfa del hueco
HUECOS={'gafas':(2,0.16),'antifaz':(2,0),'collar':(1,0),'bufanda':(1,0),'medalla':(1,0)}
for n,(k,al) in HUECOS.items():
  a=load(n); bgr=a[...,:3]; A=a[...,3]/255
  claro=(bgr.min(axis=2)>200)&(A>0.5)
  lab,c=nd.label(claro)
  borde=set(np.unique(np.r_[lab[0],lab[-1],lab[:,0],lab[:,-1]]))
  tam=sorted([(np.sum(lab==i),i) for i in range(1,c+1) if i not in borde],reverse=True)[:k]
  for _,i in tam:
    m=cv2.dilate((lab==i).astype(np.uint8),np.ones((3,3),np.uint8))>0
    m&=bgr.min(axis=2)>150  # no comerse el contorno
    A[m]=al
  a[...,3]=A*255; save(n,a); print(n,[t for t,_ in tam])
# casco: cúpula de vidrio translúcida, contorno y aro opacos
a=load('casco'); bgr=a[...,:3]; A=a[...,3]/255; h=a.shape[0]
mn=bgr.min(axis=2); g=bgr.mean(axis=2)
ys=np.arange(h)[:,None]*np.ones(a.shape[1])
# el aro blanco de abajo: filas desde ~82% de la altura
cup=(ys<h*0.80)&(A>0.9)
vid=cup&(g>120)
brillo=vid&(mn>215)
A[vid]=0.30; A[brillo]=0.85
a[...,3]=A*255; save('casco',a)
