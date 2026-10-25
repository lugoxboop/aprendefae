# Volumen · Célula E · la forma de nuestros 5 controles propios (Itagaki, v1)

> Lo transcribió Kamogawa desde la entrega de Itagaki (regla j).
> **Takamura, lote 18: PASA con condiciones.** Hay que cumplir:
> 1. **Medir la cabecera real de Hacer antes de construir.** El cálculo de la matriz de GP parte de 167, una cifra que nadie ha medido, y deja 1 px de holgura.
> 2. **El aire entre las casillas y los contadores de GP** solo se baja de 12 a 4 px si no hay otro sitio de dónde recortar. Si no lo hay, se acepta y se revisa en la captura.
> 3. **Las paradas de Ippo** (H1, H2, el banco y el estante de H7) se miden en una sola corrida, con la cabecera real, antes de tocar nada.
> 4. **Una pantalla de PE** con el volumen puesto, más el `git diff` vacío de los controles de Erwin.
>
> Ippo puede construir ya los controles #5, #7 y #8 (el estante de H7, después de medirlo).

Aplica `vida-visual-v1` (#545), §1 a §4, a los controles #3, #4, #5, #7 y #8 de `e-prioridad.md`. **Los valores salen de la escalera del canon (N0, N1, N2, el teal y los cantos publicados); no se agrega ningún tono.** Los cinco controles compartidos son de Erwin (#560) y no se tocan aquí.

---

## 0 · Reglas que valen para los cinco

1. **La escalera.** Una cara N1 (#1D3557) lleva canto N0 (#0E1B2E), con una razón de 1,40:1. Una cara N2 (#344968) lleva canto N1, con 1,35:1. **Las dos pasan el mínimo de 1,25 contra su propia cara** [calculado, §2.4].
2. **Toda cara N2 lleva un filo** de 1 px arriba, en #586A83 (§2.1).
3. **Todo bloque con relieve lleva el contorno de silueta** de 1 px rgba(248,249,250,.18) en lugar del `inset` al 35 %. No se ponen los dos.
4. **Cada control reserva su elevación máxima** (4 px) aunque esté en E1. Así, pasar de E1 a E2 al tocarlo **no mueve nada de abajo**. En E1 queda 1 px libre bajo el canto.
5. **Al pulsar,** la cara va a `translateY(0)` en 100 ms. Al soltar, vuelve en 160 ms. Con hover o foco del ratón, sube a −(N + 2). La curva es `cubic-bezier(.3,.9,.4,1)`. **Solo se anima `transform`.** Con movimiento reducido, el hundido se queda (§3). **Nada va en bucle.**
6. **Las pastillas de veredicto** («Correcto», «No va aquí») **nunca van sobre una cara N2.** Van en la superficie de la pantalla, a 4 px del control. Sobre N2, #EE8266 da 3,49:1 y no pasa; sobre el tinte de la superficie #1C2939 da 4,97:1 (ya medido).

**Contraste del texto sobre las caras** [calculado, WCAG; L(N1) = 0,0350, L(N2) = 0,0649]:

| Texto | Sobre N1 | Sobre N2 |
|---|---|---|
| #F8F9FA | 11,72 ✓ | 8,67 ✓ |
| #B8C4D4 | 6,99 ✓ | 5,17 ✓ |
| #A8B6C8 | 5,99 ✓ | **4,43 ✗**; sobre N2, el texto secundario va en #B8C4D4 |
| #3FA69A («Debe» como texto) | **4,20 ✗** | **3,10 ✗** |
| Teal #2A9D8F (como marca, no como texto) | 3,72 ✓ | **2,75 ✗** (menos de 3:1) |
| Ámbar | 7,40 ✓ | 5,47 ✓ |

**Por eso ningún control con relieve lleva «Debe» en teal sobre su cara.** El lado lo dice la palabra, en #F8F9FA, y la posición: el debe va a la izquierda. El teal y el ámbar quedan solo en los rótulos de la cuenta T, sobre su interior #0D1725 (5,42 y 10,78, ya medidos).

### Cómo se dibuja un destino hundido (lo que recibe)

- **No lleva canto ni filo,** porque el canon prohíbe el canto arriba (§2.1).
- **Lo hundido se marca bajando un escalón:** la cara del destino es **#0D1725**, el interior publicado de la cuenta T. Es más oscura que N0 y que la superficie que la rodea, y no es un tono nuevo.
- **En reposo:** contorno de 1 px rgba(248,249,250,.35), el de siempre.
- **Disponible** (cuando hay una ficha tomada esperando destino): contorno de 1 px **#CBDCF2**. El cambio de color es instantáneo; no se anima.
- **Al pulsar un destino:** como no tiene relieve, se queda el `scale(.97)` del canon.
- **Cuando llega una ficha,** baja de su elevación a E0 con `translateY` en 160 ms y queda plana dentro del hueco.
- **Los destinos no suman alto,** porque no tienen canto.

---

## 1 · Casilla de la matriz · `GastoOPago.jsx` (#3)

| Estado | Cara | Canto | Elevación | ¿Se hunde al pulsar? | ¿Destino hundido? |
|---|---|---|---|---|---|
| Reposo | N1 #1D3557 | N0 #0E1B2E | E1 · 3 px | Sí | No |
| Pulsada o elegida | N2 #344968 + filo | N1 | E2 · 4 px | Sí | No |
| Acierto o error | Igual que la elegida: la elevación no cambia (§4); cambia el borde (2 px #F8F9FA o coral) | — | — | — | — |

- **La ficha que cae** dentro de la casilla queda plana (E0). Sus números siguen en #F8F9FA sobre la cara.
- **Las pastillas van fuera de la casilla,** por la regla 6.

**Alto:** 2 filas de casillas × 4 = **+8 px**.

⚠ **Regla de ventana a 320 × 568, con el encabezado de 167** (⚠ Takamura: medir la cabecera real de Hacer):
- La matriz empieza en **325** (167 + 16 + 130 + 12).
- **El bloque que decide** (la cabecera y las dos filas de 56) mide 168 + 8 = 176 y **termina en 501 ✓**.
- **La matriz completa con contadores** mide 242 + 8 = 250 y **termina en 575: se pasa 7 px de 568** [calculado].
- **Decisión de Itagaki** (reversible; Takamura prefiere recortar en otro sitio si la medida real lo permite): **el aire entre las casillas y los contadores baja de 12 a 4 px.** La matriz queda en 242 y termina en **567 ✓**.
- La línea de lo que habría sido (+16, solo después de un error) queda por debajo de la ventana y entra animada (regla vigente).

---

## 2 · Tarjetas de opción de H1 y H2 (#4)

Archivos: `IngresoOCobro.jsx` (`data-grupo`), `segundaDecision.jsx` (`OpcionSegunda`) y `CuandoSeCausa.jsx` (la fila de marca).

| Estado | Cara | Canto | Elevación | ¿Se hunde? | ¿Destino? |
|---|---|---|---|---|---|
| Reposo | N1 | N0 | E1 · 3 px | Sí | No |
| Pulsada o elegida | N2 + filo | N1 | E2 · 4 px | Sí | No |
| Acierto o error | La elevación no cambia; cambia el borde. La pastilla va fuera. | — | — | — | — |

- **Texto principal:** #F8F9FA (11,72 sobre N1 y 8,67 sobre N2).
- **Texto secundario** (por ejemplo, la fuente o la fecha): #A8B6C8 sobre N1 y **#B8C4D4 sobre N2**.
- **El contorno plano de hoy se quita;** lo reemplaza el contorno de silueta (regla 3).

**Alto:** +4 por tarjeta.

| Pantalla | Tarjetas | Suma |
|---|---|---|
| H1, los grupos | 3 | +12 |
| H1 y H2, la segunda decisión | 3 | +12 |
| H2, la fila de marcas | 3 o 4 | +12 a +16 |

Si alguna pantalla se pasa, el arreglo es bajar el aire entre tarjetas de 8 a 4 px, que ahorra 4 por hueco.

---

## 3 · Fichas y destinos de `ArmaElAjuste.jsx` (#5)

| Control | Cara | Canto | Elevación | ¿Se hunde? | ¿Destino? |
|---|---|---|---|---|---|
| Ficha de nombre y ficha de valor, en reposo | N2 + filo | N1 | **E2 · 4 px** | Sí | No |
| Ficha tomada (esperando destino) | N2 + filo + borde de 2 px #F8F9FA (elegida) | N1 | E2 | — | No |
| Ficha ya puesta en su destino | N2 sin filo | — | **E0**: baja con `translateY` en 160 ms | — | — |
| Columna Debe, columna Haber y hueco «sin nombre» | **#0D1725** | — | Ninguna | No (`scale(.97)` al pulsar) | **Sí** (§0) |

- **Las fichas empiezan en E2 y no en E1.** Son lo que se toma y se lleva, como las fichas de palabra de Duolingo, y su relieve tiene que destacar contra el destino hundido.
- **Texto de la ficha:** el nombre de la cuenta y el valor (en Inter tabular), en #F8F9FA: 8,67.
- **Los rótulos «Debe» y «Haber» de la T** siguen en teal y ámbar, sobre #0D1725.
- **Alto:** +4 por fila de fichas del banco. **Los destinos no suman.**

---

## 4 · Casilla y opciones de `MismoHecho.jsx` (#7)

| Control | Cara | Canto | Elevación | ¿Se hunde? | ¿Destino? |
|---|---|---|---|---|---|
| Casilla del libro (al tocarla, abre la hoja) | **#0D1725** | — | Ninguna | No (`scale(.97)`) | **Sí**: recibe la cuenta |
| Fondo de la hoja | **N1, opaco** | — | — | — | — |
| Opción de la hoja, en reposo | **N2 + filo** | N1 | E1 · 3 px | Sí | No |
| Opción de la hoja, marcada (`role="radio"`) | N2 + filo + borde de 2 px #F8F9FA | N1 | E2 · 4 px | Sí | No |
| «Cancelar» | Botón de texto, sin relieve | — | — | `scale(.97)` | — |

- **Dentro de la hoja, las opciones arrancan en N2:** sobre un fondo N1, una cara N1 desaparecería. El canto N1 se juzga contra su propia cara (1,35), que es la regla de la §2.4.
- **Alto:** la casilla mide 72 [en pantalla, medida de Ippo, #489] y suma **+0**. Cada opción de la hoja pasa de 56 a 60 (+4), y la hoja de 5 cuentas queda en 48 + 5 × 60 = **348 px**, por debajo del tope de 483. **La hoja se abre sobre la pantalla, así que no cuenta para la regla de ventana.**
- **La copia `Comprobar` de este archivo** pasa al Responder compartido (#2 de la lista). Su relieve lo pone Erwin.

---

## 5 · Controles de paso · `QueLeToca.jsx` y `ElCierreCompleto.jsx` (#8)

| Control | Cara | Canto | Elevación | ¿Se hunde? | ¿Destino? |
|---|---|---|---|---|---|
| `BotonPaso` «Antes» y «Después» (H6) | N2 + filo | N1 | E2 · 4 px | Sí | No |
| «Al debe», «Al haber» y «Devolver al estante» (H7) | N2 + filo | N1 | E2 · 4 px | Sí | No |

- **Son botones secundarios, con la misma forma que `BotonComoSeJuega`.** El teal es solo para el Responder.
- **«Al debe» y «Al haber» van con texto #F8F9FA, sin teal ni ámbar en la cara.** El teal da 2,75 sobre N2 y no pasa ni como marca. El lado lo dicen la palabra y la posición.

**Alto:**
- H6: una fila de pasos, **+4**.
- H7: los botones están **en cada renglón del estante** (11 en San Calixto, 10 en La Servicial).
  - **Si el renglón ya tiene 4 px libres debajo del botón,** el canto cabe dentro: **+0**.
  - **Si no, +4 por renglón, hasta +44.**
- ⚠ **Ippo: mide el relleno de un renglón del estante. Si el botón no deja 4 px libres debajo, detente y avisa.** El arreglo sería quitar 4 px del aire entre renglones, para que el estante mida lo mismo.

---

## 6 · Resumen del alto que suma cada pantalla

| Pantalla | Suma | Estado |
|---|---|---|
| GP, la matriz | +8; con el aire de 12 a 4, **±0** | ✓ cabe (567 de 568), pero falta medir la cabecera real |
| H1, los grupos | +12 | Lo mide Ippo |
| H1 y H2, la segunda decisión | +12 | Lo mide Ippo |
| H2, la fila de marcas | +12 a +16 | Lo mide Ippo |
| H3, la hoja | +20 dentro de la hoja | No cuenta (se abre sobre la pantalla) |
| H4 y H5, el banco de fichas | +4 por fila | Lo mide Ippo |
| H6 | +4 | Lo mide Ippo |
| H7, el estante | De 0 a +44 | ⚠ Parada de Ippo (§5) |

**Sin verificar:** no se renderizó. Los altos de H1 a H7 sin volumen son los que Ippo midió en #533 y #557, que Itagaki no tiene; aquí van solo las sumas.
