import { FAE } from "../../../theme.js";
import { MEMORAMAS, CLASIFICACIONES } from "../../../data/cimientos.js";
import Memorama from "./Memorama.jsx";
import PrimeraClasificacion from "./PrimeraClasificacion.jsx";
import { MarcoSala, MarcoCorazon, MarcoTesoreria } from "./marcos.jsx";

/*
 * Los seis juegos de Cimientos, uno por export, con la firma de cualquier
 * mecánica del sitio: solo `onCompletar`. La mecánica es la misma en las tres
 * materias; cambian el banco y el marco.
 */

const ROTULO_MEMORAMA = "CIMIENTOS · MEMORAMA";
const ROTULO_CLASIFICACION = "CIMIENTOS · PRIMERA CLASIFICACIÓN";

export const MemoramaTesoro = ({ onCompletar }) => (
  <Memorama pares={MEMORAMAS["memorama-tesoro"].pares} Marco={MarcoSala} acento={FAE.teal}
    rotulo={ROTULO_MEMORAMA} titulo={MEMORAMAS["memorama-tesoro"].subtema} onCompletar={onCompletar} />
);

export const MemoramaCorazon = ({ onCompletar }) => (
  <Memorama pares={MEMORAMAS["memorama-corazon"].pares} Marco={MarcoCorazon} acento={FAE.teal}
    rotulo={ROTULO_MEMORAMA} titulo={MEMORAMAS["memorama-corazon"].subtema} onCompletar={onCompletar} />
);

export const MemoramaTesoreria = ({ onCompletar }) => (
  <Memorama pares={MEMORAMAS["memorama-tesoreria"].pares} Marco={MarcoTesoreria} acento={FAE.teal}
    rotulo={ROTULO_MEMORAMA} titulo={MEMORAMAS["memorama-tesoreria"].subtema} onCompletar={onCompletar} />
);

export const QueRamaEs = ({ onCompletar }) => (
  <PrimeraClasificacion banco={CLASIFICACIONES["que-rama-es"]} Marco={MarcoSala} acento={FAE.teal}
    rotulo={ROTULO_CLASIFICACION} titulo="Cuatro ramas, una puerta cada una" onCompletar={onCompletar} />
);

export const CualComponente = ({ onCompletar }) => (
  <PrimeraClasificacion banco={CLASIFICACIONES["cual-componente"]} Marco={MarcoCorazon} acento={FAE.teal}
    rotulo={ROTULO_CLASIFICACION} titulo="C, I, G o XN, sin reloj" onCompletar={onCompletar} />
);

export const CobraGastaOPide = ({ onCompletar }) => (
  <PrimeraClasificacion banco={CLASIFICACIONES["cobra-gasta-o-pide"]} Marco={MarcoTesoreria} acento={FAE.teal}
    rotulo={ROTULO_CLASIFICACION} titulo="Las tres bandejas del Estado" onCompletar={onCompletar} />
);
