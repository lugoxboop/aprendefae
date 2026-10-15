import { test } from "node:test";
import assert from "node:assert/strict";
import { readFileSync, readdirSync } from "node:fs";
import { JSDOM, VirtualConsole } from "jsdom";

/*
 * ═══════════════════════════════════════════════════════════════════════════
 * T4 · A0 «El activo corriente» (Célula D) · Aprender.
 *
 *   · cada pantalla dice EXACTAMENTE los textos del paquete de Katsumi, en su
 *     orden, letra por letra; si llega un archivo de cambios de A0, la prueba
 *     se pone roja hasta aplicarlo
 *   · lo que se ve: cada pantalla montada en jsdom, en cada estado —cada
 *     opción equivocada y la correcta de su pregunta— pinta sus textos, su
 *     retroalimentación y su pie
 *   · la figura «La raya del año»: en qué pantalla va, qué cae a cada lado de
 *     la raya, que no dibuja la respuesta mientras pregunta, sin colores de
 *     Debe/Haber ni coral, y nada se mueve con movimiento reducido
 *   · INFLESZ con la herramienta oficial, y el número del paquete
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

const Z = await import("../../data/contabilidadT4A0.js");
const { BOTON, INTERFAZ } = await import("../../data/contabilidadT4.js");
const { SUBJECTS, APRENDER } = await import("../../data/subjects.js");
const { PantallasT4, CSS_T4F, PIEZAS_T4, TEMA_T4 } = await import("../../components/ContabilidadT4View.jsx");
const { inflesz } = await import("../../herramientas/inflesz.js");
const { leer, leerSecciones, cambiosDe, textosDeDatos, PAQUETES, RAIZ, CITA } = await import("./t4-paquete.mjs");

const V1 = leer(`${PAQUETES}d4-t4-a0-v1.md`);
const P = Z.PIEZA_EL_ACTIVO_CORRIENTE;
const pantalla = (id) => P.pantallas.find((x) => x.id === id);
const S = leerSecciones(V1);

/* Los archivos de cambios de A0 que esta prueba aplica. Uno nuevo la pone en rojo. */
const APLICADOS = ["d4-t4-a0-v2-cambios.md"];
const V2 = leer(`${PAQUETES}d4-t4-a0-v2-cambios.md`);

/*
 * v2 (auditoría de Shibukawa), en sus formas:
 *   · pares «- v1: «…»» / «- **v2:** «…»»
 *   · la tabla «| Opción correcta | «v1» (…) | «v2» (…) |» (y la del acierto)
 *   · las dos líneas nuevas al final de P1, después de «Esa es la prueba…»
 *   · «Pie de P1: pasa de «…» a «…»»
 */
const V2_PARES = [...V2.matchAll(new RegExp(`^- v1: ${CITA}[^\\n]*\\n- \\*\\*v2:\\*\\* ${CITA}`, "gm"))].map((m) => ({ viejo: m[1], nuevo: m[2] }));
const V2_TABLA = [...V2.matchAll(new RegExp(`^\\| (?:Opción correcta|Acierto) \\| ${CITA} \\([^)]*\\) \\| ${CITA} \\([^)]*\\) \\|$`, "gm"))].map((m) => ({ viejo: m[1], nuevo: m[2] }));
const OBLIGATORIA_3 = V2.slice(V2.indexOf("## Obligatoria 3"), V2.indexOf("\n## ", V2.indexOf("## Obligatoria 3") + 5));
const V2_NUEVAS_P1 = [...OBLIGATORIA_3.matchAll(new RegExp(`^- ${CITA} \\(\\d+,\\d\\)$`, "gm"))].map((m) => m[1]);
const V2_PIE_P1 = OBLIGATORIA_3.match(new RegExp(`Pie de P1: pasa de ${CITA} a ${CITA}`));
const conV2 = (t) => [...V2_PARES, ...V2_TABLA].find((x) => x.viejo === t)?.nuevo ?? t;

