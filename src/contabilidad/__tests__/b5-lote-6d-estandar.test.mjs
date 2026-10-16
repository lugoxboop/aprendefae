import { test } from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { JSDOM, VirtualConsole } from "jsdom";

/*
 * ═══════════════════════════════════════════════════════════════════════════
 * LOTE 6d · LOS HACER DE LA CÉLULA B EN EL ESTÁNDAR ÚNICO (prompt maestro de
 * diseño, §4; el modelo es T4 «¿Entra o sale de Caja?»).
 *
 * Vigila, en las seis actividades de B (t5-a1, t5-a2, t6-a1, t6-a2, t6-a3,
 * t6-a4, t6-a6) y con sus tres mecánicas (fichas, opciones y mesa):
 *   · acierto: Check + «Correcto», borde 2 px #F8F9FA, sin teal ni ámbar;
 *   · error: X coral + «No va aquí», borde 2 px coral; el lector dice
 *     «Incorrecto.»;
 *   · revelado (solo sin reintento): «Iba aquí» / «Iba aquí: {valor}», sin
 *     ícono, con su aparición de 0,7 s;
 *   · el veredicto sale del ESTADO de la evaluación, nunca del texto: una
 *     devolución de acierto sin emoji (o con un emoji de error delante)
 *     sigue diciendo «Correcto»;
 *   · ningún ✅ ni ❌ en los datos ni en los componentes de los Hacer de B;
 *   · el contador «{Sustantivo} n de N» y el botón «Siguiente {sustantivo}»
 *     usan el mismo sustantivo, y el último botón es «Ver mi resumen»;
 *   · íconos con aria-hidden, la palabra de la pastilla en el nombre
 *     accesible, foco de 2 px #F8F9FA y nada bajo 12 px.
 * ═══════════════════════════════════════════════════════════════════════════
 */

const dom = new JSDOM("<!doctype html><html><body></body></html>", { url: "http://localhost/", virtualConsole: new VirtualConsole() });
const w = dom.window;
w.matchMedia = () => ({ matches: false, addEventListener() {}, removeEventListener() {}, addListener() {}, removeListener() {} });
w.requestAnimationFrame = (cb) => setTimeout(() => cb(performance.now()), 0);
w.cancelAnimationFrame = (id) => clearTimeout(id);
w.HTMLElement.prototype.scrollIntoView = function scrollIntoView() {};
w.scrollBy = () => {};
for (const [k, v] of Object.entries({
  window: w, document: w.document, navigator: w.navigator,
  HTMLElement: w.HTMLElement, Element: w.Element, Node: w.Node, SVGElement: w.SVGElement,
  Event: w.Event, MouseEvent: w.MouseEvent, KeyboardEvent: w.KeyboardEvent,
  getComputedStyle: w.getComputedStyle.bind(w), matchMedia: w.matchMedia,
  requestAnimationFrame: w.requestAnimationFrame, cancelAnimationFrame: w.cancelAnimationFrame,
})) {
  Object.defineProperty(globalThis, k, { value: v, configurable: true, writable: true });
}
globalThis.IS_REACT_ACT_ENVIRONMENT = true;

const React = await import("react");
const { createRoot } = await import("react-dom/client");
const act = React.act;
const h = React.createElement;

const { MarcoLibros } = await import("../../components/mecanicas/bloques/marcos.jsx");
const { FAE } = await import("../../theme.js");
const { default: QueRentaDa } = await import("../../components/mecanicas/libros/tema5/QueRentaDa.jsx");
const { default: ClientesOOtra } = await import("../../components/mecanicas/libros/tema6/ClientesOOtra.jsx");
const { default: QueSeDebita, CONFIG_T6_ACT4 } = await import("../../components/mecanicas/libros/tema6/QueSeDebita.jsx");
const { default: ProvisionPorEdades } = await import("../../components/mecanicas/libros/tema6/ProvisionPorEdades.jsx");
const { default: CierreSantaPacha } = await import("../../components/mecanicas/libros/tema5/CierreSantaPacha.jsx");
const { default: ProvisionDeElTorito } = await import("../../components/mecanicas/libros/tema6/ProvisionDeElTorito.jsx");
const { default: DeudaQueVuelve } = await import("../../components/mecanicas/libros/tema6/DeudaQueVuelve.jsx");
const { default: EligeUnaOpcion } = await import("../../components/mecanicas/libros/b5/EligeUnaOpcion.jsx");
const { CSS_B5H, RETRASO_REVELA_MS } = await import("../../components/mecanicas/libros/b5/Devolucion.jsx");
const T5A1 = await import("../../data/contabilidadT5Act1.js");
const T5A2 = await import("../../data/contabilidadT5Act2.js");
const T6A1 = await import("../../data/contabilidadT6Act1.js");
const T6A2 = await import("../../data/contabilidadT6Act2.js");
const T6A3 = await import("../../data/contabilidadT6Act3.js");
const T6A4 = await import("../../data/contabilidadT6Act4.js");
const T6A6 = await import("../../data/contabilidadT6Act6.js");

