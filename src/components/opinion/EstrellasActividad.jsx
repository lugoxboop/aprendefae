import { useRef, useState } from "react";
import { supabase } from "../../lib/supabase.js";
import {
  ESCALA_ACTIVIDAD, LARGO_MAXIMO, nuevoVale,
  puntuarActividad, recalificarActividad, comentarActividad,
} from "../../opinion/enviar.js";
import EstrellaFacetada, { CSS_ESTRELLA } from "./EstrellaFacetada.jsx";

/*
 * ═══════════════════════════════════════════════════════════════════════════
 * LAS ESTRELLAS DE LA ACTIVIDAD, EN LA PANTALLA DE RESULTADOS
 *
 * Encargo de Mateo (30-oct), y con su condición: que no sature. Así que esto
 * NO es un paso. No tapa nada, no pide nada, no se pone delante de «Volver»;
 * quien no quiera opinar baja la vista y sale, y nunca se le vuelve a
 * preguntar por esa actividad.
 *
 * ═══════════ POR QUÉ LA ESTRELLA SE MANDA AL TOCARLA ═══════════
 *
 * Porque si hubiera que confirmar, la mitad de los votos se perderían en el
 * botón «Volver». Se manda sola, con 900 ms de espera para que cambiar de
 * opinión —del tres al cuatro— no cuente dos veces. El comentario viene
 * después y es opcional de verdad: va a esa misma fila con el vale de 0156,
 * así que escribirlo no vuelve a contar la actividad.
 *
 * ═══════════ SE PUEDE CORREGIR, Y ANTES NO ═══════════
 *
 * La primera versión dejaba las estrellas quietas una vez mandadas, con el
 * argumento de que 900 ms bastaban para el resbalón. No bastan: uno se da
 * cuenta de que puso cuatro cuando ya está leyendo «Muy buena», no en el
 * primer segundo. Lo encontró Mateo a los diez minutos de publicarlo.
 *
 * Ahora cada toque posterior CORRIGE la misma fila con el mismo vale (0157),
 * así que no se cuenta dos veces, y se puede dudar las veces que haga falta
 * durante dos horas. Fuera de ese vale y de ese rato, nadie toca nada.
 *
 * ═══════════ QUÉ SE GUARDA ═══════════
 *
 * La puntuación, la actividad, la materia y si fue teléfono o escritorio.
 * Nada de quién: es anónima igual que la hoja del sitio, y el rótulo lo dice
 * en voz baja para que nadie tenga que suponerlo.
 * ═══════════════════════════════════════════════════════════════════════════
 */

/* Lo que se espera antes de mandar, por si cambia de opinión. */
export const ESPERA_MS = 900;

const ATENUADO = "#A8B6C8";
const SORA = "Sora, sans-serif";

