import { DEBE, HABER, CRECE_POR, tipoDeCuenta, LAVADO_DE_AUTOS, CALEJA } from "../data/contabilidad.js";
import { COMPUESTAS_SUELTAS } from "../data/contabilidadActividades.js";
import {
  ITEMS, POR_PARTIDA, ANCLAJES, ACIERTO_POR_ITEM, ACIERTO_GENERAL,
  ERROR_A, ERROR_B, ERROR_C_POR_ITEM, ERROR_D,
} from "../data/contabilidadAsientoCompuesto.js";

/*
 * ═══════════════════════════════════════════════════════════════════════════
 * A7 · EL ASIENTO COMPUESTO — la lógica.
 *
 * Lo que cuadra son los TOTALES, no las parejas. Por eso no hay arcos de una
 * cuenta a otra: hay dos colectores —uno por columna— y un solo conector entre
 * ellos, que cierra cuando las dos sumas coinciden.
 * ═══════════════════════════════════════════════════════════════════════════
 */

const CASOS = { caleja: CALEJA.transacciones, lavado: LAVADO_DE_AUTOS.transacciones };

export function transaccionDe(item) {
  const id = item.suelta ?? item.transaccion;
  const lista = item.suelta ? COMPUESTAS_SUELTAS : CASOS[item.caso];
  const t = lista?.find((x) => x.id === id);
  if (!t) throw new Error(`${item.id}: no existe la transacción «${id}»`);
  return t;
}

/** Un ítem montado: sus cuentas con lado, valor, ▲ y anclaje. */
export function montar(item) {
  const t = transaccionDe(item);
  const clave = item.suelta ?? item.transaccion;
  const anclajes = ANCLAJES[clave];
  if (!anclajes) throw new Error(`${item.id}: faltan los anclajes de «${clave}»`);

  const cuentas = [
    ...t.asiento.debe.map(([cuenta, valor]) => ({ cuenta, valor, lado: DEBE })),
    ...t.asiento.haber.map(([cuenta, valor]) => ({ cuenta, valor, lado: HABER })),
  ].map((c) => ({
    ...c,
    creceP: CRECE_POR[tipoDeCuenta(c.cuenta)],
    sube: CRECE_POR[tipoDeCuenta(c.cuenta)] === c.lado,
    ancla: anclajes[c.cuenta] ?? null,
  }));
  for (const c of cuentas) {
    if (!c.ancla) throw new Error(`${item.id}: «${c.cuenta}» se mueve y no tiene anclaje`);
  }

  const total = (lado) => cuentas.filter((c) => c.lado === lado).reduce((s, c) => s + c.valor, 0);
  const totalDebe = total(DEBE);
  const totalHaber = total(HABER);
  if (totalDebe !== totalHaber) throw new Error(`${item.id}: el asiento del capítulo no cuadra`);

  /*
   * ¿Entran DOS COSAS DISTINTAS POR EL DEBE? Se DEDUCE del asiento, no se cree
   * lo que dice el banco — y una prueba compara las dos cosas.
   *
   * Por el debe y no «por algún lado»: dos cuentas en el HABER son un activo
   * pagado de dos formas, que es otra cosa. En este banco el haber de tres de
   * los cinco tiene dos cuentas, y ninguno de esos tres permite la confusión
   * que este campo marca.
   */
  const dosPorLado = cuentas.filter((c) => c.lado === DEBE).length > 1;

  return { ...item, transaccion: t, texto: t.texto, cuentas, anclajes, totalDebe, totalHaber, dosPorLado };
}

export const ASIENTOS = ITEMS.map(montar);
export { POR_PARTIDA };

/** Los que hacen producible la confusión de fundir dos cuentas del DEBE. */
export const CON_FUSION_POSIBLE = ASIENTOS
  .filter((a) => a.cuentas.filter((c) => c.lado === DEBE).length > 1)
  .map((a) => a.id);