const BLANCO = "rgb(248, 249, 250)";
const CORAL = "rgb(231, 111, 81)";
const TEAL = /42,\s*157,\s*143|#2a9d8f|63,\s*166,\s*154|#3fa69a/i;
const AMBAR = /233,\s*196,\s*106|#e9c46a/i;

const montar = async (Juego, props = {}) => {
  const caja = document.createElement("div");
  document.body.appendChild(caja);
  const raiz = createRoot(caja);
  await act(async () => {
    raiz.render(h(Juego, { Marco: MarcoLibros, rotulo: "PRUEBA", titulo: "Prueba", acento: FAE.ambar, onCompletar: () => {}, ...props }));
  });
  return { caja, desmontar: () => { act(() => raiz.unmount()); caja.remove(); } };
};
const tocar = async (el) => { assert.ok(el, "no hay nada que tocar"); await act(async () => { el.dispatchEvent(new w.MouseEvent("click", { bubbles: true })); }); };
const escribir = async (input, texto) => {
  assert.ok(input, "no hay campo");
  const poner = Object.getOwnPropertyDescriptor(w.HTMLInputElement.prototype, "value").set;
  await act(async () => { poner.call(input, texto); input.dispatchEvent(new w.Event("input", { bubbles: true })); });
};
const iconos = (el) => [...el.querySelectorAll("svg[data-icono]")].map((x) => x.dataset.icono);
const pastilla = (el) => el.querySelector("[data-pastilla]");
const mensaje = (caja) => caja.querySelector('[aria-live="polite"] [role="status"]');
const avance = (caja) => caja.querySelector("[data-boton-avanzar] button");
const sinColorDeLado = (el, contexto) => {
  const html = el.outerHTML;
  assert.doesNotMatch(html, TEAL, `${contexto}: el acierto lleva teal`);
  assert.doesNotMatch(html, AMBAR, `${contexto}: el acierto lleva ámbar`);
};

/* El bloque de mensaje del modelo T4: Check o X de 16 px, raya de 3 px, fondo neutro; el lector dice «Incorrecto.» en el error. */
function comprobarMensaje(caja, ok, contexto) {
  const m = mensaje(caja);
  assert.ok(m, `${contexto}: sin bloque de mensaje en la región viva`);
  assert.equal(m.dataset.retro, ok ? "ok" : "mal", contexto);
  assert.deepEqual(iconos(m), [ok ? "visto" : "tache"], `${contexto}: el ícono del mensaje`);
  const svg = m.querySelector("svg");
  assert.equal(svg.getAttribute("aria-hidden"), "true", `${contexto}: el ícono, oculto al lector`);
  assert.equal(svg.getAttribute("width"), "16");
  assert.equal(svg.getAttribute("stroke-width"), "2.5");
  assert.equal(svg.getAttribute("stroke"), ok ? FAE.text : FAE.coral);
  assert.equal(m.style.background, "rgba(184, 196, 212, 0.12)", `${contexto}: el fondo neutro, también en el error`);
  assert.equal(m.style.borderLeft, `3px solid ${ok ? "rgb(184, 196, 212)" : CORAL}`);
  if (ok) assert.equal(m.querySelector("[data-palabra]").textContent.trim(), "Correcto.", contexto);
  else assert.equal(m.querySelector("[data-lector]").textContent.trim(), "Incorrecto.", `${contexto}: el lector dice «Incorrecto.»`);
  assert.ok(parseFloat(m.querySelector("[data-devolucion]").style.fontSize) >= 12);
}

