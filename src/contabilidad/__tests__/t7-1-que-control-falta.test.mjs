import { test } from "node:test";
import assert from "node:assert/strict";
import { readFileSync, readdirSync } from "node:fs";
import { JSDOM, VirtualConsole } from "jsdom";
import { paqueteDConMello, AUDITORIA_D } from "./correccionesMelloEntregaD.mjs";

/*
 * ═══════════════════════════════════════════════════════════════════════════
 * T7-1 · H7 «¿Qué control falta?» (Célula C) · Hacer · entrega D v2.
 *
 *   · cada texto es, letra por letra, el de la D de Near con las correcciones
 *     obligatorias de Mello (H7-1, H7-2), en los dos sentidos: lo de los
 *     datos está en el paquete y lo del paquete está en los datos; lo que la
 *     D no cambia (nombre, etiqueta, objetivo, «porque», pie) sigue siendo
 *     el de la v1 y su corrección
 *   · siete opciones fijas, en su orden, en todos los casos; los casos, al
 *     azar; ninguna cifra salvo las 40 cajas
 *   · la escalera: pista del distractor y otro intento; al segundo error,
 *     esa pista y el «porque»; solo suma el primer intento, y el `detalle`
 *     del panel docente es el del primer intento
 *   · la figura: el plano con seis puntos que se resuelven caso a caso; sin
 *     ícono ni nombre mientras el caso está abierto (H7-3)
 *   · exploratoria, fácil, 10 FP, en el cliente y en la 0097; después de A7,
 *     la última de T7-1; el panel docente lee cada item_id desde los datos
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

const D = await import("../../data/contabilidadT7_1_h7.js");
const L = await import("../t7H7.js");
const { SUBJECTS, HACER, APRENDER, actividadesDeTipo, clasificacionDe } = await import("../../data/subjects.js");
const { default: QueControlFalta } = await import("../../components/mecanicas/libros/t7/QueControlFalta.jsx");
const { JUEGOS_T7_1, TEMA_T7_1 } = await import("../../components/ContabilidadT7_1View.jsx");
const { etiquetaDeItem, recortar } = await import("../../docente/etiquetasItem.js");

const RAIZ = new URL("../../../", import.meta.url);
const leer = (f) => readFileSync(new URL(f, RAIZ), "utf8");
const V1 = leer("orquestador/conocimiento/paquetes/t7-1-h7-v1.md");
const CAMBIOS = leer("orquestador/conocimiento/paquetes/t7-1-h7-cambios.md");
const VISTA = leer("src/components/ContabilidadT7_1View.jsx");
const MIGRACION = leer("supabase/migrations/0097_t7_1_que_control_falta.sql");
const TEMA = SUBJECTS.contabilidad.topics.find((t) => t.id === TEMA_T7_1);

/* La sección 1 de la D, con las correcciones de Mello encima. */
const PAQ = paqueteDConMello();
const S1 = PAQ.slice(PAQ.indexOf("## 1. T7-1 H7"), PAQ.indexOf("## 2. T5 N3"));
const celdas = (l) => l.replace(/^\| | \|$/g, "").split(" | ");
const cita = (c) => c.match(/«(.+)»/)?.[1] ?? null;

