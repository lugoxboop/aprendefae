import { test } from "node:test";
import assert from "node:assert/strict";
import { readFileSync, readdirSync } from "node:fs";
import { JSDOM, VirtualConsole } from "jsdom";

/*
 * ═══════════════════════════════════════════════════════════════════════════
 * T7-2 · A3 «El kárdex» (Célula C).
 *
 *   · cada texto de los datos está, letra por letra, en la v1 de Near o en
 *     sus correcciones; cada texto visible de las dos está en los datos,
 *     salvo lo que las correcciones reemplazan
 *   · las correcciones: las tres líneas de definición, literales de AP3 de
 *     T7-1, después de cada encabezado; el pie de P5; las dos opcionales
 *   · los tres kárdex son las tablas de Near, celda por celda, y salen igual
 *     al recalcularlos desde los movimientos; la tabla de P6 también
 *   · UEPS con su rótulo; regla 3: ninguna cifra del periódico de T7-1
 *   · cada pantalla y cada estado muestran exactamente sus textos, su pie y,
 *     con el acierto, su kárdex en la forma de Watari (sin «=»)
 *   · fuera del catálogo de FP; en T7-2 después de A2
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

const A = await import("../../data/contabilidadT7_2_a3.js");
const K = await import("../t7_2Kardex.js");
const { SUBJECTS, APRENDER } = await import("../../data/subjects.js");
const { textosDelError } = await import("../../components/mecanicas/libros/t7/escaleraAyuda.js");
const { default: PantallasT7_2, BOTON, INTERFAZ } = await import("../../components/mecanicas/libros/t7/PantallasT7_2.jsx");
const { ROTULOS_KX } = await import("../../components/mecanicas/libros/t7/KardexT7_2.jsx");
const { PIEZAS_T7_2, TEMA_T7_2 } = await import("../../components/ContabilidadT7_2View.jsx");

const RAIZ = new URL("../../../", import.meta.url);
const leer = (f) => readFileSync(new URL(f, RAIZ), "utf8");
const V1 = leer("orquestador/conocimiento/paquetes/t7-2-a3-v1.md");
const CORR = leer("orquestador/conocimiento/paquetes/t7-2-a3-a4-correcciones.md");
const CORR_A3 = CORR.slice(CORR.indexOf("A3 «El kárdex»"), CORR.indexOf("A4 «San Calixto en permanente»"));
const CONTENIDO = V1.slice(V1.indexOf("## Contenido"), V1.indexOf("## Registro 5c"));
const AP3 = leer("src/data/contabilidadT7_1_ap3.js");
const P = A.PIEZA_EL_KARDEX;

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

function textosVisibles() {
  const t = [P.titulo];
  for (const p of P.pantallas) {
    for (const k of ["objetivo", "encabezado", "pregunta", "boton", "pie", "siguiente"]) if (p[k]) t.push(p[k]);
    t.push(...(p.parrafos ?? []), ...(p.lista ?? []), ...(p.estructura ?? []), ...(p.calculos ?? []), ...(p.despues ?? []));
    if (p.movimientos) t.push(...p.movimientos.columnas, ...p.movimientos.filas.flat());
    if (p.tabla) t.push(...p.tabla.metodos, ...p.tabla.filas.filter((f) => !f.construida).map((f) => f.rubro));
    if (p.error) t.push(p.error.pie);
    for (const o of p.opciones ?? []) { t.push(o.texto); if (o.devolucion) t.push(o.devolucion); }
    if (p.pista) t.push(p.pista);
    if (p.acierto) t.push(p.acierto.texto, p.acierto.pie, ...(p.acierto.despues ?? []));
  }
  return t;
}

function citas(md) {
  /* Solo los paréntesis que siguen a una cita (medidas y páginas): los de dentro de una cita son texto. */
  const limpio = md.replace(/\*\[[^\]]*\]\*/g, "").replace(/»(\s*)\([^()]*\)/g, "»$1").replace(/^(\s*- )«[^»]*»: /gm, "$1");
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

