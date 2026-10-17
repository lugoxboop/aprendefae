import { test } from "node:test";
import assert from "node:assert/strict";
import { readFileSync, readdirSync } from "node:fs";
import { JSDOM, VirtualConsole } from "jsdom";
import { PAQUETE_N7, CORRECCIONES_N7, NUEVOS_N7, conCorreccionesN7 } from "./correccionesMelloN7.mjs";

/*
 * ═══════════════════════════════════════════════════════════════════════════
 * T5 · N7 «¿A qué cuenta va?» v2 (Célula C) · Hacer.
 *
 *   · cada texto es, letra por letra, el de la v2 de Near con la corrección
 *     N7-1 de Mello encima (correccionesMelloN7.mjs), en los dos sentidos:
 *     nada del paquete falta en los datos y nada de los datos falta en él
 *   · N7-1: el hecho 3 llega por transferencia y su línea de $75.000 va a
 *     Bancos · Debe; lo viejo no queda en ningún dato
 *   · las cifras son las del registro de T5, como números, y salen de sumar
 *   · la escalera (C2): 1.er error, la pista o la cifra reconocida; 2.º, la
 *     respuesta con su porqué (el de la ficha); solo suma el primer intento;
 *     diez unidades; el porcentaje es aciertos / 10; el detalle guarda el
 *     primer intento
 *   · la figura (C8): el libro gana el asiento de cada hecho al cerrarlo,
 *     nunca antes (E8); la cuenta T de Inversiones – títulos sube con la
 *     compra y no se mueve con el interés ni con el dividendo
 *   · «Vale el primer intento» en el distintivo, no en la consigna
 *   · evaluativa, medio, 25 FP, en el cliente y en la migración 0114; en T5
 *     después de N6 y antes del cierre de B; la vista lo abre; el panel
 *     docente lee cada unidad
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

const D = await import("../../data/contabilidadT5_n7.js");
const L = await import("../t5N7.js");
const A = await import("../armaLaLinea.js");
const { barajar } = await import("../../utils/barajar.js");
const { pesos } = await import("../../data/contabilidad.js");
const { SUBJECTS, HACER, actividadesDeTipo, clasificacionDe } = await import("../../data/subjects.js");
const { default: AQueCuentaVa } = await import("../../components/mecanicas/libros/t5/AQueCuentaVa.jsx");
const { JUEGOS, TEMA: TEMA_T5 } = await import("../../components/ContabilidadTema5View.jsx");
const { etiquetaDeItem, recortar } = await import("../../docente/etiquetasItem.js");

const RAIZ = new URL("../../../", import.meta.url);
const leer = (f) => readFileSync(new URL(f, RAIZ), "utf8");
const V2 = conCorreccionesN7(PAQUETE_N7);
const REGISTRO = JSON.parse(leer("orquestador/conocimiento/registro-cifras-construidas-t5.json"));
const MIGRACION = leer("supabase/migrations/0114_t5_a_que_cuenta_va.sql");
const TEMA = SUBJECTS.contabilidad.topics.find((t) => t.id === TEMA_T5);
const citas = (celda) => [...celda.matchAll(/«([^»]+)»/g)].map((m) => m[1]);
const cita = (celda) => { const c = citas(celda); assert.equal(c.length, 1, celda); return c[0]; };
const it = (id) => D.ITEMS_N7.find((x) => x.id === id);
const C = D.CIFRAS_N7;
const LADO = { debe: "Debe", haber: "Haber" };

/* La sección «## Hecho n · …» del paquete corregido. */
const SECCIONES = V2.split("\n## ").filter((s) => /^Hecho \d · /.test(s));
const seccion = (n) => SECCIONES.find((s) => s.startsWith(`Hecho ${n} · `));

/* Las filas de la tabla de una sección, sin cabecera ni separador. */
const tablaDe = (s) => s.split("\n").filter((l) => l.startsWith("| $")).map((l) => l.replace(/^\| | \|$/g, "").split(" | "));

/* ═══════════ 1 · TEXTOS ═══════════ */

test("★★★ cabecera, consigna, distintivo, pie y nombre: los de la v2, letra por letra", () => {
  assert.ok(V2.includes(`# T5 · N7 «${D.N7.nombre}» · versión 2`));
  assert.ok(V2.includes(`id \`${D.N7_ID}\``));
  assert.ok(V2.includes("Migración **0114**"));
  assert.ok(V2.includes("Hacer, Medio, evaluativa, 25 FP, **10 aciertos**"));
  assert.equal(cita(V2.split("\n").find((l) => l.startsWith("- Consigna: "))), D.N7.consigna);
  assert.equal(cita(V2.split("\n").find((l) => l.startsWith("- Distintivo: "))), D.N7.distintivo);
  assert.ok(V2.includes(`Pie: «${D.N7.pie}».`));
  assert.deepEqual(D.N7.enunciado, []);
  /* C5: la regla del intento no va en la consigna. */
  assert.doesNotMatch(D.N7.consigna, /intento/i);
});

