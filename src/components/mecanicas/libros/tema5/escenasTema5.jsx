import UnaFrase from "../intro/UnaFrase.jsx";
import { PIEZA_DEL_EFECTIVO, PREGUNTA_FINAL_T5, OPCIONES_FINAL_T5, PIE_FINAL_T5 } from "../../../../data/contabilidadT5Pieza1.js";
import EfectivoDeSobra from "./EfectivoDeSobra.jsx";
import DosPaquetes from "./DosPaquetes.jsx";
import { PIEZA_TRES_MOMENTOS, PREGUNTA_FINAL_T5_A2, OPCIONES_FINAL_T5_A2, PIE_FINAL_T5_A2 } from "../../../../data/contabilidadT5Pieza2.js";
import TresMomentos from "./TresMomentos.jsx";
import DosVentas from "./DosVentas.jsx";
import { PIE } from "../tema6/CajasQueRevelan.jsx";

/*
 * Las capas propias de las piezas de Aprender del Tema 5, como las del
 * Tema 3. La capa 4 es el componente de pregunta de Contabilidad ya aprobado
 * (intro/UnaFrase.jsx), sin cambios: solo recibe la pregunta, las opciones y
 * cómo evaluarlas. Esta pieza no lleva dibujo en la devolución. Desde el
 * lote C1 de Futaba, la capa 4 lleva su pie debajo (el del escenario
 * simulado), como la de T6 · A4: UnaFrase no tiene pie y no se toca.
 */
const SinEscena = () => null;
const evaluar = (id) => {
  const o = OPCIONES_FINAL_T5.find((x) => x.id === id);
  return { correcta: Boolean(o?.correcta), feedback: o?.feedback ?? "", escena: null };
};
function EnUnaFraseT5() {
  return (
    <>
      <UnaFrase pregunta={PREGUNTA_FINAL_T5} opciones={OPCIONES_FINAL_T5} Escena={SinEscena} evaluar={evaluar} />
      <p data-pie style={{ ...PIE, margin: "12px 0 0" }}>{PIE_FINAL_T5}</p>
    </>
  );
}

const evaluarA2 = (id) => {
  const o = OPCIONES_FINAL_T5_A2.find((x) => x.id === id);
  return { correcta: Boolean(o?.correcta), feedback: o?.feedback ?? "", escena: null };
};
export function EnUnaFraseT5A2() {
  return (
    <>
      <UnaFrase pregunta={PREGUNTA_FINAL_T5_A2} opciones={OPCIONES_FINAL_T5_A2} Escena={SinEscena} evaluar={evaluarA2} />
      <p data-pie style={{ ...PIE, margin: "12px 0 0" }}>{PIE_FINAL_T5_A2}</p>
    </>
  );
}

export const ESCENAS_TEMA5 = {
  [PIEZA_DEL_EFECTIVO.id]: { Capa2: EfectivoDeSobra, Exploracion: DosPaquetes, Capa4: EnUnaFraseT5 },
  [PIEZA_TRES_MOMENTOS.id]: { Capa2: TresMomentos, Exploracion: DosVentas, Capa4: EnUnaFraseT5A2 },
};