/* La tabla de opciones: | `id` | «texto» |. */
const OPCIONES_PAQ = S1.split("\n").filter((l) => /^\| `\w+` \| «[^»]+» \|$/.test(l)).map((l) => { const [id, t] = celdas(l); return { valor: id.replace(/`/g, ""), texto: cita(t) }; });
const VALOR_DE = Object.fromEntries(OPCIONES_PAQ.map((o) => [o.texto, o.valor]));

/* La tabla de casos: | `id` | «viejo» | «nuevo» | INFLESZ | correcta | qué fallaba |. */
const CASOS_PAQ = S1.slice(S1.indexOf("### Los casos"), S1.indexOf("El subtema de")).split("\n").filter((l) => /^\| `[\w-]+` \|/.test(l)).map(celdas);

/* Las tablas de pistas: tras «**`id`** · correcta: …», | Si elige | «pista» | … |. */
function pistasPaq() {
  const r = {};
  let caso = null;
  for (const l of S1.slice(S1.indexOf("### La pista de cada distractor"), S1.indexOf("**Medida.**")).split("\n")) {
    const m = l.match(/^\*\*`([\w-]+)`\*\* · correcta: (.+)$/);
    if (m) { caso = m[1]; r[caso] = { correcta: m[2], pistas: {} }; continue; }
    if (caso && /^\| [^-|]/.test(l) && !l.startsWith("| Si elige")) { const [elige, pista] = celdas(l); r[caso].pistas[elige] = cita(pista); }
  }
  return r;
}
const PISTAS_PAQ = pistasPaq();

/* ═══════════ 1 · TEXTOS CONTRA LA D, CON MELLO ═══════════ */

test("★★★ las siete opciones: las seis de la D y la requisición de Mello (H7-1), en ese orden, letra por letra", () => {
  assert.equal(OPCIONES_PAQ.length, 7);
  assert.deepEqual(D.CONTROLES_H7, OPCIONES_PAQ);
  assert.equal(D.CONTROLES_H7.at(-1).texto, "Entregas solo con requisición autorizada");
  assert.ok(AUDITORIA_D.includes(`«${D.CONTROLES_H7.at(-1).texto}»`));
});

test("★★★ la consigna y el distintivo, los nuevos de la D; nombre, etiqueta y objetivo, los de la v1 y de L", () => {
  const fila = (campo) => celdas(S1.split("\n").find((l) => l.startsWith(`| ${campo} |`)));
  assert.deepEqual(D.H7.consigna, [cita(fila("Consigna")[2])]);
  assert.equal(D.H7.distintivo, cita(fila("Distintivo")[2]));
  assert.doesNotMatch(D.H7.consigna.join(" "), /intento/);
  assert.equal(D.H7_ID, "t7-1-que-control-falta");
  assert.ok(V1.includes(`| Etiqueta del panel docente | «${D.H7.etiqueta}» |`));
  assert.ok(V1.includes(`- **Propuesta:** «${D.H7.objetivo}»`));
  assert.ok(CAMBIOS.includes(`- «${D.H7.objetivo}»`));
});

test("★★★ cada caso: el texto nuevo, su control, sus seis distractores y el subtema de `mismo-dia`, los de la D", () => {
  assert.equal(CASOS_PAQ.length, 6);
  assert.deepEqual(D.CASOS_H7.map((c) => c.id), CASOS_PAQ.map((f) => f[0].replace(/`/g, "")));
  for (const [k, c] of D.CASOS_H7.entries()) {
    const [, , nuevo, , correcta] = CASOS_PAQ[k];
    assert.equal(c.texto, cita(nuevo), `${c.id}: caso`);
    assert.equal(c.correcta, VALOR_DE[correcta], `${c.id}: control`);
    assert.deepEqual(c.distractores, D.CONTROLES_H7.map((o) => o.valor).filter((v) => v !== c.correcta), `${c.id}: distractores`);
  }
  assert.ok(S1.includes(`El subtema de \`mismo-dia\` pasa de «Comparación con registros» a «${D.CASOS_H7.find((c) => c.id === "mismo-dia").subtema}».`));
});

test("★★★ las pistas de cada distractor: las de la D con las de Mello, en los dos sentidos", () => {
  assert.deepEqual(Object.keys(PISTAS_PAQ), D.CASOS_H7.map((c) => c.id));
  for (const c of D.CASOS_H7) {
    const p = PISTAS_PAQ[c.id];
    assert.equal(VALOR_DE[p.correcta], c.correcta, c.id);
    const esperadas = Object.fromEntries(Object.entries(p.pistas).map(([elige, t]) => [VALOR_DE[elige], t]));
    assert.deepEqual(c.porQueNo, esperadas, c.id);
    assert.deepEqual(Object.keys(c.porQueNo).sort(), [...c.distractores].sort(), `${c.id}: una pista por distractor`);
  }
  /* H7-2: la pista de Conteos en `mismo-dia` ya no dice «revisión». */
  const conteos = D.CASOS_H7.find((c) => c.id === "mismo-dia").porQueNo.conteos;
  assert.equal(conteos, "Ya hay una visita cada mes. El problema es que todos saben qué día llega.");
  assert.doesNotMatch(conteos, /revisi/i);
});

test("★★★ lo que la D no cambia: la línea del libro y el pie de cada caso, los de la v1", () => {
  const filas = V1.slice(V1.indexOf("## Casos")).split("\n").filter((l) => /^\| \d \|/.test(l)).map(celdas);
  assert.equal(filas.length, 6);
  for (const [k, c] of D.CASOS_H7.entries()) assert.equal(c.porque, cita(filas[k][4]), `${c.id}: línea del libro`);
  assert.deepEqual(D.CASOS_H7.map((c) => c.pie), [...Array(5).fill("Basado en el libro, p. 209"), "Basado en el libro, pp. 208-209"]);
});

