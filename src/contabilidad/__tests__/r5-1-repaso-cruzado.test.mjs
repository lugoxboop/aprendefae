import { test, afterEach } from "node:test";
import assert from "node:assert/strict";
import { readFileSync, readdirSync } from "node:fs";
import { JSDOM, VirtualConsole } from "jsdom";

/*
 * ═══════════════════════════════════════════════════════════════════════════
 * r5-1 «Repaso cruzado» v2 (Célula E) — «Lo que Ippo tiene que probar» del
 * paquete e5-r5-1-v2 (v2.2), cada prueba rota a propósito una vez:
 *
 *    1. cobertura de pantalla (E1): cada texto sale en el DOM en algún estado
 *    2. cada texto de los datos está, literal, en el paquete
 *    3. las claves y las cifras, CALCULADAS aquí desde los datos
 *    4. pantalla 3: la lata nueva antes de tiempo no vende; la tabla, tras la cuarta
 *    5. pantalla 4: contador, «Revisar», regla de prioridad, palabras, relleno, teclado
 *    6. pantallas 1, 2 y 6: la figura reproduce la elegida y, si falló, la correcta
 *    7. B4: ningún estado de calificación en teal ni ámbar
 *    8. teclado: latas, fichas y lotes alcanzables y accionables
 *    9. reduced-motion y el toque que salta
 *   10. FP de 0 a 6 aciertos con calcularFP
 *   11. (Chromium: scripts/e5/medir-r5-1.mjs)
 *   12. INFLESZ ≥ 65 con guarda de recorrido
 *
 * y lo de v1 que sigue valiendo: el barajado con semilla, las dos puertas, la
 * etiqueta docente, los puntos del final por forma, la pista a pedido, la
 * portada y el título del tema.
 *
 * Se juega con reduced-motion (estado final directo) salvo en las pruebas que
 * miran el movimiento, que lo apagan.
 * ═══════════════════════════════════════════════════════════════════════════
 */

const dom = new JSDOM("<!doctype html><html><body></body></html>", { url: "http://localhost/", virtualConsole: new VirtualConsole() });
const w = dom.window;
const MOVIMIENTO = { reducido: true };
w.matchMedia = (q) => ({ matches: MOVIMIENTO.reducido && /reduce/.test(q), addEventListener() {}, removeEventListener() {}, addListener() {}, removeListener() {} });
const DESPLAZAMIENTOS = [];
w.scrollTo = (...args) => { DESPLAZAMIENTOS.push(args); };
for (const [k, v] of Object.entries({
  window: w, document: w.document, navigator: w.navigator, localStorage: w.localStorage,
  HTMLElement: w.HTMLElement, Element: w.Element, Node: w.Node, SVGElement: w.SVGElement,
  Event: w.Event, MouseEvent: w.MouseEvent, KeyboardEvent: w.KeyboardEvent,
  getComputedStyle: w.getComputedStyle.bind(w), matchMedia: w.matchMedia,
  requestAnimationFrame: (fn) => setTimeout(() => fn(performance.now()), 0),
  cancelAnimationFrame: (id) => clearTimeout(id),
})) {
  Object.defineProperty(globalThis, k, { value: v, configurable: true, writable: true });
}
globalThis.IS_REACT_ACT_ENVIRONMENT = true;

const React = await import("react");
const { createRoot } = await import("react-dom/client");
const act = React.act;
const h = React.createElement;

const D = await import("../../data/repasoCap5Cruzado.js");
const { SUBJECTS, HACER, actividadesDeTipo } = await import("../../data/subjects.js");
const { JUEGOS_REPASO_CAP5, TEMA_REPASO_CAP5, RepasoCruzado } = await import("../../components/RepasoCapitulo5View.jsx");
const { inflesz, palabrasDe, UMBRAL } = await import("../../herramientas/inflesz.js");
const { etiquetaDeItem, hayReglaPara } = await import("../../docente/etiquetasItem.js");
const { pesos } = await import("../../data/contabilidad.js");
const { recibidoDeFlujo } = await import("../../components/repasoCap5/Flujos.jsx");

const RAIZ = new URL("../../../", import.meta.url);
const leer = (f) => readFileSync(new URL(f, RAIZ), "utf8");
const PAQUETE = leer("orquestador/conocimiento/paquetes/e5-r5-1-v2.md");
const PAQUETE_V1 = leer("orquestador/conocimiento/paquetes/e5-r5-1-v1.md");
const P = D.PANTALLAS_R5_1;
const I = D.INTERFAZ_R5_1;
const pantalla = (id) => P.find((x) => x.id === id);
const clave = (p) => p.opciones.find((o) => o.correcta);
const espera = (ms) => new Promise((r) => setTimeout(r, ms));
/*
 * Deja pasar el tiempo FUERA de act: dentro, React guarda las actualizaciones
 * de los temporizadores hasta el final y una cadena de pasos no avanza.
 */
const pasar = async (ms) => { await espera(ms); await act(async () => {}); };

/* Lo montado se desmonta siempre, aunque la prueba falle a medias. */
const montados = [];
afterEach(() => {
  while (montados.length) montados.pop()();
  MOVIMIENTO.reducido = true;
});
const montar = async (el) => {
  const caja = document.createElement("div");
  document.body.appendChild(caja);
  const raiz = createRoot(caja);
  await act(async () => { raiz.render(el); });
  let vivo = true;
  const desmontar = () => { if (!vivo) return; vivo = false; act(() => raiz.unmount()); caja.remove(); };
  montados.push(desmontar);
  return { caja, desmontar };
};
const tocar = async (el) => {
  assert.ok(el, "no está el elemento que se quería tocar");
  await act(async () => { el.dispatchEvent(new w.MouseEvent("click", { bubbles: true })); });
};
const tecla = async (el, key) => {
  await act(async () => { el.dispatchEvent(new w.KeyboardEvent("keydown", { key, bubbles: true })); });
};
const opcion = (caja, id) => caja.querySelector(`[data-opcion="${id}"] button`);
const siguiente = (caja) => tocar(caja.querySelector("[data-siguiente]"));

/* La clasificación correcta de la pantalla 4, desde los signos. */
const CLAVE_C8 = Object.fromEntries(pantalla("c8").datos.map((d) => [d.id, d.signo === "+" ? "suma" : d.signo === "−" ? "resta" : "fuera"]));

/*
 * Responde la pantalla actual. `eleccion`: el id de la opción, o en la 4 una
 * clasificación entera. En la 3 vende antes las cuatro latas; en la 5 vacía
 * antes los tres lotes (con reduced-motion, la salida es directa).
 */
async function responder(caja, p, eleccion) {
  if (p.forma === "latas") {
    for (let k = 0; k < p.vender; k++) await tocar(caja.querySelector(`[data-lata="primera-${k}"]`));
  }
  if (p.forma === "lotes") {
    for (let k = 1; k <= p.lotes.length; k++) await tocar(caja.querySelector(`[data-lote="${k}"]`));
  }
  if (p.forma === "fichas") {
    for (const [f, b] of Object.entries(eleccion)) await tocar(caja.querySelector(`[data-ficha="${f}"] [data-boton="${b}"]`));
    await tocar(caja.querySelector("[data-revisar]"));
    return;
  }
  await tocar(opcion(caja, eleccion));
}
const bienDe = (p) => (p.forma === "fichas" ? CLAVE_C8 : clave(p).id);

/* Avanza hasta la pantalla `id` acertando las de antes. */
async function irA(caja, id) {
  for (const p of P) {
    if (p.id === id) return;
    await responder(caja, p, bienDe(p));
    await siguiente(caja);
  }
}

/* ═══════════ LO QUE LEE EL ESTUDIANTE, SACADO DE LOS DATOS ═══════════ */

/* El contenido de Miyata: lo que el estudiante lee y no es un rótulo de interfaz. */
function contenido() {
  const t = [];
  for (const p of P) {
    t.push(p.enunciado, p.pista);
    if (p.pregunta) t.push(p.pregunta, p.mensaje, ...p.columnas);
    for (const o of p.opciones ?? []) {
      t.push(o.retro);
      if (o.texto) t.push(o.texto);
      if (o.asiento) t.push(...D.renglonesDeAsiento(o.asiento));
      if (o.celdas) t.push(...o.celdas);
    }
    for (const d of p.datos ?? []) t.push(d.etiqueta);
    for (const f of p.fallas ?? []) t.push(f.retro);
    if (p.acierto) t.push(p.acierto);
    for (const l of p.lotes ?? []) t.push(l.marca);
    for (const c of p.mayor ?? []) t.push(c.nombre);
  }
  return t;
}

/* Los rótulos fijos de interfaz de v2 (§ «Rótulos fijos de interfaz»). */
const c9 = D.cuentaDeC9(pantalla("c9"));
const ROTULOS = [
  I.hoy, I.vencimiento, I.pagas, I.recibes, I.tuGanancia, I.leyendaMayor, I.debe, I.haber, I.sinSaldo,
  I.marcaCompra("PRIMERA COMPRA", 10), I.marcaCompra("SEGUNDA COMPRA", 14), I.vendidas, I.costoVendido, I.enBodega,
  D.CMV, I.estanteComun, I.salenQuedan(pantalla("c9").vendidas, c9.quedan), I.enLaFigura,
  I.correcta, I.incorrecta, I.eraEsta, I.bien, I.era.resta, I.era.suma, I.era.fuera, I.suma, I.resta, I.noEntra,
  I.revisar, I.verPista, I.hayMas, I.conUeps, I.costoTotal, I.unidades, I.costoUnidad,
];

/* ═══════════ 2 · CADA TEXTO, LITERAL, EN EL PAQUETE ═══════════ */

/* El paquete parte renglones: se compara con los espacios normalizados. */
const plano = (s) => s.replace(/\s+/g, " ");
const V2 = plano(PAQUETE);
const escapar = (t) => t.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
/* Entero, no un trozo: con borde de celda, de rótulo o de lista a cada lado. */
const entero = (texto, t) => new RegExp(`(?:^|[|:·«(/] |\\*\\* |«)${escapar(t)}(?: [|·/]|»| \\(|\\)|\\n|$)`, "m").test(texto);
/* Los nombres del mayor los escribe el paquete con su saldo detrás: «Nombre (…». */
const delMayor = new Set(P.flatMap((p) => (p.mayor ?? []).map((c) => c.nombre)));