/* La pastilla de un destino. */
function comprobarPastilla(el, marca, contexto, valor = null) {
  const p = pastilla(el);
  assert.ok(p, `${contexto}: sin pastilla`);
  assert.equal(p.dataset.pastilla, marca, contexto);
  const palabra = { correcta: "Correcto", tachada: "No va aquí", revelada: valor ? `Iba aquí: ${valor}` : "Iba aquí" }[marca];
  assert.equal(p.textContent, palabra, contexto);
  assert.deepEqual(iconos(p), { correcta: ["visto"], tachada: ["tache"], revelada: [] }[marca], `${contexto}: el ícono de la pastilla`);
  for (const svg of p.querySelectorAll("svg")) assert.equal(svg.getAttribute("aria-hidden"), "true");
  assert.equal(p.getAttribute("aria-hidden"), null, `${contexto}: la palabra entra en el nombre accesible`);
  assert.equal(p.style.fontSize, "12px", `${contexto}: nada bajo 12 px`);
  assert.equal(p.style.border, `1px solid ${marca === "tachada" ? CORAL : BLANCO}`);
  if (marca === "revelada") assert.ok(p.classList.contains("fae-b5h-revela"), `${contexto}: «Iba aquí» llega después del error`);
}

/* ═══════════ LAS FICHAS (t5-a1 y t6-a1) ═══════════ */

const FICHAS = [
  { nombre: "t5-a1", Juego: QueRentaDa, fichas: T5A1.FICHAS_T5_ACT1, clave: (f) => (f.tipo ? `${f.renta}/${f.tipo}` : f.renta), cajones: ["variable", "fija/interes", "fija/descuento"] },
  { nombre: "t6-a1", Juego: ClientesOOtra, fichas: T6A1.FICHAS_T6_ACT1, clave: (f) => (f.lado ? `${f.cuenta}/${f.lado}` : f.cuenta), cajones: ["otra", "clientes/debita", "clientes/acredita"] },
];

for (const a of FICHAS) {
  test(`★★★ ${a.nombre} · acierto: el cajón queda Check + «Correcto», con borde 2 px #F8F9FA y sin teal; el mensaje, «Correcto.»`, async () => {
    const f = a.fichas[0];
    const { caja, desmontar } = await montar(a.Juego, { items: [f] });
    const bien = caja.querySelector(`[data-cajon="${a.clave(f)}"]`);
    await tocar(bien);
    comprobarPastilla(bien, "correcta", a.nombre);
    assert.equal(bien.style.border, `2px solid ${BLANCO}`);
    assert.equal(bien.style.background, "transparent", "los destinos van sin relleno");
    sinColorDeLado(bien, a.nombre);
    comprobarMensaje(caja, true, a.nombre);
    desmontar();
  });

  test(`★★★ ${a.nombre} · error: el cajón queda X + «No va aquí» con borde 2 px coral; al segundo, la correcta se revela «Iba aquí»`, async () => {
    const f = a.fichas[0];
    const [m1, m2] = a.cajones.filter((k) => k !== a.clave(f));
    const { caja, desmontar } = await montar(a.Juego, { items: [f] });
    const primero = caja.querySelector(`[data-cajon="${m1}"]`);
    await tocar(primero);
    comprobarPastilla(primero, "tachada", `${a.nombre}, primer fallo`);
    assert.equal(primero.style.border, `2px solid ${CORAL}`);
    comprobarMensaje(caja, false, `${a.nombre}, primer fallo`);
    /* Con reintento, nada se revela todavía. */
    assert.equal(pastilla(caja.querySelector(`[data-cajon="${a.clave(f)}"]`)), null, "con reintento no se revela");
    await tocar(caja.querySelector(`[data-cajon="${m2}"]`));
    const correcto = caja.querySelector(`[data-cajon="${a.clave(f)}"]`);
    comprobarPastilla(correcto, "revelada", `${a.nombre}, segundo fallo`);
    assert.ok(correcto.classList.contains("fae-b5h-revelado"), "el borde de 2 px #F8F9FA del revelado");
    comprobarMensaje(caja, false, `${a.nombre}, segundo fallo`);
    desmontar();
  });
}

/* ═══════════ LAS OPCIONES (t6-a4; t6-a6 desde la casilla 4) ═══════════ */

