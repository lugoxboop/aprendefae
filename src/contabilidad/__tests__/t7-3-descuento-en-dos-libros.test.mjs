import { test } from "node:test";
import assert from "node:assert/strict";
import { readFileSync, readdirSync } from "node:fs";
import { JSDOM, VirtualConsole } from "jsdom";
import { seccion, compararDatos, recorrer, prepararDom, citas, CONDICION } from "./t7-3-recorte.mjs";
import { NO_OPERACIONAL as C7, CORRECCIONES_T73, MELLO_T73, NEAR_T73, aplicarAlRecorte, palabrasAlAcertar } from "./correccionesMelloAciertos.mjs";

/*
 * ═══════════════════════════════════════════════════════════════════════════
 * T7-3 · A4 «El descuento en los dos libros» (Célula C) · Aprender · RECORTE.
 *
 *   · cada pantalla, texto, opción, pista, error, acierto y «¿Por qué?» es
 *     el del recorte de Near (lote1-recortes-t73-v1.md), letra por letra,
 *     con los cambios al lote 2 y al anexo de su tabla (`cierre`)
 *   · Mello (mello-recortes-v1.md): la pista de P1
 *   · que el descuento es un ingreso para quien compra ya no se lee antes de
 *     preguntar su lado: va al «¿Por qué?»
 *   · la cuenta T de San Calixto en el cierre; las dos cuentas T lado a lado
 *     en el resumen
 *   · ACIERTOS C7: P3 `no-operacional` sale de t7-3-tres-aciertos-c7.md
 *     (Near) con N-1 de Mello (auditoria-mello-enganche-v6-y-t7-3-aciertos.md,
 *     §2): el acierto lleva la condición del saldo y la del permanente, a la
 *     vista y sin «¿Por qué?» (C7), y sin «Así es.»; 59 palabras (B2)
 *   · las cifras son las de A3; fuera del catálogo de FP
 * ═══════════════════════════════════════════════════════════════════════════
 */

const w = prepararDom(JSDOM, VirtualConsole);
const React = await import("react");
const { createRoot } = await import("react-dom/client");
const act = React.act;
const h = React.createElement;

const A = await import("../../data/contabilidadT7_3_a4.js");
const A3 = await import("../../data/contabilidadT7_3_a3.js");
const { SUBJECTS, APRENDER } = await import("../../data/subjects.js");
const { default: PantallasT7_3, cifra } = await import("../../components/mecanicas/libros/t7/PantallasT7_3.jsx");
const { textosDelError } = await import("../../components/mecanicas/libros/t7/escaleraAyuda.js");
const { PIEZAS_T7_3, TEMA_T7_3 } = await import("../../components/ContabilidadT7_3View.jsx");

const RAIZ = new URL("../../../", import.meta.url);
const leer = (f) => readFileSync(new URL(f, RAIZ), "utf8");
const RECORTE = leer("orquestador/conocimiento/paquetes/lote1-recortes-t73-v1.md");
const MELLO = leer("orquestador/conocimiento/paquetes/mello-recortes-v1.md");
const P = A.PIEZA_EL_DESCUENTO_EN_DOS_LIBROS;
const S = seccion(RECORTE, P.id);
const pantalla = (id) => P.pantallas.find((x) => x.id === id);
const s = (id) => S.pantallas.find((x) => x.id === id);
const DCC = "Descuento comercial condicionado";

/* Mello, entrega 3: la pista de P1 pedía recordar algo que nunca se enseñó. Gana sobre el recorte. */
const MELLO_A4 = MELLO.slice(MELLO.indexOf("**«El descuento en los dos libros»"), MELLO.indexOf("**«Sobrantes y faltantes»"));
const PISTA_MELLO = citas(MELLO_A4.split("\n").find((l) => l.includes("Reemplazo:")))[0];
assert.equal(s("el-pago").pista, "Santa Martha es quien recibe el descuento. Recuerda de qué lado lo anota quien lo recibe.");
assert.ok(MELLO_A4.includes("«Recuerda de qué lado lo anota quien lo recibe»"));
s("el-pago").pista = PISTA_MELLO;
/* Aciertos C7: P3, con la tabla final de Near y N-1 de Mello encima. */
aplicarAlRecorte(s("no-operacional"), C7);

/* La tabla de cambios del recorte: [campo, viejo, nuevo]. */
const CAMBIOS = RECORTE.split("\n").filter((l) => /^\| (Pista|Anexo) · `descuento-en-dos-libros`/.test(l)).map((l) => [l.split(" | ")[0], ...citas(l)]);

/* ═══════════ 1 · DATOS ═══════════ */

