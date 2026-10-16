import { test } from "node:test";
import assert from "node:assert/strict";
import { readFileSync, readdirSync } from "node:fs";
import { JSDOM, VirtualConsole } from "jsdom";

/*
 * ═══════════════════════════════════════════════════════════════════════════
 * TEMA 3 · ACT. 3 — «El mismo hecho, dos empresas» (paquete de Levi, 2026-10-13).
 *
 *   · un par es acierto SOLO con las 4 casillas bien; con 3 de 4 vale 0, y
 *     cada casilla lleva su propia señal
 *   · el orden de prioridad de los errores: A, D, C, B y el del par
 *   · el orden alfabético de cada hoja; en el par 3, «Caja» segunda
 *   · el resumen: «X de 4 al primer intento. Cada par valía 25.00 %.»
 *   · los nombres de cuenta: publicados o de la lista de los cinco nuevos,
 *     y ninguno escrito de dos formas
 *   · las empresas, escritas como en lo publicado
 * ═══════════════════════════════════════════════════════════════════════════
 */

const dom = new JSDOM("<!doctype html><html><body></body></html>", { url: "http://localhost/", virtualConsole: new VirtualConsole() });
const w = dom.window;
w.matchMedia = (q) => ({ matches: false, media: q, addEventListener() {}, removeEventListener() {}, addListener() {}, removeListener() {} });
w.Element.prototype.scrollIntoView = () => {};
w.scrollTo = () => {};
for (const [k, v] of Object.entries({
  window: w, document: w.document, navigator: w.navigator, localStorage: w.localStorage,
  HTMLElement: w.HTMLElement, Element: w.Element, Node: w.Node, SVGElement: w.SVGElement,
  Event: w.Event, MouseEvent: w.MouseEvent, KeyboardEvent: w.KeyboardEvent,
  getComputedStyle: w.getComputedStyle.bind(w), matchMedia: w.matchMedia, scrollTo: w.scrollTo,
})) {
  Object.defineProperty(globalThis, k, { value: v, configurable: true, writable: true });
}
globalThis.IS_REACT_ACT_ENVIRONMENT = true;

const React = await import("react");
const { createRoot } = await import("react-dom/client");
const act = React.act;
const h = React.createElement;

const D = await import("../../data/contabilidadTema3Act3.js");
const L = await import("../mismoHecho.js");
const { default: MismoHecho } = await import("../../components/mecanicas/libros/tema3/MismoHecho.jsx");
const { SUBJECTS, HACER } = await import("../../data/subjects.js");
const { JUEGOS } = await import("../../components/ContabilidadTema3View.jsx");
const { ASI_SE_JUEGA } = await import("../../data/asiSeJuega.js");
const { REGLAS } = await import("../../docente/etiquetasItem.js");

const { PARES_ACT3, ERRORES_ACT3, UI } = D;
const [P1, P2, P3, P4] = PARES_ACT3;
const bien = (par) => par.empresas.map((e) => ({ debe: e.debe, haber: e.haber }));

/* ═══════════════════ LA TABLA DE CONTROL ═══════════════════ */

