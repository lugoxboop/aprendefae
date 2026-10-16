import { test } from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { JSDOM, VirtualConsole } from "jsdom";

/*
 * ═══════════════════════════════════════════════════════════════════════════
 * T6 · HACER 2 — «La provisión de El Torito» (Célula B, b5-t6-a2).
 *
 * Vigila LO QUE SE VE, contra el paquete guardado
 * (orquestador/conocimiento/paquetes/b5-t6-act2.md):
 *   · todo texto literal; la D de la parte 1 es la nueva de Futaba
 *   · encabezado, contador «Asiento N de 2», enunciados, rótulos,
 *     instrucciones y el estante (sin montos, con Caja de distractor)
 *   · la prioridad D > C > A > B, parte por parte, con su texto; las B
 *     específicas C15 ($148.800) y C12 ($153.400) y la B «otro valor»
 *   · el asiento revelado tras el error; el acierto sin texto, con la marca
 *   · el libro diario: cerrado, empieza con la provisión de 2007 y crece con
 *     el asiento correcto de cada parte
 *   · el resumen y el puntaje; el ejemplo de «Así se juega» con su explicación
 *   · ninguna cifra fuera de las de El Torito (pp. 200-203)
 *   · la mesa generalizada (contabilidad/cierreConMesa.js) por sí sola
 *
 * LOTE 6b · la fusión de b5-t6-a5 (sección 5 del paquete; hoja de Mai):
 *   · cinco pasos, «Paso N de 5»: P1 → Asiento 1 → P2 → Asiento 2 → P3
 *   · las preguntas de cifra escrita: con o sin «$» y puntos, un intento,
 *     las T con nombre, la general (negativas incluidas) y E4
 *   · la cuenta T: no se mueve, sin huecos mientras se arma un asiento, el
 *     renglón entra al confirmar y queda encendido hasta el paso siguiente,
 *     el saldo solo después de cada respuesta, y el cierre al final
 *   · el diario está desde el principio, plegado, y no se abre solo
 * ═══════════════════════════════════════════════════════════════════════════
 */

const { comprobarMesaE4 } = await import("./b5-mesa-e4.mjs");
const dom = new JSDOM("<!doctype html><html><body></body></html>", { url: "http://localhost/", virtualConsole: new VirtualConsole() });
const w = dom.window;
w.matchMedia = () => ({ matches: false, addEventListener() {}, removeEventListener() {}, addListener() {}, removeListener() {} });
w.requestAnimationFrame = (cb) => setTimeout(() => cb(performance.now()), 0);
w.cancelAnimationFrame = (id) => clearTimeout(id);
for (const [k, v] of Object.entries({
  window: w, document: w.document, navigator: w.navigator,
  HTMLElement: w.HTMLElement, Element: w.Element, Node: w.Node, SVGElement: w.SVGElement,
  Event: w.Event, MouseEvent: w.MouseEvent, KeyboardEvent: w.KeyboardEvent,
  getComputedStyle: w.getComputedStyle.bind(w), matchMedia: w.matchMedia,
  requestAnimationFrame: w.requestAnimationFrame, cancelAnimationFrame: w.cancelAnimationFrame,
})) {
  Object.defineProperty(globalThis, k, { value: v, configurable: true, writable: true });
}
globalThis.IS_REACT_ACT_ENVIRONMENT = true;

const React = await import("react");
const { createRoot } = await import("react-dom/client");
const act = React.act;
const h = React.createElement;

const { default: ProvisionDeElTorito, CONFIG_T6_ACT2 } = await import("../../components/mecanicas/libros/tema6/ProvisionDeElTorito.jsx");
const { MarcoLibros } = await import("../../components/mecanicas/bloques/marcos.jsx");
const M = await import("../cierreConMesa.js");
const L = await import("../t6Act2.js");
const D = await import("../../data/contabilidadT6Act2.js");
const { FAE } = await import("../../theme.js");
const { DEBE, HABER } = await import("../../data/contabilidad.js");

const PARTES = D.PARTES_T6_ACT2;
const PREGUNTAS = D.PREGUNTAS_T6_ACT2;
const PASOS = D.PASOS_T6_ACT2;
const { GASTO, PROVISION, CLIENTES, CAJA } = D;

