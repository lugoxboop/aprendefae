import { test } from "node:test";
import assert from "node:assert/strict";
import { readFileSync, readdirSync } from "node:fs";
import { JSDOM, VirtualConsole } from "jsdom";

/*
 * ═══════════════════════════════════════════════════════════════════════════
 * T4 · EL ANDAMIO DEL TEMA (Célula D) — «Efectivo, caja menor y bancos».
 *
 *   · el tema está registrado entre el Tema 3 y el Tema 5, con su ruta, su
 *     vista en App.jsx y su título en la cabecera compacta
 *   · todo id de actividad del tema lleva el prefijo t4- y está en la vista
 *     que lo pinta (PIEZAS_T4 o JUEGOS_T4); ninguno sobra en la vista
 *   · ningún archivo de datos de T4 llama al motor de FP, y ninguna migración
 *     fuera del rango 0200-0249 nombra un id t4-
 *   · lo que ve el estudiante: la tarjeta del índice, y las dos mitades de la
 *     vista montadas de verdad en jsdom
 *
 * Mientras el tema esté vacío, la prueba de la tarjeta afirma que está vacía
 * (sin insignias, sin partir). Cuando entre A1, esa aserción se pone roja a
 * propósito: quien la construye actualiza lo que el estudiante debe ver.
 * ═══════════════════════════════════════════════════════════════════════════
 */

const dom = new JSDOM("<!doctype html><html><body></body></html>", { url: "http://localhost/", virtualConsole: new VirtualConsole() });
const w = dom.window;
const Observador = class { observe() {} unobserve() {} disconnect() {} };
w.matchMedia = () => ({ matches: false, addEventListener() {}, removeEventListener() {}, addListener() {}, removeListener() {} });
w.ResizeObserver = Observador;
w.IntersectionObserver = Observador;
w.Element.prototype.scrollIntoView = () => {};
w.scrollTo = () => {};
for (const [k, v] of Object.entries({
  window: w, document: w.document, navigator: w.navigator, localStorage: w.localStorage,
  HTMLElement: w.HTMLElement, Element: w.Element, Node: w.Node, SVGElement: w.SVGElement,
  Event: w.Event, MouseEvent: w.MouseEvent, KeyboardEvent: w.KeyboardEvent,
  getComputedStyle: w.getComputedStyle.bind(w), matchMedia: w.matchMedia,
  ResizeObserver: Observador, IntersectionObserver: Observador, scrollTo: w.scrollTo,
})) {
  Object.defineProperty(globalThis, k, { value: v, configurable: true, writable: true });
}
globalThis.IS_REACT_ACT_ENVIRONMENT = true;

const React = await import("react");
const { createRoot } = await import("react-dom/client");
const act = React.act;
const h = React.createElement;

const D = await import("../../data/contabilidadT4.js");
const { SUBJECTS, APRENDER, HACER, actividadesDeTipo, tiposDeTema, tieneContenidoDe } = await import("../../data/subjects.js");
const { default: ContabilidadT4View, PIEZAS_T4, JUEGOS_T4, TEMA_T4 } = await import("../../components/ContabilidadT4View.jsx");
const { default: TopicIndexView } = await import("../../components/TopicIndexView.jsx");
const { AuthContext } = await import("../../auth/AuthProvider.jsx");
const { VISTAS, vistaDeTema } = await import("../../ruta.js");

const RAIZ = new URL("../../../", import.meta.url);
const leer = (f) => readFileSync(new URL(f, RAIZ), "utf8");
const TEMA = SUBJECTS.contabilidad.topics.find((t) => t.id === TEMA_T4);
const SIN_CUENTA = { usuario: null, pedirCuenta: () => {} };

function montar(elemento) {
  const caja = document.createElement("div");
  document.body.appendChild(caja);
  const raiz = createRoot(caja);
  act(() => raiz.render(h(AuthContext.Provider, { value: SIN_CUENTA }, elemento)));
  return { caja, desmontar: () => { act(() => raiz.unmount()); caja.remove(); } };
}

/* ═══════════ 1 · REGISTRO, RUTA Y VISTA ═══════════ */

