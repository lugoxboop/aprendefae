import { test } from "node:test";
import assert from "node:assert/strict";
import { readFileSync, readdirSync } from "node:fs";
import { JSDOM, VirtualConsole } from "jsdom";

/*
 * ═══════════════════════════════════════════════════════════════════════════
 * T7-2 · A2 «La venta en dos asientos» (Célula C).
 *
 *   · cada texto de los datos está, letra por letra, en la v1 de Near o en su
 *     corrección, y cada texto visible de las dos está en los datos, salvo el
 *     repaso de P2 que la corrección reemplaza
 *   · la corrección: el repaso de IVA y retención va en P1; P2, solo la venta
 *   · los dos asientos son las tablas de la v1 (E-1 con ●, E-2 completo)
 *   · X1 y regla 3: ninguna cifra de X1, ninguna suma
 *   · cada pantalla y cada estado muestran exactamente sus textos y su pie
 *   · fuera del catálogo de FP; en T7-2 después de A1
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

const A = await import("../../data/contabilidadT7_2_a2.js");
const { SUBJECTS, APRENDER } = await import("../../data/subjects.js");
const { textosDelError, textosDeLinea, pistaDeLinea } = await import("../../components/mecanicas/libros/t7/escaleraAyuda.js");
const { default: LaVentaEnDosAsientos } = await import("../../components/mecanicas/libros/t7/LaVentaEnDosAsientos.jsx");
const { PIEZAS_T7_2, TEMA_T7_2 } = await import("../../components/ContabilidadT7_2View.jsx");

const RAIZ = new URL("../../../", import.meta.url);
const leer = (f) => readFileSync(new URL(`orquestador/conocimiento/paquetes/${f}`, RAIZ), "utf8");
const V1 = leer("t7-2-a2-v1.md");
const CORR = leer("t7-2-a2-correccion.md");
const CONTENIDO = V1.slice(V1.indexOf("## Contenido"), V1.indexOf("## Erratas y nombres"));
const P = A.PIEZA_LA_VENTA_EN_DOS_ASIENTOS;

/*
 * El lote 2 de Near (pistas y anexo): sus textos valen como los del paquete,
 * pero solo los de esta pieza (su sección de pistas y sus filas del anexo).
 */