/* ═══════════ 1 · TEXTOS ═══════════ */

test("★★★ cada texto de los datos está, letra por letra, en la v1 o en sus correcciones", () => {
  const fuente = V1 + CORR_A3;
  const faltan = textosVisibles().filter((t) => !fuente.includes(t) && !L2().includes(t) && !Object.values(A.BOTON).includes(t));
  assert.deepEqual(faltan, []);
  /* Lo que no es de Near va marcado, y no se compara. */
  for (const t of Object.values(A.PENDIENTE_DE_REVISION)) assert.ok(!fuente.includes(t), t);
});

test("★★★ cada texto visible de la v1 está en los datos, salvo lo que las correcciones reemplazan", () => {
  const datos = new Set(textosVisibles());
  /* Cada pista del lote 2 para esta pieza está en los datos. */
  assert.ok(pistasL2().length > 0, "no se leyó ninguna pista del lote 2");
  assert.deepEqual(pistasL2().filter((x) => !datos.has(x)), [], "estas pistas del lote 2 no están en los datos");
  const sobran = citas(CONTENIDO).filter((c) => !datos.has(c)).sort();
  assert.deepEqual(sobran, [
    /* La pregunta de P6, que la opcional reemplaza por la que termina «, en este caso?». */
    "¿Qué método da el mismo inventario final en los dos sistemas?",
    /* El viejo pie de P5, que la corrección cambia. */
    "Basado en el libro, pp. 240-241",
    /* Notas de Near, no texto en pantalla: el nombre inventado y la fórmula de la p. 241 que no usa (C7-4). */
    "Tauro",
    "costo de amortización disponible",
    /* UEPS como opción va con su rótulo (decisión de L). */
    "UEPS",
  ].sort());
  assert.ok(!datos.has("¿Qué método da el mismo inventario final en los dos sistemas?"));
});

test("★★★ las correcciones: las definiciones de AP3 de T7-1, después de cada encabezado; el pie de P5; las opcionales", () => {
  const nuevas = citas(CORR_A3).filter((c) => / quiere decir: |no elige un grupo/.test(c));
  assert.equal(nuevas.length, 3);
  for (const [id, def] of [["peps", nuevas[0]], ["ueps", nuevas[1]], ["promedio", nuevas[2]]]) {
    assert.equal(pantalla(id).parrafos[0], def, id);
    assert.ok(AP3.includes(`"${def}"`), `${id}: la definición no es literal de AP3 de T7-1`);
  }
  assert.equal(pantalla("promedio").pie, "Basado en el libro, pp. 218 y 240-241");
  assert.ok(CORR_A3.includes(`«${pantalla("promedio").pie}»`));
  assert.equal(pantalla("lado-a-lado").pregunta, "¿Qué método da el mismo inventario final en los dos sistemas, en este caso?");
  assert.ok(CORR_A3.includes(`«${pantalla("lado-a-lado").pregunta}»`));
  /* La opcional del kárdex UEPS: el saldo del 5 de julio con sus totales. */
  assert.ok(CORR_A3.includes("«30 × 2.010 = 60.300 · 50 × 2.130 = 106.500»"));
  assert.deepEqual(A.KARDEX_A3.ueps.filas[1].sal, [[30, 2010, 60300], [50, 2130, 106500]]);
});

test("★★★ UEPS lleva su rótulo en el encabezado, en la tabla y en la opción", () => {
  assert.equal(A.UEPS, "UEPS (no válido bajo NIIF)");
  assert.equal(pantalla("ueps").encabezado, `Método ${A.UEPS}`);
  assert.equal(A.KARDEX_A3.ueps.titulo, `Método ${A.UEPS}`);
  assert.equal(pantalla("lado-a-lado").tabla.metodos[1], A.UEPS);
  assert.equal(pantalla("lado-a-lado").opciones.find((o) => o.id === "ueps").texto, A.UEPS);
});

