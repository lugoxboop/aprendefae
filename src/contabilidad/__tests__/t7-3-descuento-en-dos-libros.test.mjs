import { test } from "node:test";
import assert from "node:assert/strict";
import { readFileSync, readdirSync } from "node:fs";
import { JSDOM, VirtualConsole } from "jsdom";

/*
 * ═══════════════════════════════════════════════════════════════════════════
 * T7-3 · A4 «El descuento en los dos libros» (Célula C) · Aprender.
 *
 *   · cada texto visible de la v1 está en los datos, letra por letra, y
 *     nada más
 *   · los asientos de Santa Martha y los del cierre, y las cuentas T, son
 *     los de la v1, con sus erratas resueltas (C7-9, C7-17, C7-27, C7-30) y
 *     las cifras de A3, que es el mismo ejemplo; cada asiento cuadra
 *   · cada pantalla y cada estado muestran sus textos y su pie
 *   · fuera del catálogo de FP; en T7-3, justo después de A3
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

const A = await import("../../data/contabilidadT7_3_a4.js");
const A3 = await import("../../data/contabilidadT7_3_a3.js");
const A1 = await import("../../data/contabilidadT7_3.js");
const { SUBJECTS, APRENDER } = await import("../../data/subjects.js");
const { default: PantallasT7_3, cifra } = await import("../../components/mecanicas/libros/t7/PantallasT7_3.jsx");
const { textosDelError } = await import("../../components/mecanicas/libros/t7/escaleraAyuda.js");
const { PIEZAS_T7_3, TEMA_T7_3 } = await import("../../components/ContabilidadT7_3View.jsx");

const RAIZ = new URL("../../../", import.meta.url);
const leer = (f) => readFileSync(new URL(f, RAIZ), "utf8");
const V1 = leer("orquestador/conocimiento/paquetes/t7-3-a4-v1.md");
const P = A.PIEZA_EL_DESCUENTO_EN_DOS_LIBROS;
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
const fila = (pref) => FILAS.find((f) => f[0].startsWith(pref) || f[1].startsWith(pref))[1];

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
const lineas = (t) => [...t.matchAll(/(?:^|· |\/ )([^·/]+?) ([\d.]+) (D|H)/g)].map((m) => [m[1].trim(), Number(m[2].replace(/\./g, "")), m[3] === "D" ? A1.DEBE : A1.HABER]);
const deAsiento = (as) => as.lineas.map((l) => [l.cuenta, l.monto, l.lado]);

/* ═══════════ 1 · TEXTOS ═══════════ */

test("★★★ cada texto visible de la v1 está en los datos, letra por letra, y nada más", () => {
  const esperados = [];
  for (const [n, texto] of FILAS) {
    if (/Asiento|Cuentas T/.test(n)) continue;
    for (const c of citas(texto)) esperados.push(c);
  }
  /* El lote 2: cada pregunta con su pista, la de Near, y ninguna más; y las devoluciones de las terceras opciones del anexo. */
  assert.deepEqual(new Map(P.pantallas.filter((p) => p.pista).map((p) => [p.id, p.pista])), L2_PISTAS);
  assert.deepEqual([...L2_PISTAS.keys()].sort(), ["cierre", "el-pago"]);
  esperados.push(...L2_PISTAS.values(), ...[...L2_TERCERAS.values()].map((t) => t.devolucion));
  assert.deepEqual([...textosDeDatos()].sort(), [...esperados].sort());
  /* C7-26: no se dice «comparador». */
  assert.ok(!JSON.stringify(P).includes("comparador"));
});

