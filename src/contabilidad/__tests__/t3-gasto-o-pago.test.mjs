import { test } from "node:test";
import assert from "node:assert/strict";
import { readFileSync, readdirSync } from "node:fs";
import { JSDOM, VirtualConsole } from "jsdom";

/*
 * ═══════════════════════════════════════════════════════════════════════════
 * TEMA 3 · «¿Gasto o pago?» (paquete e3-t3-gasto-o-pago-v3, C1 a C6).
 *
 *   · los textos literales: C1, C2, C3, §2, §3, §4 y §5
 *   · el sorteo: seis, siempre el «ni-ni» y uno de cada tipo
 *   · qué error toca: A y B por el gasto, C y D por la plata; hasta dos, en ese orden
 *   · la escala de Takamura (2.210.000 y 2.990.000) y el monto menor ≥ 4 px
 *   · montada: un toque califica; solo se mueven los contadores de la casilla;
 *     en «ni-ni» ninguno; al fallar, la casilla en coral, «Iba aquí» a los
 *     0,7 s y la barra punteada con la leyenda única
 *   · A y B se alternan por intento (C5); sin pie
 *   · en el camino detrás de «¿Ingreso o cobro?», con su fila 0256, su
 *     etiqueta en el panel docente y su subtema del Repaso
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

const D = await import("../../data/contabilidadTema3GastoOPago.js");
const L = await import("../gastoOPago.js");
const { SUBJECTS, HACER } = await import("../../data/subjects.js");
const { default: GastoOPago } = await import("../../components/mecanicas/libros/tema3/GastoOPago.jsx");
const { JUEGOS } = await import("../../components/ContabilidadTema3View.jsx");
const { etiquetaDeItem } = await import("../../docente/etiquetasItem.js");
const { subtemaDeT3, clavesDe } = await import("../../data/subtemasContabilidadT3.js");
const { ASI_SE_JUEGA } = await import("../../data/asiSeJuega.js");

const { GS, G, S, NN } = D;
const Marco = ({ children }) => h("div", null, children);
const sinBarajar = (xs) => [...xs];
const porId = (id) => [...D.BANCO_A, ...D.BANCO_B].find((x) => x.id === id);

const montar = async (props = {}) => {
  const caja = document.createElement("div");
  document.body.appendChild(caja);
  const raiz = createRoot(caja);
  await act(async () => { raiz.render(h(GastoOPago, { Marco, ...props })); });
  return { caja, desmontar: () => { act(() => raiz.unmount()); caja.remove(); } };
};
const tocar = async (el) => { await act(async () => { el.dispatchEvent(new w.MouseEvent("click", { bubbles: true })); }); };
const casilla = (caja, id) => caja.querySelector(`[data-casilla="${id}"]`);
const total = (caja, id) => caja.querySelector(`[data-contador="${id}"] [data-total]`).textContent;
const textos = (caja) => [...caja.querySelectorAll("[data-parrafo-devolucion]")].map((p) => p.textContent);
const esperar = async (ms) => { await act(async () => { await new Promise((r) => setTimeout(r, ms)); }); };

/* ═══════════ LOS TEXTOS, LITERALES ═══════════ */

