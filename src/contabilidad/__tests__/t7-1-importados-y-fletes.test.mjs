import { test } from "node:test";
import assert from "node:assert/strict";
import { readFileSync, readdirSync } from "node:fs";
import { JSDOM, VirtualConsole } from "jsdom";

/*
 * ═══════════════════════════════════════════════════════════════════════════
 * T7-1 · A5 «Importados y fletes» (Célula C).
 *
 *   · cada texto de los datos está, letra por letra, en la v1 de Near o en
 *     sus cambios de la v2; cada texto visible de la v1 está en los datos,
 *     salvo los que la v2 reemplaza, y esos ya no aparecen
 *   · las fichas, los asientos del 18 de marzo y la tabla lado a lado son los
 *     de la v1, con los cambios de la v2 y los de la figura de Watari; las
 *     cifras se calculan y las sumas cuadran
 *   · cada pantalla y cada estado muestran exactamente sus textos, con su
 *     pie: el de colocando y el de la respuesta
 *   · la «Figura de A5» de Watari: la tarjeta de asientos llega con el
 *     acierto de P4 y P5, no antes ni en los errores; sumas solo en el primer
 *     asiento, raya doble y sangría en el haber; en P6 la fila «Quién asume
 *     el flete» se señala solo con el acierto; nombres accesibles marcados
 *     como pendientes de revisión
 *   · fuera del catálogo de FP, sin la renta del 33 % ni cifras de medición
 *
 * El ancho a 375 y 320 lo mide scripts/t7/medir-t7-1-a5.mjs en Chromium.
 * ═══════════════════════════════════════════════════════════════════════════
 */

const dom = new JSDOM("<!doctype html><html><body></body></html>", { url: "http://localhost/", virtualConsole: new VirtualConsole() });
const w = dom.window;
w.matchMedia = () => ({ matches: false, addEventListener() {}, removeEventListener() {}, addListener() {}, removeListener() {} });
for (const [k, v] of Object.entries({
  window: w, document: w.document, navigator: w.navigator, localStorage: w.localStorage,
  HTMLElement: w.HTMLElement, Element: w.Element, Node: w.Node, SVGElement: w.SVGElement,
  Event: w.Event, MouseEvent: w.MouseEvent, KeyboardEvent: w.KeyboardEvent,
  getComputedStyle: w.getComputedStyle.bind(w), matchMedia: w.matchMedia,
})) {
  Object.defineProperty(globalThis, k, { value: v, configurable: true, writable: true });
}
globalThis.IS_REACT_ACT_ENVIRONMENT = true;

const React = await import("react");
const { createRoot } = await import("react-dom/client");
const act = React.act;
const h = React.createElement;

const A = await import("../../data/contabilidadT7_1_a5.js");
const { SUBJECTS, APRENDER } = await import("../../data/subjects.js");
const { default: Importados, CSS_A5 } = await import("../../components/mecanicas/libros/t7/ImportadosYFletes.jsx");
const { PIEZAS_T7_1, TEMA_T7_1 } = await import("../../components/ContabilidadT7_1View.jsx");

const RAIZ = new URL("../../../", import.meta.url);
const leer = (f) => readFileSync(new URL(`orquestador/conocimiento/paquetes/${f}`, RAIZ), "utf8");
const V1 = leer("t7-1-a5-v1.md");
const V2 = leer("t7-1-a5-v2-cambios.md");
const WATARI = leer("t7-1-a5-figura-watari.md");
const CONTENIDO = V1.slice(V1.indexOf("## Contenido"), V1.indexOf("## Erratas que toca"));
const P = A.PIEZA_IMPORTADOS_Y_FLETES;
const pantalla = (id) => P.pantallas.find((x) => x.id === id);
const seccion = (marca, siguiente) => CONTENIDO.slice(CONTENIDO.indexOf(marca), siguiente ? CONTENIDO.indexOf(siguiente) : undefined);

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
const boton = (caja, n) => caja.querySelector(`[data-boton="${n}"]`);
const estado = (caja) => caja.querySelector("[data-estado]")?.dataset.estado ?? null;
const conPieza = (...ids) => ({ ...P, pantallas: ids.map(pantalla) });
const correcta = (p) => p.opciones.find((o) => o.correcta).id;
const responder = async (caja, id) => {
  await tocar(caja.querySelector(`[data-opcion="${id}"]`));
  await tocar(boton(caja, "confirmar"));
};

