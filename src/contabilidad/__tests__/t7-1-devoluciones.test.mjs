import { test } from "node:test";
import assert from "node:assert/strict";
import { readFileSync, readdirSync } from "node:fs";
import { JSDOM, VirtualConsole } from "jsdom";

/*
 * ═══════════════════════════════════════════════════════════════════════════
 * T7-1 · A6 «Devoluciones en periódico» (Célula C).
 *
 *   · cada texto de los datos está, letra por letra, en la v1 de Near, y cada
 *     texto visible de la v1 está en los datos
 *   · la ficha, los asientos del 1 de junio y las líneas de los dos libros
 *     son los de la v1; las cifras se calculan y las sumas cuadran
 *   · cada pantalla y cada estado muestran exactamente sus textos
 *   · el error lleva a «Probar otra» y el acierto a «Seguir»; en los asientos,
 *     «Probar otra» devuelve solo las líneas mal puestas
 *   · la «Figura de A6» de Watari: las líneas del asiento aparecen una por
 *     una; el error va debajo de su línea; las sumas aparecen solo al
 *     acertar; el lado vacío desaparece al acertar; los cálculos de P4 llegan
 *     con el acierto
 *   · la tabla espejo sale de los dos asientos, en el orden del comprador; la
 *     fila de las devoluciones va en negrita solo con el acierto; encabezados
 *     y nombre de la tabla marcados como pendientes de revisión
 *   · fuera del catálogo de FP, sin la renta del 33 % ni cifras de medición
 *
 * El ancho a 375 y 320 lo mide scripts/t7/medir-t7-1-a6.mjs en Chromium.
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

const A = await import("../../data/contabilidadT7_1_a6.js");
const { SUBJECTS, APRENDER } = await import("../../data/subjects.js");
const { default: Devoluciones, CSS_A6 } = await import("../../components/mecanicas/libros/t7/DevolucionesEnPeriodico.jsx");
const { PIEZAS_T7_1, TEMA_T7_1 } = await import("../../components/ContabilidadT7_1View.jsx");

const RAIZ = new URL("../../../", import.meta.url);
const PAQUETE = readFileSync(new URL("orquestador/conocimiento/paquetes/t7-1-a6-v1.md", RAIZ), "utf8");
const CONTENIDO = PAQUETE.slice(PAQUETE.indexOf("## Contenido"), PAQUETE.indexOf("## Erratas y nombres"));
const P = A.PIEZA_DEVOLUCIONES;
const pantalla = (id) => P.pantallas.find((x) => x.id === id);
const seccion = (marca, siguiente) => CONTENIDO.slice(CONTENIDO.indexOf(marca), siguiente ? CONTENIDO.indexOf(siguiente) : undefined);

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
const activos = (caja) => [...caja.querySelectorAll("[data-boton]")].filter((b) => b.getAttribute("aria-disabled") !== "true").map((b) => b.textContent);
const estado = (caja) => caja.querySelector("[data-estado]")?.dataset.estado ?? null;
const casilla = (caja, linea, lado) => caja.querySelector(`[data-linea="${linea}"][data-lado="${lado}"]`);
const sumas = (caja) => [...caja.querySelectorAll("[data-suma]")].map((s) => s.textContent);
const conPieza = (...ids) => ({ ...P, pantallas: ids.map(pantalla) });

/* ═══════════ LO QUE EL ESTUDIANTE LEE, SACADO DE LOS DATOS ═══════════ */

function textosVisibles() {
  const t = [P.titulo];
  for (const p of P.pantallas) {
    for (const k of ["objetivo", "enunciado", "pregunta", "consigna", "siguiente", "boton", "pie"]) if (p[k]) t.push(p[k]);
    t.push(...(p.parrafos ?? []));
    for (const o of p.opciones ?? []) { t.push(o.texto); if (o.devolucion) t.push(o.devolucion); }
    for (const l of p.lineas ?? []) t.push(l.devolucion);
    if (p.acierto) t.push(p.acierto.texto, ...(p.acierto.calculos ?? []));
  }
  return t;
}

/*
 * Los «…» de primer nivel del contenido de la v1 que el estudiante ve. Fuera
 * quedan las notas de Near: lo que va entre paréntesis, entre asteriscos
 * («*[…]*», «*No uso…*»), la cita del libro tras «El libro dice:» y las
 * etiquetas de los errores («- «no cambia»: …»).
 */
