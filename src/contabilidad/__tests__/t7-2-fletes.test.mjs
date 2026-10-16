import { test } from "node:test";
import assert from "node:assert/strict";
import { readFileSync, readdirSync } from "node:fs";
import { JSDOM, VirtualConsole } from "jsdom";
import { conCorreccionesDeMello } from "./correccionesMello.mjs";
import { ENTREGA5, E5_MELLO, MELLO_E5_FLETES, entrega5ConMello, seccionFusion } from "./correccionesMelloFusiones.mjs";

/*
 * ═══════════════════════════════════════════════════════════════════════════
 * T7-2 · A5 «Fletes y devoluciones en permanente» (Célula C) · Aprender ·
 * LA FUSIÓN DE A5 Y A6.
 *
 *   · la pieza es la sección 1 de la entrega 5 de Near
 *     (lote1-entrega5-v1.md) con las correcciones obligatorias de Mello
 *     encima (P1, P2 y la línea del resumen), letra por letra y en los dos
 *     sentidos
 *   · lo que el paquete pliega como «Ver…» son los asientos de G-3 y G-4, tal
 *     como estaban en A6; ninguna cifra de X3 ni de X4
 *   · se recorre entera, estado por estado: al llegar, la pista, el 2.º
 *     error, el acierto con su figura (que no se adelanta), el «¿Por qué?»
 *     plegado, «Ver…» que se abre, el foco en el mensaje; en las líneas de
 *     Debe o Haber, la escalera de líneas
 *   · fuera del catálogo de FP; en T7-2 después de A4 y antes de H5; A6 salió
 * ═══════════════════════════════════════════════════════════════════════════
 */

const dom = new JSDOM("<!doctype html><html><body></body></html>", { url: "http://localhost/", virtualConsole: new VirtualConsole() });
const w = dom.window;
w.matchMedia = () => ({ matches: false, addEventListener() {}, removeEventListener() {}, addListener() {}, removeListener() {} });
for (const [k, v] of Object.entries({
  window: w, document: w.document, navigator: w.navigator, localStorage: w.localStorage,
  HTMLElement: w.HTMLElement, Element: w.Element, Node: w.Node, SVGElement: w.SVGElement,
  Event: w.Event, MouseEvent: w.MouseEvent, KeyboardEvent: w.KeyboardEvent,
  getComputedStyle: w.getComputedStyle.bind(w), matchMedia: w.matchMedia,
})) {
  Object.defineProperty(globalThis, k, { value: v, configurable: true, writable: true });
}
globalThis.IS_REACT_ACT_ENVIRONMENT = true;

const React = await import("react");
const { createRoot } = await import("react-dom/client");
const act = React.act;
const h = React.createElement;

const A = await import("../../data/contabilidadT7_2_a5.js");
const A6 = await import("../../data/contabilidadT7_2_a6.js");
const { cifraK } = await import("../t7_2Kardex.js");
const { SUBJECTS, APRENDER } = await import("../../data/subjects.js");
const { textosDelError, textosDeLinea, sinAsiEs } = await import("../../components/mecanicas/libros/t7/escaleraAyuda.js");
const { default: PantallasT7_2, BOTON, INTERFAZ, PENDIENTE_DE_REVISION } = await import("../../components/mecanicas/libros/t7/PantallasT7_2.jsx");
const { PIEZAS_T7_2, TEMA_T7_2 } = await import("../../components/ContabilidadT7_2View.jsx");

const RAIZ = new URL("../../../", import.meta.url);
const leer = (f) => readFileSync(new URL(f, RAIZ), "utf8");
const P = A.PIEZA_FLETES;
const S = seccionFusion(entrega5ConMello(), "## 1. T7-2 · «");
const pantalla = (id) => P.pantallas.find((x) => x.id === id);
const s = (id) => S.pantallas.find((x) => x.id === id);
const A6P = (id) => A6.PIEZA_DEVOLUCIONES.pantallas.find((x) => x.id === id);