test("★★★ catálogo, consigna (C1), pasos, cierre, rótulos (C2) y leyenda (C3), literales", () => {
  assert.deepEqual([D.ACT_GASTO_O_PAGO.id, D.ACT_GASTO_O_PAGO.nombre, D.ACT_GASTO_O_PAGO.dificultad, D.ACT_GASTO_O_PAGO.fpBase, D.ACT_GASTO_O_PAGO.porPartida],
    ["t3-gasto-o-pago", "¿Gasto o pago?", "medio", 25, 6]);
  assert.equal(D.ACT_GASTO_O_PAGO.consigna, "Lee el hecho. Toca la casilla que dice si hubo gasto y si salió plata.");
  assert.deepEqual(D.PASOS_GASTO_O_PAGO, [
    "Pregúntate si la empresa ya consumió algo para poder vender.",
    "Pregúntate si ese día salió plata de la caja.",
    "Toca la casilla donde caen tus dos respuestas.",
  ]);
  assert.equal(D.CIERRE_GASTO_O_PAGO, "Gastar es consumir; pagar es sacar plata. Unas veces pasan el mismo día y otras no.");
  assert.deepEqual([D.ROTULO_GASTO, D.ROTULO_SIN_GASTO, D.ROTULO_SALIDA, D.ROTULO_SIN_SALIDA], ["Gastos", "Sin gasto", "Salió", "No salió"]);
  assert.equal(D.INTERFAZ_GASTO_O_PAGO.leyendaPunteada, "Punteado: así quedaba con tu toque");
  assert.equal(D.INTERFAZ_GASTO_O_PAGO.contador(3, 6), "Hecho 3 de 6");
  assert.deepEqual([D.INTERFAZ_GASTO_O_PAGO.siguiente, D.INTERFAZ_GASTO_O_PAGO.verMiResumen], ["Siguiente hecho", "Ver mi resumen"]);
});

test("★★★ los dos bancos de §3: ocho hechos cada uno, todos «Escenario simulado», ≤ 90 caracteres, con su tipo y porQue", () => {
  const tabla = {
    A: [[GS, null], [GS, null], [GS, null], [G, null], [G, null], [S, "tiene"], [S, "deuda"], [NN, "tiene"]],
    B: [[GS, null], [GS, null], [GS, null], [G, null], [S, "tiene"], [S, "deuda"], [S, "prestamo"], [NN, "tiene"]],
  };
  for (const [v, banco] of [["A", D.BANCO_A], ["B", D.BANCO_B]]) {
    assert.equal(banco.length, 8);
    assert.deepEqual(banco.map((x) => [x.tipo, x.porQue]), tabla[v], v);
    for (const x of banco) {
      assert.match(x.texto, /^Escenario simulado\. /, x.id);
      assert.ok(x.texto.length <= 90, `${x.id}: ${x.texto.length} caracteres`);
      /* El monto es la cifra que dice el hecho. */
      assert.ok(x.texto.includes(L.pesos(x.monto)), `${x.id}: ${L.pesos(x.monto)}`);
    }
  }
  assert.equal(porId("t3gp-a1").texto, "Escenario simulado. Le pagó a la asistente $450.000 por su trabajo de mayo.");
  assert.equal(porId("t3gp-b7").acierto, "Salió plata, pero no consumió nada. Solo bajó lo que le debe al banco.");
});

test("★★★ la escala de Takamura: A 1.140.000 / 1.500.000 / 2.210.000 y B 1.300.000 / 2.290.000 / 2.990.000", () => {
  const sumas = (banco) => ({ gastos: L.contadores(banco).gastos, salio: L.contadores(banco).salio });
  assert.deepEqual(sumas(D.BANCO_A), { gastos: 1140000, salio: 1500000 });
  assert.deepEqual(sumas(D.BANCO_B), { gastos: 1300000, salio: 2290000 });
  assert.equal(L.escalaDe("A"), 2210000);
  assert.equal(L.escalaDe("B"), 2990000);
  /* El monto menor mueve al menos 4 px en la barra de 113 px a 320 (E11). */
  for (const v of ["A", "B"]) {
    const menor = Math.min(...L.bancoDe(v).banco.map((x) => x.monto));
    assert.ok((menor / L.escalaDe(v)) * 113 >= 4, v);
  }
});

/* ═══════════ EL SORTEO ═══════════ */

test("★★★ cada partida trae seis distintos, siempre el «ni-ni» y al menos uno de cada tipo, de su versión", () => {
  for (const v of ["A", "B"]) {
    for (let k = 0; k < 300; k++) {
      const p = L.sortearGastoOPago((xs) => [...xs].sort(() => Math.random() - 0.5), v);
      assert.equal(p.length, 6);
      assert.equal(new Set(p.map((x) => x.id)).size, 6);
      for (const tipo of [GS, G, S, NN]) assert.ok(p.some((x) => x.tipo === tipo), `${v}: falta ${tipo}`);
      assert.ok(p.every((x) => x.id.startsWith(`t3gp-${v.toLowerCase()}`)));
    }
  }
});

