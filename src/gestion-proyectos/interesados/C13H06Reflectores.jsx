/*
 * C13 · H06 · Los tres reflectores (gp26-ini-c13-h06-prominencia, Medio, 25 × 2 FP × %).
 * La tarima de la plaza con tres reflectores de escenario: Poder · Urgencia ·
 * Legitimidad. El interesado sube a la tarima; el estudiante pone cada
 * reflector en encendido o apagado (interruptores de 48 px con su texto) y
 * toca «Comprobar». Solo entonces la lámina muestra los reflectores que
 * quedan encendidos (✹) con su ✓; uno mal puesto se marca en coral con su
 * retro. El perro (PMO) maneja la consola. Etapa 2: las cinco tarjetas de
 * modelo bajo la tarima.
 */
import Partida from "../comun/Partida.jsx";
import { primero } from "../comun/objetos.jsx";
import { EstiloLote7, Lamina } from "../comun/lote7.jsx";
import { GP_C13_H06, REFLECTORES_C13 } from "./textos-c13.js";

export const ID = GP_C13_H06.id;

// imagen-pendiente: tarima-plaza · consola-mezcla (foco-teatro ya existe)
const TARIMA = primero("tarima-plaza", "teatro-telon");
const FOCO = primero("foco-teatro");
const CONSOLA = primero("consola-mezcla", "conmutador");

function Tarima(estado) {
  const { paso } = estado;
  if (!paso.casillas) return null;
  const visto = estado.revelado;
  return (
    <Lamina titulo="La tarima · reflectores" data-reflectores={visto ? "revelados" : "por-comprobar"}>
      <div className="gp5-chips">
        {REFLECTORES_C13.map((r) => {
          const c = paso.casillas.find((x) => x.id === r.id);
          const on = visto && c.clave === "on";
          return <span key={r.id} className="gp5-chip" data-on={on ? "1" : undefined} data-reflector={r.id}>{r.nombre}{visto ? (on ? " · ✹ encendido ✓" : " · apagado ✓") : " · ?"}</span>;
        })}
      </div>
    </Lamina>
  );
}

export const ESCENA = {
  nombre: "tarima", fondo: ["#2a1f33", "#0c0910"], acento: "#ffd166", luz: "rgba(255,209,102,.18)",
  portada: TARIMA,
  mesa: "pmo",
  objeto: { id: FOCO, alto: 64 },
  objetos: [CONSOLA],
  anim: "abre",
  antes: () => <EstiloLote7 />,
  encima: (e) => <Tarima {...e} />,
  etapas: [{}, { objeto: { id: TARIMA, alto: 56 }, encima: null }],
};

export default function C13H06Reflectores({ onTerminar, rng = null }) {
  return <Partida pieza={GP_C13_H06} escena={ESCENA} onTerminar={onTerminar} rng={rng} />;
}
