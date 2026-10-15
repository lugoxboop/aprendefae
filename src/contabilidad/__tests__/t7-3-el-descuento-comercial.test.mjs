import { test } from "node:test";
import assert from "node:assert/strict";
import { readFileSync, readdirSync } from "node:fs";
import { JSDOM, VirtualConsole } from "jsdom";

/*
 * ═══════════════════════════════════════════════════════════════════════════
 * T7-3 · A1 «El descuento comercial» (Célula C) · Aprender.
 *
 *   · cada texto visible de la v1 está en los datos, letra por letra, con las
 *     dos capas de cambios aplicadas (manda la más nueva); los textos que
 *     esas capas reemplazan ya no están
 *   · las cifras de H-1 se recalculan desde la lista, el 15 % y las tarifas,
 *     y el asiento cuadra con las sumas de Near
 *   · cada pantalla y cada estado muestran sus textos y su pie; el asiento
 *     aparece con el acierto, con sus sumas, y sin el descuento
 *   · regla 3: ninguna cifra de X1-X4
 *   · fuera del catálogo de FP; abre T7-3, que va justo después de T7-2
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

const A = await import("../../data/contabilidadT7_3.js");
const { SUBJECTS, APRENDER } = await import("../../data/subjects.js");
const { default: PantallasT7_3, cifra } = await import("../../components/mecanicas/libros/t7/PantallasT7_3.jsx");
const { textosDelError } = await import("../../components/mecanicas/libros/t7/escaleraAyuda.js");
const { PIEZAS_T7_3, TEMA_T7_3 } = await import("../../components/ContabilidadT7_3View.jsx");
const { VISTAS, vistaDeTema } = await import("../../ruta.js");

const RAIZ = new URL("../../../", import.meta.url);
const leer = (f) => readFileSync(new URL(f, RAIZ), "utf8");
const V1 = leer("orquestador/conocimiento/paquetes/t7-3-a1-v1.md");
const P = A.PIEZA_EL_DESCUENTO_COMERCIAL;
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

/* La tabla «Pantallas» de la v1: [número, texto] por fila. */
const FILAS = V1.slice(V1.indexOf("## Pantallas"), V1.indexOf("## Términos")).split("\n")
  .filter((l) => /^\| \d/.test(l)).map((l) => l.split(" | ").map((c) => c.replace(/^\| /, "")));
/* Las dos capas de cambios: campo → texto nuevo (la última fila que nombra un campo manda). */
const CAPA3 = V1.slice(V1.indexOf("## Capa 3")).split("\n").filter((l) => l.startsWith("| A1 ·")).map((l) => l.split(" | "));
const CAPA2 = V1.slice(V1.indexOf("## Capa 2"), V1.indexOf("## Capa 3")).split("\n").filter((l) => l.startsWith("Pantalla 1")).map((l) => l.split("\t"));

function textosDeDatos() {
  const t = [];
  for (const p of P.pantallas) {
    for (const k of ["objetivo", "pregunta", "siguiente", "pista"]) if (p[k]) t.push(p[k]);
    t.push(...(p.parrafos ?? []), ...(p.despues ?? []));
    for (const o of p.opciones ?? []) if (o.devolucion) t.push(o.devolucion);
    if (p.acierto) t.push(p.acierto.texto, ...(p.acierto.parrafos ?? []), ...(p.acierto.despues ?? []));
  }
  return t;
}

/* ═══════════ 1 · TEXTOS ═══════════ */

