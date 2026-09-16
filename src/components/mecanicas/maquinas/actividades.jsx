import { FAE } from "../../../theme.js";
import { barajar } from "../../../utils/barajar.js";
import {
  MEMORAMA_BANCO_CENTRAL, QUIEN_DECIDE, VOLANTE_DE_LA_TASA, CAJA_DE_HERRAMIENTAS, A_QUIEN_LE_PEGA,
  CADENAS_TRANSMISION, EXPLICA_DEUDOR, CORRIENTE_DECISIONES, EL_REZAGO, DILEMA_BANQUERO,
  DUELO_INSTRUMENTOS, DISENA_RESPUESTA, CASILLAS_RESPUESTA, retroDuelo,
} from "../../../data/politicaMonetaria.js";
import Memorama from "../bloques/Memorama.jsx";
import PrimeraClasificacion from "../bloques/PrimeraClasificacion.jsx";
import RolDeActores from "../bloques/RolDeActores.jsx";
import Explicale from "../bloques/Explicale.jsx";
import CasoUnico from "../bloques/CasoUnico.jsx";
import DuelosRanking from "../bloques/DuelosRanking.jsx";
import { MarcoMaquinas } from "../bloques/marcos.jsx";
import PrediccionTasa from "./PrediccionTasa.jsx";
import CasillasEnOrden from "./CasillasEnOrden.jsx";
import LineaDeTiempo from "./LineaDeTiempo.jsx";

/*
 * Las doce actividades de Política Monetaria, una por export, con la firma de
 * cualquier mecánica del sitio: solo `onCompletar`. Las mecánicas que ya
 * existían se comparten (convención del sitio: misma mecánica, mismo motor y
 * mismo gesto); cambian el banco y el marco.
 */

const T = FAE.teal;

/* PM-1 */
export const MemoramaBancoCentral = ({ onCompletar }) => (
  <Memorama pares={MEMORAMA_BANCO_CENTRAL.pares} Marco={MarcoMaquinas} acento={T}
    rotulo="CIMIENTOS" titulo={MEMORAMA_BANCO_CENTRAL.subtema} onCompletar={onCompletar} />
);

/* PM-2 */
export const QuienDecideEsto = ({ onCompletar }) => (
  <PrimeraClasificacion banco={QUIEN_DECIDE} Marco={MarcoMaquinas} acento={T} barajarOpciones
    rotulo="CIMIENTOS" titulo={QUIEN_DECIDE.subtema} onCompletar={onCompletar} />
);

/* PM-3 */
export const VolanteDeLaTasa = ({ onCompletar }) => (
  <PrediccionTasa banco={VOLANTE_DE_LA_TASA} Marco={MarcoMaquinas} acento={T}
    rotulo="APLICACIÓN" titulo={VOLANTE_DE_LA_TASA.subtema} onCompletar={onCompletar} />
);

/* PM-4 */
export const CajaDeHerramientas = ({ onCompletar }) => (
  <PrimeraClasificacion banco={CAJA_DE_HERRAMIENTAS} Marco={MarcoMaquinas} acento={T} barajarOpciones
    rotulo="APLICACIÓN" titulo={CAJA_DE_HERRAMIENTAS.subtema} onCompletar={onCompletar} />
);

/* PM-5 */
export const AQuienLePegaLaTasa = ({ onCompletar }) => (
  <RolDeActores rondas={A_QUIEN_LE_PEGA.rondas} retro={A_QUIEN_LE_PEGA.retro} Marco={MarcoMaquinas} acento={T}
    rotulo="APLICACIÓN" titulo={A_QUIEN_LE_PEGA.subtema} onCompletar={onCompletar} />
);

/*
 * PM-6: una de las tres cadenas; sus eslabones 2 a 5 y cinco señuelos
 * sacados de los eslabones 2 a 5 de las otras dos. El eslabón 1 es el punto de
 * partida y no se coloca (addendum 2): 4 piezas buenas + 5 señuelos en el
 * banco, 10 piezas contando la fija.
 */
