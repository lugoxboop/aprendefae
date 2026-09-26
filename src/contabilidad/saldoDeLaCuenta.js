import { DEBE, HABER, pesos, saldoDe, mayorizar, CALEJA, LAVADO_DE_AUTOS } from "../data/contabilidad.js";
import { CAJA_DEL_CAPITULO } from "../data/contabilidadActividades.js";
import {
  ITEMS, ITEMS_RETIRADOS, POR_PARTIDA, EMPRESA_DEL_CASO,
  ACIERTO_SALDO, ACIERTO_LADO, ACIERTO_SIN_CANCELAR,
  ERROR_A, ERROR_B, ERROR_B_CIFRA_BIEN, ERROR_C, ERROR_D,
} from "../data/contabilidadSaldo.js";

/*
 * ═══════════════════════════════════════════════════════════════════════════
 * A5 · EL SALDO DE LA CUENTA — la aritmética.
 *
 * Las nueve cuentas salen de mayorizar los asientos de su caso: ni un
 * movimiento transcrito. La cuenta que ve el estudiante aquí y la que usa el
 * desafío son literalmente el mismo objeto, no dos copias que puedan
 * separarse.
 *
 * ═══════════ LA CANCELACIÓN NO CORRE EN UN PRIMER ERROR ═══════════
 *
 * Regla corregida, y es la decisión que manda en esta actividad: si el primer
 * intento falla —da igual en cuál de los cuatro modos— las columnas se quedan
 * exactamente como estaban. Dejarlas cancelarse dibujaría el saldo en pantalla
 * y el reintento no tendría nada que calcular: el estudiante leería la
 * respuesta de la columna que quedó en pie.
 * ═══════════════════════════════════════════════════════════════════════════
 */

const CASOS = { caleja: CALEJA.transacciones, lavado: LAVADO_DE_AUTOS.transacciones };

/** La cuenta T de un ítem del banco, con sus movimientos ya derivados. */
export function cuentaDelItem(item) {
  if (item.caso === "capitulo") return CAJA_DEL_CAPITULO;
  const encontrada = mayorizar(CASOS[item.caso]).find((c) => c.cuenta === item.cuenta);
  if (!encontrada) throw new Error(`${item.id}: «${item.cuenta}» no está en el mayor de ${item.caso}`);
  return encontrada;
}

/** Un ítem montado: su cuenta, su empresa y su saldo, todo derivado. */
export function montar(item) {
  const c = cuentaDelItem(item);
  const s = saldoDe(c);
  return {
    ...item,
    empresa: EMPRESA_DEL_CASO[item.caso],
    cuentaT: c,
    debitos: c.debitos,
    creditos: c.creditos,
    debito: s.debito,
    credito: s.credito,
    saldo: s.saldo,
    lado: s.lado,
    /*
     * Un lado vacío es otro caso: no hay nada que cancelar y el saldo es el
     * movimiento entero. Se deduce de los movimientos, no se marca a mano.
     */
    sinCancelar: c.debitos.length === 0 || c.creditos.length === 0,
  };
}

export const CUENTAS = ITEMS.map(montar);
export { POR_PARTIDA };

/*
 * ═══════════ LOS CUATRO MODOS DE FALLAR LA CIFRA ═══════════
 *
 * A  escribió la suma de los dos lados
 * C  escribió un número negativo, que es lo que sale de restar al revés
 * D  cualquier otra cifra
 *
 * (B no está aquí: B es fallar el LADO, y con dos lados fallar es ponerlo
 * donde estuvo el movimiento menor, que es exactamente lo que dice la ficha.)
 */
export const MODO_A = "A";
export const MODO_B = "B";
export const MODO_C = "C";
export const MODO_D = "D";

export function modoDeLaCifra(cuenta, cifra) {
  if (cifra === cuenta.saldo) return null;
  if (cifra === cuenta.debito + cuenta.credito) return MODO_A;
  if (cifra < 0) return MODO_C;
  return MODO_D;
}

/** La resta que hay que hacer, escrita sin el resultado. La escena del modo D. */
export const operacionSinResultado = (cuenta) => {
  const mayor = Math.max(cuenta.debito, cuenta.credito);
  const menor = Math.min(cuenta.debito, cuenta.credito);
  return `${pesos(mayor)} − ${pesos(menor)} = ?`;
};

