import { test } from "node:test";
import assert from "node:assert/strict";
import { readFileSync, readdirSync } from "node:fs";
import { JSDOM, VirtualConsole } from "jsdom";
import { conCorreccionesDeMello } from "./correccionesMello.mjs";

/*
 * ═══════════════════════════════════════════════════════════════════════════
 * T7-2 · A2 «La venta en dos asientos» (Célula C).
 *
 * EL RECORTE DEL LOTE 1 de Near (entrega 6, sección
 * «t7-2-a2-la-venta-en-dos-asientos») con la corrección obligatoria de Mello
 * (la pista de `la-compra`) encima: correccionesMelloRecortesT72.mjs.
 *
 *   · los datos son la sección corregida, letra por letra y en los dos
 *     sentidos: pantallas, líneas, opciones (con «Ver el primer asiento»),
 *     pistas, errores, acierto con su figura y «¿Por qué?»
 *   · la línea `inventario` conserva su pista del lote 2 (el recorte solo
 *     trae la de `costo`)
 *   · los asientos son los de la v1 (E-1 con su único dato, E-2 completo),
 *     y X1 y la regla 3 se cumplen
 *   · montada, estado por estado: textos, figuras, nada plegado al llegar,
 *     «Ver el primer asiento» (botón con aria-expanded), la escalera de cada
 *     pregunta y de cada línea, el foco, el asiento de la compra que aparece
 *     con el acierto, el «¿Por qué?» plegado, el pie; el resumen abre con los
 *     dos asientos de la venta
 *   · ya no delata la respuesta en `la-compra` (C1)
 *   · fuera del catálogo de FP; en T7-2 después de A1
 * ═══════════════════════════════════════════════════════════════════════════
 */

const { prepararDom } = await import("./t7-3-recorte.mjs");
const w = prepararDom(JSDOM, VirtualConsole);

const React = await import("react");
const { createRoot } = await import("react-dom/client");
const act = React.act;
const h = React.createElement;

const A = await import("../../data/contabilidadT7_2_a2.js");
const M = await import("./correccionesMelloRecortesT72.mjs");
const R = await import("./t7-2-recorte.mjs");
const { SUBJECTS, APRENDER } = await import("../../data/subjects.js");
const { default: LaVentaEnDosAsientos } = await import("../../components/mecanicas/libros/t7/LaVentaEnDosAsientos.jsx");
const { PIEZAS_T7_2, TEMA_T7_2 } = await import("../../components/ContabilidadT7_2View.jsx");

const RAIZ = new URL("../../../", import.meta.url);
const leer = (f) => readFileSync(new URL(`orquestador/conocimiento/paquetes/${f}`, RAIZ), "utf8");
const V1 = leer("t7-2-a2-v1.md");
const CONTENIDO = V1.slice(V1.indexOf("## Contenido"), V1.indexOf("## Erratas y nombres"));
const P = A.PIEZA_LA_VENTA_EN_DOS_ASIENTOS;
const S = M.seccionT72(A.A2_ID);
const pantalla = (id) => P.pantallas.find((x) => x.id === id);
const COMPRA = pantalla("la-compra");
const SEGUNDO = pantalla("el-segundo-asiento");
const RESUMEN = pantalla("resumen");

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

/* Un asiento como lo escribe el paquete en «Figura: …»: cada cuenta, y su monto si lo lleva. */
const comoFigura = (a) => a.lineas.map((l) => (l.monto === null ? l.cuenta : `${l.cuenta} $${A.cifra(l.monto)}`)).join(" ");
/* Un asiento como se ve: rótulo, fecha, Debe, Haber y cada línea con su monto (el oculto no se ve). */
const comoSeVe = (a) => [a.rotulo, a.fecha, A.INTERFAZ.debe, A.INTERFAZ.haber, ...a.lineas.flatMap((l) => (l.monto === null ? [l.cuenta] : [l.cuenta, A.cifra(l.monto)]))].filter(Boolean).join(" ");

/* Lo que dicen los datos de una pantalla, en el orden del paquete. */
function deDatos(p) {
  const lineas = [
    ...(p.asientos ?? []).length ? [p.asientos.map((a) => a.rotulo).join(" · ")] : [],
    p.objetivo, ...(p.parrafos ?? []), p.consigna, p.pregunta, ...(p.estructura ?? []), p.cierre, ...(p.lista ?? []), p.siguiente,
  ].filter(Boolean);
  const opciones = p.lineas ? [...p.lineas.map((l) => `${l.cuenta} $${A.cifra(l.monto)}`), ...(p.ver ? [p.ver.texto] : [])] : p.opciones?.map((o) => o.texto);
  const erroresLados = p.lineas?.map((l) => ({ clave: l.id, texto: l.devolucion }));
  return { lineas, opciones, erroresLados, figuraAcierto: p.acierto?.asiento ? comoFigura(p.acierto.asiento) : null };
}

