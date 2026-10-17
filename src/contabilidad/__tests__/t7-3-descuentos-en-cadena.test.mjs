import { test } from "node:test";
import assert from "node:assert/strict";
import { readFileSync, readdirSync } from "node:fs";
import { JSDOM, VirtualConsole } from "jsdom";
import { seccion, compararDatos, prepararDom } from "./t7-3-recorte.mjs";
import { recorrerC4, conReloj } from "./t7-3-c4.mjs";

/*
 * ═══════════════════════════════════════════════════════════════════════════
 * T7-3 · A2 «Descuentos en cadena» (Célula C) · Aprender · RECORTE.
 *
 *   · cada pantalla, texto, opción, pista, error, acierto y «¿Por qué?» es
 *     el del recorte de Near (lote1-recortes-t73-v1.md), letra por letra
 *     (Mello: PASA), con el cambio de la entrega 6 de Near en P1 `ejemplo`,
 *     que llegó por L: la pregunta, sus tres opciones y sus dos errores
 *   · la regla del saldo ya no se lee antes de preguntarla
 *   · la cadena crece con el acierto de `pasos`; el atajo es una pregunta
 *   · la frase de las tarifas, en el pie del asiento
 *   · las cifras de H-2 se recalculan; regla 3; fuera del catálogo de FP
 * ═══════════════════════════════════════════════════════════════════════════
 */

const w = prepararDom(JSDOM, VirtualConsole);
const React = await import("react");
const { createRoot } = await import("react-dom/client");
const act = React.act;
const h = React.createElement;

const A = await import("../../data/contabilidadT7_3_a2.js");
const { FRASE_TARIFAS } = await import("../../data/contabilidadT7_3.js");
const { SUBJECTS, APRENDER } = await import("../../data/subjects.js");
const { cifra } = await import("../../components/mecanicas/libros/t7/PantallasT7_3.jsx");
const { default: AprenderT7_3C4 } = await import("../../components/mecanicas/libros/t7/AprenderT7_3C4.jsx");
const { CONSECUENCIA_C4: C4 } = await import("../c4/t73a2_c4.js");
const { PIEZAS_T7_3, TEMA_T7_3 } = await import("../../components/ContabilidadT7_3View.jsx");

const RAIZ = new URL("../../../", import.meta.url);
const leer = (f) => readFileSync(new URL(f, RAIZ), "utf8");
const RECORTE = leer("orquestador/conocimiento/paquetes/lote1-recortes-t73-v1.md");
const P = A.PIEZA_DESCUENTOS_EN_CADENA;
const S = seccion(RECORTE, P.id);
const pantalla = (id) => P.pantallas.find((x) => x.id === id);

/*
 * ENTREGA 6 DE NEAR (lote1-entrega6-v1.md): en P1 `ejemplo`, la pregunta, las
 * opciones (la correcta es «Menor que 23 %») y los dos errores; el de «Mayor»
 * es el del anexo del lote 2. Gana sobre el recorte.
 */
const ENTREGA_6 = {
  pregunta: "Suman 23 %. ¿La rebaja total será mayor, igual o menor que el 23 %?",
  opciones: ["Mayor que 23 %", "Igual: 23 %", "Menor que 23 %"],
  errores: [
    { clave: "Igual", texto: "Sería igual si cada descuento fuera sobre el precio de lista. Pero cada uno va sobre un saldo más pequeño." },
    { clave: "Mayor", texto: "Cada descuento se calcula sobre un saldo más pequeño que el anterior. Así, la rebaja total no puede pasar del 23 %." },
  ],
};
{
  const E6 = leer("orquestador/conocimiento/paquetes/lote1-entrega6-v1.md");
  const fila = (campo) => E6.split("\n").find((l) => l.startsWith(`| ${campo} | `)) ?? "";
  assert.ok(fila("`descuentos-en-cadena` · `ejemplo` · pregunta").endsWith(`| «${ENTREGA_6.pregunta}» |`));
  assert.ok(fila("Opciones").includes(`| ${ENTREGA_6.opciones.map((o) => `«${o}»`).join(" · ")} (correcta) |`));
  assert.ok(fila("Error de «Igual» (nuevo; reemplaza el de «Sí»)").endsWith(`| «${ENTREGA_6.errores[0].texto}» |`));
  assert.ok(fila("Error de «Mayor»").endsWith("| El texto del anexo, igual. |"));
  assert.ok(leer("orquestador/conocimiento/paquetes/lote2-anexo-v1.md").includes(`«${ENTREGA_6.errores[1].texto}»`));
}
{
  const e = S.pantallas[1];
  assert.equal(e.id, "ejemplo");
  /* Lo que reemplaza: la pregunta y las opciones del recorte. */
  assert.deepEqual([e.lineas[1], e.opciones], ["Suman 23 %. ¿Rebaja el 23 % del precio de lista?", ["Sí", "No: le rebaja menos del 23 %", "No: le rebaja más del 23 %"]]);
  e.lineas[1] = ENTREGA_6.pregunta;
  e.opciones = ENTREGA_6.opciones;
  e.errores = ENTREGA_6.errores;
}

