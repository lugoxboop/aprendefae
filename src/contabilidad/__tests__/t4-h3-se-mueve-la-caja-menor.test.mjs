import { test } from "node:test";
import assert from "node:assert/strict";
import { readdirSync, readFileSync } from "node:fs";

/*
 * ═══════════════════════════════════════════════════════════════════════════
 * T4 · H3 «¿Se mueve la caja menor?» (Célula D) · Hacer · evaluativa · 25 FP.
 * REDISEÑO DE ENGANCHE: el tablero y el sobre.
 *
 *   · cada texto es el del paquete vigente (d4-t4-h3-v2-rediseno.md, Katsumi
 *     aprobado por Yujiro), letra por letra
 *   · las cifras: el libro de Caja menor queda igual al sobre después de
 *     cada operación, y la línea «diría» da, para cada asiento equivocado que
 *     toca Caja menor, lo mismo que el script de Katsumi (con «−»)
 *   · las 11 combinaciones equivocadas de cada operación tienen mensaje, y
 *     cada error con nombre se comete con el gesto mínimo (dos toques y
 *     «Comprobar») y sale ESE mensaje
 *   · PH8-2: mientras se pregunta, nada de la respuesta está en el DOM, ni
 *     en el hueco reservado de la línea «diría» (`textContent`)
 *   · un intento; el error marca, no escribe, y a los 0,7 s escribe lo que
 *     iba («Iba aquí»): la operación siguiente parte de ese fondo
 *   · B4: el acierto con ✓ y borde blanco; teal y ámbar solo en «Debe» y
 *     «Haber»; «Siguiente operación» en blanco neutro
 * ═══════════════════════════════════════════════════════════════════════════
 */

const { w, h, montar, tocar, esperar, conColor, TEAL_AMBAR, CORAL, visible } = await import("./t4-dom.mjs");
const D = await import("../../data/contabilidadT4H3.js");
const { ESPERA_ERROR_MS } = await import("../../data/contabilidadT4Hacer.js");
const { SUBJECTS, HACER, actividadesDeTipo, clasificacionDe } = await import("../../data/subjects.js");
const { default: ContabilidadT4View, SeMueveLaCajaMenor, JUEGOS_T4, TEMA_T4 } = await import("../../components/ContabilidadT4View.jsx");
const { AuthContext } = await import("../../auth/AuthProvider.jsx");
const { etiquetaDeItem, recortar } = await import("../../docente/etiquetasItem.js");
const { ASI_SE_JUEGA } = await import("../../data/asiSeJuega.js");
const { inflesz } = await import("../../herramientas/inflesz.js");
const { leer, PAQUETES, RAIZ } = await import("./t4-paquete.mjs");

const PAQ = leer(`${PAQUETES}d4-t4-h3-v2-rediseno.md`);
const CAMBIOS = leer(`${PAQUETES}d4-t4-hacer-v2-cambios.md`);
const TEMA = SUBJECTS.contabilidad.topics.find((t) => t.id === TEMA_T4);
const CUENTAS = D.CUENTAS_H3.map((c) => c.id);
const cifra = (n) => (n < 0 ? "−" : "") + String(Math.abs(n)).replace(/\B(?=(\d{3})+(?!\d))/g, ".");
/* Todas las combinaciones de una cuenta al debe y otra distinta al haber: 12, una buena. */
const COMBINACIONES = CUENTAS.flatMap((d) => CUENTAS.filter((x) => x !== d).map((x) => ({ debe: d, haber: x })));

/* ═══════════ EL JUEGO, MONTADO ═══════════ */

