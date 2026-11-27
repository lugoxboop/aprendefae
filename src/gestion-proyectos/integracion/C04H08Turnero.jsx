/*
 * C04 · H08 · El turnero de los cambios (gp26-moc-c04-h08-turnero, Difícil, 50 × 2 FP × %).
 * Etapa 1: el turnero con su pantalla de llamado de cuatro módulos; se
 * ordenan Identificar → Documentar → Decidir → Hacer seguimiento y la
 * pantalla llama la ficha módulo por módulo (retro por par invertido).
 * Etapa 2: los siete turnos del martes ante el comité (patrocinadora,
 * gerente funcional, PMO). Cada decisión mueve el formulario; la errada
 * muestra su consecuencia y la retro, y se vuelve a decidir sin puntaje. En
 * el turno 4, los dos diales (Mayoría, Pluralidad) y las 7 fichas 3/2/2.
 */
import Partida from "../comun/Partida.jsx";
import { Objeto, primero } from "../comun/objetos.jsx";
import { EstiloLote2 } from "../comun/lote2.jsx";
import { Personaje } from "../comun/elenco.jsx";
import { GP_C4_H08 } from "./textos-c4.js";

export const ID = GP_C4_H08.id;
const TURNERO = primero("turnero", "conmutador");
const DIAL = primero("dial-radio");
const PANTALLA = primero("pantalla-llamado");
const FICHA = primero("ficha-voto");
const FORMULARIO = primero("portapapeles");

function Comite({ paso, encaja, mal, ultimo }) {
  return (
    <div style={{ display: "grid", gap: 8, marginTop: 10 }} data-turno={paso.turno}>
      <div className="gp2-fila" aria-hidden="true">
        {["patrocinadora", "gerente", "pmo"].map((q) => <Personaje key={q} quien={q} alto={120} animo={encaja ? "feliz" : "quieta"} />)}
      </div>
      <div className="gp-escenita">
        <span className="gp-chip-c">Turno {paso.turno} de 7</span>
        <span className={mal ? "gp2-tambalea" : "gp2-gira"} style={{ display: "block", transform: encaja ? "translateX(24px)" : "none" }}><Objeto id={FORMULARIO} alto={44} /></span>
        <small>{encaja ? "El formulario avanza" : mal ? "Consecuencia: el formulario se atasca" : "Esperando decisión"}</small>
      </div>
      {paso.votos && <Votacion paso={paso} elegido={encaja ?? ultimo} />}
    </div>
  );
}

function Votacion({ paso, elegido }) {
  const [a, p, r] = paso.votos;
  const diales = paso.destinos.find((d) => d.id === elegido)?.diales ?? ["—", "—"];
  return (
    <div className="gp2-caja" data-votacion>
      <div className="gp2-fila" style={{ justifyContent: "space-between" }}>
        {[["Aprobar", a], ["Aplazar", p], ["Rechazar", r]].map(([n, v]) => (
          <span key={n} className="gp2-pieza" data-fichas={v}><span style={{ display: "flex" }}>{Array.from({ length: v }, (_, k) => <Objeto key={k} id={FICHA} alto={18} />)}</span>{n} · {v}</span>
        ))}
      </div>
      <p style={{ margin: "6px 0" }} className="da26-mono">3 de 7 = 43 %</p>
      <div className="gp2-rejilla" style={{ "--gp2-cols": 2 }}>
        {["Mayoría", "Pluralidad"].map((n, k) => (
          <div key={n} className="gp2-pieza" data-dial={n}>
            <Objeto id={DIAL} alto={56} />
            <small><b style={{ margin: 0 }}>{n}</b>{diales[k]}</small>
          </div>
        ))}
      </div>
    </div>
  );
}

export const ESCENA = {
  nombre: "turnero", fondo: ["#1b2b33", "#0a1216"], acento: "#6cc3d5", luz: "rgba(108,195,213,.2)",
  portada: TURNERO,
  antes: () => <EstiloLote2 />,
  etapas: [
    { objetos: [TURNERO, PANTALLA] },
    { objeto: null, mesa: "tu", anim: "abre", disposicion: "columna", encima: (e) => <Comite {...e} /> },
  ],
};

export default function C04H08Turnero({ onTerminar, rng = null }) {
  return <Partida pieza={GP_C4_H08} escena={ESCENA} onTerminar={onTerminar} rng={rng} />;
}
