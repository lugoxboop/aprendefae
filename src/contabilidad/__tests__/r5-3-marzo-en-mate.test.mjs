import { test, afterEach } from "node:test";
import assert from "node:assert/strict";
import { readFileSync, readdirSync } from "node:fs";
import { JSDOM, VirtualConsole } from "jsdom";

/*
 * ═══════════════════════════════════════════════════════════════════════════
 * r5-3 «Marzo en Comercializadora Mate» (Célula E) — lo que pide el encargo
 * y el paquete e5-r5-3-v3:
 *
 *   · cada texto, letra por letra, en el paquete (y la sustitución de la
 *     decisión 1 aplicada sobre el texto de Miyata)
 *   · los ocho asientos: las cifras se calculan en repasoCap5Mate.js y aquí
 *     se cotejan con las que el paquete escribe en «Correcto:»
 *   · cada retroalimentación alcanzable con la hoja de doce cuentas y la regla
 *     de prioridad: lado cruzado, cuenta equivocada o que sobra, falta un
 *     renglón, valor, genérica; el orden del cálculo; los textos repetidos una
 *     sola vez; «Y hay más renglones por revisar.»
 *   · el asiento 4 completo con una u otra cuenta, nunca mezclado
 *   · 1.870.312 y 1.870.313 (y la Caja de 60.117.188 y 60.117.187)
 *   · FP de 2 de 8 y 6 de 8 con calcularFP
 *   · INFLESZ con el número exacto de textos medidos
 *   · las dos puertas y la migración 0252
 *   · la partida se juega: la hoja en dos pasos, el tope de 3 por lado, las
 *     sumas, «Datos de marzo», ERA ESTE y el final con forma, color y palabra
 *   · lo de 320 px lo mide en Chromium scripts/e5/medir-r5-3.mjs
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
})) {
  Object.defineProperty(globalThis, k, { value: v, configurable: true, writable: true });
}
globalThis.IS_REACT_ACT_ENVIRONMENT = true;

const React = await import("react");
const { createRoot } = await import("react-dom/client");
const act = React.act;
const h = React.createElement;

const N = await import("../../data/repasoCap5Mate.js");
const T = await import("../../data/repasoCap5MateTextos.js");
const J = await import("../../data/repasoCap5MateJuego.js");
const { Mate, DIGITOS_DEL_CAMPO } = await import("../../components/repasoCap5/Mate.jsx");
const { JUEGOS_REPASO_CAP5 } = await import("../../components/RepasoCapitulo5View.jsx");
const { SUBJECTS, HACER, actividadesDeTipo } = await import("../../data/subjects.js");
const { inflesz, UMBRAL } = await import("../../herramientas/inflesz.js");
const { etiquetaDeItem, hayReglaPara } = await import("../../docente/etiquetasItem.js");
const { calcularFP } = await import("../../fp/motor.js");
const { pesos } = await import("../../data/contabilidad.js");

const RAIZ = new URL("../../../", import.meta.url);
const leer = (f) => readFileSync(new URL(f, RAIZ), "utf8");
const PAQUETE = leer("orquestador/conocimiento/paquetes/e5-r5-3-v3.md");
const PLANO = PAQUETE.replace(/\s+/g, " ");
const A = T.ASIENTOS_MATE;
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
const esperar = () => act(async () => { await new Promise((r) => setTimeout(r, 5)); });
const anadir = async (caja, lado, cuenta, valor) => {
  await tocar(caja.querySelector(`[data-anadir="${lado}"]`));
  await tocar(document.querySelector(`[data-hoja-renglon] [data-cuenta="${cuenta}"]`));
  await escribir(document.querySelector("[data-hoja-renglon] input"), String(valor));
  await tocar(document.querySelector("[data-hoja-renglon] [data-listo]"));
};

/* ═══════════ LO QUE LEE EL ESTUDIANTE ═══════════ */

function textosDelEstudiante() {
  const t = [T.R5_3.objetivo, T.ENTRADA_MATE.apertura, T.ENTRADA_MATE.instruccion, T.DATOS_DECLARADOS.linea, ...T.DATOS_DECLARADOS.datos, T.COMUNES_MATE.cuentaNoPrevista, T.COMUNES_MATE.hayMas];
  for (const g of T.DATOS_DEL_LIBRO) { if (g.nota) t.push(g.nota); if (g.frases) t.push(...g.frases); }
  for (const a of A) t.push(a.hecho, ...Object.values(a.cruzado), ...Object.values(a.falta), ...Object.values(a.cuentaMal), ...a.valorMal.map((x) => x.texto), a.generica, ...a.acierto);
  return [...new Set(t)];
}

