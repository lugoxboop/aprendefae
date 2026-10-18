import { test } from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { JSDOM, VirtualConsole } from "jsdom";

/*
 * ═══════════════════════════════════════════════════════════════════════════
 * LOTE C2 · C1 · C7 DE LA CÉLULA B (versión final de Futaba, PASA de Shoko),
 * contra la entrega guardada letra por letra en
 * orquestador/conocimiento/paquetes/b5-lote-c2-c1-c7.md. Todo lo literal se
 * lee de esa entrega, no de los datos:
 *   · C2, la escalera de ayuda: cada caja de la capa 3 y cada parada de la
 *     capa 2 de la tabla, con su pista literal; al primer error sale la
 *     pista, y ni la devolución ni el texto; al segundo, la devolución y
 *     después el texto; las terceras opciones, con su devolución;
 *   · C1: los textos nuevos de las capas 3 y 4 (con sus pies), el paso 10
 *     que sale de T6 A2, el caso a de T6 A4 como ejemplo, las deudas sueltas
 *     de T6 A5 que llenan la fila de su grupo, los rótulos de las paradas
 *     que no aparecen antes de su paso y las cifras construidas de T5;
 *   · C7: los términos corregidos y los reemplazos de C7-5.
 * ═══════════════════════════════════════════════════════════════════════════
 */

