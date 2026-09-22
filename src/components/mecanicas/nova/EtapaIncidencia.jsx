import { useMemo, useRef, useState } from "react";
import { FAE } from "../../../theme.js";
import {
  MEDIDAS_INCIDENCIA, PERSONAS, SUBTEMAS,
  PREGUNTA_GIRA, PREGUNTA_SOPORTA, PREGUNTA_BENEFICIA,
  errorGira, errorSoporta,
} from "../../../data/nova.js";
import { pctDeItems } from "../../../nova/puntuacion.js";
import { barajar } from "../../../utils/barajar.js";

/*
 * ═══════════════════════════════════════════════════════════════════════════
 * ETAPA 3 — "¿Quién Termina Pagando?"
 * Subtema: Incidencia tributaria — estatutaria vs. económica
 *
 * Un fajo sobre la mesa y cinco sitios alrededor. Dos preguntas por medida, en
 * este orden y nunca al revés: primero quién GIRA (obligación legal) y después
 * de quién SALE (incidencia económica). Que casi nunca coincidan es todo el
 * contenido de la etapa, y solo se ve si se preguntan por separado.
 *
 * Banco de 6, cuatro por intento: ocho preguntas, 12,5 % cada una.
 *
 * ═══════════ SIN REINTENTO, A DIFERENCIA DE LAS DOS ANTERIORES ═══════════
 *
 * Aquí un reintento sería un regalo: con cinco opciones y la primera
 * descartada, la segunda es mucho más barata que la primera. Y sobre todo, la
 * explicación de cada error dice exactamente dónde estaba la confusión —la de
 * adelantarse a la segunda pregunta la nombra—: leerla y volver a elegir sería
 * copiar la respuesta.
 *
 * ═══════════ LAS DOS REGLAS ESTRUCTURALES DEL BANCO ═══════════
 *
 * «Nadie» está en las SEIS medidas, no solo en las dos donde es la respuesta:
 * si apareciera únicamente ahí, su sola presencia la delataría.
 *
 * «NOVA» NUNCA es la respuesta de la segunda pregunta, en ninguna medida. Una
 * empresa no tiene bolsillo propio. Las dos reglas las vigila una prueba sobre
 * el banco entero, para que añadir una séptima medida no las rompa en silencio.
 * ═══════════════════════════════════════════════════════════════════════════
 */

const CSS = `
@keyframes fae-ni-fajo { from { opacity: 0; transform: translateY(-10px) scale(.96); } to { opacity: 1; transform: none; } }
.fae-ni-fajo { animation: fae-ni-fajo 420ms cubic-bezier(.3,.9,.4,1) both; }
@keyframes fae-ni-viaja { from { transform: none; opacity: 1; } to { transform: translateY(26px) scale(.86); opacity: .25; } }
.fae-ni-viaja { animation: fae-ni-viaja 520ms cubic-bezier(.4,0,.2,1) both; }
@media (prefers-reduced-motion: reduce) { .fae-ni-fajo, .fae-ni-viaja { animation: none !important; } }
`;

export const MEDIDAS_POR_INTENTO = 4;
export const PREGUNTAS_POR_MEDIDA = 2;

/** Las cuatro medidas del intento. */
export function repartir(banco = MEDIDAS_INCIDENCIA, cuantas = MEDIDAS_POR_INTENTO) {
  return barajar(banco).slice(0, cuantas);
}

/** El enunciado de una pregunta: el de Gen, salvo la deducción, que se beneficia. */
export function enunciado(medida, fase) {
  if (fase === "gira") return PREGUNTA_GIRA;
  return medida.soporta.pregunta === "beneficia" ? PREGUNTA_BENEFICIA : PREGUNTA_SOPORTA;
}