const montar = async ({ items = undefined, onCompletar = () => {}, modoDemo = false, empezar = true } = {}) => {
  const caja = document.createElement("div");
  document.body.appendChild(caja);
  const raiz = createRoot(caja);
  await act(async () => {
    raiz.render(h(ProvisionDeElTorito, { Marco: MarcoLibros, rotulo: "PRUEBA", titulo: "Prueba", acento: FAE.ambar, onCompletar, items, modoDemo }));
  });
  /* Lote 6c: el ejemplo resuelto es su propio paso; la partida empieza con «Empezar». */
  const empieza = caja.querySelector("[data-boton-empezar] button");
  if (empezar && empieza) await act(async () => { empieza.dispatchEvent(new w.MouseEvent("click", { bubbles: true })); });
  return { caja, desmontar: () => { act(() => raiz.unmount()); caja.remove(); } };
};
const tocar = async (el) => { assert.ok(el, "no hay nada que tocar"); await act(async () => { el.dispatchEvent(new w.MouseEvent("click", { bubbles: true })); }); };
const escribir = async (input, texto) => {
  assert.ok(input, "no hay campo");
  const poner = Object.getOwnPropertyDescriptor(w.HTMLInputElement.prototype, "value").set;
  await act(async () => { poner.call(input, texto); input.dispatchEvent(new w.Event("input", { bubbles: true })); });
};
/* Arma el asiento dado ([{ cuenta, lado, valor }]) y confirma. */
const armar = async (caja, puestas, confirmar = true) => {
  for (const p of puestas) {
    await tocar(caja.querySelector(`[data-sacar="${p.cuenta}:${p.lado}"]`));
    await escribir(caja.querySelector(`[data-campo-cifra="${p.cuenta}"]`), String(p.valor));
  }
  if (confirmar) await tocar(caja.querySelector("[data-confirmar-parte]"));
};
/* Escribe la cifra de la pregunta y comprueba. */
const responder = async (caja, texto) => {
  await escribir(caja.querySelector("[data-pregunta] input[data-campo-cifra]"), texto);
  await tocar(caja.querySelector("[data-confirmar-parte]"));
};
const textoRetro = (caja) => caja.querySelector("[data-texto-retro]")?.textContent ?? null;
const avanzar = async (caja) => tocar(caja.querySelector("[data-boton-avanzar] button"));
const mesaVista = (caja) => [...caja.querySelectorAll("[data-en-mesa]")].map((n) => ({
  cuenta: n.dataset.enMesa, lado: n.closest("[data-columna]").dataset.columna, texto: n.querySelector("input").value,
}));
const sinTexto = (n) => n.textContent.replace(/\s+/g, " ").trim();

const FUENTE = readFileSync(new URL("../../../orquestador/conocimiento/paquetes/b5-t6-act2.md", import.meta.url), "utf8");
const FUTABA = FUENTE.slice(FUENTE.indexOf("## (1) Futaba"), FUENTE.indexOf("## (2) Futaba"));
const textosDeDatos = () => {
  const out = [];
  const recoger = (v, k) => {
    if (typeof v === "string") { if (!["id", "lado", "dificultad", "clave"].includes(k)) out.push(v); }
    else if (Array.isArray(v)) v.forEach((x) => recoger(x, k));
    else if (v && typeof v === "object") for (const [kk, x] of Object.entries(v)) recoger(x, kk);
  };
  for (const [k, v] of Object.entries(D)) if (!["REGLAS_T6_ACT2", "DIARIO_T6_ACT2"].includes(k)) recoger(v, k);
  return out;
};
const d = (cuenta, valor) => ({ cuenta, lado: DEBE, valor });
const hb = (cuenta, valor) => ({ cuenta, lado: HABER, valor });

/* ═══════════ TEXTOS ═══════════ */

test("★★★ todo texto de los datos es literal del paquete guardado (paquetes/b5-t6-act2.md)", () => {
  const textos = textosDeDatos();
  assert.ok(textos.length > 25, `solo ${textos.length} textos`);
  assert.deepEqual(textos.filter((t) => !FUENTE.includes(t)), []);
});

