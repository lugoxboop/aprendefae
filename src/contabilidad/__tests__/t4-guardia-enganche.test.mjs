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
 * Con A0, A1 y H1 tal como estaban en main (100e50f), esta prueba salía
 * ROJA. Era a propósito: entra junto con el rediseño de Hanayama y el recorte
 * de Katsumi, y es lo que dice que el rediseño cumple.
 *
 * Con el rediseño, las pantallas de Aprender ya no son elecciones de radio:
 * el estudiante opera la figura. La guardia las juega con el MISMO plan que la
 * sonda de enganche (scripts/t4/sonda-enganche/enganche_planes.json): mide
 * cada error y cada acierto, no solo la llegada, y comprueba el veredicto.
 * Los umbrales no cambian.
 * ═══════════════════════════════════════════════════════════════════════════
 */

const dom = new JSDOM("<!doctype html><html><body></body></html>", { url: "http://localhost/", virtualConsole: new VirtualConsole() });
const w = dom.window;
w.matchMedia = () => ({ matches: false, addEventListener() {}, removeEventListener() {}, addListener() {}, removeListener() {} });
w.requestAnimationFrame = (f) => setTimeout(() => f(performance.now()), 0);
w.cancelAnimationFrame = (id) => clearTimeout(id);
for (const [k, v] of Object.entries({
  window: w, document: w.document, navigator: w.navigator, localStorage: w.localStorage,
  HTMLElement: w.HTMLElement, Element: w.Element, Node: w.Node, SVGElement: w.SVGElement,
  Event: w.Event, MouseEvent: w.MouseEvent, KeyboardEvent: w.KeyboardEvent,
  getComputedStyle: w.getComputedStyle.bind(w), matchMedia: w.matchMedia, requestAnimationFrame: w.requestAnimationFrame,
  cancelAnimationFrame: w.cancelAnimationFrame,
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
const { HACER, SUBJECTS } = await import("../../data/subjects.js");
const { TEMA_T4 } = await import("../../components/ContabilidadT4View.jsx");
/* El rótulo del Panel, el mismo que pinta la vista: cuenta para B1 y B2. */
const ROTULO = `${SUBJECTS.contabilidad.topics.find((x) => x.id === TEMA_T4).title.toUpperCase()} · APRENDER`;
const { readFileSync } = await import("node:fs");
const PLANES = JSON.parse(readFileSync(new URL("../../../scripts/t4/sonda-enganche/enganche_planes.json", import.meta.url), "utf8"));

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

/*
 * B1 y B2 cuentan lo que el estudiante VE en la tarjeta, como la barra del
 * canon («60 palabras por pantalla») y como la sonda de enganche: todo el
 * texto visible del Panel, con su rótulo y su título, los rótulos de la
 * figura, los botones y el pie. Solo queda fuera lo que no se ve: lo oculto
 * (display none, visibility hidden, [hidden]) y lo que es solo para el lector
 * de pantalla. Antes contaba solo el texto suelto (sin figura, botones, pie
 * ni cabecera): con figuras que llevan texto, eso dejaba pasar pantallas que
 * la sonda daba por encima de 60. Contar más no afloja nada: el tope es el
 * mismo.
 */
const oculto = (el, raiz) => {
  for (let x = el; x && x.nodeType === 1; x = x.parentElement) {
    if (x.hidden || x.matches("style, script")) return true;
    const c = w.getComputedStyle(x);
    if (c.display === "none" || c.visibility === "hidden") return true;
    if (x === raiz) break;
  }
  return Boolean(el.closest('[style*="clip"], .t4f-sr, figcaption'));
};
function loQueSeVe(raiz) {
  const trozos = [];
  const recorrer = (n) => {
    if (n.nodeType === 3) {
      const t = n.textContent.replace(/\s+/g, " ").trim();
      const el = n.parentElement;
      if (t && el && !oculto(el, raiz)) trozos.push({ t, el });
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
 * En una elección de radio mira «colocando» y «acierto». En una pantalla con
 * figura operable juega su plan (el de la sonda): cada momento que el plan
 * mide se mira aquí también, y cada veredicto se comprueba. Lo que necesita
 * diseño (arrastrar la pista) lo mide la sonda en Chromium; aquí se salta, y
 * «Pasar el año» hace lo mismo con un toque.
 */
const esperar = (ms) => act(async () => { await new Promise((r) => setTimeout(r, ms)); });
/* E2: a qué se le pidió `scrollIntoView` (el diseño lo mide Chromium; aquí, que se pida, y a la devolución). */
const LLEVADOS = [];
const scrollOriginal = w.Element.prototype.scrollIntoView;
w.Element.prototype.scrollIntoView = function (o) { LLEVADOS.push({ el: this, o }); };
async function recorrerPieza(pieza) {
  const caja = document.createElement("div");
  document.body.appendChild(caja);
  const raiz = createRoot(caja);
  act(() => raiz.render(h(PantallasT4, { pieza, rotulo: ROTULO })));
  const vistas = [];
  try {
    for (const [k, p] of pieza.pantallas.entries()) {
      const zona = caja.querySelector("[data-pieza]");
      assert.equal(zona.dataset.pantalla, p.id, `${pieza.id}: no se llegó a «${p.id}»`);
      vistas.push({ pantalla: `P${k} ${p.id}`, estado: p.tipo === "eleccion" ? "colocando" : "llegada", zona, foto: foto(zona) });
      if (p.tipo === "eleccion") {
        tocar(caja.querySelector(`[data-opcion="${p.opciones.find((o) => o.correcta).id}"]`));
        tocar(caja.querySelector('[data-boton="confirmar"]'));
        vistas.push({ pantalla: `P${k} ${p.id}`, estado: "acierto", zona, foto: foto(zona) });
      }
      for (const paso of PLANES[pieza.id]?.[p.id] ?? []) {
        if (paso.arrastra) continue;
        if (paso.click) {
          const el = zona.querySelector(paso.click);
          assert.ok(el, `${pieza.id} · ${p.id}: el plan toca ${paso.click} y no está`);
          tocar(el);
        }
        await esperar(paso.espera ?? 0);
        if (!paso.mide) continue;
        let e2 = null;
        if (paso.veredicto) {
          const ms = zona.querySelectorAll("[data-mensaje]");
          const m = ms[ms.length - 1];
          assert.equal(m?.dataset.mensaje, paso.veredicto, `${pieza.id} · ${p.id} · ${paso.mide}: el veredicto no es el del plan`);
          e2 = { llevado: LLEVADOS.filter((x) => x.el === m).at(-1)?.o ?? null };
        }
        vistas.push({ pantalla: `P${k} ${p.id}`, estado: paso.mide, zona, foto: foto(zona), e2 });
      }
      const b = caja.querySelector('[data-boton="seguir"], [data-boton="empezar"]');
      if (b && k < pieza.pantallas.length - 1) tocar(b);
    }
  } finally { act(() => raiz.unmount()); caja.remove(); }
  return vistas;
}

/* Lo que se lee de la pantalla en este momento: todo, y lo de antes de la figura. */
function foto(zona) {
  const todo = loQueSeVe(zona.closest("section") ?? zona);
  const figura = zona.querySelector("[data-figura]");
  const antes = figura ? todo.filter(({ el }) => figura.compareDocumentPosition(el) & w.Node.DOCUMENT_POSITION_PRECEDING) : null;
  return {
    palabras: palabras(todo.map((x) => x.t).join(" ")),
    antes: antes ? palabras(antes.map((x) => x.t).join(" ")) : null,
    textos: loQueSeLee(zona, { conFigura: true }).map((x) => x.t),
  };
}

const APRENDER = [];
for (const { pieza } of PIEZAS_T4) APRENDER.push({ pieza, vistas: await recorrerPieza(pieza) });
w.Element.prototype.scrollIntoView = scrollOriginal;

/*
 * E2 (Shibukawa): con cada veredicto, la vista lleva la devolución a la
 * ventana, con `block: "nearest"` (baja lo justo, no la centra). Que quede
 * ENTERA a 320×568 y 375×667 lo mide scripts/t4/guardia-enganche.mjs.
 */
for (const { pieza, vistas } of APRENDER) {
  const conVeredicto = vistas.filter((v) => v.e2);
  if (!conVeredicto.length) continue;
  test(`★★★ E2 · ${pieza.id}: cada devolución se lleva a la ventana al dar el veredicto (${conVeredicto.length})`, () => {
    for (const v of conVeredicto) {
      assert.ok(v.e2.llevado, `${v.pantalla} · ${v.estado}: la devolución no se llevó a la ventana`);
      assert.equal(v.e2.llevado.block, "nearest", `${v.pantalla} · ${v.estado}`);
    }
  });
}

/* Repetidos: el mismo texto (de cuatro palabras o más) dos veces en la misma vista. */
const repetidos = (textos) => {
  const vistos = new Map();
  for (const t of textos.filter((x) => palabras(x) >= 4)) vistos.set(t, (vistos.get(t) ?? 0) + 1);
  return [...vistos].filter(([, n]) => n > 1).map(([t]) => t);
};

for (const { pieza, vistas } of APRENDER) {
  test(`★★★ B2 · ${pieza.id}: ninguna pantalla pasa de ${B2_PALABRAS} palabras`, (t) => {
    t.diagnostic(vistas.map((v) => `${v.pantalla} (${v.estado}): ${v.foto.palabras} · ${v.foto.antes} antes`).join(" | "));
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
 * pintado (acertado, o «era esta» / «Iba aquí» si se falló). Se juega cada
 * partida con un solo ítem —el primero del banco que se responde con ese
 * destino— y se acierta, y aparte se falla para ver el «era esta». Ni el
 * destino ni su marcador pueden llevar teal o ámbar. Hoy H1 es el único juego
 * así: sus destinos dicen «Al debe de Caja» / «Al haber de Caja».
 *
 * Dos formas de destino, y las dos se miran:
 *   · la de radio (Opcion compartida): `[data-opcion=id] button`, con estilos
 *     en línea
 *   · la del cajón (H1 rediseñado): `[data-destino=id]`, con estilos de hoja.
 *     Se mira el estilo CALCULADO (color, bordes, fondo, sombra, contorno,
 *     fill y stroke) del destino y de todo lo que lleva dentro. Lo único que
 *     puede ir en teal o ámbar es el rótulo de la columna, «DEBE» o «HABER»,
 *     que es su significado y ya estaba así antes de responder: por eso se
 *     compara cada elemento con el mismo elemento antes del toque. El
 *     veredicto no puede AÑADIR teal ni ámbar en ninguna parte del destino, y
 *     el borde y el fondo del destino mismo no pueden llevarlos nunca.
 *
 * Los ítems del banco salen de los datos de cada juego: el módulo que la vista
 * importa para él (por su id).
 */
const DEBE_HABER = /\b(debe|haber)\b/i;
const Marco = ({ children }) => h("div", null, children);
const DATOS = { "t4-entra-o-sale-de-caja": async () => { const D = await import("../../data/contabilidadT4H1.js"); return { items: D.ITEMS_H1, destinos: D.DESTINOS_H1, espera: D.ESPERA_ERROR_H1_MS }; } };

const PROPS = ["color", "border-top-color", "border-right-color", "border-bottom-color", "border-left-color", "background-color", "background", "box-shadow", "outline-color", "fill", "stroke"];
/* Los tonos teal/ámbar de un elemento: estilo en línea, atributos fill/stroke y estilo calculado. */
function tonos(el) {
  const c = w.getComputedStyle(el);
  const txt = [el.getAttribute("style") ?? "", el.getAttribute("fill") ?? "", el.getAttribute("stroke") ?? "", ...PROPS.map((k) => c.getPropertyValue(k))].join(" ");
  return [...new Set((txt.match(new RegExp(TEAL_AMBAR.source, "gi")) ?? []).map((x) => x.toLowerCase()))];
}
const camino = (raiz, el) => { const p = []; for (let x = el; x && x !== raiz; x = x.parentElement) p.unshift([...x.parentElement.children].indexOf(x)); return p.join(">"); };
const fotoTonos = (raiz) => new Map([raiz, ...raiz.querySelectorAll("*")].map((e) => [camino(raiz, e), { el: e, tonos: tonos(e) }]));

for (const { id, Mecanica } of JUEGOS_T4) {
  test(`★★★ B4 · ${id}: si los destinos son debe/haber, el acierto no se pinta en teal ni en ámbar`, async (t) => {
    const datos = DATOS[id] ? await DATOS[id]() : null;
    if (!datos) {
      /* Un juego sin destinos debe/haber no entra; uno que los tenga y no esté en DATOS, sí: rojo. */
      const m = await montarJuego(id);
      try {
        const con = [...m.caja.querySelectorAll("[data-partida] [data-opcion], [data-partida] [data-destino]")]
          .filter((o) => DEBE_HABER.test(`${o.textContent} ${o.getAttribute("aria-label") ?? ""}`));
        assert.equal(con.length, 0, `${id} tiene destinos de debe/haber: súmalo a DATOS de esta prueba`);
      } finally { m.desmontar(); }
      t.diagnostic("sin destinos de debe/haber");
      return;
    }
    const fallan = [];
    let mirados = 0;
    for (const d of datos.destinos.filter((x) => DEBE_HABER.test(x.nombre))) {
      const item = datos.items.find((x) => x.respuesta === d.id);
      for (const modo of ["acierta", "falla"]) {
        const caja = document.createElement("div");
        document.body.appendChild(caja);
        const raiz = createRoot(caja);
        await act(async () => { raiz.render(h(Mecanica, { Marco, items: [item], onCompletar: () => {} })); });
        try {
          const elegir = modo === "acierta" ? d.id : datos.destinos.find((x) => x.id !== d.id).id;
          const destino = (x) => caja.querySelector(`[data-destino="${x}"]`) ?? caja.querySelector(`[data-opcion="${x}"] button`);
          assert.ok(destino(elegir), `${id}: no encontré el destino «${elegir}»`);
          const antes = fotoTonos(destino(d.id));
          await act(async () => { destino(elegir).dispatchEvent(new w.MouseEvent("click", { bubbles: true })); });
          if (modo === "falla") await esperar((datos.espera ?? 0) + 100);
          const correcto = destino(d.id);
          const marca = modo === "acierta" ? "bien" : "era";
          if (correcto.hasAttribute("data-destino")) assert.equal(correcto.dataset.marca, marca, `${id}: «${d.nombre}» (${modo}) no quedó marcado como «${marca}»`);
          mirados += 1;
          const propio = tonos(correcto).filter(() => correcto.hasAttribute("data-destino"));
          if (propio.length) fallan.push(`«${d.nombre}» (${modo === "acierta" ? "acertado" : "era esta"}): el destino lleva ${propio.join(", ")}`);
          for (const [k, { el, tonos: ahora }] of fotoTonos(correcto)) {
            if (el === correcto && correcto.hasAttribute("data-destino")) continue;
            const nuevos = ahora.filter((x) => !(antes.get(k)?.tonos ?? []).includes(x));
            /* Con estilos en línea (Opcion), cualquier teal o ámbar dentro del destino cuenta, como antes. */
            const malos = correcto.hasAttribute("data-destino") ? nuevos : ahora;
            if (malos.length) fallan.push(`«${d.nombre}» (${modo === "acierta" ? "acertado" : "era esta"}) lleva ${malos.join(", ")} en «${(el.textContent ?? "").trim().slice(0, 30)}»`);
          }
        } finally { act(() => raiz.unmount()); caja.remove(); }
      }
    }
    assert.ok(mirados >= 4, "la prueba no miró los cuatro casos (debe y haber, acertado y era esta)");
    /*
     * Si falla con la forma de radio, el color viene del componente compartido
     * Opcion (su borde, su fondo y el Marcador de corazon/juego.jsx). No lo
     * toca la Célula D: es de Erwin.
     */
    assert.deepEqual(fallan, [], `${Mecanica.name}: el acierto se pinta con el color de debe o de haber`);
  });
}
