import { test } from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { JSDOM, VirtualConsole } from "jsdom";

/*
 * ═══════════════════════════════════════════════════════════════════════════
 * POLÍTICA MONETARIA · LOS DOS JUEGOS DE «LA FÁBRICA DEL DINERO» (Célula B).
 *
 *   ·  ningún «PENDIENTE: Futaba» llega al PR (falla mientras quede uno)
 *   A  ¿Crea o Cambia de Manos?: las respuestas; el ERROR CASTIGADO (elegir
 *      «Crea dinero» cuando el Banco VENDE) da su devolución propia, en más
 *      de un hecho, y cuenta como fallo; todo fallo tiene texto
 *   B  La Escalera del Encaje: cada casilla con la cifra de la escalera; las
 *      opciones sin repetir; un intento; el error por tipo; la comparación
 *   ·  la 0073: solo insert, on conflict do nothing, 16 filas y 715 FP
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
const boton = (caja, texto) => [...caja.querySelectorAll("button")].find((b) => b.textContent.trim() === texto)
  ?? [...caja.querySelectorAll("button")].find((b) => b.textContent.trim().startsWith(texto));
const clic = async (el) => { assert.ok(el, "no está el botón"); await act(async () => { el.click(); }); };
const retro = (caja) => {
  const p = caja.querySelector('[role="status"]');
  return p ? [...p.childNodes].filter((n) => !n.classList?.contains("fae-jg-oculto")).map((n) => n.textContent).join("") : null;
};
const dormir = (ms) => act(async () => { await new Promise((r) => setTimeout(r, ms)); });

/* ═══════════ NINGÚN MARCADOR LLEGA AL PR ═══════════ */

test("★★★ ningún «PENDIENTE: Futaba» queda en los textos (falla hasta que llegue toda la entrega con PASA)", () => {
  /* Control positivo: el detector ve un marcador. */
  const pendientes = (v, ruta = "") => {
    if (typeof v === "string") return v.includes(F.PENDIENTE) ? [ruta] : [];
    if (Array.isArray(v)) return v.flatMap((x, k) => pendientes(x, `${ruta}[${k}]`));
    if (v && typeof v === "object") return Object.entries(v).flatMap(([k, x]) => pendientes(x, `${ruta}.${k}`));
    return [];
  };
  assert.deepEqual(pendientes({ a: [F.PENDIENTE] }), [".a[0]"]);
  const exportados = Object.fromEntries(Object.entries(F).filter(([k]) => k !== "PENDIENTE"));
  const quedan = pendientes(exportados);
  /* Y en el archivo: ni el marcador escrito a mano. */
  const fuente = readFileSync(new URL("../../../data/pmFabricaDelDinero.js", import.meta.url), "utf8");
  const aMano = fuente.split("\n").filter((l) => l.includes("PENDIENTE:") && !l.includes("export const PENDIENTE")).length;
  assert.deepEqual({ quedan: quedan.length, aMano }, { quedan: 0, aMano: 0 }, `quedan ${quedan.length} textos pendientes: ${quedan.slice(0, 8).join(", ")}…`);
});

/* ═══════════════════ A · ¿CREA O CAMBIA DE MANOS? ═══════════════════ */

test("★★★ A: las tres opciones en su orden, y la regla del encargo en las respuestas", () => {
  assert.deepEqual(F.OPCIONES_CREA_O_CAMBIA.map((o) => o.nombre), ["Crea dinero", "Solo cambia de manos", "Saca dinero"]);
  const r = Object.fromEntries(F.HECHOS_CREA_O_CAMBIA.map((x) => [x.id, x.respuesta]));
  assert.equal(r["br-compra-tes"], F.CREA, "el Banco compra TES y paga con pesos nuevos: crea");
  assert.equal(r["br-compra-dolares"], F.CREA);
  assert.equal(r["privado-compra-tes"], F.CAMBIA, "un banco privado compra un TES: la plata cambia de manos");
  assert.equal(r["br-vende-tes"], F.SACA);
  assert.equal(r["br-vende-dolares"], F.SACA);
  assert.equal(new Set(F.HECHOS_CREA_O_CAMBIA.map((x) => x.id)).size, F.HECHOS_CREA_O_CAMBIA.length);
});

