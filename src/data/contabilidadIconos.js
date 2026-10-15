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
  /* Tema 7 · Inventarios I */
  "t7-1-que-cuenta-se-mueve": I.QueCuentaSeMueve,
  "t7-1-arma-la-factura": I.ArmaLaFactura,
  "t7-1-cuanto-vale-lo-que-sobro": I.CuantoValeLoQueSobro,
  "t7-1-cierra-el-mes": I.CierraElMes,
  "t7-1-costo-o-gasto": I.CostoOGasto,
  "t7-1-devolucion-dos-libros": I.LaDevolucionEnDosLibros,
  "t7-1-que-control-falta": I.QueControlFalta,
  /* Tema 7 · Inventarios III */
  "t7-3-descuento-en-factura": I.DescuentoEnLaFactura,
  "t7-3-cadena-de-descuentos": I.LaCadenaDeDescuentos,
  "t7-3-comercial-o-condicionado": I.ComercialOCondicionado,
  "t7-3-pago-a-tiempo": I.PagoATiempo,
  "t7-3-ajuste-por-conteo": I.AjustePorConteo,
  "t7-3-que-entra-al-costo": I.EntraAlCosto,
  "t7-3-costo-o-vnr": I.CostoOValorNetoRealizable,
  /* Tema 7 · Inventarios II */
  "t7-2-debe-o-haber": I.DebeOHaber,
  "t7-2-dos-asientos": I.ArmaLosDosAsientos,
  "t7-2-llena-el-kardex": I.LlenaElKardex,
  "t7-2-periodico-o-permanente": I.PeriodicoOPermanente,
  "t7-2-flete-y-devolucion": I.FleteYDevolucion,
};

/** Los nodos del camino con su ícono, si lo tienen. */
export const conIcono = (nodos) => nodos.map((n) => (ICONO_POR_ACTIVIDAD[n.id] ? { ...n, icono: ICONO_POR_ACTIVIDAD[n.id] } : n));
