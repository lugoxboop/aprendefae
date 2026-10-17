import { test, afterEach } from "node:test";
import assert from "node:assert/strict";
import { readFileSync, readdirSync } from "node:fs";
import { JSDOM, VirtualConsole } from "jsdom";

/*
 * ═══════════════════════════════════════════════════════════════════════════
 * r5-4 «Septiembre en Barranquilla» (Célula E) — «Lo que Ippo tiene que
 * probar» del paquete e5-r5-4-v1, cada prueba rota a propósito una vez, más
 * lo de r5-3 que aplica:
 *
 *   · cada texto, literal en el paquete; las cifras, calculadas desde los
 *     datos y cotejadas con «Correcto:»; los valores equivocados, calculados
 *   · la regla de prioridad camino por camino y el barrido de la hoja de 11
 *   · 1 y 4: «Descuento comercial condicionado» diagnosticado por valor
 *   · los días del 7 y el 9: 15 → con descuento; 16 → sin descuento
 *   · fletes: el del 2 completo con una u otra cuenta, nunca mezclado; el del
 *     10, solo «Gasto de venta – fletes»
 *   · FP: 9 por acierto, de 0 a 10, como el servidor
 *   · las dos puertas y la migración 0253
 *   · la hoja en orden alfabético; los nodos de los días con dos operaciones
 *   · E1: cada texto sale en el DOM en algún estado (con el objetivo, el aviso
 *     y el bloque de la operación); B5: ninguna frase dos veces
 *   · el mes en dos cuentas: Caja y Descuento comercial condicionado, la
 *     versión compacta en 1, 3, 4 y 6, y la frase final
 *   · INFLESZ ≥ 65 con el número exacto de textos medidos
 * ═══════════════════════════════════════════════════════════════════════════
 */

const dom = new JSDOM("<!doctype html><html><body></body></html>", { url: "http://localhost/", virtualConsole: new VirtualConsole() });
const w = dom.window;
w.matchMedia = (q) => ({ matches: /reduced-motion/.test(q), addEventListener() {}, removeEventListener() {}, addListener() {}, removeListener() {} });
for (const [k, v] of Object.entries({
  window: w, document: w.document, navigator: w.navigator, localStorage: w.localStorage,
  HTMLElement: w.HTMLElement, HTMLInputElement: w.HTMLInputElement, Element: w.Element, Node: w.Node, SVGElement: w.SVGElement,
  Event: w.Event, MouseEvent: w.MouseEvent, KeyboardEvent: w.KeyboardEvent,
  getComputedStyle: w.getComputedStyle.bind(w), matchMedia: w.matchMedia,
  requestAnimationFrame: (fn) => setTimeout(fn, 0),
  cancelAnimationFrame: (id) => clearTimeout(id),
})) {
  Object.defineProperty(globalThis, k, { value: v, configurable: true, writable: true });
}
globalThis.IS_REACT_ACT_ENVIRONMENT = true;

const React = await import("react");
const { createRoot } = await import("react-dom/client");
const act = React.act;
const h = React.createElement;

const B = await import("../../data/repasoCap5Barranquilla.js");
const T = await import("../../data/repasoCap5BarranquillaTextos.js");
const J = await import("../../data/repasoCap5BarranquillaJuego.js");
const MJ = await import("../../data/repasoCap5MateJuego.js");
const M = await import("../../data/repasoCap5Mes.js");
const { MES_COMUN, VEREDICTO } = await import("../../data/repasoCap5Comun.js");
const { Barranquilla, ACTIVIDAD_BARRANQUILLA } = await import("../../components/repasoCap5/Barranquilla.jsx");
const { JUEGOS_REPASO_CAP5 } = await import("../../components/RepasoCapitulo5View.jsx");
const { SUBJECTS, HACER, actividadesDeTipo } = await import("../../data/subjects.js");
const { inflesz, UMBRAL } = await import("../../herramientas/inflesz.js");
const { etiquetaDeItem, hayReglaPara } = await import("../../docente/etiquetasItem.js");
const { calcularFP } = await import("../../fp/motor.js");
const { pesos } = await import("../../data/contabilidad.js");

const RAIZ = new URL("../../../", import.meta.url);
const leer = (f) => readFileSync(new URL(f, RAIZ), "utf8");
const PAQUETE = leer("orquestador/conocimiento/paquetes/e5-r5-4-v1.md");
const PLANO = PAQUETE.replace(/\s+/g, " ");
const PAQUETE_MES = leer("orquestador/conocimiento/paquetes/e5-mes-en-dos-cuentas.md");
const A = T.ASIENTOS_BARRANQUILLA;
const asiento = (id) => A.find((a) => a.id === id);

const montados = new Set();
const montar = async (el) => {
  const caja = document.createElement("div");
  document.body.appendChild(caja);
  const raiz = createRoot(caja);
  await act(async () => { raiz.render(el); });
  const desmontar = () => {
    if (!montados.has(desmontar)) return;
    montados.delete(desmontar);
    act(() => raiz.unmount());
    caja.remove();
  };
  montados.add(desmontar);
  return { caja, desmontar };
};
/* D8: cada prueba empieza en el intento 1 (versión A); una partida terminada no pasa la B a la siguiente. */
afterEach(() => { for (const d of [...montados]) d(); try { globalThis.localStorage?.clear(); } catch { /* sin almacenamiento */ } });
const tocar = async (el) => {
  assert.ok(el, "no está el elemento que se quería tocar");
  await act(async () => { el.dispatchEvent(new w.MouseEvent("click", { bubbles: true })); });
};
const escribir = async (input, texto) => {
  const fijar = Object.getOwnPropertyDescriptor(w.HTMLInputElement.prototype, "value").set;
  await act(async () => { fijar.call(input, texto); input.dispatchEvent(new w.Event("input", { bubbles: true })); });
};
const anadir = async (caja, lado, cuenta, valor) => {
  await tocar(caja.querySelector(`[data-anadir="${lado}"]`));
  await tocar(document.querySelector(`[data-hoja-renglon] [data-cuenta="${cuenta}"]`));
  await escribir(document.querySelector("[data-hoja-renglon] input"), String(valor));
  await tocar(document.querySelector("[data-hoja-renglon] [data-listo]"));
};

let n = 0;
const R = (lado, cuenta, valor) => ({ id: `t${n++}`, lado, cuenta, valor });
const bien = (a, v = 0) => a.correctos[v].map((c) => R(c.lado, c.cuenta, c.valor));
/* P2 de Itagaki: en los asientos con condición, primero la ventana (tocar el día del borde y «Comprobar»). */
const abrirVentana = async (caja, a, borde = a.ventana?.pago) => {
  if (!a.ventana) return;
  await tocar(caja.querySelector(`[data-calendario] [data-dia="${borde}"]`));
  await tocar(caja.querySelector("[data-revisar-ventana]"));
};
const otroLado = (l) => (l === "debe" ? "haber" : "debe");

/* ═══════════ LO QUE LEE EL ESTUDIANTE ═══════════ */

function textosDeAsiento(a) {
  const cm = Object.values(a.cuentaMal).flatMap((x) => (typeof x === "object" ? Object.values(x) : [x]));
  return [...new Set([...Object.values(a.cruzado), ...Object.values(a.falta), ...cm, ...a.valorMal.map((x) => x.texto), a.generica, ...a.acierto])];
}
function textosDelEstudiante() {
  const t = [T.R5_4.objetivo, T.R5_4.cita, ...T.DATOS_DECLARADOS_BARRANQUILLA.datos, T.COMUNES_BARRANQUILLA.cuentaNoPrevista, T.COMUNES_BARRANQUILLA.hayMas];
  for (const g of T.DATOS_DEL_LIBRO_BARRANQUILLA) if (g.nota) t.push(g.nota);
  for (const a of A) t.push(a.hecho, ...textosDeAsiento(a));
  /* P2 de Itagaki: las líneas del panel del mes salen con el panel. */
  return [...new Set(t)];
}