test("★★★ A: el ERROR CASTIGADO — «Crea dinero» cuando el Banco VENDE da su devolución propia, en más de un hecho, y cuenta como fallo", async () => {
  const vende = F.HECHOS_CREA_O_CAMBIA.filter((x) => x.vende);
  assert.ok(vende.length >= 2, "aparece en más de un hecho (vende TES, vende dólares)");
  assert.ok(vende.some((x) => x.id === "br-vende-tes") && vende.some((x) => x.id === "br-vende-dolares"));
  for (const x of vende) {
    assert.equal(F.tipoDeErrorCreaOCambia(x, F.CREA), "VENDE");
    let pct = null;
    let detalle = null;
    const m = await montar(CreaOCambia, { items: [x], onCompletar: (p, ms, d) => { pct = p; detalle = d; } });
    await clic(boton(m.caja, "Crea dinero"));
    assert.equal(retro(m.caja), `❌${F.ERRORES_CREA_O_CAMBIA.VENDE}`, `${x.id}: la devolución propia`);
    assert.ok(m.caja.querySelector('[data-estado="incorrecta"]').textContent.trim().startsWith("Crea dinero"));
    assert.ok(m.caja.querySelector('[data-estado="revelada"]').textContent.trim().startsWith("Saca dinero"), "se revela la correcta");
    await clic(boton(m.caja, "Ver resultado"));
    assert.equal(pct, 0, "cuenta como fallo");
    assert.deepEqual(detalle.map((d) => [d.item, d.ok, d.respuesta]), [[x.id, false, F.CREA]]);
    m.desmontar();
  }
  /* «Solo cambia de manos» en un hecho que vende NO es el castigado: es su error de tipo. */
  assert.equal(F.tipoDeErrorCreaOCambia(vende[0], F.CAMBIA), "saca>cambia");
  /* Y «Crea dinero» donde el Banco compra no es error. */
  assert.equal(F.tipoDeErrorCreaOCambia(F.HECHOS_CREA_O_CAMBIA.find((x) => x.id === "br-compra-tes"), F.CREA), null);
});

test("★★★ A: todo fallo tiene su texto, y el acierto da la devolución del hecho", async () => {
  for (const x of F.HECHOS_CREA_O_CAMBIA) {
    for (const o of F.OPCIONES_CREA_O_CAMBIA) {
      const t = F.tipoDeErrorCreaOCambia(x, o.id);
      if (t) assert.ok(F.ERRORES_CREA_O_CAMBIA[t], `${x.id} → ${o.id}: el tipo ${t} no tiene texto`);
    }
  }
  const x = F.HECHOS_CREA_O_CAMBIA.find((y) => y.id === "privado-compra-tes");
  let m = await montar(CreaOCambia, { items: [x] });
  await clic(boton(m.caja, "Solo cambia de manos"));
  assert.equal(retro(m.caja), `✅${x.acierto}`);
  m.desmontar();
  m = await montar(CreaOCambia, { items: [x] });
  await clic(boton(m.caja, "Crea dinero"));
  assert.equal(retro(m.caja), `❌${F.ERRORES_CREA_O_CAMBIA["cambia>crea"]}`);
  /* Un intento: el segundo toque no cambia nada. */
  await clic(boton(m.caja, "Solo cambia de manos"));
  assert.equal(retro(m.caja), `❌${F.ERRORES_CREA_O_CAMBIA["cambia>crea"]}`);
  m.desmontar();
});

