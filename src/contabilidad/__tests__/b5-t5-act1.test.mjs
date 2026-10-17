import { test, beforeEach } from "node:test";
/* D8 (lote 18): cada prueba arranca en la vuelta 1 (la de hoy); la segunda vuelta tiene su propia prueba. */
beforeEach(() => { try { globalThis.window?.localStorage?.clear(); } catch { /* sin almacenamiento */ } });
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { JSDOM, VirtualConsole } from "jsdom";

/*
 * ═══════════════════════════════════════════════════════════════════════════
 * T5 · HACER 1 — «¿Qué renta da este título?» (Célula B, b5-t5-a1).
 *
 * Vigila LO QUE SE VE, no solo lo que se calcula:
 *   · lote 6a (hoja de fusiones de Mai): los tres cajones son las opciones, con
 *     las marcas de E4; la tanda reparte entre 2 y 4 por cajón (R10)
 *   · las 14 fichas y sus devoluciones de acierto, literales de la guía
 *     guardada (orquestador/conocimiento/paquetes/b5-t5-act1.md), ficha por ficha
 *   · E5 (Futaba, fila 11 de Shoko): al primer fallo, con cualquier cajón, la
 *     PISTA de la ficha, literal de la guía (§12.1); al segundo, la respuesta;
 *     acertada al primer intento, la pista no se ve nunca
 *   · las correcciones de Shoko: tras acertar el reintento, solo el acierto;
 *     el aviso, solo mientras se espera el reintento; la devolución en una
 *     región viva (role=status)
 *   · lote 6d (estándar único de Hacer, el modelo T4): sin emoji; el bloque
 *     de mensaje toma el veredicto del estado de la evaluación (Check y
 *     «Correcto.», o X y «Incorrecto.» al lector); las pastillas «Correcto»,
 *     «No va aquí» e «Iba aquí» en los cajones; «Ver mi resumen» al final
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

/*
 * Lote 19: estas pruebas son la decisión 1 (el cajón) y montan las fichas a un nivel con la configuración
 * de siempre, sin `segunda`: así prueban también que el cambio de FichasUnNivel es compatible. La decisión 2
 * de las fichas de descripción tiene su propia prueba (b5-segunda-decision.test.mjs).
 */
const { CONFIG_T5_ACT1 } = await import("../../components/mecanicas/libros/tema5/QueRentaDa.jsx");
const { default: FichasUnNivel } = await import("../../components/mecanicas/libros/b5/FichasUnNivel.jsx");
const QueRentaDa = (props) => h(FichasUnNivel, { config: CONFIG_T5_ACT1, ...props });
const { MarcoLibros } = await import("../../components/mecanicas/bloques/marcos.jsx");
const L = await import("../t5Act1.js");
const D = await import("../../data/contabilidadT5Act1.js");
const { barajar } = await import("../../utils/barajar.js");
const { FAE } = await import("../../theme.js");

const ficha = (id) => D.FICHAS_T5_ACT1.find((f) => f.id === id);

/* Monta el juego con las fichas dadas (en ese orden), sin sorteo. */
const montar = async (ids) => {
  const caja = document.createElement("div");
  document.body.appendChild(caja);
  const raiz = createRoot(caja);
  const items = ids.map(ficha);
  await act(async () => {
    raiz.render(h(QueRentaDa, { Marco: MarcoLibros, rotulo: "PRUEBA", titulo: "Prueba", acento: FAE.ambar, onCompletar: () => {}, items }));
  });
  return { caja, desmontar: () => { act(() => raiz.unmount()); caja.remove(); } };
};
const tocar = async (el) => { assert.ok(el, "no hay nada que tocar"); await act(async () => { el.dispatchEvent(new w.MouseEvent("click", { bubbles: true })); }); };
const botonAvanzar = (caja) => caja.querySelector("[data-boton-avanzar] button");
/* Lo que se lee en la devolución (lote 6d: el bloque de mensaje), sin el texto oculto para lectores. */
const devolucion = (caja) => {
  const p = caja.querySelector('[role="status"] [data-devolucion]');
  if (!p) return null;
  return [...p.childNodes].filter((n) => !(n.dataset && "lector" in n.dataset)).map((n) => n.textContent).join("");
};
const BLANCO = "rgb(248, 249, 250)";
const CORAL = "rgb(231, 111, 81)";
/* Lote 6a: tocar el cajón coloca la ficha (las fichas a un nivel). */
const cajon = (caja, renta, tipo = null) => caja.querySelector(`[data-cajon="${tipo ? `${renta}/${tipo}` : renta}"]`);
const marcar = async (caja, renta, tipo = null) => tocar(cajon(caja, renta, tipo));

