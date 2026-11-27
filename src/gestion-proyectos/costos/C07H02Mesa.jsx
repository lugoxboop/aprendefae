/*
 * C07 · H02 · Cuatro maneras de estimar (gp26-pla-c07-h02-metodos, Fácil, 10 FP × %).
 * La mesa de dibujo vista desde arriba con cuatro objetos-destino: la foto
 * enmarcada de la bodega de Manizales (análoga), el plano cuadriculado por m²
 * (paramétrica), la pila de cajas numeradas (ascendente) y las tres torres de
 * monedas O · M · P (tres valores). El hámster desliza las tarjetas; al
 * acertar, el objeto se ilumina y la cifra vuela a la maqueta del centro.
 */
import Partida from "../comun/Partida.jsx";
import { Objeto, primero } from "../comun/objetos.jsx";
import { colocados } from "../comun/lote2.jsx";
import { EstiloLote4 } from "../comun/lote4.jsx";
import { GP_C7_H02 } from "./textos-c7.js";

export const ID = GP_C7_H02.id;

// imagen-pendiente: mesa-dibujo
const MESA = primero("mesa-dibujo", "escritorio-madera");
// imagen-pendiente: maqueta-bodega
const MAQUETA = primero("maqueta-bodega", "maqueta-carton");
// imagen-pendiente: foto-bodega · plano-cuadriculado · cajas-madera (pila-monedas ya existe en Macro)
const FOTO = primero("foto-bodega", "bodega");
const PLANO = primero("plano-cuadriculado", "plano-enrollado");
const CAJAS = primero("cajas-madera", "caja-paquete");
const MONEDAS = primero("pila-monedas");

function Maqueta(estado) {
  const n = colocados(estado).length;
  return (
    <div className="gp-escenita" data-maqueta={n}>
      <span className="gp2-gira" style={{ display: "block", transform: `scale(${1 + n * 0.03})` }}><Objeto id={MAQUETA} alto={48} /></span>
      <small>{n} de 8 cálculos en la maqueta</small>
    </div>
  );
}

export const ESCENA = {
  nombre: "mesa-dibujo", fondo: ["#23303a", "#0c1116"], acento: "#a7d8ff", luz: "rgba(167,216,255,.18)",
  portada: MESA,
  mesa: "equipo",
  objeto: { id: MESA, alto: 76 },
  anim: "cae",
  disposicion: "rejilla",
  antes: () => <EstiloLote4 />,
  encima: (e) => <Maqueta {...e} />,
  destinos: {
    analoga: { objeto: FOTO, alto: 44 }, parametrica: { objeto: PLANO, alto: 44 },
    ascendente: { objeto: CAJAS, alto: 44 }, tres: { objeto: MONEDAS, alto: 44 },
  },
};

export default function C07H02Mesa({ onTerminar, rng = null }) {
  return <Partida pieza={GP_C7_H02} escena={ESCENA} onTerminar={onTerminar} rng={rng} />;
}
