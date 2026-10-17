import { test } from "node:test";
import assert from "node:assert/strict";
import { readFileSync, readdirSync } from "node:fs";
import { JSDOM, VirtualConsole } from "jsdom";
import { seccion, compararDatos, prepararDom, citas } from "./t7-3-recorte.mjs";
import { recorrerC4, conReloj } from "./t7-3-c4.mjs";

/*
 * ═══════════════════════════════════════════════════════════════════════════
 * T7-3 · A6 «La provisión para inventarios» (Célula C) · Aprender · RECORTE.
 *
 *   · cada pantalla, texto, opción, pista, error, acierto y «¿Por qué?» es
 *     el del recorte de Near (lote1-recortes-t73-v1.md), letra por letra
 *   · Mello (mello-recortes-v1.md): el error «provisión» ya no dice
 *     «reserva». Su opcional («Estima la pérdida…») NO se aplica
 *   · estimar es una pregunta nueva; el resumen trae los dos asientos
 *   · las cifras de I-3; fuera del catálogo de FP
 * ═══════════════════════════════════════════════════════════════════════════
 */

const w = prepararDom(JSDOM, VirtualConsole);
const React = await import("react");
const { createRoot } = await import("react-dom/client");
const act = React.act;
const h = React.createElement;

const A = await import("../../data/contabilidadT7_3_a6.js");
const { SUBJECTS, APRENDER } = await import("../../data/subjects.js");
const { cifra } = await import("../../components/mecanicas/libros/t7/PantallasT7_3.jsx");
const { default: AprenderT7_3C4 } = await import("../../components/mecanicas/libros/t7/AprenderT7_3C4.jsx");
const { CONSECUENCIA_C4: C4 } = await import("../c4/t73a6_c4.js");
const { PIEZAS_T7_3, TEMA_T7_3 } = await import("../../components/ContabilidadT7_3View.jsx");

const RAIZ = new URL("../../../", import.meta.url);
const leer = (f) => readFileSync(new URL(f, RAIZ), "utf8");
const RECORTE = leer("orquestador/conocimiento/paquetes/lote1-recortes-t73-v1.md");
const MELLO = leer("orquestador/conocimiento/paquetes/mello-recortes-v1.md");
const P = A.PIEZA_LA_PROVISION;
const S = seccion(RECORTE, P.id);
const pantalla = (id) => P.pantallas.find((x) => x.id === id);
const s = (id) => S.pantallas.find((x) => x.id === id);

/* Mello, entrega 3: el reemplazo del error «provisión». Gana sobre el recorte. */
const MELLO_A6 = MELLO.slice(MELLO.indexOf("**«La provisión para inventarios»"), MELLO.indexOf("**«Descuentos en cadena»"));
const ERROR_MELLO = citas(MELLO_A6.split("\n").find((l) => l.includes("Reemplazo:")))[0];
const OPCIONAL_MELLO = citas(MELLO_A6.split("\n").find((l) => l.startsWith("Opcional:")));
{
  const e = s("estimar").errores.find((x) => x.clave === "provisión");
  assert.equal(e.texto, "Esa cuenta guarda la reserva para la pérdida. Lo estimado se carga al periodo en otra.");
  e.texto = ERROR_MELLO;
}

/* ═══════════ 1 · DATOS ═══════════ */

test("★★★ pantallas, textos, opciones, pista, errores, acierto y ¿Por qué?: los del recorte con Mello, letra por letra", () => {
  assert.deepEqual(S.pantallas.map((x) => x.id), ["portada", "estimar", "la-perdida", "resumen"]);
  compararDatos(P, S);
  assert.equal(pantalla("portada").objetivo, S.pantallas[0].lineas[0]);
  assert.ok(!JSON.stringify(P).includes("reserva"));
  for (const id of ["que-es", "ejemplo"]) assert.equal(pantalla(id), undefined, id);
});

test("★★★ la opcional de Mello («Estima la pérdida…») no se aplica", () => {
  assert.equal(OPCIONAL_MELLO[0], "Calcula la pérdida antes de que pase");
  assert.match(OPCIONAL_MELLO[1], /^Estima la pérdida antes de que pase/);
  assert.match(pantalla("estimar").parrafos[0], /Calcula la pérdida antes de que pase: \$520\.000\./);
  assert.ok(!JSON.stringify(P).includes(OPCIONAL_MELLO[1]));
});

test("★★★ las cifras de I-3: la provisión estimada y la pérdida real, en sus asientos", () => {
  const C = A.I3_LIBRO;
  const [est, per] = pantalla("resumen").asientos;
  assert.deepEqual(est.lineas.map((l) => [l.cuenta, l.lado, l.monto]), [["Gasto provisiones – inventarios", "debe", C.provision], ["Provisión para inventarios", "haber", C.provision]]);
  assert.deepEqual(per.lineas.map((l) => [l.cuenta, l.lado, l.monto]), [["Provisión para inventarios", "debe", C.perdida], ["Inventario de mercancías", "haber", C.perdida]]);
  assert.deepEqual(pantalla("estimar").acierto.asientos[0].lineas, est.lineas);
  assert.deepEqual(pantalla("la-perdida").acierto.asientos[0].lineas, per.lineas);
  /* El rótulo del resumen, partido en sus dos asientos. */
  assert.equal([est.titular, per.titular].join(" · "), s("resumen").lineas[0]);
});

