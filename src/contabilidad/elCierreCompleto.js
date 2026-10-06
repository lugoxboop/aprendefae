import { DEBE, HABER } from "../data/contabilidad.js";
import { GYP, INGRESO, GASTO, NO_SE_CIERRA, ERRORES_ACT7 } from "../data/contabilidadTema3Act7.js";

/*
 * ═══════════════════════════════════════════════════════════════════════════
 * TEMA 3 · ACT. 7 · EL CIERRE COMPLETO — la evaluación (paquete de Levi).
 *
 * Por caso, tres partes en secuencia, un intento por parte, sin puntos
 * parciales:
 *   1  asiento 1: los ingresos al debe, Ganancias y pérdidas al haber
 *   2  asiento 2: Ganancias y pérdidas al debe, los gastos al haber
 *   3  el saldo que queda en Ganancias y pérdidas
 *
 * Cuando se cumple más de un error manda el más estructural: una cuenta que
 * no se cierra (D), el asiento al revés (C), una cuenta que falta (A) y,
 * con todas las cuentas en su lado, un valor mal escrito (B). En el saldo
 * solo cabe B.
 * ═══════════════════════════════════════════════════════════════════════════
 */

export const PARTES = 3;
export const POR_CASO = 3;

const cuentasDe = (caso, tipo) => caso.cuentas.filter((c) => c.tipo === tipo);

/* Lo correcto de cada asiento: [{ cuenta, lado, valor }]. */
export function esperadoDe(caso, parte) {
  if (parte === 1) {
    return [
      ...cuentasDe(caso, INGRESO).map((c) => ({ cuenta: c.cuenta, lado: DEBE, valor: c.saldo })),
      { cuenta: GYP, lado: HABER, valor: caso.asiento1 },
    ];
  }
  return [
    { cuenta: GYP, lado: DEBE, valor: caso.asiento2 },
    ...cuentasDe(caso, GASTO).map((c) => ({ cuenta: c.cuenta, lado: HABER, valor: c.saldo })),
  ];
}

/* Lo que trae el estante: todas las cuentas del caso y «Ganancias y pérdidas», una vez. */
export const estanteDe = (caso) => [...caso.cuentas.map((c) => c.cuenta), GYP];
export const saldoDe = (caso, cuenta) => caso.cuentas.find((c) => c.cuenta === cuenta)?.saldo ?? null;
export const tipoDe = (caso, cuenta) => (cuenta === GYP ? GYP : caso.cuentas.find((c) => c.cuenta === cuenta)?.tipo ?? null);

/*
 * Un asiento armado: `puestas` es [{ cuenta, lado, valor }]. Una cuenta del
 * otro grupo (un gasto en el asiento 1, un ingreso en el 2) también es
 * «al revés»: el texto C dice por dónde pasa cada grupo.
 */
export function evaluarAsiento(caso, parte, puestas) {
  const esperado = esperadoDe(caso, parte);
  const real = new Map(esperado.map((e) => [e.cuenta, e]));
  const otroGrupo = parte === 1 ? GASTO : INGRESO;
  let error = null;
  if (puestas.some((p) => tipoDe(caso, p.cuenta) === NO_SE_CIERRA)) error = "D";
  else if (puestas.some((p) => (real.has(p.cuenta) && real.get(p.cuenta).lado !== p.lado) || tipoDe(caso, p.cuenta) === otroGrupo)) error = "C";
  else if (esperado.some((e) => !puestas.some((p) => p.cuenta === e.cuenta))) error = "A";
  else if (puestas.some((p) => p.valor !== real.get(p.cuenta).valor)) error = "B";
  return { ok: error === null, error, texto: error ? ERRORES_ACT7[error] : null, esperado };
}

export function evaluarSaldo(caso, valor) {
  const ok = valor === caso.saldo;
  return { ok, error: ok ? null : "B", texto: ok ? null : ERRORES_ACT7.B };
}

/* Los totales de una mesa (los colectores). */
export const totalesDe = (puestas) => ({
  debe: puestas.filter((p) => p.lado === DEBE).reduce((s, p) => s + (p.valor ?? 0), 0),
  haber: puestas.filter((p) => p.lado === HABER).reduce((s, p) => s + (p.valor ?? 0), 0),
});

/* Bien a la primera, sobre las 6 partes (3 por caso). */
export const puntuarAct7 = (resultados, totalPartes) => (totalPartes ? (resultados.filter((r) => r.ok).length / totalPartes) * 100 : 0);

/* Los campos: punto de miles automático, sin decimales, hasta 8 dígitos (las cifras de La Servicial). */
export const MAX_DIGITOS_ACT7 = 8;
export function formatearCifra(texto) {
  const d = String(texto ?? "").replace(/\D/g, "").replace(/^0+(?=\d)/, "").slice(0, MAX_DIGITOS_ACT7);
  return d.replace(/\B(?=(\d{3})+(?!\d))/g, ".");
}
export const leerCifra = (texto) => {
  const d = String(texto ?? "").replace(/\D/g, "");
  return d === "" ? null : Number(d);
};

/* Para el panel docente: la parte de un id «caso:parte», con su empresa delante. */
export const hechoDeParte = (casos) => (id) => {
  const [casoId, parte] = String(id).split(":");
  const caso = casos.find((c) => c.id === casoId);
  if (!caso) return null;
  const nombre = { 1: "asiento 1", 2: "asiento 2", 3: "saldo" }[parte] ?? "";
  return `${caso.empresa} · ${nombre}`;
};