test("★★★ los cuatro hechos, letra por letra (el 3, el de N7-1), y cada ítem lleva el suyo", () => {
  assert.equal(SECCIONES.length, 4);
  const hechos = [1, 2, 3, 4].map((n) => cita(seccion(n).split("\n").find((l) => l.startsWith("- Hecho: "))));
  assert.deepEqual(D.HECHOS_N7, hechos);
  assert.equal(D.HECHOS_N7[2], NUEVOS_N7.hecho3);
  /* La casilla lleva el hecho encima; cada asiento lo lleva como pregunta. */
  assert.deepEqual(D.ITEMS_N7.map((x) => [x.id, x.tipo, x.hecho]), [
    ["costo-de-la-compra", "cifra", 1], ["la-compra", "asiento", 1], ["el-cdt", "asiento", 2], ["el-dividendo", "asiento", 3], ["los-dos-juntos", "asiento", 4],
  ]);
  assert.equal(it("costo-de-la-compra").intro, D.HECHOS_N7[0]);
  for (const x of D.ITEMS_N7.filter((y) => y.tipo === "asiento")) assert.equal(x.pregunta, D.HECHOS_N7[x.hecho - 1], x.id);
  /* «Pensar, no emparejar»: ningún hecho nombra la cuenta ni dice interés o dividendo. */
  for (const t of D.HECHOS_N7) assert.doesNotMatch(t, /Caja|Bancos|banco|Inversiones|Ingresos|inter[eé]s|dividendo/i, t);
});

test("★★★ la casilla del hecho 1: pregunta, correcta, pista, cifras reconocidas, respuesta y acierto, en los dos sentidos", () => {
  const lineas = seccion(1).split("\n");
  const cab = lineas.find((l) => l.startsWith("- **Casilla de cifra**"));
  const x = it("costo-de-la-compra");
  assert.equal(cab.match(/\(correcta: \$([\d.]+)\)/)[1], pesos(x.correcta).slice(1));
  assert.equal(cita(cab), x.pregunta);
  const sub = lineas.slice(lineas.indexOf(cab) + 1).filter((l) => l.startsWith("  - "));
  const de = (k) => sub.filter((l) => l.startsWith(`  - ${k}`));
  assert.deepEqual(de("Pista: ").map(cita), [x.pista]);
  assert.deepEqual(de("Acierto: ").map(cita), [x.acierto]);
  assert.deepEqual(de("Si escribe ").map((l) => [l.match(/Si escribe \$([\d.]+):/)[1], cita(l)]), x.distractores.map((d) => [pesos(d.valor).slice(1), d.retro]));
  const [resp] = de("Respuesta (2.º error): ");
  /* El paquete de Near dice «La respuesta es $…»; el lote de dialecto C (R3, Watari, con el visto bueno de Mello) lo dice «Iba aquí: $…». */
  const enDialecto = (t) => t.replace(/^La respuesta es (\$[\d.]+\.)$/, "Iba aquí: $1");
  assert.match(citas(resp)[0], /^La respuesta es \$[\d.]+\.$/, "el paquete sigue como llegó");
  assert.deepEqual(citas(resp).map(enDialecto), [A.TEXTOS_ARMA.respuesta(x.correcta), x.porque]);
  /* Y nada más en la casilla: pista, dos cifras, respuesta y acierto. */
  assert.equal(sub.length, 5);
});

test("★★★ los cuatro asientos: por línea monto, cuenta, lado, dos distractores, pista y respuesta, en el orden del paquete", () => {
  for (const n of [1, 2, 3, 4]) {
    const x = D.ITEMS_N7.find((y) => y.tipo === "asiento" && y.hecho === n);
    const filas = tablaDe(seccion(n));
    assert.deepEqual(x.lineas.map((l) => [pesos(l.valor), `${l.cuenta} · ${LADO[l.lado]}`, l.distractores.join(" · "), l.pista, l.retro]),
      filas.map(([monto, correcta, malas, pista, resp]) => [monto, correcta, malas, cita(pista), cita(resp)]), x.id);
    const suma = (s) => x.lineas.filter((l) => l.lado === s).reduce((a, l) => a + l.valor, 0);
    assert.equal(suma("debe"), suma("haber"), x.id);
  }
  /* 1 + 2 + 2 + 2 + 3. */
  assert.deepEqual(D.ITEMS_N7.filter((y) => y.tipo === "asiento").map((y) => y.lineas.length), [2, 2, 2, 3]);
});

