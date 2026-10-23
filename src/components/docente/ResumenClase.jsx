import { useEffect, useState } from "react";
import { ChevronDown } from "lucide-react";
import { FAE } from "../../theme.js";
import { CSS_V1, V1, tarjetaV1, tituloBloque, notaV1 } from "./estiloV1.js";

/*
 * B1 · «Mi clase» (Ukyo §4): ¿cómo va? Una cifra grande, el avance de la
 * clase, y una línea de apoyo con los activos de la semana. Un toque en el
 * bloque despliega lo que antes estaba siempre a la vista: el avance por tema
 * y el acierto en evaluativas del periodo. Las cifras son las de siempre
 * (porTema, CabeceraResumen, «Resumen del periodo»): aquí solo se resumen.
 */

/* El conteo de la cabecera de antes: 180 ms desde 0; con movimiento reducido, puesto. */
function useConteo(valor) {
  const reducido = typeof window !== "undefined" && window.matchMedia?.("(prefers-reduced-motion: reduce)").matches;
  const [n, setN] = useState(reducido ? valor : 0);
  useEffect(() => {
    if (reducido || typeof requestAnimationFrame === "undefined") { setN(valor); return undefined; }
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
  }, [valor, reducido]);
  return n;
}

export function SelectorMateria({ materias, materia, nombreDe, onMateria }) {
  if (materias.length < 2) return null;
  return (
    <div style={{ display: "flex", gap: "8px", flexWrap: "wrap", flex: 1, minWidth: 0 }} role="group" aria-label="Materia">
      {materias.map((m) => (
        <button
          key={m}
          type="button"
          onClick={() => onMateria(m)}
          aria-pressed={m === materia}
          className="pd1-toque"
          style={{
            fontFamily: "Sora, sans-serif", fontSize: "13px", fontWeight: 600,
            padding: "0 14px", borderRadius: "999px", cursor: "pointer",
            background: m === materia ? FAE.teal : "transparent",
            border: `1px solid ${m === materia ? FAE.teal : "rgba(248,249,250,0.22)"}`,
            color: m === materia ? FAE.bg : FAE.text,
          }}
        >
          {nombreDe(m)}
        </button>
      ))}
    </div>
  );
}

