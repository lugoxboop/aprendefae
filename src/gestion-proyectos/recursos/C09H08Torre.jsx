/*
 * C09 · H08 · La torre de luces (gp26-eje-c09-h08-torre, Medio, 25 × 2 FP × %).
 * La torre de truss de iluminación del escenario con cinco niveles vacíos;
 * los tablones (Formación … Disolución) se encajan de abajo hacia arriba y
 * los hámsters suben un piso con cada uno. Etapa 2: la torre armada; cada
 * escena llega como globo y el estudiante toca la plataforma; el equipo se
 * muda a ella solo después de acertar. Niveles de 48 px o más, con el
 * nombre escrito (diseño H08).
 */
import Partida from "../comun/Partida.jsx";
import { primero } from "../comun/objetos.jsx";
import { EstiloLote5, Lamina } from "../comun/lote5.jsx";
import { GP_C9_H08 } from "./textos-c9.js";

export const ID = GP_C9_H08.id;

// imagen-pendiente: torre-truss · tablon
const TORRE = primero("torre-truss", "andamio");
const TABLON = primero("tablon", "regla-madera");

function Pisos({ puestas, bien }) {
  return (
    <Lamina titulo="La torre de luces" data-torre={puestas.length}>
      <small>{bien ? "Torre armada: el equipo llegó arriba." : `Pisos encajados: ${puestas.length} de 5. El equipo sube uno con cada tablón.`}</small>
    </Lamina>
  );
}

function Plataforma(estado) {
  if (!estado.paso.texto) return null;
  const nombre = estado.paso.destinos.find((d) => d.id === estado.encaja)?.nombre;
  return <p className="gp2-pista" data-plataforma={estado.encaja ?? "espera"}>{estado.encaja ? `El equipo se muda a ${nombre}.` : "Toca la plataforma donde está hoy el equipo."}</p>;
}

export const ESCENA = {
  nombre: "torre", fondo: ["#1f2633", "#090c12"], acento: "#ffd166", luz: "rgba(255,209,102,.18)",
  portada: TORRE,
  mesa: "equipo",
  objetos: [TORRE],
  objetoTarjeta: TABLON,
  deAbajo: true,
  rotuloHueco: (k) => (k === 0 ? "Piso 1 · abajo" : k === 4 ? "Piso 5 · arriba" : `Piso ${k + 1}`),
  encimaOrden: (e) => <><EstiloLote5 /><Pisos {...e} /></>,
  objeto: { id: TORRE, alto: 72 },
  anim: "cae",
  disposicion: "columna",
  antes: () => <EstiloLote5 />,
  encima: (e) => <Plataforma {...e} />,
  destinos: { "*": { objeto: TABLON, alto: 18 } },
};

export default function C09H08Torre({ onTerminar, rng = null }) {
  return <Partida pieza={GP_C9_H08} escena={ESCENA} onTerminar={onTerminar} rng={rng} />;
}
