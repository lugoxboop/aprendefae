import { test } from "node:test";
import assert from "node:assert/strict";
import { JSDOM, VirtualConsole } from "jsdom";

/*
 * ═══════════════════════════════════════════════════════════════════════════
 * LA DECORACIÓN DEL CAMINO NO MOLESTA, Y NO SE INVENTA FIGURAS.
 *
 * Dos cosas se guardan aquí y las dos nacieron de un error real:
 *
 *   · QUE NO MOLESTE. Un adorno que se puede pulsar, que un lector de
 *     pantalla lee, que tapa un nodo o que provoca barra horizontal a 320 px
 *     ha dejado de ser adorno y es un fallo.
 *
 *   · QUE SALGA DEL CATÁLOGO. La primera versión de esta capa traía figuras
 *     dibujadas a mano y una mascota nueva, sin saber que las once piezas y
 *     Fae ya estaban dibujadas y reservadas por Hanayama. Dos tetraedros
 *     distintos en el mismo sitio es justo lo que la reserva evita, así que
 *     la prueba exige que cada figura venga de PIEZAS o de FAE_POSES.
 *
 * Que el RECORRIDO siga igual que antes de la decoración lo guarda
 * `camino-sin-cambios`, que pesa el HTML con esta capa recortada.
 * ═══════════════════════════════════════════════════════════════════════════
 */

const dom = new JSDOM("<!doctype html><html><body></body></html>", { url: "http://localhost/", virtualConsole: new VirtualConsole() });
const w = dom.window;
const Observador = class { observe() {} unobserve() {} disconnect() {} };
w.matchMedia = () => ({ matches: false, addEventListener() {}, removeEventListener() {}, addListener() {}, removeListener() {} });
for (const [k, v] of Object.entries({
  window: w, document: w.document, navigator: w.navigator, localStorage: w.localStorage,
  HTMLElement: w.HTMLElement, Element: w.Element, Node: w.Node, SVGElement: w.SVGElement,
  Event: w.Event, MouseEvent: w.MouseEvent, KeyboardEvent: w.KeyboardEvent,
  getComputedStyle: w.getComputedStyle.bind(w), matchMedia: w.matchMedia,
  ResizeObserver: Observador, IntersectionObserver: Observador,
  requestAnimationFrame: (cb) => setTimeout(() => cb(0), 0), cancelAnimationFrame: (id) => clearTimeout(id),
})) {
  Object.defineProperty(globalThis, k, { value: v, configurable: true, writable: true });
}
globalThis.CSS = { escape: (v) => String(v).replace(/[^a-zA-Z0-9_-]/g, (c) => `\\${c}`) };
w.CSS = globalThis.CSS;
globalThis.IS_REACT_ACT_ENVIRONMENT = true;

const React = await import("react");
const { createRoot } = await import("react-dom/client");
const act = React.act;
const h = React.createElement;

const { default: DecoracionCamino, CSS: CSS_DECORACION } = await import("../DecoracionCamino.jsx");
const { default: CaminoHacer } = await import("../CaminoHacer.jsx");
const { PIEZAS, FAE_POSES, TRAZO } = await import("../../decoracion/piezas.jsx");

const NODOS = [
  { id: "a1", nombre: "Primera", completada: true },
  { id: "a2", nombre: "Segunda", completada: false },
  { id: "a3", nombre: "Tercera", completada: false },
];

async function montar(elemento) {
  const caja = document.createElement("div");
  document.body.appendChild(caja);
  const raiz = createRoot(caja);
  await act(async () => { raiz.render(elemento); });
  return { caja, desmontar: () => { act(() => raiz.unmount()); caja.remove(); } };
}

/* Las `d` de todas las piezas publicadas, para comprobar que no hay ninguna de fuera. */
const PERMITIDAS = new Set(
  [...Object.values(PIEZAS), ...Object.values(FAE_POSES)]
    .flatMap((p) => p.elementos.map(([etiqueta, a]) => `${etiqueta}:${JSON.stringify(a)}`)),
);

test("★★★ cada figura sale del catálogo reservado, ninguna está dibujada aquí", async () => {
  for (const tema of ["contabilidad", "macroeconomia", "pensamiento-estrategico", null]) {
    const m = await montar(h(DecoracionCamino, { tema }));
    try {
      const dibujos = [...m.caja.querySelectorAll(".fae-dc svg")];
      assert.ok(dibujos.length >= 6, `${tema}: hay decoración (${dibujos.length} figuras)`);
      for (const svg of dibujos) {
        assert.equal(svg.getAttribute("viewBox"), "0 0 40 40", "lienzo de la familia (§5.1)");
        for (const el of svg.children) {
          const attrs = {};
          for (const a of el.attributes) attrs[a.name] = /^[\d.-]+$/.test(a.value) ? Number(a.value) : a.value;
          const firma = `${el.tagName}:${JSON.stringify(attrs)}`;
          assert.ok(
            PERMITIDAS.has(firma),
            `figura de fuera del catálogo en ${tema}: ${firma.slice(0, 90)}. Se reserva en zonas-hanayama.md antes de dibujar`,
          );
        }
      }
    } finally { m.desmontar(); }
  }
});

