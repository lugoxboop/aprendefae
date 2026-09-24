import { FAE } from "../../../theme.js";
import PrimeraClasificacion from "../bloques/PrimeraClasificacion.jsx";
import { MarcoLibros } from "../bloques/marcos.jsx";
import {
  BANCO_IZQUIERDA_O_DERECHA, BANCO_DE_QUE_FAMILIA, BANCO_CUADRO_DINAMICAS,
  BANCO_DEBITA_O_ACREDITA, BANCO_CORRIENTE_DE_CUENTAS,
} from "../../../contabilidad/bancos.js";

/*
 * ═══════════════════════════════════════════════════════════════════════════
 * LAS ACTIVIDADES DE «LAS CUENTAS, EL DEBE Y EL HABER» QUE YA SE PUEDEN JUGAR.
 *
 * Cinco de las doce, las que caben en una mecánica que ya existe: clasificar
 * un enunciado entre dos o seis categorías. Es la convención del sitio —misma
 * mecánica, mismo motor, mismo gesto— y aquí además es lo que hace que el tema
 * quede jugable hoy en vez de dentro de tres bloques de trabajo.
 *
 * Las otras siete piden mecánicas nuevas (construir un asiento, mayorizar,
 * encontrar un error sembrado) y son el bloque siguiente. Mientras tanto NO
 * aparecen en el camino: un nodo que se abre a una pantalla en blanco es peor
 * que un nodo que todavía no está.
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
