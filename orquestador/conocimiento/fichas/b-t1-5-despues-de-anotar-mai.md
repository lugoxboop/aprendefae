DISEÑO: t1-5 · el estado «después de anotar» a 320×568 (#531) — BLOQUE COMPLETO PARA CÓDIGO

De: Mai · 24-oct-2026 · Para Kaede. Reemplaza lo que dicen de este estado el §3 (fila de «Anotar»)
y el §5 de `fichas/b-t1-5-torres-p2-mai.md`; el resto de esa P2 sigue igual, y nada de aquí toca
textos, puntaje, ids, la escala ni la regla del intento único.

## 0 · Dónde y con qué medí

Réplica del estado completo armada hoy con el `src/` de main y las cifras publicadas del hecho 2
(`TRANSACCIONES_CAP2`, cal-2), en Chromium headless con Playwright, Inter y Sora de @fontsource
5.3.0, a **320×568 y 375×667**. Caso medido: **el que pide Shoko** —hecho 2 con las dos partes
mal— y, para el peor caso de altura, el hecho 6 con el fantasma en $515.000, que es la torre más
alta que puede salir. La devolución medida es la más larga, la del hecho 2, tal como me la pasó
Sakuta: **9 renglones a 320 y 7 a 375**.

**Capturas (media escala):** `t15_ventana_320_media.png` y `t15_ventana_375_media.png`. Son la
ventana real, con la página puesta donde cae tras anotar.

## 1 · Por qué no cabía

Las dos FALLA de Shoko tienen la misma causa: **después de anotar, la pantalla sigue cargando el
andamio que servía para contestar.** Cuando el estudiante ya anotó no hay nada que volver a tocar
—un solo intento—, pero en pantalla siguen ocupando sitio, a tamaño táctil, la pregunta y las dos
filas de botones de cifra: según mi propia P2, **39,2 px la pregunta y de 44 a 72,8 px cada fila**,
más su rótulo de 16. Entre 159 y 215 px de controles que ya no se pueden pulsar. Con eso dentro,
las torres y la devolución no caben juntas, y poner la devolución fija encima solo cambia qué se
pierde de vista.

## 2 · Lo que decido

**Después de anotar, las casillas dejan de ser casillas.** Cuatro cambios, ninguno de los cuales
mueve las torres:

1. **Las dos filas de cifras y la pregunta se pliegan en un renglón por parte que se mueve**, a
   todo el ancho del contenedor, sin relleno táctil porque ya no se pulsan:
   - `tiene ✕ $275.000 ✓ $325.000` · `debe ✕ $0 ✓ $25.000`
   - La palabra corta (`tiene`, `debe`, `dueños`) es la de la leyenda y la de las partes; el
     `aria-label` del renglón lleva el nombre completo publicado.
   - **27 px cada renglón, en los dos anchos**, incluso con las dos cifras más largas que pueden
     salir ($515.000 y $465.000) y con la palabra más larga (`dueños`): el renglón más ancho mide
     **249 px** contra los 258 disponibles [fuente, réplica].
   - El verdicto conserva el vocabulario de C2: ✕ sobre lo elegido, ✓ sobre lo que iba.
2. **La reserva del contenedor baja de 244 a 176 px** y **sigue siendo fija**: 150 de la torre más
   alta que permite la escala ($515.000 = 150 px), 20 de los totales, 2 de la base y 4 de aire
   [calculado]. Los 68 que sobraban eran aire que nunca se usa. **Fija quiere decir que la base de
   las torres queda en el mismo sitio en los ocho hechos y antes y después de anotar.**
3. **La leyenda sube: va entre el hecho y las torres**, no debajo. Así queda fuera de la ventana
   que hay que comparar, y sigue leyéndose antes de mirar las torres. **Lo que cuesta:** todo lo
   que va debajo de las torres baja 46 px (36 de la leyenda y 10 de hueco), así que el primer
   botón de cifra queda 46 px más abajo mientras se contesta. **B1 no cambia:** la figura es el
   contenedor, y empieza donde empezaba (190,1 px desde la cima del Panel, medido en la P2).
4. **La devolución va en el flujo, debajo de los renglones plegados, y «Siguiente» debajo de
   ella.** Nada fijo y nada encima de nada. Al pulsar «Anotar», la pieza **desplaza la página hasta
   la cima de las torres** y pone el foco en el veredicto, así que los cuatro bloques quedan a la
   vista sin que el estudiante tenga que buscarlos (con movimiento reducido, el desplazamiento es
   instantáneo).

**Lo que NO hago, y por qué:** no recorto el contenedor al alto real del hecho, aunque ahorraría
otros 87 px. Las torres crecen desde la base, así que recortar el aire de arriba **las subiría en
pantalla justo cuando el estudiante compara alturas**, y eso rompe C3 y el sentido de la figura.
Tampoco bajo las torres de tamaño en ese estado: la escala es la misma en los ocho hechos y es lo
que hace comparables las alturas.

## 3 · La tabla de alturas

Del borde de arriba de los totales al pie de «Siguiente», con la devolución más larga (hecho 2 con
las dos partes mal) [fuente, réplica]:

| Bloque | 320×568 | 375×667 |
|---|---|---|
| Totales y torres (reserva fija, con el fantasma) | **176** | **176** |
| Los dos renglones plegados (27 + 6 + 27) | **60** | **60** |
| Devolución del hecho 2 (9 renglones a 320, 7 a 375) | **213** | **171** |
| «Siguiente» | **44** | **44** |
| Huecos y relleno inferior del contenedor | 31 | 31 |
| **La ventana** | **524** | **482** |
| La ventana del teléfono | 568 | 667 |
| **Lo que sobra** | **44** | **185** |

- **Pasa lo que pide Shoko:** a 320×568 se ven a la vez las torres con su fantasma, la cifra que
  el estudiante puso en cada casilla y la que iba, la devolución entera y «Siguiente», con **44,3
  px libres por debajo del botón** [fuente, réplica, captura].
- **Es la misma altura en los ocho hechos**, porque la reserva es fija: el hecho 6, con el
  fantasma más alto posible, da exactamente los mismos 524 px.
- **Margen para una devolución más larga:** caben **dos renglones más** de devolución a 320
  (21 px cada uno) antes de pasarse. Si alguna devolución nueva llega a 11 renglones, hay que
  medir otra vez.

## 4 · Qué queda fuera de la ventana, y por qué no hace falta

Arriba del todo quedan el objetivo, el contador «Hecho n de 8», el hecho y la leyenda; y entre el
hecho y las torres, el veredicto de la primera decisión sobre las tres partes. **Ninguno de los
cuatro que pide Shoko.** La parte que se queda igual no se pierde: la primera frase de la
devolución la nombra con palabras —«La que se queda igual es lo que es de los dueños»— y la
leyenda y las partes siguen a un desplazamiento de distancia.

## 5 · Lo que no cambia

Los textos del banco y la devolución, el puntaje y sus dos decisiones con `intentos: 1`, el id, la
escala de $515.000 = 150 px, las tres opciones de cifra por parte (Shoko, 24-oct), el fantasma
coral discontinuo, el veredicto de C2 y la regla de un solo intento. **Los registros de los
estudiantes no se tocan.**

## 6 · Kaede

| # | Qué | Si no coincide |
|---|---|---|
| 1 | Tras «Anotar», la pregunta y las filas de cifra se pliegan en un renglón por parte que se mueve, sin relleno táctil | Indispensable (es lo que hace que quepa) |
| 2 | Reserva del contenedor de 176, **fija**: la base de las torres no se mueve nunca | Indispensable |
| 3 | La leyenda, arriba de las torres | Indispensable |
| 4 | Devolución y «Siguiente» en el flujo; nada fijo ni superpuesto | Indispensable (es la FALLA 2) |
| 5 | Al anotar, desplazar hasta la cima de las torres y foco al veredicto | — |
| 6 | Renglón plegado a todo el ancho del contenedor (sangría negativa de 12), Inter 13/17 y las cifras en monospace con tabular-nums | Si lo dejas con el relleno del contenedor, el renglón se parte en dos y la ventana sube a 552 |
