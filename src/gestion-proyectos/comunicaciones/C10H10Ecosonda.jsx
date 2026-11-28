/*
 * C10 · H10 · La ecosonda del lanzamiento (gp26-moc-c10-h10-ecosonda, Difícil, 50 × 2 FP × %).
 * La ecosonda de barco con su pantalla redonda: cada dato sale como un eco
 * que vuelve del fondo, y el porcentaje se dibuja como la altura del eco
 * SOLO cuando el estudiante ya lo calculó (antes, «?»). Etapa 2: cada
 * hallazgo es un banco de peces; la decisión correcta cambia el rumbo del
 * barco en la pantalla.
 */
import Partida from "../comun/Partida.jsx";
import { primero } from "../comun/objetos.jsx";
import { BarraH, EstiloLote5, Lamina, resuelto } from "../comun/lote5.jsx";
import { GP_C10_H10, LANZAMIENTO_C10 } from "./textos-c10.js";

export const ID = GP_C10_H10.id;

// imagen-pendiente: ecosonda · barco-pesca
const ECOSONDA = primero("ecosonda", "dial-radio");
const BARCO = primero("barco-pesca", "timon");
const NOMBRES = { "c10h10-01": "Boletines enviados / planeados", "c10h10-02": "Tiendas que entendieron", "c10h10-03": "Reuniones hechas / planeadas" };

function Ecos(estado) {
  if (estado.paso.tipo !== "casillas" && estado.paso.id !== "c10h10-04") return null;
  return (
    <Lamina titulo="Ecosonda · el mes tras el lanzamiento" data-ecos={LANZAMIENTO_C10.monitoreo.map((m) => Number(resuelto(estado, m.id))).join("")}>
      <div className="gp5-barras">
        {LANZAMIENTO_C10.monitoreo.map((m) => {
          const ya = resuelto(estado, m.id);
          return <BarraH key={m.id} nombre={NOMBRES[m.id]} valor={ya ? m.clave : null} max={100} texto={ya ? `${m.clave} %` : "?"} color="#8ecae6" />;
        })}
      </div>
    </Lamina>
  );
}

function Rumbo(estado) {
  if (estado.paso.tipo === "casillas" || !estado.paso.contexto) return null;
  return <p className="gp2-pista" data-rumbo={estado.encaja ? "corregido" : "espera"}>{estado.encaja ? "El barco cambia de rumbo." : "Un banco de peces aparece en la pantalla."}</p>;
}

export const ESCENA = {
  nombre: "ecosonda", fondo: ["#0f2a33", "#041014"], acento: "#8ecae6", luz: "rgba(142,202,230,.18)",
  portada: ECOSONDA,
  mesa: "tu",
  objeto: { id: ECOSONDA, alto: 64 },
  anim: "cae",
  antes: () => <EstiloLote5 />,
  encima: (e) => <><Ecos {...e} /><Rumbo {...e} /></>,
  etapas: [{}, { objeto: { id: BARCO, alto: 64 }, disposicion: "columna", mesa: "patrocinadora" }],
};

export default function C10H10Ecosonda({ onTerminar, rng = null }) {
  return <Partida pieza={GP_C10_H10} escena={ESCENA} onTerminar={onTerminar} rng={rng} />;
}
