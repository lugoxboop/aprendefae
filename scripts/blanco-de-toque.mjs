/*
 * MIDE EL BLANCO DE TOQUE A 320 px, JUGANDO LA PÁGINA DE VERDAD.
 *
 * Por qué existe: a 320 px un dedo pide 44×44 px. Por debajo de eso el
 * estudiante falla el toque y concluye que la página no responde — no que
 * apuntó mal.
 *
 * Y por qué mide el TOQUE y no el dibujo: la zona que escucha un toque puede
 * ser mayor que lo pintado (un recuadro invisible centrado sobre el control).
 * `getBoundingClientRect` no lo ve, así que un medidor que solo mire el
 * rectángulo da ROJOS FALSOS sobre controles que están bien. Este toca las
 * cuatro esquinas del cuadro de 44 px con `elementFromPoint` y pregunta quién
 * recibiría el toque.
 *
 * Cómo se usa (hace falta la página servida; ver herramientas.md):
 *   npx vite build  &&  cd dist && python3 -m http.server 8099
 *   node scripts/blanco-de-toque.mjs "Contabilidad" "Introducción a la contabilidad"
 *
 * CUIDADO AL ARREGLAR: agrandar dos blancos vecinos puede SOLAPARLOS, y
 * entonces el estudiante va al inicio cuando quería volver al tema. Eso es
 * peor que el defecto. Este script avisa cuando dos quedan a menos de 44 px.
 *
 * NO TODO BOTÓN EN PANTALLA ES UN CONTROL. Los paneles de EJEMPLO dibujan
 * botones falsos para enseñar la mecánica. La primera versión de este medidor
 * los contó y declaró cuatro defectos donde había dos: lo de dentro de un
 * `<figure>` es ilustración y se salta, diciendo cuántos se saltó —callarlo
 * sería esconder lo que no miró.
 *
 * SE MIDE CON LA VENTANA ALTA, Y NO ES UN DETALLE. `elementFromPoint` solo
 * responde sobre lo que está en pantalla: un control bajo el pliegue devuelve
 * `null` y sale informado como defecto. La primera versión declaró 37
 * defectos en el índice de Contabilidad, casi todos tarjetas de 239×139 px
 * perfectamente sanas que estaban más abajo.
 *
 * La salida NO es ir desplazando y medir de a uno: al hacer eso, las
 * coordenadas de unos y otros quedan tomadas en momentos distintos y la
 * comprobación de solapes compara posiciones que nunca existieron a la vez
 * —da pares a «0×0 px entre centros» entre elementos que están lejos—.
 *
 * La salida es una ventana de 320 de ancho y tan alta como la página. El
 * ancho es lo que decide el diseño a móvil; el alto solo tiene que alcanzar
 * para que todo se pueda tocar sin desplazar, y se MIDE al llegar a la
 * pantalla en vez de fijarse: con un alto fijo bastaba abrir una tarjeta del
 * índice para que la página creciera por encima y todo lo de abajo volviera a
 * quedar fuera —y a informarse como defecto—. Si aun así algo no cabe, se
 * cuenta aparte en vez de darse por malo.
 *
 * Y SEPARA DOS FALLOS QUE NO SON EL MISMO: «pequeño» es que el blanco no
 * llega a 44 px; «tapado» es que otro elemento recibe el toque. El segundo
 * puede ser un defecto grave (un control inalcanzable) o un panel legítimo
 * delante. El medidor dice cuál de los dos ve y quién tapa, y deja el juicio
 * a quien mira.
 */
import pkg from "/opt/npm-tools/node_modules/playwright-core/index.js";
const { chromium } = pkg;

const MINIMO = 44;
const BASE = process.env.BASE ?? "http://127.0.0.1:8099";
const pasos = process.argv.slice(2);

