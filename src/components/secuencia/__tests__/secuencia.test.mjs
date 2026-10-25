import { test } from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { JSDOM, VirtualConsole } from "jsdom";

/* ─────────────── un navegador de mentira, ANTES de cargar React ─────────────── */

const dom = new JSDOM("<!doctype html><html><body></body></html>", { url: "http://localhost/", virtualConsole: new VirtualConsole() });
const w = dom.window;
const Observador = class { observe() {} unobserve() {} disconnect() {} };
/* Movimiento reducido: los cambios de pantalla son instantáneos y la prueba no espera relojes. */
w.matchMedia = (q) => ({ matches: /reduce/.test(q), addEventListener() {}, removeEventListener() {}, addListener() {}, removeListener() {} });
for (const [k, v] of Object.entries({
  window: w, document: w.document, navigator: w.navigator,
  HTMLElement: w.HTMLElement, Element: w.Element, Node: w.Node, SVGElement: w.SVGElement,
  Event: w.Event, MouseEvent: w.MouseEvent, KeyboardEvent: w.KeyboardEvent,
  getComputedStyle: w.getComputedStyle.bind(w), matchMedia: w.matchMedia,
  ResizeObserver: Observador, IntersectionObserver: Observador, sessionStorage: w.sessionStorage,
  requestAnimationFrame: (f) => setTimeout(f, 0), cancelAnimationFrame: (h) => clearTimeout(h),
})) {
  Object.defineProperty(globalThis, k, { value: v, configurable: true, writable: true });
}
globalThis.IS_REACT_ACT_ENVIRONMENT = true;

const React = await import("react");
const { createRoot } = await import("react-dom/client");
const act = React.act ?? (await import("react-dom/test-utils")).act;
const S = await import("../secuencia.js");
const { default: SecuenciaAprender, BOTON_NAV, altoFiguraDe } = await import("../SecuenciaAprender.jsx");

/* ─────────────── una pieza de juguete con la forma de la especificación ─────────────── */

const h = React.createElement;
const Figura = ({ estado, setEstado, paso }) =>
  h("div", null,
    h("span", { "data-paso-figura": paso }, `paso ${paso}`),
    h("button", { type: "button", "data-opcion": "bien", onClick: () => setEstado((e) => S.responderHaz(e, true)) }, "A"),
    h("button", { type: "button", "data-opcion": "mal", onClick: () => setEstado((e) => S.responderHaz(e, false)) }, "B"),
    h("span", { "data-intentos": estado?.intentos ?? 0 }));

const pantalla = (id, tipo, extra = {}) => ({ id, tipo, titular: `Titular ${id}`, apoyo: "Una frase de apoyo.", Figura, nombreFigura: `Figura ${id}`, ...extra });
const pieza = (id) => ({
  id,
  pantallas: [
    pantalla("a", "apertura", { pasos: 2, rotulosPaso: ["Activo", "Pasivo"] }),
    pantalla("m", "miralo"),
    pantalla("h", "haz", { estadoInicial: S.HAZ_INICIAL, resuelta: S.hazResuelto, razon: "Elige una opción para seguir." }),
    pantalla("c", "cierre"),
  ],
});
const PIEZAS = [pieza("p1"), pieza("p2")];

/* ─────────────── las reglas ─────────────── */

test("★ la pieza de juguete cumple la forma, y las faltas se dicen", () => {
  assert.deepEqual(S.faltasDePieza(PIEZAS[0]), []);
  const corta = { id: "x", pantallas: PIEZAS[0].pantallas.slice(0, 3) };
  assert.ok(S.faltasDePieza(corta).some((f) => /van de 4 a 10/.test(f)));
  const pasiva = { id: "x", pantallas: [pantalla("a", "apertura"), pantalla("b", "apertura"), pantalla("m", "miralo"), pantalla("c", "cierre")] };
  assert.ok(S.faltasDePieza(pasiva).some((f) => /al menos la mitad/.test(f)));
  assert.ok(S.faltasDePieza(pasiva).some((f) => /Haz/.test(f)));
  const larga = { id: "x", pantallas: [pantalla("a", "apertura", { titular: "uno dos tres cuatro cinco seis siete ocho nueve diez once" }), ...PIEZAS[0].pantallas.slice(1)] };
  assert.ok(S.faltasDePieza(larga).some((f) => /10 palabras/.test(f)));
  const hazSinRazon = { id: "x", pantallas: PIEZAS[0].pantallas.map((p) => (p.tipo === "haz" ? { ...p, razon: undefined } : p)) };
  assert.ok(S.faltasDePieza(hazSinRazon).some((f) => /D11/.test(f)));
});

