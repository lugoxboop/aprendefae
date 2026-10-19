import { test } from "node:test";
import assert from "node:assert/strict";
import { readFileSync, readdirSync } from "node:fs";
import { JSDOM, VirtualConsole } from "jsdom";

/*
 * ═══════════════════════════════════════════════════════════════════════════
 * POLÍTICA MONETARIA · LOS DOS JUEGOS DE «LA FÁBRICA DEL DINERO» (Célula B).
 *
 *   ·  ningún texto pendiente; ni el verbo de las imprentas ni la palabra de
 *      los saldos de los bancos suelta, en todo pmFabricaDelDinero.js
 *   A  ¿Crea o Cambia de Manos?: los 11 hechos y sus respuestas; el ERROR
 *      CASTIGADO (elegir «Crea dinero» cuando el Banco vende) da E1 en cm-02
 *      y cm-03 y cuenta como fallo; todo fallo tiene su texto
 *   B  La Escalera del Encaje: las cifras de cada casilla son las de la
 *      escalera; las opciones salen BARAJADAS; tras un error se revela el
 *      valor correcto; las tres decisiones; «Escenario simulado» siempre a la
 *      vista; pct = aciertos / 12 × 100
 *   ·  la 0073: solo insert, on conflict do nothing; su comprobación dice 16
 *      filas y 715 FP, y con la 0091 el tema cierra en 18 y 750
 * ═══════════════════════════════════════════════════════════════════════════
 */

const dom = new JSDOM("<!doctype html><html><body></body></html>", { url: "http://localhost/", virtualConsole: new VirtualConsole() });
const w = dom.window;
w.matchMedia = (q) => ({ matches: false, media: q, addEventListener() {}, removeEventListener() {}, addListener() {}, removeListener() {} });
w.Element.prototype.scrollIntoView = () => {};
for (const [k, v] of Object.entries({
  window: w, document: w.document, navigator: w.navigator, localStorage: w.localStorage,
  HTMLElement: w.HTMLElement, Element: w.Element, Node: w.Node, SVGElement: w.SVGElement,
  Event: w.Event, MouseEvent: w.MouseEvent, KeyboardEvent: w.KeyboardEvent,
  getComputedStyle: w.getComputedStyle.bind(w), matchMedia: w.matchMedia,
})) {
  Object.defineProperty(globalThis, k, { value: v, configurable: true, writable: true });
}
globalThis.IS_REACT_ACT_ENVIRONMENT = true;

const React = await import("react");
const { createRoot } = await import("react-dom/client");
const act = React.act;
const h = React.createElement;

const F = await import("../../../data/pmFabricaDelDinero.js");
const { CreaOCambia, EscaleraDelEncaje, DEMO_AVANCE_MS, cifra } = await import("../maquinas/fabricaDelDinero.jsx");

const Marco = ({ children }) => h("div", null, children);
const montar = async (Componente, props = {}) => {
  const caja = document.createElement("div");
  document.body.appendChild(caja);
  const raiz = createRoot(caja);
  await act(async () => { raiz.render(h(Componente, { Marco, ...props })); });
  return { caja, desmontar: () => { act(() => raiz.unmount()); caja.remove(); } };
};
/* Por su texto, o por su inicio: tras responder, la opción lleva un texto oculto para lectores («era esta»). */
const opcionesDe = (caja) => [...caja.querySelectorAll("button[data-estado]")];
const visible = (b) => {
  const copia = b.cloneNode(true);
  copia.querySelectorAll(".fae-jg-oculto, [class*='oculto']").forEach((n) => n.remove());
  return copia.textContent.trim();
};
const boton = (caja, texto) => [...caja.querySelectorAll("button")].find((b) => b.textContent.trim() === texto)
  ?? opcionesDe(caja).find((b) => visible(b) === texto)
  ?? [...caja.querySelectorAll("button")].find((b) => b.textContent.trim().startsWith(texto));
const clic = async (el) => { assert.ok(el, "no está el botón"); await act(async () => { el.click(); }); };
const retro = (caja) => {
  const p = caja.querySelector('[role="status"]');
  return p ? [...p.childNodes].filter((n) => !n.classList?.contains("fae-jg-oculto")).map((n) => n.textContent).join("") : null;
};
const dormir = (ms) => act(async () => { await new Promise((r) => setTimeout(r, ms)); });

