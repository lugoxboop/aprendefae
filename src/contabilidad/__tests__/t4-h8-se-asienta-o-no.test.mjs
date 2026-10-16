import { test } from "node:test";
import assert from "node:assert/strict";
import { readdirSync, readFileSync } from "node:fs";

/*
 * ═══════════════════════════════════════════════════════════════════════════
 * T4 · H8 «¿Se asienta o no?» (Célula D) · Hacer · evaluativa · experto ·
 * 90 FP. REDISEÑO DE ENGANCHE: una figura que va creciendo hacia el mayor.
 *
 *   · cada texto es el del paquete vigente (d4-t4-h8-v2-rediseno.md), letra
 *     por letra, con las cifras nuevas de la serie 1
 *   · LAS CIFRAS: el mayor solo llega a 2.551.700 (3.377.500 en la serie 2)
 *     con TODAS las decisiones buenas: de las 3⁹ = 19.683 maneras de llevar las
 *     nueve partidas al mayor (cada una suma, resta o no entra), una sola
 *   · las 29 combinaciones equivocadas de cada asiento caen en una regla con
 *     mensaje, y cada mensaje con nombre se comete con el gesto mínimo (dos
 *     fichas y «Comprobar»); en la etapa 1 y la 3, con un toque o una cifra
 *   · PH8-1: ni el saldo conciliado ni el extracto están en el DOM antes del
 *     acierto de la etapa 3, ni después de un error en ella
 *   · B4: el acierto con ✓ y borde blanco; teal y ámbar solo en Debe/Haber
 * ═══════════════════════════════════════════════════════════════════════════
 */

const { w, h, act, montar, tocar, esperar, conColor, TEAL_AMBAR, CORAL, visible } = await import("./t4-dom.mjs");
const D = await import("../../data/contabilidadT4H8.js");
const H7 = await import("../../data/contabilidadT4H7.js");
const { ESPERA_ERROR_MS } = await import("../../data/contabilidadT4Hacer.js");
const { SUBJECTS, HACER, clasificacionDe } = await import("../../data/subjects.js");
const { default: ContabilidadT4View, SeAsientaONo, JUEGOS_T4, TEMA_T4 } = await import("../../components/ContabilidadT4View.jsx");
const { AuthContext } = await import("../../auth/AuthProvider.jsx");
const { etiquetaDeItem, recortar } = await import("../../docente/etiquetasItem.js");
const { ASI_SE_JUEGA } = await import("../../data/asiSeJuega.js");
const { inflesz } = await import("../../herramientas/inflesz.js");
const { leer, PAQUETES, RAIZ } = await import("./t4-paquete.mjs");

const PAQ = leer(`${PAQUETES}d4-t4-h8-v2-rediseno.md`);
const CAMBIOS = leer(`${PAQUETES}d4-t4-hacer-v2-cambios.md`);
const TEMA = SUBJECTS.contabilidad.topics.find((t) => t.id === TEMA_T4);
const cifra = (n) => String(n).replace(/\B(?=(\d{3})+(?!\d))/g, ".");
const CUENTAS = D.CUENTAS_H8.map((c) => c.id);
const COMBINACIONES = CUENTAS.flatMap((d) => CUENTAS.filter((x) => x !== d).map((x) => ({ debe: d, haber: x })));

