import { test } from "node:test";
import assert from "node:assert/strict";
import { readFileSync, readdirSync } from "node:fs";
import { JSDOM, VirtualConsole } from "jsdom";

/*
 * ═══════════════════════════════════════════════════════════════════════════
 * T7-1 · H4 «Cierra el mes» (Célula C) · Hacer.
 *
 *   · las cifras se RECALCULAN aquí, unidad por unidad, desde las capas, las
 *     ventas y los gastos, y dan las doce de la tabla de Near y sus tres
 *     distractores
 *   · cada texto es el de Near; la corrección 3 manda en la consigna
 *   · catorce unidades, un solo intento cada una (patrón v3.2): las doce
 *     casillas se califican UNA vez al confirmar; las dos líneas, una vez al
 *     comprobar
 *   · tocar una cifra y después la casilla; el banco de quince, barajado
 *   · la fila «Utilidad antes de impuestos» y el cierre de la parte 1, solo
 *     después de confirmar; la parte 2, solo después de la tabla
 *   · se detiene antes del impuesto de renta
 *   · evaluativa, difícil, 50 FP, en el cliente y en la migración 0094;
 *     después de AP4; la vista lo abre desde el camino y registra con el
 *     motor compartido; el panel docente lee cada item_id desde los datos
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

const D = await import("../../data/contabilidadT7_1_h4.js");
const L = await import("../t7H4.js");
const { DEBE, HABER, pesos } = await import("../../data/contabilidad.js");
const { SUBJECTS, HACER, APRENDER, actividadesDeTipo, clasificacionDe } = await import("../../data/subjects.js");
const { default: CierraElMes } = await import("../../components/mecanicas/libros/t7/CierraElMes.jsx");
const { JUEGOS_T7_1, TEMA_T7_1 } = await import("../../components/ContabilidadT7_1View.jsx");
const { etiquetaDeItem, recortar } = await import("../../docente/etiquetasItem.js");
const { firma, textoFigura } = await import("./figuraAcumuladaPrueba.mjs");

const RAIZ = new URL("../../../", import.meta.url);
const leer = (f) => readFileSync(new URL(f, RAIZ), "utf8");
const V1 = leer("orquestador/conocimiento/paquetes/t7-1-h4-v1.md");
const CAMBIOS = leer("orquestador/conocimiento/paquetes/t7-1-h4-cambios.md");
const VISTA = leer("src/components/ContabilidadT7_1View.jsx");
const MIGRACION = leer("supabase/migrations/0094_t7_1_cierra_el_mes.sql");
const TEMA = SUBJECTS.contabilidad.topics.find((t) => t.id === TEMA_T7_1);
const miles = (n) => String(n).replace(/\B(?=(\d{3})+(?!\d))/g, ".");

const Marco = ({ children }) => h("div", { "data-marco": true }, children);
const BANCO = L.bancoH4((xs) => [...xs]);
const montar = async (props = {}) => {
  const caja = document.createElement("div");
  document.body.appendChild(caja);
  const raiz = createRoot(caja);
  const completados = [];
  await act(async () => { raiz.render(h(CierraElMes, { Marco, banco: BANCO, onCompletar: (...a) => completados.push(a), ...props })); });
  return { caja, completados, desmontar: () => { act(() => raiz.unmount()); caja.remove(); } };
};
const tocar = async (el) => {
  assert.ok(el, "no está el elemento que se quería tocar");
  await act(async () => { el.dispatchEvent(new w.MouseEvent("click", { bubbles: true })); });
};
const ficha = (caja, v) => caja.querySelector(`[data-ficha-cifra="${v}"]`);
const casilla = (caja, id) => caja.querySelector(`[data-casilla="${id}"]`);
const boton = (caja, texto) => [...caja.querySelectorAll("button")].find((b) => b.textContent === texto);
const lado = (caja, lineaId, l) => [...caja.querySelectorAll(`[data-linea="${lineaId}"] button`)].find((b) => b.textContent === (l === DEBE ? "Debe" : "Haber"));

/* ═══════════ 1 · LAS CIFRAS, RECALCULADAS ═══════════ */

