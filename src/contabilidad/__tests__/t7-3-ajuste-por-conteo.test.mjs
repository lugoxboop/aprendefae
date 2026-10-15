import { test } from "node:test";
import assert from "node:assert/strict";
import { readFileSync, readdirSync } from "node:fs";
import { JSDOM, VirtualConsole } from "jsdom";

/*
 * ═══════════════════════════════════════════════════════════════════════════
 * T7-3 · H5 «Ajuste por conteo» (Célula C) · Hacer.
 *
 *   · las cifras son exactamente las del registro 5c de Near; el sobrante y
 *     el faltante se recalculan
 *   · cada texto es, letra por letra, el de la v1; las fichas son las de la
 *     regla 10b (y su variante para la provisión)
 *   · el sistema de Pino es la propuesta de Near, pendiente de decisión de L
 *   · un solo intento por unidad; once unidades; el porcentaje es aciertos / 11
 *   · lote 3 («Arma la línea»): los ítems 2 y 5 van con casilla de cifra;
 *     cada línea de los tres asientos elige su cuenta de un banco con los dos
 *     distractores de Near, letra por letra (lote3-distractores-v1.md)
 *   · evaluativa, medio, 25 FP, en el cliente y en la migración 0107; la
 *     vista lo abre y registra con el motor; el panel docente lee cada unidad
 *   · ninguna cifra del libro (I-1 a I-3 son de A5 y A6) ni de X1-X4
 * ═══════════════════════════════════════════════════════════════════════════
 */

const dom = new JSDOM("<!doctype html><html><body></body></html>", { url: "http://localhost/", virtualConsole: new VirtualConsole() });
const w = dom.window;
w.matchMedia = () => ({ matches: false, addEventListener() {}, removeEventListener() {}, addListener() {}, removeListener() {} });
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

const D = await import("../../data/contabilidadT7_3_h5.js");
const L = await import("../t7_3H5.js");
const A5 = await import("../../data/contabilidadT7_3_a5.js");
const A6 = await import("../../data/contabilidadT7_3_a6.js");
const { DEBE, HABER, pesos } = await import("../../data/contabilidad.js");
const { SUBJECTS, HACER, APRENDER, actividadesDeTipo, clasificacionDe } = await import("../../data/subjects.js");
const { default: AjustePorConteo } = await import("../../components/mecanicas/libros/t7/AjustePorConteo.jsx");
const { JUEGOS_T7_3, TEMA_T7_3 } = await import("../../components/ContabilidadT7_3View.jsx");
const { etiquetaDeItem, recortar } = await import("../../docente/etiquetasItem.js");

const RAIZ = new URL("../../../", import.meta.url);
const leer = (f) => readFileSync(new URL(f, RAIZ), "utf8");
const V1 = leer("orquestador/conocimiento/paquetes/t7-3-h5-v1.md");
const LOTE3 = leer("orquestador/conocimiento/paquetes/lote3-distractores-v1.md");
const MAPA = leer("orquestador/conocimiento/mapas/t7-inventarios.md");
const VISTA = leer("src/components/ContabilidadT7_3View.jsx");
const MIGRACION = leer("supabase/migrations/0107_t7_3_ajuste_por_conteo.sql");
const TEMA = SUBJECTS.contabilidad.topics.find((t) => t.id === TEMA_T7_3);
const item = (id) => D.ITEMS_H5.find((x) => x.id === id);
const citas = (celda) => [...celda.matchAll(/«([^»]+)»/g)].map((m) => m[1]);
const filas = () => V1.split("\n").filter((l) => /^\| \d \|/.test(l)).map((l) => l.split(" | ").map((c) => c.replace(/^\| | \|$/g, "")));