export default function EstrellasActividad({ actividadId, materiaId }) {
  const [puntaje, setPuntaje] = useState(0);
  const [ensayo, setEnsayo] = useState(0);
  const [mandada, setMandada] = useState(false);
  const [texto, setTexto] = useState("");
  const [comentado, setComentado] = useState(false);
  const [enviandoTexto, setEnviandoTexto] = useState(false);
  const vale = useRef(null);
  const reloj = useRef(null);

  const elegir = (n) => {
    setPuntaje(n);
    setEnsayo(0);
    if (reloj.current) clearTimeout(reloj.current);
    reloj.current = setTimeout(async () => {
      /*
       * La primera vez crea la fila; las siguientes corrigen ESA fila con el
       * mismo vale. Insertar otra contaría la actividad dos veces y su media
       * mentiría, que es justo lo que esto viene a medir bien.
       */
      const primera = !vale.current;
      if (primera) vale.current = nuevoVale();
      setMandada(true);
      if (primera) {
        await puntuarActividad(supabase, {
          puntaje: n,
          actividadId,
          materiaId,
          vale: vale.current,
          ancho: typeof window === "undefined" ? null : window.innerWidth,
        });
      } else {
        await recalificarActividad(supabase, { vale: vale.current, puntaje: n });
      }
      /*
       * El reloj NO se cancela al desmontar, y es a propósito: si el
       * estudiante toca una estrella y pulsa «Volver» en el mismo segundo,
       * la llamada sale igual y su voto se guarda. Lo único que se pierde es
       * el `setMandada`, que ya no tiene pantalla donde pintarse.
       *
       * No se mira el resultado a propósito. Si la red falló, decírselo a
       * alguien que ya terminó su actividad no le sirve de nada: no puede
       * hacer nada al respecto y lo único que consigue es ensuciar su
       * pantalla de resultados con un error que no es suyo.
       */
    }, ESPERA_MS);
  };

  const enviarTexto = async () => {
    if (!texto.trim() || enviandoTexto) return;
    setEnviandoTexto(true);
    await comentarActividad(supabase, { vale: vale.current, texto });
    setEnviandoTexto(false);
    setComentado(true);
  };


  return (
    <div
      data-estrellas-actividad
      style={{
        marginTop: "18px", paddingTop: "16px",
        borderTop: "1px solid rgba(248,249,250,0.12)",
        display: "grid", gap: "8px", justifyItems: "center",
      }}
    >
      <style>{CSS_ESTRELLA}</style>

      <p style={{ margin: 0, fontFamily: SORA, fontSize: "13px", fontWeight: 600, color: ATENUADO, textAlign: "center" }}>
        {comentado || mandada ? "Gracias por calificarla" : "¿Qué te pareció esta actividad?"}
      </p>

      <div
        role="radiogroup"
        aria-label="Puntuación de la actividad, de 1 a 5"
        onMouseLeave={() => setEnsayo(0)}
        style={{ display: "flex", gap: 0 }}
      >
        {[1, 2, 3, 4, 5].map((n) => (
          <button
            key={n}
            type="button"
            role="radio"
            aria-checked={puntaje === n}
            aria-label={`${n} de 5 — ${ESCALA_ACTIVIDAD[n]}`}
            onClick={() => elegir(n)}
            onMouseEnter={() => setEnsayo(n)}
            onFocus={() => setEnsayo(n)}
            onBlur={() => setEnsayo(0)}
            style={{
              display: "flex", alignItems: "center", justifyContent: "center",
              width: "44px", height: "44px", minWidth: "44px", flexShrink: 0, padding: 0,
              background: "transparent", border: "none", borderRadius: "12px",
              cursor: "pointer",
            }}
          >
            <EstrellaFacetada
              id={`${actividadId || "act"}-${n}`}
              /* Con el dedo encima manda el ensayo: así se ve la corrección
                 antes de soltarla, igual que la primera vez. */
              encendida={n <= (ensayo || puntaje)}
              orden={n - 1}
              tamano={30}
            />
          </button>
        ))}
      </div>

      <p aria-live="polite" style={{ margin: 0, minHeight: "18px", fontSize: "12.5px", color: puntaje ? "#CBDCF2" : "rgba(248,249,250,0.55)" }}>
        {puntaje
          ? (mandada ? `${ESCALA_ACTIVIDAD[puntaje]} · puedes cambiarla` : ESCALA_ACTIVIDAD[puntaje])
          : "Anónimo, y opcional"}
      </p>

      {/* El comentario solo existe después de puntuar: antes sería una tarea más. */}
      {puntaje > 0 && !comentado && (
        <div style={{ width: "100%", maxWidth: "340px", display: "grid", gap: "8px", marginTop: "2px" }}>
          <label htmlFor="fae-op-act-texto" style={{ fontSize: "12.5px", color: ATENUADO, textAlign: "center" }}>
            ¿Quieres contarnos por qué? <span style={{ color: "rgba(248,249,250,0.5)" }}>(opcional)</span>
          </label>
          <textarea
            id="fae-op-act-texto"
            value={texto}
            onChange={(e) => setTexto(e.target.value.slice(0, LARGO_MAXIMO))}
            rows={2}
            placeholder="Qué te costó, qué te sobró, qué cambiarías…"
            style={{
              width: "100%", boxSizing: "border-box", resize: "vertical", minHeight: "62px",
              padding: "10px 12px", borderRadius: "12px",
              background: "rgba(10,20,34,0.45)", border: "1px solid rgba(248,249,250,0.16)",
              color: "#F8F9FA", fontFamily: "Inter, sans-serif",
              /* 16 px: por debajo, Safari en iPhone hace zoom al enfocar. */
              fontSize: "16px", lineHeight: 1.45,
            }}
          />
          <button
            type="button"
            onClick={enviarTexto}
            disabled={!texto.trim() || enviandoTexto}
            style={{
              minHeight: "44px", padding: "0 18px", borderRadius: "999px",
              background: "transparent",
              border: `1px solid ${texto.trim() ? "rgba(42,157,143,0.75)" : "rgba(248,249,250,0.20)"}`,
              color: texto.trim() ? "#CBDCF2" : "rgba(248,249,250,0.45)",
              fontFamily: SORA, fontSize: "13.5px", fontWeight: 600,
              cursor: texto.trim() ? "pointer" : "default",
            }}
          >
            {enviandoTexto ? "Enviando…" : "Enviar comentario"}
          </button>
        </div>
      )}

      {comentado && (
        <p style={{ margin: 0, fontSize: "12.5px", color: ATENUADO, textAlign: "center" }}>
          Leído. Lo que más se repita es lo que se arregla primero.
        </p>
      )}
    </div>
  );
}
