#!/usr/bin/env bash
# Vuelve a mezclar el audio de los microvideos publicados sin tocar la imagen ni la voz.
# Necesita: sonido/_aislada/<video>.mp3 (voz limpia, ver eleven.mjs) y las pistas de sonido/musica/.
# Uso (desde la carpeta macro/):  bash sonido/remezcla.sh [carpeta-de-trabajo]
set -euo pipefail
W=${1:-/tmp/remezcla}; mkdir -p "$W"
PUB=../../../../../public/macro2026/videos
while read -r -u 3 v; do
  id=$(jq -r .id <<<"$v"); vid=$(jq -r .video <<<"$v"); mu=$(jq -r .musica <<<"$v")
  [ -f "$W/$id-fx.wav" ] || node sonido/pistas.mjs "$id" fx "$W/$id-fx.wav"
  [ -f "$W/$id-musica.wav" ] || node sonido/pistas.mjs "$id" musica "$W/$id-musica.wav"
  [ -f "$W/$vid-original.mp4" ] || cp "$PUB/$vid.mp4" "$W/$vid-original.mp4"
  antes=$(python3 sonido/antes.py "$W/$vid-original.mp4" "$W/$id-fx.wav" "$W/$id-musica.wav")
  despues=$(python3 sonido/mezcla.py --voz "sonido/_aislada/$vid.mp3" --fx "$W/$id-fx.wav" \
    --musica "sonido/musica/$mu.mp3" --video "$W/$vid-original.mp4" --salida "$W/$vid.mp4")
  echo "{\"video\":\"$vid\",\"antes\":$antes,\"despues\":$despues}"
done 3< <(jq -c '.videos[]' sonido/videos.json)
