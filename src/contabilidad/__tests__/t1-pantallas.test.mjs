import { test } from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { JSDOM, VirtualConsole } from "jsdom";

/*
 * ═══════════════════════════════════════════════════════════════════════════
 * TEMA 1 · APRENDER — LA LISTA DE PANTALLAS DICE LO MISMO QUE LA PIEZA.
 *
 * `contabilidadT1Pantallas.js` es el contenido de las cuatro piezas puesto
 * como presentación: una pantalla tras otra. Sirve el día que el componente
 * de Erwin la lea; hasta entonces, el estudiante sigue viendo `CuatroCapas`.
 * Lo que se rompe sin ruido es que las dos versiones se separen. Tres cosas:
 *
 * 1 · CADA TEXTO ES EL DE LA CONSTANTE. Por identidad, no por parecido: una
 *     copia se queda atrás en la primera corrección.
 * 2 · LOS PASOS SON LOS QUE SE RECORREN. Se monta cada capa 2 y se pulsa
 *     Siguiente hasta el cierre: el rótulo y el texto de cada paso tienen que
 *     ser los de su pantalla, en el mismo orden y sin una de más ni de menos.
 * 3 · LOS RÓTULOS QUE SALIERON DE LOS COMPONENTES siguen diciendo, letra por
 *     letra, lo que decían, y no vuelven a escribirse dentro del componente.
 * ═══════════════════════════════════════════════════════════════════════════
 */

const dom = new JSDOM("<!doctype html><html><body></body></html>", { url: "http://localhost/", virtualConsole: new VirtualConsole() });
const w = dom.window;
/* Movimiento reducido: sin él, Siguiente espera una animación que en JSDOM no termina nunca. */
w.matchMedia = () => ({ matches: true, addEventListener() {}, removeEventListener() {}, addListener() {}, removeListener() {} });
w.requestAnimationFrame = (cb) => setTimeout(() => cb(performance.now()), 0);
w.cancelAnimationFrame = (id) => clearTimeout(id);
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
const act = React.act ?? (await import("react-dom/test-utils")).act;

const {
  PANTALLAS_T1, pantallasDe, CAPA_OBJETIVO, CAPA_NOMBRES, CAPA_MIRALO, CAPA_EXPLORA, CAPA_FRASE,
} = await import("../../data/contabilidadT1Pantallas.js");
const I = await import("../../data/contabilidadIntro.js");
const P = await import("../../data/contabilidadPiezas234.js");
const { ESCENAS_INTRO } = await import("../../components/mecanicas/libros/intro/escenasIntro.jsx");

const IDS = [I.ID, P.ID_P2, P.ID_P3, P.ID_P4];

const montar = (Comp) => {
  const caja = document.createElement("div");
  document.body.appendChild(caja);
  const raiz = createRoot(caja);
  act(() => raiz.render(React.createElement(Comp)));
  return { caja, desmontar: () => { act(() => raiz.unmount()); caja.remove(); } };
};
const tocar = (el) => act(() => { el.dispatchEvent(new w.MouseEvent("click", { bubbles: true })); });

/* ═══════════════════ LA FORMA ═══════════════════ */

test("★★ hay una lista por pieza, con las cinco capas en orden y claves únicas", () => {
  assert.deepEqual(Object.keys(PANTALLAS_T1), IDS);
  for (const id of IDS) {
    const ps = pantallasDe(id);
    const capas = ps.map((p) => p.capa);
    assert.deepEqual([...new Set(capas)], [CAPA_OBJETIVO, CAPA_NOMBRES, CAPA_MIRALO, CAPA_EXPLORA, CAPA_FRASE], `${id}: capas fuera de orden o faltantes`);
    assert.equal(new Set(ps.map((p) => p.clave)).size, ps.length, `${id}: dos pantallas con la misma clave`);
  }
  assert.deepEqual(pantallasDe("t1-desde-donde-preguntan"), [], "un id que no es pieza de Aprender no tiene pantallas");
});

/* ═══════════════════ 1 · LOS TEXTOS SON LOS DE LAS CONSTANTES ═══════════════════ */

test("★★ el objetivo, los nombres y la frase final apuntan a las mismas constantes que lee CuatroCapas", () => {
  for (const pieza of P.PIEZAS_INTRO) {
    const ps = pantallasDe(pieza.id);
    assert.equal(ps[0].texto, pieza.objetivo, `${pieza.id}: el objetivo`);
    const nombres = ps.filter((p) => p.capa === CAPA_NOMBRES);
    if (pieza.capa1EnLista) {
      /* La pieza 1 conserva la capa 1 en lista: una sola pantalla con todo (la siembra cuenta los verbos de la cita). */
      assert.equal(nombres.length, 1);
      assert.equal(nombres[0].nombres, pieza.nombres);
    } else {
      /* Las otras tres, como las pagina CuatroCapas: un término por pantalla, la siembra al final. */
      assert.equal(nombres.length, pieza.nombres.length, `${pieza.id}: un término por pantalla`);
      pieza.nombres.forEach((n, k) => {
        assert.equal(nombres[k].termino, n.termino);
        assert.equal(nombres[k].definicion, n.definicion);
        assert.equal(nombres[k].delLibro, n.delLibro);
      });
    }
  }
  const fraseDe = (id) => pantallasDe(id).find((p) => p.capa === CAPA_FRASE);
  assert.equal(fraseDe(I.ID).pregunta, I.PREGUNTA_FINAL);
  assert.equal(fraseDe(I.ID).opciones, I.OPCIONES);
  assert.equal(fraseDe(P.ID_P2).opciones, P.OPCIONES_P2);
  assert.equal(fraseDe(P.ID_P3).opciones, P.OPCIONES_P3);
  assert.equal(fraseDe(P.ID_P4).opciones, P.OPCIONES_P4);
});

