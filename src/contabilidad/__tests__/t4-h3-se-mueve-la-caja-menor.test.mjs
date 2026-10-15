import { test } from "node:test";
import assert from "node:assert/strict";
import { readFileSync, readdirSync } from "node:fs";
import { JSDOM, VirtualConsole } from "jsdom";

/*
 * ═══════════════════════════════════════════════════════════════════════════
 * T4 · H3 «¿Se mueve la caja menor?» (Célula D) · Hacer · evaluativa · medio · 25 FP.
 *
 *   · cada texto es el del paquete vigente de Katsumi, letra por letra: la
 *     serie 1 (con la v2 dentro) y la serie 2; los errores, en su orden
 *   · las 11 combinaciones equivocadas de cada operación tienen mensaje, y
 *     sale el PRIMERO de la lista que aplique
 *   · las cifras que salen de restar se calculan; ninguna es de A2
 *   · la pantalla de Hanayama: las cuatro cuentas siempre, en su orden;
 *     «Comprobar» con dos cuentas y una a cada lado; un intento; un mensaje;
 *     el asiento completo solo después; coral solo en el error
 *   · PH8-2: mientras se pregunta, nada de la respuesta está en el DOM
 *     (textContent y outerHTML, nunca innerText)
 *   · el camino, el motor, la 0202, el panel docente y el «Así se juega»
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

const D = await import("../../data/contabilidadT4H3.js");
const { SUBJECTS, HACER, actividadesDeTipo, clasificacionDe } = await import("../../data/subjects.js");
const { default: ContabilidadT4View, SeMueveLaCajaMenor, JUEGOS_T4, TEMA_T4 } = await import("../../components/ContabilidadT4View.jsx");
const { AuthContext } = await import("../../auth/AuthProvider.jsx");
const { etiquetaDeItem, recortar } = await import("../../docente/etiquetasItem.js");
const { ASI_SE_JUEGA } = await import("../../data/asiSeJuega.js");
const { inflesz } = await import("../../herramientas/inflesz.js");
const { leer, CITA, PAQUETES, RAIZ, blobEnLaRamaFuente, blobDeLaCopia, RAMA_FUENTE } = await import("./t4-paquete.mjs");

const S1 = leer(`${PAQUETES}d4-t4-h3-v1.md`);
const S2 = leer(`${PAQUETES}d4-t4-h3-serie2.md`);
const V2 = leer(`${PAQUETES}d4-t4-h3-h5-a4-v2-cambios.md`);
const ASI = leer(`${PAQUETES}d4-t4-asi-se-juega-v1.md`);
const VISTA = leer("src/components/ContabilidadT4View.jsx");
const MIGRACION = leer("supabase/migrations/0202_t4_se_mueve_la_caja_menor.sql");
const TEMA = SUBJECTS.contabilidad.topics.find((t) => t.id === TEMA_T4);
const TODAS = D.SERIES_H3.flat();

/* ═══════════ EL PAQUETE, LEÍDO ═══════════ */

const cita = (b, rotulo) => b.match(new RegExp(`^- \\*\\*${rotulo}:\\*\\* (?:[^«\\n]*?)${CITA}`, "m"))?.[1] ?? null;
const operacionesDe = (md, marca) => md.slice(md.indexOf("## Operaciones"), md.indexOf("## Cierre")).split(new RegExp(`\\n(?=### ${marca}-\\d)`)).slice(1);
const SERIE1 = operacionesDe(S1, "H3").map((b) => ({
  enunciado: cita(b, "Enunciado"),
  acierto: cita(b, "Acierto"),
  subtema: b.match(/^- \*\*Subtema:\*\* (.+)$/m)[1].trim(),
  errores: [...b.matchAll(new RegExp(`^  \\d\\. \\*[^*]+\\*[^«\\n]*: ${CITA}`, "gm"))].map((m) => m[1]),
}));
const SERIE2 = operacionesDe(S2, "H3s2").map((b) => ({
  enunciado: cita(b, "Enunciado"),
  acierto: cita(b, "Acierto"),
  subtema: b.match(/^- \*\*Subtema:\*\* (.+)$/m)[1].trim(),
  primerError: b.match(new RegExp(`^  1\\. \\*[^*]+\\*[^«\\n]*: ${CITA}`, "m"))?.[1] ?? null,
}));
const textosDe = (op) => op.errores.map((e) => e.texto);

