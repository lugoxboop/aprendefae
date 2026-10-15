import { test } from "node:test";
import assert from "node:assert/strict";
import { readFileSync, readdirSync } from "node:fs";
import { JSDOM, VirtualConsole } from "jsdom";

/*
 * ═══════════════════════════════════════════════════════════════════════════
 * T4 · H8 «¿Se asienta o no?» (Célula D) · Hacer · evaluativa · experto · 90 FP.
 *
 *   · cada texto es el del paquete vigente de Katsumi, serie 1 y serie 2,
 *     letra por letra; las cifras de la etapa 3 se calculan
 *   · CADA INTENTO SORTEA SU SERIE por su cuenta; nada se comparte con H7
 *   · PH8-1 (v3 de Katsumi, Hanayama v1.1): NI EL SALDO CONCILIADO NI EL
 *     EXTRACTO están en el DOM —textContent y outerHTML— en ninguna etapa,
 *     hasta el acierto de la etapa 3. Tampoco después de un error de la 3
 *   · etapa 1: dos destinos fijos; un toque; coral solo en el error
 *   · etapa 2: las seis cuentas fijas; las cinco reglas de Katsumi en su
 *     orden, comprobadas en las 30 combinaciones de cada nota (29 + 1)
 *   · etapa 3: el mayor con los cinco movimientos correctos, sin «Suma»
 *     hasta comprobar; las tres cifras de error; el aviso que no gasta
 *   · la migración 0207; el panel docente; el «Así se juega»
 * ═══════════════════════════════════════════════════════════════════════════
 */

