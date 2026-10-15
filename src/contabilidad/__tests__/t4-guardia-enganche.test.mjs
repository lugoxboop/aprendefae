import { test } from "node:test";
import assert from "node:assert/strict";
import { JSDOM, VirtualConsole } from "jsdom";

/*
 * ═══════════════════════════════════════════════════════════════════════════
 * T4 · LA GUARDIA DE ENGANCHE (Célula D) — la barra nueva de Mateo.
 *
 * Fuente: celula-d/autodiagnostico-calidad.md (Yujiro, 15 oct 2026). Las
 * sondas de antes medían «cabe»; estas miden «engancha». Recorren TODO lo
 * que hay en PIEZAS_T4 y JUEGOS_T4, así que una pieza nueva entra sola:
 *
 *   · B1 · figura primero (la parte de texto): antes de la figura de una
 *     pantalla, como mucho 40 palabras. La parte de posición (la figura en
 *     los primeros 280 px a 320) necesita un navegador: la mide
 *     scripts/t4/guardia-enganche.mjs, con Chromium
 *   · B2 · presupuesto: en Aprender, como mucho 60 palabras por pantalla
 *   · B4 · en un Hacer de debe/haber, el acierto no lleva teal ni ámbar
 *     (son debe y haber). Se mira el estilo del destino acertado y de su
 *     marcador
 *   · B5 · ningún texto aparece dos veces en la misma pantalla, contando el
 *     «Así se juega» montado encima de la partida
 *
 * Se cuenta lo que el estudiante LEE: el texto visible de la pantalla, sin
 * los botones, el rótulo del panel, el pie de página, lo que solo oye el
 * lector de pantalla y lo que va dentro de la figura (eso es dibujo). Las
 * cifras cuentan como palabras.
 *
 * Con A0, A1 y H1 tal como están en main, esta prueba sale ROJA. Es a
 * propósito: entra junto con el rediseño de Hanayama y el recorte de
 * Katsumi, y es lo que dice que el rediseño cumple.
 * ═══════════════════════════════════════════════════════════════════════════
 */

const dom = new JSDOM("<!doctype html><html><body></body></html>", { url: "http://localhost/", virtualConsole: new VirtualConsole() });
const w = dom.window;
w.matchMedia = () => ({ matches: false, addEventListener() {}, removeEventListener() {}, addListener() {}, removeListener() {} });
w.requestAnimationFrame = (f) => setTimeout(f, 0);
for (const [k, v] of Object.entries({
  window: w, document: w.document, navigator: w.navigator, localStorage: w.localStorage,
  HTMLElement: w.HTMLElement, Element: w.Element, Node: w.Node, SVGElement: w.SVGElement,
  Event: w.Event, MouseEvent: w.MouseEvent, KeyboardEvent: w.KeyboardEvent,
  getComputedStyle: w.getComputedStyle.bind(w), matchMedia: w.matchMedia, requestAnimationFrame: w.requestAnimationFrame,
})) {
  Object.defineProperty(globalThis, k, { value: v, configurable: true, writable: true });
}
globalThis.IS_REACT_ACT_ENVIRONMENT = true;

const React = await import("react");
const { createRoot } = await import("react-dom/client");
const act = React.act;
const h = React.createElement;

const { default: ContabilidadT4View, PantallasT4, PIEZAS_T4, JUEGOS_T4 } = await import("../../components/ContabilidadT4View.jsx");
const { AuthContext } = await import("../../auth/AuthProvider.jsx");
const { HACER } = await import("../../data/subjects.js");

/* ═══════════ LAS REGLAS, COMO NÚMEROS ═══════════ */

export const B1_PALABRAS_ANTES = 40;
export const B2_PALABRAS = 60;
/* Teal y ámbar de Contabilidad: debe y haber (theme.js y vocabulario/contabilidad.md). */
const TEAL_AMBAR = /#2a9d8f|#e9c46a|#2fa8a0|rgb\(42,\s*157,\s*143\)|rgb\(233,\s*196,\s*106\)|rgb\(47,\s*168,\s*160\)|rgba\(42,\s*157,\s*143|rgba\(233,\s*196,\s*106/i;