function citasVisibles(md) {
  const limpio = md
    .replace(/\([^()]*\)/g, "")
    .replace(/\*[^*\n]*\*/g, "")
    .replace(/El libro dice: «[^»]*»\./g, "")
    .replace(/^(\s*- )«[^»]*»: /gm, "$1");
  const citas = [];
  let nivel = 0;
  let actual = "";
  for (const c of limpio) {
    if (c === "«") { if (nivel > 0) actual += c; nivel++; continue; }
    if (c === "»") { nivel--; if (nivel > 0) actual += c; else { citas.push(actual); actual = ""; } continue; }
    if (nivel > 0) actual += c;
  }
  assert.equal(nivel, 0, "las comillas de la v1 no cierran");
  return citas;
}

function tablaDespuesDe(md, marca) {
  const desde = md.indexOf(marca);
  assert.ok(desde >= 0, `no está «${marca}» en la v1`);
  const lineas = md.slice(desde).split("\n");
  const inicio = lineas.findIndex((l) => l.startsWith("|"));
  const filas = [];
  for (const l of lineas.slice(inicio)) {
    if (!l.startsWith("|")) break;
    filas.push(l.slice(1, -1).split("|").map((c) => c.trim()));
  }
  return filas.filter((f) => !f.every((c) => /^-*$/.test(c)));
}

/* ═══════════ 1 · TEXTOS CONTRA LA v1 ═══════════ */

test("★★★ cada texto de los datos está, letra por letra, en la v1 de Near", () => {
  const faltan = textosVisibles().filter((t) => !PAQUETE.includes(t));
  /* Los botones no los trae la v1 (convención de AP1 y AP2): se comprueban aparte. */
  assert.deepEqual(faltan.filter((t) => !Object.values(A.BOTON).includes(t)), [], "estos textos no están en la v1");
  assert.deepEqual(textosVisibles().filter((t) => /[()]/.test(t)), [], "un texto visible con paréntesis escaparía al filtro de la prueba 2");
});

test("★★★ cada texto visible de la v1 está en los datos: no falta ninguno", () => {
  const datos = new Set(textosVisibles());
  const citas = citasVisibles(CONTENIDO);
  assert.ok(citas.length >= 45, `se leyeron solo ${citas.length} textos de la v1`);
  assert.deepEqual(citas.filter((c) => !datos.has(c)), [], "estos textos de la v1 no están en los datos");
});

test("★★ los botones son los de la convención de AP1 y AP2, y el resumen no lleva", () => {
  assert.deepEqual(A.BOTON, { empezar: "Empezar", seguir: "Seguir", confirmar: "Confirmar", probarOtra: "Probar otra" });
  assert.equal(pantalla("resumen").boton, null);
});

/* ═══════════ 2 · TABLAS Y CIFRAS ═══════════ */

test("★★★ la ficha y los dos asientos del 1 de junio son los de la v1", () => {
  const ficha = tablaDespuesDe(CONTENIDO, "Ficha de la devolución:").slice(1);
  assert.deepEqual(pantalla("el-caso").ficha.map((f) => [f.dato, f.texto]), ficha);
  const t = tablaDespuesDe(CONTENIDO, "Asientos del 1 de junio");
  const [comp, vend] = pantalla("el-caso").asientos;
  const lado = (l, cual) => (l.lado === cual ? A.cifra(l.monto) : "");
  assert.deepEqual(t[0], [comp.libro, "Debe", "Haber", "", vend.libro, "Debe", "Haber"]);
  assert.deepEqual(t.slice(1), comp.lineas.map((l, i) => {
    const v = vend.lineas[i];
    return [l.cuenta, lado(l, A.DEBE), lado(l, A.HABER), "", v.cuenta, lado(v, A.DEBE), lado(v, A.HABER)];
  }));
});

test("★★★ las líneas de los dos libros del 5 de junio son las de la v1, con su lado y su monto", () => {
  const leer = (marca, sig) => {
    const s = seccion(marca, sig);
    const fila = s.split("\n").find((l) => /Líneas/.test(l));
    return fila.split(": ").slice(1).join(": ").split(" · ").map((x) => {
      const m = x.match(/^(.+) \$([\d.]+) → (Debe|Haber)$/);
      assert.ok(m, `no se entiende la línea «${x}»`);
      return { cuenta: m[1], cifra: m[2], lado: m[3] === "Debe" ? A.DEBE : A.HABER };
    });
  };
  const comoDatos = (id) => pantalla(id).lineas.map((l) => ({ cuenta: l.cuenta, cifra: A.cifra(l.monto), lado: l.lado }));
  assert.deepEqual(comoDatos("libro-del-comprador"), leer("**P5", "**P6"));
  assert.deepEqual(comoDatos("libro-del-vendedor"), leer("**P6", "**P7"));
});