/* ═══════════ QUÉ ERROR TOCA (C4) ═══════════ */

test("★★★ los errores de Miyata, con sus variantes; primero el de gasto y después el de plata", () => {
  const E = D.ERRORES_GASTO_O_PAGO;
  /* G (a4) tocado en «ni-ni»: A de tipo G. */
  assert.deepEqual(L.evaluarGastoOPago(porId("t3gp-a4"), NN).textos, [E.A[G]]);
  /* G+S (a1) tocado en «ni-ni»: A de tipo G+S y D. */
  assert.deepEqual(L.evaluarGastoOPago(porId("t3gp-a1"), NN).errores, ["A", "D"]);
  assert.deepEqual(L.evaluarGastoOPago(porId("t3gp-a1"), NN).textos, [E.A[GS], E.D]);
  /* S por deuda (a7) tocado en G+S: B de deuda. */
  assert.deepEqual(L.evaluarGastoOPago(porId("t3gp-a7"), GS).textos, [E.B.deuda]);
  /* S por préstamo (b7) tocado en G: B de préstamo y D. */
  assert.deepEqual(L.evaluarGastoOPago(porId("t3gp-b7"), G).textos, [E.B.prestamo, E.D]);
  /* G (b4) tocado en S: A de tipo G y C de tipo G. */
  assert.deepEqual(L.evaluarGastoOPago(porId("t3gp-b4"), S).textos, [E.A[G], E.C[G]]);
  /* «ni-ni» (a8) tocado en G+S: B de «tiene» y C de «ni-ni». */
  assert.deepEqual(L.evaluarGastoOPago(porId("t3gp-a8"), GS).textos, [E.B.tiene, E.C[NN]]);
  /* Acierto: el texto de acierto del hecho, solo. */
  assert.deepEqual(L.evaluarGastoOPago(porId("t3gp-a8"), NN), { ok: true, correcta: NN, errores: [], textos: [porId("t3gp-a8").acierto] });
  /* Ningún texto de error queda vacío en ningún toque posible. */
  for (const x of [...D.BANCO_A, ...D.BANCO_B]) for (const c of [GS, G, S, NN]) {
    const r = L.evaluarGastoOPago(x, c);
    assert.ok(r.textos.length >= 1 && r.textos.length <= 2 && r.textos.every((t) => typeof t === "string" && t.length > 0), `${x.id}/${c}`);
  }
  assert.equal(E.D, "Sí salió plata: el hecho dice que pagó.");
});

/* ═══════════ MONTADA ═══════════ */

const partida = [porId("t3gp-a4"), porId("t3gp-a8"), porId("t3gp-a1"), porId("t3gp-a6"), porId("t3gp-a2"), porId("t3gp-a5")];

test("★★★ vacío: consigna, «Hecho 1 de 6», la empresa, el hecho sin pie y cuatro casillas con su nombre de dos rótulos", async () => {
  const m = await montar({ items: partida, version: "A" });
  try {
    assert.equal(m.caja.querySelector("[data-consigna]").textContent, D.ACT_GASTO_O_PAGO.consigna);
    assert.equal(m.caja.querySelector("[data-progreso]").textContent, "Hecho 1 de 6");
    assert.equal(m.caja.querySelector("[data-empresa]").textContent, "Peluquería Doña Inés");
    assert.equal(m.caja.querySelector("[data-hecho]").textContent, partida[0].texto);
    assert.equal(m.caja.querySelector("[data-cita]"), null);
    assert.deepEqual([...m.caja.querySelectorAll("[data-casilla]")].map((b) => b.getAttribute("aria-label")),
      ["Gastos y No salió", "Gastos y Salió", "Sin gasto y No salió", "Sin gasto y Salió"]);
    assert.equal(m.caja.querySelector("[data-comprobar]"), null);
    assert.equal(m.caja.querySelector("[data-siguiente]"), null);
    assert.deepEqual([total(m.caja, "gastos"), total(m.caja, "salio")], ["$0", "$0"]);
  } finally { m.desmontar(); }
});

