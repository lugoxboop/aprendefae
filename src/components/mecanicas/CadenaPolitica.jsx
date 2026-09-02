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

/*
 * TIEMPOS DEL RECORRIDO.
 *
 * Antes el cabezal avanzaba a velocidad constante con un setInterval de 50 ms:
 * 20 fps, movimiento lineal y sin pararse nunca. Eso hacía tres cosas mal a la
 * vez — se veía escalonado, se sentía mecánico, y el nodo activo cambiaba a
 * mitad de tramo, así que ningún icono llegaba a mirarse.
 *
 * Ahora el recorrido va por etapas: VIAJE de un eslabón al siguiente, y luego
 * ESPERA parado en él. La espera es lo que da tiempo a ver el icono y leer el
 * panel; es más larga que el viaje a propósito.
 */
const VIAJE_MS = 1100;
const ESPERA_MS = 2200;
/* El arrastre también se interpola: soltar el cabezal no debe teletransportarlo. */
const ARRASTRE_MS = 260;

/* Aceleración y frenada suaves. Es lo que quita la sensación de mecanismo. */
const easeInOut = (t) => (t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2);
/* Para el arrastre basta con frenar: el movimiento ya viene lanzado por la mano. */
const easeOut = (t) => 1 - Math.pow(1 - t, 3);

export default function CadenaPolitica() {
  const [pos, setPos] = useState(0);
  const [reproduciendo, setReproduciendo] = useState(false);

  /*
   * Un solo bucle de animación gobierna las dos formas de moverse. `tween`
   * describe el tramo en curso —de dónde, a dónde, desde cuándo y con qué
   * curva— y `esperaHasta` marca la pausa en un eslabón durante la
   * reproducción. Todo vive en refs: el bucle no debe reiniciarse en cada
   * fotograma que redibuja.
   */
  const tween = useRef(null);
  const esperaHasta = useRef(0);
  const posRef = useRef(0);
  const reproduciendoRef = useRef(false);
  const raf = useRef(0);

  const irA = (destino, dur, curva) => {
    tween.current = { desde: posRef.current, hasta: destino, t0: performance.now(), dur, curva };
  };

  useEffect(() => {
    const marco = (ahora) => {
      raf.current = requestAnimationFrame(marco);

      const tw = tween.current;
      if (tw) {
        const k = Math.min(1, (ahora - tw.t0) / tw.dur);
        const v = tw.desde + (tw.hasta - tw.desde) * tw.curva(k);
        posRef.current = v;
        setPos(v);
        if (k >= 1) {
          tween.current = null;
          /* Al llegar a un eslabón, la reproducción se queda mirándolo. */
          if (reproduciendoRef.current) esperaHasta.current = ahora + ESPERA_MS;
        }
        return;
      }

      if (!reproduciendoRef.current || ahora < esperaHasta.current) return;

      const siguiente = Math.round(posRef.current) + 1;
      if (siguiente > ULTIMO) {
        reproduciendoRef.current = false;
        setReproduciendo(false);
        return;
      }
      irA(siguiente, VIAJE_MS, easeInOut);
    };

    raf.current = requestAnimationFrame(marco);
    return () => cancelAnimationFrame(raf.current);
  }, []);

  const activo = Math.round(pos);
  const pct = (pos / ULTIMO) * 100;
  const enMeta = activo === ULTIMO;

  const reproducir = () => {
    if (reproduciendoRef.current) {
      reproduciendoRef.current = false;
      tween.current = null;
      setReproduciendo(false);
      return;
    }
    /* Si ya está al final, reproducir vuelve a empezar desde el primero. */
    if (posRef.current >= ULTIMO - 0.01) {
      posRef.current = 0;
      setPos(0);
    }
    reproduciendoRef.current = true;
    esperaHasta.current = 0;
    setReproduciendo(true);
  };

  /* El arrastre fija un destino y el bucle lo alcanza con frenada, sin saltos. */
  const arrastrar = (valor) => {
    reproduciendoRef.current = false;
    setReproduciendo(false);
    irA(valor, ARRASTRE_MS, easeOut);
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
                    /* El eslabón en el que está el cabezal crece un poco: dice dónde mirar. */
                    transform: esActivo ? "scale(1.16)" : "scale(1)",
                    transition:
                      "background 260ms ease, border-color 260ms ease, filter 260ms ease, transform 320ms cubic-bezier(0.2,0.8,0.3,1)",
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

          {/*
            Cabezal. Era una barra plana de 2 px con una sombra; ahora es una
            hoja que se afila hacia arriba con un punto en la base, para que se
            lea como un cursor de recorrido y no como una raya sobre la pista.
          */}
          <div
            aria-hidden="true"
            style={{
              position: "absolute", left: `${pct}%`, top: "4px",
              transform: "translateX(-50%)",
              display: "flex", flexDirection: "column", alignItems: "center",
              pointerEvents: "none",
            }}
          >
            {/*
              El punto va arriba y la cola baja hasta la pista: así el cabezal
              termina donde está la línea y no se cruza con la etiqueta del
              eslabón, que empieza justo debajo del icono.
            */}
            <span
              style={{
                width: "9px", height: "9px", borderRadius: "999px",
                background: FAE.coral,
                boxShadow: `0 0 10px rgba(231,111,81,0.9)`,
              }}
            />
            <span
              style={{
                width: "3px", height: "28px", borderRadius: "3px", marginTop: "-2px",
                background: `linear-gradient(to bottom, ${FAE.coral}, rgba(231,111,81,0.2))`,
                boxShadow: `0 0 12px rgba(231,111,81,0.6)`,
              }}
            />
          </div>

          {/* control real: transparente, encima de toda la pista */}
          <input
            type="range"
            min={0}
            max={ULTIMO}
            step={0.01}
            value={pos}
            onChange={(e) => arrastrar(parseFloat(e.target.value))}
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
        {/* key por eslabón: al cambiar, el bloque entra con el mismo fundido que
            usa el resto del sitio, en vez de sustituirse de golpe. */}
        <div key={NODOS[activo].id} style={{ animation: "fadeUp 320ms ease" }}>
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
        </div>

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
