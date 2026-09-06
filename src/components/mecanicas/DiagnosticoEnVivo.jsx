import { useEffect, useRef, useState } from "react";
import { RotateCcw, FolderClosed } from "lucide-react";
import { FAE } from "../../theme.js";
import { PROBLEMAS, TITULARES, retroalimentacion, textoArchivado } from "../../data/juegosPolitica.js";
import { barajarDistinto } from "../../utils/barajar.js";

/*
 * ACTIVIDAD 1 — "Diagnóstico en vivo".
 *
 * Juego evaluativo. Ocho titulares reales caen uno a uno y hay que clasificar
 * cada uno en su problema antes de que cruce la línea de archivo.
 *
 * NO ES UN EJERCICIO DE MEMORIA, y por eso ningún texto de la interfaz lo
 * llama así. Los ocho botones están a la vista todo el rato, así que lo que se
 * practica es RECONOCIMIENTO rápido —clasificar contra una lista visible— y no
 * recuerdo libre. Es una actividad sólida; solo no es lo que dice la etiqueta
 * de "práctica de recuperación".
 *
 * ─────────────── SE TOCA, NO SE ARRASTRA ───────────────
 *
 * La ficha pedía arrastrar el titular hasta el botón. Aquí no se arrastra, y
 * es deliberado: el arrastre nativo del navegador no funciona con el dedo sin
 * una librería encima, este sitio se ve sobre todo en el teléfono, y todas las
 * mecánicas del proyecto ya resuelven esto tocando (radar, expediente,
 * arquitecto, tribunal). Como además solo hay UN titular activo a la vez, no
 * hace falta ni seleccionarlo: se toca el botón y se clasifica el que está
 * cayendo. Es menos gesto que arrastrar, no más.
 *
 * ─────────────── EL RELOJ LO LLEVA LA ANIMACIÓN ───────────────
 *
 * La caída es una animación CSS y el archivado se dispara con su
 * `animationend`, no con un setTimeout. Si el estudiante cambia de pestaña, la
 * animación se detiene y el titular NO se pierde: el dibujo y el reloj son el
 * mismo, así que no pueden discrepar.
 *
 * PUNTUACIÓN: 12,5% por titular, y cuenta el PRIMER intento. Un titular
 * corregido al segundo intento da su explicación pero puntúa como fallo — si
 * no, bastaría con probar dos botones en cada uno.
 */

/* Segundos de caída, de aparición a línea de archivo. Punto de calibración. */
const SEGUNDOS_CAIDA = 6;

/* La línea de archivo, en % de altura desde abajo. */
const LINEA_ARCHIVO = 15;

/* Alto aproximado del naipe: lo que se descuenta para que cruce con su base. */
const ALTO_NAIPE = 64;

const CSS = `
@keyframes fae-dv-caer { from { transform: translateY(0); } to { transform: translateY(var(--fae-dv-recorrido)); } }
@keyframes fae-dv-acierto { 0% { opacity: 1; transform: scale(1); } 100% { opacity: 0; transform: scale(1.12); } }
.fae-dv-acierto { animation: fae-dv-acierto 420ms ease-out forwards; }
@keyframes fae-dv-rebote { 0%,100% { transform: translateX(0); } 25% { transform: translateX(-9px); } 75% { transform: translateX(9px); } }
.fae-dv-rebote { animation: fae-dv-rebote 400ms ease-in-out; }
@keyframes fae-dv-pulso { 0%,100% { box-shadow: 0 0 0 0 rgba(42,157,143,0); } 50% { box-shadow: 0 0 0 6px rgba(42,157,143,0.4); } }
.fae-dv-pulso { animation: fae-dv-pulso 480ms ease-out; }
@keyframes fae-dv-entrar { from { opacity: 0; transform: translateY(8px); } to { opacity: 1; transform: none; } }
.fae-dv-entrar { animation: fae-dv-entrar 380ms ease-out both; }
/* La textura de circuito de la consola, muy tenue. */
.fae-dv-consola {
  background-image:
    linear-gradient(rgba(203,220,242,0.045) 1px, transparent 1px),
    linear-gradient(90deg, rgba(203,220,242,0.045) 1px, transparent 1px);
  background-size: 26px 26px;
}
@media (prefers-reduced-motion: reduce) {
  .fae-dv-acierto, .fae-dv-rebote, .fae-dv-pulso, .fae-dv-entrar { animation: none !important; }
}
`;

