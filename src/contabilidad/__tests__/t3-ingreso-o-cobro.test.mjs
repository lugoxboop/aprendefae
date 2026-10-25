import { test } from "node:test";
import assert from "node:assert/strict";
import { readFileSync, readdirSync } from "node:fs";
import { JSDOM, VirtualConsole } from "jsdom";

/*
 * ═══════════════════════════════════════════════════════════════════════════
 * TEMA 3 · ACT. 1 — «¿Ingreso o cobro?».
 *
 *   · el texto de Gen, textual: consigna, pasos, rótulos, once hechos y los
 *     tres errores
 *   · el sorteo: nueve, tres de cada grupo, siempre
 *   · qué error toca: A, B o C según dónde iba y dónde lo puso
 *   · montada: la empresa a la vista, los tres grupos, el reintento
 *   · en el camino, después de la pieza 1; con su fila en el catálogo
 *   · T1-6 no se tocó
 *   · la segunda decisión del grupo 3 («¿qué es esa plata?»): textos de
 *     Katsumi, un toque, pastillas, «Iba aquí» a los 0,7 s, la retro del
 *     hecho después, cuenta solo con las dos bien y el detalle guarda las dos
 * ═══════════════════════════════════════════════════════════════════════════
 */

const dom = new JSDOM("<!doctype html><html><body></body></html>", { url: "http://localhost/", virtualConsole: new VirtualConsole() });
const w = dom.window;
w.matchMedia = (q) => ({ matches: q.includes("reduce"), addEventListener() {}, removeEventListener() {}, addListener() {}, removeListener() {} });
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

const A1 = await import("../../data/contabilidadTema3Act1.js");
const L = await import("../ingresoOCobro.js");
const { SUBJECTS, HACER, APRENDER } = await import("../../data/subjects.js");
const { default: IngresoOCobro } = await import("../../components/mecanicas/libros/tema3/IngresoOCobro.jsx");
const { JUEGOS } = await import("../../components/ContabilidadTema3View.jsx");
const { REGLAS } = await import("../../docente/etiquetasItem.js");

const { MISMO_DIA, DESPUES, SIN_INGRESO } = A1;
const Marco = ({ children }) => h("div", null, children);

const montar = async (props = {}) => {
  const caja = document.createElement("div");
  document.body.appendChild(caja);
  const raiz = createRoot(caja);
  await act(async () => { raiz.render(h(IngresoOCobro, { Marco, ...props })); });
  return { caja, desmontar: () => { act(() => raiz.unmount()); caja.remove(); } };
};
const tocar = async (el) => { await act(async () => { el.dispatchEvent(new w.MouseEvent("click", { bubbles: true })); }); };
const boton = (caja, texto) => [...caja.querySelectorAll("button")].find((b) => b.textContent.trim() === texto);
const grupo = (caja, id) => caja.querySelector(`[data-grupo="${id}"]`);
const retro = (caja) => [...caja.querySelectorAll('[role="status"]')].map((x) => x.textContent).join(" ");
const colocar = async (caja, id) => { await tocar(grupo(caja, id)); await tocar(boton(caja, "Colocar la ficha")); };
const opcion = (caja, id) => caja.querySelector(`[data-opcion-segunda="${id}"]`);
const esperar = async (ms) => { await act(async () => { await new Promise((r) => setTimeout(r, ms)); }); };
const mensaje = (caja) => caja.querySelector("[data-mensaje-segunda]");
const textosMensaje = (caja) => [...caja.querySelectorAll("[data-texto-mensaje]")].map((x) => x.textContent);
const delGrupo3 = A1.HECHOS_ACT1_T3.filter((x) => x.grupo === SIN_INGRESO);

/* ═══════════ EL TEXTO DE GEN, TEXTUAL ═══════════ */