/* El paquete, en su orden: P0…P8 de la v1, con la v2 encima. */
const IDS = ["portada", "prueba-del-ano", "analogia", "ejemplos", "cual-es-corriente", "activos-fijos", "por-que-importan", "efectivo-primero", "resumen"];
const PAQUETE = IDS.map((id, k) => {
  const sec = S[`P${k}`];
  const textos = sec.textos.map(conV2);
  if (id === "prueba-del-ano") textos.push(...V2_NUEVAS_P1);
  const pies = sec.pies.map((x) => (id === "prueba-del-ano" && V2_PIE_P1 && x === V2_PIE_P1[1] ? V2_PIE_P1[2] : x));
  return { id, bloque: sec.bloque, textos, pies };
});

/* ═══════════ 1 · EL TEXTO, CONTRA EL PAQUETE ═══════════ */

test("★★★ todos los archivos de cambios de A0 que hay en la carpeta están aplicados, y la v2 se leyó entera", () => {
  assert.deepEqual(cambiosDe("a0"), APLICADOS, "hay un archivo de cambios de A0 que esta pieza no aplica todavía");
  assert.deepEqual([V2_PARES.length, V2_TABLA.length, V2_NUEVAS_P1.length, Boolean(V2_PIE_P1)], [2, 2, 2, true], "la lectura de la v2 no encontró sus cambios");
  const todo = P.pantallas.flatMap(textosDeDatos).join("\n");
  for (const r of [...V2_PARES, ...V2_TABLA]) {
    assert.ok(todo.includes(r.nuevo), `falta el texto de la v2: «${r.nuevo}»`);
    assert.ok(!P.pantallas.flatMap(textosDeDatos).includes(r.viejo), `quedó un texto que la v2 sustituye: «${r.viejo}»`);
  }
  for (const t of V2_NUEVAS_P1) assert.ok(pantalla("prueba-del-ano").parrafos.includes(t), `falta en P1: «${t}»`);
  /* Las dos líneas nuevas van al final de P1, después de «Esa es la prueba…». */
  assert.deepEqual(pantalla("prueba-del-ano").parrafos.slice(-2), V2_NUEVAS_P1);
});

test("★★★ las 9 pantallas, en el orden del paquete; título e id", () => {
  assert.equal(Object.keys(S).length, 9, "la v1 no trae sus nueve pantallas P0-P8: la lectura del paquete está mal");
  assert.deepEqual(P.pantallas.map((x) => x.id), IDS);
  assert.equal(P.titulo, V1.match(/- Título: «([^»]+)»/)[1]);
  assert.equal(P.id, "t4-a0-el-activo-corriente");
  assert.equal(P.numero, 0);
});

for (const { id, textos, pies } of PAQUETE) {
  test(`★★★ ${id}: los textos son los del paquete, letra por letra, ni uno más ni uno menos`, () => {
    assert.ok(textos.length >= 1, `${id}: no se leyó ningún texto del paquete`);
    assert.deepEqual([...textosDeDatos(pantalla(id))].sort(), [...textos].sort());
    /* La analogía no tiene pie: el paquete dice «Pie: ninguno (es construcción)». */
    assert.equal(pies[0] ?? null, pantalla(id).pie ?? null, `${id}: pie`);
  });
}

test("★★★ la analogía no lleva pie, porque es construcción; las demás sí", () => {
  assert.match(S.P2.bloque, /- Pie: ninguno \(es construcción\)\./);
  assert.deepEqual(P.pantallas.filter((p) => !p.pie).map((p) => p.id), ["analogia"]);
});