test("★★★ una sola transparencia, y en el trazo", async () => {
  const m = await montar(h(DecoracionCamino, { tema: "contabilidad" }));
  try {
    for (const svg of m.caja.querySelectorAll(".fae-dc-p svg")) {
      const trazo = parseFloat(svg.getAttribute("stroke-opacity"));
      assert.ok(trazo > 0 && trazo <= 0.32, `trazo a ${trazo}; detrás del recorrido no puede competir con un nodo`);
      assert.ok(trazo < TRAZO.opacidad, "más tenue que en la banda de una tabla, que es terreno vacío");
      assert.equal(svg.style.opacity, "", "la opacidad del grupo compondría dos transparencias (§5.1)");
      assert.equal(svg.getAttribute("stroke"), TRAZO.color, "el color de la familia, sin excepciones");
    }
  } finally { m.desmontar(); }
});

test("★★★ no se puede tocar ni se oye", async () => {
  const m = await montar(h(DecoracionCamino, { tema: "contabilidad" }));
  try {
    const capa = m.caja.querySelector(".fae-dc");
    assert.equal(capa.getAttribute("aria-hidden"), "true");
    assert.equal(capa.style.pointerEvents, "none");
    assert.equal(m.caja.querySelectorAll("button, a, input, [tabindex], [role=button]").length, 0);
    for (const svg of capa.querySelectorAll("svg")) {
      assert.equal(svg.getAttribute("aria-hidden"), "true");
      assert.equal(svg.getAttribute("focusable"), "false");
    }
  } finally { m.desmontar(); }
});

test("★★★ se queda dentro de su caja: ni una figura provoca barra horizontal", async () => {
  const m = await montar(h(DecoracionCamino, { tema: "macroeconomia" }));
  try {
    const capa = m.caja.querySelector(".fae-dc");
    assert.equal(capa.style.overflow, "hidden");
    assert.equal(capa.style.position, "absolute");
    for (const f of capa.querySelectorAll(".fae-dc-p")) {
      const izq = parseFloat(f.style.left);
      const arr = parseFloat(f.style.top);
      assert.ok(izq >= 0 && izq <= 92, `una figura empieza en ${izq}% de ancho`);
      /* La franja de abajo es de Fae, que puede caer a cualquiera de los dos lados. */
      assert.ok(arr >= 0 && arr <= 88, `una figura empieza en ${arr}% de alto; por debajo del 88 se le monta a Fae`);
      const lado = parseFloat(f.style.width);
      assert.ok(lado >= 28 && lado <= 44, `la familia manda de 28 a 44 px; esta mide ${lado}`);
    }
  } finally { m.desmontar(); }
});

test("★★★ el bucle se para fuera de pantalla, con la pestaña oculta y con movimiento reducido", async () => {
  /*
   * La §5.0 del estándar reserva el bucle al leaderboard; aquí lo hay por
   * orden de Mateo del 27-oct. Lo que esa orden NO relaja son las cuatro
   * condiciones: una animación que corre sin que nadie la vea es batería.
   */
  assert.match(CSS_DECORACION, /\[data-pausa\][^}]*animation-play-state: paused/, "hay pausa");
  const reducido = CSS_DECORACION.slice(CSS_DECORACION.indexOf("prefers-reduced-motion"));
  assert.match(reducido, /animation: none/, "con movimiento reducido se para, no se ralentiza");
  assert.ok(!/animation-duration/.test(reducido), "no se le baja el volumen: se quita");
  assert.match(CSS_DECORACION, /\[data-bucle\]/, "el bucle depende de un atributo, no es incondicional");
  assert.ok(!/will-change/.test(CSS_DECORACION), "sin will-change, como la banda");
});

test("★★★ Fae está al final del camino, quieta y sin codificar nada", async () => {
  const m = await montar(h(CaminoHacer, { nodos: NODOS, onAbrir() {}, tema: "contabilidad" }));
  try {
    const capa = m.caja.querySelector(".fae-dc");
    const sitio = [...capa.children].find((e) => e.tagName === "DIV" && e.style.bottom);
    assert.ok(sitio, "Fae se ancla abajo, en el aire que el camino ya reserva");
    const svg = sitio.querySelector("svg");
    assert.ok(svg, "y está dibujada");
    /* §5.2: Fae no tiene bucle. No lleva la clase que anima. */
    assert.ok(!sitio.classList.contains("fae-dc-p"), "Fae no flota: §5.2 dice que entra una vez y se queda");
    assert.equal(svg.getAttribute("aria-hidden"), "true");
  } finally { m.desmontar(); }
});

