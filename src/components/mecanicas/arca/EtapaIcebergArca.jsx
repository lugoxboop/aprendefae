import { useRef, useState } from "react";
import { FAE } from "../../../theme.js";
import { PROBLEMA_CENTRAL, BANCO_ARCA, NIVELES } from "../../../data/arca.js";
import { barajarDistinto } from "../../../utils/barajar.js";

/*
 * Etapa 2 — "Arma el iceberg de Absalón". La más pesada de las cuatro (35%).
 *
 * QUÉ LA SEPARA DE LA ETAPA 1. Allí se clasifican frases sueltas: cada una trae
 * su nivel escrito en la forma. Aquí hay que sintetizar el caso ENTERO en un
 * solo iceberg que explique un problema concreto, y para eso no basta con saber
 * qué es una estructura: hay que decidir cuál de las seis estructuras del caso
 * es la que hace que el barco no se termine.
 *
 * ═══════════════ CÓMO SE CALIFICA, Y POR QUÉ ASÍ ═══════════════
 *
 * Veinticuatro opciones, todas del caso, para cuatro ranuras. La consigna pedía
 * "presencia de elementos clave, no coincidencia exacta". Con un banco cerrado
 * no hay texto libre que analizar, así que el matiz está codificado en el banco
 * en tres grados por nivel:
 *
 *   completa (25 pts del total de la etapa)
 *       Nombra el mecanismo. "Hay seis gerencias Y NINGUNA puede dejar
 *       construir a Noé" — explica el problema central.
 *
 *   parcial (10 pts)
 *       Es cierta, es de ese nivel, y se queda en el síntoma. "El proyecto
 *       tiene una gerencia para cada asunto" — describe, no explica. Vale
 *       menos que acertar y bastante más que fallar, porque el estudiante
 *       está mirando la profundidad correcta.
 *
 *   distractor (0 pts)
 *       El resto. Unos son de otro nivel del iceberg —y al corregir se dice
 *       cuál era, que es donde está el aprendizaje— y otros son ciertos pero
 *       no explican por qué el barco no se termina.
 *
 * Máximo 4 × 25 = 100. Un iceberg entero de opciones parciales da 40: se nota
 * que se entendió la forma sin haber llegado al fondo, que es exactamente el
 * diagnóstico que se quiere poder dar.
 *
 * SE PUNTÚA AL CONFIRMAR, no al colocar: hasta entonces se puede mover todo.
 * Sintetizar es rehacer, y castigar el primer intento aquí sería castigar
 * pensar.
 */

const PUNTOS = { completa: 25, parcial: 10, distractor: 0 };

const CSS = `
@keyframes fae-ia-encaje { 0% { opacity: 0; transform: scale(.94); } 60% { opacity: 1; } 100% { opacity: 1; transform: scale(1); } }
.fae-ia-encaje { animation: fae-ia-encaje 480ms cubic-bezier(.3,.9,.4,1) both; }
@keyframes fae-ia-brote { from { opacity: 0; transform: translateY(8px); } to { opacity: 1; transform: none; } }
.fae-ia-brote { animation: fae-ia-brote 460ms ease-out both; }
@media (prefers-reduced-motion: reduce) { .fae-ia-encaje, .fae-ia-brote { animation: none !important; } }
`;

/* Puntos de una ranura, según lo que se puso en ella. */
export function puntosDeRanura(pieza, nivel) {
  if (!pieza || pieza.nivel !== nivel) return 0;
  return PUNTOS[pieza.valor] ?? 0;
}

export function puntuarIceberg(colocadas) {
  return NIVELES.reduce((s, nivel) => s + puntosDeRanura(colocadas[nivel], nivel), 0);
}