test("★★★ cada texto del estudiante está entero en el paquete (guarda: 116 textos distintos)", () => {
  const textos = textosDelEstudiante();
  assert.equal(textos.length, 116);
  const escapar = (t) => t.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
  const entero = (t) => new RegExp(`(?:: |:\\*\\* |\\n- |\\| )${escapar(t)}(?:\\n| \\||$)`).test(PAQUETE) || PLANO.includes(`«${t}»`) || PAQUETE_MES.includes(`| ${t} |`);
  const fuera = textos.filter((t) => !entero(t));
  assert.deepEqual(fuera, [], `no están en el paquete: ${fuera.join(" | ")}`);
  /* Los renglones del hecho, el bloque y los datos del libro: «etiqueta · valor». */
  for (const a of A) {
    for (const [et, val] of [...a.renglones, ...(a.bloque?.renglones ?? [])]) assert.ok(PLANO.includes(`${et} · ${val}`), `${a.id}: ${et} · ${val}`);
    if (a.bloque) assert.ok(PLANO.includes(`Bloque «${a.bloque.marca}»`), a.bloque.marca);
    /* P2 (textos de Miyata): el flete «en el asiento siguiente» va en el renglón de datos de su asiento. */
    if (a.fleteEnElSiguiente) assert.ok(new RegExp(`\\n- ${a.id}: [^\\n]*«Flete · en el asiento siguiente»`).test(PAQUETE), a.id);
  }
  for (const [et, val] of T.DATOS_DEL_LIBRO_BARRANQUILLA[0].renglones) assert.ok(PLANO.includes(`${et} · ${val}`), et);
  /* Los nombres cortos de la pantalla final, en su orden, y los rótulos que cambian respecto de r5-3. */
  /* Kamogawa (la fecha una vez): sin «, día N», que ya dice la fecha de la fila; los fletes se nombran por lo que son. */
  const cortos = /Compra, día 2 · Flete compra[^\n]*/.exec(PAQUETE)[0].split(" · ")
    .map((x) => x.replace(/, día \d+$/, "").replace(/^Flete (compra|venta)$/, (_, q) => `Flete de la ${q}`));
  assert.deepEqual(A.map((a) => a.operacion), cortos);
  assert.ok(A.every((a) => a.operacion.length <= 20));
  for (const t of [`«${T.ROTULOS_BARRANQUILLA.datosDeMarzo}»`, `«${T.ROTULOS_BARRANQUILLA.tasasALaVista}»`, `«${T.ROTULOS_BARRANQUILLA.marzoEnOcho}»`, `«${T.ENTRADA_BARRANQUILLA.titulo}»`]) assert.ok(PLANO.includes(t), t);
  /* Decisión 3: «No hay IVA ni retención.» sale de los datos declarados. */
  assert.equal(T.DATOS_DECLARADOS_BARRANQUILLA.datos.length, 5);
  assert.ok(!T.DATOS_DECLARADOS_BARRANQUILLA.datos.some((x) => /IVA/.test(x)));
});

/* ═══════════ LAS CIFRAS ═══════════ */

/* «Correcto: Debe Compras $10.925.000 · Haber Cuentas por pagar – proveedores $10.925.000» */
const correctoEscrito = (c) => c.map((r) => `${r.lado === "debe" ? "Debe" : "Haber"} ${r.cuenta} ${pesos(r.valor)}`).join(" · ");

test("★★★ las cifras se calculan desde los datos y dan lo que escribe el paquete en «Correcto:» (guarda: 11 variantes)", () => {
  let variantes = 0;
  for (const a of A) {
    const escrito = a.correctos.map(correctoEscrito).join(" — o — ");
    assert.ok(PLANO.includes(`Correcto: ${escrito}`) || PLANO.includes(`Correcto (completo con una u otra, nunca mezclado): ${escrito}`), `${a.id}: ${escrito}`);
    variantes += a.correctos.length;
    /* Cada asiento cuadra. */
    for (const c of a.correctos) assert.equal(c.filter((r) => r.lado === "debe").reduce((s, r) => s + r.valor, 0), c.filter((r) => r.lado === "haber").reduce((s, r) => s + r.valor, 0), a.id);
  }
  assert.equal(variantes, 11);
  /* A mano, las que piden cuenta: el 5 % del 2, la devolución a $2.185, los saldos con su devolución. */
  const N = B.CIFRAS_BARRANQUILLA;
  assert.equal(N.a1.compras, 5000 * 2300 * 0.95);
  assert.equal(N.a3.devolucion, 700 * 2185);
  assert.equal(N.a7.saldo, N.a1.compras - N.a3.devolucion);
  assert.equal(N.a7.descuento, N.a7.saldo / 10);
  assert.equal(N.a9.saldo, 6000 * 9000 - 200 * 9000);
  assert.equal(N.a9.descuento, N.a9.saldo * 5 / 100);
  /* Los valores equivocados previstos: cada uno, en el renglón de su texto en el paquete. */
  let valores = 0;
  for (const a of A) {
    for (const v of a.valorMal) {
      valores++;
      const renglon = PAQUETE.split("\n").find((l) => l.endsWith(`: ${v.texto}`));
      assert.ok(renglon && renglon.includes(pesos(v.valor)), `${a.id}: ${pesos(v.valor)} · ${v.texto}`);
    }
  }
  assert.equal(valores, 45);
});

/* ═══════════ LOS DÍAS ═══════════ */

test("★★★ los días del pago del 17 y el cobro del 25 se cuentan desde las fechas: 15 → con descuento; 16 → sin descuento", () => {
  /* El día de la factura no cuenta y el día límite sí (T7-3). */
  assert.equal(B.diasEntre(2, 17), 15);
  assert.equal(B.diasEntre(10, 25), 15);
  for (const c of [B.CONDICIONES.compra, B.CONDICIONES.venta]) {
    assert.equal(B.ganaDescuento(c, 2, 17), true, "15 días: con descuento");
    assert.equal(B.ganaDescuento(c, 2, 18), false, "16 días: sin descuento");
    assert.equal(B.ganaDescuento(c, 10, 25), true);
    assert.equal(B.ganaDescuento(c, 10, 26), false);
  }
  assert.equal(B.CIFRAS_BARRANQUILLA.a7.dias, 15);
  assert.equal(B.CIFRAS_BARRANQUILLA.a9.dias, 15);
  /* P2 de Itagaki: salen los renglones de fechas (el calendario muestra los días) y no hay «días». */
  for (const id of ["a7", "a9"]) {
    const r = asiento(id).renglones.flat();
    assert.ok(!r.some((x) => /^Fecha /.test(x)), `${id}: queda un renglón de fecha`);
    assert.ok(!r.some((x) => /días/i.test(x)), `${id}: el hecho no da los días`);
  }
  /* La ventana sale de los datos: la factura, el plazo de la condición y el día del pago, que cae en la frontera. */
  for (const [id, c] of [["a7", B.CONDICIONES.compra], ["a9", B.CONDICIONES.venta]]) {
    const v = asiento(id).ventana;
    assert.deepEqual(v, { factura: B.OPERACIONES[id].factura, plazo: c.plazo, pago: B.OPERACIONES[id].dia });
    assert.equal(v.factura + v.plazo, v.pago, `${id}: el pago cae justo en la frontera`);
  }
  assert.deepEqual(A.filter((a) => a.ventana).map((a) => a.id), ["a7", "a9"]);
  assert.deepEqual([B.OPERACIONES.a7.factura, B.OPERACIONES.a7.dia, B.OPERACIONES.a9.factura, B.OPERACIONES.a9.dia], [2, 17, 10, 25]);
});