test("★★★ el tema está entre el Tema 3 y el Tema 5, con su id sin prefijo y su título", () => {
  assert.equal(TEMA_T4, "efectivo-caja-menor-bancos");
  assert.ok(TEMA, "subjects.js no tiene el tema T4");
  assert.equal(TEMA.title, "Efectivo, caja menor y bancos");
  const temas = SUBJECTS.contabilidad.topics.map((t) => t.id);
  assert.equal(temas.filter((id) => id === TEMA_T4).length, 1, "el tema está repetido");
  assert.equal(temas.indexOf(TEMA_T4), temas.indexOf("ingresos-gastos-y-caja") + 1);
  assert.equal(temas.indexOf("activos-financieros"), temas.indexOf(TEMA_T4) + 1);
});

test("★★★ tiene ruta, vista en App.jsx y título en la cabecera compacta", () => {
  assert.ok(VISTAS.has(TEMA_T4));
  assert.equal(vistaDeTema(TEMA_T4), TEMA_T4);
  const app = leer("src/App.jsx");
  assert.match(app, /const ContabilidadT4View = lazy\(\(\) => import\("\.\/components\/ContabilidadT4View\.jsx"\)\);/);
  assert.match(app, /if \(view === "efectivo-caja-menor-bancos"\) \{\s*return wrap\(\s*<Suspense fallback=\{siteFallback\}>\s*<ContabilidadT4View modo=\{modoTema\} nodoInicial=\{ruta\.extra\}/);
  assert.match(app, /VISTAS_CON_TITULO = new Set\(\[[^\]]*"efectivo-caja-menor-bancos"/);
});

test("★★★ cada id del tema lleva t4- y está en la vista; la vista no trae nada que el tema no tenga", () => {
  const ids = TEMA.actividades.map((a) => a.id);
  const aprender = actividadesDeTipo(TEMA, APRENDER).map((a) => a.id);
  const hacer = actividadesDeTipo(TEMA, HACER).filter((a) => !a.pendiente).map((a) => a.id);
  const enPiezas = PIEZAS_T4.map((p) => p.pieza.id);
  const enJuegos = JUEGOS_T4.map((j) => j.id);
  /* La guarda: hoy son cero en los cuatro sitios, y lo dice en voz alta. Al entrar A1, sube. */
  assert.deepEqual([ids.length, enPiezas.length, enJuegos.length], [0, 0, 0], "el andamio no debería traer piezas todavía");
  assert.deepEqual(ids.filter((id) => !id.startsWith("t4-")), [], "ids sin el prefijo t4-");
  assert.deepEqual(enPiezas.sort(), [...aprender].sort(), "PIEZAS_T4 no coincide con las de Aprender del tema");
  assert.deepEqual(enJuegos.sort(), [...hacer].sort(), "JUEGOS_T4 no coincide con las de Hacer del tema");
});

/* ═══════════ 2 · DATOS: NADA INVENTADO Y NADA QUE PAGUE ═══════════ */

test("★★★ los datos de T4: el id de A1 del corte, sin pantallas ni título hasta que llegue el texto", () => {
  assert.equal(D.A1_ID, "t4-a1-la-caja");
  assert.deepEqual(D.PIEZA_LA_CAJA, { id: "t4-a1-la-caja", numero: 1, titulo: "", pantallas: [] });
  assert.deepEqual(D.SECCION_DEL_LIBRO, { numero: "5.1", titulo: "Efectivo y equivalentes al efectivo: caja", pagina: 179 });
});

test("★★★ ningún archivo de datos de T4 llama al motor de FP, y ninguna migración fuera de 0200-0249 nombra un id t4-", () => {
  const datos = readdirSync(new URL("src/data/", RAIZ)).filter((f) => f.startsWith("contabilidadT4"));
  assert.ok(datos.length >= 1, "no se encontró ningún src/data/contabilidadT4*");
  for (const f of datos) {
    assert.doesNotMatch(leer(`src/data/${f}`), /from\s+["'][^"']*\/(fp|lib\/supabase)[^"']*["']|registrarActividad(Completada)?\s*\(|\.rpc\s*\(/, f);
  }
  const dir = new URL("supabase/migrations/", RAIZ);
  const migraciones = readdirSync(dir).filter((f) => f.endsWith(".sql"));
  /* La guarda: la búsqueda tiene que estar mirando donde viven las migraciones, y leerlas de verdad. */
  for (const conocida of ["0001_profiles.sql", "0103_t7_3_descuento_en_factura.sql"]) {
    assert.ok(migraciones.includes(conocida), `no se encontró ${conocida}: la ruta de las migraciones está mal`);
  }
  const conT7_3 = migraciones.filter((f) => /'t7-3-/.test(readFileSync(new URL(f, dir), "utf8")));
  assert.ok(conT7_3.includes("0103_t7_3_descuento_en_factura.sql"), "el patrón de búsqueda no encuentra ni un id t7-3- conocido");
  const fuera = migraciones.filter((f) => {
    const n = Number(f.slice(0, 4));
    return (n < 200 || n > 249) && /'t4-/.test(readFileSync(new URL(f, dir), "utf8"));
  });
  assert.deepEqual(fuera, []);
});

/* ═══════════ 3 · LO QUE VE EL ESTUDIANTE ═══════════ */

test("★★★ el índice: con el tema vacío, una tarjeta sin insignias y sin partir, que abre el tema sin modo", () => {
  /* Lo que decide la tarjeta, desde el dato. */
  assert.deepEqual(tiposDeTema(TEMA), []);
  assert.equal(tieneContenidoDe(TEMA, APRENDER), false);
  assert.equal(tieneContenidoDe(TEMA, HACER), false);

  const abiertos = [];
  const materia = SUBJECTS.contabilidad;
  const m = montar(h(TopicIndexView, {
    subjectId: materia.id, name: materia.name, accent: "#e9c46a", hoverBg: "", hoverBorder: "",
    background: null, topics: materia.topics, renderTopicIcon: () => null,
    onOpenTopic: (id, modo) => abiertos.push([id, modo ?? null]),
  }));
  try {
    const tarjetas = [...m.caja.querySelectorAll("button")].filter((b) => b.textContent.includes(TEMA.title));
    assert.equal(tarjetas.length, 1, `tarjetas con el título de T4: ${tarjetas.length}`);
    const [tarjeta] = tarjetas;
    assert.equal(tarjeta.getAttribute("aria-label"), `Tema ${TEMA.title}`);
    assert.doesNotMatch(tarjeta.textContent, /Aprender|Hacer/, "una tarjeta vacía no lleva insignias");
    act(() => { tarjeta.dispatchEvent(new w.MouseEvent("click", { bubbles: true })); });
    assert.deepEqual(abiertos, [[TEMA_T4, null]]);
  } finally { m.desmontar(); }
});

test("★★★ la vista montada: cabecera con el título; Aprender sin piezas; Hacer con el mensaje de camino vacío", () => {
  for (const [modo, esperado] of [[null, null], [APRENDER, null], [HACER, "Este tema todavía no tiene juegos."]]) {
    const m = montar(h(ContabilidadT4View, { modo, onBack: () => {} }));
    try {
      const h1 = m.caja.querySelectorAll("h1");
      assert.equal(h1.length, 1);
      assert.equal(h1[0].textContent, "Efectivo, caja menor y bancos");
      assert.ok(m.caja.querySelector('button[aria-label="Volver a Contabilidad"]'));
      assert.doesNotMatch(m.caja.textContent, /PIEZA \d+ DE/, `modo ${modo}: no hay piezas que numerar`);
      assert.doesNotMatch(m.caja.textContent, /NaN|undefined|null/, `modo ${modo}: se coló un valor crudo`);
      if (esperado) assert.ok(m.caja.textContent.includes(esperado), `modo ${modo}: falta «${esperado}»`);
      else assert.ok(!m.caja.textContent.includes("Este tema todavía no tiene juegos."), `modo ${modo}: Aprender no pinta el camino`);
    } finally { m.desmontar(); }
  }
});
