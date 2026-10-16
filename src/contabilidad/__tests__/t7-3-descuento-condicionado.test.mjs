import { test } from "node:test";
import assert from "node:assert/strict";
import { readFileSync, readdirSync } from "node:fs";
import { JSDOM, VirtualConsole } from "jsdom";
import { seccion, compararDatos, recorrer, prepararDom, CONDICION } from "./t7-3-recorte.mjs";
import { CONDICIONES as C7, CORRECCIONES_T73, MELLO_T73, NEAR_T73, aplicarAlRecorte, palabrasAlAcertar } from "./correccionesMelloAciertos.mjs";

/*
 * ═══════════════════════════════════════════════════════════════════════════
 * T7-3 · A3 «El descuento condicionado» (Célula C) · Aprender · RECORTE.
 *
 *   · cada pantalla, texto, opción, pista, error, acierto y «¿Por qué?» es
 *     el del recorte de Near (lote1-recortes-t73-v1.md), letra por letra
 *   · Mello (mello-recortes-v1.md): el acierto visible de P2 trae el gasto;
 *     y, llegadas por L: las pistas de P2 y P4, y los pies del acierto y del
 *     error de P4
 *   · la línea de plazos: lo que lleva cada plazo, solo con el acierto de P1
 *   · ACIERTOS C7: P1 `condiciones` sale de t7-3-tres-aciertos-c7.md (Near)
 *     con C-1 de Mello (auditoria-mello-enganche-v6-y-t7-3-aciertos.md, §2):
 *     «5 %» pasa a «30 %», con su retro y la nueva de «15 %»; la condición
 *     de 5/20 va en el acierto, a la vista: sin «¿Por qué?» (C7); 60
 *     palabras al acertar (B2). El rótulo de la línea, «5 % comercial …», y
 *     los días, «10 · 20 · 30 días»; el resumen conserva su línea
 *   · la frase de las tarifas, en el pie de P3
 *   · las cifras de H-3 se recalculan; regla 3; fuera del catálogo de FP
 * ═══════════════════════════════════════════════════════════════════════════
 */

const w = prepararDom(JSDOM, VirtualConsole);
const React = await import("react");
const { createRoot } = await import("react-dom/client");
const act = React.act;
const h = React.createElement;

const A = await import("../../data/contabilidadT7_3_a3.js");
const { FRASE_TARIFAS } = await import("../../data/contabilidadT7_3.js");
const { SUBJECTS, APRENDER } = await import("../../data/subjects.js");
const { default: PantallasT7_3, cifra } = await import("../../components/mecanicas/libros/t7/PantallasT7_3.jsx");
const { textosDelError } = await import("../../components/mecanicas/libros/t7/escaleraAyuda.js");
const { PIEZAS_T7_3, TEMA_T7_3 } = await import("../../components/ContabilidadT7_3View.jsx");

const RAIZ = new URL("../../../", import.meta.url);
const leer = (f) => readFileSync(new URL(f, RAIZ), "utf8");
const RECORTE = leer("orquestador/conocimiento/paquetes/lote1-recortes-t73-v1.md");
const MELLO = leer("orquestador/conocimiento/paquetes/mello-recortes-v1.md");
const P = A.PIEZA_EL_DESCUENTO_CONDICIONADO;
const S = seccion(RECORTE, P.id);
const pantalla = (id) => P.pantallas.find((x) => x.id === id);
const s = (id) => S.pantallas.find((x) => x.id === id);

/* Mello, entrega 3: el acierto visible de P2. Gana sobre el recorte. */
const ACIERTO_MELLO = "Así es: se registra cuando el cliente cumple. Para quien vende es un gasto: recibe menos de lo que facturó.";
assert.ok(MELLO.includes(`«${ACIERTO_MELLO}»`));
assert.equal(s("que-es").acierto.texto, "Así es: se registra cuando el cliente cumple.");
s("que-es").acierto.texto = ACIERTO_MELLO;
/*
 * Las pistas de P2 y P4 son las de la auditoría de pistas de Mello
 * (mello-pistas-distractores-v1.md). Los pies del acierto y del error de P4
 * llegaron por L con la entrega 6 (no están en un archivo del repositorio).
 */
