import { useEffect, useRef, useState } from "react";
import { RotateCcw } from "lucide-react";
import { FAE } from "../../theme.js";
import { CASO_TIENDA, CASO_CANAL, PREGUNTA_INMERSION, SINTESIS_INMERSION } from "../../data/iceberg.js";

/*
 * "Inmersión doble" — la mitad Aprender del Modelo del Iceberg.
 *
 * DOS icebergs sobre el mismo mar desde el primer segundo, no uno detrás de
 * otro. La comparación no se explica al final: se vive todo el rato, porque
 * cada gesto baja en los dos a la vez.
 *
 * EL GESTO ES UN SONAR, no un cabezal que se arrastra. El estudiante toca el
 * agua, el pulso se expande desde donde tocó, y cuando alcanza a los dos
 * icebergs destapa el siguiente nivel EN AMBOS. Un solo evento de entrada
 * mueve las dos historias: eso es lo que hace que el paralelo se sienta en la
 * mano en vez de leerse en un párrafo.
 *
 * CUATRO PULSOS, CUATRO NIVELES. En superficie solo se ven las dos puntas,
 * sin texto. El pulso 1 destapa el evento; el 2, el patrón; el 3, la
 * estructura. Antes del 4º —el modelo mental— la interfaz SE DETIENE a
 * propósito: es el hueco para que el profesor pregunte en voz alta antes de
 * que la pantalla conteste.
 *
 * EL HILO DE LUZ del final no es adorno: es el argumento. Las dos masas
 * sumergidas están separadas hasta que aparece la creencia, y ahí se conectan.
 * Lo que une a una tienda de ropa con un canal de YouTube no se ve por fuera.
 *
 * BURBUJAS EN CSS, NO EN CANVAS. La dirección técnica sugería canvas, pero
 * dieciocho círculos animados por CSS se componen en GPU, no necesitan bucle
 * de rAF y no hay nada que se pueda quedar corriendo de fondo. Menos piezas
 * móviles para el mismo efecto.
 */

/* ------------------------------ geometría ------------------------------ */

const VB = { w: 1000, h: 700 };
const AGUA = 180;              // línea de flotación
const CX = { tienda: 275, canal: 725 };

/*
 * Cada nivel es una franja del iceberg. La punta va sobre el agua; las otras
 * tres se ensanchan y luego se afinan, que es la silueta que tiene un iceberg
 * de verdad y la que ya usa el diagrama del tema.
 */
const FRANJAS = [
  { key: "evento", y0: 70, y1: AGUA, w0: 0, w1: 60, sobreAgua: true },
  { key: "patron", y0: AGUA, y1: 320, w0: 60, w1: 115 },
  { key: "estructura", y0: 320, y1: 460, w0: 115, w1: 150 },
  { key: "modelo", y0: 460, y1: 620, w0: 150, w1: 105 },
];

const poligono = (cx, f) =>
  `${cx - f.w0},${f.y0} ${cx + f.w0},${f.y0} ${cx + f.w1},${f.y1} ${cx - f.w1},${f.y1}`;

/* El agua se oscurece un grado por nivel. Navy de marca, hundiéndose. */
const AGUAS = [
  { arriba: "#2E5385", abajo: "#1D3557" },
  { arriba: "#27476F", abajo: "#182C48" },
  { arriba: "#1F3A5C", abajo: "#132339" },
  { arriba: "#182C46", abajo: "#0E1B2E" },
  { arriba: "#122238", abajo: "#0A1422" },
];

/* Burbujas: posición, tamaño y ritmo fijos, para que no salten entre renders. */
const BURBUJAS = Array.from({ length: 18 }, (_, i) => ({
  x: 60 + ((i * 137) % 880),
  r: 2 + ((i * 7) % 5),
  duracion: 7 + ((i * 3) % 6),
  retraso: -((i * 1.7) % 9),
  deriva: ((i % 3) - 1) * 18,
}));

const CSS = `
@keyframes fae-burbuja {
  0%   { transform: translate3d(0, 0, 0); opacity: 0; }
  12%  { opacity: 0.5; }
  88%  { opacity: 0.35; }
  100% { transform: translate3d(var(--deriva), -520px, 0); opacity: 0; }
}
.fae-burbuja {
  animation-name: fae-burbuja;
  animation-timing-function: linear;
  animation-iteration-count: infinite;
  will-change: transform, opacity;
}
@keyframes fae-pulso {
  from { r: 0; opacity: 0.85; stroke-width: 3; }
  to   { r: 620; opacity: 0; stroke-width: 0.6; }
}
.fae-pulso { animation: fae-pulso 1150ms cubic-bezier(.22,.8,.3,1) forwards; }

@keyframes fae-hilo { to { stroke-dashoffset: 0; } }
.fae-hilo { stroke-dasharray: 460; stroke-dashoffset: 460; animation: fae-hilo 1400ms ease-out 200ms forwards; }

@keyframes fae-brote { from { opacity: 0; transform: translateY(10px); } to { opacity: 1; transform: translateY(0); } }
.fae-brote { animation: fae-brote 520ms ease-out both; }

/* Quien pide menos movimiento ve la escena quieta, no una escena distinta. */
@media (prefers-reduced-motion: reduce) {
  .fae-burbuja, .fae-pulso, .fae-hilo, .fae-brote { animation: none !important; }
  .fae-hilo { stroke-dashoffset: 0; }
  .fae-brote { opacity: 1; transform: none; }
}
`;

