import { FAE } from "../../../theme.js";
import PrimeraClasificacion from "../bloques/PrimeraClasificacion.jsx";
import { MarcoLibros } from "../bloques/marcos.jsx";
import SaldoDeLaCuenta from "./SaldoDeLaCuenta.jsx";
import SimpleOCompuestoMecanica from "./SimpleOCompuesto.jsx";
import ArmaElAsientoMecanica from "./ArmaElAsiento.jsx";
import ElAsientoCompuestoMecanica from "./ElAsientoCompuesto.jsx";
import CuadraONoCuadraMecanica from "./CuadraONoCuadra.jsx";
import { SALDO_DE_LA_CUENTA, SIMPLE_O_COMPUESTO, ARMA_EL_ASIENTO, ASIENTO_COMPUESTO, CUADRA_O_NO } from "../../../data/contabilidadActividades.js";
import {
  BANCO_IZQUIERDA_O_DERECHA, BANCO_DE_QUE_FAMILIA, BANCO_CUADRO_DINAMICAS,
  BANCO_DEBITA_O_ACREDITA, BANCO_CORRIENTE_DE_CUENTAS,
} from "../../../contabilidad/bancos.js";

/*
 * ═══════════════════════════════════════════════════════════════════════════
 * LAS ACTIVIDADES DE «LAS CUENTAS, EL DEBE Y EL HABER» QUE YA SE PUEDEN JUGAR.
 *
 * Las que caben en una mecánica que ya existía —clasificar un enunciado entre
 * dos o seis categorías— se sientan en ella: es la convención del sitio, misma
 * mecánica, mismo motor, mismo gesto. Las demás traen la suya, y las suyas
 * comparten piezas entre sí: la cuenta T, el campo de cifra, el constructor de
 * asientos.
 *
 * Las que todavía no están construidas van marcadas `pendiente` en subjects.js
 * y NO aparecen en el camino: un nodo que se abre a una pantalla en blanco es
 * peor que un nodo que todavía no está.
 *
 * Cada una recibe solo `onCompletar`, como cualquier mecánica del sitio.
 * ═══════════════════════════════════════════════════════════════════════════
 */

const A = FAE.ambar;

/* CU-1 */
export const IzquierdaODerecha = ({ onCompletar }) => (
  <PrimeraClasificacion banco={BANCO_IZQUIERDA_O_DERECHA} Marco={MarcoLibros} acento={A}
    rotulo="CIMIENTOS" titulo={BANCO_IZQUIERDA_O_DERECHA.subtema} onCompletar={onCompletar} />
);

/*
 * CU-2: las opciones se barajan. Con tres categorías fijas, la posición se
 * memoriza antes que la regla —«el patrimonio es el botón de la derecha»— y
 * entonces la actividad deja de medir lo que cree medir.
 */
export const DeQueFamilia = ({ onCompletar }) => (
  <PrimeraClasificacion banco={BANCO_DE_QUE_FAMILIA} Marco={MarcoLibros} acento={A} barajarOpciones
    rotulo="CIMIENTOS" titulo={BANCO_DE_QUE_FAMILIA.subtema} onCompletar={onCompletar} />
);

/* CU-3 */
export const CuadroDinamicas = ({ onCompletar }) => (
  <PrimeraClasificacion banco={BANCO_CUADRO_DINAMICAS} Marco={MarcoLibros} acento={A}
    rotulo="APLICACIÓN" titulo={BANCO_CUADRO_DINAMICAS.subtema} onCompletar={onCompletar} />
);

/* CU-4 */
export const DebitaOAcredita = ({ onCompletar }) => (
  <PrimeraClasificacion banco={BANCO_DEBITA_O_ACREDITA} Marco={MarcoLibros} acento={A}
    rotulo="APLICACIÓN" titulo={BANCO_DEBITA_O_ACREDITA.subtema} onCompletar={onCompletar} />
);

/* CU-5: la cuenta T con sus movimientos, y dos preguntas — la cifra y el lado. */
export const ElSaldoDeLaCuenta = ({ onCompletar }) => (
  <SaldoDeLaCuenta Marco={MarcoLibros} acento={A}
    rotulo="APLICACIÓN" titulo={SALDO_DE_LA_CUENTA.subtema} onCompletar={onCompletar} />
);

/* CU-6: el estudiante arma el asiento — dos cuentas y el lado de cada una. */
export const ArmaElAsiento = ({ onCompletar }) => (
  <ArmaElAsientoMecanica Marco={MarcoLibros} acento={A}
    rotulo="ANÁLISIS" titulo={ARMA_EL_ASIENTO.subtema} onCompletar={onCompletar} />
);

/* CU-7: la clase de asiento y cuántas cuentas toca. */
export const SimpleOCompuesto = ({ onCompletar }) => (
  <SimpleOCompuestoMecanica Marco={MarcoLibros} acento={A}
    rotulo="ANÁLISIS" titulo={SIMPLE_O_COMPUESTO.subtema} onCompletar={onCompletar} />
);

/* CU-8: el juicio, y por los descuadrados la cifra exacta de la diferencia. */
export const CuadraONoCuadra = ({ onCompletar }) => (
  <CuadraONoCuadraMecanica Marco={MarcoLibros} acento={A}
    rotulo="ANÁLISIS" titulo={CUADRA_O_NO.subtema} onCompletar={onCompletar} />
);

/*
 * CU-9: la práctica intercalada. `cae` hace que el enunciado entre cayendo,
 * igual que en Corriente de Decisiones —la misma mecánica con el mismo gesto—,
 * y `barajarOpciones` impide memorizar dónde está cada familia. Sortea doce de
 * veinticuatro: repetir la clasificación a velocidad ES la técnica.
 */
export const CorrienteDeCuentas = ({ onCompletar }) => (
  <PrimeraClasificacion banco={BANCO_CORRIENTE_DE_CUENTAS} Marco={MarcoLibros} acento={A} barajarOpciones cae
    rotulo="ANÁLISIS" titulo={BANCO_CORRIENTE_DE_CUENTAS.subtema} onCompletar={onCompletar} />
);

/* CU-10: el mismo constructor, con cifras y hasta cuatro cuentas. */
export const ElAsientoCompuesto = ({ onCompletar }) => (
  <ElAsientoCompuestoMecanica Marco={MarcoLibros} acento={A}
    rotulo="MAESTRÍA" titulo={ASIENTO_COMPUESTO.subtema} onCompletar={onCompletar} />
);
