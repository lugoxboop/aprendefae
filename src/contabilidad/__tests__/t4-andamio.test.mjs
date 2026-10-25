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
 * La guarda dice cuántas piezas hay: hoy, A0 a A4. Cada pieza nueva la pone
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
/* Las figuras del rediseño de enganche cuentan cifras y pasan el año con requestAnimationFrame. */
w.requestAnimationFrame = (f) => setTimeout(() => f(performance.now()), 0);
w.cancelAnimationFrame = (id) => clearTimeout(id);
for (const [k, v] of Object.entries({
  window: w, document: w.document, navigator: w.navigator, localStorage: w.localStorage,
  HTMLElement: w.HTMLElement, Element: w.Element, Node: w.Node, SVGElement: w.SVGElement,
  Event: w.Event, MouseEvent: w.MouseEvent, KeyboardEvent: w.KeyboardEvent,
  getComputedStyle: w.getComputedStyle.bind(w), matchMedia: w.matchMedia,
  ResizeObserver: Observador, IntersectionObserver: Observador, scrollTo: w.scrollTo,
  requestAnimationFrame: w.requestAnimationFrame, cancelAnimationFrame: w.cancelAnimationFrame,
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
const { default: ContabilidadT4View, PIEZAS_T4, JUEGOS_T4, TEMA_T4, SLIDES_T4 } = await import("../../components/ContabilidadT4View.jsx");
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
  /*
   * La guarda: hoy, A0 a A5 de Aprender, y los cinco Hacer del corte de calidad
   * (H1, H3, H4 con H5 dentro, H7 con H6 dentro y H8). Cada pieza nueva la sube
   * a propósito, y una que sale la baja a propósito.
   */
  assert.deepEqual([ids.length, enPiezas.length, enJuegos.length], [11, 6, 5], "cambió el número de piezas de T4: súbelo aquí a propósito");
  assert.deepEqual(ids, ["t4-a0-el-activo-corriente", "t4-a1-la-caja", "t4-entra-o-sale-de-caja", "t4-a2-el-fondo-fijo", "t4-se-mueve-la-caja-menor", "t4-a3-el-arqueo", "t4-el-arqueo-de-rosa", "t4-a4-bancos-y-notas", "t4-a5-san-calixto", "t4-concilia-la-cuenta", "t4-se-asienta-o-no"]);
  /* H2, H5 y H6 salieron del catálogo (corte de calidad; la 0208 las retira en blando del catálogo): ni en el tema ni en la vista. */
  for (const id of ["t4-el-control-que-se-saltaron", "t4-al-empleado-o-al-gasto", "t4-quien-se-entero-primero"]) {
    assert.ok(!ids.includes(id) && !enJuegos.includes(id), `${id} salió del catálogo y sigue en T4`);
  }
  assert.deepEqual(ids.filter((id) => !id.startsWith("t4-")), [], "ids sin el prefijo t4-");
  assert.deepEqual(enPiezas.sort(), [...aprender].sort(), "PIEZAS_T4 no coincide con las de Aprender del tema");
  assert.deepEqual(enJuegos.sort(), [...hacer].sort(), "JUEGOS_T4 no coincide con las de Hacer del tema");
});

/* ═══════════ 2 · DATOS: NADA INVENTADO Y NADA QUE PAGUE ═══════════ */

test("★★★ el orden de PIEZAS_T4 es el de `numero`: A0 a A5, y una pieza nueva se inserta sin mover nada", () => {
  /*
   * El orden lo fija ESTA prueba: las piezas van por su número en el corte de
   * T4 —A0 «El activo corriente» = 0, A1 «La caja» = 1, A2 = 2…—, sin
   * repetir, y la vista las ordena por ese número, no por dónde se escribió
   * la fila. Una pieza de número 2 añadida al principio de la lista queda
   * igual tercera.
   */
  assert.deepEqual(PIEZAS_T4.map((p) => [p.numero, p.pieza.id]), [[0, "t4-a0-el-activo-corriente"], [1, "t4-a1-la-caja"], [2, "t4-a2-el-fondo-fijo"], [3, "t4-a3-el-arqueo"], [4, "t4-a4-bancos-y-notas"], [5, "t4-a5-san-calixto"]]);
  /* Y el orden del índice, en subjects.js, es el mismo: A0 abre el tema. */
  assert.deepEqual(TEMA.actividades.filter((a) => a.clasificacion?.tipo === APRENDER).map((a) => a.id), PIEZAS_T4.map((p) => p.pieza.id));
  const numeros = PIEZAS_T4.map((p) => p.numero);
  assert.deepEqual(numeros, [...numeros].sort((a, b) => a - b), "PIEZAS_T4 no va por número");
  assert.equal(new Set(numeros).size, numeros.length, "dos piezas con el mismo número");
  for (const p of PIEZAS_T4) assert.equal(p.numero, p.pieza.numero, `${p.pieza.id}: el número de la fila no es el de la pieza`);
  assert.match(leer("src/components/ContabilidadT4View.jsx"), /export const PIEZAS_T4 = \[[\s\S]*?\]\.sort\(\(a, b\) => a\.numero - b\.numero\);/);
  const conA6 = [{ numero: 6, pieza: { id: "t4-a6" } }, ...PIEZAS_T4].sort((a, b) => a.numero - b.numero);
  assert.deepEqual(conA6.map((p) => p.pieza.id), ["t4-a0-el-activo-corriente", "t4-a1-la-caja", "t4-a2-el-fondo-fijo", "t4-a3-el-arqueo", "t4-a4-bancos-y-notas", "t4-a5-san-calixto", "t4-a6"]);
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
    /* Los botones de modo de ESTA tarjeta: otro tema puede tener el mismo conteo (el Tema 1 también tiene 4 de Aprender). */
    const modo = (n) => [...tarjeta.closest(".fae-split").querySelectorAll("button.fae-modo")].find((b) => b.getAttribute("aria-label") === n);
    for (const [etiqueta, quiere] of [["Aprender — 6 actividades", "aprender"], ["Hacer — 5 actividades", "hacer"]]) {
      const b = modo(etiqueta);
      assert.ok(b, `no está la mitad «${etiqueta}»`);
      act(() => { b.dispatchEvent(new w.MouseEvent("click", { bubbles: true })); });
      assert.deepEqual(abiertos.at(-1), [TEMA_T4, quiere]);
    }
  } finally { m.desmontar(); }
});