test("★★★ cada texto visible de la v1 está en los datos, con las capas de cambios aplicadas", () => {
  const fila = CAPA3.find((f) => f[0].includes("línea de los sistemas"));
  const [sistemasViejo] = citas(fila[1]);
  const [sistemasNuevo] = citas(fila[2]);
  const reemplazos = new Map();
  for (const f of CAPA3) {
    const [viejo] = citas(f[1]);
    const [nuevo] = citas(f[2]);
    reemplazos.set(viejo, nuevo);
  }
  /* El «…» de la capa 3 abrevia la línea de la capa 2. */
  assert.ok(sistemasViejo.startsWith("…") && citas(CAPA2[0][2])[0].includes(sistemasViejo.slice(1)));
  /* Lo que se espera ver: la columna «Texto» de la v1, con cada reemplazo, y la línea de la capa 2 (reescrita en la capa 3). */
  const esperados = [];
  for (const [n, texto] of FILAS) {
    if (/Asiento$|^4$/.test(n) && texto.startsWith("Ficha")) continue;
    for (const c of citas(texto)) {
      /* El pie del asiento se revisa aparte; «xxxx» es la fecha que el libro no da, y no se muestra. */
      if (c.startsWith("Basado en el libro") || c === "xxxx") continue;
      esperados.push(reemplazos.get(c) ?? c);
      /* La capa 2 metió la línea de los sistemas justo antes de «En el sistema permanente hay un paso más…». */
      if (c.startsWith("El IVA va al haber de IVA por pagar")) esperados.push(sistemasNuevo);
    }
  }
  /* La frase de tarifas literal va donde la v1 dice «Después, la frase de tarifas literal». */
  esperados.splice(esperados.indexOf(pantalla("repaso").parrafos[1]) + 1, 0, A.FRASE_TARIFAS);
  /* El lote 2: cada pregunta con su pista, la de Near, y ninguna más; y la devolución de la tercera opción del anexo. */
  assert.deepEqual(new Map(P.pantallas.filter((p) => p.pista).map((p) => [p.id, p.pista])), L2_PISTAS);
  assert.deepEqual([...L2_PISTAS.keys()].sort(), ["dos-clases", "ejemplo"]);
  esperados.push(...L2_PISTAS.values(), ...[...L2_TERCERAS.values()].map((t) => t.devolucion));
  /* El orden en pantalla lo revisa la prueba montada; aquí, que sean los mismos, sin faltar ni sobrar. */
  assert.deepEqual([...textosDeDatos()].sort(), [...esperados].sort());
  assert.ok(FILAS.find((f) => f[1].includes("En este ejercicio, el IVA es del 16 %"))[1].includes("Después, la frase de tarifas literal"));
  /* Los que reemplazan las capas ya no están. */
  const datos = JSON.stringify(P);
  for (const viejo of ["En el sistema permanente hay un paso más", "Siguiente: varios descuentos, uno detrás de otro.", "el costo de lo vendido se halla al cierre, con un conteo físico. En el permanente, anotan todos los días su mercancía y el costo de lo que venden."]) assert.ok(!datos.includes(viejo), viejo);
});

test("★★★ las opciones, la ficha y el asiento son los de la v1", () => {
  const preg = (n) => FILAS.find((f) => f[0] === n)[1];
  /* Dos clases: las dos de la v1 y, al final, la tercera del anexo del lote 2, con su devolución. */
  assert.deepEqual([...L2_TERCERAS.keys()], ["dos-clases"]);
  const tercera = L2_TERCERAS.get("dos-clases");
  assert.deepEqual(pantalla("dos-clases").opciones.map((o) => o.texto), [...preg("2 · Pregunta (sin puntaje)").match(/Opciones: (.+)\.$/)[1].split(" · "), tercera.texto]);
  assert.deepEqual(pantalla("dos-clases").opciones.at(-1).devolucion, tercera.devolucion);
  assert.equal(pantalla("dos-clases").opciones.at(-1).correcta, undefined);
  assert.deepEqual(L2_CAMBIOS, []);
  assert.deepEqual(pantalla("ejemplo").opciones.map((o) => o.texto), preg("4 · Pregunta (sin puntaje)").match(/Opciones: (.+)\.$/)[1].split(" · "));
  /* Cada error de la v1 va con su opción. */
  const ej = pantalla("ejemplo");
  for (const o of ej.opciones.filter((x) => !x.correcta)) assert.equal(o.devolucion, citas(FILAS.find((f) => f[1].startsWith(`Error, ${o.texto}:`))[1])[0]);
  assert.equal(ej.opciones.find((o) => o.correcta).texto, "$3.570.000");
  assert.equal(pantalla("dos-clases").opciones.find((o) => o.correcta).texto, "Comercial");
  /* La ficha: los cinco datos de la v1, en su orden. */
  const ficha = FILAS.find((f) => f[1].startsWith("Ficha de cinco datos"))[1].match(/: (.+)\.$/)[1].split(" · ");
  const sinRotulo = (t) => t.replace(/^(entrega|recibe) /, "");
  assert.deepEqual(ej.ficha.map((f) => f.texto.toLowerCase()), ficha.map((t) => sinRotulo(t).toLowerCase()));
  assert.deepEqual(ej.ficha.slice(0, 2).map((f) => f.dato), ["Quién entrega", "Quién recibe"]);
  /* El asiento: sus líneas, sus lados y sus sumas; el pie del acierto, el de la v1. */
  const as = FILAS.find((f) => f[0] === "4 · Asiento")[1];
  const lineas = [...as.matchAll(/(?:\. |· )([^·.]+?) ([\d.]+) (D|H)/g)].map((m) => [m[1].trim(), Number(m[2].replace(/\./g, "")), m[3] === "D" ? A.DEBE : A.HABER]);
  assert.deepEqual(ej.acierto.asientos[0].lineas.map((l) => [l.cuenta, l.monto, l.lado]), lineas);
  assert.match(as, new RegExp(`Sumas: ${cifra(A.H1_LIBRO.sumas)} = ${cifra(A.H1_LIBRO.sumas)}\\. Pie: «${ej.acierto.pie}»`));
  assert.equal(ej.acierto.asientos[0].fecha, null);
});