const Marco = ({ children }) => h("section", null, children);
function montarJuego(props = {}) {
  const completados = [];
  const m = montar(h(SeAsientaONo, { Marco, onCompletar: (...a) => completados.push(a), ...props }));
  return { ...m, completados };
}
const q = (m, sel) => m.caja.querySelector(sel);
const destino = (m, k) => q(m, `[data-destino="${k}"]`);
const siguiente = (m) => q(m, '[data-boton="seguir-hacer"]');
const comprobar = (m) => q(m, '[data-boton="comprobar"]');
async function escribir(m, v) {
  const input = q(m, '[data-campo="mayor"] input');
  const set = Object.getOwnPropertyDescriptor(w.HTMLInputElement.prototype, "value").set;
  await act(async () => { set.call(input, String(v)); input.dispatchEvent(new w.Event("input", { bubbles: true })); });
}
async function asentar(m, a) { await tocar(destino(m, `${a.debe}:debe`)); await tocar(destino(m, `${a.haber}:haber`)); await tocar(comprobar(m)); }
const actual = (m, s) => s.partidas.find((p) => p.texto === q(m, "[data-hecho]")?.textContent);
const nota = (s, n) => s.notas.find((x) => x.n === n);
const etapa2 = (s, n) => ({ serie: s, partidas: [s.partidas.find((p) => p.n === n)], etapaInicial: 2 });
const etapa3 = (s) => ({ serie: s, partidas: s.partidas, etapaInicial: 3 });
/* Juega las etapas 1 y 2 enteras (bien, o mal en todo con `mal`), hasta el mayor. */
async function alMayor(m, s, mal = false) {
  for (let k = 0; k < 9; k++) {
    const p = actual(m, s);
    const bien = D.ETAPA1_H8[p.tipo].respuesta;
    await tocar(destino(m, mal ? (bien === D.SE_ASIENTA ? D.NO_SE_ASIENTA : D.SE_ASIENTA) : bien));
    await tocar(siguiente(m));
  }
  for (let k = 0; k < 5; k++) {
    const n = s.notas.find((x) => x.texto === q(m, "[data-hecho]").textContent);
    await asentar(m, mal ? { debe: n.haber, haber: n.debe } : n);
    if (mal) await esperar(ESPERA_ERROR_MS + 50);
    await tocar(siguiente(m));
  }
}

/* ═══════════ 1 · EL TEXTO, CONTRA EL PAQUETE ═══════════ */

test("★★★ el paquete vigente es el del rediseño (v2); la v1 queda como historia", () => {
  assert.match(PAQ, /\*\*Este archivo es la versión vigente de H8\.\*\*/);
  assert.match(PAQ, /migración 0207, que ya corrió en producción y no cambia/);
  assert.match(leer(`${PAQUETES}d4-t4-h8-v1.md`), /^> \*\*REEMPLAZADO\*\*/);
});

test("★★★ ficha, consigna, rótulos de etapa, bandejas, cuentas, mayor, botones, avisos, pies, resumen y cierre: los del paquete", () => {
  assert.equal(D.H8_ID, "t4-se-asienta-o-no");
  assert.ok(PAQ.includes(`(14 pal. · INFLESZ 72,7; tope 25, mejor en 2 renglones): ${D.H8.consigna}`));
  for (const e of D.ETAPAS_H8) assert.ok(PAQ.includes(`«${e}»`), e);
  assert.ok(PAQ.includes(`«${D.BANDEJAS_H8[0].renglones.join(" / ")}» y «${D.BANDEJAS_H8[1].renglones.join(" / ")}»`));
  assert.ok(PAQ.includes(D.CUENTAS_H8.map((c) => `«${c.renglones.join(" ")}»`).join(" · ")), "las cuentas del tablero");
  assert.ok(PAQ.includes(`**Mayor:** «${D.SERIE_H8_1.tituloMayor}» (serie 2: «${D.SERIE_H8_2.tituloMayor}»)`));
  assert.ok(PAQ.includes(`**Campo:** «${D.ROTULOS_H8.campo}»`));
  for (const b of Object.values(D.BOTON_H8)) assert.ok(PAQ.includes(`«${b}»`), b);
  assert.deepEqual([...new Set(Object.values(D.BOTON_H8))].sort(), ["Comprobar", "Otra vez", "Siguiente paso", "Ver mi resumen"]);
  for (const a of Object.values(D.AVISOS_H8)) assert.ok(PAQ.includes(`«${a}»`), a);
  for (const p of Object.values(D.PIE_H8)) assert.ok(PAQ.includes(p), p);
  assert.ok(PAQ.includes(`«${D.resumenH8("N")}»`));
  assert.ok(PAQ.includes(`(25 pal. · INFLESZ 89,7): ${D.CIERRE_H8.texto}`));
  assert.ok(PAQ.includes(`«${D.lectorParH8.antes("{y}")}»`) && PAQ.includes(`«${D.lectorParH8.acierto("{x}", "{y}")}»`));
});