test("★★★ 2 · cada texto de los datos está, letra por letra, en el paquete v2 (guarda: 91 textos y 35 rótulos)", () => {
  const textos = contenido();
  assert.equal(textos.length, 91, "no recorrió los textos que dice recorrer");
  /* Los rótulos de los lotes los conserva v2 de v1.3 («la marca «Lote n · …» de v1.3»). */
  const lotes = pantalla("c9").lotes.map((l) => l.marca);
  const fuera = textos.filter((t) => !lotes.includes(t) && !(delMayor.has(t) ? V2.includes(`${t} (`) : entero(V2, t) || entero(PAQUETE, t)));
  assert.deepEqual(fuera, [], `no están en el paquete: ${fuera.join(" | ")}`);
  for (const l of pantalla("c9").lotes) assert.ok(PAQUETE_V1.includes(`| ${l.marca} | ${I.unidadesACosto(l.unidades, l.costo)} | ${l.unidades / D.UNIDADES_POR_CAJA} |`), l.marca);
  /* Las opciones de asiento, en el renglón del paquete: «Debita … / Acredita …». */
  for (const p of [pantalla("c5"), pantalla("c10")]) {
    for (const o of p.opciones) assert.ok(V2.includes(`| ${D.renglonesDeAsiento(o.asiento).join(" / ")} |`), o.id);
  }
  /* Las celdas de la tabla, fila por fila. */
  for (const o of pantalla("c6").opciones) assert.ok(V2.includes(`| ${o.celdas.join(" · ")} |`), o.id);
  /* Los rótulos fijos, en su sección. */
  const seccion = plano(PAQUETE.slice(PAQUETE.indexOf("### Rótulos fijos de interfaz"), PAQUETE.indexOf("## Contenido (Miyata)")));
  assert.equal(ROTULOS.length, 35);
  const sinRotulo = ROTULOS.filter((t) => !t.split(" · ").every((parte) => seccion.includes(parte)));
  assert.deepEqual(sinRotulo, [], `rótulos que no están: ${sinRotulo.join(" | ")}`);
  /* Lo que v2 conserva de v1.3, en la tabla de v1.3. */
  const v13 = PAQUETE_V1.slice(PAQUETE_V1.indexOf("## v1.3 · textos nuevos"));
  for (const t of [I.marcaPista, I.marcaPortada, I.portada, I.verPista]) assert.ok(v13.includes(`| ${t} |`), t);
  for (const t of ["PREGUNTA n DE 6", "«Siguiente»", "«POR TEMA»"]) assert.ok(PAQUETE_V1.includes(t), t);
  /* Los datos de la célula (decisión 8), como los escribe el paquete. */
  for (const t of ["Cuentas por cobrar – clientes $10.000.000", "Provisión $500.000", "castigo $300.000", "($10 y $14)", "inventario de $800.000"]) assert.ok(V2.includes(t), t);
  assert.equal(pantalla("c5").mayor[0].saldo, 10000000);
  assert.equal(pantalla("c5").mayor[1].saldo, 500000);
  assert.equal(pantalla("c5").valor, 300000);
  assert.equal(pantalla("c10").mayor[0].saldo, 800000);
  assert.deepEqual(pantalla("c6").compras.map((c) => c.precio), [10, 14]);
  /* Las cifras de la pantalla 4, en la clave. */
  for (const d of pantalla("c8").datos) assert.ok(V2.includes(`${d.etiqueta} ${pesos(d.valor)}`), d.etiqueta);
  /* Las opciones de la 5. */
  assert.ok(V2.includes(`Opciones ${pantalla("c9").opciones.map((o) => pesos(o.valor)).join(", ")}.`));
});

/* ═══════════ 3 · LAS CLAVES Y LAS CIFRAS, CALCULADAS AQUÍ ═══════════ */

test("★★★ 3 · seis pantallas en el orden del libro; una sola clave en las de opciones; la 4 se califica por clasificación", () => {
  assert.deepEqual(P.map((p) => p.ejercicio), ["C.3", "C.5", "C.6", "C.8", "C.9", "C.10"]);
  assert.deepEqual(P.map((p) => p.forma), ["flujos", "asiento", "latas", "fichas", "lotes", "asiento"]);
  assert.deepEqual(P.map((p) => p.subtema), ["inversiones", "cartera", "inventarios", "inventarios", "inventarios", "inventarios"]);
  let conOpciones = 0;
  for (const p of P.filter((x) => x.opciones)) {
    conOpciones++;
    assert.equal(p.opciones.length, 4, p.id);
    assert.equal(p.opciones.filter((o) => o.correcta).length, 1, `${p.id}: una sola clave`);
    assert.equal(new Set(p.opciones.map((o) => o.retro)).size, 4, `${p.id}: dos devoluciones iguales`);
    for (const o of p.opciones) assert.equal(D.evaluarR5_1(p, o.id).ok, Boolean(o.correcta));
  }
  assert.equal(conOpciones, 5);
  assert.equal(pantalla("c8").opciones, undefined, "las cuatro cifras de opción de v1 desaparecen (decisión 5)");
  assert.deepEqual(P.filter((p) => p.opciones).map((p) => clave(p).id), ["c3-c", "c5-c", "c6-c", "c9-d", "c10-c"]);
});

test("★★★ 3 · pantallas 2 y 6: los saldos de las cuatro opciones, calculados a mano y comparados con el paquete", () => {
  /* Pantalla 2: castigo de 300.000. */
  const c5 = pantalla("c5");
  const [cartera, provision] = c5.mayor.map((c) => c.saldo);
  const v = c5.valor;
  const por = (p, id) => {
    const o = p.opciones.find((x) => x.id === id);
    return Object.fromEntries(D.mayorTrasAsiento(p.mayor, o.asiento, p.valor).filter((c) => c.saldoNuevo).map((c) => [c.nombre, [c.saldoNuevo.valor, c.saldoNuevo.lado]]));
  };
  assert.deepEqual(por(c5, "c5-c"), { [D.CLIENTES]: [cartera - v, "debe"], [D.PROVISION]: [provision - v, "haber"] });
  assert.deepEqual(por(c5, "c5-a"), { [D.CLIENTES]: [cartera - v, "debe"], [D.GASTO]: [v, "debe"] });
  assert.deepEqual(por(c5, "c5-b"), { [D.PROVISION]: [provision + v, "haber"], [D.GASTO]: [v, "debe"] });
  assert.deepEqual(por(c5, "c5-d"), { [D.CLIENTES]: [cartera + v, "debe"], [D.GASTO]: [v, "haber"] });
  /* Las cifras que escribe el paquete. */
  assert.deepEqual([cartera - v, provision - v, provision + v, cartera + v], [9700000, 200000, 800000, 10300000]);
  /* En la buena el gasto no se toca: sigue sin saldo. */
  const gasto = D.mayorTrasAsiento(c5.mayor, clave(c5).asiento, v).find((c) => c.nombre === D.GASTO);
  assert.equal(gasto.entra, null);
  assert.equal(gasto.saldo, 0);

  /* Pantalla 6: sale el inventario inicial de 800.000. */
  const c10 = pantalla("c10");
  const inv = c10.mayor[0].saldo;
  assert.equal(c10.valor, inv);
  assert.deepEqual(por(c10, "c10-c"), { [D.INVENTARIO]: [0, "debe"], [D.GYP]: [inv, "debe"] });
  assert.deepEqual(por(c10, "c10-a"), { [D.INVENTARIO]: [2 * inv, "debe"], [D.GYP]: [inv, "haber"] });
  assert.deepEqual(por(c10, "c10-b"), { [D.INVENTARIO]: [2 * inv, "debe"], [D.CMV]: [inv, "haber"] });
  assert.deepEqual(por(c10, "c10-d"), { [D.INVENTARIO]: [0, "debe"], [D.CMV]: [inv, "debe"] });
  /* (b) y (d): Costo de mercancía vendida aparece al final del mayor. */
  for (const id of ["c10-b", "c10-d"]) {
    const cuentas = D.mayorTrasAsiento(c10.mayor, c10.opciones.find((o) => o.id === id).asiento, inv);
    assert.equal(cuentas.at(-1).nombre, D.CMV, id);
    assert.equal(cuentas.at(-1).nueva, true, id);
  }
  for (const id of ["c10-a", "c10-c"]) assert.equal(D.mayorTrasAsiento(c10.mayor, c10.opciones.find((o) => o.id === id).asiento, inv).length, 2, id);
});

test("★★★ 3 · las latas: PEPS 40 / 56 y UEPS 56 / 40, calculados desde las compras; y los flujos de la pantalla 1", () => {
  const p = pantalla("c6");
  const [vieja, nueva] = p.compras;
  /* A mano: se venden 4; con PEPS salen las cuatro de $10, con UEPS las cuatro de $14. */
  const total = vieja.latas * vieja.precio + nueva.latas * nueva.precio;
  assert.equal(total, 96);
  assert.deepEqual(D.costoDeLatas(p.compras, p.vender), { costo: p.vender * vieja.precio, bodega: total - p.vender * vieja.precio, total });
  assert.deepEqual(D.costoDeLatas(p.compras, p.vender, "UEPS"), { costo: p.vender * nueva.precio, bodega: total - p.vender * nueva.precio, total });
  assert.deepEqual([p.vender * vieja.precio, nueva.latas * nueva.precio, p.vender * nueva.precio, vieja.latas * vieja.precio], [40, 56, 56, 40]);
  /* Pantalla 1: (a) y (d) pagan 56 y reciben 12 + 12 + 12 + (12 + 56) = 104; (c) recibe 80. */
  const c3 = pantalla("c3");
  const flujo = (l) => c3.opciones.find((o) => o.id === `c3-${l}`).flujo;
  assert.equal(recibidoDeFlujo(flujo("a")), 12 + 12 + 12 + (12 + 56));
  assert.equal(recibidoDeFlujo(flujo("a")), 104);
  assert.deepEqual(flujo("d"), flujo("a"), "(d) idéntica a (a): ese parecido es lo que la pantalla enseña");
  assert.equal(recibidoDeFlujo(flujo("c")), 80);
  assert.deepEqual(flujo("b").periodos, [[32], [64], [24], [48]]);
  assert.equal(flujo("b").vence, false);
  for (const l of "abcd") assert.equal(flujo(l).pagas, 56);
});