const Marco = ({ children }) => h("section", null, children);
function montarJuego(props = {}) {
  const completados = [];
  const m = montar(h(SeMueveLaCajaMenor, { Marco, onCompletar: (...a) => completados.push(a), ...props }));
  return { ...m, completados };
}
const q = (m, sel) => m.caja.querySelector(sel);
const mitad = (m, k) => q(m, `[data-destino="${k}"]`);
const comprobar = (m) => q(m, '[data-boton="comprobar"] button');
/* El avance y «Comprobar» son el Responder compartido dentro de su envoltorio (P2 de Hanayama, §3.4). */
const siguiente = (m) => q(m, '[data-boton="seguir-hacer"] button');
/* El gesto mínimo del estudiante: la ficha del debe, la del haber y «Comprobar». */
async function armar(m, a) {
  await tocar(mitad(m, `${a.debe}:debe`));
  await tocar(mitad(m, `${a.haber}:haber`));
  await tocar(comprobar(m));
}
const libro = (m) => Number(q(m, "[data-libro]").dataset.libro);
const sobre = (m) => Number(q(m, "[data-sobre]").dataset.sobre);
const serieDe = (s, k) => ({ ...s, ops: [s.ops[k]] });
/* Los totales que deja la serie después de sus primeras k operaciones bien hechas. */
const totalesHasta = (s, k) => s.ops.slice(0, k).reduce((t, op) => D.conAsiento(t, op.debe, op.haber, op.monto), {});

/* ═══════════ 1 · EL TEXTO, CONTRA EL PAQUETE ═══════════ */

test("★★★ el paquete vigente es el del rediseño (v2): mismo activity_id y mismos ítems; la v1 queda como historia", () => {
  assert.match(PAQ, /\*\*Este archivo es la versión vigente de H3\.\*\*/);
  assert.match(PAQ, /Mismo `activity_id` \(`t4-se-mueve-la-caja-menor`, migración 0202, sin cambios\)/);
  assert.match(leer(`${PAQUETES}d4-t4-h3-v1.md`), /^> \*\*REEMPLAZADO\*\* por `d4-t4-h3-v2-rediseno\.md`/);
  assert.deepEqual(D.SERIES_H3.flatMap((s) => s.ops.map((o) => o.id)), ["h3-1", "h3-2", "h3-3", "h3-4", "h3s2-1", "h3s2-2", "h3s2-3", "h3s2-4"]);
});

test("★★★ ficha, consigna, rótulos, botones, resumen y cierre: los del paquete, letra por letra", () => {
  assert.equal(D.H3_ID, "t4-se-mueve-la-caja-menor");
  assert.equal(D.H3.nombre, "¿Se mueve la caja menor?");
  assert.ok(PAQ.includes(`**Consigna** (17 pal. · INFLESZ 112,9; tope 24): ${D.H3.consigna}`));
  for (const r of [D.ROTULOS_H3.billetes, D.ROTULOS_H3.soportes, D.ROTULOS_H3.suman, D.ROTULOS_H3.libro, D.ROTULOS_H3.cuenta, D.ROTULOS_H3.igual]) assert.ok(PAQ.includes(`«${r}»`), r);
  assert.equal(D.ROTULOS_H3.sobre("Lucía"), "LO QUE TIENE LUCÍA");
  assert.equal(D.ROTULOS_H3.sobre("Andrés"), "LO QUE TIENE ANDRÉS");
  assert.ok(PAQ.includes("«LO QUE TIENE LUCÍA» (serie 2: «LO QUE TIENE ANDRÉS»)"));
  assert.ok(PAQ.includes(`«${D.diriaH3(514_600, 300_000)}»`), "la línea «diría» no es la del paquete");
  for (const b of Object.values(D.BOTON_H3)) assert.ok(PAQ.includes(`«${b}»`), b);
  assert.ok(PAQ.includes(`«${D.resumenH3("N")}»`));
  assert.ok(PAQ.includes(`(30 pal. · INFLESZ 75,5): ${D.CIERRE_H3.texto}`));
  assert.ok(PAQ.includes(`«${D.CIERRE_H3.pie}»`));
  assert.deepEqual(D.CUENTAS_H3.map((c) => c.renglones), [["Caja menor"], ["Bancos"], ["Caja"], ["Gastos", "generales"]]);
});

