/*
 * C06 · H02 · La linterna del túnel (gp26-pla-c06-h02-linterna, Fácil, 10 × 2 FP × %).
 * Etapa 1: la caja del paquete de trabajo «Local adecuado» se abre y deja salir
 * tarjetas hacia tres bandejas: Actividad (mano con brocha) · Hito (banderín,
 * duración 0) · Entregable de la EDT (caja cerrada). Etapa 2: el túnel con el
 * zorro sosteniendo la linterna: cerca, piedras nítidas (lo que se detalla
 * hoy); lejos, en penumbra, bultos con nombre (paquetes de planificación).
 */
import { Paintbrush, Flag, Package, Flashlight, Moon } from "lucide-react";
import Partida from "../comun/Partida.jsx";
import { Objeto } from "../comun/objetos.jsx";
import { EstiloLote2, cuantos } from "../comun/lote2.jsx";
import { GP_C6_H02 } from "./textos-c6.js";

export const ID = GP_C6_H02.id;

function Tunel(estado) {
  const { paso } = estado;
  if (paso.clave !== "hoy" && paso.clave !== "penumbra") return null;
  return (
    <div className="gp2-rejilla" style={{ "--gp2-cols": 2 }} data-tunel>
      <div className="gp2-caja" data-zona="hoy"><b>Iluminado</b><div className="gp2-fila">{Array.from({ length: Math.max(1, cuantos(estado, "hoy")) }, (_, k) => <Objeto key={k} id="piedra" alto={28} />)}</div></div>
      <div className="gp2-caja" data-zona="penumbra" style={{ opacity: 0.7 }}><b>En penumbra</b><div className="gp2-fila">{Array.from({ length: Math.max(1, cuantos(estado, "penumbra")) }, (_, k) => <Objeto key={k} id="saco-arena" alto={28} />)}</div></div>
    </div>
  );
}

export const ESCENA = {
  nombre: "linterna", fondo: ["#262318", "#0c0b07"], acento: "#ffd166", luz: "rgba(255,209,102,.24)",
  portada: "linterna",
  objeto: { id: "caja-paquete", alto: 76 },
  anim: "cae",
  antes: () => <EstiloLote2 />,
  encima: (e) => <Tunel {...e} />,
  destinos: { actividad: { icono: Paintbrush, objeto: "bandeja-carton", alto: 28 }, hito: { icono: Flag, objeto: "bandeja-carton", alto: 28 }, entregable: { icono: Package, objeto: "bandeja-carton", alto: 28 } },
  etapas: [{}, { objeto: { id: "tunel", alto: 84, lugar: "detras" }, portada: "linterna", destinos: { hoy: { icono: Flashlight, objeto: "linterna", alto: 32 }, penumbra: { icono: Moon } } }],
};

export default function C06H02Linterna({ onTerminar, rng = null }) {
  return <Partida pieza={GP_C6_H02} escena={ESCENA} onTerminar={onTerminar} rng={rng} />;
}