test("★ Siguiente da primero los pasos, espera al Haz y no se salta piezas", () => {
  let e = S.estadoInicial(PIEZAS);
  assert.equal(S.queHaceSiguiente(e, PIEZAS), "paso");
  e = S.avanzar(e, PIEZAS); e = S.avanzar(e, PIEZAS);
  assert.equal(e.s, 0, "dar pasos no cambia de pantalla");
  assert.equal(S.queHaceSiguiente(e, PIEZAS), "pantalla");
  e = S.avanzar(e, PIEZAS); e = S.avanzar(e, PIEZAS);
  assert.equal(S.pantallaActual(e, PIEZAS).tipo, "haz");
  assert.equal(S.queHaceSiguiente(e, PIEZAS), "espera");
  assert.deepEqual(S.avanzar(e, PIEZAS), e, "con el Haz sin responder, Siguiente no hace nada");
  e = S.cambiarFigura(e, PIEZAS, (x) => S.responderHaz(x, false));
  assert.equal(S.queHaceSiguiente(e, PIEZAS), "espera", "un error deja una oportunidad más");
  e = S.cambiarFigura(e, PIEZAS, (x) => S.responderHaz(x, false));
  assert.equal(S.queHaceSiguiente(e, PIEZAS), "pantalla", "al segundo error se libera (C2)");
  assert.ok(S.mostrarCorrecto(e.estados["p1/h"]));
  e = S.avanzar(e, PIEZAS);
  assert.equal(S.literalSiguiente(e, PIEZAS, "hacer"), "Siguiente pieza");
  e = S.avanzar(e, PIEZAS);
  assert.deepEqual([e.p, e.s], [1, 0]);
});

test("★ Anterior no deshace nada y cruza a la pieza anterior por su cierre", () => {
  let e = S.estadoInicial(PIEZAS);
  e = S.avanzar(S.avanzar(e, PIEZAS), PIEZAS); // dos pasos
  e = S.avanzar(e, PIEZAS); // a Míralo
  e = S.retroceder(e, PIEZAS);
  assert.equal(S.pasosDados(e, PIEZAS), 2, "volver deshizo los pasos");
  assert.equal(S.puedeRetroceder(e), false);
  e = { ...e, p: 1, s: 0 };
  e = S.retroceder(e, PIEZAS);
  assert.deepEqual([e.p, e.s], [0, 3], "desde la primera pantalla de una pieza se vuelve al cierre de la anterior");
});

test("★ un Haz resuelto no se vuelve a bloquear", () => {
  let e = { ...S.estadoInicial(PIEZAS), s: 2 };
  e = S.cambiarFigura(e, PIEZAS, (x) => S.responderHaz(x, true));
  assert.ok(e.resueltas.includes("p1/h"));
  e = S.cambiarFigura(e, PIEZAS, S.HAZ_INICIAL); // aunque la figura vuelva a su estado inicial
  assert.notEqual(S.queHaceSiguiente(e, PIEZAS), "espera");
});

test("★ lo guardado de otra versión de las piezas no se usa", () => {
  const e = S.estadoInicial(PIEZAS);
  assert.ok(S.guardadoValido(e, PIEZAS));
  assert.ok(!S.guardadoValido(e, [PIEZAS[0]]));
  assert.ok(!S.guardadoValido({ ...e, s: 9 }, PIEZAS));
  assert.ok(!S.guardadoValido(null, PIEZAS));
});

/* ─────────────── montada ─────────────── */

