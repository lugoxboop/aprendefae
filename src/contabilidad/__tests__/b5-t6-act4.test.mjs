import { test, beforeEach } from "node:test";
/* D8 (lote 18): cada prueba arranca en la vuelta 1 (la de hoy); la segunda vuelta tiene su propia prueba. */
beforeEach(() => { try { globalThis.window?.localStorage?.clear(); } catch { /* sin almacenamiento */ } });
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { JSDOM, VirtualConsole } from "jsdom";

/*
 * ═══════════════════════════════════════════════════════════════════════════
 * TEMA 6 · HACER 4 — «¿Qué se debita?» (Célula B, b5-t6-a4).
 *
 *   · todo texto es literal del paquete (paquetes/b5-t6-act4.md): consigna,
 *     nota fija, regla, opciones, reglas de «¿Cómo se juega?», tutorial,
 *     cierre, texto alternativo, los 10 hechos con su correcta y su acierto,
 *     y los nueve errores
 *   · cada opción equivocada de cada hecho lleva el error que dice la columna
 *     «Cuándo» de Futaba, y todas las equivocadas tienen uno
 *   · el patrón de «¿Por Cuál Arteria Entra?»: opciones fijas en su orden, un
 *     intento, la correcta marcada al fallar, pct = aciertos / 10 × 100
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

const { default: QueSeDebita } = await import("../../components/mecanicas/libros/tema6/QueSeDebita.jsx");
const { MarcoLibros } = await import("../../components/mecanicas/bloques/marcos.jsx");
const L = await import("../t6Act4.js");
const D = await import("../../data/contabilidadT6Act4.js");
const { FAE } = await import("../../theme.js");

const IDS = ["qd-01", "qd-02", "qd-03", "qd-04", "qd-05", "qd-06", "qd-07", "qd-08", "qd-09", "qd-10"];
const hecho = (id) => D.HECHOS_T6_ACT4.find((x) => x.id === id);

const montar = async (items, props = {}) => {
  const caja = document.createElement("div");
  document.body.appendChild(caja);
  const raiz = createRoot(caja);
  let pct = null;
  await act(async () => {
    raiz.render(h(QueSeDebita, { Marco: MarcoLibros, rotulo: "PRUEBA", titulo: "Prueba", acento: FAE.ambar, onCompletar: (p) => { pct = p; }, items, ...props }));
  });
  return { caja, pct: () => pct, desmontar: () => { act(() => raiz.unmount()); caja.remove(); } };
};
const tocar = async (el) => { assert.ok(el, "no hay nada que tocar"); await act(async () => { el.dispatchEvent(new w.MouseEvent("click", { bubbles: true })); }); };
const opcion = (caja, id) => caja.querySelector(`[data-opcion="${id}"]`).closest("button");
/* Lote 6d: el bloque de mensaje del estándar único; se lee su texto visible, sin el «Incorrecto.» del lector. */
const devolucion = (caja) => {
  const p = caja.querySelector('[role="status"] [data-devolucion]');
  return p ? [...p.childNodes].filter((n) => !(n.dataset && "lector" in n.dataset)).map((n) => n.textContent).join("") : null;
};

/* ═══════════ EL PAQUETE ═══════════ */

const GUIA = readFileSync(new URL("../../../orquestador/conocimiento/paquetes/b5-t6-act4.md", import.meta.url), "utf8");
const FUTABA = GUIA.slice(GUIA.indexOf("## (1) Futaba"), GUIA.indexOf("## (2) Futaba"));
/* La sección (2): las líneas que Shoko pasó y Futaba aplicó. Mandan sobre (1), por id y campo. */
const SECCION_2 = GUIA.slice(GUIA.indexOf("## (2) Futaba"));
/* La línea más nueva manda: la sección (2) y, después, la entrega 5 de calidad. */
const cambio = (id, campo) => SECCION_2.split("\n").map((l) => l.split("\t")).findLast((c) => c[0] === id && c[1] === campo)?.[2];
const filas = FUTABA.split("\n").map((l) => l.split("\t"));
const fila = (primera) => filas.find((c) => c[0] === primera);
const filaError = (tipo) => filas.find((c) => c[0] === tipo || c[0].startsWith(`${tipo} ·`));
const NOMBRE_CORTO = { [D.A_CLIENTES]: "Clientes", [D.A_CAJA]: "Caja", [D.A_GASTO]: "Gasto", [D.A_PROVISION]: "Provisión" };