/* ═══════════ LA GUÍA GUARDADA, LEÍDA POR SECCIÓN ═══════════ */

const GUIA = readFileSync(new URL("../../../orquestador/conocimiento/paquetes/b5-t5-act1.md", import.meta.url), "utf8");
const seccion = (desde, hasta) => {
  const i = GUIA.indexOf(desde);
  assert.ok(i >= 0, `la guía no tiene «${desde}»`);
  const j = hasta ? GUIA.indexOf(hasta, i + desde.length) : GUIA.length;
  return GUIA.slice(i, j);
};
/* Filas de tabla «| id | «texto» | … |» → { id: [celdas sin «» ni (n · n)] }. */
const filas = (texto) => {
  const out = {};
  for (const linea of texto.split("\n")) {
    if (!linea.startsWith("| ")) continue;
    const celdas = linea.split(" | ").map((c) => c.replace(/^\| /, "").replace(/ \|$/, "").trim());
    out[celdas[0]] = celdas.slice(1).map((c) => c.replace(/\s*\(\d+ · \d+\)$/, "").replace(/^«(.*)»$/, "$1"));
  }
  return out;
};
const GUIA_FICHAS = filas(seccion("### 3.6", "Devoluciones de acierto"));
const GUIA_ACIERTOS = filas(seccion("Devoluciones de acierto", "### 3.7"));
/* Lote 6d-textos (Futaba; nota al final de la guía): el acierto de la guía pierde «Sí. » delante, y el resto queda letra por letra. */
const aciertoDeGuia = (id) => {
  const t = GUIA_ACIERTOS[id][0];
  assert.ok(t.startsWith("Sí. "), `${id}: la tabla de la guía abre con «Sí. »`);
  assert.ok(GUIA.includes("pierden «Sí. » delante"), "la guía guarda la regla del lote 6d-textos");
  return t.slice("Sí. ".length);
};
/* Lote 6d-textos: el aviso del primer fallo. */
const AVISO_FALLO = "La ficha volvió. Lee la pista y pruébala en otro cajón.";
/* E5: la pista del primer fallo de cada ficha (§12.1). Las devoluciones de error de 3.7 y 3.8 quedan como registro. */
const GUIA_PISTAS = filas(seccion("### 12.1", null));

const IDS = ["acciones", "def-emisora", "def-dividendos", "caso-resultados", "cdt", "bonos", "cedulas", "def-interes", "caso-pactado", "participacion", "cert", "canjeables", "def-descuento", "caso-redencion"];
/* Los dos cajones que no son el de la ficha, en el orden del estante. */
const OPCIONES = [["variable", null], ["fija", "interes"], ["fija", "descuento"]];
const malos = (f) => OPCIONES.filter(([rr, tt]) => !(rr === f.renta && tt === f.tipo));

/* ═══════════ LO QUE SE VE: LAS 14 FICHAS Y SUS DEVOLUCIONES ═══════════ */

