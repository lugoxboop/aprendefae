import { test, afterEach } from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { JSDOM, VirtualConsole } from "jsdom";

/*
 * ═══════════════════════════════════════════════════════════════════════════
 * «EL MES EN DOS CUENTAS» (Célula E) — «Lo que Ippo prueba del panel», del
 * paquete e5-mes-en-dos-cuentas, con las correcciones de Takamura:
 *
 *   · las cifras de cada cuenta, asiento por asiento, desde los datos; y que
 *     entra la cifra correcta aunque el estudiante falle
 *   · r5-3 al final: IVA haber 22.950.000, debe 10.772.800, diferencia
 *     12.177.200 con la frase «a pagar»; Caja con su diferencia
 *   · la escala fija, el mínimo de 8 px y el lado más largo = la cifra mayor
 *   · el rayado solo en el asiento en curso
 *   · el panel va después de la devolución y anima al entrar en la ventana
 *   · la versión compacta de un asiento que no toca ninguna de las dos
 *   · los textos, literales en el paquete, y que todos salen en pantalla
 *
 * (r5-4 trae sus propias cuentas y cifras en su PR.)
 * ═══════════════════════════════════════════════════════════════════════════
 */

const dom = new JSDOM("<!doctype html><html><body></body></html>", { url: "http://localhost/", virtualConsole: new VirtualConsole() });
const w = dom.window;
const MOVIMIENTO = { reducido: true };
w.matchMedia = (q) => ({ matches: MOVIMIENTO.reducido && /reduce/.test(q), addEventListener() {}, removeEventListener() {}, addListener() {}, removeListener() {} });
/* Un IntersectionObserver de mentira: el panel entra en la ventana cuando la prueba lo dice. */
const OBSERVADORES = [];
class Observador {
  constructor(fn) { this.fn = fn; this.vivo = true; OBSERVADORES.push(this); }
  observe(el) { this.el = el; }
  disconnect() { this.vivo = false; }
  entrar() { if (this.vivo) this.fn([{ isIntersecting: true, intersectionRatio: 1, target: this.el }]); }
}
for (const [k, v] of Object.entries({
  window: w, document: w.document, navigator: w.navigator, localStorage: w.localStorage,
  HTMLElement: w.HTMLElement, HTMLInputElement: w.HTMLInputElement, Element: w.Element, Node: w.Node,
  Event: w.Event, MouseEvent: w.MouseEvent, KeyboardEvent: w.KeyboardEvent,
  getComputedStyle: w.getComputedStyle.bind(w), matchMedia: w.matchMedia,
  requestAnimationFrame: (fn) => setTimeout(() => fn(performance.now()), 0),
  cancelAnimationFrame: (id) => clearTimeout(id),
})) {
  Object.defineProperty(globalThis, k, { value: v, configurable: true, writable: true });
}
globalThis.IS_REACT_ACT_ENVIRONMENT = true;

const React = await import("react");
const { createRoot } = await import("react-dom/client");
const act = React.act;
const h = React.createElement;

const T = await import("../../data/repasoCap5MateTextos.js");
const M = await import("../../data/repasoCap5Mes.js");
const { MES_COMUN } = await import("../../data/repasoCap5Comun.js");
const { MesEnDosCuentas } = await import("../../components/repasoCap5/MesEnDosCuentas.jsx");
const { Mate } = await import("../../components/repasoCap5/Mate.jsx");
const { pesos } = await import("../../data/contabilidad.js");

const RAIZ = new URL("../../../", import.meta.url);
const leer = (f) => readFileSync(new URL(f, RAIZ), "utf8");
const PAQUETE = leer("orquestador/conocimiento/paquetes/e5-mes-en-dos-cuentas.md");
const PLANO = PAQUETE.replace(/\s+/g, " ");
const A = T.ASIENTOS_MATE;
const CUENTAS = T.MES_MATE.cuentas;
const MOVS = M.movimientosDelMes(A, CUENTAS);

