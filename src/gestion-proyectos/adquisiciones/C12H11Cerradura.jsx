/*
 * C12 · H11 · La cerradura del cierre (gp26-moc-c12-h11-cierre, Medio, 25 × 2 FP × %).
 * La cerradura de combinación de cuatro discos en la puerta del galpón; cada
 * disco con su nombre y dos caras (✓ / ✗): Entregables aprobados · Sin
 * reclamaciones · Sin facturas pendientes · Pagos finales hechos (2 × 2 a
 * 320 y 375 px). La carpeta del caso trae la evidencia; se giran los discos y
 * se elige «Abrir» o «No se puede cerrar». Solo cuando todo está en ✓ la
 * puerta se abre y se ve la tostadora funcionando. Etapa 2: el estante de
 * archivo de Altamira detrás de la puerta.
 */
import Partida from "../comun/Partida.jsx";
import { primero } from "../comun/objetos.jsx";
import { cuantos } from "../comun/lote2.jsx";
import { EstiloLote6, Lamina, resuelto } from "../comun/lote6.jsx";
import { GP_C12_H11 } from "./textos-c12.js";

export const ID = GP_C12_H11.id;

// imagen-pendiente: cerradura-combinacion · puerta-galpon · estante-archivo
const CERRADURA = primero("cerradura-combinacion", "caja-fuerte", "candado");
const PUERTA = primero("puerta-galpon", "porton-madera");
const ESTANTE = primero("estante-archivo", "archivador-metalico");

function Puerta(estado) {
  if (estado.paso.tipo === "casillas") {
    const abierta = estado.paso.id === "c12h11-4" && resuelto(estado, "c12h11-4");
    return <p className="gp2-pista" style={{ textAlign: "left" }} data-puerta={abierta ? "abierta" : "cerrada"}>{abierta ? "La puerta se abre: la tostadora tuesta." : "La puerta del galpón sigue cerrada."}</p>;
  }
  if (!estado.paso.texto) return null;
  return (
    <Lamina titulo="El estante de archivo de Altamira" data-estante={cuantos(estado, "si")}>
      <small>Al estante: {cuantos(estado, "si")} · Deshechas: {cuantos(estado, "no")}</small>
    </Lamina>
  );
}

export const ESCENA = {
  nombre: "cerradura", fondo: ["#2b2d31", "#0c0d0f"], acento: "#e9c46a", luz: "rgba(233,196,106,.14)",
  portada: CERRADURA,
  mesa: "tu",
  objeto: { id: CERRADURA, alto: 64 },
  anim: "abre",
  antes: () => <EstiloLote6 />,
  encima: (e) => <Puerta {...e} />,
  etapas: [{}, { mesa: "equipo", objeto: { id: ESTANTE ?? PUERTA, alto: 64 }, destinos: { si: { objeto: ESTANTE, alto: 30 } } }],
};

export default function C12H11Cerradura({ onTerminar, rng = null }) {
  return <Partida pieza={GP_C12_H11} escena={ESCENA} onTerminar={onTerminar} rng={rng} />;
}
