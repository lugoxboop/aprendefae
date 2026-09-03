import { useState } from "react";
import { FAE } from "../../theme.js";
import IcebergDiagram from "./IcebergDiagram.jsx";

/*
 * Constructor "de arriba hacia abajo".
 *
 * Mismo corte de iceberg que el buceo progresivo, pero aquí cada nivel se
 * destapa acertando una pregunta. Los distractores son de otros niveles a
 * propósito: confundir patrón con estructura y estructura con modelo mental es
 * el error más común del modelo.
 *
 * Un intento por nivel, con retroalimentación inmediata; se avanza igual si se
 * falla, porque el objetivo es ver el nivel, no bloquear el paso.
 */

const EVENTO = "Las ventas de la tienda bajan en diciembre, mientras el promedio del sector sube.";

/* Texto corto para las tarjetas del dibujo; el completo va en las preguntas. */
const NIVELES_DIAGRAMA = [
  { name: "Evento", lines: ["Las ventas bajan", "en diciembre"] },
  { name: "Patrón", lines: ["Baja cada diciembre", "desde hace 3 años"] },
  { name: "Estructura", lines: ["No ajusta inventario", "ni horarios de", "fin de año"] },
  { name: "Modelo mental", lines: ["Cree que no depende", "de la temporada"] },
];

const PREGUNTAS = [
  {
    nivel: "Patrón",
    enunciado: "¿Cuál de estas afirmaciones describe el PATRÓN detrás del evento?",
    opciones: [
      {
        id: "a", correcta: true,
        texto: "Cada diciembre, desde hace 3 años, las ventas de la tienda bajan mientras el sector sube",
        feedback: "✅ Exacto. Un patrón es algo que se repite — no pasó una vez, pasa siempre.",
      },
      {
        id: "b",
        texto: "La tienda no tiene un sistema de inventario que anticipe la temporada",
        feedback: "❌ Eso es lo que sostiene el problema por debajo (estructura), no lo que se repite (patrón).",
      },
      {
        id: "c",
        texto: "El dueño cree que en diciembre la gente solo compra regalos, no ropa para sí misma",
        feedback: "❌ Eso es una creencia de alguien (modelo mental), no algo que puedas contar repitiéndose (patrón).",
      },
      {
        id: "d",
        texto: "Este diciembre las ventas bajaron un 15%",
        feedback: "❌ Eso pasó una sola vez — un patrón necesita repetirse, no ser solo un hecho aislado.",
      },
    ],
  },
  {
    nivel: "Estructura",
    enunciado: "¿Cuál describe la ESTRUCTURA que sostiene ese patrón?",
    opciones: [
      {
        id: "a", correcta: true,
        texto: "La tienda no ajusta su inventario ni sus horarios para fin de año, a diferencia de otras tiendas del sector",
        feedback: "✅ Exacto. La estructura es lo que sostiene el problema por debajo — reglas, costumbres, o algo que falta.",
      },
      {
        id: "b",
        texto: "El mes pasado se agotó una talla y no la repusieron",
        feedback: "❌ Eso es un evento puntual, no parte del sistema que sostiene el problema.",
      },
      {
        id: "c",
        texto: "El dueño piensa que su clientela fija no cambia sus hábitos en diciembre",
        feedback: "❌ Eso es una creencia, no un proceso o recurso concreto.",
      },
      {
        id: "d",
        texto: "Cada año la tienda cierra dos horas antes en diciembre por baja afluencia percibida",
        feedback: "❌ Cerca, pero describe una conducta repetida (patrón), no la causa estructural detrás.",
      },
    ],
  },
  {
    nivel: "Modelo mental",
    enunciado: "¿Cuál es el MODELO MENTAL en la raíz de todo lo anterior?",
    opciones: [
      {
        id: "a", correcta: true,
        texto: "El dueño cree que su negocio no depende de la temporada, que sus clientes leales compran igual todo el año",
        feedback: "✅ Exacto. El modelo mental es la creencia de fondo — lo que alguien piensa que es cierto, aunque nadie lo diga en voz alta. Ahí está la raíz de todo lo demás.",
      },
      {
        id: "b",
        texto: "No existe un plan de marketing de temporada",
        feedback: "❌ Eso es una estructura (o su ausencia), no una creencia.",
      },
      {
        id: "c",
        texto: "Las ventas bajan todos los diciembres consecutivos",
        feedback: "❌ Eso es el patrón que ya identificaste, no la creencia que lo explica.",
      },
      {
        id: "d",
        texto: "Un cliente se quejó de que no había promociones navideñas",
        feedback: "❌ Eso es un evento aislado, no una creencia de fondo.",
      },
    ],
  },
];

