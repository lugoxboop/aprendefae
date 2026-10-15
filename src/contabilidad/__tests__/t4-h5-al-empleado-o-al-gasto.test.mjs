import { test } from "node:test";
import assert from "node:assert/strict";
import { readFileSync, readdirSync } from "node:fs";
import { JSDOM, VirtualConsole } from "jsdom";

/*
 * ═══════════════════════════════════════════════════════════════════════════
 * T4 · H5 «¿Al empleado o al gasto?» (Célula D) · Hacer · evaluativa · difícil · 50 FP.
 *
 *   · cada texto es el del paquete vigente de Katsumi, letra por letra:
 *     enunciado, decisión, pedido, acierto y los ocho errores de cada caso,
 *     en su orden; el asiento correcto es la tabla del paquete
 *   · las cifras: el fondo, los gastos y el efectivo se escriben; la suma,
 *     el faltante y el cheque se calculan. Gastos + faltante = cheque, y
 *     efectivo + cheque = fondo
 *   · cada error con nombre sale con su combinación, y se muestra el PRIMERO
 *     de la lista que aplique
 *   · la pantalla de Hanayama: sin sobre; la decisión en su renglón, en
 *     600; las seis cuentas siempre, en su orden; los nombres con raya solo
 *     se parten después de la raya; un mensaje; el asiento correcto después
 *   · PH8-2: mientras se arma, nada de la respuesta está en el DOM
 *     (textContent y outerHTML, nunca innerText)
 *   · el sorteo (uno de cada decisión), el camino, el motor, la 0204, el
 *     panel docente y el «Así se juega»
 * ═══════════════════════════════════════════════════════════════════════════
 */

const dom = new JSDOM("<!doctype html><html><body></body></html>", { url: "http://localhost/", virtualConsole: new VirtualConsole() });
const w = dom.window;
w.matchMedia = () => ({ matches: false, addEventListener() {}, removeEventListener() {}, addListener() {}, removeListener() {} });
w.requestAnimationFrame = (f) => setTimeout(f, 0);
for (const [k, v] of Object.entries({
  window: w, document: w.document, navigator: w.navigator, localStorage: w.localStorage,
  HTMLElement: w.HTMLElement, HTMLInputElement: w.HTMLInputElement, Element: w.Element, Node: w.Node, SVGElement: w.SVGElement,
  Event: w.Event, InputEvent: w.InputEvent, MouseEvent: w.MouseEvent, KeyboardEvent: w.KeyboardEvent,
  getComputedStyle: w.getComputedStyle.bind(w), matchMedia: w.matchMedia, requestAnimationFrame: w.requestAnimationFrame,
})) {
  Object.defineProperty(globalThis, k, { value: v, configurable: true, writable: true });
}
globalThis.IS_REACT_ACT_ENVIRONMENT = true;

const React = await import("react");
const { createRoot } = await import("react-dom/client");
const act = React.act;
const h = React.createElement;

const D = await import("../../data/contabilidadT4H5.js");
const { leerCifra } = await import("../../components/mecanicas/libros/piezas.jsx");
const { SUBJECTS, HACER, actividadesDeTipo, clasificacionDe } = await import("../../data/subjects.js");
const { default: ContabilidadT4View, AlEmpleadoOAlGasto, JUEGOS_T4, TEMA_T4 } = await import("../../components/ContabilidadT4View.jsx");
const { AuthContext } = await import("../../auth/AuthProvider.jsx");
const { etiquetaDeItem, recortar } = await import("../../docente/etiquetasItem.js");
const { ASI_SE_JUEGA } = await import("../../data/asiSeJuega.js");
const { inflesz } = await import("../../herramientas/inflesz.js");
const { leer, CITA, PAQUETES, RAIZ, blobEnLaRamaFuente, blobDeLaCopia, RAMA_FUENTE } = await import("./t4-paquete.mjs");

const PAQ = leer(`${PAQUETES}d4-t4-h5-v1.md`);
const V2 = leer(`${PAQUETES}d4-t4-h3-h5-a4-v2-cambios.md`);
const ASI = leer(`${PAQUETES}d4-t4-asi-se-juega-v1.md`);
const VISTA = leer("src/components/ContabilidadT4View.jsx");
const MIGRACION = leer("supabase/migrations/0204_t4_al_empleado_o_al_gasto.sql");
const TEMA = SUBJECTS.contabilidad.topics.find((t) => t.id === TEMA_T4);
const num = (t) => Number(String(t).replace(/[$.]/g, ""));
const miles = (n) => String(n).replace(/\B(?=(\d{3})+(?!\d))/g, ".");

/* ═══════════ EL PAQUETE, LEÍDO ═══════════ */

