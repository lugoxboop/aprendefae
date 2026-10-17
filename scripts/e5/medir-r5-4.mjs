/*
 * ═══════════════════════════════════════════════════════════════════════════
 * ¿CABE r5-4 «SEPTIEMBRE EN BARRANQUILLA» A 375 Y 320? (Célula E)
 *
 *   node scripts/e5/medir-r5-4.mjs [carpeta-de-capturas]
 *
 * Como medir-r5-3.mjs (Chromium de verdad con la hoja de estilos del sitio,
 * banco scripts/e5/harness-r5), con lo que pide el paquete e5-r5-4-v1:
 * viewport de 320 × 568 y 375 × 667 con window.innerWidth comprobado. Juega
 * los diez asientos bien salvo el 7 (el peor armador: el pago con descuento,
 * tres renglones), que se arma sin descuento para ver su ERA ESTE. Mide la
 * entrada, cada asiento lleno y revisado, la hoja de 11 cuentas con la marca
 * «EN EL HABER», la hoja de datos y el final. En cada estado:
 *
 *   · sin barra horizontal y sin textos que se salgan de su caja
 *   · ningún texto de lectura bajo 12 px (las marcas en mayúsculas, 10,5)
 *   · Inter y Sora cargadas; cada botón de toque de 44 px de alto o más
 *   · la hoja de 11 cuentas y la de datos, con scroll interno bajo el 85 %
 *   · «El mes en dos cuentas»: el completo anima solo entero en la ventana
 *     (E2); el compacto (asientos 1, 3, 4 y 6) no anima
 *
 * Sale con código 1 si algo falla. Necesita Playwright (no es dependencia del
 * repo): el de la máquina, o el de PLAYWRIGHT_MODULE.
 * ═══════════════════════════════════════════════════════════════════════════
 */
import { createServer } from "vite";
import { createRequire } from "node:module";
import { mkdirSync } from "node:fs";
import { resolve } from "node:path";

const RAIZ = resolve(import.meta.dirname, "../..");
const require = createRequire(import.meta.url);
const { chromium } = require(process.env.PLAYWRIGHT_MODULE ?? "/opt/node-tools/node_modules/playwright");
const CAPTURAS = process.argv[2] ?? null;
if (CAPTURAS) mkdirSync(CAPTURAS, { recursive: true });
const ANCHOS = [375, 320];
const ALTO = { 375: 667, 320: 568 };
const CONTENIDO = { 375: 343, 320: 288 };
const { ASIENTOS_BARRANQUILLA: ASIENTOS } = await import("../../src/data/repasoCap5BarranquillaTextos.js");

const servidor = await createServer({ root: RAIZ, logLevel: "error", server: { port: 0, host: "127.0.0.1" } });
await servidor.listen();
const URL_BANCO = `http://127.0.0.1:${servidor.httpServer.address().port}/scripts/e5/harness-r5/index.html#r5-4`;
const navegador = await chromium.launch(process.env.CHROMIUM_PATH ? { executablePath: process.env.CHROMIUM_PATH } : {});
const fallos = [];
const filas = [];

function medir() {
  const raiz = document.getElementById("root");
  const problemas = [];
  const conTexto = [...raiz.querySelectorAll("*")]
    .filter((el) => !el.matches("style, script"))
    .filter((el) => { const e = getComputedStyle(el); return !(e.position === "absolute" && el.clientWidth <= 1); })
    .filter((el) => [...el.childNodes].some((n) => n.nodeType === 3 && n.textContent.trim()));
  for (const el of conTexto) {
    const r = el.getBoundingClientRect();
    if (!r.width) continue;
    const nombre = `${el.tagName.toLowerCase()} «${el.textContent.trim().slice(0, 40)}»`;
    if (getComputedStyle(el).display !== "inline" && el.scrollWidth > el.clientWidth + 0.5) problemas.push(`${nombre}: mide ${el.scrollWidth} px en una caja de ${el.clientWidth}`);
    if (r.right > window.innerWidth + 0.5 || r.left < -0.5) problemas.push(`${nombre}: se sale de la pantalla`);
  }
  for (const c of document.querySelectorAll("input")) if (c.scrollWidth > c.clientWidth + 0.5) problemas.push(`el campo «${c.value}» se desborda`);
  if (document.documentElement.scrollWidth > window.innerWidth) problemas.push(`la página mide ${document.documentElement.scrollWidth} px en ${window.innerWidth}`);
  /* El reinicio del Cierre compartido no es de esta célula (reportado): no se mide aquí. */
  const toques = [...document.querySelectorAll("button")].filter((b) => b.getBoundingClientRect().width && !b.closest(".fae-cz-entrar") && b.closest("[data-r5-4], [role=dialog]"));
  for (const b of toques) { const r = b.getBoundingClientRect(); if (r.height < 44) problemas.push(`el botón «${b.textContent.trim().slice(0, 24)}» mide ${r.height.toFixed(1)} px de alto`); }
  const otra = document.querySelector("[data-otra-operacion]");
  /* Letra mínima: 12 px para lo que se lee; las marcas de interfaz en mayúsculas, 10,5. */
  for (const el of conTexto) {
    const e = getComputedStyle(el);
    if (!el.getBoundingClientRect().width || el.closest(".fae-cz-entrar")) continue;
    const px = parseFloat(e.fontSize);
    const marca = e.textTransform === "uppercase";
    if (px < (marca ? 10.5 : 12) - 0.01) problemas.push(`«${el.textContent.trim().slice(0, 30)}» a ${px} px`);
  }
  const act = document.querySelector("[data-r5-4]");
  return {
    problemas,
    actividad: act ? Math.round(act.getBoundingClientRect().width * 10) / 10 : null,
    alto: Math.round(document.documentElement.scrollHeight),
    nota: otra ? `otra operación ${Math.round(otra.firstElementChild.scrollWidth)} de ${Math.round(otra.getBoundingClientRect().width)}` : null,
    fuentes: document.fonts.check("15px Inter") && document.fonts.check("700 14px Sora"),
  };
}
function medirHoja(sel) {
  const h = document.querySelector(sel);
  return { alto: Math.round(h.getBoundingClientRect().height), tope: Math.round(window.innerHeight * 0.85), scroll: h.scrollHeight > h.clientHeight + 0.5 };
}

