import { test } from "node:test";
import assert from "node:assert/strict";
import { readFileSync, readdirSync } from "node:fs";
import { JSDOM, VirtualConsole } from "jsdom";

/*
 * ═══════════════════════════════════════════════════════════════════════════
 * T7-2 · A3 «El kárdex» (Célula C).
 *
 * EL RECORTE DEL LOTE 1 de Near (entrega 6, sección «t7-2-a3-el-kardex») con
 * las correcciones obligatorias de Mello (los dos errores de `lado-a-lado`,
 * con «Aquí,») encima: correccionesMelloRecortesT72.mjs.
 *
 *   · los datos son la sección corregida, letra por letra y en los dos
 *     sentidos: pantallas, líneas (texto y figura), opciones, pista, errores,
 *     acierto y «¿Por qué?» (o el «Ver el kárdex completo…» que abre)
 *   · el «¿Por qué?» de `lado-a-lado` trae «solo»: por la regla de L va a
 *     la vista; la opcional de Mello (la fila del periódico después de
 *     responder) NO se aplica: la fila se ve al llegar
 *   · los tres kárdex son las tablas de Near, celda por celda, y salen igual
 *     al recalcularlos desde los movimientos, que son los de la figura de
 *     `los-datos`; la tabla de `lado-a-lado` también; los saldos de cada
 *     pregunta salen del kárdex de su método
 *   · UEPS con su rótulo; regla 3: ninguna cifra del periódico de T7-1
 *   · montada, estado por estado: textos y figuras al llegar, nada plegado,
 *     la escalera, el foco, el acierto con su «¿Por qué?» (plegado o a la
 *     vista) y el kárdex que se abre con «Ver…» (botón con aria-expanded);
 *     el resumen abre con el kárdex de PEPS
 *   · fuera del catálogo de FP; en T7-2 después de A2
 * ═══════════════════════════════════════════════════════════════════════════
 */

const { prepararDom } = await import("./t7-3-recorte.mjs");
const w = prepararDom(JSDOM, VirtualConsole);

const React = await import("react");
const { createRoot } = await import("react-dom/client");
const act = React.act;
const h = React.createElement;

const A = await import("../../data/contabilidadT7_2_a3.js");
const K = await import("../t7_2Kardex.js");
const M = await import("./correccionesMelloRecortesT72.mjs");
const R = await import("./t7-2-recorte.mjs");
const { SUBJECTS, APRENDER } = await import("../../data/subjects.js");
const { default: PantallasT7_2 } = await import("../../components/mecanicas/libros/t7/PantallasT7_2.jsx");
const { default: Kardex, ROTULOS_KX } = await import("../../components/mecanicas/libros/t7/KardexT7_2.jsx");
const { PIEZAS_T7_2, TEMA_T7_2 } = await import("../../components/ContabilidadT7_2View.jsx");

const RAIZ = new URL("../../../", import.meta.url);
const leer = (f) => readFileSync(new URL(f, RAIZ), "utf8");
/* La v1 de Near: de ahí salen los kárdex y el registro 5c, que el recorte no cambia. */
const V1 = leer("orquestador/conocimiento/paquetes/t7-2-a3-v1.md");
const CONTENIDO = V1.slice(V1.indexOf("## Contenido"), V1.indexOf("## Registro 5c"));
const P = A.PIEZA_EL_KARDEX;
const S = M.seccionT72(A.A3_ID);
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

/* Una figura de los datos, como la escribe el paquete (una línea por renglón; el saldo en grupos, en una). */
const lineasDeFigura = (f) => (f.tipo === "grupos" ? [`${f.titulo}: ${f.grupos.join(" · ")}`] : f.filas);
/* Y como se ve: sus trozos, separados por un espacio. */
const figuraSeVe = (f) => (f.tipo === "grupos" ? [f.titulo, ...f.grupos] : f.filas).join(" ");
const tablaLineas = (t) => [t.metodos.join(" · "), ...t.filas.map((f) => `${f.rubro} ${f.valores.map(K.cifraK).join(" ")}`)];
const tablaSeVe = (t) => [...t.metodos, ...t.filas.flatMap((f) => [f.rubro, ...f.valores.map(K.cifraK)])].join(" ");