async function montar(props) {
  const caja = document.createElement("div");
  document.body.appendChild(caja);
  const raiz = createRoot(caja);
  await act(async () => { raiz.render(h(SecuenciaAprender, props)); });
  const clic = async (sel) => { await act(async () => { caja.querySelector(sel).dispatchEvent(new w.MouseEvent("click", { bubbles: true })); }); };
  return { caja, raiz, clic, q: (sel) => caja.querySelector(sel) };
}

test("★ montada: una pantalla a la vez, contadores, razón visible y final en manos de la vista", async () => {
  sessionStorage.clear();
  let finales = 0;
  const m = await montar({ temaId: "prueba", piezas: PIEZAS, final: "hacer", onFinal: () => { finales++; } });

  assert.equal(m.caja.querySelectorAll("[data-pantalla]").length, 1, "se ve más de una pantalla");
  assert.equal(m.q("[data-pantalla]").getAttribute("aria-roledescription"), "pantalla");
  assert.equal(m.q("[data-pantalla]").getAttribute("aria-label"), "Pantalla 1 de 4: Titular a");
  assert.equal(m.q("[data-contador]").textContent, "Pantalla 1 de 4");
  assert.equal(m.q("[data-contador-pieza]").textContent, "Pieza 1 de 2");
  assert.equal(m.q("[data-cejilla]").textContent, "Primero, los nombres");
  assert.ok(m.q("figure[aria-label='Figura a']"), "la figura no está en un <figure> con nombre");
  assert.equal(m.q("[data-pieza]").getAttribute("data-pieza"), "p1");
  assert.equal(m.q("[data-anterior]").getAttribute("aria-disabled"), "true");
  assert.ok(m.q("[data-anterior]").getAttribute("aria-describedby"), "Anterior apagado sin razón");
  assert.equal(m.q("[data-razon]").textContent, "Paso 1 de 2");

  await m.clic("[data-siguiente]");
  assert.equal(m.q("[data-paso-figura]").getAttribute("data-paso-figura"), "1", "la figura no recibió el paso");
  assert.equal(m.q("[data-pantalla]").getAttribute("data-pantalla"), "1", "un paso cambió de pantalla");
  assert.match(m.q("[aria-live]").textContent, /Paso 1 de 2: Activo/);

  await m.clic("[data-siguiente]");
  await m.clic("[data-siguiente]");
  assert.equal(m.q("[data-pantalla]").getAttribute("data-pantalla"), "2");
  assert.equal(document.activeElement, m.q(".fae-sec-titular"), "el foco no pasó al titular");
  await m.clic("[data-siguiente]");
  assert.equal(m.q("[data-pantalla]").getAttribute("data-tipo"), "haz");
  assert.equal(m.q("[data-siguiente]").getAttribute("aria-disabled"), "true");
  assert.equal(m.q("[data-razon]").textContent, "Elige una opción para seguir.");
  assert.equal(m.q("[data-siguiente]").getAttribute("aria-describedby"), m.q("[data-razon]").id);

  await m.clic("[data-opcion='bien']");
  assert.equal(m.q("[data-siguiente]").getAttribute("aria-disabled"), null);
  await m.clic("[data-siguiente]");
  assert.equal(m.q("[data-siguiente]").textContent, "Siguiente pieza");

  /* Recargar a mitad de pieza vuelve a la misma pantalla con lo hecho (parada 6). */
  await act(async () => { m.raiz.unmount(); });
  const r = await montar({ temaId: "prueba", piezas: PIEZAS, final: "hacer", onFinal: () => { finales++; } });
  assert.equal(r.q("[data-pantalla]").getAttribute("data-pantalla"), "4");
  await r.clic("[data-anterior]");
  assert.equal(r.q("[data-siguiente]").getAttribute("aria-disabled"), null, "el Haz resuelto se volvió a bloquear al volver");

  await r.clic("[data-siguiente]");
  await r.clic("[data-siguiente]");
  assert.equal(r.q("[data-contador-pieza]").textContent, "Pieza 2 de 2");
  for (let k = 0; k < 4; k++) await r.clic("[data-siguiente]");
  await r.clic("[data-opcion='mal']");
  assert.equal(r.q("[data-siguiente]").getAttribute("aria-disabled"), "true");
  await r.clic("[data-opcion='mal']");
  await r.clic("[data-siguiente]");
  assert.equal(r.q("[data-siguiente]").textContent, "Ir a Hacer");
  await r.clic("[data-siguiente]");
  assert.equal(finales, 1, "el último cierre no le pasó el mando a la vista");
  assert.ok(!JSON.stringify(sessionStorage.getItem("fae-secuencia:prueba")).includes("supabase"));
});

