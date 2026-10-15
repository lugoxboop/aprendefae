import { test } from "node:test";
import assert from "node:assert/strict";
import { readFileSync, readdirSync } from "node:fs";
import { JSDOM, VirtualConsole } from "jsdom";

/*
 * ═══════════════════════════════════════════════════════════════════════════
 * T4 · A3 «El arqueo» (Célula D) · Aprender.
 *
 *   · cada pantalla dice EXACTAMENTE los textos del paquete vigente de
 *     Katsumi (con la v2 y la v3 dentro), letra por letra, y ningún texto
 *     que la v2 o la v3 sustituyen sigue
 *   · las cifras se CALCULAN desde las de A2 y los dos efectivos del libro;
 *     los tres asientos son los del paquete, del 31 de mayo, y cuadran
 *   · la figura «El sobre contado» de Hanayama (A3 v1 + v1.2): EL MISMO
 *     sobre de A2, con la diferencia, el cálculo bajo el cheque y la tercera
 *     cuenta del libro en dos renglones; la diferencia sin coral ni signo
 *   · PH8-2: en P3, P4 y P8, mientras se pregunta y en el error, la respuesta
 *     no está en el DOM. Se lee textContent y outerHTML, nunca innerText
 *   · INFLESZ con la herramienta oficial
 *   · Aprender: sin catálogo, sin migración y sin llamar al motor de FP
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

const Z = await import("../../data/contabilidadT4A3.js");
const A2 = await import("../../data/contabilidadT4A2.js");
const { BOTON, INTERFAZ, DEBE, HABER } = await import("../../data/contabilidadT4.js");
const { SUBJECTS, APRENDER } = await import("../../data/subjects.js");
const { PantallasT4, CSS_T4S, PIEZAS_T4, TEMA_T4 } = await import("../../components/ContabilidadT4View.jsx");
const { inflesz } = await import("../../herramientas/inflesz.js");
const { leer, leerSecciones, cambiosDe, textosDeDatos, PAQUETES, RAIZ, CITA, blobEnLaRamaFuente, archivosEnLaRamaFuente, blobDeLaCopia, RAMA_FUENTE } = await import("./t4-paquete.mjs");

const V1 = leer(`${PAQUETES}d4-t4-a3-v1.md`);
const V2 = leer(`${PAQUETES}d4-t4-a3-a4-v2-cambios.md`);
const V3 = leer(`${PAQUETES}d4-t4-a3-h1-h2-v3-cambios.md`);
const P = Z.PIEZA_EL_ARQUEO;
const pantalla = (id) => P.pantallas.find((x) => x.id === id);
const S = leerSecciones(V1);

/*
 * El paquete base ES la versión vigente (ya trae la v2 y la v3). Se compara
 * contra él. Los archivos de cambios se quedan como registro: todo texto que
 * sustituyen tiene que NO estar ni en la base ni en los datos. Sus nombres
 * no siguen el patrón «d4-t4-a3-vN-cambios.md» (son de varias piezas), así
 * que la lista se mira contra la carpeta entera.
 */
const DE_A3 = ["d4-t4-a3-a4-v2-cambios.md", "d4-t4-a3-h1-h2-v3-cambios.md"];
const ES_VIGENTE = /\*\*Este archivo es la versión vigente\*\*/.test(V1);

/* La parte de A3 de la v2: las filas «v1 (revelaba) → v2» de sus tablas. */
const V2_A3 = V2.slice(V2.indexOf("# A3 «El arqueo»"), V2.indexOf("# A4 «Bancos"));
const V2_FILAS = [...V2_A3.matchAll(new RegExp(`^\\| ${CITA} \\| ${CITA}(?: \\([^)]*\\))? \\| ${CITA}`, "gm"))].map((m) => ({ opcion: m[1], viejo: m[2].replace(/^… /, "").replace(/…$/, ""), nuevo: m[3] }));
/* La parte de A3 de la v3: los «v1: «…»» con su «**v3:** «…»». */
const V3_A3 = V3.slice(V3.indexOf("## A3-1"), V3.indexOf("## H1-a"));
const V3_PARES = [...V3_A3.matchAll(new RegExp(`^- v1: ${CITA}[^\\n]*\\n- \\*\\*v3:?\\*\\*[^«\\n]*${CITA}`, "gm"))].map((m) => ({ viejo: m[1], nuevo: m[2] }));

const IDS = ["portada", "que-se-cuenta", "cuando-no-cuadra", "el-sobrante", "el-cheque", "el-asiento", "el-faltante", "dos-caminos", "camino-1", "camino-2", "resumen"];
const PAQUETE = IDS.map((id, k) => ({ id, ...S[`P${k}`] }));

function tablasDe(bloque) {
  const tablas = [];
  let actual = null;
  for (const l of bloque.split("\n")) {
    if (/^\s*\|/.test(l)) {
      const celdas = l.trim().split("|").slice(1, -1).map((c) => c.trim().replace(/^\*\*(.*)\*\*$/, "$1"));
      if (!actual) { actual = { cabecera: celdas, filas: [] }; tablas.push(actual); } else if (!/^-+$/.test(celdas[0])) actual.filas.push(celdas);
    } else actual = null;
  }
  return tablas.filter((t) => t.cabecera[0] !== "Opción");
}
const tablaDe = (id) => tablasDe(PAQUETE.find((x) => x.id === id).bloque);

/* ═══════════ 1 · EL TEXTO, CONTRA EL PAQUETE ═══════════ */

