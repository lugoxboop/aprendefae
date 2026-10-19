import { test } from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { JSDOM, VirtualConsole } from "jsdom";

/*
 * ═══════════════════════════════════════════════════════════════════════════
 * POLÍTICA MONETARIA · LAS DOS ACTIVIDADES NUEVAS (paquete de Levi).
 *
 *   A  ¿Por Cuál Arteria Entra?   las 11 respuestas; ninguna estrategia fija
 *      pasa de 4 de 11; cada explicación según el eslabón y el tipo de error
 *   B  Las Dos Entradas           las 12 respuestas; el mismo botón siempre da
 *      6 de 12; cada explicación según la pregunta y el error
 *   ·  el resumen cuenta lo que se guarda; el demo no guarda nada
 *   ·  sitio en el camino, nivel y FP: A Análisis 50, B Aplicación 25
 * ═══════════════════════════════════════════════════════════════════════════
 */

const dom = new JSDOM("<!doctype html><html><body></body></html>", { url: "http://localhost/", virtualConsole: new VirtualConsole() });
const w = dom.window;
w.matchMedia = (q) => ({ matches: false, media: q, addEventListener() {}, removeEventListener() {}, addListener() {}, removeListener() {} });
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

const M = await import("../../../data/monetariaRepaso.js");
const { default: PorCualArteria } = await import("../maquinas/PorCualArteria.jsx");
const { default: DosEntradas, ordenarPreguntas } = await import("../maquinas/DosEntradas.jsx");
const { SUBJECTS, HACER, actividadesDeTipo } = await import("../../../data/subjects.js");
const { ASI_SE_JUEGA } = await import("../../../data/asiSeJuega.js");
const { REGLAS } = await import("../../../docente/etiquetasItem.js");
const { conteoGuardado, formatoDe, FORMATO } = await import("../../../hacer/pantallaResumen.js");
const { ACTIVIDADES_FUERA_DEL_POOL } = await import("../../../repaso/items.js");
const { NOVEDADES } = await import("../../shared/contenidoNuevo.jsx");

const { ARTERIA, ESLABONES_ARTERIA, OPCIONES_ARTERIA, ERRORES_ARTERIA, DOS_ENTRADAS, PREGUNTAS_DOS_ENTRADAS, DECISIONES } = M;

const Marco = ({ children }) => h("div", null, children);
const montar = async (Componente, props = {}) => {
  const caja = document.createElement("div");
  document.body.appendChild(caja);
  const raiz = createRoot(caja);
  await act(async () => { raiz.render(h(Componente, { Marco, ...props })); });
  return { caja, desmontar: () => { act(() => raiz.unmount()); caja.remove(); } };
};
const boton = (caja, texto) => [...caja.querySelectorAll("button")].find((b) => b.textContent.trim() === texto)
  ?? [...caja.querySelectorAll("button")].find((b) => b.textContent.includes(texto));
const clic = async (el) => { assert.ok(el, "no está el botón"); await act(async () => { el.click(); }); };
const textoDe = (caja, s) => caja.querySelector(s)?.textContent ?? null;

/* ═══════════════════ A · ¿POR CUÁL ARTERIA ENTRA? ═══════════════════ */

const RESPUESTAS_A = {
  "fondos-mas-caros": "ninguna",
  "entran-capitales": "ninguna",
  "rendimientos-suben": "ninguna",
  "peso-se-fortalece": "ninguna",
  "credito-negado": "c",
  "electrodomesticos-a-cuotas": "c",
  "pospone-maquinaria": "i",
  "congela-obra": "i",
  "no-amplia-planta": "i",
  "mas-importados": "xn",
  "afuera-piden-menos": "xn",
};

test("★★★ A: las 11 respuestas, una por eslabón, las de la tabla de Gen", () => {
  assert.equal(ESLABONES_ARTERIA.length, 11);
  assert.deepEqual(Object.fromEntries(ESLABONES_ARTERIA.map((e) => [e.id, e.respuesta])), RESPUESTAS_A);
  assert.deepEqual(OPCIONES_ARTERIA.map((o) => o.nombre), [
    "Arteria 1 · Consumo (C)", "Arteria 2 · Inversión (I)", "Arteria 3 · Gasto público (Ḡ)",
    "Arteria 4 · Exportaciones netas (XN)", "Todavía no llega a ninguna",
  ]);
});

