import { test } from "node:test";
import assert from "node:assert/strict";
import { readFileSync, readdirSync } from "node:fs";
import { JSDOM, VirtualConsole } from "jsdom";

/*
 * ═══════════════════════════════════════════════════════════════════════════
 * TEMA 3 · «Del resultado a la caja» (paquete e3-t3-del-resultado-a-la-caja-v4,
 * A1 a A8).
 *
 *   · los textos literales: §0, §3, §4, §5 y §6
 *   · las cuentas: A da 14.650 y B 6.800.000, por la utilidad y por la caja
 *   · la evaluación: dos errores como mucho, en el orden de las fichas,
 *     «Y hay más…» y A6 con su número en palabras («dos» en A; «tres» o
 *     «cuatro» en B)
 *   · el puente: escala, renglones, alto de Itagaki y el tramo menor ≥ 4 px
 *   · montada: una ficha por paso, sin total corrido, la lista que devuelve
 *     la ficha, «Comprobar» solo con todas, el punteado y A7 (sin punteado si
 *     la caja de las respuestas es negativa)
 *   · A y B se alternan por intento (A1); sin «Caso n de 2»
 *   · en el camino detrás de «Cerrar el periodo», con su fila 0257, su
 *     etiqueta en el panel docente, su subtema del Repaso y «Así se juega»
 * ═══════════════════════════════════════════════════════════════════════════
 */

const dom = new JSDOM("<!doctype html><html><body></body></html>", { url: "http://localhost/", virtualConsole: new VirtualConsole() });
const w = dom.window;
let reducir = true;
w.matchMedia = (q) => ({ matches: q.includes("reduce") && reducir, addEventListener() {}, removeEventListener() {}, addListener() {}, removeListener() {} });
w.Element.prototype.scrollIntoView = () => {};
for (const [k, v] of Object.entries({
  window: w, document: w.document, navigator: w.navigator, localStorage: w.localStorage,
  HTMLElement: w.HTMLElement, Element: w.Element, Node: w.Node, SVGElement: w.SVGElement,
  Event: w.Event, MouseEvent: w.MouseEvent, KeyboardEvent: w.KeyboardEvent,
  getComputedStyle: w.getComputedStyle.bind(w), matchMedia: w.matchMedia,
})) {
  Object.defineProperty(globalThis, k, { value: v, configurable: true, writable: true });
}
globalThis.IS_REACT_ACT_ENVIRONMENT = true;

const React = await import("react");
const { createRoot } = await import("react-dom/client");
const act = React.act;
const h = React.createElement;

const D = await import("../../data/contabilidadTema3ResultadoCaja.js");
const L = await import("../resultadoCaja.js");
const { SUBJECTS, HACER } = await import("../../data/subjects.js");
const { default: ResultadoCaja } = await import("../../components/mecanicas/libros/tema3/ResultadoCaja.jsx");
const { JUEGOS } = await import("../../components/ContabilidadTema3View.jsx");
const { etiquetaDeItem } = await import("../../docente/etiquetasItem.js");
const { subtemaDeT3, clavesDe } = await import("../../data/subtemasContabilidadT3.js");
const { ASI_SE_JUEGA } = await import("../../data/asiSeJuega.js");

const { SUMA, RESTA, NO_MUEVE, CASO_A, CASO_B } = D;
const Marco = ({ children }) => h("div", null, children);

const montar = async (props = {}) => {
  const caja = document.createElement("div");
  document.body.appendChild(caja);
  const raiz = createRoot(caja);
  await act(async () => { raiz.render(h(ResultadoCaja, { Marco, ...props })); });
  return { caja, desmontar: () => { act(() => raiz.unmount()); caja.remove(); } };
};
const tocar = async (el) => { await act(async () => { el.dispatchEvent(new w.MouseEvent("click", { bubbles: true })); }); };
const elegir = async (caja, eleccion) => tocar(caja.querySelector(`[data-tarjeta] [data-eleccion="${eleccion}"]`));
/* Sin lo que solo oye el lector («Correcto. » / «Incorrecto. »), que va delante del primer párrafo. */
const textos = (caja) => [...caja.querySelectorAll("[data-parrafo-devolucion]")].map((p) => p.textContent.replace(/^(Correcto|Incorrecto)\. /, ""));
const estado = (caja) => caja.querySelector("[data-resultado-caja]").dataset.estadoPartida;
const esperar = async (ms) => { await act(async () => { await new Promise((r) => setTimeout(r, ms)); }); };
const respuestasDe = (caso, cambios = {}) => Object.fromEntries(caso.fichas.map((f) => [f.id, cambios[f.id] ?? f.va]));
const jugar = async (caja, caso, cambios = {}) => {
  for (const f of caso.fichas) await elegir(caja, cambios[f.id] ?? f.va);
};

/* ═══════════ LOS TEXTOS, LITERALES ═══════════ */

