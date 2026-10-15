import { test } from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { JSDOM, VirtualConsole } from "jsdom";

/*
 * ═══════════════════════════════════════════════════════════════════════════
 * TEMA 6 · PIEZA 5 — «Cómo se calcula la provisión» (Célula B). LA PANTALLA,
 * según la guía de Mai v1.
 *
 *   · el rótulo «Escenario simulado · no es la tabla del libro» se VE en las
 *     capas 2 y 3: primera línea de la tabla y del tablero; nunca se atenúa;
 *     en los pasos 2 a 8 el desplazamiento lo busca junto a lo resaltado
 *   · cada pie se pinta en su forma (libro llano, escenario en caja redonda,
 *     norma en caja recta, norma y libro con cada fuente en la suya)
 *   · capa 2: texto, pie, resaltado y lo que aparece en cada uno de los 11
 *     pasos y en el cierre; las duraciones de la tabla de Mai
 *   · capa 3: el tablero es una tabla; cada caja llena su celda en cualquier
 *     orden; la suma y el final, con las cuatro
 *   · el «%» nunca se separa de su número, en las cuatro capas
 *   · los rótulos son fragmentos literales; ningún componente escribe texto
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

const D = await import("../../data/contabilidadT6Pieza5.js");
const E = await import("../t6Pieza5.js");
const { T6_A5_JUNTO } = E;
const { default: LaTablaDelEjemplo } = await import("../../components/mecanicas/libros/tema6/LaTablaDelEjemplo.jsx");
const { default: CuatroGrupos } = await import("../../components/mecanicas/libros/tema6/CuatroGrupos.jsx");
const { tipoDePie } = await import("../../components/mecanicas/libros/tema6/FuentesT6A5.jsx");
const { ESCENAS_TEMA6 } = await import("../../components/mecanicas/libros/tema6/escenasTema6.jsx");
const { default: CuatroCapas } = await import("../../components/mecanicas/maquinas/CuatroCapas.jsx");
const { PIEZAS } = await import("../../components/ContabilidadTema6View.jsx");
const { FAE } = await import("../../theme.js");

const montar = async (el) => {
  const caja = document.createElement("div");
  document.body.appendChild(caja);
  const raiz = createRoot(caja);
  await act(async () => { raiz.render(el); });
  return { caja, desmontar: () => { act(() => raiz.unmount()); caja.remove(); } };
};
const tocar = async (el) => { await act(async () => { el.dispatchEvent(new w.MouseEvent("click", { bubbles: true })); }); };
const rgb = (hex) => `rgb(${[1, 3, 5].map((i) => parseInt(hex.slice(i, i + 2), 16)).join(", ")})`;
const NBSP = " ";
const pegado = (t) => t.replace(/(\d) %/g, `$1${NBSP}%`);
const viva = (caja) => caja.querySelector("[data-escena-viva]");
const de = (caja, id) => viva(caja).querySelector(`[data-elemento="${id}"]`);
/* Un paso adelante; la parada entre el 4 y el 5 (hoja 7) se cruza eligiendo la correcta: no es un paso. */
const siguiente = async (caja) => {
  await tocar(caja.querySelector("[data-siguiente]"));
  if (caja.querySelector("[data-parada]")) {
    await tocar(caja.querySelector(`[data-parada] [data-opcion="${D.PARADA_T6_A5.correcta}"]`));
    await tocar(caja.querySelector("[data-siguiente]"));
  }
};
/* Visible: ni la pieza ni nada por encima de ella va oculto ni en silueta (hoja 5 de Mai: lo que no llega, atenuado y marcado con --b5-silueta). */
const visible = (n) => {
  for (let x = n; x && x !== document.body; x = x.parentElement) if (x.style?.visibility === "hidden" || x.style?.getPropertyValue("--b5-silueta")) return false;
  return true;
};
/* Hoja 7 de Mai: 10 pasos, con el 9 y el 10 de antes juntos. */
const PASOS = 10;
const CIERRE = 11;

