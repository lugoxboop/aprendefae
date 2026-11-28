/*
 * C09 · H01 · ¿Persona o cosa? (gp26-pla-c09-h01-puertas, Fácil, 10 × 2 FP × %).
 * La entrada del recinto ferial con dos puertas: Acreditación (recursos del
 * equipo) y Muelle de carga (recursos físicos). El zorro, con su tableta,
 * recibe cada tarjeta; al acertar la puerta la recibe y debajo queda la pista
 * «Persona» o «Equipamiento, material, instalación». Etapa 2: cuatro errores
 * de gestión que se unen con la escena de lo que causarán.
 */
import Partida from "../comun/Partida.jsx";
import { primero } from "../comun/objetos.jsx";
import { cuantos } from "../comun/lote2.jsx";
import { EstiloLote5 } from "../comun/lote5.jsx";
import { GP_C9_H01 } from "./textos-c9.js";

export const ID = GP_C9_H01.id;

// imagen-pendiente: recinto-ferial · bodega-repleta · tarima-armando · vasos-devueltos
const RECINTO = primero("recinto-ferial", "porton-madera");
const PERSONA = primero("casco-electricista");
const CAJA = primero("caja-paquete");
const BODEGA = primero("bodega-repleta", "bodega");
const TARIMA = primero("tarima-armando", "andamio");
const VASOS = primero("vasos-devueltos", "caneca");

function Cuenta(estado) {
  if (estado.paso.destinos?.length !== 2) return null;
  return (
    <p className="gp2-pista" data-puertas={`${cuantos(estado, "equipo")}-${cuantos(estado, "fisico")}`}>
      Por la acreditación: {cuantos(estado, "equipo")} · Por el muelle: {cuantos(estado, "fisico")}
    </p>
  );
}

export const ESCENA = {
  nombre: "puertas", fondo: ["#2c3a2a", "#0d130c"], acento: "#c9e59b", luz: "rgba(201,229,155,.16)",
  portada: RECINTO,
  mesa: "tu",
  objeto: { id: RECINTO, alto: 80 },
  anim: "abre",
  antes: () => <EstiloLote5 />,
  encima: (e) => <Cuenta {...e} />,
  destinos: { equipo: { objeto: PERSONA, alto: 40 }, fisico: { objeto: CAJA, alto: 40 } },
  etapas: [{}, {
    objeto: null,
    disposicion: "rejilla",
    /* La fila de clientes no tiene ilustración propia: la pinta la interfaz (el texto del destino). */
    destinos: { costos: { objeto: BODEGA, alto: 40 }, retraso: { objeto: TARIMA, alto: 40 }, retrabajo: { objeto: VASOS, alto: 40 } },
  }],
};

export default function C09H01Puertas({ onTerminar, rng = null }) {
  return <Partida pieza={GP_C9_H01} escena={ESCENA} onTerminar={onTerminar} rng={rng} />;
}
