import { DEBE, HABER } from "../data/contabilidad.js";

/*
 * ═══════════════════════════════════════════════════════════════════════════
 * LA CANCELACIÓN POR VALOR — el segundo de los tres verbos visuales del tema.
 *
 * Dos columnas de fichas. La columna menor consume ALTURA EQUIVALENTE de la
 * mayor, y lo que queda en pie es el saldo.
 *
 * ═══════════ POR QUÉ NO SE CANCELA FICHA CONTRA FICHA ═══════════
 *
 * Porque eso falsea el saldo en cuanto los montos son distintos, que es casi
 * siempre. Una cuenta con 1.000 y 500 al debe contra 150 al haber tiene tres
 * fichas: cancelando por pares se irían una de cada lado y quedaría «1.500
 * contra nada» o «500 contra nada» según cuál se empareje — dos respuestas, y
 * las dos falsas. El saldo es 1.350 y solo sale de restar alturas.
 *
 * Por eso esto no cuenta fichas: reparte una cantidad. La columna menor aporta
 * su total, y ese total se come las fichas de la mayor de abajo hacia arriba
 * hasta agotarse. LA ÚLTIMA PUEDE QUEDAR COMIDA A MEDIAS, y eso no es un
 * defecto del dibujo: es lo que hace una resta cuando los sumandos no encajan
 * redondos. Ver la ficha de 1.000 mordida hasta la mitad es exactamente la
 * imagen que enseña qué es un saldo.
 *
 * Esto es aritmética pura y vive aparte del dibujo a propósito: es lo que hay
 * que poder probar sin montar una pantalla.
 * ═══════════════════════════════════════════════════════════════════════════
 */

/** Lo que aporta cada lado: la suma de sus fichas. */
export const totalDe = (fichas) => fichas.reduce((s, f) => s + f.valor, 0);

/**
 * Reparte `aConsumir` entre las fichas de una columna, de abajo hacia arriba.
 *
 * Devuelve las fichas con `consumido`, la fracción de cada una que se come la
 * cancelación: 0 intacta, 1 desaparecida, y cualquier valor entre medias para
 * la que queda mordida.
 *
 * El orden importa y es el de la lista: la primera ficha es la de abajo de la
 * pila, que es la que se registró primero. Cancelar desde arriba dejaría en
 * pie la ficha más vieja, que no es lo que hace un mayor.
 */
export function repartir(fichas, aConsumir) {
  let queda = Math.max(0, aConsumir);
  return fichas.map((f) => {
    if (f.valor <= 0) return { ...f, consumido: 0 };
    const come = Math.min(queda, f.valor);
    queda -= come;
    return { ...f, consumido: come / f.valor };
  });
}

/**
 * La cancelación entera de una cuenta.
 *
 *   debe, haber   [{ valor }] en el orden en que se registraron
 *
 * Devuelve las dos columnas con su `consumido` por ficha, los dos totales, lo
 * que se canceló, y el saldo con su lado. El lado es null cuando los dos
 * totales empatan: ahí no queda nada en pie y decir «debe» por descuido
 * enseñaría algo falso.
 */
export function cancelacion(debe, haber) {
  const totalDebe = totalDe(debe);
  const totalHaber = totalDe(haber);
  const cancelado = Math.min(totalDebe, totalHaber);
  const saldo = Math.abs(totalDebe - totalHaber);
  const lado = totalDebe === totalHaber ? null : (totalDebe > totalHaber ? DEBE : HABER);

  return {
    debe: repartir(debe, cancelado),
    haber: repartir(haber, cancelado),
    totalDebe,
    totalHaber,
    cancelado,
    saldo,
    lado,
  };
}

/*
 * ═══════════ LA ALTURA, QUE ES LO QUE SE VE ═══════════
 *
 * Todas las fichas de una cuenta se miden contra la MISMA referencia —el mayor
 * de los dos totales— para que las dos columnas se puedan comparar de un
 * vistazo. Medir cada columna contra su propio total las dejaría a las dos de
 * la misma altura y borraría justo la diferencia que hay que ver.
 */
export const ALTO_COLUMNA = 148;

/** Lo que mide una ficha en pantalla, en píxeles. */
export function alturaDe(valor, referencia, alto = ALTO_COLUMNA) {
  if (!(referencia > 0)) return 0;
  return (valor / referencia) * alto;
}

/**
 * La referencia de una cuenta: el mayor de los dos totales. Si los dos son
 * cero no hay nada que dibujar y se devuelve cero en vez de dividir por él.
 */
export const referenciaDe = (debe, haber) => Math.max(totalDe(debe), totalDe(haber), 0);
