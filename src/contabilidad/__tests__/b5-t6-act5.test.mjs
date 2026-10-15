import { test } from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { JSDOM, VirtualConsole } from "jsdom";

/*
 * ═══════════════════════════════════════════════════════════════════════════
 * TEMA 6 · HACER 5 — «La cuenta de la provisión» (Célula B, b5-t6-a5).
 *
 *   · todo texto es literal del paquete (paquetes/b5-t6-act5.md): consigna,
 *     regla, reglas de «¿Cómo se juega?», punto de partida, cierre, texto
 *     alternativo, las cinco casillas con sus tres opciones y su tipo, y los
 *     diez errores
 *   · las cuentas cuadran; las correctas son cifras del libro (las de El
 *     Torito en nuestros datos); los distractores de Futaba no lo son
 *   · las casillas en orden: un intento; al fallar, la razón y la correcta
 *     marcada; acierte o falle, el valor correcto queda en el registro;
 *     pct = aciertos / 5 × 100; las opciones, barajadas
 *   · la mecánica de Macro no se toca: la de la célula es una copia
 * ═══════════════════════════════════════════════════════════════════════════
 */

const dom = new JSDOM("<!doctype html><html><body></body></html>", { url: "http://localhost/", virtualConsole: new VirtualConsole() });
const w = dom.window;
w.matchMedia = () => ({ matches: false, addEventListener() {}, removeEventListener() {}, addListener() {}, removeListener() {} });
for (const [k, v] of Object.entries({
  window: w, document: w.document, navigator: w.navigator,
  HTMLElement: w.HTMLElement, Element: w.Element, Node: w.Node, SVGElement: w.SVGElement,
  Event: w.Event, MouseEvent: w.MouseEvent, getComputedStyle: w.getComputedStyle.bind(w), matchMedia: w.matchMedia,
})) {
  Object.defineProperty(globalThis, k, { value: v, configurable: true, writable: true });
}
globalThis.IS_REACT_ACT_ENVIRONMENT = true;

const React = await import("react");
const { createRoot } = await import("react-dom/client");
const act = React.act;
const h = React.createElement;

const { default: LaCuentaDeLaProvision } = await import("../../components/mecanicas/libros/tema6/LaCuentaDeLaProvision.jsx");
const { MarcoLibros } = await import("../../components/mecanicas/bloques/marcos.jsx");
const D = await import("../../data/contabilidadT6Act5.js");
const { pesos } = await import("../../data/contabilidad.js");
const { listaNegraDelLibro, cifras } = await import("./b5-lista-negra.mjs");
const { FAE } = await import("../../theme.js");

const montar = async (props = {}) => {
  const caja = document.createElement("div");
  document.body.appendChild(caja);
  const raiz = createRoot(caja);
  let pct = null;
  await act(async () => {
    raiz.render(h(LaCuentaDeLaProvision, { Marco: MarcoLibros, rotulo: "PRUEBA", titulo: "Prueba", acento: FAE.ambar, onCompletar: (p) => { pct = p; }, ...props }));
  });
  return { caja, pct: () => pct, desmontar: () => { act(() => raiz.unmount()); caja.remove(); } };
};
const tocar = async (el) => { assert.ok(el, "no hay nada que tocar"); await act(async () => { el.dispatchEvent(new w.MouseEvent("click", { bubbles: true })); }); };
const opcion = (caja, valor) => caja.querySelector(`[data-opcion="${valor}"]`)?.closest("button");
const siguiente = (caja) => tocar([...caja.querySelectorAll("button")].find((b) => /^(Siguiente|Ver resultado)$/.test(b.textContent.trim())));
const devolucion = (caja) => {
  const p = caja.querySelector('[role="status"]');
  return p ? [...p.childNodes].filter((n) => !(n.classList?.contains("fae-jg-oculto"))).map((n) => n.textContent).join("") : null;
};
const C = D.CASILLAS_T6_ACT5;
const correctaDe = (c) => c.opciones.find((o) => o.tipo === null).valor;

/* ═══════════ EL PAQUETE ═══════════ */