test("★★★ los cuatro pares son los de la tabla de control de Levi", () => {
  const tabla = PARES_ACT3.map((p) => [p.titulo, p.monto, p.pie, ...p.empresas.map((e) => [e.nombre, e.debe, e.haber, ...e.senuelos])]);
  assert.deepEqual(tabla, [
    ["La máquina", 2500, "Libro, pp. 140 y 142",
      ["San Calixto", "Gasto alquiler", "Alquiler por pagar", "Servicios por cobrar", "Ingresos por servicios", "Alquiler pagado por anticipado"],
      ["San Miguel", "Servicios por cobrar", "Ingresos por servicios", "Gasto alquiler", "Alquiler por pagar", "Servicios recibidos por anticipado"]],
    ["El arriendo", 5000, "Libro, pp. 144 y 146",
      ["San Calixto", "Gastos arriendos", "Arriendos pagados por anticipado", "Arriendos recibidos por anticipado", "Ingresos por arriendos", "Arriendos por pagar"],
      ["Arriendos de la Costa", "Arriendos recibidos por anticipado", "Ingresos por arriendos", "Gastos arriendos", "Arriendos pagados por anticipado", "Arriendos por cobrar"]],
    ["Los equipos", 1800000, "Basado en el libro, p. 174",
      ["La Gata Caliente", "Gasto alquiler", "Alquiler por pagar", "Servicios por cobrar", "Ingresos por servicios", "Caja"],
      ["Home Mark", "Servicios por cobrar", "Ingresos por servicios", "Gasto alquiler", "Alquiler por pagar", "Caja"]],
    ["El servicio anticipado", 120000, "Basado en el libro, p. 172",
      ["Servicios del Caribe", "Servicios recibidos por anticipado", "Ingresos por servicios", "Gasto servicios contratados", "Servicios pagados por anticipado", "Servicios por cobrar"],
      ["La empresa cliente", "Gasto servicios contratados", "Servicios pagados por anticipado", "Servicios recibidos por anticipado", "Ingresos por servicios", "Servicios por pagar"]],
  ]);
  /* Los montos del hecho están escritos en él, tal como se muestran. */
  assert.match(P1.hecho, /\$2\.500/);
  assert.match(P2.hecho, /\$5\.000/);
  assert.match(P3.hecho, /\$1\.800\.000/);
  assert.match(P4.hecho, /\$120\.000/);
});

/* ═══════════════════ EL PUNTAJE: TODO O NADA ═══════════════════ */

test("★★★ un par es acierto SOLO con las 4 casillas bien; con 3 de 4 vale 0 y cada casilla lleva su señal", () => {
  for (const par of PARES_ACT3) {
    const r = L.evaluarPar(par, bien(par));
    assert.equal(r.ok, true, par.id);
    assert.deepEqual(r.textos, [par.acierto]);
    assert.deepEqual(r.casillas.map((c) => c.ok), [true, true, true, true]);
    /* Cada una de las 4 casillas, mal sola: el par vale 0 y solo esa casilla está mal. */
    for (let k = 0; k < 4; k++) {
      const [e, lado] = L.ORDEN_DE_LECTURA[k];
      const otra = L.hojaDe(par.empresas[e]).find((n) => n !== par.empresas[e][lado] && n !== par.empresas[e][lado === "debe" ? "haber" : "debe"]);
      const el = bien(par);
      el[e] = { ...el[e], [lado]: otra };
      const m = L.evaluarPar(par, el);
      assert.equal(m.ok, false, `${par.id} · ${k}`);
      assert.deepEqual(m.casillas.map((c) => c.ok), [0, 1, 2, 3].map((j) => j !== k), `${par.id} · ${k}`);
      assert.equal(L.puntuarAct3([{ ok: m.ok }], 1), 0);
      assert.equal(m.lineas.length, 1);
    }
  }
  assert.equal(L.puntuarAct3([{ ok: true }, { ok: false }, { ok: true }, { ok: true }], 4), 75);
});

/* ═══════════════════ EL ORDEN DE LOS ERRORES ═══════════════════ */

