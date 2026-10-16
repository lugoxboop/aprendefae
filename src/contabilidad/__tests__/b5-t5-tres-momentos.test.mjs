import { test } from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { JSDOM, VirtualConsole } from "jsdom";

/*
 * ═══════════════════════════════════════════════════════════════════════════
 * TEMA 5 · PIEZA 2 — «Los tres momentos de una inversión» (Célula B).
 *
 * Vigila lo que se ve:
 *   · todo texto de los datos es literal del paquete guardado
 *     (paquetes/b5-t5-aprender2.md); donde la guía v1 y Futaba dicen
 *     distinto, manda Futaba; cada rótulo de la escena es fragmento literal
 *     de un paso o de la capa 3; ningún componente escribe texto propio
 *   · la capa 2: el texto, el pie y lo resaltado de los 21 pasos y del cierre
 *     (la tabla de Futaba); los cinco hechos, uno abierto a la vez (tramos de
 *     la v2), con su resultado al plegarse; cada pieza desde su paso; cada
 *     asiento con sus dos lados en cápsula; las cuentas sin partir; la
 *     reserva de alto; las duraciones de la v2b
 *   · la capa 3: las dos ventas iguales, con sus cifras; el final, con las dos
 *   · la capa 4: UnaFrase con una sola correcta («lo que costaron los 260
 *     títulos», C1-3 del lote C2 · C1 · C7) y sus devoluciones
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

const D = await import("../../data/contabilidadT5Pieza2.js");
const E = await import("../t5Pieza2.js");
const { default: TresMomentos } = await import("../../components/mecanicas/libros/tema5/TresMomentos.jsx");
const { decidir } = await import("./b5-capa3.mjs");
const { default: DosVentas } = await import("../../components/mecanicas/libros/tema5/DosVentas.jsx");
const { ESCENAS_TEMA5 } = await import("../../components/mecanicas/libros/tema5/escenasTema5.jsx");
const { PIEZAS } = await import("../../components/ContabilidadTema5View.jsx");
const { SUBJECTS, APRENDER, actividadesDeTipo } = await import("../../data/subjects.js");
const { FAE } = await import("../../theme.js");
const { COLOR } = await import("../../data/contabilidadTema3.js");

const montar = async (el) => {
  const caja = document.createElement("div");
  document.body.appendChild(caja);
  const raiz = createRoot(caja);
  await act(async () => { raiz.render(el); });
  return { caja, desmontar: () => { act(() => raiz.unmount()); caja.remove(); } };
};
const tocar = async (el) => { await act(async () => { el.dispatchEvent(new w.MouseEvent("click", { bubbles: true })); }); };
const rgb = (hex) => `rgb(${[1, 3, 5].map((i) => parseInt(hex.slice(i, i + 2), 16)).join(", ")})`;

const textosDeDatos = () => {
  const out = [];
  const recoger = (v, k) => {
    if (typeof v === "string") { if (!["id", "correcta", "resaltados"].includes(k)) out.push(v); }
    else if (Array.isArray(v)) v.forEach((x) => recoger(x, k));
    else if (v && typeof v === "object") for (const [kk, x] of Object.entries(v)) recoger(x, kk);
  };
  for (const [k, v] of Object.entries(D)) recoger(v, k);
  return out;
};
const FUENTE = readFileSync(new URL("../../../orquestador/conocimiento/paquetes/b5-t5-aprender2.md", import.meta.url), "utf8");
/* La sección de Futaba del paquete: la versión que manda. */
const FUTABA = FUENTE.slice(FUENTE.indexOf("## (1) Futaba"), FUENTE.indexOf("## (2) Mai"));
const viva = (caja) => caja.querySelector("[data-escena-viva]");
const de = (caja, id) => viva(caja).querySelector(`[data-elemento="${id}"]`);
/* Lo que todavía no llega se ve en silueta (hoja 5 de Mai): a la vista, atenuado y marcado con --b5-silueta. */
const enSilueta = (n) => n.style.visibility === "visible" && Boolean(n.style.getPropertyValue("--b5-silueta"));
/* Un paso adelante; la parada entre el 10 y el 11 (hoja 7) se cruza eligiendo la correcta: no es un paso. */
const siguiente = async (caja) => {
  await tocar(caja.querySelector("[data-siguiente]"));
  if (caja.querySelector("[data-parada]")) {
    await tocar(caja.querySelector(`[data-parada] [data-opcion="${D.PARADA_T5_A2.correcta}"]`));
    await tocar(caja.querySelector("[data-siguiente]"));
  }
};
/*
 * Los pasos juntados (hoja 7 de Mai): 14 pasos que muestran los estados de los 21 de antes. `J.viejo(n)` es el
 * paso de antes cuyo estado muestra el paso n; `nuevoDe(p)`, el paso nuevo que contiene el paso p de antes.
 */