const MELLO_PISTAS = leer("orquestador/conocimiento/paquetes/mello-pistas-distractores-v1.md");
const PISTAS_MELLO = {
  "que-es": ["El comercial ya viene restado en la factura. ¿Cuál de los dos ocurre después de facturar?", "Un descuento se registra cuando se sabe cuánto es. ¿Cuándo se sabe cada uno?"],
  "sobre-que": ["El descuento condicionado no toca el IVA. Y la rebaja comercial ya se restó antes.", "Piensa qué parte de lo que debe Santa Martha es de la mercancía y qué parte es de otra cosa."],
};
for (const [id, [viejo, nuevo]] of Object.entries(PISTAS_MELLO)) {
  assert.equal(s(id).pista, viejo);
  assert.ok(MELLO_PISTAS.includes(`«${nuevo}»`), `no está en la auditoría de Mello: «${nuevo}»`);
  s(id).pista = nuevo;
}
const PIES_SOBRE_QUE = "Basado en el libro, pp. 252-253";
/* Aciertos C7: P1, con la tabla final de Near y C-1 de Mello encima. */
aplicarAlRecorte(s("condiciones"), C7);

/* ═══════════ 1 · DATOS ═══════════ */

test("★★★ pantallas, textos, opciones, pista, errores, acierto y ¿Por qué?: los del recorte con Mello, letra por letra", () => {
  assert.deepEqual(S.pantallas.map((x) => x.id), ["portada", "condiciones", "que-es", "cual-le-toca", "sobre-que", "resumen"]);
  compararDatos(P, S);
  assert.equal(pantalla("portada").objetivo, S.pantallas[0].lineas[0]);
  assert.deepEqual([pantalla("sobre-que").acierto.pie, pantalla("sobre-que").error.pie], [PIES_SOBRE_QUE, PIES_SOBRE_QUE]);
  /* Las lecturas «un gasto» y «el ejemplo» se fueron. */
  assert.equal(pantalla("un-gasto"), undefined);
  assert.equal(pantalla("ejemplo"), undefined);
});

test("★★★ C7 · P1 sin plegado: la condición de 5/20 va en el acierto, a la vista; ninguna pantalla trae «¿Por qué?» a la vista aparte", () => {
  const p = pantalla("condiciones");
  assert.equal(p.acierto.porque, undefined);
  assert.equal(p.acierto.porqueALaVista, undefined);
  assert.match(p.acierto.texto, /5\/20 es un 5 % si paga a los veinte días/);
  assert.match(p.acierto.texto, CONDICION);
  assert.deepEqual(P.pantallas.filter((x) => x.acierto?.porqueALaVista).map((x) => x.id), []);
});

test("★★★ C-1 de Mello: «30 %» en lugar de «5 %», con su retro; la nueva retro de «15 %»; la correcta, «Ninguno»", () => {
  /* La fila de Near que se corrige, y las de Mello, letra por letra en la auditoría (el ayudante ya falla si no). */
  assert.ok(NEAR_T73.includes(CORRECCIONES_T73[0][0]));
  for (const f of CORRECCIONES_T73[0][1]) assert.ok(MELLO_T73.includes(f));
  const p = pantalla("condiciones");
  assert.deepEqual(p.opciones.map((o) => [o.id, o.texto, o.correcta ?? false]), [["quince", "15 %", false], ["treinta", "30 %", false], ["ninguno", "Ninguno", true]]);
  assert.equal(p.opciones.find((o) => o.id === "treinta").devolucion, C7["Si elige 30 %"].textos[0]);
  assert.equal(p.opciones.find((o) => o.id === "quince").devolucion, C7["Si elige 15 %"].textos[0]);
  assert.equal(C7.Opciones.correcta, "Ninguno");
  /* Ninguna retro dice ya que a los treinta días no hay descuento: queda el comercial. */
  assert.doesNotMatch(JSON.stringify(p), /ya no hay descuento/);
  assert.ok(!p.opciones.some((o) => o.texto === "5 %"));
});

test("★★★ C7 · P1 dice lo de la tabla final, letra por letra; la figura con su rótulo y sus días; B2: 60 al acertar", () => {
  const p = pantalla("condiciones");
  assert.deepEqual(p.parrafos, C7.Texto.textos);
  assert.equal(p.pregunta, C7.Pregunta.textos[0]);
  assert.equal(p.acierto.texto, C7.Acierto.textos[0]);
  const f = p.figuras[0];
  assert.equal(f.titulo, C7["Rótulo de la figura"].textos[0]);
  assert.equal([10, 20, 30].map(f.rotDia).join(" · "), C7["Rótulo de los días"].textos[0]);
  assert.deepEqual(f.condiciones.filter((c) => c.dia).map((c) => c.lleva), C7["Figura del acierto"].textos);
  assert.equal(palabrasAlAcertar(C7), 60);
  /* El resumen conserva su línea: el paquete solo toca `condiciones`. */
  const r = pantalla("resumen").figuras[0];
  assert.equal(r.titulo, "5 % · 15/10 · 5/20 · n/30");
  assert.deepEqual([10, 20, 30].map(r.rotDia), ["día 10", "día 20", "día 30"]);
  /* La «Observación» de Mello sobre `cual-le-toca` NO se aplica. */
  assert.deepEqual(pantalla("cual-le-toca").tras, ["Con el IVA, Santa Martha debe $4.488.750. Paga el 4 de junio, diez días después de la venta."]);
});

