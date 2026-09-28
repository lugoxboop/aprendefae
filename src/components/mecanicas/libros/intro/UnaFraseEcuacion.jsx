import { FAE } from "../../../../theme.js";
import { NEUTRO } from "../../../../data/contabilidadIntro.js";
import {
  PREGUNTA_P2, OPCIONES_P2, CASOS_P2, DE_LOS_DUENOS, SUBEN,
} from "../../../../data/contabilidadPiezas234.js";
import {
  evaluarOpcionP2, movimientoDelCaso,
} from "../../../../contabilidad/aprenderTema1.js";
import { useMovimientoReducido } from "../verbos.jsx";
import Torre, { LineaDeAltura } from "./Torre.jsx";
import UnaFrase from "./UnaFrase.jsx";

/*
 * ═══════════════════════════════════════════════════════════════════════════
 * PIEZA 2 · CAPA 4 — «En una frase».
 *
 * La escena de cada devolución es la mitad del argumento, y la de la opción
 * equivocada más común —«cuando un lado sube, el otro baja»— es la más
 * importante de todas: reproduce los cuatro casos seguidos con sus flechas, y
 * las ocho flechas apuntan al mismo lado. Decirlo con palabras y no enseñarlo
 * dejaría la creencia intacta.
 * ═══════════════════════════════════════════════════════════════════════════
 */

const SORA = "Sora, sans-serif";

function Escena({ escena }) {
  const reducido = useMovimientoReducido();
  if (!escena) return null;

  if (escena.tipo === "cuatro-casos") {
    return (
      <div data-escena="cuatro-casos" style={{ marginTop: "10px", display: "flex", flexDirection: "column", gap: "5px" }}>
        {CASOS_P2.map((c) => {
          const m = movimientoDelCaso(c);
          return (
            <span key={c.id} data-caso={c.id} data-mueve={m.izquierda} style={{
              display: "flex", flexWrap: "wrap", alignItems: "center", gap: "4px 8px",
              padding: "5px 8px", borderRadius: "8px",
              background: "rgba(184,196,212,0.08)", fontSize: "11px", color: "rgba(248,249,250,0.8)",
            }}>
              <span style={{ fontFamily: SORA, fontWeight: 700, color: NEUTRO }}>{c.id}</span>
              <span>{c.nombre}</span>
              {/*
                Las dos flechas de cada caso, y las dos salen del MISMO valor.
                No hay forma de que una apunte para un lado y la otra para el
                otro sin romper `movimientoDelCaso` primero.
              */}
              <span data-flechas style={{ marginLeft: "auto", fontFamily: SORA, fontWeight: 700, color: NEUTRO }}>
                {m.izquierda === SUBEN ? "↑" : "↓"} {m.derecha === SUBEN ? "↑" : "↓"}
              </span>
            </span>
          );
        })}
      </div>
    );
  }

  if (escena.tipo === "tramo-de-los-duenos") {
    return (
      <div data-escena="tramo-de-los-duenos" style={{ marginTop: "10px" }}>
        <Torre lado="derecha" marcarTramo={DE_LOS_DUENOS} reducido={reducido} />
      </div>
    );
  }

  if (escena.tipo === "torre-sola") {
    return (
      <div data-escena="torre-sola" style={{ marginTop: "10px" }}>
        <Torre lado="ambas" reducido={reducido} />
        <LineaDeAltura texto="dan igual solas" />
      </div>
    );
  }

  /* torre-entera: las dos lecturas a la vez, que es la respuesta correcta. */
  return (
    <div data-escena="torre-entera" style={{ marginTop: "10px" }}>
      <Torre lado="ambas" reducido={reducido} />
      <LineaDeAltura />
    </div>
  );
}

export default function UnaFraseEcuacion() {
  return (
    <UnaFrase
      pregunta={PREGUNTA_P2}
      opciones={OPCIONES_P2}
      evaluar={evaluarOpcionP2}
      Escena={Escena}
    />
  );
}