test("★★★ cada operación de las dos series: tarjeta, monto, asiento, acierto, errores y página, como en el paquete", () => {
  for (const s of D.SERIES_H3) {
    for (const op of s.ops) {
      const fila = PAQ.split("\n").find((l) => l.includes(`| ${op.texto} |`));
      assert.ok(fila, `${op.id}: la tarjeta no está en el paquete`);
      assert.ok(fila.includes(`| ${cifra(op.monto)} |`), `${op.id}: el monto`);
      assert.ok(PAQ.includes(`| Correcto. ${op.acierto} |`), `${op.id}: el acierto`);
      for (const e of op.errores) assert.ok(PAQ.includes(`| ${e.texto} |`), `${op.id}: «${e.texto.slice(0, 40)}»`);
      assert.ok(PAQ.includes(`pie: «${op.pagina}»`), `${op.id}: la página`);
      assert.ok(PAQ.includes(`asiento: ${op.debe} al debe / ${op.haber} al haber`), `${op.id}: el asiento`);
      assert.doesNotMatch(op.texto, /\$|\d{3}\.\d{3}/, `${op.id}: la tarjeta repite el monto o el fondo`);
    }
  }
});

test("★★ INFLESZ con la herramienta oficial: cada texto de 10 palabras o más da 65 o más", () => {
  const textos = [D.H3.consigna, D.CIERRE_H3.texto, D.ALT_H3, ...D.SERIES_H3.flatMap((s) => s.ops.flatMap((o) => [o.texto, `Correcto. ${o.acierto}`, ...o.errores.map((e) => e.texto)]))];
  for (const t of textos) {
    const r = inflesz(t);
    if (r.aplica) assert.ok(r.valor >= 65, `${r.valor}: ${t}`);
  }
});

/* ═══════════ 2 · LAS CIFRAS ═══════════ */

test("★★★ jugada bien, el libro de Caja menor queda igual al sobre después de cada operación; el reembolso no lo mueve", () => {
  for (const s of D.SERIES_H3) {
    let t = {};
    for (const op of s.ops) {
      assert.equal(D.libroCajaMenor(t), D.sobreSuma(op.antes), `${op.id}: el sobre antes no es el libro`);
      t = D.conAsiento(t, op.debe, op.haber, op.monto);
      assert.equal(D.libroCajaMenor(t), D.sobreSuma(op.despues), `${op.id}: el libro después no es el sobre`);
    }
    assert.equal(s.ops[1].antes.billetes + s.ops[1].antes.soportes, s.ops[0].monto, "el reembolso: billetes y soportes no dan el fondo");
  }
});

test("★★★ la línea «diría», asiento por asiento: sale solo si toca Caja menor y no da el sobre; su cifra es la del script de Katsumi", () => {
  const sec = CAMBIOS.slice(CAMBIOS.indexOf("══ H3 ══"), CAMBIOS.indexOf("══ H4"));
  for (const s of D.SERIES_H3) {
    const bloque = sec.slice(sec.indexOf(`Serie ${s.empresa}`));
    for (const [k, op] of s.ops.entries()) {
      const linea = bloque.split("\n").filter((l) => l.includes("línea «diría»"))[k];
      const t = totalesHasta(s, k);
      for (const a of COMBINACIONES.filter((x) => !(x.debe === op.debe && x.haber === op.haber))) {
        const v = D.evaluarH3(op, a, t);
        assert.ok(v.texto, `${op.id} ${a.debe}/${a.haber}: sin mensaje`);
        const toca = a.debe === D.CAJA_MENOR || a.haber === D.CAJA_MENOR;
        if (!toca) { assert.equal(v.diria, null); continue; }
        const m = linea.match(new RegExp(`${a.debe}/${a.haber}: diría (−?[\\d.]+)( \\(oculta: igual al sobre\\))?`));
        assert.ok(m, `${op.id} ${a.debe}/${a.haber}: no está en el script`);
        if (m[2]) assert.equal(v.diria, null, `${op.id} ${a.debe}/${a.haber}: debía ocultarse`);
        else assert.equal(cifra(v.diria.x), m[1], `${op.id} ${a.debe}/${a.haber}`);
        if (v.diria) assert.equal(v.diria.y, D.sobreSuma(op.despues), "«diría» no compara con el sobre de después");
      }
    }
  }
  assert.equal(D.diriaH3(-300_000, 300_000), "Con tu asiento, el libro diría −300.000, pero en el sobre hay 300.000.", "el negativo no va con «−»");
});

/* ═══════════ 3 · LA PARTIDA ═══════════ */

