/*
 * ═══════════════════════════════════════════════════════════════════════════
 * LA CUENTA DE "EL COMITÉ DE NOVA".
 *
 * Vive aparte de los componentes por la misma razón que la del Arca: para
 * poder medirla sin montar la interfaz, que es lo único que garantiza que el
 * 360 sea de verdad 360 y no un número escrito en un comentario.
 *
 * LA REGLA DEL KIT (general, no de esta pieza): un nodo de desafío vale sus
 * puntos base × su número de etapas, con tope en cuatro. Aquí eso da
 * experto (90) × 4 = 360, y el reparto entre etapas es el de la ficha:
 *
 *   Etapa 1 · ¿Cobra, Gasta o Pide Prestado? ... 20%  →  72
 *   Etapa 2 · La Línea que se Mueve ............ 25%  →  90
 *   Etapa 3 · ¿Quién Termina Pagando? .......... 25%  →  90
 *   Etapa 4 · La Decisión del Comité ........... 30%  → 108
 *                                              ────    ───
 *                                              100%    360
 *
 * CÓMO LLEGA AL MOTOR CENTRAL. Igual que el Arca: el motor no sabe de etapas
 * más allá de cuántas son. Aquí se suman los puntos de las cuatro y se
 * convierten de vuelta a porcentaje; el servidor vuelve a multiplicar por 360
 * y sale el mismo número, pero calculado por él y no por el navegador.
 *
 * NO COMPARTE MÓDULO CON EL ARCA, Y ES DELIBERADO. Los pesos son distintos
 * (20/25/25/30 contra 20/35/20/25) y el hilo que cruza las etapas también —el
 * agua sube, el estado de resultados se mueve—. Lo que sí se comparte es lo
 * que de verdad es común: BASE_POR_DIFICULTAD y TOPE_ETAPAS del motor, que es
 * donde vive la regla del Kit.
 * ═══════════════════════════════════════════════════════════════════════════
 */

import { BASE_POR_DIFICULTAD, TOPE_ETAPAS } from "../fp/motor.js";

export const ACTIVIDAD_NOVA = "comite-nova";
export const DIFICULTAD = "experto";

/* Los pesos de la ficha, en el orden en que se juegan. */
export const ETAPAS = [
  { id: 1, nombre: "¿Cobra, Gasta o Pide Prestado?", peso: 0.2 },
  { id: 2, nombre: "La Línea que se Mueve", peso: 0.25 },
  { id: 3, nombre: "¿Quién Termina Pagando?", peso: 0.25 },
  { id: 4, nombre: "La Decisión del Comité", peso: 0.3 },
];

/* base × etapas, con el mismo tope que aplica el servidor. */
export const TOTAL_PUNTOS =
  BASE_POR_DIFICULTAD[DIFICULTAD] * Math.min(ETAPAS.length, TOPE_ETAPAS);

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
 * @param {Array<number|null>} resultados 0..100 por etapa; null = sin jugar.
 */
export function puntuarDesafio(resultados) {
  const porEtapa = PUNTOS_POR_ETAPA.map((etapa, i) => {
    const pct = resultados?.[i];
    const jugada = typeof pct === "number" && Number.isFinite(pct);
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
    pct: Math.round((puntos / TOTAL_PUNTOS) * 100),
  };
}

/*
 * ═══════════ EL PORCENTAJE DE UNA ETAPA DE ÍTEMS ═══════════
 *
 * Las etapas 1, 2 y 3 son ocho aciertos de 12,5 % cada uno. Un ítem se cuenta
 * acertado SOLO si se acertó al primer intento; el reintento sirve para leer la
 * explicación y volver a mirar, no para recuperar el punto. Si recuperara el
 * punto, el reintento sería puntuación gratis y la etapa mediría paciencia.
 */
export const ITEMS_POR_ETAPA = 8;
export const VALOR_DE_ITEM = 100 / ITEMS_POR_ETAPA;

export function pctDeItems(aciertos, total = ITEMS_POR_ETAPA) {
  if (!total) return 0;
  return Math.round((Math.max(0, Math.min(total, aciertos)) / total) * 100);
}

/*
 * ═══════════ EL PORCENTAJE DE LA ETAPA 4 ═══════════
 *
 * Tres decisiones, cada una con crédito propio de 0 a 100 —hay opciones
 * parciales a propósito—, y las tres pesan lo mismo: 33,33 % cada una. Así
 * ninguna decisión sola carga el peso de la etapa, que es lo que pide la ficha.
 */
export function pctDeDecisiones(creditos) {
  if (!creditos?.length) return 0;
  const suma = creditos.reduce((s, c) => s + Math.max(0, Math.min(100, c ?? 0)), 0);
  return Math.round(suma / creditos.length);
}