/* Qué opción (o línea) nombra cada clave de error del paquete. */
const CLAVES = {
  "lo-asume-el-comprador": { "Compras (fletes)": ["compras"], "Gasto de venta": ["gasto"] },
  "lo-asume-el-vendedor": { "Compras (fletes)": ["compras"], "Inventario (fletes)": ["inventario"] },
  "libro-del-comprador": { "Devoluciones de compras": ["devoluciones"], Compras: ["compras"] },
  "libro-del-vendedor": { inventario: ["inventario"], costo: ["costo"] },
  "frente-al-periodico": { gastos: ["gastos"], "no se registran": ["no-se-registran"] },
};

/* ═══════════ 1 · LOS DATOS, CONTRA EL PAQUETE CON MELLO ═══════════ */

test("★★★ las correcciones de Mello entran en el paquete y salen los textos viejos («paga $650.000», «un segundo asiento»)", () => {
  const corregido = entrega5ConMello();
  for (const [viejo, nuevo] of E5_MELLO) {
    assert.equal(ENTREGA5.split(viejo).length - 1, 1, `el paquete trae una vez ${viejo}`);
    assert.ok(!corregido.includes(viejo), viejo);
    assert.ok(corregido.includes(nuevo), nuevo);
    assert.ok(MELLO_E5_FLETES.includes(nuevo), nuevo);
  }
  assert.equal(E5_MELLO.length, 3);
  const todo = JSON.stringify(P);
  assert.ok(!todo.includes("paga $650.000"), "«paga $650.000» volvió");
  assert.equal(pantalla("lo-asume-el-comprador").parrafos[0], E5_MELLO[0][1].slice(1, -1));
  assert.equal(pantalla("lo-asume-el-vendedor").parrafos[0], E5_MELLO[1][1].slice(1, -1));
  assert.equal(pantalla("resumen").parrafos[2], E5_MELLO[2][1].slice(1, -1));
});

test("★★★ pantallas, tipos, opciones, pista, errores, acierto y ¿Por qué?: los del paquete con Mello, letra por letra", () => {
  assert.equal(P.titulo, S.titulo);
  assert.equal(P.titulo, "Fletes y devoluciones en permanente");
  assert.deepEqual(P.pantallas.map((p) => [p.id, p.tipo]), S.pantallas.map((x) => [x.id, x.tipo]));
  assert.deepEqual(S.pantallas.map((x) => x.k), S.pantallas.map((_, k) => k));
  /* `el-asiento-del-costo` salió (ya lo enseña A2), y también las lecturas `la-regla` y `que-es`. */
  for (const id of ["el-asiento-del-costo", "la-regla", "que-es"]) assert.equal(pantalla(id), undefined, id);
  for (const x of S.pantallas.filter((y) => y.tipo === "eleccion" || y.tipo === "lados")) {
    const p = pantalla(x.id);
    const items = p.opciones ?? p.lineas;
    /* Las opciones, o las líneas con su monto («Inventario de mercancías $960.000»). */
    assert.deepEqual(items.map((o) => o.texto ?? `${o.cuenta} $${cifraK(o.monto)}`), x.opciones, `${x.id}: opciones`);
    assert.equal(p.pista, x.pista ?? undefined, `${x.id}: pista`);
    const nombradas = new Set();
    for (const e of x.errores) {
      const ids = CLAVES[x.id][e.clave];
      assert.ok(ids, `${x.id}: clave sin opción: ${e.clave}`);
      for (const id of ids) {
        const o = items.find((y) => y.id === id);
        assert.ok(o && !o.correcta, `${x.id}: ${id}`);
        assert.equal(o.devolucion, e.texto, `${x.id}: error · ${e.clave}`);
        nombradas.add(id);
      }
    }
    if (p.opciones) {
      assert.deepEqual(p.opciones.filter((o) => !nombradas.has(o.id)).map((o) => o.id), p.opciones.filter((o) => o.correcta).map((o) => o.id), `${x.id}: la correcta`);
      assert.equal(p.opciones.filter((o) => o.correcta).length, 1);
    } else assert.deepEqual([...nombradas].sort(), p.lineas.map((l) => l.id).sort(), `${x.id}: cada línea con su error`);
    assert.equal(p.acierto.texto, x.acierto.texto, `${x.id}: acierto`);
    /* El «¿Por qué?» del paquete: lo plegado y, si lo trae, el «Ver…» de los asientos, en ese orden. */
    assert.equal([p.acierto.porque, p.acierto.ver?.texto].filter(Boolean).join(" ") || null, x.porque, `${x.id}: ¿Por qué?`);
  }
});

