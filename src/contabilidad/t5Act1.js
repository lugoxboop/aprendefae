import { segundoFalloDe } from "./b5SegundoFallo.js";
import { repartirTanda } from "./b5Reparto.js";
import {
  T5_ACT1, FICHAS_T5_ACT1, FIJA, NOMBRE, CAJONES_T5_ACT1,
} from "../data/contabilidadT5Act1.js";

/*
 * ═══════════════════════════════════════════════════════════════════════════
 * TEMA 5 · HACER 1 — «¿Qué renta da este título?»: sorteo, evaluación y
 * puntaje. El patrón es el de T1-6 (contabilidad/tema1.js), replicado aquí
 * para no tocar el de T1.
 * ═══════════════════════════════════════════════════════════════════════════
 */

/* Los tres grupos de la tanda: uno por cajón. */
export const GRUPOS_T5_ACT1 = CAJONES_T5_ACT1.map(({ renta, tipo }) => ({ renta, tipo }));
const delGrupo = (g) => FICHAS_T5_ACT1.filter((f) => f.renta === g.renta && f.tipo === g.tipo);

/*
 * Nueve fichas, entre 2 y 4 por cajón (R10, hoja de fusiones de Mai: con tres por cajón, la cuenta del
 * estante delataba la última). El banco da 4 · 5 · 5. Dentro de cada cajón manda la regla de la guía
 * (§4): como mucho una ficha de nombre. Solo cuando el cajón lleva más fichas de las que hay sin nombre
 * más una (4 en «con interés» o «con descuento», que tienen dos sin nombre) entra una segunda de nombre.
 */
export function sortearT5Act1(barajar, total = T5_ACT1.porPartida) {
  const elegir = (banco, n) => {
    const nombres = barajar(banco.filter((f) => f.clase === NOMBRE));
    const resto = banco.filter((f) => f.clase !== NOMBRE);
    const primero = barajar([...nombres.slice(0, 1), ...resto]).slice(0, n);
    return [...primero, ...nombres.slice(1, 1 + n - primero.length)];
  };
  return repartirTanda(GRUPOS_T5_ACT1.map(delGrupo), total, barajar, elegir);
}

/**
 * `marcado` es { renta, tipo }. El tipo va a null con «Renta variable».
 * `intento` es 1 o 2. Al primer fallo, la PISTA de la ficha (la escalera de
 * ayuda de la célula, tema6/escaleraB5.js): la misma con cualquier cajón, sin
 * emoji. En el segundo fallo manda la regla única de la célula: el acierto de
 * la ficha, con «No es esa.» delante, en TODAS las fichas.
 */
export function evaluarT5Act1(ficha, marcado, intento = 1) {
  const rentaOk = marcado.renta === ficha.renta;
  const pideTipo = ficha.renta === FIJA;
  const tipoOk = pideTipo ? marcado.tipo === ficha.tipo : true;
  const ok = rentaOk && tipoOk;

  if (ok) return { ok, texto: ficha.acierto, patron: null, rentaOk, tipoOk };

  /* Regla única del segundo fallo (b5SegundoFallo.js): el acierto, con «No es esa.» delante. */
  if (intento === 2) return { ok, texto: segundoFalloDe(ficha.acierto), patron: "segundo", rentaOk, tipoOk };

  return { ok, texto: ficha.pista, patron: "pista", rentaOk, tipoOk };
}

/* Cada ficha vale entera al acertar (lote 6a: ya no hay dos niveles que pesar). En el segundo intento, la mitad (el componente). */
export const valorDeItemT5Act1 = (ficha, r) => (r.ok ? 1 : 0);

/* Para el panel docente: el ítem es la ficha, y se lee por su texto. */
export const fichaDeItemT5Act1 = (id) => FICHAS_T5_ACT1.find((f) => f.id === id)?.texto ?? null;

export function puntuarT5Act1(respuestas, cuantas) {
  if (!cuantas) return 0;
  return (respuestas.reduce((s, x) => s + x.valor, 0) / cuantas) * 100;
}
