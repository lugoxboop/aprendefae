import { test } from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { JSDOM, VirtualConsole } from "jsdom";

/*
 * ═══════════════════════════════════════════════════════════════════════════
 * TEMA 3 · «CERRAR EL PERIODO», la última pieza de Aprender (paquete de Levi).
 *
 *   · por paso: el haber de Ganancias y pérdidas llega a $14.800, el debe a
 *     $10.850 y queda $3.950
 *   · capa 3: cualquier subconjunto de cuentas vaciadas da el haber y el debe
 *     correctos; «Queda $3.950» solo con las seis
 *   · las cinco cuentas que no se vacían no cambian nunca
 *   · el valor final de Ganancias y pérdidas queda escrito, con animación
 *   · textos de Gen; ni «Utilidad del ejercicio», ni «candado», ni
 *     «impuesto» en pantalla, salvo «antes del impuesto» en el paso 7 y su alt
 *   · la última de Aprender: «PIEZA 4 DE 4»
 * ═══════════════════════════════════════════════════════════════════════════
 */

const dom = new JSDOM("<!doctype html><html><body></body></html>", { url: "http://localhost/", pretendToBeVisual: true, virtualConsole: new VirtualConsole() });
const w = dom.window;
w.matchMedia = (q) => ({ matches: false, media: q, addEventListener() {}, removeEventListener() {}, addListener() {}, removeListener() {} });
w.Element.prototype.scrollIntoView = () => {};
for (const [k, v] of Object.entries({
  window: w, document: w.document, navigator: w.navigator, localStorage: w.localStorage,
  HTMLElement: w.HTMLElement, Element: w.Element, Node: w.Node, SVGElement: w.SVGElement,
  Event: w.Event, MouseEvent: w.MouseEvent, KeyboardEvent: w.KeyboardEvent,
  getComputedStyle: w.getComputedStyle.bind(w), matchMedia: w.matchMedia,
  requestAnimationFrame: w.requestAnimationFrame.bind(w), cancelAnimationFrame: w.cancelAnimationFrame.bind(w),
})) {
  Object.defineProperty(globalThis, k, { value: v, configurable: true, writable: true });
}
globalThis.IS_REACT_ACT_ENVIRONMENT = true;

const React = await import("react");
const { createRoot } = await import("react-dom/client");
const act = React.act;
const h = React.createElement;

const D = await import("../../data/contabilidadTema3Cierre.js");
const L = await import("../cerrarElPeriodo.js");
const { SUBJECTS, APRENDER } = await import("../../data/subjects.js");
const { PIEZAS } = await import("../../components/ContabilidadTema3View.jsx");
const { default: CerrarElPeriodo } = await import("../../components/mecanicas/libros/tema3/CerrarElPeriodo.jsx");
const { default: CadaCuentaCierre } = await import("../../components/mecanicas/libros/tema3/CadaCuentaCierre.jsx");
const { ESCENAS_TEMA3 } = await import("../../components/mecanicas/libros/tema3/escenasTema3.jsx");

const montar = async (Comp) => {
  const caja = document.createElement("div");
  document.body.appendChild(caja);
  const raiz = createRoot(caja);
  await act(async () => { raiz.render(h(Comp)); });
  return { caja, desmontar: () => { act(() => raiz.unmount()); caja.remove(); } };
};
const clic = async (el) => { assert.ok(el, "no está el elemento"); await act(async () => { el.click(); }); };
const esperar = async (ms) => { for (let t = 0; t < ms; t += 100) await act(async () => { await new Promise((ok) => setTimeout(ok, 100)); }); };
const q = (caja, s) => caja.querySelector(s);
const gyp = (caja) => ({ debe: q(caja, '[data-gyp="debe"]')?.textContent, haber: q(caja, '[data-gyp="haber"]')?.textContent });
const zonaC = (caja) => [...caja.querySelectorAll("[data-ficha-fija]")].map((x) => `${x.querySelector("p").textContent} ${x.querySelector("[data-saldo-fijo]").textContent}`);
const ZONA_C = ["Caja $14.650", "Cuentas por cobrar – clientes $6.800", "Equipo de computación $5.000", "Alquiler por pagar $2.500", "Aportes sociales $20.000"];

/* ═══════════════════ POR PASO ═══════════════════ */

const TABLA = [
  /* paso, modo, haber, debe, queda */
  [1, L.CUENTAS, 0, 0, null],
  [2, L.DIAGRAMA, 0, 0, null],
  [3, L.CUENTAS, 14800, 0, null],
  [4, L.ASIENTO, 14800, 0, null],
  [5, L.CUENTAS, 14800, 10850, null],
  [6, L.ASIENTO, 14800, 10850, null],
  [7, L.CUENTAS, 14800, 10850, 3950],
  [8, L.CUENTAS, 14800, 10850, 3950],
];