test("★★ capa 3: lo de cada exploración sale de su constante, y la pieza 3 da una pantalla por pregunta", () => {
  const explora = (id) => pantallasDe(id).filter((p) => p.capa === CAPA_EXPLORA);
  const [u] = explora(I.ID);
  assert.equal(u.usuarios, I.USUARIOS);
  assert.equal(u.vacio, I.VACIO_CAPA_3);
  assert.equal(u.texto, I.TEXTO_DEL_SELECTOR);
  const [c] = explora(P.ID_P2);
  assert.equal(c.casos, P.CASOS_P2);
  assert.equal(c.nota, P.NOTA_CAPA3_P2);
  const q = explora(P.ID_P3);
  assert.deepEqual(q.map((x) => x.pregunta), P.PREGUNTAS_P3);
  assert.ok(q.every((x) => x.consigna === P.CONSIGNA_P3 && x.respuestas === P.RESPUESTAS_P3));
  const [f] = explora(P.ID_P4);
  assert.equal(f.flechas, P.FLECHAS_P4);
  assert.equal(f.consigna, P.CONSIGNA_P4);
});

/* ═══════════════════ 2 · LOS PASOS SON LOS QUE SE RECORREN ═══════════════════ */

for (const id of IDS) {
  test(`★★ ${id}: la capa 2 montada recorre exactamente sus pantallas, rótulo y texto`, () => {
    const esperadas = pantallasDe(id).filter((p) => p.capa === CAPA_MIRALO);
    const { caja, desmontar } = montar(ESCENAS_INTRO[id].Capa2);
    try {
      const vistas = [];
      for (let vuelta = 0; vuelta < 20; vuelta++) {
        vistas.push({ texto: caja.querySelector("[data-texto-paso]").textContent, todo: caja.textContent });
        const sig = caja.querySelector("[data-siguiente]");
        if (sig.disabled) break;
        tocar(sig);
      }
      assert.equal(vistas.length, esperadas.length, `${id}: ${vistas.length} pantallas recorridas, la lista tiene ${esperadas.length}`);
      esperadas.forEach((p, k) => {
        assert.equal(vistas[k].texto, p.texto, `${id} · ${p.clave}: el texto del paso`);
        assert.ok(vistas[k].todo.includes(p.rotulo), `${id} · ${p.clave}: falta el rótulo «${p.rotulo}»`);
        assert.ok(vistas[k].todo.includes(p.alternativo), `${id} · ${p.clave}: falta el alternativo`);
      });
      assert.equal(esperadas.at(-1).clave, "cierre");
    } finally { desmontar(); }
  });
}

/* ═══════════════════ 3 · LOS RÓTULOS QUE SALIERON DE LOS COMPONENTES ═══════════════════ */

test("★ los rótulos movidos a datos dicen lo mismo que decían, y el componente ya no los escribe", () => {
  const movidos = [
    ["ElRecorridoDeUnHecho.jsx", I.ROTULO_CIERRE, "El ciclo cerrado"],
    ["ElRecorridoDeUnHecho.jsx", I.BOTON_DESDE_EL_PRINCIPIO, "Desde el principio"],
    ["LaEcuacionContable.jsx", P.ROTULO_CIERRE_P2, "La regla"],
    ["LaFotoYLaPelicula.jsx", P.ROTULO_CIERRE_P3, "Las dos fotos y el tramo"],
    ["ComoSeArticulan.jsx", P.ROTULO_CIERRE_P4, "Las cinco a la vez"],
    ["ExploraUsuarios.jsx", I.ALT_RETORNO.encendido, "El trazo de retorno hacia la primera estación está encendido: la decisión de este usuario cambia la actividad de la empresa."],
    ["ExploraUsuarios.jsx", I.ALT_RETORNO.atenuado, "El trazo de retorno permanece atenuado: este usuario consulta el resumen desde afuera del ciclo."],
  ];
  for (const [archivo, valor, antes] of movidos) {
    assert.equal(valor, antes, `${archivo}: el texto cambió al moverlo`);
    const fuente = readFileSync(new URL(`../../components/mecanicas/libros/intro/${archivo}`, import.meta.url), "utf8");
    assert.ok(!fuente.includes(antes), `${archivo}: «${antes.slice(0, 30)}» volvió a escribirse en el componente`);
  }
});