export default function EtapaIcebergArca({ onTerminar }) {
  const ordenPrevio = useRef(null);
  const [banco, setBanco] = useState(() => {
    const o = barajarDistinto(BANCO_ARCA, null, (p) => p.id);
    ordenPrevio.current = o;
    return o;
  });
  const [colocadas, setColocadas] = useState({});  // nivel -> pieza
  const [elegida, setElegida] = useState(null);
  const [confirmado, setConfirmado] = useState(false);

  const usadas = new Set(Object.values(colocadas).map((p) => p.id));
  const disponibles = banco.filter((p) => !usadas.has(p.id));
  const lleno = NIVELES.every((n) => colocadas[n]);
  const pct = puntuarIceberg(colocadas);

  const poner = (nivel) => {
    if (confirmado) return;
    if (!elegida) {
      /* Tocar una ranura llena la vacía: se puede rehacer sin reiniciar. */
      if (colocadas[nivel]) setColocadas((c) => ({ ...c, [nivel]: undefined }));
      return;
    }
    const pieza = banco.find((p) => p.id === elegida);
    setColocadas((c) => ({ ...c, [nivel]: pieza }));
    setElegida(null);
  };

  const confirmar = () => {
    if (!lleno || confirmado) return;
    setConfirmado(true);
    /*
     * La unidad es la RANURA del iceberg, y `respuesta` es la pieza que dejó
     * en ella. Aquí no hay rebote: se colocan las cuatro y se confirma, así que
     * `intentos` es 1 y lo que informa es QUÉ pieza eligió para cada nivel.
     *
     * `ok` solo con la pieza completa: una parcial puntúa 10 de 25 —el motor
     * sí la premia a medias— pero como acierto no lo es.
     */
    const filas = NIVELES.map((nivel, k) => {
      const p = colocadas[nivel];
      return {
        item: nivel,
        ok: !!p && p.nivel === nivel && p.valor === "completa",
        intentos: 1,
        respuesta: p?.id ?? null,
        orden: k + 1,
      };
    });
    onTerminar?.(puntuarIceberg(colocadas), filas);
  };

  return (
    <div>
      <style>{CSS}</style>

      {/* -------------------------- el problema -------------------------- */}
      <div style={{ borderRadius: "16px", background: "rgba(231,111,81,0.09)", border: `1px solid ${FAE.coral}55`, padding: "14px 16px", marginBottom: "16px" }}>
        <p style={{ fontFamily: "Sora, sans-serif", fontSize: "10.5px", fontWeight: 700, letterSpacing: "0.12em", color: FAE.coral, margin: "0 0 6px" }}>
          EL PROBLEMA A EXPLICAR
        </p>
        <p style={{ fontSize: "15px", lineHeight: 1.55, color: FAE.text, margin: 0, fontWeight: 600 }}>
          {PROBLEMA_CENTRAL}
        </p>
      </div>

      <p style={{ fontSize: "14px", lineHeight: 1.6, color: "rgba(248,249,250,0.7)", margin: "0 0 16px" }}>
        No se trata de clasificar frases: se trata de armar UN iceberg que explique eso de arriba.
        Veinticuatro piezas del caso para cuatro huecos. Toca una pieza y luego su nivel; toca un nivel
        lleno para vaciarlo.
      </p>

      {/* --------------------------- el iceberg --------------------------- */}
      <div style={{ borderRadius: "18px", background: "#0A1422", border: "1px solid rgba(248,249,250,0.14)", padding: "clamp(13px, 2vw, 18px)", marginBottom: "16px" }}>
        <div style={{ display: "flex", flexDirection: "column", gap: "9px" }}>
          {NIVELES.map((nivel, k) => {
            const pieza = colocadas[nivel];
            const puntos = confirmado ? puntosDeRanura(pieza, nivel) : 0;
            const color = !confirmado
              ? FAE.teal
              : puntos === PUNTOS.completa ? FAE.teal : puntos > 0 ? FAE.ambar : FAE.coral;
            return (
              <button
                key={nivel}
                type="button"
                onClick={() => poner(nivel)}
                disabled={confirmado}
                className={pieza ? "fae-ia-encaje" : undefined}
                style={{
                  textAlign: "left", cursor: confirmado ? "default" : "pointer",
                  /* Se ensancha al bajar, como un iceberg de verdad. */
                  width: `${82 + k * 6}%`, alignSelf: "center",
                  padding: "12px 14px", borderRadius: "13px",
                  background: pieza ? `${color}1a` : elegida ? "rgba(42,157,143,0.06)" : "rgba(248,249,250,0.03)",
                  border: pieza
                    ? `1px solid ${color}`
                    : `1px dashed ${elegida ? FAE.teal : "rgba(248,249,250,0.2)"}`,
                  color: FAE.text,
                }}
              >
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", gap: "10px" }}>
                  <span style={{ fontFamily: "Sora, sans-serif", fontSize: "10.5px", fontWeight: 700, letterSpacing: "0.09em", color: pieza ? color : "rgba(248,249,250,0.4)" }}>
                    {nivel.toUpperCase()}
                  </span>
                  {confirmado && (
                    <span style={{ fontFamily: "Sora, sans-serif", fontSize: "11.5px", fontWeight: 700, color, fontVariantNumeric: "tabular-nums" }}>
                      {puntos} / {PUNTOS.completa}
                    </span>
                  )}
                </div>
                <p style={{ fontSize: "13.5px", lineHeight: 1.5, color: pieza ? "rgba(248,249,250,0.9)" : "rgba(248,249,250,0.3)", margin: "6px 0 0" }}>
                  {pieza ? pieza.texto : "—"}
                </p>
                {confirmado && pieza && puntos < PUNTOS.completa && (
                  <p className="fae-ia-brote" style={{ fontSize: "12px", lineHeight: 1.5, color: "rgba(248,249,250,0.55)", margin: "8px 0 0" }}>
                    {pieza.nivelReal && pieza.nivelReal !== nivel
                      ? `Es cierto, pero es ${pieza.nivelReal.toLowerCase()}. ${pieza.nota ?? ""}`
                      : puntos > 0
                        ? "Vas a la profundidad correcta, pero describe el síntoma en vez de nombrar el mecanismo."
                        : (pieza.nota ?? "Es del caso, pero no explica por qué el barco no se termina.")}
                  </p>
                )}
              </button>
            );
          })}
        </div>
      </div>

      {/* ----------------------------- el banco ----------------------------- */}
      {!confirmado ? (
        <>
          <p style={{ fontFamily: "Sora, sans-serif", fontSize: "11px", fontWeight: 700, letterSpacing: "0.12em", color: FAE.teal, margin: "0 0 10px" }}>
            LAS PIEZAS DEL CASO · {disponibles.length} SIN USAR
          </p>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(240px, 1fr))", gap: "8px", marginBottom: "16px" }}>
            {disponibles.map((p) => (
              <button
                key={p.id}
                type="button"
                onClick={() => setElegida(elegida === p.id ? null : p.id)}
                style={{
                  textAlign: "left", cursor: "pointer", padding: "10px 12px", borderRadius: "11px",
                  background: elegida === p.id ? "rgba(42,157,143,0.14)" : "rgba(248,249,250,0.035)",
                  border: `1px solid ${elegida === p.id ? FAE.teal : "rgba(248,249,250,0.12)"}`,
                  color: FAE.text, fontSize: "12.5px", lineHeight: 1.45, fontFamily: "Inter, sans-serif",
                }}
              >
                {p.texto}
              </button>
            ))}
          </div>

          <button
            type="button"
            onClick={confirmar}
            disabled={!lleno}
            style={{
              width: "100%", padding: "13px", borderRadius: "14px",
              cursor: lleno ? "pointer" : "default",
              background: lleno ? FAE.teal : "rgba(248,249,250,0.05)",
              border: `1px solid ${lleno ? FAE.teal : "rgba(248,249,250,0.14)"}`,
              color: lleno ? "#08111d" : "rgba(248,249,250,0.35)",
              fontFamily: "Sora, sans-serif", fontSize: "14px", fontWeight: 700,
            }}
          >
            {lleno ? "Confirmar el iceberg" : `Faltan ${NIVELES.filter((n) => !colocadas[n]).length} niveles`}
          </button>
        </>
      ) : (
        <div className="fae-ia-brote">
          <p style={{ fontFamily: "Sora, sans-serif", fontWeight: 700, fontSize: "26px", color: FAE.text, margin: "0 0 6px", fontVariantNumeric: "tabular-nums" }}>
            {pct}%
          </p>
          <p style={{ fontSize: "13.5px", lineHeight: 1.6, color: "rgba(248,249,250,0.62)", margin: "0 0 14px" }}>
            {pct === 100
              ? "Los cuatro niveles nombran el mecanismo, no el síntoma. Ese es el iceberg que explica por qué 1200 personas no terminan un barco."
              : "Un iceberg explica cuando cada nivel dice POR QUÉ, no solo QUÉ. Mira arriba dónde se quedó en la descripción."}
          </p>
          {/*
            No hay "rehacer" una vez confirmado, y es a propósito: reintentar
            aquí hasta acertar convertiría la síntesis en un juego de probar
            piezas. Se puede volver a empezar el desafío entero desde el final.
          */}
        </div>
      )}
    </div>
  );
}
