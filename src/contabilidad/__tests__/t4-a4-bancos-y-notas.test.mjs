import { test } from "node:test";
import assert from "node:assert/strict";
import { readFileSync, readdirSync } from "node:fs";
import { JSDOM, VirtualConsole } from "jsdom";

/*
 * ═══════════════════════════════════════════════════════════════════════════
 * T4 · A4 «Bancos y notas del banco» (Célula D) · Aprender.
 *
 *   · cada pantalla dice EXACTAMENTE los textos del paquete vigente de
 *     Katsumi (con la v2 y la v3 dentro), letra por letra, y ningún texto
 *     que esas versiones sustituyen sigue
 *   · LOS DOS TÉRMINOS: en los datos se llaman exactamente «Nota débito» y
 *     «Nota crédito» (A4-P), con la definición de P2. La guardia de la
 *     Célula B se pone roja con esto: es lo acordado (ver el PR)
 *   · los dos asientos de la p. 187 y sus cifras; ninguna de San Calixto
 *   · P4: «girar» se glosa en su primera aparición, debajo del renglón 1
 *   · P7: la lista de las seis causas sale SOLO con el acierto (v3)
 *   · la figura «Las dos libretas» de Hanayama (v1 + v1.1): renglones
 *     alineados con subgrid, «Nota débito · resta», «Nota crédito · suma»,
 *     sin «libro auxiliar» ni «extracto» en P2 (FA4-1), el renglón del cheque
 *     guardando su sitio en P7 mientras se pregunta (PH8-2), y una tabla para
 *     el lector de pantalla
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

const Z = await import("../../data/contabilidadT4A4.js");
const { BOTON, INTERFAZ, DEBE, HABER } = await import("../../data/contabilidadT4.js");
const { SUBJECTS, APRENDER } = await import("../../data/subjects.js");
const { PantallasT4, CSS_T4L, PIEZAS_T4, TEMA_T4 } = await import("../../components/ContabilidadT4View.jsx");
const { inflesz } = await import("../../herramientas/inflesz.js");
const { leer, leerSecciones, textosDeDatos, PAQUETES, RAIZ, CITA, blobEnLaRamaFuente, archivosEnLaRamaFuente, blobDeLaCopia, RAMA_FUENTE } = await import("./t4-paquete.mjs");

/*
 * El detector de la guardia de la Célula B, leído de su archivo y no
 * importado: importarlo registraría aquí sus pruebas, y su guardia (roja a
 * propósito con A4) pondría roja esta. Se lee su regla del término y sus
 * claves; si B las cambia, esta prueba lo nota.
 */
const GUARDIA_B = leer("src/contabilidad/__tests__/b5-t6-glosa-nota-debito.test.mjs");
const reglaB = new RegExp(GUARDIA_B.match(/const ES_EL_TERMINO = \/(.+?)\/;/)[1]);
const clavesB = (nombre) => JSON.parse(GUARDIA_B.match(new RegExp(`const ${nombre} = (\\[[^\\]]+\\]);`))[1]);
const normalB = (t) => t.normalize("NFD").replace(/\p{Diacritic}/gu, "").toLowerCase().trim();
const defineNotaDebito = (o) => clavesB("CLAVES_DE_TERMINO").some((k) => typeof o[k] === "string" && reglaB.test(normalB(o[k])))
  && clavesB("CLAVES_DE_DEFINICION").some((k) => typeof o[k] === "string" && o[k].trim().length > 20);

const V1 = leer(`${PAQUETES}d4-t4-a4-v1.md`);
const V2A = leer(`${PAQUETES}d4-t4-a3-a4-v2-cambios.md`);
const V2B = leer(`${PAQUETES}d4-t4-h3-h5-a4-v2-cambios.md`);
const V3 = leer(`${PAQUETES}d4-t4-a4-h8-v3-cambios.md`);
const P = Z.PIEZA_BANCOS_Y_NOTAS;
const pantalla = (id) => P.pantallas.find((x) => x.id === id);
const S = leerSecciones(V1);