/* Una palabra: letras o cifras seguidas, con su puntuación interna (2.435.600, «–»). */
export const palabras = (t) => (t.match(/[\p{L}\p{N}$][\p{L}\p{N}.,$%’'-]*/gu) ?? []).length;

/*
 * Lo que el estudiante lee: los nodos de texto visibles, fuera de botones, del
 * rótulo del panel, del pie, de la figura y de lo que solo oye el lector de
 * pantalla. Devuelve los trozos en orden, cada uno con su elemento.
 */
const esLector = (el) => Boolean(el.closest('[style*="clip"], .t4f-sr, figcaption, [aria-hidden="true"]'));
function loQueSeLee(raiz, { conFigura = false } = {}) {
  const trozos = [];
  const recorrer = (n) => {
    if (n.nodeType === 3) {
      const t = n.textContent.replace(/\s+/g, " ").trim();
      const el = n.parentElement;
      if (!t || !el) return;
      if (el.closest("button, header, style, [data-pie], [data-pie-cierre], [hidden]") || esLector(el)) return;
      if (!conFigura && el.closest("[data-figura]")) return;
      trozos.push({ t, el });
      return;
    }
    for (const c of n.childNodes) recorrer(c);
  };
  recorrer(raiz);
  return trozos;
}

/* ═══════════ APRENDER: CADA PANTALLA DE CADA PIEZA ═══════════ */

const tocar = (el) => act(() => { el.dispatchEvent(new w.MouseEvent("click", { bubbles: true })); });

/*
 * Recorre una pieza entera y devuelve, por pantalla y estado, lo que se lee.
 * En una elección mira «colocando» y «acierto» (lo que sale con el acierto
 * también se lee).
 */
function recorrerPieza(pieza) {
  const caja = document.createElement("div");
  document.body.appendChild(caja);
  const raiz = createRoot(caja);
  act(() => raiz.render(h(PantallasT4, { pieza, rotulo: "T4 · APRENDER" })));
  const vistas = [];
  try {
    for (const [k, p] of pieza.pantallas.entries()) {
      const zona = caja.querySelector("[data-pieza]");
      assert.equal(zona.dataset.pantalla, p.id, `${pieza.id}: no se llegó a «${p.id}»`);
      vistas.push({ pantalla: `P${k} ${p.id}`, estado: p.tipo === "eleccion" ? "colocando" : "lectura", zona, foto: foto(zona) });
      if (p.tipo === "eleccion") {
        tocar(caja.querySelector(`[data-opcion="${p.opciones.find((o) => o.correcta).id}"]`));
        tocar(caja.querySelector('[data-boton="confirmar"]'));
        vistas.push({ pantalla: `P${k} ${p.id}`, estado: "acierto", zona, foto: foto(zona) });
      }
      const b = caja.querySelector('[data-boton="seguir"], [data-boton="empezar"]');
      if (b && k < pieza.pantallas.length - 1) tocar(b);
    }
  } finally { act(() => raiz.unmount()); caja.remove(); }
  return vistas;
}

/* Lo que se lee de la pantalla en este momento: todo, y lo de antes de la figura. */
function foto(zona) {
  const todo = loQueSeLee(zona);
  const figura = zona.querySelector("[data-figura]");
  const antes = figura ? todo.filter(({ el }) => figura.compareDocumentPosition(el) & w.Node.DOCUMENT_POSITION_PRECEDING) : null;
  return {
    palabras: palabras(todo.map((x) => x.t).join(" ")),
    antes: antes ? palabras(antes.map((x) => x.t).join(" ")) : null,
    textos: loQueSeLee(zona, { conFigura: true }).map((x) => x.t),
  };
}

const APRENDER = PIEZAS_T4.map(({ pieza }) => ({ pieza, vistas: recorrerPieza(pieza) }));

/* Repetidos: el mismo texto (de cuatro palabras o más) dos veces en la misma vista. */
const repetidos = (textos) => {
  const vistos = new Map();
  for (const t of textos.filter((x) => palabras(x) >= 4)) vistos.set(t, (vistos.get(t) ?? 0) + 1);
  return [...vistos].filter(([, n]) => n > 1).map(([t]) => t);
};

for (const { pieza, vistas } of APRENDER) {
  test(`★★★ B2 · ${pieza.id}: ninguna pantalla pasa de ${B2_PALABRAS} palabras`, () => {
    const fallan = vistas.filter((v) => v.foto.palabras > B2_PALABRAS).map((v) => `${v.pantalla} (${v.estado}): ${v.foto.palabras}`);
    assert.deepEqual(fallan, [], `pantallas por encima de ${B2_PALABRAS} palabras`);
  });

  test(`★★★ B1 · ${pieza.id}: antes de la figura, como mucho ${B1_PALABRAS_ANTES} palabras`, () => {
    const conFigura = vistas.filter((v) => v.foto.antes !== null);
    if (pieza.pantallas.some((p) => p.figura)) assert.ok(conFigura.length > 0, "la pieza tiene figura, pero la prueba no la encontró en el DOM");
    const fallan = conFigura.filter((v) => v.foto.antes > B1_PALABRAS_ANTES).map((v) => `${v.pantalla} (${v.estado}): ${v.foto.antes} antes de la figura`);
    assert.deepEqual(fallan, [], `pantallas con más de ${B1_PALABRAS_ANTES} palabras antes de la figura`);
  });

  test(`★★★ B5 · ${pieza.id}: ningún texto aparece dos veces en la misma pantalla`, () => {
    const fallan = vistas.flatMap((v) => repetidos(v.foto.textos).map((t) => `${v.pantalla} (${v.estado}): «${t.slice(0, 60)}»`));
    assert.deepEqual(fallan, []);
  });
}

/* ═══════════ HACER: CADA JUEGO, CON SU «ASÍ SE JUEGA» ENCIMA ═══════════ */

async function montarJuego(id) {
  try { globalThis.localStorage.clear(); } catch { /* sin almacenamiento, sale igual */ }
  const caja = document.createElement("div");
  document.body.appendChild(caja);
  const raiz = createRoot(caja);
  await act(async () => {
    raiz.render(h(AuthContext.Provider, { value: { usuario: null, pedirCuenta: () => {} } },
      h(ContabilidadT4View, { modo: HACER, nodoInicial: id, onBack: () => {} })));
  });
  return { caja, desmontar: () => { act(() => raiz.unmount()); caja.remove(); } };
}

for (const { id } of JUEGOS_T4) {
  test(`★★★ B5 · ${id}: con el «Así se juega» abierto, ningún texto aparece dos veces en la pantalla`, async () => {
    const m = await montarJuego(id);
    try {
      const pantalla = m.caja.querySelector("[data-asj-demo]")?.closest("section")?.parentElement ?? m.caja;
      assert.ok(m.caja.querySelector("[data-asj-demo]"), "no salió el «Así se juega»: la prueba no está mirando el caso");
      const textos = loQueSeLee(pantalla, { conFigura: true }).map((x) => x.t);
      assert.deepEqual(repetidos(textos).map((t) => `«${t.slice(0, 70)}»`), []);
    } finally { m.desmontar(); }
  });
}

/*
 * B4: en los Hacer cuyos destinos son debe/haber, el destino correcto queda
 * pintado (acertado, o «era esta» si se falló). Se juega cada partida con un
 * solo ítem —el primero del banco que se responde con ese destino— y se
 * acierta, y aparte se falla para ver el «era esta». Ni el botón ni su
 * marcador pueden llevar teal o ámbar. Hoy H1 es el único juego así: sus
 * destinos dicen «Debe de Caja» / «Haber de Caja».
 *
 * Los ítems del banco salen de los datos de cada juego: el módulo que la vista
 * importa para él (por su id).
 */
const DEBE_HABER = /\b(debe|haber)\b/i;
const Marco = ({ children }) => h("div", null, children);
const DATOS = { "t4-entra-o-sale-de-caja": async () => { const D = await import("../../data/contabilidadT4H1.js"); return { items: D.ITEMS_H1, destinos: D.DESTINOS_H1 }; } };

for (const { id, Mecanica } of JUEGOS_T4) {
  test(`★★★ B4 · ${id}: si los destinos son debe/haber, el acierto no se pinta en teal ni en ámbar`, async (t) => {
    const datos = DATOS[id] ? await DATOS[id]() : null;
    if (!datos) {
      /* Un juego sin destinos debe/haber no entra; uno que los tenga y no esté en DATOS, sí: rojo. */
      const m = await montarJuego(id);
      try {
        const con = [...m.caja.querySelectorAll("[data-partida] [data-opcion]")].filter((o) => DEBE_HABER.test(o.textContent));
        assert.equal(con.length, 0, `${id} tiene destinos de debe/haber: súmalo a DATOS de esta prueba`);
      } finally { m.desmontar(); }
      t.diagnostic("sin destinos de debe/haber");
      return;
    }
    const fallan = [];
    for (const d of datos.destinos.filter((x) => DEBE_HABER.test(x.nombre))) {
      const item = datos.items.find((x) => x.respuesta === d.id);
      for (const modo of ["acierta", "falla"]) {
        const caja = document.createElement("div");
        document.body.appendChild(caja);
        const raiz = createRoot(caja);
        await act(async () => { raiz.render(h(Mecanica, { Marco, items: [item], onCompletar: () => {} })); });
        try {
          const elegir = modo === "acierta" ? d.id : datos.destinos.find((x) => x.id !== d.id).id;
          const b = caja.querySelector(`[data-opcion="${elegir}"] button`);
          await act(async () => { b.dispatchEvent(new w.MouseEvent("click", { bubbles: true })); });
          const correcto = caja.querySelector(`[data-opcion="${d.id}"] button`);
          const estilos = [correcto, ...correcto.querySelectorAll("*")].map((x) => `${x.getAttribute("style") ?? ""} ${x.getAttribute("fill") ?? ""} ${x.getAttribute("stroke") ?? ""}`).join(" ");
          const color = estilos.match(TEAL_AMBAR);
          if (color) fallan.push(`«${d.nombre}» (${modo === "acierta" ? "acertado" : "era esta"}) lleva ${color[0]}`);
        } finally { act(() => raiz.unmount()); caja.remove(); }
      }
    }
    /*
     * Si falla, el color viene del componente compartido Opcion (su borde, su
     * fondo y el Marcador de corazon/juego.jsx). No lo toca la Célula D: es
     * de Erwin.
     */
    assert.deepEqual(fallan, [], `${Mecanica.name}: el acierto se pinta con el color de debe o de haber (viene de Opcion, compartido)`);
  });
}
