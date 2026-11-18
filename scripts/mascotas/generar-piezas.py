import json
d=json.load(open('out/datos.json'))
L=["/*"," * GENERADO al recortar las piezas de Gemini: no se edita a mano.",
" * Por especie: el tamaño de cada pieza en px del kit [ancho, alto, teñible] y la",
" * rampa de luminancia del pelaje [sombra profunda, sombra, pelo, panza].",
" * teñible = 1 → existe <pieza>_p.webp (el pelaje en grises) y <pieza>_f.webp",
" * (lo que no se tiñe: contorno, nariz, ojos)."," */","export const PIEZAS = {"]
for sp,v in d.items():
  L+= [f"  {sp}: {{", f"    rampa: {json.dumps(v['rampa'])},", "    piezas: {"]
  L+= [f"      {k}: {json.dumps(x)}," for k,x in v['piezas'].items()]
  L+= ["    },","  },"]
L.append("};")
open('src/mascota/marionetas-piezas.js','w').write("\n".join(L)+"\n")