test("★★★ catálogo, consigna, pasos, cierre y los textos de §0 (A4, A6, A8), literales", () => {
  assert.deepEqual([D.ACT_RESULTADO_CAJA.id, D.ACT_RESULTADO_CAJA.nombre, D.ACT_RESULTADO_CAJA.dificultad, D.ACT_RESULTADO_CAJA.fpBase],
    ["t3-del-resultado-a-la-caja", "Del resultado a la caja", "dificil", 50]);
  assert.equal(D.ACT_RESULTADO_CAJA.consigna, "Parte de la utilidad del mes. Pon cada ficha donde va y halla la caja al cierre.");
  assert.deepEqual(D.PASOS_RESULTADO_CAJA, [
    "Mira la utilidad del mes. La caja empezó en cero.",
    "Por cada ficha, pregúntate si hace que la caja tenga más o menos plata que la utilidad.",
    "Ponla en Suma, en Resta o en No mueve la caja.",
  ]);
  assert.equal(D.CIERRE_RESULTADO_CAJA, "La utilidad mide lo que se ganó. La caja mide la plata. Las fichas explican la distancia entre las dos.");
  assert.equal(D.VARIOS_ERRORES, "Y hay más fichas por revisar.");
  assert.equal(D.ROTULO_CAJA_CIERRE, "Caja al cierre");
  assert.equal(D.LEYENDA_PUNTEADO, "Punteado: así quedaba con tus respuestas");
  assert.equal(D.ERROR_CUADRA_CON_ERRORES, "Llegaste a la caja correcta, pero con dos fichas mal puestas: sus errores se cancelaron.");
  /* Kamogawa, #557: el número va en palabras. */
  assert.equal(D.errorCuadraConErrores(2), D.ERROR_CUADRA_CON_ERRORES);
  assert.equal(D.errorCuadraConErrores(3), "Llegaste a la caja correcta, pero con tres fichas mal puestas: sus errores se cancelaron.");
  assert.equal(D.errorCuadraConErrores(4), "Llegaste a la caja correcta, pero con cuatro fichas mal puestas: sus errores se cancelaron.");
  assert.deepEqual(D.ELECCIONES.map((e) => e.rotulo), ["Suma", "Resta", "No mueve la caja"]);
  assert.equal(D.INTERFAZ_RESULTADO_CAJA.paso(2, 4), "Paso 2 de 4");
});

test("★★★ versión A (§4): San Calixto, $3.950, cuatro fichas con sus respuestas, acierto y pie", () => {
  assert.equal(CASO_A.texto, "San Calixto abrió el 2 de enero. Este es su primer mes.");
  assert.equal(CASO_A.rotuloUtilidad, "Utilidad antes del impuesto");
  assert.equal(CASO_A.utilidad, 3950);
  assert.equal(CASO_A.pie, "Basado en el libro, pp. 121-128 y 140");
  assert.deepEqual(CASO_A.fichas.map((f) => [f.nombre, f.monto, f.va]), [
    ["Aporte en plata", 15000, SUMA],
    ["Equipo aportado", 5000, NO_MUEVE],
    ["Cuentas por cobrar – clientes", 6800, RESTA],
    ["Alquiler por pagar", 2500, SUMA],
  ]);
  assert.equal(CASO_A.acierto, "Los $3.950 de utilidad, más el aporte y lo que se debe, menos lo que falta cobrar, dan los $14.650 de la caja.");
  assert.equal(CASO_A.texto.length <= 90, true);
});

test("★★★ versión B (§5, A2, A3, A5): seis fichas, el nombre largo de 35 caracteres y los datos de control fuera de pantalla", () => {
  assert.equal(CASO_B.texto, "Escenario simulado. Estudio Foco abrió en marzo. Este es su primer mes.");
  assert.equal(CASO_B.rotuloUtilidad, "Utilidad del ejercicio");
  assert.equal(CASO_B.utilidad, 1541000);
  assert.equal(CASO_B.pie, null);
  assert.deepEqual(CASO_B.fichas.map((f) => [f.nombre, f.monto, f.va]), [
    ["Aporte en plata", 5000000, SUMA],
    ["Préstamo recibido", 2000000, SUMA],
    ["Arriendo abril–junio, por anticipado", 600000, RESTA],
    ["Cuentas por cobrar – clientes", 1900000, RESTA],
    ["Impuesto de renta por pagar", 759000, SUMA],
    ["Equipo comprado a crédito", 1500000, NO_MUEVE],
  ]);
  assert.equal(CASO_B.fichas.filter((f) => f.va !== NO_MUEVE).length, 5);
  /* A3 dice 35; contado da 36 («Arriendo abril–junio, por anticipado»), justo el tope. */
  assert.equal(CASO_B.fichas[2].nombre.length, 36);
  assert.ok(Math.max(...[...CASO_A.fichas, ...CASO_B.fichas].map((f) => f.nombre.length)) <= 36);
  assert.match(CASO_B.acierto, /^Escenario simulado\. /);
  /* A5: la caja también sale de los datos de control, que no se pintan. */
  const c = D.CONTROL_B;
  assert.equal(c.ingresos - c.gastos, c.antesDeImpuesto);
  assert.equal(Math.round(c.antesDeImpuesto * 0.33), c.impuesto);
  assert.equal(c.antesDeImpuesto - c.impuesto, CASO_B.utilidad);
  assert.equal(5000000 + 2000000 + c.cobrado - c.gastos - 600000, CASO_B.caja);
});