test("★★★ consigna, pasos y los tres rótulos son los de Gen", () => {
  assert.equal(A1.ACT1_T3.consigna, "Lee el hecho. Toca el grupo que le corresponde.");
  assert.deepEqual(A1.PASOS_ACT1_T3, [
    "Pregúntate si la empresa vendió lo que ofrece: sus productos o sus servicios.",
    "Pregúntate si entró plata a la caja.",
    "Toca el grupo donde encajan las dos respuestas.",
  ]);
  assert.deepEqual(A1.GRUPOS.map((g) => g.rotulo), [
    "Es ingreso y entra el dinero",
    "Es ingreso, pero el dinero llega después",
    "Entra dinero, pero no es ingreso",
  ]);
  assert.equal(A1.ACT1_T3.fpBase, 10);
  assert.equal(A1.ACT1_T3.dificultad, "facil");
});

test("★★★ los once hechos: empresa, fuente, grupo y retroalimentación de Gen", () => {
  const filas = A1.HECHOS_ACT1_T3.map((x) => [x.grupo, x.empresa, x.texto, x.fuente, x.acierto]);
  assert.deepEqual(filas, [
    [MISMO_DIA, "San Calixto", "Recibió $5.000 por servicios prestados, 5 de enero", "p. 121", "Las dos cosas pasaron el mismo día: vendió el servicio y le pagaron."],
    [MISMO_DIA, "San Calixto", "Recibió de LCDV $3.000 por servicios prestados, 20 de enero", "p. 121", "Prestó el servicio y cobró de una. Ingreso y plata, el mismo día."],
    [MISMO_DIA, "Lavalimpio", "Los ingresos de la primera quincena fueron $3.900.000, todo de contado", "p. 131", "Prestó el servicio y le pagaron ahí mismo."],
    [MISMO_DIA, "Lavalimpio", "Los ingresos de la segunda quincena fueron $4.720.000, consignados el mismo día", "p. 131", "Mismo caso: prestó el servicio y la plata entró el mismo día."],
    [DESPUES, "San Calixto", "Envió a JCC una factura de $4.000 por servicios prestados, 12 de enero", "p. 121", "El servicio ya se prestó, así que hay ingreso. La plata todavía no ha entrado."],
    [DESPUES, "San Calixto", "Envió a MPS una factura de $2.800 por servicios prestados, 25 de enero", "p. 121", "El servicio ya se prestó, así que el ingreso ya existe y queda una cuenta por cobrar."],
    [DESPUES, "San Miguel", "Ya prestó el servicio de la máquina y no le han pagado los $2.500", "p. 142", "Prestó la máquina cinco días. El ingreso es suyo aunque no haya cobrado."],
    [SIN_INGRESO, "San Calixto", "Los socios abren la empresa con $15.000 en plata", "p. 121", "Entró plata, pero la empresa no vendió lo que ofrece. Es un aporte."],
    [SIN_INGRESO, "Compañía Cualquiera", "Vendió un computador por $15.000, su mismo valor", "pp. 129-130", "No vende computadores. Entregó uno y recibió su mismo valor en plata."],
    [SIN_INGRESO, "Lavalimpio", "Recibió un préstamo de $5.000.000 de una entidad financiera", "p. 131", "El banco le prestó. Entró plata y nació una deuda, no un ingreso."],
    [SIN_INGRESO, "Lavalimpio", "Se inicia el negocio con la venta de 5.000 acciones de $1.000, pagadas de contado", "p. 131", "Vender acciones no es vender lo que la empresa ofrece. Los accionistas pusieron plata: es un aporte, nunca un ingreso."],
  ]);
  assert.equal(new Set(A1.HECHOS_ACT1_T3.map((x) => x.id)).size, 11);
});

test("★★★ los tres errores de Gen", () => {
  assert.deepEqual(A1.ERRORES_ACT1_T3, {
    A: "Sí hubo ingreso: la empresa vendió lo que ofrece. Lo que cambia es cuándo entra la plata.",
    B: "Aquí no hubo ingreso. Entró plata, pero la empresa no vendió lo que ofrece.",
    C: "Fíjate en cuándo entra la plata. Si entró el mismo día, va en el primer grupo; si llega después, en el segundo.",
  });
});

/* ═══════════ EL SORTEO Y LA EVALUACIÓN ═══════════ */