test("★★★ las pistas de las líneas de P4: la del costo es del paquete; la del inventario, la del lote 2 para esa misma línea en A6", () => {
  const p = pantalla("libro-del-vendedor");
  assert.deepEqual(s("libro-del-vendedor").pistasDeLinea, { costo: p.lineas.find((l) => l.id === "costo").pista });
  const L2 = conCorreccionesDeMello(leer("orquestador/conocimiento/paquetes/lote2-pistas-v1.md"));
  const fila = L2.split("\n").find((l) => l.startsWith("| P3 · `libro-del-vendedor` · inventario ² |"));
  assert.ok(fila, "no está la fila del lote 2");
  assert.equal(p.lineas.find((l) => l.id === "inventario").pista, fila.split(" | ")[2].replace(/^«|»$/g, ""));
  assert.equal(p.lineas.find((l) => l.id === "inventario").pista, A6P("libro-del-vendedor").lineas.find((l) => l.id === "inventario").pista);
  assert.deepEqual(p.lineas.map((l) => [l.id, l.lado, l.monto]), [["inventario", A.DEBE, 960_000], ["costo", A.HABER, 960_000]]);
});

/* Lo que se ve al llegar, en su orden: objetivo, figura (sus líneas), párrafos, pregunta o consigna. */
const lineasDeFigura = (f) => (!f ? [] : f.tipo === "fichas" ? f.fichas : f.tipo === "cuenta" ? [f.texto] : f.filas.map((r) => `${r.rot} $${cifraK(r.v)}`));
const lineasAlLlegar = (p) => [p.objetivo, ...lineasDeFigura(p.figura), ...(p.parrafos ?? []), p.pregunta, p.consigna].filter(Boolean);

test("★★★ cada línea visible del paquete está en los datos, en su orden, y nada más; las figuras del acierto también", () => {
  for (const x of S.pantallas) assert.deepEqual(lineasAlLlegar(pantalla(x.id)), x.lineas, x.id);
  /* Las figuras del acierto, letra por letra (las cifras van sin «$» en los renglones, como en el kárdex). */
  for (const x of S.pantallas.filter((y) => y.acierto)) {
    const f = pantalla(x.id).acierto.figura;
    assert.equal(lineasDeFigura(f).join(" ") || null, x.acierto.figura, `${x.id}: la figura del acierto`);
  }
  assert.deepEqual(S.pantallas.filter((x) => x.acierto?.figura).map((x) => x.id), ["lo-asume-el-comprador", "libro-del-comprador", "libro-del-vendedor"]);
  /* La figura del resumen: las tres fichas del paquete. */
  assert.match(s("resumen").figura, /^tres fichas: flete del comprador, flete del vendedor y devolución$/);
  assert.equal(pantalla("resumen").figura.fichas.length, 3);
});

/* ═══════════ 2 · LOS ASIENTOS Y LAS CIFRAS ═══════════ */

test("★★★ lo que se abre con «Ver…» son los asientos de G-3 y G-4, tal como estaban en A6", () => {
  const g3 = pantalla("libro-del-comprador").acierto.ver;
  assert.deepEqual(g3.asientos, A6P("libro-del-comprador").acierto.asientos);
  const g4 = pantalla("libro-del-vendedor").acierto.ver;
  /* El primer asiento de la devolución (Devoluciones de ventas) y el segundo, el que la pantalla pide colocar. */
  assert.deepEqual(g4.asientos[0], A6P("libro-del-vendedor").asientos[1]);
  assert.deepEqual(g4.asientos[1].lineas, A6P("libro-del-vendedor").lineas.map((l) => ({ cuenta: l.cuenta, lado: l.lado, monto: l.monto })));
  assert.equal(g4.asientos[1].fecha, "22 de marzo");
  /* Los datos: 300 unidades a $8.000 y a $3.200. */
  const D = A.DATOS_DEVOLUCION;
  assert.deepEqual([D.devueltas, D.precio, D.costo], [A6.DATOS_A6.devueltas, A6.DATOS_A6.precio, A6.DATOS_A6.costo]);
});