/* ═══════════ 1 · EL TEXTO, CONTRA EL PAQUETE ═══════════ */

test("★★★ la copia de los paquetes de H3 es la de la punta de la rama de Katsumi (si este clon la tiene)", (t) => {
  if (!blobEnLaRamaFuente("d4-t4-h3-v1.md")) { t.skip(`este clon no tiene ${RAMA_FUENTE}`); return; }
  for (const f of ["d4-t4-h3-v1.md", "d4-t4-h3-serie2.md", "d4-t4-h3-h5-a4-v2-cambios.md", "d4-t4-asi-se-juega-v1.md"]) {
    assert.equal(blobDeLaCopia(f), blobEnLaRamaFuente(f), `${f}: la copia no es la última versión aprobada`);
  }
});

test("★★★ ficha: id, nombre, objetivo, consigna, subtemas y las cuatro cuentas son los del paquete", () => {
  assert.match(S1, /\*\*Este archivo es la versión vigente\*\*/);
  assert.match(S2, /\*\*Este archivo es la versión vigente de la serie 2\.\*\*/);
  assert.match(S1, new RegExp(`\\| id \\| \`${D.H3_ID}\` \\|`));
  assert.ok(S1.startsWith(`**T4 · H3 «${D.H3.nombre}»`));
  assert.match(S1, /\| Dificultad y modalidad \| Medio · evaluativa · 25 FP/);
  assert.ok(S1.includes(`«${D.H3.objetivo}»`));
  const consigna = S1.slice(S1.indexOf("## Consigna"), S1.indexOf("## Cuentas disponibles"));
  assert.deepEqual([...consigna.matchAll(new RegExp(`^- ${CITA}`, "gm"))].map((m) => m[1]), D.H3.consigna);
  assert.equal(S1.match(/\| Subtemas \| (.+) \|/)[1], D.SUBTEMAS_H3.join(" · "));
  const cuentas = S1.slice(S1.indexOf("## Cuentas disponibles"), S1.indexOf("## Operaciones"));
  assert.deepEqual([...cuentas.split("\n").find((l) => l.startsWith("«")).matchAll(new RegExp(CITA, "g"))].map((m) => m[1]), D.CUENTAS_H3);
});

test("★★★ serie 1: enunciado, acierto, subtema y cada error de las cuatro operaciones, letra por letra y en el orden del paquete", () => {
  assert.equal(SERIE1.length, 4, "no se leyeron las cuatro operaciones de la serie 1");
  assert.deepEqual(SERIE1.map((o) => o.errores.length), [5, 6, 5, 5], "no se leyeron los errores de la serie 1");
  D.SERIE_1.forEach((op, k) => {
    assert.equal(op.enunciado, SERIE1[k].enunciado, `${op.id}: enunciado`);
    assert.equal(op.acierto, SERIE1[k].acierto, `${op.id}: acierto`);
    assert.equal(op.subtema, SERIE1[k].subtema, `${op.id}: subtema`);
    assert.deepEqual(textosDe(op), SERIE1[k].errores, `${op.id}: los errores no son los del paquete, en su orden`);
  });
});