/* ═══════════ LA REGLA DE PRIORIDAD ═══════════ */

test("★★★ 1 y 4: «Descuento comercial condicionado» se diagnostica por valor; con otro valor, la genérica de esa cuenta", () => {
  let casos = 0;
  for (const id of ["a1", "a4"]) {
    const a = asiento(id);
    const tabla = a.cuentaMal[T.DESCUENTO];
    const N = B.CIFRAS_BARRANQUILLA[id];
    for (const [valor, texto] of [[N.comercial, tabla[N.comercial]], [N.condicionado, tabla[N.condicionado]], [123456, tabla.otro]]) {
      for (const lado of ["debe", "haber"]) {
        casos++;
        assert.deepEqual(J.evaluarBarranquilla(a, [...bien(a), R(lado, T.DESCUENTO, valor)]).textos, [texto], `${id} · ${lado} · ${valor}`);
      }
    }
    assert.equal(new Set(Object.values(tabla)).size, 3);
  }
  assert.equal(casos, 12);
});

test("★★★ la regla de prioridad, un camino por prueba: cruzado, cuenta, valor previsto, genérica y «Y hay más…»", () => {
  const a7 = asiento("a7");
  const N = B.CIFRAS_BARRANQUILLA.a7;
  /* Cruzado: el descuento en el debe tiene su texto. */
  const cruzado = bien(a7).map((x) => (x.cuenta === T.DESCUENTO ? { ...x, lado: "debe" } : x));
  assert.deepEqual(J.evaluarBarranquilla(a7, cruzado).textos, [a7.cruzado[T.DESCUENTO]]);
  /* Cuenta que el asiento no usa, con texto propio, y sin él. */
  assert.deepEqual(J.evaluarBarranquilla(a7, [...bien(a7), R("haber", T.COMPRAS, 5)]).textos, [a7.cuentaMal[T.COMPRAS]]);
  assert.deepEqual(J.evaluarBarranquilla(a7, [...bien(a7), R("haber", T.INGRESOS, 5)]).textos, [T.COMUNES_BARRANQUILLA.cuentaNoPrevista]);
  /* Valor previsto y genérica. */
  assert.deepEqual(J.evaluarBarranquilla(a7, bien(a7).map((x) => (x.cuenta === T.DESCUENTO ? { ...x, valor: B.EQUIVOCADAS_BARRANQUILLA.a7.descuentoDelCinco } : x))).textos, ["El descuento por pagar a tiempo es el 10 %. El 5 % comercial ya se restó el día 2."]);
  assert.deepEqual(J.evaluarBarranquilla(a7, bien(a7).map((x) => (x.cuenta === T.CAJA ? { ...x, valor: 7 } : x))).textos, [a7.generica]);
  /*
   * Primero la forma, luego el valor; entre los de forma, el orden del cálculo
   * (la devolución antes que el descuento: ORDEN_BARRANQUILLA); dos textos y
   * «Y hay más…».
   */
  const tres = [R("debe", T.PROVEEDORES, N.saldo), R("debe", T.DESCUENTO, N.descuento), R("haber", T.CAJA, 7), R("haber", T.DEV_COMPRAS, 5)];
  const r = J.evaluarBarranquilla(a7, tres);
  assert.deepEqual(r.textos, [a7.cuentaMal[T.DEV_COMPRAS], a7.cruzado[T.DESCUENTO], T.COMUNES_BARRANQUILLA.hayMas]);
  /* El asiento al revés: el texto se dice una vez. */
  const a8 = asiento("a8");
  assert.deepEqual(J.evaluarBarranquilla(a8, bien(a8).map((x) => ({ ...x, lado: otroLado(x.lado) }))).textos, [a8.cruzado[T.COMPRAS]]);
});

test("★★★ fletes: el del 2 vale completo con «Compras (fletes)» o con «Compras», nunca mezclado; el del 10, solo «Gasto de venta – fletes»", () => {
  const a2 = asiento("a2");
  const f = B.CIFRAS_BARRANQUILLA.a2.flete;
  const r0 = J.evaluarBarranquilla(a2, [R("debe", T.COMPRAS_FLETES, f), R("haber", T.CAJA, f)]);
  const r1 = J.evaluarBarranquilla(a2, [R("debe", T.COMPRAS, f), R("haber", T.CAJA, f)]);
  assert.deepEqual([r0.ok, r0.variante, r0.textos], [true, 0, [a2.acierto[0]]]);
  assert.deepEqual([r1.ok, r1.variante, r1.textos], [true, 1, [a2.acierto[1]]]);
  assert.equal(J.evaluarBarranquilla(a2, [R("debe", T.COMPRAS_FLETES, f / 2), R("debe", T.COMPRAS, f / 2), R("haber", T.CAJA, f)]).ok, false, "partido entre las dos");
  assert.equal(J.evaluarBarranquilla(a2, [R("debe", T.COMPRAS_FLETES, f), R("debe", T.COMPRAS, f), R("haber", T.CAJA, f)]).ok, false, "las dos");
  const a5 = asiento("a5");
  assert.equal(a5.correctos.length, 1);
  const g = B.CIFRAS_BARRANQUILLA.a5.flete;
  assert.equal(J.evaluarBarranquilla(a5, [R("debe", T.GASTO_FLETES, g), R("haber", T.CAJA, g)]).ok, true);
  /* En lugar del gasto: falta el gasto (la genérica) y la cuenta que no va, con su texto. */
  for (const c of [T.COMPRAS, T.COMPRAS_FLETES]) {
    const r = J.evaluarBarranquilla(a5, [R("debe", c, g), R("haber", T.CAJA, g)]);
    assert.equal(r.ok, false, c);
    assert.ok(r.textos.includes(a5.cuentaMal[c]), c);
  }
});

/* Los caminos que alcanzan cada texto de un asiento. */
function caminosDe(a) {
  const c = [];
  a.correctos.forEach((_, v) => c.push(bien(a, v)));
  const cuentas = a.correctos[0].map((y) => y.cuenta);
  for (const x of a.correctos.flat()) {
    c.push(bien(a).map((y) => (y.cuenta === x.cuenta ? { ...y, lado: otroLado(y.lado) } : y)));
    c.push(bien(a).filter((y) => y.cuenta !== x.cuenta));
    c.push(bien(a).map((y) => (y.cuenta === x.cuenta ? { ...y, valor: 7 } : y)));
  }
  c.push(bien(a).map((y) => ({ ...y, lado: otroLado(y.lado) })));
  for (const [i, x] of cuentas.entries()) for (const z of cuentas.slice(i + 1)) c.push(bien(a).map((y) => (y.cuenta === x || y.cuenta === z ? { ...y, lado: otroLado(y.lado) } : y)));
  for (const cuenta of T.HOJA_BARRANQUILLA) {
    c.push([...bien(a), R("haber", cuenta, 5)]);
    /* La cuenta que se diagnostica por valor, con cada valor previsto. */
    const cm = a.cuentaMal[cuenta];
    if (cm && typeof cm === "object") for (const k of Object.keys(cm)) if (k !== "otro") c.push([...bien(a), R("debe", cuenta, Number(k))]);
  }
  for (const v of a.valorMal) {
    const variante = a.correctos.findIndex((cc) => cc.some((y) => y.cuenta === v.cuenta));
    c.push(bien(a, variante).map((y) => (y.cuenta === v.cuenta ? { ...y, valor: v.valor } : y)));
  }
  const ajena = T.HOJA_BARRANQUILLA.filter((x) => !cuentas.includes(x));
  c.push([...bien(a).map((y) => ({ ...y, valor: 7 })), R("debe", ajena[0], 5), R("haber", ajena[1], 5)].slice(0, 6));
  return c.filter((x) => MJ.puedeRevisarMate(x) && ["debe", "haber"].every((l) => x.filter((y) => y.lado === l).length <= MJ.MAXIMO_POR_LADO));
}

