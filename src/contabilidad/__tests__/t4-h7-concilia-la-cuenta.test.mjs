import { test } from "node:test";
import assert from "node:assert/strict";
import { readdirSync, readFileSync } from "node:fs";

/*
 * ═══════════════════════════════════════════════════════════════════════════
 * T4 · H7 «Concilia la cuenta» (Célula D), con H6 DENTRO · Hacer · evaluativa
 * · difícil · 50 FP. REDISEÑO DE ENGANCHE: las libretas y el par.
 *
 *   · cada texto es el del paquete vigente (d4-t4-h7-v2-rediseno.md), letra
 *     por letra, con las cifras nuevas de la serie 1 (cheque a Mario Sánchez
 *     310.500, extracto 1.874.400)
 *   · las cifras: SOLO los signos correctos llegan al saldo conciliado, en
 *     cada lado (las 3⁴ = 81 del banco y las 3⁵ = 243 de los libros: cada
 *     partida suma, resta o no entra), y las seis cifras de error son las del
 *     script de Katsumi
 *   · cada error con nombre se comete con el gesto mínimo (un toque en la
 *     fase 1; los dos saldos escritos y «Comprobar» en la 2) y sale ESE texto
 *   · PH8-2: mientras se pregunta, nada de la respuesta en el DOM; los
 *     saldos conciliados no están hasta comprobar
 *   · el par cuenta hasta lo escrito y el «=» sale solo con los dos saldos
 *     verdaderos; las marcas de cifra son «✓ Correcto» y «✗ Cifra errada»
 * ═══════════════════════════════════════════════════════════════════════════
 */

const { w, h, act, montar, tocar, esperar, conColor, TEAL_AMBAR, CORAL, visible } = await import("./t4-dom.mjs");
const D = await import("../../data/contabilidadT4H7.js");
const { ESPERA_ERROR_MS, ESPERA_SALDOS_MS } = await import("../../data/contabilidadT4Hacer.js");
const { SUBJECTS, HACER, clasificacionDe } = await import("../../data/subjects.js");
const { default: ContabilidadT4View, ConciliaLaCuenta, JUEGOS_T4, TEMA_T4 } = await import("../../components/ContabilidadT4View.jsx");
const { AuthContext } = await import("../../auth/AuthProvider.jsx");
const { etiquetaDeItem, recortar } = await import("../../docente/etiquetasItem.js");
const { ASI_SE_JUEGA } = await import("../../data/asiSeJuega.js");
const { inflesz } = await import("../../herramientas/inflesz.js");
const { leer, PAQUETES, RAIZ } = await import("./t4-paquete.mjs");

const PAQ = leer(`${PAQUETES}d4-t4-h7-v2-rediseno.md`);
const CAMBIOS = leer(`${PAQUETES}d4-t4-hacer-v2-cambios.md`);
const TEMA = SUBJECTS.contabilidad.topics.find((t) => t.id === TEMA_T4);
const cifra = (n) => String(n).replace(/\B(?=(\d{3})+(?!\d))/g, ".");

const Marco = ({ children }) => h("section", null, children);
function montarJuego(props = {}) {
  const completados = [];
  const m = montar(h(ConciliaLaCuenta, { Marco, onCompletar: (...a) => completados.push(a), ...props }));
  return { ...m, completados };
}
const q = (m, sel) => m.caja.querySelector(sel);
const seccion = (m, k) => q(m, `[data-destino="${k}"]`);
const siguiente = (m) => q(m, '[data-boton="seguir-hacer"]');
const comprobar = (m) => q(m, '[data-boton="comprobar"]');
const partidaActual = (m, s) => s.partidas.find((p) => p.texto === q(m, "[data-hecho]").textContent);
const lineas = (m, k) => [...seccion(m, k).querySelectorAll("[data-linea]")].map((x) => x.textContent);
/* Escribe en un campo como lo haría el teclado (el componente es controlado). */
async function escribir(m, campo, v) {
  const input = q(m, `[data-campo="${campo}"] input`);
  const set = Object.getOwnPropertyDescriptor(w.HTMLInputElement.prototype, "value").set;
  await act(async () => { set.call(input, String(v)); input.dispatchEvent(new w.Event("input", { bubbles: true })); });
}
/* La fase 1 entera, bien (o mal en las que diga `mal`), hasta los campos. */
async function aLaFase2(m, s, mal = () => false) {
  for (let k = 0; k < s.partidas.length; k++) {
    const p = partidaActual(m, s);
    await tocar(seccion(m, mal(p) ? D.SECCIONES_H7.find((x) => x !== p.va) : p.va));
    await tocar(siguiente(m));
  }
}
const par = (m) => [...m.caja.querySelectorAll("[data-par] .v")].map((x) => x.textContent);