/* Un cálculo propio: la fila de unidades una por una; las vendidas salen por el extremo que dice el método. */
function recalcular() {
  const u = D.CAPAS_H4.flatMap((c) => Array.from({ length: c.unidades }, () => c.costo));
  const suma = (xs) => xs.reduce((s, x) => s + x, 0);
  const disponible = suma(u);
  const quedan = u.length - D.VENDIDAS_H4;
  const fin = { peps: suma(u.slice(D.VENDIDAS_H4)), ueps: suma(u.slice(0, quedan)), promedio: (disponible / u.length) * quedan };
  const de = (f) => ({ final: f, cmv: disponible - f, bruta: D.VENTAS_H4 - (disponible - f), operacional: D.VENTAS_H4 - (disponible - f) - D.GASTOS_H4 });
  return { disponible, unidades: u.length, quedan, promedio: disponible / u.length, peps: de(fin.peps), ueps: de(fin.ueps), promedioPonderado: de(fin.promedio) };
}

/* La tabla de la v1, fila por fila. */
function tablaV1() {
  const t = V1.slice(V1.indexOf("## Parte 1 · La tabla"));
  return Object.fromEntries(t.split("\n").filter((l) => /^\| (Inventario final|Costo|Utilidad)/.test(l))
    .map((l) => l.slice(1, -1).split(" | ").map((c) => c.trim())).map(([n, ...v]) => [n, v.map((x) => Number(x.replace(/\./g, "")))]));
}

test("★★★ las cifras se recalculan unidad por unidad desde las capas, las ventas y los gastos, y dan la tabla de Near", () => {
  assert.deepEqual(D.CAPAS_H4.map((c) => [c.unidades, c.costo]), [[2_000, 880], [3_000, 950], [2_500, 1_030]]);
  assert.deepEqual([D.VENDIDAS_H4, D.VENTAS_H4, D.GASTOS_H4], [6_000, 7_800_000, 1_150_000]);
  const R = recalcular();
  assert.deepEqual([R.disponible, R.unidades, R.quedan, R.promedio], [7_185_000, 7_500, 1_500, 958]);
  const tabla = tablaV1();
  const filas = { final: "Inventario final", cmv: "Costo de mercancía vendida", bruta: "Utilidad bruta en ventas", operacional: "Utilidad operacional" };
  for (const [k, nombre] of Object.entries(filas)) {
    assert.deepEqual([R.peps[k], R.ueps[k], R.promedioPonderado[k]], tabla[nombre], `${nombre}: el recálculo no da la tabla de Near`);
    assert.deepEqual(D.METODOS_H4.map((m) => m.cifras[k]), tabla[nombre], `${nombre}: los datos no dan la tabla de Near`);
  }
  /* Los distractores: lo disponible, solo las compras, y el punto medio por las que quedan. */
  assert.deepEqual(D.DISTRACTORES_H4.map((d) => d.valor), [R.disponible, 2_850_000 + 2_575_000, ((880 + 1_030) / 2) * R.quedan]);
  assert.ok(V1.includes("**7.185.000** · **5.425.000** · **1.432.500**"));
  /* El banco: quince cifras distintas, doce correctas y tres distractores. */
  const banco = L.bancoH4((xs) => [...xs]);
  assert.equal(banco.length, 15);
  assert.equal(new Set(banco).size, 15, "una cifra repetida en el banco");
  /* Y las del cierre: el inicial que sale y el final con el promedio que entra. */
  assert.deepEqual(D.PARTE2_H4.lineas.map((l) => l.valor), [2_000 * 880, R.promedioPonderado.final]);
});

/* ═══════════ 2 · TEXTOS CONTRA NEAR ═══════════ */

