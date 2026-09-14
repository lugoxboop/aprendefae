/*
 * ═══════════════════════════════════════════════════════════════════════════
 * LA PRESENTACIÓN DE POLÍTICA FISCAL — el mando, volver atrás y lo que no puntúa.
 *
 * Se monta la presentación entera en un DOM de mentira (jsdom) y se maneja
 * como la maneja un profesor: con teclas mandadas a la ventana, sin haber
 * hecho clic en nada antes. Lo que tiene que cumplir:
 *
 *   · con las dos teclas de un mando se da la clase entera, de la primera
 *     punta de la brújula a la última respuesta;
 *   · volver atrás no deshace nada, ni dentro de la sesión ni tras recargar;
 *   · la respuesta de un chequeo no está en la página hasta revelarla;
 *   · la brújula es reutilizable: sus seis puntas son dato;
 *   · nada de esto puntúa.
 *
 * El suelo del texto y si la paleta aguanta un proyector no se prueban aquí:
 * eso se mira con capturas de verdad, no con un DOM sin pintar.
 * ═══════════════════════════════════════════════════════════════════════════
 */
import { test } from "node:test";
import assert from "node:assert/strict";
import { readFileSync, readdirSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { JSDOM, VirtualConsole } from "jsdom";

/* ─────────────── un navegador de mentira, ANTES de cargar React ─────────────── */

const dom = new JSDOM("<!doctype html><html><body></body></html>", {
  url: "http://localhost/",
  virtualConsole: new VirtualConsole(),
});
const w = dom.window;
const Observador = class { observe() {} unobserve() {} disconnect() {} };
w.matchMedia = () => ({ matches: false, addEventListener() {}, removeEventListener() {}, addListener() {}, removeListener() {} });

for (const [k, v] of Object.entries({
  window: w, document: w.document, navigator: w.navigator,
  HTMLElement: w.HTMLElement, Element: w.Element, Node: w.Node, SVGElement: w.SVGElement,
  Event: w.Event, MouseEvent: w.MouseEvent, KeyboardEvent: w.KeyboardEvent,
  getComputedStyle: w.getComputedStyle.bind(w), matchMedia: w.matchMedia,
  ResizeObserver: Observador, IntersectionObserver: Observador,
  sessionStorage: w.sessionStorage,
})) {
  Object.defineProperty(globalThis, k, { value: v, configurable: true, writable: true });
}
globalThis.IS_REACT_ACT_ENVIRONMENT = true;

const React = await import("react");
const { createRoot } = await import("react-dom/client");
const act = React.act ?? (await import("react-dom/test-utils")).act;

const { accionDeTecla } = await import("../Presentacion.jsx");
const { default: Brujula, escenaBrujula, validarPuntas } = await import("../Brujula.jsx");
const { default: ClasePoliticaFiscal, ESCENAS_POLITICA_FISCAL, CLAVE_CLASE_POLITICA_FISCAL } = await import(
  "../../mecanicas/tesoreria/clase/ClasePoliticaFiscal.jsx"
);
const { BRUJULA_FISCAL, MECANISMOS_CLASE, EJEMPLOS_CLASE, CHEQUEOS_CLASE, partirVariedad } = await import(
  "../../../data/politicaFiscalClase.js"
);
const { SUBJECTS, APRENDER } = await import("../../../data/subjects.js");

/* ──────────────────────────────── ayudas ──────────────────────────────── */

function montar(elemento = React.createElement(ClasePoliticaFiscal)) {
  const cont = document.createElement("div");
  document.body.appendChild(cont);
  const raiz = createRoot(cont);
  act(() => raiz.render(elemento));
  return {
    cont,
    desmontar: () => {
      act(() => raiz.unmount());
      cont.remove();
    },
  };
}

/* La tecla va al cuerpo de la página, como cuando nadie ha enfocado nada. */
function tecla(key, extra = {}, destino = document.body) {
  let evento;
  act(() => {
    evento = new w.KeyboardEvent("keydown", { key, bubbles: true, cancelable: true, ...extra });
    destino.dispatchEvent(evento);
  });
  return evento;
}
const pulsar = (key, veces) => { for (let k = 0; k < veces; k++) tecla(key); };

const escena = (cont) => cont.querySelector(".fae-pres-num").textContent;
const cuenta = (cont) => cont.querySelector(".fae-bj-cuenta")?.textContent ?? null;
const abiertos = (cont) => cont.querySelectorAll('.fae-cl-mec-cabeza[aria-expanded="true"]').length;
const siguienteBoton = (cont) => cont.querySelector(".fae-pres-siguiente");

const empezarLimpio = () => sessionStorage.clear();

/* ──────────────────────────────── el mando ──────────────────────────────── */

test("accionDeTecla: las teclas de un mando y del teclado, en los dos sentidos", () => {
  const k = (key, extra = {}) => accionDeTecla({ key, shiftKey: false, altKey: false, ctrlKey: false, metaKey: false, ...extra });
  for (const t of ["ArrowRight", "ArrowDown", "PageDown", " "]) assert.equal(k(t), "siguiente", t);
  for (const t of ["ArrowLeft", "ArrowUp", "PageUp"]) assert.equal(k(t), "anterior", t);
  assert.equal(k(" ", { shiftKey: true }), "anterior", "Mayús+espacio");
  assert.equal(k("Home"), "inicio");
  assert.equal(k("End"), "final");
  assert.equal(k("f"), "proyectar");
  assert.equal(k("F"), "proyectar");
  /* Con modificador es un atajo del navegador, no de la presentación. */
  assert.equal(k("ArrowRight", { altKey: true }), null);
  assert.equal(k("ArrowLeft", { ctrlKey: true }), null);
  assert.equal(k("a"), null);
  assert.equal(k("Enter"), null, "Intro se queda para los botones");
});

test("con el mando se da la clase entera: primero los pasos de la escena, después la siguiente", () => {
  empezarLimpio();
  const { cont, desmontar } = montar();
  assert.equal(escena(cont), "ESCENA 1 DE 4");
  assert.equal(cuenta(cont), "0 de 6 puntas reveladas");

  /* Escena 1: seis pasos, uno por punta, y la escena no cambia hasta la sexta. */
  pulsar("PageDown", 5);
  assert.equal(escena(cont), "ESCENA 1 DE 4");
  assert.equal(cuenta(cont), "5 de 6 puntas reveladas");
  assert.match(siguienteBoton(cont).textContent, /Revelar «Impactos»/);
  tecla("PageDown");
  assert.equal(cuenta(cont), "6 de 6 puntas reveladas");
  assert.match(siguienteBoton(cont).textContent, /Escena 2/);
  tecla("PageDown");
  assert.equal(escena(cont), "ESCENA 2 DE 4");

  /* Escena 2: tres máquinas. */
  assert.equal(abiertos(cont), 0);
  pulsar("ArrowRight", 3);
  assert.equal(abiertos(cont), 3);
  assert.equal(escena(cont), "ESCENA 2 DE 4");
  tecla(" ");
  assert.equal(escena(cont), "ESCENA 3 DE 4");

  /* Escena 3: aplicar, pasar, aplicar, pasar, aplicar. */
  pulsar(" ", 5);
  assert.equal(cont.querySelectorAll(".fae-cl-pestana .fae-cl-oculto").length, 3, "las tres medidas aplicadas");
  assert.equal(escena(cont), "ESCENA 3 DE 4");
  tecla("ArrowDown");
  assert.equal(escena(cont), "ESCENA 4 DE 4");

  /* Escena 4: revelar, pasar, revelar. Y ahí se acaba. */
  pulsar("ArrowRight", 3);
  assert.ok(cont.textContent.includes(CHEQUEOS_CLASE[1].respuesta));
  assert.equal(siguienteBoton(cont).disabled, true);
  assert.match(siguienteBoton(cont).textContent, /Fin/);
  tecla("ArrowRight");
  assert.equal(escena(cont), "ESCENA 4 DE 4");
  desmontar();
});

test("volver atrás no deshace nada: ni la brújula, ni las máquinas, ni las medidas", () => {
  empezarLimpio();
  const { cont, desmontar } = montar();
  pulsar("ArrowRight", 3);
  assert.equal(cuenta(cont), "3 de 6 puntas reveladas");

  /* Se salta a la escena 2 con el punto de la barra, se abre una máquina, y se vuelve. */
  act(() => cont.querySelector('[aria-label^="Escena 2"]').click());
  assert.equal(escena(cont), "ESCENA 2 DE 4");
  tecla("ArrowRight");
  assert.equal(abiertos(cont), 1);

  tecla("ArrowLeft");
  assert.equal(escena(cont), "ESCENA 1 DE 4");
  assert.equal(cuenta(cont), "3 de 6 puntas reveladas", "la brújula sigue como estaba");
  assert.equal(cont.querySelectorAll(".fae-bj-encendida").length, 3);

  /* Y hacia delante: la máquina sigue abierta. Con Mayús+espacio y Re Pág también se vuelve. */
  tecla("End");
  tecla(" ", { shiftKey: true });
  assert.equal(escena(cont), "ESCENA 3 DE 4");
  tecla("PageUp");
  assert.equal(escena(cont), "ESCENA 2 DE 4");
  assert.equal(abiertos(cont), 1, "la máquina abierta sigue abierta");
  tecla("Home");
  assert.equal(escena(cont), "ESCENA 1 DE 4");
  assert.equal(cuenta(cont), "3 de 6 puntas reveladas");
  desmontar();
});

test("al volver a una escena, lo ya revelado se ve quieto: no se repite ninguna animación", () => {
  empezarLimpio();
  const { cont, desmontar } = montar();
  tecla("End"); /* escena 4 */
  tecla("PageUp"); /* escena 3 */
  tecla("PageDown"); /* aplica el IVA, en este montaje: se anima */
  const animadas = () => cont.querySelectorAll(".fae-cl [style*='animation']").length;
  assert.ok(animadas() > 0, "control: al aplicarla, la medida se anima (si no, esta prueba no podría fallar)");

  tecla("PageUp"); /* escena 2 */
  /* Con el punto de la barra: Av Pág, aquí, abriría una máquina de la escena 2. */
  act(() => cont.querySelector('[aria-label^="Escena 3"]').click()); /* escena 3 otra vez, montada de nuevo */
  assert.equal(escena(cont), "ESCENA 3 DE 4");
  assert.ok(cont.querySelector(".fae-cl-clasif"), "la clasificación sigue a la vista");
  assert.equal(animadas(), 0, "lo ya aplicado se pinta en su final, sin animación");

  /* "Verlo otra vez" sí la repite. */
  act(() => [...cont.querySelectorAll(".fae-cl-accion")].find((b) => /otra vez/.test(b.textContent)).click());
  assert.ok(animadas() > 0);
  desmontar();
});

test("una tecla mantenida no avanza de más, y las teclas con modificador o en un campo no son del mando", () => {
  empezarLimpio();
  const { cont, desmontar } = montar();
  tecla("ArrowRight", { repeat: true });
  assert.equal(cuenta(cont), "0 de 6 puntas reveladas", "la repetición automática no cuenta");

  tecla("ArrowRight", { ctrlKey: true });
  assert.equal(cuenta(cont), "0 de 6 puntas reveladas");

  const campo = document.createElement("input");
  document.body.appendChild(campo);
  const e = tecla(" ", {}, campo);
  assert.equal(cuenta(cont), "0 de 6 puntas reveladas");
  assert.equal(e.defaultPrevented, false, "en un campo, el espacio escribe un espacio");
  campo.remove();

  const avance = tecla(" ");
  assert.equal(avance.defaultPrevented, true, "fuera de un campo, el espacio no desplaza la página");
  assert.equal(cuenta(cont), "1 de 6 puntas reveladas");
  desmontar();
});

test("la barra espaciadora no vuelve a pulsar el botón enfocado al soltarla", () => {
  empezarLimpio();
  const { cont, desmontar } = montar();
  const punta = cont.querySelector(".fae-bj-punta");
  punta.focus();
  let soltar;
  act(() => {
    soltar = new w.KeyboardEvent("keyup", { key: " ", bubbles: true, cancelable: true });
    punta.dispatchEvent(soltar);
  });
  assert.equal(soltar.defaultPrevented, true, "sin esto, el navegador activaría la punta además de avanzar");
  desmontar();
});

test("sobrevive a una recarga en la misma pestaña, y un guardado roto no la rompe", () => {
  empezarLimpio();
  let m = montar();
  pulsar("ArrowRight", 2);
  act(() => m.cont.querySelector('[aria-label^="Escena 2"]').click());
  m.desmontar();

  m = montar();
  assert.equal(escena(m.cont), "ESCENA 2 DE 4", "vuelve a la escena donde estaba");
  tecla("ArrowLeft");
  assert.equal(cuenta(m.cont), "2 de 6 puntas reveladas");
  m.desmontar();

  sessionStorage.setItem(`fae-presentacion:${CLAVE_CLASE_POLITICA_FISCAL}`, "{no es json");
  m = montar();
  assert.equal(escena(m.cont), "ESCENA 1 DE 4");
  m.desmontar();

  sessionStorage.setItem(`fae-presentacion:${CLAVE_CLASE_POLITICA_FISCAL}`, JSON.stringify({ v: 1, i: 2, estados: [{}] }));
  m = montar();
  assert.equal(escena(m.cont), "ESCENA 1 DE 4", "con otro número de escenas, se empieza de cero");
  m.desmontar();
});

/* ─────────────────────────────── los chequeos ─────────────────────────────── */

test("la respuesta de un chequeo no está en la página hasta revelarla", () => {
  empezarLimpio();
  const { cont, desmontar } = montar();
  tecla("End");
  assert.equal(escena(cont), "ESCENA 4 DE 4");
  for (const c of CHEQUEOS_CLASE) assert.ok(!cont.innerHTML.includes(c.respuesta), `«${c.titulo}»: ni oculta con CSS`);

  tecla("ArrowRight");
  assert.ok(cont.textContent.includes(CHEQUEOS_CLASE[0].respuesta));
  assert.ok(!cont.innerHTML.includes(CHEQUEOS_CLASE[1].respuesta));

  /* Ocultar la quita de la página, no solo de la vista. */
  act(() => [...cont.querySelectorAll(".fae-cl-accion")].find((b) => /Ocultar/.test(b.textContent)).click());
  assert.ok(!cont.innerHTML.includes(CHEQUEOS_CLASE[0].respuesta));

  /* No hay nada que elegir: ni opciones, ni campos. */
  assert.equal(cont.querySelectorAll("input, select, textarea, [role='radio']").length, 0);
  desmontar();
});

/*
 * La guarda de la flecha del servicio de la deuda (ver EscenaChequeos.jsx).
 * Si alguien la "completa" con monedas, esta prueba falla a propósito: monedas
 * saliendo del libro de la deuda hacia el distribuidor dibujan pedir prestado
 * para gastar, lo contrario de lo que enseña el chequeo.
 */
test("por la flecha del servicio de la deuda viaja el recibo, no monedas, y va del libro al distribuidor", () => {
  empezarLimpio();
  const { cont, desmontar } = montar();
  tecla("End");
  act(() => cont.querySelectorAll(".fae-cl-pestana")[1].click());
  tecla("ArrowRight"); /* revela el chequeo 2 */
  const flechas = cont.querySelector(".fae-cl-flechas");
  assert.ok(flechas.querySelector("rect"), "el recibo viaja por la flecha");
  assert.equal(flechas.querySelectorAll("circle").length, 0, "ninguna moneda en la flecha");

  /* El libro arriba, el distribuidor abajo, y la punta de la flecha abajo. */
  const libro = [...cont.querySelectorAll(".fae-cl-caja-nombre")].find((p) => p.textContent === "Deuda Pública");
  const distribuidor = [...cont.querySelectorAll(".fae-cl-caja-nombre")].find((p) => p.textContent === "Gasto del Gobierno");
  assert.ok(libro.compareDocumentPosition(flechas) & w.Node.DOCUMENT_POSITION_FOLLOWING);
  assert.ok(flechas.compareDocumentPosition(distribuidor) & w.Node.DOCUMENT_POSITION_FOLLOWING);
  assert.match(flechas.querySelector("path").getAttribute("d"), /^M20 4 V90 .*L20 92/, "la flecha principal baja hacia el distribuidor");
  desmontar();
});

test("los destinos de los chequeos son ranuras que existen en la escena 2", () => {
  for (const c of CHEQUEOS_CLASE) {
    const m = MECANISMOS_CLASE.find((x) => x.id === c.destino.instrumento);
    assert.ok(m, `${c.id}: no hay máquina «${c.destino.instrumento}»`);
    assert.ok(m.variedades.includes(c.destino.variedad), `${c.id}: «${c.destino.variedad}» no es una variedad de ${m.instrumento}`);
  }
  assert.equal(CHEQUEOS_CLASE.find((c) => c.id === "servicio-deuda").destino.instrumento, "gasto", "el servicio de la deuda es Gasto");
});

/* ─────────────────────────────── la brújula ─────────────────────────────── */

test("la brújula es reutilizable: con otras seis puntas es otra brújula, sin tocar su código", () => {
  const monetaria = ["Naturaleza", "Mercado", "Objetivos", "Instrumentos", "Medidas", "Impactos"].map((nombre, k) => ({
    id: `m${k}`,
    nombre: `${nombre} monetaria`,
    pregunta: `¿Pregunta monetaria ${k}?`,
    significado: `Significado monetario ${k}.`,
  }));
  assert.deepEqual(validarPuntas(monetaria), []);

  const escenaMonetaria = escenaBrujula({ id: "brujula-monetaria", titulo: "Brújula monetaria", puntas: monetaria });
  const estado = escenaMonetaria.siguientePaso(escenaMonetaria.estadoInicial);
  assert.deepEqual(estado, { reveladas: ["m0"], activa: "m0" });

  const { cont, desmontar } = montar(
    React.createElement(Brujula, { puntas: monetaria, reveladas: ["m0"], activa: "m0", onElegir: () => {} }),
  );
  assert.equal(cont.querySelectorAll(".fae-bj-punta").length, 6);
  assert.ok(cont.textContent.includes("Naturaleza monetaria"));
  assert.ok(cont.textContent.includes("Significado monetario 0."));
  assert.ok(!cont.textContent.includes(BRUJULA_FISCAL[0].significado), "nada de la lista fiscal se cuela");
  desmontar();
});

test("la brújula rechaza una lista que no es de seis puntas completas y distintas", () => {
  assert.match(validarPuntas(BRUJULA_FISCAL.slice(0, 5)).join(), /hacen falta 6/);
  assert.match(validarPuntas([...BRUJULA_FISCAL.slice(0, 5), BRUJULA_FISCAL[0]]).join(), /repetido/);
  assert.match(validarPuntas(BRUJULA_FISCAL.map((p, k) => (k === 2 ? { ...p, pregunta: " " } : p))).join(), /pregunta/);
  assert.throws(() => escenaBrujula({ titulo: "rota", puntas: BRUJULA_FISCAL.slice(1) }));
  assert.deepEqual(validarPuntas(BRUJULA_FISCAL), []);
});

test("el centro de la brújula es neutro: su código no importa nada de la Tesorería ni de ningún tema", () => {
  const fuente = readFileSync(fileURLToPath(new URL("../Brujula.jsx", import.meta.url)), "utf8");
  const importaciones = fuente.split("\n").filter((l) => /^\s*import\b/.test(l));
  for (const l of importaciones) assert.ok(!/tesoreria|mecanicas|data\//i.test(l), `importa: ${l}`);
  assert.equal(ESCENAS_POLITICA_FISCAL[0].identidad, "brujula");
  for (const e of ESCENAS_POLITICA_FISCAL.slice(1)) assert.equal(e.identidad, "tesoreria", e.id);
});

/* ─────────────────────────────── nada puntúa ─────────────────────────────── */

const RAIZ = new URL("../../../../", import.meta.url);
const leer = (ruta) => readFileSync(fileURLToPath(new URL(ruta, RAIZ)), "utf8");

test("nada puntúa: es Aprender, no está en el catálogo de FP y no importa nada de FP", () => {
  const tema = SUBJECTS.macroeconomia.topics.find((t) => t.id === "politica-fiscal");
  const clase = tema.actividades.find((a) => a.id === "clase-politica-fiscal");
  assert.deepEqual(clase.clasificacion, { tipo: APRENDER }, "sin fpBase ni dificultad");

  for (const f of readdirSync(new URL("supabase/migrations/", RAIZ))) {
    assert.ok(!leer(`supabase/migrations/${f}`).includes("clase-politica-fiscal"), `${f} la mete en el catálogo`);
  }

  const archivos = [
    "src/components/presentacion/Presentacion.jsx",
    "src/components/presentacion/Brujula.jsx",
    ...readdirSync(new URL("src/components/mecanicas/tesoreria/clase/", RAIZ)).map((f) => `src/components/mecanicas/tesoreria/clase/${f}`),
  ];
  for (const a of archivos) {
    /* Sin comentarios: el de Presentacion.jsx dice, justamente, que no hay onCompletar. */
    const codigo = leer(a).replace(/\/\*[\s\S]*?\*\//g, "").replace(/^\s*\/\/.*$/gm, "");
    const importaciones = codigo.split("\n").filter((l) => /^\s*import\b/.test(l));
    for (const l of importaciones) assert.ok(!/\/fp\/|registrar|completadas/.test(l), `${a} importa ${l}`);
    assert.ok(!/onCompletar\s*[=(:]/.test(codigo), `${a} llama o recibe onCompletar`);
  }
});

/* ─────────────────────────────── el texto ─────────────────────────────── */

test("sin cifras más que la de la cita: el $1 billón de Mi Casa Ya", () => {
  const textos = [...EJEMPLOS_CLASE, ...CHEQUEOS_CLASE].flatMap((x) => Object.values(x).filter((v) => typeof v === "string"));
  const conCifras = textos.filter((t) => /\d/.test(t.replace("$1 billón", "")));
  assert.deepEqual(conCifras, []);
});

test("partirVariedad separa la aclaración entre paréntesis y deja el resto igual", () => {
  assert.deepEqual(partirVariedad("De inversión (obras)"), { cabeza: "De inversión", detalle: "(obras)" });
  assert.deepEqual(partirVariedad("Interna (TES, bancos locales)"), { cabeza: "Interna", detalle: "(TES, bancos locales)" });
  assert.deepEqual(partirVariedad("Tasas o tarifas"), { cabeza: "Tasas o tarifas", detalle: null });
});