/* ═══════════ 1 · EL TEXTO, CONTRA EL PAQUETE ═══════════ */

test("★★★ el paquete vigente es el del rediseño (v2), con H6 dentro; las v1 de H7 y H6 quedan como historia", () => {
  assert.match(PAQ, /\*\*Este archivo es la versión vigente de H7\.\*\*/);
  assert.match(PAQ, /\*\*H6 «¿Quién se enteró primero\?» se funde aquí\*\*/);
  assert.match(leer(`${PAQUETES}d4-t4-h7-v1.md`), /^> \*\*REEMPLAZADO\*\*/);
  assert.match(leer(`${PAQUETES}d4-t4-h6-v1.md`), /^> \*\*FUNDIDA EN H7/);
});

test("★★★ ficha, consigna, rótulos, botones, avisos, pies, resumen y lector del par: los del paquete", () => {
  assert.equal(D.H7_ID, "t4-concilia-la-cuenta");
  assert.equal(D.H7.nombre, "Concilia la cuenta");
  assert.ok(PAQ.includes(`(16 pal. · INFLESZ 85,7; tope 26): ${D.H7.consigna}`));
  const R = D.ROTULOS_H7;
  for (const t of [`«${R.parBanco}» y «${R.parLibros}»`, `«${R.banco} · ${R.bancoSub}» y «${R.libros} · ${R.librosSub}»`, `«${R.mas}» y «${R.menos}»`, `«${R.campoBanco}» y «${R.campoLibros}»`]) assert.ok(PAQ.includes(t), t);
  for (const b of Object.values(D.BOTON_H7)) assert.ok(PAQ.includes(`«${b}»`), b);
  assert.ok(PAQ.includes(`aviso «${D.FALTAN_SALDOS}»`));
  assert.ok(PAQ.includes(`Pie: «${D.PIE_FASE1_H7}»`) && PAQ.includes(`Pie: «${D.PIE_FASE2_H7}»`));
  assert.ok(PAQ.includes(`«${D.resumenH7("N")}»`));
  assert.ok(PAQ.includes("Lector del par: «El banco: {x}. Los libros: {y}.», y «Son iguales.» solo si lo son"));
  assert.equal(D.lectorParH7("1", "2"), "El banco: 1. Los libros: 2.");
  assert.equal(D.lectorParH7("2", "2"), "El banco: 2. Los libros: 2. Son iguales.");
  assert.ok(PAQ.includes("«✓ Correcto» y «✗ Cifra errada»"));
});

test("★★★ las nueve partidas de cada serie: id, tipo, sección, monto y texto (sin el monto ni «todavía no lo ha anotado»)", () => {
  for (const s of D.SERIES_H7) {
    for (const p of s.partidas) {
      const fila = `| ${s.id.slice(1)} · H7-${p.n} | ${p.tipo} · ${p.va} | ${cifra(p.monto)} | ${p.texto} |`;
      assert.ok(PAQ.includes(fila), `${p.id}: ${fila}`);
      assert.doesNotMatch(p.texto, /\$|todavía no lo ha anotado/, p.id);
      assert.ok(PAQ.includes(`| ${p.tipo} | Acierto | Correcto. ${p.acierto} |`), `${p.id}: el acierto`);
      for (const [k, t] of Object.entries(p.errores)) assert.ok(PAQ.includes(`| ${p.tipo} | Si va a ${k} | ${t} |`), `${p.id} → ${k}`);
      assert.deepEqual(Object.keys(p.errores).sort(), D.SECCIONES_H7.filter((x) => x !== p.va).sort(), p.id);
    }
    assert.ok(PAQ.includes(s.cierre), `${s.id}: el cierre`);
  }
  /* Las cifras nuevas de Katsumi, serie 1. */
  assert.equal(D.SERIE_1.partidas.find((p) => p.quien === "Mario Sánchez").monto, 310_500);
  assert.equal(D.SERIE_1.extracto, 1_874_400);
});

