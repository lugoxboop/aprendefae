import { useState } from "react";
import { FAE } from "../../../theme.js";
import { CASOS_ESTETOSCOPIO, COMPONENTES } from "../../../data/corazonDA.js";
import { CSS_CORAZON, Camara, Camaraseccion } from "./circulatorio.jsx";

/*
 * APRENDER 3 — "Diagnóstico con estetoscopio".
 *
 * Cuatro pacientes, que son cuatro casos reales de la economía colombiana.
 * Cada uno tiene su cámara con un reparto de bandas distinto según qué
 * componente domina; al auscultarlo se revela el diagnóstico.
 *
 * ═══════════ LAS CIFRAS SON REALES Y ESTÁN VERIFICADAS ═══════════
 *
 * Las cuatro se comprobaron contra sus fuentes antes de escribirlas, y dos
 * atribuciones estaban mal en el encargo:
 *
 *   · El tonelaje de flores lo publica el ICA, no el DANE. Asocolflores aporta
 *     el crecimiento del 13%.
 *   · La cifra del presupuesto necesitaba su decreto — el 1621 de 2024 — y se
 *     confirmó además que es UNA SOLA PARTIDA para vías y transporte público,
 *     no dos sumadas, que era la duda razonable.
 *
 * Cada caso enseña su fuente al lado de la cifra. Un número real atribuido a
 * la institución equivocada es peor que no poner número.
 *
 * ═══════════ EL CASO 2 ES UNA CAÍDA, Y NO SE ARREGLA ═══════════
 *
 * La inversión extranjera baja por tercer año. Es el dato más reciente y
 * enseña que un componente no solo sube. Convertirlo en un ejemplo positivo
 * sería más cómodo y menos cierto.
 *
 * ═══════════ LOS REPARTOS DE BANDA NO SON DATOS ═══════════
 *
 * El ancho de las bandas de cada paciente ilustra QUÉ COMPONENTE DOMINA, no la
 * composición real de la Demanda Agregada colombiana. Se dice en pantalla,
 * porque un estudiante que copie esos porcentajes a un examen estaría copiando
 * algo que nadie midió.
 */

const COLOR = Object.fromEntries(COMPONENTES.map((c) => [c.id, c.color]));
const NOMBRE = Object.fromEntries(COMPONENTES.map((c) => [c.id, c.nombre]));

/* El estetoscopio: dos círculos y un tubo. Nunca una lámina de anatomía. */
function Estetoscopio({ activo }) {
  return (
    <svg width="26" height="26" viewBox="0 0 26 26" aria-hidden="true" style={{ flexShrink: 0 }}>
      <path
        d="M7 3 V10 a6 6 0 0 0 12 0 V3"
        fill="none"
        stroke={activo ? FAE.teal : "rgba(248,249,250,0.4)"}
        strokeWidth="1.8"
        strokeLinecap="round"
      />
      <circle cx="7" cy="3" r="1.8" fill={activo ? FAE.teal : "rgba(248,249,250,0.4)"} />
      <circle cx="19" cy="3" r="1.8" fill={activo ? FAE.teal : "rgba(248,249,250,0.4)"} />
      <circle cx="13" cy="20" r="4" fill="none" stroke={activo ? FAE.teal : "rgba(248,249,250,0.4)"} strokeWidth="1.8" />
    </svg>
  );
}

