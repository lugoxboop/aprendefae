import { useEffect, useRef, useState } from "react";
import { FAE } from "../../../theme.js";
import { barajar } from "../../../utils/barajar.js";
import { porcentaje } from "../../../data/politicaFiscal.js";
import { OPCIONES_ACERCA, retroAcerca } from "../../../data/bloquesAvanzados.js";
import { Opcion, Opciones, Retro, Pulsos, Cierre, Enunciado } from "../corazon/juego.jsx";
import { Avanzar, TEXTO_CIERRE } from "./marcos.jsx";

/*
 * ═══════════════════════════════════════════════════════════════════════════
 * ¿SE ACERCA O SE ALEJA? — Política Económica, Medio.
 *
 * Un cambio y un objetivo: predecir si el cambio acerca la economía a ese
 * objetivo o la aleja. Una respuesta por fila, y después la aguja se mueve a
 * donde de verdad va: hacia la marca de la meta o lejos de ella. La aguja
 * enseña la respuesta DESPUÉS de elegir, nunca antes.
 *
 *   pct = aciertos / 6 × 100, sin redondear por el camino
 *
 * Ítem = la fila, por su id.
 * ═══════════════════════════════════════════════════════════════════════════
 */

const CSS_AGUJA = `
.fae-sa-aguja { transform-box: view-box; transform-origin: 60px 52px; transition: transform 600ms cubic-bezier(.3,.8,.4,1); }
@media (prefers-reduced-motion: reduce) { .fae-sa-aguja { transition: none !important; } }
`;

/* La aguja: al centro mientras se piensa; hacia la meta o lejos de ella cuando ya se respondió. */
function Aguja({ hacia }) {
  const giro = hacia === "acerca" ? 58 : hacia === "aleja" ? -58 : 0;
  return (
    <svg viewBox="0 0 120 62" width="150" height="78" aria-hidden="true" style={{ display: "block", margin: "4px auto 0" }}>
      <style>{CSS_AGUJA}</style>
      <path d="M14 52 A46 46 0 0 1 106 52" fill="none" stroke="rgba(248,249,250,0.18)" strokeWidth="6" strokeLinecap="round" />
      {/* La marca de la meta, a la derecha. Lleva su bandera: no es solo un color. */}
      <path d="M99 23 L99 11 L108 14.5 L99 18" fill="none" stroke={FAE.teal} strokeWidth="2" strokeLinejoin="round" />
      <circle cx="99" cy="27" r="3.4" fill={FAE.teal} />
      <g className="fae-sa-aguja" style={{ transform: `rotate(${giro}deg)` }}>
        <path d="M60 52 L60 14" stroke={FAE.text} strokeWidth="3" strokeLinecap="round" />
      </g>
      <circle cx="60" cy="52" r="5" fill={FAE.text} />
    </svg>
  );
}

export default function SeAcercaOSeAleja({ filas, Marco, rotulo, titulo, acento, onCompletar }) {
  const [orden, setOrden] = useState(() => barajar(filas));
  const [i, setI] = useState(0);
  const [elegida, setElegida] = useState(null);
  const [aciertos, setAciertos] = useState(0);
  const [terminado, setTerminado] = useState(false);

  const respondidas = useRef(new Set());
  const detalle = useRef([]);
  const inicio = useRef(Date.now());

  const fila = orden[i];
  const pct = porcentaje(aciertos, orden.length);

  useEffect(() => {
    if (terminado) onCompletar?.(pct, Date.now() - inicio.current, detalle.current);
  }, [terminado]);

  const responder = (id) => {
    if (respondidas.current.has(fila.id)) return;
    respondidas.current.add(fila.id);
    const ok = id === fila.correcta;
    detalle.current.push({ item: fila.id, ok, intentos: 1, respuesta: ok ? null : id, orden: detalle.current.length + 1 });
    if (ok) setAciertos((n) => n + 1);
    setElegida(id);
  };

  const avanzar = () => {
    if (!elegida) return;
    setElegida(null);
    if (i + 1 < orden.length) setI(i + 1);
    else setTerminado(true);
  };

  const reiniciar = () => {
    setOrden(barajar(filas));
    setI(0); setElegida(null); setAciertos(0); setTerminado(false);
    respondidas.current = new Set();
    detalle.current = [];
    inicio.current = Date.now();
  };

  if (terminado) {
    return (
      <Marco rotulo={rotulo} titulo={titulo} acento={acento}>
        <Cierre pct={Math.round(pct)} onReiniciar={reiniciar} textoReiniciar="Otra vez">
          <p style={TEXTO_CIERRE}>
            {aciertos} de {orden.length} bien predichas. Un mismo cambio puede acercar un objetivo y alejar otro: la dirección depende de a dónde se quiere llegar.
          </p>
        </Cierre>
      </Marco>
    );
  }

  return (
    <Marco rotulo={rotulo} titulo={titulo} acento={acento}>
      <div style={{ marginBottom: "12px" }}>
        <Pulsos total={orden.length} hechos={i + (elegida ? 1 : 0)} enCurso={i + 1} etiqueta="Cambio" />
      </div>
      <Enunciado rotulo="EL CAMBIO" acento={acento}>{fila.cambio}</Enunciado>
      <div style={{ marginTop: "10px", display: "flex", alignItems: "center", gap: "12px", flexWrap: "wrap" }}>
        <p style={{ margin: 0, flex: "1 1 180px", fontSize: "14px", lineHeight: 1.5, color: "rgba(248,249,250,0.8)" }}>
          <span style={{ display: "block", fontFamily: "Sora, sans-serif", fontSize: "10.5px", fontWeight: 700, letterSpacing: "0.14em", color: FAE.teal, marginBottom: "3px" }}>
            EL OBJETIVO
          </span>
          {fila.objetivo}
        </p>
        <div style={{ flex: "0 0 auto" }}>
          <Aguja hacia={elegida ? fila.correcta : null} />
        </div>
      </div>
      <Opciones columnas="repeat(auto-fit, minmax(150px, 1fr))">
        {OPCIONES_ACERCA.map((o) => (
          <Opcion
            key={o.id}
            ancho
            deshabilitada={Boolean(elegida)}
            onClick={() => responder(o.id)}
            estado={!elegida ? null : o.id === elegida ? (o.id === fila.correcta ? "correcta" : "incorrecta") : o.id === fila.correcta ? "revelada" : null}
          >
            {o.id === "acerca" ? "→ " : "← "}{o.nombre}
          </Opcion>
        ))}
      </Opciones>
      <Retro texto={elegida ? retroAcerca(fila, elegida) : null} />
      {elegida && <Avanzar onClick={avanzar}>{i + 1 === orden.length ? "Ver resultado" : "Siguiente"}</Avanzar>}
    </Marco>
  );
}
