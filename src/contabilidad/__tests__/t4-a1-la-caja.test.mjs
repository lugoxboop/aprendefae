import { test } from "node:test";
import assert from "node:assert/strict";
import { readFileSync, readdirSync } from "node:fs";
import { JSDOM, VirtualConsole } from "jsdom";

/*
 * ═══════════════════════════════════════════════════════════════════════════
 * T4 · A1 «La caja» (Célula D) · Aprender.
 *
 *   · cada pantalla dice EXACTAMENTE los textos del paquete de Katsumi (v1
 *     con los cambios de la v2 encima), en su orden, letra por letra; los
 *     textos que la v2 reemplaza ya no están
 *   · los dos asientos son las tablas del paquete, y cuadran
 *   · lo que se ve: cada pantalla montada en jsdom, en cada estado —cada
 *     opción equivocada y la correcta de las dos preguntas— pinta sus textos,
 *     su retroalimentación y su pie, y nada que no venga del paquete o de los
 *     textos de interfaz marcados
 *   · $435.000 es la única cifra, y en el asiento va en una línea
 *   · INFLESZ de cada texto de 10 palabras o más, con la herramienta oficial
 *   · Aprender: sin catálogo, sin migración y sin llamar al motor de FP
 *
 * La fuente de verdad son los dos archivos del paquete, copiados de la rama
 * feat/conta-d4-mapa-fuente con los mismos blobs. Esta prueba los lee; no
 * copia de ellos.
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

const A = await import("../../data/contabilidadT4.js");
const { SUBJECTS, APRENDER } = await import("../../data/subjects.js");
const { PantallasT4, CSS_T4P, CSS_T4F, PIEZAS_T4, TEMA_T4 } = await import("../../components/ContabilidadT4View.jsx");
const { inflesz } = await import("../../herramientas/inflesz.js");

const { leer, leerSecciones, textosConMedida, piesDe, cambiosDe, textosDeDatos, CITA, PAQUETES, blobEnLaRamaFuente, archivosEnLaRamaFuente, blobDeLaCopia, RAMA_FUENTE } = await import("./t4-paquete.mjs");
const RAIZ = new URL("../../../", import.meta.url);
const V1 = leer(`${PAQUETES}d4-t4-a1-v1.md`);
const V2 = leer(`${PAQUETES}d4-t4-a1-v2-cambios.md`);
const V3 = leer(`${PAQUETES}d4-t4-a1-v3-cambios.md`);
const V4 = leer(`${PAQUETES}d4-t4-a1-v4-cambios.md`);
const V5 = leer(`${PAQUETES}d4-t4-a1-v5-cambios.md`);
const P = A.PIEZA_LA_CAJA;
const pantalla = (id) => P.pantallas.find((x) => x.id === id);

/* ═══════════ EL PAQUETE, LEÍDO, CON CADA ARCHIVO DE CAMBIOS ENCIMA ═══════════ */

/*
 * Los archivos de cambios que esta prueba sabe aplicar. Si Katsumi entrega
 * otro (v4…), la primera prueba se pone roja hasta que alguien lo aplique
 * aquí y en los datos: así una versión vieja no pasa en silencio.
 */
const APLICADOS = ["d4-t4-a1-v2-cambios.md", "d4-t4-a1-v3-cambios.md", "d4-t4-a1-v4-cambios.md", "d4-t4-a1-v5-cambios.md"];

const asientosDe = (bloque) => {
  const filas = bloque.split("\n").filter((l) => /^\| (?!Cuenta|---|Opción)[^|]+\|\s*[\d.]*\s*\|\s*[\d.]*\s*\|$/.test(l));
  return filas.map((l) => l.split("|").slice(1, 4).map((c) => c.trim()));
};
const S = leerSecciones(V1);

