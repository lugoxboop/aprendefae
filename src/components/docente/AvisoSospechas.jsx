import { useEffect, useState } from "react";
import { ShieldAlert, ChevronDown } from "lucide-react";
import { supabase } from "../../lib/supabase.js";
import { FAE } from "../../theme.js";

/*
 * ═══════════════════════════════════════════════════════════════════════════
 * REGISTROS CON FORMA DE TRAMPA — auditoría de seguridad, 11-nov (punto 1)
 *
 * El porcentaje de aciertos lo manda el navegador. Mientras el servidor no
 * califique, la 0160 marca los registros que tienen la forma de una trampa
 * (muchas actividades en minutos, o 100 % en un tiempo imposible) y aquí el
 * profesor ve a quién. Los FP no se tocan: puede ser un falso positivo, y el
 * profesor conoce a su estudiante. Si no hay nada marcado, no aparece nada.
 * ═══════════════════════════════════════════════════════════════════════════
 */

export default function AvisoSospechas({ materia, cliente = supabase }) {
  const [filas, setFilas] = useState([]);
  const [abierto, setAbierto] = useState(false);

  useEffect(() => {
    let vivo = true;
    if (!cliente || !materia) return undefined;
    cliente.rpc("panel_sospechas", { p_subject: materia }).then(({ data }) => { if (vivo && Array.isArray(data)) setFilas(data); });
    return () => { vivo = false; };
  }, [materia, cliente]);

  if (!filas.length) return null;
  return (
    <section data-aviso-sospechas style={{ margin: "0 0 18px", borderRadius: "18px", border: "1px solid rgba(231,111,81,0.45)", background: "rgba(231,111,81,0.08)", padding: "14px 18px" }}>
      <button type="button" onClick={() => setAbierto((v) => !v)} aria-expanded={abierto}
        style={{ all: "unset", cursor: "pointer", display: "flex", alignItems: "center", gap: "12px", width: "100%", minHeight: "44px" }}>
        <ShieldAlert size={22} color={FAE.coral} aria-hidden="true" style={{ flex: "none" }} />
        <span style={{ flex: 1, minWidth: 0 }}>
          <span style={{ display: "block", fontFamily: "Sora, sans-serif", fontWeight: 700, fontSize: "15.5px", color: FAE.text }}>
            {filas.length === 1 ? "1 estudiante con registros sospechosos" : `${filas.length} estudiantes con registros sospechosos`}
          </span>
          <span style={{ display: "block", fontSize: "13px", color: "rgba(248,249,250,0.72)" }}>
            Resultados que no parecen jugados: muchas actividades en minutos o 100 % en un tiempo imposible.
          </span>
        </span>
        <ChevronDown size={18} color={FAE.text} aria-hidden="true" style={{ flex: "none", transform: abierto ? "rotate(180deg)" : "none", transition: "transform 180ms cubic-bezier(.3,.9,.4,1)" }} />
      </button>
      {abierto && (
        <div style={{ marginTop: "12px", display: "flex", flexDirection: "column", gap: "8px" }}>
          {filas.map((f) => (
            <div key={f.user_id} style={{ display: "flex", justifyContent: "space-between", gap: "12px", flexWrap: "wrap", padding: "10px 12px", borderRadius: "12px", background: "rgba(248,249,250,0.05)" }}>
              <span style={{ minWidth: 0, color: FAE.text, fontWeight: 600, overflowWrap: "anywhere" }}>
                {f.full_name || f.nickname || "Estudiante"}{f.full_name && f.nickname ? <span style={{ fontWeight: 400, color: "rgba(248,249,250,0.6)" }}> · {f.nickname}</span> : null}
              </span>
              <span style={{ fontSize: "13px", color: "rgba(248,249,250,0.72)", fontVariantNumeric: "tabular-nums" }}>
                {[f.rafaga ? `${f.rafaga} en ráfaga` : null, f.imposible ? `${f.imposible} imposibles` : null].filter(Boolean).join(" · ")}
              </span>
            </div>
          ))}
          <p style={{ margin: "4px 0 0", fontSize: "12.5px", color: "rgba(248,249,250,0.6)" }}>
            Los FP no se tocaron. Es una alerta para revisar con el estudiante, no una sanción.
          </p>
        </div>
      )}
    </section>
  );
}