const cita = (b, rotulo) => b.match(new RegExp(`^- \\*\\*${rotulo}:\\*\\* ${CITA}`, "m"))?.[1] ?? null;
const CASOS_PAQ = PAQ.slice(PAQ.indexOf("## Casos"), PAQ.indexOf("## Reparto")).split(/\n(?=### H5-\d)/).slice(1).map((b) => ({
  titulo: b.match(/^### (H5-\d) · (.+?) · (.+)$/m),
  subtema: b.match(/^- \*\*Subtema:\*\* (.+)$/m)[1].trim(),
  enunciado: cita(b, "Enunciado"),
  decision: cita(b, "Decisión de la empresa"),
  pedido: cita(b, "Pedido"),
  datos: b.match(/^- \*\*Datos construidos:\*\* (.+)$/m)[1],
  asiento: b.split("\n").filter((l) => /^\|/.test(l)).slice(2).map((l) => l.split("|").slice(1, -1).map((x) => x.trim())),
  acierto: cita(b, "Acierto"),
  errores: [...b.matchAll(new RegExp(`^  - \\*([a-z_]+):\\* ${CITA}`, "gm"))].map((m) => [m[1], m[2]]),
  pie: b.match(new RegExp(`^- Pie: ${CITA}`, "m"))[1],
}));

/* ═══════════ 1 · EL TEXTO, CONTRA EL PAQUETE ═══════════ */

test("★★★ la copia del paquete de H5 es la de la punta de la rama de Katsumi (si este clon la tiene)", (t) => {
  if (!blobEnLaRamaFuente("d4-t4-h5-v1.md")) { t.skip(`este clon no tiene ${RAMA_FUENTE}`); return; }
  for (const f of ["d4-t4-h5-v1.md", "d4-t4-h3-h5-a4-v2-cambios.md", "d4-t4-asi-se-juega-v1.md"]) assert.equal(blobDeLaCopia(f), blobEnLaRamaFuente(f), f);
});

test("★★★ ficha: id, nombre, objetivo, consigna, subtemas, las seis cuentas y el orden de los errores son los del paquete", () => {
  assert.match(PAQ, /\*\*Este archivo es la versión vigente\.\*\* Ya incluye la parte de H5 de `d4-t4-h3-h5-a4-v2-cambios\.md`/);
  assert.match(PAQ, new RegExp(`\\| id \\| \`${D.H5_ID}\` \\|`));
  assert.ok(PAQ.startsWith(`**T4 · H5 «${D.H5.nombre}»`));
  assert.match(PAQ, /\| Dificultad y modalidad \| Difícil · evaluativa · 50 FP/);
  assert.ok(PAQ.includes(`«${D.H5.objetivo}»`));
  const consigna = PAQ.slice(PAQ.indexOf("## Consigna"), PAQ.indexOf("## Cómo se elige"));
  assert.deepEqual([...consigna.matchAll(new RegExp(`^- ${CITA}`, "gm"))].map((m) => m[1]), D.H5.consigna);
  assert.equal(PAQ.match(/\| Subtemas \| (.+) \|/)[1], D.SUBTEMAS_H5.join(" · "));
  const cuentas = PAQ.match(/\*\*Cuentas disponibles, las mismas en los cuatro casos:\*\* (.+)$/m)[1];
  assert.deepEqual([...cuentas.matchAll(new RegExp(CITA, "g"))].map((m) => m[1]), D.CUENTAS_H5.map(D.nombreDe));
  const lista = PAQ.slice(PAQ.indexOf("## Cómo se elige"), PAQ.indexOf("## Casos"));
  assert.deepEqual([...lista.matchAll(/^\d\. \*\*([a-z_]+):\*\*/gm)].map((m) => m[1]), D.ERRORES_H5);
});

test("★★★ los cuatro casos: enunciado, decisión, pedido, acierto, subtema, pie y los ocho errores, letra por letra y en el orden del paquete", () => {
  assert.equal(CASOS_PAQ.length, 4, "no se leyeron los cuatro casos");
  assert.ok(CASOS_PAQ.every((c) => c.errores.length === 8), "un caso del paquete sin sus ocho errores");
  D.CASOS_H5.forEach((c, k) => {
    const p = CASOS_PAQ[k];
    assert.equal(c.id, p.titulo[1].toLowerCase());
    assert.equal(c.empresa, p.titulo[2]);
    for (const campo of ["enunciado", "acierto", "subtema", "pie", "pedido"]) assert.equal(c[campo], p[campo], `${c.id}: ${campo}`);
    assert.equal(c.decisionTexto, p.decision, `${c.id}: decisión`);
    assert.deepEqual(D.ERRORES_H5.map((e) => [e, c.errores[e]]), p.errores, `${c.id}: errores`);
  });
  /* v2: el último día de cada mes, nunca un 31 que no existe. */
  assert.deepEqual(D.CASOS_H5.map((c) => c.fecha), ["30 de abril", "31 de mayo", "30 de junio", "31 de julio"]);
  assert.match(V2, /«Arma el asiento del reembolso del 30 de abril: cuentas, lados y valores\.»/);
  assert.ok(!JSON.stringify(D.CASOS_H5).includes("31 de abril") && !JSON.stringify(D.CASOS_H5).includes("31 de junio"));
});