test("★★★ se puede quitar a Fae sin tocar el resto", async () => {
  const con = await montar(h(DecoracionCamino, { tema: "contabilidad" }));
  const nCon = con.caja.querySelectorAll(".fae-dc-p").length;
  con.desmontar();
  const sin = await montar(h(DecoracionCamino, { tema: "contabilidad", fae: false }));
  try {
    assert.equal(sin.caja.querySelectorAll(".fae-dc-p").length, nCon, "las figuras siguen todas");
    assert.equal(sin.caja.querySelectorAll(".fae-dc svg").length, nCon, "y ya no está Fae");
    assert.equal(sin.caja.querySelectorAll('[style*="bottom"]').length, 0, "ni su sitio");
  } finally { sin.desmontar(); }
});

test("★★★ cada materia trae lo suyo y nada de la otra", async () => {
  const cuenta = async (tema) => {
    const m = await montar(h(DecoracionCamino, { tema }));
    const n = m.caja.querySelectorAll(".fae-dc-p").length;
    m.desmontar();
    return n;
  };
  const pelado = await cuenta(null);
  for (const tema of ["contabilidad", "macroeconomia", "pensamiento-estrategico"]) {
    assert.equal(await cuenta(tema), pelado + 2, `${tema} añade exactamente dos piezas suyas`);
  }
  assert.ok(pelado >= 6, "sin tema sigue habiendo decoración: una vista nueva no se ve desnuda");
});

test("★★★ es determinista: dos pintados dan exactamente lo mismo", async () => {
  const a = await montar(h(DecoracionCamino, { tema: "contabilidad" }));
  const uno = a.caja.innerHTML;
  a.desmontar();
  const b = await montar(h(DecoracionCamino, { tema: "contabilidad" }));
  const dos = b.caja.innerHTML;
  b.desmontar();
  assert.equal(uno, dos, "sin sorteos: la foto del camino depende de que esto no cambie");
});

test("★★★ dentro del camino va DETRÁS del recorrido", async () => {
  const m = await montar(h(CaminoHacer, { nodos: NODOS, onAbrir() {}, tema: "contabilidad" }));
  try {
    const capa = m.caja.querySelector(".fae-dc");
    assert.equal(capa.style.zIndex, "0");
    const lienzo = capa.parentElement.querySelector(":scope > svg");
    assert.equal(lienzo.style.zIndex, "1", "el recorrido va por encima del adorno");
    assert.equal(lienzo.style.position, "relative");
    assert.ok(capa.compareDocumentPosition(lienzo) & Node.DOCUMENT_POSITION_FOLLOWING);
  } finally { m.desmontar(); }
});

test("★★★ Fae va al trazo de la familia, no al del fondo", async () => {
  const m = await montar(h(DecoracionCamino, { tema: "contabilidad" }));
  try {
    const sitio = [...m.caja.querySelector(".fae-dc").children].find((e) => e.tagName === "DIV" && e.style.bottom);
    const svg = sitio.querySelector("svg");
    assert.equal(
      parseFloat(svg.getAttribute("stroke-opacity")), TRAZO.opacidad,
      "Fae no está detrás del recorrido: está en el aire del final y es el personaje de la casa",
    );
  } finally { m.desmontar(); }
});

/* ── la entrada del camino ── */

test("★★★ el camino se traza al entrar, y con movimiento reducido no", async () => {
  /*
   * Mateo, 28-oct: «que al entrar al camino sea una animación elegante». Se
   * anima el BORDE INFERIOR del recorte del contenedor, así que el recorrido
   * se revela de arriba abajo y el orden sale de la geometría, sin
   * coreografiar nodo por nodo. Eso importa porque el camino se pinta de
   * cuatro maneras —normal y por bloques, ancha y estrecha— y una cascada por
   * nodo habría que escribirla cuatro veces.
   */
  const { CSS_ENTRADA } = await import("../CaminoHacer.jsx");
  const m = await montar(h(CaminoHacer, { nodos: NODOS, onAbrir() {} }));
  try {
    assert.ok(m.caja.querySelector(".fae-ch-entra"), "el contenedor del camino entra");
    assert.match(CSS_ENTRADA, /clip-path: inset\(0 0 100% 0\)/, "empieza recortado del todo");
    assert.match(CSS_ENTRADA, /clip-path: inset\(0 0 -60% 0\)/, "y acaba con holgura, sin cortar lo que asoma");
    const reducido = CSS_ENTRADA.slice(CSS_ENTRADA.indexOf("prefers-reduced-motion"));
    assert.match(reducido, /animation: none/, "con movimiento reducido no hay recorte ninguno");
    assert.ok(!/animation-duration/.test(reducido), "se quita, no se ralentiza");
  } finally { m.desmontar(); }
});
