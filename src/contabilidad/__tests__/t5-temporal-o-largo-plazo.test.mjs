import { test } from "node:test";
import assert from "node:assert/strict";
import { readFileSync, readdirSync } from "node:fs";
import { JSDOM, VirtualConsole } from "jsdom";
import { sinUnSoloIntento } from "../armaLaLinea.js";

/*
 * ═══════════════════════════════════════════════════════════════════════════
 * T5 · N1 «¿Temporal o a largo plazo?» (Célula C) · Hacer.
 *
 *   · cada texto es, letra por letra, el de la tanda 1 v1.1 de Near con el
 *     recorte B2 de Near encima (paquetes/a7-n1-recorte.md, leído por
 *     recorteNearA7N1.mjs): el enunciado, ritmo-del-negocio y la-intencion
 *   · B2: con la cuenta de Near, el enunciado y cada ítem ≤ 60 palabras
 *   · sin cifras; la cautela del libro va entera en la opción
 *   · patrón C4 (motor t7/decisionC4.jsx, registro c4/t5N1_c4.js): al
 *     tocar, el caso cae en su cajón del balance; el veredicto, a los 380 ms;
 *     la mala con su falla y la correcta con «Iba aquí»; el foco al mensaje
 *   · B2: más de 60 palabras solo en PENDIENTES_NEAR (Near los recorta)
 *   · un solo intento por ítem; los bloques 1 y 2 en el orden de la tanda,
 *     el bloque 3 barajado; nueve unidades; el porcentaje es aciertos / 9
 *   · evaluativa, fácil, 10 FP, en el cliente y en la migración 0110; en T5
 *     entre b5-t5-a1 y N3 (N2 salió); la vista lo abre y registra con el motor; el panel
 *     docente lee cada ítem
 * ═══════════════════════════════════════════════════════════════════════════
 */

const dom = new JSDOM("<!doctype html><html><body></body></html>", { url: "http://localhost/", virtualConsole: new VirtualConsole() });
const w = dom.window;
/* REDUCIDO: el recorrido de siempre corre con movimiento reducido (veredicto en el mismo toque); la prueba C4 lo apaga. */
let REDUCIDO = true;
w.matchMedia = (q) => ({ matches: REDUCIDO && /prefers-reduced-motion: reduce/.test(q), addEventListener() {}, removeEventListener() {}, addListener() {}, removeListener() {} });
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

const D = await import("../../data/contabilidadT5_n1.js");
const L = await import("../t5N1.js");
const { SUBJECTS, HACER, actividadesDeTipo, clasificacionDe } = await import("../../data/subjects.js");
const { default: TemporalOLargoPlazo } = await import("../../components/mecanicas/libros/t5/TemporalOLargoPlazo.jsx");
const { JUEGOS, TEMA: TEMA_T5 } = await import("../../components/ContabilidadTema5View.jsx");
const { etiquetaDeItem, recortar } = await import("../../docente/etiquetasItem.js");
const C4 = await import("../../components/mecanicas/libros/t7/decisionC4.jsx");
const C4N1 = await import("../c4/t5N1_c4.js");
const CANON = await import("../canonEnganche.js");
const R = await import("./recorteNearA7N1.mjs");

const RAIZ = new URL("../../../", import.meta.url);
const leer = (f) => readFileSync(new URL(f, RAIZ), "utf8");
const TANDA = leer("orquestador/conocimiento/paquetes/t5-tanda1-v1.1.md");
const N1 = TANDA.slice(TANDA.indexOf("## N1 · "), TANDA.indexOf("### Notas", TANDA.indexOf("## N1 · ")));
const MAPA = leer("orquestador/conocimiento/mapas/t5-activos-financieros.md");
const VISTA = leer("src/components/ContabilidadTema5View.jsx");
const MIGRACION = leer("supabase/migrations/0110_t5_temporal_o_largo_plazo.sql");
const TEMA = SUBJECTS.contabilidad.topics.find((t) => t.id === TEMA_T5);
const citas = (celda) => [...celda.matchAll(/«([^»]+)»/g)].map((m) => m[1]);
const filas = (desde, hasta) => {
  const s = N1.slice(N1.indexOf(desde), N1.indexOf(hasta));
  return s.split("\n").filter((l) => /^\| \d \|/.test(l)).map((l) => l.replace(/^\| | \|$/g, "").split(" | "));
};
const linea = (rotulo) => N1.split("\n").find((l) => l.startsWith(rotulo));
const RECORTE = R.leerRecorte();
const NUEVO = R.recorteN1(RECORTE);
/* Lo que el recorte cambia; el resto de los textos sigue siendo el de la tanda. */
const conRecorte = (id, campo, deLaTanda) => NUEVO[id]?.[campo] ?? deLaTanda;