/* v2, cambio 1: la pantalla nueva. */
const V2_CAMBIO_1 = V2.slice(V2.indexOf("## Cambio 1"), V2.indexOf("## Cambio 2"));
/* v2, cambios 2 y 3: dos reemplazos, «v1: «…»» por «**v2:** «…»». */
const reemplazoV2 = (n) => {
  const sec = V2.slice(V2.indexOf(`## Cambio ${n}`), V2.indexOf("\n## ", V2.indexOf(`## Cambio ${n}`) + 5));
  const viejo = sec.match(new RegExp(`^- v1: ${CITA}`, "m"))[1].replace(/^… /, "");
  const nuevo = sec.match(new RegExp(`^- \\*\\*v2:\\*\\* ${CITA}`, "m"))[1];
  return { viejo, nuevo };
};
const REEMPLAZOS = [reemplazoV2(2), reemplazoV2(3)];
const conReemplazos = (t) => {
  const r = REEMPLAZOS.find((x) => t === x.viejo || t.endsWith(x.viejo));
  return r ? r.nuevo : t;
};
/* v3, cambio 1: una primera línea nueva en «Qué es Caja», y su pie. */
const V3_CAMBIO_1 = V3.slice(V3.indexOf("## Cambio 1"), V3.indexOf("\n## ", V3.indexOf("## Cambio 1") + 5));
const V3_PRIMERA = V3_CAMBIO_1.match(new RegExp(`Nueva primera línea:\\*\\* ${CITA}`))[1];
const V3_PIE = V3_CAMBIO_1.match(new RegExp(`^- Pie: pasa de ${CITA} a ${CITA}`, "m"));

/*
 * v4 (auditoría de Shibukawa), en sus tres formas:
 *   · pares «- v3: «…»» / «- **v4:** «…»»
 *   · la tabla «| línea n | «v2» (…) | «v4» (…) |»
 *   · «Pie: pasa de «…» a «…»»
 * y una retirada que va en prosa: la glosa de arqueo de P7 sale.
 */
const V4_PARES = [...V4.matchAll(new RegExp(`^- v3: ${CITA}[^\\n]*\\n- \\*\\*v4:\\*\\* ${CITA}`, "gm"))].map((m) => ({ viejo: m[1], nuevo: m[2] }));
const V4_TABLA = [...V4.matchAll(new RegExp(`^\\| línea \\d \\| ${CITA} \\([^)]*\\) \\| ${CITA} \\([^)]*\\) \\|$`, "gm"))].map((m) => ({ viejo: m[1], nuevo: m[2] }));
const V4_PIES = [...V4.matchAll(new RegExp(`^- Pie: pasa de ${CITA} a ${CITA}`, "gm"))].map((m) => ({ viejo: m[1], nuevo: m[2] }));
const V4_SALE_ARQUEO = /\*\*Lo tomo:\*\* la glosa de arqueo de P7 sale\./.test(V4);
const GLOSA_ARQUEO = "Un arqueo es contar el dinero de la caja para ver si cuadra con lo que debe haber.";
const conV4 = (t) => [...V4_PARES, ...V4_TABLA].find((x) => x.viejo === t)?.nuevo ?? t;

/*
 * v5: las tablas «| «opción» | «error v1-v4» | «error v5» (…) |». El error
 * viejo puede venir abreviado con «… »: se reconoce por cómo termina.
 */
const V5_ERRORES = [...V5.matchAll(new RegExp(`^\\| ${CITA} \\| ${CITA} \\| ${CITA} \\([^)]*\\) \\|$`, "gm"))].map((m) => ({ opcion: m[1], viejo: m[2].replace(/^… /, ""), nuevo: m[3] }));
const V5_ASIENTO_SOLO_CON_ACIERTO = /Ahora se muestra \*\*solo con el acierto\*\*/.test(V5);
const conV5 = (t) => V5_ERRORES.find((x) => t === x.viejo || t.endsWith(x.viejo))?.nuevo ?? t;
const pieV4 = (t) => V4_PIES.find((x) => x.viejo === t)?.nuevo ?? t;

/* El paquete vigente, pantalla por pantalla, en el orden final: P0 · nueva de la v2 · P1…P8 de la v1. */
const pantallaDelPaquete = (id, { bloque, textos, pies }) => ({
  id, bloque,
  textos: textos.map(conReemplazos).map(conV4).map(conV5).filter((t) => !(V4_SALE_ARQUEO && t === GLOSA_ARQUEO)),
  pies: pies.map(pieV4),
});
const PAQUETE = [
  pantallaDelPaquete("portada", S.P0),
  pantallaDelPaquete("dos-cuentas", { bloque: V2_CAMBIO_1, textos: textosConMedida(V2_CAMBIO_1), pies: piesDe(V2_CAMBIO_1) }),
  { ...pantallaDelPaquete("que-es-caja", S.P1), textos: [V3_PRIMERA, ...S.P1.textos.map(conReemplazos).map(conV4)], pies: S.P1.pies.map((x) => (x === V3_PIE[1] ? V3_PIE[2] : x)) },
  pantallaDelPaquete("cheques", S.P2),
  pantallaDelPaquete("la-regla", S.P3),
  pantallaDelPaquete("cobra", S.P4),
  pantallaDelPaquete("consignacion", S.P5),
  pantallaDelPaquete("controles", S.P6),
  pantallaDelPaquete("control-que-falla", S.P7),
  pantallaDelPaquete("resumen", S.P8),
].map((x) => ({ ...x, asientos: asientosDe(x.bloque) }));

