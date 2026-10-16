# Sonda de enganche · B1-B5 · Célula B

Es la sonda de Shibukawa (Célula D, 15 oct 2026), copiada de `scripts/t4/sonda-enganche/` y adaptada a las **piezas de la Célula B** (16 cuando se midió; 15 desde que b5-t6-a7 se retiró en el lote 4). La de D no se toca. Mide si una pieza **engancha**, no solo si **cabe**: la barra B1-B5 del autodiagnóstico de calidad de Mateo, tarjeta por tarjeta, **sin barra de desplazamiento, como un teléfono**, a 320 y a 375 px.

Lo que cambia frente a la de D es **el recorrido y la clave**. La medición (`enganche_mide.js`) y el juicio (`juzga`) son los mismos, con tres añadidos de B:
- la lista de figuras (`FIG`), porque B no usa `<figure>`;
- dos marcas de acierto más para B4: `[data-marca="correcta"]` y el «Correcto:» del Retro compartido;
- en Aprender, B3 se cuenta **por capa**: la capa 2 tiene hasta 15 pasos, pero es una sola tarjeta.

El informe de la primera corrida está en `orquestador/conocimiento/revisiones/b5-enganche-b1-b5.md`.

## Las piezas

| Pieza | Qué es | Dónde |
|---|---|---|
| `T5A1`, `T5A3` | Aprender de T5: pieza 1 («del efectivo») y pieza 3 («tres momentos»). La pieza 2 es de la Célula C | `/#/activos-financieros` |
| `T6A1` … `T6A5` | Las 5 piezas de Aprender de T6 | `/#/cuentas-por-cobrar` |
| `b5-t5-a1`, `b5-t5-a2` | Hacer de T5 | `/#/activos-financieros/hacer` |
| `b5-t6-a1` … `b5-t6-a6` | Hacer de T6 (b5-t6-a7 se retiró en el lote 4; su medida queda en el informe) | `/#/cuentas-por-cobrar/hacer` |

## Archivos

| Archivo | Qué hace |
|---|---|
| `enganche_mide.js` | **La medición.** Se evalúa en la página y devuelve los números de una tarjeta. No juzga nada |
| `enganche.py` | **El recorrido y el juicio.** Abre cada pieza a cada ancho, la recorre entera, mide en cada momento y juzga B1-B5 |
| `enganche_clave.mjs` | **La clave.** Lee del build la respuesta buena y una mala de cada tarjeta de Hacer, y la opción buena de cada caja de la capa 3 y de cada parada de la capa 2 |
| `eng_fixture.py` | **La autocomprobación.** Tarjetas sintéticas con una sola rotura cada una |
| `eng_tablas.py` | Las tablas en Markdown a partir del JSON de salida |
| `base.py` | El navegador y las fuentes locales |
| `fuentes.sh` | Baja Sora e Inter (@fontsource 5.3.0) a `.sonda-fuentes/`, que git ignora |
| `vite-sonda.config.mjs` | Levanta el build con una `cacheDir` propia por proceso |
| `fixture.out` | La salida de referencia de `eng_fixture.py` |

## El recorrido

**Aprender.** La pieza k es el Panel que sigue al rótulo «PIEZA k DE N». Cada capa se mide como tarjeta:
- **Capa 1** se lee: una vista, «lectura».
- **Capa 2** se recorre con `[data-siguiente]` hasta el último paso. Cada paso es una vista («Paso k de N», del `[data-paso-de]`). En la parada (`[data-parada]`) se mide al llegar, se toca la opción buena de la clave y se mide tras el acierto. Si la figura cambió, la capa 2 «tiene acción».
- **Capa 3** se mide al empezar. Después se abre cada caja (`[data-hecho]`, botón `aria-expanded`) en orden, porque algunas aparecen al decidir la anterior. Si la caja decide (`data-decidida`), se mide al llegar, se toca la opción buena y se mide tras el acierto.
- **Capa 4** (`[data-una-frase]`) se mide al llegar. Después se prueban las frases en orden: cada error se mide y se vuelve con `[data-otra-vez]`, hasta la correcta.

Un acierto que el juego no da por bueno (`[data-devolucion]` en la capa 2 o 3, o `data-devolucion="incorrecta"` en la 4) es la clave rota: código 2.

**Hacer.** Se abre la actividad por su nombre y se mide «Así se juega» (`[data-asi-se-juega]`), que se cierra con su «Siguiente». La tarjeta es el Marco. Cada partida se juega dos veces con la misma semilla, una bien y otra mal, con el mismo gesto:

| Mecánica | Piezas | Cómo responde | Veredicto |
|---|---|---|---|
| Mesa del diario | `b5-t5-a2`, `b5-t6-a2`, `b5-t6-a3` | `[data-sacar="cuenta:lado"]`, la cifra en `input[data-campo-cifra]` y `[data-confirmar-parte]`. La mala lleva la primera cifra con 1.000 de más | `[data-panel]` |
| Elección | `b5-t6-a4` | el botón con `[data-opcion]` | `data-estado` de la Opción |
| Casillas | `b5-t6-a5`, `b5-t6-a6` | el botón con `[data-opcion]` | `data-estado` de la Opción |
| Estante de dos niveles | `b5-t5-a1`, `b5-t6-a1` | `[data-nivel1]`, `[data-nivel2]` y el botón de `[data-boton-colocar]`. La mala va al otro primer nivel, dos veces (el juego da un segundo intento) | el Retro (`role="status"`, «Correcto:» o «Incorrecto:») |

