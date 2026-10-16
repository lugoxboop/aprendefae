import { test } from "node:test";
import assert from "node:assert/strict";
import { readFileSync, readdirSync } from "node:fs";
import { JSDOM, VirtualConsole } from "jsdom";

/*
 * ═══════════════════════════════════════════════════════════════════════════
 * T7-2 · A1 «La cuenta que sí se mueve» (Célula C).
 *
 * EL RECORTE DEL LOTE 1 de Near (entrega 2, sección
 * «t7-2-a1-la-cuenta-que-si-se-mueve»), con la línea 3 del resumen de la
 * entrega 6 (correccionesMelloRecortesT72.mjs). Mello no la corrige.
 *
 *   · los datos son la sección, letra por letra y en los dos sentidos:
 *     pantallas, líneas, opciones, pista, errores, acierto y «¿Por qué?»
 *   · el «¿Por qué?» de `el-permanente` trae «cuando»: por la regla de L va a
 *     la vista; los otros dos, plegados
 *   · montada, pantalla por pantalla y estado por estado: los textos y la
 *     figura al llegar, nada plegado, la escalera (pista; luego la respuesta
 *     y su porqué, y la línea que se cierra en su lado), el foco, el acierto
 *     y su «¿Por qué?», el pie; la cuenta T del resumen (provisional para
 *     Watari) con lo que entra al debe y lo que sale al haber
 *   · las líneas se barajan al entrar; las opciones en cada intento
 *   · regla 3: ninguna cifra; fuera del catálogo de FP; primera de T7-2
 * ═══════════════════════════════════════════════════════════════════════════
 */

const { prepararDom } = await import("./t7-3-recorte.mjs");
const w = prepararDom(JSDOM, VirtualConsole);

const React = await import("react");
const { createRoot } = await import("react-dom/client");
const act = React.act;
const h = React.createElement;

const A = await import("../../data/contabilidadT7_2.js");
const M = await import("./correccionesMelloRecortesT72.mjs");
const R = await import("./t7-2-recorte.mjs");
const { SUBJECTS, APRENDER } = await import("../../data/subjects.js");
const { default: LaCuentaQueSiSeMueve } = await import("../../components/mecanicas/libros/t7/LaCuentaQueSiSeMueve.jsx");
const { PIEZAS_T7_2, TEMA_T7_2 } = await import("../../components/ContabilidadT7_2View.jsx");
const { VISTAS, vistaDeTema } = await import("../../ruta.js");

const RAIZ = new URL("../../../", import.meta.url);
const P = A.PIEZA_LA_CUENTA_QUE_SI_SE_MUEVE;
const S = M.seccionT72(A.A1_ID);
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

/* Lo que dicen los datos de una pantalla, en el orden del paquete. */
function deDatos(p) {
  const lineas = [p.objetivo, ...(p.parrafos ?? []), p.consigna, p.pregunta, ...(p.lista ?? []), p.siguiente].filter(Boolean);
  const opciones = p.lineas ? p.lineas.map((l) => l.texto) : p.opciones?.map((o) => o.texto);
  /* Lados: un error por lado bueno, en el orden del paquete («entra», «sale»), el mismo para todas sus líneas. */
  const erroresLados = p.lineas ? [["entra", A.DEBE], ["sale", A.HABER]].map(([clave, lado]) => {
    const t = [...new Set(p.lineas.filter((l) => l.lado === lado).map((l) => l.devolucion))];
    assert.equal(t.length, 1, `${p.id} · ${clave}: un solo texto`);
    return { clave, texto: t[0] };
  }) : undefined;
  return { lineas, opciones, erroresLados };
}

const CUENTA_T = [P.pantallas.at(-1).cuentaT].map((t) => `${t.cuenta} ${A.INTERFAZ.debe} ${t.debe} ${A.INTERFAZ.haber} ${t.haber}`);

/* ═══════════ 1 · LOS DATOS CONTRA EL RECORTE ═══════════ */

test("★★★ los datos son la sección del recorte (con la línea 3 del resumen de la entrega 6), letra por letra y en los dos sentidos", () => {
  R.compararConSeccion(P, S, deDatos);
  assert.equal(P.pantallas.length, 5);
  assert.equal(P.pantallas.filter((p) => p.opciones || p.lineas).length, 3);
});