test("★★★ cada tanda trae nueve hechos, tres de cada grupo, sin repetir", () => {
  const azar = (xs) => [...xs].sort(() => Math.random() - 0.5);
  for (let k = 0; k < 300; k++) {
    const tanda = L.sortearAct1T3(azar);
    assert.equal(tanda.length, 9);
    assert.equal(new Set(tanda.map((x) => x.id)).size, 9);
    for (const g of A1.GRUPOS) assert.equal(tanda.filter((x) => x.grupo === g.id).length, 3, g.id);
  }
});

test("★★★ qué error toca: A era ingreso → grupo 3; B no era ingreso → 1 o 2; C confundió 1 con 2", () => {
  const de = (g) => A1.HECHOS_ACT1_T3.find((x) => x.grupo === g);
  const casos = [
    [MISMO_DIA, SIN_INGRESO, "A"], [DESPUES, SIN_INGRESO, "A"],
    [SIN_INGRESO, MISMO_DIA, "B"], [SIN_INGRESO, DESPUES, "B"],
    [MISMO_DIA, DESPUES, "C"], [DESPUES, MISMO_DIA, "C"],
  ];
  for (const [era, puso, patron] of casos) {
    const r = L.evaluarAct1T3(de(era), puso);
    assert.equal(r.ok, false);
    assert.equal(r.patron, patron, `${era} → ${puso}`);
    assert.equal(r.texto, `❌ ${A1.ERRORES_ACT1_T3[patron]}`);
  }
  for (const x of A1.HECHOS_ACT1_T3) {
    const r = L.evaluarAct1T3(x, x.grupo);
    assert.deepEqual(r, { ok: true, texto: `✅ ${x.acierto}`, patron: null });
  }
});

test("★★ el puntaje: 1 al primer intento, la mitad al segundo", () => {
  assert.equal(L.puntuarAct1T3([{ primeroOk: true }, { primeroOk: false, segundoOk: true }, { primeroOk: false, segundoOk: false }], 3), 50);
  assert.equal(L.puntuarAct1T3([], 0), 0);
  /* Con segunda decisión: cuenta solo si las dos son correctas (Yujiro). */
  assert.equal(L.puntuarAct1T3([{ primeroOk: true, segundaOk: true }, { primeroOk: true, segundaOk: false }], 2), 50);
  assert.equal(L.puntuarAct1T3([{ primeroOk: false, segundoOk: true, segundaOk: false }], 1), 0);
});

/* ═══════════ MONTADA ═══════════ */

test("★★★ la ficha lleva la empresa a la vista, y salen los tres grupos con su rótulo completo", async () => {
  const items = [A1.HECHOS_ACT1_T3[6]];
  const m = await montar({ items });
  try {
    assert.equal(m.caja.querySelector("[data-empresa]").textContent, "San Miguel");
    assert.equal(m.caja.querySelector("[data-hecho]").textContent, "Ya prestó el servicio de la máquina y no le han pagado los $2.500");
    assert.deepEqual([...m.caja.querySelectorAll("[data-rotulo]")].map((x) => x.textContent), A1.GRUPOS.map((g) => g.rotulo));
    assert.equal(m.caja.querySelector("[data-consigna]").textContent, A1.ACT1_T3.consigna);
    assert.equal(boton(m.caja, "Elige un grupo").disabled, true);
  } finally { m.desmontar(); }
});

test("★★★ acierto a la primera: sale la retro del hecho y «Ver el resultado»", async () => {
  const x = A1.HECHOS_ACT1_T3[0];
  let fin = null;
  const m = await montar({ items: [x], onCompletar: (pct) => { fin = pct; } });
  try {
    await colocar(m.caja, x.grupo);
    assert.ok(retro(m.caja).includes(x.acierto), retro(m.caja));
    assert.ok(retro(m.caja).startsWith("Correcto"));
    await tocar(boton(m.caja, "Ver el resultado"));
    assert.equal(fin, 100);
  } finally { m.desmontar(); }
});

