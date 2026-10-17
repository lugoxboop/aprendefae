import { test } from "node:test";
import assert from "node:assert/strict";
import { readFileSync, readdirSync } from "node:fs";
import { JSDOM, VirtualConsole } from "jsdom";
import { conCorreccionesDeMello } from "./correccionesMello.mjs";

/*
 * ═══════════════════════════════════════════════════════════════════════════
 * T5 · N4 «El interés del periodo» (Célula C) · Hacer.
 *
 *   · cada texto es, letra por letra, el de la v1.1 de Near, con el pie que
 *     corrigió Mello (decisión de L), tal cual
 *   · las cifras salen de los títulos, el precio, la tasa y la venta, y son
 *     las del registro de T5; el tiempo va en meses, sin fechas
 *   · los nombres de cuenta son los de B
 *   · un solo intento por unidad; seis unidades; el porcentaje es aciertos / 6
 *   · lote 3 («Arma la línea»): los ítems 2 y 5 van con casilla de cifra;
 *     cada línea del cobro elige su cuenta de un banco con los dos
 *     distractores de Near, letra por letra (lote3-distractores-v1.md); un
 *     asiento sin banco (N5, que aún no pasa) sigue con la mesa de antes
 *   · evaluativa, medio, 25 FP, en el cliente y en la migración 0112; en T5
 *     después de los tres momentos; la vista lo abre; el panel docente lee
 *     cada unidad
 * ═══════════════════════════════════════════════════════════════════════════
 */

const dom = new JSDOM("<!doctype html><html><body></body></html>", { url: "http://localhost/", virtualConsole: new VirtualConsole() });
const w = dom.window;
/*
 * C4: el recorrido de siempre corre con movimiento reducido (REDUCIDO), y el
 * veredicto llega en el mismo toque. Las pruebas C4 lo apagan para ver la
 * consecuencia antes del veredicto, que llega a los 380 ms.
 */
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

const D = await import("../../data/contabilidadT5_n4.js");
const L = await import("../t5N4.js");
const { barajar } = await import("../../utils/barajar.js");
const B = await import("../../data/contabilidadT5Pieza2.js");
const { pesos } = await import("../../data/contabilidad.js");
const { SUBJECTS, HACER, actividadesDeTipo, clasificacionDe } = await import("../../data/subjects.js");
const { default: ElInteresDelPeriodo } = await import("../../components/mecanicas/libros/t5/ElInteresDelPeriodo.jsx");
const { JUEGOS, TEMA: TEMA_T5 } = await import("../../components/ContabilidadTema5View.jsx");
const { etiquetaDeItem, recortar } = await import("../../docente/etiquetasItem.js");
const { firma, textoFigura } = await import("./figuraAcumuladaPrueba.mjs");

const RAIZ = new URL("../../../", import.meta.url);
const leer = (f) => readFileSync(new URL(f, RAIZ), "utf8");
const V11 = leer("orquestador/conocimiento/paquetes/t5-n4-v1.1.md");
const LOTE3 = conCorreccionesDeMello(leer("orquestador/conocimiento/paquetes/lote3-distractores-v1.md"));
const VEREDICTO = leer("orquestador/conocimiento/paquetes/t5-veredicto-mello-tandas-1-y-2.md");
const REGISTRO = JSON.parse(leer("orquestador/conocimiento/registro-cifras-construidas-t5.json"));
const MIGRACION = leer("supabase/migrations/0112_t5_el_interes_del_periodo.sql");
const TEMA = SUBJECTS.contabilidad.topics.find((t) => t.id === TEMA_T5);
const citas = (celda) => [...celda.matchAll(/«([^»]+)»/g)].map((m) => m[1]);
const FILAS = V11.split("\n").filter((l) => /^\| \d \|/.test(l)).map((l) => l.replace(/^\| | \|$/g, "").split(" | "));
const numero = (t) => Number(t.replace(/[$.\s]/g, ""));
/* «$1.728.000: «retro» (66,2) · $144.000: «retro» (77,4)» → [[1728000, retro], [144000, retro]]. */
const distractores = (celda) => [...celda.matchAll(/\$([\d.]+): «([^»]+)»/g)].map((m) => [numero(m[1]), m[2]]);
const it = (id) => D.ITEMS_N4.find((x) => x.id === id);