test("★★★ el paquete base es la versión vigente; la v2 y la v3 están dentro y ningún texto que sustituyen sigue", () => {
  assert.ok(ES_VIGENTE, "el paquete base de A3 no dice que es la versión vigente");
  assert.match(V1, /ya incluye la parte de A3 de `d4-t4-a3-a4-v2-cambios\.md` y de `d4-t4-a3-h1-h2-v3-cambios\.md`/);
  const conA3 = readdirSync(new URL(PAQUETES, RAIZ)).filter((f) => /^d4-t4-.*a3.*-cambios\.md$/.test(f));
  assert.deepEqual(conA3.sort(), DE_A3, "hay un archivo de cambios de A3 que esta pieza no ha mirado todavía");
  assert.deepEqual(cambiosDe("a3"), [], "un archivo de cambios con el nombre de A3 a secas: míralo");
  /* La guarda: lo que la lectura encontró, contado (dos errores en P3, dos en P4, dos en P8; A3-1 y A3-2 en la v3). */
  assert.deepEqual([V2_FILAS.length, V3_PARES.length], [6, 2], "la lectura de la v2 o la v3 no encontró sus cambios");
  const datos = P.pantallas.flatMap(textosDeDatos);
  const base = PAQUETE.flatMap((x) => x.textos);
  for (const { viejo, nuevo } of [...V2_FILAS, ...V3_PARES]) {
    assert.ok(viejo.length > 15, `un texto viejo leído demasiado corto: «${viejo}»`);
    assert.ok(!datos.some((t) => t.includes(viejo)), `los datos traen un texto viejo: «${viejo}»`);
    assert.ok(!base.some((t) => t.includes(viejo)), `el paquete base trae un texto viejo: «${viejo}»`);
    assert.ok(datos.includes(nuevo), `los datos no traen el texto nuevo «${nuevo.slice(0, 40)}…»`);
    assert.ok(base.includes(nuevo), `la base no trae el texto nuevo «${nuevo.slice(0, 40)}…»`);
  }
  /* Cada error de la v2 es el de su opción. */
  for (const f of V2_FILAS) {
    const o = P.pantallas.flatMap((p) => p.opciones ?? []).find((x) => x.texto === f.opcion.replace(/\.$/, "") || x.texto === f.opcion);
    assert.ok(o, `la v2 nombra una opción que no existe: «${f.opcion}»`);
    assert.equal(o.devolucion, f.nuevo, `${o.id}: el error no es el de la v2`);
  }
  /* A3-1: ni «girar» antes de A4. C5: «sobrante» y «faltante» nunca a secas. I2: sin «aprovechamientos». */
  assert.doesNotMatch(datos.join("\n"), /\bgir(a|ar|ó)\b|aprovechamiento/i);
  for (const t of datos) {
    for (const m of t.matchAll(/\b(sobrante|faltante)\b/gi)) {
      assert.match(t.slice(m.index), /^(sobrante|faltante) de caja menor/i, `«${m[0]}» a secas en «${t.slice(0, 50)}…»`);
    }
  }
});

test("★★★ la copia del paquete de A3 es la de la punta de la rama de Katsumi (si este clon la tiene)", (t) => {
  if (!archivosEnLaRamaFuente()) { t.skip(`este clon no tiene ${RAMA_FUENTE}`); return; }
  for (const f of ["d4-t4-a3-v1.md", ...DE_A3]) assert.equal(blobDeLaCopia(f), blobEnLaRamaFuente(f), `${f}: la copia no es la de la punta de ${RAMA_FUENTE}`);
});

test("★★★ las 11 pantallas, en el orden del paquete; título e id", () => {
  assert.equal(Object.keys(S).length, 11, "el paquete vigente no trae sus once pantallas P0-P10");
  assert.deepEqual(P.pantallas.map((x) => x.id), IDS);
  assert.equal(P.titulo, V1.match(/- Título: «([^»]+)»/)[1]);
  assert.equal(P.id, "t4-a3-el-arqueo");
  assert.equal(P.numero, 3);
});

for (const { id, textos, pies } of PAQUETE) {
  test(`★★★ ${id}: los textos son los del paquete, letra por letra, ni uno más ni uno menos`, () => {
    assert.ok(textos.length >= 1, `${id}: no se leyó ningún texto del paquete`);
    const p = pantalla(id);
    /* Las opciones sin medida (cifras y nombres de cuenta) se miran en la prueba de las preguntas. */
    const datos = textosDeDatos(p).filter((t) => !(p.opciones ?? []).some((o) => o.texto === t && !textos.includes(t)));
    assert.deepEqual([...datos].sort(), [...textos].sort());
    assert.equal(pies.length >= 1 ? pies[0] : null, p.pie ?? null, `${id}: pie`);
    for (const x of pies) assert.ok([p.pie, p.acierto?.pie, p.error?.pie].includes(x), `${id}: pie «${x}»`);
  });
}

test("★★★ las opciones de las tres preguntas son las del paquete, con su retroalimentación y una sola correcta", () => {
  for (const id of ["el-sobrante", "el-cheque", "camino-1"]) {
    const bloque = PAQUETE.find((x) => x.id === id).bloque;
    const filas = [...bloque.matchAll(new RegExp(`^\\| ${CITA}(?: \\([^)]*\\))? \\| (sí|no) \\| ${CITA}`, "gm"))].map((m) => [m[1], m[2] === "sí", m[3]]);
    assert.equal(filas.length, 3, `${id}: no se leyeron las tres opciones del paquete`);
    const p = pantalla(id);
    assert.deepEqual(p.opciones.map((o) => [o.texto, Boolean(o.correcta), o.correcta ? p.acierto.texto : o.devolucion]), filas);
  }
});

