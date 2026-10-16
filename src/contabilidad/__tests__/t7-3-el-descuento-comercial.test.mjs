import { test } from "node:test";
import assert from "node:assert/strict";
import { readFileSync, readdirSync } from "node:fs";
import { JSDOM, VirtualConsole } from "jsdom";
import { seccion, compararDatos, recorrer, prepararDom, citas } from "./t7-3-recorte.mjs";

/*
 * ═══════════════════════════════════════════════════════════════════════════
 * T7-3 · A1 «El descuento comercial» (Célula C) · Aprender · RECORTE.
 *
 *   · cada pantalla, texto, opción, pista, error, acierto y «¿Por qué?» es
 *     el del recorte de Near (lote1-recortes-t73-v1.md), letra por letra, con
 *     el cambio del anexo que trae su tabla
 *   · Mello: en el asiento de P3, IVA, retención y Anticipo fiscal se abren
 *     al tocarlos, uno a la vez, con sus textos (mello-recortes-v1.md)
 *   · P3 pregunta por Ingresos por ventas con esa línea en blanco («$?»): se
 *     llena solo con el acierto
 *   · la frase de las tarifas, en el pie de la pantalla que las da (P2)
 *   · las cifras de H-1 se recalculan; regla 3; fuera del catálogo de FP
 * ═══════════════════════════════════════════════════════════════════════════
 */

const w = prepararDom(JSDOM, VirtualConsole);
const React = await import("react");
const { createRoot } = await import("react-dom/client");
const act = React.act;
const h = React.createElement;

const A = await import("../../data/contabilidadT7_3.js");
const { SUBJECTS, APRENDER } = await import("../../data/subjects.js");
const { default: PantallasT7_3, cifra } = await import("../../components/mecanicas/libros/t7/PantallasT7_3.jsx");
const { textosDelError } = await import("../../components/mecanicas/libros/t7/escaleraAyuda.js");
const { PIEZAS_T7_3, TEMA_T7_3 } = await import("../../components/ContabilidadT7_3View.jsx");
const { VISTAS, vistaDeTema } = await import("../../ruta.js");

const RAIZ = new URL("../../../", import.meta.url);
const leer = (f) => readFileSync(new URL(f, RAIZ), "utf8");
const RECORTE = leer("orquestador/conocimiento/paquetes/lote1-recortes-t73-v1.md");
const MELLO = leer("orquestador/conocimiento/paquetes/mello-recortes-v1.md");
const P = A.PIEZA_EL_DESCUENTO_COMERCIAL;
const S = seccion(RECORTE, P.id);
const pantalla = (id) => P.pantallas.find((x) => x.id === id);

/* Mello, entrega 3: las tres definiciones del asiento de P3, por término. */
const MELLO_A1 = MELLO.slice(MELLO.indexOf("**«El descuento comercial»"), MELLO.indexOf("**«El descuento condicionado»"));
const DEFINICIONES = Object.fromEntries([...MELLO_A1.matchAll(/^ {2}- (IVA|Retención|Anticipo fiscal): «(.+?)»/gm)].map((m) => [m[1], m[2]]));

/* ═══════════ 1 · DATOS ═══════════ */

test("★★★ pantallas, textos, opciones, pista, errores, acierto y ¿Por qué?: los del recorte, letra por letra", () => {
  assert.deepEqual(S.pantallas.map((s) => s.id), ["portada", "dos-clases", "ejemplo", "no-se-registra", "resumen"]);
  compararDatos(P, S);
  assert.equal(pantalla("portada").objetivo, S.pantallas[0].lineas[0]);
  /* La tabla de cambios del recorte: la tercera opción de `dos-clases`, con su retroalimentación nueva. */
  const fila = RECORTE.split("\n").find((l) => l.startsWith("| Anexo · `descuento-comercial` · `dos-clases`"));
  const [viejo, nuevo] = citas(fila);
  assert.equal(pantalla("dos-clases").opciones.find((o) => o.id === "ninguna").devolucion, nuevo);
  assert.ok(!JSON.stringify(P).includes(viejo));
  /* El repaso de siete párrafos se fue. */
  assert.equal(pantalla("repaso"), undefined);
});

test("★★★ Mello: IVA por pagar abre el IVA; Anticipo fiscal, la retención y el anticipo; con sus textos", () => {
  assert.deepEqual(Object.keys(DEFINICIONES), ["IVA", "Retención", "Anticipo fiscal"]);
  const lineas = pantalla("no-se-registra").asientos[0].lineas;
  const de = (cuenta) => lineas.find((l) => l.cuenta === cuenta).terminos?.map((t) => [t.termino, t.definicion]);
  assert.deepEqual(de("IVA por pagar"), [["IVA", DEFINICIONES.IVA]]);
  assert.deepEqual(de("Anticipo fiscal"), [["Retención", DEFINICIONES["Retención"]], ["Anticipo fiscal", DEFINICIONES["Anticipo fiscal"]]]);
  assert.equal(de("Cuentas por cobrar – clientes"), undefined);
  assert.equal(de("Ingresos por ventas"), undefined);
});