test("★★★ etapa 1: el acierto y el error de cada tipo, letra por letra; las partidas son las de H7", () => {
  for (const [tipo, e] of Object.entries(D.ETAPA1_H8)) {
    assert.ok(PAQ.includes(`| ${tipo} | ${e.respuesta} | Correcto. ${e.acierto} (`), `${tipo}: el acierto`);
    assert.ok(PAQ.includes(` | ${e.error} (`), `${tipo}: el error`);
  }
  assert.deepEqual(D.SERIE_H8_1.partidas, H7.SERIE_1.partidas);
  assert.deepEqual(D.SERIE_H8_2.partidas, H7.SERIE_2.partidas);
});

test("★★★ etapa 2: el asiento y cada mensaje de las cinco notas de cada serie, letra por letra", () => {
  for (const [k, s] of D.SERIES_H8.entries()) {
    const bloque = PAQ.slice(PAQ.indexOf(`**Serie ${k + 1}**`), k === 0 ? PAQ.indexOf("**Serie 2**") : PAQ.indexOf("### Etapa 3"));
    for (const n of s.notas) {
      assert.ok(bloque.includes(`| H7-${n.n} | Acierto (${D.nombreDeCuentaH8(n.debe)} / ${D.nombreDeCuentaH8(n.haber)}) | Correcto. ${n.acierto} |`), `${n.id}: el acierto`);
      for (const [c, t] of Object.entries(n.cuenta)) assert.ok(bloque.includes(`| Usó ${D.nombreDeCuentaH8(c)} | ${t} |`), `${n.id}: ${c}`);
      assert.ok(bloque.includes(`| Usó Caja | ${n.caja} |`), `${n.id}: Caja`);
      assert.ok(bloque.includes(`| Lados al revés | ${n.reves} |`), `${n.id}: al revés`);
    }
  }
  for (const t of ["La plata de esta nota entró", "La plata de esta nota salió", "Fíjate en Bancos. Con esta nota, el banco le sumó", "Fíjate en Bancos. Con esta nota, el banco le quitó"]) assert.ok(PAQ.includes(t), t);
});

test("★★★ etapa 3: el acierto (con el extracto) y los errores con cifra de cada serie, letra por letra", () => {
  for (const [k, s] of D.SERIES_H8.entries()) {
    assert.ok(PAQ.includes(`| ${k + 1} | ${cifra(s.saldoMayor)} | Correcto. ${s.aciertoEtapa3} |`), `${s.id}: el acierto`);
    for (const e of s.erroresEtapa3) assert.ok(PAQ.includes(`| ${k + 1} | ${cifra(e.cifra)} | ${e.texto} |`), `${s.id}: ${e.cifra}`);
    assert.ok(PAQ.includes(`| ${k + 1} | Cualquier otra | ${s.otroEtapa3} |`));
  }
  assert.deepEqual(D.SERIE_H8_1.erroresEtapa3.map((e) => e.cifra), [3_074_000, 1_962_500, 3_229_000]);
  assert.match(D.SERIE_H8_1.aciertoEtapa3, /el extracto decía \$1\.874\.400/);
});