test("★★★ error, reintento y acierto: el error es el de su tipo y el ítem vale la mitad", async () => {
  const x = A1.HECHOS_ACT1_T3.find((y) => y.grupo === SIN_INGRESO);
  let fin = null;
  const m = await montar({ items: [x], onCompletar: (pct) => { fin = pct; } });
  try {
    await colocar(m.caja, MISMO_DIA);
    assert.ok(retro(m.caja).includes(A1.ERRORES_ACT1_T3.B), retro(m.caja));
    assert.ok(m.caja.querySelector("[data-fallo]"));
    await colocar(m.caja, SIN_INGRESO);
    assert.ok(m.caja.querySelector("[data-segunda]"), "al acertar el grupo 3 sale la segunda decisión");
    assert.equal(retro(m.caja), "", "la retro del hecho espera a la segunda decisión");
    await tocar(opcion(m.caja, x.queEs));
    assert.deepEqual(textosMensaje(m.caja), [`Correcto. ${x.acierto}`]);
    await tocar(boton(m.caja, "Ver el resultado"));
    assert.equal(fin, 50);
  } finally { m.desmontar(); }
});

/* ═══════════ EN EL CAMINO Y EN EL CATÁLOGO ═══════════ */

test("★★★ va en el Tema 3 después de la pieza 1, como Hacer fácil de 10 FP, y la vista la abre", () => {
  const tema = SUBJECTS.contabilidad.topics.find((t) => t.id === "ingresos-gastos-y-caja");
  assert.deepEqual(tema.actividades.slice(0, 2).map((a) => a.id), ["t3-a1-vender-no-es-cobrar", "t3-ingreso-o-cobro"]);
  assert.equal(tema.actividades[0].clasificacion.tipo, APRENDER);
  assert.deepEqual(tema.actividades[1].clasificacion, { tipo: HACER, modalidad: "evaluativa", dificultad: "facil", fpBase: 10 });
  assert.equal(tema.actividades[1].nombre, "¿Ingreso o cobro?");
  assert.equal(JUEGOS[0].id, "t3-ingreso-o-cobro", "la act. 1 es el primer juego del camino");
});

test("★★ tiene su fila en el catálogo del servidor y su etiqueta en el panel docente", () => {
  const dir = new URL("../../../supabase/migrations/", import.meta.url);
  const sql = readdirSync(dir).filter((f) => f.endsWith(".sql")).map((f) => readFileSync(new URL(f, dir), "utf8")).join("\n");
  assert.match(sql, /\('t3-ingreso-o-cobro',\s*'contabilidad',\s*'ingresos-gastos-y-caja',\s*'evaluativa',\s*'facil',\s*10,\s*1\)/);
  assert.equal(REGLAS["t3-ingreso-o-cobro"]("t3a1-sm-maquina"), "San Miguel · Ya prestó el servicio de la máquina y no le han pagado los $2.500");
});

test("★★ T1-6 sigue intacta: el componente nuevo no importa nada de ella", () => {
  const fuente = readFileSync(new URL("../../components/mecanicas/libros/tema3/IngresoOCobro.jsx", import.meta.url), "utf8");
  assert.doesNotMatch(fuente, /EnCualEstadoAparece|T1_6|contabilidadTema1/);
});

/* ═══════════ LA SEGUNDA DECISIÓN: «¿QUÉ ES ESA PLATA?» ═══════════ */