/* ═══════════ 1 · TEXTOS ═══════════ */

test("★★★ el enunciado y la pantalla intermedia son los de la v1.1, letra por letra; el pie, el que corrigió Mello", () => {
  assert.ok(V11.startsWith(`**T5 · N4 «${D.N4.nombre}» · versión 1.1.**`));
  assert.ok(V11.includes(`id \`${D.N4_ID}\``));
  assert.ok(V11.includes("Migración **0112**"));
  const en = V11.slice(V11.indexOf("## Enunciado"), V11.indexOf("- **Ficha:**")).split("\n").filter((l) => l.startsWith("- «"));
  assert.deepEqual(D.N4.enunciado, en.map((l) => citas(l)[0]));
  assert.equal(it("base-del-segundo").intro, citas(V11.split("\n").find((l) => l.startsWith("- **Pantalla intermedia, antes del ítem 4:**")))[0]);
  /* La v1.1 decía «p. 194»; el veredicto lo corrige. */
  assert.ok(V11.includes("**Pie de todos los ítems:** «Basado en el libro, p. 194»."));
  const linea = VEREDICTO.split("\n").find((l) => l.startsWith("- N4, pie: "));
  assert.equal(D.N4.pie, citas(linea)[0]);
  assert.equal(D.N4.pie, "Basado en el libro, pp. 194-195");
});

test("★★★ los cinco ítems son los de la v1.1: pregunta, correcta, distractores con su retroalimentación y acierto", () => {
  assert.equal(FILAS.length, 5);
  const ids = D.ITEMS_N4.map((x) => x.id);
  for (const [k, [n, pregunta, correcta, malas, acierto]] of FILAS.entries()) {
    const x = D.ITEMS_N4[k];
    assert.equal(n, String(k + 1));
    assert.equal(x.pregunta, citas(pregunta)[0], x.id);
    if (x.tipo === "asiento") {
      /* «Caja $432.000 → D · Ingresos por intereses $432.000 → H». */
      const lineas = correcta.split(" · ").map((c) => c.match(/^(.+) \$([\d.]+) → ([DH])$/));
      assert.deepEqual(x.lineas.map((l) => [l.cuenta, l.valor, l.lado]), lineas.map((m) => [m[1], numero(m[2]), m[3] === "D" ? "debe" : "haber"]));
      assert.deepEqual(x.lineas.map((l) => l.retro), citas(malas));
      assert.match(acierto, new RegExp(`^Sumas: ${pesos(x.lineas[0].valor).slice(1).replace(/\./g, "\\.")} = `));
      continue;
    }
    assert.equal(x.acierto, citas(acierto)[0], x.id);
    if (x.pesos) {
      assert.equal(x.correcta, numero(correcta), x.id);
      assert.deepEqual(x.distractores.map((d) => [d.valor, d.retro]), distractores(malas), x.id);
    } else {
      /* Ítem 1: «Cada mes · Cada 12 meses → una sola: «…»». */
      assert.equal(x.correcta, correcta);
      const [valores, retro] = malas.split(" → una sola: ");
      assert.deepEqual(x.distractores.map((d) => d.valor), valores.split(" · "));
      for (const d of x.distractores) assert.equal(d.retro, citas(retro)[0]);
    }
  }
  assert.deepEqual(ids, ["cada-cuanto", "primer-trimestre", "asiento-del-cobro", "base-del-segundo", "segundo-trimestre"]);
});

test("★★★ sin fechas; nombres de cuenta de B; nada interno sale en pantalla", () => {
  const visibles = [...D.N4.enunciado, D.N4.pie, ...D.ITEMS_N4.flatMap((x) => [x.pregunta, x.acierto ?? "", x.intro ?? "", ...(x.distractores ?? []).map((d) => d.retro), ...(x.lineas ?? []).flatMap((l) => [l.cuenta, l.retro, ...(l.distractores ?? []).flatMap((d) => [d.cuenta, d.retro])])])];
  const texto = visibles.join("\n");
  assert.doesNotMatch(texto, /enero|febrero|marzo|abril|mayo|junio|julio|agosto|septiembre|octubre|noviembre|diciembre/i);
  /* «Gana la de B»: la cuenta del interés es la que ya ve el estudiante en los tres momentos. */
  assert.equal(it("asiento-del-cobro").lineas[1].cuenta, B.ESCENA_T5_A2.ingresos);
  assert.doesNotMatch(texto, /Ingresos? financieros -interés|Ingreso financieros/);
  for (const interno of ["CONSTRUCCIÓN", "construcción", "Near", "Mello", "INFLESZ", "C5-", "hueco"]) assert.ok(!texto.includes(interno), interno);
});

