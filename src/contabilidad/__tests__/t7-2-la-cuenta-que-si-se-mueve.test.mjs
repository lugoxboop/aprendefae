import { test, mock } from "node:test";
import assert from "node:assert/strict";
import { readFileSync, readdirSync } from "node:fs";
import { JSDOM, VirtualConsole } from "jsdom";

/*
 * ═══════════════════════════════════════════════════════════════════════════
 * T7-2 · A1 «La cuenta que sí se mueve», RENOVADA (Patrón de enganche C2 de
 * Watari, con la auditoría de Mello encima). Célula C.
 *
 * Tres fuentes, y ninguna se copia a mano aquí:
 *   · Near: la sección «t7-2-a1-la-cuenta-que-si-se-mueve» de la entrega 2,
 *     con la línea 3 del resumen de la entrega 6 (correccionesMelloRecortesT72
 *     .mjs). La pieza de datos de hoy (contabilidadT7_2.js) sigue siendo esa
 *     sección, letra por letra, y los textos de la C2 salen de ella.
 *   · Watari: patron-enganche-c2-v1.html, su sección «cuenta» y el código de
 *     referencia de la pieza, que esta prueba EJECUTA en el mismo DOM.
 *   · Mello: auditoria-mello-patron-c2.md, sección 2. Sus correcciones
 *     (Cu-1, Cu-2 y Cu-3) se aplican al código de referencia con las líneas
 *     literales de la auditoría (correccionesMelloC2Cuenta.mjs).
 *
 * Y se compara:
 *   · los datos de la C2 ↔ las constantes de la referencia corregida, en los
 *     dos sentidos; los textos de pantalla ↔ la tabla «Pantalla por
 *     pantalla» de la C2; la interfaz ↔ el código de Watari
 *   · la pieza montada ↔ la referencia corregida montada, estado por estado,
 *     en dos recorridos enteros (cada error y la escalera, los aciertos, el
 *     conteo, el porqué, las cajas que salen), y con movimiento reducido
 *   · Cu-1, Cu-2 y Cu-3, con la prueba de Mello; la misma prueba contra la
 *     referencia SIN corregir da el fallo que él vio
 *   · foco, cada pantalla montada sola, CSS (tokens, 12 px, 44 px),
 *     catálogo y vista
 *
 * JSDOM no anima: los temporizadores son los falsos de node:test. Que nada
 * se salga a 320 y 375 px lo mide scripts/t7/medir-t7-2-a1.mjs.
 * ═══════════════════════════════════════════════════════════════════════════
 */

const dom = new JSDOM("<!doctype html><html><body></body></html>", { url: "http://localhost/", virtualConsole: new VirtualConsole() });
const w = dom.window;
let REDUCIDO = false;
w.matchMedia = (q) => ({ matches: REDUCIDO && /prefers-reduced-motion: reduce/.test(q), addEventListener() {}, removeEventListener() {}, addListener() {}, removeListener() {} });
w.Element.prototype.scrollIntoView = () => {};
for (const [k, v] of Object.entries({
  window: w, document: w.document, navigator: w.navigator, localStorage: w.localStorage,
  HTMLElement: w.HTMLElement, Element: w.Element, Node: w.Node, SVGElement: w.SVGElement, NodeFilter: w.NodeFilter,
  Event: w.Event, MouseEvent: w.MouseEvent, KeyboardEvent: w.KeyboardEvent,
  getComputedStyle: w.getComputedStyle.bind(w), matchMedia: w.matchMedia,
})) {
  Object.defineProperty(globalThis, k, { value: v, configurable: true, writable: true });
}
globalThis.IS_REACT_ACT_ENVIRONMENT = true;
mock.timers.enable({ apis: ["setTimeout"] });

const React = await import("react");
const { createRoot } = await import("react-dom/client");
const act = React.act;
const h = React.createElement;

const A = await import("../../data/contabilidadT7_2.js");
const D = await import("../../data/contabilidadT7_2_a1_c2.js");
const C = await import("../../components/mecanicas/libros/t7/LaCuentaQueSiSeMueveC2.jsx");
const LaCuentaQueSiSeMueveC2 = C.default;
const M = await import("./correccionesMelloRecortesT72.mjs");
const R = await import("./t7-2-recorte.mjs");
const MC = await import("./correccionesMelloC2Cuenta.mjs");
const { SUBJECTS, APRENDER } = await import("../../data/subjects.js");
const { default: ContabilidadT7_2View, PIEZAS_T7_2, TEMA_T7_2 } = await import("../../components/ContabilidadT7_2View.jsx");
const { AuthContext } = await import("../../auth/AuthProvider.jsx");
const { VISTAS, vistaDeTema } = await import("../../ruta.js");
const CE = await import("../canonEnganche.js");

const RAIZ = new URL("../../../", import.meta.url);
const NEAR = A.PIEZA_LA_CUENTA_QUE_SI_SE_MUEVE;
const P = D.PIEZA_LA_CUENTA_C2;
const T = D.INTERFAZ_C2;
const S = M.seccionT72(A.A1_ID);
const deNear = (id) => NEAR.pantallas.find((x) => x.id === id);
const FUENTE = readFileSync(new URL("src/components/mecanicas/libros/t7/LaCuentaQueSiSeMueveC2.jsx", RAIZ), "utf8");

/* ═══════════ 0 · LA REFERENCIA: EL CÓDIGO DE LA C2, EJECUTADO (CORREGIDO Y SIN CORREGIR) ═══════════ */

const EXPONER = "window.C2Cuenta.PANTALLAS = PANTALLAS;";
assert.equal(MC.CUENTA_JS.split(EXPONER).length, 2, "la C2 cambió: no está la línea que expone PANTALLAS");
const ejecutar = (js) => {
  new Function(js.replace(EXPONER, `${EXPONER} window.C2Cuenta.REF = { ENTRA, SALE, INICIO, HECHOS, PANTALLAS, MAX };`))();
  return w.C2Cuenta;
};
const CRUDA = ejecutar(MC.CUENTA_JS);
const CORREGIDA = ejecutar(MC.referenciaCorregida());
const REF = CORREGIDA.REF;

/* ═══════════ AYUDAS: MONTAR, TOCAR Y LEER ═══════════ */