/* ═══════════ 1 · EL TEXTO, CONTRA EL PAQUETE ═══════════ */

test("★★★ todos los archivos de cambios de A1 que hay en la carpeta están aplicados", () => {
  assert.deepEqual(cambiosDe("a1"), APLICADOS, "hay un archivo de cambios de A1 que esta pieza no aplica todavía");
  assert.ok(V3_PIE, "no se leyó el cambio de pie de la v3");
  assert.equal(V3_PIE[2], "Basado en el libro, pp. 178-179");
  /* La guarda de la v4: lo que su lectura encontró, contado. */
  assert.deepEqual([V4_PARES.length, V4_TABLA.length, V4_PIES.length, V4_SALE_ARQUEO], [3, 3, 1, true], "la lectura de la v4 no encontró sus cambios");
  assert.deepEqual([V5_ERRORES.length, V5_ASIENTO_SOLO_CON_ACIERTO], [4, true], "la lectura de la v5 no encontró sus cambios");
  /* Cada error de la v5 es el de su opción, y ninguno nombra la opción correcta. */
  for (const e of V5_ERRORES) {
    const o = P.pantallas.flatMap((p) => p.opciones ?? []).find((x) => x.texto === e.opcion);
    assert.ok(o, `la v5 nombra una opción que no existe: «${e.opcion}»`);
    assert.equal(o.devolucion, e.nuevo, `${o.id}: el error no es el de la v5`);
  }
  assert.ok(S.P6.textos.includes(GLOSA_ARQUEO), "la glosa de arqueo que la v4 quita no está en la v1");
});

test("★★★ la copia de los paquetes de A0 y A1 es la de la punta de la rama de Katsumi (si este clon la tiene)", (t) => {
  const enLaRama = archivosEnLaRamaFuente();
  if (!enLaRama) { t.skip(`este clon no tiene ${RAMA_FUENTE}: la comparación la hace quien construye`); return; }
  const deA0yA1 = enLaRama.filter((f) => /^d4-t4-a[01]-v\d+(-cambios)?\.md$/.test(f));
  assert.ok(deA0yA1.includes("d4-t4-a1-v1.md"), "la lectura de la rama no encontró el paquete de A1");
  const copia = readdirSync(new URL(PAQUETES, RAIZ)).filter((f) => /^d4-t4-a[01]-/.test(f));
  assert.deepEqual(copia.sort(), deA0yA1.sort(), "la rama tiene archivos de A0 o A1 que la copia no trae (o al revés)");
  for (const f of deA0yA1) assert.equal(blobDeLaCopia(f), blobEnLaRamaFuente(f), `${f}: la copia no es la de la punta de ${RAMA_FUENTE}`);
});

test("★★★ las 10 pantallas, en el orden de la v2", () => {
  assert.equal(Object.keys(S).length, 9, "la v1 no trae sus nueve pantallas P0-P8: la lectura del paquete está mal");
  assert.match(V2, /P0 Portada · \*\*P1 De la caja del Tema 3 a dos cuentas \(nueva\)\*\* · P2 Qué es Caja · P3 Los cheques de la caja · P4 La regla · P5 Sus Servicios cobra · P6 La consignación · P7 Los siete controles · P8 ¿Qué control falla\? · P9 Resumen\./);
  assert.deepEqual(P.pantallas.map((x) => x.id), PAQUETE.map((x) => x.id));
  assert.equal(P.titulo, V1.match(/- Título: «([^»]+)»/)[1]);
  assert.equal(P.id, "t4-a1-la-caja");
});