/*
 * Los textos de interfaz de la figura, revisados por Katsumi (#181): la
 * sección «Textos de interfaz…» del paquete base es su fuente. Dos los
 * cambió (CAMBIA): p5-asiento y p6-faltante.
 */
const INTERFAZ_A3 = (() => {
  const i = V1.indexOf("## Textos de interfaz de la figura");
  return i < 0 ? "" : V1.slice(i, V1.indexOf("\n## ", i + 5) > 0 ? V1.indexOf("\n## ", i + 5) : undefined);
})();
test("★★★ los textos de interfaz son los que aprobó Katsumi en el paquete, con sus dos cambios (p5-asiento y p6-faltante)", () => {
  assert.ok(INTERFAZ_A3.length > 500, "el paquete de A3 no trae la sección de textos de interfaz revisados");
  const citas = new Set([...INTERFAZ_A3.matchAll(new RegExp(CITA, "g"))].map((m) => m[1]));
  /* «  - *p1-cuadra:* «…»», «  - *p3-respuesta* y *p4-colocando:* «…»» o «  - *p5-asiento,* **CAMBIA:** «…»». */
  const alt = [...INTERFAZ_A3.matchAll(new RegExp(`^  - \\*([a-z0-9-]+)[:,]?\\*(?: y \\*([a-z0-9-]+)[:,]?\\*)?[^«\\n]*${CITA}`, "gm"))].flatMap((m) => [[m[1], m[3]], ...(m[2] ? [[m[2], m[3]]] : [])]);
  assert.equal(alt.length, 10, "no se leyeron los diez textos alternativos del paquete");
  for (const [estado, texto] of alt) assert.equal(Z.ALT_SOBRE_A3[estado], texto, `alternativo de ${estado}`);
  assert.deepEqual(Object.keys(Z.ALT_SOBRE_A3).sort(), alt.map(([e]) => e).sort());
  /* Los dos que Katsumi cambió. */
  assert.match(INTERFAZ_A3, /\*p5-asiento,\* \*\*CAMBIA:\*\*/);
  assert.match(Z.ALT_SOBRE_A3["p6-faltante"], /El cheque sale de Bancos por 484\.800/);
  for (const t of [...Object.values(Z.NOMBRE_ASIENTO_A3), ...Object.values(Z.FIGURA_SOBRE_A3.diferencias)]) assert.ok(citas.has(t), `«${t}» no está entre los textos aprobados`);
  /* Y el alternativo de p5 pasa de 65, contado bien. */
  assert.ok(inflesz(Z.ALT_SOBRE_A3["p5-asiento"]).cumple, "el alternativo de p5-asiento no pasa de 65");
  assert.doesNotMatch(leer("src/data/contabilidadT4A3.js"), /PENDIENTE DE REVISIÓN/);
});

/* ═══════════ 2 · LAS CIFRAS SE CALCULAN, Y LOS ASIENTOS SON LOS DEL PAQUETE ═══════════ */

const num = (t) => (t ? Number(t.replace(/\./g, "")) : null);

test("★★★ las cifras se calculan desde las de A2 y los dos efectivos del libro, y dan las del paquete", () => {
  const tabla = V1.slice(V1.indexOf("## Cifras y cadena"), V1.indexOf("## Términos"));
  const dato = (c) => num(tabla.match(new RegExp(`^\\| ${c.replace(".", "\\.")} \\|`, "m"))?.[0].slice(2, -2));
  for (const [nombre, v] of Object.entries({ SUMA_SOBRANTE: 502_100, SOBRANTE: 2_100, CHEQUE_SOBRANTE: 476_000, SUMA_FALTANTE: 493_300, FALTANTE: 6_700, CHEQUE_FALTANTE: 484_800, CHEQUE_CON_DIFERENCIA: 480_200 })) {
    assert.equal(Z[nombre], v, nombre);
    assert.equal(dato(String(v).replace(/\B(?=(\d{3})+(?!\d))/g, ".")), v, `${nombre}: ${v} no está en la tabla de cifras del paquete`);
  }
  assert.deepEqual([Z.EFECTIVO_SOBRANTE, Z.EFECTIVO_FALTANTE], [24_000, 15_200]);
  /* De A2, solo como dato: se importan, no se repiten. */
  const fuente = leer("src/data/contabilidadT4A3.js");
  assert.match(fuente, /import \{ FONDO, GASTADO, QUEDA, FIGURA_SOBRE \} from "\.\/contabilidadT4A2\.js";/);
  assert.doesNotMatch(fuente, /\b(500_?000|478_?100|21_?900|502_?100|2_?100|476_?000|493_?300|6_?700|484_?800|480_?200)\b/, "una cifra calculada o de A2 escrita a mano");
  /* Las cifras de los textos son las del paquete, y ninguna otra. */
  const cifras = new Set(P.pantallas.flatMap(textosDeDatos).flatMap((t) => [...t.matchAll(/\$\d{1,3}(?:\.\d{3})*/g)].map((m) => m[0])));
  assert.deepEqual([...cifras].sort(), ["$15.200", "$2.100", "$21.900", "$24.000", "$476.000", "$478.100", "$480.200", "$484.800", "$493.300", "$500.000", "$502.100", "$6.700"]);
});