/* ═══════════ 1 · LOS DATOS CONTRA EL RECORTE ═══════════ */

test("★★★ los datos son la sección del recorte con la corrección de Mello, letra por letra y en los dos sentidos", () => {
  R.compararConSeccion(P, S, deDatos);
  assert.equal(P.pantallas.length, 6);
  assert.equal(P.pantallas.filter((p) => p.opciones || p.lineas).length, 3);
});

test("★★★ Mello: la pista de `la-compra` es la suya; la de Near, que delataba, ya no está", () => {
  const [, , , viejo, nuevo] = M.CORRECCIONES_MELLO_T72.find((c) => c[0] === A.A2_ID);
  assert.ok(M.seccionCruda(A.A2_ID).includes(`«${viejo}»`));
  assert.equal(COMPRA.pista, nuevo);
  assert.ok(M.MELLO_E6.includes(`«${nuevo}»`));
  assert.ok(!JSON.stringify(P).includes(viejo));
});

test("★★★ la línea `inventario` lleva la pista del lote 2; la de `costo`, la del recorte; ninguna dice el lado", () => {
  const L2 = conCorreccionesDeMello(leer("lote2-pistas-v1.md"));
  const inv = SEGUNDO.lineas.find((l) => l.id === "inventario");
  assert.ok(L2.includes(`| P3 · \`el-segundo-asiento\` · inventario ² | Línea «Inventario de mercancías» (Debe o Haber) | «${inv.pista}» |`));
  assert.deepEqual(Object.keys(S.pantallas[2].pistasLinea), ["costo"]);
  for (const l of SEGUNDO.lineas) assert.doesNotMatch(l.pista, /\b(al|va al) (debe|haber)\b/i, l.id);
});

test("★★★ los asientos son los de la v1, línea por línea: E-1 con su único dato, E-2 completo; el del costo, el de P3 de la v1", () => {
  const tabla = (fecha) => {
    const i = CONTENIDO.indexOf(`| ${fecha} | Debe | Haber |`);
    assert.ok(i >= 0, fecha);
    const filas = [];
    for (const l of CONTENIDO.slice(i).split("\n").slice(2)) { if (!l.startsWith("| ")) break; filas.push(l.split("|").slice(1, 4).map((c) => c.trim())); }
    return filas;
  };
  const enTabla = (a) => a.lineas.map((l) => { const m = l.monto === null ? "●" : A.cifra(l.monto); return [l.cuenta, l.lado === A.DEBE ? m : "", l.lado === A.HABER ? m : ""]; });
  assert.deepEqual(enTabla(COMPRA.acierto.asiento), tabla("16 de abril"));
  assert.deepEqual(enTabla(SEGUNDO.ver.asiento), tabla("20 de abril"));
  const [venta, costo] = RESUMEN.asientos;
  assert.deepEqual(enTabla(venta), tabla("20 de abril"));
  const linea = CONTENIDO.split("\n").find((l) => l.startsWith("- Líneas: «Costo de mercancía vendida"));
  const v1 = [...linea.matchAll(/«([^»]+) · \$([\d.]+)» → (Debe|Haber)/g)].map((m) => [m[1], m[2], m[3] === "Debe" ? A.DEBE : A.HABER]);
  assert.deepEqual(costo.lineas.map((l) => [l.cuenta, A.cifra(l.monto), l.lado]), v1);
  assert.deepEqual(SEGUNDO.lineas.map((l) => [l.cuenta, A.cifra(l.monto), l.lado]), v1);
  /* E-2 cuadra. */
  for (const a of RESUMEN.asientos) {
    const suma = (lado) => a.lineas.filter((l) => l.lado === lado).reduce((s, l) => s + l.monto, 0);
    assert.equal(suma(A.DEBE), suma(A.HABER));
  }
});