const J = E.T5_A2_JUNTO;
const nuevoDe = (p) => (p > 21 ? J.CIERRE : D.FUSION_T5_A2.grupos.findIndex((g) => g.includes(p)) + 1);
const colorVisto = (n) => {
  while (n && (!n.style.color || n.style.color === "inherit")) n = n.parentElement;
  return n?.style.color;
};

/* ═══════════ TEXTOS ═══════════ */

test("★★★ todo texto de los datos es literal del paquete guardado (paquetes/b5-t5-aprender2.md)", () => {
  const textos = textosDeDatos();
  assert.ok(textos.length > 80, `solo ${textos.length} textos`);
  assert.deepEqual(textos.filter((t) => !FUENTE.includes(t)), []);
});

test("★★★ manda Futaba: término 2, capa 3 («costaron»), pregunta y correcta de la capa 4, y los 21 pasos con su etiqueta", () => {
  const n = D.PIEZA_TRES_MOMENTOS.nombres;
  assert.deepEqual(n.map((x) => x.termino), ["Tres momentos", "La compra", "El rendimiento", "La venta"]);
  /* B2 (un término por pantalla, 15-oct): «El rendimiento» cambia; los otros tres son «el de hoy». */
  const B2 = FUENTE.slice(FUENTE.indexOf("## B2 ·"));
  assert.ok(B2.includes(`**El rendimiento** — ${n[2].definicion}`), "«El rendimiento», literal de B2");
  for (const x of [n[0], n[1], n[3]]) {
    assert.ok(B2.includes(`**${x.termino}** — El de hoy.`), `«${x.termino}»: B2 dice «el de hoy»`);
    assert.ok(FUTABA.includes(`\t${x.termino}\t${x.definicion}\t`), `término «${x.termino}» como en Futaba`);
  }
  assert.ok(n[2].definicion.includes("por dividendos si viene de acciones, y por interés si viene de otro título"));
  assert.ok(n[1].definicion.endsWith("El ejemplo del libro no trae gastos de compra, y la cuenta se llama Inversiones – títulos."));
  assert.match(n[0].delLibro, /^«.*» \(p\. 193\)$/);
  assert.deepEqual(n.slice(1).map((x) => x.delLibro), [undefined, undefined, undefined], "solo el término 1 lleva cita");
  assert.ok(D.VENTAS_T5_A2.every((v) => v.revela.includes("de lo que costaron:")));
  /* C1-3 del lote C2 · C1 · C7: la capa 4 es un caso nuevo, de escenario simulado. */
  assert.equal(D.PREGUNTA_FINAL_T5_A2, "Una empresa vende 260 títulos. Cada uno le costó $850. Le pagan $273.000. ¿Por cuánto se acredita la inversión?");
  /* La tabla de la capa 2 de Futaba, por número de paso (los pasos 7 y 17 dicen lo mismo con distinta página). */
  const filas = new Map();
  for (const l of FUTABA.split("\n")) {
    const c = l.split("\t");
    if (c.length >= 4 && /^(\d+|Cierre)$/.test(c[0]) && /^(Libro|Basado)/.test(c[2])) filas.set(c[0], { texto: c[1], pie: c[2] });
  }
  assert.equal(filas.size, 22, "la guarda: 21 pasos y el cierre");
  const todos = [...D.PASOS_T5_A2, D.CIERRE_T5_A2];
  assert.equal(todos.length, 22);
  todos.forEach((p, k) => assert.deepEqual(p, filas.get(k < 21 ? String(k + 1) : "Cierre"), `paso ${k + 1}`));
});

