import UnaFrase from "../intro/UnaFrase.jsx";
import { PREGUNTA_FINAL, OPCIONES_FINAL } from "../../../../data/contabilidadTema3.js";
import MiraloFuncionar from "./MiraloFuncionar.jsx";
import PruebaUsted from "./PruebaUsted.jsx";

/*
 * Las capas propias de las piezas de Aprender del Tema 3. La capa 4 es el
 * componente de pregunta de Contabilidad ya aprobado (intro/UnaFrase.jsx),
 * sin cambios: solo recibe la pregunta, las opciones y cómo evaluarlas.
 * Esta pieza no lleva dibujo en la devolución.
 */
const SinEscena = () => null;
const evaluar = (id) => {
  const o = OPCIONES_FINAL.find((x) => x.id === id);
  return { correcta: Boolean(o?.correcta), feedback: o?.feedback ?? "", escena: null };
};
function EnUnaFraseTema3() {
  return <UnaFrase pregunta={PREGUNTA_FINAL} opciones={OPCIONES_FINAL} Escena={SinEscena} evaluar={evaluar} />;
}

export const ESCENAS_TEMA3 = {
  "t3-a1-vender-no-es-cobrar": { Capa2: MiraloFuncionar, Exploracion: PruebaUsted, Capa4: EnUnaFraseTema3 },
};
