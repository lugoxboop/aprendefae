import { useEffect, useRef, useState } from "react";
import { RotateCcw } from "lucide-react";
import { FAE } from "../../theme.js";
import { CASO_TIENDA, SINTESIS_INMERSION } from "../../data/iceberg.js";

/*
 * Inmersión — la mitad Aprender del Modelo del Iceberg.
 *
 * UN ICEBERG Y UNA BITÁCORA, lado a lado. Antes eran dos icebergs sobre el
 * mismo mar; el segundo caso —el canal de YouTube— quedó en pausa, y su
 * contenido sigue en data/iceberg.js, escrito y marcado, para cuando vuelva
 * como pieza aparte. Con él se fue el hilo de luz del cierre: unía dos masas
 * sumergidas y ya no hay dos.
 *
 * POR QUÉ DOS PANELES Y NO UNO. Con el texto debajo del dibujo, la animación y
 * la lectura se peleaban por la misma atención en el mismo momento: mientras
 * bajaba el sonar había que mirar arriba, y para leer había que dejar de mirar.
 * Separados, cada uno hace lo suyo.
 *
 * LA BITÁCORA SE ACUMULA, no se reemplaza. Cada pulso añade una entrada debajo
 * de la anterior, así que a mitad de la inmersión se puede releer lo ya
 * encontrado sin volver a tocar el iceberg. Es un registro de buceo, no un
 * cartel que cambia.
 *
 * EL GESTO ES UN SONAR. Se toca el agua, el pulso se expande desde el punto de
 * contacto y al alcanzar el iceberg destapa el siguiente nivel. Cuatro pulsos,
 * cuatro niveles, con una parada deliberada antes del cuarto: el hueco para que
 * el profesor pregunte en voz alta antes de que la pantalla conteste.
 *
 * BURBUJAS EN CSS, NO EN CANVAS: se componen en GPU, sin bucle de rAF que pueda
 * quedarse corriendo. Menos piezas móviles para el mismo efecto.
 */

/* ------------------------------ geometría ------------------------------ */

const VB = { w: 520, h: 700 };
const AGUA = 180;              // línea de flotación
const CX = VB.w / 2;

/*
 * Cada nivel es una franja del iceberg. La punta va sobre el agua; las otras
 * tres se ensanchan y luego se afinan, que es la silueta de un iceberg de
 * verdad y la que ya usa el diagrama del tema.
 */
const FRANJAS = [
  { key: "evento", y0: 70, y1: AGUA, w0: 0, w1: 78, sobreAgua: true },
  { key: "patron", y0: AGUA, y1: 320, w0: 78, w1: 140 },
  { key: "estructura", y0: 320, y1: 460, w0: 140, w1: 180 },
  { key: "modelo", y0: 460, y1: 620, w0: 180, w1: 130 },
];

const poligono = (f) =>
  `${CX - f.w0},${f.y0} ${CX + f.w0},${f.y0} ${CX + f.w1},${f.y1} ${CX - f.w1},${f.y1}`;

/* El agua se oscurece un grado por nivel. Navy de marca, hundiéndose. */
const AGUAS = [
  { arriba: "#2E5385", abajo: "#1D3557" },
  { arriba: "#27476F", abajo: "#182C48" },
  { arriba: "#1F3A5C", abajo: "#132339" },
  { arriba: "#182C46", abajo: "#0E1B2E" },
  { arriba: "#122238", abajo: "#0A1422" },
];