/* ═══════════ LO QUE EL ESTUDIANTE LEE, SACADO DE LOS DATOS ═══════════ */

/* Sin las fichas ni las tablas: esas se comparan como tablas, más abajo. */
function textosVisibles() {
  const t = [P.titulo];
  for (const p of P.pantallas) {
    for (const k of ["objetivo", "entrada", "enunciado", "aviso", "pregunta", "siguiente", "boton", "pie", "pieRespuesta"]) if (p[k]) t.push(p[k]);
    t.push(...(p.parrafos ?? []), ...(p.lista ?? []));
    for (const o of p.opciones ?? []) { t.push(o.texto); if (o.devolucion) t.push(o.devolucion); }
    if (p.acierto) t.push(...p.acierto.textos);
  }
  return t;
}

/*
 * Los «…» de primer nivel del contenido de la v1 que el estudiante ve. Fuera
 * quedan las notas de Near: lo que va entre paréntesis (menos el «(fletes)»
 * de la cuenta), la glosa entre «*[…]*», la frase de los «gastos de
 * nacionalización» y las etiquetas de los errores («- «Inventario»: …»).
 */
function citasVisibles(md) {
  const limpio = md
    .replace(/\*\[[^\]]*\]\*/g, "")
    .replace(/\((?!fletes\))[^()]*\)/g, "")
    .replace(/Son los ejemplos que da el libro de los «gastos de nacionalización»\./, "")
    .replace(/^(\s*- )«[^»]*»: /gm, "$1");
  const citas = [];
  let nivel = 0;
  let actual = "";
  for (const c of limpio) {
    if (c === "«") { if (nivel > 0) actual += c; nivel++; continue; }
    if (c === "»") { nivel--; if (nivel > 0) actual += c; else { citas.push(actual); actual = ""; } continue; }
    if (nivel > 0) actual += c;
  }
  assert.equal(nivel, 0, "las comillas de la v1 no cierran");
  return citas;
}

function tablaDespuesDe(md, marca) {
  const desde = md.indexOf(marca);
  assert.ok(desde >= 0, `no está «${marca}»`);
  const lineas = md.slice(desde).split("\n");
  const inicio = lineas.findIndex((l) => l.startsWith("|"));
  const filas = [];
  for (const l of lineas.slice(inicio)) {
    if (!l.startsWith("|")) break;
    filas.push(l.slice(1, -1).split("|").map((c) => c.trim()));
  }
  return filas.filter((f) => !f.every((c) => /^-*$/.test(c)));
}

/*
 * Lo que la v2 reemplaza: el texto de la v1 y el que lo sustituye. Las dos
 * mitades se buscan letra por letra, la vieja en la v1 y la nueva en la v2.
 */
