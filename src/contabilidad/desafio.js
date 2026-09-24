import { BASE_POR_DIFICULTAD, TOPE_ETAPAS } from "../fp/motor.js";
import {
  DEBE, HABER, LAVADO_DE_AUTOS, UBICACION_ESF, SECCIONES_ESF,
  mayorConSaldos, estadoDeSituacion, tipoDeCuenta, pesos,
} from "../data/contabilidad.js";
import { DESAFIO, SALDO_DE_LA_CUENTA, MAYORIZACION } from "../data/contabilidadActividades.js";
import {
  ETAPA_DIARIO, ETAPA_MAYOR, ETAPA_SALDOS, ETAPA_ESTADO, RAZON_POR_SECCION,
} from "../data/contabilidadDesafio.js";

/*
 * ═══════════════════════════════════════════════════════════════════════════
 * LA CUENTA Y LOS JUICIOS DE «EL CICLO COMPLETO».
 *
 * Aparte de los componentes por la misma razón que la del Arca y la de NOVA:
 * para poder medirla sin montar la interfaz. Que el desafío valga 360 no
 * puede ser un número escrito en un comentario.
 *
 * ═══════════ TODO SE CALCULA DE LAS NUEVE TRANSACCIONES ═══════════
 *
 * El mayor de la etapa 2, los once saldos de la etapa 3 y el estado de la
 * etapa 4 NO están escritos en ninguna parte: salen de mayorizar el mismo
 * diario del capítulo. Por eso el desafío no puede contradecir a las doce
 * actividades del camino, que leen de ese mismo sitio.
 * ═══════════════════════════════════════════════════════════════════════════
 */

export const ACTIVIDAD = DESAFIO.id;

export const TOTAL_PUNTOS =
  BASE_POR_DIFICULTAD[DESAFIO.dificultad] * Math.min(DESAFIO.etapas, TOPE_ETAPAS);

export const PUNTOS_POR_ETAPA = DESAFIO.pesos.map((e) => ({
  ...e, puntos: Math.round(TOTAL_PUNTOS * e.peso),
}));

export function puntosDeEtapa(indice, pct) {
  const etapa = PUNTOS_POR_ETAPA[indice];
  if (!etapa) return 0;
  return (etapa.puntos * Math.max(0, Math.min(100, pct ?? 0))) / 100;
}

export function puntuarDesafio(resultados) {
  const porEtapa = PUNTOS_POR_ETAPA.map((etapa, i) => {
    const pct = resultados?.[i];
    const jugada = typeof pct === "number" && Number.isFinite(pct);
    return { ...etapa, pct: jugada ? Math.max(0, Math.min(100, pct)) : null, obtenidos: jugada ? puntosDeEtapa(i, pct) : 0 };
  });
  const puntos = porEtapa.reduce((s, e) => s + e.obtenidos, 0);
  return { porEtapa, puntos: Math.round(puntos), pct: Math.round((puntos / TOTAL_PUNTOS) * 100) };
}

/* Lo que cada etapa tiene delante, todo derivado del diario. */
export const TRANSACCIONES = LAVADO_DE_AUTOS.transacciones;
export const MAYOR = mayorConSaldos(TRANSACCIONES);
export const ESTADO = estadoDeSituacion(MAYOR);

/** Los 22 movimientos del diario, en orden, cada uno con su destino. */
export const MOVIMIENTOS = TRANSACCIONES.flatMap((t) => [
  ...t.asiento.debe.map(([cuenta, valor]) => ({ id: `${t.id}:${cuenta}`, transaccion: t.id, fecha: t.fecha, cuenta, valor, lado: DEBE })),
  ...t.asiento.haber.map(([cuenta, valor]) => ({ id: `${t.id}:${cuenta}`, transaccion: t.id, fecha: t.fecha, cuenta, valor, lado: HABER })),
]);

/* Las once cuentas, en el orden en que el diario las va abriendo. */
export const CUENTAS = MAYOR.map((c) => c.cuenta);

/* ═══════════════════════ ETAPA 1 · EL LIBRO DIARIO ═══════════════════════ */