test("★★★ serie 2: lo que cambia (empresa, cifras, el primer error del reembolso) es lo del paquete; lo demás, igual que la serie 1", () => {
  assert.equal(SERIE2.length, 4, "no se leyeron las cuatro operaciones de la serie 2");
  D.SERIE_2.forEach((op, k) => {
    assert.equal(op.enunciado, SERIE2[k].enunciado, `${op.id}: enunciado`);
    assert.equal(op.acierto, SERIE2[k].acierto, `${op.id}: acierto`);
    assert.equal(op.subtema, SERIE2[k].subtema, `${op.id}: subtema`);
  });
  /* La trampa nombra el fondo: la de la serie 2 es la suya; los demás mensajes, los de la serie 1. */
  assert.equal(D.SERIE_2[1].errores[0].texto, SERIE2[1].primerError);
  assert.deepEqual(textosDe(D.SERIE_2[1]).slice(1), textosDe(D.SERIE_1[1]).slice(1));
  for (const k of [0, 2, 3]) assert.deepEqual(textosDe(D.SERIE_2[k]), textosDe(D.SERIE_1[k]), `operación ${k + 1}: los errores no son los de la serie 1`);
  assert.match(S2, /\*\*Igual que la serie 1:\*\* la mecánica, las cuatro cuentas, el orden de las operaciones/);
});

test("★★★ la v2 está dentro: ningún «gira», y los ocho mensajes de pares de la v2 son los de los datos", () => {
  const todo = [D.H3.objetivo, ...D.H3.consigna, ...TODAS.flatMap((o) => [o.enunciado, o.acierto, ...textosDe(o)]), D.CIERRE_H3.texto].join("\n");
  assert.doesNotMatch(todo, /\bgir(a|ar|ó)\b|\bcontra\b|\bsolo se mueve\b/i);
  const pares = [...V2.matchAll(new RegExp(`^\\| H3-\\d [^|]+ \\| [^|]+ \\| [^|]+ \\| ${CITA}`, "gm"))].map((m) => m[1]);
  assert.equal(pares.length, 8, "no se leyeron los ocho mensajes de la v2");
  for (const p of pares) assert.ok(textosDe(D.SERIE_1.find((o) => textosDe(o).includes(p)) ?? { errores: [] }).includes(p), `falta el mensaje de la v2 «${p.slice(0, 40)}…»`);
  /* Y van antes de «lados al revés»: es el último de cada lista. */
  for (const op of D.SERIE_1) assert.match(textosDe(op).at(-1), /^Las dos cuentas están bien, pero al revés\./, `${op.id}: «lados al revés» no va al final`);
});

test("★★★ las 11 combinaciones equivocadas de cada operación tienen mensaje, y sale el PRIMERO de la lista que aplica", () => {
  for (const op of TODAS) {
    let equivocadas = 0;
    for (const debe of D.CUENTAS_H3) for (const haber of D.CUENTAS_H3) {
      if (debe === haber) continue;
      const filas = [{ cuenta: debe, lado: D.DEBE }, { cuenta: haber, lado: D.HABER }];
      const r = D.evaluarH3(op, filas);
      if (debe === op.debe && haber === op.haber) { assert.ok(r.ok); assert.equal(r.texto, op.acierto); continue; }
      equivocadas++;
      assert.ok(r.texto, `${op.id}: ${debe} / ${haber} no tiene mensaje`);
      const primero = op.errores.find((e) => e.cuando({ debe, haber }));
      assert.equal(r.texto, primero.texto);
    }
    assert.equal(equivocadas, 11, `${op.id}: no son 11 combinaciones equivocadas`);
    /* Cada error del paquete sale para alguna combinación: ninguno queda escondido detrás de otro. */
    const salen = new Set();
    for (const debe of D.CUENTAS_H3) for (const haber of D.CUENTAS_H3) if (debe !== haber) salen.add(D.evaluarH3(op, [{ cuenta: debe, lado: D.DEBE }, { cuenta: haber, lado: D.HABER }]).texto);
    for (const e of op.errores) assert.ok(salen.has(e.texto), `${op.id}: el error «${e.texto.slice(0, 40)}…» nunca sale`);
  }
});

