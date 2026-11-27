/*
 * C05 · H10 · La caja fuerte (gp26-pla-c05-h10-caja-fuerte, Medio, 25 × 2 FP × %).
 * Etapa 1: la caja fuerte con tres ranuras y seis documentos sobre la mesa. Al
 * meter las tres correctas, la patrocinadora gira la perilla, la puerta se
 * cierra y aparece la placa «Línea base aprobada». Etapa 2: la ficha de fichero
 * de biblioteca con seis renglones rotulados; dos datos no van y se tiran a la
 * caneca.
 */
import { Lock, X } from "lucide-react";
import Partida from "../comun/Partida.jsx";
import { Objeto } from "../comun/objetos.jsx";
import { cuantos } from "../comun/lote2.jsx";
import { EstiloLote3 as EstiloLote2 } from "../comun/lote3.jsx";
import { GP_C5_H10 } from "./textos-c5.js";

export const ID = GP_C5_H10.id;
const CAMPOS = [["codigo", "Código"], ["descripcion", "Descripción"], ["responsable", "Responsable"], ["hito", "Hito"], ["costo", "Costo"], ["aceptacion", "Aceptación"]];

function Caja(estado) {
  const { paso } = estado;
  if (!paso.texto) return null;
  if (paso.clave === "entra" || paso.clave === "fuera") {
    const dentro = cuantos(estado, "entra");
    return (
      <div className="gp-escenita" data-ranuras={dentro}>
        <span className="gp2-fila">{[0, 1, 2].map((k) => <span key={k} className="gp-chip-c" style={{ opacity: k < dentro ? 1 : 0.35 }}>{k < dentro ? "✓" : "·"}</span>)}</span>
        {dentro === 3 ? <span className="gp-chip-c gp2-entra" data-placa>Línea base aprobada</span> : <small>{dentro} de 3 ranuras</small>}
      </div>
    );
  }
  return (
    <div className="gp2-caja" data-ficha-fichero style={{ marginTop: 10 }}>
      <b>Diccionario · paquete 1.3.2</b>
      <div className="gp2-rejilla" style={{ "--gp2-cols": 2, marginTop: 0 }}>
        {CAMPOS.map(([k, n]) => <small key={k} data-renglon={k} style={{ opacity: cuantos(estado, k) ? 1 : 0.5 }}>{cuantos(estado, k) ? "✓" : "·"} {n}</small>)}
      </div>
      <div className="gp2-fila" style={{ justifyContent: "flex-start", marginTop: 4 }}><Objeto id="caneca" alto={26} /><small>{cuantos(estado, "nova")} a la caneca</small></div>
    </div>
  );
}

export const ESCENA = {
  nombre: "caja-fuerte", fondo: ["#262a30", "#0c0e11"], acento: "#c9d1db", luz: "rgba(201,209,219,.2)",
  portada: "caja-fuerte",
  mesa: "patrocinadora",
  objeto: { id: "caja-fuerte", alto: 84 },
  anim: "cae",
  antes: () => <EstiloLote2 />,
  encima: (e) => <Caja {...e} />,
  destinos: { entra: { icono: Lock, objeto: "carpeta-documento", alto: 30 }, fuera: { icono: X } },
  etapas: [{}, { objeto: { id: "ficha-fichero", alto: 76 }, mesa: "tu", disposicion: "rejilla", destinos: { nova: { objeto: "caneca", alto: 26 } } }],
};

export default function C05H10CajaFuerte({ onTerminar, rng = null }) {
  return <Partida pieza={GP_C5_H10} escena={ESCENA} onTerminar={onTerminar} rng={rng} />;
}
