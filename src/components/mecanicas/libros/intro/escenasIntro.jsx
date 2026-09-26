import ElRecorridoDeUnHecho from "./ElRecorridoDeUnHecho.jsx";
import ExploraUsuarios from "./ExploraUsuarios.jsx";
import UnaFraseIntro from "./UnaFraseIntro.jsx";
import { ID } from "../../../../data/contabilidadIntro.js";

/*
 * Qué componentes monta cada pieza del Tema 1, como en `escenas.jsx` del Tema
 * 2. Las tres capas con máquina propia van aquí; la capa 1 la dibuja
 * `CuatroCapas` con los nombres del contenido.
 */
export const ESCENAS_INTRO = {
  [ID]: {
    Capa2: ElRecorridoDeUnHecho,
    Exploracion: ExploraUsuarios,
    Capa4: UnaFraseIntro,
  },
};