const comoMapa = (asiento) => {
  const m = new Map();
  for (const lado of ["debe", "haber"]) {
    for (const [cuenta, valor] of asiento[lado]) m.set(cuenta, { lado: lado === "debe" ? DEBE : HABER, valor });
  }
  return m;
};

export const balanceDe = (asiento) => {
  const debe = asiento.debe.reduce((s, [, v]) => s + v, 0);
  const haber = asiento.haber.reduce((s, [, v]) => s + v, 0);
  return { debe, haber, descuadre: Math.abs(debe - haber), cuadra: debe === haber };
};

/** ¿El asiento armado es el de la transacción? Mismas cuentas, mismos lados, mismas cifras. */
export function asientoCorrecto(armado, esperado) {
  const a = comoMapa(armado); const e = comoMapa(esperado);
  if (a.size !== e.size) return false;
  for (const [cuenta, { lado, valor }] of e) {
    const suyo = a.get(cuenta);
    if (!suyo || suyo.lado !== lado || suyo.valor !== valor) return false;
  }
  return true;
}

/*
 * Cuál de las confusiones escritas explica ESTE intento. Se recorren en el
 * orden de la ficha: cuando dos aplican a la vez —en ene-03 se puede haber
 * unido el edificio con el terreno Y no haber desglosado el pago— gana la que
 * la ficha nombra primero.
 */
function confusionDe(transaccionId, armado, esperado) {
  const a = comoMapa(armado); const e = comoMapa(esperado);
  const candidatas = ETAPA_DIARIO.errores.filter((x) => x.transaccion === transaccionId);

  for (const c of candidatas) {
    const q = c.cuando;
    if (q.uso && q.enVezDe) {
      if (a.has(q.uso) && !e.has(q.uso) && e.has(q.enVezDe) && !a.has(q.enVezDe)) return c;
    } else if (q.falta) {
      if (e.has(q.falta) && !a.has(q.falta)) return c;
    } else if (q.cuenta && q.enElLado) {
      const suyo = a.get(q.cuenta);
      const debido = e.get(q.cuenta);
      if (suyo && debido && suyo.lado === q.enElLado && debido.lado !== q.enElLado) return c;
    } else if (q.cifraDistintaDe) {
      const suyo = a.get(q.cifraDistintaDe);
      const debido = e.get(q.cifraDistintaDe);
      if (suyo && debido && suyo.valor !== debido.valor) return c;
    } else if (q.usoTipo) {
      for (const cuenta of a.keys()) {
        if (!e.has(cuenta) && tipoDeCuenta(cuenta) === q.usoTipo) return c;
      }
    }
  }
  return null;
}

export function evaluarAsiento(transaccion, armado) {
  const esperado = transaccion.asiento;
  const b = balanceDe(armado);
  if (asientoCorrecto(armado, esperado)) {
    return { ok: true, texto: ETAPA_DIARIO.acierto.replace(/\{total\}/g, pesos(b.debe)) };
  }
  const c = confusionDe(transaccion.id, armado, esperado);
  if (c) return { ok: false, texto: c.texto, confusion: c.id };
  if (!b.cuadra) {
    return {
      ok: false,
      texto: ETAPA_DIARIO.descuadre
        .replace(/\{debe\}/g, pesos(b.debe))
        .replace(/\{haber\}/g, pesos(b.haber))
        .replace(/\{descuadre\}/g, pesos(b.descuadre)),
    };
  }
  return { ok: false, texto: ETAPA_DIARIO.cuadraPeroNoEs };
}

/* ═══════════════════════ ETAPA 2 · LA MAYORIZACIÓN ═══════════════════════ */

/*
 * Los cuatro patrones son los de CU-11 y se leen de allí: la ficha del
 * desafío dice «aplica los cuatro patrones de CU-11» y eso es exactamente lo
 * que se hace. Escribirlos otra vez sería una segunda copia.
 */
export function evaluarMovimiento(movimiento, { cuenta, lado }) {
  const e = MAYORIZACION.errores;
  if (cuenta === movimiento.cuenta && lado === movimiento.lado) return { ok: true, texto: ETAPA_MAYOR.acierto };
  if (cuenta === movimiento.cuenta) return { ok: false, texto: e.ladoContrario };
  return { ok: false, texto: e.cuentaEquivocada.replace(/\{cuenta\}/g, movimiento.cuenta) };
}