test("★★★ X3 y X4: ninguna cifra de las listas de control; solo los datos y sus productos", () => {
  const todo = JSON.stringify(P);
  for (const x of [...A.X3, ...A.X4]) {
    assert.ok(!todo.includes(cifraK(x)), `${cifraK(x)} se ve`);
    assert.ok(!new RegExp(`[^\\d]${x}[^\\d]`).test(todo), `${x} está en los datos`);
  }
  assert.deepEqual(A.X3, [1_200_000, 262_500, 8_437_500, 6_500, 643_500, 8_700_000]);
  assert.deepEqual(A.X4, A6.X4);
  const asientos = P.pantallas.flatMap((p) => [...(p.acierto?.ver?.asientos ?? []), ...(p.acierto?.asientos ?? [])]);
  const montos = new Set([...asientos.flatMap((a) => a.lineas), ...P.pantallas.flatMap((p) => p.lineas ?? [])].map((l) => l.monto).filter((m) => m !== null));
  assert.deepEqual([...montos].sort((a, b) => a - b), [960_000, 2_400_000]);
});

/* ═══════════ 3 · PANTALLAS Y ESTADOS ═══════════ */

const montar = async (el) => {
  const caja = document.createElement("div");
  document.body.appendChild(caja);
  const raiz = createRoot(caja);
  await act(async () => { raiz.render(el); });
  return { caja, desmontar: () => { act(() => raiz.unmount()); caja.remove(); } };
};
const tocar = async (el) => {
  assert.ok(el, "no está el elemento que se quería tocar");
  await act(async () => { el.dispatchEvent(new w.MouseEvent("click", { bubbles: true })); });
};
const boton = (caja, n) => caja.querySelector(`[data-boton="${n}"]`);
const lado = (caja, linea, cual) => caja.querySelector(`[data-linea="${linea}"][data-lado="${cual}"]`);
const otro = (l) => (l === A.DEBE ? A.HABER : A.DEBE);
const filasDeAsiento = (el) => [...el.querySelectorAll("[data-linea]")].map((r) => [...r.querySelectorAll("[role=rowheader], [role=cell]")].map((c) => (c.querySelector("[data-oculto]") ? "●" : c.textContent)));
const enTabla = (asiento) => asiento.lineas.map((l) => {
  const m = l.monto === null ? "●" : cifraK(l.monto);
  return [l.cuenta, l.lado === A.DEBE ? m : "", l.lado === A.HABER ? m : ""];
});

/*
 * Lo que se lee en la pieza: los textos (sin lo plegado), las figuras, el
 * «Ver…», los botones y el pie, en el orden del documento. Las opciones
 * aparte, ordenadas (van barajadas).
 */
function enPantalla(caja) {
  const out = [];
  const opciones = [];
  for (const el of caja.querySelector("[data-pieza]").querySelectorAll("[data-texto], [data-opcion], [data-boton], [data-pie], [data-palabra], [data-figura-t72]")) {
    if (el.matches("[data-opcion]")) { opciones.push(el.textContent); continue; }
    if (el.matches("[data-figura-t72]")) { out.push(`[figura] ${[...el.querySelectorAll("[data-renglon], p, li")].map((x) => (x.matches("[data-renglon]") ? [...x.children].map((y) => y.textContent).join(" ") : x.textContent)).join(" | ")}`); continue; }
    const x = el.cloneNode(true);
    for (const pl of x.querySelectorAll("[data-plegado]")) pl.remove();
    out.push(x.textContent);
  }
  return { textos: out, opciones: opciones.sort() };
}
const figuraEnPantalla = (f) => `[figura] ${f.tipo === "renglones" ? f.filas.map((r) => `${r.rot} ${cifraK(r.v)}`).join(" | ") : f.tipo === "cuenta" ? f.texto : f.fichas.join(" | ")}`;
const alLlegar = (p) => [p.objetivo, ...(p.figura ? [figuraEnPantalla(p.figura)] : []), ...(p.parrafos ?? []), p.pregunta, p.consigna].filter(Boolean);
/* Lo que sale con el acierto: «Correcto.», el texto, la figura, el «Ver…». */
const conAcierto = (a) => [INTERFAZ.correcto, a.texto, ...(a.figura ? [figuraEnPantalla(a.figura)] : []), ...(a.ver ? [a.ver.texto] : [])];