const REEMPLAZOS = [
  ["El valor de la factura del proveedor del exterior, pasado a pesos con la tasa del día de la compra.", "El valor de la factura del proveedor del exterior, pasado a pesos con la tasa de cambio del día de la compra."],
  ["El 18 de marzo, Santa Martha compra mercancía a crédito a un proveedor. La mercancía vale $7.500.000, más el IVA. Ese mismo día, Santa Martha le paga $650.000 de fletes a la transportadora. Usa el sistema de inventario periódico.", "El 18 de marzo, Santa Martha compra mercancía a crédito a un proveedor. La mercancía vale $7.500.000, más el IVA. El flete vale $650.000 y lo asume Santa Martha, que le paga a la transportadora ese mismo día. Usa el sistema de inventario periódico."],
  ["El 18 de marzo, La Popa le vende mercancía a crédito a Santa Martha. La mercancía vale $7.500.000, más el IVA. Ese mismo día, La Popa le paga $650.000 de fletes a la transportadora. Usa el sistema de inventario periódico.", "El 18 de marzo, La Popa le vende mercancía a crédito a Santa Martha. La mercancía vale $7.500.000, más el IVA. El flete vale $650.000 y lo asume La Popa, que le paga a la transportadora ese mismo día. Usa el sistema de inventario periódico."],
  ["Ese es el flete que paga el vendedor. Aquí lo paga el comprador, y el libro lo suma al costo: va a Compras.", "Ese es el flete que asume el vendedor. Aquí lo asume el comprador, y el libro lo suma al costo: va a Compras."],
  ["Ahora mira un caso en que el flete lo paga quien vende.", "Ahora mira un caso en que el flete lo asume quien vende."],
  ["Quién lo paga: el comprador o el vendedor.", "Quién lo asume: el comprador o el vendedor."],
  ["Exacto. Si lo asume el comprador, es parte del costo. Si lo paga el vendedor, es un gasto de venta.", "Exacto. Si lo asume el comprador, es parte del costo. Si lo asume el vendedor, es un gasto de venta."],
  ["Si el vendedor paga el flete, es un gasto de venta.", "Si el vendedor asume el flete, es un gasto de venta."],
];

/* ═══════════ 1 · TEXTOS CONTRA LA v1 Y LA v2 ═══════════ */

test("★★★ cada texto de los datos está, letra por letra, en la v1 o en la v2 de Near", () => {
  const faltan = textosVisibles().filter((t) => !V1.includes(t) && !V2.includes(t));
  /* Los botones no los trae la v1 (convención de AP1, AP2 y A6): se comprueban aparte. */
  assert.deepEqual(faltan.filter((t) => !Object.values(A.BOTON).includes(t)), [], "estos textos no están en la v1 ni en la v2");
});

test("★★★ cada texto que la v2 reemplaza: el viejo está en la v1 y ya no se ve; el nuevo está en la v2 y se ve", () => {
  const datos = new Set(textosVisibles());
  for (const [viejo, nuevo] of REEMPLAZOS) {
    assert.ok(V1.includes(`«${viejo}»`), `no está en la v1: ${viejo}`);
    assert.ok(V2.includes(`«${nuevo}»`), `no está en la v2: ${nuevo}`);
    assert.ok(!datos.has(viejo), `sigue el texto de la v1: ${viejo}`);
    assert.ok(datos.has(nuevo), `falta el texto de la v2: ${nuevo}`);
  }
});

test("★★★ cada texto visible de la v1 está en los datos, salvo los que la v2 reemplaza", () => {
  const datos = new Set(textosVisibles());
  const citas = citasVisibles(CONTENIDO);
  assert.ok(citas.length >= 55, `se leyeron solo ${citas.length} textos de la v1`);
  const reemplazados = REEMPLAZOS.map(([v]) => v);
  /* Las opciones de P4 y P5 vienen en una sola línea; los encabezados de tabla y «Siguiente: …» se comprueban aparte. */
  const faltan = citas.filter((c) => !datos.has(c) && !reemplazados.includes(c));
  assert.deepEqual(faltan, [], "estos textos de la v1 no están en los datos");
});

test("★★ los botones son los de la convención de AP1, AP2 y A6, y el resumen no lleva", () => {
  assert.deepEqual(A.BOTON, { empezar: "Empezar", seguir: "Seguir", confirmar: "Confirmar", probarOtra: "Probar otra" });
  assert.equal(pantalla("resumen").boton, null);
});

