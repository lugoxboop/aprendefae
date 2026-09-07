import { useEffect, useState } from "react";
import { FAE } from "../../theme.js";
import { NIVEL } from "../../docente/alertas.js";

/*
 * ÍTEM 1 — El resumen ejecutivo, lo primero que se ve al abrir el panel.
 *
 * Tres o cuatro tarjetas antes de cualquier lista: cuántos están activos, qué
 * alertas hay pendientes por nivel, y qué ha cambiado desde la última visita.
 *
 * ═══════════ DE DÓNDE SALE CADA COSA ═══════════
 *
 * Los recuentos de alertas se cuentan AQUÍ, sobre el array que el panel ya
 * tiene en memoria. No los devuelve el servidor a propósito: las reglas viven
 * en alertas.js y duplicarlas en SQL crearía dos verdades sobre lo mismo, que
 * se separarían en la primera modificación.
 *
 * El delta sí viene del servidor —panel_resumen— porque depende de una marca
 * que solo la base conoce. Si esa llamada falla (por ejemplo, con el cliente
 * desplegado antes que la migración 0019), `resumen` llega null y la tarjeta
 * del delta simplemente no se pinta. Las otras tres siguen.
 *
 * ═══════════ EL COLOR NUNCA VA SOLO ═══════════
 *
 * Cada nivel de alerta lleva su palabra escrita —urgentes, atención,
 * informativas— además del color. Un panel que solo distinga por tono no lo
 * puede leer quien no distingue coral de ámbar, y son justo los dos tonos que
 * más se parecen de la paleta.
 *
 * ═══════════ ANIMACIÓN, DELIBERADAMENTE POCA ═══════════
 *
 * Una entrada de 180 ms y los números subiendo desde cero en ese mismo tiempo.
 * Nada más. Esto es una vista de datos, no la confirmación de FP de un
 * estudiante: si compitiera con la racha diaria estaría gritando donde debe
 * informar. Con `prefers-reduced-motion` no se mueve nada y los números salen
 * puestos.
 */

const CSS = `
@keyframes fae-cr-entrar { from { opacity: 0; transform: translateY(6px); } to { opacity: 1; transform: none; } }
.fae-cr-entrar { animation: fae-cr-entrar 180ms ease-out both; }
@media (prefers-reduced-motion: reduce) { .fae-cr-entrar { animation: none !important; } }
`;

/* Cuenta desde 0 hasta `valor` en los mismos 180 ms de la entrada. */
function useConteo(valor, activo) {
  const [n, setN] = useState(activo ? 0 : valor);
  useEffect(() => {
    if (!activo) { setN(valor); return; }
    const inicio = performance.now();
    let vivo = true;
    const paso = (t) => {
      if (!vivo) return;
      const p = Math.min(1, (t - inicio) / 180);
      setN(Math.round(valor * p));
      if (p < 1) requestAnimationFrame(paso);
    };
    requestAnimationFrame(paso);
    return () => { vivo = false; };
  }, [valor, activo]);
  return n;
}

const tarjeta = {
  padding: "14px 16px",
  borderRadius: "14px",
  background: `${FAE.navy}59`,
  border: "1px solid rgba(248,249,250,0.12)",
  minWidth: 0,
};
const rotulo = { margin: "0 0 6px", fontSize: "11px", letterSpacing: "0.06em", color: "rgba(248,249,250,0.5)" };
const cifra = { margin: 0, fontFamily: "Sora, sans-serif", fontSize: "28px", fontWeight: 700, fontVariantNumeric: "tabular-nums", lineHeight: 1 };
const pie = { margin: "6px 0 0", fontSize: "11.5px", lineHeight: 1.4, color: "rgba(248,249,250,0.55)" };

/* Chip pequeño, del mismo talle que los de posición en Ligas. */
function Chip({ children, color }) {
  return (
    <span
      style={{
        display: "inline-flex", alignItems: "center", gap: "4px",
        padding: "2px 8px", borderRadius: "999px",
        background: `${color}22`, border: `1px solid ${color}66`,
        color, fontFamily: "Sora, sans-serif", fontSize: "11px", fontWeight: 700,
        fontVariantNumeric: "tabular-nums", whiteSpace: "nowrap",
      }}
    >
      {children}
    </span>
  );
}

function desdeCuando(iso) {
  if (!iso) return null;
  const dias = Math.floor((Date.now() - new Date(iso).getTime()) / 86400000);
  if (dias <= 0) return "hoy";
  if (dias === 1) return "ayer";
  if (dias < 7) return `hace ${dias} días`;
  return new Date(iso).toLocaleDateString("es-CO", { day: "numeric", month: "short" });
}

