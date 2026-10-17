import { test, mock } from "node:test";
import assert from "node:assert/strict";
import { JSDOM, VirtualConsole } from "jsdom";

/*
 * ═══════════════════════════════════════════════════════════════════════════
 * LAS CAPAS 2 LARGAS (hoja 7 de Mai, entrega 3 de Futaba) — los pasos que se
 * juntan y la parada con la predicción, en T5 · A2 y T6 · A3, A4 y A5:
 *   · cuántos pasos quedan (14, 13, 9 y 10) y que un paso juntado dice los
 *     textos de antes seguidos, muestra la escena del segundo y resalta la
 *     unión, con lo que llega primero;
 *   · la parada: no es un paso («Antes del paso N»), la pregunta en el hueco
 *     del texto, las opciones en fila, «Siguiente» desactivado hasta elegir,
 *     la escena del paso anterior con el resalte en lo que nombra la pregunta;
 *   · al elegir, la escalera de ayuda (lote C2): al primer error, la pista
 *     en el sitio de la pregunta y «Siguiente» todavía desactivado; al
 *     segundo, marcas de la capa 3 y la devolución en ese sitio; al volver,
 *     ya decidida; «Ver de nuevo» no la borra; «Reproducir» se pausa al
 *     llegar;
 *   · la predicción en la escena (§2a de Mai, enganche B1-B5): la etiqueta
 *     de borrador sale solo después de elegir, montada (absolute) sobre la
 *     pieza que nombra la pregunta; en el paso que viene se califica (✓, o
 *     ✕ y tachada) y en el siguiente desaparece; con «Anterior», calificada.
 * ═══════════════════════════════════════════════════════════════════════════
 */