test("★★ los pies son los de la v1: el de colocando y, donde cambia, el de los errores y el acierto", () => {
  const pies = (id) => [pantalla(id).pie, pantalla(id).pieRespuesta];
  assert.deepEqual(pies("importados"), ["Basado en el libro, p. 208", "Basado en el libro, pp. 208, 214 y 228"]);
  assert.deepEqual(pies("fob-cif-cyf"), ["Libro, p. 228", "Basado en el libro, p. 228"]);
  assert.deepEqual(pies("flete-del-comprador"), ["Basado en el libro, pp. 210, 212 y 228", "Basado en el libro, pp. 228-229"]);
  assert.deepEqual(pies("flete-del-vendedor"), ["Basado en el libro, p. 229", "Basado en el libro, p. 229"]);
  assert.deepEqual(pies("lado-a-lado"), ["Basado en el libro, pp. 228-229", "Basado en el libro, pp. 228-229"]);
  for (const [id, marca, sig] of [["importados", "**P2 · errores", "**P3"], ["flete-del-comprador", "**P4 · errores", "**P5"], ["flete-del-vendedor", "**P5 · errores", "**P6"]]) {
    assert.ok(seccion(marca, sig).includes(`Pie: «${pantalla(id).pieRespuesta}»`), id);
  }
  assert.ok(seccion("**P3", "**P4").includes(`«Libro, p. 228» en colocando; «Basado en el libro, p. 228» en errores y acierto`));
});

/* ═══════════ 2 · TABLAS Y CIFRAS ═══════════ */

test("★★★ las fichas son las de la v1, con el monto del flete de la v2", () => {
  assert.ok(V2.includes("Las fichas dicen ahora «Monto: $650.000, valor del flete»."));
  for (const [id, marca, sig] of [["flete-del-comprador", "**P4", "**P4 · errores"], ["flete-del-vendedor", "**P5", "**P5 · errores"]]) {
    const v1 = tablaDespuesDe(seccion(marca, sig), "Ficha:").slice(1);
    const conV2 = v1.map(([d, t]) => [d, d === "Monto" ? t.replace("$650.000 por los fletes", "$650.000, valor del flete") : t]);
    assert.notDeepEqual(conV2, v1, `${id}: la v1 ya no trae «$650.000 por los fletes»`);
    assert.deepEqual(pantalla(id).ficha.map((f) => [f.dato, f.texto]), conV2, id);
  }
});

test("★★★ los asientos del 18 de marzo son los de la v1, con «Caja o Bancos»", () => {
  assert.ok(V2.includes("«Caja o Bancos»"));
  for (const [id, marca] of [["flete-del-comprador", "Asientos del 18 de marzo"], ["flete-del-vendedor", "Asientos (p. 229, con la regla 8 y C7-7)"]]) {
    const v1 = tablaDespuesDe(CONTENIDO, marca).slice(1).map((f) => f.map((c) => c.replace(/^\*(.*)\*$/, "$1").replace("Caja / Bancos", "Caja o Bancos")));
    const t = pantalla(id).acierto.tarjeta;
    const lado = (l, cual) => (l.lado === cual ? A.cifra(l.monto) : "");
    const [principal, flete] = t.asientos;
    const datos = [
      ...principal.lineas.map((l) => [l.cuenta, lado(l, A.DEBE), lado(l, A.HABER)]),
      ["Sumas", A.cifra(principal.sumas.debe), A.cifra(principal.sumas.haber)],
      ...flete.lineas.map((l) => [l.cuenta, lado(l, A.DEBE), lado(l, A.HABER)]),
    ];
    assert.deepEqual(datos, v1, id);
    assert.equal(flete.sumas, null, `${id}: el asiento del flete no lleva sumas`);
    assert.equal(t.fecha, "18 de marzo");
  }
});