test("★★★ la fase 2: cada mensaje de cada serie, con su cifra, como en el paquete", () => {
  for (const s of D.SERIES_H7) {
    const n = s.id.slice(1);
    assert.ok(PAQ.includes(`| ${n} | Los dos, ${cifra(s.conciliadoBanco)} | Correcto. ${D.SALDOS_H7.acierto} |`));
    assert.ok(PAQ.includes(`| ${n} | Los dos iguales, pero otra cifra | ${D.SALDOS_H7.igualesOtraCifra} |`));
    assert.ok(PAQ.includes(`| ${n} | Cualquier otra | ${D.SALDOS_H7.otro} |`));
    for (const e of s.erroresBanco) assert.ok(PAQ.includes(`| ${n} | Banco = ${cifra(e.cifra)} | ${e.texto} |`), `${s.id} banco ${e.cifra}`);
    for (const e of s.erroresLibros) assert.ok(PAQ.includes(`| ${n} | Libros = ${cifra(e.cifra)} | ${e.texto} |`), `${s.id} libros ${e.cifra}`);
  }
});

test("★★ INFLESZ con la herramienta oficial: cada texto de 10 palabras o más da 65 o más", () => {
  const ts = [D.H7.consigna, D.ALT_H7, ...Object.values(D.ACIERTO_H7).map((t) => `Correcto. ${t}`), ...Object.values(D.ERRORES_H7).flatMap(Object.values), ...Object.values(D.SALDOS_H7),
    ...D.SERIES_H7.flatMap((s) => [s.cierre, ...s.partidas.map((p) => p.texto), ...s.erroresBanco.map((e) => e.texto), ...s.erroresLibros.map((e) => e.texto)])];
  for (const t of ts) { const v = inflesz(t); if (v.aplica) assert.ok(v.valor >= 65, `${v.valor}: ${t}`); }
});

/* ═══════════ 2 · LAS CIFRAS ═══════════ */

/* Todas las maneras de llevar las partidas de un lado a su saldo: cada una suma, resta o no entra. */
function* signos(n) { if (n === 0) { yield []; return; } for (const r of signos(n - 1)) for (const x of [1, -1, 0]) yield [...r, x]; }

test("★★★ SOLO los signos correctos llegan al saldo conciliado, en cada lado (81 y 243 formas), en las dos series", () => {
  for (const s of D.SERIES_H7) {
    assert.equal(s.conciliadoBanco, s.conciliadoLibros, `${s.id}: los dos lados no concilian`);
    for (const [lado, base] of [["banco", s.extracto], ["libros", s.libros]]) {
      const ps = s.partidas.filter((p) => p.va.startsWith(`${lado}:`));
      const buenas = ps.map((p) => (p.va.endsWith(":mas") ? 1 : -1));
      const llegan = [...signos(ps.length)].filter((c) => base + c.reduce((x, v, k) => x + v * ps[k].monto, 0) === s.conciliadoBanco);
      assert.equal(ps.length, lado === "banco" ? 4 : 5);
      assert.deepEqual(llegan, [buenas], `${s.id} ${lado}: llegan ${llegan.length}`);
    }
    /* Y lo mismo, con las partidas puestas como las deja la fase 1. */
    const puestas = s.partidas.map((p) => ({ seccion: p.va, monto: p.monto }));
    assert.deepEqual([D.saldoDeLado(s, "banco", puestas), D.saldoDeLado(s, "libros", puestas)], [s.conciliadoBanco, s.conciliadoLibros]);
  }
  /* Las del script de Katsumi. */
  const c = CAMBIOS.slice(CAMBIOS.indexOf("══ H7, serie 1"));
  assert.match(c, /banco: {2}1\.874\.400 \+ 1\.265\.000 − 587\.700 = 2\.551\.700/);
  assert.match(c, /libros: 2\.484\.800 \+ 589\.200 − 522\.300 = 2\.551\.700/);
  assert.match(c, /errores con cifra: banco 1\.197\.100 · banco 3\.139\.400 · banco 1\.286\.700 · libros 2\.417\.900 · libros 3\.074\.000 · libros 1\.962\.500/);
  assert.deepEqual([...D.SERIE_1.erroresBanco, ...D.SERIE_1.erroresLibros].map((e) => e.cifra), [1_197_100, 3_139_400, 1_286_700, 2_417_900, 3_074_000, 1_962_500]);
  assert.deepEqual([...D.SERIE_2.erroresBanco, ...D.SERIE_2.erroresLibros].map((e) => e.cifra), [3_056_100, 4_164_300, 2_430_000, 2_804_300, 3_889_000, 2_579_400]);
  assert.equal(D.SERIE_2.conciliadoBanco, 3_377_500);
});

