/*
 * C03 · H06 · La comanda de la mañana (gp26-fun-c03-h06-comandas, Medio, 25 × 2 FP × %).
 * Etapa 1: la comandera imprime el mensaje del día en un tiquete largo; al
 * lado, la puerta de la nevera con seis imanes rotulados con los estilos. Al
 * pegar el tiquete bajo su imán, el equipo reacciona con la pose del estilo.
 * Etapa 2: cuatro pinchos de comandas (Del líder, Del equipo, De la
 * organización, Del entorno); cada nota impresa se clava en el suyo.
 */
import Partida from "../comun/Partida.jsx";
import { Objeto, primero } from "../comun/objetos.jsx";
import { EstiloLote2 } from "../comun/lote2.jsx";
import { Personaje } from "../comun/elenco.jsx";
import { ESTILOS, GP_C3_H06 } from "./textos-c3.js";

export const ID = GP_C3_H06.id;
const COMANDERA = primero("comandera", "caja-registradora");
const IMAN = primero("iman");
const NEVERA = primero("nevera-barra", "archivador-metalico");
const PINCHO = primero("pincho-comandas", "portapapeles");

function Reaccion({ encaja, intento }) {
  if (!encaja) return null;
  const pose = ESTILOS.find((s) => s.id === encaja)?.pose;
  return (
    <div className="gp-escenita gp2-entra" data-reaccion={encaja}>
      <Personaje quien="equipo" alto={120} animo={intento === 1 ? "feliz" : "quieta"} />
      <span>{pose}</span>
    </div>
  );
}

export const ESCENA = {
  nombre: "comandas", fondo: ["#1d2a33", "#0b1217"], acento: "#f4a261", luz: "rgba(244,162,97,.2)",
  portada: COMANDERA,
  objeto: { id: COMANDERA, alto: 92, lugar: "detras" },
  anim: "sella",
  antes: () => <EstiloLote2 />,
  etapas: [
    { disposicion: "fila3", destinos: { "*": { objeto: IMAN, alto: 30 } }, despues: (e) => <Reaccion {...e} />,
      encima: () => <div className="gp2-fila" aria-hidden="true"><Objeto id={NEVERA} alto={72} /><small>La nevera de la barra, con sus seis imanes.</small></div> },
    { disposicion: "rejilla", destinos: { "*": { objeto: PINCHO, alto: 40 } } },
  ],
};

export default function C03H06Comandas({ onTerminar, rng = null }) {
  return <Partida pieza={GP_C3_H06} escena={ESCENA} onTerminar={onTerminar} rng={rng} />;
}
