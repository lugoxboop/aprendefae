import { test } from "node:test";
import assert from "node:assert/strict";
import { readFileSync, readdirSync } from "node:fs";
import { JSDOM, VirtualConsole } from "jsdom";
import { seccion, compararDatos, prepararDom, citas } from "./t7-3-recorte.mjs";
import { recorrerC4, conReloj } from "./t7-3-c4.mjs";

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
const { cifra } = await import("../../components/mecanicas/libros/t7/PantallasT7_3.jsx");
const { default: AprenderT7_3C4 } = await import("../../components/mecanicas/libros/t7/AprenderT7_3C4.jsx");
const { CONSECUENCIA_C4: C4 } = await import("../c4/t73a1_c4.js");
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

/* ═══════════ 2 · MONTADA: EL PATRÓN C4 (toda decisión se pinta) ═══════════ */

const montar = async () => {
  const caja = document.createElement("div");
  document.body.appendChild(caja);
  const raiz = createRoot(caja);
  await act(async () => { raiz.render(h(AprenderT7_3C4, { pieza: P, rotulo: "R" })); });
  return { caja, desmontar: () => { act(() => raiz.unmount()); caja.remove(); } };
};
const ingresos = (c) => [...c.querySelectorAll('[data-linea="Ingresos por ventas"] [role="cell"]')].map((x) => x.textContent);
/* Los renglones de la factura: signo, rótulo y cifra («12 %» lleva espacio que no se parte; aquí se lee como espacio). */
const sp = (t) => t.replace(/\u00a0/g, " ");
const filas = (c) => [...c.querySelectorAll("[data-c4-objeto] [data-renglon]")].map((r) => [r.querySelector(".rg-op").textContent, sp(r.querySelector(".rg-rot").lastChild.textContent), sp(r.querySelector(".rg-v").textContent)]);

test("★★★ se recorre entera en el patrón C4: cada pantalla y cada estado, contra el recorte; cada opción pinta su factura", conReloj(async () => {
  const m = await montar();
  try {
    await recorrerC4({
      c: m.caja, w, act, P, S, c4: C4, frase: A.FRASE_TARIFAS,
      async alLlegar(id, H) {
        const c = m.caja;
        if (id === "ejemplo") {
          /* La factura de Near (sus tres renglones) y, debajo, lo que la base tocada calcula: en blanco al llegar. */
          assert.deepEqual(filas(c).slice(0, 3), [["", "Precio de lista", "4.200.000"], ["−", "Descuento comercial 15 %", "630.000"], ["=", "Valor a facturar", "3.570.000"]]);
          assert.deepEqual(filas(c).slice(3).map((f) => f[2]), ["$?", "$?", "$?"]);
          assert.ok(H.figura().compareDocumentPosition(H.q("[data-pregunta]")) & w.Node.DOCUMENT_POSITION_FOLLOWING);
        }
        if (id !== "no-se-registra") return;
        /* Ingresos por ventas, en blanco, y sin sumas; las cuentas que se abren (Mello), una a la vez. */
        assert.deepEqual(ingresos(c), ["", "$?"]);
        assert.equal(c.querySelector("[data-sumas]"), null);
        const term = (n) => c.querySelector(`[data-termino="${n}"]`);
        assert.deepEqual([...c.querySelectorAll("[data-termino]")].map((x) => x.textContent), ["Anticipo fiscal", "IVA por pagar"]);
        await H.tocar(term("IVA por pagar"));
        assert.equal(term("IVA por pagar").getAttribute("aria-expanded"), "true");
        assert.deepEqual([...c.querySelectorAll("[data-definicion] [data-def-termino]")].map((x) => [x.querySelector("dt").textContent, x.querySelector("dd").textContent]), [["IVA", DEFINICIONES.IVA]]);
        await H.tocar(term("Anticipo fiscal"));
        assert.equal(term("IVA por pagar").getAttribute("aria-expanded"), "false");
        assert.deepEqual([...c.querySelectorAll("[data-definicion] [data-def-termino]")].map((x) => x.querySelector("dt").textContent), ["Retención", "Anticipo fiscal"]);
        await H.tocar(term("Anticipo fiscal"));
        assert.equal(c.querySelector("[data-definicion]"), null);
      },
      async alElegir(id, o, H) {
        const c = m.caja;
        const x = Number(o.texto.replace(/\D/g, ""));
        if (id === "dos-clases") {
          /* La rebaja entra a la factura o sale de ella, antes del veredicto. */
          const valor = filas(c).at(-1)[2];
          assert.equal(valor, o.id === "comercial" ? "lista − 10 %" : "precio de lista");
          assert.equal(Boolean(c.querySelector("[data-aparte]")), o.id === "condicionado");
          assert.equal(filas(c).some((f) => f[1] === "Descuento 10 %"), o.id === "comercial");
        }
        if (id === "ejemplo") {
          /* El IVA y la retención se recalculan sobre la base tocada. */
          assert.deepEqual(filas(c).slice(3), [["+", `IVA 16 % sobre $${cifra(x)}`, cifra(x * 0.16)], ["−", `Retención 3,5 % sobre $${cifra(x)}`, cifra(x * 0.035)], ["=", "Debe el cliente", cifra(A.H1_LIBRO.factura + x * 0.16 - x * 0.035)]]);
        }
        if (id === "no-se-registra") {
          /* La cifra tocada entra a la línea de Ingresos por ventas del asiento. */
          assert.deepEqual(ingresos(c), ["", cifra(x)]);
          assert.match(c.querySelector('[data-linea="Ingresos por ventas"]').className, /t73c4-toca/);
          assert.equal(c.querySelector("[data-cobra]").textContent, "Lo que se cobra por la mercancía: $3.570.000");
        }
      },
      async alVeredicto(id, o, H) {
        /* Con el veredicto, lo que la mala movió pasa a coral. */
        assert.ok(H.figura().querySelector(".t73c4-mal"), `${id} · ${o.id}: sin la marca coral`);
      },
      async alAcertar(id, H) {
        if (id === "no-se-registra") assert.deepEqual(ingresos(m.caja), ["", cifra(A.H1_LIBRO.factura)]);
        assert.equal(H.figura().querySelector(".t73c4-mal"), null);
      },
    });
  } finally {
    m.desmontar();
  }
}));

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
  assert.equal(PIEZAS_T7_3[0].Pieza, AprenderT7_3C4);
  const dir = new URL("supabase/migrations/", RAIZ);
  assert.deepEqual(readdirSync(dir).filter((f) => readFileSync(new URL(f, dir), "utf8").includes(A.A1_ID)), []);
  for (const f of ["src/components/mecanicas/libros/t7/PantallasT7_3.jsx", "src/components/mecanicas/libros/t7/AprenderT7_3C4.jsx", "src/contabilidad/c4/t73a1_c4.js", "src/data/contabilidadT7_3.js"]) {
    assert.doesNotMatch(leer(f), /from\s+["'][^"']*\/(fp|lib\/supabase)[^"']*["']|registrarActividad(Completada)?\s*\(|\.rpc\s*\(/, f);
  }
});
