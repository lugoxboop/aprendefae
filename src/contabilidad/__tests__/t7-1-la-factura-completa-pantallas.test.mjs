import { test } from "node:test";
import assert from "node:assert/strict";
import { readFileSync, readdirSync } from "node:fs";
import { JSDOM, VirtualConsole } from "jsdom";

/*
 * ═══════════════════════════════════════════════════════════════════════════
 * T7-1 · AP2 «La factura completa», montada con la «Figura de AP2» de Watari.
 *
 *   · cada pantalla y cada estado muestran exactamente sus textos
 *   · P2: el asiento trae «Compras · 5.000.000» resuelta; el cálculo de la
 *     retención aparece con el acierto
 *   · P3 y P4: una línea a la vez; el total con «?» hasta el acierto; el error
 *     debajo de su línea; «Probar otra» devuelve solo las mal puestas; sumas
 *     solo al acertar; al acertar, la frase de cada cuenta debajo de su línea
 *     y la venta en el orden de su asiento completo
 *   · P5: la tabla lado a lado con la fila de la retención señalada; P6: la
 *     misma tabla sin señal; y las dos son la tabla de la v2, celda por celda
 *   · el error lleva a «Probar otra» y el acierto a «Seguir»
 *   · fuera del catálogo de FP; va en T7-1 después de AP1
 *
 * El ancho a 375 y 320 lo mide scripts/t7/medir-t7-1-ap2.mjs en Chromium.
 * ═══════════════════════════════════════════════════════════════════════════
 */

const dom = new JSDOM("<!doctype html><html><body></body></html>", { url: "http://localhost/", virtualConsole: new VirtualConsole() });
const w = dom.window;
w.matchMedia = () => ({ matches: false, addEventListener() {}, removeEventListener() {}, addListener() {}, removeListener() {} });
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

const A = await import("../../data/contabilidadT7_1_ap2.js");
const { SUBJECTS, APRENDER } = await import("../../data/subjects.js");
const { default: Factura } = await import("../../components/mecanicas/libros/t7/LaFacturaCompleta.jsx");
const { PIEZAS_T7_1, TEMA_T7_1 } = await import("../../components/ContabilidadT7_1View.jsx");

const RAIZ = new URL("../../../", import.meta.url);
const P = A.PIEZA_LA_FACTURA_COMPLETA;
const pantalla = (id) => P.pantallas.find((x) => x.id === id);
const conPieza = (...ids) => ({ ...P, pantallas: ids.map(pantalla) });

const montar = async (el) => {
  const caja = document.createElement("div");
  document.body.appendChild(caja);
  const raiz = createRoot(caja);
  await act(async () => { raiz.render(el); });
  return { caja, desmontar: () => { act(() => raiz.unmount()); caja.remove(); } };
};
const tocar = async (el) => {
  assert.ok(el, "no está el elemento que se quería tocar");
  await act(async () => { el.dispatchEvent(new w.MouseEvent("click", { bubbles: true })); });
};
const boton = (caja, n) => caja.querySelector(`[data-boton="${n}"]`);
const activos = (caja) => [...caja.querySelectorAll("[data-boton]")].filter((b) => b.getAttribute("aria-disabled") !== "true").map((b) => b.textContent);
const estado = (caja) => caja.querySelector("[data-estado]")?.dataset.estado ?? null;
const casilla = (caja, linea, lado) => caja.querySelector(`[data-linea="${linea}"][data-lado="${lado}"]`);
const filas = (caja) => [...caja.querySelectorAll("[data-fila]")].map((f) => f.dataset.fila);
const otro = (lado) => (lado === A.DEBE ? A.HABER : A.DEBE);

function enPantalla(caja) {
  const out = [];
  const opciones = [];
  for (const el of caja.querySelector("[data-pieza]").querySelectorAll("[data-texto], [data-opcion], [data-boton], [data-pie], [data-palabra]")) {
    if (el.matches("[data-opcion]")) { opciones.push(el.textContent); continue; }
    out.push(el.textContent);
  }
  return { textos: out, opciones: opciones.sort() };
}