/* El «¿Por qué?» plegado del mensaje del acierto (si lo hay) y el «Ver…» que abre los asientos. */
async function plegadoYVer(caja, p) {
  const a = p.acierto;
  const msj = caja.querySelector('[data-mensaje="acierto"]');
  assert.equal(w.document.activeElement, msj, `${p.id}: el foco va al mensaje del acierto`);
  if (a.porque) {
    const pl = msj.querySelector("[data-plegado]");
    assert.equal(pl.textContent, ` ${a.porque}`);
    assert.equal(pl.hidden, true, `${p.id}: el ¿Por qué? va plegado`);
    const por = msj.querySelector("[data-por-que]");
    assert.equal(por.getAttribute("aria-expanded"), "false");
    await tocar(por);
    assert.equal(msj.querySelector("[data-plegado]").hidden, false);
  } else assert.equal(msj.querySelector("[data-por-que]"), null, `${p.id}: un ¿Por qué? sin texto`);
  if (a.ver) {
    const b = caja.querySelector("[data-ver] button");
    assert.equal(b.getAttribute("aria-expanded"), "false");
    assert.equal(b.dataset.boton, undefined, "no es un botón de interfaz");
    assert.equal(caja.querySelector("[data-visto]"), null, `${p.id}: los asientos se ven sin abrir`);
    await tocar(b);
    assert.equal(b.getAttribute("aria-expanded"), "true");
    const abierto = caja.querySelector("[data-visto]");
    assert.equal(b.getAttribute("aria-controls"), abierto.id);
    const as = [...abierto.querySelectorAll("[data-asiento]")];
    assert.deepEqual(as.map(filasDeAsiento), a.ver.asientos.map(enTabla));
    /* El monto oculto es la casilla vacía discontinua: nunca un «●» suelto. */
    for (const o of abierto.querySelectorAll("[data-oculto]")) {
      assert.equal(o.textContent, PENDIENTE_DE_REVISION.montoOculto);
      assert.ok(o.querySelector("i[aria-hidden=true]"));
    }
    assert.ok(!abierto.textContent.includes("●"));
    await tocar(b);
    assert.equal(caja.querySelector("[data-visto]"), null);
  } else assert.equal(caja.querySelector("[data-ver]"), null);
}