/* ═══════════ 1 · TEXTOS ═══════════ */

test("★★★ el enunciado, el pie y la pantalla del bloque 2 son los de la tanda, letra por letra", () => {
  assert.ok(N1.startsWith(`## N1 · «${D.N1.nombre}»`));
  assert.ok(N1.includes(`id \`${D.N1_ID}\``));
  assert.ok(N1.includes("Migración **0110**"));
  const en = N1.slice(N1.indexOf("### Enunciado"), N1.indexOf("### Bloque 1")).split("\n").filter((l) => l.startsWith("- «"));
  /* El recorte reemplaza las dos líneas de la tanda, una por una. */
  assert.equal(en.length, 2);
  assert.deepEqual(D.N1.enunciado, NUEVO.enunciado);
  for (const [k, t] of en.map((l) => citas(l)[0]).entries()) assert.notEqual(D.N1.enunciado[k], t, "el enunciado sigue siendo el de la tanda");
  assert.ok(N1.includes(`**Pie de todos los ítems:** «${D.N1.pie}».`));
  assert.equal(D.ITEMS_N1[5].intro, citas(linea("- Pantalla: "))[0]);
});

test("★★★ los nueve ítems son los de la tanda: caso, correcta, si falla, si acierta y opciones", () => {
  const it = D.ITEMS_N1;
  assert.equal(it.length, 9);
  const b1 = filas("### Bloque 1", "### Bloque 2");
  const b2 = filas("### Bloque 2", "### Bloque 3");
  assert.equal(b1.length, 5);
  assert.equal(b2.length, 3);
  for (const [k, [n, caso, correcta, error, acierto]] of [...b1, ...b2].entries()) {
    assert.equal(n, String(k < 5 ? k + 1 : k - 4));
    assert.equal(it[k].pregunta, conRecorte(it[k].id, "pregunta", citas(caso)[0]), it[k].id);
    assert.equal(it[k].correcta, correcta, it[k].id);
    assert.equal(it[k].error, conRecorte(it[k].id, "error", citas(error)[0]), it[k].id);
    assert.equal(it[k].acierto, conRecorte(it[k].id, "acierto", citas(acierto)[0]), it[k].id);
    assert.equal(it[k].bloque, k < 5 ? 1 : 2);
  }
  const ops1 = citas(N1.split("\n").find((l) => l.startsWith("Opciones en todos los casos: ")));
  for (const x of it.slice(0, 5)) assert.deepEqual(x.opciones, ops1);
  assert.deepEqual(ops1, ["Temporal", "Puede ser más apropiado a largo plazo"]);
  const ops2 = citas(linea("- Opciones en los tres: "));
  for (const x of it.slice(5, 8)) assert.deepEqual(x.opciones, ops2);
  /* El bloque 3 entero viene del recorte (la tanda lo traía; el recorte lo reemplaza campo por campo). */
  const b3 = it[8];
  const r3 = NUEVO["la-intencion"];
  assert.equal(b3.id, "la-intencion");
  assert.equal(citas(linea("- Opciones: ")).length, 3);
  assert.equal(b3.pregunta, r3.pregunta);
  assert.deepEqual(b3.opciones, r3.opciones);
  assert.equal(b3.correcta, r3.correcta);
  assert.equal(b3.error, r3.error);
  assert.equal(b3.acierto, r3.acierto);
  for (const o of b3.opciones) assert.doesNotMatch(o, /\bcomo\b/, `«${o}»: el recorte dice que ninguna opción lleva «como»`);
  assert.deepEqual(b3.opciones.map(R.palabras), [6, 7, 7]);
});