/* ═══════════ 3 · LA PARTIDA ═══════════ */

test("★★★ PH8-2 · fase 1: mientras se pregunta, nada de la respuesta ni del saldo conciliado está en el DOM", () => {
  for (const s of D.SERIES_H7) for (const p of s.partidas) {
    const m = montarJuego({ items: { serie: s, partidas: [p] } });
    try {
      const raiz = q(m, "[data-t4-h7]");
      for (const x of [p.acierto, ...Object.values(p.errores), p.pagina, "Correcto", "No va aquí", "Iba aquí", cifra(s.conciliadoBanco), ...D.SERIES_H7.flatMap((y) => [...y.erroresBanco, ...y.erroresLibros]).map((e) => e.texto)]) {
        assert.ok(!raiz.textContent.includes(x), `${p.id}: «${x.slice(0, 30)}» en el texto`);
        assert.ok(!raiz.outerHTML.includes(x), `${p.id}: «${x.slice(0, 30)}» en el HTML`);
      }
      assert.equal(raiz.querySelector("[data-marca], [data-mensaje], [data-campo]"), null);
      assert.equal(q(m, "[data-monto]").textContent, cifra(p.monto));
      assert.deepEqual(par(m), [cifra(s.extracto), cifra(s.libros)]);
      /* Las cuatro secciones guardan el mismo hueco: el alto no delata cuántas van en cada una. */
      for (const k of D.SECCIONES_H7) assert.equal(seccion(m, k).querySelector(".t4lb-ls").children.length, 0, k);
    } finally { m.desmontar(); }
  }
});

test("★★★ gesto mínimo, fase 1: cada error con nombre de cada partida se comete con UN toque y sale ESE mensaje", async () => {
  for (const s of D.SERIES_H7) for (const p of s.partidas) for (const [k, t] of Object.entries(p.errores)) {
    const m = montarJuego({ items: { serie: s, partidas: [p] } });
    try {
      await tocar(seccion(m, k));
      assert.equal(q(m, "[data-mensaje]").dataset.mensaje, "error");
      assert.equal(visible(q(m, "[data-devolucion]")), t, `${p.id} → ${k}`);
      assert.equal(q(m, "[data-pagina]").textContent, D.PIE_FASE1_H7);
    } finally { m.desmontar(); }
  }
});

test("★★★ fase 1: el acierto escribe con «✓ Correcto»; el error marca «✗ No va aquí», no escribe, y a los 0,7 s escribe donde iba («Iba aquí»)", async () => {
  const s = D.SERIE_1;
  const p = s.partidas[0];
  const m = montarJuego({ items: { serie: s, partidas: [p, s.partidas[3]] } });
  try {
    await tocar(seccion(m, "libros:menos"));
    assert.equal(seccion(m, "libros:menos").dataset.marca, "mal");
    assert.match(seccion(m, "libros:menos").textContent, /✗No va aquí/);
    assert.ok(CORAL.test(w.getComputedStyle(seccion(m, "libros:menos")).borderTopColor));
    for (const k of D.SECCIONES_H7) assert.deepEqual(lineas(m, k), [], `${k}: se escribió antes de tiempo`);
    for (const k of D.SECCIONES_H7) assert.equal(seccion(m, k).disabled, true, "un segundo toque");
    await esperar(ESPERA_ERROR_MS + 50);
    assert.equal(seccion(m, p.va).dataset.marca, "era");
    assert.match(seccion(m, p.va).textContent, /Iba aquí/);
    assert.deepEqual(lineas(m, p.va), [cifra(p.monto)]);
    assert.deepEqual(lineas(m, "libros:menos"), []);
    await tocar(siguiente(m));
    await tocar(seccion(m, "banco:mas"));
    assert.equal(seccion(m, "banco:mas").dataset.marca, "bien");
    assert.match(seccion(m, "banco:mas").textContent, /✓Correcto/);
    assert.deepEqual(lineas(m, "banco:mas"), ["1.265.000"]);
    assert.equal(w.getComputedStyle(seccion(m, "banco:mas")).borderTopColor, "rgb(248, 249, 250)");
  } finally { m.desmontar(); }
});

