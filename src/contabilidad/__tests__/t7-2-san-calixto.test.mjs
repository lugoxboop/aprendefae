import { test } from "node:test";
import assert from "node:assert/strict";
import { readFileSync, readdirSync } from "node:fs";
import { JSDOM, VirtualConsole } from "jsdom";

/*
 * ═══════════════════════════════════════════════════════════════════════════
 * T7-2 · A4 «San Calixto en permanente» (Célula C).
 *
 *   · cada texto de los datos está, letra por letra, en la v1 de Near o en
 *     sus correcciones; cada texto visible de las dos está en los datos,
 *     salvo lo que las correcciones reemplazan
 *   · la decisión de Mello, casilla por casilla: los tres kárdex salen al
 *     recalcularlos desde los movimientos del libro, y van sin total justo
 *     las casillas cuyo total está en X2
 *   · ninguna cifra de X2 en toda la pieza, ni el estado de la p. 244, ni la
 *     suma de las salidas
 *   · las correcciones: el promedio en columnas y sus cálculos con «≈»; en
 *     UEPS, los saldos del 2 y del 4 de febrero con sus capas
 *   · cada pantalla y cada estado muestran exactamente sus textos y su pie
 *   · fuera del catálogo de FP; en T7-2 después de A3
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

const A = await import("../../data/contabilidadT7_2_a4.js");
const K = await import("../t7_2Kardex.js");
const { SUBJECTS, APRENDER } = await import("../../data/subjects.js");
const { default: PantallasT7_2, BOTON, INTERFAZ } = await import("../../components/mecanicas/libros/t7/PantallasT7_2.jsx");
const { PIEZAS_T7_2, TEMA_T7_2 } = await import("../../components/ContabilidadT7_2View.jsx");

const RAIZ = new URL("../../../", import.meta.url);
const leer = (f) => readFileSync(new URL(f, RAIZ), "utf8");
const V1 = leer("orquestador/conocimiento/paquetes/t7-2-a4-v1.md");
const CORR = leer("orquestador/conocimiento/paquetes/t7-2-a3-a4-correcciones.md");
const CORR_A4 = CORR.slice(CORR.indexOf("A4 «San Calixto en permanente»"));
const CONTENIDO = V1.slice(V1.indexOf("## Contenido"), V1.indexOf("## Erratas"));
const P = A.PIEZA_SAN_CALIXTO;
const pantalla = (id) => P.pantallas.find((x) => x.id === id);
const METODO = { peps: K.PEPS, ueps: K.UEPS_M, promedio: K.PROMEDIO };

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
    t.push(...(p.parrafos ?? []), ...(p.lista ?? []), ...(p.cierre ?? []), ...(p.despues ?? []));
    if (p.movimientos) t.push(...p.movimientos.columnas, ...p.movimientos.filas.flat());
    if (p.error) t.push(p.error.pie);
    for (const o of p.opciones ?? []) { t.push(o.texto); if (o.devolucion) t.push(o.devolucion); }
    if (p.acierto) t.push(p.acierto.texto, p.acierto.pie, ...(p.acierto.calculos ?? []), ...(p.acierto.notaKardex ? [p.acierto.notaKardex] : []));
  }
  return t;
}

function citas(md) {
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
  const fuente = V1 + CORR_A4;
  const faltan = textosVisibles().filter((t) => !fuente.includes(t) && !Object.values(A.BOTON).includes(t));
  assert.deepEqual(faltan, []);
  for (const t of A.PENDIENTE_DE_REVISION.finales) assert.ok(!fuente.includes(t), t);
});

test("★★★ cada texto visible de la v1 está en los datos, salvo lo que las correcciones reemplazan", () => {
  const datos = new Set(textosVisibles());
  const sobran = [...new Set(citas(CONTENIDO).filter((c) => !datos.has(c)))].sort();
  assert.deepEqual(sobran, [
    /* Los cuatro cálculos con «=», que la obligatoria 1 pasa a «≈». */
    "(5.200 × 1.300 + 4.000 × 1.320) ÷ 9.200 = $1.308,70",
    "(12.040.000 + 3.000 × 1.325) ÷ 12.200 = $1.312,70",
    "(2.887.951 + 2.500 × 1.350) ÷ 4.700 = $1.332,54",
    "(533.017 + 3.500 × 1.380) ÷ 3.900 = $1.375,13",
    /* «(×)» y el ejemplo de C7-4 son notas de Near, no texto en pantalla. */
    "(×)", "$1.312,70",
    /* «1.100 × $1.380» va en la lista de finales (marcada como nuestra). */
    "1.100 × $1.380",
    /* La nota de Near sobre los asientos del impuesto de renta, que no se ven en ningún sistema. */
    "dos asientos menos", "7 frente a 5",
  ].sort());
  for (const c of citas(CORR_A4).filter((x) => x.startsWith("(") && x.includes("≈"))) assert.ok(pantalla("promedio").acierto.calculos.includes(c), c);
});

