import { test } from "node:test";
import assert from "node:assert/strict";
import { readFileSync, readdirSync } from "node:fs";
import { JSDOM, VirtualConsole } from "jsdom";

/*
 * ═══════════════════════════════════════════════════════════════════════════
 * T4 · H4 «El arqueo de Rosa» (Célula D) · Hacer · evaluativa · medio · 25 FP.
 *
 *   · cada texto es el del paquete vigente de Katsumi, letra por letra: los
 *     seis enunciados, cada opción de cada pregunta con su devolución, el
 *     cierre de cada ronda y el de la actividad
 *   · las cifras: solo los gastos y el efectivo se escriben; la suma, la
 *     diferencia, el cheque y los distractores se calculan, y dan las del
 *     paquete. Ninguna respuesta es una cifra del libro
 *   · la pantalla de Hanayama (v1 + v1.1): el sobre de A2/A3 sin cheque;
 *     «Suman» al responder la 1 y la diferencia al responder la 2, con su
 *     sitio guardado desde el principio; «PREGUNTA n» sin total (PH4-1)
 *   · PH8-2: mientras se pregunta, nada de la respuesta está en el DOM
 *     (textContent y outerHTML, nunca innerText)
 *   · el sorteo (una de cada tipo), el camino, el motor, la 0203, el panel
 *     docente y el «Así se juega»
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

const D = await import("../../data/contabilidadT4H4.js");
const A2 = await import("../../data/contabilidadT4A2.js");
const { SUBJECTS, HACER, actividadesDeTipo, clasificacionDe } = await import("../../data/subjects.js");
const { default: ContabilidadT4View, ElArqueoDeRosa, JUEGOS_T4, TEMA_T4 } = await import("../../components/ContabilidadT4View.jsx");
const { AuthContext } = await import("../../auth/AuthProvider.jsx");
const { etiquetaDeItem, recortar } = await import("../../docente/etiquetasItem.js");
const { ASI_SE_JUEGA } = await import("../../data/asiSeJuega.js");
const { inflesz } = await import("../../herramientas/inflesz.js");
const { leer, CITA, PAQUETES, RAIZ, blobEnLaRamaFuente, blobDeLaCopia, RAMA_FUENTE } = await import("./t4-paquete.mjs");

const PAQ = leer(`${PAQUETES}d4-t4-h4-v1.md`);
const ASI = leer(`${PAQUETES}d4-t4-asi-se-juega-v1.md`);
const VISTA = leer("src/components/ContabilidadT4View.jsx");
const MIGRACION = leer("supabase/migrations/0203_t4_el_arqueo_de_rosa.sql");
const TEMA = SUBJECTS.contabilidad.topics.find((t) => t.id === TEMA_T4);
const num = (t) => Number(String(t).replace(/[$.]/g, ""));

/* ═══════════ EL PAQUETE, LEÍDO ═══════════ */