test("★★★ bien: un toque califica, la ficha cae ahí y solo se mueve el contador que esa casilla toca", async () => {
  const m = await montar({ items: partida, version: "A" });
  try {
    await tocar(casilla(m.caja, G));
    assert.equal(casilla(m.caja, G).dataset.estado, "ok");
    assert.equal(casilla(m.caja, G).querySelector("[data-veredicto]").textContent, "Correcto");
    assert.ok(casilla(m.caja, G).querySelector('[data-ficha-caida="1"]'));
    assert.deepEqual([total(m.caja, "gastos"), total(m.caja, "salio")], ["$200.000", "$0"]);
    assert.deepEqual(textos(m.caja), ["Correcto. " + partida[0].acierto]);
    assert.equal(m.caja.querySelector("[data-siguiente]").textContent, "Siguiente hecho");
    /* Un segundo toque no cambia nada. */
    await tocar(casilla(m.caja, GS));
    assert.equal(casilla(m.caja, GS).dataset.estado, "reposo");
    /* «ni-ni» bien: no se mueve ningún contador. */
    await tocar(m.caja.querySelector("[data-siguiente]"));
    assert.equal(m.caja.querySelector("[data-progreso]").textContent, "Hecho 2 de 6");
    await tocar(casilla(m.caja, NN));
    assert.deepEqual([total(m.caja, "gastos"), total(m.caja, "salio")], ["$200.000", "$0"]);
    /* La ficha anterior sigue en su casilla, ya no en curso. */
    assert.equal(casilla(m.caja, G).querySelector('[data-ficha-caida="1"]').dataset.enCurso, "no");
  } finally { m.desmontar(); }
});

test("★★★ mal con movimiento reducido: todo a la vez, coral, «Iba aquí», la barra punteada con la leyenda y dos textos", async () => {
  reducir = true;
  const m = await montar({ items: partida, version: "A" });
  try {
    /* a4 es G: tocar G+S marca salida de más (C) y el contador de Salió habría sido 200.000. */
    await tocar(casilla(m.caja, GS));
    assert.equal(casilla(m.caja, GS).dataset.estado, "mal");
    assert.equal(casilla(m.caja, GS).querySelector("[data-veredicto]").textContent.includes("No va aquí"), true);
    assert.equal(casilla(m.caja, G).dataset.estado, "revelada");
    assert.equal(casilla(m.caja, G).querySelector("[data-veredicto]").textContent, "Iba aquí");
    assert.ok(casilla(m.caja, G).querySelector('[data-ficha-caida="1"]'), "la ficha pasó a la correcta");
    assert.deepEqual([total(m.caja, "gastos"), total(m.caja, "salio")], ["$200.000", "$0"]);
    const salio = m.caja.querySelector('[data-contador="salio"]');
    assert.ok(salio.querySelector("[data-punteada]"));
    assert.equal(salio.querySelector("[data-cifra-punteada]").textContent, "$200.000");
    assert.equal(m.caja.querySelector('[data-contador="gastos"] [data-punteada]'), null, "Gastos no cambia: sin punteada");
    assert.equal(m.caja.querySelector("[data-leyenda]").style.visibility, "visible");
    assert.deepEqual(textos(m.caja), ["Incorrecto. " + D.ERRORES_GASTO_O_PAGO.C[G]]);
  } finally { m.desmontar(); }
});

