"""
Le quita al cuerpo nuevo del perro los brazos que trae dibujados (20-nov).

Mateo: «el perro tiene como cuatro brazos». La hoja perro_torso.png de Gemini
trae los brazos pegados a los lados, y encima van los brazos sueltos (bc_d,
bc_i) que se animan. Se corta cada brazo por su línea interior (prolongada
hasta el hombro) y se borra con su contorno de fuera. Luego:

  python3 scripts/mascotas/perro-sin-brazos.py <hoja-original> <carpeta>/perro_torso.png
  python3 scripts/mascotas/brazos-colgando.py <carpeta> public/mascotas

Ojo: el cuerpo queda más angosto; su x en marionetas.js se corrió para que
no se mueva (181 → 207).
"""
import sys
import cv2, numpy as np
from scipy.ndimage import binary_fill_holes
im=cv2.imread(sys.argv[1])
work=im.copy()
for a,b in [((417,179),(433,118)),((606,178),(591,118))]:
    cv2.line(work,a,b,(0,0,0),7,cv2.LINE_AA)
dark=(work.min(axis=2)<90).astype(np.uint8)
n,lab,st,_=cv2.connectedComponentsWithStats(1-dark,connectivity=4)
fondo=lab==lab[5,5]
sil=binary_fill_holes(~fondo)
cuerpo=lab[250,512]
brazos=[i for i in range(1,n) if i not in (cuerpo,lab[5,5]) and st[i,1]<360 and (st[i,0]+st[i,2]<432 or st[i,0]>592)]
print(len(brazos), "trozos de brazo borrados")
A=np.isin(lab,brazos)
otros=(~fondo)&(dark==0)&~A
k=np.ones((15,15),np.uint8)
Ad=cv2.dilate(A.astype(np.uint8),k)>0
Bd=cv2.dilate(otros.astype(np.uint8),k)>0
quitar=A|((dark>0)&Ad&~Bd)
keep=sil&~quitar
keep=cv2.morphologyEx(keep.astype(np.uint8),cv2.MORPH_OPEN,np.ones((3,3),np.uint8))>0
out=np.where(keep[...,None],work,255).astype(np.uint8)
cv2.imwrite(sys.argv[2],out)
