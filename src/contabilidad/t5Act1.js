import { segundoFalloDe } from "./b5SegundoFallo.js";
import {
  T5_ACT1, FICHAS_T5_ACT1, ERROR_T5_ACT1, VARIABLE, FIJA, INTERES, DESCUENTO, NOMBRE, PESO_RENTA, PESO_TIPO,
} from "../data/contabilidadT5Act1.js";

/*
 * ═══════════════════════════════════════════════════════════════════════════
 * TEMA 5 · HACER 1 — «¿Qué renta da este título?»: sorteo, evaluación y
 * puntaje. El patrón es el de T1-6 (contabilidad/tema1.js), replicado aquí
 * para no tocar el de T1.
 * ═══════════════════════════════════════════════════════════════════════════
 */

/* Los tres grupos de la tanda (guía §4). */
export const GRUPOS_T5_ACT1 = [
  { renta: VARIABLE, tipo: null },
  { renta: FIJA, tipo: INTERES },
  { renta: FIJA, tipo: DESCUENTO },
];
const delGrupo = (g) => FICHAS_T5_ACT1.filter((f) => f.renta === g.renta && f.tipo === g.tipo);

/*
 * Nueve fichas: tres por grupo, mezcladas, con como mucho una ficha de nombre
 * por grupo. «Con interés» y «Con descuento» solo tienen dos fichas que no son
 * de nombre, así que llevan siempre exactamente una de nombre; en renta
 * variable puede haber una o ninguna.
 */
export function sortearT5Act1(barajar, porGrupo = T5_ACT1.porPartida / GRUPOS_T5_ACT1.length) {
  const elegidas = [];
  for (const g of GRUPOS_T5_ACT1) {
    const fichas = delGrupo(g);
    const nombre = barajar(fichas.filter((f) => f.clase === NOMBRE)).slice(0, 1);
    const resto = fichas.filter((f) => f.clase !== NOMBRE);
    /* Primero se decide la de nombre (si va), después el resto sin nombres. */
    const candidatas = barajar([...nombre, ...resto]);
    const grupo = candidatas.slice(0, porGrupo);
    if (grupo.length < porGrupo) throw new Error(`no hay fichas suficientes para «${g.renta}${g.tipo ? `/${g.tipo}` : ""}»`);
    elegidas.push(...grupo);
  }
  return barajar(elegidas);
}

/**
 * `marcado` es { renta, tipo }. El tipo va a null con «Renta variable».
 * `intento` es 1 o 2. En el segundo fallo manda la regla única de la célula:
 * el acierto de la ficha, con «No es esa.» delante, en TODAS las fichas.
 */
export function evaluarT5Act1(ficha, marcado, intento = 1) {
  const rentaOk = marcado.renta === ficha.renta;
  const pideTipo = ficha.renta === FIJA;
  const tipoOk = pideTipo ? marcado.tipo === ficha.tipo : true;
  const ok = rentaOk && tipoOk;

  if (ok) return { ok, texto: ficha.acierto, patron: null, rentaOk, tipoOk };

  /* Regla única del segundo fallo (b5SegundoFallo.js): el acierto, con «No es esa.» delante. */
  if (intento === 2) return { ok, texto: segundoFalloDe(ficha.acierto), patron: "segundo", rentaOk, tipoOk };

  if (ficha.clase === NOMBRE) {
    if (!rentaOk) return { ok, texto: ficha.falloNivel1, patron: "nivel1", rentaOk, tipoOk: false };
    return { ok, texto: ficha.falloNivel2, patron: "nivel2", rentaOk, tipoOk: false };
  }

  if (!rentaOk) {
    /* A: era de renta fija y la puso en variable. B: al revés. */
    const patron = ficha.renta === FIJA ? "A" : "B";
    return { ok, texto: ERROR_T5_ACT1[patron], patron, rentaOk, tipoOk: false };
  }
  return { ok, texto: ERROR_T5_ACT1.C, patron: "C", rentaOk, tipoOk: false };
}

/*
 * La renta pesa 60 y el tipo 40. Las de renta variable no tienen tipo que
 * acertar: valen entero al acertar la renta (guía, resumen).
 */
export function valorDeItemT5Act1(ficha, r) {
  if (!r.rentaOk) return 0;
  if (ficha.renta === VARIABLE) return 1;
  return PESO_RENTA + (r.tipoOk ? PESO_TIPO : 0);
}

/* Para el panel docente: el ítem es la ficha, y se lee por su texto. */
export const fichaDeItemT5Act1 = (id) => FICHAS_T5_ACT1.find((f) => f.id === id)?.texto ?? null;

export function puntuarT5Act1(respuestas, cuantas) {
  if (!cuantas) return 0;
  return (respuestas.reduce((s, x) => s + x.valor, 0) / cuantas) * 100;
}