export default function CabeceraResumen({ estudiantes, alertas, resumen, temaDe }) {
  const reducido =
    typeof window !== "undefined" &&
    window.matchMedia?.("(prefers-reduced-motion: reduce)").matches;
  const animar = !reducido;

  const activos = Number(resumen?.estudiantes_activos ?? estudiantes.filter((e) => Number(e.fp_ciclo) > 0).length);
  const urgentes = alertas.filter((a) => a.nivel === NIVEL.URGENTE).length;
  const atencion = alertas.filter((a) => a.nivel === NIVEL.ATENCION).length;
  const info = alertas.filter((a) => a.nivel === NIVEL.INFO).length;

  const nActivos = useConteo(activos, animar);
  const nAlertas = useConteo(urgentes + atencion + info, animar);

  /*
   * Los temas que alguien terminó desde la última visita. El servidor devuelve
   * ids de actividad y el agrupado por tema se hace aquí, con subjects.js: el
   * servidor no conoce los temas y no debe empezar a conocerlos.
   */
  const temasNuevos = [...new Set((resumen?.actividades_nuevas ?? []).map(temaDe).filter(Boolean))];
  const desde = desdeCuando(resumen?.desde);
  const primeraVisita = resumen !== null && resumen !== undefined && !resumen.desde;

  return (
    <section className="fae-cr-entrar" style={{ marginBottom: "26px" }}>
      <style>{CSS}</style>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(190px, 1fr))", gap: "12px" }}>

        <div style={tarjeta}>
          <p style={rotulo}>ACTIVOS ESTE CICLO</p>
          <p style={{ ...cifra, color: FAE.text }}>{nActivos}</p>
          <p style={pie}>de {estudiantes.length} con actividad en la materia</p>
        </div>

        <div style={tarjeta}>
          <p style={rotulo}>ALERTAS PENDIENTES</p>
          <p style={{ ...cifra, color: urgentes > 0 ? FAE.coral : FAE.text }}>{nAlertas}</p>
          {/*
            * Los tres niveles con su palabra al lado del color. El punto solo
            * acompaña; quien no distinga los tonos lee "urgentes" igual.
            */}
          <div style={{ display: "flex", flexWrap: "wrap", gap: "6px", marginTop: "8px" }}>
            {[
              { n: urgentes, texto: "urgentes", color: FAE.coral },
              { n: atencion, texto: "atención", color: FAE.ambar },
              { n: info, texto: "informativas", color: FAE.teal },
            ].map((x) => (
              <span key={x.texto} style={{ display: "inline-flex", alignItems: "center", gap: "5px", fontSize: "11.5px", color: "rgba(248,249,250,0.72)" }}>
                <span aria-hidden="true" style={{ width: "7px", height: "7px", borderRadius: "50%", background: x.color, flexShrink: 0 }} />
                <span style={{ fontVariantNumeric: "tabular-nums" }}>{x.n}</span> {x.texto}
              </span>
            ))}
          </div>
        </div>

        {/*
          * La tarjeta del delta solo existe si el servidor pudo responder. Sin
          * la 0019 aplicada, `resumen` es null y aquí no se pinta nada — mejor
          * que un hueco con guiones que parece un fallo.
          */}
        {resumen && (
          <div style={tarjeta}>
            <p style={rotulo}>DESDE TU ÚLTIMA VISITA</p>
            {primeraVisita ? (
              <>
                <p style={{ ...cifra, fontSize: "19px", color: "rgba(248,249,250,0.75)" }}>Primera visita</p>
                <p style={pie}>A partir de ahora se te marca lo que cambie entre una vez y la siguiente.</p>
              </>
            ) : (
              <>
                <div style={{ display: "flex", alignItems: "baseline", gap: "9px", flexWrap: "wrap" }}>
                  <p style={{ ...cifra, color: FAE.teal }}>{resumen.fp_nuevos}</p>
                  <span style={{ fontSize: "12px", color: "rgba(248,249,250,0.6)" }}>FP nuevos</span>
                  {Number(resumen.estudiantes_movidos) > 0 && (
                    <Chip color={FAE.teal}>+{resumen.estudiantes_movidos} activos</Chip>
                  )}
                </div>
                <p style={pie}>
                  {desde ? `Última visita: ${desde}. ` : ""}
                  {temasNuevos.length > 0
                    ? `Movimiento en ${temasNuevos.join(", ")}.`
                    : "Sin actividad nueva."}
                </p>
              </>
            )}
          </div>
        )}
      </div>
    </section>
  );
}
