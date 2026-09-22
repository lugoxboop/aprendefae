import { useEffect, useMemo, useRef, useState } from "react";
import { FAE } from "../../../theme.js";
import { ESCENARIOS, SUBTEMAS } from "../../../data/nova.js";
import { pctDeDecisiones } from "../../../nova/puntuacion.js";
import { barajar } from "../../../utils/barajar.js";

/*
 * ═══════════════════════════════════════════════════════════════════════════
 * ETAPA 4 — "La Decisión del Comité"
 * Subtema: Integración — decisión empresarial ante un paquete fiscal
 *
 * El calendario salta a diciembre y los tres comunicados llegan JUNTOS. Ahí
 * está el contenido: las tres medidas por separado dicen una cosa y leídas a
 * la vez dicen otra —la deducción vale más justo porque la tarifa subió—.
 *
 * TRES DECISIONES ENCADENADAS, CADA UNA CALIFICADA APARTE, y las tres pesan lo
 * mismo. Así ninguna sola carga el peso de la etapa: equivocarse en la primera
 * no deja la etapa perdida, que es lo que convertiría una integración en una
 * lotería.
 *
 * SIN REINTENTO. Se decide y se ve la consecuencia, como en un comité.
 *
 * CRÉDITO PARCIAL, del dato y no del componente. Hay opciones que funcionan
 * pero salen caras —financiar con crédito justo cuando el crédito subió— y
 * valen la mitad, no cero. Cada opción trae su `pct` en el banco.
 *
 * Banco de 2 escenarios, se sortea 1; el orden de las opciones se baraja.
 * ═══════════════════════════════════════════════════════════════════════════
 */

const CSS = `
@keyframes fae-nk-entrar { from { opacity: 0; transform: translateY(10px); } to { opacity: 1; transform: none; } }
.fae-nk-entrar { animation: fae-nk-entrar 420ms cubic-bezier(.3,.9,.4,1) both; }
@media (prefers-reduced-motion: reduce) { .fae-nk-entrar { animation: none !important; } }
`;

/** El escenario del intento. */
export function sortearEscenario(banco = ESCENARIOS) {
  return barajar(banco)[0];
}

/** El color del veredicto sale del crédito: coral es error y no se usa para nada más. */
export function tonoDe(pct) {
  if (pct >= 100) return FAE.teal;
  if (pct > 0) return FAE.ambar;
  return FAE.coral;
}