test("★★★ las 14 fichas: el texto pintado es el de la guía, ficha por ficha, y la respuesta también", async () => {
  assert.deepEqual(D.FICHAS_T5_ACT1.map((f) => f.id), IDS);
  for (const id of IDS) {
    assert.ok(GUIA_FICHAS[id], `la guía no tiene la ficha ${id}`);
    const { caja, desmontar } = await montar([id]);
    assert.equal(caja.querySelector(`[data-ficha="${id}"]`).textContent, GUIA_FICHAS[id][0], id);
    const respuesta = GUIA_FICHAS[id][1];
    const f = ficha(id);
    assert.equal(respuesta, f.renta === "variable" ? "Renta variable" : `Renta fija → ${f.tipo === "interes" ? "Con interés" : "Con descuento"}`, `${id}: respuesta`);
    desmontar();
  }
});

test("★★★ las 14 devoluciones de acierto se ven literales tras «Correcto.», ficha por ficha", async () => {
  for (const id of IDS) {
    const f = ficha(id);
    const { caja, desmontar } = await montar([id]);
    await marcar(caja, f.renta, f.tipo);
    assert.equal(devolucion(caja), `Correcto. ${aciertoDeGuia(id)}`, id);
    desmontar();
  }
});

test("guarda: la guía trae una pista por ficha, y una fila inventada no aparece", () => {
  assert.deepEqual(Object.keys(GUIA_PISTAS).filter((k) => k !== "Id" && !k.startsWith("|---")), IDS);
  assert.equal(GUIA_PISTAS["no-existe"], undefined);
});

test("★★★ E5: al primer fallo, con CADA cajón equivocado, se ve la pista de la ficha, literal de la guía (§12.1), en el bloque de error", async () => {
  for (const id of IDS) {
    const f = ficha(id);
    assert.equal(f.pista, GUIA_PISTAS[id][0], `${id}: la pista de los datos no es la de la guía`);
    for (const malo of malos(f)) {
      const m = await montar([id]);
      await marcar(m.caja, ...malo);
      assert.equal(devolucion(m.caja), GUIA_PISTAS[id][0], `${id} en ${malo.join("/")}`);
      const p = m.caja.querySelector('[role="status"]');
      assert.equal(m.caja.querySelectorAll('[role="status"]').length, 1, `${id}: una sola devolución`);
      /* Lote 6d: el cajón tocado ya dice «No va aquí» en coral; el bloque es el de error del estándar único (X, raya coral, «Incorrecto.»). */
      assert.equal(p.dataset.retro, "mal", `${id}: la pista va en el bloque de error`);
      assert.equal(p.querySelector("[data-lector]").textContent.trim(), "Incorrecto.", `${id}: el lector dice «Incorrecto.»`);
      assert.ok(parseFloat(p.querySelector("[data-devolucion]").style.fontSize) >= 12, `${id}: la pista, a 12 px como mínimo`);
      assert.equal(m.caja.querySelector("[data-fallo]").textContent, AVISO_FALLO);
      assert.equal(botonAvanzar(m.caja), null, `${id}: con la pista se espera el reintento`);
      m.desmontar();
    }
  }
});

/* La regla única del segundo fallo (lote 6d-textos): el acierto tal cual, sin nada delante. */
const segundoDeGuia = (id) => aciertoDeGuia(id);

test("★★★ regla única: tras el segundo fallo, TODA ficha muestra su acierto tal cual (sin «No es esa.»), y ese texto dice la respuesta", async () => {
  for (const id of IDS) {
    const f = ficha(id);
    /* Dos fallos seguidos, en los dos cajones que no son el suyo, en los dos órdenes (el tocado queda ✕ y no se puede volver a tocar). */
    for (const [a, b] of [malos(f), [...malos(f)].reverse()]) {
      const m = await montar([id]);
      await marcar(m.caja, ...a);
      assert.equal(devolucion(m.caja), GUIA_PISTAS[id][0], `${id}: primero, la pista`);
      await marcar(m.caja, ...b);
      assert.equal(devolucion(m.caja), segundoDeGuia(id), id);
      assert.ok(!m.caja.textContent.includes(f.pista), `${id}: tras el segundo fallo, la pista ya no se ve`);
      /* La respuesta está en el texto: el tipo de renta o la lista del libro. */
      const t = devolucion(m.caja).toLowerCase();
      const dice = f.renta === "variable" ? t.includes("renta variable") : (t.includes("interés") || t.includes("descuento"));
      assert.ok(dice, `${id}: el segundo fallo no dice la respuesta: «${devolucion(m.caja)}»`);
      assert.ok(botonAvanzar(m.caja), `${id}: tras el segundo fallo se avanza`);
      m.desmontar();
    }
  }
});