test("★★★ por paso: el haber de Ganancias y pérdidas llega a $14.800, el debe a $10.850 y queda $3.950", () => {
  for (const [paso, modo, haber, debe, queda] of TABLA) {
    const e = L.estadoPasoCierre(paso);
    assert.equal(e.modo, modo, `paso ${paso}: modo`);
    assert.deepEqual(e.gyp, { debe, haber, queda }, `paso ${paso}`);
  }
  assert.equal(L.estadoPasoCierre(8).gyp.queda, 14800 - 10850);
  assert.deepEqual(L.ASIENTO_INGRESOS, { debe: { cuenta: "Ingresos por servicios", monto: 14800 }, haber: { cuenta: "Ganancias y pérdidas", monto: 14800 } });
  assert.equal(L.ASIENTO_GASTOS.debe.cuenta, "Ganancias y pérdidas");
  assert.equal(L.ASIENTO_GASTOS.debe.monto, 10850);
  assert.equal(L.ASIENTO_GASTOS.haber.partidas.reduce((s, p) => s + p.monto, 0), 10850);
  assert.deepEqual(L.ASIENTO_GASTOS.haber.partidas.map((p) => p.cuenta), ["Gasto arriendos", "Gasto salarios", "Gasto materiales de consumo", "Gasto servicios públicos", "Gasto alquiler"]);
});

test("★★★ capa 3: cualquier subconjunto da el haber y el debe correctos; «Queda» solo con las seis", () => {
  const cuentas = D.CUENTAS_DEL_PERIODO;
  for (let m = 0; m < 1 << cuentas.length; m++) {
    const vaciadas = cuentas.filter((_, i) => m & (1 << i)).map((c) => c.cuenta);
    /* En cualquier orden: al revés da lo mismo. */
    for (const orden of [vaciadas, [...vaciadas].reverse()]) {
      const g = L.gananciasYPerdidas(orden);
      const haber = cuentas.filter((c) => c.tipo === D.INGRESO && orden.includes(c.cuenta)).reduce((s, c) => s + c.saldo, 0);
      const debe = cuentas.filter((c) => c.tipo === D.GASTO && orden.includes(c.cuenta)).reduce((s, c) => s + c.saldo, 0);
      assert.equal(g.haber, haber);
      assert.equal(g.debe, debe);
      assert.equal(g.queda, vaciadas.length === 6 ? 3950 : null, `${vaciadas.length} vaciadas`);
    }
  }
});

test("★★★ las cinco cuentas que no se vacían no cambian nunca (datos, 8 pasos y capa 3)", () => {
  assert.deepEqual(D.CUENTAS_QUE_SIGUEN.map((c) => `${c.cuenta} $${String(c.saldo).replace(/\B(?=(\d{3})+(?!\d))/g, ".")}`), ZONA_C);
  for (let p = 1; p <= 8; p++) assert.deepEqual(L.estadoPasoCierre(p).zonaC, D.CUENTAS_QUE_SIGUEN, `paso ${p}`);
  for (const v of [[], ["Gasto salarios"], L.TODAS]) assert.deepEqual(L.estadoCapa3Cierre(v).zonaC, D.CUENTAS_QUE_SIGUEN);
});

/* ═══════════════════ EN PANTALLA ═══════════════════ */

test("★★★ capa 2 de punta a punta: modos, cifras finales escritas con animación y zona C fija", async () => {
  const m = await montar(CerrarElPeriodo);
  try {
    for (const [paso, modo, haber, debe, queda] of TABLA) {
      if (paso > 1) { await clic(q(m.caja, "[data-siguiente]")); await esperar(1900); }
      assert.equal(q(m.caja, "[data-escenario]").dataset.modo, modo, `paso ${paso}`);
      assert.equal(q(m.caja, "[data-paso-de]").textContent, `Paso ${paso} de 8`);
      assert.deepEqual(zonaC(m.caja), ZONA_C, `paso ${paso}: zona C`);
      if (modo === L.DIAGRAMA) {
        assert.ok(q(m.caja, "[data-diagrama]"));
        assert.equal(q(m.caja, "[data-zona=\"A\"]"), null);
        continue;
      }
      /* El valor final, escrito: en el texto y en data-final. */
      assert.deepEqual(gyp(m.caja), { debe: `$${debe.toLocaleString("de-DE")}`, haber: `$${haber.toLocaleString("de-DE")}` }, `paso ${paso}`);
      assert.equal(q(m.caja, '[data-gyp="haber"]').dataset.final, `$${haber.toLocaleString("de-DE")}`);
      assert.equal(q(m.caja, "[data-queda]")?.textContent ?? null, queda ? "Queda $3.950" : null, `paso ${paso}: queda`);
      if (modo === L.ASIENTO) {
        assert.equal(q(m.caja, "[data-zona=\"A\"]"), null, "en modo asiento la zona A no se ve");
        assert.equal(q(m.caja, "[data-pastilla-cierre]").textContent, "Cierre de enero");
        assert.match(q(m.caja, '[role="group"][aria-label="Asiento"]').textContent, paso === 4
          ? /^Debe: Ingresos por servicios, \$14\.800\. Haber: Ganancias y pérdidas, \$14\.800\.$/
          : /^Debe: Ganancias y pérdidas, \$10\.850\. Haber: Gasto arriendos, \$2\.000; Gasto salarios, \$5\.100;/);
      } else {
        const vacias = [...m.caja.querySelectorAll('[data-fila][data-vaciada="si"]')].length;
        assert.equal(vacias, paso >= 5 ? 6 : paso >= 3 ? 1 : 0, `paso ${paso}: filas en $0`);
      }
    }
    assert.equal(q(m.caja, "[data-reproducir]").textContent, "Ver de nuevo");
    assert.equal(q(m.caja, "[data-texto-paso]").textContent, D.CIERRE_TEXTO);
  } finally { m.desmontar(); }
});