/* ═══════════ CADA PANTALLA Y CADA ESTADO ═══════════ */

test("★★★ cada pantalla y cada estado muestran exactamente sus textos", async () => {
  const m = await montar(h(Factura, { rotulo: "R" }));
  const vistos = [];
  try {
    for (const p of P.pantallas) {
      assert.equal(m.caja.querySelector("[data-pieza]").dataset.pantalla, p.id);
      if (["portada", "lectura", "resumen"].includes(p.tipo)) {
        assert.deepEqual(enPantalla(m.caja).textos, [p.objetivo, ...(p.parrafos ?? []), p.siguiente, p.boton, p.pie].filter(Boolean), p.id);
        vistos.push(p.id);
        if (p.boton) await tocar(m.caja.querySelector("[data-boton]"));
        continue;
      }
      const cab = [p.enunciado, ...(p.calculos ?? [])].filter(Boolean);
      if (p.tipo === "eleccion") {
        const ops = p.opciones.map((o) => o.texto).sort();
        assert.deepEqual(enPantalla(m.caja), { textos: [...cab, p.pregunta, A.BOTON.confirmar, p.pie], opciones: ops }, `${p.id} colocando`);
        vistos.push(`${p.id}:colocando`);
        for (const o of p.opciones.filter((x) => !x.correcta)) {
          await tocar(m.caja.querySelector(`[data-opcion="${o.id}"]`));
          await tocar(boton(m.caja, "confirmar"));
          assert.deepEqual(enPantalla(m.caja), { textos: [...cab, p.pregunta, A.INTERFAZ.incorrecto, o.devolucion, A.BOTON.probarOtra, p.error.pie], opciones: ops }, `${p.id} error ${o.id}`);
          vistos.push(`${p.id}:error:${o.id}`);
          await tocar(boton(m.caja, "probar-otra"));
        }
        await tocar(m.caja.querySelector(`[data-opcion="${p.opciones.find((x) => x.correcta).id}"]`));
        await tocar(boton(m.caja, "confirmar"));
        assert.deepEqual(enPantalla(m.caja), { textos: [...cab, ...(p.acierto.calculos ?? []), p.pregunta, A.INTERFAZ.correcto, ...p.acierto.textos, A.BOTON.seguir, p.acierto.pie], opciones: ops }, `${p.id} acierto`);
        vistos.push(`${p.id}:acierto`);
        await tocar(boton(m.caja, "seguir"));
        continue;
      }
      /* Asiento: todo al revés, luego todo bien. */
      assert.deepEqual(enPantalla(m.caja).textos, [...cab, p.consigna, A.BOTON.confirmar, p.pie], `${p.id} colocando`);
      vistos.push(`${p.id}:colocando`);
      for (const l of p.lineas) await tocar(casilla(m.caja, l.id, otro(l.lado)));
      await tocar(boton(m.caja, "confirmar"));
      assert.deepEqual(enPantalla(m.caja).textos, [...cab, p.consigna, ...p.lineas.flatMap((l) => [A.INTERFAZ.incorrecto, l.devolucion]), A.BOTON.probarOtra, p.error.pie], `${p.id} error`);
      vistos.push(`${p.id}:error`);
      await tocar(boton(m.caja, "probar-otra"));
      for (const l of p.lineas) await tocar(casilla(m.caja, l.id, l.lado));
      await tocar(boton(m.caja, "confirmar"));
      const notas = p.acierto.orden.map((id) => p.acierto.textos[p.acierto.notas[id]]);
      assert.deepEqual(enPantalla(m.caja).textos, [...cab, p.consigna, ...notas, A.INTERFAZ.correcto, p.acierto.textos[0], A.BOTON.seguir, p.acierto.pie], `${p.id} acierto`);
      vistos.push(`${p.id}:acierto`);
      await tocar(boton(m.caja, "seguir"));
    }
    /* Portada, P1 y resumen + 2 preguntas (P2: 3 estados; P5: 4) + 2 asientos (3 estados). */
    assert.equal(vistos.length, 3 + 3 + 4 + 6);
  } finally {
    m.desmontar();
  }
});

