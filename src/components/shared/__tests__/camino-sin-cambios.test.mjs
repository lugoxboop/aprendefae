import { test } from "node:test";
import assert from "node:assert/strict";
import { createHash } from "node:crypto";
import { readFileSync, writeFileSync } from "node:fs";
import { JSDOM, VirtualConsole } from "jsdom";

/*
 * ═══════════════════════════════════════════════════════════════════════════
 * EL CAMINO DE MACRO Y DE PENSAMIENTO ESTRATÉGICO NO CAMBIA.
 *
 * Los íconos de Contabilidad entraron en el camino compartido (CaminoHacer).
 * Esta prueba monta el camino de cada tema de las otras dos materias, en
 * todas sus variantes —por bloques o no, con desafío o sin él, con distintas
 * actividades hechas—, abre la ventana previa de cada nodo, y compara el
 * HTML con la foto tomada del código de main ANTES del cambio
 * (camino-sin-cambios.foto.json). Un solo carácter distinto la hace fallar.
 *
 * Para rehacer la foto contra otro CaminoHacer (solo si el cambio es a
 * propósito): CAMINO_MODULO=<ruta absoluta> FOTO=escribir node --test …
 *
 * La foto NO se ha rehecho nunca desde que se tomó de main. Lo que entra
 * encima del camino —la decoración, Fae, la entrada— se RECORTA antes de
 * pesar en vez de rehacerse, y por eso las 42 huellas siguen siendo la
 * prueba de que el recorrido no se ha movido. Rehacer la foto es cómodo y
 * borra justo esa prueba: hacerlo solo cuando el recorrido cambie de verdad.
 * ═══════════════════════════════════════════════════════════════════════════
 */

const dom = new JSDOM("<!doctype html><html><body></body></html>", { url: "http://localhost/", virtualConsole: new VirtualConsole() });
const w = dom.window;
const Observador = class { observe() {} unobserve() {} disconnect() {} };
w.matchMedia = () => ({ matches: true, addEventListener() {}, removeEventListener() {}, addListener() {}, removeListener() {} });
w.ResizeObserver = Observador;
w.IntersectionObserver = Observador;
w.Element.prototype.scrollIntoView = () => {};
w.scrollTo = () => {};
w.requestAnimationFrame = (cb) => setTimeout(() => cb(0), 0);
w.cancelAnimationFrame = (id) => clearTimeout(id);
for (const [k, v] of Object.entries({
  window: w, document: w.document, navigator: w.navigator, localStorage: w.localStorage,
  HTMLElement: w.HTMLElement, Element: w.Element, Node: w.Node, SVGElement: w.SVGElement,
  Event: w.Event, MouseEvent: w.MouseEvent, KeyboardEvent: w.KeyboardEvent,
  getComputedStyle: w.getComputedStyle.bind(w), matchMedia: w.matchMedia,
  ResizeObserver: Observador, IntersectionObserver: Observador,
  requestAnimationFrame: w.requestAnimationFrame, cancelAnimationFrame: w.cancelAnimationFrame, scrollTo: w.scrollTo,
})) {
  Object.defineProperty(globalThis, k, { value: v, configurable: true, writable: true });
}
/* jsdom no trae CSS.escape; el camino lo usa para buscar el nodo resaltado. */
globalThis.CSS = { escape: (v) => String(v).replace(/[^a-zA-Z0-9_-]/g, (c) => `\\${c}`) };
w.CSS = globalThis.CSS;
globalThis.IS_REACT_ACT_ENVIRONMENT = true;

const React = await import("react");
const { createRoot } = await import("react-dom/client");
const act = React.act;
const h = React.createElement;

const MODULO = process.env.CAMINO_MODULO ?? new URL("../CaminoHacer.jsx", import.meta.url).href;
const { default: CaminoHacer } = await import(MODULO);
const { SUBJECTS, HACER, actividadesDeTipo, desafioDe } = await import("../../../data/subjects.js");
const { nodosDe } = await import("../../../hacer/completadas.js");

const FOTO = new URL("./camino-sin-cambios.foto.json", import.meta.url);

/* Todas las variantes de cada tema de Macro y Pensamiento Estratégico. */
function casos() {
  const lista = [];
  for (const materia of ["macroeconomia", "pensamiento-estrategico"]) {
    for (const tema of SUBJECTS[materia].topics) {
      const acts = actividadesDeTipo(tema, HACER).filter((a) => !a.pendiente);
      if (!acts.length) continue;
      const desafio = desafioDe?.(tema);
      for (const [nombreHechas, hechas] of [
        ["ninguna", new Set()],
        ["una de cada tres", new Set(acts.filter((_, i) => i % 3 === 0).map((a) => a.id))],
        ["todas", new Set(acts.map((a) => a.id))],
      ]) {
        for (const porBloques of [false, true]) {
          lista.push({
            nombre: `${materia}/${tema.id} · hechas: ${nombreHechas} · porBloques: ${porBloques}`,
            props: {
              nodos: nodosDe(acts, hechas),
              porBloques,
              resaltado: acts[1]?.id ?? null,
              especial: desafio ? { id: desafio.id, nombre: desafio.nombre, completada: hechas.has(acts[0].id), etiqueta: "DESAFÍO" } : null,
            },
          });
        }
      }
    }
  }
  return lista;
}