test("★★ el paso 2 no lleva pie suelto; el pie general suma la p. 147", async () => {
  const m = await montar(CerrarElPeriodo);
  try {
    await clic(q(m.caja, "[data-siguiente]")); await esperar(300);
    assert.equal(m.caja.querySelectorAll("[data-pie-cierre]").length, 1);
    assert.equal(q(m.caja, "[data-pie-cierre]").textContent, "Basado en el libro, pp. 121-128, 140 y 147");
    assert.doesNotMatch(q(m.caja, "[data-escenario]").textContent, /Libro, p\. 147/);
    assert.match(q(m.caja, "[data-diagrama]").textContent, /Ajustes.*Gasto de la máquina\$2\.500.*Cierre/);
  } finally { m.desmontar(); }
});

test("★★★ capa 3 en pantalla: en cualquier orden, cifras correctas; «Queda» solo con las seis; anuncio", async () => {
  const m = await montar(CadaCuentaCierre);
  try {
    const fila = (c) => q(m.caja, `[data-fila="${c}"]`);
    assert.deepEqual(gyp(m.caja), { debe: "$0", haber: "$0" });
    for (const c of ["Gasto alquiler", "Gasto salarios", "Ingresos por servicios"]) { await clic(fila(c)); }
    await esperar(900);
    assert.deepEqual(gyp(m.caja), { debe: "$7.600", haber: "$14.800" });
    assert.equal(fila("Gasto salarios").getAttribute("aria-pressed"), "true");
    assert.equal(q(m.caja, "[data-queda]"), null);
    assert.equal(q(m.caja, "[data-anuncio-cierre]").textContent, "Ganancias y pérdidas: Debe $7.600, Haber $14.800");
    /* Devolver una cuenta la saca de Ganancias y pérdidas. */
    await clic(fila("Gasto salarios")); await esperar(900);
    assert.deepEqual(gyp(m.caja), { debe: "$2.500", haber: "$14.800" });
    assert.equal(q(m.caja, '[data-fila="Gasto salarios"] [data-saldo-fila]').textContent, "$5.100");
    for (const c of ["Gasto materiales de consumo", "Gasto arriendos", "Gasto servicios públicos", "Gasto salarios"]) { await clic(fila(c)); }
    await esperar(900);
    assert.deepEqual(gyp(m.caja), { debe: "$10.850", haber: "$14.800" });
    assert.equal(q(m.caja, "[data-queda]").textContent, "Queda $3.950");
    assert.ok(q(m.caja, "[data-contorno-queda]"));
    /* La zona C no se toca: sus fichas no son botones. */
    assert.deepEqual(zonaC(m.caja), ZONA_C);
    assert.equal(m.caja.querySelectorAll("[data-zona=\"C\"] button").length, 0);
  } finally { m.desmontar(); }
});

/* ═══════════════════ TEXTOS ═══════════════════ */

