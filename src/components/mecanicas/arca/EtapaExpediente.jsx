import { useRef, useState } from "react";
import { FileText, Check } from "lucide-react";
import { FAE } from "../../../theme.js";
import { CITAS_EXPEDIENTE, NIVELES } from "../../../data/arca.js";
import { barajarDistinto } from "../../../utils/barajar.js";

/*
 * Etapa 1 — "El expediente confidencial".
 *
 * Ocho citas literales del caso, selladas, que hay que archivar en su nivel del
 * iceberg. La carpeta se va llenando: cada nivel tiene su pestaña y se ve
 * cuántas piezas lleva.
 *
 * SE TOCA, NO SE ARRASTRA. El arrastre nativo no funciona en pantallas táctiles
 * sin una librería encima, y esto se ve sobre todo en el teléfono. Se elige la
 * cita y luego la pestaña, igual que en el radar.
 *
 * ORDEN ALEATORIO EN CADA INTENTO, y nunca dos veces el mismo. Regla ya fija
 * en todo el sitio desde que el radar dejaba acertar por posición.
 *
 * PUNTUACIÓN: 1/8 por cita bien archivada. Se puntúa el PRIMER intento de cada
 * cita, no el final: si no, bastaba con probar los cuatro cajones.
 */

const CSS = `
@keyframes fae-ex-sello { from { opacity: 0; transform: translateY(9px) scale(.97); } to { opacity: 1; transform: none; } }
.fae-ex-sello { animation: fae-ex-sello 420ms cubic-bezier(.3,.9,.4,1) both; }
@keyframes fae-ex-rechazo { 0%,100% { transform: translateX(0); } 25% { transform: translateX(-6px); } 75% { transform: translateX(6px); } }
.fae-ex-rechazo { animation: fae-ex-rechazo 380ms ease-in-out; }
@media (prefers-reduced-motion: reduce) { .fae-ex-sello, .fae-ex-rechazo { animation: none !important; } }
`;