/* ═══════════ 2 · LAS CIFRAS ═══════════ */

/* Una celda del kárdex de la v1: «30 × 2.010 = 60.300 · 30 × 2.130 = 63.900», con «→ 51.450» como total. */
const num = (s) => Number(s.replace(/\./g, "").replace(",", "."));
function celda(s) {
  const capas = [...s.matchAll(/([\d.]+) × ([\d.,]+)(?: = ([\d.]+))?/g)].map((m) => [num(m[1]), num(m[2]), m[3] ? num(m[3]) : null]);
  const total = s.match(/→ ([\d.]+)/);
  return { capas, total: total ? num(total[1]) : null };
}
function tablaV1(desde) {
  const i = CONTENIDO.indexOf(desde);
  const j = CONTENIDO.indexOf("| Fecha | Entradas | Salidas | Saldos |", i);
  const filas = [];
  for (const l of CONTENIDO.slice(j).split("\n").slice(2)) {
    if (!l.startsWith("| ")) break;
    const [f, en, sa, sal] = l.split("|").slice(1, 5).map((c) => c.trim());
    filas.push({ f, en: celda(en), sa: celda(sa), sal: celda(sal), fin: sal.startsWith("**") });
  }
  return filas;
}

test("★★★ los tres kárdex son las tablas de Near, celda por celda", () => {
  for (const [metodo, desde] of [["peps", "Kárdex PEPS completo"], ["ueps", "Kárdex UEPS (p. 240)"], ["promedio", "Kárdex del promedio (p. 241)"]]) {
    const v1 = tablaV1(desde);
    const datos = A.KARDEX_A3[metodo].filas;
    assert.equal(datos.length, v1.length, metodo);
    for (const [k, r] of v1.entries()) {
      const d = datos[k];
      assert.equal(d.f, r.f, `${metodo} ${r.f}`);
      assert.deepEqual(d.en ?? [], r.en.capas, `${metodo} ${r.f}: entradas`);
      assert.deepEqual(d.sa ?? [], r.sa.capas, `${metodo} ${r.f}: salidas`);
      /* UEPS 5 jul: la v1 da el saldo sin totales y la opcional se los pone. */
      const salV1 = metodo === "ueps" && r.f === "5 jul" ? [[30, 2010, 60300], [50, 2130, 106500]] : r.sal.capas;
      assert.deepEqual(d.sal, salV1, `${metodo} ${r.f}: saldos`);
      assert.equal(d.salT ?? null, r.sal.total, `${metodo} ${r.f}: total del saldo`);
      assert.equal(Boolean(d.fin), r.fin, `${metodo} ${r.f}: saldo final`);
    }
  }
});

test("★★★ los tres kárdex salen igual al recalcularlos desde los movimientos de la v1", () => {
  /* Los movimientos, leídos de la tabla de P2 de la v1. */
  const filas = [];
  for (const l of CONTENIDO.slice(CONTENIDO.indexOf("| Fecha | Movimiento |")).split("\n").slice(2)) {
    if (!l.startsWith("| ")) break;
    filas.push(l.split("|").slice(1, 3).map((c) => c.trim()));
  }
  assert.deepEqual(P.pantallas.find((x) => x.id === "los-datos").movimientos.filas, filas);
  const corto = (f) => f.replace(" de julio", " jul");
  const ini = filas[0][1].match(/Tiene (\d+) unidades a \$([\d.]+)/);
  assert.deepEqual([...A.INICIAL_A3, A.INICIAL_A3.fecha], [Number(ini[1]), num(ini[2]), corto(filas[0][0])]);
  const movs = filas.slice(1).map(([f, m]) => {
    const c = m.match(/Compra (\d+) unidades a \$([\d.]+)/);
    return c ? { fecha: corto(f), compra: [Number(c[1]), num(c[2])] } : { fecha: corto(f), venta: Number(m.match(/Vende (\d+)/)[1]) };
  });
  assert.deepEqual(A.MOVIMIENTOS_A3, movs);
  for (const [metodo, m] of [["peps", K.PEPS], ["ueps", K.UEPS_M], ["promedio", K.PROMEDIO]]) {
    const calc = K.kardex(A.INICIAL_A3, A.MOVIMIENTOS_A3, m);
    const datos = A.KARDEX_A3[metodo].filas;
    assert.deepEqual(datos.map((d) => [d.f, d.en ?? null, d.sa ?? null, d.sal]), calc.map((c) => [c.fecha, c.entrada ?? null, c.salida ?? null, c.saldo]), metodo);
    for (const d of datos) if (d.salT) assert.equal(d.salT, d.sal.reduce((s, c) => s + c[2], 0), `${metodo} ${d.f}`);
  }
});