test("★★★ las cifras son exactamente las del registro de Near; el sobrante y el faltante se recalculan", () => {
  assert.equal(item("el-sobrante").correcta, 648_000 - 612_000);
  assert.equal(item("el-faltante").correcta, 738_000 - 694_000);
  const registro = V1.split("\n").find((l) => l.startsWith("- Registro 5c, T73-H5: ")).replace("- Registro 5c, T73-H5: ", "").replace(/\.$/, "").split(" · ").map((x) => Number(x.replace(/\./g, "")));
  const usadas = new Set([D.OLMO_1.libros, D.OLMO_1.conteo, D.OLMO_2.libros, D.OLMO_2.conteo, D.PINO.provision, D.PINO.perdida,
    ...D.ITEMS_H5.filter((it) => it.pesos).flatMap((it) => [it.correcta, ...it.distractores.map((d) => d.valor)])]);
  assert.deepEqual([...usadas].sort((a, b) => a - b), [...registro].sort((a, b) => a - b));
  /* Los candidatos que Near descartó y las cifras del libro (de A5 y A6) no están. */
  const todas = new Set([...usadas, ...D.ITEMS_H5.flatMap((it) => (it.lineas ?? []).map((l) => l.valor))]);
  for (const x of [175_000, 380_000, 275_000, ...Object.values(A5.I_LIBRO), ...Object.values(A6.I3_LIBRO)]) assert.ok(!todas.has(x), String(x));
});

test("★★★ los textos son los de la v1, letra por letra; las fichas, las de la regla 10b", () => {
  assert.ok(V1.includes(`id \`${D.H5_ID}\``));
  assert.ok(V1.startsWith(`**T7-3 · H5 «${D.H5.nombre}» · versión 1.**`));
  assert.ok(MAPA.includes(`| 11 | ${D.H5_ID} | ${D.H5.nombre} | Hacer |`));
  const en = V1.slice(V1.indexOf("## Enunciado y consigna")).split("\n").filter((l) => l.startsWith("- «"));
  assert.equal(D.H5.enunciado[0], citas(en[0])[0]);
  assert.equal(D.H5.consigna, citas(en[1])[0]);
  assert.ok(V1.includes(`**Pie de todos los ítems:** «${D.H5.pie}».`));
  /* Los casos: sus textos y sus fichas. */
  const bloque = (a, b) => V1.slice(V1.indexOf(a), b ? V1.indexOf(b) : undefined);
  const casos = [bloque("## Caso 1", "## Caso 2"), bloque("## Caso 2", "## Caso 3"), bloque("## Caso 3", "## Por qué")];
  for (const [k, c] of D.CASOS_H5.entries()) {
    const textos = casos[k].split("\n").filter((l) => /^(- )?«/.test(l)).map((l) => citas(l)[0]);
    assert.deepEqual(c.textos, textos, c.encabezado);
    assert.equal(c.encabezado, `Caso ${k + 1}`);
    assert.ok(casos[k].startsWith(`## Caso ${k + 1} · `));
  }
  const fichaV1 = (k) => casos[k].split("\n").find((l) => l.startsWith("Ficha 10b")).replace(/^Ficha 10b(, variante de I-3)?: /, "").replace(/\.$/, "").split(" · ");
  for (const k of [0, 1]) {
    const [quien, libros, conteo, fecha, sistema] = fichaV1(k);
    assert.deepEqual(D.CASOS_H5[k].ficha.map(([, x]) => x.toLowerCase()), [quien, libros.replace("libros ", ""), conteo.replace("conteo ", ""), fecha, sistema].map((x) => x.toLowerCase()));
    assert.deepEqual(D.CASOS_H5[k].ficha.map(([r]) => r), A5.PIEZA_SOBRANTES_Y_FALTANTES.pantallas.find((p) => p.ficha).ficha.map((f) => f.dato));
  }
  const [quien, prov, perdida, fecha] = fichaV1(2);
  assert.deepEqual(D.CASOS_H5[2].ficha.slice(0, 4).map(([, x]) => x.toLowerCase()), [quien, prov.replace("provisión estimada ", ""), perdida.replace("pérdida real ", ""), fecha].map((x) => x.toLowerCase()));
  assert.deepEqual(D.CASOS_H5[2].ficha.map(([r]) => r), A6.PIEZA_LA_PROVISION.pantallas.find((p) => p.ficha).ficha.map((f) => f.dato));
  /* El sistema de Pino: la propuesta de Near, pendiente de L. */
  assert.ok(V1.includes(`**Propongo que la ficha de Pino diga «Sistema: ${D.SISTEMA_PINO.charAt(0).toLowerCase()}${D.SISTEMA_PINO.slice(1)}»**`));
  assert.equal(D.CASOS_H5[2].ficha[4][1], D.SISTEMA_PINO);
  /* Los ítems. */
  const fs = filas();
  assert.equal(fs.length, 8);
  for (const [k, it] of D.ITEMS_H5.entries()) {
    const [n, pregunta, correcta, distractores, acierto] = fs[k];
    assert.equal(n, String(k + 1));
    assert.equal(it.pregunta, citas(pregunta)[0], it.id);
    if (it.tipo === "asiento") {
      const lineas = correcta.split(" · ").map((x) => x.match(/^(.+) \$([\d.]+) → (D|H)$/)).map((m) => [m[1], Number(m[2].replace(/\./g, "")), m[3] === "D" ? DEBE : HABER]);
      assert.deepEqual(it.lineas.map((l) => [l.cuenta, l.valor, l.lado]), lineas, it.id);
      assert.deepEqual(it.lineas.map((l) => l.retro), citas(distractores), it.id);
      assert.equal(acierto, "Se ve el asiento");
      continue;
    }
    assert.equal(it.pesos ? pesos(it.correcta) : it.correcta, correcta, it.id);
    assert.equal(it.acierto, citas(acierto)[0], it.id);
    const ops = pregunta.match(/· (.+)$/)?.[1].split(" / ");
    if (ops) assert.deepEqual(L.opcionesDeH5(it).slice().sort(), ops.slice().sort(), it.id);
    if (it.opcionesV1) assert.deepEqual(it.opcionesV1.slice().sort(), L.opcionesDeH5(it).slice().sort(), it.id);
    if (it.opcionesV1 && ops) assert.deepEqual(it.opcionesV1, ops, it.id);
    if (it.pesos) {
      const partes = distractores.split(/ · (?=\$)/).map((p) => p.match(/^([^:]+): «([^»]+)»/));
      assert.deepEqual(it.distractores.map((d) => [pesos(d.valor), d.retro]), partes.map((p) => [p[1], p[2]]), it.id);
    } else {
      /* Una sola retroalimentación de error para todas las opciones equivocadas. */
      const [retro] = citas(distractores);
      assert.ok(it.distractores.every((d) => d.retro === retro), it.id);
    }
  }
  /* El ítem 1 no dice si es sobrante: el encabezado es «Caso 1», no «Caso 1 · sobrante». */
  assert.ok(!JSON.stringify(D.CASOS_H5.map((c) => c.encabezado)).includes("sobrante"));
});

