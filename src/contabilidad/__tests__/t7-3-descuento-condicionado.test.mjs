import { test, mock } from "node:test";
import assert from "node:assert/strict";
import { readFileSync, readdirSync } from "node:fs";
import { JSDOM, VirtualConsole } from "jsdom";
import { seccion, compararDatos, prepararDom, CONDICION } from "./t7-3-recorte.mjs";
import { recorrerC4, conReloj } from "./t7-3-c4.mjs";
import { CONDICIONES as C7, CORRECCIONES_T73, MELLO_T73, NEAR_T73, aplicarAlRecorte, palabrasAlAcertar } from "./correccionesMelloAciertos.mjs";
import { CUAL_LE_TOCA as CLT, SOBRE_QUE_MELLO as SQ, FIGURA_ANTES, FILA_FIGURA_NEAR, TABLA_NEAR, NEAR_CLT, MELLO_OBLIGATORIA, MELLO_PARA_MISA, palabrasNear } from "./correccionesMelloCualLeToca.mjs";

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
 *   · `cual-le-toca` REHECHA (t7-3-condicionado-cual-le-toca.md, de Near,
 *     con auditoria-mello-t7-3-cual-le-toca.md encima; el ayudante
 *     correccionesMelloCualLeToca.mjs): el texto da solo las dos fechas, la
 *     figura de antes es `PLAZOS_A3(false)` tal cual y la misma franja marca
 *     el pago al acertar (`PLAZOS_A3(true)`); pista, y desde el 2.º error la
 *     devolución propia de cada opción. La factura y la frase de los
 *     $4.488.750 (con la retención) van a `sobre-que`, antes de la pregunta,
 *     leídas de la auditoría; B2: si con el acierto pasara de 60, el asiento
 *     iría al resumen (L)
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
const { cifra } = await import("../../components/mecanicas/libros/t7/PantallasT7_3.jsx");
const { default: AprenderT7_3C4 } = await import("../../components/mecanicas/libros/t7/AprenderT7_3C4.jsx");
const { CONSECUENCIA_C4: C4 } = await import("../c4/t73a3_c4.js");
const CE = await import("../canonEnganche.js");
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
/*
 * `cual-le-toca` rehecha: Near con Mello (el ayudante). Las líneas al llegar:
 * el texto, lo que pinta la franja (Mello) y la pregunta. El «¿Por qué?»
 * plegado es el del recorte: el paquete no lo toca.
 */
Object.assign(s("cual-le-toca"), {
  figura: "la franja de plazos, sin el pago (PLAZOS_A3(false))",
  lineas: [CLT.texto, CLT.figura.join(" · "), CLT.pregunta],
  opciones: CLT.opciones.map((o) => o.texto),
  pista: CLT.pista,
  errores: CLT.errores,
  segundoPropio: true,
  acierto: { texto: CLT.acierto, figura: CLT.figuraAcierto },
});
/* `sobre-que`, con la corrección de Mello: la factura (figura) y la frase, antes de la pregunta. */
Object.assign(s("sobre-que"), {
  figura: "la factura; en el acierto, el pago del 4 de junio y su asiento",
  lineas: [SQ.frase, ...s("sobre-que").lineas],
});

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
  /* `cual-le-toca` ya no dice «diez días después de la venta»: la rehízo Near. */
  assert.doesNotMatch(JSON.stringify(pantalla("cual-le-toca")), /después de la venta/);
});