test("★★★ las cifras se calculan y las sumas del 5 de junio cuadran, como dice la v1", () => {
  assert.deepEqual(
    [A.CIFRAS.ivaCompra, A.CIFRAS.retCompra, A.CIFRAS.totalCompra, A.CIFRAS.ivaDevuelto, A.CIFRAS.retDevuelto, A.CIFRAS.totalDevuelto],
    [2432000, 532000, 17100000, 384000, 84000, 2700000],
  );
  for (const [id, marca, sig] of [["libro-del-comprador", "**P5", "**P6"], ["libro-del-vendedor", "**P6", "**P7"]]) {
    const ls = pantalla(id).lineas;
    const s = (lado) => A.cifra(ls.filter((l) => l.lado === lado).reduce((t, l) => t + l.monto, 0));
    assert.equal(s(A.DEBE), s(A.HABER), `${id} no cuadra`);
    assert.ok(seccion(marca, sig).includes(`Sumas: ${s(A.DEBE)} = ${s(A.HABER)}`), id);
  }
});

test("★★ cada error de línea es el de su línea en la v1, aunque la v1 los liste en otro orden", () => {
  for (const [id, marca, sig] of [["libro-del-comprador", "**P5", "**P6"], ["libro-del-vendedor", "**P6", "**P7"]]) {
    const s = seccion(marca, sig);
    for (const l of pantalla(id).lineas) {
      assert.ok(s.includes(`«${l.devolucion}»`), `${id} · ${l.id}`);
      /* La explicación nombra la cuenta de su línea, o lo que esa cuenta representa. */
      const clave = { proveedores: "proveedor", retencion: "retención", iva: "IVA", devoluciones: "Devoluciones", anticipo: "anticipo", clientes: "cliente" }[l.id];
      assert.ok(l.devolucion.includes(clave), `${id} · ${l.id}: la explicación no es de esa línea`);
    }
  }
});

/* ═══════════ 3 · PANTALLAS Y ESTADOS, MONTADOS ═══════════ */

/* Lo que hay en pantalla, en orden; las opciones se ordenan porque se barajan. */
function enPantalla(caja) {
  const out = [];
  const opciones = [];
  const marco = caja.querySelector("[data-pieza]");
  for (const el of marco.querySelectorAll("[data-texto], [data-opcion], [data-boton], [data-pie], [data-palabra]")) {
    if (el.matches("[data-opcion]")) { opciones.push(el.textContent); continue; }
    out.push(el.textContent);
  }
  return { textos: out, opciones: opciones.sort() };
}

