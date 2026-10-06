import { test } from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { JSDOM, VirtualConsole } from "jsdom";

/*
 * ═══════════════════════════════════════════════════════════════════════════
 * TEMA 3 · PIEZA 3 — «Lo que ya pasó y no se ha pagado».
 *
 *   · los contadores de cada paso: San Calixto termina en Gastos $2.500,
 *     San Miguel en Ingresos $2.500; Entró y Salió, en $0 (Levi)
 *   · las cuatro cuentas exactas del asiento y del espejo (Levi)
 *   · el texto de Gen, textual; los alternativos solo en los pasos 4, 5 y 8
 *   · el valor final de cada contador y de cada monto queda escrito
 *   · la capa 3 con movimiento reducido aparece en su estado final (Levi)
 *   · colores: sin coral; verde azulado y ámbar solo en el asiento; #B8C4D4
 *     nunca es color de texto
 * ═══════════════════════════════════════════════════════════════════════════
 */

const dom = new JSDOM("<!doctype html><html><body></body></html>", { url: "http://localhost/", virtualConsole: new VirtualConsole() });
const w = dom.window;
let reducido = true;
w.matchMedia = (q) => ({ matches: q.includes("reduce") ? reducido : false, addEventListener() {}, removeEventListener() {}, addListener() {}, removeListener() {} });
w.requestAnimationFrame = (cb) => setTimeout(() => cb(performance.now()), 16);
w.cancelAnimationFrame = (id) => clearTimeout(id);
w.Element.prototype.scrollIntoView = () => {};
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

const P3 = await import("../../data/contabilidadTema3Pieza3.js");
const L = await import("../loQueYaPaso.js");
const { SUBJECTS } = await import("../../data/subjects.js");
const { default: LoQueYaPaso } = await import("../../components/mecanicas/libros/tema3/LoQueYaPaso.jsx");
const { default: CadaEmpresa } = await import("../../components/mecanicas/libros/tema3/CadaEmpresa.jsx");
const { ESCENAS_TEMA3 } = await import("../../components/mecanicas/libros/tema3/escenasTema3.jsx");
const { PIEZAS } = await import("../../components/ContabilidadTema3View.jsx");
const { default: UnaFrase } = await import("../../components/mecanicas/libros/intro/UnaFrase.jsx");

const montar = async (el) => {
  const caja = document.createElement("div");
  document.body.appendChild(caja);
  const raiz = createRoot(caja);
  await act(async () => { raiz.render(el); });
  return { caja, desmontar: () => { act(() => raiz.unmount()); caja.remove(); } };
};
const tocar = async (el) => { await act(async () => { el.dispatchEvent(new w.MouseEvent("click", { bubbles: true })); }); };
/* En tramos cortos: dentro de un solo act largo, React no pinta hasta el final y el conteo no avanza. */
const dormir = async (ms) => {
  for (let t = 0; t < ms; t += 100) await act(async () => { await new Promise((r) => setTimeout(r, Math.min(100, ms - t))); });
};
const montos = (caja) => ["ingreso", "gasto", "entrada", "salida"].map((t) => caja.querySelector(`[data-contador="${t}"] [data-monto]`).textContent);

/* ═══════════ LOS CONTADORES DE CADA PASO (Levi) ═══════════ */

const TABLA = {
  1: [0, 0, 0, 0], 2: [0, 0, 0, 0],
  3: [0, 2500, 0, 0], 4: [0, 2500, 0, 0], 5: [0, 2500, 0, 0],
  6: [0, 0, 0, 0], 7: [2500, 0, 0, 0], 8: [2500, 0, 0, 0],
};

