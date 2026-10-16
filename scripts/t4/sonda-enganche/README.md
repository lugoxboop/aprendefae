# Sonda de enganche · B1-B5

Es la sonda de Shibukawa, auditora de la Célula D, del 15 oct 2026. Mide si una pieza **engancha**, no solo si **cabe**. Mide la barra B1-B5 del autodiagnóstico de calidad de Mateo, tarjeta por tarjeta, a 320 px y tal como ve la pantalla un estudiante.

Hoy está adaptada a T4 («Efectivo, caja menor y bancos»). El recorrido y la clave son de T4; la medición y el juicio sirven para cualquier pieza. Abajo se explica qué hay que cambiar para otro tema.

## Archivos

| Archivo | Qué hace |
|---|---|
| `enganche_mide.js` | **La medición.** Una función que se evalúa en la página con Playwright y devuelve los números de una tarjeta. No juzga nada |
| `enganche.py` | **El recorrido y el juicio.** Abre cada pieza, juega todas sus pantallas o tarjetas, llama a la medición en cada momento y juzga B1-B5 con la función `juzga` |
| `enganche_clave.mjs` | **La clave de Hacer.** Lee de los datos del build que se mide (`src/data/contabilidadT4H*.js`) la respuesta correcta de cada tarjeta y una equivocada que se comete con el mismo gesto |
| `enganche_planes.json` | **Los planes de Aprender con figura operable.** Por pieza y pantalla, los gestos que la sonda hace (tocar, arrastrar, esperar), el momento que mide tras cada uno y el veredicto que tiene que dar. Los usa también la guardia de enganche de `npm test` |
| `eng_fixture.py` | **La autocomprobación.** Tarjetas sintéticas con una sola rotura cada una (ver abajo) |
| `eng_tablas.py` | Las tablas en Markdown a partir del JSON de salida |
| `base.py` | El navegador a 320 px y las fuentes locales |
| `fuentes.sh` | Baja Sora e Inter (@fontsource 5.3.0) a `.sonda-fuentes/`, que git ignora. Los binarios no se suben al repositorio |
| `vite-sonda.config.mjs` | Levanta el build que se mide con una `cacheDir` propia por proceso, para que dos vite no se pisen |
| `fixture.out` | La salida de referencia de `eng_fixture.py`, para comparar |

## Qué mide cada regla

Lo que no ve un estudiante vidente no cuenta: `display:none`, `visibility:hidden`, opacidad 0 y el texto recortado solo para lector de pantalla (1 px con `overflow:hidden`, `clip`, `clip-path`).

- **La tarjeta** es el `<section>` más cercano a la raíz de la pieza: el Panel en Aprender y el Marco en Hacer. Las Y se miden desde su borde de arriba.
- **La figura** es el primer `<figure>` visible, o el par o la tabla de H7 y H8 (`[data-par]`, `[data-tabla-h7]`, `[data-lado-h7]`).
- **La interacción** es el primer control que no es de navegación: una opción, un botón de cuenta, Debe o Haber, o un campo. No cuentan «Siguiente», «Comprobar», «Confirmar», «¿Cómo se juega?», «Pausar» ni nada parecido.

| Regla | Qué mide la sonda | Cuándo falla |
|---|---|---|
| **B1 · Figura primero** | En cada vista al llegar, la Y de lo primero que aparece, figura o interacción, y cuántas palabras visibles hay antes en el orden del documento | Lo primero está a **más de 280 px**, o no hay nada, o hay **más de 40 palabras** antes |
| **B2 · Presupuesto de texto** (solo Aprender) | Las palabras visibles de la tarjeta, en cada vista: lectura, al llegar a una pregunta y tras el acierto | **Más de 60 palabras** en una vista |
| **B3 · El estudiante hace algo** | **Aprender:** si el DOM de la figura cambia entre la vista al llegar y la vista tras el acierto. **Hacer:** cada tarjeta se juega dos veces con la misma semilla, una bien y otra mal. Se mira si la figura cambió al responder y si queda **distinta** según se acierte o se falle | **Aprender:** menos de la mitad de las pantallas tienen una acción que cambie la figura. **Hacer:** en una tarjeta, la figura no se mueve, o se mueve **igual** acierte o falle («revela, no responde») |
| **B4 · El acierto no va en teal ni en ámbar** | El color de cada marca de acierto: `[data-estado="correcta"]`, `[data-estado="revelada"]` («era esta»), `[data-mensaje="acierto"]`, `[data-panel="acierto"]`, `.fae-jg-acierto` y lo que llevan dentro. También, tras el veredicto, la fila del **Haber** de un constructor. Teal: `42,157,143` o `47,168,160`. Ámbar: `233,196,106` o `255,200,87`. Se miran color, bordes, fondo, sombra, contorno, `fill` y `stroke` | Una marca de acierto lleva teal o ámbar, o la fila del Haber queda en teal (el color del debe) |
| **B5 · Nada dos veces** | El texto visible se parte en bloques (p, li, h, botón, o lo que se muestre como bloque) y los bloques en frases. Se buscan frases de **5 o más palabras** iguales en dos bloques de la misma vista. Incluye Así se juega | Una frase aparece dos veces |