/* Lo que dicen los datos de una pantalla, en el orden del paquete. */
function deDatos(p) {
  const lineas = [
    p.encabezado, p.objetivo, ...(p.parrafos ?? []), ...(p.figuras ?? []).flatMap(lineasDeFigura), ...(p.tabla ? tablaLineas(p.tabla) : []),
    ...(p.despues ?? []), p.pregunta, ...(p.lista ?? []), p.siguiente,
  ].filter(Boolean);
  return { lineas, opciones: p.opciones?.map((o) => o.texto) };
}

/* El kárdex pintado: sus capas, fecha por fecha, como los datos. */
const capasPintadas = (k) => [...k.querySelectorAll("[data-fecha]")].map((s) => [s.dataset.fecha, ...["entradas", "salidas", "saldos"].map((b) => [...s.querySelectorAll(`[data-bloque="${b}"] [data-capa]`)].map((c) => [...c.children].map((x) => x.textContent)))]);
const capasEsperadas = (kx) => kx.filas.map((f) => [f.f, ...[f.en, f.sa, f.sal].map((cs) => (cs ?? []).map((c) => c.map((v) => (v === null ? "" : K.cifraK(v)))))]);
const comprobarKardex = (k, kx, et) => {
  assert.ok(k, `${et}: sin kárdex`);
  assert.equal(k.querySelector("figcaption").textContent, kx.titulo, et);
  assert.deepEqual(capasPintadas(k), capasEsperadas(kx), `${et}: el kárdex pintado`);
  assert.ok(!k.textContent.includes("="), `${et}: el kárdex lleva «=»`);
  assert.deepEqual([...k.querySelectorAll(".t7kx-cab span")].map((s) => s.textContent), [ROTULOS_KX.cantidad, ROTULOS_KX.costoUnitario, ROTULOS_KX.costoTotal]);
};

/* ═══════════ 1 · LOS DATOS CONTRA EL RECORTE ═══════════ */

test("★★★ los datos son la sección del recorte con las correcciones de Mello, letra por letra y en los dos sentidos", () => {
  R.compararConSeccion(P, S, deDatos);
  assert.equal(P.pantallas.length, 7);
  assert.equal(P.pantallas.filter((p) => p.opciones).length, 4);
});

test("★★★ Mello: los errores de `lado-a-lado` llevan «Aquí,»; los de Near, que sonaban a regla, ya no están", () => {
  const cs = M.CORRECCIONES_MELLO_T72.filter((c) => c[0] === A.A3_ID);
  assert.equal(cs.length, 2);
  const l = pantalla("lado-a-lado");
  for (const [, , campo, viejo, nuevo] of cs) {
    assert.ok(M.seccionCruda(A.A3_ID).includes(`«${viejo}»`), campo);
    assert.ok(M.MELLO_E6.includes(`«${nuevo}»`), campo);
    assert.ok(l.opciones.some((o) => o.devolucion === nuevo), campo);
    assert.ok(!JSON.stringify(P).includes(viejo), campo);
  }
  for (const o of l.opciones.filter((x) => !x.correcta)) assert.match(o.devolucion, /^Aquí, /);
});

test("★★★ la opcional de Mello no se aplica: la fila del periódico se ve al llegar, antes de responder", () => {
  assert.ok(M.MELLO_E6.includes(M.NO_APLICADAS.periodicoTrasResponder));
  const t = pantalla("lado-a-lado").tabla;
  assert.equal(t.filas.at(-1).rubro, "Inventario final con el periódico");
  assert.equal(t.filas.at(-1).construida, true);
  assert.equal(pantalla("lado-a-lado").acierto.tabla, undefined);
});

test("★★★ regla de L: el «¿Por qué?» de `lado-a-lado` trae «solo» y va a la vista; el de `promedio`, plegado; PEPS y UEPS abren su kárdex", () => {
  assert.deepEqual(P.pantallas.filter((p) => p.acierto).map((p) => [p.id, p.acierto.porque ? (p.acierto.porqueALaVista ? "a la vista" : "plegado") : p.acierto.ver ? "ver" : "nada"]), [
    ["peps", "ver"], ["ueps", "ver"], ["promedio", "plegado"], ["lado-a-lado", "a la vista"],
  ]);
  assert.match(pantalla("lado-a-lado").acierto.porque, /solo revisa/);
  assert.equal(pantalla("peps").acierto.ver.kardex, A.KARDEX_A3.peps);
  assert.equal(pantalla("ueps").acierto.ver.kardex, A.KARDEX_A3.ueps);
});