test("★★★ t6-a4 · acierto: Check + «Correcto», borde 2 px #F8F9FA sin relleno ni teal; error: X + «No va aquí» coral y la correcta «Iba aquí»", async () => {
  const x = T6A4.HECHOS_T6_ACT4[0];
  const opcion = (caja, id) => caja.querySelector(`[data-opcion="${id}"]`).closest("button");
  let m = await montar(QueSeDebita, { items: [x] });
  await tocar(opcion(m.caja, x.respuesta));
  const bien = opcion(m.caja, x.respuesta);
  comprobarPastilla(bien, "correcta", "t6-a4 acierto");
  assert.equal(bien.style.border, `2px solid ${BLANCO}`);
  assert.equal(bien.style.background, "transparent");
  sinColorDeLado(bien, "t6-a4");
  comprobarMensaje(m.caja, true, "t6-a4 acierto");
  m.desmontar();

  const mala = T6A4.OPCIONES_T6_ACT4.find((o) => o.id !== x.respuesta).id;
  m = await montar(QueSeDebita, { items: [x] });
  await tocar(opcion(m.caja, mala));
  comprobarPastilla(opcion(m.caja, mala), "tachada", "t6-a4 error");
  assert.equal(opcion(m.caja, mala).style.border, `2px solid ${CORAL}`);
  comprobarPastilla(opcion(m.caja, x.respuesta), "revelada", "t6-a4 revelada");
  assert.ok(opcion(m.caja, x.respuesta).classList.contains("fae-b5h-revelado"));
  comprobarMensaje(m.caja, false, "t6-a4 error");
  m.desmontar();
});

test("★★★ el veredicto sale del estado, no del texto: un acierto sin emoji, o con «❌» delante, dice «Correcto»; un error sin emoji dice «Incorrecto.»", async () => {
  const x = T6A4.HECHOS_T6_ACT4[0];
  for (const texto of ["Bien hecho, sin emoji.", "❌ Este texto engaña."]) {
    const config = { ...CONFIG_T6_ACT4, retro: () => texto };
    const { caja, desmontar } = await montar(EligeUnaOpcion, { config, items: [x] });
    await tocar(caja.querySelector(`[data-opcion="${x.respuesta}"]`).closest("button"));
    comprobarMensaje(caja, true, `acierto con «${texto}»`);
    assert.ok(mensaje(caja).textContent.includes(texto));
    desmontar();
  }
  const config = { ...CONFIG_T6_ACT4, retro: () => "✅ Este también engaña." };
  const mala = T6A4.OPCIONES_T6_ACT4.find((o) => o.id !== x.respuesta).id;
  const { caja, desmontar } = await montar(EligeUnaOpcion, { config, items: [x] });
  await tocar(caja.querySelector(`[data-opcion="${mala}"]`).closest("button"));
  comprobarMensaje(caja, false, "error con un ✅ en el texto");
  desmontar();
});

/* ═══════════ t6-a6: LOS CAJONES DEL EJE (casillas 1 a 3) ═══════════ */

test("★★★ t6-a6 · en el eje: acierto «Correcto» (2 px #F8F9FA); error «No va aquí» (2 px coral) y la correcta «Iba aquí», en la franja de encima y en el nombre del cajón", async () => {
  const casillas = T6A6.PARTES_T6_ACT6[0].casillas;
  const correcta = (c) => c.opciones.find((o) => o.tipo === null);
  const grupo = (texto) => T6A6.GRUPOS_T6_ACT6.find((g) => g.nombre === texto).id;
  const cajon = (caja, id) => caja.querySelector(`[data-eje] button[data-cajon="${id}"]`);
  const enFranja = (caja, id) => caja.querySelector(`[data-franja-pastillas] [data-pastilla-cajon="${id}"]`);
  const { caja, desmontar } = await montar(ProvisionPorEdades);
  /* Casilla 1: acierto. */
  const bueno = grupo(correcta(casillas[0]).texto);
  await tocar(cajon(caja, bueno));
  assert.equal(cajon(caja, bueno).dataset.marcaE4, "correcta");
  assert.match(cajon(caja, bueno).getAttribute("aria-label"), /\. Correcto$/);
  assert.equal(cajon(caja, bueno).style.boxShadow, `inset 0 0 0 2px ${FAE.text}`);
  comprobarPastilla(enFranja(caja, bueno), "correcta", "t6-a6 acierto");
  sinColorDeLado(cajon(caja, bueno), "t6-a6");
  comprobarMensaje(caja, true, "t6-a6 acierto");
  await tocar(avance(caja));
  /* Casilla 2: error. */
  const c2 = casillas[1];
  const mala = c2.opciones.find((o) => o.tipo);
  await tocar(cajon(caja, grupo(mala.texto)));
  assert.equal(cajon(caja, grupo(mala.texto)).style.boxShadow, `inset 0 0 0 2px ${FAE.coral}`);
  comprobarPastilla(enFranja(caja, grupo(mala.texto)), "tachada", "t6-a6 error");
  comprobarPastilla(enFranja(caja, grupo(correcta(c2).texto)), "revelada", "t6-a6 revelada");
  comprobarMensaje(caja, false, "t6-a6 error");
  /* La franja no se monta: cada pastilla queda en su lado. */
  assert.equal(caja.querySelector("[data-franja-pastillas]").getAttribute("aria-hidden"), "true", "la palabra ya está en el nombre del cajón");
  desmontar();
});

