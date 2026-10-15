import * as I from "../contabilidad/iconos/iconos.jsx";

/*
 * El ícono de cada actividad de Contabilidad, por id. Solo lo leen las vistas
 * de Contabilidad, que se lo pasan a cada nodo del camino (`nodo.icono`): el
 * camino compartido dibuja un ícono así únicamente si lo recibe, y Macro no
 * recibe ninguno, así que no cambia nada fuera de esta materia.
 *
 * Sin ícono, a propósito:
 *   · T1-3: no existe (retenida por revisión del profesor).
 *   · El Ciclo Completo: el desafío ya tiene su propio dibujo (el escritorio).
 */
export const ICONO_POR_ACTIVIDAD = {
  /* Tema 1 */
  "t1-desde-donde-preguntan": I.DesdeDondePreguntan,
  "t1-que-entro-y-que-salio": I.QueEntroYQueSalio,
  "t1-donde-se-rompio": I.DondeSeRompio,
  "t1-que-le-pasa-a-cada-uno": I.QueLePasaACadaUno,
  "t1-la-ecuacion-en-movimiento": I.LaEcuacionEnMovimiento,
  "t1-en-cual-estado-aparece": I.EnCualEstadoAparece,
  "t1-la-articulacion": I.LaArticulacion,
  /* Tema 2 */
  "cu-izquierda-o-derecha": I.IzquierdaODerecha,
  "cu-de-que-familia": I.DeQueFamiliaEs,
  "cu-cuadro-dinamicas": I.CuadroDeDinamicas,
  "cu-debita-o-acredita": I.SeDebitaOSeAcredita,
  "cu-saldo-de-la-cuenta": I.ElSaldoDeLaCuenta,
  "cu-arma-el-asiento": I.ArmaElAsiento,
  "cu-asiento-compuesto": I.ElAsientoCompuesto,
  /* Tema 3 */
  "t3-ingreso-o-cobro": I.IngresoOCobro,
  "t3-cuando-se-causa": I.CuandoSeCausa,
  "t3-ajuste-acumulado": I.ArmaElAjusteAcumulado,
  "t3-ajuste-diferido": I.ArmaElAjusteDiferido,
  "t3-mismo-hecho": I.ElMismoHechoDosEmpresas,
  "t3-que-le-toca": I.QueLeTocaAEstePeriodo,
  "t3-cierre-completo": I.ElCierreCompleto,
};

/** Los nodos del camino con su ícono, si lo tienen. */
export const conIcono = (nodos) => nodos.map((n) => (ICONO_POR_ACTIVIDAD[n.id] ? { ...n, icono: ICONO_POR_ACTIVIDAD[n.id] } : n));