test("★★★ 3 · la clasificación da 3.400 = 500 + 4.000 − 300 − 800, y el contador sigue cada ficha", () => {
  const p = pantalla("c8");
  const v = Object.fromEntries(p.datos.map((d) => [d.etiqueta, d.valor]));
  const esperado = v["Inventario inicial"] + v.Compras - v["Devoluciones de compras"] - v["Inventario final"];
  assert.equal(esperado, 3400);
  assert.equal(D.contadorDeC8(p, CLAVE_C8), esperado);
  assert.equal(D.cuentaDeC8(p), esperado);
  assert.deepEqual(CLAVE_C8, { ventas: "fuera", "devoluciones-ventas": "fuera", "inventario-inicial": "suma", compras: "suma", "devoluciones-compras": "resta", "inventario-final": "resta" });
  assert.equal(D.contadorDeC8(p, {}), 0);
  assert.equal(D.contadorDeC8(p, { ventas: "suma", "inventario-final": "resta" }), v.Ventas - v["Inventario final"]);
});

/* Las seis maneras de vaciar tres lotes. */
const ORDENES = [[0, 1, 2], [0, 2, 1], [1, 0, 2], [1, 2, 0], [2, 0, 1], [2, 1, 0]];

test("★★★ 3 · los acumulados de Costo total y Unidades en los seis órdenes; el final siempre $5.260 · 250 u; $526", () => {
  const p = pantalla("c9");
  let ordenes = 0;
  for (const orden of ORDENES) {
    ordenes++;
    /* A mano, lote por lote. */
    let costo = 0;
    let u = 0;
    const esperado = orden.map((k) => { costo += p.lotes[k].unidades * p.lotes[k].costo; u += p.lotes[k].unidades; return { costo, unidades: u }; });
    assert.deepEqual(D.acumuladosDeC9(p, orden), esperado, orden.join("-"));
    assert.deepEqual(D.acumuladosDeC9(p, orden).at(-1), { costo: 5260, unidades: 250 });
  }
  assert.equal(ordenes, 6);
  assert.deepEqual(D.acumuladosDeC9(p, [0, 1, 2]).map((x) => [x.costo, x.unidades]), [[1260, 70], [3260, 170], [5260, 250]]);
  assert.deepEqual(D.acumuladosDeC9(p, [2, 1, 0]).map((x) => [x.costo, x.unidades]), [[2000, 80], [4000, 180], [5260, 250]]);
  /* La división la hace el estudiante: 5.260 / 250 = 21,04; quedan 25; 25 × 21,04 = 526. */
  assert.equal(5260 / 250, 21.04);
  assert.equal(D.pesosConCentavos(c9.promedio), "$21,04");
  assert.equal(c9.quedan, 250 - p.vendidas);
  assert.equal(c9.valor, 526);
  assert.equal(clave(p).valor, c9.valor);
  const precios = p.lotes.map((l) => l.costo);
  const valor = (l) => p.opciones.find((o) => o.id === `c9-${l}`).valor;
  assert.deepEqual([valor("a"), valor("b"), valor("c")], [c9.quedan * precios[2], c9.quedan * precios[0], c9.quedan * (precios.reduce((s, x) => s + x, 0) / 3)]);
});

test("★★★ 3 · $21,04 sale solo después de responder, entre las opciones y la devolución; los rótulos acumulan en la pantalla", async () => {
  for (const orden of [[1, 2, 3], [3, 2, 1]]) {
    const { caja, desmontar } = await montar(h(RepasoCruzado, { pantallas: [pantalla("c9")] }));
    const valor = (id) => caja.querySelector(`[data-rotulo-lotes="${id}"]`).dataset.valor;
    assert.deepEqual([valor("costo"), valor("unidades")], ["vacio", "vacio"]);
    assert.ok(caja.querySelector('[data-rotulo-lotes="costo"]').textContent.endsWith("—"));
    const vistos = [];
    for (const k of orden) {
      await tocar(caja.querySelector(`[data-lote="${k}"]`));
      vistos.push([valor("costo"), valor("unidades")]);
    }
    const esperado = D.acumuladosDeC9(pantalla("c9"), orden.map((k) => k - 1)).map((x) => [String(x.costo), String(x.unidades)]);
    assert.deepEqual(vistos, esperado);
    assert.equal(caja.querySelector('[data-rotulo-lotes="costo"]').textContent, "Costo total$5.260");
    /* La figura NO hace la división: antes de responder, ni 21,04 ni «Costo de cada unidad». */
    assert.equal(caja.textContent.includes("21,04"), false);
    assert.equal(caja.textContent.includes(I.costoUnidad), false);
    assert.equal(caja.querySelector("[data-salen-quedan]").textContent, "Salen 225 u · Quedan 25 u");
    await tocar(opcion(caja, "c9-b"));
    const fila = caja.querySelector("[data-costo-unidad]");
    assert.equal(fila.textContent, "Costo de cada unidad · $21,04");
    const ultimaOpcion = [...caja.querySelectorAll("[data-opcion]")].at(-1);
    assert.ok(ultimaOpcion.compareDocumentPosition(fila) & w.Node.DOCUMENT_POSITION_FOLLOWING, "después de las opciones");
    assert.ok(fila.compareDocumentPosition(caja.querySelector("[data-devolucion]")) & w.Node.DOCUMENT_POSITION_FOLLOWING, "antes de la devolución");
    desmontar();
  }
});

/* ═══════════ 4 · PANTALLA 3: LAS LATAS ═══════════ */

test("★★★ 4 · la lata nueva antes de tiempo no vende, saca el mensaje y no califica; la tabla sale solo tras la cuarta", async () => {
  const fin = [];
  const p = pantalla("c6");
  const { caja } = await montar(h(RepasoCruzado, { pantallas: [p], onCompletar: (...x) => fin.push(x) }));
  const vendidas = () => Number(caja.querySelector("[data-figura='latas']").dataset.vendidas);
  const barra = (id) => Number(caja.querySelector(`[data-barra-latas="${id}"] [data-valor-barra]`).dataset.valorBarra);
  const mensaje = () => caja.querySelector("[data-mensaje-latas]").textContent;
  assert.deepEqual([barra("costo"), barra("bodega")], [0, 96]);
  assert.equal(mensaje(), "");
  /* Una de la segunda compra antes de tiempo. */
  await tocar(caja.querySelector('[data-lata="segunda-2"]'));
  assert.equal(vendidas(), 0);
  assert.equal(mensaje(), p.mensaje);
  assert.equal(caja.querySelector('[data-lata="segunda-2"]').dataset.vendida, "no");
  assert.deepEqual([barra("costo"), barra("bodega")], [0, 96]);
  assert.equal(caja.querySelector("[data-devolucion]").dataset.devolucion, "vacia", "no califica");
  assert.equal(Boolean(caja.querySelector("[data-tabla-latas]")), false);
  /* Las cuatro de la primera, en cualquier orden: costo +10 y bodega −10 cada vez. */
  let k = 0;
  for (const n of [2, 0, 3, 1]) {
    await tocar(caja.querySelector(`[data-lata="primera-${n}"]`));
    k++;
    assert.equal(vendidas(), k);
    assert.equal(mensaje(), "", "al vender bien se va el mensaje");
    assert.deepEqual([barra("costo"), barra("bodega")], [10 * k, 96 - 10 * k]);
    assert.ok(caja.querySelector(`[data-en-bandeja="primera-${n}"]`), "la lata vendida está en la bandeja");
    assert.equal(Boolean(caja.querySelector("[data-tabla-latas]")), k === 4, `tras ${k}`);
    assert.equal(Boolean(caja.querySelector("[data-marca-ueps]")), k === 4);
  }
  /* Las marcas de UEPS: 56 en el costo, 40 en la bodega; «Con UEPS» una vez. */
  assert.deepEqual([...caja.querySelectorAll("[data-marca-ueps]")].map((m) => m.dataset.marcaUeps), ["56", "40"]);
  assert.equal(caja.querySelectorAll("[data-rotulo-ueps]").length, 1);
  assert.equal(caja.querySelector('[data-barra-latas="costo"] [data-rotulo-ueps]').textContent, "Con UEPS");
  assert.equal(caja.querySelector("[data-pregunta-tabla]").textContent, p.pregunta);
  /* Ya no se vende más. */
  assert.ok([...caja.querySelectorAll("[data-lata]")].every((b) => b.disabled));
  assert.equal(fin.length, 0);
  /* Solo la tabla califica. */
  await tocar(opcion(caja, "c6-a"));
  assert.equal(caja.querySelector("[data-devolucion]").dataset.devolucion, "error");
  assert.equal(opcion(caja, "c6-c").dataset.estado, "revelada");
  await siguiente(caja);
  assert.equal(fin[0][0], 0);
});

/* ═══════════ 5 · PANTALLA 4: LAS FICHAS ═══════════ */

const fichaDe = (caja, id) => caja.querySelector(`[data-ficha="${id}"]`);
const contador = (caja) => Number(caja.querySelector("[data-valor-contador]").dataset.valorContador);