test("★★★ los textos son los de Near, y la corrección 3 manda en la consigna", () => {
  assert.equal(D.H4_ID, "t7-1-cierra-el-mes");
  assert.ok(V1.includes(`| id | \`${D.H4_ID}\` |`));
  assert.ok(V1.includes(`| Etiqueta | «${D.H4.etiqueta}» |`));
  assert.ok(V1.includes(`- «${D.H4.entrada}»`));
  for (const [dato, texto] of D.FICHA_H4) assert.ok(V1.includes(`| ${dato} | ${texto} |`), dato);
  /* La consigna: la frase de tocar es la de la corrección; la de arrastrar ya no está. */
  assert.ok(CAMBIOS.includes("«Toca una cifra y después la casilla donde va. Sobran tres cifras.»"));
  assert.equal(D.H4.consigna[0], "Cierra el mes con los tres métodos. Toca una cifra y después la casilla donde va. Sobran tres cifras.");
  assert.ok(!JSON.stringify(D).includes("Arrastra"), "sigue la consigna de arrastrar");
  assert.ok(V1.includes(`- «${D.H4.consigna[1]}»`));
  assert.ok(V1.includes(`fórmula de A4: «${D.H4.recordatorio}»`));
  for (const f of D.FILAS_H4.filter((x) => x.id !== "cmv")) assert.ok(V1.includes(`«${f.retro}»`), f.id);
  assert.equal(D.FILAS_H4.find((x) => x.id === "cmv").retro, D.H4.recordatorio, "la fila del costo usa la fórmula de A4");
  for (const d of D.DISTRACTORES_H4) assert.ok(V1.includes(`  - ${miles(d.valor)}: «${d.retro}»`), String(d.valor));
  assert.ok(V1.includes(`con el texto: «${D.UTILIDAD_ANTES_H4.texto}»`));
  assert.ok(V1.includes(`**Cierre de la parte 1, siempre visible:** «${D.CIERRE_PARTE1_H4}»`));
  assert.ok(V1.includes(`- «${D.PARTE2_H4.consigna}»`));
  for (const l of D.PARTE2_H4.lineas) {
    assert.ok(V1.includes(`  - «${l.cuenta} · $${miles(l.valor)}» → ${l.lado === DEBE ? "Debe" : "Haber"}`), l.id);
    assert.ok(V1.includes(`  - «${l.retro}»`), l.id);
  }
  assert.ok(V1.includes(`**Pie de toda la actividad:** «${D.H4.pie}»`));
  /* 33 %: se detiene en la utilidad antes de impuestos. */
  assert.doesNotMatch(JSON.stringify(D), /impuesto de renta|33 ?%/i);
});

/* ═══════════ 3 · LA MECÁNICA, MONTADA ═══════════ */

/* Llena las doce casillas; `cambia(id)` devuelve la cifra a poner en lugar de la buena. */
async function llenar(m, cambia = () => null) {
  const puestas = {};
  const usadas = new Set();
  for (const c of L.CASILLAS_H4) {
    const otra = cambia(c.id);
    puestas[c.id] = otra ?? c.valor;
  }
  /* Ninguna cifra se pone dos veces. */
  for (const c of L.CASILLAS_H4) {
    const v = puestas[c.id];
    assert.ok(!usadas.has(v), `la cifra ${v} se usaría dos veces`);
    usadas.add(v);
    await tocar(ficha(m.caja, v));
    await tocar(casilla(m.caja, c.id));
  }
  return puestas;
}