test("★★★ la trampa: en el reembolso, cualquier asiento con Caja menor marca esa fila mal y da el mensaje de la trampa o el de Caja menor al haber", () => {
  for (const op of TODAS.filter((o) => o.subtema === "Reembolso")) {
    for (const otra of D.CUENTAS_H3.filter((c) => c !== D.CAJA_MENOR)) {
      for (const [debe, haber] of [[D.CAJA_MENOR, otra], [otra, D.CAJA_MENOR]]) {
        const filas = [{ cuenta: debe, lado: D.DEBE }, { cuenta: haber, lado: D.HABER }];
        const r = D.evaluarH3(op, filas);
        assert.equal(r.estados[filas.findIndex((f) => f.cuenta === D.CAJA_MENOR)], "incorrecta", `${op.id}: ${debe} / ${haber}`);
        assert.equal(r.texto, debe === D.CAJA_MENOR ? op.errores[0].texto : op.errores[1].texto);
      }
    }
    assert.match(op.errores[0].texto, /^Esta es la trampa del reembolso\./);
  }
});

test("★★★ las cifras: las que salen de restar se calculan, ninguna es de A2, y el valor del asiento sale del enunciado", () => {
  assert.deepEqual(TODAS.map((o) => o.valor), [300_000, 214_600, 150_000, 100_000, 280_000, 187_350, 165_000, 70_000]);
  const fuente = leer("src/data/contabilidadT4H3.js");
  assert.doesNotMatch(fuente, /\b(150_?000|100_?000|165_?000|70_?000)\b/, "una cifra que sale de restar está escrita a mano");
  const pesos = (n) => `$${String(n).replace(/\B(?=(\d{3})+(?!\d))/g, ".")}`;
  /* La apertura, el reembolso y la disminución nombran el valor; el aumento da los dos fondos y el cheque es «la diferencia». */
  for (const op of TODAS) {
    if (op.subtema === "Aumento del fondo") {
      const [antes, despues] = [...op.enunciado.matchAll(/\$(\d{1,3}(?:\.\d{3})*)/g)].map((m) => Number(m[1].replace(/\./g, "")));
      assert.equal(despues - antes, op.valor, `${op.id}: el cheque no es la diferencia de los dos fondos del enunciado`);
      assert.match(op.enunciado, /con un cheque por la diferencia\.$/);
      assert.ok(op.acierto.includes(pesos(op.valor)), `${op.id}: el acierto no nombra ${pesos(op.valor)}`);
    } else assert.ok(op.enunciado.includes(pesos(op.valor)), `${op.id}: el enunciado no nombra ${pesos(op.valor)}`);
  }
  const cifras = new Set(TODAS.flatMap((o) => [o.enunciado, o.acierto, ...textosDe(o)]).flatMap((t) => [...t.matchAll(/\$\d{1,3}(?:\.\d{3})*/g)].map((m) => m[0])));
  for (const deA2 of ["$500.000", "$478.100", "$21.900"]) assert.ok(!cifras.has(deA2), `H3 usa ${deA2}, que es de A2`);
});

test("★★ el cierre y su pie; INFLESZ de todo texto de 10 palabras o más, 65 o más", () => {
  const cierre = S1.slice(S1.indexOf("## Cierre"));
  assert.ok(cierre.includes(`«${D.CIERRE_H3.texto}»`));
  assert.equal(D.CIERRE_H3.pie, cierre.match(new RegExp(`^- Pie: ${CITA}`, "m"))[1]);
  const textos = [D.H3.objetivo, ...D.H3.consigna, ...TODAS.flatMap((o) => [o.enunciado, o.acierto, ...textosDe(o)]), D.CIERRE_H3.texto];
  const medidos = textos.map((t) => ({ t, r: inflesz(t) })).filter((x) => x.r.aplica);
  assert.ok(medidos.length >= 40);
  assert.deepEqual(medidos.filter((x) => !x.r.cumple).map((x) => `${x.r.valor} · ${x.t}`), []);
});

/* ═══════════ 2 · LO QUE SE VE ═══════════ */