## Qué mide cada regla

Lo que no ve un estudiante vidente no cuenta: `display:none`, `visibility:hidden`, opacidad 0 y el texto recortado solo para lector de pantalla (1 px con `overflow:hidden`, `clip`, `clip-path`).

- **La tarjeta** es, en Aprender, **cada capa** del Panel (`<section data-capa>`); en Hacer, el Marco. Las Y se miden desde su borde de arriba.
- **La figura.** B no usa `<figure>`. Cuentan como figura la escena (`[data-escena]`), la cuenta T (`[data-cuenta-t]`), el tablero, la mesa del diario, el asiento mínimo, la cuenta que se llena, los cajones del tiempo, el estante cuando tiene cajones y el registro. La lista está en `FIG`, en `enganche.py`.
- **La interacción** es el primer control que no es de navegación: una opción, un botón de cuenta, Debe o Haber, o un campo. No cuentan «Siguiente», «Comprobar», «Confirmar», «¿Cómo se juega?», «Pausar» ni nada parecido.

| Regla | Qué mide la sonda | Cuándo falla |
|---|---|---|
| **B1 · Figura primero** | En cada vista al llegar, la Y de lo primero que aparece, figura o interacción, y cuántas palabras visibles hay antes en el orden del documento | Lo primero está a **más de 280 px**, o no hay nada, o hay **más de 40 palabras** antes |
| **B2 · Presupuesto de texto** (solo Aprender) | Las palabras visibles de la tarjeta, en cada vista: lectura, al llegar a una pregunta y tras el acierto | **Más de 60 palabras** en una vista |
| **B3 · El estudiante hace algo** | **Aprender:** si el DOM de la figura cambia entre la vista al llegar y la vista tras el acierto. **Hacer:** cada tarjeta se juega dos veces con la misma semilla, una bien y otra mal. Se mira si la figura cambió al responder y si queda **distinta** según se acierte o se falle | **Aprender:** menos de la mitad de las **capas** tienen una acción que cambie la figura. **Hacer:** en una tarjeta, la figura no se mueve, o se mueve **igual** acierte o falle («revela, no responde») |
| **B4 · El acierto no va en teal ni en ámbar** | El color de cada marca de acierto: `[data-estado="correcta"]`, `[data-estado="revelada"]` («era esta»), `[data-mensaje="acierto"]`, `[data-panel="acierto"]`, `[data-marca="correcta"]` (OpcionDecidir de la capa 2 y la capa 3), el `role="status"` del Retro que empieza por «Correcto:», `.fae-jg-acierto` y lo que llevan dentro. También, tras el veredicto, la fila del **Haber** de un constructor. Teal: `42,157,143` o `47,168,160`. Ámbar: `233,196,106` o `255,200,87`. Se miran color, bordes, fondo, sombra, contorno, `fill` y `stroke` | Una marca de acierto lleva teal o ámbar, o la fila del Haber queda en teal (el color del debe) |
| **B5 · Nada dos veces** | El texto visible se parte en bloques (p, li, h, botón, o lo que se muestre como bloque) y los bloques en frases. Se buscan frases de **5 o más palabras** iguales en dos bloques de la misma vista. Incluye Así se juega | Una frase aparece dos veces |

**Palabra** es un token con letra o cifra: «$500.000» vale una, y «·» no cuenta.

**Hacer, con todas las tarjetas.** La sonda juega la partida entera, de todas las etapas, dos veces con la misma semilla: una con la respuesta correcta de la clave y otra con la equivocada. Mide cada tarjeta al llegar, tras acertar y tras fallar, y además Así se juega. En cada tarjeta comprueba que el juego haya dado el veredicto esperado: «acierto» con la correcta y «error» con la equivocada. Si no, es la clave la que está rota, y la sonda lo dice (código 2) en vez de medir colores de otro estado.

## El margen de ±20 px frente a Chrome real

La sonda corre en Chromium sin pantalla, con Playwright, a 320×800 y escala 2. Sirve Sora e Inter desde archivos locales (@fontsource 5.3.0), no desde Google Fonts. Los anchos de letra pueden diferir un poco de los del Chrome de un estudiante, y un párrafo puede partirse en un renglón más o en uno menos. Con unos 22 px por renglón, eso da **unos ±20 px** en las Y.

Lo comprobé contra la medida a mano de Yujiro en aprendefae.com: A0 «prueba-del-ano» da 572 px en la sonda y 594 en Chrome real, y «ejemplos» da 547 en las dos.

Para decidir B1 eso pesa poco. Una Y entre **260 y 300 px** está en la frontera y hay que mirarla en Chrome real antes de dar un PASA o un FALLA por ella. Las palabras no dependen de la fuente: se cuentan igual en cualquier navegador.