const rellenar = (texto, cuenta) => texto
  .replace("{saldo}", pesos(cuenta.saldo))
  .replace("{debito}", pesos(cuenta.debito))
  .replace("{credito}", pesos(cuenta.credito))
  .replace("{Lado}", cuenta.lado === DEBE ? "Debe" : "Haber")
  .replace("{lado}", cuenta.lado === DEBE ? "debe" : "haber")
  .replace("{movimiento}", cuenta.lado === DEBE ? "débito" : "crédito");

/*
 * Las dos devoluciones de una respuesta, y lo que hay que enseñar con ellas.
 * `intento` es 0 la primera vez y 1 en el reintento: de ahí sale si la
 * cancelación puede correr.
 */
export function evaluar(cuenta, cifra, lado, intento = 0) {
  const cifraOk = cifra === cuenta.saldo;
  const ladoOk = lado === cuenta.lado;
  const modoCifra = modoDeLaCifra(cuenta, cifra);
  const modoLado = ladoOk ? null : MODO_B;

  const textoCifra = cifraOk
    ? rellenar(cuenta.sinCancelar ? ACIERTO_SIN_CANCELAR : ACIERTO_SALDO, cuenta)
    : rellenar({ [MODO_A]: ERROR_A, [MODO_C]: ERROR_C, [MODO_D]: ERROR_D }[modoCifra], cuenta);

  const textoLado = ladoOk
    ? rellenar(ACIERTO_LADO, cuenta)
    : rellenar(cifraOk ? ERROR_B_CIFRA_BIEN : ERROR_B, cuenta);

  const todoBien = cifraOk && ladoOk;
  return {
    cifraOk,
    ladoOk,
    todoBien,
    modoCifra,
    modoLado,
    textoCifra,
    textoLado,
    /*
     * La cancelación corre cuando se acertó todo, o cuando ya se agotó el
     * reintento y la respuesta queda a la vista de todos modos. En un primer
     * error, nunca.
     */
    cancelar: todoBien || intento > 0,
    /* Solo el modo A la ve en cámara lenta: la resta es justo lo que no hizo. */
    camaraLenta: modoCifra === MODO_A,
    /* Los dos totales resaltados en neutro: A, B y D los piden; C no. */
    resaltarTotales: [MODO_A, MODO_D].includes(modoCifra) || modoLado === MODO_B,
    /* El signo se tacha en coral y la cifra se queda en valor absoluto. */
    quitarSigno: modoCifra === MODO_C,
    /* La resta escrita debajo, sin el resultado. */
    operacion: modoCifra === MODO_D ? operacionSinResultado(cuenta) : null,
  };
}

/* El reintento vale la mitad, como en el resto del tema. */
export const VALOR_SEGUNDO = 0.5;

/** Doce decisiones por partida: la cifra y el lado de cada una de las seis. */
export const decisionesDe = (cuantas) => cuantas * 2;

export function puntuar(respuestas, cuantas) {
  const total = decisionesDe(cuantas);
  if (!total) return 0;
  const suma = respuestas.reduce((s, r) => {
    if (r.primeroOk) return s + 1;
    if (r.segundoOk) return s + VALOR_SEGUNDO;
    return s;
  }, 0);
  return (suma / total) * 100;
}

export const pesoDeCadaDecision = (cuantas) => (decisionesDe(cuantas) ? 100 / decisionesDe(cuantas) : 0);

/*
 * Para el panel docente. Cada cuenta deja DOS entradas —`<id>:saldo` y
 * `<id>:lado`— porque fallar la resta y fallar el sitio son dos problemas con
 * dos remedios, y con una sola el profesor no sabría cuál de los dos tiene
 * delante. La empresa va en la etiqueta y no sobra: tres cuentas se llaman
 * «Caja», y sin decir de cuál, serían tres preguntas escritas igual.
 */
export function cuentaDeItemDocente(id) {
  const base = id.replace(/:(saldo|lado)$/, "");
  const viva = CUENTAS.find((c) => c.id === base);
  if (viva) return { cuenta: viva.cuenta, empresa: viva.empresa };
  const retirada = ITEMS_RETIRADOS[base];
  if (retirada) return { cuenta: retirada.cuenta, empresa: EMPRESA_DEL_CASO[retirada.caso] };
  return null;
}
