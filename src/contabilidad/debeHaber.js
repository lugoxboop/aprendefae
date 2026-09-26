import {
  DEBE, HABER, CALEJA, CRECE_POR, tipoDeCuenta, mayorConSaldos, saldoDe,
} from "../data/contabilidad.js";
import { CAJA_DEL_CAPITULO } from "../data/contabilidadActividades.js";
import {
  PIEZA_DEBE_Y_HABER, TRANSACCION_C, TRANSACCION_F,
  CAJA_ANTES_DEL_EJEMPLO_DOS, transaccionDelEjemploDos, transaccionDeCaleja,
} from "../data/contabilidadDebeHaber.js";

/*
 * ═══════════════════════════════════════════════════════════════════════════
 * LA ARITMÉTICA DE «EL DEBE Y EL HABER».
 *
 * Todo lo que la pieza enseña como número sale de aquí, y aquí sale del caso
 * de Caleja que ya vive en contabilidad.js. Ni un saldo transcrito.
 *
 * ═══════════ EL ▲ NO ES UN DATO NUEVO ═══════════
 *
 * El triángulo que marca por qué lado crece cada cuenta es, literalmente,
 * CRECE_POR — la regla del capítulo, que el repo ya tenía codificada para las
 * doce actividades. Si se declarara aparte para esta pieza, el día que alguien
 * corrigiera una, la pieza de teoría y las actividades enseñarían cosas
 * distintas sobre la misma cuenta. Ese es exactamente el error que esta pieza
 * existe para impedir.
 * ═══════════════════════════════════════════════════════════════════════════
 */

/** El lado por el que crece una cuenta: el lado donde va su ▲. */
export const ladoDelTriangulo = (cuenta) => CRECE_POR[tipoDeCuenta(cuenta)] ?? null;

/** El saldo de una cuenta considerando SOLO las transacciones anteriores a una. */
export function saldoAntesDe(idTransaccion, cuenta, transacciones = CALEJA.transacciones) {
  const corte = transacciones.findIndex((t) => t.id === idTransaccion);
  if (corte < 0) throw new Error(`la transacción «${idTransaccion}» no existe`);
  const previas = transacciones.slice(0, corte);
  const enMayor = mayorConSaldos(previas).find((c) => c.cuenta === cuenta);
  if (!enMayor) return { cuenta, debito: 0, credito: 0, saldo: 0, lado: null };
  return enMayor;
}

/** El saldo después de aplicar una transacción, inclusive. */
export function saldoHasta(idTransaccion, cuenta, transacciones = CALEJA.transacciones) {
  const corte = transacciones.findIndex((t) => t.id === idTransaccion);
  if (corte < 0) throw new Error(`la transacción «${idTransaccion}» no existe`);
  const hasta = transacciones.slice(0, corte + 1);
  const enMayor = mayorConSaldos(hasta).find((c) => c.cuenta === cuenta);
  if (!enMayor) return { cuenta, debito: 0, credito: 0, saldo: 0, lado: null };
  return enMayor;
}

/*
 * Un panel de la mesa: la cuenta que recibe el débito, con su saldo antes y
 * después, y su contrapartida con los suyos. «sube» se CALCULA comparando los
 * dos saldos, no se declara — que Maquinaria suba y Aportes sociales baje es
 * justamente lo que la pieza demuestra, y demostrarlo con un campo escrito a
 * mano sería hacer trampa consigo misma.
 */
function panelDe(idTransaccion) {
  const t = transaccionDeCaleja(idTransaccion);
  if (!t) throw new Error(`la transacción «${idTransaccion}» no existe en Caleja`);
  const [cuentaDebito, monto] = t.asiento.debe[0];
  const [cuentaCredito, montoCredito] = t.asiento.haber[0];

  const lado = (cuenta, antes, despues) => {
    /*
     * El saldo es siempre positivo y lleva su lado aparte, así que «subir» no
     * es que crezca el número: es que crezca del lado por el que esa cuenta
     * crece. Compararlos como números sueltos daría que Aportes sociales
     * «baja» de 400.000 a 350.000 —cierto— pero por accidente: el mismo
     * criterio fallaría en una cuenta que cruza el cero.
     */
    const crece = ladoDelTriangulo(cuenta);
    const firmado = (s) => (s.lado === crece ? s.saldo : -s.saldo);
    return firmado(despues) > firmado(antes);
  };

  const antesDebito = saldoAntesDe(idTransaccion, cuentaDebito);
  const despuesDebito = saldoHasta(idTransaccion, cuentaDebito);
  const antesCredito = saldoAntesDe(idTransaccion, cuentaCredito);
  const despuesCredito = saldoHasta(idTransaccion, cuentaCredito);

  return {
    id: idTransaccion,
    enunciado: t.texto,
    debito: {
      cuenta: cuentaDebito,
      tipo: tipoDeCuenta(cuentaDebito),
      triangulo: ladoDelTriangulo(cuentaDebito),
      monto,
      antes: antesDebito.saldo,
      despues: despuesDebito.saldo,
      ladoDelSaldo: despuesDebito.lado,
      sube: lado(cuentaDebito, antesDebito, despuesDebito),
    },
    contrapartida: {
      cuenta: cuentaCredito,
      tipo: tipoDeCuenta(cuentaCredito),
      triangulo: ladoDelTriangulo(cuentaCredito),
      monto: montoCredito,
      antes: antesCredito.saldo,
      despues: despuesCredito.saldo,
      ladoDelSaldo: despuesCredito.lado,
      sube: lado(cuentaCredito, antesCredito, despuesCredito),
    },
  };
}