/* ─────────────── lo que no se puede separar de CuatroCapas ni de la especificación ─────────────── */

test("★ el botón de navegación es el mismo de CuatroCapas, que no se tocó", () => {
  const fuente = readFileSync(new URL("../../mecanicas/maquinas/CuatroCapas.jsx", import.meta.url), "utf8");
  const bloque = fuente.match(/const BOTON_NAV = \{([\s\S]*?)\};/)[1];
  for (const [k, v] of Object.entries(BOTON_NAV)) {
    const literal = typeof v === "string" ? `${k}: "${v}"` : `${k}: ${v}`;
    assert.ok(bloque.includes(literal), `BOTON_NAV.${k} ya no es el de CuatroCapas`);
  }
});

test("★ el movimiento usa una sola curva, solo transform y opacity, y nada en bucle", () => {
  const fuente = readFileSync(new URL("../SecuenciaAprender.jsx", import.meta.url), "utf8");
  const estilos = fuente.match(/const ESTILOS = `([\s\S]*?)`;/)[1];
  assert.ok(!/\binfinite\b/.test(estilos), "algo quedó en bucle");
  assert.ok(!/\b(ease|linear|ease-in|ease-out|ease-in-out)\b/.test(estilos.replace(/\$\{CURVA\}/g, "")), "apareció otra curva");
  assert.match(fuente, /const CURVA = "cubic-bezier\(\.3,\.9,\.4,1\)";/);
  for (const prop of estilos.matchAll(/@keyframes[^{]+\{([\s\S]*?)\}\s*\}/g)) {
    assert.ok(!/(width|height|top|left|margin|filter|box-shadow)\s*:/.test(prop[1]), `un keyframe anima algo que no es transform u opacity: ${prop[0].slice(0, 60)}`);
  }
  assert.match(estilos, /prefers-reduced-motion: reduce/);
});

test("★ el alto de la figura es por pieza, con los de la v1 por defecto y el tope de #513", () => {
  assert.deepEqual(altoFiguraDe({}), { a320: 150, a375: 200 });
  assert.deepEqual(altoFiguraDe({ altoFigura: { a320: 180 } }), { a320: 180, a375: 200 });
  assert.deepEqual(altoFiguraDe({ altoFigura: { a320: 400, a375: 400 } }), { a320: 206, a375: 253 }, "pasó del tope");
});