export default function EtapaComite({ onTerminar, onEscenario, banco = ESCENARIOS }) {
  const [escenario] = useState(() => sortearEscenario(banco));
  const [k, setK] = useState(0);
  const [resuelta, setResuelta] = useState(null); // { opcion }

  const creditos = useRef([]);
  const detalle = useRef([]);
  /* Lo que el comité eligió, en orden: es lo que enseña la columna derecha del cierre. */
  const elegidas = useRef([]);

  useEffect(() => { onEscenario?.(escenario); }, [escenario, onEscenario]);

  const decision = escenario.decisiones[k];
  const terminada = !decision;

  const opciones = useMemo(
    () => (terminada ? [] : barajar(decision.opciones)),
    [terminada, decision?.id],
  );

  const elegir = (opcionId) => {
    if (terminada || resuelta) return;
    const opcion = decision.opciones.find((o) => o.id === opcionId);
    creditos.current.push(opcion.pct);
    elegidas.current.push({ pregunta: decision.pregunta, texto: opcion.texto, pct: opcion.pct });
    detalle.current.push({
      item: `${escenario.id}:${decision.id}`,
      ok: opcion.pct >= 100,
      intentos: 1,
      respuesta: opcion.pct >= 100 ? null : opcion.id,
      orden: detalle.current.length + 1,
    });
    setResuelta({ opcion });
  };

  const seguir = () => {
    setResuelta(null);
    const siguiente = k + 1;
    if (siguiente >= escenario.decisiones.length) {
      onTerminar?.(pctDeDecisiones(creditos.current), detalle.current, {
        escenario,
        creditos: [...creditos.current],
        elegidas: [...elegidas.current],
      });
    }
    setK(siguiente);
  };

  if (terminada) {
    return (
      <p data-etapa-hecha="4" style={{ fontSize: "14px", lineHeight: 1.6, color: "rgba(248,249,250,0.7)", margin: 0 }}>
        Tres decisiones tomadas: {pctDeDecisiones(creditos.current)}% de la etapa.
      </p>
    );
  }

  return (
    <div data-etapa="4" data-escenario={escenario.id}>
      <style>{CSS}</style>

      <p style={{ fontFamily: "Sora, sans-serif", fontSize: "10.5px", fontWeight: 700, letterSpacing: "0.12em", color: FAE.teal, margin: "0 0 10px" }}>
        {SUBTEMAS[4].toUpperCase()}
      </p>

      {/* Los tres comunicados, juntos y siempre a la vista: leerlos juntos ES la etapa. */}
      <article
        data-caso
        style={{
          borderRadius: "16px", padding: "15px 16px", marginBottom: "16px",
          background: "linear-gradient(150deg, rgba(233,196,106,0.10), rgba(10,20,34,0.5) 65%)",
          border: `1px solid ${FAE.ambar}4D`,
        }}
      >
        <p style={{ fontFamily: "Sora, sans-serif", fontSize: "10.5px", fontWeight: 700, letterSpacing: "0.12em", color: FAE.ambar, margin: "0 0 7px" }}>
          DICIEMBRE · {escenario.titulo.toUpperCase()}
        </p>
        <p style={{ fontSize: "14px", lineHeight: 1.6, color: FAE.text, margin: 0 }}>
          {escenario.caso}
        </p>
      </article>

      <p style={{ fontSize: "13px", lineHeight: 1.6, color: "rgba(248,249,250,0.6)", margin: "0 0 8px" }}>
        Decisión {k + 1} de {escenario.decisiones.length}. Una sola oportunidad.
      </p>
      <p data-decision={decision.id} style={{ fontFamily: "Sora, sans-serif", fontSize: "15.5px", fontWeight: 700, lineHeight: 1.45, color: FAE.text, margin: "0 0 12px" }}>
        {decision.pregunta}
      </p>

      <div style={{ display: "flex", flexDirection: "column", gap: "9px" }}>
        {opciones.map((o) => {
          const elegida = resuelta?.opcion.id === o.id;
          const borde = elegida ? tonoDe(o.pct) : "rgba(248,249,250,0.18)";
          return (
            <button
              key={o.id}
              type="button"
              data-opcion={o.id}
              onClick={() => elegir(o.id)}
              disabled={Boolean(resuelta)}
              style={{
                textAlign: "left", padding: "13px 15px", borderRadius: "13px",
                cursor: resuelta ? "default" : "pointer",
                background: "rgba(248,249,250,0.04)",
                border: `1px solid ${borde}`,
                color: FAE.text, fontSize: "13.5px", lineHeight: 1.5,
                opacity: resuelta && !elegida ? 0.4 : 1,
              }}
            >
              {o.texto}
            </button>
          );
        })}
      </div>

      {resuelta && (
        <div className="fae-nk-entrar" style={{ marginTop: "14px" }}>
          <p
            data-feedback
            style={{ fontSize: "13.5px", lineHeight: 1.6, color: tonoDe(resuelta.opcion.pct), margin: "0 0 12px" }}
          >
            {resuelta.opcion.feedback}
          </p>
          <button
            type="button"
            onClick={seguir}
            style={{
              width: "100%", padding: "13px", borderRadius: "13px", cursor: "pointer",
              background: FAE.teal, border: `1px solid ${FAE.teal}`, color: FAE.bg,
              fontFamily: "Sora, sans-serif", fontSize: "14px", fontWeight: 700,
            }}
          >
            {k + 1 < escenario.decisiones.length ? "Siguiente decisión" : "Cerrar el año"}
          </button>
        </div>
      )}
    </div>
  );
}