test("★★ INFLESZ con la herramienta oficial: cada texto de 10 palabras o más da 65 o más", () => {
  const ts = [D.H8.consigna, D.CIERRE_H8.texto, D.ALT_H8, ...Object.values(D.ETAPA1_H8).flatMap((e) => [`Correcto. ${e.acierto}`, e.error]),
    ...D.SERIES_H8.flatMap((s) => [`Correcto. ${s.aciertoEtapa3}`, s.otroEtapa3, ...s.erroresEtapa3.map((e) => e.texto), ...s.notas.flatMap((n) => [`Correcto. ${n.acierto}`, n.caja, n.reves, ...Object.values(n.cuenta)])])];
  for (const t of ts) { const v = inflesz(t); if (v.aplica) assert.ok(v.valor >= 65, `${v.valor}: ${t}`); }
});

/* ═══════════ 2 · LAS CIFRAS ═══════════ */

function* signos(n) { if (n === 0) { yield []; return; } for (const r of signos(n - 1)) for (const x of [1, -1, 0]) yield [...r, x]; }

test("★★★ el mayor SOLO llega al saldo conciliado con TODAS las decisiones buenas: 1 de las 19.683 maneras, en las dos series", () => {
  for (const s of D.SERIES_H8) {
    /* La buena: las notas crédito suman, las débito restan, cheques y consignación no entran. */
    const buena = s.partidas.map((p) => (p.tipo === "nc" ? 1 : p.tipo === "nd" ? -1 : 0));
    const llegan = [...signos(9)].filter((c) => s.libros + c.reduce((x, v, k) => x + v * s.partidas[k].monto, 0) === s.saldoMayor);
    assert.deepEqual(llegan, [buena], `${s.id}: llegan ${llegan.length}`);
    assert.equal(s.saldoMayor, s.id === "s1" ? 2_551_700 : 3_377_500);
    assert.equal(s.saldoMayor, H7.SERIES_H7.find((x) => x.id === s.id).conciliadoBanco, "el mayor no da el saldo conciliado de H7");
  }
  assert.match(CAMBIOS, /de las 19683 formas de llevar las 9 partidas al mayor \(sumando, restando o sin entrar\), llegan a 2\.551\.700: 1; es la de todas las decisiones buenas: True/);
});

test("★★★ cada asiento: las 29 combinaciones equivocadas caen en una regla con mensaje, en el orden del paquete (10 + 12 + 3 + 3 + 1)", () => {
  for (const s of D.SERIES_H8) for (const n of s.notas) {
    const cuenta = { caja: 0, "sin-bancos": 0, "bancos-al-lado": 0, cuenta: 0, reves: 0 };
    for (const a of COMBINACIONES.filter((x) => !(x.debe === n.debe && x.haber === n.haber))) {
      const r = D.reglaH8(n, a);
      assert.ok(r.texto, `${n.id} ${a.debe}/${a.haber}: sin mensaje`);
      cuenta[r.regla] += 1;
    }
    assert.deepEqual(Object.values(cuenta), [10, 12, 3, 3, 1], n.id);
  }
});

/* ═══════════ 3 · LA PARTIDA ═══════════ */

test("★★★ PH8-1: ni el saldo conciliado ni el extracto están en el DOM en ninguna etapa antes de responder la 3; tras su error, a los 0,7 s, «Iba aquí: {valor}» bajo el campo (§4.2, decisión de Yujiro)", async () => {
  for (const s of D.SERIES_H8) {
    const m = montarJuego({ items: { serie: s, partidas: s.partidas } });
    const prohibido = () => {
      const html = q(m, "[data-t4-h8]").outerHTML;
      for (const x of [cifra(s.saldoMayor), cifra(s.extracto)]) assert.ok(!html.includes(x), `${s.id}: «${x}» en el DOM antes del acierto`);
    };
    try {
      prohibido();
      await alMayor(m, s, true);
      prohibido();
      await escribir(m, s.erroresEtapa3[0].cifra);
      await tocar(comprobar(m));
      prohibido();
      assert.equal(visible(q(m, "[data-devolucion]")), s.erroresEtapa3[0].texto);
      assert.equal(q(m, "[data-saldo-mayor]").dataset.saldoMayor, cifra(s.erroresEtapa3[0].cifra));
      assert.match(q(m, "[data-saldo-mayor]").textContent, /✗No va aquí/);
      assert.equal(q(m, '[data-iba="mayor"]'), null, "«Iba aquí» antes de los 0,7 s");
      await esperar(ESPERA_ERROR_MS + 50);
      assert.equal(q(m, '[data-iba="mayor"]').textContent, `Iba aquí: $${cifra(s.saldoMayor)}`);
      /* El texto del error sigue sin decir el saldo: lo dice solo la revelación. */
      assert.ok(!visible(q(m, "[data-devolucion]")).includes(cifra(s.saldoMayor)));
    } finally { m.desmontar(); }
  }
});