test("★★★ entrega 6: la línea 3 del resumen dice «contracción del inventario»; la vieja ya no está", () => {
  assert.ok(M.seccionCruda(A.A1_ID).includes(`«${M.RESUMEN_A1_L3.viejo}»`), "la vieja está en la entrega 2");
  assert.equal(pantalla("resumen").lista[2], M.RESUMEN_A1_L3.nuevo);
  assert.ok(!JSON.stringify(P).includes(`"${M.RESUMEN_A1_L3.viejo}"`));
});

test("★★★ regla de L: el «¿Por qué?» con «cuando» va a la vista; los otros dos, plegados", () => {
  assert.deepEqual(P.pantallas.filter((p) => p.acierto?.porque).map((p) => [p.id, Boolean(p.acierto.porqueALaVista)]), [
    ["la-lista-del-libro", false], ["el-permanente", true], ["el-conteo-en-el-permanente", false],
  ]);
  assert.match(pantalla("el-permanente").acierto.porque, /avisan cuando queda/);
});

test("★★★ la lista del libro: cinco líneas, cada una a su lado, y una pista para las cinco que no dice el lado", () => {
  const L = pantalla("la-lista-del-libro");
  assert.deepEqual(L.lineas.map((l) => [l.id, l.lado]), [["compra", "debe"], ["devuelven-clientes", "debe"], ["vende", "haber"], ["devuelve-proveedores", "haber"], ["consumo", "haber"]]);
  for (const l of L.lineas) assert.equal(l.pista, undefined, `${l.id}: la pista es de la pantalla`);
  assert.doesNotMatch(L.pista, /\b(debe|haber)\b/i);
});

/* ═══════════ 2 · MONTADA ═══════════ */

const alLlegar = (p) => ({
  textos: [p.objetivo, ...(p.parrafos ?? []), p.consigna, p.pregunta, ...(p.lista ?? []), p.siguiente].filter(Boolean),
  lineasBarajadas: p.lineas?.map((l) => l.texto) ?? [],
  figuras: p.cuentaT ? CUENTA_T : [],
});

test("★★★ montada: cada pantalla y cada estado, con la escalera, el foco, el «¿Por qué?» y el pie", async () => {
  const m = await montar(h(LaCuentaQueSiSeMueve, { pieza: P, rotulo: "R" }));
  try {
    await R.recorrer({ caja: m.caja, P, tocar, w, alLlegar, figurasAlAcertar: (p) => alLlegar(p).figuras, alVer: () => assert.fail("A1 no tiene «Ver…»") });
  } finally {
    m.desmontar();
  }
});

test("★★★ la cuenta T del resumen: el nombre de la cuenta; lo que entra, en Debe; lo que sale, en Haber; es la figura y va antes del texto", async () => {
  const m = await montar(h(LaCuentaQueSiSeMueve, { pieza: { ...P, pantallas: [pantalla("resumen")] }, rotulo: "R" }));
  try {
    const t = m.caja.querySelector("[data-cuenta-t]");
    assert.equal(t.tagName, "FIGURE");
    assert.equal(t.querySelector("figcaption").textContent, "Inventario de mercancías");
    assert.deepEqual([...t.querySelectorAll("[data-lado-t]")].map((x) => [x.dataset.ladoT, x.textContent]), [["debe", "DebeEntradas"], ["haber", "HaberSalidas"]]);
    const primero = m.caja.querySelector("[data-pieza] figure, [data-pieza] [data-texto]");
    assert.equal(primero, t, "la figura va primero (B1)");
  } finally {
    m.desmontar();
  }
});

test("★★ las líneas se barajan al entrar, y las opciones en cada intento", async () => {
  const vistos = new Set();
  for (let i = 0; i < 12; i++) {
    const m = await montar(h(LaCuentaQueSiSeMueve, { pieza: { ...P, pantallas: [pantalla("la-lista-del-libro")] }, rotulo: "R" }));
    vistos.add([...m.caja.querySelectorAll("[data-fila]")].map((x) => x.dataset.fila).join());
    m.desmontar();
  }
  assert.ok(vistos.size > 1, "las líneas salen siempre en el mismo orden");
  const m = await montar(h(LaCuentaQueSiSeMueve, { pieza: { ...P, pantallas: [pantalla("el-conteo-en-el-permanente")] }, rotulo: "R" }));
  try {
    const orden = () => [...m.caja.querySelectorAll("[data-opcion]")].map((b) => b.dataset.opcion);
    let antes = orden();
    for (let i = 0; i < 8; i++) {
      await tocar(m.caja.querySelector('[data-opcion="hallar"]'));
      await tocar(m.caja.querySelector('[data-boton="confirmar"]'));
      await tocar(m.caja.querySelector('[data-boton="probar-otra"]'));
      assert.notDeepEqual(orden(), antes);
      antes = orden();
    }
  } finally {
    m.desmontar();
  }
});