test("★★★ A: ninguna estrategia de respuesta fija pasa de 4 de 11 (y Ḡ nunca es la respuesta)", () => {
  const cuenta = Object.fromEntries(OPCIONES_ARTERIA.map((o) => [o.id, ESLABONES_ARTERIA.filter((e) => e.respuesta === o.id).length]));
  assert.deepEqual(cuenta, { c: 2, i: 3, g: 0, xn: 2, ninguna: 4 });
  for (const n of Object.values(cuenta)) assert.ok(n <= 4);
});

test("★★★ A: el acierto de cada eslabón y el error de su tipo", () => {
  for (const e of ESLABONES_ARTERIA) assert.equal(M.retroArteria(e, e.respuesta), `✅ ${e.acierto}`, e.id);
  const por = (id) => ESLABONES_ARTERIA.find((e) => e.id === id);
  const casos = [
    [por("pospone-maquinaria"), "ninguna", "A"],
    [por("mas-importados"), "ninguna", "A"],
    [por("credito-negado"), "ninguna", "A"],
    [por("peso-se-fortalece"), "c", "B"],
    [por("fondos-mas-caros"), "xn", "B"],
    [por("congela-obra"), "c", "C"],
    [por("no-amplia-planta"), "xn", "C"],
    [por("afuera-piden-menos"), "i", "D"],
    [por("mas-importados"), "c", "D"],
    /* Ḡ, sea cual sea el eslabón. */
    [por("pospone-maquinaria"), "g", "G"],
    [por("entran-capitales"), "g", "G"],
    [por("credito-negado"), "g", "G"],
    /* Era Consumo y tocó Inversión o Exportaciones netas (Levi). */
    [por("credito-negado"), "i", "E"],
    [por("electrodomesticos-a-cuotas"), "xn", "E"],
  ];
  for (const [e, elegida, tipo] of casos) {
    assert.equal(M.tipoDeErrorArteria(e, elegida), tipo, `${e.id} → ${elegida}`);
    assert.equal(M.retroArteria(e, elegida), `❌ ${ERRORES_ARTERIA[tipo]}`);
  }
});

test("★★★ A: ningún caso mudo — toda combinación de respuesta correcta y opción tocada tiene texto", () => {
  /*
   * Cada respuesta posible, con los eslabones reales y con uno sintético por
   * respuesta, por si el banco cambia. Ḡ no cuenta como respuesta posible: en
   * el modelo nunca lo es, y otra prueba exige que ningún eslabón la tenga.
   */
  const posibles = OPCIONES_ARTERIA.filter((o) => o.id !== "g");
  assert.equal(posibles.length, 4);
  const items = [...ESLABONES_ARTERIA, ...posibles.map((o) => ({ id: `sintetico-${o.id}`, respuesta: o.id, acierto: "Acierto sintético." }))];
  for (const e of items) {
    for (const o of OPCIONES_ARTERIA) {
      const texto = M.retroArteria(e, o.id);
      assert.ok(typeof texto === "string" && texto.length > 3, `${e.id} (era ${e.respuesta}) → tocó ${o.id}: sin texto`);
    }
  }
});

test("★★★ A: el banco aprobado — consumo por capacidad de gasto, nada de sustitución", () => {
  const por = (id) => ESLABONES_ARTERIA.find((e) => e.id === id);
  assert.equal(por("credito-negado").texto, "A una familia le niegan el crédito de consumo que pensaba pedir.");
  assert.equal(por("rendimientos-suben").texto, "Los rendimientos de CDT y cuentas de ahorro suben");
  assert.equal(por("rendimientos-suben").acierto, "Todavía no. Cambió lo que paga el ahorro, pero nadie ha cambiado aún cuánto gasta.");
  assert.equal(por("entran-capitales").texto, "Entran capitales extranjeros buscando mejores rendimientos");
  for (const id of ["credito-negado", "electrodomesticos-a-cuotas"]) {
    assert.equal(por(id).acierto, "Llega al Consumo (C). Con el crédito más caro, la familia tiene menos con qué consumir.", id);
  }
  assert.equal(ERRORES_ARTERIA.E, "Esa no es. Con el crédito más caro, son las familias las que tienen menos con qué consumir. Eso llega al consumo (C).");
  assert.equal(por("prima-en-cdt"), undefined);
  assert.equal(por("guardar-mas-atractivo"), undefined);
});