/* ═══════════ LOS TEXTOS: COMPLETOS Y CON EL VOCABULARIO DE SHOKO ═══════════ */

const FUENTE = readFileSync(new URL("../../../data/pmFabricaDelDinero.js", import.meta.url), "utf8");

test("★★★ ningún «PENDIENTE: Futaba» queda en los textos", () => {
  const pendientes = (v, ruta = "") => {
    if (typeof v === "string") return v.includes(F.PENDIENTE) ? [ruta] : [];
    if (Array.isArray(v)) return v.flatMap((x, k) => pendientes(x, `${ruta}[${k}]`));
    if (v && typeof v === "object") return Object.entries(v).flatMap(([k, x]) => pendientes(x, `${ruta}.${k}`));
    return [];
  };
  assert.deepEqual(pendientes({ a: [F.PENDIENTE] }), [".a[0]"], "control positivo");
  const exportados = Object.fromEntries(Object.entries(F).filter(([k]) => k !== "PENDIENTE"));
  assert.deepEqual(pendientes(exportados), []);
  assert.equal(FUENTE.split("\n").filter((l) => l.includes("PENDIENTE:") && !l.includes("export const PENDIENTE")).length, 0);
});

test("★★★ en pmFabricaDelDinero.js no queda ni un «imprime» ni una «reserva(s)» suelta: solo «reserva bancaria» y «reservas internacionales»", () => {
  const imprentas = (t) => [...t.matchAll(/imprim\w*/gi)].map((m) => m[0]);
  const sueltas = (t) => [...t.matchAll(/\breservas?\b(?! bancaria\b)(?! internacionales\b)/gi)].map((m) => t.slice(m.index, m.index + 30));
  /* Controles positivos: el detector ve lo que tiene que ver, y deja pasar lo permitido. */
  assert.deepEqual(imprentas("El Banco imprime billetes"), ["imprime"]);
  assert.equal(sueltas("las reservas de los bancos").length, 1);
  assert.equal(sueltas("la reserva de los bancos").length, 1);
  assert.equal(sueltas("la reserva bancaria y las reservas internacionales").length, 0);
  assert.deepEqual(imprentas(FUENTE), []);
  assert.deepEqual(sueltas(FUENTE), []);
  /* Y lo permitido está donde Futaba lo puso. */
  assert.ok(F.APRENDER_FABRICA.nombres.find((n) => n.termino === "Base monetaria").definicion.includes("reserva bancaria"));
  assert.equal(F.APRENDER_FABRICA.pasos.at(-1).texto, "El Banco crea, los bancos multiplican, el encaje frena.");
});

/* ═══════════════════ A · ¿CREA O CAMBIA DE MANOS? ═══════════════════ */

test("★★★ A: las tres opciones en su orden, y los 11 hechos con la respuesta de Futaba (3 crean, 6 cambian de manos, 2 sacan)", () => {
  assert.deepEqual(F.OPCIONES_CREA_O_CAMBIA.map((o) => o.nombre), ["Crea dinero", "Solo cambia de manos", "Saca dinero"]);
  const r = Object.fromEntries(F.HECHOS_CREA_O_CAMBIA.map((x) => [x.id, x.respuesta]));
  assert.deepEqual(r, {
    "cm-01": F.CAMBIA, "cm-02": F.SACA, "cm-03": F.SACA, "cm-04": F.CREA, "cm-05": F.CREA, "cm-06": F.CREA,
    "cm-07": F.CAMBIA, "cm-08": F.CAMBIA, "cm-09": F.CAMBIA, "cm-10": F.CAMBIA, "cm-11": F.CAMBIA,
  });
  /* Los pares que obligan a mirar quién compra. */
  const texto = (id) => F.HECHOS_CREA_O_CAMBIA.find((x) => x.id === id).texto;
  assert.match(texto("cm-04"), /^El Banco de la República compra dólares/);
  assert.match(texto("cm-08"), /^Una empresa le compra dólares a otra empresa/);
  assert.match(texto("cm-07"), /^Un banco le compra un TES a otro banco/);
});

