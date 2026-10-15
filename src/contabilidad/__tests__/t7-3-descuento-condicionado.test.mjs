import { test } from "node:test";
import assert from "node:assert/strict";
import { readFileSync, readdirSync } from "node:fs";
import { JSDOM, VirtualConsole } from "jsdom";

/*
 * ═══════════════════════════════════════════════════════════════════════════
 * T7-3 · A3 «El descuento condicionado» (Célula C) · Aprender.
 *
 *   · cada texto visible de la v1 está en los datos, letra por letra, y
 *     nada más; la pantalla 5, con sus dos preguntas, va en dos pantallas en
 *     el mismo orden
 *   · las cifras de H-3 se recalculan desde la lista, el 5 %, el 15 % y las
 *     tarifas; los dos asientos cuadran; C7-6 (25 de mayo) y C7-30 (Caja o
 *     Bancos) resueltas
 *   · cada pantalla y cada estado muestran sus textos y su pie
 *   · regla 3: ninguna cifra de X1-X4
 *   · fuera del catálogo de FP; en T7-3, después de A2 (y de H2)
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

const A = await import("../../data/contabilidadT7_3_a3.js");
const A1 = await import("../../data/contabilidadT7_3.js");
const { SUBJECTS, APRENDER } = await import("../../data/subjects.js");
const { default: PantallasT7_3, cifra } = await import("../../components/mecanicas/libros/t7/PantallasT7_3.jsx");
const { textosDelError } = await import("../../components/mecanicas/libros/t7/escaleraAyuda.js");
const { PIEZAS_T7_3, TEMA_T7_3 } = await import("../../components/ContabilidadT7_3View.jsx");

const RAIZ = new URL("../../../", import.meta.url);
const leer = (f) => readFileSync(new URL(f, RAIZ), "utf8");
const V1 = leer("orquestador/conocimiento/paquetes/t7-3-a3-v1.md");
const P = A.PIEZA_EL_DESCUENTO_CONDICIONADO;
const pantalla = (id) => P.pantallas.find((x) => x.id === id);
const citas = (t) => [...t.matchAll(/«([^»]+)»/g)].map((m) => m[1]);

/*
 * El lote 2 de Near: la pista de cada pregunta (primer error) y el anexo (la
 * tercera opción, con su devolución, y el cambio en el texto de una opción
 * correcta). Un texto nuevo de los datos sale de aquí o del paquete de la pieza.
 */