/* ═══════════ LA MESA (t5-a2, t6-a2, t6-a3) ═══════════ */

test("★★★ mesa · «Comprobar» (no «Confirmar asiento»); el valor equivocado queda «No va aquí» y debajo «Iba aquí: {valor}»; el acierto de una pregunta, «Correcto»", async () => {
  /* t6-a2, pregunta 1: un acierto y un error. */
  const p = T6A2.PASOS_T6_ACT2[0];
  const responder = async (caja, texto) => {
    await escribir(caja.querySelector("[data-pregunta] input[data-campo-cifra]"), texto);
    const b = caja.querySelector("[data-confirmar-parte]");
    assert.equal(b.textContent, "Comprobar");
    await tocar(b);
  };
  let m = await montar(ProvisionDeElTorito, { items: [p] });
  await responder(m.caja, "2506200");
  comprobarPastilla(m.caja.querySelector(`[data-pregunta="${p.id}"]`), "correcta", "t6-a2 pregunta bien");
  assert.equal(m.caja.querySelector(`[data-caja-campo="${p.id}"]`).style.border, `2px solid ${BLANCO}`);
  comprobarMensaje(m.caja, true, "t6-a2 pregunta bien");
  m.desmontar();
  m = await montar(ProvisionDeElTorito, { items: [p] });
  await responder(m.caja, "2655000");
  comprobarPastilla(m.caja.querySelector(`[data-pregunta="${p.id}"]`), "tachada", "t6-a2 pregunta mal");
  const iba = m.caja.querySelector(`[data-valor-correcto="${p.id}"]`);
  assert.equal(iba.textContent, "Iba aquí:$2.506.200");
  assert.equal(iba.style.border, `2px solid ${BLANCO}`);
  assert.ok(iba.classList.contains("fae-b5h-revela"));
  comprobarMensaje(m.caja, false, "t6-a2 pregunta mal");
  m.desmontar();

  /* t5-a2, parte 1: la mesa con «Comprobar» y una cuenta que no va. */
  const parte = T5A2.PARTES_T5_ACT2[0];
  m = await montar(CierreSantaPacha, { items: [parte] });
  const sobra = T5A2.ESTANTE_T5_ACT2.find((c) => !parte.asiento.some((e) => e.cuenta === c));
  await tocar(m.caja.querySelector(`[data-sacar="${sobra}:debe"]`));
  await escribir(m.caja.querySelector(`[data-campo-cifra="${sobra}"]`), "1000");
  assert.equal(m.caja.querySelector("[data-confirmar-parte]").textContent, "Comprobar");
  await tocar(m.caja.querySelector("[data-confirmar-parte]"));
  const tarjeta = m.caja.querySelector(`[data-en-mesa="${sobra}"]`);
  assert.equal(tarjeta.style.border, `2px solid ${CORAL}`);
  comprobarPastilla(tarjeta, "tachada", "t5-a2 cuenta que sobra");
  for (const e of parte.asiento) {
    const falta = m.caja.querySelector(`[data-faltaba="${e.cuenta}"]`);
    comprobarPastilla(falta, "revelada", `t5-a2 faltaba ${e.cuenta}`);
    assert.equal(falta.style.border, `2px solid ${BLANCO}`);
  }
  comprobarMensaje(m.caja, false, "t5-a2 error");
  m.desmontar();
});

/* ═══════════ CONTADOR Y BOTÓN: UN SOLO SUSTANTIVO (§4.3) ═══════════ */