test("★★★ fase 1 entera, aunque se falle todo: las nueve partidas quedan en su sección correcta para la fase 2", async () => {
  for (const s of D.SERIES_H7) {
    const m = montarJuego({ items: { serie: s, partidas: s.partidas } });
    try {
      await aLaFase2(m, s, () => true);
      assert.equal(q(m, "[data-t4-h7]").dataset.fase, "2");
      for (const k of D.SECCIONES_H7) assert.deepEqual(lineas(m, k).sort(), s.partidas.filter((p) => p.va === k).map((p) => cifra(p.monto)).sort(), `${s.id} ${k}`);
      assert.ok(!q(m, "[data-t4-h7]").textContent.includes(cifra(s.conciliadoBanco)), "el saldo conciliado salió antes de comprobar");
    } finally { m.desmontar(); }
  }
});

test("★★★ fase 2: con un campo vacío, «Comprobar los saldos» da el aviso y NO gasta el intento", async () => {
  const s = D.SERIE_2;
  const m = montarJuego({ items: { serie: s, partidas: s.partidas } });
  try {
    await aLaFase2(m, s);
    await escribir(m, "banco", "3.377.500");
    await tocar(comprobar(m));
    assert.equal(q(m, "[data-aviso]").textContent, D.FALTAN_SALDOS);
    assert.equal(q(m, "[data-mensaje]"), null);
    assert.ok(comprobar(m), "el intento se gastó");
  } finally { m.desmontar(); }
});

test("★★★ gesto mínimo, fase 2: cada cifra de error de cada serie se escribe y comprueba, y sale ESE mensaje con sus marcas de cifra", async () => {
  for (const s of D.SERIES_H7) {
    const casos = [
      ...s.erroresBanco.map((e) => [e.cifra, s.conciliadoLibros, e.texto]),
      ...s.erroresLibros.map((e) => [s.conciliadoBanco, e.cifra, e.texto]),
      [111_111, 111_111, D.SALDOS_H7.igualesOtraCifra],
      [s.conciliadoBanco, 222_222, D.SALDOS_H7.otro],
      [s.conciliadoBanco, s.conciliadoLibros, `Correcto. ${D.SALDOS_H7.acierto}`],
    ];
    for (const [b, l, texto] of casos) {
      const m = montarJuego({ items: { serie: s, partidas: s.partidas } });
      try {
        await aLaFase2(m, s);
        await escribir(m, "banco", b);
        await escribir(m, "libros", l);
        await tocar(comprobar(m));
        assert.equal(visible(q(m, "[data-devolucion]")), texto, `${s.id} ${b} / ${l}`);
        assert.equal(q(m, "[data-pagina]").textContent, D.PIE_FASE2_H7);
        for (const [campo, v, bien] of [["banco", b, s.conciliadoBanco], ["libros", l, s.conciliadoLibros]]) {
          const marca = q(m, `[data-campo="${campo}"] .t4r-marca`).textContent;
          assert.equal(marca, v === bien ? "✓Correcto" : "✗Cifra errada", `${campo}: la marca de cifra`);
        }
      } finally { m.desmontar(); }
    }
  }
});

