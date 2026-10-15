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
 * La guarda dice cuántas piezas hay: hoy, A0 y A1. Cada pieza nueva la pone
 * roja a propósito, y quien la construye la sube. El orden de PIEZAS_T4 lo
 * fija esta prueba, y lo fija por `numero` (A0 = 0, A1 = 1…), no por la
 * posición en la lista.
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
  /* La guarda: hoy, A0 y A1 de Aprender, y H1 de Hacer. Cada pieza nueva la sube a propósito. */
  assert.deepEqual([ids.length, enPiezas.length, enJuegos.length], [3, 2, 1], "cambió el número de piezas de T4: súbelo aquí a propósito");
  assert.deepEqual(ids, ["t4-a0-el-activo-corriente", "t4-a1-la-caja", "t4-entra-o-sale-de-caja"]);
  assert.deepEqual(ids.filter((id) => !id.startsWith("t4-")), [], "ids sin el prefijo t4-");
  assert.deepEqual(enPiezas.sort(), [...aprender].sort(), "PIEZAS_T4 no coincide con las de Aprender del tema");
  assert.deepEqual(enJuegos.sort(), [...hacer].sort(), "JUEGOS_T4 no coincide con las de Hacer del tema");
});

/* ═══════════ 2 · DATOS: NADA INVENTADO Y NADA QUE PAGUE ═══════════ */