const montarReact = async (el) => {
  const caja = document.createElement("div");
  document.body.appendChild(caja);
  const raiz = createRoot(caja);
  await act(async () => { raiz.render(el); });
  return { caja, desmontar: () => { act(() => raiz.unmount()); caja.remove(); } };
};

/* La pieza de la casa («casa»), la referencia corregida («ref») o la de Watari sin corregir («cruda»), con las mismas acciones. */
async function montar(cual, props = {}) {
  if (cual !== "casa") {
    const raiz = document.createElement("div");
    document.body.appendChild(raiz);
    (cual === "ref" ? CORREGIDA : CRUDA)(raiz);
    return conAcciones({ caja: raiz, raiz, pref: "ref", desmontar: () => raiz.remove() });
  }
  const m = await montarReact(h(LaCuentaQueSiSeMueveC2, { rotulo: "R", ...props }));
  return conAcciones({ ...m, raiz: m.caja.querySelector("[data-pieza]"), pref: "casa" });
}

const sel = (s, pref) => (pref === "ref" ? s.replace(/\$b-/g, "c2-").replace(/\$c-/g, "c2c-") : s.replace(/\$[bc]-/g, "t7cs-"));
function conAcciones(m) {
  const q = (s) => m.caja.querySelector(sel(s, m.pref));
  const clic = async (el) => { assert.ok(el, "no está lo que se iba a tocar"); await act(async () => { el.dispatchEvent(new w.MouseEvent("click", { bubbles: true })); }); };
  return {
    ...m, q,
    seguir: () => clic(q(".$b-seguir")),
    lado: (l) => clic(q(`[data-t="inv"] [data-lado="${l}"]`)),
    op: (id) => clic(q(`[data-op="${id}"], [data-opcion="${id}"]`)),
    contar: () => clic(q('[data-accion="contar"]')),
    porque: () => clic(q(".$b-porque")),
    leer: () => leer(m.raiz ?? m.caja, m.pref),
  };
}
const tick = async (ms) => { await act(async () => { mock.timers.tick(ms); }); };
const enFoco = (el, msg = "el foco") => assert.ok(el && document.activeElement === el, `${msg}: está en ${document.activeElement?.tagName}.${document.activeElement?.className}`);
const limpio = (t) => (t ?? "").replace(/\s+/g, " ").trim();
const clases = (el, lista) => lista.filter((c) => el.classList.contains(c));
const largo = (el) => Math.round(Number(el.style.getPropertyValue("--l")) * D.MAX * 1000) / 1000;

/* Todo lo que se ve de la pieza, leído del DOM; el mismo lector para la referencia y para la de la casa. */
function leer(raiz, pref) {
  const q = (s, en = raiz) => en.querySelector(sel(s, pref));
  const qq = (s, en = raiz) => [...en.querySelectorAll(sel(s, pref))];
  const renglones = (lado) => qq(".$c-renglon", lado).map((r) => ({ rot: limpio(r.querySelector("span").textContent), cajas: largo(r.querySelector("i")), nuevo: r.classList.contains("nuevo") }));
  const lado = (t, l) => {
    const el = q(`[data-t="${t}"] [data-lado="${l}"]`);
    return {
      boton: el.tagName === "BUTTON" || el.getAttribute("role") === "button",
      etiqueta: el.getAttribute("aria-label"),
      clases: clases(el, ["blanco", "mal", "pista"]),
      pastilla: limpio(q(".$b-pastilla", el)?.textContent),
      sub: limpio(q(".$c-sub", el)?.textContent),
      renglones: renglones(el),
    };
  };
  const cajas = qq(".$c-caja");
  const vivas = cajas.filter((c) => !c.classList.contains("sale"));
  const txt = q(".$b-txt");
  const hecho = q(".$c-hecho");
  const conteo = q(".$c-conteo");
  const cmv = q('[data-t="cmv"]');
  const lista = q(".$c-lista");
  const msg = q(".$b-msg");
  const porque = q(".$b-porque");
  const seguir = q(".$b-seguir");
  const contar = q('[data-accion="contar"]');
  return {
    marca: limpio(q(".$b-cejilla").textContent),
    dormida: raiz.classList.contains("dormida"),
    txt: txt.hidden ? null : limpio(txt.textContent),
    hecho: hecho.hidden ? null : limpio(hecho.textContent),
    bodega: {
      vivas: vivas.length,
      saliendo: cajas.length - vivas.length,
      llegaron: vivas.filter((c) => c.classList.contains("llega")).length,
      numeros: vivas.map((c) => c.dataset.n).filter(Boolean).map(Number),
      contadas: vivas.filter((c) => c.classList.contains("contada")).length,
    },
    inv: { debe: lado("inv", "debe"), haber: lado("inv", "haber"), saldo: largo(q(".$c-saldo-barra")), conteo: conteo.hidden ? null : largo(q(".$c-conteo-barra")) },
    cmv: cmv.hidden ? null : renglones(q('[data-lado="debe"]', cmv)),
    lista: lista.hidden ? null : qq("li", lista).map((li) => limpio(li.textContent)),
    contar: contar ? limpio(contar.textContent) : null,
    ops: qq("[data-op], [data-opcion]").map((b) => ({
      id: b.dataset.op ?? b.dataset.opcion, texto: limpio(b.textContent), clases: clases(b, ["mal", "pista", "bien"]),
      inactiva: b.getAttribute("aria-disabled") === "true", etiqueta: b.getAttribute("aria-label"),
    })),
    msg: { texto: limpio(msg.textContent), mal: msg.classList.contains("mal"), porque: porque ? { texto: limpio(porque.textContent), abierto: porque.getAttribute("aria-expanded") } : null },
    pie: limpio(q(".$b-pie").textContent),
    seguir: { texto: limpio(seguir.textContent), inactivo: seguir.getAttribute("aria-disabled") === "true" },
  };
}