for (const { id, textos, pies } of PAQUETE) {
  test(`★★★ ${id}: los textos son los del paquete, letra por letra, ni uno más ni uno menos`, () => {
    /* La guarda: si la lectura del paquete no encuentra nada, la comparación no prueba nada. */
    assert.ok(textos.length >= 1, `${id}: no se leyó ningún texto del paquete`);
    assert.deepEqual([...textosDeDatos(pantalla(id))].sort(), [...textos].sort());
    assert.equal(pies.length >= 1 ? pies[0] : null, pantalla(id).pie ?? null, `${id}: pie`);
    for (const p of pies) assert.ok([pantalla(id).pie, pantalla(id).acierto?.pie, pantalla(id).error?.pie].includes(p), `${id}: pie «${p}»`);
  });
}

test("★★★ los reemplazos de la v2, v4 y v5 están, y los textos viejos que sustituyen ya no", () => {
  const todo = P.pantallas.flatMap(textosDeDatos).join("\n");
  assert.equal(REEMPLAZOS.length, 2);
  for (const r of REEMPLAZOS) {
    assert.ok(todo.includes(r.nuevo), `falta el texto de la v2: «${r.nuevo}»`);
  }
  /* Ni un texto de los que la v4 sustituye o quita. */
  for (const r of [...V4_PARES, ...V4_TABLA]) {
    assert.ok(todo.includes(r.nuevo), `falta el texto de la v4: «${r.nuevo}»`);
    assert.ok(!todo.includes(r.viejo), `quedó un texto que la v4 sustituye: «${r.viejo}»`);
  }
  assert.ok(!todo.includes(GLOSA_ARQUEO), "quedó la glosa de arqueo que la v4 quita");
  for (const e of V5_ERRORES) {
    assert.ok(todo.includes(e.nuevo), `falta el error de la v5: «${e.nuevo}»`);
    assert.ok(!todo.includes(e.viejo), `quedó un error que la v5 sustituye: «${e.viejo}»`);
  }
  assert.ok(!todo.includes("un error o un faltante"), "quedó el «faltante» de la v1 (C5)");
  assert.ok(!todo.includes("llegó al banco. Bancos se debita"), "quedó el acierto de la consignación de la v1 (I5)");
  /* C5: nunca «sobrante» ni «faltante» a secas. */
  assert.doesNotMatch(todo, /\b(sobrante|faltante)\b/i);
});

test("★★★ los dos asientos son las tablas del paquete y cuadran; la única cifra es 435.000", () => {
  const filas = (a) => a.lineas.map((l) => [l.cuenta, l.lado === A.DEBE ? "435.000" : "", l.lado === A.HABER ? "435.000" : ""]);
  const cobro = PAQUETE.find((x) => x.id === "cobra").asientos;
  const consignacion = PAQUETE.find((x) => x.id === "consignacion").asientos;
  assert.equal(cobro.length, 2, "no se leyó el asiento 1 del paquete");
  assert.equal(consignacion.length, 2, "no se leyó el asiento 2 del paquete");
  assert.deepEqual(filas(A.ASIENTO_COBRO), cobro);
  assert.deepEqual(filas(A.ASIENTO_CONSIGNACION), consignacion);
  for (const a of [A.ASIENTO_COBRO, A.ASIENTO_CONSIGNACION]) {
    const suma = (lado) => a.lineas.filter((l) => l.lado === lado).reduce((s, l) => s + l.monto, 0);
    assert.equal(suma(A.DEBE), suma(A.HABER), `${a.nombre}: no cuadra`);
  }
  assert.equal(A.SUS_SERVICIOS, 435_000);
  assert.deepEqual(pantalla("cobra").asientos, [A.ASIENTO_COBRO]);
  assert.deepEqual(pantalla("consignacion").trasAcertar.asientos, [A.ASIENTO_CONSIGNACION]);
  /* Ninguna otra cifra en los textos: solo $435.000 (p. 180). Las páginas del pie no cuentan. */
  const cifras = P.pantallas.flatMap(textosDeDatos).flatMap((t) => [...t.matchAll(/\$\d{1,3}(?:\.\d{3})*/g)].map((m) => m[0]));
  assert.ok(cifras.length >= 5, `solo se encontraron ${cifras.length} cifras: la búsqueda está mal`);
  assert.deepEqual([...new Set(cifras)], ["$435.000"]);
});

