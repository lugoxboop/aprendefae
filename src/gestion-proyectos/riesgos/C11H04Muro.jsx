/*
 * C11 · H04 · El muro del taller (gp26-pla-c11-h04-muro, Medio, 25 × 2 FP × %).
 * El rollo de papel kraft en la pared, con tres columnas marcadas con cinta:
 * Amenaza (↓), Oportunidad (↑) y No es riesgo («ya es cierto»). El hámster
 * pega notas, el hurón trae más y el zorro sostiene el marcador. Etapa 2:
 * sobre el mismo papel, una chinche grande por técnica (solo las de la
 * partida); al acertar, la chinche entra y la situación se subraya.
 */
import Partida from "../comun/Partida.jsx";
import { primero } from "../comun/objetos.jsx";
import { cuantos } from "../comun/lote2.jsx";
import { EstiloLote6 } from "../comun/lote6.jsx";
import { GP_C11_H04 } from "./textos-c11.js";

export const ID = GP_C11_H04.id;

// imagen-pendiente: papel-kraft · nota-adhesiva · cinta-adhesiva · marcador · chinche
const MURO = primero("papel-kraft", "tablero-corcho");
const NOTA = primero("nota-adhesiva", "ficha-fichero");
const CHINCHE = primero("chinche", "pinza-ropa");

function Columnas(estado) {
  if (estado.paso.destinos?.length !== 3) return null;
  return (
    <div className="gp5-chips" style={{ marginTop: 8 }} data-columnas={["amenaza", "oportunidad", "nova"].map((k) => cuantos(estado, k)).join("-")}>
      {estado.paso.destinos.map((d) => <span key={d.id} className="gp5-chip" data-on={cuantos(estado, d.id) ? "1" : undefined}>{d.nombre}: {cuantos(estado, d.id)} {cuantos(estado, d.id) === 1 ? "nota" : "notas"}</span>)}
    </div>
  );
}

export const ESCENA = {
  nombre: "muro", fondo: ["#3b2c1c", "#140e08"], acento: "#e9c46a", luz: "rgba(233,196,106,.16)",
  portada: MURO,
  mesa: "equipo",
  objeto: { id: MURO, alto: 72, lugar: "detras" },
  anim: "cae",
  disposicion: "fila3",
  antes: () => <EstiloLote6 />,
  encima: (e) => <Columnas {...e} />,
  destinos: { "*": { objeto: NOTA, alto: 26 } },
  etapas: [{}, { mesa: "tu", disposicion: "rejilla", destinos: { "*": { objeto: CHINCHE, alto: 26 } } }],
};

export default function C11H04Muro({ onTerminar, rng = null }) {
  return <Partida pieza={GP_C11_H04} escena={ESCENA} onTerminar={onTerminar} rng={rng} />;
}