test("★★★ los tres asientos son las tablas del paquete, del 31 de mayo, y cuadran; el de P8 sale solo con el acierto", () => {
  const filas = (a) => a.lineas.map((l) => [l.cuenta, l.lado === DEBE ? String(l.monto).replace(/\B(?=(\d{3})+(?!\d))/g, ".") : "", l.lado === HABER ? String(l.monto).replace(/\B(?=(\d{3})+(?!\d))/g, ".") : ""]);
  for (const [id, a] of [["el-asiento", Z.ASIENTO_SOBRANTE], ["camino-1", Z.ASIENTO_FALTANTE_EMPLEADO], ["camino-2", Z.ASIENTO_FALTANTE_GASTO]]) {
    const [t] = tablaDe(id);
    assert.deepEqual(t.cabecera, ["Fecha", "Cuenta", "Debe", "Haber"], `${id}: no se leyó el asiento del paquete`);
    assert.equal(a.fecha, t.filas[0][0]);
    assert.equal(a.fecha, "31 de mayo", `${id}: D4-2, el reembolso es del 31 de mayo`);
    assert.deepEqual(filas(a), t.filas.map((f) => f.slice(1)), `${id}: el asiento no es el del paquete`);
    const suma = (lado) => a.lineas.filter((l) => l.lado === lado).reduce((s, l) => s + l.monto, 0);
    assert.equal(suma(DEBE), suma(HABER), `${a.nombre}: no cuadra`);
  }
  assert.deepEqual(pantalla("el-asiento").asientos, [Z.ASIENTO_SOBRANTE]);
  assert.deepEqual(pantalla("camino-1").trasAcertar.asientos, [Z.ASIENTO_FALTANTE_EMPLEADO]);
  assert.equal(pantalla("camino-1").asientos, undefined, "el asiento de P8 es la respuesta: solo con el acierto");
  assert.deepEqual(pantalla("camino-2").asientos, [Z.ASIENTO_FALTANTE_GASTO]);
  /* D4-3 y D4-8: «operacionales», y Cuentas por cobrar – empleados al debe. */
  assert.ok(!JSON.stringify(P).includes("operacinales"));
  assert.equal(Z.ASIENTO_FALTANTE_EMPLEADO.lineas[1].lado, DEBE);
});

test("★★ INFLESZ con la herramienta oficial: todo texto de 10 palabras o más da 65 o más, y lo que dice el paquete", () => {
  const textos = P.pantallas.flatMap(textosDeDatos);
  const medidos = textos.map((t) => ({ t, r: inflesz(t) })).filter((x) => x.r.aplica);
  assert.ok(medidos.length >= 30, `solo ${medidos.length} textos de 10 palabras o más`);
  assert.deepEqual(medidos.filter((x) => !x.r.cumple).map((x) => `${x.r.valor} · ${x.t}`), []);
  assert.deepEqual(textos.filter((t) => inflesz(t).desconocidas.length > 0), [], "hay letras que la herramienta no sabe contar");
  let cotejados = 0;
  for (const { t, r } of medidos) {
    const m = V1.match(new RegExp(`«${t.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")}»\\s*\\((\\d+,\\d)`));
    if (m) { cotejados++; assert.equal(r.valor, Number(m[1].replace(",", ".")), `INFLESZ de «${t.slice(0, 40)}…»`); }
  }
  assert.ok(cotejados >= 25, `solo se cotejaron ${cotejados} medidas`);
});

/* ═══════════ 3 · LO QUE SE VE ═══════════ */

function montar() {
  const caja = document.createElement("div");
  document.body.appendChild(caja);
  const raiz = createRoot(caja);
  act(() => raiz.render(h(PantallasT4, { pieza: P, rotulo: "EFECTIVO, CAJA MENOR Y BANCOS · APRENDER" })));
  return { caja, desmontar: () => { act(() => raiz.unmount()); caja.remove(); } };
}
const tocar = (el) => act(() => { el.dispatchEvent(new w.MouseEvent("click", { bubbles: true })); });
const visibles = (c) => [...c.querySelectorAll("[data-pieza] [data-texto]")].map((x) => x.textContent);
const boton = (c, nombre) => c.querySelector(`[data-boton="${nombre}"]`);
const pie = (c) => c.querySelector("[data-pie]").textContent;
const figura = (c) => c.querySelector('[data-figura="sobre"]');
const INTERFAZ_MARCADA = new Set([...Object.values(BOTON), ...Object.values(INTERFAZ)]);
const sinEstilo = (html) => html.replace(/ style="[^"]*"/g, "");

function irA(c, id) {
  for (let n = 0; n < 20 && c.querySelector("[data-pieza]").dataset.pantalla !== id; n++) {
    const el = c.querySelector("[data-eleccion]");
    if (el) {
      const p = pantalla(el.dataset.eleccion);
      tocar(c.querySelector(`[data-opcion="${p.opciones.find((o) => o.correcta).id}"]`));
      tocar(boton(c, "confirmar"));
      tocar(boton(c, "seguir"));
    } else tocar(boton(c, "empezar") ?? boton(c, "seguir"));
  }
  assert.equal(c.querySelector("[data-pieza]").dataset.pantalla, id, `no se llegó a «${id}»`);
}

