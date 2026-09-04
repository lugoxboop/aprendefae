import { useEffect, useRef, useState } from "react";
import { Download } from "lucide-react";
import { FAE } from "../../theme.js";
import { cargarResumen } from "../../resumen/resumen.js";
import { dibujarResumen, descargarResumen } from "../../resumen/tarjeta.js";

/*
 * Resumen de semestre, en el perfil.
 *
 * Está siempre disponible: antes de la fecha de cierre se ve como avance ("así
 * vas hasta ahora") y desde el cierre queda congelado como versión definitiva.
 * La diferencia la decide la base con semestre_cerrado(), que lee la fecha de
 * ajustes.
 *
 * PENDIENTE, y a propósito: el panel donde Mateo edita esa fecha no existe
 * todavía. La lógica ya lee de la tabla `ajustes`, así que cuando exista no hay
 * que tocar nada aquí; mientras tanto la fecha se cambia con un update.
 *
 * Actividad absolutamente nula: no se dibuja nada. Con una sola actividad sí, y
 * la tarjeta celebra esa.
 */

export default function ResumenSemestre({ apodo }) {
  const [estado, setEstado] = useState({ cargando: true, resumen: null, error: null });
  const vistaPrevia = useRef(null);

  useEffect(() => {
    let vivo = true;
    cargarResumen().then((r) => {
      if (!vivo) return;
      setEstado({ cargando: false, resumen: r.hay ? r : null, error: r.error ?? null, vacio: !!r.vacio });
    });
    return () => { vivo = false; };
  }, []);

  /* La vista previa es el mismo canvas que se descarga, a escala. */
  useEffect(() => {
    if (!estado.resumen || !vistaPrevia.current) return;
    const canvas = dibujarResumen(estado.resumen, apodo);
    const destino = vistaPrevia.current;
    const ctx = destino.getContext("2d");
    destino.width = canvas.width / 2.5;
    destino.height = canvas.height / 2.5;
    ctx.drawImage(canvas, 0, 0, destino.width, destino.height);
  }, [estado.resumen, apodo]);

  if (estado.cargando) {
    return <p style={{ fontSize: "13.5px", color: "rgba(248,249,250,0.45)", margin: 0 }}>Preparando tu resumen…</p>;
  }

  /* Cero absoluto: no hay tarjeta, y se dice por qué sin regañar. */
  if (estado.vacio) {
    return (
      <p style={{ fontSize: "13.5px", lineHeight: 1.6, color: "rgba(248,249,250,0.5)", margin: 0 }}>
        Todavía no hay resumen de semestre: aparece en cuanto completes tu primera actividad.
      </p>
    );
  }
  if (estado.error || !estado.resumen) {
    return <p style={{ fontSize: "13.5px", color: FAE.coral, margin: 0 }}>No se pudo preparar el resumen.</p>;
  }

  const r = estado.resumen;

  const descargar = () => {
    const canvas = dibujarResumen(r, apodo);
    descargarResumen(canvas, `aprendefae-semestre-${apodo ?? "resumen"}.png`);
  };

  return (
    <div>
      <div style={{ display: "flex", alignItems: "baseline", justifyContent: "space-between", gap: "12px", flexWrap: "wrap", marginBottom: "12px" }}>
        <h3 style={{ fontFamily: "Sora, sans-serif", fontWeight: 700, fontSize: "16px", margin: 0, color: FAE.text }}>
          Resumen de semestre
        </h3>
        <span style={{ fontSize: "12.5px", color: r.cerrado ? FAE.teal : FAE.ambar }}>
          {r.cerrado ? "Versión definitiva" : "Avance en curso"}
        </span>
      </div>

      <p style={{ fontSize: "13.5px", lineHeight: 1.6, color: "rgba(248,249,250,0.55)", margin: "0 0 14px" }}>
        {r.cerrado
          ? "El semestre cerró: esta es la versión final. Descárgala y compártela donde quieras."
          : "Así vas hasta ahora. Puedes descargarla cuando quieras; al cerrar el semestre queda la versión definitiva."}
      </p>

      <canvas
        ref={vistaPrevia}
        aria-label="Vista previa del resumen de semestre"
        style={{
          width: "100%",
          maxWidth: "340px",
          height: "auto",
          display: "block",
          borderRadius: "14px",
          border: "1px solid rgba(248,249,250,0.14)",
          marginBottom: "14px",
        }}
      />

      <button
        type="button"
        onClick={descargar}
        style={{
          display: "inline-flex", alignItems: "center", gap: "8px",
          padding: "10px 16px", borderRadius: "999px",
          border: `1px solid ${FAE.teal}`, background: "rgba(42,157,143,0.12)",
          color: FAE.text, fontFamily: "Sora, sans-serif", fontSize: "13.5px", fontWeight: 600, cursor: "pointer",
        }}
      >
        <Download size={15} strokeWidth={2.2} />
        Descargar imagen
      </button>
    </div>
  );
}