test("★★★ X1 y regla 3: ninguna cifra de X1, ninguna suma; solo las cifras de E-1 y E-2 y las fechas; nada interno", () => {
  const X1 = [800000, 175000, 5625000, 5800000];
  const SUMAS_E2 = 9280000;
  const todo = JSON.stringify(P);
  for (const x of [...X1, SUMAS_E2]) assert.ok(!new RegExp(`(^|[^\\d.])${A.cifra(x).replace(/\./g, "\\.")}(?![\\d.])`).test(todo), A.cifra(x));
  const textos = [];
  const recoger = (v, k) => { if (typeof v === "string") { if (k !== "pie" && k !== "id") textos.push(v); } else if (Array.isArray(v)) v.forEach((x) => recoger(x, k)); else if (v && typeof v === "object") for (const [kk, x] of Object.entries(v)) recoger(x, kk); };
  recoger(P);
  const cifras = textos.join(" ").match(/\d+(?:[.,]\d+)*/g) ?? [];
  assert.deepEqual([...new Set(cifras)].filter((c) => !["5.000.000", "8.000.000", "16", "20", "1", "2"].includes(c)), []);
  for (const interno of ["≈", "Near", "Mello", "Watari", "C7-", "X1", "T7-1", "ESCRITO POR CLAUDE"]) assert.ok(!textos.join("\n").includes(interno), interno);
});

test("★★★ C1: `la-compra` ya no trae su respuesta en el párrafo de arriba", () => {
  assert.doesNotMatch(COMPRA.parrafos.join(" "), /Inventario de mercancías/);
});

/* ═══════════ 2 · MONTADA ═══════════ */

const alLlegar = (p) => ({
  textos: [p.objetivo, ...(p.parrafos ?? []), p.consigna, ...(p.ver ? [p.ver.texto] : []), p.pregunta, p.cierre, ...(p.lista ?? []), p.siguiente].filter(Boolean),
  lineasBarajadas: p.lineas?.map((l) => l.cuenta) ?? [],
  figuras: [...(p.asientos ?? []).map(comoSeVe), ...(p.estructura ? [p.estructura.join(" ")] : [])],
});
const figurasAlAcertar = (p) => [...alLlegar(p).figuras, ...(p.acierto?.asiento ? [comoSeVe(p.acierto.asiento)] : [])];
const alVer = async (p, visto) => {
  assert.deepEqual(R.figuras({ querySelectorAll: (q) => visto.querySelectorAll(q.replace(/\[data-pieza\] /g, "")) }), [comoSeVe(p.ver.asiento)], `${p.id}: lo que abre el «Ver…»`);
};

test("★★★ montada: cada pantalla y cada estado, con la escalera, el foco, el «Ver…», el asiento del acierto, el «¿Por qué?» y el pie", async () => {
  const m = await montar(h(LaVentaEnDosAsientos, { pieza: P, rotulo: "R" }));
  try {
    await R.recorrer({ caja: m.caja, P, tocar, w, alLlegar, figurasAlAcertar, alVer });
  } finally {
    m.desmontar();
  }
});

test("★★ el monto que no se muestra: casilla vacía oculta al lector, y el lector oye que no se muestra", async () => {
  const m = await montar(h(LaVentaEnDosAsientos, { pieza: { ...P, pantallas: [COMPRA] }, rotulo: "R" }));
  try {
    await tocar(m.caja.querySelector('[data-opcion="inventario"]'));
    await tocar(m.caja.querySelector('[data-boton="confirmar"]'));
    const ocultos = [...m.caja.querySelectorAll("[data-oculto]")];
    assert.equal(ocultos.length, 3);
    for (const o of ocultos) {
      const casilla = o.querySelector("i[aria-hidden=true]");
      assert.ok(casilla);
      assert.equal(casilla.textContent, "");
      assert.equal(o.textContent, A.PENDIENTE_DE_REVISION.montoOculto);
    }
  } finally {
    m.desmontar();
  }
});

test("★★★ lados: «Confirmar» espera las dos líneas; «Probar otra» devuelve solo la equivocada", async () => {
  const m = await montar(h(LaVentaEnDosAsientos, { pieza: { ...P, pantallas: [SEGUNDO] }, rotulo: "R" }));
  const lado = (l, c) => m.caja.querySelector(`[data-linea="${l}"][data-lado="${c}"]`);
  try {
    const [buena, mala] = SEGUNDO.lineas;
    await tocar(lado(buena.id, buena.lado));
    assert.equal(m.caja.querySelector('[data-boton="confirmar"]').getAttribute("aria-disabled"), "true");
    await tocar(lado(mala.id, buena.lado));
    await tocar(m.caja.querySelector('[data-boton="confirmar"]'));
    assert.deepEqual([...m.caja.querySelectorAll("[data-marca]")].map((x) => x.closest("[data-linea]").dataset.linea), [mala.id]);
    await tocar(m.caja.querySelector('[data-boton="probar-otra"]'));
    assert.equal(lado(buena.id, buena.lado).getAttribute("aria-pressed"), "true");
    assert.equal(lado(mala.id, A.DEBE).getAttribute("aria-pressed"), "false");
    assert.equal(lado(mala.id, A.HABER).getAttribute("aria-pressed"), "false");
  } finally {
    m.desmontar();
  }
});