test("★★ A: el demo del tutorial no guarda nada, y la partida recorre el banco entero", async () => {
  let llamadas = 0;
  const demo = await montar(CreaOCambia, { items: [F.EJEMPLO_CREA_O_CAMBIA], modoDemo: true, onCompletar: () => { llamadas++; } });
  await clic(boton(demo.caja, "Crea dinero"));
  assert.equal(boton(demo.caja, "Ver resultado"), undefined, "el demo no avanza al resumen");
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

test("★★★ B: cada casilla trae la cifra de la escalera, sin opciones repetidas, y cada error con su tipo", () => {
  const { deposito, encajes, vueltas } = F.ESCENARIO_ESCALERA;
  for (const e of encajes) {
    const filas = F.escaleraDe(deposito, e, vueltas);
    for (let k = 0; k < vueltas; k++) {
      for (const c of F.CASILLAS) {
        const ops = F.opcionesDeCasilla(filas, k, c.id);
        const valores = ops.map((o) => o.valor);
        assert.equal(new Set(valores).size, valores.length, `encaje ${e}, vuelta ${k + 1}, ${c.id}: opciones repetidas ${valores}`);
        assert.deepEqual(ops.filter((o) => o.tipo === null).map((o) => o.valor), [filas[k][c.id]]);
        for (const o of ops) if (o.tipo) assert.ok(o.tipo in F.ERRORES_ESCALERA, `tipo ${o.tipo} sin devolución`);
        for (const v of valores) assert.ok(Number.isInteger(v), `cifra no entera en la casilla: ${v}`);
      }
    }
  }
  /* El error de confundir: en «guarda», la opción que es lo que presta. */
  const f = F.escaleraDe(1000, 10, 3);
  assert.equal(F.opcionesDeCasilla(f, 1, "guarda").find((o) => o.tipo === "CONFUNDE").valor, 810);
  assert.equal(F.opcionesDeCasilla(f, 1, "total").find((o) => o.tipo === "NO_SUMA").valor, 900, "solo lo depositado en esa vuelta");
});

test("★★★ B: se construye casilla por casilla — un intento, la devolución por tipo, la cifra queda en la tabla; después se comparan las dos escaleras", async () => {
  let pct = null;
  let detalle = null;
  const m = await montar(EscaleraDelEncaje, { onCompletar: (p, ms, d) => { pct = p; detalle = d; } });
  const { deposito, encajes, vueltas } = F.ESCENARIO_ESCALERA;
  const filas = F.escaleraDe(deposito, encajes[0], vueltas);
  assert.ok(m.caja.querySelector("[data-rotulo-simulado]").textContent.includes(F.ROTULO_SIMULADO.toUpperCase()));
  let casilla = 0;
  for (let k = 0; k < vueltas; k++) {
    for (const c of F.CASILLAS) {
      const correcta = filas[k][c.id];
      const ops = F.opcionesDeCasilla(filas, k, c.id);
      /* Falla la primera casilla de cada vuelta con su error CONFUNDE; acierta las demás. */
      const mal = c.id === "guarda" ? ops.find((o) => o.tipo === "CONFUNDE") : null;
      assert.equal(m.caja.querySelector(`[data-celda="${k + 1}:${c.id}"]`).textContent, "—", "lo que falta va en blanco");
      await clic(boton(m.caja, cifra(mal ? mal.valor : correcta)));
      assert.equal(retro(m.caja), mal ? `❌${F.ERRORES_ESCALERA.CONFUNDE}` : `✅${F.ACIERTO_CASILLA}`, `vuelta ${k + 1}, ${c.id}`);
      assert.ok([...m.caja.querySelectorAll("button[data-estado]")].every((b) => b.disabled), "un intento");
      assert.equal(m.caja.querySelector(`[data-celda="${k + 1}:${c.id}"]`).textContent.replace(/\./g, ""), String(correcta), "la cifra correcta queda en la tabla");
      await clic(boton(m.caja, "Siguiente"));
      casilla++;
    }
  }
  /* La comparación: las dos escaleras a la vista, la de más encaje más corta. */
  const tablas = [...m.caja.querySelectorAll("[data-tabla-escalera]")];
  assert.equal(tablas.length, 2);
  const totalDe = (t) => Number(t.querySelector(`[data-celda="${vueltas}:total"]`).textContent.replace(/\./g, ""));
  assert.ok(totalDe(tablas[1]) < totalDe(tablas[0]), "la de más encaje es más corta");
  /* Sube el encaje → se acorta (bien); baja → «se acorta» (al revés, mal). */
  const nombre = (id) => F.OPCIONES_COMPARA.find((o) => o.id === id).nombre;
  await clic(boton(m.caja, nombre(F.ACORTA)));
  assert.equal(retro(m.caja), `✅${F.PREGUNTAS_COMPARA[0].acierto}`);
  await clic(boton(m.caja, "Siguiente"));
  await clic(boton(m.caja, nombre(F.ACORTA)));
  assert.equal(retro(m.caja), `❌${F.ERRORES_COMPARA.REVES}`);
  await clic(boton(m.caja, "Ver resultado"));
  const total = vueltas * F.CASILLAS.length + F.PREGUNTAS_COMPARA.length;
  assert.equal(casilla, vueltas * F.CASILLAS.length);
  assert.equal(pct, ((total - vueltas - 1) / total) * 100, "falló tres casillas y una comparación");
  assert.equal(detalle.length, total);
  assert.deepEqual(detalle.filter((d) => !d.ok).map((d) => d.item), ["1:guarda", "2:guarda", "3:guarda", "compara:baja"]);
  m.desmontar();
});

test("★★ B: el demo es la primera vuelta de Juan (10, 90, 100), avanza solo y no guarda nada", async () => {
  let llamadas = 0;
  const m = await montar(EscaleraDelEncaje, { items: [F.EJEMPLO_ESCALERA], modoDemo: true, onCompletar: () => { llamadas++; } });
  for (const v of ["10", "90", "100"]) {
    await clic(boton(m.caja, v));
    assert.ok(retro(m.caja).startsWith("✅"), `el ejemplo toca la correcta: ${v}`);
    await dormir(DEMO_AVANCE_MS + 50);
  }
  assert.equal(boton(m.caja, "Siguiente"), undefined);
  assert.equal(llamadas, 0);
  m.desmontar();
  /* El guion del tutorial toca justo esas tres. */
  assert.deepEqual(F.ASI_SE_JUEGA_FABRICA[F.ESCALERA.id].guion.toques.map((t) => t.texto), ["10", "90", "100"]);
  assert.equal(F.ASI_SE_JUEGA_FABRICA[F.CREA_O_CAMBIA.id].guion.toques.at(-1).texto, "Crea dinero");
  assert.equal(F.EJEMPLO_CREA_O_CAMBIA.respuesta, F.CREA);
});

/* ═══════════════════ LA 0073 ═══════════════════ */

const FILA = /\(\s*'([^']+)',\s*'([^']+)',\s*'([^']+)',\s*'(exploratoria|evaluativa)',\s*'(facil|medio|dificil|experto)',\s*(\d+)\s*(?:,\s*(\d+)\s*)?\)/g;

test("★★★ la 0073: un insert aditivo con on conflict do nothing, sin nada que borre o cambie, y el tema queda en 16 filas y 715 FP", async () => {
  const { readdirSync } = await import("node:fs");
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
  /* Todas las migraciones juntas, como las lee el catálogo: 16 filas y 715 FP en el tema. */
  const tema = new Map();
  for (const f of readdirSync("supabase/migrations").filter((x) => x.endsWith(".sql")).sort()) {
    const s = readFileSync(`supabase/migrations/${f}`, "utf8");
    for (const ins of s.matchAll(/insert\s+into\s+(?:public\.)?actividad_catalogo\b/gi)) {
      const fin = s.indexOf(";", ins.index);
      for (const m of s.slice(ins.index, fin).matchAll(FILA)) if (m[3] === "politica-monetaria") tema.set(m[1], Number(m[6]));
    }
  }
  assert.equal(tema.size, 16);
  assert.equal([...tema.values()].reduce((a, b) => a + b, 0), 715);
  /* La pieza de Aprender no tiene fila. */
  assert.ok(!tema.has(F.APRENDER_FABRICA.id));
});
