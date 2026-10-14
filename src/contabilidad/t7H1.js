import { ITEMS_H1, OPCIONES_H1, CORRECTO } from "../data/contabilidadT7_1_h1.js";

/*
 * ═══════════════════════════════════════════════════════════════════════════
 * T7-1 · H1 «¿Qué cuenta se mueve?» — la lógica, sin React.
 *
 *   sortearH1(barajar)    los seis hechos, en un orden nuevo en cada intento
 *   evaluarH1(ítem, id)   el veredicto y lo que se lee después de responder:
 *                         con acierto, «Correcto.» y el porqué; con error, la
 *                         línea del error típico (si es ese) y el porqué
 *   puntuarH1(aciertos)   el porcentaje que se reporta. Es exploratoria: el
 *                         motor paga los 10 FP al terminar, sin mirarlo
 *   hechoDeItemH1(id)     el ítem, para el panel docente, por su texto
 * ═══════════════════════════════════════════════════════════════════════════
 */

export const sortearH1 = (barajar) => barajar(ITEMS_H1);

export const nombreDeOpcionH1 = (id) => OPCIONES_H1.find((o) => o.id === id)?.nombre ?? null;

export function evaluarH1(item, elegida) {
  const ok = elegida === item.respuesta;
  if (ok) return { ok, correcta: item.respuesta, textos: [CORRECTO, item.porque] };
  const tipico = item.tipico && item.tipico.opcion === elegida ? [item.tipico.texto] : [];
  return { ok, correcta: item.respuesta, textos: [...tipico, item.porque] };
}

export const puntuarH1 = (aciertos, cuantos) => (cuantos ? (aciertos / cuantos) * 100 : 0);

export const hechoDeItemH1 = (id) => ITEMS_H1.find((x) => x.id === id)?.texto ?? null;
