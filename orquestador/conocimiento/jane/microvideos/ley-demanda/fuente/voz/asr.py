import sys, soundfile as sf, numpy as np
from faster_whisper import WhisperModel
m=WhisperModel('/tmp/claude-0/dl/wh/m/package',device='cpu',compute_type='int8')
def load(p):
    a,sr=sf.read(p,dtype='float32')
    if a.ndim>1: a=a.mean(1)
    if sr!=16000:
        import numpy as np
        n=int(len(a)*16000/sr); a=np.interp(np.linspace(0,len(a)-1,n),np.arange(len(a)),a).astype('float32')
    return a
for p in sys.argv[1:]:
    segs,_=m.transcribe(load(p),language='es',word_timestamps=True)
    segs=list(segs)
    print(p,'|',' '.join(s.text.strip() for s in segs), '| avg_logprob', [round(s.avg_logprob,2) for s in segs])