test("★★★ tocar una cifra y después la casilla la pone; tocar una casilla llena la vacía; «Confirmar» solo con las doce", async () => {
  const m = await montar();
  try {
    const c = L.CASILLAS_H4[0];
    assert.equal(boton(m.caja, D.BOTON_H4.confirmar).disabled, true);
    await tocar(ficha(m.caja, c.valor));
    assert.equal(ficha(m.caja, c.valor).getAttribute("aria-pressed"), "true");
    await tocar(casilla(m.caja, c.id));
    assert.equal(casilla(m.caja, c.id).textContent, pesos(c.valor));
    assert.equal(ficha(m.caja, c.valor) === null, true, "la cifra puesta sigue en el banco");
    await tocar(casilla(m.caja, c.id));
    assert.equal(casilla(m.caja, c.id).textContent, "—", "tocar la casilla llena no la vació");
    assert.ok(ficha(m.caja, c.valor), "la cifra no volvió al banco");
    await llenar(m);
    assert.equal(boton(m.caja, D.BOTON_H4.confirmar).disabled, false);
    assert.equal(m.caja.querySelector("[data-antes-impuestos]") === null, true, "la utilidad antes de impuestos sale antes de confirmar");
    assert.equal(m.caja.querySelector("[data-cierre-parte1]") === null, true, "el cierre de la parte 1 sale antes de confirmar");
    assert.equal(m.caja.querySelector('[data-parte-h4="cierre"]') === null, true);
  } finally {
    m.desmontar();
  }
});

test("★★★ la tanda entera: doce casillas calificadas una vez al confirmar, dos líneas al comprobar; 14 unidades y aciertos / 14", async () => {
  const m = await montar();
  try {
    /* Dos errores con distractores: el disponible en el costo de PEPS y el punto medio en el final con promedio. Las dos buenas quedan en el banco. */
    const malas = {
      "peps:cmv": D.DISTRACTORES_H4[0].valor,
      "promedio:final": D.DISTRACTORES_H4[2].valor,
    };
    await llenar(m, (id) => malas[id] ?? null);
    await tocar(boton(m.caja, D.BOTON_H4.confirmar));
    /* Bloqueadas: un segundo toque no cambia nada. */
    for (const c of L.CASILLAS_H4) assert.equal(casilla(m.caja, c.id).disabled, true, c.id);
    assert.equal(boton(m.caja, D.BOTON_H4.confirmar) === undefined, true, "«Confirmar» sigue ahí");
    /* Cada casilla mala: la línea del distractor primero, después la de su fila; la buena se enseña. */
    for (const [id, v] of Object.entries(malas)) {
      const textos = [...m.caja.querySelectorAll(`[data-retro-casilla="${id}"] [data-texto-retro]`)].map((p) => p.textContent);
      assert.deepEqual(textos, L.evaluarCasillaH4(id, v).textos, id);
      assert.equal(textos[0], D.DISTRACTORES_H4.find((d) => d.valor === v).retro);
      assert.equal(casilla(m.caja, id).dataset.estado, "mal");
    }
    assert.equal(m.caja.querySelectorAll("[data-retro-casilla]").length, 2);
    assert.equal(m.caja.querySelectorAll("[data-antes-impuestos]").length, 3);
    assert.equal(m.caja.querySelector("[data-cierre-parte1]").textContent, D.CIERRE_PARTE1_H4);
    /* Parte 2. */
    await tocar(boton(m.caja, D.BOTON_H4.siguiente));
    const [quitar, colocar] = D.PARTE2_H4.lineas;
    await tocar(lado(m.caja, quitar.id, DEBE)); // mal
    await tocar(lado(m.caja, colocar.id, DEBE));
    await tocar(boton(m.caja, "Comprobar"));
    assert.deepEqual([...m.caja.querySelectorAll(`[data-linea="${quitar.id}"] [data-texto-retro]`)].map((p) => p.textContent), [quitar.retro]);
    assert.equal(m.caja.querySelector("[data-asiento-completo]") === null, true, "dos líneas sueltas no llevan sumas");
    await tocar(boton(m.caja, D.BOTON_H4.verResumen));
    assert.equal(m.completados.length, 1);
    const [pct, , det] = m.completados[0];
    assert.deepEqual(det.map((d) => d.item), L.unidadesH4());
    assert.ok(det.every((d) => d.intentos === 1));
    assert.equal(det.filter((d) => !d.ok).length, 3);
    assert.equal(pct, (11 / 14) * 100);
    assert.equal(m.caja.querySelector("[data-resumen]").textContent, D.resumenH4(11, 14));
  } finally {
    m.desmontar();
  }
});