/* Mai §5.3: lo resaltado y lo que aparece en cada paso. */
const RESALTADOS = {
  1: ["deben"], 2: ["g1", "g2", "g3", "g4"], 3: ["pct2", "pct3", "pct4"], 4: ["g1"], 5: ["g2"], 6: ["g3"], 7: ["g4"],
  8: ["suma"], 9: ["gasto", "provision"], 10: ["neto"], 11: [],
};
const APARECE = {
  1: ["fecha0", "deben"], 2: ["tabla", "rotulo", "g1", "g2", "g3", "g4"], 3: ["pct2", "pct3", "pct4"], 4: ["suma1", "res1"],
  5: ["suma2", "res2"], 6: ["suma3", "res3"], 7: ["suma4", "res4"], 8: ["suma"], 9: ["gasto", "provision"], 10: ["neto"],
};
/* Mai §3: el tipo de pie de cada paso, en orden, y del cierre. */
const TIPOS_CAPA_2 = ["escenario", "libro", "escenario", "escenario", "norma", "norma", "norma", "escenario", "libro", "libro", "libro"];

/* ═══════════ EL RÓTULO FIJO ═══════════ */

test("★★★ capa 2: el rótulo fijo se ve desde el paso 2 hasta el cierre, como primera línea de la tabla, y nunca se atenúa", async () => {
  const { caja, desmontar } = await montar(h(LaTablaDelEjemplo));
  const rotulo = () => viva(caja).querySelector("[data-tabla-ejemplo] [data-rotulo-simulado]");
  assert.equal(rotulo().textContent, D.ROTULO_SIMULADO_T6_A5);
  assert.equal(rotulo().textContent, "Escenario simulado · no es la tabla del libro");
  for (let p = 1; p <= CIERRE; p++) {
    const tabla = viva(caja).querySelector("[data-tabla-ejemplo]");
    assert.equal(visible(tabla), p >= 2, `la tabla en el paso ${p}`);
    assert.equal(tabla.firstElementChild.querySelector("[data-rotulo-simulado]"), rotulo(), "el rótulo es la primera línea de la tabla");
    /* Nunca atenuado: conserva el nodo aunque todo lo demás se apague. */
    assert.equal(rotulo().style.color, rgb(FAE.node), `paso ${p}`);
    assert.equal(de(caja, "rotulo").dataset.resaltado, "no");
    if (p < CIERRE) await siguiente(caja);
  }
  desmontar();
});

test("★★★ capa 3: el rótulo fijo es la primera línea del tablero, que se lee (no va oculto)", async () => {
  const { caja, desmontar } = await montar(h(CuatroGrupos));
  const tablero = caja.querySelector("[data-tablero]");
  assert.ok(tablero.firstElementChild.hasAttribute("data-rotulo-simulado"));
  assert.equal(tablero.firstElementChild.textContent, "Escenario simulado · no es la tabla del libro");
  assert.equal(tablero.closest("[aria-hidden='true']"), null);
  assert.equal(tablero.firstElementChild.style.color, rgb(FAE.node));
  desmontar();
});

test("★★★ el desplazamiento busca el rótulo junto a lo resaltado en los pasos 2 a 8, y solo en ellos", () => {
  for (let p = 1; p <= CIERRE; p++) {
    const e = E.estadoPasoT6A5(p);
    assert.deepEqual(e.tambienEnVista, p >= 2 && p <= 8 ? ["rotulo"] : [], `paso ${p}`);
    assert.equal(e.elementos.rotulo.atenuado, false, `paso ${p}`);
  }
  /* La regla de MaquinaPegada: primero los dos juntos; si no caben, lo resaltado. */
  const fuente = readFileSync(new URL("../../components/mecanicas/libros/tema6/MaquinaPegada.jsx", import.meta.url), "utf8");
  assert.match(fuente, /extra\.length && cabe\(conExtra\) \? conExtra : cabe\(juntos\) \? juntos : rects\[0\]/);
});

/* ═══════════ CAPA 2 ═══════════ */