test("★★★ ninguna de las dos dice «CDT en vez de gastarla», «más atractivo que gastarla», «siempre» ni «una sola puerta»", () => {
  const fuentes = ["../../../data/monetariaRepaso.js", "../../../data/asiSeJuegaMonetaria.js", "../maquinas/PorCualArteria.jsx", "../maquinas/DosEntradas.jsx", "../maquinas/monetariaRepaso.jsx"]
    .map((f) => readFileSync(new URL(f, import.meta.url), "utf8")).join("\n");
  for (const prohibida of ["CDT en vez de gastarla", "más atractivo que gastarla", "siempre", "una sola puerta"]) {
    assert.ok(!fuentes.toLowerCase().includes(prohibida.toLowerCase()), `aparece «${prohibida}»`);
  }
});

test("★★★ A: los textos, tal cual", () => {
  assert.equal(ARTERIA.regla, "Se llega a una arteria cuando alguien cambia cuánto gasta.");
  assert.equal(ARTERIA.consigna, "Lee el eslabón. Toca la arteria a la que llega.");
  assert.equal(ARTERIA.cierre, "La tasa no reparte parejo. Entra fuerte por la inversión, llega al consumo porque las familias tienen menos con qué gastar y toca las exportaciones netas por el tipo de cambio. En el modelo, al gasto público no lo toca.");
  assert.deepEqual(M.PASOS_ARTERIA, [
    "Lee qué pasa en el eslabón y a quién le pasa.",
    "Pregúntate si alguien ya cambió cuánto gasta.",
    "Toca esa arteria, o toca que todavía no llega a ninguna.",
  ]);
  assert.equal(M.EJEMPLO_ARTERIA.texto, "Un hotel cancela la construcción de un ala nueva por el costo del crédito.");
  assert.equal(M.EJEMPLO_ARTERIA.acierto, "Llega a la Inversión (I). El hotel cambió cuánto va a gastar en construir, y lo movió la tasa.");
  assert.equal(M.ALT_TUTORIAL_ARTERIA, "Ejemplo: se lee el hecho del hotel y se toca la opción Arteria 2 · Inversión (I).");
  assert.ok(!ESLABONES_ARTERIA.some((e) => e.texto === M.EJEMPLO_ARTERIA.texto), "el ejemplo está fuera del banco");
});

test("★★★ A en pantalla: regla fija, un intento por eslabón, los 11, y el cierre con su texto", async () => {
  let entrega = null;
  const m = await montar(PorCualArteria, { onCompletar: (...a) => { entrega = a; } });
  try {
    assert.equal(textoDe(m.caja, "[data-regla]"), ARTERIA.regla);
    assert.equal(textoDe(m.caja, "[data-consigna]"), ARTERIA.consigna);
    for (let k = 0; k < 11; k++) {
      const texto = textoDe(m.caja, "[data-hecho]");
      const e = ESLABONES_ARTERIA.find((x) => x.texto === texto);
      assert.ok(e, `eslabón desconocido: ${texto}`);
      /* Los dos primeros, mal; el resto, bien. */
      const elegida = k < 2 ? (e.respuesta === "g" ? "c" : "g") : e.respuesta;
      await clic(boton(m.caja, OPCIONES_ARTERIA.find((o) => o.id === elegida).nombre));
      assert.ok(boton(m.caja, OPCIONES_ARTERIA[0].nombre).disabled, "un solo intento");
      assert.equal(textoDe(m.caja, "[data-regla]"), ARTERIA.regla, "la regla sigue a la vista");
      await clic(boton(m.caja, k === 10 ? "Ver resultado" : "Siguiente"));
    }
    assert.ok(entrega, "no llamó a onCompletar");
    const [pct, , detalle] = entrega;
    assert.equal(pct, (9 / 11) * 100);
    assert.equal(detalle.length, 11);
    assert.deepEqual(new Set(detalle.map((d) => d.item)), new Set(Object.keys(RESPUESTAS_A)));
    assert.deepEqual(conteoGuardado(detalle), { bien: 9, n: 11 }, "el resumen cuenta lo que se guarda");
    assert.equal(textoDe(m.caja, "[data-cierre-texto]"), ARTERIA.cierre);
  } finally { m.desmontar(); }
});

/* ═══════════════════ B · LAS DOS ENTRADAS ═══════════════════ */

const RESPUESTAS_B = {
  d1: "arriba", d2: "abajo", d3: "arriba", d4: "abajo", d5: "arriba", d6: "abajo",
  s1: "igual", s2: "igual", s3: "contra", s4: "contra", s5: "igual", s6: "contra",
};

