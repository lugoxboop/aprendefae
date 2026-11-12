/*
 * ═══════════════════════════════════════════════════════════════════════════
 * T3 · EL VOLUMEN DE LOS CONTROLES PROPIOS DE LA CÉLULA E, MEDIDO EN LA
 * PÁGINA REAL (forma: orquestador/revisiones/volumen/e-volumen-forma-v1.md,
 * condiciones 1 y 3 de Takamura).
 *
 * Lo mismo que medir-cabecera-real.mjs hace con Aprender, pero en Hacer: dist
 * servido (vite build con Supabase falso), la sesión fingida y las fuentes de
 * producción (scripts/t4/panel-docente/pagina.mjs), la ruta real
 * #/ingresos-gastos-y-caja/hacer/<id>, con «Así se juega» ya visto, a
 * 320 × 568 y 375 × 667. En cada juego mide:
 *
 *   cabecera   del borde de arriba de la PÁGINA al pie del avance («Ítem n
 *              de N»), y del borde de arriba del Panel al mismo pie (la cifra
 *              de 167 que supone la forma)
 *   bloque     lo que el estudiante decide en esa pantalla, de arriba abajo,
 *              y si cabe en la ventana: (a) con la vista subida a la tarjeta
 *              del hecho (la regla de #506) y (b) desde arriba de la página,
 *              cabecera incluida (el cálculo de la forma)
 *   paradas    el banco de ArmaElAjuste (alto, filas), el estante de H7 (alto,
 *              renglones y lo que queda libre bajo cada botón), la fila de
 *              pasos de H6, las casillas y la hoja de H3
 *   toque      cada botón del juego mide 44 × 44 o más (el blanco del canto
 *              cuenta: el bloque entero recibe el toque)
 *
 *   VITE_SUPABASE_URL=http://fake.supabase.test VITE_SUPABASE_ANON_KEY=anon-falsa npx vite build
 *   npx vite preview --port 8099 --strictPort &
 *   node scripts/t3/medir-volumen-e.mjs [http://localhost:8099] [--capturas carpeta] [--etiqueta antes|despues]
 *
 * No falla: informa. Lo que decide si algo cabe está en las tablas.
 * ═══════════════════════════════════════════════════════════════════════════
 */
import { join } from "node:path";
import { mkdirSync } from "node:fs";
import { abrirPanel, chromium, hayFuentes } from "../t4/panel-docente/pagina.mjs";
import { bancoDe } from "../../src/contabilidad/gastoOPago.js";

/* GP: la casilla correcta de cada hecho, por su id (las dos versiones), para tocar bien o mal a propósito. */
const TIPO_GP = Object.fromEntries(["A", "B"].flatMap((v) => bancoDe(v).banco.map((h) => [h.id, h.tipo])));

const arg = (n) => { const i = process.argv.indexOf(n); return i > 0 ? process.argv[i + 1] : null; };
const URL_BASE = process.argv[2]?.startsWith("http") ? process.argv[2] : "http://localhost:8099";
const CAPTURAS = arg("--capturas");
const ETIQUETA = arg("--etiqueta") ?? "medida";
if (CAPTURAS) mkdirSync(CAPTURAS, { recursive: true });
if (!hayFuentes()) console.warn("⚠ Sin las fuentes de producción (bash scripts/t4/sonda-enganche/fuentes.sh): la medida no vale.");
const ALTOS = { 320: 568, 375: 667 };
const USUARIO = "00000000-0000-0000-0000-000000000001";

/* Cada juego: su id, qué es «lo que se decide» (de qué a qué) y qué hay que tocar antes. */
const JUEGOS = [
  { h: "H1", id: "t3-ingreso-o-cobro", arriba: "[data-tarjeta-hecho], [data-ficha], [data-hecho]", abajo: "[data-grupos]", parada: "grupos" },
  { h: "GP", id: "t3-gasto-o-pago", arriba: "[data-ficha]", abajo: "[data-matriz]", parada: "matriz" },
  { h: "H2", id: "t3-cuando-se-causa", arriba: "[data-tarjeta-hecho], [data-hecho]", abajo: "[data-marca]:last-of-type", parada: "marcas" },
  { h: "H3", id: "t3-mismo-hecho", arriba: "[data-tarjeta-hecho]", abajo: "[data-libros]", parada: "casillas" },
  { h: "H4", id: "t3-ajuste-acumulado", arriba: "[data-tarjeta-hecho]", abajo: "[data-ayuda]", parada: "banco" },
  { h: "H5", id: "t3-ajuste-diferido", arriba: "[data-tarjeta-hecho]", abajo: "[data-ayuda]", parada: "banco" },
  { h: "H6", id: "t3-que-le-toca", arriba: ".fae-a6-hecho, [data-tarjeta-hecho]", abajo: "[data-campos]", parada: "pasos" },
  { h: "H7", id: "t3-cierre-completo", arriba: "[data-mesa]", abajo: "[data-estante]", parada: "estante" },
];