/* Los rótulos que pinta la escena (sin las cápsulas). */
const rotulos = () => {
  const { hechos, debita, acredita, ...resto } = D.ESCENA_T5_A2;
  return [...hechos.flatMap((x) => [x.fecha, x.tipo, x.plegado]), ...Object.values(resto).flat()];
};
/*
 * El resultado plegado de las dos ventas («Ganancia de $225.000», «Pérdida de
 * $31.250») salió de lo que revelaba la capa 3 de antes. El lote C1-2 cambió
 * esa capa a un escenario simulado; el rótulo de la escena no cambió, así
 * que sigue anclado al texto aprobado de entonces, guardado en el paquete.
 */
const CAPA_3_ANTES = [
  "Recibió más de lo que costaron: ganancia de $225.000. Inversiones – títulos se acredita por el costo, no por lo recibido.",
  "Recibió menos de lo que costaron: pérdida de $31.250. Inversiones – títulos también se acredita por el costo.",
];
const esFragmento = (r) => {
  const fuentes = [...D.PASOS_T5_A2.map((p) => p.texto), ...D.VENTAS_T5_A2.flatMap((v) => [v.nombre, v.revela]), ...CAPA_3_ANTES].map((t) => t.toLowerCase());
  return fuentes.some((t) => t.includes(r.toLowerCase()));
};

test("★★★ cada rótulo de la escena es fragmento literal de un paso o de la capa 3 (y un rótulo inventado no lo es)", () => {
  assert.equal(esFragmento("Vende mercancía a crédito"), false, "control: un rótulo inventado no pasa");
  for (const t of CAPA_3_ANTES) assert.ok(FUTABA.includes(t), "la capa 3 de antes sigue guardada en el paquete");
  const r = rotulos();
  assert.ok(r.length >= 35, `solo ${r.length} rótulos`);
  assert.deepEqual(r.filter((x) => !esFragmento(x)), []);
});

test("★★★ ningún componente de la pieza escribe texto que lea el estudiante", () => {
  const fuentes = ["tema5/TresMomentos.jsx", "tema5/DosVentas.jsx", "tema5/escenasTema5.jsx", "tema6/MaquinaPegada.jsx", "tema6/CajasQueRevelan.jsx"]
    .map((f) => readFileSync(new URL(`../../components/mecanicas/libros/${f}`, import.meta.url), "utf8"));
  for (const t of textosDeDatos()) {
    if (t.length < 12) continue;
    for (const f of fuentes) assert.ok(!f.includes(t), `texto escrito a mano: «${t.slice(0, 50)}»`);
  }
});

/* Desde N2 de la Célula C (decisión de corte de T5, punto 6), la pieza va tercera: N2 entra antes que ella y no trae escenas. */
test("★★ la pieza va tercera en el tema, después de N2: APRENDER, la vista y sus tres capas", () => {
  const tema = SUBJECTS.contabilidad.topics.find((t) => t.id === "activos-financieros");
  assert.deepEqual(actividadesDeTipo(tema, APRENDER).map((a) => a.id), ["b5-t5-a1-del-efectivo-de-sobra", "t5-a1-cuidar-las-inversiones", D.PIEZA_TRES_MOMENTOS.id]);
  assert.deepEqual(PIEZAS.map((p) => p.pieza.id), ["b5-t5-a1-del-efectivo-de-sobra", "t5-a1-cuidar-las-inversiones", D.PIEZA_TRES_MOMENTOS.id]);
  assert.deepEqual(Object.keys(ESCENAS_TEMA5), ["b5-t5-a1-del-efectivo-de-sobra", D.PIEZA_TRES_MOMENTOS.id]);
  const { Capa2, Exploracion } = ESCENAS_TEMA5[D.PIEZA_TRES_MOMENTOS.id];
  assert.equal(Capa2, TresMomentos);
  assert.equal(Exploracion, DosVentas);
});

