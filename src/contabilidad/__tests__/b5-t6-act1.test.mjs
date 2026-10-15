import { test } from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { JSDOM, VirtualConsole } from "jsdom";

/*
 * ═══════════════════════════════════════════════════════════════════════════
 * T6 · HACER 1 — «¿Clientes o otra cuenta por cobrar?» (Célula B, b5-t6-a1).
 *
 * Vigila LO QUE SE VE, no solo lo que se calcula:
 *   · las 10 fichas, sus aciertos y las cuatro devoluciones de error (A, B,
 *     C y C5), literales del paquete guardado
 *     (orquestador/conocimiento/paquetes/b5-t6-act1.md), ficha por ficha
 *   · la C5 manda sobre la C en las dos ventas a crédito
 *   · la regla única del segundo fallo, contra la columna literal de Futaba
 *   · el préstamo a un cliente: quien se guíe por la palabra «cliente» falla
 *   · el rótulo del botón en cada estado, y que el botón y las pestañas quepan
 *     en una línea a 320
 * ═══════════════════════════════════════════════════════════════════════════
 */

const dom = new JSDOM("<!doctype html><html><body></body></html>", { url: "http://localhost/", virtualConsole: new VirtualConsole() });
const w = dom.window;
w.matchMedia = () => ({ matches: false, addEventListener() {}, removeEventListener() {}, addListener() {}, removeListener() {} });
w.requestAnimationFrame = (cb) => setTimeout(() => cb(performance.now()), 0);
w.cancelAnimationFrame = (id) => clearTimeout(id);
for (const [k, v] of Object.entries({
  window: w, document: w.document, navigator: w.navigator,
  HTMLElement: w.HTMLElement, Element: w.Element, Node: w.Node, SVGElement: w.SVGElement,
  Event: w.Event, MouseEvent: w.MouseEvent, KeyboardEvent: w.KeyboardEvent,
  getComputedStyle: w.getComputedStyle.bind(w), matchMedia: w.matchMedia,
  requestAnimationFrame: w.requestAnimationFrame, cancelAnimationFrame: w.cancelAnimationFrame,
})) {
  Object.defineProperty(globalThis, k, { value: v, configurable: true, writable: true });
}
globalThis.IS_REACT_ACT_ENVIRONMENT = true;

const React = await import("react");
const { createRoot } = await import("react-dom/client");
const act = React.act;
const h = React.createElement;

const { default: ClientesOOtra } = await import("../../components/mecanicas/libros/tema6/ClientesOOtra.jsx");
const { MarcoLibros } = await import("../../components/mecanicas/bloques/marcos.jsx");
const L = await import("../t6Act1.js");
const D = await import("../../data/contabilidadT6Act1.js");
const { barajar } = await import("../../utils/barajar.js");
const { FAE } = await import("../../theme.js");

const ficha = (id) => D.FICHAS_T6_ACT1.find((f) => f.id === id);

/* Monta el juego con las fichas dadas (en ese orden), sin sorteo. */
const montar = async (ids, onCompletar = () => {}) => {
  const caja = document.createElement("div");
  document.body.appendChild(caja);
  const raiz = createRoot(caja);
  const items = ids.map(ficha);
  await act(async () => {
    raiz.render(h(ClientesOOtra, { Marco: MarcoLibros, rotulo: "PRUEBA", titulo: "Prueba", acento: FAE.ambar, onCompletar, items }));
  });
  return { caja, desmontar: () => { act(() => raiz.unmount()); caja.remove(); } };
};
const tocar = async (el) => { assert.ok(el, "no hay nada que tocar"); await act(async () => { el.dispatchEvent(new w.MouseEvent("click", { bubbles: true })); }); };
const pestana = (caja, id) => caja.querySelector(`[data-nivel1="${id}"]`);
const opcion = (caja, id) => caja.querySelector(`[data-nivel2="${id}"]`);
const botonColocar = (caja) => caja.querySelector("[data-boton-colocar] button");
const botonAvanzar = (caja) => caja.querySelector("[data-boton-avanzar] button");
const rotuloBoton = (caja) => (botonColocar(caja) ?? botonAvanzar(caja) ?? [...caja.querySelectorAll("button")].at(-1)).textContent;
/* Lo que se lee en la devolución, sin el texto oculto para lectores. */
const devolucion = (caja) => {
  const p = caja.querySelector('[role="status"]');
  if (!p) return null;
  return [...p.childNodes].filter((n) => !(n.classList?.contains("fae-jg-oculto"))).map((n) => n.textContent).join("");
};
const marcar = async (caja, cuenta, lado = null) => {
  if (pestana(caja, cuenta).dataset.elegido !== "si") await tocar(pestana(caja, cuenta));
  if (lado) await tocar(opcion(caja, lado));
  await tocar(botonColocar(caja));
};