test("★★★ el orden de prioridad de los errores: A, D, C, B y el del par, con un caso de cada uno", () => {
  /* A: los dos asientos iguales (aunque haya otras cosas mal). */
  const iguales = [{ debe: "Gasto alquiler", haber: "Alquiler por pagar" }, { debe: "Gasto alquiler", haber: "Alquiler por pagar" }];
  assert.equal(L.evaluarPar(P1, iguales).caso, D.IGUALES);
  /* D: «Caja» en el par 3 (gana a C, B y el del par). */
  const conCaja = bien(P3); conCaja[1] = { debe: "Servicios por cobrar", haber: "Caja" };
  assert.equal(L.evaluarPar(P3, conCaja).caso, D.CAJA_SENUELO);
  /* C: la cuenta del tipo de ajuste contrario. */
  const contrario = bien(P1); contrario[0] = { debe: "Gasto alquiler", haber: "Alquiler pagado por anticipado" };
  assert.equal(L.evaluarPar(P1, contrario).caso, D.CONTRARIO);
  const contrario4 = bien(P4); contrario4[1] = { debe: "Servicios por pagar", haber: "Servicios pagados por anticipado" };
  assert.equal(L.evaluarPar(P4, contrario4).caso, D.CONTRARIO);
  /* B: cuentas correctas, lados cambiados en una empresa. */
  const cambiada = bien(P2); cambiada[1] = { debe: "Ingresos por arriendos", haber: "Arriendos recibidos por anticipado" };
  assert.equal(L.evaluarPar(P2, cambiada).caso, D.LADOS_CAMBIADOS);
  /* El del par: una cuenta de la otra empresa. */
  const deLaOtra = bien(P1); deLaOtra[1] = { debe: "Gasto alquiler", haber: "Ingresos por servicios" };
  assert.equal(L.evaluarPar(P1, deLaOtra).caso, D.DEL_PAR);
  /* Prioridad entre los que coinciden: A gana a D; D gana a C; C gana a B. */
  assert.equal(L.evaluarPar(P3, [{ debe: "Caja", haber: "Alquiler por pagar" }, { debe: "Caja", haber: "Alquiler por pagar" }]).caso, D.IGUALES);
  const dYc = bien(P3); dYc[0] = { debe: "Caja", haber: "Alquiler por pagar" };
  assert.equal(L.evaluarPar(P3, dYc).caso, D.CAJA_SENUELO);
  const cYb = bien(P1); cYb[0] = { debe: "Alquiler por pagar", haber: "Gasto alquiler" }; cYb[1] = { debe: "Servicios por cobrar", haber: "Servicios recibidos por anticipado" };
  assert.equal(L.evaluarPar(P1, cYb).caso, D.CONTRARIO);
  /* Los textos: el del caso, después el acierto, y las líneas de cada casilla mal. */
  const r = L.evaluarPar(P1, deLaOtra);
  assert.deepEqual(r.textos, [P1.errorPar, P1.acierto]);
  assert.deepEqual(r.lineas, ["San Miguel · Debe: va Servicios por cobrar."]);
  assert.deepEqual(L.evaluarPar(P1, iguales).textos, [ERRORES_ACT3.A, P1.acierto]);
  assert.deepEqual(L.evaluarPar(P1, iguales).lineas, ["San Miguel · Debe: va Servicios por cobrar.", "San Miguel · Haber: va Ingresos por servicios."]);
});

/* ═══════════════════ LAS HOJAS ═══════════════════ */

test("★★★ cada hoja va en orden alfabético; en el par 3, «Caja» queda segunda", () => {
  for (const par of PARES_ACT3) {
    for (const e of par.empresas) {
      const hoja = L.hojaDe(e);
      assert.equal(hoja.length, 5);
      assert.deepEqual(hoja, [...hoja].sort((a, b) => a.localeCompare(b, "es")));
      assert.equal(new Set(hoja).size, 5, `${e.nombre}: un nombre repetido`);
    }
  }
  for (const e of P3.empresas) assert.equal(L.hojaDe(e)[1], "Caja", e.nombre);
  assert.deepEqual(L.hojaDe(P3.empresas[0]), ["Alquiler por pagar", "Caja", "Gasto alquiler", "Ingresos por servicios", "Servicios por cobrar"]);
  /* El orden es el del español (localeCompare), no el de los códigos: una tilde inicial no manda la cuenta al final. */
  assert.deepEqual(L.hojaDe({ debe: "Ítem", haber: "Juan", senuelos: ["Ana", "Zeta", "Óscar"] }), ["Ana", "Ítem", "Juan", "Óscar", "Zeta"]);
});

/* ═══════════════════ LOS NOMBRES ═══════════════════ */