test("★★★ el título del tema rompe en dos renglones antes que perder palabras, y lo resuelve la hoja compartida, no esta vista", () => {
  /*
   * ESTA PRUEBA CAMBIÓ DE OBJETO, Y VALE LA PENA DECIR POR QUÉ.
   *
   * Comprobaba que los estilos EN LÍNEA del h1 de T4 vencieran al `nowrap` de
   * la hoja compartida, y que la hoja compartida siguiera poniendo ese
   * `nowrap`. Las dos cosas describían un rodeo: la hoja cortaba el título y
   * cada vista se defendía por su cuenta. Siete vistas llegaron al mismo
   * rodeo —T4, T5, T6 y las tres de T7, más el repaso del capítulo 5—.
   *
   * La hoja ya no corta: recorta a dos renglones para toda
   * `.fae-cabecera-titulo > h1` —cuatro renglones, medidos—. Así que los
   * rodeos se fueron, y con ellos las
   * dos afirmaciones que los vigilaban. Afirmar que el rodeo sigue puesto
   * habría dejado esta prueba en rojo pidiendo que se devolviera un defecto.
   *
   * Lo que NO cambió es lo que la prueba defiende: el título no pierde
   * palabras. Eso ahora se comprueba donde vive —en la hoja— y en el sentido
   * correcto: que recorte por renglones y que NO haya vuelto el `nowrap`.
   * Si alguien lo devuelve, aquí se entera.
   *
   * La medida de verdad, a 320 y 375 px en Chromium, la hace
   * scripts/t4/medir-titulo.mjs. Una regla de CSS leída de un archivo dice
   * qué se pidió, no qué se ve.
   */
  const m = montar(h(ContabilidadT4View, { modo: null, onBack: () => {} }));
  try {
    const h1 = m.caja.querySelector("h1[data-titulo-tema]");
    assert.ok(h1, "no está el h1 del tema");
    assert.equal(h1.textContent, TEMA.title);
    assert.ok(h1.closest(".fae-cabecera-titulo"), "el h1 ya no está en la fila del header compacto: esta prueba sobra o hay que moverla");
    /*
     * Y SIN ESTILOS EN LÍNEA QUE PELEEN CON LA HOJA. Son los que ganan, así
     * que uno de estos puesto aquí anula el recorte compartido sin que nadie
     * lo note: `overflow: visible` bastaba para que el tope de dos renglones
     * dejara de topar. La tipografía sí se queda.
     */
    const st = h1.style;
    for (const prop of ["white-space", "overflow", "text-overflow", "min-width", "flex-shrink", "overflow-wrap", "-webkit-line-clamp"]) {
      assert.equal(st.getPropertyValue(prop), "", `el h1 vuelve a traer ${prop} en línea, y eso vence a la hoja compartida`);
    }
  } finally { m.desmontar(); }

  const hoja = leer("src/components/auth/AccountControl.jsx");
  const regla = hoja.match(/\.fae-cabecera-titulo > h1 \{([^}]*)\}/)?.[1];
  assert.ok(regla, "la hoja compartida ya no tiene regla para el título del header compacto");
  assert.match(regla, /-webkit-line-clamp:\s*4;/, "cambió el tope de renglones del título: hay que volver a medir a 320 px");
  assert.match(regla, /white-space:\s*normal;/, "el título dejó de poder romper de renglón");
  assert.doesNotMatch(regla, /nowrap/, "volvió el nowrap: el título perderá palabras otra vez");
  assert.doesNotMatch(regla, /text-overflow:\s*ellipsis;/, "volvió la elipsis: el título perderá palabras otra vez");
});