const montados = [];
afterEach(() => {
  while (montados.length) montados.pop()();
  MOVIMIENTO.reducido = true;
  delete globalThis.IntersectionObserver;
  OBSERVADORES.length = 0;
});
const montar = async (el) => {
  const caja = document.createElement("div");
  document.body.appendChild(caja);
  const raiz = createRoot(caja);
  await act(async () => { raiz.render(el); });
  let vivo = true;
  const desmontar = () => { if (!vivo) return; vivo = false; act(() => raiz.unmount()); caja.remove(); };
  montados.push(desmontar);
  return { caja, desmontar };
};
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
const pasar = async (ms) => { await new Promise((r) => setTimeout(r, ms)); await act(async () => {}); };
const cifraTexto = (n) => pesos(n).replace("$", "");

/* ═══════════ LOS TEXTOS ═══════════ */

test("★★★ los textos del panel están, literales, en el paquete: rótulos fijos y la tabla de r5-3", () => {
  const fijos = PLANO.slice(PLANO.indexOf("Rótulos fijos de interfaz:"), PLANO.indexOf("**Cifras del mes**"));
  for (const t of Object.values(MES_COMUN)) assert.ok(fijos.includes(t), t);
  for (const c of CUENTAS) assert.ok(PAQUETE.includes(`| ${c.nombre} | ${c.debe} | ${c.haber} | ${c.difDebe} | ${c.difHaber} |`), c.nombre);
  assert.equal(CUENTAS.length, 2);
  assert.deepEqual(CUENTAS.map((c) => c.cuenta), [T.CAJA, T.IVA]);
  /* Las dos frases finales del IVA, con la cifra desde los datos. */
  assert.ok(PLANO.includes(`a pagar «${T.MES_MATE.final.haber(12177200)}»`));
  assert.ok(PLANO.includes(`a favor «${T.MES_MATE.final.debe(0).replace("$0", "$X")}»`));
});

/* ═══════════ LAS CIFRAS ═══════════ */

test("★★★ las cifras de cada cuenta, asiento por asiento, calculadas desde los datos (guarda: 8 asientos × 2 cuentas)", () => {
  let revisadas = 0;
  for (let k = 0; k < A.length; k++) {
    const e = M.estadoDelMes(MOVS, CUENTAS, k);
    for (const c of e) {
      revisadas++;
      /* A mano, desde los asientos correctos: lo de antes y lo de este. */
      const suma = (lado, desde, hasta) => A.slice(desde, hasta).flatMap((a) => a.correctos[0]).filter((r) => r.cuenta === c.cuenta && r.lado === lado).reduce((t, r) => t + r.valor, 0);
      for (const lado of ["debe", "haber"]) {
        assert.equal(c[lado].antes, suma(lado, 0, k), `${A[k].id} · ${c.cuenta} · ${lado} antes`);
        assert.equal(c[lado].tramo, suma(lado, k, k + 1), `${A[k].id} · ${c.cuenta} · ${lado} tramo`);
        assert.equal(c[lado].total, suma(lado, 0, k + 1));
      }
    }
  }
  assert.equal(revisadas, 16);
  /* Todos los asientos de r5-3 tocan al menos una de las dos cuentas. */
  assert.ok(MOVS.every((m) => m.length > 0));
});

test("★★★ el mes de r5-3 da lo que escribe Miyata: Caja 61.987.500 / 46.594.350 y IVA 10.772.800 / 22.950.000", () => {
  const [caja, iva] = M.estadoDelMes(MOVS, CUENTAS, null);
  assert.deepEqual([caja.debe.total, caja.haber.total], [61987500, 46594350]);
  assert.deepEqual([iva.debe.total, iva.haber.total], [10772800, 22950000]);
  assert.deepEqual(M.diferenciaDe(caja.debe.total, caja.haber.total), { valor: 15393150, lado: "debe" });
  assert.deepEqual(M.diferenciaDe(iva.debe.total, iva.haber.total), { valor: 12177200, lado: "haber" });
  for (const t of ["Caja entradas $61.987.500, salidas $46.594.350, diferencia $15.393.150 débito", "IVA haber $22.950.000, debe $10.772.800, diferencia $12.177.200 crédito"]) {
    assert.ok(PLANO.includes(t), t);
  }
});

