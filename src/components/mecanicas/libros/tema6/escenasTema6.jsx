import UnaFrase from "../intro/UnaFrase.jsx";
import { PIEZA_LO_QUE_LE_DEBEN, PREGUNTA_FINAL_T6, OPCIONES_FINAL_T6, PIE_FINAL_T6, PREGUNTA_FINAL_ANTES_C1_T6, OPCIONES_FINAL_ANTES_C1_T6 } from "../../../../data/contabilidadT6Pieza1.js";
import DosMomentos from "./DosMomentos.jsx";
import SeisHechos from "./SeisHechos.jsx";
import { PIEZA_NO_VA_A_PAGAR, PREGUNTA_FINAL_T6_A2, OPCIONES_FINAL_T6_A2 } from "../../../../data/contabilidadT6Pieza2.js";
import DosDias from "./DosDias.jsx";
import DosMetodos from "./DosMetodos.jsx";
import {
  PIEZA_LA_PROVISION, PREGUNTA_FINAL_T6_A3, OPCIONES_FINAL_T6_A3, PIE_FINAL_T6_A3, TANQUE_T6_A3, PREGUNTA_FINAL_ANTES_C1_T6_A3, OPCIONES_FINAL_ANTES_C1_T6_A3,
} from "../../../../data/contabilidadT6Pieza3.js";
import TanqueProvision from "./TanqueProvision.jsx";
import LaProvision from "./LaProvision.jsx";
import TanqueMomentos from "./TanqueMomentos.jsx";
import { PIEZA_SI_PAGA, PREGUNTA_FINAL_T6_A4, OPCIONES_FINAL_T6_A4, PIE_FINAL_T6_A4 } from "../../../../data/contabilidadT6Pieza4.js";
import SiPaga from "./SiPaga.jsx";
import TresCasos from "./TresCasos.jsx";
import { PIEZA_COMO_SE_CALCULA, PREGUNTA_FINAL_T6_A5, OPCIONES_FINAL_T6_A5 } from "../../../../data/contabilidadT6Pieza5.js";
import { pegarPorcentaje } from "../../../../contabilidad/t6Pieza5.js";
import LaTablaDelEjemplo from "./LaTablaDelEjemplo.jsx";
import CuatroGrupos from "./CuatroGrupos.jsx";
import { PIE } from "./CajasQueRevelan.jsx";
import { FinalT6A1, FinalT6A2, FinalT6A4, FinalT6A5 } from "./FigurasFinalesT6.jsx";
import { evaluadorDe, useEscenaConLeyenda, useVueltaCapa4 } from "./LeyendaFinal.jsx";

/*
 * Las capas propias de las piezas de Aprender del Tema 6, como las de los
 * Temas 3 y 5. La capa 4 es el componente de pregunta de Contabilidad ya
 * aprobado (intro/UnaFrase.jsx), sin cambios. Sin dibujo en la devolución.
 * Las que llevan pie (A1 y A3 desde el lote C1 de Futaba, y A4) lo pintan
 * debajo, fuera de UnaFrase.
 */
const PieCapa4 = ({ texto }) => <p data-pie style={{ ...PIE, margin: "12px 0 0" }}>{texto}</p>;
/* Lote 27 · D8: en la segunda visita (A1 y A3, las que cambió el lote C1), la pregunta de antes, sin pie. */
const evaluar = evaluadorDe(OPCIONES_FINAL_T6);
const evaluarAntes = evaluadorDe(OPCIONES_FINAL_ANTES_C1_T6);
export function EnUnaFraseT6({ ponerLeyenda = null }) {
  const { variante, poner } = useVueltaCapa4(PIEZA_LO_QUE_LE_DEBEN.id, ponerLeyenda);
  const Escena = useEscenaConLeyenda(poner);
  if (variante) return <UnaFrase pregunta={PREGUNTA_FINAL_ANTES_C1_T6} opciones={OPCIONES_FINAL_ANTES_C1_T6} Escena={Escena} evaluar={evaluarAntes} />;
  return (
    <>
      <UnaFrase pregunta={PREGUNTA_FINAL_T6} opciones={OPCIONES_FINAL_T6} Escena={Escena} evaluar={evaluar} />
      <PieCapa4 texto={PIE_FINAL_T6} />
    </>
  );
}

const evaluarA2 = evaluadorDe(OPCIONES_FINAL_T6_A2);
/*
 * Lote 28 (bug de #455): A2, A4 y A5 no tienen pregunta de antes de C1, pero cuentan la visita igual que las
 * demás (useVueltaCapa4): acertar la capa 4 sube fae-b5-vueltas:aprender:<id>, y desde la segunda visita su
 * capa 3 sale barajada.
 */
export function EnUnaFraseT6A2({ ponerLeyenda = null }) {
  const { poner } = useVueltaCapa4(PIEZA_NO_VA_A_PAGAR.id, ponerLeyenda);
  const Escena = useEscenaConLeyenda(poner);
  return <UnaFrase pregunta={PREGUNTA_FINAL_T6_A2} opciones={OPCIONES_FINAL_T6_A2} Escena={Escena} evaluar={evaluarA2} />;
}