**Palabra** es un token con letra o cifra: «$500.000» vale una, y «·» no cuenta.

**Aprender con figura operable** (el rediseño de enganche de A0 y A1, 15 oct 2026). La pantalla ya no es una elección de radios: el estudiante arrastra el año, cobra, manda la plata a un lado del cajón o enciende un control. La sonda no adivina qué tocar: lo lee de `enganche_planes.json`. Mide la pantalla al llegar y después de cada gesto del plan, incluidos **cada error y cada acierto**, y comprueba el veredicto de cada uno (`data-mensaje`). Si un gesto no encuentra su control o el veredicto no es el del plan, da código 2. Si una pantalla tiene controles dentro de la figura y no tiene plan, también da código 2. B3 se juzga igual: la figura de la llegada contra la de después de los gestos.

**Hacer, con todas las tarjetas.** La sonda juega la partida entera, de todas las etapas, dos veces con la misma semilla: una con la respuesta correcta de la clave y otra con la equivocada. Mide cada tarjeta al llegar, tras acertar y tras fallar, y además Así se juega. En cada tarjeta comprueba que el juego haya dado el veredicto esperado: «acierto» con la correcta y «error» con la equivocada. Si no, es la clave la que está rota, y la sonda lo dice (código 2) en vez de medir colores de otro estado.

## El margen de ±20 px frente a Chrome real

La sonda corre en Chromium sin pantalla, con Playwright, a 320×800 y escala 2. Sirve Sora e Inter desde archivos locales (@fontsource 5.3.0), no desde Google Fonts. Los anchos de letra pueden diferir un poco de los del Chrome de un estudiante, y un párrafo puede partirse en un renglón más o en uno menos. Con unos 22 px por renglón, eso da **unos ±20 px** en las Y.

Lo comprobé contra la medida a mano de Yujiro en aprendefae.com: A0 «prueba-del-ano» da 572 px en la sonda y 594 en Chrome real, y «ejemplos» da 547 en las dos.

Para decidir B1 eso pesa poco. Una Y entre **260 y 300 px** está en la frontera y hay que mirarla en Chrome real antes de dar un PASA o un FALLA por ella. Las palabras no dependen de la fuente: se cuentan igual en cualquier navegador.

## Cómo se corre

Requisitos:
- Python 3 con `playwright`, y Chromium instalado: `python3 -m playwright install chromium`;
- Node 22;
- el repositorio con `npm ci`.

Las fuentes van en un directorio con `fontsource-sora-5.3.0/` y `fontsource-inter-5.3.0/` desempacados. Por defecto es `.sonda-fuentes/` en esta carpeta, y lo llena `fuentes.sh`. Otro directorio con la misma forma se indica con `SONDA_FUENTES=/ruta`. Si faltan, la sonda no mide y da código 2: sin las fuentes de producción las Y no valen.

