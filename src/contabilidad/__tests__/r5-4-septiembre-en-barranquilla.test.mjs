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
afterEach(() => { for (const d of [...montados]) d(); });
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
const otroLado = (l) => (l === "debe" ? "haber" : "debe");

/* ═══════════ LO QUE LEE EL ESTUDIANTE ═══════════ */

function textosDeAsiento(a) {
  const cm = Object.values(a.cuentaMal).flatMap((x) => (typeof x === "object" ? Object.values(x) : [x]));
  return [...new Set([...Object.values(a.cruzado), ...Object.values(a.falta), ...cm, ...a.valorMal.map((x) => x.texto), a.generica, ...a.acierto])];
}
function textosDelEstudiante() {
  const t = [T.R5_4.objetivo, T.ENTRADA_BARRANQUILLA.apertura, T.AVISO_BARRANQUILLA, ...T.DATOS_DECLARADOS_BARRANQUILLA.datos, T.COMUNES_BARRANQUILLA.cuentaNoPrevista, T.COMUNES_BARRANQUILLA.hayMas];
  for (const g of T.DATOS_DEL_LIBRO_BARRANQUILLA) if (g.nota) t.push(g.nota);
  for (const a of A) t.push(a.hecho, ...textosDeAsiento(a));
  t.push(...Object.values(T.LINEAS_MES_BARRANQUILLA));
  return [...new Set(t)];
}