const dom = new JSDOM("<!doctype html><html><body></body></html>", { url: "http://localhost/", virtualConsole: new VirtualConsole() });
const w = dom.window;
w.matchMedia = (q) => ({ matches: q.includes("reduce"), addEventListener() {}, removeEventListener() {}, addListener() {}, removeListener() {} });
w.requestAnimationFrame = (cb) => setTimeout(() => cb(performance.now()), 16);
w.cancelAnimationFrame = (id) => clearTimeout(id);
w.Element.prototype.scrollIntoView = () => {};
w.scrollBy = () => {};
for (const [k, v] of Object.entries({
  window: w, document: w.document, navigator: w.navigator, localStorage: w.localStorage,
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
const { FAE } = await import("../../theme.js");
const { pegarPorcentaje } = await import("../t6Pieza5.js");

const C = async (ruta) => (await import(`../../components/mecanicas/libros/${ruta}.jsx`)).default;
const D5 = await import("../../data/contabilidadT5Pieza2.js");
const D3 = await import("../../data/contabilidadT6Pieza3.js");
const D4 = await import("../../data/contabilidadT6Pieza4.js");
const D6 = await import("../../data/contabilidadT6Pieza5.js");
const E5 = await import("../t5Pieza2.js");
const E3 = await import("../t6Pieza3.js");
const TANQUE = await import("../../components/mecanicas/libros/tema6/LaProvision.jsx");
const TITULOS = await import("../../components/mecanicas/libros/tema5/TresMomentos.jsx");
const E4 = await import("../t6Pieza4.js");
const E6 = await import("../t6Pieza5.js");
const SIPAGA = await import("../../components/mecanicas/libros/tema6/SiPaga.jsx");
const TABLA = await import("../../components/mecanicas/libros/tema6/LaTablaDelEjemplo.jsx");

/* Cada pieza: su componente, cuántos pasos quedan, su parada y su estado por paso (el que se ve). */
/* `en`: la pieza de la escena que lleva la etiqueta; `dice`: lo que escribe cada opción (§2a de Mai). */
const textoDeOpcion = (par) => Object.fromEntries(par.opciones.map((o) => [o.id, o.texto]));
const PIEZAS = [
  /* Lote 11: la escena de los títulos; la parada resalta lo que queda en Inversiones y la etiqueta va sobre Caja. */
  { nombre: "T5 · A2", en: "caja", dice: textoDeOpcion(D5.PARADA_T5_A2), Componente: await C("tema5/TresMomentos"), pasos: 14, parada: TITULOS.PARADA_TITULOS, estado: TITULOS.estadoTitulos, duracion: E5.T5_A2_JUNTO.duracion },
  /* Lote 7: la escena del tanque; la parada resalta el gasto y la fila del castigo, y la etiqueta va sobre la bandeja del gasto. */
  { nombre: "T6 · A3", en: "bandejaGasto", dice: { si: "Otra vez en marzo", "si-parte": "En marzo, solo lo que faltó", no: "Solo en diciembre" }, Componente: await C("tema6/LaProvision"), pasos: 15, parada: TANQUE.PARADA_TANQUE, estado: TANQUE.estadoTanque, duracion: E3.T6_A3_JUNTO.duracion },
  /* Lote 21: la ficha que entra; la parada resalta el sitio de la respuesta y la etiqueta va sobre él. El paso que viene lleva gesto: «Reproducir» se pausa ahí. */
  { nombre: "T6 · A4", en: "revive", dice: textoDeOpcion(D4.PARADA_T6_A4), Componente: await C("tema6/SiPaga"), pasos: 9, parada: SIPAGA.PARADA_SI_PAGA, estado: SIPAGA.estadoSiPaga, duracion: E4.T6_A4.duracion, gestoDespues: true },
  { nombre: "T6 · A5", en: "v2", dice: textoDeOpcion(D6.PARADA_T6_A5), Componente: await C("tema6/LaTablaDelEjemplo"), pasos: 10, parada: TABLA.PARADA_TABLA, estado: TABLA.estadoTabla, duracion: E6.T6_A5_JUNTO.duracion, pegar: pegarPorcentaje, gestoDespues: true },
];

const montar = async (el) => {
  const caja = document.createElement("div");
  document.body.appendChild(caja);
  const raiz = createRoot(caja);
  await act(async () => { raiz.render(el); });
  return { caja, desmontar: () => { act(() => raiz.unmount()); caja.remove(); } };
};
/* Lote 7: en la capa 2 del tanque, «Siguiente» espera su gesto; se hace antes de tocarlo. */
const { hacerGesto } = await import("./b5-gestos.mjs");
const tocar = async (el) => { await hacerGesto(el, act, w); await act(async () => { el.dispatchEvent(new w.MouseEvent("click", { bubbles: true })); }); };
const rgb = (hex) => `rgb(${[1, 3, 5].map((i) => parseInt(hex.slice(i, i + 2), 16)).join(", ")})`;
const contador = (caja) => caja.querySelector("[data-paso-de]").textContent;
const btn = (caja, cual) => caja.querySelector(`[data-${cual}]`);
const resaltados = (caja) => [...caja.querySelectorAll('[data-escena-viva] [data-resaltado="si"]')].map((n) => n.dataset.elemento).sort();
/* Hasta el paso anterior a la parada. */
const hastaAntes = async (caja, p) => { for (let n = 1; n < p.parada.antes - 1; n++) await tocar(btn(caja, "siguiente")); };
const pegar = (p, t) => (p.pegar ? p.pegar(t) : t);
const falloDe = (par, o) => (typeof par.falla === "string" ? par.falla : par.falla[o]);

test("★★★ los pasos que quedan (Mai §1): T5 · A2 14, T6 · A3 15 (al ancho del sitio), T6 · A4 9 (sin fusiones) y T6 · A5 10; las vueltas atrás de T6 · A3", () => {
  assert.deepEqual([E5.T5_A2_JUNTO.PASOS, E3.T6_A3_JUNTO.PASOS, E4.T6_A4.PASOS, E6.T6_A5_JUNTO.PASOS], [14, 15, 9, 10]);
  /* Las fusiones que no entran: T5 · A2 4 + 5 y T6 · A3 6 + 7 (Mai); T6 · A3 1 + 2 y 9 + 10 (5 renglones al ancho del sitio). */
  const suelto = (f, n) => f.grupos.some((g) => g.length === 1 && g[0] === n);
  for (const n of [4, 5]) assert.ok(suelto(D5.FUSION_T5_A2, n), `T5 · A2, ${n}`);
  for (const n of [1, 2, 6, 7, 9, 10]) assert.ok(suelto(D3.FUSION_T6_A3, n), `T6 · A3, ${n}`);
  /* Cada paso de antes, en un solo paso nuevo y en orden. */
  for (const [f, n] of [[D5.FUSION_T5_A2, 21], [D3.FUSION_T6_A3, 19], [D6.FUSION_T6_A5, 11]]) {
    assert.deepEqual(f.grupos.flat(), Array.from({ length: n }, (_, k) => k + 1));
    assert.equal(f.pies.length, f.grupos.length);
  }
  /* La vuelta atrás de T6 · A3: el paso 11 de antes (el gasto de diciembre, un momento pasado) es el 10. */
  assert.equal(E3.T6_A3_JUNTO.viejo(10), 11);
  assert.deepEqual(E3.T6_A3_JUNTO.estadoPaso(10).resaltados, ["gasto1"]);
});

test("★★★ un paso juntado: la escena del segundo paso, la unión de lo resaltado con lo que llega primero, y la duración de siempre", () => {
  const J = E3.T6_A3_JUNTO;
  /* T6 · A3, paso 11 = 12 + 13: llega «quedó subestimada»; las dos provisiones del 12, después. */
  assert.deepEqual(J.estadoPaso(11).resaltados, ["subestimada", "provision1", "provision2"]);
  const e = J.estadoPaso(11);
  assert.deepEqual(Object.fromEntries(Object.entries(e.elementos).map(([id, x]) => [id, x.visible])),
    Object.fromEntries(Object.entries(E3.T6_A3.estadoPaso(13).elementos).map(([id, x]) => [id, x.visible])), "la escena del 13");
  for (const id of ["subestimada", "provision1", "provision2"]) assert.deepEqual([e.elementos[id].resaltado, e.elementos[id].atenuado], [true, false]);
  assert.equal(e.elementos.clientes2.atenuado, true, "lo demás, atenuado");
  /* El texto: los dos de antes, seguidos y sin cambiar una palabra. */
  assert.equal(J.TODOS[10].texto, `${D3.PASOS_T6_A3[11].texto} ${D3.PASOS_T6_A3[12].texto}`);
  /* «Reproducir»: 3 000 ms + 450 ms por palabra del texto juntado. */
  assert.equal(J.duracion(11), 3000 + 450 * J.TODOS[10].texto.split(/\s+/).length);
});

for (const p of PIEZAS) {
  test(`★★★ ${p.nombre}: la parada no es un paso: «Antes del paso ${p.parada.antes}», la pregunta, las opciones en fila, «Siguiente» desactivado y la escena del paso de antes con el resalte de la pregunta`, async () => {
    const { caja, desmontar } = await montar(h(p.Componente));
    await hastaAntes(caja, p);
    assert.equal(contador(caja), `Paso ${p.parada.antes - 1} de ${p.pasos}`);
    await tocar(btn(caja, "siguiente"));
    assert.equal(contador(caja), `Antes del paso ${p.parada.antes}`);
    assert.equal(caja.querySelector("[data-texto-paso] [data-pregunta]").textContent, pegar(p, p.parada.pregunta));
    assert.equal(caja.querySelector("[data-texto-paso]").getAttribute("aria-live"), "polite");
    const grupo = caja.querySelector("[data-parada]");
    assert.equal(grupo.getAttribute("role"), "group");
    assert.equal(grupo.getAttribute("aria-label"), p.parada.pregunta);
    assert.equal(grupo.style.display, "flex");
    assert.equal(grupo.style.gap, "4px", "en fila, separación de 4");
    const opciones = [...grupo.querySelectorAll("[data-opcion]")];
    assert.deepEqual(opciones.map((b) => b.textContent), p.parada.opciones.map((o) => pegar(p, o.texto)), "en el orden de Futaba");
    for (const b of opciones) assert.equal(b.style.minHeight, "44px");
    assert.equal(caja.querySelector("[data-pie]").textContent, p.parada.pie);
    assert.equal(btn(caja, "siguiente").disabled, true, "«Siguiente», desactivado hasta elegir");
    assert.equal(btn(caja, "siguiente").textContent, "Siguiente", "con su mismo texto");
    assert.equal(btn(caja, "anterior").disabled, false);
    /* La escena: la del paso anterior, con el resalte en lo que nombra la pregunta (y nunca en una silueta). */
    assert.deepEqual(resaltados(caja), [...p.parada.resaltados].sort());
    for (const id of p.parada.resaltados) {
      const n = caja.querySelector(`[data-escena-viva] [data-elemento="${id}"]`);
      assert.equal(n.style.getPropertyValue("--b5-silueta"), "", `${id}: no es una silueta`);
    }
    const antes = p.estado(p.parada.antes - 1);
    assert.deepEqual(Object.entries(antes.elementos).filter(([, x]) => x.visible).map(([id]) => id).sort(),
      [...caja.querySelectorAll("[data-escena-viva] [data-elemento]")].filter((n) => !n.style.getPropertyValue("--b5-silueta") && n.style.visibility !== "hidden").map((n) => n.dataset.elemento).filter((id) => id in antes.elementos).sort(),
      "lo que se ve es lo del paso de antes");
    desmontar();
  });

  test(`★★★ ${p.nombre}: al primer error, la pista en el sitio de la pregunta, la elegida tachada, las demás activas y «Siguiente» desactivado`, async () => {
    const { caja, desmontar } = await montar(h(p.Componente));
    await hastaAntes(caja, p);
    await tocar(btn(caja, "siguiente"));
    const mala = p.parada.opciones.find((o) => o.id !== p.parada.correcta).id;
    await tocar(caja.querySelector(`[data-parada] [data-opcion="${mala}"]`));
    assert.equal(caja.querySelector("[data-texto-paso] [data-pregunta]"), null, "la pregunta deja su sitio");
    const pista = caja.querySelector("[data-texto-paso] [data-pista]");
    assert.equal(pista.textContent, pegar(p, p.parada.pista));
    assert.equal(pista.style.borderLeft, `3px solid ${rgb("#B8C4D4")}`, "la forma de la devolución, sin coral");
    assert.equal(caja.querySelector("[data-texto-paso] [data-devolucion]"), null, "ni la devolución");
    assert.equal(caja.querySelector("[data-texto-paso]").getAttribute("aria-live"), "polite", "la pista se anuncia");
    const por = Object.fromEntries([...caja.querySelectorAll("[data-parada] [data-opcion]")].map((b) => [b.dataset.opcion, b]));
    assert.equal(por[mala].style.textDecoration, "line-through");
    assert.equal(por[mala].getAttribute("aria-disabled"), "true");
    for (const [id, b] of Object.entries(por)) {
      if (id === mala) continue;
      assert.equal(b.hasAttribute("aria-disabled"), false, `${id}, activa`);
      assert.equal(b.style.border, "1px solid rgba(248, 249, 250, 0.36)", `${id}: nada delata la correcta`);
    }
    assert.equal(btn(caja, "siguiente").disabled, true, "«Siguiente» espera a que se cierre");
    /* La reserva del texto también guarda la pista: el bloque no crece al salir. */
    const reserva = [...caja.querySelectorAll('[data-bloque-control] [aria-hidden="true"] p')].map((n) => n.textContent);
    assert.ok(reserva.includes(pegar(p, p.parada.pista)));
    desmontar();
  });

  test(`★★★ ${p.nombre}: al segundo error, la devolución en el sitio de la pregunta, las opciones marcadas como en la capa 3, «Siguiente» activo; al volver, ya decidida`, async () => {
    const { caja, desmontar } = await montar(h(p.Componente));
    await hastaAntes(caja, p);
    await tocar(btn(caja, "siguiente"));
    const [mala1, mala] = p.parada.opciones.filter((o) => o.id !== p.parada.correcta).map((o) => o.id);
    assert.ok(mala, "con dos opciones malas (terceras opciones del lote C2)");
    await tocar(caja.querySelector(`[data-parada] [data-opcion="${mala1}"]`));
    await tocar(caja.querySelector(`[data-parada] [data-opcion="${mala}"]`));
    assert.equal(caja.querySelector("[data-texto-paso] [data-pregunta]"), null, "la pregunta deja su sitio");
    assert.equal(caja.querySelector("[data-texto-paso] [data-pista]"), null, "y la pista también");
    const dev = caja.querySelector("[data-texto-paso] [data-devolucion]");
    assert.equal(dev.textContent, pegar(p, falloDe(p.parada, mala)));
    assert.equal(dev.style.borderLeft, `3px solid ${rgb("#B8C4D4")}`, "la forma de la devolución de UnaFrase, sin coral");
    const por = Object.fromEntries([...caja.querySelectorAll("[data-parada] [data-opcion]")].map((b) => [b.dataset.opcion, b]));
    assert.equal(por[p.parada.correcta].style.border, `2px solid ${rgb(FAE.node)}`);
    assert.equal(por[p.parada.correcta].style.background, rgb(FAE.navy));
    assert.equal(por[mala].style.textDecoration, "line-through");
    assert.equal(por[mala1].style.textDecoration, "line-through");
    for (const [id, b] of Object.entries(por)) {
      if (![p.parada.correcta, mala, mala1].includes(id)) assert.equal(b.style.opacity, "0.5");
      assert.equal(b.getAttribute("aria-disabled"), "true");
    }
    /* Cerrada: tocar la correcta no cambia nada. */
    await tocar(por[p.parada.correcta]);
    assert.equal(por[mala].getAttribute("aria-pressed"), "true");
    assert.equal(btn(caja, "siguiente").disabled, false);
    await tocar(btn(caja, "siguiente"));
    assert.equal(contador(caja), `Paso ${p.parada.antes} de ${p.pasos}`, "sigue en el paso que viene");
    assert.equal(caja.querySelector("[data-parada]"), null);
    /* «Anterior» desde el paso que viene: la parada, ya decidida. Otra vez «Anterior»: el paso de antes. */
    await tocar(btn(caja, "anterior"));
    assert.equal(contador(caja), `Antes del paso ${p.parada.antes}`);
    assert.equal(caja.querySelector("[data-texto-paso] [data-devolucion]").textContent, pegar(p, falloDe(p.parada, mala)));
    await tocar(btn(caja, "anterior"));
    assert.equal(contador(caja), `Paso ${p.parada.antes - 1} de ${p.pasos}`);
    /* «Ver de nuevo» no borra la decisión. */
    for (let k = 0; k < 40 && !btn(caja, "siguiente").disabled; k++) await tocar(btn(caja, "siguiente"));
    assert.equal(btn(caja, "reproducir").textContent, "Ver de nuevo");
    await tocar(btn(caja, "reproducir"));
    await hastaAntes(caja, p);
    await tocar(btn(caja, "siguiente"));
    assert.equal(caja.querySelector(`[data-parada] [data-opcion="${mala}"]`).getAttribute("aria-pressed"), "true", "ya decidida");
    desmontar();
  });

  test(`★★★ ${p.nombre}: al acertar, la pregunta se queda y no se añade nada`, async () => {
    const { caja, desmontar } = await montar(h(p.Componente));
    await hastaAntes(caja, p);
    await tocar(btn(caja, "siguiente"));
    await tocar(caja.querySelector(`[data-parada] [data-opcion="${p.parada.correcta}"]`));
    assert.equal(caja.querySelector("[data-texto-paso] [data-pregunta]").textContent, pegar(p, p.parada.pregunta));
    assert.equal(caja.querySelector("[data-texto-paso] [data-devolucion]"), null);
    assert.equal(btn(caja, "siguiente").disabled, false);
    desmontar();
  });

  test(`★★★ ${p.nombre}: «Reproducir» se pausa al llegar a la parada y, ya elegida, sigue desde el paso que viene`, async () => {
    mock.timers.enable({ apis: ["setTimeout"] });
    try {
      const { caja, desmontar } = await montar(h(p.Componente));
      await hastaAntes(caja, p);
      /* Lote 11: si el paso de antes de la parada lleva un gesto (T5 · A2: la fecha de noviembre), se hace antes de reproducir. */
      await hacerGesto(btn(caja, "siguiente"), act, w);
      await tocar(btn(caja, "reproducir"));
      assert.equal(btn(caja, "reproducir").getAttribute("aria-pressed"), "true");
      await act(async () => { mock.timers.tick(p.duracion(p.parada.antes - 1)); });
      assert.equal(contador(caja), `Antes del paso ${p.parada.antes}`);
      assert.equal(btn(caja, "reproducir").textContent, "Reproducir", "pausado");
      assert.equal(btn(caja, "reproducir").getAttribute("aria-pressed"), "false");
      /* Sin elegir, «Reproducir» no la salta. */
      await tocar(btn(caja, "reproducir"));
      assert.equal(contador(caja), `Antes del paso ${p.parada.antes}`);
      await tocar(caja.querySelector(`[data-parada] [data-opcion="${p.parada.correcta}"]`));
      await tocar(btn(caja, "reproducir"));
      assert.equal(contador(caja), `Paso ${p.parada.antes} de ${p.pasos}`, "la parada no tiene duración");
      /* Si el paso que viene lleva gesto (lote 21), «Reproducir» se pausa ahí hasta hacerlo. */
      assert.equal(btn(caja, "reproducir").getAttribute("aria-pressed"), p.gestoDespues ? "false" : "true", p.gestoDespues ? "se pausa en el gesto" : "y sigue reproduciendo");
      desmontar();
    } finally {
      mock.timers.reset();
    }
  });
}

for (const p of PIEZAS) {
  const etiqueta = (caja) => caja.querySelector("[data-etiqueta-parada]");
  const elegirEnParada = async (caja, id) => tocar(caja.querySelector(`[data-parada] [data-opcion="${id}"]`));

  test(`★★★ ${p.nombre} · §2a: la etiqueta sale solo después de elegir, como borrador montado sobre «${p.en}» sin ocupar sitio`, async () => {
    const { caja, desmontar } = await montar(h(p.Componente));
    assert.equal(etiqueta(caja), null, "en los pasos, nada");
    await hastaAntes(caja, p);
    await tocar(btn(caja, "siguiente"));
    assert.equal(etiqueta(caja), null, "R10: en la parada, antes de elegir, nada");
    const alto = caja.querySelector("[data-escena]").innerHTML.length;
    const mala = p.parada.opciones.find((o) => o.id !== p.parada.correcta).id;
    await elegirEnParada(caja, mala);
    const e = etiqueta(caja);
    assert.ok(e, "al elegir, la etiqueta");
    assert.equal(e.dataset.etiquetaParada, p.en);
    assert.ok(caja.querySelector(`[data-escena-viva] [data-elemento="${p.en}"]`), `«${p.en}» está en la escena`);
    assert.equal(e.querySelector("[data-texto-etiqueta]").textContent, p.dice[mala]);
    assert.equal(e.dataset.marca, "", "borrador: sin calificar");
    assert.equal(e.querySelector("svg"), null);
    assert.equal(e.style.position, "absolute", "montada: no ocupa sitio");
    assert.equal(e.style.transform, "translateY(-50%)", "sobre el borde de arriba de la pieza");
    assert.equal(e.style.border, `1.5px dashed ${rgb(FAE.node)}`);
    assert.equal(e.style.borderRadius, "6px");
    assert.deepEqual([e.style.fontFamily, e.style.fontSize, e.style.fontWeight], ["Inter, sans-serif", "12px", "600"]);
    assert.equal(e.getAttribute("aria-hidden"), "true", "la escena ya va oculta al lector");
    assert.equal(e.closest("[data-escena]"), null, "fuera de la escena: no la cambia");
    assert.equal(caja.querySelector("[data-escena]").innerHTML.length, alto, "la escena no cambia al elegir");
    desmontar();
  });

  for (const acierta of [true, false]) {
    test(`★★★ ${p.nombre} · §2a: ${acierta ? "acierto" : "dos errores"}: en el paso que viene la etiqueta se califica (${acierta ? "✓" : "✕ y tachada"}); en el siguiente desaparece; con «Anterior», la parada la muestra calificada`, async () => {
      const { caja, desmontar } = await montar(h(p.Componente));
      await hastaAntes(caja, p);
      await tocar(btn(caja, "siguiente"));
      const malas = p.parada.opciones.filter((o) => o.id !== p.parada.correcta).map((o) => o.id);
      const ultima = acierta ? p.parada.correcta : malas[1];
      if (acierta) await elegirEnParada(caja, p.parada.correcta);
      else { await elegirEnParada(caja, malas[0]); await elegirEnParada(caja, malas[1]); }
      assert.equal(etiqueta(caja).dataset.marca, "", "en la parada, todavía borrador");
      assert.equal(etiqueta(caja).querySelector("[data-texto-etiqueta]").textContent, p.dice[ultima], "dice la última elegida");
      await tocar(btn(caja, "siguiente"));
      assert.equal(contador(caja), `Paso ${p.parada.antes} de ${p.pasos}`);
      const e = etiqueta(caja);
      assert.ok(e, "en el paso que viene, la etiqueta sigue");
      assert.equal(e.dataset.marca, acierta ? "correcta" : "tachada");
      assert.ok(e.querySelector(`svg[data-icono="${acierta ? "visto" : "tache"}"]`));
      assert.equal(e.querySelector("[data-texto-etiqueta]").style.textDecoration, acierta ? "" : "line-through");
      await tocar(btn(caja, "siguiente"));
      assert.equal(etiqueta(caja), null, "en el siguiente, desaparece");
      await tocar(btn(caja, "anterior"));
      assert.equal(etiqueta(caja).dataset.marca, acierta ? "correcta" : "tachada", "volviendo, calificada");
      await tocar(btn(caja, "anterior"));
      assert.equal(contador(caja), `Antes del paso ${p.parada.antes}`);
      assert.equal(etiqueta(caja).dataset.marca, acierta ? "correcta" : "tachada", "la parada la muestra ya decidida");
      await tocar(btn(caja, "anterior"));
      assert.equal(etiqueta(caja), null, "en el paso de antes, nada");
      desmontar();
    });
  }
}

test("★★ T6 A5: el paso juntado 9 + 10 lleva «Basado en el libro, p. 202», como sus dos pasos de origen (Shoko, #245)", async () => {
  const D = await import("../../data/contabilidadT6Pieza5.js");
  const k = D.FUSION_T6_A5.grupos.findIndex((g) => g.length === 2 && g[0] === 9 && g[1] === 10);
  assert.equal(D.FUSION_T6_A5.pies[k], "Basado en el libro, p. 202");
  assert.ok([8, 9].every((i) => D.PASOS_T6_A5[i].pie === "Basado en el libro, p. 202"), "los pasos de origen llevan ese pie");
});
