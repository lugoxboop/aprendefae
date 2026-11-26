# El sonido de los microvideos

Pedido de Mateo (26-nov-2026): **los efectos nunca más fuertes que la voz** y **la música de fondo
variada, no siempre la misma**.

## Cómo queda la mezcla (sonido/mezcla.py)

- La voz manda: se normaliza y la mezcla final queda a -16 LUFS (volumen estándar en celular).
- Cada efecto queda **al menos 6 dB debajo de la voz** en cada instante (medido en ventanas de
  50 ms, así que también cubre golpes cortos). Entre palabras y en pausas, debajo del nivel típico
  de la voz. El efecto típico suena unos 10 dB debajo de la voz: se oye, no tapa.
- La música va 21 dB debajo de la voz mientras se habla y sube a 12 dB debajo en las pausas.
- Cada video tiene su propia pista (`videos.json`); dos videos seguidos nunca comparten pista.

## Las pistas de música (sonido/musica/)

Nueve pistas instrumentales de 80 s, generadas con Eleven Music (plan Creator: licencia
comercial). Revisadas con la transcripción de ElevenLabs: ninguna trae voz cantada.
lo-fi de café, marimba curiosa, guitarra andina, jazz ligero, sintes de estudio, ukelele,
cumbia tranquila, piano pensativo, bossa nova. Para pedir más, se agregan al `pedido.json`.

## Cómo se rehace

1. `pedido.json` + `eleven.mjs`: se empuja un cambio al pedido y el workflow
   `.github/workflows/sonido-microvideos.yml` llama a ElevenLabs (la clave solo vive allí) y
   confirma los archivos a la misma rama. Acciones: `musica`, `aislar`, `voces`, `revisar`, `cupo`.
2. `_aislada/`: la voz limpia de cada video publicado, sacada con Voice Isolator de ElevenLabs
   (la narración original vive fuera del repo).
3. `bash sonido/remezcla.sh` (desde `macro/`): saca de Remotion la pista de efectos sola
   (`pistas.mjs`, `--props pista=fx`), mide la mezcla vieja (`antes.py`) y arma la nueva
   (`mezcla.py`) copiando la imagen tal cual.

## Medición (26-nov-2026)

Momentos en que el fondo (efectos + música) sonaba más fuerte que la voz:

| Video | Antes | Peor efecto sobre la voz | Después |
|---|---|---|---|
| carrito | 38 | +14,6 dB | 0 |
| vaso-renta | 36 | +14,2 dB | 0 |
| columpio-tasa | 36 | +15,5 dB | 0 |
| no-miran-renta | 30 | +17,3 dB | 0 |
| bisagra-ascensor | 32 | +13,4 dB | 0 |
| eco-multiplicador | 32 | +14,5 dB | 0 |
| mecanico | 32 | +23,3 dB | 0 |
| fiebre | 35 | +14,3 dB | 0 |
| problema-resuelto | 34 | +15,1 dB | 0 |

## Voces (sonido/voces-muestra/)

La misma frase con 8 voces del plan Creator, para que Mateo compare (Brian sigue siendo la voz
de la plataforma hasta que él decida otra): brian, brian2 (Brian C., narrador latino
profesional), juan (colombiano), david, gaby, isabel, luisa, sandra.