test("★★ los puntos del plano: el nombre corto de cada caso, el de la D, en su orden", () => {
  const frase = S1.match(/uno por caso: (.+)\. Cada punto/)[1];
  assert.deepEqual(D.CASOS_H7.map((c) => c.punto), frase.split(/, | y /));
});

test("★★ ninguna cifra salvo las 40 cajas de `sin-informe`; ningún texto interno en pantalla", () => {
  const visibles = [...D.H7.consigna, ...D.CONTROLES_H7.map((o) => o.texto), ...D.CASOS_H7.flatMap((c) => [c.texto, c.porque, c.punto, ...Object.values(c.porQueNo)])];
  assert.deepEqual(visibles.join("\n").match(/\d+/g), ["40"]);
  for (const interno of ["CONSTRUCCIÓN", "Near", "Mello", "INFLESZ", "Watari"]) assert.ok(!visibles.join("\n").includes(interno), interno);
});

/* ═══════════ 2 · LA MECÁNICA, MONTADA ═══════════ */

const EN_ORDEN = L.prepararH7((xs) => [...xs]);
const Marco = ({ children }) => h("div", { "data-marco": true }, children);
const montar = async (props = {}) => {
  const caja = document.createElement("div");
  document.body.appendChild(caja);
  const raiz = createRoot(caja);
  const completados = [];
  await act(async () => { raiz.render(h(QueControlFalta, { Marco, items: EN_ORDEN, onCompletar: (...a) => completados.push(a), ...props })); });
  return { caja, completados, desmontar: () => { act(() => raiz.unmount()); caja.remove(); } };
};
const tocar = async (el) => {
  assert.ok(el, "no está el elemento que se quería tocar");
  await act(async () => { el.dispatchEvent(new w.MouseEvent("click", { bubbles: true })); });
  await act(async () => { await new Promise((r) => setTimeout(r, 0)); });
};
const opcion = (caja, v) => caja.querySelector(`[data-opcion="${v}"] button`);
const siguiente = (caja) => [...caja.querySelectorAll("button")].find((b) => Object.values(D.BOTON_H7).includes(b.textContent));
const retro = (caja) => [...caja.querySelectorAll("[data-retro] [data-texto-retro]")].map((p) => p.textContent);
const punto = (caja, id) => caja.querySelector(`[data-plano-h7] [data-punto="${id}"]`);

/* H7-3: un punto abierto es solo su número; uno resuelto, ✓, ícono y nombre corto. */
function revisarPlano(caja, resueltos, actual) {
  for (const [k, c] of EN_ORDEN.entries()) {
    const p = punto(caja, c.id);
    if (resueltos.has(c.id)) {
      assert.equal(p.dataset.resuelto, "si", c.id);
      assert.ok(p.querySelector("[data-icono]"), `${c.id}: sin ícono al resolver`);
      assert.equal(p.querySelector("[data-nombre-punto]").textContent, c.punto);
      assert.ok(p.textContent.includes("✓"));
      assert.ok(p.querySelector("[data-numero]") === null, `${c.id}: sigue el número`);
    } else {
      assert.equal(p.dataset.resuelto, "no", c.id);
      assert.ok(p.querySelector("svg, [data-icono], [data-nombre-punto]") === null, `${c.id}: el punto abierto dibuja el control`);
      assert.equal(p.textContent, String(k + 1), `${c.id}: el número es el del caso en la partida`);
      assert.equal(p.getAttribute("aria-current"), c.id === actual ? "step" : null);
    }
  }
}