test("★★★ N7-1 de Mello: el hecho 3 llega por transferencia a Bancos; lo viejo del paquete no está en los datos", () => {
  const l = it("el-dividendo").lineas[0];
  assert.deepEqual([`${l.cuenta} · ${LADO[l.lado]}`, l.distractores.join(" · "), l.pista, l.retro, l.valor],
    [NUEVOS_N7.correcta, NUEVOS_N7.distractores, NUEVOS_N7.pista, NUEVOS_N7.respuesta, C.dividendo]);
  const datos = JSON.stringify(D.ITEMS_N7);
  for (const [, , vieja] of CORRECCIONES_N7) for (const t of citas(vieja)) assert.ok(!datos.includes(t), t);
  /* Ahora cada cobro decide entre Caja y Bancos: tres Caja seguidas ya no se copian del libro. */
  assert.deepEqual(D.ITEMS_N7.filter((y) => y.hecho > 1).map((y) => y.lineas[0].cuenta), ["Caja", "Bancos", "Caja"]);
  for (const y of D.ITEMS_N7.filter((z) => z.hecho > 1)) assert.ok(["Caja", "Bancos"].every((c) => [y.lineas[0].cuenta, ...y.lineas[0].distractores].includes(c)), y.id);
});

test("★★★ las pistas: 20 palabras o menos, sin la cifra ni ninguna cuenta; ninguna respuesta nombra la cuenta de otra línea", () => {
  const palabras = (t) => t.split(/\s+/).filter((x) => /[\p{L}\d]/u.test(x)).length;
  const cuentas = new Set(D.ITEMS_N7.flatMap((x) => (x.lineas ?? []).flatMap((l) => [l.cuenta, ...l.distractores])));
  assert.deepEqual([...cuentas].sort(), ["Bancos", "Caja", "Ingresos por dividendos", "Ingresos por intereses", "Inversiones – títulos"]);
  const casilla = it("costo-de-la-compra");
  assert.ok(palabras(casilla.pista) <= 20 && !casilla.pista.includes("2.184.000"));
  for (const x of D.ITEMS_N7.filter((y) => y.tipo === "asiento")) {
    for (const l of x.lineas) {
      assert.ok(palabras(l.pista) <= 20, `${x.id}:${l.id}`);
      for (const c of cuentas) assert.ok(!l.pista.includes(c), `${x.id}:${l.id} nombra ${c}`);
      for (const o of x.lineas.filter((y) => y !== l)) assert.ok(!l.retro.includes(o.cuenta), `${x.id}:${l.id} nombra ${o.cuenta}`);
      assert.equal(new Set([l.cuenta, ...l.distractores]).size, 3, `${x.id}:${l.id}`);
    }
  }
});

test("★★★ nada interno sale en pantalla", () => {
  const visibles = [D.N7.consigna, D.N7.distintivo, D.N7.pie, D.FIGURA_N7.titulo, D.FIGURA_N7.rotulo(1), ...D.HECHOS_N7,
    ...D.ITEMS_N7.flatMap((x) => [x.pregunta, x.intro ?? "", x.pista ?? "", x.acierto ?? "", x.porque ?? "", ...(x.distractores ?? []).map((d) => d.retro),
      ...(x.lineas ?? []).flatMap((l) => [l.cuenta, l.pista, l.retro])])].join("\n");
  for (const interno of ["CONSTRUCCIÓN", "construcción", "Near", "Mello", "Watari", "INFLESZ", "hueco", "PENDIENTE", "ESCRITO POR CLAUDE", "N7-1"]) assert.ok(!visibles.includes(interno), interno);
});

/* ═══════════ 2 · LAS CIFRAS ═══════════ */

test("★★★ las cifras: las del registro de T5, como números, y el costo y el total salen de sumar", () => {
  assert.deepEqual(D.calcularN7(), { precio: 2_150_000, gastos: 34_000, costo: 2_184_000, cdt: 96_000, dividendo: 75_000, bono: 58_000, acciones: 31_000, juntos: 89_000 });
  const reg = REGISTRO.construidas.filter((r) => r.pieza === D.N7_ID).map((r) => r.cifra).sort((a, b) => a - b);
  assert.deepEqual(Object.values(D.CIFRAS_N7).sort((a, b) => a - b), reg);
  /* Las que Near sacó de la v1 no están. */
  const todo = JSON.stringify([D.N7, D.HECHOS_N7, D.ITEMS_N7, D.CIFRAS_N7]);
  for (const v of [670_000, 1_480_000, 21_000, 1_501_000]) assert.ok(!todo.includes(String(v)) && !todo.includes(pesos(v)), String(v));
  /* Cada monto de línea es una cifra del registro. */
  for (const x of D.ITEMS_N7.filter((y) => y.tipo === "asiento")) for (const l of x.lineas) assert.ok(reg.includes(l.valor), `${x.id}:${l.id}`);
});

/* ═══════════ 3 · LA ESCALERA, SIN REACT ═══════════ */