test("★★★ la D de la parte 1 es la nueva de Futaba (E), no la de la tabla; lo demás, de la tabla de Futaba", () => {
  const nueva = "Sobra una cuenta. Este castigo solo mueve la provisión y Cuentas por cobrar – clientes. Todo el castigo va contra la provisión, aunque sea mayor que ella. Y aquí no entra plata.";
  const vieja = "Sobra una cuenta. Este castigo solo mueve la provisión y Cuentas por cobrar – clientes. El gasto ya se anotó en diciembre, y aquí no entra plata.";
  assert.ok(FUTABA.includes(vieja), "guarda: la vieja está en la tabla pegada");
  assert.equal(PARTES[0].errores.D, nueva);
  for (const p of PARTES) {
    for (const k of ["C", "A", "B"]) assert.ok(FUTABA.includes(`\t${p.errores[k]}\t`), `${p.id} ${k}, de la tabla de Futaba`);
    for (const e of p.errores.especificas.filter((x) => x.clave !== "T8")) assert.ok(FUTABA.includes(`\t${e.texto}\t`), `${p.id} ${e.clave}`);
    assert.ok(FUTABA.includes(`Enunciado: «${p.hecho}»`), `${p.id}: el enunciado`);
    assert.ok(FUTABA.includes(`Instrucción: «${p.instruccion}»`), `${p.id}: la instrucción`);
  }
  assert.equal(PARTES[1].errores.D, "Sobra una cuenta. Este hecho solo mueve el gasto y la provisión, como en diciembre de 2007.");
  /* Lote 6b: la T8 de a5 es ahora una B específica del asiento 2; está en la sección 5. */
  assert.equal(PARTES[1].errores.especificas.find((e) => e.clave === "T8").valor, 122200);
  assert.deepEqual([D.T6_ACT2.dificultad, D.T6_ACT2.fpBase], ["dificil", 50], "lote 6b: difícil · 50, los 25 + 25 de a2 y a5");
});

test("★★★ ninguna cifra fuera de las de El Torito (pp. 202-203), y una inventada no pasa", () => {
  const LIBRO = new Set(["148.800", "180.000", "153.400", "31.200", "184.600", "2007", "31", "2.655.000"]);
  const cifras = (t) => [...t.matchAll(/\d[\d.]*\d|\d/g)].map((m) => m[0]);
  assert.deepEqual(cifras("Puso $999.000").filter((c) => !LIBRO.has(c)), ["999.000"], "control");
  const fuera = textosDeDatos().flatMap(cifras).filter((c) => !LIBRO.has(c) && !["1", "2", "3"].includes(c));
  assert.deepEqual(fuera, []);
  const valores = [...PARTES, D.PROVISION_2007_T6_ACT2].flatMap((p) => p.asiento.map((m) => m.valor));
  assert.deepEqual([...new Set(valores)].sort(), [148800, 180000, 184600], "los asientos, con las cifras del libro");
});

test("★★★ ningún componente escribe texto de la actividad", () => {
  const fuentes = ["tema6/ProvisionDeElTorito.jsx", "b5/CierreConMesa.jsx", "b5/LibroDiario.jsx"]
    .map((f) => readFileSync(new URL(`../../components/mecanicas/libros/${f}`, import.meta.url), "utf8"));
  for (const t of textosDeDatos()) {
    if (t.length < 12) continue;
    for (const f of fuentes) assert.ok(!f.includes(t), `texto escrito a mano: «${t.slice(0, 50)}»`);
  }
});

/* ═══════════ LO QUE SE VE ═══════════ */