/* ═══════════ CAPA 2 ═══════════ */

/* La columna «Resalta» de Futaba, paso por paso. */
const RESALTADOS = {
  1: ["efectivo"], 2: ["titulos"], 3: ["bancos", "inversiones1"], 4: ["tasa"], 5: ["primerInteres"], 6: ["cuenta1"],
  7: ["caja1", "ingresos1"], 8: ["vendidos"], 9: ["precio1"], 10: ["caja2"], 11: ["sinInteres"], 12: ["costo1"],
  13: ["inversiones2"], 14: ["ganancia"], 15: ["quedan"], 16: ["cuenta2"], 17: ["caja3", "ingresos2"], 18: ["precio2"],
  19: ["costo2", "recibe2"], 20: ["caja4", "inversiones3"], 21: ["perdida"], 22: [],
};

test("★★★ capa 2: el texto, el pie y lo resaltado de los 14 pasos (los 21 de antes, juntados) y del cierre, sin avisos de React", async () => {
  const avisos = [];
  const antes = console.error;
  console.error = (...a) => avisos.push(a.join(" "));
  try {
    const { caja, desmontar } = await montar(h(TresMomentos));
    const res = () => [...caja.querySelectorAll('[data-resaltado="si"]')].map((n) => n.dataset.elemento).sort();
    for (let p = 1; p <= J.CIERRE; p++) {
      /* El texto: los de antes, seguidos y sin cambiar una palabra; el pie, el nuevo; lo resaltado, la unión. */
      const grupo = p <= J.PASOS ? D.FUSION_T5_A2.grupos[p - 1] : [22];
      const texto = grupo.map((v) => (v <= 21 ? D.PASOS_T5_A2[v - 1] : D.CIERRE_T5_A2).texto).join(" ");
      assert.equal(caja.querySelector("[data-texto-paso]").textContent, texto, `texto, paso ${p}`);
      assert.equal(caja.querySelector("[data-pie]").textContent, p <= J.PASOS ? D.FUSION_T5_A2.pies[p - 1] : D.CIERRE_T5_A2.pie, `pie, paso ${p}`);
      assert.deepEqual(res(), [...new Set(grupo.flatMap((v) => RESALTADOS[v]))].sort(), `resaltados, paso ${p}`);
      if (p <= J.PASOS) assert.equal(caja.querySelector("[data-paso-de]").textContent, `Paso ${p} de 14`);
      if (p < J.CIERRE) await siguiente(caja);
    }
    assert.equal(caja.querySelector("[data-paso-de]").style.visibility, "hidden");
    desmontar();
  } finally {
    console.error = antes;
  }
  assert.deepEqual(avisos, [], "React no avisa (los pasos 7 y 17 dicen lo mismo: claves repetidas)");
});

/* Qué hecho va abierto en cada paso (los tramos de la v2 §4.1). */
const ABIERTO = (p) => (p <= 4 ? 0 : p <= 7 ? 1 : p <= 14 ? 2 : p <= 17 ? 3 : p <= 21 ? 4 : null);

