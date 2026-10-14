import { ESCENA_T6_A3, PASOS_T6_A3, CIERRE_T6_A3 } from "../../../../data/contabilidadT6Pieza3.js";
import { T6_A3 } from "../../../../contabilidad/t6Pieza3.js";
import MaquinaPegada from "./MaquinaPegada.jsx";
import { escenaDeMomentos } from "./Momentos.jsx";

/*
 * ═══════════════════════════════════════════════════════════════════════════
 * TEMA 6 · PIEZA 3 · CAPA 2 · «MÍRELO FUNCIONAR» — la provisión de El Torito
 * en tres momentos (guía de Mai v1 §4, anexo v1b).
 *
 * «Se crea», «Se usa» y «Se corrige»; un momento pasado conserva su asiento.
 * En el primero, el bloque del estado de situación financiera: Clientes, la
 * provisión que se resta y, bajo un filete, el valor neto. Sin coral: una
 * provisión corta no es un error. La escena de momentos, la reserva de alto y
 * el bloque pegado son los de Momentos.jsx y MaquinaPegada.jsx. Ningún texto
 * vive aquí.
 * ═══════════════════════════════════════════════════════════════════════════
 */

const E = ESCENA_T6_A3;
const TODOS = [...PASOS_T6_A3, CIERRE_T6_A3];
const fecha = (i) => ({ id: `fecha${i}`, texto: E.momentos[i].fecha });

export const MOMENTOS_ESCENA_T6_A3 = [
  {
    fecha: fecha(0),
    tipo: E.momentos[0].tipo,
    piezas: [
      { id: "deben", tipo: "dosLineas", l1: E.deben, l2: E.saldoClientes },
      { id: "parte", tipo: "nota", texto: E.parte },
      { id: "gasto1", tipo: "anotacion", cuenta: E.gasto, movimiento: E.provision1, lado: "debe" },
      { id: "provision1", tipo: "anotacion", cuenta: E.provision, movimiento: E.provision1, lado: "haber" },
      { id: "utilidad", tipo: "nota", texto: E.utilidad },
      {
        id: "bloque", tipo: "bloque", titulo: E.estado,
        filas: [{ id: "filaClientes", nombre: E.clientes, valor: E.saldoClientes }, { id: "filaProvision", nombre: E.provision, valor: E.menos }],
        neto: { id: "filaNeto", nombre: E.neto, valor: E.valorNeto },
      },
    ],
  },
  {
    fecha: fecha(1),
    tipo: E.momentos[1].tipo,
    piezas: [
      { id: "perdida", tipo: "hecho", texto: E.perdida },
      { id: "provision2", tipo: "anotacion", cuenta: E.provision, movimiento: E.castigo, lado: "debe" },
      { id: "clientes2", tipo: "anotacion", cuenta: E.clientes, linea: E.aNombre, movimiento: E.castigo, lado: "haber" },
      { id: "subestimada", tipo: "nota", texto: E.subestimada },
    ],
  },
  {
    fecha: fecha(2),
    tipo: E.momentos[2].tipo,
    piezas: [
      { id: "analisis", tipo: "hecho", texto: E.analisis },
      { id: "pide", tipo: "nota", texto: E.pide },
      { id: "suman", tipo: "nota", texto: E.suman },
      { id: "gasto3", tipo: "anotacion", cuenta: E.gasto, movimiento: E.ajuste, lado: "debe" },
      { id: "provision3", tipo: "anotacion", cuenta: E.provision, movimiento: E.ajuste, lado: "haber" },
      { id: "queda", tipo: "nota", texto: E.queda },
    ],
  },
];

const Escena = escenaDeMomentos({ momentos: MOMENTOS_ESCENA_T6_A3, estadoPaso: T6_A3.estadoPaso, reservas: T6_A3.reservas, textos: E });

export default function LaProvision() {
  return <MaquinaPegada todos={TODOS} estadoPaso={T6_A3.estadoPaso} duracion={T6_A3.duracion} escena={Escena} atributos={{ "data-capa2-t6-a3": true }} />;
}
