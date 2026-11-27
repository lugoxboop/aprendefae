/*
 * C05 · H08 · El mapa de dos escalas (gp26-pla-c05-h08-mapa, Medio, 25 × 2 FP × %).
 * Etapa 1: el mapa plegable con dos caras. Acta = mapa de Colombia con un punto
 * en Manizales (vista general); Enunciado = mapa de calles del barrio (detalle).
 * La patrocinadora sostiene el mapa; al acertar, la tarjeta se pega como
 * etiqueta en su cara. Etapa 2: el mapa de calles se dobla y queda como base de
 * la hoja de enunciado con cuatro secciones con ícono.
 */
import { Map, MapPin, Smartphone, Package, CircleCheck, Ban } from "lucide-react";
import Partida from "../comun/Partida.jsx";
import { Objeto } from "../comun/objetos.jsx";
import { EstiloLote2, cuantos } from "../comun/lote2.jsx";
import { GP_C5_H08 } from "./textos-c5.js";

export const ID = GP_C5_H08.id;

function Caras(estado) {
  if (!estado.paso.texto || estado.paso.mesa === "cliente") return null;
  const esActa = estado.paso.clave === "acta" || estado.paso.clave === "enunciado";
  if (!esActa) {
    return (
      <div className="gp2-rejilla" style={{ "--gp2-cols": 4 }} data-hoja-enunciado>
        {[["descripcion", "Descripción"], ["entregables", "Entregables"], ["criterios", "Criterios"], ["exclusiones", "Exclusiones"]].map(([k, n]) => (
          <div key={k} className="gp2-caja" data-seccion={k} data-lleno={cuantos(estado, k) ? "1" : undefined} style={{ textAlign: "center" }}>
            <b style={{ margin: 0 }}>{n}</b><span className="da26-mono">{cuantos(estado, k)}</span>
          </div>
        ))}
      </div>
    );
  }
  return (
    <div className="gp2-rejilla" style={{ "--gp2-cols": 2 }} data-mapa-caras>
      <div className="gp2-caja" data-cara="acta"><b>Acta · vista general</b><small>Colombia, un punto en Manizales</small><div className="da26-mono">{cuantos(estado, "acta")} etiquetas</div></div>
      <div className="gp2-caja" data-cara="enunciado"><b>Enunciado · detalle</b><small>Las calles del barrio, cuadra por cuadra</small><div className="da26-mono">{cuantos(estado, "enunciado")} etiquetas</div></div>
    </div>
  );
}

export const ESCENA = {
  nombre: "mapa", fondo: ["#1f3326", "#0a140d"], acento: "#9ad27a", luz: "rgba(154,210,122,.2)",
  portada: "mapa-plegable",
  mesa: "patrocinadora",
  objeto: { id: "mapa-plegable", alto: 84 },
  anim: "cae",
  antes: () => <EstiloLote2 />,
  encima: (e) => <Caras {...e} />,
  destinos: { acta: { icono: Map }, enunciado: { icono: MapPin }, descripcion: { icono: Smartphone }, entregables: { icono: Package }, criterios: { icono: CircleCheck }, exclusiones: { icono: Ban } },
  etapas: [{}, { objeto: { id: "memorando-clip", alto: 72 }, mesa: "tu" }],
};

export default function C05H08Mapa({ onTerminar, rng = null }) {
  return <Partida pieza={GP_C5_H08} escena={ESCENA} onTerminar={onTerminar} rng={rng} />;
}
