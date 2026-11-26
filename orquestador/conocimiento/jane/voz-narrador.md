---
id: jane-voz-narrador
titulo: La voz del narrador de los microvideos
procedencia: decisión de Mateo, 2026-11-25
estado: vigente
---

# La voz del narrador

**Voz única de la plataforma: «Brian - Warm, Smooth, Confident»** (ElevenLabs,
español, acento Latin American). La eligió Mateo el 2026-11-25 entre tres
muestras con la misma frase (Brian, Luisa y Gaby). Se usa en todos los
microvideos para que el narrador sea reconocible.

## Cómo se genera

- ElevenLabs en el navegador, con la cuenta gratuita de Mateo (la sesión está en
  el perfil de Chrome «Aprendefae»). Texto a voz, modelo Eleven v4, estabilidad
  50 %, similitud 75 %, salida MP3 44,1 kHz 128 kbps.
- Se pega el **guion completo** de una vez, una frase por párrafo. Cada
  generación da dos tomas; se elige la mejor.
- La voz se graba primero; los tiempos de cada escena salen del audio medido.
- **Ojo al pegar textos largos:** el cuadro de ElevenLabs puede cortar el final
  (pasó el 2026-11-25: la narración salió sin la última pregunta). Antes de
  generar, leer el final del cuadro; después, transcribir el audio y comparar
  con el guion. Si falta una frase, se regenera solo esa frase y se empalma.

## Cupo y licencia

- Plan gratuito: 10.000 créditos al mes (un crédito por carácter).
- **Audio de plan gratuito: sin licencia comercial.** Lleva el crédito
  «Voz: elevenlabs.io» en el video. Antes de publicar a estudiantes o mostrar a
  otra facultad hay que avisar a Mateo: para esos usos se regenera con un plan pago.

### Decisión de Mateo sobre la licencia (2026-11-25)

Al aprobar «El mango de Toby» para publicarlo en Macro, se le recordó que la voz
es del plan gratuito y no tiene licencia comercial. Su respuesta textual:
**«mantenlo y publicalo»**. El video se publicó con esa voz y con el crédito
«Voz: elevenlabs.io». El riesgo de licencia quedó aceptado por él para este
video; para los siguientes se le vuelve a preguntar.

| Mes | Uso | Créditos |
|---|---|---|
| 2026-11 | 3 muestras de voz (111 caracteres cada una) | 333 |
| 2026-11 | Narración completa de «El mango de Toby» (878 caracteres) | 878 |
| 2026-11 | Última frase de «El mango de Toby», regrabada (87 caracteres) | 87 |
| 2026-11 | Microvideos Macro 2026: T1 A1–A6 y T2 A1–A3 (9 narraciones, unos 7.400 caracteres, más un sobrante pegado en A1) | ≈7.400 |
| 2026-11 | Saldo al cierre del 26-nov | 1.261 restantes de 10.000 |

## Voz anterior (retirada)

Kokoro-82M `em_alex` (Apache-2.0), usada en el primer intento del microvideo de
la ley de la demanda. Mateo la rechazó por robótica el 2026-11-25.

## Música y efectos (decisión de Mateo, 2026-11-26)

Los efectos nunca suenan más fuerte que la voz y la música de fondo cambia de un video a otro.
La mezcla final se hace con `microvideos/macro/sonido/mezcla.py`; las pistas y cómo pedir más
están en `microvideos/macro/sonido/README.md`. Muestras de 8 voces del plan Creator en
`microvideos/macro/sonido/voces-muestra/` para que Mateo elija si cambia la voz.