const EN_ORDEN = L.prepararH5((xs) => [...xs]);
const Marco = ({ children }) => h("div", { "data-marco": true }, children);
const montar = async (props = {}) => {
  const caja = document.createElement("div");
  document.body.appendChild(caja);
  const raiz = createRoot(caja);
  const completados = [];
  await act(async () => { raiz.render(h(AjustePorConteo, { Marco, items: EN_ORDEN, onCompletar: (...a) => completados.push(a), ...props })); });
  return { caja, completados, desmontar: () => { act(() => raiz.unmount()); caja.remove(); } };
};
const tocar = async (el) => {
  assert.ok(el, "no está el elemento que se quería tocar");
  await act(async () => { el.dispatchEvent(new w.MouseEvent("click", { bubbles: true })); });
};
const opcion = (caja, v) => caja.querySelector(`[data-opcion="${v}"] button`);
const boton = (caja, texto) => [...caja.querySelectorAll("button")].find((b) => b.textContent === texto);
const lado = (caja, lineaId, l) => [...caja.querySelectorAll(`[data-linea-cuenta="${lineaId}"] button`)].find((b) => b.textContent === (l === DEBE ? "Debe" : "Haber"));
const ficha = (caja, lineaId, cuenta) => [...caja.querySelectorAll(`[data-linea-cuenta="${lineaId}"] [data-ficha-cuenta]`)].find((b) => b.dataset.fichaCuenta === cuenta);
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
const otro = (l) => (l === DEBE ? HABER : DEBE);

