import { ESCENA_T6_A4, PASOS_T6_A4, CIERRE_T6_A4, PARADA_T6_A4 } from "../../../../data/contabilidadT6Pieza4.js";
import { T6_A4 } from "../../../../contabilidad/t6Pieza4.js";
import MaquinaPegada from "./MaquinaPegada.jsx";
import { escenaDeMomentos } from "./Momentos.jsx";

/*
 * ═══════════════════════════════════════════════════════════════════════════
 * TEMA 6 · PIEZA 4 · CAPA 2 · «MÍRELO FUNCIONAR» — El Torito y Pablo Moncayo,
 * caso a (guía de Mai v1 §3).
 *
 * Dos momentos con las tarjetas de T6 · A3; la cabecera solo lleva la fecha
 * (el cierre no da tipos). El castigo de marzo se conserva mientras la deuda
 * se revive: la Provisión pasa de [se debita] a [se acredita] y Clientes, al
 * revés. Dos etiquetas de grupo separan los asientos del momento 2. Sin
 * coral y sin ninguna cuenta de ingreso. Ningún texto vive aquí.
 * ═══════════════════════════════════════════════════════════════════════════
 */

const E = ESCENA_T6_A4;
const TODOS = [...PASOS_T6_A4, CIERRE_T6_A4];

export const MOMENTOS_ESCENA_T6_A4 = [
  {
    fecha: { id: "fecha0", texto: E.momentos[0].fecha },
    piezas: [
      { id: "castiga", tipo: "hecho", texto: E.castiga },
      { id: "provision1", tipo: "anotacion", cuenta: E.provision, movimiento: E.monto, lado: "debe" },
      { id: "clientes1", tipo: "anotacion", cuenta: E.clientes, linea: E.aNombre, movimiento: E.monto, lado: "haber" },
    ],
  },
  {
    fecha: { id: "fecha1", texto: E.momentos[1].fecha },
    piezas: [
      { id: "vuelve", tipo: "hecho", texto: E.vuelve },
      { id: "primero", tipo: "etiqueta", texto: E.primero },
      { id: "clientes2", tipo: "anotacion", cuenta: E.clientes, movimiento: E.monto, lado: "debe" },
      { id: "provision2", tipo: "anotacion", cuenta: E.provision, movimiento: E.monto, lado: "haber" },
      { id: "despues", tipo: "etiqueta", texto: E.despues },
      { id: "caja", tipo: "anotacion", cuenta: E.caja, movimiento: E.monto, lado: "debe" },
      { id: "clientes3", tipo: "anotacion", cuenta: E.clientes, movimiento: E.monto, lado: "haber" },
    ],
  },
];

const Escena = escenaDeMomentos({ momentos: MOMENTOS_ESCENA_T6_A4, estadoPaso: T6_A4.estadoPaso, reservas: T6_A4.reservas, textos: E });

export default function SiPaga() {
  /* Sin pasos juntados (hoja 7 de Mai), con la parada entre el 4 y el 5. */
  return <MaquinaPegada todos={TODOS} estadoPaso={T6_A4.estadoPaso} duracion={T6_A4.duracion} escena={Escena} parada={PARADA_T6_A4} atributos={{ "data-capa2-t6-a4": true }} />;
}