test("★★★ ya no se adelanta «Con PEPS sería el mismo» antes de la pregunta de `lado-a-lado`", () => {
  assert.doesNotMatch(JSON.stringify(P), /sería el mismo/);
  assert.equal(pantalla("lado-a-lado").despues, undefined);
});

test("★★★ UEPS lleva su rótulo en el encabezado, en la tabla, en la opción y en su kárdex", () => {
  assert.equal(A.UEPS, "UEPS (no válido bajo NIIF)");
  assert.equal(pantalla("ueps").encabezado, `Método ${A.UEPS}`);
  assert.equal(A.KARDEX_A3.ueps.titulo, `Método ${A.UEPS}`);
  assert.equal(pantalla("lado-a-lado").tabla.metodos[1], A.UEPS);
  assert.equal(pantalla("lado-a-lado").opciones.find((o) => o.id === "ueps").texto, A.UEPS);
});

/* ═══════════ 2 · LAS CIFRAS ═══════════ */

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
      /* UEPS 5 jul: la v1 da el saldo sin totales y la opcional de Mello (aplicada por Near) se los pone. */
      const salV1 = metodo === "ueps" && r.f === "5 jul" ? [[30, 2010, 60300], [50, 2130, 106500]] : r.sal.capas;
      assert.deepEqual(d.sal, salV1, `${metodo} ${r.f}: saldos`);
      assert.equal(d.salT ?? null, r.sal.total, `${metodo} ${r.f}: total del saldo`);
      assert.equal(Boolean(d.fin), r.fin, `${metodo} ${r.f}: saldo final`);
    }
  }
});

test("★★★ los movimientos de la figura de `los-datos` son los del kárdex; los tres kárdex salen igual al recalcularlos", () => {
  const filas = pantalla("los-datos").figuras[0].filas;
  const ini = filas[0].match(/^(\d+ jul): tiene (\d+) a \$([\d.]+)$/);
  assert.deepEqual([...A.INICIAL_A3, A.INICIAL_A3.fecha], [Number(ini[2]), num(ini[3]), ini[1]]);
  const movs = filas.slice(1).map((t) => {
    const c = t.match(/^(\d+ jul): compra (\d+) a \$([\d.]+)$/);
    if (c) return { fecha: c[1], compra: [Number(c[2]), num(c[3])] };
    const v = t.match(/^(\d+ jul): vende (\d+)$/);
    return { fecha: v[1], venta: Number(v[2]) };
  });
  assert.deepEqual(A.MOVIMIENTOS_A3, movs);
  for (const [metodo, m] of [["peps", K.PEPS], ["ueps", K.UEPS_M], ["promedio", K.PROMEDIO]]) {
    const calc = K.kardex(A.INICIAL_A3, A.MOVIMIENTOS_A3, m);
    const datos = A.KARDEX_A3[metodo].filas;
    assert.deepEqual(datos.map((d) => [d.f, d.en ?? null, d.sa ?? null, d.sal]), calc.map((c) => [c.fecha, c.entrada ?? null, c.salida ?? null, c.saldo]), metodo);
    for (const d of datos) if (d.salT) assert.equal(d.salT, d.sal.reduce((s, c) => s + c[2], 0), `${metodo} ${d.f}`);
  }
});