test("★★★ cada pantalla de lectura muestra sus textos en orden, su pie y su botón; fuera de figura y asientos, nada que no venga del paquete", () => {
  const m = montar();
  try {
    const lecturas = P.pantallas.filter((p) => p.tipo !== "eleccion");
    assert.equal(lecturas.length, 8);
    for (const p of lecturas) {
      irA(m.caja, p.id);
      assert.deepEqual(visibles(m.caja), textosDeDatos(p), `${p.id}: textos en pantalla`);
      assert.equal(pie(m.caja), p.pie, `${p.id}: pie`);
      assert.deepEqual([...m.caja.querySelectorAll("[data-boton]")].map((b) => b.textContent), p.id === "resumen" ? [] : [p.tipo === "portada" ? "Empezar" : "Seguir"], `${p.id}: botones`);
      const sueltos = [...m.caja.querySelectorAll("[data-pieza] *")]
        .filter((el) => !el.matches("style") && !el.closest("[data-figura], [data-asiento]") && [...el.childNodes].some((x) => x.nodeType === 3 && x.textContent.trim()))
        .map((el) => el.textContent.trim());
      assert.deepEqual(sueltos.filter((t) => !textosDeDatos(p).includes(t) && t !== p.pie && !INTERFAZ_MARCADA.has(t)), [], `${p.id}: texto en pantalla que no viene del paquete`);
    }
  } finally { m.desmontar(); }
});

for (const id of ["el-sobrante", "el-cheque", "camino-1"]) {
  test(`★★★ ${id}: cada opción equivocada muestra «Incorrecto.» y SU retroalimentación, sin revelar; lo de después del acierto sale solo con el acierto`, () => {
    const p = pantalla(id);
    const m = montar();
    try {
      irA(m.caja, id);
      assert.equal(m.caja.querySelector("[data-pregunta]").textContent, p.pregunta);
      const tras = p.trasAcertar?.textos ?? [];
      const sinTras = (cuando) => {
        const html = m.caja.querySelector("[data-pieza]").outerHTML;
        for (const t of tras) assert.ok(!html.includes(t), `${cuando}: el DOM ya trae «${t.slice(0, 40)}…»`);
        assert.equal(m.caja.querySelectorAll("[data-asiento]").length, 0, `${cuando}: hay un asiento antes del acierto`);
      };
      sinTras("colocando");
      for (const o of p.opciones.filter((x) => !x.correcta)) {
        tocar(m.caja.querySelector(`[data-opcion="${o.id}"]`));
        tocar(boton(m.caja, "confirmar"));
        const msg = m.caja.querySelector('[data-mensaje="error"]');
        assert.equal(msg.querySelector("[data-palabra]").textContent, "Incorrecto.");
        assert.equal(msg.querySelector("[data-devolucion]").textContent, o.devolucion, `${o.id}: retroalimentación`);
        assert.ok(m.caja.querySelector(`[data-opcion="${o.id}"]`).classList.contains("t4p-op-error"));
        assert.equal(pie(m.caja), p.error.pie);
        /* v2: el error no nombra la correcta, ni su cifra, ni su cuenta. */
        const correcta = p.opciones.find((x) => x.correcta).texto.replace(/\.$/, "");
        assert.ok(!msg.textContent.includes(correcta), `${o.id}: el error revela la respuesta`);
        sinTras(`error ${o.id}`);
        tocar(boton(m.caja, "probar-otra"));
      }
      tocar(m.caja.querySelector(`[data-opcion="${p.opciones.find((o) => o.correcta).id}"]`));
      tocar(boton(m.caja, "confirmar"));
      assert.equal(m.caja.querySelector('[data-mensaje="acierto"] [data-devolucion]').textContent, p.acierto.texto);
      assert.equal(m.caja.querySelector(".t4p-op-error"), null, "el coral es solo para el error");
      assert.deepEqual(visibles(m.caja), textosDeDatos(p).filter((t) => !p.opciones.some((o) => o.texto === t || (!o.correcta && o.devolucion === t))), "acierto: textos en pantalla");
      if (id === "camino-1") {
        const as = m.caja.querySelector("[data-asiento]");
        assert.equal(as.querySelector("[data-fecha]").textContent, "31 de mayo");
        assert.deepEqual([...as.querySelectorAll("[data-linea]")].map((l) => [l.dataset.linea, l.dataset.lado]), [["Gastos generales", "debe"], ["Cuentas por cobrar – empleados", "debe"], ["Bancos", "haber"]]);
      }
    } finally { m.desmontar(); }
  });
}

/* ═══════════ 4 · LA FIGURA: «EL SOBRE CONTADO» ═══════════ */

const montoDe = (f, id) => f.querySelector(`[data-fila="${id}"] .t4sb-monto`)?.textContent ?? null;
const enfocados = (f) => [...f.querySelectorAll(".t4sb-foco")].map((x) => x.dataset.monto).sort();
const libro = (f) => [...f.querySelectorAll("[data-cuenta]")].map((c) => [c.dataset.cuenta, c.querySelector("[data-monto]").textContent]);
const huecos = (f) => [...f.querySelectorAll("[data-hueco]")].map((x) => x.dataset.hueco).sort();

