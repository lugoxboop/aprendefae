import { test } from "node:test";
import assert from "node:assert/strict";

/*
 * ═══════════════════════════════════════════════════════════════════════════
 * LOTE 6d-TEXTOS · LOS MENSAJES DE HACER DE LA CÉLULA B NOMBRAN EL ERROR
 * PROBABLE (Futaba, entregas del 16-oct).
 *
 *   · ningún texto de los datos de Hacer de B empieza a corregir con «Revisa»;
 *   · los aciertos de las fichas (b5-t5-a1, b5-t6-a1) no abren con «Sí. », y
 *     el segundo fallo los muestra tal cual;
 *   · las B específicas nuevas de b5-t5-a2 se activan con su valor exacto;
 *   · la cabeza de la C, la A y la B de la mesa nombra las cuentas del
 *     estudiante, con «Debe»/«Haber» en mayúscula y «e» ante el sonido i.
 * ═══════════════════════════════════════════════════════════════════════════
 */

const T5A1 = await import("../../data/contabilidadT5Act1.js");
const T6A1 = await import("../../data/contabilidadT6Act1.js");
const T5A2 = await import("../../data/contabilidadT5Act2.js");
const T6A2 = await import("../../data/contabilidadT6Act2.js");
const T6A3 = await import("../../data/contabilidadT6Act3.js");
const T6A6 = await import("../../data/contabilidadT6Act6.js");
const { segundoFalloDe } = await import("../b5SegundoFallo.js");
const { evaluarParteT5Act2 } = await import("../t5Act2.js");
const { evaluarParte } = await import("../cierreConMesa.js");

const { CAJA, INVERSIONES, INTERESES, GANANCIA, PARTES_T5_ACT2 } = T5A2;
const al = (cuenta, lado, valor) => ({ cuenta, lado, valor });

/* Todo texto de un módulo de datos, recorrido entero (las funciones no son texto). */
const textosDe = (m) => {
  const out = [];
  const recoger = (v) => {
    if (typeof v === "string") out.push(v);
    else if (Array.isArray(v)) v.forEach(recoger);
    else if (v && typeof v === "object") Object.values(v).forEach(recoger);
  };
  recoger(Object.values(m));
  return out;
};

test("★★★ ningún texto de los datos de Hacer de B dice «Revisa»", () => {
  for (const [nombre, m] of Object.entries({ T5A1, T6A1, T5A2, T6A2, T6A3, T6A6 })) {
    const textos = textosDe(m);
    assert.ok(textos.length > 10, `${nombre}: se recorrieron ${textos.length} textos`);
    assert.deepEqual(textos.filter((t) => /\bRevisa\b/.test(t)), [], nombre);
  }
});

test("★★★ ningún acierto de las fichas abre con «Sí. », y el segundo fallo lo muestra tal cual", () => {
  const fichas = [...T5A1.FICHAS_T5_ACT1, ...T6A1.FICHAS_T6_ACT1];
  assert.equal(fichas.length, 23, "14 + 9 fichas");
  for (const f of fichas) {
    assert.ok(!f.acierto.startsWith("Sí. "), `${f.id}: «${f.acierto.slice(0, 20)}»`);
    assert.ok(!/Vas bien:|No es esa\./.test(f.acierto), f.id);
    assert.equal(segundoFalloDe(f.acierto), f.acierto, `${f.id}: el segundo fallo no añade ni quita nada`);
  }
  /* Un acierto que vuelva a abrir con «Sí. » falla en voz alta: contradiría la pastilla «Iba aquí». */
  assert.throws(() => segundoFalloDe("Sí. Es renta variable."));
  assert.throws(() => segundoFalloDe(""));
});