test("★★★ las cifras se calculan, las sumas cuadran y el pago del flete es el de la v1", () => {
  assert.deepEqual(
    [A.CIFRAS.iva, A.CIFRAS.retencion, A.CIFRAS.total, A.CIFRAS.sumas, A.CIFRAS.retencionFlete, A.CIFRAS.pagoFlete],
    [1200000, 262500, 8437500, 8700000, 6500, 643500],
  );
  for (const id of ["flete-del-comprador", "flete-del-vendedor"]) {
    const [principal] = pantalla(id).acierto.tarjeta.asientos;
    assert.equal(principal.sumas.debe, principal.sumas.haber, `${id} no cuadra`);
    assert.equal(principal.sumas.debe, 8700000);
  }
  assert.ok(pantalla("flete-del-comprador").acierto.textos[1].includes(`$${A.cifra(A.CIFRAS.retencionFlete)}. Por eso le paga $${A.cifra(A.CIFRAS.pagoFlete)}.`));
});

test("★★★ la tabla lado a lado es la de la v1, con la fila de la v2 y los encabezados de Watari", () => {
  const v1 = tablaDespuesDe(seccion("**P6", "**P7"), "Tabla:");
  assert.ok(V2.includes("P6, la fila de la tabla pasa a «Quién asume el flete»."));
  assert.ok(WATARI.includes("Los encabezados quedan con el nombre de la empresa."));
  const esperado = {
    columnas: v1[0].slice(1).map((c) => c.replace(/^D-\d · /, "")),
    filas: v1.slice(1).map(([r, a, b]) => ({ rotulo: r === "Quién paga el flete" ? "Quién asume el flete" : r, celdas: [a, b] })),
  };
  const t = pantalla("lado-a-lado").tabla;
  assert.deepEqual(t.columnas, esperado.columnas);
  assert.deepEqual(t.columnas, ["Santa Martha", "La Popa"]);
  assert.deepEqual(t.filas.map(({ rotulo, celdas }) => ({ rotulo, celdas })), esperado.filas);
  assert.deepEqual(t.filas.filter((f) => f.focoConAcierto).map((f) => f.rotulo), ["Quién asume el flete"]);
});

/* ═══════════ 3 · PANTALLAS Y ESTADOS, MONTADOS ═══════════ */

/* Lo que hay en pantalla, en orden; las opciones se ordenan porque se barajan. */
function enPantalla(caja) {
  const out = [];
  const opciones = [];
  const marco = caja.querySelector("[data-pieza]");
  for (const el of marco.querySelectorAll("[data-texto], [data-opcion], [data-boton], [data-pie], [data-palabra]")) {
    if (el.matches("[data-opcion]")) { opciones.push(el.textContent); continue; }
    out.push(el.textContent);
  }
  return { textos: out, opciones: opciones.sort() };
}

test("★★★ cada pantalla y cada estado muestran exactamente sus textos, con su pie", async () => {
  const m = await montar(h(Importados, { rotulo: "R" }));
  const vistos = [];
  try {
    for (const p of P.pantallas) {
      assert.equal(m.caja.querySelector("[data-pieza]").dataset.pantalla, p.id);
      if (p.tipo !== "eleccion") {
        const esperado = [p.objetivo, ...(p.parrafos ?? []), p.siguiente, p.boton, p.pie].filter(Boolean);
        assert.deepEqual(enPantalla(m.caja).textos, esperado, p.id);
        vistos.push(p.id);
        if (p.boton) await tocar(m.caja.querySelector("[data-boton]"));
        continue;
      }
      const cab = [p.entrada, p.enunciado, ...p.parrafos, p.aviso, ...(p.lista ?? []), p.pregunta].filter(Boolean);
      const ops = p.opciones.map((o) => o.texto).sort();
      assert.deepEqual(enPantalla(m.caja), { textos: [...cab, A.BOTON.confirmar, p.pie], opciones: ops }, `${p.id} colocando`);
      vistos.push(`${p.id}:colocando`);
      for (const o of p.opciones.filter((x) => !x.correcta)) {
        await responder(m.caja, o.id);
        assert.deepEqual(enPantalla(m.caja), { textos: [...cab, A.INTERFAZ.incorrecto, o.devolucion, A.BOTON.probarOtra, p.pieRespuesta], opciones: ops }, `${p.id} error ${o.id}`);
        vistos.push(`${p.id}:error:${o.id}`);
        await tocar(boton(m.caja, "probar-otra"));
      }
      await responder(m.caja, correcta(p));
      assert.deepEqual(enPantalla(m.caja), { textos: [...cab, A.INTERFAZ.correcto, ...p.acierto.textos, A.BOTON.seguir, p.pieRespuesta], opciones: ops }, `${p.id} acierto`);
      vistos.push(`${p.id}:acierto`);
      await tocar(boton(m.caja, "seguir"));
    }
    /* Portada, P1 y resumen + 5 preguntas de 4 estados: los 23 de Watari. */
    assert.equal(vistos.length, 3 + 5 * 4);
  } finally {
    m.desmontar();
  }
});

