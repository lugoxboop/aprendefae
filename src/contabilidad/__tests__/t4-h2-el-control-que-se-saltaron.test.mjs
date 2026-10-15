import { test } from "node:test";
import assert from "node:assert/strict";
import { readFileSync, readdirSync } from "node:fs";
import { JSDOM, VirtualConsole } from "jsdom";

/*
 * ═══════════════════════════════════════════════════════════════════════════
 * T4 · H2 «El control que se saltaron» (Célula D) · Hacer · evaluativa · 10 FP.
 *
 *   · cada texto es el del paquete vigente de Katsumi, letra por letra: los
 *     siete controles (los de A1), los siete casos, su control, sus dos
 *     distractores con su retroalimentación, y la póliza nueva («se queda
 *     con su plata»)
 *   · la pantalla de Hanayama: pie neutro «Caso construido», la pregunta,
 *     tres opciones barajadas por caso, un solo toque, la página del control
 *     correcto en la devolución, coral solo en el error
 *   · PH8-2: mientras se pregunta, nada de la respuesta está en el DOM
 *     (textContent y outerHTML, nunca innerText)
 *   · el camino, el motor, la 0201, el panel docente y el «Así se juega»
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

const D = await import("../../data/contabilidadT4H2.js");
const A = await import("../../data/contabilidadT4.js");
const { SUBJECTS, HACER, actividadesDeTipo, clasificacionDe } = await import("../../data/subjects.js");
const { default: ContabilidadT4View, ElControlQueSeSaltaron, JUEGOS_T4, TEMA_T4 } = await import("../../components/ContabilidadT4View.jsx");
const { AuthContext } = await import("../../auth/AuthProvider.jsx");
const { etiquetaDeItem, recortar } = await import("../../docente/etiquetasItem.js");
const { ASI_SE_JUEGA } = await import("../../data/asiSeJuega.js");
const { inflesz } = await import("../../herramientas/inflesz.js");
const { leer, CITA, PAQUETES, RAIZ, blobEnLaRamaFuente, blobDeLaCopia, RAMA_FUENTE } = await import("./t4-paquete.mjs");

const PAQ = leer(`${PAQUETES}d4-t4-h2-v1.md`);
const ASI = leer(`${PAQUETES}d4-t4-asi-se-juega-v1.md`);
const VISTA = leer("src/components/ContabilidadT4View.jsx");
const MIGRACION = leer("supabase/migrations/0201_t4_el_control_que_se_saltaron.sql");
const TEMA = SUBJECTS.contabilidad.topics.find((t) => t.id === TEMA_T4);

/* ═══════════ EL PAQUETE, LEÍDO ═══════════ */

const TABLA_CONTROLES = [...PAQ.matchAll(new RegExp(`^\\| (\\d) \\| ${CITA} \\([^)]*\\) \\| (\\d+) \\|$`, "gm"))].map((m) => ({ n: m[1], texto: m[2], pagina: Number(m[3]) }));
const cita = (b, rotulo) => b.match(new RegExp(`^- \\*\\*${rotulo}:\\*\\* ${CITA}`, "m"))?.[1] ?? null;
const CASOS = PAQ.slice(PAQ.indexOf("## Casos"), PAQ.indexOf("## Cierre")).split(/\n(?=### H2-\d)/).slice(1).map((b) => ({
  id: `h2-${b.match(/^### H2-(\d)/)[1]}`,
  subtema: b.match(/^- \*\*Subtema:\*\* (.+)$/m)[1].trim(),
  caso: cita(b, "Caso"),
  correcta: `c${b.match(/^- \*\*Correcta:\*\* control (\d)/m)[1]}`,
  acierto: cita(b, "Acierto"),
  distractores: Object.fromEntries([...b.matchAll(new RegExp(`^- \\*\\*Distractor «control (\\d)[^»]*»:\\*\\* ${CITA}`, "gm"))].map((m) => [`c${m[1]}`, m[2]])),
}));

/* ═══════════ 1 · EL TEXTO, CONTRA EL PAQUETE ═══════════ */

test("★★★ la copia del paquete de H2 es la de la punta de la rama de Katsumi (si este clon la tiene)", (t) => {
  const enLaRama = blobEnLaRamaFuente("d4-t4-h2-v1.md");
  if (!enLaRama) { t.skip(`este clon no tiene ${RAMA_FUENTE}`); return; }
  assert.equal(blobDeLaCopia("d4-t4-h2-v1.md"), enLaRama, "la copia de H2 no es la última versión aprobada");
});