async function jugar(m, falla) {
  const detalle = [];
  for (const [k, it] of EN_ORDEN.entries()) {
    assert.equal(m.caja.querySelector("[data-pregunta]").textContent, it.pregunta, `orden: el ítem ${k + 1}`);
    assert.equal(m.caja.querySelector("[data-item] [data-pie]").textContent, D.H5.pie);
    /* El caso, encima: su texto, su ficha y su encabezado. */
    const caso = D.CASOS_H5[it.caso];
    assert.deepEqual([...m.caja.querySelectorAll("[data-caso] p")].map((p) => p.textContent), caso.textos);
    assert.ok(m.caja.querySelector("[data-caso]").textContent.includes(caso.ficha.map(([r, x]) => `${r}${x}`).join("")));
    assert.equal(m.caja.querySelector("[data-encabezado-item]").textContent, caso.encabezado.toUpperCase());
    if (it.tipo === "cifra") {
      /* LOTE 3: casilla de cifra; si falla, escribe el primer distractor y sale su retroalimentación. */
      const v = falla(it.id) ? it.distractores[0].valor : it.correcta;
      assert.equal(boton(m.caja, "Comprobar").disabled, true, "«Comprobar» sin cifra");
      await escribir(m.caja, it.id, v);
      await tocar(boton(m.caja, "Comprobar"));
      const ok = v === it.correcta;
      assert.equal(m.caja.querySelector(`[data-campo-cifra="${it.id}"]`).readOnly, true, "un solo intento");
      assert.equal(boton(m.caja, "Comprobar"), undefined);
      assert.deepEqual([...m.caja.querySelectorAll("[data-retro] [data-texto-retro]")].map((p) => p.textContent), L.evaluarH5(it, v).textos);
      assert.deepEqual(L.evaluarH5(it, v).textos, ok ? [it.acierto] : [it.distractores[0].retro, `La respuesta es ${pesos(it.correcta)}.`]);
      detalle.push({ item: it.id, ok, intentos: 1, respuesta: ok ? null : v, orden: detalle.length + 1 });
    } else if (it.tipo === "eleccion") {
      const v = falla(it.id) ? it.distractores[0].valor : it.correcta;
      await tocar(opcion(m.caja, v));
      const ok = v === it.correcta;
      assert.deepEqual([...m.caja.querySelectorAll("[data-retro] [data-texto-retro]")].map((p) => p.textContent), L.evaluarH5(it, v).textos);
      if (!ok) assert.equal(opcion(m.caja, it.correcta).dataset.estado, "revelada");
      detalle.push({ item: it.id, ok, intentos: 1, respuesta: ok ? null : v, orden: detalle.length + 1 });
    } else {
      /* LOTE 3 · «Arma la línea»: cada línea elige su cuenta del banco (la correcta y dos distractores) y su lado. */
      for (const l of it.lineas) {
        assert.equal(boton(m.caja, "Comprobar").disabled, true, "«Comprobar» antes de tener todas las líneas");
        assert.deepEqual([...m.caja.querySelectorAll(`[data-linea-cuenta="${l.id}"] [data-ficha-cuenta]`)].map((b) => b.dataset.fichaCuenta), [l.cuenta, ...l.distractores.map((d) => d.cuenta)]);
        assert.equal(m.caja.querySelector(`[data-linea-cuenta="${l.id}"] [data-valor]`).textContent, pesos(l.valor), "el monto viene dado");
        const mal = falla(L.idLineaH5(it, l));
        /* Una falla con la cuenta (el primer distractor) y otra con el lado, con la cuenta buena. */
        await tocar(ficha(m.caja, l.id, mal === "cuenta" ? l.distractores[0].cuenta : l.cuenta));
        await tocar(lado(m.caja, l.id, mal === "lado" ? otro(l.lado) : l.lado));
      }
      assert.equal(m.caja.querySelector("[data-asiento-completo]") === null, true);
      await tocar(boton(m.caja, "Comprobar"));
      for (const l of it.lineas) {
        const mal = falla(L.idLineaH5(it, l));
        const ok = !mal;
        for (const b of m.caja.querySelectorAll(`[data-linea-cuenta="${l.id}"] button`)) assert.equal(b.disabled, true);
        assert.deepEqual([...m.caja.querySelectorAll(`[data-linea-cuenta="${l.id}"] [data-texto-retro]`)].map((p) => p.textContent), ok ? [] : [mal === "cuenta" ? l.distractores[0].retro : l.retro]);
        assert.deepEqual([...m.caja.querySelectorAll(`[data-linea-cuenta="${l.id}"] [data-era]`)].map((p) => p.textContent), ok ? [] : [`Era: ${l.cuenta}, al ${l.lado === DEBE ? "debe" : "haber"}.`]);
        const respuesta = mal === "cuenta" ? `${l.distractores[0].cuenta}|${l.lado}` : `${l.cuenta}|${otro(l.lado)}`;
        detalle.push({ item: L.idLineaH5(it, l), ok, intentos: 1, respuesta: ok ? null : respuesta, orden: detalle.length + 1 });
      }
      assert.ok(m.caja.querySelector("[data-asiento-completo]"));
    }
    await tocar(boton(m.caja, k === 7 ? D.BOTON_H5.verResumen : D.BOTON_H5.siguiente));
  }
  return detalle;
}