test("★★★ 5 · el contador cambia en cada decisión y «Revisar» solo se activa con las seis puestas", async () => {
  const p = pantalla("c8");
  const { caja } = await montar(h(RepasoCruzado, { pantallas: [p] }));
  assert.equal(contador(caja), 0);
  assert.equal(caja.querySelector("[data-valor-contador]").textContent, "$0");
  const revisar = caja.querySelector("[data-revisar]");
  const pasos = [
    ["ventas", "suma", 11400], ["ventas", "resta", -11400], ["ventas", "fuera", 0],
    ["devoluciones-ventas", "fuera", 0], ["inventario-inicial", "suma", 500], ["compras", "suma", 4500],
    ["devoluciones-compras", "resta", 4200], ["inventario-final", "suma", 5000], ["inventario-final", "resta", 3400],
  ];
  let k = 0;
  for (const [f, b, esperado] of pasos) {
    assert.equal(revisar.disabled, k < 7 ? true : revisar.disabled);
    await tocar(fichaDe(caja, f).querySelector(`[data-boton="${b}"]`));
    k++;
    assert.equal(contador(caja), esperado, `${f} → ${b}`);
    const puestas = new Set(pasos.slice(0, k).map((x) => x[0])).size;
    assert.equal(revisar.disabled, puestas < 6, `con ${puestas} puestas`);
  }
  assert.equal(caja.querySelector("[data-valor-contador]").textContent, "$3.400");
  /* Con «No entra», la cifra de la ficha pasa a gris. */
  assert.equal(fichaDe(caja, "ventas").querySelector("[data-cifra-ficha]").style.color, "rgb(184, 196, 212)");
  assert.equal(fichaDe(caja, "compras").querySelector("[data-cifra-ficha]").style.color === "rgb(184, 196, 212)", false);
  await tocar(revisar);
  assert.equal(caja.querySelector("[data-devolucion]").dataset.devolucion, "acierto");
  assert.equal(caja.querySelector("[data-devolucion]").textContent.endsWith(p.acierto), true);
  assert.deepEqual([...caja.querySelectorAll("[data-palabra-ficha]")].map((x) => x.textContent), Array(6).fill("Bien"));
});

/* Una clasificación con solo la falla `n` (y lo demás bien). */
const CASOS_FALLA = [
  { ventas: "suma" },
  { "devoluciones-ventas": "resta" },
  { "inventario-final": "suma" },
  { "devoluciones-compras": "suma" },
  { "inventario-inicial": "resta" },
  { compras: "resta" },
  { "devoluciones-compras": "fuera" },
];

test("★★★ 5 · la regla de prioridad entera: siete fallas, cada una sola y detrás de las de antes, y «Y hay más fichas por revisar.»", async () => {
  const p = pantalla("c8");
  let casos = 0;
  for (const [n, caso] of CASOS_FALLA.entries()) {
    /* Sola: su texto, sin «Y hay más». */
    const sola = D.evaluarC8(p, { ...CLAVE_C8, ...caso });
    assert.deepEqual(sola.textos, [p.fallas[n].retro], `falla ${n + 1} sola`);
    casos++;
    /* Con todas las que van después: sigue ganando ella, y se avisa que hay más. */
    const conLasDeDespues = Object.assign({ ...CLAVE_C8 }, ...CASOS_FALLA.slice(n + 1).filter((c) => !Object.keys(c).some((f) => f in caso)), caso);
    const r = D.evaluarC8(p, conLasDeDespues);
    if (n < CASOS_FALLA.length - 1) {
      assert.deepEqual(r.textos, [p.fallas[n].retro, I.hayMas], `falla ${n + 1} delante de las siguientes`);
      casos++;
    }
  }
  assert.equal(casos, 13);
  /* La 7 vale para las cuatro de comprar y guardar. */
  for (const f of ["inventario-inicial", "compras", "devoluciones-compras", "inventario-final"]) {
    assert.deepEqual(D.evaluarC8(p, { ...CLAVE_C8, [f]: "fuera" }).textos, [p.fallas[6].retro], f);
  }
  /* Dos fichas mal con la misma falla también es «hay más». */
  assert.deepEqual(D.evaluarC8(p, { ...CLAVE_C8, compras: "fuera", "inventario-final": "fuera" }).textos, [p.fallas[6].retro, I.hayMas]);
  /* Lo mismo en la pantalla: la devolución, la palabra de cada ficha mal puesta y el botón sin relleno. */
  const { caja } = await montar(h(RepasoCruzado, { pantallas: [p] }));
  await responder(caja, p, { ...CLAVE_C8, ventas: "suma", "inventario-final": "fuera", "devoluciones-compras": "suma" });
  const parrafos = [...caja.querySelectorAll("[data-parrafo-devolucion]")].map((x) => x.textContent.replace("Incorrecto: ", ""));
  assert.deepEqual(parrafos, [p.fallas[0].retro, I.hayMas]);
  const palabra = (f) => fichaDe(caja, f).querySelector("[data-palabra-ficha]").textContent;
  assert.deepEqual(["ventas", "inventario-final", "devoluciones-compras", "compras"].map(palabra), ["Era: no entra", "Era Resta", "Era Resta", "Bien"]);
  await responderOtra(p, { ...CLAVE_C8, "inventario-inicial": "resta" }, (c) => assert.equal(c.querySelector('[data-ficha="inventario-inicial"] [data-palabra-ficha]').textContent, "Era Suma"));
  /* El botón mal elegido PIERDE el relleno: transparente, con borde coral y un anillo. */
  const mal = fichaDe(caja, "ventas").querySelector('[data-boton="suma"]');
  assert.equal(mal.style.background, "transparent");
  assert.match(mal.style.border, /2px solid/);
  assert.equal(mal.querySelector("[data-forma-ficha]").dataset.formaFicha, "anillo");
  /* El bien elegido conserva su relleno, con un punto. */
  const bien = fichaDe(caja, "compras").querySelector('[data-boton="suma"]');
  assert.notEqual(bien.style.background, "transparent");
  assert.equal(bien.querySelector("[data-forma-ficha]").dataset.formaFicha, "punto");
  /* Después de revisar, nada se cambia. */
  await tocar(fichaDe(caja, "ventas").querySelector('[data-boton="fuera"]'));
  assert.equal(fichaDe(caja, "ventas").querySelector('[data-boton="suma"]').getAttribute("aria-checked"), "true");
});

async function responderOtra(p, clasificacion, comprobar) {
  const { caja, desmontar } = await montar(h(RepasoCruzado, { pantallas: [p] }));
  await responder(caja, p, clasificacion);
  comprobar(caja);
  desmontar();
}

test("★★★ 5 y 8 · cada ficha es un grupo de opciones: las flechas cambian dentro del grupo y Tab pasa a la ficha siguiente", async () => {
  const p = pantalla("c8");
  const { caja } = await montar(h(RepasoCruzado, { pantallas: [p] }));
  const grupos = [...caja.querySelectorAll('[role="radiogroup"]')];
  assert.equal(grupos.length, 6);
  /* El nombre accesible del grupo es la etiqueta y la cifra. */
  assert.deepEqual(grupos.map((g) => g.getAttribute("aria-label")), p.datos.map((d) => `${d.etiqueta}, ${d.valor}`));
  assert.equal(grupos[2].getAttribute("aria-label"), "Inventario inicial, 500");
  /* Una sola parada de Tab por ficha: Tab va de ficha en ficha. */
  const paradas = () => grupos.map((g) => [...g.querySelectorAll('[role="radio"]')].filter((b) => b.tabIndex === 0).map((b) => b.dataset.boton));
  assert.deepEqual(paradas(), Array(6).fill(["suma"]));
  /* Flecha a la derecha: elige el siguiente botón del grupo, le pasa el foco y la parada. */
  const primero = grupos[0].querySelector('[data-boton="suma"]');
  primero.focus();
  await tecla(primero, "ArrowRight");
  assert.equal(grupos[0].querySelector('[data-boton="resta"]').getAttribute("aria-checked"), "true");
  assert.equal(document.activeElement === grupos[0].querySelector('[data-boton="resta"]'), true, "el foco va con la flecha");
  await tecla(document.activeElement, "ArrowRight");
  await tecla(document.activeElement, "ArrowRight");
  assert.equal(grupos[0].querySelector('[data-boton="suma"]').getAttribute("aria-checked"), "true", "da la vuelta");
  await tecla(document.activeElement, "ArrowLeft");
  assert.equal(grupos[0].querySelector('[data-boton="fuera"]').getAttribute("aria-checked"), "true");
  assert.deepEqual(paradas()[0], ["fuera"]);
  /* Las flechas no tocan otra ficha. */
  assert.ok(grupos.slice(1).every((g) => !g.querySelector('[aria-checked="true"]')));
  assert.equal(contador(caja), 0);
  /* Todos los botones son botones de verdad, del alto de un dedo. */
  for (const b of caja.querySelectorAll('[role="radio"]')) {
    assert.equal(b.tagName, "BUTTON");
    assert.equal(b.style.minHeight, "44px");
  }
});

/* ═══════════ 6 · PANTALLAS 1, 2 Y 6: LA OPCIÓN SE VUELVE TÍTULO ═══════════ */

const filasVisibles = (caja) => [...caja.querySelectorAll("[data-opcion]")].map((o) => [o.dataset.opcion, o.querySelector("button").dataset.estado, o.querySelector("button").dataset.enFigura]);

test("★★★ 6 · con reduced-motion, al fallar quedan la elegida y la correcta, y la figura muestra la correcta con «EN LA FIGURA»", async () => {
  let revisadas = 0;
  for (const p of [pantalla("c3"), pantalla("c5"), pantalla("c10")]) {
    for (const o of p.opciones) {
      const { caja, desmontar } = await montar(h(RepasoCruzado, { pantallas: [p] }));
      assert.equal(filasVisibles(caja).length, 4);
      /* Antes de responder: la figura va encima de las opciones. */
      const figura = caja.querySelector("[data-caja-figura]");
      assert.ok(figura.compareDocumentPosition(caja.querySelector("[data-opcion]")) & w.Node.DOCUMENT_POSITION_FOLLOWING);
      await tocar(opcion(caja, o.id));
      revisadas++;
      const c = clave(p).id;
      const esperado = o.correcta ? [[o.id, "correcta", "si"]] : [[o.id, "incorrecta", "no"], [c, "revelada", "si"]];
      assert.deepEqual(filasVisibles(caja), esperado, o.id);
      /* Orden final: [elegida] [correcta] [figura] [panel] [Siguiente]. */
      const ultima = [...caja.querySelectorAll("[data-opcion]")].at(-1);
      assert.ok(ultima.compareDocumentPosition(caja.querySelector("[data-caja-figura]")) & w.Node.DOCUMENT_POSITION_FOLLOWING, `${o.id}: la figura baja`);
      assert.ok(caja.querySelector("[data-caja-figura]").compareDocumentPosition(caja.querySelector("[data-devolucion]")) & w.Node.DOCUMENT_POSITION_FOLLOWING);
      /* Las «EN LA FIGURA» que se ven son exactamente una. */
      assert.equal(caja.querySelectorAll("[data-marca-en-figura]").length, 1);
      desmontar();
    }
  }
  assert.equal(revisadas, 12);
});