test("★★★ §6: un error por ficha, literal, y el tutorial de la panadería", () => {
  const err = (caso, k) => caso.fichas[k].error;
  assert.equal(err(CASO_A, 0), "Los socios metieron plata a la caja, y un aporte no es ingreso. Por eso la caja tiene más que la utilidad.");
  assert.equal(err(CASO_B, 0), "Los socios metieron plata a la caja este mes, y un aporte no es ingreso. La caja tiene más por eso.");
  assert.equal(err(CASO_A, 1), "El equipo entró a la empresa, pero no es plata. La caja no lo ve.");
  assert.equal(err(CASO_A, 2), err(CASO_B, 3));
  assert.equal(err(CASO_A, 2), "Esas facturas ya cuentan en la utilidad, pero la plata no ha llegado. La caja tiene menos por eso.");
  assert.equal(err(CASO_A, 3), "Ese gasto ya bajó la utilidad, pero la plata no ha salido. La caja tiene más por eso.");
  assert.equal(err(CASO_B, 1), "El banco metió plata a la caja, y un préstamo no es ingreso. La caja tiene más por eso.");
  assert.equal(err(CASO_B, 2), "Salió plata por un arriendo que aún no se usa. No bajó la utilidad, pero sí la caja.");
  assert.equal(err(CASO_B, 4), "Ese impuesto ya bajó la utilidad, pero todavía no se paga. La caja tiene más por eso.");
  assert.equal(err(CASO_B, 5), "Ese equipo no movió la caja ni la utilidad: todavía no se paga y no es gasto.");
  const e = D.EJEMPLO_RESULTADO_CAJA;
  assert.equal(e.texto, "Ganó $300.000 este mes. Aún le deben $100.000.");
  assert.equal(e.empresa, "Una panadería, escenario simulado");
  assert.deepEqual([e.rotuloUtilidad, e.utilidad], ["Utilidad del mes", 300000]);
  assert.deepEqual(e.fichas.map((f) => [f.nombre, f.monto, f.va]), [["Cuentas por cobrar – clientes", 100000, RESTA]]);
  assert.equal(e.acierto, "La utilidad fue $300.000, pero $100.000 no han llegado. La caja subió solo $200.000.");
  assert.equal(L.cajaCorrecta(e), e.caja);
});

/* ═══════════ LAS CUENTAS ═══════════ */

test("★★★ la caja: A 3.950 + 15.000 − 6.800 + 2.500 = 14.650; B 6.800.000; y los errores probables de A", () => {
  assert.equal(L.cajaCorrecta(CASO_A), 14650);
  assert.equal(CASO_A.caja, 14650);
  assert.equal(L.cajaCorrecta(CASO_B), 6800000);
  assert.equal(CASO_B.caja, 6800000);
  const [a1, a2, a3, a4] = CASO_A.fichas.map((f) => f.id);
  assert.equal(L.cajaDe(CASO_A, respuestasDe(CASO_A, { [a2]: SUMA })), 19650);
  assert.equal(L.cajaDe(CASO_A, respuestasDe(CASO_A, { [a3]: SUMA })), 28250);
  assert.equal(L.cajaDe(CASO_A, respuestasDe(CASO_A, { [a4]: RESTA })), 9650);
  assert.equal(L.cajaDe(CASO_A, respuestasDe(CASO_A, { [a1]: NO_MUEVE })), -350);
});

/* ═══════════ LA EVALUACIÓN ═══════════ */

test("★★★ todo bien: solo el acierto; mal: los dos primeros errores en el orden de las fichas y «Y hay más…»", () => {
  const ok = L.evaluarResultadoCaja(CASO_B, respuestasDe(CASO_B));
  assert.deepEqual([ok.ok, ok.textos], [true, [CASO_B.acierto]]);
  const [b1, b2, b3, b4] = CASO_B.fichas.map((f) => f.id);
  const uno = L.evaluarResultadoCaja(CASO_B, respuestasDe(CASO_B, { [b3]: SUMA }));
  assert.deepEqual(uno.textos, [CASO_B.fichas[2].error]);
  /* Se eligieron en otro orden, pero los errores salen en el de las fichas. */
  const tres = L.evaluarResultadoCaja(CASO_B, respuestasDe(CASO_B, { [b4]: NO_MUEVE, [b1]: RESTA, [b2]: NO_MUEVE }));
  assert.deepEqual(tres.textos, [CASO_B.fichas[0].error, CASO_B.fichas[1].error, "Y hay más fichas por revisar."]);
  assert.equal(L.puntuarResultadoCaja(tres, 6), 50);
});

test("★★★ A6: en A, Equipo en «Suma» y Alquiler en «Resta» llegan a la caja correcta; sale ERROR_CUADRA_CON_ERRORES y los dos errores", () => {
  const [, a2, , a4] = CASO_A.fichas.map((f) => f.id);
  const r = L.evaluarResultadoCaja(CASO_A, respuestasDe(CASO_A, { [a2]: SUMA, [a4]: RESTA }));
  assert.equal(r.suya, 14650);
  assert.equal(r.cuadra, true);
  assert.deepEqual(r.textos, [D.ERROR_CUADRA_CON_ERRORES, CASO_A.fichas[1].error, CASO_A.fichas[3].error]);
  /*
   * Recorridas las 3⁴ y 3⁶ respuestas: en A es el único caso que cuadra con
   * errores, y dice «dos»; en B cuadran dos, con 3 y 4 fichas mal, y A6 dice
   * «tres» y «cuatro» (Kamogawa, #557). Siempre va primero.
   */
  const cuadran = (caso) => {
    const ids = caso.fichas.map((f) => f.id);
    const salen = [];
    const rec = (k, resp) => {
      if (k === ids.length) { const e = L.evaluarResultadoCaja(caso, resp); if (e.cuadra) salen.push([e.mal.length, e.textos[0] === D.errorCuadraConErrores(e.mal.length)]); return; }
      for (const o of [SUMA, RESTA, NO_MUEVE]) rec(k + 1, { ...resp, [ids[k]]: o });
    };
    rec(0, {});
    return salen.sort();
  };
  assert.deepEqual(cuadran(CASO_A), [[2, true]]);
  assert.deepEqual(cuadran(CASO_B), [[3, true], [4, true]]);
});