test("★★★ E5: una ficha acertada al primer intento nunca muestra su pista", async () => {
  const { caja, desmontar } = await montar(IDS);
  for (const id of IDS) {
    const f = ficha(id);
    await marcar(caja, f.renta, f.tipo);
    assert.equal(devolucion(caja), `Correcto. ${aciertoDeGuia(id)}`, id);
    assert.ok(!caja.textContent.includes(f.pista), `${id}: la pista se ve tras acertar`);
    await tocar(botonAvanzar(caja));
  }
  desmontar();
});

/* ═══════════ LAS CORRECCIONES DE SHOKO ═══════════ */

test("★★★ el primer fallo da la pista; el segundo, la regla única (no la pista otra vez)", async () => {
  const { caja, desmontar } = await montar(["def-interes"]);
  await marcar(caja, "variable");
  assert.equal(devolucion(caja), GUIA_PISTAS["def-interes"][0]);
  await marcar(caja, "fija", "descuento");
  assert.equal(devolucion(caja), segundoDeGuia("def-interes"), "el segundo fallo ya no da la pista: da la respuesta");
  desmontar();
});

test("★★★ corrección 2: tras un reintento acertado queda solo el acierto; el aviso, solo mientras se espera el reintento", async () => {
  const { caja, desmontar } = await montar(["caso-pactado"]);
  assert.equal(Boolean(caja.querySelector("[data-fallo]")), false);
  await marcar(caja, "fija", "descuento");
  assert.equal(caja.querySelector("[data-fallo]").textContent, AVISO_FALLO);
  assert.equal(devolucion(caja), GUIA_PISTAS["caso-pactado"][0]);
  await marcar(caja, "fija", "interes");
  assert.equal(Boolean(caja.querySelector("[data-fallo]")), false, "el aviso desaparece tras el reintento");
  assert.equal(caja.querySelectorAll('[role="status"]').length, 1);
  assert.equal(devolucion(caja), `Correcto. ${aciertoDeGuia("caso-pactado")}`);
  assert.ok(!caja.textContent.includes(ficha("caso-pactado").pista), "la pista del primer fallo ya no se ve");
  desmontar();
});

test("★★ correcciones 3 y 4 (lote 6d): los datos van sin emoji y el veredicto sale del estado; la devolución, en una región viva (role=status); la pista, de 20 palabras como mucho", async () => {
  for (const f of D.FICHAS_T5_ACT1) {
    /* Lote 6d-textos: el acierto ya no abre con un veredicto. */
    assert.ok(!/^Sí\b/.test(f.acierto), `${f.id}: el acierto abre con «Sí»`);
    for (const k of ["acierto", "pista"]) assert.ok(!/Vas bien:|No es esa\./.test(f[k]), `${f.id}.${k}`);
    assert.ok(!/[\u2705\u274C]/.test(f.acierto), `${f.id}: el acierto lleva emoji`);
    assert.ok(!/^(✅|❌)/.test(f.pista), `${f.id}: la pista no lleva veredicto`);
    assert.ok(f.pista.split(/\s+/).length <= 20, `${f.id}: la pista pasa de 20 palabras`);
    /* Lo retirado con E5 no vuelve. */
    for (const k of ["falloNivel1", "falloNivel2", "segundoFallo"]) assert.equal(f[k], undefined, `${f.id}.${k}`);
  }
  assert.equal(D.ERROR_T5_ACT1, undefined, "las devoluciones de error A, B y C salieron de los datos");
  const { caja, desmontar } = await montar(["bonos"]);
  await marcar(caja, "fija", "interes");
  const p = caja.querySelector('[role="status"]');
  assert.ok(p);
  assert.equal(p.dataset.retro, "ok");
  const icono = p.querySelector("svg[data-icono]");
  assert.equal(icono.dataset.icono, "visto", "el acierto, con el Check de lucide");
  assert.equal(icono.getAttribute("aria-hidden"), "true");
  assert.ok(p.closest('[aria-live="polite"]'), "la devolución va en una región viva");
  desmontar();
});

