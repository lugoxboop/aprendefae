---
name: celula-diseno
description: Para el agente de diseño de una célula de AprendeFAE (Xeno, Mai, Watari, Hanayama, Itagaki) al especificar la forma visual de una actividad Aprender o Hacer, o al revisar un diseño contra la vara del proyecto. Trae el estándar visual, el kit de marca, las medidas publicadas y las reglas de movimiento.
---

# Diseño de célula

Especificas la **forma** de las piezas: superficie, color, tipografía, estados
y movimiento. No decides el contenido (es del pedagógico) ni el alcance (es de
tu general). Entregas un bloque literal para el constructor, no un documento
que haya que interpretar.

## Lo que siempre aplica

**Medidas.** Todo se especifica y se comprueba a **320 y 375 px**, con el texto
más largo real. Lectura de 14 a 15 px; nada bajo 12 px salvo insignia y cejilla
del título (10,5). Lo interactivo, 13 px o más. Táctil, 44 px o más. Foco:
anillo de 2 px #F8F9FA separado 2 px.

**Color.** El sitio es **oscuro**. Teal es DEBE, ámbar es HABER, el acierto es
neutro (FAE.text). En color manda Xeno.

**Tipografía.** Sora para títulos y botones, Inter para el texto. Las cifras de
cuentas, asientos y saldos en la pila monoespaciada publicada con tabular-nums.
Dinero como $1.240.000. Nunca cortes un nombre con puntos suspensivos: deja
crecer el componente.

**Movimiento.** Curva `cubic-bezier(.3,.9,.4,1)` —la que ya usa el código 22
veces, no inventes otra—. Solo `transform` y `opacity`. Nada nuevo en bucle,
salvo la única excepción nombrada y medida: hasta 3 elementos en la banda del
leaderboard, con pausa obligatoria fuera de pantalla (`prompts/vida-visual-v1.md`).
Toda animación con su versión de movimiento reducido.

**Cada cifra lleva su origen:** `[pantalla]` (medido por alguien con nombre,
dónde y cuándo), `[fuente]`, `[calculado]` (con su fórmula) o `[supuesto]` (y
entonces lleva una parada de medición para el constructor). Una cifra a ojo no
es una medida.

**No más de 2 o 3 frases visibles antes de que algo cambie o se pueda tocar.**

## Patrones del estándar visual (Ukyo)

Resumen; el detalle y las cifras con su origen están en el archivo que se nombra.
Búscalo, no lo abras entero: `node scripts/canon.mjs "<palabra>" -f <archivo>`.

**Aprender tipo presentación** (`prompts/aprender-secuencia-v1.md`). Pieza de
4 a 10 pantallas; fases apertura, desarrollo y cierre sobre las cuatro capas.
Cuatro tipos de pantalla: Apertura, Míralo, Haz, Cierre; al menos la mitad
Míralo o Haz. Una idea y máx. 60 palabras por pantalla. Zonas de arriba abajo:
progreso, cejilla, titular, figura, apoyo, razón, navegación (44 px). Figura
reservada **por pieza** (la misma en todas sus pantallas), tope 220 px a 320 y
319 a 375. «Siguiente» da el paso pendiente y luego pasa; «Anterior» no deshace;
sin deslizar el dedo. Estado guardado con clave `tema/pieza/caso`. Movimiento:
entrada escalonada 0/80/160 ms, 280 ms, solo transform y opacity; sin parallax;
con movimiento reducido, sin desplazamientos.

**Panel docente** (`prompts/panel-docente-v1.md`). Primera pantalla = tres
bloques: avance de la clase, quiénes necesitan atención (máx. 3, nombre y
motivo), actividad con peor resultado. La lista de estudiantes nunca va primero.
Riesgo con palabra y forma (▲ ◆ ●), nunca coral; coral solo para error de carga.
Todo lo demás a uno o dos toques.

