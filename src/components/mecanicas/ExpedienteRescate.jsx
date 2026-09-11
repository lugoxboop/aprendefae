import { useRef, useState } from "react";
import { RotateCcw } from "lucide-react";
import { FAE } from "../../theme.js";
import { RESTOS_BLOCKBUSTER, PREGUNTA_RESCATE, OPCIONES_RESCATE } from "../../data/icebergActividades.js";
import { barajarDistinto } from "../../utils/barajar.js";

/*
 * "Expediente de rescate" — el peldaño Analizar de Bloom.
 *
 * El caso Blockbuster completo, con su texto y su puntuación intactos: lo
 * único que cambia respecto a la versión anterior es la presentación. Antes
 * era una línea de tiempo; ahora es un pecio en el fondo del mar y una linterna
 * que hay que pasear para encontrar los restos.
 *
 * NO ES DECORACIÓN. Clasificar partes sueltas ya se hizo en el radar; aquí lo
 * que se pide es leer un caso entero y decidir en qué nivel valía la pena
 * intervenir. Que los restos haya que buscarlos obliga a mirarlos de uno en uno
 * en vez de barrer una lista, que es la diferencia entre leer y analizar.
 *
 * LA ESCENA SE ILUMINA CON EL RESULTADO: 100% la deja clara, 0% la deja casi a
 * oscuras. Es el marcador, sin poner un número encima del dibujo.
 */

const VB = { w: 520, h: 300 };

/* Dónde yace cada resto alrededor del casco. */
const POSICIONES = [
  { x: 92, y: 92 }, { x: 428, y: 104 }, { x: 128, y: 232 }, { x: 400, y: 236 },
];

const CSS = `
@keyframes fae-er-limpiar { from { opacity: .85; } to { opacity: 0; } }
.fae-er-limpiar { animation: fae-er-limpiar 700ms ease-out forwards; }
@keyframes fae-er-brote { from { opacity: 0; transform: translateY(8px); } to { opacity: 1; transform: none; } }
.fae-er-brote { animation: fae-er-brote 460ms ease-out both; }
@media (prefers-reduced-motion: reduce) { .fae-er-limpiar, .fae-er-brote { animation: none !important; } }
`;

