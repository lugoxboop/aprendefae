import { useState } from "react";
import { FAE } from "../../theme.js";
import { copiar } from "../../docente/copiar.js";
import { MINIMO_PARA_REPASO, UMBRAL_DIFICIL_PCT, guionDeRepaso, hayRepaso } from "../../docente/repaso.js";
import { V1, notaV1 } from "./estiloV1.js";

/*
 * ═══════════════════════════════════════════════════════════════════════════
 * EL BOTÓN QUE CONVIERTE EL DIAGNÓSTICO EN TRABAJO HECHO
 *
 * Es la pieza por la que el informe de Kahoot se usa y los demás no: no
 * termina en «estas preguntas salieron mal», termina en el repaso armado. La
 * regla de cuáles entran es la suya y está escrita a la vista —acierto por
 * debajo del 35 %, mínimo tres— porque un umbral secreto produce un botón
 * mágico, y de un botón mágico se desconfía.
 *
 * LO QUE AQUÍ SE ENTREGA ES EL GUION, NO LA ACTIVIDAD. Crear una actividad
 * asignada pide una tabla, su política de acceso y una migración; el texto
 * listo para pegar en la diapositiva del lunes o en el grupo del curso no pide
 * nada y es la mitad del valor. El día que exista la asignación, este mismo
 * bloque cambia de botón sin cambiar de sitio.
 *
 * EL ESTADO DEL BOTÓN NO MIENTE. Dice «copiado» solo si el portapapeles
 * aceptó; si no, enseña el texto para copiarlo a mano. Un «copiado» sin copia
 * es peor que no tener botón.
 * ═══════════════════════════════════════════════════════════════════════════
 */

export default function RepasoDeLasFalladas({ actividadNombre, dificiles = [], total = 0 }) {
  const [estado, setEstado] = useState("listo");

  if (!hayRepaso(dificiles)) {
    /*
     * Por debajo del mínimo NO se ofrece el repaso, y se dice por qué. Con una
     * o dos preguntas difíciles no hay un tema que volver a explicar: hay dos
     * preguntas, y rehacer una clase por eso es peor que no tener la sección.
     */
    return dificiles.length === 0 ? null : (
      <p style={{ ...notaV1, margin: "0 0 12px", maxWidth: "62ch" }} data-repaso-corto={dificiles.length}>
        {dificiles.length} {dificiles.length === 1 ? "pregunta baja" : "preguntas bajas"} de {total}: por debajo de {MINIMO_PARA_REPASO} no se arma un repaso, son casos sueltos y no un tema que volver a explicar.
      </p>
    );
  }

  const guion = guionDeRepaso({ actividadNombre, dificiles });

  const alCopiar = async () => {
    const ok = await copiar(guion);
    setEstado(ok ? "copiado" : "a-mano");
    if (ok) setTimeout(() => setEstado("listo"), 2400);
  };

  return (
    <section
      data-repaso={dificiles.length}
      style={{
        padding: "14px",
        borderRadius: "14px",
        background: "linear-gradient(0deg, rgba(42,157,143,0.06), rgba(42,157,143,0.06)), " + V1.tarjeta,
        border: "1px solid rgba(42,157,143,0.45)",
        margin: "0 0 14px",
        maxWidth: "72ch",
      }}
    >
      <p style={{ margin: "0 0 4px", fontFamily: "Sora, sans-serif", fontSize: "15px", fontWeight: 700, color: FAE.text }}>
        Repasar estas {dificiles.length} preguntas
      </p>
      <p style={{ ...notaV1, marginBottom: "10px" }}>
        Son las que acertó menos del {UMBRAL_DIFICIL_PCT}% de quienes las vieron, de {total} en la actividad. El guion lleva cada pregunta, cuántos la fallaron y en qué se equivocan.
      </p>

      <button
        type="button"
        className="pd1-toque pd1-foco"
        onClick={alCopiar}
        data-copiar-repaso
        style={{
          display: "inline-flex", alignItems: "center", padding: "0 16px", borderRadius: "999px",
          background: FAE.teal, border: "none", cursor: "pointer",
          /* Texto oscuro sobre el relleno teal: el teal como fondo sí, como color de letra nunca. */
          color: "#06202A", fontFamily: "Sora, sans-serif", fontSize: "13.5px", fontWeight: 700,
        }}
      >
        {estado === "copiado" ? "Copiado" : "Copiar el guion del repaso"}
      </button>

      {/* El aviso de resultado va en una región viva: quien usa lector de pantalla también se entera. */}
      <p aria-live="polite" style={{ ...notaV1, marginTop: "8px", marginBottom: 0 }}>
        {estado === "copiado" ? "Listo: pégalo donde hables con tu clase." : ""}
      </p>

      {estado === "a-mano" && (
        <>
          <p style={{ ...notaV1, marginTop: "4px" }}>Este navegador no dejó copiar. Selecciónalo y cópialo a mano:</p>
          <textarea
            readOnly
            value={guion}
            data-guion-a-mano
            rows={Math.min(14, dificiles.length * 3 + 3)}
            style={{
              width: "100%", marginTop: "6px", padding: "10px", borderRadius: "10px",
              background: "rgba(14,27,46,0.6)", border: "1px solid rgba(248,249,250,0.2)",
              color: FAE.text, fontFamily: "Inter, sans-serif", fontSize: "12.5px", lineHeight: 1.5, resize: "vertical",
            }}
          />
        </>
      )}
    </section>
  );
}