test("★★★ los textos de Gen, textuales", () => {
  assert.deepEqual(D.SEGMENTOS_CIERRE, [
    "Estas son las cuentas de San Calixto al final de enero, cada una con su saldo.",
    "Antes de cerrar hay que ajustar. El diagrama del libro lo pone en ese orden. Por eso el gasto de la máquina ya está anotado.",
    "Empieza el cierre. Los ingresos se vacían en Ganancias y pérdidas y quedan en cero.",
    "El asiento anota $14.800 en el debe de los ingresos y $14.800 en el haber de Ganancias y pérdidas.",
    "Ahora los gastos. Los cinco se vacían en Ganancias y pérdidas y también quedan en cero.",
    "El asiento anota $10.850 en el debe de Ganancias y pérdidas. Reparte $10.850 entre los cinco gastos.",
    "Mira lo que quedó en Ganancias y pérdidas: $3.950. Es lo que dejó el mes antes del impuesto.",
  ]);
  assert.equal(D.CIERRE_TEXTO, "Las cuentas de ingresos y gastos quedaron en cero. Febrero empieza limpio y lo de enero quedó junto en Ganancias y pérdidas.");
  const p = D.PIEZA_CERRAR_EL_PERIODO;
  assert.equal(p.objetivo, "Al cerrar el periodo, las cuentas de ingresos y gastos quedan en cero. Lo que dejan es el resultado.");
  assert.deepEqual(p.nombres.map((n) => n.termino), ["Cuentas del periodo", "Cerrar", "Ganancias y pérdidas", "Desde ya"]);
  assert.equal(p.nombres[0].delLibro, "El libro a veces dice renta; es lo mismo que ingreso.");
  assert.match(p.nombres[1].delLibro, /^«Cerrar una cuenta significa reducir su saldo a cero\. .*» \(p\. 123\)\.$/);
  assert.equal(D.CONSIGNA_CAPA_3_CIERRE, "Toca cada cuenta y mira cómo pasa de su saldo a cero.");
  assert.equal(D.PREGUNTA_FINAL_CIERRE, "Elige la frase que mejor dice para qué se cierran las cuentas.");
  assert.deepEqual(D.OPCIONES_FINAL_CIERRE.filter((o) => o.correcta).map((o) => o.id), ["resultado"]);
});

test("★★★ ni «Utilidad del ejercicio», ni «candado», ni «impuesto» en pantalla, salvo «antes del impuesto» en el paso 7 y su alt", () => {
  const pantalla = [
    ...Object.values(D).flatMap((v) => (typeof v === "string" ? [v] : [])),
    ...D.SEGMENTOS_CIERRE, ...Object.values(D.ALTERNATIVOS_CIERRE),
    D.PIEZA_CERRAR_EL_PERIODO.objetivo, ...D.PIEZA_CERRAR_EL_PERIODO.nombres.flatMap((n) => [n.termino, n.definicion, n.delLibro ?? ""]),
    ...D.OPCIONES_FINAL_CIERRE.flatMap((o) => [o.texto, o.feedback]),
  ];
  const conImpuesto = pantalla.filter((t) => /impuesto/i.test(t));
  assert.deepEqual([...new Set(conImpuesto)], [D.SEGMENTOS_CIERRE[6], D.ALTERNATIVOS_CIERRE[7]]);
  for (const t of conImpuesto) assert.match(t, /antes del impuesto/);
  for (const t of pantalla) assert.doesNotMatch(t, /Utilidad del ejercicio|candado|cuatro gastos/i, t);
  /* Y en el código de la pieza, ni en comentarios. */
  for (const a of ["../../data/contabilidadTema3Cierre.js", "../cerrarElPeriodo.js",
    "../../components/mecanicas/libros/tema3/CerrarElPeriodo.jsx", "../../components/mecanicas/libros/tema3/CadaCuentaCierre.jsx",
    "../../components/mecanicas/libros/tema3/EscenaCierre.jsx"]) {
    const fuente = readFileSync(new URL(a, import.meta.url), "utf8");
    assert.doesNotMatch(fuente, /Utilidad del ejercicio|candado/i, a);
    assert.doesNotMatch(fuente, /\bcolor:\s*(COLOR\.neutro|["']#B8C4D4)/i, `${a}: #B8C4D4 como texto`);
  }
});

/* ═══════════════════ EN APRENDER ═══════════════════ */

test("★★ la última de Aprender: después de «Lo que ya se pagó…», «PIEZA 4 DE 4», con sus capas", () => {
  const tema = SUBJECTS.contabilidad.topics.find((t) => t.id === "ingresos-gastos-y-caja");
  assert.deepEqual(tema.actividades.filter((a) => a.clasificacion.tipo === APRENDER).map((a) => a.id),
    ["t3-a1-vender-no-es-cobrar", "t3-a3-lo-que-ya-paso", "t3-a4-lo-que-ya-se-pago", "t3-a5-cerrar-el-periodo"]);
  assert.deepEqual(PIEZAS.map((x) => x.pieza.id), ["t3-a1-vender-no-es-cobrar", "t3-a3-lo-que-ya-paso", "t3-a4-lo-que-ya-se-pago", "t3-a5-cerrar-el-periodo"]);
  /* El rótulo sale de la posición: la última dice «PIEZA 4 DE 4». */
  assert.equal(PIEZAS.length, 4);
  const e = ESCENAS_TEMA3["t3-a5-cerrar-el-periodo"];
  assert.equal(e.Capa2, CerrarElPeriodo);
  assert.equal(e.Exploracion, CadaCuentaCierre);
  assert.ok(e.Capa4);
});