test("auditoría: qd-03, qd-04, qd-06 y qd-09 llevan el hecho de la sección (2); qd-06 ya no nombra la provisión como cuenta", () => {
  for (const id of ["qd-03", "qd-04", "qd-06", "qd-09"]) assert.equal(hecho(id).texto, cambio(id, "Hecho"), id);
  assert.doesNotMatch(hecho("qd-06").texto, /Provisión para deudas/);
});

test("guarda: el paquete trae los 10 hechos y los 9 errores, y una fila inventada no aparece", () => {
  for (const id of IDS) assert.ok(fila(id), id);
  for (let k = 1; k <= 9; k++) assert.ok(filaError(`E${k}`), `E${k}`);
  /* E10 (entrega 1), en su sección del paquete, literal. */
  assert.ok(GUIA.includes(`E10 · qd-09 con Caja\tCaja en qd-09\t${D.ERRORES_T6_ACT4.E10}`));
  assert.equal(fila("qd-99"), undefined);
});

test("★★★ los textos fijos son los del paquete: consigna, nota, regla, opciones, reglas, tutorial, cierre y texto alternativo", () => {
  assert.equal(D.T6_ACT4.consigna, fila("Consigna")[1]);
  assert.equal(D.T6_ACT4.nota, fila("Nota fija bajo la consigna")[1]);
  assert.equal(D.T6_ACT4.regla, fila("Regla fija")[1]);
  assert.equal(D.OPCIONES_T6_ACT4.map((o) => o.nombre).join(" · "), fila("Opciones fijas")[1]);
  D.REGLAS_T6_ACT4.forEach((r, k) => assert.equal(r, fila(`Así se juega, ${k + 1}`)[1]));
  assert.equal(D.EJEMPLO_T6_ACT4.texto, fila("Tutorial · hecho")[1]);
  assert.equal(D.EJEMPLO_T6_ACT4.acierto, fila("Tutorial · resolución")[1]);
  assert.equal(D.T6_ACT4.cierre, fila("Cierre")[1]);
  assert.equal(D.ALT_T6_ACT4, fila("Texto alternativo")[1]);
  assert.ok(!D.HECHOS_T6_ACT4.some((x) => x.texto === D.EJEMPLO_T6_ACT4.texto), "el tutorial no está en el banco");
});

test("★★★ los 10 hechos: el texto, la correcta y el acierto son los del paquete; 3 de Clientes, 3 de Caja, 2 de Gasto y 2 de Provisión", () => {
  assert.deepEqual(D.HECHOS_T6_ACT4.map((x) => x.id), IDS);
  for (const id of IDS) {
    const [, original, correcta, acierto] = fila(id);
    const texto = cambio(id, "Hecho") ?? original;
    const x = hecho(id);
    assert.deepEqual([x.texto, NOMBRE_CORTO[x.respuesta], x.acierto], [texto, correcta, acierto], id);
  }
  const cuenta = (r) => D.HECHOS_T6_ACT4.filter((x) => x.respuesta === r).length;
  assert.deepEqual([D.A_CLIENTES, D.A_CAJA, D.A_GASTO, D.A_PROVISION].map(cuenta), [3, 3, 2, 2]);
});

