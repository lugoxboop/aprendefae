import { test } from "node:test";
import assert from "node:assert/strict";
import { readFileSync, readdirSync } from "node:fs";
import { JSDOM, VirtualConsole } from "jsdom";

/*
 * ═══════════════════════════════════════════════════════════════════════════
 * T4 · A2 «El fondo fijo» (Célula D) · Aprender.
 *
 *   · cada pantalla dice EXACTAMENTE los textos del paquete vigente de
 *     Katsumi, letra por letra, y ningún texto que la v2 sustituye sigue
 *   · las cifras se CALCULAN: 478.100 sale de sumar los ocho gastos y 21.900
 *     de restarlos al fondo; los asientos y la tabla son los del paquete
 *   · la figura «El sobre y el libro» de Hanayama (v1 + v1.1 + v1.2): en qué
 *     pantalla y en qué estado; «Suman · sin contar» hasta el acierto de P5;
 *     el cheque en dos renglones, «Cheque» / «sale de Bancos»; Caja menor en
 *     500.000 en la apertura, en el reembolso y en la respuesta (la trampa)
 *   · PH8-2: mientras se pregunta, la respuesta no está en el DOM. Se lee
 *     textContent y outerHTML, nunca innerText
 *   · los asientos modelo de P8 y P9 llevan «xxxx», no «✓»
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

const Z = await import("../../data/contabilidadT4A2.js");
const { BOTON, INTERFAZ, DEBE, HABER } = await import("../../data/contabilidadT4.js");
const { SUBJECTS, APRENDER } = await import("../../data/subjects.js");
const { PantallasT4, SobreCajaMenor, CSS_T4S, PIEZAS_T4, TEMA_T4 } = await import("../../components/ContabilidadT4View.jsx");
const { inflesz } = await import("../../herramientas/inflesz.js");
const { leer, leerSecciones, cambiosDe, textosDeDatos, PAQUETES, RAIZ, CITA, blobEnLaRamaFuente, archivosEnLaRamaFuente, blobDeLaCopia, RAMA_FUENTE } = await import("./t4-paquete.mjs");

const V1 = leer(`${PAQUETES}d4-t4-a2-v1.md`);
const V2 = leer(`${PAQUETES}d4-t4-a2-v2-cambios.md`);
const P = Z.PIEZA_EL_FONDO_FIJO;
const pantalla = (id) => P.pantallas.find((x) => x.id === id);
const S = leerSecciones(V1);

/*
 * El paquete base ES la versión vigente (ya trae la v2). Se compara contra
 * él. El archivo de cambios se queda como registro: todo texto que sustituye
 * tiene que NO estar ni en la base ni en los datos. Uno nuevo pone la primera
 * prueba en rojo hasta mirarlo.
 */
const APLICADOS = ["d4-t4-a2-v2-cambios.md"];
const ES_VIGENTE = /\*\*Este archivo es la versión vigente\*\*/.test(V1);

/*
 * Lo que la v2 sustituye: las filas «v1 → v2» de sus tablas, y los cambios
 * sueltos («v1: «…» … **v2:** «…»», en una línea o en dos). De un cambio
 * suelto, todos los textos entre «v1» y «v2» son viejos.
 */
const V2_FILAS = [...V2.matchAll(new RegExp(`^\\| ([^|]+) \\| ${CITA}(?: \\([^)]*\\))? \\| ${CITA}`, "gm"))].map((m) => ({ donde: m[1], viejo: m[2].replace(/^… /, ""), nuevo: m[3] }));
const V2_SUELTOS = [];
{
  const lineas = V2.split("\n");
  lineas.forEach((l, k) => {
    if (l.startsWith("|") || !/\bv1[^«]*: «/.test(l)) return;
    const corte = l.indexOf("**v2:**");
    const viejos = [...(corte >= 0 ? l.slice(0, corte) : l).slice(l.search(/\bv1/)).matchAll(new RegExp(CITA, "g"))].map((m) => m[1]);
    const conNuevo = corte >= 0 ? l.slice(corte) : lineas[k + 1]?.startsWith("- **v2:**") ? lineas[k + 1] : null;
    V2_SUELTOS.push({ viejos, nuevo: conNuevo?.match(new RegExp(CITA))?.[1] ?? null });
  });
}
const VIEJOS = [...V2_FILAS.map((f) => ({ viejo: f.viejo, nuevo: f.nuevo })), ...V2_SUELTOS.flatMap((x) => x.viejos.map((viejo) => ({ viejo, nuevo: x.nuevo })))];

/* El paquete vigente, en su orden: P0…P10 del archivo base. */
const IDS = ["portada", "que-es", "quien-la-maneja", "la-apertura", "los-gastos", "cuanto-queda", "el-reembolso", "y-caja-menor", "aumentar", "disminuir", "resumen"];
const PAQUETE = IDS.map((id, k) => ({ id, ...S[`P${k}`] }));

/* Las tablas de un bloque del paquete (sin las de opciones), cada una como filas de celdas. */
function tablasDe(bloque) {
  const tablas = [];
  let actual = null;
  for (const l of bloque.split("\n")) {
    if (/^\|/.test(l)) {
      const celdas = l.split("|").slice(1, -1).map((c) => c.trim().replace(/^\*\*(.*)\*\*$/, "$1"));
      if (!actual) { actual = { cabecera: celdas, filas: [] }; tablas.push(actual); } else if (!/^-+$/.test(celdas[0])) actual.filas.push(celdas);
    } else actual = null;
  }
  return tablas.filter((t) => t.cabecera[0] !== "Opción");
}
const tablaDe = (id) => tablasDe(PAQUETE.find((x) => x.id === id).bloque);