/* ═══════════ LOTE 6a: LOS TRES CAJONES SON LAS OPCIONES (hoja de fusiones de Mai) ═══════════ */

const L6A = seccion("## 11 · Lote 6a", null);
const marcaDe = (el) => el.dataset.marca || null;
const iconos = (el) => [...el.querySelectorAll("svg[data-icono]")].map((x) => x.dataset.icono);
const tachado = (el) => el.querySelector("[data-nombre-cajon]").style.textDecoration === "line-through";

test("★★★ los tres cajones son las opciones: sus nombres, su grupo, y van entre la ficha y la devolución; no hay pestañas ni botón", async () => {
  const { caja, desmontar } = await montar(["cdt", "acciones"]);
  const estante = caja.querySelector("[data-estante]");
  assert.equal(estante.getAttribute("role"), "group");
  assert.equal(estante.getAttribute("aria-label"), "Tipo de renta");
  assert.ok(L6A.includes("«Tipo de renta»"));
  const cajones = [...estante.querySelectorAll("button[data-cajon]")];
  assert.deepEqual(cajones.map((b) => b.querySelector("[data-nombre-cajon]").textContent), ["Renta variable", "Fija con interés", "Fija con descuento"]);
  for (const n of ["Renta variable", "Fija con interés", "Fija con descuento"]) assert.ok(L6A.includes(`«${n}»`), n);
  for (const b of cajones) assert.equal(b.style.minHeight, "84px");
  assert.equal(estante.style.gridTemplateColumns, "repeat(3, minmax(0, 1fr))");
  assert.equal(caja.querySelectorAll("[data-nivel1], [data-nivel2], [data-boton-colocar]").length, 0, "sin pestañas ni «Colocar la ficha»");
  assert.ok(caja.querySelector("[data-ficha]").compareDocumentPosition(estante) & 4, "el estante, debajo de la ficha");
  await marcar(caja, "fija", "interes");
  assert.ok(estante.compareDocumentPosition(caja.querySelector('[role="status"]')) & 4, "la devolución, debajo del estante");
  assert.equal(botonAvanzar(caja).textContent, "Siguiente ficha");
  desmontar();
});

test("★★★ E4 · lote 6d: el acierto queda «Correcto» con Check y borde 2 px #F8F9FA, sin relleno ni teal; el resto, a 0,5", async () => {
  const { caja, desmontar } = await montar(["cdt", "acciones"]);
  await marcar(caja, "fija", "interes");
  const bien = cajon(caja, "fija", "interes");
  assert.equal(marcaDe(bien), "correcta");
  assert.deepEqual(iconos(bien), ["visto"]);
  assert.equal(bien.style.border, `2px solid ${BLANCO}`, "borde 2 px #F8F9FA");
  assert.equal(bien.style.background, "transparent", "sin relleno");
  assert.ok(!bien.outerHTML.includes("42, 157, 143") && !/2a9d8f/i.test(bien.outerHTML), "sin teal");
  assert.equal(bien.querySelector("[data-pastilla]").textContent, "Correcto");
  for (const otro of [cajon(caja, "variable"), cajon(caja, "fija", "descuento")]) {
    assert.equal(marcaDe(otro), "apagada");
    assert.equal(otro.style.opacity, "0.5");
    assert.deepEqual(iconos(otro), []);
    assert.equal(otro.disabled, true);
  }
  /* «Siguiente ficha» borra las marcas; la pila y el número se quedan. */
  await tocar(botonAvanzar(caja));
  assert.ok([...caja.querySelectorAll("[data-cajon]")].every((b) => !marcaDe(b) && !b.disabled));
  assert.equal(cajon(caja, "fija", "interes").querySelector("[data-numero]").textContent, "1");
  desmontar();
});