const DE_A4 = ["d4-t4-a3-a4-v2-cambios.md", "d4-t4-a4-h8-v3-cambios.md", "d4-t4-h3-h5-a4-v2-cambios.md"];
const IDS = ["portada", "que-es-bancos", "las-notas", "lo-que-sube", "lo-que-baja", "el-ejemplo", "dos-libros", "por-que-no-coinciden", "la-conciliacion", "resumen"];
const PAQUETE = IDS.map((id, k) => ({ id, ...S[`P${k}`] }));

/* Lo que la v2 sustituye en A4: las filas «v1 (revelaba) → v2» de su tabla, y «abonar». */
const V2_A4 = V2A.slice(V2A.indexOf("# A4 «Bancos"), V2A.indexOf("## Lo que no cambia"));
const V2_FILAS = [...V2_A4.matchAll(new RegExp(`^\\| ${CITA} \\| ${CITA}(?: \\([^)]*\\))? \\| ${CITA}`, "gm"))].map((m) => ({ opcion: m[1], viejo: m[2].replace(/^… /, "").replace(/…$/, ""), nuevo: m[3] }));
const V2_ABONAR = V2B.slice(V2B.indexOf("# A4 «Bancos"), V2B.indexOf("## A4-P"));

/* ═══════════ 1 · EL TEXTO, CONTRA EL PAQUETE ═══════════ */

test("★★★ el paquete base es la versión vigente; la v2 y la v3 están dentro y ningún texto que sustituyen sigue", () => {
  assert.match(V1, /\*\*Este archivo es la versión vigente\*\*: ya incluye la parte de A4 de `d4-t4-a3-a4-v2-cambios\.md`, de `d4-t4-h3-h5-a4-v2-cambios\.md` y de `d4-t4-a4-h8-v3-cambios\.md`/);
  assert.deepEqual(readdirSync(new URL(PAQUETES, RAIZ)).filter((f) => /^d4-t4-.*a4.*-cambios\.md$/.test(f)).sort(), DE_A4, "hay un archivo de cambios de A4 que esta pieza no ha mirado todavía");
  assert.equal(V2_FILAS.length, 4, "no se leyeron los cuatro errores de la v2");
  const datos = P.pantallas.flatMap(textosDeDatos);
  for (const f of V2_FILAS) {
    assert.ok(f.viejo.length > 15);
    assert.ok(!datos.some((t) => t.includes(f.viejo)), `los datos traen un texto viejo: «${f.viejo}»`);
    const o = P.pantallas.flatMap((p) => p.opciones ?? []).find((x) => x.texto === f.opcion);
    assert.ok(o, `la v2 nombra una opción que no existe: «${f.opcion}»`);
    assert.equal(o.devolucion, f.nuevo);
  }
  /* v2, A4-b: «abonar» se glosa en su primera aparición, en P2. */
  /* La línea de P2 nombra antes la cita del libro («cuando le abona intereses»): la glosa es la última cita de la línea. */
  const linea = V2_ABONAR.split("\n").find((l) => l.includes("**P2, debajo de la definición de nota crédito**"));
  const glosa = [...linea.matchAll(new RegExp(CITA, "g"))].at(-1)[1];
  assert.deepEqual(pantalla("las-notas").parrafos.slice(2, 4), [Z.NOTA_CREDITO.definicion, glosa]);
  /* v3: la lista de las seis causas, solo con el acierto de P7. */
  assert.match(V3, /\*\*Con el acierto\*\*, como cierre: «Estas son las seis causas del libro, según quién se enteró primero:»/);
  assert.equal(pantalla("por-que-no-coinciden").listaNumerada, undefined, "la lista va antes de la pregunta: la responde");
  /* «girar» no aparece antes de P4, donde se define; «Ltda.» y «nota» van en llano. */
  const antes = P.pantallas.slice(0, IDS.indexOf("lo-que-baja")).flatMap(textosDeDatos).join("\n");
  assert.doesNotMatch(antes, /\bgir(a|ar|ó)\b/i, "«girar» antes de su definición");
});

test("★★★ la copia de los paquetes de A4 es la de la punta de la rama de Katsumi (si este clon la tiene)", (t) => {
  if (!archivosEnLaRamaFuente()) { t.skip(`este clon no tiene ${RAMA_FUENTE}`); return; }
  for (const f of ["d4-t4-a4-v1.md", ...DE_A4]) assert.equal(blobDeLaCopia(f), blobEnLaRamaFuente(f), `${f}: la copia no es la de la punta de ${RAMA_FUENTE}`);
});