test("★★★ PH8-2: al llegar a cada partida y a cada asiento, nada de su respuesta está en el DOM", () => {
  const s = D.SERIE_H8_1;
  for (const p of s.partidas) {
    const m = montarJuego({ items: { serie: s, partidas: [p] } });
    try {
      const raiz = q(m, "[data-t4-h8]");
      const e = D.ETAPA1_H8[p.tipo];
      for (const x of [e.acierto, e.error, "Correcto", "No va aquí", "Iba aquí"]) assert.ok(!raiz.outerHTML.includes(x), `${p.id}: «${x}»`);
      assert.equal(raiz.querySelector("[data-marca], [data-mensaje], [data-linea]"), null);
    } finally { m.desmontar(); }
  }
  for (const n of s.notas) {
    const m = montarJuego({ items: etapa2(s, n.n) });
    try {
      const raiz = q(m, "[data-t4-h8]");
      for (const x of [n.acierto, n.caja, n.reves, ...Object.values(n.cuenta), "Correcto"]) assert.ok(!raiz.outerHTML.includes(x), `${n.id}: «${x.slice(0, 30)}»`);
      assert.equal(raiz.querySelector("[data-marca], [data-mensaje]"), null);
      assert.deepEqual([...raiz.querySelectorAll("[data-mayor] [data-linea]")].map((x) => x.dataset.linea), ["inicial"]);
    } finally { m.desmontar(); }
  }
});

test("★★★ gesto mínimo, etapa 1: cada error se comete con UN toque en la bandeja equivocada; a los 0,7 s la cifra cae en la otra", async () => {
  const s = D.SERIE_H8_2;
  for (const tipo of ["cheque", "consignacion", "nc", "nd"]) {
    const p = s.partidas.find((x) => x.tipo === tipo);
    const e = D.ETAPA1_H8[tipo];
    const mala = e.respuesta === D.SE_ASIENTA ? D.NO_SE_ASIENTA : D.SE_ASIENTA;
    const m = montarJuego({ items: { serie: s, partidas: [p] } });
    try {
      await tocar(destino(m, mala));
      assert.equal(visible(q(m, "[data-devolucion]")), e.error, tipo);
      assert.equal(destino(m, mala).dataset.marca, "mal");
      assert.equal(destino(m, mala).querySelectorAll("[data-linea]").length, 0, "la cifra cayó en la bandeja equivocada");
      await esperar(ESPERA_ERROR_MS + 50);
      assert.equal(destino(m, e.respuesta).dataset.marca, "era");
      assert.deepEqual([...destino(m, e.respuesta).querySelectorAll("[data-linea]")].map((x) => x.textContent), [cifra(p.monto)]);
    } finally { m.desmontar(); }
  }
});