test("★★★ las cifras de H-3 se recalculan; el pago cuadra", () => {
  const C = A.H3_LIBRO;
  const comercial = (4_200_000 * 5) / 100;
  const f = 4_200_000 - comercial;
  const iva = (f * 16) / 100;
  const ret = (f * 35) / 1000;
  const cond = (f * 15) / 100;
  assert.deepEqual([C.comercial, C.factura, C.iva, C.retencion, C.cliente, C.condicionado, C.pago], [comercial, f, iva, ret, f + iva - ret, cond, f + iva - ret - cond]);
  assert.equal(C.sumasVenta, C.cliente + C.retencion);
  /* El descuento condicionado no toca el IVA: se calcula sobre lo facturado por la mercancía. */
  assert.notEqual(C.condicionado, (C.cliente * 15) / 100);
  const as = pantalla("sobre-que").acierto.asientos[0];
  assert.deepEqual(as.lineas.map((l) => [l.cuenta, l.lado, l.monto]), [
    ["Caja o Bancos", "debe", C.pago], ["Descuento comercial condicionado", "debe", C.condicionado], ["Cuentas por cobrar – clientes", "haber", C.cliente],
  ]);
});

test("★★★ regla 3: ninguna cifra de X1-X4", () => {
  const prohibidas = [800_000, 175_000, 5_625_000, 5_800_000, 6_760_000, 17_460_000, 24_220_000, 1_518_000, 22_702_000, 1_200_000, 262_500, 8_437_500, 643_500, 8_700_000, 2_432_000, 532_000, 384_000, 84_000, 2_700_000, 2_784_000, 17_632_000];
  const numeros = new Set([...JSON.stringify(P).matchAll(/\d[\d.]*/g)].map((m) => Number(m[0].replace(/\./g, ""))));
  for (const x of prohibidas) assert.ok(!numeros.has(x), cifra(x));
});