test("★★★ el par cuenta hasta lo escrito; el «=» sale SOLO con los dos saldos verdaderos; si no, a los 1,2 s pasa a la verdad", async () => {
  const s = D.SERIE_1;
  for (const [b, l, ok] of [[s.conciliadoBanco, s.conciliadoLibros, true], [3_139_400, s.conciliadoLibros, false], [2_000_000, 2_000_000, false]]) {
    const m = montarJuego({ items: { serie: s, partidas: s.partidas } });
    try {
      await aLaFase2(m, s);
      assert.equal(q(m, "[data-par]").dataset.igual, undefined);
      await escribir(m, "banco", b);
      await escribir(m, "libros", l);
      await tocar(comprobar(m));
      await esperar(600);
      assert.deepEqual(par(m), [cifra(b), cifra(l)], "el par no cuenta hasta lo escrito");
      assert.equal(q(m, ".t4pr-igual").style.visibility, ok ? "visible" : "hidden", `${b}/${l}: el «=»`);
      assert.equal(q(m, "[data-lector-par]").getAttribute("aria-label"), D.lectorParH7(cifra(b), cifra(l)));
      if (!ok) {
        await esperar(ESPERA_SALDOS_MS);
        await esperar(600);
        assert.deepEqual(par(m), [cifra(s.conciliadoBanco), cifra(s.conciliadoLibros)]);
        assert.equal(q(m, ".t4pr-igual").style.visibility, "visible");
      }
    } finally { m.desmontar(); }
  }
});

test("★★★ «Paso n de 10» coincide con el pulso activo; al terminar, el cierre de la serie y onCompletar con once puntos", async () => {
  const s = D.SERIE_1;
  const m = montarJuego({ items: { serie: s, partidas: s.partidas } });
  try {
    for (let k = 0; k < 9; k++) {
      const avance = Number(q(m, "[data-avance]").textContent.match(/Paso (\d+) de 10/)[1]);
      assert.equal(avance, k + 1);
      const p = partidaActual(m, s);
      await tocar(seccion(m, k === 0 ? "banco:mas" : p.va));
      assert.equal(Number(q(m, "[data-avance]").textContent.match(/Paso (\d+) de 10/)[1]), k + 1, "el contador avanzó al responder");
      assert.equal(siguiente(m).textContent, k === 8 ? D.BOTON_H7.aLosSaldos : D.BOTON_H7.siguiente);
      await tocar(siguiente(m));
    }
    assert.equal(Number(q(m, "[data-avance]").textContent.match(/Paso (\d+) de 10/)[1]), 10);
    await escribir(m, "banco", s.conciliadoBanco);
    await escribir(m, "libros", 1);
    await tocar(comprobar(m));
    assert.equal(siguiente(m).textContent, D.BOTON_H7.verResumen);
    await tocar(siguiente(m));
    assert.equal(q(m, "[data-resumen]").textContent, "8 de 9 partidas al primer toque.");
    assert.equal(q(m, "[data-cierre]").textContent, s.cierre);
    assert.equal(q(m, "[data-pie-cierre]").textContent, D.CIERRE_PIE_H7);
    const [pct, , detalle] = m.completados[0];
    assert.equal(pct, (9 / 11) * 100);
    assert.equal(detalle.length, 11);
    assert.deepEqual(detalle.slice(-2).map((x) => [x.item, x.ok]), [["saldo-banco", true], ["saldo-libros", false]]);
  } finally { m.desmontar(); }
});

test("★★★ B4: el acierto es ✓ y borde blanco; teal y ámbar no aparecen en la pieza; seguir en blanco neutro", async () => {
  const s = D.SERIE_1;
  const m = montarJuego({ items: { serie: s, partidas: s.partidas } });
  try {
    await aLaFase2(m, s);
    await escribir(m, "banco", s.conciliadoBanco);
    await escribir(m, "libros", s.conciliadoLibros);
    await tocar(comprobar(m));
    const raiz = q(m, "[data-t4-h7]");
    /* Lo único teal es el avance compartido (Pulsos), que no es de la pieza. */
    assert.deepEqual(conColor(q(m, "[data-figura]"), TEAL_AMBAR), []);
    assert.deepEqual(conColor(raiz, TEAL_AMBAR).filter((e) => !e.closest("[data-avance]")).map((e) => e.outerHTML.slice(0, 60)), []);
    assert.deepEqual(conColor(q(m, "[data-figura]"), CORAL), []);
    assert.equal(w.getComputedStyle(siguiente(m)).backgroundColor, "rgb(248, 249, 250)");
  } finally { m.desmontar(); }
  const imports = leer("src/components/t4/ConciliaLaCuenta.jsx").split("\n").filter((l) => /^import /.test(l)).join("\n");
  assert.doesNotMatch(imports, /\b(Opcion|Opciones|ConstructorAsiento|Responder)\b/);
});