test("★★★ `cual-le-toca` rehecha: texto aparte de la pregunta, pista, devolución propia de cada mala, acierto y pie, letra por letra (Near)", () => {
  const p = pantalla("cual-le-toca");
  assert.deepEqual(p.parrafos, [CLT.texto]);
  assert.equal(p.pregunta, CLT.pregunta);
  assert.equal(p.tras, undefined);
  assert.equal(p.pista, CLT.pista);
  assert.deepEqual(p.opciones.map((o) => [o.texto, o.correcta ?? false]), CLT.opciones.map((o) => [o.texto, o.correcta]));
  assert.deepEqual(p.opciones.filter((o) => !o.correcta).map((o) => [o.texto, o.devolucion]), CLT.errores.map((e) => [e.clave, e.texto]));
  assert.equal(p.errorPropio, true);
  assert.equal(p.acierto.texto, CLT.acierto);
  assert.deepEqual([p.pie, p.acierto.pie, p.error.pie], [CLT.pie, CLT.pie, CLT.pie]);
  /* Y al revés: cada «…» de la tabla de Near está en los datos, salvo las dos figuras (la de antes la corrige Mello; la del acierto es la franja). */
  const datos = JSON.stringify(p);
  for (const [campo, f] of Object.entries(TABLA_NEAR).filter(([c]) => !/^Figura/.test(c))) {
    for (const t of f.textos) assert.ok(datos.includes(JSON.stringify(t).slice(1, -1)), `${campo}: «${t}»`);
  }
  assert.deepEqual(Object.keys(TABLA_NEAR), ["Texto", "Figura", "Pregunta", "Opciones", "Pista (1.er error)", "2.º error · «5 %»", "2.º error · «Ninguno»", "Acierto", "Figura del acierto"]);
  /* La pista no da el número de días; los errores y el acierto, sí. */
  assert.doesNotMatch(p.pista, /diez|10 días/);
  /* Near cuenta 55 al acertar y 59 con el error más largo. */
  assert.equal(palabrasNear(["Texto", "Figura", "Pregunta", "Opciones", "Acierto", "Figura del acierto"]), 55);
  assert.equal(palabrasNear(["Texto", "Figura", "Pregunta", "Opciones", "2.º error · «5 %»"]), 59);
});

test("★★★ Mello · la figura de antes de responder es PLAZOS_A3(false) tal cual; al acertar, la misma franja es PLAZOS_A3(true); sin renglones de la factura", () => {
  assert.ok(NEAR_CLT.includes(FILA_FIGURA_NEAR));
  assert.match(MELLO_PARA_MISA, /usar `PLAZOS_A3\(false\)` tal cual/);
  const p = pantalla("cual-le-toca");
  assert.equal(p.figuras.length, 1);
  const { alAcertar, ...antes } = p.figuras[0];
  assert.deepEqual(antes, A.PLAZOS_A3(false));
  assert.deepEqual({ ...antes, ...alAcertar }, A.PLAZOS_A3(true));
  assert.equal(p.acierto.figuras, undefined);
  assert.ok(!p.figuras.some((f) => f.tipo === "renglones"));
  /* Ni la factura ni lo que debe Santa Martha a la vista: la respuesta de `sobre-que` no se adelanta (C1). */
  assert.doesNotMatch(JSON.stringify({ ...p, acierto: { ...p.acierto, porque: null } }), /3\.990\.000|4\.488\.750|3990000|4488750/);
});

