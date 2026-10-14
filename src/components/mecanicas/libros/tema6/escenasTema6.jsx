import UnaFrase from "../intro/UnaFrase.jsx";
import { PIEZA_LO_QUE_LE_DEBEN, PREGUNTA_FINAL_T6, OPCIONES_FINAL_T6 } from "../../../../data/contabilidadT6Pieza1.js";
import DosMomentos from "./DosMomentos.jsx";
import SeisHechos from "./SeisHechos.jsx";
import { PIEZA_NO_VA_A_PAGAR, PREGUNTA_FINAL_T6_A2, OPCIONES_FINAL_T6_A2 } from "../../../../data/contabilidadT6Pieza2.js";
import DosDias from "./DosDias.jsx";
import DosMetodos from "./DosMetodos.jsx";

/*
 * Las capas propias de las piezas de Aprender del Tema 6, como las de los
 * Temas 3 y 5. La capa 4 es el componente de pregunta de Contabilidad ya
 * aprobado (intro/UnaFrase.jsx), sin cambios. Sin dibujo en la devolución.
 */
const SinEscena = () => null;
const evaluar = (id) => {
  const o = OPCIONES_FINAL_T6.find((x) => x.id === id);
  return { correcta: Boolean(o?.correcta), feedback: o?.feedback ?? "", escena: null };
};
function EnUnaFraseT6() {
  return <UnaFrase pregunta={PREGUNTA_FINAL_T6} opciones={OPCIONES_FINAL_T6} Escena={SinEscena} evaluar={evaluar} />;
}

const evaluarA2 = (id) => {
  const o = OPCIONES_FINAL_T6_A2.find((x) => x.id === id);
  return { correcta: Boolean(o?.correcta), feedback: o?.feedback ?? "", escena: null };
};
function EnUnaFraseT6A2() {
  return <UnaFrase pregunta={PREGUNTA_FINAL_T6_A2} opciones={OPCIONES_FINAL_T6_A2} Escena={SinEscena} evaluar={evaluarA2} />;
}

export const ESCENAS_TEMA6 = {
  [PIEZA_LO_QUE_LE_DEBEN.id]: { Capa2: DosMomentos, Exploracion: SeisHechos, Capa4: EnUnaFraseT6 },
  [PIEZA_NO_VA_A_PAGAR.id]: { Capa2: DosDias, Exploracion: DosMetodos, Capa4: EnUnaFraseT6A2 },
};
