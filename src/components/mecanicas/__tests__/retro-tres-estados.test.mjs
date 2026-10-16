import { test } from "node:test";
import assert from "node:assert/strict";
import { JSDOM, VirtualConsole } from "jsdom";

/*
 * ═══════════════════════════════════════════════════════════════════════════
 * RETRO TIENE TRES TONOS, NO DOS (Xeno).
 *
 * Retro decidía el tono con una sola pregunta: ¿empieza por ✅? Si no, coral y
 * «Incorrecto:» para quien escucha la pantalla. Cualquier devolución que no
 * fuera un veredicto —un aviso, una pista— se leía como un error. Hoy todos los
 * textos que le llegan empiezan por ✅ o ❌ (lo guarda emoji-con-espacio), así
 * que esto era una fragilidad y no un fallo visible; esta prueba la deja cubierta.
 *
 * El veredicto lo dice el emoji, que se ve en blanco y negro. Un texto sin ✅ ni
 * ❌ es neutro: ni teal ni coral, sin rótulo de veredicto, y entero.
 * ═══════════════════════════════════════════════════════════════════════════
 */

const dom = new JSDOM("<!doctype html><html><body></body></html>", { url: "http://localhost/", pretendToBeVisual: true, virtualConsole: new VirtualConsole() });
const w = dom.window;
w.matchMedia = (q) => ({ matches: false, media: q, addEventListener() {}, removeEventListener() {}, addListener() {}, removeListener() {} });
for (const [k, v] of Object.entries({
  window: w, document: w.document, navigator: w.navigator, HTMLElement: w.HTMLElement, Element: w.Element, Node: w.Node,
  SVGElement: w.SVGElement, Event: w.Event, MouseEvent: w.MouseEvent, KeyboardEvent: w.KeyboardEvent,
  getComputedStyle: w.getComputedStyle.bind(w), matchMedia: w.matchMedia,
  requestAnimationFrame: w.requestAnimationFrame.bind(w), cancelAnimationFrame: w.cancelAnimationFrame.bind(w),
})) {
  Object.defineProperty(globalThis, k, { value: v, configurable: true, writable: true });
}
globalThis.IS_REACT_ACT_ENVIRONMENT = true;

const React = await import("react");
const { createRoot } = await import("react-dom/client");
const act = React.act;
const h = React.createElement;

const { Retro } = await import("../corazon/juego.jsx");

const TEAL_RGB = "42, 157, 143";
const CORAL_RGB = "231, 111, 81";

const sinEstilo = (el) => el.outerHTML.replace(/ style="[^"]*"/g, "");

const montar = async (texto) => {
  const caja = document.createElement("div");
  document.body.appendChild(caja);
  const raiz = createRoot(caja);
  await act(async () => { raiz.render(h(Retro, { texto })); });
  return { caja, p: caja.querySelector("p"), desmontar: () => { act(() => raiz.unmount()); caja.remove(); } };
};

const BIEN = "✅ Así es: el saldo va del lado que sumó más.";
const MAL = "❌ No: ese es el otro lado.";
const NEUTRO = "Recuerda: el saldo va del lado que sumó más.";
const NEUTRO_EMOJI = "💡 Recuerda: el saldo va del lado que sumó más.";

test("★★★ Retro: ✅, ❌ y un texto sin veredicto son tres devoluciones distintas SIN estilos", async () => {
  const a = await montar(BIEN);
  const b = await montar(MAL);
  const c = await montar(NEUTRO);
  try {
    const [x, y, z] = [sinEstilo(a.p), sinEstilo(b.p), sinEstilo(c.p)];
    assert.notEqual(x, y, "sin estilos, el acierto y el error son la misma devolución");
    assert.notEqual(x, z);
    assert.notEqual(y, z);
  } finally { a.desmontar(); b.desmontar(); c.desmontar(); }
});

test("★★ ✅ es correcto y ❌ es incorrecto: rótulo para quien escucha, emoji para quien ve", async () => {
  const a = await montar(BIEN);
  const b = await montar(MAL);
  try {
    assert.equal(a.p.dataset.retro, "ok");
    assert.equal(b.p.dataset.retro, "mal");
    assert.equal(a.p.querySelector(".fae-jg-oculto")?.textContent, "Correcto: ");
    assert.equal(b.p.querySelector(".fae-jg-oculto")?.textContent, "Incorrecto: ");
    assert.equal(a.p.querySelector('[aria-hidden="true"]')?.textContent, "✅");
    assert.equal(b.p.querySelector('[aria-hidden="true"]')?.textContent, "❌");
    /* El fondo y no el borde: el borde lleva un hex de 8 dígitos (#RRGGBBAA) que JSDOM descarta al leerlo. */
    assert.ok(a.p.style.background.includes(TEAL_RGB), "acierto: fondo teal");
    assert.ok(b.p.style.background.includes(CORAL_RGB), "error: fondo coral");
    assert.equal(a.p.getAttribute("role"), "status");
  } finally { a.desmontar(); b.desmontar(); }
});

test("★★★ un texto sin ✅ ni ❌ NO se anuncia como error: ni coral, ni «Incorrecto:»", async () => {
  for (const texto of [NEUTRO, NEUTRO_EMOJI]) {
    const t = await montar(texto);
    try {
      assert.equal(t.p.dataset.retro, "neutro", texto);
      assert.ok(!/Incorrecto|Correcto/.test(t.p.textContent), `«${texto}» salió con rótulo de veredicto`);
      assert.ok(!t.p.style.background.includes(CORAL_RGB) && !t.p.style.background.includes(TEAL_RGB), `«${texto}» salió con el tono de un veredicto`);
      assert.equal(t.p.querySelector(".fae-jg-oculto"), null);
    } finally { t.desmontar(); }
  }
});

test("★★ un texto neutro sale ENTERO: no se le parte el principio como al emoji", async () => {
  const t = await montar(NEUTRO);
  const u = await montar(NEUTRO_EMOJI);
  try {
    assert.equal(t.p.textContent, NEUTRO, "se perdió el principio del texto");
    assert.equal(u.p.textContent, NEUTRO_EMOJI);
    assert.equal(t.p.querySelector('[aria-hidden="true"]'), null, "se escondió parte del texto a quien escucha");
  } finally { t.desmontar(); u.desmontar(); }
});

test("★ el texto del acierto y del error salen completos, tal cual están escritos", async () => {
  const a = await montar(BIEN);
  const b = await montar(MAL);
  try {
    /* Retro parte «✅ » en emoji + resto (slice(2)): el espacio de después del emoji no se repite. */
    assert.equal(a.p.textContent, `Correcto: ✅${BIEN.slice(2)}`);
    assert.equal(b.p.textContent, `Incorrecto: ❌${MAL.slice(2)}`);
  } finally { a.desmontar(); b.desmontar(); }
});

test("★ sin texto no pinta nada", async () => {
  for (const texto of [null, undefined, ""]) {
    const t = await montar(texto);
    try { assert.equal(t.p, null); } finally { t.desmontar(); }
  }
});
