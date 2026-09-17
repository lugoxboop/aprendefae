import { lazy, Suspense, useEffect, useLayoutEffect, useRef, useState } from "react";
import { FAE } from "../../theme.js";
import { useAuth } from "../../auth/AuthProvider.jsx";
import { escucharFP } from "../../fp/aviso.js";
import { crearDisparador } from "../../racha/disparador.js";
import { pedirMomentoRacha } from "../../racha/datos.js";
import { aristasNuevas, mensajeRacha, semana } from "../../racha/teseracto.js";

/*
 * ═══════════════════════════════════════════════════════════════════════════
 * EL MOMENTO DE RACHA: el grande, el de una vez al día.
 *
 *   1. ENTRADA     el teseracto ocupa la pantalla, solo.
 *   2. TRAZO       la arista nueva (o las dos, los días 8 y 23) se dibuja y
 *                  se enciende; debajo, «Pasaste de racha N−1 a N».
 *   3. TRANSICIÓN  el teseracto se encoge hasta la esquina de la tarjeta de la
 *                  semana, sin dejar de girar: es el mismo lienzo, movido con
 *                  transform, no uno nuevo.
 *   4. SEMANA      la tarjeta con los siete días, y se va sola.
 *
 * UN TOQUE EN CUALQUIER SITIO, o Escape, lo cierra en cualquier momento. Dura
 * unos seis segundos en total; con dos aristas, uno más.
 *
 * El fuego (IconoRacha) NO sale aquí ni se toca: sigue en todos los usos
 * pequeños. Esto es solo el momento grande.
 *
 * Three.js entra con lazy: el sitio no descarga el teseracto hasta el día en
 * que hay algo que celebrar.
 * ═══════════════════════════════════════════════════════════════════════════
 */

const Teseracto = lazy(() => import("./Teseracto.jsx"));

export const TIEMPOS = {
  inicioTrazo: 500,
  porArista: 950,
  pausaTrasTrazo: 750,
  transicion: 750,
  semana: 2600,
  salida: 320,
};

export const duracionEntrada = (dia) => TIEMPOS.inicioTrazo + Math.max(1, aristasNuevas(dia)) * TIEMPOS.porArista + TIEMPOS.pausaTrasTrazo;

const TAM_PEQUENO = 76;
const CURVA = "cubic-bezier(.45,.05,.2,1)";

const CSS = `
@keyframes fae-mr-aparecer { from { opacity: 0; } to { opacity: 1; } }
@keyframes fae-mr-subir { from { opacity: 0; transform: translateY(12px); } to { opacity: 1; transform: none; } }
.fae-mr-velo { animation: fae-mr-aparecer 380ms ease-out both; }
.fae-mr-mensaje { animation: fae-mr-subir 520ms ${CURVA} 380ms both; }
.fae-mr-tarjeta { animation: fae-mr-subir 560ms ${CURVA} both; }
@media (prefers-reduced-motion: reduce) {
  .fae-mr-velo, .fae-mr-mensaje, .fae-mr-tarjeta { animation: none !important; }
  .fae-mr-lienzo { transition: none !important; }
}
`;

function Dia({ etiqueta, estado }) {
  const lleno = estado === "completado" || estado === "hoy-hecho";
  const hoy = estado === "hoy" || estado === "hoy-hecho";
  return (
    <li data-dia={estado} style={{ listStyle: "none", display: "flex", flexDirection: "column", alignItems: "center", gap: "6px", minWidth: 0 }}>
      <span
        aria-hidden="true"
        style={{
          boxSizing: "border-box", width: "26px", height: "26px", borderRadius: "999px",
          background: lleno ? FAE.teal : "transparent",
          border: hoy ? `2.5px solid ${FAE.ambar}` : lleno ? `2px solid ${FAE.teal}` : "1.5px solid rgba(248,249,250,0.32)",
          boxShadow: hoy ? "0 0 0 3px rgba(233,196,106,0.16)" : "none",
        }}
      />
      <span style={{ fontFamily: "Inter, sans-serif", fontSize: "11.5px", fontWeight: hoy ? 700 : 600, color: hoy ? FAE.text : "rgba(248,249,250,0.6)" }}>
        {etiqueta}
      </span>
    </li>
  );
}