const PISTAS_L2 = leer("orquestador/conocimiento/paquetes/lote2-pistas-v1.md");
const ANEXO_L2 = leer("orquestador/conocimiento/paquetes/lote2-anexo-v1.md");
const sinComillas = (t) => t.trim().replace(/ \|$/, "").replace(/^«/, "").replace(/»$/, "");
const idEnCelda = (celda) => celda.match(/`([^`]+)`/)[1];
/* id de pantalla → pista. */
const L2_PISTAS = new Map((PISTAS_L2.split("\n### ").find((s) => s.startsWith(`${P.id} ·`)) ?? "").split("\n")
  .filter((l) => /^\| P\d/.test(l)).map((l) => l.split(" | ")).map((c) => [idEnCelda(c[0]), sinComillas(c[2])]));
/* id de pantalla → la tercera opción del anexo: { texto, devolucion }. */
const L2_TERCERAS = new Map(ANEXO_L2.split("\n").filter((l) => l.startsWith(`| ${P.id} | `)).map((l) => l.split(" | "))
  .map((c) => [idEnCelda(c[1]), { texto: c[3].replace(/\*\*/g, ""), devolucion: sinComillas(c[4]) }]));
/* «Un cambio en el texto de una opción correcta»: [campo, viejo, nuevo]. */
const L2_CAMBIOS = ANEXO_L2.slice(ANEXO_L2.indexOf("## Un cambio")).split("\n").filter((l) => l.startsWith(`| ${P.id} · `))
  .map((l) => l.split(" | ").map((x, i) => (i ? sinComillas(x) : x.replace(/^\| /, ""))));

/*
 * La escalera de ayuda (escaleraAyuda.js): el n-ésimo error de una pregunta.
 * Con pista, el 1.º muestra la pista; el 2.º y siguientes, la respuesta y el
 * acierto sin «Así es». Sin pista, la devolución de la opción, como antes.
 */
const errorEsperado = (p, o, n) => {
  const correcta = p.opciones.find((x) => x.correcta).texto.replace(/\.$/, "");
  const esperado = !p.pista ? [o.devolucion] : n === 1 ? [p.pista] : [`La respuesta es «${correcta}».`, p.acierto.texto.replace(/^Así es[.:]\s*/, "")];
  assert.deepEqual(textosDelError(p, o, n), esperado);
  return esperado;
};
const FILAS = V1.slice(V1.indexOf("## Pantallas"), V1.indexOf("## Decisiones")).split("\n").filter((l) => /^\| \d/.test(l)).map((l) => l.split(" | ").map((c) => c.replace(/^\| /, "")));
const fila = (pref) => FILAS.find((f) => f[1].startsWith(pref))[1];

function textosDeDatos() {
  const t = [];
  for (const p of P.pantallas) {
    for (const k of ["objetivo", "pregunta", "siguiente", "pista"]) if (p[k]) t.push(p[k]);
    t.push(...(p.parrafos ?? []), ...(p.despues ?? []), ...(p.tras ?? []));
    for (const o of p.opciones ?? []) if (o.devolucion) t.push(o.devolucion);
    if (p.acierto) t.push(p.acierto.texto, ...(p.acierto.parrafos ?? []), ...(p.acierto.despues ?? []));
  }
  return t;
}

/* ═══════════ 1 · TEXTOS ═══════════ */

test("★★★ cada texto visible de la v1 está en los datos, letra por letra, y nada más", () => {
  const esperados = [];
  for (const [, texto] of FILAS) {
    if (texto.startsWith("Ficha") || /^Cuentas por cobrar|^Caja o Bancos/.test(texto)) continue;
    /* Las citas de la columna Fuente no se ven; tampoco «xxxx». En la columna Texto, las opciones van sin comillas. */
    for (const c of citas(texto)) esperados.push(c);
  }
  esperados.push(A1.FRASE_TARIFAS);
  /* El lote 2: cada pregunta con su pista, la de Near, y ninguna más; y la devolución de la tercera opción del anexo. */
  assert.deepEqual(new Map(P.pantallas.filter((p) => p.pista).map((p) => [p.id, p.pista])), L2_PISTAS);
  assert.deepEqual([...L2_PISTAS.keys()].sort(), ["condiciones", "cual-le-toca", "que-es", "sobre-que"]);
  esperados.push(...L2_PISTAS.values(), ...[...L2_TERCERAS.values()].map((t) => t.devolucion));
  /* Los errores de la v1 que valen para dos opciones aparecen dos veces en los datos. */
  const datos = textosDeDatos();
  assert.deepEqual([...new Set(datos)].sort(), [...new Set(esperados)].sort());
  assert.ok(fila("«En este ejercicio, el IVA").endsWith("Después, la frase de tarifas literal."));
  const ej = pantalla("ejemplo").despues;
  assert.equal(ej[ej.indexOf("En este ejercicio, el IVA es del 16 % y la retención del 3,5 %. Las dos se calculan sobre lo facturado.") + 1], A1.FRASE_TARIFAS);
});

test("★★★ las opciones, sus errores, la ficha y los dos asientos son los de la v1", () => {
  const ops = (pref) => fila(pref).match(/Opciones: (.+)\.$/)[1].split(" · ");
  /* «¿Cuál se registra?»: las dos de la v1 y, al final, la tercera del anexo del lote 2, con su devolución. */
  assert.deepEqual([...L2_TERCERAS.keys()], ["que-es"]);
  assert.deepEqual(L2_CAMBIOS, []);
  assert.deepEqual(pantalla("que-es").opciones.map((o) => o.texto), [...ops("«¿Cuál de los dos descuentos"), L2_TERCERAS.get("que-es").texto]);
  assert.equal(pantalla("que-es").opciones.at(-1).devolucion, L2_TERCERAS.get("que-es").devolucion);
  assert.equal(pantalla("que-es").opciones.at(-1).correcta, undefined);
  assert.deepEqual(pantalla("condiciones").opciones.map((o) => o.texto), ops("«Si el cliente paga a los treinta"));
  assert.deepEqual(pantalla("cual-le-toca").opciones.map((o) => o.texto), ops("«El 4 de junio, Santa Martha paga"));
  assert.deepEqual(pantalla("sobre-que").opciones.map((o) => o.texto), ops("«¿Sobre qué valor se calcula el 15 %?»"));
  assert.deepEqual(["que-es", "condiciones", "cual-le-toca", "sobre-que"].map((id) => pantalla(id).opciones.find((o) => o.correcta).texto), ["El condicionado", "Ninguno", "15 %", "$3.990.000"]);
  /* «Error (15 % o 5 %)»: el mismo texto para las dos. */
  const e30 = citas(fila("Error (15 % o 5 %)"))[0];
  assert.deepEqual(pantalla("condiciones").opciones.filter((o) => !o.correcta).map((o) => o.devolucion), [e30, e30]);
  for (const o of pantalla("sobre-que").opciones.filter((x) => !x.correcta)) assert.equal(o.devolucion, citas(fila(`Error, ${o.texto}:`))[0]);
  /* La ficha: los cinco datos y el sistema. */
  const f = fila("Ficha de cinco datos");
  const datos = f.match(/: (.+?)\. Sistema: (.+)\.$/);
  const esperada = [...datos[1].split(" · ").map((t) => t.replace(/^(entrega|recibe) /, "")), datos[2]];
  assert.deepEqual(pantalla("ejemplo").ficha.map((x) => x.texto.toLowerCase()), esperada.map((t) => t.toLowerCase()));
  assert.deepEqual(pantalla("ejemplo").ficha.map((x) => x.dato), [...A1.PIEZA_EL_DESCUENTO_COMERCIAL.pantallas.find((p) => p.ficha).ficha.map((x) => x.dato), "Sistema"]);
  /* Los dos asientos: líneas, lados, sumas y pie. */
  const lineas = (t) => [...t.matchAll(/(?:^|· )([^·]+?) ([\d.]+) (D|H)/g)].map((m) => [m[1].trim(), Number(m[2].replace(/\./g, "")), m[3] === "D" ? A1.DEBE : A1.HABER]);
  const v1Venta = FILAS.find((f) => f[0] === "4 · Asiento 25 de mayo")[1];
  const v1Pago = FILAS.find((f) => f[0] === "5 · Asiento 4 de junio")[1];
  const venta = pantalla("ejemplo").asientos[0];
  const pago = pantalla("sobre-que").acierto.asientos[0];
  assert.deepEqual(venta.lineas.map((l) => [l.cuenta, l.monto, l.lado]), lineas(v1Venta.split(". Sumas")[0]));
  assert.deepEqual(pago.lineas.map((l) => [l.cuenta, l.monto, l.lado]), lineas(v1Pago.split(". Sumas")[0]));
  assert.deepEqual([venta.fecha, pago.fecha], ["25 de mayo", "4 de junio"]);
  for (const [as, v1, pie] of [[venta, v1Venta, pantalla("ejemplo").pie], [pago, v1Pago, pantalla("sobre-que").acierto.pie]]) {
    const s = as.lineas.filter((l) => l.lado === A1.DEBE).reduce((x, l) => x + l.monto, 0);
    assert.match(v1, new RegExp(`Sumas: ${cifra(s)} = ${cifra(s)}\\. Pie: «${pie}»`));
  }
  /* C7-30: «Caja» del libro, como «Caja o Bancos». C7-6: el 25 de mayo. */
  assert.ok(!JSON.stringify(P).includes('"Caja"'));
  assert.ok(pantalla("ejemplo").parrafos[0].startsWith("Mira el ejemplo del libro. El 25 de mayo,"));
});

test("★★★ las cifras de H-3 se recalculan; los dos asientos cuadran", () => {
  const C = A.H3_LIBRO;
  const comercial = (4_200_000 * 5) / 100;
  const f = 4_200_000 - comercial;
  const iva = (f * 16) / 100;
  const ret = (f * 35) / 1000;
  const cond = (f * 15) / 100;
  assert.deepEqual([C.comercial, C.factura, C.iva, C.retencion, C.cliente, C.condicionado, C.pago], [comercial, f, iva, ret, f + iva - ret, cond, f + iva - ret - cond]);
  assert.equal(C.sumasVenta, C.cliente + C.retencion);
  assert.equal(C.sumasVenta, C.iva + C.factura);
  /* El descuento condicionado no toca el IVA: se calcula sobre lo facturado por la mercancía. */
  assert.notEqual(C.condicionado, (C.cliente * 15) / 100);
});

test("★★★ regla 3: ninguna cifra de X1-X4", () => {
  const prohibidas = [800_000, 175_000, 5_625_000, 5_800_000, 6_760_000, 17_460_000, 24_220_000, 1_518_000, 22_702_000, 1_200_000, 262_500, 8_437_500, 643_500, 8_700_000, 2_432_000, 532_000, 384_000, 84_000, 2_700_000, 2_784_000, 17_632_000];
  const numeros = new Set([...JSON.stringify(P).matchAll(/\d[\d.]*/g)].map((m) => Number(m[0].replace(/\./g, ""))));
  for (const x of prohibidas) assert.ok(!numeros.has(x), cifra(x));
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
const boton = (caja, n) => caja.querySelector(`[data-boton="${n}"]`);
const textos = (caja) => [...caja.querySelectorAll("[data-pieza] [data-texto]")].map((x) => x.textContent);
const pie = (caja) => caja.querySelector("[data-pie]").textContent;

/* Una pregunta: cada error, «Probar otra», y el acierto. */
async function pregunta(c, p) {
  assert.deepEqual(textos(c).slice(-1), [p.pregunta]);
  assert.equal(pie(c), p.pie);
  /* Los errores siguen la escalera de ayuda: con pista, el 1.º da la pista y los demás, la respuesta con su porqué. */
  let n = 0;
  for (const o of p.opciones.filter((x) => !x.correcta)) {
    await tocar(c.querySelector(`[data-opcion="${o.id}"]`));
    await tocar(boton(c, "confirmar"));
    const esperado = errorEsperado(p, o, ++n);
    assert.deepEqual(textos(c).slice(-esperado.length), esperado);
    assert.equal(pie(c), p.error.pie);
    assert.equal(c.querySelector("[data-asiento]:not([data-asiento='25 de mayo'])") === null, true);
    await tocar(boton(c, "probar-otra"));
  }
  await tocar(c.querySelector(`[data-opcion="${p.opciones.find((o) => o.correcta).id}"]`));
  await tocar(boton(c, "confirmar"));
  assert.equal(pie(c), p.acierto.pie);
}

test("★★★ se recorre entera: cada pantalla y cada estado con sus textos y su pie", async () => {
  const m = await montar();
  try {
    const c = m.caja;
    assert.deepEqual(textos(c), [pantalla("portada").objetivo]);
    await tocar(boton(c, "empezar"));
    const qe = pantalla("que-es");
    assert.deepEqual(textos(c), [...qe.parrafos, qe.pregunta]);
    await pregunta(c, qe);
    assert.deepEqual(textos(c).slice(-1), [qe.acierto.texto]);
    await tocar(boton(c, "seguir"));
    assert.deepEqual(textos(c), pantalla("un-gasto").parrafos);
    await tocar(boton(c, "seguir"));
    const co = pantalla("condiciones");
    assert.deepEqual(textos(c), [...co.parrafos, co.pregunta]);
    await pregunta(c, co);
    await tocar(boton(c, "seguir"));
    const ej = pantalla("ejemplo");
    assert.deepEqual(textos(c), [...ej.parrafos, ...ej.ficha.map((f) => f.texto), ...ej.despues]);
    const venta = c.querySelector("[data-asiento]");
    assert.equal(venta.dataset.asiento, "25 de mayo");
    assert.deepEqual([...venta.querySelectorAll("[data-suma]")].map((x) => x.textContent), [cifra(A.H3_LIBRO.sumasVenta), cifra(A.H3_LIBRO.sumasVenta)]);
    assert.equal(pie(c), ej.pie);
    await tocar(boton(c, "seguir"));
    const cu = pantalla("cual-le-toca");
    assert.deepEqual(textos(c), [cu.pregunta]);
    await pregunta(c, cu);
    await tocar(boton(c, "seguir"));
    /* La segunda pregunta: el asiento del pago, solo con el acierto, después de sus dos textos. */
    const sq = pantalla("sobre-que");
    assert.deepEqual(textos(c), [sq.pregunta]);
    await pregunta(c, sq);
    assert.deepEqual(textos(c).slice(-4), [sq.acierto.texto, ...sq.acierto.parrafos, ...sq.acierto.despues]);
    const pago = c.querySelector("[data-asiento]");
    assert.equal(pago.dataset.asiento, "4 de junio");
    assert.deepEqual([...pago.querySelectorAll("[data-suma]")].map((x) => x.textContent), [cifra(A.H3_LIBRO.cliente), cifra(A.H3_LIBRO.cliente)]);
    const orden = [...c.querySelectorAll("[data-eleccion] > *")].map((x) => (x.matches("[data-asiento]") ? "asiento" : x.textContent));
    const i = orden.indexOf("asiento");
    assert.equal(orden[i - 1], sq.acierto.parrafos[1]);
    assert.equal(orden[i + 1], sq.acierto.despues[0]);
    await tocar(boton(c, "seguir"));
    const r = pantalla("resumen");
    assert.deepEqual(textos(c), [...r.parrafos, r.siguiente]);
    assert.equal(pie(c), r.pie);
    assert.equal(c.querySelector("[data-boton]") === null, true);
  } finally {
    m.desmontar();
  }
});

/* ═══════════ 3 · CATÁLOGO ═══════════ */

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

/* ═══════════ PATRÓN T7-3 (Watari) ═══════════ */

/* Lo que se ve de las figuras: [«plazos» con o sin pago | título de renglones, cifras]. */
const figuras = (c) => [...c.querySelectorAll("[data-plazos], figure[data-renglones]")].map((f) => (f.matches("[data-plazos]")
  ? ["plazos", f.querySelector("[data-pago]")?.textContent ?? "sin pago", [...f.querySelectorAll(".pz-et b")].map((b) => b.textContent).join(" ")]
  : [f.querySelector("figcaption").textContent, [...f.querySelectorAll(".rg-v")].map((x) => x.textContent)]));

test("★★★ Patrón T7-3: la franja y las cuentas, cada una cuando ya no da la respuesta", async () => {
  const C = A.H3_LIBRO;
  assert.equal(C.lista - C.comercial, C.factura);
  assert.equal(C.factura * 0.15, C.condicionado);
  assert.equal(C.cliente - C.condicionado, C.pago);
  const m = await montar();
  try {
    const c = m.caja;
    const visto = {};
    const mirar = (estado) => { visto[`${c.querySelector("[data-pantalla]").dataset.pantalla}:${estado}`] = figuras(c); };
    for (let k = 0; k < 12; k++) {
      const id = c.querySelector("[data-pantalla]").dataset.pantalla;
      const p = pantalla(id);
      if (p.opciones) {
        mirar("antes");
        const mala = p.opciones.find((o) => !o.correcta);
        await tocar(c.querySelector(`[data-opcion="${mala.id}"]`)); await tocar(boton(c, "confirmar"));
        mirar("error");
        await tocar(boton(c, "probar-otra"));
        await tocar(c.querySelector(`[data-opcion="${p.opciones.find((o) => o.correcta).id}"]`)); await tocar(boton(c, "confirmar"));
        mirar("acierto");
        await tocar(boton(c, "seguir"));
      } else {
        mirar("lectura");
        const b = boton(c, "seguir") ?? boton(c, "empezar");
        if (!b) break;
        await tocar(b);
      }
    }
    const libres = ["plazos", "sin pago", "Venta 10 días 20 días 30 días:"];
    const conPago = ["plazos", "Pago · 4 jun", "Venta 10 días 20 días 30 días:"];
    assert.deepEqual(visto, {
      "portada:lectura": [], "que-es:antes": [], "que-es:error": [], "que-es:acierto": [], "un-gasto:lectura": [],
      /* «30 días: sin descuento» es la respuesta de esta pantalla: la franja llega con el acierto. */
      "condiciones:antes": [], "condiciones:error": [], "condiciones:acierto": [libres],
      "ejemplo:lectura": [libres, ["Factura de San Calixto", ["4.200.000", "210.000", "3.990.000"]]],
      /* «10 días: 15 %» también: el pago llega con el acierto. */
      "cual-le-toca:antes": [], "cual-le-toca:error": [], "cual-le-toca:acierto": [conPago],
      "sobre-que:antes": [], "sobre-que:error": [],
      "sobre-que:acierto": [["El descuento condicionado", ["3.990.000", "15 %", "598.500"]], ["El pago del 4 de junio", ["4.488.750", "598.500", "3.890.250"]]],
      "resumen:lectura": [],
    });
    /* El pago, en el día 10 de 30. */
    await act(async () => {});
  } finally {
    m.desmontar();
  }
  assert.deepEqual(A.PLAZOS_A3(true).pago, { dia: 10, fecha: "4 jun" });
});