test("★★★ PH8-2: mientras se pregunta, nada de la respuesta está en el DOM, ni en el hueco reservado de «diría»", async () => {
  for (const s of D.SERIES_H3) for (const op of s.ops) {
    const m = montarJuego({ items: serieDe(s, s.ops.indexOf(op)) });
    try {
      const raiz = q(m, "[data-t4-h3]");
      for (const x of [op.acierto, ...op.errores.map((e) => e.texto), op.pagina, "Correcto", "Incorrecto", "Iba aquí", "diría"]) {
        assert.ok(!raiz.textContent.includes(x), `${op.id}: «${x.slice(0, 30)}» está en el texto antes de comprobar`);
        assert.ok(!raiz.outerHTML.includes(x), `${op.id}: «${x.slice(0, 30)}» está en el HTML antes de comprobar`);
      }
      assert.equal(q(m, "[data-diria]"), null);
      assert.equal(q(m, ".t4h3-diria").textContent.trim(), "", "el hueco de «diría» trae texto");
      assert.equal(raiz.querySelector("[data-marca], [data-mensaje]"), null);
      assert.equal(q(m, "[data-hecho]").textContent, op.texto);
      assert.equal(q(m, "[data-monto]").textContent, cifra(op.monto));
      /* Con una ficha puesta, todavía nada. */
      await tocar(mitad(m, `${op.debe}:debe`));
      assert.ok(!raiz.textContent.includes(op.acierto));
      /* «Comprobar» nunca se apaga (P2 de Hanayama, §5.3): con una ficha sola, avisa y no califica. */
      assert.equal(comprobar(m).disabled, false);
      assert.equal(comprobar(m).getAttribute("aria-disabled"), null);
      await tocar(comprobar(m));
      assert.equal(q(m, "[data-aviso]").textContent, D.AVISO_H3);
      assert.equal(raiz.querySelector("[data-marca], [data-mensaje]"), null, "con una ficha sola, «Comprobar» calificó");
    } finally { m.desmontar(); }
  }
});

test("★★★ gesto mínimo: cada error con nombre de cada operación se comete con dos toques y «Comprobar», y sale ESE mensaje", async () => {
  for (const s of D.SERIES_H3) {
    for (const [k, op] of s.ops.entries()) {
      for (const e of op.errores) {
        const a = COMBINACIONES.find((x) => !(x.debe === op.debe && x.haber === op.haber) && op.errores.find((y) => y.cuando(x)) === e);
        assert.ok(a, `${op.id}: «${e.texto.slice(0, 40)}» no lo dispara ningún asiento`);
        const m = montarJuego({ items: serieDe(s, k) });
        try {
          await armar(m, a);
          assert.equal(q(m, "[data-mensaje]").dataset.mensaje, "error");
          assert.equal(visible(q(m, "[data-devolucion]")), e.texto, `${op.id} ${a.debe}/${a.haber}`);
        } finally { m.desmontar(); }
      }
    }
  }
});

test("★★★ una cuenta no va a los dos lados: tocar su otra mitad mueve la ficha", async () => {
  const m = montarJuego({ items: D.SERIE_1 });
  try {
    await tocar(mitad(m, "caja-menor:debe"));
    await tocar(mitad(m, "caja-menor:haber"));
    assert.equal(mitad(m, "caja-menor:debe").getAttribute("aria-pressed"), "false");
    assert.equal(mitad(m, "caja-menor:haber").getAttribute("aria-pressed"), "true");
  } finally { m.desmontar(); }
});