test("★★★ mal con movimiento: la ficha cae en la tocada, «Iba aquí» a los 0,7 s y la corrección a los 0,9 s", async () => {
  reducir = false;
  const m = await montar({ items: partida, version: "A" });
  try {
    await tocar(casilla(m.caja, NN));
    assert.equal(casilla(m.caja, NN).dataset.estado, "mal");
    assert.ok(casilla(m.caja, NN).querySelector('[data-ficha-caida="1"]'));
    assert.equal(casilla(m.caja, G).dataset.estado, "reposo");
    await esperar(750);
    assert.equal(casilla(m.caja, G).dataset.estado, "revelada");
    assert.ok(casilla(m.caja, NN).querySelector('[data-ficha-caida="1"]'), "a los 0,75 s sigue en la tocada");
    await esperar(250);
    assert.ok(casilla(m.caja, G).querySelector('[data-ficha-caida="1"]'), "a los 0,9 s ya pasó a la correcta");
    assert.ok(m.caja.querySelector('[data-contador="gastos"] [data-punteada]'));
  } finally { m.desmontar(); reducir = true; }
});

test("★★ un toque en la matriz durante la corrección salta al estado final", async () => {
  reducir = false;
  const m = await montar({ items: partida, version: "A" });
  try {
    await tocar(casilla(m.caja, NN));
    await tocar(casilla(m.caja, S));
    assert.equal(casilla(m.caja, G).dataset.estado, "revelada");
    assert.ok(casilla(m.caja, G).querySelector('[data-ficha-caida="1"]'));
  } finally { m.desmontar(); reducir = true; }
});

test("★★★ el resumen: todas las fichas en #B8C4D4, los contadores finales, el cierre de Miyata y el puntaje", async () => {
  let completado = null;
  const m = await montar({ items: partida, version: "A", onCompletar: (pct, ms, detalle) => { completado = { pct, detalle }; } });
  try {
    for (let k = 0; k < 6; k++) {
      /* Bien todos menos el tercero (a1, G+S), que se toca en G. */
      await tocar(casilla(m.caja, k === 2 ? G : partida[k].tipo));
      const b = m.caja.querySelector("[data-siguiente]");
      assert.equal(b.textContent, k === 5 ? "Ver mi resumen" : "Siguiente hecho");
      await tocar(b);
    }
    assert.equal(m.caja.querySelector("[data-gasto-o-pago]").dataset.estadoPartida, "resumen");
    assert.equal(m.caja.querySelectorAll("[data-ficha-caida]").length, 6);
    assert.ok([...m.caja.querySelectorAll("[data-ficha-caida]")].every((f) => f.dataset.enCurso === "no"));
    const fin = L.contadores(partida);
    assert.deepEqual([total(m.caja, "gastos"), total(m.caja, "salio")], [L.pesos(fin.gastos), L.pesos(fin.salio)]);
    assert.equal(m.caja.querySelector("[data-cierre-texto]").textContent, D.CIERRE_GASTO_O_PAGO);
    assert.equal(Math.round(completado.pct), 83);
    assert.deepEqual(completado.detalle.map((d) => [d.item, d.ok, d.respuesta]),
      partida.map((x, k) => [x.id, k !== 2, k === 2 ? G : null]));
  } finally { m.desmontar(); }
});

test("★★★ C5: A en los intentos impares y B en los pares, contados al terminar", async () => {
  localStorage.clear();
  const m = await montar({});
  try {
    assert.equal(m.caja.querySelector("[data-gasto-o-pago]").dataset.version, "A");
    assert.equal(m.caja.querySelector("[data-empresa]").textContent, "Peluquería Doña Inés");
    for (let k = 0; k < 6; k++) {
      await tocar(casilla(m.caja, G));
      await tocar(m.caja.querySelector("[data-siguiente]"));
    }
    const otra = [...m.caja.querySelectorAll("button")].find((b) => b.textContent.trim() === "Otra vez");
    await tocar(otra);
    assert.equal(m.caja.querySelector("[data-gasto-o-pago]").dataset.version, "B");
    assert.equal(m.caja.querySelector("[data-empresa]").textContent, "Taller La Cadena");
    assert.ok(m.caja.querySelector("[data-ficha]").dataset.ficha.startsWith("t3gp-b"));
  } finally { m.desmontar(); localStorage.clear(); }
});

