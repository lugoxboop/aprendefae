import { MesContable } from "./Mate.jsx";
import { movimientosDelMes } from "../../data/repasoCap5Mes.js";
import { evaluarBarranquilla, puntuarR5_4 } from "../../data/repasoCap5BarranquillaJuego.js";
import {
  R5_4, ASIENTOS_BARRANQUILLA, HOJA_BARRANQUILLA, ENTRADA_BARRANQUILLA, AVISO_BARRANQUILLA,
  DATOS_DEL_LIBRO_BARRANQUILLA, DATOS_DECLARADOS_BARRANQUILLA, ROTULOS_BARRANQUILLA,
  MES_BARRANQUILLA, LINEAS_MES_BARRANQUILLA,
} from "../../data/repasoCap5BarranquillaTextos.js";

/*
 * ═══════════════════════════════════════════════════════════════════════════
 * r5-4 «Septiembre en Barranquilla» (Célula E). Paquete e5-r5-4-v1.
 *
 * Se construye sobre r5-3: el mismo motor (MesContable de Mate.jsx), con los
 * datos de septiembre. El armador, el hecho, la hoja plegable de datos, la
 * pantalla final, los estados de comun.jsx y el panel del mes (Caja y
 * Descuento comercial condicionado) son los mismos. Lo propio de r5-4:
 *
 *   · la línea de septiembre: 30 días y nodos de 8 px (§1);
 *   · el aviso «Este ejercicio no trae IVA ni retención.» en la entrada (§2);
 *   · el bloque «DE LA OPERACIÓN DEL DÍA …» en los asientos 3 y 6 (§3);
 *   · la versión compacta del panel en los asientos 1, 3, 4 y 6.
 * ═══════════════════════════════════════════════════════════════════════════
 */

export const ACTIVIDAD_BARRANQUILLA = {
  id: "r5-4",
  R5_3: R5_4,
  MES_MATE: MES_BARRANQUILLA,
  MOVIMIENTOS_MATE: movimientosDelMes(ASIENTOS_BARRANQUILLA, MES_BARRANQUILLA.cuentas),
  ASIENTOS_MATE: ASIENTOS_BARRANQUILLA,
  HOJA_MATE: HOJA_BARRANQUILLA,
  ENTRADA_MATE: ENTRADA_BARRANQUILLA,
  DATOS_DEL_LIBRO: DATOS_DEL_LIBRO_BARRANQUILLA,
  DATOS_DECLARADOS: DATOS_DECLARADOS_BARRANQUILLA,
  RM: ROTULOS_BARRANQUILLA,
  evaluarMate: evaluarBarranquilla,
  puntuarR5_3: puntuarR5_4,
  MES_CORTO: "SEP",
  DIAS: 30,
  NODO: 8,
  AVISO: AVISO_BARRANQUILLA,
  LINEAS_MES: LINEAS_MES_BARRANQUILLA,
};

export function Barranquilla(props) {
  return <MesContable actividad={ACTIVIDAD_BARRANQUILLA} {...props} />;
}