export default function IcebergArribaAbajo({ onCompletar }) {
  /* Una entrada por pregunta contestada: { opcionId, acerto }. */
  const [respuestas, setRespuestas] = useState([]);

  const indice = respuestas.length;          // pregunta activa
  const terminado = indice >= PREGUNTAS.length;
  const aciertos = respuestas.filter((r) => r.acerto).length;
  /* El evento siempre visible; cada pregunta contestada destapa su nivel. */
  const profundidad = respuestas.length;

  const responder = (pregunta, opcion) => {
    const siguientes = [...respuestas, { opcionId: opcion.id, acerto: !!opcion.correcta }];
    setRespuestas(siguientes);
    if (siguientes.length === PREGUNTAS.length) {
      const acertadas = siguientes.filter((r) => r.acerto).length;
      onCompletar?.((acertadas / PREGUNTAS.length) * 100);
    }
  };

  const preguntaActual = terminado ? null : PREGUNTAS[indice];

  return (
    <div>
      <div
        style={{
          borderRadius: "18px",
          background: "rgba(248,249,250,0.04)",
          border: "1px solid rgba(248,249,250,0.12)",
          padding: "clamp(16px, 2.5vw, 24px)",
          marginBottom: "16px",
        }}
      >
        <p style={{ fontFamily: "Sora, sans-serif", fontSize: "12px", fontWeight: 700, letterSpacing: "0.12em", color: "rgba(248,249,250,0.5)", margin: "0 0 8px" }}>
          EVENTO
        </p>
        <p style={{ fontSize: "16px", lineHeight: 1.55, margin: 0, color: FAE.text }}>{EVENTO}</p>
      </div>

      {/*
        El dibujo y la pregunta del nivel tienen que verse a la vez: mirar el
        iceberg es parte de responder. El alto del SVG y las dos columnas los
        decide .ice-constructor en home.css, con la misma técnica que usa el
        buceo progresivo. Sin pregunta activa (mecánica terminada) no hay
        rejilla: el dibujo ocupa el ancho completo.
      */}
      <div className={preguntaActual ? "ice-constructor" : undefined} style={{ marginBottom: "16px" }}>
        <div
          className="ice-grafico"
          style={{
            borderRadius: "18px",
            background: "rgba(248,249,250,0.03)",
            border: "1px solid rgba(248,249,250,0.1)",
            padding: "clamp(10px, 2vw, 20px)",
          }}
        >
          <IcebergDiagram levels={NIVELES_DIAGRAMA} depth={profundidad} />
        </div>

      {preguntaActual && (
        <div
          className="ice-pregunta"
          style={{
            borderRadius: "16px",
            background: "rgba(248,249,250,0.04)",
            border: "1px solid rgba(248,249,250,0.12)",
            padding: "18px 20px",
          }}
        >
          <p style={{ fontFamily: "Sora, sans-serif", fontSize: "12px", fontWeight: 700, letterSpacing: "0.12em", color: FAE.teal, margin: "0 0 8px" }}>
            NIVEL {indice + 1} DE {PREGUNTAS.length} · {preguntaActual.nivel.toUpperCase()}
          </p>
          <p style={{ fontSize: "15.5px", lineHeight: 1.5, margin: "0 0 16px", color: FAE.text }}>
            {preguntaActual.enunciado}
          </p>
          <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
            {preguntaActual.opciones.map((opt) => (
              <button
                key={opt.id}
                type="button"
                onClick={() => responder(preguntaActual, opt)}
                style={{
                  textAlign: "left", fontFamily: "Inter, sans-serif", fontSize: "14.5px", lineHeight: 1.45,
                  padding: "13px 16px", borderRadius: "13px", cursor: "pointer",
                  background: "rgba(248,249,250,0.04)",
                  border: "1px solid rgba(248,249,250,0.16)",
                  color: FAE.text,
                }}
              >
                {opt.texto}
              </button>
            ))}
          </div>
        </div>
      )}
      </div>

      {/* Retroalimentación de lo ya contestado, en orden. */}
      {respuestas.length > 0 && (
        <div style={{ display: "flex", flexDirection: "column", gap: "10px", marginTop: "16px" }}>
          {respuestas.map((r, i) => {
            const pregunta = PREGUNTAS[i];
            const opcion = pregunta.opciones.find((o) => o.id === r.opcionId);
            const color = r.acerto ? FAE.teal : FAE.coral;
            return (
              <div
                key={pregunta.nivel}
                style={{
                  borderRadius: "13px",
                  background: r.acerto ? "rgba(42,157,143,0.09)" : "rgba(231,111,81,0.09)",
                  border: `1px solid ${color}44`,
                  padding: "13px 16px",
                }}
              >
                <p style={{ fontFamily: "Sora, sans-serif", fontSize: "11.5px", fontWeight: 700, letterSpacing: "0.08em", color, margin: "0 0 5px" }}>
                  {pregunta.nivel.toUpperCase()}
                </p>
                <p style={{ fontSize: "14px", lineHeight: 1.55, margin: 0, color: "rgba(248,249,250,0.85)" }}>
                  {opcion.feedback}
                </p>
              </div>
            );
          })}
        </div>
      )}

      {terminado && (
        <div
          style={{
            marginTop: "16px", borderRadius: "16px",
            background: "rgba(42,157,143,0.07)", border: "1px solid rgba(42,157,143,0.26)",
            padding: "18px 20px",
          }}
        >
          <p style={{ fontSize: "14.5px", lineHeight: 1.6, margin: 0, color: "rgba(248,249,250,0.85)" }}>
            Iceberg completo: acertaste <strong style={{ color: FAE.text }}>{aciertos} de {PREGUNTAS.length}</strong> niveles.
            Cada nivel explica por qué existe el de arriba; distinguirlos es lo que permite intervenir donde de verdad cambia algo.
          </p>
        </div>
      )}
    </div>
  );
}