const Marco = ({ children }) => h("div", { "data-marco": true }, children);
const montar = async (props = {}) => {
  const caja = document.createElement("div");
  document.body.appendChild(caja);
  const raiz = createRoot(caja);
  const completados = [];
  await act(async () => { raiz.render(h(SeMueveLaCajaMenor, { Marco, items: D.SERIE_1, onCompletar: (...a) => completados.push(a), ...props })); });
  return { caja, completados, desmontar: () => { act(() => raiz.unmount()); caja.remove(); } };
};
const tocar = async (el) => {
  assert.ok(el, "no está el elemento que se quería tocar");
  await act(async () => { el.dispatchEvent(new w.MouseEvent("click", { bubbles: true })); });
};
const boton = (caja, texto) => [...caja.querySelectorAll("button")].find((b) => b.textContent.trim() === texto) ?? null;
const lado = (caja, k, l) => caja.querySelectorAll(`[data-fila-asiento="${k}"] > div:last-child > button`)[l === D.DEBE ? 0 : 1];
async function armar(caja, debe, haber) {
  await tocar(boton(caja, debe));
  await tocar(lado(caja, 0, D.DEBE));
  await tocar(boton(caja, haber));
  await tocar(lado(caja, 1, D.HABER));
}
const paleta = (caja) => [...caja.querySelectorAll("[data-constructor] button")].filter((b) => D.CUENTAS_H3.includes(b.textContent.trim())).map((b) => b.textContent.trim());
const delatores = (op) => [op.acierto, ...textosDe(op), D.CORRECTO, D.INCORRECTO, D.ROTULO_ASIENTO_H3];

test("★★★ la pantalla: la tarjeta con el enunciado; las cuatro cuentas siempre, en su orden; las operaciones en el orden de la vida del fondo", async () => {
  const m = await montar();
  try {
    for (const op of D.SERIE_1) {
      assert.equal(m.caja.querySelector(`[data-tarjeta-operacion="${op.id}"] [data-enunciado]`).textContent, op.enunciado);
      assert.deepEqual(paleta(m.caja), D.CUENTAS_H3, `${op.id}: la paleta no son las cuatro cuentas en su orden`);
      assert.equal(m.caja.querySelectorAll("[data-fila-asiento]").length, 2);
      await armar(m.caja, op.debe, op.haber);
      await tocar(boton(m.caja, D.BOTON_H3.comprobar));
      await tocar(boton(m.caja, D.SERIE_1.at(-1) === op ? D.BOTON_H3.verResumen : D.BOTON_H3.siguiente));
    }
  } finally { m.desmontar(); }
});

test("★★★ «Comprobar» se activa solo con dos cuentas y una a cada lado; con las dos al mismo lado avisa y no se comprueba", async () => {
  const m = await montar();
  try {
    const comprobar = () => boton(m.caja, D.BOTON_H3.comprobar);
    assert.equal(comprobar().disabled, true, "vacío");
    await tocar(boton(m.caja, D.CAJA_MENOR));
    assert.equal(comprobar().disabled, true, "una cuenta sin lado");
    await tocar(lado(m.caja, 0, D.DEBE));
    assert.equal(comprobar().disabled, true, "una cuenta con lado");
    await tocar(boton(m.caja, D.BANCOS));
    await tocar(lado(m.caja, 1, D.DEBE));
    assert.equal(comprobar().disabled, true, "dos cuentas al mismo lado");
    assert.equal(m.caja.querySelector("[data-aviso]").textContent, D.MISMO_LADO);
    await tocar(lado(m.caja, 1, D.HABER));
    assert.equal(comprobar().disabled, false, "dos cuentas, una a cada lado");
    assert.equal(m.caja.querySelector("[data-aviso]"), null);
  } finally { m.desmontar(); }
});