export default function DiagnosticoEnVivo({ onCompletar }) {
  const ordenPrevio = useRef(null);
  const [orden, setOrden] = useState(() => {
    const o = barajarDistinto(TITULARES, null, (t) => t.id);
    ordenPrevio.current = o;
    return o;
  });
  const [i, setI] = useState(0);
  /* id -> true si acertó al primer intento */
  const [primeros, setPrimeros] = useState({});
  const [intentos, setIntentos] = useState(0);      // del titular actual
  const [aviso, setAviso] = useState(null);         // { ok, texto }
  const [efecto, setEfecto] = useState(null);       // "acierto" | "fallo"
  const [pulsando, setPulsando] = useState(null);   // id de botón que late
  const [historial, setHistorial] = useState([]);
  const inicio = useRef(Date.now());
  const pista = useRef(null);
  /*
   * El recorrido se MIDE. En translateY los porcentajes son relativos a la
   * altura del propio elemento, no a la del contenedor, así que calcularlo con
   * porcentajes daba una caída que no llegaba a la línea.
   */
  const [recorrido, setRecorrido] = useState(0);
  useEffect(() => {
    const nodo = pista.current;
    if (!nodo) return;
    const medir = () => {
      const alto = nodo.getBoundingClientRect().height;
      /* Del borde superior del naipe (top: 10px) hasta la línea de archivo. */
      setRecorrido(Math.max(0, alto * (1 - LINEA_ARCHIVO / 100) - 10 - ALTO_NAIPE));
    };
    medir();
    if (typeof ResizeObserver === "undefined") return;
    const ro = new ResizeObserver(medir);
    ro.observe(nodo);
    return () => ro.disconnect();
  }, []);

  const actual = orden[i];
  const terminado = i >= orden.length;
  const aciertos = TITULARES.filter((t) => primeros[t.id]).length;
  const pct = Math.round((aciertos * 100) / TITULARES.length);

  useEffect(() => {
    if (terminado) onCompletar?.(pct, Date.now() - inicio.current);
  }, [terminado]);

  /* Cierra el titular actual y pasa al siguiente. */
  const cerrar = (idTitular, acertoPrimero, textoAviso, ok) => {
    setPrimeros((p) => ({ ...p, [idTitular]: acertoPrimero }));
    setHistorial((h) => [...h, { id: idTitular, ok, texto: textoAviso }]);
    setAviso({ ok, texto: textoAviso });
    setIntentos(0);
    setEfecto(ok ? "acierto" : null);
    setTimeout(() => { setEfecto(null); setI((n) => n + 1); }, ok ? 430 : 260);
  };

  const clasificar = (problemaId) => {
    if (!actual || efecto === "acierto") return;
    const r = retroalimentacion(actual.problema, problemaId);
    setPulsando(problemaId);
    setTimeout(() => setPulsando(null), 500);

    if (r.ok) {
      cerrar(actual.id, intentos === 0, r.texto, true);
      return;
    }

    /* Falla: se avisa y se le deja UNA oportunidad más antes de la línea. */
    setAviso(r);
    setEfecto("fallo");
    setTimeout(() => setEfecto(null), 420);
    const siguienteIntento = intentos + 1;
    setIntentos(siguienteIntento);
    if (siguienteIntento >= 2) cerrar(actual.id, false, r.texto, false);
  };

  /* El titular cruzó la línea sin clasificar. */
  const archivar = () => {
    if (!actual) return;
    cerrar(actual.id, false, textoArchivado(actual.problema), false);
  };

  const reiniciar = () => {
    const o = barajarDistinto(TITULARES, ordenPrevio.current, (t) => t.id);
    ordenPrevio.current = o;
    setOrden(o);
    setI(0); setPrimeros({}); setIntentos(0); setAviso(null);
    setEfecto(null); setHistorial([]);
    inicio.current = Date.now();
  };

  return (
    <div>
      <style>{CSS}</style>

      {/* ───────────────────────── la consola ───────────────────────── */}
      <div
        ref={pista}
        className="fae-dv-consola"
        style={{
          position: "relative", overflow: "hidden",
          height: "clamp(230px, 34vh, 300px)", borderRadius: "18px",
          background: `linear-gradient(160deg, ${FAE.navy}55, rgba(10,20,34,0.75))`,
          border: "1px solid rgba(248,249,250,0.14)", marginBottom: "12px",
        }}
      >
        {/* La línea de archivo. */}
        <div
          aria-hidden="true"
          style={{
            position: "absolute", left: 0, right: 0, bottom: `${LINEA_ARCHIVO}%`,
            borderTop: `2px dashed ${FAE.coral}`, opacity: 0.75,
          }}
        />
        <span
          aria-hidden="true"
          style={{
            position: "absolute", right: "10px", bottom: `calc(${LINEA_ARCHIVO}% + 6px)`,
            display: "inline-flex", alignItems: "center", gap: "5px",
            fontFamily: "Sora, sans-serif", fontSize: "10px", fontWeight: 700,
            letterSpacing: "0.12em", color: FAE.coral,
          }}
        >
          <FolderClosed size={11} /> ARCHIVO
        </span>

        {actual ? (
          <div
            key={actual.id}
            onAnimationEnd={(e) => { if (e.animationName === "fae-dv-caer") archivar(); }}
            className={efecto === "acierto" ? "fae-dv-acierto" : efecto === "fallo" ? "fae-dv-rebote" : undefined}
            style={{
              position: "absolute", top: "10px", left: "50%",
              width: "min(84%, 420px)", marginLeft: "min(-42%, -210px)",
              padding: "13px 15px", borderRadius: "12px",
              background: "#28313F",
              border: `1px solid ${efecto === "fallo" ? FAE.coral : efecto === "acierto" ? FAE.teal : "rgba(248,249,250,0.22)"}`,
              color: FAE.text, fontSize: "13.5px", lineHeight: 1.45,
              /* La caída es la animación, y su fin es el archivado. */
              "--fae-dv-recorrido": `${recorrido}px`,
              animation:
                efecto === "acierto" || recorrido === 0
                  ? undefined
                  : `fae-dv-caer ${SEGUNDOS_CAIDA}s linear forwards`,
            }}
          >
            {actual.texto}
          </div>
        ) : (
          <div className="fae-dv-entrar" style={{ position: "absolute", inset: 0, display: "grid", placeItems: "center" }}>
            <p style={{ fontFamily: "Sora, sans-serif", fontWeight: 700, fontSize: "clamp(26px, 5vw, 36px)", color: FAE.text, margin: 0, fontVariantNumeric: "tabular-nums" }}>
              {aciertos} de {TITULARES.length}
            </p>
          </div>
        )}
      </div>

      {/* El aviso de la jugada. */}
      <div style={{ minHeight: "44px", marginBottom: "12px" }} aria-live="polite">
        {aviso && (
          <p
            className="fae-dv-entrar"
            style={{
              fontSize: "13.5px", lineHeight: 1.55, margin: 0,
              padding: "10px 13px", borderRadius: "12px",
              background: aviso.ok ? "rgba(42,157,143,0.10)" : "rgba(231,111,81,0.10)",
              border: `1px solid ${aviso.ok ? FAE.teal : FAE.coral}55`,
              color: "rgba(248,249,250,0.88)",
            }}
          >
            {aviso.texto}
          </p>
        )}
      </div>

      {/* ───────────────────────── los ocho botones ───────────────────────── */}
      {!terminado ? (
        <>
          <p style={{ fontSize: "12.5px", color: "rgba(248,249,250,0.5)", margin: "0 0 9px" }}>
            Titular {i + 1} de {TITULARES.length}
            {intentos === 1 && <span style={{ color: FAE.coral }}> · te queda un intento</span>}
          </p>
          {/*
            En móvil son dos columnas: ocho botones en fila serían ilegibles, y
            con el pulgar hay que poder acertar sin apuntar.
          */}
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(148px, 1fr))", gap: "8px" }}>
            {PROBLEMAS.map((p) => (
              <button
                key={p.id}
                type="button"
                onClick={() => clasificar(p.id)}
                className={pulsando === p.id ? "fae-dv-pulso" : undefined}
                aria-label={`Clasificar como ${p.nombre}`}
                style={{
                  display: "flex", alignItems: "center", gap: "8px",
                  padding: "12px 13px", borderRadius: "13px", cursor: "pointer",
                  background: "rgba(248,249,250,0.04)",
                  border: "1px solid rgba(248,249,250,0.14)",
                  color: FAE.text, fontFamily: "Sora, sans-serif",
                  fontSize: "12.5px", fontWeight: 600, textAlign: "left", lineHeight: 1.25,
                }}
              >
                <span aria-hidden="true" style={{ fontSize: "15px", flexShrink: 0 }}>{p.icono}</span>
                {p.boton}
              </button>
            ))}
          </div>
        </>
      ) : (
        <div className="fae-dv-entrar">
          <p style={{ fontFamily: "Sora, sans-serif", fontWeight: 700, fontSize: "26px", color: FAE.text, margin: "0 0 6px", fontVariantNumeric: "tabular-nums" }}>
            {pct}%
          </p>
          <p style={{ fontSize: "13.5px", lineHeight: 1.6, color: "rgba(248,249,250,0.62)", margin: "0 0 14px" }}>
            {aciertos} de {TITULARES.length} clasificados bien a la primera. Cuenta el primer intento: acertar
            después de fallar enseña igual, pero no es lo mismo que reconocerlo de entrada.
          </p>

          <div style={{ display: "flex", flexDirection: "column", gap: "7px", marginBottom: "16px" }}>
            {historial.filter((h) => !h.ok).map((h, k) => (
              <p key={k} style={{ fontSize: "12.5px", lineHeight: 1.5, color: "rgba(248,249,250,0.62)", margin: 0, paddingLeft: "11px", borderLeft: `2px solid ${FAE.coral}` }}>
                {h.texto}
              </p>
            ))}
          </div>

          <button
            type="button"
            onClick={reiniciar}
            style={{
              display: "inline-flex", alignItems: "center", gap: "8px",
              fontFamily: "Sora, sans-serif", fontSize: "13px", fontWeight: 600,
              padding: "10px 16px", borderRadius: "999px", cursor: "pointer",
              background: "transparent", border: "1px solid rgba(248,249,250,0.22)",
              color: "rgba(248,249,250,0.7)",
            }}
          >
            <RotateCcw size={14} /> Otra ronda
          </button>
        </div>
      )}
    </div>
  );
}