test("★★★ E4 · lote 6d: el primer fallo deja el cajón tocado «No va aquí» (X, 2 px coral) y tachado, y no se puede volver a tocar; el segundo deja los dos así y revela «Iba aquí» en el correcto", async () => {
  const { caja, desmontar } = await montar(["cdt"]);
  await marcar(caja, "fija", "descuento");
  const primero = cajon(caja, "fija", "descuento");
  assert.equal(marcaDe(primero), "tachada");
  assert.deepEqual(iconos(primero), ["tache"]);
  assert.ok(tachado(primero));
  assert.equal(primero.querySelector("[data-pastilla]").textContent, "No va aquí");
  assert.equal(primero.style.border, `2px solid ${CORAL}`);
  assert.equal(primero.disabled, true, "el ✕ no se puede volver a tocar en esta ficha");
  assert.equal(primero.style.opacity, "1");
  assert.equal(cajon(caja, "variable").disabled, false, "los otros siguen abiertos");
  assert.equal(marcaDe(cajon(caja, "fija", "interes")), null, "lo correcto no se revela antes del segundo intento");
  await marcar(caja, "variable");
  assert.equal(marcaDe(cajon(caja, "variable")), "tachada");
  assert.equal(marcaDe(primero), "tachada", "lo elegido no se reemplaza");
  const correcto = cajon(caja, "fija", "interes");
  assert.equal(marcaDe(correcto), "revelada", "sin reintento, la correcta se revela");
  assert.equal(correcto.querySelector("[data-pastilla]").textContent, "Iba aquí");
  assert.deepEqual(iconos(correcto), [], "«Iba aquí» va sin ícono");
  assert.ok(correcto.classList.contains("fae-b5h-revelado"), "con el borde de 2 px #F8F9FA que llega 0,7 s después");
  assert.ok(correcto.querySelector("[data-pastilla]").classList.contains("fae-b5h-revela"));
  /* La lámina tras el segundo fallo llega punteada, al cajón correcto. */
  assert.equal(cajon(caja, "fija", "interes").querySelector("[data-lamina]").dataset.lamina, "segundo");
  assert.equal(cajon(caja, "variable").querySelector("[data-numero]").textContent, "0");
  desmontar();
});

/* ═══════════ SORTEO Y PUNTAJE ═══════════ */

test("★★★ la tanda (R10): 9 fichas, entre 2 y 4 por cajón, y salen repartos distintos; como mucho una de nombre salvo con 4 en renta fija", () => {
  const repartos = new Set();
  for (let k = 0; k < 400; k++) {
    const tanda = L.sortearT5Act1(barajar);
    assert.equal(tanda.length, 9);
    assert.equal(new Set(tanda.map((f) => f.id)).size, 9);
    const cuantas = L.GRUPOS_T5_ACT1.map((g) => tanda.filter((f) => f.renta === g.renta && f.tipo === g.tipo));
    for (const [i, del] of cuantas.entries()) {
      assert.ok(del.length >= 2 && del.length <= 4, `cajón ${i}: ${del.length}`);
      const nombres = del.filter((f) => f.clase === D.NOMBRE).length;
      assert.ok(nombres <= (del.length === 4 && L.GRUPOS_T5_ACT1[i].tipo ? 2 : 1), `cajón ${i}: ${nombres} de nombre en ${del.length}`);
    }
    repartos.add(cuantas.map((x) => x.length).join("·"));
  }
  assert.ok(repartos.size >= 5, `el reparto no varía: ${[...repartos]}`);
  assert.ok(![...repartos].every((x) => x === "3·3·3"));
});