test("★★★ cada pantalla y cada estado muestran exactamente sus textos, su figura y su pie; lo del acierto no se adelanta", async () => {
  const m = await montar(h(PantallasT7_2, { pieza: P, rotulo: "R" }));
  const vistos = [];
  try {
    for (const p of P.pantallas) {
      assert.equal(m.caja.querySelector("[data-pieza]").dataset.pantalla, p.id);
      if (p.tipo === "lados") {
        const lineas = [...m.caja.querySelectorAll("[data-fila]")].map((f) => p.lineas.find((l) => l.id === f.dataset.fila));
        const filas = (malas = [], n = 0) => lineas.flatMap((l) => [l.cuenta, ...(malas.includes(l.id) ? [INTERFAZ.incorrecto, ...textosDeLinea(p, l, n)] : [])]);
        assert.deepEqual(enPantalla(m.caja).textos, [...alLlegar(p), ...filas(), BOTON.confirmar, p.pie], "lados colocando");
        assert.equal(m.caja.querySelector("[data-figura]"), null, "la figura del acierto se adelanta");
        for (const l of p.lineas) await tocar(lado(m.caja, l.id, otro(l.lado)));
        await tocar(boton(m.caja, "confirmar"));
        assert.deepEqual(enPantalla(m.caja).textos, [...alLlegar(p), ...filas(lineas.map((l) => l.id), 1), BOTON.probarOtra, p.error.pie], "lados error 1: la pista");
        for (const l of p.lineas) assert.deepEqual(textosDeLinea(p, l, 1), [l.pista]);
        assert.equal(w.document.activeElement, m.caja.querySelector("[data-mensaje]"), "el foco va al primer mensaje");
        assert.equal(m.caja.querySelector("[data-figura]"), null, "la figura del acierto, con el error");
        await tocar(boton(m.caja, "probar-otra"));
        for (const l of p.lineas) await tocar(lado(m.caja, l.id, otro(l.lado)));
        await tocar(boton(m.caja, "confirmar"));
        assert.deepEqual(enPantalla(m.caja).textos, [...alLlegar(p), ...filas(lineas.map((l) => l.id), 2), BOTON.probarOtra, p.error.pie], "lados error 2: la respuesta y su porqué");
        for (const l of p.lineas) assert.deepEqual(textosDeLinea(p, l, 2), [`La respuesta es «${l.lado === A.DEBE ? "Debe" : "Haber"}».`, l.devolucion]);
        await tocar(boton(m.caja, "probar-otra"));
        /* Cerradas: quedan en su lado y no se mueven. */
        for (const l of p.lineas) {
          assert.equal(lado(m.caja, l.id, l.lado).getAttribute("aria-pressed"), "true", `${l.id}: no quedó en su lado`);
          await tocar(lado(m.caja, l.id, otro(l.lado)));
          assert.equal(lado(m.caja, l.id, l.lado).getAttribute("aria-pressed"), "true", `${l.id}: se movió`);
        }
        await tocar(boton(m.caja, "confirmar"));
        assert.deepEqual(enPantalla(m.caja).textos, [...alLlegar(p), ...filas(), ...conAcierto(p.acierto), BOTON.seguir, p.acierto.pie], "lados acierto");
        await plegadoYVer(m.caja, p);
        vistos.push(`${p.id}:colocando`, `${p.id}:error`, `${p.id}:error2`, `${p.id}:acierto`);
        await tocar(boton(m.caja, "seguir"));
        continue;
      }
      if (p.tipo !== "eleccion") {
        assert.deepEqual(enPantalla(m.caja).textos, [...alLlegar(p), p.boton, p.pie].filter(Boolean), p.id);
        vistos.push(p.id);
        if (p.boton) await tocar(m.caja.querySelector("[data-boton]"));
        continue;
      }
      const cab = alLlegar(p);
      const ops = p.opciones.map((o) => o.texto).sort();
      assert.deepEqual(enPantalla(m.caja), { textos: [...cab, BOTON.confirmar, p.pie], opciones: ops }, `${p.id} colocando`);
      assert.equal(m.caja.querySelector("[data-figura], [data-ver], [data-asiento]"), null, `${p.id}: lo del acierto se adelanta`);
      vistos.push(`${p.id}:colocando`);
      /* La escalera de ayuda: el 1.er error da la pista; el 2.º, la respuesta con su porqué. */
      const malas = p.opciones.filter((x) => !x.correcta);
      for (const [i, o] of malas.entries()) {
        await tocar(m.caja.querySelector(`[data-opcion="${o.id}"]`));
        await tocar(boton(m.caja, "confirmar"));
        const esperado = i === 0 ? [p.pista] : [`La respuesta es «${p.opciones.find((x) => x.correcta).texto.replace(/\.$/, "")}».`, sinAsiEs(p.acierto.texto)];
        assert.deepEqual(textosDelError(p, o, i + 1), esperado);
        assert.deepEqual(enPantalla(m.caja), { textos: [...cab, INTERFAZ.incorrecto, ...esperado, BOTON.probarOtra, p.error.pie], opciones: ops }, `${p.id} error ${i + 1} (${o.id})`);
        assert.equal(w.document.activeElement, m.caja.querySelector("[data-mensaje]"), `${p.id}: el foco va al mensaje`);
        assert.equal(m.caja.querySelector("[data-figura], [data-ver]"), null, `${p.id}: lo del acierto, con el error`);
        vistos.push(`${p.id}:error:${o.id}`);
        await tocar(boton(m.caja, "probar-otra"));
      }
      await tocar(m.caja.querySelector(`[data-opcion="${p.opciones.find((x) => x.correcta).id}"]`));
      await tocar(boton(m.caja, "confirmar"));
      assert.deepEqual(enPantalla(m.caja), { textos: [...cab, ...conAcierto(p.acierto), BOTON.seguir, p.acierto.pie], opciones: ops }, `${p.id} acierto`);
      await plegadoYVer(m.caja, p);
      vistos.push(`${p.id}:acierto`);
      await tocar(boton(m.caja, "seguir"));
    }
    assert.equal(vistos.length, 2 + 4 * 4 + 4);
    assert.equal(m.caja.querySelector("[data-boton]") === null, true, "el resumen no lleva botón");
  } finally {
    m.desmontar();
  }
});