test("★★★ los 9 errores son los del paquete, y cada uno va donde dice la columna «Cuándo» de Futaba", () => {
  /* «Cuándo»: «<opción elegida> donde va … (qd-06, qd-07)» o «… (qd-01 a qd-04, qd-09, qd-10)». */
  const idsDe = (cuando) => {
    const dentro = cuando.slice(cuando.lastIndexOf("(") + 1, cuando.lastIndexOf(")"));
    return dentro.split(", ").flatMap((t) => {
      const [a, b] = t.split(" a ");
      if (!b) return [a];
      const [i, j] = [a, b].map((x) => Number(x.slice(3)));
      return Array.from({ length: j - i + 1 }, (_, k) => `qd-${String(i + k).padStart(2, "0")}`);
    });
  };
  const elegidasDe = (cuando) => {
    const inicio = cuando.split(/ (donde|en|al) /)[0];
    return Object.entries(NOMBRE_CORTO).filter(([, n]) => inicio.split(" o ").includes(n)).map(([id]) => id);
  };
  const cubiertas = new Set();
  for (let k = 1; k <= 9; k++) {
    const tipo = `E${k}`;
    const [, cuando, texto] = filaError(tipo);
    assert.equal(D.ERRORES_T6_ACT4[tipo], texto, `${tipo}: texto`);
    const elegidas = elegidasDe(cuando);
    assert.ok(elegidas.length, `${tipo}: no sé qué opción nombra «${cuando}»`);
    for (const id of idsDe(cuando)) {
      for (const e of elegidas) {
        /* Entrega 1 de Futaba: qd-09 con Caja deja E5 y pasa a E10, su devolución propia. */
        if (id === "qd-09" && e === D.A_CAJA && tipo === "E5") { assert.equal(hecho(id).errores[e], "E10"); cubiertas.add(`${id}:${e}`); continue; }
        assert.equal(hecho(id).errores[e], tipo, `${id} con ${NOMBRE_CORTO[e]}`);
        cubiertas.add(`${id}:${e}`);
      }
    }
  }
  /* Y ninguna opción equivocada se queda sin su error. */
  for (const x of D.HECHOS_T6_ACT4) {
    for (const o of D.OPCIONES_T6_ACT4) {
      if (o.id === x.respuesta) assert.equal(x.errores[o.id], undefined, `${x.id}: la correcta no lleva error`);
      else assert.ok(cubiertas.has(`${x.id}:${o.id}`), `${x.id} con ${NOMBRE_CORTO[o.id]}: sin error`);
    }
  }
});

test("★★★ ninguna cifra: la actividad no lleva montos", () => {
  for (const x of [...D.HECHOS_T6_ACT4, D.EJEMPLO_T6_ACT4]) for (const t of [x.texto, x.acierto]) assert.doesNotMatch(t, /\$\d|\d{3}\.\d{3}/);
});

/* ═══════════ LO QUE SE VE ═══════════ */

test("★★★ en pantalla: el objetivo; plegadas bajo «¿Cómo se juega?», la consigna, los pasos, la nota y la regla; el asiento mínimo antes del hecho; y las cuatro cuentas, en su orden y sin barajar", async () => {
  const { caja, desmontar } = await montar([hecho("qd-01")]);
  /* Lote 6c (encabezado compacto y B1): lo fijo se pliega y la figura sube. */
  assert.equal(caja.querySelector("[data-objetivo]").textContent, D.T6_ACT4.objetivo);
  assert.ok(D.T6_ACT4.objetivo.split(/\s+/).length <= 20);
  assert.equal(caja.querySelector("[data-contador]").textContent, "Hecho 1 de 1");
  assert.equal(caja.querySelector("[data-consigna]"), null);
  assert.equal(caja.querySelector("[data-regla]"), null);
  await tocar(caja.querySelector("[data-como-se-juega]"));
  assert.equal(caja.querySelector("[data-consigna]").textContent, D.T6_ACT4.consigna);
  assert.deepEqual([...caja.querySelectorAll("[data-pasos] li")].map((li) => li.textContent), D.REGLAS_T6_ACT4);
  assert.deepEqual([...caja.querySelectorAll("[data-nota-plegada]")].map((n) => n.textContent), [D.T6_ACT4.nota, D.T6_ACT4.regla]);
  assert.ok(caja.querySelector("[data-asiento-minimo]").compareDocumentPosition(caja.querySelector("[data-hecho]")) & 4, "el asiento mínimo, antes del hecho");
  assert.deepEqual([...caja.querySelectorAll("[data-opcion]")].map((n) => n.textContent), D.OPCIONES_T6_ACT4.map((o) => o.nombre));
  assert.equal(caja.querySelector("[data-hecho]").textContent, hecho("qd-01").texto);
  desmontar();
});