test("★★ el error lleva a «Probar otra» y el acierto a «Seguir»; las opciones se barajan en cada intento", async () => {
  const p = pantalla("lado-a-lado");
  const m = await montar(h(Importados, { pieza: conPieza("lado-a-lado"), rotulo: "R" }));
  try {
    const orden = () => [...m.caja.querySelectorAll("[data-opcion]")].map((b) => b.dataset.opcion);
    assert.equal(boton(m.caja, "confirmar").getAttribute("aria-disabled"), "true");
    let antes = orden();
    for (let i = 0; i < 15; i++) {
      await responder(m.caja, "valor");
      assert.equal(estado(m.caja), "error");
      assert.equal(boton(m.caja, "seguir") === null, true);
      await tocar(boton(m.caja, "probar-otra"));
      assert.notDeepEqual(orden(), antes);
      antes = orden();
    }
    await responder(m.caja, correcta(p));
    assert.equal(estado(m.caja), "acierto");
    assert.equal(boton(m.caja, "probar-otra") === null, true);
    assert.ok(boton(m.caja, "seguir"));
  } finally {
    m.desmontar();
  }
});

test("★★★ la tarjeta de asientos llega con el acierto de P4 y P5, bajo el mensaje y antes de «Seguir»; nunca antes ni en los errores", async () => {
  for (const id of ["flete-del-comprador", "flete-del-vendedor"]) {
    const p = pantalla(id);
    const m = await montar(h(Importados, { pieza: conPieza(id), rotulo: "R" }));
    try {
      assert.equal(m.caja.querySelector("[data-tarjeta]") === null, true, `${id}: la tarjeta se ve al colocar`);
      for (const o of p.opciones.filter((x) => !x.correcta)) {
        await responder(m.caja, o.id);
        assert.equal(m.caja.querySelector("[data-tarjeta]") === null, true, `${id}: la tarjeta se ve en el error ${o.id}`);
        await tocar(boton(m.caja, "probar-otra"));
      }
      await responder(m.caja, correcta(p));
      const t = m.caja.querySelector("[data-tarjeta]");
      assert.ok(t, `${id}: no llega la tarjeta`);
      /* Orden: mensaje, tarjeta, «Seguir». */
      const msg = m.caja.querySelector("[data-mensaje=acierto]");
      const seguir = boton(m.caja, "seguir");
      assert.equal(msg.compareDocumentPosition(t) & w.Node.DOCUMENT_POSITION_FOLLOWING, w.Node.DOCUMENT_POSITION_FOLLOWING);
      assert.equal(t.compareDocumentPosition(seguir) & w.Node.DOCUMENT_POSITION_FOLLOWING, w.Node.DOCUMENT_POSITION_FOLLOWING);
      /* Lo que se ve, fila por fila: la cuenta y sus dos columnas. */
      const [principal, flete] = p.acierto.tarjeta.asientos;
      const filaVista = (l) => `${l.cuenta}${l.lado === A.DEBE ? A.cifra(l.monto) : ""}${l.lado === A.DEBE ? "" : A.cifra(l.monto)}`;
      assert.deepEqual(
        [...t.querySelectorAll("[role=row]")].map((r) => r.textContent),
        [
          "18 de marzoDebeHaber",
          ...principal.lineas.map(filaVista),
          "Sumas8.700.0008.700.000",
          ...flete.lineas.map(filaVista),
        ],
      );
      assert.equal(t.querySelectorAll("[data-sumas]").length, 1, "sumas solo en el primer asiento");
      assert.equal(t.querySelectorAll("[data-raya]").length, 1, "falta la raya entre los dos asientos");
      /* Las del haber, con sangría; las del debe, sin ella. */
      for (const r of t.querySelectorAll("[data-linea]")) {
        assert.equal(r.querySelector("[role=rowheader]").classList.contains("t7a5-sangria"), r.dataset.lado === A.HABER, r.dataset.linea);
      }
      assert.deepEqual([...t.querySelectorAll("[role=columnheader]")].map((c) => c.className), ["", "t7a5-d", "t7a5-h"]);
      assert.equal(t.getAttribute("aria-label"), "Asientos del 18 de marzo");
      assert.equal(t.dataset.revision, "pendiente");
      assert.ok(t.classList.contains("t7a5-nueva"), "la tarjeta llega sin fundido");
    } finally {
      m.desmontar();
    }
  }
  assert.match(CSS_A5, /\.t7a5-nueva \{ animation: t7a5-aparece \.12s ease-out; \}/);
  assert.match(CSS_A5, /\.t7a5-sangria \{ padding-left: 24px; \}/);
  assert.match(CSS_A5, /prefers-reduced-motion: reduce\) \{ \.t7a5 \*, [^}]*animation: none !important; \}/);
});