test("★★★ los contadores de cada paso: San Calixto termina en Gastos $2.500, San Miguel en Ingresos $2.500, Entró y Salió en $0", () => {
  for (const [paso, esperado] of Object.entries(TABLA)) {
    const c = L.estadoPasoP3(Number(paso)).contadores;
    assert.deepEqual([c.ingreso, c.gasto, c.entrada, c.salida], esperado, `paso ${paso}`);
  }
  const sc = L.estadoPasoP3(5).contadores;
  const sm = L.estadoPasoP3(8).contadores;
  assert.equal(sc.gasto, 2500);
  assert.equal(sm.ingreso, 2500);
  for (const c of [sc, sm]) { assert.equal(c.entrada, 0); assert.equal(c.salida, 0); }
  /* Cinco marcas de $500, una por día. */
  assert.deepEqual(L.estadoPasoP3(3).marcas.map((m) => [m.tipo, m.monto, m.columna]), [0, 1, 2, 3, 4].map((i) => ["gasto", 500, i]));
  assert.deepEqual(L.estadoPasoP3(7).marcas.map((m) => [m.tipo, m.monto]), Array(5).fill(["ingreso", 500]));
});

test("★★★ cada paso: modo, pistas, calendario y empresa", () => {
  const e = (p) => L.estadoPasoP3(p);
  assert.deepEqual([1, 2, 3, 4, 5, 6, 7, 8, 9].map((p) => e(p).modo), ["lineas", "lineas", "lineas", "lineas", "asiento", "lineas", "lineas", "asiento", "espejo"]);
  assert.equal(e(1).calendario.regla, false);
  assert.equal(e(2).calendario.regla, true);
  assert.equal(e(3).calendario.corte, false);
  assert.equal(e(4).calendario.corte, true);
  assert.equal(e(4).calendario.retardo, true);
  assert.equal(e(6).calendario.corte, true, "la regla, el corchete y el corte se quedan con San Miguel");
  assert.equal(e(7).calendario.retardo, false);
  assert.deepEqual(e(3).pistas, { resultados: "activa", caja: "quieta" });
  assert.deepEqual(e(4).pistas, { resultados: "quieta", caja: "quieta" });
  assert.equal(e(3).marcas.every((m) => m.actual), true);
  assert.equal(e(4).marcas.every((m) => !m.actual), true, "en el paso 4 las marcas pasan a #B8C4D4");
  assert.equal(e(5).empresa.nombre, "San Calixto");
  assert.equal(e(6).empresa.nombre, "San Miguel");
  assert.equal(e(6).recienCambiada, true);
});

/* ═══════════ LAS CUENTAS (Levi) Y EL TEXTO (Gen) ═══════════ */

test("★★★ las cuatro cuentas exactas del asiento y del espejo", () => {
  assert.deepEqual(P3.SAN_CALIXTO_P3.asiento, { debe: { cuenta: "Gasto alquiler", monto: 2500 }, haber: { cuenta: "Alquiler por pagar", monto: 2500 } });
  assert.deepEqual(P3.SAN_MIGUEL_P3.asiento, { debe: { cuenta: "Servicios por cobrar", monto: 2500 }, haber: { cuenta: "Ingresos por servicios", monto: 2500 } });
  assert.deepEqual(L.estadoPasoP3(5).asiento, P3.SAN_CALIXTO_P3.asiento);
  assert.deepEqual(L.estadoPasoP3(8).asiento, P3.SAN_MIGUEL_P3.asiento);
});

test("★★★ el texto de Gen: los ocho segmentos, el cierre en el paso 9 y los alternativos solo en 4, 5 y 8", () => {
  assert.equal(P3.SEGMENTOS_P3.length, 8);
  assert.equal(L.estadoPasoP3(1).textos[0], "Vuelven las dos líneas de la primera pieza de este tema. Arriba, ingresos y gastos. Abajo, la caja.");
  assert.equal(L.estadoPasoP3(5).textos[0], "Al cerrar el mes se anota el gasto de $2.500 y la deuda de $2.500. El debe lleva el gasto y el haber la deuda.");
  assert.equal(L.estadoPasoP3(9).textos[0], "Un solo hecho, dos empresas. Lo que para San Calixto es gasto y deuda, para San Miguel es ingreso y plata por cobrar.");
  for (let p = 1; p <= 9; p++) assert.equal(Boolean(L.estadoPasoP3(p).alternativo), [4, 5, 8].includes(p), `paso ${p}`);
  assert.equal(L.estadoPasoP3(8).alternativo, "Ejemplo: San Miguel anota $2.500 en el debe como servicios por cobrar y $2.500 en el haber como ingreso.");
  /* Todo monto lleva «$». */
  for (const t of [...P3.SEGMENTOS_P3, P3.CIERRE_P3, ...Object.values(P3.ALTERNATIVOS_P3)]) {
    assert.doesNotMatch(t, /(^|[^$\d.])\d\.\d{3}/, t);
  }
});