test("★★★ el error lleva a «Probar otra» y el acierto a «Seguir»", async () => {
  for (const id of ["base-de-la-retencion", "lado-a-lado", "lados-de-la-compra", "la-venta"]) {
    const p = pantalla(id);
    const m = await montar(h(Factura, { pieza: conPieza(id, "resumen"), rotulo: "R" }));
    try {
      assert.equal(boton(m.caja, "confirmar").getAttribute("aria-disabled"), "true");
      if (p.tipo === "eleccion") {
        await tocar(m.caja.querySelector(`[data-opcion="${p.opciones.find((o) => !o.correcta).id}"]`));
      } else {
        for (const l of p.lineas) await tocar(casilla(m.caja, l.id, otro(l.lado)));
      }
      await tocar(boton(m.caja, "confirmar"));
      assert.deepEqual(activos(m.caja), ["Probar otra"], id);
      await tocar(boton(m.caja, "probar-otra"));
      if (p.tipo === "eleccion") {
        await tocar(m.caja.querySelector(`[data-opcion="${p.opciones.find((o) => o.correcta).id}"]`));
      } else {
        for (const l of p.lineas) await tocar(casilla(m.caja, l.id, l.lado));
      }
      await tocar(boton(m.caja, "confirmar"));
      assert.deepEqual(activos(m.caja), ["Seguir"], id);
    } finally {
      m.desmontar();
    }
  }
});

/* ═══════════ LA FIGURA ═══════════ */

test("★★★ P2: el asiento trae Compras resuelta y el cálculo de la retención llega con el acierto", async () => {
  const m = await montar(h(Factura, { pieza: conPieza("base-de-la-retencion"), rotulo: "R" }));
  try {
    const compras = m.caja.querySelector("[data-fila=compras][data-resuelta]");
    assert.ok(compras, "falta la línea resuelta de Compras");
    /* «Compras · Debe $5.000.000» de la v2, repartida: la cuenta, el lado y el monto sin «$». */
    const [cuenta, ladoMonto] = pantalla("base-de-la-retencion").lineaResuelta.split(" · ");
    assert.equal(compras.querySelector(".t7a2-cuenta").textContent, cuenta);
    const [lado, montoTxt] = ladoMonto.split(" ");
    const llena = compras.querySelector(".t7a2-cas-ok");
    assert.match(llena.getAttribute("aria-label"), new RegExp(`${lado}, ${montoTxt.replace("$", "").replace(/\./g, "\\.")}$`));
    assert.equal(llena.textContent, montoTxt.replace("$", ""));
    assert.equal(compras.querySelector("button") === null, true, "la línea resuelta se puede tocar");
    const calcs = () => [...m.caja.querySelectorAll("[data-calculo]")].map((c) => c.textContent);
    assert.deepEqual(calcs(), ["IVA = $5.000.000 × 16 % = $800.000"]);
    await tocar(m.caja.querySelector('[data-opcion="con-iva"]'));
    await tocar(boton(m.caja, "confirmar"));
    assert.deepEqual(calcs(), ["IVA = $5.000.000 × 16 % = $800.000"], "el cálculo de la retención llega antes del acierto");
    await tocar(boton(m.caja, "probar-otra"));
    await tocar(m.caja.querySelector('[data-opcion="sin-iva"]'));
    await tocar(boton(m.caja, "confirmar"));
    assert.deepEqual(calcs(), ["IVA = $5.000.000 × 16 % = $800.000", "Retención = $5.000.000 × 3,5 % = $175.000"]);
    assert.deepEqual([...m.caja.querySelectorAll("[data-calculo] b")].map((b) => b.textContent), ["$800.000", "$175.000"]);
  } finally {
    m.desmontar();
  }
});