1. **Levanta el build que vas a medir** con el Supabase falso: la sonda intercepta `http://fake.supabase.test` y simula la sesión, el perfil y `registrar_fp`, así que no escribe nada en ninguna base real.

   ```
   VITE_SUPABASE_URL=http://fake.supabase.test VITE_SUPABASE_ANON_KEY=anon-falsa \
     npx vite --config scripts/t4/sonda-enganche/vite-sonda.config.mjs --port 5290 --strictPort
   ```

   Se corre desde la raíz del build que se mide, y usa el `vite.config.js` de ese build. `vite-sonda.config.mjs` le da a cada proceso su propia `cacheDir` (o la de `SONDA_VITE_CACHE`). Si levantas dos builds a la vez sobre el mismo `node_modules` con la misma caché, se pisan la caché de dependencias y la página sale en blanco («Invalid hook call»). La sonda lo detecta y da código 2.

2. **Genera la clave** desde los datos de ese mismo build. Solo hace falta para Hacer. Sin argumento, la raíz es este repositorio.

   ```
   node scripts/t4/sonda-enganche/enganche_clave.mjs [/ruta/al/build] > clave.json
   ```

3. **Corre la sonda** con las piezas que quieras. El primer argumento, la carpeta de la sonda, es opcional:

   ```
   python3 scripts/t4/sonda-enganche/enganche.py 5290 salida.json A0 A1 H1 H3 H4 H7 H8 --clave=clave.json
   python3 scripts/t4/sonda-enganche/eng_tablas.py salida.json > tablas.md
   ```

   Por pantalla imprime una línea por pieza: `PASA`, `FALLA n` (n es el número de incumplimientos) o `SIN MEDIR (…)`. El detalle va en `salida.json`: cada vista con sus números y la lista `fallos` con la regla, la pantalla y el motivo.

## Cómo correrla desde cero

Todo desde la raíz del repositorio, en una máquina sin nada previo salvo Python 3 y Node 22.

1. **Las dependencias del repositorio.** Siempre `npm ci`, nunca `npm install`: `npm ci` respeta `package-lock.json` tal cual y no lo reescribe.

   ```
   npm ci
   ```

2. **Playwright y Chromium para Python.**

   ```
   python3 -m pip install playwright
   python3 -m playwright install chromium
   ```

3. **Las fuentes.** Las baja a `scripts/t4/sonda-enganche/.sonda-fuentes/`, que git ignora.

   ```
   bash scripts/t4/sonda-enganche/fuentes.sh
   ```

4. **La autocomprobación.** Tiene que dar `12 de 12` y salir con 0. Compárala con `fixture.out`.

   ```
   python3 scripts/t4/sonda-enganche/eng_fixture.py
   ```

5. **Vite con el Supabase falso**, en otra terminal o en segundo plano:

   ```
   VITE_SUPABASE_URL=http://fake.supabase.test VITE_SUPABASE_ANON_KEY=anon-falsa \
     npx vite --config scripts/t4/sonda-enganche/vite-sonda.config.mjs --port 5290 --strictPort
   ```

6. **La clave**, desde los datos de este mismo build:

   ```
   node scripts/t4/sonda-enganche/enganche_clave.mjs > clave.json
   ```