test("★★★ todo nombre de cuenta está publicado o es de los cinco nuevos, y ninguno aparece escrito de dos formas", () => {
  const nombres = new Set([...PARES_ACT3, D.EJEMPLO_ACT3].flatMap((p) => p.empresas.flatMap((e) => [e.debe, e.haber, ...e.senuelos])));
  /* Lo publicado: todos los datos de Contabilidad, menos esta actividad. */
  const dir = new URL("../../data/", import.meta.url);
  const publicado = readdirSync(dir).filter((f) => /^contabilidad.*\.js$/.test(f) && f !== "contabilidadTema3Act3.js")
    .map((f) => readFileSync(new URL(f, dir), "utf8")).join("\n");
  for (const n of nombres) {
    const esta = publicado.includes(`"${n}"`) || publicado.includes(`«${n}»`) || publicado.includes(` ${n} `) || publicado.includes(`${n}.`);
    assert.ok(esta || D.CUENTAS_NUEVAS_ACT3.includes(n), `«${n}» no está publicado ni en la lista de los cinco nuevos`);
  }
  assert.deepEqual(D.CUENTAS_NUEVAS_ACT3.filter((n) => nombres.has(n)), D.CUENTAS_NUEVAS_ACT3, "los cinco nuevos se usan");
  /* Ninguno escrito de dos formas: mismas letras sin tildes ni mayúsculas, distinta escritura. */
  const clave = (n) => n.normalize("NFD").replace(/\p{M}/gu, "").toLowerCase().replace(/\s+/g, " ");
  const porClave = new Map();
  for (const n of nombres) {
    const k = clave(n);
    assert.ok(!porClave.has(k) || porClave.get(k) === n, `«${n}» y «${porClave.get(k)}» son la misma cuenta escrita de dos formas`);
    porClave.set(k, n);
  }
  /* Esta prueba puede fallar: una variante con otra tilde o mayúscula se caza. */
  assert.equal(clave("Gasto Interes"), clave("Gasto interés"));
});

test("★★ las empresas, escritas igual que en lo ya publicado", () => {
  const dir = new URL("../../data/", import.meta.url);
  const publicado = readdirSync(dir).filter((f) => /\.js$/.test(f) && f !== "contabilidadTema3Act3.js")
    .map((f) => readFileSync(new URL(f, dir), "utf8")).join("\n");
  for (const n of ["San Calixto", "San Miguel", "Arriendos de la Costa", "Servicios del Caribe"]) assert.ok(publicado.includes(n), n);
  /* Las nuevas de este paquete: no aparecen antes, ni con otra escritura. */
  for (const n of ["La Gata Caliente", "Home Mark"]) {
    assert.ok(!new RegExp(n.split(" ").join("\\s*"), "i").test(publicado.replace(n, "")), `${n} ya existe escrito de otra forma`);
  }
});

/* ═══════════════════ EN PANTALLA ═══════════════════ */

const montar = async (props = {}) => {
  const caja = document.createElement("div");
  document.body.appendChild(caja);
  const raiz = createRoot(caja);
  await act(async () => { raiz.render(h(MismoHecho, { Marco: ({ children }) => h("div", null, children), ...props })); });
  return { caja, desmontar: () => { act(() => raiz.unmount()); caja.remove(); } };
};
const clic = async (el) => { assert.ok(el, "no está el elemento"); await act(async () => { el.click(); }); await act(async () => { await new Promise((r) => setTimeout(r, 200)); }); };
const q = (s) => document.querySelector(s);
const poner = async (casilla, cuenta) => {
  await clic(q(`[data-casilla="${casilla}"]`));
  await clic(q(`[data-opcion="${cuenta}"]`));
};
const llenar = async (el) => {
  for (const [k, [e, lado]] of L.ORDEN_DE_LECTURA.entries()) await poner(`${e}:${lado}`, el[e][lado]);
};