test("★★★ pantallas, textos, opciones, pista, errores, acierto y ¿Por qué?: los del recorte con Mello, letra por letra", () => {
  assert.deepEqual(S.pantallas.map((x) => x.id), ["portada", "el-pago", "cierre", "no-operacional", "resumen"]);
  compararDatos(P, S);
  assert.equal(pantalla("el-pago").pista, "Para quien vende, la cuenta fue al debe. Santa Martha está del otro lado del negocio.");
  assert.equal(pantalla("portada").objetivo, S.pantallas[0].lineas[0]);
  for (const id of ["quien-compra", "repaso", "permanente"]) assert.equal(pantalla(id), undefined, id);
});

test("★★★ los cambios del recorte al lote 2 y al anexo: la pista de `cierre` y la tercera opción", () => {
  assert.equal(CAMBIOS.length, 2);
  const [pista, anexo] = CAMBIOS;
  assert.match(pista[0], /Pista · `descuento-en-dos-libros` · `cierre`/);
  assert.equal(pantalla("cierre").pista, pista[2]);
  assert.match(anexo[0], /Anexo · `descuento-en-dos-libros` · `cierre`/);
  assert.equal(pantalla("cierre").opciones.find((o) => o.id === "no-se-cierra").devolucion, anexo[2]);
  const todo = JSON.stringify(P);
  assert.ok(!todo.includes(pista[1]) && !todo.includes(anexo[1]));
});

test("★★★ que el descuento es un ingreso para quien compra no se lee antes de preguntar el lado: va al ¿Por qué?", () => {
  const antes = [pantalla("portada").objetivo, ...pantalla("el-pago").parrafos, pantalla("el-pago").pregunta];
  for (const t of antes) assert.doesNotMatch(t, /ingreso/);
  assert.match(pantalla("el-pago").acierto.porque, /^Para quien compra, el descuento es un ingreso/);
});

test("★★★ C7 · P3 sin plegado: las dos condiciones (el saldo y el permanente) van en el acierto, a la vista", () => {
  const p = pantalla("no-operacional");
  assert.equal(p.acierto.porque, undefined);
  assert.equal(p.acierto.porqueALaVista, undefined);
  assert.match(p.acierto.texto, /^En Santa Martha, con saldo en el haber, es ingreso no operacional\./);
  assert.match(p.acierto.texto, /Con el permanente, San Calixto anota también el costo\./);
  assert.deepEqual(P.pantallas.filter((x) => x.acierto?.porqueALaVista).map((x) => x.id), []);
});

test("★★★ N-1 de Mello: el acierto nuevo, sin «Así es.»; lo demás de P3, de la tabla final de Near; B2: 59", () => {
  assert.ok(NEAR_T73.includes(CORRECCIONES_T73[1][0]));
  for (const f of CORRECCIONES_T73[1][1]) assert.ok(MELLO_T73.includes(f));
  const p = pantalla("no-operacional");
  assert.equal(p.acierto.texto, C7.Acierto.textos[0]);
  assert.doesNotMatch(p.acierto.texto, /Así es/);
  assert.deepEqual(p.parrafos, C7["Definición"].textos);
  assert.equal(p.pregunta, C7.Pregunta.textos[0]);
  assert.deepEqual(p.opciones.map((o) => [o.id, o.texto, o.correcta ?? false]), [["gasto", "Gasto no operacional", true], ["ingreso", "Ingreso no operacional", false], ["costo", "Costo de mercancía vendida", false]]);
  assert.deepEqual(p.opciones.map((o) => o.texto), C7.Opciones.textos);
  assert.equal(palabrasAlAcertar(C7), 59);
});

test("★★★ las cifras son las de A3: el mismo ejemplo", () => {
  const C = A3.H3_LIBRO;
  const l = pantalla("el-pago").acierto.asientos[0].lineas;
  assert.deepEqual(l.map((x) => [x.cuenta, x.lado, x.monto]), [["Cuentas por pagar – proveedores", "debe", C.cliente], [DCC, "haber", C.condicionado], ["Caja o Bancos", "haber", C.pago]]);
  assert.equal(C.cliente, C.condicionado + C.pago);
  const ts = [...pantalla("cierre").cuentasT, ...pantalla("resumen").cuentasTLado.cuentas];
  for (const t of ts) assert.deepEqual([...t.debe, ...t.haber].map((m) => m.monto), [C.condicionado]);
});

/* ═══════════ 2 · MONTADA ═══════════ */