test("★★ capa 1 en el orden corregido, objetivo y capa 4 de Gen", () => {
  const p = P3.PIEZA_LO_QUE_YA_PASO;
  assert.equal(p.objetivo, "El hecho ya ocurrió y la plata no ha llegado. Al cerrar el mes hay que anotarlo igual.");
  assert.deepEqual(p.nombres.map((n) => n.termino), ["Se causa", "Cierre del mes", "Ajuste", "Acumulado", "Desde ya"]);
  assert.equal(p.nombres[0].delLibro, "El libro también dice devengar; es lo mismo.");
  assert.match(p.nombres[3].delLibro, /\(p\. 139\).*\(p\. 141\)/);
  assert.equal(P3.PREGUNTA_FINAL_P3, "Elige la frase que mejor dice cuándo se causa un gasto.");
  assert.deepEqual(P3.OPCIONES_FINAL_P3.filter((o) => o.correcta).map((o) => o.texto), ["Cuando la empresa ya consumió el bien o el servicio."]);
  assert.equal(ESCENAS_TEMA3["t3-a3-lo-que-ya-paso"].Capa4().type, UnaFrase);
});

test("★★ en Aprender va después de la pieza 1 y deja libre el lugar de la 2", () => {
  const tema = SUBJECTS.contabilidad.topics.find((t) => t.id === "ingresos-gastos-y-caja");
  assert.deepEqual(tema.actividades.slice(0, 2).map((a) => a.id), ["t3-a1-vender-no-es-cobrar", "t3-a3-lo-que-ya-paso"]);
  assert.deepEqual(PIEZAS.map((x) => x.numero), [1, 3]);
});

/* ═══════════ LA CAPA 2, MONTADA ═══════════ */

test("★★★ capa 2: los nueve pasos con sus contadores, sus asientos y el espejo", async () => {
  reducido = true;
  const m = await montar(h(LoQueYaPaso));
  try {
    for (let p = 1; p <= 9; p++) {
      assert.equal(m.caja.querySelector("[data-paso-de]").textContent, `Paso ${p} de 9`);
      const modo = m.caja.querySelector("[data-modo]").getAttribute("data-modo");
      if (p < 9) {
        assert.deepEqual(montos(m.caja), TABLA[p].map((n) => (n ? "$2.500" : "$0")), `paso ${p}`);
        /* El valor final queda escrito en el atributo y en el texto. */
        for (const el of m.caja.querySelectorAll("[data-monto]")) assert.equal(el.textContent, el.getAttribute("data-final"));
      }
      if (p === 5 || p === 8) {
        assert.equal(modo, "asiento");
        const cuentas = [...m.caja.querySelectorAll("[data-cuenta]")].map((x) => x.textContent);
        assert.deepEqual(cuentas, p === 5 ? ["Gasto alquiler", "Alquiler por pagar"] : ["Servicios por cobrar", "Ingresos por servicios"]);
        assert.deepEqual([...m.caja.querySelectorAll("[data-lado]")].map((x) => x.textContent), ["Debe", "Haber"]);
        assert.deepEqual([...m.caja.querySelectorAll("[data-monto-asiento]")].map((x) => x.textContent), ["$2.500", "$2.500"]);
        assert.equal(m.caja.querySelector("[data-carril]"), null, "en modo asiento las pistas dejan solo sus encabezados");
      }
      if (p === 4) {
        assert.ok(m.caja.querySelector("[data-retardo]"));
        assert.equal(m.caja.querySelectorAll("[data-corte]").length, 3, "el corte cruza la regla y los dos carriles");
      }
      if (p === 9) {
        assert.equal(modo, "espejo");
        assert.deepEqual([...m.caja.querySelectorAll("[data-espejo-empresa] [data-cuenta]")].map((x) => x.textContent),
          ["Gasto alquiler", "Alquiler por pagar", "Servicios por cobrar", "Ingresos por servicios"]);
        assert.equal(m.caja.querySelector("[data-empresa]"), null, "la etiqueta de empresa no se muestra en el espejo");
        assert.equal(m.caja.querySelector("[data-reproducir]").textContent, "Ver de nuevo");
      }
      assert.equal(m.caja.querySelector("[data-texto-paso]").textContent, L.estadoPasoP3(p).textos[0]);
      if (p < 9) await tocar(m.caja.querySelector("[data-siguiente]"));
    }
  } finally { m.desmontar(); }
});