test("★★★ B: las 12 respuestas, las de la tabla de Levi", () => {
  assert.equal(PREGUNTAS_DOS_ENTRADAS.length, 12);
  assert.deepEqual(Object.fromEntries(PREGUNTAS_DOS_ENTRADAS.map((p) => [p.id, p.correcta])), RESPUESTAS_B);
  assert.deepEqual(PREGUNTAS_DOS_ENTRADAS.filter((p) => p.tipo === "direccion").map((p) => p.texto), [
    "El Banco baja la tasa de intervención.", "El Banco sube la tasa de intervención.",
    "El Gobierno aumenta el gasto en infraestructura.", "El Gobierno recorta el gasto.",
    "El Gobierno baja los impuestos.", "El Gobierno sube los impuestos.",
  ]);
  assert.deepEqual(PREGUNTAS_DOS_ENTRADAS.filter((p) => p.tipo === "sentido").map((p) => p.texto), [
    "El Banco baja la tasa de intervención y el Gobierno aumenta el gasto en infraestructura.",
    "El Banco sube la tasa de intervención y el Gobierno sube los impuestos.",
    "El Banco sube la tasa de intervención y el Gobierno aumenta las transferencias.",
    "El Banco baja la tasa de intervención y el Gobierno recorta el gasto.",
    "El Banco baja la tasa de intervención y el Gobierno baja los impuestos.",
    "El Banco sube la tasa de intervención y el Gobierno baja los impuestos.",
  ]);
  /* El sentido de cada S es el que dan las direcciones de sus dos decisiones. */
  for (const p of PREGUNTAS_DOS_ENTRADAS.filter((x) => x.tipo === "sentido")) {
    const [a, b] = p.decisiones.map((d) => DECISIONES[d].direccion);
    assert.equal(p.correcta, a === b ? "igual" : "contra", p.id);
  }
});

test("★★★ B: responder siempre con el mismo botón da 6 de 12, no más", () => {
  for (const k of [0, 1]) {
    const bien = PREGUNTAS_DOS_ENTRADAS.filter((p) => M.preguntaDe(p).opciones[k].id === p.correcta).length;
    assert.equal(bien, 6);
  }
  for (const tipo of ["direccion", "sentido"]) {
    const grupo = PREGUNTAS_DOS_ENTRADAS.filter((p) => p.tipo === tipo);
    for (const o of M.preguntaDe(grupo[0]).opciones) assert.equal(grupo.filter((p) => p.correcta === o.id).length, 3, `${tipo}: ${o.id}`);
  }
});

test("★★★ B: cada explicación según la pregunta y el error", () => {
  const p = (id) => PREGUNTAS_DOS_ENTRADAS.find((x) => x.id === id);
  /* D: la explicación de esa decisión, acierte o falle. */
  assert.deepEqual(M.retroDosEntradas(p("d1"), "abajo"), { linea: "❌ Bajar la tasa abarata el crédito: empuja hacia arriba.", debajo: [] });
  assert.deepEqual(M.retroDosEntradas(p("d6"), "abajo"), { linea: "✅ Con más impuestos, las familias tienen menos para gastar. Eso empuja la demanda hacia abajo.", debajo: [] });
  /* S acierto: su línea, y debajo las dos direcciones. */
  assert.deepEqual(M.retroDosEntradas(p("s1"), "igual"), {
    linea: "✅ Van igual: las dos empujan la demanda para el mismo lado.",
    debajo: ["Bajar la tasa abarata el crédito: empuja hacia arriba.", "Más gasto del Gobierno empuja la demanda hacia arriba."],
  });
  assert.deepEqual(M.retroDosEntradas(p("s4"), "contra"), {
    linea: "✅ Van en contra: una empuja hacia arriba y la otra hacia abajo. El modelo no dice cuál pesa más.",
    debajo: ["Bajar la tasa abarata el crédito: empuja hacia arriba.", "Menos gasto del Gobierno empuja la demanda hacia abajo."],
  });
  /* S fallo: la pista, y debajo las mismas dos; S3 con las transferencias. */
  assert.deepEqual(M.retroDosEntradas(p("s3"), "igual"), {
    linea: "❌ Mira hacia dónde empuja cada una. Si es el mismo lado, van igual; si no, van en contra.",
    debajo: ["Subir la tasa encarece el crédito: empuja hacia abajo.", "Con más transferencias, las familias tienen más para gastar. Eso empuja la demanda hacia arriba."],
  });
});