test("★★★ cada texto del estudiante está entero en el paquete (guarda: 125 textos distintos)", () => {
  const textos = textosDelEstudiante();
  assert.equal(textos.length, 125);
  const escapar = (t) => t.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
  /* Entero: tras «: », un salto de línea o «», hasta el fin del renglón o la comilla. */
  const entero = (t) => new RegExp(`(?:: |\\n)${escapar(t)}(?:\\n|$)`).test(PAQUETE) || PLANO.includes(`«${t}»`) || PLANO.includes(`«${t}`);
  /*
   * Excepciones, cada una con su regla:
   *  · el acierto del asiento 1 es la sustitución de la decisión 1;
   *  · los datos declarados de los fletes llevan «$» en pantalla (delta v2,
   *    nota de escritura) y el paquete los escribe sin él.
   */
  const ACIERTO_A1 = "Bien. Restas el descuento, cobras el IVA sobre lo que queda y retienes sobre el valor sin IVA.";
  assert.ok(entero(ACIERTO_A1), "el texto de Miyata que la decisión 1 corrige");
  assert.ok(PLANO.includes("donde dice «cobras el IVA» va «pagas el IVA sobre lo que queda»"));
  const corregido = ACIERTO_A1.replace("cobras el IVA sobre lo que queda", "pagas el IVA sobre lo que queda");
  assert.equal(asiento("a1").acierto[0], corregido);
  const fuera = textos.filter((t) => t !== corregido && !entero(t) && !entero(t.replace(/\$/g, "")));
  assert.deepEqual(fuera, [], `no están en el paquete: ${fuera.join(" | ")}`);
  /* La de Anticipo fiscal del asiento 7 es la de la decisión 6; la del 2 queda la de Miyata. */
  assert.ok(PLANO.includes(`«${asiento("a7").cuentaMal[T.ANTICIPO]}»`));
  assert.ok(new RegExp(`\\nAnticipo fiscal: ${escapar(asiento("a2").cuentaMal[T.ANTICIPO])}\\n`).test(PAQUETE));
  /* La hoja de cuentas, en el orden literal del delta v2 §4 (no ordenada por código). */
  const seccion = PAQUETE.slice(PAQUETE.indexOf("4. Hoja de cuentas: orden literal"));
  const lista = seccion.split("\n").slice(4, 16);
  assert.deepEqual(T.HOJA_MATE, lista);
  assert.notDeepEqual(T.HOJA_MATE, [...T.HOJA_MATE].sort(), "la hoja quedó ordenada por código");
  /* Los rótulos del diseño, entre comillas en el paquete. */
  const R = T.ROTULOS_MATE;
  for (const r of [R.tuAsiento, R.anadir.debe, R.otro.debe, R.anadir.haber, R.sumaDebe, R.sumaHaber, R.cuadran, R.cancelar, R.cuentaDel.debe, R.cuentaDel.haber, R.renglonDel.debe, R.renglonDel.haber, R.listo, R.cambiarCuenta, R.quitar, R.valor, R.enEl.debe, R.enEl.haber, R.revisar, R.eraEste, R.marzoEnOcho, R.acierto, R.error, R.datosDeMarzoMarca, R.cerrar, R.fleteEnElSiguiente, R.deOtraOperacion, T.ENTRADA_MATE.marca, T.ENTRADA_MATE.empezar, T.DATOS_DECLARADOS.marca]) {
    assert.ok(PAQUETE.includes(`«${r}»`), r);
  }
  assert.ok(PAQUETE.includes(`«${R.diferencia("12.500")}»`) && PAQUETE.includes(`«${R.progreso(3, 8)}»`));
  assert.ok(PAQUETE.includes(`Línea 2: «${R.tasasALaVista}»`));
});

/* ═══════════ LOS OCHO ASIENTOS, CALCULADOS Y COTEJADOS CON EL PAQUETE ═══════════ */

/* «Correcto: Debe Compras $23.750.000 · Debe IVA por pagar $3.800.000 · …» → renglones. */
function correctosDelPaquete() {
  const bloques = PAQUETE.split(/\nAsiento \d\n/).slice(1);
  return bloques.map((b) => b.split("\n")
    .filter((l) => /^(Correcto: )?(Debe|Haber) /.test(l))
    .map((l) => l.replace(/^Correcto: /, "").split(" · ").map((p) => {
      const m = p.match(/^(Debe|Haber) (.+) \$([\d.]+)$/);
      return { lado: m[1] === "Debe" ? "debe" : "haber", cuenta: m[2], valor: Number(m[3].replace(/\./g, "")) };
    })));
}

test("★★★ los ocho asientos: se calculan en repasoCap5Mate.js y dan lo que escribe el paquete (guarda: 8 asientos, 9 variantes)", () => {
  const delPaquete = correctosDelPaquete();
  assert.equal(delPaquete.length, 8);
  let variantes = 0;
  A.forEach((a, k) => {
    assert.deepEqual(a.correctos, delPaquete[k], a.id);
    variantes += a.correctos.length;
    /* Cada variante cuadra. */
    for (const c of a.correctos) {
      const s = J.sumasDe(c);
      assert.equal(s.debe, s.haber, `${a.id}: no cuadra`);
    }
  });
  assert.equal(variantes, 9);
  /* Y las cuentas de verdad: unidades × precio, descuento, IVA 16 %, retención 3,5 % y 1 %. */
  const op = N.OPERACIONES;
  const compras1 = op.a1.unidades * op.a1.precio * 95 / 100;
  assert.deepEqual([N.CIFRAS_MATE.a1.compras, N.CIFRAS_MATE.a1.iva, N.CIFRAS_MATE.a1.retencion], [compras1, compras1 * 16 / 100, compras1 * 35 / 1000]);
  assert.equal(N.CIFRAS_MATE.a7.ingresos, op.a7.unidades * op.a7.precio * 95 / 100);
  assert.equal(N.CIFRAS_MATE.a3.compras, op.a3.unidades * op.a3.precio * 96 / 100);
  assert.equal(N.CIFRAS_MATE.a4.retencion, op.a4.flete / 100);
  assert.equal(N.CIFRAS_MATE.a8.retencion, op.a8.flete / 100);
  /* La devolución usa el precio de la venta del 10. */
  assert.equal(op.a5.precio, op.a2.precio);
});

