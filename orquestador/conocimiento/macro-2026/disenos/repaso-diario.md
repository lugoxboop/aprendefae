# Repaso Diario de Macroeconomía 2026 · «La ronda del economista»

Diseño de Gen, 24-nov-2026. Orden de Mateo: un repaso general, como el que
había antes, que junte preguntas de todos los temas al azar y cambie los datos
en cada intento. **Sin publicar**: se ve solo en `#/macro-2026/repaso` hasta el
visto bueno de Mateo.

## La idea

El estudiante es **el economista de guardia de la ciudad** y atiende diez
consultas en los cinco lugares de la materia: la plaza (T1), el despacho (T2),
la hacienda (T3), la bóveda (T4) y el puerto (T5). Cada consulta es una
**plantilla**: la situación es la misma, pero las cifras, la noticia o las
medidas se sortean en cada intento, así que nunca sale igual.

Respaldo: práctica de recuperación intercalada (Rohrer y Taylor, 2007; Rohrer,
2012): mezclar temas obliga a reconocer qué herramienta usar, que es justo lo
que el examen pide. Repetición espaciada: el motor trae primero lo fallado y lo
que se está olvidando (B4). Las figuras son las mismas de las piezas de cada
tema, para que la pista visual dispare el recuerdo (principio de señalización
de Mayer). Variar las cifras evita que se aprenda la respuesta de memoria.

## La ronda

- **Portada**: escena de la plaza, TU PAPEL «Hoy eres el economista de guardia
  de la ciudad», contexto, cuatro mascotas del día, los temas que entran y
  «Empezar la ronda».
- **Ruta del día** arriba: diez paradas con su tema (T1…T5, color del lugar +
  texto). La actual crece; las hechas quedan con ✓ o ✗ (forma, no solo color).
- **Cada consulta**: escena completa del tema (telón ilustrado, mascota de
  180 px, TU PAPEL ≤ 15 palabras, contexto ≤ 30), consigna ≤ 12 palabras,
  figura grande y su mecánica; retro propia (≤ 15 palabras) y «Siguiente
  consulta».
- **Balance**: «N de 10», barra por tema y «Para repasar: …» con los temas
  flojos. En el sitio: «Otra ronda de práctica» (sin FP).
- **Orden**: los cinco temas siempre presentes; de menos a más (nivel 1 → 3);
  dos seguidas no repiten tema, mecánica ni mascota cuando se puede evitar.

## Las 14 plantillas

| id | Tema | Mecánica | Nivel | Qué cambia en cada intento | Hacer de origen |
|---|---|---|---|---|---|
| rd-da-carrito | T1 | Bandejas C/I/G/XN + carrito que se llena | 1 | 3 de 8 gastos, de componentes distintos | da26-h1 |
| rd-da-curva | T1 | Curva de DA: sube / baja / se empina / se aplana | 1 | 1 de 9 noticias | da26-h3 |
| rd-da-multiplicador | T1 | Deslizador + ecos del multiplicador | 3 | c, t (7 combinaciones) y ΔG | da26-h6 |
| rd-pe-ventanilla | T2 | Bandejas de las 4 ramas | 2 | 3 de 10 medidas | pe26-h3 |
| rd-pe-escalera | T2 | Ordenar los 6 peldaños de un plan | 3 | 4 casos y sus cifras | pe26-h1 |
| rd-pf-expansiva | T3 | Bandejas PFE/PFC + medidor de DA | 1 | 3 de 8 medidas | pf26-h4 |
| rd-pf-factura | T3 | Factura con IVA (única de opciones) | 2 | producto y base | pf26-h3 |
| rd-pf-cadena | T3 | Dominó de la medida fiscal | 2 | 3 cadenas | pf26-h4 |
| rd-pm-medidas | T4 | Bandejas PME/PMC + medidor de dinero | 2 | 3 de 6 medidas | pm26-h5 |
| rd-pm-encaje | T4 | Deslizador + cascada (D − E = Cr) | 2 | depósito y encaje | pm26-h2 |
| rd-pm-cadena | T4 | Dominó de la tasa | 2 | sube o baja | pm26-h6 |
| rd-pc-pareja | T5 | Balanza del dólar: ¿a quién le conviene? | 1 | tc inicial y final | pc26-h4 |
| rd-pc-cadena | T5 | Dominó del mercado de divisas | 2 | 3 cadenas | pc26-h2 |
| rd-pc-real | T5 | Aguja del cambio real (Δtcr) | 3 | inflaciones y Δ nominal | pc26-h3 |

Selección múltiple: 1 de 14 (la factura). Textos exactos, retros y rangos:
`src/macro2026/repaso/plantillas.js` (fuente única).

## Puntaje y etiquetado

Hacer evaluativa, medio, **60 FP × % de aciertos**, renovable cada día (igual
que los otros dos repasos). Una consulta = un ítem del historial con clave = id
de la plantilla; cada ítem lleva sus subtemas (los de la ficha del tema).

## Autoevaluación (Kit)

| Dimensión | Nivel | Por qué |
|---|---|---|
| Fidelidad | Avanzado | Todo sale de las fichas 1-5; nada de material nuevo |
| Texto | Avanzado | Medido en 150 semillas: rol ≤ 9, contexto ≤ 24, consigna ≤ 11 |
| Mecánica / variedad | Avanzado | 6 mecánicas, opciones 1 de 14 |
| Retro | Avanzado | Propia por opción y error típico (olvidar t, encaje, nominal) |
| Visual | Avanzado | Escena + mascota de 180 px + figura grande del tema |
| Rejugabilidad | Avanzado | Datos nuevos cada intento; motor de repetición espaciada |
| Celular | Avanzado | Sin desborde a 320 y 375 (sonda de Playwright) |

## Para publicarlo (cuando Mateo apruebe)

1. Pasar `supabase/macro2026-pendientes/repaso_diario_macro.sql` a
   `supabase/migrations/` con su número.
2. Entrada en `ACTIVIDADES_TRANSVERSALES` (src/data/subjects.js) con id
   `repaso-diario-macro`, `indice: "macroeconomia"` y la clasificación de arriba.
3. Entrada en `REPASOS` (src/repaso/repasos.js) con `POOL_MACRO` y los cinco
   temas, y montar `RepasoMacro` en la vista del repaso para ese id (las
   consultas salen de `armarRonda` con el barajado sembrado del día).
4. El banner del índice de Macroeconomía.