test("★★★ la tabla de P6 sale de los tres kárdex; el periódico, de los mismos datos (cifras construidas)", () => {
  const t = pantalla("lado-a-lado").tabla;
  const r = ["peps", "ueps", "promedio"].map((m) => K.resumenKardex(K.kardex(A.INICIAL_A3, A.MOVIMIENTOS_A3, m === "peps" ? K.PEPS : m === "ueps" ? K.UEPS_M : K.PROMEDIO)));
  assert.deepEqual(t.filas[0].valores, r.map((x) => x.final));
  assert.deepEqual(t.filas[1].valores, r.map((x) => x.vendido));
  /* Periódico: PEPS el mismo; UEPS 25 del inicio y la primera compra; promedio de todo el mes (256.800 ÷ 120). */
  const disponible = 30 * 2010 + 50 * 2130 + 40 * 2250;
  assert.equal(disponible, 256800);
  assert.deepEqual(t.filas[2].valores, [25 * 2250, 25 * 2010, 25 * (disponible / 120)]);
  assert.ok(V1.includes("con el periódico serían UEPS 50.250 (25 × 2.010) · promedio 53.500 (25 × 2.140) · PEPS 56.250"));
  assert.equal(t.filas[2].rubro, A.PENDIENTE_DE_REVISION.conPeriodico);
  /* Cada costo de lo vendido + inventario final = lo disponible. */
  for (const x of r) assert.equal(x.vendido + x.final, disponible);
});

test("★★★ regla 3: ninguna cifra del periódico de T7-1; todas las del registro 5c de la v1", () => {
  const registro = V1.slice(V1.indexOf("## Registro 5c")).split("\n")[2];
  const todas = new Set();
  for (const k of Object.values(A.KARDEX_A3)) for (const f of k.filas) for (const c of [...(f.en ?? []), ...(f.sa ?? []), ...f.sal]) { todas.add(c[1]); todas.add(c[2]); }
  for (const f of pantalla("lado-a-lado").tabla.filas) f.valores.forEach((v) => todas.add(v));
  for (const v of todas) assert.ok(registro.includes(K.cifraK(v)), `${K.cifraK(v)} no está en el registro 5c de Near`);
  /* Ni una cifra de AP3 de T7-1 (San Calixto en el periódico). */
  for (const x of ["1.300", "1.320", "1.325", "1.350", "1.380", "1.518.000", "1.486.000"]) assert.ok(!JSON.stringify(P).includes(x) && ![...todas].map(K.cifraK).includes(x), x);
});

/* ═══════════ 3 · PANTALLAS Y ESTADOS ═══════════ */

