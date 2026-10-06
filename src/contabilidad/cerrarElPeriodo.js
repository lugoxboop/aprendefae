import {
  CUENTAS_DEL_PERIODO, CUENTAS_QUE_SIGUEN, INGRESO, GASTO, TOTAL_INGRESOS, TOTAL_GASTOS,
  SEGMENTOS_CIERRE, CIERRE_TEXTO, ALTERNATIVOS_CIERRE, GANANCIAS_Y_PERDIDAS,
} from "../data/contabilidadTema3Cierre.js";

/*
 * ═══════════════════════════════════════════════════════════════════════════
 * «CERRAR EL PERIODO» — el estado de cada paso y de la capa 3, CALCULADO.
 *
 * Nada se fija a mano: Ganancias y pérdidas sale de qué cuentas están
 * vaciadas. El haber recibe los ingresos y el debe los gastos; lo que queda
 * es la resta, y solo se muestra cuando las seis están en cero.
 * ═══════════════════════════════════════════════════════════════════════════
 */

export const PASOS_CIERRE = 8;
export const CUENTAS = "cuentas";
export const DIAGRAMA = "diagrama";
export const ASIENTO = "asiento";

export const MS_VUELO = 600;
export const ESCALON_VUELO = 160;
export const MS_BAJA = 400;
export const MS_SUBE = 450;

const INGRESOS = CUENTAS_DEL_PERIODO.filter((c) => c.tipo === INGRESO).map((c) => c.cuenta);
const GASTOS = CUENTAS_DEL_PERIODO.filter((c) => c.tipo === GASTO).map((c) => c.cuenta);
export const NOMBRES_INGRESOS = INGRESOS;
export const NOMBRES_GASTOS = GASTOS;
export const TODAS = CUENTAS_DEL_PERIODO.map((c) => c.cuenta);

/*
 * Ganancias y pérdidas a partir de las cuentas vaciadas (cualquier
 * subconjunto, en cualquier orden): el haber, los ingresos vaciados; el
 * debe, los gastos vaciados. «Queda» solo con las seis.
 */
export function gananciasYPerdidas(vaciadas) {
  const v = new Set(vaciadas);
  const suma = (tipo) => CUENTAS_DEL_PERIODO.filter((c) => c.tipo === tipo && v.has(c.cuenta)).reduce((s, c) => s + c.saldo, 0);
  const haber = suma(INGRESO);
  const debe = suma(GASTO);
  const todas = TODAS.every((c) => v.has(c));
  return { debe, haber, queda: todas ? haber - debe : null };
}

/* Las filas de la zona A, con su saldo del momento (0 si está vaciada). */
export const filasDe = (vaciadas) => {
  const v = new Set(vaciadas);
  return CUENTAS_DEL_PERIODO.map((c) => ({ ...c, vaciada: v.has(c.cuenta), actual: v.has(c.cuenta) ? 0 : c.saldo }));
};

/* La zona C: siempre las mismas cinco, con los mismos saldos. */
export const cuentasQueSiguen = () => CUENTAS_QUE_SIGUEN.map((c) => ({ ...c }));

/* Los dos asientos de cierre (Xeno §4), armados con las cifras. */
export const ASIENTO_INGRESOS = {
  debe: { cuenta: "Ingresos por servicios", monto: TOTAL_INGRESOS },
  haber: { cuenta: GANANCIAS_Y_PERDIDAS, monto: TOTAL_INGRESOS },
};
export const ASIENTO_GASTOS = {
  debe: { cuenta: GANANCIAS_Y_PERDIDAS, monto: TOTAL_GASTOS, montoAbajo: true },
  haber: { partidas: CUENTAS_DEL_PERIODO.filter((c) => c.tipo === GASTO).map((c) => ({ cuenta: c.cuenta, monto: c.saldo })), monto: TOTAL_GASTOS },
};

/* El asiento como texto real, armado con las etiquetas (Xeno §8). */
export const asientoEnTexto = (a) => {
  const lado = (x) => (x.partidas ? x.partidas.map((p) => `${p.cuenta}, ${pesosTexto(p.monto)}`).join("; ") : `${x.cuenta}, ${pesosTexto(x.monto)}`);
  return `Debe: ${lado(a.debe)}. Haber: ${lado(a.haber)}.`;
};
const pesosTexto = (n) => `$${String(n).replace(/\B(?=(\d{3})+(?!\d))/g, ".")}`;

/* En la capa 2, «Queda» aparece en los pasos 7 y 8 (Xeno §3), aunque las seis ya estén en cero desde el 5. */
export const conQuedaDesde7 = (paso, g) => ({ ...g, queda: paso >= 7 ? g.queda : null });

/*
 * Cada paso, de 1 a 8. Qué cuentas están vaciadas en cada uno:
 *   1–2  ninguna · 3–4  los ingresos · 5–8  las seis.
 * El paso 8 es el cierre de Gen, con el mismo estado del 7.
 */
export function estadoPasoCierre(paso) {
  const p = Math.min(PASOS_CIERRE, Math.max(1, paso));
  const vaciadas = p >= 5 ? TODAS : p >= 3 ? INGRESOS : [];
  const modo = p === 2 ? DIAGRAMA : p === 4 || p === 6 ? ASIENTO : CUENTAS;
  return {
    paso: p,
    modo,
    vaciadas,
    filas: filasDe(vaciadas),
    gyp: conQuedaDesde7(p, gananciasYPerdidas(vaciadas)),
    asiento: p === 4 ? ASIENTO_INGRESOS : p === 6 ? ASIENTO_GASTOS : null,
    /* Lo que vuela al llegar a este paso: el ingreso en el 3, los cinco gastos en el 5. */
    vuelan: p === 3 ? INGRESOS : p === 5 ? GASTOS : [],
    texto: p <= SEGMENTOS_CIERRE.length ? SEGMENTOS_CIERRE[p - 1] : CIERRE_TEXTO,
    alternativo: ALTERNATIVOS_CIERRE[p] ?? null,
    zonaC: cuentasQueSiguen(),
  };
}

/* La capa 3: el estado sale del conjunto de cuentas vaciadas, no del orden. */
export const estadoCapa3Cierre = (vaciadas) => ({
  filas: filasDe(vaciadas),
  gyp: gananciasYPerdidas(vaciadas),
  zonaC: cuentasQueSiguen(),
});

/* La reproducción opcional: 3 000 ms + 450 ms por palabra (Xeno §6). */
export const duracionPasoCierre = (texto) => 3000 + 450 * texto.trim().split(/\s+/).length;
