import { useState } from "react";
import { FAE } from "../../theme.js";

/*
 * Caso real en línea de tiempo: Blockbuster.
 *
 * Las cuatro tarjetas son contexto narrativo y no puntúan: todo el puntaje sale
 * de la pregunta final, que no pide clasificar niveles (eso ya lo cubre la
 * mecánica anterior) sino decidir en cuál conviene intervenir. La dificultad
 * está en el juicio, no en la cantidad de preguntas.
 */

const TARJETAS = [
  {
    nivel: "Evento",
    texto: "En 2010, Blockbuster se declara en bancarrota y cierra cientos de tiendas en Estados Unidos.",
  },
  {
    nivel: "Patrón",
    texto: "Desde 2005, las visitas a las tiendas físicas venían cayendo año tras año, mientras el consumo de películas y series por internet crecía de forma sostenida.",
  },
  {
    nivel: "Estructura",
    texto: "El modelo de Blockbuster dependía de tiendas físicas, inventario de DVDs y cobros por renta atrasada, sin una plataforma de streaming propia ni acuerdos sólidos de distribución digital.",
  },
  {
    nivel: "Modelo mental",
    texto: "Los directivos creían que la experiencia física en tienda seguiría dominando el negocio, y que el streaming era una moda pasajera. De hecho, existen relatos ampliamente conocidos de que Blockbuster tuvo la oportunidad de asociarse con o adquirir a Netflix en sus primeros años, y la descartó.",
  },
];

const PREGUNTA =
  "Como consultor en el año 2000, ¿en qué nivel del iceberg intervendrías para tener el mayor impacto en el futuro de Blockbuster?";

/* El porcentaje de cada opción es directamente el % de acierto que va al motor. */
const OPCIONES = [
  {
    id: "a", porcentaje: 0,
    texto: "Evento — bajar el precio de las rentas para competir",
    feedback: "❌ Bajar precios calma el dolor un rato, pero no cambia nada de fondo. Es la reacción más común — y la que menos funciona.",
  },
  {
    id: "b", porcentaje: 0,
    texto: "Patrón — abrir más tiendas para compensar la caída",
    feedback: "❌ Abrir más tiendas refuerza exactamente el modelo que ya perdía relevancia. Combate un síntoma repetido, no la causa que lo repite.",
  },
  {
    id: "c", porcentaje: 50,
    texto: "Estructura — invertir en una plataforma de distribución digital propia",
    feedback: "🟡 Vas bien encaminado, pero no es la jugada que más cambia las cosas. Invertir en digital ayuda, pero si la empresa sigue creyendo que la tienda física es el corazón del negocio, esa inversión queda a medias — la estructura nueva choca con la creencia vieja.",
  },
  {
    id: "d", porcentaje: 100,
    texto: "Modelo mental — cuestionar la creencia de que el negocio siempre dependerá de la tienda física",
    feedback: "✅ Correcto. Cambiar la creencia de fondo es lo que permite reconstruir todo lo demás con convicción real, no como parche. Es el movimiento que más cambia un iceberg completo.",
  },
];

const COLOR_POR_PORCENTAJE = (p) => (p === 100 ? FAE.teal : p === 50 ? "#E9B44C" : FAE.coral);

export default function CasoBlockbuster({ onCompletar }) {
  /* Cuántas tarjetas se han revelado; no se pueden saltar. */
  const [reveladas, setReveladas] = useState(1);
  const [eleccion, setEleccion] = useState(null);

  const todasReveladas = reveladas >= TARJETAS.length;
  const opcionElegida = OPCIONES.find((o) => o.id === eleccion);

  const responder = (opcion) => {
    if (eleccion) return;
    setEleccion(opcion.id);
    onCompletar?.(opcion.porcentaje);
  };

  return (
    <div>
      {/* Horizontal en escritorio, vertical en móvil. */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(230px, 1fr))",
          gap: "14px",
          marginBottom: "16px",
        }}
      >
        {TARJETAS.slice(0, reveladas).map((t, i) => (
          <div
            key={t.nivel}
            style={{
              borderRadius: "16px",
              background: "rgba(248,249,250,0.04)",
              border: "1px solid rgba(248,249,250,0.13)",
              padding: "16px 18px",
            }}
          >
            <p style={{ fontFamily: "Sora, sans-serif", fontSize: "11.5px", fontWeight: 700, letterSpacing: "0.1em", color: FAE.teal, margin: "0 0 7px" }}>
              {String(i + 1).padStart(2, "0")} · {t.nivel.toUpperCase()}
            </p>
            <p style={{ fontSize: "14px", lineHeight: 1.55, margin: 0, color: "rgba(248,249,250,0.85)" }}>
              {t.texto}
            </p>
          </div>
        ))}
      </div>

      {!todasReveladas && (
        <button
          type="button"
          onClick={() => setReveladas((n) => Math.min(n + 1, TARJETAS.length))}
          style={{
            fontFamily: "Sora, sans-serif", fontSize: "14px", fontWeight: 600,
            padding: "11px 20px", borderRadius: "999px", border: "none",
            cursor: "pointer", backgroundColor: FAE.teal, color: FAE.bg,
          }}
        >
          Siguiente ({reveladas} de {TARJETAS.length})
        </button>
      )}

      {todasReveladas && (
        <div
          style={{
            borderRadius: "18px",
            background: "rgba(248,249,250,0.05)",
            border: "1px solid rgba(248,249,250,0.16)",
            padding: "clamp(18px, 3vw, 26px)",
          }}
        >
          <p style={{ fontFamily: "Sora, sans-serif", fontSize: "12px", fontWeight: 700, letterSpacing: "0.12em", color: FAE.coral, margin: "0 0 10px" }}>
            DESAFÍO FINAL
          </p>
          <p style={{ fontSize: "16.5px", lineHeight: 1.5, margin: "0 0 18px", color: FAE.text }}>
            {PREGUNTA}
          </p>

          <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
            {OPCIONES.map((opt) => {
              const elegida = eleccion === opt.id;
              const color = COLOR_POR_PORCENTAJE(opt.porcentaje);
              return (
                <button
                  key={opt.id}
                  type="button"
                  onClick={() => responder(opt)}
                  disabled={!!eleccion}
                  style={{
                    textAlign: "left", fontFamily: "Inter, sans-serif", fontSize: "14.5px", lineHeight: 1.45,
                    padding: "13px 16px", borderRadius: "13px",
                    cursor: eleccion ? "default" : "pointer",
                    background: elegida ? `${color}22` : "rgba(248,249,250,0.04)",
                    border: `1px solid ${elegida ? color : "rgba(248,249,250,0.16)"}`,
                    color: eleccion && !elegida ? "rgba(248,249,250,0.42)" : FAE.text,
                  }}
                >
                  {opt.texto}
                </button>
              );
            })}
          </div>

          {opcionElegida && (
            <div
              style={{
                marginTop: "16px", borderRadius: "13px",
                background: `${COLOR_POR_PORCENTAJE(opcionElegida.porcentaje)}18`,
                border: `1px solid ${COLOR_POR_PORCENTAJE(opcionElegida.porcentaje)}55`,
                padding: "15px 17px",
              }}
            >
              <p style={{ fontSize: "14.5px", lineHeight: 1.6, margin: 0, color: "rgba(248,249,250,0.88)" }}>
                {opcionElegida.feedback}
              </p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