test("★★★ UEPS lleva su rótulo; el estado de la p. 244 no se muestra", () => {
  assert.equal(pantalla("ueps").encabezado, `Método ${A.UEPS}`);
  assert.equal(A.KARDEX_A4.ueps.titulo, `Método ${A.UEPS}`);
  assert.ok(A.PENDIENTE_DE_REVISION.finales[0].startsWith(A.UEPS));
  /* Ninguna pantalla trae un estado de resultados ni una tabla de métodos. */
  for (const p of P.pantallas) assert.equal(p.tabla, undefined, p.id);
});

/* ═══════════ 2 · LA DECISIÓN DE MELLO, CASILLA POR CASILLA ═══════════ */

test("★★★ los movimientos son los de la v1", () => {
  const filas = [];
  for (const l of CONTENIDO.slice(CONTENIDO.indexOf("| Fecha | Movimiento |")).split("\n").slice(2)) {
    if (!l.startsWith("| ")) break;
    filas.push(l.split("|").slice(1, 3).map((c) => c.trim()));
  }
  assert.deepEqual(pantalla("los-datos").movimientos.filas, filas);
  const num = (s) => Number(s.replace(/\./g, ""));
  const movs = filas.slice(1).map(([f, m]) => {
    const c = m.match(/Compra ([\d.]+) a \$([\d.]+)/);
    return c ? { fecha: f, compra: [num(c[1]), num(c[2])] } : { fecha: f, venta: num(m.match(/Vende ([\d.]+)/)[1]) };
  });
  assert.deepEqual(A.MOVIMIENTOS_A4, movs);
  assert.deepEqual([...A.INICIAL_A4, A.INICIAL_A4.fecha], [5200, 1300, "1 feb"]);
});

test("★★★ los tres kárdex salen al recalcularlos; sin total van justo las casillas de X2", () => {
  for (const [metodo, kx] of Object.entries(A.KARDEX_A4)) {
    const calc = K.kardex(A.INICIAL_A4, A.MOVIMIENTOS_A4, METODO[metodo]);
    assert.equal(kx.filas.length, calc.length, metodo);
    for (const [k, c] of calc.entries()) {
      const d = kx.filas[k];
      assert.equal(d.f, c.fecha, metodo);
      for (const [bloque, cs] of [["en", c.entrada], ["sa", c.salida], ["sal", c.saldo]]) {
        const mostradas = d[bloque] ?? [];
        assert.equal(mostradas.length, (cs ?? []).length, `${metodo} ${c.fecha} ${bloque}`);
        for (const [j, capa] of (cs ?? []).entries()) {
          const [q, cu, t] = mostradas[j];
          assert.deepEqual([q, cu], [capa[0], capa[1]], `${metodo} ${c.fecha} ${bloque}`);
          /* Mello: sin total si y solo si el total está en X2. */
          if (A.X2.includes(capa[2])) assert.equal(t, null, `${metodo} ${c.fecha} ${bloque}: ${K.cifraK(capa[2])} es de X2 y se ve`);
          else assert.equal(t, capa[2], `${metodo} ${c.fecha} ${bloque}: falta el total`);
        }
      }
      /* Los totales que da Near, recalculados; ninguno es de X2. */
      if (d.saT) assert.equal(d.saT, c.salida.reduce((s, x) => s + x[2], 0), `${metodo} ${c.fecha}`);
      if (d.salT) assert.equal(d.salT, c.saldo.reduce((s, x) => s + x[2], 0), `${metodo} ${c.fecha}`);
      for (const x of [d.saT, d.salT]) if (x) assert.ok(!A.X2.includes(x));
    }
  }
  /* Los tres finales de la pieza. */
  const fin = (m) => K.resumenKardex(K.kardex(A.INICIAL_A4, A.MOVIMIENTOS_A4, METODO[m])).final;
  assert.equal(fin("ueps"), 1_486_000);
  assert.equal(fin("promedio"), 1_512_646);
  assert.equal(fin("peps"), 1_518_000);
  assert.ok(A.X2.includes(fin("peps")));
});