test("★★★ las opciones, los asientos y las cuentas T son los de la v1, con sus erratas resueltas", () => {
  /* Debe y Haber, de la v1, y al final la tercera opción del anexo del lote 2, con su devolución. */
  assert.deepEqual([...L2_TERCERAS.keys()], ["el-pago", "cierre"]);
  assert.deepEqual(L2_CAMBIOS, []);
  for (const id of ["el-pago", "cierre"]) {
    const p = pantalla(id);
    assert.deepEqual(p.opciones.map((o) => o.texto), ["Debe", "Haber", L2_TERCERAS.get(id).texto]);
    assert.equal(p.opciones.at(-1).devolucion, L2_TERCERAS.get(id).devolucion);
    assert.equal(p.opciones.at(-1).correcta, undefined);
    assert.equal(p.opciones.find((o) => o.correcta).texto, "Haber");
    assert.equal(p.opciones.find((o) => !o.correcta).devolucion, citas(FILAS.find((f) => f[1].startsWith("Error (Debe)") && FILAS.indexOf(f) > FILAS.findIndex((g) => g[1].includes(p.pregunta)))[1])[0]);
  }
  /* 25 de mayo (C7-27: Compras; regla 8: Retención en la fuente por pagar) y 4 de junio (C7-9, C7-17, C7-30). */
  const v1Compra = fila("2 · Asiento 25 de mayo");
  const v1Pago = fila("3 · Asiento 4 de junio");
  assert.deepEqual(deAsiento(pantalla("repaso").asientos[0]), lineas(v1Compra.split(". Sumas")[0]));
  assert.deepEqual(deAsiento(pantalla("el-pago").acierto.asientos[0]), lineas(v1Pago.split(". Sumas")[0]));
  for (const [as, v1, pie] of [[pantalla("repaso").asientos[0], v1Compra, pantalla("repaso").pie], [pantalla("el-pago").acierto.asientos[0], v1Pago, pantalla("el-pago").acierto.pie]]) {
    const s = as.lineas.filter((l) => l.lado === A1.DEBE).reduce((x, l) => x + l.monto, 0);
    assert.equal(s, as.lineas.filter((l) => l.lado === A1.HABER).reduce((x, l) => x + l.monto, 0));
    assert.match(v1, new RegExp(`Sumas: ${cifra(s)} = ${cifra(s)}\\. Pie: «${pie}»`));
  }
  /* El cierre del 30 de junio, en los dos libros. */
  const v1Cierre = fila("4 · Asientos 30 de junio");
  const [, sc, sm] = v1Cierre.match(/San Calixto: (.+?)\. Santa Martha: (.+?)\. Pie: «(.+)»/);
  const [cSC, cSM] = pantalla("cierre").acierto.asientos;
  assert.deepEqual([cSC.titular, cSM.titular], ["San Calixto", "Santa Martha"]);
  assert.deepEqual([deAsiento(cSC), deAsiento(cSM)], [lineas(sc), lineas(sm)]);
  assert.ok(v1Cierre.endsWith(`Pie: «${pantalla("cierre").acierto.pie}».`));
  /* Las cuentas T: cada lado con su monto y su fecha. */
  const v1T = fila("4 · Cuentas T");
  const t = pantalla("cierre").cuentasT;
  const deT = (x, lado) => x[lado].map((m) => `${lado} ${cifra(m.monto)} (${m.fecha})`);
  const leidas = [...v1T.matchAll(/(San Calixto|Santa Martha): (.+?)\.(?= Santa| Pie)/g)].map((m) => [m[1], m[2].split(" · ").sort()]);
  assert.deepEqual(t.map((x) => [x.titular, [...deT(x, "debe"), ...deT(x, "haber")].sort()]), leidas);
  assert.ok(v1T.endsWith(`Pie: «${pantalla("cierre").pie}».`));
  /* Ninguna errata a la vista: ni «Compra de mercancías», ni «5.98.500», ni «condicional», ni «Caja / Bancos», ni «Retefuente». */
  const datos = JSON.stringify(P);
  for (const x of ["Compra de mercancías", "5.98.500", "condicional", "Caja / Bancos", "Retefuente"]) assert.ok(!datos.includes(x), x);
});

