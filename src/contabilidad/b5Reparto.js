/*
 * ═══════════════════════════════════════════════════════════════════════════
 * EL REPARTO DE UNA TANDA DE FICHAS ENTRE SUS CAJONES (Célula B · R10, hoja
 * de fusiones de Mai).
 *
 * Con tres fichas por cajón, la cuenta del estante delataba la última: en la
 * ficha 9 se sabía cuál faltaba. Ahora cada tanda reparte entre 2 y 4 fichas
 * por cajón, sumando `total`, al azar entre todos los repartos posibles. El
 * tope de cada cajón es lo que da su banco: si un cajón tiene 3 fichas, el
 * reparto se sortea con ese tope.
 * ═══════════════════════════════════════════════════════════════════════════
 */

export const MIN_POR_CAJON = 2;
export const MAX_POR_CAJON = 4;

/* Todos los repartos posibles: una cifra por cajón, entre el mínimo y su tope, que suman `total`. */
export function repartosPosibles(topes, total, min = MIN_POR_CAJON, max = MAX_POR_CAJON) {
  const salida = [];
  const ir = (k, resto, va) => {
    if (k === topes.length) { if (resto === 0) salida.push(va); return; }
    for (let n = min; n <= Math.min(max, topes[k], resto); n++) ir(k + 1, resto - n, [...va, n]);
  };
  ir(0, total, []);
  return salida;
}

/**
 * `grupos` es una lista de bancos (uno por cajón). `elegir(banco, n)` devuelve
 * n fichas de ese banco (cada actividad pone sus reglas, como la de las fichas
 * de nombre). Devuelve la tanda barajada.
 */
export function repartirTanda(grupos, total, barajar, elegir = (banco, n) => barajar(banco).slice(0, n)) {
  const topes = grupos.map((g) => g.length);
  const posibles = repartosPosibles(topes, total);
  if (!posibles.length) throw new Error(`no hay reparto de ${total} fichas entre ${MIN_POR_CAJON} y ${MAX_POR_CAJON} por cajón con bancos de ${topes.join(" · ")}`);
  const reparto = barajar(posibles)[0];
  return barajar(grupos.flatMap((banco, k) => elegir(banco, reparto[k])));
}
