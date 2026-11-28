/*
 * C10 · H09 · La reunión que se desbordó (gp26-eje-c10-h09-reunion, Medio, 25 FP × %).
 * La sala de reuniones con mesa ovalada, reloj de pared grande (≥ 64 px,
 * siempre arriba) y pantalla apagada; el zorro preside. Al lado, la lista de
 * los 6 pasos de gestión de reuniones: cada paso se escribe y se marca con ✓
 * SOLO cuando el estudiante elige bien (los pendientes van como «?», o la
 * lista daría la respuesta del momento). Consecuencias: una mala elección
 * adelanta el reloj y muestra su efecto; luego la retro y se vuelve a elegir
 * sin puntaje.
 */
import Partida from "../comun/Partida.jsx";
import { primero } from "../comun/objetos.jsx";
import { EstiloLote5, Lamina } from "../comun/lote5.jsx";
import { GP_C10_H09, PASOS_REUNION_C10 } from "./textos-c10.js";

export const ID = GP_C10_H09.id;

// imagen-pendiente: mesa-ovalada · reloj-pared (silla-oficina ya existe)
const MESA = primero("mesa-ovalada", "mesa-redonda");
const RELOJ = primero("reloj-pared", "reloj-arena");
const SILLA = primero("silla-oficina");
const EFECTOS = ["Hay sillas vacías.", "La gente mira el celular.", "La discusión crece."];

function Sala(estado) {
  const { paso } = estado;
  const listos = (estado.etapa?.hechos ?? []).length + (estado.encaja ? 1 : 0);
  const fallo = estado.intento > 1 && !estado.encaja;
  return (
    <Lamina titulo="Sala de reuniones · distribuidores" data-sala={listos}>
      <div style={{ display: "flex", gap: 10, alignItems: "flex-start" }}>
        <div style={{ flex: "none", display: "grid", placeItems: "center", width: 72, height: 72, borderRadius: "50%", border: "3px solid #f4f5f7", background: "#fbf7ee", color: "#121418" }} data-reloj={fallo ? "adelantado" : "a-tiempo"}>
          <span className="da26-mono" style={{ fontWeight: 800, fontSize: 14, textAlign: "center", lineHeight: 1.1 }}>{paso.hora}{fallo ? <><br />+20 min</> : null}</span>
        </div>
        <ol style={{ margin: 0, paddingLeft: 18, display: "grid", gap: 2, fontSize: 13 }}>
          {PASOS_REUNION_C10.map((t, k) => <li key={t} data-paso-reunion={k + 1} data-hecho={k < listos ? "1" : undefined}>{k < listos ? `✓ ${t}` : "?"}</li>)}
        </ol>
      </div>
      {fallo && <small style={{ display: "block", marginTop: 6 }} data-efecto>{EFECTOS[(paso.momento - 1) % EFECTOS.length]} El reloj se adelantó.</small>}
    </Lamina>
  );
}

export const ESCENA = {
  nombre: "reunion", fondo: ["#262a33", "#0b0c10"], acento: "#a7bbff", luz: "rgba(167,187,255,.14)",
  portada: MESA,
  mesa: "tu",
  objeto: { id: MESA, alto: 60 },
  objetos: [RELOJ, SILLA],
  anim: "abre",
  disposicion: "columna",
  antes: () => <EstiloLote5 />,
  encima: (e) => <Sala {...e} />,
};

export default function C10H09Reunion({ onTerminar, rng = null }) {
  return <Partida pieza={GP_C10_H09} escena={ESCENA} onTerminar={onTerminar} rng={rng} />;
}