test("★★★ el acierto suma en las dos mitades, cambia el sobre y el libro dice «= sobre»; el error marca, no escribe, y a los 0,7 s escribe lo que iba", async () => {
  const s = D.SERIE_1;
  /* Operación 2 (el reembolso), con la 1 ya jugada: la trampa. */
  for (const modo of ["bien", "mal"]) {
    const m = montarJuego({ items: s });
    try {
      await armar(m, s.ops[0]);
      await tocar(siguiente(m));
      const op = s.ops[1];
      assert.equal(sobre(m), 300_000);
      assert.ok(q(m, "[data-fila-sobre=soportes]").textContent.includes("214.600"), "el reembolso trae sus soportes");
      if (modo === "bien") {
        await armar(m, op);
        assert.equal(mitad(m, "gastos-generales:debe").dataset.marca, "bien");
        assert.equal(mitad(m, "bancos:haber").dataset.marca, "bien");
        await esperar(500);
        assert.equal(mitad(m, "gastos-generales:debe").textContent.replace(/[^\d.]/g, ""), "214.600");
        assert.equal(mitad(m, "bancos:haber").textContent.replace(/[^\d.]/g, ""), "514.600");
        assert.equal(q(m, "[data-diria]"), null);
      } else {
        await armar(m, { debe: D.CAJA_MENOR, haber: D.BANCOS });
        assert.equal(mitad(m, "caja-menor:debe").dataset.marca, "mal");
        assert.equal(mitad(m, "bancos:haber").dataset.marca, "bien");
        assert.equal(mitad(m, "gastos-generales:debe").dataset.marca, undefined, "«Iba aquí» antes de tiempo");
        assert.equal(q(m, "[data-diria]").textContent, D.diriaH3(514_600, 300_000));
        assert.ok(q(m, '[data-diria] [data-icono="x"]'), "el X de lucide en la línea «diría»");
        assert.equal(libro(m), 300_000, "en el error, el libro se movió antes de tiempo");
        assert.equal(sobre(m), 300_000);
        assert.ok(CORAL.test(w.getComputedStyle(mitad(m, "caja-menor:debe")).borderTopColor), "el error no va en coral");
        await esperar(ESPERA_ERROR_MS + 50);
        assert.equal(mitad(m, "gastos-generales:debe").dataset.marca, "era");
      }
      await esperar(500);
      assert.equal(libro(m), 300_000);
      assert.equal(sobre(m), 300_000);
      assert.equal(q(m, "[data-fila-sobre=soportes]").textContent.trim(), "", "tras el reembolso los soportes siguen en el sobre");
      assert.ok(q(m, "[data-igual-sobre]"), "el libro no dice «= sobre»");
    } finally { m.desmontar(); }
  }
});

test("★★★ la serie entera, todo mal: cada operación parte del fondo correcto, y al final libro = sobre = 350.000", async () => {
  const s = D.SERIE_1;
  const m = montarJuego({ items: s });
  try {
    for (const op of s.ops) {
      assert.equal(libro(m), D.sobreSuma(op.antes), `${op.id}: no parte del fondo correcto`);
      await armar(m, { debe: op.haber, haber: op.debe });
      await esperar(ESPERA_ERROR_MS + 50);
      await esperar(500);
      assert.equal(libro(m), D.sobreSuma(op.despues), `${op.id}: el libro no quedó en el sobre`);
      await tocar(siguiente(m));
    }
    assert.ok(q(m, "[data-fin]"));
    assert.equal(m.completados[0][0], 0);
  } finally { m.desmontar(); }
});

test("★★★ «Operación n de 4» coincide con el pulso activo al llegar y después de responder", async () => {
  const m = montarJuego({ items: D.SERIE_2 });
  try {
    for (const [k, op] of D.SERIE_2.ops.entries()) {
      const avance = () => ({ n: Number(q(m, "[data-avance]").textContent.match(/Operación (\d) de 4/)[1]), activo: [...m.caja.querySelectorAll("[data-nodo]")].findIndex((x) => x.dataset.nodo === "actual") + 1 });
      assert.deepEqual(avance(), { n: k + 1, activo: k + 1 }, `${op.id} al llegar`);
      await armar(m, op);
      assert.deepEqual(avance(), { n: k + 1, activo: k + 1 }, `${op.id} tras responder`);
      await tocar(siguiente(m));
    }
  } finally { m.desmontar(); }
});