test("★★ INFLESZ con la herramienta oficial: todo texto de 10 palabras o más da 65 o más, y lo que dice el paquete", () => {
  const textos = P.pantallas.flatMap(textosDeDatos);
  const medidos = textos.map((t) => ({ t, r: inflesz(t) })).filter((x) => x.r.aplica);
  assert.ok(medidos.length >= 30, `solo ${medidos.length} textos de 10 palabras o más: algo no se leyó`);
  const bajos = medidos.filter((x) => !x.r.cumple).map((x) => `${x.r.valor} · ${x.t}`);
  assert.deepEqual(bajos, []);
  const raros = textos.filter((t) => inflesz(t).desconocidas.length > 0);
  assert.deepEqual(raros, [], "hay letras que la herramienta no sabe contar");
  /* El número del paquete, contra la medida: los dos dicen lo mismo. */
  const paquete = V1 + V2;
  for (const { t, r } of medidos) {
    const m = paquete.match(new RegExp(`«${t.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")}»\\s*\\((\\d+,\\d)`));
    if (m) assert.equal(r.valor, Number(m[1].replace(",", ".")), `INFLESZ de «${t.slice(0, 40)}…»`);
  }
});

/* ═══════════ 2 · LO QUE SE VE ═══════════ */

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

/* Lo único que la vista puede escribir sin que venga del paquete: los textos de interfaz marcados. */
const INTERFAZ_MARCADA = new Set([...Object.values(A.BOTON), ...Object.values(A.INTERFAZ)]);

/* Llega a la pantalla `id` pulsando «Empezar»/«Seguir», acertando las preguntas por el camino. */
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

test("★★★ cada pantalla de lectura muestra sus textos en orden, su pie y su botón; nada más", () => {
  const m = montar();
  try {
    const lecturas = P.pantallas.filter((p) => p.tipo !== "eleccion");
    assert.equal(lecturas.length, 8);
    for (const p of lecturas) {
      irA(m.caja, p.id);
      assert.deepEqual(visibles(m.caja), textosDeDatos(p), `${p.id}: textos en pantalla`);
      assert.equal(pie(m.caja), p.pie, `${p.id}: pie`);
      const ultima = p.id === "resumen";
      const botones = [...m.caja.querySelectorAll("[data-boton]")].map((b) => b.textContent);
      assert.deepEqual(botones, ultima ? [] : [p.tipo === "portada" ? "Empezar" : "Seguir"], `${p.id}: botones`);
      /* Todo texto suelto de la pieza viene del paquete o es un texto de interfaz marcado. */
      /* Los rótulos de la figura se miran aparte (prueba de la figura); aquí, todo lo que está fuera de ella. */
      const sueltos = [...m.caja.querySelectorAll("[data-pieza] *")]
        .filter((el) => !el.matches("style") && !el.closest("[data-figura]") && [...el.childNodes].some((x) => x.nodeType === 3 && x.textContent.trim()))
        .map((el) => el.textContent.trim());
      const ajenos = sueltos.filter((t) => !textosDeDatos(p).includes(t) && t !== p.pie && !INTERFAZ_MARCADA.has(t) && !/^[\d.]+$/.test(t) && !["Caja", "Ingresos por servicios"].includes(t));
      assert.deepEqual(ajenos, [], `${p.id}: texto en pantalla que no viene del paquete`);
      /* Los siete controles y el resumen van numerados, como en el paquete. */
      if (p.listaNumerada) {
        assert.equal(m.caja.querySelector("[data-lista]").tagName, "OL", `${p.id}: lista sin numerar`);
        assert.equal(m.caja.querySelectorAll("[data-lista] li").length, p.listaNumerada.length);
      }
    }
    assert.deepEqual(lecturas.filter((p) => p.listaNumerada).map((p) => [p.id, p.listaNumerada.length]), [["controles", 7], ["resumen", 3]]);
  } finally { m.desmontar(); }
});