test("★★★ capa 2: el texto (con el «%» pegado), el pie y su tipo, lo resaltado y lo que aparece en los 10 pasos (el 9 y el 10 de antes, juntos) y el cierre", async () => {
  const { caja, desmontar } = await montar(h(LaTablaDelEjemplo));
  const res = () => [...viva(caja).querySelectorAll('[data-resaltado="si"]')].map((n) => n.dataset.elemento).sort();
  const vistos = new Set();
  for (let p = 1; p <= CIERRE; p++) {
    const esperado = T6_A5_JUNTO.TODOS[p - 1];
    assert.equal(caja.querySelector("[data-texto-paso] p").textContent, pegado(esperado.texto), `texto, paso ${p}`);
    const pie = caja.querySelector("[data-pie]");
    assert.equal(pie.textContent, esperado.pie, `pie, paso ${p}`);
    assert.equal(pie.querySelector("[data-tipo-pie]").dataset.tipoPie, TIPOS_CAPA_2[p - 1], `tipo de pie, paso ${p}`);
    assert.deepEqual(res(), [...RESALTADOS[p]].sort(), `resaltados, paso ${p}`);
    if (p <= PASOS) {
      assert.equal(caja.querySelector("[data-paso-de]").textContent, `Paso ${p} de ${PASOS}`);
      /* Lo que aparece en este paso aparece aquí y no antes. */
      for (const id of APARECE[p]) {
        assert.ok(!vistos.has(id), `${id} ya estaba`);
        assert.ok(visible(de(caja, id)), `${id} no aparece en el paso ${p}`);
      }
      const ahora = [...viva(caja).querySelectorAll("[data-elemento]")].filter(visible).map((n) => n.dataset.elemento);
      for (const id of ahora) vistos.add(id);
      for (const id of Object.values(APARECE).flat().filter((x) => !Object.entries(APARECE).some(([k, ids]) => Number(k) <= p && ids.includes(x)))) {
        assert.ok(!visible(de(caja, id)), `${id} se adelanta al paso ${p}`);
      }
    }
    if (p < CIERRE) await siguiente(caja);
  }
  /* En el cierre: todo a la vista y nada resaltado ni atenuado. */
  for (const id of Object.values(APARECE).flat()) assert.ok(visible(de(caja, id)), `${id} en el cierre`);
  desmontar();
});

test("★★★ la tabla: cuatro filas con los nombres de la capa 3; el grupo 1 sin pastilla; la suma bajo el filete; las anotaciones con su cápsula", async () => {
  const { caja, desmontar } = await montar(h(LaTablaDelEjemplo));
  for (let p = 1; p < CIERRE; p++) await siguiente(caja);
  const filas = [...viva(caja).querySelectorAll("[data-fila-grupo]")];
  assert.deepEqual(filas.map((f) => f.querySelector("[data-nombre-grupo]").textContent), D.GRUPOS_T6_A5.map((g) => g.nombre));
  const esperado = D.ESCENA_T6_A5.grupos;
  filas.forEach((f, k) => {
    assert.equal(de(caja, `suma${k + 1}`).textContent, esperado[k].suma);
    assert.equal(de(caja, `res${k + 1}`).textContent, esperado[k].resultado);
    const pct = de(caja, `pct${k + 1}`);
    if (esperado[k].porcentaje) assert.equal(pct.textContent, pegado(esperado[k].porcentaje));
    else assert.equal(pct, null, "el grupo 1 no tiene pastilla (no hay «0 %» escrito)");
  });
  assert.equal(de(caja, "suma").textContent, D.ESCENA_T6_A5.suma);
  assert.equal(D.ESCENA_T6_A5.suma, "$74.000");
  assert.deepEqual([...viva(caja).querySelectorAll("[data-lado]")].map((n) => `${n.closest("[data-elemento]").dataset.elemento}:${n.textContent}`),
    ["gasto:se debita", "provision:se acredita"]);
  desmontar();
});

