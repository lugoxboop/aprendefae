import { test } from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { JSDOM, VirtualConsole } from "jsdom";

/*
 * ═══════════════════════════════════════════════════════════════════════════
 * LA TIENDA: el saldo, la tabla de cómo ganar —siempre a la vista—, los tres
 * estados de un nivel y la ausencia de coral.
 *
 * Se monta con un proveedor de cuenta de mentira: la compra de verdad es una
 * función de la base y tiene su propia prueba en SQL (cristales_test.sql). Lo
 * que se comprueba aquí es la pantalla.
 * ═══════════════════════════════════════════════════════════════════════════
 */

const dom = new JSDOM("<!doctype html><html><body></body></html>", { url: "http://localhost/", virtualConsole: new VirtualConsole() });
const w = dom.window;
w.matchMedia = () => ({ matches: false, addEventListener() {}, removeEventListener() {}, addListener() {}, removeListener() {} });
for (const [k, v] of Object.entries({
  window: w, document: w.document, navigator: w.navigator,
  HTMLElement: w.HTMLElement, Element: w.Element, Node: w.Node, SVGElement: w.SVGElement,
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
const { default: TiendaView } = await import("../TiendaView.jsx");
const { FUENTES } = await import("../../../cristales/cristales.js");
const { FAE } = await import("../../../theme.js");

const PERFIL = (extra = {}) => ({
  nickname: "Cami", points: 4200, cristales_balance: 75,
  avatar_shape: "nucleo", avatar_palette: "marea", avatar_level: 1, avatar_unlocked_levels: [1],
  ...extra,
});

function montar({ perfil = PERFIL(), onComprar = async () => ({}), session = { user: { id: "u" } } } = {}) {
  const aplicados = [];
  const valor = {
    perfil, session, pedirCuenta: () => false,
    aplicarPerfil: (fila) => aplicados.push(fila),
    refrescarPerfil: async () => perfil,
  };
  const caja = document.createElement("div");
  document.body.appendChild(caja);
  const raiz = createRoot(caja);
  act(() => raiz.render(
    React.createElement(AuthContext.Provider, { value: valor },
      React.createElement(TiendaView, { onBack: () => {}, onComprar })),
  ));
  return { caja, aplicados, desmontar: () => { act(() => raiz.unmount()); caja.remove(); } };
}

const pulsar = async (el) => { await act(async () => { el.dispatchEvent(new w.MouseEvent("click", { bubbles: true })); }); };
const tarjeta = (caja, n) => caja.querySelector(`[data-nivel="${n}"]`);
/* jsdom normaliza los colores a rgb(): #2A9D8F se lee 'rgb(42, 157, 143)'. */
const rgb = (hex) => {
  const [, r, g, b] = /^#(..)(..)(..)$/.exec(hex);
  return `rgb(${parseInt(r, 16)}, ${parseInt(g, 16)}, ${parseInt(b, 16)})`;
};

test("el saldo va arriba, con su número grande y su ícono", () => {
  const m = montar();
  try {
    const saldo = m.caja.querySelector("[data-saldo]");
    assert.ok(saldo);
    assert.match(saldo.textContent, /Cristales/);
    assert.match(saldo.textContent, /75/);
    assert.ok(saldo.querySelector("svg"), "el ícono del cristal");
  } finally { m.desmontar(); }
});

test("la tabla de cómo ganar Cristales está siempre a la vista, con sus seis filas", () => {
  const m = montar();
  try {
    const tabla = m.caja.querySelector("[data-como-ganar]");
    assert.ok(tabla, "no está detrás de un acordeón ni de un botón");
    const filas = [...tabla.querySelectorAll("[data-fuente]")];
    assert.equal(filas.length, FUENTES.length);
    assert.deepEqual(filas.map((f) => f.dataset.fuente), FUENTES.map((f) => f.id));
    assert.match(tabla.textContent, /Racha de 3 días/);
    assert.match(tabla.textContent, /\+5/);
    assert.match(tabla.textContent, /Cada 5 actividades distintas/);
    assert.match(tabla.textContent, /\+20/);
    assert.match(tabla.textContent, /Podio semanal de tu liga/);
    assert.ok(!/medalla/i.test(tabla.textContent), "las medallas no se prometen todavía");
  } finally { m.desmontar(); }
});

test("con 75 Cristales: el II se puede desbloquear y el III y el IV dicen cuántos faltan", () => {
  const m = montar();
  try {
    assert.equal(tarjeta(m.caja, 2).dataset.estado, "alcanzable");
    assert.equal(tarjeta(m.caja, 2).querySelector("[data-comprar='2']").disabled, false);
    assert.match(tarjeta(m.caja, 2).textContent, /60/);

    assert.equal(tarjeta(m.caja, 3).dataset.estado, "falta");
    assert.equal(tarjeta(m.caja, 3).querySelector("[data-faltan]").dataset.faltan, "75", "150 − 75");
    assert.match(tarjeta(m.caja, 3).textContent, /te faltan 75/);
    assert.equal(tarjeta(m.caja, 3).querySelector("[data-comprar='3']").disabled, true);

    assert.equal(tarjeta(m.caja, 4).querySelector("[data-faltan]").dataset.faltan, "225", "300 − 75");

    /* Y cada tarjeta enseña su miniatura con la forma y paleta del estudiante. */
    assert.equal(tarjeta(m.caja, 2).querySelector("svg[data-avatar]").dataset.avatar, "nucleo-marea-2");
    assert.equal(tarjeta(m.caja, 4).querySelector("svg[data-avatar]").dataset.avatar, "nucleo-marea-4");
  } finally { m.desmontar(); }
});

test("un nivel comprado se ve en teal, sin botón y sin precio", () => {
  const m = montar({ perfil: PERFIL({ avatar_unlocked_levels: [1, 2], cristales_balance: 15 }) });
  try {
    const dos = tarjeta(m.caja, 2);
    assert.equal(dos.dataset.estado, "comprado");
    assert.match(dos.textContent, /Ya es tuyo/);
    assert.equal(dos.querySelector("[data-comprar='2']"), null);
    assert.equal(dos.style.borderColor, rgb(FAE.teal));
    assert.ok(!dos.textContent.includes("60"), "un precio ya pagado no se vuelve a enseñar");
  } finally { m.desmontar(); }
});

test("comprar aplica la fila que devuelve la base, sin recargar nada", async () => {
  const pedidos = [];
  const m = montar({
    onComprar: async (n) => {
      pedidos.push(n);
      return { perfil: PERFIL({ cristales_balance: 15, avatar_unlocked_levels: [1, 2] }) };
    },
  });
  try {
    await pulsar(m.caja.querySelector("[data-comprar='2']"));
    assert.deepEqual(pedidos, [2]);
    assert.equal(m.aplicados.length, 1);
    assert.equal(m.aplicados[0].cristales_balance, 15);
  } finally { m.desmontar(); }
});

test("si la compra falla, se dice en palabras y en ámbar, nunca en coral", async () => {
  const m = montar({ onComprar: async () => ({ error: "No se pudo comprar. Vuelve a mirar tu saldo." }) });
  try {
    await pulsar(m.caja.querySelector("[data-comprar='2']"));
    const aviso = m.caja.querySelector("[role='alert']");
    assert.match(aviso.textContent, /No se pudo comprar/);
    assert.equal(aviso.style.color, rgb(FAE.ambar));
    assert.equal(m.aplicados.length, 0);
  } finally { m.desmontar(); }
});

test("CORAL NO APARECE en la Tienda, ni en un borde, ni en un texto, ni en un fondo", () => {
  /*
   * Coral significa error en todo el sitio. Un nivel que todavía no alcanzas no
   * es un error: es un precio.
   *
   * Los avatares quedan fuera de la búsqueda a propósito: el coral de un avatar
   * es el color de sus nodos en las paletas Nocturno, Brasa y Aurora —parte de
   * la identidad de la figura, definida en el kit— y no un estado de la pantalla.
   */
  const m = montar({ perfil: PERFIL({ cristales_balance: 0 }) });
  try {
    const coral = FAE.coral.toLowerCase();
    const sospechosos = [...m.caja.querySelectorAll("*")].filter((el) => {
      if (el.closest("svg[data-avatar]")) return false;
      const estilo = (el.getAttribute("style") ?? "").toLowerCase();
      return estilo.includes(coral) || estilo.includes("231, 111, 81") || estilo.includes("231,111,81");
    });
    assert.deepEqual(sospechosos.map((el) => el.getAttribute("style")), [], "coral en la Tienda");
  } finally { m.desmontar(); }
});

test("la Tienda es una vista con su hash, y App la pinta y sabe llegar a ella", async () => {
  const { VISTAS, interpretar, serializar } = await import("../../../ruta.js");
  assert.ok(VISTAS.has("tienda"), "sin esto el hash caería en la portada en silencio");
  assert.equal(interpretar(serializar("tienda", null)).vista, "tienda");

  const app = readFileSync(new URL("../../../App.jsx", import.meta.url), "utf8");
  assert.ok(app.includes('view === "tienda"'), "App tiene que pintarla");
  assert.ok(app.includes("irATienda"), "y la navegación tiene que poder llegar");
});

test("sin sesión, la Tienda invita a entrar y no enseña saldo ni niveles", () => {
  const m = montar({ session: null, perfil: null });
  try {
    assert.equal(m.caja.querySelector("[data-saldo]"), null);
    assert.equal(m.caja.querySelector("[data-nivel='2']"), null);
    assert.match(m.caja.textContent, /Entra para ver tus Cristales/);
  } finally { m.desmontar(); }
});