const montar = async () => {
  const caja = document.createElement("div");
  document.body.appendChild(caja);
  const raiz = createRoot(caja);
  await act(async () => { raiz.render(h(PantallasT7_3, { pieza: P, rotulo: "R" })); });
  return { caja, desmontar: () => { act(() => raiz.unmount()); caja.remove(); } };
};
const tocar = async (el) => {
  assert.ok(el, "no está el elemento que se quería tocar");
  await act(async () => { el.dispatchEvent(new w.MouseEvent("click", { bubbles: true })); });
};
/* Una cuenta T: [titular, cuenta, lo del debe, lo del haber]. */
const cuentaT = (t) => [t.querySelector(".t73p-titular").textContent, t.querySelector(".t73p-t-cuenta").textContent,
  [...t.querySelectorAll('[data-lado-t="debe"] [data-mov-t]')].map((x) => x.textContent), [...t.querySelectorAll('[data-lado-t="haber"] [data-mov-t]')].map((x) => x.textContent)];
const SALDO = cifra(A3.H3_LIBRO.condicionado);

test("★★★ se recorre entera: cada pantalla y cada estado, contra el recorte", async () => {
  const m = await montar();
  try {
    await recorrer({
      caja: m.caja, P, S, tocar, w, textosDelError,
      async alLlegar(k, c) {
        const id = S.pantallas[k].id;
        const ts = [...c.querySelectorAll("[data-cuenta-t]")];
        if (id === "cierre") {
          /* La cuenta T de San Calixto, con el saldo en el debe, antes del texto. */
          assert.deepEqual(ts.map(cuentaT), [["San Calixto", DCC, [SALDO], []]]);
          const tras = [...c.querySelectorAll("[data-texto]")].find((x) => x.textContent.startsWith("Al final del periodo"));
          assert.ok(ts[0].compareDocumentPosition(tras) & w.Node.DOCUMENT_POSITION_FOLLOWING);
        } else if (id === "resumen") {
          /* Las dos, una al lado de la otra, con su rótulo arriba. */
          const fig = c.querySelector("figure[data-cuentas-t-lado]");
          assert.equal(fig.querySelector("figcaption").textContent, "San Calixto: debe · Santa Martha: haber");
          assert.equal(fig.querySelector(".t73p-ts-lado-par").children.length, 2);
          assert.deepEqual(ts.map(cuentaT), [["San Calixto", DCC, [SALDO], []], ["Santa Martha", DCC, [], [SALDO]]]);
        } else assert.equal(ts.length, 0);
      },
      async alFallar(k, c) {
        if (S.pantallas[k].id === "el-pago") assert.equal(c.querySelector("[data-asiento]"), null);
        /* C7: el acierto de P3 (tres frases) no se pliega tampoco cuando lo da el 2.º error. */
        if (S.pantallas[k].id === "no-operacional") assert.equal(c.querySelector("[data-mensaje] [data-por-que], [data-mensaje] [data-plegado]"), null);
      },
      async alAcertar(k, c) {
        if (S.pantallas[k].id === "no-operacional") assert.equal(c.querySelector("[data-mensaje] [data-por-que], [data-mensaje] [data-plegado], [data-porque-a-la-vista]"), null);
        if (S.pantallas[k].id !== "el-pago") return;
        const as = c.querySelector("[data-asiento]");
        assert.equal(as.dataset.asiento, "sin-fecha");
        assert.deepEqual([...as.querySelectorAll("[data-linea]")].map((x) => [x.dataset.linea, x.dataset.lado]), [["Cuentas por pagar – proveedores", "debe"], [DCC, "haber"], ["Caja o Bancos", "haber"]]);
      },
    });
  } finally {
    m.desmontar();
  }
});

/* ═══════════ 3 · CATÁLOGO Y TEMA ═══════════ */

test("★★★ fuera del catálogo de FP; en T7-3, justo después de A3", () => {
  assert.equal(A.A4_ID, "t7-3-descuento-en-dos-libros");
  assert.equal(P.numero, 4);
  const tema = SUBJECTS.contabilidad.topics.find((t) => t.id === TEMA_T7_3);
  const a = tema.actividades.find((x) => x.id === A.A4_ID);
  assert.deepEqual(a.clasificacion, { tipo: APRENDER });
  assert.equal(a.nombre, P.titulo);
  const ids = tema.actividades.map((x) => x.id);
  assert.equal(ids.indexOf(A.A4_ID), ids.indexOf("t7-3-descuento-condicionado") + 1);
  const piezas = PIEZAS_T7_3.map((x) => x.pieza.id);
  assert.equal(piezas.indexOf(A.A4_ID), piezas.indexOf("t7-3-descuento-condicionado") + 1);
  const dir = new URL("supabase/migrations/", RAIZ);
  assert.deepEqual(readdirSync(dir).filter((f) => readFileSync(new URL(f, dir), "utf8").includes(A.A4_ID)), []);
  assert.doesNotMatch(leer("src/data/contabilidadT7_3_a4.js"), /from\s+["'][^"']*\/(fp|lib\/supabase)[^"']*["']|registrarActividad(Completada)?\s*\(|\.rpc\s*\(/);
});