/* ═══════════ EL PUENTE ═══════════ */

test("★★★ el puente: escala 33.250 y 13.300.000, renglones 2 + m, alto de Itagaki y tramo menor ≥ 4 px", () => {
  assert.equal(L.escalaDe(CASO_A), 33250);
  assert.equal(L.escalaDe(CASO_B), 13300000);
  const fa = L.renglonesDelPuente(CASO_A, "Caja al cierre");
  const fb = L.renglonesDelPuente(CASO_B, "Caja al cierre");
  assert.equal(fa.length, 2 + 3);
  assert.equal(fb.length, 2 + 5);
  /*
   * La fórmula de Itagaki, 12 + (2 + m) × 30 + 16 + 12, da 190 en A y 250 en
   * B; el paquete escribe 150 y 210 (A2). El alto real está medido en el PR.
   */
  assert.equal(12 + fa.length * 30 + 16 + 12, 190);
  assert.equal(12 + fb.length * 30 + 16 + 12, 250);
  assert.deepEqual(fa.map((f) => [f.desde, f.hasta, f.lleno]), [[0, 3950, true], [3950, 18950, true], [12150, 18950, false], [12150, 14650, true], [0, 14650, true]]);
  assert.deepEqual(fa.at(-1).nombre, "Caja al cierre");
  /* Lo máximo que pueden dar unas respuestas es la escala: nada se sale. */
  for (const caso of [CASO_A, CASO_B]) {
    const todoSuma = Object.fromEntries(caso.fichas.map((f) => [f.id, SUMA]));
    assert.equal(L.cajaDe(caso, todoSuma), L.escalaDe(caso));
    /* El tramo menor, en la pista más angosta (232 px por dentro del puente a 320). */
    const menor = Math.min(...caso.fichas.filter((f) => f.va !== NO_MUEVE).map((f) => f.monto));
    assert.ok((menor / L.escalaDe(caso)) * 232 >= 4, caso.version);
  }
});

/* ═══════════ MONTADA ═══════════ */

test("★★★ vacío: la ficha del caso sin la caja, «Paso 1 de 4», la primera tarjeta y la lista vacía; sin «Caso n de 2»", async () => {
  const m = await montar({ version: "A" });
  try {
    assert.equal(estado(m.caja), "vacio");
    const ficha = m.caja.querySelector("[data-ficha-caso]");
    assert.equal(ficha.querySelector("[data-caso]").textContent, CASO_A.texto);
    assert.match(ficha.textContent, /Utilidad antes del impuesto\$3\.950/);
    assert.doesNotMatch(m.caja.textContent, /14\.650|Caja al cierre|Caso \d de/);
    assert.equal(m.caja.querySelector("[data-paso]").textContent, "Paso 1 de 4");
    assert.equal(m.caja.querySelector("[data-tarjeta]").dataset.tarjeta, "t3rc-a1");
    assert.equal(m.caja.querySelectorAll("[data-tarjeta] [data-eleccion]").length, 3);
    assert.ok([...m.caja.querySelectorAll("[data-eleccion]")].every((b) => b.getAttribute("aria-pressed") === "false"));
    assert.equal(m.caja.querySelector("[data-lista]"), null);
    assert.equal(m.caja.querySelector("[data-comprobar]"), null);
    assert.equal(m.caja.querySelector("[data-cita]").textContent, CASO_A.pie);
  } finally { m.desmontar(); }
});

test("★★★ a mitad: la tarjeta pasa a la lista (la más reciente arriba), sin total corrido; tocar un renglón la devuelve a la ranura", async () => {
  const m = await montar({ version: "A" });
  try {
    await elegir(m.caja, SUMA);
    await elegir(m.caja, NO_MUEVE);
    assert.equal(estado(m.caja), "a-mitad");
    assert.equal(m.caja.querySelector("[data-paso]").textContent, "Paso 3 de 4");
    const renglones = [...m.caja.querySelectorAll("[data-renglon-lista]")];
    assert.deepEqual(renglones.map((x) => x.dataset.renglonLista), ["t3rc-a2", "t3rc-a1"]);
    assert.equal(renglones[0].querySelector("button").getAttribute("aria-label"), "Cambiar Equipo aportado: No mueve la caja");
    assert.doesNotMatch(m.caja.textContent, /Caja al cierre|\$18\.950|\$13\.950/);
    await tocar(renglones[1].querySelector("button"));
    assert.equal(m.caja.querySelector("[data-tarjeta]").dataset.tarjeta, "t3rc-a1");
    assert.equal(m.caja.querySelector("[data-paso]").textContent, "Paso 1 de 4");
    assert.equal(m.caja.querySelector('[data-eleccion="suma"]').getAttribute("aria-pressed"), "true");
    assert.deepEqual([...m.caja.querySelectorAll("[data-renglon-lista]")].map((x) => x.dataset.renglonLista), ["t3rc-a2"]);
    await elegir(m.caja, RESTA);
    /* Vuelve arriba de la lista y la ranura retoma la que faltaba. */
    assert.deepEqual([...m.caja.querySelectorAll("[data-renglon-lista]")].map((x) => x.dataset.renglonLista), ["t3rc-a1", "t3rc-a2"]);
    assert.equal(m.caja.querySelector("[data-tarjeta]").dataset.tarjeta, "t3rc-a3");
  } finally { m.desmontar(); }
});