test("★★★ PH8-2: mientras se arma, nada de la respuesta está en el DOM (textContent y outerHTML, no innerText)", async () => {
  const m = await montar();
  try {
    for (const op of D.SERIE_1) {
      const comprobarSinDelatar = (cuando) => {
        const dom = `${m.caja.textContent}\n${m.caja.outerHTML}`;
        for (const x of delatores(op)) assert.ok(!dom.includes(x), `${op.id} ${cuando}: el DOM ya trae «${x.slice(0, 50)}»`);
        assert.equal(m.caja.querySelectorAll("[data-panel], [data-asiento-completo], [data-asiento], [data-texto-retro]").length, 0, `${op.id} ${cuando}: hay devolución montada`);
        assert.doesNotMatch(m.caja.outerHTML, /data-correct|data-respuesta|aria-(?:checked|selected)="true"/);
      };
      comprobarSinDelatar("vacío");
      /* Armado con la respuesta correcta, y antes de comprobar: tampoco. */
      await armar(m.caja, op.debe, op.haber);
      comprobarSinDelatar("armado");
      await tocar(boton(m.caja, D.BOTON_H3.comprobar));
      await tocar(boton(m.caja, D.SERIE_1.at(-1) === op ? D.BOTON_H3.verResumen : D.BOTON_H3.siguiente));
    }
  } finally { m.desmontar(); }
});

test("★★★ al comprobar: un solo mensaje, cada fila bien o mal, el asiento completo con el valor; coral solo en el error; un intento", async () => {
  const coral = /rgb\(231,\s*111,\s*81\)|#e76f51/i;
  for (const op of D.SERIE_1) {
    /* El acierto, los lados al revés, y una cuenta equivocada al debe. */
    const otra = D.CUENTAS_H3.find((c) => c !== op.debe && c !== op.haber);
    for (const [debe, haber] of [[op.debe, op.haber], [op.haber, op.debe], [otra, op.haber]]) {
      const m = await montar({ items: [op] });
      try {
        await armar(m.caja, debe, haber);
        await tocar(boton(m.caja, D.BOTON_H3.comprobar));
        const r = D.evaluarH3(op, [{ cuenta: debe, lado: D.DEBE }, { cuenta: haber, lado: D.HABER }]);
        const panel = m.caja.querySelector("[data-panel]");
        assert.equal(panel.dataset.panel, r.ok ? "acierto" : "error");
        assert.equal(m.caja.querySelectorAll("[data-texto-retro]").length, 1, `${op.id}: más de un mensaje`);
        assert.equal(panel.querySelector("[data-palabra]").textContent, r.ok ? D.CORRECTO : D.INCORRECTO);
        assert.equal(panel.querySelector("[data-texto-retro]").textContent, r.texto);
        assert.equal(coral.test(panel.getAttribute("style")), !r.ok, `${op.id}: coral en la devolución`);
        /* Cada fila: borde coral solo si está mal. */
        const filas = [...m.caja.querySelectorAll("[data-fila-asiento]")];
        filas.forEach((f, k) => assert.equal(coral.test(f.getAttribute("style")), r.estados[k] === "incorrecta", `${op.id}: fila ${k}`));
        /* El asiento completo, con el valor del enunciado. */
        const as = m.caja.querySelector("[data-asiento-completo]");
        assert.ok(as.textContent.includes(op.debe) && as.textContent.includes(op.haber));
        assert.equal(as.textContent.split(`$${String(op.valor).replace(/\B(?=(\d{3})+(?!\d))/g, ".")}`).length - 1, 4, `${op.id}: el valor no está en las dos líneas y las dos sumas`);
        /* Un intento: el constructor queda bloqueado y «Comprobar» ya no está. */
        assert.equal(boton(m.caja, D.BOTON_H3.comprobar), null);
        assert.ok([...m.caja.querySelectorAll("[data-constructor] button")].every((b) => b.disabled));
      } finally { m.desmontar(); }
    }
  }
});