test("★★★ cada texto del estudiante está entero en el paquete (guarda: 120 textos distintos)", () => {
  const textos = textosDelEstudiante();
  assert.equal(textos.length, 120);
  const escapar = (t) => t.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
  const entero = (t) => new RegExp(`(?:: |:\\*\\* |\\n- |\\| )${escapar(t)}(?:\\n| \\||$)`).test(PAQUETE) || PLANO.includes(`«${t}»`) || PAQUETE_MES.includes(`| ${t} |`);
  const fuera = textos.filter((t) => !entero(t));
  assert.deepEqual(fuera, [], `no están en el paquete: ${fuera.join(" | ")}`);
  /* Los renglones del hecho, el bloque y los datos del libro: «etiqueta · valor». */
  for (const a of A) {
    for (const [et, val] of [...a.renglones, ...(a.bloque?.renglones ?? [])]) assert.ok(PLANO.includes(`${et} · ${val}`), `${a.id}: ${et} · ${val}`);
    if (a.bloque) assert.ok(PLANO.includes(`Bloque «${a.bloque.marca}»`), a.bloque.marca);
    if (a.fleteEnElSiguiente) assert.ok(PLANO.includes(`${a.hecho} Renglones:`) && /Flete · en el asiento siguiente/.test(PAQUETE.slice(PAQUETE.indexOf(a.hecho), PAQUETE.indexOf(a.hecho) + 400)), a.id);
  }
  for (const [et, val] of T.DATOS_DEL_LIBRO_BARRANQUILLA[0].renglones) assert.ok(PLANO.includes(`${et} · ${val}`), et);
  /* Los nombres cortos de la pantalla final, en su orden, y los rótulos que cambian respecto de r5-3. */
  assert.ok(PLANO.includes(A.map((a) => a.operacion).join(" · ")));
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
  /* Las fechas del hecho son las de los datos, y no hay «Días desde la factura» (decisión 1). */
  for (const [id, fechas] of [["a7", ["Fecha de la compra", "2 sep", "Fecha del pago", "17 sep"]], ["a9", ["Fecha de la venta", "10 sep", "Fecha del cobro", "25 sep"]]]) {
    const r = asiento(id).renglones.flat();
    for (const x of fechas) assert.ok(r.includes(x), `${id}: ${x}`);
    assert.ok(!r.some((x) => /días/i.test(x)), `${id}: el hecho no da los días`);
  }
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

test("★★★ cada texto de cada asiento se alcanza con la hoja de once cuentas (guarda: 10 asientos, 98 textos)", () => {
  let total = 0;
  for (const a of A) {
    const alcanzados = new Set();
    for (const c of caminosDe(a)) J.evaluarBarranquilla(a, c).textos.forEach((t) => alcanzados.add(t));
    const todos = textosDeAsiento(a);
    total += todos.length;
    assert.deepEqual(todos.filter((t) => !alcanzados.has(t)), [], `${a.id}: textos que ningún camino alcanza`);
  }
  assert.equal(total, 98);
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
  assert.deepEqual(tema.actividades.map((a) => a.id), ["r5-1", "r5-2", "r5-3", "r5-4"]);
  const a = actividadesDeTipo(tema, HACER).find((x) => x.id === "r5-4");
  assert.equal(a.nombre, T.R5_4.nombre);
  assert.deepEqual(a.clasificacion, { tipo: HACER, modalidad: "evaluativa", dificultad: "experto", fpBase: 90 });
  assert.equal(JUEGOS_REPASO_CAP5.find((j) => j.id === "r5-4").titulo, T.R5_4.nombre);
  assert.equal(JUEGOS_REPASO_CAP5.find((j) => j.id === "r5-4").Mecanica, Barranquilla);
  assert.ok(hayReglaPara("r5-4"));
  assert.equal(etiquetaDeItem("r5-4", "a7"), "17 SEP · Pago, día 17");
  assert.equal(new Set(A.map((x) => etiquetaDeItem("r5-4", x.id))).size, 10);
  const migraciones = readdirSync(new URL("supabase/migrations/", RAIZ)).filter((f) => /^\d{4}_/.test(f) && leer(`supabase/migrations/${f}`).includes("'r5-4'"));
  assert.deepEqual(migraciones, ["0253_r5_4_septiembre_en_barranquilla.sql"]);
  const sql = leer(`supabase/migrations/${migraciones[0]}`);
  assert.match(sql, /\('r5-4', 'contabilidad', 'repaso-capitulo-5', 'evaluativa', 'experto', 90, 1\)\s*on conflict \(activity_id\) do nothing;/);
  assert.doesNotMatch(sql.replace(/^--.*$/gm, ""), /\b(update|delete|alter|drop|truncate)\b/i);
  assert.match(sql, /--\s+delete from public\.actividad_catalogo where activity_id = 'r5-4';/);
});

/* ═══════════ LA LÍNEA DE SEPTIEMBRE ═══════════ */

test("★★ la línea de septiembre: 30 días, nodos de 8 px, y en los días con dos operaciones (2, 10 y 25) los nodos no se tocan", async () => {
  assert.equal(ACTIVIDAD_BARRANQUILLA.DIAS, 30);
  assert.equal(ACTIVIDAD_BARRANQUILLA.NODO, 8);
  const { caja } = await montar(h(Barranquilla, { pasoInicial: 6 }));
  const nodos = [...caja.querySelectorAll("[data-nodo]")];
  assert.equal(nodos.length, 10);
  assert.ok(nodos.every((x) => x.style.width === "8px" && x.style.height === "8px"));
  assert.equal(caja.querySelector("[data-marca-fecha]").textContent, "17 SEP");
  /* El segundo de cada día, 14 px más abajo: en la vertical no se tocan (8 < 14). */
  for (const [d, x, y] of [[2, "a1", "a2"], [10, "a4", "a5"], [25, "a8", "a9"]]) {
    const [p, s] = [caja.querySelector(`[data-nodo="${x}"]`), caja.querySelector(`[data-nodo="${y}"]`)];
    assert.equal(parseFloat(s.style.top) - parseFloat(p.style.top), 14, `día ${d}`);
    assert.ok(14 > 8);
  }
  /* En la horizontal, días seguidos a 320: (288 − 12) / 29 = 9,5 px entre centros, más que los 8 del nodo. */
  assert.ok((288 - 12) / 29 > 8);
  assert.equal(Math.round(((288 - 12) / 29 - 8) * 10) / 10, 1.5);
});

/* ═══════════ LA PANTALLA ═══════════ */

test("★★★ E1 · la entrada pinta el objetivo, el aviso una sola vez, la línea y las tarjetas; el bloque de la operación sale en 3 y 6", async () => {
  const { caja } = await montar(h(Barranquilla, {}));
  const raiz = caja.querySelector('[data-paso="entrada"]');
  assert.equal(raiz.hasAttribute("data-r5-4"), true);
  assert.equal(raiz.querySelector("[data-objetivo]").textContent, T.R5_4.objetivo);
  assert.equal(raiz.querySelector("[data-aviso]").textContent, T.AVISO_BARRANQUILLA);
  /* B5: «IVA ni retención» una vez en la entrada. */
  assert.equal(raiz.textContent.split("IVA ni retención").length - 1, 1);
  assert.equal(raiz.querySelectorAll("[data-dato-declarado]").length, 5);
  assert.equal(raiz.querySelector("h3").textContent, "Septiembre en Barranquilla");
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
  for (const r of renglones) await anadir(caja, r.lado, r.cuenta, r.valor);
  await tocar(caja.querySelector("[data-revisar]"));
  const pantalla = document.body.cloneNode(true);
  desmontar();
  return pantalla;
}

test("★★★ E1 · cada texto del paquete sale en la pantalla en algún estado (guarda: 120 textos, 96 caminos)", async () => {
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
  assert.equal(textos.length, 120);
  const faltan = textos.filter((t) => !todo.includes(t));
  assert.deepEqual(faltan, [], `no salen en pantalla: ${faltan.join(" | ")}`);
  assert.equal(caminos, 96, "no jugó los caminos que dice jugar");
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

test("★★★ el mes en dos cuentas de r5-4: Caja y Descuento comercial condicionado, con las cifras de Miyata y la frase final", async () => {
  const cuentas = T.MES_BARRANQUILLA.cuentas;
  for (const c of cuentas) assert.ok(PAQUETE_MES.includes(`| ${c.nombre} | ${c.debe} | ${c.haber} | ${c.difDebe} | ${c.difHaber} |`), c.nombre);
  const movs = ACTIVIDAD_BARRANQUILLA.MOVIMIENTOS_MATE;
  const [caja, desc] = M.estadoDelMes(movs, cuentas, null);
  assert.deepEqual([caja.debe.total, caja.haber.total], [105710000, 25730950]);
  assert.deepEqual([desc.debe.total, desc.haber.total], [2610000, 939550]);
  assert.deepEqual(M.diferenciaDe(desc.debe.total, desc.haber.total), { valor: 1670450, lado: "debe" });
  assert.ok(PAQUETE_MES.replace(/\s+/g, " ").includes("Caja entradas $105.710.000, salidas $25.730.950, diferencia $79.979.050 débito; descuento debe $2.610.000, haber $939.550, diferencia $1.670.450 débito"));
  /* Los asientos 1, 3, 4 y 6 no tocan ninguna de las dos: versión compacta con su línea. */
  assert.deepEqual(A.filter((_, k) => movs[k].length === 0).map((a) => a.id), ["a1", "a3", "a4", "a6"]);
  assert.deepEqual(Object.keys(T.LINEAS_MES_BARRANQUILLA), ["a1", "a3", "a4", "a6"]);
  for (const id of ["a1", "a4"]) {
    const k = A.findIndex((x) => x.id === id);
    const { caja: c, desmontar } = await montar(h(Barranquilla, { pasoInicial: k }));
    for (const r of bien(A[k])) await anadir(c, r.lado, r.cuenta, r.valor);
    await tocar(c.querySelector("[data-revisar]"));
    const panel = c.querySelector("[data-mes-en-dos-cuentas]");
    assert.equal(panel.dataset.mesEnDosCuentas, "compacta", id);
    assert.equal(panel.querySelector("[data-linea-mes]").textContent, T.LINEAS_MES_BARRANQUILLA[id]);
    desmontar();
  }
  /* El 7 mueve las dos: panel completo, con el tramo del descuento en el haber. */
  const k7 = A.findIndex((x) => x.id === "a7");
  const { caja: c7 } = await montar(h(Barranquilla, { pasoInicial: k7 }));
  for (const r of bien(A[k7])) await anadir(c7, r.lado, r.cuenta, r.valor);
  await tocar(c7.querySelector("[data-revisar]"));
  assert.equal(c7.querySelector("[data-mes-en-dos-cuentas]").dataset.mesEnDosCuentas, "asiento");
  assert.equal(c7.querySelector(`[data-cuenta-mes="${T.DESCUENTO}"] [data-lado-mes="haber"] [data-acumulado]`).dataset.acumulado, "939550");
  /* La frase final del descuento: diste más. */
  assert.equal(T.MES_BARRANQUILLA.final.debe(1670450), "Neto: diste $1.670.450 a quien pagó a tiempo.");
  assert.ok(PAQUETE_MES.includes("«Neto: diste $1.670.450 a quien pagó a tiempo.»"));
});

test("★★★ se juega entera: diez asientos, el final con «SEPTIEMBRE EN 10 ASIENTOS», el mes en cierre y el detalle", async () => {
  const fin = [];
  const { caja } = await montar(h(Barranquilla, { onCompletar: (...x) => fin.push(x) }));
  await tocar(caja.querySelector("[data-empezar]"));
  for (const [k, a] of A.entries()) {
    assert.equal(caja.querySelector("[data-progreso]").textContent, `ASIENTO ${k + 1} DE 10`);
    /* Falla el pago del 17: Caja sin descuento. */
    const renglones = a.id === "a7" ? [R("debe", T.PROVEEDORES, B.CIFRAS_BARRANQUILLA.a7.saldo), R("haber", T.CAJA, B.CIFRAS_BARRANQUILLA.a7.saldo)] : bien(a);
    for (const r of renglones) await anadir(caja, r.lado, r.cuenta, r.valor);
    await tocar(caja.querySelector("[data-revisar]"));
    await tocar(caja.querySelector("[data-siguiente]"));
  }
  assert.ok(caja.querySelector("[data-cierre]"));
  assert.ok(caja.textContent.includes("SEPTIEMBRE EN 10 ASIENTOS"));
  assert.equal(caja.querySelector("[data-n-de-m]").textContent, "9 de 10");
  assert.deepEqual([...caja.querySelectorAll("[data-fila-asiento]")].map((f) => f.firstElementChild.textContent), A.map((a) => `${a.dia} SEP`));
  assert.deepEqual([...caja.querySelectorAll("[data-fila-asiento]")].map((f) => f.children[1].textContent), A.map((a) => a.operacion));
  assert.equal(caja.querySelector("[data-frase-final]").textContent, "Neto: diste $1.670.450 a quien pagó a tiempo.");
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

test("★★★ todo texto de 10 palabras o más pasa 65 con inflesz.js (guarda: 102 medidos)", () => {
  let medidos = 0;
  const bajos = [];
  for (const t of textosDelEstudiante()) {
    const r = inflesz(t);
    assert.deepEqual(r.desconocidas, [], `letra que la herramienta no sabe contar: ${t}`);
    if (!r.aplica) continue;
    medidos++;
    if (r.valor < UMBRAL) bajos.push(`${r.valor} · ${t}`);
  }
  assert.equal(medidos, 102, "no midió los textos que dice medir");
  assert.deepEqual(bajos, []);
  /* Los dos que Kamogawa sustituyó (daban 59,7) ya pasan. */
  for (const id of ["a8", "a10"]) assert.ok(inflesz(asiento(id).hecho).valor >= UMBRAL, id);
});