test("★★ con su fila resaltada, la suma y el resultado no se atenúan; en el paso 3, las pastillas se resaltan solas", async () => {
  const { caja, desmontar } = await montar(h(LaTablaDelEjemplo));
  await siguiente(caja); await siguiente(caja);
  assert.ok(["pct2", "pct3", "pct4"].every((id) => de(caja, id).style.background === rgb(FAE.navy)));
  await siguiente(caja); await siguiente(caja);
  /* Paso 5: la fila 2 resaltada; su suma y su resultado en texto pleno. */
  assert.equal(de(caja, "g2").dataset.resaltado, "si");
  for (const id of ["suma2", "res2"]) assert.equal(de(caja, id).style.color, rgb(FAE.text), id);
  assert.notEqual(de(caja, "suma1").style.color, rgb(FAE.text), "la fila 1, atenuada");
  desmontar();
});

test("★★ «Reproducir»: 3 000 + 450 ms por palabra; la tabla de Mai §5.4 y sus 99,6 s", () => {
  const ms = Array.from({ length: 11 }, (_, k) => E.duracionPasoT6A5(k + 1));
  assert.deepEqual(ms, [9300, 6600, 10200, 12900, 11100, 11550, 9300, 6600, 7050, 7950, 7050]);
  assert.equal(ms.reduce((a, b) => a + b, 0), 99600);
  /* Hoja 7: con el 9 y el 10 juntos, la fórmula no cambia y se ahorran los 3 000 ms de un paso: 105,45 s con el cierre (Mai lo redondea a 105,5). */
  const juntos = Array.from({ length: PASOS }, (_, k) => T6_A5_JUNTO.duracion(k + 1));
  assert.deepEqual(juntos, [9300, 6600, 10200, 12900, 11100, 11550, 9300, 6600, 7050 + 7950 - 3000, 7050]);
  assert.equal(juntos.reduce((a, b) => a + b, 0) + T6_A5_JUNTO.duracion(CIERRE), 105450);
});

/* ═══════════ LOS PIES, EN SU FORMA ═══════════ */

test("★★★ cada tipo de pie tiene su forma: libro llano, escenario en caja redonda, norma en caja recta, norma y libro cada uno en la suya", async () => {
  assert.deepEqual(["Basado en el libro, p. 200", "Escenario simulado", "Fuente del porcentaje: Decreto 1625 de 2016", D.PIE_DECRETO, D.PIE_DECRETO_Y_LIBRO].map(tipoDePie),
    ["libro", "escenario", "norma", "norma", "norma-y-libro"]);
  const { caja, desmontar } = await montar(h(LaTablaDelEjemplo));
  const forma = () => caja.querySelector("[data-pie] [data-tipo-pie]");
  assert.equal(forma().style.borderRadius, "8px", "paso 1: escenario, redonda");
  assert.equal(forma().style.fontWeight, "600");
  await siguiente(caja);
  assert.equal(forma().style.border, "", "paso 2: libro, sin caja");
  for (let p = 2; p < 5; p++) await siguiente(caja);
  assert.equal(Number.parseFloat(forma().style.borderRadius), 0, "paso 5: norma, esquinas rectas");
  assert.equal(forma().style.fontWeight, "400");
  assert.equal(forma().style.color, rgb(FAE.text));
  desmontar();
  /* El tipo 4: la norma en su caja recta y « · Libro, p. 201» llano, sin caja. */
  const { PieDeFuente } = await import("../../components/mecanicas/libros/tema6/FuentesT6A5.jsx");
  const m = await montar(h("p", null, h(PieDeFuente, { texto: D.PIE_DECRETO_Y_LIBRO })));
  assert.equal(m.caja.querySelector("[data-parte-norma]").textContent, D.PIE_DECRETO);
  assert.equal(Number.parseFloat(m.caja.querySelector("[data-parte-norma]").style.borderRadius), 0);
  assert.equal(m.caja.querySelector("[data-parte-libro]").textContent, " · Libro, p. 201");
  assert.equal(m.caja.querySelector("[data-parte-libro]").style.border, "");
  m.desmontar();
});

/* ═══════════ CAPA 3 ═══════════ */