test("★★★ «Comprobar» solo con todas decididas; bien: «Correcto» en cada renglón, el acierto y el puente sin punteado", async () => {
  let completado = null;
  const m = await montar({ version: "B", onCompletar: (pct, ms, detalle) => { completado = { pct, detalle }; } });
  try {
    for (const [k, f] of CASO_B.fichas.entries()) {
      assert.equal(m.caja.querySelector("[data-comprobar]"), null, `paso ${k + 1}`);
      await elegir(m.caja, f.va);
    }
    assert.equal(estado(m.caja), "lista");
    assert.equal(m.caja.querySelector("[data-tarjeta]"), null);
    await tocar(m.caja.querySelector("[data-comprobar]"));
    assert.equal(estado(m.caja), "bien");
    assert.equal(m.caja.querySelector("[data-ranura]"), null);
    const renglones = [...m.caja.querySelectorAll("[data-renglon-lista]")];
    assert.deepEqual(renglones.map((x) => x.dataset.renglonLista), CASO_B.fichas.map((f) => f.id));
    assert.ok(renglones.every((x) => x.dataset.estado === "ok" && x.textContent.includes("Correcto")));
    assert.equal(renglones[0].querySelector("button"), null, "bloqueada después de comprobar");
    assert.deepEqual(textos(m.caja), [CASO_B.acierto]);
    const puente = m.caja.querySelector("[data-puente]");
    assert.equal(puente.getAttribute("role"), "img");
    assert.equal(puente.getAttribute("aria-label"), "De $1.541.000 a la caja $6.800.000; con tus respuestas daba $6.800.000");
    assert.equal(puente.querySelectorAll("[data-renglon]").length, 7);
    assert.equal(puente.querySelector("[data-punteado]"), null);
    assert.equal(puente.querySelector("[data-cifra-suya]"), null);
    assert.equal(puente.querySelector("[data-leyenda]"), null);
    assert.deepEqual([...puente.querySelectorAll("[data-cifra]")].map((x) => x.textContent),
      ["$1.541.000", "+$5.000.000", "+$2.000.000", "−$600.000", "−$1.900.000", "+$759.000", "$6.800.000"]);
    assert.equal(m.caja.querySelector("[data-siguiente]").textContent, "Ver mi resumen");
    assert.equal(completado, null);
    await tocar(m.caja.querySelector("[data-siguiente]"));
    assert.equal(estado(m.caja), "resumen");
    assert.equal(Math.round(completado.pct), 100);
    assert.equal(completado.detalle.length, 6);
    assert.equal(m.caja.querySelector("[data-cierre-texto]").textContent, D.CIERRE_RESULTADO_CAJA);
    assert.ok(m.caja.querySelector("[data-puente]"));
  } finally { m.desmontar(); localStorage.clear(); }
});

test("★★★ mal: coral, «No va aquí», «Iba aquí: …» a los 0,7 s, el punteado con su leyenda y la cifra de sus respuestas", async () => {
  reducir = false;
  const m = await montar({ version: "A" });
  try {
    const [, a2] = CASO_A.fichas.map((f) => f.id);
    await jugar(m.caja, CASO_A, { [a2]: SUMA });
    await tocar(m.caja.querySelector("[data-comprobar]"));
    assert.equal(estado(m.caja), "mal");
    const malo = m.caja.querySelector(`[data-renglon-lista="${a2}"]`);
    assert.equal(malo.dataset.estado, "mal");
    assert.match(malo.textContent, /No va aquí/);
    assert.equal(malo.querySelector("[data-iba]"), null);
    await esperar(750);
    assert.equal(malo.querySelector("[data-iba]").textContent, "Iba aquí: No mueve la caja");
    assert.deepEqual(textos(m.caja), [CASO_A.fichas[1].error]);
    const puente = m.caja.querySelector("[data-puente]");
    assert.ok(puente.querySelector("[data-punteado]"));
    assert.equal(puente.querySelector("[data-cifra-suya]").textContent, "$19.650");
    assert.equal(puente.querySelectorAll("[data-leyenda]").length, 1);
    assert.equal(puente.querySelector("[data-leyenda]").dataset.leyenda, "punteado");
    assert.equal(puente.querySelector("[data-leyenda]").textContent, "Punteado: así quedaba con tus respuestas");
    /* Kamogawa, #557: la ficha que no mueve la caja, sumada, lleva su renglón tenue. */
    assert.deepEqual([...puente.querySelectorAll("[data-renglon-tenue]")].map((x) => x.textContent), ["Equipo aportado+$5.000 (tu respuesta)"]);
    assert.equal(puente.getAttribute("aria-label"), "De $3.950 a la caja $14.650; con tus respuestas daba $19.650");
    /* El puente se arma solo en el navegador (IntersectionObserver); un toque lo deja en el estado final. */
    await tocar(puente);
    assert.equal(puente.dataset.armando, "no");
  } finally { m.desmontar(); reducir = true; }
});