test("★★★ se sortea la serie, no las operaciones; al terminar, el cierre y onCompletar con el porcentaje y el asiento armado en el error", async () => {
  assert.equal(D.sortearH3(() => 0), D.SERIE_1);
  assert.equal(D.sortearH3(() => 0.99), D.SERIE_2);
  assert.match(VISTA, /useTanda\(\(\) => items \?\? sortearH3\(\)\)/);
  assert.doesNotMatch(VISTA.slice(VISTA.indexOf("export function SeMueveLaCajaMenor")), /barajar/);
  const m = await montar();
  try {
    for (const [k, op] of D.SERIE_1.entries()) {
      if (k === 1) await armar(m.caja, D.CAJA_MENOR, D.BANCOS); else await armar(m.caja, op.debe, op.haber);
      await tocar(boton(m.caja, D.BOTON_H3.comprobar));
      await tocar(boton(m.caja, k === 3 ? D.BOTON_H3.verResumen : D.BOTON_H3.siguiente));
    }
    const [pct, , detalle] = m.completados[0];
    assert.equal(pct, 75);
    assert.equal(detalle.length, 4);
    assert.deepEqual(detalle[1], { item: "h3-2", ok: false, intentos: 1, respuesta: "Caja menor / Bancos", orden: 2 });
    assert.equal(m.caja.querySelector("[data-resumen]").textContent, D.resumenH3(3, 4));
    assert.equal(m.caja.querySelector("[data-cierre]").textContent, D.CIERRE_H3.texto);
    assert.equal(m.caja.querySelector("[data-pie-cierre]").textContent, D.CIERRE_H3.pie);
  } finally { m.desmontar(); }
});

test("★★★ en la página del juego hay exactamente UN [data-t4-h3]: la partida; la demo de «Así se juega» lleva el suyo propio", async () => {
  try { globalThis.localStorage.clear(); } catch { /* sin almacenamiento, sale igual */ }
  const caja = document.createElement("div");
  document.body.appendChild(caja);
  const raiz = createRoot(caja);
  await act(async () => {
    raiz.render(h(AuthContext.Provider, { value: { usuario: null, pedirCuenta: () => {} } },
      h(ContabilidadT4View, { modo: HACER, nodoInicial: D.H3_ID, onBack: () => {} })));
  });
  try {
    assert.ok(caja.querySelector("[data-asj-demo]"), "no salió el «Así se juega»");
    assert.equal(caja.querySelectorAll("[data-t4-h3-demo]").length, 1, "la demo no lleva su propio atributo");
    assert.equal(caja.querySelectorAll("[data-t4-h3]").length, 1, "hay más de un [data-t4-h3] en la página");
    assert.ok(caja.querySelector("[data-t4-h3]").closest("[data-partida]"), "el [data-t4-h3] no es el de la partida");
  } finally { act(() => raiz.unmount()); caja.remove(); }
});

/* ═══════════ 3 · CAMINO, CATÁLOGO, PANEL Y «ASÍ SE JUEGA» ═══════════ */

test("★★★ en T4, justo después de A2: evaluativa, medio, 25 FP; la vista lo abre", () => {
  assert.deepEqual(clasificacionDe("contabilidad", TEMA_T4, D.H3_ID), { tipo: HACER, modalidad: "evaluativa", dificultad: "medio", fpBase: 25 });
  const ids = TEMA.actividades.map((x) => x.id);
  assert.equal(ids.indexOf(D.H3_ID), ids.indexOf("t4-a2-el-fondo-fijo") + 1);
  assert.deepEqual(JUEGOS_T4.map((j) => j.id).sort(), actividadesDeTipo(TEMA, HACER).map((a) => a.id).sort());
  assert.equal(JUEGOS_T4.find((j) => j.id === D.H3_ID).Mecanica, SeMueveLaCajaMenor);
});