test("★★★ las cifras de H-1 se recalculan desde la lista, el 15 % y las tarifas; el asiento de P3 va por lo facturado", () => {
  const C = A.H1_LIBRO;
  const descuento = (4_200_000 * 15) / 100;
  const factura = 4_200_000 - descuento;
  const iva = (factura * 16) / 100;
  const ret = (factura * 35) / 1000;
  assert.deepEqual([C.lista, C.descuento, C.factura, C.iva, C.retencion, C.cliente], [4_200_000, descuento, factura, iva, ret, factura + iva - ret]);
  assert.equal(C.sumas, C.cliente + C.retencion);
  assert.equal(C.sumas, C.iva + C.factura);
  const l = pantalla("no-se-registra").asientos[0].lineas;
  assert.deepEqual(l.map((x) => [x.cuenta, x.lado, x.monto]), [
    ["Cuentas por cobrar – clientes", A.DEBE, C.cliente], ["Anticipo fiscal", A.DEBE, C.retencion],
    ["IVA por pagar", A.HABER, C.iva], ["Ingresos por ventas", A.HABER, C.factura],
  ]);
  /* En blanco, como lo pide el recorte: «Ingresos por ventas $?». */
  const enBlanco = S.pantallas[3].lineas.find((x) => x.startsWith("Ingresos por ventas "));
  assert.equal(`Ingresos por ventas ${l.at(-1).enBlanco}`, enBlanco);
  assert.equal(enBlanco, "Ingresos por ventas $?");
  /* El descuento no aparece en el asiento, y no hay sumas: darían la respuesta. */
  assert.ok(!l.some((x) => x.monto === C.lista || x.monto === C.descuento));
  assert.equal(pantalla("no-se-registra").asientos[0].sumas, undefined);
});

test("★★★ regla 3: ninguna cifra de X1-X4, ni de T7-1 ni de T7-2", () => {
  const prohibidas = [800_000, 175_000, 5_625_000, 5_800_000, 6_760_000, 17_460_000, 24_220_000, 1_518_000, 22_702_000, 11_091_000, 1_200_000, 262_500, 8_437_500, 643_500, 8_700_000, 2_432_000, 532_000, 17_100_000, 384_000, 84_000, 2_700_000, 2_784_000, 17_632_000];
  const numeros = new Set([...JSON.stringify(P).matchAll(/\d[\d.]*/g)].map((m) => Number(m[0].replace(/\./g, ""))));
  for (const x of prohibidas) assert.ok(!numeros.has(x), cifra(x));
});