test("★★★ encabezado, contador «Paso 1 de 5», texto alternativo, la T arriba y, en la pregunta 1, el bloque del estado; el estante sin montos llega con el asiento", async () => {
  const { caja, desmontar } = await montar();
  assert.equal(caja.querySelector("[data-objetivo]").textContent, D.T6_ACT2.objetivo);
  /* Lote 6c: la consigna va plegada bajo «¿Cómo se juega?» (encabezado compacto). */
  assert.equal(caja.querySelector("[data-consigna]"), null);
  await tocar(caja.querySelector("[data-como-se-juega]"));
  assert.equal(caja.querySelector("[data-consigna]").textContent, D.T6_ACT2.consigna);
  assert.deepEqual([...caja.querySelectorAll("[data-encabezado] [data-pasos] li")].map((li) => li.textContent), D.REGLAS_T6_ACT2);
  assert.ok(caja.textContent.includes("Paso 1 de 5"));
  assert.ok(caja.textContent.includes(D.ALT_T6_ACT2));
  /* La T va entre el contador y el paso. */
  const t = caja.querySelector("[data-cuenta-que-se-llena]");
  assert.ok(caja.querySelector("[data-contador]").compareDocumentPosition(t) & 4, "la T, después del contador");
  assert.ok(t.compareDocumentPosition(caja.querySelector("[data-tarjeta-parte]")) & 4, "la T, antes del paso");
  assert.ok(caja.querySelector("[data-bloque-estado]"), "P1 lleva el bloque del estado");
  assert.ok(caja.querySelector("[data-fila-neto]").hasAttribute("data-renglon-activo"), "«El valor neto», encendido");
  assert.equal(caja.querySelector("[data-fila-neto] [data-valor]").textContent, "", "«El valor neto», vacío");
  assert.equal(caja.querySelector("[data-estante]"), null, "en una pregunta no hay estante");
  await responder(caja, "2506200");
  await avanzar(caja);
  assert.ok(caja.textContent.includes("Paso 2 de 5"));
  assert.equal(caja.querySelector("[data-bloque-estado]"), null, "el bloque es solo de P1");
  assert.deepEqual([...caja.querySelectorAll("[data-nombre-estante]")].map((n) => n.textContent), [GASTO, PROVISION, CLIENTES, CAJA]);
  assert.ok(![...caja.querySelectorAll("[data-en-estante]")].some((n) => /\$|\d/.test(n.textContent)), "el estante va sin montos");
  desmontar();
});

test("★★★ los cinco pasos en su orden, cada uno con su texto; «Siguiente» entre pasos; al acertar, solo la marca; el resumen «Bien a la primera»", async () => {
  let pct = null;
  const { caja, desmontar } = await montar({ onCompletar: (p) => { pct = p; } });
  assert.deepEqual(PASOS.map((p) => p.id), ["b5-t6-a2-q1", "b5-t6-a2-p1", "b5-t6-a2-q2", "b5-t6-a2-p2", "b5-t6-a2-q3"]);
  for (const [k, p] of PASOS.entries()) {
    assert.ok(caja.textContent.includes(`Paso ${k + 1} de 5`), `paso ${k + 1}`);
    assert.equal(caja.querySelector("[data-rotulo-parte]").textContent, p.rotulo);
    if (p.tipo === "pregunta") {
      assert.equal(caja.querySelector("[data-hecho]").textContent, p.enunciado);
      assert.equal(caja.querySelector("[data-instruccion]"), null);
      assert.equal(caja.querySelector("[data-confirmar-parte]").textContent, "Comprobar");
      assert.equal(caja.querySelector("[data-un-intento]"), null, "el aviso de los totales es de los asientos");
      /* Bien las tres: con «$», con puntos y sin nada. */
      await responder(caja, ["$2.506.200", "31.200", "153400"][PREGUNTAS.indexOf(p)]);
    } else {
      assert.equal(caja.querySelector("[data-hecho]").textContent, p.hecho);
      assert.equal(caja.querySelector("[data-instruccion]").textContent, p.instruccion);
      await armar(caja, k === 1 ? p.asiento : [d(GASTO, 1), hb(PROVISION, 1)]);
    }
    if (k !== 3) {
      assert.equal(caja.querySelector("[data-panel]").dataset.panel, "acierto", p.id);
      assert.equal(textoRetro(caja), null, "acierto sin texto");
      assert.ok(caja.querySelector("[data-visto-parte]"));
    }
    assert.equal(caja.querySelector("[data-boton-avanzar] button").textContent, k === 4 ? "Ver mi resumen" : "Siguiente");
    await avanzar(caja);
  }
  assert.equal(caja.querySelector("[data-resumen-cierre]").textContent, "Bien a la primera: 4 de 5");
  assert.equal(pct, 80);
  desmontar();
});

/* ═══════════ LAS PREGUNTAS (lote 6b) ═══════════ */