test("★★★ las 10 pantallas, en el orden del paquete; título e id", () => {
  assert.equal(Object.keys(S).length, 10, "el paquete vigente no trae sus diez pantallas P0-P9");
  assert.deepEqual(P.pantallas.map((x) => x.id), IDS);
  assert.equal(P.titulo, V1.match(/- Título: «([^»]+)»/)[1]);
  assert.equal(P.id, "t4-a4-bancos-y-notas");
  assert.equal(P.numero, 4);
});

for (const { id, textos, pies } of PAQUETE) {
  test(`★★★ ${id}: los textos son los del paquete, letra por letra, ni uno más ni uno menos`, () => {
    assert.ok(textos.length >= 1, `${id}: no se leyó ningún texto del paquete`);
    const p = pantalla(id);
    const datos = textosDeDatos(p).filter((t) => !(p.opciones ?? []).some((o) => o.texto === t && !textos.includes(t)));
    assert.deepEqual([...datos].sort(), [...textos].sort());
    assert.equal(pies.length >= 1 ? pies[0] : null, p.pie ?? null, `${id}: pie`);
    for (const x of pies) assert.ok([p.pie, p.acierto?.pie, p.error?.pie].includes(x), `${id}: pie «${x}»`);
  });
}

test("★★★ las opciones de las dos preguntas son las del paquete, con su retroalimentación y una sola correcta", () => {
  for (const id of ["lo-que-baja", "por-que-no-coinciden"]) {
    const bloque = PAQUETE.find((x) => x.id === id).bloque;
    const filas = [...bloque.matchAll(new RegExp(`^\\| ${CITA}(?: \\([^)]*\\))? \\| (sí|no) \\| ${CITA}`, "gm"))].map((m) => [m[1], m[2] === "sí", m[3]]);
    assert.equal(filas.length, 3, `${id}: no se leyeron las tres opciones del paquete`);
    const p = pantalla(id);
    assert.deepEqual(p.opciones.map((o) => [o.texto, Boolean(o.correcta), o.correcta ? p.acierto.texto : o.devolucion]), filas);
  }
});

/* ═══════════ 2 · LOS DOS TÉRMINOS Y LA GUARDIA DE LA CÉLULA B ═══════════ */

test("★★★ los términos se llaman EXACTAMENTE «Nota débito» y «Nota crédito» en los datos, con la definición de P2", () => {
  assert.deepEqual(Z.TERMINOS_A4.map((t) => t.termino), ["Nota débito", "Nota crédito"]);
  assert.match(V1, /en los DATOS, el término se llama exactamente «Nota débito» y «Nota crédito»/);
  /* La definición es la de pantalla, letra por letra. */
  const p2 = PAQUETE.find((x) => x.id === "las-notas").textos;
  assert.ok(p2.includes(Z.NOTA_DEBITO.definicion) && p2.includes(Z.NOTA_CREDITO.definicion));
  assert.ok(pantalla("las-notas").parrafos.includes(Z.NOTA_DEBITO.definicion));
  /* Es compatible con la glosa de B: el banco resta un valor, con el cheque devuelto de ejemplo. */
  assert.match(Z.NOTA_DEBITO.definicion, /el banco le resta un valor a la cuenta/);
  assert.match(Z.NOTA_DEBITO.definicion, /le devuelve el cheque/);
});

test("★★★ el detector de la Célula B reconoce nuestra definición: con A4 construido, su guardia tiene que ponerse ROJA", () => {
  assert.ok(String(reglaB).includes("notas?") && clavesB("CLAVES_DE_TERMINO").includes("termino") && clavesB("CLAVES_DE_DEFINICION").includes("definicion"), "no se leyó el detector de la guardia de B");
  /* Es el criterio de cierre de A4-P: si esto da false, el nombre quedó mal y B nunca retira su glosa. */
  assert.equal(defineNotaDebito(Z.NOTA_DEBITO), true, "la guardia de B no ve nuestra definición de nota débito");
  /* Con «del banco» en el término, la guardia no la vería: por eso el término va a secas. */
  assert.equal(defineNotaDebito({ ...Z.NOTA_DEBITO, termino: "Nota débito del banco" }), false);
});