test("★★★ cada acierto y cada error se ven literales; al fallar, la correcta queda marcada; un solo intento", async () => {
  for (const x of D.HECHOS_T6_ACT4) {
    for (const o of D.OPCIONES_T6_ACT4) {
      const { caja, desmontar } = await montar([x]);
      await tocar(opcion(caja, o.id));
      if (o.id === x.respuesta) {
        assert.equal(devolucion(caja), `Correcto. ${x.acierto}`, `${x.id}`);
        assert.equal(opcion(caja, o.id).dataset.estado, "correcta");
      } else {
        assert.equal(devolucion(caja), D.ERRORES_T6_ACT4[x.errores[o.id]], `${x.id} con ${o.id}`);
        assert.equal(opcion(caja, o.id).dataset.estado, "incorrecta");
        assert.equal(opcion(caja, x.respuesta).dataset.estado, "revelada");
        /* E4 · lote 6d: la elegida «No va aquí» (X, 2 px coral) y tachada, junto a la correcta revelada «Iba aquí» (sin ícono); las demás, a 0,5. */
        const icono = (el) => [...el.querySelectorAll("svg[data-icono]")].map((y) => y.dataset.icono);
        assert.equal(opcion(caja, o.id).dataset.marca, "tachada");
        assert.deepEqual(icono(opcion(caja, o.id)), ["tache"]);
        assert.equal(opcion(caja, o.id).querySelector("[data-pastilla]").textContent, "No va aquí");
        assert.equal(opcion(caja, o.id).style.border, "2px solid rgb(231, 111, 81)");
        assert.equal(opcion(caja, x.respuesta).dataset.marca, "revelada");
        assert.deepEqual(icono(opcion(caja, x.respuesta)), []);
        assert.equal(opcion(caja, x.respuesta).querySelector("[data-pastilla]").textContent, "Iba aquí");
        assert.ok(opcion(caja, x.respuesta).classList.contains("fae-b5h-revelado"), "el borde de 2 px #F8F9FA, 0,7 s después");
        for (const y of D.OPCIONES_T6_ACT4) if (y.id !== o.id && y.id !== x.respuesta) assert.equal(opcion(caja, y.id).style.opacity, "0.5");
        /* Un solo intento: tocar la correcta ya no cambia nada. */
        await tocar(opcion(caja, x.respuesta));
        assert.equal(opcion(caja, x.respuesta).dataset.estado, "revelada");
      }
      desmontar();
    }
  }
});

test("★★★ el cierre: su texto literal y pct = aciertos / 10 × 100", async () => {
  const m = await montar([...D.HECHOS_T6_ACT4]);
  for (let k = 0; k < 10; k++) {
    const x = D.HECHOS_T6_ACT4[k];
    const o = k < 7 ? x.respuesta : D.OPCIONES_T6_ACT4.find((p) => p.id !== x.respuesta).id;
    await tocar(opcion(m.caja, o));
    await tocar([...m.caja.querySelectorAll("button")].at(-1));
  }
  assert.equal(m.pct(), 70);
  assert.equal(m.caja.querySelector("[data-cierre-texto]").textContent, D.T6_ACT4.cierre);
  m.desmontar();
});

test("★★ el modo demo: sin encabezado ni nota, con la regla y el ejemplo; nunca completa", async () => {
  let llamado = false;
  const m = await montar([D.EJEMPLO_T6_ACT4], { modoDemo: true, onCompletar: () => { llamado = true; } });
  assert.equal(m.caja.querySelector("[data-nota-fija]"), null);
  assert.ok(m.caja.querySelector("[data-regla]"));
  await tocar(opcion(m.caja, D.A_GASTO));
  assert.equal(devolucion(m.caja), `Correcto. ${D.EJEMPLO_T6_ACT4.acierto}`);
  assert.equal(llamado, false);
  m.desmontar();
});

test("★★ la mecánica de Macro no se toca: b5/EligeUnaOpcion.jsx es la copia de la célula", () => {
  const copia = readFileSync(new URL("../../components/mecanicas/libros/b5/EligeUnaOpcion.jsx", import.meta.url), "utf8");
  assert.doesNotMatch(copia, /monetariaRepaso|ARTERIA/, "la copia no depende de los datos de Macro");
  assert.deepEqual([D.T6_ACT4.id, D.T6_ACT4.dificultad, D.T6_ACT4.fpBase], ["b5-t6-a4", "medio", 25]);
  assert.match(GUIA, /medio · 25 FP/);
});

test("★★ hoja de Mai: las cuatro opciones van en una columna, en el orden de Futaba", async () => {
  const { caja, desmontar } = await montar([D.HECHOS_T6_ACT4[0]]);
  const spans = [...caja.querySelectorAll("[data-opcion]")];
  assert.deepEqual(spans.map((s) => s.dataset.opcion), D.OPCIONES_T6_ACT4.map((o) => o.id));
  assert.equal(spans[0].closest("[style*='grid-template-columns']").style.gridTemplateColumns, "minmax(0, 1fr)");
  desmontar();
});