export function sortearCadena() {
  const { cadenas, senuelosPorPartida, retroSenuelo, retroOrden, castigoSenuelo } = CADENAS_TRANSMISION;
  const [cadena] = barajar(cadenas);
  const senuelos = barajar(
    cadenas
      .filter((c) => c.id !== cadena.id)
      .flatMap((c) => c.eslabones.slice(1).map((e) => ({ id: e.id, texto: e.texto, casilla: null, retro: retroSenuelo(c.canal) }))),
  ).slice(0, senuelosPorPartida);
  const [primero, ...resto] = cadena.eslabones;
  return {
    id: cadena.id,
    rotuloEnunciado: "LA CADENA QUE ESTÁ ARMANDO",
    enunciado: cadena.titulo,
    fija: { rotulo: "Eslabón 1", texto: primero.texto },
    casillas: resto.map((_, k) => ({ id: `eslabon-${k + 2}`, rotulo: `Eslabón ${k + 2}` })),
    piezas: [...resto.map((e, k) => ({ id: e.id, texto: e.texto, casilla: `eslabon-${k + 2}`, retro: e.retro })), ...senuelos],
    retroOrden,
    castigo: castigoSenuelo,
  };
}

export const CadenaDeTransmision = ({ onCompletar }) => (
  <CasillasEnOrden sortear={sortearCadena} Marco={MarcoMaquinas} acento={T}
    rotulo="ANÁLISIS" titulo={CADENAS_TRANSMISION.subtema} onCompletar={onCompletar} />
);

/* PM-7: "elegir hasta 4", así que con una ya se puede explicar. */
export const ExplicaseloADeudor = ({ onCompletar }) => (
  <Explicale escenarios={EXPLICA_DEUDOR.escenarios} minimo={1} Marco={MarcoMaquinas} acento={T}
    rotulo="ANÁLISIS" titulo={EXPLICA_DEUDOR.subtema} onCompletar={onCompletar} />
);

/* PM-8 */
export const CorrienteDeDecisiones = ({ onCompletar }) => (
  <PrimeraClasificacion banco={CORRIENTE_DECISIONES} Marco={MarcoMaquinas} acento={T} barajarOpciones cae
    rotulo="ANÁLISIS" titulo={CORRIENTE_DECISIONES.subtema} onCompletar={onCompletar} />
);

/* PM-9 */
export const ElRezago = ({ onCompletar }) => (
  <LineaDeTiempo banco={EL_REZAGO} Marco={MarcoMaquinas} acento={T}
    rotulo="ANÁLISIS" titulo={EL_REZAGO.subtema} onCompletar={onCompletar} />
);

/* PM-10: sin texto de cierre inventado; la devolución de la opción es la de la ficha. */
export const DilemaBanqueroCentral = ({ onCompletar }) => (
  <CasoUnico caso={DILEMA_BANQUERO} Marco={MarcoMaquinas} acento={FAE.ambar}
    rotulo="MAESTRÍA" titulo={DILEMA_BANQUERO.subtema} onCompletar={onCompletar} />
);

/* PM-11: la devolución de cada duelo vive en el banco (retroDuelo), compartida con el Repaso Diario. */
export { retroDuelo };

export const DueloDeInstrumentos = ({ onCompletar }) => (
  <DuelosRanking casos={DUELO_INSTRUMENTOS.casos} retro={retroDuelo} Marco={MarcoMaquinas} acento={T}
    rotulo="MAESTRÍA" titulo={DUELO_INSTRUMENTOS.subtema} onCompletar={onCompletar} />
);

/* PM-12 */
export function sortearRespuesta() {
  const [caso] = barajar(DISENA_RESPUESTA.casos);
  return {
    id: caso.id,
    rotuloEnunciado: "EL CASO",
    enunciado: caso.caso,
    casillas: CASILLAS_RESPUESTA,
    piezas: caso.piezas,
    retroOrden: DISENA_RESPUESTA.retroOrden,
    castigo: DISENA_RESPUESTA.castigoSenuelo,
  };
}

export const DisenaRespuestaMonetaria = ({ onCompletar }) => (
  <CasillasEnOrden sortear={sortearRespuesta} Marco={MarcoMaquinas} acento={T}
    rotulo="MAESTRÍA" titulo={DISENA_RESPUESTA.subtema} onCompletar={onCompletar} />
);