test("★★★ cada pantalla y cada estado muestran exactamente sus textos", async () => {
  const m = await montar(h(Devoluciones, { rotulo: "R" }));
  const vistos = [];
  try {
    for (const p of P.pantallas) {
      assert.equal(m.caja.querySelector("[data-pieza]").dataset.pantalla, p.id);
      if (["portada", "lectura", "resumen", "caso"].includes(p.tipo)) {
        const esperado = [p.objetivo, p.enunciado, ...(p.parrafos ?? []), p.siguiente, p.boton, p.pie].filter(Boolean);
        assert.deepEqual(enPantalla(m.caja).textos, esperado, p.id);
        vistos.push(p.id);
        if (p.boton) await tocar(m.caja.querySelector("[data-boton]"));
        continue;
      }
      if (p.tipo === "eleccion") {
        const cab = [...p.parrafos, p.pregunta];
        const ops = p.opciones.map((o) => o.texto).sort();
        assert.deepEqual(enPantalla(m.caja), { textos: [...cab, A.BOTON.confirmar, p.pie], opciones: ops }, `${p.id} colocando`);
        vistos.push(`${p.id}:colocando`);
        for (const o of p.opciones.filter((x) => !x.correcta)) {
          await tocar(m.caja.querySelector(`[data-opcion="${o.id}"]`));
          await tocar(boton(m.caja, "confirmar"));
          assert.deepEqual(enPantalla(m.caja), { textos: [...cab, A.INTERFAZ.incorrecto, o.devolucion, A.BOTON.probarOtra, p.pie], opciones: ops }, `${p.id} error ${o.id}`);
          vistos.push(`${p.id}:error:${o.id}`);
          await tocar(boton(m.caja, "probar-otra"));
        }
        await tocar(m.caja.querySelector(`[data-opcion="${p.opciones.find((x) => x.correcta).id}"]`));
        await tocar(boton(m.caja, "confirmar"));
        assert.deepEqual(enPantalla(m.caja), { textos: [...cab, A.INTERFAZ.correcto, p.acierto.texto, ...p.acierto.calculos, A.BOTON.seguir, p.pie], opciones: ops }, `${p.id} acierto`);
        vistos.push(`${p.id}:acierto`);
        await tocar(boton(m.caja, "seguir"));
        continue;
      }
      /* lados: todo al revés (todas mal), luego todo bien. */
      assert.deepEqual(enPantalla(m.caja).textos, [p.consigna, A.BOTON.confirmar, p.pie], `${p.id} colocando`);
      vistos.push(`${p.id}:colocando`);
      for (const l of p.lineas) await tocar(casilla(m.caja, l.id, l.lado === A.DEBE ? A.HABER : A.DEBE));
      await tocar(boton(m.caja, "confirmar"));
      assert.deepEqual(enPantalla(m.caja).textos, [p.consigna, ...p.lineas.flatMap((l) => [A.INTERFAZ.incorrecto, l.devolucion]), A.BOTON.probarOtra, p.pie], `${p.id} error`);
      vistos.push(`${p.id}:error`);
      await tocar(boton(m.caja, "probar-otra"));
      for (const l of p.lineas) await tocar(casilla(m.caja, l.id, l.lado));
      await tocar(boton(m.caja, "confirmar"));
      assert.deepEqual(enPantalla(m.caja).textos, [p.consigna, A.INTERFAZ.correcto, p.acierto.texto, A.BOTON.seguir, p.pie], `${p.id} acierto`);
      vistos.push(`${p.id}:acierto`);
      await tocar(boton(m.caja, "seguir"));
    }
    /* Portada, P1 y el caso + 3 elecciones (4 estados cada una) + 2 asientos (3 estados) + resumen. */
    assert.equal(vistos.length, 3 + 12 + 6 + 1);
  } finally {
    m.desmontar();
  }
});

test("★★★ el error lleva a «Probar otra» y el acierto a «Seguir», en las preguntas y en los asientos", async () => {
  for (const id of ["dos-cuentas-propias", "cuanto-se-reversa", "lado-a-lado"]) {
    const p = pantalla(id);
    const m = await montar(h(Devoluciones, { pieza: conPieza(id, "resumen"), rotulo: "R" }));
    try {
      assert.equal(boton(m.caja, "confirmar").getAttribute("aria-disabled"), "true");
      await tocar(m.caja.querySelector(`[data-opcion="${p.opciones.find((o) => !o.correcta).id}"]`));
      await tocar(boton(m.caja, "confirmar"));
      assert.deepEqual(activos(m.caja), ["Probar otra"], id);
      await tocar(boton(m.caja, "probar-otra"));
      await tocar(m.caja.querySelector(`[data-opcion="${p.opciones.find((o) => o.correcta).id}"]`));
      await tocar(boton(m.caja, "confirmar"));
      assert.deepEqual(activos(m.caja), ["Seguir"], id);
    } finally {
      m.desmontar();
    }
  }
});