function enPantalla(caja) {
  const out = [];
  const opciones = [];
  for (const el of caja.querySelector("[data-pieza]").querySelectorAll("[data-texto], [data-opcion], [data-boton], [data-pie], [data-palabra]")) {
    if (el.matches("[data-opcion]")) { opciones.push(el.textContent); continue; }
    out.push(el.textContent);
  }
  return { textos: out, opciones: opciones.sort() };
}
const cuerpo = (p) => [p.encabezado, p.objetivo, ...(p.parrafos ?? []), ...(p.estructura ?? []), ...(p.movimientos?.filas.flat() ?? []), ...(p.calculos ?? []), ...(p.tabla?.filas.map((f) => f.rubro) ?? []), ...(p.despues ?? [])].filter(Boolean);
/* Un kárdex pintado: sus capas, fecha por fecha, como los datos. */
const capasPintadas = (k) => [...k.querySelectorAll("[data-fecha]")].map((s) => [s.dataset.fecha, ...["entradas", "salidas", "saldos"].map((b) => [...s.querySelectorAll(`[data-bloque="${b}"] [data-capa]`)].map((c) => [...c.children].map((x) => x.textContent)))]);
const capasEsperadas = (kx) => kx.filas.map((f) => [f.f, ...[f.en, f.sa, f.sal].map((cs) => (cs ?? []).map((c) => c.map((v) => (v === null ? "" : K.cifraK(v)))))]);

test("★★★ cada pantalla y cada estado muestran exactamente sus textos y su pie; el kárdex sale con el acierto", async () => {
  const m = await montar(h(PantallasT7_2, { pieza: P, rotulo: "R" }));
  const vistos = [];
  try {
    for (const p of P.pantallas) {
      assert.equal(m.caja.querySelector("[data-pieza]").dataset.pantalla, p.id);
      if (p.tipo !== "eleccion") {
        assert.deepEqual(enPantalla(m.caja).textos, [...cuerpo(p), ...(p.lista ?? []), p.siguiente, p.boton, p.pie].filter(Boolean), p.id);
        vistos.push(p.id);
        if (p.boton) await tocar(m.caja.querySelector("[data-boton]"));
        continue;
      }
      const cab = [...cuerpo(p), p.pregunta];
      const ops = p.opciones.map((o) => o.texto).sort();
      assert.deepEqual(enPantalla(m.caja), { textos: [...cab, BOTON.confirmar, p.pie], opciones: ops }, `${p.id} colocando`);
      assert.equal(m.caja.querySelector("[data-kardex]") === null, true, `${p.id}: el kárdex antes del acierto`);
      vistos.push(`${p.id}:colocando`);
      /* La escalera de ayuda: el 1.er error da la pista; el 2.º y los siguientes, la respuesta con su porqué. */
      assert.ok(p.pista, `${p.id}: sin pista`);
      const malas = p.opciones.filter((x) => !x.correcta);
      for (const [i, o] of malas.entries()) {
        await tocar(m.caja.querySelector(`[data-opcion="${o.id}"]`));
        await tocar(boton(m.caja, "confirmar"));
        assert.deepEqual(enPantalla(m.caja), { textos: [...cab, INTERFAZ.incorrecto, ...textosDelError(p, o, i + 1), BOTON.probarOtra, p.error.pie], opciones: ops }, `${p.id} error ${i + 1} (${o.id})`);
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
        assert.deepEqual(enPantalla(m.caja), { textos: [...cab, INTERFAZ.incorrecto, ...textosDelError(p, o, i + 1), BOTON.probarOtra, p.error.pie], opciones: ops }, `${p.id} error ${i + 1} (${o.id})`);
        await tocar(boton(m.caja, "probar-otra"));
      }
      await tocar(m.caja.querySelector(`[data-opcion="${p.opciones.find((x) => x.correcta).id}"]`));
      await tocar(boton(m.caja, "confirmar"));
      assert.deepEqual(enPantalla(m.caja), { textos: [...cab, INTERFAZ.correcto, p.acierto.texto, ...(p.acierto.despues ?? []), BOTON.seguir, p.acierto.pie], opciones: ops }, `${p.id} acierto`);
      if (p.acierto.kardex) {
        const k = m.caja.querySelector("[data-kardex]");
        assert.ok(k, `${p.id}: sin kárdex`);
        assert.equal(k.querySelector("figcaption").textContent, A.KARDEX_A3[p.acierto.kardex].titulo);
        assert.deepEqual(capasPintadas(k), capasEsperadas(A.KARDEX_A3[p.acierto.kardex]), `${p.id}: el kárdex pintado`);
        assert.ok(!k.textContent.includes("="), `${p.id}: el kárdex lleva «=»`);
        assert.deepEqual([...k.querySelectorAll(".t7kx-cab span")].map((s) => s.textContent), [ROTULOS_KX.cantidad, ROTULOS_KX.costoUnitario, ROTULOS_KX.costoTotal]);
      }
      vistos.push(`${p.id}:acierto`);
      await tocar(boton(m.caja, "seguir"));
    }
    assert.equal(vistos.length, 4 + 4 * 4);
    assert.equal(m.caja.querySelector("[data-boton]") === null, true, "el resumen no lleva botón");
  } finally {
    m.desmontar();
  }
});