/* ═══════════ EL PAQUETE GUARDADO, LEÍDO POR SECCIÓN ═══════════ */

const GUIA = readFileSync(new URL("../../../orquestador/conocimiento/paquetes/b5-t6-act1.md", import.meta.url), "utf8");
const seccion = (desde, hasta) => {
  const i = GUIA.indexOf(desde);
  assert.ok(i >= 0, `el paquete no tiene «${desde}»`);
  const j = hasta ? GUIA.indexOf(hasta, i + desde.length) : GUIA.length;
  assert.ok(j > i, `el paquete no tiene «${hasta}» después de «${desde}»`);
  return GUIA.slice(i, j);
};
/* Filas de tabla «| id | «texto» | … |» → { id: [celdas sin «» de los extremos] }. */
const filas = (texto) => {
  const out = {};
  for (const linea of texto.split("\n")) {
    if (!linea.startsWith("| ") || linea.startsWith("|---")) continue;
    const celdas = linea.split(" | ").map((c) => c.replace(/^\| /, "").replace(/ \|$/, "").trim());
    out[celdas[0]] = celdas.slice(1).map((c) => c.replace(/^«(.*)»$/, "$1"));
  }
  return out;
};
const GUIA_INICIAL = filas(seccion("### 2.1", "### 2.2"));
const GUIA_COLOCANDO = filas(seccion("### 2.2", "### 2.3"));
const GUIA_CIERRE = filas(seccion("### 2.3", "## 3 "));
/* La entrega 4 de Futaba (sección 6) manda sobre 3.1, 3.2 y 3.4, ficha por ficha. */
const conEntrega4 = (base, desde, hasta) => {
  const nuevas = filas(seccion(desde, hasta));
  for (const [id, celdas] of Object.entries(nuevas)) if (base[id]) base[id] = [celdas[0], ...base[id].slice(1)];
  return base;
};
const GUIA_FICHAS = conEntrega4(filas(seccion("### 3.1", "### 3.2")), "### 6.1", "### 6.2");
const GUIA_ACIERTOS = conEntrega4(filas(seccion("### 3.2", "### 3.3")), "### 6.2", "### 6.3");
const GUIA_ERRORES = filas(seccion("### 3.3", "### 3.4"));
const GUIA_SEGUNDO = conEntrega4(filas(seccion("### 3.4", "## 4 ")), "### 6.3", "Para Shoko, el cruce");

const IDS = ["socio", "trabajador", "particular", "prestamo-cliente", "venta-mercancia", "venta-servicio", "cheque", "pago", "devolucion", "descuento"];
const RESPUESTA = { otra: "Otra", "clientes/debita": "Clientes → Se debita", "clientes/acredita": "Clientes → Se acredita" };
const clave = (f) => (f.lado ? `${f.cuenta}/${f.lado}` : f.cuenta);

test("guarda: el paquete se leyó entero (10 fichas en cada tabla, 4 errores) y una fila inventada no aparece", () => {
  for (const [nombre, t] of Object.entries({ GUIA_FICHAS, GUIA_ACIERTOS, GUIA_SEGUNDO })) {
    for (const id of IDS) assert.ok(t[id], `${nombre} no tiene ${id}`);
  }
  for (const k of ["A", "B", "C", "C5"]) assert.ok(GUIA_ERRORES[k], `falta el error ${k}`);
  assert.equal(GUIA_FICHAS["no-existe"], undefined);
});

/* ═══════════ LO QUE SE VE: LAS 10 FICHAS Y SUS DEVOLUCIONES ═══════════ */

