import { test } from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { JSDOM, VirtualConsole } from "jsdom";

/*
 * ═══════════════════════════════════════════════════════════════════════════
 * T2 · LAS TRES HACER NUEVAS (Célula C, lote T2-2, #471). Esqueleto en borrador.
 *
 * Una prueba por Hacer —montaje, un intento, puntaje y detalle, y que cada
 * tipo de ítem funcione— y una de «no le cambia nada a nadie»: las siete de
 * hoy con los mismos ids, FP y completados (precedente: monetaria-dos-
 * actividades.test.mjs).
 * ═══════════════════════════════════════════════════════════════════════════
 */

const dom = new JSDOM("<!doctype html><html><body></body></html>", { url: "http://localhost/", virtualConsole: new VirtualConsole() });
const w = dom.window;
w.matchMedia = () => ({ matches: true, addEventListener() {}, removeEventListener() {}, addListener() {}, removeListener() {} });
w.requestAnimationFrame = (cb) => setTimeout(() => cb(performance.now()), 0);
w.cancelAnimationFrame = (id) => clearTimeout(id);
for (const [k, v] of Object.entries({
  window: w, document: w.document, navigator: w.navigator,
  HTMLElement: w.HTMLElement, HTMLInputElement: w.HTMLInputElement, Element: w.Element, Node: w.Node, SVGElement: w.SVGElement,
  Event: w.Event, MouseEvent: w.MouseEvent, KeyboardEvent: w.KeyboardEvent,
  getComputedStyle: w.getComputedStyle.bind(w), matchMedia: w.matchMedia,
  requestAnimationFrame: w.requestAnimationFrame, cancelAnimationFrame: w.cancelAnimationFrame,
})) {
  Object.defineProperty(globalThis, k, { value: v, configurable: true, writable: true });
}
globalThis.IS_REACT_ACT_ENVIRONMENT = true;

const React = await import("react");
const { createRoot } = await import("react-dom/client");
const act = React.act ?? (await import("react-dom/test-utils")).act;

const { MarcoLibros } = await import("../../components/mecanicas/bloques/marcos.jsx");
const CuadraPorValor = (await import("../../components/mecanicas/libros/t2/CuadraPorValor.jsx")).default;
const DelDiarioAlMayor = (await import("../../components/mecanicas/libros/t2/DelDiarioAlMayor.jsx")).default;
const LasQueVuelvenACero = (await import("../../components/mecanicas/libros/t2/LasQueVuelvenACero.jsx")).default;
const L = await import("../t2HacerNuevas.js");
const D = await import("../../data/contabilidadT2HacerNuevas.js");
const { SUBJECTS, HACER, actividadesDeTipo } = await import("../../data/subjects.js");
const { ACTIVIDADES } = await import("../../data/contabilidadActividades.js");
const { nodosDe } = await import("../../hacer/completadas.js");
const { ASI_SE_JUEGA } = await import("../../data/asiSeJuega.js");
const { etiquetaDeItem } = await import("../../docente/etiquetasItem.js");

const MARCA = "[ESCRITO POR CLAUDE, NO POR LA FICHA] PENDIENTE_DE_REVISION — muestra hasta el banco de Near (lote T2-2)";

function montar(Componente, props) {
  const caja = document.createElement("div");
  document.body.appendChild(caja);
  const raiz = createRoot(caja);
  const llamadas = [];
  act(() => raiz.render(React.createElement(Componente, {
    Marco: MarcoLibros, rotulo: "R", titulo: "T", onCompletar: (...a) => llamadas.push(a), ...props,
  })));
  return { caja, llamadas, desmontar: () => { act(() => raiz.unmount()); caja.remove(); } };
}
const clic = (el) => { assert.ok(el, "no está el elemento"); act(() => el.dispatchEvent(new w.MouseEvent("click", { bubbles: true }))); };
const boton = (caja, texto) => [...caja.querySelectorAll("button")].find((b) => b.textContent.trim().startsWith(texto));
function escribir(input, valor) {
  const set = Object.getOwnPropertyDescriptor(w.HTMLInputElement.prototype, "value").set;
  act(() => { set.call(input, valor); input.dispatchEvent(new w.Event("input", { bubbles: true })); });
}
const siguiente = (caja) => clic(boton(caja, "Siguiente") ?? boton(caja, "Ver mi resumen"));

/* ═══════════════════════ 8.º · CUADRA POR VALOR ═══════════════════════ */

