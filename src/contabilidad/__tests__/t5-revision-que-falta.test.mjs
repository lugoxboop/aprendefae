import { test } from "node:test";
import assert from "node:assert/strict";
import { readFileSync, readdirSync, existsSync } from "node:fs";
import { JSDOM, VirtualConsole } from "jsdom";
import { paqueteDConMello, entrega5ConMello, ORDEN_N3 } from "./correccionesMelloEntregaD.mjs";

/*
 * ═══════════════════════════════════════════════════════════════════════════
 * T5 · N3 «¿Qué revisión falta?» (Célula C) · Hacer · N2 adentro, entrega D v2.
 *
 *   · de la fusión de la entrega 5 (con la glosa de Verificar de Mello): las
 *     cuatro acciones con su glosa, el ejemplo resuelto y la pista común
 *   · de la D, con las correcciones de Mello (N3-1 a N3-4): la consigna, el
 *     distintivo, los cinco casos con su acierto y la línea de cada
 *     distractor, en el orden fijo 1, 4, 3, 2, 5; letra por letra y en los
 *     dos sentidos
 *   · la escalera: pista común y línea del distractor, y otro intento; al
 *     segundo error, la respuesta con su porqué; solo suma el primer intento
 *   · la hoja de revisión gana una fila con cada caso resuelto
 *   · evaluativa, fácil, 10 FP, en el cliente y en la 0111 (sin cambios);
 *     N2 ya no está en la lista y N3 va justo después de N1; el panel
 *     docente lee cada ítem
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

const D = await import("../../data/contabilidadT5_n3.js");
const L = await import("../t5N3.js");
const { SUBJECTS, HACER, actividadesDeTipo, clasificacionDe } = await import("../../data/subjects.js");
const { default: RevisionQueFalta } = await import("../../components/mecanicas/libros/t5/RevisionQueFalta.jsx");
const { JUEGOS, TEMA: TEMA_T5 } = await import("../../components/ContabilidadTema5View.jsx");
const { etiquetaDeItem, recortar } = await import("../../docente/etiquetasItem.js");

const RAIZ = new URL("../../../", import.meta.url);
const leer = (f) => readFileSync(new URL(f, RAIZ), "utf8");
const TANDA = leer("orquestador/conocimiento/paquetes/t5-tanda1-v1.1.md");
const MELLO_E5 = leer("orquestador/conocimiento/paquetes/mello-entregas-4-5-6-v1.md");
const VISTA = leer("src/components/ContabilidadTema5View.jsx");
const MIGRACION = leer("supabase/migrations/0111_t5_revision_que_falta.sql");
const TEMA = SUBJECTS.contabilidad.topics.find((t) => t.id === TEMA_T5);

const PAQ = paqueteDConMello();
const S2 = PAQ.slice(PAQ.indexOf("## 2. T5 N3"), PAQ.indexOf("El punto 3 queda en pausa"));
const E5 = entrega5ConMello();
const F = E5.slice(E5.indexOf("## 2. T5 · N3"), E5.indexOf("## 3.", E5.indexOf("## 2. T5 · N3")));
const celdas = (l) => l.replace(/^\| | \|$/g, "").split(" | ");
const citas = (c) => [...c.matchAll(/«([^»]+)»/g)].map((m) => m[1]);

/* Las cuatro acciones de la fusión, con su glosa: «- **Acción:** «glosa»». */
const GLOSAS_F = Object.fromEntries(F.split("\n").filter((l) => /^- \*\*[^*]+:\*\* «/.test(l)).map((l) => [l.match(/^- \*\*([^*]+):\*\*/)[1], citas(l)[0]]));
const ACCION = (corta) => Object.keys(GLOSAS_F).find((a) => a.startsWith(`${corta} `));

/* Los casos de la D: | n | «caso» | INFLESZ | correcta | «acierto» (…) | *Acción:* «línea» (…) · … |. */
const CASOS_D = S2.split("\n").filter((l) => /^\| \d \| «/.test(l)).map((l) => {
  const [n, caso, , correcta, acierto, lineas] = celdas(l);
  const porQueNo = Object.fromEntries([...lineas.matchAll(/\*(\w+):\* «([^»]+)»/g)].map((m) => [ACCION(m[1]), m[2]]));
  return { n: Number(n), pregunta: citas(caso)[0], correcta: ACCION(correcta), acierto: citas(acierto)[0], porQueNo };
});