test("★★ INFLESZ con la herramienta oficial: todo texto de 10 palabras o más da 65 o más, y lo que dice el paquete", () => {
  const textos = P.pantallas.flatMap(textosDeDatos);
  const medidos = textos.map((t) => ({ t, r: inflesz(t) })).filter((x) => x.r.aplica);
  assert.ok(medidos.length >= 25, `solo ${medidos.length} textos de 10 palabras o más: algo no se leyó`);
  assert.deepEqual(medidos.filter((x) => !x.r.cumple).map((x) => `${x.r.valor} · ${x.t}`), []);
  for (const { t, r } of medidos) {
    const m = V1.match(new RegExp(`«${t.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")}»\\s*\\((\\d+,\\d)`));
    if (m) assert.equal(r.valor, Number(m[1].replace(",", ".")), `INFLESZ de «${t.slice(0, 40)}…»`);
  }
  /* Sin cifras: los porcentajes de la p. 179 no entran. */
  assert.deepEqual(textos.filter((t) => /\$|\d+ ?%/.test(t)), []);
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
const pieDe = (c) => c.querySelector("[data-pie]")?.textContent ?? null;
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

test("★★★ cada pantalla de lectura muestra sus textos en orden, su pie y su botón; nada más fuera de la figura", () => {
  const m = montar();
  try {
    const lecturas = P.pantallas.filter((p) => p.tipo !== "eleccion");
    assert.equal(lecturas.length, 8);
    for (const p of lecturas) {
      irA(m.caja, p.id);
      assert.deepEqual(visibles(m.caja), textosDeDatos(p), `${p.id}: textos en pantalla`);
      assert.equal(pieDe(m.caja), p.pie, `${p.id}: pie`);
      const botones = [...m.caja.querySelectorAll("[data-boton]")].map((b) => b.textContent);
      assert.deepEqual(botones, p.id === "resumen" ? [] : [p.tipo === "portada" ? "Empezar" : "Seguir"], `${p.id}: botones`);
      const sueltos = [...m.caja.querySelectorAll("[data-pieza] *")]
        .filter((el) => !el.matches("style") && !el.closest("[data-figura]") && [...el.childNodes].some((x) => x.nodeType === 3 && x.textContent.trim()))
        .map((el) => el.textContent.trim());
      assert.deepEqual(sueltos.filter((t) => !textosDeDatos(p).includes(t) && t !== p.pie && !INTERFAZ_MARCADA.has(t)), [], `${p.id}: texto que no viene del paquete`);
      if (p.listaNumerada) {
        assert.equal(m.caja.querySelector("[data-lista]").tagName, "OL", `${p.id}: lista sin numerar`);
        assert.equal(m.caja.querySelectorAll("[data-lista] li").length, p.listaNumerada.length);
      }
    }
  } finally { m.desmontar(); }
});

const raya = (c) => c.querySelector('[data-figura="raya"]');
const lado = (f, id) => [...f.querySelectorAll(`[data-zona="${id}"] [data-tarjeta]`)].map((x) => x.dataset.tarjeta);
const señaladas = (f) => [...f.querySelectorAll("[data-tarjeta][data-foco]")].map((x) => x.dataset.tarjeta);

test("★★★ la pregunta: cada opción equivocada muestra «Incorrecto.» y SU retroalimentación; la figura no dibuja la respuesta mientras pregunta", () => {
  const p = pantalla("cual-es-corriente");
  const m = montar();
  try {
    irA(m.caja, p.id);
    assert.equal(m.caja.querySelector("[data-pregunta]").textContent, p.pregunta);
    assert.deepEqual([...m.caja.querySelectorAll("[data-opcion]")].map((b) => b.textContent).sort(), p.opciones.map((o) => o.texto).sort());
    /* Colocando: la raya y sus zonas, sin una sola tarjeta. */
    let f = raya(m.caja);
    assert.equal(f.dataset.estado, "p4-colocando");
    assert.equal(f.querySelectorAll("[data-tarjeta]").length, 0, "colocando: la figura ya trae tarjetas");
    const esperado = { edificio: "edificio", "deuda-tres-anos": "deuda" };
    for (const o of p.opciones.filter((x) => !x.correcta)) {
      tocar(m.caja.querySelector(`[data-opcion="${o.id}"]`));
      tocar(boton(m.caja, "confirmar"));
      const msg = m.caja.querySelector('[data-mensaje="error"]');
      assert.equal(msg.querySelector("[data-palabra]").textContent, "Incorrecto.");
      assert.equal(msg.querySelector("[data-devolucion]").textContent, o.devolucion, `${o.id}: retroalimentación`);
      assert.equal(pieDe(m.caja), p.error.pie);
      /* El error: solo la tarjeta del distractor elegido, señalada, en su sitio verdadero (debajo de la raya). */
      f = raya(m.caja);
      assert.deepEqual([lado(f, "antes"), lado(f, "despues"), señaladas(f)], [[], [esperado[o.id]], [esperado[o.id]]], `${o.id}: figura`);
      assert.equal(f.querySelector(".t4ry-op-error, [class*=error]"), null, "la figura no pinta el error");
      tocar(boton(m.caja, "probar-otra"));
      assert.equal(raya(m.caja).querySelectorAll("[data-tarjeta]").length, 0, "«Probar otra» vuelve a la raya vacía");
    }
    tocar(m.caja.querySelector('[data-opcion="mercancia"]'));
    tocar(boton(m.caja, "confirmar"));
    const ok = m.caja.querySelector('[data-mensaje="acierto"]');
    assert.equal(ok.querySelector("[data-palabra]").textContent, "Correcto.");
    assert.equal(ok.querySelector("[data-devolucion]").textContent, p.acierto.texto);
    f = raya(m.caja);
    assert.deepEqual([lado(f, "antes"), lado(f, "despues"), señaladas(f)], [["mercancia"], ["deuda", "edificio"], ["mercancia"]]);
  } finally { m.desmontar(); }
});

test("★★★ en P4 las zonas reservan el mismo alto en los cuatro estados, para que la raya no salte", () => {
  for (const e of ["p4-colocando", "p4-error-edificio", "p4-error-deuda", "p4-acierto"]) assert.equal(Z.ESTADOS_RAYA[e].p4, true, e);
  const m = montar();
  try {
    irA(m.caja, "cual-es-corriente");
    const altos = () => [...raya(m.caja).querySelectorAll("[data-zona]")].map((z) => z.style.minHeight);
    assert.deepEqual(altos(), ["122.52px", "174.25px"]);
    tocar(m.caja.querySelector('[data-opcion="edificio"]'));
    tocar(boton(m.caja, "confirmar"));
    assert.deepEqual(altos(), ["122.52px", "174.25px"]);
  } finally { m.desmontar(); }
});

test("★★★ la figura va donde la pide Hanayama, con lo que cae a cada lado de la raya", () => {
  const esperado = {
    portada: null, "prueba-del-ano": [[], [], []], analogia: null,
    ejemplos: [["caja", "bancos", "inversiones", "cartera", "inventarios"], [], []],
    "activos-fijos": [["caja", "bancos", "inversiones", "cartera", "inventarios"], ["un-edificio", "terreno", "maquina", "vehiculo"], ["un-edificio", "terreno", "maquina", "vehiculo"]],
    "por-que-importan": null,
    "efectivo-primero": [["caja", "bancos", "inversiones", "cartera", "inventarios"], ["un-edificio", "terreno", "maquina", "vehiculo"], ["caja", "bancos"]],
    resumen: [["caja", "bancos", "inversiones", "cartera", "inventarios"], ["un-edificio", "terreno", "maquina", "vehiculo"], []],
  };
  const m = montar();
  try {
    for (const [id, quiere] of Object.entries(esperado)) {
      irA(m.caja, id);
      const f = raya(m.caja);
      if (!quiere) { assert.equal(f, null, `${id}: no lleva figura`); continue; }
      assert.ok(f, `${id}: falta la figura`);
      assert.deepEqual([lado(f, "antes"), lado(f, "despues"), señaladas(f)], quiere, `${id}: tarjetas`);
      assert.equal(f.querySelector("figcaption").textContent, Z.FIGURA_RAYA.alt[f.dataset.estado], `${id}: texto alternativo`);
      assert.equal(f.getAttribute("aria-describedby"), f.querySelector("figcaption").id);
      /* Los rótulos de las dos zonas y del margen, del único sitio donde viven. */
      assert.deepEqual([...f.querySelectorAll(".t4ry-zrot")].map((r) => [...r.children].map((x) => x.textContent)), [Z.FIGURA_RAYA.zonaSi, Z.FIGURA_RAYA.zonaNo]);
      assert.deepEqual([...f.querySelectorAll(".t4ry-mar")].map((x) => x.textContent).filter(Boolean), ["hoy", "1 año"]);
      /* El eje sigue debajo de la raya (§2.4): un eje por zona, y cada tarjeta con su muesca. */
      assert.equal(f.querySelectorAll(".t4ry-eje").length, 2, `${id}: el eje no sigue debajo de la raya`);
      assert.equal(f.querySelectorAll("[data-tarjeta] .t4ry-tick").length, f.querySelectorAll("[data-tarjeta]").length);
      for (const t of f.querySelectorAll(".t4ry-tick")) assert.equal(t.style.visibility, "", `${id}: muesca escondida`);
      /* La figura es otra cosa que A1: ni Debe ni Haber. */
      assert.doesNotMatch(f.textContent, /Debe|Haber/);
    }
  } finally { m.desmontar(); }
});

test("★★★ la figura: sin teal, ámbar ni coral, sin trazos discontinuos; los renglones no se parten; nada se mueve con movimiento reducido", () => {
  const fig = CSS_T4F.slice(CSS_T4F.indexOf("/* raya del año */"), CSS_T4F.indexOf("@media"));
  assert.ok(fig.length > 500, "no se encontró la hoja de la figura");
  assert.doesNotMatch(fig, /#2A9D8F|#E9C46A|#E76F51|dashed|dotted|border-radius: 50%/i);
  assert.match(fig, /\.t4ry-tarj > span \{ white-space: nowrap; \}/);
  assert.match(fig, /\.t4ry-zrot > span \{ white-space: nowrap; \}/);
  assert.match(fig, /\.t4ry-mar \{[^}]*white-space: nowrap;/);
  assert.match(CSS_T4F, /@media \(prefers-reduced-motion: reduce\) \{ \.t4cj \*, \.t4ry \*, \.t4f-nueva \{ transition: none !important; animation: none !important; \} \}/);
  /* El rótulo de la zona de abajo vive en un solo sitio, para que la v1.1 de Hanayama lo cambie fácil. */
  const datos = leer("src/data/contabilidadT4A0.js");
  assert.equal(datos.split(JSON.stringify(Z.FIGURA_RAYA.zonaNo[1])).length - 1, 1);
});

/* ═══════════ 3 · APRENDER NO DA FP ═══════════ */

test("★★★ fuera del catálogo de FP: Aprender en subjects.js, primera del tema, ninguna migración la nombra, y sus datos no llaman al motor", () => {
  const tema = SUBJECTS.contabilidad.topics.find((t) => t.id === TEMA_T4);
  assert.equal(tema.actividades[0].id, Z.A0_ID);
  assert.deepEqual(tema.actividades[0].clasificacion, { tipo: APRENDER });
  assert.equal(tema.actividades[0].nombre, P.titulo);
  assert.equal(PIEZAS_T4[0].pieza, P);
  const dir = new URL("supabase/migrations/", RAIZ);
  const migraciones = readdirSync(dir);
  assert.ok(migraciones.includes("0001_profiles.sql"), "la ruta de las migraciones está mal");
  assert.deepEqual(migraciones.filter((f) => readFileSync(new URL(f, dir), "utf8").includes(Z.A0_ID)), []);
  assert.doesNotMatch(leer("src/data/contabilidadT4A0.js"), /from\s+["'][^"']*\/(fp|lib\/supabase)[^"']*["']|registrarActividad(Completada)?\s*\(|\.rpc\s*\(/);
});