test("★★★ Cuadra por valor: tres tipos, un intento, consecuencia antes del veredicto, puntaje y detalle", () => {
  const items = L.prepararCuadra();
  assert.deepEqual(items.map((c) => c.tipo), ["completar", "completar", "completar", "juzgar", "juzgar", "encontrar"]);
  const { caja, llamadas, desmontar } = montar(CuadraPorValor, { items });

  /* completar, MAL: 4.800 en Letras por pagar. La columna creció mientras se escribía. */
  assert.equal(caja.querySelector("[data-t2-cuadra]").dataset.t2Cuadra, "completar");
  const input = caja.querySelector("input");
  escribir(input, "4.800");
  assert.equal(caja.querySelector('[data-total="haber"]').textContent, "$5.600", "la columna no crece con lo escrito");
  clic(boton(caja, "Comprobar"));
  assert.equal(caja.querySelector("[data-consecuencia]").textContent, "Faltan $800 en el debe: las dos columnas no llegan a la misma altura.");
  assert.equal(caja.querySelector("[data-nivel]").dataset.nivel, "desigual");
  assert.match(caja.querySelector("[data-iba]").textContent, /Iba aquí: \$4\.000/);
  assert.ok(input.disabled, "un solo intento: el campo se bloquea");
  assert.equal(boton(caja, "Comprobar"), undefined);
  /* La consecuencia va ANTES que el veredicto (C4). */
  const orden = [...caja.querySelectorAll("[data-consecuencia], [data-retro]")].map((n) => (n.hasAttribute("data-retro") ? "retro" : "consecuencia"));
  assert.deepEqual(orden, ["consecuencia", "retro"]);
  siguiente(caja);

  /* completar, BIEN: 3.000.000 para Aportes sociales. El nivel queda sólido y los conteos dicen 2 contra 1. */
  escribir(caja.querySelector("input"), "3000000");
  clic(boton(caja, "Comprobar"));
  assert.equal(caja.querySelector("[data-nivel]").dataset.nivel, "igual");
  assert.equal(caja.querySelector('[data-conteo="debe"]').textContent, "2 cuentas · $3.000.000");
  assert.equal(caja.querySelector('[data-conteo="haber"]').textContent, "1 cuenta · $3.000.000");
  siguiente(caja);
  escribir(caja.querySelector("input"), "2500");
  clic(boton(caja, "Comprobar"));
  siguiente(caja);

  /* juzgar: antes de responder no hay columnas ni sumas (serían la respuesta). */
  assert.equal(caja.querySelector("[data-columnas]"), null);
  clic(caja.querySelector('[data-opcion="no-cuadra"] button'));
  assert.equal(caja.querySelector('[data-opcion="no-cuadra"] button').dataset.estado, "incorrecta");
  assert.equal(caja.querySelector('[data-opcion="cuadra"] button').dataset.estado, "revelada");
  assert.ok(caja.querySelector("[data-columnas]"));
  siguiente(caja);
  clic(caja.querySelector('[data-opcion="no-cuadra"] button'));
  assert.match(caja.querySelector("[data-consecuencia]").textContent, /Faltan \$3\.600 en el haber/);
  siguiente(caja);

  /* encontrar: las líneas son botones; la 1 (Caja en el haber) es la que descuadra. */
  clic(caja.querySelector('[data-linea="1"] button'));
  assert.equal(caja.querySelector('[data-linea="1"] button').dataset.estado, "correcta");
  clic(caja.querySelector('[data-linea="0"] button'));
  assert.equal(caja.querySelector('[data-linea="0"] button').dataset.estado, "libre", "un intento: el segundo toque no cuenta");
  siguiente(caja);

  assert.equal(llamadas.length, 1);
  const [pct, , detalle] = llamadas[0];
  assert.equal(pct, (100 * 4) / 6);
  assert.deepEqual(detalle.map((d) => [d.item, d.ok, d.respuesta]), [
    ["cpv-01", false, "4800"], ["cpv-02", true, null], ["cpv-03", true, null],
    ["cpv-04", false, "no-cuadra"], ["cpv-05", true, null], ["cpv-06", true, null],
  ]);
  for (const d of detalle) assert.ok(etiquetaDeItem("cu-cuadra-por-valor", d.item), `${d.item} sin etiqueta docente`);
  desmontar();
});