test("★★★ los saldos de cada pregunta salen del kárdex de su método, y cada respuesta también", () => {
  const kx = A.KARDEX_A3;
  /* PEPS, 8 de julio: el saldo después del 5. */
  assert.deepEqual(kx.peps.filas[1].sal.map((c) => c[0]), [30, 50]);
  assert.deepEqual(pantalla("peps").figuras[0].grupos, ["30 del inicio", "50 del 5 de julio"]);
  assert.deepEqual(kx.peps.filas[2].sa.map((c) => c[0]), [30, 30]);
  assert.deepEqual(kx.peps.filas[2].sal, [[20, 2130, 42600]]);
  /* UEPS, 19 de julio: el saldo después del 14. */
  assert.deepEqual(kx.ueps.filas[3].sal.map((c) => [c[0], c[1]]), [[20, 2010], [40, 2250]]);
  assert.deepEqual(pantalla("ueps").figuras[0].grupos, ["20 del inicio", "40 del 14 de julio"]);
  assert.deepEqual(kx.ueps.filas[4].sa, [[35, 2250, 78750]]);
  /* Promedio: 20 por $41.700 el 13; llegan 40 a $2.250 = $90.000; (41.700 + 90.000) ÷ 60 = 2.195. */
  assert.deepEqual(kx.promedio.filas[2].sal, [[20, 2085, 41700]]);
  assert.equal(40 * 2250, 90000);
  assert.equal((41700 + 90000) / 60, 2195);
  assert.deepEqual(kx.promedio.filas[3].sal, [[60, 2195, 131700]]);
  assert.equal(256800 / 120, 2140);
});

test("★★★ la tabla de `lado-a-lado` sale de los tres kárdex; el periódico, de los mismos datos (cifras construidas)", () => {
  const t = pantalla("lado-a-lado").tabla;
  const r = ["peps", "ueps", "promedio"].map((m) => K.resumenKardex(K.kardex(A.INICIAL_A3, A.MOVIMIENTOS_A3, m === "peps" ? K.PEPS : m === "ueps" ? K.UEPS_M : K.PROMEDIO)));
  assert.deepEqual(t.filas[0].valores, r.map((x) => x.final));
  assert.deepEqual(t.filas[1].valores, r.map((x) => x.vendido));
  const disponible = 30 * 2010 + 50 * 2130 + 40 * 2250;
  assert.equal(disponible, 256800);
  assert.deepEqual(t.filas[2].valores, [25 * 2250, 25 * 2010, 25 * (disponible / 120)]);
  assert.ok(V1.includes("con el periódico serían UEPS 50.250 (25 × 2.010) · promedio 53.500 (25 × 2.140) · PEPS 56.250"));
  for (const x of r) assert.equal(x.vendido + x.final, disponible);
});

test("★★★ regla 3: ninguna cifra del periódico de T7-1; todas las del registro 5c de la v1", () => {
  const registro = V1.slice(V1.indexOf("## Registro 5c")).split("\n")[2];
  const todas = new Set();
  for (const k of Object.values(A.KARDEX_A3)) for (const f of k.filas) for (const c of [...(f.en ?? []), ...(f.sa ?? []), ...f.sal]) { todas.add(c[1]); todas.add(c[2]); }
  for (const f of pantalla("lado-a-lado").tabla.filas) f.valores.forEach((v) => todas.add(v));
  for (const v of todas) assert.ok(registro.includes(K.cifraK(v)), `${K.cifraK(v)} no está en el registro 5c de Near`);
  for (const x of ["1.300", "1.320", "1.325", "1.350", "1.380", "1.518.000", "1.486.000"]) assert.ok(!JSON.stringify(P).includes(x) && ![...todas].map(K.cifraK).includes(x), x);
  for (const interno of ["Near", "Mello", "ESCRITO POR CLAUDE", "PENDIENTE"]) assert.ok(!JSON.stringify(P.pantallas).includes(interno), interno);
});

/* ═══════════ 3 · MONTADA ═══════════ */

/* El kárdex de PEPS pintado solo, como se ve en el resumen. */
let kardexPepsSeVe;
{
  const m = await montar(h(Kardex, { kardex: A.KARDEX_A3.peps }));
  kardexPepsSeVe = R.figuras({ querySelectorAll: (q) => m.caja.querySelectorAll(q.replace(/\[data-pieza\] /g, "")) });
  m.desmontar();
}

const alLlegar = (p) => ({
  textos: [p.encabezado, p.objetivo, ...(p.parrafos ?? []), ...(p.despues ?? []), p.pregunta, ...(p.lista ?? []), p.siguiente].filter(Boolean),
  lineasBarajadas: [],
  figuras: [...(p.figuras ?? []).map(figuraSeVe), ...(p.tabla ? [tablaSeVe(p.tabla)] : []), ...(p.kardex ? kardexPepsSeVe : [])],
});
const alVer = async (p, visto) => comprobarKardex(visto.querySelector("[data-kardex]"), p.ver.kardex, `${p.id}: el kárdex del «Ver…»`);