test("★★★ los alternativos van en aria-describedby solo en los pasos 4, 5 y 8", async () => {
  reducido = true;
  const m = await montar(h(LoQueYaPaso));
  try {
    for (let p = 1; p <= 8; p++) {
      const grupo = m.caja.querySelector('[role="group"]');
      const id = grupo.getAttribute("aria-describedby");
      if ([4, 5, 8].includes(p)) assert.equal(document.getElementById(id).textContent, P3.ALTERNATIVOS_P3[p]);
      else assert.equal(id, null, `paso ${p}`);
      for (const c of m.caja.querySelectorAll("[data-carril], [data-regla], [data-asiento]")) assert.equal(c.getAttribute("aria-hidden"), "true");
      await tocar(m.caja.querySelector("[data-siguiente]"));
    }
  } finally { m.desmontar(); }
});

test("★★★ con animación, el valor final de los contadores y del asiento queda escrito", async () => {
  reducido = false;
  const m = await montar(h(LoQueYaPaso));
  try {
    for (let p = 1; p < 5; p++) await tocar(m.caja.querySelector("[data-siguiente]"));
    await dormir(1700);
    assert.deepEqual(montos(m.caja), ["$0", "$2.500", "$0", "$0"]);
    assert.deepEqual([...m.caja.querySelectorAll("[data-monto-asiento]")].map((x) => x.textContent), ["$2.500", "$2.500"]);
  } finally { m.desmontar(); reducido = true; }
});

/* ═══════════ LA CAPA 3 ═══════════ */

test("★★★ capa 3 con movimiento reducido: cada pestaña queda directamente en su estado final", async () => {
  reducido = true;
  const m = await montar(h(CadaEmpresa));
  try {
    assert.deepEqual(montos(m.caja), ["$0", "$0", "$0", "$0"]);
    assert.ok(m.caja.querySelector("[data-espacio-asiento]"), "el espacio del asiento queda reservado");
    assert.equal(m.caja.querySelectorAll("[data-corte]").length, 3, "regla y corte desde el principio");
    const sc = m.caja.querySelector('[data-pestana="san-calixto"]');
    const sm = m.caja.querySelector('[data-pestana="san-miguel"]');
    await tocar(sc);
    assert.equal(sc.getAttribute("aria-pressed"), "true");
    assert.deepEqual(montos(m.caja), ["$0", "$2.500", "$0", "$0"]);
    assert.deepEqual([...m.caja.querySelectorAll("[data-cuenta]")].map((x) => x.textContent), ["Gasto alquiler", "Alquiler por pagar"]);
    assert.ok(m.caja.querySelector("[data-retardo]"));
    assert.equal([...m.caja.querySelectorAll("[data-marca]")].every((x) => x.getAttribute("data-actual") === "no"), true);
    assert.match(m.caja.querySelector("[data-anuncio-p3]").textContent, /^San Calixto\. Ejemplo: el gasto queda marcado/);
    await tocar(sm);
    assert.equal(sm.getAttribute("aria-pressed"), "true");
    assert.equal(sc.getAttribute("aria-pressed"), "false");
    assert.deepEqual(montos(m.caja), ["$2.500", "$0", "$0", "$0"]);
    assert.deepEqual([...m.caja.querySelectorAll("[data-cuenta]")].map((x) => x.textContent), ["Servicios por cobrar", "Ingresos por servicios"]);
    assert.equal(m.caja.querySelector("[data-retardo]"), null, "el retardo es solo de San Calixto");
    assert.match(m.caja.querySelector("[data-anuncio-p3]").textContent, /^San Miguel\. Cambia la empresa, así que las dos líneas vuelven a cero\. Ejemplo: San Miguel/);
    assert.equal(sc.getAttribute("data-vista"), "si");
    assert.equal(sm.getAttribute("data-vista"), "si");
  } finally { m.desmontar(); }
});

