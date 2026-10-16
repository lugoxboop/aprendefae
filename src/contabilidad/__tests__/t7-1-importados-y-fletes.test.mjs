import { test } from "node:test";
import assert from "node:assert/strict";
import { readFileSync, readdirSync } from "node:fs";
import { JSDOM, VirtualConsole } from "jsdom";
import { conCorreccionesDeMello } from "./correccionesMello.mjs";

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
 *   · P3 `fob-cif-cyf` → «El viaje de la compra», rehecha por C1 (Near,
 *     barrido-c1-fob-cif-cyf.md, sección 1, con F-1, F-2 y F-3 de Mello por
 *     correccionesMelloC1.mjs): sus textos, letra por letra contra el paquete
 *     corregido, en los dos sentidos; la escalera de cada paso; la figura que
 *     crece (marcas y leyenda) y se queda; el foco; B1 y B2
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
const { textosDelError, anunciarRespuesta, sinAsiEs } = await import("../../components/mecanicas/libros/t7/escaleraAyuda.js");
const { comprobarFOB, confirmarCyF, marcaDe } = await import("../../components/mecanicas/libros/t7/ImportadosYFletes.jsx");
const C1 = await import("./correccionesMelloC1.mjs");

const RAIZ = new URL("../../../", import.meta.url);
const leer = (f) => readFileSync(new URL(`orquestador/conocimiento/paquetes/${f}`, RAIZ), "utf8");
const V1 = leer("t7-1-a5-v1.md");
const V2 = leer("t7-1-a5-v2-cambios.md");
const WATARI = leer("t7-1-a5-figura-watari.md");
/* Lote 2 de la revisión de calidad (Near): las pistas del primer error y el anexo de la tercera opción. */
const LOTE2_PISTAS = conCorreccionesDeMello(leer("lote2-pistas-v1.md"));
const LOTE2_ANEXO = conCorreccionesDeMello(leer("lote2-anexo-v1.md"));
const CONTENIDO_V1 = V1.slice(V1.indexOf("## Contenido"), V1.indexOf("## Erratas que toca"));
/* P3 de la v1 salió entera con C1 (barrido-c1-fob-cif-cyf.md): la pantalla nueva se compara aparte, contra el paquete corregido. */
const P3_V1 = CONTENIDO_V1.slice(CONTENIDO_V1.indexOf("**P3 · colocando"), CONTENIDO_V1.indexOf("**P4 · colocando"));
const CONTENIDO = CONTENIDO_V1.replace(P3_V1, "");
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
  for (const p of P.pantallas.filter((x) => x.tipo !== "viaje")) {
    for (const k of ["objetivo", "entrada", "enunciado", "aviso", "pregunta", "siguiente", "boton", "pie", "pieRespuesta"]) if (p[k]) t.push(p[k]);
    t.push(...(p.parrafos ?? []), ...(p.lista ?? []));
    if (p.pista) t.push(p.pista);
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

test("★★★ cada texto de los datos está, letra por letra, en la v1 o en la v2 de Near (o, si es del lote 2, en su paquete)", () => {
  const faltan = textosVisibles().filter((t) => !V1.includes(t) && !V2.includes(t) && !LOTE2_PISTAS.includes(t) && !LOTE2_ANEXO.includes(t));
  /* Los botones no los trae la v1 (convención de AP1, AP2 y A6): se comprueban aparte. */
  assert.deepEqual(faltan.filter((t) => !Object.values(A.BOTON).includes(t)), [], "estos textos no están en la v1 ni en la v2");
});

test("★★★ lote 2 · pistas: cada pregunta lleva la suya, letra por letra la de Near para su pantalla", () => {
  const desde = LOTE2_PISTAS.indexOf(`### ${A.A5_ID} `);
  assert.ok(desde >= 0, "la pieza no está en el lote 2");
  const deNear = Object.fromEntries(LOTE2_PISTAS.slice(desde, LOTE2_PISTAS.indexOf("\n### ", desde)).split("\n").filter((l) => /^\| P\d/.test(l)).map((l) => {
    const c = l.slice(1, -1).split("|").map((x) => x.trim());
    return [c[0].match(/`([^`]+)`/)[1], c[2].match(/^«(.+)»$/)[1]];
  }));
  /* La pregunta de P3 (`fob-cif-cyf`) ya no existe: C1 la rehízo en dos pasos con sus propias pistas (se comprueban abajo). */
  assert.ok(deNear["fob-cif-cyf"], "el lote 2 ya no trae la pista de P3");
  delete deNear["fob-cif-cyf"];
  assert.equal(pantalla("fob-cif-cyf").pista, undefined);
  assert.deepEqual(Object.fromEntries(P.pantallas.filter((p) => p.tipo === "eleccion").map((p) => [p.id, p.pista])), deNear);
  /* Esta pieza no tiene preguntas de dos opciones: el anexo no la toca. */
  assert.ok(!LOTE2_ANEXO.includes(`| ${A.A5_ID} |`));
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
  /* P3, rehecha por C1: un solo pie, el de Near y Mello, en todos los estados. */
  assert.deepEqual(pies("fob-cif-cyf"), [C1.PIE_FOB, undefined]);
  assert.deepEqual(pies("flete-del-comprador"), ["Basado en el libro, pp. 210, 212 y 228", "Basado en el libro, pp. 228-229"]);
  assert.deepEqual(pies("flete-del-vendedor"), ["Basado en el libro, p. 229", "Basado en el libro, p. 229"]);
  assert.deepEqual(pies("lado-a-lado"), ["Basado en el libro, pp. 228-229", "Basado en el libro, pp. 228-229"]);
  for (const [id, marca, sig] of [["importados", "**P2 · errores", "**P3"], ["flete-del-comprador", "**P4 · errores", "**P5"], ["flete-del-vendedor", "**P5 · errores", "**P6"]]) {
    assert.ok(seccion(marca, sig).includes(`Pie: «${pantalla(id).pieRespuesta}»`), id);
  }
  assert.ok(P3_V1.includes(`«Libro, p. 228» en colocando; «Basado en el libro, p. 228» en errores y acierto`));
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
      if (p.tipo === "viaje") {
        /* P3 (C1) se recorre estado por estado más abajo; aquí, el camino del acierto, para seguir. */
        for (const id of ["flete", "seguro", "bodega"]) await tocar(m.caja.querySelector(`[data-ficha="${id}"]`));
        await tocar(boton(m.caja, "comprobar"));
        await tocar(boton(m.caja, "seguir-paso"));
        await responder(m.caja, "comprador");
        vistos.push(p.id);
        await tocar(boton(m.caja, "seguir"));
        continue;
      }
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
      /* La escalera de ayuda (lote 2): el 1.er error da la pista; el 2.º y siguientes, la respuesta («La respuesta es «…».»).
       * Se recorren todas las incorrectas y luego se falla otra vez la primera, para ver los dos peldaños. */
      assert.ok(p.pista, `${p.id} sin pista del lote 2`);
      const malas = p.opciones.filter((x) => !x.correcta);
      let fallos = 0;
      for (const o of [...malas, malas[0]]) {
        await responder(m.caja, o.id);
        fallos++;
        const esperados = textosDelError(p, o, fallos);
        if (fallos === 1) assert.deepEqual(esperados, [p.pista], `${p.id} 1.er error`);
        else assert.equal(esperados[0], `La respuesta es «${p.opciones.find((x) => x.correcta).texto.replace(/\.$/, "")}».`, `${p.id} 2.º error`);
        assert.deepEqual(enPantalla(m.caja), { textos: [...cab, A.INTERFAZ.incorrecto, ...esperados, A.BOTON.probarOtra, p.pieRespuesta], opciones: ops }, `${p.id} error ${fallos} ${o.id}`);
        vistos.push(`${p.id}:error${fallos}:${o.id}`);
        await tocar(boton(m.caja, "probar-otra"));
      }
      await responder(m.caja, correcta(p));
      assert.deepEqual(enPantalla(m.caja), { textos: [...cab, A.INTERFAZ.correcto, ...p.acierto.textos, A.BOTON.seguir, p.pieRespuesta], opciones: ops }, `${p.id} acierto`);
      vistos.push(`${p.id}:acierto`);
      await tocar(boton(m.caja, "seguir"));
    }
    /* Portada, P1 y resumen + 4 preguntas de 4 estados, y en cada pregunta el 2.º peldaño de la escalera; y P3 (C1). */
    assert.equal(vistos.length, 3 + 4 * 5 + 1);
  } finally {
    m.desmontar();
  }
});

/*
 * POR ARREGLAR EN EL COMPONENTE (no en la prueba): la escalera pone, tras «La respuesta es «…».», el acierto sin
 * «Así es.» (escaleraAyuda.js, textosDelError, lee `pantalla.acierto.texto`). En esta pieza el acierto es
 * `acierto.textos` (una lista), así que el 2.º error sale sin su porqué. Queda como «todo» hasta que se decida.
 */
test("★★ lote 2 · el 2.º error trae la respuesta y su porqué (el acierto sin «Así es.»)", () => {
  for (const p of P.pantallas.filter((x) => x.tipo === "eleccion")) {
    const o = p.opciones.find((x) => !x.correcta);
    const r = textosDelError(p, o, 2);
    assert.equal(r[0], anunciarRespuesta(p.opciones.find((x) => x.correcta).texto), p.id);
    /* Después del anuncio, el porqué: textos del acierto, sin «Así es.». */
    assert.ok(r.length > 1, `${p.id}: el 2.º error sale sin su porqué`);
    assert.ok(r.slice(1).every((t) => p.acierto.textos.map(sinAsiEs).includes(t)), p.id);
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

test("★★★ fuera del catálogo de FP; id t7-; va en T7-1 después de AP2 y antes de A6 (orden de L: a1, a2, a5, a6)", () => {
  assert.equal(A.A5_ID, "t7-1-a5-importados-y-fletes");
  assert.equal(P.numero, 5);
  const tema = SUBJECTS.contabilidad.topics.find((t) => t.id === TEMA_T7_1);
  const a = tema.actividades.find((x) => x.id === A.A5_ID);
  assert.deepEqual(a.clasificacion, { tipo: APRENDER });
  assert.equal(a.nombre, P.titulo);
  const ids = tema.actividades.map((x) => x.id);
  assert.ok(ids.indexOf(A.A5_ID) > ids.indexOf("t7-1-a1-la-cuenta-que-no-se-mueve"));
  /* Entre A5 y A6 solo cabe Hacer (H5), no otra pieza de Aprender. */
  const aprender = tema.actividades.filter((x) => x.clasificacion.tipo === APRENDER).map((x) => x.id);
  assert.equal(aprender.indexOf(A.A5_ID) + 1, aprender.indexOf("t7-1-a6-devoluciones-en-periodico"));
  assert.ok(ids.indexOf(A.A5_ID) < ids.indexOf("t7-1-a6-devoluciones-en-periodico"));
  const piezas = PIEZAS_T7_1.map((x) => x.pieza.id);
  assert.equal(piezas.indexOf(A.A5_ID) + 1, piezas.indexOf("t7-1-a6-devoluciones-en-periodico"));
  /* El orden por dependencias (regla 9): A5 trae el IVA y la retención que enseña AP2. */
  const orden = ["t7-1-a1-la-cuenta-que-no-se-mueve", "t7-1-a2-la-factura-completa", A.A5_ID, "t7-1-a6-devoluciones-en-periodico"];
  assert.deepEqual(ids.filter((id) => orden.includes(id)), orden);
  assert.deepEqual(piezas.filter((id) => orden.includes(id)), orden);
  const dir = new URL("supabase/migrations/", RAIZ);
  assert.deepEqual(readdirSync(dir).filter((f) => readFileSync(new URL(f, dir), "utf8").includes(A.A5_ID)), []);
  for (const f of ["src/components/mecanicas/libros/t7/ImportadosYFletes.jsx", "src/data/contabilidadT7_1_a5.js"]) {
    assert.doesNotMatch(readFileSync(new URL(f, RAIZ), "utf8"), /from\s+["'][^"']*\/(fp|lib\/supabase)[^"']*["']|registrarActividad(Completada)?\s*\(|\.rpc\s*\(/, f);
  }
});

/* ═══════════ 5 · P3 «EL VIAJE DE LA COMPRA» (C1: Near, con F-1, F-2 y F-3 de Mello) ═══════════ */

const V = pantalla("fob-cif-cyf");
const [FOB, CYF] = V.pasos;
const FICHAS = V.tramos.flatMap((t) => t.fichas);
const contar = (t) => String(t).split(/\s+/).filter((x) => /[\p{L}\p{N}]/u.test(x)).length;
/* Todos los textos de un objeto, en profundidad (sin ids ni claves de estado). */
const NO_TEXTO = new Set(["id", "tipo", "fob", "cyf", "tierra", "correcta"]);
const cadenas = (v, k = null, out = []) => {
  if (k && NO_TEXTO.has(k)) return out;
  if (typeof v === "string") out.push(v);
  else if (Array.isArray(v)) v.forEach((x) => cadenas(x, null, out));
  else if (v && typeof v === "object") for (const [kk, x] of Object.entries(v)) cadenas(x, kk, out);
  return out;
};

test("★★★ C1 · P3: cada texto es, letra por letra, el del paquete de Near con F-1 y F-2 de Mello; y al revés, ninguno sobra", () => {
  assert.equal(V.tipo, "viaje");
  assert.equal(V.nombre, C1.NOMBRE_FOB);
  assert.equal(V.pie, C1.PIE_FOB);
  /* F-1: cuatro tramos y, sobre «En el mar», «Flete» y «Seguro». */
  assert.deepEqual(V.tramos.map((t) => t.rotulo), C1.TRAMOS);
  const mar = V.tramos.find((t) => !t.tierra);
  assert.equal(mar.rotulo, C1.TRAMOS[2]);
  assert.deepEqual(mar.fichas.map((f) => f.texto), C1.FICHAS_MAR);
  for (const t of V.tramos.filter((x) => x.tierra)) assert.deepEqual(t.fichas.map((f) => f.texto), [t.rotulo], `${t.id}: en tierra, el tramo es su ficha`);
  assert.equal(FICHAS.length, 5, "se tocan cinco fichas");
  assert.deepEqual(Object.values(V.leyenda), C1.LEYENDA);
  /* Paso 1 · FOB, la tabla de Near; las del comprador, con F-1. */
  assert.equal(FOB.texto, C1.PASO1.texto);
  assert.deepEqual(FICHAS.filter((f) => f.fob === "comprador").map((f) => f.texto), C1.PASO1.correctos);
  assert.equal(FOB.pista, C1.PASO1.pista);
  assert.deepEqual(Object.keys(FOB.retro).map((id) => FICHAS.find((f) => f.id === id).texto), C1.PASO1.retroDe);
  for (const t of Object.values(FOB.retro)) assert.equal(t, C1.PASO1.retro);
  assert.equal(FOB.respuesta, C1.PASO1.respuesta);
  assert.equal(FOB.acierto, C1.PASO1.acierto);
  assert.equal(FOB.boton, "Comprobar");
  /* Paso 2 · C&F, la tabla de Mello (F-2). */
  assert.equal(CYF.texto, C1.PASO2.texto);
  assert.deepEqual(CYF.opciones.map((o) => o.texto), C1.PASO2.opciones);
  assert.deepEqual(CYF.opciones.filter((o) => o.correcta).map((o) => o.texto), [C1.PASO2.correcta]);
  assert.deepEqual(CYF.opciones.filter((o) => o.devolucion).map((o) => [o.texto, o.devolucion]), [[C1.PASO2.retroDe, C1.PASO2.retro]]);
  assert.equal(CYF.pista, C1.PASO2.pista);
  assert.equal(CYF.respuesta, C1.PASO2.respuesta);
  assert.equal(CYF.acierto, C1.PASO2.acierto);
  /* La figura del acierto de C&F (F-2): Flete pasa al vendedor; Seguro se queda en el comprador. */
  assert.deepEqual(Object.fromEntries(mar.fichas.map((f) => [f.texto, V.leyenda[f.cyf]])), C1.CYF);
  /* Al revés: nada en la pantalla que no venga del paquete corregido (o de la interfaz: «Comprobar»). */
  const esperados = new Set([C1.NOMBRE_FOB, C1.PIE_FOB, ...C1.TRAMOS, ...C1.FICHAS_MAR, ...C1.LEYENDA, ...Object.values(C1.PASO1).flat(), ...Object.values(C1.PASO2).flat(), "Comprobar"]);
  assert.deepEqual(cadenas(V).filter((t) => !esperados.has(t)), []);
  /* Y nada del paso 2 de Near, que F-2 cambió entero (salvo lo que Mello repite). */
  const deMello = new Set(Object.values(C1.PASO2).flat());
  assert.deepEqual(cadenas(V).filter((t) => C1.PASO2_NEAR.includes(t) && !deMello.has(t)), []);
});

test("★★★ C1 · P3: los textos de la v1 que daban la respuesta ya no están (las cuatro definiciones, la pregunta, sus opciones y errores)", () => {
  /* El pie de la respuesta se queda (Near y Mello: «sin cambio»). */
  const viejos = citasVisibles(P3_V1).filter((t) => t !== C1.PIE_FOB);
  assert.ok(viejos.length >= 10, `solo ${viejos.length}`);
  const ahora = new Set([...textosVisibles(), ...cadenas(V)]);
  assert.deepEqual(viejos.filter((t) => ahora.has(t)), []);
  /* C1: lo que se responde no está escrito antes en la pantalla: el texto del paso 1 no nombra las fichas del comprador, ni el del paso 2 al comprador. */
  for (const f of ["Flete", "Seguro", "Transporte a la bodega"]) assert.ok(!FOB.texto.toLowerCase().includes(f.toLowerCase()), f);
  assert.ok(!CYF.texto.includes("comprador"));
  /* Las pistas y retros orientan sin dar la respuesta. */
  for (const t of [FOB.pista, FOB.retro.puerto]) for (const f of ["Flete", "Seguro", "bodega"]) assert.ok(!t.includes(f), `${t} ↔ ${f}`);
  for (const t of [CYF.pista, CYF.opciones.find((o) => o.devolucion).devolucion]) assert.ok(!t.includes("comprador"), t);
});

/* Todas las selecciones posibles de las cinco fichas. */
const SUBCONJUNTOS = Array.from({ length: 31 }, (_, n) => FICHAS.filter((_, i) => n + 1 & (1 << i)).map((f) => f.id));

test("★★★ C1 · P3, paso 1: «Comprobar» con cada selección posible (31) y la escalera: retro, pista, respuesta", () => {
  const delComprador = ["flete", "seguro", "bodega"];
  for (const m of SUBCONJUNTOS) {
    const exacta = m.length === 3 && delComprador.every((x) => m.includes(x));
    const antes = m.filter((x) => !delComprador.includes(x));
    const r1 = comprobarFOB(V, m, 0);
    const r2 = comprobarFOB(V, m, 1);
    if (exacta) {
      assert.deepEqual([r1.peldano, r1.resuelto, r1.texto], ["acierto", true, FOB.acierto], m.join());
      assert.equal(r2.peldano, "acierto", m.join());
      continue;
    }
    /* 1.er error: si tocó una de antes de «a bordo», su retro; si solo le faltó alguna, la pista. Se puede volver a intentar. */
    assert.equal(r1.resuelto, false, m.join());
    if (antes.length) assert.deepEqual([r1.peldano, r1.texto, r1.malas], ["retro", C1.PASO1.retro, antes], m.join());
    else assert.deepEqual([r1.peldano, r1.texto, r1.malas], ["pista", FOB.pista, []], m.join());
    /* 2.º error: la respuesta, y el paso queda resuelto. */
    assert.deepEqual([r2.peldano, r2.resuelto, r2.texto], ["respuesta", true, FOB.respuesta], m.join());
  }
});

test("★★★ C1 · P3, paso 2: cada opción en el 1.er y el 2.º intento", () => {
  assert.deepEqual(confirmarCyF(V, "comprador", 0), { resuelto: true, peldano: "acierto", texto: CYF.acierto });
  assert.deepEqual(confirmarCyF(V, "comprador", 1), { resuelto: true, peldano: "acierto", texto: CYF.acierto });
  assert.deepEqual(confirmarCyF(V, "medias", 0), { resuelto: false, peldano: "retro", texto: C1.PASO2.retro });
  assert.deepEqual(confirmarCyF(V, "vendedor", 0), { resuelto: false, peldano: "pista", texto: CYF.pista });
  for (const id of ["medias", "vendedor"]) assert.deepEqual(confirmarCyF(V, id, 1), { resuelto: true, peldano: "respuesta", texto: CYF.respuesta });
});

test("★★★ C1 · P3, F-3: en el paso 2 la tierra va sin marca; «En el mar» lleva la de FOB y, al resolver, la de C&F", () => {
  const s = (paso, r1, r2) => ({ paso, p1: { resuelto: r1 }, p2: { resuelto: r2 } });
  for (const t of V.tramos) {
    for (const f of t.fichas) {
      assert.equal(marcaDe(V, t, f, s(0, false, false)), null, `${f.id}: sin marca antes de resolver`);
      assert.equal(marcaDe(V, t, f, s(0, true, false)), f.fob, `${f.id}: FOB resuelto`);
      assert.equal(marcaDe(V, t, f, s(1, true, false)), t.tierra ? null : f.fob, `${f.id}: paso 2`);
      assert.equal(marcaDe(V, t, f, s(1, true, true)), t.tierra ? null : f.cyf, `${f.id}: C&F resuelto`);
    }
  }
});

/* Lo que se ve de P3: textos, fichas, marcas, leyenda y opciones. */
function vistaViaje(caja) {
  const r = caja.querySelector("[data-viaje]");
  const fig = r.querySelector("[data-figura]");
  return {
    estado: r.dataset.estado,
    paso: r.dataset.paso,
    consigna: r.querySelector("[data-consigna]").textContent,
    tramos: [...fig.querySelectorAll("[data-tramo]")].map((t) => [t.dataset.tramo, t.dataset.atenuado === "si"]),
    rotulos: [...fig.querySelectorAll("[data-rotulo]")].map((x) => x.textContent),
    fichas: [...fig.querySelectorAll("[data-ficha]")].map((f) => ({
      id: f.dataset.ficha, boton: f.tagName === "BUTTON", pulsada: f.getAttribute("aria-pressed"), mal: f.classList.contains("t7a5-mal"),
      paga: f.querySelector("[data-paga]")?.dataset.paga ?? null, texto: f.querySelector("span:not(.t7a5-sr):not([aria-hidden])")?.textContent ?? f.textContent,
    })),
    leyenda: fig.querySelector("[data-leyenda]")?.textContent ?? null,
    opciones: [...r.querySelectorAll("[data-opcion]")].map((o) => o.textContent).sort(),
    mensaje: r.querySelector("[data-mensaje]") ? [r.querySelector("[data-mensaje]").dataset.mensaje, ...[...r.querySelectorAll("[data-mensaje] [data-palabra], [data-mensaje] [data-texto]")].map((p) => p.textContent)] : null,
    botones: [...r.querySelectorAll("[data-boton]")].map((b) => [b.dataset.boton, b.textContent, b.getAttribute("aria-disabled") === "true"]),
    pie: r.querySelector("[data-pie]").textContent,
  };
}

test("★★★ C1 · P3 montada: el recorrido estado por estado (pista, retro, 2.º error con la figura que crece, paso 2 con la tierra atenuada, acierto) y el foco", async () => {
  const m = await montar(h(Importados, { pieza: conPieza("fob-cif-cyf", "flete-del-comprador"), rotulo: "R" }));
  const v = () => vistaViaje(m.caja);
  const ficha = (id) => m.caja.querySelector(`[data-ficha="${id}"]`);
  const activo = () => w.document.activeElement;
  const sinMarcas = (x) => x.fichas.every((f) => f.paga === null);
  try {
    /* Al llegar: el texto de FOB, la línea con sus cuatro tramos y cinco fichas que se tocan; «Comprobar» inactivo, sin leyenda ni mensaje. */
    let x = v();
    assert.deepEqual([x.estado, x.paso, x.consigna], ["colocando", "fob", FOB.texto]);
    assert.deepEqual(x.tramos, V.tramos.map((t) => [t.id, false]));
    assert.deepEqual(x.rotulos, [C1.TRAMOS[2]]);
    assert.deepEqual(x.fichas.map((f) => [f.id, f.boton, f.pulsada]), FICHAS.map((f) => [f.id, true, "false"]));
    assert.ok(sinMarcas(x));
    assert.deepEqual([x.leyenda, x.mensaje, x.opciones], [null, null, []]);
    assert.deepEqual(x.botones, [["comprobar", "Comprobar", true]]);
    assert.equal(x.pie, C1.PIE_FOB);
    /* 1.er error, le faltó alguna: la pista, y se puede volver a intentar (las marcas se quedan). */
    await tocar(ficha("flete"));
    assert.equal(v().fichas.find((f) => f.id === "flete").pulsada, "true");
    await tocar(boton(m.caja, "comprobar"));
    x = v();
    assert.deepEqual(x.mensaje, ["error", A.INTERFAZ.incorrecto, FOB.pista]);
    assert.ok(activo() === m.caja.querySelector("[data-mensaje]"), "al responder, el foco va al mensaje");
    assert.ok(sinMarcas(x) && x.leyenda === null, "el 1.er error no da la respuesta");
    assert.deepEqual(x.fichas.filter((f) => f.mal), []);
    assert.deepEqual(x.botones, [["comprobar", "Comprobar", false]]);
    /* Segundo intento, todavía mal (le sigue faltando y toca una de antes de «a bordo»). */
    await tocar(ficha("subir"));
    await tocar(boton(m.caja, "comprobar"));
    x = v();
    /* 2.º error: la respuesta; cada ficha queda marcada con quién la paga (FOB) y aparece la leyenda. */
    assert.deepEqual(x.mensaje, ["error", A.INTERFAZ.incorrecto, FOB.respuesta]);
    assert.deepEqual([x.estado, x.leyenda], ["respuesta", C1.LEYENDA.join("")]);
    assert.deepEqual(x.fichas.map((f) => [f.id, f.boton, f.paga]), FICHAS.map((f) => [f.id, false, f.fob]));
    assert.deepEqual(x.botones, [["seguir-paso", A.BOTON.seguir, false]]);
    /* Paso 2: el texto cambia; la tierra, atenuada y sin marca; «En el mar», con las marcas de FOB; tres opciones debajo. */
    await tocar(boton(m.caja, "seguir-paso"));
    x = v();
    assert.ok(activo() === m.caja.querySelector("[data-consigna]"), "al pasar al paso 2, el foco va a su texto");
    assert.deepEqual([x.estado, x.paso, x.consigna, x.mensaje], ["colocando", "cyf", CYF.texto, null]);
    assert.deepEqual(x.tramos, V.tramos.map((t) => [t.id, t.tierra]));
    assert.deepEqual(x.fichas.map((f) => [f.id, f.paga]), FICHAS.map((f) => [f.id, ["flete", "seguro"].includes(f.id) ? f.fob : null]));
    assert.equal(x.leyenda, C1.LEYENDA.join(""), "la figura se queda (C8)");
    assert.deepEqual(x.opciones, [...C1.PASO2.opciones].sort());
    assert.deepEqual(x.botones, [["confirmar", A.BOTON.confirmar, true]]);
    /* 1.er error, «Los dos, a medias»: su retro, y «Probar otra». */
    await responder(m.caja, "medias");
    x = v();
    assert.deepEqual(x.mensaje, ["error", A.INTERFAZ.incorrecto, C1.PASO2.retro]);
    assert.ok(activo() === m.caja.querySelector("[data-mensaje]"));
    assert.deepEqual(x.fichas.map((f) => f.paga), FICHAS.map((f) => (["flete", "seguro"].includes(f.id) ? f.fob : null)), "el error no mueve la figura");
    assert.deepEqual(x.botones, [["probar-otra", A.BOTON.probarOtra, false]]);
    await tocar(boton(m.caja, "probar-otra"));
    assert.equal(v().mensaje, null);
    /* 2.º error: la respuesta; «Flete» pasa al vendedor y «Seguro» se queda en el comprador; la tierra sigue sin marca. */
    await responder(m.caja, "vendedor");
    x = v();
    assert.deepEqual(x.mensaje, ["error", A.INTERFAZ.incorrecto, CYF.respuesta]);
    assert.deepEqual(x.fichas.map((f) => [f.id, f.paga]), FICHAS.map((f) => [f.id, f.cyf ?? null]));
    assert.deepEqual(x.botones, [["seguir", A.BOTON.seguir, false]]);
    await tocar(boton(m.caja, "seguir"));
    assert.equal(m.caja.querySelector("[data-pieza]").dataset.pantalla, "flete-del-comprador");
  } finally {
    m.desmontar();
  }
});

test("★★★ C1 · P3 montada: el camino del acierto (retro de antes de «a bordo», luego el acierto; C&F al primer intento)", async () => {
  const m = await montar(h(Importados, { pieza: conPieza("fob-cif-cyf"), rotulo: "R" }));
  const v = () => vistaViaje(m.caja);
  const ficha = (id) => m.caja.querySelector(`[data-ficha="${id}"]`);
  try {
    /* Toca «Transporte al puerto» y las tres buenas: retro de antes de «a bordo», con ✕ en coral solo en esa ficha. */
    for (const id of ["puerto", "flete", "seguro", "bodega"]) await tocar(ficha(id));
    await tocar(boton(m.caja, "comprobar"));
    let x = v();
    assert.deepEqual(x.mensaje, ["error", A.INTERFAZ.incorrecto, C1.PASO1.retro]);
    assert.deepEqual(x.fichas.filter((f) => f.mal).map((f) => f.id), ["puerto"]);
    /* Al quitarla, la marca de error se va; y entonces acierta. */
    await tocar(ficha("puerto"));
    assert.deepEqual(v().fichas.filter((f) => f.mal), []);
    await tocar(boton(m.caja, "comprobar"));
    x = v();
    assert.deepEqual(x.mensaje, ["acierto", A.INTERFAZ.correcto, FOB.acierto]);
    assert.deepEqual(x.fichas.map((f) => f.paga), FICHAS.map((f) => f.fob));
    assert.equal(x.leyenda, C1.LEYENDA.join(""));
    await tocar(boton(m.caja, "seguir-paso"));
    await responder(m.caja, "comprador");
    x = v();
    assert.deepEqual([x.estado, x.mensaje], ["acierto", ["acierto", A.INTERFAZ.correcto, CYF.acierto]]);
    assert.deepEqual(x.fichas.map((f) => f.paga), FICHAS.map((f) => f.cyf ?? null));
    assert.deepEqual(x.tramos.filter(([, a]) => a).map(([id]) => id), ["puerto", "subir", "bodega"]);
    assert.deepEqual(x.botones, [["seguir", A.BOTON.seguir, false]]);
    /* La condición de CIF queda a la vista con el acierto, sin plegar (C7). */
    assert.equal(m.caja.querySelector("[data-mensaje] [data-texto]").textContent, CYF.acierto);
    assert.equal(m.caja.querySelector("[data-mensaje] [hidden]"), null);
  } finally {
    m.desmontar();
  }
});

test("★★★ C1 · P3: B1 ≤ 40 antes de tocar y B2 ≤ 60 en cada estado, contado como Near y Mello (texto, rótulos, leyenda, opciones y mensaje)", () => {
  const rotulos = contar([...V.tramos.map((t) => t.rotulo), ...C1.FICHAS_MAR].join(" "));
  assert.equal(rotulos, 15, "F-1: los rótulos bajan a 15");
  const leyenda = contar(C1.LEYENDA.join(" "));
  const ops = contar(CYF.opciones.map((o) => o.texto).join(" "));
  const t1 = contar(FOB.texto);
  const t2 = contar(CYF.texto);
  assert.ok(t1 + rotulos <= 40, `B1 paso 1: ${t1 + rotulos}`);
  const momentos = {
    "paso 1, primer error": t1 + rotulos + Math.max(contar(FOB.pista), contar(C1.PASO1.retro)),
    "paso 1, segundo error": t1 + rotulos + leyenda + contar(FOB.respuesta),
    "paso 1, acierto": t1 + rotulos + leyenda + contar(FOB.acierto),
    "paso 2, antes de tocar": t2 + rotulos + leyenda + ops,
    "paso 2, primer error": t2 + rotulos + leyenda + ops + Math.max(contar(CYF.pista), contar(C1.PASO2.retro)),
    "paso 2, segundo error": t2 + rotulos + leyenda + ops + contar(CYF.respuesta),
    "paso 2, acierto": t2 + rotulos + leyenda + ops + contar(CYF.acierto),
  };
  for (const [k, n] of Object.entries(momentos)) assert.ok(n <= 60, `${k}: ${n}`);
  /* El total de Mello con el acierto a la vista: 13 + 15 + 2 + 8 + 21 = 59. */
  assert.equal(momentos["paso 2, acierto"], 59);
  assert.ok(C1.AUDITORIA.includes("**Total con el acierto a la vista:** 13 + 15 + 2 + 8 + 21 = **59**."));
});

test("★★ C1 · P3: botones reales de 44 px, la figura con nombre, sin teal ni ámbar en las marcas; marcas para el lector", async () => {
  assert.match(CSS_A5, /\.t7a5-ficha-v \{[^}]*min-height: 44px;/);
  const reglas = CSS_A5.slice(CSS_A5.indexOf("/* P3 · el viaje de la compra (C1)"), CSS_A5.indexOf("@media (prefers-reduced-motion"));
  assert.doesNotMatch(reglas, /2A9D8F|E9C46A/i);
  const m = await montar(h(Importados, { pieza: conPieza("fob-cif-cyf"), rotulo: "R" }));
  try {
    const fig = m.caja.querySelector("[data-figura]");
    assert.equal(fig.getAttribute("role"), "group");
    assert.equal(fig.getAttribute("aria-label"), C1.NOMBRE_FOB);
    for (const b of m.caja.querySelectorAll("button")) assert.equal(b.getAttribute("type"), "button");
    for (const id of ["flete", "seguro", "bodega"]) await tocar(m.caja.querySelector(`[data-ficha="${id}"]`));
    await tocar(boton(m.caja, "comprobar"));
    /* Cada marca dice, para el lector, quién paga (la palabra de la leyenda). */
    assert.deepEqual([...fig.querySelectorAll("[data-ficha] .t7a5-sr")].map((s) => s.textContent), FICHAS.map((f) => V.leyenda[f.fob]));
  } finally {
    m.desmontar();
  }
});
