import { useEffect, useMemo, useRef, useState } from "react";
import { RotateCcw } from "lucide-react";
import { FAE } from "../../theme.js";
import { EVENTO_ARQUITECTO, BANCO_ARQUITECTO, RANURAS } from "../../data/icebergActividades.js";
import { barajar } from "../../utils/barajar.js";

/*
 * "Arquitecto de las profundidades" — el peldaño Crear de Bloom, y la más dura
 * de las cuatro a propósito.
 *
 * No se clasifica un iceberg ya armado: se arma uno desde cero. Solo se da la
 * punta —el evento— y hay que encontrar las tres piezas que van debajo dentro
 * de un banco con quince fragmentos, doce de los cuales sobran.
 *
 * EL RUIDO ES DE DOS CLASES Y LAS DOS HACEN FALTA. Unos fragmentos son del caso
 * pero de otro nivel del que aparentan; otros son de casos distintos del sitio.
 * Con solo los primeros bastaría con acertar el nivel; con los segundos hay que
 * preguntarse además si la frase habla siquiera de este equipo.
 *
 * PUNTUACIÓN: 1.33 por pieza bien puesta —tres hacen 4, que es el 100%— y un
 * descuento pequeño por cada intento fallido, con suelo en cero. Es el mismo
 * criterio del mapa causal de Pensamiento Sistémico: equivocarse cuesta algo,
 * pero no deja el resultado en negativo.
 */

const POR_PIEZA = 1.33;
const CASTIGO = 0.35;
const MAXIMO = 4;

const CSS = `
@keyframes fae-ap-fusion { 0% { opacity: 0; transform: scale(.9); } 60% { opacity: 1; } 100% { opacity: 1; transform: scale(1); } }
.fae-ap-fusion { animation: fae-ap-fusion 620ms cubic-bezier(.3,.9,.4,1) both; }
@keyframes fae-ap-rechazo { 0%,100% { transform: translateX(0); } 25% { transform: translateX(-7px); } 75% { transform: translateX(7px); } }
.fae-ap-rechazo { animation: fae-ap-rechazo 400ms ease-in-out; }
@media (prefers-reduced-motion: reduce) { .fae-ap-fusion, .fae-ap-rechazo { animation: none !important; } }
`;