test("★★★ la figura va solo donde la pide Hanayama, en su estado; P3, P4 y P8 dependen del acierto, no de haber respondido", () => {
  assert.deepEqual(P.pantallas.filter((p) => p.figura).map((p) => [p.id, p.figura.estado ?? p.figura.estados]), [
    ["que-se-cuenta", "p1-cuadra"],
    ["el-sobrante", { colocando: "p3-colocando", error: "p3-colocando", acierto: "p3-respuesta" }],
    ["el-cheque", { colocando: "p4-colocando", error: "p4-colocando", acierto: "p4-respuesta" }],
    ["el-asiento", "p5-asiento"],
    ["el-faltante", "p6-faltante"],
    ["camino-1", { colocando: "p8-colocando", error: "p8-colocando", acierto: "p8-respuesta" }],
    ["camino-2", "p9-gasto"],
  ]);
  assert.deepEqual(P.pantallas.filter((p) => !p.figura).map((p) => p.id), ["portada", "cuando-no-cuadra", "dos-caminos", "resumen"]);
  for (const p of P.pantallas.filter((x) => x.figura)) assert.equal(p.figura.tipo, "sobre-a3");
  const m = montar();
  try {
    for (const p of P.pantallas.filter((x) => x.tipo !== "eleccion")) {
      irA(m.caja, p.id);
      assert.equal(m.caja.querySelectorAll("[data-figura]").length, p.figura ? 1 : 0, `${p.id}: figura`);
      if (p.figura) {
        assert.equal(figura(m.caja).dataset.estado, p.figura.estado);
        assert.equal(figura(m.caja).querySelector("figcaption").textContent, Z.ALT_SOBRE_A3[p.figura.estado]);
      }
    }
  } finally { m.desmontar(); }
});

test("★★★ es el MISMO sobre de A2: las mismas filas, la misma solapa, el mismo «Suman» y el mismo cheque en dos renglones", () => {
  const m = montar();
  try {
    irA(m.caja, "el-faltante");
    const f = figura(m.caja);
    assert.deepEqual([...f.querySelectorAll("[data-sobre] [data-fila]")].map((x) => x.dataset.fila), ["fondo", "billetes", "soportes", "suman", "diferencia"]);
    assert.deepEqual([...f.querySelectorAll("[data-sobre] .t4sb-nom")].map((x) => x.textContent), [A2.FIGURA_SOBRE.fondo, A2.FIGURA_SOBRE.billetes, A2.FIGURA_SOBRE.soportes, A2.FIGURA_SOBRE.suman, "Faltante de caja menor"]);
    assert.ok(f.querySelector("svg.t4sb-solapa"));
    const ch = f.querySelector("[data-cheque]");
    assert.deepEqual([...ch.children[0].children].map((x) => x.textContent), ["Cheque", "484.800"]);
    assert.equal(ch.children[1].textContent, "sale de Bancos");
    /* Lo que A3 añade son datos, no una copia del dibujo. */
    const vista = leer("src/components/ContabilidadT4View.jsx");
    assert.equal(vista.match(/export function SobreCajaMenor/g).length, 1);
    assert.match(vista, /"sobre-a3": \{ estados: ESTADOS_SOBRE_A3, alt: ALT_SOBRE_A3, F: FIGURA_SOBRE_A3 \}/);
  } finally { m.desmontar(); }
});

test("★★★ el cálculo bajo el cheque: efectivo + cheque = fondo, en P4 y en P6; el cheque se calcula contra el fondo, no contra los gastos", () => {
  const m = montar();
  try {
    irA(m.caja, "el-cheque");
    tocar(m.caja.querySelector('[data-opcion="menos"]'));
    tocar(boton(m.caja, "confirmar"));
    let f = figura(m.caja);
    assert.equal(f.dataset.estado, "p4-respuesta");
    assert.equal(f.querySelector("[data-calculo]").textContent, "24.000 + 476.000 = 500.000");
    assert.equal(f.querySelector("[data-calculo] b").textContent, "500.000");
    tocar(boton(m.caja, "seguir"));
    irA(m.caja, "el-faltante");
    f = figura(m.caja);
    assert.equal(f.querySelector("[data-calculo]").textContent, "15.200 + 484.800 = 500.000");
    assert.deepEqual([montoDe(f, "billetes"), montoDe(f, "soportes"), montoDe(f, "suman"), montoDe(f, "diferencia")], ["15.200", "478.100", "493.300", "6.700"]);
    assert.equal(f.querySelector("[data-fila='diferencia']").dataset.diferencia, "faltante");
    assert.equal(f.querySelector("[data-libro]"), null, "P6 no tiene libro: el texto tampoco da el asiento");
    /* Las dos líneas del cálculo dan el mismo fondo. */
    for (const s of [Z.ESTADOS_SOBRE_A3["p4-respuesta"], Z.ESTADOS_SOBRE_A3["p6-faltante"]]) assert.equal(s.calculo.efectivo + s.cheque, A2.FONDO);
  } finally { m.desmontar(); }
});

