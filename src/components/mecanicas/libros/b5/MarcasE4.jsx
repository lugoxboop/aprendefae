import { SOLO_LECTOR } from "../verbos.jsx";
import {
  IconoCheck, IconoX, Pastilla, TEXTO_B, REPOSO_B, bordeDe, claseDe,
  CORRECTA, TACHADA, APAGADA, REVELADA,
} from "./Devolucion.jsx";

/*
 * ═══════════════════════════════════════════════════════════════════════════
 * E4 · LO ELEGIDO CONSERVA SU FORMA (hoja de fusiones de Mai, §3) — una regla
 * para las opciones, las fichas, las mesas y las casillas de la Célula B.
 *
 * Después de calificar, lo que eligió el estudiante se queda donde lo puso, con
 * su forma, y lo correcto aparece junto a ello, sin reemplazarlo.
 *
 * LOTE 6d (prompt maestro §4, el estándar único de Hacer; Devolucion.jsx):
 *   · acierto: la pastilla Check + «Correcto» y borde 2 px #F8F9FA, sin
 *     relleno (antes, 2 nodo y relleno navy);
 *   · error: la pastilla X coral + «No va aquí», texto tachado (1,5 px) y
 *     borde 2 px coral (antes, sin coral);
 *   · revelada (la correcta que no se eligió, donde no hay reintento): la
 *     pastilla «Iba aquí», sin ícono, y borde 2 px #F8F9FA, 0,7 s después;
 *   · el resto, una vez decidido: opacidad 0,5;
 *   · reposo: 1 px rgba(248,249,250,.35), sin relleno.
 * Los íconos son Check y X de lucide (16 px, trazo 2,5) con aria-hidden; la
 * palabra de la pastilla es texto: entra en el nombre accesible.
 *
 * `Marca` (solo el ícono y su texto oculto) queda para las piezas de Aprender
 * que la usan (CajasQueRevelan, CajonesDelTiempo): cambia el dibujo, no el
 * comportamiento. Su X sigue sin coral (en Aprender no se toca el color del
 * error).
 * ═══════════════════════════════════════════════════════════════════════════
 */

export { CORRECTA, TACHADA, APAGADA, REVELADA };

export const OCULTO_E4 = {
  correcta: "(respuesta correcta)",
  tachada: "(tu respuesta)",
  valorCorrecto: "(valor correcto)",
  faltaba: "(faltaba)",
};

export const IconoVisto = ({ color = TEXTO_B }) => <IconoCheck color={color} />;
export const IconoTache = ({ color = TEXTO_B }) => <IconoX color={color} />;

/* El ícono y el texto oculto de una marca; nada si no hay marca o si está apagada. */
export function Marca({ marca, oculto = null }) {
  if (marca !== CORRECTA && marca !== TACHADA) return null;
  return (
    <>
      {marca === CORRECTA ? <IconoVisto /> : <IconoTache />}
      <span style={SOLO_LECTOR}>{` ${oculto ?? OCULTO_E4[marca]}`}</span>
    </>
  );
}

/* El borde de cada marca, sin relleno; `base` es el borde de reposo. El revelado lleva además `claseDe(marca)`. */
export function estiloE4(marca, base = REPOSO_B) {
  if (marca === APAGADA) return { border: base, opacity: 0.5 };
  if (marca === CORRECTA || marca === TACHADA) return { border: bordeDe(marca, base), opacity: 1 };
  return { border: base };
}

export { Pastilla, claseDe };

/* El tachado del texto de lo que eligió y no era (1,5 px). */
export const TACHADO = { textDecoration: "line-through", textDecorationThickness: "1.5px" };

/*
 * La opción de la célula con E4, para las elecciones y las casillas (b5-t6-a4, a6). Tiene el mismo
 * contrato que la Opcion compartida de corazon/juego.jsx (`estado`: null · "correcta" · "incorrecta" ·
 * "revelada"; `deshabilitada`; `ancho`), y sus medidas (relleno 13 · 15, Inter 13,5). Lote 6d: la
 * pastilla va debajo del texto de la opción, y el borde de 2 se come 1 px del relleno (no se mueve
 * nada al decidir).
 */
export function OpcionE4({ children, onClick, estado = null, deshabilitada = false, ancho = false }) {
  const marca = estado === "correcta" ? CORRECTA : estado === "revelada" ? REVELADA : estado === "incorrecta" ? TACHADA : deshabilitada ? APAGADA : null;
  const grueso = marca === CORRECTA || marca === TACHADA;
  const conPastilla = marca === CORRECTA || marca === TACHADA || marca === REVELADA;
  return (
    <button type="button" onClick={onClick} disabled={deshabilitada} data-estado={estado ?? "libre"} data-marca={marca ?? ""}
      className={claseDe(marca)}
      style={{
        display: "flex", flexDirection: "column", alignItems: "flex-start", gap: "6px", width: ancho ? "100%" : undefined, boxSizing: "border-box",
        minHeight: "44px", textAlign: "left", padding: grueso ? "12px 14px" : "13px 15px", borderRadius: "18px",
        background: "transparent", color: TEXTO_B, fontFamily: "Inter, sans-serif", fontSize: "13.5px", lineHeight: 1.45,
        cursor: deshabilitada ? "default" : "pointer", ...estiloE4(marca),
      }}>
      <span style={{ minWidth: 0, maxWidth: "100%", ...(marca === TACHADA ? TACHADO : null) }}>{children}</span>
      {conPastilla && <Pastilla marca={marca} />}
    </button>
  );
}