test("★★★ la escalera de la casilla: la cifra reconocida o la pista; luego la respuesta con el porqué de la ficha", () => {
  const x = it("costo-de-la-compra");
  const base = { correcta: C.costo, textoCorrecta: "$2.184.000" };
  assert.deepEqual(L.evaluarN7(x, C.costo, 1), { ok: true, cerrado: true, textos: [x.acierto], ...base });
  assert.deepEqual(L.evaluarN7(x, C.precio, 1), { ok: false, cerrado: false, textos: ["Ese es solo el precio. Faltan los gastos del proceso de la compra."], ...base });
  assert.deepEqual(L.evaluarN7(x, C.gastos, 1).textos, ["Esos son solo los gastos. Se suman al precio."]);
  assert.deepEqual(L.evaluarN7(x, 7, 1), { ok: false, cerrado: false, textos: [x.pista], ...base });
  assert.deepEqual(L.evaluarN7(x, C.precio, 2), { ok: false, cerrado: true, textos: ["Iba aquí: $2.184.000.", "Los gastos del proceso de la compra van al costo: $2.150.000 + $34.000."], ...base });
  assert.deepEqual(L.evaluarN7(x, C.costo, 2).ok, true);
});

test("★★ `porque` es opcional: sin él, la escalera da el acierto sin su «Así es.», como antes", () => {
  const sin = { correcta: 10, acierto: "Así es: 5 + 5 = 10.", pista: "p", distractores: [] };
  assert.deepEqual(A.evaluarCifraConEscalera(sin, 7, 2).textos, ["Iba aquí: $10.", "5 + 5 = 10."]);
  assert.deepEqual(A.evaluarCifraConEscalera({ ...sin, porque: "Porque sí." }, 7, 2).textos, ["Iba aquí: $10.", "Porque sí."]);
});

/* ═══════════ 4 · LA MECÁNICA, MONTADA ═══════════ */

const EN_ORDEN = L.prepararN7((xs) => [...xs]);
const Marco = ({ children }) => h("div", { "data-marco": true }, children);
const montar = async (props = {}) => {
  const caja = document.createElement("div");
  document.body.appendChild(caja);
  const raiz = createRoot(caja);
  const completados = [];
  await act(async () => { raiz.render(h(AQueCuentaVa, { Marco, onCompletar: (...a) => completados.push(a), items: EN_ORDEN, ...props })); });
  await act(async () => { await new Promise((r) => setTimeout(r, 5)); });
  return { caja, completados, desmontar: () => { act(() => raiz.unmount()); caja.remove(); } };
};
const tocar = async (el) => {
  assert.ok(el, "no está el elemento que se quería tocar");
  await act(async () => { el.dispatchEvent(new w.MouseEvent("click", { bubbles: true })); });
};
const boton = (caja, texto) => [...caja.querySelectorAll("button")].find((b) => b.textContent === texto);
const escribir = async (caja, id, valor) => {
  const i = caja.querySelector(`[data-campo-cifra="${id}"]`);
  assert.ok(i, `no está la casilla de ${id}`);
  await act(async () => {
    Object.getOwnPropertyDescriptor(w.HTMLInputElement.prototype, "value").set.call(i, String(valor));
    i.dispatchEvent(new w.Event("input", { bubbles: true }));
  });
};

