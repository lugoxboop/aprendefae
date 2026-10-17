import { test } from "node:test";
import assert from "node:assert/strict";
import { montar, conReloj, responder, textoMensaje, medidasCss, leer, cadaOpcion, BOTONES_C4 } from "./c4T71Prueba.mjs";

/*
 * ═══════════════════════════════════════════════════════════════════════════
 * T7-1 · H5 «¿Costo o gasto?» en el patrón de enganche C4 (motor
 * decisionC4.jsx; Watari, sección t71-h5). La pieza montada, contra los datos
 * de Near (contabilidadT7_1_h5.js, con la corrección 4; las cifras y los
 * paquetes los sigue comprobando t7-1-costo-o-gasto.test.mjs):
 *   · los ítems C4 son los de Near, en los dos sentidos: el par fijo de la
 *     parte 1 (ítem 1 con acierto y error; 2 a 4, su porqué en los dos casos),
 *     la cuenta del flete y las tres cifras, que se escriben
 *   · en pantalla: objetivo, consigna, caso, ficha y pie
 *   · la etiqueta del costo se arma: lo tocado entra a su sitio y los ítems
 *     ya pasados se quedan en el suyo; el flete se parte con cada número; la
 *     deuda se compara con la factura; cada opción pinta lo suyo
 *   · un intento, «Iba aquí» en el sitio correcto, foco, puntaje y detalle
 *     del primer intento, su etiqueta; catálogo y vista
 * ═══════════════════════════════════════════════════════════════════════════
 */

const D = await import("../../data/contabilidadT7_1_h5.js");
const { CONSECUENCIA_C4, W_H5 } = await import("../c4/t71h5_c4.js");
const { default: H5C4 } = await import("../../components/mecanicas/libros/t7/CostoOGastoC4.jsx");
const { JUEGOS_T7_1, TEMA_T7_1 } = await import("../../components/ContabilidadT7_1View.jsx");
const { etiquetaDeItem, recortar } = await import("../../docente/etiquetasItem.js");
const { HACER, clasificacionDe } = await import("../../data/subjects.js");
const { sinUnSoloIntento } = await import("../armaLaLinea.js");
const { pesos } = await import("../../data/contabilidad.js");
const { unidadDeH5 } = await import("../t7H5.js");

const ITEMS = CONSECUENCIA_C4.items;
const C = D.CIFRAS_H5;
const valor = (I, o) => (I.tipo === "cifra" ? o.v : o.id);

test("★★★ los ítems C4 son los de Near, letra por letra y en los dos sentidos", () => {
  assert.deepEqual(ITEMS.map((I) => I.id), D.ITEMS_H5.map((it) => it.id));
  for (const it of D.ITEMS_H5) {
    const I = ITEMS.find((x) => x.id === it.id);
    assert.equal(I.subtema, it.subtema);
    if (it.parte === 1) {
      assert.deepEqual([I.texto, I.pregunta, I.bien], [it.pregunta, null, it.acierto ?? it.porque]);
      assert.deepEqual(I.opciones.map((o) => [o.id, o.t]), D.COSTO_O_GASTO.map((o) => [o.valor, o.texto]), "el par fijo");
      assert.equal(I.opciones.find((o) => !o.correcta).msg, it.error ?? it.porque);
      assert.equal(I.opciones.find((o) => o.correcta).id, it.correcta);
      continue;
    }
    assert.deepEqual([I.texto, I.pregunta, I.bien], [null, it.pregunta, it.acierto]);
    assert.equal(I.tipo ?? "eleccion", typeof it.correcta === "string" ? "eleccion" : "cifra");
    assert.deepEqual(I.opciones.map((o) => valor(I, o)).sort(), [it.correcta, ...it.distractores.map((d) => d.valor)].sort());
    assert.equal(valor(I, I.opciones.find((o) => o.correcta)), it.correcta);
    for (const d of it.distractores) assert.equal(I.opciones.find((o) => valor(I, o) === d.valor).msg, d.retro);
    for (const o of I.opciones) assert.equal(o.t, I.tipo === "cifra" ? pesos(o.v) : D.CUENTAS_H5.find((c) => c.valor === o.id).texto);
  }
  const near = new Set([...D.ITEMS_H5.flatMap((it) => [it.subtema, it.pregunta, it.acierto, it.error, it.porque, ...(it.distractores ?? []).map((d) => d.retro)]), ...D.COSTO_O_GASTO.map((o) => o.texto), ...D.CUENTAS_H5.map((o) => o.texto)]);
  for (const I of ITEMS) for (const t of [I.subtema, I.texto, I.pregunta, I.bien, ...I.opciones.flatMap((o) => [o.msg, I.tipo === "cifra" ? null : o.t])].filter(Boolean)) assert.ok(near.has(t), `«${t}» no es de Near`);
});

