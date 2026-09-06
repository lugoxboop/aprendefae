import { useEffect, useRef, useState } from "react";
import { RotateCcw, ChevronRight } from "lucide-react";
import { FAE } from "../../../theme.js";
import {
  PREGUNTA_PREDICCION, DEFINICION_FALLO_MERCADO, MERCADO_CASO, FASES_MERCADO,
} from "../../../data/politicaEconomica.js";
import { useEnPantalla } from "../../../utils/enPantalla.js";
import { CSS_SALA, Panel, Piloto, Grabado, VERDE, ROJO, AMBAR } from "./marco.jsx";

/*
 * PIEZA 1 — "¿Autorregulación o intervención?".
 *
 * Material teórico: sin preguntas calificadas, sin condición de término, sin
 * FP. Se puede reiniciar y volver a correr las veces que se quiera.
 *
 * ───────────────── EL ORDEN ES LA PEDAGOGÍA ─────────────────
 *
 * Predecir y DESPUÉS observar (demostración interactiva con predicción, Maier
 * & Simkins). El estudiante se compromete mentalmente antes de ver el
 * resultado, y por eso la pregunta va antes del interruptor y no al lado.
 *
 * LA PREDICCIÓN NO SE CALIFICA NI SE VALIDA. Es abierta, sin opciones, y el
 * cuadro de texto se puede dejar vacío: su único trabajo es que el estudiante
 * se moje. Convertirla en un test de opción múltiple destruiría exactamente lo
 * que la hace funcionar.
 *
 * LA ESTABILIDAD TIENE QUE DURAR. Catorce segundos en los que el mercado se
 * acomoda solo y se le ve acomodarse. Si el fallo llegara a los dos segundos,
 * el estudiante aprendería que el mercado no sirve, que es la lección
 * contraria: casi siempre sí sirve, y esa es la mitad de la idea.
 *
 * ───────────────── NI UNA CIFRA ─────────────────
 *
 * No hay precios en pesos, ni cantidades, ni porcentajes. La oferta, la
 * demanda y el precio son movimiento relativo: casas que aparecen, una fila
 * que crece, una columna que sube. El estudiante tiene que VER la escasez, no
 * leer estadísticas inventadas sobre Bogotá.
 */

/* Cuántas piezas se dibujan como mucho. Es capacidad del dibujo, no un dato. */
const CASAS = 14;
const PERSONAS = 24;

/*
 * El estado del mercado en cada fase, en piezas dibujadas. Son proporciones
 * visuales para que se vea el desajuste: no representan viviendas ni personas
 * reales, y por eso en pantalla no aparece ningún recuento.
 */
const ESCENA = {
  reposo:  { casas: 8,  fila: 8,  precio: 0.30 },
  estable: { casas: 12, fila: 12, precio: 0.36 },
  tension: { casas: 13, fila: 18, precio: 0.60 },
  fallo:   { casas: 13, fila: 24, precio: 0.93 },
};

const CSS = `
${CSS_SALA}
/* El vaivén de la fase estable: el mercado respira y se reacomoda. */
@keyframes fae-au-respira {
  0%, 100% { transform: translateY(0) scaleY(1); }
  50%      { transform: translateY(-3px) scaleY(1.04); }
}
.fae-au-respira { animation: fae-au-respira 3.4s ease-in-out infinite; transform-origin: bottom; }

/* En el fallo el precio no se estabiliza: sigue empujando hacia arriba. */
@keyframes fae-au-sin-freno {
  0%, 100% { transform: translateY(0); }
  50%      { transform: translateY(-5px); }
}
.fae-au-sin-freno { animation: fae-au-sin-freno 1.5s ease-in-out infinite; }

@keyframes fae-au-flecha {
  0%   { opacity: 0; transform: translateY(4px); }
  40%  { opacity: 1; }
  100% { opacity: 0; transform: translateY(-12px); }
}
.fae-au-flecha { animation: fae-au-flecha 1.6s ease-out infinite; }

@media (prefers-reduced-motion: reduce) {
  .fae-au-respira, .fae-au-sin-freno, .fae-au-flecha { animation: none !important; }
}
`;