test("★★★ montada: cada pantalla y cada estado, con la escalera, el foco, el «¿Por qué?», el kárdex del «Ver…» y el pie", async () => {
  const m = await montar(h(PantallasT7_2, { pieza: P, rotulo: "R" }));
  try {
    await R.recorrer({ caja: m.caja, P, tocar, w, alLlegar, figurasAlAcertar: (p) => alLlegar(p).figuras, alVer });
  } finally {
    m.desmontar();
  }
});

test("★★★ el resumen abre con el kárdex de PEPS completo (la figura va antes del texto)", async () => {
  const m = await montar(h(PantallasT7_2, { pieza: { ...P, pantallas: [pantalla("resumen")] }, rotulo: "R" }));
  try {
    comprobarKardex(m.caja.querySelector("[data-kardex]"), A.KARDEX_A3.peps, "resumen");
    assert.ok(m.caja.querySelector("[data-pieza] figure, [data-pieza] [data-figura], [data-pieza] [data-texto]").closest("[data-kardex]"), "la figura va primero (B1)");
  } finally {
    m.desmontar();
  }
});

test("★★ la tabla de `lado-a-lado`, pintada: los tres métodos, sus cifras y la fila construida marcada", async () => {
  const m = await montar(h(PantallasT7_2, { pieza: { ...P, pantallas: [pantalla("lado-a-lado")] }, rotulo: "R" }));
  try {
    const t = pantalla("lado-a-lado").tabla;
    assert.deepEqual([...m.caja.querySelectorAll("[data-metodos] [role=columnheader]")].map((x) => x.textContent), t.metodos);
    for (const f of t.filas) {
      const r = m.caja.querySelector(`[data-rubro="${f.rubro}"]`);
      assert.deepEqual([...r.querySelectorAll("[data-dato-metodo]")].map((x) => x.textContent), f.valores.map(K.cifraK));
      assert.equal(r.hasAttribute("data-construida"), Boolean(f.construida), f.rubro);
    }
  } finally {
    m.desmontar();
  }
});

test("★★ los pies son los de lo publicado, por pantalla (el recorte no los trae)", () => {
  assert.deepEqual(P.pantallas.map((p) => [p.id, p.pie, p.error?.pie ?? null, p.acierto?.pie ?? null]), [
    ["portada", "Basado en el libro, pp. 237-241", null, null],
    ["los-datos", "Basado en el libro, p. 238", null, null],
    ["peps", "Basado en el libro, pp. 215 y 238-239", "Basado en el libro, pp. 215 y 238-239", "Basado en el libro, pp. 215 y 238-239"],
    ["ueps", "Basado en el libro, pp. 216 y 240", "Basado en el libro, pp. 216 y 240", "Basado en el libro, pp. 216 y 240"],
    ["promedio", "Basado en el libro, pp. 218 y 240-241", "Basado en el libro, pp. 218 y 240-241", "Basado en el libro, pp. 218 y 240-241"],
    ["lado-a-lado", "Basado en el libro, pp. 222, 233-234 y 239-241", "Basado en el libro, pp. 222, 233-234 y 239-241", "Basado en el libro, pp. 222, 233-234 y 239-241"],
    ["resumen", "Basado en el libro, pp. 238-241", null, null],
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
  const enVista = PIEZAS_T7_2.find((x) => x.pieza.id === A.A3_ID);
  assert.equal(enVista.pieza, P);
  assert.equal(enVista.Pieza, PantallasT7_2);
  assert.equal(PIEZAS_T7_2.indexOf(enVista), 2);
  const dir = new URL("supabase/migrations/", RAIZ);
  assert.deepEqual(readdirSync(dir).filter((f) => readFileSync(new URL(f, dir), "utf8").includes(A.A3_ID)), []);
  for (const f of ["src/components/mecanicas/libros/t7/PantallasT7_2.jsx", "src/components/mecanicas/libros/t7/KardexT7_2.jsx", "src/data/contabilidadT7_2_a3.js"]) {
    assert.doesNotMatch(readFileSync(new URL(f, RAIZ), "utf8"), /from\s+["'][^"']*\/(fp|lib\/supabase)[^"']*["']|registrarActividad(Completada)?\s*\(|\.rpc\s*\(/, f);
  }
});