test("★★★ las cifras se calculan: la suma, el faltante y el cheque dan los «Datos construidos»; el asiento correcto es la tabla del paquete", () => {
  D.CASOS_H5.forEach((c, k) => {
    const p = CASOS_PAQ[k];
    const datos = Object.fromEntries([...p.datos.matchAll(/(fondo|gastos|efectivo|suma|faltante de caja menor|cheque) ([\d.]+)/g)].map((m) => [m[1].split(" ")[0], num(m[2])]));
    assert.deepEqual([c.fondo, c.gastos, c.efectivo, c.suma, c.faltante, c.cheque], [datos.fondo, datos.gastos, datos.efectivo, datos.suma, datos.faltante, datos.cheque], `${c.id}: cifras`);
    assert.equal(c.gastos + c.faltante, c.cheque, `${c.id}: gastos + faltante ≠ cheque`);
    assert.equal(c.efectivo + c.cheque, c.fondo, `${c.id}: efectivo + cheque ≠ fondo`);
    assert.equal(p.asiento[0][0], c.fecha, `${c.id}: fecha del asiento`);
    assert.deepEqual(c.asiento.map((l) => [D.nombreDe(l.cuenta), l.lado === D.DEBE ? miles(l.valor) : "", l.lado === D.HABER ? miles(l.valor) : ""]), p.asiento.map((f) => f.slice(1)), `${c.id}: el asiento no es el del paquete`);
  });
  const fuente = leer("src/data/contabilidadT4H5.js");
  for (const c of D.CASOS_H5) for (const x of [c.suma, c.faltante, c.cheque]) {
    assert.ok(!new RegExp(`\\b${String(x).replace(/(\d)(?=(\d{3})+$)/g, "$1_?")}\\b`).test(fuente), `${c.id}: ${x} está escrito a mano`);
  }
  /* Ninguna cifra coincide con A3 ni con H4. */
  for (const c of D.CASOS_H5) for (const x of [c.faltante, c.cheque]) assert.ok(![6_700, 484_800, 4_300, 7_200, 1_500, 2_500, 387_500, 419_850, 454_800, 341_400].includes(x), `${c.id}: ${x} es de otra pieza`);
});

test("★★★ cada error con nombre sale con su combinación, y se muestra el PRIMERO de la lista que aplica", () => {
  const f = (cuenta, lado, valor) => ({ cuenta, lado, valor: miles(valor) });
  for (const c of D.CASOS_H5) {
    const esta = c.asiento[1].cuenta;
    const otra = esta === D.CXC_EMPLEADOS ? D.GASTOS_FALTANTE : D.CXC_EMPLEADOS;
    const G = (v = c.gastos) => f(D.GASTOS_GENERALES, D.DEBE, v);
    const B = (v = c.cheque) => f(D.BANCOS, D.HABER, v);
    const ok = D.evaluarH5(c, [G(), f(esta, D.DEBE, c.faltante), B()], leerCifra);
    assert.ok(ok.ok, `${c.id}: el asiento correcto no da acierto`);
    assert.equal(ok.texto, c.acierto);
    const casos = {
      toca_caja_menor: [G(), f(D.CAJA_MENOR, D.DEBE, c.faltante), B()],
      cuenta_de_sobrante: [G(), f(D.INGRESOS_SOBRANTE, D.DEBE, c.faltante), B()],
      cuenta_del_otro_camino: [G(), f(otra, D.DEBE, c.faltante), B()],
      faltante_al_haber: [G(), f(esta, D.HABER, c.faltante), B()],
      bancos_igual_a_gastos: [G(), f(esta, D.DEBE, c.faltante), B(c.gastos)],
      bancos_resta: [G(), f(esta, D.DEBE, c.faltante), B(c.gastos - c.faltante)],
      faltante_como_saldo_esperado: [G(), f(esta, D.DEBE, c.fondo - c.gastos), B()],
      gastos_con_otro_valor: [G(c.cheque), f(esta, D.DEBE, c.faltante), B()],
    };
    for (const [nombre, filas] of Object.entries(casos)) {
      const r = D.evaluarH5(c, filas, leerCifra);
      assert.equal(r.error, nombre, `${c.id}: ${nombre}`);
      assert.equal(r.texto, c.errores[nombre]);
    }
    /* Prioridad: Caja menor y el otro camino a la vez → manda Caja menor; el otro camino y Bancos = gastos → manda el otro camino. */
    assert.equal(D.evaluarH5(c, [G(), f(D.CAJA_MENOR, D.DEBE, c.faltante), f(otra, D.DEBE, 1), B(c.gastos)], leerCifra).error, "toca_caja_menor");
    assert.equal(D.evaluarH5(c, [G(), f(otra, D.DEBE, c.faltante), B(c.gastos)], leerCifra).error, "cuenta_del_otro_camino");
  }
});