/* Lo que la figura muestra, leído de la figura misma. */
function loQueMuestra(caja) {
  const f = caja.querySelector("[data-figura]");
  if (f.dataset.figura === "flujos") return f.dataset.flujo;
  return [...f.querySelectorAll("[data-saldo-nuevo]")].map((x) => `${x.closest("[data-cuenta]").dataset.cuenta}:${x.dataset.saldoNuevo}:${x.dataset.saldoLado}`).join("|");
}

test("★★★ 6 · las dos filas quedan tocables: tocar una la pone en la figura y se lleva «EN LA FIGURA»", async () => {
  for (const [p, mal] of [[pantalla("c3"), "c3-b"], [pantalla("c5"), "c5-d"], [pantalla("c10"), "c10-b"]]) {
    const { caja, desmontar } = await montar(h(RepasoCruzado, { pantallas: [p] }));
    await tocar(opcion(caja, mal));
    const conLaCorrecta = loQueMuestra(caja);
    await tocar(opcion(caja, mal));
    assert.notEqual(loQueMuestra(caja), conLaCorrecta, `${p.id}: no cambió la figura`);
    assert.deepEqual(filasVisibles(caja).map((x) => x[2]), ["si", "no"]);
    if (p.id === "c3") assert.equal(loQueMuestra(caja), "variable");
    if (p.id === "c5") assert.equal(loQueMuestra(caja), `${D.CLIENTES}:10300000:debe|${D.GASTO}:300000:haber`);
    if (p.id === "c10") {
      assert.equal(loQueMuestra(caja), `${D.INVENTARIO}:1600000:debe|${D.CMV}:800000:haber`);
      assert.equal(caja.querySelector(`[data-cuenta="${D.CMV}"]`).dataset.nueva, "si");
    }
    await tocar(opcion(caja, clave(p).id));
    assert.equal(loQueMuestra(caja), conLaCorrecta);
    assert.deepEqual(filasVisibles(caja).map((x) => x[2]), ["no", "si"]);
    /* Volver a ver no vuelve a calificar: el panel es el mismo. */
    assert.equal(caja.querySelector("[data-devolucion]").dataset.devolucion, "error");
    desmontar();
  }
});

test("★★★ 6 · con movimiento: recoge, la figura reproduce la ELEGIDA, pausa, y luego despliega la correcta y la reproduce", async () => {
  MOVIMIENTO.reducido = false;
  const p = pantalla("c3");
  const { caja } = await montar(h(RepasoCruzado, { pantallas: [p] }));
  await tocar(opcion(caja, "c3-a"));
  /* Recogiendo: las cuatro siguen en el DOM; la figura aún no reproduce nada. */
  assert.equal(caja.querySelector("[data-opciones-titulo]").dataset.fase, "recogiendo");
  assert.equal(caja.querySelector("[data-figura]").dataset.flujo, "ninguno");
  await pasar(260);
  assert.equal(caja.querySelector("[data-opciones-titulo]").dataset.fase, "titulo");
  assert.deepEqual(filasVisibles(caja).map((x) => x[0]), ["c3-a"], "solo la elegida");
  await pasar(360);
  /* Reproduce la elegida (a), no la correcta. */
  assert.equal(caja.querySelector("[data-figura]").dataset.flujo, "interes");
  assert.equal(caja.querySelector("[data-figura]").dataset.fase, "animando");
  assert.deepEqual(filasVisibles(caja), [["c3-a", "incorrecta", "si"]]);
  /* 1,06 s de reproducción y 600 ms de pausa. */
  await pasar(1100);
  assert.equal(caja.querySelector("[data-figura]").dataset.fase, "final");
  assert.equal(caja.querySelector("[data-opciones-titulo]").dataset.fase, "titulo", "la pausa");
  await pasar(700);
  assert.equal(caja.querySelector("[data-opciones-titulo]").dataset.fase, "correcta");
  await pasar(20);
  assert.deepEqual(filasVisibles(caja), [["c3-a", "incorrecta", "no"], ["c3-c", "revelada", "si"]]);
  assert.equal(caja.querySelector("[data-figura]").dataset.flujo, "descuento");
  /* El desplazamiento de la elegida, en pasos de un cuadro (no de golpe). */
  assert.ok(DESPLAZAMIENTOS.length > 1);
});

/* ═══════════ 7 · B4: NI TEAL NI ÁMBAR EN LA CALIFICACIÓN ═══════════ */

const TEAL = /2A9D8F|42,\s*157,\s*143|\bteal\b/i;
const AMBAR = /E9C46A|233,\s*196,\s*106|\bambar\b/i;

test("★★★ 7 · B4 de enganche.md: ningún estado de calificación en teal ni en ámbar (fuente y pantalla)", async () => {
  /* La fuente: los estados de la opción propia y los de la ficha. */
  const opcionFuente = leer("src/components/repasoCap5/OpcionR5.jsx");
  const estados = opcionFuente.slice(opcionFuente.indexOf("export const ESTADOS_OPCION"), opcionFuente.indexOf("const SIN_ESTADO"));
  assert.ok(/correcta:/.test(estados) && /revelada:/.test(estados) && /incorrecta:/.test(estados));
  for (const linea of estados.split("\n")) assert.ok(!TEAL.test(linea) && !AMBAR.test(linea), linea.trim());
  const fichasFuente = leer("src/components/repasoCap5/Fichas.jsx");
  const estilo = fichasFuente.slice(fichasFuente.indexOf("function estiloBoton"), fichasFuente.indexOf("function Ficha("));
  assert.ok(!TEAL.test(estilo) && !AMBAR.test(estilo), "estiloBoton");
  /* No se usa la Opcion compartida, que pinta el acierto en teal (decisión 2). */
  const vista = leer("src/components/RepasoCapitulo5View.jsx");
  assert.doesNotMatch(vista, /import\s*{[^}]*\bOpcion\b[^}]*}\s*from\s*"\.\/mecanicas\/corazon\/juego\.jsx"/);
  /* La pantalla: se juega cada estado y se mira lo pintado. */
  const pintado = (el) => `${el.getAttribute("style") ?? ""} ${[...el.querySelectorAll("*")].map((x) => x.getAttribute("style") ?? "").join(" ")}`;
  let revisados = 0;
  for (const [p, eleccion] of [[pantalla("c3"), "c3-a"], [pantalla("c6"), "c6-b"], [pantalla("c9"), "c9-c"], [pantalla("c5"), "c5-c"], [pantalla("c8"), { ...CLAVE_C8, ventas: "suma" }]]) {
    const { caja, desmontar } = await montar(h(RepasoCruzado, { pantallas: [p] }));
    await responder(caja, p, eleccion);
    const calificados = [...caja.querySelectorAll('[data-estado]:not([data-estado="ninguno"]), [data-ficha]')];
    assert.ok(calificados.length > 0, p.id);
    for (const el of calificados) {
      revisados++;
      const s = pintado(el).replace(/background: rgb\(233, 196, 106\)[^;]*;?/g, "");
      assert.ok(!TEAL.test(s), `${p.id}: teal en un estado`);
      assert.ok(!AMBAR.test(pintado(el)), `${p.id}: ámbar en un estado`);
    }
    desmontar();
  }
  assert.equal(revisados, 13, "no revisó los estados que dice revisar");
  /* El teal sigue donde significa DEBE, con su palabra al lado. */
  const { caja } = await montar(h(RepasoCruzado, { pantallas: [pantalla("c5")] }));
  const debe = caja.querySelector('[data-barra-lado="debe"]');
  assert.ok(TEAL.test(debe.getAttribute("style")));
  assert.equal(caja.querySelector('[data-marca-lado="debe"]').textContent, "DEBE");
  assert.ok(AMBAR.test(caja.querySelector('[data-barra-lado="haber"]').getAttribute("style")));
  assert.equal(caja.querySelector('[data-marca-lado="haber"]').textContent, "HABER");
});

/* ═══════════ 8 · TECLADO ═══════════ */

test("★★★ 8 · latas, fichas y lotes son botones alcanzables con Tab; al vender, el foco pasa a la lata siguiente; el lote vacío sale de la tabulación", async () => {
  const c6 = pantalla("c6");
  const { caja } = await montar(h(RepasoCruzado, { pantallas: [c6] }));
  const latas = [...caja.querySelectorAll("[data-lata]")];
  assert.equal(latas.length, 8);
  /* En el orden del DOM: estante 1, luego 2. */
  assert.deepEqual(latas.map((l) => l.dataset.lata), ["primera-0", "primera-1", "primera-2", "primera-3", "segunda-0", "segunda-1", "segunda-2", "segunda-3"]);
  for (const l of latas) {
    assert.equal(l.tagName, "BUTTON");
    assert.equal(l.disabled, false);
    assert.equal(l.tabIndex, 0);
    assert.equal(l.style.width, "44px");
    assert.equal(l.style.height, "48px");
  }
  assert.equal(latas[0].getAttribute("aria-label"), "Lata de la primera compra, 10 pesos");
  assert.equal(latas[4].getAttribute("aria-label"), "Lata de la segunda compra, 14 pesos");
  latas[0].focus();
  await tocar(latas[0]);
  await pasar(5);
  assert.equal(document.activeElement === caja.querySelector('[data-lata="primera-1"]'), true, "el foco pasa a la lata siguiente");
  assert.equal(caja.querySelector('[data-lata="primera-0"]').disabled, true, "la vendida sale de la tabulación");

  const c9p = pantalla("c9");
  const otra = await montar(h(RepasoCruzado, { pantallas: [c9p] }));
  const lotes = [...otra.caja.querySelectorAll("[data-lote]")];
  assert.equal(lotes.length, 3);
  for (const l of lotes) { assert.equal(l.tagName, "BUTTON"); assert.equal(l.disabled, false); }
  await tocar(lotes[1]);
  assert.equal(lotes[1].disabled, true, "el lote vacío se desactiva y sale de la tabulación");
  assert.equal(lotes[1].dataset.vacio, "si");
  assert.deepEqual([...lotes[1].querySelectorAll("[data-caja]")].map((x) => x.dataset.caja), Array(10).fill("contorno"));
  /* Las fichas, en la prueba 5. */
});