test("★★★ A7: si la caja de sus respuestas es negativa, no hay punteado; queda solo la cifra con su signo", async () => {
  const m = await montar({ version: "A" });
  try {
    const [a1] = CASO_A.fichas.map((f) => f.id);
    await jugar(m.caja, CASO_A, { [a1]: NO_MUEVE });
    await tocar(m.caja.querySelector("[data-comprobar]"));
    const puente = m.caja.querySelector("[data-puente]");
    assert.equal(puente.querySelector("[data-punteado]"), null);
    assert.equal(puente.querySelector("[data-cifra-suya]").textContent, "−$350");
    assert.equal(puente.getAttribute("aria-label"), "De $3.950 a la caja $14.650; con tus respuestas daba −$350");
    /* Kamogawa, #557: la frase va pegada a la cifra; nada promete una línea. */
    assert.equal(puente.querySelectorAll("[data-leyenda]").length, 1);
    assert.equal(puente.querySelector("[data-leyenda]").dataset.leyenda, "negativa");
    assert.equal(puente.querySelector("[data-leyenda]").textContent, "Con tus respuestas, la caja daba −$350");
    assert.doesNotMatch(puente.textContent, /Punteado/);
    /* Con movimiento reducido, «Iba aquí» llega al instante. */
    assert.ok(m.caja.querySelector(`[data-renglon-lista="${a1}"] [data-iba]`));
  } finally { m.desmontar(); }
});

/* ═══════════ LA LEYENDA, EN SUS TRES CASOS (Kamogawa, #557) ═══════════ */

test("★★★ leyendaDe: punteado si falló con caja ≥ 0, negativa si < 0, ninguna si cuadra (bien o con errores)", () => {
  const [a1, a2, , a4] = CASO_A.fichas.map((f) => f.id);
  const suya = (caso, c) => L.cajaDe(caso, respuestasDe(caso, c));
  assert.equal(L.leyendaDe(CASO_A, suya(CASO_A, {})), null);
  assert.equal(L.leyendaDe(CASO_A, suya(CASO_A, { [a2]: SUMA })), "punteado");
  assert.equal(L.leyendaDe(CASO_A, suya(CASO_A, { [a1]: NO_MUEVE })), "negativa");
  assert.equal(L.leyendaDe(CASO_A, suya(CASO_A, { [a2]: SUMA, [a4]: RESTA })), null);
  const [b1] = CASO_B.fichas.map((f) => f.id);
  assert.equal(suya(CASO_B, { [b1]: RESTA }), -3200000);
  assert.equal(L.leyendaDe(CASO_B, suya(CASO_B, { [b1]: RESTA })), "negativa");
  assert.equal(L.leyendaDe(CASO_B, CASO_B.caja), null);
});

test("★★★ renglonesDelPuente con respuestas: renglón tenue solo para la ficha que no mueve y el estudiante movió", () => {
  const [, a2] = CASO_A.fichas.map((f) => f.id);
  assert.equal(L.renglonesDelPuente(CASO_A, "Caja al cierre", respuestasDe(CASO_A)).filter((f) => f.tenue).length, 0);
  assert.deepEqual(L.renglonesDelPuente(CASO_A, "Caja al cierre", respuestasDe(CASO_A, { [a2]: RESTA })).filter((f) => f.tenue),
    [{ id: a2, nombre: "Equipo aportado", signo: -1, monto: 5000, tenue: true }]);
  /* La cascada correcta no cambia: el tenue no tiene tramo. */
  const sin = L.renglonesDelPuente(CASO_A, "Caja al cierre");
  const con = L.renglonesDelPuente(CASO_A, "Caja al cierre", respuestasDe(CASO_A, { [a2]: SUMA })).filter((f) => !f.tenue);
  assert.deepEqual(con, sin);
  const b6 = CASO_B.fichas[5].id;
  assert.deepEqual(L.renglonesDelPuente(CASO_B, "Caja al cierre", respuestasDe(CASO_B, { [b6]: SUMA })).filter((f) => f.tenue).map((f) => f.nombre),
    ["Equipo comprado a crédito"]);
});

test("★★★ cuadra con errores (A: Equipo en Suma y Alquiler en Resta): sin punteado, sin cifra y sin leyenda; el renglón tenue sí", async () => {
  const m = await montar({ version: "A" });
  try {
    const [, a2, , a4] = CASO_A.fichas.map((f) => f.id);
    await jugar(m.caja, CASO_A, { [a2]: SUMA, [a4]: RESTA });
    await tocar(m.caja.querySelector("[data-comprobar]"));
    assert.equal(estado(m.caja), "mal");
    assert.equal(textos(m.caja)[0], D.ERROR_CUADRA_CON_ERRORES);
    const puente = m.caja.querySelector("[data-puente]");
    assert.equal(puente.querySelector("[data-punteado]"), null);
    assert.equal(puente.querySelector("[data-cifra-suya]"), null);
    assert.equal(puente.querySelector("[data-leyenda]"), null);
    assert.equal(puente.querySelector("[data-renglon-tenue]").textContent, "Equipo aportado+$5.000 (tu respuesta)");
  } finally { m.desmontar(); }
});