export default function EtapaIncidencia({ onTerminar, banco = MEDIDAS_INCIDENCIA }) {
  const [lote] = useState(() => repartir(banco));
  const [k, setK] = useState(0);
  const [fase, setFase] = useState("gira");
  const [resuelta, setResuelta] = useState(null); // { elegida, ok, texto }

  const aciertos = useRef(0);
  const detalle = useRef([]);

  const medida = lote[k];
  const terminada = !medida;

  /* El orden de las cinco cambia en cada pregunta: nadie acierta por sitio. */
  const opciones = useMemo(
    () => (terminada ? [] : barajar(PERSONAS)),
    [terminada, medida?.id, fase],
  );

  const total = lote.length * PREGUNTAS_POR_MEDIDA;

  const elegir = (personaId) => {
    if (terminada || resuelta) return;
    const bloque = fase === "gira" ? medida.gira : medida.soporta;
    const ok = personaId === bloque.correcta;
    const texto = ok
      ? bloque.acierto
      : fase === "gira"
        ? errorGira(medida, personaId)
        : errorSoporta(medida, personaId);

    if (ok) aciertos.current += 1;
    detalle.current.push({
      item: `${medida.id}:${fase}`,
      ok,
      intentos: 1,
      respuesta: ok ? null : personaId,
      orden: detalle.current.length + 1,
    });
    setResuelta({ elegida: personaId, ok, texto });
  };

  const seguir = () => {
    setResuelta(null);
    if (fase === "gira") {
      setFase("soporta");
      return;
    }
    setFase("gira");
    const siguiente = k + 1;
    if (siguiente >= lote.length) {
      onTerminar?.(pctDeItems(aciertos.current, total), detalle.current);
    }
    setK(siguiente);
  };

  if (terminada) {
    return (
      <p data-etapa-hecha="3" style={{ fontSize: "14px", lineHeight: 1.6, color: "rgba(248,249,250,0.7)", margin: 0 }}>
        {aciertos.current} de {total} preguntas acertadas.
      </p>
    );
  }

  const numero = k * PREGUNTAS_POR_MEDIDA + (fase === "gira" ? 1 : 2);

  return (
    <div data-etapa="3">
      <style>{CSS}</style>

      <p style={{ fontFamily: "Sora, sans-serif", fontSize: "10.5px", fontWeight: 700, letterSpacing: "0.12em", color: FAE.teal, margin: "0 0 10px" }}>
        {SUBTEMAS[3].toUpperCase()}
      </p>

      <p style={{ fontSize: "14px", lineHeight: 1.6, color: "rgba(248,249,250,0.7)", margin: "0 0 14px" }}>
        Pregunta {numero} de {total}. Una sola oportunidad por pregunta.
      </p>

      {/* ------------------------------- el fajo ------------------------------- */}
      <div
        data-fajo={medida.id}
        className={resuelta ? "fae-ni-viaja" : "fae-ni-fajo"}
        style={{
          borderRadius: "16px", padding: "15px 16px", marginBottom: "14px",
          background: "linear-gradient(150deg, rgba(233,196,106,0.13), rgba(10,20,34,0.5) 65%)",
          border: `1px solid ${FAE.ambar}55`,
        }}
      >
        <p style={{ fontFamily: "Sora, sans-serif", fontSize: "10.5px", fontWeight: 700, letterSpacing: "0.12em", color: FAE.ambar, margin: "0 0 7px" }}>
          SOBRE LA MESA
        </p>
        <p style={{ fontSize: "14.5px", lineHeight: 1.55, color: FAE.text, margin: 0 }}>
          {medida.titulo}
        </p>
      </div>

      <p data-pregunta={fase} style={{ fontFamily: "Sora, sans-serif", fontSize: "15px", fontWeight: 700, lineHeight: 1.45, color: FAE.text, margin: "0 0 12px" }}>
        {enunciado(medida, fase)}
      </p>

      {/* ----------------------------- los cinco sitios ----------------------------- */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(140px, 1fr))", gap: "9px" }}>
        {opciones.map((p) => {
          const elegida = resuelta?.elegida === p.id;
          const esLaBuena = resuelta && p.id === (fase === "gira" ? medida.gira.correcta : medida.soporta.correcta);
          const borde = esLaBuena ? FAE.teal : elegida ? FAE.coral : "rgba(248,249,250,0.18)";
          return (
            <button
              key={p.id}
              type="button"
              data-persona={p.id}
              onClick={() => elegir(p.id)}
              disabled={Boolean(resuelta)}
              style={{
                padding: "14px 12px", borderRadius: "13px",
                cursor: resuelta ? "default" : "pointer",
                background: "rgba(248,249,250,0.04)",
                border: `1px solid ${borde}`,
                color: FAE.text, fontFamily: "Sora, sans-serif",
                fontSize: "13px", fontWeight: 600, lineHeight: 1.35,
                opacity: resuelta && !elegida && !esLaBuena ? 0.45 : 1,
              }}
            >
              {p.rotulo}
            </button>
          );
        })}
      </div>

      {resuelta && (
        <div style={{ marginTop: "14px" }}>
          <p
            data-respuesta={resuelta.ok ? "acierto" : "error"}
            style={{ fontSize: "13.5px", lineHeight: 1.6, color: resuelta.ok ? FAE.teal : FAE.coral, margin: "0 0 12px" }}
          >
            {resuelta.texto}
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
            {numero < total ? "Siguiente pregunta" : "Cerrar el reparto"}
          </button>
        </div>
      )}
    </div>
  );
}