test("★★★ en pantalla: objetivo, consigna, el caso y la ficha de Near, el pie y el primer gasto", conReloj(async () => {
  const m = await montar(H5C4, { titulo: D.H5.nombre });
  try {
    assert.equal(m.q("[data-consigna]").textContent, sinUnSoloIntento(D.H5.consigna));
    assert.deepEqual(m.qq("[data-enunciado] p").map((p) => p.textContent), D.H5.caso);
    assert.deepEqual(m.qq("[data-ficha] dd").map((x) => x.textContent), D.FICHA_H5.map(([, b]) => b));
    assert.equal(m.q("[data-pie]").textContent, D.H5.pie);
    assert.equal(m.q("[data-texto]").textContent, D.ITEMS_H5[0].pregunta);
    assert.deepEqual(m.qq(".c4-ops [data-op]").map((b) => b.textContent), D.COSTO_O_GASTO.map((o) => o.texto));
    assert.deepEqual(m.qq("[data-bandeja]").map((b) => b.dataset.bandeja), ["costo", "gasto"]);
  } finally { await m.desmontar(); }
}));

test("★★★ C4: cada opción pinta su consecuencia antes del veredicto, y la mala trae su falla (20 opciones)", conReloj(async () => {
  await cadaOpcion(H5C4, ITEMS, (m, I, o) => {
    const est = CONSECUENCIA_C4.consecuencia(I, valor(I, o));
    assert.equal(m.falla(), est.falla ?? null);
    assert.equal(Boolean(est.falla), !o.correcta);
    if (est.ficha) assert.equal(m.q("[data-ficha-c4]").closest("[data-bandeja]").dataset.bandeja, est.ficha.destino);
    assert.equal(m.q("[data-cuadra]")?.textContent ?? null, est.cuadra ?? null);
  });
}));

test("★★★ Mello C4-1: la cifra escrita va a su renglón sin calificar; la consecuencia, al comprobar", conReloj(async () => {
  const [ret, pago, deuda] = ["retencion-flete", "pago-transportadora", "debe-proveedor"].map((id) => ITEMS.find((I) => I.id === id));
  const m = await montar(H5C4, { items: [ret, pago, deuda] });
  try {
    await m.escribir("3000");
    assert.equal(m.q("[data-retencion]").textContent, W_H5.retencionSola(3000));
    assert.equal(m.q("[data-pago]").textContent, W_H5.pago(null));
    assert.doesNotMatch(m.q("[data-figura]").innerHTML, /c4-cuadra|c4-falla| mal/);
    assert.doesNotMatch(m.q("[data-flete-partido]").textContent, /%/, "el porcentaje califica: espera a «Comprobar»");
    await m.clic(m.q('[data-accion="comprobar"]'));
    assert.equal(m.q("[data-retencion]").textContent, W_H5.retencion(3000));
    await m.pasar(380);
    await m.clic(m.boton(BOTONES_C4.siguiente));
    await m.escribir("303000");
    assert.equal(m.q("[data-pago]").textContent, W_H5.pago(303000));
    assert.equal(m.q("[data-retencion]").textContent, W_H5.retencion(null));
    await m.clic(m.q('[data-accion="comprobar"]'));
    await m.pasar(380);
    assert.equal(m.falla(), W_H5.fallaPagoDeMas);
    await m.clic(m.boton(BOTONES_C4.siguiente));
    await m.escribir(String(C.debeProveedor));
    assert.equal(m.q("[data-tuya]").textContent, W_H5.tuCifra(C.debeProveedor));
    assert.ok(m.q("[data-cuadra]") == null);
  } finally { await m.desmontar(); }
}));

