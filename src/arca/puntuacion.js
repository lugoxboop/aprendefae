/*
 * ═══════════════════════════════════════════════════════════════════════════
 * LA CUENTA DE "EL PROYECTO DEL ARCA".
 *
 * Vive aparte de los componentes para poder medirla sin montar la interfaz, que
 * es lo único que garantiza que el 360 sea de verdad 360 y no un número escrito
 * en un comentario.
 *
 * LA REGLA DEL KIT (general, no de esta pieza): un nodo de desafío vale sus
 * puntos base × su número de etapas, con tope en cuatro. Aquí eso da
 * experto (90) × 4 = 360, y el reparto entre etapas es el de la ficha:
 *
 *   Etapa 1 · El expediente confidencial ....... 20%  →  72
 *   Etapa 2 · Arma el iceberg de Absalón ....... 35%  → 126
 *   Etapa 3 · El momento de decisión ........... 20%  →  72
 *   Etapa 4 · La carrera contra el diluvio ..... 25%  →  90
 *                                               ────    ───
 *                                               100%    360
 *
 * CÓMO LLEGA AL MOTOR CENTRAL. El motor no sabe de etapas más allá de cuántas
 * son: recibe un solo porcentaje de aciertos y lo multiplica por la base
 * efectiva. Así que aquí se suman los puntos de las cuatro etapas y se
 * convierten de vuelta a porcentaje (puntos / 360 × 100). El servidor vuelve a
 * multiplicar por 360 y sale el mismo número, pero calculado por él y no por
 * el navegador, que es la razón de todo el rodeo.
 * ═══════════════════════════════════════════════════════════════════════════
 */

import { BASE_POR_DIFICULTAD, TOPE_ETAPAS } from "../fp/motor.js";

export const DIFICULTAD = "experto";

/* Los pesos de la ficha, en el orden en que se juegan. */
export const ETAPAS = [
  { id: 1, nombre: "El expediente confidencial", peso: 0.2 },
  { id: 2, nombre: "Arma el iceberg de Absalón", peso: 0.35 },
  { id: 3, nombre: "El momento de decisión", peso: 0.2 },
  { id: 4, nombre: "La carrera contra el diluvio", peso: 0.25 },
];

/* base × etapas, con el mismo tope que aplica el servidor. */
export const TOTAL_PUNTOS =
  BASE_POR_DIFICULTAD[DIFICULTAD] * Math.min(ETAPAS.length, TOPE_ETAPAS);

/* Puntos que puede dar cada etapa. */
export const PUNTOS_POR_ETAPA = ETAPAS.map((e) => ({
  ...e,
  puntos: Math.round(TOTAL_PUNTOS * e.peso),
}));

/** Puntos que aporta una etapa dado su resultado 0..100. */
export function puntosDeEtapa(indice, pct) {
  const etapa = PUNTOS_POR_ETAPA[indice];
  if (!etapa) return 0;
  const p = Math.max(0, Math.min(100, pct ?? 0));
  return (etapa.puntos * p) / 100;
}

/**
 * Junta las cuatro etapas.
 *
 * @param {Array<number|null>} resultados  0..100 por etapa; null = sin jugar.
 * @returns {{ puntos: number, pct: number, porEtapa: Array }}
 */
export function puntuarDesafio(resultados) {
  const porEtapa = PUNTOS_POR_ETAPA.map((etapa, i) => {
    const pct = resultados[i];
    const jugada = typeof pct === "number";
    return {
      ...etapa,
      pct: jugada ? Math.max(0, Math.min(100, pct)) : null,
      obtenidos: jugada ? puntosDeEtapa(i, pct) : 0,
    };
  });

  const puntos = porEtapa.reduce((s, e) => s + e.obtenidos, 0);

  return {
    porEtapa,
    puntos: Math.round(puntos),
    /* Lo que se le entrega al motor central: el % que representan esos puntos. */
    pct: Math.round((puntos / TOTAL_PUNTOS) * 100),
  };
}

/*
 * EL NIVEL DEL AGUA — el hilo que cruza las cuatro etapas.
 *
 * Sube con el avance (el plazo corre pase lo que pase) y sube MÁS si el
 * rendimiento es flojo. La parte del avance es la mitad del recorrido y la
 * otra mitad la decide el promedio de lo que se lleva hecho, así que un
 * estudiante impecable termina con el agua a media altura y uno que falla todo
 * la termina con el agua casi arriba. Nunca llega al 100 antes del cierre: el
 * diluvio es de la Etapa 4, no un castigo por ir mal.
 *
 *   altura = 8% + avance × 46% + (1 − rendimiento) × 40%
 *
 * @param {number} etapasHechas   0..4
 * @param {number|null} promedio  media 0..100 de las etapas ya hechas
 */
export const AGUA_MINIMA = 8;

export function nivelDelAgua(etapasHechas, promedio) {
  const avance = Math.max(0, Math.min(1, etapasHechas / ETAPAS.length));
  /* Sin etapas hechas todavía no hay rendimiento que juzgar: se asume bueno. */
  const rendimiento = typeof promedio === "number" ? Math.max(0, Math.min(1, promedio / 100)) : 1;
  return Math.round(AGUA_MINIMA + avance * 46 + (1 - rendimiento) * 40);
}