test("★★★ cuadra con errores en B (tres mal): sin leyenda; caja negativa en B: «Con tus respuestas, la caja daba −$3.200.000»", async () => {
  const ids = CASO_B.fichas.map((f) => f.id);
  /* El primer caso que cuadra con tres mal, buscado entre todas las respuestas. */
  let cambios = null;
  const prueba = (k, c) => {
    if (cambios) return;
    if (k === ids.length) {
      const e = L.evaluarResultadoCaja(CASO_B, respuestasDe(CASO_B, c));
      if (e.cuadra && e.mal.length === 3) cambios = { ...c };
      return;
    }
    for (const x of [SUMA, RESTA, NO_MUEVE]) prueba(k + 1, { ...c, [ids[k]]: x });
  };
  prueba(0, {});
  assert.ok(cambios);
  let m = await montar({ version: "B" });
  try {
    await jugar(m.caja, CASO_B, cambios);
    await tocar(m.caja.querySelector("[data-comprobar]"));
    const puente = m.caja.querySelector("[data-puente]");
    assert.equal(puente.querySelector("[data-punteado]"), null);
    assert.equal(puente.querySelector("[data-cifra-suya]"), null);
    assert.equal(puente.querySelector("[data-leyenda]"), null);
  } finally { m.desmontar(); }
  m = await montar({ version: "B" });
  try {
    await jugar(m.caja, CASO_B, { [ids[0]]: RESTA });
    await tocar(m.caja.querySelector("[data-comprobar]"));
    const puente = m.caja.querySelector("[data-puente]");
    assert.equal(puente.querySelector("[data-punteado]"), null);
    assert.equal(puente.querySelector("[data-leyenda]").dataset.leyenda, "negativa");
    assert.equal(puente.querySelector("[data-leyenda]").textContent, "Con tus respuestas, la caja daba −$3.200.000");
  } finally { m.desmontar(); }
});

/*
 * A6 en las dos versiones, por recorrido completo (Kamogawa, #557): se busca
 * entre todas las respuestas la que cuadra con n fichas mal, se juega ficha
 * por ficha en la pieza montada y se comprueba. A6 va primero, con el número
 * en palabras; después, los errores de las dos primeras mal puestas, y «Y hay
 * más fichas por revisar.» si son más de dos. Sin punteado ni leyenda.
 */
const cuadraCon = (caso, n) => {
  const ids = caso.fichas.map((f) => f.id);
  let hallado = null;
  const rec = (k, c) => {
    if (hallado) return;
    if (k === ids.length) {
      const e = L.evaluarResultadoCaja(caso, respuestasDe(caso, c));
      if (e.cuadra && e.mal.length === n) hallado = { ...c };
      return;
    }
    for (const x of [SUMA, RESTA, NO_MUEVE]) rec(k + 1, { ...c, [ids[k]]: x });
  };
  rec(0, {});
  return hallado;
};
for (const [version, n, palabra] of [["A", 2, "dos"], ["B", 3, "tres"], ["B", 4, "cuatro"]]) {
  test(`★★★ A6 montada, recorrido completo: ${version} con ${n} fichas mal dice «${palabra}» y después los errores`, async () => {
    const caso = L.casoDe(version);
    const cambios = cuadraCon(caso, n);
    assert.ok(cambios, `hay una respuesta de ${version} que cuadra con ${n} mal`);
    const m = await montar({ version });
    try {
      await jugar(m.caja, caso, cambios);
      await tocar(m.caja.querySelector("[data-comprobar]"));
      assert.equal(estado(m.caja), "mal");
      const mal = caso.fichas.filter((f) => respuestasDe(caso, cambios)[f.id] !== f.va);
      assert.equal(mal.length, n);
      const esperados = [
        `Llegaste a la caja correcta, pero con ${palabra} fichas mal puestas: sus errores se cancelaron.`,
        ...mal.slice(0, 2).map((f) => f.error),
        ...(n > 2 ? [D.VARIOS_ERRORES] : []),
      ];
      assert.deepEqual(textos(m.caja), esperados);
      const puente = m.caja.querySelector("[data-puente]");
      assert.equal(puente.querySelector("[data-punteado]"), null);
      assert.equal(puente.querySelector("[data-cifra-suya]"), null);
      assert.equal(puente.querySelector("[data-leyenda]"), null);
    } finally { m.desmontar(); }
  });
}

test("★★★ A1: A en los intentos impares y B en los pares, contados al terminar; la puntuación es por ficha", async () => {
  localStorage.clear();
  let pct = null;
  const m = await montar({ onCompletar: (p) => { pct = p; } });
  try {
    assert.equal(m.caja.querySelector("[data-resultado-caja]").dataset.version, "A");
    assert.equal(m.caja.querySelector("[data-empresa]").textContent, "San Calixto");
    await jugar(m.caja, CASO_A, { [CASO_A.fichas[3].id]: NO_MUEVE });
    await tocar(m.caja.querySelector("[data-comprobar]"));
    await tocar(m.caja.querySelector("[data-siguiente]"));
    assert.equal(pct, 75);
    const otra = [...m.caja.querySelectorAll("button")].find((b) => b.textContent.trim() === "Otra vez");
    await tocar(otra);
    assert.equal(m.caja.querySelector("[data-resultado-caja]").dataset.version, "B");
    assert.equal(m.caja.querySelector("[data-empresa]").textContent, "Estudio Foco");
    assert.equal(m.caja.querySelector("[data-paso]").textContent, "Paso 1 de 6");
    assert.equal(m.caja.querySelector("[data-cita]"), null);
  } finally { m.desmontar(); localStorage.clear(); }
});