/*
 * ═══════════════════════════════════════════════════════════════════════════
 * EL SORTEO ESTRATIFICADO
 *
 * De los tres que salen, al menos uno tiene que ser de los dos donde entran
 * dos cosas distintas por el DEBE. Sin esa garantía, un intento entero podría
 * no permitir cometer la segunda confusión del objetivo — y entonces la
 * actividad no mediría lo que dice medir.
 * ═══════════════════════════════════════════════════════════════════════════
 */
export function sortearEstratificado(barajar, asientos = ASIENTOS, cuantos = POR_PARTIDA) {
  const conFusion = asientos.filter((a) => CON_FUSION_POSIBLE.includes(a.id));
  const resto = asientos.filter((a) => !CON_FUSION_POSIBLE.includes(a.id));
  if (conFusion.length === 0) {
    throw new Error("ningún asiento del banco permite fundir dos cuentas del debe");
  }
  const elegido = barajar(conFusion)[0];
  const demas = barajar([...conFusion.filter((a) => a.id !== elegido.id), ...resto]).slice(0, cuantos - 1);
  return barajar([elegido, ...demas]);
}

/*
 * ═══════════════════════════════════════════════════════════════════════════
 * LA DETECCIÓN DE CUENTAS FUNDIDAS
 *
 * Regla aritmética exacta: existe una cuenta colocada P cuyo valor es la suma
 * de dos cuentas correctas C1 y C2 DEL MISMO LADO, de las cuales exactamente
 * una está ausente de la mesa.
 *
 * ═══════════ Y SOLO CUENTA EN EL DEBE ═══════════
 *
 * En el haber de este banco, dos cuentas del mismo lado son «un activo pagado
 * de dos formas» —parte en cheque, parte a crédito—. Fundirlas ahí no es
 * «fundiste dos activos»: es «no dividiste el pago», que es otro error y tiene
 * su propia explicación. Si se disparara C ahí, se le diría al estudiante algo
 * que no hizo.
 * ═══════════════════════════════════════════════════════════════════════════
 */
export function detectarFusion(asiento, puestas) {
  const correctasDebe = asiento.cuentas.filter((c) => c.lado === DEBE);
  if (correctasDebe.length < 2) return null;
  const nombres = new Set(puestas.map((p) => p.cuenta));

  for (const p of puestas) {
    if (p.valor == null) continue;
    for (let i = 0; i < correctasDebe.length; i += 1) {
      for (let j = i + 1; j < correctasDebe.length; j += 1) {
        const c1 = correctasDebe[i];
        const c2 = correctasDebe[j];
        if (p.valor !== c1.valor + c2.valor) continue;
        const presentes = [c1, c2].filter((c) => nombres.has(c.cuenta)).length;
        /* Exactamente una de las dos está en la mesa: la otra se fundió. */
        if (presentes === 1) return { cuenta: p.cuenta, funde: [c1.cuenta, c2.cuenta] };
      }
    }
  }
  return null;
}

export const PATRON_A = "A";
export const PATRON_B = "B";
export const PATRON_C = "C";
export const PATRON_D = "D";

const pesos = (n) => `$${n.toLocaleString("es-CO")}`;

/*
 * La devolución, con la prioridad de la ficha: C > B > A > D.
 *
 *   C  fundió dos cuentas — tiene firma aritmética exacta, y «fundiste dos»
 *      es mejor diagnóstico que «te falta una».
 *   B  metió una cuenta que no participa — es la única sin línea.
 *   A  faltan cuentas: el conector no cierra y la diferencia es lo que falta.
 *   D  las cuentas son las correctas y lo que falla es la aritmética.
 *
 * `puestas` es [{ cuenta, lado, valor }].
 */