test("★★★ las 10 fichas: el texto pintado es el del paquete, ficha por ficha, y la respuesta también", async () => {
  assert.deepEqual(D.FICHAS_T6_ACT1.map((f) => f.id), IDS);
  for (const id of IDS) {
    const { caja, desmontar } = await montar([id]);
    assert.equal(caja.querySelector(`[data-ficha="${id}"]`).textContent, GUIA_FICHAS[id][0], id);
    assert.equal(RESPUESTA[clave(ficha(id))], GUIA_FICHAS[id][1], `${id}: respuesta`);
    desmontar();
  }
});

test("★★★ los 10 aciertos se ven literales tras ✅, ficha por ficha", async () => {
  for (const id of IDS) {
    const f = ficha(id);
    const { caja, desmontar } = await montar([id]);
    await marcar(caja, f.cuenta, f.lado);
    assert.equal(devolucion(caja), `✅${GUIA_ACIERTOS[id][0]}`, id);
    desmontar();
  }
});

test("★★★ A, B y C se ven literales; A y B en TODA ficha de su lado, C en las que no son ventas a crédito", async () => {
  for (const id of IDS) {
    const f = ficha(id);
    let m = await montar([id]);
    if (f.cuenta === "otra") {
      /* B: un préstamo puesto en Clientes, con cualquiera de los dos lados. */
      await marcar(m.caja, "clientes", "debita");
      assert.equal(devolucion(m.caja), `❌${GUIA_ERRORES.B[1]}`, `${id}: B`);
      m.desmontar();
      continue;
    }
    /* A: un hecho de Clientes puesto en otra. */
    await marcar(m.caja, "otra");
    assert.equal(devolucion(m.caja), `❌${GUIA_ERRORES.A[1]}`, `${id}: A`);
    m.desmontar();
    if (f.c5) continue;
    m = await montar([id]);
    await marcar(m.caja, "clientes", f.lado === "debita" ? "acredita" : "debita");
    assert.equal(devolucion(m.caja), `❌${GUIA_ERRORES.C[1]}`, `${id}: C`);
    m.desmontar();
  }
});

test("★★★ C5 manda sobre C en las dos ventas a crédito puestas en «Se acredita», y solo en ellas", async () => {
  const c5 = D.FICHAS_T6_ACT1.filter((f) => f.c5).map((f) => f.id);
  assert.deepEqual(c5, ["venta-mercancia", "venta-servicio"]);
  for (const id of c5) {
    const m = await montar([id]);
    await marcar(m.caja, "clientes", "acredita");
    assert.equal(devolucion(m.caja), `❌${GUIA_ERRORES.C5[1]}`, id);
    m.desmontar();
  }
  /* El cheque también se debita, pero no es una venta a crédito: lleva C. */
  const m = await montar(["cheque"]);
  await marcar(m.caja, "clientes", "acredita");
  assert.equal(devolucion(m.caja), `❌${GUIA_ERRORES.C[1]}`);
  m.desmontar();
});

test("★★★ regla única: tras el segundo fallo, TODA ficha muestra la columna de Futaba, y dice la respuesta", async () => {
  for (const id of IDS) {
    const f = ficha(id);
    /* Dos fallos seguidos, de nivel distinto cuando se puede: primero la cuenta, después el lado. */
    const m = await montar([id]);
    if (f.cuenta === "otra") {
      await marcar(m.caja, "clientes", "debita");
      await marcar(m.caja, "clientes", "acredita");
    } else {
      await marcar(m.caja, "otra");
      await marcar(m.caja, "clientes", f.lado === "debita" ? "acredita" : "debita");
    }
    assert.equal(devolucion(m.caja), `❌${GUIA_SEGUNDO[id][0]}`, id);
    /* La respuesta está en el texto: la cuenta, y en Clientes el lado. */
    const t = devolucion(m.caja);
    const dice = f.cuenta === "otra" ? t.includes("otra cuenta por cobrar") : t.includes(f.lado === "debita" ? "se debita" : "se acredita");
    assert.ok(dice, `${id}: el segundo fallo no dice la respuesta: «${t}»`);
    assert.equal(Boolean(m.caja.querySelector("[data-fallo]")), false, `${id}: tras el segundo fallo ya no se espera reintento`);
    assert.ok(botonAvanzar(m.caja), `${id}: tras el segundo fallo se avanza`);
    m.desmontar();
  }
});