test("★★★ cada valor equivocado previsto se calcula y es el que escribe el paquete (guarda: 34 valores)", () => {
  let n = 0;
  for (const a of A) {
    for (const v of a.valorMal) {
      n++;
      assert.ok(PAQUETE.includes(pesos(v.valor)), `${a.id}: ${pesos(v.valor)} no está en el paquete`);
      assert.ok(!a.correctos.some((c) => c.some((x) => x.cuenta === v.cuenta && x.valor === v.valor)), `${a.id}: el valor previsto es el correcto`);
    }
  }
  assert.equal(n, 34);
});

test("★★★ 1.870.312 y 1.870.313: la retención que no existe da medio peso, y el asiento 7 acepta los dos redondeos", () => {
  const sinRedondear = (N.CIFRAS_MATE.a7.ingresos * 35) / 1000;
  assert.equal(sinRedondear, 1870312.5);
  assert.deepEqual([N.EQUIVOCADAS.a7.anticipoAbajo, N.EQUIVOCADAS.a7.anticipoArriba], [1870312, 1870313]);
  assert.deepEqual([N.EQUIVOCADAS.a7.cajaConRetencionArriba, N.EQUIVOCADAS.a7.cajaConRetencionAbajo], [60117188, 60117187]);
  const a7 = asiento("a7");
  const base = a7.correctos[0].map((c, k) => ({ id: `b${k}`, ...c }));
  for (const valor of [1870312, 1870313, 5]) {
    const r = J.evaluarMate(a7, [...base, { id: "x", lado: "debe", cuenta: T.ANTICIPO, valor }]);
    assert.deepEqual(r.textos, ["Estos clientes no retienen: es un dato del ejercicio. Por eso recibes el total."], String(valor));
  }
  for (const valor of [60117188, 60117187]) {
    const r = J.evaluarMate(a7, base.map((x) => (x.cuenta === T.CAJA ? { ...x, valor } : x)));
    assert.deepEqual(r.textos, ["Sobra la retención. Estos clientes no retienen. A Caja entra todo: $61.987.500."], String(valor));
  }
});

/* ═══════════ LA REGLA DE PRIORIDAD ═══════════ */

let n = 0;
const R = (lado, cuenta, valor) => ({ id: `t${n++}`, lado, cuenta, valor });
const bien = (a, v = 0) => a.correctos[v].map((c) => R(c.lado, c.cuenta, c.valor));
const otroLado = (l) => (l === "debe" ? "haber" : "debe");

test("★★★ (1) lado cruzado: cada cuenta del asiento en el otro lado da su texto, en los ocho", () => {
  let casos = 0;
  for (const a of A) {
    for (const c of a.correctos[0]) {
      casos++;
      const est = bien(a).map((x) => (x.cuenta === c.cuenta ? { ...x, lado: otroLado(x.lado) } : x));
      const r = J.evaluarMate(a, est);
      assert.equal(r.ok, false);
      assert.deepEqual(r.textos, [a.cruzado[c.cuenta]], `${a.id}: ${c.cuenta}`);
    }
  }
  assert.equal(casos, 27);
});

test("★★★ (2) cuenta equivocada o que sobra: su texto, o «Esta operación no usa esa cuenta.» si no está prevista", () => {
  let casos = 0;
  for (const a of A) {
    const admitidas = new Set(a.correctos.flat().map((c) => c.cuenta));
    for (const cuenta of T.HOJA_MATE.filter((c) => !admitidas.has(c))) {
      casos++;
      const r = J.evaluarMate(a, [...bien(a), R("debe", cuenta, 1000)]);
      assert.deepEqual(r.textos, [a.cuentaMal[cuenta] ?? T.COMUNES_MATE.cuentaNoPrevista], `${a.id}: ${cuenta}`);
    }
  }
  assert.equal(casos, 68);
  /* Una cuenta del asiento repetida sobra: la genérica del asiento. */
  const a1 = asiento("a1");
  const r = J.evaluarMate(a1, [...bien(a1), R("debe", T.COMPRAS, 23750000)]);
  assert.equal(r.ok, false);
  assert.deepEqual(r.textos, [a1.generica]);
});