test("★★★ las preguntas: la correcta con o sin «$» y puntos; cada T con su texto; cualquier otra, negativas incluidas, la general", () => {
  const P = Object.fromEntries(PREGUNTAS.map((p) => [p.id.slice(-2), p]));
  assert.deepEqual(PREGUNTAS.map((p) => p.correcta), [2506200, 31200, 153400]);
  for (const t of ["2506200", "2.506.200", "$2.506.200", "$ 2.506.200", " 2506200 "]) assert.equal(L.evaluarPregunta(P.q1, t).ok, true, t);
  const nombradas = [["q1", "2655000", "T1"], ["q1", "$2.803.800", "T2"], ["q2", "0", "T5"], ["q2", "328.800", "T6"], ["q3", "184600", "T9"], ["q3", "$333.400", "T10"]];
  for (const [q, t, clave] of nombradas) {
    const r = L.evaluarPregunta(P[q], t);
    assert.deepEqual([r.ok, r.error, r.texto, r.correcta], [false, clave, P[q].errores.find((e) => e.clave === clave).texto, P[q].correcta], `${q} ${t}`);
  }
  for (const [q, t] of [["q1", "2506201"], ["q2", "-31.200"], ["q2", "−31200"], ["q3", "-184600"], ["q2", "31200000"]]) {
    const r = L.evaluarPregunta(P[q], t);
    assert.deepEqual([r.ok, r.error, r.texto], [false, "general", P[q].general], `${q} ${t}`);
  }
  /* La T9 es la de Shoko: no deja la pista para restar. */
  assert.equal(P.q3.errores.find((e) => e.clave === "T9").texto, "Ese es el valor del ajuste, no el saldo. Antes del ajuste, a la provisión le faltaban $31.200.");
  assert.equal(L.leerRespuesta("$"), null);
  assert.equal(L.formatearRespuesta("-31200"), "-31.200");
  assert.equal(L.formatearRespuesta("$2506200"), "2.506.200");
});