test("★★★ B4: el acierto es Check y borde blanco; teal y ámbar solo en «Debe» y «Haber»; seguir es el Responder teal", async () => {
  const m = montarJuego({ items: D.SERIE_1 });
  try {
    await armar(m, D.SERIE_1.ops[0]);
    await esperar(500);
    const raiz = q(m, "[data-t4-h3]");
    assert.deepEqual([...new Set(conColor(raiz, TEAL_AMBAR).filter((e) => !e.closest("[data-avance-t4]")).map((e) => e.textContent.trim()))].filter((x) => x && !/^Operación/.test(x)).sort(), ["Debe", "Haber"]);
    assert.deepEqual(conColor(q(m, "[data-figura]"), CORAL), [], "hay coral en un acierto");
    for (const k of ["caja-menor:debe", "bancos:haber"]) {
      assert.equal(mitad(m, k).dataset.marca, "bien");
      assert.equal(w.getComputedStyle(mitad(m, k)).borderTopColor, "rgb(248, 249, 250)");
    }
    const b = siguiente(m);
    assert.equal(b.textContent, D.BOTON_H3.siguiente);
    /* El avance es el Responder compartido: teal con texto #06202A (prompt maestro §4.3). Un botón blanco no pasa. */
    assert.equal(w.getComputedStyle(b).backgroundColor, "rgb(42, 157, 143)");
    assert.equal(w.getComputedStyle(b).color, "rgb(6, 32, 42)");
  } finally { m.desmontar(); }
  const imports = leer("src/components/t4/SeMueveLaCajaMenor.jsx").split("\n").filter((l) => /^import /.test(l)).join("\n");
  assert.doesNotMatch(imports, /\b(Opcion|Opciones|ConstructorAsiento|Responder|AsientoEnLineas)\b/, "el Responder entra solo por Avance (comun.jsx)");
});

test("★★★ al terminar: el cierre con su texto y su pie, y onCompletar con el porcentaje y el asiento armado en cada error", async () => {
  const s = D.SERIE_1;
  const m = montarJuego({ items: s });
  try {
    for (const [k, op] of s.ops.entries()) {
      await armar(m, k === 1 ? { debe: D.CAJA_MENOR, haber: D.BANCOS } : op);
      assert.equal(siguiente(m).textContent, k === 3 ? D.BOTON_H3.verResumen : D.BOTON_H3.siguiente);
      await tocar(siguiente(m));
    }
    assert.equal(q(m, "[data-resumen]").textContent, "3 de 4 asientos bien armados.");
    assert.equal(q(m, "[data-cierre]").textContent, D.CIERRE_H3.texto);
    assert.equal(q(m, "[data-pie-cierre]").textContent, D.CIERRE_H3.pie);
    const [pct, , detalle] = m.completados[0];
    assert.equal(pct, 75);
    assert.deepEqual(detalle.map((x) => [x.item, x.ok, x.respuesta]), [["h3-1", true, null], ["h3-2", false, "caja-menor / bancos"], ["h3-3", true, null], ["h3-4", true, null]]);
  } finally { m.desmontar(); }
});

test("★★ en modo demo: sin Encabezado ni Pulsos, CON «Comprobar» (la mano lo toca), sin seguir y sin reportar nada", async () => {
  const m = montarJuego({ items: D.EJEMPLO_H3, modoDemo: true });
  try {
    assert.ok(q(m, "[data-t4-h3-demo]"));
    assert.equal(q(m, "[data-t4-h3]"), null);
    assert.equal(q(m, "[data-encabezado]"), null);
    assert.equal(q(m, "[data-avance]"), null);
    assert.ok(comprobar(m), "en la demo no está «Comprobar»");
    assert.ok(m.caja.textContent.includes("LO QUE TIENE JULIO"));
    await armar(m, D.EJEMPLO_H3.ops[0]);
    assert.equal(visible(q(m, "[data-devolucion]")), `Correcto. ${D.EJEMPLO_H3.ops[0].acierto}`);
    assert.equal(siguiente(m), null);
    assert.equal(m.completados.length, 0);
  } finally { m.desmontar(); }
});

/* ═══════════ 4 · CAMINO, CATÁLOGO, PANEL Y «ASÍ SE JUEGA» ═══════════ */

test("★★★ en T4, justo después de A2: evaluativa, medio, 25 FP; la vista la abre con el componente nuevo", () => {
  assert.deepEqual(clasificacionDe("contabilidad", TEMA_T4, D.H3_ID), { tipo: HACER, modalidad: "evaluativa", dificultad: "medio", fpBase: 25 });
  const ids = TEMA.actividades.map((x) => x.id);
  assert.equal(ids.indexOf(D.H3_ID), ids.indexOf("t4-a2-el-fondo-fijo") + 1);
  assert.equal(JUEGOS_T4.find((j) => j.id === D.H3_ID).Mecanica, SeMueveLaCajaMenor);
  assert.equal(actividadesDeTipo(TEMA, HACER).find((a) => a.id === D.H3_ID).nombre, D.H3.nombre);
});