test("★★★ B: los textos, tal cual", () => {
  assert.equal(DOS_ENTRADAS.consigna, "Lee qué decide el Banco, el Gobierno o los dos, y toca la respuesta.");
  assert.equal(DOS_ENTRADAS.objetivo, "El Banco y el Gobierno empujan la misma demanda. Aquí ves si empujan para el mismo lado.");
  assert.equal(DOS_ENTRADAS.cierre, "El Banco y el Gobierno empujan la misma demanda. Pueden empujar juntos, o uno puede deshacer lo que hace el otro.");
  assert.deepEqual(M.PASOS_DOS_ENTRADAS, ["Lee lo que decide el Banco, el Gobierno o los dos.", "Elige una de las dos respuestas."]);
  assert.equal(M.DIRECCION.pregunta, "¿Hacia dónde empuja la demanda?");
  assert.equal(M.SENTIDO.pregunta, "¿Van igual o en contra?");
  assert.equal(M.EJEMPLO_DOS_ENTRADAS.texto, "El Banco sube la tasa de intervención y el Gobierno aumenta el gasto en obras.");
  assert.equal(M.EJEMPLO_DOS_ENTRADAS.resolucion, "El Banco empuja hacia abajo y el Gobierno hacia arriba. Van en contra, así que una le quita fuerza a la otra.");
  assert.equal(M.ALT_TUTORIAL_DOS_ENTRADAS, "Ejemplo: se lee el caso y se toca \"Van en contra\".");
  assert.ok(!PREGUNTAS_DOS_ENTRADAS.some((p) => p.texto === M.EJEMPLO_DOS_ENTRADAS.texto), "el ejemplo está fuera del banco");
});

test("★★★ B en pantalla: primero las 6 de dirección, después las 6 de sentido, un toque cada una", async () => {
  let entrega = null;
  const m = await montar(DosEntradas, { onCompletar: (...a) => { entrega = a; } });
  try {
    assert.equal(textoDe(m.caja, "[data-objetivo]"), DOS_ENTRADAS.objetivo);
    const tipos = [];
    for (let k = 0; k < 12; k++) {
      const caja = m.caja.querySelector("[data-hecho]");
      tipos.push(caja.dataset.tipoPregunta);
      const p = PREGUNTAS_DOS_ENTRADAS.find((x) => x.texto === caja.textContent.replace(M.preguntaDe({ tipo: caja.dataset.tipoPregunta }).pregunta.toUpperCase(), ""));
      assert.ok(p, `pregunta desconocida: ${caja.textContent}`);
      const opciones = M.preguntaDe(p).opciones;
      /* La primera de cada tipo, mal; el resto, bien. */
      const elegida = k === 0 || k === 6 ? opciones.find((o) => o.id !== p.correcta) : opciones.find((o) => o.id === p.correcta);
      await clic(boton(m.caja, elegida.nombre));
      const linea = m.caja.querySelector('[role="status"]').textContent;
      assert.ok(linea.includes(M.retroDosEntradas(p, elegida.id).linea.slice(2)), `${p.id}: ${linea}`);
      if (p.tipo === "sentido") assert.equal(m.caja.querySelectorAll("[data-explicaciones] li").length, 2);
      await clic(boton(m.caja, k === 11 ? "Ver resultado" : "Siguiente"));
    }
    assert.deepEqual(tipos, [...Array(6).fill("direccion"), ...Array(6).fill("sentido")]);
    const [pct, , detalle] = entrega;
    assert.equal(pct, (10 / 12) * 100);
    assert.deepEqual(conteoGuardado(detalle), { bien: 10, n: 12 }, "el resumen cuenta lo que se guarda");
    assert.equal(textoDe(m.caja, "[data-cierre-texto]"), DOS_ENTRADAS.cierre);
  } finally { m.desmontar(); }
});

test("B: el orden barajado nunca mezcla los dos tipos", () => {
  for (let k = 0; k < 20; k++) {
    const orden = ordenarPreguntas();
    assert.deepEqual(orden.map((p) => p.tipo), [...Array(6).fill("direccion"), ...Array(6).fill("sentido")]);
    assert.deepEqual(new Set(orden.map((p) => p.id)), new Set(Object.keys(RESPUESTAS_B)));
  }
});

/* ═══════════════════ EL TUTORIAL, EL DEMO Y LOS REGISTROS ═══════════════════ */