**Relieve y vida** (`prompts/vida-visual-v1.md`). **Las tres materias, un solo
cambio**: no hay opt-in por materia y ser compartido ya no frena nada. A cambio
hay más superficie que romper, así que se **añade, nunca se reemplaza**, no se
toca ningún valor existente de `theme.js`, y toda pieza se mira **también en una
pantalla de Pensamiento Estratégico** antes del PASA. Sobre oscuro el canto no se
oscurece, se sube: escalera N0 `#0E1B2E` → N1 `#1D3557` → N2 `#344968`, y el
canto de un nivel es la cara del anterior; filo de 1 px `#586A83` arriba, la
luz viene de arriba. **El telón no es plano**: en Estratégico la madera del
ajedrez lo sube por encima de la cara (p50 0,0389 contra 0,0350 del canto) y el
relieve se invierte, así que el canto se juzga **contra su cara** (≥1,25:1), todo
bloque lleva contorno de 1 px `rgba(248,249,250,.18)` y donde `node
scripts/vida/sonda-telon.mjs` diga EXIGE PLACA va placa opaca N1 detrás del grupo.
Ninguna superficie en `rgba`. Elevaciones E1 3 px (filas, tarjetas), E2 4 px (botones,
nodos), E3 6 px (una sola por pantalla). El canto es una capa hermana detrás y
lo que se mueve es la cara: al pulsar, `translateY` a 0 en 100 ms y vuelve en
160. Nada de `box-shadow` ni de animar `border-width`. Texto sobre teal en
`#0E1B2E`, no blanco (blanco da 3,15:1). Decoración: SVG con CSS, nunca
three.js —ya hay una escena WebGL de fondo y en gama baja desaparecería—;
trazo 1,5 px `#CBDCF2` a 0,45; tres movimientos (flota, gira, pulso) con una
sola keyframe por pantalla variando duración y retardo. Entrada de página:
cuatro grupos, 0/80/160/240 ms, 280 ms, total 520.

**El camino de actividades** (`prompts/vida-visual-v1.md` §4.3). Es el único
sitio donde entra volumen ahora mismo; lo construye Erwin en `CaminoHacer.jsx`,
compartido por las tres materias. **Nodo:** círculo, cara N2 `#344968` sobre
canto N1 `#1D3557`, E2 **4 px**, contorno de 1 px `rgba(248,249,250,.18)`; el
canto es un segundo círculo detrás, desplazado 4 px abajo, nunca una sombra.
**Nodo actual:** E3 **6 px**, uno solo por pantalla. **Nodo hecho:** la marca va
**dentro** de la cara, en trazo `#0E1B2E` sobre cara teal `#2A9D8F` con canto
`#1D6B61`; nunca un candado, ningún nodo se bloquea jamás. **Al pulsar:** la
cara baja `translateY(4px)` en 100 ms y vuelve en 160 con la curva de la casa;
el canto no se mueve. Reserva siempre los 4 px en el contenedor, también en los
nodos E1, para que el camino no se descoloque al cambiar de estado. **Las
líneas:** sin canto —una línea no tiene volumen—, 1 px más claras que el canto
del nodo (`#3D516F`) en el tramo ya hecho y `#1D3557` en el que falta; el
grosor no cambia. **Sobre el ajedrez:** el camino de Estratégico se ve sobre
madera clara, así que antes de fusionar se corre `node
scripts/vida/sonda-telon.mjs` en una pantalla de camino de esa materia y, si
dice EXIGE PLACA, el camino lleva su panel opaco N1 detrás.

**Identificadores de tema** (`prompts/logitos-temas-conta-v1.md`). 64×64, trazo
de 3 px, un solo elemento en el acento y es el único que se mueve (400 ms, una
vez, solo con hover/foco/pulsación). **Reserva el objeto antes de dibujar**:
la tabla de objetos ocupados está en ese archivo. Prueba: los nueve en fila a
32 px y en gris, sin confundir dos.

## Antes de entregar

Lista de estados, y si alguno no aplica se escribe "no aplica": vacío · foco ·
presionado · abierto · con respuesta antes de comprobar · tocado sin respuesta
· acierto · error (qué se queda y qué se revela) · después del error.

Los componentes ya publicados se reutilizan sin cambios y se **nombran**, no se
describen de memoria: encabezado de Hacer, "Así se juega", el botón Responder,
la transición entre ítems y la pantalla de resumen.

## Cuándo abrir el prompt maestro completo

`orquestador/conocimiento/prompts/disenadores-de-celula-v1.md` (7.000 tokens)
trae las cuatro capas de Aprender, el estándar único de Hacer con su modelo, el
kit de marca entero y el formato literal de entrega P2. **Ábrelo cuando vayas a
escribir una entrega P2 completa**; para una duda suelta, búscala:

```sh
node scripts/canon.mjs "feedback" -f disenadores
node scripts/canon.mjs "320"
```
