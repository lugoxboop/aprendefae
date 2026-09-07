import { useEffect, useRef, useState } from "react";
import { RotateCcw, ChevronRight, TrendingUp, TrendingDown } from "lucide-react";
import { FAE } from "../../theme.js";
import {
  OBJETIVO_GANADORES, RONDAS_GANADORES, PREGUNTA_DIRECTO, retroDirecto,
} from "../../data/juegosPolitica2.js";
import { barajar } from "../../utils/barajar.js";

/*
 * ACTIVIDAD 4 — "¿Quién gana, quién pierde?".
 *
 * Juego evaluativo. Cuatro rondas, cada una con una medida real de política
 * económica y cuatro personajes a los que hay que repartir entre GANA y PIERDE.
 *
 * QUÉ ENSEÑA, QUE NO ES ARITMÉTICA DE INDICADORES. Las otras piezas del tema
 * preguntan qué mueve una medida; esta pregunta A QUIÉN. Subir la tasa no es
 * "bueno" ni "malo": es bueno para el del CDT y malo para el de la hipoteca, a
 * la vez y por la misma razón. Ese conflicto de intereses es el contenido.
 *
 * ─────────────── LOS PERSONAJES CAMBIAN DE SITIO CADA RONDA ───────────────
 *
 * Se barajan al entrar en la ronda. Con posiciones fijas, quien repite la
 * actividad recuerda "el primero gana" en vez de razonar de nuevo quién sale
 * beneficiado.
 *
 * ─────────────── SE TOCA, NO SE ARRASTRA ───────────────
 *
 * La ficha decía arrastrar a una zona. Aquí se toca el personaje y luego GANA
 * o PIERDE, como en el resto del sitio: el arrastre nativo no funciona con el
 * dedo sin una librería, y esto se usa sobre todo en el teléfono.
 *
 * ─────────────── PUNTUACIÓN ───────────────
 *
 *   Etapa 1 · clasificar los cuatro personajes de cada ronda ...... 80%
 *   Etapa 2 · quién lo siente más directo, una por ronda .......... 20%
 *
 * Los pesos se DERIVAN del número de rondas, no están escritos a mano: si
 * alguna vez entra o sale una ronda, el reparto se reajusta solo.
 *
 * NO HAY SEGUNDO INTENTO. Fallar muestra igual la explicación real —el
 * estudiante aprende lo mismo— pero puntúa como fallo, que es la convención
 * del resto del tema.
 */

const PESO_ETAPA1 = 80;
const PESO_ETAPA2 = 20;
const TOTAL_CLASIFICACIONES = RONDAS_GANADORES.reduce((n, r) => n + r.personajes.length, 0);

const CSS = `
@keyframes fae-qg-encaje { 0% { opacity: 0; transform: scale(.94); } 100% { opacity: 1; transform: scale(1); } }
.fae-qg-encaje { animation: fae-qg-encaje 400ms cubic-bezier(.3,.9,.4,1) both; }
@keyframes fae-qg-rechazo { 0%,100% { transform: translateX(0); } 25% { transform: translateX(-8px); } 75% { transform: translateX(8px); } }
.fae-qg-rechazo { animation: fae-qg-rechazo 400ms ease-in-out; }
@keyframes fae-qg-entrar { from { opacity: 0; transform: translateY(9px); } to { opacity: 1; transform: none; } }
.fae-qg-entrar { animation: fae-qg-entrar 400ms ease-out both; }
@media (prefers-reduced-motion: reduce) {
  .fae-qg-encaje, .fae-qg-rechazo, .fae-qg-entrar { animation: none !important; }
}
`;

/* Silueta genérica: una figura, sin rasgos. Nadie tiene cara aquí. */
function Silueta({ color = "rgba(203,220,242,0.5)" }) {
  return (
    <svg width="22" height="26" viewBox="0 0 22 26" aria-hidden="true" style={{ flexShrink: 0 }}>
      <circle cx="11" cy="7" r="5" fill={color} />
      <path d="M2 26 C2 17, 20 17, 20 26 Z" fill={color} />
    </svg>
  );
}