/* ═══════════ 2 · LAS CIFRAS ═══════════ */

test("★★★ las cifras salen del cálculo, como en la p. 194, y son las del registro de T5", () => {
  const C = D.calcularN4();
  assert.deepEqual(C, { inversion: 10_800_000, quedan: 760, base2: 5_700_000, vendidos: 5_100_000, interes1: 432_000, anual: 1_728_000, mensual: 144_000, interes2: 228_000, deVendidos: 204_000 });
  const reg = new Set(REGISTRO.construidas.filter((r) => r.pieza === D.N4_ID).map((r) => r.cifra));
  for (const x of D.ITEMS_N4) {
    if (x.pesos) for (const v of [x.correcta, ...x.distractores.map((d) => d.valor)]) assert.ok(reg.has(v), `${x.id}: ${v} no está en el registro`);
    for (const l of x.lineas ?? []) assert.ok(reg.has(l.valor), `${x.id}: ${l.valor} no está en el registro`);
  }
  for (const v of [D.TITULOS_N4, D.PRECIO_N4, D.TASA_N4, D.VENDIDOS_N4]) assert.ok(reg.has(v), String(v));
});

/* ═══════════ 3 · LA MECÁNICA, MONTADA ═══════════ */

const sinBarajar = (xs) => [...xs];
const EN_ORDEN = L.prepararN4(sinBarajar);
const Marco = ({ children }) => h("div", { "data-marco": true }, children);
const montar = async (props = {}) => {
  const caja = document.createElement("div");
  document.body.appendChild(caja);
  const raiz = createRoot(caja);
  const completados = [];
  await act(async () => { raiz.render(h(ElInteresDelPeriodo, { Marco, onCompletar: (...a) => completados.push(a), items: EN_ORDEN, ...props })); });
  return { caja, completados, desmontar: () => { act(() => raiz.unmount()); caja.remove(); } };
};
const tocar = async (el) => {
  assert.ok(el, "no está el elemento que se quería tocar");
  await act(async () => { el.dispatchEvent(new w.MouseEvent("click", { bubbles: true })); });
};
const boton = (caja, texto) => [...caja.querySelectorAll("button")].find((b) => b.textContent === texto);
const opcion = (caja, v) => [...caja.querySelectorAll("[data-opcion]")].find((x) => x.dataset.opcion === String(v))?.querySelector("button");
/* Escribe en la casilla de cifra como lo haría el teclado: el valor con su punto de miles. */
const escribir = async (caja, id, valor) => {
  const i = caja.querySelector(`[data-campo-cifra="${id}"]`);
  assert.ok(i, `no está la casilla de ${id}`);
  await act(async () => {
    Object.getOwnPropertyDescriptor(w.HTMLInputElement.prototype, "value").set.call(i, String(valor));
    i.dispatchEvent(new w.Event("input", { bubbles: true }));
  });
  assert.equal(i.value, pesos(valor).slice(1));
};