test("★★★ asiento: una línea a la vez, «?» hasta el acierto, error en su línea, sumas solo al acertar, frases bajo cada línea", async () => {
  const p = pantalla("lados-de-la-compra");
  const m = await montar(h(Factura, { pieza: conPieza("lados-de-la-compra", "resumen"), rotulo: "R" }));
  try {
    assert.equal(m.caja.querySelector("[data-fecha]").textContent, "16 de abril");
    /* Compras viene resuelta arriba; de las que se colocan, se ve una. */
    assert.deepEqual(filas(m.caja), ["compras", "iva"]);
    for (const [k, l] of p.lineas.entries()) {
      await tocar(casilla(m.caja, l.id, l.id === "retencion" ? otro(l.lado) : l.lado));
      assert.equal(filas(m.caja).length, Math.min(k + 3, 4));
    }
    /* El total con «?», en su casilla. */
    assert.equal(casilla(m.caja, "proveedores", A.HABER).textContent, "?");
    assert.equal(m.caja.querySelector("[data-sumas]") === null, true, "sumas antes del acierto");
    await tocar(boton(m.caja, "confirmar"));
    assert.equal(estado(m.caja), "error");
    assert.equal(m.caja.querySelector("[data-sumas]") === null, true, "sumas en el error");
    assert.equal(casilla(m.caja, "proveedores", A.HABER).textContent, "?", "el total se ve en el error");
    const enLinea = m.caja.querySelector('[data-fila="retencion"] [data-mensaje=error] p');
    assert.equal(enLinea.textContent, p.lineas.find((l) => l.id === "retencion").devolucion);
    assert.equal(m.caja.querySelectorAll("[data-mensaje=error]").length, 1);
    assert.match(casilla(m.caja, "retencion", A.DEBE).getAttribute("aria-label"), /incorrecto$/);
    await tocar(boton(m.caja, "probar-otra"));
    assert.equal(casilla(m.caja, "retencion", A.DEBE).dataset.llena, "no");
    assert.equal(casilla(m.caja, "iva", A.DEBE).dataset.llena, "si", "«Probar otra» devolvió una línea bien puesta");
    await tocar(casilla(m.caja, "retencion", A.HABER));
    await tocar(boton(m.caja, "confirmar"));
    assert.equal(estado(m.caja), "acierto");
    assert.equal(casilla(m.caja, "proveedores", A.HABER).textContent, "5.625.000");
    assert.deepEqual([...m.caja.querySelectorAll("[data-suma]")].map((s) => s.textContent), ["5.800.000", "5.800.000"]);
    for (const l of p.lineas) {
      assert.equal(m.caja.querySelector(`[data-fila="${l.id}"] [data-nota]`).textContent, p.acierto.textos[p.acierto.notas[l.id]], `${l.id}: su frase no está debajo`);
      assert.ok(casilla(m.caja, l.id, otro(l.lado)).classList.contains("t7a2-cas-nada"));
    }
    assert.deepEqual([...m.caja.querySelectorAll("[data-mensaje=acierto] p")].map((x) => x.textContent), [p.acierto.textos[0]]);
  } finally {
    m.desmontar();
  }
});

test("★★ la venta pasa al orden de su asiento completo al acertar", async () => {
  const p = pantalla("la-venta");
  const m = await montar(h(Factura, { pieza: conPieza("la-venta"), rotulo: "R" }));
  try {
    for (const l of p.lineas) await tocar(casilla(m.caja, l.id, l.lado));
    assert.deepEqual(filas(m.caja), p.lineas.map((l) => l.id), "antes del acierto, el orden de la v2");
    await tocar(boton(m.caja, "confirmar"));
    assert.deepEqual(filas(m.caja), p.acierto.orden);
    /* El orden del acierto es el del asiento completo de la v2. */
    const asiento = p.acierto.asiento.lineas.map((x) => x.cuenta);
    assert.deepEqual(p.acierto.orden.map((id) => p.lineas.find((l) => l.id === id).texto.split(" · ")[0]), asiento);
    assert.deepEqual([...m.caja.querySelectorAll("[data-suma]")].map((s) => s.textContent), ["2.320.000", "2.320.000"]);
  } finally {
    m.desmontar();
  }
});