export function evaluar(asiento, puestas) {
  const real = new Map(asiento.cuentas.map((c) => [c.cuenta, c]));
  const hechas = puestas.filter((p) => p.cuenta && p.lado && p.valor != null && p.valor > 0);

  const totalDe = (lado) => hechas.filter((p) => p.lado === lado).reduce((s, p) => s + p.valor, 0);
  const totalDebe = totalDe(DEBE);
  const totalHaber = totalDe(HABER);
  const cierra = totalDebe > 0 && totalDebe === totalHaber;
  const diferencia = Math.abs(totalDebe - totalHaber);

  /* Las cuatro cuartas partes de la nota de este asiento. */
  const cuentasEsperadas = asiento.cuentas.length;
  const nombresOk = hechas.filter((p) => real.has(p.cuenta)).length === cuentasEsperadas
    && hechas.length === cuentasEsperadas;
  const zonaOk = nombresOk && hechas.every((p) => p.lado === real.get(p.cuenta).lado);
  const ladosOk = zonaOk;
  const valoresOk = nombresOk && hechas.every((p) => p.valor === real.get(p.cuenta).valor);
  /* «Número de cuentas y su zona» es la primera cuarta parte. */
  const cuantasOk = hechas.length === cuentasEsperadas;

  const perfecto = nombresOk && ladosOk && valoresOk;

  const fusion = detectarFusion(asiento, hechas);
  const ajena = hechas.find((p) => !real.has(p.cuenta));
  const faltan = asiento.cuentas.filter((c) => !hechas.some((p) => p.cuenta === c.cuenta));

  let patron = null;
  let texto = ACIERTO_POR_ITEM[asiento.id]
    ?? ACIERTO_GENERAL
      .replace(/\{total\}/g, pesos(asiento.totalDebe))
      .replace("{cuentas}", String(cuentasEsperadas));

  if (!perfecto) {
    if (fusion) {
      patron = PATRON_C;
      texto = ERROR_C_POR_ITEM[asiento.id] ?? ERROR_A;
    } else if (ajena) {
      patron = PATRON_B;
      texto = ERROR_B.replace("{cuenta}", ajena.cuenta);
    } else if (faltan.length > 0) {
      patron = PATRON_A;
      texto = ERROR_A;
    } else {
      patron = PATRON_D;
      texto = ERROR_D.replace("{debe}", pesos(totalDebe)).replace("{haber}", pesos(totalHaber));
    }
  }

  return {
    texto, patron, perfecto, cierra, diferencia, totalDebe, totalHaber, real,
    cuantasOk, nombresOk, ladosOk, valoresOk,
    fusion,
    sinAncla: ajena?.cuenta ?? null,
    /* Las frases de cada cuenta puesta; la fundida se lleva las dos. */
    anclasDe: (cuenta) => {
      if (fusion && fusion.cuenta === cuenta) {
        return fusion.funde.map((c) => asiento.anclajes[c]).filter(Boolean);
      }
      const una = asiento.anclajes[cuenta];
      return una ? [una] : [];
    },
  };
}

/*
 * ═══════════ EL PUNTAJE ═══════════
 *
 * Tres asientos, un tercio cada uno. Y dentro de cada asiento, cuatro cuartas
 * partes: cuántas cuentas y en qué columna, los nombres, los lados y los
 * valores escritos.
 */
export const CUARTOS = ["cuantasOk", "nombresOk", "ladosOk", "valoresOk"];

export function notaDelAsiento(r) {
  return CUARTOS.filter((k) => r[k]).length / CUARTOS.length;
}

export function puntuar(notas, cuantos = POR_PARTIDA) {
  if (!cuantos) return 0;
  return (notas.reduce((s, n) => s + n, 0) / cuantos) * 100;
}

export const pesoDeCadaAsiento = (cuantos = POR_PARTIDA) => (cuantos ? 100 / cuantos : 0);

/* El estante: las cuentas del asiento más señuelos del mismo capítulo. */
export const UNIVERSO = [...new Set(ASIENTOS.flatMap((a) => a.cuentas.map((c) => c.cuenta)))];
export const CUANTAS_EN_ESTANTE = 7;

export function estanteDe(asiento, mezclar = (x) => x) {
  const correctas = asiento.cuentas.map((c) => c.cuenta);
  const estante = [...correctas];
  for (const c of mezclar(UNIVERSO)) {
    if (estante.length >= Math.max(CUANTAS_EN_ESTANTE, correctas.length + 2)) break;
    if (!estante.includes(c)) estante.push(c);
  }
  return mezclar(estante);
}

/* Qué transacción era cada id, para el panel docente. */
export const textoDeItem = (id) => ASIENTOS.find((a) => a.id === id)?.texto ?? null;