test("★★★ Mello · corrección obligatoria: `sobre-que` trae, antes de la pregunta, la factura y la frase de los $4.488.750 con la retención (leídas de la auditoría)", () => {
  assert.match(MELLO_OBLIGATORIA, /`sobre-que` se queda sin datos/);
  const p = pantalla("sobre-que");
  assert.equal(p.figuras.length, 1);
  const f = p.figuras[0];
  assert.equal(f.tipo, "renglones");
  assert.deepEqual(f.filas.map((x) => x.v), [SQ.factura.lista, (SQ.factura.lista * SQ.factura.comercial) / 100, SQ.factura.factura]);
  assert.deepEqual(f.filas.map((x) => x.op ?? ""), ["", "−", "="]);
  assert.match(f.filas[1].rot, new RegExp(`comercial ${SQ.factura.comercial} %`));
  assert.deepEqual(p.tras, [SQ.frase]);
  assert.equal(p.parrafos, undefined);
  /* La frase cuadra: 3.990.000 + 638.400 − 139.650. */
  const C = A.H3_LIBRO;
  assert.equal(C.factura + C.iva - C.retencion, Number(SQ.frase.match(/\$([\d.]+)/)[1].replace(/\./g, "")));
  /* B2 (la sonda, más abajo): no pasa de 60 al acertar, así que el asiento se queda en `sobre-que` y el resumen no lo trae. */
  assert.equal(p.acierto.asientos.length, 1);
  assert.equal(pantalla("resumen").asientos, undefined);
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

/* ═══════════ 2 · MONTADA: EL PATRÓN C4 (toda decisión se pinta) ═══════════ */

const montar = async (pantallas = P.pantallas) => {
  const caja = document.createElement("div");
  document.body.appendChild(caja);
  const raiz = createRoot(caja);
  await act(async () => { raiz.render(h(AprenderT7_3C4, { pieza: { ...P, pantallas }, rotulo: "R" })); });
  return { caja, desmontar: () => { act(() => raiz.unmount()); caja.remove(); } };
};
const sp = (x) => JSON.parse(JSON.stringify(x).replace(/\u00a0/g, " "));
const filasDe = (fig) => sp([...fig.querySelectorAll("[data-renglon]")].map((r) => [r.querySelector(".rg-op").textContent, r.querySelector(".rg-rot").textContent.replace(/^(menos|por|igual a) /, ""), r.querySelector(".rg-v").textContent]));
const plazos = (c) => {
  const f = c.querySelector("[data-plazos]");
  return f && sp({
    titulo: f.querySelector("figcaption").textContent,
    dias: [...f.querySelectorAll("[data-plazo] b")].map((b) => b.textContent),
    lleva: [...f.querySelectorAll("[data-lleva]")].map((b) => b.textContent),
    pago: f.querySelector("[data-pago]")?.textContent ?? null,
    venta: f.querySelector(".pz-ini") !== null,
  });
};
const LINEA = sp({ titulo: "5 % · 15/10 · 5/20 · n/30", dias: ["día 10", "día 20", "día 30"], venta: false });
/*
 * La franja de `cual-le-toca` (PLAZOS_A3, sin rótulo de días): cada etiqueta
 * de abajo, con un espacio entre su parte en negrita y lo que lleva
 * («Venta 25 may», «10 días 15 %», «30 días: sin descuento»), y el pago.
 */
const franjaA3 = (c) => {
  const f = c.querySelector("[data-plazos]");
  const limpio = (t) => t.replace(/ /g, " ").replace(/\s+/g, " ").trim();
  return f && {
    etiquetas: [...f.querySelectorAll(".pz-abajo .pz-et")].map((x) => limpio([...x.childNodes].map((n) => n.textContent).join(" "))),
    pago: f.querySelector("[data-pago]") ? limpio(f.querySelector("[data-pago]").textContent) : null,
  };
};
/* Aciertos C7: la línea de P1. */
const LINEA_P1 = sp({ titulo: "5 % comercial · 15/10 · 5/20 · n/30", dias: ["10", "20", "30 días"], venta: false });

/* La marca C4 de la franja: el plazo que la opción tocada implica, con lo que le daría. */
const marcaC4 = (c) => c.querySelector("[data-marca-c4]")?.textContent.replace(/\u00a0/g, " ") ?? null;
const zonas = (c) => Object.fromEntries([...c.querySelectorAll("[data-zona]")].map((z) => [z.dataset.zona, [...z.querySelectorAll("[data-chip]")].map((x) => x.textContent.replace(/\u00a0/g, " "))]));

test("★★★ se recorre entera en el patrón C4: cada pantalla y cada estado, contra el recorte; el pago, el libro y el 15 % se pintan con cada opción", conReloj(async () => {
  const m = await montar();
  try {
    await recorrerC4({
      c: m.caja, w, act, P, S, c4: C4, frase: FRASE_TARIFAS,
      async alLlegar(id, H) {
        const c = m.caja;
        if (id === "condiciones") {
          assert.deepEqual(plazos(c), { ...LINEA_P1, lleva: [], pago: null });
          /* El día 30 lo da la pregunta: la marca está, sin descuento todavía. */
          assert.equal(marcaC4(c), "Día 30");
        }
        if (id === "resumen") assert.deepEqual(plazos(c), { ...LINEA, lleva: ["15 %", "5 %", "sin descuento"], pago: "Pago · 4 jun" });
        if (!["condiciones", "resumen", "cual-le-toca"].includes(id)) assert.equal(plazos(c), null);
        if (id === "cual-le-toca") {
          /* La franja tal cual PLAZOS_A3(false), sin el pago y SIN marca: el día 10 es la respuesta (Mello). */
          assert.deepEqual(franjaA3(c), { etiquetas: FIGURA_ANTES, pago: null });
          assert.equal(marcaC4(c), null);
          assert.equal(c.querySelector("figure[data-renglones]"), null);
          assert.doesNotMatch(c.textContent, /3\.990\.000|4\.488\.750|[Dd]ía 10/);
          /* El texto, la figura y la pregunta, en ese orden. */
          const [t, preg] = [c.querySelector("[data-texto].c4-txt"), c.querySelector("[data-pregunta]")];
          assert.equal(t.textContent, CLT.texto);
          assert.ok(t.compareDocumentPosition(c.querySelector("[data-plazos]")) & w.Node.DOCUMENT_POSITION_FOLLOWING);
          assert.ok(c.querySelector("[data-plazos]").compareDocumentPosition(preg) & w.Node.DOCUMENT_POSITION_FOLLOWING);
        }
        if (id === "que-es") assert.deepEqual(zonas(c), { factura: ["Comercial 5 %", "Condicionado"], libro: [] });
        if (id === "sobre-que") {
          /* Mello: la factura y la frase, antes de la pregunta; el pago y el asiento, todavía no. */
          const fig = c.querySelector("figure[data-renglones]");
          assert.equal(fig.querySelector("figcaption").textContent, "Factura de San Calixto");
          assert.deepEqual(filasDe(fig), [["", "Precio de lista", cifra(SQ.factura.lista)], ["−", `Descuento comercial ${SQ.factura.comercial} %`, "210.000"], ["=", "Valor a facturar", cifra(SQ.factura.factura)]]);
          assert.equal(c.querySelector("[data-texto].c4-txt").textContent, SQ.frase);
          assert.ok(c.querySelector("[data-texto].c4-txt").compareDocumentPosition(c.querySelector("[data-pregunta]")) & w.Node.DOCUMENT_POSITION_FOLLOWING);
          assert.equal(c.querySelector("[data-asiento]"), null);
          /* El 15 %, en blanco. */
          assert.deepEqual(filasDe(c.querySelector("[data-c4-objeto='quince']")).at(-1), ["", "15 %", "$?"]);
        }
      },
      async alElegir(id, o) {
        const c = m.caja;
        if (id === "condiciones") {
          assert.equal(marcaC4(c), `Día 30 · ${o.texto === "Ninguno" ? "sin descuento" : o.texto}`);
          assert.deepEqual(plazos(c).lleva, [], "lo que lleva cada plazo daría la respuesta");
        }
        if (id === "cual-le-toca") {
          /* El pago cae en el plazo que la opción implica; nunca en el día 10 antes de acertar. */
          assert.equal(marcaC4(c), o.texto === "Ninguno" ? "sin descuento" : o.texto);
          const dia = { "15 %": 5, "5 %": 15, Ninguno: 25 }[o.texto];
          assert.equal(c.querySelector("[data-marca-c4]").parentElement.style.left, `${(dia / 30) * 100}%`);
          assert.equal(franjaA3(c).pago, null, "el pago daría la respuesta");
        }
        if (id === "que-es") {
          const libro = { comercial: ["Comercial 5 %"], condicionado: ["Condicionado"], "los-dos": ["Comercial 5 %", "Condicionado"] }[o.id];
          assert.deepEqual(zonas(c).libro, libro);
          assert.equal(zonas(c).factura.length + libro.length, 2);
        }
        if (id === "sobre-que") {
          const b = Number(o.texto.replace(/\D/g, ""));
          assert.deepEqual(filasDe(c.querySelector("[data-c4-objeto='quince']")).at(-1), ["", `15 % de $${cifra(b)}`, cifra(b * 0.15)]);
          assert.equal(c.querySelector("[data-asiento]"), null);
        }
      },
      async alVeredicto(id, o, H) {
        assert.ok(H.figura().querySelector(".t73c4-mal"), `${id} · ${o.id}: sin la marca coral`);
        if (id === "cual-le-toca") assert.doesNotMatch(H.falla(), /día 10/, "la falla no dice la respuesta");
      },
      async alAcertar(id) {
        const c = m.caja;
        if (id === "cual-le-toca") {
          /* La misma franja crece: marca el pago del día 10, con el fundido. */
          assert.deepEqual(franjaA3(c), { etiquetas: FIGURA_ANTES, pago: "Pago · 4 jun" });
          assert.ok(c.querySelector("[data-pago]").classList.contains("rg-nuevo"));
        }
        if (id === "condiciones") {
          /* La misma línea, ahora con lo que lleva cada plazo, con el fundido. */
          assert.equal(c.querySelectorAll("[data-plazos]").length, 1);
          assert.deepEqual(plazos(c), { ...LINEA_P1, lleva: ["15 %", "5 %", "sin descuento"], pago: null });
          assert.ok([...c.querySelectorAll("[data-lleva]")].every((x) => x.classList.contains("rg-nuevo")));
        }
        if (id === "sobre-que") {
          /* La factura sigue arriba; el pago en renglones, su asiento y, debajo, por qué va al debe. */
          const figs = [...c.querySelectorAll("figure[data-renglones]")].filter((f) => !f.dataset.c4Objeto);
          assert.equal(figs[0].querySelector("figcaption").textContent, "Factura de San Calixto");
          assert.equal(figs[1].querySelector("figcaption").textContent, "El pago del 4 de junio");
          assert.deepEqual(filasDe(figs[1]), [["", "Lo que debía", "4.488.750"], ["−", "Descuento condicionado", "598.500"], ["=", "Paga", "3.890.250"]]);
          const as = c.querySelector("[data-asiento]");
          assert.equal(as.dataset.asiento, "sin-fecha");
          assert.equal(as.querySelector("[data-sumas]"), null);
          const tras = [...c.querySelectorAll("[data-del-acierto] > [data-texto]")].map((x) => x.textContent);
          assert.deepEqual(tras, pantalla("sobre-que").acierto.despues);
          assert.ok(as.compareDocumentPosition(c.querySelector("[data-del-acierto] > [data-texto]")) & w.Node.DOCUMENT_POSITION_FOLLOWING);
        }
      },
    });
  } finally {
    m.desmontar();
  }
}));

/* Monta la pieza desde una pantalla y toca, en orden, las opciones dadas (con su veredicto). */
const desde = async (id, ops) => {
  const k = P.pantallas.findIndex((x) => x.id === id);
  const m = await montar(P.pantallas.slice(k));
  for (const o of ops) {
    await act(async () => { m.caja.querySelector(`[data-op="${o}"]`).dispatchEvent(new w.MouseEvent("click", { bubbles: true })); });
    await act(async () => { mock.timers.tick(380); });
  }
  return m;
};
const errorVisto = (c) => c.querySelector('[data-mensaje="error"] [data-texto-retro]')?.textContent ?? null;

test("★★★ `cual-le-toca` · escalera C2 del motor: el 1.er error da la pista (sea cual sea la mala); desde el 2.º, la devolución propia de la que se tocó; el foco, al mensaje", conReloj(async () => {
  const p = pantalla("cual-le-toca");
  const dev = (id) => p.opciones.find((o) => o.id === id).devolucion;
  for (const [a, b] of [["cinco", "ninguno"], ["ninguno", "cinco"], ["cinco", "cinco"], ["ninguno", "ninguno"]]) {
    const m = await desde("cual-le-toca", [a]);
    try {
      assert.equal(errorVisto(m.caja), CLT.pista, `${a}: 1.er error`);
      assert.equal(w.document.activeElement, m.caja.querySelector("[data-c4-msg]"));
      await act(async () => { m.caja.querySelector(`[data-op="${b}"]`).dispatchEvent(new w.MouseEvent("click", { bubbles: true })); });
      await act(async () => { mock.timers.tick(380); });
      assert.equal(errorVisto(m.caja), dev(b), `${a} → ${b}: 2.º error`);
      assert.equal(w.document.activeElement, m.caja.querySelector("[data-c4-msg]"));
      /* La franja sigue sin el pago, también con el error. */
      assert.equal(franjaA3(m.caja).pago, null);
      await act(async () => { m.caja.querySelector(`[data-op="${a}"]`).dispatchEvent(new w.MouseEvent("click", { bubbles: true })); });
      await act(async () => { mock.timers.tick(380); });
      assert.equal(errorVisto(m.caja), dev(a), `${a} → ${b} → ${a}: 3.er error`);
    } finally {
      m.desmontar();
    }
  }
  assert.deepEqual(CLT.errores.map((e) => e.texto), [dev("cinco"), dev("ninguno")]);
}));

/*
 * B2 con la sonda (canonEnganche.js): palabras de texto visibles, sin la
 * figura ni lo plegado. Ninguna de las dos pantallas pasa de 60 en ningún
 * estado: al llegar, con cada error (1.º y 2.º) y al acertar. En el patrón
 * C4 cuentan también la falla (texto, fuera de la figura) y las opciones.
 */
test("★★★ B2 (sonda): `cual-le-toca` y `sobre-que`, estado por estado; solo el 2.º error de `cual-le-toca` pasa de 60 (62, a la vista de L), con el asiento en `sobre-que`", conReloj(async () => {
  const medidas = {};
  for (const id of ["cual-le-toca", "sobre-que"]) {
    const p = pantalla(id);
    const malas = p.opciones.filter((o) => !o.correcta).map((o) => o.id);
    const estados = { "al llegar": [], "al acertar": [p.opciones.find((o) => o.correcta).id] };
    for (const a of malas) {
      estados[`1.er error ${a}`] = [a];
      for (const b of malas) estados[`2.º error ${a}→${b}`] = [a, b];
    }
    for (const [estado, ops] of Object.entries(estados)) {
      const m = await desde(id, ops);
      try {
        medidas[`${id} · ${estado}`] = CE.medirTarjeta(CE.tarjetaDe(m.caja), w).texto;
      } finally {
        m.desmontar();
      }
    }
  }
  /*
   * B2 > 60, A LA VISTA DE L, NEAR Y MELLO: en el patrón C4, el 2.º error de
   * `cual-le-toca` llega a 62 (texto 30 con la cejilla «Pregunta 3 de 4»,
   * más la devolución de Near y la falla de la figura). Se fija la lista
   * exacta: cualquier estado nuevo por encima de 60 rompe la prueba.
   */
  assert.deepEqual(Object.entries(medidas).filter(([, n]) => n > CE.UMBRAL_B2_PALABRAS), B2_SOBRE_60);
  /* Medido el 17 de octubre de 2026 en el patrón C4: al acertar y el estado más largo. */
  const mayor = (id) => Math.max(...Object.entries(medidas).filter(([k]) => k.startsWith(id)).map(([, n]) => n));
  assert.deepEqual([medidas["cual-le-toca · al acertar"], mayor("cual-le-toca")], MEDIDA_CLT);
  assert.deepEqual([medidas["sobre-que · al acertar"], mayor("sobre-que")], MEDIDA_SQ);
  assert.ok(pantalla("sobre-que").acierto.asientos.length === 1);
}));
const MEDIDA_CLT = [52, 62];
const MEDIDA_SQ = [33, 59];
const B2_SOBRE_60 = [
  ["cual-le-toca · 2.º error cinco→cinco", 62], ["cual-le-toca · 2.º error cinco→ninguno", 62],
  ["cual-le-toca · 2.º error ninguno→cinco", 62], ["cual-le-toca · 2.º error ninguno→ninguno", 62],
];

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
  assert.equal(PIEZAS_T7_3.find((x) => x.pieza.id === A.A3_ID).Pieza, AprenderT7_3C4);
  const dir = new URL("supabase/migrations/", RAIZ);
  assert.deepEqual(readdirSync(dir).filter((f) => readFileSync(new URL(f, dir), "utf8").includes(A.A3_ID)), []);
  assert.doesNotMatch(leer("src/data/contabilidadT7_3_a3.js"), /from\s+["'][^"']*\/(fp|lib\/supabase)[^"']*["']|registrarActividad(Completada)?\s*\(|\.rpc\s*\(/);
});