/* Un recorrido entero, con todo: cada error y la escalera, los aciertos, el conteo, el porqué y lo que no se puede tocar. */
const RECORRIDO_LARGO = [
  ["seguir"],
  ["seguir"],                                   // bloqueado: faltan los cinco hechos
  ["lado", "haber"], ["lado", "haber"], ["lado", "debe"],            // compra: pista, devolución, acierto
  ["lado", "haber"],                                                  // vende
  ["lado", "haber"], ["lado", "debe"],                                // un cliente devuelve: pista, acierto
  ["lado", "debe"], ["lado", "debe"], ["lado", "debe"], ["lado", "haber"], // al proveedor: tres errores y acierto
  ["lado", "debe"], ["lado", "haber"],                                // consumo
  ["porque"],
  ["seguir"],
  ["seguir"],                                   // bloqueado: falta acertar
  ["op", "al-cierre"], ["op", "nunca"], ["op", "al-cierre"], ["op", "cada-venta"], ["op", "nunca"],
  ["porque"],
  ["seguir"],
  ["seguir"], ["contar"], ["op", "no-hace-falta"], ["op", "hallar"], ["op", "verificar"], ["porque"],
  ["seguir"],
  ["seguir"],
];
/* Y uno derecho, sin errores. */
const RECORRIDO_DERECHO = [
  ["seguir"], ...D.HECHOS.map((x) => ["lado", x.lado]), ["seguir"], ["op", "cada-venta"], ["seguir"], ["contar"], ["op", "verificar"], ["seguir"],
];
const hacer = (m, [accion, arg]) => m[accion](arg);

/* ═══════════ 1 · LOS DATOS: NEAR, WATARI Y MELLO ═══════════ */

/* Lo que dicen los datos de Near de una pantalla, en el orden del paquete (la prueba de la pieza de hoy, intacta). */
function deDatos(p) {
  const lineas = [p.objetivo, ...(p.parrafos ?? []), p.consigna, p.pregunta, ...(p.lista ?? []), p.siguiente].filter(Boolean);
  const opciones = p.lineas ? p.lineas.map((l) => l.texto) : p.opciones?.map((o) => o.texto);
  const erroresLados = p.lineas ? [["entra", A.DEBE], ["sale", A.HABER]].map(([clave, lado]) => {
    const t = [...new Set(p.lineas.filter((l) => l.lado === lado).map((l) => l.devolucion))];
    assert.equal(t.length, 1, `${p.id} · ${clave}: un solo texto`);
    return { clave, texto: t[0] };
  }) : undefined;
  return { lineas, opciones, erroresLados };
}

test("★★★ Near: los datos de hoy son la sección del recorte (con la línea 3 del resumen de la entrega 6), letra por letra y en los dos sentidos", () => {
  R.compararConSeccion(NEAR, S, deDatos);
  assert.equal(NEAR.pantallas.length, 5);
  assert.equal(deNear("resumen").lista[2], M.RESUMEN_A1_L3.nuevo);
  assert.ok(!JSON.stringify(NEAR).includes(`"${M.RESUMEN_A1_L3.viejo}"`));
});

/* La forma común de una pantalla: la de la C2 (código de Watari) y la de la casa. */
const comun = (p) => ({
  id: p.id, texto: p.texto, boton: p.boton ?? null, pie: p.pie, lados: Boolean(p.lados), cmv: Boolean(p.cmv), conteo: Boolean(p.conteo), resumen: Boolean(p.resumen),
  pista: p.pista ?? p.eleccion?.pista ?? null, bien: p.bien ?? null, porque: p.porque ?? null, porqueALaVista: Boolean(p.porqueALaVista),
  opciones: p.opciones ?? null, correcta: p.correcta ?? p.eleccion?.correcta ?? null, mal: p.mal ?? p.eleccion?.mal ?? null,
  lista: p.lista ?? null, siguiente: p.siguiente ?? null,
});

test("★★★ Watari + Mello: las pantallas, los hechos y las cajas son las del código de referencia corregido, en los dos sentidos", () => {
  assert.deepEqual(D.PANTALLAS_C2.map(comun), REF.PANTALLAS.map(comun));
  assert.deepEqual(D.HECHOS, REF.HECHOS);
  assert.equal(D.INICIO, REF.INICIO);
  assert.equal(D.MAX, REF.MAX);
  /* Los dos mensajes de error de los lados son los de Near (ENTRA y SALE). */
  assert.deepEqual([REF.ENTRA, REF.SALE], deDatos(deNear("la-lista-del-libro")).erroresLados.map((e) => e.texto));
  /* Cu-3: sin corregir, el porqué de la pantalla 3 iba a la vista; corregido, ninguno. */
  assert.deepEqual(CRUDA.REF.PANTALLAS.filter((p) => p.porqueALaVista).map((p) => p.id), ["el-permanente"]);
  assert.deepEqual(REF.PANTALLAS.filter((p) => p.porqueALaVista).map((p) => p.id), []);
});

test("★★★ los textos de la C2 salen de los datos de Near (no se copian): cada texto de pantalla es uno de Near o la unión de párrafo y pregunta", () => {
  const L = deNear("la-lista-del-libro"), PE = deNear("el-permanente"), CO = deNear("el-conteo-en-el-permanente"), RE = deNear("resumen");
  const [p1, p2, p3, p4, p5] = P.pantallas;
  assert.equal(p1.texto, deNear("portada").objetivo);
  assert.equal(p1.boton, deNear("portada").boton);
  assert.equal(p2.texto, `${L.parrafos[0]} ${L.consigna}`);
  assert.equal(p3.texto, `${PE.parrafos[0]} ${PE.pregunta}`);
  assert.equal(p4.texto, CO.pregunta);
  assert.deepEqual([p2.pista, p3.pista, p4.pista], [L.pista, PE.pista, CO.pista]);
  assert.deepEqual([p2.bien, p3.bien, p4.bien], [L.acierto.texto, PE.acierto.texto, CO.acierto.texto]);
  assert.deepEqual([p2.porque, p3.porque, p4.porque], [L.acierto.porque, PE.acierto.porque, CO.acierto.porque]);
  for (const [p, n] of [[p3, PE], [p4, CO]]) {
    assert.deepEqual(p.opciones.map((o) => o.t), n.opciones.map((o) => o.texto));
    assert.equal(p.correcta, n.opciones.find((o) => o.correcta).id);
    assert.deepEqual(p.mal, Object.fromEntries(n.opciones.filter((o) => !o.correcta).map((o) => [o.id, o.devolucion])));
  }
  assert.deepEqual([p5.lista, p5.siguiente], [RE.lista, RE.siguiente]);
  assert.deepEqual(P.pantallas.map((p) => p.pie), NEAR.pantallas.map((p) => p.pie));
  for (const x of D.HECHOS) {
    const l = L.lineas.find((y) => y.id === x.id);
    assert.deepEqual(x, { id: l.id, texto: l.texto, lado: l.lado, cajas: x.cajas, devolucion: l.devolucion });
  }
  assert.deepEqual(D.HECHOS.map((x) => x.id).sort(), L.lineas.map((x) => x.id).sort());
  /* Mismo id, título y número que la pieza de hoy; y las pantallas en su orden. */
  assert.deepEqual([P.id, P.titulo, P.numero], [NEAR.id, NEAR.titulo, NEAR.numero]);
  assert.deepEqual(P.pantallas.map((p) => p.id), NEAR.pantallas.map((p) => p.id));
});