test("★★★ la tanda entera: seis unidades, un intento cada una, y el porcentaje es aciertos / 6", async () => {
  const m = await montar();
  try {
    for (const p of D.N4.enunciado) assert.ok(m.caja.textContent.includes(p), p);
    let bien = 0;
    const html = (sel) => [...m.caja.querySelectorAll(sel)].map((x) => x.textContent);
    for (const [k, x] of EN_ORDEN.entries()) {
      assert.equal(m.caja.querySelector("[data-pregunta]").textContent, x.pregunta, `orden: el ítem ${k + 1}`);
      assert.equal(m.caja.querySelector("[data-item] [data-pie]").textContent, D.N4.pie);
      assert.deepEqual(html("[data-intro]"), x.intro ? [x.intro] : []);
      if (x.tipo === "eleccion") {
        await tocar(opcion(m.caja, x.correcta));
        bien += 1;
        assert.deepEqual(html("[data-retro] [data-texto-retro]"), [x.acierto]);
      } else if (x.tipo === "cifra") {
        /* LOTE 3: casilla de cifra. Falla el ítem 2 con el interés de un año; acierta el 5. */
        const v = x.id === "primer-trimestre" ? x.distractores[0].valor : x.correcta;
        assert.equal(boton(m.caja, "Comprobar").disabled, true, "«Comprobar» sin cifra");
        await escribir(m.caja, x.id, v);
        await tocar(boton(m.caja, "Comprobar"));
        const ok = v === x.correcta;
        if (ok) bien += 1;
        assert.equal(m.caja.querySelector(`[data-campo-cifra="${x.id}"]`).readOnly, true, "un solo intento");
        assert.equal(boton(m.caja, "Comprobar"), undefined);
        assert.deepEqual(html("[data-retro] [data-texto-retro]"), ok ? [x.acierto] : [x.distractores[0].retro, `Iba aquí: ${pesos(x.correcta)}.`]);
      } else {
        /* LOTE 3 · «Arma la línea»: la línea de Caja elige su segundo distractor (Mello: «Ingresos financieros – ganancia en venta de títulos»); la otra, la buena. */
        const lado = { debe: "Debe", haber: "Haber" };
        const elegida = (l) => (l.id === "caja" ? l.distractores[1].cuenta : l.cuenta);
        for (const l of x.lineas) {
          const fila = m.caja.querySelector(`[data-linea-cuenta="${l.id}"]`);
          assert.ok(fila, `no está la línea ${l.cuenta}`);
          assert.deepEqual([...fila.querySelectorAll("[data-ficha-cuenta]")].map((b) => b.dataset.fichaCuenta), [l.cuenta, ...l.distractores.map((d) => d.cuenta)]);
          assert.equal(fila.querySelector("[data-valor]").textContent, pesos(l.valor), "el monto viene dado");
          await tocar([...fila.querySelectorAll("[data-ficha-cuenta]")].find((b) => b.dataset.fichaCuenta === elegida(l)));
          await tocar([...fila.querySelectorAll("button")].find((b) => b.textContent === lado[l.lado]));
        }
        assert.equal(m.caja.querySelector("[data-asiento-completo]"), null, "las sumas antes de comprobar");
        await tocar(boton(m.caja, "Comprobar"));
        for (const l of x.lineas) {
          const ok = elegida(l) === l.cuenta;
          if (ok) bien += 1;
          assert.deepEqual(html(`[data-linea-cuenta="${l.id}"] [data-texto-retro]`), ok ? [] : [l.distractores[1].retro]);
          assert.deepEqual(html(`[data-linea-cuenta="${l.id}"] [data-era]`), ok ? [] : [`Iba aquí: ${l.cuenta}, al ${l.lado}.`]);
        }
        assert.ok(m.caja.querySelector("[data-asiento-completo]").textContent.includes("432.000"), "las sumas del asiento");
      }
      await tocar(boton(m.caja, k === EN_ORDEN.length - 1 ? D.BOTON_N4.verResumen : D.BOTON_N4.siguiente));
    }
    assert.equal(m.completados.length, 1);
    const [pct, , det] = m.completados[0];
    assert.deepEqual(det.map((d) => d.item), L.unidadesN4());
    assert.equal(L.TOTAL_N4, 6);
    assert.equal(bien, 4);
    assert.equal(pct, (4 / 6) * 100);
    assert.deepEqual(det.filter((d) => !d.ok).map((d) => [d.item, d.respuesta]), [["primer-trimestre", D.CIFRAS_N4.anual], ["asiento-del-cobro:caja", "Ingresos financieros – ganancia en venta de títulos|debe"]]);
    assert.equal(m.caja.querySelector("[data-resumen]").textContent, D.resumenN4(4, 6));
  } finally {
    m.desmontar();
  }
});

test("★★ las opciones, las líneas y su banco de cuentas se barajan", () => {
  const vistos = new Set();
  for (let i = 0; i < 40; i++) vistos.add(JSON.stringify(L.prepararN4(barajar).map((x) => x.opciones?.map((o) => o.valor) ?? [x.orden, x.lineas?.map((l) => l.banco)])));
  assert.ok(vistos.size > 1);
});