test("★★★ en pantalla: «Comprobar» con aria-disabled y su pista; un solo intento; señal por casilla; el resumen", async () => {
  let entrega = null;
  const m = await montar({ onCompletar: (...a) => { entrega = a; } });
  try {
    const comprobar = q("[data-comprobar]");
    assert.equal(comprobar.getAttribute("aria-disabled"), "true");
    assert.equal(comprobar.hasAttribute("disabled"), false, "nunca el atributo disabled");
    assert.equal(document.getElementById(comprobar.getAttribute("aria-describedby")).textContent, UI.completa);
    assert.equal(q("[data-estado-vacio]").textContent, D.ESTADO_VACIO);
    assert.equal(q("[data-casilla='0:debe']").getAttribute("aria-label"), "San Calixto, Debe: vacía. $2.500");
    /* Con casillas vacías, «Comprobar» no hace nada. */
    await clic(comprobar);
    assert.equal(q("[data-panel]"), null);

    /* Par 1: una casilla mal. */
    const el1 = bien(P1); el1[1] = { ...el1[1], haber: "Servicios recibidos por anticipado" };
    await poner("0:debe", el1[0].debe);
    assert.equal(q("[data-estado-vacio]"), null, "el estado vacío se va con la primera colocación");
    assert.equal(q("[data-anuncio]").textContent, "Gasto alquiler en el Debe de San Calixto");
    await poner("0:haber", el1[0].haber); await poner("1:debe", el1[1].debe); await poner("1:haber", el1[1].haber);
    assert.equal(q("[data-comprobar]").getAttribute("aria-disabled"), null);
    await clic(q("[data-comprobar]"));
    assert.equal(q("[data-panel]").dataset.caso, D.CONTRARIO);
    assert.equal(q("[data-titulo-panel]").textContent, "Revisa 1 casilla");
    assert.deepEqual([...document.querySelectorAll("[data-estado-casilla]")].map((x) => x.dataset.estadoCasilla), ["bien", "bien", "bien", "error"]);
    assert.equal(q("[data-casilla='1:haber']").getAttribute("aria-label"), "San Miguel, Haber: elegiste Servicios recibidos por anticipado. No va aquí. Iba aquí: Ingresos por servicios.");
    assert.equal(q("[data-casilla='1:haber']").getAttribute("aria-disabled"), "true");
    /* Un solo intento: tocar una casilla ya no abre la hoja. */
    await clic(q("[data-casilla='0:debe']"));
    assert.equal(q("[data-hoja]"), null);
    await clic([...document.querySelectorAll("button")].find((b) => b.textContent === UI.siguientePar));

    /* Pares 2 a 4, bien. */
    for (const par of [P2, P3, P4]) {
      assert.equal(q("[data-titulo-par]").textContent, par.titulo);
      await llenar(bien(par));
      await clic(q("[data-comprobar]"));
      assert.equal(q("[data-titulo-panel]").textContent, UI.correcto);
      assert.equal(q("[data-anuncio]").textContent, D.ALT_ACIERTO);
      const sig = par === P4 ? UI.verResumen : UI.siguientePar;
      await clic([...document.querySelectorAll("button")].find((b) => b.textContent === sig));
    }
    const [pct, , detalle] = entrega;
    assert.equal(pct, 75);
    assert.deepEqual(detalle.map((d) => [d.item, d.ok, d.respuesta]), [["maquina", false, "C"], ["arriendo", true, null], ["equipos", true, null], ["servicio", true, null]]);
    assert.match(m.caja.textContent, /3 de 4 al primer intento\. Cada par valía 25\.00 %\./);
    assert.match(m.caja.textContent, new RegExp(D.CIERRE_ACT3));
  } finally { m.desmontar(); }
});

test("★★ la hoja: el valor puesto dice «Elegida»; el de la otra casilla, «Está en el…»; elegirlo lo mueve; Escape cancela", async () => {
  const m = await montar();
  try {
    await poner("0:debe", "Gasto alquiler");
    await clic(q("[data-casilla='0:debe']"));
    const puesta = q('[data-opcion="Gasto alquiler"]');
    assert.equal(puesta.getAttribute("aria-checked"), "true");
    assert.equal(puesta.querySelector("[data-elegida]").textContent, UI.elegida);
    assert.equal(puesta.querySelector("svg"), null, "la fila elegida no lleva ícono");
    await act(async () => { q("[data-hoja]").dispatchEvent(new w.KeyboardEvent("keydown", { key: "Escape", bubbles: true })); });
    await act(async () => { await new Promise((r) => setTimeout(r, 200)); });
    assert.equal(q("[data-hoja]"), null);
    /* En el Haber, «Gasto alquiler» dice que está en el Debe; elegirlo lo mueve y el Debe queda vacío. */
    await clic(q("[data-casilla='0:haber']"));
    assert.equal(q('[data-opcion="Gasto alquiler"] [data-en-la-otra]').textContent, UI.estaEnElDebe);
    await clic(q('[data-opcion="Gasto alquiler"]'));
    assert.equal(q("[data-casilla='0:debe']").dataset.estadoCasilla, "vacia");
    assert.equal(q("[data-casilla='0:haber'] [data-nombre-cuenta]").textContent, "Gasto alquiler");
  } finally { m.desmontar(); }
});

/* ═══════════════════ LA FILA DEL MONTO (Xeno) ═══════════════════ */