test("★★★ los textos de interfaz son los que revisó Katsumi en el paquete, con sus dos cambios (p7-colocando y comparar)", () => {
  const i = V1.indexOf("## Textos de interfaz de la figura");
  assert.ok(i > 0, "el paquete de A4 no trae la sección de textos de interfaz revisados");
  const sec = V1.slice(i, V1.indexOf("\n## ", i + 5) > 0 ? V1.indexOf("\n## ", i + 5) : undefined);
  const citas = new Set([...sec.matchAll(new RegExp(CITA, "g"))].map((m) => m[1]));
  const alt = [...sec.matchAll(new RegExp(`^  - \\*([a-z0-9-]+)[:,]?\\*[^«\\n]*${CITA}`, "gm"))].map((m) => [m[1], m[2]]);
  assert.equal(alt.length, 5, "no se leyeron los cinco textos alternativos del paquete");
  for (const [estado, texto] of alt) assert.equal(Z.ALT_LIBRETAS[estado], texto, `alternativo de ${estado}`);
  assert.deepEqual(Object.keys(Z.ALT_LIBRETAS).sort(), alt.map(([e]) => e).sort());
  /* El que Katsumi cambió por la pista falsa: ya no dice que ninguno lo tiene. */
  assert.doesNotMatch(Z.ALT_LIBRETAS["p7-colocando"], /todavía sin ese renglón/);
  const F = Z.FIGURA_LIBRETAS;
  for (const t of [...Object.values(Z.NOMBRE_ASIENTO_A4), F.empresa.nombre, F.empresa.registro, F.banco.nombre, F.banco.registro, F.suma, F.resta, ...F.noLoSabe, F.saldo, F.tarjetaP7.cuando, ...F.tarjetaP7.renglones, ...Object.values(F.hechos).flatMap((x) => x.nombre)]) {
    assert.ok(citas.has(t), `«${t}» no está entre los textos aprobados`);
  }
  assert.doesNotMatch(leer("src/data/contabilidadT4A4.js"), /PENDIENTE DE REVISIÓN/);
});

/* ═══════════ 3 · LAS CIFRAS Y LOS ASIENTOS ═══════════ */

test("★★★ los dos asientos son las tablas del paquete y cuadran; las únicas cifras son las de la p. 187", () => {
  const tablas = [];
  let actual = null;
  for (const l of PAQUETE.find((x) => x.id === "el-ejemplo").bloque.split("\n")) {
    if (/^\|/.test(l)) {
      const c = l.split("|").slice(1, -1).map((x) => x.trim());
      if (!actual) { actual = []; tablas.push(actual); } else if (!/^-+$/.test(c[0])) actual.push(c);
      if (c[0] === "Cuenta") actual.length = 0;
    } else actual = null;
  }
  assert.equal(tablas.length, 2, "no se leyeron los dos asientos del paquete");
  const filas = (a) => a.lineas.map((l) => [l.cuenta, l.lado === DEBE ? String(l.monto).replace(/\B(?=(\d{3})+(?!\d))/g, ".") : "", l.lado === HABER ? String(l.monto).replace(/\B(?=(\d{3})+(?!\d))/g, ".") : ""]);
  assert.deepEqual(filas(Z.ASIENTO_CONSIGNACION), tablas[0]);
  assert.deepEqual(filas(Z.ASIENTO_CHEQUE), tablas[1]);
  for (const a of [Z.ASIENTO_CONSIGNACION, Z.ASIENTO_CHEQUE]) {
    const suma = (lado) => a.lineas.filter((l) => l.lado === lado).reduce((s, l) => s + l.monto, 0);
    assert.equal(suma(DEBE), suma(HABER), `${a.nombre}: no cuadra`);
    assert.equal(a.fecha, undefined, "el libro pone «xxxx»: sin fecha");
  }
  assert.deepEqual(pantalla("el-ejemplo").asientos, [Z.ASIENTO_CONSIGNACION, Z.ASIENTO_CHEQUE]);
  const cifras = new Set(P.pantallas.flatMap(textosDeDatos).flatMap((t) => [...t.matchAll(/\$\d{1,3}(?:\.\d{3})*/g)].map((m) => m[0])));
  assert.deepEqual([...cifras].sort(), ["$398.200", "$876.000"]);
});

