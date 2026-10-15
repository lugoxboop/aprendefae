/*
 * ═══════════════════════════════════════════════════════════════════════════
 * LAS CAPAS 2 LARGAS: LOS PASOS QUE SE JUNTAN (hoja 7 de Mai, entrega 3 de
 * Futaba). Célula B.
 *
 * Toma una pieza ya hecha (su estado por paso y sus textos, con la
 * numeración de siempre) y la vuelve a contar por grupos: `grupos` es la
 * lista de los pasos nuevos, cada uno con los pasos de antes que junta
 * ([[1, 2], [3], …]); `pies`, el pie de cada paso nuevo. Un paso juntado:
 *   · dice los dos textos seguidos, sin cambiar una palabra;
 *   · muestra la escena del segundo paso;
 *   · resalta la unión de lo que resaltaban los dos. En el orden de
 *     prioridad va primero lo del segundo paso (lo que llega): si no cabe
 *     todo sobre el bloque pegado, manda eso (Mai §1).
 * Los textos de los datos no se tocan: el estado y los pasos de antes siguen
 * siendo la fuente, y aquí solo se cuentan de otra forma.
 * ═══════════════════════════════════════════════════════════════════════════
 */
export function fusionar({ grupos, pies, estadoPaso, paso, cierreViejo }) {
  const PASOS = grupos.length;
  const CIERRE = PASOS + 1;
  const TODOS = [
    ...grupos.map((g, k) => ({ texto: g.map((n) => paso(n).texto).join(" "), pie: pies[k] })),
    paso(cierreViejo),
  ];
  /* El paso de antes cuyo estado muestra cada paso nuevo: el último de su grupo. */
  const viejo = (n) => (n >= CIERRE ? cierreViejo : grupos[Math.max(1, n) - 1].at(-1));

  function estado(n) {
    const p = Math.min(CIERRE, Math.max(1, n));
    const base = estadoPaso(viejo(p));
    if (p === CIERRE || grupos[p - 1].length === 1) return { ...base, paso: p };
    const antes = grupos[p - 1].slice(0, -1).flatMap((m) => estadoPaso(m).resaltados);
    const resaltados = [...base.resaltados, ...antes.filter((id, i) => !base.resaltados.includes(id) && antes.indexOf(id) === i)];
    const r = new Set(resaltados);
    return {
      ...base,
      paso: p,
      resaltados,
      elementos: Object.fromEntries(Object.entries(base.elementos).map(([id, x]) => [id, { ...x, resaltado: r.has(id), atenuado: x.visible && r.size > 0 && !r.has(id) }])),
    };
  }

  /** «Reproducir»: 3 000 ms + 450 ms por palabra, como LoQueYaPaso (la fórmula no cambia: Mai §1). */
  const duracion = (n) => 3000 + 450 * TODOS[Math.min(CIERRE, Math.max(1, n)) - 1].texto.trim().split(/\s+/).length;

  return { PASOS, CIERRE, TODOS, estadoPaso: estado, duracion, viejo };
}

/*
 * El estado de la escena en la parada (la predicción entre dos pasos): el del
 * paso de antes, con el resalte en lo que nombra la pregunta (Mai §2).
 */
export function estadoParada(estadoPaso, antes, resaltados) {
  const base = estadoPaso(antes - 1);
  const r = new Set(resaltados);
  return {
    ...base,
    resaltados,
    elementos: Object.fromEntries(Object.entries(base.elementos).map(([id, x]) => [id, { ...x, resaltado: r.has(id), atenuado: x.visible && !r.has(id) }])),
  };
}