test("★★★ el demo de cada tutorial resuelve el ejemplo y no guarda nada", async () => {
  for (const [Componente, id, opcion, resolucion] of [
    [PorCualArteria, ARTERIA.id, "Arteria 2 · Inversión (I)", M.EJEMPLO_ARTERIA.acierto],
    [DosEntradas, DOS_ENTRADAS.id, "Van en contra", M.EJEMPLO_DOS_ENTRADAS.resolucion],
  ]) {
    const asi = ASI_SE_JUEGA[id];
    assert.ok(asi, `${id} sin «Así se juega»`);
    assert.equal(`Ejemplo: ${asi.alt}`, id === ARTERIA.id ? M.ALT_TUTORIAL_ARTERIA : M.ALT_TUTORIAL_DOS_ENTRADAS);
    assert.ok(asi.guion.toques.some((t) => t.texto === opcion), `${id}: el guion toca «${opcion}»`);
    let llamadas = 0;
    const m = await montar(Componente, { modoDemo: true, ...asi.demo, onCompletar: () => { llamadas += 1; } });
    try {
      assert.equal(m.caja.querySelector("[data-encabezado]"), null, "el demo no lleva encabezado");
      await clic(boton(m.caja, opcion));
      assert.ok(m.caja.querySelector('[role="status"]').textContent.includes(resolucion), id);
      assert.equal(boton(m.caja, "Ver resultado"), undefined);
      assert.equal(llamadas, 0);
    } finally { m.desmontar(); }
  }
});

test("★★★ el sitio en el camino, el nivel y los FP: A Análisis 50, B Aplicación 25 (75 en total)", () => {
  const tema = SUBJECTS.macroeconomia.topics.find((t) => t.id === "politica-monetaria");
  const ids = actividadesDeTipo(tema, HACER).map((a) => a.id);
  const entre = (id, antes, despues) => {
    const k = ids.indexOf(id);
    assert.equal(ids[k - 1], antes, `${id}: antes`);
    assert.equal(ids[k + 1], despues, `${id}: después`);
  };
  /* Desde la 0091, «¿Qué tocó el Banco?» cierra Aplicación: es el nuevo vecino. */
  entre("las-dos-entradas", "a-quien-le-pega-la-tasa", "que-toco-el-banco");
  entre("por-cual-arteria-entra", "cadena-de-transmision", "explicaselo-a-un-deudor");
  const clas = (id) => tema.actividades.find((a) => a.id === id).clasificacion;
  assert.deepEqual(clas("por-cual-arteria-entra"), { tipo: HACER, modalidad: "evaluativa", dificultad: "dificil", fpBase: 50 });
  assert.deepEqual(clas("las-dos-entradas"), { tipo: HACER, modalidad: "evaluativa", dificultad: "medio", fpBase: 25 });
  const sql = readFileSync(new URL("../../../../supabase/migrations/0052_monetaria_dos_actividades.sql", import.meta.url), "utf8");
  assert.match(sql, /\('las-dos-entradas',\s+'macroeconomia', 'politica-monetaria', 'evaluativa', 'medio',\s+25, 1\)/);
  assert.match(sql, /\('por-cual-arteria-entra', 'macroeconomia', 'politica-monetaria', 'evaluativa', 'dificil', 50, 1\)/);
  assert.equal(actividadesDeTipo(tema, HACER).reduce((s, a) => s + a.clasificacion.fpBase, 0), 850);
});

test("★★ los registros: etiquetas del docente, formato del resumen, fuera del Repaso y en la lista de novedades", () => {
  for (const e of ESLABONES_ARTERIA) assert.equal(REGLAS[ARTERIA.id](e.id), e.texto);
  for (const p of PREGUNTAS_DOS_ENTRADAS) assert.equal(REGLAS[DOS_ENTRADAS.id](p.id), p.texto);
  assert.equal(formatoDe(ARTERIA.id), FORMATO.X_DE_N);
  assert.equal(formatoDe(DOS_ENTRADAS.id), FORMATO.X_DE_N);
  for (const id of [ARTERIA.id, DOS_ENTRADAS.id]) assert.ok(ACTIVIDADES_FUERA_DEL_POOL.includes(id), id);
  /* La fecha la pone el último commit, el día del despliegue: aquí solo la entrada. */
  assert.deepEqual(NOVEDADES.map(({ publicada, ...resto }) => resto), [
    { materia: "macroeconomia", tema: "politica-monetaria", tipo: "actividad", ids: ["las-dos-entradas", "por-cual-arteria-entra"] },
  ]);
});