const dom = new JSDOM("<!doctype html><html><body></body></html>", { url: "http://localhost/", virtualConsole: new VirtualConsole() });
const w = dom.window;
w.matchMedia = () => ({ matches: false, addEventListener() {}, removeEventListener() {}, addListener() {}, removeListener() {} });
w.requestAnimationFrame = (f) => setTimeout(f, 0);
for (const [k, v] of Object.entries({
  window: w, document: w.document, navigator: w.navigator, localStorage: w.localStorage,
  HTMLElement: w.HTMLElement, HTMLInputElement: w.HTMLInputElement, Element: w.Element, Node: w.Node, SVGElement: w.SVGElement,
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

const D = await import("../../data/contabilidadT4H8.js");
const H7 = await import("../../data/contabilidadT4H7.js");
const { SUBJECTS, HACER, actividadesDeTipo, clasificacionDe } = await import("../../data/subjects.js");
const { default: ContabilidadT4View, SeAsientaONo, JUEGOS_T4, TEMA_T4, cifra } = await import("../../components/ContabilidadT4View.jsx");
const { AuthContext } = await import("../../auth/AuthProvider.jsx");
const { etiquetaDeItem, recortar } = await import("../../docente/etiquetasItem.js");
const { ASI_SE_JUEGA } = await import("../../data/asiSeJuega.js");
const { inflesz } = await import("../../herramientas/inflesz.js");
const { leer, CITA, PAQUETES, RAIZ, blobEnLaRamaFuente, blobDeLaCopia, RAMA_FUENTE } = await import("./t4-paquete.mjs");

const PAQ = leer(`${PAQUETES}d4-t4-h8-v1.md`);
const SERIE2 = leer(`${PAQUETES}d4-t4-h7-h8-serie2.md`);
const PAQ2 = SERIE2.slice(SERIE2.indexOf("# H8, serie 2"), SERIE2.indexOf("## Comprobación de colisiones"));
const ASI = leer(`${PAQUETES}d4-t4-asi-se-juega-v1.md`);
const VISTA = leer("src/components/ContabilidadT4View.jsx");
const MIGRACION = leer("supabase/migrations/0207_t4_se_asienta_o_no.sql");
const TEMA = SUBJECTS.contabilidad.topics.find((t) => t.id === TEMA_T4);
const MD = { s1: PAQ, s2: PAQ2 };
const SERIE = { s1: D.SERIE_H8_1, s2: D.SERIE_H8_2 };
const n = (t) => Number(String(t).replace(/\D/g, ""));

/* ═══════════ EL PAQUETE, LEÍDO ═══════════ */

/* Las notas de la etapa 2: «### H8-k · …» (serie 1) o «### H8s2-k · …» (serie 2). */
function notasDe(md, prefijo) {
  const sec = md.slice(md.indexOf("## Etapa 2"), md.indexOf("## Etapa 3"));
  return sec.split(new RegExp(`\\n(?=### ${prefijo}-\\d)`)).slice(1).map((b) => {
    const cuentas = b.match(/^- \*\*Asiento correcto:\*\* (.+?) al debe \/ (.+?) al haber, por ([\d.]+)/m);
    const errores = Object.fromEntries([...b.matchAll(new RegExp(`^  - \\*([^*]+):\\* ${CITA}`, "gm"))].map((m) => [m[1], m[2]]));
    return {
      texto: b.match(new RegExp(`^- \\*\\*Partida:\\*\\* ${CITA}`, "m"))[1],
      subtema: b.match(/^- \*\*Subtema:\*\* (.+)$/m)[1].trim(),
      debe: cuentas[1], haber: cuentas[2], monto: n(cuentas[3]),
      acierto: b.match(new RegExp(`^- \\*\\*Acierto:\\*\\* ${CITA}`, "m"))[1],
      errores,
    };
  });
}
const NOTAS = { s1: notasDe(PAQ, "H8"), s2: notasDe(PAQ2, "H8s2") };

/* ═══════════ 1 · EL TEXTO Y LAS CIFRAS, CONTRA EL PAQUETE ═══════════ */

test("★★★ la copia de los paquetes de H8 es la de la punta de la rama de Katsumi (si este clon la tiene); la v2, la v3 y S2-1 están dentro", (t) => {
  assert.match(PAQ, /\*\*Este archivo es la versión vigente\.\*\* Ya incluye `d4-t4-a5-h8-v2-cambios\.md` \(parte H8\), `d4-t4-a4-h8-v3-cambios\.md` \(parte H8\) y la corrección S2-1/);
  assert.deepEqual(readdirSync(new URL(PAQUETES, RAIZ)).filter((f) => /^d4-t4-.*h8.*-cambios\.md$/.test(f)).sort(), ["d4-t4-a4-h8-v3-cambios.md", "d4-t4-a5-h8-v2-cambios.md"]);
  if (!blobEnLaRamaFuente("d4-t4-h8-v1.md")) { t.skip(`este clon no tiene ${RAMA_FUENTE}`); return; }
  for (const f of ["d4-t4-h8-v1.md", "d4-t4-h7-h8-serie2.md", "d4-t4-a4-h8-v3-cambios.md", "d4-t4-a5-h8-v2-cambios.md", "d4-t4-asi-se-juega-v1.md"]) assert.equal(blobDeLaCopia(f), blobEnLaRamaFuente(f), f);
});

test("★★★ ficha: id, nombre, objetivo, subtemas y las seis cuentas son los del paquete", () => {
  assert.equal(D.H8_ID, "t4-se-asienta-o-no");
  assert.match(PAQ, new RegExp(`\\| id \\| \`${D.H8_ID}\` \\|`));
  assert.ok(PAQ.startsWith(`**T4 · H8 «${D.H8.nombre}»`));
  assert.ok(PAQ.includes(`«${D.H8.objetivo}»`));
  assert.equal(PAQ.match(/\| Subtemas \| (.+) \|/)[1], D.SUBTEMAS_H8.join(" · "));
  assert.deepEqual([...PAQ.match(/\*\*Cuentas disponibles, las mismas en los cinco:\*\* (.+)$/m)[1].matchAll(new RegExp(CITA, "g"))].map((m) => m[1]), D.CUENTAS_H8);
  assert.equal(PAQ.match(new RegExp(`^- Pie de la etapa: ${CITA}`, "m"))[1], D.PIE_ETAPA1);
  const cierre = PAQ.slice(PAQ.indexOf("## Cierre"));
  assert.equal(cierre.match(new RegExp(`^- ${CITA} \\(`, "m"))[1], D.CIERRE_H8.texto);
  assert.equal(cierre.match(new RegExp(`^- Pie: ${CITA}`, "m"))[1], D.CIERRE_H8.pie);
});

for (const sid of ["s1", "s2"]) {
  test(`★★★ ${sid}: la consigna, el dato y el acierto de la etapa 3, y sus tres errores con cifra, son los del paquete; las cifras se calculan`, () => {
    const s = SERIE[sid];
    const md = MD[sid];
    const consigna = sid === "s1" ? [...PAQ.slice(PAQ.indexOf("## Consigna"), PAQ.indexOf("INFLESZ")).matchAll(new RegExp(`^- ${CITA}`, "gm"))].map((m) => m[1]) : [...PAQ2.slice(0, PAQ2.indexOf("## Etapa 1")).matchAll(new RegExp(`^- ${CITA}`, "gm"))].map((m) => m[1]);
    assert.deepEqual(consigna, s.consigna);
    const e3 = md.slice(md.indexOf("## Etapa 3"), md.indexOf("## Cierre"));
    assert.equal(e3.match(new RegExp(`\\*\\*Dato a la vista:\\*\\* ${CITA}`))[1], s.datoEtapa3);
    assert.equal(e3.match(new RegExp(`\\*\\*Acierto:\\*\\* ${CITA}`))[1], s.aciertoEtapa3);
    assert.equal(e3.match(new RegExp(`\\*\\*Cualquier otra cifra:\\*\\* ${CITA}`))[1], s.otroEtapa3);
    const errores = [...e3.matchAll(new RegExp(`\\*\\*Si escribe \\$([\\d.]+)[^*]*\\*\\* \\([^)]+\\): ${CITA}`, "g"))].map((m) => ({ cifra: n(m[1]), texto: m[2] }));
    assert.deepEqual(errores, s.erroresEtapa3);
    /* El cálculo del paquete: «libros + crédito − débito = **saldo**». */
    const [l, c, d, m] = e3.match(/\*\*Cálculo:\*\* ([\d.]+) \+ ([\d.]+) − ([\d.]+) = \*\*([\d.]+)\*\*/).slice(1).map(n);
    assert.deepEqual([l, c, d, m], [s.libros, s.credito, s.debito, s.saldoMayor]);
    /* El saldo del mayor ES el saldo conciliado de H7 (el mismo dato, sin compartir estado). */
    assert.equal(s.saldoMayor, s.conciliadoBanco);
    assert.equal(s.saldoMayor, H7.SERIES_H7.find((x) => x.id === sid).conciliadoLibros);
  });

  test(`★★★ ${sid}: las cinco notas de la etapa 2, letra por letra: partida, asiento correcto, acierto y CADA mensaje de error`, () => {
    const s = SERIE[sid];
    const paq = NOTAS[sid];
    assert.equal(paq.length, 5, `${sid}: no se leyeron las cinco notas`);
    for (const [k, p] of paq.entries()) {
      const x = s.notas[k];
      assert.equal(x.texto, p.texto, `${x.id}: partida`);
      assert.deepEqual([x.debe, x.haber, x.monto], [p.debe, p.haber, p.monto], `${x.id}: asiento`);
      assert.equal(x.acierto, p.acierto, `${x.id}: acierto`);
      /* Cada mensaje del paquete, por su rótulo. */
      const esperado = {};
      for (const [rotulo, texto] of Object.entries(p.errores)) {
        if (rotulo === "lados al revés") esperado.alReves = texto;
        else if (rotulo === "usó Caja") esperado.caja = texto;
        else if (rotulo === "regla, sin Bancos en el asiento") esperado.sinBancos = texto;
        else if (rotulo === "regla, Bancos en el lado equivocado con otra cuenta") esperado.bancosAlReves = texto;
        else if (rotulo === "usó una cuenta de gasto") { esperado[D.GASTOS_CHEQUERA] = texto; esperado[D.GASTO_INTERES] = texto; }
        else esperado[rotulo.replace(/^usó /, "")] = texto;
      }
      const tiene = { alReves: x.alReves, caja: x.caja, sinBancos: x.sinBancos, bancosAlReves: x.bancosAlReves, ...x.porCuenta };
      assert.deepEqual(tiene, esperado, `${x.id}: errores`);
    }
  });

  test(`★★★ ${sid}: las cinco reglas de Katsumi en su orden cubren las 30 combinaciones de cada nota (10 + 12 + 3 + 3 + 1, y el acierto), cada una con su texto`, () => {
    for (const nota of SERIE[sid].notas) {
      const cuenta = {};
      for (const d of D.CUENTAS_H8) for (const hh of D.CUENTAS_H8) {
        if (d === hh) continue;
        const r = D.reglaH8(nota, d, hh);
        assert.ok(r.texto, `${nota.id}: ${d} / ${hh} sin mensaje`);
        cuenta[r.regla] = (cuenta[r.regla] ?? 0) + 1;
        /* Ningún mensaje de error nombra el asiento correcto entero. */
        if (r.regla !== "acierto") assert.ok(!(r.texto.includes(nota.debe) && r.texto.includes(nota.haber) && r.regla !== "al-reves"), `${nota.id}: ${r.regla} revela`);
      }
      assert.deepEqual(cuenta, { acierto: 1, caja: 10, "sin-bancos": 12, "bancos-al-reves": 3, cuenta: 3, "al-reves": 1 }, nota.id);
    }
    assert.match(PAQ, /10 \+ 12 \+ 3 \+ 3 \+ 1 = 29/);
  });
}

test("★★★ etapa 1: las nueve partidas son las de los DATOS de H7 de su serie, y la devolución por tipo es la del paquete", () => {
  const e1 = PAQ.slice(PAQ.indexOf("## Etapa 1"), PAQ.indexOf("## Etapa 2"));
  const TIPO = { "Cheque sin cobrar": "cheque", "Consignación en tránsito": "consignacion", "Nota crédito del banco": "credito", "Nota débito del banco": "debito" };
  for (const [nombre, tipo] of Object.entries(TIPO)) {
    const b = e1.slice(e1.indexOf(`**${nombre}**`)).split("\n\n")[0];
    assert.equal(D.ETAPA1_H8[tipo].acierto, b.match(new RegExp(`\\*\\*Acierto \\([^)]+\\):\\*\\* ${CITA}`))[1], `${tipo}: acierto`);
    assert.equal(D.ETAPA1_H8[tipo].error, b.match(new RegExp(`\\*\\*Error \\([^)]+\\):\\*\\* ${CITA}`))[1], `${tipo}: error`);
    assert.equal(D.nombreDeDestinoH8(D.ETAPA1_H8[tipo].respuesta), b.match(/\*\*Acierto \(([^)]+)\)/)[1]);
  }
  for (const s of D.SERIES_H8) {
    const h7 = H7.SERIES_H7.find((x) => x.id === s.id);
    assert.deepEqual(s.partidas.map((p) => [p.id, p.texto, p.monto]), h7.partidas.map((p) => [p.id, p.texto, p.monto]));
    assert.equal(s.libros, h7.libros);
    /* Cuatro no se asientan, cinco sí. */
    assert.deepEqual([s.partidas.filter((p) => p.respuesta === D.SE_ASIENTA).length, s.partidas.filter((p) => p.respuesta === D.NO_SE_ASIENTA).length], [5, 4]);
  }
});

test("★★ INFLESZ con la herramienta oficial: todo texto de 10 palabras o más da 65 o más", () => {
  const textos = [D.H8.objetivo, D.CIERRE_H8.texto, ...Object.values(D.ETAPA1_H8).flatMap((x) => [x.acierto, x.error]), ...D.SERIES_H8.flatMap((s) => [...s.consigna, s.datoEtapa3, s.aciertoEtapa3, s.otroEtapa3, ...s.erroresEtapa3.map((e) => e.texto), ...s.notas.flatMap((x) => [x.texto, x.acierto, x.caja, x.alReves, x.sinBancos, x.bancosAlReves, ...Object.values(x.porCuenta)])])];
  const medidos = [...new Set(textos)].map((t) => ({ t, r: inflesz(t) })).filter((x) => x.r.aplica);
  assert.ok(medidos.length >= 40, `solo ${medidos.length} textos medidos`);
  assert.deepEqual(medidos.filter((x) => !x.r.cumple).map((x) => `${x.r.valor} · ${x.t}`), []);
});

test("★★★ cada intento sortea su serie por su cuenta; H8 lee los DATOS de H7 pero no guarda ni recibe nada de una partida de H7", () => {
  assert.equal(D.sortearH8((xs) => xs[0], (x) => x).serie, D.SERIE_H8_1);
  assert.equal(D.sortearH8((xs) => xs[1], (x) => x).serie, D.SERIE_H8_2);
  assert.deepEqual(D.sortearH8((xs) => xs[0], (xs) => [...xs].reverse()).partidas.map((p) => p.id), [...D.SERIE_H8_1.partidas].reverse().map((p) => p.id));
  const fuente = leer("src/data/contabilidadT4H8.js");
  assert.match(fuente, /^import \{ SERIE_1, SERIE_2 \} from "\.\/contabilidadT4H7\.js";$/m, "H8 solo importa los datos de las series");
  assert.doesNotMatch(fuente, /localStorage|sessionStorage|sortearH7|let\s+\w+\s*=\s*(null|\[\]|\{\})/);
  /* El componente de H8 no recibe nada de H7: sus props son las de todo juego. */
  assert.match(VISTA, /export function SeAsientaONo\(\{ Marco, rotulo, titulo, acento, onCompletar, items = null, modoDemo = false, onComoSeJuega = null \}\)/);
});

/* ═══════════ 2 · LO QUE SE VE ═══════════ */

const Marco = ({ children }) => h("div", { "data-marco": true }, children);
const montar = async (props = {}) => {
  const caja = document.createElement("div");
  document.body.appendChild(caja);
  const raiz = createRoot(caja);
  const completados = [];
  await act(async () => { raiz.render(h(SeAsientaONo, { Marco, items: { serie: D.SERIE_H8_1, partidas: D.SERIE_H8_1.partidas }, onCompletar: (...a) => completados.push(a), ...props })); });
  return { caja, completados, desmontar: () => { act(() => raiz.unmount()); caja.remove(); } };
};
const tocar = async (el) => {
  assert.ok(el, "no está el elemento que se quería tocar");
  await act(async () => { el.dispatchEvent(new w.MouseEvent("click", { bubbles: true })); });
};
const escribir = async (input, valor) => {
  const set = Object.getOwnPropertyDescriptor(w.HTMLInputElement.prototype, "value").set;
  await act(async () => { set.call(input, valor); input.dispatchEvent(new w.Event("input", { bubbles: true })); });
};
const boton = (caja, texto) => [...caja.querySelectorAll("button")].find((b) => b.textContent.trim() === texto) ?? null;
const destino = (caja, id) => caja.querySelector(`[data-opcion="${id}"] button`);
const retro = (caja) => [...caja.querySelectorAll("[data-texto-retro]")].map((p) => p.textContent);
const seguir = (caja) => boton(caja, D.BOTON_H8.siguiente) ?? boton(caja, D.BOTON_H8.aLosAsientos) ?? boton(caja, D.BOTON_H8.siguienteAsiento) ?? boton(caja, D.BOTON_H8.alMayor) ?? boton(caja, D.BOTON_H8.verResumen);
const ladoFila = (caja, k, l) => caja.querySelectorAll(`[data-fila-asiento="${k}"] > div:last-child > button`)[l === D.DEBE ? 0 : 1];
const enPaleta = (caja, cuenta) => [...caja.querySelectorAll("[data-constructor] button")].find((b) => b.textContent.trim() === D.enLaPaleta(cuenta));
async function armar(caja, debe, haber) {
  await tocar(enPaleta(caja, debe));
  await tocar(ladoFila(caja, 0, D.DEBE));
  await tocar(enPaleta(caja, haber));
  await tocar(ladoFila(caja, 1, D.HABER));
}
const loQueHayEnElDom = (caja) => `${caja.textContent}\n${caja.outerHTML}`;
/* Lo que NO puede estar antes del acierto de la etapa 3: el saldo conciliado y el extracto, en cifras y en el texto del acierto. */
const prohibidos = (s) => [cifra(s.conciliadoBanco), cifra(s.extracto), s.aciertoEtapa3];
const sinConciliado = (m, s, cuando) => {
  const dom = loQueHayEnElDom(m.caja);
  for (const x of prohibidos(s)) assert.ok(!dom.includes(x), `${cuando}: el DOM ya trae «${x.slice(0, 50)}»`);
};
async function jugarEtapa1(m, s, { mal = [], revisar = null } = {}) {
  for (const p of s.partidas) {
    revisar?.(`etapa 1 · ${p.id}`);
    await tocar(destino(m.caja, mal.includes(p.id) ? (p.respuesta === D.SE_ASIENTA ? D.NO_SE_ASIENTA : D.SE_ASIENTA) : p.respuesta));
    revisar?.(`etapa 1 · ${p.id} respondida`);
    await tocar(seguir(m.caja));
  }
}
async function jugarEtapa2(m, s, { mal = [], revisar = null } = {}) {
  for (const x of s.notas) {
    revisar?.(`etapa 2 · ${x.id}`);
    if (mal.includes(x.id)) await armar(m.caja, x.haber, x.debe); else await armar(m.caja, x.debe, x.haber);
    await tocar(boton(m.caja, D.BOTON_H8.comprobar));
    revisar?.(`etapa 2 · ${x.id} comprobada`);
    await tocar(seguir(m.caja));
  }
}

for (const sid of ["s1", "s2"]) {
  test(`★★★ ${sid} · PH8-1: NI EL SALDO CONCILIADO NI EL EXTRACTO están en el DOM en ninguna etapa, ni tras un error de la etapa 3; solo con su acierto`, async () => {
    const s = SERIE[sid];
    const revisar = (cuando) => sinConciliado(m, s, cuando);
    const m = await montar({ items: { serie: s, partidas: s.partidas } });
    try {
      /* Arriba, solo «los libros»: el lado izquierdo y el «=» guardan su sitio, sin texto. */
      assert.deepEqual([...m.caja.querySelectorAll("[data-par-monto]")].map((x) => n(x.textContent)), [s.libros]);
      assert.equal(m.caja.querySelector("[data-par-oculto]").textContent.trim(), "");
      assert.equal(m.caja.querySelector("[data-igual]").dataset.igual, "oculto");
      await jugarEtapa1(m, s, { mal: [s.partidas[0].id], revisar });
      await jugarEtapa2(m, s, { mal: [s.notas[1].id], revisar });
      revisar("etapa 3 · colocando");
      /* Un error de la etapa 3 tampoco lo revela. */
      await escribir(m.caja.querySelector('[data-campo="mayor"] input'), cifra(s.erroresEtapa3[0].cifra));
      await tocar(boton(m.caja, D.BOTON_H8.comprobarSaldo));
      assert.equal(m.caja.querySelector('[data-etapa="3"] [data-panel]').dataset.panel, "error");
      revisar("etapa 3 · error");
      assert.equal(m.caja.querySelector("[data-igual]").dataset.igual, "oculto");
    } finally { m.desmontar(); }
    /* Y con el acierto, sí: el par completo con el «=», y el texto de Katsumi con el extracto. */
    const m2 = await montar({ items: { serie: s, partidas: s.partidas } });
    try {
      await jugarEtapa1(m2, s);
      await jugarEtapa2(m2, s);
      await escribir(m2.caja.querySelector('[data-campo="mayor"] input'), String(s.saldoMayor));
      await tocar(boton(m2.caja, D.BOTON_H8.comprobarSaldo));
      assert.deepEqual(retro(m2.caja), [s.aciertoEtapa3]);
      assert.deepEqual([...m2.caja.querySelectorAll("[data-par-monto]")].map((x) => n(x.textContent)), [s.conciliadoBanco, s.saldoMayor]);
      assert.equal(m2.caja.querySelector("[data-igual]").dataset.igual, "visible");
      assert.ok(loQueHayEnElDom(m2.caja).includes(cifra(s.extracto)));
    } finally { m2.desmontar(); }
  });
}

test("★★★ etapa 1: dos destinos fijos y apilados; un toque; la devolución por tipo con su pie; coral solo en el error; «era esta»", async () => {
  const coral = /rgb\(231,\s*111,\s*81\)|#e76f51/i;
  for (const p of D.SERIE_H8_1.partidas.filter((x, k) => [0, 3, 4, 6].includes(k))) {
    for (const elegido of [D.SE_ASIENTA, D.NO_SE_ASIENTA]) {
      const m = await montar({ items: { serie: D.SERIE_H8_1, partidas: [p] } });
      try {
        assert.deepEqual([...m.caja.querySelectorAll("[data-opcion]")].map((o) => o.dataset.opcion), [D.SE_ASIENTA, D.NO_SE_ASIENTA]);
        assert.equal(m.caja.querySelector(`[data-tarjeta-partida="${p.id}"]`).textContent, p.texto);
        assert.equal(m.caja.querySelector("[data-panel]"), null);
        await tocar(destino(m.caja, elegido));
        const ok = elegido === p.respuesta;
        const panel = m.caja.querySelector("[data-panel]");
        assert.deepEqual(retro(m.caja), ok ? [D.CORRECTO, p.acierto] : [p.error]);
        assert.equal(panel.querySelector("[data-pagina]").textContent, D.PIE_ETAPA1);
        assert.equal(coral.test(panel.getAttribute("style")), !ok);
        if (!ok) assert.ok(destino(m.caja, p.respuesta).textContent.includes("era esta"));
        for (const d of D.DESTINOS_H8) assert.equal(destino(m.caja, d.id).disabled, true);
      } finally { m.desmontar(); }
    }
  }
  assert.match(VISTA, /<Opciones columnas="minmax\(0, 1fr\)">\s*\{DESTINOS_H8\.map/);
});

test("★★★ etapa 2: las seis cuentas siempre y en su orden (con la raya de H5); cada regla sale con su mensaje; el asiento correcto, solo después de comprobar", async () => {
  const s = D.SERIE_H8_1;
  const nota = s.notas[2];
  const casos = [
    [nota.debe, nota.haber, "acierto"],
    [D.CAJA, D.BANCOS, "caja"],
    [D.GASTO_INTERES, D.CXC_CLIENTES, "sin-bancos"],
    [D.BANCOS, D.CXC_CLIENTES, "bancos-al-reves"],
    [D.GASTO_INTERES, D.BANCOS, "cuenta"],
    [nota.haber, nota.debe, "al-reves"],
  ];
  for (const [debe, haber, regla] of casos) {
    const m = await montar({ items: { serie: s, partidas: s.partidas } });
    try {
      await jugarEtapa1(m, s);
      assert.equal(m.caja.querySelector("[data-tarjeta-nota]").textContent, s.notas[0].texto);
      for (let k = 0; k < 2; k++) {
        await armar(m.caja, s.notas[k].debe, s.notas[k].haber);
        await tocar(boton(m.caja, D.BOTON_H8.comprobar));
        await tocar(seguir(m.caja));
      }
      const paleta = [...m.caja.querySelectorAll("[data-constructor] button")].map((b) => b.textContent.trim()).filter((t) => D.PALETA_H8.includes(t));
      assert.deepEqual(paleta, D.PALETA_H8, "la paleta no son las seis cuentas en su orden");
      assert.equal(m.caja.querySelector("[data-asiento-completo]"), null, "el asiento correcto ya está antes de comprobar");
      assert.ok(!loQueHayEnElDom(m.caja).includes(nota.acierto));
      await armar(m.caja, debe, haber);
      await tocar(boton(m.caja, D.BOTON_H8.comprobar));
      assert.deepEqual(retro(m.caja), [D.reglaH8(nota, debe, haber).texto], regla);
      assert.equal(m.caja.querySelector("[data-panel]").dataset.panel, regla === "acierto" ? "acierto" : "error");
      assert.ok(m.caja.querySelector("[data-asiento-completo]"), "no sale el asiento correcto");
      assert.ok(m.caja.querySelector("[data-asiento-completo]").textContent.includes(cifra(nota.monto)));
    } finally { m.desmontar(); }
  }
});

test("★★★ etapa 3: el mayor con el saldo inicial y los cinco movimientos CORRECTOS (también si se falló la etapa 2); «Suma» y el saldo final solo después de comprobar", async () => {
  const s = D.SERIE_H8_2;
  const m = await montar({ items: { serie: s, partidas: s.partidas } });
  try {
    await jugarEtapa1(m, s);
    await jugarEtapa2(m, s, { mal: s.notas.map((x) => x.id) });
    const mayor = m.caja.querySelector("[data-mayor-h8]");
    assert.equal(mayor.dataset.comprobado, "no");
    assert.deepEqual([...mayor.querySelectorAll(`[data-mayor="${D.DEBE}"] [data-monto]`)].map((x) => n(x.textContent)), [s.libros, ...s.notas.filter((x) => x.tipo === "credito").map((x) => x.monto)]);
    assert.deepEqual([...mayor.querySelectorAll(`[data-mayor="${D.HABER}"] [data-monto]`)].map((x) => n(x.textContent)), s.notas.filter((x) => x.tipo === "debito").map((x) => x.monto));
    assert.doesNotMatch(mayor.textContent, /Suma/);
    for (const c of [s.libros + s.credito, s.debito, s.saldoMayor].map(cifra)) assert.ok(!loQueHayEnElDom(m.caja).includes(c), `antes de comprobar ya está ${c}`);
    assert.equal(m.caja.querySelector("[data-dato-etapa3]").textContent, s.datoEtapa3);
    await escribir(m.caja.querySelector('[data-campo="mayor"] input'), cifra(s.saldoMayor));
    await tocar(boton(m.caja, D.BOTON_H8.comprobarSaldo));
    const despues = m.caja.querySelector("[data-mayor-h8]");
    assert.equal(despues.dataset.comprobado, "si");
    assert.deepEqual([...despues.querySelectorAll(".t4my-r")].map((x) => x.textContent.trim()).filter(Boolean), ["Saldo", "Suma", "Suma", "Saldo"]);
    assert.ok(despues.textContent.includes(cifra(s.libros + s.credito)) && despues.textContent.includes(cifra(s.debito)) && despues.textContent.includes(cifra(s.saldoMayor)));
  } finally { m.desmontar(); }
});

test("★★★ etapa 3: cada cifra de error del paquete sale con su mensaje; cualquier otra, el general; el campo vacío da un aviso gris y NO gasta el intento", async () => {
  const s = D.SERIE_H8_1;
  const casos = [...s.erroresEtapa3.map((e) => [e.cifra, e.texto]), [123, s.otroEtapa3]];
  for (const [v, texto] of casos) {
    const m = await montar();
    try {
      await jugarEtapa1(m, s);
      await jugarEtapa2(m, s);
      if (v === 123) {
        await tocar(boton(m.caja, D.BOTON_H8.comprobarSaldo));
        assert.equal(m.caja.querySelector("[data-aviso]").textContent, D.FALTA_SALDO);
        assert.equal(m.caja.querySelector("[data-panel]"), null, "el aviso gastó el intento");
      }
      await escribir(m.caja.querySelector('[data-campo="mayor"] input'), cifra(v));
      await tocar(boton(m.caja, D.BOTON_H8.comprobarSaldo));
      assert.deepEqual(retro(m.caja), [texto]);
      assert.equal(m.caja.querySelector('[data-campo="mayor"] input').disabled, true, "un intento");
    } finally { m.desmontar(); }
  }
});

test("★★★ al terminar: el cierre y su pie, y onCompletar con quince puntos (nueve, cinco y uno) y el detalle de las tres etapas", async () => {
  const s = D.SERIE_H8_1;
  const m = await montar();
  try {
    await jugarEtapa1(m, s, { mal: [s.partidas[0].id] });
    await jugarEtapa2(m, s, { mal: [s.notas[0].id] });
    await escribir(m.caja.querySelector('[data-campo="mayor"] input'), String(s.saldoMayor));
    await tocar(boton(m.caja, D.BOTON_H8.comprobarSaldo));
    await tocar(seguir(m.caja));
    assert.equal(m.completados.length, 1);
    const [pct, , detalle] = m.completados[0];
    assert.equal(pct, (13 / 15) * 100);
    assert.equal(detalle.length, 15);
    assert.deepEqual(detalle.map((d) => d.item), [...s.partidas.map((p) => p.id), ...s.notas.map((x) => `asiento-${x.id}`), "saldo-mayor"]);
    assert.deepEqual(detalle[9], { item: "asiento-s1-5", ok: false, intentos: 1, respuesta: `${s.notas[0].haber} / ${s.notas[0].debe}`, orden: 10 });
    assert.equal(m.caja.querySelector("[data-resumen]").textContent, D.resumenH8(13, 15));
    assert.equal(m.caja.querySelector("[data-cierre]").textContent, D.CIERRE_H8.texto);
    assert.equal(m.caja.querySelector("[data-pie-cierre]").textContent, D.CIERRE_H8.pie);
  } finally { m.desmontar(); }
});

test("★★★ en la página del juego hay exactamente UN [data-t4-h8]: la partida; la demo de «Así se juega» lleva el suyo propio", async () => {
  try { globalThis.localStorage.clear(); } catch { /* sin almacenamiento, sale igual */ }
  const caja = document.createElement("div");
  document.body.appendChild(caja);
  const raiz = createRoot(caja);
  await act(async () => {
    raiz.render(h(AuthContext.Provider, { value: { usuario: null, pedirCuenta: () => {} } },
      h(ContabilidadT4View, { modo: HACER, nodoInicial: D.H8_ID, onBack: () => {} })));
  });
  try {
    assert.ok(caja.querySelector("[data-asj-demo]"), "no salió el «Así se juega»");
    assert.equal(caja.querySelectorAll("[data-t4-h8-demo]").length, 1);
    assert.equal(caja.querySelectorAll("[data-t4-h8]").length, 1);
    const juego = caja.querySelector("[data-t4-h8]");
    assert.ok(juego.closest("[data-partida]"));
    assert.ok(["s1", "s2"].includes(juego.dataset.serie));
    /* Tampoco en la página entera, con la demo montada, está el conciliado ni el extracto de ninguna serie. */
    for (const s of D.SERIES_H8) for (const x of prohibidos(s)) assert.ok(!loQueHayEnElDom(caja).includes(x), `la página ya trae «${x.slice(0, 40)}»`);
  } finally { act(() => raiz.unmount()); caja.remove(); }
});

/* ═══════════ 3 · CAMINO, CATÁLOGO, PANEL Y «ASÍ SE JUEGA» ═══════════ */

test("★★★ en T4, la última, justo después de H7: evaluativa, experto, 90 FP; la vista lo abre", () => {
  assert.deepEqual(clasificacionDe("contabilidad", TEMA_T4, D.H8_ID), { tipo: HACER, modalidad: "evaluativa", dificultad: "experto", fpBase: 90 });
  const ids = TEMA.actividades.map((x) => x.id);
  assert.equal(ids.indexOf(D.H8_ID), ids.indexOf("t4-concilia-la-cuenta") + 1);
  assert.equal(ids.at(-1), D.H8_ID);
  assert.deepEqual(JUEGOS_T4.map((j) => j.id).sort(), actividadesDeTipo(TEMA, HACER).filter((a) => !a.pendiente).map((a) => a.id).sort());
  assert.equal(JUEGOS_T4.find((j) => j.id === D.H8_ID).Mecanica, SeAsientaONo);
  assert.equal(PAQ.match(/\| Etiqueta del panel docente \| «([^»]+)» \|/)[1], `${D.H8.nombre} · ${TEMA.title}`);
});

test("★★★ la 0207: del rango de la célula, un insert aditivo y repetible, con una etapa (no es un desafío), su comprobación y su deshacer escrito sin correr", () => {
  assert.match(MIGRACION, /\('t4-se-asienta-o-no',\s*'contabilidad',\s*'efectivo-caja-menor-bancos',\s*'evaluativa',\s*'experto',\s*90,\s*1\)/);
  assert.match(MIGRACION, /on conflict \(activity_id\) do nothing;/);
  const sentencias = MIGRACION.split("\n").filter((l) => !l.trim().startsWith("--")).join("\n");
  assert.doesNotMatch(sentencias, /\b(alter|update|delete|drop|truncate)\b/i);
  assert.match(sentencias, /select activity_id[\s\S]*where activity_id = 't4-se-asienta-o-no';\s*$/);
  assert.match(MIGRACION, /^--\s+delete from public\.actividad_catalogo where activity_id = 't4-se-asienta-o-no';$/m);
  assert.match(MIGRACION, /^-- 0207 — CONTABILIDAD, T4: H8 «¿SE ASIENTA O NO\?» \(Célula D\)$/m);
  assert.doesNotMatch(MIGRACION, /concilia-la-cuenta|'dificil'/);
  const dir = new URL("supabase/migrations/", RAIZ);
  const archivos = readdirSync(dir);
  assert.ok(archivos.includes("0001_profiles.sql"));
  assert.deepEqual(archivos.filter((f) => readFileSync(new URL(f, dir), "utf8").includes(D.H8_ID)), ["0207_t4_se_asienta_o_no.sql"]);
  assert.deepEqual(archivos.filter((f) => f.startsWith("0207")), ["0207_t4_se_asienta_o_no.sql"]);
});

test("★★★ el panel docente: los quince item_id de una partida tienen etiqueta, y la regla vive en el bloque de T4", () => {
  for (const s of D.SERIES_H8) {
    for (const p of s.partidas) assert.equal(etiquetaDeItem(D.H8_ID, p.id), recortar(p.texto), p.id);
    for (const x of s.notas) assert.equal(etiquetaDeItem(D.H8_ID, `asiento-${x.id}`), recortar(x.texto), x.id);
  }
  assert.equal(etiquetaDeItem(D.H8_ID, "saldo-mayor"), recortar(D.MAYOR_H8.campo));
  const fuente = leer("src/docente/etiquetasItem.js");
  const bloque = fuente.slice(fuente.indexOf("── T4 «Efectivo, caja menor y bancos» (Célula D) ──"), fuente.indexOf("── Repaso del capítulo 5 (Célula E) ──"));
  assert.match(bloque, /"t4-se-asienta-o-no": \(id\) => itemDeT4H8\(id\),/);
});

test("★★★ «Así se juega»: pasos, ejemplo y texto alternativo de Katsumi; el ejemplo no es de ninguna serie y NO se asienta; la mano TOCA «No se asienta» y acierta", async () => {
  const asi = ASI_SE_JUEGA[D.H8_ID];
  assert.ok(asi);
  const sec = ASI.slice(ASI.indexOf("## H8 · "), ASI.indexOf("## Lo que es mío"));
  assert.deepEqual([...sec.matchAll(new RegExp(`^  \\d\\. ${CITA}`, "gm"))].map((m) => m[1]), asi.pasos);
  assert.equal(D.EJEMPLO_H8.texto, sec.match(new RegExp(`\\*\\*Ejemplo \\(\`demo\`\\):\\*\\* ${CITA}`))[1]);
  assert.equal(asi.alt, sec.match(new RegExp(`\\*\\*Texto alternativo \\(\`alt\`\\):\\*\\* ${CITA}`))[1]);
  assert.match(sec, /La mano arrastra la tarjeta a «No se asienta»\./);
  assert.equal(D.EJEMPLO_H8.respuesta, D.NO_SE_ASIENTA);
  assert.ok(!D.SERIES_H8.some((s) => s.partidas.some((p) => p.texto === D.EJEMPLO_H8.texto)));
  assert.equal(asi.consigna, D.H8.consignaComun);
  assert.deepEqual(asi.guion.toques.map((x) => x.en), [`[data-opcion="${D.NO_SE_ASIENTA}"] button`]);
  const m = await montar({ modoDemo: true, ...asi.demo });
  try {
    assert.equal(m.caja.querySelector("[data-par]"), null, "la demo pinta el par de una serie");
    for (const toque of asi.guion.toques) await tocar(m.caja.querySelector(toque.en));
    assert.equal(m.caja.querySelector("[data-panel]").dataset.panel, "acierto");
    assert.equal(seguir(m.caja), null);
    assert.equal(m.completados.length, 0);
  } finally { m.desmontar(); }
});