test("★★ el banco se baraja en cada intento", () => {
  const revolver = (xs) => [...xs].sort(() => Math.random() - 0.5);
  const ordenes = new Set();
  for (let i = 0; i < 40; i++) ordenes.add(L.bancoH4(revolver).join());
  assert.ok(ordenes.size > 1);
  assert.match(leer("src/components/mecanicas/libros/t7/CierraElMes.jsx"), /useTanda\(\(\) => banco \?\? bancoH4\(barajar\)\)/);
});

/* ═══════════ 4 · CATÁLOGO, VISTA, MIGRACIÓN, PANEL DOCENTE ═══════════ */

test("★★★ en T7-1, después de AP4: evaluativa, difícil, 50 FP; las piezas de Aprender siguen sin FP", () => {
  assert.deepEqual(clasificacionDe("contabilidad", TEMA_T7_1, D.H4_ID), { tipo: HACER, modalidad: "evaluativa", dificultad: "dificil", fpBase: 50 });
  assert.equal(TEMA.actividades.find((a) => a.id === D.H4_ID).nombre, D.H4.nombre);
  for (const a of TEMA.actividades.filter((x) => x.clasificacion.tipo !== HACER)) assert.deepEqual(a.clasificacion, { tipo: APRENDER }, a.id);
  const ids = TEMA.actividades.map((x) => x.id);
  assert.equal(ids.indexOf(D.H4_ID), ids.indexOf("t7-1-a4-el-cierre-en-periodico") + 1, "justo después de AP4");
});