test("★★★ la tanda entera: escalera, libro que crece, cuenta de Inversiones que no se mueve con los cobros, foco, primer intento y diez unidades", async () => {
  const m = await montar();
  const q = (sel) => m.caja.querySelector(sel);
  const textos = (sel) => [...m.caja.querySelectorAll(sel)].map((x) => x.textContent);
  const libro = () => [...m.caja.querySelectorAll("[data-figura-n7] [data-libro] [data-fila]")].map((x) => x.dataset.fila);
  const cuentaT = () => q("[data-figura-n7] [data-cuenta-inversiones]").textContent;
  const retro = () => textos("[data-retro] [data-texto-retro]");
  const enMensaje = () => document.activeElement === q("[data-mensaje-escalera]");
  const comprobar = () => tocar(boton(m.caja, "Comprobar"));
  const siguiente = (ultimo = false) => tocar(boton(m.caja, ultimo ? D.BOTON_N7.verResumen : D.BOTON_N7.siguiente));
  const pregunta = () => q("[data-pregunta]").textContent;
  const fila = (id) => q(`[data-linea-cuenta="${id}"]`);
  const estado = (id) => fila(id).dataset.estado;
  const armar = async (id, cuenta, lado) => {
    await tocar([...fila(id).querySelectorAll("[data-ficha-cuenta]")].find((b) => b.dataset.fichaCuenta === cuenta));
    await tocar([...fila(id).querySelectorAll("button")].find((b) => b.textContent === lado));
  };
  try {
    /* Arriba: la consigna, el distintivo y la figura vacía: ni asientos ni movimientos (E8). */
    assert.ok(m.caja.textContent.includes(D.N7.consigna));
    assert.deepEqual(textos("[data-un-intento]"), ["Vale el primer intento"]);
    assert.equal(q("[data-titulo-figura]").textContent, "El libro de Guayacán");
    assert.deepEqual(libro(), []);
    assert.ok(cuentaT().includes("Inversiones – títulos"));
    assert.doesNotMatch(cuentaT(), /\$/);

    /* CASILLA · 1.er intento 2.150.000 (reconocida), 2.º la buena. */
    const x0 = it("costo-de-la-compra");
    assert.equal(q("[data-intro]").textContent, D.HECHOS_N7[0]);
    assert.equal(pregunta(), x0.pregunta);
    assert.equal(q("[data-item] [data-pie]").textContent, D.N7.pie);
    assert.ok(!m.caja.textContent.includes("2.184.000"), "C1: el costo no está en pantalla antes de responder");
    await escribir(m.caja, "costo-de-la-compra", "2150000");
    await comprobar();
    assert.deepEqual(retro(), [x0.distractores[0].retro]);
    assert.ok(enMensaje(), "el foco va al mensaje");
    assert.equal(q('[data-campo-cifra="costo-de-la-compra"]').readOnly, false, "se puede volver a intentar");
    assert.equal(boton(m.caja, D.BOTON_N7.siguiente), undefined);
    await escribir(m.caja, "costo-de-la-compra", "2.184.000");
    await comprobar();
    assert.deepEqual(retro(), [x0.acierto]);
    assert.ok(enMensaje());
    assert.equal(q('[data-campo-cifra="costo-de-la-compra"]').readOnly, true);
    assert.deepEqual(libro(), [], "la casilla no pone asiento");
    await siguiente();

    /* ASIENTO 1 · la compra: 1.ª vuelta Inversiones mal (Bancos), Bancos bien; 2.ª, Inversiones bien. */
    const x1 = it("la-compra");
    assert.equal(pregunta(), D.HECHOS_N7[0]);
    assert.equal(q("[data-intro]"), null);
    for (const l of x1.lineas) {
      assert.deepEqual([...fila(l.id).querySelectorAll("[data-ficha-cuenta]")].map((b) => b.dataset.fichaCuenta), [l.cuenta, ...l.distractores]);
      assert.equal(fila(l.id).querySelector("[data-valor]").textContent, pesos(l.valor), "el monto viene dado");
    }
    await armar("inversiones", "Bancos", "Debe");
    await armar("bancos", "Bancos", "Haber");
    await comprobar();
    assert.deepEqual(x1.lineas.map((l) => estado(l.id)), ["pista", "bien"]);
    assert.deepEqual(textos('[data-linea-cuenta="inversiones"] [data-texto-retro]'), [x1.lineas[0].pista]);
    assert.deepEqual(textos("[data-era]"), [], "la pista no da la respuesta");
    assert.ok(document.activeElement === q('[data-linea-cuenta="inversiones"] [data-panel]'), "el foco, al mensaje");
    assert.deepEqual(libro(), [], "E8: nada antes de cerrar el asiento");
    assert.doesNotMatch(cuentaT(), /\$/);
    await armar("inversiones", "Inversiones – títulos", "Debe");
    await comprobar();
    assert.deepEqual(x1.lineas.map((l) => estado(l.id)), ["bien", "bien"]);
    assert.ok(document.activeElement === q("[data-asiento-completo]"));
    assert.deepEqual(libro(), ["la-compra"]);
    assert.equal(q('[data-libro] [data-fila="la-compra"] [data-rotulo-asiento]').textContent, "Hecho 1");
    assert.ok(q('[data-libro] [data-fila="la-compra"] [data-asiento]').textContent.includes("$2.184.000"));
    /* La compra sube Inversiones – títulos. */
    assert.equal(cuentaT().match(/\$[\d.]+/g).join(" "), "$2.184.000");
    await siguiente();

    /* ASIENTO 2 · el CDT: Caja bien; Intereses mal dos veces → «Era: …» y su porqué. */
    const x2 = it("el-cdt");
    assert.equal(pregunta(), D.HECHOS_N7[1]);
    await armar("caja", "Caja", "Debe");
    await armar("intereses", "Ingresos por dividendos", "Haber");
    await comprobar();
    assert.deepEqual(x2.lineas.map((l) => estado(l.id)), ["bien", "pista"]);
    assert.deepEqual(textos('[data-linea-cuenta="intereses"] [data-texto-retro]'), ["¿Qué rinde un CDT: interés o dividendo?"]);
    assert.deepEqual(libro(), ["la-compra"]);
    await armar("intereses", "Inversiones – títulos", "Haber");
    await comprobar();
    assert.deepEqual(x2.lineas.map((l) => estado(l.id)), ["bien", "respuesta"]);
    assert.deepEqual(textos('[data-linea-cuenta="intereses"] [data-era]'), ["Iba aquí: Ingresos por intereses, al haber."]);
    assert.deepEqual(textos('[data-linea-cuenta="intereses"] [data-texto-retro]'), [x2.lineas[1].retro]);
    assert.ok(document.activeElement === q('[data-linea-cuenta="intereses"] [data-panel]'));
    assert.deepEqual(libro(), ["la-compra", "el-cdt"]);
    /* El interés no mueve Inversiones – títulos. */
    assert.equal(cuentaT().match(/\$[\d.]+/g).join(" "), "$2.184.000");
    await siguiente();

    /* ASIENTO 3 · el dividendo (N7-1): Caja en la línea de la transferencia → la pista de Mello; luego Bancos. */
    const x3 = it("el-dividendo");
    assert.equal(pregunta(), NUEVOS_N7.hecho3);
    assert.deepEqual([...fila("bancos").querySelectorAll("[data-ficha-cuenta]")].map((b) => b.dataset.fichaCuenta), ["Bancos", "Caja", "Inversiones – títulos"]);
    await armar("bancos", "Caja", "Debe");
    await armar("dividendos", "Ingresos por dividendos", "Haber");
    await comprobar();
    assert.deepEqual(x3.lineas.map((l) => estado(l.id)), ["pista", "bien"]);
    assert.deepEqual(textos('[data-linea-cuenta="bancos"] [data-texto-retro]'), [NUEVOS_N7.pista]);
    await armar("bancos", "Bancos", "Debe");
    await comprobar();
    assert.deepEqual(x3.lineas.map((l) => estado(l.id)), ["bien", "bien"]);
    assert.deepEqual(libro(), ["la-compra", "el-cdt", "el-dividendo"]);
    assert.equal(cuentaT().match(/\$[\d.]+/g).join(" "), "$2.184.000", "el dividendo tampoco la mueve");
    await siguiente();

    /* ASIENTO 4 · los dos juntos, todo al primer intento. */
    const x4 = it("los-dos-juntos");
    assert.equal(pregunta(), D.HECHOS_N7[3]);
    assert.ok(!m.caja.querySelector("[data-figura-n7]").textContent.includes("$89.000"), "E8");
    for (const l of x4.lineas) await armar(l.id, l.cuenta, LADO[l.lado]);
    await comprobar();
    assert.deepEqual(x4.lineas.map((l) => estado(l.id)), ["bien", "bien", "bien"]);
    assert.deepEqual(libro(), ["la-compra", "el-cdt", "el-dividendo", "los-dos-juntos"]);
    assert.deepEqual(textos("[data-libro] [data-rotulo-asiento]"), ["Hecho 1", "Hecho 2", "Hecho 3", "Hecho 4"]);
    assert.equal(cuentaT().match(/\$[\d.]+/g).join(" "), "$2.184.000");
    await siguiente(true);

    /* Solo el primer intento suma: casilla ✗, inversiones ✗, bancos ✓, caja ✓, intereses ✗, bancos ✗, dividendos ✓ y las tres del hecho 4 ✓. */
    assert.equal(m.completados.length, 1);
    const [pct, , det] = m.completados[0];
    assert.deepEqual(det.map((d) => d.item), L.unidadesN7());
    assert.deepEqual(det.map((d) => d.ok), [false, false, true, true, false, false, true, true, true, true]);
    assert.deepEqual(det.filter((d) => !d.ok).map((d) => [d.item, d.respuesta]), [
      ["costo-de-la-compra", 2_150_000], ["la-compra:inversiones", "Bancos|debe"],
      ["el-cdt:intereses", "Ingresos por dividendos|haber"], ["el-dividendo:bancos", "Caja|debe"],
    ]);
    assert.equal(L.TOTAL_N7, 10);
    assert.equal(pct, 60);
    assert.equal(q("[data-resumen]").textContent, D.resumenN7(6, 10));
  } finally {
    m.desmontar();
  }
});

