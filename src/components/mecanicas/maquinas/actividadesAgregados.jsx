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
 *
 * La consigna de Near es más larga que un rótulo: PrimeraClasificacion no
 * tiene dónde ponerla, así que va en el marco, arriba de cada enunciado, sin
 * tocar el componente compartido.
 */

const T = FAE.teal;

const CONSIGNA = { margin: "0 0 14px", fontSize: "14px", lineHeight: 1.55, color: "rgba(248,249,250,0.82)" };

function conConsigna(consigna) {
  return function MarcoConConsigna({ children, ...props }) {
    return (
      <MarcoMaquinas {...props}>
        <p data-consigna style={CONSIGNA}>{consigna}</p>
        {children}
      </MarcoMaquinas>
    );
  };
}

const MarcoTallas = conConsigna(EN_QUE_TALLA_VA.consigna);
const MarcoToco = conConsigna(QUE_TOCO_EL_BANCO.consigna);

/* Cimientos · Fácil · 10 FP. */
export const EnQueTallaVa = ({ onCompletar }) => (
  <PrimeraClasificacion banco={EN_QUE_TALLA_VA} Marco={MarcoTallas} acento={T}
    rotulo="CIMIENTOS" titulo={EN_QUE_TALLA_VA.subtema} onCompletar={onCompletar} />
);

/* Aplicación · Medio · 25 FP. */
export const QueTocoElBanco = ({ onCompletar }) => (
  <PrimeraClasificacion banco={QUE_TOCO_EL_BANCO} Marco={MarcoToco} acento={T} barajarOpciones
    rotulo="APLICACIÓN" titulo={QUE_TOCO_EL_BANCO.subtema} onCompletar={onCompletar} />
);