test("★★ el resumen abre con los dos asientos, cada uno con su rótulo (la figura va antes del texto)", async () => {
  const m = await montar(h(LaVentaEnDosAsientos, { pieza: { ...P, pantallas: [RESUMEN] }, rotulo: "R" }));
  try {
    assert.deepEqual([...m.caja.querySelectorAll("[data-rotulo-asiento]")].map((x) => x.textContent), ["Asiento 1: lo que se cobra", "Asiento 2: lo que costó"]);
    assert.ok(m.caja.querySelector("[data-pieza] [data-figura], [data-pieza] [data-texto]").matches("[data-figura]"), "la figura va primero (B1)");
  } finally {
    m.desmontar();
  }
});

test("★★ los pies son los de lo publicado, por pantalla (el recorte no los trae)", () => {
  assert.deepEqual(P.pantallas.map((p) => [p.id, p.pie, p.error?.pie ?? null, p.acierto?.pie ?? null]), [
    ["portada", "Basado en el libro, pp. 234-237", null, null],
    ["la-compra", "Basado en el libro, p. 234", "Basado en el libro, p. 234", "Basado en el libro, pp. 234-235"],
    ["el-segundo-asiento", "Basado en el libro, pp. 236-237", "Basado en el libro, pp. 236-237", "Basado en el libro, pp. 236-237"],
    ["por-que-dos-asientos", "Basado en el libro, pp. 209 y 233-236", "Basado en el libro, pp. 209 y 233-236", "Basado en el libro, pp. 209 y 233-236"],
    ["en-el-estado-de-resultados", "Basado en el libro, pp. 214 y 236-237", null, null],
    ["resumen", "Basado en el libro, pp. 234-237", null, null],
  ]);
  for (const p of new Set(P.pantallas.flatMap((x) => [x.pie, x.error?.pie, x.acierto?.pie]).filter(Boolean))) assert.ok(V1.includes(`«${p}»`), p);
});

/* ═══════════ 3 · CATÁLOGO ═══════════ */

test("★★★ fuera del catálogo de FP; en T7-2 después de A1; sin nada que pague", () => {
  assert.equal(A.A2_ID, "t7-2-a2-la-venta-en-dos-asientos");
  assert.equal(P.numero, 2);
  const tema = SUBJECTS.contabilidad.topics.find((t) => t.id === TEMA_T7_2);
  const a = tema.actividades.find((x) => x.id === A.A2_ID);
  assert.deepEqual(a.clasificacion, { tipo: APRENDER });
  assert.equal(a.nombre, P.titulo);
  const aprender = tema.actividades.filter((x) => x.clasificacion.tipo === APRENDER).map((x) => x.id);
  assert.equal(aprender.indexOf(A.A2_ID), aprender.indexOf("t7-2-a1-la-cuenta-que-si-se-mueve") + 1);
  const enVista = PIEZAS_T7_2.find((x) => x.pieza.id === A.A2_ID);
  assert.equal(enVista.pieza, P);
  assert.equal(enVista.Pieza, LaVentaEnDosAsientos);
  assert.equal(PIEZAS_T7_2.indexOf(enVista), 1);
  const dir = new URL("supabase/migrations/", RAIZ);
  assert.deepEqual(readdirSync(dir).filter((f) => readFileSync(new URL(f, dir), "utf8").includes(A.A2_ID)), []);
  for (const f of ["src/components/mecanicas/libros/t7/LaVentaEnDosAsientos.jsx", "src/data/contabilidadT7_2_a2.js"]) {
    assert.doesNotMatch(readFileSync(new URL(f, RAIZ), "utf8"), /from\s+["'][^"']*\/(fp|lib\/supabase)[^"']*["']|registrarActividad(Completada)?\s*\(|\.rpc\s*\(/, f);
  }
});