test("★★★ gesto mínimo, etapa 2: cada mensaje con nombre de cada nota sale con dos fichas y «Comprobar»", async () => {
  for (const s of D.SERIES_H8) for (const n of s.notas) {
    const porTexto = new Map();
    for (const a of COMBINACIONES.filter((x) => !(x.debe === n.debe && x.haber === n.haber))) {
      const r = D.reglaH8(n, a);
      if (!porTexto.has(r.texto)) porTexto.set(r.texto, a);
    }
    for (const [texto, a] of porTexto) {
      const m = montarJuego({ items: etapa2(s, n.n) });
      try {
        await asentar(m, a);
        assert.equal(visible(q(m, "[data-devolucion]")), texto, `${n.id} ${a.debe}/${a.haber}`);
      } finally { m.desmontar(); }
    }
  }
});

test("★★★ etapa 2: con el acierto, la línea de Bancos cae en el mayor en su lado; con el error, no se escribe nada y a los 0,7 s sí", async () => {
  const s = D.SERIE_H8_1;
  for (const [nn, lado] of [[5, "debe"], [7, "haber"]]) {
    for (const modo of ["bien", "mal"]) {
      const n = nota(s, nn);
      const m = montarJuego({ items: etapa2(s, nn) });
      try {
        await asentar(m, modo === "bien" ? n : { debe: n.haber, haber: n.debe });
        const enMayor = () => [...m.caja.querySelectorAll(`[data-mayor] [data-columna="${lado}"] [data-linea="${n.id}"]`)].map((x) => x.textContent);
        if (modo === "mal") {
          assert.deepEqual(enMayor(), [], "la línea cayó antes de tiempo");
          await esperar(ESPERA_ERROR_MS + 50);
          assert.equal(destino(m, `${n.debe}:debe`).dataset.marca, "era");
        }
        assert.deepEqual(enMayor(), [cifra(n.monto)], `${n.id} ${modo}`);
      } finally { m.desmontar(); }
    }
  }
});

test("★★★ etapa 2: una sola ficha y «Comprobar» da el aviso y NO gasta el intento; etapa 3: el campo vacío, igual", async () => {
  const s = D.SERIE_H8_1;
  const m = montarJuego({ items: etapa2(s, 5) });
  try {
    await tocar(destino(m, "bancos:debe"));
    await tocar(comprobar(m));
    assert.equal(q(m, "[data-aviso]").textContent, D.AVISOS_H8.lados);
    assert.equal(q(m, "[data-mensaje]"), null);
  } finally { m.desmontar(); }
  const m3 = montarJuego({ items: etapa3(s) });
  try {
    await tocar(comprobar(m3));
    assert.equal(q(m3, "[data-aviso]").textContent, D.AVISOS_H8.saldo);
    assert.equal(q(m3, "[data-mensaje]"), null);
  } finally { m3.desmontar(); }
});

test("★★★ etapa 3: cada cifra de error sale con su mensaje y «✗ No va aquí»; el acierto pone el par «el mayor = el banco»", async () => {
  for (const s of D.SERIES_H8) {
    for (const [v, texto] of [...s.erroresEtapa3.map((e) => [e.cifra, e.texto]), [1_234_567, s.otroEtapa3], [s.saldoMayor, `Correcto. ${s.aciertoEtapa3}`]]) {
      const m = montarJuego({ items: { serie: s, partidas: s.partidas } });
      try {
        await alMayor(m, s);
        await escribir(m, v);
        await tocar(comprobar(m));
        assert.equal(visible(q(m, "[data-devolucion]")), texto, `${s.id} ${v}`);
        const ok = v === s.saldoMayor;
        assert.match(q(m, "[data-saldo-mayor]").textContent, ok ? /✓Correcto/ : /✗No va aquí/);
        assert.equal(q(m, ".t4pr-igual").style.visibility, ok ? "visible" : "hidden");
        assert.equal(q(m, "[data-lector-par]").getAttribute("aria-label"), ok ? D.lectorParH8.acierto(cifra(s.saldoMayor), cifra(s.saldoMayor)) : D.lectorParH8.antes(cifra(s.libros)));
      } finally { m.desmontar(); }
    }
  }
});