test("★★★ A: el ERROR CASTIGADO — «Crea dinero» en una venta del Banco (cm-02, cm-03) da E1 y cuenta como fallo", async () => {
  /* El texto de E1, literal de la entrega de Futaba con PASA de Shoko: no sale del mismo archivo que se prueba. */
  assert.equal(F.ERRORES_CREA_O_CAMBIA.E1, "Vender no mete plata: la saca. Cuando el Banco de la República vende TES o dólares, recibe pesos de quien compra, y esos pesos dejan de circular.");
  for (const id of ["cm-02", "cm-03"]) {
    const x = F.HECHOS_CREA_O_CAMBIA.find((y) => y.id === id);
    assert.equal(F.tipoDeErrorCreaOCambia(x, F.CREA), "E1");
    let pct = null;
    let detalle = null;
    const m = await montar(CreaOCambia, { items: [x], onCompletar: (p, ms, d) => { pct = p; detalle = d; } });
    await clic(boton(m.caja, "Crea dinero"));
    assert.equal(retro(m.caja), `❌${F.ERRORES_CREA_O_CAMBIA.E1}`, `${id}: la devolución propia`);
    assert.equal(visible(m.caja.querySelector('[data-estado="incorrecta"]')), "Crea dinero");
    assert.equal(visible(m.caja.querySelector('[data-estado="revelada"]')), "Saca dineroera esta", "se revela la correcta, con «era esta»");
    await clic(boton(m.caja, "Ver resultado"));
    assert.equal(pct, 0, "cuenta como fallo");
    assert.deepEqual(detalle.map((d) => [d.item, d.ok, d.respuesta]), [[id, false, F.CREA]]);
    m.desmontar();
  }
  /* E1 es solo de las ventas del Banco: en ningún otro hecho «Crea dinero» da E1. */
  for (const x of F.HECHOS_CREA_O_CAMBIA.filter((y) => !["cm-02", "cm-03"].includes(y.id))) {
    assert.notEqual(F.tipoDeErrorCreaOCambia(x, F.CREA), "E1", x.id);
  }
});

test("★★★ A: todo fallo tiene su texto (con E7 en el préstamo entre personas), y un solo intento", async () => {
  for (const x of [...F.HECHOS_CREA_O_CAMBIA, F.EJEMPLO_CREA_O_CAMBIA]) {
    for (const o of F.OPCIONES_CREA_O_CAMBIA) {
      if (o.id === x.respuesta) continue;
      const t = F.tipoDeErrorCreaOCambia(x, o.id);
      assert.ok(F.ERRORES_CREA_O_CAMBIA[t], `${x.id} → ${o.id}: sin texto (${t})`);
    }
  }
  assert.equal(F.tipoDeErrorCreaOCambia(F.HECHOS_CREA_O_CAMBIA[0], F.CREA), "E7");
  const x = F.HECHOS_CREA_O_CAMBIA.find((y) => y.id === "cm-07");
  let m = await montar(CreaOCambia, { items: [x] });
  await clic(boton(m.caja, "Solo cambia de manos"));
  assert.equal(retro(m.caja), `✅${x.acierto}`);
  m.desmontar();
  m = await montar(CreaOCambia, { items: [x] });
  await clic(boton(m.caja, "Crea dinero"));
  assert.equal(retro(m.caja), `❌${F.ERRORES_CREA_O_CAMBIA.E2}`);
  assert.ok(opcionesDe(m.caja).every((b) => b.disabled), "un intento");
  m.desmontar();
});