test("★★★ los cinco hechos: uno abierto a la vez, los anteriores plegados con su resultado, los que no llegan no se ven; en el cierre, los cinco plegados", async () => {
  const { caja, desmontar } = await montar(h(TresMomentos));
  const H = D.ESCENA_T5_A2.hechos;
  for (let n = 1; n <= J.CIERRE; n++) {
    const p = J.viejo(n);
    const hechos = [...viva(caja).querySelectorAll("[data-hecho-t5]:not([data-futuro])")];
    const abierto = ABIERTO(p);
    assert.equal(hechos.length, abierto === null ? 5 : abierto + 1, `paso ${p}: hechos a la vista`);
    hechos.forEach((n, i) => {
      const plegado = abierto === null || i < abierto;
      assert.equal(n.dataset.plegado, plegado ? "si" : "no", `paso ${p}, hecho ${i + 1}`);
      assert.equal(n.firstElementChild.style.flexWrap, "wrap", "si no cabe, el resultado baja a una segunda fila");
      assert.equal(n.firstElementChild.style.rowGap, "2px", "con 2 px entre filas (53,08 a 320)");
      const cabecera = n.firstElementChild.textContent;
      assert.equal(cabecera, plegado ? `${H[i].fecha}${H[i].tipo}${H[i].plegado}` : `${H[i].fecha}${H[i].tipo}`, `paso ${p}, hecho ${i + 1}: lo que dice`);
    });
    if (n < J.CIERRE) await siguiente(caja);
  }
  desmontar();
});

/* Desde qué paso se ve cada pieza, dentro de su hecho (v2 §4.2). */
const APARECE = {
  efectivo: 1, titulos: 2, inversiones1: 3, bancos: 3, tasa: 4,
  primerInteres: 5, cuenta1: 6, caja1: 7, ingresos1: 7,
  vendidos: 8, precio1: 9, caja2: 10, sinInteres: 11, costo1: 12, inversiones2: 13, ganancia: 14,
  quedan: 15, cuenta2: 16, caja3: 17, ingresos2: 17,
  precio2: 18, recibe2: 19, costo2: 19, caja4: 20, inversiones3: 20, perdida: 21,
};
const HECHO = (id) => ABIERTO(APARECE[id]);

test("★★★ dentro del hecho abierto, cada pieza se ve desde su paso; antes ocupa su sitio invisible", async () => {
  const { caja, desmontar } = await montar(h(TresMomentos));
  for (let k = 1; k <= J.PASOS; k++) {
    const p = J.viejo(k);
    for (const [id, desde] of Object.entries(APARECE)) {
      const n = de(caja, id);
      if (HECHO(id) !== ABIERTO(p)) { assert.equal(n, null, `paso ${p}: ${id} no está (su hecho no va abierto)`); continue; }
      assert.equal(enSilueta(n), p < desde, `paso ${p}: ${id} ${p < desde ? "en silueta" : "a la vista"}`);
    }
    await siguiente(caja);
  }
  desmontar();
});

/* Los asientos: cada anotación con su cuenta, su monto y su cápsula (v2: los dos lados). */
const ASIENTOS = {
  inversiones1: ["Inversiones – títulos", "$2.000.000", "debe"], bancos: ["Bancos", "$2.000.000", "haber"],
  caja1: ["Caja", "$120.000", "debe"], ingresos1: ["Ingresos por intereses", "$120.000", "haber"],
  caja2: ["Caja", "$1.725.000", "debe"], inversiones2: ["Inversiones – títulos", "$1.500.000", "haber"],
  ganancia: ["Ingresos financieros – ganancia en venta de títulos", "$225.000 de diferencia", "haber"],
  caja3: ["Caja", "$30.000", "debe"], ingresos2: ["Ingresos por intereses", "$30.000", "haber"],
  caja4: ["Caja", "$468.750", "debe"], inversiones3: ["Inversiones – títulos", "$500.000", "haber"],
  perdida: ["Gastos financieros – pérdida en venta de títulos", "$31.250 de diferencia", "debe"],
};