test("★★★ el préstamo a un cliente: quien se guíe por la palabra «cliente» lo falla, y la devolución le dice por qué", async () => {
  /* La estrategia de la palabra clave: si el hecho dice «cliente», Clientes. */
  const porPalabra = (f) => (/cliente/i.test(f.texto) ? "clientes" : "otra");
  const engañan = D.FICHAS_T6_ACT1.filter((f) => porPalabra(f) !== f.cuenta).map((f) => f.id);
  assert.deepEqual(engañan, ["prestamo-cliente"], "la palabra «cliente» tiene que fallar justo en el préstamo a un cliente");
  /* Y «presta» tampoco sirve de pista: aparece en las dos cuentas. */
  const conPresta = D.FICHAS_T6_ACT1.filter((f) => /presta/.test(f.texto));
  assert.ok(conPresta.some((f) => f.cuenta === "clientes") && conPresta.some((f) => f.cuenta === "otra"));

  for (const lado of ["debita", "acredita"]) {
    const m = await montar(["prestamo-cliente"]);
    assert.ok(m.caja.querySelector('[data-ficha="prestamo-cliente"]').textContent.includes("clientes"));
    await marcar(m.caja, "clientes", lado);
    assert.equal(devolucion(m.caja), `❌${GUIA_ERRORES.B[1]}`, `prestamo-cliente con «${lado}»`);
    assert.equal(m.caja.querySelector("[data-fallo]").textContent, "La ficha no se colocó.");
    await marcar(m.caja, "otra");
    assert.equal(devolucion(m.caja), `✅${GUIA_ACIERTOS["prestamo-cliente"][0]}`);
    m.desmontar();
  }
});

test("★★★ tras un reintento acertado queda solo el ✅; el aviso, solo mientras se espera el reintento", async () => {
  const { caja, desmontar } = await montar(["cheque"]);
  assert.equal(Boolean(caja.querySelector("[data-fallo]")), false);
  await marcar(caja, "clientes", "acredita");
  assert.equal(caja.querySelector("[data-fallo]").textContent, "La ficha no se colocó.");
  await marcar(caja, "clientes", "debita");
  assert.equal(Boolean(caja.querySelector("[data-fallo]")), false);
  assert.equal(caja.querySelectorAll('[role="status"]').length, 1);
  assert.equal(devolucion(caja), `✅${GUIA_ACIERTOS.cheque[0]}`);
  assert.ok(!caja.textContent.includes(GUIA_ERRORES.C[1]), "la devolución del primer fallo ya no se ve");
  desmontar();
});

test("★★ el emoji va al inicio en los datos y la devolución sale por Retro (role=status)", async () => {
  for (const f of D.FICHAS_T6_ACT1) assert.ok(f.acierto.startsWith("✅ Sí. "), f.id);
  for (const t of Object.values(D.ERROR_T6_ACT1)) assert.ok(t.startsWith("❌ "));
  const { caja, desmontar } = await montar(["pago"]);
  await marcar(caja, "clientes", "acredita");
  assert.equal(caja.querySelector('[role="status"] [aria-hidden="true"]').textContent, "✅", "Retro separa el emoji");
  desmontar();
});

/* ═══════════ EL BOTÓN Y LAS PESTAÑAS: QUE QUEPAN ═══════════ */

/*
 * Ancho de cada glifo de Sora, peso 700, a 14 px (la letra de Responder),
 * medido en Chromium 141 con Sora real de Google Fonts el 2026-10-14 (canvas
 * measureText, fuente cargada). Es la tabla de b5-t5-a1 más «b», «m», «p» y
 * «ó». Un glifo que no está aquí hace fallar la prueba: un rótulo nuevo
 * obliga a volver a medir.
 *
 * Pintados enteros en el mismo navegador: «Elige una cuenta» 117,92 ·
 * «Elige cómo se anota» 143,81 · «Colocar la ficha» 111,73 · a 12,5 px,
 * «Otra cuenta por cobrar» 146,64 y «Clientes» 54,22. La suma de glifos,
 * escalada a 12,5 / 14 para las pestañas, queda a menos de 1 px.
 */