test("★★ INFLESZ con la herramienta oficial: todo texto de 10 palabras o más da 65 o más, y lo que dice el paquete", () => {
  const textos = P.pantallas.flatMap(textosDeDatos);
  const medidos = textos.map((t) => ({ t, r: inflesz(t) })).filter((x) => x.r.aplica);
  assert.ok(medidos.length >= 25, `solo ${medidos.length} textos de 10 palabras o más`);
  assert.deepEqual(medidos.filter((x) => !x.r.cumple).map((x) => `${x.r.valor} · ${x.t}`), []);
  let cotejados = 0;
  for (const { t, r } of medidos) {
    const m = V1.match(new RegExp(`«${t.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")}»\\s*\\((\\d+,\\d)`));
    if (m) { cotejados++; assert.equal(r.valor, Number(m[1].replace(",", ".")), `INFLESZ de «${t.slice(0, 40)}…»`); }
  }
  assert.ok(cotejados >= 20, `solo se cotejaron ${cotejados} medidas`);
});

/* ═══════════ 4 · LO QUE SE VE ═══════════ */

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
const figura = (c) => c.querySelector('[data-figura="libretas"]');
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

test("★★★ P4: «girar» se define debajo del renglón 1 de la lista, y la pregunta no la responde la glosa", () => {
  const m = montar();
  try {
    irA(m.caja, "lo-que-baja");
    const lis = [...m.caja.querySelectorAll("[data-lista] > li")];
    assert.equal(lis.length, 3);
    assert.equal(lis[0].querySelector("[data-glosa]").textContent, pantalla("lo-que-baja").glosaDeLista.texto);
    assert.equal(lis[0].firstChild.textContent, "Los cheques que gira la empresa.");
    assert.equal(lis[1].querySelector("[data-glosa]"), null);
    assert.match(V1, /Debajo, en la primera aparición del verbo: «Girar un cheque es firmarlo/);
  } finally { m.desmontar(); }
});

for (const id of ["lo-que-baja", "por-que-no-coinciden"]) {
  test(`★★★ ${id}: cada opción equivocada muestra «Incorrecto.» y SU retroalimentación, sin revelar; lo de después del acierto sale solo con el acierto`, () => {
    const p = pantalla(id);
    const m = montar();
    try {
      irA(m.caja, id);
      const tras = [...(p.trasAcertar?.textos ?? []), ...(p.trasAcertar?.grupos ?? []).flatMap((g) => [g.titulo, ...g.causas])];
      const sinTras = (cuando) => {
        const html = m.caja.querySelector("[data-pieza]").outerHTML;
        for (const t of tras) assert.ok(!html.includes(t), `${cuando}: el DOM ya trae «${t.slice(0, 40)}…»`);
      };
      sinTras("colocando");
      for (const o of p.opciones.filter((x) => !x.correcta)) {
        tocar(m.caja.querySelector(`[data-opcion="${o.id}"]`));
        tocar(boton(m.caja, "confirmar"));
        const msg = m.caja.querySelector('[data-mensaje="error"]');
        assert.equal(msg.querySelector("[data-devolucion]").textContent, o.devolucion);
        assert.ok(!msg.textContent.includes(p.opciones.find((x) => x.correcta).texto.replace(/\.$/, "")), `${o.id}: el error revela la respuesta`);
        sinTras(`error ${o.id}`);
        tocar(boton(m.caja, "probar-otra"));
      }
      tocar(m.caja.querySelector(`[data-opcion="${p.opciones.find((o) => o.correcta).id}"]`));
      tocar(boton(m.caja, "confirmar"));
      assert.equal(m.caja.querySelector('[data-mensaje="acierto"] [data-devolucion]').textContent, p.acierto.texto);
      assert.deepEqual(visibles(m.caja), textosDeDatos(p).filter((t) => !p.opciones.some((o) => o.texto === t || (!o.correcta && o.devolucion === t))), "acierto: textos en pantalla");
      if (id === "por-que-no-coinciden") {
        /* Las seis causas, numeradas de corrido en sus tres grupos. */
        const grupos = [...m.caja.querySelectorAll("[data-grupo]")];
        assert.equal(grupos.length, 3);
        assert.deepEqual(grupos.map((g) => g.querySelector("ol").getAttribute("start")), ["1", "3", "5"]);
        assert.equal(m.caja.querySelectorAll("[data-grupo] li").length, 6);
      }
    } finally { m.desmontar(); }
  });
}