test("★★★ cada asiento muestra sus dos lados: cuenta, monto y cápsula («se debita» teal, «se acredita» ámbar), sin atenuarse", async () => {
  const { caja, desmontar } = await montar(h(TresMomentos));
  const vistos = new Set();
  for (let k = 1; k <= J.PASOS; k++) {
    for (const [id, [cuenta, monto, lado]] of Object.entries(ASIENTOS)) {
      const n = de(caja, id);
      if (!n || n.style.visibility !== "visible") continue;
      vistos.add(id);
      const [nombre, mov] = n.querySelectorAll("p");
      assert.equal(nombre.textContent, cuenta, `${id}: la cuenta`);
      assert.equal(mov.firstElementChild.textContent, monto, `${id}: el monto`);
      const c = n.querySelector("[data-lado]");
      assert.equal(c.dataset.lado, lado, `${id}: el lado`);
      assert.equal(c.textContent, lado === "debe" ? "se debita" : "se acredita");
      assert.equal(c.style.background, rgb(lado === "debe" ? FAE.teal : FAE.ambar));
      assert.equal(c.style.color, rgb(FAE.bg), "la cápsula no se atenúa");
      assert.equal(c.parentElement.style.flexWrap, "wrap", "si no cabe junto al monto, la cápsula baja de línea (v2: 89,88 a 320)");
    }
    await siguiente(caja);
  }
  assert.deepEqual([...vistos].sort(), Object.keys(ASIENTOS).sort(), "se vieron los doce lados de los cinco asientos");
  desmontar();
});

test("★★★ lo que se ve: lo resaltado en claro sobre navy; lo demás y los hechos plegados, atenuados; en el cierre nada atenuado", async () => {
  const { caja, desmontar } = await montar(h(TresMomentos));
  for (let n = 1; n <= J.CIERRE; n++) {
    const p = J.viejo(n);
    for (const id of J.estadoPaso(n).resaltados) {
      assert.equal(de(caja, id).style.background, rgb(FAE.navy), `paso ${p}: ${id} con relleno navy`);
      assert.equal(colorVisto(de(caja, id).firstElementChild ?? de(caja, id)), rgb(FAE.text), `paso ${p}: ${id} en claro`);
    }
    for (const n of viva(caja).querySelectorAll('[data-plegado="si"]')) {
      assert.equal(colorVisto(n.querySelector("[data-resultado]")), rgb(p === 22 ? FAE.text : COLOR.apagado), `paso ${p}: hecho plegado`);
    }
    if (p === 13) assert.equal(colorVisto(de(caja, "vendidos")), rgb(COLOR.apagado), "control: lo no resaltado se atenúa");
    if (n < J.CIERRE) await siguiente(caja);
  }
  desmontar();
});

test("★★★ las cuentas: en el texto de los pasos 6 y 16 de antes (hoy 5 y 11, juntados con el siguiente) van enteras, sin partir; en la escena, un solo corte, antes de «=»", async () => {
  const { caja, desmontar } = await montar(h(TresMomentos));
  for (let k = 1; k <= nuevoDe(16); k++) {
    const grupo = D.FUSION_T5_A2.grupos[k - 1];
    const p = grupo.find((v) => v === 6 || v === 16) ?? grupo[0];
    const c = caja.querySelector("[data-texto-paso] [data-cuenta]");
    if (p === 6 || p === 16) {
      assert.equal(c.textContent, p === 6 ? "2.000.000 × 0,24 × 3/12 = $120.000" : "500.000 × 0,24 × 3/12 = $30.000");
      assert.equal(c.style.whiteSpace, "nowrap");
      assert.equal(caja.querySelector("[data-texto-paso]").textContent, grupo.map((v) => D.PASOS_T5_A2[v - 1].texto).join(" "), "el texto sigue literal");
      const n = de(caja, p === 6 ? "cuenta1" : "cuenta2");
      assert.deepEqual([...n.children].map((s) => [s.textContent, s.style.whiteSpace]),
        (p === 6 ? D.ESCENA_T5_A2.cuenta1 : D.ESCENA_T5_A2.cuenta2).map((t) => [t, "nowrap"]));
    } else {
      assert.equal(c, null, `paso ${p}: sin cuenta`);
    }
    await siguiente(caja);
  }
  desmontar();
});