test("★★ el cierre de la actividad y su pie; INFLESZ de todo texto de 10 palabras o más, 65 o más", () => {
  const cierre = PAQ.slice(PAQ.indexOf("## Cierre de la actividad"), PAQ.indexOf("## Erratas"));
  assert.ok(cierre.includes(`«${D.CIERRE_H5.texto}»`));
  assert.equal(D.CIERRE_H5.pie, cierre.match(new RegExp(`^- Pie: ${CITA}`, "m"))[1]);
  const textos = [D.H5.objetivo, ...D.H5.consigna, ...D.CASOS_H5.flatMap((c) => [c.enunciado, c.decisionTexto, c.pedido, c.acierto, ...Object.values(c.errores)]), D.CIERRE_H5.texto];
  const medidos = textos.map((t) => ({ t, r: inflesz(t) })).filter((x) => x.r.aplica);
  assert.ok(medidos.length >= 40);
  assert.deepEqual(medidos.filter((x) => !x.r.cumple).map((x) => `${x.r.valor} · ${x.t}`), []);
});

test("★★★ los textos de interfaz son los que revisó Katsumi en el paquete; el aviso es el suyo, que no dice cuántas líneas van", () => {
  const i = PAQ.indexOf("## Textos de interfaz");
  assert.ok(i > 0, "el paquete de H5 no trae la sección de textos de interfaz revisados");
  const sec = PAQ.slice(i, PAQ.indexOf("\n## ", i + 5) > 0 ? PAQ.indexOf("\n## ", i + 5) : undefined);
  const citas = new Set([...sec.matchAll(new RegExp(CITA, "g"))].map((m) => m[1]));
  assert.match(sec, new RegExp(`Pasa a: «${D.FALTAN_FILAS.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")}»`), "el aviso no es el que pide Katsumi");
  assert.ok(sec.includes("«Pon al menos tres cuentas, cada una con su lado y su valor.»"), "no se leyó el aviso viejo en el paquete");
  assert.notEqual(D.FALTAN_FILAS, "Pon al menos tres cuentas, cada una con su lado y su valor.");
  for (const t of [...Object.values(D.BOTON_H5), D.CORRECTO, D.INCORRECTO, D.ROTULO_ASIENTO_H5]) assert.ok(citas.has(t), `«${t}» no está entre los textos aprobados`);
  assert.ok(citas.has(D.resumenH5("N", 4)), "el resumen no es el aprobado");
  assert.match(sec, /con al menos dos filas completas, una al debe y otra al haber, y ninguna fila a medias\. No con tres\./);
});

/* ═══════════ 2 · LO QUE SE VE ═══════════ */

const Marco = ({ children }) => h("div", { "data-marco": true }, children);
const [EMP_1, GASTO_2] = D.CASOS_H5;
const montar = async (props = {}) => {
  const caja = document.createElement("div");
  document.body.appendChild(caja);
  const raiz = createRoot(caja);
  const completados = [];
  await act(async () => { raiz.render(h(AlEmpleadoOAlGasto, { Marco, items: [EMP_1, GASTO_2], onCompletar: (...a) => completados.push(a), ...props })); });
  return { caja, completados, desmontar: () => { act(() => raiz.unmount()); caja.remove(); } };
};
const tocar = async (el) => {
  assert.ok(el, "no está el elemento que se quería tocar");
  await act(async () => { el.dispatchEvent(new w.MouseEvent("click", { bubbles: true })); });
};
const escribir = async (el, texto) => {
  assert.ok(el, "no está el campo");
  const set = Object.getOwnPropertyDescriptor(w.HTMLInputElement.prototype, "value").set;
  await act(async () => { set.call(el, texto); el.dispatchEvent(new w.Event("input", { bubbles: true })); });
};
const boton = (caja, texto) => [...caja.querySelectorAll("button")].find((b) => b.textContent.trim() === texto) ?? null;
const pastilla = (caja, cuenta) => [...caja.querySelectorAll("[data-constructor] button")].find((b) => b.textContent === cuenta) ?? null;
const lado = (caja, k, l) => caja.querySelectorAll(`[data-fila-asiento="${k}"] > div:nth-child(2) > button`)[l === D.DEBE ? 0 : 1];
async function armar(caja, lineas) {
  for (const [k, l] of lineas.entries()) {
    await tocar(pastilla(caja, l.cuenta));
    await tocar(lado(caja, k, l.lado));
    await escribir(caja.querySelector(`[data-fila-asiento="${k}"] input`), miles(l.valor));
  }
}

