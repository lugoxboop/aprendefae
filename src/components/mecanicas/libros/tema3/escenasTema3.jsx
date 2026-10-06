import UnaFrase from "../intro/UnaFrase.jsx";
import { PREGUNTA_FINAL, OPCIONES_FINAL } from "../../../../data/contabilidadTema3.js";
import MiraloFuncionar from "./MiraloFuncionar.jsx";
import PruebaUsted from "./PruebaUsted.jsx";
import { PREGUNTA_FINAL_P3, OPCIONES_FINAL_P3 } from "../../../../data/contabilidadTema3Pieza3.js";
import LoQueYaPaso from "./LoQueYaPaso.jsx";
import CadaEmpresa from "./CadaEmpresa.jsx";
import { PREGUNTA_FINAL_P4, OPCIONES_FINAL_P4 } from "../../../../data/contabilidadTema3Pieza4.js";
import LoQueYaSePago from "./LoQueYaSePago.jsx";
import CadaMes from "./CadaMes.jsx";
import { PREGUNTA_FINAL_CIERRE, OPCIONES_FINAL_CIERRE } from "../../../../data/contabilidadTema3Cierre.js";
import CerrarElPeriodo from "./CerrarElPeriodo.jsx";
import CadaCuentaCierre from "./CadaCuentaCierre.jsx";

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

/* La pieza 3, con el mismo componente de pregunta y sin dibujo. */
const evaluarP3 = (id) => {
  const o = OPCIONES_FINAL_P3.find((x) => x.id === id);
  return { correcta: Boolean(o?.correcta), feedback: o?.feedback ?? "", escena: null };
};
function EnUnaFrasePieza3() {
  return <UnaFrase pregunta={PREGUNTA_FINAL_P3} opciones={OPCIONES_FINAL_P3} Escena={SinEscena} evaluar={evaluarP3} />;
}

/* La pieza 4, igual. */
const evaluarP4 = (id) => {
  const o = OPCIONES_FINAL_P4.find((x) => x.id === id);
  return { correcta: Boolean(o?.correcta), feedback: o?.feedback ?? "", escena: null };
};
function EnUnaFrasePieza4() {
  return <UnaFrase pregunta={PREGUNTA_FINAL_P4} opciones={OPCIONES_FINAL_P4} Escena={SinEscena} evaluar={evaluarP4} />;
}

/* «Cerrar el periodo», igual. */
const evaluarCierre = (id) => {
  const o = OPCIONES_FINAL_CIERRE.find((x) => x.id === id);
  return { correcta: Boolean(o?.correcta), feedback: o?.feedback ?? "", escena: null };
};
function EnUnaFraseCierre() {
  return <UnaFrase pregunta={PREGUNTA_FINAL_CIERRE} opciones={OPCIONES_FINAL_CIERRE} Escena={SinEscena} evaluar={evaluarCierre} />;
}

export const ESCENAS_TEMA3 = {
  "t3-a1-vender-no-es-cobrar": { Capa2: MiraloFuncionar, Exploracion: PruebaUsted, Capa4: EnUnaFraseTema3 },
  "t3-a3-lo-que-ya-paso": { Capa2: LoQueYaPaso, Exploracion: CadaEmpresa, Capa4: EnUnaFrasePieza3 },
  "t3-a4-lo-que-ya-se-pago": { Capa2: LoQueYaSePago, Exploracion: CadaMes, Capa4: EnUnaFrasePieza4 },
  "t3-a5-cerrar-el-periodo": { Capa2: CerrarElPeriodo, Exploracion: CadaCuentaCierre, Capa4: EnUnaFraseCierre },
};