/* Una casa. Llena = ocupada; contorno = disponible. */
function Casa({ activa, disponible }) {
  return (
    <svg width="26" height="24" viewBox="0 0 26 24" aria-hidden="true"
      style={{ opacity: activa ? 1 : 0.12, transition: "opacity 900ms ease" }}>
      <path
        d="M13 3 L24 11 L21 11 L21 21 L5 21 L5 11 L2 11 Z"
        fill={disponible ? "transparent" : FAE.navy}
        stroke={disponible ? VERDE : "rgba(203,220,242,0.5)"}
        strokeWidth="1.6"
        strokeLinejoin="round"
      />
    </svg>
  );
}

/* Una persona. Coral si se quedó sin vivienda. */
function Persona({ activa, sinCasa }) {
  return (
    <svg width="12" height="20" viewBox="0 0 12 20" aria-hidden="true"
      style={{ opacity: activa ? 1 : 0.1, transition: "opacity 700ms ease" }}>
      <circle cx="6" cy="4.4" r="3.4" fill={sinCasa ? ROJO : "rgba(203,220,242,0.72)"} />
      <path d="M6 9 C2.6 9 1.4 12 1.4 19 L10.6 19 C10.6 12 9.4 9 6 9 Z"
        fill={sinCasa ? ROJO : "rgba(203,220,242,0.72)"} />
    </svg>
  );
}