test("★★★ la tabla lado a lado es la de la v2, con la retención señalada en P5 y sin señal en P6", async () => {
  const t = pantalla("lado-a-lado").tabla;
  for (const [id, foco] of [["lado-a-lado", ["Retención"]], ["resumen", []]]) {
    const m = await montar(h(Factura, { pieza: conPieza(id), rotulo: "R" }));
    try {
      const tabla = m.caja.querySelector("[data-lado-a-lado]");
      assert.equal(tabla.getAttribute("aria-label"), "La compra y la venta, lado a lado");
      assert.deepEqual([...tabla.querySelectorAll("[role=columnheader]")].map((c) => c.textContent), ["Impuesto", ...t.columnas.slice(1)]);
      /* Cada celda, leída como «Lado (cuenta)», es la celda de la v2. */
      const leidas = [...tabla.querySelectorAll("[data-fila-lal]")].map((f) => [
        f.querySelector("[role=rowheader]").textContent,
        ...[...f.querySelectorAll("[role=cell]")].map((c) => `${c.firstChild.textContent} (${c.lastChild.textContent})`),
      ]);
      assert.deepEqual(leidas, t.filas, id);
      assert.deepEqual([...tabla.querySelectorAll("[data-fila-lal]")].filter((f) => f.querySelector(".t7a2-foco")).map((f) => f.dataset.filaLal), foco, id);
      for (const l of tabla.querySelectorAll(".t7a2-lal-lado")) assert.ok(l.classList.contains(l.textContent === "Debe" ? "t7a2-d" : "t7a2-h"));
    } finally {
      m.desmontar();
    }
  }
});

test("★★★ fuera del catálogo de FP; id t7-; va en T7-1 después de AP1", () => {
  const tema = SUBJECTS.contabilidad.topics.find((t) => t.id === TEMA_T7_1);
  const a = tema.actividades.find((x) => x.id === A.AP2_ID);
  assert.deepEqual(a.clasificacion, { tipo: APRENDER });
  assert.equal(a.nombre, P.titulo);
  const ids = tema.actividades.map((x) => x.id);
  assert.equal(ids.indexOf(A.AP2_ID), ids.indexOf("t7-1-a1-la-cuenta-que-no-se-mueve") + 1);
  assert.ok(PIEZAS_T7_1.some((x) => x.pieza.id === A.AP2_ID));
  const dir = new URL("supabase/migrations/", RAIZ);
  assert.deepEqual(readdirSync(dir).filter((f) => readFileSync(new URL(f, dir), "utf8").includes(A.AP2_ID)), []);
  const src = readFileSync(new URL("src/components/mecanicas/libros/t7/LaFacturaCompleta.jsx", RAIZ), "utf8");
  assert.doesNotMatch(src, /from\s+["'][^"']*\/(fp|lib\/supabase)[^"']*["']|registrarActividad(Completada)?\s*\(|\.rpc\s*\(/);
});

test("★★ sin la renta, sin cifras de medición del patrón y sin nada interno en pantalla", async () => {
  const m = await montar(h(Factura, { rotulo: "R" }));
  try {
    const todo = m.caja.textContent;
    assert.doesNotMatch(JSON.stringify(P), /33 ?%|renta/i);
    for (const x of ["45.793.000", "interno", "Near", "Mello", "Watari", "(p. "]) assert.ok(!todo.includes(x), x);
  } finally {
    m.desmontar();
  }
});