const evaluarA3 = evaluadorDe(OPCIONES_FINAL_T6_A3);
const evaluarA3Antes = evaluadorDe(OPCIONES_FINAL_ANTES_C1_T6_A3);
export function EnUnaFraseT6A3({ ponerLeyenda = null }) {
  const { variante, poner } = useVueltaCapa4(PIEZA_LA_PROVISION.id, ponerLeyenda);
  const Escena = useEscenaConLeyenda(poner);
  if (variante) return <UnaFrase pregunta={PREGUNTA_FINAL_ANTES_C1_T6_A3} opciones={OPCIONES_FINAL_ANTES_C1_T6_A3} Escena={Escena} evaluar={evaluarA3Antes} />;
  return (
    <>
      <UnaFrase pregunta={PREGUNTA_FINAL_T6_A3} opciones={OPCIONES_FINAL_T6_A3} Escena={Escena} evaluar={evaluarA3} />
      <PieCapa4 texto={PIE_FINAL_T6_A3} />
    </>
  );
}

const evaluarA4 = evaluadorDe(OPCIONES_FINAL_T6_A4);
/* La capa 4 nueva (entrega 2): UnaFrase sin cambios y, debajo, su pie de fuente. */
export function EnUnaFraseT6A4({ ponerLeyenda = null }) {
  const { poner } = useVueltaCapa4(PIEZA_SI_PAGA.id, ponerLeyenda);
  const Escena = useEscenaConLeyenda(poner);
  return (
    <>
      <UnaFrase pregunta={PREGUNTA_FINAL_T6_A4} opciones={OPCIONES_FINAL_T6_A4} Escena={Escena} evaluar={evaluarA4} />
      <PieCapa4 texto={PIE_FINAL_T6_A4} />
    </>
  );
}

/* T6 · A5: el «%» pegado a su número también en la pregunta y las devoluciones (Mai §7). */
const OPCIONES_A5 = OPCIONES_FINAL_T6_A5.map((o) => ({ ...o, texto: pegarPorcentaje(o.texto), feedback: pegarPorcentaje(o.feedback) }));
const evaluarA5 = evaluadorDe(OPCIONES_A5);
export function EnUnaFraseT6A5({ ponerLeyenda = null }) {
  const { poner } = useVueltaCapa4(PIEZA_COMO_SE_CALCULA.id, ponerLeyenda);
  const Escena = useEscenaConLeyenda(poner);
  return <UnaFrase pregunta={pegarPorcentaje(PREGUNTA_FINAL_T6_A5)} opciones={OPCIONES_A5} Escena={Escena} evaluar={evaluarA5} />;
}

/*
 * LOTE 7 · LA FIGURA DEL TANQUE EN LAS CAPAS 1 Y 4 DE T6 · A3 (P2 de Mai, decisión (b) de Sakuta).
 * Tanque mínimo (84 × 100, sin gestos). Capa 1: antes del nombre, en tres
 * términos: la provisión creada, el castigo que rompe el cero y la corrección
 * que vuelve a la línea del análisis. Capa 4: el tanque final; la frase buena
 * queda debajo como su leyenda (Inter 13/1,5).
 */
const TanqueMini = ({ nivel, analisis = null, segmentos = null }) => (
  <div style={{ display: "flex", justifyContent: "center" }}>
    <TanqueProvision nivel={nivel} textos={TANQUE_T6_A3} alto={100} analisis={analisis} segmentos={segmentos} reducido />
  </div>
);
/* La capa 1 de las piezas de B lleva sus figuras desde el lote 10 (FigurasCapa1.jsx). */
export function TanqueFinalT6A3({ leyenda }) {
  return (
    <div data-tanque-final>
      <TanqueMini nivel={153400} analisis="solo" />
      {leyenda && <p data-leyenda style={{ margin: "8px 0 0", textAlign: "center", fontFamily: "Inter, sans-serif", fontSize: "13px", lineHeight: 1.5, color: "#F8F9FA" }}>{leyenda}</p>}
    </div>
  );
}

export const ESCENAS_TEMA6 = {
  [PIEZA_LO_QUE_LE_DEBEN.id]: { Capa2: DosMomentos, Exploracion: SeisHechos, Capa4: EnUnaFraseT6, FiguraFinal: FinalT6A1 },
  [PIEZA_NO_VA_A_PAGAR.id]: { Capa2: DosDias, Exploracion: DosMetodos, Capa4: EnUnaFraseT6A2, FiguraFinal: FinalT6A2 },
  [PIEZA_LA_PROVISION.id]: { Capa2: LaProvision, Exploracion: TanqueMomentos, Capa4: EnUnaFraseT6A3, FiguraFinal: TanqueFinalT6A3 },
  [PIEZA_SI_PAGA.id]: { Capa2: SiPaga, Exploracion: TresCasos, Capa4: EnUnaFraseT6A4, FiguraFinal: FinalT6A4 },
  [PIEZA_COMO_SE_CALCULA.id]: { Capa2: LaTablaDelEjemplo, Exploracion: CuatroGrupos, Capa4: EnUnaFraseT6A5, FiguraFinal: FinalT6A5 },
};