test("★★★ recorte de Near: cada fila del paquete está, letra por letra, y nada de la entrega pendiente se construyó", () => {
  /* Cada fila del paquete, en su campo, y su cuenta de palabras es la de Near. */
  const dondeVa = {
    "enunciado[0]": D.N1.enunciado[0], "enunciado[1]": D.N1.enunciado[1],
    "la-intencion · correcta": D.ITEMS_N1[8].correcta,
  };
  const opciones = D.ITEMS_N1[8].opciones.slice(1);
  for (const f of RECORTE.n1.campos) {
    assert.equal(R.palabras(f.texto), f.palabras, `${f.campo}: Near cuenta ${f.palabras}`);
    if (f.campo in dondeVa) { assert.equal(dondeVa[f.campo], f.texto, f.campo); continue; }
    if (f.campo === "la-intencion · opción") { assert.equal(opciones.shift(), f.texto); continue; }
    const [id, campo] = f.campo.split(" · ");
    assert.equal(D.ITEMS_N1.find((x) => x.id === id)[campo], f.texto, f.campo);
  }
  assert.deepEqual(opciones, []);
  /* C7: las dos condiciones de una inversión temporal siguen enteras en el enunciado; la cautela, tal cual. */
  assert.match(D.N1.enunciado[1], /se puede vender rápido/);
  assert.match(D.N1.enunciado[1], /en un año o en un ciclo de operaciones, el que sea más largo/);
  assert.match(D.N1.enunciado[0], /puede ser más apropiado/);
  /* Lo que sigue pendiente de «N1: lo que pidió Mello» no se inventó. */
  assert.ok(D.ITEMS_N1.some((x) => x.id === "bono-de-tesoreria"));
  assert.ok(!D.ITEMS_N1.some((x) => x.id === "bonos-de-compania"));
});

test("★★★ B2 con la cuenta de Near: enunciado y cada ítem ≤ 60, y los totales son los del paquete", () => {
  /* Control: el contador reproduce la cuenta de main que da Near (66, 71 y 71). */
  const enMain = N1.slice(N1.indexOf("### Enunciado"), N1.indexOf("### Bloque 1")).split("\n").filter((l) => l.startsWith("- «")).map((l) => citas(l)[0]);
  assert.equal(enMain.reduce((n, t) => n + R.palabras(t), 0), RECORTE.n1.antes.enunciado);
  const total = { enunciado: D.N1.enunciado.reduce((n, t) => n + R.palabras(t), 0) };
  for (const it of D.ITEMS_N1) total[it.id] = R.b2N1(it) + (it.intro ? R.palabras(it.intro) : 0);
  for (const [k, n] of Object.entries(RECORTE.n1.totales)) assert.equal(total[k], n, `${k}: Near cuenta ${n}`);
  for (const [k, n] of Object.entries(total)) {
    assert.ok(n <= 60, `${k}: ${n} palabras`);
    if (!(k in RECORTE.n1.totales)) assert.ok(n <= RECORTE.n1.demasHasta, `${k}: ${n} > ${RECORTE.n1.demasHasta}`);
  }
});

test("★★★ sin cifras; la cautela del libro va entera, y nada interno sale en pantalla", () => {
  const texto = JSON.stringify([D.N1, D.ITEMS_N1]);
  /* Las únicas cifras son las páginas del pie. */
  const visibles = [...D.N1.enunciado, ...D.ITEMS_N1.flatMap((x) => [x.pregunta, x.error, x.acierto, x.intro ?? "", ...x.opciones])];
  for (const v of visibles) assert.doesNotMatch(v, /\$|\d/, v);
  for (const x of D.ITEMS_N1.filter((y) => y.correcta.includes("largo plazo"))) {
    assert.equal(x.correcta, "Puede ser más apropiado a largo plazo");
    assert.match(x.error, /puede ser más apropiado clasificarlas a largo plazo/);
  }
  assert.doesNotMatch(texto, /bono del Estado|contingencia|principio muy difícil/);
  for (const interno of ["CONSTRUCCIÓN", "construcción", "Near", "Mello", "INFLESZ", "C5-"]) assert.ok(!texto.includes(interno), interno);
});

/* ═══════════ 2 · LA MECÁNICA, MONTADA (patrón C4, t7/decisionC4.jsx) ═══════════ */