test("★★★ T5 A2: las B específicas nuevas se activan con su valor exacto, y otro valor da la B general", () => {
  const [p1, , p3] = PARTES_T5_ACT2;
  const interes = (parte, valor) => evaluarParteT5Act2(parte, [al(CAJA, "debe", valor), al(INTERESES, "haber", valor)]);
  const casos = [
    [p1, 480000, "B-anual", "Pusiste el interés de todo el año. Aquí llega solo el de un trimestre: tres de los doce meses."],
    [p1, 40000, "B-mes", "Pusiste el interés de un solo mes. Aquí llega el de un trimestre: tres meses."],
    [p3, 120000, "B-sin-vender", "Calculaste sobre $2.000.000, pero ya vendió el 75 %. El interés de noviembre es sobre los $500.000 que quedan."],
    [p1, 360000, "B", "Ese no es el interés de un trimestre sobre $2.000.000 al 24 % al año. Haz la cuenta por tres meses."],
    [p3, 40000, "B", "Ese no es el interés de un trimestre sobre los $500.000 que quedan. Haz la cuenta por tres meses."],
  ];
  for (const [parte, valor, clave, texto] of casos) {
    const r = interes(parte, valor);
    assert.deepEqual([r.ok, r.error, r.texto, r.deValor], [false, clave, texto, true], `${parte.id} con ${valor}`);
  }
  /* Basta con que una de las dos cuentas lleve el valor exacto. */
  assert.equal(evaluarParteT5Act2(p1, [al(CAJA, "debe", 120000), al(INTERESES, "haber", 480000)]).error, "B-anual");
  /* Las C7 de las ventas siguen en pie detrás de las específicas de los datos. */
  const p2 = PARTES_T5_ACT2[1];
  assert.equal(evaluarParteT5Act2(p2, p2.asiento.map((e) => (e.cuenta === INVERSIONES ? { ...e, valor: 1725000 } : e))).error, "C7");
});

test("★★★ la cabeza de la C y de la A nombra las cuentas que puso el estudiante; la de la B dice «No cuadra»", () => {
  const [p1, p2] = PARTES_T5_ACT2;
  const C1 = "El interés entra a Caja, que sube. Y es un ingreso, que sube por el Haber.";
  /* C: una al revés, el lado donde la puso, con mayúscula. */
  assert.equal(evaluarParteT5Act2(p1, [al(CAJA, "haber", 120000), al(INTERESES, "haber", 120000)]).texto, `Pusiste Caja en el Haber. ${C1}`);
  assert.equal(evaluarParteT5Act2(p1, [al(CAJA, "debe", 120000), al(INTERESES, "debe", 120000)]).texto, `Pusiste Ingresos por intereses en el Debe. ${C1}`);
  /* C: dos al revés, «en el lado contrario», en el orden del asiento. */
  assert.equal(evaluarParteT5Act2(p1, [al(INTERESES, "debe", 120000), al(CAJA, "haber", 120000)]).texto, `Pusiste Caja e Ingresos por intereses en el lado contrario. ${C1}`);
  /* A: la que falta, o las que faltan, con «e» ante el sonido i. */
  const A2 = "Inversiones – títulos baja por lo que costaron. Lo que recibió de más va a la ganancia.";
  assert.equal(evaluarParteT5Act2(p2, [al(CAJA, "debe", 1725000), al(INVERSIONES, "haber", 1500000)]).texto, `Falta ${GANANCIA}. ${A2}`);
  assert.equal(evaluarParteT5Act2(p2, [al(CAJA, "debe", 1725000)]).texto, `Faltan ${INVERSIONES} e ${GANANCIA}. ${A2}`);
  /* B que nombra la cuenta (E3): «No cuadra el valor de…». */
  const conCaja = p2.asiento.map((e) => (e.cuenta === CAJA ? { ...e, valor: 1500000 } : e));
  assert.equal(evaluarParteT5Act2(p2, conCaja).texto, "No cuadra el valor de Caja. A Caja entra lo que le pagaron por la venta, no lo que costaron los títulos.");
  /* La mesa genérica (Tema 6) arma igual sus cabezas. */
  const [castigo] = T6A2.PARTES_T6_ACT2;
  const [prov, clientes] = castigo.asiento.map((e) => e.cuenta);
  assert.equal(evaluarParte(castigo, [al(prov, "debe", 180000)]).texto, `Falta ${clientes}. El castigo mueve la provisión y la deuda de Pablo Moncayo.`);
});