test("★★★ la escena reserva el alto: los cinco hechos abiertos al final de su tramo, en la misma celda, invisibles y sin resaltar", async () => {
  const { caja, desmontar } = await montar(h(TresMomentos));
  const escena = caja.querySelector("[data-escena]");
  assert.equal(escena.style.display, "grid");
  const capas = [...escena.children];
  assert.equal(capas.length, 6);
  for (const c of capas) assert.equal(c.style.gridArea, "1 / 1");
  const reservas = capas.filter((c) => c.hasAttribute("data-reserva"));
  assert.equal(reservas.length, 5);
  reservas.forEach((r, k) => {
    assert.equal(r.style.opacity, "0");
    const hechos = [...r.querySelectorAll("[data-hecho-t5]")];
    assert.equal(hechos.length, k + 1);
    assert.deepEqual(hechos.map((n) => n.dataset.plegado), [...Array(k).fill("si"), "no"], `reserva ${k + 1}: abierto el último`);
    assert.ok([...r.querySelectorAll("[style]")].every((n) => n.style.visibility !== "hidden"), `reserva ${k + 1}: todo ocupa su sitio`);
    assert.equal(r.querySelectorAll('[data-resaltado="si"]').length, 0);
  });
  desmontar();
});

test("★★ «Reproducir»: 3 000 + 450 ms por palabra; la tabla de la v2b y sus 182,1 s", () => {
  const ms = Array.from({ length: 21 }, (_, k) => E.duracionPasoT5A2(k + 1));
  assert.deepEqual(ms, [9750, 6150, 8850, 9300, 6600, 6600, 8400, 7050, 7050, 6600, 7950, 5250, 6600, 14250, 8850, 6600, 8400, 6600, 6150, 10650, 12000]);
  /* Los 182,1 s de Mai cuentan también el cierre (21 palabras: 12 450 ms). */
  assert.equal(E.duracionPasoT5A2(22), 12450);
  assert.equal(ms.reduce((a, b) => a + b, 0) + E.duracionPasoT5A2(22), 182100);
});

/* ═══════════ CAPA 3 ═══════════ */

test("★★★ capa 3: las dos ventas se ven iguales, con lo que costó y a cuánto se vende (C1-2); cada una revela lo suyo con su pie; el final, con las dos decididas", async () => {
  const { caja, desmontar } = await montar(h(DosVentas));
  assert.equal(caja.querySelector("p").textContent, D.CONSIGNA_CAPA_3_T5_A2);
  const cajas = [...caja.querySelectorAll("[data-hecho]")];
  assert.deepEqual(cajas.map((c) => c.querySelector("button span span").textContent), ["Venta A", "Venta B"]);
  assert.deepEqual(D.VENTAS_T5_A2.map((v) => v.cifras), [["Costó $650 cada uno", "Se vende a $690"], ["Costó $1.150 cada uno", "Se vende a $1.060"]]);
  assert.deepEqual(D.VENTAS_T5_A2.map((v) => v.pie), ["Escenario simulado", "Escenario simulado"]);
  assert.deepEqual(cajas.map((c) => [...c.querySelectorAll("[data-cifras] span")].map((s) => s.textContent)), D.VENTAS_T5_A2.map((v) => v.cifras));
  assert.equal(cajas[0].getAttribute("style"), cajas[1].getAttribute("style"), "las dos cajas iguales");
  assert.equal(cajas[0].querySelector("button").getAttribute("style"), cajas[1].querySelector("button").getAttribute("style"));
  const lectura = (n) => [...n.querySelectorAll("p:not([data-pie])")].map((p) => p.textContent).join("");
  for (const [k, v] of D.VENTAS_T5_A2.entries()) {
    assert.equal(cajas[k].querySelectorAll("svg").length, 1, "cerrada, con su chevrón");
    await decidir(tocar, caja.querySelector(`[data-hecho="${v.id}"]`), v.correcta);
    assert.equal(cajas[k].querySelectorAll("svg").length, 1, "decidida, con su chevrón girado (hoja 6)");
    assert.equal(lectura(caja.querySelector(`[data-revela="${v.id}"]`)), v.revela);
    assert.equal(caja.querySelector(`[data-revela="${v.id}"] [data-pie]`).textContent, v.pie);
    assert.equal(lectura(caja.querySelector("[data-final]")), k === 0 ? "" : D.FINAL_CAPA_3_T5_A2.texto);
  }
  assert.equal(caja.querySelector("[data-final] [data-pie]").textContent, D.FINAL_CAPA_3_T5_A2.pie);
  desmontar();
});