export default function ExpedienteRescate({ onCompletar }) {
  const [revelados, setRevelados] = useState([]);
  const [limpiando, setLimpiando] = useState(null);
  const [eleccion, setEleccion] = useState(null);
  const [luz, setLuz] = useState({ x: 50, y: 50 });   // en %, para la linterna
  /*
   * Las cuatro opciones se barajan. Con A/B/C/D siempre en el mismo sitio, la
   * respuesta se recuerda por posición en el segundo intento.
   */
  const ordenPrevio = useRef(null);
  const [opciones, setOpciones] = useState(() => {
    const o = barajarDistinto(OPCIONES_RESCATE, null, (x) => x.id);
    ordenPrevio.current = o;
    return o;
  });
  const escena = useRef(null);
  const inicio = useRef(Date.now());

  const todosFuera = revelados.length === RESTOS_BLOCKBUSTER.length;
  const opcion = OPCIONES_RESCATE.find((o) => o.id === eleccion);

  /* Con la respuesta dada, la escena se ilumina en proporción al acierto. */
  const claridad = opcion ? opcion.porcentaje / 100 : 0;

  const mover = (e) => {
    const caja = escena.current?.getBoundingClientRect();
    if (!caja) return;
    const p = e.touches?.[0] ?? e;
    setLuz({
      x: ((p.clientX - caja.left) / caja.width) * 100,
      y: ((p.clientY - caja.top) / caja.height) * 100,
    });
  };

  const destapar = (i) => {
    if (revelados.includes(i)) return;
    setLimpiando(i);
    setTimeout(() => setLimpiando(null), 700);
    setRevelados((r) => [...r, i]);
  };

  const responder = (o) => {
    if (eleccion) return;
    setEleccion(o.id);
    /*
     * ═══════════ EL DETALLE POR ÍTEM ═══════════
     *
     * UNA SOLA FILA, y es lo correcto: esta actividad tiene exactamente una
     * decisión con respuesta —el diagnóstico— después de destapar las pistas
     * que quiera. El id es fijo porque la pregunta es siempre la misma; lo que
     * varía, y lo que vale, es cuál de las cuatro opciones eligió.
     *
     * `ok` solo con la opción del 100%: la del 20% es una respuesta parcial
     * que el motor premia a medias, pero como acierto no lo es.
     *
     * Qué pistas destapó antes de decidir NO se guarda aquí: no es un ítem con
     * respuesta correcta, y meterlo forzaría una forma ajena a la tabla.
     */
    onCompletar?.(o.porcentaje, Date.now() - inicio.current, [{
      item: "diagnostico",
      ok: o.porcentaje === 100,
      intentos: 1,
      respuesta: o.id,
      orden: 1,
    }]);
  };

  const reiniciar = () => {
    setRevelados([]); setEleccion(null);
    const o = barajarDistinto(OPCIONES_RESCATE, ordenPrevio.current, (x) => x.id);
    ordenPrevio.current = o;
    setOpciones(o);
    inicio.current = Date.now();
  };

  return (
    <div>
      <style>{CSS}</style>

      {/* ------------------------------ el pecio ------------------------------ */}
      <div
        ref={escena}
        onMouseMove={mover}
        onTouchMove={mover}
        style={{
          position: "relative", borderRadius: "18px", overflow: "hidden",
          border: "1px solid rgba(248,249,250,0.14)", marginBottom: "14px",
          background: "#08111d", touchAction: "none",
        }}
      >
        <svg viewBox={`0 0 ${VB.w} ${VB.h}`} width="100%" style={{ display: "block" }} aria-hidden="true">
          <defs>
            <linearGradient id="er-fondo" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#0E1B2E" />
              <stop offset="100%" stopColor="#06101a" />
            </linearGradient>
          </defs>
          <rect x="0" y="0" width={VB.w} height={VB.h} fill="url(#er-fondo)" />

          {/* Lecho marino. */}
          <path d={`M0 ${VB.h} L0 258 Q 130 240 260 256 Q 390 272 ${VB.w} 250 L${VB.w} ${VB.h} Z`} fill="#0b1826" />

          {/* La silueta del barco hundido, escorada. */}
          <g transform="translate(260 168) rotate(-8)" opacity={0.5 + claridad * 0.45}>
            <path d="M-120 0 Q -100 34, 0 38 Q 100 34, 120 0 L 96 -14 L -96 -14 Z" fill="#16263a" stroke="rgba(203,220,242,0.28)" strokeWidth="1.5" />
            <rect x="-46" y="-44" width="92" height="30" fill="#1b2f47" stroke="rgba(203,220,242,0.22)" strokeWidth="1.2" />
            <line x1="0" y1="-44" x2="0" y2="-86" stroke="rgba(203,220,242,0.3)" strokeWidth="2.5" />
          </g>

          {/* Los cuatro restos: el SVG dibuja el círculo; el número y el toque van en HTML, abajo. */}
          {RESTOS_BLOCKBUSTER.map((r, i) => {
            const p = POSICIONES[i];
            const fuera = revelados.includes(i);
            return (
              <g key={r.nivel}>
                <circle cx={p.x} cy={p.y} r="26" fill={fuera ? "rgba(42,157,143,0.16)" : "rgba(203,220,242,0.07)"}
                  stroke={fuera ? FAE.teal : "rgba(203,220,242,0.3)"} strokeWidth="1.6" />
                {limpiando === i && <circle className="fae-er-limpiar" cx={p.x} cy={p.y} r="30" fill="#CBDCF2" />}
              </g>
            );
          })}
        </svg>

        {/*
          EL NÚMERO Y EL TOQUE, EN HTML. Estaban dentro del SVG, en unidades de
          un lienzo de 520: a 375 px de ventana el dibujo se escala a 0,62 y los
          números salían a 8 px. Aquí van a px reales, y cada resto es un botón
          de verdad —antes era un <g> con onClick dentro de un SVG aria-hidden,
          al que no llegaban ni el teclado ni un lector de pantalla—.

          Van por DEBAJO del velo de la linterna, que se pinta después: siguen a
          oscuras hasta que se les acerca la luz, que es el juego.
        */}
        {RESTOS_BLOCKBUSTER.map((r, i) => {
          const p = POSICIONES[i];
          const fuera = revelados.includes(i);
          return (
            <button
              key={r.nivel}
              type="button"
              onClick={() => destapar(i)}
              disabled={fuera}
              aria-label={fuera ? `Resto ${i + 1}, ya recuperado: ${r.nivel}` : `Resto ${i + 1} de ${RESTOS_BLOCKBUSTER.length}`}
              style={{
                position: "absolute", left: `${(p.x / VB.w) * 100}%`, top: `${(p.y / VB.h) * 100}%`,
                transform: "translate(-50%, -50%)", width: "44px", height: "44px",
                display: "grid", placeItems: "center", padding: 0, borderRadius: "999px",
                background: "transparent", border: "none", cursor: fuera ? "default" : "pointer",
                fontFamily: "Sora, sans-serif", fontSize: "clamp(15px, 3.2vw, 20px)", fontWeight: 700,
                color: fuera ? FAE.teal : "rgba(203,220,242,0.62)",
              }}
            >
              {i + 1}
            </button>
          );
        })}

        {/*
          La linterna. Un velo oscuro con un agujero suave donde está el cursor;
          al responder, el velo se levanta en proporción al acierto.
        */}
        <div
          aria-hidden="true"
          style={{
            position: "absolute", inset: 0, pointerEvents: "none",
            background: `radial-gradient(circle 130px at ${luz.x}% ${luz.y}%, rgba(0,0,0,0) 0%, rgba(0,0,0,0.55) 55%, rgba(0,0,0,${0.88 - claridad * 0.8}) 100%)`,
            transition: "background 420ms ease",
          }}
        />
      </div>

      <p style={{ fontSize: "12.5px", color: "rgba(248,249,250,0.45)", margin: "0 0 14px" }}>
        {todosFuera
          ? "Los cuatro restos están sobre la mesa."
          : `Pasea la linterna y toca los restos. Llevas ${revelados.length} de ${RESTOS_BLOCKBUSTER.length}.`}
      </p>

      {/* --------------------------- lo recuperado --------------------------- */}
      <div style={{ display: "flex", flexDirection: "column", gap: "10px", marginBottom: "16px" }}>
        {revelados.map((i) => {
          const r = RESTOS_BLOCKBUSTER[i];
          return (
            <div key={r.nivel} className="fae-er-brote"
              style={{ paddingLeft: "14px", borderLeft: `2px solid ${FAE.teal}` }}>
              <p style={{ fontFamily: "Sora, sans-serif", fontSize: "11.5px", fontWeight: 700, letterSpacing: "0.08em", color: FAE.teal, margin: "0 0 4px" }}>
                {r.nivel.toUpperCase()}
              </p>
              <p style={{ fontSize: "14px", lineHeight: 1.55, color: "rgba(248,249,250,0.88)", margin: 0 }}>{r.texto}</p>
            </div>
          );
        })}
      </div>

      {/* ------------------------------ el reto ------------------------------ */}
      {todosFuera && (
        <div className="fae-er-brote"
          style={{ borderRadius: "18px", background: "rgba(248,249,250,0.04)", border: "1px solid rgba(248,249,250,0.14)", padding: "clamp(16px, 2.4vw, 22px)" }}>
          <p style={{ fontFamily: "Sora, sans-serif", fontWeight: 700, fontSize: "clamp(16px, 2.3vw, 19px)", lineHeight: 1.45, color: FAE.text, margin: "0 0 16px" }}>
            {PREGUNTA_RESCATE}
          </p>

          <div style={{ display: "flex", flexDirection: "column", gap: "9px" }}>
            {opciones.map((o) => {
              const elegida = eleccion === o.id;
              const color = o.porcentaje === 100 ? FAE.teal : o.porcentaje > 0 ? FAE.ambar : FAE.coral;
              return (
                <button key={o.id} type="button" onClick={() => responder(o)} disabled={!!eleccion}
                  style={{
                    textAlign: "left", padding: "13px 15px", borderRadius: "14px",
                    cursor: eleccion ? "default" : "pointer",
                    background: elegida ? `${color}1f` : "rgba(248,249,250,0.04)",
                    border: `1px solid ${elegida ? color : "rgba(248,249,250,0.14)"}`,
                    color: eleccion && !elegida ? "rgba(248,249,250,0.4)" : FAE.text,
                    fontSize: "14px", lineHeight: 1.5, fontFamily: "Inter, sans-serif",
                  }}>
                  {o.texto}
                </button>
              );
            })}
          </div>

          {opcion && (
            <div className="fae-er-brote" style={{ marginTop: "16px" }}>
              <p style={{ fontSize: "14.5px", lineHeight: 1.6, color: "rgba(248,249,250,0.88)", margin: "0 0 14px" }}>
                {opcion.feedback}
              </p>
              <button type="button" onClick={reiniciar}
                style={{ display: "inline-flex", alignItems: "center", gap: "8px", fontFamily: "Sora, sans-serif", fontSize: "13px", fontWeight: 600, padding: "9px 15px", borderRadius: "999px", cursor: "pointer", background: "transparent", border: "1px solid rgba(248,249,250,0.22)", color: "rgba(248,249,250,0.7)" }}>
                <RotateCcw size={14} /> Volver a bajar
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