/* Burbujas: posición, tamaño y ritmo fijos, para que no salten entre renders. */
const BURBUJAS = Array.from({ length: 16 }, (_, i) => ({
  x: 34 + ((i * 97) % 452),
  r: 2 + ((i * 7) % 5),
  duracion: 7 + ((i * 3) % 6),
  retraso: -((i * 1.7) % 9),
  deriva: ((i % 3) - 1) * 16,
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
  to   { r: 560; opacity: 0; stroke-width: 0.6; }
}
.fae-pulso { animation: fae-pulso 1150ms cubic-bezier(.22,.8,.3,1) forwards; }

@keyframes fae-brote { from { opacity: 0; transform: translateY(10px); } to { opacity: 1; transform: translateY(0); } }
.fae-brote { animation: fae-brote 520ms ease-out both; }

/* Quien pide menos movimiento ve la escena quieta, no una escena distinta. */
@media (prefers-reduced-motion: reduce) {
  .fae-burbuja, .fae-pulso, .fae-brote { animation: none !important; }
  .fae-brote { opacity: 1; transform: none; }
}
`;

/* --------------------------- tiempos del gesto --------------------------- */

/* Lo que tarda el pulso en alcanzar al iceberg y destapar el nivel. */
const VIAJE_MS = 520;
/* Lo que dura la animación entera antes de admitir otro toque. */
const PULSO_MS = 1150;

export default function InmersionDoble() {
  /* Cuántos niveles se han destapado: 0 = solo la punta, sin texto. */
  const [nivel, setNivel] = useState(0);
  const [pulso, setPulso] = useState(null);   // {x, y, id} del toque en curso
  const [enPausa, setEnPausa] = useState(false);
  const escena = useRef(null);
  const temporizadores = useRef([]);

  useEffect(() => () => temporizadores.current.forEach(clearTimeout), []);

  const ocupado = pulso !== null;
  const completo = nivel >= FRANJAS.length;
  /* La pausa se planta antes del cuarto, que es el modelo mental. */
  const tocaPausar = nivel === FRANJAS.length - 1 && !enPausa;

  const lanzarPulso = (e) => {
    if (ocupado || completo || tocaPausar) return;

    /* Coordenadas del toque dentro del viewBox, no de la pantalla. */
    const caja = escena.current.getBoundingClientRect();
    const punto = e.touches?.[0] ?? e;
    const x = ((punto.clientX - caja.left) / caja.width) * VB.w;
    const y = ((punto.clientY - caja.top) / caja.height) * VB.h;

    setPulso({ x, y, id: Date.now() });
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

      {/*
        Los dos paneles. En pantalla ancha van lado a lado; en teléfono el
        iceberg queda arriba y la bitácora debajo, que es el orden en que se
        usan: primero se toca, después se lee.
      */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(300px, 1fr))", gap: "16px", alignItems: "start" }}>

        {/* ========================= panel del iceberg ========================= */}
        <div
          ref={escena}
          onClick={lanzarPulso}
          role="button"
          tabIndex={0}
          aria-label={completo ? "Inmersión completa" : "Toca el agua para lanzar un pulso de sonar y bajar un nivel"}
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
            cursor: completo || tocaPausar ? "default" : "pointer",
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
            <rect x="0" y={AGUA} width={VB.w} height="120" fill="#CBDCF2" opacity={0.16 * (1 - presion * 0.85)} />

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

            <line x1="0" y1={AGUA} x2={VB.w} y2={AGUA} stroke="#CBDCF2" strokeOpacity="0.5" strokeWidth="2" />

            {/* ---------------- el iceberg ---------------- */}
            {FRANJAS.map((f, i) => {
              const visible = i < nivel || f.sobreAgua;
              return (
                <polygon
                  key={f.key}
                  points={poligono(f)}
                  fill="url(#ind-hielo)"
                  opacity={visible ? (i < nivel ? 0.95 : 0.9) : 0}
                  style={{ transition: "opacity 620ms ease-out" }}
                />
              );
            })}

            <text
              x={CX} y={52} textAnchor="middle"
              fontFamily="Sora, sans-serif" fontSize="22" fontWeight="700" fill="#F8F9FA"
            >
              {CASO_TIENDA.rotulo}
            </text>

            {/* El pulso de sonar, desde donde se tocó. */}
            {pulso && (
              <circle key={pulso.id} className="fae-pulso" cx={pulso.x} cy={pulso.y} fill="none" stroke="#CBDCF2" />
            )}

            <rect x="0" y="0" width={VB.w} height={VB.h} fill="url(#ind-presion)" opacity={0.25 + presion * 0.5} pointerEvents="none" />

            {/* Profundidad alcanzada. Dentro del SVG para que escale con la escena. */}
            <text
              x="24" y={VB.h - 24}
              fontFamily="Sora, sans-serif" fontSize="22" fontWeight="700" letterSpacing="2"
              fill="#F8F9FA" opacity="0.7"
            >
              {`NIVEL ${Math.min(nivel, FRANJAS.length)} DE ${FRANJAS.length}`}
            </text>

            {/* Instrucción sobre el agua, mientras quede algo por destapar. */}
            {!completo && !tocaPausar && (
              <text
                x={CX} y={AGUA + 58} textAnchor="middle"
                fontFamily="Inter, sans-serif" fontSize="18" fill="#CBDCF2" opacity={ocupado ? 0.25 : 0.75}
                style={{ transition: "opacity 300ms ease" }}
              >
                {nivel === 0 ? "Toca el agua para lanzar el sonar" : "Toca otra vez para seguir bajando"}
              </text>
            )}
          </svg>
        </div>

        {/* ========================= panel de bitácora ========================= */}
        <div
          style={{
            borderRadius: "18px",
            background: "rgba(248,249,250,0.04)",
            border: "1px solid rgba(248,249,250,0.12)",
            padding: "clamp(16px, 2.4vw, 22px)",
          }}
        >
          <p style={{ fontFamily: "Sora, sans-serif", fontSize: "12px", fontWeight: 700, letterSpacing: "0.12em", color: FAE.teal, margin: "0 0 4px" }}>
            BITÁCORA DE INMERSIÓN
          </p>
          <p style={{ fontSize: "12.5px", color: "rgba(248,249,250,0.45)", margin: "0 0 16px" }}>
            Lo que vas encontrando se queda anotado aquí.
          </p>

          {nivel === 0 && (
            <p style={{ fontSize: "14px", lineHeight: 1.6, color: "rgba(248,249,250,0.42)", margin: 0 }}>
              Todavía no hay nada anotado. Toca el agua y el primer hallazgo aparece aquí.
            </p>
          )}

          {/*
            Las entradas se apilan: cada pulso añade una debajo, ninguna se
            reemplaza. Así se puede releer lo ya encontrado sin volver a tocar.
          */}
          <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
            {CASO_TIENDA.niveles.slice(0, nivel).map((n, i) => (
              <div
                key={n.clave}
                className="fae-brote"
                style={{
                  paddingLeft: "14px",
                  borderLeft: `2px solid ${i === nivel - 1 ? FAE.teal : "rgba(42,157,143,0.35)"}`,
                }}
              >
                <p style={{ fontFamily: "Sora, sans-serif", fontSize: "11.5px", fontWeight: 700, letterSpacing: "0.08em", color: FAE.teal, margin: "0 0 4px" }}>
                  {`${i + 1}. ${n.nombre.toUpperCase()}`}
                </p>
                <p style={{ fontSize: "14.5px", lineHeight: 1.55, color: "rgba(248,249,250,0.88)", margin: 0 }}>
                  {n.texto}
                </p>
              </div>
            ))}
          </div>

          {/* La pausa vive en la bitácora: es donde el estudiante está leyendo. */}
          {tocaPausar && (
            <div
              className="fae-brote"
              style={{
                marginTop: "16px",
                borderRadius: "14px",
                background: "rgba(233,196,106,0.08)",
                border: `1px solid ${FAE.ambar}`,
                padding: "16px",
              }}
            >
              <p style={{ fontFamily: "Sora, sans-serif", fontSize: "11.5px", fontWeight: 700, letterSpacing: "0.1em", color: FAE.ambar, margin: "0 0 8px" }}>
                EL SONAR SE DETIENE
              </p>
              <p style={{ fontFamily: "Sora, sans-serif", fontWeight: 700, fontSize: "16.5px", lineHeight: 1.4, letterSpacing: "-0.01em", color: FAE.text, margin: "0 0 6px" }}>
                Antes de tocar: ¿qué crees que hay aquí abajo?
              </p>
              <p style={{ fontSize: "13px", lineHeight: 1.6, color: "rgba(248,249,250,0.55)", margin: "0 0 14px" }}>
                Piénsalo antes de seguir. Lo que viene es el nivel más profundo.
              </p>
              <button
                type="button"
                onClick={() => setEnPausa(true)}
                style={{
                  display: "inline-flex", alignItems: "center", gap: "8px",
                  fontFamily: "Sora, sans-serif", fontSize: "13.5px", fontWeight: 600,
                  padding: "10px 18px", borderRadius: "999px", border: "none",
                  cursor: "pointer", backgroundColor: FAE.ambar, color: FAE.bg,
                }}
              >
                Ya lo pensé, tocar el fondo
              </button>
            </div>
          )}

          {/* El cierre, con la bitácora completa al lado del iceberg entero. */}
          {completo && (
            <div
              className="fae-brote"
              style={{
                marginTop: "18px",
                borderRadius: "14px",
                background: "rgba(42,157,143,0.07)",
                border: `1px solid ${FAE.teal}`,
                padding: "16px",
              }}
            >
              <p style={{ fontFamily: "Sora, sans-serif", fontSize: "11.5px", fontWeight: 700, letterSpacing: "0.1em", color: FAE.teal, margin: "0 0 10px" }}>
                LO QUE SOSTIENE TODO LO DEMÁS
              </p>
              <p style={{ fontSize: "15px", lineHeight: 1.65, color: "rgba(248,249,250,0.9)", margin: "0 0 16px" }}>
                {SINTESIS_INMERSION}
              </p>
              <button
                type="button"
                onClick={reiniciar}
                style={{
                  display: "inline-flex", alignItems: "center", gap: "8px",
                  fontFamily: "Sora, sans-serif", fontSize: "13px", fontWeight: 600,
                  padding: "9px 15px", borderRadius: "999px", cursor: "pointer",
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
      </div>
    </div>
  );
}