export default function Autorregulacion() {
  /* "pregunta" -> "listo" -> corriendo las fases -> "fallo" */
  const [paso, setPaso] = useState("pregunta");
  const [prediccion, setPrediccion] = useState("");
  const [fase, setFase] = useState(null);
  const relojes = useRef([]);
  const [ref, enPantalla] = useEnPantalla();

  useEffect(() => () => relojes.current.forEach(clearTimeout), []);

  const limpiar = () => {
    relojes.current.forEach(clearTimeout);
    relojes.current = [];
  };

  /*
   * Las fases se encadenan con relojes propios y no con el fin de una
   * animación: una pestaña que no pinta dejaría la demostración colgada.
   */
  const arrancar = () => {
    limpiar();
    setFase("estable");
    let acumulado = 0;
    FASES_MERCADO.forEach((f, i) => {
      if (i === 0) return;
      acumulado += FASES_MERCADO[i - 1].ms;
      relojes.current.push(setTimeout(() => setFase(f.id), acumulado));
    });
  };

  const reiniciar = () => {
    limpiar();
    setFase(null);
    setPaso("pregunta");
    setPrediccion("");
  };

  const activo = fase ?? "reposo";
  const e = ESCENA[activo];
  const fichaFase = FASES_MERCADO.find((f) => f.id === fase);
  const sinCasa = Math.max(0, e.fila - e.casas);
  const enFallo = fase === "fallo";
  const enEstable = fase === "estable";

  return (
    <div ref={ref}>
      <style>{CSS}</style>

      {/* ─────────────────── 1. La predicción, antes de nada ─────────────────── */}
      {paso === "pregunta" && (
        <Panel rotulo="PANEL 2 · DEMOSTRACIÓN" titulo={MERCADO_CASO.titulo} acento={AMBAR}>
          <p style={{ fontSize: "14.5px", lineHeight: 1.62, color: "rgba(248,249,250,0.75)", margin: "0 0 18px" }}>
            {MERCADO_CASO.entrada}
          </p>

          <div
            style={{
              borderRadius: "16px", background: "rgba(233,196,106,0.07)",
              border: `1px solid ${AMBAR}44`, padding: "clamp(14px, 2.2vw, 18px)",
            }}
          >
            <Grabado color={AMBAR}>ANTES DE TOCAR NADA</Grabado>
            <p style={{ fontFamily: "Sora, sans-serif", fontWeight: 700, fontSize: "clamp(17px, 2.6vw, 21px)", color: FAE.text, margin: "8px 0 6px", lineHeight: 1.35 }}>
              {PREGUNTA_PREDICCION}
            </p>
            <p style={{ fontSize: "13px", lineHeight: 1.55, color: "rgba(248,249,250,0.55)", margin: "0 0 14px" }}>
              No se corrige ni se guarda. Es para que te comprometas con una respuesta antes de verla —
              puedes escribirla o solo pensarla.
            </p>

            <textarea
              value={prediccion}
              onChange={(ev) => setPrediccion(ev.target.value)}
              rows={3}
              placeholder="Opcional: escribe aquí lo que crees que va a pasar."
              style={{
                width: "100%", boxSizing: "border-box", resize: "vertical",
                padding: "12px 14px", borderRadius: "12px",
                background: "rgba(10,20,34,0.6)", border: "1px solid rgba(248,249,250,0.16)",
                color: FAE.text, fontFamily: "Inter, sans-serif", fontSize: "14px", lineHeight: 1.5,
              }}
            />

            <button
              type="button"
              onClick={() => setPaso("listo")}
              style={{
                marginTop: "14px", display: "inline-flex", alignItems: "center", gap: "8px",
                padding: "12px 20px", borderRadius: "14px", cursor: "pointer",
                background: AMBAR, border: `1px solid ${AMBAR}`, color: "#08111d",
                fontFamily: "Sora, sans-serif", fontSize: "14px", fontWeight: 700,
              }}
            >
              Ya tengo mi respuesta <ChevronRight size={16} />
            </button>
          </div>
        </Panel>
      )}

      {/* ─────────────────── 2. El interruptor y el mercado ─────────────────── */}
      {paso === "listo" && (
        <Panel rotulo="PANEL 2 · DEMOSTRACIÓN" titulo={MERCADO_CASO.titulo} acento={AMBAR}>
          {/* El interruptor. Grande, uno solo, sin nada que lo acompañe. */}
          <div
            style={{
              display: "flex", flexWrap: "wrap", alignItems: "center", gap: "14px",
              padding: "14px 16px", borderRadius: "16px", marginBottom: "16px",
              background: "rgba(10,20,34,0.55)", border: "1px solid rgba(248,249,250,0.14)",
            }}
          >
            <button
              type="button"
              onClick={fase ? undefined : arrancar}
              disabled={!!fase}
              aria-pressed={!!fase}
              style={{
                position: "relative", width: "82px", height: "42px", flexShrink: 0,
                borderRadius: "999px", cursor: fase ? "default" : "pointer",
                background: fase ? `${VERDE}33` : "rgba(248,249,250,0.08)",
                border: `1px solid ${fase ? VERDE : "rgba(248,249,250,0.3)"}`,
                transition: "background 400ms ease, border-color 400ms ease",
              }}
            >
              <span
                aria-hidden="true"
                style={{
                  position: "absolute", top: "4px", left: fase ? "44px" : "4px",
                  width: "32px", height: "32px", borderRadius: "999px",
                  background: fase ? VERDE : "rgba(248,249,250,0.55)",
                  boxShadow: fase ? `0 0 14px ${VERDE}` : "none",
                  transition: "left 420ms cubic-bezier(.4,0,.2,1), background 400ms ease",
                }}
              />
            </button>

            <div style={{ flex: 1, minWidth: "180px" }}>
              <p style={{ fontFamily: "Sora, sans-serif", fontSize: "14.5px", fontWeight: 700, color: FAE.text, margin: "0 0 4px" }}>
                Dejar que el mercado se autorregule
              </p>
              <p style={{ fontSize: "12.5px", color: "rgba(248,249,250,0.55)", margin: 0 }}>
                {fase ? "Encendido. Nadie está interviniendo." : "Acciónalo para empezar."}
              </p>
            </div>

            {fase && <Piloto color={enFallo ? ROJO : VERDE} texto={enFallo ? "Fallo" : "En marcha"} late={enPantalla} />}
          </div>

          {/* ───────────────────────── la escena ───────────────────────── */}
          <div
            className="fae-sc-rejilla"
            style={{
              display: "grid", gridTemplateColumns: "minmax(0, 1fr) 74px", gap: "14px",
              padding: "16px", borderRadius: "18px",
              background: "rgba(10,20,34,0.45)", border: "1px solid rgba(248,249,250,0.1)",
            }}
          >
            {/* Oferta y demanda. */}
            <div>
              <Grabado style={{ marginBottom: "8px" }}>VIVIENDA EN ARRIENDO</Grabado>
              <div
                className={enEstable && enPantalla ? "fae-au-respira" : undefined}
                style={{ display: "flex", flexWrap: "wrap", gap: "4px", marginBottom: "16px", minHeight: "52px" }}
              >
                {Array.from({ length: CASAS }, (_, i) => (
                  <Casa key={i} activa={i < e.casas} disponible={i >= e.fila} />
                ))}
              </div>

              <Grabado style={{ marginBottom: "8px" }}>QUIENES BUSCAN DÓNDE VIVIR</Grabado>
              <div style={{ display: "flex", flexWrap: "wrap", gap: "4px", minHeight: "44px" }}>
                {Array.from({ length: PERSONAS }, (_, i) => (
                  <Persona key={i} activa={i < e.fila} sinCasa={i >= e.casas} />
                ))}
              </div>
            </div>

            {/* El precio. Sin números: solo altura. */}
            <div style={{ display: "flex", flexDirection: "column", alignItems: "center" }}>
              <Grabado style={{ marginBottom: "8px", writingMode: "horizontal-tb" }}>PRECIO</Grabado>
              <div
                style={{
                  position: "relative", flex: 1, width: "30px", minHeight: "128px",
                  borderRadius: "8px", background: "rgba(248,249,250,0.06)",
                  border: "1px solid rgba(248,249,250,0.14)", overflow: "hidden",
                  display: "flex", alignItems: "flex-end",
                }}
              >
                <div
                  className={enFallo && enPantalla ? "fae-au-sin-freno" : enEstable && enPantalla ? "fae-au-respira" : undefined}
                  style={{
                    width: "100%", height: `${e.precio * 100}%`,
                    background: enFallo
                      ? `linear-gradient(to top, ${ROJO}, ${ROJO}bb)`
                      : `linear-gradient(to top, ${VERDE}, ${VERDE}bb)`,
                    transition: "height 2600ms cubic-bezier(.4,0,.2,1), background 900ms ease",
                  }}
                />
              </div>
              {/* En el fallo, el precio no encuentra techo. */}
              {enFallo && (
                <span
                  className={enPantalla ? "fae-au-flecha" : undefined}
                  aria-hidden="true"
                  style={{ marginTop: "6px", color: ROJO, fontSize: "17px", lineHeight: 1 }}
                >
                  ▲
                </span>
              )}
              <span style={{ marginTop: "6px", fontSize: "11px", color: "rgba(248,249,250,0.5)", textAlign: "center", lineHeight: 1.3 }}>
                {enFallo ? "sin freno" : fase ? "se acomoda" : "en reposo"}
              </span>
            </div>
          </div>

          {/* El relato de la fase. */}
          {fichaFase && (
            <div key={fichaFase.id} className="fae-sc-entrar" style={{ marginTop: "16px" }}>
              <Piloto
                color={enFallo ? ROJO : fase === "tension" ? AMBAR : VERDE}
                texto={fichaFase.rotulo}
                late={enPantalla && !enFallo}
              />
              <p style={{ fontSize: "14.5px", lineHeight: 1.65, color: "rgba(248,249,250,0.8)", margin: "10px 0 0" }}>
                {fichaFase.texto}
              </p>
            </div>
          )}

          {/* ───────────────── el remate: qué acaba de pasar ───────────────── */}
          {enFallo && (
            <div
              className="fae-sc-entrar"
              style={{
                marginTop: "18px", borderRadius: "18px", padding: "clamp(15px, 2.2vw, 20px)",
                background: "rgba(231,111,81,0.10)", border: `1px solid ${ROJO}66`,
              }}
            >
              <Grabado color={ROJO}>FALLO DEL MERCADO</Grabado>
              <p style={{ fontSize: "clamp(15px, 2.3vw, 17px)", lineHeight: 1.6, color: FAE.text, margin: "10px 0 0" }}>
                {DEFINICION_FALLO_MERCADO}
              </p>

              {/* Si escribió su predicción, se le devuelve para que la compare. */}
              {prediccion.trim() && (
                <div style={{ marginTop: "16px", paddingTop: "14px", borderTop: "1px solid rgba(248,249,250,0.14)" }}>
                  <Grabado>LO QUE PREDIJISTE</Grabado>
                  <p style={{ fontSize: "14px", lineHeight: 1.6, color: "rgba(248,249,250,0.72)", margin: "8px 0 0", fontStyle: "italic" }}>
                    «{prediccion.trim()}»
                  </p>
                </div>
              )}
            </div>
          )}

          {fase && (
            <button
              type="button"
              onClick={reiniciar}
              style={{
                marginTop: "16px", display: "inline-flex", alignItems: "center", gap: "8px",
                fontFamily: "Sora, sans-serif", fontSize: "13px", fontWeight: 600,
                padding: "10px 16px", borderRadius: "999px", cursor: "pointer",
                background: "transparent", border: "1px solid rgba(248,249,250,0.22)",
                color: "rgba(248,249,250,0.7)",
              }}
            >
              <RotateCcw size={14} /> Volver a empezar
            </button>
          )}
        </Panel>
      )}
    </div>
  );
}