/* ═══════════ EN EL TEMA ═══════════ */

test("★★★ va en el camino de T3 justo detrás de «¿Ingreso o cobro?», Medio de 25 FP, y la vista la abre", () => {
  const tema = SUBJECTS.contabilidad.topics.find((t) => t.id === "ingresos-gastos-y-caja");
  const ids = tema.actividades.map((a) => a.id);
  assert.equal(ids[ids.indexOf("t3-ingreso-o-cobro") + 1], "t3-gasto-o-pago");
  const a = tema.actividades.find((x) => x.id === "t3-gasto-o-pago");
  assert.deepEqual(a.clasificacion, { tipo: HACER, modalidad: "evaluativa", dificultad: "medio", fpBase: 25 });
  assert.ok(JUEGOS.some((j) => j.id === "t3-gasto-o-pago" && j.Mecanica === GastoOPago));
  /* No reordena nada: las demás siguen en su orden relativo. */
  /* «Del resultado a la caja» (#555) entró después; tampoco reordena. */
  assert.deepEqual(ids.filter((x) => x !== "t3-gasto-o-pago" && x !== "t3-del-resultado-a-la-caja"), [
    "t3-a1-vender-no-es-cobrar", "t3-ingreso-o-cobro", "t3-a3-lo-que-ya-paso", "t3-a4-lo-que-ya-se-pago", "t3-cuando-se-causa",
    "t3-ajuste-acumulado", "t3-ajuste-diferido", "t3-mismo-hecho", "t3-que-le-toca", "t3-a5-cerrar-el-periodo", "t3-cierre-completo",
  ]);
});

test("★★★ su fila del catálogo es la 0256, del rango de E, y solo agrega", () => {
  const dir = new URL("../../../supabase/migrations/", import.meta.url);
  const nombres = readdirSync(dir).filter((n) => n.includes("t3-gasto-o-pago") || readFileSync(new URL(n, dir), "utf8").includes("'t3-gasto-o-pago'"));
  assert.deepEqual(nombres, ["0256_t3_gasto_o_pago.sql"]);
  const sql = readFileSync(new URL(nombres[0], dir), "utf8");
  assert.match(sql, /\('t3-gasto-o-pago', 'contabilidad', 'ingresos-gastos-y-caja', 'evaluativa', 'medio', 25, 1\)\s*on conflict \(activity_id\) do nothing;/);
  const sinComentarios = sql.split("\n").map((l) => l.replace(/--.*$/, "")).join("\n");
  assert.doesNotMatch(sinComentarios, /\b(alter|drop|truncate|delete|update|grant|revoke)\b/i);
});

test("★★ el panel docente nombra cada hecho, el Repaso le da «Gasto y pago» y «Así se juega» trae la panadería", () => {
  for (const x of [...D.BANCO_A, ...D.BANCO_B]) {
    const e = etiquetaDeItem("t3-gasto-o-pago", x.id);
    assert.ok(e && !e.startsWith("Escenario simulado") && e.length <= 70, `${x.id}: ${e}`);
  }
  assert.equal(clavesDe("t3-gasto-o-pago").length, 16);
  assert.equal(subtemaDeT3("t3-gasto-o-pago", "t3gp-a1"), "Gasto y pago");
  const asi = ASI_SE_JUEGA["t3-gasto-o-pago"];
  assert.ok(asi);
  assert.deepEqual(asi.pasos, D.PASOS_GASTO_O_PAGO);
  assert.deepEqual(asi.demo.items, [D.EJEMPLO_GASTO_O_PAGO]);
  assert.equal(D.EJEMPLO_GASTO_O_PAGO.texto, "Escenario simulado. Ya usó la harina del mes. La paga el otro mes: $300.000.");
  assert.equal(D.EJEMPLO_GASTO_O_PAGO.tipo, G);
});
