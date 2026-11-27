/*
 * C08 · H12 · Las seis cortinas de despacho (gp26-moc-c08-h12-despacho, Difícil, 50 × 3 FP × %).
 * La zona de despacho de la planta con seis cortinas metálicas enrollables
 * rotuladas y una estiba con cajas que se lleva a cada cortina (la estiba se
 * desliza y la cortina baja con su rótulo ✓). Tras la cortina «Validar el
 * Alcance» espera el cliente. Etapa 2: cuatro cajas de la retrospectiva.
 * Etapa 3: los microdesafíos de cierre.
 */
import Partida from "../comun/Partida.jsx";
import { Objeto, primero } from "../comun/objetos.jsx";
import { colocados } from "../comun/lote2.jsx";
import { EstiloLote4 } from "../comun/lote4.jsx";
import { GP_C8_H12 } from "./textos-c8.js";

export const ID = GP_C8_H12.id;

// imagen-pendiente: muelle-despacho · estiba-cajas
const MUELLE = primero("muelle-despacho", "porton-madera");
const ESTIBA = primero("estiba-cajas", "caja-paquete");

function Cortinas(estado) {
  if (!estado.paso.texto) return null;
  const n = colocados(estado).length;
  return (
    <div className="gp-escenita" data-cortinas-bajas={n}>
      <span className="gp2-gira" style={{ display: "block", transform: `translateX(${estado.encaja ? 14 : 0}px)` }}><Objeto id={ESTIBA} alto={40} /></span>
      <small>{n} cortinas abajo con su salida ✓</small>
    </div>
  );
}

export const ESCENA = {
  nombre: "despacho", fondo: ["#2b2d30", "#0d0e10"], acento: "#ffc978", luz: "rgba(255,201,120,.16)",
  portada: MUELLE,
  mesa: "tu",
  objeto: { id: MUELLE, alto: 72 },
  anim: "cae",
  disposicion: "tablero",
  antes: () => <EstiloLote4 />,
  encima: (e) => <Cortinas {...e} />,
  destinos: { "*": { objeto: MUELLE, alto: 28 } },
  etapas: [{}, { disposicion: "rejilla", destinos: { "*": { objeto: ESTIBA, alto: 28 } } }, { destinos: {}, disposicion: "columna" }],
};

export default function C08H12Despacho({ onTerminar, rng = null }) {
  return <Partida pieza={GP_C8_H12} escena={ESCENA} onTerminar={onTerminar} rng={rng} />;
}