export default function ArquitectoProfundidades({ onCompletar }) {
  const [semilla, setSemilla] = useState(0);
  const banco = useMemo(() => barajar(BANCO_ARQUITECTO), [semilla]);
  const [colocadas, setColocadas] = useState({});   // nivel -> pieza
  const [elegida, setElegida] = useState(null);
  const [rechazada, setRechazada] = useState(null);
  const [fallos, setFallos] = useState(0);
  const inicio = useRef(Date.now());

  /*
   * ═══════════ EL DETALLE POR ÍTEM ═══════════
   *
   * LA UNIDAD ES LA RANURA, como en "Arma el grupo lógico": el juego es llenar
   * tres huecos del iceberg, y de cada uno interesa si lo acertó de una, cuánto
   * le costó y qué pieza puso mal antes.
   *
   * SIN PREFIJO: hay un solo caso —Blockbuster— y las tres ranuras (Patrón,
   * Estructura, Modelo mental) no se repiten. Las quince piezas también tienen
   * id único. Comprobado en detalle-ids.test.mjs.
   *
   * `respuesta` es la primera pieza equivocada de esa ranura. Los señuelos se
   * distinguen solos: sus ids llevan -t o -x.
   */
  const detalle = useRef([]);
  const intentosRanura = useRef({});
  const primerFallo = useRef({});

  const usadas = new Set(Object.values(colocadas).map((p) => p.id));
  const disponibles = banco.filter((p) => !usadas.has(p.id));
  const completo = RANURAS.every((r) => colocadas[r]);

  const bruto = Math.max(0, Object.keys(colocadas).length * POR_PIEZA - fallos * CASTIGO);
  const pct = Math.max(0, Math.min(100, Math.round((bruto / MAXIMO) * 100)));

  useEffect(() => {
    if (completo) onCompletar?.(pct, Date.now() - inicio.current, detalle.current);
  }, [completo]);

  const poner = (nivel) => {
    if (!elegida || colocadas[nivel]) return;
    const pieza = banco.find((p) => p.id === elegida);
    const intentos = (intentosRanura.current[nivel] ?? 0) + 1;
    intentosRanura.current[nivel] = intentos;

    if (pieza.correcta && pieza.nivel === nivel) {
      detalle.current.push({
        item: nivel,
        ok: intentos === 1,
        intentos,
        respuesta: primerFallo.current[nivel] ?? null,
        orden: detalle.current.length + 1,
      });
      setColocadas((c) => ({ ...c, [nivel]: pieza }));
      setElegida(null);
    } else {
      if (!primerFallo.current[nivel]) primerFallo.current[nivel] = pieza.id;
      setFallos((f) => f + 1);
      setRechazada(pieza.id);
      setTimeout(() => setRechazada(null), 420);
    }
  };

  const reiniciar = () => {
    setColocadas({}); setElegida(null); setFallos(0); setSemilla((s) => s + 1);
    detalle.current = [];
    intentosRanura.current = {};
    primerFallo.current = {};
    inicio.current = Date.now();
  };

  return (
    <div>
      <style>{CSS}</style>

      {/* --------------------------- el iceberg --------------------------- */}
      <div style={{ borderRadius: "18px", background: "#0A1422", border: "1px solid rgba(248,249,250,0.14)", padding: "clamp(14px, 2.2vw, 20px)", marginBottom: "14px" }}>
        <p style={{ fontFamily: "Sora, sans-serif", fontSize: "11.5px", fontWeight: 700, letterSpacing: "0.12em", color: FAE.teal, margin: "0 0 8px" }}>
          LA PUNTA, QUE YA SE VE
        </p>
        <p style={{ fontSize: "14.5px", lineHeight: 1.6, color: FAE.text, margin: "0 0 18px" }}>
          {EVENTO_ARQUITECTO}
        </p>

        {/* Las tres ranuras, hundiéndose. Se ensanchan como un iceberg de verdad. */}
        <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
          {RANURAS.map((nivel, k) => {
            const puesta = colocadas[nivel];
            return (
              <button
                key={nivel}
                type="button"
                onClick={() => poner(nivel)}
                disabled={!!puesta}
                style={{
                  textAlign: "left", cursor: puesta ? "default" : elegida ? "pointer" : "default",
                  width: `${100 - (RANURAS.length - 1 - k) * 6}%`, alignSelf: "center",
                  padding: "13px 15px", borderRadius: "14px",
                  background: puesta ? "rgba(42,157,143,0.13)" : elegida ? "rgba(42,157,143,0.06)" : "rgba(248,249,250,0.03)",
                  border: puesta
                    ? `1px solid ${FAE.teal}`
                    : `1px dashed ${elegida ? FAE.teal : "rgba(248,249,250,0.22)"}`,
                  color: FAE.text,
                }}
              >
                <p style={{ fontFamily: "Sora, sans-serif", fontSize: "11px", fontWeight: 700, letterSpacing: "0.08em", color: puesta ? FAE.teal : "rgba(248,249,250,0.4)", margin: "0 0 4px" }}>
                  {nivel.toUpperCase()}
                </p>
                {puesta ? (
                  <p className="fae-ap-fusion" style={{ fontSize: "13.5px", lineHeight: 1.5, color: "rgba(248,249,250,0.88)", margin: 0 }}>
                    {puesta.texto}
                  </p>
                ) : (
                  <p style={{ fontSize: "13px", color: "rgba(248,249,250,0.32)", margin: 0 }}>
                    {elegida ? "Toca aquí para colocar la pieza" : "Ranura vacía"}
                  </p>
                )}
              </button>
            );
          })}
        </div>
      </div>

      {/* ----------------------------- el banco ----------------------------- */}
      {!completo ? (
        <div style={{ borderRadius: "18px", background: "rgba(248,249,250,0.04)", border: "1px solid rgba(248,249,250,0.12)", padding: "clamp(14px, 2.2vw, 20px)" }}>
          <p style={{ fontFamily: "Sora, sans-serif", fontSize: "11.5px", fontWeight: 700, letterSpacing: "0.12em", color: FAE.teal, margin: "0 0 4px" }}>
            FRAGMENTOS A LA DERIVA
          </p>
          <p style={{ fontSize: "12.5px", color: "rgba(248,249,250,0.45)", margin: "0 0 14px" }}>
            Solo tres son de este caso y de este iceberg. Toca uno y luego su ranura.
          </p>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(230px, 1fr))", gap: "8px" }}>
            {disponibles.map((p) => (
              <button
                key={p.id}
                type="button"
                className={rechazada === p.id ? "fae-ap-rechazo" : undefined}
                onClick={() => setElegida(elegida === p.id ? null : p.id)}
                style={{
                  textAlign: "left", cursor: "pointer", padding: "11px 13px", borderRadius: "12px",
                  background: elegida === p.id ? "rgba(42,157,143,0.14)" : "rgba(248,249,250,0.04)",
                  border: `1px solid ${rechazada === p.id ? FAE.coral : elegida === p.id ? FAE.teal : "rgba(248,249,250,0.14)"}`,
                  color: FAE.text, fontSize: "13px", lineHeight: 1.5, fontFamily: "Inter, sans-serif",
                }}
              >
                {p.texto}
              </button>
            ))}
          </div>
          {fallos > 0 && (
            <p style={{ fontSize: "12px", color: FAE.ambar, margin: "12px 0 0" }}>
              {fallos} {fallos === 1 ? "pieza rechazada" : "piezas rechazadas"}. Cada una descuenta un poco.
            </p>
          )}
        </div>
      ) : (
        /* ------------------------------ cierre ------------------------------ */
        <div style={{ borderRadius: "18px", background: "rgba(42,157,143,0.07)", border: `1px solid ${FAE.teal}`, padding: "clamp(18px, 2.6vw, 26px)" }}>
          <p style={{ fontFamily: "Sora, sans-serif", fontSize: "12px", fontWeight: 700, letterSpacing: "0.12em", color: FAE.teal, margin: "0 0 8px" }}>
            ICEBERG COMPLETO
          </p>
          <p style={{ fontFamily: "Sora, sans-serif", fontWeight: 700, fontSize: "clamp(28px, 5vw, 40px)", margin: "0 0 4px", color: FAE.text, fontVariantNumeric: "tabular-nums" }}>
            {pct}%
          </p>
          <p style={{ fontSize: "13.5px", lineHeight: 1.6, color: "rgba(248,249,250,0.6)", margin: "0 0 18px" }}>
            Tres piezas colocadas{fallos > 0 ? `, con ${fallos} ${fallos === 1 ? "rechazo" : "rechazos"} por el camino` : ", sin un solo rechazo"}.
            Lo difícil no era el nivel: era distinguir lo que hablaba de este equipo de lo que venía de otro caso.
          </p>
          <button type="button" onClick={reiniciar}
            style={{ display: "inline-flex", alignItems: "center", gap: "8px", fontFamily: "Sora, sans-serif", fontSize: "13px", fontWeight: 600, padding: "9px 15px", borderRadius: "999px", cursor: "pointer", background: "transparent", border: "1px solid rgba(248,249,250,0.22)", color: "rgba(248,249,250,0.7)" }}>
            <RotateCcw size={14} /> Construir otro
          </button>
        </div>
      )}
    </div>
  );
}