/* ═══════════ 1 · TEXTOS ═══════════ */

test("★★★ las cuatro acciones y su glosa: las de la fusión, con la glosa de Verificar de Mello", () => {
  assert.deepEqual(D.ACCIONES_N3, Object.keys(GLOSAS_F));
  assert.deepEqual(D.GLOSAS_N3, GLOSAS_F);
  assert.equal(D.GLOSAS_N3["Verificar cada inversión"], "Revisar los datos de cada documento contra los registros.");
  assert.ok(MELLO_E5.includes(`- Glosa de Verificar: «${D.GLOSAS_N3["Verificar cada inversión"]}»`));
  const tanda = citas(TANDA.split("\n").find((l) => l.startsWith("- Opciones en todos los casos: «Verificar")));
  assert.deepEqual(D.ACCIONES_N3, tanda);
  for (const it of D.ITEMS_N3) assert.deepEqual(it.opciones, D.ACCIONES_N3);
});

test("★★★ el ejemplo resuelto («Así se juega») y la pista común: los de la fusión", () => {
  const ej = F.split("\n").find((l) => l.startsWith("**Ejemplo resuelto"));
  assert.equal(D.EJEMPLO_N3.rotulo, citas(ej)[0]);
  assert.equal(D.EJEMPLO_N3.pregunta, citas(ej)[1]);
  assert.ok(ej.includes(`→ ${D.EJEMPLO_N3.correcta.split(" ")[0]}.`));
  assert.equal(D.EJEMPLO_N3.correcta, ACCION("Comprobar"));
  assert.equal(D.EJEMPLO_N3.nota, citas(ej)[2]);
  assert.equal(D.PISTA_N3, citas(F.split("\n").find((l) => l.startsWith("**Pista del primer error")))[0]);
});

test("★★★ consigna y distintivo de la D (no los de la entrega 5 ni los de Mello a la entrega 5); nombre y pie, los de la tanda", () => {
  const fila = (campo) => celdas(S2.split("\n").find((l) => l.startsWith(`| ${campo} |`)));
  assert.deepEqual(D.N3.enunciado, [citas(fila("Consigna")[2])[0]]);
  assert.equal(D.N3.distintivo, citas(fila("Distintivo")[2])[0]);
  assert.doesNotMatch(D.N3.enunciado[0], /intento|Si fallas/);
  assert.ok(!MELLO_E5.includes(`«${D.N3.enunciado[0]}»`), "es la consigna de Mello a la entrega 5");
  assert.ok(TANDA.includes(`## N3 · «${D.N3.nombre}»`));
  assert.ok(TANDA.includes(`**Pie de todos los ítems:** «${D.N3.pie}».`));
  assert.deepEqual([D.HOJA_N3.caso, D.HOJA_N3.accion], citas(S2.match(/dos columnas, «Caso» y «Acción»/)[0]));
});

test("★★★ los cinco casos de la D con Mello: caso, correcta, acierto y una línea por distractor, en el orden 1, 4, 3, 2, 5", () => {
  assert.deepEqual(ORDEN_N3, [1, 4, 3, 2, 5]);
  assert.equal(CASOS_D.length, 5);
  const enOrden = ORDEN_N3.map((n) => CASOS_D.find((c) => c.n === n));
  assert.equal(D.ITEMS_N3.length, 5);
  for (const [k, it] of D.ITEMS_N3.entries()) {
    const c = enOrden[k];
    assert.equal(it.pregunta, c.pregunta, `${it.id}: caso`);
    assert.equal(it.correcta, c.correcta, `${it.id}: correcta`);
    assert.equal(it.acierto, c.acierto, `${it.id}: acierto`);
    assert.deepEqual(it.porQueNo, c.porQueNo, `${it.id}: líneas`);
    assert.deepEqual(Object.keys(it.porQueNo).sort(), D.ACCIONES_N3.filter((a) => a !== it.correcta).sort(), `${it.id}: una por distractor`);
  }
  /* Los choques con la corrección de Mello a la entrega 5: gana la D (el acierto del caso 1 y el caso 3). */
  assert.equal(D.ITEMS_N3[0].acierto, "Así es: la fecha en que se paga un bono es un dato del documento.");
  assert.ok(!D.ITEMS_N3.some((it) => it.pregunta.startsWith("Durante el año, la empresa entró y salió")));
  /* N3-4: nunca dos respuestas iguales seguidas. */
  for (let k = 1; k < 5; k++) assert.notEqual(D.ITEMS_N3[k].correcta, D.ITEMS_N3[k - 1].correcta);
});