test("★★★ capa 3: el tablero es una tabla; cada caja llena su celda en cualquier orden; con las cuatro, «La provisión» y el final", async () => {
  const { caja, desmontar } = await montar(h(CuatroGrupos));
  assert.equal(caja.querySelector("[data-capa3-t6-a5] > p").textContent, D.CONSIGNA_CAPA_3_T6_A5);
  const tabla = caja.querySelector("[data-tablero] table");
  assert.equal(tabla.querySelector("thead th").textContent, "Se provisiona");
  assert.deepEqual([...tabla.querySelectorAll("tbody th")].map((th) => th.textContent), D.GRUPOS_T6_A5.map((g) => g.nombre));
  const celdas = () => [...tabla.querySelectorAll("tbody [data-celda]")].map((c) => c.textContent);
  assert.deepEqual(celdas(), ["", "", "", ""]);
  /* Las cajas cerradas: «nombre · monto», como el rótulo de Futaba. */
  assert.deepEqual([...caja.querySelectorAll("[data-hecho] button")].map((b) => b.textContent), D.GRUPOS_T6_A5.map((g) => `${g.nombre} · ${g.monto}`));
  for (const [k, id] of [[2, "g3"], [0, "g1"], [3, "g4"]]) {
    await tocar(caja.querySelector(`[data-hecho="${id}"] button`));
    assert.equal(celdas()[k], D.TABLERO_T6_A5.celdas[k]);
    const g = D.GRUPOS_T6_A5[k];
    const revela = caja.querySelector(`[data-revela="${id}"]`);
    assert.equal(revela.querySelector("p").textContent, pegado(g.revela));
    assert.equal(revela.querySelector("[data-tipo-pie]").dataset.tipoPie, k === 0 ? "escenario" : "norma");
    assert.equal(caja.querySelector("[data-fila-total]"), null, "la suma espera a las cuatro");
    assert.equal(caja.querySelector("[data-final]").textContent, "");
  }
  await tocar(caja.querySelector('[data-hecho="g2"] button'));
  assert.deepEqual(celdas(), D.TABLERO_T6_A5.celdas);
  assert.equal(caja.querySelector("[data-fila-total]").textContent, `${D.TABLERO_T6_A5.total}${D.TABLERO_T6_A5.suma}`);
  const final = caja.querySelector("[data-final]");
  assert.equal(final.querySelector("p").textContent, D.FINAL_CAPA_3_T6_A5.texto);
  assert.equal(final.querySelector("[data-tipo-pie]").dataset.tipoPie, "escenario");
  desmontar();
});

/* ═══════════ EL «%» PEGADO A SU NÚMERO ═══════════ */

const sinPartir = (t) => !/\d %/.test(t);

test("★★★ el «%» nunca se separa de su número: capas 1, 2, 3 y 4", async () => {
  /* Capa 1, en la pieza que la vista le pasa a CuatroCapas. */
  const pieza = PIEZAS.find((p) => p.pieza.id === D.PIEZA_COMO_SE_CALCULA.id).pieza;
  const { Capa2, Exploracion, Capa4 } = ESCENAS_TEMA6[pieza.id];
  const capas = await montar(h(CuatroCapas, { pieza, Capa2, Exploracion, Capa4, rotulo: "R" }));
  const capa1 = capas.caja.querySelector('[data-capa="1"]').textContent;
  assert.ok(capa1.includes(`5${NBSP}%`) && capa1.includes(`15${NBSP}%`));
  assert.ok(sinPartir(capa1));
  capas.desmontar();
  /* Capa 2, en los pasos 5 a 7 y en la tabla. */
  const c2 = await montar(h(LaTablaDelEjemplo));
  for (let p = 1; p < CIERRE; p++) {
    assert.ok(sinPartir(c2.caja.textContent), `capa 2, paso ${p}`);
    await siguiente(c2.caja);
  }
  c2.desmontar();
  /* Capa 3, con las cuatro abiertas. */
  const c3 = await montar(h(CuatroGrupos));
  for (const b of [...c3.caja.querySelectorAll("[data-hecho] button")]) await tocar(b);
  assert.ok(c3.caja.textContent.includes(`5${NBSP}%`) && sinPartir(c3.caja.textContent));
  c3.desmontar();
  /* Capa 4: la pregunta, las opciones y cada devolución. */
  const c4 = await montar(h(Capa4));
  for (const o of D.OPCIONES_FINAL_T6_A5) {
    await tocar(c4.caja.querySelector(`[data-opcion="${o.id}"]`));
    const dev = c4.caja.querySelector("[data-devolucion]").textContent;
    assert.equal(dev, pegado(o.feedback));
    assert.ok(sinPartir(dev));
    await tocar(c4.caja.querySelector("[data-otra-vez]"));
  }
  c4.desmontar();
});