test("★★★ cada texto de cada asiento se alcanza con la hoja de once cuentas (guarda: 10 asientos, 99 textos)", () => {
  let total = 0;
  for (const a of A) {
    const alcanzados = new Set();
    for (const c of caminosDe(a)) J.evaluarBarranquilla(a, c).textos.forEach((t) => alcanzados.add(t));
    const todos = textosDeAsiento(a);
    total += todos.length;
    assert.deepEqual(todos.filter((t) => !alcanzados.has(t)), [], `${a.id}: textos que ningún camino alcanza`);
  }
  assert.equal(total, 99);
});

test("★★ la hoja tiene las 11 cuentas en orden alfabético, como en r5-3 (decisión 4)", () => {
  const H = T.HOJA_BARRANQUILLA;
  assert.equal(H.length, 11);
  assert.deepEqual([...H].sort((x, y) => x.localeCompare(y, "es")), H);
  for (const a of A) for (const c of a.correctos.flat()) assert.ok(H.includes(c.cuenta), `${a.id}: ${c.cuenta} no está en la hoja`);
  assert.ok(PLANO.includes(H.join(" · ")));
});

/* ═══════════ FP ═══════════ */

test("★★★ FP: 9 por acierto, de 0 a 10, siempre enteros y los mismos que el servidor (0017)", () => {
  const delServidor = (pct) => { const r = Math.max(50, Math.min(100, Math.round(pct))); return Math.floor((90 * r + 50) / 100); };
  const fps = [];
  for (let k = 0; k <= 10; k++) {
    const pct = J.puntuarR5_4(k);
    assert.equal(Number.isInteger(pct), true, `${k} de 10: ${pct} %`);
    assert.equal(Number.isInteger(90 * pct / 100), true, `${k} de 10: mitad de FP`);
    /* 300 s: por encima del tiempo mínimo de experto (150 s), el factor de tiempo es 1. */
    const { fp } = calcularFP({ dificultad: T.R5_4.dificultad, modalidad: T.R5_4.modalidad, aciertos: pct / 100, duracionMs: 300_000 });
    assert.equal(fp, delServidor(pct), `${k} de 10`);
    fps.push(fp);
  }
  assert.deepEqual(fps, [45, 45, 45, 45, 45, 45, 54, 63, 72, 81, 90]);
});

/* ═══════════ LAS DOS PUERTAS ═══════════ */

test("★★★ catálogo, registro de la vista, etiqueta y migración 0253 dicen lo mismo", () => {
  const tema = SUBJECTS.contabilidad.topics.find((t) => t.id === "repaso-capitulo-5");
  assert.deepEqual(tema.actividades.map((a) => a.id), ["r5-1", "r5-2", "r5-3", "r5-4", "r5-5"]);
  const a = actividadesDeTipo(tema, HACER).find((x) => x.id === "r5-4");
  assert.equal(a.nombre, T.R5_4.nombre);
  assert.deepEqual(a.clasificacion, { tipo: HACER, modalidad: "evaluativa", dificultad: "experto", fpBase: 90 });
  assert.equal(JUEGOS_REPASO_CAP5.find((j) => j.id === "r5-4").titulo, T.R5_4.nombre);
  assert.equal(JUEGOS_REPASO_CAP5.find((j) => j.id === "r5-4").Mecanica, Barranquilla);
  assert.ok(hayReglaPara("r5-4"));
  assert.equal(etiquetaDeItem("r5-4", "a7"), "17 SEP · Pago");
  assert.equal(new Set(A.map((x) => etiquetaDeItem("r5-4", x.id))).size, 10);
  const migraciones = readdirSync(new URL("supabase/migrations/", RAIZ)).filter((f) => /^\d{4}_/.test(f) && leer(`supabase/migrations/${f}`).includes("'r5-4'"));
  assert.deepEqual(migraciones, ["0253_r5_4_septiembre_en_barranquilla.sql"]);
  const sql = leer(`supabase/migrations/${migraciones[0]}`);
  assert.match(sql, /\('r5-4', 'contabilidad', 'repaso-capitulo-5', 'evaluativa', 'experto', 90, 1\)\s*on conflict \(activity_id\) do nothing;/);
  assert.doesNotMatch(sql.replace(/^--.*$/gm, ""), /\b(update|delete|alter|drop|truncate)\b/i);
  assert.match(sql, /--\s+delete from public\.actividad_catalogo where activity_id = 'r5-4';/);
});

/* ═══════════ LA LÍNEA DE SEPTIEMBRE ═══════════ */