const GLIFOS_SORA_700_14 = {
  " ": 2.94, C: 11.2, E: 8.32, O: 12.1, S: 9.34, V: 10.36, a: 8.32, b: 9.84, c: 8.55, d: 9.84, e: 8.74, f: 5.35, g: 9.6,
  h: 9.13, i: 4.68, j: 4.75, l: 4.41, m: 13.76, n: 9.13, o: 9.53, p: 9.84, q: 9.84, r: 5.89, s: 7.78, t: 6.08, u: 9.03,
  "é": 8.74, "ó": 9.53,
};
const ancho = (texto, px = 14) => [...texto].reduce((s, g) => {
  if (!(g in GLIFOS_SORA_700_14)) throw new Error(`glifo sin medir: «${g}» en «${texto}»`);
  return s + GLIFOS_SORA_700_14[g];
}, 0) * (px / 14);
/* A 320: 258 de ancho útil del Panel menos 18 + 18 de relleno de Responder. */
const UTIL_RESPONDER_320 = 258 - 36;
/* La pestaña: 258 menos 11 + 11 de relleno y 2 + 2 del borde elegido. */
const UTIL_PESTANA_320 = 258 - 22 - 4;

test("★★★ el rótulo del botón en cada estado es el del paquete, y cada uno cabe en una línea a 320", async () => {
  const vistos = [];
  const { caja, desmontar } = await montar(["pago", "socio"]);
  vistos.push(rotuloBoton(caja));
  assert.equal(rotuloBoton(caja), GUIA_COLOCANDO["boton-nada"][0]);
  await tocar(pestana(caja, "clientes"));
  vistos.push(rotuloBoton(caja));
  assert.equal(rotuloBoton(caja), GUIA_COLOCANDO["boton-falta"][0]);
  await tocar(opcion(caja, "acredita"));
  vistos.push(rotuloBoton(caja));
  assert.equal(rotuloBoton(caja), GUIA_COLOCANDO["boton-colocar"][0]);
  await tocar(pestana(caja, "otra"));
  assert.equal(rotuloBoton(caja), "Colocar la ficha", "«Otra cuenta por cobrar» va directo a colocar");
  await tocar(pestana(caja, "clientes"));
  await tocar(opcion(caja, "acredita"));
  await tocar(botonColocar(caja));
  vistos.push(rotuloBoton(caja));
  assert.equal(rotuloBoton(caja), "Siguiente ficha");
  await tocar(botonAvanzar(caja));
  await marcar(caja, "otra");
  vistos.push(rotuloBoton(caja));
  assert.equal(rotuloBoton(caja), "Ver el resultado");
  await tocar(botonAvanzar(caja));
  vistos.push(rotuloBoton(caja));
  assert.equal(rotuloBoton(caja), "Otra tanda");
  desmontar();

  for (const t of vistos) {
    const a = ancho(t);
    assert.ok(a <= UTIL_RESPONDER_320, `«${t}» mide ${a.toFixed(2)} px y no cabe en ${UTIL_RESPONDER_320} a 320`);
  }
  assert.ok(Math.abs(ancho("Elige cómo se anota") - 143.81) < 1, "la tabla de glifos mide de verdad");
});

test("★★★ pestañas: los rótulos del paquete, en una línea a 320; «Otra» no abre panel; «Clientes» abre «Se debita» y «Se acredita»", async () => {
  const { caja, desmontar } = await montar(["pago"]);
  const rotulos = [...caja.querySelectorAll("[data-rotulo-nivel1]")].map((n) => n.textContent);
  assert.deepEqual(rotulos, ["Otra cuenta por cobrar", "Clientes"], "la que abre panel va abajo (guía v2 de Mai, §2.2)");
  assert.deepEqual([...rotulos].sort(), GUIA_COLOCANDO.nivel1[0].split(" · ").map((x) => x.replace(/^«|»$/g, "")).sort());
  for (const n of caja.querySelectorAll("[data-rotulo-nivel1]")) assert.equal(n.style.whiteSpace, "nowrap");
  for (const t of rotulos) {
    const a = ancho(t, 12.5);
    assert.ok(a <= UTIL_PESTANA_320, `«${t}» mide ${a.toFixed(2)} px y no cabe en ${UTIL_PESTANA_320} a 320`);
  }
  assert.ok(Math.abs(ancho("Otra cuenta por cobrar", 12.5) - 146.64) < 1, "la escala a 12,5 px mide de verdad");

  const clientes = pestana(caja, "clientes");
  assert.equal(clientes.getAttribute("aria-expanded"), "false");
  await tocar(clientes);
  const panel = caja.querySelector("[data-panel-segundo]");
  assert.equal(clientes.getAttribute("aria-controls"), panel.id);
  assert.deepEqual([...panel.querySelectorAll("button")].map((b) => b.textContent),
    GUIA_COLOCANDO.nivel2[0].split(" · ").map((x) => x.replace(/^«|»$/g, "")));
  await tocar(opcion(caja, "debita"));
  await tocar(pestana(caja, "otra"));
  assert.equal(Boolean(caja.querySelector("[data-panel-segundo]")), false, "con «Otra cuenta por cobrar» no hay panel");
  assert.equal(pestana(caja, "otra").hasAttribute("aria-expanded"), false);
  await tocar(pestana(caja, "clientes"));
  assert.equal(Boolean(caja.querySelector('[data-nivel2][aria-pressed="true"]')), false, "el panel se abre sin nada elegido");
  desmontar();
});