test("★★★ las correcciones: en UEPS, los saldos del 2 y del 4 de febrero con sus capas; el promedio en columnas", () => {
  const u = A.KARDEX_A4.ueps.filas;
  assert.deepEqual(u[1].sal, [[5200, 1300, null], [4000, 1320, null]]);
  assert.deepEqual(u[2].sal, [[5200, 1300, null], [4000, 1320, null], [3000, 1325, null]]);
  assert.ok(CORR_A4.includes("«5.200 × 1.300 (×) · 4.000 × 1.320 (×) · 3.000 × 1.325 (×)»"));
  /* La tabla del promedio de la corrección, fila por fila. */
  const filas = CORR_A4.split("\n").filter((l) => /^\d+ feb\t/.test(l)).map((l) => l.split("\t"));
  assert.equal(filas.length, 10);
  const num = (s) => (s === "(×)" ? null : Number(s.replace(/\./g, "").replace(",", ".")));
  for (const [k, f] of filas.entries()) {
    const d = A.KARDEX_A4.promedio.filas[k];
    assert.equal(d.f, f[0]);
    const capa = (i) => (f[i] ? [num(f[i]), num(f[i + 1]), num(f[i + 2])] : null);
    assert.deepEqual(d.en?.[0] ?? null, capa(1), `${f[0]} entrada`);
    assert.deepEqual(d.sa?.[0] ?? null, capa(4), `${f[0]} salida`);
    assert.deepEqual(d.sal[0], capa(7), `${f[0]} saldo`);
  }
  /* Los cálculos con «≈» dan sus promedios. */
  const [c2, c4, c12, c25] = pantalla("promedio").acierto.calculos;
  assert.ok(Math.abs((5200 * 1300 + 4000 * 1320) / 9200 - 1308.70) < 0.005 && c2.endsWith("≈ $1.308,70"));
  assert.ok(Math.abs((12_040_000 + 3000 * 1325) / 12200 - 1312.70) < 0.005 && c4.endsWith("≈ $1.312,70"));
  assert.ok(Math.abs((2_887_951 + 2500 * 1350) / 4700 - 1332.54) < 0.005 && c12.endsWith("≈ $1.332,54"));
  assert.ok(Math.abs((533_017 + 3500 * 1380) / 3900 - 1375.13) < 0.005 && c25.endsWith("≈ $1.375,13"));
});