test("★★★ (3) falta un renglón: el del IVA tiene su texto, y va antes que los errores de valor", () => {
  let casos = 0;
  for (const a of A.filter((x) => x.falta[T.IVA])) {
    casos++;
    const sinIva = bien(a).filter((x) => x.cuenta !== T.IVA);
    assert.deepEqual(J.evaluarMate(a, sinIva).textos, [a.falta[T.IVA]], a.id);
  }
  assert.equal(casos, 6);
  /* Sin IVA y con Compras sin descuento: primero la ausencia, luego el valor. */
  const a1 = asiento("a1");
  const est = bien(a1).filter((x) => x.cuenta !== T.IVA).map((x) => (x.cuenta === T.COMPRAS ? { ...x, valor: 25000000 } : x));
  assert.deepEqual(J.evaluarMate(a1, est).textos, [a1.falta[T.IVA], "Te faltó el descuento. El comercial se resta en la misma factura."]);
  /* Falta un renglón sin texto propio: la genérica del asiento. */
  assert.deepEqual(J.evaluarMate(a1, bien(a1).filter((x) => x.cuenta !== T.RETENCION)).textos, [a1.generica]);
});

test("★★★ (4) valor equivocado previsto: su texto; (5) no previsto: la genérica (guarda: 34 y 27)", () => {
  let previstos = 0;
  let genericas = 0;
  for (const a of A) {
    for (const v of a.valorMal) {
      const variante = a.correctos.findIndex((c) => c.some((x) => x.cuenta === v.cuenta));
      const est = bien(a, variante).map((x) => (x.cuenta === v.cuenta ? { ...x, valor: v.valor } : x));
      previstos++;
      assert.deepEqual(J.evaluarMate(a, est).textos, [v.texto], `${a.id}: ${v.cuenta} ${v.valor}`);
    }
    for (const c of a.correctos[0]) {
      genericas++;
      const est = bien(a).map((x) => (x.cuenta === c.cuenta ? { ...x, valor: 7 } : x));
      assert.deepEqual(J.evaluarMate(a, est).textos, [a.generica], `${a.id}: ${c.cuenta}`);
    }
  }
  assert.equal(previstos, 34);
  assert.equal(genericas, 27);
});

test("★★★ con varios mal: los dos primeros en el orden del cálculo, no en el del estudiante, y «Y hay más…»", () => {
  const a1 = asiento("a1");
  /* El estudiante agrega primero la Caja mal y luego la retención mal. */
  const est = [R("haber", T.CAJA, 27550000), R("haber", T.RETENCION, 964250), R("debe", T.IVA, 4000000), R("debe", T.COMPRAS, 25000000)];
  const r = J.evaluarMate(a1, est);
  assert.deepEqual(r.textos, [
    "Te faltó el descuento. El comercial se resta en la misma factura.",
    "Calculaste el IVA sin el descuento. El IVA va sobre el precio que queda: $23.750.000.",
    "Y hay más renglones por revisar.",
  ]);
  /*
   * Lo que de verdad depende del orden del cálculo: Caja en el lado cruzado
   * (agregada primero) e Inventario de más (agregado al final). Inventario va
   * con Compras, antes que Caja: sale primero aunque el estudiante lo puso último.
   */
  const desordenado = [R("debe", T.CAJA, 26718750), R("debe", T.COMPRAS, 23750000), R("debe", T.IVA, 3800000), R("haber", T.RETENCION, 831250), R("debe", T.INVENTARIO, 5)];
  assert.deepEqual(J.evaluarMate(a1, desordenado).textos, [
    "En periódico, lo que compras va a Compras. El inventario se ajusta al cierre.",
    "Va al revés. La compra entra por el debe y el dinero sale por el haber.",
  ]);
  /* Con solo dos, no se dice que hay más. */
  const dos = J.evaluarMate(a1, [R("debe", T.COMPRAS, 23750000), R("debe", T.IVA, 3800000), R("haber", T.RETENCION, 964250), R("haber", T.CAJA, 27550000)]);
  assert.deepEqual(dos.textos, ["La retención se calcula sin el IVA. La base es $23.750.000.", "La empresa retiene cuando compra. Al proveedor le pagas $831.250 menos."]);
});

test("★★★ dos textos idénticos se muestran una sola vez: el asiento al revés y los cuatro valores del descuento del 6", () => {
  const a1 = asiento("a1");
  const alReves = bien(a1).map((x) => (x.cuenta === T.COMPRAS || x.cuenta === T.CAJA ? { ...x, lado: otroLado(x.lado) } : x));
  assert.deepEqual(J.evaluarMate(a1, alReves).textos, ["Va al revés. La compra entra por el debe y el dinero sale por el haber."]);
  const a6 = asiento("a6");
  const E6 = N.EQUIVOCADAS.a6;
  const conDescuento = [R("debe", T.COMPRAS, E6.comprasConDescuento), R("debe", T.IVA, E6.ivaConDescuento), R("haber", T.RETENCION, E6.retencionConDescuento), R("haber", T.PROVEEDORES, E6.proveedorConDescuento)];
  assert.deepEqual(J.evaluarMate(a6, conDescuento).textos, ["Tocaste el descuento. El 5 % solo se gana si pagas en 15 días. En marzo no se paga, así que no se toca."]);
});

