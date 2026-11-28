/*
 * C09 · H09 · La consola del equipo (gp26-eje-c09-h09-consola, Medio, 25 × 2 FP × %).
 * La consola de mezcla con seis controles deslizantes rotulados
 * (Coubicación · Tecnología de la comunicación · Capacitación ·
 * Reconocimiento · Espíritu de equipo · Evaluaciones). Al subir el correcto,
 * su medidor se enciende y el hámster del área levanta la cabeza; el error
 * baja el control solo y aparece la retro. A 320 px, 3 controles por fila.
 */
import Partida from "../comun/Partida.jsx";
import { primero } from "../comun/objetos.jsx";
import { cuantos } from "../comun/lote2.jsx";
import { EstiloLote5, Lamina } from "../comun/lote5.jsx";
import { GP_C9_H09 } from "./textos-c9.js";

export const ID = GP_C9_H09.id;

// imagen-pendiente: consola-mezcla
const CONSOLA = primero("consola-mezcla", "dial-radio");
const CANALES = GP_C9_H09.etapas[0].destinos;

function Medidores(estado) {
  if (!estado.paso.texto) return null;
  return (
    <Lamina titulo="Medidores de la consola" data-medidores={CANALES.map((c) => cuantos(estado, c.id)).join("-")}>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(6, minmax(0, 1fr))", gap: 6, alignItems: "end", height: 48 }} aria-hidden="true">
        {CANALES.map((c) => {
          const n = cuantos(estado, c.id);
          return <span key={c.id} style={{ display: "block", height: 44, borderRadius: 6, background: "rgba(244,245,247,.16)", position: "relative", overflow: "hidden" }}>
            <span style={{ position: "absolute", inset: 0, transformOrigin: "50% 100%", transform: `scaleY(${Math.min(1, n * 0.6)})`, background: "#9be59b", transition: "transform 420ms" }} />
          </span>;
        })}
      </div>
    </Lamina>
  );
}

export const ESCENA = {
  nombre: "consola", fondo: ["#1d2530", "#080b10"], acento: "#9be59b", luz: "rgba(155,229,155,.16)",
  portada: CONSOLA,
  mesa: "equipo",
  objeto: { id: CONSOLA, alto: 64 },
  anim: "abre",
  disposicion: "consola",
  antes: () => <EstiloLote5 />,
  encima: (e) => <Medidores {...e} />,
  etapas: [{}, { disposicion: "columna", mesa: "tu" }],
};

export default function C09H09Consola({ onTerminar, rng = null }) {
  return <Partida pieza={GP_C9_H09} escena={ESCENA} onTerminar={onTerminar} rng={rng} />;
}