test("★★★ la tabla «Pantalla por pantalla» de la C2: los textos de Near en pantalla, letra por letra", () => {
  const tabla = MC.SECCION.split("<h3>2 · Pantalla por pantalla")[1].split("</table>")[0];
  const filas = [...tabla.matchAll(/<tr><td class='mono'>(\d) [^<]+<\/td><td>([^<]*)<\/td>/g)].map((m) => [Number(m[1]), m[2]]);
  assert.deepEqual(filas.map(([n]) => n), [1, 2, 3, 4, 5]);
  assert.deepEqual(filas.map(([, t]) => (t === "—" ? "" : t)), P.pantallas.map((p) => p.texto));
});

test("★★★ la interfaz: cada rótulo de Watari [W] está en su código; «Saldo inicial» es de Mello; «Entradas» y «Salidas», los de hoy", () => {
  const deWatari = ["bodega", "saldo", "conteo", "contar", "otraVenta", "inventario", "costo", "debe", "haber", "ladoDebe", "ladoHaber", "correcto", "noVaAqui", "incorrecto", "porQue", "seguir", "siguientePieza", "entradas", "salidas"];
  const enWatari = (t) => new RegExp(`(?<![\\p{L}])${t.replace(/[?.]/g, "\\$&")}(?![\\p{L}])`, "u").test(MC.CUENTA_JS);
  for (const k of deWatari) assert.ok(enWatari(T[k]), `${k}: «${T[k]}» no está en el código de Watari`);
  assert.equal(T.saldoInicial, MC.SALDO_INICIAL);
  assert.deepEqual([T.entradas, T.salidas], [A.PENDIENTE_DE_REVISION.entradas, A.PENDIENTE_DE_REVISION.salidas]);
  assert.deepEqual(Object.keys(T).filter((k) => !deWatari.includes(k)).sort(), ["de", "marca", "saldoInicial"]);
  assert.ok(MC.CUENTA_JS.includes("`Pantalla ${s.p + 1} de ${PANTALLAS.length}`") && T.marca === "Pantalla {n} de {total}");
  /* La marca de lo que falta confirmar va en un comentario, nunca en pantalla. */
  assert.match(readFileSync(new URL("src/data/contabilidadT7_2_a1_c2.js", RAIZ), "utf8"), /«Saldo inicial» es de Mello \(Cu-2\), con el rótulo \[W\]: PENDIENTE/);
});

test("★★★ el ayudante de Mello: sus líneas están en la auditoría, y cada línea de Watari que corrigen, una vez en su código", () => {
  assert.equal(MC.PARCHES.length, 4);
  for (const [id, viejo, nuevo] of MC.PARCHES) {
    assert.equal(MC.CUENTA_JS.split(viejo).length, 2, `${id}: lo de Watari`);
    if (id !== "Cu-3") assert.ok(MC.AUDITORIA.includes(nuevo.replace(/^renglones: \[|\],$/g, "")), `${id}: lo de Mello`);
  }
  assert.throws(() => MC.deMello("Saldo final"));
  assert.throws(() => MC.referenciaCorregida(MC.CUENTA_JS.replace("renglones: [],", "renglones: [ ],")), /Cu-2/);
  assert.deepEqual(MC.NO_APLICADAS, {});
});