test("★★★ la escala es fija todo el mes, el tramo mide 8 px como mínimo, nunca pasa del riel, y el lado más largo es el de la cifra mayor", () => {
  let revisados = 0;
  for (const ancho of [264, 319]) {
    for (const c of M.estadoDelMes(MOVS, CUENTAS, null)) {
      /* La escala: el lado mayor al final del mes ocupa todo el riel. */
      assert.equal(c.escala, Math.max(c.debe.total, c.haber.total));
      const mayor = c.debe.total >= c.haber.total ? "debe" : "haber";
      assert.equal(Math.round(M.posicionesDelLado(MOVS, c.cuenta, mayor, c.escala, ancho).at(-1)), ancho, `${c.cuenta}: el lado mayor no llena el riel`);
      for (let k = 0; k < A.length; k++) {
        revisados++;
        const estado = M.estadoDelMes(MOVS, CUENTAS, k).find((x) => x.cuenta === c.cuenta);
        const px = (lado) => M.anchosDelLado(MOVS, c.cuenta, lado, c.escala, ancho, k);
        for (const lado of ["debe", "haber"]) {
          const a = px(lado);
          const dibujado = a.liso + a.previo + a.tramo;
          assert.ok(dibujado <= ancho + 1e-9, "pasa del riel");
          if (estado[lado].tramo > 0) assert.ok(a.tramo >= M.TRAMO_MINIMO - 1e-9 || dibujado >= ancho - 1e-9, `${A[k].id}: tramo de ${a.tramo} px`);
          else assert.equal(a.tramo, 0);
        }
        /* Opcional aceptada (Takamura, 6): el lado dibujado más largo es el de la cifra mayor. */
        const d = px("debe");
        const hb = px("haber");
        const [ld, lh] = [d.liso + d.previo + d.tramo, hb.liso + hb.previo + hb.tramo];
        if (estado.debe.total > estado.haber.total) assert.ok(ld > lh, `${ancho} · ${A[k].id} · ${c.cuenta}: debe ${ld} ≤ haber ${lh}`);
        if (estado.haber.total > estado.debe.total) assert.ok(lh > ld, `${ancho} · ${A[k].id} · ${c.cuenta}: haber ${lh} ≤ debe ${ld}`);
      }
    }
  }
  assert.equal(revisados, 32);
  /* Las barras solo crecen. */
  for (const c of M.estadoDelMes(MOVS, CUENTAS, null)) {
    for (const lado of ["debe", "haber"]) {
      const pos = M.posicionesDelLado(MOVS, c.cuenta, lado, c.escala, 264);
      pos.forEach((x, k) => assert.ok(!k || x >= pos[k - 1]));
    }
  }
  /* Los dos fletes pequeños de Caja (237.600 y 198.000) medirían 1 px: miden 8. */
  const caja = M.estadoDelMes(MOVS, CUENTAS, null)[0];
  assert.equal(M.anchosDelLado(MOVS, T.CAJA, "haber", caja.escala, 264, 3).tramo, 8);
  assert.equal(M.anchosDelLado(MOVS, T.CAJA, "haber", caja.escala, 264, 7).tramo, 8);
});

/* ═══════════ EN LA PANTALLA ═══════════ */

const acumulado = (caja, cuenta, lado) => Number(caja.querySelector(`[data-cuenta-mes="${cuenta}"] [data-lado-mes="${lado}"] [data-acumulado]`).dataset.acumulado);
const textoAcumulado = (caja, cuenta, lado) => caja.querySelector(`[data-cuenta-mes="${cuenta}"] [data-lado-mes="${lado}"] [data-acumulado]`).textContent;