function medir({ arriba, abajo, parada }) {
  const y = (r) => Math.round((r + scrollY) * 10) / 10;
  const q = (sel) => { for (const s of sel.split(",")) { const el = document.querySelector(s.trim()); if (el) return el; } return null; };
  const avance = document.querySelector("[data-avance], [data-progreso]");
  const panel = avance?.closest("section");
  const r = { ventana: innerHeight, barra: document.documentElement.scrollWidth > innerWidth + 1 };
  if (avance) {
    r.cabeceraPagina = y(avance.getBoundingClientRect().bottom);
    r.cabeceraPanel = panel ? Math.round((avance.getBoundingClientRect().bottom - panel.getBoundingClientRect().top) * 10) / 10 : null;
  }
  const a = q(arriba);
  const listaAbajo = abajo.endsWith(":last-of-type") ? [...document.querySelectorAll(abajo.replace(":last-of-type", ""))] : null;
  const b = listaAbajo ? listaAbajo.at(-1) : q(abajo);
  if (a && b) {
    const top = y(a.getBoundingClientRect().top);
    const bottom = y(b.getBoundingClientRect().bottom);
    r.bloque = { top, bottom, alto: Math.round((bottom - top) * 10) / 10 };
    r.cabeA = bottom - top <= innerHeight + 0.5;
    r.cabeB = bottom <= innerHeight + 0.5;
  } else r.falta = `${a ? "" : arriba} ${b ? "" : abajo}`.trim();

  const alto = (el) => (el ? Math.round(el.getBoundingClientRect().height * 10) / 10 : null);
  if (parada === "banco") {
    const banco = document.querySelector("[data-banco]");
    const fichas = [...document.querySelectorAll("[data-nombre]")].map((x) => x.getBoundingClientRect());
    r.banco = { alto: alto(banco), filas: new Set(fichas.map((f) => Math.round(f.top))).size, ficha: alto(document.querySelector("[data-nombre]")) };
  }
  if (parada === "estante") {
    const renglones = [...document.querySelectorAll("[data-estante] [data-en-estante]")];
    r.estante = {
      alto: alto(document.querySelector("[data-estante]")),
      renglones: renglones.length,
      libre: renglones.map((f) => {
        const fr = f.getBoundingClientRect();
        const bs = [...f.querySelectorAll("button")].map((x) => x.getBoundingClientRect());
        return { renglon: Math.round(fr.height * 10) / 10, boton: Math.round(Math.max(...bs.map((x) => x.height)) * 10) / 10, libre: Math.round((fr.bottom - Math.max(...bs.map((x) => x.bottom))) * 10) / 10 };
      }),
      gap: getComputedStyle(document.querySelector("[data-estante]")).rowGap,
    };
  }
  if (parada === "pasos") r.pasos = { boton: alto(document.querySelector("[data-paso-corte]")), fila: alto(document.querySelector("[data-paso-corte]")?.parentElement?.closest("div:not(.fae-rel)")) };
  if (parada === "casillas") r.casilla = alto(document.querySelector("[data-casilla]"));
  if (parada === "grupos") r.grupos = { alto: alto(document.querySelector("[data-grupos]")), tarjeta: alto(document.querySelector("[data-grupo]")) };
  if (parada === "marcas") r.marcas = { n: document.querySelectorAll("[data-marca]").length, fila: alto(document.querySelector("[data-marca]")) };
  if (parada === "matriz") r.matriz = alto(document.querySelector("[data-matriz]"));

  const juego = panel ?? document.body;
  r.toque = [];
  for (const btn of juego.querySelectorAll("button")) {
    const c = btn.getBoundingClientRect();
    if (!c.width) continue;
    if (btn.closest("figure")) continue;
    const extra = btn.hasAttribute("data-como-se-juega") ? 4 : 0;
    /* El canto va detrás: el bloque entero (cara + canto) escucha el toque. */
    const bloque = btn.closest(".fae-rel")?.getBoundingClientRect() ?? c;
    if (Math.max(c.height, bloque.height) + extra < 43.95 || c.width + extra < 43.95) r.toque.push(`${c.width.toFixed(0)}×${c.height.toFixed(0)} ${(btn.textContent || btn.getAttribute("aria-label") || "").trim().slice(0, 22)}`);
  }
  return r;
}