test("★★★ la 0202: del rango de la célula, un insert aditivo y repetible, con su comprobación y su deshacer escrito sin correr", () => {
  assert.match(MIGRACION, /\('t4-se-mueve-la-caja-menor',\s*'contabilidad',\s*'efectivo-caja-menor-bancos',\s*'evaluativa',\s*'medio',\s*25,\s*1\)/);
  assert.match(MIGRACION, /on conflict \(activity_id\) do nothing;/);
  const sentencias = MIGRACION.split("\n").filter((l) => !l.trim().startsWith("--")).join("\n");
  assert.doesNotMatch(sentencias, /\b(alter|update|delete|drop|truncate)\b/i);
  assert.match(sentencias, /select activity_id[\s\S]*where activity_id = 't4-se-mueve-la-caja-menor';\s*$/);
  assert.match(MIGRACION, /^--\s+delete from public\.actividad_catalogo where activity_id = 't4-se-mueve-la-caja-menor';$/m);
  assert.match(MIGRACION, /^-- Del rango de la Célula D \(0200-0249\)\./m);
  const dir = new URL("supabase/migrations/", RAIZ);
  const archivos = readdirSync(dir);
  assert.ok(archivos.includes("0001_profiles.sql"));
  assert.deepEqual(archivos.filter((f) => readFileSync(new URL(f, dir), "utf8").includes(D.H3_ID)), ["0202_t4_se_mueve_la_caja_menor.sql"]);
  assert.deepEqual(archivos.filter((f) => f.startsWith("0202")), ["0202_t4_se_mueve_la_caja_menor.sql"]);
});

test("★★★ el panel docente: todo item_id de las dos series tiene etiqueta, leída del enunciado, y la regla vive en el bloque de T4", () => {
  assert.equal(new Set(TODAS.map((o) => o.id)).size, 8, "dos operaciones con el mismo id");
  for (const op of TODAS) assert.equal(etiquetaDeItem(D.H3_ID, op.id), recortar(op.enunciado), op.id);
  const fuente = leer("src/docente/etiquetasItem.js");
  const bloque = fuente.slice(fuente.indexOf("── T4 «Efectivo, caja menor y bancos» (Célula D) ──"), fuente.indexOf("── Repaso del capítulo 5 (Célula E) ──"));
  assert.match(bloque, /"t4-se-mueve-la-caja-menor": \(id\) => operacionDeItemT4H3\(id\),/);
});

test("★★★ «Así se juega»: pasos, ejemplo y texto alternativo de Katsumi; el ejemplo no está en ninguna serie; la mano arma la apertura y comprueba", async () => {
  const asi = ASI_SE_JUEGA[D.H3_ID];
  assert.ok(asi);
  const sec = ASI.slice(ASI.indexOf("## H3 · "), ASI.indexOf("## H4 · "));
  assert.deepEqual([...sec.matchAll(new RegExp(`^  \\d\\. ${CITA}`, "gm"))].map((m) => m[1]), asi.pasos);
  assert.equal(D.EJEMPLO_H3.enunciado, sec.match(new RegExp(`\\*\\*Ejemplo \\(\`demo\`\\):\\*\\* ${CITA}`))[1]);
  assert.equal(asi.alt, sec.match(new RegExp(`\\*\\*Texto alternativo \\(\`alt\`\\):\\*\\* ${CITA}`))[1]);
  assert.match(sec, /La mano saca «Caja menor» al debe y «Bancos» al haber, y confirma\./);
  assert.ok(!TODAS.some((o) => o.enunciado === D.EJEMPLO_H3.enunciado));
  assert.deepEqual([D.EJEMPLO_H3.debe, D.EJEMPLO_H3.haber], [D.CAJA_MENOR, D.BANCOS]);
  /* La demo, montada: el guion de la mano, tal cual, da el acierto, y no reporta nada. */
  const m = await montar({ modoDemo: true, items: [D.EJEMPLO_H3] });
  try {
    for (const toque of asi.guion.toques) {
      const el = toque.en ? m.caja.querySelector(toque.en) : boton(m.caja, toque.texto);
      assert.ok(el, `el guion no encuentra «${toque.en ?? toque.texto}»`);
      await tocar(el);
    }
    assert.equal(m.caja.querySelector("[data-panel]").dataset.panel, "acierto");
    assert.equal(m.completados.length, 0);
  } finally { m.desmontar(); }
});