test("★★★ la vista montada: cabecera con el título; Aprender con A0 a A5 en SecuenciaAprender («Pieza 1 de 6»); Hacer con el camino y su nodo H1", () => {
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
        /* Los slides (#488): una pantalla a la vez; el contador de piezas es el del contenedor, sin ámbar. */
        assert.deepEqual(SLIDES_T4.map((s) => s.id), ["t4-a0-el-activo-corriente", "t4-a1-la-caja", "t4-a2-el-fondo-fijo", "t4-a3-el-arqueo", "t4-a4-bancos-y-notas", "t4-a5-san-calixto"], "faltan piezas en los slides");
        assert.match(m.caja.querySelector("[data-contador-pieza]")?.textContent ?? "", /^Pieza 1 de 6$/, `modo ${modo}: el contador de piezas`);
        assert.deepEqual([...m.caja.querySelectorAll("[data-pieza]")].map((x) => x.dataset.pieza), ["t4-a0-el-activo-corriente"]);
        assert.ok(m.caja.querySelector(".t4-sec [data-secuencia]").dataset.secuencia.startsWith(`${TEMA_T4}/`), "la clave guardada no lleva el tema y el caso");
        assert.ok(!m.caja.textContent.includes("Este tema todavía no tiene juegos."), `modo ${modo}: Aprender no pinta el camino`);
      }
    } finally { m.desmontar(); }
  }
});

test("★★★ ningún texto de T4 queda «[ESCRITO POR CLAUDE — PENDIENTE DE REVISIÓN]»: todo lo que ve u oye el estudiante lo revisó Katsumi", () => {
  const raiz = new URL("../../../", import.meta.url);
  const archivos = [
    ...readdirSync(new URL("src/data/", raiz)).filter((f) => /^(contabilidadT4|asiSeJuegaT4)/.test(f)).map((f) => `src/data/${f}`),
    ...readdirSync(new URL("src/components/t4/", raiz), { recursive: true }).filter((f) => /\.jsx?$/.test(f)).map((f) => `src/components/t4/${f}`),
    "src/components/ContabilidadT4View.jsx",
  ];
  assert.ok(archivos.length >= 8, "no se encontraron los archivos de T4");
  const MARCA_PENDIENTE = /ESCRITO POR CLAUDE\s*[—-]\s*PENDIENTE DE REVISI[ÓO]N/;
  const con = archivos.filter((f) => MARCA_PENDIENTE.test(readFileSync(new URL(f, raiz), "utf8")));
  assert.deepEqual(con, [], "archivos de T4 con textos sin revisar");
});

