import { useState, useEffect, useRef } from "react";
import { Play, Pause } from "lucide-react";
import { FAE } from "../../theme.js";

/*
 * "Desempleo: la cadena en vivo".
 *
 * Los seis eslabones no son seis listas sueltas sino un mismo grupo lógico, así
 * que se recorren como un circuito: el estudiante arrastra un cabezal por la
 * pista y la corriente avanza con él.
 *
 * Sin puntaje ni validación: el único estado es la posición del cabezal.
 *
 * El cabezal es un <input type=range> transparente encima de la pista. Así se
 * obtiene gratis el arrastre táctil, el clic para saltar y el manejo por
 * teclado, sin reimplementar eventos de puntero.
 */

const NODOS = [
  { id: "problema", icono: "🔍", nombre: "Problema", texto: "Desempleo" },
  { id: "objetivo", icono: "🎯", nombre: "Objetivo", texto: "Reducir el alto nivel de desempleo" },
  { id: "estrategia", icono: "🧭", nombre: "Estrategia", texto: "Política fiscal" },
  { id: "instrumento", icono: "🔧", nombre: "Instrumento", texto: "Impuesto a la renta (impuesto directo) de las empresas" },
  { id: "medida", icono: "⚙️", nombre: "Medida", texto: "Reducción del impuesto a la renta de las empresas (del 32% al 28%) para facilitar el enganche de nuevo personal" },
  { id: "meta", icono: "🏁", nombre: "Meta", texto: "Reducir el desempleo de la economía del 14% al 12% en los próximos doce meses" },
];

const ULTIMO = NODOS.length - 1;
const CIERRE = "Así se ve un grupo lógico completo: una sola cadena coherente, no seis casillas sueltas.";

/* ~2 segundos por nodo. */
const PASO_MS = 50;
const AVANCE_POR_PASO = PASO_MS / 2000;