test("★★★ C4: lo que pinta cada opción de Near, una por una", () => {
  const de = (id) => { const I = ITEMS.find((x) => x.id === id); return Object.fromEntries(I.opciones.map((o) => [o.id, CONSECUENCIA_C4.consecuencia(I, valor(I, o))])); };
  assert.deepEqual(Object.values(de("flete-vendedor")).map((e) => [e.ficha.destino, e.falla ?? null]), [["costo", W_H5.fallaCosto], ["gasto", null]]);
  assert.deepEqual(Object.values(de("bodegaje")).map((e) => [e.ficha.destino, e.falla ?? null]), [["costo", null], ["gasto", W_H5.fallaGasto]]);
  const flete = de("cuenta-flete");
  assert.deepEqual([flete["compras-fletes"].ficha.destino, flete["gasto-venta-fletes"].falla, flete.inventario.falla], ["costo", W_H5.fallaGasto, W_H5.fallaInventario]);
  /* Los cuatro de la parte 1 quedan en su sitio cuando llega el flete. */
  assert.deepEqual(flete.inventario.previos.map((p) => [p.id, p.destino]), [["bodegaje", "costo"], ["factura-exterior", "costo"], ["flete-comprador", "costo"], ["flete-vendedor", "gasto"]]);
  const ret = de("retencion-flete");
  assert.deepEqual([ret["3000"].cuadra, ret["10500"].falla, ret["48000"].falla], [W_H5.cuadraRet, W_H5.fallaRet(10500), W_H5.fallaRet(48000)]);
  assert.equal(W_H5.fallaRet(10500), "Esa retención es el 3,5 % del flete; la del transporte es del 1 %.");
  const pago = de("pago-transportadora");
  assert.deepEqual([pago["297000"].cuadra, pago["303000"].falla, pago["300000"].falla], [W_H5.cuadraRet, W_H5.fallaPagoDeMas, W_H5.fallaRet(0)]);
  /* Mello C4-3: la frase literal de la auditoría, y ningún monto negativo en la figura. */
  assert.equal(pago["303000"].falla, "Así la retención se sumaría al pago en vez de restarse.");
  assert.equal(pago["303000"].retencion, W_H5.retencion(null));
  assert.doesNotMatch(JSON.stringify(Object.values(pago)), /−|-\$|-\d/);
  const deuda = de("debe-proveedor");
  assert.deepEqual([deuda[String(C.debeProveedor)].cuadra, deuda[String(C.mercancia + C.iva)].falla, deuda[String(C.debeProveedor + C.flete)].falla], [W_H5.cuadraDeuda, W_H5.difDeuda(C.retencion), W_H5.difDeuda(C.flete)]);
});

test("★★★ la tanda: la etiqueta se arma, un intento, «Iba aquí» en su sitio, la línea de Near; foco; puntaje y detalle del primer intento", conReloj(async () => {
  const m = await montar(H5C4);
  const esperado = [];
  try {
    for (const [k, I] of ITEMS.entries()) {
      const it = D.ITEMS_H5[k];
      /* Lo ya resuelto se queda en su sitio. */
      const previos = m.qq("[data-previo]").map((li) => [li.dataset.previo, li.closest("[data-bandeja]").dataset.bandeja]);
      assert.deepEqual(previos, I.parte === 1 || I.id === "cuenta-flete" ? D.ITEMS_H5.slice(0, k).filter((x) => x.parte === 1).map((x) => [x.id, x.correcta]) : []);
      const o = k % 3 === 0 ? I.opciones.find((x) => !x.correcta) : I.opciones.find((x) => x.correcta);
      await responder(m, I, o);
      if (o.correcta) assert.equal(textoMensaje(m), it.acierto ?? it.porque);
      else {
        assert.equal(textoMensaje(m), it.parte === 1 ? it.error ?? it.porque : it.distractores.find((d) => d.valor === valor(I, o)).retro);
        if (m.q("[data-ficha-iba]")) assert.equal(m.q("[data-ficha-iba]").closest("[data-bandeja]").dataset.bandeja, it.parte === 1 ? it.correcta : "costo");
        else assert.match(m.q('[data-escrito="iba"]').textContent, new RegExp(`Iba aquí: \\${pesos(it.correcta)}`));
      }
      esperado.push([I.id, Boolean(o.correcta), o.correcta ? null : valor(I, o)]);
      const ultimo = k === ITEMS.length - 1;
      await m.clic(m.boton(ultimo ? BOTONES_C4.verResumen : BOTONES_C4.siguiente));
      if (!ultimo) assert.ok(document.activeElement === (m.q("[data-texto]").hidden ? m.q("[data-pregunta]") : m.q("[data-texto]")), "el foco no fue al ítem nuevo");
    }
    assert.equal(m.fin[0][0], (5 / 8) * 100);
    assert.deepEqual(m.fin[0][2].map((d) => [d.item, d.ok, d.respuesta]), esperado);
    assert.equal(m.q("[data-resumen]").textContent, D.resumenH5(5, 8));
    for (const d of m.fin[0][2]) assert.equal(etiquetaDeItem(D.H5_ID, d.item), recortar(unidadDeH5(d.item)));
  } finally { await m.desmontar(); }
}));

test("★★★ catálogo y vista: el mismo id y la misma clasificación; la vista abre CostoOGastoC4", () => {
  assert.deepEqual(clasificacionDe("contabilidad", TEMA_T7_1, D.H5_ID), { tipo: HACER, modalidad: "evaluativa", dificultad: "medio", fpBase: 25 });
  assert.equal(JUEGOS_T7_1.find((j) => j.id === D.H5_ID).Mecanica, H5C4);
});

test("★★ medidas: letra de 12 px o más; sin teal ni ámbar", () => {
  medidasCss(leer("src/components/mecanicas/libros/t7/CostoOGastoC4.jsx") + leer("src/components/mecanicas/libros/t7/c4T71.jsx"));
});