/* ═══════════ 5 · LA FIGURA: «LAS DOS LIBRETAS» ═══════════ */

const renglones = (f, lado) => [...f.querySelectorAll(`[data-libreta="${lado}"] .t4lb-ren`)].map((r) => r.dataset.renglon ?? (r.hasAttribute("data-hueco-renglon") ? "hueco" : "?"));

test("★★★ la figura va solo donde la pide Hanayama, en su estado; P7 depende del acierto", () => {
  assert.deepEqual(P.pantallas.filter((p) => p.figura).map((p) => [p.id, p.figura.estado ?? p.figura.estados]), [
    ["las-notas", "notas"],
    ["dos-libros", "dos-libros"],
    ["por-que-no-coinciden", { colocando: "p7-colocando", error: "p7-colocando", acierto: "p7-acierto" }],
    ["la-conciliacion", "comparar"],
  ]);
  const m = montar();
  try {
    for (const p of P.pantallas.filter((x) => x.tipo !== "eleccion")) {
      irA(m.caja, p.id);
      assert.equal(m.caja.querySelectorAll("[data-figura]").length, p.figura ? 1 : 0, `${p.id}: figura`);
      if (p.figura) assert.equal(figura(m.caja).querySelector("figcaption").textContent, Z.ALT_LIBRETAS[p.figura.estado]);
    }
  } finally { m.desmontar(); }
});

test("★★★ P2: «Nota débito» resta y «Nota crédito» suma, del lado del banco; la empresa «todavía no lo sabe»; sin «libro auxiliar» ni «extracto» (FA4-1)", () => {
  const m = montar();
  try {
    irA(m.caja, "las-notas");
    const f = figura(m.caja);
    const deb = f.querySelector('[data-libreta="banco"] [data-renglon="nota-debito"]');
    const cre = f.querySelector('[data-libreta="banco"] [data-renglon="nota-credito"]');
    assert.equal(deb.querySelector(".t4lb-nom").textContent, "Nota débito");
    assert.equal(deb.querySelector("[data-efecto]").textContent, "resta");
    assert.equal(cre.querySelector(".t4lb-nom").textContent, "Nota crédito");
    assert.equal(cre.querySelector("[data-efecto]").textContent, "suma");
    for (const id of ["nota-debito", "nota-credito"]) assert.equal(f.querySelector(`[data-libreta="empresa"] [data-renglon="${id}"]`).textContent, "todavía nolo sabe");
    assert.doesNotMatch(f.textContent, /auxiliar|extracto/, "P2 nombra «libro auxiliar» o «extracto» antes de P6");
    assert.equal(f.querySelectorAll("[data-registro]").length, 0);
    /* El subtítulo y «su saldo» guardan su sitio, sin texto. */
    assert.equal(f.querySelectorAll(".t4lb-cab .t4lb-oculto").length, 2);
    assert.equal(f.querySelector('[data-saldo="oculto"]').textContent.trim(), "");
    /* Desde P6, la cabecera dice los dos registros. */
    tocar(boton(m.caja, "seguir"));
    irA(m.caja, "dos-libros");
    assert.deepEqual([...figura(m.caja).querySelectorAll("[data-registro]")].map((x) => x.textContent), ["libro auxiliar", "extracto del mes"]);
    assert.deepEqual([...figura(m.caja).querySelectorAll('[data-saldo="visible"]')].map((x) => x.textContent), ["su saldo", "su saldo"]);
    /* Sin renglones, la rejilla sigue teniendo la fila de la cabecera y la del pie: «repeat(0, auto)» no es CSS válido. */
    assert.match(figura(m.caja).querySelector(".t4lb-par").getAttribute("style"), /grid-template-rows: auto auto;/);
  } finally { m.desmontar(); }
});