/* ═══════════════════════ ETAPA 3 · LOS SALDOS ═══════════════════════ */

/* Los cuatro patrones son los de CU-5, por la misma razón. */
export function evaluarSaldo(cuenta, { cifra, lado }) {
  const e = SALDO_DE_LA_CUENTA.errores;
  const cifraOk = cifra === cuenta.saldo;
  const ladoOk = lado === cuenta.lado;
  const movimiento = cuenta.lado === DEBE ? "débito" : "crédito";

  const rellenar = (t) => t
    .replace(/\{saldo\}/g, pesos(cuenta.saldo))
    .replace(/\{lado\}/g, cuenta.lado === DEBE ? "debe" : "haber")
    .replace(/\{Lado\}/g, cuenta.lado === DEBE ? "Debe" : "Haber")
    .replace(/\{debito\}/g, pesos(cuenta.debito))
    .replace(/\{credito\}/g, pesos(cuenta.credito))
    .replace(/\{movimiento\}/g, movimiento);

  if (cifraOk && ladoOk) return { ok: true, cifraOk, ladoOk, texto: rellenar(ETAPA_SALDOS.acierto) };
  if (cifra === cuenta.debito + cuenta.credito) return { ok: false, cifraOk, ladoOk, texto: rellenar(e.sumo) };
  if (cifra !== null && cifra < 0) return { ok: false, cifraOk, ladoOk, texto: rellenar(e.restoAlReves) };
  if (cifraOk && !ladoOk) return { ok: false, cifraOk, ladoOk, texto: rellenar(e.ladoEquivocado) };
  if (!cifraOk && !ladoOk) return { ok: false, cifraOk, ladoOk, texto: rellenar(e.ladoMenor) };
  return { ok: false, cifraOk, ladoOk, texto: rellenar(e.restoAlReves) };
}

/* ═══════════ ETAPA 4 · EL ESTADO DE SITUACIÓN FINANCIERA ═══════════ */

const NOMBRE_SECCION = Object.fromEntries(SECCIONES_ESF.map((s) => [s.id, s.nombre]));

export function evaluarUbicacion(cuenta, seccion) {
  const debida = UBICACION_ESF[cuenta];
  const e = ETAPA_ESTADO.errores;
  if (seccion === debida) {
    return {
      ok: true,
      texto: ETAPA_ESTADO.acierto
        .replace(/\{cuenta\}/g, cuenta)
        .replace(/\{seccion\}/g, NOMBRE_SECCION[debida].toLowerCase())
        .replace(/\{razon\}/g, RAZON_POR_SECCION[debida]),
    };
  }
  if (debida === "patrimonio" && seccion.startsWith("pasivo")) return { ok: false, texto: e.accionesEnPasivo };
  if (debida === "pasivo-no-corriente" && seccion === "pasivo-corriente") return { ok: false, texto: e.hipotecaEnCorriente };
  if (debida === "pasivo-corriente" && seccion === "pasivo-no-corriente") return { ok: false, texto: e.letrasEnNoCorriente };
  if (debida === "activo-corriente" && seccion === "activo-no-corriente") return { ok: false, texto: e.efectivoEnNoCorriente };
  if (debida === "activo-no-corriente" && seccion === "activo-corriente") return { ok: false, texto: e.noCorrienteEnCorriente };
  /*
   * Lo que queda son saltos entre familias —un activo en el patrimonio, un
   * pasivo en el activo—. La ficha no los nombra uno a uno; la línea del
   * descuadre sí los cubre, porque es exactamente lo que provocan.
   */
  return {
    ok: false,
    texto: e.noCuadra
      .replace(/\{activos\}/g, pesos(ESTADO.activos))
      .replace(/\{pasivosMasPatrimonio\}/g, pesos(ESTADO.pasivosMasPatrimonio)),
  };
}

/** El porcentaje de una etapa de ítems iguales. */
export const pctDeItems = (aciertos, total) => (total > 0 ? (aciertos / total) * 100 : 0);