test("★★ las líneas y su banco de cuentas se barajan; la casilla no", () => {
  const vistos = new Set();
  for (let i = 0; i < 40; i++) vistos.add(JSON.stringify(L.prepararN7(barajar).map((x) => [x.orden, x.lineas?.map((l) => l.banco)])));
  assert.ok(vistos.size > 1);
  for (const x of L.prepararN7(barajar)) {
    if (x.tipo === "cifra") assert.equal(x, it(x.id));
    else for (const l of x.lineas) assert.deepEqual([...l.banco].sort(), [l.cuenta, ...l.distractores].sort());
  }
});

/* ═══════════ 5 · CATÁLOGO, VISTA, MIGRACIÓN, PANEL DOCENTE ═══════════ */

test("★★★ en T5 en la posición 10 de la decisión de corte: después de N6, antes del cierre de B; evaluativa, medio, 25 FP", () => {
  assert.deepEqual(clasificacionDe("contabilidad", TEMA_T5, D.N7_ID), { tipo: HACER, modalidad: "evaluativa", dificultad: "medio", fpBase: 25 });
  assert.equal(TEMA.actividades.find((a) => a.id === D.N7_ID).nombre, D.N7.nombre);
  const ids = TEMA.actividades.map((x) => x.id);
  assert.deepEqual(ids.slice(ids.indexOf("t5-a2-lo-que-el-ejemplo-no-trae")), ["t5-a2-lo-que-el-ejemplo-no-trae", D.N7_ID, "b5-t5-a2"]);
  const corte = leer("orquestador/conocimiento/mapas/t5-activos-financieros.md");
  assert.match(corte, /^ {3}\| 10 \| `t5-a-que-cuenta-va` ¿A qué cuenta va\? \| Hacer · medio \| 25 \|$/m);
  /* En el camino de Hacer, justo antes del cierre de Santa Pacha. */
  const hacer = actividadesDeTipo(TEMA, HACER).map((a) => a.id);
  assert.deepEqual(hacer.slice(-3), ["t5-gano-o-perdio", D.N7_ID, "b5-t5-a2"]);
});