/* Responde lo que haya en pantalla, bien o mal: lo que importa es el botón que aparece. */
async function responderAlgo(caja) {
  const cajonFicha = caja.querySelector("[data-estante] button[data-cajon]:not([disabled])");
  if (caja.querySelector("[data-ficha]") && cajonFicha) {
    /* Las fichas tienen reintento: dos cajones distintos, o el bueno a la primera. */
    await tocar(cajonFicha);
    if (!avance(caja)) await tocar(caja.querySelector("[data-estante] button[data-cajon]:not([disabled])"));
    return;
  }
  const pregunta = caja.querySelector("[data-pregunta] input[data-campo-cifra]");
  if (pregunta) { await escribir(pregunta, "1"); await tocar(caja.querySelector("[data-confirmar-parte]")); return; }
  const sacar = caja.querySelector("[data-sacar]");
  if (sacar) {
    await tocar(sacar);
    await escribir(caja.querySelector("[data-campo-cifra]"), "1");
    await tocar(caja.querySelector("[data-confirmar-parte]"));
    return;
  }
  const eje = caja.querySelector("[data-eje] button[data-cajon]:not([disabled])");
  if (eje) { await tocar(eje); return; }
  await tocar(caja.querySelector("button[data-estado='libre']"));
}

const ACTIVIDADES = [
  { nombre: "t5-a1", Juego: QueRentaDa, items: T5A1.FICHAS_T5_ACT1.slice(0, 2), sustantivo: "Ficha" },
  { nombre: "t6-a1", Juego: ClientesOOtra, items: T6A1.FICHAS_T6_ACT1.slice(0, 2), sustantivo: "Ficha" },
  { nombre: "t6-a4", Juego: QueSeDebita, items: T6A4.HECHOS_T6_ACT4.slice(0, 2), sustantivo: "Hecho" },
  { nombre: "t5-a2", Juego: CierreSantaPacha, items: T5A2.PARTES_T5_ACT2.slice(0, 2), sustantivo: "Asiento" },
  { nombre: "t6-a2", Juego: ProvisionDeElTorito, items: T6A2.PASOS_T6_ACT2.slice(0, 2), sustantivo: "Paso" },
  { nombre: "t6-a3", Juego: DeudaQueVuelve, items: T6A3.PARTES_T6_ACT3.slice(0, 2), sustantivo: "Asiento" },
  { nombre: "t6-a6", Juego: ProvisionPorEdades, items: undefined, sustantivo: "Casilla", total: T6A6.PARTES_T6_ACT6.flatMap((p) => p.casillas).length },
];

for (const a of ACTIVIDADES) {
  test(`★★★ ${a.nombre} · «${a.sustantivo} n de N», «Siguiente ${a.sustantivo.toLowerCase()}» y, en el último, «Ver mi resumen»`, async () => {
    const { caja, desmontar } = await montar(a.Juego, { items: a.items });
    const total = a.total ?? a.items.length;
    for (let n = 1; n <= total; n++) {
      const contador = caja.querySelector("[data-contador]");
      assert.equal(contador.textContent, `${a.sustantivo} ${n} de ${total}`, `${a.nombre}: el contador`);
      assert.equal(contador.style.textTransform, "", "sin mayúsculas");
      assert.equal(contador.style.fontSize, "12px");
      await responderAlgo(caja);
      const b = avance(caja);
      assert.ok(b, `${a.nombre}: sin botón de avance en ${n}`);
      assert.equal(b.textContent, n === total ? "Ver mi resumen" : `Siguiente ${a.sustantivo.toLowerCase()}`, `${a.nombre}: el botón sigue al contador`);
      /* El Responder compartido: pastilla teal de ancho completo, texto #06202A en Sora 14/700. */
      assert.equal(b.style.width, "100%");
      assert.equal(b.style.color, "rgb(6, 32, 42)");
      assert.equal(b.style.fontSize, "14px");
      await tocar(b);
    }
    assert.ok(caja.textContent.length > 0);
    desmontar();
  });
}

/* ═══════════ SIN EMOJI EN LOS HACER DE B ═══════════ */

