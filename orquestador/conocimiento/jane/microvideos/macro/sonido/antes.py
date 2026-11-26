"""Mide la mezcla publicada: voz original = mezcla − efectos − música (las pistas salen exactas de Remotion).
python3 sonido/antes.py <video.mp4> <fx.wav> <musica.wav>"""
import sys, json, numpy as np
sys.path.insert(0, __file__.rsplit("/", 1)[0])
from mezcla import lee, ajusta, informe_fondo, env_db
mix = lee(sys.argv[1], 2); n = len(mix)
fx = ajusta(lee(sys.argv[2], 2), n); mu = ajusta(lee(sys.argv[3], 2), n)
voz = (mix - fx - mu).mean(axis=1)
r = informe_fondo(voz, fx + mu, "antes")
r["solo_efectos"] = informe_fondo(voz, fx, "antes, solo efectos")
print(json.dumps(r, ensure_ascii=False))