test("★★★ ficha: id, nombre, objetivo, consigna y subtemas son los del paquete", () => {
  assert.match(PAQ, /\*\*Este archivo es la versión vigente\*\*/);
  assert.match(PAQ, new RegExp(`\\| id \\| \`${D.H2_ID}\` \\|`));
  assert.ok(PAQ.startsWith(`**T4 · H2 «${D.H2.nombre}»`));
  assert.ok(PAQ.includes(`«${D.H2.objetivo}»`));
  const consigna = PAQ.slice(PAQ.indexOf("## Consigna"), PAQ.indexOf("## Los siete controles"));
  assert.deepEqual([...consigna.matchAll(new RegExp(`^- ${CITA}`, "gm"))].map((m) => m[1]), D.H2.consigna);
  assert.equal(PAQ.match(/\| Subtemas \| (.+) \|/)[1], D.SUBTEMAS_H2.join(" · "));
});

test("★★★ los siete controles: los del paquete, con su página, y los mismos textos de la lista de A1", () => {
  assert.equal(TABLA_CONTROLES.length, 7, "no se leyó la tabla de los siete controles");
  assert.deepEqual(D.CONTROLES_H2.map((c) => [c.id, c.texto, c.pagina]), TABLA_CONTROLES.map((c) => [`c${c.n}`, c.texto, c.pagina]));
  const controlesA1 = A.PIEZA_LA_CAJA.pantallas.find((p) => p.id === "controles").listaNumerada;
  assert.deepEqual(D.CONTROLES_H2.map((c) => c.texto), controlesA1, "los controles de H2 no son los de A1");
});

test("★★★ los siete casos: caso, subtema, control que falla, acierto y cada distractor, letra por letra, en el orden del paquete", () => {
  assert.equal(CASOS.length, 7, "no se leyeron los siete casos");
  assert.deepEqual(D.CASOS_H2.map(({ id, subtema, caso, correcta, acierto, distractores }) => ({ id, subtema, caso, correcta, acierto, distractores })), CASOS);
  /* Cada control es la respuesta de un caso, y ningún caso trae su propio control como distractor. */
  assert.deepEqual(D.CASOS_H2.map((c) => c.correcta).sort(), D.CONTROLES_H2.map((c) => c.id).sort());
  for (const c of D.CASOS_H2) {
    assert.equal(Object.keys(c.distractores).length, 2, `${c.id}: no son dos distractores`);
    assert.ok(!(c.correcta in c.distractores), `${c.id}: su control está entre los distractores`);
  }
});

test("★★★ la póliza usa el texto nuevo («se queda con su plata»), nunca «causa una pérdida» ni «a quienes tocan la plata»", () => {
  const todo = [...D.CONTROLES_H2.map((c) => c.texto), ...D.CASOS_H2.flatMap((c) => [c.caso, c.acierto, ...Object.values(c.distractores)])].join("\n");
  assert.ok(D.CASOS_H2.filter((c) => Object.values(c.distractores).some((x) => x.startsWith("La póliza cubre a la empresa si alguien se queda con su plata."))).length >= 3);
  assert.doesNotMatch(todo, /causa una pérdida|a quienes tocan la plata|Asegurar con una póliza/);
  assert.equal(D.controlH2("c6").texto, "Tener una póliza de manejo sobre quienes manejan la plata.");
});

test("★★ el cierre y su pie; INFLESZ de todo texto de 10 palabras o más, 65 o más; sin cifras", () => {
  const cierre = PAQ.slice(PAQ.indexOf("## Cierre"));
  assert.ok(cierre.includes(`«${D.CIERRE_H2.texto}»`));
  assert.equal(D.CIERRE_H2.pie, cierre.match(new RegExp(`^- Pie: ${CITA}`, "m"))[1]);
  const textos = [D.H2.objetivo, ...D.H2.consigna, ...D.CASOS_H2.flatMap((c) => [c.caso, c.acierto, ...Object.values(c.distractores)]), D.CIERRE_H2.texto];
  const medidos = textos.map((t) => ({ t, r: inflesz(t) })).filter((x) => x.r.aplica);
  assert.ok(medidos.length >= 25);
  assert.deepEqual(medidos.filter((x) => !x.r.cumple).map((x) => `${x.r.valor} · ${x.t}`), []);
  assert.deepEqual(textos.filter((t) => /\$|\d/.test(t)), []);
});

/* ═══════════ 2 · LO QUE SE VE ═══════════ */

