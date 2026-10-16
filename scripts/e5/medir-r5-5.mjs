/*
 * ═══════════════════════════════════════════════════════════════════════════
 * ¿CABE r5-5 «SEPTIEMBRE EN PERMANENTE» A 375 Y 320? (Célula E)
 *
 *   node scripts/e5/medir-r5-5.mjs [carpeta-de-capturas]
 *
 * Como medir-r5-4.mjs (Chromium de verdad con la hoja de estilos del sitio,
 * banco scripts/e5/harness-r5), con lo que pide Kamogawa (decisión 6): juega
 * las cinco pantallas con acierto y con cada error de un toque (pantalla 1:
 * «AL GASTO»; pantalla 3: 9.000, 2.215,83 y 2.185; pantalla 5: b, c y d), en
 * cuatro partidas, a 320 × 568 y 375 × 667 con window.innerWidth comprobado.
 * En cada estado:
 *
 *   · sin barra horizontal y sin textos que se salgan de su caja
 *   · ningún texto de lectura bajo 12 px (las marcas en mayúsculas, 10,5)
 *   · Inter y Sora cargadas; cada botón de toque de 44 px de alto o más
 *   · «ENTRADA» cabe en su columna (v1.3, decisión 7)
 *   · la hoja de 7 cuentas, sin scroll interno bajo el 85 % (v1.1 §3)
 *
 * Y E2 con las posiciones del diseño (v1.1), sin desplazar la página:
 *   · pantalla 1: del campo al final de «Revisar» cabe en la ventana útil
 *   · pantalla 2: de los campos al final de «Revisar valores», igual
 *   · pantalla 3: la rejilla y la fila que se llena caben en la ventana al
 *     tocar, y la barra termina su movimiento a la vista
 *   · pantalla 4: del primer campo al final de «Revisar», igual
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
const BARRA_DEL_SITIO = 56;
const { CLAVES } = await import("../../src/data/repasoCap5Permanente.js");

/* Las cuatro partidas: la primera, todo bien; las otras, cada error de un toque. */
const PARTIDAS = [
  { nombre: "bien", p1: "compra", p3: CLAVES.p3.unitario, p5: "a" },
  { nombre: "error-1", p1: "gasto", p3: 9000, p5: "b" },
  { nombre: "error-2", p1: "compra", p3: 2215.83, p5: "c" },
  { nombre: "error-3", p1: "compra", p3: 2185, p5: "d" },
];

const servidor = await createServer({ root: RAIZ, logLevel: "error", server: { port: 0, host: "127.0.0.1" } });
await servidor.listen();
const URL_BANCO = `http://127.0.0.1:${servidor.httpServer.address().port}/scripts/e5/harness-r5/index.html#r5-5`;
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
  /* Cada celda del kárdex dentro de su columna (las cifras y «ENTRADA»). */
  for (const c of document.querySelectorAll(".r55-k > span")) {
    const hijo = c.firstElementChild ?? c;
    if (hijo.scrollWidth > c.clientWidth + 0.5) problemas.push(`la celda «${c.textContent.trim()}» mide ${hijo.scrollWidth} px en ${c.clientWidth}`);
  }
  for (const c of document.querySelectorAll("input")) if (c.scrollWidth > c.clientWidth + 0.5) problemas.push(`el campo «${c.value}» se desborda`);
  if (document.documentElement.scrollWidth > window.innerWidth) problemas.push(`la página mide ${document.documentElement.scrollWidth} px en ${window.innerWidth}`);
  /* El reinicio del Cierre compartido no es de esta célula: no se mide aquí. */
  const toques = [...document.querySelectorAll("button")].filter((b) => b.getBoundingClientRect().width && !b.closest(".fae-cz-entrar") && b.closest("[data-r5-5], [role=dialog]"));
  for (const b of toques) { const r = b.getBoundingClientRect(); if (r.height < 44) problemas.push(`el botón «${b.textContent.trim().slice(0, 24)}» mide ${r.height.toFixed(1)} px de alto`); }
  for (const el of conTexto) {
    const e = getComputedStyle(el);
    if (!el.getBoundingClientRect().width || el.closest(".fae-cz-entrar")) continue;
    const px = parseFloat(e.fontSize);
    const marca = e.textTransform === "uppercase";
    if (px < (marca ? 10.5 : 12) - 0.01) problemas.push(`«${el.textContent.trim().slice(0, 30)}» a ${px} px`);
  }
  const act = document.querySelector("[data-r5-5]");
  const k = document.querySelector("[data-kardex]");
  return {
    problemas,
    actividad: act ? Math.round(act.getBoundingClientRect().width * 10) / 10 : null,
    alto: Math.round(document.documentElement.scrollHeight),
    nota: k ? `kárdex ${Math.round(k.getBoundingClientRect().height)}` : null,
    fuentes: document.fonts.check("15px Inter") && document.fonts.check("700 14px Sora"),
  };
}
/* Las posiciones en la página (sin desplazar), como las da el diseño. */
function posiciones(sels) {
  const y = window.scrollY;
  return Object.fromEntries(Object.entries(sels).map(([k, s]) => {
    const el = document.querySelector(s);
    if (!el) return [k, null];
    const r = el.getBoundingClientRect();
    return [k, { arriba: Math.round(r.top + y), abajo: Math.round(r.bottom + y), enVentana: [Math.round(r.top), Math.round(r.bottom)] }];
  }));
}