test("★★★ el orden de PIEZAS_T4 es el de `numero`: A0, después A1, y una pieza nueva se inserta sin mover nada", () => {
  /*
   * El orden lo fija ESTA prueba: las piezas van por su número en el corte de
   * T4 —A0 «El activo corriente» = 0, A1 «La caja» = 1, A2 = 2…—, sin
   * repetir, y la vista las ordena por ese número, no por dónde se escribió
   * la fila. Una pieza de número 2 añadida al principio de la lista queda
   * igual tercera.
   */
  assert.deepEqual(PIEZAS_T4.map((p) => [p.numero, p.pieza.id]), [[0, "t4-a0-el-activo-corriente"], [1, "t4-a1-la-caja"]]);
  /* Y el orden del índice, en subjects.js, es el mismo: A0 abre el tema. */
  assert.deepEqual(TEMA.actividades.filter((a) => a.clasificacion?.tipo === APRENDER).map((a) => a.id), PIEZAS_T4.map((p) => p.pieza.id));
  const numeros = PIEZAS_T4.map((p) => p.numero);
  assert.deepEqual(numeros, [...numeros].sort((a, b) => a - b), "PIEZAS_T4 no va por número");
  assert.equal(new Set(numeros).size, numeros.length, "dos piezas con el mismo número");
  for (const p of PIEZAS_T4) assert.equal(p.numero, p.pieza.numero, `${p.pieza.id}: el número de la fila no es el de la pieza`);
  assert.match(leer("src/components/ContabilidadT4View.jsx"), /export const PIEZAS_T4 = \[[\s\S]*?\]\.sort\(\(a, b\) => a\.numero - b\.numero\);/);
  const conA2 = [{ numero: 2, pieza: { id: "t4-a2-el-fondo-fijo" } }, ...PIEZAS_T4].sort((a, b) => a.numero - b.numero);
  assert.deepEqual(conA2.map((p) => p.pieza.id), ["t4-a0-el-activo-corriente", "t4-a1-la-caja", "t4-a2-el-fondo-fijo"]);
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

test("★★★ el índice: con Aprender y Hacer, la tarjeta lleva las dos insignias, se parte y cada mitad abre su modo", () => {
  /* Lo que decide la tarjeta, desde el dato. Con H1, el tema ya tiene las dos mitades. */
  assert.deepEqual(tiposDeTema(TEMA), [APRENDER, HACER]);
  assert.equal(tieneContenidoDe(TEMA, APRENDER), true);
  assert.equal(tieneContenidoDe(TEMA, HACER), true);

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
    assert.match(tarjeta.textContent, /Aprender/, "la tarjeta lleva la insignia «Aprender»");
    assert.match(tarjeta.textContent, /Hacer/, "la tarjeta lleva la insignia «Hacer»");
    /* Tocarla abre la elección; cada mitad abre el tema en su modo, con su conteo. */
    act(() => { tarjeta.dispatchEvent(new w.MouseEvent("click", { bubbles: true })); });
    assert.deepEqual(abiertos, [], "tocar la tarjeta partida no abre el tema: abre la elección");
    const modo = (n) => [...m.caja.querySelectorAll("button.fae-modo")].find((b) => b.getAttribute("aria-label") === n);
    for (const [etiqueta, quiere] of [["Aprender — 2 actividades", "aprender"], ["Hacer — 1 actividad", "hacer"]]) {
      const b = modo(etiqueta);
      assert.ok(b, `no está la mitad «${etiqueta}»`);
      act(() => { b.dispatchEvent(new w.MouseEvent("click", { bubbles: true })); });
      assert.deepEqual(abiertos.at(-1), [TEMA_T4, quiere]);
    }
  } finally { m.desmontar(); }
});

test("★★★ el título del tema puede encogerse y romper en dos líneas, pero no cortarse: sus estilos en línea ganan a la elipsis del header compacto", () => {
  /*
   * La hoja compartida (AccountControl.jsx) le pone al h1 de .fae-cabecera-
   * titulo `white-space: nowrap`, `overflow: hidden` y elipsis por debajo de
   * ANCHO_ESTRECHO. Los estilos en línea del h1 de T4 la vencen. La medida de
   * verdad, a 320 y 375 px en Chromium, la hace scripts/t4/medir-titulo.mjs.
   */
  const m = montar(h(ContabilidadT4View, { modo: null, onBack: () => {} }));
  try {
    const h1 = m.caja.querySelector("h1[data-titulo-tema]");
    assert.ok(h1, "no está el h1 del tema");
    assert.equal(h1.textContent, TEMA.title);
    assert.ok(h1.closest(".fae-cabecera-titulo"), "el h1 ya no está en la fila del header compacto: esta prueba sobra o hay que moverla");
    const st = h1.style;
    assert.deepEqual([parseFloat(st.minWidth), st.flexShrink, st.whiteSpace, st.overflow, st.textOverflow], [0, "1", "normal", "visible", "clip"]);
  } finally { m.desmontar(); }
  const hoja = leer("src/components/auth/AccountControl.jsx");
  assert.match(hoja, /\.fae-cabecera-titulo > h1 \{[^}]*white-space: nowrap;/, "la hoja compartida ya no corta el título: revisar si esta excepción sigue haciendo falta");
});

test("★★★ la vista montada: cabecera con el título; Aprender con A0 y A1 como «PIEZA 1 DE 2» y «PIEZA 2 DE 2»; Hacer con el camino y su nodo H1", () => {
  for (const modo of [null, APRENDER, HACER]) {
    const m = montar(h(ContabilidadT4View, { modo, onBack: () => {} }));
    try {
      const h1 = m.caja.querySelectorAll("h1");
      assert.equal(h1.length, 1);
      assert.equal(h1[0].textContent, "Efectivo, caja menor y bancos");
      assert.ok(m.caja.querySelector('button[aria-label="Volver a Contabilidad"]'));
      assert.doesNotMatch(m.caja.textContent, /NaN|undefined|null/, `modo ${modo}: se coló un valor crudo`);
      if (modo === HACER) {
        assert.ok(!m.caja.textContent.includes("Este tema todavía no tiene juegos."), "Hacer: el camino sale vacío");
        assert.ok(m.caja.querySelector('[data-nodo="t4-entra-o-sale-de-caja"]'), "Hacer: falta el nodo de H1 en el camino");
        assert.equal(m.caja.querySelectorAll("[data-pieza]").length, 0);
      } else {
        assert.deepEqual(m.caja.textContent.match(/PIEZA \d+ DE \d+/g), ["PIEZA 1 DE 2", "PIEZA 2 DE 2"], `modo ${modo}: rótulos de las piezas`);
        assert.deepEqual([...m.caja.querySelectorAll("[data-pieza]")].map((x) => x.dataset.pieza), ["t4-a0-el-activo-corriente", "t4-a1-la-caja"]);
        assert.ok(!m.caja.textContent.includes("Este tema todavía no tiene juegos."), `modo ${modo}: Aprender no pinta el camino`);
      }
    } finally { m.desmontar(); }
  }
});