/* ═══════════ 1 · DATOS ═══════════ */

test("★★★ pantallas, textos, opciones, pista, errores, acierto y ¿Por qué?: los del recorte (y la entrega 6), letra por letra", () => {
  assert.deepEqual(S.pantallas.map((s) => s.id), ["portada", "ejemplo", "pasos", "atajo", "asiento", "resumen"]);
  compararDatos(P, S);
  assert.equal(pantalla("ejemplo").opciones.find((o) => o.correcta).texto, "Menor que 23 %");
  assert.equal(pantalla("portada").objetivo, S.pantallas[0].lineas[0]);
  /* La lectura «en cadena» se fue; la pregunta nueva del atajo, con su pista. */
  assert.equal(pantalla("en-cadena"), undefined);
  assert.equal(pantalla("atajo").pista, "El factor es lo que queda después de los tres descuentos. ¿Qué valor es ese?");
});

test("★★★ la regla del saldo no se lee antes de preguntarla: ni en la portada ni en el cuerpo de P1", () => {
  const regla = /sobre el saldo que dejó el anterior/;
  for (const p of P.pantallas.slice(0, 2)) {
    for (const t of [p.objetivo, ...(p.parrafos ?? []), p.pregunta].filter(Boolean)) assert.doesNotMatch(t, regla, `${p.id}: «${t}»`);
  }
  /* Queda en el «¿Por qué?» del acierto. */
  assert.match(pantalla("ejemplo").acierto.porque, regla);
});

test("★★★ las cifras de H-2 se recalculan; el factor es 0,7866 y el asiento cuadra", () => {
  const C = A.H2_LIBRO;
  const d1 = (4_200_000 * 5) / 100; const s1 = 4_200_000 - d1;
  const d2 = (s1 * 8) / 100; const s2 = s1 - d2;
  const d3 = (s2 * 10) / 100; const f = s2 - d3;
  assert.deepEqual([C.d1, C.s1, C.d2, C.s2, C.d3, C.factura], [d1, s1, d2, s2, d3, f]);
  assert.equal(C.rebaja, 4_200_000 - f);
  assert.equal(C.rebaja23, (4_200_000 * 23) / 100);
  assert.equal((C.rebaja / 4_200_000 * 100).toFixed(2), "21.34");
  assert.equal(Math.round(0.95 * 0.92 * 0.9 * 10_000) / 10_000, C.factor);
  assert.equal(Math.round(4_200_000 * C.factor), f);
  /* El libro redondea al peso: 528.595,2 y 115.630,2. */
  assert.deepEqual([C.iva, C.retencion], [Math.round((f * 16) / 100), Math.round((f * 35) / 1000)]);
  assert.equal(C.cliente, f + C.iva - C.retencion);
  assert.equal(C.sumas, C.cliente + C.retencion);
  assert.equal(C.sumas, C.iva + f);
  const as = pantalla("asiento").asientos[0];
  assert.deepEqual(as.lineas.map((l) => [l.cuenta, l.lado, l.monto]), [
    ["Cuentas por cobrar – clientes", "debe", C.cliente], ["Anticipo fiscal", "debe", C.retencion],
    ["IVA por pagar", "haber", C.iva], ["Ingresos por ventas", "haber", C.factura],
  ]);
  assert.equal(as.sumas, true, "el recorte: «el asiento de la venta, con sus sumas»");
  /* La errata C7-2 (0,7688) no aparece. */
  assert.ok(!JSON.stringify(P).includes("0,7688"));
});