export default function DiagnosticoEstetoscopio() {
  const [abierto, setAbierto] = useState(null);

  return (
    <Camaraseccion rotulo="CUATRO PACIENTES" titulo="Ausculta y mira quién lleva el pulso" acento={FAE.ambar}>
      <style>{CSS_CORAZON}</style>

      <p style={{ fontSize: "13.5px", lineHeight: 1.6, color: "rgba(248,249,250,0.66)", margin: "0 0 4px" }}>
        Cuatro casos reales. Ausculta cada uno y mira qué componente lleva el pulso.
      </p>
      <p style={{ fontSize: "12.5px", lineHeight: 1.55, color: "rgba(248,249,250,0.45)", margin: "0 0 18px" }}>
        El ancho de las bandas ilustra <strong>cuál domina</strong> en cada caso — no es la composición
        real de la Demanda Agregada colombiana, que nadie ha medido así.
      </p>

      <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
        {CASOS_ESTETOSCOPIO.map((caso) => {
          const activo = abierto === caso.id;
          const acento = COLOR[caso.componente];
          return (
            <div
              key={caso.id}
              style={{
                borderRadius: "16px",
                background: activo ? "rgba(248,249,250,0.05)" : "rgba(248,249,250,0.03)",
                border: `1px solid ${activo ? `${acento}66` : "rgba(248,249,250,0.11)"}`,
                overflow: "hidden",
                transition: "background 200ms ease, border-color 200ms ease",
              }}
            >
              <button
                type="button"
                onClick={() => setAbierto(activo ? null : caso.id)}
                aria-expanded={activo}
                style={{
                  width: "100%", textAlign: "left", cursor: "pointer",
                  background: "transparent", border: "none", padding: "13px 15px",
                  color: "inherit", font: "inherit",
                  display: "flex", alignItems: "flex-start", gap: "11px",
                }}
              >
                <Estetoscopio activo={activo} />
                <span style={{ minWidth: 0, flex: 1 }}>
                  <span style={{ display: "block", fontFamily: "Sora, sans-serif", fontSize: "13.5px", fontWeight: 600, color: FAE.text, lineHeight: 1.4 }}>
                    {caso.caso}
                  </span>
                  <span style={{ display: "block", marginTop: "4px", fontSize: "11.5px", color: "rgba(248,249,250,0.45)" }}>
                    {activo ? "Auscultado" : "Toca para auscultar"}
                  </span>
                </span>
              </button>

              {activo && (
                <div className="fae-cz-entrar" style={{ padding: "0 15px 15px" }}>
                  {/*
                    La cámara de este paciente: el reparto que lo caracteriza.

                    SIN LEYENDA A PROPÓSITO: la leyenda imprime pesos, y estos
                    repartos no son pesos —son una ilustración de qué domina—,
                    así que ponerla diría una cifra que nadie midió.

                    Y el color no queda solo: la banda que domina siempre es
                    bastante ancha para llevar su letra encima, y justo debajo
                    va escrito qué componente lleva el pulso. Las bandas
                    estrechas son precisamente las que no informan de nada.
                  */}
                  <Camara valores={caso.pesos} maximo={100} alto={40} mostrarLeyenda={false} />

                  <p style={{ margin: "12px 0 0", fontFamily: "Sora, sans-serif", fontSize: "12px", fontWeight: 700, letterSpacing: "0.05em", color: acento }}>
                    {/* El componente escrito, no solo la banda más ancha en su color. */}
                    LLEVA EL PULSO · {caso.componente} — {NOMBRE[caso.componente]}
                    <span style={{ color: "rgba(248,249,250,0.5)", fontWeight: 600, letterSpacing: 0 }}>
                      {" "}· entra por {caso.via}
                    </span>
                  </p>

                  <p style={{ margin: "8px 0 0", fontSize: "13px", lineHeight: 1.6, color: "rgba(248,249,250,0.72)" }}>
                    {caso.diagnostico}
                  </p>

                  {/* La cifra, con su detalle y su fuente pegada. */}
                  <div
                    style={{
                      marginTop: "12px", padding: "11px 13px", borderRadius: "12px",
                      background: "rgba(10,20,34,0.45)", border: "1px solid rgba(248,249,250,0.1)",
                    }}
                  >
                    <p style={{ margin: 0, fontFamily: "Sora, sans-serif", fontSize: "15px", fontWeight: 700, color: FAE.text, fontVariantNumeric: "tabular-nums" }}>
                      {caso.cifra}
                    </p>
                    <p style={{ margin: "4px 0 0", fontSize: "12px", lineHeight: 1.5, color: "rgba(248,249,250,0.6)" }}>
                      {caso.detalle}
                    </p>
                    <p style={{ margin: "6px 0 0", fontSize: "11px", color: "rgba(248,249,250,0.42)" }}>
                      Fuente: {caso.fuente}
                    </p>
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>

      <p style={{ fontSize: "12px", lineHeight: 1.55, color: "rgba(248,249,250,0.42)", margin: "16px 0 0" }}>
        Sin puntaje y sin orden obligatorio: ausculta los que quieras, las veces que quieras.
      </p>
    </Camaraseccion>
  );
}