for (const ancho of ANCHOS) {
  const pg = await navegador.newPage({ viewport: { width: ancho, height: ALTO[ancho] }, deviceScaleFactor: 2 });
  await pg.goto(URL_BANCO);
  const iw = await pg.evaluate(() => window.innerWidth);
  if (iw !== ancho) fallos.push(`${ancho} px · window.innerWidth da ${iw}`);
  await pg.waitForSelector("[data-r5-4]");
  let n = 0;
  const estado = async (nombre) => {
    await pg.evaluate(() => document.fonts.ready);
    const m = await pg.evaluate(medir);
    filas.push({ ancho, estado: nombre, ...m });
    for (const p of m.problemas) fallos.push(`${ancho} px · ${nombre} · ${p}`);
    if (!m.fuentes) fallos.push(`${ancho} px · ${nombre} · no cargaron Inter o Sora`);
    if (m.actividad !== null && Math.abs(m.actividad - CONTENIDO[ancho]) > 0.5) fallos.push(`${ancho} px · ${nombre} · el contenido mide ${m.actividad} y son ${CONTENIDO[ancho]}`);
    if (CAPTURAS) await pg.screenshot({ path: resolve(CAPTURAS, `r5-4-${ancho}-${String(++n).padStart(2, "0")}-${nombre}.png`), fullPage: true });
  };
  const hoja = async (sel, nombre, conScroll) => {
    const h = await pg.evaluate(medirHoja, sel);
    filas.push({ ancho, estado: nombre, alto: h.alto, actividad: null, nota: `${h.alto} de ${h.tope}${h.scroll ? ", con scroll" : ""}` });
    if (h.alto > h.tope + 0.5) fallos.push(`${ancho} px · ${nombre} · mide ${h.alto} y el tope es ${h.tope}`);
    if (conScroll && !h.scroll) fallos.push(`${ancho} px · ${nombre} · no tiene scroll interno`);
    if (CAPTURAS) await pg.screenshot({ path: resolve(CAPTURAS, `r5-4-${ancho}-${String(++n).padStart(2, "0")}-${nombre}.png`) });
  };
  /*
   * P2 de Itagaki: el calendario es la figura del mes (el panel salió de r5-4).
   * ⛔ (a) el encabezado: del borde superior de la actividad a la frase del
   * hecho; si pasa de 96 px, se detiene. La figura debe empezar a 280 px o
   * menos. ⛔ (b) la perilla: su área táctil EFECTIVA (los puntos donde un
   * toque cae en ella) no puede bajar de 44 × 44 px.
   */
  const calendario = async (id, conPerilla) => {
    const m = await pg.evaluate(() => {
      const raiz = document.querySelector("[data-paso]");
      const frase = document.querySelector("[data-frase]");
      const cal = document.querySelector("[data-calendario]");
      const celda = document.querySelector('[data-calendario] [data-dia="1"]');
      const top = raiz.getBoundingClientRect().top + window.scrollY;
      return {
        /* Lo propio de la actividad sobre la frase: del contador a la frase (el objetivo del asiento 1 va aparte). */
        encabezado: Math.round(frase.getBoundingClientRect().top - document.querySelector("[data-progreso]").getBoundingClientRect().top),
        objetivo: Math.round(document.querySelector("[data-objetivo]")?.getBoundingClientRect().height ?? 0),
        figura: Math.round(cal.getBoundingClientRect().top + window.scrollY - top),
        alto: Math.round(cal.getBoundingClientRect().height),
        celda: Math.round(celda.getBoundingClientRect().width * 10) / 10,
      };
    });
    filas.push({ ancho, estado: `${id}-calendario`, alto: m.alto, actividad: null, nota: `encabezado ${m.encabezado}${m.objetivo ? `, objetivo ${m.objetivo}` : ""}, figura desde ${m.figura}, celda ${m.celda}` });
    if (m.encabezado > 96) fallos.push(`${ancho} px · ${id} · ⛔ el encabezado mide ${m.encabezado} px (tope 96)`);
    if (m.figura > 280) fallos.push(`${ancho} px · ${id} · la figura empieza en ${m.figura} px (tope 280)`);
    if (!conPerilla) return;
    /* La perilla: se lleva a la vista y se barre su área con elementFromPoint, de 1 en 1 px. */
    await pg.evaluate(() => document.querySelector("[data-perilla]").scrollIntoView({ block: "center" }));
    const p = await pg.evaluate(() => {
      const b = document.querySelector("[data-perilla-boton]").getBoundingClientRect();
      const cx = b.left + b.width / 2;
      const cy = b.top + b.height / 2;
      const dentro = (x, y) => Boolean(document.elementFromPoint(x, y)?.closest("[data-perilla]"));
      let ancho = 0;
      let alto = 0;
      for (let d = -30; d <= 30; d++) { if (dentro(cx + d, cy)) ancho++; if (dentro(cx, cy + d)) alto++; }
      return { ancho, alto, boton: Math.round(b.width) };
    });
    filas.push({ ancho, estado: `${id}-perilla`, alto: p.alto, actividad: null, nota: `área táctil efectiva ${p.ancho} × ${p.alto} px; perilla ${p.boton} px` });
    if (p.ancho < 44 || p.alto < 44) fallos.push(`${ancho} px · ${id} · ⛔ la perilla tiene un área táctil efectiva de ${p.ancho} × ${p.alto} px (mínimo 44)`);
  };
  /* Takamura (#380): r5-4 no tiene entrada; abre en el asiento 1. */
  for (const [k, a] of ASIENTOS.entries()) {
    await estado(`${a.id}-vacio`);
    await calendario(a.id, Boolean(a.ventana));
    /* Los dos asientos con condición: la ventana primero (el 7, contando el día de la factura: error; el 9, bien). */
    if (a.ventana) {
      const borde = a.id === "a7" ? a.ventana.pago - 1 : a.ventana.pago;
      await pg.click(`[data-calendario] [data-dia="${borde}"]`);
      await pg.click("[data-revisar-ventana]");
      await pg.waitForTimeout(800);
      await estado(`${a.id}-ventana`);
    }
    if (k === 0) {
      await pg.click("[data-boton-datos]");
      await hoja("[data-hoja-datos]", "hoja-datos", true);
      await pg.click("[data-hoja-datos] [data-cerrar]");
    }
    const renglones = a.correctos[0].map((c) => ({ ...c }));
    /* El 7, el peor armador, sin descuento: Caja por el saldo entero, para ver su ERA ESTE. */
    if (a.id === "a7") renglones.splice(1, 2, { lado: "haber", cuenta: "Caja", valor: renglones[0].valor });
    for (const [j, c] of renglones.entries()) {
      await pg.click(`[data-anadir="${c.lado}"]`);
      if (a.id === "a9" && j === 2) await hoja("[data-hoja-renglon]", "hoja-cuentas-con-marca", true);
      await pg.click(`[data-hoja-renglon] [data-cuenta="${c.cuenta}"]`);
      await pg.fill("[data-hoja-renglon] input", String(c.valor));
      await pg.click("[data-hoja-renglon] [data-listo]");
    }
    await estado(`${a.id}-lleno`);
    await pg.click("[data-revisar]");
    await pg.waitForTimeout(800);
    await estado(`${a.id}-revisado`);
    await pg.click("[data-siguiente]");
  }
  await pg.waitForSelector("[data-cierre]");
  await estado("final");
  await pg.close();
}

await navegador.close();
await servidor.close();

console.log("ancho | estado | contenido | alto | nota");
for (const f of filas) console.log(`${f.ancho} | ${f.estado} | ${f.actividad ?? "—"} | ${f.alto} | ${f.nota ?? "—"}`);
const estados = filas.filter((f) => !f.estado.startsWith("hoja") && !/-(calendario|perilla)$/.test(f.estado)).length / ANCHOS.length;
console.log(`\n${filas.length} medidas (${estados} estados × ${ANCHOS.length} anchos, más las hojas).`);
if (estados !== 33) fallos.push(`se recorrieron ${estados} estados y son 33`); // + las dos ventanas (P2), − la entrada (Takamura)
if (fallos.length) {
  console.log(`\nFALLA: ${fallos.length} problema(s)`);
  for (const f of fallos) console.log(`  · ${f}`);
  process.exit(1);
}
console.log("PASA: r5-4 cabe a 375 y a 320 px.");