/* ═══════════ 9 · REDUCED-MOTION Y EL TOQUE QUE SALTA ═══════════ */

test("★★★ 9 · con reduced-motion el estado final va directo y la página salta sin desplazamiento suave", async () => {
  for (const p of [pantalla("c3"), pantalla("c5"), pantalla("c10")]) {
    DESPLAZAMIENTOS.length = 0;
    const { caja, desmontar } = await montar(h(RepasoCruzado, { pantallas: [p] }));
    await tocar(opcion(caja, p.opciones.find((o) => !o.correcta).id));
    assert.equal(caja.querySelector("[data-opciones-titulo]").dataset.fase, "correcta", p.id);
    assert.equal(caja.querySelector("[data-figura]").dataset.fase, "final", p.id);
    /* Sin «smooth» y sin pasos: cada desplazamiento es un salto (0, y). */
    assert.ok(DESPLAZAMIENTOS.length >= 1);
    assert.ok(DESPLAZAMIENTOS.every((a) => a.length === 2 && typeof a[1] === "number"), JSON.stringify(DESPLAZAMIENTOS));
    desmontar();
  }
  /* Lotes: los tres y la salida, directos. */
  const { caja } = await montar(h(RepasoCruzado, { pantallas: [pantalla("c9")] }));
  for (const k of [1, 2, 3]) await tocar(caja.querySelector(`[data-lote="${k}"]`));
  assert.equal(caja.querySelector("[data-figura='lotes']").dataset.salida, "lista");
  assert.equal(caja.querySelectorAll('[data-estante-comun] [data-caja="estante"]').length, 25);
  /* Nada de scroll-behavior suave en las piezas. */
  for (const f of ["OpcionesTitulo", "Latas", "Lotes", "movimiento"]) {
    const ext = f === "movimiento" ? "js" : "jsx";
    assert.doesNotMatch(leer(`src/components/repasoCap5/${f}.${ext}`), /behavior:\s*"smooth"|scroll-behavior/, f);
  }
});

test("★★★ 9 · el toque que salta: en la figura la lleva al final; sobre una lata o un lote actúa y termina la animación anterior", async () => {
  MOVIMIENTO.reducido = false;
  /* Flujos: un toque en la figura mientras anima. */
  const p = pantalla("c3");
  const { caja } = await montar(h(RepasoCruzado, { pantallas: [p] }));
  await tocar(opcion(caja, "c3-c"));
  await pasar(620);
  assert.equal(caja.querySelector("[data-figura]").dataset.fase, "animando");
  await tocar(caja.querySelector("[data-figura]"));
  assert.equal(caja.querySelector("[data-figura]").dataset.fase, "final", "el toque no saltó");

  /* Latas y lotes: las animaciones en curso se terminan (finish) al tocar. */
  const terminadas = [];
  const original = w.Element.prototype.getAnimations;
  w.Element.prototype.getAnimations = function () { return [{ finish: () => terminadas.push(this.dataset.figura ?? this.tagName) }]; };
  try {
    const latas = await montar(h(RepasoCruzado, { pantallas: [pantalla("c6")] }));
    await tocar(latas.caja.querySelector('[data-lata="primera-0"]'));
    assert.deepEqual(terminadas, ["latas"], "tocar una lata termina lo anterior");
    assert.equal(latas.caja.querySelector("[data-figura='latas']").dataset.vendidas, "1", "y además vende");
    await tocar(latas.caja.querySelector("[data-bandeja]"));
    assert.deepEqual(terminadas, ["latas", "latas"], "un toque en otra parte de la figura salta");
    assert.equal(latas.caja.querySelector("[data-figura='latas']").dataset.vendidas, "1", "y no vende");
    terminadas.length = 0;
    const lotes = await montar(h(RepasoCruzado, { pantallas: [pantalla("c9")] }));
    await tocar(lotes.caja.querySelector('[data-lote="2"]'));
    assert.deepEqual(terminadas, ["lotes"]);
    assert.equal(lotes.caja.querySelector('[data-lote="2"]').dataset.vacio, "si", "y además vacía");
    await tocar(lotes.caja.querySelector("[data-estante-comun]"));
    assert.deepEqual(terminadas, ["lotes", "lotes"]);
    assert.equal(lotes.caja.querySelector('[data-lote="1"]').dataset.vacio, "no");
  } finally {
    w.Element.prototype.getAnimations = original;
  }
});

/* ═══════════ 10 · FP ═══════════ */

const { calcularFP } = await import("../../fp/motor.js");

test("★★★ 10 · los FP de 0 a 6 aciertos salen de calcularFP y son los que da la regla del servidor (0017)", () => {
  const SQL = leer("supabase/migrations/0017_detalle_por_item.sql");
  assert.match(SQL, /v_rend := greatest\(0\.5, least\(1, coalesce\(p_correct_pct, 0\) \/ 100\.0\)\);/);
  assert.match(SQL, /v_fp := round\(v_base \* v_rend \* v_tiempo\);/);
  /* La regla del servidor, escrita aquí aparte, en enteros: otorgarFP manda el % redondeado. */
  const delServidor = (pct) => { const r = Math.max(50, Math.min(100, Math.round(pct))); return Math.floor((25 * r + 50) / 100); };
  const fps = [];
  for (let bien = 0; bien <= D.TOTAL_R5_1; bien++) {
    const pct = D.puntuarR5_1(bien);
    const { fp } = calcularFP({ dificultad: D.R5_1.dificultad, modalidad: D.R5_1.modalidad, aciertos: pct / 100, duracionMs: 60_000 });
    assert.equal(fp, delServidor(pct), `${bien} de 6`);
    fps.push(fp);
  }
  assert.equal(fps.length, 7);
  assert.deepEqual(fps, [13, 13, 13, 13, 17, 21, 25]);
  for (const f of ["src/components/RepasoCapitulo5View.jsx", "src/data/repasoCap5Cruzado.js"]) {
    assert.doesNotMatch(leer(f).replace(/^\s*(\/\*|\*|\/\/).*$/gm, ""), /fpBase\s*\*|\*\s*fpBase|Math\.round\([^)]*fp/i, f);
  }
});

test("★★★ 10 · 3 de 6 da 12,5 FP exactos y calcularFP los redondea a 13, como round() sobre numeric en el servidor", () => {
  const SQL = leer("supabase/migrations/0017_detalle_por_item.sql");
  assert.match(SQL, /v_rend\s+numeric;/);
  assert.match(SQL, /v_tiempo\s+numeric;/);
  const pct = D.puntuarR5_1(3);
  assert.equal(pct, 50);
  assert.equal(D.R5_1.fpBase * (pct / 100), 12.5, "el caso tiene que ser una mitad exacta");
  const { fp, desglose } = calcularFP({ dificultad: D.R5_1.dificultad, modalidad: D.R5_1.modalidad, aciertos: pct / 100, duracionMs: 60_000 });
  assert.equal(desglose.factorRendimiento, 0.5);
  assert.equal(desglose.factorTiempo, 1);
  assert.equal(fp, 13);
});

/* ═══════════ 12 · INFLESZ ═══════════ */

test("★★★ 12 · todo texto de 10 palabras o más pasa 65 con inflesz.js (guarda: 44 medidos)", () => {
  let medidos = 0;
  const bajos = [];
  for (const t of [...contenido(), ...ROTULOS]) {
    const r = inflesz(t);
    assert.deepEqual(r.desconocidas, [], `letra que la herramienta no sabe contar: ${t}`);
    if (!r.aplica) continue;
    medidos++;
    if (r.valor < UMBRAL) bajos.push(`${r.valor} · ${t}`);
  }
  assert.equal(medidos, 44, "no midió los textos que dice medir");
  assert.deepEqual(bajos, [], "textos por debajo de 65");
  /* La devolución (a) de la pantalla 2 de v2.2: el paquete dice 87,2. */
  assert.equal(inflesz(pantalla("c5").opciones.find((o) => o.id === "c5-a").retro).valor, 87.2);
});

/* ═══════════ 1 · TODO LO DEL PAQUETE LLEGA A LA PANTALLA (E1) ═══════════ */

/*
 * La pista estuvo en el paquete y en los datos y nunca se pintó, y ninguna
 * prueba lo notó (E1 de enganche.md). Esta juega cada pantalla por cada
 * opción o camino, con la pista abierta, y exige que cada texto del
 * estudiante y cada rótulo haya salido en el DOM en algún estado.
 */
