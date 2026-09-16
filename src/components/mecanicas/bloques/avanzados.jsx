import { FAE } from "../../../theme.js";
import {
  CAMBIOS_ACERCA, CASO_GABINETE, CASO_CONSEJO, RONDAS_AUGE, RONDAS_AJUSTE,
  EXPLICA_PACIENTE, EXPLICA_CONTRIBUYENTE, SALA_ESPERA, COMITE_PRESUPUESTO,
} from "../../../data/bloquesAvanzados.js";
import SeAcercaOSeAleja from "./SeAcercaOSeAleja.jsx";
import CasoUnico from "./CasoUnico.jsx";
import DuelosRanking from "./DuelosRanking.jsx";
import RolDeActores from "./RolDeActores.jsx";
import Explicale from "./Explicale.jsx";
import FiltroDeSenales from "./FiltroDeSenales.jsx";
import { MarcoSala, MarcoCorazon, MarcoTesoreria } from "./marcos.jsx";

/*
 * Los nueve juegos que completan Aplicación, Análisis y Maestría, uno por
 * export y con la firma de cualquier mecánica del sitio: solo `onCompletar`.
 *
 * Tres parejas —reparto de actores, efecto protégé, frontera de señales—
 * usan el MISMO componente en Demanda Agregada y en Política Fiscal. Lo único
 * que cambia es el banco y el marco de la materia.
 */

/* ── Política Económica ── */

export const SeAcerca = ({ onCompletar }) => (
  <SeAcercaOSeAleja filas={CAMBIOS_ACERCA} Marco={MarcoSala} acento={FAE.teal}
    rotulo="APLICACIÓN · PREDICCIÓN" titulo="Seis cambios, seis objetivos" onCompletar={onCompletar} />
);

export const ExpedienteGabinete = ({ onCompletar }) => (
  <CasoUnico caso={CASO_GABINETE} Marco={MarcoSala} acento={FAE.ambar}
    rotulo="ANÁLISIS · EXPEDIENTE" titulo="Una decisión del gabinete" onCompletar={onCompletar}
    cierre={(ok) => (ok ? "Una sola decisión, y era la difícil: reconocer cuándo faltan datos." : "Una sola decisión: aquí pesa tanto lo que empuja como lo que frena.")} />
);

export const ConsejoMinistros = ({ onCompletar }) => (
  <DuelosRanking caso={CASO_CONSEJO} Marco={MarcoSala} acento={FAE.teal}
    rotulo="MAESTRÍA · CONSEJO DE MINISTROS" titulo="Tres propuestas, tres duelos" onCompletar={onCompletar} />
);

/* ── Demanda Agregada ── */

export const QuienBeneficiaAuge = ({ onCompletar }) => (
  <RolDeActores rondas={RONDAS_AUGE} Marco={MarcoCorazon} acento={FAE.teal}
    rotulo="APLICACIÓN · REPARTO DE ACTORES" titulo="Cuando un componente se mueve" onCompletar={onCompletar} />
);

export const ExplicaPaciente = ({ onCompletar }) => (
  <Explicale escenario={EXPLICA_PACIENTE} Marco={MarcoCorazon} acento={FAE.teal}
    rotulo="ANÁLISIS · EXPLÍCASELO" titulo="A un paciente que no sabe economía" onCompletar={onCompletar} />
);

export const SalaEsperaLlena = ({ onCompletar }) => (
  <FiltroDeSenales banco={SALA_ESPERA} Marco={MarcoCorazon} acento={FAE.teal}
    rotulo="MAESTRÍA · FRONTERA DE SEÑALES" titulo="Catorce datos, cinco que explican" onCompletar={onCompletar} />
);

/* ── Política Fiscal ── */

export const QuienAfectaAjuste = ({ onCompletar }) => (
  <RolDeActores rondas={RONDAS_AJUSTE} Marco={MarcoTesoreria} acento={FAE.teal}
    rotulo="APLICACIÓN · REPARTO DE ACTORES" titulo="Cuando el Estado cobra, gasta o se endeuda" onCompletar={onCompletar} />
);

export const ExplicaContribuyente = ({ onCompletar }) => (
  <Explicale escenario={EXPLICA_CONTRIBUYENTE} Marco={MarcoTesoreria} acento={FAE.teal}
    rotulo="ANÁLISIS · EXPLÍCASELO" titulo="A un contribuyente, sin tecnicismos" onCompletar={onCompletar} />
);

export const ComitePresupuesto = ({ onCompletar }) => (
  <FiltroDeSenales banco={COMITE_PRESUPUESTO} Marco={MarcoTesoreria} acento={FAE.teal}
    rotulo="MAESTRÍA · FRONTERA DE SEÑALES" titulo="Catorce datos, cinco que explican" onCompletar={onCompletar} />
);