test("★★★ puntaje: cada ficha vale entera; el segundo intento, la mitad; el resumen es el de Futaba", async () => {
  const fija = ficha("cdt");
  const varia = ficha("acciones");
  assert.equal(L.valorDeItemT5Act1(fija, L.evaluarT5Act1(fija, { renta: "fija", tipo: "interes" })), 1);
  assert.equal(L.valorDeItemT5Act1(fija, L.evaluarT5Act1(fija, { renta: "fija", tipo: "descuento" })), 0);
  assert.equal(L.valorDeItemT5Act1(varia, L.evaluarT5Act1(varia, { renta: "variable", tipo: null })), 1);
  let pct = null;
  const caja = document.createElement("div");
  document.body.appendChild(caja);
  const raiz = createRoot(caja);
  await act(async () => {
    raiz.render(h(QueRentaDa, { Marco: MarcoLibros, rotulo: "P", titulo: "P", acento: FAE.ambar, onCompletar: (p) => { pct = p; }, items: [fija] }));
  });
  await marcar(caja, "variable");
  await marcar(caja, "fija", "interes");
  await tocar(botonAvanzar(caja));
  assert.equal(pct, 50);
  assert.equal(caja.querySelector("[data-resumen]").textContent, "0 de 1 fichas bien al primer intento.");
  assert.ok(L6A.includes("«{bien} de {cuantas} fichas bien al primer intento.»"));
  act(() => raiz.unmount());
  caja.remove();
});

test("★★ el texto alternativo y las dos reglas son los del lote 6a; el objetivo y la consigna, los de la guía", async () => {
  const { caja, desmontar } = await montar(["bonos"]);
  assert.ok(L6A.includes(`«${D.ALT_T5_ACT1}»`));
  assert.ok(caja.textContent.includes(D.ALT_T5_ACT1));
  for (const linea of D.REGLAS_T5_ACT1) assert.ok(L6A.includes(`«${linea}»`), linea);
  assert.equal(D.REGLAS_T5_ACT1.length, 2);
  assert.equal(caja.querySelector("[data-objetivo]").textContent, "Distinguir los tres tipos de título según el tipo de renta que dan.");
  /* Lote 6b: la consigna va plegada bajo «¿Cómo se juega?» (encabezado compacto). */
  await tocar(caja.querySelector("[data-como-se-juega]"));
  assert.equal(caja.querySelector("[data-consigna]").textContent, "Lee la ficha. Elige qué tipo de renta da.");
  desmontar();
});

test("★★★ lote 6b · el encabezado compacto (B1): el objetivo, y en una fila el contador y «¿Cómo se juega?»; plegados, la consigna y los pasos", async () => {
  const { caja, desmontar } = await montar(["bonos", "acciones"]);
  const enc = caja.querySelector("[data-encabezado-compacto]");
  assert.ok(enc, "sin encabezado compacto");
  assert.ok(D.T5_ACT1.objetivo.split(/\s+/).length <= 20, "el objetivo, 20 palabras como mucho");
  assert.equal(enc.querySelector("[data-contador]").textContent, "Ficha 1 de 2");
  /* Lote 6d (§4.3): «Ficha 1 de 2», sin mayúsculas ni espaciado. */
  assert.equal(enc.querySelector("[data-contador]").style.textTransform, "");
  assert.equal(enc.querySelector("[data-contador]").style.letterSpacing, "");
  const como = enc.querySelector("[data-como-se-juega]");
  assert.equal(como.textContent, "¿Cómo se juega?");
  assert.equal(como.style.minHeight, "44px");
  assert.equal(como.style.textDecoration, "underline");
  assert.equal(como.parentElement, enc.querySelector("[data-contador]").parentElement, "el contador y el enlace, en la misma fila");
  assert.equal(como.parentElement.style.minHeight, "44px");
  /* Plegado no ocupa nada; el foco no puede caer en algo escondido. */
  assert.equal(enc.querySelector("[data-consigna]"), null);
  await tocar(como);
  assert.deepEqual([...enc.querySelectorAll("[data-pasos] li")].map((li) => li.textContent), D.REGLAS_T5_ACT1);
  /* La ficha y el estante, después del encabezado. */
  assert.ok(enc.compareDocumentPosition(caja.querySelector("[data-ficha]")) & 4);
  desmontar();
});
