/*
 * H10 · Del grano a la taza (gp26-fun-h10-cafetera, Fácil, 10 FP × %).
 * La cafetera de goteo de tres pisos: arriba Datos (granos crudos), en medio
 * Información (filtro con café), abajo Informe (taza servida a la
 * patrocinadora). Al acertar, la pieza baja por la cafetera con goteo.
 * El flujo es el del gráfico 1-7 (datos → información → informe).
 */
import { Bean, Coffee, Filter } from "lucide-react";
import Partida from "../comun/Partida.jsx";
import { Objeto } from "../comun/objetos.jsx";
import { GP_H10 } from "./textos-c1.js";

export const ID = GP_H10.id;
export const ESCENA = {
  nombre: "cafetera", fondo: ["#3a2618", "#180e08"], acento: "#f4a261", luz: "rgba(244,162,97,.22)",
  portada: "cafetera-goteo",
  mesa: "patrocinadora",
  objeto: null,
  anim: "gotea",
  disposicion: "columna",
  destinos: { datos: { icono: Bean }, informacion: { icono: Filter }, informe: { icono: Coffee } },
  encima: () => (
    <div style={{ display: "flex", justifyContent: "center", marginTop: 8 }} aria-hidden="true">
      <Objeto id="cafetera-goteo" alto={110} />
    </div>
  ),
};

export default function H10Cafetera({ onTerminar, rng = null }) {
  return <Partida pieza={GP_H10} escena={ESCENA} onTerminar={onTerminar} rng={rng} />;
}