test("★★★ en r5-3 el panel va después de la devolución y antes de «Siguiente», y entra la cifra CORRECTA aunque el estudiante falle", async () => {
  const { caja } = await montar(h(Mate, { pasoInicial: 0 }));
  assert.equal(Boolean(caja.querySelector("[data-mes-en-dos-cuentas]")), false, "antes de revisar, el panel no existe");
  /* Un asiento mal: Caja por el valor sin retención y el IVA sin descuento. */
  const C = T.ASIENTOS_MATE[0].correctos[0];
  for (const r of C) await anadir(caja, r.lado, r.cuenta, r.cuenta === T.CAJA ? 27550000 : r.cuenta === T.IVA ? 4000000 : r.valor);
  await tocar(caja.querySelector("[data-revisar]"));
  assert.equal(caja.querySelector("[data-devolucion]").dataset.devolucion, "error");
  const panel = caja.querySelector("[data-mes-en-dos-cuentas]");
  const devolucion = caja.querySelector("[data-devolucion]");
  const siguiente = caja.querySelector("[data-siguiente]");
  assert.ok(devolucion.compareDocumentPosition(panel) & w.Node.DOCUMENT_POSITION_FOLLOWING, "después de la devolución");
  assert.ok(panel.compareDocumentPosition(siguiente) & w.Node.DOCUMENT_POSITION_FOLLOWING, "antes de «Siguiente»");
  /* Las del asiento correcto (26.718.750 y 3.800.000), no las del estudiante (27.550.000 y 4.000.000). */
  assert.equal(acumulado(caja, T.CAJA, "haber"), 26718750);
  assert.equal(acumulado(caja, T.IVA, "debe"), 3800000);
  assert.equal(textoAcumulado(caja, T.CAJA, "haber"), "26.718.750");
  assert.equal(caja.querySelector(`[data-cuenta-mes="${T.IVA}"] [data-diferencia]`).textContent, `Te queda a favor${cifraTexto(3800000)}`);
});

test("★★★ el rayado va solo en el asiento en curso: lo del anterior pasa a liso; al final, todo liso y sin leyenda", async () => {
  for (const k of [0, 1, 6]) {
    const { caja, desmontar } = await montar(h(MesEnDosCuentas, { cuentas: CUENTAS, movs: MOVS, hasta: k }));
    const tramos = [...caja.querySelectorAll("[data-tramo]")].map((x) => `${x.closest("[data-cuenta-mes]").dataset.cuentaMes}|${x.closest("[data-lado-mes]").dataset.ladoMes}`);
    const esperado = MOVS[k].map((m) => `${m.cuenta}|${m.lado}`);
    assert.deepEqual(tramos.sort(), [...new Set(esperado)].sort(), `asiento ${k + 1}`);
    /* Lo del anterior: su capa rayada termina sin opacidad (pasa a liso). */
    const previos = [...caja.querySelectorAll("[data-previo]")];
    if (k) assert.ok(previos.length > 0 && previos.every((x) => x.style.opacity === "0"), `asiento ${k + 1}: lo anterior no pasó a liso`);
    else assert.equal(previos.length, 0);
    assert.equal(Boolean(caja.querySelector("[data-leyenda-mes]")), true);
    desmontar();
  }
  const { caja } = await montar(h(MesEnDosCuentas, { cuentas: CUENTAS, movs: MOVS, hasta: null, final: T.MES_MATE.final }));
  assert.equal(caja.querySelectorAll("[data-tramo], [data-previo]").length, 0, "al final no queda nada rayado");
  assert.equal(Boolean(caja.querySelector("[data-leyenda-mes]")), false);
  /* La diferencia del IVA se cambia por la frase final; la de Caja se queda. */
  assert.equal(caja.querySelector(`[data-cuenta-mes="${T.IVA}"] [data-frase-final]`).textContent, "Marzo: $12.177.200 de IVA son del Estado.");
  assert.equal(caja.querySelector(`[data-cuenta-mes="${T.CAJA}"] [data-diferencia]`).textContent, `Entró más que salió${cifraTexto(15393150)}`);
  assert.equal(acumulado(caja, T.IVA, "haber"), 22950000);
  assert.equal(acumulado(caja, T.IVA, "debe"), 10772800);
});