const Marco = ({ children }) => h("div", { "data-marco": true }, children);
/* Un orden fijo para las pruebas: los casos del paquete con sus opciones en el orden del paquete. */
const SIN_BARAJAR = D.CASOS_H2.map((c) => ({ ...c, opciones: [c.correcta, ...Object.keys(c.distractores)] }));
const montar = async (props = {}) => {
  const caja = document.createElement("div");
  document.body.appendChild(caja);
  const raiz = createRoot(caja);
  const completados = [];
  await act(async () => { raiz.render(h(ElControlQueSeSaltaron, { Marco, items: SIN_BARAJAR, onCompletar: (...a) => completados.push(a), ...props })); });
  return { caja, completados, desmontar: () => { act(() => raiz.unmount()); caja.remove(); } };
};
const tocar = async (el) => {
  assert.ok(el, "no está el elemento que se quería tocar");
  await act(async () => { el.dispatchEvent(new w.MouseEvent("click", { bubbles: true })); });
};
const opcion = (caja, id) => caja.querySelector(`[data-opcion="${id}"] button`);
const siguiente = (caja) => [...caja.querySelectorAll("button")].find((b) => [D.BOTON_H2.siguiente, D.BOTON_H2.verResumen].includes(b.textContent));
const retro = (caja) => [...caja.querySelectorAll("[data-texto-retro]")].map((p) => p.textContent);
const delatores = (c) => [c.acierto, ...Object.values(c.distractores), D.paginaH2(D.controlH2(c.correcta).pagina), D.CORRECTO, D.lectorErrorH2(D.controlH2(c.correcta).texto)];

test("★★★ la tarjeta: el caso y el pie neutro «Caso construido», igual en los siete; la pregunta; tres opciones, cada una un control", async () => {
  const m = await montar();
  try {
    for (const c of SIN_BARAJAR) {
      const tarjeta = m.caja.querySelector(`[data-tarjeta-caso="${c.id}"]`);
      assert.equal(tarjeta.querySelector("[data-caso]").textContent, c.caso);
      assert.equal(tarjeta.querySelector("[data-pie]").textContent, D.PIE_CASO_H2);
      assert.doesNotMatch(tarjeta.textContent, /\bpp?\.\s*\d|Basado en el libro/);
      assert.equal(m.caja.querySelector("[data-pregunta]").textContent, D.PREGUNTA_H2);
      assert.deepEqual([...m.caja.querySelectorAll("[data-opcion] button")].map((b) => b.textContent.trim()), c.opciones.map((id) => D.controlH2(id).texto));
      await tocar(opcion(m.caja, c.correcta));
      await tocar(siguiente(m.caja));
    }
  } finally { m.desmontar(); }
});

test("★★★ PH8-2: mientras se pregunta, nada de la respuesta está en el DOM (textContent y outerHTML, no innerText)", async () => {
  const m = await montar();
  try {
    const antes = [];
    for (const c of SIN_BARAJAR) {
      const dom = `${m.caja.textContent}\n${m.caja.outerHTML}`;
      for (const x of delatores(c)) assert.ok(!dom.includes(x), `${c.id}: antes de responder, el DOM ya trae «${x.slice(0, 60)}»`);
      assert.equal(m.caja.querySelectorAll("[data-panel], [data-pagina], [data-texto-retro]").length, 0, `${c.id}: hay devolución montada`);
      assert.doesNotMatch(m.caja.outerHTML, /data-correct|data-respuesta|aria-(?:checked|selected)="true"/);
      /* Lo que rodea al caso es igual en los siete: el pie y la pregunta no cambian con la respuesta. */
      antes.push(m.caja.querySelector("[data-pie]").outerHTML + m.caja.querySelector("[data-pregunta]").outerHTML + m.caja.querySelector("[data-retro]").outerHTML);
      await tocar(opcion(m.caja, c.correcta));
      await tocar(siguiente(m.caja));
    }
    assert.equal(new Set(antes).size, 1);
  } finally { m.desmontar(); }
});

test("★★★ cada caso, con cada opción: acierto con «Correcto.»; cada distractor con SU texto; la página del control correcto siempre; coral solo en el error", async () => {
  const coral = /rgb\(231,\s*111,\s*81\)|#e76f51/i;
  for (const c of SIN_BARAJAR) {
    for (const elegida of c.opciones) {
      const m = await montar({ items: [c] });
      try {
        await tocar(opcion(m.caja, elegida));
        const ok = elegida === c.correcta;
        const panel = m.caja.querySelector("[data-panel]");
        assert.equal(panel.dataset.panel, ok ? "acierto" : "error");
        assert.deepEqual(retro(m.caja), ok ? [D.CORRECTO, c.acierto] : [c.distractores[elegida]], `${c.id} → ${elegida}`);
        assert.equal(panel.querySelector("[data-pagina]").textContent, D.paginaH2(D.controlH2(c.correcta).pagina), `${c.id} → ${elegida}: página`);
        assert.equal(coral.test(panel.getAttribute("style")), !ok);
        for (const id of c.opciones) assert.equal(coral.test(opcion(m.caja, id).getAttribute("style") ?? ""), !ok && id === elegida, `${c.id}: coral en ${id}`);
        for (const id of c.opciones) assert.equal(opcion(m.caja, id).disabled, true, `${c.id}: ${id} no se bloqueó`);
        if (!ok) assert.ok(opcion(m.caja, c.correcta).textContent.includes("era esta"));
      } finally { m.desmontar(); }
    }
  }
});

