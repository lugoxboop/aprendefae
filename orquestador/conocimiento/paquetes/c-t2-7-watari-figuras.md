# Figuras de T2 al tope 206 · lote T2-7 · Watari → L

Delta sobre `c-t2-3-watari-figuras.md`. El tope de #524 es de 206 px a 320 y 253 a 375. Lo demás de T2-3 no cambia.

## Alto nuevo por pieza

| Pieza | Figura a 320 (antes → ahora, pantalla y estado que mandan) | a 375 | `altoFigura` | Banda máx. 320 · 375 | Qué cambió |
|---|---|---|---|---|---|
| P1 `cu-a1-anatomia-de-una-cuenta` | 213 → **183** (pantalla 6, error2) | 213 → **183** | `altoFigura: { a320: 183, a375: 183 }` | 108 · 104 | Sin la línea de estado de 24 px bajo «Sube» y «Baja» (pantalla 6). La T, su saldo y los dos controles siguen iguales. |
| P2 `cu-a2-dos-familias` | 183 → **171** (pantalla 7, bien) | 183 → **158** | `altoFigura: { a320: 171, a375: 158 }` | 108 · 104 | No pasaba del tope. Pierde la pastilla en «Sí, se cierra» y «No, sigue abierta» (pantalla 6). |
| P3 `cu-a5-debe-y-haber` | 214 → **180** (pantalla 7, error1) | 177 → **173** | `altoFigura: { a320: 180, a375: 173 }` | 130 · 108 | Las tres opciones apiladas de la pantalla 7 ya no llevan la pastilla en un tercer renglón: el botón tocado mide 48 px, antes 82. La línea de la mesa se queda. |
| P4 `cu-a3-partida-doble` | 212 → **181** (pantalla 8, error1) | 208 → **178** | `altoFigura: { a320: 181, a375: 178 }` | 108 · 108 | Sin la línea de estado bajo «Sí, lo descuadra» y «No lo descuadra» (pantalla 8). La balanza de ene-03 con los dos contadores se queda entera. |
| P5 `cu-a4-diario-y-mayor` | 218 → **197** (pantalla 6, error1) | 218 → **197** | `altoFigura: { a320: 197, a375: 197 }` | 108 · 104 | Los nueve hechos de «Verlos por fecha» (pantalla 1) van a 12/15 px, sin relleno vertical: la lista pasa de 166 a 142 px. El estado más alto pasa a ser la pantalla 6 (renglón del diario sobre la T de Bancos), que mide 197. |

Medido: 212 estados a 258 y 313 px. Letra mínima 12 px. Botones de menos de 44 px, fuera de caja o desbordados: 0.

## Qué cambió

- **La pastilla sale de la figura.** La palabra («Correcto» o «No va aquí») la pinta `<Veredicto />`, y #492 prohíbe una pastilla propia. Dentro de la figura, el control tocado se queda con el ícono ✓ o ✕ (forma, no solo color) y el borde de 2 px, que es la regla 3 del §2 de Hanayama. El nombre accesible del botón lleva la palabra. Se van la línea `.estado-op` de 24 px y la pastilla dentro de las opciones apiladas, y con eso P1, P3 y P4 quedan debajo del tope.
- **La lista de nueve hechos de P5, más apretada.** A 12 px con interlineado de 15 y sin relleno vertical. La letra mínima sigue en 12 px.
- **Las frases de consecuencia caben en una línea a 320.** Siguen en la banda, antes de la pastilla. Pasan de dos renglones a uno, de 18 px, y le dejan esos px al porqué de Near. Las doce frases nuevas están abajo.
- **El alto de figura por pieza es el medido, no 206.** Cada pieza pide en `altoFigura` el alto de su pantalla más alta. Lo que le sobra hasta 206 se lo queda la banda.

| Frase de consecuencia en T2-3 | T2-7, una línea a 320 |
|---|---|
| Así el saldo quedaría del lado de $150, el movimiento menor. | Así quedaría del lado de $150. |
| Así la deuda quedaría en $4.250: pagar la haría crecer. | Así pagar subiría la deuda a $4.250. |
| Así quedaría con los gastos de vender, no con el valor de lo vendido. | Así sería un gasto de vender. |
| Así, 20X2 empezaría con gastos de 20X1. | Así 20X2 traería gastos de 20X1. |
| Así, el 1 de enero Bancos diría $0, y el dinero sigue en el banco. | Así Bancos diría $0 el 1 de enero. |
| Así sus $50.000 en el debe la habrían hecho bajar. | Así su debe de $50.000 la bajaría. |
| Así aparecería un ingreso de $500, y nadie se lo ganó. | Así habría un ingreso que nadie ganó. |
| Así el activo pesaría $50.000 contra $0. | Así sería $50.000 contra $0. |
| Así una venta, que sube el patrimonio, lo bajaría. | Así una venta bajaría el patrimonio. |
| Así la hipoteca subiría a $8.400 por pagarla. | Así la hipoteca subiría a $8.400. |
| Si lo descuadrara, un lado sumaría más que el otro. | Así un lado sumaría más que el otro. |
| Así el mayor repetiría el orden del diario. | Así el mayor sería otro diario. |

## La banda (issue #536 a Erwin)

- El tope de 206 cuenta con una banda de 66 px bajo la figura (Hanayama, #513 §1-§2). `SecuenciaAprender` todavía no la tiene, y #492 manda pintar `<Veredicto />` dentro de la figura, que es de alto fijo.
- Medido: la devolución (consecuencia, pastilla y pista o porqué) mide de 104 a 130 px. Junto con la figura pasa de 206 en todos los Haz. Puesta en la banda, con el `altoFigura` medido, cabe a 375 sin desplazar; a 320 desplaza de 7 a 38 px, dentro de los 40 que permite el §4 de #470.
- Pedido a Erwin en #536: que la cáscara pinte la devolución en la zona del apoyo cuando el Haz ya se respondió. Mientras no llegue, Misa no debe meter `<Veredicto />` dentro de la figura con estos `altoFigura`.
- Para Near (por L): el porqué de P3·4 al segundo error ocupa 4 renglones a 320 (130 px). Con 16 palabras o menos baja a 3 renglones.

## CSS del delta (para Misa)

```css
/* T2-7 · sobre lo de T2-3 */
/* P5 · los nueve hechos de «Verlos por fecha» */
.nueve { gap: 0; }
.nueve p { line-height: 1.25; padding: 0 4px; }   /* 12 px · 15 de interlineado */
.nueve .lit { outline: 0; box-shadow: inset 3px 0 0 #F8F9FA; }   /* el hecho con Bancos: fondo y barra, sin contorno que se pise con el vecino */
/* Opciones de la figura: sin .estado-op y sin pastilla dentro. El tocado: ícono + borde 2 px */
.ctl.mal  { border: 2px solid var(--coral); padding: 5px 9px; }
.ctl.bien { border: 2px solid #F8F9FA;      padding: 5px 9px; }
.ctl svg  { width: 16px; height: 16px; flex: none; }   /* lucide X o Check, trazo 2,5 */
.ctl.mal svg { color: var(--coral-t); }
/* aria-label del tocado: «{opción}, no va aquí» o «{opción}, correcto» */
```