test("★★ en modo demo: sin Encabezado ni Pulsos, con el par propio de la demo; sin seguir y sin reportar", async () => {
  const m = montarJuego({ items: D.EJEMPLO_H7, modoDemo: true });
  try {
    assert.ok(q(m, "[data-t4-h7-demo]"));
    assert.equal(q(m, "[data-encabezado]"), null);
    assert.deepEqual(par(m), ["640.000", "652.000"]);
    await tocar(seccion(m, "libros:menos"));
    assert.equal(visible(q(m, "[data-devolucion]")), `Correcto. ${D.EJEMPLO_H7.partidas[0].acierto}`);
    assert.equal(siguiente(m), null);
    assert.equal(m.completados.length, 0);
  } finally { m.desmontar(); }
});

/* ═══════════ 4 · CAMINO, CATÁLOGO, PANEL Y «ASÍ SE JUEGA» ═══════════ */

test("★★★ en T4, justo después de A5: evaluativa, difícil, 50 FP; la vista la abre con el componente nuevo; H6 ya no está", () => {
  assert.deepEqual(clasificacionDe("contabilidad", TEMA_T4, D.H7_ID), { tipo: HACER, modalidad: "evaluativa", dificultad: "dificil", fpBase: 50 });
  const ids = TEMA.actividades.map((x) => x.id);
  assert.equal(ids.indexOf(D.H7_ID), ids.indexOf("t4-a5-san-calixto") + 1);
  assert.equal(JUEGOS_T4.find((j) => j.id === D.H7_ID).Mecanica, ConciliaLaCuenta);
  assert.ok(!ids.includes("t4-quien-se-entero-primero"));
});

test("★★★ la 0206 no cambia y es la única que nombra la actividad; ninguna migración nombra sus ítems", () => {
  const dir = new URL("supabase/migrations/", RAIZ);
  const archivos = readdirSync(dir);
  assert.deepEqual(archivos.filter((f) => readFileSync(new URL(f, dir), "utf8").includes(D.H7_ID)), ["0206_t4_concilia_la_cuenta.sql"]);
  for (const id of [...D.SERIES_H7.flatMap((s) => s.partidas.map((p) => p.id)), "saldo-banco", "saldo-libros"]) {
    assert.deepEqual(archivos.filter((f) => readFileSync(new URL(f, dir), "utf8").includes(`'${id}'`)), [], id);
  }
});

test("★★★ el panel docente lee cada item_id que guarda la partida", () => {
  for (const p of D.SERIES_H7.flatMap((s) => s.partidas)) assert.equal(etiquetaDeItem(D.H7_ID, p.id), recortar(p.texto), p.id);
  assert.equal(etiquetaDeItem(D.H7_ID, "saldo-banco"), D.ROTULOS_H7.campoBanco);
  assert.equal(etiquetaDeItem(D.H7_ID, "saldo-libros"), D.ROTULOS_H7.campoLibros);
});

test("★★★ «Así se juega»: pasos, ejemplo y texto alternativo del paquete; la mano TOCA el Menos de los libros", () => {
  const asi = ASI_SE_JUEGA[D.H7_ID];
  assert.equal(asi.consigna, D.H7.consigna);
  for (const p of D.PASOS_H7) assert.ok(PAQ.includes(`| ${p} |`), p);
  assert.ok(PAQ.includes(`| ${D.EJEMPLO_H7.partidas[0].texto} |`));
  assert.ok(PAQ.includes(`| Correcto. ${D.EJEMPLO_H7.partidas[0].acierto} |`));
  assert.ok(PAQ.includes(`| ${D.ALT_H7} |`));
  assert.deepEqual(asi.guion.toques.map((t) => t.en), ['[data-destino="libros:menos"]']);
});

test("★★★ en la página del juego hay exactamente UN [data-t4-h7]: la partida; la demo lleva el suyo", async () => {
  try { w.localStorage.clear(); } catch { /* sin almacenamiento */ }
  const m = montar(h(AuthContext.Provider, { value: { usuario: null, pedirCuenta: () => {} } }, h(ContabilidadT4View, { modo: HACER, nodoInicial: D.H7_ID, onBack: () => {} })));
  await esperar(0);
  try {
    assert.equal(m.caja.querySelectorAll("[data-t4-h7]").length, 1);
    assert.equal(m.caja.querySelectorAll("[data-t4-h7-demo]").length, 1);
  } finally { m.desmontar(); }
});