export default function EtapaExpediente({ onTerminar }) {
  const ordenPrevio = useRef(null);
  const [orden, setOrden] = useState(() => {
    const o = barajarDistinto(CITAS_EXPEDIENTE, null, (c) => c.id);
    ordenPrevio.current = o;
    return o;
  });
  const [archivadas, setArchivadas] = useState({});      // id -> nivel
  const [primerIntento, setPrimerIntento] = useState({}); // id -> bool
  const [elegida, setElegida] = useState(null);
  const [fallando, setFallando] = useState(null);

  /*
   * Detalle por ítem de esta etapa. La unidad es la CITA que hay que archivar.
   * `respuesta` es el nivel donde la metió la primera vez que se equivocó.
   * El prefijo de etapa lo pone ProyectoArca, que es quien sabe en qué etapa
   * está: aquí solo se emiten los ids propios.
   */
  const detalle = useRef([]);
  const intentosCita = useRef({});
  const primerFallo = useRef({});

  const pendientes = orden.filter((c) => !archivadas[c.id]);
  const completa = pendientes.length === 0;
  const aciertos = CITAS_EXPEDIENTE.filter((c) => primerIntento[c.id]).length;

  const archivar = (nivel) => {
    if (!elegida) return;
    const cita = CITAS_EXPEDIENTE.find((c) => c.id === elegida);
    const intentos = (intentosCita.current[cita.id] ?? 0) + 1;
    intentosCita.current[cita.id] = intentos;

    if (cita.nivel === nivel) {
      detalle.current.push({
        item: cita.id,
        ok: intentos === 1,
        intentos,
        respuesta: primerFallo.current[cita.id] ?? null,
        orden: detalle.current.length + 1,
      });
      const primeras = { ...primerIntento, [cita.id]: primerIntento[cita.id] !== false };
      const guardadas = { ...archivadas, [cita.id]: nivel };
      setPrimerIntento(primeras);
      setArchivadas(guardadas);
      setElegida(null);

      if (Object.keys(guardadas).length === CITAS_EXPEDIENTE.length) {
        const bien = CITAS_EXPEDIENTE.filter((c) => primeras[c.id]).length;
        onTerminar?.((bien * 100) / CITAS_EXPEDIENTE.length, detalle.current);
      }
    } else {
      if (!primerFallo.current[cita.id]) primerFallo.current[cita.id] = nivel;
      setPrimerIntento((p) => ({ ...p, [cita.id]: false }));
      setFallando(cita.id);
      setTimeout(() => setFallando(null), 400);
    }
  };

  return (
    <div>
      <style>{CSS}</style>

      <p style={{ fontSize: "14.5px", lineHeight: 1.6, color: "rgba(248,249,250,0.72)", margin: "0 0 18px" }}>
        Ocho piezas del expediente, todas dichas o escritas por alguien del proyecto. Toca una y
        archívala en su cajón. Cuenta el primer intento de cada una.
      </p>

      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(290px, 1fr))", gap: "16px", alignItems: "start" }}>

        {/* ----------------------------- la carpeta ----------------------------- */}
        <div style={{ borderRadius: "18px", background: "#0A1422", border: "1px solid rgba(248,249,250,0.14)", padding: "14px" }}>
          <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "12px" }}>
            <FileText size={15} color={FAE.teal} />
            <p style={{ fontFamily: "Sora, sans-serif", fontSize: "11px", fontWeight: 700, letterSpacing: "0.12em", color: FAE.teal, margin: 0 }}>
              EXPEDIENTE · PROYECTO DEL ARCA
            </p>
          </div>

          <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
            {NIVELES.map((nivel, k) => {
              const dentro = CITAS_EXPEDIENTE.filter((c) => archivadas[c.id] === nivel);
              return (
                <button
                  key={nivel}
                  type="button"
                  onClick={() => archivar(nivel)}
                  disabled={!elegida}
                  style={{
                    textAlign: "left", cursor: elegida ? "pointer" : "default",
                    /* Los cajones se ensanchan hacia abajo, como el iceberg. */
                    width: `${88 + k * 4}%`, alignSelf: "flex-start",
                    padding: "11px 13px", borderRadius: "12px",
                    background: elegida ? "rgba(42,157,143,0.08)" : "rgba(248,249,250,0.03)",
                    border: `1px ${elegida ? "dashed" : "solid"} ${elegida ? FAE.teal : "rgba(248,249,250,0.13)"}`,
                    color: FAE.text,
                  }}
                >
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: "8px" }}>
                    <span style={{ fontFamily: "Sora, sans-serif", fontSize: "11.5px", fontWeight: 700, letterSpacing: "0.06em", color: dentro.length ? FAE.teal : "rgba(248,249,250,0.5)" }}>
                      {nivel.toUpperCase()}
                    </span>
                    <span style={{ fontFamily: "Sora, sans-serif", fontSize: "11px", fontWeight: 700, color: "rgba(248,249,250,0.4)", fontVariantNumeric: "tabular-nums" }}>
                      {dentro.length}/2
                    </span>
                  </div>
                  {dentro.map((c) => (
                    <p key={c.id} className="fae-ex-sello"
                      style={{ fontSize: "11.5px", lineHeight: 1.45, color: "rgba(248,249,250,0.62)", margin: "7px 0 0", paddingLeft: "9px", borderLeft: `2px solid ${FAE.teal}` }}>
                      {c.texto.length > 74 ? `${c.texto.slice(0, 74)}…` : c.texto}
                    </p>
                  ))}
                </button>
              );
            })}
          </div>

          <p style={{ fontSize: "11.5px", color: "rgba(248,249,250,0.42)", textAlign: "center", margin: "12px 0 0" }}>
            {elegida ? "Ahora toca el cajón donde va" : `${aciertos} de 8 bien a la primera`}
          </p>
        </div>

        {/* ------------------------- las piezas selladas ------------------------- */}
        <div style={{ borderRadius: "18px", background: "rgba(248,249,250,0.04)", border: "1px solid rgba(248,249,250,0.12)", padding: "clamp(13px, 2vw, 18px)" }}>
          {completa ? (
            <div className="fae-ex-sello">
              <div style={{ display: "flex", alignItems: "center", gap: "9px", marginBottom: "6px" }}>
                <Check size={18} color={FAE.teal} />
                <p style={{ fontFamily: "Sora, sans-serif", fontWeight: 700, fontSize: "20px", color: FAE.text, margin: 0, fontVariantNumeric: "tabular-nums" }}>
                  {aciertos} de 8
                </p>
              </div>
              <p style={{ fontSize: "13px", lineHeight: 1.6, color: "rgba(248,249,250,0.6)", margin: "0 0 14px" }}>
                Expediente cerrado. Las piezas ya están donde van; ahora hay que ver qué dibujan juntas.
              </p>
              {CITAS_EXPEDIENTE.filter((c) => primerIntento[c.id] === false).map((c) => (
                <div key={c.id} style={{ paddingLeft: "11px", borderLeft: `2px solid ${FAE.ambar}`, marginBottom: "10px" }}>
                  <p style={{ fontFamily: "Sora, sans-serif", fontSize: "10.5px", fontWeight: 700, letterSpacing: "0.08em", color: FAE.ambar, margin: "0 0 3px" }}>
                    {c.nivel.toUpperCase()}
                  </p>
                  <p style={{ fontSize: "12.5px", lineHeight: 1.5, color: "rgba(248,249,250,0.62)", margin: 0 }}>
                    {c.porque}
                  </p>
                </div>
              ))}
            </div>
          ) : (
            <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
              {pendientes.map((c) => (
                <button
                  key={c.id}
                  type="button"
                  className={fallando === c.id ? "fae-ex-rechazo" : undefined}
                  onClick={() => setElegida(elegida === c.id ? null : c.id)}
                  style={{
                    textAlign: "left", cursor: "pointer", padding: "11px 13px", borderRadius: "12px",
                    background: elegida === c.id ? "rgba(42,157,143,0.14)" : "rgba(248,249,250,0.04)",
                    border: `1px solid ${fallando === c.id ? FAE.coral : elegida === c.id ? FAE.teal : "rgba(248,249,250,0.14)"}`,
                    color: FAE.text, fontSize: "13px", lineHeight: 1.5, fontFamily: "Inter, sans-serif",
                  }}
                >
                  <span style={{ fontStyle: "italic" }}>«{c.texto}»</span>
                  {c.contexto && (
                    <span style={{ display: "block", marginTop: "5px", fontStyle: "normal", fontSize: "11.5px", color: "rgba(248,249,250,0.45)" }}>
                      {c.contexto}
                    </span>
                  )}
                </button>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