test("★★★ Mello N3-1 a N3-3: el caso 3 nuevo; sin «del año» ni «todo lo que»; los casos no regalan la palabra de la opción", () => {
  const c3 = D.ITEMS_N3.find((it) => it.correcta === ACCION("Examinar"));
  assert.equal(c3.pregunta, "Al cierre, el saldo de Inversiones – títulos no coincide con lo guardado. Nada quedó a medias: el error está en algo que entró o salió, y nadie sabe en qué.");
  const textos = [...D.ITEMS_N3.flatMap((it) => [it.pregunta, it.acierto, ...Object.values(it.porQueNo)])];
  for (const t of textos) assert.doesNotMatch(t, /del año|todo lo que/, t);
  /* La D: «dato», «movimiento», «tránsito» y «fondo» no aparecen en ningún caso. */
  for (const it of D.ITEMS_N3) assert.doesNotMatch(it.pregunta, /\b(dato|movimiento|tránsito|fondo)/i, it.id);
});

test("★★ ids: los de antes para los casos que piden lo mismo; sin cifras salvo el 29 de diciembre; nada interno en pantalla", () => {
  assert.deepEqual(D.ITEMS_N3.map((it) => it.id), ["quien-y-cuando", "compra-en-transito", "movimiento-del-ano", "numero-de-serie", "venta-en-transito"]);
  const visibles = [...D.N3.enunciado, D.PISTA_N3, ...Object.values(D.GLOSAS_N3), D.EJEMPLO_N3.pregunta, D.EJEMPLO_N3.nota,
    ...D.ITEMS_N3.flatMap((x) => [x.pregunta, x.acierto, ...Object.values(x.porQueNo)])];
  assert.deepEqual(visibles.join("\n").match(/\d+/g), ["29"]);
  for (const interno of ["CONSTRUCCIÓN", "construcción", "Near", "Mello", "HUECO", "INFLESZ", "Watari"]) assert.ok(!visibles.join("\n").includes(interno), interno);
});

/* ═══════════ 2 · LA MECÁNICA, MONTADA ═══════════ */

/* D8: las acciones se barajan una vez por partida; aquí, al revés, para saber en qué orden van (que varíe, en barajado-por-intento-c.test.mjs). */
const EN_ORDEN = L.prepararN3((xs) => [...xs].reverse());
const Marco = ({ children }) => h("div", { "data-marco": true }, children);
const montar = async (props = {}) => {
  const caja = document.createElement("div");
  document.body.appendChild(caja);
  const raiz = createRoot(caja);
  const completados = [];
  await act(async () => { raiz.render(h(RevisionQueFalta, { Marco, items: EN_ORDEN, onCompletar: (...a) => completados.push(a), ...props })); });
  return { caja, completados, desmontar: () => { act(() => raiz.unmount()); caja.remove(); } };
};
const tocar = async (el) => {
  assert.ok(el, "no está el elemento que se quería tocar");
  await act(async () => { el.dispatchEvent(new w.MouseEvent("click", { bubbles: true })); });
  await act(async () => { await new Promise((r) => setTimeout(r, 0)); });
};
const opcion = (caja, v) => [...caja.querySelectorAll("[data-opcion]")].find((x) => x.dataset.opcion === v)?.querySelector("button");
const boton = (caja, texto) => [...caja.querySelectorAll("button")].find((b) => b.textContent === texto);
const retro = (caja) => [...caja.querySelectorAll("[data-retro] [data-texto-retro]")].map((p) => p.textContent);
/* Las filas de los casos cerrados; el renglón C4 de «Este caso» (data-fila-c4) se mira aparte. */
const filasHoja = (caja) => [...caja.querySelectorAll("[data-hoja-n3] tbody tr:not([data-fila-c4])")].map((tr) => [...tr.querySelectorAll("td")].map((td) => td.textContent));