test("★★★ una pregunta mal: un intento, el panel con su texto, y E4: su cifra ✕ tachada y debajo ✓ la correcta; sin coral en el campo", async () => {
  for (const [k, texto, error] of [[0, "2.655.000", "T1"], [2, "-31200", "general"], [4, "184600", "T9"]]) {
    const p = PASOS[k];
    const { caja, desmontar } = await montar({ items: [p] });
    await responder(caja, texto);
    assert.equal(caja.querySelector("[data-panel]").dataset.error, error, p.id);
    assert.equal(textoRetro(caja), error === "general" ? p.general : p.errores.find((e) => e.clave === error).texto);
    const campo = caja.querySelector(`[data-caja-campo="${p.id}"]`);
    assert.equal(campo.dataset.marca, "tachada");
    assert.ok(campo.querySelector('[data-icono="tache"]'));
    assert.equal(campo.querySelector("input").value, L.formatearRespuesta(texto));
    assert.ok(campo.querySelector("input").readOnly, "un solo intento");
    const correcta = caja.querySelector(`[data-valor-correcto="${p.id}"]`);
    assert.ok(correcta.querySelector('[data-icono="visto"]'));
    assert.ok(correcta.textContent.includes(["$2.506.200", "$31.200", "$153.400"][k / 2]));
    assert.equal(caja.querySelector("[data-confirmar-parte]"), null, "no se vuelve a comprobar");
    assert.doesNotMatch(campo.getAttribute("style"), /231, 111, 81|#E76F51/i, "sin coral en el campo");
    desmontar();
  }
});

/* ═══════════ LA CUENTA T (hoja de Mai) ═══════════ */

const vistaT = (caja) => {
  const t = caja.querySelector("[data-cuenta-t]");
  const col = (lado) => [...t.querySelectorAll(`[data-columna="${lado}"] [data-movimiento]`)].map((m) => `${[...m.querySelectorAll("p")].map(sinTexto).join(" · ")}${m.hasAttribute("data-renglon-activo") ? " *" : ""}`);
  const saldo = t.querySelector("[data-saldo]");
  return { debe: col("debe"), haber: col("haber"), saldo: saldo ? `${saldo.dataset.saldo}${saldo.textContent ? `: ${sinTexto(saldo)}` : ""}` : null };
};

test("★★★ la T: no se mueve, sin huecos al armar; cada renglón entra al confirmar, encendido hasta el paso siguiente; el saldo, solo tras cada respuesta; el cierre al final", async () => {
  const { caja, desmontar } = await montar();
  /* «$148.800 · 31 de diciembre de 2007»: el monto y, debajo, la fecha (la de la fila del diario). */
  const H07 = "$148.800 · 31 de diciembre de 2007";
  const MAR = "$180.000 · Marzo del año siguiente";
  const DIC = "$184.600 · 31 de diciembre del año siguiente";
  const nodoT = caja.querySelector("[data-cuenta-que-se-llena]");
  const paso = async () => { await avanzar(caja); assert.equal(caja.querySelector("[data-cuenta-que-se-llena]"), nodoT, "la T es la misma: no se vuelve a montar"); };
  /* P1: el HABER de 2007 y su saldo. */
  assert.deepEqual(vistaT(caja), { debe: [], haber: [H07], saldo: "normal: El saldo queda en $148.800" });
  await responder(caja, "2506200");
  assert.equal(sinTexto(caja.querySelector("[data-fila-neto] [data-valor]")), "$2.506.200");
  assert.ok(!caja.querySelector("[data-fila-neto]").hasAttribute("data-renglon-activo"));
  await paso();
  /* Asiento 1: mientras se arma, ningún hueco. */
  await armar(caja, PARTES[0].asiento, false);
  assert.deepEqual(vistaT(caja), { debe: [], haber: [H07], saldo: "normal: El saldo queda en $148.800" }, "sin huecos mientras se arma");
  await tocar(caja.querySelector("[data-confirmar-parte]"));
  assert.deepEqual(vistaT(caja), { debe: [`${MAR} *`], haber: [H07], saldo: null }, "entra al confirmar, encendido");
  await paso();
  /* P2: el renglón se apaga; el hueco del saldo, en las dos columnas. */
  assert.deepEqual(vistaT(caja), { debe: [MAR], haber: [H07], saldo: "hueco" });
  await responder(caja, "0"); // falla: entra igual lo correcto
  assert.deepEqual(vistaT(caja), { debe: [MAR], haber: [H07], saldo: "en-contra: Le faltan $31.200" });
  await paso();
  /* Asiento 2: falla; entra el asiento correcto igual. */
  await armar(caja, [d(GASTO, 153400), hb(PROVISION, 153400)]);
  assert.deepEqual(vistaT(caja), { debe: [MAR], haber: [H07, `${DIC} *`], saldo: null });
  await paso();
  assert.deepEqual(vistaT(caja), { debe: [MAR], haber: [H07, DIC], saldo: "hueco" });
  assert.equal(caja.querySelector("[data-cierre-t]"), null);
  await responder(caja, "153.400");
  assert.deepEqual(vistaT(caja), { debe: [MAR], haber: [H07, DIC], saldo: "normal: El saldo queda en $153.400" });
  assert.equal(sinTexto(caja.querySelector("[data-cierre-t]")), D.T6_ACT2.cierre);
  assert.equal(caja.querySelector("[data-anuncio]").textContent, "El saldo queda en $153.400");
  desmontar();
});

/* Los errores, parte por parte: lo que se arma y el error que manda. */
const CASOS = [
  [0, "D", [d(PROVISION, 180000), hb(CLIENTES, 180000), d(CAJA, 0)], "Caja (C11)"],
  [0, "D", [d(GASTO, 31200), d(PROVISION, 148800), hb(CLIENTES, 180000)], "el gasto (C8): D manda sobre la C15"],
  [0, "C", [hb(PROVISION, 180000), d(CLIENTES, 180000)], "al revés"],
  [0, "A", [d(PROVISION, 180000)], "falta Clientes"],
  [0, "C", [hb(PROVISION, 180000)], "al revés y falta Clientes: C manda sobre A"],
  [0, "C15", [d(PROVISION, 148800), hb(CLIENTES, 148800)], "lo provisionado en vez de lo castigado"],
  [0, "B", [d(PROVISION, 18000), hb(CLIENTES, 18000)], "otro valor"],
  [1, "D", [d(GASTO, 184600), hb(PROVISION, 184600), d(CLIENTES, 0)], "Clientes sobra"],
  [1, "C", [hb(GASTO, 184600), d(PROVISION, 184600)], "al revés"],
  [1, "A", [hb(PROVISION, 184600)], "falta el gasto"],
  [1, "C12", [d(GASTO, 153400), hb(PROVISION, 153400)], "sin lo que faltó"],
  [1, "T8", [d(GASTO, 122200), hb(PROVISION, 122200)], "lo que faltó, restado (la T8 de a5, lote 6b)"],
  [1, "B", [d(GASTO, 31200), hb(PROVISION, 31200)], "otro valor"],
];

test("★★★ la prioridad D > C > A > B con su texto en el panel, las B específicas (C15, C12, T8), y E4: la mesa del estudiante se queda, con lo correcto junto", async () => {
  for (const [k, tipo, puestas, nota] of CASOS) {
    const p = PARTES[k];
    const { caja, desmontar } = await montar({ items: [p] });
    await armar(caja, puestas);
    assert.equal(caja.querySelector("[data-panel]").dataset.error, tipo, `${p.id}: ${nota}`);
    const esperado = tipo === "D" ? M.textoD(p, puestas) : tipo.startsWith("C1") || tipo === "T8" ? p.errores.especificas.find((e) => e.clave === tipo).texto : p.errores[tipo];
    assert.equal(textoRetro(caja), esperado, `${p.id} ${tipo}: el texto`);
    comprobarMesaE4(caja, p, puestas, `${p.id} ${tipo}`);
    desmontar();
  }
});

test("★★★ el libro diario: está desde el principio, plegado; nada dos veces (lote 6c): se abre con cada asiento confirmado y se pliega al empezar el paso siguiente; empieza con la provisión de 2007 y suma lo correcto de cada asiento, no las preguntas", async () => {
  const { caja, desmontar } = await montar();
  const alternar = () => caja.querySelector("[data-diario-alternar]");
  const fechas = () => [...caja.querySelectorAll("[data-fecha-diario]")].map((n) => n.textContent);
  const lineas = () => [...caja.querySelectorAll("[data-libro-diario] [data-movimiento]")].map((n) => n.dataset.movimiento);
  assert.ok(caja.querySelector("[data-libro-diario]"), "está desde el principio: la T no salta cuando llega");
  assert.equal(alternar().getAttribute("aria-expanded"), "false");
  assert.equal(caja.querySelector("[data-diario-cuenta]").textContent, "1 asiento");
  await responder(caja, "2506200");
  await avanzar(caja);
  assert.equal(caja.querySelector("[data-diario-cuenta]").textContent, "1 asiento", "una pregunta no es un asiento");
  assert.equal(alternar().getAttribute("aria-expanded"), "false", "mientras se arma, plegado");
  await armar(caja, [d(GASTO, 180000), hb(CLIENTES, 180000)]); // falla (D): el diario suma lo correcto
  assert.equal(alternar().getAttribute("aria-expanded"), "true", "se abre con el asiento nuevo");
  assert.equal(caja.querySelector("[data-diario-cabecera]").textContent, "LIBRO DIARIO");
  assert.deepEqual(lineas(), [`debe:${GASTO}`, `haber:${PROVISION}`, `debe:${PROVISION}`, `haber:${CLIENTES}`]);
  /* Las mismas fechas que los renglones de la T. */
  assert.deepEqual(fechas(), ["31 de diciembre de 2007", "Marzo del año siguiente"]);
  await avanzar(caja);
  assert.equal(alternar().getAttribute("aria-expanded"), "false", "se pliega al empezar el paso siguiente");
  await responder(caja, "31200");
  assert.equal(alternar().getAttribute("aria-expanded"), "false", "una pregunta no lo abre");
  await avanzar(caja);
  await armar(caja, PARTES[1].asiento);
  assert.deepEqual(fechas(), ["31 de diciembre de 2007", "Marzo del año siguiente", "31 de diciembre del año siguiente"]);
  assert.equal(caja.querySelector("[data-diario-cuenta]").textContent, "3 asientos");
  assert.ok(![...caja.querySelectorAll("[data-libro-diario] *")].some((n) => n.style?.color === "rgb(231, 111, 81)"), "el diario no marca error");
  desmontar();
});

test("★★★ «Así se juega»: el ejemplo de 2007, solo la mesa (sin diario ni encabezado), y termina con sus cuatro líneas", async () => {
  const { caja, desmontar } = await montar({ items: [D.PROVISION_2007_T6_ACT2], modoDemo: true });
  assert.equal(caja.querySelector("[data-libro-diario]"), null);
  assert.equal(caja.querySelector("[data-objetivo]"), null);
  assert.equal(caja.querySelector("[data-hecho]").textContent, D.PROVISION_2007_T6_ACT2.hecho);
  await armar(caja, D.PROVISION_2007_T6_ACT2.asiento);
  assert.deepEqual([...caja.querySelectorAll("[data-resolucion] p")].map((p) => p.textContent), D.PROVISION_2007_T6_ACT2.resolucion);
  assert.equal(D.PROVISION_2007_T6_ACT2.resolucion[1], "Provisión para deudas incobrables sube: va al Haber.", "la provisión sube por el Haber (Shoko)");
  desmontar();
});

/* ═══════════ LA MESA GENERALIZADA ═══════════ */

test("★★★ cierreConMesa: D > C > A > B; una B específica por valor, por cuenta o por las dos; si no se cumple, la B general", () => {
  const parte = {
    asiento: [d("X", 10), hb("Y", 10)],
    errores: {
      D: "d", C: "c", A: "a", B: "b",
      especificas: [{ valor: 7, clave: "V", texto: "v" }, { cuenta: "Y", clave: "K", texto: "k" }, { cuenta: "X", valor: 3, clave: "XV", texto: "xv" }],
    },
  };
  const ev = (p) => M.evaluarParte(parte, p);
  assert.deepEqual([ev([d("X", 10), hb("Y", 10)]).ok, ev([d("X", 10), hb("Y", 10)]).error], [true, null]);
  assert.equal(ev([d("X", 10), hb("Y", 10), d("Z", 1)]).error, "D");
  assert.equal(ev([hb("X", 10), d("Y", 10)]).error, "C");
  assert.equal(ev([d("X", 10)]).error, "A");
  assert.equal(ev([hb("X", 10)]).error, "C", "al revés y falta una: manda C");
  assert.deepEqual([ev([d("X", 7), hb("Y", 7)]).error, ev([d("X", 7), hb("Y", 7)]).texto], ["V", "v"], "por valor, la primera que se cumple");
  assert.deepEqual([ev([d("X", 10), hb("Y", 9)]).error, ev([d("X", 10), hb("Y", 9)]).texto], ["K", "k"], "por cuenta, cualquier valor equivocado");
  assert.deepEqual([ev([d("X", 3), hb("Y", 10)]).error, ev([d("X", 3), hb("Y", 10)]).texto], ["XV", "xv"], "por cuenta y valor");
  assert.deepEqual([ev([d("X", 4), hb("Y", 10)]).error, ev([d("X", 4), hb("Y", 10)]).texto], ["B", "b"], "ninguna se cumple: la general");
  assert.equal(ev([d("X", 4), hb("Y", 10)]).deValor, true);
  assert.equal(ev([hb("X", 10), d("Y", 10)]).deValor, false);
  assert.deepEqual(M.totalesDe([d("X", 2), d("Z", 3), hb("Y", 4)]), { debe: 5, haber: 4 });
  assert.equal(M.puntuar([{ ok: true }, { ok: false }], 2), 50);
  assert.equal(CONFIG_T6_ACT2.evaluar, M.evaluarParte);
});

test("★★ identificadores con b5-t6-a2", () => {
  assert.equal(D.T6_ACT2.id, "b5-t6-a2");
  assert.deepEqual([D.PROVISION_2007_T6_ACT2, ...PARTES].map((p) => p.id), ["b5-t6-a2-tutorial", "b5-t6-a2-p1", "b5-t6-a2-p2"]);
  assert.deepEqual(PREGUNTAS.map((p) => p.id), ["b5-t6-a2-q1", "b5-t6-a2-q2", "b5-t6-a2-q3"]);
});