test("★★★ la tanda entera: la escalera caso a caso, el plano que se llena, el foco y solo el primer intento", async () => {
  const m = await montar();
  try {
    assert.ok(m.caja.textContent.includes(D.H7.consigna[0]));
    assert.equal(m.caja.querySelector("[data-contador-intento] [data-primer-intento]").textContent, "Vale el primer intento");
    assert.ok(m.caja.querySelector("[data-un-intento]") === null, "el distintivo viejo");
    /* Plan: acierta, falla y acierta, falla dos veces, acierta, falla y acierta, falla dos veces. */
    const PLAN = ["bien", "una", "dos", "bien", "una", "dos"];
    const resueltos = new Set();
    const detalle = [];
    for (const [k, c] of EN_ORDEN.entries()) {
      assert.equal(m.caja.querySelector("[data-pregunta]").textContent, c.texto);
      assert.equal(m.caja.querySelector("[data-item] [data-pie]").textContent, c.pie);
      assert.deepEqual([...m.caja.querySelectorAll("[data-opcion]")].map((x) => x.dataset.opcion), D.CONTROLES_H7.map((o) => o.valor), "siete opciones fijas, en su orden");
      revisarPlano(m.caja, resueltos, c.id);
      const plan = PLAN[k];
      const [mal1, mal2] = c.distractores.slice(k % 3, k % 3 + 2);
      if (plan === "bien") {
        await tocar(opcion(m.caja, c.correcta));
      } else {
        await tocar(opcion(m.caja, mal1));
        /* Primer error: la pista del distractor, otro intento, la elegida bloqueada; nada se enseña. */
        assert.deepEqual(retro(m.caja), [c.porQueNo[mal1]], `${c.id}: primer error`);
        assert.equal(opcion(m.caja, mal1).dataset.estado, "incorrecta");
        assert.equal(opcion(m.caja, mal1).disabled, true);
        for (const o of c.opciones.filter((o) => o.valor !== mal1)) {
          assert.equal(opcion(m.caja, o.valor).disabled, false, `${c.id}: ${o.valor} se puede tocar`);
          assert.equal(opcion(m.caja, o.valor).dataset.estado, "libre");
        }
        assert.ok(siguiente(m.caja) === undefined, "sin «Siguiente» hasta cerrar el caso");
        assert.ok(document.activeElement === m.caja.querySelector("[data-retro] [data-panel]"), "el foco va al mensaje");
        revisarPlano(m.caja, resueltos, c.id);
        await tocar(opcion(m.caja, plan === "una" ? c.correcta : mal2));
      }
      const ok = plan === "bien" || plan === "una";
      if (plan === "dos") {
        assert.deepEqual(retro(m.caja), [c.porQueNo[mal2], c.porque], `${c.id}: segundo error`);
        assert.equal(opcion(m.caja, c.correcta).dataset.estado, "revelada");
        assert.ok(opcion(m.caja, c.correcta).textContent.includes("era esta"));
      } else {
        assert.deepEqual(retro(m.caja), [D.CORRECTO_H7, c.porque], `${c.id}: acierto`);
        assert.equal(opcion(m.caja, c.correcta).dataset.estado, "correcta");
      }
      for (const o of c.opciones) assert.equal(opcion(m.caja, o.valor).disabled, true);
      assert.ok(document.activeElement === m.caja.querySelector("[data-retro] [data-panel]"), "el foco va al mensaje");
      resueltos.add(c.id);
      revisarPlano(m.caja, resueltos, c.id);
      detalle.push({ item: c.id, ok: plan === "bien", intentos: 1, respuesta: plan === "bien" ? null : mal1, orden: k + 1 });
      assert.ok(ok || plan === "dos");
      await tocar(siguiente(m.caja));
    }
    const [pct, , det] = m.completados[0];
    assert.deepEqual(det, detalle, "el detalle es el del primer intento");
    assert.equal(pct, (2 / 6) * 100, "solo suma el primer intento");
    assert.equal(m.caja.querySelector("[data-resumen]").textContent, D.resumenH7(2, 6));
    /* Al final, la bodega cuidada entera. */
    assert.equal(m.caja.querySelectorAll('[data-plano-h7] [data-resuelto="si"]').length, 6);
  } finally {
    m.desmontar();
  }
});

test("★★★ la lógica de la escalera, sin montar", () => {
  const c = D.CASOS_H7[0];
  assert.deepEqual(L.evaluarH7(c, c.correcta, 0), { ok: true, cerrado: true, correcta: c.correcta, textoCorrecta: D.CONTROLES_H7[0].texto, textos: [D.CORRECTO_H7, c.porque] });
  assert.deepEqual(L.evaluarH7(c, "poliza", 0).textos, [c.porQueNo.poliza]);
  assert.equal(L.evaluarH7(c, "poliza", 0).cerrado, false);
  assert.deepEqual(L.evaluarH7(c, "azar", 1).textos, [c.porQueNo.azar, c.porque]);
  assert.equal(L.evaluarH7(c, "azar", 1).cerrado, true);
  assert.deepEqual(L.evaluarH7(c, c.correcta, 1).textos, [D.CORRECTO_H7, c.porque]);
});