const navegador = await chromium.launch({ executablePath: "/opt/pw-browsers/chromium" });
const pagina = await navegador.newPage({ viewport: { width: 320, height: 820 } });
await pagina.goto(`${BASE}/`, { waitUntil: "networkidle" });
/*
 * Los pasos no siempre son botones: en la lista de Hacer cada actividad es un
 * `span.fae-ch-rotulo`. Se prueban los tres selectores y se avisa con el
 * nombre del paso si ninguno existe — un rastro de Playwright no dice cuál de
 * los cinco pasos falló.
 */
for (const paso of pasos) {
  const donde = pagina.locator(
    `button:visible:has-text("${paso}"), a:visible:has-text("${paso}"), .fae-ch-rotulo:visible:text-is("${paso}")`,
  ).first();
  if ((await donde.count()) === 0) {
    console.error(`✗ No encontré «${paso}» en la pantalla actual. Pasos recorridos antes: ${pasos.slice(0, pasos.indexOf(paso)).join(" → ") || "(ninguno)"}`);
    await navegador.close();
    process.exit(2);
  }
  await donde.click();
  await pagina.waitForTimeout(900);
}

/* Ya en la pantalla que toca, la ventana se estira hasta la altura real. */
const altoReal = await pagina.evaluate(() => document.documentElement.scrollHeight);
await pagina.setViewportSize({ width: 320, height: Math.min(Math.max(altoReal + 200, 820), 16000) });
await pagina.waitForTimeout(300);

const informe = await pagina.evaluate((MIN) => {
  const controles = [...document.querySelectorAll("button:not([disabled]), [role=button]")]
    .map((el) => {
      const c = el.getBoundingClientRect();
      if (!c.width) return null;
      return { el, nombre: el.getAttribute("aria-label") || (el.textContent || "").trim().slice(0, 28) || "(sin nombre)",
               cx: c.left + c.width / 2, cy: c.top + c.height / 2, w: c.width, h: c.height };
    }).filter(Boolean);

  /* Lo que ni con la ventana alta cabe entero no se mide: se cuenta aparte. */
  const r0 = MIN / 2 - 1;
  const medibles = controles.filter((x) => x.cy - r0 > 0 && x.cy + r0 < window.innerHeight && x.cx - r0 > 0 && x.cx + r0 < window.innerWidth);
  const fueraDePantalla = controles.length - medibles.length;
  controles.length = 0;
  controles.push(...medibles);

  const r = MIN / 2 - 1;
  const medidos = [];
  let ilustraciones = 0;
  for (const x of controles) {
    if (x.el.closest("figure")) { ilustraciones++; continue; }
    /*
     * Los cuatro PUNTOS MEDIOS de los lados del cuadro de 44 px, no sus
     * esquinas. Casi todos los controles son píldoras (`border-radius: 999px`)
     * y la esquina de un cuadrado cae FUERA de una píldora por geometría, no
     * por defecto: midiendo esquinas, este medidor marcaba en rojo todos los
     * botones redondeados del producto. Un medidor que llora siempre se apaga,
     * y entonces deja de avisar el día que hay algo.
     */
    const bordes = [[x.cx, x.cy - r], [x.cx, x.cy + r], [x.cx - r, x.cy], [x.cx + r, x.cy]];
    let aciertos = 0;
    let tapaQuien = null;
    for (const [a, b] of bordes) {
      const encima = document.elementFromPoint(a, b);
      if (encima?.closest("button, [role=button]") === x.el) { aciertos++; continue; }
      if (encima && !x.el.contains(encima) && !tapaQuien) {
        const ot = encima.closest("button, [role=button]");
        tapaQuien = ot ? `«${(ot.getAttribute("aria-label") || ot.textContent || "").trim().slice(0, 20)}»` : `<${encima.tagName.toLowerCase()}>`;
      }
    }
    /*
     * «Tapado» manda sobre «pequeño», mida lo que mida. Antes se exigía que
     * el dibujo ya llegara a 44 para poder decir «tapado», y entonces las
     * caras traseras de las tarjetas plegadas del índice —58×28, perfectamente
     * sanas, simplemente debajo de la cara de delante— salían NUEVE VECES como
     * defecto de tamaño. Si otro elemento recibe el toque, eso es lo que hay
     * que informar: un control pequeño se arregla con tamaño y uno tapado no,
     * y confundirlos manda a arreglar lo que no está roto.
     */
    medidos.push({ nombre: x.nombre, dibujo: `${Math.round(x.w)}×${Math.round(x.h)}`, aciertos,
      causa: aciertos === 4 ? null : (tapaQuien ? `tapado por ${tapaQuien}` : "pequeño") });
  }

  const solapes = [];
  for (let i = 0; i < controles.length; i++) {
    for (let j = i + 1; j < controles.length; j++) {
      const dx = Math.abs(controles[i].cx - controles[j].cx), dy = Math.abs(controles[i].cy - controles[j].cy);
      if (dx < MIN && dy < MIN) solapes.push(`«${controles[i].nombre}» ↔ «${controles[j].nombre}» (${Math.round(dx)}×${Math.round(dy)} px entre centros)`);
    }
  }
  return { medidos, solapes, ilustraciones, fueraDePantalla };
}, MINIMO);