test("★★★ PH8-2 · P7: mientras pregunta y en cada error, el renglón del cheque guarda su sitio SIN su contenido; con el acierto aparece", () => {
  const p = pantalla("por-que-no-coinciden");
  const m = montar();
  try {
    irA(m.caja, "por-que-no-coinciden");
    const comoColocando = (cuando) => {
      const f = figura(m.caja);
      assert.equal(f.dataset.estado, "p7-colocando", cuando);
      for (const lado of ["empresa", "banco"]) assert.deepEqual(renglones(f, lado), ["hueco"], `${cuando}: ${lado}`);
      for (const hu of f.querySelectorAll("[data-hueco-renglon]")) { assert.equal(hu.textContent.trim(), ""); assert.equal(hu.getAttribute("aria-hidden"), "true"); }
      for (const t of ["Cheque", "girado", "resta", "todavía no", "lo sabe"]) assert.ok(!f.querySelector(".t4lb-par").outerHTML.includes(t), `${cuando}: las libretas ya traen «${t}»`);
      assert.equal(f.querySelectorAll("[data-tabla-libretas] tbody tr").length, 0, `${cuando}: la tabla del lector ya trae el renglón`);
      assert.deepEqual([...f.querySelectorAll("[data-tarjeta-hecho] span")].map((x) => x.textContent), ["El 30 del mes", "La empresa gira un cheque", "nadie lo ha cobrado"]);
      return sinEstilo(f.outerHTML);
    };
    const enColocando = comoColocando("colocando");
    for (const o of p.opciones.filter((x) => !x.correcta)) {
      tocar(m.caja.querySelector(`[data-opcion="${o.id}"]`));
      tocar(boton(m.caja, "confirmar"));
      assert.equal(comoColocando(`error ${o.id}`), enColocando, `error ${o.id}: la figura cambió`);
      tocar(boton(m.caja, "probar-otra"));
    }
    tocar(m.caja.querySelector('[data-opcion="la-empresa"]'));
    tocar(boton(m.caja, "confirmar"));
    const f = figura(m.caja);
    assert.equal(f.dataset.estado, "p7-acierto");
    assert.deepEqual([...f.querySelectorAll('[data-libreta="empresa"] [data-renglon="cheque"] .t4lb-nom')].map((x) => x.textContent), ["Cheque", "girado"]);
    assert.equal(f.querySelector('[data-libreta="empresa"] [data-renglon="cheque"] [data-efecto]').textContent, "resta");
    assert.ok(f.querySelector('[data-libreta="banco"] [data-renglon="cheque"][data-no-lo-sabe]'));
  } finally { m.desmontar(); }
});

test("★★★ P8: los cuatro hechos en el orden de la agrupación, cada uno de su lado; la tabla para el lector tiene encabezados de fila", () => {
  const m = montar();
  try {
    irA(m.caja, "la-conciliacion");
    const f = figura(m.caja);
    const orden = ["cheque", "consignacion", "nota-debito", "nota-credito"];
    for (const lado of ["empresa", "banco"]) assert.deepEqual(renglones(f, lado), orden);
    assert.deepEqual([...f.querySelectorAll('[data-anotado="empresa"]')].map((x) => x.dataset.renglon), ["cheque", "consignacion"]);
    assert.deepEqual([...f.querySelectorAll('[data-anotado="banco"]')].map((x) => x.dataset.renglon), ["nota-debito", "nota-credito"]);
    /* Las dos libretas comparten las filas de la rejilla: subgrid. */
    assert.match(CSS_T4L, /\.t4lb-lib \{[^}]*grid-template-rows: subgrid;/);
    assert.match(f.querySelector(".t4lb-par").getAttribute("style"), /grid-template-rows: auto auto auto auto auto auto;/);
    /* La tabla: dos columnas con encabezado, y una fila por hecho con su encabezado de fila. */
    const tabla = f.querySelector("[data-tabla-libretas]");
    assert.deepEqual([...tabla.querySelectorAll("thead th")].map((x) => [x.textContent, x.getAttribute("scope")]), [["La empresa", "col"], ["El banco", "col"]]);
    assert.deepEqual([...tabla.querySelectorAll("tbody th")].map((x) => [x.textContent, x.getAttribute("scope")]), [["Cheque girado", "row"], ["Consignación", "row"], ["Nota débito", "row"], ["Nota crédito", "row"]]);
    assert.deepEqual([...tabla.querySelectorAll("tbody tr")].map((tr) => [...tr.querySelectorAll("td")].map((x) => x.textContent)), [["resta", "todavía no lo sabe"], ["suma", "todavía no lo sabe"], ["todavía no lo sabe", "resta"], ["todavía no lo sabe", "suma"]]);
    assert.equal(f.querySelector(".t4lb-par").getAttribute("aria-hidden"), "true");
    /* Sin cifras dentro de la figura. */
    assert.doesNotMatch(f.querySelector(".t4lb-par").textContent, /\d/);
  } finally { m.desmontar(); }
});