const NOMBRE_ESTADO = { completado: "completado", "hoy-hecho": "hoy, completado", hoy: "hoy, pendiente", pendiente: "sin actividad" };

/**
 * La secuencia en pantalla. Separada del disparo para poder probarla y verla
 * sin sesión.
 */
export function SecuenciaRacha({ momento, onFin }) {
  const [fase, setFase] = useState("entrada");
  const [sinWebGL, setSinWebGL] = useState(false);
  const [destino, setDestino] = useState(null);
  const hueco = useRef(null);
  const cerrado = useRef(false);

  const dia = momento.hasta;
  const dias = semana(momento.hoy, momento.semana);

  const cerrar = () => {
    if (cerrado.current) return;
    cerrado.current = true;
    setFase("salida");
    setTimeout(() => onFin?.(), TIEMPOS.salida);
  };

  useEffect(() => {
    const aSemana = setTimeout(() => setFase("semana"), duracionEntrada(dia));
    const fin = setTimeout(cerrar, duracionEntrada(dia) + TIEMPOS.transicion + TIEMPOS.semana);
    const tecla = (e) => { if (e.key === "Escape" || e.key === "Enter" || e.key === " ") cerrar(); };
    window.addEventListener("keydown", tecla);
    return () => { clearTimeout(aSemana); clearTimeout(fin); window.removeEventListener("keydown", tecla); };
  }, []);

  /* Dónde tiene que acabar el teseracto: el hueco de arriba a la derecha de la tarjeta. */
  useLayoutEffect(() => {
    if (fase !== "semana" || !hueco.current) return;
    const r = hueco.current.getBoundingClientRect();
    setDestino({ x: r.left + r.width / 2, y: r.top + r.height / 2 });
  }, [fase]);

  const grande = Math.round(Math.min(window.innerWidth * 0.88, window.innerHeight * 0.58, 560));
  const enSemana = fase !== "entrada" && destino;
  const escala = enSemana ? TAM_PEQUENO / grande : 1;
  const cx = enSemana ? destino.x : window.innerWidth / 2;
  const cy = enSemana ? destino.y : window.innerHeight * 0.42;

  return (
    <div
      data-momento-racha={fase}
      role="dialog"
      aria-modal="true"
      aria-label={`${mensajeRacha(momento.desde, momento.hasta)}. Toca para cerrar.`}
      onPointerDown={cerrar}
      className="fae-mr-velo"
      style={{
        position: "fixed", inset: 0, zIndex: 90, cursor: "pointer", overflow: "hidden",
        background: "radial-gradient(circle at 50% 42%, rgba(29,53,87,0.94) 0%, rgba(10,20,34,0.97) 62%)",
        opacity: fase === "salida" ? 0 : 1, transition: `opacity ${TIEMPOS.salida}ms ease-in`,
        WebkitTapHighlightColor: "transparent",
      }}
    >
      <style>{CSS}</style>

      {!sinWebGL && (
        <div
          className="fae-mr-lienzo"
          data-lienzo-teseracto
          style={{
            /* Por encima de la tarjeta: la tarjeta viene después en el DOM y, sin esto, lo tapaba al posarse. */
            position: "absolute", zIndex: 2, left: 0, top: 0, width: `${grande}px`, height: `${grande}px`,
            transform: `translate(${cx - grande / 2}px, ${cy - grande / 2}px) scale(${escala})`,
            transformOrigin: "50% 50%",
            transition: `transform ${TIEMPOS.transicion}ms ${CURVA}`,
            willChange: "transform", pointerEvents: "none",
          }}
        >
          <Suspense fallback={null}>
            <Teseracto
              dia={dia}
              trazarNuevas
              inicioTrazoMs={TIEMPOS.inicioTrazo}
              msPorArista={TIEMPOS.porArista}
              onSinWebGL={() => setSinWebGL(true)}
            />
          </Suspense>
        </div>
      )}

      {fase === "entrada" && (
        <p
          className="fae-mr-mensaje"
          aria-live="polite"
          style={{
            position: "absolute", left: "16px", right: "16px", top: `calc(42% + ${grande / 2}px + 8px)`, margin: 0, textAlign: "center",
            fontFamily: "Sora, sans-serif", fontWeight: 700, fontSize: "clamp(20px, 5.4vw, 28px)", letterSpacing: "-0.02em", color: FAE.text,
          }}
        >
          {mensajeRacha(momento.desde, momento.hasta)}
        </p>
      )}

      {fase !== "entrada" && (
        <div style={{ position: "absolute", inset: 0, display: "flex", alignItems: "center", justifyContent: "center", padding: "16px", pointerEvents: "none" }}>
          <section
            className="fae-mr-tarjeta"
            data-semana-racha
            style={{
              boxSizing: "border-box", width: "100%", maxWidth: "380px",
              padding: "18px 18px 20px", borderRadius: "18px",
              background: "#15294A", border: "1px solid rgba(248,249,250,0.14)",
              boxShadow: "0 24px 60px rgba(0,0,0,0.45)",
            }}
          >
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: "12px", minHeight: `${TAM_PEQUENO}px` }}>
              <div style={{ minWidth: 0 }}>
                <p style={{ margin: 0, fontFamily: "Sora, sans-serif", fontWeight: 700, fontSize: "19px", lineHeight: 1.25, color: FAE.text }}>
                  Tu racha sigue viva.
                </p>
                <p style={{ margin: "4px 0 0", fontSize: "13px", lineHeight: 1.45, color: "rgba(248,249,250,0.7)" }}>
                  {dia} {dia === 1 ? "día seguido" : "días seguidos"}
                </p>
              </div>
              {/* El hueco donde se posa el teseracto: mismo tamaño, sin dibujar nada. */}
              <div ref={hueco} aria-hidden="true" style={{ flex: `0 0 ${TAM_PEQUENO}px`, width: `${TAM_PEQUENO}px`, height: `${TAM_PEQUENO}px` }} />
            </div>

            <ol aria-label="Esta semana" style={{ margin: "16px 0 0", padding: 0, display: "grid", gridTemplateColumns: "repeat(7, 1fr)", gap: "4px" }}>
              {dias.map((d) => (
                <Dia key={d.fecha} etiqueta={d.etiqueta} estado={d.estado} />
              ))}
            </ol>
            <p className="fae-jg-oculto" style={{ position: "absolute", width: 1, height: 1, overflow: "hidden", clip: "rect(0 0 0 0)" }}>
              {dias.map((d) => `${d.etiqueta}: ${NOMBRE_ESTADO[d.estado]}`).join(". ")}
            </p>
          </section>
        </div>
      )}

      <p style={{ position: "absolute", left: 0, right: 0, bottom: "max(18px, env(safe-area-inset-bottom))", margin: 0, textAlign: "center", fontSize: "12px", color: "rgba(248,249,250,0.55)", pointerEvents: "none" }}>
        Toca para cerrar.
      </p>
    </div>
  );
}

/** Montado una vez en App: escucha, pregunta cuando toca y enseña la secuencia. */
export default function MomentoRacha() {
  const { session } = useAuth();
  const [momento, setMomento] = useState(null);
  const disparador = useRef(null);

  useEffect(() => {
    disparador.current = crearDisparador({ pedir: pedirMomentoRacha, escucharFP, alMostrar: setMomento });
    return () => disparador.current.detener();
  }, []);

  useEffect(() => {
    disparador.current?.sesion(Boolean(session));
  }, [session]);

  if (!momento) return null;
  return <SecuenciaRacha momento={momento} onFin={() => setMomento(null)} />;
}