test("★★ A: el demo no guarda nada; la partida recorre los 11 y termina con el cierre", async () => {
  let llamadas = 0;
  const demo = await montar(CreaOCambia, { items: [F.EJEMPLO_CREA_O_CAMBIA], modoDemo: true, onCompletar: () => { llamadas++; } });
  await clic(boton(demo.caja, "Crea dinero"));
  assert.equal(retro(demo.caja), `✅${F.EJEMPLO_CREA_O_CAMBIA.acierto}`);
  assert.equal(boton(demo.caja, "Ver resultado"), undefined);
  assert.equal(llamadas, 0);
  demo.desmontar();
  let pct = null;
  const m = await montar(CreaOCambia, { onCompletar: (p) => { pct = p; } });
  for (let k = 0; k < F.HECHOS_CREA_O_CAMBIA.length; k++) {
    const id = m.caja.querySelector("[data-hecho]").getAttribute("data-hecho");
    const x = F.HECHOS_CREA_O_CAMBIA.find((y) => y.id === id);
    await clic(boton(m.caja, F.OPCIONES_CREA_O_CAMBIA.find((o) => o.id === x.respuesta).nombre));
    await clic(boton(m.caja, k + 1 === F.HECHOS_CREA_O_CAMBIA.length ? "Ver resultado" : "Siguiente"));
  }
  assert.equal(pct, 100);
  assert.equal(m.caja.querySelector("[data-cierre-texto]").textContent, F.CREA_O_CAMBIA.cierre);
  m.desmontar();
});

/* ═══════════════════ B · LA ESCALERA DEL ENCAJE ═══════════════════ */

test("★★★ B: las 9 casillas tienen la cifra de la escalera (partida 1.000, 20 de cada 100), tres opciones distintas, y cada errada con su tipo", () => {
  const filas = F.escaleraDe(1000, 20, 3);
  assert.deepEqual(filas.map((f) => f.total), [1800, 2440, 2952], "vuelta 1 = 1.800");
  assert.equal(F.CASILLAS_ESCALERA.length, 9);
  for (const c of F.CASILLAS_ESCALERA) {
    const valores = c.opciones.map((o) => o.valor);
    assert.equal(new Set(valores).size, 3, `${c.id}: opciones repetidas`);
    assert.deepEqual(c.opciones.filter((o) => o.tipo === null).map((o) => o.valor), [filas[c.vuelta - 1][c.casilla]], c.id);
    for (const o of c.opciones) if (o.tipo) assert.ok(F.ERRORES_ESCALERA[o.tipo], `${c.id}: ${o.tipo} sin texto`);
  }
  assert.equal(F.CASILLAS_ESCALERA.length + F.PREGUNTAS_COMPARA.length, 12);
  for (const p of F.PREGUNTAS_COMPARA) {
    assert.equal(p.opciones.filter((o) => o.tipo === null).length, 1);
    for (const o of p.opciones) if (o.tipo) assert.ok(F.ERRORES_ESCALERA[o.tipo]);
  }
});

test("★★★ B: las opciones salen BARAJADAS — la correcta no queda siempre en el mismo sitio", async () => {
  const posiciones = new Set();
  const porCasilla = new Set();
  for (let k = 0; k < 24; k++) {
    const m = await montar(EscaleraDelEncaje);
    const textos = opcionesDe(m.caja).map(visible);
    posiciones.add(textos.indexOf(cifra(200)));
    m.desmontar();
  }
  assert.ok(posiciones.size >= 2, `la correcta de la primera casilla siempre en ${[...posiciones]}`);
  /* Y dentro de una partida: a lo largo de las 12, la correcta no va siempre primera. */
  const m = await montar(EscaleraDelEncaje);
  for (let k = 0; k < 12; k++) {
    const ops = opcionesDe(m.caja);
    const casilla = F.CASILLAS_ESCALERA[k] ?? F.PREGUNTAS_COMPARA[k - 9];
    const buena = casilla.opciones.find((o) => o.tipo === null);
    const texto = k < 9 ? cifra(buena.valor) : buena.nombre;
    porCasilla.add(ops.map(visible).indexOf(texto));
    await clic(ops[0]);
    await clic(boton(m.caja, k === 11 ? "Ver resultado" : "Siguiente"));
  }
  assert.ok(porCasilla.size >= 2, "en las 12 casillas la correcta iba siempre en el mismo sitio");
  m.desmontar();
});