/* ═══════════════════════ 9.º · DEL DIARIO AL MAYOR ═══════════════════════ */

test("★★★ Del diario al mayor: destino y origen, el error se queda a la vista, el renglón cae en su cuenta y el selector no califica", () => {
  const items = L.prepararDiario();
  const caso = items[0].caso;
  assert.ok(D.CORTE_SET_A === undefined);
  assert.ok(L.cuentasDe(caso).length <= 4 && L.renglonesDe(caso).length <= 7, "pasa del tope de Watari");
  const { caja, llamadas, desmontar } = montar(DelDiarioAlMayor, { items });

  /* destino, MAL: el depósito a Acciones. */
  assert.equal(caja.querySelector("[data-marcado]").dataset.renglon, "0");
  assert.equal(caja.querySelector("[data-selector-vista]"), null);
  clic(caja.querySelector('[data-cuenta-destino="Acciones"]'));
  assert.equal(caja.querySelector("[data-consecuencia]").textContent, "Así, Acciones recibiría los $5.000 del Ene 2, y en el diario ese renglón es de Bancos.");
  const acciones = caja.querySelector('[data-cuenta-destino="Acciones"]');
  assert.match(acciones.style.border, /solid/);
  assert.equal(acciones.querySelector("[data-pastilla]").dataset.pastilla, "tachada");
  assert.equal(caja.querySelector('[data-cuenta-destino="Bancos"] [data-pastilla]').dataset.pastilla, "revelada");
  assert.match(acciones.textContent, /\$5\.000/, "la ficha no se queda en la cuenta equivocada");
  assert.ok(caja.querySelector('[data-cuenta-destino="Bancos"]').disabled, "un solo intento");
  siguiente(caja);
  /* Bien o mal, el renglón queda en su cuenta correcta. */
  assert.match(caja.querySelector('[data-cuenta-t="Bancos"]').textContent, /\$5\.000/);
  assert.doesNotMatch(caja.querySelector('[data-cuenta-t="Acciones"]').textContent, /\$5\.000/);

  /* destino, BIEN, y el selector aparece y reordena sin calificar. */
  for (const c of ["Acciones", "Flota y equipo de transporte", "Bancos", "Letras por pagar"]) {
    clic(caja.querySelector(`[data-cuenta-destino="${c}"]`));
    assert.ok(caja.querySelector("[data-enlazado]"), `${c}: el renglón no queda enlazado`);
    siguiente(caja);
  }
  const antes = [...caja.querySelectorAll("[data-libro=diario] [data-renglon]")].map((n) => n.dataset.renglon);
  clic(boton(caja, "Por cuenta"));
  const despues = [...caja.querySelectorAll("[data-libro=diario] [data-renglon]")].map((n) => n.dataset.renglon);
  assert.deepEqual(antes, ["0", "1", "2", "3", "4"]);
  assert.deepEqual(despues, ["0", "3", "1", "2", "4"], "Por cuenta: Bancos junta sus dos renglones");

  /* origen: los $800 del haber de Bancos. Se toca un renglón malo. */
  assert.equal(caja.querySelector("[data-t2-diario]").dataset.t2Diario, "origen");
  clic(caja.querySelector('[data-opcion-renglon="0"] button'));
  assert.match(caja.querySelector("[data-consecuencia]").textContent, /no coincide su (lado|monto)/);
  assert.equal(caja.querySelector('[data-opcion-renglon="3"] button').dataset.estado, "revelada");
  siguiente(caja);

  assert.equal(llamadas.length, 1);
  const [pct, , detalle] = llamadas[0];
  assert.equal(pct, (100 * 4) / 6);
  assert.deepEqual(detalle.map((d) => [d.item, d.ok]), [
    ["ddm-a-1", false], ["ddm-a-2", true], ["ddm-a-3", true], ["ddm-a-4", true], ["ddm-a-5", true], ["ddm-a-6", false],
  ]);
  assert.equal(detalle[0].respuesta, "Acciones");
  for (const d of detalle) assert.ok(etiquetaDeItem("cu-del-diario-al-mayor", d.item), `${d.item} sin etiqueta docente`);
  desmontar();
});

/* ═══════════════════════ 10.º · LAS QUE VUELVEN A CERO ═══════════════════════ */

