import UnaFrase from "../intro/UnaFrase.jsx";
import { PIEZA_DEL_EFECTIVO, PREGUNTA_FINAL_T5, OPCIONES_FINAL_T5 } from "../../../../data/contabilidadTema5Pieza1.js";
import EfectivoDeSobra from "./EfectivoDeSobra.jsx";
import DosPaquetes from "./DosPaquetes.jsx";

/*
 * Las capas propias de las piezas de Aprender del Tema 5, como las del
 * Tema 3. La capa 4 es el componente de pregunta de Contabilidad ya aprobado
 * (intro/UnaFrase.jsx), sin cambios: solo recibe la pregunta, las opciones y
 * cómo evaluarlas. Esta pieza no lleva dibujo en la devolución.
 */
const SinEscena = () => null;
const evaluar = (id) => {
  const o = OPCIONES_FINAL_T5.find((x) => x.id === id);
  return { correcta: Boolean(o?.correcta), feedback: o?.feedback ?? "", escena: null };
};
function EnUnaFraseT5() {
  return <UnaFrase pregunta={PREGUNTA_FINAL_T5} opciones={OPCIONES_FINAL_T5} Escena={SinEscena} evaluar={evaluar} />;
}

export const ESCENAS_TEMA5 = {
  [PIEZA_DEL_EFECTIVO.id]: { Capa2: EfectivoDeSobra, Exploracion: DosPaquetes, Capa4: EnUnaFraseT5 },
};