/* ═══════════ 4 · CATÁLOGO, VISTA, MIGRACIÓN, PANEL DOCENTE ═══════════ */

test("★★★ en T5 después de los tres momentos, que la sostienen (decisión de corte, punto 6): evaluativa, medio, 25 FP", () => {
  assert.deepEqual(clasificacionDe("contabilidad", TEMA_T5, D.N4_ID), { tipo: HACER, modalidad: "evaluativa", dificultad: "medio", fpBase: 25 });
  assert.equal(TEMA.actividades.find((a) => a.id === D.N4_ID).nombre, D.N4.nombre);
  const ids = TEMA.actividades.map((x) => x.id);
  assert.equal(ids.indexOf(D.N4_ID), ids.indexOf("b5-t5-a2-los-tres-momentos-de-una-inversion") + 1);
});

test("★★★ la vista abre lo que el catálogo ofrece", () => {
  const ofrecidas = actividadesDeTipo(TEMA, HACER).filter((a) => !a.pendiente).map((a) => a.id).sort();
  assert.deepEqual(JUEGOS.map((j) => j.id).sort(), ofrecidas);
  assert.equal(JUEGOS.find((j) => j.id === D.N4_ID).Mecanica, ElInteresDelPeriodo);
});

test("★★★ la 0112: la que da la decisión de corte, aditiva y repetible, sin correr", () => {
  assert.match(MIGRACION, /\('t5-el-interes-del-periodo',\s*'contabilidad',\s*'activos-financieros',\s*'evaluativa',\s*'medio',\s*25,\s*1\)/);
  assert.match(MIGRACION, /on conflict \(activity_id\) do nothing;/);
  const sentencias = MIGRACION.split("\n").filter((l) => !l.trim().startsWith("--")).join("\n");
  assert.doesNotMatch(sentencias, /\b(alter|update|delete|drop|truncate)\b/i);
  assert.match(sentencias, /select activity_id[\s\S]*where activity_id = 't5-el-interes-del-periodo';/);
  const dir = new URL("supabase/migrations/", RAIZ);
  assert.deepEqual(readdirSync(dir).filter((f) => readFileSync(new URL(f, dir), "utf8").includes(D.N4_ID)), ["0112_t5_el_interes_del_periodo.sql"]);
  assert.deepEqual(readdirSync(dir).filter((f) => f.startsWith("0112")), ["0112_t5_el_interes_del_periodo.sql"]);
});

test("★★★ el panel docente: cada unidad tiene etiqueta, leída de los datos", () => {
  const ids = L.unidadesN4();
  assert.equal(ids.length, 6);
  for (const id of ids) {
    const e = etiquetaDeItem(D.N4_ID, id);
    assert.ok(typeof e === "string" && e.trim() !== "", `${id}: sin etiqueta`);
    assert.equal(e, recortar(L.unidadDeN4(id)), id);
  }
  assert.equal(L.unidadDeN4("asiento-del-cobro:caja"), "Caja $432.000");
  assert.equal(new Set(ids.map((id) => L.unidadDeN4(id))).size, 6);
});

/* ═══════════ LOTE 3 · «ARMA LA LÍNEA» Y LA CASILLA DE CIFRA ═══════════ */