test("★★★ la tanda entera: once unidades, un intento cada una, y el porcentaje es aciertos / 11", async () => {
  const m = await montar();
  try {
    const fallos = new Map([["sobrante-o-faltante", true], ["que-pasa-con-el-costo", true], ["el-faltante", true], ["ajuste-faltante:costo", "cuenta"], ["perdida-real:provision", "lado"]]);
    const detalle = await jugar(m, (id) => fallos.get(id) ?? false);
    const [pct, , det] = m.completados[0];
    assert.deepEqual(det, detalle);
    assert.deepEqual(det.map((d) => d.item), L.unidadesH5());
    assert.equal(L.TOTAL_H5, 11);
    assert.equal(pct, (6 / 11) * 100);
  } finally {
    m.desmontar();
  }
});

test("★★ las opciones de los ítems 1 y 4 van en el orden de la v1; las demás, las líneas y su banco de cuentas se barajan", () => {
  const revolver = (xs) => [...xs].sort(() => Math.random() - 0.5);
  const a = new Set(); const b = new Set();
  for (let i = 0; i < 60; i++) {
    const p = L.prepararH5(revolver);
    assert.deepEqual(p[0].opciones.map((o) => o.valor), ["Sobrante", "Faltante"]);
    assert.deepEqual(p[3].opciones.map((o) => o.valor), ["Sube", "Baja", "No cambia"]);
    a.add(p[6].opciones.map((o) => o.valor).join());
    b.add([2, 5, 7].map((k) => p[k].orden.join() + p[k].lineas.map((l) => l.banco.join()).join()).join());
  }
  assert.ok(a.size > 1 && b.size > 1);
});

test("★★★ en T7-3, justo después de A6: evaluativa, medio, 25 FP", () => {
  assert.deepEqual(clasificacionDe("contabilidad", TEMA_T7_3, D.H5_ID), { tipo: HACER, modalidad: "evaluativa", dificultad: "medio", fpBase: 25 });
  const ids = TEMA.actividades.map((x) => x.id);
  assert.equal(ids.indexOf(D.H5_ID), ids.indexOf("t7-3-provision-inventarios") + 1);
  for (const a of TEMA.actividades.filter((x) => x.clasificacion.tipo !== HACER)) assert.deepEqual(a.clasificacion, { tipo: APRENDER }, a.id);
});

