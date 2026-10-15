#!/usr/bin/env bash
# Baja Sora e Inter (@fontsource 5.3.0) para la sonda de enganche, sin subir binarios al repo.
# Uso: bash scripts/t4/sonda-enganche/fuentes.sh   (o SONDA_FUENTES=/otra/ruta bash ...)
# Deja <destino>/fontsource-sora-5.3.0/package/ y <destino>/fontsource-inter-5.3.0/package/,
# que es lo que busca base.py. Destino por defecto: .sonda-fuentes/ junto a este archivo (ignorado por git).
set -euo pipefail
AQUI="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
DEST="${SONDA_FUENTES:-$AQUI/.sonda-fuentes}"
TMP="$(mktemp -d)"
trap 'rm -rf "$TMP"' EXIT
mkdir -p "$DEST"
( cd "$TMP" && npm pack --silent @fontsource/sora@5.3.0 @fontsource/inter@5.3.0 >/dev/null )
for fam in sora inter; do
  rm -rf "$DEST/fontsource-$fam-5.3.0"
  mkdir -p "$DEST/fontsource-$fam-5.3.0"
  tar -xzf "$TMP/fontsource-$fam-5.3.0.tgz" -C "$DEST/fontsource-$fam-5.3.0"
done
for f in sora-latin-300 sora-latin-400 sora-latin-600 sora-latin-700 sora-latin-800 \
         inter-latin-400 inter-latin-500 inter-latin-600 inter-latin-700; do
  fam="${f%%-*}"
  test -f "$DEST/fontsource-$fam-5.3.0/package/files/$f-normal.woff2" || { echo "falta $f-normal.woff2 en $DEST" >&2; exit 1; }
done
echo "fuentes listas en $DEST"