test("★★ los pies son los de lo publicado, por pantalla (el recorte no los trae)", () => {
  assert.deepEqual(P.pantallas.map((p) => [p.id, p.pie, p.error?.pie ?? null, p.acierto?.pie ?? null]), [
    ["portada", "Basado en el libro, pp. 207-209 y 233-234", null, null],
    ["la-lista-del-libro", "Basado en el libro, pp. 207-208", "Basado en el libro, pp. 207-208", "Basado en el libro, pp. 207-208"],
    ["el-permanente", "Basado en el libro, pp. 233-234 y 236", "Basado en el libro, pp. 233-234 y 236", "Basado en el libro, pp. 233-234 y 236"],
    ["el-conteo-en-el-permanente", "Basado en el libro, pp. 233-234", "Basado en el libro, pp. 233-234", "Basado en el libro, pp. 233-234"],
    ["resumen", "Basado en el libro, pp. 207-208 y 233-236", null, null],
  ]);
});

/* ═══════════ 3 · REGLA 3 Y CATÁLOGO ═══════════ */

test("★★★ regla 3: ningún número fuera de los pies; nada interno; la marca de lo escrito por Claude no se ve", () => {
  const textos = [];
  const recoger = (v, k) => { if (typeof v === "string") { if (k !== "pie" && k !== "id") textos.push(v); } else if (Array.isArray(v)) v.forEach((x) => recoger(x, k)); else if (v && typeof v === "object") for (const [kk, x] of Object.entries(v)) recoger(x, kk); };
  recoger(P);
  for (const t of textos) assert.doesNotMatch(t, /\d/, t);
  for (const interno of ["≈", "Near", "Mello", "ESCRITO POR CLAUDE", "PENDIENTE", "T7-1"]) assert.ok(!textos.join("\n").includes(interno), interno);
});

test("★★★ fuera del catálogo de FP; id t7-2-; primera pieza de T7-2; sin nada que pague", () => {
  assert.equal(A.A1_ID, "t7-2-a1-la-cuenta-que-si-se-mueve");
  assert.equal(P.numero, 1);
  const tema = SUBJECTS.contabilidad.topics.find((t) => t.id === TEMA_T7_2);
  assert.equal(tema.title, "Inventarios II: el sistema permanente");
  assert.equal(TEMA_T7_2, "inventarios-permanente");
  const temas = SUBJECTS.contabilidad.topics.map((t) => t.id);
  assert.equal(temas.indexOf(TEMA_T7_2), temas.indexOf("inventarios-periodico") + 1);
  assert.ok(VISTAS.has(TEMA_T7_2));
  assert.equal(vistaDeTema(TEMA_T7_2), TEMA_T7_2);
  const a = tema.actividades.find((x) => x.id === A.A1_ID);
  assert.deepEqual(a.clasificacion, { tipo: APRENDER });
  assert.equal(a.nombre, P.titulo);
  assert.equal(tema.actividades[0].id, A.A1_ID);
  assert.equal(PIEZAS_T7_2[0].pieza, P);
  assert.equal(PIEZAS_T7_2[0].Pieza, LaCuentaQueSiSeMueve);
  const dir = new URL("supabase/migrations/", RAIZ);
  assert.deepEqual(readdirSync(dir).filter((f) => readFileSync(new URL(f, dir), "utf8").includes(A.A1_ID)), []);
  for (const f of ["src/components/mecanicas/libros/t7/LaCuentaQueSiSeMueve.jsx", "src/data/contabilidadT7_2.js"]) {
    assert.doesNotMatch(readFileSync(new URL(f, RAIZ), "utf8"), /from\s+["'][^"']*\/(fp|lib\/supabase)[^"']*["']|registrarActividad(Completada)?\s*\(|\.rpc\s*\(/, f);
  }
});
