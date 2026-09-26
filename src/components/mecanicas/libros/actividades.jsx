import { FAE } from "../../../theme.js";
import { MarcoLibros } from "../bloques/marcos.jsx";
import { tipoDeCuenta } from "../../../data/contabilidad.js";
import SoltarEnUnLado from "./SoltarEnUnLado.jsx";
import ArmaElBalance from "./ArmaElBalance.jsx";
import CuadroDeDinamicas from "./CuadroDeDinamicas.jsx";
import DebitaOAcreditaMecanica from "./DebitaOAcredita.jsx";
import ElSaldoDeLaCuentaMecanica from "./ElSaldoDeLaCuenta.jsx";
import ElAsientoSimpleMecanica from "./ElAsientoSimple.jsx";
import ElAsientoCompuestoNuevoMecanica from "./ElAsientoCompuestoNuevo.jsx";
import SeisCuentasAbiertas from "./SeisCuentasAbiertas.jsx";
import SimpleOCompuestoMecanica from "./SimpleOCompuesto.jsx";
import ElAsientoCompuestoMecanica from "./ElAsientoCompuesto.jsx";
import CuadraONoCuadraMecanica from "./CuadraONoCuadra.jsx";
import LaMayorizacionMecanica from "./LaMayorizacion.jsx";
import ElErrorEscondidoMecanica from "./ElErrorEscondido.jsx";
import { SUBTEMA as SUBTEMA_CUADRO } from "../../../data/contabilidadCuadro.js";
import { SUBTEMA as SUBTEMA_A4 } from "../../../data/contabilidadDebitaOAcredita.js";
import { SUBTEMA as SUBTEMA_A5 } from "../../../data/contabilidadSaldo.js";
import { SUBTEMA as SUBTEMA_A6 } from "../../../data/contabilidadArmaElAsiento.js";
import { SUBTEMA as SUBTEMA_A7 } from "../../../data/contabilidadAsientoCompuesto.js";
import { SIMPLE_O_COMPUESTO, ASIENTO_COMPUESTO, CUADRA_O_NO, MAYORIZACION, ERROR_ESCONDIDO, IZQUIERDA_O_DERECHA } from "../../../data/contabilidadActividades.js";
import {
  BANCO_IZQUIERDA_O_DERECHA, BANCO_DE_QUE_FAMILIA,
  BANCO_CORRIENTE_DE_CUENTAS,
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

/*
 * CU-1: la ficha se lleva al lado que corresponde y cae dentro de la cuenta T.
 * El primer verbo visual del tema, en su forma más desnuda.
 */
export const IzquierdaODerecha = ({ onCompletar }) => (
  <SoltarEnUnLado Marco={MarcoLibros} acento={A}
    rotulo="CIMIENTOS" titulo={IZQUIERDA_O_DERECHA.subtema} onCompletar={onCompletar} />
);

/*
 * CU-2: el balance en blanco. Cada acierto ESCRIBE su renglon, y el documento
 * se va llenando: equivocarse deja de ser fallar una pregunta y pasa a ser
 * escribir una deuda donde va una propiedad.
 */
export const DeQueFamilia = ({ onCompletar }) => (
  <ArmaElBalance Marco={MarcoLibros} acento={A}
    rotulo="CIMIENTOS" titulo="Clasificación de cuentas reales" onCompletar={onCompletar} />
);

/*
 * CU-3: el cuadro resumen del capitulo, vacio. El estudiante coloca solo la
 * casilla de debito de cada fila y la de credito se llena sola en espejo; al
 * completar las seis, las filas se reordenan en dos bloques. Ese
 * reordenamiento es la actividad: seis reglas que resultan ser dos.
 */
export const CuadroDinamicas = ({ onCompletar }) => (
  <CuadroDeDinamicas Marco={MarcoLibros} acento={A}
    rotulo="APLICACIÓN" titulo={SUBTEMA_CUADRO} onCompletar={onCompletar} />
);

/*
 * CU-4: la ficha va al debe o al haber de la cuenta preguntada, y SOLO al
 * acertar se materializa la contrapartida debajo, con su arco. Ensenarla tras
 * un fallo regalaria la logica: el estudiante deduciria su lado del de la otra
 * sin razonarlo. Su sitio esta reservado y liso desde el principio, porque un
 * hueco que se note tambien delata que hay una segunda cuenta.
 */
export const DebitaOAcredita = ({ onCompletar }) => (
  <DebitaOAcreditaMecanica Marco={MarcoLibros} acento={A}
    rotulo="APLICACIÓN" titulo={SUBTEMA_A4} onCompletar={onCompletar} />
);

/*
 * CU-5: la cuenta T con sus movimientos, y dos preguntas —la cifra y el lado—
 * que se confirman JUNTAS. Si el lado se preguntara despues de ver la
 * cancelacion, la columna en pie seria la respuesta. Y en un primer error la
 * cancelacion no corre: el reintento no tendria nada que calcular.
 */
export const ElSaldoDeLaCuenta = ({ onCompletar }) => (
  <ElSaldoDeLaCuentaMecanica Marco={MarcoLibros} acento={A}
    rotulo="ANÁLISIS" titulo={SUBTEMA_A5} onCompletar={onCompletar} />
);

/*
 * CU-6: el estudiante nombra las dos cuentas, pone cada valor en un lado y
 * confirma. Las TRES senales —el arco del cuadre, el triangulo con su flecha
 * y la linea al enunciado— aparecen SIEMPRE al confirmar: si alguna saliera
 * solo en el error, su presencia seria el veredicto.
 */
export const ArmaElAsiento = ({ onCompletar }) => (
  <ElAsientoSimpleMecanica Marco={MarcoLibros} acento={A}
    rotulo="ANÁLISIS" titulo={SUBTEMA_A6} onCompletar={onCompletar} />
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
 * CU-9: la práctica intercalada, con las seis cuentas del mayor abiertas sobre
 * la mesa. Repetir la clasificación a velocidad ES la técnica (Rohrer, 2012) y
 * eso no se toca; lo que cambia es que las respuestas ya no se evaporan, se
 * apilan, y al final de la ronda queda un mayor de seis cuentas.
 */
export const CorrienteDeCuentas = ({ onCompletar }) => (
  <SeisCuentasAbiertas banco={BANCO_CORRIENTE_DE_CUENTAS} Marco={MarcoLibros} acento={A}
    rotulo="ANÁLISIS" titulo={BANCO_CORRIENTE_DE_CUENTAS.subtema} onCompletar={onCompletar} />
);

/*
 * CU-10: el nodo de totales. No hay arcos de una cuenta a otra —en un asiento
 * compuesto no hay parejas—: hay dos colectores y un conector que cierra
 * cuando las dos sumas coinciden. Y una T con DOS lineas al enunciado es la
 * senal de haber fundido dos cuentas en una.
 */
export const ElAsientoCompuesto = ({ onCompletar }) => (
  <ElAsientoCompuestoNuevoMecanica Marco={MarcoLibros} acento={A}
    rotulo="MAESTRÍA" titulo={SUBTEMA_A7} onCompletar={onCompletar} />
);


/* CU-11: el set entero — mayorizar cada renglon y despues los saldos. */
export const LaMayorizacion = ({ onCompletar }) => (
  <LaMayorizacionMecanica Marco={MarcoLibros} acento={A}
    rotulo="MAESTRÍA" titulo={MAYORIZACION.subtema} onCompletar={onCompletar} />
);

/*
 * CU-12: el mayor completo con un error sembrado dentro, y la balanza de los
 * dos totales arriba como instrumento de diagnostico — incluido el caso en el
 * que la balanza calla y el error esta igual.
 */
export const ElErrorEscondido = ({ onCompletar }) => (
  <ElErrorEscondidoMecanica Marco={MarcoLibros} acento={A}
    rotulo="MAESTRÍA" titulo={ERROR_ESCONDIDO.subtema} onCompletar={onCompletar} />
);
