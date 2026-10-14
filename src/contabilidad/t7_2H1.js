import { ITEMS_H1, OPCIONES_H1, CORRECTO } from "../data/contabilidadT7_2_h1.js";

/*
 * ═══════════════════════════════════════════════════════════════════════════
 * T7-2 · H1 «¿Debe o haber?» — la lógica, sin React.
 *
 *   sortearH1(barajar)    los siete hechos, en un orden nuevo en cada intento
 *   evaluarH1(ítem, id)   el veredicto y lo que se lee después: con acierto,
 *                         «Correcto.» y el porqué; con error, el porqué
 *   puntuarH1(aciertos)   el porcentaje que se reporta. Es exploratoria: el
 *                         motor paga los 10 FP al terminar, sin mirarlo
 *   hechoDeItemH1(id)     el ítem, para el panel docente, por su texto
 * ═══════════════════════════════════════════════════════════════════════════
 */

export const sortearH1 = (barajar) => barajar(ITEMS_H1);

export const nombreDeOpcionH1 = (id) => OPCIONES_H1.find((o) => o.id === id)?.nombre ?? null;

export function evaluarH1(item, elegida) {
  const ok = elegida === item.respuesta;
  return { ok, correcta: item.respuesta, textos: ok ? [CORRECTO, item.porque] : [item.porque] };
}

export const puntuarH1 = (aciertos, cuantos) => (cuantos ? (aciertos / cuantos) * 100 : 0);

export const hechoDeItemH1 = (id) => ITEMS_H1.find((x) => x.id === id)?.texto ?? null;