export default function QuienGanaQuienPierde({ onCompletar }) {
  const [empezado, setEmpezado] = useState(false);
  const [ronda, setRonda] = useState(0);
  /* id de personaje -> "gana" | "pierde" que eligió el estudiante */
  const [puestos, setPuestos] = useState({});
  const [elegido, setElegido] = useState(null);
  const [rechazado, setRechazado] = useState(null);
  const [directo, setDirecto] = useState(null);   // respuesta de etapa 2
  const [aciertos, setAciertos] = useState(0);    // clasificaciones bien, acumuladas
  const [directos, setDirectos] = useState(0);    // etapas 2 bien, acumuladas
  const inicio = useRef(Date.now());

  const r = RONDAS_GANADORES[ronda];
  const terminado = ronda >= RONDAS_GANADORES.length;

  /* El orden de los personajes se sortea al entrar en cada ronda. */
  const [orden, setOrden] = useState(() => barajar(RONDAS_GANADORES[0].personajes));

  const clasificados = Object.keys(puestos).length;
  const rondaCompleta = r && clasificados === r.personajes.length;

  const pct = Math.round(
    (aciertos / TOTAL_CLASIFICACIONES) * PESO_ETAPA1 +
      (directos / RONDAS_GANADORES.length) * PESO_ETAPA2
  );

  useEffect(() => {
    if (terminado) onCompletar?.(pct, Date.now() - inicio.current);
  }, [terminado]);

  const colocar = (resultado) => {
    if (!elegido) return;
    const p = r.personajes.find((x) => x.id === elegido);
    if (puestos[p.id]) return;

    if (p.resultado === resultado) setAciertos((n) => n + 1);
    else {
      setRechazado(p.id);
      setTimeout(() => setRechazado(null), 420);
    }
    /*
     * Acierte o falle, la ficha queda colocada CON SU RESULTADO REAL y su
     * explicación: la lección es por qué gana o pierde, no si se adivinó.
     */
    setPuestos((s) => ({ ...s, [p.id]: resultado }));
    setElegido(null);
  };

  const siguiente = () => {
    const n = ronda + 1;
    setRonda(n);
    setPuestos({}); setElegido(null); setDirecto(null);
    if (n < RONDAS_GANADORES.length) setOrden(barajar(RONDAS_GANADORES[n].personajes));
  };

  const reiniciar = () => {
    setRonda(0); setPuestos({}); setElegido(null); setDirecto(null);
    setAciertos(0); setDirectos(0);
    setOrden(barajar(RONDAS_GANADORES[0].personajes));
    inicio.current = Date.now();
    setEmpezado(true);
  };

  /* ───────────────────────── portada ───────────────────────── */
  if (!empezado) {
    return (
      <div>
        <style>{CSS}</style>
        <div style={{ borderRadius: "18px", background: "rgba(248,249,250,0.04)", border: "1px solid rgba(248,249,250,0.14)", padding: "clamp(16px, 2.6vw, 24px)" }}>
          <p style={{ fontSize: "15px", lineHeight: 1.65, color: "rgba(248,249,250,0.8)", margin: "0 0 18px" }}>
            {OBJETIVO_GANADORES}
          </p>
          <button
            type="button"
            onClick={() => { inicio.current = Date.now(); setEmpezado(true); }}
            style={{
              display: "inline-flex", alignItems: "center", gap: "8px",
              padding: "13px 22px", borderRadius: "14px", cursor: "pointer",
              background: FAE.teal, border: `1px solid ${FAE.teal}`, color: FAE.bg,
              fontFamily: "Sora, sans-serif", fontSize: "14.5px", fontWeight: 700,
            }}
          >
            Empezar <ChevronRight size={16} />
          </button>
        </div>
      </div>
    );
  }

  /* ───────────────────────── cierre ───────────────────────── */
  if (terminado) {
    return (
      <div className="fae-qg-entrar">
        <style>{CSS}</style>
        <p style={{ fontFamily: "Sora, sans-serif", fontWeight: 700, fontSize: "30px", color: FAE.text, margin: "0 0 6px", fontVariantNumeric: "tabular-nums" }}>
          {pct}%
        </p>
        <p style={{ fontSize: "13.5px", lineHeight: 1.6, color: "rgba(248,249,250,0.62)", margin: "0 0 16px" }}>
          {aciertos} de {TOTAL_CLASIFICACIONES} clasificaciones y {directos} de {RONDAS_GANADORES.length} preguntas
          de impacto directo. Casi ninguna medida deja a todo el mundo igual: siempre hay alguien del otro lado.
        </p>
        <button
          type="button"
          onClick={reiniciar}
          style={{ display: "inline-flex", alignItems: "center", gap: "8px", fontFamily: "Sora, sans-serif", fontSize: "13px", fontWeight: 600, padding: "10px 16px", borderRadius: "999px", cursor: "pointer", background: "transparent", border: "1px solid rgba(248,249,250,0.22)", color: "rgba(248,249,250,0.7)" }}
        >
          <RotateCcw size={14} /> Otra vuelta
        </button>
      </div>
    );
  }

  /* ───────────────────────── la ronda ───────────────────────── */
  return (
    <div>
      <style>{CSS}</style>

      <p style={{ fontFamily: "Sora, sans-serif", fontSize: "11px", fontWeight: 700, letterSpacing: "0.12em", color: FAE.teal, margin: "0 0 8px" }}>
        RONDA {ronda + 1} DE {RONDAS_GANADORES.length}
      </p>

      {/* La medida, fija arriba toda la ronda. */}
      <div style={{ borderRadius: "16px", background: `${FAE.navy}66`, border: "1px solid rgba(248,249,250,0.16)", padding: "clamp(14px, 2.2vw, 18px)", marginBottom: "16px" }}>
        <p style={{ fontSize: "clamp(15px, 2.3vw, 17px)", lineHeight: 1.55, color: FAE.text, margin: 0, fontWeight: 600 }}>
          {r.medida}
        </p>
      </div>

      {/* Las dos zonas. En móvil siguen lado a lado: son solo dos y con el
          nombre escrito caben sin apretarse. */}
      {!rondaCompleta && (
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "10px", marginBottom: "14px" }}>
          {[
            { id: "gana", nombre: "GANA", color: FAE.teal, Icono: TrendingUp },
            { id: "pierde", nombre: "PIERDE", color: FAE.coral, Icono: TrendingDown },
          ].map((z) => (
            <button
              key={z.id}
              type="button"
              onClick={() => colocar(z.id)}
              disabled={!elegido}
              aria-label={`Clasificar en ${z.nombre}`}
              style={{
                display: "flex", alignItems: "center", justifyContent: "center", gap: "8px",
                padding: "16px 12px", borderRadius: "14px",
                cursor: elegido ? "pointer" : "default",
                background: elegido ? `${z.color}1a` : "rgba(248,249,250,0.03)",
                border: `2px ${elegido ? "solid" : "dashed"} ${elegido ? z.color : "rgba(248,249,250,0.18)"}`,
                color: elegido ? z.color : "rgba(248,249,250,0.4)",
                fontFamily: "Sora, sans-serif", fontSize: "14px", fontWeight: 700, letterSpacing: "0.06em",
              }}
            >
              <z.Icono size={17} /> {z.nombre}
            </button>
          ))}
        </div>
      )}

      {/* Los cuatro personajes. */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(230px, 1fr))", gap: "9px", marginBottom: "16px" }}>
        {orden.map((p) => {
          const puesto = puestos[p.id];
          const acerto = puesto && puesto === p.resultado;
          const color = !puesto ? null : p.resultado === "gana" ? FAE.teal : FAE.coral;
          return (
            <div
              key={p.id}
              className={rechazado === p.id ? "fae-qg-rechazo" : puesto ? "fae-qg-encaje" : undefined}
            >
              <button
                type="button"
                onClick={() => !puesto && setElegido(elegido === p.id ? null : p.id)}
                disabled={!!puesto}
                aria-label={
                  puesto
                    ? `${p.nombre}: ${p.resultado === "gana" ? "gana" : "pierde"}. ${acerto ? "Acertaste" : "Fallaste"}.`
                    : `Elegir ${p.nombre}`
                }
                style={{
                  width: "100%", textAlign: "left", padding: "12px 13px", borderRadius: "13px",
                  cursor: puesto ? "default" : "pointer",
                  background: puesto ? `${color}14` : elegido === p.id ? "rgba(42,157,143,0.14)" : "rgba(248,249,250,0.04)",
                  border: `1px solid ${puesto ? color : elegido === p.id ? FAE.teal : "rgba(248,249,250,0.14)"}`,
                  color: FAE.text, fontFamily: "Inter, sans-serif",
                  display: "flex", gap: "10px", alignItems: "flex-start",
                }}
              >
                <Silueta color={puesto ? color : "rgba(203,220,242,0.5)"} />
                <span style={{ flex: 1, minWidth: 0 }}>
                  <span style={{ display: "block", fontSize: "13px", lineHeight: 1.45 }}>{p.nombre}</span>
                  {puesto && (
                    <span style={{ display: "block", marginTop: "6px", fontFamily: "Sora, sans-serif", fontSize: "11.5px", fontWeight: 700, letterSpacing: "0.06em", color }}>
                      {p.resultado === "gana" ? "GANA" : "PIERDE"}
                      {!acerto && " · te equivocaste"}
                    </span>
                  )}
                </span>
              </button>
              {/* La explicación real, se acierte o no. */}
              {puesto && (
                <p className="fae-qg-entrar" style={{ fontSize: "12.5px", lineHeight: 1.5, color: "rgba(248,249,250,0.62)", margin: "7px 0 0", paddingLeft: "11px", borderLeft: `2px solid ${color}` }}>
                  {p.explicacion}
                </p>
              )}
            </div>
          );
        })}
      </div>

      {!rondaCompleta && (
        <p style={{ fontSize: "12.5px", color: "rgba(248,249,250,0.5)", margin: 0 }}>
          {elegido ? "Ahora toca GANA o PIERDE" : `Toca un personaje · ${clasificados} de ${r.personajes.length} clasificados`}
        </p>
      )}

      {/* ─────────────── Etapa 2, en la misma pantalla ─────────────── */}
      {rondaCompleta && (
        <div className="fae-qg-entrar" style={{ borderRadius: "16px", background: "rgba(248,249,250,0.04)", border: "1px solid rgba(248,249,250,0.14)", padding: "clamp(14px, 2.2vw, 18px)" }}>
          <p style={{ fontFamily: "Sora, sans-serif", fontWeight: 700, fontSize: "clamp(14px, 2.2vw, 16px)", lineHeight: 1.45, color: FAE.text, margin: "0 0 12px" }}>
            {PREGUNTA_DIRECTO}
          </p>

          {!directo ? (
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: "8px" }}>
              {orden.map((p) => (
                <button
                  key={p.id}
                  type="button"
                  onClick={() => {
                    setDirecto(p.id);
                    if (p.id === r.masDirecto) setDirectos((n) => n + 1);
                  }}
                  style={{
                    textAlign: "left", padding: "11px 13px", borderRadius: "12px", cursor: "pointer",
                    background: "rgba(248,249,250,0.04)", border: "1px solid rgba(248,249,250,0.14)",
                    color: FAE.text, fontSize: "12.5px", lineHeight: 1.45, fontFamily: "Inter, sans-serif",
                  }}
                >
                  {p.nombre}
                </button>
              ))}
            </div>
          ) : (
            <>
              <p
                aria-label={`Etapa 2: ${directo === r.masDirecto ? "correcto" : "incorrecto"}`}
                style={{
                  fontSize: "13.5px", lineHeight: 1.55, margin: "0 0 10px",
                  padding: "10px 13px", borderRadius: "12px",
                  background: directo === r.masDirecto ? "rgba(42,157,143,0.10)" : "rgba(231,111,81,0.10)",
                  border: `1px solid ${directo === r.masDirecto ? FAE.teal : FAE.coral}55`,
                  color: "rgba(248,249,250,0.88)",
                }}
              >
                {retroDirecto(r, directo)}
              </p>
              <p style={{ fontSize: "12.5px", lineHeight: 1.5, color: "rgba(248,249,250,0.55)", margin: "0 0 14px" }}>
                {r.porqueDirecto}
              </p>
              <button
                type="button"
                onClick={siguiente}
                style={{
                  width: "100%", display: "inline-flex", alignItems: "center", justifyContent: "center", gap: "8px",
                  padding: "13px", borderRadius: "14px", cursor: "pointer",
                  background: FAE.teal, border: `1px solid ${FAE.teal}`, color: FAE.bg,
                  fontFamily: "Sora, sans-serif", fontSize: "14px", fontWeight: 700,
                }}
              >
                {ronda < RONDAS_GANADORES.length - 1 ? "Siguiente ronda" : "Ver resultado"} <ChevronRight size={16} />
              </button>
            </>
          )}
        </div>
      )}
    </div>
  );
}