test("★★★ la tarjeta: el enunciado, la decisión en su renglón y en 600, y el pedido; sin sobre; las seis cuentas en su orden", async () => {
  const m = await montar();
  try {
    for (const c of [EMP_1, GASTO_2]) {
      const t = m.caja.querySelector(`[data-tarjeta-caso="${c.id}"]`);
      assert.equal(t.querySelector("[data-enunciado]").textContent, c.enunciado);
      const dec = t.querySelector("[data-decision]");
      assert.equal(dec.textContent, c.decisionTexto);
      assert.match(dec.getAttribute("style"), /font-weight: 600/);
      assert.match(dec.getAttribute("style"), /border-top: 1px solid/);
      assert.equal(t.querySelector("[data-pedido]").textContent, c.pedido);
      assert.equal(m.caja.querySelector("[data-figura]"), null, "H5 no lleva sobre");
      const paleta = [...m.caja.querySelectorAll("[data-constructor] button")].filter((b) => D.CUENTAS_H5.includes(b.textContent)).map((b) => b.textContent);
      assert.deepEqual(paleta, D.CUENTAS_H5);
      await armar(m.caja, c.asiento);
      await tocar(boton(m.caja, D.BOTON_H5.confirmar));
      await tocar(boton(m.caja, c === GASTO_2 ? D.BOTON_H5.verResumen : D.BOTON_H5.siguiente));
    }
  } finally { m.desmontar(); }
});

test("★★★ los nombres con raya solo se parten después de la raya: espacio duro antes de «–» y dentro del sufijo", () => {
  for (const cuenta of [D.CXC_EMPLEADOS, D.GASTOS_FALTANTE, D.INGRESOS_SOBRANTE]) {
    const [antes, despues] = cuenta.split("–");
    assert.ok(antes.endsWith("\u00a0"), `«${D.nombreDe(cuenta)}»: no lleva espacio duro antes de la raya`);
    assert.ok(despues.startsWith(" "), `«${D.nombreDe(cuenta)}»: el corte después de la raya no es posible`);
    assert.ok(!despues.slice(1).includes(" "), `«${D.nombreDe(cuenta)}»: el sufijo se puede partir`);
  }
  assert.equal(D.nombreDe(D.GASTOS_FALTANTE), "Gastos no operacionales – faltante de caja menor");
});

test("★★★ «Confirmar el asiento» se activa con al menos dos filas completas, una al debe y otra al haber; antes, el aviso, que no dice cuántas líneas lleva", async () => {
  const m = await montar({ items: [EMP_1] });
  try {
    const confirmar = () => boton(m.caja, D.BOTON_H5.confirmar);
    /* Empieza con dos filas vacías: tres dirían cuántas líneas lleva el asiento. */
    assert.equal(m.caja.querySelectorAll("[data-fila-asiento]").length, 2);
    assert.equal(confirmar().disabled, true);
    assert.equal(m.caja.querySelector("[data-aviso]").textContent, D.FALTAN_FILAS);
    assert.doesNotMatch(D.FALTAN_FILAS, /tres|3/, "el aviso dice cuántas líneas lleva el asiento");
    await armar(m.caja, [EMP_1.asiento[0]]);
    assert.equal(confirmar().disabled, true, "con una fila");
    await tocar(pastilla(m.caja, D.BANCOS));
    await tocar(lado(m.caja, 1, D.DEBE));
    await escribir(m.caja.querySelector('[data-fila-asiento="1"] input'), miles(EMP_1.cheque));
    assert.equal(confirmar().disabled, true, "dos filas, las dos al debe");
    await tocar(lado(m.caja, 1, D.HABER));
    assert.equal(confirmar().disabled, false, "dos filas, una a cada lado");
    assert.equal(m.caja.querySelector("[data-aviso]"), null);
    /* Una tercera a medias lo vuelve a apagar: ninguna fila a medias. */
    await tocar(pastilla(m.caja, EMP_1.asiento[1].cuenta));
    assert.equal(m.caja.querySelectorAll("[data-fila-asiento]").length, 3, "el constructor no añadió la tercera fila");
    assert.equal(confirmar().disabled, true, "una fila a medias");
    /* El aviso no gasta intento: no hay devolución ni nada anotado. */
    assert.equal(m.caja.querySelector("[data-panel]"), null);
    assert.equal(m.completados.length, 0);
  } finally { m.desmontar(); }
});