/*
 * LA DECORACIÓN NO CUENTA PARA ESTA FOTO, Y ES A PROPÓSITO.
 *
 * El 27 de octubre entró DecoracionCamino: una capa de figuras geométricas
 * detrás del recorrido, y dos propiedades en el SVG (position y z-index) para
 * que el recorrido quede por encima de ella.
 *
 * Se podría haber rehecho la foto entera. No se hizo: rehacerla habría
 * borrado la única prueba de que el cambio no tocó nada más. En vez de eso
 * se quita la capa del HTML antes de pesarlo, y así la foto de main sigue
 * valiendo carácter a carácter. Que las huellas sigan cuadrando DESPUÉS de
 * añadir la decoración es justo lo que había que demostrar: el adorno se
 * puso encima, no en medio.
 *
 * Si mañana la decoración cambia, esta prueba ni se entera —no es lo suyo—;
 * de eso se encarga `decoracion-camino.test.mjs`.
 */
export function sinDecoracion(html) {
  let salida = html;
  /*
   * Se recorta contando divs, no con una expresión regular perezosa: la capa
   * lleva dentro el muñequito, que va en su propio div, y un `.*?</div>` se
   * pararía en el cierre de ese y dejaría basura. Contar es aburrido y no
   * falla cuando alguien añade otra cosa dentro.
   */
  for (;;) {
    const abre = salida.indexOf('<div class="fae-dc"');
    if (abre === -1) break;
    let i = abre;
    let hondo = 1; // ya estamos dentro del div de la capa
    for (;;) {
      const sig = salida.slice(i + 1).search(/<\/?div\b/);
      if (sig === -1) throw new Error("capa decorativa sin cerrar en el HTML");
      i = i + 1 + sig;
      if (salida.startsWith("</div", i)) {
        hondo -= 1;
        if (hondo === 0) break;
      } else {
        hondo += 1;
      }
    }
    salida = salida.slice(0, abre) + salida.slice(salida.indexOf(">", i) + 1);
  }
  /*
   * Y la clase de la entrada del 28-oct. Es un envoltorio que solo anima el
   * recorte del contenedor: no mueve, no redimensiona y no cambia ni un nodo
   * del recorrido, así que quitarla del peso deja la foto de main valiendo
   * carácter a carácter. Que siga cuadrando DESPUÉS de añadirla es justo lo
   * que había que demostrar.
   */
  return salida
    .replaceAll("; position: relative; z-index: 1;", ";")
    .replaceAll(' class="fae-ch-entra"', "")
    /* La hoja de la entrada, entera. Vive en su propio <style> justo para
       poder recortarla sin tocar las reglas de verdad del camino. */
    .replace(/<style>\s*\.fae-ch-entra[\s\S]*?<\/style>/g, "");
}

const huella = (html) => createHash("sha256").update(sinDecoracion(html)).digest("hex");

/* El camino, y la ventana previa de cada uno de sus nodos. */
async function fotografiar({ props }) {
  const caja = document.createElement("div");
  document.body.appendChild(caja);
  const raiz = createRoot(caja);
  function Envoltorio() {
    const [abierto, setAbierto] = React.useState(null);
    return h(CaminoHacer, { ...props, onAbrir: setAbierto, abierto });
  }
  await act(async () => { raiz.render(h(Envoltorio)); });
  const partes = [caja.innerHTML];
  for (const nodo of caja.querySelectorAll("[data-nodo]")) {
    await act(async () => { nodo.dispatchEvent(new w.MouseEvent("click", { bubbles: true })); });
    partes.push(document.body.innerHTML);
    const cerrar = [...document.querySelectorAll("button")].find((b) => b.textContent.trim() === "Cerrar");
    if (cerrar) await act(async () => { cerrar.dispatchEvent(new w.MouseEvent("click", { bubbles: true })); });
  }
  await act(async () => { raiz.unmount(); });
  caja.remove();
  return partes.join("\n<!-- ─── -->\n");
}

test("★★★ el camino de Macro y de Pensamiento Estratégico es idéntico al de main (cada nodo y su ventana previa)", async () => {
  const lista = casos();
  assert.ok(lista.length >= 40, `solo ${lista.length} variantes`);
  const ahora = {};
  for (const c of lista) ahora[c.nombre] = huella(await fotografiar(c));
  if (process.env.FOTO === "escribir") {
    writeFileSync(FOTO, `${JSON.stringify(ahora, null, 2)}\n`);
    return;
  }
  const antes = JSON.parse(readFileSync(FOTO, "utf8"));
  assert.deepEqual(Object.keys(ahora).sort(), Object.keys(antes).sort(), "cambió la lista de variantes");
  const distintas = Object.keys(antes).filter((k) => antes[k] !== ahora[k]);
  assert.deepEqual(distintas, [], `cambió el HTML del camino en:\n  ${distintas.join("\n  ")}`);
});
