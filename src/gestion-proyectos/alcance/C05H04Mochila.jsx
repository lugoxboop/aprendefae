/*
 * C05 · H04 · La mochila de campo (gp26-pla-c05-h04-mochila, Medio, 25 FP × %).
 * La mochila abierta arriba, siempre visible, y el perchero con los ocho
 * instrumentos (cada uno con su nombre escrito): a 320 px, dos columnas de
 * cuatro. La situación llega en el globo sobre el zorro; al acertar, el
 * instrumento entra en la mochila y se ve un momento su mini escena.
 */
import Partida from "../comun/Partida.jsx";
import { Objeto } from "../comun/objetos.jsx";
import { colocados } from "../comun/lote2.jsx";
import { EstiloLote3 as EstiloLote2 } from "../comun/lote3.jsx";
import { GP_C5_H04, TECNICAS_C5 } from "./textos-c5.js";

export const ID = GP_C5_H04.id;

const INSTRUMENTO = {
  entrevista: "grabadora", focal: "mesa-redonda", encuesta: "fajo-formularios", observacion: "binoculares",
  prototipo: "maqueta-carton", guion: "tira-vinetas", documentos: "carpeta-documento", comparativo: "taza-marca-azul",
};
const MINI = {
  entrevista: "La grabadora registra la charla uno a uno.", focal: "El moderador abre la mesa redonda.", encuesta: "Salen 3.000 formularios.",
  observacion: "Los binoculares enfocan a un mesero.", prototipo: "La maqueta pasa de mano en mano.", guion: "Las viñetas muestran pantalla tras pantalla.",
  documentos: "Se abre la carpeta de la ordenanza.", comparativo: "Dos tazas, dos marcas, lado a lado.",
};

function Mochila(estado) {
  const guardados = colocados(estado);
  return (
    <div className="gp2-caja" data-mochila style={{ marginTop: 10 }}>
      <b>En la mochila · {guardados.length}</b>
      <div className="gp2-fila" style={{ justifyContent: "flex-start" }}>
        {guardados.map((x, k) => <span key={`${x.id}-${k}`} className={k === guardados.length - 1 && estado.encaja ? "gp2-entra" : ""}><Objeto id={INSTRUMENTO[x.destino]} alto={30} /></span>)}
      </div>
      {estado.encaja && <small className="gp2-entra" data-mini-escena>{MINI[estado.encaja]}</small>}
    </div>
  );
}

export const ESCENA = {
  nombre: "mochila", fondo: ["#2a3322", "#0f140b"], acento: "#c5d86d", luz: "rgba(197,216,109,.2)",
  portada: "mochila-campo",
  objeto: { id: "mochila-campo", alto: 76 },
  anim: "cae",
  disposicion: "rejilla",
  antes: () => <EstiloLote2 />,
  encima: (e) => <Mochila {...e} />,
  destinos: Object.fromEntries(TECNICAS_C5.map((t) => [t.id, { objeto: INSTRUMENTO[t.id], alto: 64 }])),
};

export default function C05H04Mochila({ onTerminar, rng = null }) {
  return <Partida pieza={GP_C5_H04} escena={ESCENA} onTerminar={onTerminar} rng={rng} />;
}