test("★★★ la regla del dibujo: «Nota débito» siempre resta y «Nota crédito» siempre suma; «Cheque girado» en dos renglones fijos", () => {
  const F = Z.FIGURA_LIBRETAS;
  assert.deepEqual([F.hechos["nota-debito"].efecto, F.hechos["nota-credito"].efecto, F.hechos.cheque.efecto, F.hechos.consignacion.efecto], ["resta", "suma", "resta", "suma"]);
  assert.deepEqual(F.hechos.cheque.nombre, ["Cheque", "girado"]);
  assert.deepEqual([F.hechos["nota-debito"].nombre, F.hechos["nota-credito"].nombre], [["Nota débito"], ["Nota crédito"]]);
  assert.equal(F.hechos["nota-debito"].nombre[0], Z.NOTA_DEBITO.termino);
});

test("★★★ la figura: sin teal, ámbar ni coral, sin trazos discontinuos; los renglones no se parten; nada se mueve con movimiento reducido", () => {
  assert.doesNotMatch(CSS_T4L, /#2A9D8F|#E9C46A|#E76F51|dashed|dotted|border-radius: 50%/i);
  for (const clase of ["t4lb-nom", "t4lb-ef, .t4lb-no", "t4lb-pie"]) assert.match(CSS_T4L, new RegExp(`\\.${clase} \\{[^}]*white-space: nowrap;`), `.${clase}`);
  assert.match(CSS_T4L, /\.t4lb-cab > span:first-child \{[^}]*white-space: nowrap;/);
  assert.match(CSS_T4L, /\.t4lb-oculto \{ visibility: hidden; \}/);
  assert.match(CSS_T4L, /@media \(prefers-reduced-motion: reduce\) \{ \.t4lb, \.t4lb \* \{ transition: none !important; animation: none !important; \} \}/);
});

/* ═══════════ 6 · APRENDER NO DA FP ═══════════ */

test("★★★ fuera del catálogo de FP: Aprender en subjects.js, después de H4 (H5 se fundió en H4); ninguna migración la nombra, y sus datos no llaman al motor", () => {
  const tema = SUBJECTS.contabilidad.topics.find((t) => t.id === TEMA_T4);
  const ids = tema.actividades.map((a) => a.id);
  assert.equal(ids.indexOf(Z.A4_ID), ids.indexOf("t4-el-arqueo-de-rosa") + 1);
  const a = tema.actividades.find((x) => x.id === Z.A4_ID);
  assert.deepEqual(a.clasificacion, { tipo: APRENDER });
  assert.equal(a.nombre, P.titulo);
  assert.equal(PIEZAS_T4.find((x) => x.pieza.id === Z.A4_ID).pieza, P);
  const dir = new URL("supabase/migrations/", RAIZ);
  const migraciones = readdirSync(dir);
  assert.ok(migraciones.includes("0001_profiles.sql"));
  assert.deepEqual(migraciones.filter((f) => readFileSync(new URL(f, dir), "utf8").includes(Z.A4_ID)), []);
  assert.doesNotMatch(leer("src/data/contabilidadT4A4.js"), /from\s+["'][^"']*\/(fp|lib\/supabase)[^"']*["']|registrarActividad(Completada)?\s*\(|\.rpc\s*\(/);
});