/* El bloque 3, sin barajar, para el recorrido; la prueba de abajo comprueba que se baraja. */
const EN_ORDEN = L.prepararN1((xs) => xs);
const Marco = ({ children }) => h("section", { "data-marco": true }, children);
const montar = async (props = {}) => {
  const caja = document.createElement("div");
  document.body.appendChild(caja);
  const raiz = createRoot(caja);
  const completados = [];
  await act(async () => { raiz.render(h(TemporalOLargoPlazo, { Marco, onCompletar: (...a) => completados.push(a), items: EN_ORDEN, ...props })); });
  return { caja, completados, desmontar: () => { act(() => raiz.unmount()); caja.remove(); } };
};
const tocar = async (el) => {
  assert.ok(el, "no está el elemento que se quería tocar");
  await act(async () => { el.dispatchEvent(new w.MouseEvent("click", { bubbles: true })); });
};
/* El veredicto llega 380 ms después del toque (ESPERA_C4); con movimiento reducido, en el mismo toque. */
const esperar = async (ms = C4.ESPERA_C4 + 20) => { await act(async () => { await new Promise((r) => setTimeout(r, ms)); }); };
const opcion = (caja, v) => [...caja.querySelectorAll("[data-op]")].find((b) => b.dataset.op === v);
const boton = (caja, texto) => [...caja.querySelectorAll("button")].find((b) => b.textContent === texto);

async function jugar(m, falla, { reducido = true } = {}) {
  REDUCIDO = reducido;
  const detalle = [];
  for (const [k, it] of EN_ORDEN.entries()) {
    const q = (sel) => m.caja.querySelector(sel);
    assert.equal(q("[data-texto]").textContent, it.pregunta, `orden: el ítem ${k + 1}`);
    assert.equal(q("[data-pie]").textContent, D.N1.pie);
    assert.deepEqual([...m.caja.querySelectorAll("[data-enunciado] p")].map((p) => p.textContent), D.N1.enunciado.slice(1), "el resto del enunciado, siempre a la vista");
    assert.deepEqual([...m.caja.querySelectorAll("[data-intro] p")].map((p) => p.textContent), it.intro ? [it.intro] : [], `intro del ítem ${k + 1}`);
    assert.deepEqual([...m.caja.querySelectorAll("[data-op]")].map((x) => x.dataset.op), D.ITEMS_N1[k].opciones, "las opciones, en el orden de la tanda");
    assert.deepEqual([...m.caja.querySelectorAll("[data-texto-opcion]")].map((x) => x.textContent), D.ITEMS_N1[k].opciones, "el texto de cada opción, el de Near");
    /* El objeto: el balance (bloque 1) con sus dos lados, la clase de título o lo que respalda la intención. */
    const marco = { 1: "balance", 2: "clase", 3: "intencion" }[D.ITEMS_N1[k].bloque];
    assert.equal(q("[data-objeto-n1]").dataset.objetoN1, marco);
    assert.equal(q("[data-objeto-n1] .t5c4-tit").textContent, C4N1.FIGURA_N1_C4[marco]);
    assert.deepEqual([...m.caja.querySelectorAll("[data-rotulo]")].map((x) => x.textContent), marco === "balance" ? [C4N1.FIGURA_N1_C4.corriente, C4N1.FIGURA_N1_C4.noCorriente] : []);
    assert.equal(q("[data-chip]"), null, "nada cae antes de tocar");
    const v = falla(it.id) ? it.opciones.find((o) => o.valor !== it.correcta).valor : it.correcta;
    const ok = v === it.correcta;
    await tocar(opcion(m.caja, v));
    /* 1 · la consecuencia: el caso cae en el cajón tocado. */
    assert.ok(opcion(m.caja, v).querySelector("[data-chip]"), `${it.id}: el caso no cayó en su cajón`);
    assert.equal(q("[data-chip]").textContent, C4N1.FIGURA_N1_C4.chip);
    if (!reducido) {
      assert.equal(q("[data-mensaje]"), null, "el veredicto llegó antes de 380 ms");
      assert.equal(q("[data-falla]"), null);
      assert.ok(opcion(m.caja, v).classList.contains("tocada"));
      await esperar();
    }
    /* 2 · el veredicto: el mensaje de Near, la marca, la falla de la mala y «Iba aquí» en la buena. */
    assert.deepEqual([...m.caja.querySelectorAll("[data-mensaje] [data-texto-retro]")].map((p) => p.textContent), [ok ? it.acierto : it.error]);
    assert.ok(opcion(m.caja, v).classList.contains(ok ? "bien" : "mal"));
    for (const o of it.opciones) assert.equal(opcion(m.caja, o.valor).getAttribute("aria-disabled"), "true", "un solo intento");
    if (ok) assert.equal(q("[data-falla]"), null);
    else {
      assert.equal(q("[data-falla]").textContent, { 1: C4N1.FALLA_N1_C4.balance, 2: C4N1.FALLA_N1_C4.otro, 3: C4N1.FALLA_N1_C4.intencion[v] }[D.ITEMS_N1[k].bloque]);
      assert.ok(q("[data-falla] svg"), "la falla, con su ✕");
      assert.ok(opcion(m.caja, it.correcta).classList.contains("iba"));
      assert.equal(opcion(m.caja, it.correcta).querySelector("[data-pastilla]").textContent, "Iba aquí");
      assert.ok(opcion(m.caja, v).querySelector("[data-chip]"), "la mala se queda a la vista");
    }
    assert.equal(document.activeElement, q("[data-c4-msg]"), "el foco va al mensaje");
    detalle.push({ item: it.id, ok, intentos: 1, respuesta: ok ? null : v, orden: detalle.length + 1 });
    await tocar(boton(m.caja, k === 8 ? C4.BOTONES_C4.verResumen : C4.BOTONES_C4.siguiente));
    if (k < 8) assert.equal(document.activeElement, q("[data-texto]"), "el foco va al caso siguiente");
  }
  REDUCIDO = true;
  return detalle;
}