## Cómo se corre

Todo desde la raíz del repositorio, con Python 3 y Node 22.

1. **Las dependencias.** Siempre `npm ci`, nunca `npm install`, y `package-lock.json` no se sube.
2. **Playwright para Python** y su Chromium: `python3 -m pip install playwright` y `python3 -m playwright install chromium`.
3. **Las fuentes:** `bash scripts/b5/sonda-enganche/fuentes.sh`.
4. **La autocomprobación** tiene que dar `12 de 12` y salir con 0: `python3 scripts/b5/sonda-enganche/eng_fixture.py`.
5. **Vite con el Supabase falso**, en otra terminal. La sonda intercepta `http://fake.supabase.test` y simula la sesión, el perfil y `registrar_fp`: no escribe en ninguna base real.

   ```
   VITE_SUPABASE_URL=http://fake.supabase.test VITE_SUPABASE_ANON_KEY=anon-falsa \
     npx vite --config scripts/b5/sonda-enganche/vite-sonda.config.mjs --port 5291 --strictPort
   ```

6. **La clave**, de este mismo build (lee los `.jsx`, así que necesita el cargador):

   ```
   node --import ./scripts/cargador-jsx.mjs scripts/b5/sonda-enganche/enganche_clave.mjs > clave.json
   ```

7. **La sonda** y sus tablas. `--anchos` es opcional (por defecto `320,375`):

   ```
   python3 scripts/b5/sonda-enganche/enganche.py 5291 salida.json T6A3 b5-t6-a4 --clave=clave.json --anchos=320,375
   python3 scripts/b5/sonda-enganche/eng_tablas.py salida.json > tablas.md
   ```

   Imprime una línea por pieza y ancho (`T6A3@320 FALLA 36`). El detalle va en `salida.json`.

`clave.json`, `salida*.json` y `tablas.md` quedan ignorados por git en esta carpeta.

## Qué significa el código de salida

| Código | Significa |
|---|---|
| **0** | Todas las piezas pedidas **PASAN** B1-B5 |
| **1** | Al menos una pieza **FALLA** la barra. Las demás pudieron medirse bien |
| **2** | **La sonda no pudo medir** algo: la página no cargó, una tarjeta no estaba en la clave, la clave no dio el veredicto esperado, o no se midió ninguna pantalla. **No es ni PASA ni FALLA.** Un resultado vacío no es un resultado: hay que arreglar la corrida y volver a correr |

El 2 manda sobre el 1. Una corrida con una pieza sin medir sale con 2, aunque las otras fallen.

## Cómo se comprueba sola

`python3 scripts/b5/sonda-enganche/eng_fixture.py` arma tarjetas sintéticas en una página en blanco, sin la app, a 320 px. Las mide con `enganche_mide.js` y las juzga con la misma `juzga` de `enganche.py`.

Cada caso declara qué reglas **tienen** que salir:
- la tarjeta que cumple tiene que dar **PASA**;
- cada rotura tiene que fallar **exactamente en su regla y en ninguna otra**.

| Caso | Tiene que dar |
|---|---|
| Aprender · cumple | PASA |
| Aprender · figura a 400 px | B1 |
| Aprender · 45 palabras antes de la figura | B1 |
| Aprender · 70 palabras más | B2 |
| Aprender · la acción no cambia la figura | B3 |
| Aprender · acierto en teal | B4 |
| Aprender · frase duplicada | B5 |
| Hacer · cumple (la figura queda distinta si aciertas o fallas) | PASA |
| Hacer · la figura no se mueve | B3 |
| Hacer · la figura revela lo mismo acierte o falle | B3 |
| Hacer · fila del Haber en teal tras el acierto | B4 |
| Sin medir nada | SONDA (código 2) |

Las seis primeras roturas (Aprender, una por regla) son las que pedía la barra. Las de Hacer cubren lo que se añadió después: el juicio de «revela, no responde» y el color del constructor.

Sale con **0** si los 12 casos dan lo esperado y con **1** si alguno no. **También se comprobó que el fixture se pone rojo:** con el juez saboteado (sin B4 y con B2 a 600 palabras) da `MAL` en esos dos casos y sale con 1.

## Límites, dichos de frente

- **B3 es un mínimo, no una garantía.** «Cambia el DOM de la figura» no juzga si el cambio tiene significado. Eso lo juzga una persona.
- **En la capa 2 «Siguiente» no cuenta como acción**, igual que en la de D: avanzar no es decidir. Solo la parada cuenta.
- **B2 cuenta las palabras de toda la capa, figura incluida**, como en la de D. La tabla da también las de fuera de la figura, entre paréntesis.
- **B2 no se aplica a Hacer**: la barra lo pide solo para Aprender.
- **Sin barra de desplazamiento.** Chromium sin pantalla la oculta, como un teléfono. Las mediciones de ancho de `scripts/b5/medir-*.mjs` la muestran a propósito (15 px); por eso sus números pueden no coincidir con estos.
- Si una pieza nueva no pone los atributos de arriba, la sonda da código 2: no adivina.
