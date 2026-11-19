import numpy as np, json, os, sys
from PIL import Image
OUT=sys.argv[1]
SP={
 'zorro':('zorro_src',False,'torso cabeza oreja_i oreja_d cola pierna brazo_i brazo_d','ojo_i ojo_d feliz_i feliz_d triste_i triste_d racha_i racha_d boca_sonrisa boca_abierta boca_triste','lagrima llama',''),
 'gato':('gato',False,'torso cabeza oreja_i oreja_d cola brazo pierna_i pierna_d','ojo_i ojo_d feliz_i feliz_d triste_i triste_d racha_i racha_d boca_sonrisa boca_feliz boca_abierta boca_triste','lagrima llama',''),
 'perro':('perro',False,'torso cabeza oreja_i oreja_d cola brazo_i brazo_d','ojo_i ojo_d feliz triste_i triste_d racha_i racha_d boca_sonrisa boca_racha boca_abierta boca_triste','lagrima llama',''),
 'hamster':('hamster',False,'torso cabeza oreja_i oreja_d cola pierna_i pierna_d brazo_i brazo_d','ojo_i ojo_d feliz_i feliz_d triste_i triste_d racha boca_sonrisa boca_abierta boca_triste','lagrima llama',''),
 'conejo':('conejo',True,'torso cabeza oreja_i oreja_d cola brazo_i brazo_d','ojo_i ojo_d feliz_i feliz_d triste_i triste_d racha_i racha_d boca_sonrisa boca_abierta boca_triste','lagrima llama',''),
 'huron':('huron',False,'torso cabeza oreja_i oreja_d cola pierna_i pierna_d brazo_i brazo_d','boca_tranquila','lagrima llama','cara_tranquila cara_feliz cara_triste cara_racha'),
}
K=0.5
def hsv(a):
  r,g,b=a[...,0],a[...,1],a[...,2]
  mx=a[...,:3].max(2); mn=a[...,:3].min(2); d=mx-mn
  s=np.where(mx>0,d/np.maximum(mx,1e-6),0)
  h=np.zeros_like(mx); dd=np.maximum(d,1e-6)
  h=np.where(mx==r,((g-b)/dd)%6,np.where(mx==g,(b-r)/dd+2,(r-g)/dd+4))*60
  h=np.where(d<1e-6,0,h)
  return h,s,mx
def save(arr,path,w,h,q=82):
  im=Image.fromarray(np.clip(arr*255,0,255).astype(np.uint8),'RGBA').resize((max(1,round(w*K)),max(1,round(h*K))),Image.LANCZOS)
  im.save(path,'WEBP',lossless=True,quality=100,method=6) if q=='LL' else im.save(path,'WEBP',quality=q,method=6)
datos={}
for sp,(src,blanco,cuerpo,cara,nada,banda) in SP.items():
  od=f'{OUT}/{sp}'; os.makedirs(od,exist_ok=True)
  piezas={}; Ls=[]
  for tipo,lista in (('cuerpo',cuerpo),('cara',cara),('nada',nada),('banda',banda)):
    for n in lista.split():
      a=np.array(Image.open(f'{src}/{n}.png').convert('RGBA')).astype(np.float32)/255
      H,W=a.shape[:2]; al=a[...,3]
      h,s,v=hsv(a); L=0.2126*a[...,0]+0.7152*a[...,1]+0.0722*a[...,2]
      pink=((h>=330)|(h<14))&(s>.15)&(v>.45)
      if tipo in('cuerpo','banda'):
        fur=(v>.25)&~pink
        if not blanco: fur&=~((s<.06)&(v>.88))
        if tipo=='banda': fur&=~((s>.45)&(v<.6))
      elif tipo=='cara':
        fur=(h>=18)&(h<=55)&(s>.2)&(s<.8)&(v>.6)&(al>.8)
        if n.startswith(('boca','ojo','feliz')): fur[:]=False
        import cv2
        fu=cv2.morphologyEx(fur.astype(np.uint8),cv2.MORPH_OPEN,np.ones((3,3),np.uint8))
        nn,lb,st,_=cv2.connectedComponentsWithStats(fu)
        fur=np.isin(lb,[i for i in range(1,nn) if st[i,4]>=80])
        fur=cv2.dilate(fur.astype(np.uint8),np.ones((3,3),np.uint8)).astype(bool)&(al>.05)&(v>.45)
      else: fur=np.zeros_like(al,bool)
      if tipo in ('cara','banda'):
        borde=(al<.97)[...,None]
        a[...,:3]=np.where(borde,a[...,:3]*(0.3+0.7*al[...,None]**2),a[...,:3])
      save(a,f'{od}/{n}.webp',W,H)
      tin=bool((fur&(al>.5)).sum()>40)
      if tin:
        import cv2
        L8=cv2.medianBlur((L*255).astype(np.uint8),5).astype(np.float32)/255
        L=np.where(cv2.erode(fur.astype(np.uint8),np.ones((5,5),np.uint8))>0,L8,L)
        for _ in range(3 if blanco else 1): L=cv2.bilateralFilter(L.astype(np.float32),9,0.04 if blanco else 0.06,5)
        bajo=cv2.dilate(fur.astype(np.uint8),np.ones((7,7),np.uint8)).astype(bool)
        p=np.dstack([L,L,L,al*bajo]); f=a.copy(); f[...,3]=al*(~fur)
        save(p,f'{od}/{n}_p.webp',W,H,'LL'); save(f,f'{od}/{n}_f.webp',W,H)
        if tipo=='cuerpo': Ls.append(L[fur&(al>.9)])
      piezas[n]=[W,H,1 if tin else 0]
  Ls=np.concatenate(Ls)
  c1,c2=np.quantile(Ls,.3),np.quantile(Ls,.85)
  for _ in range(20):
    lab=np.abs(Ls-c1)<np.abs(Ls-c2); c1,c2=Ls[lab].mean(),Ls[~lab].mean()
  if blanco or c2-c1<.12: c1,c2=np.quantile(Ls,.45),max(np.quantile(Ls,.95),np.quantile(Ls,.45)+.04)
  rampa=[round(float(x),3) for x in (c1*.55,c1*.8,c1,c2)]
  datos[sp]={'piezas':piezas,'rampa':rampa}
  sz=sum(os.path.getsize(f'{od}/{f}') for f in os.listdir(od))
  print(sp,rampa,len(piezas),'piezas',round(sz/1024),'KB')
json.dump(datos,open(f'{OUT}/datos.json','w'))
