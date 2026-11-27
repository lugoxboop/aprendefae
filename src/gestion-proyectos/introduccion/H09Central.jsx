/*
 * H09 · La central de la obra (gp-h09-central, Medio, 25 FP × %).
 * El conmutador telefónico de madera con diez clavijas (ícono + nombre);
 * la llamada entra con su texto en el globo y se lleva el cable a la clavija
 * (arrastrar o tocar-tocar). El equipo habla por el teléfono. Acierto: el
 * foco queda encendido fijo con ✓. Celular: clavijas en 2 columnas de 5.
 */
import Partida from "../comun/Partida.jsx";
import { GP_H09 } from "./textos.js";

export const ID = GP_H09.id;
export const ESCENA = {
  nombre: "conmutador", fondo: ["#33251a", "#170f09"], acento: "#ffc978", luz: "rgba(255,201,120,.2)",
  portada: "conmutador",
  mesa: "equipo",
  objeto: { id: "telefono-antiguo", alto: 70 },
  anim: "conecta",
  disposicion: "rejilla",
  destinos: { "*": { forma: "clavija" } },
};

export default function H09Central({ onTerminar, rng = null }) {
  return <Partida pieza={GP_H09} escena={ESCENA} onTerminar={onTerminar} rng={rng} />;
}