test("★★★ ninguna cifra de X2 en toda la pieza, ni la suma de las salidas", () => {
  const todo = JSON.stringify(P);
  for (const x of A.X2) {
    assert.ok(!todo.includes(K.cifraK(x)), `${K.cifraK(x)} se ve`);
    assert.ok(!new RegExp(`[^\\d]${x}[^\\d]`).test(todo), `${x} está en los datos`);
  }
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
const cuerpo = (p) => [p.encabezado, p.objetivo, ...(p.parrafos ?? []), ...(p.finales ?? []), ...(p.movimientos?.filas.flat() ?? []), ...(p.cierre ?? []), ...(p.despues ?? [])].filter(Boolean);

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
      assert.equal(m.caja.querySelector("[data-kardex], [data-calculos]") === null, true, `${p.id}: el kárdex o los cálculos antes del acierto`);
      vistos.push(`${p.id}:colocando`);
      for (const o of p.opciones.filter((x) => !x.correcta)) {
        await tocar(m.caja.querySelector(`[data-opcion="${o.id}"]`));
        await tocar(boton(m.caja, "confirmar"));
        assert.deepEqual(enPantalla(m.caja), { textos: [...cab, INTERFAZ.incorrecto, o.devolucion, BOTON.probarOtra, p.error.pie], opciones: ops }, `${p.id} error ${o.id}`);
        vistos.push(`${p.id}:error:${o.id}`);
        await tocar(boton(m.caja, "probar-otra"));
      }
      await tocar(m.caja.querySelector(`[data-opcion="${p.opciones.find((x) => x.correcta).id}"]`));
      await tocar(boton(m.caja, "confirmar"));
      const a = p.acierto;
      assert.deepEqual(enPantalla(m.caja), { textos: [...cab, INTERFAZ.correcto, a.texto, ...(a.calculos ?? []), ...(a.notaKardex ? [a.notaKardex] : []), BOTON.seguir, a.pie], opciones: ops }, `${p.id} acierto`);
      if (a.kardex) {
        const k = m.caja.querySelector("[data-kardex]");
        assert.equal(k.querySelector("figcaption").textContent, A.KARDEX_A4[a.kardex].titulo);
        const nulos = A.KARDEX_A4[a.kardex].filas.flatMap((f) => [...(f.en ?? []), ...(f.sa ?? []), ...f.sal]).filter((c) => c[2] === null).length;
        assert.equal(k.querySelectorAll("[data-sin-total]").length, nulos, `${p.id}: casillas sin total`);
        assert.ok(!k.textContent.includes("="), `${p.id}: el kárdex lleva «=»`);
        for (const x of A.X2) assert.ok(!k.textContent.includes(K.cifraK(x)), `${p.id}: ${K.cifraK(x)} se ve`);
      }
      vistos.push(`${p.id}:acierto`);
      await tocar(boton(m.caja, "seguir"));
    }
    assert.equal(vistos.length, 3 + 5 * 4);
    assert.equal(m.caja.querySelector("[data-boton]") === null, true, "el resumen no lleva botón");
  } finally {
    m.desmontar();
  }
});

test("★★ los pies son los de la v1", () => {
  const pies = P.pantallas.flatMap((p) => [p.pie, p.error?.pie, p.acierto?.pie].filter(Boolean));
  for (const x of new Set(pies)) assert.ok(V1.includes(`«${x}»`), x);
  assert.equal(new Set(pies).size, 8);
});

/* ═══════════ 4 · CATÁLOGO ═══════════ */

test("★★★ fuera del catálogo de FP; en T7-2 después de A3; sin nada que pague", () => {
  assert.equal(A.A4_ID, "t7-2-a4-san-calixto");
  assert.equal(P.numero, 4);
  const tema = SUBJECTS.contabilidad.topics.find((t) => t.id === TEMA_T7_2);
  const a = tema.actividades.find((x) => x.id === A.A4_ID);
  assert.deepEqual(a.clasificacion, { tipo: APRENDER });
  assert.equal(a.nombre, P.titulo);
  const ids = tema.actividades.filter((x) => x.clasificacion.tipo === APRENDER).map((x) => x.id);
  assert.equal(ids.indexOf(A.A4_ID), ids.indexOf("t7-2-a3-el-kardex") + 1);
  const piezas = PIEZAS_T7_2.map((x) => x.pieza.id);
  assert.equal(piezas.indexOf(A.A4_ID), piezas.indexOf("t7-2-a3-el-kardex") + 1);
  const dir = new URL("supabase/migrations/", RAIZ);
  assert.deepEqual(readdirSync(dir).filter((f) => readFileSync(new URL(f, dir), "utf8").includes(A.A4_ID)), []);
  assert.doesNotMatch(leer("src/data/contabilidadT7_2_a4.js"), /from\s+["'][^"']*\/(fp|lib\/supabase)[^"']*["']|registrarActividad(Completada)?\s*\(|\.rpc\s*\(/);
});