7. **La sonda.** El control es A0, A1 y H1. Con el rediseño de enganche (PR «D4 · T4 · Rediseño de enganche: A0, A1 y H1») tienen que dar `A0 PASA 0`, `A1 PASA 0` y `H1 PASA 0`, con código 0. Antes del rediseño daban `A0 FALLA 17`, `A1 FALLA 20` y `H1 FALLA 36` (32 desde #238, que quitó la consigna repetida de «Así se juega»), con código 1.

   ```
   python3 scripts/t4/sonda-enganche/enganche.py 5290 salida.json A0 A1 H1 --clave=clave.json; echo rc=$?
   ```

   Los Hacer rediseñados (PR «D4 · T4 · Rediseño de enganche: los Hacer»), con la misma clave: `H3 PASA 0`, `H4 PASA 0`, `H7 PASA 0` y `H8 PASA 0`, con código 0.

   ```
   python3 scripts/t4/sonda-enganche/enganche.py 5290 salida.json H3 H4 H7 H8 --clave=clave.json; echo rc=$?
   ```

8. **Para vite** cuando termines (Ctrl+C en su terminal, o `kill` a su proceso).

`clave.json`, `salida*.json` y `tablas.md` quedan ignorados por git en esta carpeta. Si los escribes en la raíz, no los subas.

## Qué significa el código de salida

| Código | Significa |
|---|---|
| **0** | Todas las piezas pedidas **PASAN** B1-B5 |
| **1** | Al menos una pieza **FALLA** la barra. Las demás pudieron medirse bien |
| **2** | **La sonda no pudo medir** algo: la página no cargó, una tarjeta no estaba en la clave, la clave no dio el veredicto esperado, o no se midió ninguna pantalla. **No es ni PASA ni FALLA.** Un resultado vacío no es un resultado: hay que arreglar la corrida y volver a correr |

El 2 manda sobre el 1. Una corrida con una pieza sin medir sale con 2, aunque las otras fallen.

## Cómo se comprueba sola

`python3 scripts/t4/sonda-enganche/eng_fixture.py` arma tarjetas sintéticas en una página en blanco, sin la app, a 320 px. Las mide con `enganche_mide.js` y las juzga con la misma `juzga` de `enganche.py`.

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

**El control con lo publicado** es la otra mitad de la comprobación. A0, A1 y H1 de main (a78bdc3) tienen que dar **FALLA** con código 1, porque Yujiro los midió a mano y fallan. Dos corridas seguidas dieron las mismas medidas y los mismos fallos, número por número. Al subirla al repositorio se repitió sobre main 1ddbe6f, desde cero y con las fuentes de `fuentes.sh`: A0 FALLA 17, A1 FALLA 20 y H1 FALLA 36, con la misma lista de fallos.

## Límites, dichos de frente

- **B3 es un mínimo, no una garantía.** «Cambia el DOM de la figura» y «queda distinta si aciertas o fallas» no juzgan si el cambio tiene significado. La sonda compara una respuesta buena con una mala, no dos malas distintas. Por eso una figura que solo marca «bien o mal» pasa B3 aunque no muestre lo que hizo el estudiante. Eso lo juzga una persona.
- **B2 no se aplica a Hacer**: la barra lo pide solo para Aprender. Las palabras de Hacer igual se miden y salen en la tabla.
- **El recorrido es de T4.** Para otro tema, `enganche.py` necesita los nombres de las piezas (`APRENDER`, `HACER`), la ruta del tema y los botones de «seguir» (`SIGUIENTE`). `enganche_clave.mjs` necesita su propia clave, escrita contra los datos del tema. La medición (`enganche_mide.js`), el juicio (`juzga`) y el fixture no cambian.
- **Los atributos que usa:**
  - en Aprender, `data-pieza`, `data-pantalla`, `data-eleccion`, `data-opcion` y `data-boton`; con figura operable, los selectores de su plan (`data-accion`, `data-destino`, `data-control`, `data-seg`, `data-fila`, `data-pista`) y `data-mensaje` para el veredicto;
  - en H1 rediseñado, `data-destino` (el cajón como tablero): la clave da `{destino: …}` en vez de `{opcion: …}` cuando los datos traen `SALDO_INICIAL_H1`, y la sonda espera 900 ms tras el toque, porque en el error la plata llega a su sitio a los 0,7 s;
  - en H3, H4, H7 y H8 rediseñados (el tablero, la regla del fondo, las libretas y las bandejas), la clave da `{toques: [selectores], comprobar: true|false}`: los toques del gesto mínimo, en orden y dentro de la pieza, y «Comprobar» si va. La respuesta equivocada se comete con el mismo gesto. La sonda espera 900 ms al final, por la misma razón que en H1. En H8 la misma partida sale en la etapa 1 y en la 2, así que su clave va por etapa (`porEtapa`, «1::texto» y «2::texto»);
  - H2, H5 y H6 salieron del catálogo con el corte de calidad (15 oct 2026): H5 está dentro de H4 («El arqueo de caja menor») y H6 dentro de H7. La sonda ya no las conoce;
  - en Hacer, `data-t4-hN` y `data-t4-hN-demo`, las tarjetas (`data-hecho`, `data-caso`, `data-enunciado`, `data-partida-texto`, `data-tarjeta-nota`, `data-tarjeta-pregunta`), `data-constructor`, `data-fila-asiento`, `data-campo` y `data-panel` o `data-mensaje` para el veredicto.

  Si una pieza nueva no los pone, la sonda da código 2: no adivina.