test("★★★ cada texto de cada asiento se alcanza con la hoja de doce cuentas (guarda: 8 asientos, 106 textos)", () => {
  let total = 0;
  for (const a of A) {
    const alcanzados = new Set();
    const anotar = (est) => J.evaluarMate(a, est).textos.forEach((t) => alcanzados.add(t));
    a.correctos.forEach((_, v) => anotar(bien(a, v)));
    for (const c of a.correctos.flat()) {
      anotar(bien(a).map((x) => (x.cuenta === c.cuenta ? { ...x, lado: otroLado(x.lado) } : x)));
      anotar(bien(a).filter((x) => x.cuenta !== c.cuenta));
      anotar(bien(a).map((x) => (x.cuenta === c.cuenta ? { ...x, valor: 7 } : x)));
    }
    for (const cuenta of T.HOJA_MATE) anotar([...bien(a), R("haber", cuenta, 5)]);
    for (const v of a.valorMal) {
      const variante = a.correctos.findIndex((c) => c.some((x) => x.cuenta === v.cuenta));
      anotar(bien(a, variante).map((x) => (x.cuenta === v.cuenta ? { ...x, valor: v.valor } : x)));
    }
    const todos = [...new Set([...Object.values(a.cruzado), ...Object.values(a.falta), ...Object.values(a.cuentaMal), ...a.valorMal.map((x) => x.texto), a.generica, ...a.acierto])];
    total += todos.length;
    assert.deepEqual(todos.filter((t) => !alcanzados.has(t)), [], `${a.id}: textos que ningún camino alcanza`);
  }
  assert.equal(total, 106);
});

test("★★★ el asiento 4 vale completo con «Compras (fletes)» o completo con «Compras», nunca mezclado", () => {
  const a4 = asiento("a4");
  const conFletes = J.evaluarMate(a4, bien(a4, 0));
  const conCompras = J.evaluarMate(a4, bien(a4, 1));
  assert.equal(conFletes.ok, true);
  assert.equal(conCompras.ok, true);
  assert.deepEqual(conFletes.textos, [a4.acierto[0]]);
  assert.deepEqual(conCompras.textos, [a4.acierto[1]]);
  /* Mezclado: los dos en el debe. No es acierto, y no se le dice que la cuenta no se usa. */
  const mezclado = [R("debe", T.COMPRAS_FLETES, 240000), R("debe", T.COMPRAS, 240000), R("haber", T.RETENCION, 2400), R("haber", T.CAJA, 237600)];
  const r = J.evaluarMate(a4, mezclado);
  assert.equal(r.ok, false);
  assert.deepEqual(r.textos, [a4.generica]);
  /* Partido entre los dos: tampoco. */
  const partido = [R("debe", T.COMPRAS_FLETES, 120000), R("debe", T.COMPRAS, 120000), R("haber", T.RETENCION, 2400), R("haber", T.CAJA, 237600)];
  assert.equal(J.evaluarMate(a4, partido).ok, false);
  /* En el 3, «Compras (fletes)» no es una variante: tiene su texto propio. */
  assert.deepEqual(J.evaluarMate(asiento("a3"), [...bien(asiento("a3")), R("debe", T.COMPRAS_FLETES, 240000)]).textos, ["El flete tiene su propio asiento: el siguiente."]);
});

test("★★★ se califica por renglón: el orden dentro de cada lado no cuenta; el sobrante y el repetido son error", () => {
  const a2 = asiento("a2");
  const invertido = [...bien(a2)].reverse();
  const r = J.evaluarMate(a2, invertido);
  assert.equal(r.ok, true);
  assert.ok(Object.values(r.estados).every((x) => x === "ok"));
  const conSobra = [...bien(a2), R("debe", T.CAJA, 1)];
  const r2 = J.evaluarMate(a2, conSobra);
  assert.equal(r2.ok, false);
  assert.deepEqual(Object.values(r2.estados), ["ok", "ok", "ok", "mal"]);
  assert.equal(J.puedeRevisarMate([R("debe", T.CAJA, 1)]), false);
  assert.equal(J.puedeRevisarMate([R("debe", T.CAJA, 1), R("haber", T.IVA, 1)]), true);
  assert.deepEqual(J.sumasDe([R("debe", T.CAJA, 100), R("haber", T.IVA, 40)]), { debe: 100, haber: 40, cuadran: false, diferencia: 60 });
});

test("★★★ el campo admite todas las respuestas: 104.400.000 tiene 9 dígitos (el §4 decía 8; reportado)", async () => {
  const digitos = Math.max(...A.flatMap((a) => a.correctos.flat().map((c) => String(c.valor).length)));
  assert.equal(digitos, 9);
  assert.equal(DIGITOS_DEL_CAMPO, digitos);
  const { caja } = await montar(h(Mate, {}));
  await tocar(caja.querySelector("[data-empezar]"));
  await tocar(caja.querySelector('[data-anadir="debe"]'));
  await tocar(document.querySelector(`[data-hoja-renglon] [data-cuenta="${T.CLIENTES}"]`));
  await escribir(document.querySelector("[data-hoja-renglon] input"), "1044000009");
  assert.equal(document.querySelector("[data-hoja-renglon] input").value, "104.400.000");
});

/* ═══════════ LOS FP ═══════════ */