test("★★ la tabla de P6, pintada: los tres métodos y sus cifras", async () => {
  const m = await montar(h(PantallasT7_2, { pieza: { ...P, pantallas: [pantalla("lado-a-lado")] }, rotulo: "R" }));
  try {
    const t = pantalla("lado-a-lado").tabla;
    assert.deepEqual([...m.caja.querySelectorAll("[data-metodos] [role=columnheader]")].map((x) => x.textContent), t.metodos);
    for (const f of t.filas) {
      const r = m.caja.querySelector(`[data-rubro="${f.rubro}"]`);
      assert.deepEqual([...r.querySelectorAll("[data-dato-metodo]")].map((x) => x.textContent), f.valores.map(K.cifraK));
    }
  } finally {
    m.desmontar();
  }
});

test("★★ los pies son los de la v1 con la corrección de P5", () => {
  const pies = P.pantallas.flatMap((p) => [p.pie, p.error?.pie, p.acierto?.pie].filter(Boolean));
  assert.deepEqual([...new Set(pies)], [
    "Basado en el libro, pp. 237-241",
    "Basado en el libro, p. 238",
    "Basado en el libro, pp. 215 y 238-239",
    "Basado en el libro, pp. 216 y 240",
    "Basado en el libro, pp. 218 y 240-241",
    "Basado en el libro, pp. 222, 233-234 y 239-241",
    "Basado en el libro, pp. 238-241",
  ]);
});

/* ═══════════ 4 · CATÁLOGO ═══════════ */

test("★★★ fuera del catálogo de FP; en T7-2 después de A2 (y de H2); sin nada que pague", () => {
  assert.equal(A.A3_ID, "t7-2-a3-el-kardex");
  assert.equal(P.numero, 3);
  const tema = SUBJECTS.contabilidad.topics.find((t) => t.id === TEMA_T7_2);
  const a = tema.actividades.find((x) => x.id === A.A3_ID);
  assert.deepEqual(a.clasificacion, { tipo: APRENDER });
  assert.equal(a.nombre, P.titulo);
  const ids = tema.actividades.map((x) => x.id);
  assert.equal(ids.indexOf(A.A3_ID), ids.indexOf("t7-2-dos-asientos") + 1);
  const piezas = PIEZAS_T7_2.map((x) => x.pieza.id);
  assert.equal(piezas.indexOf(A.A3_ID), piezas.indexOf("t7-2-a2-la-venta-en-dos-asientos") + 1);
  const dir = new URL("supabase/migrations/", RAIZ);
  assert.deepEqual(readdirSync(dir).filter((f) => readFileSync(new URL(f, dir), "utf8").includes(A.A3_ID)), []);
  for (const f of ["src/components/mecanicas/libros/t7/PantallasT7_2.jsx", "src/components/mecanicas/libros/t7/KardexT7_2.jsx", "src/data/contabilidadT7_2_a3.js"]) {
    assert.doesNotMatch(readFileSync(new URL(f, RAIZ), "utf8"), /from\s+["'][^"']*\/(fp|lib\/supabase)[^"']*["']|registrarActividad(Completada)?\s*\(|\.rpc\s*\(/, f);
  }
});
