---
id: voz-narrador
titulo: La voz del narrador de los microvideos (licencia verificada)
procedencia: Jane, 2026-11-25 12:33 (Bogotá), primer microvideo (ley de la demanda)
---

# La voz del narrador

**Una sola voz para toda la plataforma:** `ef_dora` de **Kokoro-82M**, hablando
español con fonemas latinoamericanos (`lang="es-419"`: seseo, «precio» = /pɾesjo/).
Velocidad 1.0. Si Mateo prefiere voz masculina, la alternativa del mismo modelo
es `em_alex` (misma licencia); se decide una vez y no se cambia.

## Licencias (verificadas el 25-nov-2026)

| Pieza | Qué es | Licencia | Dónde se verificó |
|---|---|---|---|
| Kokoro-82M (pesos del modelo) | el modelo de voz | **Apache-2.0** (uso comercial permitido) | `hexgrad/kokoro` LICENSE y README («Apache-licensed weights») |
| `ef_dora.pt` (vector de voz) | parte de la entrega de Kokoro-82M v1.0 | **Apache-2.0** | `remsky/Kokoro-FastAPI` LICENSE, carpeta `api/src/voices/v1_0/` |
| `kokoro-fp32*-shards` (npm) | el `model.onnx` de onnx-community partido en 19 trozos | Apache-2.0 (redistribución) | `package.json` de los paquetes |
| `kokoro-onnx` 0.6.1 (PyPI) | el programa que corre el modelo | MIT | `thewh1teagle/kokoro-onnx` LICENSE |
| `onnxruntime` 1.32 | motor de inferencia | MIT | metadatos de PyPI |
| espeak-ng (vía `espeakng-loader` 0.2.4) | convierte texto en fonemas | GPL-3.0 | — |

**Por qué espeak-ng (GPL) no contagia:** solo se ejecuta como herramienta para
fonetizar; no se distribuye ni se enlaza en AprendeFAE. El audio que sale no es
obra derivada del programa. Lo que se publica son archivos de audio/video.

Apache-2.0 pide conservar el aviso de licencia **si se redistribuye el modelo**;
nosotros solo publicamos el audio generado, así que basta con este registro.
Crédito opcional en créditos del sitio: «Voz: Kokoro-82M (Apache-2.0)».

## Huellas (para comprobar que es el mismo archivo)

- `kokoro-fp32.onnx` (19 trozos unidos): sha256 `8fbea51ea711f2af382e88c833d9e288c6dc82ce5e98421ea61c058ce21a34cb`
- `ef_dora.pt`: sha256 `d9d69b0f8a2b87a345f269d89639f89dfbd1a6c9da0c498ae36dd34afcf35530`

## Cómo se consigue en una sesión en la nube

Hugging Face está bloqueado por la red de estas sesiones. Lo que sí entra:

```sh
# modelo: npm (19 trozos)
for p in kokoro-fp32a-shards kokoro-fp32b-shards kokoro-fp32c-shards; do npm pack $p; done
# (descomprimir y unir part0..part18 en orden → kokoro-fp32.onnx)
# voz: GitHub crudo
curl -O https://raw.githubusercontent.com/remsky/Kokoro-FastAPI/master/api/src/voices/v1_0/ef_dora.pt
pip install kokoro-onnx soundfile
```

El `.pt` se convierte a `voices-es.bin` (npz) leyendo `ef_dora/data/0` como
float32 (510 × 1 × 256); ver `microvideos/ley-demanda/fuente/voz/`.

## Lo que aprendí de esta voz (no repetir)

- Palabras sueltas salen mal: «No.» solo se oye «nos»; «Ojo:» solo, «dojo».
  Pegar la palabra corta a la frase siguiente.
- «No: lo compramos menos» se oye «no lo compramos menos» (¡sentido al revés!).
  Evitar «No» seguido de verbo; reformular.
- Las cifras: escribirlas en letras («dos mil») para la voz y en números en el
  subtítulo («$2.000»).
- Generar **frase por frase** y unir con silencios medidos (0,32 s tras punto,
  0,12 s tras coma): así el tiempo de cada subtítulo sale exacto, sin adivinar.
- Comprobar cada frase con un transcriptor (faster-whisper small): si no
  transcribe lo que dice el guion, un estudiante tampoco lo va a entender.