test("★★★ Las que vuelven a cero: binaria, ítems con clase real/nominal, el error en el mes siguiente y la utilidad al cerrar", () => {
  const items = L.prepararCero();
  for (const c of items) assert.ok(["real", "nominal"].includes(c.clase), `${c.id} sin clase`);
  assert.deepEqual([...new Set(items.map((c) => L.subtemaDeCuenta(c)))].sort(),
    ["Clasificación de cuentas nominales", "Clasificación de cuentas reales"]);
  const { caja, llamadas, desmontar } = montar(LasQueVuelvenACero, { items });

  /* Caja (real) puesta en cero: abril la muestra en $0 con borde coral. */
  assert.equal(caja.querySelector("[data-t2-cero]").dataset.clase, "real");
  clic(caja.querySelector('[data-opcion="cero"] button'));
  const cajaAbril = caja.querySelector('[data-cuenta-siguiente="lvc-caja"]');
  assert.equal(cajaAbril.dataset.valor, "0");
  assert.match(cajaAbril.style.border, /2px solid/);
  assert.equal(cajaAbril.querySelector("[data-pastilla]").dataset.pastilla, "tachada");
  assert.equal(caja.querySelector("[data-consecuencia]").textContent, "Así, en abril Caja diría $0, y su saldo de $600 sigue ahí.");
  assert.equal(caja.querySelector('[data-opcion="pasa"] button').dataset.estado, "revelada");
  clic(caja.querySelector('[data-opcion="pasa"] button'));
  assert.equal(caja.querySelector('[data-opcion="pasa"] button').dataset.estado, "revelada", "un intento");
  siguiente(caja);
  /* Al pasar, Caja queda en su sitio correcto. */
  assert.equal(caja.querySelector('[data-cuenta-siguiente="lvc-caja"]').dataset.valor, "600");

  /* El resto, bien. */
  for (const c of items.slice(1)) {
    clic(caja.querySelector(`[data-opcion="${L.destinoCorrecto(c)}"] button`));
    if (c !== items.at(-1)) siguiente(caja);
  }
  /* El mes queda cerrado: la utilidad del mes = 900 + 350 − 200 − 250. */
  assert.equal(caja.querySelector("[data-utilidad]").dataset.utilidad, "800");
  siguiente(caja);

  const [pct, , detalle] = llamadas[0];
  assert.equal(pct, (100 * 6) / 7);
  assert.deepEqual(detalle[0], { item: "lvc-caja", ok: false, intentos: 1, respuesta: "cero", orden: 1 });
  for (const d of detalle) assert.ok(etiquetaDeItem("cu-las-que-vuelven-a-cero", d.item), `${d.item} sin etiqueta docente`);
  desmontar();
});

/* ═══════════════════════ «ASÍ SE JUEGA» Y LAS MUESTRAS ═══════════════════════ */

test("★★ «Así se juega»: modoDemo con el ejemplo de afuera, sin consigna, sin avance y sin onCompletar", () => {
  const MEC = { "cu-cuadra-por-valor": CuadraPorValor, "cu-del-diario-al-mayor": DelDiarioAlMayor, "cu-las-que-vuelven-a-cero": LasQueVuelvenACero };
  for (const id of D.IDS_T2_NUEVAS) {
    const asi = ASI_SE_JUEGA[id];
    assert.ok(asi, `${id} sin «Así se juega»`);
    assert.equal(asi.consigna, D.CONSIGNA_T2_NUEVAS[id]);
    assert.equal(asi.pasos.length, 3);
    for (const it of [asi.demo.items].flat()) assert.match(it.id, /^demo-/);
    const { caja, llamadas, desmontar } = montar(MEC[id], { modoDemo: true, ...asi.demo });
    assert.equal(caja.querySelector("[data-encabezado]"), null, `${id}: la demo enseña la consigna`);
    assert.equal(boton(caja, "Siguiente"), undefined);
    assert.equal(llamadas.length, 0);
    desmontar();
  }
});

test("★★ los datos de muestra llevan su marca, en comentario y nunca en pantalla", () => {
  for (const f of ["src/data/contabilidadT2HacerNuevas.js", "src/data/asiSeJuegaT2Nuevas.js"]) {
    assert.ok(readFileSync(f, "utf8").includes(MARCA), `${f} sin la marca`);
  }
  const textos = JSON.stringify([D.CUADRA_POR_VALOR, D.LAS_QUE_VUELVEN_A_CERO, D.CONSIGNA_T2_NUEVAS, ASI_SE_JUEGA["cu-cuadra-por-valor"]]);
  assert.ok(!textos.includes("PENDIENTE_DE_REVISION") && !textos.includes("ESCRITO POR CLAUDE"));
});