test("★★★ capa 4: UnaFrase con la pregunta, cuatro opciones, una sola correcta y su devolución", async () => {
  const { Capa4 } = ESCENAS_TEMA6[D.PIEZA_COMO_SE_CALCULA.id];
  const { caja, desmontar } = await montar(h(Capa4));
  assert.ok(caja.textContent.startsWith(D.PREGUNTA_FINAL_T6_A5));
  for (const o of D.OPCIONES_FINAL_T6_A5) {
    assert.equal(caja.querySelector(`[data-opcion="${o.id}"]`).textContent, o.texto);
    await tocar(caja.querySelector(`[data-opcion="${o.id}"]`));
    assert.equal(caja.querySelector("[data-devolucion]").dataset.devolucion, o.correcta ? "correcta" : "incorrecta");
    await tocar(caja.querySelector("[data-otra-vez]"));
  }
  desmontar();
});

/* ═══════════ TEXTOS ═══════════ */

const FUENTES_FRAGMENTO = () => [...D.PASOS_T6_A5, D.CIERRE_T6_A5].map((p) => p.texto)
  .concat(D.GRUPOS_T6_A5.flatMap((g) => [g.nombre, g.monto, g.revela]), [D.FINAL_CAPA_3_T6_A5.texto, D.ROTULO_SIMULADO_T6_A5])
  .map((t) => t.toLowerCase());
const esFragmento = (r) => FUENTES_FRAGMENTO().some((t) => t.includes(r.toLowerCase()));

test("★★★ cada rótulo de la escena y del tablero es fragmento literal de un paso, de la capa 3 o del rótulo fijo (y uno inventado no lo es)", () => {
  assert.equal(esFragmento("Al 0 %"), false, "control: el «0 %» que no está escrito no pasa");
  const { grupos, debita, acredita, ...resto } = D.ESCENA_T6_A5;
  const rotulos = [...Object.values(resto), ...grupos.flatMap((g) => [g.suma, g.porcentaje, g.resultado]).filter(Boolean),
    D.TABLERO_T6_A5.total, D.TABLERO_T6_A5.suma, ...D.TABLERO_T6_A5.celdas];
  assert.ok(rotulos.length >= 20, `solo ${rotulos.length} rótulos`);
  assert.deepEqual(rotulos.filter((x) => !esFragmento(x)), []);
  /* «Se provisiona» es la cabecera de Mai: sale de la consigna («se provisiona por él»). */
  assert.ok(D.CONSIGNA_CAPA_3_T6_A5.toLowerCase().includes(D.TABLERO_T6_A5.cabecera.toLowerCase()));
});

test("★★★ ningún componente de la pieza escribe texto que lea el estudiante", () => {
  const fuentes = ["LaTablaDelEjemplo.jsx", "CuatroGrupos.jsx", "FuentesT6A5.jsx", "Momentos.jsx", "MaquinaPegada.jsx", "escenasTema6.jsx"]
    .map((f) => readFileSync(new URL(`../../components/mecanicas/libros/tema6/${f}`, import.meta.url), "utf8"));
  const textos = [];
  const recoger = (v, k) => {
    if (typeof v === "string") { if (k !== "id") textos.push(v); }
    else if (Array.isArray(v)) v.forEach((x) => recoger(x, k));
    else if (v && typeof v === "object") for (const [kk, x] of Object.entries(v)) recoger(x, kk);
  };
  for (const [k, v] of Object.entries(D)) recoger(v, k);
  for (const t of textos) {
    if (t.length < 12) continue;
    for (const f of fuentes) assert.ok(!f.includes(t), `texto escrito a mano: «${t.slice(0, 50)}»`);
  }
});