/* ═══════════ D8 · EL CASO DE CADA PIEZA ═══════════ */

test("★★★ D8 · el caso: la primera vez el 1; ya terminada, el sorteo (1 o 2); el forzado manda; sin almacenamiento, el 1", async () => {
  const C = await import("../../components/t4/caso.js");
  const prev = Object.getOwnPropertyDescriptor(globalThis, "localStorage");
  const mem = new Map();
  Object.defineProperty(globalThis, "localStorage", { configurable: true, value: { getItem: (k) => (mem.has(k) ? mem.get(k) : null), setItem: (k, v) => mem.set(k, String(v)), removeItem: (k) => mem.delete(k) } });
  try {
    assert.equal(C.casoInicial("t4-a2-el-fondo-fijo", () => 0.9), 1, "la primera vez no es el caso 1");
    C.marcarTerminada("t4-a2-el-fondo-fijo");
    assert.equal(C.casoInicial("t4-a2-el-fondo-fijo", () => 0.9), 2);
    assert.equal(C.casoInicial("t4-a2-el-fondo-fijo", () => 0.1), 1);
    assert.equal(C.casoInicial("t4-a3-el-arqueo", () => 0.9), 1, "terminar una pieza sortea otra");
    mem.set(C.CLAVE_FORZADO, "2");
    assert.equal(C.casoInicial("t4-a3-el-arqueo", () => 0.1), 2, "el forzado no manda");
    Object.defineProperty(globalThis, "localStorage", { configurable: true, get() { throw new Error("bloqueado"); } });
    assert.equal(C.casoInicial("t4-a2-el-fondo-fijo", () => 0.9), 1, "sin almacenamiento no es el caso 1");
    C.marcarTerminada("t4-a2-el-fondo-fijo");
  } finally {
    if (prev) Object.defineProperty(globalThis, "localStorage", prev); else delete globalThis.localStorage;
  }
});

test("★★★ D8 · las seis piezas de Aprender tienen su caso B, con las mismas pantallas, en el mismo orden, y las mismas preguntas", async () => {
  const { PIEZAS_T4 } = await import("../../components/ContabilidadT4View.jsx");
  for (const { pieza: P } of PIEZAS_T4) {
    assert.ok(P.casoB, `${P.id}: sin caso B`);
    assert.equal(P.casoB.id, P.id);
    assert.deepEqual(P.casoB.pantallas.map((p) => [p.id, Boolean(p.pregunta)]), P.pantallas.map((p) => [p.id, Boolean(p.pregunta)]), P.id);
  }
});

test("★★ el identificador del tema (Hanayama, sistema de Xeno): 64 × 64, trazo de 3 px redondeado y currentColor; un solo elemento en el acento, que se mueve 4 px; sin letras ni círculos; en reposo, el billete a 4 px o más del cajón; ya en el registro, como el de T4 (Ukyo, logitos-temas-conta-v1 §4)", async () => {
  const src = readFileSync(new URL("../identificadores/CajonDePaso.jsx", import.meta.url), "utf8");
  const svg = src.slice(src.indexOf("<svg"), src.indexOf("</svg>"));
  assert.match(svg, /viewBox="0 0 64 64"/);
  assert.match(svg, /stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"/);
  assert.equal((svg.match(/var\(--fae-acento\)/g) ?? []).length, 2, "el acento en más de un elemento");
  assert.equal((svg.match(/data-mueve/g) ?? []).length, 1);
  assert.match(svg, /"--mueve": "translateY\(4px\)"/);
  assert.doesNotMatch(svg, /<text|<circle|<ellipse/);
  const [, y, h] = svg.match(/<rect data-mueve x="\d+" y="(\d+)" width="\d+" height="(\d+)"/).map(Number);
  const bocaY = 18;
  assert.ok(bocaY - 1.5 - (y + h + 1.5) >= 4, "en reposo, el billete a menos de 4 px del cajón");
  const reg = readFileSync(new URL("../../data/identificadoresDeTema.js", import.meta.url), "utf8");
  assert.match(reg, /"contabilidad\/efectivo-caja-menor-bancos": CajonDePaso/, "el cajón no está en el registro con la clave de T4");
});
