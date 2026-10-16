import { useEffect, useState } from "react";
import { Check, X } from "lucide-react";
import { FAE } from "../../../../theme.js";
import { SOLO_LECTOR } from "../verbos.jsx";

/*
 * ═══════════════════════════════════════════════════════════════════════════
 * EL ESTÁNDAR DE HACER DE LA CÉLULA B (orden de Mateo por Miku, prompt
 * maestro de diseño del 15-oct; el modelo es T4 «¿Entra o sale de Caja?»).
 *
 *   · FEEDBACK: una pastilla con la palabra y un bloque de mensaje (fondo
 *     rgba(184,196,212,.12), raya izquierda de 3 px, neutra o coral).
 *     Acierto: Check en #F8F9FA y «Correcto», borde 2 px #F8F9FA. Error: X
 *     coral y «No va aquí», borde 2 px coral; el lector dice «Incorrecto.».
 *     Revelada: «Iba aquí» sin ícono (con cifra, «Iba aquí: {valor}»), borde
 *     2 px #F8F9FA, 0,7 s después del error y solo donde no hay reintento.
 *     Nunca teal ni ámbar en el feedback, nunca «Correcta», nada de emoji.
 *     Los íconos, Check y X de lucide, 16 px, trazo 2,5.
 *   · CONTORNO: en reposo 1 px rgba(248,249,250,.35); elegido, correcto o
 *     revelado 2 px #F8F9FA; error 2 px coral.
 *
 * Lo usan las piezas de B a medida que pasan al estándar (lote 6c: los
 * cajones de a6 y las preguntas de a2; el resto, en el lote 6d).
 * ═══════════════════════════════════════════════════════════════════════════
 */

export const BLANCO = FAE.text; // #F8F9FA
export const CORAL = FAE.coral; // #E76F51
export const NEUTRO = "#B8C4D4";
export const SECUNDARIO = "#A8B6C8";

export const PALABRAS = { correcto: "Correcto", error: "No va aquí", iba: "Iba aquí", lector: "Incorrecto." };
export const RETRASO_REVELADA_MS = 700;

export const CONTORNO = {
  reposo: "1px solid rgba(248,249,250,0.35)",
  elegido: `2px solid ${BLANCO}`,
  correcto: `2px solid ${BLANCO}`,
  revelado: `2px solid ${BLANCO}`,
  error: `2px solid ${CORAL}`,
};

const ICONO = { size: 16, strokeWidth: 2.5, "aria-hidden": true, style: { flex: "none", display: "block" } };
export const IconoCheck = () => <Check {...ICONO} color={BLANCO} data-icono="check" />;
export const IconoX = () => <X {...ICONO} color={CORAL} data-icono="x" />;

/*
 * La pastilla de un destino: «Correcto», «No va aquí» o «Iba aquí» (con
 * `valor`, «Iba aquí: {valor}»). Es dibujo: va oculta al lector, que oye el
 * estado en el mensaje y en el nombre del destino.
 */
export function Pastilla({ tipo, valor = null, estilo = null }) {
  const texto = tipo === "correcto" ? PALABRAS.correcto : tipo === "error" ? PALABRAS.error : valor != null ? `${PALABRAS.iba}: ${valor}` : PALABRAS.iba;
  return (
    <span data-pastilla={tipo} aria-hidden="true" style={{
      display: "inline-flex", alignItems: "center", gap: "4px", width: "max-content", height: "22px", padding: "0 7px",
      borderRadius: "999px", background: FAE.bg, border: tipo === "error" ? CONTORNO.error : CONTORNO.correcto,
      color: BLANCO, fontFamily: "Inter, sans-serif", fontSize: "12px", fontWeight: 600, lineHeight: "18px", whiteSpace: "nowrap",
      pointerEvents: "none", boxSizing: "border-box", ...estilo,
    }}>
      {tipo === "correcto" && <IconoCheck />}
      {tipo === "error" && <IconoX />}
      <span>{texto}</span>
    </span>
  );
}

/* El bloque de mensaje. Acierto: Check, «Correcto» y el texto. Error: X y el texto; «Incorrecto.» solo para el lector. */
/* `clave`: el tipo de error (o null), para el registro y las pruebas. */
export function MensajeHacer({ ok, texto = null, clave = null }) {
  return (
    <div data-mensaje-hacer={ok ? "acierto" : "error"} data-panel={ok ? "acierto" : "error"} data-error={clave ?? "ninguno"} role="status" style={{
      display: "grid", gridTemplateColumns: "16px minmax(0, 1fr)", gap: "4px 8px", alignItems: "start", marginTop: "12px",
      padding: "11px 13px", borderRadius: "11px", background: "rgba(184,196,212,0.12)",
      borderLeft: `3px solid ${ok ? NEUTRO : CORAL}`,
    }}>
      <span style={{ paddingTop: "3px" }}>{ok ? <IconoCheck /> : <IconoX />}</span>
      <p data-texto-retro style={{ margin: 0, fontFamily: "Inter, sans-serif", fontSize: "15px", lineHeight: "22px", color: BLANCO }}>
        {!ok && <span style={SOLO_LECTOR}>{`${PALABRAS.lector} `}</span>}
        {ok && <b data-palabra>{PALABRAS.correcto}{texto ? ". " : ""}</b>}
        {texto}
      </p>
    </div>
  );
}

/* La revelada llega 0,7 s después del error (estándar). Devuelve si ya se muestra. */
export function useRevelada(error) {
  const [ver, setVer] = useState(false);
  useEffect(() => {
    if (!error) { setVer(false); return undefined; }
    const t = setTimeout(() => setVer(true), RETRASO_REVELADA_MS);
    return () => clearTimeout(t);
  }, [error]);
  return ver;
}