test("★★★ la segunda decisión: los textos de Katsumi, textuales, y qué es cada hecho del grupo 3", () => {
  assert.equal(A1.SEGUNDA_ACT1_T3.pregunta, "Si no es ingreso, ¿qué es esa plata?");
  assert.deepEqual(A1.SEGUNDA_ACT1_T3.opciones.map((o) => o.rotulo), ["Un aporte", "Una deuda", "Un activo vendido"]);
  assert.deepEqual(A1.ERRORES_SEGUNDA_ACT1_T3, {
    aporte: { deuda: "La plata la pusieron los socios, no un prestamista.", activo: "La empresa no entregó nada a cambio de esa plata." },
    deuda: { aporte: "La plata la prestó un banco, no los socios.", activo: "La empresa no entregó nada a cambio de esa plata." },
    activo: { aporte: "Nadie puso ni prestó: entregó algo suyo a cambio.", deuda: "Nadie puso ni prestó: entregó algo suyo a cambio." },
  });
  assert.deepEqual(A1.MARCA_ACT1_T3, { bien: "Correcto", mal: "No va aquí", era: "Iba aquí" });
  assert.deepEqual(delGrupo3.map((x) => [x.id, x.queEs]), [
    ["t3a1-sc-aporte", "aporte"], ["t3a1-cc-computador", "activo"], ["t3a1-lv-prestamo", "deuda"], ["t3a1-lv-acciones", "aporte"],
  ]);
  assert.ok(A1.HECHOS_ACT1_T3.filter((x) => x.grupo !== SIN_INGRESO).every((x) => !L.tieneSegunda(x)), "solo el grupo 3");
  for (const x of delGrupo3) {
    for (const o of A1.SEGUNDA_ACT1_T3.opciones) {
      const r = L.evaluarSegundaAct1T3(x, o.id);
      assert.equal(r.ok, o.id === x.queEs);
      if (!r.ok) assert.equal(r.error, A1.ERRORES_SEGUNDA_ACT1_T3[x.queEs][o.id]);
    }
  }
});

test("★★★ al acertar el grupo 3: las pestañas ceden a la pregunta y tres pestañas; la ficha sigue; ni retro ni avance", async () => {
  const x = delGrupo3[2];
  const m = await montar({ items: [x] });
  try {
    await colocar(m.caja, SIN_INGRESO);
    assert.ok(m.caja.querySelector("[data-ficha]"));
    assert.equal(m.caja.querySelector("[data-grupos]"), null);
    assert.equal(m.caja.querySelector("[data-pregunta-segunda]").textContent, "Si no es ingreso, ¿qué es esa plata?");
    const ops = [...m.caja.querySelectorAll("[data-opcion-segunda]")];
    assert.deepEqual(ops.map((o) => o.textContent), ["Un aporte", "Una deuda", "Un activo vendido"]);
    for (const o of ops) {
      assert.equal(o.style.width, "100%");
      assert.equal(o.style.border, "1px solid rgba(248, 249, 250, 0.35)");
      assert.equal(o.style.background, "transparent");
      assert.equal(o.querySelector("[data-hueco-pastilla]").style.height, "20px");
    }
    assert.equal(retro(m.caja), "");
    assert.equal(boton(m.caja, "Colocar la ficha"), undefined, "un toque califica: sin «Colocar la ficha»");
    assert.equal(boton(m.caja, "Ver el resultado"), undefined);
    assert.equal(document.activeElement, m.caja.querySelector("[data-pregunta-segunda]"));
  } finally { m.desmontar(); }
});

test("★★★ segunda bien: «Correcto» con Check y 2 px #F8F9FA; después la retro del hecho; vale 1 y el detalle guarda las dos", async () => {
  const x = delGrupo3[1];
  let fin = null;
  const m = await montar({ items: [x], onCompletar: (...a) => { fin = a; } });
  try {
    await colocar(m.caja, SIN_INGRESO);
    await tocar(opcion(m.caja, "activo"));
    const o = opcion(m.caja, "activo");
    assert.equal(o.getAttribute("data-estado"), "bien");
    assert.equal(o.style.border, "2px solid rgb(248, 249, 250)");
    assert.equal(o.style.padding, "8px 10px");
    assert.equal(o.querySelector("[data-pastilla]").textContent, "Correcto");
    assert.ok(o.querySelector("[data-pastilla] svg"));
    assert.equal(mensaje(m.caja).getAttribute("data-mensaje-segunda"), "acierto");
    assert.equal(mensaje(m.caja).style.borderLeft, "3px solid rgb(184, 196, 212)");
    assert.equal(mensaje(m.caja).style.background, "rgba(184, 196, 212, 0.12)");
    assert.deepEqual(textosMensaje(m.caja), [`Correcto. ${x.acierto}`], "un solo bloque: «Correcto.» y la devolución");
    assert.equal(retro(m.caja), "", "la devolución no sale también en la retro de abajo");
    await tocar(opcion(m.caja, "deuda"));
    assert.equal(opcion(m.caja, "deuda").getAttribute("data-estado"), "apagada");
    await tocar(boton(m.caja, "Ver el resultado"));
    assert.equal(fin[0], 100);
    assert.deepEqual(fin[2].map(({ item, ok, respuesta, respuestas }) => ({ item, ok, respuesta, respuestas })), [
      { item: x.id, ok: true, respuesta: null, respuestas: { grupo: SIN_INGRESO, segunda: "activo" } },
    ]);
  } finally { m.desmontar(); }
});