test("★★★ la tanda entera: nueve ítems, un intento cada uno, y el porcentaje es aciertos / 9", async () => {
  const m = await montar();
  try {
    assert.equal(m.caja.querySelector("[data-consigna]").textContent, sinUnSoloIntento(D.N1.enunciado[0]));
    for (const p of D.N1.enunciado) assert.ok(m.caja.textContent.includes(sinUnSoloIntento(p)), p);
    assert.ok(m.caja.querySelector("[data-contador-intento] [data-un-intento]"), "el distintivo junto al contador");
    const fallos = new Set(["no-se-negocian", "bonos-del-gobierno", "la-intencion"]);
    const detalle = await jugar(m, (id) => fallos.has(id));
    assert.equal(m.completados.length, 1);
    const [pct, , det] = m.completados[0];
    assert.deepEqual(det, detalle);
    assert.deepEqual(det.map((d) => d.item), L.unidadesN1());
    assert.equal(L.TOTAL_N1, 9);
    assert.equal(pct, (6 / 9) * 100);
    assert.equal(pct, L.puntuarN1(6));
    assert.ok(m.caja.querySelector("[data-resumen]").textContent === D.resumenN1(6, 9));
  } finally {
    m.desmontar();
  }
});

test("★★★ C4 · sin movimiento reducido: la consecuencia en el acto, el veredicto a los 380 ms (todos los ítems, uno mal y uno bien alternados)", async () => {
  const m = await montar();
  try {
    const detalle = await jugar(m, (id) => D.ITEMS_N1.findIndex((x) => x.id === id) % 2 === 0, { reducido: false });
    assert.deepEqual(m.completados[0][2], detalle);
    assert.equal(m.completados[0][0], (4 / 9) * 100);
  } finally {
    m.desmontar();
  }
});

test("★★ solo el bloque 3 se baraja", () => {
  const vistos = new Set();
  for (let i = 0; i < 40; i++) {
    const p = L.prepararN1();
    for (const [k, x] of p.slice(0, 8).entries()) assert.deepEqual(x.opciones.map((o) => o.valor), D.ITEMS_N1[k].opciones);
    vistos.add(p[8].opciones.map((o) => o.valor).join("|"));
  }
  assert.ok(vistos.size > 1, "el bloque 3 no se baraja");
  /* Y la pieza montada sin `items` baraja una vez por partida, con el mismo preparar. */
  assert.match(leer("src/components/mecanicas/libros/t5/TemporalOLargoPlazo.jsx"), /useState\(\(\) => piezaN1\(items \?\? prepararN1\(\)\)\)/);
});

/* ═══════════ 2b · C4: LA CONSECUENCIA, PURA (contabilidad/c4/t5N1_c4.js) ═══════════ */