for (const id of ["consignacion", "control-que-falla"]) {
  test(`★★★ ${id}: cada opción equivocada muestra «Incorrecto.» y SU retroalimentación; la correcta, «Correcto.» y el acierto`, () => {
    const p = pantalla(id);
    const m = montar();
    try {
      irA(m.caja, id);
      assert.equal(m.caja.querySelector("[data-pregunta]").textContent, p.pregunta);
      const pintadas = [...m.caja.querySelectorAll("[data-opcion]")].map((b) => b.textContent).sort();
      assert.deepEqual(pintadas, p.opciones.map((o) => o.texto).sort(), "las opciones en pantalla");
      assert.equal(p.opciones.length, 3);
      assert.equal(p.opciones.filter((o) => o.correcta).length, 1);
      assert.equal(boton(m.caja, "confirmar").getAttribute("aria-disabled"), "true", "«Confirmar» empieza apagado");
      assert.equal(m.caja.querySelectorAll("[data-asiento]").length, 0, "el asiento 2 no se ve antes de responder");

      const malas = p.opciones.filter((o) => !o.correcta);
      assert.equal(malas.length, 2);
      for (const o of malas) {
        tocar(m.caja.querySelector(`[data-opcion="${o.id}"]`));
        tocar(boton(m.caja, "confirmar"));
        const msg = m.caja.querySelector('[data-mensaje="error"]');
        assert.ok(msg, `${o.id}: no hay mensaje de error`);
        assert.equal(msg.querySelector("[data-palabra]").textContent, "Incorrecto.");
        assert.equal(msg.querySelector("[data-devolucion]").textContent, o.devolucion, `${o.id}: retroalimentación`);
        assert.ok(m.caja.querySelector(`[data-opcion="${o.id}"]`).classList.contains("t4p-op-error"), `${o.id}: la opción elegida no se marca en coral`);
        assert.equal(pie(m.caja), p.error.pie);
        assert.equal(boton(m.caja, "seguir"), null, "con un error no se sigue");
        /* v5: el asiento 2 es la respuesta, así que no se ve con un error. */
        assert.equal(m.caja.querySelectorAll("[data-asiento]").length, 0, `${o.id}: el error muestra el asiento de la respuesta`);
        /* Y el error no nombra la opción correcta. */
        assert.ok(!msg.textContent.includes(p.opciones.find((x) => x.correcta).texto.replace(/\.$/, "")), `${o.id}: el error revela la respuesta`);
        tocar(boton(m.caja, "probar-otra"));
        assert.equal(m.caja.querySelector("[data-mensaje]"), null, "«Probar otra» limpia el mensaje");
      }
      const buena = p.opciones.find((o) => o.correcta);
      tocar(m.caja.querySelector(`[data-opcion="${buena.id}"]`));
      tocar(boton(m.caja, "confirmar"));
      const ok = m.caja.querySelector('[data-mensaje="acierto"]');
      assert.equal(ok.querySelector("[data-palabra]").textContent, "Correcto.");
      assert.equal(ok.querySelector("[data-devolucion]").textContent, p.acierto.texto);
      assert.equal(m.caja.querySelector(".t4p-op-error"), null, "el coral es solo para el error");
      assert.equal(pie(m.caja), p.acierto.pie);
      assert.ok(boton(m.caja, "seguir"));
      if (id === "consignacion") {
        const as = m.caja.querySelector("[data-asiento]");
        assert.deepEqual([...as.querySelectorAll("[data-linea]")].map((l) => [l.dataset.linea, l.dataset.lado]), [["Bancos", "debe"], ["Caja", "haber"]]);
      }
    } finally { m.desmontar(); }
  });
}

test("★★★ la cifra del asiento: «435.000» en su columna, sin partirse en dos líneas", () => {
  const m = montar();
  try {
    irA(m.caja, "cobra");
    const celdas = [...m.caja.querySelectorAll("[data-asiento] [data-cifra]")];
    assert.equal(celdas.length, 2, "el asiento del cobro tiene dos cifras");
    for (const c of celdas) assert.equal(c.textContent, "435.000");
    assert.deepEqual(celdas.map((c) => c.closest("[data-linea]").dataset.linea), ["Caja", "Ingresos por servicios"]);
    /* La regla que la sostiene en una línea: medida en Chromium a 375 y 320 aparte (informe del PR). */
    assert.match(CSS_T4P, /\.t4p-as-r \.t4p-g2 > span \{[^}]*white-space: nowrap;[^}]*min-width: 0;/);
    assert.match(CSS_T4P, /\.t4p-g2 \{ display: grid; grid-template-columns: repeat\(2, minmax\(0, 1fr\)\);/);
  } finally { m.desmontar(); }
});

/* ═══════════ LA FIGURA: «EL CAJÓN DE PASO» ═══════════ */

const figura = (c) => c.querySelector('[data-figura="cajon"]');
const montosDe = (f) => Object.fromEntries([...f.querySelectorAll("[data-monto]")].map((x) => [x.dataset.monto, x.textContent]));
const enfocados = (f) => [...f.querySelectorAll("[data-monto].t4cj-foco")].map((x) => x.dataset.monto).sort();
const vivos = (f) => [...f.querySelectorAll("[data-trazo].t4cj-vivo")].map((x) => x.dataset.trazo).sort();