test("★★ la pieza va quinta en el tema: la vista dice «PIEZA 5 DE 5» y le pasa sus tres capas", async () => {
  assert.deepEqual(PIEZAS.map((p) => p.numero), [1, 2, 3, 4, 5]);
  assert.equal(PIEZAS[4].pieza.id, D.PIEZA_COMO_SE_CALCULA.id);
  const vista = readFileSync(new URL("../../components/ContabilidadTema6View.jsx", import.meta.url), "utf8");
  assert.match(vista, /PIEZA \{k \+ 1\} DE \{PUBLICADAS\}/);
  assert.match(vista, /const PUBLICADAS = PIEZAS\.length;/);
  assert.deepEqual(ESCENAS_TEMA6[D.PIEZA_COMO_SE_CALCULA.id], { Capa2: LaTablaDelEjemplo, Exploracion: CuatroGrupos, Capa4: ESCENAS_TEMA6[D.PIEZA_COMO_SE_CALCULA.id].Capa4 });
});

/* ═══════════ LAS CONDICIONES DE SHOKO ═══════════ */

test("★★★ condición 3 (Shoko): el lector de pantalla oye el pie de cada paso con su texto, y el rótulo fijo una vez, cuando aparece la tabla", async () => {
  const { caja, desmontar } = await montar(h(LaTablaDelEjemplo));
  const viva = caja.querySelector("[data-texto-paso]");
  assert.equal(viva.getAttribute("aria-live"), "polite");
  /* La escena, oculta al lector: el rótulo no se oye ahí. */
  assert.equal(caja.querySelector("[data-escena]").getAttribute("aria-hidden"), "true");
  for (let p = 1; p <= CIERRE; p++) {
    const esperado = T6_A5_JUNTO.TODOS[p - 1];
    const oye = [...viva.querySelectorAll("[data-lector]")].map((n) => n.textContent.trim());
    assert.deepEqual(oye, [...(p === 2 ? [D.ROTULO_SIMULADO_T6_A5] : []), pegado(esperado.pie)], `paso ${p}`);
    /* Todo dentro de la misma región viva, después del texto. */
    assert.ok(viva.textContent.startsWith(pegado(esperado.texto)));
    /* El pie visible no se lee dos veces. */
    assert.equal(caja.querySelector("[data-pie]").getAttribute("aria-hidden"), "true");
    if (p < CIERRE) await siguiente(caja);
  }
  desmontar();
});

test("★★★ condición 3: en los pasos 5 a 7 se oye la fuente del porcentaje junto al porcentaje", async () => {
  const { caja, desmontar } = await montar(h(LaTablaDelEjemplo));
  for (let p = 1; p < 5; p++) await siguiente(caja);
  for (let p = 5; p <= 7; p++) {
    const oye = caja.querySelector("[data-texto-paso]").textContent;
    assert.match(oye, /Al \d+\u00A0%/);
    assert.ok(oye.endsWith(D.PIE_PORCENTAJE), `paso ${p}: «${oye.slice(-60)}»`);
    await siguiente(caja);
  }
  desmontar();
});

test("★★ las otras piezas de T6 no cambian: sin `lector`, el pie visible se sigue leyendo y no hay nada solo para el lector", async () => {
  const { default: LaProvision } = await import("../../components/mecanicas/libros/tema6/LaProvision.jsx");
  const { caja, desmontar } = await montar(h(LaProvision));
  assert.equal(caja.querySelector("[data-lector]"), null);
  assert.equal(caja.querySelector("[data-pie]").getAttribute("aria-hidden"), null);
  desmontar();
});