/* --------------------------- tiempos del gesto --------------------------- */

/* Lo que tarda el pulso en alcanzar a los icebergs y destapar el nivel. */
const VIAJE_MS = 520;
/* Lo que dura la animación entera antes de admitir otro toque. */
const PULSO_MS = 1150;

export default function InmersionDoble() {
  /* Cuántos niveles se han destapado: 0 = solo las dos puntas, sin texto. */
  const [nivel, setNivel] = useState(0);
  const [pulso, setPulso] = useState(null);   // {x, y, id} del toque en curso
  const [enPausa, setEnPausa] = useState(false);
  const escena = useRef(null);
  const temporizadores = useRef([]);

  useEffect(() => () => temporizadores.current.forEach(clearTimeout), []);

  const ocupado = pulso !== null;
  const completo = nivel >= FRANJAS.length;
  /* La pausa se planta antes del cuarto, que es el modelo mental. */
  const toca_pausar = nivel === FRANJAS.length - 1 && !enPausa;

  const lanzarPulso = (e) => {
    if (ocupado || completo || toca_pausar) return;

    /* Coordenadas del toque dentro del viewBox, no de la pantalla. */
    const caja = escena.current.getBoundingClientRect();
    const punto = e.touches?.[0] ?? e;
    const x = ((punto.clientX - caja.left) / caja.width) * VB.w;
    const y = ((punto.clientY - caja.top) / caja.height) * VB.h;

    setPulso({ x, y, id: Date.now() });
    /* Un solo gesto destapa el nivel en los DOS icebergs a la vez. */
    temporizadores.current.push(setTimeout(() => setNivel((n) => n + 1), VIAJE_MS));
    temporizadores.current.push(setTimeout(() => setPulso(null), PULSO_MS));
  };

  const reiniciar = () => {
    temporizadores.current.forEach(clearTimeout);
    temporizadores.current = [];
    setNivel(0);
    setPulso(null);
    setEnPausa(false);
  };

  const agua = AGUAS[Math.min(nivel, AGUAS.length - 1)];
  const presion = Math.min(1, nivel / FRANJAS.length);

  return (
    <div>
      <style>{CSS}</style>

      {/* ============================ la escena ============================ */}
      <div
        ref={escena}
        onClick={lanzarPulso}
        role="button"
        tabIndex={0}
        aria-label={
          completo ? "Inmersión completa" : "Toca el agua para lanzar un pulso de sonar y bajar un nivel en los dos icebergs"
        }
        onKeyDown={(e) => {
          if (e.key !== "Enter" && e.key !== " ") return;
          e.preventDefault();
          /* Con teclado no hay punto de contacto: el pulso sale del centro del agua. */
          const c = escena.current.getBoundingClientRect();
          lanzarPulso({ clientX: c.left + c.width / 2, clientY: c.top + c.height * 0.35 });
        }}
        style={{
          position: "relative",
          borderRadius: "18px",
          overflow: "hidden",
          border: "1px solid rgba(248,249,250,0.14)",
          cursor: completo || toca_pausar ? "default" : "pointer",
          marginBottom: "16px",
          userSelect: "none",
          WebkitTapHighlightColor: "transparent",
        }}
      >
        <svg viewBox={`0 0 ${VB.w} ${VB.h}`} width="100%" style={{ display: "block" }} aria-hidden="true">
          <defs>
            <linearGradient id="ind-agua" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor={agua.arriba} />
              <stop offset="100%" stopColor={agua.abajo} />
            </linearGradient>
            <linearGradient id="ind-cielo" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#16294a" />
              <stop offset="100%" stopColor="#22406a" />
            </linearGradient>
            {/* Viñeta de presión: se cierra a medida que se baja. */}
            <radialGradient id="ind-presion" cx="50%" cy="46%" r="78%">
              <stop offset="45%" stopColor="#000" stopOpacity="0" />
              <stop offset="100%" stopColor="#000" stopOpacity="0.85" />
            </radialGradient>
            <linearGradient id="ind-hielo" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#EAF2FB" />
              <stop offset="100%" stopColor="#A9C6E4" />
            </linearGradient>
            <clipPath id="ind-bajoAgua">
              <rect x="0" y={AGUA} width={VB.w} height={VB.h - AGUA} />
            </clipPath>
          </defs>

          <rect x="0" y="0" width={VB.w} height={AGUA} fill="url(#ind-cielo)" />
          <rect x="0" y={AGUA} width={VB.w} height={VB.h - AGUA} fill="url(#ind-agua)" />

          {/* Luz de superficie: se apaga con la profundidad. */}
          <rect
            x="0" y={AGUA} width={VB.w} height="120" fill="#CBDCF2"
            opacity={0.16 * (1 - presion * 0.85)}
          />

          {/* Burbujas, dentro del agua. */}
          <g clipPath="url(#ind-bajoAgua)">
            {BURBUJAS.map((b, i) => (
              <circle
                key={i}
                className="fae-burbuja"
                cx={b.x}
                cy={VB.h - 10}
                r={b.r}
                fill="#CBDCF2"
                style={{
                  animationDuration: `${b.duracion}s`,
                  animationDelay: `${b.retraso}s`,
                  "--deriva": `${b.deriva}px`,
                }}
              />
            ))}
          </g>

          {/* La línea de flotación. */}
          <line x1="0" y1={AGUA} x2={VB.w} y2={AGUA} stroke="#CBDCF2" strokeOpacity="0.5" strokeWidth="2" />

          {/* ---------------- los dos icebergs ---------------- */}
          {[["tienda", CASO_TIENDA], ["canal", CASO_CANAL]].map(([lado, caso]) => (
            <g key={lado}>
              {FRANJAS.map((f, i) => {
                const visible = i < nivel || f.sobreAgua;
                const destapado = i < nivel;
                return (
                  <polygon
                    key={f.key}
                    points={poligono(CX[lado], f)}
                    fill="url(#ind-hielo)"
                    opacity={visible ? (destapado ? 0.95 : 0.9) : 0}
                    style={{ transition: "opacity 620ms ease-out" }}
                  />
                );
              })}

              {/* Rótulo del caso, siempre visible: se sabe qué es cada uno. */}
              <text
                x={CX[lado]} y={52} textAnchor="middle"
                fontFamily="Sora, sans-serif" fontSize="19" fontWeight="700" fill="#F8F9FA"
              >
                {caso.rotulo}
              </text>
            </g>
          ))}

          {/*
            El hilo de luz. Sale al destapar el modelo mental y une las dos
            masas sumergidas, que hasta entonces no se tocaban.
          */}
          {completo && (
            <>
              <path
                className="fae-hilo"
                d={`M ${CX.tienda} 590 Q 500 660 ${CX.canal} 590`}
                fill="none" stroke={FAE.teal} strokeWidth="3" strokeLinecap="round" opacity="0.95"
              />
              <path
                className="fae-hilo"
                d={`M ${CX.tienda} 590 Q 500 660 ${CX.canal} 590`}
                fill="none" stroke={FAE.teal} strokeWidth="12" strokeLinecap="round" opacity="0.18"
              />
            </>
          )}

          {/* El pulso de sonar, desde donde se tocó. */}
          {pulso && (
            <circle
              key={pulso.id}
              className="fae-pulso"
              cx={pulso.x} cy={pulso.y}
              fill="none" stroke="#CBDCF2"
            />
          )}

          <rect x="0" y="0" width={VB.w} height={VB.h} fill="url(#ind-presion)" opacity={0.25 + presion * 0.5} pointerEvents="none" />

          {/* Profundidad alcanzada. Dentro del SVG para que escale con la escena. */}
          <text
            x="28" y={VB.h - 26}
            fontFamily="Sora, sans-serif" fontSize="22" fontWeight="700" letterSpacing="2"
            fill="#F8F9FA" opacity="0.7"
          >
            {`NIVEL ${Math.min(nivel, FRANJAS.length)} DE ${FRANJAS.length}`}
          </text>

          {/* Instrucción sobre el agua, mientras quede algo por destapar. */}
          {!completo && !toca_pausar && (
            <text
              x={VB.w / 2} y={AGUA + 62} textAnchor="middle"
              fontFamily="Inter, sans-serif" fontSize="17" fill="#CBDCF2" opacity={ocupado ? 0.25 : 0.75}
              style={{ transition: "opacity 300ms ease" }}
            >
              {nivel === 0 ? "Toca el agua para lanzar el sonar" : "Toca otra vez para bajar en los dos"}
            </text>
          )}
        </svg>

      </div>

      {/* ======================= la pausa antes del fondo ======================= */}
      {toca_pausar && (
        <div
          className="fae-brote"
          style={{
            borderRadius: "18px",
            background: "rgba(233,196,106,0.08)",
            border: `1px solid ${FAE.ambar}`,
            padding: "clamp(18px, 2.6vw, 26px)",
            marginBottom: "16px",
          }}
        >
          <p style={{ fontFamily: "Sora, sans-serif", fontSize: "12px", fontWeight: 700, letterSpacing: "0.12em", color: FAE.ambar, margin: "0 0 8px" }}>
            EL SONAR SE DETIENE
          </p>
          <p style={{ fontFamily: "Sora, sans-serif", fontWeight: 700, fontSize: "clamp(17px, 2.4vw, 21px)", lineHeight: 1.4, letterSpacing: "-0.02em", color: FAE.text, margin: "0 0 6px" }}>
            Antes de tocar: ¿qué crees que hay aquí abajo?
          </p>
          <p style={{ fontSize: "13.5px", lineHeight: 1.6, color: "rgba(248,249,250,0.55)", margin: "0 0 16px" }}>
            Piénsalo para los dos casos antes de seguir. Lo que viene es el nivel más profundo.
          </p>
          <button
            type="button"
            onClick={() => setEnPausa(true)}
            style={{
              display: "inline-flex", alignItems: "center", gap: "8px",
              fontFamily: "Sora, sans-serif", fontSize: "14px", fontWeight: 600,
              padding: "11px 20px", borderRadius: "999px", border: "none",
              cursor: "pointer", backgroundColor: FAE.ambar, color: FAE.bg,
            }}
          >
            Ya lo pensé, tocar el fondo
          </button>
        </div>
      )}

      {/* ===================== lo que se va destapando ===================== */}
      {nivel > 0 && (
        <div style={{ display: "flex", flexDirection: "column", gap: "10px", marginBottom: "16px" }}>
          {FRANJAS.slice(0, nivel).map((f, i) => (
            <div
              key={f.key}
              className="fae-brote"
              style={{
                borderRadius: "16px",
                background: "rgba(248,249,250,0.04)",
                border: "1px solid rgba(248,249,250,0.12)",
                padding: "14px 16px",
              }}
            >
              <p style={{ fontFamily: "Sora, sans-serif", fontSize: "12.5px", fontWeight: 700, letterSpacing: "0.06em", color: FAE.teal, margin: "0 0 10px" }}>
                {CASO_TIENDA.niveles[i].nombre.toUpperCase()}
              </p>
              {/* Los dos casos en paralelo: la comparación se vive, no se cuenta al final. */}
              <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))", gap: "12px" }}>
                {[CASO_TIENDA, CASO_CANAL].map((caso) => (
                  <div key={caso.id}>
                    <p style={{ fontSize: "11.5px", color: "rgba(248,249,250,0.45)", margin: "0 0 4px" }}>{caso.rotulo}</p>
                    <p style={{ fontSize: "14px", lineHeight: 1.55, color: "rgba(248,249,250,0.85)", margin: 0 }}>
                      {caso.niveles[i].texto}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* ============================== el cierre ============================== */}
      {completo && (
        <div className="fae-brote">
          <div
            style={{
              borderRadius: "18px",
              background: "rgba(42,157,143,0.07)",
              border: `1px solid ${FAE.teal}`,
              padding: "clamp(18px, 2.6vw, 26px)",
              marginBottom: "16px",
            }}
          >
            <p style={{ fontFamily: "Sora, sans-serif", fontSize: "12px", fontWeight: 700, letterSpacing: "0.12em", color: FAE.teal, margin: "0 0 10px" }}>
              EL HILO QUE LOS UNE
            </p>
            <p style={{ fontFamily: "Sora, sans-serif", fontWeight: 700, fontSize: "clamp(17px, 2.4vw, 21px)", lineHeight: 1.4, letterSpacing: "-0.02em", color: FAE.text, margin: "0 0 8px" }}>
              {PREGUNTA_INMERSION}
            </p>
            <p style={{ fontSize: "13px", color: "rgba(248,249,250,0.45)", margin: "0 0 18px" }}>
              No hay respuesta que marcar: piénsalo un momento antes de seguir leyendo.
            </p>
            <p style={{ fontSize: "15.5px", lineHeight: 1.65, color: "rgba(248,249,250,0.9)", margin: 0 }}>
              {SINTESIS_INMERSION}
            </p>
          </div>

          <button
            type="button"
            onClick={reiniciar}
            style={{
              display: "inline-flex", alignItems: "center", gap: "8px",
              fontFamily: "Sora, sans-serif", fontSize: "13.5px", fontWeight: 600,
              padding: "10px 16px", borderRadius: "999px", cursor: "pointer",
              background: "transparent", border: "1px solid rgba(248,249,250,0.22)",
              color: "rgba(248,249,250,0.7)",
            }}
          >
            <RotateCcw size={14} />
            Volver a la superficie
          </button>
        </div>
      )}
    </div>
  );
}
