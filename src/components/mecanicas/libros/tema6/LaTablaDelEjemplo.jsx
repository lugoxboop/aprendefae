import {
  ESCENA_T6_A5, PASOS_T6_A5, CIERRE_T6_A5, GRUPOS_T6_A5, ROTULO_SIMULADO_T6_A5,
} from "../../../../data/contabilidadT6Pieza5.js";
import { T6_A5, pegarPorcentaje } from "../../../../contabilidad/t6Pieza5.js";
import MaquinaPegada from "./MaquinaPegada.jsx";
import { escenaDeMomentos } from "./Momentos.jsx";
import { PieDeFuente } from "./FuentesT6A5.jsx";

/*
 * ═══════════════════════════════════════════════════════════════════════════
 * TEMA 6 · PIEZA 5 · CAPA 2 · «MÍRELO FUNCIONAR» — cómo se calcula la
 * provisión, con la tabla del ejemplo en el centro (guía de Mai v1 §5).
 *
 * Un solo momento, el del cierre: lo que deben los clientes; la tabla
 * (el rótulo fijo, los cuatro grupos y la suma); el gasto y la provisión; el
 * valor neto. Los nombres de los grupos son los de las cajas de la capa 3.
 * El pie de cada paso, en su forma (FuentesT6A5.jsx); el «%», pegado a su
 * número. La máquina y el bloque pegado son los de MaquinaPegada.jsx; la
 * escena de momentos, la de Momentos.jsx. Ningún texto vive aquí.
 * ═══════════════════════════════════════════════════════════════════════════
 */

const E = ESCENA_T6_A5;
const TODOS = [...PASOS_T6_A5, CIERRE_T6_A5];

export const MOMENTOS_ESCENA_T6_A5 = [
  {
    fecha: { id: "fecha0", texto: E.fecha },
    tipo: null,
    piezas: [
      { id: "deben", tipo: "dosLineas", l1: E.deben, l2: E.total },
      {
        id: "tabla", tipo: "tabla",
        rotulo: { id: "rotulo", texto: ROTULO_SIMULADO_T6_A5 },
        filas: GRUPOS_T6_A5.map((g, k) => ({
          id: g.id,
          nombre: g.nombre,
          suma: { id: `suma${k + 1}`, texto: E.grupos[k].suma },
          porcentaje: E.grupos[k].porcentaje && { id: `pct${k + 1}`, texto: pegarPorcentaje(E.grupos[k].porcentaje) },
          resultado: { id: `res${k + 1}`, texto: E.grupos[k].resultado },
        })),
        total: { id: "suma", texto: E.suma },
      },
      { id: "gasto", tipo: "anotacion", cuenta: E.gasto, movimiento: E.suma, lado: "debe" },
      { id: "provision", tipo: "anotacion", cuenta: E.provision, movimiento: E.suma, lado: "haber" },
      { id: "neto", tipo: "dosLineas", l1: E.neto, l2: E.valorNeto },
    ],
  },
];

const Escena = escenaDeMomentos({ momentos: MOMENTOS_ESCENA_T6_A5, estadoPaso: T6_A5.estadoPaso, reservas: T6_A5.reservas, textos: E });
const pintarPie = (pie) => <PieDeFuente texto={pie} />;
/*
 * Lo que oye el lector de pantalla tras el texto de cada paso (condición 3 de
 * Shoko): la escena le va oculta, así que el pie se lee con el texto y, en el
 * paso en que aparece la tabla, el rótulo fijo, una sola vez.
 */
const lector = (paso) => [
  ...(paso === T6_A5.PASO_TABLA ? [ROTULO_SIMULADO_T6_A5] : []),
  pegarPorcentaje(TODOS[paso - 1].pie),
];

export default function LaTablaDelEjemplo() {
  return (
    <MaquinaPegada todos={TODOS} estadoPaso={T6_A5.estadoPaso} duracion={T6_A5.duracion} escena={Escena}
      pintar={pegarPorcentaje} pintarPie={pintarPie} lector={lector} atributos={{ "data-capa2-t6-a5": true }} />
  );
}