test("★★★ la 0202 no cambia y es la única que nombra la actividad; ninguna migración nombra sus ítems", () => {
  const dir = new URL("supabase/migrations/", RAIZ);
  const archivos = readdirSync(dir);
  assert.deepEqual(archivos.filter((f) => readFileSync(new URL(f, dir), "utf8").includes(D.H3_ID)), ["0202_t4_se_mueve_la_caja_menor.sql"]);
  assert.match(leer("supabase/migrations/0202_t4_se_mueve_la_caja_menor.sql"), /\('t4-se-mueve-la-caja-menor',\s*'contabilidad',\s*'efectivo-caja-menor-bancos',\s*'evaluativa',\s*'medio',\s*25,\s*1\)/);
  for (const op of D.SERIES_H3.flatMap((s) => s.ops)) assert.deepEqual(archivos.filter((f) => readFileSync(new URL(f, dir), "utf8").includes(`'${op.id}'`)), [], op.id);
});

test("★★★ el panel docente lee cada item_id que guarda la partida, por el texto de su operación", () => {
  for (const op of D.SERIES_H3.flatMap((s) => s.ops)) assert.equal(etiquetaDeItem(D.H3_ID, op.id), recortar(op.texto), op.id);
  assert.equal(etiquetaDeItem(D.H3_ID, "h3-9"), null);
});

test("★★★ «Así se juega»: pasos, ejemplo y texto alternativo del paquete; la mano pone las dos fichas y toca «Comprobar»", () => {
  const asi = ASI_SE_JUEGA[D.H3_ID];
  assert.equal(asi.consigna, D.H3.consigna);
  assert.deepEqual(asi.pasos, D.PASOS_H3);
  for (const p of D.PASOS_H3) assert.ok(PAQ.includes(`| ${p} |`), p);
  assert.ok(PAQ.includes(`| ${D.EJEMPLO_H3.ops[0].texto} |`));
  assert.ok(PAQ.includes(`| Correcto. ${D.EJEMPLO_H3.ops[0].acierto} |`));
  assert.ok(PAQ.includes(`| ${D.ALT_H3} |`));
  assert.deepEqual(asi.guion.toques.map((t) => t.en), ['[data-destino="caja-menor:debe"]', '[data-destino="bancos:haber"]', '[data-boton="comprobar"] button']);
  assert.ok(!D.SERIES_H3.some((s) => s.empresa === D.EJEMPLO_H3.empresa), "el ejemplo es de una serie");
});

test("★★★ en la página del juego hay exactamente UN [data-t4-h3]: la partida; la demo lleva el suyo", async () => {
  try { w.localStorage.clear(); } catch { /* sin almacenamiento */ }
  const m = montar(h(AuthContext.Provider, { value: { usuario: null, pedirCuenta: () => {} } }, h(ContabilidadT4View, { modo: HACER, nodoInicial: D.H3_ID, onBack: () => {} })));
  await esperar(0);
  try {
    assert.equal(m.caja.querySelectorAll("[data-t4-h3]").length, 1);
    assert.equal(m.caja.querySelectorAll("[data-t4-h3-demo]").length, 1);
    assert.ok(m.caja.querySelector("[data-asi-se-juega] [data-t4-h3-demo]"));
  } finally { m.desmontar(); }
});

test("★★★ D2: el objetivo de la pieza se ve antes de empezar, en el Encabezado compartido (por su prop), antes de la consigna", () => {
  const m = montarJuego();
  try {
    const o = m.caja.querySelector("[data-encabezado] [data-objetivo]");
    assert.equal(o?.textContent, D.H3.objetivo);
    assert.ok(o.compareDocumentPosition(m.caja.querySelector("[data-encabezado] [data-consigna]")) & 4, "el objetivo no va antes de la consigna");
  } finally { m.desmontar(); }
});
