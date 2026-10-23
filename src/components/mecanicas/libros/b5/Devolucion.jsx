import { Check, X } from "lucide-react";
import { FAE } from "../../../../theme.js";

/*
 * ═══════════════════════════════════════════════════════════════════════════
 * LOTE 6d · LA DEVOLUCIÓN DE LOS HACER DE B, EN EL ESTÁNDAR ÚNICO (prompt
 * maestro de diseño, §4; el modelo es T4 «¿Entra o sale de Caja?»).
 *
 * El patrón de components/t4/comun.jsx (Mensaje y Marca), copiado a la célula
 * en vez de importado: aquel dibuja la palomita y la equis como letras y tiñe de coral el
 * bloque del error, y es carril de la Célula D (no se toca). Aquí:
 *   · íconos Check y X de lucide, 16 px, trazo 2,5, siempre aria-hidden;
 *   · la pastilla de un destino: Check #F8F9FA + «Correcto» · X coral +
 *     «No va aquí» · «Iba aquí» (o «Iba aquí: {valor}») sin ícono, 0,7 s
 *     después del error y solo donde no hay reintento. La palabra NO va
 *     oculta al lector: queda dentro del nombre accesible del destino;
 *   · el contorno: reposo 1 px rgba(248,249,250,.35); acierto y revelado
 *     2 px #F8F9FA; error 2 px coral. Nunca teal ni ámbar en el acierto;
 *   · el bloque de mensaje: fondo rgba(184,196,212,.12) y raya izquierda de
 *     3 px, #B8C4D4 o coral. Acierto: Check y «Correcto.»; error: X y, solo
 *     para el lector, «Incorrecto.».
 *
 * El veredicto llega SIEMPRE como estado (`ok`, o la marca del destino) desde
 * la evaluación; nunca se deduce del texto. Los textos de los mensajes los
 * escribe el agente de contenido; las palabras de aquí son literales de
 * diseño (§4.2 y §4.3).
 * ═══════════════════════════════════════════════════════════════════════════
 */

export const PALABRA_B = { correcto: "Correcto", noVaAqui: "No va aquí", ibaAqui: "Iba aquí" };
export const ibaAquiCon = (valor) => `${PALABRA_B.ibaAqui}: ${valor}`;
export const LECTOR_INCORRECTO = "Incorrecto.";
export const ACIERTO_MENSAJE = "Correcto.";
/* §4.3: «Comprobar» cuando la respuesta tiene varios campos o fichas; el botón de avance sigue al contador. */
export const COMPROBAR_B = "Comprobar";
export const VER_MI_RESUMEN = "Ver mi resumen";
export const siguienteDe = (sustantivo) => `Siguiente ${sustantivo.toLowerCase()}`;
export const botonDeAvance = (sustantivo, ultimo) => (ultimo ? VER_MI_RESUMEN : siguienteDe(sustantivo));

export const TEXTO_B = FAE.text; // #F8F9FA
export const CORAL_B = FAE.coral; // #E76F51
export const NEUTRO_B = "#B8C4D4";
export const REPOSO_B = "1px solid rgba(248,249,250,0.35)";
export const ACIERTO_B = `2px solid ${TEXTO_B}`;
export const ERROR_B = `2px solid ${CORAL_B}`;
/* El contenedor hundido de Cuentas (§4.1): cuenta T, tabla de asiento. */
export const HUNDIDO_B = { background: "rgba(10,20,34,0.45)", border: "1px solid rgba(248,249,250,0.12)" };

/* Las marcas de un destino. Las tres primeras son las de E4 (MarcasE4.jsx). */
export const CORRECTA = "correcta";
export const TACHADA = "tachada";
export const APAGADA = "apagada";
export const REVELADA = "revelada";

export const RETRASO_REVELA_MS = 700;

/*
 * Lo que necesitan las piezas: el foco de 2 px #F8F9FA separado 2 (la hoja
 * global pinta #3d7fff) y la aparición del revelado. «Iba aquí» y su borde
 * llegan por opacidad, 0,7 s después; con movimiento reducido la hoja global
 * deja la animación en 0,01 ms: aparece de golpe, igual a los 0,7 s.
 */
export const CLASE_B5H = "fae-b5h";
export const CSS_B5H = `
.${CLASE_B5H} button:focus-visible, .${CLASE_B5H} input:focus-visible, .${CLASE_B5H} [tabindex]:focus-visible { outline: 2px solid ${TEXTO_B}; outline-offset: 2px; }
@keyframes fae-b5h-aparece { from { opacity: 0; } to { opacity: 1; } }
.fae-b5h-nueva { animation: fae-b5h-aparece 150ms cubic-bezier(.3,.9,.4,1) both; }
.fae-b5h-revela { animation: fae-b5h-aparece 150ms cubic-bezier(.3,.9,.4,1) ${RETRASO_REVELA_MS}ms both; }
.fae-b5h-revelado { position: relative; }
.fae-b5h-revelado::after { content: ""; position: absolute; inset: -1px; border: ${ACIERTO_B}; border-radius: inherit; pointer-events: none;
  animation: fae-b5h-aparece 150ms cubic-bezier(.3,.9,.4,1) ${RETRASO_REVELA_MS}ms both; }
`;