test("★★★ C4 · el registro lleva los ítems de Near tal cual, en los dos sentidos: caso, opciones, correcta, error y acierto", () => {
  const P = C4N1.CONSECUENCIA_C4;
  assert.equal(P.id, "t5-n1");
  assert.equal(P.objeto, "El balance de la empresa");
  assert.equal(P.modo, "hacer");
  assert.deepEqual(P.items.map((x) => x.id), D.ITEMS_N1.map((x) => x.id));
  for (const [k, x] of P.items.entries()) {
    const it = D.ITEMS_N1[k];
    assert.equal(x.texto, it.pregunta);
    assert.equal(x.intro, it.intro ?? null);
    assert.equal(x.bien, it.acierto);
    assert.equal(x.pie, D.N1.pie);
    assert.deepEqual(x.opciones.map((o) => o.t), it.opciones);
    assert.deepEqual(x.opciones.map((o) => o.id), it.opciones, "el id es el texto: el detalle guarda lo mismo que en main");
    assert.deepEqual(x.opciones.filter((o) => o.correcta).map((o) => o.t), [it.correcta]);
    for (const o of x.opciones) assert.equal(o.msg, it.error);
  }
});

test("★★★ C4 · cada opción pinta su cajón; la mala, con su falla [W] (la intención, con las de Mello C4-4); sin elegir, nada cae", () => {
  assert.deepEqual(Object.keys(C4N1.FALLA_N1_C4.intencion), D.ITEMS_N1[8].opciones.filter((o) => o !== D.ITEMS_N1[8].correcta));
  assert.deepEqual(Object.values(C4N1.FALLA_N1_C4.intencion), ["Así bastaría con decirlo, y el libro pide evidencias.", "Así decidiría el nombre del título, no la intención."]);
  const P = C4N1.CONSECUENCIA_C4;
  for (const it of P.items) {
    const base = P.consecuencia(it, null);
    assert.deepEqual(base, { marco: C4N1.marcoDeN1(it), cajon: null });
    for (const o of it.opciones) {
      const e = P.consecuencia(it, o.id);
      assert.equal(e.cajon, o.id);
      assert.equal(e.rotulo, it.bloque === 1 ? (o.t === "Temporal" ? C4N1.FIGURA_N1_C4.corriente : C4N1.FIGURA_N1_C4.noCorriente) : null);
      assert.equal(e.falla, o.correcta ? undefined : { 1: C4N1.FALLA_N1_C4.balance, 2: C4N1.FALLA_N1_C4.otro, 3: C4N1.FALLA_N1_C4.intencion[o.id] }[it.bloque]);
    }
  }
});

/* ═══════════ 2c · B2 · 60 PALABRAS (PENDIENTES_NEAR) ═══════════ */

/*
 * PENDIENTES_NEAR: los ítems con un estado de más de 60 palabras visibles. Son
 * textos de Near, y él los está recortando: se dejan como en main y siguen
 * pasándose. Si uno deja de pasarse, se saca de la lista (que ninguno se
 * quede escondido). Se cuenta lo que se lee del ítem con la regla de
 * canonEnganche.js (la figura aparte: los cajones son las opciones), sin lo
 * fijo de toda la tanda (encabezado, resto del enunciado y contador), como
 * en la tabla de Watari (N1: 64).
 */
const FIJO = "[data-encabezado], [data-antes-n1] [data-enunciado], [data-contador-intento]";
const PENDIENTES_NEAR = new Set(["ritmo-del-negocio"]);

test("★★★ B2: ningún ítem pasa de 60 palabras visibles, salvo los que Near está recortando (que siguen pasándose)", async (t) => {
  const peor = {};
  for (const malo of [false, true]) {
    const m = await montar();
    try {
      for (const [k, it] of EN_ORDEN.entries()) {
        const medir = () => {
          const r = CANON.medirTarjeta(CANON.tarjetaDe(m.caja), w);
          const fijo = [...m.caja.querySelectorAll(FIJO)].reduce((n, el) => n + CANON.contarPalabras(el.textContent), 0);
          peor[it.id] = Math.max(peor[it.id] ?? 0, r.texto - fijo);
        };
        medir();
        await tocar(opcion(m.caja, malo ? it.opciones.find((o) => o.valor !== it.correcta).valor : it.correcta));
        medir();
        await tocar(boton(m.caja, k === 8 ? C4.BOTONES_C4.verResumen : C4.BOTONES_C4.siguiente));
      }
    } finally {
      m.desmontar();
    }
  }
  for (const [id, n] of Object.entries(peor)) t.diagnostic(`B2 ${id}: ${n}`);
  assert.deepEqual(Object.keys(peor), D.ITEMS_N1.map((x) => x.id));
  assert.deepEqual(Object.entries(peor).filter(([id, n]) => n > CANON.UMBRAL_B2_PALABRAS && !PENDIENTES_NEAR.has(id)), []);
  assert.deepEqual([...PENDIENTES_NEAR].filter((id) => peor[id] <= CANON.UMBRAL_B2_PALABRAS), []);
});