test("★★★ 1 · cada texto del paquete sale en la pantalla en algún estado (guarda: 91 textos, 35 rótulos, 41 caminos)", async () => {
  const visto = new Set();
  const mirar = (caja) => visto.add(caja.textContent);
  let caminos = 0;
  const jugar = async (p, eleccion, antesDe = null) => {
    caminos++;
    const { caja, desmontar } = await montar(h(RepasoCruzado, { pantallas: [p] }));
    mirar(caja);
    await tocar(caja.querySelector("[data-ver-pista]"));
    mirar(caja);
    if (antesDe) { await antesDe(caja); mirar(caja); }
    await responder(caja, p, eleccion);
    mirar(caja);
    desmontar();
  };
  for (const p of P) {
    if (p.forma === "fichas") {
      for (const caso of CASOS_FALLA) await jugar(p, { ...CLAVE_C8, ...caso });
      await jugar(p, { ...CLAVE_C8, ventas: "suma", compras: "resta", "inventario-inicial": "fuera" });
      await jugar(p, CLAVE_C8);
      continue;
    }
    for (const o of p.opciones) {
      await jugar(p, o.id, p.forma === "latas" ? (caja) => tocar(caja.querySelector('[data-lata="segunda-0"]')) : null);
      /* Cada fila de las pantallas 1, 2 y 6 en la figura. */
      if (p.forma === "flujos" || p.forma === "asiento") {
        caminos++;
        const { caja, desmontar } = await montar(h(RepasoCruzado, { pantallas: [p] }));
        await tocar(opcion(caja, o.id));
        for (const fila of caja.querySelectorAll("[data-opcion] button")) { await tocar(fila); mirar(caja); }
        desmontar();
      }
    }
  }
  /* El final. */
  const { caja } = await montar(h(RepasoCruzado, { pantallas: P }));
  for (const p of P) { await responder(caja, p, bienDe(p)); await siguiente(caja); }
  mirar(caja);
  const todo = [...visto].join("\n");
  const textos = contenido();
  assert.equal(textos.length, 91);
  assert.equal(ROTULOS.length, 35);
  assert.equal(caminos, 41, "no recorrió los caminos que dice recorrer");
  const faltan = [...textos, ...ROTULOS, I.porTema, I.marcaPista, I.siguiente].filter((t) => !todo.includes(t));
  assert.deepEqual(faltan, [], `no salen en pantalla: ${faltan.join(" | ")}`);
});

/* ═══════════ B5 · NINGÚN TEXTO DOS VECES EN LA MISMA PANTALLA ═══════════ */

test("★★ B5 de enganche.md: ninguna frase sale dos veces en la misma pantalla (los nombres de cuenta o de dato no cuentan)", async () => {
  const nombres = new Set([D.GASTO, D.PROVISION, D.CLIENTES, D.INVENTARIO, D.GYP, D.CMV, ...pantalla("c8").datos.map((d) => d.etiqueta)]);
  const palabrasDeInterfaz = new Set([I.bien, I.era.suma, I.era.resta, I.era.fuera, I.suma, I.resta, I.noEntra]);
  let estados = 0;
  for (const p of P) {
    for (const eleccion of p.forma === "fichas" ? [CLAVE_C8, { ...CLAVE_C8, ventas: "suma" }] : p.opciones.map((o) => o.id)) {
      const { caja, desmontar } = await montar(h(RepasoCruzado, { pantallas: [p] }));
      await tocar(caja.querySelector("[data-ver-pista]"));
      await responder(caja, p, eleccion);
      estados++;
      const hojas = [...caja.querySelectorAll("p, span, button")].filter((el) => !el.children.length).map((el) => el.textContent.trim())
        .filter((t) => palabrasDe(t).length >= 3 && !nombres.has(t) && !palabrasDeInterfaz.has(t) && !/^(Debita|Acredita) /.test(t));
      const repetidas = hojas.filter((t, k) => hojas.indexOf(t) !== k);
      assert.deepEqual(repetidas, [], `${p.id} · ${JSON.stringify(eleccion)}`);
      desmontar();
    }
  }
  assert.equal(estados, 22);
});

/* ═══════════ LO DE v1 QUE SIGUE VALIENDO ═══════════ */

const { barajadorDe } = await import("../../utils/barajar.js");
const SEMILLAS = ["r5-1-a", "r5-1-b", "r5-1-c"];
const CON_OPCIONES = P.filter((p) => p.opciones);
const orden = (tanda, id) => tanda.find((x) => x.id === id).opciones.map((o) => o.id).join("|");
const corrida = (semilla, intentos = 40) => {
  const barajador = barajadorDe(semilla);
  const tandas = [];
  let anterior = null;
  for (let k = 0; k < intentos; k++) { anterior = D.prepararR5_1(anterior, barajador); tandas.push(anterior); }
  return tandas;
};

test("★★★ el barajado, con semilla fija: reproducible, cambia el orden y conserva la clave; las fichas no se barajan (guarda: 3 × 40 × 5)", () => {
  let revisadas = 0;
  for (const semilla of SEMILLAS) {
    const tandas = corrida(semilla);
    assert.deepEqual(corrida(semilla).map((t) => CON_OPCIONES.map((p) => orden(t, p.id))), tandas.map((t) => CON_OPCIONES.map((p) => orden(t, p.id))));
    tandas.forEach((tanda, k) => {
      assert.deepEqual(tanda.map((x) => x.id), P.map((x) => x.id), "las pantallas no se barajan");
      assert.deepEqual(tanda.find((x) => x.id === "c8").datos.map((d) => d.id), pantalla("c8").datos.map((d) => d.id), "las fichas van en el orden del estado de resultados");
      for (const p of CON_OPCIONES) {
        revisadas++;
        const antes = k ? orden(tandas[k - 1], p.id) : p.opciones.map((o) => o.id).join("|");
        assert.notEqual(orden(tanda, p.id), antes, `${semilla} · intento ${k + 1} · ${p.id}`);
        const t = tanda.find((x) => x.id === p.id);
        assert.deepEqual(t.opciones.map((o) => o.id).sort(), p.opciones.map((o) => o.id).sort());
        assert.equal(t.opciones.filter((o) => o.correcta).length, 1);
        assert.equal(D.evaluarR5_1(t, clave(p).id).ok, true);
      }
    });
    for (const p of CON_OPCIONES) {
      const sitios = new Set(tandas.map((t) => t.find((x) => x.id === p.id).opciones.findIndex((o) => o.correcta)));
      assert.equal(sitios.size, 4, `${semilla} · ${p.id}: la clave solo pasó por ${[...sitios]}`);
    }
  }
  assert.equal(revisadas, 600);
});

test("★★ ningún renglón de opción de asiento llega a 10 palabras (guarda: 16 renglones)", () => {
  let renglones = 0;
  for (const p of [pantalla("c5"), pantalla("c10")]) {
    for (const o of p.opciones) {
      for (const r of D.renglonesDeAsiento(o.asiento)) {
        renglones++;
        assert.ok(palabrasDe(r).length < 10, `${o.id}: «${r}»`);
      }
    }
  }
  assert.equal(renglones, 16);
});

test("★★★ catálogo, registro de la vista y migración dicen lo mismo; r5-1 conserva su ficha y su fila (sin migración nueva)", () => {
  const temas = SUBJECTS.contabilidad.topics;
  assert.equal(temas.at(-1).id, TEMA_REPASO_CAP5);
  const tema = temas.at(-1);
  const enCatalogo = actividadesDeTipo(tema, HACER);
  assert.deepEqual(enCatalogo.map((a) => a.id), JUEGOS_REPASO_CAP5.map((j) => j.id));
  const a = enCatalogo.find((x) => x.id === "r5-1");
  assert.equal(a.nombre, D.R5_1.nombre);
  assert.equal(JUEGOS_REPASO_CAP5.find((j) => j.id === "r5-1").titulo, D.R5_1.nombre);
  assert.deepEqual(a.clasificacion, { tipo: HACER, modalidad: "evaluativa", dificultad: "medio", fpBase: 25 });
  assert.deepEqual([D.R5_1.dificultad, D.R5_1.fpBase, D.R5_1.modalidad], ["medio", 25, "evaluativa"]);
  /* Sin migración: la de r5-1 sigue siendo solo la 0250. */
  const migraciones = readdirSync(new URL("supabase/migrations/", RAIZ)).filter((f) => /^\d{4}_/.test(f) && leer(`supabase/migrations/${f}`).includes("'r5-1'"));
  assert.deepEqual(migraciones, ["0250_r5_1_repaso_cruzado.sql"]);
  assert.match(leer(`supabase/migrations/${migraciones[0]}`), /\('r5-1', 'contabilidad', 'repaso-capitulo-5', 'evaluativa', 'medio', 25, 1\)\s*on conflict \(activity_id\) do nothing;/);
});

test("★★ la regla de etiqueta nombra cada pantalla por su subtema y su enunciado nuevo, y ninguna se lee igual (guarda: 6)", () => {
  assert.ok(hayReglaPara("r5-1"));
  const etiquetas = P.map((p) => etiquetaDeItem("r5-1", p.id, 500));
  assert.equal(etiquetas.length, 6);
  assert.equal(new Set(etiquetas).size, 6);
  P.forEach((p, k) => assert.equal(etiquetas[k], `${D.SUBTEMAS[p.subtema].nombre} · ${p.enunciado}`));
  assert.equal(etiquetaDeItem("r5-1", "no-existe"), null);
});