test("★★★ condición 1 (Shoko): el Decreto nunca queda rotulado «Así lo dice el libro» en la capa 1; la nota del término 4 va rotulada «Nota»", async () => {
  const pieza = PIEZAS.find((p) => p.pieza.id === D.PIEZA_COMO_SE_CALCULA.id).pieza;
  const { Capa2, Exploracion, Capa4 } = ESCENAS_TEMA6[pieza.id];
  const { caja, desmontar } = await montar(h(CuatroCapas, { pieza, Capa2, Exploracion, Capa4, rotulo: "R" }));
  const bloques = [...caja.querySelectorAll('[data-capa="1"] [data-del-libro]')];
  assert.equal(bloques.length, 2, "la cita del término 1 y la nota del término 4");
  const rotulos = bloques.map((b) => b.firstElementChild.textContent);
  assert.deepEqual(rotulos, ["Así lo dice el libro", "Nota"]);
  /* La cita del libro es del libro; lo de la norma no entra en un bloque «Así lo dice el libro». */
  for (const b of bloques) {
    if (b.firstElementChild.textContent === "Así lo dice el libro") assert.doesNotMatch(b.textContent, /Decreto|norma|renta/i);
  }
  assert.doesNotMatch(bloques[0].textContent, /Decreto/);
  desmontar();
});

test("★★★ condición 1 resuelta: cada término de la capa 1 muestra su pie bajo la definición, y la nota del 4 el suyo dentro de su caja, cada uno en su forma", async () => {
  const pieza = PIEZAS.find((p) => p.pieza.id === D.PIEZA_COMO_SE_CALCULA.id).pieza;
  const { Capa2, Exploracion, Capa4 } = ESCENAS_TEMA6[pieza.id];
  const { caja, desmontar } = await montar(h(CuatroCapas, { pieza, Capa2, Exploracion, Capa4, rotulo: "R" }));
  const terminos = [...caja.querySelectorAll('[data-capa="1"] dl > div')];
  assert.equal(terminos.length, 4);
  const N = D.PIEZA_COMO_SE_CALCULA.nombres;
  /* Mai §3: términos 1 a 3, libro llano; término 4, la norma en su caja recta; la nota, el mixto. */
  const TIPOS = ["libro", "libro", "libro", "norma"];
  terminos.forEach((t, k) => {
    const dd = t.querySelector("dd");
    const pie = dd.querySelector("[data-pie-termino]");
    assert.ok(pie, `término ${k + 1} sin pie`);
    assert.equal(pie.textContent, N[k].pie, `pie del término ${k + 1}`);
    assert.equal(pie.querySelector("[data-tipo-pie]").dataset.tipoPie, TIPOS[k], `forma del pie del término ${k + 1}`);
    assert.equal(pie.style.display, "block", "en su propia línea");
    /* Bajo la definición, no antes. */
    assert.ok(dd.querySelector("[data-texto-con-pie]").compareDocumentPosition(pie) & w.Node.DOCUMENT_POSITION_FOLLOWING);
    assert.equal(dd.querySelector("[data-texto-con-pie]").textContent, pegado(N[k].definicion));
  });
  /* La nota del término 4: su pie mixto dentro de la caja «Nota», bajo el texto. */
  const nota = terminos[3].querySelector("[data-del-libro]");
  assert.equal(nota.firstElementChild.textContent, "Nota");
  const pieNota = nota.querySelector("[data-pie-nota]");
  assert.equal(pieNota.textContent, D.PIE_DECRETO_Y_LIBRO);
  assert.equal(pieNota.querySelector("[data-tipo-pie]").dataset.tipoPie, "norma-y-libro");
  /* La cita del término 1 no lleva pie: su página va dentro de la cita. */
  const cita = terminos[0].querySelector("[data-del-libro]");
  assert.equal(cita.firstElementChild.textContent, "Así lo dice el libro");
  assert.equal(cita.querySelector("[data-pie-nota]"), null);
  /* Y el Decreto solo aparece en el término 4 y en su nota, nunca bajo «Así lo dice el libro». */
  const conDecreto = [...caja.querySelectorAll('[data-capa="1"] [data-tipo-pie]')].filter((n) => n.textContent.includes("Decreto"));
  assert.equal(conDecreto.length, 2);
  for (const n of conDecreto) assert.notEqual(n.closest("[data-del-libro]")?.firstElementChild.textContent, "Así lo dice el libro");
  desmontar();
});