const ARCHIVOS_B = [
  "components/mecanicas/libros/b5/CasillasEnOrden.jsx", "components/mecanicas/libros/b5/CierreConMesa.jsx",
  "components/mecanicas/libros/b5/Devolucion.jsx", "components/mecanicas/libros/b5/EligeUnaOpcion.jsx",
  "components/mecanicas/libros/b5/EncabezadoCompacto.jsx", "components/mecanicas/libros/b5/EstanteDeCajones.jsx",
  "components/mecanicas/libros/b5/FichasUnNivel.jsx", "components/mecanicas/libros/b5/LibroDiario.jsx",
  "components/mecanicas/libros/b5/MarcasE4.jsx",
  "components/mecanicas/libros/tema5/QueRentaDa.jsx", "components/mecanicas/libros/tema5/CierreSantaPacha.jsx",
  "components/mecanicas/libros/tema5/LibroDiario.jsx",
  "components/mecanicas/libros/tema6/ClientesOOtra.jsx", "components/mecanicas/libros/tema6/QueSeDebita.jsx",
  "components/mecanicas/libros/tema6/AsientoMinimo.jsx", "components/mecanicas/libros/tema6/ProvisionDeElTorito.jsx",
  "components/mecanicas/libros/tema6/CuentaQueSeLlena.jsx", "components/mecanicas/libros/tema6/DeudaQueVuelve.jsx",
  "components/mecanicas/libros/tema6/ProvisionPorEdades.jsx", "components/mecanicas/libros/tema6/CajonesDelTiempo.jsx",
  "data/contabilidadT5Act1.js", "data/contabilidadT5Act2.js", "data/contabilidadT6Act1.js", "data/contabilidadT6Act2.js",
  "data/contabilidadT6Act3.js", "data/contabilidadT6Act4.js", "data/contabilidadT6Act6.js",
  "data/asiSeJuegaTema5.js", "data/asiSeJuegaTema6.js",
  "contabilidad/t5Act1.js", "contabilidad/t5Act2.js", "contabilidad/t6Act1.js", "contabilidad/t6Act2.js",
  "contabilidad/t6Act4.js", "contabilidad/b5SegundoFallo.js", "contabilidad/cierreConMesa.js",
];

test("★★★ ningún ✅ ni ❌ en los datos ni en los componentes de los Hacer de B (y ningún ✓ ni ✗ como letra en pantalla)", async () => {
  for (const f of ARCHIVOS_B) {
    const texto = readFileSync(new URL(`../../${f}`, import.meta.url), "utf8");
    assert.doesNotMatch(texto, /[✅❌]/, `${f} lleva ✅ o ❌`);
  }
  /* Lo que se pinta, en las tres mecánicas, con acierto y con error. */
  const x = T6A4.HECHOS_T6_ACT4[0];
  const mala = T6A4.OPCIONES_T6_ACT4.find((o) => o.id !== x.respuesta).id;
  for (const elegida of [x.respuesta, mala]) {
    const { caja, desmontar } = await montar(QueSeDebita, { items: [x] });
    await tocar(caja.querySelector(`[data-opcion="${elegida}"]`).closest("button"));
    assert.doesNotMatch(caja.textContent, /[✅❌✓✗✕]/, `t6-a4 con ${elegida}`);
    desmontar();
  }
  const f = T5A1.FICHAS_T5_ACT1[0];
  const { caja, desmontar } = await montar(QueRentaDa, { items: [f] });
  await tocar(caja.querySelector("[data-estante] button[data-cajon]"));
  assert.doesNotMatch(caja.textContent, /[✅❌✓✗✕]/, "t5-a1");
  desmontar();
});

/* ═══════════ FOCO Y REVELADO ═══════════ */

test("★★ el foco de los Hacer de B: 2 px #F8F9FA separado 2; «Iba aquí» llega a los 0,7 s, solo por opacidad", () => {
  assert.match(CSS_B5H, /button:focus-visible[^{]*\{ outline: 2px solid #F8F9FA; outline-offset: 2px; \}/);
  assert.equal(RETRASO_REVELA_MS, 700);
  assert.match(CSS_B5H, /\.fae-b5h-revela \{ animation: fae-b5h-aparece 150ms cubic-bezier\(\.3,\.9,\.4,1\) 700ms both; \}/);
  assert.match(CSS_B5H, /@keyframes fae-b5h-aparece \{ from \{ opacity: 0; \} to \{ opacity: 1; \} \}/);
  assert.doesNotMatch(CSS_B5H, /infinite/, "nada nuevo en bucle");
});