const LOTE2 = (f) => readFileSync(new URL(`orquestador/conocimiento/paquetes/lote2-${f}-v1.md`, RAIZ), "utf8");
let l2;
function L2() {
  if (l2 !== undefined) return l2;
  const pistas = LOTE2("pistas");
  const i = pistas.indexOf(`\n### ${P.id} · `);
  assert.ok(i >= 0, `${P.id} no tiene sección en el lote 2`);
  const fin = pistas.slice(i + 1).search(/\n(### |\*\*Decisión)/);
  const seccion = fin < 0 ? pistas.slice(i) : pistas.slice(i, i + 1 + fin);
  l2 = [seccion, ...LOTE2("anexo").split("\n").filter((l) => l.startsWith(`| ${P.id} |`))].join("\n");
  return l2;
}
/* Las pistas del lote 2 para esta pieza: la tercera columna de su tabla. */
const pistasL2 = () => L2().split("\n").filter((l) => /^\| P\d/.test(l)).map((l) => l.split(" | ")[2].replace(/^«|»$/g, ""));
const pantalla = (id) => P.pantallas.find((x) => x.id === id);
const COMPRA = pantalla("la-compra");
const VENTA = pantalla("la-venta");
const SEGUNDO = pantalla("el-segundo-asiento");

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
const lado = (caja, linea, cual) => caja.querySelector(`[data-linea="${linea}"][data-lado="${cual}"]`);
const otro = (l) => (l === A.DEBE ? A.HABER : A.DEBE);
/* La ficha lleva el primer dato en mayúscula (convención de T7-1); la v1 lo escribe en minúscula. */
const minuscula = (t) => t[0].toLowerCase() + t.slice(1);

function textosVisibles() {
  const t = [P.titulo];
  for (const p of P.pantallas) {
    for (const k of ["objetivo", "enunciado", "repaso", "pregunta", "consigna", "boton", "pie", "siguiente", "cierre"]) if (p[k]) t.push(p[k]);
    t.push(...(p.parrafos ?? []), ...(p.lista ?? []), ...(p.calculos ?? []));
    if (p.error) t.push(p.error.pie);
    for (const o of p.opciones ?? []) { t.push(o.texto); if (o.devolucion) t.push(o.devolucion); }
    if (p.pista) t.push(p.pista);
    for (const l of p.lineas ?? []) t.push(l.devolucion, ...(l.pista ? [l.pista] : []));
    if (p.acierto) t.push(p.acierto.texto, p.acierto.pie, ...(p.acierto.despues ?? []));
  }
  return t;
}
const fichas = () => P.pantallas.flatMap((p) => p.ficha ?? []);

/* Los «…» de primer nivel. Fuera: paréntesis y «*[…]*». */
function citas(md) {
  const limpio = md.replace(/\*\[[^\]]*\]\*/g, "").replace(/\([^()]*\)/g, "").replace(/^(\s*- )«[^»]*»: /gm, "$1");
  const out = [];
  let nivel = 0;
  let actual = "";
  for (const c of limpio) {
    if (c === "«") { if (nivel > 0) actual += c; nivel++; continue; }
    if (c === "»") { nivel--; if (nivel > 0) actual += c; else { out.push(actual); actual = ""; } continue; }
    if (nivel > 0) actual += c;
  }
  assert.equal(nivel, 0, "las comillas no cierran");
  return out;
}

/* Las tablas de asiento de la v1: [fecha, [[cuenta, debe, haber], …]]. */
function tablaDeAsiento(fecha) {
  const i = CONTENIDO.indexOf(`| ${fecha} | Debe | Haber |`);
  assert.ok(i >= 0, `la v1 no tiene la tabla del ${fecha}`);
  const filas = [];
  for (const l of CONTENIDO.slice(i).split("\n").slice(2)) {
    if (!l.startsWith("| ")) break;
    filas.push(l.split("|").slice(1, 4).map((c) => c.trim()));
  }
  return filas;
}
const enTabla = (asiento) => asiento.lineas.map((l) => {
  const m = l.monto === null ? "●" : A.cifra(l.monto);
  return [l.cuenta, l.lado === A.DEBE ? m : "", l.lado === A.HABER ? m : ""];
});

/* ═══════════ 1 · TEXTOS ═══════════ */

test("★★★ cada texto de los datos está, letra por letra, en la v1 o en su corrección", () => {
  const fuente = V1 + CORR;
  const faltan = textosVisibles().filter((t) => !fuente.includes(t) && !L2().includes(t) && !Object.values(A.BOTON).includes(t));
  assert.deepEqual(faltan, [], "estos textos no están en la v1 ni en la corrección");
  const ficha = fichas().filter((f) => !fuente.includes(minuscula(f.texto)) && !fuente.includes(f.texto));
  assert.deepEqual(ficha, [], "estos datos de la ficha no están en la v1");
});

test("★★★ cada texto visible de la v1 y de la corrección está en los datos; lo que la corrección quita, no", () => {
  const datos = new Set([...textosVisibles(), ...fichas().map((f) => f.texto)]);
  /* Cada pista del lote 2 para esta pieza está en los datos. */
  assert.ok(pistasL2().length > 0, "no se leyó ninguna pista del lote 2");
  assert.deepEqual(pistasL2().filter((x) => !datos.has(x)), [], "estas pistas del lote 2 no están en los datos");
  const corr = citas(CORR);
  assert.equal(corr.length, 3);
  assert.deepEqual(corr.filter((c) => !datos.has(c)), [], "falta texto de la corrección");
  const sobran = citas(CONTENIDO).filter((c) => !datos.has(c)).sort();
  assert.deepEqual(sobran, [
    /* La p. 234, citada por Near como respaldo de P1: no se ve. */
    "no se trasgreden los procedimientos utilizados para el registro de los activos",
    /* Las opciones de P1, en una sola línea de la v1: cada una es un botón. */
    "Inventario de mercancías", "Compras", "Costo de mercancía vendida",
    /* El primer repaso de P2, que la corrección reemplaza. */
    "Un repaso corto. El IVA es el impuesto a las ventas: el vendedor se lo cobra al cliente y se lo debe al Estado. Por eso, en la venta, va al haber de IVA por pagar.",
    /* La estructura de P5 es una sola cita en la v1; en pantalla, tres renglones. */
    "Ingresos por ventas · Menos: Costo de mercancía vendida · Utilidad bruta en ventas",
    /* La nota de Near para Watari: el «●» marca el monto que no se muestra (en pantalla es la marca, no un texto). */
    "●",
    /* Las dos líneas de P3: cuenta y monto, en sus dos lugares. */
    "Costo de mercancía vendida · $5.000.000", "Inventario de mercancías · $5.000.000",
  ].filter((c) => !datos.has(c)).sort());
  assert.ok(!datos.has("Un repaso corto. El IVA es el impuesto a las ventas: el vendedor se lo cobra al cliente y se lo debe al Estado. Por eso, en la venta, va al haber de IVA por pagar."));
  assert.deepEqual(pantalla("en-el-estado-de-resultados").estructura.join(" · "), "Ingresos por ventas · Menos: Costo de mercancía vendida · Utilidad bruta en ventas");
  assert.deepEqual(SEGUNDO.lineas.map((l) => `${l.cuenta} · $${A.cifra(l.monto)}`), ["Costo de mercancía vendida · $5.000.000", "Inventario de mercancías · $5.000.000"]);
});

test("★★★ la corrección: el repaso va en P1, antes de la pregunta; P2 solo con el lado de la venta", () => {
  const [repasoP1, compraAcierto, ventaP2] = citas(CORR);
  assert.equal(COMPRA.repaso, repasoP1);
  assert.ok(COMPRA.acierto.despues.includes(compraAcierto));
  assert.ok(VENTA.parrafos.includes(ventaP2));
  assert.ok(VENTA.parrafos.includes("La retención es una parte del pago que el cliente le descuenta al vendedor. Para el vendedor es un impuesto pagado por adelantado: va al debe de Anticipo fiscal."));
  assert.ok(!JSON.stringify(VENTA).includes("Un repaso corto"));
});

test("★★★ los dos asientos son las tablas de la v1, línea por línea (E-1 con ●, E-2 completo)", () => {
  assert.deepEqual(enTabla(COMPRA.acierto.asiento), tablaDeAsiento("16 de abril"));
  assert.deepEqual(enTabla(VENTA.asiento), tablaDeAsiento("20 de abril"));
  /* E-2 cuadra: lo que va al debe es lo mismo que lo que va al haber. */
  const suma = (lado) => VENTA.asiento.lineas.filter((l) => l.lado === lado).reduce((s, l) => s + l.monto, 0);
  assert.equal(suma(A.DEBE), suma(A.HABER));
  /* Y los cálculos dan sus montos. */
  assert.deepEqual(VENTA.calculos, ["$8.000.000 × 16 % = $1.280.000", "$8.000.000 × 3,5 % = $280.000", "$8.000.000 + $1.280.000 − $280.000 = $9.000.000"]);
  assert.equal(8000000 * 0.16, 1280000);
  assert.equal(Math.round(8000000 * 0.035), 280000);
});

test("★★★ X1 y regla 3: ninguna cifra de X1, ninguna suma, ninguna cifra del periódico", () => {
  const X1 = [800000, 175000, 5625000, 5800000];
  const SUMAS_E2 = 9280000;
  const todo = JSON.stringify(P);
  for (const x of [...X1, SUMAS_E2]) assert.ok(!new RegExp(`(^|[^\\d.])${A.cifra(x).replace(/\./g, "\\.")}(?![\\d.])`).test(todo), A.cifra(x));
  const montos = P.pantallas.flatMap((p) => [...(p.asiento?.lineas ?? []), ...(p.acierto?.asiento?.lineas ?? []), ...(p.lineas ?? [])]).map((l) => l.monto);
  for (const x of [...X1, SUMAS_E2]) assert.ok(!montos.includes(x), A.cifra(x));
  /* Las únicas cifras: los datos de E-1 y E-2, lo libre de E-2, las tarifas y los días de las fechas. */
  const permitidas = new Set(["5.000.000", "8.000.000", "1.280.000", "280.000", "9.000.000", "16", "3,5", "20"]);
  const cifras = textosVisibles().filter((t) => !t.startsWith("Basado en el libro")).join(" ").match(/\d+(?:[.,]\d+)*/g) ?? [];
  assert.deepEqual([...new Set(cifras)].filter((c) => !permitidas.has(c)), []);
  for (const interno of ["≈", "Near", "Mello", "Watari", "C7-", "X1", "T7-1"]) assert.ok(!textosVisibles().join("\n").includes(interno), interno);
});

test("★★★ P3: cada línea del asiento del costo va al lado que dice la v1, con su mensaje", () => {
  const linea = CONTENIDO.split("\n").find((l) => l.startsWith("- Líneas: «Costo de mercancía vendida"));
  const v1 = [...linea.matchAll(/«([^»]+) · \$([\d.]+)» → (Debe|Haber)/g)].map((m) => [m[1], m[2], m[3] === "Debe" ? A.DEBE : A.HABER]);
  assert.equal(v1.length, 2);
  assert.deepEqual(SEGUNDO.lineas.map((l) => [l.cuenta, A.cifra(l.monto), l.lado]), v1);
  const errores = CONTENIDO.slice(CONTENIDO.indexOf("**P3 · colocando"), CONTENIDO.indexOf("**P4")).split("- Errores:")[1];
  assert.deepEqual(SEGUNDO.lineas.map((l) => l.devolucion), citas(errores.slice(0, errores.indexOf("- Acierto"))));
});

/* ═══════════ 2 · PANTALLAS Y ESTADOS ═══════════ */

function enPantalla(caja) {
  const out = [];
  const opciones = [];
  for (const el of caja.querySelector("[data-pieza]").querySelectorAll("[data-texto], [data-opcion], [data-boton], [data-pie], [data-palabra]")) {
    if (el.matches("[data-opcion]")) { opciones.push(el.textContent); continue; }
    out.push(el.textContent);
  }
  return { textos: out, opciones: opciones.sort() };
}
const filasDeAsiento = (caja, fecha) => [...caja.querySelectorAll(`[data-asiento="${fecha}"] [data-linea]`)].map((r) => [...r.querySelectorAll("[role=rowheader], [role=cell]")].map((c) => (c.querySelector("[data-oculto]") ? "●" : c.textContent)));
const ordenLineas = (caja) => [...caja.querySelectorAll("[data-fila]")].map((f) => SEGUNDO.lineas.find((l) => l.id === f.dataset.fila));

test("★★★ cada pantalla y cada estado muestran exactamente sus textos y su pie", async () => {
  const m = await montar(h(LaVentaEnDosAsientos, { rotulo: "R" }));
  const vistos = [];
  try {
    for (const p of P.pantallas) {
      assert.equal(m.caja.querySelector("[data-pieza]").dataset.pantalla, p.id);
      const ficha = (p.ficha ?? []).map((f) => f.texto);
      if (p.tipo === "lados") {
        const lineas = ordenLineas(m.caja);
        /* La escalera de ayuda de las líneas: el 1.er error da la pista; el 2.º, la respuesta y su porqué. */
        for (const l of p.lineas) assert.ok(pistaDeLinea(p, l), `${p.id}: ${l.id} sin pista`);
        const filas = (malas = [], n = 0) => lineas.flatMap((l) => [l.cuenta, ...(malas.includes(l.id) ? [A.INTERFAZ.incorrecto, ...textosDeLinea(p, l, n)] : [])]);
        assert.deepEqual(enPantalla(m.caja).textos, [p.consigna, ...filas(), A.BOTON.confirmar, p.pie], "lados colocando");
        vistos.push(`${p.id}:colocando`);
        /* Las dos al revés. */
        for (const l of p.lineas) await tocar(lado(m.caja, l.id, otro(l.lado)));
        await tocar(boton(m.caja, "confirmar"));
        assert.deepEqual(enPantalla(m.caja).textos, [p.consigna, ...filas(lineas.map((l) => l.id), 1), A.BOTON.probarOtra, p.error.pie], "lados error 1: la pista");
        vistos.push(`${p.id}:error`);
        await tocar(boton(m.caja, "probar-otra"));
        /* 2.º error: otra vez al revés; cada una dice la respuesta y su porqué, y se cierra. */
        for (const id of p.lineas.map((l) => l.id)) await tocar(lado(m.caja, id, otro(p.lineas.find((l) => l.id === id).lado)));
        await tocar(boton(m.caja, "confirmar"));
        assert.deepEqual(enPantalla(m.caja).textos, [p.consigna, ...filas(lineas.map((l) => l.id), 2), A.BOTON.probarOtra, p.error.pie], "lados error 2: la respuesta y su porqué");
        for (const id of p.lineas.map((l) => l.id)) {
          const l = p.lineas.find((x) => x.id === id);
          assert.deepEqual(textosDeLinea(p, l, 2), [`La respuesta es «${l.lado === A.DEBE ? "Debe" : "Haber"}».`, l.devolucion], id);
        }
        vistos.push(`${p.id}:error2`);
        await tocar(boton(m.caja, "probar-otra"));
        /* Cerradas: quedan puestas en su lado y ya no se mueven, ni al otro lado ni quitándolas. */
        for (const id of p.lineas.map((l) => l.id)) {
          const l = p.lineas.find((x) => x.id === id);
          assert.equal(lado(m.caja, id, l.lado).getAttribute("aria-pressed"), "true", `${id}: no quedó en su lado`);
          await tocar(lado(m.caja, id, otro(l.lado)));
          assert.equal(lado(m.caja, id, l.lado).getAttribute("aria-pressed"), "true", `${id}: se pasó al otro lado`);
          await tocar(lado(m.caja, id, l.lado));
          assert.equal(lado(m.caja, id, l.lado).getAttribute("aria-pressed"), "true", `${id}: se pudo quitar`);
        }
        assert.deepEqual(enPantalla(m.caja).textos, [p.consigna, ...filas(), A.BOTON.confirmar, p.pie], "lados con las líneas cerradas");
        await tocar(boton(m.caja, "confirmar"));
        assert.deepEqual(enPantalla(m.caja).textos, [p.consigna, ...filas(), A.INTERFAZ.correcto, p.acierto.texto, A.BOTON.seguir, p.acierto.pie], "lados acierto");
        vistos.push(`${p.id}:acierto`);
        await tocar(boton(m.caja, "seguir"));
        continue;
      }
      if (p.tipo !== "eleccion") {
        const esperado = [p.objetivo, p.enunciado, ...ficha, ...(p.parrafos ?? []), ...(p.calculos ?? []), ...(p.estructura ?? []), p.cierre, ...(p.lista ?? []), p.siguiente, p.boton, p.pie].filter(Boolean);
        assert.deepEqual(enPantalla(m.caja).textos, esperado, p.id);
        if (p.asiento) assert.deepEqual(filasDeAsiento(m.caja, p.asiento.fecha), enTabla(p.asiento), `${p.id}: el asiento`);
        vistos.push(p.id);
        if (p.boton) await tocar(m.caja.querySelector("[data-boton]"));
        continue;
      }
      const cab = [...p.parrafos, p.enunciado, ...ficha, p.repaso, p.pregunta].filter(Boolean);
      const ops = p.opciones.map((o) => o.texto).sort();
      assert.deepEqual(enPantalla(m.caja), { textos: [...cab, A.BOTON.confirmar, p.pie], opciones: ops }, `${p.id} colocando`);
      assert.equal(m.caja.querySelector("[data-asiento]") === null, true, `${p.id}: el asiento sale antes del acierto`);
      vistos.push(`${p.id}:colocando`);
      /* La escalera de ayuda: el 1.er error da la pista; el 2.º y los siguientes, la respuesta con su porqué. */
      assert.ok(p.pista, `${p.id}: sin pista`);
      const malas = p.opciones.filter((x) => !x.correcta);
      for (const [i, o] of malas.entries()) {
        await tocar(m.caja.querySelector(`[data-opcion="${o.id}"]`));
        await tocar(boton(m.caja, "confirmar"));
        assert.deepEqual(enPantalla(m.caja), { textos: [...cab, A.INTERFAZ.incorrecto, ...textosDelError(p, o, i + 1), A.BOTON.probarOtra, p.error.pie], opciones: ops }, `${p.id} error ${i + 1} (${o.id})`);
        vistos.push(`${p.id}:error:${o.id}`);
        await tocar(boton(m.caja, "probar-otra"));
      }
      /* Si vuelve a una opción ya fallada, sigue la respuesta, no vuelve la pista. */
      {
        const o = malas[0];
        const i = malas.length;
        assert.equal(textosDelError(p, o, i + 1)[0], `La respuesta es «${p.opciones.find((x) => x.correcta).texto.replace(/\.$/, "")}».`);
        await tocar(m.caja.querySelector(`[data-opcion="${o.id}"]`));
        await tocar(boton(m.caja, "confirmar"));
        assert.deepEqual(enPantalla(m.caja), { textos: [...cab, A.INTERFAZ.incorrecto, ...textosDelError(p, o, i + 1), A.BOTON.probarOtra, p.error.pie], opciones: ops }, `${p.id} error ${i + 1} (${o.id})`);
        await tocar(boton(m.caja, "probar-otra"));
      }
      await tocar(m.caja.querySelector(`[data-opcion="${p.opciones.find((x) => x.correcta).id}"]`));
      await tocar(boton(m.caja, "confirmar"));
      assert.deepEqual(enPantalla(m.caja), { textos: [...cab, A.INTERFAZ.correcto, p.acierto.texto, ...(p.acierto.despues ?? []), A.BOTON.seguir, p.acierto.pie], opciones: ops }, `${p.id} acierto`);
      if (p.acierto.asiento) {
        assert.deepEqual(filasDeAsiento(m.caja, p.acierto.asiento.fecha), enTabla(p.acierto.asiento), `${p.id}: el asiento del acierto`);
        assert.equal(m.caja.querySelectorAll("[data-oculto]").length, 3);
      }
      vistos.push(`${p.id}:acierto`);
      await tocar(boton(m.caja, "seguir"));
    }
    assert.equal(vistos.length, 4 + 4 + 3 + 4 + 1 /* el 2.º error de las líneas */);
    assert.equal(m.caja.querySelector("[data-boton]") === null, true, "el resumen no lleva botón");
    assert.deepEqual([...m.caja.querySelectorAll("ol[data-lista] li")].map((li) => li.textContent), pantalla("resumen").lista);
  } finally {
    m.desmontar();
  }
});

test("★★ el monto que no se muestra: punto oculto al lector, y el lector oye que no se muestra", async () => {
  const m = await montar(h(LaVentaEnDosAsientos, { pieza: { ...P, pantallas: [COMPRA] }, rotulo: "R" }));
  try {
    await tocar(m.caja.querySelector('[data-opcion="inventario"]'));
    await tocar(boton(m.caja, "confirmar"));
    const ocultos = [...m.caja.querySelectorAll("[data-oculto]")];
    assert.equal(ocultos.length, 3);
    for (const o of ocultos) {
      assert.equal(o.querySelector("[aria-hidden=true]").textContent, "●");
      assert.equal(o.textContent, `●${A.PENDIENTE_DE_REVISION.montoOculto}`);
      assert.equal(o.closest("[data-linea]").dataset.lado === A.DEBE ? o.closest("[role=cell]") === o.closest("[data-linea]").querySelectorAll("[role=cell]")[0] : o.closest("[role=cell]") === o.closest("[data-linea]").querySelectorAll("[role=cell]")[1], true, "el punto no va en el lado de su cuenta");
    }
  } finally {
    m.desmontar();
  }
});

test("★★★ P3: «Probar otra» devuelve solo la línea equivocada", async () => {
  const m = await montar(h(LaVentaEnDosAsientos, { pieza: { ...P, pantallas: [SEGUNDO] }, rotulo: "R" }));
  try {
    const [buena, mala] = SEGUNDO.lineas;
    await tocar(lado(m.caja, buena.id, buena.lado));
    assert.equal(boton(m.caja, "confirmar").getAttribute("aria-disabled"), "true");
    await tocar(lado(m.caja, mala.id, otro(mala.lado)));
    await tocar(boton(m.caja, "confirmar"));
    assert.deepEqual([...m.caja.querySelectorAll("[data-marca]")].map((x) => x.closest("[data-linea]").dataset.linea), [mala.id]);
    await tocar(boton(m.caja, "probar-otra"));
    assert.equal(lado(m.caja, buena.id, buena.lado).getAttribute("aria-pressed"), "true");
    assert.equal(lado(m.caja, mala.id, A.DEBE).getAttribute("aria-pressed"), "false");
    assert.equal(lado(m.caja, mala.id, A.HABER).getAttribute("aria-pressed"), "false");
  } finally {
    m.desmontar();
  }
});

test("★★ los pies son los de la v1; el de los errores de P1, por convención, el de su pantalla", () => {
  const pies = P.pantallas.flatMap((p) => [p.pie, p.error?.pie, p.acierto?.pie].filter(Boolean));
  assert.deepEqual(pies, [
    "Basado en el libro, pp. 234-237",
    "Basado en el libro, p. 234", "Basado en el libro, p. 234", "Basado en el libro, pp. 234-235",
    "Basado en el libro, pp. 210, 212 y 235-237",
    "Basado en el libro, pp. 236-237", "Basado en el libro, pp. 236-237", "Basado en el libro, pp. 236-237",
    "Basado en el libro, pp. 209 y 233-236", "Basado en el libro, pp. 209 y 233-236", "Basado en el libro, pp. 209 y 233-236",
    "Basado en el libro, pp. 214 y 236-237",
    "Basado en el libro, pp. 234-237",
  ]);
  for (const p of new Set(pies)) assert.ok(V1.includes(`«${p}»`), p);
});

/* ═══════════ 3 · CATÁLOGO ═══════════ */

test("★★★ fuera del catálogo de FP; en T7-2 después de A1; sin nada que pague", () => {
  assert.equal(A.A2_ID, "t7-2-a2-la-venta-en-dos-asientos");
  assert.equal(P.numero, 2);
  const tema = SUBJECTS.contabilidad.topics.find((t) => t.id === TEMA_T7_2);
  const a = tema.actividades.find((x) => x.id === A.A2_ID);
  assert.deepEqual(a.clasificacion, { tipo: APRENDER });
  assert.equal(a.nombre, P.titulo);
  /* Entre A1 y A2 entra H1 «¿Debe o haber?»: se comparan solo las de Aprender. */
  const aprender = tema.actividades.filter((x) => x.clasificacion.tipo === APRENDER).map((x) => x.id);
  assert.equal(aprender.indexOf(A.A2_ID), aprender.indexOf("t7-2-a1-la-cuenta-que-si-se-mueve") + 1);
  const piezas = PIEZAS_T7_2.map((x) => x.pieza.id);
  assert.equal(piezas.indexOf(A.A2_ID), piezas.indexOf("t7-2-a1-la-cuenta-que-si-se-mueve") + 1);
  const dir = new URL("supabase/migrations/", RAIZ);
  assert.deepEqual(readdirSync(dir).filter((f) => readFileSync(new URL(f, dir), "utf8").includes(A.A2_ID)), []);
  for (const f of ["src/components/mecanicas/libros/t7/LaVentaEnDosAsientos.jsx", "src/data/contabilidadT7_2_a2.js"]) {
    assert.doesNotMatch(readFileSync(new URL(f, RAIZ), "utf8"), /from\s+["'][^"']*\/(fp|lib\/supabase)[^"']*["']|registrarActividad(Completada)?\s*\(|\.rpc\s*\(/, f);
  }
});
