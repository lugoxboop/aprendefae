/*
 * C13 · H11 · La planta en corte (gp26-moc-c13-h11-taller, Difícil, 50 × 3 FP × %).
 * Taller del capítulo. La planta de agua dibujada en corte, como un plano a
 * color: bocatoma → desarenador → filtro → tanque → red a las casas. Etapa 1:
 * cada componente se llena de agua cuando recibe bien la primera acción de su
 * proceso (nunca antes). Etapa 2: la planta ya corre hasta el tanque y la
 * guía responde las reglas de tiempo. Etapa 3: cada lección bien decidida
 * abre una llave de las casas. El perro (PMO) y el conejo (Cliente) observan.
 */
import Partida from "../comun/Partida.jsx";
import { primero } from "../comun/objetos.jsx";
import { EstiloLote7, Lamina, Tramos, colocados } from "../comun/lote7.jsx";
import { GP_C13_H11, PROCESOS_C13 } from "./textos-c13.js";

export const ID = GP_C13_H11.id;

// imagen-pendiente: planta-agua (el grifo es el de Macro)
const PLANTA = primero("planta-agua", "tanque-beneficio");
const GRIFO = primero("grifo");

const COMPONENTES = [...PROCESOS_C13.map((p) => ({ id: p.id, nombre: p.tramo })), { id: "red", nombre: "Red" }];

function Corte({ con }) {
  return (
    <Lamina titulo="La planta en corte">
      <Tramos tramos={COMPONENTES} con={con} />
    </Lamina>
  );
}
function Llaves(estado) {
  const n = colocados(estado).length;
  return (
    <Lamina titulo="Las llaves de las casas" data-llaves={n}>
      <Tramos tramos={COMPONENTES} con={COMPONENTES.slice(0, 4).map((c) => c.id)} />
      <small style={{ display: "block", marginTop: 4 }}>{n ? `${"◉ ".repeat(n)}llave abierta` : "Las llaves siguen cerradas"}</small>
    </Lamina>
  );
}

export const ESCENA = {
  nombre: "planta", fondo: ["#1b2a33", "#080d11"], acento: "#8ecae6", luz: "rgba(142,202,230,.16)",
  portada: PLANTA,
  mesa: "tu",
  objeto: { id: PLANTA, alto: 60 },
  anim: "gotea",
  antes: () => <EstiloLote7 />,
  encima: (e) => <Corte con={[...new Set(colocados(e).map((x) => x.destino))]} />,
  etapas: [{}, { mesa: "pmo", encima: () => <Corte con={PROCESOS_C13.map((p) => p.id)} /> }, { encima: (e) => <Llaves {...e} />, objeto: { id: GRIFO, alto: 56 } }],
};

export default function C13H11Planta({ onTerminar, rng = null }) {
  return <Partida pieza={GP_C13_H11} escena={ESCENA} onTerminar={onTerminar} rng={rng} />;
}