/* ═══════════ 2 · MONTADA: EL PATRÓN C4 (toda decisión se pinta) ═══════════ */

const montar = async () => {
  const caja = document.createElement("div");
  document.body.appendChild(caja);
  const raiz = createRoot(caja);
  await act(async () => { raiz.render(h(AprenderT7_3C4, { pieza: P, rotulo: "R" })); });
  return { caja, desmontar: () => { act(() => raiz.unmount()); caja.remove(); } };
};
/* Los tres renglones: inventario, provisión (saldo) y gasto del periodo, con su cifra. */
const renglones = (c) => [...c.querySelectorAll("[data-c4-objeto='provision'] [data-renglon]")].map((r) => r.querySelector(".rg-v").textContent);
const C = A.I3_LIBRO;
const m$ = (n) => `${n < 0 ? "−" : ""}${cifra(Math.abs(n))}`;

test("★★★ se recorre entera en el patrón C4: cada pantalla y cada estado, contra el recorte; la cuenta tocada mueve inventario, provisión y gasto", conReloj(async () => {
  const m = await montar();
  try {
    await recorrerC4({
      c: m.caja, w, act, P, S, c4: C4,
      async alLlegar(id) {
        const c = m.caja;
        const as = [...c.querySelectorAll("[data-asiento]")];
        if (id === "resumen") {
          /* Los dos asientos, uno debajo del otro, cada uno con su rótulo. */
          assert.deepEqual(as.map((a) => a.querySelector("[data-titular]").textContent), ["Estimar → gasto", "Pérdida real → provisión"]);
          assert.ok(as[0].compareDocumentPosition(as[1]) & w.Node.DOCUMENT_POSITION_FOLLOWING);
        } else assert.equal(as.length, 0);
        /* Al estimar, todo en cero; al cierre, la provisión y el gasto ya están. */
        if (id === "estimar") assert.deepEqual(renglones(c), ["0", "0", "0"]);
        if (id === "la-perdida") assert.deepEqual(renglones(c), ["0", cifra(C.provision), cifra(C.provision)]);
      },
      async alElegir(id, o) {
        const c = m.caja;
        const M = id === "estimar" ? C.provision : C.perdida;
        const esperado = id === "estimar"
          ? { gasto: [0, M, M], provision: [0, -M, 0], inventario: [M, 0, 0] }[o.id]
          : { provision: [-M, C.provision - M, C.provision], gasto: [-M, C.provision, C.provision + M], inventario: [M, C.provision, C.provision] }[o.id];
        assert.deepEqual(renglones(c), esperado.map(m$), `${id} · ${o.id}`);
        assert.equal(c.querySelectorAll("[data-c4-objeto='provision'] [data-toca]").length, 1);
        assert.equal(c.querySelector("[data-asiento]"), null);
      },
      async alVeredicto(id, o, H) {
        assert.ok(H.figura().querySelector("[data-renglon].t73c4-mal"), `${id} · ${o.id}: el renglón en coral`);
      },
      async alAcertar() {
        const c = m.caja;
        assert.equal(c.querySelectorAll("[data-asiento]").length, 1);
        assert.equal(c.querySelector("[data-asiento]").dataset.asiento, "sin-fecha");
      },
    });
  } finally {
    m.desmontar();
  }
}));

/* ═══════════ 3 · CATÁLOGO Y TEMA ═══════════ */

test("★★★ fuera del catálogo de FP; en T7-3, justo después de A5", () => {
  assert.equal(A.A6_ID, "t7-3-provision-inventarios");
  assert.equal(P.numero, 6);
  const tema = SUBJECTS.contabilidad.topics.find((t) => t.id === TEMA_T7_3);
  const a = tema.actividades.find((x) => x.id === A.A6_ID);
  assert.deepEqual(a.clasificacion, { tipo: APRENDER });
  assert.equal(a.nombre, P.titulo);
  const ids = tema.actividades.map((x) => x.id);
  assert.equal(ids.indexOf(A.A6_ID), ids.indexOf("t7-3-sobrantes-y-faltantes") + 1);
  const piezas = PIEZAS_T7_3.map((x) => x.pieza.id);
  assert.equal(piezas.indexOf(A.A6_ID), piezas.indexOf("t7-3-sobrantes-y-faltantes") + 1);
  assert.equal(PIEZAS_T7_3.find((x) => x.pieza.id === A.A6_ID).Pieza, AprenderT7_3C4);
  const dir = new URL("supabase/migrations/", RAIZ);
  assert.deepEqual(readdirSync(dir).filter((f) => readFileSync(new URL(f, dir), "utf8").includes(A.A6_ID)), []);
  assert.doesNotMatch(leer("src/data/contabilidadT7_3_a6.js"), /from\s+["'][^"']*\/(fp|lib\/supabase)[^"']*["']|registrarActividad(Completada)?\s*\(|\.rpc\s*\(/);
});