test("★★★ las cifras son las de A3: el mismo ejemplo", () => {
  const C = A3.H3_LIBRO;
  const montos = new Set(P.pantallas.flatMap((p) => [...(p.asientos ?? []), ...(p.acierto?.asientos ?? [])]).flatMap((a) => a.lineas.map((l) => l.monto)));
  assert.deepEqual([...montos].sort((a, b) => a - b), [C.retencion, C.condicionado, C.iva, C.pago, C.factura, C.cliente].sort((a, b) => a - b));
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

async function pregunta(c, p) {
  assert.deepEqual(textos(c).slice(-1), [p.pregunta]);
  /* Las dos malas: la 1.ª da la pista; la 2.ª, la respuesta con su porqué (escalera de ayuda). */
  let n = 0;
  for (const mala of p.opciones.filter((o) => !o.correcta)) {
    await tocar(c.querySelector(`[data-opcion="${mala.id}"]`));
    await tocar(boton(c, "confirmar"));
    const esperado = errorEsperado(p, mala, ++n);
    assert.deepEqual(textos(c).slice(-esperado.length), esperado);
    assert.equal(pie(c), p.error.pie);
    await tocar(boton(c, "probar-otra"));
  }
  assert.equal(n, 2);
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
    assert.deepEqual(textos(c), pantalla("quien-compra").parrafos);
    await tocar(boton(c, "seguir"));
    assert.deepEqual(textos(c), pantalla("repaso").parrafos);
    assert.equal(c.querySelector("[data-asiento]").dataset.asiento, "25 de mayo");
    await tocar(boton(c, "seguir"));
    const pg = pantalla("el-pago");
    assert.deepEqual(textos(c), [pg.pregunta]);
    assert.equal(c.querySelector("[data-asiento]") === null, true);
    await pregunta(c, pg);
    assert.deepEqual(textos(c).slice(-3), [pg.acierto.texto, ...pg.acierto.despues]);
    assert.equal(c.querySelector("[data-asiento]").dataset.asiento, "4 de junio");
    await tocar(boton(c, "seguir"));
    /* El cierre: las dos cuentas T antes de la pregunta; los dos asientos con su empresa, con el acierto. */
    const ci = pantalla("cierre");
    assert.deepEqual(textos(c), [...ci.parrafos, ci.pregunta]);
    assert.deepEqual([...c.querySelectorAll("[data-cuenta-t]")].map((x) => x.dataset.cuentaT), ["San Calixto", "Santa Martha"]);
    const sc = c.querySelector('[data-cuenta-t="San Calixto"]');
    assert.deepEqual([...sc.querySelectorAll('[data-lado-t="debe"] [data-mov-t]')].map((x) => x.textContent), ["jun-04598.500"]);
    assert.deepEqual([...sc.querySelectorAll('[data-lado-t="haber"] [data-mov-t]')].map((x) => x.textContent), ["jun-30598.500"]);
    await pregunta(c, ci);
    assert.deepEqual([...c.querySelectorAll("[data-asiento] [data-titular]")].map((x) => x.textContent), ["San Calixto", "Santa Martha"]);
    assert.deepEqual(textos(c).slice(-2), [ci.acierto.texto, ...ci.acierto.despues]);
    await tocar(boton(c, "seguir"));
    assert.deepEqual(textos(c), pantalla("no-operacional").parrafos);
    await tocar(boton(c, "seguir"));
    assert.deepEqual(textos(c), pantalla("permanente").parrafos);
    assert.equal(pie(c), pantalla("permanente").pie);
    await tocar(boton(c, "seguir"));
    const r = pantalla("resumen");
    assert.deepEqual(textos(c), [...r.parrafos, r.siguiente]);
    assert.equal(c.querySelector("[data-boton]") === null, true);
  } finally {
    m.desmontar();
  }
});

/* ═══════════ 3 · CATÁLOGO ═══════════ */

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

/* ═══════════ PATRÓN T7-3 (Watari) ═══════════ */

test("★★★ Patrón T7-3: la franja de A3, con el pago del 4 de junio, en la pantalla 1 y en ninguna otra", async () => {
  const m = await montar();
  try {
    const c = m.caja;
    const visto = [];
    for (let k = 0; k < 12; k++) {
      const id = c.querySelector("[data-pantalla]").dataset.pantalla;
      const fr = [...c.querySelectorAll("[data-plazos]")];
      visto.push([id, fr.map((f) => f.querySelector("[data-pago]")?.textContent ?? "sin pago")]);
      const p = pantalla(id);
      if (p.opciones) {
        await tocar(c.querySelector(`[data-opcion="${p.opciones.find((o) => o.correcta).id}"]`)); await tocar(boton(c, "confirmar"));
        assert.equal(c.querySelectorAll("[data-plazos]").length, 0, `${id}: sin franja tras el acierto`);
        await tocar(boton(c, "seguir"));
      } else {
        const b = boton(c, "seguir") ?? boton(c, "empezar");
        if (!b) break;
        await tocar(b);
      }
    }
    assert.deepEqual(visto.filter(([, f]) => f.length), [["quien-compra", ["Pago · 4 jun"]]]);
  } finally {
    m.desmontar();
  }
});