test("★★★ el error central se puede cometer: con solo Gastos generales y Bancos se confirma, y sale bancos_igual_a_gastos", async () => {
  for (const c of [EMP_1, GASTO_2]) {
    const m = await montar({ items: [c] });
    try {
      await armar(m.caja, [c.asiento[0], { cuenta: D.BANCOS, lado: D.HABER, valor: c.gastos }]);
      const confirmar = boton(m.caja, D.BOTON_H5.confirmar);
      assert.equal(confirmar.disabled, false, `${c.id}: con Gastos generales y Bancos no se puede confirmar`);
      await tocar(confirmar);
      const panel = m.caja.querySelector("[data-panel]");
      assert.equal(panel.dataset.panel, "error");
      assert.equal(panel.querySelector("[data-texto-retro]").textContent, c.errores.bancos_igual_a_gastos);
      assert.equal(D.evaluarH5(c, [{ cuenta: D.GASTOS_GENERALES, lado: D.DEBE, valor: String(c.gastos) }, { cuenta: D.BANCOS, lado: D.HABER, valor: String(c.gastos) }], leerCifra).error, "bancos_igual_a_gastos");
    } finally { m.desmontar(); }
  }
});

test("★★★ PH8-2: mientras se arma, nada de la respuesta está en el DOM (textContent y outerHTML, no innerText)", async () => {
  const m = await montar();
  try {
    for (const c of [EMP_1, GASTO_2]) {
      const sinDelatar = (cuando) => {
        const dom = `${m.caja.textContent}\n${m.caja.outerHTML}`;
        for (const x of [c.acierto, ...Object.values(c.errores), D.CORRECTO, D.INCORRECTO, D.ROTULO_ASIENTO_H5, c.pie]) assert.ok(!dom.includes(x), `${c.id} ${cuando}: el DOM ya trae «${x.slice(0, 50)}»`);
        /* Ni el faltante ni el cheque: se calculan, y el enunciado no los da. */
        for (const x of [c.faltante, c.cheque]) assert.ok(!dom.includes(miles(x)) || cuando === "armado", `${c.id} ${cuando}: el DOM ya trae ${miles(x)}`);
        assert.equal(m.caja.querySelectorAll("[data-panel], [data-asiento-completo], [data-asiento], [data-texto-retro]").length, 0, `${c.id} ${cuando}: hay devolución montada`);
        assert.doesNotMatch(m.caja.outerHTML, /data-correct|data-respuesta|aria-(?:checked|selected)="true"/);
      };
      sinDelatar("vacío");
      await armar(m.caja, c.asiento);
      sinDelatar("armado");
      await tocar(boton(m.caja, D.BOTON_H5.confirmar));
      await tocar(boton(m.caja, c === GASTO_2 ? D.BOTON_H5.verResumen : D.BOTON_H5.siguiente));
    }
  } finally { m.desmontar(); }
});

test("★★★ al confirmar: un solo mensaje, cada fila bien o mal, el asiento correcto con sus totales; coral solo en el error; un intento", async () => {
  const coral = /rgb\(231,\s*111,\s*81\)|#e76f51/i;
  for (const c of [EMP_1, GASTO_2]) {
    for (const [nombre, lineas] of [["acierto", c.asiento], ["bancos_igual_a_gastos", [c.asiento[0], c.asiento[1], { ...c.asiento[2], valor: c.gastos }]], ["toca_caja_menor", [c.asiento[0], { ...c.asiento[1], cuenta: D.CAJA_MENOR }, c.asiento[2]]]]) {
      const m = await montar({ items: [c] });
      try {
        await armar(m.caja, lineas);
        await tocar(boton(m.caja, D.BOTON_H5.confirmar));
        const ok = nombre === "acierto";
        const panel = m.caja.querySelector("[data-panel]");
        assert.equal(panel.dataset.panel, ok ? "acierto" : "error");
        assert.equal(panel.querySelector("[data-palabra]").textContent, ok ? D.CORRECTO : D.INCORRECTO);
        assert.equal(m.caja.querySelectorAll("[data-texto-retro]").length, 1, "más de un mensaje");
        assert.equal(panel.querySelector("[data-texto-retro]").textContent, ok ? c.acierto : c.errores[nombre]);
        assert.equal(coral.test(panel.getAttribute("style")), !ok);
        const filas = [...m.caja.querySelectorAll("[data-fila-asiento]")];
        filas.forEach((f, k) => {
          const bien = c.asiento.some((l) => l.cuenta === lineas[k].cuenta && l.lado === lineas[k].lado && l.valor === lineas[k].valor);
          assert.equal(coral.test(f.getAttribute("style")), !bien, `${c.id} ${nombre}: fila ${k}`);
        });
        const as = m.caja.querySelector("[data-asiento-completo]");
        /* En el asiento correcto, el nombre del paquete con espacios normales: su columna es estrecha (112 px a 320). */
        for (const l of c.asiento) assert.ok(as.textContent.includes(D.nombreDe(l.cuenta)), `${c.id}: falta ${D.nombreDe(l.cuenta)}`);
        assert.ok(!as.textContent.includes("\u00a0"), `${c.id}: el asiento correcto lleva espacios duros`);
        assert.equal(as.textContent.split(`$${miles(c.cheque)}`).length - 1, 3, `${c.id}: el cheque no está en su línea y en las dos sumas`);
        assert.equal(m.caja.querySelector("[data-pie-caso]").textContent, c.pie);
        assert.equal(boton(m.caja, D.BOTON_H5.confirmar), null, "un intento");
        assert.ok([...m.caja.querySelectorAll("[data-constructor] button, [data-constructor] input")].every((b) => b.disabled));
      } finally { m.desmontar(); }
    }
  }
});