/* ═══════════ 1 · EL TEXTO, CONTRA EL PAQUETE ═══════════ */

test("★★★ el paquete base es la versión vigente, la v2 está dentro y ningún texto que sustituye sigue", () => {
  assert.ok(ES_VIGENTE, "el paquete base de A2 no dice que es la versión vigente");
  assert.deepEqual(cambiosDe("a2"), APLICADOS, "hay un archivo de cambios de A2 que esta pieza no ha mirado todavía");
  /* La guarda: lo que la lectura de la v2 encontró, contado (4 errores, 5 de jerga; y «solo», «siempre» y la retención, con sus dos textos viejos). */
  assert.deepEqual([V2_FILAS.length, V2_SUELTOS.length, VIEJOS.length], [9, 3, 13], "la lectura de la v2 no encontró sus cambios");
  assert.ok(V2_SUELTOS.every((x) => x.viejos.length >= 1 && x.nuevo), "un cambio suelto de la v2 sin su texto viejo o su texto nuevo");
  const datos = P.pantallas.flatMap(textosDeDatos);
  const base = PAQUETE.flatMap((x) => x.textos);
  for (const { viejo, nuevo } of VIEJOS) {
    /* Un texto viejo puede quedar solo DENTRO del texto que lo reemplaza (la retención de P2 lo alarga). */
    assert.ok(!datos.some((t) => t.includes(viejo) && t !== nuevo), `los datos traen un texto viejo: «${viejo}»`);
    assert.ok(!base.some((t) => t.includes(viejo) && t !== nuevo), `el paquete base trae un texto viejo: «${viejo}»`);
  }
  /* Cada texto nuevo de la v2 está en la base y en los datos. */
  for (const { nuevo } of [...V2_FILAS, ...V2_SUELTOS]) {
    assert.ok(base.includes(nuevo), `la base no trae el texto de la v2 «${nuevo.slice(0, 40)}…»`);
    assert.ok(datos.includes(nuevo), `los datos no traen el texto de la v2 «${nuevo.slice(0, 40)}…»`);
  }
  /* v2, opcional de Shibukawa: «fijo» ya no dice «siempre», porque el fondo se aumenta y se disminuye. */
  assert.doesNotMatch(datos.join("\n"), /\bsiempre\b/i);
  /* A2-2: ni «girar» ni «X contra Y» en lo que ve el estudiante. C5: ni «sobrante» ni «faltante». */
  assert.doesNotMatch(datos.join("\n"), /\bgir(a|ar|ó)\b|\bcontra\b/i);
  assert.doesNotMatch(datos.join("\n"), /\b(sobrante|faltante)\b/i);
});

test("★★★ la copia del paquete de A2 es la de la punta de la rama de Katsumi (si este clon la tiene)", (t) => {
  const enLaRama = archivosEnLaRamaFuente();
  if (!enLaRama) { t.skip(`este clon no tiene ${RAMA_FUENTE}: la comparación la hace quien construye`); return; }
  const deA2 = enLaRama.filter((f) => /^d4-t4-a2-v\d+(-cambios)?\.md$/.test(f));
  assert.ok(deA2.includes("d4-t4-a2-v1.md"), "la lectura de la rama no encontró el paquete de A2");
  const copia = readdirSync(new URL(PAQUETES, RAIZ)).filter((f) => /^d4-t4-a2-/.test(f));
  assert.deepEqual(copia.sort(), deA2.sort(), "la rama tiene archivos de A2 que la copia no trae (o al revés)");
  for (const f of deA2) assert.equal(blobDeLaCopia(f), blobEnLaRamaFuente(f), `${f}: la copia no es la de la punta de ${RAMA_FUENTE}`);
});

test("★★★ las 11 pantallas, en el orden del paquete; título e id", () => {
  assert.equal(Object.keys(S).length, 11, "el paquete vigente no trae sus once pantallas P0-P10: la lectura está mal");
  assert.deepEqual(P.pantallas.map((x) => x.id), IDS);
  assert.equal(P.titulo, V1.match(/- Título: «([^»]+)»/)[1]);
  assert.equal(P.id, "t4-a2-el-fondo-fijo");
  assert.equal(P.numero, 2);
});

for (const { id, textos, pies } of PAQUETE) {
  test(`★★★ ${id}: los textos son los del paquete, letra por letra, ni uno más ni uno menos`, () => {
    assert.ok(textos.length >= 1, `${id}: no se leyó ningún texto del paquete`);
    /* Las opciones de P5 son cifras sin medida: se miran en la prueba de la pregunta. */
    const p = pantalla(id);
    const datos = textosDeDatos(p).filter((t) => !(p.opciones ?? []).some((o) => o.texto === t && !textos.includes(t)));
    assert.deepEqual([...datos].sort(), [...textos].sort());
    assert.equal(pies.length >= 1 ? pies[0] : null, p.pie ?? null, `${id}: pie`);
    for (const x of pies) assert.ok([p.pie, p.acierto?.pie, p.error?.pie].includes(x), `${id}: pie «${x}»`);
  });
}