/* Contraste de cada texto propio del juego contra su fondo real, compuesto hasta el primero opaco (la fórmula de medir-gasto-o-pago). */
function contrastes() {
  const rgba = (s) => { const v = s.match(/[\d.]+/g)?.map(Number) ?? [0, 0, 0, 0]; return [v[0], v[1], v[2], v[3] ?? 1]; };
  const sobre = (a, b) => [0, 1, 2].map((i) => a[i] * a[3] + b[i] * (1 - a[3])).concat(1);
  const fondoDe = (el) => {
    const capas = [];
    for (let x = el; x; x = x.parentElement) {
      const c = rgba(getComputedStyle(x).backgroundColor);
      if (c[3] > 0) capas.push(c);
      if (c[3] >= 1) break;
    }
    let base = [14, 27, 46, 1];
    for (const c of capas.reverse()) base = sobre(c, base);
    return base;
  };
  const lum = (c) => { const f = (v) => { v /= 255; return v <= 0.03928 ? v / 12.92 : ((v + 0.055) / 1.055) ** 2.4; }; return 0.2126 * f(c[0]) + 0.7152 * f(c[1]) + 0.0722 * f(c[2]); };
  const k = (a, b) => { const [x, y] = [lum(a), lum(b)].sort((u, v) => v - u); return (x + 0.05) / (y + 0.05); };
  const raiz = document.querySelector("[data-hoja]") ?? document.querySelector("[data-avance], [data-progreso]")?.closest("section") ?? document.body;
  let min = Infinity;
  const malos = [];
  for (const el of raiz.querySelectorAll("button *, button, [data-hoja] *")) {
    if (!el.closest("button") && !el.closest("[data-hoja]")) continue;
    const propios = [...el.childNodes].filter((x) => x.nodeType === 3 && x.textContent.trim());
    if (!propios.length || !el.getBoundingClientRect().width) continue;
    const s = getComputedStyle(el);
    if (s.visibility === "hidden" || el.closest("[aria-hidden='true']") && !el.closest("[data-pastilla]")) continue;
    const c = sobre(rgba(s.color), fondoDe(el));
    const v = k(c, fondoDe(el));
    const deshabilitado = el.closest("button")?.disabled;
    if (!deshabilitado) min = Math.min(min, v);
    if (v < 4.5 && !deshabilitado) malos.push(`${v.toFixed(2)} «${el.textContent.trim().slice(0, 20)}»`);
  }
  return { min: Math.round(min * 100) / 100, malos };
}

/* Lo que se toca antes de medir otra vez, para ver el estado elegido o tomado. */
const ACCION = {
  H1: "[data-grupo]", H2: "[data-marca]", H4: "[data-nombre]", H5: "[data-nombre]", H6: "[data-paso-corte='despues']",
};

