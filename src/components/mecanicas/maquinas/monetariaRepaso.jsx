import { FAE } from "../../../theme.js";
import { useAuth } from "../../../auth/AuthProvider.jsx";
import { ARTERIA, DOS_ENTRADAS } from "../../../data/monetariaRepaso.js";
import { MarcoMaquinas } from "../bloques/marcos.jsx";
import JuegoConTutorial from "../libros/JuegoConTutorial.jsx";
import PorCualArteria from "./PorCualArteria.jsx";
import DosEntradas from "./DosEntradas.jsx";

/*
 * Las dos actividades nuevas de Política Monetaria, con la firma de cualquier
 * mecánica del camino: solo `onCompletar`. Cada una va dentro de
 * JuegoConTutorial, el mismo que usa Contabilidad: la primera vez sale su
 * «Así se juega» y después, el botón «¿Cómo se juega?». El nombre ya está
 * encima, en la página del tema, así que el tutorial no lo repite.
 */

const T = FAE.teal;

function ConTutorial({ id, Mecanica, rotulo, onCompletar }) {
  const { usuario } = useAuth();
  return (
    <JuegoConTutorial
      juego={{ id, Mecanica }}
      usuarioId={usuario?.id ?? null}
      Marco={MarcoMaquinas}
      acento={T}
      rotulo={rotulo}
      tituloVisible={false}
      onCompletar={onCompletar}
    />
  );
}

/* Análisis, justo después de «La Cadena de Transmisión». */
export const PorCualArteriaEntra = ({ onCompletar }) => (
  <ConTutorial id={ARTERIA.id} Mecanica={PorCualArteria} rotulo="ANÁLISIS" onCompletar={onCompletar} />
);

/* Aplicación, justo después de «¿A Quién Le Pega la Tasa?». */
export const LasDosEntradas = ({ onCompletar }) => (
  <ConTutorial id={DOS_ENTRADAS.id} Mecanica={DosEntradas} rotulo="APLICACIÓN" onCompletar={onCompletar} />
);