test("★★★ se juega entera: cabecera con la silueta del tema, el detalle de cada pantalla (la 4 guarda la clasificación) y el cierre POR TEMA", async () => {
  const fin = [];
  const { caja } = await montar(h(RepasoCruzado, { pantallas: P, onCompletar: (...x) => fin.push(x) }));
  const ESCENA = { inversiones: "titulo-valor", cartera: "facturas", inventarios: "bodega" };
  const malC8 = { ...CLAVE_C8, ventas: "suma" };
  const eleccion = { c3: "c3-a", c5: "c5-c", c6: "c6-c", c8: malC8, c9: "c9-b", c10: "c10-c" };
  let jugadas = 0;
  for (const [k, p] of P.entries()) {
    jugadas++;
    assert.equal(caja.querySelector("[data-pantalla]").dataset.pantalla, p.id);
    assert.equal(caja.querySelector("[data-progreso]").textContent, `PREGUNTA ${k + 1} DE 6`);
    const silueta = caja.querySelector("[data-silueta-cabecera]");
    assert.equal(silueta.dataset.siluetaCabecera, ESCENA[p.subtema]);
    assert.equal(silueta.getAttribute("aria-hidden"), "true");
    assert.ok(silueta.querySelector(`[data-silueta="${ESCENA[p.subtema]}"]`));
    /* Sale la banda de escena de 72 px de v1, y el objetivo. */
    assert.equal(Boolean(caja.querySelector("[data-banda-escena]")), false);
    assert.equal(Boolean(caja.querySelector("[data-objetivo]")), false);
    assert.equal(caja.querySelector("[data-enunciado]").textContent, p.enunciado);
    assert.equal(Boolean(caja.querySelector("[data-siguiente]")), false, "«Siguiente» antes de responder");
    await responder(caja, p, eleccion[p.id]);
    assert.equal(caja.querySelector("[data-devolucion]").getAttribute("aria-live"), "polite");
    await siguiente(caja);
  }
  assert.equal(jugadas, 6);
  assert.ok(caja.querySelector("[data-cierre]"));
  const filas = [...caja.querySelectorAll("[data-fila-tema]")].map((f) => [f.dataset.filaTema, [...f.querySelectorAll("[data-punto]")].map((x) => x.dataset.punto).join(","), f.querySelector("[data-n-de-m]").textContent]);
  assert.deepEqual(filas, [["inversiones", "error", "0 de 1"], ["cartera", "acierto", "1 de 1"], ["inventarios", "acierto,error,error,acierto", "2 de 4"]]);
  assert.equal(fin.length, 1);
  const [pct, , detalle] = fin[0];
  assert.equal(pct, (3 / 6) * 100);
  assert.deepEqual(detalle.map((d) => [d.item, d.ok, d.respuesta]), [
    ["c3", false, "c3-a"], ["c5", true, null], ["c6", true, null],
    ["c8", false, "Ventas: Suma"],
    ["c9", false, "c9-b"], ["c10", true, null],
  ]);
});

test("★★★ en el final, acierto y error se distinguen por forma: relleno o anillo, no solo por color", async () => {
  const { caja } = await montar(h(RepasoCruzado, { pantallas: P }));
  for (const p of P) {
    const id = p.id === "c3" ? clave(p).id : p.forma === "fichas" ? { ...CLAVE_C8, compras: "resta" } : p.opciones.find((o) => !o.correcta).id;
    await responder(caja, p, id);
    await siguiente(caja);
  }
  const puntos = [...caja.querySelectorAll("[data-punto]")];
  assert.equal(puntos.length, 6);
  const forma = (el) => {
    const st = el.style;
    const relleno = st.background && st.background !== "transparent" && !st.border;
    const anillo = (st.background === "transparent" || st.background === "") && /solid/.test(st.border);
    return relleno ? "relleno" : anillo ? "anillo" : "otra";
  };
  assert.deepEqual(puntos.map(forma), ["relleno", "anillo", "anillo", "anillo", "anillo", "anillo"]);
  assert.ok(puntos.every((x) => x.closest("[aria-hidden='true']")));
  assert.deepEqual([...caja.querySelectorAll("[data-n-de-m]")].map((x) => x.textContent), ["1 de 1", "0 de 1", "0 de 4"]);
});

test("★★★ la pista se pide antes de responder, va debajo de la interacción, sale literal, se va al responder y no quita FP", async () => {
  const fin = [];
  const { caja } = await montar(h(RepasoCruzado, { pantallas: P, onCompletar: (...x) => fin.push(x) }));
  let vistas = 0;
  for (const p of P) {
    assert.equal(Boolean(caja.querySelector("[data-pista]")), false, `${p.id}: la pista empieza cerrada`);
    const boton = caja.querySelector("[data-ver-pista]");
    assert.equal(boton.textContent, "Ver pista");
    /* Debajo de la interacción, nunca encima de la figura (decisión 7). */
    assert.ok(caja.querySelector("[data-interaccion]").compareDocumentPosition(boton) & w.Node.DOCUMENT_POSITION_FOLLOWING);
    await tocar(boton);
    assert.equal(caja.querySelector("[data-pista]").textContent, `PISTA${p.pista}`);
    vistas++;
    await responder(caja, p, bienDe(p));
    assert.equal(Boolean(caja.querySelector("[data-pista]")), false, `${p.id}: al responder la pista se va`);
    await siguiente(caja);
  }
  assert.equal(vistas, 6);
  assert.equal(fin[0][0], 100);
});

test("★★ el rótulo del lote es contenido: 12 px, sin mayúsculas forzadas; la fila de 10 cajas cabe a 320 (147 de 264)", async () => {
  const { caja } = await montar(h(RepasoCruzado, { pantallas: [pantalla("c9")] }));
  const rotulos = [...caja.querySelectorAll("[data-marca-lote]")];
  assert.deepEqual(rotulos.map((r) => r.textContent), ["Lote 1 · Al inicio", "Lote 2 · Primera compra", "Lote 3 · Segunda compra"]);
  for (const r of rotulos) {
    assert.equal(r.style.fontSize, "12px");
    assert.notEqual(r.style.textTransform, "uppercase");
  }
  const fila = caja.querySelector('[data-lote="2"] [data-caja]').parentElement;
  const una = fila.firstElementChild.style;
  const [lado, hueco] = [parseFloat(una.width), parseFloat(fila.style.gap)];
  assert.deepEqual([lado, parseFloat(una.height), hueco], [12, 12, 3]);
  assert.equal(fila.children.length, 10);
  /* 320 − 2 × 16 = 288 de contenido; menos 2 × 12 de relleno de la caja = 264. */
  assert.equal(10 * lado + 9 * hueco, 147);
  assert.ok(147 <= 264);
});

test("★★ la portada del tema dice de dónde viene el repaso, con las tres siluetas de las preguntas", async () => {
  const { PortadaRepaso } = await import("../../components/RepasoCapitulo5View.jsx");
  const { caja } = await montar(h(PortadaRepaso));
  const portada = caja.querySelector("[data-portada-repaso]");
  assert.equal(portada.querySelector("p").textContent, "FIN DEL CAPÍTULO 5");
  assert.equal(portada.querySelector("#r5-portada-titulo").textContent, "Repasa los tres temas antes de seguir.");
  assert.deepEqual([...portada.querySelectorAll("[data-portada-tema]")].map((t) => t.textContent), ["Inversiones", "Cartera", "Inventarios"]);
});

test("★★ el título del tema puede partir en dos renglones: no se corta con «…» (herramientas.md, 15 oct.)", () => {
  const fuente = leer("src/components/RepasoCapitulo5View.jsx");
  const h1 = fuente.slice(fuente.indexOf("<h1 data-titulo-tema"), fuente.indexOf(">", fuente.indexOf("<h1 data-titulo-tema")));
  for (const d of ['whiteSpace: "normal"', 'overflow: "visible"', 'textOverflow: "clip"', "minWidth: 0"]) assert.ok(h1.includes(d), d);
});

test("★★ §d · el anillo de foco es de 2 px #F8F9FA, separado 2 px, y se pinta en la tarjeta", async () => {
  const { CSS_R5_1 } = await import("../../components/RepasoCapitulo5View.jsx");
  assert.match(CSS_R5_1, /\[data-r5-1\] button:focus-visible[^{]*\{\s*outline: 2px solid #F8F9FA; outline-offset: 2px; \}/);
  const { caja } = await montar(h(RepasoCruzado, { pantallas: [pantalla("c8")] }));
  assert.ok([...caja.querySelectorAll("style")].some((x) => x.textContent === CSS_R5_1), "la hoja del anillo no se pinta");
});

/* ═══════════ EL DETALLE: LA PISTA Y LA CLASIFICACIÓN QUE CABE ═══════════ */

test("★★★ el detalle de cada ítem dice si el estudiante abrió la pista antes de responder, sin cambiar los FP", async () => {
  const fin = [];
  const { caja } = await montar(h(RepasoCruzado, { pantallas: P, onCompletar: (...x) => fin.push(x) }));
  /* Abre la pista en la 1, la 4 y la 6; en las demás, no. Acierta todas. */
  const conPista = new Set(["c3", "c8", "c10"]);
  for (const p of P) {
    if (conPista.has(p.id)) await tocar(caja.querySelector("[data-ver-pista]"));
    await responder(caja, p, bienDe(p));
    await siguiente(caja);
  }
  const [pct, , detalle] = fin[0];
  assert.deepEqual(detalle.map((d) => [d.item, d.pista]), P.map((p) => [p.id, conPista.has(p.id)]));
  assert.ok(detalle.every((d) => typeof d.pista === "boolean"));
  assert.equal(pct, 100, "la pista no quita FP");
});

test("★★★ la respuesta de la pantalla 4 cabe en los 120 caracteres del servidor y nombra la primera ficha mal (guarda: 728 clasificaciones)", () => {
  const p = pantalla("c8");
  const SQL = leer("supabase/migrations/0036_cierre_semanal_y_podio.sql");
  assert.match(SQL, /left\(d ->> 'respuesta', 120\)/);
  assert.equal(D.LARGO_RESPUESTA, 120);
  const botones = ["suma", "resta", "fuera"];
  let revisadas = 0;
  for (let n = 0; n < 3 ** 6; n++) {
    const c = Object.fromEntries(p.datos.map((d, k) => [d.id, botones[Math.floor(n / 3 ** k) % 3]]));
    if (D.evaluarC8(p, c).ok) continue;
    revisadas++;
    const r = D.respuestaDeC8(p, c);
    assert.ok(r.length <= 120, `${r.length}: ${r}`);
    const mal = p.datos.filter((d) => c[d.id] !== D.botonCorrectoDe(d));
    assert.ok(r.startsWith(`${mal[0].etiqueta}: `), r);
    /* Solo las mal puestas, enteras; si no caben todas, termina en « · …». */
    const partes = r.split(" · ");
    const enteras = partes.at(-1) === "…" ? partes.slice(0, -1) : partes;
    assert.equal(partes.at(-1) === "…", enteras.length < mal.length, r);
    enteras.forEach((x, k) => assert.equal(x.split(": ")[0], mal[k].etiqueta, r));
  }
  assert.equal(revisadas, 728);
  assert.equal(D.respuestaDeC8(p, { ...CLAVE_C8, ventas: "suma", "inventario-final": "fuera" }), "Ventas: Suma · Inventario final: No entra");
});