test("★★★ la figura va solo donde la pide Hanayama: La regla (reglas), el cobro (recibe) y la consignación", () => {
  assert.deepEqual(P.pantallas.filter((p) => p.figura).map((p) => [p.id, p.figura.estado ?? p.figura.estados]), [
    ["la-regla", "reglas"],
    ["cobra", "recibe"],
    ["consignacion", { colocando: "recibe", error: "recibe", acierto: "consigna" }],
  ]);
  const m = montar();
  try {
    for (const p of P.pantallas.filter((x) => x.tipo !== "eleccion")) {
      irA(m.caja, p.id);
      assert.equal(m.caja.querySelectorAll("[data-figura]").length, p.figura ? 1 : 0, `${p.id}: figura`);
    }
  } finally { m.desmontar(); }
});

test("★★★ reglas y recibe: lo que se ve, con los rótulos de la especificación y ninguna cuenta salvo Caja y Bancos", () => {
  const F = A.FIGURA_CAJON;
  const m = montar();
  try {
    irA(m.caja, "la-regla");
    let f = figura(m.caja);
    assert.equal(f.dataset.estado, "reglas");
    assert.equal(f.querySelector("[data-origen]"), null, "reglas: sin tarjeta de origen");
    assert.deepEqual(montosDe(f), {}, "reglas: sin montos");
    assert.deepEqual(vivos(f), []);
    assert.equal(f.querySelector(".t4cj-nombre").textContent, "Caja");
    assert.deepEqual([...f.querySelectorAll(".t4cj-glosa")].map((g) => [...g.children].map((x) => x.textContent)), [["se recibe", "dinero"], ["se consigna", "o se paga"]]);
    assert.deepEqual([...f.querySelectorAll(".t4cj-lado")].map((x) => x.textContent), ["Debe", "Haber"]);
    assert.equal(f.querySelector('[data-destino="bancos"] .t4cj-caja2-n').textContent, "Bancos");
    assert.equal(f.querySelector('[data-destino="pago"] .t4cj-caja2-n').textContent, "Pago en efectivo");
    assert.equal(f.querySelector("figcaption").textContent, F.alt.reglas);
    assert.equal(f.getAttribute("aria-describedby"), f.querySelector("figcaption").id);

    irA(m.caja, "cobra");
    f = figura(m.caja);
    assert.equal(f.dataset.estado, "recibe");
    assert.equal(f.querySelector(".t4cj-rot").textContent, "Sus Servicios Ltda. · durante el día");
    assert.equal(f.querySelector(".t4cj-hecho").textContent, "Los clientes pagan de contado");
    assert.deepEqual(montosDe(f), { origen: "435.000", debe: "435.000" });
    assert.deepEqual(enfocados(f), ["debe", "origen"]);
    assert.deepEqual(vivos(f), ["entrada"]);
    /* v1.1, cambio 1: Ingresos por servicios va en el asiento, nunca en la figura. */
    assert.ok(!f.textContent.includes("Ingresos por servicios"));
    assert.ok(!f.textContent.includes("$"), "sin «$» en la figura");
    /* Orden: texto → figura → asiento. */
    const as = m.caja.querySelector("[data-asiento]");
    assert.ok(f.compareDocumentPosition(as) & w.Node.DOCUMENT_POSITION_FOLLOWING, "el asiento va debajo de la figura");
  } finally { m.desmontar(); }
});