test("★★★ las cifras de H-1 se recalculan desde la lista, el 15 % y las tarifas; el asiento cuadra", () => {
  const C = A.H1_LIBRO;
  const descuento = (4_200_000 * 15) / 100;
  const factura = 4_200_000 - descuento;
  const iva = (factura * 16) / 100;
  const ret = (factura * 35) / 1000;
  assert.deepEqual([C.lista, C.descuento, C.factura, C.iva, C.retencion, C.cliente], [4_200_000, descuento, factura, iva, ret, factura + iva - ret]);
  assert.equal(C.sumas, C.cliente + C.retencion);
  assert.equal(C.sumas, C.iva + C.factura);
  /* El descuento no aparece en el asiento: Ingresos por ventas va por el valor a facturar. */
  const l = pantalla("ejemplo").acierto.asientos[0].lineas;
  assert.ok(!l.some((x) => x.monto === C.lista || x.monto === C.descuento));
  assert.equal(l.find((x) => x.cuenta === "Ingresos por ventas").monto, C.factura);
});

test("★★★ regla 3: ninguna cifra de X1-X4, ni de T7-1 ni de T7-2", () => {
  const prohibidas = [800_000, 175_000, 5_625_000, 5_800_000, 6_760_000, 17_460_000, 24_220_000, 1_518_000, 22_702_000, 11_091_000, 1_200_000, 262_500, 8_437_500, 643_500, 8_700_000, 2_432_000, 532_000, 17_100_000, 384_000, 84_000, 2_700_000, 2_784_000, 17_632_000];
  const todo = JSON.stringify(P);
  const numeros = new Set([...todo.matchAll(/\d[\d.]*/g)].map((m) => Number(m[0].replace(/\./g, ""))));
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

test("★★★ se recorre entera: cada pantalla y cada estado con sus textos y su pie", async () => {
  const m = await montar();
  try {
    const c = m.caja;
    assert.equal(c.querySelector("[data-pantalla]").dataset.pantalla, "portada");
    assert.deepEqual(textos(c), [pantalla("portada").objetivo]);
    assert.equal(pie(c), pantalla("portada").pie);
    await tocar(boton(c, "empezar"));
    assert.deepEqual(textos(c), pantalla("repaso").parrafos);
    assert.equal(pie(c), pantalla("repaso").pie);
    await tocar(boton(c, "seguir"));
    /* Dos clases: el error, «Probar otra», y el acierto. */
    const dc = pantalla("dos-clases");
    assert.deepEqual(textos(c), [...dc.parrafos, dc.pregunta]);
    assert.equal(boton(c, "confirmar").getAttribute("aria-disabled"), "true");
    /* Las dos malas: la 1.ª da la pista; la 2.ª, la respuesta con su porqué (escalera de ayuda). */
    let n = 0;
    for (const o of dc.opciones.filter((x) => !x.correcta)) {
      await tocar(c.querySelector(`[data-opcion="${o.id}"]`));
      await tocar(boton(c, "confirmar"));
      assert.equal(c.querySelector("[data-mensaje]").dataset.mensaje, "error");
      const esperado = errorEsperado(dc, o, ++n);
      assert.deepEqual(textos(c).slice(-esperado.length), esperado);
      assert.equal(pie(c), dc.error.pie);
      await tocar(boton(c, "probar-otra"));
    }
    assert.equal(n, 2);
    await tocar(c.querySelector('[data-opcion="comercial"]'));
    await tocar(boton(c, "confirmar"));
    assert.deepEqual(textos(c).slice(-1), [dc.acierto.texto]);
    await tocar(boton(c, "seguir"));
    assert.deepEqual(textos(c), pantalla("no-se-registra").parrafos);
    assert.equal(pie(c), pantalla("no-se-registra").pie);
    await tocar(boton(c, "seguir"));
    /* El ejemplo: la ficha y los dos pasos antes de la pregunta; el asiento, solo con el acierto. */
    const ej = pantalla("ejemplo");
    assert.deepEqual(textos(c), [...ej.parrafos, ...ej.ficha.map((f) => f.texto), ...ej.despues, ej.pregunta]);
    assert.equal(c.querySelector("[data-asiento]") === null, true, "el asiento antes del acierto");
    let fallosEj = 0;
    for (const o of ej.opciones.filter((x) => !x.correcta)) {
      await tocar(c.querySelector(`[data-opcion="${o.id}"]`));
      await tocar(boton(c, "confirmar"));
      const esperado = errorEsperado(ej, o, ++fallosEj);
      assert.deepEqual(textos(c).slice(-esperado.length), esperado);
      assert.equal(c.querySelector("[data-asiento]") === null, true);
      await tocar(boton(c, "probar-otra"));
    }
    await tocar(c.querySelector('[data-opcion="factura"]'));
    await tocar(boton(c, "confirmar"));
    assert.deepEqual(textos(c).slice(-(4)), [ej.acierto.texto, ...ej.acierto.parrafos, ...ej.acierto.despues]);
    assert.equal(pie(c), ej.acierto.pie);
    const as = c.querySelector("[data-asiento]");
    assert.equal(as.dataset.asiento, "sin-fecha");
    assert.equal(as.querySelector("[data-fecha]") === null, true);
    assert.deepEqual([...as.querySelectorAll("[data-suma]")].map((x) => x.textContent), [cifra(A.H1_LIBRO.sumas), cifra(A.H1_LIBRO.sumas)]);
    assert.ok(!as.textContent.includes(cifra(A.H1_LIBRO.lista)) && !as.textContent.includes(cifra(A.H1_LIBRO.descuento)));
    /* El acierto descubre en orden: el texto de los impuestos, el asiento y los dos textos de después. */
    const orden = [...c.querySelectorAll("[data-eleccion] > *")].map((x) => (x.matches("[data-asiento]") ? "asiento" : x.textContent));
    const i = orden.indexOf("asiento");
    assert.equal(orden[i - 1], ej.acierto.parrafos[0]);
    assert.deepEqual(orden.slice(i + 1, i + 3), ej.acierto.despues);
    await tocar(boton(c, "seguir"));
    /* El resumen: la última pantalla, con su «Siguiente» y sin botón. */
    const r = pantalla("resumen");
    assert.deepEqual(textos(c), [...r.parrafos, r.siguiente]);
    assert.equal(pie(c), r.pie);
    assert.equal(c.querySelector("[data-boton]") === null, true);
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
  /* Sin FP: ninguna migración la nombra, y ni la pieza ni sus datos llaman al motor (la vista sí, por los Hacer). */
  const dir = new URL("supabase/migrations/", RAIZ);
  assert.deepEqual(readdirSync(dir).filter((f) => readFileSync(new URL(f, dir), "utf8").includes(A.A1_ID)), []);
  for (const f of ["src/components/mecanicas/libros/t7/PantallasT7_3.jsx", "src/data/contabilidadT7_3.js"]) {
    assert.doesNotMatch(leer(f), /from\s+["'][^"']*\/(fp|lib\/supabase)[^"']*["']|registrarActividad(Completada)?\s*\(|\.rpc\s*\(/, f);
  }
});