const GUIA = readFileSync(new URL("../../../orquestador/conocimiento/paquetes/b5-t6-act5.md", import.meta.url), "utf8");
const FUTABA = GUIA.slice(GUIA.indexOf("## (1) Futaba"), GUIA.indexOf("## (2) Futaba"));
/* La sección (2): las líneas que Shoko pasó y Futaba aplicó. Mandan sobre (1), por id y campo. */
const SECCION_2 = GUIA.slice(GUIA.indexOf("## (2) Futaba"));
const filas2 = SECCION_2.split("\n").map((l) => l.split("\t"));
const cambio = (id, campo) => filas2.find((c) => c[0] === id && c[1] === campo)?.slice(2);
const filas = FUTABA.split("\n").map((l) => l.split("\t"));
const fila = (primera) => filas.find((c) => c[0] === primera);
const filaTipo = (t) => filas.find((c) => c[0] === t || c[0].startsWith(`${t} ·`));
const sinCifra = (t) => t.replace(/ \(\d+\)$/, "");
/* «$2.655.000 → T1» → { valor, tipo }. */
const opcionDe = (celda) => { const [v, t] = celda.split(" → "); return { valor: cifras(v)[0] ?? Number(v.replace(/\D/g, "")), tipo: t ?? null }; };

test("guarda: el paquete trae las cinco casillas y los diez errores, y una inventada no aparece", () => {
  for (let k = 1; k <= 5; k++) assert.ok(fila(String(k)), `casilla ${k}`);
  for (let k = 1; k <= 10; k++) assert.ok(filaTipo(`T${k}`), `T${k}`);
  assert.equal(fila("6"), undefined);
});

test("★★★ los textos fijos son los del paquete: consigna, regla, reglas, punto de partida, cierre y texto alternativo", () => {
  assert.equal(D.T6_ACT5.consigna, fila("Consigna")[1]);
  assert.equal(D.T6_ACT5.regla, fila("Regla fija")[1]);
  D.REGLAS_T6_ACT5.forEach((r, k) => assert.equal(r, fila(`Así se juega, ${k + 1}`)[1]));
  assert.equal(D.T6_ACT5.partida, cambio("Tutorial", "Texto")[0]);
  assert.equal(D.T6_ACT5.cierre, fila("Cierre")[1]);
  assert.equal(D.ALT_T6_ACT5, fila("Texto alternativo")[1]);
});

test("★★★ las cinco casillas: el enunciado, la correcta y los dos distractores con su tipo, como en el paquete", () => {
  assert.equal(C.length, 5);
  C.forEach((c, k) => {
    const [, enunciado, bien, mal1, mal2] = fila(String(k + 1));
    assert.equal(c.enunciado, sinCifra(enunciado), `casilla ${k + 1}: enunciado`);
    assert.deepEqual(c.opciones, [opcionDe(bien), opcionDe(mal1), opcionDe(mal2)], `casilla ${k + 1}: opciones`);
  });
  /* T3, T7 y T9, de la sección (2); los demás, de (1). */
  const nuevo = (t) => filas2.find((c) => c[0] === t || c[0].startsWith(`${t} ·`))?.[2];
  for (let k = 1; k <= 10; k++) assert.equal(D.ERRORES_T6_ACT5[`T${k}`], nuevo(`T${k}`) ?? filaTipo(`T${k}`)[1], `T${k}`);
  /* Cada tipo de error se usa en una casilla, y solo en una. */
  const usados = C.flatMap((c) => c.opciones.map((o) => o.tipo).filter(Boolean));
  assert.deepEqual([...usados].sort(), Object.keys(D.ERRORES_T6_ACT5).sort());
});

test("auditoría: las devoluciones T3 y T7 ya no copian B·C15 ni B·C12 de b5-t6-a2", async () => {
  const A2 = readFileSync(new URL("../../../orquestador/conocimiento/paquetes/b5-t6-act2.md", import.meta.url), "utf8");
  for (const t of ["T3", "T7", "T9"]) assert.ok(!A2.includes(D.ERRORES_T6_ACT5[t]), `${t} está en el paquete de b5-t6-a2`);
  assert.match(D.T6_ACT5.partida, /El Torito Currambero/);
});

test("★★★ las cuentas cuadran con el libro: neto, lo que faltó, el ajuste y el saldo final", () => {
  const [neto, castigo, falta, ajuste, saldo] = C.map(correctaDe);
  const [deben, provision, pide] = [2655000, 148800, 153400];
  assert.equal(deben - provision, neto);
  assert.equal(castigo, 180000);
  assert.equal(castigo - provision, falta);
  assert.equal(pide + falta, ajuste);
  assert.equal(provision - castigo + ajuste, saldo);
  assert.equal(saldo, pide, "el saldo final es justo lo que pidió el análisis");
  assert.deepEqual(cifras(D.T6_ACT5.partida), [deben, provision, provision]);
});