test("★★★ las opciones de las dos preguntas son las del paquete, con su retroalimentación y una sola correcta", () => {
  for (const id of ["cuanto-queda", "y-caja-menor"]) {
    const bloque = PAQUETE.find((x) => x.id === id).bloque;
    const filas = [...bloque.matchAll(new RegExp(`^\\| ${CITA} \\| (sí|no) \\| ${CITA}`, "gm"))].map((m) => ({ texto: m[1], correcta: m[2] === "sí", devolucion: m[3] }));
    assert.equal(filas.length, 3, `${id}: no se leyeron las tres opciones del paquete`);
    const p = pantalla(id);
    assert.deepEqual(p.opciones.map((o) => [o.texto, Boolean(o.correcta), o.correcta ? p.acierto.texto : o.devolucion]), filas.map((f) => [f.texto, f.correcta, f.devolucion]));
  }
});

/*
 * Los textos de interfaz de la figura, revisados por Katsumi: desde el #181,
 * su fuente es la sección «Textos de interfaz…» del paquete base. Cada texto
 * alternativo, rótulo y nombre de los datos tiene que estar allí, letra por
 * letra.
 */
const INTERFAZ_A2 = (() => {
  const i = V1.indexOf("## Textos de interfaz de la figura");
  return i < 0 ? "" : V1.slice(i, V1.indexOf("\n## ", i + 5));
})();
test("★★★ los textos de interfaz (alternativos, rótulos, nombres para el lector) son los que aprobó Katsumi en el paquete", () => {
  assert.ok(INTERFAZ_A2.length > 500, "el paquete de A2 no trae la sección de textos de interfaz revisados");
  const citas = new Set([...INTERFAZ_A2.matchAll(new RegExp(CITA, "g"))].map((m) => m[1]));
  /* «  - *apertura:* «…»» o «  - *gastos* (P4 y P5…): «…»». */
  const alt = [...INTERFAZ_A2.matchAll(new RegExp(`^  - \\*([a-z0-9-]+):?\\*[^«\\n]*${CITA}`, "gm"))].map((m) => [m[1], m[2]]);
  assert.equal(alt.length, 5, "no se leyeron los cinco textos alternativos del paquete");
  for (const [estado, texto] of alt) assert.equal(Z.ALT_SOBRE_A2[estado], texto, `alternativo de ${estado}`);
  const F = Z.FIGURA_SOBRE;
  for (const t of [F.rotuloSobre, F.rotuloLibro, F.fondo, F.billetes, F.soportes, F.suman, F.sinContar, F.cheque, F.chequeSale, ...Object.values(F.notas), ...Object.values(Z.NOMBRE_ASIENTO_A2), Z.NOMBRE_TABLA_GASTOS, Z.SIGNO_MODELO.visible, Z.SIGNO_MODELO.lector]) {
    assert.ok(citas.has(t), `«${t}» no está entre los textos aprobados`);
  }
  /* Ninguna marca de pendiente queda en los datos de A2. */
  assert.doesNotMatch(leer("src/data/contabilidadT4A2.js"), /PENDIENTE DE REVISIÓN/);
});

/* ═══════════ 2 · LAS CIFRAS SE CALCULAN, Y LOS ASIENTOS SON LOS DEL PAQUETE ═══════════ */

const num = (t) => (t ? Number(t.replace(/\./g, "")) : null);

test("★★★ 478.100 sale de sumar los ocho gastos de la tabla del paquete, y 21.900 de restarlos al fondo", () => {
  const [tabla] = tablaDe("los-gastos");
  assert.deepEqual(tabla.cabecera, ["Gasto", "Valor"], "no se leyó la tabla de gastos del paquete");
  const total = tabla.filas.find((f) => f[0] === "Total");
  const gastos = tabla.filas.filter((f) => f[0] !== "Total");
  assert.equal(gastos.length, 8);
  assert.deepEqual(Z.GASTOS_MAYO.map((g) => [g.gasto, g.valor]), gastos.map((f) => [f[0], num(f[1])]), "los gastos no son los del paquete, en su orden");
  assert.equal(Z.GASTADO, gastos.reduce((s, f) => s + num(f[1]), 0));
  assert.equal(Z.GASTADO, num(total[1]), "la suma no da el total del paquete");
  assert.equal(Z.FONDO, 500_000);
  assert.equal(Z.QUEDA, Z.FONDO - Z.GASTADO);
  assert.deepEqual([Z.GASTADO, Z.QUEDA], [478_100, 21_900]);
  /* Que se calculan: el archivo de datos no escribe 478.100 ni 21.900 como número. */
  const fuente = leer("src/data/contabilidadT4A2.js");
  assert.doesNotMatch(fuente, /478_?100|21_?900/, "478.100 o 21.900 escritos a mano en los datos");
  /* Las únicas cifras de los textos son las de A2; ninguna de A3. */
  const cifras = new Set(P.pantallas.flatMap(textosDeDatos).flatMap((t) => [...t.matchAll(/\$\d{1,3}(?:\.\d{3})*/g)].map((m) => m[0])));
  assert.deepEqual([...cifras].sort(), ["$21.900", "$478.100", "$500.000"]);
});