test("★★★ la vista lo abre y registra con el motor; la 0107, aditiva y repetible", () => {
  const ofrecidas = actividadesDeTipo(TEMA, HACER).filter((a) => !a.pendiente).map((a) => a.id).sort();
  assert.deepEqual(JUEGOS_T7_3.map((j) => j.id).sort(), ofrecidas);
  assert.equal(JUEGOS_T7_3.find((j) => j.id === D.H5_ID).Mecanica, AjustePorConteo);
  assert.match(VISTA, /registrarActividadCompletada\(clas, \{\s*materiaId: MATERIA, temaId: TEMA_T7_3, actividadId, porcentajeAciertos: porcentaje, duracionMs, detalle,/);
  assert.match(MIGRACION, /\('t7-3-ajuste-por-conteo',\s*'contabilidad',\s*'inventarios-descuentos-nic2',\s*'evaluativa',\s*'medio',\s*25,\s*1\)/);
  assert.match(MIGRACION, /on conflict \(activity_id\) do nothing;/);
  const sentencias = MIGRACION.split("\n").filter((l) => !l.trim().startsWith("--")).join("\n");
  assert.doesNotMatch(sentencias, /\b(alter|update|delete|drop|truncate)\b/i);
  const dir = new URL("supabase/migrations/", RAIZ);
  assert.deepEqual(readdirSync(dir).filter((f) => readFileSync(new URL(f, dir), "utf8").includes(D.H5_ID)), ["0107_t7_3_ajuste_por_conteo.sql"]);
  assert.deepEqual(readdirSync(dir).filter((f) => f.startsWith("0107")), ["0107_t7_3_ajuste_por_conteo.sql"]);
});

test("★★★ el panel docente: todo item_id tiene etiqueta, leída de los datos, y no se repiten", async () => {
  const m = await montar();
  try {
    await jugar(m, () => false);
    const ids = m.completados[0][2].map((d) => d.item);
    assert.equal(ids.length, 11);
    for (const id of ids) assert.equal(etiquetaDeItem(D.H5_ID, id), recortar(L.unidadDeH5(id)), id);
    assert.equal(new Set(ids.map((id) => L.unidadDeH5(id))).size, 11);
  } finally {
    m.desmontar();
  }
  const fuente = leer("src/docente/etiquetasItem.js");
  const bloque = fuente.slice(fuente.indexOf("CONTABILIDAD · T7 «INVENTARIOS»"));
  assert.match(bloque.slice(0, bloque.indexOf("});")), /"t7-3-ajuste-por-conteo": \(id\) => unidadDeT73H5\(id\),/);
});

/* ═══════════ PATRÓN T7-3 (Watari) ═══════════ */

/* Juega la tanda (un error en los ítems impares de elección) y anota qué figuras se ven antes y después de cada ítem. */
async function figurasPorItem(m, botonFinal, botonSiguiente) {
  const vistas = () => [...m.caja.querySelectorAll("[data-figuras] figure")].map((f) => (f.matches("[data-plazos]")
    ? `plazos ${f.querySelector("[data-pago]")?.textContent ?? "sin pago"}`
    : `${f.querySelector("figcaption").textContent}: ${[...f.querySelectorAll("[data-renglon]")].map((r) => `${r.querySelector(".rg-op").textContent}${r.querySelector(".rg-rot").textContent.replace(/^(menos|por|igual a) /, "")} ${r.querySelector(".rg-v").textContent}${r.classList.contains("rg-res") ? " =" : ""}${r.classList.contains("rg-fuerte") ? " !" : ""}`).join(" | ")}`));
  const r = [];
  for (const [k, it] of EN_ORDEN.entries()) {
    const antes = vistas();
    if (it.lineas) {
      for (const l of it.lineas) { await tocar(ficha(m.caja, l.id, l.cuenta)); await tocar(lado(m.caja, l.id, l.lado)); }
      await tocar(boton(m.caja, "Comprobar"));
    } else if (it.tipo === "cifra") {
      await escribir(m.caja, it.id, k % 2 ? it.distractores[0].valor : it.correcta);
      await tocar(boton(m.caja, "Comprobar"));
    } else {
      const v = k % 2 ? it.opciones.find((o) => o.valor !== it.correcta).valor : it.correcta;
      await tocar(opcion(m.caja, v));
    }
    r.push({ item: it.id, antes, despues: vistas() });
    await tocar(boton(m.caja, k === EN_ORDEN.length - 1 ? botonFinal : botonSiguiente));
  }
  return r;
}

test("★★★ Patrón T7-3: la cuenta de Olmo después de los ítems 2 y 5, mientras dura su caso; Pino sin cuenta", async () => {
  assert.equal(D.OLMO_1.conteo - D.OLMO_1.libros, 36_000);
  assert.equal(D.OLMO_2.libros - D.OLMO_2.conteo, 44_000);
  const S = "Olmo · 31 de diciembre: Conteo físico 648.000 | −Saldo en libros 612.000 | =Sobrante 36.000 =";
  const F = "Olmo · otro año: Saldo en libros 738.000 | −Conteo físico 694.000 | =Faltante 44.000 =";
  const m = await montar();
  try {
    const r = await figurasPorItem(m, D.BOTON_H5.verResumen, D.BOTON_H5.siguiente);
    assert.deepEqual(r.map((x) => [x.item, x.antes, x.despues]), [
      ["sobrante-o-faltante", [], []],
      ["el-sobrante", [], [S]],
      ["ajuste-sobrante", [S], [S]],
      ["que-pasa-con-el-costo", [S], [S]],
      ["el-faltante", [], [F]],
      ["ajuste-faltante", [F], [F]],
      ["estimar-provision", [], []],
      ["perdida-real", [], []],
    ]);
  } finally {
    m.desmontar();
  }
});

/* ═══════════ LOTE 3 · «ARMA LA LÍNEA» Y LA CASILLA DE CIFRA ═══════════ */

/* Las filas de Near para esta pieza: [asiento, cuenta, lado, valor, distractor, retro], en su orden. */
const filasLote3 = () => {
  const seccion = LOTE3.slice(LOTE3.indexOf("### T7-3 H5 · `t7-3-ajuste-por-conteo`"));
  return seccion.slice(0, seccion.indexOf("\n### ", 1)).split("\n")
    .map((l) => l.match(/^\| `([^`]+)` \| (.+?) · ([DH]) · \$([\d.]+) \| (.+?) \| «(.+)» \| [\d,]+ \|$/)).filter(Boolean)
    .map((m) => [m[1], m[2], m[3] === "D" ? DEBE : HABER, Number(m[4].replace(/\./g, "")), m[5], m[6]]);
};

test("★★★ lote 3: los ítems 2 y 5 van con casilla; el 1, el 4 y el 7 se quedan en elección; los asientos, con banco de cuentas", () => {
  assert.deepEqual(D.ITEMS_H5.map((x) => [x.id, x.tipo]), [
    ["sobrante-o-faltante", "eleccion"], ["el-sobrante", "cifra"], ["ajuste-sobrante", "asiento"], ["que-pasa-con-el-costo", "eleccion"],
    ["el-faltante", "cifra"], ["ajuste-faltante", "asiento"], ["estimar-provision", "eleccion"], ["perdida-real", "asiento"],
  ]);
  for (const it of D.ITEMS_H5.filter((x) => x.tipo === "asiento")) for (const l of it.lineas) {
    assert.equal(l.distractores.length, 2, `${it.id}:${l.id}`);
    assert.ok(!l.distractores.some((d) => d.cuenta === l.cuenta), `${it.id}:${l.id}`);
  }
  const p = L.prepararH5((xs) => [...xs].reverse());
  for (const k of [2, 5, 7]) for (const l of p[k].lineas) assert.deepEqual([...l.banco].sort(), [l.cuenta, ...l.distractores.map((d) => d.cuenta)].sort());
  for (const k of [1, 4]) assert.equal(p[k], D.ITEMS_H5[k]);
  /* Una cifra de un distractor: su retroalimentación; otra cualquiera: la respuesta y el porqué del acierto, sin «Así es». */
  assert.deepEqual(L.evaluarH5(item("el-sobrante"), 1_260_000), { ok: false, correcta: 36_000, textos: ["Sumaste los dos valores. El sobrante es la diferencia: $648.000 − $612.000.", "La respuesta es $36.000."], textoCorrecta: "$36.000" });
  assert.deepEqual(L.evaluarH5(item("el-faltante"), 1).textos, ["La respuesta es $44.000.", "$738.000 − $694.000 = $44.000. El conteo da menos que los libros."]);
  assert.equal(L.evaluarH5(item("el-faltante"), 44_000).ok, true);
});

test("★★★ lote 3: los distractores de cuenta de los tres asientos son los de Near, letra por letra y en su orden", () => {
  const fs = filasLote3();
  assert.equal(fs.length, 12);
  const datos = D.ITEMS_H5.filter((x) => x.tipo === "asiento").flatMap((it) => it.lineas.flatMap((l) => l.distractores.map((d) => [it.id, l.cuenta, l.lado, l.valor, d.cuenta, d.retro])));
  assert.deepEqual(datos, fs);
});