test("★★★ regla 3: ninguna cifra de X1-X4", () => {
  const prohibidas = [800_000, 175_000, 5_625_000, 5_800_000, 6_760_000, 17_460_000, 24_220_000, 1_518_000, 22_702_000, 1_200_000, 262_500, 8_437_500, 643_500, 8_700_000, 2_432_000, 532_000, 384_000, 84_000, 2_700_000, 2_784_000, 17_632_000];
  const numeros = new Set([...JSON.stringify(P).matchAll(/\d[\d.]*/g)].map((m) => Number(m[0].replace(/\./g, ""))));
  for (const x of prohibidas) assert.ok(!numeros.has(x), cifra(x));
});

test("★★★ la frase de las tarifas va en el pie del asiento, la pantalla que las da, y en ningún cuerpo", () => {
  assert.deepEqual(P.pantallas.filter((p) => p.pieTarifas).map((p) => p.id), ["asiento"]);
  assert.match(pantalla("asiento").parrafos[0], /IVA del 16 % y la retención del 3,5 %/);
  assert.ok(!JSON.stringify(P.pantallas.map(({ pie, ...p }) => p)).includes(FRASE_TARIFAS));
});

/* ═══════════ 2 · MONTADA: EL PATRÓN C4 (toda decisión se pinta) ═══════════ */

const montar = async () => {
  const caja = document.createElement("div");
  document.body.appendChild(caja);
  const raiz = createRoot(caja);
  await act(async () => { raiz.render(h(AprenderT7_3C4, { pieza: P, rotulo: "R" })); });
  return { caja, desmontar: () => { act(() => raiz.unmount()); caja.remove(); } };
};
const filasDe = (fig) => [...fig.querySelectorAll("[data-renglon]")].map((r) => [r.querySelector(".rg-op").textContent, r.querySelector(".rg-rot").textContent.replace(/^(menos|por|igual a) /, "").replace(/\u00a0/g, " "), r.querySelector(".rg-v").textContent.replace(/\u00a0/g, " "), r.classList.contains("rg-res")]);
const CADENA = [
  ["", "Precio de lista", "4.200.000", false],
  ["−", "Descuento 5 %", "210.000", false],
  ["=", "Saldo", "3.990.000", true],
  ["−", "Descuento 8 % del saldo", "319.200", false],
  ["=", "Saldo", "3.670.800", true],
  ["−", "Descuento 10 % del saldo", "367.080", false],
  ["=", "Valor a facturar", "3.303.720", true],
];
/* La barra: cada tramo con lo que queda o lo rebajado, en pesos de la lista, y su rótulo (dentro o en la leyenda). */
const tramos = (c) => [...c.querySelectorAll("[data-c4-objeto='barra'] [data-tramo]")].map((t) => [t.dataset.tramo, Number(t.style.flexGrow ?? t.style.flex.split(" ")[0])]);
const rotulos = (c) => [...c.querySelectorAll("[data-c4-objeto='barra'] [data-tramo] span"), ...c.querySelectorAll("[data-c4-objeto='barra'] [data-leyenda]")].map((x) => x.textContent).join(" · ");