test("★★★ los cuatro asientos son las tablas del paquete: la apertura del 1 de mayo, el reembolso del 31 de mayo y los dos modelos", () => {
  const filas = (a) => a.lineas.map((l) => [l.cuenta, l.lado === DEBE ? (a.signo ? "✓" : String(l.monto).replace(/\B(?=(\d{3})+(?!\d))/g, ".")) : "", l.lado === HABER ? (a.signo ? "✓" : String(l.monto).replace(/\B(?=(\d{3})+(?!\d))/g, ".")) : ""]);
  const conFecha = (id) => {
    const [t] = tablaDe(id);
    assert.deepEqual(t.cabecera, ["Fecha", "Cuenta", "Debe", "Haber"], `${id}: no se leyó el asiento del paquete`);
    return { fecha: t.filas[0][0], filas: t.filas.map((f) => f.slice(1)) };
  };
  const ap = conFecha("la-apertura");
  assert.equal(Z.ASIENTO_APERTURA.fecha, ap.fecha);
  assert.deepEqual(filas(Z.ASIENTO_APERTURA), ap.filas);
  const re = conFecha("y-caja-menor");
  assert.equal(Z.ASIENTO_REEMBOLSO.fecha, re.fecha);
  assert.equal(re.fecha, "31 de mayo", "errata D4-2: el reembolso es del 31 de mayo");
  assert.deepEqual(filas(Z.ASIENTO_REEMBOLSO), re.filas);
  for (const [id, a] of [["aumentar", Z.ASIENTO_AUMENTO], ["disminuir", Z.ASIENTO_DISMINUCION]]) {
    const [t] = tablaDe(id);
    assert.deepEqual(t.cabecera, ["Cuenta", "Debe", "Haber"], `${id}: no se leyó el asiento modelo`);
    /* El paquete marca el lado con «✓»; se pinta con «xxxx» (Hanayama v1 §4). El lado es el mismo. */
    assert.deepEqual(filas(a), t.filas, `${id}: el asiento modelo no es el del paquete`);
  }
  for (const a of [Z.ASIENTO_APERTURA, Z.ASIENTO_REEMBOLSO]) {
    const suma = (lado) => a.lineas.filter((l) => l.lado === lado).reduce((s, l) => s + l.monto, 0);
    assert.equal(suma(DEBE), suma(HABER), `${a.nombre}: no cuadra`);
  }
  assert.deepEqual(pantalla("la-apertura").asientos, [Z.ASIENTO_APERTURA]);
  assert.deepEqual(pantalla("y-caja-menor").trasAcertar.asientos, [Z.ASIENTO_REEMBOLSO]);
  assert.equal(pantalla("y-caja-menor").asientos, undefined, "el asiento del reembolso es la respuesta: solo con el acierto");
});

