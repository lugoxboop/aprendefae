import { segundoFalloDe } from "./b5SegundoFallo.js";
import { FICHAS_T6_ACT7, ERROR_T6_ACT7, DIRECTA, PROVISIONES, PESO_METODO, PESO_MOMENTO } from "../data/contabilidadT6Act7.js";

/*
 * ═══════════════════════════════════════════════════════════════════════════
 * TEMA 6 · HACER 7 — «¿Qué método y cuándo?»: sorteo, evaluación y puntaje.
 * El patrón es el de b5-t6-a1 (contabilidad/t6Act1.js).
 * ═══════════════════════════════════════════════════════════════════════════
 */

/* La tanda es el banco entero, barajado (Futaba). */
export function sortearT6Act7(barajar) {
  return barajar([...FICHAS_T6_ACT7]);
}

/**
 * `marcado` es { metodo, momento }. El momento va a null con «Anulación
 * directa». `intento` es 1 o 2. En el segundo fallo manda la regla única de la
 * célula: el acierto de la ficha, con «No es esa.» delante.
 */
export function evaluarT6Act7(ficha, marcado, intento = 1) {
  const metodoOk = marcado.metodo === ficha.metodo;
  const pideMomento = ficha.metodo === PROVISIONES;
  const momentoOk = pideMomento ? marcado.momento === ficha.momento : true;
  const ok = metodoOk && momentoOk;

  if (ok) return { ok, texto: ficha.acierto, patron: null, metodoOk, momentoOk };

  /* Regla única del segundo fallo (b5SegundoFallo.js). */
  if (intento === 2) return { ok, texto: segundoFalloDe(ficha.acierto), patron: "segundo", metodoOk, momentoOk };

  if (!metodoOk) {
    /* A: era de anulación directa y la puso en Provisiones. B: al revés. */
    const patron = ficha.metodo === DIRECTA ? "A" : "B";
    return { ok, texto: ERROR_T6_ACT7[patron], patron, metodoOk, momentoOk: false };
  }
  return { ok, texto: ERROR_T6_ACT7.C, patron: "C", metodoOk, momentoOk: false };
}

/*
 * El método pesa 60 y el momento 40. Las de anulación directa no tienen
 * momento que acertar: valen entero al acertar el método (Futaba, resumen).
 */
export function valorDeItemT6Act7(ficha, r) {
  if (!r.metodoOk) return 0;
  if (ficha.metodo === DIRECTA) return 1;
  return PESO_METODO + (r.momentoOk ? PESO_MOMENTO : 0);
}

/* Para el panel docente: el ítem es la ficha, y se lee por su texto. */
export const fichaDeItemT6Act7 = (id) => FICHAS_T6_ACT7.find((f) => f.id === id)?.texto ?? null;

export function puntuarT6Act7(respuestas, cuantas) {
  if (!cuantas) return 0;
  return (respuestas.reduce((s, x) => s + x.valor, 0) / cuantas) * 100;
}