test("★★★ la animación arranca cuando el panel entra en la ventana; un toque salta al final; con reduced-motion va directo", async () => {
  MOVIMIENTO.reducido = false;
  globalThis.IntersectionObserver = Observador;
  const { caja } = await montar(h(MesEnDosCuentas, { cuentas: CUENTAS, movs: MOVS, hasta: 1 }));
  const panel = () => caja.querySelector("[data-mes-en-dos-cuentas]");
  /* Fuera de la ventana: espera, con el estado anterior (lo del asiento 1 aún rayado, sin lo del 2). */
  await pasar(50);
  assert.equal(panel().dataset.fase, "espera");
  assert.equal(caja.querySelector("[data-tramo]").style.width, "0px");
  assert.equal(caja.querySelector("[data-previo]").style.opacity, "1");
  assert.equal(OBSERVADORES.length, 1);
  await act(async () => { OBSERVADORES[0].entrar(); });
  await pasar(60);
  assert.equal(panel().dataset.fase, "animando");
  /* Un toque en el panel: estado final. */
  await tocar(panel());
  assert.equal(panel().dataset.fase, "final");
  assert.notEqual(caja.querySelector("[data-tramo]").style.width, "0px");
  /* Sin tocar, termina sola (~1,1 s). */
  const otro = await montar(h(MesEnDosCuentas, { cuentas: CUENTAS, movs: MOVS, hasta: 6 }));
  await act(async () => { OBSERVADORES.at(-1).entrar(); });
  await pasar(1300);
  assert.equal(otro.caja.querySelector("[data-mes-en-dos-cuentas]").dataset.fase, "final");
  /* Reduced-motion: final directo, sin observar nada. */
  MOVIMIENTO.reducido = true;
  OBSERVADORES.length = 0;
  const directo = await montar(h(MesEnDosCuentas, { cuentas: CUENTAS, movs: MOVS, hasta: 2 }));
  assert.equal(directo.caja.querySelector("[data-mes-en-dos-cuentas]").dataset.fase, "final");
  assert.equal(OBSERVADORES.length, 0);
});

test("★★★ un asiento que no toca ninguna de las dos cuentas lleva la versión compacta: la marca y la línea, sin barras", async () => {
  /* r5-3 no tiene ninguno; el caso de r5-4, con datos de la prueba. */
  const movs = [MOVS[0], [], MOVS[1]];
  const linea = "Lo pagarás después; Caja y descuento esperan ese día.";
  const { caja } = await montar(h(MesEnDosCuentas, { cuentas: CUENTAS, movs, hasta: 1, linea }));
  const panel = caja.querySelector("[data-mes-en-dos-cuentas]");
  assert.equal(panel.dataset.mesEnDosCuentas, "compacta");
  assert.equal(panel.textContent, `${MES_COMUN.marca}${linea}`);
  assert.equal(caja.querySelectorAll("[data-riel]").length, 0);
  assert.ok(PLANO.includes(`| ${linea} |`));
  assert.match(caja.querySelector("[data-linea-mes]").style.borderLeft, /3px solid/);
});

test("★★★ E1 · cada texto del panel sale en pantalla en algún estado (los que r5-3 no alcanza, con datos de la prueba)", async () => {
  const visto = [];
  for (let k = 0; k < A.length; k++) {
    const { caja, desmontar } = await montar(h(MesEnDosCuentas, { cuentas: CUENTAS, movs: MOVS, hasta: k }));
    visto.push(caja.textContent);
    desmontar();
  }
  const fin = await montar(h(MesEnDosCuentas, { cuentas: CUENTAS, movs: MOVS, hasta: null, final: T.MES_MATE.final }));
  visto.push(fin.caja.textContent);
  fin.desmontar();
  /* «Sin diferencia» (una cuenta con debe = haber) y la frase «a favor» (el IVA pagado mayor que el cobrado). */
  const iguales = [[{ cuenta: T.CAJA, lado: "debe", valor: 5 }, { cuenta: T.CAJA, lado: "haber", valor: 5 }, { cuenta: T.IVA, lado: "debe", valor: 9 }]];
  const otro = await montar(h(MesEnDosCuentas, { cuentas: CUENTAS, movs: iguales, hasta: 0 }));
  visto.push(otro.caja.textContent);
  otro.desmontar();
  const aFavor = await montar(h(MesEnDosCuentas, { cuentas: CUENTAS, movs: iguales, hasta: null, final: T.MES_MATE.final }));
  visto.push(aFavor.caja.textContent);
  const todo = visto.join("\n");
  const textos = [...Object.values(MES_COMUN), ...CUENTAS.flatMap((c) => [c.nombre, c.debe, c.haber, c.difDebe, c.difHaber]), T.MES_MATE.final.haber(12177200), T.MES_MATE.final.debe(9)];
  assert.equal(textos.length, 17);
  const faltan = textos.filter((t) => !todo.includes(t));
  assert.deepEqual(faltan, [], `no salen: ${faltan.join(" | ")}`);
});