test("★★★ se baraja: los casos en cada intento, y las tres opciones de cada caso, siempre su control y sus dos distractores", () => {
  const al = D.sortearH2((xs) => [...xs].reverse());
  assert.deepEqual(al.map((c) => c.id), [...D.CASOS_H2].reverse().map((c) => c.id));
  for (const c of al) {
    assert.equal(new Set(c.opciones).size, 3);
    assert.deepEqual([...c.opciones].sort(), [c.correcta, ...Object.keys(c.distractores)].sort());
    assert.deepEqual(c.opciones, [c.correcta, ...Object.keys(c.distractores)].reverse(), "las opciones no pasaron por el barajador");
  }
  assert.match(VISTA, /useTanda\(\(\) => items \?\? sortearH2\(barajar\)\)/);
});

test("★★★ al terminar: el cierre y su pie, y onCompletar con el porcentaje y el detalle (el control elegido en el error)", async () => {
  const m = await montar();
  try {
    for (const [k, c] of SIN_BARAJAR.entries()) {
      await tocar(opcion(m.caja, k < 2 ? Object.keys(c.distractores)[0] : c.correcta));
      await tocar(siguiente(m.caja));
    }
    const [pct, , detalle] = m.completados[0];
    assert.equal(pct, (5 / 7) * 100);
    assert.equal(detalle.length, 7);
    assert.deepEqual(detalle[0], { item: "h2-1", ok: false, intentos: 1, respuesta: "c6", orden: 1 });
    assert.equal(m.caja.querySelector("[data-resumen]").textContent, D.resumenH2(5, 7));
    assert.equal(m.caja.querySelector("[data-cierre]").textContent, D.CIERRE_H2.texto);
    assert.equal(m.caja.querySelector("[data-pie-cierre]").textContent, D.CIERRE_H2.pie);
  } finally { m.desmontar(); }
});

test("★★★ en la página del juego hay exactamente UN [data-t4-h2]: la partida; la demo de «Así se juega» lleva el suyo propio", async () => {
  try { globalThis.localStorage.clear(); } catch { /* sin almacenamiento, sale igual */ }
  const caja = document.createElement("div");
  document.body.appendChild(caja);
  const raiz = createRoot(caja);
  await act(async () => {
    raiz.render(h(AuthContext.Provider, { value: { usuario: null, pedirCuenta: () => {} } },
      h(ContabilidadT4View, { modo: HACER, nodoInicial: D.H2_ID, onBack: () => {} })));
  });
  try {
    assert.ok(caja.querySelector("[data-asj-demo]"), "no salió el «Así se juega»: la prueba no está mirando el caso de las dos");
    assert.equal(caja.querySelectorAll("[data-t4-h2-demo]").length, 1, "la demo no lleva su propio atributo");
    assert.equal(caja.querySelectorAll("[data-t4-h2]").length, 1, "hay más de un [data-t4-h2] en la página");
    assert.ok(caja.querySelector("[data-t4-h2]").closest("[data-partida]"), "el [data-t4-h2] no es el de la partida");
  } finally { act(() => raiz.unmount()); caja.remove(); }
});

/* ═══════════ 3 · CAMINO, CATÁLOGO, PANEL Y «ASÍ SE JUEGA» ═══════════ */

test("★★★ en T4, justo después de H1: evaluativa, fácil, 10 FP; la vista lo abre y registra con el motor", () => {
  assert.deepEqual(clasificacionDe("contabilidad", TEMA_T4, D.H2_ID), { tipo: HACER, modalidad: "evaluativa", dificultad: "facil", fpBase: 10 });
  const ids = TEMA.actividades.map((x) => x.id);
  assert.equal(ids.indexOf(D.H2_ID), ids.indexOf("t4-entra-o-sale-de-caja") + 1);
  assert.deepEqual(actividadesDeTipo(TEMA, HACER).map((a) => a.id), ["t4-entra-o-sale-de-caja", D.H2_ID]);
  assert.deepEqual(JUEGOS_T4.map((j) => j.id).sort(), actividadesDeTipo(TEMA, HACER).map((a) => a.id).sort());
});

