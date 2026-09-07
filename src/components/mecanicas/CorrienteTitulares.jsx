import { useEffect, useRef, useState } from "react";
import { RotateCcw, ChevronRight } from "lucide-react";
import { FAE } from "../../theme.js";
import {
  OBJETIVO_CORRIENTE, CATEGORIAS, BANCO_CORRIENTE, POR_CATEGORIA, CARTAS_POR_TANDA,
  retroCorriente,
} from "../../data/juegosPolitica2.js";
import { barajar } from "../../utils/barajar.js";

/*
 * ACTIVIDAD 5 — "Corriente de titulares".
 *
 * Juego evaluativo. Dieciocho enunciados cruzan una cinta y hay que clasificar
 * cada uno en su categoría antes de que salga por la derecha. La cinta acelera.
 *
 * REPITE LA MISMA PREGUNTA DIECIOCHO VECES, Y ESO ES LA TÉCNICA. Es práctica
 * intercalada: lo que se entrena no es reconocer un enunciado concreto sino
 * tener la regla —qué separa una Medida de una Meta— disponible sin pensarlo.
 * Variar el tipo de pregunta aquí destruiría justo el efecto que se busca.
 *
 * ─────────────── EL RELOJ LO LLEVA LA ANIMACIÓN ───────────────
 *
 * El recorrido es una animación CSS y la salida por el borde se dispara con su
 * `animationend`, no con un setTimeout. Si el estudiante cambia de pestaña, la
 * animación se detiene y la carta NO se pierde: el dibujo y el reloj son el
 * mismo, así que no pueden discrepar.
 *
 * ─────────────── ESTRATEGIA SOLO TIENE CUATRO ───────────────
 *
 * El banco reparte tres por categoría salvo en Estrategia, donde el universo
 * real de ramas de política son cuatro: fiscal, monetaria, comercial y
 * cambiaria. Se sacan tres de cuatro. Inventar una quinta rama para que la
 * lista quedara pareja enseñaría algo que no existe.
 *
 * ─────────────── PUNTUACIÓN ───────────────
 *
 *   pct = aciertos / 18 × 100
 *
 * Sin porcentaje por carta escrito a mano: 18 × 5,5% suma 99 y el 100% sería
 * inalcanzable. Cuenta el PRIMER intento; una carta corregida en el reintento
 * muestra su explicación pero no puntúa.
 */

/* Calibración de la cinta. Los dos son puntos de ajuste, no verdades. */
const SEGUNDOS_BASE = 9;
const ACELERA_CADA = 4;        // cartas clasificadas entre subida y subida
const RECORTE_POR_ESCALON = 0.8;
const SEGUNDOS_MINIMO = 3.5;
/* Al reintentar, la carta vuelve con menos recorrido por delante. */
const FACTOR_REINTENTO = 0.55;

const duracion = (resueltas) =>
  Math.max(SEGUNDOS_MINIMO, SEGUNDOS_BASE - Math.floor(resueltas / ACELERA_CADA) * RECORTE_POR_ESCALON);

const CSS = `
@keyframes fae-ct-cinta { from { transform: translateX(-8%); } to { transform: translateX(108%); } }
@keyframes fae-ct-veta { from { background-position: 0 0; } to { background-position: 44px 0; } }
.fae-ct-veta { animation: fae-ct-veta 1.4s linear infinite; }
@keyframes fae-ct-acierto { 0% { opacity: 1; transform: scale(1); } 100% { opacity: 0; transform: scale(1.1); } }
.fae-ct-acierto { animation: fae-ct-acierto 380ms ease-out forwards; }
@keyframes fae-ct-rechazo { 0%,100% { transform: translateY(0); } 25% { transform: translateY(-7px); } 75% { transform: translateY(7px); } }
.fae-ct-rechazo { animation: fae-ct-rechazo 380ms ease-in-out; }
@keyframes fae-ct-flash { 0% { background: rgba(42,157,143,0.35); } 100% { background: rgba(248,249,250,0.04); } }
.fae-ct-flash { animation: fae-ct-flash 560ms ease-out; }
@keyframes fae-ct-entrar { from { opacity: 0; transform: translateY(8px); } to { opacity: 1; transform: none; } }
.fae-ct-entrar { animation: fae-ct-entrar 380ms ease-out both; }
@media (prefers-reduced-motion: reduce) {
  .fae-ct-veta, .fae-ct-acierto, .fae-ct-rechazo, .fae-ct-flash, .fae-ct-entrar { animation: none !important; }
  .fae-ct-carta { animation: none !important; transform: none !important; }
}
`;