test("★★★ B: un intento por casilla; tras un error, la devolución de su tipo y el valor correcto revelado en la tabla; después, las tres decisiones; pct = aciertos / 12", async () => {
  let pct = null;
  let detalle = null;
  const m = await montar(EscaleraDelEncaje, { onCompletar: (p, ms, d) => { pct = p; detalle = d; } });
  const rotulo = () => m.caja.querySelector("[data-rotulo-simulado]")?.textContent;
  assert.equal(m.caja.querySelector("[data-enunciado-escalera]").textContent, F.ENUNCIADO_ESCALERA_A);
  assert.equal(m.caja.querySelector("[data-partida]").textContent, F.PARTIDA_ESCALERA);
  assert.deepEqual([...m.caja.querySelectorAll("[data-fila] td:first-child")].map((t) => t.textContent), ["Vuelta 1", "Vuelta 2", "Vuelta 3"]);
  for (const c of F.CASILLAS_ESCALERA) {
    assert.equal(rotulo(), F.ROTULO_SIMULADO, `${c.id}: sin «Escenario simulado»`);
    const celda = () => m.caja.querySelector(`[data-celda="${c.id}"]`).textContent;
    assert.equal(celda(), "—", "lo que falta va en blanco");
    const buena = c.opciones.find((o) => o.tipo === null);
    /* Falla las de «guarda» con su error T1; acierta las demás. */
    const mal = c.casilla === "guarda" ? c.opciones.find((o) => o.tipo === "T1") : null;
    await clic(boton(m.caja, cifra((mal ?? buena).valor)));
    /* Al acertar no hay texto: Futaba no escribió acierto para las casillas; la opción se pinta correcta. */
    assert.equal(retro(m.caja), mal ? `❌${F.ERRORES_ESCALERA.T1}` : null, c.id);
    assert.ok(opcionesDe(m.caja).every((b) => b.disabled), "un intento");
    assert.equal(celda(), cifra(buena.valor), `${c.id}: el valor correcto queda en la tabla, también tras el error`);
    if (mal) assert.equal(visible(m.caja.querySelector('[data-estado="revelada"]')), `${cifra(buena.valor)}era esta`, "se revela la correcta, con «era esta»");
    await clic(boton(m.caja, "Siguiente"));
  }
  /* Las dos escaleras: la A construida y la B ya armada, con el mismo punto de partida. */
  assert.equal(m.caja.querySelector("[data-texto-b]").textContent, F.TEXTO_ESCALERA_B);
  assert.equal(m.caja.querySelector("[data-partida]").textContent, F.PARTIDA_ESCALERA);
  const tablas = [...m.caja.querySelectorAll("[data-tabla-escalera]")];
  assert.deepEqual(tablas.map((t) => t.querySelector("p").textContent), ["Guarda 20 de cada 100", "Guarda 10 de cada 100"]);
  assert.deepEqual([...tablas[1].querySelectorAll('[data-celda$=":total"]')].map((t) => t.textContent), ["1.900", "2.710", "3.439"]);
  const elegir = async (pregunta, tipo) => {
    const op = F.PREGUNTAS_COMPARA.find((p) => p.id === pregunta).opciones.find((o) => o.tipo === tipo);
    await clic(boton(m.caja, op.nombre));
  };
  assert.equal(rotulo(), F.ROTULO_SIMULADO);
  await elegir("mas-depositos", null);
  assert.equal(retro(m.caja), null);
  assert.ok(m.caja.querySelector('[data-estado="correcta"]'));
  await clic(boton(m.caja, "Siguiente"));
  await elegir("sube", "T5");
  assert.equal(retro(m.caja), `❌${F.ERRORES_ESCALERA.T5}`);
  await clic(boton(m.caja, "Siguiente"));
  await elegir("baja", "T6");
  assert.equal(retro(m.caja), `❌${F.ERRORES_ESCALERA.T6}`);
  await clic(boton(m.caja, "Ver resultado"));
  /* Fallos: las 3 de «guarda» y 2 decisiones. 7 de 12. */
  assert.equal(pct, (7 / 12) * 100);
  assert.equal(detalle.length, 12);
  assert.deepEqual(detalle.filter((d) => !d.ok).map((d) => d.item), ["1:guarda", "2:guarda", "3:guarda", "compara:sube", "compara:baja"]);
  assert.equal(m.caja.querySelector("[data-cierre-texto]").textContent, F.ESCALERA.cierre);
  m.desmontar();
});