/* ═══════════════════════ NO LE CAMBIA NADA A NADIE ═══════════════════════ */

test("★★★ entrar las tres no le cambia nada a nadie: las siete de hoy con sus ids, FP y completados; las tres, ocultas hasta la 0116", () => {
  const tema = SUBJECTS.contabilidad.topics.find((t) => t.id === "cuentas-debe-haber");
  const todas = actividadesDeTipo(tema, HACER);
  const nuevas = new Set(D.IDS_T2_NUEVAS);
  const antes = todas.filter((a) => !nuevas.has(a.id));

  /* Las siete, en su orden, con sus FP de siempre. */
  assert.deepEqual(antes.map((a) => a.id), ACTIVIDADES.map((a) => a.id));
  assert.deepEqual(antes.map((a) => [a.clasificacion.dificultad, a.clasificacion.fpBase]),
    [["facil", 10], ["facil", 10], ["medio", 25], ["medio", 25], ["dificil", 50], ["dificil", 50], ["experto", 90]]);
  for (const a of antes) assert.ok(!a.pendiente, `${a.id} quedó pendiente`);

  /* Las tres, después de las siete y antes de El Ciclo Completo, y pendientes: el camino no las dibuja. */
  assert.deepEqual(todas.slice(7).map((a) => a.id), D.IDS_T2_NUEVAS);
  const ids = tema.actividades.map((a) => a.id);
  assert.ok(ids.indexOf("cu-las-que-vuelven-a-cero") < ids.indexOf("ciclo-completo"));
  for (const a of todas.slice(7)) assert.equal(a.pendiente, true, `${a.id} saldría en el camino antes de la 0116`);
  const camino = todas.filter((a) => !a.pendiente);
  assert.deepEqual(camino.map((a) => a.id), antes.map((a) => a.id));

  /* Un estudiante que hizo la 1.ª, la 5.ª y la 7.ª: las mismas hechas, en el mismo camino. */
  const hechas = new Set([antes[0].id, antes[4].id, antes[6].id]);
  const enCaminoAntes = nodosDe(antes, hechas).filter((n) => n.completada).map((n) => n.id);
  const enCaminoAhora = nodosDe(camino, hechas).filter((n) => n.completada).map((n) => n.id);
  assert.deepEqual(enCaminoAhora, enCaminoAntes);

  /* Ninguna reusa los cinco retirados en la 0043, y la 0116 no toca ninguna de las siete. */
  const RETIRADOS_0043 = ["cu-simple-o-compuesto", "cu-cuadra-o-no", "cu-corriente-de-cuentas", "cu-mayorizacion", "cu-error-escondido"];
  for (const id of D.IDS_T2_NUEVAS) assert.ok(!RETIRADOS_0043.includes(id));
  const sql = readFileSync("supabase/migrations/0116_t2_tres_hacer.sql", "utf8");
  for (const a of antes) assert.ok(!sql.includes(`'${a.id}'`), `la 0116 toca ${a.id}`);
  for (const id of RETIRADOS_0043) assert.ok(!sql.includes(`'${id}'`), `la 0116 toca ${id}`);
  assert.match(sql, /\('cu-cuadra-por-valor',\s+'contabilidad', 'cuentas-debe-haber', 'evaluativa', 'medio', 25, 1\)/);
  assert.match(sql, /\('cu-del-diario-al-mayor',\s+'contabilidad', 'cuentas-debe-haber', 'evaluativa', 'medio', 25, 1\)/);
  assert.match(sql, /\('cu-las-que-vuelven-a-cero', 'contabilidad', 'cuentas-debe-haber', 'evaluativa', 'facil', 10, 1\)/);
  assert.match(sql, /on conflict \(activity_id\) do nothing;/);
  const sinComentarios = sql.replace(/--.*$/gm, "");
  assert.doesNotMatch(sinComentarios, /\b(update|delete|alter|drop)\b/i);

  /* Y la vista no los dibuja todavía: su lista de juegos sigue siendo la de las siete. */
  const vista = readFileSync("src/components/CuentasDebeHaberView.jsx", "utf8");
  for (const id of D.IDS_T2_NUEVAS) assert.ok(!vista.includes(`"${id}"`), `${id} ya está en la vista`);
});
