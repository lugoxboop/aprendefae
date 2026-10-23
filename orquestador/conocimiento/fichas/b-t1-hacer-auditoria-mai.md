# Auditoría · los 7 Hacer de T1 contra el modelo único de Hacer y la barra de enganche

De: Mai · 23-oct-2026 · Para Sakuta y Kaede.

## Dónde y con qué medí

- **Réplica de main:** el zip de Sakuta (133 archivos de `src`, main de hoy), montado con Vite 5.4.10, React 18.3.1 y lucide-react 0.460.0, `IntroContabilidadView` con `nodoInicial`.
- **Fuera de la réplica:** tres importaciones que no venían en el zip; ninguna es de T1 (dos fondos de otras materias y los íconos SVG del camino). Las reemplacé por módulos vacíos.
- **Medición:** Chromium 141.0.7390.37 headless, con Inter y Sora de @fontsource 5.3.0, a 320×568 y 375×667.
- **Cotejo:** la pantalla de entrada coincide con las hojas de Sakuta, a 320 y 375.
- **B1:** «y» se mide desde el borde inferior de «Volver al camino» (la cima del Panel de la actividad) hasta el primer control, ya en el juego (tras «Siguiente»). Las «palabras» son las visibles en el Panel antes de ese control.

## Lo que falla en las 7 (componentes compartidos ⛔, van a Erwin)

| Qué | Dónde | Regla que incumple |
|---|---|---|
| La devolución empieza por el emoji ✅ o ❌ y el acierto va en teal (borde y fondo) | `corazon/juego.jsx` → `Retro` | Sin emoji; el teal es DEBE o avance, no acierto. El acierto va con contorno de 2 px #F8F9FA y Check |
| La respuesta buena dice «era esta» | `libros/piezas.jsx` → `Responder` | El literal es «Iba aquí» / «Iba aquí: {valor}» |
| En el error, el modelo no corre (T1-1, T1-2, T1-7 y T1-8, según el código) | cada pieza | El modelo es el registro: tras responder muestra lo correcto, se acierte o no |

**Mientras Erwin decide, cada P2 lo resuelve dentro de su pieza, sin tocar lo compartido:**
- la devolución se pinta con el bloque estándar, quitando el emoji solo al dibujarla. Los textos del banco no cambian;
- el modelo corre también en el error.

## Las 7, de la peor a la mejor

| # | Pieza | Qué incumple | B1 a 320 · 375: y del primer control, palabras antes [fuente] | Gancho | Rediseño en una frase |
|---|---|---|---|---|---|
| 1 | **t1-la-ecuacion-en-movimiento** | **3 campos de cifra por hecho, 24 en la partida.** El pie compara los lados **mientras se escribe**, así que muestra si cuadra antes de anotar (R10). Al error se marcan en coral las tres casillas, también las que estaban bien. Reintento («Vuelve al hecho»). La decisión «cuál no se mueve» va **debajo** de los campos, aunque dice «Antes de escribir». No hay ningún modelo que se mueva | 356,1 · 317,8 · 57 palabras | **Básico** | El estudiante VE **dos torres —lo que tiene contra lo que debe más lo de los dueños— subir y bajar por el monto del hecho** cuando dice cuál parte se queda quieta y hacia dónde van las otras dos, y eso explica **que la ecuación siempre cuadra porque cada hecho mueve dos partes por el mismo valor** |
| 2 | t1-desde-donde-preguntan | La misma pregunta, ADENTRO o AFUERA, **6 veces** (D4). El trazo no se enciende en el error. El primer control queda a más de 500 px | 520,8 · 483,9 · 78 palabras | Básico | El estudiante VE **la pregunta viajar por el anillo y entrar a la empresa o quedarse afuera**, y **encender el trazo de vuelta solo si quien pregunta decide**, y eso explica **que pertenecer y decidir son dos cosas distintas** |
| 3 | t1-en-cual-estado-aparece | Escoger entre dos pestañas y luego una parte: **la ficha no va a ninguna parte**. Nada se acumula | 316,9 · 279,2 · 48 palabras | Básico | El estudiante VE **la ficha caer en la foto del 31 de diciembre o en la franja del año, y el informe se va llenando**, y eso explica **que uno es un día y el otro un periodo** |
| 4 | t1-que-entro-y-que-salio | Clasificación entre 5 opciones; la relación entre lo que entra y lo que sale («transformado»…) **solo se dibuja al acertar** | 480 · 467 · 60 palabras | Básico a Medio | El estudiante VE **lo que entra transformarse, o no, en lo que sale, con la flecha que lo dice, también si falla**, y eso explica **que la clase de empresa se decide por lo que le pasa adentro a lo que entró** |
| 5 | t1-que-le-pasa-a-cada-uno | Sube, baja o queda igual por cada parte: ya mueve **tres barras**. El primer control queda a 553 px | 553,1 · 534,3 · 84 palabras | Medio | El estudiante VE **subir, bajar o quedarse quieta cada barra** con su decisión, y eso explica **que con cada hecho se mueven dos y una se queda** |
| 6 | t1-la-articulacion | Origen y destino, pero **el hilo es momentáneo y solo al acertar** | 321,5 · 321,5 · 57 palabras | Medio | El estudiante VE **la cifra viajar de un informe a otro por el hilo que él tendió**, y eso explica **que los tres informes se pasan cifras y todas llegan al de lo que tiene y debe** |
| 7 | t1-donde-se-rompio | El mejor: el apagón aguas abajo y una segunda decisión («cuántos se apagan»). Pero **en el error no corre nada** | 418,4 · 361,2 · 73 palabras | Medio a Avanzado | El estudiante VE **apagarse el punto roto y todos los que siguen**, también tras un error, y eso explica **que un hecho que no se anota no llega a ningún informe** |

**B1:** **ninguna pasa** con el encabezado de hoy: el primer control nunca está antes de 279 px. La de mejor medida es t1-en-cual-estado-aparece a 375, con 279,2. En las P2 la figura sube antes del texto largo.

## Orden de entrega

1. **T1-5** (esta tanda): `p2-t1-5/P2-T1-5-torres.md`.
2. Luego T1-1, T1-6, T1-2, T1-4, T1-7 y T1-8, una P2 por pieza.
