/*
 * ═══════════════════════════════════════════════════════════════════════════
 * «EL MES EN DOS CUENTAS» — la lógica sin React (Célula E).
 *
 * Paquete orquestador/conocimiento/paquetes/e5-mes-en-dos-cuentas.md. El panel
 * es común a r5-3 (Caja e IVA por pagar) y r5-4 (Caja y Descuento comercial
 * condicionado). Lo que entra es SIEMPRE la cifra del asiento correcto, aunque
 * el estudiante falle: el error no se cobra dos veces.
 *
 *   movimientosDelMes(asientos, cuentas)  por asiento, los renglones del
 *                                         asiento correcto que tocan las dos
 *                                         cuentas, primero el debe
 *   estadoDelMes(movs, cuentas, hasta)    por cuenta y lado: lo acumulado
 *                                         antes, el tramo de este asiento y
 *                                         la escala fija del mes
 *   anchosDelLado(...)                    los px de lo liso, lo del asiento
 *                                         anterior y el tramo de este
 *   diferenciaDe(lados)                   la diferencia y su lado
 * ═══════════════════════════════════════════════════════════════════════════
 */

/* Un tramo nuevo mide como mínimo 8 px (§a). */
export const TRAMO_MINIMO = 8;

export function movimientosDelMes(asientos, cuentas) {
  const nuestras = new Set(cuentas.map((c) => c.cuenta));
  return asientos.map((a) => {
    const correcto = a.correctos[0];
    return [...correcto.filter((r) => r.lado === "debe"), ...correcto.filter((r) => r.lado === "haber")]
      .filter((r) => nuestras.has(r.cuenta))
      .map((r) => ({ cuenta: r.cuenta, lado: r.lado, valor: r.valor }));
  });
}

const suma = (movs, cuenta, lado, desde, hasta) => movs.slice(desde, hasta)
  .reduce((t, m) => t + m.filter((x) => x.cuenta === cuenta && x.lado === lado).reduce((s, x) => s + x.valor, 0), 0);

/*
 * `hasta` es el índice del asiento en curso: lo suyo es el tramo (rayado); lo
 * de antes, liso. Con `hasta` = null, el mes entero y sin tramo (pantalla
 * final). La escala de cada cuenta es fija todo el mes: el lado mayor al final.
 */
export function estadoDelMes(movs, cuentas, hasta) {
  const fin = movs.length;
  return cuentas.map((c) => {
    const lado = (l) => {
      if (hasta === null) return { antes: suma(movs, c.cuenta, l, 0, fin), tramo: 0, previo: 0 };
      return {
        antes: suma(movs, c.cuenta, l, 0, hasta),
        previo: hasta > 0 ? suma(movs, c.cuenta, l, hasta - 1, hasta) : 0,
        tramo: suma(movs, c.cuenta, l, hasta, hasta + 1),
      };
    };
    const escala = Math.max(suma(movs, c.cuenta, "debe", 0, fin), suma(movs, c.cuenta, "haber", 0, fin));
    const debe = lado("debe");
    const haber = lado("haber");
    return { ...c, escala, debe: { ...debe, total: debe.antes + debe.tramo }, haber: { ...haber, total: haber.antes + haber.tramo } };
  });
}

/* ¿Toca el asiento `k` alguna de las dos cuentas? */
export const tocaElMes = (movs, k) => movs[k].length > 0;

/*
 * Los px de un lado de una cuenta, asiento por asiento, con el mínimo de 8 px
 * por tramo y sin pasar del riel. Devuelve la posición tras cada asiento.
 */
export function posicionesDelLado(movs, cuenta, lado, escala, ancho) {
  let x = 0;
  return movs.map((m) => {
    const v = m.filter((r) => r.cuenta === cuenta && r.lado === lado).reduce((s, r) => s + r.valor, 0);
    if (v > 0) x = Math.min(ancho, x + Math.max(TRAMO_MINIMO, (v / escala) * ancho));
    return x;
  });
}

/*
 * Los anchos de lo que se pinta en un lado cuando el asiento en curso es
 * `hasta`: `liso` es lo de los asientos de antes del anterior, `previo` lo del
 * anterior (rayado que pasa a liso) y `tramo` lo de este asiento.
 */
export function anchosDelLado(movs, cuenta, lado, escala, ancho, hasta) {
  const pos = posicionesDelLado(movs, cuenta, lado, escala, ancho);
  if (hasta === null) return { liso: pos.at(-1), previo: 0, tramo: 0 };
  const en = (k) => (k < 0 ? 0 : pos[k]);
  return { liso: en(hasta - 2), previo: en(hasta - 1) - en(hasta - 2), tramo: en(hasta) - en(hasta - 1) };
}

/* La diferencia de una cuenta: cuánto y de qué lado (null si son iguales). */
export function diferenciaDe(debe, haber) {
  if (debe === haber) return { valor: 0, lado: null };
  return debe > haber ? { valor: debe - haber, lado: "debe" } : { valor: haber - debe, lado: "haber" };
}