test("★★★ el sorteo: dos casos, uno de cada decisión, en orden barajado; al terminar, el cierre y onCompletar con el porcentaje y el asiento armado", async () => {
  assert.deepEqual(D.sortearH5((xs) => xs, () => 0).map((c) => c.id), ["h5-1", "h5-2"]);
  assert.deepEqual(D.sortearH5((xs) => [...xs].reverse(), () => 0.99).map((c) => c.id), ["h5-4", "h5-3"]);
  assert.match(VISTA, /useTanda\(\(\) => items \?\? sortearH5\(barajar\)\)/);
  const reparto = PAQ.slice(PAQ.indexOf("## Reparto"), PAQ.indexOf("## Cierre de la actividad"));
  assert.match(reparto, /\| Cobrar al empleado \| H5-1, H5-3 \| se sortea uno \|/);
  assert.match(reparto, /\| Asumir como gasto \| H5-2, H5-4 \| se sortea uno \|/);
  assert.deepEqual(D.CASOS_H5.filter((c) => c.decision === D.EMPLEADO).map((c) => c.id), ["h5-1", "h5-3"]);
  const m = await montar();
  try {
    await armar(m.caja, [EMP_1.asiento[0], EMP_1.asiento[1], { ...EMP_1.asiento[2], valor: EMP_1.gastos }]);
    await tocar(boton(m.caja, D.BOTON_H5.confirmar));
    await tocar(boton(m.caja, D.BOTON_H5.siguiente));
    await armar(m.caja, GASTO_2.asiento);
    await tocar(boton(m.caja, D.BOTON_H5.confirmar));
    await tocar(boton(m.caja, D.BOTON_H5.verResumen));
    const [pct, , detalle] = m.completados[0];
    assert.equal(pct, 50);
    assert.equal(detalle.length, 2);
    assert.deepEqual(detalle[0], { item: "h5-1", ok: false, intentos: 1, respuesta: "D Gastos generales 352800 · D Cuentas por cobrar – empleados 5500 · H Bancos 352800", orden: 1 });
    assert.equal(m.caja.querySelector("[data-resumen]").textContent, D.resumenH5(1, 2));
    assert.equal(m.caja.querySelector("[data-cierre]").textContent, D.CIERRE_H5.texto);
    assert.equal(m.caja.querySelector("[data-pie-cierre]").textContent, D.CIERRE_H5.pie);
  } finally { m.desmontar(); }
});

test("★★★ en la página del juego hay exactamente UN [data-t4-h5]: la partida; la demo de «Así se juega» lleva el suyo propio", async () => {
  try { globalThis.localStorage.clear(); } catch { /* sin almacenamiento, sale igual */ }
  const caja = document.createElement("div");
  document.body.appendChild(caja);
  const raiz = createRoot(caja);
  await act(async () => {
    raiz.render(h(AuthContext.Provider, { value: { usuario: null, pedirCuenta: () => {} } },
      h(ContabilidadT4View, { modo: HACER, nodoInicial: D.H5_ID, onBack: () => {} })));
  });
  try {
    assert.ok(caja.querySelector("[data-asj-demo]"), "no salió el «Así se juega»");
    assert.equal(caja.querySelectorAll("[data-t4-h5-demo]").length, 1, "la demo no lleva su propio atributo");
    assert.equal(caja.querySelectorAll("[data-t4-h5]").length, 1, "hay más de un [data-t4-h5] en la página");
    assert.ok(caja.querySelector("[data-t4-h5]").closest("[data-partida]"), "el [data-t4-h5] no es el de la partida");
  } finally { act(() => raiz.unmount()); caja.remove(); }
});

/* ═══════════ 3 · CAMINO, CATÁLOGO, PANEL Y «ASÍ SE JUEGA» ═══════════ */

test("★★★ en T4, justo después de H4: evaluativa, difícil, 50 FP; la vista lo abre", () => {
  assert.deepEqual(clasificacionDe("contabilidad", TEMA_T4, D.H5_ID), { tipo: HACER, modalidad: "evaluativa", dificultad: "dificil", fpBase: 50 });
  const ids = TEMA.actividades.map((x) => x.id);
  assert.equal(ids.indexOf(D.H5_ID), ids.indexOf("t4-el-arqueo-de-rosa") + 1);
  assert.deepEqual(JUEGOS_T4.map((j) => j.id).sort(), actividadesDeTipo(TEMA, HACER).map((a) => a.id).sort());
  assert.equal(JUEGOS_T4.find((j) => j.id === D.H5_ID).Mecanica, AlEmpleadoOAlGasto);
});