/* ═══════════ SORTEO Y PUNTAJE ═══════════ */

test("★★★ la tanda es el banco entero (10), sin repetir, y barajado", () => {
  const ordenes = new Set();
  for (let k = 0; k < 200; k++) {
    const tanda = L.sortearT6Act1(barajar);
    assert.equal(tanda.length, 10);
    assert.deepEqual(tanda.map((f) => f.id).sort(), [...IDS].sort());
    ordenes.add(tanda.map((f) => f.id).join());
  }
  assert.ok(ordenes.size > 50, `en 200 tandas solo salieron ${ordenes.size} órdenes: no se baraja`);
  assert.deepEqual(D.FICHAS_T6_ACT1.map((f) => f.id), IDS, "sortear no desordena el banco");
});

test("★★★ puntaje como T1-6: 60 % cuenta y 40 % lado; otra entera; el segundo intento vale la mitad; el resumen literal", async () => {
  const cli = ficha("pago");
  const otra = ficha("socio");
  assert.equal(L.valorDeItemT6Act1(cli, L.evaluarT6Act1(cli, { cuenta: "clientes", lado: "acredita" })), 1);
  assert.equal(L.valorDeItemT6Act1(cli, L.evaluarT6Act1(cli, { cuenta: "clientes", lado: "debita" })), 0.6);
  assert.equal(L.valorDeItemT6Act1(cli, L.evaluarT6Act1(cli, { cuenta: "otra", lado: null })), 0);
  assert.equal(L.valorDeItemT6Act1(otra, L.evaluarT6Act1(otra, { cuenta: "otra", lado: null })), 1);
  assert.equal(L.valorDeItemT6Act1(otra, L.evaluarT6Act1(otra, { cuenta: "clientes", lado: "debita" })), 0);
  /* Montado: fallar el lado y acertar en el reintento deja la ficha en 50 (1 / 2). */
  let pct = null;
  const { caja, desmontar } = await montar(["pago"], (p) => { pct = p; });
  await marcar(caja, "clientes", "debita");
  await marcar(caja, "clientes", "acredita");
  await tocar(botonAvanzar(caja));
  assert.equal(pct, 50);
  const esperado = GUIA_CIERRE.resumen[0].replace("{bien}", "0").replace("{cuantas}", "1").replace("{X}", "100.00");
  assert.equal(caja.querySelector("[data-resumen]").textContent, esperado);
  desmontar();
});

test("★★ el texto alternativo, el objetivo, la consigna y las reglas son los del paquete", async () => {
  const { caja, desmontar } = await montar(["pago"]);
  assert.equal(D.ALT_T6_ACT1, GUIA_CIERRE.alt[0]);
  assert.ok(caja.textContent.includes(GUIA_CIERRE.alt[0]));
  assert.equal(caja.querySelector("[data-objetivo]").textContent, GUIA_INICIAL.objetivo[0]);
  assert.equal(caja.querySelector("[data-consigna]").textContent, GUIA_INICIAL.consigna[0]);
  assert.deepEqual(D.REGLAS_T6_ACT1, [GUIA_INICIAL.regla1[0], GUIA_INICIAL.regla2[0], GUIA_INICIAL.regla3[0]]);
  assert.equal(D.T6_ACT1.id, "b5-t6-a1");
  desmontar();
});

test("★★ auditoría integral: la C5 cita la palabra con comillas internas “crédito”, no con «»", () => {
  assert.ok(D.ERROR_T6_ACT1.C5.includes("Ojo con la palabra “crédito”:"));
  assert.ok(!D.ERROR_T6_ACT1.C5.includes("«"));
});