test("★★★ la tanda entera: ejemplo, glosas, la escalera caso a caso, la hoja que crece, el foco y solo el primer intento", async () => {
  const m = await montar();
  try {
    assert.ok(m.caja.textContent.includes(D.N3.enunciado[0]));
    assert.equal(m.caja.querySelector("[data-contador-intento] [data-primer-intento]").textContent, D.N3.distintivo);
    assert.deepEqual([...m.caja.querySelectorAll("[data-hoja-n3] th")].map((x) => x.textContent), ["Caso", "Acción"]);
    const PLAN = ["una", "bien", "dos", "una", "bien"];
    const detalle = [];
    const hoja = [];
    for (const [k, it] of EN_ORDEN.entries()) {
      assert.equal(m.caja.querySelector("[data-pregunta]").textContent, it.pregunta, `orden: el ítem ${k + 1}`);
      assert.equal(m.caja.querySelector("[data-item] [data-pie]").textContent, D.N3.pie);
      /* El ejemplo, solo sobre el primer caso. */
      const ej = m.caja.querySelector("[data-ejemplo-n3]");
      if (k === 0) {
        assert.equal(ej.querySelector("[data-ejemplo-pregunta]").textContent, D.EJEMPLO_N3.pregunta);
        assert.equal(ej.querySelector("[data-ejemplo-respuesta]").textContent, D.EJEMPLO_N3.correcta);
        assert.equal(ej.querySelector("[data-ejemplo-nota]").textContent, D.EJEMPLO_N3.nota);
        assert.ok(ej.textContent.includes(D.EJEMPLO_N3.rotulo));
        assert.ok(ej.querySelector("button") === null, "el ejemplo no se toca");
      } else assert.ok(ej === null, "el ejemplo sigue después del primer caso");
      /* Las cuatro acciones en el orden sorteado para la partida, cada una con su glosa. */
      assert.deepEqual([...m.caja.querySelectorAll("[data-opcion]")].map((x) => x.dataset.opcion), it.opciones.map((o) => o.valor));
      assert.deepEqual(it.opciones.map((o) => o.valor), [...D.ACCIONES_N3].reverse());
      for (const a of D.ACCIONES_N3) {
        assert.equal(opcion(m.caja, a).querySelector("[data-texto-opcion]").textContent, a);
        assert.equal(opcion(m.caja, a).querySelector("[data-glosa]").textContent, D.GLOSAS_N3[a]);
      }
      assert.deepEqual(filasHoja(m.caja), hoja, "la hoja, antes de resolver");
      const malas = Object.keys(it.porQueNo);
      const [mal1, mal2] = [malas[k % 3], malas[(k + 1) % 3]];
      const plan = PLAN[k];
      if (plan === "bien") await tocar(opcion(m.caja, it.correcta));
      else {
        await tocar(opcion(m.caja, mal1));
        assert.deepEqual(retro(m.caja), [D.PISTA_N3, it.porQueNo[mal1]], `${it.id}: primer error`);
        assert.equal(opcion(m.caja, mal1).dataset.estado, "incorrecta");
        assert.equal(opcion(m.caja, mal1).disabled, true);
        for (const a of D.ACCIONES_N3.filter((a) => a !== mal1)) assert.equal(opcion(m.caja, a).disabled, false);
        assert.ok((boton(m.caja, D.BOTON_N3.siguiente) ?? boton(m.caja, D.BOTON_N3.verResumen)) === undefined, "sin «Siguiente» hasta cerrar el caso");
        assert.deepEqual(filasHoja(m.caja), hoja, "la hoja no crece con un caso abierto");
        assert.ok(document.activeElement === m.caja.querySelector("[data-retro] [data-panel]"), "el foco va al mensaje");
        await tocar(opcion(m.caja, plan === "una" ? it.correcta : mal2));
      }
      if (plan === "dos") {
        assert.deepEqual(retro(m.caja), [`La respuesta es «${it.correcta}».`, it.acierto.replace(/^Así es: (.)/, (_, x) => x.toUpperCase())], `${it.id}: segundo error`);
        assert.equal(opcion(m.caja, it.correcta).dataset.estado, "revelada");
      } else {
        assert.deepEqual(retro(m.caja), [it.acierto], `${it.id}: acierto`);
        assert.equal(opcion(m.caja, it.correcta).dataset.estado, "correcta");
      }
      for (const a of D.ACCIONES_N3) assert.equal(opcion(m.caja, a).disabled, true);
      assert.ok(document.activeElement === m.caja.querySelector("[data-retro] [data-panel]"), "el foco va al mensaje");
      hoja.push([it.pregunta, it.correcta]);
      assert.deepEqual(filasHoja(m.caja), hoja, "la hoja gana la fila del caso resuelto");
      detalle.push({ item: it.id, ok: plan === "bien", intentos: 1, respuesta: plan === "bien" ? null : mal1, orden: k + 1 });
      await tocar(boton(m.caja, k === 4 ? D.BOTON_N3.verResumen : D.BOTON_N3.siguiente));
    }
    assert.equal(m.completados.length, 1);
    const [pct, , det] = m.completados[0];
    assert.deepEqual(det, detalle, "el detalle es el del primer intento");
    assert.deepEqual(det.map((d) => d.item), L.unidadesN3());
    assert.equal(L.TOTAL_N3, 5);
    assert.equal(pct, (2 / 5) * 100, "solo suma el primer intento");
    assert.equal(m.caja.querySelector("[data-resumen]").textContent, D.resumenN3(2, 5));
    assert.deepEqual(filasHoja(m.caja), hoja, "la hoja entera en el cierre");
  } finally {
    m.desmontar();
  }
});

