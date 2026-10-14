import { FAE } from "../../../theme.js";
import { EN_QUE_TALLA_VA, QUE_TOCO_EL_BANCO } from "../../../data/pmAgregados.js";
import PrimeraClasificacion from "../bloques/PrimeraClasificacion.jsx";
import { MarcoMaquinas } from "../bloques/marcos.jsx";

/*
 * Los dos juegos de «Las tallas del dinero», con la firma de cualquier
 * mecánica del sitio: solo `onCompletar`. Archivo nuevo: actividades.jsx no se
 * toca. La mecánica es la de ¿Quién Decide Esto? (PrimeraClasificacion), tal
 * cual: un ítem a la vez, un solo toque, las categorías siempre a la vista y
 * la devolución del banco con ✅/❌. Cambian el banco y el rótulo del bloque.
 */

const T = FAE.teal;

/* Cimientos · Fácil · 10 FP. */
export const EnQueTallaVa = ({ onCompletar }) => (
  <PrimeraClasificacion banco={EN_QUE_TALLA_VA} Marco={MarcoMaquinas} acento={T}
    rotulo="CIMIENTOS" titulo={EN_QUE_TALLA_VA.subtema} onCompletar={onCompletar} />
);

/* Aplicación · Medio · 25 FP. */
export const QueTocoElBanco = ({ onCompletar }) => (
  <PrimeraClasificacion banco={QUE_TOCO_EL_BANCO} Marco={MarcoMaquinas} acento={T} barajarOpciones
    rotulo="APLICACIÓN" titulo={QUE_TOCO_EL_BANCO.subtema} onCompletar={onCompletar} />
);