test("★★★ las correctas son cifras del libro (El Torito, en nuestros datos); los cuatro distractores de Futaba no lo son", async () => {
  const libro = await listaNegraDelLibro();
  for (const c of C) assert.ok(libro.has(correctaDe(c)), `${pesos(correctaDe(c))} no es del libro`);
  const propios = C.flatMap((c) => c.opciones.filter((o) => o.tipo).map((o) => o.valor)).filter((v) => v && !libro.has(v)).sort((a, b) => a - b);
  assert.deepEqual(propios, D.DISTRACTORES_PROPIOS_T6_ACT5);
});

/* ═══════════ LO QUE SE VE ═══════════ */

test("★★★ en pantalla: la consigna, la regla, el punto de partida y la primera casilla con sus tres opciones", async () => {
  const { caja, desmontar } = await montar();
  assert.ok(caja.textContent.includes(D.T6_ACT5.consigna));
  assert.equal(caja.querySelector("[data-regla]").textContent, D.T6_ACT5.regla);
  assert.equal(caja.querySelector("[data-partida]").textContent, D.T6_ACT5.partida);
  assert.equal(caja.querySelector("[data-hecho]").textContent, C[0].enunciado);
  assert.deepEqual([...caja.querySelectorAll("[data-opcion]")].map((n) => n.textContent).sort(), C[0].opciones.map((o) => pesos(o.valor)).sort());
  desmontar();
});

test("★★★ cada error se ve literal; la correcta queda marcada; un solo intento; y el valor correcto entra al registro", async () => {
  for (let k = 0; k < C.length; k++) {
    for (const mala of C[k].opciones.filter((o) => o.tipo)) {
      const { caja, desmontar } = await montar();
      for (let j = 0; j < k; j++) { await tocar(opcion(caja, correctaDe(C[j]))); await siguiente(caja); }
      await tocar(opcion(caja, mala.valor));
      assert.equal(devolucion(caja), `❌${D.ERRORES_T6_ACT5[mala.tipo]}`, `casilla ${k + 1}, ${mala.tipo}`);
      assert.equal(opcion(caja, correctaDe(C[k])).dataset.estado, "revelada");
      await tocar(opcion(caja, correctaDe(C[k])));
      assert.equal(opcion(caja, correctaDe(C[k])).dataset.estado, "revelada", "un solo intento");
      /* La cuenta es el registro (hoja 1 de Mai): entra el valor correcto aunque se haya fallado. */
      const cuenta = caja.querySelector("[data-cuenta-que-se-llena]");
      const entraron = [...cuenta.querySelectorAll("[data-entra]")].map((e) => e.textContent).join(" | ");
      assert.ok(entraron.includes(pesos(correctaDe(C[k]))), `casilla ${k + 1}: entró «${entraron}»`);
      /* Lo que se anuncia es lo que entró: el valor correcto (el elegido mal puede estar ya en la cuenta, como el ajuste de la T9). */
      assert.ok(cuenta.querySelector("[data-anuncio]").textContent.includes(pesos(correctaDe(C[k]))), `casilla ${k + 1}: el anuncio`);
      desmontar();
    }
  }
});

/* ═══════════ LA CUENTA QUE SE LLENA (hoja 1 de Mai, calidad) ═══════════ */

const P3 = await import("../../data/contabilidadT6Pieza3.js");
const { estadoDeLaCuenta, anuncioDe: anuncioDeLaCuenta } = await import("../../components/mecanicas/libros/tema6/CuentaQueSeLlena.jsx");