test("★★ capa 3 con animación: el reinicio y la secuencia terminan en el estado final", async () => {
  reducido = false;
  const m = await montar(h(CadaEmpresa));
  try {
    await tocar(m.caja.querySelector('[data-pestana="san-calixto"]'));
    await dormir(3400);
    assert.deepEqual(montos(m.caja), ["$0", "$2.500", "$0", "$0"]);
    assert.ok(m.caja.querySelector("[data-asiento]"));
    await tocar(m.caja.querySelector('[data-pestana="san-miguel"]'));
    await dormir(600);
    assert.deepEqual(montos(m.caja), ["$0", "$0", "$0", "$0"], "al final del reinicio, todo en cero");
    await dormir(3000);
    assert.deepEqual(montos(m.caja), ["$2.500", "$0", "$0", "$0"]);
    assert.deepEqual([...m.caja.querySelectorAll("[data-cuenta]")].map((x) => x.textContent), ["Servicios por cobrar", "Ingresos por servicios"]);
  } finally { m.desmontar(); reducido = true; }
});

/* ═══════════ COLORES ═══════════ */

test("★★★ sin coral; verde azulado y ámbar solo en el asiento; #B8C4D4 nunca es color de texto", async () => {
  const carpeta = new URL("../../components/mecanicas/libros/tema3/", import.meta.url);
  const leer = (f) => readFileSync(new URL(f, carpeta), "utf8");
  const CORAL = /#e76f51|FAE\.coral|rgba\(231,\s*111,\s*81/i;
  const TEAL_AMBAR = /#2a9d8f|#52c4b0|#e9c46a|FAE\.(teal|ambar)|COLOR_LADO|TONO_ROTULO/i;
  for (const f of ["DosLineas.jsx", "LoQueYaPaso.jsx", "CadaEmpresa.jsx", "AsientoTema3.jsx"]) assert.doesNotMatch(leer(f), CORAL, f);
  for (const f of ["DosLineas.jsx", "LoQueYaPaso.jsx", "CadaEmpresa.jsx"]) assert.doesNotMatch(leer(f), TEAL_AMBAR, f);
  for (const f of ["../../../../contabilidad/loQueYaPaso.js", "../../../../data/contabilidadTema3Pieza3.js"]) {
    assert.doesNotMatch(leer(f), new RegExp(`${CORAL.source}|${TEAL_AMBAR.source}`, "i"), f);
  }
  assert.match(leer("AsientoTema3.jsx"), /TONO_ROTULO/);

  reducido = true;
  for (const C of [LoQueYaPaso, CadaEmpresa]) {
    const m = await montar(h(C));
    try {
      const botones = [...m.caja.querySelectorAll("[data-siguiente], [data-pestana]")];
      for (let k = 0; k < 9; k++) {
        for (const el of m.caja.querySelectorAll("*")) {
          const tieneTexto = [...el.childNodes].some((n) => n.nodeType === 3 && n.textContent.trim());
          if (tieneTexto) assert.notEqual(el.style.color.replace(/\s/g, ""), "rgb(184,196,212)", `«${el.textContent}» en #B8C4D4`);
        }
        const b = C === LoQueYaPaso ? m.caja.querySelector("[data-siguiente]") : botones[k % botones.length];
        if (b && !b.disabled) await tocar(b);
      }
    } finally { m.desmontar(); }
  }
});