test("★★ P2 · el calendario de septiembre: 30 días en 7 columnas, el día en curso con 2 px #F8F9FA, un punto por asiento hecho y el nombre de cada día", async () => {
  assert.equal(ACTIVIDAD_BARRANQUILLA.DIAS, 30);
  assert.equal(ACTIVIDAD_BARRANQUILLA.CALENDARIO, true);
  const { caja } = await montar(h(Barranquilla, { pasoInicial: 9 }));
  const cal = caja.querySelector("[data-calendario]");
  const dias = [...cal.querySelectorAll("[data-dia]")];
  assert.deepEqual(dias.map((d) => Number(d.dataset.dia)), Array.from({ length: 30 }, (_, k) => k + 1));
  assert.equal(cal.querySelector('[role="grid"]').style.gridTemplateColumns, "repeat(7, minmax(0, 1fr))");
  /* Sin días de la semana: el 8 va en la fila 2, columna 1. */
  const d8 = cal.querySelector('[data-dia="8"]');
  assert.deepEqual([d8.style.gridRow, d8.style.gridColumn], ["2", "1"]);
  /* El asiento en curso (28 sep). */
  assert.deepEqual(dias.filter((d) => d.dataset.actual === "si").map((d) => d.dataset.dia), ["28"]);
  assert.match(cal.querySelector('[data-dia="28"]').style.outline, /2px solid (#F8F9FA|rgb\(248, 249, 250\))/i);
  /* Los nueve asientos de antes, como puntos en su día (dos el 2, el 10 y el 25). */
  const puntos = (d) => cal.querySelectorAll(`[data-dia="${d}"] [data-punto-mes="hecho"]`).length;
  assert.deepEqual([2, 8, 10, 15, 17, 25, 28].map(puntos), [2, 1, 2, 1, 1, 2, 0]);
  /* Cada celda dice su día y sus operaciones. */
  assert.equal(cal.querySelector('[data-dia="2"]').getAttribute("aria-label"), `2 de septiembre: ${T.CALENDARIO_R5_4.nombres.a1}, ${T.CALENDARIO_R5_4.nombres.a2}`);
  assert.equal(cal.querySelector('[data-dia="3"]').getAttribute("aria-label"), "3 de septiembre");
  /* El día en mono 12 #A8B6C8. */
  const numero = cal.querySelector('[data-dia="3"] span');
  assert.deepEqual([numero.style.fontSize, numero.style.color], ["12px", "rgb(168, 182, 200)"]);
  /* Sin la línea de nodos y sin el panel del mes. */
  assert.equal(caja.querySelectorAll("[data-nodo]").length, 0);
});

/* ═══════════ LA PANTALLA ═══════════ */

test("★★★ E1 · Takamura: la entrada se funde con el asiento 1 (objetivo y aviso una vez, encima) y las tarjetas pasan a «Datos de septiembre»; el bloque de la operación sale en 3 y 6", async () => {
  const { caja } = await montar(h(Barranquilla, {}));
  assert.equal(Boolean(caja.querySelector('[data-paso="entrada"]')), false, "sigue la pantalla de entrada");
  assert.equal(Boolean(caja.querySelector("[data-empezar]")), false);
  const raiz = caja.querySelector('[data-paso="a1"]');
  assert.equal(raiz.hasAttribute("data-r5-4"), true);
  assert.equal(raiz.firstElementChild.textContent, T.R5_4.objetivo);
  /* B5: el aviso de la entrada no se repite: lo dice el botón «Datos de septiembre» («Sin IVA ni retención…»), una vez. */
  assert.equal(Boolean(raiz.querySelector("[data-aviso]")), false);
  assert.equal(raiz.textContent.split("IVA ni retención").length - 1, 1);
  /* Ningún muro: de la apertura de la entrada no queda nada en el asiento 1. */
  assert.equal(raiz.textContent.includes(T.ENTRADA_BARRANQUILLA.apertura), false);
  /* Las tarjetas, en la hoja «Datos de septiembre». */
  await tocar(raiz.querySelector("[data-boton-datos]"));
  assert.equal(document.querySelectorAll("[data-hoja-datos] [data-dato-declarado]").length, 5);
  /* El asiento 2 no repite ni el objetivo ni el aviso. */
  const a2 = await montar(h(Barranquilla, { pasoInicial: 1 }));
  assert.equal(Boolean(a2.caja.querySelector("[data-objetivo]")) || Boolean(a2.caja.querySelector("[data-aviso]")), false);
  a2.desmontar();
  for (const id of ["a3", "a6"]) {
    const k = A.findIndex((x) => x.id === id);
    const pantalla = await montar(h(Barranquilla, { pasoInicial: k }));
    const bloque = pantalla.caja.querySelector("[data-bloque-operacion]");
    assert.equal(Boolean(bloque), true, id);
    assert.equal(bloque.firstElementChild.textContent, asiento(id).bloque.marca);
    assert.equal(bloque.querySelectorAll("[data-renglon-hecho]").length, 3);
    pantalla.desmontar();
  }
  /* El botón de datos dice lo de septiembre. */
  const a1 = await montar(h(Barranquilla, { pasoInicial: 0 }));
  assert.equal(a1.caja.querySelector("[data-boton-datos]").textContent, `${T.ROTULOS_BARRANQUILLA.datosDeMarzo}${T.ROTULOS_BARRANQUILLA.tasasALaVista}`);
});

/* Los pocos caminos que cubren todos los textos de un asiento. */
function cubrir(a) {
  const caminos = caminosDe(a).map((c) => ({ c, textos: new Set(J.evaluarBarranquilla(a, c).textos) }));
  const faltan = new Set(caminos.flatMap((x) => [...x.textos]));
  const elegidos = [];
  while (faltan.size) {
    const mejor = caminos.reduce((m, x) => ([...x.textos].filter((t) => faltan.has(t)).length > [...m.textos].filter((t) => faltan.has(t)).length ? x : m));
    elegidos.push(mejor.c);
    for (const t of mejor.textos) faltan.delete(t);
  }
  return elegidos;
}
async function jugarCamino(k, renglones) {
  const { caja, desmontar } = await montar(h(Barranquilla, { pasoInicial: k }));
  await abrirVentana(caja, A[k]);
  for (const r of renglones) await anadir(caja, r.lado, r.cuenta, r.valor);
  await tocar(caja.querySelector("[data-revisar]"));
  const pantalla = document.body.cloneNode(true);
  desmontar();
  return pantalla;
}

test("★★★ E1 · cada texto del paquete sale en la pantalla en algún estado (guarda: 116 textos, 102 caminos)", async () => {
  const vistas = [];
  const entrada = await montar(h(Barranquilla, {}));
  vistas.push(document.body.textContent);
  entrada.desmontar();
  const datos = await montar(h(Barranquilla, { pasoInicial: 0 }));
  await tocar(datos.caja.querySelector("[data-boton-datos]"));
  vistas.push(document.body.textContent);
  datos.desmontar();
  let caminos = 0;
  for (const [k, a] of A.entries()) {
    for (const c of cubrir(a)) { vistas.push((await jugarCamino(k, c)).textContent); caminos++; }
  }
  const todo = vistas.join("\n");
  const textos = textosDelEstudiante();
  assert.equal(textos.length, 116);
  const faltan = textos.filter((t) => !todo.includes(t));
  assert.deepEqual(faltan, [], `no salen en pantalla: ${faltan.join(" | ")}`);
  assert.equal(caminos, 102, "no jugó los caminos que dice jugar");
});

test("★★ B5 de enganche.md: ninguna frase sale dos veces en la misma pantalla (los nombres de cuenta no cuentan)", async () => {
  const cuentas = new Set(T.HOJA_BARRANQUILLA);
  const sueltas = new Set([VEREDICTO.cuenta.ok, VEREDICTO.cuenta.mal, VEREDICTO.valor.ok, VEREDICTO.valor.mal]);
  const repetidas = (raiz) => {
    const hojas = [...raiz.querySelectorAll("p, span, button, h3, li, div")].filter((el) => !el.children.length).map((el) => el.textContent.trim())
      .filter((t) => t.split(/\s+/).length >= 3 && !cuentas.has(t) && !sueltas.has(t));
    return hojas.filter((t, k) => hojas.indexOf(t) !== k);
  };
  let estados = 0;
  const entrada = await montar(h(Barranquilla, {}));
  assert.deepEqual(repetidas(document.body), [], "entrada");
  entrada.desmontar();
  estados++;
  for (const [k, a] of A.entries()) {
    const abierto = await montar(h(Barranquilla, { pasoInicial: k }));
    assert.deepEqual(repetidas(document.body), [], `${a.id} antes`);
    await abrirVentana(abierto.caja, a);
    await tocar(abierto.caja.querySelector("[data-boton-datos]"));
    assert.deepEqual(repetidas(document.body), [], `${a.id} con los datos`);
    abierto.desmontar();
    for (const c of [bien(a), bien(a).map((y) => ({ ...y, valor: 7 }))]) {
      assert.deepEqual(repetidas(await jugarCamino(k, c)), [], `${a.id} después`);
      estados++;
    }
    estados += 2;
  }
  assert.equal(estados, 41);
});

/* ═══════════ EL MES EN DOS CUENTAS ═══════════ */

test("★★★ el mes en dos cuentas: las cifras de Miyata siguen en los datos, pero el panel sale de r5-4 (P2 de Itagaki)", async () => {
  const cuentas = T.MES_BARRANQUILLA.cuentas;
  for (const c of cuentas) assert.ok(PAQUETE_MES.includes(`| ${c.nombre} | ${c.debe} | ${c.haber} | ${c.difDebe} | ${c.difHaber} |`), c.nombre);
  const movs = ACTIVIDAD_BARRANQUILLA.MOVIMIENTOS_MATE;
  const [caja, desc] = M.estadoDelMes(movs, cuentas, null);
  assert.deepEqual([caja.debe.total, caja.haber.total], [105710000, 25730950]);
  assert.deepEqual([desc.debe.total, desc.haber.total], [2610000, 939550]);
  assert.deepEqual(M.diferenciaDe(desc.debe.total, desc.haber.total), { valor: 1670450, lado: "debe" });
  assert.ok(PAQUETE_MES.replace(/\s+/g, " ").includes("Caja entradas $105.710.000, salidas $25.730.950, diferencia $79.979.050 débito; descuento debe $2.610.000, haber $939.550, diferencia $1.670.450 débito"));
  /* P2 de Itagaki: el panel sale de r5-4 (el calendario es la figura del mes); en r5-3 se queda. */
  for (const id of ["a1", "a7"]) {
    const k = A.findIndex((x) => x.id === id);
    const { caja: c, desmontar } = await montar(h(Barranquilla, { pasoInicial: k }));
    await abrirVentana(c, A[k]);
    for (const r of bien(A[k])) await anadir(c, r.lado, r.cuenta, r.valor);
    await tocar(c.querySelector("[data-revisar]"));
    assert.equal(Boolean(c.querySelector("[data-mes-en-dos-cuentas]")), false, `${id}: el panel del mes sigue en r5-4`);
    desmontar();
  }
  /* La frase final del descuento: diste más. */
  assert.equal(T.MES_BARRANQUILLA.final.debe(1670450), "Neto: diste $1.670.450 a quien pagó a tiempo.");
  assert.ok(PAQUETE_MES.includes("«Neto: diste $1.670.450 a quien pagó a tiempo.»"));
});

test("★★★ se juega entera: diez asientos (dos con ventana), el final con «SEPTIEMBRE EN 10 ASIENTOS», el calendario del resumen y el detalle", async () => {
  const fin = [];
  const { caja } = await montar(h(Barranquilla, { onCompletar: (...x) => fin.push(x) }));
  for (const [k, a] of A.entries()) {
    assert.equal(caja.querySelector("[data-progreso]").textContent, `Asiento ${k + 1} de 10`);
    /* Falla el pago del 17: Caja sin descuento. */
    const renglones = a.id === "a7" ? [R("debe", T.PROVEEDORES, B.CIFRAS_BARRANQUILLA.a7.saldo), R("haber", T.CAJA, B.CIFRAS_BARRANQUILLA.a7.saldo)] : bien(a);
    await abrirVentana(caja, a);
    for (const r of renglones) await anadir(caja, r.lado, r.cuenta, r.valor);
    await tocar(caja.querySelector("[data-revisar]"));
    await tocar(caja.querySelector("[data-siguiente]"));
  }
  assert.ok(caja.querySelector("[data-cierre]"));
  assert.ok(caja.textContent.includes("SEPTIEMBRE EN 10 ASIENTOS"));
  assert.equal(caja.querySelector("[data-n-de-m]").textContent, "9 de 10");
  assert.deepEqual([...caja.querySelectorAll("[data-fila-asiento]")].map((f) => f.firstElementChild.textContent), A.map((a) => `${a.dia} SEP`));
  assert.deepEqual([...caja.querySelectorAll("[data-fila-asiento]")].map((f) => f.children[1].textContent), A.map((a) => a.operacion));
  /* P2: encima del resumen, el calendario completo: relleno si acertó, anillo coral si no, con una sola leyenda. */
  const resumen = caja.querySelector("[data-cierre] [data-calendario]");
  const marcas = (d) => [...resumen.querySelectorAll(`[data-dia="${d}"] [data-punto-mes]`)].map((p) => p.dataset.puntoMes).join(",");
  assert.deepEqual([2, 8, 10, 15, 17, 25, 28].map(marcas), ["acierto,acierto", "acierto", "acierto,acierto", "acierto", "error", "acierto,acierto", "acierto"]);
  assert.equal(resumen.querySelector("[data-leyenda-mes]").textContent, "CorrectoNo va aquí");
  assert.equal(Boolean(caja.querySelector("[data-mes-en-dos-cuentas]")), false);
  assert.equal(fin.length, 1);
  assert.equal(fin[0][0], 90);
  assert.deepEqual(fin[0][2].filter((d) => !d.ok).map((d) => d.item), ["a7"]);
});

/* ═══════════ B4 E INFLESZ ═══════════ */

test("★★ B4: r5-4 no define estados ni colores de calificación propios: los de comun.jsx, por el motor de r5-3", () => {
  const fuente = leer("src/components/repasoCap5/Barranquilla.jsx");
  assert.doesNotMatch(fuente, /teal|ambar|#2A9D8F|#E9C46A|border:/i);
  assert.match(fuente, /import \{ MesContable \} from "\.\/Mate\.jsx"/);
});

test("★★★ todo texto de 10 palabras o más pasa 65 con inflesz.js (guarda: 96 medidos)", () => {
  let medidos = 0;
  const bajos = [];
  for (const t of textosDelEstudiante()) {
    const r = inflesz(t);
    assert.deepEqual(r.desconocidas, [], `letra que la herramienta no sabe contar: ${t}`);
    if (!r.aplica) continue;
    medidos++;
    if (r.valor < UMBRAL) bajos.push(`${r.valor} · ${t}`);
  }
  assert.equal(medidos, 96, "no midió los textos que dice medir");
  assert.deepEqual(bajos, []);
  /* Los dos que Kamogawa sustituyó (daban 59,7) ya pasan. */
  for (const id of ["a8", "a10"]) assert.ok(inflesz(asiento(id).hecho).valor >= UMBRAL, id);
});

/* ═══════════ LA FECHA UNA SOLA VEZ EN LA TARJETA (Kamogawa) ═══════════ */

test("★★ la tarjeta del hecho no repite la fecha: ningún hecho de septiembre lleva la marca «n DE SEPTIEMBRE»", async () => {
  const { hechoDiceSuFecha } = await import("../../components/repasoCap5/Mate.jsx");
  for (const [k, a] of A.entries()) {
    /* P2 de Itagaki: la fecha la da el calendario (el día en curso, con su contorno); la frase ya no la lleva. */
    assert.equal(hechoDiceSuFecha(a), false, `${a.id}: la frase vuelve a llevar la fecha`);
    const { caja, desmontar } = await montar(h(Barranquilla, { pasoInicial: k }));
    /* P2: la frase va sola, sobre el Panel; los datos, en su tarjeta (tras la ventana, si la hay). */
    await abrirVentana(caja, a);
    const tarjeta = caja.querySelector("[data-hecho]");
    assert.equal(tarjeta.textContent.includes(a.fecha), false, `${a.id}: la marca de fecha sigue en la tarjeta`);
    assert.equal(caja.querySelector("[data-frase]").textContent, a.hecho, `${a.id}: el texto de Miyata no se toca`);
    assert.equal(caja.querySelector("[data-frase]").textContent.includes(a.fecha), false);
    assert.equal(caja.querySelector('[data-calendario] [data-actual="si"]').dataset.dia, String(a.dia));
    desmontar();
  }
});

test("★★ E5 · la lista final no repite el día: «2 SEP · Compra», sin «, día 2», y ningún renglón queda igual a otro", async () => {
  /* La pantalla final pinta «fecha · operacion» por fila (lo cuida la prueba del cierre). */
  const filas = A.map((a) => `${a.dia} SEP · ${a.operacion}`);
  assert.equal(filas.length, A.length);
  assert.deepEqual(filas.filter((f) => /\bd[ií]a\b/i.test(f)), [], "un renglón repite el día");
  assert.equal(new Set(filas).size, filas.length, "dos renglones quedan iguales");
  assert.equal(filas[1], "2 SEP · Flete de la compra");
  assert.deepEqual(A.map((a) => J.unidadDeR5_4(a.id)), filas, "el panel docente dice lo mismo que la lista");
});

/* ═══════════ P2 DE ITAGAKI · LA VENTANA DEL DESCUENTO ═══════════ */

const tecla = async (el, key) => { await act(async () => { el.dispatchEvent(new w.KeyboardEvent("keydown", { key, bubbles: true })); }); };
const tramosDe = (caja, quien) => [...caja.querySelectorAll(`[data-tramo="${quien}"]`)].map((t) => `${t.style.gridRow}:${t.style.gridColumn}`);

test("★★★ P2 · la ventana: el borde arranca en la factura, se mueve con flechas (±1 día, ±1 semana) o tocando un día; «Comprobar» pide largo; el pago no aparece antes", async () => {
  const k = A.findIndex((x) => x.id === "a7");
  const { caja } = await montar(h(Barranquilla, { pasoInicial: k }));
  const perilla = caja.querySelector("[data-perilla]");
  /* Un deslizador accesible, con su texto de valor. */
  assert.equal(perilla.getAttribute("role"), "slider");
  assert.deepEqual([perilla.getAttribute("aria-valuenow"), perilla.getAttribute("aria-valuemax")], ["2", "30"]);
  assert.equal(perilla.getAttribute("aria-valuetext"), "Termina el 2 de septiembre");
  /* Vacío: largo 0, «Comprobar» apagado, sin armador ni pago; la factura en su día. */
  const comprobar = () => caja.querySelector("[data-revisar-ventana]");
  assert.equal(comprobar().getAttribute("aria-disabled"), "true");
  assert.equal(tramosDe(caja, "estudiante").length, 0);
  assert.equal(Boolean(caja.querySelector("[data-armador]")), false, "el armador espera a la ventana");
  assert.equal(Boolean(caja.querySelector("[data-pago]")), false, "el pago delata la respuesta");
  assert.ok(caja.querySelector('[data-dia="2"] [data-factura]'));
  /* Teclado: derecha +1, abajo +7, izquierda −1, arriba −7; nunca antes de la factura ni después del 30. */
  await tecla(perilla, "ArrowRight");
  assert.equal(caja.querySelector("[data-perilla]").getAttribute("aria-valuenow"), "3");
  await tecla(caja.querySelector("[data-perilla]"), "ArrowDown");
  await tecla(caja.querySelector("[data-perilla]"), "ArrowDown");
  assert.equal(caja.querySelector("[data-perilla]").getAttribute("aria-valuenow"), "17");
  await tecla(caja.querySelector("[data-perilla]"), "ArrowUp");
  await tecla(caja.querySelector("[data-perilla]"), "ArrowUp");
  await tecla(caja.querySelector("[data-perilla]"), "ArrowUp");
  assert.equal(caja.querySelector("[data-perilla]").getAttribute("aria-valuenow"), "2", "pasó antes de la factura");
  /* Tocar un día posterior a la factura mueve el borde; uno anterior, no. */
  await tocar(caja.querySelector('[data-dia="1"]'));
  assert.equal(caja.querySelector("[data-perilla]").getAttribute("aria-valuenow"), "2");
  await tocar(caja.querySelector('[data-dia="16"]'));
  assert.equal(caja.querySelector("[data-perilla]").getAttribute("aria-valuetext"), "Termina el 16 de septiembre");
  /* La franja: del 3 al 16, un tramo por fila (3-7, 8-14, 15-16), con fondo y contorno de 1 px. */
  assert.deepEqual(tramosDe(caja, "estudiante"), ["1:3 / 8", "2:1 / 8", "3:1 / 3"]);
  const t = caja.querySelector('[data-tramo="estudiante"]');
  assert.equal(t.style.background, "rgba(184, 196, 212, 0.18)");
  assert.equal(t.style.borderRadius, "6px");
  assert.equal(comprobar().getAttribute("aria-disabled"), null);
  /* Error (cuenta el día de la factura): coral en la franja, «No va aquí», y la correcta con «Iba aquí: 17 sep». */
  await tecla(caja.querySelector("[data-perilla]"), "Enter");
  assert.equal(Boolean(caja.querySelector("[data-perilla]")), false, "la perilla sigue después de comprobar");
  assert.match(caja.querySelector('[data-tramo="estudiante"]').style.border, /2px solid (#E76F51|rgb\(231, 111, 81\))/i);
  assert.deepEqual(tramosDe(caja, "correcta"), ["1:3 / 8", "2:1 / 8", "3:1 / 4"]);
  assert.deepEqual([...caja.querySelectorAll("[data-veredicto-ventana] [data-veredicto]")].map((v) => v.textContent), ["No va aquíIncorrecto.", "Iba aquí: 17 sep"]);
  assert.equal(caja.querySelector("[data-devolucion-ventana]").dataset.devolucionVentana, "error");
  /* El pago cae en su día, y sigue el armador, sin botón en medio. */
  assert.ok(caja.querySelector('[data-dia="17"] [data-pago]'));
  assert.ok(caja.querySelector('[data-armador="tu-asiento"]'));
  /* Una calificación: el asiento bien no salva la ventana mal. */
  for (const r of bien(A[k])) await anadir(caja, r.lado, r.cuenta, r.valor);
  await tocar(caja.querySelector("[data-revisar]"));
  assert.equal(caja.querySelector("[data-devolucion]").dataset.devolucion, "error");
});

test("★★★ P2 · la ventana bien y el asiento bien califican acierto; la respuesta guarda el borde; el contorno pasa a 2 px #F8F9FA", async () => {
  const fin = [];
  const k = A.findIndex((x) => x.id === "a9");
  const { caja } = await montar(h(Barranquilla, { pasoInicial: k, onCompletar: (...x) => fin.push(x) }));
  await abrirVentana(caja, A[k]);
  assert.match(caja.querySelector('[data-tramo="estudiante"]').style.border, /2px solid (#F8F9FA|rgb\(248, 249, 250\))/i);
  assert.equal(caja.querySelectorAll('[data-tramo="correcta"]').length, 0);
  assert.deepEqual([...caja.querySelectorAll("[data-veredicto-ventana] [data-veredicto]")].map((v) => v.textContent), ["Correcto"]);
  for (const r of bien(A[k])) await anadir(caja, r.lado, r.cuenta, r.valor);
  await tocar(caja.querySelector("[data-revisar]"));
  assert.equal(caja.querySelector("[data-devolucion]").dataset.devolucion, "acierto");
  /* El asiento de r5-4 (el último no es este): sin el panel del mes; el botón sigue. */
  assert.ok(caja.querySelector("[data-siguiente]"));
});

test("★★★ P2 §10 · los textos del calendario son los de Miyata, literales en el paquete: mensajes de la ventana, nombres cortos (≤ 20) y texto alternativo (≤ 120)", async () => {
  const C = T.CALENDARIO_R5_4;
  const seccion = PAQUETE.slice(PAQUETE.indexOf("## v2 · r5-4 rediseñada"));
  const mensajes = [...Object.values(C.ventanaOk), ...Object.values(C.ventanaMal)];
  assert.equal(mensajes.length, 4);
  for (const t of [...mensajes, C.alt]) assert.ok(seccion.includes(`\n- ${t}\n`), t);
  for (const n of Object.values(C.nombres)) assert.ok(seccion.includes(`«${n}»`), n);
  assert.deepEqual(Object.keys(C.nombres), A.map((a) => a.id));
  assert.deepEqual(mensajes.filter((t) => t.length > 140), []);
  assert.deepEqual(Object.values(C.nombres).filter((t) => t.length > 20), []);
  assert.ok(C.alt.length <= 120);
  assert.deepEqual(A.filter((a) => a.hecho.length > 90).map((a) => a.id), [], "una frase del hecho pasa de 90 caracteres");
  /* La orden de arrastrar va en la frase de los dos asientos con condición. */
  assert.deepEqual(A.filter((a) => /Arrastra el borde/.test(a.hecho)).map((a) => a.id), ["a7", "a9"]);
  /* Y salen en pantalla: el texto alternativo en la rejilla y el nombre corto en su celda. */
  const k = A.findIndex((x) => x.id === "a7");
  const { caja } = await montar(h(Barranquilla, { pasoInicial: k }));
  assert.equal(caja.querySelector('[data-calendario] [role="grid"]').getAttribute("aria-label"), C.alt);
  await abrirVentana(caja, A[k]);
  assert.equal(caja.querySelector('[data-dia="17"]').getAttribute("aria-label"), `17 de septiembre: ${C.nombres.a7}`);
  assert.ok(caja.querySelector("[data-devolucion-ventana]").textContent.endsWith(C.ventanaOk.a7));
});

test("★★ P2 · el área táctil de la perilla mide 44 × 44, centrada en la perilla de 16 px (a 320 lo mide scripts/e5/medir-r5-4.mjs)", async () => {
  const { AREA_PERILLA } = await import("../../components/repasoCap5/Calendario.jsx");
  assert.equal(AREA_PERILLA, 44);
  const k = A.findIndex((x) => x.id === "a7");
  const { caja } = await montar(h(Barranquilla, { pasoInicial: k }));
  const area = caja.querySelector("[data-perilla-area]");
  assert.deepEqual([area.style.width, area.style.height, area.style.marginLeft, area.style.marginTop], ["44px", "44px", "-22px", "-22px"]);
  const boton = caja.querySelector("[data-perilla-boton]");
  assert.deepEqual([boton.style.width, boton.style.height], ["16px", "16px"]);
});

/* ═══════════ TAKAMURA · VEREDICTO DE #380 ═══════════ */

test("★★★ Takamura 2 · el calendario no regala la respuesta: antes de comprobar la ventana no hay pago, ni contorno del día en curso, ni nombre del pago en su celda", async () => {
  for (const id of ["a7", "a9"]) {
    const a = asiento(id);
    const { caja, desmontar } = await montar(h(Barranquilla, { pasoInicial: A.findIndex((x) => x.id === id) }));
    const cal = caja.querySelector("[data-calendario]");
    assert.equal(cal.querySelectorAll("[data-pago]").length, 0, `${id}: el pago está antes de comprobar`);
    assert.equal(cal.querySelectorAll('[data-actual="si"]').length, 0, `${id}: el día del pago está marcado`);
    assert.equal(cal.querySelector(`[data-dia="${a.ventana.pago}"]`).getAttribute("aria-label").includes(T.CALENDARIO_R5_4.nombres[id]), false, `${id}: el lector dice el día del pago`);
    /* Ni con la ventana a medio arrastrar. */
    await tocar(cal.querySelector(`[data-dia="${a.ventana.pago - 3}"]`));
    assert.equal(caja.querySelectorAll("[data-calendario] [data-pago]").length, 0);
    /* Al comprobar, aparecen los tres. */
    await tocar(caja.querySelector("[data-revisar-ventana]"));
    assert.ok(caja.querySelector(`[data-dia="${a.ventana.pago}"] [data-pago]`));
    assert.equal(caja.querySelector('[data-calendario] [data-actual="si"]').dataset.dia, String(a.ventana.pago));
    assert.ok(caja.querySelector(`[data-dia="${a.ventana.pago}"]`).getAttribute("aria-label").includes(T.CALENDARIO_R5_4.nombres[id]));
    /* Los datos, con la condición, van arriba del calendario; un solo nombre: «Condición». */
    const datos = caja.querySelector("[data-hecho]");
    assert.ok(datos.compareDocumentPosition(caja.querySelector("[data-calendario]")) & w.Node.DOCUMENT_POSITION_FOLLOWING);
    assert.ok(a.renglones.some(([e]) => e === "Condición") && !a.renglones.some(([e]) => e === "Condiciones"));
    desmontar();
  }
});

test("★★★ Takamura 3 · la devolución de la ventana nombra el error: 15 (desde el 1 del mes), 16 (contó el día de la factura) y, si no, la genérica", async () => {
  const C = T.CALENDARIO_R5_4;
  const casos = [["a7", 15, C.ventanaPorError.a7[15]], ["a7", 16, C.ventanaPorError.a7[16]], ["a7", 20, C.ventanaMal.a7], ["a9", 15, C.ventanaPorError.a9[15]], ["a9", 24, C.ventanaMal.a9]];
  assert.equal(C.ventanaPorError.a7[15], "Los 15 días se cuentan desde la factura, no desde el 1 del mes.");
  assert.equal(C.ventanaPorError.a7[16], "El día de la factura no cuenta: el primer día es el 3. Cuenta 15 desde ahí.");
  for (const [id, borde, texto] of casos) {
    const { caja, desmontar } = await montar(h(Barranquilla, { pasoInicial: A.findIndex((x) => x.id === id) }));
    await abrirVentana(caja, asiento(id), borde);
    const dev = caja.querySelector("[data-devolucion-ventana]");
    assert.equal(dev.dataset.devolucionVentana, "error");
    assert.equal(dev.textContent, `Incorrecto. ${texto}`, `${id} · ${borde}`);
    desmontar();
  }
  /* Los textos nuevos están en el paquete. */
  const seccion = PAQUETE.slice(PAQUETE.indexOf("## v2.1 · correcciones de Takamura"));
  for (const t of [...Object.values(C.ventanaPorError.a7), ...Object.values(C.ventanaPorError.a9)]) assert.ok(seccion.includes(`\n- ${t}\n`), t);
});

test("★★★ Takamura 5 · el pago sin descuento: «Falta el renglón del descuento» primero, el de Caja sin la frase de los días, y sin la genérica", () => {
  const a7 = asiento("a7");
  const N = B.CIFRAS_BARRANQUILLA.a7;
  const r = J.evaluarBarranquilla(a7, [R("debe", T.PROVEEDORES, N.saldo), R("haber", T.CAJA, N.saldo)]);
  assert.deepEqual(r.textos, ["Falta el renglón del descuento.", "Sí ganas el descuento. Te toca el 10 %."]);
  assert.ok(!r.textos.includes(a7.generica));
  assert.ok(!r.textos.some((t) => /no cuenta/.test(t)), "la frase de los días repite el calendario");
  /* Una genérica sola sí sale; con un texto específico al lado, calla y avisa que hay más. */
  assert.deepEqual(J.evaluarBarranquilla(a7, bien(a7).map((x) => (x.cuenta === T.CAJA ? { ...x, valor: 7 } : x))).textos, [a7.generica]);
  const dos = J.evaluarBarranquilla(a7, [R("debe", T.PROVEEDORES, N.saldo), R("haber", T.DESCUENTO, N.descuento), R("haber", T.CAJA, 7), R("haber", T.DEV_COMPRAS, 5)]);
  assert.ok(!dos.textos.includes(a7.generica));
  assert.equal(dos.textos.at(-1), T.COMUNES_BARRANQUILLA.hayMas);
});