const dom = new JSDOM("<!doctype html><html><body></body></html>", { url: "http://localhost/", virtualConsole: new VirtualConsole() });
const w = dom.window;
w.matchMedia = (q) => ({ matches: q.includes("reduce"), addEventListener() {}, removeEventListener() {}, addListener() {}, removeListener() {} });
w.requestAnimationFrame = (cb) => setTimeout(() => cb(performance.now()), 16);
w.cancelAnimationFrame = (id) => clearTimeout(id);
w.Element.prototype.scrollIntoView = () => {};
w.scrollBy = () => {};
for (const [k, v] of Object.entries({
  window: w, document: w.document, navigator: w.navigator, localStorage: w.localStorage,
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
const { decidir } = await import("./b5-capa3.mjs");
const { pegarPorcentaje } = await import("../t6Pieza5.js");

const T5A1 = await import("../../data/contabilidadT5Pieza1.js");
const T5A2 = await import("../../data/contabilidadT5Pieza2.js");
const T6A1 = await import("../../data/contabilidadT6Pieza1.js");
const T6A2 = await import("../../data/contabilidadT6Pieza2.js");
const T6A3 = await import("../../data/contabilidadT6Pieza3.js");
const T6A4 = await import("../../data/contabilidadT6Pieza4.js");
const T6A5 = await import("../../data/contabilidadT6Pieza5.js");
const C = async (ruta) => (await import(`../../components/mecanicas/libros/${ruta}.jsx`)).default;
const { ESCENAS_TEMA5 } = await import("../../components/mecanicas/libros/tema5/escenasTema5.jsx");
const { ESCENAS_TEMA6 } = await import("../../components/mecanicas/libros/tema6/escenasTema6.jsx");

const raiz = new URL("../../../", import.meta.url);
const leer = (ruta) => readFileSync(new URL(ruta, raiz), "utf8");

/* ═══════════ LA ENTREGA ═══════════ */

const ENTREGA = leer("orquestador/conocimiento/paquetes/b5-lote-c2-c1-c7.md");
/* Una sección: desde su título hasta el siguiente título del mismo nivel o mayor. */
function seccion(titulo) {
  const i = ENTREGA.indexOf(`\n${titulo}`);
  assert.ok(i >= 0, `la entrega trae «${titulo}»`);
  const nivel = titulo.match(/^#+/)[0].length;
  const resto = ENTREGA.slice(i + 1);
  const fin = resto.slice(1).search(new RegExp(`\\n#{1,${nivel}} `));
  return fin === -1 ? resto : resto.slice(0, fin + 1);
}
/* Las filas de la primera tabla de un texto, sin cabecera ni filete. */
const filas = (texto) => texto.split("\n").filter((l) => l.startsWith("|")).slice(2).map((l) => l.split("|").slice(1, -1).map((c) => c.trim()));
const entre = (texto, antes) => {
  const m = texto.match(new RegExp(`${antes}«(.+?)»`));
  assert.ok(m, `«${antes}» en la entrega`);
  return m[1];
};
/* Lo que se pinta con el «%» pegado (U+00A0) se compara con la entrega en llano. */
const llano = (t) => t.replace(/ /g, " ");

/* ═══════════ LAS PIEZAS ═══════════ */

const conDecide = (lista, comun) => lista.map((x) => ({ ...comun, ...x }));
const CAPA3 = {
  "T5 A1": { Componente: await C("tema5/DosPaquetes"),
    cajas: conDecide(T5A1.PAQUETES, { opciones: T5A1.OPCIONES_CAPA_3 }) },
  "T5 A2": { Componente: await C("tema5/DosVentas"),
    cajas: conDecide(T5A2.VENTAS_T5_A2, { opciones: T5A2.OPCIONES_CAPA_3_T5_A2, pista: T5A2.PISTA_CAPA_3_T5_A2 }) },
  "T6 A1": { Componente: await C("tema6/SeisHechos"), cajas: conDecide(T6A1.HECHOS_T6, { opciones: T6A1.OPCIONES_CAPA_3_T6 }) },
  "T6 A2": { Componente: await C("tema6/DosMetodos"), cajas: conDecide(T6A2.METODOS_T6_A2, { opciones: T6A2.OPCIONES_CAPA_3_T6_A2 }) },
  /* Lote 7: la capa 3 de T6 A3 es el tanque; sus datos siguen aquí, su pantalla en b5-t6-tanque-capa3.test.mjs. */
  "T6 A3": { Componente: null, cajas: T6A3.MOMENTOS_T6_A3 },
  "T6 A4": { Componente: await C("tema6/TresCasos"), cajas: conDecide(T6A4.CASOS_T6_A4.filter((c) => !c.ejemplo), { opciones: T6A4.OPCIONES_CAPA_3_T6_A4 }) },
  "T6 A5": { Componente: await C("tema6/CuatroGrupos"), cajas: T6A5.GRUPOS_T6_A5, pegar: pegarPorcentaje },
};
const PARADAS = {
  "T5 A2": { Componente: await C("tema5/TresMomentos"), parada: T5A2.PARADA_T5_A2 },
  "T6 A3": { Componente: await C("tema6/LaProvision"), parada: T6A3.PARADA_T6_A3 },
  "T6 A4": { Componente: await C("tema6/SiPaga"), parada: T6A4.PARADA_T6_A4 },
  "T6 A5": { Componente: await C("tema6/LaTablaDelEjemplo"), parada: T6A5.PARADA_T6_A5, pegar: pegarPorcentaje },
};
/* Cada fila de la tabla de pistas: qué caja (o cajas) nombra. La parada, por su pieza. */
const CAJAS_DE = {
  "Paquete A": ["a"], "Paquete B": ["b"], "Ventas A y B": ["venta-a", "venta-b"],
  "Taller (servicio a crédito)": ["venta-credito"], "Paga la mitad": ["pago"], Cheque: ["cheque-devuelto"],
  Devolución: ["devolucion"], Descuento: ["descuento"], Contado: ["contado"],
  "Anulación directa": ["anulacion-directa"], Provisiones: ["provisiones"],
  "Diciembre de 2007": ["diciembre-2007"], "Marzo (la pregunta aprobada)": ["marzo"], "Diciembre siguiente": ["diciembre-siguiente"],
  "Caso b": ["b"], "Caso c": ["c"],
  "1 mes de vencida": ["g1"], "5 meses de vencida": ["g2"], "10 meses de vencida": ["g3"], "20 meses de vencida": ["g4"],
};

const PISTAS = filas(seccion("### Pistas"));
/* Lote 27 (nivel de Shoko): la pista del paquete A de T5 A1 cambia; la nueva, literal, en el paquete del lote 27. */
const L27 = leer("orquestador/conocimiento/paquetes/b5-lote27-capa4-antes-c1.md");
const PISTA_L27 = L27.match(/T5 A1 · pista de la capa 3 \(paquete A\): «([^»]+)»/)[1];
for (const f of PISTAS) if (f[0] === "T5 A1" && f[1] === "Paquete A") f[2] = PISTA_L27;
const TERCERAS = filas(seccion("### Terceras opciones"));
/* La pista literal de una caja o de la parada de una pieza. */
const pistaDe = (pieza, id) => {
  const f = PISTAS.find(([p, donde]) => p === pieza && (id === "parada" ? donde === "Parada" : CAJAS_DE[donde]?.includes(id)));
  return f?.[2];
};
/* La tercera opción de una pregunta: la fila de la tabla y la caja o parada que nombra. */
const terceraDe = (pieza, id) => TERCERAS.find(([p, pregunta]) => p === pieza && (id === "parada" ? pregunta === "Parada" : CAJAS_DE[pregunta]?.includes(id)));

const falloDe = (x, o) => (typeof x.falla === "string" ? x.falla : x.falla[o]);
const montar = async (el) => {
  const caja = document.createElement("div");
  document.body.appendChild(caja);
  const r = createRoot(caja);
  await act(async () => { r.render(el); });
  return { caja, desmontar: () => { act(() => r.unmount()); caja.remove(); } };
};
/* Lote 7: en la capa 2 del tanque, «Siguiente» espera su gesto; se hace antes de tocarlo. */
const { hacerGesto } = await import("./b5-gestos.mjs");
const tocar = async (el) => { await hacerGesto(el, act, w); await act(async () => { el.dispatchEvent(new w.MouseEvent("click", { bubbles: true })); }); };
const zonaDe = (caja, id) => caja.querySelector(`[data-hecho="${id}"]`);
const revelado = (zona) => [...zona.querySelectorAll("[data-revela] p:not([data-pie])")].map((p) => llano(p.textContent));
const btn = (caja, cual) => caja.querySelector(`[data-${cual}]`);
const contador = (caja) => caja.querySelector("[data-paso-de]").textContent;
const hastaParada = async (caja, parada) => {
  for (let n = 1; n < parada.antes; n++) await tocar(btn(caja, "siguiente"));
  assert.equal(contador(caja), `Antes del paso ${parada.antes}`);
};

/* ═══════════ C2 · LA ESCALERA DE AYUDA ═══════════ */

test("★★★ C2: la tabla de pistas nombra cada caja de la capa 3 y cada parada de la capa 2 de las siete piezas; cada una lleva su pista literal", () => {
  assert.equal(PISTAS.length, 24, "las 24 filas de la entrega");
  /* Cada fila apunta a algo que existe. */
  for (const [pieza, donde, pista] of PISTAS) {
    if (donde === "Parada") {
      assert.ok(PARADAS[pieza], `${pieza}: tiene parada`);
      assert.equal(PARADAS[pieza].parada.pista, pista, `${pieza} · parada`);
      continue;
    }
    assert.ok(CAJAS_DE[donde], `«${donde}» tiene su caja`);
    for (const id of CAJAS_DE[donde]) {
      const x = CAPA3[pieza].cajas.find((c) => c.id === id);
      assert.ok(x, `${pieza} · ${id}`);
      assert.equal(x.pista, pista, `${pieza} · ${donde}`);
    }
  }
  /* Y cada caja que se pregunta y cada parada tienen su fila: ninguna se queda sin pista. */
  for (const [pieza, p] of Object.entries(CAPA3)) for (const x of p.cajas) assert.ok(pistaDe(pieza, x.id), `${pieza} · ${x.id}: en la tabla`);
  for (const pieza of Object.keys(PARADAS)) assert.ok(pistaDe(pieza, "parada"), `${pieza} · parada: en la tabla`);
  /* El caso a de T6 A4 es el ejemplo: sin pista y sin pregunta. */
  assert.ok(ENTREGA.includes("El caso a de T6 A4 ya no lleva pista, porque queda como ejemplo (C1-11)."));
  const a = T6A4.CASOS_T6_A4.find((c) => c.id === "a");
  assert.deepEqual([a.ejemplo, a.pista, a.correcta, a.falla], [true, undefined, undefined, undefined]);
});

test("★★★ C2: las terceras opciones, literales, con su devolución al segundo error", () => {
  assert.equal(TERCERAS.length, 6);
  for (const [pieza, pregunta, opcion, devolucion] of TERCERAS) {
    const decides = pregunta === "Parada" ? [PARADAS[pieza].parada] : CAJAS_DE[pregunta].map((id) => CAPA3[pieza].cajas.find((c) => c.id === id));
    for (const x of decides) {
      const o = x.opciones.find((y) => y.texto === opcion);
      assert.ok(o, `${pieza} · ${pregunta}: «${opcion}»`);
      assert.notEqual(o.id, x.correcta, "la tercera es mala");
      assert.equal(x.opciones.length, 3, "tres opciones: el segundo error puede pasar");
      /* «La de cada caja (C1-2)»: la de cada venta, literal de C1-2. */
      const esperada = devolucion === "La de cada caja (C1-2)" ? entre(seccion("### C1-2"), `${x.nombre}, «[^»]+»\\. Correcta: \\S+\\.\\n\\s+- Revela: «[^»]+»\\n\\s+- Al segundo error: `) : devolucion;
      assert.equal(falloDe(x, o.id), esperada, `${pieza} · ${pregunta}`);
    }
  }
});

for (const [pieza, p] of Object.entries(CAPA3).filter(([, x]) => x.Componente)) {
  test(`★★★ C2 · ${pieza} · capa 3: al primer error, la pista literal y nada más; al segundo, la devolución sin el texto (B5 de Futaba)`, async () => {
    const { caja, desmontar } = await montar(h(p.Componente));
    /* En orden: así T6 A3, que abre cada momento al cerrarse el anterior, también se recorre. */
    for (const x of p.cajas) {
      const zona = zonaDe(caja, x.id);
      assert.ok(zona, `${x.id} a la vista`);
      const malas = x.opciones.filter((o) => o.id !== x.correcta).map((o) => o.id);
      const tercera = terceraDe(pieza, x.id);
      const segunda = tercera ? x.opciones.find((o) => o.texto === tercera[2]).id : malas[1];
      const primera = malas.find((id) => id !== segunda);
      /* Abierta, antes de elegir: ni la pista ni el texto. */
      await tocar(zona.querySelector("button[aria-expanded]"));
      assert.deepEqual(revelado(zona), [], `${x.id}: abierta, nada revelado`);
      await decidir(tocar, zona, primera);
      assert.equal(llano(zona.querySelector("[data-pista]")?.textContent ?? ""), pistaDe(pieza, x.id), `${x.id}: la pista literal`);
      assert.deepEqual(revelado(zona), [pistaDe(pieza, x.id)], `${x.id}: solo la pista`);
      assert.equal(zona.querySelector("[data-devolucion]"), null, `${x.id}: ni la devolución`);
      assert.ok(!llano(zona.textContent).includes(llano(x.revela)), `${x.id}: ni el texto`);
      assert.equal(zona.dataset.decidida, "no");
      await decidir(tocar, zona, segunda);
      assert.equal(zona.querySelector("[data-pista]"), null, `${x.id}: la pista se va`);
      const devolucion = tercera && tercera[3] !== "La de cada caja (C1-2)" ? tercera[3] : falloDe(x, segunda);
      /* B5 de Futaba: quien falla dos veces lee la devolución de su opción, NO el texto que se revela. */
      assert.deepEqual(revelado(zona), [llano(p.pegar ? p.pegar(devolucion) : devolucion)], `${x.id}: solo la devolución`);
      assert.ok(!llano(zona.textContent).includes(llano(x.revela)), `${x.id}: sin el texto que se revela`);
      assert.equal(zona.dataset.decidida, "si");
    }
    desmontar();
  });
}

for (const [pieza, p] of Object.entries(PARADAS)) {
  test(`★★★ C2 · ${pieza} · parada: al primer error, la pista literal y «Siguiente» quieto; al segundo, la devolución y después el paso que viene`, async () => {
    const { caja, desmontar } = await montar(h(p.Componente));
    await hastaParada(caja, p.parada);
    const malas = p.parada.opciones.filter((o) => o.id !== p.parada.correcta).map((o) => o.id);
    const tercera = terceraDe(pieza, "parada");
    const segunda = tercera ? p.parada.opciones.find((o) => o.texto === tercera[2]).id : malas[1];
    const primera = malas.find((id) => id !== segunda);
    const texto = () => caja.querySelector("[data-texto-paso]");
    await tocar(caja.querySelector(`[data-parada] [data-opcion="${primera}"]`));
    assert.equal(llano(texto().querySelector("[data-pista]").textContent), pistaDe(pieza, "parada"));
    assert.equal(texto().querySelector("[data-devolucion]"), null, "ni la devolución");
    assert.equal(btn(caja, "siguiente").disabled, true, "ni el paso que viene");
    await tocar(caja.querySelector(`[data-parada] [data-opcion="${segunda}"]`));
    assert.equal(texto().querySelector("[data-pista]"), null);
    const devolucion = tercera ? tercera[3] : falloDe(p.parada, segunda);
    assert.equal(llano(texto().querySelector("[data-devolucion]").textContent), devolucion);
    assert.equal(btn(caja, "siguiente").disabled, false);
    await tocar(btn(caja, "siguiente"));
    assert.match(contador(caja), new RegExp(`^Paso ${p.parada.antes} de `), "después, el texto del paso que viene");
    assert.equal(texto().querySelector("[data-devolucion]"), null);
    desmontar();
  });
}

/* ═══════════ C1 · LA RESPUESTA EN LA PANTALLA ANTERIOR ═══════════ */

/* Una capa 4 de la entrega (pregunta, pie y tabla de opciones) contra los datos y la pantalla. */
async function capa4(titulo, pregunta, opciones, pie, Capa4) {
  const s = seccion(titulo);
  assert.equal(pregunta, entre(s, "Pregunta: "));
  assert.equal(pie, entre(s, "pie "));
  const t = filas(s);
  assert.equal(t.length, 4);
  assert.deepEqual(opciones.map((o) => [o.texto, o.correcta ? "✓" : "", o.feedback]), t);
  const { caja, desmontar } = await montar(h(Capa4));
  assert.ok(caja.textContent.includes(pregunta), "la pregunta en pantalla");
  assert.equal(caja.querySelector("[data-pie]").textContent, pie, "el pie, bajo UnaFrase");
  desmontar();
}

test("★★★ C1-1 · T5 A1 · capa 4: el caso de los bonos, literal, con su pie «Escenario simulado»", async () => {
  await capa4("### C1-1", T5A1.PREGUNTA_FINAL_T5, T5A1.OPCIONES_FINAL_T5, T5A1.PIE_FINAL_T5, ESCENAS_TEMA5[T5A1.PIEZA_DEL_EFECTIVO.id].Capa4);
});

test("★★★ C1-2 · T5 A2 · capa 3: las ventas A y B, literales, con su pie; el final y su pie no cambian", async () => {
  const s = seccion("### C1-2");
  assert.equal(T5A2.CONSIGNA_CAPA_3_T5_A2, entre(s, "Consigna: "));
  assert.equal(entre(ENTREGA, "### C1-2 · T5 A2 · capa 3 \\(pie de las cajas "), "Escenario simulado");
  assert.ok(s.includes(`Opciones: ${T5A2.OPCIONES_CAPA_3_T5_A2.map((o) => o.texto).join(" · ")}.`));
  const ventas = [...s.matchAll(/- (Venta [AB]), «(.+?)»\. Correcta: (\S+)\.\n\s+- Revela: «(.+?)»\n\s+- Al segundo error: «(.+?)»/g)];
  assert.equal(ventas.length, 2);
  assert.deepEqual(T5A2.VENTAS_T5_A2.map((v) => [v.nombre, v.cifras.join(" · "), T5A2.OPCIONES_CAPA_3_T5_A2.find((o) => o.id === v.correcta).texto, v.revela, v.falla]),
    ventas.map((m) => m.slice(1)));
  for (const v of T5A2.VENTAS_T5_A2) assert.equal(v.pie, "Escenario simulado");
  assert.ok(s.includes("El texto final no cambia y sigue con su pie de las pp. 194-195."));
  assert.match(T5A2.FINAL_CAPA_3_T5_A2.pie, /pp\. 194-195$/);
  /* En pantalla: cerradas, el nombre y sus dos cifras; nada más. */
  const { caja, desmontar } = await montar(h(CAPA3["T5 A2"].Componente));
  for (const v of T5A2.VENTAS_T5_A2) {
    const boton = zonaDe(caja, v.id).querySelector("button[aria-expanded]");
    assert.ok(boton.textContent.startsWith(v.nombre));
    for (const c of v.cifras) assert.ok(boton.textContent.includes(c));
  }
  desmontar();
});

test("★★★ C1-3 · T5 A2 · capa 4: los 260 títulos, literal, con su pie «Escenario simulado»", async () => {
  await capa4("### C1-3", T5A2.PREGUNTA_FINAL_T5_A2, T5A2.OPCIONES_FINAL_T5_A2, T5A2.PIE_FINAL_T5_A2, ESCENAS_TEMA5[T5A2.PIEZA_TRES_MOMENTOS.id].Capa4);
});

test("★★★ C1-2 y C1-3: las cifras construidas, en el registro de T5 y con sus cuentas", () => {
  const lista = seccion("### C1-3").match(/Al registro de cifras construidas \(T5\): (.+)\./)[1];
  const cifras = lista.replace(" y ", ", ").split(", ").map((c) => Number(c.replace(/[$.]/g, ""))).sort((a, b) => a - b);
  assert.equal(cifras.length, 9);
  assert.deepEqual([...T5A2.CIFRAS_CONSTRUIDAS_T5_A2].sort((a, b) => a - b), cifras);
  const registro = JSON.parse(leer("orquestador/conocimiento/registro-cifras-construidas-t5.json"));
  assert.deepEqual(registro.construidas_b5.map((c) => c.cifra).sort((a, b) => a - b), cifras);
  for (const c of registro.construidas_b5) {
    assert.match(c.calculo, /^[\d\s+\-*/]+$/, "solo enteros y + - * /");
    assert.equal(Function(`return ${c.calculo}`)(), c.cifra, `${c.uso}: ${c.calculo}`);
  }
});

test("★★★ C1-4 · T6 A1 · capa 3: los hechos nuevos y, en venta y pago, lo que cambia; «La de hoy» se queda", () => {
  const t = filas(seccion("### C1-4"));
  const ID = { "Venta (sigue con c5)": "venta-credito", Pago: "pago", Cheque: "cheque-devuelto", Devolución: "devolucion", Descuento: "descuento", Contado: "contado" };
  assert.equal(t.length, 6);
  for (const [caja, hecho, revela, falla, pie] of t) {
    const x = T6A1.HECHOS_T6.find((c) => c.id === ID[caja]);
    assert.ok(x, caja);
    for (const [campo, valor] of [["hecho", hecho], ["revela", revela], ["falla", falla], ["pie", pie]]) {
      if (valor !== "La de hoy") assert.equal(x[campo], valor, `${caja} · ${campo}`);
    }
  }  /* La devolución de la venta, al segundo error: el texto aprobado del 15-oct (reemplaza «La de hoy»). */
  assert.equal(T6A1.HECHOS_T6.find((c) => c.id === "venta-credito").falla, "Aunque diga “crédito”, el cliente queda debiendo el arreglo: sube.");
});

test("★★★ C1-5 · T6 A1 · capa 4: la devolución de toda la mercancía, literal, con su pie", async () => {
  await capa4("### C1-5", T6A1.PREGUNTA_FINAL_T6, T6A1.OPCIONES_FINAL_T6, T6A1.PIE_FINAL_T6, ESCENAS_TEMA6[T6A1.PIEZA_LO_QUE_LE_DEBEN.id].Capa4);
});

test("★★★ C1-6 y C1-7 · T6 A2: sin el paso 10 (9 pasos en pantalla), el cierre, la consigna y lo que revela provisiones, literales", async () => {
  const s = seccion("### C1-6 y C1-7");
  assert.ok(s.includes("Capa 2: se elimina el paso 10."));
  assert.equal(T6A2.PASOS_T6_A2.length, 9);
  assert.equal(T6A2.CIERRE_T6_A2.texto, entre(s, "Cierre de la capa 2: "));
  assert.equal(T6A2.CONSIGNA_CAPA_3_T6_A2, entre(s, "Consigna de la capa 3: "));
  assert.equal(T6A2.METODOS_T6_A2.find((m) => m.id === "provisiones").revela, entre(s, "Texto que revela la caja de provisiones: "));
  const { caja, desmontar } = await montar(h(await C("tema6/DosDias")));
  assert.equal(contador(caja), "Paso 1 de 9");
  desmontar();
});

test("★★★ C1-8 · T6 A3 · capa 3: diciembre siguiente pregunta mayor, igual o menor, con sus devoluciones literales", () => {
  const s = seccion("### C1-8");
  const m = T6A3.MOMENTOS_T6_A3.find((x) => x.id === "diciembre-siguiente");
  assert.equal(m.pregunta, entre(s, "Diciembre siguiente: "));
  const opciones = s.match(/Opciones: (.+)\.\n/)[1].split(" · ");
  assert.deepEqual(m.opciones.map((o) => (o.id === m.correcta ? `${o.texto} ✓` : o.texto)), opciones);
  for (const o of m.opciones.filter((x) => x.id !== m.correcta)) assert.equal(m.falla[o.id], entre(s, `Si elige «${o.texto}»: `));
  assert.ok(s.includes("Marzo: se queda la pregunta aprobada, como está hoy. Solo se le suma su pista."));
});

test("★★★ C1-9 · T6 A3 · capa 4: el castigo menor que la provisión, literal, con su pie", async () => {
  await capa4("### C1-9", T6A3.PREGUNTA_FINAL_T6_A3, T6A3.OPCIONES_FINAL_T6_A3, T6A3.PIE_FINAL_T6_A3, ESCENAS_TEMA6[T6A3.PIEZA_LA_PROVISION.id].Capa4);
});

test("★★★ C1-11 y C1-12 · T6 A4 · capa 3: el caso a viene lleno con el rótulo «Ejemplo» y no se pregunta; la consigna y los casos b y c, literales", async () => {
  const s = seccion("### C1-11 y C1-12");
  assert.equal(T6A4.TABLERO_T6_A4.ejemplo, entre(s, "con el rótulo "));
  assert.equal(T6A4.CONSIGNA_CAPA_3_T6_A4, entre(s, "Consigna: "));
  const b = T6A4.CASOS_T6_A4.find((c) => c.id === "b");
  const c = T6A4.CASOS_T6_A4.find((x) => x.id === "c");
  const op = (texto) => T6A4.OPCIONES_CAPA_3_T6_A4.find((o) => o.texto === texto).id;
  /* B5 de Futaba (manda sobre C1-12): los textos que se revelan ya no llevan cifras. */
  assert.equal(b.revela, "Como promete pagar el resto, vuelve toda la deuda.");
  assert.equal(c.revela, "Como ya no puede pagar más, lo demás sigue castigado.");
  assert.equal(T6A4.CASOS_T6_A4.find((x) => x.id === "a").revela, "Pagó toda la factura: a Caja entra todo.");
  for (const x of T6A4.CASOS_T6_A4) assert.ok(!/\d/.test(x.revela), `${x.id}: sin cifras`);
  assert.equal(b.falla[op("$80.000")], entre(s, "Si elige \\$80\\.000: "));
  assert.equal(c.nombre, entre(s, "Caso c: nombre de la caja: "));
  assert.equal(c.falla[op("$180.000")], entre(s, "Si elige \\$180\\.000: "));
  /* En pantalla: la fila a, llena y con su rótulo; sin caja para a. */
  const { caja, desmontar } = await montar(h(CAPA3["T6 A4"].Componente));
  const fila = caja.querySelector('[data-tablero] [data-fila="a"]');
  assert.equal(fila.querySelector("[data-rotulo-ejemplo]").textContent, "Ejemplo");
  assert.deepEqual([...fila.querySelectorAll("[data-celda]")].map((x) => x.textContent), ["$180.000", "$180.000"]);
  assert.equal(zonaDe(caja, "a"), null, "el caso a ya no se pregunta");
  assert.equal(caja.querySelector('[data-tablero] [data-texto-ejemplo="a"]').textContent, "Pagó toda la factura: a Caja entra todo.", "el texto del ejemplo, bajo su fila");
  for (const id of ["b", "c"]) assert.deepEqual([...caja.querySelectorAll(`[data-fila="${id}"] [data-celda]`)].map((x) => x.textContent), ["", ""], `${id}: vacía`);
  desmontar();
});

test("★★★ C1-14 · T6 A5 · capa 3: cuatro deudas sueltas, literales; cada una llena la fila de su grupo al revelarse, no antes", async () => {
  const s = seccion("### C1-14");
  assert.equal(T6A5.CONSIGNA_CAPA_3_T6_A5, entre(s, "Consigna: "));
  const t = filas(s);
  assert.equal(t.length, 4);
  assert.deepEqual(T6A5.GRUPOS_T6_A5.map((g) => [g.deuda, g.opciones.map((o) => o.texto).join(" · "), g.opciones.find((o) => o.id === g.correcta).texto, g.revela]), t);
  const { caja, desmontar } = await montar(h(CAPA3["T6 A5"].Componente));
  const celdas = () => [...caja.querySelectorAll("[data-tablero] tbody [data-celda]")].map((x) => x.textContent);
  assert.deepEqual([...caja.querySelectorAll("[data-hecho] button[aria-expanded]")].map((b) => b.textContent), t.map((f) => f[0]), "cerradas, solo la deuda");
  for (const [k, g] of T6A5.GRUPOS_T6_A5.entries()) {
    const zona = zonaDe(caja, g.id);
    await tocar(zona.querySelector("button[aria-expanded]"));
    assert.equal(celdas()[k], "", `${g.id}: abierta sin responder, la fila espera (nada delata la respuesta)`);
    await decidir(tocar, zona, g.correcta);
    assert.equal(celdas()[k], T6A5.TABLERO_T6_A5.celdas[k], `${g.id}: al revelarse, la fila de su grupo`);
  }
  desmontar();
});

test("★★★ C1 · paradas de T6 A4 y T6 A5: «Primero se revive la deuda» y «son $17.000» no aparecen antes de su paso (ni para el lector de pantalla)", async () => {
  assert.ok(ENTREGA.includes("comprobar que los rótulos «Primero se revive la deuda» y «son $17.000» no aparecen antes de su paso."));
  /*
   * Lote 21: la escena es la de la ficha que entra; esos rótulos ya no están en ella. Lo que la parada pregunta
   * es lo que entra al sitio («revive» en T6 A4; «v2», la provisión del grupo 2, en T6 A5): vacío hasta su paso.
   */
  const casos = [
    { pieza: "T6 A4", sitio: "revive", rotulo: "Primero se revive la deuda", dato: T6A4.ESCENA_T6_A4.primero, entra: "$180.000" },
    { pieza: "T6 A5", sitio: "v2", rotulo: "son $17.000", dato: T6A5.ESCENA_T6_A5.grupos[1].resultado, entra: "$17.000" },
  ];
  for (const k of casos) {
    assert.equal(k.dato, k.rotulo, `${k.pieza}: el rótulo de la escena`);
    const p = PARADAS[k.pieza];
    const { caja, desmontar } = await montar(h(p.Componente));
    const sitio = () => caja.querySelector(`[data-escena-viva] [data-sitio="${k.sitio}"]`);
    const escena = () => llano(caja.querySelector("[data-escena-viva]").textContent);
    for (let n = 1; n <= p.parada.antes; n++) {
      if (n > 1) await tocar(btn(caja, "siguiente"));
      assert.equal(sitio().dataset.vacio, "si", `${k.pieza}, ${contador(caja)}: el sitio, vacío`);
      assert.ok(!escena().includes(k.rotulo), `${k.pieza}, ${contador(caja)}: no se lee`);
    }
    assert.equal(contador(caja), `Antes del paso ${p.parada.antes}`, "también en la parada");
    await tocar(caja.querySelector(`[data-parada] [data-opcion="${p.parada.correcta}"]`));
    await tocar(btn(caja, "siguiente"));
    await tocar(caja.querySelector('[data-ficha-entra][data-activa="si"]'));
    assert.ok(llano(sitio().textContent).includes(k.entra), `${k.pieza}: llega en su paso, con el gesto`);
    desmontar();
  }
});

/* ═══════════ C7 · EL RESUMEN QUE BORRA EL LÍMITE ═══════════ */

test("★★★ C7-1 y C7-6: «Título valor» salió con B2; la C7-6 es ahora el término 5 de T6 · A5, con la frase partida y su pie", () => {
  const t = filas(seccion("## C7"));
  const fila = (n) => t.find((f) => f[0] === n);
  /* B2 (decisión de Sakuta, 15-oct): «Título valor» sale de T5 · A1. La C7-1 queda en la entrega, pero ya no en pantalla. */
  assert.ok(fila("C7-1")[2].startsWith("Es un documento."));
  assert.equal(T5A1.PIEZA_DEL_EFECTIVO.nombres.find((x) => x.termino === "Título valor"), undefined);
  assert.ok(T5A1.PIEZA_DEL_EFECTIVO.nombres.every((x) => x.definicion !== fila("C7-1")[2]));
  /* B2: la nota del término 4 pasa a pantalla propia; la frase partida solo cambia la entrada («Esos porcentajes son» → «Son»). */
  const t4 = T6A5.PIEZA_COMO_SE_CALCULA.nombres[3];
  assert.equal(t4.delLibro, undefined, "la nota volvió al término 4");
  const t5 = T6A5.PIEZA_COMO_SE_CALCULA.nombres[4];
  assert.equal(t5.termino, "Para qué sirven esos porcentajes");
  assert.ok(t5.definicion.startsWith("Son el máximo"));
  assert.equal(fila("C7-6")[2], `Esos porcentajes son${t5.definicion.slice("Son".length)}`);
  assert.equal(t5.pie, entre(ENTREGA, "Pie de C7-6: "));
  /* Los que PASAN no cambian: C7-2, C7-3 y C7-4. */
  for (const n of ["C7-2", "C7-3", "C7-4"]) assert.deepEqual([fila(n)[2], fila(n)[3]], ["(sin cambio)", "PASA"]);
});

test("★★★ C7-5: «no pagará más» pasa a «ya no puede pagar más» en los datos y en los paquetes", async () => {
  const t = filas(seccion("### C7-5"));
  assert.equal(t.length, 7);
  const fragmentos = (celda) => celda.replace(/^«|»$/g, "").split("…").map((x) => x.trim()).filter(Boolean);
  /* Lote 6d-textos (Futaba): la B·C14 de la parte 5 se reescribió entera; manda su literal nuevo, que conserva «ya no puede pagar más». */
  const reescritas = {
    "contabilidadT6Act3.js · B·C14 de la parte 5": "Reviviste toda la deuda. Como Pablo Moncayo ya no puede pagar más, se revive solo lo que pagó.",
  };
  for (const [archivo, donde, hoy, queda] of t) {
    if (!archivo.endsWith(".js")) continue;
    const fuente = leer(`src/data/${archivo}`);
    const nueva = reescritas[`${archivo} · ${donde}`];
    for (const f of nueva ? [nueva] : fragmentos(queda)) assert.ok(fuente.includes(f), `${archivo} · ${donde}: «${f}»`);
    for (const f of fragmentos(hoy)) assert.ok(!fuente.includes(f), `${archivo} · ${donde}: ya no dice «${f}»`);
  }
  /* Los paquetes: solo la tabla de la entrega nombra la cadena vieja, y siempre junto a la nueva. */
  for (const md of ["b5-t6-aprender4.md", "b5-t6-act3.md", "b5-recorrido-t5-t6.md"]) {
    const lineas = leer(`orquestador/conocimiento/paquetes/${md}`).split("\n").filter((l) => l.includes("no pagará más"));
    for (const l of lineas) assert.ok(l.includes("ya no puede pagar más"), `${md}: «${l.slice(0, 60)}…»`);
  }
  /* Y en pantalla, los datos de T6 ya no la dicen en ningún sitio. */
  for (const m of [T6A4, await import("../../data/contabilidadT6Act3.js")]) assert.ok(!JSON.stringify(m).includes("no pagará más"));
});
