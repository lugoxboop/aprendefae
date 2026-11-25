import json,sys,soundfile as sf,numpy as np
from kokoro_onnx import Kokoro
k=Kokoro('kokoro-fp32.onnx','voices-es.bin')
voz,out,speed=sys.argv[1],sys.argv[2],float(sys.argv[3])
G=json.load(open('guion.json'))
# pausa entre frases de una misma escena, por signo final
def pausa(f):
    return 0.32 if f.endswith(('.','?')) else 0.12
def trim(a,sr):
    idx=np.where(np.abs(a)>0.008)[0]
    return a[max(0,idx[0]-int(.02*sr)):min(len(a),idx[-1]+int(.05*sr))]
res=[]
for i,esc in enumerate(G):
    partes=[];fr=[];t=0
    for j,f in enumerate(esc):
        a,sr=k.create(f,voice=voz,speed=speed,lang='es-419'); a=trim(a,sr)
        fr.append({'texto':f,'ini':round(t,3),'fin':round(t+len(a)/sr,3)})
        partes.append(a); t+=len(a)/sr
        if j<len(esc)-1:
            p=pausa(f); partes.append(np.zeros(int(p*sr),dtype='float32')); t+=p
    a=np.concatenate(partes); sf.write(f'{out}/e{i+1}.wav',a,sr)
    res.append({'escena':i+1,'dur':round(len(a)/sr,3),'frases':fr})
    print(i+1,round(len(a)/sr,2),[ (x['texto'],x['ini']) for x in fr])
json.dump(res,open(f'{out}/frases.json','w'),ensure_ascii=False,indent=1)