/* ═══════════════════ EL PROGRESO NO DEPENDE DE LA POSICIÓN ═══════════════════ */

test("★★★ insertar las dos no toca el progreso ni los FP de nadie: todo va por id de actividad, nunca por posición", async () => {
  const { nodosDe } = await import("../../../hacer/completadas.js");
  const tema = SUBJECTS.macroeconomia.topics.find((t) => t.id === "politica-monetaria");
  const nuevas = new Set([ARTERIA.id, DOS_ENTRADAS.id,
    /* las dos de la 0073 */ "crea-o-cambia-de-manos", "la-escalera-del-encaje",
    /* las dos de la 0091 */ "en-que-talla-va", "que-toco-el-banco",
    /* los tres instrumentos (Célula A) */ "la-tasa-que-muerde", "repo-o-definitiva", "el-freno-del-encaje"]);
  const actuales = actividadesDeTipo(tema, HACER);
  /* El camino de antes: las doce de siempre, en su orden. */
  const antes = actuales.filter((a) => !nuevas.has(a.id));
  assert.equal(antes.length, 12);

  /* Un estudiante que ya completó, por ejemplo, la 6.ª y la 7.ª de antes (Cadena y Explícaselo). */
  const hechas = new Set([antes[5].id, antes[6].id, antes[0].id]);
  const hechasAntes = nodosDe(antes, hechas).filter((n) => n.completada).map((n) => n.id).sort();
  const hechasDespues = nodosDe(actuales, hechas).filter((n) => n.completada).map((n) => n.id).sort();
  assert.deepEqual(hechasDespues, hechasAntes, "las mismas actividades siguen hechas");
  for (const id of nuevas) assert.equal(nodosDe(actuales, hechas).find((n) => n.id === id).completada, false, `${id} no hereda nada`);
  /* Y cambiaron de posición: la prueba sí cubre el caso que importa. */
  assert.notEqual(actuales.findIndex((a) => a.id === antes[5].id), 5);

  /* Los FP de las doce de antes no cambian: mismos valores que en su migración. */
  const sql0031 = readFileSync(new URL("../../../../supabase/migrations/0031_politica_monetaria.sql", import.meta.url), "utf8");
  for (const a of antes) {
    const fila = new RegExp(`\\('${a.id}', 'macroeconomia', 'politica-monetaria', '(\\w+)', '(\\w+)', (\\d+)\\)`).exec(sql0031);
    assert.ok(fila, `${a.id} en la 0031`);
    assert.deepEqual([a.clasificacion.modalidad, a.clasificacion.dificultad, a.clasificacion.fpBase], [fila[1], fila[2], Number(fila[3])], a.id);
  }
  const sql0052 = readFileSync(new URL("../../../../supabase/migrations/0052_monetaria_dos_actividades.sql", import.meta.url), "utf8");
  for (const a of antes) assert.ok(!sql0052.includes(`'${a.id}'`), `la 0052 no toca ${a.id}`);

  /* En el servidor, el historial es por id de actividad en texto: no hay columna de posición. */
  const sql0003 = readFileSync(new URL("../../../../supabase/migrations/0003_fp_history.sql", import.meta.url), "utf8");
  assert.match(sql0003, /activity_id\s+text not null/);
  assert.match(sql0003, /on public\.fp_history \(user_id, activity_id\)/);
  assert.ok(!/posici|orden|position/i.test(sql0003.replace(/--.*$/gm, "")), "ninguna posición en fp_history");
  /* Y el cliente manda el id, no el índice. */
  const otorgar = readFileSync(new URL("../../../fp/otorgarFP.js", import.meta.url), "utf8");
  assert.match(otorgar, /p_activity_id: actividadId/);
});

test("★★ el radio de los nodos no se encoge pasados 12, y con 12 o menos es el de siempre", async () => {
  const { medidas } = await import("../../shared/CaminoHacer.jsx");
  const antes = (n) => Math.max(17, Math.min(30, Math.round(34 - n * 0.9)));
  for (let n = 1; n <= 12; n++) assert.equal(medidas(n).radio, antes(n), `n = ${n}`);
  for (const n of [13, 14, 20]) assert.equal(medidas(n).radio, medidas(12).radio, `n = ${n}`);
});