/** Los dos paneles de la mesa, en el orden del encargo: c a la izquierda. */
export const MESA = [panelDe(TRANSACCION_C), panelDe(TRANSACCION_F)];

/** ¿Los dos débitos son idénticos? Es la premisa entera del contraste. */
export const contrasteValido = () => {
  const [a, b] = MESA;
  return a.debito.monto === b.debito.monto && a.debito.sube !== b.debito.sube;
};

/* ═══════════════ EL CONTRAEJEMPLO ═══════════════ */

/*
 * El préstamo del ejemplo 2: entra plata y nace una deuda, y las dos suben.
 * La Caja llega con el saldo del ejemplo 1, que es del libro y no sale de
 * ninguna estructura del repo — por eso está declarado en el contenido y no
 * calculado aquí.
 */
export function contraejemplo() {
  const t = transaccionDelEjemploDos();
  if (!t) throw new Error("no está la transacción del ejemplo 2");
  const [cuentaDebito, monto] = t.asiento.debe[0];
  const [cuentaCredito, montoCredito] = t.asiento.haber[0];
  return {
    enunciado: t.texto,
    izquierda: {
      cuenta: cuentaDebito,
      triangulo: ladoDelTriangulo(cuentaDebito),
      antes: CAJA_ANTES_DEL_EJEMPLO_DOS,
      despues: CAJA_ANTES_DEL_EJEMPLO_DOS + monto,
      sube: true,
    },
    derecha: {
      cuenta: cuentaCredito,
      triangulo: ladoDelTriangulo(cuentaCredito),
      antes: 0,
      despues: montoCredito,
      sube: true,
    },
  };
}

/* ═══════════════ EL SEGMENTO DEL SALDO ═══════════════ */

/*
 * La Caja del capítulo: 1.000 y 500 al debe contra 150 al haber. La
 * cancelación se dibuja con cancelacion.js, que es la misma que usan El Saldo
 * de la Cuenta y la pieza 1 de Aprender — por valor, nunca por pares.
 */
export const CAJA_DEL_SALDO = CAJA_DEL_CAPITULO;
export const saldoDeLaCaja = () => saldoDe({
  debitos: CAJA_DEL_CAPITULO.debitos, creditos: CAJA_DEL_CAPITULO.creditos,
});

/* ═══════════════ LOS TRES CASOS DE LA OPCIÓN 3 ═══════════════ */

/*
 * La tabla que desmonta «el saldo previo predice»: dos saldos previos muy
 * distintos con el mismo resultado, y uno distinto con el opuesto. Se arma de
 * los mismos tres sitios de donde salieron antes, para que no pueda decir una
 * cosa distinta de lo que el estudiante acaba de ver.
 */
export function tresCasos() {
  const [maquinaria, aportes] = MESA;
  const ej2 = contraejemplo();
  return [
    {
      cuenta: maquinaria.debito.cuenta,
      previo: maquinaria.debito.antes,
      debito: maquinaria.debito.monto,
      resultado: maquinaria.debito.despues,
      sube: maquinaria.debito.sube,
      triangulo: maquinaria.debito.triangulo,
    },
    {
      cuenta: ej2.izquierda.cuenta,
      previo: ej2.izquierda.antes,
      debito: ej2.izquierda.despues - ej2.izquierda.antes,
      resultado: ej2.izquierda.despues,
      sube: true,
      triangulo: ej2.izquierda.triangulo,
    },
    {
      cuenta: aportes.debito.cuenta,
      previo: aportes.debito.antes,
      debito: aportes.debito.monto,
      resultado: aportes.debito.despues,
      sube: aportes.debito.sube,
      triangulo: aportes.debito.triangulo,
    },
  ];
}

/* Las dos cuentas de Caleja al cierre, para la opción «el patrimonio es negativo». */
export function ningunaEsNegativa() {
  const mayor = mayorConSaldos(CALEJA.transacciones);
  return ["Caja", "Aportes sociales"].map((n) => {
    const c = mayor.find((x) => x.cuenta === n);
    return { cuenta: n, saldo: c.saldo, lado: c.lado };
  });
}

/* La cuenta de la capa 3, con su ▲ resuelto por la regla y no escrito. */
export function cuentaExplorable(nombre) {
  const ficha = PIEZA_DEBE_Y_HABER.exploracion.cuentas.find((c) => c.cuenta === nombre);
  if (!ficha) throw new Error(`«${nombre}» no es una cuenta de la exploración`);
  const tipo = tipoDeCuenta(nombre);
  const crece = CRECE_POR[tipo];
  return {
    cuenta: nombre,
    tipo,
    triangulo: crece,
    /* El saldo inicial vive del lado por el que esa cuenta crece. */
    inicial: { valor: ficha.saldoInicial, lado: ficha.saldoInicial > 0 ? crece : null },
  };
}

export { DEBE, HABER };