export function IconoCheck({ color = TEXTO_B }) {
  return <Check data-icono="visto" aria-hidden="true" focusable="false" size={16} strokeWidth={2.5} color={color} style={{ flex: "none", display: "block" }} />;
}
export function IconoX({ color = CORAL_B }) {
  return <X data-icono="tache" aria-hidden="true" focusable="false" size={16} strokeWidth={2.5} color={color} style={{ flex: "none", display: "block" }} />;
}

/* El contorno de cada marca; `base` es el de reposo. El revelado guarda su base y pinta el borde de 2 encima (clase). */
export function bordeDe(marca, base = REPOSO_B) {
  if (marca === CORRECTA) return ACIERTO_B;
  if (marca === TACHADA) return ERROR_B;
  return base;
}
export const claseDe = (marca) => (marca === REVELADA ? "fae-b5h-revelado" : undefined);

/*
 * La pastilla con palabra de un destino. `valor`: la cifra de «Iba aquí:
 * {valor}». `envuelve`: en un destino angosto la palabra puede partirse en dos
 * renglones (el cajón de las fichas mide 82 px a 320), sin cortarse nunca.
 */
export function Pastilla({ marca, valor = null, envuelve = false }) {
  if (marca !== CORRECTA && marca !== TACHADA && marca !== REVELADA) return null;
  /* `valor` en la correcta (T1-5, «Correcto: se queda igual»): solo si se pasa; sin él, como siempre. */
  const palabra = marca === CORRECTA ? (valor != null ? `${PALABRA_B.correcto}: ${valor}` : PALABRA_B.correcto) : marca === TACHADA ? PALABRA_B.noVaAqui : valor != null ? ibaAquiCon(valor) : PALABRA_B.ibaAqui;
  return (
    <span data-pastilla={marca} className={marca === REVELADA ? "fae-b5h-revela" : "fae-b5h-nueva"} style={{
      display: "inline-flex", alignItems: "center", gap: envuelve ? "2px 4px" : "4px", maxWidth: "100%", boxSizing: "border-box",
      minHeight: "22px", padding: envuelve ? "2px 5px" : "1px 7px", borderRadius: envuelve ? "10px" : "999px",
      flexWrap: envuelve ? "wrap" : "nowrap", justifyContent: "center", textAlign: "center",
      background: FAE.bg, border: `1px solid ${marca === TACHADA ? CORAL_B : TEXTO_B}`, color: TEXTO_B,
      fontFamily: "Inter, sans-serif", fontSize: "12px", fontWeight: 600, lineHeight: "16px", textDecoration: "none",
      /* Se parte entre palabras, nunca dentro de una: «Correcto» no se corta. */
      whiteSpace: envuelve ? "normal" : "nowrap", overflowWrap: "normal", fontVariantNumeric: "tabular-nums",
    }}>
      {marca === CORRECTA && <IconoCheck />}
      {marca === TACHADA && <IconoX />}
      <span data-palabra>{palabra}</span>
    </span>
  );
}

/*
 * El bloque de mensaje (T4 · Mensaje, con lucide y sin tinte coral). `ok` es el
 * estado de la evaluación. `texto` puede faltar (aún sin texto de contenido):
 * entonces el acierto dice solo «Correcto.». Va dentro de una región viva que
 * ya está en la página (`RegionViva`), para que el lector lo anuncie.
 */
export function Mensaje({ ok, texto = null, children = null }) {
  return (
    <div role="status" className="fae-b5h-nueva" data-mensaje={ok ? "acierto" : "error"} data-retro={ok ? "ok" : "mal"} style={{
      display: "grid", gridTemplateColumns: "16px minmax(0, 1fr)", gap: "4px 8px", alignItems: "start",
      margin: "12px 0 0", padding: "11px 13px", borderRadius: "11px",
      background: "rgba(184,196,212,0.12)", borderLeft: `3px solid ${ok ? NEUTRO_B : CORAL_B}`,
    }}>
      <span style={{ display: "flex", height: "22px", alignItems: "center" }}>{ok ? <IconoCheck /> : <IconoX />}</span>
      <p data-devolucion style={{ margin: 0, fontFamily: "Inter, sans-serif", fontSize: "15px", lineHeight: "22px", color: TEXTO_B, overflowWrap: "anywhere" }}>
        {ok
          ? <b data-palabra style={{ fontWeight: 700 }}>{ACIERTO_MENSAJE}{texto ? " " : ""}</b>
          : <span data-lector style={SOLO}>{`${LECTOR_INCORRECTO} `}</span>}
        {texto && <span data-texto-retro>{texto}</span>}
      </p>
      {children}
    </div>
  );
}

/* La región viva, siempre en la página: vacía mientras se pregunta. */
export function RegionViva({ children }) {
  return <div data-region-retro aria-live="polite" aria-atomic="true">{children}</div>;
}

const SOLO = {
  position: "absolute", width: "1px", height: "1px", padding: 0, margin: "-1px",
  overflow: "hidden", clip: "rect(0 0 0 0)", whiteSpace: "nowrap", border: 0,
};