test("★★★ la cuenta se llena casilla a casilla con las cifras de las casillas, y sus palabras son las publicadas de T6 · A3", async () => {
  const [dic, marzo, sig] = P3.MOMENTOS_T6_A3;
  /* Lo que entra en cada casilla es su valor correcto: neto, castigo, lo que falta, el ajuste y el saldo final. */
  assert.deepEqual([P3.ESCENA_T6_A3.valorNeto, marzo.monto, marzo.saldo.texto, sig.monto, sig.saldo.texto].map((t) => cifras(t)[0]), C.map(correctaDe));
  assert.equal(cifras(dic.monto)[0], 148800, "arranca con el tutorial");
  const { caja, desmontar } = await montar();
  const cuenta = () => caja.querySelector("[data-cuenta-que-se-llena]");
  const activo = () => cuenta().querySelector("[data-renglon-activo]");
  const saldo = () => cuenta().querySelector("[data-saldo]");
  /* Casilla 1: se enciende la fila del neto; el saldo es el de 2007, bajo HABER. */
  assert.ok(activo().hasAttribute("data-fila-neto"));
  assert.equal(saldo().dataset.saldo, "normal");
  assert.equal(saldo().textContent, dic.saldo.texto);
  await tocar(opcion(caja, correctaDe(C[0]))); await siguiente(caja);
  /* Casilla 2: un renglón nuevo del DEBE, encendido, con su momento y sin monto. */
  assert.equal(activo().closest("[data-columna]").dataset.columna, "debe");
  assert.equal(activo().textContent, marzo.nombre);
  await tocar(opcion(caja, correctaDe(C[1]))); await siguiente(caja);
  /* Casilla 3: el hueco del saldo a todo el ancho, sin lado. */
  assert.equal(activo().dataset.saldo, "hueco");
  assert.equal(activo().closest("[data-columna]"), null, "el hueco no está bajo ningún lado");
  await tocar(opcion(caja, correctaDe(C[2])));
  assert.equal(cuenta().querySelector("[data-saldo]").dataset.saldo, "en-contra");
  assert.equal(cuenta().querySelector("[data-saldo]").textContent, marzo.saldo.texto);
  await siguiente(caja);
  /* Casilla 4: un renglón nuevo del HABER. */
  assert.equal(activo().closest("[data-columna]").dataset.columna, "haber");
  await tocar(opcion(caja, correctaDe(C[3]))); await siguiente(caja);
  /* Casilla 5: el hueco otra vez; al responder, el saldo bajo HABER y el recuadro en contra se va. */
  assert.equal(activo().dataset.saldo, "hueco");
  await tocar(opcion(caja, correctaDe(C[4])));
  assert.deepEqual([...cuenta().querySelectorAll("[data-saldo]")].map((x) => x.dataset.saldo), ["normal"]);
  assert.equal(saldo().textContent, sig.saldo.texto);
  assert.equal(cuenta().querySelector("[data-renglon-activo]"), null, "respondida, nada encendido");
  desmontar();
});

test("★★ el lado se lee por la palabra y la columna, no solo por el color; el anuncio dice lo que entró", () => {
  const e = estadoDeLaCuenta(2, 2);
  assert.equal(e.huecoSaldo, true);
  assert.equal(e.saldo, null, "mientras se pregunta, ningún saldo con lado");
  assert.deepEqual([0, 1, 2, 3, 4].map(anuncioDeLaCuenta), [
    "El valor neto, $2.506.200",
    "Debe, $180.000, Marzo del año siguiente",
    "Le faltan $31.200",
    "Haber, $184.600, 31 de diciembre del año siguiente",
    "El saldo queda en $153.400",
  ]);
});

test("★★★ pct = aciertos / 5 × 100 y el cierre literal", async () => {
  const m = await montar();
  for (let k = 0; k < C.length; k++) {
    const v = k < 3 ? correctaDe(C[k]) : C[k].opciones.find((o) => o.tipo).valor;
    await tocar(opcion(m.caja, v));
    await siguiente(m.caja);
  }
  assert.equal(m.pct(), 60);
  assert.equal(m.caja.querySelector("[data-cierre-texto]").textContent, D.T6_ACT5.cierre);
  m.desmontar();
});

test("★★ el modo demo: una casilla, sin encabezado ni punto de partida; nunca completa", async () => {
  let llamado = false;
  const m = await montar({ items: [C[0]], modoDemo: true, onCompletar: () => { llamado = true; } });
  assert.equal(m.caja.querySelector("[data-partida]"), null);
  await tocar(opcion(m.caja, correctaDe(C[0])));
  assert.equal(llamado, false);
  m.desmontar();
});

test("★★ la mecánica de Macro no se toca: b5/CasillasEnOrden.jsx es la copia de la célula; dificultad y FP de Sakuta", () => {
  const copia = readFileSync(new URL("../../components/mecanicas/libros/b5/CasillasEnOrden.jsx", import.meta.url), "utf8");
  assert.doesNotMatch(copia, /pmFabricaDelDinero|ESCALERA|fabricaDelDinero\.jsx"/, "la copia no depende de Macro");
  assert.deepEqual([D.T6_ACT5.id, D.T6_ACT5.dificultad, D.T6_ACT5.fpBase], ["b5-t6-a5", "medio", 25]);
  assert.match(GUIA, /medio · 25 FP/);
});

test("★★ hoja de Mai: las opciones con cifras van en una columna (en fila de tres, a 320, «$2.506.200» no cabe)", async () => {
  const { caja, desmontar } = await montar();
  const span = caja.querySelector("[data-opcion]");
  assert.equal(span.closest("[style*='grid-template-columns']").style.gridTemplateColumns, "minmax(0, 1fr)");
  desmontar();
});