test("★★★ la vista abre desde el camino exactamente lo que el catálogo ofrece, y registra con el motor compartido", () => {
  const ofrecidas = actividadesDeTipo(TEMA, HACER).filter((a) => !a.pendiente).map((a) => a.id).sort();
  assert.deepEqual(JUEGOS_T7_1.map((j) => j.id).sort(), ofrecidas);
  assert.equal(JUEGOS_T7_1.find((j) => j.id === D.H4_ID).Mecanica, CierraElMes);
  assert.match(VISTA, /registrarActividadCompletada\(clas, \{\s*materiaId: MATERIA, temaId: TEMA_T7_1, actividadId, porcentajeAciertos: porcentaje, duracionMs, detalle,/);
  assert.match(leer("src/App.jsx"), /<ContabilidadT7_1View modo=\{modoTema\} nodoInicial=\{ruta\.extra\}/);
});

test("★★★ la 0094: del rango de la célula, un insert aditivo y repetible, con su comprobación y sin correr", () => {
  assert.match(MIGRACION, /\('t7-1-cierra-el-mes',\s*'contabilidad',\s*'inventarios-periodico',\s*'evaluativa',\s*'dificil',\s*50,\s*1\)/);
  assert.match(MIGRACION, /on conflict \(activity_id\) do nothing;/);
  const sentencias = MIGRACION.split("\n").filter((l) => !l.trim().startsWith("--")).join("\n");
  assert.doesNotMatch(sentencias, /\b(alter|update|delete|drop|truncate)\b/i);
  const dir = new URL("supabase/migrations/", RAIZ);
  const conElId = readdirSync(dir).filter((f) => readFileSync(new URL(f, dir), "utf8").includes(D.H4_ID));
  assert.deepEqual(conElId, ["0094_t7_1_cierra_el_mes.sql"]);
});

test("★★★ el panel docente: todo item_id que guarda la partida tiene etiqueta, leída de los datos", async () => {
  const m = await montar();
  try {
    await llenar(m);
    await tocar(boton(m.caja, D.BOTON_H4.confirmar));
    await tocar(boton(m.caja, D.BOTON_H4.siguiente));
    for (const l of D.PARTE2_H4.lineas) await tocar(lado(m.caja, l.id, l.lado));
    await tocar(boton(m.caja, "Comprobar"));
    await tocar(boton(m.caja, D.BOTON_H4.verResumen));
    const ids = m.completados[0][2].map((d) => d.item);
    assert.equal(ids.length, 14);
    assert.equal(m.completados[0][0], 100);
    for (const id of ids) {
      const etiqueta = etiquetaDeItem(D.H4_ID, id);
      assert.ok(typeof etiqueta === "string" && etiqueta.trim() !== "", `${id}: sin etiqueta en el panel`);
      assert.equal(etiqueta, recortar(L.unidadDeH4(id)), id);
    }
  } finally {
    m.desmontar();
  }
  const fuente = leer("src/docente/etiquetasItem.js");
  const bloque = fuente.slice(fuente.indexOf("CONTABILIDAD · T7 «INVENTARIOS»"));
  assert.match(bloque.slice(0, bloque.indexOf("});")), /"t7-1-cierra-el-mes": \(id\) => unidadDeH4\(id\),/);
});

/* ═══════════ LOTE 5 · LA FIGURA ACUMULADA ═══════════ */

test("★★★ lote 5: el estado de resultados resuelto se queda en la parte 2, y el cierre se suma al comprobarlo", async () => {
  const m = await montar();
  try {
    /* Parte 1: la tabla es el ítem mismo; la figura no está, ni al confirmar. */
    assert.deepEqual(firma(m.caja), []);
    await llenar(m);
    await tocar(boton(m.caja, D.BOTON_H4.confirmar));
    assert.deepEqual(firma(m.caja), []);
    await tocar(boton(m.caja, D.BOTON_H4.siguiente));
    /* Parte 2: la tabla resuelta, con las cifras buenas y la utilidad antes de impuestos, arriba. */
    assert.deepEqual(firma(m.caja), ["tabla 5 filas"]);
    const tabla = m.caja.querySelector("[data-tabla-figura]");
    assert.deepEqual([...tabla.querySelectorAll("[role=columnheader]")].map((x) => x.textContent), D.METODOS_H4.map((x) => x.nombre));
    assert.deepEqual([...tabla.querySelectorAll("[data-fila-tabla]")].map((f) => [...f.children].map((x) => x.textContent)), [
      ...D.FILAS_H4.map((f) => [f.nombre, ...D.METODOS_H4.map((x) => miles(x.cifras[f.id]))]),
      [D.UTILIDAD_ANTES_H4.nombre, ...D.METODOS_H4.map((x) => miles(x.cifras.operacional))],
    ]);
    assert.ok(m.caja.querySelector("[data-figura-acumulada]").compareDocumentPosition(m.caja.querySelector("[data-parte-h4='cierre']")) & w.Node.DOCUMENT_POSITION_FOLLOWING);
    /* E8: las dos líneas del cierre no están antes de comprobarlas (con error en una). */
    assert.ok(!m.caja.querySelector("[data-asiento-figura]"));
    const [a, b] = D.PARTE2_H4.lineas;
    await tocar(lado(m.caja, a.id, a.lado));
    await tocar(lado(m.caja, b.id, a.lado));
    assert.deepEqual(firma(m.caja), ["tabla 5 filas"]);
    await tocar(boton(m.caja, "Comprobar"));
    assert.deepEqual(firma(m.caja), ["tabla 5 filas", "asiento : 2 líneas"]);
    await tocar(boton(m.caja, D.BOTON_H4.verResumen));
    assert.equal(m.caja.querySelector("[data-figura-acumulada]"), null);
  } finally {
    m.desmontar();
  }
});