test("★★★ jugado entero, aunque se falle todo: el mayor queda con el saldo y los cinco movimientos correctos", async () => {
  const s = D.SERIE_H8_1;
  const m = montarJuego({ items: { serie: s, partidas: s.partidas } });
  try {
    await alMayor(m, s, true);
    const col = (lado) => [...m.caja.querySelectorAll(`[data-mayor] [data-columna="${lado}"] [data-linea]`)].map((x) => x.dataset.linea).sort();
    assert.deepEqual(col("debe"), ["inicial", ...s.notas.filter((n) => n.debe === D.BANCOS).map((n) => n.id)].sort());
    assert.deepEqual(col("haber"), s.notas.filter((n) => n.haber === D.BANCOS).map((n) => n.id).sort());
    const lineas = { debe: s.notas.filter((n) => n.debe === D.BANCOS), haber: s.notas.filter((n) => n.haber === D.BANCOS) };
    assert.equal(D.saldoDelMayor(s, lineas), s.saldoMayor);
  } finally { m.desmontar(); }
});

test("★★★ «Paso n de 15» y el cierre: onCompletar con quince puntos y el detalle de las tres etapas", async () => {
  const s = D.SERIE_H8_2;
  const m = montarJuego({ items: { serie: s, partidas: s.partidas } });
  try {
    await alMayor(m, s);
    assert.match(q(m, "[data-avance]").textContent, /Paso 15 de 15/);
    await escribir(m, s.saldoMayor);
    await tocar(comprobar(m));
    assert.equal(siguiente(m).textContent, D.BOTON_H8.verResumen);
    await tocar(siguiente(m));
    assert.equal(q(m, "[data-resumen]").textContent, "15 de 15 al primer intento.");
    assert.equal(q(m, "[data-cierre]").textContent, D.CIERRE_H8.texto);
    assert.equal(q(m, "[data-pie-cierre]").textContent, D.CIERRE_H8.pie);
    const [pct, , detalle] = m.completados[0];
    assert.equal(pct, 100);
    assert.equal(detalle.length, 15);
    assert.ok(detalle.slice(9, 14).every((x) => x.item.startsWith("asiento-")));
    assert.equal(detalle[14].item, "saldo-mayor");
  } finally { m.desmontar(); }
});

test("★★★ B4: el acierto es ✓ y borde blanco; teal y ámbar solo en «Debe» y «Haber»; seguir en blanco neutro", async () => {
  const s = D.SERIE_H8_1;
  const n = nota(s, 6);
  const m = montarJuego({ items: etapa2(s, 6) });
  try {
    await asentar(m, n);
    await esperar(500);
    const raiz = q(m, "[data-t4-h8]");
    const tonos = [...new Set(conColor(raiz, TEAL_AMBAR).filter((e) => !e.closest("[data-avance]")).map((e) => e.textContent.trim()))].filter(Boolean).sort();
    assert.deepEqual(tonos, ["Debe", "Haber"]);
    assert.deepEqual(conColor(q(m, "[data-figura]"), CORAL), []);
    for (const k of [`${n.debe}:debe`, `${n.haber}:haber`]) assert.equal(w.getComputedStyle(destino(m, k)).borderTopColor, "rgb(248, 249, 250)");
    assert.equal(w.getComputedStyle(siguiente(m)).backgroundColor, "rgb(248, 249, 250)");
  } finally { m.desmontar(); }
  const imports = leer("src/components/t4/SeAsientaONo.jsx").split("\n").filter((l) => /^import /.test(l)).join("\n");
  assert.doesNotMatch(imports, /\b(Opcion|Opciones|ConstructorAsiento|Responder|CuentaDeValor)\b/);
});