test("★★★ asiento: una línea a la vez, el error debajo de su línea, «Probar otra» devuelve solo las mal puestas, sumas solo al acertar", async () => {
  const p = pantalla("libro-del-comprador");
  const m = await montar(h(Devoluciones, { pieza: conPieza("libro-del-comprador", "resumen"), rotulo: "R" }));
  const filas = () => [...m.caja.querySelectorAll("[data-fila]")].map((f) => f.dataset.fila);
  try {
    /* Una línea a la vez (Watari): se ve la primera, y cada colocación abre la siguiente. */
    assert.deepEqual(filas(), ["proveedores"]);
    assert.equal(m.caja.querySelector("[data-fecha]").textContent, "5 de junio");
    assert.match(casilla(m.caja, "proveedores", A.DEBE).getAttribute("aria-label"), /Debe, vacía, lista para recibir$/);
    assert.equal(boton(m.caja, "confirmar").getAttribute("aria-disabled"), "true");
    for (const [k, l] of p.lineas.entries()) {
      await tocar(casilla(m.caja, l.id, l.id === "retencion" ? A.HABER : l.lado));
      assert.equal(filas().length, Math.min(k + 2, 4));
    }
    /* Sin sumas mientras se coloca: con cuatro montos fijos, el cuadre regalaría la respuesta. */
    assert.equal(m.caja.querySelector("[data-sumas]") === null, true, "las sumas se ven antes del acierto");
    await tocar(boton(m.caja, "confirmar"));
    assert.equal(estado(m.caja), "error");
    assert.equal(m.caja.querySelector("[data-sumas]") === null, true, "las sumas se ven en el error");
    const mala = casilla(m.caja, "retencion", A.HABER);
    assert.ok(mala.classList.contains("t7a6-cas-error"));
    assert.ok(mala.querySelector(".t7a6-marca svg"), "la casilla mala no lleva la X");
    assert.match(mala.getAttribute("aria-label"), /Haber, 84\.000, incorrecto$/);
    /* El mensaje va debajo de su línea, y solo el de esa línea. */
    const enLinea = m.caja.querySelector('[data-fila="retencion"] [data-mensaje=error]');
    assert.ok(enLinea, "el error no está en su línea");
    assert.equal(enLinea.querySelector("p").textContent, p.lineas.find((l) => l.id === "retencion").devolucion);
    assert.equal(m.caja.querySelectorAll("[data-mensaje=error]").length, 1);
    await tocar(boton(m.caja, "probar-otra"));
    assert.deepEqual(filas(), ["proveedores", "retencion", "iva", "devoluciones"], "las líneas visibles no se esconden al reintentar");
    assert.equal(casilla(m.caja, "retencion", A.HABER).dataset.llena, "no");
    assert.ok(p.lineas.filter((l) => l.id !== "retencion").every((l) => casilla(m.caja, l.id, l.lado).dataset.llena === "si"));
    await tocar(casilla(m.caja, "retencion", A.DEBE));
    await tocar(boton(m.caja, "confirmar"));
    assert.equal(estado(m.caja), "acierto");
    assert.deepEqual(sumas(m.caja), ["2.784.000", "2.784.000"]);
    assert.equal(m.caja.querySelector("[data-sumas] .t7a6-sumas-rot").textContent, "Sumas");
    for (const l of p.lineas) {
      const vacia = casilla(m.caja, l.id, l.lado === A.DEBE ? A.HABER : A.DEBE);
      assert.ok(vacia.classList.contains("t7a6-cas-nada"), `${l.id}: el lado vacío sigue a la vista`);
      assert.match(casilla(m.caja, l.id, l.lado).getAttribute("aria-label"), /, correcto$/);
    }
  } finally {
    m.desmontar();
  }
});

test("★★ en P4 los cálculos no se ven antes del acierto: darían la respuesta", async () => {
  const p = pantalla("cuanto-se-reversa");
  const m = await montar(h(Devoluciones, { pieza: conPieza("cuanto-se-reversa"), rotulo: "R" }));
  try {
    assert.equal(m.caja.querySelectorAll("[data-calculo]").length, 0);
    await tocar(m.caja.querySelector('[data-opcion="nada"]'));
    await tocar(boton(m.caja, "confirmar"));
    assert.equal(m.caja.querySelectorAll("[data-calculo]").length, 0);
    await tocar(boton(m.caja, "probar-otra"));
    await tocar(m.caja.querySelector('[data-opcion="proporcional"]'));
    await tocar(boton(m.caja, "confirmar"));
    assert.deepEqual([...m.caja.querySelectorAll("[data-calculo]")].map((c) => c.textContent), p.acierto.calculos);
    /* El resultado de cada cálculo en blanco: lo que va después del último «= ». */
    assert.deepEqual([...m.caja.querySelectorAll("[data-calculo] b")].map((b) => b.textContent), ["$384.000", "$84.000", "$2.700.000"]);
  } finally {
    m.desmontar();
  }
});

test("★★ las opciones se barajan en cada intento", async () => {
  const m = await montar(h(Devoluciones, { pieza: conPieza("lado-a-lado"), rotulo: "R" }));
  try {
    const orden = () => [...m.caja.querySelectorAll("[data-opcion]")].map((b) => b.dataset.opcion);
    let antes = orden();
    for (let i = 0; i < 15; i++) {
      await tocar(m.caja.querySelector('[data-opcion="ingresos"]'));
      await tocar(boton(m.caja, "confirmar"));
      await tocar(boton(m.caja, "probar-otra"));
      assert.notDeepEqual(orden(), antes);
      antes = orden();
    }
  } finally {
    m.desmontar();
  }
});