test("★★★ FP de 2 de 8 y 6 de 8 con calcularFP: 45 (el piso del 50 %) y 68 (67,5, mitad exacta)", () => {
  const fp = (bien) => calcularFP({ dificultad: T.R5_3.dificultad, modalidad: T.R5_3.modalidad, aciertos: J.puntuarR5_3(bien) / 100, duracionMs: 300_000 }).fp;
  assert.equal((90 * J.puntuarR5_3(2)) / 100, 22.5, "2 de 8 sin piso");
  assert.equal(fp(2), 45);
  assert.equal(servidor(2), 45);
  assert.equal((90 * J.puntuarR5_3(6)) / 100, 67.5);
  assert.equal(fp(6), 68);
  assert.equal(servidor(6), 68);
  const tabla = Array.from({ length: 9 }, (_, k) => fp(k));
  assert.deepEqual(tabla, [45, 45, 45, 45, 45, 56, 68, 79, 90]);
  /* Con el servidor coinciden todos menos 5 de 8 (prueba aparte, en todo). */
  for (const k of [0, 1, 2, 3, 4, 6, 7, 8]) assert.equal(tabla[k], servidor(k), `${k} de 8`);
});

/*
 * El servidor (0017) en enteros: el cliente le manda el % redondeado y él hace
 * round(90 × max(50, pct) / 100) sobre numeric, con la mitad hacia arriba.
 */
function servidor(bien) {
  return Math.round((90 * Math.max(50, Math.round(J.puntuarR5_3(bien)))) / 100);
}

test("5 de 8: calcularFP da lo mismo que el servidor", { todo: "calcularFP da 56 y el servidor 57 (el cliente manda 63 %; 90 × 0,63 = 56,7 → 57). Código compartido: reportado a Kamogawa" }, () => {
  const cliente = calcularFP({ dificultad: "experto", modalidad: "evaluativa", aciertos: J.puntuarR5_3(5) / 100, duracionMs: 300_000 }).fp;
  assert.equal(cliente, servidor(5));
});

/* ═══════════ INFLESZ ═══════════ */

test("★★★ INFLESZ: los 107 textos de 10 palabras o más pasan 65; los rótulos no se miden", () => {
  let medidos = 0;
  const bajos = [];
  for (const t of textosDelEstudiante()) {
    const r = inflesz(t);
    assert.deepEqual(r.desconocidas, [], t);
    if (!r.aplica) continue;
    medidos++;
    if (r.valor < UMBRAL) bajos.push(`${r.valor} · ${t}`);
  }
  assert.equal(medidos, 107);
  assert.deepEqual(bajos, []);
  const rotulos = Object.values(T.ROTULOS_MATE).flatMap((x) => (typeof x === "string" ? [x] : typeof x === "object" ? Object.values(x) : [x(3, 8)]));
  for (const r of rotulos) assert.equal(inflesz(r).aplica, false, r);
});

/* ═══════════ LAS DOS PUERTAS ═══════════ */

test("★★★ catálogo, registro de la vista, etiqueta y migración 0252 dicen lo mismo", () => {
  const tema = SUBJECTS.contabilidad.topics.find((t) => t.id === "repaso-capitulo-5");
  assert.deepEqual(tema.actividades.map((a) => a.id), ["r5-1", "r5-2", "r5-3"]);
  const a = actividadesDeTipo(tema, HACER).find((x) => x.id === "r5-3");
  assert.equal(a.nombre, T.R5_3.nombre);
  assert.deepEqual(a.clasificacion, { tipo: HACER, modalidad: "evaluativa", dificultad: "experto", fpBase: 90 });
  const j = JUEGOS_REPASO_CAP5.find((x) => x.id === "r5-3");
  assert.equal(j.Mecanica, Mate);
  assert.equal(j.titulo, T.R5_3.nombre);
  const migraciones = readdirSync(new URL("supabase/migrations/", RAIZ)).filter((f) => leer(`supabase/migrations/${f}`).includes("'r5-3'"));
  assert.deepEqual(migraciones, ["0252_r5_3_marzo_en_mate.sql"]);
  const sql = leer("supabase/migrations/0252_r5_3_marzo_en_mate.sql");
  assert.match(sql, /\('r5-3', 'contabilidad', 'repaso-capitulo-5', 'evaluativa', 'experto', 90, 1\)\s*on conflict \(activity_id\) do nothing;/);
  assert.doesNotMatch(sql.replace(/^--.*$/gm, ""), /\b(update|delete|alter|drop|truncate)\b/i);
  assert.match(sql, /delete from public\.actividad_catalogo where activity_id = 'r5-3';/, "falta el deshacer escrito");
  assert.match(sql, /select activity_id[\s\S]*where activity_id = 'r5-3';\s*$/);
  assert.ok(hayReglaPara("r5-3"));
  const etiquetas = A.map((x) => etiquetaDeItem("r5-3", x.id));
  assert.equal(new Set(etiquetas).size, 8);
  assert.deepEqual(etiquetas, ["1 MAR · Compra de contado", "10 MAR · Venta a crédito", "15 MAR · Compra de contado", "15 MAR · Flete de la compra", "20 MAR · Devolución de venta", "25 MAR · Compra a crédito", "31 MAR · Venta de contado", "31 MAR · Flete de la venta"]);
});

/* ═══════════ LA PARTIDA ═══════════ */


