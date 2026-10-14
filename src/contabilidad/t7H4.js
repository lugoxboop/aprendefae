import { METODOS_H4, FILAS_H4, DISTRACTORES_H4, PARTE2_H4 } from "../data/contabilidadT7_1_h4.js";
import { pesos } from "../data/contabilidad.js";

/*
 * ═══════════════════════════════════════════════════════════════════════════
 * T7-1 · H4 «Cierra el mes» — la lógica, sin React.
 *
 *   CASILLAS_H4               las doce casillas: «peps:final», «ueps:cmv»…,
 *                             cada una con su cifra correcta
 *   bancoH4(barajar)          las quince fichas: las doce correctas y los tres
 *                             distractores, barajadas en cada intento
 *   evaluarCasillaH4(id, v)   el veredicto de una casilla y lo que se lee si
 *                             falló: la línea del distractor (si es uno) y
 *                             después la de su fila
 *   unidadesH4()              las catorce unidades que puntúan
 *   puntuarH4(aciertos)       aciertos / 14 × 100. Evaluativa: el motor
 *                             escala los 50 FP con este porcentaje
 *   unidadDeH4(id)            el texto de cada unidad, para el panel docente
 * ═══════════════════════════════════════════════════════════════════════════
 */

export const CASILLAS_H4 = METODOS_H4.flatMap((m) =>
  FILAS_H4.map((f) => ({ id: `${m.id}:${f.id}`, metodo: m, fila: f, valor: m.cifras[f.id] })));

export const bancoH4 = (barajar) => barajar([...CASILLAS_H4.map((c) => c.valor), ...DISTRACTORES_H4.map((d) => d.valor)]);

export function evaluarCasillaH4(id, valor) {
  const c = CASILLAS_H4.find((x) => x.id === id);
  const ok = valor === c.valor;
  if (ok) return { ok, correcta: c.valor, textos: [] };
  const distractor = DISTRACTORES_H4.find((d) => d.valor === valor);
  return { ok, correcta: c.valor, textos: [...(distractor ? [distractor.retro] : []), c.fila.retro] };
}

export const idLineaH4 = (l) => `cierre:${l.id}`;

export const unidadesH4 = () => [...CASILLAS_H4.map((c) => c.id), ...PARTE2_H4.lineas.map(idLineaH4)];

export const TOTAL_H4 = unidadesH4().length;

export const puntuarH4 = (aciertos, total = TOTAL_H4) => (total ? (aciertos / total) * 100 : 0);

/* Una casilla se lee por su método y su fila; una línea del cierre, por su texto y su valor. */
export function unidadDeH4(id) {
  const c = CASILLAS_H4.find((x) => x.id === id);
  if (c) return `${c.metodo.nombre} · ${c.fila.nombre}`;
  const l = PARTE2_H4.lineas.find((x) => idLineaH4(x) === id);
  return l ? `Cierre con el promedio: ${l.cuenta} ${pesos(l.valor)}` : null;
}