test("★★ en modo demo: sin Encabezado ni Pulsos, solo la etapa 1; la mano toca «No se asienta»; sin seguir y sin reportar", async () => {
  const m = montarJuego({ items: D.EJEMPLO_H8, modoDemo: true });
  try {
    assert.ok(q(m, "[data-t4-h8-demo]"));
    assert.equal(q(m, "[data-encabezado]"), null);
    await tocar(destino(m, D.NO_SE_ASIENTA));
    assert.equal(visible(q(m, "[data-devolucion]")), `Correcto. ${D.EJEMPLO_H8.partidas[0].aciertoEtapa1}`);
    assert.equal(siguiente(m), null);
    assert.equal(m.completados.length, 0);
  } finally { m.desmontar(); }
});

/* ═══════════ 4 · CAMINO, CATÁLOGO, PANEL Y «ASÍ SE JUEGA» ═══════════ */

test("★★★ en T4, la última: evaluativa, experto, 90 FP; la vista la abre con el componente nuevo", () => {
  assert.deepEqual(clasificacionDe("contabilidad", TEMA_T4, D.H8_ID), { tipo: HACER, modalidad: "evaluativa", dificultad: "experto", fpBase: 90 });
  assert.equal(TEMA.actividades.at(-1).id, D.H8_ID);
  assert.equal(JUEGOS_T4.find((j) => j.id === D.H8_ID).Mecanica, SeAsientaONo);
});

test("★★★ la 0207 (ya corrió en producción) no cambia y es la única que nombra la actividad", () => {
  const dir = new URL("supabase/migrations/", RAIZ);
  assert.deepEqual(readdirSync(dir).filter((f) => readFileSync(new URL(f, dir), "utf8").includes(D.H8_ID)), ["0207_t4_se_asienta_o_no.sql"]);
  assert.match(leer("supabase/migrations/0207_t4_se_asienta_o_no.sql"), /\('t4-se-asienta-o-no',\s*'contabilidad',\s*'efectivo-caja-menor-bancos',\s*'evaluativa',\s*'experto',\s*90,\s*1\)/);
});

test("★★★ el panel docente lee cada item_id que guarda la partida: partida, asiento o saldo", () => {
  for (const s of D.SERIES_H8) {
    for (const p of s.partidas) assert.equal(etiquetaDeItem(D.H8_ID, p.id), recortar(p.texto));
    for (const n of s.notas) assert.equal(etiquetaDeItem(D.H8_ID, n.idAsiento), recortar(n.texto));
  }
  assert.equal(etiquetaDeItem(D.H8_ID, "saldo-mayor"), D.ROTULOS_H8.campo);
});

test("★★★ «Así se juega»: pasos, ejemplo y texto alternativo del paquete; la mano TOCA «No se asienta»", () => {
  const asi = ASI_SE_JUEGA[D.H8_ID];
  assert.equal(asi.consigna, D.H8.consigna);
  for (const p of D.PASOS_H8) assert.ok(PAQ.includes(`| ${p} |`), p);
  assert.ok(PAQ.includes(`| ${D.EJEMPLO_H8.partidas[0].texto} |`));
  assert.ok(PAQ.includes(`| Correcto. ${D.EJEMPLO_H8.partidas[0].aciertoEtapa1} |`));
  assert.ok(PAQ.includes(`| ${D.ALT_H8} |`));
  assert.deepEqual(asi.guion.toques.map((t) => t.en), ['[data-destino="no-se-asienta"]']);
});

test("★★★ en la página del juego hay exactamente UN [data-t4-h8]: la partida; la demo lleva el suyo", async () => {
  try { w.localStorage.clear(); } catch { /* sin almacenamiento */ }
  const m = montar(h(AuthContext.Provider, { value: { usuario: null, pedirCuenta: () => {} } }, h(ContabilidadT4View, { modo: HACER, nodoInicial: D.H8_ID, onBack: () => {} })));
  await esperar(0);
  try {
    assert.equal(m.caja.querySelectorAll("[data-t4-h8]").length, 1);
    assert.equal(m.caja.querySelectorAll("[data-t4-h8-demo]").length, 1);
  } finally { m.desmontar(); }
});