test("★★★ la 0204: del rango de la célula, un insert aditivo y repetible, con su comprobación y su deshacer escrito sin correr", () => {
  assert.match(MIGRACION, /\('t4-al-empleado-o-al-gasto',\s*'contabilidad',\s*'efectivo-caja-menor-bancos',\s*'evaluativa',\s*'dificil',\s*50,\s*1\)/);
  assert.match(MIGRACION, /on conflict \(activity_id\) do nothing;/);
  const sentencias = MIGRACION.split("\n").filter((l) => !l.trim().startsWith("--")).join("\n");
  assert.doesNotMatch(sentencias, /\b(alter|update|delete|drop|truncate)\b/i);
  assert.match(sentencias, /select activity_id[\s\S]*where activity_id = 't4-al-empleado-o-al-gasto';\s*$/);
  assert.match(MIGRACION, /^--\s+delete from public\.actividad_catalogo where activity_id = 't4-al-empleado-o-al-gasto';$/m);
  assert.match(MIGRACION, /^-- 0204 — CONTABILIDAD, T4: H5 «¿AL EMPLEADO O AL GASTO\?» \(Célula D\)$/m);
  assert.doesNotMatch(MIGRACION, /arqueo-de-rosa|'medio'/);
  const dir = new URL("supabase/migrations/", RAIZ);
  const archivos = readdirSync(dir);
  assert.ok(archivos.includes("0001_profiles.sql"));
  assert.deepEqual(archivos.filter((f) => readFileSync(new URL(f, dir), "utf8").includes(D.H5_ID)), ["0204_t4_al_empleado_o_al_gasto.sql"]);
  assert.deepEqual(archivos.filter((f) => f.startsWith("0204")), ["0204_t4_al_empleado_o_al_gasto.sql"]);
});

test("★★★ el panel docente: todo item_id tiene etiqueta (empresa y decisión), y la regla vive en el bloque de T4", () => {
  for (const c of D.CASOS_H5) assert.equal(etiquetaDeItem(D.H5_ID, c.id), recortar(`${c.empresa} · ${c.subtema}`), c.id);
  const fuente = leer("src/docente/etiquetasItem.js");
  const bloque = fuente.slice(fuente.indexOf("── T4 «Efectivo, caja menor y bancos» (Célula D) ──"), fuente.indexOf("── Repaso del capítulo 5 (Célula E) ──"));
  assert.match(bloque, /"t4-al-empleado-o-al-gasto": \(id\) => casoDeItemT4H5\(id\),/);
});

test("★★★ «Así se juega»: pasos, ejemplo y texto alternativo de Katsumi; el ejemplo no es de los cuatro; la mano arma las tres líneas y confirma", async () => {
  const asi = ASI_SE_JUEGA[D.H5_ID];
  assert.ok(asi);
  const sec = ASI.slice(ASI.indexOf("## H5 · "), ASI.indexOf("## H6 · "));
  assert.deepEqual([...sec.matchAll(new RegExp(`^  \\d\\. ${CITA}`, "gm"))].map((m) => m[1]), asi.pasos);
  assert.equal(D.EJEMPLO_H5.enunciado, sec.match(new RegExp(`\\*\\*Ejemplo \\(\`demo\`\\):\\*\\* ${CITA}`))[1]);
  assert.equal(asi.alt, sec.match(new RegExp(`\\*\\*Texto alternativo \\(\`alt\`\\):\\*\\* ${CITA}`))[1]);
  assert.match(sec, /La mano pone Gastos generales al debe con 251\.000, Cuentas por cobrar – empleados al debe con 4\.000 y Bancos al haber con 255\.000, y confirma\./);
  assert.deepEqual(D.EJEMPLO_H5.asiento.map((l) => [D.nombreDe(l.cuenta), l.lado, l.valor]), [["Gastos generales", D.DEBE, 251_000], ["Cuentas por cobrar – empleados", D.DEBE, 4_000], ["Bancos", D.HABER, 255_000]]);
  assert.ok(!D.CASOS_H5.some((c) => c.fondo === D.EJEMPLO_H5.fondo && c.gastos === D.EJEMPLO_H5.gastos));
  const m = await montar({ modoDemo: true, items: [D.EJEMPLO_H5] });
  try {
    for (const toque of asi.guion.toques) {
      const el = toque.en ? m.caja.querySelector(toque.en) : boton(m.caja, toque.texto);
      assert.ok(el, `el guion no encuentra «${toque.en ?? toque.texto}»`);
      if (toque.escribe) await escribir(el, toque.escribe); else await tocar(el);
    }
    assert.equal(m.caja.querySelector("[data-panel]").dataset.panel, "acierto");
    assert.equal(m.completados.length, 0);
  } finally { m.desmontar(); }
});