test("★★★ la 0201: del rango de la célula, un insert aditivo y repetible, con su comprobación y su deshacer escrito sin correr", () => {
  assert.match(MIGRACION, /\('t4-el-control-que-se-saltaron',\s*'contabilidad',\s*'efectivo-caja-menor-bancos',\s*'evaluativa',\s*'facil',\s*10,\s*1\)/);
  assert.match(MIGRACION, /on conflict \(activity_id\) do nothing;/);
  const sentencias = MIGRACION.split("\n").filter((l) => !l.trim().startsWith("--")).join("\n");
  assert.doesNotMatch(sentencias, /\b(alter|update|delete|drop|truncate)\b/i);
  assert.match(sentencias, /select activity_id[\s\S]*where activity_id = 't4-el-control-que-se-saltaron';\s*$/);
  assert.match(MIGRACION, /^--\s+delete from public\.actividad_catalogo where activity_id = 't4-el-control-que-se-saltaron';$/m);
  const dir = new URL("supabase/migrations/", RAIZ);
  const archivos = readdirSync(dir);
  assert.ok(archivos.includes("0001_profiles.sql"));
  assert.deepEqual(archivos.filter((f) => readFileSync(new URL(f, dir), "utf8").includes(D.H2_ID)), ["0201_t4_el_control_que_se_saltaron.sql"]);
  assert.deepEqual(archivos.filter((f) => f.startsWith("0201")), ["0201_t4_el_control_que_se_saltaron.sql"]);
});

test("★★★ el panel docente: todo item_id que guarda la partida tiene etiqueta, leída del caso, y la regla vive en el bloque de T4", async () => {
  const m = await montar();
  try {
    for (const c of SIN_BARAJAR) { await tocar(opcion(m.caja, c.correcta)); await tocar(siguiente(m.caja)); }
    for (const d of m.completados[0][2]) assert.equal(etiquetaDeItem(D.H2_ID, d.item), recortar(D.casoDeItemH2(d.item)), d.item);
  } finally { m.desmontar(); }
  const fuente = leer("src/docente/etiquetasItem.js");
  const bloque = fuente.slice(fuente.indexOf("── T4 «Efectivo, caja menor y bancos» (Célula D) ──"), fuente.indexOf("── Repaso del capítulo 5 (Célula E) ──"));
  assert.match(bloque, /"t4-el-control-que-se-saltaron": \(id\) => casoDeItemT4H2\(id\),/);
  for (const c of D.CASOS_H2) assert.ok(!fuente.includes(c.caso), `${c.id}: el caso está copiado en etiquetasItem.js`);
});

test("★★★ «Así se juega»: pasos, ejemplo y texto alternativo de Katsumi; el ejemplo no está en el banco; la mano toca el control 2", async () => {
  const asi = ASI_SE_JUEGA[D.H2_ID];
  assert.ok(asi);
  const sec = ASI.slice(ASI.indexOf("## H2 · "), ASI.indexOf("## H3 · "));
  assert.deepEqual([...sec.matchAll(new RegExp(`^  \\d\\. ${CITA}`, "gm"))].map((m) => m[1]), asi.pasos);
  assert.equal(D.EJEMPLO_H2.caso, sec.match(new RegExp(`\\*\\*Ejemplo \\(\`demo\`\\):\\*\\* ${CITA}`))[1]);
  assert.equal(asi.alt, sec.match(new RegExp(`\\*\\*Texto alternativo \\(\`alt\`\\):\\*\\* ${CITA}`))[1]);
  assert.match(sec, /La mano toca la opción del control 2/);
  assert.equal(D.EJEMPLO_H2.correcta, "c2");
  assert.ok(!D.CASOS_H2.some((c) => c.caso === D.EJEMPLO_H2.caso));
  assert.deepEqual(asi.guion.toques.map((x) => x.en), ['[data-opcion="c2"] button']);
  /* La demo, montada: el toque de la mano da el acierto, y no reporta nada. */
  const m = await montar({ modoDemo: true, items: [D.EJEMPLO_H2] });
  try {
    await tocar(m.caja.querySelector(asi.guion.toques[0].en));
    assert.equal(m.caja.querySelector("[data-panel]").dataset.panel, "acierto");
    assert.equal(m.completados.length, 0);
  } finally { m.desmontar(); }
});