test("★★★ la vista abre lo que el catálogo ofrece, N7 con su componente", () => {
  const ofrecidas = actividadesDeTipo(TEMA, HACER).filter((a) => !a.pendiente).map((a) => a.id).sort();
  assert.deepEqual(JUEGOS.map((j) => j.id).sort(), ofrecidas);
  assert.equal(JUEGOS.find((j) => j.id === D.N7_ID).Mecanica, AQueCuentaVa);
});

test("★★★ la 0114: un insert aditivo y repetible, sin update; 10 aciertos; la única migración con el id y con el número", () => {
  assert.match(MIGRACION, /\('t5-a-que-cuenta-va',\s*'contabilidad',\s*'activos-financieros',\s*'evaluativa',\s*'medio',\s*25,\s*1\)/);
  assert.match(MIGRACION, /on conflict \(activity_id\) do nothing;/);
  assert.match(MIGRACION, /\(10 posibles\)/);
  for (const parte of ["EL NÚMERO:", "DE QUÉ DEPENDE:", "CÓMO COMPROBAR QUE PASÓ:", "CÓMO DESHACERLA"]) assert.ok(MIGRACION.includes(parte), parte);
  const sentencias = MIGRACION.split("\n").filter((l) => !l.trim().startsWith("--")).join("\n");
  assert.doesNotMatch(sentencias, /\b(alter|update|delete|drop|truncate)\b/i);
  assert.equal(sentencias.match(/\binsert\b/gi).length, 1);
  assert.match(sentencias, /select activity_id[\s\S]*where activity_id = 't5-a-que-cuenta-va';/);
  const dir = new URL("supabase/migrations/", RAIZ);
  assert.deepEqual(readdirSync(dir).filter((f) => readFileSync(new URL(f, dir), "utf8").includes(D.N7_ID)), ["0114_t5_a_que_cuenta_va.sql"]);
  assert.deepEqual(readdirSync(dir).filter((f) => f.startsWith("0114")), ["0114_t5_a_que_cuenta_va.sql"]);
});

test("★★★ el panel docente: cada una de las diez unidades tiene etiqueta, leída de los datos, y ninguna se repite", () => {
  const ids = L.unidadesN7();
  assert.deepEqual(ids, ["costo-de-la-compra", "la-compra:inversiones", "la-compra:bancos", "el-cdt:caja", "el-cdt:intereses",
    "el-dividendo:bancos", "el-dividendo:dividendos", "los-dos-juntos:caja", "los-dos-juntos:intereses", "los-dos-juntos:dividendos"]);
  for (const id of ids) {
    const e = etiquetaDeItem(D.N7_ID, id);
    assert.ok(typeof e === "string" && e.trim() !== "", `${id}: sin etiqueta`);
    assert.equal(e, recortar(L.unidadDeN7(id)), id);
  }
  assert.equal(L.unidadDeN7("costo-de-la-compra"), it("costo-de-la-compra").pregunta);
  assert.equal(L.unidadDeN7("el-dividendo:bancos"), "Hecho 3 · Bancos $75.000");
  assert.equal(new Set(ids.map((id) => L.unidadDeN7(id))).size, 10);
  assert.equal(L.unidadDeN7("la-compra"), null);
  assert.equal(L.unidadDeN7("no-existe"), null);
});

/* ═══════════ C4 · «TODA DECISIÓN SE PINTA» (patrón de Watari, #t5-n7) ═══════════ */

const C4N7 = await import("../c4/t5N7_c4.js");
const { ESPERA_C4 } = await import("../../components/mecanicas/libros/t7/decisionC4.jsx");
const esperar = async (ms = ESPERA_C4 + 20) => { await act(async () => { await new Promise((r) => setTimeout(r, ms)); }); };