/*
 * Ancho de cada glifo del monto, medido en Chromium con Inter real (Google
 * Fonts) a 13 px, peso 500, cifras tabulares, el 2026-10-13. Sirve para
 * comprobar sin navegador que la fila cabe en el texto útil de la casilla a
 * 320 px. Un glifo que no está aquí (por ejemplo, la «M» de «Monto:») hace
 * fallar la prueba: la fila solo puede llevar la cifra.
 */
const GLIFO_MONTO = { $: 7.231, 0: 7.231, 1: 6.363, 2: 7.231, 3: 7.231, 4: 7.231, 5: 7.231, 6: 7.231, 7: 7.231, 8: 7.231, 9: 7.231, ".": 3.613 };
/* Casilla de 117 px a 320 − 8 + 8 de relleno − 2 + 2 de borde. */
const UTIL_320 = 97;
const anchoMonto = (texto) => [...texto].reduce((w, g) => {
  assert.ok(g in GLIFO_MONTO, `la fila del monto lleva «${g}», que no es parte de una cifra`);
  return w + GLIFO_MONTO[g];
}, 0);

test("★★★ la fila del monto dice SOLO la cifra —sin «Monto:» ni chevrón— y cabe en los 97 px a 320", async () => {
  const m = await montar();
  try {
    for (const estado of ["vacia", "llena"]) {
      if (estado === "llena") await poner("0:debe", "Gasto alquiler");
      const cas = q("[data-casilla='0:debe']");
      assert.equal(cas.querySelector("[data-monto-casilla]").textContent, "$2.500", estado);
      assert.ok(!cas.textContent.includes(UI.monto), `${estado}: «Monto:» dentro de la casilla`);
      assert.equal(cas.querySelectorAll("svg").length, 0, `${estado}: un ícono (chevrón) dentro de la casilla`);
    }
    /* «Monto:» se queda en la tarjeta del hecho. */
    assert.equal(q("[data-monto]").textContent, "Monto: $2.500");
  } finally { m.desmontar(); }
  /* Cada monto de la actividad, en el texto que pinta la casilla, cabe con margen. */
  for (const par of [...PARES_ACT3, D.EJEMPLO_ACT3]) {
    const { pesos } = await import("../queLeToca.js");
    const w = anchoMonto(pesos(par.monto));
    assert.ok(w < UTIL_320, `${pesos(par.monto)} mide ${w.toFixed(1)} px y no cabe en ${UTIL_320}`);
  }
  assert.ok(anchoMonto("$1.800.000") > 60, "la tabla de glifos mide de verdad");
  /* Puede fallar: con «Monto: » delante, la prueba se cae. */
  assert.throws(() => anchoMonto("Monto: $2.500"));
});

/* ═══════════════════ LOS REGISTROS ═══════════════════ */

test("★★ en el camino: nodo 5, entre «Arma el ajuste diferido» y «¿Qué le toca…?»; Análisis 50; tutorial y docente", () => {
  const tema = SUBJECTS.contabilidad.topics.find((t) => t.id === "ingresos-gastos-y-caja");
  const hacer = tema.actividades.filter((a) => a.clasificacion.tipo === HACER && !a.clasificacion.desafio).map((a) => a.id);
  assert.equal(hacer.indexOf("t3-mismo-hecho"), 4, "nodo 5");
  assert.equal(hacer[3], "t3-ajuste-diferido");
  assert.equal(hacer[5], "t3-que-le-toca");
  assert.deepEqual(tema.actividades.find((a) => a.id === "t3-mismo-hecho").clasificacion, { tipo: HACER, modalidad: "evaluativa", dificultad: "dificil", fpBase: 50 });
  assert.ok(JUEGOS.some((j) => j.id === "t3-mismo-hecho"));
  const asi = ASI_SE_JUEGA["t3-mismo-hecho"];
  assert.equal(`Ejemplo: ${asi.alt}`, D.ALT_TUTORIAL_ACT3);
  assert.deepEqual(asi.pasos, D.PASOS_ACT3);
  assert.equal(asi.demo.items[0].hecho, "La panadería le debe al Banco Andino $50.000 de intereses del mes y todavía no los paga.");
  assert.equal(REGLAS["t3-mismo-hecho"]("equipos"), P3.hecho);
});