test("★★★ P6: lado a lado arriba, sin señal mientras elige ni en el error; con el acierto, solo «Quién asume el flete»", async () => {
  const p = pantalla("lado-a-lado");
  const m = await montar(h(Importados, { pieza: conPieza("lado-a-lado"), rotulo: "R" }));
  const foco = () => [...m.caja.querySelectorAll("[data-fila-lal][data-foco=si]")].map((f) => f.dataset.filaLal);
  const enNegrita = () => [...m.caja.querySelectorAll(".t7a5-foco")].map((x) => x.textContent);
  try {
    const t = m.caja.querySelector("[data-lado-a-lado]");
    assert.equal(t.compareDocumentPosition(m.caja.querySelector("[data-pregunta]")) & w.Node.DOCUMENT_POSITION_FOLLOWING, w.Node.DOCUMENT_POSITION_FOLLOWING, "la tabla no va arriba de la pregunta");
    assert.equal(t.getAttribute("aria-label"), "Santa Martha y La Popa, lado a lado");
    assert.equal(t.dataset.revision, "pendiente");
    assert.deepEqual([...t.querySelectorAll("[role=columnheader]")].map((c) => c.textContent), ["Dato", "Santa Martha", "La Popa"]);
    assert.deepEqual(
      [...t.querySelectorAll("[data-fila-lal]")].map((f) => f.textContent),
      p.tabla.filas.map((f) => `${f.rotulo}${f.celdas.join("")}`),
    );
    /* Sin color de lado: aquí no se comparan lados. */
    assert.equal(t.querySelector(".t7a5-d, .t7a5-h") === null, true);
    assert.deepEqual(foco(), []);
    for (const o of p.opciones.filter((x) => !x.correcta)) {
      await responder(m.caja, o.id);
      assert.deepEqual(foco(), [], `señalada en el error ${o.id}`);
      assert.deepEqual(enNegrita(), []);
      await tocar(boton(m.caja, "probar-otra"));
    }
    await responder(m.caja, correcta(p));
    assert.deepEqual(foco(), ["Quién asume el flete"]);
    assert.deepEqual(enNegrita(), ["Quién asume el flete", "El comprador", "El vendedor"]);
  } finally {
    m.desmontar();
  }
  assert.match(CSS_A5, /\.t7a5-foco \{ color: #F8F9FA; font-weight: 600; \}/);
});

test("★★ P2 lleva la lista con viñeta; el aviso de las tarifas y el «Siguiente» van en texto secundario", async () => {
  const m = await montar(h(Importados, { pieza: conPieza("importados", "flete-del-comprador", "resumen"), rotulo: "R" }));
  try {
    const ul = m.caja.querySelector("ul[data-lista]");
    assert.ok(ul, "la lista no es una lista");
    assert.deepEqual([...ul.querySelectorAll("li")].map((li) => li.textContent), pantalla("importados").lista);
    await responder(m.caja, "aranceles");
    await tocar(boton(m.caja, "seguir"));
    assert.ok(m.caja.querySelector("[data-aviso]").classList.contains("t7a5-nota"));
    assert.equal(m.caja.querySelector("[data-aviso]").textContent, "Las tarifas de este ejercicio son datos del libro. No las tomes como las tarifas de hoy.");
    await responder(m.caja, "compras-fletes");
    await tocar(boton(m.caja, "seguir"));
    assert.ok(m.caja.querySelector("[data-siguiente]").classList.contains("t7a5-nota"));
    assert.equal(m.caja.querySelector("[data-boton]") === null, true, "el resumen no lleva botón");
  } finally {
    m.desmontar();
  }
  assert.match(CSS_A5, /\.t7a5-nota \{ margin: 0; font-size: 14px; line-height: 1\.45; color: #A8B6C8;/);
});

/* ═══════════ 4 · LO QUE NO DEBE APARECER ═══════════ */

test("★★ sin la renta del 33 %, sin cifras de medición, sin «D-1», «Caja / Bancos» ni nada interno", () => {
  const todo = JSON.stringify(P) + CSS_A5;
  assert.doesNotMatch(todo, /33 ?%|renta/i);
  for (const medida of ["558,3", "617,1", "242,2", "47,9", "19,9", "140,5"]) assert.ok(!todo.includes(medida), medida);
  assert.ok(!todo.includes("Caja / Bancos"));
  assert.doesNotMatch(todo, /D-[12]/);
  const texto = textosVisibles().join("\n");
  for (const interno of ["≈", "glosa", "regla 8", "Near", "Mello", "Watari", "(p. ", "nacionalización", "TRM", "comparan", "comparadora"]) assert.ok(!texto.includes(interno), interno);
});

test("★★★ fuera del catálogo de FP; id t7-; va en T7-1 después de AP1 y antes de A6", () => {
  assert.equal(A.A5_ID, "t7-1-a5-importados-y-fletes");
  assert.equal(P.numero, 5);
  const tema = SUBJECTS.contabilidad.topics.find((t) => t.id === TEMA_T7_1);
  const a = tema.actividades.find((x) => x.id === A.A5_ID);
  assert.deepEqual(a.clasificacion, { tipo: APRENDER });
  assert.equal(a.nombre, P.titulo);
  const ids = tema.actividades.map((x) => x.id);
  assert.ok(ids.indexOf(A.A5_ID) > ids.indexOf("t7-1-a1-la-cuenta-que-no-se-mueve"));
  assert.equal(ids.indexOf(A.A5_ID) + 1, ids.indexOf("t7-1-a6-devoluciones-en-periodico"));
  const piezas = PIEZAS_T7_1.map((x) => x.pieza.id);
  assert.equal(piezas.indexOf(A.A5_ID) + 1, piezas.indexOf("t7-1-a6-devoluciones-en-periodico"));
  const dir = new URL("supabase/migrations/", RAIZ);
  assert.deepEqual(readdirSync(dir).filter((f) => readFileSync(new URL(f, dir), "utf8").includes(A.A5_ID)), []);
  for (const f of ["src/components/mecanicas/libros/t7/ImportadosYFletes.jsx", "src/data/contabilidadT7_1_a5.js"]) {
    assert.doesNotMatch(readFileSync(new URL(f, RAIZ), "utf8"), /from\s+["'][^"']*\/(fp|lib\/supabase)[^"']*["']|registrarActividad(Completada)?\s*\(|\.rpc\s*\(/, f);
  }
});