test("★★ la demo: la panadería, una ficha; al tocar «Resta» sale la resolución y no llama a onCompletar", async () => {
  let llamado = false;
  const m = await montar({ modoDemo: true, caso: D.EJEMPLO_RESULTADO_CAJA, onCompletar: () => { llamado = true; } });
  try {
    assert.equal(m.caja.querySelector("[data-encabezado-hacer]"), null);
    assert.equal(m.caja.querySelector("[data-paso]").textContent, "Paso 1 de 1");
    await elegir(m.caja, RESTA);
    assert.deepEqual(textos(m.caja), [D.EJEMPLO_RESULTADO_CAJA.acierto]);
    assert.equal(m.caja.querySelector("[data-puente]"), null);
    assert.equal(llamado, false);
  } finally { m.desmontar(); }
});

/* ═══════════ EN EL TEMA ═══════════ */

test("★★★ va en el camino de T3 detrás de «Cerrar el periodo» y antes de «El cierre completo», Difícil de 50 FP, y la vista la abre", () => {
  const tema = SUBJECTS.contabilidad.topics.find((t) => t.id === "ingresos-gastos-y-caja");
  const ids = tema.actividades.map((a) => a.id);
  assert.equal(ids[ids.indexOf("t3-a5-cerrar-el-periodo") + 1], "t3-del-resultado-a-la-caja");
  assert.equal(ids[ids.indexOf("t3-del-resultado-a-la-caja") + 1], "t3-cierre-completo");
  const a = tema.actividades.find((x) => x.id === "t3-del-resultado-a-la-caja");
  assert.deepEqual(a.clasificacion, { tipo: HACER, modalidad: "evaluativa", dificultad: "dificil", fpBase: 50 });
  assert.ok(JUEGOS.some((j) => j.id === "t3-del-resultado-a-la-caja" && j.Mecanica === ResultadoCaja));
  /* No reordena nada: las demás siguen en su orden relativo. */
  assert.deepEqual(ids.filter((x) => x !== "t3-del-resultado-a-la-caja"), [
    "t3-a1-vender-no-es-cobrar", "t3-ingreso-o-cobro", "t3-gasto-o-pago", "t3-a3-lo-que-ya-paso", "t3-a4-lo-que-ya-se-pago", "t3-cuando-se-causa",
    "t3-ajuste-acumulado", "t3-ajuste-diferido", "t3-mismo-hecho", "t3-que-le-toca", "t3-a5-cerrar-el-periodo", "t3-cierre-completo",
  ]);
});

test("★★★ su fila del catálogo es la 0257, del rango de E, y solo agrega", () => {
  const dir = new URL("../../../supabase/migrations/", import.meta.url);
  const nombres = readdirSync(dir).filter((n) => readFileSync(new URL(n, dir), "utf8").includes("'t3-del-resultado-a-la-caja'"));
  assert.deepEqual(nombres, ["0257_t3_del_resultado_a_la_caja.sql"]);
  const sql = readFileSync(new URL(nombres[0], dir), "utf8");
  assert.match(sql, /\('t3-del-resultado-a-la-caja', 'contabilidad', 'ingresos-gastos-y-caja', 'evaluativa', 'dificil', 50, 1\)\s*on conflict \(activity_id\) do nothing;/);
  const sinComentarios = sql.split("\n").map((l) => l.replace(/--.*$/, "")).join("\n");
  assert.doesNotMatch(sinComentarios, /\b(alter|drop|truncate|delete|update|grant|revoke)\b/i);
});

test("★★ el panel docente nombra cada ficha, el Repaso le da «Resultado y caja» y «Así se juega» trae la panadería", () => {
  for (const f of [...CASO_A.fichas, ...CASO_B.fichas]) {
    const e = etiquetaDeItem("t3-del-resultado-a-la-caja", f.id);
    assert.ok(e && e.includes(f.nombre) && e.length <= 70, `${f.id}: ${e}`);
  }
  assert.equal(etiquetaDeItem("t3-del-resultado-a-la-caja", "t3rc-b3"), "Estudio Foco · Arriendo abril–junio, por anticipado, $600.000");
  assert.equal(clavesDe("t3-del-resultado-a-la-caja").length, 10);
  assert.equal(subtemaDeT3("t3-del-resultado-a-la-caja", "t3rc-a1"), "Resultado y caja");
  const asi = ASI_SE_JUEGA["t3-del-resultado-a-la-caja"];
  assert.ok(asi);
  assert.deepEqual(asi.pasos, D.PASOS_RESULTADO_CAJA);
  assert.deepEqual(asi.demo, { caso: D.EJEMPLO_RESULTADO_CAJA });
  assert.equal(asi.guion.toques[0].en, '[data-eleccion="resta"]');
});