const BLOQUES = PAQ.slice(PAQ.indexOf("## Rondas"), PAQ.indexOf("## Cierre de la actividad")).split(/\n(?=### H4-\d)/).slice(1);
/* Cada opción: «texto» (correcta | error…): «devolución». El «(error: …)» puede llevar paréntesis dentro. */
const opcionesDe = (b) => [...b.matchAll(new RegExp(`^  - ${CITA} \\((correcta|error.*?)\\): ${CITA}(?: \\(|$)`, "gm"))].map((m) => ({ texto: m[1], correcta: m[2] === "correcta", devolucion: m[3] }));
const RONDAS_PAQ = BLOQUES.map((b) => ({
  titulo: b.match(/^### (H4-\d) · (\w+) · (.+)$/m),
  subtema: b.match(/^- \*\*Subtema:\*\* (.+)$/m)[1].trim(),
  enunciado: b.match(new RegExp(`^- \\*\\*Enunciado:\\*\\* ${CITA}`, "m"))[1],
  datos: b.match(/^- \*\*Datos construidos:\*\* (.+)$/m)[1],
  preguntas: b.split(/\n(?=- \*\*Pregunta \d)/).slice(1).filter((p) => !/no se hace/.test(p.split("\n")[0])).map((p) => ({ cabecera: p.split("\n")[0], opciones: opcionesDe(p) })),
  cierre: b.match(new RegExp(`^- \\*\\*Cierre de la ronda, siempre visible:\\*\\* ${CITA}`, "m"))[1],
  pie: b.match(new RegExp(`^- Pie: ${CITA}`, "m"))[1],
}));

/* ═══════════ 1 · EL TEXTO, CONTRA EL PAQUETE ═══════════ */

test("★★★ la copia del paquete de H4 es la de la punta de la rama de Katsumi (si este clon la tiene)", (t) => {
  if (!blobEnLaRamaFuente("d4-t4-h4-v1.md")) { t.skip(`este clon no tiene ${RAMA_FUENTE}`); return; }
  assert.equal(blobDeLaCopia("d4-t4-h4-v1.md"), blobEnLaRamaFuente("d4-t4-h4-v1.md"));
  /* El paquete dice que no tiene archivos de cambios: que no aparezca ninguno sin mirarlo. */
  assert.deepEqual(readdirSync(new URL(PAQUETES, RAIZ)).filter((f) => /^d4-t4-.*h4.*-cambios\.md$/.test(f)), []);
});

test("★★★ ficha: id, nombre, objetivo, consigna, subtemas y las tres preguntas son los del paquete", () => {
  assert.match(PAQ, /\*\*Este archivo es la versión vigente\.\*\* No tiene archivos de cambios\./);
  assert.match(PAQ, new RegExp(`\\| id \\| \`${D.H4_ID}\` \\|`));
  assert.ok(PAQ.startsWith(`**T4 · H4 «${D.H4.nombre}»`));
  assert.match(PAQ, /\| Dificultad y modalidad \| Medio · evaluativa · 25 FP/);
  assert.ok(PAQ.includes(`«${D.H4.objetivo}»`));
  const consigna = PAQ.slice(PAQ.indexOf("## Consigna"), PAQ.indexOf("## Cómo se juega"));
  assert.deepEqual([...consigna.matchAll(new RegExp(`^- ${CITA}`, "gm"))].map((m) => m[1]), D.H4.consigna);
  assert.equal(PAQ.match(/\| Subtemas \| (.+) \|/)[1], D.SUBTEMAS_H4.join(" · "));
  const como = PAQ.slice(PAQ.indexOf("## Cómo se juega"), PAQ.indexOf("## Rondas"));
  assert.deepEqual([...como.matchAll(/^\d\. \*\*(.+?)\*\*/gm)].map((m) => m[1]), Object.values(D.PREGUNTAS_H4).map((p, k) => (k === 2 ? p : p)).map((p) => p));
  assert.match(como, /Cuadra \/ Hay un sobrante de caja menor \/ Hay un faltante de caja menor/);
  assert.deepEqual(Object.values(D.OPCIONES_ARQUEO), ["Cuadra", "Hay un sobrante de caja menor", "Hay un faltante de caja menor"]);
});

test("★★★ las seis rondas: enunciado, subtema, cada opción de cada pregunta con su devolución, cierre y pie, letra por letra", () => {
  assert.equal(RONDAS_PAQ.length, 6, "no se leyeron las seis rondas");
  assert.deepEqual(RONDAS_PAQ.map((r) => r.preguntas.length), [2, 3, 3, 3, 3, 2], "no se leyeron las preguntas de cada ronda");
  assert.ok(RONDAS_PAQ.every((r) => r.preguntas.every((p) => p.opciones.length === 3)), "una pregunta del paquete sin sus tres opciones");
  D.RONDAS_H4.forEach((r, k) => {
    const p = RONDAS_PAQ[k];
    assert.equal(r.id, p.titulo[1].toLowerCase(), `${r.id}: el orden de las rondas`);
    assert.equal(r.mes, p.titulo[2].toLowerCase());
    assert.equal(r.enunciado, p.enunciado, `${r.id}: enunciado`);
    assert.equal(r.subtema, p.subtema, `${r.id}: subtema`);
    assert.equal(r.cierre, p.cierre, `${r.id}: cierre`);
    assert.equal(r.pie, p.pie, `${r.id}: pie`);
    assert.equal(r.preguntas.length, p.preguntas.length, `${r.id}: número de preguntas`);
    r.preguntas.forEach((q, j) => {
      const mias = Object.keys(q.opciones).map((id) => ({ texto: q.texto(id), correcta: id === q.correcta, devolucion: q.opciones[id] }));
      assert.deepEqual([...mias].sort((a, b) => a.texto.localeCompare(b.texto)), [...p.preguntas[j].opciones].sort((a, b) => a.texto.localeCompare(b.texto)), `${r.id} · ${q.id}`);
      assert.ok(p.preguntas[j].cabecera.includes(q.pregunta.replace(" del reembolso", "")), `${r.id} · ${q.id}: la pregunta`);
    });
  });
});

test("★★★ las cifras: solo los gastos y el efectivo se escriben; lo demás se calcula y da los «Datos construidos» del paquete", () => {
  D.RONDAS_H4.forEach((r, k) => {
    const datos = Object.fromEntries([...RONDAS_PAQ[k].datos.matchAll(/(gastos|efectivo|suma|diferencia|cheque) ([\d.]+)/g)].map((m) => [m[1], num(m[2])]));
    assert.equal(r.gastos, datos.gastos); assert.equal(r.efectivo, datos.efectivo);
    assert.equal(r.suma, datos.suma, `${r.id}: suma`);
    assert.equal(r.cheque, datos.cheque, `${r.id}: cheque`);
    if (r.tipo !== D.CUADRA) assert.equal(r.diferencia, datos.diferencia, `${r.id}: diferencia`);
    /* En las seis, efectivo + cheque = fondo. */
    assert.equal(r.efectivo + r.cheque, A2.FONDO, `${r.id}: efectivo + cheque no da el fondo`);
  });
  assert.equal(D.RONDAS_H4[0].fondo, A2.FONDO);
  const fuente = leer("src/data/contabilidadT4H4.js");
  assert.match(fuente, /import \{ FONDO \} from "\.\/contabilidadT4A2\.js";/);
  /* Lo calculado no puede estar escrito; solo los datos (gastos y efectivo). En la ronda que cuadra, el cheque ES lo gastado: es un dato. */
  for (const r of D.RONDAS_H4) for (const c of [r.suma, r.cheque, r.diferencia].filter((x) => x && x !== A2.FONDO && x !== r.gastos && x !== r.efectivo)) {
    assert.ok(!new RegExp(`\\b${String(c).replace(/(\d)(?=(\d{3})+$)/g, "$1_?")}\\b`).test(fuente), `${r.id}: ${c} está escrito a mano`);
  }
  /* La regla de Yujiro: ninguna respuesta es una cifra del libro, y las tres situaciones del libro no aparecen. */
  const LIBRO = [2_100, 476_000, 6_700, 484_800, 21_900, 478_100, 24_000, 15_200, 502_100, 493_300];
  const todas = D.RONDAS_H4.flatMap((r) => r.preguntas.flatMap((q) => Object.keys(q.opciones).map((id) => num(q.texto(id)))).filter((n) => !Number.isNaN(n)));
  for (const c of todas) assert.ok(!LIBRO.includes(c), `una opción usa ${c}, que es del libro`);
  const textos = D.RONDAS_H4.flatMap((r) => [r.enunciado, r.cierre, ...r.preguntas.flatMap((q) => Object.values(q.opciones))]).join("\n");
  for (const c of LIBRO) assert.ok(!textos.includes(`$${String(c).replace(/\B(?=(\d{3})+(?!\d))/g, ".")}`), `un texto usa $${c}, que es del libro`);
  /* Las respuestas correctas nunca son el fondo. */
  for (const r of D.RONDAS_H4) for (const q of r.preguntas) if (q.id !== "arqueo") assert.notEqual(num(q.texto(q.correcta)), A2.FONDO);
});

test("★★ el cierre de la actividad y su pie; INFLESZ de todo texto de 10 palabras o más, 65 o más", () => {
  const cierre = PAQ.slice(PAQ.indexOf("## Cierre de la actividad"), PAQ.indexOf("## Reparto de rondas"));
  assert.deepEqual([...cierre.matchAll(new RegExp(`^- ${CITA} \\(`, "gm"))].map((m) => m[1]), D.CIERRE_H4.textos);
  assert.equal(D.CIERRE_H4.pie, cierre.match(new RegExp(`^- Pie: ${CITA}`, "m"))[1]);
  const textos = [D.H4.objetivo, ...D.H4.consigna, ...D.RONDAS_H4.flatMap((r) => [r.enunciado, r.cierre, ...r.preguntas.flatMap((q) => Object.values(q.opciones))]), ...D.CIERRE_H4.textos];
  const medidos = textos.map((t) => ({ t, r: inflesz(t) })).filter((x) => x.r.aplica);
  assert.ok(medidos.length >= 60);
  assert.deepEqual(medidos.filter((x) => !x.r.cumple).map((x) => `${x.r.valor} · ${x.t}`), []);
});

/* ═══════════ 2 · LO QUE SE VE ═══════════ */

const Marco = ({ children }) => h("div", { "data-marco": true }, children);
const [CUADRA_1, SOBRANTE_2, FALTANTE_3] = D.RONDAS_H4;
const montar = async (props = {}) => {
  const caja = document.createElement("div");
  document.body.appendChild(caja);
  const raiz = createRoot(caja);
  const completados = [];
  await act(async () => { raiz.render(h(ElArqueoDeRosa, { Marco, items: [CUADRA_1, SOBRANTE_2, FALTANTE_3], onCompletar: (...a) => completados.push(a), ...props })); });
  return { caja, completados, desmontar: () => { act(() => raiz.unmount()); caja.remove(); } };
};
const tocar = async (el) => {
  assert.ok(el, "no está el elemento que se quería tocar");
  await act(async () => { el.dispatchEvent(new w.MouseEvent("click", { bubbles: true })); });
};
const opcion = (caja, id) => caja.querySelector(`[data-opcion="${id}"] button`);
const seguir = (caja) => [...caja.querySelectorAll("button")].find((b) => Object.values(D.BOTON_H4).includes(b.textContent.trim()) && b.textContent.trim() !== D.BOTON_H4.otraVez);
const sobre = (caja) => caja.querySelector('[data-sobre-h4] [data-figura="sobre"]');
const montoDe = (f, id) => f.querySelector(`[data-fila="${id}"] .t4sb-monto`)?.textContent ?? null;
const huecos = (f) => [...f.querySelectorAll("[data-hueco]")].map((x) => x.dataset.hueco).sort();
const encabezado = (caja) => caja.querySelector("[data-encabezado-pregunta]").textContent;

test("★★★ PH4-1: antes de responder la pregunta 1, el encabezado es el mismo en las tres clases de ronda: «PREGUNTA 1», sin total", async () => {
  const vistos = [];
  for (const r of [CUADRA_1, SOBRANTE_2, FALTANTE_3]) {
    const m = await montar({ items: [r] });
    try { vistos.push(encabezado(m.caja)); } finally { m.desmontar(); }
  }
  assert.deepEqual(vistos, ["PREGUNTA 1", "PREGUNTA 1", "PREGUNTA 1"]);
  assert.doesNotMatch(VISTA.slice(VISTA.indexOf("export function ElArqueoDeRosa")), /DE \$\{|de \$\{ronda\.preguntas\.length|preguntas\.length\}/, "el encabezado lleva un total");
  /* Y la numeración cuenta lo que se ve: en la ronda que cuadra, la del cheque es la «PREGUNTA 2». */
  const m = await montar({ items: [CUADRA_1] });
  try {
    await tocar(opcion(m.caja, D.CUADRA));
    await tocar(seguir(m.caja));
    assert.equal(encabezado(m.caja), "PREGUNTA 2");
    assert.equal(m.caja.querySelector("[data-pregunta]").textContent, D.PREGUNTAS_H4.cheque);
  } finally { m.desmontar(); }
});

test("★★★ el sobre: el MISMO de A2/A3, sin cheque; fondo, billetes y soportes siempre; «Suman» al responder la 1 y la diferencia al responder la 2", async () => {
  const m = await montar({ items: [FALTANTE_3] });
  try {
    let f = sobre(m.caja);
    assert.ok(f, "no está el sobre");
    assert.equal(f.querySelector("[data-cheque], [data-hueco='cheque'], [data-libro]"), null, "el sobre de H4 va sin cheque ni libro");
    assert.deepEqual([montoDe(f, "fondo"), montoDe(f, "billetes"), montoDe(f, "soportes")], ["500.000", "80.150", "412.650"]);
    assert.deepEqual(huecos(f), ["diferencia", "suman"]);
    const alto0 = [...f.querySelector("[data-sobre]").children].length;
    await tocar(opcion(m.caja, D.SOBRANTE)); /* falla la 1 */
    f = sobre(m.caja);
    assert.equal(montoDe(f, "suman"), "492.800", "«Suman» no aparece al responder la 1, aunque falle");
    assert.deepEqual(huecos(f), ["diferencia"]);
    await tocar(seguir(m.caja));
    await tocar(opcion(m.caja, "diferencia"));
    f = sobre(m.caja);
    assert.equal(montoDe(f, "diferencia"), "7.200");
    assert.equal(f.querySelector("[data-fila='diferencia'] .t4sb-nom").textContent, "Faltante de caja menor");
    assert.deepEqual(huecos(f), []);
    /* Las filas guardan su sitio: el sobre tiene las mismas filas al principio y al final. */
    assert.equal([...f.querySelector("[data-sobre]").children].length, alto0);
    /* Sin coral en el sobre. */
    assert.doesNotMatch(f.outerHTML, /e76f51|231,\s*111,\s*81/i);
  } finally { m.desmontar(); }
  assert.match(VISTA, /<SobreCajaMenor estado=\{`\$\{ronda\.id\}-\$\{respondidas\}`\} s=\{estadoSobreH4\(ronda, respondidas\)\}/);
});

test("★★★ en la ronda que cuadra, «Suman 500.000» y «Diferencia 0» aparecen con la pregunta 1, no antes", async () => {
  const m = await montar({ items: [CUADRA_1] });
  try {
    let f = sobre(m.caja);
    assert.deepEqual(huecos(f), ["diferencia", "suman"]);
    assert.ok(!f.outerHTML.includes("Diferencia"));
    await tocar(opcion(m.caja, D.CUADRA));
    f = sobre(m.caja);
    assert.deepEqual([montoDe(f, "suman"), montoDe(f, "diferencia")], ["500.000", "0"]);
    assert.equal(f.querySelector("[data-fila='diferencia'] .t4sb-nom").textContent, "Diferencia");
  } finally { m.desmontar(); }
});

test("★★★ PH8-2: mientras se pregunta, nada de la respuesta está en el DOM (textContent y outerHTML, no innerText)", async () => {
  for (const r of [CUADRA_1, SOBRANTE_2, FALTANTE_3]) {
    const m = await montar({ items: [r] });
    try {
      for (const q of r.preguntas) {
        const dom = `${m.caja.textContent}\n${m.caja.outerHTML}`;
        for (const x of [...Object.values(q.opciones), r.cierre, D.CORRECTO, D.INCORRECTO]) assert.ok(!dom.includes(x), `${r.id} · ${q.id}: el DOM ya trae «${x.slice(0, 50)}»`);
        assert.equal(m.caja.querySelectorAll("[data-panel], [data-texto-retro], [data-cierre-ronda]").length, 0, `${r.id} · ${q.id}: hay devolución montada`);
        assert.doesNotMatch(m.caja.outerHTML, /data-correct|data-respuesta|aria-(?:checked|selected)="true"/);
        /* El sobre no adelanta lo que la pregunta pide. */
        const f = sobre(m.caja);
        if (q.id === "arqueo") assert.ok(!f.outerHTML.includes(r.suma === A2.FONDO ? "Diferencia" : `>${String(r.suma).replace(/\B(?=(\d{3})+(?!\d))/g, ".")}<`), `${r.id}: el sobre ya trae la suma`);
        if (q.id === "diferencia") assert.ok(!f.querySelector("[data-fila='diferencia']"), `${r.id}: el sobre ya trae la diferencia`);
        await tocar(opcion(m.caja, q.correcta));
        await tocar(seguir(m.caja));
      }
    } finally { m.desmontar(); }
  }
});

test("★★★ cada pregunta, con cada opción: «Correcto.» o «Incorrecto.» con SU devolución; «era esta» si falla; coral solo en el error; tras la última, el cierre de la ronda", async () => {
  const coral = /rgb\(231,\s*111,\s*81\)|#e76f51/i;
  for (const r of [CUADRA_1, SOBRANTE_2, FALTANTE_3]) {
    for (const [j, q] of r.preguntas.entries()) {
      for (const elegida of Object.keys(q.opciones)) {
        const m = await montar({ items: [r] });
        try {
          for (const prev of r.preguntas.slice(0, j)) { await tocar(opcion(m.caja, prev.correcta)); await tocar(seguir(m.caja)); }
          await tocar(opcion(m.caja, elegida));
          const ok = elegida === q.correcta;
          const panel = m.caja.querySelector("[data-panel]");
          assert.equal(panel.dataset.panel, ok ? "acierto" : "error");
          assert.equal(panel.querySelector("[data-palabra]").textContent, ok ? D.CORRECTO : D.INCORRECTO);
          assert.equal(panel.querySelector("[data-texto-retro]").textContent, q.opciones[elegida], `${r.id} · ${q.id} → ${elegida}`);
          assert.equal(coral.test(panel.getAttribute("style")), !ok);
          if (!ok) assert.ok(opcion(m.caja, q.correcta).textContent.includes("era esta"), `${r.id} · ${q.id}: no se enseña la correcta`);
          for (const id of Object.keys(q.opciones)) assert.equal(opcion(m.caja, id).disabled, true, "un solo toque");
          const ultima = j === r.preguntas.length - 1;
          assert.equal(m.caja.querySelector("[data-cierre-ronda]")?.textContent ?? null, ultima ? r.cierre : null, `${r.id} · ${q.id}: cierre de la ronda`);
          if (ultima) assert.ok(panel.compareDocumentPosition(m.caja.querySelector("[data-cierre-ronda]")) & w.Node.DOCUMENT_POSITION_FOLLOWING, "el cierre va después de la devolución");
        } finally { m.desmontar(); }
      }
    }
  }
});

test("★★★ si falla una pregunta, las demás se juegan igual; al terminar, el cierre y onCompletar con el porcentaje de preguntas y el detalle", async () => {
  const m = await montar();
  try {
    const plan = [[D.SOBRANTE, "cheque"], [D.SOBRANTE, "queda", "cheque"], [D.FALTANTE, "diferencia", "gastos"]];
    for (const [k, r] of [CUADRA_1, SOBRANTE_2, FALTANTE_3].entries()) {
      for (const elegida of plan[k]) { await tocar(opcion(m.caja, elegida)); await tocar(seguir(m.caja)); }
      void r;
    }
    const [pct, , detalle] = m.completados[0];
    /* 8 preguntas: 2 + 3 + 3. Bien: la 3 de la ronda 1, la 1 y la 3 de la 2, la 1 y la 2 de la 3. */
    assert.equal(detalle.length, 8);
    assert.equal(pct, (5 / 8) * 100);
    assert.deepEqual(detalle[0], { item: "h4-1:arqueo", ok: false, intentos: 1, respuesta: D.SOBRANTE, orden: 1 });
    assert.equal(m.caja.querySelector("[data-resumen]").textContent, D.resumenH4(5, 8));
    assert.deepEqual([...m.caja.querySelectorAll("[data-cierre]")].map((p) => p.textContent), D.CIERRE_H4.textos);
    assert.equal(m.caja.querySelector("[data-pie-cierre]").textContent, D.CIERRE_H4.pie);
  } finally { m.desmontar(); }
});

test("★★★ el sorteo: tres rondas, una de cada tipo, en orden barajado; las opciones de cada pregunta también se barajan", () => {
  const al = D.sortearH4((xs) => [...xs].reverse(), () => 0.99);
  assert.deepEqual(al.map((r) => r.tipo), [D.FALTANTE, D.SOBRANTE, D.CUADRA]);
  assert.deepEqual(al.map((r) => r.id), ["h4-5", "h4-4", "h4-6"]);
  for (const r of al) for (const q of r.preguntas) assert.deepEqual(q.orden, Object.keys(q.opciones).reverse(), "las opciones no pasaron por el barajador");
  assert.deepEqual(D.sortearH4((xs) => xs, () => 0).map((r) => r.id), ["h4-1", "h4-2", "h4-3"]);
  assert.match(VISTA, /useTanda\(\(\) => items \?\? sortearH4\(barajar\)\)/);
  /* El reparto del paquete: dos de cada tipo. */
  const reparto = PAQ.slice(PAQ.indexOf("## Reparto de rondas"), PAQ.indexOf("## Erratas"));
  for (const [tipo, ids] of [["Cuadra", ["h4-1", "h4-6"]], ["Sobrante de caja menor", ["h4-2", "h4-4"]], ["Faltante de caja menor", ["h4-3", "h4-5"]]]) {
    assert.match(reparto, new RegExp(`\\| ${tipo} \\| ${ids.map((x) => x.toUpperCase()).join(", ")} \\|`));
    assert.deepEqual(D.RONDAS_H4.filter((r) => r.subtema === D.SUBTEMAS_H4[["Cuadra", "Sobrante de caja menor", "Faltante de caja menor"].indexOf(tipo)]).map((r) => r.id), ids);
  }
});

test("★★★ en la página del juego hay exactamente UN [data-t4-h4]: la partida; la demo de «Así se juega» lleva el suyo propio", async () => {
  try { globalThis.localStorage.clear(); } catch { /* sin almacenamiento, sale igual */ }
  const caja = document.createElement("div");
  document.body.appendChild(caja);
  const raiz = createRoot(caja);
  await act(async () => {
    raiz.render(h(AuthContext.Provider, { value: { usuario: null, pedirCuenta: () => {} } },
      h(ContabilidadT4View, { modo: HACER, nodoInicial: D.H4_ID, onBack: () => {} })));
  });
  try {
    assert.ok(caja.querySelector("[data-asj-demo]"), "no salió el «Así se juega»");
    assert.equal(caja.querySelectorAll("[data-t4-h4-demo]").length, 1, "la demo no lleva su propio atributo");
    assert.equal(caja.querySelectorAll("[data-t4-h4]").length, 1, "hay más de un [data-t4-h4] en la página");
    assert.ok(caja.querySelector("[data-t4-h4]").closest("[data-partida]"), "el [data-t4-h4] no es el de la partida");
  } finally { act(() => raiz.unmount()); caja.remove(); }
});

/* ═══════════ 3 · CAMINO, CATÁLOGO, PANEL Y «ASÍ SE JUEGA» ═══════════ */

test("★★★ en T4, justo después de A3: evaluativa, medio, 25 FP; la vista lo abre", () => {
  assert.deepEqual(clasificacionDe("contabilidad", TEMA_T4, D.H4_ID), { tipo: HACER, modalidad: "evaluativa", dificultad: "medio", fpBase: 25 });
  const ids = TEMA.actividades.map((x) => x.id);
  assert.equal(ids.indexOf(D.H4_ID), ids.indexOf("t4-a3-el-arqueo") + 1);
  assert.deepEqual(JUEGOS_T4.map((j) => j.id).sort(), actividadesDeTipo(TEMA, HACER).map((a) => a.id).sort());
  assert.equal(JUEGOS_T4.find((j) => j.id === D.H4_ID).Mecanica, ElArqueoDeRosa);
});

test("★★★ la 0203: del rango de la célula, un insert aditivo y repetible, con su comprobación y su deshacer escrito sin correr", () => {
  assert.match(MIGRACION, /\('t4-el-arqueo-de-rosa',\s*'contabilidad',\s*'efectivo-caja-menor-bancos',\s*'evaluativa',\s*'medio',\s*25,\s*1\)/);
  assert.match(MIGRACION, /on conflict \(activity_id\) do nothing;/);
  const sentencias = MIGRACION.split("\n").filter((l) => !l.trim().startsWith("--")).join("\n");
  assert.doesNotMatch(sentencias, /\b(alter|update|delete|drop|truncate)\b/i);
  assert.match(sentencias, /select activity_id[\s\S]*where activity_id = 't4-el-arqueo-de-rosa';\s*$/);
  assert.match(MIGRACION, /^--\s+delete from public\.actividad_catalogo where activity_id = 't4-el-arqueo-de-rosa';$/m);
  assert.match(MIGRACION, /^-- 0203 — CONTABILIDAD, T4: H4 «EL ARQUEO DE ROSA» \(Célula D\)$/m);
  const dir = new URL("supabase/migrations/", RAIZ);
  const archivos = readdirSync(dir);
  assert.ok(archivos.includes("0001_profiles.sql"));
  assert.deepEqual(archivos.filter((f) => readFileSync(new URL(f, dir), "utf8").includes(D.H4_ID)), ["0203_t4_el_arqueo_de_rosa.sql"]);
  assert.deepEqual(archivos.filter((f) => f.startsWith("0203")), ["0203_t4_el_arqueo_de_rosa.sql"]);
});

test("★★★ el panel docente: todo item_id que guarda la partida tiene etiqueta (mes y pregunta), y la regla vive en el bloque de T4", async () => {
  const m = await montar({ items: D.RONDAS_H4 });
  try {
    for (const r of D.RONDAS_H4) for (const q of r.preguntas) { await tocar(opcion(m.caja, q.correcta)); await tocar(seguir(m.caja)); }
    const detalle = m.completados[0][2];
    assert.equal(detalle.length, 16);
    for (const d of detalle) {
      const [rid, pid] = d.item.split(":");
      const r = D.RONDAS_H4.find((x) => x.id === rid);
      assert.equal(etiquetaDeItem(D.H4_ID, d.item), recortar(`${r.mes[0].toUpperCase()}${r.mes.slice(1)} · ${r.preguntas.find((q) => q.id === pid).pregunta}`), d.item);
    }
  } finally { m.desmontar(); }
  const fuente = leer("src/docente/etiquetasItem.js");
  const bloque = fuente.slice(fuente.indexOf("── T4 «Efectivo, caja menor y bancos» (Célula D) ──"), fuente.indexOf("── Repaso del capítulo 5 (Célula E) ──"));
  assert.match(bloque, /"t4-el-arqueo-de-rosa": \(id\) => preguntaDeItemT4H4\(id\),/);
});

test("★★★ «Así se juega»: pasos, ejemplo y texto alternativo de Katsumi; el ejemplo cuadra y no es de las seis; la mano responde, sigue y toca el cheque", async () => {
  const asi = ASI_SE_JUEGA[D.H4_ID];
  assert.ok(asi);
  const sec = ASI.slice(ASI.indexOf("## H4 · "), ASI.indexOf("## H5 · "));
  assert.deepEqual([...sec.matchAll(new RegExp(`^  \\d\\. ${CITA}`, "gm"))].map((m) => m[1]), asi.pasos);
  assert.equal(D.EJEMPLO_H4.enunciado, sec.match(new RegExp(`\\*\\*Ejemplo \\(\`demo\`\\):\\*\\* ${CITA}`))[1]);
  assert.equal(asi.alt, sec.match(new RegExp(`\\*\\*Texto alternativo \\(\`alt\`\\):\\*\\* ${CITA}`))[1]);
  assert.match(sec, /La mano responde «Cuadra», se salta la pregunta 2 porque no hay diferencia, y en la 3 toca «\$420\.000»\./);
  assert.equal(D.EJEMPLO_H4.tipo, D.CUADRA);
  assert.deepEqual([D.EJEMPLO_H4.gastos, D.EJEMPLO_H4.efectivo, D.EJEMPLO_H4.cheque], [420_000, 80_000, 420_000]);
  assert.ok(!D.RONDAS_H4.some((r) => r.gastos === D.EJEMPLO_H4.gastos || r.efectivo === D.EJEMPLO_H4.efectivo));
  const m = await montar({ modoDemo: true, items: [D.EJEMPLO_H4] });
  try {
    for (const toque of asi.guion.toques) {
      const el = toque.en ? m.caja.querySelector(toque.en) : [...m.caja.querySelectorAll("button")].find((b) => b.textContent.trim() === toque.texto);
      assert.ok(el, `el guion no encuentra «${toque.en ?? toque.texto}»`);
      await tocar(el);
    }
    assert.equal(m.caja.querySelector("[data-panel]").dataset.panel, "acierto");
    assert.equal(m.caja.querySelector("[data-opcion='cheque'] button").textContent.trim().startsWith("$420.000"), true);
    assert.equal(m.completados.length, 0);
  } finally { m.desmontar(); }
});