/*
 * PEQUEÑOS Y TAPADOS SE CUENTAN APARTE, y no es cosmética del informe: son
 * dos arreglos distintos. Un control pequeño se arregla con tamaño. Uno
 * tapado o es un defecto grave —un control al que no se llega— o es un panel
 * legítimo delante, y eso solo lo sabe quien mira. Sumándolos, el índice de
 * Contabilidad informaba «25 controles por debajo de 44 px» cuando los 25
 * eran caras traseras de tarjetas plegadas, perfectamente sanas, y los
 * defectos de tamaño eran CERO. Un total que mezcla las dos cosas manda a
 * agrandar lo que no lo necesita.
 */
let pequenos = 0;
let tapados = 0;
for (const m of informe.medidos) {
  const ok = m.aciertos === 4;
  if (!ok) (m.causa && m.causa.startsWith("tapado") ? tapados++ : pequenos++);
  const causa = m.causa ? `  ← ${m.causa}` : "";
  console.log(`${ok ? "✅" : "⚠️ "} dibujo ${m.dibujo.padEnd(8)} toque ${m.aciertos}/4 bordes   «${m.nombre}»${causa}`);
}
const malos = pequenos;
if (informe.fueraDePantalla > 0) {
  console.log(`\n(${informe.fueraDePantalla} control(es) no se midieron: no caben enteros con su margen de ${MINIMO} px ni estirando la ventana a la altura de la página. No se dan por buenos ni por malos.)`);
}
if (informe.ilustraciones > 0) {
  console.log(`\n(${informe.ilustraciones} botón/es de dentro de un <figure> no se midieron: son dibujo de un panel de ejemplo, no controles.)`);
}
if (informe.solapes.length) {
  console.log(`\n⚠️  CONTROLES DEMASIADO JUNTOS para un blanco de ${MINIMO} px — agrandarlos los solaparía:`);
  for (const s of informe.solapes) console.log("   ", s);
}
console.log(`\n${pequenos === 0 ? `✅ ningún control por debajo de ${MINIMO}×${MINIMO} px.` : `⚠️  ${pequenos} control(es) DEMASIADO PEQUEÑOS (se arreglan con tamaño).`}`);
if (tapados > 0) {
  console.log(`⚠️  ${tapados} control(es) TAPADOS: otro elemento recibe el toque. No es lo mismo que pequeño —`);
  console.log(`    puede ser un panel legítimo delante (una tarjeta plegada, un ejemplo) o un control al que`);
  console.log(`    de verdad no se llega. Míralos uno por uno; no los agrandes sin mirar.`);
}
await navegador.close();
process.exitCode = malos === 0 ? 0 : 1;