/* ═══════════ 3 · CATÁLOGO, VISTA, MIGRACIÓN, PANEL DOCENTE ═══════════ */

/* N2 iba después de N1 y salió de la lista con la fusión de la entrega 5 de Near: ahora sigue N3, que la lleva adentro. */
test("★★★ en T5 entre b5-t5-a1 y N3 (decisión de corte, punto 6; N2 salió): evaluativa, fácil, 10 FP", () => {
  assert.deepEqual(clasificacionDe("contabilidad", TEMA_T5, D.N1_ID), { tipo: HACER, modalidad: "evaluativa", dificultad: "facil", fpBase: 10 });
  assert.equal(TEMA.actividades.find((a) => a.id === D.N1_ID).nombre, D.N1.nombre);
  const ids = TEMA.actividades.map((x) => x.id);
  assert.equal(ids.indexOf(D.N1_ID), ids.indexOf("b5-t5-a1") + 1);
  assert.ok(!ids.includes("t5-a1-cuidar-las-inversiones"));
  assert.equal(ids.indexOf("t5-revision-que-falta"), ids.indexOf(D.N1_ID) + 1);
});

test("★★★ la vista abre lo que el catálogo ofrece y registra con el motor compartido", () => {
  const ofrecidas = actividadesDeTipo(TEMA, HACER).filter((a) => !a.pendiente).map((a) => a.id).sort();
  assert.deepEqual(JUEGOS.map((j) => j.id).sort(), ofrecidas);
  assert.equal(JUEGOS.find((j) => j.id === D.N1_ID).Mecanica, TemporalOLargoPlazo);
  assert.match(VISTA, /registrarActividadCompletada\(clas, \{\s*materiaId: MATERIA, temaId: TEMA, actividadId, porcentajeAciertos: porcentaje, duracionMs, detalle,/);
});

test("★★★ la 0110: la que da la decisión de corte, aditiva y repetible, sin correr", () => {
  assert.match(MIGRACION, /\('t5-temporal-o-largo-plazo',\s*'contabilidad',\s*'activos-financieros',\s*'evaluativa',\s*'facil',\s*10,\s*1\)/);
  assert.match(MIGRACION, /on conflict \(activity_id\) do nothing;/);
  const sentencias = MIGRACION.split("\n").filter((l) => !l.trim().startsWith("--")).join("\n");
  assert.doesNotMatch(sentencias, /\b(alter|update|delete|drop|truncate)\b/i);
  assert.match(sentencias, /select activity_id[\s\S]*where activity_id = 't5-temporal-o-largo-plazo';/);
  const dir = new URL("supabase/migrations/", RAIZ);
  assert.deepEqual(readdirSync(dir).filter((f) => readFileSync(new URL(f, dir), "utf8").includes(D.N1_ID)), ["0110_t5_temporal_o_largo_plazo.sql"]);
  assert.deepEqual(readdirSync(dir).filter((f) => f.startsWith("0110")), ["0110_t5_temporal_o_largo_plazo.sql"]);
  assert.ok(MAPA.includes("0110 N1"));
});

test("★★★ el panel docente: todo item_id que guarda la partida tiene etiqueta, leída de los datos", async () => {
  const m = await montar();
  try {
    await jugar(m, () => false);
    const ids = m.completados[0][2].map((d) => d.item);
    assert.equal(ids.length, 9);
    for (const id of ids) {
      const e = etiquetaDeItem(D.N1_ID, id);
      assert.ok(typeof e === "string" && e.trim() !== "", `${id}: sin etiqueta`);
      assert.equal(e, recortar(L.unidadDeN1(id)), id);
    }
    assert.equal(new Set(ids.map((id) => L.unidadDeN1(id))).size, 9);
  } finally {
    m.desmontar();
  }
});
