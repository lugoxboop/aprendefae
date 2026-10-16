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
 *   · lote 6a: los tres cajones son las opciones, con E4; la tanda, R10
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
const botonAvanzar = (caja) => caja.querySelector("[data-boton-avanzar] button");
/* Lo que se lee en la devolución, sin el texto oculto para lectores. */
const devolucion = (caja) => {
  const p = caja.querySelector('[role="status"]');
  if (!p) return null;
  return [...p.childNodes].filter((n) => !(n.classList?.contains("fae-jg-oculto"))).map((n) => n.textContent).join("");
};
/* Lote 6a: tocar el cajón coloca la ficha (las fichas a un nivel). */
const cajon = (caja, cuenta, lado = null) => caja.querySelector(`[data-cajon="${lado ? `${cuenta}/${lado}` : cuenta}"]`);
const marcar = async (caja, cuenta, lado = null) => tocar(cajon(caja, cuenta, lado));

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
/* La entrega 4 de Futaba (sección 6) manda sobre 3.1, 3.2 y 3.4, ficha por ficha; los préstamos del lote 6a (§7.2), sobre las fichas. */
const conEntrega4 = (base, desde, hasta) => {
  const nuevas = filas(seccion(desde, hasta));
  for (const [id, celdas] of Object.entries(nuevas)) if (base[id]) base[id] = [celdas[0], ...base[id].slice(1)];
  return base;
};
const GUIA_FICHAS = conEntrega4(conEntrega4(filas(seccion("### 3.1", "### 3.2")), "### 6.1", "### 6.2"), "### 7.2", "### 7.3");
const L6A = seccion("## 7 · Lote 6a", null);
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
  /* Lote 6a: «particular» («Alguien que no es cliente…», Futaba, PASA de Shoko) también nombra la palabra, y también es un préstamo. */
  assert.deepEqual(engañan, ["particular", "prestamo-cliente"], "la palabra «cliente» tiene que fallar en los préstamos que la nombran");
  /* Y «presta» tampoco sirve de pista: aparece en las dos cuentas. */
  const conPresta = D.FICHAS_T6_ACT1.filter((f) => /presta/.test(f.texto));
  assert.ok(conPresta.some((f) => f.cuenta === "clientes") && conPresta.some((f) => f.cuenta === "otra"));

  for (const lado of ["debita", "acredita"]) {
    const m = await montar(["prestamo-cliente"]);
    assert.match(m.caja.querySelector('[data-ficha="prestamo-cliente"]').textContent, /cliente/i);
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

/* ═══════════ LOTE 6a: LOS TRES CAJONES SON LAS OPCIONES (hoja de fusiones de Mai) ═══════════ */

test("★★★ los tres cajones son las opciones, con los nombres del lote 6a y su grupo; sin pestañas ni botón; E4 al fallar y al acertar", async () => {
  const { caja, desmontar } = await montar(["pago", "socio"]);
  const estante = caja.querySelector("[data-estante]");
  assert.equal(estante.getAttribute("aria-label"), "Cuenta por cobrar");
  assert.ok(L6A.includes("«Cuenta por cobrar»"));
  const nombres = [...estante.querySelectorAll("button[data-cajon] [data-nombre-cajon]")].map((n) => n.textContent);
  assert.deepEqual(nombres, ["Otra cuenta por cobrar", "Clientes, se debita", "Clientes, se acredita"]);
  for (const n of nombres) assert.ok(L6A.includes(`«${n}»`), n);
  assert.equal(caja.querySelectorAll("[data-nivel1], [data-nivel2], [data-boton-colocar]").length, 0);
  await marcar(caja, "clientes", "debita");
  assert.equal(cajon(caja, "clientes", "debita").dataset.marca, "tachada");
  assert.equal(cajon(caja, "clientes", "debita").disabled, true);
  await marcar(caja, "clientes", "acredita");
  assert.equal(cajon(caja, "clientes", "acredita").dataset.marca, "correcta");
  assert.equal(cajon(caja, "clientes", "debita").dataset.marca, "tachada", "lo elegido se queda junto a lo correcto");
  assert.equal(cajon(caja, "otra").dataset.marca, "apagada");
  assert.equal(botonAvanzar(caja).textContent, "Siguiente ficha");
  desmontar();
});

/* ═══════════ SORTEO Y PUNTAJE ═══════════ */

test("★★★ la tanda (R10): 9 fichas sin repetir, entre 2 y 4 por cajón con el tope del banco (4 · 3 · 3), y el reparto varía", () => {
  const repartos = new Set();
  for (let k = 0; k < 400; k++) {
    const tanda = L.sortearT6Act1(barajar);
    assert.equal(tanda.length, 9);
    assert.equal(new Set(tanda.map((f) => f.id)).size, 9);
    const cuantas = L.GRUPOS_T6_ACT1.map((g) => tanda.filter((f) => f.cuenta === g.cuenta && f.lado === g.lado).length);
    for (const n of cuantas) assert.ok(n >= 2 && n <= 4);
    repartos.add(cuantas.join("·"));
  }
  assert.deepEqual([...repartos].sort(), ["3·3·3", "4·2·3", "4·3·2"], "con el banco 4 · 3 · 3, los tres repartos posibles");
  assert.deepEqual(D.FICHAS_T6_ACT1.map((f) => f.id), IDS, "sortear no desordena el banco");
});

test("★★★ puntaje: cada ficha vale entera; el segundo intento, la mitad; el resumen es el de Futaba", async () => {
  const cli = ficha("pago");
  const otra = ficha("socio");
  assert.equal(L.valorDeItemT6Act1(cli, L.evaluarT6Act1(cli, { cuenta: "clientes", lado: "acredita" })), 1);
  assert.equal(L.valorDeItemT6Act1(cli, L.evaluarT6Act1(cli, { cuenta: "clientes", lado: "debita" })), 0);
  assert.equal(L.valorDeItemT6Act1(otra, L.evaluarT6Act1(otra, { cuenta: "otra", lado: null })), 1);
  let pct = null;
  const { caja, desmontar } = await montar(["pago"], (p) => { pct = p; });
  await marcar(caja, "clientes", "debita");
  await marcar(caja, "clientes", "acredita");
  await tocar(botonAvanzar(caja));
  assert.equal(pct, 50);
  assert.equal(caja.querySelector("[data-resumen]").textContent, "0 de 1 fichas bien al primer intento.");
  assert.ok(L6A.includes("«{bien} de {cuantas} fichas bien al primer intento.»"));
  desmontar();
});

test("★★ el texto alternativo y las reglas son los del lote 6a; el objetivo y la consigna, los del paquete", async () => {
  const { caja, desmontar } = await montar(["pago"]);
  assert.ok(L6A.includes(`«${D.ALT_T6_ACT1}»`));
  assert.ok(D.ALT_T6_ACT1.includes("Otra cuenta por cobrar; Clientes, se debita; o Clientes, se acredita."), "la corrección de Shoko: punto y coma");
  assert.ok(caja.textContent.includes(D.ALT_T6_ACT1));
  assert.equal(caja.querySelector("[data-objetivo]").textContent, GUIA_INICIAL.objetivo[0]);
  /* Lote 6b: la consigna va plegada bajo «¿Cómo se juega?» (encabezado compacto). */
  await tocar(caja.querySelector("[data-como-se-juega]"));
  assert.equal(caja.querySelector("[data-consigna]").textContent, GUIA_INICIAL.consigna[0]);
  for (const linea of D.REGLAS_T6_ACT1) assert.ok(L6A.includes(`«${linea}»`), linea);
  assert.equal(D.T6_ACT1.id, "b5-t6-a1");
  desmontar();
});

test("★★ auditoría integral: la C5 cita la palabra con comillas internas “crédito”, no con «»", () => {
  assert.ok(D.ERROR_T6_ACT1.C5.includes("Ojo con la palabra “crédito”:"));
  assert.ok(!D.ERROR_T6_ACT1.C5.includes("«"));
});