/* ═══════════ CAPA 4 ═══════════ */

test("★★★ capa 4: UnaFrase con la pregunta, cuatro opciones, una sola correcta («lo que costaron los 260 títulos», C1-3) y la devolución de cada una; su pie debajo", async () => {
  assert.deepEqual(D.OPCIONES_FINAL_T5_A2.filter((o) => o.correcta).map((o) => o.texto), ["Por $221.000, lo que costaron los 260 títulos."]);
  const { Capa4 } = ESCENAS_TEMA5[D.PIEZA_TRES_MOMENTOS.id];
  const { caja, desmontar } = await montar(h(Capa4));
  assert.ok(caja.textContent.startsWith(D.PREGUNTA_FINAL_T5_A2));
  assert.equal([...caja.querySelectorAll("[data-pie]")].at(-1).textContent, "Escenario simulado");
  for (const o of D.OPCIONES_FINAL_T5_A2) {
    assert.equal(caja.querySelector(`[data-opcion="${o.id}"]`).textContent, o.texto);
    await tocar(caja.querySelector(`[data-opcion="${o.id}"]`));
    assert.equal(caja.querySelector("[data-devolucion]").textContent, o.feedback);
    assert.equal(caja.querySelector("[data-devolucion]").dataset.devolucion, o.correcta ? "correcta" : "incorrecta");
    await tocar(caja.querySelector("[data-otra-vez]"));
  }
  desmontar();
});

test("★★ identificadores nuevos con b5-", () => {
  assert.match(D.PIEZA_TRES_MOMENTOS.id, /^b5-t5-a2-/);
  for (const o of D.OPCIONES_FINAL_T5_A2) assert.match(o.id, /^b5-t5-a2-/);
});

/* D12 (Sakuta, #222): lo que está en silueta no lo lee el lector ni se enfoca; lo que llega, ya no lleva esa marca. */
const MUDOS = '[style*="--b5-silueta"], [data-futuro], [data-silueta-futura]';
const callado = (n) => n.closest('[aria-hidden="true"]') !== null;
const marcaPropia = (n) => n.getAttribute("aria-hidden") === "true" && n.hasAttribute("inert");
test("★★★ D12: en el paso 1 ninguna silueta es legible ni enfocable; en el paso 2, lo que llegó pierde la marca", async () => {
  const { caja, desmontar } = await montar(h(TresMomentos));
  const siluetas = [...caja.querySelectorAll(MUDOS)];
  assert.ok(siluetas.length > 0, "hay siluetas en el paso 1");
  for (const n of siluetas) {
    assert.ok(callado(n), "aria-hidden en ella o en un ancestro");
    assert.ok(marcaPropia(n), "y su propia marca: aria-hidden e inert, aunque la escena cambie");
  }
  const vivas = () => [...viva(caja).querySelectorAll("[data-elemento]")];
  const antes = new Set(vivas().filter((n) => enSilueta(n)));
  await siguiente(caja);
  const llegaron = vivas().filter((n) => antes.has(n) && !enSilueta(n));
  assert.ok(llegaron.length > 0, "algo llegó en el paso 2");
  for (const n of llegaron) {
    assert.equal(n.hasAttribute("inert"), false, `${n.dataset.elemento}: sin inert`);
    assert.equal(n.getAttribute("aria-hidden"), null, `${n.dataset.elemento}: sin su aria-hidden`);
    assert.equal(n.closest("[data-b5-mudo]"), null, `${n.dataset.elemento}: ni un ancestro en silueta`);
  }
  for (const n of caja.querySelectorAll(MUDOS)) assert.ok(marcaPropia(n), "lo que sigue en silueta, callado");
  desmontar();
});