for (const ancho of ANCHOS) {
  for (const partida of PARTIDAS) {
    const pg = await navegador.newPage({ viewport: { width: ancho, height: ALTO[ancho] }, deviceScaleFactor: 2 });
    await pg.goto(URL_BANCO);
    const iw = await pg.evaluate(() => window.innerWidth);
    if (iw !== ancho) fallos.push(`${ancho} px · window.innerWidth da ${iw}`);
    await pg.waitForSelector("[data-r5-5]");
    const util = ALTO[ancho] - BARRA_DEL_SITIO;
    let n = 0;
    const estado = async (nombre) => {
      await pg.evaluate(() => document.fonts.ready);
      const m = await pg.evaluate(medir);
      filas.push({ ancho, partida: partida.nombre, estado: nombre, ...m });
      for (const p of m.problemas) fallos.push(`${ancho} px · ${partida.nombre} · ${nombre} · ${p}`);
      if (!m.fuentes) fallos.push(`${ancho} px · ${nombre} · no cargaron Inter o Sora`);
      if (m.actividad !== null && Math.abs(m.actividad - CONTENIDO[ancho]) > 0.5) fallos.push(`${ancho} px · ${nombre} · el contenido mide ${m.actividad} y son ${CONTENIDO[ancho]}`);
      if (CAPTURAS) await pg.screenshot({ path: resolve(CAPTURAS, `r5-5-${ancho}-${partida.nombre}-${String(++n).padStart(2, "0")}-${nombre}.png`), fullPage: true });
    };
    const cabe = async (nombre, desde, hasta) => {
      const p = await pg.evaluate(posiciones, { desde, hasta });
      if (!p.desde || !p.hasta) { fallos.push(`${ancho} px · ${nombre} · no encuentro ${desde} o ${hasta}`); return; }
      const alto = p.hasta.abajo - p.desde.arriba;
      filas.push({ ancho, partida: partida.nombre, estado: `E2 ${nombre}`, alto, actividad: null, nota: `${p.desde.arriba}–${p.hasta.abajo}: ${alto} de ${util}` });
      if (alto > util) fallos.push(`${ancho} px · ${nombre} · de ${desde} a ${hasta} hay ${alto} px y la ventana útil es ${util}`);
    };
    /* La barra: espera a que termine su movimiento y comprueba que estaba a la vista (al menos la mitad). */
    const barraTermina = async (nombre) => {
      const t0 = Date.now();
      let visto = null;
      while (Date.now() - t0 < 4000) {
        const b = await pg.evaluate(() => {
          const el = document.querySelector("[data-barra-inventario]");
          const r = el.getBoundingClientRect();
          const visible = Math.max(0, Math.min(r.bottom, window.innerHeight) - Math.max(r.top, 0)) / r.height;
          return { enCurso: el.dataset.enCurso, visible };
        });
        if (b.enCurso === "si" && visto === null) visto = b.visible;
        if (b.enCurso === "no") break;
        await pg.waitForTimeout(50);
      }
      const fin = await pg.evaluate(() => document.querySelector("[data-barra-inventario]").dataset.enCurso);
      if (fin !== "no") fallos.push(`${ancho} px · ${nombre} · la barra no terminó su movimiento`);
      if (visto !== null && visto < 0.5) fallos.push(`${ancho} px · ${nombre} · la barra se movió con ${Math.round(visto * 100)} % a la vista`);
    };
    const escribir = async (sel, texto) => { await pg.click(sel); await pg.keyboard.type(texto); };
    const armar = async (renglones, conHoja = false) => {
      for (const [j, c] of renglones.entries()) {
        await pg.click(`[data-anadir="${c.lado}"]`);
        if (conHoja && j === 1) {
          const h = await pg.evaluate(() => {
            const el = document.querySelector("[data-hoja-renglon]");
            return { alto: Math.round(el.getBoundingClientRect().height), tope: Math.round(window.innerHeight * 0.85), scroll: el.scrollHeight > el.clientHeight + 0.5 };
          });
          filas.push({ ancho, partida: partida.nombre, estado: "hoja-7-cuentas", alto: h.alto, actividad: null, nota: `${h.alto} de ${h.tope}${h.scroll ? ", con scroll" : ""}` });
          if (h.alto > h.tope + 0.5 || h.scroll) fallos.push(`${ancho} px · hoja de 7 cuentas · ${h.alto} de ${h.tope}${h.scroll ? ", con scroll interno" : ""}`);
          if (CAPTURAS) await pg.screenshot({ path: resolve(CAPTURAS, `r5-5-${ancho}-${partida.nombre}-${String(++n).padStart(2, "0")}-hoja.png`) });
        }
        await pg.click(`[data-hoja-renglon] [data-cuenta="${c.cuenta}"]`);
        await pg.fill("[data-hoja-renglon] input", String(c.valor));
        await pg.click("[data-hoja-renglon] [data-listo]");
      }
    };
    const siguiente = async () => { await pg.click("[data-siguiente]"); await pg.waitForTimeout(100); };
    const primera = partida.nombre === "bien";

    if (primera) await estado("entrada");
    await pg.click("[data-empezar]");

    /* Pantalla 1. */
    if (primera) await estado("p1-vacia");
    await pg.click(`[data-eleccion="${partida.p1}"]`);
    await pg.waitForSelector("[data-campo=unitario]");
    await pg.waitForTimeout(partida.p1 === "gasto" ? 1100 : 300);
    if (primera) {
      /* La red de la coma: «2300» da 23,00 y sale el aviso. */
      await escribir("[data-campo=unitario]", "2300");
      await pg.click("[data-revisar]");
      await pg.waitForSelector("[data-aviso-coma]");
      await estado("p1-aviso-coma");
      await pg.fill("[data-campo=unitario]", "");
    }
    await escribir("[data-campo=unitario]", "230000");
    await cabe("p1 campo → Revisar", "[data-campo-bloque=unitario]", "[data-revisar]");
    await estado(`p1-${partida.p1}-lleno`);
    await pg.click("[data-revisar]");
    await barraTermina("p1");
    await estado("p1-revisada");
    await siguiente();

    /* Pantalla 2. */
    if (primera) await estado("p2-vacia");
    await escribir("[data-campo=promedio]", "221928");
    await escribir("[data-campo=costo]", String(CLAVES.p2.costo));
    await cabe("p2 campos → Revisar valores", "[data-campo-bloque=promedio]", "[data-revisar-valores]");
    await pg.click("[data-revisar-valores]");
    await pg.waitForSelector("[data-asiento-del-costo]");
    if (primera) await estado("p2-valores");
    await armar([{ lado: "debe", cuenta: "Costo de mercancía vendida", valor: CLAVES.p2.costo }, { lado: "haber", cuenta: primera ? "Inventario de mercancías" : "Caja", valor: CLAVES.p2.costo }], primera);
    await pg.click("[data-revisar-asiento]");
    await estado("p2-revisada");
    await siguiente();

    /* Pantalla 3: la rejilla y la fila que se llena, a la vista sin desplazar. */
    if (primera) {
      await estado("p3-vacia");
      const p = await pg.evaluate(posiciones, { rejilla: "[data-rejilla]", fila: "[data-fila=d15]" });
      const [arriba] = p.rejilla.enVentana;
      const abajo = p.fila.enVentana[1];
      filas.push({ ancho, partida: partida.nombre, estado: "E2 p3 rejilla y fila", alto: abajo - arriba, actividad: null, nota: `${arriba}–${abajo} en la ventana de ${ALTO[ancho]} (útil desde ${BARRA_DEL_SITIO})` });
      if (abajo > ALTO[ancho] || arriba < BARRA_DEL_SITIO) fallos.push(`${ancho} px · p3 · la rejilla y la fila (${arriba}–${abajo}) no caben sin desplazar en la ventana`);
    }
    await pg.click(`[data-eleccion="${partida.p3}"]`);
    if (partida.p3 !== CLAVES.p3.unitario) {
      await pg.waitForTimeout(200);
      await estado(`p3-${partida.p3}-espera`);
    }
    /* El estudiante baja hasta la barra, como lo haría: su movimiento arranca a la vista. */
    await pg.evaluate(() => document.querySelector("[data-barra-inventario]").scrollIntoView({ block: "center" }));
    await barraTermina(`p3 ${partida.p3}`);
    await pg.waitForSelector("[data-asiento-del-costo]");
    await armar([{ lado: "debe", cuenta: "Inventario de mercancías", valor: CLAVES.p3.total }, { lado: "haber", cuenta: "Costo de mercancía vendida", valor: CLAVES.p3.total }]);
    await pg.click("[data-revisar-asiento]");
    await estado(`p3-${partida.p3}-revisada`);
    await siguiente();

    /* Pantalla 4. */
    if (primera) await estado("p4-vacia");
    await escribir("[data-campo=promedio]", "213017");
    await escribir("[data-campo=costo]", String(CLAVES.p4.costo));
    await cabe("p4 primer campo → Revisar", "[data-campo-bloque=promedio]", "[data-revisar]");
    await pg.click("[data-revisar]");
    await barraTermina("p4");
    if (primera) await estado("p4-revisada");
    await siguiente();

    /* Pantalla 5. */
    if (primera) await estado("p5-vacia");
    await pg.click("[data-fila-del-diez]");
    await pg.waitForSelector("[data-opciones]");
    await pg.waitForTimeout(400);
    if (primera) await estado("p5-franja");
    await pg.click(`[data-opcion="${partida.p5}"]`);
    await estado(`p5-${partida.p5}-revisada`);
    await siguiente();

    await pg.waitForSelector("[data-cierre]");
    if (primera) await estado("final");
    await pg.close();
  }
}

await navegador.close();
await servidor.close();

console.log("ancho | partida | estado | contenido | alto | nota");
for (const f of filas) console.log(`${f.ancho} | ${f.partida} | ${f.estado} | ${f.actividad ?? "—"} | ${f.alto} | ${f.nota ?? "—"}`);
const estados = filas.filter((f) => !f.estado.startsWith("hoja") && !f.estado.startsWith("E2")).length / ANCHOS.length;
console.log(`\n${filas.length} medidas (${estados} estados × ${ANCHOS.length} anchos, más las hojas y E2).`);
if (estados !== 34) fallos.push(`se recorrieron ${estados} estados y son 34`);
if (fallos.length) {
  console.log(`\nFALLA: ${fallos.length} problema(s)`);
  for (const f of fallos) console.log(`  · ${f}`);
  process.exit(1);
}
console.log("PASA: r5-5 cabe a 375 y a 320 px.");