test("★★★ PH8-2 · P3: mientras pregunta y en cada error, ni 502.100 ni la diferencia están en el DOM; guardan su sitio; con el acierto aparecen", () => {
  const p = pantalla("el-sobrante");
  const m = montar();
  try {
    irA(m.caja, "el-sobrante");
    const comoColocando = (cuando) => {
      const f = figura(m.caja);
      assert.equal(f.dataset.estado, "p3-colocando", cuando);
      for (const t of ["502.100", "2.100", "Sobrante de caja menor", "Faltante de caja menor", "Diferencia", "Suman"]) assert.ok(!f.outerHTML.includes(t), `${cuando}: el DOM de la figura ya trae «${t}»`);
      assert.deepEqual(huecos(f), ["diferencia", "suman"]);
      for (const hu of f.querySelectorAll("[data-hueco]")) { assert.equal(hu.textContent.trim(), ""); assert.equal(hu.getAttribute("aria-hidden"), "true"); }
      assert.deepEqual([montoDe(f, "billetes"), montoDe(f, "soportes"), montoDe(f, "fondo")], ["24.000", "478.100", "500.000"]);
      return sinEstilo(f.outerHTML);
    };
    const enColocando = comoColocando("colocando");
    for (const o of p.opciones.filter((x) => !x.correcta)) {
      tocar(m.caja.querySelector(`[data-opcion="${o.id}"]`));
      tocar(boton(m.caja, "confirmar"));
      assert.equal(comoColocando(`error ${o.id}`), enColocando, `error ${o.id}: la figura cambió`);
      tocar(boton(m.caja, "probar-otra"));
    }
    tocar(m.caja.querySelector('[data-opcion="sobrante"]'));
    tocar(boton(m.caja, "confirmar"));
    const f = figura(m.caja);
    assert.equal(f.dataset.estado, "p3-respuesta");
    assert.deepEqual([montoDe(f, "suman"), montoDe(f, "diferencia")], ["502.100", "2.100"]);
    assert.equal(f.querySelector("[data-fila='diferencia'] .t4sb-nom").textContent, "Sobrante de caja menor");
    assert.deepEqual(enfocados(f), ["diferencia", "suman"]);
    assert.deepEqual(huecos(f), []);
  } finally { m.desmontar(); }
});

test("★★★ PH8-2 · P4: mientras pregunta y en cada error, el cheque, su cálculo y el tubo guardan su sitio sin 476.000; con el acierto aparecen", () => {
  const p = pantalla("el-cheque");
  const m = montar();
  try {
    irA(m.caja, "el-cheque");
    const comoColocando = (cuando) => {
      const f = figura(m.caja);
      assert.equal(f.dataset.estado, "p4-colocando", cuando);
      for (const t of ["476.000", "480.200", "Cheque", "sale de Bancos"]) assert.ok(!f.outerHTML.includes(t), `${cuando}: el DOM de la figura ya trae «${t}»`);
      const hu = f.querySelector('[data-hueco="cheque"]');
      assert.ok(hu, `${cuando}: el cheque no guarda su sitio`);
      assert.equal(hu.textContent.trim(), "");
      assert.ok(hu.querySelector(".t4sb-calc") && hu.querySelector(".t4sb-tubo"), `${cuando}: el hueco no tiene la forma del cheque con su cálculo y su tubo`);
      assert.equal(f.querySelector("[data-cheque], [data-calculo]"), null);
      /* El sobre es el del acierto de P3: al llegar no cambia nada. */
      assert.deepEqual([montoDe(f, "suman"), montoDe(f, "diferencia")], ["502.100", "2.100"]);
      return sinEstilo(f.outerHTML);
    };
    const enColocando = comoColocando("colocando");
    for (const o of p.opciones.filter((x) => !x.correcta)) {
      tocar(m.caja.querySelector(`[data-opcion="${o.id}"]`));
      tocar(boton(m.caja, "confirmar"));
      assert.equal(comoColocando(`error ${o.id}`), enColocando, `error ${o.id}: la figura cambió`);
      tocar(boton(m.caja, "probar-otra"));
    }
  } finally { m.desmontar(); }
});

test("★★★ PH8-2 · P8: mientras pregunta y en cada error, el libro guarda su sitio de tres filas SIN su contenido; con el acierto aparece Cuentas por cobrar – empleados", () => {
  const p = pantalla("camino-1");
  const m = montar();
  try {
    irA(m.caja, "camino-1");
    const comoColocando = (cuando) => {
      const f = figura(m.caja);
      assert.equal(f.dataset.estado, "p8-colocando", cuando);
      const oculto = f.querySelector('[data-libro="oculto"]');
      assert.ok(oculto, `${cuando}: el libro no guarda su sitio`);
      assert.equal(oculto.textContent.trim(), "");
      for (const t of ["Cuentas por cobrar", "empleados", "Gastos no operacionales", "Ingresos no operacionales", "6.700", "Caja menor", "LO QUE DICE EL LIBRO"]) assert.ok(!oculto.outerHTML.includes(t), `${cuando}: el hueco del libro ya trae «${t}»`);
      /* La forma es la de la respuesta: tres cuentas, la primera con su nota y la tercera en dos renglones. */
      assert.equal(oculto.querySelectorAll(".t4sb-cta").length, 3);
      assert.deepEqual([...oculto.querySelectorAll(".t4sb-cta")].map((c) => [c.querySelectorAll(".t4sb-nota").length, c.querySelectorAll(".t4sb-cta-n").length]), [[1, 1], [0, 1], [0, 2]]);
      assert.ok(!f.outerHTML.includes("Cuentas por cobrar"), `${cuando}: la figura ya trae la cuenta`);
      return sinEstilo(f.outerHTML);
    };
    const enColocando = comoColocando("colocando");
    for (const o of p.opciones.filter((x) => !x.correcta)) {
      tocar(m.caja.querySelector(`[data-opcion="${o.id}"]`));
      tocar(boton(m.caja, "confirmar"));
      assert.equal(comoColocando(`error ${o.id}`), enColocando, `error ${o.id}: la figura cambió`);
      tocar(boton(m.caja, "probar-otra"));
    }
    tocar(m.caja.querySelector('[data-opcion="cxc-empleados"]'));
    tocar(boton(m.caja, "confirmar"));
    const f = figura(m.caja);
    assert.deepEqual(libro(f), [["caja-menor", "500.000"], ["gastos-generales", "478.100"], ["cxc-empleados", "6.700"]]);
    assert.deepEqual([...f.querySelectorAll('[data-cuenta="cxc-empleados"] .t4sb-cta2 > span')].map((x) => x.textContent), ["Cuentas por cobrar", "– empleados6.700"]);
    assert.deepEqual(enfocados(f), ["cxc-empleados"]);
  } finally { m.desmontar(); }
});

