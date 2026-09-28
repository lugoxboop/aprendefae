import ElRecorridoDeUnHecho from "./ElRecorridoDeUnHecho.jsx";
import ExploraUsuarios from "./ExploraUsuarios.jsx";
import UnaFraseIntro from "./UnaFraseIntro.jsx";
import LaEcuacionContable from "./LaEcuacionContable.jsx";
import ExploraLosCuatroCasos from "./ExploraLosCuatroCasos.jsx";
import UnaFraseEcuacion from "./UnaFraseEcuacion.jsx";
import LaFotoYLaPelicula from "./LaFotoYLaPelicula.jsx";
import ExploraFotoOPelicula from "./ExploraFotoOPelicula.jsx";
import UnaFraseFotoPelicula from "./UnaFraseFotoPelicula.jsx";
import ComoSeArticulan from "./ComoSeArticulan.jsx";
import ExploraLasFlechas from "./ExploraLasFlechas.jsx";
import UnaFraseArticulacion from "./UnaFraseArticulacion.jsx";
import { ID } from "../../../../data/contabilidadIntro.js";
import { ID_P2, ID_P3, ID_P4 } from "../../../../data/contabilidadPiezas234.js";

/*
 * Qué componentes monta cada pieza del Tema 1, como en `escenas.jsx` del Tema
 * 2. Las tres capas con máquina propia van aquí; la capa 1 la dibuja
 * `CuatroCapas` con los nombres del contenido.
 *
 * Cada pieza trae su propia figura y ninguna reusa la de otra: el anillo de la
 * 1 significa «el ciclo de la información», la torre de la 2 «una sola cosa
 * leída dos veces», las dos fotos de la 3 «un momento contra un periodo» y las
 * flechas de la 4 «todo converge en un informe». Prestarse figuras entre
 * piezas las vaciaría.
 */
export const ESCENAS_INTRO = {
  [ID]: {
    Capa2: ElRecorridoDeUnHecho,
    Exploracion: ExploraUsuarios,
    Capa4: UnaFraseIntro,
  },
  [ID_P2]: {
    Capa2: LaEcuacionContable,
    Exploracion: ExploraLosCuatroCasos,
    Capa4: UnaFraseEcuacion,
  },
  [ID_P3]: {
    Capa2: LaFotoYLaPelicula,
    Exploracion: ExploraFotoOPelicula,
    Capa4: UnaFraseFotoPelicula,
  },
  [ID_P4]: {
    Capa2: ComoSeArticulan,
    Exploracion: ExploraLasFlechas,
    Capa4: UnaFraseArticulacion,
  },
};