test("★★ INFLESZ con la herramienta oficial: todo texto de 10 palabras o más da 65 o más, y lo que dice el paquete", () => {
  const textos = P.pantallas.flatMap(textosDeDatos);
  const medidos = textos.map((t) => ({ t, r: inflesz(t) })).filter((x) => x.r.aplica);
  assert.ok(medidos.length >= 30, `solo ${medidos.length} textos de 10 palabras o más: algo no se leyó`);
  assert.deepEqual(medidos.filter((x) => !x.r.cumple).map((x) => `${x.r.valor} · ${x.t}`), []);
  assert.deepEqual(textos.filter((t) => inflesz(t).desconocidas.length > 0), [], "hay letras que la herramienta no sabe contar");
  let cotejados = 0;
  for (const { t, r } of medidos) {
    const m = V1.match(new RegExp(`«${t.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")}»\\s*\\((\\d+,\\d)`));
    if (m) { cotejados++; assert.equal(r.valor, Number(m[1].replace(",", ".")), `INFLESZ de «${t.slice(0, 40)}…»`); }
  }
  assert.ok(cotejados >= 25, `solo se cotejaron ${cotejados} medidas con el paquete`);
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

test("★★★ cada pantalla de lectura muestra sus textos en orden, su pie y su botón; fuera de figura, tabla y asientos, nada que no venga del paquete", () => {
  const m = montar();
  try {
    const lecturas = P.pantallas.filter((p) => p.tipo !== "eleccion");
    assert.equal(lecturas.length, 9);
    for (const p of lecturas) {
      irA(m.caja, p.id);
      assert.deepEqual(visibles(m.caja), textosDeDatos(p), `${p.id}: textos en pantalla`);
      assert.equal(pie(m.caja), p.pie, `${p.id}: pie`);
      const botones = [...m.caja.querySelectorAll("[data-boton]")].map((b) => b.textContent);
      assert.deepEqual(botones, p.id === "resumen" ? [] : [p.tipo === "portada" ? "Empezar" : "Seguir"], `${p.id}: botones`);
      const sueltos = [...m.caja.querySelectorAll("[data-pieza] *")]
        .filter((el) => !el.matches("style") && !el.closest("[data-figura], [data-tabla], [data-asiento]") && [...el.childNodes].some((x) => x.nodeType === 3 && x.textContent.trim()))
        .map((el) => el.textContent.trim());
      const ajenos = sueltos.filter((t) => !textosDeDatos(p).includes(t) && t !== p.pie && !INTERFAZ_MARCADA.has(t));
      assert.deepEqual(ajenos, [], `${p.id}: texto en pantalla que no viene del paquete`);
      if (p.listaNumerada) {
        assert.equal(m.caja.querySelector("[data-lista]").tagName, "OL", `${p.id}: lista sin numerar`);
        assert.equal(m.caja.querySelectorAll("[data-lista] li").length, p.listaNumerada.length);
      }
    }
    assert.deepEqual(lecturas.filter((p) => p.listaNumerada).map((p) => [p.id, p.listaNumerada.length]), [["quien-la-maneja", 4], ["resumen", 3]]);
  } finally { m.desmontar(); }
});

test("★★★ P4: la tabla de los ocho gastos, con el total que da la suma; P3: el asiento lleva su fecha", () => {
  const m = montar();
  try {
    irA(m.caja, "la-apertura");
    const ap = m.caja.querySelector("[data-asiento]");
    assert.equal(ap.querySelector("[data-fecha]").textContent, "1 de mayo");
    assert.deepEqual([...ap.querySelectorAll("[data-cifra]")].map((c) => [c.closest("[data-linea]").dataset.linea, c.closest("[data-linea]").dataset.lado, c.textContent]), [["Caja menor", "debe", "500.000"], ["Bancos", "haber", "500.000"]]);
    irA(m.caja, "los-gastos");
    const t = m.caja.querySelector("[data-tabla]");
    assert.deepEqual([...t.querySelectorAll('[role="columnheader"]')].map((x) => x.textContent), ["Gasto", "Valor"]);
    assert.deepEqual([...t.querySelectorAll("[data-fila-tabla]")].map((f) => [f.querySelector('[role="rowheader"]').textContent, f.querySelector("[data-cifra]").textContent]), Z.GASTOS_MAYO.map((g) => [g.gasto, g.valor.toLocaleString("de-DE")]));
    assert.equal(t.querySelector("[data-total]").textContent, "Total478.100");
    assert.equal(m.caja.querySelectorAll("[data-asiento]").length, 0, "P4 no tiene asiento");
  } finally { m.desmontar(); }
});

test("★★★ P8 y P9: los asientos modelo marcan el lado con «xxxx» y su texto para el lector; nunca «✓»", () => {
  const m = montar();
  try {
    for (const [id, filas] of [["aumentar", [["Caja menor", "debe"], ["Bancos", "haber"]]], ["disminuir", [["Caja", "debe"], ["Caja menor", "haber"]]]]) {
      irA(m.caja, id);
      const as = m.caja.querySelector("[data-asiento]");
      assert.ok(as, `${id}: falta el asiento modelo`);
      assert.equal(as.querySelector("[data-fecha]"), null, `${id}: el modelo no tiene fecha`);
      assert.equal(as.querySelectorAll("[data-cifra]").length, 0, `${id}: el modelo no tiene cifras`);
      const signos = [...as.querySelectorAll("[data-signo]")];
      assert.deepEqual(signos.map((s) => [s.closest("[data-linea]").dataset.linea, s.dataset.signo]), filas);
      for (const s of signos) {
        assert.equal(s.closest("[data-linea]").dataset.lado, s.dataset.signo, `${id}: el signo no está en su lado`);
        assert.equal(s.querySelector('[aria-hidden="true"]').textContent, "xxxx");
        assert.equal(s.querySelector(".t4f-sr").textContent, "valor que el libro no da");
      }
      assert.ok(!m.caja.querySelector("[data-pieza]").textContent.includes("✓"), `${id}: hay un «✓» en pantalla`);
    }
  } finally { m.desmontar(); }
});

for (const id of ["cuanto-queda", "y-caja-menor"]) {
  test(`★★★ ${id}: cada opción equivocada muestra «Incorrecto.» y SU retroalimentación, sin revelar; lo de después del acierto sale solo con el acierto`, () => {
    const p = pantalla(id);
    const m = montar();
    try {
      irA(m.caja, id);
      assert.equal(m.caja.querySelector("[data-pregunta]").textContent, p.pregunta);
      assert.deepEqual([...m.caja.querySelectorAll("[data-opcion]")].map((b) => b.textContent).sort(), p.opciones.map((o) => o.texto).sort());
      assert.equal(p.opciones.filter((o) => o.correcta).length, 1);
      const tras = p.trasAcertar.textos;
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
        /* v2: el error no nombra la correcta. */
        assert.ok(!msg.textContent.includes(p.opciones.find((x) => x.correcta).texto.replace(/\.$/, "")), `${o.id}: el error revela la respuesta`);
        sinTras(`error ${o.id}`);
        tocar(boton(m.caja, "probar-otra"));
      }
      tocar(m.caja.querySelector(`[data-opcion="${p.opciones.find((o) => o.correcta).id}"]`));
      tocar(boton(m.caja, "confirmar"));
      assert.equal(m.caja.querySelector('[data-mensaje="acierto"] [data-devolucion]').textContent, p.acierto.texto);
      assert.equal(m.caja.querySelector(".t4p-op-error"), null, "el coral es solo para el error");
      assert.equal(pie(m.caja), p.acierto.pie);
      assert.deepEqual(visibles(m.caja), textosDeDatos(p).filter((t) => !p.opciones.some((o) => o.texto === t || (!o.correcta && o.devolucion === t))), "acierto: textos en pantalla");
      if (id === "y-caja-menor") {
        const as = m.caja.querySelector("[data-asiento]");
        assert.equal(as.querySelector("[data-fecha]").textContent, "31 de mayo");
        assert.deepEqual([...as.querySelectorAll("[data-linea]")].map((l) => [l.dataset.linea, l.dataset.lado]), [["Gastos generales", "debe"], ["Bancos", "haber"]]);
        assert.ok(!as.textContent.includes("Caja menor"), "Caja menor no aparece en el asiento del reembolso");
      }
    } finally { m.desmontar(); }
  });
}

/* ═══════════ 4 · LA FIGURA: «EL SOBRE Y EL LIBRO» ═══════════ */

const filaSobre = (f, id) => f.querySelector(`[data-fila="${id}"]`);
const montoDe = (f, id) => filaSobre(f, id).querySelector(".t4sb-monto").textContent;
const enfocados = (f) => [...f.querySelectorAll(".t4sb-foco")].map((x) => x.dataset.monto).sort();
const libro = (f) => [...f.querySelectorAll("[data-cuenta]")].map((c) => [c.querySelector(".t4sb-cta-n").textContent, c.querySelector("[data-monto]").textContent, c.querySelector("[data-nota]")?.textContent ?? null]);

test("★★★ la figura va solo donde la pide Hanayama, en su estado; P5 y P7 dependen del acierto, no de haber respondido (v1.1)", () => {
  assert.deepEqual(P.pantallas.filter((p) => p.figura).map((p) => [p.id, p.figura.estado ?? p.figura.estados]), [
    ["la-apertura", "apertura"],
    ["los-gastos", "gastos"],
    ["cuanto-queda", { colocando: "gastos", error: "gastos", acierto: "cuadra" }],
    ["el-reembolso", "reembolso"],
    ["y-caja-menor", { colocando: "reembolso", error: "reembolso", acierto: "respuesta" }],
  ]);
  for (const p of P.pantallas.filter((x) => x.figura)) assert.equal(p.figura.tipo, "sobre-a2");
  const m = montar();
  try {
    for (const p of P.pantallas.filter((x) => x.tipo !== "eleccion")) {
      irA(m.caja, p.id);
      assert.equal(m.caja.querySelectorAll("[data-figura]").length, p.figura ? 1 : 0, `${p.id}: figura`);
      if (p.figura) {
        assert.equal(figura(m.caja).dataset.estado, p.figura.estado);
        assert.equal(figura(m.caja).querySelector("figcaption").textContent, Z.ALT_SOBRE_A2[p.figura.estado]);
        /* Orden: texto → figura → asiento. */
        const as = m.caja.querySelector("[data-asiento]");
        if (as) assert.ok(figura(m.caja).compareDocumentPosition(as) & w.Node.DOCUMENT_POSITION_FOLLOWING, `${p.id}: el asiento va debajo de la figura`);
      }
    }
  } finally { m.desmontar(); }
});

test("★★★ LA TRAMPA: en la apertura y en la respuesta del reembolso, Caja menor vale lo mismo, 500.000", () => {
  const m = montar();
  try {
    irA(m.caja, "la-apertura");
    const apertura = libro(figura(m.caja));
    assert.deepEqual(apertura, [["Caja menor", "500.000", null]]);
    irA(m.caja, "y-caja-menor");
    tocar(m.caja.querySelector('[data-opcion="no-se-mueve"]'));
    tocar(boton(m.caja, "confirmar"));
    const f = figura(m.caja);
    assert.equal(f.dataset.estado, "respuesta");
    assert.deepEqual(libro(f), [["Caja menor", "500.000", "no aparece en el reembolso"], ["Gastos generales", "478.100", null]]);
    assert.equal(libro(f)[0][1], apertura[0][1], "Caja menor cambió de valor entre la apertura y el reembolso");
    assert.deepEqual(enfocados(f), ["gastos-generales"], "en la respuesta lo señalado es Gastos generales");
    /* El sobre se llenó otra vez, y nada en él va señalado. */
    assert.deepEqual([montoDe(f, "billetes"), montoDe(f, "soportes"), montoDe(f, "suman")], ["500.000", "0", "500.000"]);
  } finally { m.desmontar(); }
});

test("★★★ v1.2 · el cheque va en dos renglones: «Cheque» con su monto, y «sale de Bancos»; sale solo en la apertura y en el reembolso", () => {
  const m = montar();
  try {
    for (const [id, monto] of [["la-apertura", "500.000"], ["los-gastos", null], ["el-reembolso", "478.100"]]) {
      irA(m.caja, id);
      const f = figura(m.caja);
      const ch = f.querySelector("[data-cheque]");
      if (!monto) { assert.equal(ch, null, `${id}: no hay cheque`); assert.equal(f.querySelector("[data-tubo]"), null); continue; }
      const renglones = [...ch.children];
      assert.equal(renglones.length, 2, `${id}: el cheque no tiene dos renglones`);
      assert.deepEqual([...renglones[0].children].map((x) => x.textContent), ["Cheque", monto]);
      assert.equal(renglones[1].textContent, "sale de Bancos");
      assert.ok(f.querySelector("[data-tubo]"), `${id}: falta el tubo`);
      assert.ok(!ch.textContent.includes("Cheque de Bancos"), "quedó el rótulo de la v1.1");
    }
  } finally { m.desmontar(); }
});

test("★★★ PH8-2 · P5: mientras pregunta y en cada error, «Suman» está «sin contar» y 21.900 no está en el DOM; con el acierto, «Suman 500.000»", () => {
  const p = pantalla("cuanto-queda");
  const m = montar();
  try {
    irA(m.caja, "los-gastos");
    const comoGastos = (cuando) => {
      const f = figura(m.caja);
      assert.equal(f.dataset.estado, "gastos", `${cuando}: la figura cambió de estado`);
      /* textContent y outerHTML, nunca innerText: lo oculto por CSS también cuenta. */
      assert.equal(filaSobre(f, "suman").textContent, "Sumansin contar", `${cuando}: «Suman» no está sin contar`);
      assert.equal(filaSobre(f, "billetes").textContent, "Billetes y monedassin contar", `${cuando}: los billetes no están sin contar`);
      assert.ok(!filaSobre(f, "suman").outerHTML.includes("500.000"), `${cuando}: el DOM ya trae «Suman 500.000»`);
      assert.ok(!f.outerHTML.includes("21.900"), `${cuando}: el DOM de la figura ya trae 21.900`);
      /* El fondo sí: es un dato, no una suma. */
      assert.equal(montoDe(f, "fondo"), "500.000");
      assert.equal(montoDe(f, "soportes"), "478.100");
      assert.deepEqual(enfocados(f), ["soportes"], `${cuando}: lo «sin contar» no va señalado`);
      assert.equal(f.querySelectorAll(".t4sb-foco[data-sin-contar]").length, 0);
      assert.deepEqual(libro(f), [["Caja menor", "500.000", "no se ha movido desde el 1 de mayo"]]);
      assert.equal(f.querySelector("[data-cheque]"), null);
      return f.outerHTML.replace(/ style="[^"]*"/g, "");
    };
    const enP4 = comoGastos("P4");
    irA(m.caja, "cuanto-queda");
    /* v1.1, prueba 8: la figura es idéntica en colocando y en el error. */
    assert.equal(comoGastos("colocando"), enP4, "la figura de P5 colocando no es la de P4");
    for (const o of p.opciones.filter((x) => !x.correcta)) {
      tocar(m.caja.querySelector(`[data-opcion="${o.id}"]`));
      tocar(boton(m.caja, "confirmar"));
      assert.equal(comoGastos(`error ${o.id}`), enP4, `error ${o.id}: la figura cambió`);
      tocar(boton(m.caja, "probar-otra"));
    }
    tocar(m.caja.querySelector('[data-opcion="lo-que-queda"]'));
    tocar(boton(m.caja, "confirmar"));
    const f = figura(m.caja);
    assert.equal(f.dataset.estado, "cuadra");
    assert.deepEqual([montoDe(f, "billetes"), montoDe(f, "soportes"), montoDe(f, "suman")], ["21.900", "478.100", "500.000"]);
    assert.deepEqual(enfocados(f), ["billetes", "suman"]);
    assert.equal(f.querySelectorAll("[data-sin-contar]").length, 0);
  } finally { m.desmontar(); }
});

test("★★★ PH8-2 · P7: mientras pregunta y en cada error, el libro guarda su sitio SIN su contenido; con el acierto aparece", () => {
  const p = pantalla("y-caja-menor");
  const m = montar();
  try {
    irA(m.caja, "el-reembolso");
    const comoReembolso = (cuando) => {
      const f = figura(m.caja);
      assert.equal(f.dataset.estado, "reembolso", `${cuando}: la figura cambió de estado`);
      const oculto = f.querySelector('[data-libro="oculto"]');
      assert.ok(oculto, `${cuando}: el libro no guarda su sitio`);
      assert.equal(oculto.getAttribute("aria-hidden"), "true");
      assert.equal(f.querySelector('[data-libro="visible"]'), null);
      /* Nada de la respuesta en el DOM: ni la cuenta, ni la nota, ni la cifra, ni el rótulo. */
      for (const t of ["Gastos generales", "Caja menor", "no aparece en el reembolso", "LO QUE DICE EL LIBRO"]) {
        assert.ok(!oculto.outerHTML.includes(t), `${cuando}: el hueco del libro ya trae «${t}»`);
      }
      assert.equal(oculto.textContent.trim(), "", `${cuando}: el hueco del libro dice algo`);
      /* La forma es la de la respuesta: dos filas, la primera con su nota. */
      assert.equal(oculto.querySelectorAll(".t4sb-cta").length, 2);
      assert.deepEqual([...oculto.querySelectorAll(".t4sb-cta")].map((c) => c.querySelectorAll(".t4sb-nota").length), [1, 0]);
      assert.ok(!f.outerHTML.includes("Gastos generales"), `${cuando}: la figura ya trae Gastos generales`);
      assert.deepEqual([montoDe(f, "billetes"), montoDe(f, "soportes"), montoDe(f, "suman")], ["500.000", "0", "500.000"]);
      assert.deepEqual(enfocados(f), ["billetes"]);
      return f.outerHTML.replace(/ style="[^"]*"/g, "");
    };
    const enP6 = comoReembolso("P6");
    irA(m.caja, "y-caja-menor");
    assert.equal(comoReembolso("colocando"), enP6, "la figura de P7 colocando no es la de P6");
    for (const o of p.opciones.filter((x) => !x.correcta)) {
      tocar(m.caja.querySelector(`[data-opcion="${o.id}"]`));
      tocar(boton(m.caja, "confirmar"));
      assert.equal(comoReembolso(`error ${o.id}`), enP6, `error ${o.id}: la figura cambió`);
      tocar(boton(m.caja, "probar-otra"));
    }
    tocar(m.caja.querySelector('[data-opcion="no-se-mueve"]'));
    tocar(boton(m.caja, "confirmar"));
    const f = figura(m.caja);
    assert.equal(f.querySelector('[data-libro="oculto"]'), null);
    assert.equal(f.querySelector('[data-libro="visible"] .t4sb-rot').textContent, "LO QUE DICE EL LIBRO");
    assert.equal(f.querySelectorAll('[data-libro="visible"] .t4sb-cta').length, 2, "el libro visible no tiene la forma que reservaba el hueco");
  } finally { m.desmontar(); }
});

test("★★★ la apertura y el sobre: los rótulos de la especificación, el fondo con su cifra y «Suman» como última fila", () => {
  const F = Z.FIGURA_SOBRE;
  const m = montar();
  try {
    irA(m.caja, "la-apertura");
    const f = figura(m.caja);
    assert.deepEqual([...f.querySelectorAll(".t4sb-rot")].map((x) => x.textContent), ["LO QUE TIENE ROSA", "LO QUE DICE EL LIBRO"]);
    assert.deepEqual([...f.querySelectorAll("[data-sobre] [data-fila]")].map((x) => x.dataset.fila), ["fondo", "billetes", "soportes", "suman"]);
    assert.deepEqual([...f.querySelectorAll("[data-sobre] .t4sb-nom")].map((x) => x.textContent), [F.fondo, F.billetes, F.soportes, F.suman]);
    assert.deepEqual([...f.querySelectorAll("[data-sobre] .t4sb-nom")].map((x) => x.textContent), ["Fondo de caja menor", "Billetes y monedas", "Soportes de gastos", "Suman"]);
    assert.deepEqual([montoDe(f, "fondo"), montoDe(f, "billetes"), montoDe(f, "soportes"), montoDe(f, "suman")], ["500.000", "500.000", "0", "500.000"]);
    assert.deepEqual(enfocados(f), ["billetes", "caja-menor"]);
    /* La solapa es dibujo, no texto. */
    assert.equal(f.querySelector("svg.t4sb-solapa").getAttribute("aria-hidden"), "true");
    assert.equal(f.getAttribute("aria-describedby"), f.querySelector("figcaption").id);
    /* Sin «$», sin «Debe»/«Haber», sin «✓» dentro de la figura. */
    assert.doesNotMatch(f.textContent, /\$|Debe|Haber|DEBE|HABER|✓/);
  } finally { m.desmontar(); }
});

test("★★★ el sobre es una pieza reutilizable de T4: pinta cualquier estado que le den, con su texto alternativo", () => {
  /* A3 lo usará con sus propias cifras (Hanayama A3 v1 §0). Aquí, un estado que no es de A2. */
  const s = { cheque: 476_000, fondo: 500_000, billetes: 24_000, soportes: 478_100 - 0, suman: null, foco: ["billetes"], libro: { oculto: [{ nota: true }] } };
  const caja = document.createElement("div");
  document.body.appendChild(caja);
  const raiz = createRoot(caja);
  try {
    act(() => raiz.render(h(SobreCajaMenor, { estado: "prueba", s, alt: "texto de prueba" })));
    const f = caja.querySelector('[data-figura="sobre"]');
    assert.equal(f.dataset.estado, "prueba");
    assert.deepEqual([montoDe(f, "billetes"), montoDe(f, "suman")], ["24.000", "sin contar"]);
    assert.equal(f.querySelector("[data-cheque] .t4sb-cheque-m").textContent, "476.000");
    assert.equal(f.querySelector("figcaption").textContent, "texto de prueba");
    assert.equal(f.querySelectorAll('[data-libro="oculto"] .t4sb-cta').length, 1);
  } finally { act(() => raiz.unmount()); caja.remove(); }
  /* Vive en el carril de T4 (la vista), no en una carpeta de componentes compartidos. */
  assert.match(leer("src/components/ContabilidadT4View.jsx"), /export function SobreCajaMenor\(\{ estado, s, alt, F = FIGURA_SOBRE \}\)/);
});

test("★★★ la figura: sin teal, ámbar ni coral, sin trazos discontinuos ni círculos; los renglones no se parten; nada se mueve con movimiento reducido", () => {
  const fig = CSS_T4S.slice(CSS_T4S.indexOf("/* sobre y libro */"));
  assert.ok(fig.length > 1000, "no se encontró la hoja del sobre");
  assert.doesNotMatch(fig, /#2A9D8F|#E9C46A|#E76F51|dashed|dotted|border-radius: 50%|✓/i);
  for (const clase of ["t4sb-rot", "t4sb-cheque-n", "t4sb-cheque-m", "t4sb-cheque-s", "t4sb-nom", "t4sb-monto", "t4sb-cta-n", "t4sb-nota"]) {
    assert.match(fig, new RegExp(`\\.${clase} \\{[^}]*white-space: nowrap;`), `.${clase} se puede partir`);
  }
  /* Lo que no se ve guarda su sitio con visibility, nunca con display: none. */
  assert.match(fig, /\.t4sb-oculto \{ visibility: hidden; \}/);
  assert.doesNotMatch(CSS_T4S, /animation:(?! none !important)|transition:(?! none !important)/, "el sobre no anima nada propio: usa el fundido de la hoja de figuras");
  assert.match(CSS_T4S, /@media \(prefers-reduced-motion: reduce\) \{ \.t4sb, \.t4sb \* \{ transition: none !important; animation: none !important; \} \}/);
});

/* ═══════════ 5 · APRENDER NO DA FP ═══════════ */

test("★★★ fuera del catálogo de FP: Aprender en subjects.js, justo después de H2; ninguna migración la nombra, y sus datos no llaman al motor", () => {
  const tema = SUBJECTS.contabilidad.topics.find((t) => t.id === TEMA_T4);
  const ids = tema.actividades.map((a) => a.id);
  assert.equal(ids.indexOf(Z.A2_ID), ids.indexOf("t4-el-control-que-se-saltaron") + 1, "A2 no va justo después de H2");
  const a = tema.actividades.find((x) => x.id === Z.A2_ID);
  assert.deepEqual(a.clasificacion, { tipo: APRENDER });
  assert.equal(a.nombre, P.titulo);
  assert.equal(PIEZAS_T4.find((x) => x.pieza.id === Z.A2_ID).pieza, P);
  const dir = new URL("supabase/migrations/", RAIZ);
  const migraciones = readdirSync(dir);
  assert.ok(migraciones.includes("0001_profiles.sql"), "la ruta de las migraciones está mal");
  assert.deepEqual(migraciones.filter((f) => readFileSync(new URL(f, dir), "utf8").includes(Z.A2_ID)), []);
  assert.doesNotMatch(leer("src/data/contabilidadT4A2.js"), /from\s+["'][^"']*\/(fp|lib\/supabase)[^"']*["']|registrarActividad(Completada)?\s*\(|\.rpc\s*\(/);
});
