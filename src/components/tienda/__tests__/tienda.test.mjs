import { test } from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { JSDOM, VirtualConsole } from "jsdom";

/*
 * ═══════════════════════════════════════════════════════════════════════════
 * LA TIENDA: el saldo, la tabla de cómo ganar —siempre a la vista—, los tres
 * estados de un accesorio y la ausencia de coral.
 *
 * Desde el paso a mascotas, la Tienda vende ACCESORIOS para la mascota (no
 * formas de figura). Se monta con un proveedor de cuenta de mentira: la compra
 * de verdad es una función de la base y tiene su propia prueba en SQL. Lo que se
 * comprueba aquí es la pantalla.
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
  mascota_especie: "gato", mascota_nombre: "Pelusa", mascota_paleta: "negro", mascota_ojos: "azul",
  mascota_accesorios: [], mascota_puestos: [],
  ...extra,
});

function montar({ perfil = PERFIL(), onComprarAccesorio = async () => ({}), session = { user: { id: "u" } } } = {}) {
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
      React.createElement(TiendaView, { onBack: () => {}, onComprarAccesorio })),
  ));
  return { caja, aplicados, desmontar: () => { act(() => raiz.unmount()); caja.remove(); } };
}

const pulsar = async (el) => { await act(async () => { el.dispatchEvent(new w.MouseEvent("click", { bubbles: true })); }); };
const celda = (caja, id) => caja.querySelector(`[data-accesorio="${id}"]`);
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

test("el escaparate muestra la mascota del estudiante, no una figura", () => {
  const m = montar();
  try {
    const esc = m.caja.querySelector("[data-escaparate]");
    assert.ok(esc.querySelector("svg[data-mascota]"), "la mascota, no un prisma");
    assert.equal(esc.querySelector("svg[data-avatar]"), null, "nada de la figura vieja");
    assert.match(esc.textContent, /Pelusa/);
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
    assert.ok(!/medalla/i.test(tabla.textContent), "las medallas no se prometen todavía");
  } finally { m.desmontar(); }
});

test("con 45 Cristales: unos accesorios se alcanzan y otros dicen cuánto falta", () => {
  const m = montar({ perfil: PERFIL({ cristales_balance: 45 }) });
  try {
    /* gafas 40 · bigote 35 · bufanda 45 · mono 50 · gorro 60 */
    assert.equal(celda(m.caja, "gafas").dataset.estado, "alcanzable");
    assert.equal(celda(m.caja, "gafas").querySelector('[data-comprar-accesorio="gafas"]').disabled, false);
    assert.match(celda(m.caja, "gafas").textContent, /40/);

    assert.equal(celda(m.caja, "bufanda").dataset.estado, "alcanzable", "45 alcanza justo");

    assert.equal(celda(m.caja, "gorro").dataset.estado, "falta");
    assert.equal(celda(m.caja, "gorro").querySelector("[data-faltan]").dataset.faltan, "15", "60 − 45");
    assert.match(celda(m.caja, "gorro").textContent, /te faltan 15/);
    assert.equal(celda(m.caja, "gorro").querySelector('[data-comprar-accesorio="gorro"]').disabled, true);

    assert.equal(celda(m.caja, "mono").querySelector("[data-faltan]").dataset.faltan, "5", "50 − 45");
  } finally { m.desmontar(); }
});

test("un accesorio comprado se ve en teal, sin botón y sin precio", () => {
  const m = montar({ perfil: PERFIL({ mascota_accesorios: ["gafas"], cristales_balance: 10 }) });
  try {
    const g = celda(m.caja, "gafas");
    assert.equal(g.dataset.estado, "comprado");
    assert.match(g.textContent, /Ya es tuyo/);
    assert.equal(g.querySelector('[data-comprar-accesorio="gafas"]'), null);
    assert.equal(g.style.borderColor, rgb(FAE.teal));
    assert.ok(!g.textContent.includes("40"), "un precio ya pagado no se vuelve a enseñar");
  } finally { m.desmontar(); }
});

test("comprar aplica la fila que devuelve la base, sin recargar nada", async () => {
  const pedidos = [];
  const m = montar({
    onComprarAccesorio: async (clave) => {
      pedidos.push(clave);
      return { perfil: PERFIL({ cristales_balance: 35, mascota_accesorios: ["gafas"] }) };
    },
  });
  try {
    await pulsar(m.caja.querySelector('[data-comprar-accesorio="gafas"]'));
    assert.deepEqual(pedidos, ["gafas"]);
    assert.equal(m.aplicados.length, 1);
    assert.equal(m.aplicados[0].cristales_balance, 35);
  } finally { m.desmontar(); }
});

test("si la compra falla, se dice en palabras y en ámbar, nunca en coral", async () => {
  const m = montar({ onComprarAccesorio: async () => ({ error: "No se pudo comprar. Vuelve a mirar tu saldo." }) });
  try {
    await pulsar(m.caja.querySelector('[data-comprar-accesorio="gafas"]'));
    const aviso = m.caja.querySelector("[role='alert']");
    assert.match(aviso.textContent, /No se pudo comprar/);
    assert.equal(aviso.style.color, rgb(FAE.ambar));
    assert.equal(m.aplicados.length, 0);
  } finally { m.desmontar(); }
});

test("CORAL NO APARECE en la Tienda, ni en un borde, ni en un texto, ni en un fondo", () => {
  /*
   * Coral significa error en todo el sitio. Un accesorio que todavía no
   * alcanzas no es un error: es un precio. Las mascotas quedan fuera de la
   * búsqueda (sus colores viven en atributos `fill`, no en `style`, y son parte
   * del dibujo, no un estado de la pantalla).
   */
  const m = montar({ perfil: PERFIL({ cristales_balance: 0 }) });
  try {
    const coral = FAE.coral.toLowerCase();
    const sospechosos = [...m.caja.querySelectorAll("*")].filter((el) => {
      if (el.closest("svg[data-mascota]")) return false;
      if (el.closest("[data-malla-animada]")) return false; // el fondo (manchas de color en movimiento), no un estado
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

test("sin sesión, la Tienda invita a entrar y no enseña saldo ni accesorios", () => {
  const m = montar({ session: null, perfil: null });
  try {
    assert.equal(m.caja.querySelector("[data-saldo]"), null);
    assert.equal(m.caja.querySelector("[data-accesorio]"), null);
    assert.match(m.caja.textContent, /Entra para ver tus Cristales/);
  } finally { m.desmontar(); }
});