test("★★★ regla 3 y lo interno: ningún número en los textos; ni «Iba aquí», ni nombres internos, ni la marca de lo pendiente en pantalla", () => {
  const textos = [];
  const recoger = (v, k) => { if (typeof v === "string") { if (k !== "pie" && k !== "id") textos.push(v); } else if (Array.isArray(v)) v.forEach((x) => recoger(x, k)); else if (v && typeof v === "object") for (const [kk, x] of Object.entries(v)) recoger(x, kk); };
  recoger(P); recoger(T);
  for (const t of textos) assert.doesNotMatch(t, /\d/, t);
  for (const interno of ["Iba aquí", "≈", "Near", "Mello", "Watari", "[W]", "ESCRITO POR CLAUDE", "PENDIENTE", "T7-1"]) assert.ok(!textos.join("\n").includes(interno), interno);
  assert.doesNotMatch(FUENTE.replace(/\/\*[\s\S]*?\*\//g, ""), /Iba aquí/);
});

test("★★★ la mecánica repetida: la justificación de Watari que pide Mello está escrita en la ficha del componente, en un comentario", () => {
  const comentarios = FUENTE.match(/\/\*[\s\S]*?\*\//g).join("\n");
  assert.ok(comentarios.includes(`«${MC.MECANICA_REPETIDA}»`));
});

/* ═══════════ 2 · LA PIEZA ↔ LA REFERENCIA CORREGIDA, ESTADO POR ESTADO ═══════════ */

async function compararRecorrido(recorrido, reducido) {
  REDUCIDO = reducido;
  const casa = await montar("casa");
  const ref = await montar("ref");
  let pasos = 0;
  try {
    assert.deepEqual(casa.leer(), ref.leer(), "al empezar");
    for (const [k, paso] of recorrido.entries()) {
      await hacer(casa, paso); await hacer(ref, paso);
      assert.deepEqual(casa.leer(), ref.leer(), `paso ${k + 1} · ${paso.join(" ")}`);
      await tick(400);
      assert.deepEqual(casa.leer(), ref.leer(), `paso ${k + 1} · ${paso.join(" ")} (400 ms después)`);
      pasos += 2;
    }
  } finally {
    casa.desmontar(); ref.desmontar(); REDUCIDO = false;
  }
  return pasos;
}

test("★★★ estado por estado, la pieza dice y muestra lo mismo que la referencia corregida (dos recorridos)", async () => {
  const n = (await compararRecorrido(RECORRIDO_LARGO, false)) + (await compararRecorrido(RECORRIDO_DERECHO, false));
  assert.ok(n >= 80, `solo ${n} comparaciones`);
});

test("★★★ con movimiento reducido, también lo mismo que la referencia: nada llega ni sale animado y el estado final es el correcto", async () => {
  await compararRecorrido(RECORRIDO_LARGO, true);
  REDUCIDO = true;
  const m = await montar("casa");
  try {
    for (const paso of RECORRIDO_DERECHO.slice(0, 6)) {
      await hacer(m, paso);
      const l = m.leer();
      assert.deepEqual([l.bodega.saliendo, l.bodega.llegaron], [0, 0], paso.join(" "));
    }
    assert.equal(m.leer().bodega.vivas, 5);
    assert.ok(C.CSS_T7CS.includes("@media (prefers-reduced-motion: reduce) { .t7cs *, .t7cs *::before, .t7cs *::after { animation: none !important; transition: none !important; } }"));
  } finally {
    m.desmontar(); REDUCIDO = false;
  }
});

/* ═══════════ 3 · MELLO: Cu-1, Cu-2 Y Cu-3 ═══════════ */

const sumar = (rs) => rs.reduce((t, r) => t + r.cajas, 0);
async function hastaLaPantalla3(cual) {
  const m = await montar(cual);
  for (const paso of RECORRIDO_DERECHO.slice(0, 1 + D.HECHOS.length + 1)) await hacer(m, paso);
  return m;
}

test("★★★ Cu-1 (prueba de Mello): al final de la pantalla 3, el costo tiene 2 renglones y el haber de Inventario tiene 5; antes de responder, el costo no está", async () => {
  assert.equal(MC.PRUEBA_CU1, "al final de la pantalla 3, el costo tiene 2 renglones y el haber de Inventario tiene 5");
  const m = await hastaLaPantalla3("casa");
  try {
    assert.equal(m.leer().marca, "Pantalla 3 de 5");
    assert.equal(m.leer().cmv, null, "antes de responder, la cuenta del costo no aparece");
    await m.op("al-cierre"); await m.op("nunca");
    assert.equal(m.leer().cmv, null, "ni con los errores");
    await m.op("cada-venta"); await tick(400);
    let l = m.leer();
    assert.equal(l.cmv.length, 2);
    assert.equal(sumar(l.inv.haber.renglones), 5);
    /* La venta anterior ya está; solo cae «Otra venta» (el «mira esto» no cambia). */
    const vende = D.HECHOS.find((x) => x.id === "vende");
    assert.deepEqual(l.cmv, [{ rot: D.renglonDe(vende.texto), cajas: vende.cajas, nuevo: false }, { rot: T.otraVenta, cajas: 1, nuevo: true }]);
    assert.deepEqual(l.inv.haber.renglones.map((r) => r.rot), [...D.HECHOS.filter((x) => x.lado === "haber").map((x) => D.renglonDe(x.texto)), T.otraVenta]);
    /* Y así se queda hasta el resumen. */
    for (const paso of RECORRIDO_DERECHO.slice(1 + D.HECHOS.length + 2)) await hacer(m, paso);
    l = m.leer();
    assert.equal(l.marca, "Pantalla 5 de 5");
    assert.deepEqual([l.cmv.length, sumar(l.inv.haber.renglones)], [2, 5]);
  } finally {
    m.desmontar();
  }
});

test("★★★ Cu-1: la misma prueba, contra el código de Watari sin corregir, da lo que vio Mello (el costo antes de responder, y con un solo renglón)", async () => {
  const m = await hastaLaPantalla3("cruda");
  try {
    assert.deepEqual(m.leer().cmv, [], "el costo ya aparece, vacío");
    await m.op("cada-venta");
    assert.equal(m.leer().cmv.length, 1);
  } finally {
    m.desmontar();
  }
});

/* El saldo (largo de su barra, en cajas) contra el debe menos el haber de la cuenta, y contra la bodega. */
const cuadra = (l) => sumar(l.inv.debe.renglones) - sumar(l.inv.haber.renglones) === l.inv.saldo && l.inv.saldo === l.bodega.vivas;

test("★★★ Cu-2: «Saldo inicial» en el debe desde la portada, y el saldo es debe menos haber (y la bodega) en todo momento; al final, 9, 5 y 4", async () => {
  const m = await montar("casa");
  try {
    let l = m.leer();
    assert.deepEqual(l.inv.debe.renglones, [{ rot: MC.SALDO_INICIAL, cajas: D.INICIO, nuevo: false }]);
    assert.ok(cuadra(l), "en la portada");
    for (const paso of RECORRIDO_LARGO) {
      await hacer(m, paso); await tick(400);
      l = m.leer();
      assert.ok(cuadra(l), `${paso.join(" ")}: debe ${sumar(l.inv.debe.renglones)}, haber ${sumar(l.inv.haber.renglones)}, saldo ${l.inv.saldo}, bodega ${l.bodega.vivas}`);
    }
    assert.equal(l.marca, "Pantalla 5 de 5");
    assert.deepEqual({ debe: sumar(l.inv.debe.renglones), haber: sumar(l.inv.haber.renglones), saldo: l.inv.saldo }, MC.CU2_CUADRA);
  } finally {
    m.desmontar();
  }
  /* Sin la corrección (Watari), no cuadra: es la falla que vio Mello. */
  const c = await montar("cruda");
  try {
    assert.equal(cuadra(c.leer()), false);
  } finally {
    c.desmontar();
  }
});

test("★★★ Cu-3: el porqué de la pantalla 3 va plegado; a la vista quedan el texto, las opciones y el acierto (≤ 60 palabras)", async () => {
  const m = await hastaLaPantalla3("casa");
  const P3 = P.pantallas[2];
  try {
    await m.op("cada-venta");
    const l = m.leer();
    assert.deepEqual(l.msg.porque, { texto: T.porQue, abierto: "false" });
    assert.equal(l.msg.texto, `${T.correcto}${P3.bien}${T.porQue}`);
    /* Lo que Mello cuenta: el texto, las opciones y el acierto. Él da 22 + 14 + 13 = 49; el medidor de la casa cuenta 23 en el texto: 50. */
    assert.equal(MC.CU3_A_LA_VISTA, 49);
    assert.deepEqual([CE.contarPalabras(P3.texto), CE.contarPalabras(P3.opciones.map((o) => o.t).join(" ")), CE.contarPalabras(P3.bien)], [23, 14, 13]);
    const medida = CE.medirTarjeta(CE.tarjetaDe(m.caja), w);
    assert.ok(medida.texto <= CE.UMBRAL_B2_PALABRAS, `${medida.texto} palabras a la vista`);
    await m.porque();
    assert.equal(m.leer().msg.texto, `${T.correcto}${P3.bien}${P3.porque}`, "y se abre");
  } finally {
    m.desmontar();
  }
});

/* ═══════════ 4 · PANTALLA POR PANTALLA: ESCALERA, FOCO Y FIGURA ═══════════ */

test("★★★ pantalla 1: la figura espera atenuada (cinco cajas y el saldo inicial), y «Empezar» lleva el foco al texto de la pantalla 2", async () => {
  const m = await montar("casa");
  try {
    const l = m.leer();
    assert.deepEqual([l.marca, l.dormida, l.txt, l.hecho, l.bodega.vivas, l.inv.saldo, l.cmv, l.seguir], ["Pantalla 1 de 5", true, P.pantallas[0].texto, null, 5, 5, null, { texto: deNear("portada").boton, inactivo: false }]);
    assert.equal(l.pie, P.pantallas[0].pie);
    await m.seguir();
    enFoco(m.q(".$b-txt"), "el texto de la pantalla 2");
    assert.equal(m.leer().dormida, false);
  } finally {
    m.desmontar();
  }
});

test("★★★ pantalla 2: la escalera en los lados (pista; luego ENTRA o SALE de Near con el lado bueno en blanco), el foco al mensaje, y cada acierto mueve bodega, renglón y saldo a la vez", async () => {
  const m = await montar("casa");
  const L = P.pantallas[1];
  try {
    await m.seguir();
    let l = m.leer();
    assert.equal(l.hecho, D.HECHOS[0].texto);
    assert.deepEqual([l.inv.debe.boton, l.inv.haber.boton, l.seguir.inactivo], [true, true, true]);
    assert.equal(m.q('[data-t="inv"] [data-lado="debe"]').tagName, "BUTTON", "botones de verdad");
    /* 1.er error: la pista. */
    await m.lado("haber");
    l = m.leer();
    assert.equal(l.msg.texto, `${T.incorrecto} ${L.pista}`);
    assert.deepEqual([l.inv.haber.clases, l.inv.haber.pastilla, l.inv.haber.etiqueta], [["blanco", "mal"], T.noVaAqui, `${T.ladoHaber} de ${T.inventario}. ${T.incorrecto}`]);
    assert.deepEqual(l.inv.debe.clases, ["blanco"]);
    enFoco(m.q(".$b-msg"), "el mensaje");
    /* 2.º error: la devolución de Near y el lado bueno en blanco. */
    await m.lado("haber");
    l = m.leer();
    assert.equal(l.msg.texto, `${T.incorrecto} ${D.HECHOS[0].devolucion}`);
    assert.deepEqual(l.inv.debe.clases, ["blanco", "pista"]);
    assert.ok(l.msg.mal);
    /* Acierto: entran las cajas, cae el renglón y el saldo crece, a la vez. */
    await m.lado("debe");
    l = m.leer();
    assert.equal(l.msg.texto, T.correcto);
    enFoco(m.q(".$b-msg"), "el mensaje del acierto");
    assert.deepEqual([l.bodega.vivas, l.bodega.llegaron, l.inv.saldo], [8, 3, 8]);
    assert.deepEqual(l.inv.debe.renglones.at(-1), { rot: D.renglonDe(D.HECHOS[0].texto), cajas: 3, nuevo: true });
    assert.equal(l.hecho, D.HECHOS[1].texto);
    /* La venta: salen dos cajas, que se van al terminar su animación. */
    await m.lado("haber");
    l = m.leer();
    assert.deepEqual([l.bodega.vivas, l.bodega.saliendo, l.inv.saldo], [6, 2, 6]);
    await tick(C.TIEMPOS.sale - 1);
    assert.equal(m.leer().bodega.saliendo, 2);
    await tick(1);
    assert.equal(m.leer().bodega.saliendo, 0);
    for (const x of D.HECHOS.slice(2)) await m.lado(x.lado);
    l = m.leer();
    assert.deepEqual([l.hecho, l.bodega.vivas, l.inv.debe.boton, l.seguir.inactivo], [null, 5, false, false]);
    assert.equal(l.msg.texto, `${T.correcto}${L.bien}${T.porQue}`);
    await m.porque();
    enFoco(m.q("[data-porque]"), "el porqué que se abre");
    assert.equal(m.leer().msg.texto, `${T.correcto}${L.bien}${L.porque}`);
  } finally {
    m.desmontar();
  }
});

test("★★★ pantallas 3, 4 y 5: la escalera en las opciones (pista; luego el texto propio de la opción, con la buena en blanco), el foco, el conteo y el resumen", async () => {
  const m = await hastaLaPantalla3("casa");
  const [P3, P4, P5] = P.pantallas.slice(2);
  try {
    await m.op("nunca");
    let l = m.leer();
    assert.equal(l.msg.texto, `${T.incorrecto} ${P3.pista}`);
    assert.deepEqual(l.ops.find((o) => o.id === "nunca"), { id: "nunca", texto: `${P3.opciones[2].t}${T.noVaAqui}`, clases: ["mal"], inactiva: false, etiqueta: `${P3.opciones[2].t} ${T.incorrecto}` });
    enFoco(m.q(".$b-msg"));
    await m.op("al-cierre");
    l = m.leer();
    assert.equal(l.msg.texto, `${T.incorrecto} ${P3.mal["al-cierre"]}`);
    assert.deepEqual(l.ops.find((o) => o.id === "cada-venta").clases, ["pista"]);
    await m.op("cada-venta");
    l = m.leer();
    assert.deepEqual(l.ops.map((o) => [o.id, o.clases, o.inactiva]), [["cada-venta", ["bien"], true], ["al-cierre", [], true], ["nunca", [], true]]);
    assert.equal(l.ops[0].etiqueta, `${P3.opciones[0].t} ${T.correcto}.`);
    enFoco(m.q(".$b-msg"));
    await m.seguir();
    enFoco(m.q(".$b-txt"));
    /* Pantalla 4: primero se cuenta; luego, la pregunta. */
    l = m.leer();
    assert.deepEqual([l.contar, l.ops.length, l.inv.conteo, l.seguir.inactivo], [T.contar, 0, null, true]);
    await m.contar();
    l = m.leer();
    assert.deepEqual([l.contar, l.ops.length, l.inv.conteo, l.bodega.numeros], [null, 3, 4, [1, 2, 3, 4]]);
    await m.op("hallar");
    assert.equal(m.leer().msg.texto, `${T.incorrecto} ${P4.pista}`);
    await m.op("verificar");
    assert.equal(m.leer().msg.texto, `${T.correcto}${P4.bien}${T.porQue}`);
    await m.seguir();
    /* El resumen: la cuenta final, «Entradas» y «Salidas», y las tres líneas de Near. */
    l = m.leer();
    assert.deepEqual([l.txt, l.lista, l.inv.debe.sub, l.inv.haber.sub, l.seguir], [null, [...P5.lista, P5.siguiente], T.entradas, T.salidas, { texto: T.siguientePieza, inactivo: false }]);
    enFoco(m.raiz, "sin texto, el foco va a la pieza");
  } finally {
    m.desmontar();
  }
});

test("★★ cada pantalla se monta sola (como la mide la barra de enganche), en el estado de llegar a ella", async () => {
  const m = await montar("casa");
  const tramos = [RECORRIDO_DERECHO.slice(0, 1), RECORRIDO_DERECHO.slice(1, 7), RECORRIDO_DERECHO.slice(7, 9), RECORRIDO_DERECHO.slice(9, 12), []];
  try {
    for (let k = 0; k < P.pantallas.length; k++) {
      const sola = await montar("casa", { pieza: { ...P, pantallas: P.pantallas.slice(k) } });
      try {
        assert.deepEqual(sola.leer(), m.leer(), P.pantallas[k].id);
      } finally {
        sola.desmontar();
      }
      for (const paso of tramos[k]) await hacer(m, paso);
      await tick(400);
    }
  } finally {
    m.desmontar();
  }
});

/* ═══════════ 5 · CSS: LA HOJA DE WATARI, LOS COLORES, 12 PX Y 44 PX ═══════════ */

const reglas = (css) => [...css.replace(/\/\*[\s\S]*?\*\//g, "").replace(/@media[^{]*\{([^{}]*\{[^{}]*\})*\s*\}/g, "").replace(/@keyframes[^{]*\{([^{}]*\{[^{}]*\})*\s*\}/g, "").matchAll(/([^{}]+)\{([^{}]*)\}/g)]
  .map((m) => `${m[1].trim().replace(/\s+/g, " ")} { ${m[2].trim().replace(/\s+/g, " ").replace(/;?$/, ";")} }`);

test("★★★ la hoja es la de la C2 regla por regla (prefijo t7cs-), con la letra a 12 px y las reglas propias de los lados que son botones", () => {
  const deWatari = reglas(MC.CUENTA_CSS.replace(/\.c2c?(?![\w-])/g, ".t7cs").replace(/c2c?-/g, "t7cs-").replace(/10\.5px/g, "12px"));
  const casa = reglas(C.CSS_T7CS);
  /* Lo de Watari que la casa no usa (el deslizador, «Responder», las cifras y la pastilla «Iba aquí» no son de esta pieza) o cambia (abajo). */
  assert.deepEqual(deWatari.filter((r) => !casa.includes(r)).map((r) => r.split(" {")[0]), [
    ".t7cs-t", ".t7cs-lado", ".t7cs-renglon", ".t7cs-sig",
    ".t7cs", ".t7cs-num", ".t7cs-pastilla.iba", ".t7cs-msg", ".t7cs-msg p",
    ".t7cs-responder, .t7cs-seguir", ".t7cs-responder", ".t7cs-responder[aria-disabled=\"true\"]", ".t7cs-seguir",
    ".t7cs-rango", ".t7cs-rango::-webkit-slider-runnable-track", ".t7cs-rango::-moz-range-track", ".t7cs-rango::-webkit-slider-thumb", ".t7cs-rango::-moz-range-thumb",
    ".t7cs-rango[aria-disabled=\"true\"]", ".t7cs-rango:focus-visible", ".t7cs-marcas", ".t7cs-marcas i",
  ]);
  /* Lo que pone la casa: sin fondo propio (va sobre el panel), el foco sin contorno en la raíz y el mensaje, los lados que son botones, los renglones largos que parten, y la viñeta de la lista. */
  assert.deepEqual(casa.filter((r) => !deWatari.includes(r)), [
    ".t7cs { --texto: #F8F9FA; --atenuado: #A8B6C8; --neutro: #B8C4D4; --teal-texto: #3FA69A; --ambar: #E9C46A; --coral: #E76F51; --coral-texto: #EE8266; --hundido: rgba(10,20,34,.45); --hundido-borde: rgba(248,249,250,.12); display: grid; gap: 12px; color: var(--texto); font: 400 15px/1.5 \"Inter\", system-ui, sans-serif; min-width: 0; outline: none; }",
    ".t7cs-msg { margin: 0; padding: 10px 12px; background: rgba(184,196,212,.12); border-left: 3px solid var(--neutro); border-radius: 0 10px 10px 0; font-size: 14px; line-height: 1.45; outline: none; }",
    ".t7cs-msg p { margin: 0; outline: none; }",
    ".t7cs-seguir { width: 100%; min-height: 44px; border: 0; cursor: pointer; font: 700 14px/1.2 \"Sora\", sans-serif; padding: 12px 16px; background: var(--neutro); color: #1D3557; border-radius: 12px; }",
    ".t7cs-t { padding: 10px 12px; display: grid; gap: 8px; min-width: 0; }",
    ".t7cs-lado { display: grid; align-content: start; gap: 6px; min-height: 64px; min-width: 0; padding: 6px 8px; border: 0; border-radius: 8px; background: transparent; color: inherit; font: inherit; text-align: left; margin: 0; }",
    ".t7cs-lado.blanco:focus-visible { outline: 2px solid #F8F9FA; outline-offset: 2px; }",
    ".t7cs-renglon { display: grid; gap: 2px; font-size: 12px; line-height: 1.3; color: var(--atenuado); overflow-wrap: anywhere; }",
    ".t7cs-lista li { list-style: disc; }",
    ".t7cs-lista li.t7cs-sig { list-style: none; margin-left: -16px; color: var(--atenuado); font-size: 13px; }",
  ]);
  const tamanos = [...C.CSS_T7CS.matchAll(/font-size:\s*(\d+(?:\.\d+)?)px|\bfont:\s*(?:\d{3}\s+)?(\d+(?:\.\d+)?)px/g)].map((x) => Number(x[1] ?? x[2]));
  assert.ok(tamanos.length >= 15);
  assert.deepEqual(tamanos.filter((px) => px < 12), []);
});

test("★★★ colores: teal y ámbar solo en los rótulos DEBE y HABER; coral solo en el error; el acierto, ✓ con borde neutro", () => {
  const css = reglas(C.CSS_T7CS);
  const con = (token) => css.filter((r) => r.split("{")[1].includes(`var(--${token})`)).map((r) => r.split(" {")[0]);
  assert.deepEqual(con("teal-texto"), ['.t7cs-lado[data-lado="debe"] .t7cs-lado-rot']);
  assert.deepEqual(con("ambar"), ['.t7cs-lado[data-lado="haber"] .t7cs-lado-rot']);
  assert.deepEqual(con("coral"), [".t7cs-pastilla.mal", ".t7cs-msg.mal", ".t7cs-lado.blanco.mal", ".t7cs-op.mal"]);
  assert.deepEqual(con("coral-texto"), [".t7cs-pastilla.mal"]);
  assert.ok(css.includes(".t7cs-pastilla.ok { color: var(--texto); border: 1px solid var(--texto); }"));
  assert.ok(css.includes(".t7cs-op.pista, .t7cs-op.bien { border: 2px solid var(--texto); padding: 9px 11px; }"));
  assert.equal((FUENTE.match(/#2A9D8F|#3FA69A|#E9C46A|#E76F51/gi) ?? []).length, 3, "solo en la declaración de los tokens");
});

test("★★★ 44 px: los botones de la pieza, «¿Por qué?» y los lados (88 px mientras son botones)", () => {
  const css = reglas(C.CSS_T7CS);
  for (const s of [".t7cs-seguir", ".t7cs-boton", ".t7cs-op", ".t7cs-porque"]) assert.ok(css.some((r) => r.startsWith(`${s} {`) && r.includes("min-height: 44px")), s);
  assert.ok(css.some((r) => r.startsWith(".t7cs-lado.blanco {") && r.includes("min-height: 88px")));
});

/* ═══════════ 6 · CATÁLOGO Y VISTA ═══════════ */

test("★★★ fuera del catálogo de FP: es de Aprender, el id no está en el servidor y no registra nada", () => {
  const tema = SUBJECTS.contabilidad.topics.find((t) => t.id === TEMA_T7_2);
  const a = tema.actividades.find((x) => x.id === A.A1_ID);
  assert.deepEqual(a.clasificacion, { tipo: APRENDER });
  const dir = new URL("supabase/migrations/", RAIZ);
  assert.deepEqual(readdirSync(dir).filter((f) => readFileSync(new URL(f, dir), "utf8").includes(A.A1_ID)), []);
  for (const f of ["src/components/mecanicas/libros/t7/LaCuentaQueSiSeMueveC2.jsx", "src/data/contabilidadT7_2_a1_c2.js", "src/data/contabilidadT7_2.js"]) {
    assert.doesNotMatch(readFileSync(new URL(f, RAIZ), "utf8"), /from\s+["'][^"']*\/(fp|lib\/supabase)[^"']*["']|registrarActividad(Completada)?\s*\(|\.rpc\s*\(/, f);
  }
});

test("★★★ mismo id y misma posición: primera pieza de T7-2, en el catálogo y en la vista, con el componente nuevo", () => {
  assert.equal(A.A1_ID, "t7-2-a1-la-cuenta-que-si-se-mueve");
  const tema = SUBJECTS.contabilidad.topics.find((t) => t.id === TEMA_T7_2);
  assert.equal(tema.title, "Inventarios II: el sistema permanente");
  assert.equal(TEMA_T7_2, "inventarios-permanente");
  const temas = SUBJECTS.contabilidad.topics.map((t) => t.id);
  assert.equal(temas.indexOf(TEMA_T7_2), temas.indexOf("inventarios-periodico") + 1);
  assert.ok(VISTAS.has(TEMA_T7_2));
  assert.equal(vistaDeTema(TEMA_T7_2), TEMA_T7_2);
  assert.equal(tema.actividades[0].id, A.A1_ID);
  assert.equal(tema.actividades[0].nombre, P.titulo);
  assert.equal(PIEZAS_T7_2[0].pieza, P);
  assert.equal(PIEZAS_T7_2[0].Pieza, LaCuentaQueSiSeMueveC2);
});

test("★★ en la vista del tema: «Pieza 1 de N», y al final «Siguiente pieza» lleva el foco a la pieza 2", async () => {
  const v = await montarReact(h(AuthContext.Provider, { value: { usuario: null, pedirCuenta: () => {} } }, h(ContabilidadT7_2View, { onBack() {} })));
  try {
    const piezas = [...v.caja.querySelectorAll("[data-pieza]")];
    assert.equal(piezas[0].dataset.pieza, A.A1_ID);
    assert.ok(v.caja.textContent.includes(`PIEZA 1 DE ${PIEZAS_T7_2.length}`));
    const a1 = conAcciones({ caja: piezas[0].closest("section"), raiz: piezas[0], pref: "casa" });
    for (const paso of RECORRIDO_DERECHO) await hacer(a1, paso);
    assert.equal(a1.leer().marca, "Pantalla 5 de 5");
    await a1.seguir();
    enFoco(piezas[1], "el foco va a la pieza 2");
    assert.equal(piezas[1].dataset.pieza, PIEZAS_T7_2[1].pieza.id);
  } finally {
    v.desmontar();
  }
});