test("★★★ se recorre entera en el patrón C4: cada pantalla y cada estado, contra el recorte; la barra se corta como dice cada opción", conReloj(async () => {
  const m = await montar();
  const L = A.H2_LIBRO.lista;
  try {
    await recorrerC4({
      c: m.caja, w, act, P, S, c4: C4, frase: FRASE_TARIFAS,
      async alLlegar(id) {
        const c = m.caja;
        const figs = [...c.querySelectorAll("figure[data-renglones]")];
        if (id === "pasos") {
          /* Al principio, solo el primer descuento, y la barra con el 5 % ya cortado. */
          assert.equal(figs.length, 1);
          assert.deepEqual(filasDe(figs[0]), CADENA.slice(0, 3));
          assert.deepEqual(tramos(c).map((t) => t[0]), ["queda", "corte"]);
        }
        if (id === "atajo") {
          assert.deepEqual(filasDe(figs[0]), [["", "Complementos", "0,95 × 0,92 × 0,90", false], ["=", "Factor", "0,7866", true]]);
          assert.ok(figs[0].querySelector("[data-renglon]").classList.contains("rg-apila"));
        }
        if (id === "asiento") assert.deepEqual([...c.querySelectorAll("[data-suma]")].map((x) => x.textContent), [cifra(A.H2_LIBRO.sumas), cifra(A.H2_LIBRO.sumas)]);
        if (id === "resumen") {
          assert.equal(figs[0].querySelector("figcaption").textContent, "$4.200.000 → $3.303.720");
          assert.deepEqual(filasDe(figs[0]), CADENA);
        }
        if (id === "ejemplo") {
          assert.equal(figs.length, 0);
          /* La lista entera, sin cortar. */
          assert.deepEqual(tramos(c), [["queda", 1]]);
        }
      },
      async alElegir(id, o) {
        const c = m.caja;
        /* La barra suma siempre la lista; lo rebajado según la opción, antes del veredicto. */
        const suma = tramos(c).reduce((x, t) => x + t[1], 0);
        assert.ok(Math.abs(suma - 1) < 1e-9, `${id} · ${o.id}: la barra no suma la lista`);
        const queda = Math.round(tramos(c)[0][1] * L);
        if (id === "ejemplo") assert.equal(queda, { igual: 3_234_000, mayor: 3_108_000, menor: A.H2_LIBRO.factura }[o.id]);
        if (id === "ejemplo" && o.id === "menor") assert.equal(rotulos(c), "$3.303.720 · 10 % · 8 % · 5 %");
        if (id === "pasos") assert.match(rotulos(c), new RegExp(`8 % de \\${o.texto.replace(/\./g, "\\.")} = `));
        if (id === "atajo") assert.equal(queda, Number(o.texto.replace(/\D/g, "")));
        if (id === "pasos") assert.deepEqual(filasDe(c.querySelector("figure[data-renglones]")), CADENA.slice(0, 3), "la cadena de Near no crece antes del acierto");
      },
      async alVeredicto(id, o, H) {
        assert.ok(H.figura().querySelector("[data-tramo].t73c4-mal"), `${id} · ${o.id}: el tramo en coral`);
      },
      async alAcertar(id) {
        const c = m.caja;
        if (id === "pasos") {
          /* Con el acierto, la misma cadena crece; los renglones nuevos entran con el fundido. */
          const figs = [...c.querySelectorAll("figure[data-renglones]")];
          assert.equal(figs.length, 1);
          assert.deepEqual(filasDe(figs[0]), CADENA);
          assert.deepEqual([...figs[0].querySelectorAll("[data-renglon]")].map((r) => r.classList.contains("rg-nuevo")), [false, false, false, true, true, true, true]);
        }
        if (id === "atajo") assert.equal(c.querySelectorAll("figure[data-renglones] [data-renglon]").length, 2);
        assert.equal(c.querySelector("[data-tramo].t73c4-mal"), null);
      },
    });
  } finally {
    m.desmontar();
  }
}));

/* ═══════════ 3 · CATÁLOGO Y TEMA ═══════════ */

test("★★★ fuera del catálogo de FP; en T7-3, después de A1 (y de H1 si ya entró)", () => {
  assert.equal(A.A2_ID, "t7-3-descuentos-en-cadena");
  assert.equal(P.numero, 2);
  const tema = SUBJECTS.contabilidad.topics.find((t) => t.id === TEMA_T7_3);
  const a = tema.actividades.find((x) => x.id === A.A2_ID);
  assert.deepEqual(a.clasificacion, { tipo: APRENDER });
  assert.equal(a.nombre, P.titulo);
  const ids = tema.actividades.filter((x) => x.clasificacion.tipo === APRENDER).map((x) => x.id);
  assert.equal(ids.indexOf(A.A2_ID), ids.indexOf("t7-3-descuento-comercial") + 1);
  const piezas = PIEZAS_T7_3.map((x) => x.pieza.id);
  assert.equal(piezas.indexOf(A.A2_ID), piezas.indexOf("t7-3-descuento-comercial") + 1);
  assert.equal(PIEZAS_T7_3.find((x) => x.pieza.id === A.A2_ID).Pieza, AprenderT7_3C4);
  const dir = new URL("supabase/migrations/", RAIZ);
  assert.deepEqual(readdirSync(dir).filter((f) => readFileSync(new URL(f, dir), "utf8").includes(A.A2_ID)), []);
  assert.doesNotMatch(leer("src/data/contabilidadT7_3_a2.js"), /from\s+["'][^"']*\/(fp|lib\/supabase)[^"']*["']|registrarActividad(Completada)?\s*\(|\.rpc\s*\(/);
});