test("★★★ la tabla espejo sale de los dos asientos, en el orden del comprador, y la fila de las devoluciones se señala solo al acertar", async () => {
  const esp = pantalla("lado-a-lado").espejo;
  const comp = pantalla("libro-del-comprador").lineas;
  const vend = pantalla("libro-del-vendedor").lineas;
  assert.equal(esp.fecha, "5 de junio");
  assert.deepEqual(esp.filas.map((f) => f.monto), comp.map((l) => l.monto), "las filas no van en el orden del comprador");
  for (const f of esp.filas) {
    const c = comp.find((l) => l.monto === f.monto);
    const v = vend.find((l) => l.monto === f.monto);
    assert.deepEqual(f.comprador, { lado: c.lado, cuenta: c.cuenta });
    assert.deepEqual(f.vendedor, { lado: v.lado, cuenta: v.cuenta });
    assert.notEqual(f.comprador.lado, f.vendedor.lado, "no está en espejo");
  }
  const p = pantalla("lado-a-lado");
  const m = await montar(h(Devoluciones, { pieza: conPieza("lado-a-lado"), rotulo: "R" }));
  const foco = () => [...m.caja.querySelectorAll("[data-fila-espejo].t7a6-esp-foco")].map((f) => f.dataset.filaEspejo);
  try {
    const t = m.caja.querySelector("[data-espejo]");
    assert.equal(t.getAttribute("aria-label"), "5 de junio: el libro del comprador y el del vendedor, lado a lado");
    assert.equal(t.dataset.revision, "pendiente");
    assert.deepEqual([...t.querySelectorAll("[role=columnheader][data-revision=pendiente]")].map((x) => x.textContent), ["Dajema (comprador)", "El Tajamar (vendedor)"]);
    assert.equal(t.querySelector("[data-fecha]").textContent, "5 de junio");
    assert.deepEqual(
      [...t.querySelectorAll("[data-fila-espejo]")].map((f) => f.textContent),
      esp.filas.map((f) => `${f.cifra}${f.comprador.lado === A.DEBE ? "Debe" : "Haber"}${f.comprador.cuenta}${f.vendedor.lado === A.DEBE ? "Debe" : "Haber"}${f.vendedor.cuenta}`),
    );
    /* Mientras elige, nada señalado; en el error, tampoco; con el acierto, solo la fila de las devoluciones. */
    assert.deepEqual(foco(), []);
    await tocar(m.caja.querySelector('[data-opcion="en-el-debe"]'));
    await tocar(boton(m.caja, "confirmar"));
    assert.deepEqual(foco(), []);
    await tocar(boton(m.caja, "probar-otra"));
    await tocar(m.caja.querySelector(`[data-opcion="${p.opciones.find((o) => o.correcta).id}"]`));
    await tocar(boton(m.caja, "confirmar"));
    assert.deepEqual(foco(), ["2.400.000"]);
  } finally {
    m.desmontar();
  }
});