test("★★★ el armador: hoja en dos pasos, «EN EL DEBE», editar y quitar, tope de 3 por lado, sumas y cuadre", async () => {
  const { caja } = await montar(h(Mate, {}));
  assert.equal(Boolean(caja.querySelector("[data-tarjeta]")), false);
  await tocar(caja.querySelector("[data-empezar]"));
  assert.equal(caja.querySelector("[data-progreso]").textContent, "ASIENTO 1 DE 8");
  /* Empieza vacío: sin huecos fijos. */
  assert.equal(caja.querySelectorAll("[data-renglon]").length, 0);
  assert.equal(caja.querySelector('[data-anadir="debe"]').textContent, "+ Añadir renglón al debe");
  assert.ok(caja.querySelector("[data-revisar]").disabled);
  /* Paso 1: las doce cuentas, en el orden literal. */
  await tocar(caja.querySelector('[data-anadir="debe"]'));
  const hoja = document.querySelector("[data-hoja-renglon]");
  assert.equal(hoja.dataset.paso, "1");
  assert.deepEqual([...hoja.querySelectorAll("[data-cuenta]")].map((b) => b.dataset.cuenta), T.HOJA_MATE);
  /* Paso 2: «Listo» inactivo hasta un valor mayor que 0. */
  await tocar(hoja.querySelector(`[data-cuenta="${T.COMPRAS}"]`));
  assert.equal(document.querySelector("[data-hoja-renglon]").dataset.paso, "2");
  assert.equal(document.querySelector("[data-cuenta-elegida]").textContent, T.COMPRAS);
  assert.ok(document.querySelector("[data-listo]").disabled);
  assert.equal(Boolean(document.querySelector("[data-quitar]")), false, "«Quitar renglón» solo al editar");
  await escribir(document.querySelector("[data-hoja-renglon] input"), "23750000");
  assert.equal(document.querySelector("[data-hoja-renglon] input").value, "23.750.000");
  await tocar(document.querySelector("[data-listo]"));
  assert.equal(Boolean(document.querySelector("[data-hoja-renglon]")), false);
  assert.equal(caja.querySelector('[data-anadir="debe"]').textContent, "+ Otro renglón al debe");
  /* En el haber, Compras dice dónde está. */
  await tocar(caja.querySelector('[data-anadir="haber"]'));
  assert.equal(document.querySelector(`[data-cuenta="${T.COMPRAS}"] [data-en-el]`).textContent, "EN EL DEBE");
  await tocar(document.querySelector("[data-cancelar]"));
  /* Editar: se abre en el paso 2 con su cuenta y su valor; «Cambiar cuenta» vuelve al 1. */
  await tocar(caja.querySelector('[data-renglon="debe"]'));
  assert.equal(document.querySelector("[data-hoja-renglon]").dataset.paso, "2");
  assert.equal(document.querySelector("[data-hoja-renglon] input").value, "23.750.000");
  await tocar(document.querySelector("[data-cambiar-cuenta]"));
  assert.equal(document.querySelector("[data-hoja-renglon]").dataset.paso, "1");
  await tocar(document.querySelector(`[data-cuenta="${T.IVA}"]`));
  await escribir(document.querySelector("[data-hoja-renglon] input"), "3800000");
  await tocar(document.querySelector("[data-listo]"));
  assert.equal(caja.querySelector('[data-renglon="debe"]').textContent, "DEBE: IVA por pagar3.800.000");
  /* Quitar. */
  await tocar(caja.querySelector('[data-renglon="debe"]'));
  await tocar(document.querySelector("[data-quitar]"));
  assert.equal(caja.querySelectorAll("[data-renglon]").length, 0);
  /* Tope de 3 por lado: la fila para añadir desaparece. */
  for (const v of [1, 2, 3]) await anadir(caja, "debe", T.CAJA, v);
  assert.equal(Boolean(caja.querySelector('[data-anadir="debe"]')), false);
  assert.equal(caja.querySelector('[data-suma="debe"]').textContent, "SUMA DEBE6");
  assert.equal(caja.querySelector("[data-cuadre]").textContent, "Diferencia: 6");
  await anadir(caja, "haber", T.IVA, 6);
  assert.equal(caja.querySelector("[data-cuadre]").textContent, "Las sumas cuadran");
  assert.equal(caja.querySelector("[data-revisar]").disabled, false);
  /* «Datos de marzo»: hoja de solo lectura con las dos tarjetas; no toca el armador. */
  await tocar(caja.querySelector("[data-boton-datos]"));
  const datos = document.querySelector("[data-hoja-datos]");
  assert.ok(datos.querySelector("[data-datos-libro]") && datos.querySelector("[data-datos-declarados]"));
  assert.equal(datos.querySelectorAll("[data-dato-declarado]").length, 5);
  assert.equal(datos.querySelectorAll("input").length, 0);
  await tocar(datos.querySelector("[data-cerrar]"));
  assert.equal(caja.querySelectorAll("[data-renglon]").length, 4);
});

