import UnaFrase from "../intro/UnaFrase.jsx";
import { PIEZA_LO_QUE_LE_DEBEN, PREGUNTA_FINAL_T6, OPCIONES_FINAL_T6, PIE_FINAL_T6 } from "../../../../data/contabilidadT6Pieza1.js";
import DosMomentos from "./DosMomentos.jsx";
import SeisHechos from "./SeisHechos.jsx";
import { PIEZA_NO_VA_A_PAGAR, PREGUNTA_FINAL_T6_A2, OPCIONES_FINAL_T6_A2 } from "../../../../data/contabilidadT6Pieza2.js";
import DosDias from "./DosDias.jsx";
import DosMetodos from "./DosMetodos.jsx";
import { PIEZA_LA_PROVISION, PREGUNTA_FINAL_T6_A3, OPCIONES_FINAL_T6_A3, PIE_FINAL_T6_A3 } from "../../../../data/contabilidadT6Pieza3.js";
import LaProvision from "./LaProvision.jsx";
import CuentaT from "./CuentaT.jsx";
import { PIEZA_SI_PAGA, PREGUNTA_FINAL_T6_A4, OPCIONES_FINAL_T6_A4, PIE_FINAL_T6_A4 } from "../../../../data/contabilidadT6Pieza4.js";
import SiPaga from "./SiPaga.jsx";
import TresCasos from "./TresCasos.jsx";
import { PIEZA_COMO_SE_CALCULA, PREGUNTA_FINAL_T6_A5, OPCIONES_FINAL_T6_A5 } from "../../../../data/contabilidadT6Pieza5.js";
import { pegarPorcentaje } from "../../../../contabilidad/t6Pieza5.js";
import LaTablaDelEjemplo from "./LaTablaDelEjemplo.jsx";
import CuatroGrupos from "./CuatroGrupos.jsx";
import { PIE } from "./CajasQueRevelan.jsx";

/*
 * Las capas propias de las piezas de Aprender del Tema 6, como las de los
 * Temas 3 y 5. La capa 4 es el componente de pregunta de Contabilidad ya
 * aprobado (intro/UnaFrase.jsx), sin cambios. Sin dibujo en la devolución.
 * Las que llevan pie (A1 y A3 desde el lote C1 de Futaba, y A4) lo pintan
 * debajo, fuera de UnaFrase.
 */
const PieCapa4 = ({ texto }) => <p data-pie style={{ ...PIE, margin: "12px 0 0" }}>{texto}</p>;
const SinEscena = () => null;
const evaluar = (id) => {
  const o = OPCIONES_FINAL_T6.find((x) => x.id === id);
  return { correcta: Boolean(o?.correcta), feedback: o?.feedback ?? "", escena: null };
};
function EnUnaFraseT6() {
  return (
    <>
      <UnaFrase pregunta={PREGUNTA_FINAL_T6} opciones={OPCIONES_FINAL_T6} Escena={SinEscena} evaluar={evaluar} />
      <PieCapa4 texto={PIE_FINAL_T6} />
    </>
  );
}

const evaluarA2 = (id) => {
  const o = OPCIONES_FINAL_T6_A2.find((x) => x.id === id);
  return { correcta: Boolean(o?.correcta), feedback: o?.feedback ?? "", escena: null };
};
function EnUnaFraseT6A2() {
  return <UnaFrase pregunta={PREGUNTA_FINAL_T6_A2} opciones={OPCIONES_FINAL_T6_A2} Escena={SinEscena} evaluar={evaluarA2} />;
}

const evaluarA3 = (id) => {
  const o = OPCIONES_FINAL_T6_A3.find((x) => x.id === id);
  return { correcta: Boolean(o?.correcta), feedback: o?.feedback ?? "", escena: null };
};
export function EnUnaFraseT6A3() {
  return (
    <>
      <UnaFrase pregunta={PREGUNTA_FINAL_T6_A3} opciones={OPCIONES_FINAL_T6_A3} Escena={SinEscena} evaluar={evaluarA3} />
      <PieCapa4 texto={PIE_FINAL_T6_A3} />
    </>
  );
}

const evaluarA4 = (id) => {
  const o = OPCIONES_FINAL_T6_A4.find((x) => x.id === id);
  return { correcta: Boolean(o?.correcta), feedback: o?.feedback ?? "", escena: null };
};
/* La capa 4 nueva (entrega 2): UnaFrase sin cambios y, debajo, su pie de fuente. */
export function EnUnaFraseT6A4() {
  return (
    <>
      <UnaFrase pregunta={PREGUNTA_FINAL_T6_A4} opciones={OPCIONES_FINAL_T6_A4} Escena={SinEscena} evaluar={evaluarA4} />
      <PieCapa4 texto={PIE_FINAL_T6_A4} />
    </>
  );
}

/* T6 · A5: el «%» pegado a su número también en la pregunta y las devoluciones (Mai §7). */
const OPCIONES_A5 = OPCIONES_FINAL_T6_A5.map((o) => ({ ...o, texto: pegarPorcentaje(o.texto), feedback: pegarPorcentaje(o.feedback) }));
const evaluarA5 = (id) => {
  const o = OPCIONES_A5.find((x) => x.id === id);
  return { correcta: Boolean(o?.correcta), feedback: o?.feedback ?? "", escena: null };
};
export function EnUnaFraseT6A5() {
  return <UnaFrase pregunta={pegarPorcentaje(PREGUNTA_FINAL_T6_A5)} opciones={OPCIONES_A5} Escena={SinEscena} evaluar={evaluarA5} />;
}

export const ESCENAS_TEMA6 = {
  [PIEZA_LO_QUE_LE_DEBEN.id]: { Capa2: DosMomentos, Exploracion: SeisHechos, Capa4: EnUnaFraseT6 },
  [PIEZA_NO_VA_A_PAGAR.id]: { Capa2: DosDias, Exploracion: DosMetodos, Capa4: EnUnaFraseT6A2 },
  [PIEZA_LA_PROVISION.id]: { Capa2: LaProvision, Exploracion: CuentaT, Capa4: EnUnaFraseT6A3 },
  [PIEZA_SI_PAGA.id]: { Capa2: SiPaga, Exploracion: TresCasos, Capa4: EnUnaFraseT6A4 },
  [PIEZA_COMO_SE_CALCULA.id]: { Capa2: LaTablaDelEjemplo, Exploracion: CuatroGrupos, Capa4: EnUnaFraseT6A5 },
};