test("★ #549: el mensaje va fuera de la figura y lee su mismo estado; la figura empuja en vez de tapar", async () => {
  sessionStorage.clear();
  const Mensaje = ({ estado }) => h("p", { "data-mensaje-prueba": "" }, `intentos ${estado?.intentos ?? 0}`);
  const pz = { id: "m1", pantallas: [
    pantalla("a", "apertura"),
    pantalla("h", "haz", { estadoInicial: S.HAZ_INICIAL, resuelta: S.hazResuelto, razon: "Elige una opción.", Mensaje }),
    pantalla("m", "miralo"),
    pantalla("c", "cierre"),
  ] };
  const m = await montar({ temaId: "mensaje", piezas: [pz] });
  assert.equal(m.q("[data-mensaje-zona]"), null, "una pantalla sin Mensaje no reserva zona");
  await m.clic("[data-siguiente]");
  const zona = m.q("[data-mensaje-zona]");
  assert.ok(zona, "no se pintó la zona de mensaje");
  assert.equal(zona.closest("figure"), null, "el mensaje quedó dentro de la figura");
  await m.clic("[data-opcion='mal']");
  assert.equal(m.q("[data-mensaje-prueba]").textContent, "intentos 1", "el mensaje no lee el estado de la figura");
  await act(async () => { m.raiz.unmount(); });

  const fuente = readFileSync(new URL("../SecuenciaAprender.jsx", import.meta.url), "utf8");
  const estilos = fuente.match(/const ESTILOS = `([\s\S]*?)`;/)[1];
  assert.match(estilos, /\.fae-sec-figura \{ min-height:/, "la figura volvió a alto fijo: se sale y tapa «Siguiente»");
  assert.doesNotMatch(estilos, /\.fae-sec-figura \{ height:/);
});

test("★ #558: Pulsos opcionales, pieza en la misma fila, razón de 48 en lo que bloquea, apoyo por paso, pie y apertura que predice", async () => {
  sessionStorage.clear();
  const pz = (id) => ({ id, sinPulsos: true, pantallas: [
    pantalla("a", "apertura", { estadoInicial: S.HAZ_INICIAL, resuelta: S.hazResuelto, razon: "Predice primero.", pasos: 0 }),
    pantalla("m", "miralo", { pasos: 2, apoyo: ["Primero esto.", "Luego esto.", "Y al final esto."] }),
    pantalla("h", "haz", { estadoInicial: S.HAZ_INICIAL, resuelta: S.hazResuelto, razon: "Elige una opción." }),
    pantalla("c", "cierre", { pie: "Basado en el libro, p. 6", altoFigura: { a320: 180, a375: 999 } }),
  ] });
  const piezas = [pz("t1a"), pz("t1b")];
  assert.deepEqual(S.faltasDePieza(piezas[0]), []);
  assert.ok(S.faltasDePieza({ ...piezas[0], pantallas: piezas[0].pantallas.map((p) => (p.tipo === "apertura" ? { ...p, razon: undefined } : p)) })
    .some((f) => /apertura que bloquea/.test(f)));

  const m = await montar({ temaId: "t1", piezas });
  /* Sin Pulsos, pero el contador sigue para el lector, y la pieza va en la misma fila. */
  assert.equal(m.q("[data-avance]"), null, "pintó los Pulsos aunque la pieza los omite");
  assert.match(m.q("[data-contador]").textContent, /Pantalla 1 de 4/);
  assert.equal(m.q("[data-contador]").parentElement, m.q("[data-contador-pieza]").parentElement, "«Pieza k de N» no va en la fila del contador");
  /* La apertura que predice bloquea, con su razón y la reserva de 48. */
  assert.equal(m.q("[data-siguiente]").getAttribute("aria-disabled"), "true");
  assert.equal(m.q("[data-razon]").textContent, "Predice primero.");
  assert.equal(m.q("[data-razon]").style.minHeight, "48px");
  await m.clic("[data-opcion='bien']");
  await m.clic("[data-siguiente]");
  /* El apoyo cambia con el paso. */
  assert.equal(m.q("[data-apoyo]").textContent, "Primero esto.");
  assert.equal(m.q("[data-razon]").style.minHeight, "16px");
  await m.clic("[data-siguiente]");
  assert.equal(m.q("[data-apoyo]").textContent, "Luego esto.");
  await m.clic("[data-siguiente]");
  await m.clic("[data-siguiente]");
  await m.clic("[data-opcion='bien']");
  await m.clic("[data-siguiente]");
  /* El cierre: el pie en la zona de razón y su propio alto de figura, con el mismo tope. */
  assert.equal(m.q("[data-tipo]").getAttribute("data-tipo"), "cierre");
  assert.equal(m.q("[data-razon]").textContent, "Basado en el libro, p. 6");
  const raiz = m.q(".fae-sec-raiz");
  assert.equal(raiz.style.getPropertyValue("--fae-sec-alto-320"), "180px");
  assert.equal(raiz.style.getPropertyValue("--fae-sec-alto-375"), "253px", "el alto por pantalla se saltó el tope");
  /* La navegación va pegada en el flujo, y el botón de avance no se parte. */
  const nav = m.q("[data-navegacion]");
  assert.equal(nav.style.position, "sticky");
  assert.equal(m.q("[data-siguiente]").style.whiteSpace, "nowrap");
  assert.equal(m.q("[data-anterior]").style.minWidth, "96px");
  await act(async () => { m.raiz.unmount(); });
});