/* Las filas de Near para esta pieza: [asiento, cuenta, lado, valor, distractor, retro], en su orden. */
const filasLote3 = () => {
  const seccion = LOTE3.slice(LOTE3.indexOf("### T5 N4 · `t5-el-interes-del-periodo`"));
  return seccion.slice(0, seccion.indexOf("\n### ", 1)).split("\n")
    .map((l) => l.match(/^\| `([^`]+)` \| (.+?) · ([DH]) · \$([\d.]+) \| (.+?) \| «(.+)» \| [\d,]+ \|$/)).filter(Boolean)
    .map((m) => [m[1], m[2], m[3] === "D" ? "debe" : "haber", numero(m[4]), m[5], m[6]]);
};

test("★★★ lote 3: los ítems 2 y 5 van con casilla; el 1 y el 4 se quedan en elección; el cobro, con banco de cuentas", () => {
  assert.deepEqual(D.ITEMS_N4.map((x) => [x.id, x.tipo]), [
    ["cada-cuanto", "eleccion"], ["primer-trimestre", "cifra"], ["asiento-del-cobro", "asiento"], ["base-del-segundo", "eleccion"], ["segundo-trimestre", "cifra"],
  ]);
  const p = L.prepararN4((xs) => [...xs].reverse());
  for (const l of p[2].lineas) assert.deepEqual([...l.banco].sort(), [l.cuenta, ...l.distractores.map((d) => d.cuenta)].sort());
  for (const k of [1, 4]) assert.equal(p[k], D.ITEMS_N4[k]);
  /* Una cifra de un distractor: su retroalimentación; otra cualquiera: la respuesta y el porqué del acierto, sin «Así es». */
  assert.deepEqual(L.evaluarN4(it("segundo-trimestre"), 204_000), { ok: false, correcta: 228_000, textos: ["Ese interés sale de los títulos que vendió. El interés va sobre los que le quedan: $5.700.000.", "Iba aquí: $228.000."], textoCorrecta: "$228.000" });
  assert.deepEqual(L.evaluarN4(it("primer-trimestre"), 1).textos, ["Iba aquí: $432.000.", "$10.800.000 × 0,16 × 3/12 = $432.000."]);
  assert.equal(L.evaluarN4(it("primer-trimestre"), 432_000).ok, true);
});

test("★★★ lote 3: los distractores de cuenta del cobro son los de Near, letra por letra y en su orden", () => {
  const fs = filasLote3();
  assert.equal(fs.length, 4);
  const datos = it("asiento-del-cobro").lineas.flatMap((l) => l.distractores.map((d) => ["asiento-del-cobro", l.cuenta, l.lado, l.valor, d.cuenta, d.retro]));
  assert.deepEqual(datos, fs);
});

test("★★★ lote 3: la mesa de T5 decide por el ítem; un asiento sin banco (como N5, que aún no pasa) sigue con la mesa de antes", async () => {
  /* Los mismos ítems, con el asiento sin banco ni distractores: lo que hoy prepara N5. */
  const sinBanco = EN_ORDEN.map((x) => (x.tipo === "asiento" ? { ...x, lineas: x.lineas.map(({ banco, distractores: _d, ...l }) => l) } : x));
  const m = await montar({ items: sinBanco });
  try {
    for (const k of [0, 1]) {
      const x = sinBanco[k];
      if (x.tipo === "cifra") { await escribir(m.caja, x.id, x.correcta); await tocar(boton(m.caja, "Comprobar")); }
      else await tocar(opcion(m.caja, x.correcta));
      await tocar(boton(m.caja, D.BOTON_N4.siguiente));
    }
    assert.equal(m.caja.querySelectorAll("[data-ficha-cuenta]").length, 0);
    assert.equal(m.caja.querySelectorAll("[data-linea-cuenta]").length, 0);
    for (const l of sinBanco[2].lineas) assert.ok(m.caja.querySelector(`[data-linea="${l.id}"]`), l.id);
  } finally {
    m.desmontar();
  }
});

/* ═══════════ LOTE 5 · LA FIGURA ACUMULADA ═══════════ */

test("★★★ lote 5: la cuenta de intereses crece trimestre a trimestre, cada parte al cerrar su ítem, y se queda", async () => {
  const despues = [
    ["Cada 3 meses"],
    ["Cada 3 meses 432.000"],
    ["Cada 3 meses 432.000", "asiento : 2 líneas"],
    ["Cada 3 meses 432.000", "asiento : 2 líneas", "5.700.000"],
    ["Cada 3 meses 432.000", "asiento : 2 líneas", "5.700.000 228.000"],
  ];
  const m = await montar();
  try {
    for (const [k, x] of EN_ORDEN.entries()) {
      assert.deepEqual(firma(m.caja), k ? despues[k - 1] : [], `antes del ítem ${k + 1}`);
      const falla = k % 2 === 1;
      if (x.tipo === "eleccion") {
        await tocar(opcion(m.caja, falla ? x.distractores[0].valor : x.correcta));
      } else if (x.tipo === "cifra") {
        assert.ok(!textoFigura(m.caja).includes(pesos(x.correcta).slice(1)), "E8");
        await escribir(m.caja, x.id, falla ? x.distractores[0].valor : x.correcta);
        await tocar(boton(m.caja, "Comprobar"));
      } else {
        for (const l of x.lineas) {
          const linea = m.caja.querySelector(`[data-linea-cuenta="${l.id}"]`);
          await tocar([...linea.querySelectorAll("[data-ficha-cuenta]")].find((b) => b.dataset.fichaCuenta === l.cuenta));
          await tocar([...linea.querySelectorAll("button")].find((b) => b.textContent === (l.lado === "debe" ? "Debe" : "Haber")));
        }
        assert.deepEqual(firma(m.caja), despues[k - 1], "el asiento no está antes de comprobar");
        await tocar(boton(m.caja, "Comprobar"));
      }
      assert.deepEqual(firma(m.caja), despues[k], `al cerrar el ítem ${k + 1}`);
      await tocar(boton(m.caja, k === EN_ORDEN.length - 1 ? D.BOTON_N4.verResumen : D.BOTON_N4.siguiente));
    }
    assert.equal(m.caja.querySelector("[data-figura-acumulada]"), null);
  } finally {
    m.desmontar();
  }
});

/* ═══════════ C4 · «TODA DECISIÓN SE PINTA» (patrón de Watari, #t5-n4) ═══════════ */

const C4N4 = await import("../c4/t5N4_c4.js");
const { ESPERA_C4 } = await import("../../components/mecanicas/libros/t7/decisionC4.jsx");
const esperar = async (ms = ESPERA_C4 + 20) => { await act(async () => { await new Promise((r) => setTimeout(r, ms)); }); };

test("★★★ C4 · el registro lleva los ítems de Near tal cual (los dos sentidos); el asiento sigue como en main («propio»)", () => {
  const P = C4N4.CONSECUENCIA_C4;
  assert.equal(P.id, "t5-n4");
  assert.equal(P.objeto, "Los cobros del año");
  assert.equal(P.modo, "hacer");
  assert.deepEqual(P.items.map((x) => x.id), D.ITEMS_N4.map((x) => x.id));
  for (const [k, x] of P.items.entries()) {
    const it = D.ITEMS_N4[k];
    if (it.tipo === "asiento") { assert.equal(x.tipo, "propio"); continue; }
    assert.equal(x.tipo, it.tipo);
    assert.equal(x.pregunta, it.pregunta);
    assert.equal(x.bien, it.acierto);
    assert.deepEqual(x.opciones.map((o) => o.id), L.opcionesDeN4(it).map(String));
    assert.deepEqual(x.opciones.filter((o) => o.correcta).map((o) => o.id), [String(it.correcta)]);
    assert.deepEqual(x.opciones.filter((o) => !o.correcta).map((o) => o.msg), it.distractores.map((d) => d.retro));
    if (it.tipo === "cifra") assert.deepEqual(x.opciones.map((o) => o.v), L.opcionesDeN4(it));
  }
});

test("★★★ C4 · cada opción cambia los cobros del año: cuántos y cuánto; la mala con su falla [W]", () => {
  const P = C4N4.CONSECUENCIA_C4;
  const de = (id, e) => P.consecuencia(P.items.find((x) => x.id === id), e);
  assert.deepEqual(de("cada-cuanto", null), { titulo: "Caoba · $10.800.000 al 16 % anual", cada: 3, cupon: null, cobros: 0, alto: 0 });
  assert.deepEqual([de("cada-cuanto", "Cada mes").cobros, de("cada-cuanto", "Cada 3 meses").cobros, de("cada-cuanto", "Cada 12 meses").cobros], [12, 4, 1]);
  assert.equal(de("cada-cuanto", "Cada mes").falla, "Así serían 12 cobros al año, y es trimestre vencido.");
  assert.equal(de("cada-cuanto", "Cada 3 meses").cuadra, "Trimestre vencido: cuatro cobros al año.");
  assert.equal(de("primer-trimestre", 1_728_000).falla, "Ese cobro equivale a un 64 % anual; la tasa es 16 %.");
  assert.equal(de("primer-trimestre", 144_000).falla, "Ese cobro equivale a un 5,3 % anual; la tasa es 16 %.");
  assert.equal(de("primer-trimestre", 432_000).falla, undefined);
  assert.equal(de("base-del-segundo", 10_800_000).titulo, "Caoba · $10.800.000 al 16 % anual");
  assert.equal(de("base-del-segundo", 5_700_000).cupon, 228_000);
  assert.equal(de("base-del-segundo", 5_100_000).falla, "Así cobra interés sobre $5.100.000. Y le quedan $5.700.000.");
  /* El segundo trimestre va sobre lo que le queda (ya se respondió en el ítem 4). */
  assert.equal(de("segundo-trimestre", null).titulo, "Caoba · $5.700.000 al 16 % anual");
  assert.equal(de("segundo-trimestre", 432_000).falla, "Ese cobro sale de una inversión de $10.800.000, y le quedan $5.700.000.");
  /* La cifra a medio escribir también pinta. */
  assert.equal(de("primer-trimestre", 4).cupon, 4);
});

test("★★★ C4 · montada: la frecuencia tocada cambia los cupones en el acto; la cifra escrita solo se muestra hasta comprobar (C4-1); el veredicto a los 380 ms", async () => {
  REDUCIDO = false;
  const m = await montar();
  const q = (s) => m.caja.querySelector(s);
  const cupones = () => [...m.caja.querySelectorAll("[data-cobros-n4] [data-cupon]")].map((x) => x.closest("[data-mes]").dataset.mes);
  const retro = () => [...m.caja.querySelectorAll("[data-retro] [data-texto-retro]")].map((x) => x.textContent);
  try {
    /* Ítem 1 · «Cada mes»: doce cupones al tocar; el veredicto, después. */
    assert.ok(q("[data-figura-acumulada], [data-figura]"), "la figura");
    assert.deepEqual(cupones(), []);
    assert.equal(q("[data-linea-cobros]").textContent, "Cobros: ?");
    await tocar(opcion(m.caja, "Cada mes"));
    assert.equal(cupones().length, 12);
    assert.equal(q("[data-linea-cobros]").textContent, "Cada cobro: $144.000");
    assert.ok(q("[data-cobros-n4]").classList.contains("t5c4-anim"));
    assert.deepEqual(retro(), [], "el veredicto llegó antes de 380 ms");
    assert.equal(q("[data-falla]"), null);
    await tocar(opcion(m.caja, "Cada 3 meses"));
    assert.equal(cupones().length, 12, "mientras llega el veredicto no se toca otra");
    await esperar();
    const x1 = EN_ORDEN[0];
    assert.deepEqual(retro(), [x1.distractores[0].retro]);
    assert.equal(q("[data-falla]").textContent, "Así serían 12 cobros al año, y es trimestre vencido.");
    await tocar(boton(m.caja, D.BOTON_N4.siguiente));
    /* Ítem 2 · la cifra pinta con cada número; la buena da cuatro cupones. */
    assert.deepEqual(cupones(), []);
    /* Mello C4-1: la cifra que se escribe solo se muestra en su renglón; los cupones, al comprobar. */
    await escribir(m.caja, "primer-trimestre", 43);
    assert.equal(q("[data-linea-cobros]").textContent, "Cada cobro: $43");
    assert.deepEqual(cupones(), []);
    await escribir(m.caja, "primer-trimestre", 432000);
    assert.equal(q("[data-linea-cobros]").textContent, "Cada cobro: $432.000");
    assert.deepEqual(cupones(), []);
    assert.doesNotMatch(q("[data-cobros-n4]").outerHTML, /c4-cuadra|c4-falla| mal/, "la buena escrita no califica antes de comprobar");
    await tocar(boton(m.caja, "Comprobar"));
    assert.deepEqual(cupones(), ["3", "6", "9", "12"]);
    assert.deepEqual(retro(), []);
    await esperar();
    assert.deepEqual(retro(), [EN_ORDEN[1].acierto]);
    assert.equal(q("[data-falla]"), null);
    assert.equal(q("[data-cuadra]").textContent, "Es el 16 % anual, por 3 meses.");
    /* El asiento: sin objeto C4 (sigue como en main). */
    await tocar(boton(m.caja, D.BOTON_N4.siguiente));
    assert.equal(q("[data-cobros-n4]"), null);
  } finally {
    REDUCIDO = true;
    m.desmontar();
  }
});