test("★★ los pies: los de las v1 de A5 y A6; los dos que juntan páginas de las dos, con las suyas", () => {
  const V1 = leer("orquestador/conocimiento/paquetes/t7-2-a5-v1.md") + leer("orquestador/conocimiento/paquetes/t7-2-a6-v1.md");
  /* Compuestos al fusionar: la portada y el resumen (las de A5 y A6 juntas) y `frente-al-periodico` (las de sus dos pantallas). */
  const COMPUESTOS = { portada: "Basado en el libro, pp. 245-248", resumen: "Basado en el libro, pp. 245-248", "frente-al-periodico": "Basado en el libro, pp. 228, 230 y 245-246" };
  for (const p of P.pantallas) {
    if (COMPUESTOS[p.id]) assert.equal(p.pie, COMPUESTOS[p.id], p.id);
    else assert.ok(V1.includes(`Pie: «${p.pie}»`), p.id);
    if (p.error) assert.equal(p.error.pie, p.pie, p.id);
    if (p.acierto) assert.equal(p.acierto.pie, p.pie, p.id);
  }
});

/* ═══════════ 4 · CATÁLOGO ═══════════ */

test("★★★ fuera del catálogo de FP; en T7-2 después de H4 y justo antes de H5; A6 ya no está; sin nada que pague", () => {
  assert.equal(A.A5_ID, "t7-2-a5-fletes");
  assert.equal(P.numero, 5);
  const tema = SUBJECTS.contabilidad.topics.find((t) => t.id === TEMA_T7_2);
  const a = tema.actividades.find((x) => x.id === A.A5_ID);
  assert.deepEqual(a.clasificacion, { tipo: APRENDER });
  assert.equal(a.nombre, P.titulo);
  const ids = tema.actividades.map((x) => x.id);
  assert.equal(ids.indexOf(A.A5_ID), ids.indexOf("t7-2-periodico-o-permanente") + 1);
  assert.equal(ids.indexOf("t7-2-flete-y-devolucion"), ids.indexOf(A.A5_ID) + 1);
  assert.ok(!ids.includes("t7-2-a6-devoluciones"));
  assert.ok(ENTREGA5.includes("`t7-2-a6-devoluciones` sale de la lista."));
  const aprender = tema.actividades.filter((x) => x.clasificacion.tipo === APRENDER).map((x) => x.id);
  assert.equal(aprender.indexOf(A.A5_ID), aprender.indexOf("t7-2-a4-san-calixto") + 1);
  assert.equal(aprender.at(-1), A.A5_ID);
  assert.deepEqual(PIEZAS_T7_2.map((x) => x.pieza.id), aprender);
  assert.equal(PIEZAS_T7_2.find((x) => x.pieza.id === A.A5_ID).Pieza, PantallasT7_2);
  const dir = new URL("supabase/migrations/", RAIZ);
  assert.deepEqual(readdirSync(dir).filter((f) => readFileSync(new URL(f, dir), "utf8").includes(A.A5_ID)), []);
  assert.doesNotMatch(leer("src/data/contabilidadT7_2_a5.js"), /from\s+["'][^"']*\/(fp|lib\/supabase)[^"']*["']|registrarActividad(Completada)?\s*\(|\.rpc\s*\(/);
  const visible = JSON.stringify(P);
  for (const interno of ["CONSTRUCCIÓN", "Near", "Mello", "ESCRITO POR CLAUDE", "INFLESZ"]) assert.ok(!visible.includes(interno), interno);
});