test("★★ B: el demo es la primera vuelta de Juan (10, 90, 190), avanza solo, termina con el texto de Futaba y no guarda nada", async () => {
  let llamadas = 0;
  const m = await montar(EscaleraDelEncaje, { items: [F.EJEMPLO_ESCALERA], modoDemo: true, onCompletar: () => { llamadas++; } });
  assert.equal(m.caja.querySelector("[data-rotulo-simulado]").textContent, F.ROTULO_SIMULADO);
  assert.equal(m.caja.querySelector("[data-partida]").textContent, "Punto de partida: 100.");
  for (const v of ["10", "90", "190"]) {
    await clic(boton(m.caja, v));
    assert.equal(m.caja.querySelector('[data-estado="correcta"]') && visible(m.caja.querySelector('[data-estado="correcta"]')), v);
    await dormir(DEMO_AVANCE_MS + 50);
  }
  assert.equal(m.caja.querySelector("[data-resolucion]").textContent, F.EJEMPLO_ESCALERA.resolucion);
  assert.equal(boton(m.caja, "Siguiente"), undefined);
  assert.equal(llamadas, 0);
  m.desmontar();
  assert.deepEqual(F.ASI_SE_JUEGA_FABRICA[F.ESCALERA.id].guion.toques.map((t) => t.texto), ["10", "90", "190"]);
  assert.equal(F.ASI_SE_JUEGA_FABRICA[F.CREA_O_CAMBIA.id].guion.toques.at(-1).texto, "Crea dinero");
});

/* ═══════════════════ LA 0073 ═══════════════════ */

const FILA = /\(\s*'([^']+)',\s*'([^']+)',\s*'([^']+)',\s*'(exploratoria|evaluativa)',\s*'(facil|medio|dificil|experto)',\s*(\d+)\s*(?:,\s*(\d+)\s*)?\)/g;

test("★★★ la 0073: un insert aditivo con on conflict do nothing, sin nada que borre o cambie; su propia comprobación dice 16 filas y 715 FP, y con la 0091 y la 0255 el tema queda en 21 y 850", () => {
  const sql = readFileSync("supabase/migrations/0073_monetaria_fabrica_del_dinero.sql", "utf8");
  const sentencias = sql.split("\n").filter((l) => !l.trim().startsWith("--")).join("\n");
  assert.match(sentencias, /insert into public\.actividad_catalogo/);
  assert.match(sentencias, /on conflict \(activity_id\) do nothing;/);
  assert.doesNotMatch(sentencias, /\b(alter|update|delete|drop|truncate)\b/i);
  assert.match(sql, /--\s+delete from public\.actividad_catalogo\n--\s+where activity_id in \('crea-o-cambia-de-manos', 'la-escalera-del-encaje'\);/, "la reversa, escrita y comentada");
  assert.match(sql, /filas = 16, fp_del_tema = 715/, "el resultado esperado de la comprobación");
  const filas = [...sentencias.matchAll(FILA)].map((m) => [m[1], m[3], m[5], Number(m[6])]);
  assert.deepEqual(filas, [
    ["crea-o-cambia-de-manos", "politica-monetaria", "medio", 25],
    ["la-escalera-del-encaje", "politica-monetaria", "dificil", 50],
  ]);
  const tema = new Map();
  for (const f of readdirSync("supabase/migrations").filter((x) => x.endsWith(".sql")).sort()) {
    const s = readFileSync(`supabase/migrations/${f}`, "utf8");
    for (const ins of s.matchAll(/insert\s+into\s+(?:public\.)?actividad_catalogo\b/gi)) {
      const fin = s.indexOf(";", ins.index);
      for (const m of s.slice(ins.index, fin).matchAll(FILA)) if (m[3] === "politica-monetaria") tema.set(m[1], Number(m[6]));
    }
  }
  /*
   * El total del tema sumando TODAS las migraciones, que crece cada vez que
   * entra un juego: 16 tras la 0073; 18 con las dos de la 0091, que entró en
   * el mismo cableado; y 21 con los tres instrumentos de la 0255.
   */
  assert.equal(tema.size, 21);
  assert.equal([...tema.values()].reduce((a, b) => a + b, 0), 850);
  assert.ok(!tema.has(F.APRENDER_FABRICA.id), "Aprender no paga");
});