test("★★★ la lógica de la escalera, sin montar", () => {
  const it = D.ITEMS_N3[0];
  assert.deepEqual(L.evaluarN3(it, it.correcta, 0).textos, [it.acierto]);
  assert.equal(L.evaluarN3(it, it.correcta, 1).ok, true);
  const mal = Object.keys(it.porQueNo)[0];
  assert.deepEqual(L.evaluarN3(it, mal, 0), { ok: false, cerrado: false, correcta: it.correcta, textoCorrecta: it.correcta, textos: [D.PISTA_N3, it.porQueNo[mal]] });
  assert.deepEqual(L.evaluarN3(it, mal, 1).textos, ["La respuesta es «Verificar cada inversión».", "La fecha en que se paga un bono es un dato del documento."]);
  assert.equal(L.evaluarN3(it, mal, 1).cerrado, true);
});

/* ═══════════ 3 · CATÁLOGO, VISTA, MIGRACIÓN, PANEL DOCENTE ═══════════ */

test("★★★ en T5 justo después de N1 (N2 salió) y antes de los tres momentos: evaluativa, fácil, 10 FP", () => {
  assert.deepEqual(clasificacionDe("contabilidad", TEMA_T5, D.N3_ID), { tipo: HACER, modalidad: "evaluativa", dificultad: "facil", fpBase: 10 });
  assert.equal(TEMA.actividades.find((a) => a.id === D.N3_ID).nombre, D.N3.nombre);
  const ids = TEMA.actividades.map((x) => x.id);
  assert.ok(!ids.includes("t5-a1-cuidar-las-inversiones"), "N2 sigue en la lista");
  assert.equal(ids.indexOf(D.N3_ID), ids.indexOf("t5-temporal-o-largo-plazo") + 1);
  assert.equal(ids.indexOf("b5-t5-a2-los-tres-momentos-de-una-inversion"), ids.indexOf(D.N3_ID) + 1);
});