const nav = await chromium.launch();
const filas = [];
for (const ancho of [320, 375]) {
  for (const j of JUEGOS) {
    const { ctx, page, errores } = await abrirPanel(nav, { url: URL_BASE, ancho, alto: ALTOS[ancho], ruta: `#/ingresos-gastos-y-caja/hacer/${j.id}` });
    await page.evaluate(([id, u]) => {
      localStorage.setItem(`fae-asi-se-juega:v1:${id}:${u}`, "visto");
      localStorage.setItem(`fae-asi-se-juega:v1:${id}:anonimo`, "visto");
    }, [j.id, USUARIO]);
    await page.reload();
    await page.waitForSelector("[data-avance], [data-progreso]", { timeout: 30000 }).catch(() => {});
    await page.evaluate(() => document.fonts.ready);
    await page.waitForTimeout(600);
    await page.evaluate(() => scrollTo(0, 0));
    const r = await page.evaluate(medir, j);
    r.contraste = await page.evaluate(contrastes);
    if (j.h === "H3") {
      /* La hoja: se abre sobre la pantalla; sus opciones. */
      await page.click("[data-casilla]").catch(() => {});
      await page.waitForTimeout(400);
      r.hoja = await page.evaluate(() => {
        const h = document.querySelector("[data-hoja]");
        const o = document.querySelector("[data-hoja] [data-opcion]");
        const bloque = o?.closest(".fae-rel") ?? o;
        return h ? { contraste: null, alto: Math.round(h.getBoundingClientRect().height), opcion: Math.round(bloque.getBoundingClientRect().height), tope: Math.round(innerHeight * 0.9) } : null;
      });
      if (r.hoja) r.hoja.contraste = await page.evaluate(contrastes);
      if (CAPTURAS) await page.screenshot({ path: join(CAPTURAS, `h3-hoja-${ETIQUETA}-${ancho}.png`) });
      await page.keyboard.press("Escape");
      await page.waitForTimeout(300);
    }
    if (ACCION[j.h]) {
      await page.click(ACCION[j.h]).catch(() => {});
      await page.waitForTimeout(500);
      r.tocado = await page.evaluate(contrastes);
      if (CAPTURAS) {
        const el = await page.$(ACCION[j.h]);
        if (el) await el.scrollIntoViewIfNeeded();
        await page.screenshot({ path: join(CAPTURAS, `${j.h.toLowerCase()}-tocado-${ETIQUETA}-${ancho}.png`) });
      }
    }
    if (j.h === "H7") {
      /* Una cuenta puesta y las demás sin poner: la primera del estante, al debe. */
      await page.click("[data-estante] [data-sacar]").catch(() => {});
      /* El ratón, fuera: con hover la cara sube 2 px y la captura no mostraría el reposo. */
      await page.mouse.move(0, 0);
      await page.waitForTimeout(500);
      r.puesta = await page.evaluate(medir, j);
      r.tocado = await page.evaluate(contrastes);
      if (CAPTURAS) {
        const devolver = await page.$("[data-estante] [data-devolver]");
        if (devolver) await page.evaluate(() => document.querySelector("[data-estante]").scrollIntoView({ block: "start" }));
        else await page.evaluate(() => document.querySelector("[data-devolver]")?.scrollIntoView({ block: "center" }));
        await page.screenshot({ path: join(CAPTURAS, `h7-puesta-${ETIQUETA}-${ancho}.png`) });
      }
    }
    filas.push({ ancho, ...j, errores: errores.length, ...r });
    if (j.h === "GP") {
      /*
       * La matriz en sus cuatro estados: reposo (la captura de siempre, abajo),
       * elegida (el toque mal, antes de «Iba aquí»), acierto y con «Iba aquí».
       * Cada toque en una carga nueva: un toque califica y no hay reintento.
       */
      const estadosGP = {};
      for (const caso of ["elegida", "acierto", "iba-aqui"]) {
        if (caso !== "elegida") {
          await page.reload();
          await page.waitForSelector("[data-matriz]", { timeout: 30000 }).catch(() => {});
          await page.evaluate(() => document.fonts.ready);
          await page.waitForTimeout(600);
        }
        const id = await page.$eval("[data-ficha]", (x) => x.getAttribute("data-ficha"));
        const bien = TIPO_GP[id];
        const destino = caso === "acierto" ? bien : ["gasto", "gasto-salida", "ninguno", "salida"].find((x) => x !== bien);
        /* abrirPanel reduce el movimiento: así «Iba aquí» llega al instante. Para ver «elegida», sin reducir. */
        await page.emulateMedia({ reducedMotion: caso === "elegida" ? "no-preference" : "reduce" });
        await page.click(`[data-casilla="${destino}"]`);
        await page.mouse.move(0, 0);
        /* «Elegida»: lo tocado antes de que llegue «Iba aquí» (700 ms); la captura va primero, las medidas tardan. */
        await page.evaluate(() => document.querySelector("[data-matriz]").scrollIntoView({ block: "center" }));
        await page.waitForTimeout(caso === "elegida" ? 150 : 1400);
        if (CAPTURAS) await page.screenshot({ path: join(CAPTURAS, `gp-${caso}-${ETIQUETA}-${ancho}.png`) });
        estadosGP[caso] = { ...(await page.evaluate(contrastes)), matriz: await page.evaluate(() => Math.round(document.querySelector("[data-matriz]").getBoundingClientRect().height * 10) / 10), toque: (await page.evaluate(medir, j)).toque };
      }
      filas.at(-1).estadosGP = estadosGP;
    }
    if (CAPTURAS) {
      const quien = { H4: "h4-banco", H5: "h5-banco", H6: "h6-pasos", H7: "h7-estante", H3: "h3-casillas", H1: "h1-grupos", H2: "h2-marcas", GP: "gp-matriz" }[j.h];
      const el = await page.$(j.h === "H7" ? "[data-estante]" : j.h === "H6" ? "[data-paso-corte]" : j.abajo.replace(":last-of-type", ""));
      if (el) await el.scrollIntoViewIfNeeded();
      await page.screenshot({ path: join(CAPTURAS, `${quien}-${ETIQUETA}-${ancho}.png`) });
    }
    await ctx.close();
  }
}
await nav.close();

