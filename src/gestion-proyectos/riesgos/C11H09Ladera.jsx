/*
 * C11 · H09 · La roca de la ladera (gp26-pla-c11-h09-ladera, Medio, 25 FP × %).
 * La ladera con la planta tostadora abajo; cada amenaza es una roca suelta
 * arriba con la respuesta en su etiqueta. Cinco destinos, cada uno con su
 * consecuencia (la metáfora de la estrategia), que se lee SOLO al encajar:
 * Escalar sube la roca a la junta en la cima; Evitar cierra el paso (la roca
 * ya no puede bajar: probabilidad 0); Transferir la carga el camión de la
 * aseguradora; Mitigar la frena el muro (baja menos y más pequeña); Aceptar
 * la deja con su costal de reserva (activa) o su ojo de revisión (pasiva).
 */
import Partida from "../comun/Partida.jsx";
import { primero } from "../comun/objetos.jsx";
import { EstiloLote6 } from "../comun/lote6.jsx";
import { GP_C11_H09 } from "./textos-c11.js";

export const ID = GP_C11_H09.id;

// imagen-pendiente: ladera-rocas · cabina-cable · camion-seguro · muro-contencion (senal-vial, saco-arena, piedra ya existen)
const LADERA = primero("ladera-rocas", "montana");
const ROCA = primero("piedra");
const EFECTO = {
  escalar: "La cabina sube la roca a la oficina de la junta, en la cima.",
  evitar: "Se cierra el paso con un desvío: la roca ya no puede bajar (probabilidad 0).",
  transferir: "El camión de la aseguradora carga la roca: la lleva otro, con prima.",
  mitigar: "El muro de contención la frena: baja menos y más pequeña.",
  aceptar: "La roca se queda; a su lado, un costal de reserva u ojo de revisión.",
};

function Consecuencia(estado) {
  if (!estado.encaja || !EFECTO[estado.encaja]) return null;
  return <p className="gp2-pista" data-consecuencia={estado.encaja} style={{ textAlign: "left" }}>{EFECTO[estado.encaja]}</p>;
}

export const ESCENA = {
  nombre: "ladera", fondo: ["#2c3a24", "#0d120a"], acento: "#c9b37e", luz: "rgba(201,179,126,.16)",
  portada: LADERA,
  mesa: "tu",
  objeto: { id: ROCA, alto: 60 },
  anim: "cae",
  antes: () => <EstiloLote6 />,
  despues: (e) => <Consecuencia {...e} />,
  destinos: {
    escalar: { objeto: primero("cabina-cable", "tranvia"), alto: 30 },
    evitar: { objeto: primero("senal-vial"), alto: 30 },
    transferir: { objeto: primero("camion-seguro", "camion-cafe"), alto: 30 },
    mitigar: { objeto: primero("muro-contencion", "pared-ladrillo"), alto: 30 },
    aceptar: { objeto: primero("saco-arena"), alto: 30 },
  },
};

export default function C11H09Ladera({ onTerminar, rng = null }) {
  return <Partida pieza={GP_C11_H09} escena={ESCENA} onTerminar={onTerminar} rng={rng} />;
}