export default function ResumenClase({ avance, activos, nCohorte, singular, porTema, pctEval, nEval, abierto, onAlternar }) {
  const cifra = avance === null ? null : Math.round(avance);
  const visto = useConteo(cifra ?? 0);
  return (
    <section className="pd1-entrar" style={{ ...tarjetaV1, animationDelay: "0ms" }} data-bloque="b1" aria-labelledby="pd1-b1">
      <style>{CSS_V1}</style>
      <button
        type="button"
        onClick={onAlternar}
        aria-expanded={abierto}
        aria-controls="pd1-b1-temas"
        className="pd1-foco"
        style={{ display: "block", width: "100%", textAlign: "left", padding: 0, background: "transparent", border: "none", color: "inherit", cursor: "pointer", font: "inherit" }}
      >
        <span style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: "8px" }}>
          <span id="pd1-b1" role="heading" aria-level={2} style={{ ...tituloBloque, margin: 0 }}>{singular ? "Mi estudiante" : "Mi clase"}</span>
          <ChevronDown size={18} aria-hidden="true" color={FAE.text} style={{ transform: abierto ? "rotate(180deg)" : "none", transition: "transform 200ms" }} />
        </span>
        <span style={{ display: "flex", alignItems: "center", gap: "14px", marginTop: "6px" }}>
          <span style={{ fontFamily: "Sora, sans-serif", fontSize: "36px", fontWeight: 700, lineHeight: 1.1, fontVariantNumeric: "tabular-nums", color: FAE.text }} data-cifra="avance">
            {cifra === null ? "—" : `${visto}%`}
          </span>
          <span style={{ display: "grid", minWidth: 0 }}>
            <span style={{ fontSize: "13px", color: V1.texto2 }}>{singular ? "Avance de tu estudiante" : "Actividades hechas"}</span>
            <span style={{ fontSize: "14px", color: FAE.text }} data-cifra="activos">
              {singular ? `${activos} de 1 activo esta semana` : `${activos} de ${nCohorte} activos esta semana`}
            </span>
          </span>
        </span>
        <span style={{ display: "block", height: "6px", marginTop: "8px", borderRadius: "999px", background: "rgba(248,249,250,0.1)", overflow: "hidden" }} aria-hidden="true">
          <span style={{ display: "block", width: `${cifra ?? 0}%`, height: "100%", background: FAE.teal, borderRadius: "999px" }} />
        </span>
      </button>

      {abierto && (
        <div id="pd1-b1-temas" style={{ marginTop: "14px", display: "grid", gap: "10px" }} data-avance-por-tema>
          <p style={notaV1}>
            Por tema: cuántos lo terminaron y cuántos lo empezaron. Cuenta solo las actividades que otorgan FP;
            la teoría no deja registro.
          </p>
          {porTema.map((t) => (
            <div key={t.id} data-tema={t.id}>
              <p style={{ margin: "0 0 4px", fontSize: "13px", color: FAE.text }}>{t.titulo}</p>
              <div style={{ height: "6px", borderRadius: "999px", background: "rgba(248,249,250,0.1)", overflow: "hidden" }} aria-hidden="true">
                <div style={{ width: `${nCohorte ? (t.terminaron / nCohorte) * 100 : 0}%`, height: "100%", background: FAE.teal }} />
              </div>
              <p style={{ margin: "4px 0 0", fontSize: "12px", color: V1.texto2, fontVariantNumeric: "tabular-nums" }} data-cifra-tema={t.id}>
                {t.terminaron} completo · {t.iniciaron} iniciado
              </p>
            </div>
          ))}
          <p style={{ margin: "4px 0 0", fontSize: "13px", color: FAE.text }} data-cifra="acierto-evaluativas">
            Acierto en evaluativas: {pctEval === null ? "—" : `${Math.round(pctEval)}%`}
            <span style={{ color: V1.texto2 }}>{nEval === 0 ? " · nadie ha hecho evaluativas aún" : ` · ${nEval} ${nEval === 1 ? "estudiante" : "estudiantes"}`}</span>
          </p>
        </div>
      )}
    </section>
  );
}

/* La fecha de la última visita, como la decía la cabecera de antes. */
function desdeCuando(iso) {
  if (!iso) return null;
  const dias = Math.floor((Date.now() - new Date(iso).getTime()) / 86400000);
  if (dias <= 0) return "hoy";
  if (dias === 1) return "ayer";
  if (dias < 7) return `hace ${dias} días`;
  return new Date(iso).toLocaleDateString("es-CO", { day: "numeric", month: "short" });
}

/*
 * B4 · «Desde tu última visita» (solo desde 1024 px): una línea, con los
 * textos de la tarjeta de antes y de panel_resumen (que ya existía y ya
 * escribía la visita; decisión de Yujiro sobre P8).
 */
export function DesdeTuVisita({ resumen, temaDe }) {
  if (!resumen) return null;
  const temas = [...new Set((resumen.actividades_nuevas ?? []).map(temaDe).filter(Boolean))];
  const desde = desdeCuando(resumen.desde);
  return (
    <section className="pd1-b4 pd1-entrar" style={{ ...tarjetaV1, padding: "12px 16px", marginTop: "16px", animationDelay: "240ms" }} data-bloque="b4" aria-labelledby="pd1-b4">
      <p style={{ margin: 0, fontSize: "14px", color: FAE.text }} data-cifra="desde-tu-visita">
        <span id="pd1-b4" style={{ fontFamily: "Sora, sans-serif", fontWeight: 700 }}>Desde tu última visita</span>
        <span style={{ color: V1.texto2 }}> · </span>
        {!resumen.desde
          ? "Primera visita. A partir de ahora se te marca lo que cambie entre una vez y la siguiente."
          : <>
              {resumen.fp_nuevos} FP nuevos
              {Number(resumen.estudiantes_movidos) > 0 && <> · +{resumen.estudiantes_movidos} activos</>}
              <span style={{ color: V1.texto2 }}> · {desde ? `Última visita: ${desde}. ` : ""}{temas.length > 0 ? `Movimiento en ${temas.join(", ")}.` : "Sin actividad nueva."}</span>
            </>}
      </p>
    </section>
  );
}