console.log(`\n### ${ETIQUETA} · cabecera real de Hacer y bloque de decisión (página real, sesión fingida, fuentes de producción)\n`);
console.log("| ancho | juego | cabecera desde la página | cabecera desde el Panel | bloque (arriba → abajo) | alto | (a) cabe con la vista en la tarjeta | (b) cabe desde arriba | barra | errores |");
console.log("|---|---|---|---|---|---|---|---|---|---|");
const sn = (v) => (v == null ? "—" : v ? "sí" : "**NO**");
for (const f of filas) console.log(`| ${f.ancho} | ${f.h} | ${f.cabeceraPagina ?? "—"} | ${f.cabeceraPanel ?? "—"} | ${f.bloque ? `${f.bloque.top} → ${f.bloque.bottom}` : `falta ${f.falta}`} | ${f.bloque?.alto ?? "—"} | ${sn(f.cabeA)} | ${sn(f.cabeB)} | ${f.barra ? "SÍ" : "no"} | ${f.errores} |`);
console.log("\n### Paradas\n");
for (const f of filas) {
  const d = f.banco ? `banco ${f.banco.alto} px, ${f.banco.filas} filas, ficha ${f.banco.ficha}`
    : f.estante ? `estante ${f.estante.alto} px, ${f.estante.renglones} renglones (aire ${f.estante.gap}); libre bajo el botón: ${[...new Set(f.estante.libre.map((x) => `${x.libre} (renglón ${x.renglon}, botón ${x.boton})`))].join(" · ")}`
    : f.pasos ? `botón de paso ${f.pasos.boton}, fila ${f.pasos.fila}`
    : f.casilla ? `casilla ${f.casilla}; hoja ${f.hoja ? `${f.hoja.alto} (tope ${f.hoja.tope}), opción ${f.hoja.opcion}` : "—"}`
    : f.grupos ? `grupos ${f.grupos.alto}, tarjeta ${f.grupos.tarjeta}`
    : f.marcas ? `${f.marcas.n} marcas de ${f.marcas.fila}`
    : f.matriz ? `matriz ${f.matriz}` : "—";
  const kk = [f.contraste, f.tocado, f.hoja?.contraste].filter(Boolean);
  const textoK = ` · contraste mín. ${kk.map((x) => x.min).join(" / ")}${kk.some((x) => x.malos.length) ? ` (**< 4,5:** ${kk.flatMap((x) => x.malos).join("; ")})` : ""}`;
  console.log(`- ${f.ancho} · ${f.h}: ${d}${textoK}${f.toque.length ? ` · **TOQUE < 44:** ${f.toque.join("; ")}` : " · toques ≥ 44"}`);
}
console.log("\n### H7 con una cuenta puesta y GP en sus estados\n");
for (const f of filas) {
  if (f.puesta?.estante) {
    const e = f.puesta.estante;
    console.log(`- ${f.ancho} · H7 con una cuenta puesta: estante ${e.alto} px, ${e.renglones} renglones; renglón/botón: ${[...new Set(e.libre.map((x) => `${x.renglon}/${x.boton}`))].join(" · ")} · contraste mín. ${f.tocado.min}${f.tocado.malos.length ? ` (**< 4,5:** ${f.tocado.malos.join("; ")})` : ""}${f.puesta.toque.length ? ` · **TOQUE < 44:** ${f.puesta.toque.join("; ")}` : " · toques ≥ 44"}`);
  }
  if (f.estadosGP) {
    for (const [k, v] of Object.entries(f.estadosGP)) console.log(`- ${f.ancho} · GP ${k}: matriz ${v.matriz} · contraste mín. ${v.min}${v.malos.length ? ` (**< 4,5:** ${v.malos.join("; ")})` : ""}${v.toque.length ? ` · **TOQUE < 44:** ${v.toque.join("; ")}` : " · toques ≥ 44"}`);
  }
}