test("★★ los casos se barajan en cada intento; las opciones, nunca", () => {
  const revolver = (xs) => [...xs].sort(() => Math.random() - 0.5);
  const casos = new Set();
  for (let i = 0; i < 60; i++) {
    const p = L.prepararH7(revolver);
    assert.deepEqual(p.map((c) => c.id).sort(), D.CASOS_H7.map((c) => c.id).sort());
    casos.add(p.map((c) => c.id).join());
    for (const c of p) assert.deepEqual(c.opciones.map((o) => o.valor), D.CONTROLES_H7.map((o) => o.valor));
  }
  assert.ok(casos.size > 1);
});

/* ═══════════ 3 · CATÁLOGO, VISTA, MIGRACIÓN, PANEL DOCENTE ═══════════ */

test("★★★ en T7-1, después de A7 y última: exploratoria, fácil, 10 FP", () => {
  assert.deepEqual(clasificacionDe("contabilidad", TEMA_T7_1, D.H7_ID), { tipo: HACER, modalidad: "exploratoria", dificultad: "facil", fpBase: 10 });
  for (const a of TEMA.actividades.filter((x) => x.clasificacion.tipo !== HACER)) assert.deepEqual(a.clasificacion, { tipo: APRENDER }, a.id);
  const ids = TEMA.actividades.map((x) => x.id);
  assert.equal(ids.indexOf(D.H7_ID), ids.indexOf("t7-1-a7-control-interno") + 1);
  assert.equal(ids.at(-1), D.H7_ID);
});

test("★★★ la vista abre lo que el catálogo ofrece y registra con el motor compartido", () => {
  const ofrecidas = actividadesDeTipo(TEMA, HACER).filter((a) => !a.pendiente).map((a) => a.id).sort();
  assert.deepEqual(JUEGOS_T7_1.map((j) => j.id).sort(), ofrecidas);
  assert.equal(JUEGOS_T7_1.find((j) => j.id === D.H7_ID).Mecanica, QueControlFalta);
  assert.match(VISTA, /registrarActividadCompletada\(clas, \{\s*materiaId: MATERIA, temaId: TEMA_T7_1, actividadId, porcentajeAciertos: porcentaje, duracionMs, detalle,/);
});

test("★★★ la 0097: la misma, sin migración nueva (siguen 6 aciertos)", () => {
  assert.match(MIGRACION, /\('t7-1-que-control-falta',\s*'contabilidad',\s*'inventarios-periodico',\s*'exploratoria',\s*'facil',\s*10,\s*1\)/);
  assert.match(MIGRACION, /on conflict \(activity_id\) do nothing;/);
  const sentencias = MIGRACION.split("\n").filter((l) => !l.trim().startsWith("--")).join("\n");
  assert.doesNotMatch(sentencias, /\b(alter|update|delete|drop|truncate)\b/i);
  const dir = new URL("supabase/migrations/", RAIZ);
  assert.deepEqual(readdirSync(dir).filter((f) => readFileSync(new URL(f, dir), "utf8").includes(D.H7_ID)), ["0097_t7_1_que_control_falta.sql"]);
  assert.equal(L.TOTAL_H7, 6);
});

test("★★★ el panel docente: todo item_id que guarda la partida tiene etiqueta, leída de los datos", async () => {
  const m = await montar();
  try {
    for (const c of EN_ORDEN) {
      await tocar(opcion(m.caja, c.correcta));
      await tocar(siguiente(m.caja));
    }
    const ids = m.completados[0][2].map((d) => d.item);
    assert.equal(ids.length, 6);
    assert.equal(m.completados[0][0], 100);
    for (const id of ids) {
      const e = etiquetaDeItem(D.H7_ID, id);
      assert.ok(typeof e === "string" && e.trim() !== "", `${id}: sin etiqueta`);
      assert.equal(e, recortar(D.CASOS_H7.find((c) => c.id === id).texto), id);
    }
  } finally {
    m.desmontar();
  }
  const fuente = leer("src/docente/etiquetasItem.js");
  const bloque = fuente.slice(fuente.indexOf("CONTABILIDAD · T7 «INVENTARIOS»"));
  assert.match(bloque.slice(0, bloque.indexOf("});")), /"t7-1-que-control-falta": \(id\) => unidadDeH7\(id\),/);
  for (const c of D.CASOS_H7) assert.ok(!fuente.includes(c.texto), `${c.id}: el caso está copiado en etiquetasItem.js`);
});