test("★★★ consignación: mientras pregunta y en cada error la figura sigue en «recibe»; solo el acierto la pasa a «consigna»", () => {
  const p = pantalla("consignacion");
  const m = montar();
  try {
    irA(m.caja, "consignacion");
    const comoRecibe = (cuando) => {
      const f = figura(m.caja);
      assert.equal(f.dataset.estado, "recibe", `${cuando}: la figura dibuja la respuesta`);
      assert.equal(montosDe(f).haber, undefined, `${cuando}: hay monto en el Haber`);
      assert.equal(montosDe(f).bancos, undefined, `${cuando}: hay monto en Bancos`);
      assert.deepEqual(vivos(f), ["entrada"], `${cuando}: trazos encendidos`);
    };
    comoRecibe("colocando");
    for (const o of p.opciones.filter((x) => !x.correcta)) {
      tocar(m.caja.querySelector(`[data-opcion="${o.id}"]`));
      tocar(boton(m.caja, "confirmar"));
      comoRecibe(`error ${o.id}`);
      tocar(boton(m.caja, "probar-otra"));
    }
    tocar(m.caja.querySelector('[data-opcion="se-acredita"]'));
    tocar(boton(m.caja, "confirmar"));
    const f = figura(m.caja);
    assert.equal(f.dataset.estado, "consigna");
    assert.deepEqual(montosDe(f), { origen: "435.000", debe: "435.000", haber: "435.000", bancos: "435.000" });
    /* Debe pasa a antecedente; lo señalado es el Haber y Bancos. */
    assert.deepEqual(enfocados(f), ["bancos", "haber"]);
    assert.deepEqual(vivos(f), ["a-bancos", "cruce", "salida"]);
    /* «Pago en efectivo» nunca lleva monto, y su bajada no se enciende. */
    assert.equal(f.querySelector('[data-destino="pago"] [data-monto]'), null);
    assert.ok(!f.querySelector('[data-trazo="a-pago"]').classList.contains("t4cj-vivo"));
    assert.equal(f.querySelector("figcaption").textContent, A.FIGURA_CAJON.alt.consigna);
  } finally { m.desmontar(); }
});

test("★★★ la figura: sin coral, sin círculos, sin trazos discontinuos; las cifras no se parten; nada se mueve con movimiento reducido", () => {
  const fig = CSS_T4F.slice(CSS_T4F.indexOf("/* cajón de paso */"), CSS_T4F.indexOf("/* raya del año */"));
  assert.ok(fig.length > 500, "no se encontró la hoja de la figura");
  assert.doesNotMatch(fig, /#E76F51|e76f51|dashed|dotted|border-radius: 50%/i);
  assert.match(fig, /\.t4cj-monto \{[^}]*white-space: nowrap;/);
  assert.match(fig, /\.t4cj-glosa > span \{ white-space: nowrap; \}/);
  assert.match(fig, /\.t4cj-caja2-n > span \{ white-space: nowrap; \}/);
  /* Lo único que se anima es el fundido de 120 ms, y con movimiento reducido se apaga todo. */
  assert.deepEqual([...CSS_T4F.matchAll(/animation:\s*([^;]+);/g)].map((x) => x[1].trim()), ["t4f-aparece .12s ease-out", "none !important"]);
  assert.match(CSS_T4F, /@media \(prefers-reduced-motion: reduce\) \{ \.t4cj \*, \.t4ry \*, \.t4f-nueva \{ transition: none !important; animation: none !important; \} \}/);
  assert.deepEqual([...CSS_T4F.matchAll(/transition:\s*([^;]+);/g)].map((x) => x[1].trim()), ["none !important"], "ninguna transición fuera de la regla de movimiento reducido");
});

/* ═══════════ 3 · APRENDER NO DA FP ═══════════ */

test("★★★ fuera del catálogo de FP: Aprender en subjects.js, ninguna migración la nombra, y ni la pieza ni sus datos llaman al motor", () => {
  const tema = SUBJECTS.contabilidad.topics.find((t) => t.id === TEMA_T4);
  const a = tema.actividades.find((x) => x.id === A.A1_ID);
  assert.deepEqual(a.clasificacion, { tipo: APRENDER });
  assert.equal(a.nombre, P.titulo);
  assert.equal(PIEZAS_T4.find((x) => x.pieza.id === A.A1_ID).pieza, P);
  const dir = new URL("supabase/migrations/", RAIZ);
  const migraciones = readdirSync(dir);
  assert.ok(migraciones.includes("0001_profiles.sql"), "la ruta de las migraciones está mal");
  assert.deepEqual(migraciones.filter((f) => readFileSync(new URL(f, dir), "utf8").includes(A.A1_ID)), []);
  assert.doesNotMatch(leer("src/data/contabilidadT4.js"), /from\s+["'][^"']*\/(fp|lib\/supabase)[^"']*["']|registrarActividad(Completada)?\s*\(|\.rpc\s*\(/);
  /* Las pantallas no reciben ni llaman a nada que registre: solo la vista, por los Hacer. */
  const vista = leer("src/components/ContabilidadT4View.jsx");
  const pantallas = vista.slice(vista.indexOf("T4 · LAS PANTALLAS DE APRENDER"));
  assert.ok(pantallas.length > 1000, "no se encontró el bloque de las pantallas");
  assert.doesNotMatch(pantallas, /registrar|completar|otorgarFP|onCompletar/);
});
