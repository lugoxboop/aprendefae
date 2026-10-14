import { segundoFalloDe } from "./b5SegundoFallo.js";
import {
  FICHAS_T6_ACT1, ERROR_T6_ACT1, OTRA, CLIENTES, ACREDITA, PESO_CUENTA, PESO_LADO,
} from "../data/contabilidadT6Act1.js";

/*
 * ═══════════════════════════════════════════════════════════════════════════
 * TEMA 6 · HACER 1 — «¿Clientes o otra cuenta por cobrar?»: sorteo,
 * evaluación y puntaje. El patrón es el de b5-t5-a1 (contabilidad/t5Act1.js).
 * ═══════════════════════════════════════════════════════════════════════════
 */

/* La tanda es el banco entero, barajado (Futaba). */
export function sortearT6Act1(barajar) {
  return barajar([...FICHAS_T6_ACT1]);
}

/**
 * `marcado` es { cuenta, lado }. El lado va a null con «Otra cuenta por
 * cobrar». `intento` es 1 o 2. En el segundo fallo manda la regla única de la
 * célula: el acierto de la ficha, con «No es esa.» delante, en TODAS las fichas.
 */
export function evaluarT6Act1(ficha, marcado, intento = 1) {
  const cuentaOk = marcado.cuenta === ficha.cuenta;
  const pideLado = ficha.cuenta === CLIENTES;
  const ladoOk = pideLado ? marcado.lado === ficha.lado : true;
  const ok = cuentaOk && ladoOk;

  if (ok) return { ok, texto: ficha.acierto, patron: null, cuentaOk, ladoOk };

  /* Regla única del segundo fallo (b5SegundoFallo.js). */
  if (intento === 2) return { ok, texto: segundoFalloDe(ficha.acierto), patron: "segundo", cuentaOk, ladoOk };

  if (!cuentaOk) {
    /* A: era de Clientes y la puso en otra. B: era un préstamo y la puso en Clientes. */
    const patron = ficha.cuenta === CLIENTES ? "A" : "B";
    return { ok, texto: ERROR_T6_ACT1[patron], patron, cuentaOk, ladoOk: false };
  }
  /* C5 antes que C: una venta a crédito puesta en «Se acredita». */
  const patron = ficha.c5 && marcado.lado === ACREDITA ? "C5" : "C";
  return { ok, texto: ERROR_T6_ACT1[patron], patron, cuentaOk, ladoOk: false };
}

/*
 * La cuenta pesa 60 y el lado 40. Las de otra cuenta por cobrar no tienen
 * lado que acertar: valen entero al acertar la cuenta (Futaba, resumen).
 */
export function valorDeItemT6Act1(ficha, r) {
  if (!r.cuentaOk) return 0;
  if (ficha.cuenta === OTRA) return 1;
  return PESO_CUENTA + (r.ladoOk ? PESO_LADO : 0);
}

/* Para el panel docente: el ítem es la ficha, y se lee por su texto. */
export const fichaDeItemT6Act1 = (id) => FICHAS_T6_ACT1.find((f) => f.id === id)?.texto ?? null;

export function puntuarT6Act1(respuestas, cuantas) {
  if (!cuantas) return 0;
  return (respuestas.reduce((s, x) => s + x.valor, 0) / cuantas) * 100;
}