test("★★★ la vista abre lo que el catálogo ofrece y registra con el motor compartido", () => {
  const ofrecidas = actividadesDeTipo(TEMA, HACER).filter((a) => !a.pendiente).map((a) => a.id).sort();
  assert.deepEqual(JUEGOS.map((j) => j.id).sort(), ofrecidas);
  assert.equal(JUEGOS.find((j) => j.id === D.N3_ID).Mecanica, RevisionQueFalta);
  assert.match(VISTA, /registrarActividadCompletada\(clas, \{\s*materiaId: MATERIA, temaId: TEMA, actividadId, porcentajeAciertos: porcentaje, duracionMs, detalle,/);
});

test("★★★ la 0111: la misma, sin migración nueva (siguen 5 aciertos)", () => {
  assert.match(MIGRACION, /\('t5-revision-que-falta',\s*'contabilidad',\s*'activos-financieros',\s*'evaluativa',\s*'facil',\s*10,\s*1\)/);
  assert.match(MIGRACION, /on conflict \(activity_id\) do nothing;/);
  const sentencias = MIGRACION.split("\n").filter((l) => !l.trim().startsWith("--")).join("\n");
  assert.doesNotMatch(sentencias, /\b(alter|update|delete|drop|truncate)\b/i);
  const dir = new URL("supabase/migrations/", RAIZ);
  assert.deepEqual(readdirSync(dir).filter((f) => readFileSync(new URL(f, dir), "utf8").includes(D.N3_ID)), ["0111_t5_revision_que_falta.sql"]);
  assert.deepEqual(readdirSync(dir).filter((f) => f.startsWith("0111")), ["0111_t5_revision_que_falta.sql"]);
  assert.ok(existsSync(new URL("src/data/contabilidadT5_n2.js", RAIZ)), "los datos de N2 se quedan");
});

test("★★★ el panel docente: todo item_id que guarda la partida tiene etiqueta, leída de los datos; también el del ejemplo, de antes", async () => {
  const m = await montar();
  try {
    for (const [k, it] of EN_ORDEN.entries()) {
      await tocar(opcion(m.caja, it.correcta));
      await tocar(boton(m.caja, k === 4 ? D.BOTON_N3.verResumen : D.BOTON_N3.siguiente));
    }
    const ids = m.completados[0][2].map((d) => d.item);
    assert.equal(ids.length, 5);
    assert.equal(m.completados[0][0], 100);
    for (const id of ids) {
      const e = etiquetaDeItem(D.N3_ID, id);
      assert.ok(typeof e === "string" && e.trim() !== "", `${id}: sin etiqueta`);
      assert.equal(e, recortar(L.unidadDeN3(id)), id);
    }
    assert.equal(new Set(ids.map((id) => L.unidadDeN3(id))).size, 5);
  } finally {
    m.desmontar();
  }
  assert.equal(etiquetaDeItem(D.N3_ID, "fondo-fiduciario"), recortar(D.EJEMPLO_N3.pregunta));
});

/* ═══════════ C4 · «TODA DECISIÓN SE PINTA» (patrón de Watari, #t5-n3) ═══════════ */

const C4N3 = await import("../c4/t5N3_c4.js");
const { ESPERA_C4 } = await import("../../components/mecanicas/libros/t7/decisionC4.jsx");
const esperar = async (ms = ESPERA_C4 + 20) => { await act(async () => { await new Promise((r) => setTimeout(r, ms)); }); };

test("★★★ C4 · el registro lleva los casos de Near tal cual (los dos sentidos) y cada revisión deja el caso cubierto o sin cubrir", () => {
  const P = C4N3.CONSECUENCIA_C4;
  assert.equal(P.id, "t5-n3");
  assert.equal(P.objeto, "La hoja de revisión");
  assert.equal(P.modo, "hacer");
  assert.deepEqual(P.items.map((x) => x.id), D.ITEMS_N3.map((x) => x.id));
  for (const [k, x] of P.items.entries()) {
    const it = D.ITEMS_N3[k];
    assert.equal(x.texto, it.pregunta);
    assert.equal(x.bien, it.acierto);
    assert.equal(x.pista, D.PISTA_N3);
    assert.deepEqual(x.opciones.map((o) => o.id), D.ACCIONES_N3);
    assert.deepEqual(x.opciones.filter((o) => o.correcta).map((o) => o.t), [it.correcta]);
    for (const o of x.opciones.filter((y) => !y.correcta)) assert.equal(o.msg, it.porQueNo[o.id]);
    assert.deepEqual(P.consecuencia(x, null), { caso: x.id, revision: null, cubierto: null });
    for (const o of x.opciones) {
      assert.deepEqual(P.consecuencia(x, o.id), o.correcta
        ? { caso: x.id, revision: o.id, cubierto: true }
        : { caso: x.id, revision: o.id, cubierto: false, falla: C4N3.FALLA_N3_C4 });
    }
  }
});

test("★★★ C4 · montada: la revisión tocada entra a la hoja en el acto; el veredicto (la escalera de siempre) a los 380 ms", async () => {
  REDUCIDO = false;
  const m = await montar();
  const q = (s) => m.caja.querySelector(s);
  try {
    const it = EN_ORDEN[0];
    const [mal1, mal2] = D.ACCIONES_N3.filter((a) => a !== it.correcta);
    assert.equal(q("[data-titulo-hoja]").textContent, C4N3.HOJA_N3_C4.titulo);
    assert.equal(q("[data-estado-caso]").textContent, C4N3.HOJA_N3_C4.estado.sinRevisar);
    assert.equal(q("[data-fila-c4]"), null);
    /* 1.er toque, malo: la consecuencia antes del veredicto. */
    await tocar(opcion(m.caja, mal1));
    assert.deepEqual([...q("[data-fila-c4]").querySelectorAll("td")].map((td) => td.textContent), [C4N3.HOJA_N3_C4.esteCaso, mal1]);
    assert.equal(q("[data-estado-caso]").dataset.estadoCaso, "abierto");
    assert.equal(q("[data-estado-caso]").textContent, C4N3.HOJA_N3_C4.estado.abierto);
    assert.equal(opcion(m.caja, mal1).dataset.estado, "tocada");
    assert.deepEqual(retro(m.caja), [], "el veredicto llegó antes de 380 ms");
    assert.equal(q("[data-falla]"), null, "la falla salió antes del veredicto");
    await tocar(opcion(m.caja, mal2));
    assert.equal(q("[data-fila-c4]").dataset.revision, mal1, "mientras llega el veredicto no se toca otra");
    await esperar();
    assert.deepEqual(retro(m.caja), [D.PISTA_N3, it.porQueNo[mal1]]);
    assert.equal(q("[data-falla]").textContent, C4N3.FALLA_N3_C4);
    assert.ok(q("[data-falla] svg"), "la falla, con su ✕");
    assert.equal(opcion(m.caja, mal1).dataset.estado, "incorrecta");
    assert.ok(document.activeElement === q("[data-retro] [data-panel]"), "el foco va al mensaje");
    /* 2.º toque, el bueno: cubierto en el acto; luego el acierto y la fila de siempre. */
    await tocar(opcion(m.caja, it.correcta));
    assert.equal(q("[data-fila-c4]").dataset.revision, it.correcta);
    assert.equal(q("[data-estado-caso]").dataset.estadoCaso, "cubierto");
    assert.equal(q("[data-falla]"), null, "la falla de antes se va con la consecuencia nueva");
    assert.deepEqual(filasHoja(m.caja), []);
    await esperar();
    assert.deepEqual(retro(m.caja), [it.acierto]);
    assert.deepEqual(filasHoja(m.caja), [[it.pregunta, it.correcta]]);
    assert.equal(q("[data-fila-c4]"), null, "cerrado, el caso va en su fila");
    await tocar(boton(m.caja, D.BOTON_N3.siguiente));
    assert.equal(q("[data-estado-caso]").textContent, C4N3.HOJA_N3_C4.estado.sinRevisar, "el caso siguiente empieza sin revisar");
    /* Solo el primer intento suma: el detalle guardó el error del primero. */
    for (const [k, x] of EN_ORDEN.slice(1).entries()) {
      await tocar(opcion(m.caja, x.correcta));
      await esperar();
      await tocar(boton(m.caja, k === EN_ORDEN.length - 2 ? D.BOTON_N3.verResumen : D.BOTON_N3.siguiente));
    }
    const [pct, , det] = m.completados[0];
    assert.equal(pct, L.puntuarN3(4));
    assert.deepEqual(det.map((d) => [d.item, d.ok, d.respuesta]), EN_ORDEN.map((x, k) => [x.id, k > 0, k ? null : mal1]));
  } finally {
    REDUCIDO = true;
    m.desmontar();
  }
});

test("★★ C4 · con movimiento reducido, el veredicto llega en el mismo toque y nada se anima", async () => {
  const m = await montar();
  try {
    const it = EN_ORDEN[0];
    const mal = D.ACCIONES_N3.find((a) => a !== it.correcta);
    await tocar(opcion(m.caja, mal));
    assert.deepEqual(retro(m.caja), [D.PISTA_N3, it.porQueNo[mal]]);
    assert.equal(m.caja.querySelector("[data-falla]").textContent, C4N3.FALLA_N3_C4);
    assert.ok(!m.caja.querySelector("[data-hoja-n3]").classList.contains("t5c4-anim"));
  } finally {
    m.desmontar();
  }
});