for (const [k, mal] of [[0, "deuda"], [0, "activo"], [1, "aporte"], [2, "aporte"], [2, "activo"]]) {
  const x = delGrupo3[k];
  test(`★★★ segunda mal (${x.id} · ${mal}): coral y «No va aquí», el error en su bloque; a los 0,7 s «Iba aquí» y la retro; vale 0`, async () => {
    let fin = null;
    const m = await montar({ items: [x], onCompletar: (...a) => { fin = a; } });
    try {
      await colocar(m.caja, SIN_INGRESO);
      await tocar(opcion(m.caja, mal));
      const o = opcion(m.caja, mal);
      assert.equal(o.getAttribute("data-estado"), "mal");
      assert.equal(o.style.border, "2px solid rgb(231, 111, 81)");
      assert.equal(o.querySelector("[data-pastilla]").textContent, "No va aquí");
      const bloque = mensaje(m.caja);
      assert.equal(bloque.getAttribute("data-mensaje-segunda"), "error");
      assert.deepEqual(textosMensaje(m.caja), [`Incorrecto: ${A1.ERRORES_SEGUNDA_ACT1_T3[x.queEs][mal]}`]);
      assert.equal(bloque.style.borderLeft, "3px solid rgb(231, 111, 81)");
      assert.equal(bloque.style.background, "rgba(184, 196, 212, 0.12)");
      assert.equal(opcion(m.caja, x.queEs).getAttribute("data-estado"), "apagada");
      assert.equal(retro(m.caja), "");
      assert.equal(boton(m.caja, "Ver el resultado"), undefined);
      await esperar(750);
      const c = opcion(m.caja, x.queEs);
      assert.equal(c.getAttribute("data-estado"), "era");
      assert.equal(c.style.border, "2px solid rgb(248, 249, 250)");
      assert.equal(c.querySelector("[data-pastilla]").textContent, "Iba aquí");
      assert.equal(m.caja.querySelectorAll("[data-mensaje-segunda]").length, 1, "un solo bloque");
      assert.deepEqual(textosMensaje(m.caja), [`Incorrecto: ${A1.ERRORES_SEGUNDA_ACT1_T3[x.queEs][mal]}`, x.acierto], "el error y después la devolución, en el mismo bloque");
      assert.equal(retro(m.caja), "");
      await tocar(boton(m.caja, "Ver el resultado"));
      assert.equal(fin[0], 0, "sin puntos parciales");
      assert.equal(fin[2][0].ok, false);
      assert.equal(fin[2][0].respuesta, mal);
      assert.deepEqual(fin[2][0].respuestas, { grupo: SIN_INGRESO, segunda: mal });
    } finally { m.desmontar(); }
  });
}

test("★★ el reintento y la segunda mal: vale 0; el detalle guarda el primer grupo y la segunda", async () => {
  const x = delGrupo3[3];
  let fin = null;
  const m = await montar({ items: [x], onCompletar: (...a) => { fin = a; } });
  try {
    await colocar(m.caja, DESPUES);
    await colocar(m.caja, SIN_INGRESO);
    await tocar(opcion(m.caja, "deuda"));
    await esperar(750);
    await tocar(boton(m.caja, "Ver el resultado"));
    assert.equal(fin[0], 0);
    assert.deepEqual(fin[2].map(({ ok, respuesta, respuestas }) => ({ ok, respuesta, respuestas })), [
      { ok: false, respuesta: DESPUES, respuestas: { grupo: DESPUES, segunda: "deuda" } },
    ]);
  } finally { m.desmontar(); }
});