test("★★ el lado de cada celda del espejo va siempre en su color y con su palabra", async () => {
  const m = await montar(h(Devoluciones, { pieza: conPieza("lado-a-lado"), rotulo: "R" }));
  try {
    for (const l of m.caja.querySelectorAll(".t7a6-esp-lado")) {
      const debe = l.textContent === "Debe";
      assert.ok(["Debe", "Haber"].includes(l.textContent));
      assert.ok(l.classList.contains(debe ? "t7a6-d" : "t7a6-h"), `«${l.textContent}» sin su color`);
    }
  } finally {
    m.desmontar();
  }
  assert.match(CSS_A6, /\.t7a6-d \{ color: #2A9D8F; \} \.t7a6-h \{ color: #E9C46A; \}/);
});

test("★★ P3: la tabla espejo del 1 de junio, ya resuelta, en el orden del comprador y sin sumas", async () => {
  const esp = pantalla("el-caso").espejo;
  assert.equal(esp.fecha, "1 de junio");
  assert.deepEqual(esp.filas.map((f) => f.cifra), ["15.200.000", "2.432.000", "532.000", "17.100.000"]);
  const m = await montar(h(Devoluciones, { pieza: conPieza("el-caso"), rotulo: "R" }));
  try {
    assert.equal(m.caja.querySelectorAll("[data-espejo]").length, 1);
    assert.equal(m.caja.querySelector("[data-espejo]").getAttribute("aria-label"), "1 de junio: el libro del comprador y el del vendedor, lado a lado");
    assert.equal(m.caja.querySelectorAll("[data-fila-espejo]").length, 4);
    assert.equal(m.caja.querySelector("[data-sumas]") === null, true);
    assert.equal(m.caja.querySelector("[data-linea]") === null, true, "en P3 nada se toca");
    assert.ok(!m.caja.textContent.includes("17.632.000"));
  } finally {
    m.desmontar();
  }
});

/* ═══════════ 4 · LO QUE NO DEBE APARECER ═══════════ */

test("★★ sin la renta del 33 %, sin cifras de medición del patrón, sin nada interno y sin «contar»", async () => {
  const todo = JSON.stringify(P) + CSS_A6;
  assert.doesNotMatch(todo, /33 ?%|renta/i);
  for (const medida of ["45.793.000", "5.625.000", "1.375,13", "18.200"]) assert.ok(!todo.includes(medida), medida);
  const texto = textosVisibles().join("\n");
  for (const interno of ["≈", "glosa", "Regla 8", "Near", "Mello", "(p. ", "construcción"]) assert.ok(!texto.includes(interno), interno);
  assert.doesNotMatch(texto, /(?<!\p{L})cont(ar|ó|amos|aron|aste)(?!\p{L})/iu);
});

test("★★★ fuera del catálogo de FP; id t7-; va en T7-1 después de AP1", () => {
  assert.equal(A.A6_ID, "t7-1-a6-devoluciones-en-periodico");
  const tema = SUBJECTS.contabilidad.topics.find((t) => t.id === TEMA_T7_1);
  const a = tema.actividades.find((x) => x.id === A.A6_ID);
  assert.deepEqual(a.clasificacion, { tipo: APRENDER });
  assert.equal(a.nombre, P.titulo);
  /* Orden final de T7-1 (mapa, decisión de L): a1, a2, a3, a4, a5, a6, a7. */
  /* H3 (Hacer) va entre AP3 y AP4; las piezas de la vista son solo las de Aprender. */
  assert.deepEqual(tema.actividades.map((x) => x.id), ["t7-1-a1-la-cuenta-que-no-se-mueve", "t7-1-a2-la-factura-completa", "t7-1-a3-tres-formas", "t7-1-cuanto-vale-lo-que-sobro", "t7-1-a4-el-cierre-en-periodico", "t7-1-a5-importados-y-fletes", A.A6_ID, "t7-1-a7-control-interno"]);
  /* Orden final de T7-1 (mapa, decisión de L): a1, a2, h1, h2, a3, a4, a5, a6, a7. H1 y H2 van después de AP2, en ese orden; las piezas de la vista son solo las de Aprender. */
  assert.deepEqual(tema.actividades.map((x) => x.id), ["t7-1-a1-la-cuenta-que-no-se-mueve", "t7-1-a2-la-factura-completa", "t7-1-que-cuenta-se-mueve", "t7-1-arma-la-factura", "t7-1-a3-tres-formas", "t7-1-a4-el-cierre-en-periodico", "t7-1-a5-importados-y-fletes", A.A6_ID, "t7-1-a7-control-interno"]);  assert.deepEqual(PIEZAS_T7_1.map((x) => x.pieza.id), ["t7-1-a1-la-cuenta-que-no-se-mueve", "t7-1-a2-la-factura-completa", "t7-1-a3-tres-formas", "t7-1-a4-el-cierre-en-periodico", "t7-1-a5-importados-y-fletes", A.A6_ID, "t7-1-a7-control-interno"]);
  const dir = new URL("supabase/migrations/", RAIZ);
  assert.deepEqual(readdirSync(dir).filter((f) => readFileSync(new URL(f, dir), "utf8").includes(A.A6_ID)), []);
  for (const f of ["src/components/mecanicas/libros/t7/DevolucionesEnPeriodico.jsx", "src/data/contabilidadT7_1_a6.js"]) {
    assert.doesNotMatch(readFileSync(new URL(f, RAIZ), "utf8"), /from\s+["'][^"']*\/(fp|lib\/supabase)[^"']*["']|registrarActividad(Completada)?\s*\(|\.rpc\s*\(/, f);
  }
});