test("★★★ C4 · el registro lleva la casilla de Near tal cual (los dos sentidos); los cuatro asientos siguen como en main", () => {
  const P = C4N7.CONSECUENCIA_C4;
  assert.equal(P.id, "t5-n7");
  assert.equal(P.objeto, "El libro de Guayacán");
  assert.equal(P.objeto, D.FIGURA_N7.titulo);
  assert.equal(P.modo, "hacer");
  assert.deepEqual(P.items.map((x) => x.id), D.ITEMS_N7.map((x) => x.id));
  for (const [k, x] of P.items.entries()) {
    const it = D.ITEMS_N7[k];
    if (it.tipo === "asiento") { assert.equal(x.tipo, "propio"); continue; }
    assert.equal(x.tipo, "cifra");
    assert.equal(x.texto, it.intro);
    assert.equal(x.pregunta, it.pregunta);
    assert.equal(x.pista, it.pista);
    assert.equal(x.bien, it.acierto);
    assert.equal(x.porque, it.porque);
    assert.deepEqual(x.opciones.map((o) => o.v), [it.correcta, ...it.distractores.map((d) => d.valor)]);
    assert.deepEqual(x.opciones.filter((o) => !o.correcta).map((o) => o.msg), it.distractores.map((d) => d.retro));
  }
  const x = P.items[0];
  assert.deepEqual(P.consecuencia(x, null), { cuenta: "Inversiones – títulos", pago: "Lo que pagó: precio $2.150.000 + gastos de la compra $34.000", debe: null });
  assert.equal(P.consecuencia(x, 2_184_000).cuadra, "Entra todo lo que pagó.");
  assert.equal(P.consecuencia(x, 2_150_000).falla, "Entra solo el precio: faltan los gastos de la compra.");
  assert.equal(P.consecuencia(x, 34_000).falla, "Entran solo los gastos: falta el precio.");
  assert.deepEqual(P.consecuencia(x, 2_000_000), { cuenta: "Inversiones – títulos", pago: "Lo que pagó: precio $2.150.000 + gastos de la compra $34.000", debe: 2_000_000, falla: "Faltan $184.000 frente a lo que pagó.", delata: true });
});

test("★★★ C4 · montada: la cifra entra al debe con cada número; el veredicto a los 380 ms; la falla que delata espera al cierre", async () => {
  REDUCIDO = false;
  const m = await montar();
  const q = (s) => m.caja.querySelector(s);
  const retro = () => [...m.caja.querySelectorAll("[data-retro] [data-texto-retro]")].map((x) => x.textContent);
  const comprobar = () => tocar(boton(m.caja, "Comprobar"));
  try {
    const x0 = D.ITEMS_N7[0];
    assert.equal(q("[data-debe-n7]").textContent, "Debe —");
    assert.equal(q("[data-pago-n7]").textContent, "Lo que pagó: precio $2.150.000 + gastos de la compra $34.000");
    await escribir(m.caja, x0.id, "2000");
    assert.equal(q("[data-cifra-n7]").textContent, "$2.000");
    await escribir(m.caja, x0.id, "2000000");
    assert.equal(q("[data-cifra-n7]").textContent, "$2.000.000");
    await escribir(m.caja, x0.id, "2184000");
    assert.doesNotMatch(q("[data-entra-n7]").outerHTML, /c4-cuadra|c4-falla| mal/, "C4-1: la buena escrita no califica antes de comprobar");
    await escribir(m.caja, x0.id, "2000000");
    assert.doesNotMatch(q("[data-figura-n7] [data-cuenta-inversiones]").textContent, /\$/, "la cuenta T no se mueve antes del asiento (E8)");
    await comprobar();
    assert.deepEqual(retro(), [], "el veredicto llegó antes de 380 ms");
    await esperar();
    assert.ok(retro().length > 0, "la escalera de siempre: la pista");
    assert.equal(q("[data-falla]"), null, "la falla que da la diferencia espera al cierre (E8)");
    assert.ok(!m.caja.textContent.includes("184.000") && !m.caja.textContent.includes("2.184.000"), "C1: ni la falla ni la figura dicen el costo antes de cerrar");
    /* 2.º intento, el precio solo: su falla sale con el veredicto, y el ítem se cierra. */
    await escribir(m.caja, x0.id, "2150000");
    assert.equal(q("[data-falla]"), null);
    assert.equal(q("[data-cifra-n7]").textContent, "$2.150.000");
    await comprobar();
    await esperar();
    assert.equal(q("[data-falla]").textContent, "Entra solo el precio: faltan los gastos de la compra.");
    assert.ok(q("[data-cifra-n7]").classList.contains("mal"));
    assert.ok(boton(m.caja, D.BOTON_N7.siguiente), "dos errores: la casilla se cierra");
    await tocar(boton(m.caja, D.BOTON_N7.siguiente));
    assert.equal(q("[data-entra-n7]"), null, "en los asientos no hay casilla: nada provisional");
  } finally {
    REDUCIDO = true;
    m.desmontar();
  }
});