test("★★★ la frase de las tarifas va en el pie de P2, la pantalla que las da, y en ningún cuerpo", () => {
  assert.deepEqual(P.pantallas.filter((p) => p.pieTarifas).map((p) => p.id), ["ejemplo"]);
  assert.match(S.pantallas[2].porque, /IVA del 16 % y la retención del 3,5 %/);
  const sinPies = JSON.stringify(P.pantallas.map(({ pie, ...p }) => p));
  assert.ok(!sinPies.includes(A.FRASE_TARIFAS));
  assert.match(RECORTE, /La frase de las tarifas \(«Las tarifas de este ejercicio son datos del libro…»\) pasa del cuerpo al pie/);
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
const celdaIngresos = (c) => [...c.querySelectorAll('[data-linea="Ingresos por ventas"] [role="cell"]')].map((x) => x.textContent);

test("★★★ se recorre entera: cada pantalla y cada estado, contra el recorte", async () => {
  const m = await montar();
  try {
    await recorrer({
      caja: m.caja, P, S, tocar, w, textosDelError, tarifas: ["ejemplo"], frase: A.FRASE_TARIFAS,
      async alLlegar(k, c) {
        if (S.pantallas[k].id === "ejemplo") {
          /* Los renglones de la factura van antes de la pregunta. */
          const fig = c.querySelector("figure[data-renglones]");
          assert.equal(fig.querySelector("figcaption").textContent, "Factura de San Calixto");
          assert.ok(fig.compareDocumentPosition(c.querySelector("[data-pregunta]")) & w.Node.DOCUMENT_POSITION_FOLLOWING);
        }
        if (S.pantallas[k].id !== "no-se-registra") {
          assert.equal(c.querySelector("[data-termino]"), null);
          return;
        }
        /* Ingresos por ventas, en blanco, y sin sumas. */
        assert.deepEqual(celdaIngresos(c), ["", "$?"]);
        assert.equal(c.querySelector("[data-sumas]"), null);
        /* Las cuentas que se abren: Anticipo fiscal e IVA por pagar; una a la vez. */
        const term = (n) => c.querySelector(`[data-termino="${n}"]`);
        assert.deepEqual([...c.querySelectorAll("[data-termino]")].map((x) => x.textContent), ["Anticipo fiscal", "IVA por pagar"]);
        for (const b of c.querySelectorAll("[data-termino]")) {
          assert.equal(b.tagName, "BUTTON");
          assert.equal(b.getAttribute("aria-expanded"), "false");
        }
        assert.equal(c.querySelector("[data-definicion]"), null);
        const abierta = () => [...c.querySelectorAll("[data-definicion] [data-def-termino]")].map((x) => [x.querySelector("dt").textContent, x.querySelector("dd").textContent]);
        await tocar(term("IVA por pagar"));
        assert.equal(term("IVA por pagar").getAttribute("aria-expanded"), "true");
        assert.equal(c.querySelector(`#${term("IVA por pagar").getAttribute("aria-controls")}`), c.querySelector("[data-definicion]"));
        assert.deepEqual(abierta(), [["IVA", DEFINICIONES.IVA]]);
        await tocar(term("Anticipo fiscal"));
        assert.equal(term("IVA por pagar").getAttribute("aria-expanded"), "false");
        assert.equal(term("Anticipo fiscal").getAttribute("aria-expanded"), "true");
        assert.deepEqual(abierta(), [["Retención", DEFINICIONES["Retención"]], ["Anticipo fiscal", DEFINICIONES["Anticipo fiscal"]]]);
        /* Tocarla otra vez la cierra. */
        await tocar(term("Anticipo fiscal"));
        assert.equal(c.querySelector("[data-definicion]"), null);
        assert.equal(term("Anticipo fiscal").getAttribute("aria-expanded"), "false");
      },
      async alFallar(k, c) {
        if (S.pantallas[k].id === "no-se-registra") assert.deepEqual(celdaIngresos(c), ["", "$?"]);
      },
      async alAcertar(k, c) {
        if (S.pantallas[k].id !== "no-se-registra") return;
        /* Con el acierto, la línea se llena con lo facturado; las definiciones siguen a mano. */
        assert.deepEqual(celdaIngresos(c), ["", cifra(A.H1_LIBRO.factura)]);
        await tocar(c.querySelector('[data-termino="IVA por pagar"]'));
        assert.equal(c.querySelectorAll("[data-definicion]").length, 1);
      },
    });
  } finally {
    m.desmontar();
  }
});

/* ═══════════ 3 · CATÁLOGO Y TEMA ═══════════ */

test("★★★ fuera del catálogo de FP; abre T7-3, que va justo después de T7-2 y tiene ruta", () => {
  assert.equal(A.A1_ID, "t7-3-descuento-comercial");
  assert.equal(P.numero, 1);
  const tema = SUBJECTS.contabilidad.topics.find((t) => t.id === TEMA_T7_3);
  assert.equal(tema.title, "Inventarios III: descuentos, conteo y NIC 2");
  assert.equal(TEMA_T7_3, "inventarios-descuentos-nic2");
  const temas = SUBJECTS.contabilidad.topics.map((t) => t.id);
  assert.equal(temas.indexOf(TEMA_T7_3), temas.indexOf("inventarios-permanente") + 1);
  assert.ok(VISTAS.has(TEMA_T7_3));
  assert.equal(vistaDeTema(TEMA_T7_3), TEMA_T7_3);
  const app = leer("src/App.jsx");
  assert.match(app, /if \(view === "inventarios-descuentos-nic2"\) \{\s*return wrap\(\s*<Suspense fallback=\{siteFallback\}>\s*<ContabilidadT7_3View /);
  assert.match(app, /VISTAS_CON_TITULO = new Set\(\[[^\]]*"inventarios-descuentos-nic2"/);
  const a = tema.actividades.find((x) => x.id === A.A1_ID);
  assert.deepEqual(a.clasificacion, { tipo: APRENDER });
  assert.equal(a.nombre, P.titulo);
  assert.equal(tema.actividades[0].id, A.A1_ID);
  assert.equal(PIEZAS_T7_3[0].pieza.id, A.A1_ID);
  assert.equal(PIEZAS_T7_3[0].Pieza, PantallasT7_3);
  const dir = new URL("supabase/migrations/", RAIZ);
  assert.deepEqual(readdirSync(dir).filter((f) => readFileSync(new URL(f, dir), "utf8").includes(A.A1_ID)), []);
  for (const f of ["src/components/mecanicas/libros/t7/PantallasT7_3.jsx", "src/data/contabilidadT7_3.js"]) {
    assert.doesNotMatch(leer(f), /from\s+["'][^"']*\/(fp|lib\/supabase)[^"']*["']|registrarActividad(Completada)?\s*\(|\.rpc\s*\(/, f);
  }
});