test("★★★ entre P8 y P9 el 6.700 no se mueve: misma fila, misma posición; solo cambia el nombre de la cuenta", () => {
  const filaDe = (estado) => Z.ESTADOS_SOBRE_A3[estado].libro.filas.map((f) => [f.id, f.monto]);
  assert.deepEqual(filaDe("p8-respuesta").slice(0, 2), filaDe("p9-gasto").slice(0, 2));
  assert.deepEqual([filaDe("p8-respuesta")[2][1], filaDe("p9-gasto")[2][1]], [Z.FALTANTE, Z.FALTANTE]);
  assert.deepEqual([filaDe("p8-respuesta")[2][0], filaDe("p9-gasto")[2][0]], ["cxc-empleados", "gastos-faltante"]);
  const m = montar();
  try {
    irA(m.caja, "camino-2");
    const f = figura(m.caja);
    assert.deepEqual(libro(f), [["caja-menor", "500.000"], ["gastos-generales", "478.100"], ["gastos-faltante", "6.700"]]);
    assert.deepEqual([...f.querySelectorAll('[data-cuenta="gastos-faltante"] .t4sb-cta2 > span')].map((x) => x.textContent), ["Gastos no operacionales", "– faltante de caja menor6.700"]);
  } finally { m.desmontar(); }
});

test("★★★ v1.2 · en P1, «Diferencia · 0» guarda su sitio oculta; «Suman 500.000» va señalada", () => {
  const m = montar();
  try {
    irA(m.caja, "que-se-cuenta");
    const f = figura(m.caja);
    assert.deepEqual([montoDe(f, "billetes"), montoDe(f, "soportes"), montoDe(f, "suman")], ["21.900", "478.100", "500.000"]);
    assert.deepEqual(enfocados(f), ["suman"]);
    assert.deepEqual(huecos(f), ["diferencia"]);
    assert.ok(!f.outerHTML.includes("Diferencia"), "P1 no habla de diferencia todavía");
    assert.equal(f.querySelector("[data-cheque], [data-libro]"), null);
  } finally { m.desmontar(); }
});

test("★★★ P5: el sobre repuesto y el libro con las tres cuentas; Caja menor sigue en 500.000; la diferencia sin coral ni signo", () => {
  const m = montar();
  try {
    irA(m.caja, "el-asiento");
    const f = figura(m.caja);
    assert.deepEqual([montoDe(f, "billetes"), montoDe(f, "soportes"), montoDe(f, "suman")], ["500.000", "0", "500.000"]);
    assert.deepEqual(libro(f), [["caja-menor", "500.000"], ["gastos-generales", "478.100"], ["ingresos-sobrante", "2.100"]]);
    assert.equal(f.querySelector('[data-cuenta="caja-menor"] [data-nota]').textContent, "no aparece en el reembolso");
    assert.doesNotMatch(f.textContent, /[+−-]\s?\d|\$|DEBE|HABER|Debe|Haber|✓/, "un signo, un «$» o un lado dentro de la figura");
  } finally { m.desmontar(); }
  const fig = CSS_T4S.slice(CSS_T4S.indexOf("/* sobre y libro */"));
  assert.doesNotMatch(fig, /#2A9D8F|#E9C46A|#E76F51|dashed|dotted|border-radius: 50%/i);
  for (const clase of ["t4sb-calc", "t4sb-cta-n2"]) assert.match(fig, new RegExp(`\\.${clase} \\{[^}]*white-space: nowrap;`), `.${clase} se puede partir`);
  assert.match(fig, /\.t4sb-cta2 > span:first-child \{[^}]*white-space: nowrap;/);
});

/* ═══════════ 5 · APRENDER NO DA FP ═══════════ */

test("★★★ fuera del catálogo de FP: Aprender en subjects.js, justo después de H3; ninguna migración la nombra, y sus datos no llaman al motor", () => {
  const tema = SUBJECTS.contabilidad.topics.find((t) => t.id === TEMA_T4);
  const ids = tema.actividades.map((a) => a.id);
  assert.equal(ids.indexOf(Z.A3_ID), ids.indexOf("t4-se-mueve-la-caja-menor") + 1, "A3 no va justo después de H3");
  const a = tema.actividades.find((x) => x.id === Z.A3_ID);
  assert.deepEqual(a.clasificacion, { tipo: APRENDER });
  assert.equal(a.nombre, P.titulo);
  assert.equal(PIEZAS_T4.find((x) => x.pieza.id === Z.A3_ID).pieza, P);
  const dir = new URL("supabase/migrations/", RAIZ);
  const migraciones = readdirSync(dir);
  assert.ok(migraciones.includes("0001_profiles.sql"));
  assert.deepEqual(migraciones.filter((f) => readFileSync(new URL(f, dir), "utf8").includes(Z.A3_ID)), []);
  assert.doesNotMatch(leer("src/data/contabilidadT4A3.js"), /from\s+["'][^"']*\/(fp|lib\/supabase)[^"']*["']|registrarActividad(Completada)?\s*\(|\.rpc\s*\(/);
});
