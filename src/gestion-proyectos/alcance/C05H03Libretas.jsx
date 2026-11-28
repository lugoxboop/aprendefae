/*
 * C05 · H03 · Las dos libretas (gp26-pla-c05-h03-libretas, Medio, 25 FP × %).
 * La encuadernadora de anillos al centro y dos libretas anilladas: la azul del
 * alcance y la verde de los requisitos. La página sale del montón del
 * practicante; al acertar, la máquina la perfora y la ensarta en los anillos
 * (la libreta engorda una página).
 */
import { Network, ListChecks } from "lucide-react";
import Partida from "../comun/Partida.jsx";
import { Objeto } from "../comun/objetos.jsx";
import { cuantos } from "../comun/lote2.jsx";
import { EstiloLote3 as EstiloLote2 } from "../comun/lote3.jsx";
import { GP_C5_H03 } from "./textos-c5.js";

export const ID = GP_C5_H03.id;

function Libretas(estado) {
  if (!estado.paso.texto) return null;
  return (
    <div className="gp2-rejilla" style={{ "--gp2-cols": 3 }} data-libretas>
      <div className="gp2-pieza" data-libreta="alcance"><Objeto id="libreta-anillada" alto={52} /><small>Alcance · {cuantos(estado, "alcance")} pág.</small></div>
      <div className="gp2-pieza"><span className={estado.encaja ? "gp2-tambalea" : ""}><Objeto id="encuadernadora" alto={52} /></span><small>{estado.encaja ? "¡Clic! Ensartada" : "Lista para perforar"}</small></div>
      <div className="gp2-pieza" data-libreta="requisitos"><Objeto id="libreta-anillada-verde" alto={52} /><small>Requisitos · {cuantos(estado, "requisitos")} pág.</small></div>
    </div>
  );
}

export const ESCENA = {
  nombre: "libretas", fondo: ["#232a3d", "#0c1018"], acento: "#8fb3ff", luz: "rgba(143,179,255,.2)",
  portada: "encuadernadora",
  mesa: "practicante",
  objeto: { id: "monton-hojas", alto: 60, lugar: "detras" },
  anim: "cae",
  antes: () => <EstiloLote2 />,
  encima: (e) => <Libretas {...e} />,
  destinos: { alcance: { icono: Network, objeto: "libreta-anillada", alto: 34 }, requisitos: { icono: ListChecks, objeto: "libreta-anillada-verde", alto: 34 } },
};

export default function C05H03Libretas({ onTerminar, rng = null }) {
  return <Partida pieza={GP_C5_H03} escena={ESCENA} onTerminar={onTerminar} rng={rng} />;
}
