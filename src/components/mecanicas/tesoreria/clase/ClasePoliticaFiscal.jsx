import Presentacion from "../../../presentacion/Presentacion.jsx";
import { escenaBrujula } from "../../../presentacion/Brujula.jsx";
import { escenaTesoreria } from "./EscenaTesoreria.jsx";
import { escenaEjemplos } from "./EscenaEjemplos.jsx";
import { escenaChequeos } from "./EscenaChequeos.jsx";
import { BRUJULA_FISCAL, MECANISMOS_CLASE, EJEMPLOS_CLASE, CHEQUEOS_CLASE } from "../../../../data/politicaFiscalClase.js";

/*
 * POLÍTICA FISCAL · APRENDER — la presentación para proyectar en clase.
 *
 * Cuatro escenas seguidas. La primera es la brújula genérica —neutra, sin
 * nada de la Tesorería—; las otras tres vuelven a entrar en la Tesorería de
 * los juegos. Nada de esto puntúa: no hay onCompletar, no se registra FP y
 * ninguna actividad de aquí está en actividad_catalogo.
 */
export const ESCENAS_POLITICA_FISCAL = [
  escenaBrujula({ id: "brujula", titulo: "La brújula de las 6 preguntas", puntas: BRUJULA_FISCAL }),
  escenaTesoreria({ id: "tesoreria", titulo: "Cobra, gasta, pide prestado", mecanismos: MECANISMOS_CLASE }),
  escenaEjemplos({ id: "ejemplos", titulo: "Tres ejemplos reales", ejemplos: EJEMPLOS_CLASE }),
  escenaChequeos({ id: "chequeos", titulo: "Chequeo rápido", chequeos: CHEQUEOS_CLASE, mecanismos: MECANISMOS_CLASE }),
];

export const CLAVE_CLASE_POLITICA_FISCAL = "clase-politica-fiscal";

export default function ClasePoliticaFiscal() {
  return (
    <Presentacion
      escenas={ESCENAS_POLITICA_FISCAL}
      clave={CLAVE_CLASE_POLITICA_FISCAL}
      rotulo="La política fiscal en cuatro escenas"
    />
  );
}