export default function CadenaPolitica() {
  const [pos, setPos] = useState(0);
  const [reproduciendo, setReproduciendo] = useState(false);
  const timer = useRef(null);

  useEffect(() => {
    if (!reproduciendo) return;
    timer.current = setInterval(() => {
      setPos((p) => {
        const siguiente = p + AVANCE_POR_PASO;
        if (siguiente >= ULTIMO) {
          setReproduciendo(false);
          return ULTIMO;
        }
        return siguiente;
      });
    }, PASO_MS);
    return () => clearInterval(timer.current);
  }, [reproduciendo]);

  const activo = Math.round(pos);
  const pct = (pos / ULTIMO) * 100;
  const enMeta = activo === ULTIMO;

  const reproducir = () => {
    if (reproduciendo) { setReproduciendo(false); return; }
    /* Si ya está al final, reproducir vuelve a empezar. */
    if (pos >= ULTIMO - 0.01) setPos(0);
    setReproduciendo(true);
  };

  return (
    <div>
      {/* ---------------- pista ---------------- */}
      <div
        style={{
          borderRadius: "18px",
          background: "rgba(248,249,250,0.03)",
          border: "1px solid rgba(248,249,250,0.1)",
          padding: "clamp(20px, 3vw, 28px) clamp(24px, 4vw, 40px)",
          marginBottom: "16px",
        }}
      >
        <div style={{ position: "relative", height: "88px" }}>
          {/* línea base + corriente animada */}
          <svg
            width="100%"
            height="6"
            aria-hidden="true"
            style={{ position: "absolute", top: "27px", left: 0, overflow: "visible" }}
          >
            <line x1="0%" y1="3" x2="100%" y2="3" stroke="rgba(248,249,250,0.16)" strokeWidth="3" strokeLinecap="round" />
            {pct > 0 && (
              <line
                className="cadena-corriente"
                x1="0%" y1="3" x2={`${pct}%`} y2="3"
                stroke={FAE.teal} strokeWidth="3" strokeLinecap="round"
                strokeDasharray="7 9"
              />
            )}
          </svg>

          {NODOS.map((n, i) => {
            const alcanzado = i <= activo;
            const esActivo = i === activo;
            return (
              <div
                key={n.id}
                style={{
                  position: "absolute",
                  left: `${(i / ULTIMO) * 100}%`,
                  top: 0,
                  transform: "translateX(-50%)",
                  display: "flex",
                  flexDirection: "column",
                  alignItems: "center",
                  gap: "7px",
                  pointerEvents: "none",
                }}
              >
                <span
                  className={esActivo ? "cadena-nodo-activo" : undefined}
                  style={{
                    display: "flex", alignItems: "center", justifyContent: "center",
                    width: "34px", height: "34px", borderRadius: "999px", fontSize: "16px",
                    background: alcanzado ? "rgba(42,157,143,0.20)" : "rgba(248,249,250,0.05)",
                    border: `2px solid ${alcanzado ? FAE.teal : "rgba(248,249,250,0.18)"}`,
                    filter: alcanzado ? "none" : "grayscale(1) opacity(0.55)",
                    transition: "background 220ms ease, border-color 220ms ease, filter 220ms ease",
                  }}
                >
                  {n.icono}
                </span>
                <span
                  className="cadena-etiqueta"
                  style={{
                    fontFamily: "Sora, sans-serif", fontSize: "10.5px", fontWeight: 600,
                    letterSpacing: "0.02em", whiteSpace: "nowrap",
                    color: alcanzado ? FAE.text : "rgba(248,249,250,0.42)",
                    transition: "color 220ms ease",
                  }}
                >
                  {n.nombre}
                </span>
              </div>
            );
          })}

          {/* cabezal visible */}
          <div
            aria-hidden="true"
            style={{
              position: "absolute", left: `${pct}%`, top: "10px",
              transform: "translateX(-50%)", width: "2px", height: "44px",
              background: FAE.coral, borderRadius: "2px",
              boxShadow: `0 0 10px ${FAE.coral}`,
              pointerEvents: "none",
            }}
          />

          {/* control real: transparente, encima de toda la pista */}
          <input
            type="range"
            min={0}
            max={ULTIMO}
            step={0.01}
            value={pos}
            onChange={(e) => { setReproduciendo(false); setPos(parseFloat(e.target.value)); }}
            aria-label="Recorrer la cadena: problema, objetivo, estrategia, instrumento, medida, meta"
            style={{
              position: "absolute", left: 0, top: "10px", width: "100%", height: "44px",
              margin: 0, opacity: 0, cursor: "grab", WebkitAppearance: "none", appearance: "none",
            }}
          />
        </div>
      </div>

      <div style={{ display: "flex", alignItems: "center", gap: "12px", flexWrap: "wrap", marginBottom: "16px" }}>
        <button
          type="button"
          onClick={reproducir}
          style={{
            display: "inline-flex", alignItems: "center", gap: "8px",
            fontFamily: "Sora, sans-serif", fontSize: "13.5px", fontWeight: 600,
            padding: "10px 18px", borderRadius: "999px", border: "none", cursor: "pointer",
            backgroundColor: reproduciendo ? "rgba(248,249,250,0.10)" : FAE.teal,
            color: reproduciendo ? FAE.text : FAE.bg,
          }}
        >
          {reproduciendo ? <Pause size={15} /> : <Play size={15} />}
          {reproduciendo ? "Pausar" : "Reproducir automáticamente"}
        </button>
        <span style={{ fontSize: "13px", color: "rgba(248,249,250,0.5)" }}>
          O arrastra el cabezal por la pista.
        </span>
      </div>

      {/* ---------------- panel lateral ---------------- */}
      <div
        style={{
          borderRadius: "16px",
          background: "rgba(42,157,143,0.07)",
          border: `1px solid rgba(42,157,143,0.28)`,
          padding: "18px 20px",
          minHeight: "128px",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: "10px", marginBottom: "8px" }}>
          <span style={{ fontSize: "18px" }} aria-hidden="true">{NODOS[activo].icono}</span>
          <span
            style={{
              fontFamily: "Sora, sans-serif", fontSize: "12px", fontWeight: 700,
              letterSpacing: "0.12em", color: FAE.teal,
            }}
          >
            {NODOS[activo].nombre.toUpperCase()}
          </span>
        </div>
        <p style={{ fontSize: "16px", lineHeight: 1.55, margin: 0, color: FAE.text }}>
          {NODOS[activo].texto}
        </p>

        {enMeta && (
          <p
            style={{
              fontSize: "14.5px", lineHeight: 1.6, margin: "16px 0 0",
              paddingTop: "14px", borderTop: "1px solid rgba(42,157,143,0.28)",
              color: "rgba(248,249,250,0.85)",
            }}
          >
            {CIERRE}
          </p>
        )}
      </div>
    </div>
  );
}
