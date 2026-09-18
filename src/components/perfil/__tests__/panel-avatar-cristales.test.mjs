import { test } from "node:test";
import assert from "node:assert/strict";
import { JSDOM, VirtualConsole } from "jsdom";

/*
 * ═══════════════════════════════════════════════════════════════════════════
 * EL PANEL DE PERFIL con avatar y Cristales.
 *
 *   · el avatar a 96 px, y tocarlo abre Editar perfil (el atajo directo)
 *   · los Cristales junto a los FP y la racha, y esa tarjeta es la entrada a la
 *     Tienda
 *   · el aviso de la primera vez: suave, descartable y no vuelve
 * ═══════════════════════════════════════════════════════════════════════════
 */

const dom = new JSDOM("<!doctype html><html><body></body></html>", { url: "http://localhost/", virtualConsole: new VirtualConsole() });
const w = dom.window;
w.matchMedia = () => ({ matches: false, addEventListener() {}, removeEventListener() {}, addListener() {}, removeListener() {} });
for (const [k, v] of Object.entries({
  window: w, document: w.document, navigator: w.navigator, localStorage: w.localStorage,
  HTMLElement: w.HTMLElement, HTMLInputElement: w.HTMLInputElement, Element: w.Element, Node: w.Node, SVGElement: w.SVGElement,
  Event: w.Event, MouseEvent: w.MouseEvent, getComputedStyle: w.getComputedStyle.bind(w), matchMedia: w.matchMedia,
})) {
  Object.defineProperty(globalThis, k, { value: v, configurable: true, writable: true });
}
globalThis.IS_REACT_ACT_ENVIRONMENT = true;
w.innerWidth = 375;
w.innerHeight = 812;

const React = await import("react");
const { createRoot } = await import("react-dom/client");
const act = React.act;
const { AuthContext } = await import("../../../auth/AuthProvider.jsx");
const { NavigationContext } = await import("../../../navigation.js");
const { default: PerfilView } = await import("../../PerfilView.jsx");
const { CLAVE_AVISO, AVISO_AVATAR, avisoPendiente, descartarAviso } = await import("../avisoAvatar.js");

const PERFIL = {
  nickname: "Cami", full_name: "Camila", points: 4200, streak: 3, best_streak: 9,
  cristales_balance: 130, avatar_shape: "nucleo", avatar_palette: "marea", avatar_level: 2,
  avatar_unlocked_levels: [1, 2],
};

function montar({ perfil = PERFIL } = {}) {
  const tienda = [];
  const caja = document.createElement("div");
  document.body.appendChild(caja);
  const raiz = createRoot(caja);
  act(() => raiz.render(
    React.createElement(AuthContext.Provider, {
      value: { perfil, session: { user: { id: "u" } }, pedirCuenta: () => true, guardarPerfil: async () => ({}), aplicarPerfil: () => {}, refrescarPerfil: async () => perfil },
    },
      React.createElement(NavigationContext.Provider, { value: { irATienda: () => tienda.push(1), irAPerfil: () => {}, irAPanelDocente: () => {} } },
        React.createElement(PerfilView, { onBack: () => {} }))),
  ));
  return { caja, tienda, desmontar: () => { act(() => raiz.unmount()); caja.remove(); } };
}

const pulsar = async (el) => { await act(async () => { el.dispatchEvent(new w.MouseEvent("click", { bubbles: true })); }); };

test("el avatar del perfil sale a 96 px con la combinación guardada", () => {
  w.localStorage.clear();
  const m = montar();
  try {
    const svg = m.caja.querySelector("[data-abrir-avatar] svg[data-avatar]");
    assert.equal(svg.dataset.avatar, "nucleo-marea-2");
    assert.equal(svg.getAttribute("width"), "96");
    assert.match(m.caja.querySelector("[data-abrir-avatar]").getAttribute("aria-label"), /Núcleo · Marea · Nivel II/);
  } finally { m.desmontar(); }
});

test("tocar el avatar abre Editar perfil, con el selector dentro", async () => {
  w.localStorage.clear();
  const m = montar();
  try {
    assert.equal(m.caja.querySelector("[data-selector-avatar]"), null);
    await pulsar(m.caja.querySelector("[data-abrir-avatar]"));
    assert.ok(m.caja.querySelector("[data-editar-perfil]"), "se abrió el panel");
    assert.ok(m.caja.querySelector("[data-seccion='avatar'] [data-selector-avatar]"), "con la sección del avatar");
  } finally { m.desmontar(); }
});

test("los Cristales van junto a los FP y la racha, y esa tarjeta lleva a la Tienda", async () => {
  w.localStorage.clear();
  const m = montar();
  try {
    const tienda = m.caja.querySelector("[data-ir-tienda]");
    assert.ok(tienda, "la entrada principal a la Tienda");
    assert.match(tienda.textContent, /Cristales/);
    assert.match(tienda.textContent, /130/);
    assert.match(tienda.textContent, /Ir a la Tienda/);
    assert.ok(tienda.querySelector("svg"), "con el ícono del cristal");

    /* Y en la misma rejilla que los FP: es la moneda al lado del puntaje. */
    const rejilla = tienda.parentElement;
    assert.match(rejilla.textContent, /FP acumulados/);
    assert.match(rejilla.textContent, /4200/);
    assert.match(rejilla.textContent, /Racha/);

    await pulsar(tienda);
    assert.equal(m.tienda.length, 1);
  } finally { m.desmontar(); }
});

test("el aviso de la primera vez se puede descartar y no vuelve a aparecer", async () => {
  w.localStorage.clear();
  assert.equal(avisoPendiente(w.localStorage), true);

  const primera = montar();
  try {
    const aviso = primera.caja.querySelector("[data-aviso-avatar]");
    assert.ok(aviso, "la primera vez sí sale");
    assert.match(aviso.textContent, new RegExp(AVISO_AVATAR));
    /* No es un modal ni un paso obligatorio: el resto del perfil está ahí. */
    assert.ok(primera.caja.querySelector("[data-apodo]"));

    await pulsar(aviso.querySelector("[data-descartar-aviso]"));
    assert.equal(primera.caja.querySelector("[data-aviso-avatar]"), null, "se cierra al tocarlo");
    assert.equal(w.localStorage.getItem(CLAVE_AVISO), "visto");
  } finally { primera.desmontar(); }

  const segunda = montar();
  try {
    assert.equal(segunda.caja.querySelector("[data-aviso-avatar]"), null, "y no vuelve en la siguiente visita");
  } finally { segunda.desmontar(); }
});

test("sin almacenamiento, el aviso se enseña y cerrarlo no rompe nada", () => {
  const roto = {
    getItem() { throw new Error("modo privado"); },
    setItem() { throw new Error("modo privado"); },
  };
  assert.equal(avisoPendiente(roto), true);
  assert.doesNotThrow(() => descartarAviso(roto));
  /* Y sin almacén ninguno: se enseña, y descartarlo tampoco lanza. */
  assert.equal(avisoPendiente(null), true);
  assert.doesNotThrow(() => descartarAviso(null));
});