test("★★★ se juega entera: hechos, ERA ESTE, la devolución, y el final con forma, color y palabra", async () => {
  const fin = [];
  const { caja } = await montar(h(Mate, { onCompletar: (...x) => fin.push(x) }));
  /* La entrada: la marca de dato declarado vive aquí y en la hoja, nunca en un renglón del hecho. */
  assert.equal(caja.querySelector("[data-apertura]").textContent, T.ENTRADA_MATE.apertura);
  assert.equal(caja.querySelectorAll("[data-datos-declarados] [data-dato-declarado]").length, 5);
  assert.ok(caja.querySelector("[data-datos-declarados]").style.border.includes("dashed"));
  assert.ok([...caja.querySelectorAll("[data-nodo]")].every((n) => n.dataset.estado === "pendiente"));
  await tocar(caja.querySelector("[data-empezar]"));

  /* Acierta todos menos el 6 (proveedor sin restar la retención) y el 4 (mezclado). */
  for (const [k, a] of A.entries()) {
    assert.equal(caja.querySelector("[data-progreso]").textContent, `ASIENTO ${k + 1} DE 8`);
    assert.deepEqual([...caja.querySelectorAll("[data-nodo]")].map((x) => x.dataset.estado), A.map((_, j) => (j < k ? "hecho" : j === k ? "actual" : "pendiente")));
    assert.equal(caja.querySelector("[data-marca-fecha]").textContent, `${a.dia} MAR`);
    assert.equal(caja.querySelector("[data-frase]").textContent, a.hecho);
    assert.ok(!caja.querySelector("[data-hecho]").textContent.includes("declarado"), `${a.id}: marca de dato declarado en el hecho`);
    if (a.id === "a5") {
      assert.ok(caja.querySelector("[data-otra-operacion]").textContent.includes("DE LA OPERACIÓN DEL 10 DE MARZO"));
      assert.equal(caja.querySelectorAll("[data-renglon-hecho]").length, 3);
    }
    if (a.fleteEnElSiguiente) assert.equal(caja.querySelector('[data-renglon-hecho="flete"]').textContent, "Fleteen el asiento siguiente");
    let renglones = a.correctos[0];
    if (a.id === "a6") renglones = renglones.map((c) => (c.cuenta === T.PROVEEDORES ? { ...c, valor: 14848000 } : c));
    if (a.id === "a4") renglones = [{ lado: "debe", cuenta: T.COMPRAS_FLETES, valor: 120000 }, { lado: "debe", cuenta: T.COMPRAS, valor: 120000 }, ...renglones.slice(1)];
    for (const c of renglones) await anadir(caja, c.lado, c.cuenta, c.valor);
    await tocar(caja.querySelector("[data-revisar]"));
    const panel = caja.querySelector("[data-devolucion]");
    if (a.id === "a6") {
      assert.equal(panel.dataset.devolucion, "error");
      assert.ok(panel.textContent.endsWith("Te faltó restar la retención. Al proveedor le debes $448.000 menos."));
      const era = caja.querySelector('[data-armador="era-este"]');
      assert.ok(era.textContent.startsWith("ERA ESTE"));
      assert.ok(era.textContent.includes("14.400.000"));
      assert.ok([...era.querySelectorAll("[data-renglon]")].every((x) => x.dataset.estado === "revelada"));
      assert.deepEqual([...caja.querySelectorAll('[data-armador="tu-asiento"] [data-renglon]')].map((x) => x.dataset.estado), ["ok", "ok", "ok", "mal"]);
    } else if (a.id === "a4") {
      assert.equal(panel.dataset.devolucion, "error");
    } else {
      assert.equal(panel.dataset.devolucion, "acierto", a.id);
      assert.equal(Boolean(caja.querySelector('[data-armador="era-este"]')), false);
    }
    /* Todo queda bloqueado. */
    assert.equal(Boolean(caja.querySelector("[data-anadir]")), false);
    await tocar(caja.querySelector("[data-siguiente]"));
    await esperar();
  }

  assert.ok(caja.querySelector("[data-cierre]"));
  assert.equal(caja.querySelector("[data-n-de-m]").textContent, "6 de 8");
  const filas = [...caja.querySelectorAll("[data-fila-asiento]")].map((f) => {
    const p = f.querySelector("[data-punto]");
    const forma = p.style.background === "transparent" && /solid/.test(p.style.border) ? "anillo" : p.style.background && !p.style.border ? "relleno" : "otra";
    return [f.textContent.replace(/Acierto|Error/, ""), forma, f.querySelector("[data-resultado]").textContent];
  });
  assert.deepEqual(filas, [
    ["1 MARCompra de contado", "relleno", "Acierto"],
    ["10 MARVenta a crédito", "relleno", "Acierto"],
    ["15 MARCompra de contado", "relleno", "Acierto"],
    ["15 MARFlete de la compra", "anillo", "Error"],
    ["20 MARDevolución de venta", "relleno", "Acierto"],
    ["25 MARCompra a crédito", "anillo", "Error"],
    ["31 MARVenta de contado", "relleno", "Acierto"],
    ["31 MARFlete de la venta", "relleno", "Acierto"],
  ]);
  assert.ok([...caja.querySelectorAll("[data-punto]")].every((x) => x.getAttribute("aria-hidden") === "true"));
  assert.equal(fin.length, 1);
  const [pct, , detalle] = fin[0];
  assert.equal(pct, 75);
  assert.deepEqual(detalle.map((d) => [d.item, d.ok]), A.map((a) => [a.id, !["a4", "a6"].includes(a.id)]));
  assert.ok(detalle[5].respuesta.includes("H Cuentas por pagar – proveedores 14848000"));
});
