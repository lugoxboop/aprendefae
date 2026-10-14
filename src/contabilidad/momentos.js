/*
 * ═══════════════════════════════════════════════════════════════════════════
 * TEMA 6 · LOS MOMENTOS DE LA CAPA 2 (Célula B) — el estado por paso de las
 * escenas hechas de momentos (T6 · A3 y A4, guías de Mai).
 *
 * Una fila de momentos, uno abierto a la vez (la fila de hechos de T5 · A2):
 * el del paso actual va abierto con todas sus piezas (lo que aún no aparece
 * ocupa su sitio, invisible); los anteriores quedan PASADOS y conservan solo
 * las piezas marcadas `conserva` (su cabecera y su asiento); los que aún no
 * llegan no se muestran. En el cierre, todos pasados y nada atenuado.
 *
 * Cada pieza: [momento, desde qué paso, conserva]. `resaltado` es la columna
 * «Resalta» de Futaba, en orden de prioridad para el bloque pegado. El estado
 * sale SOLO del número de paso.
 * ═══════════════════════════════════════════════════════════════════════════
 */

export function crearMomentos({ pasos, cierre, tramos, piezas, resaltado, nuncaAtenuadas = [] }) {
  const PASOS = pasos.length;
  const CIERRE = PASOS + 1;
  const ELEMENTOS = Object.keys(piezas);
  const quietas = new Set(nuncaAtenuadas);
  const tramoDe = (p) => tramos.findIndex(([a, b]) => p >= a && p <= b);

  function estadoPaso(paso) {
    const p = Math.min(CIERRE, Math.max(1, paso));
    const enCierre = p === CIERRE;
    const abierto = enCierre ? null : tramoDe(p);
    const lista = resaltado[p] ?? [];
    const resaltados = new Set(lista);
    const hay = resaltados.size > 0;
    const pasado = (m) => enCierre || m < abierto;
    return {
      paso: p,
      cierre: enCierre,
      abierto,
      resaltados: lista,
      momentos: tramos.map((_, i) => ({ mostrado: enCierre || i <= abierto, pasado: pasado(i), atenuado: hay })),
      elementos: Object.fromEntries(ELEMENTOS.map((id) => {
        const [m, desde, conserva] = piezas[id];
        const visible = (m === abierto && p >= desde) || (pasado(m) && Boolean(conserva));
        /* Una pieza pasada que no se conserva no está; una del momento abierto, invisible hasta su paso. */
        const presente = m === abierto || (pasado(m) && Boolean(conserva));
        const r = resaltados.has(id);
        return [id, { presente, visible, resaltado: r, atenuado: hay && visible && !r && !quietas.has(id) }];
      })),
    };
  }

  const paso = (n) => (n >= CIERRE ? cierre : pasos[n - 1]);
  /** «Reproducir»: 3 000 ms + 450 ms por palabra, como LoQueYaPaso. */
  const duracion = (n) => 3000 + 450 * paso(n).texto.trim().split(/\s+/).length;
  /* Los estados que reserva la escena: cada momento abierto al final de su tramo, y el cierre. */
  const reservas = [...tramos.map(([, fin]) => fin), CIERRE];

  return { PASOS, CIERRE, ELEMENTOS, estadoPaso, paso, duracion, reservas, tramoDe };
}