test("★★★ la frase de las tarifas va en el pie de P3, la que da el IVA y la retención, y en ningún cuerpo", () => {
  assert.deepEqual(P.pantallas.filter((p) => p.pieTarifas).map((p) => p.id), ["cual-le-toca"]);
  assert.match(s("cual-le-toca").porque, /el IVA es de \$638\.400 y la retención, de \$139\.650/);
  assert.ok(!JSON.stringify(P.pantallas.map(({ pie, ...p }) => p)).includes(FRASE_TARIFAS));
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
const filasDe = (fig) => [...fig.querySelectorAll("[data-renglon]")].map((r) => [r.querySelector(".rg-op").textContent, r.querySelector(".rg-rot").textContent.replace(/^(menos|por|igual a) /, ""), r.querySelector(".rg-v").textContent]);
const plazos = (c) => {
  const f = c.querySelector("[data-plazos]");
  return f && {
    titulo: f.querySelector("figcaption").textContent,
    dias: [...f.querySelectorAll("[data-plazo] b")].map((b) => b.textContent),
    lleva: [...f.querySelectorAll("[data-lleva]")].map((b) => b.textContent),
    pago: f.querySelector("[data-pago]")?.textContent ?? null,
    venta: f.querySelector(".pz-ini") !== null,
  };
};
const LINEA = { titulo: "5 % · 15/10 · 5/20 · n/30", dias: ["día 10", "día 20", "día 30"], venta: false };
/* Aciertos C7: la línea de P1. */
const LINEA_P1 = { titulo: "5 % comercial · 15/10 · 5/20 · n/30", dias: ["10", "20", "30 días"], venta: false };

test("★★★ se recorre entera: cada pantalla y cada estado, contra el recorte", async () => {
  const m = await montar();
  try {
    await recorrer({
      caja: m.caja, P, S, tocar, w, textosDelError, tarifas: ["cual-le-toca"], frase: FRASE_TARIFAS,
      async alLlegar(k, c) {
        const id = S.pantallas[k].id;
        if (id === "condiciones") assert.deepEqual(plazos(c), { ...LINEA_P1, lleva: [], pago: null });
        if (id === "resumen") assert.deepEqual(plazos(c), { ...LINEA, lleva: ["15 %", "5 %", "sin descuento"], pago: "Pago · 4 jun" });
        if (!["condiciones", "resumen"].includes(id)) assert.equal(plazos(c), null);
        if (id === "cual-le-toca") {
          const fig = c.querySelector("figure[data-renglones]");
          assert.deepEqual(filasDe(fig), [["", "Precio de lista", "4.200.000"], ["−", "Descuento comercial 5 %", "210.000"], ["=", "Valor a facturar", "3.990.000"]]);
          /* La figura va antes del texto que la sigue. */
          const tras = [...c.querySelectorAll("[data-texto]")].find((x) => x.textContent.startsWith("Con el IVA"));
          assert.ok(fig.compareDocumentPosition(tras) & w.Node.DOCUMENT_POSITION_FOLLOWING);
        }
        if (id === "sobre-que") assert.equal(c.querySelector("figure, [data-figura]"), null);
      },
      async alFallar(k, c) {
        const id = S.pantallas[k].id;
        if (id === "condiciones") assert.deepEqual(plazos(c).lleva, [], "lo que lleva cada plazo daría la respuesta");
        if (id === "sobre-que") assert.equal(c.querySelector("[data-asiento]"), null);
      },
      async alAcertar(k, c) {
        const id = S.pantallas[k].id;
        if (id === "condiciones") {
          /* La misma línea, ahora con lo que lleva cada plazo, con el fundido. */
          assert.equal(c.querySelectorAll("[data-plazos]").length, 1);
          assert.deepEqual(plazos(c), { ...LINEA_P1, lleva: ["15 %", "5 %", "sin descuento"], pago: null });
          /* C7: nada plegado en el acierto. */
          assert.equal(c.querySelector("[data-mensaje] [data-por-que], [data-mensaje] [data-plegado], [data-porque-a-la-vista]"), null);
          assert.ok([...c.querySelectorAll("[data-lleva]")].every((x) => x.classList.contains("rg-nuevo")));
        }
        if (id === "sobre-que") {
          /* El pago en renglones, su asiento y, debajo, por qué va al debe. */
          const fig = c.querySelector("figure[data-renglones]");
          assert.equal(fig.querySelector("figcaption").textContent, "El pago del 4 de junio");
          assert.deepEqual(filasDe(fig), [["", "Lo que debía", "4.488.750"], ["−", "Descuento condicionado", "598.500"], ["=", "Paga", "3.890.250"]]);
          const as = c.querySelector("[data-asiento]");
          assert.equal(as.dataset.asiento, "sin-fecha");
          assert.equal(as.querySelector("[data-sumas]"), null);
          const tras = [...c.querySelectorAll("[data-mensaje] ~ [data-texto]")].map((x) => x.textContent);
          assert.deepEqual(tras, pantalla("sobre-que").acierto.despues);
          assert.ok(as.compareDocumentPosition(c.querySelector("[data-mensaje] ~ [data-texto]")) & w.Node.DOCUMENT_POSITION_FOLLOWING);
        }
      },
    });
  } finally {
    m.desmontar();
  }
});

/* ═══════════ 3 · CATÁLOGO Y TEMA ═══════════ */

test("★★★ fuera del catálogo de FP; en T7-3, después de A2 (y de H2 si ya entró)", () => {
  assert.equal(A.A3_ID, "t7-3-descuento-condicionado");
  assert.equal(P.numero, 3);
  const tema = SUBJECTS.contabilidad.topics.find((t) => t.id === TEMA_T7_3);
  const a = tema.actividades.find((x) => x.id === A.A3_ID);
  assert.deepEqual(a.clasificacion, { tipo: APRENDER });
  assert.equal(a.nombre, P.titulo);
  const ids = tema.actividades.filter((x) => x.clasificacion.tipo === APRENDER).map((x) => x.id);
  assert.equal(ids.indexOf(A.A3_ID), ids.indexOf("t7-3-descuentos-en-cadena") + 1);
  const piezas = PIEZAS_T7_3.map((x) => x.pieza.id);
  assert.equal(piezas.indexOf(A.A3_ID), piezas.indexOf("t7-3-descuentos-en-cadena") + 1);
  const dir = new URL("supabase/migrations/", RAIZ);
  assert.deepEqual(readdirSync(dir).filter((f) => readFileSync(new URL(f, dir), "utf8").includes(A.A3_ID)), []);
  assert.doesNotMatch(leer("src/data/contabilidadT7_3_a3.js"), /from\s+["'][^"']*\/(fp|lib\/supabase)[^"']*["']|registrarActividad(Completada)?\s*\(|\.rpc\s*\(/);
});