/* Tres por categoría, o todas las que haya si son menos. */
function sortearTanda() {
  const salida = CATEGORIAS.flatMap((c) =>
    barajar(BANCO_CORRIENTE.filter((x) => x.categoria === c.id)).slice(0, POR_CATEGORIA)
  );
  return barajar(salida);
}

export default function CorrienteTitulares({ onCompletar }) {
  const [empezado, setEmpezado] = useState(false);
  const [tanda, setTanda] = useState(() => sortearTanda());
  const [i, setI] = useState(0);
  const [aciertos, setAciertos] = useState(0);
  const [reintento, setReintento] = useState(false);   // la carta actual ya falló
  const [aviso, setAviso] = useState(null);
  const [efecto, setEfecto] = useState(null);          // "acierto" | "fallo"
  const [flash, setFlash] = useState(null);            // id de contenedor que destella
  const [fallos, setFallos] = useState([]);
  const inicio = useRef(Date.now());

  const actual = tanda[i];
  const terminado = i >= tanda.length;
  const pct = Math.round((aciertos / tanda.length) * 100);

  useEffect(() => {
    if (terminado && empezado) onCompletar?.(pct, Date.now() - inicio.current);
  }, [terminado, empezado]);

  const cerrar = (texto, ok, categoriaReal) => {
    if (!ok) setFallos((f) => [...f, { texto: actual.texto, real: categoriaReal }]);
    setAviso({ ok, texto });
    setEfecto(ok ? "acierto" : null);
    setReintento(false);
    setTimeout(() => { setEfecto(null); setI((n) => n + 1); }, ok ? 390 : 240);
  };

  const clasificar = (categoriaId) => {
    if (!actual || efecto === "acierto") return;
    const ok = actual.categoria === categoriaId;
    const texto = retroCorriente(actual.categoria, categoriaId);

    setFlash(categoriaId);
    setTimeout(() => setFlash(null), 580);

    if (ok) {
      /* Solo puntúa si es el primer intento con esta carta. */
      if (!reintento) setAciertos((n) => n + 1);
      cerrar(texto, !reintento, actual.categoria);
      return;
    }

    if (!reintento) {
      /* Primer fallo: vuelve a la cinta con menos tiempo por delante. */
      setAviso({ ok: false, texto });
      setEfecto("fallo");
      setTimeout(() => setEfecto(null), 400);
      setReintento(true);
      return;
    }
    /* Segundo fallo: se cierra la carta. */
    cerrar(texto, false, actual.categoria);
  };

  /* Salió por el borde derecho sin clasificar. */
  const escapar = () => {
    if (!actual) return;
    const nombre = CATEGORIAS.find((c) => c.id === actual.categoria).nombre;
    cerrar(`⏱ Se te fue — era ${nombre}.`, false, actual.categoria);
  };

  const reiniciar = () => {
    setTanda(sortearTanda());
    setI(0); setAciertos(0); setReintento(false); setAviso(null);
    setEfecto(null); setFallos([]);
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
            {OBJETIVO_CORRIENTE}
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
            Encender la cinta <ChevronRight size={16} />
          </button>
        </div>
      </div>
    );
  }

  return (
    <div>
      <style>{CSS}</style>

      {/* ───────────────────────── la cinta ───────────────────────── */}
      <div
        style={{
          position: "relative", overflow: "hidden", height: "126px",
          borderRadius: "16px", marginBottom: "12px",
          background: `linear-gradient(160deg, ${FAE.navy}55, rgba(10,20,34,0.8))`,
          border: "1px solid rgba(248,249,250,0.14)",
        }}
      >
        {/* Las estrías de la banda, corriendo. */}
        <div
          aria-hidden="true"
          className="fae-ct-veta"
          style={{
            position: "absolute", left: 0, right: 0, bottom: "12px", height: "10px",
            backgroundImage: "repeating-linear-gradient(90deg, rgba(203,220,242,0.16) 0 3px, transparent 3px 22px)",
            backgroundSize: "44px 10px",
          }}
        />

        {actual ? (
          <div
            key={`${actual.id}-${reintento}`}
            className={`fae-ct-carta ${efecto === "acierto" ? "fae-ct-acierto" : efecto === "fallo" ? "fae-ct-rechazo" : ""}`}
            onAnimationEnd={(e) => { if (e.animationName === "fae-ct-cinta") escapar(); }}
            style={{
              position: "absolute", top: "22px", left: 0,
              width: "min(72%, 330px)",
              padding: "12px 14px", borderRadius: "12px",
              background: "#28313F",
              border: `1px solid ${efecto === "fallo" ? FAE.coral : "rgba(248,249,250,0.24)"}`,
              color: FAE.text, fontSize: "13px", lineHeight: 1.4,
              animation:
                efecto === "acierto"
                  ? undefined
                  : `fae-ct-cinta ${duracion(i) * (reintento ? FACTOR_REINTENTO : 1)}s linear forwards`,
            }}
          >
            {actual.texto}
          </div>
        ) : (
          <div className="fae-ct-entrar" style={{ position: "absolute", inset: 0, display: "grid", placeItems: "center" }}>
            <p style={{ fontFamily: "Sora, sans-serif", fontWeight: 700, fontSize: "clamp(24px, 5vw, 34px)", color: FAE.text, margin: 0, fontVariantNumeric: "tabular-nums" }}>
              {aciertos} de {tanda.length}
            </p>
          </div>
        )}
      </div>

      {/* El aviso de la jugada. Corto: esto va rápido. */}
      <div style={{ minHeight: "40px", marginBottom: "10px" }} aria-live="polite">
        {aviso && (
          <p
            className="fae-ct-entrar"
            style={{
              fontSize: "13px", lineHeight: 1.5, margin: 0,
              padding: "9px 12px", borderRadius: "11px",
              background: aviso.ok ? "rgba(42,157,143,0.10)" : "rgba(231,111,81,0.10)",
              border: `1px solid ${aviso.ok ? FAE.teal : FAE.coral}55`,
              color: "rgba(248,249,250,0.88)",
            }}
          >
            {aviso.texto}
          </p>
        )}
      </div>

      {/* ───────────────────────── los contenedores ───────────────────────── */}
      {!terminado ? (
        <>
          <p style={{ fontSize: "12.5px", color: "rgba(248,249,250,0.5)", margin: "0 0 9px" }}>
            Carta {i + 1} de {tanda.length}
            {reintento && <span style={{ color: FAE.coral }}> · un intento más, y va más rápido</span>}
          </p>
          {/*
            Seis contenedores. En móvil caen a dos columnas: seis en fila sobre
            375 px darían 55 px cada uno, ilegibles y difíciles de acertar con
            el pulgar mientras la carta corre.
          */}
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(150px, 1fr))", gap: "8px" }}>
            {CATEGORIAS.map((c) => (
              <button
                key={c.id}
                type="button"
                onClick={() => clasificar(c.id)}
                className={flash === c.id ? "fae-ct-flash" : undefined}
                aria-label={`Clasificar como ${c.nombre}`}
                style={{
                  padding: "14px 12px", borderRadius: "12px", cursor: "pointer",
                  background: "rgba(248,249,250,0.04)", border: "1px solid rgba(248,249,250,0.14)",
                  color: FAE.text, fontFamily: "Sora, sans-serif", fontSize: "13px", fontWeight: 700,
                }}
              >
                {c.nombre}
              </button>
            ))}
          </div>
        </>
      ) : (
        <div className="fae-ct-entrar">
          <p style={{ fontFamily: "Sora, sans-serif", fontWeight: 700, fontSize: "28px", color: FAE.text, margin: "0 0 6px", fontVariantNumeric: "tabular-nums" }}>
            {pct}%
          </p>
          <p style={{ fontSize: "13.5px", lineHeight: 1.6, color: "rgba(248,249,250,0.62)", margin: "0 0 14px" }}>
            {aciertos} de {tanda.length} a la primera. Las categorías vienen mezcladas a propósito: clasificar
            con el contexto cambiando a cada carta es más duro y se recuerda mejor.
          </p>

          {fallos.length > 0 && (
            <div style={{ display: "flex", flexDirection: "column", gap: "7px", marginBottom: "16px" }}>
              {fallos.map((f, k) => (
                <p key={k} style={{ fontSize: "12.5px", lineHeight: 1.5, color: "rgba(248,249,250,0.6)", margin: 0, paddingLeft: "11px", borderLeft: `2px solid ${FAE.coral}` }}>
                  «{f.texto}» — era {CATEGORIAS.find((c) => c.id === f.real).nombre}.
                </p>
              ))}
            </div>
          )}

          <button
            type="button"
            onClick={reiniciar}
            style={{ display: "inline-flex", alignItems: "center", gap: "8px", fontFamily: "Sora, sans-serif", fontSize: "13px", fontWeight: 600, padding: "10px 16px", borderRadius: "999px", cursor: "pointer", background: "transparent", border: "1px solid rgba(248,249,250,0.22)", color: "rgba(248,249,250,0.7)" }}
          >
            <RotateCcw size={14} /> Otra tanda
          </button>
        </div>
      )}
    </div>
  );
}
