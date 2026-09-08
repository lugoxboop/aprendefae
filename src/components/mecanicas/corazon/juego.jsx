import { FAE } from "../../../theme.js";
import { CSS_CORAZON } from "./circulatorio.jsx";

/*
 * ═══════════════════════════════════════════════════════════════════════════
 * LAS PIEZAS COMPARTIDAS DE LOS SIETE JUEGOS DE DEMANDA AGREGADA.
 *
 * Esto NO es un vocabulario paralelo al de circulatorio.jsx: importa su CSS,
 * usa sus mismos tonos y vive en su misma carpeta. Lo que añade son las cuatro
 * cosas que un juego necesita y una pieza de "Aprender" no: una opción que se
 * toca, una devolución, un pulso de avance y un cierre.
 *
 * ═══════════ EL COLOR NUNCA VA SOLO ═══════════
 *
 * Una opción acertada no se distingue solo por ponerse teal: le aparece un
 * signo dibujado —un visto o un aspa— y la devolución de abajo lo dice con
 * palabras. Las tres señales van juntas siempre. Quien no distinga teal de
 * coral lee exactamente la misma información.
 *
 * ═══════════ EL EMOJI ES PARTE DE LA CADENA, Y NO BASTA ═══════════
 *
 * Las devoluciones empiezan por ✅ o ❌ y así están escritas en el banco: no se
 * tocan. Pero un lector de pantalla los lee de forma inconsistente —o los
 * ignora—, así que Retro los marca como decorativos y antepone "Correcto:" o
 * "Incorrecto:" en texto invisible. La cadena que se ve en pantalla sigue
 * siendo la del banco, carácter por carácter.
 * ═══════════════════════════════════════════════════════════════════════════
 */

export const CSS_JUEGO = `
${CSS_CORAZON}

/* Texto solo para lectores de pantalla. */
.fae-jg-oculto {
  position: absolute; width: 1px; height: 1px;
  padding: 0; margin: -1px; overflow: hidden;
  clip: rect(0, 0, 0, 0); white-space: nowrap; border: 0;
}

/* El latido de la opción recién acertada: un solo pulso, no un bucle. */
@keyframes fae-jg-acierto {
  0%, 100% { transform: scale(1); }
  40%      { transform: scale(1.025); }
}
.fae-jg-acierto { animation: fae-jg-acierto 340ms ease-out; }

@keyframes fae-jg-fallo {
  0%, 100% { transform: translateX(0); }
  25%      { transform: translateX(-4px); }
  75%      { transform: translateX(4px); }
}
.fae-jg-fallo { animation: fae-jg-fallo 300ms ease-out; }

@media (prefers-reduced-motion: reduce) {
  .fae-jg-acierto, .fae-jg-fallo { animation: none !important; }
}
`;

/* ─────────────────────────── los dos signos ─────────────────────────── */

function Visto({ color }) {
  return (
    <svg width="15" height="15" viewBox="0 0 15 15" aria-hidden="true" style={{ flexShrink: 0 }}>
      <path d="M3 8 L6 11 L12 4" fill="none" stroke={color} strokeWidth="2.1" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

function Aspa({ color }) {
  return (
    <svg width="15" height="15" viewBox="0 0 15 15" aria-hidden="true" style={{ flexShrink: 0 }}>
      <path d="M4 4 L11 11 M11 4 L4 11" fill="none" stroke={color} strokeWidth="2.1" strokeLinecap="round" />
    </svg>
  );
}

/*
 * Una opción que se toca.
 *
 * `estado`: null mientras se puede elegir · "correcta" · "incorrecta" ·
 * "revelada" para la respuesta buena que el estudiante NO eligió, que se
 * enseña sin celebrarla.
 */
export function Opcion({ children, onClick, estado = null, deshabilitada = false, ancho = false }) {
  const acierto = estado === "correcta";
  const fallo = estado === "incorrecta";
  const revelada = estado === "revelada";

  const borde = acierto ? FAE.teal : fallo ? FAE.coral : revelada ? `${FAE.teal}77` : "rgba(248,249,250,0.16)";
  const fondo = acierto
    ? "rgba(42,157,143,0.16)"
    : fallo
      ? "rgba(231,111,81,0.15)"
      : revelada
        ? "rgba(42,157,143,0.07)"
        : "rgba(248,249,250,0.04)";

  return (
    <button
      type="button"
      onClick={onClick}
      disabled={deshabilitada}
      className={acierto ? "fae-jg-acierto" : fallo ? "fae-jg-fallo" : undefined}
      style={{
        display: "flex", alignItems: "center", gap: "10px",
        width: ancho ? "100%" : undefined,
        textAlign: "left", padding: "13px 15px", borderRadius: "14px",
        background: fondo, border: `1px solid ${borde}`,
        color: FAE.text, fontFamily: "Inter, sans-serif", fontSize: "13.5px", lineHeight: 1.45,
        cursor: deshabilitada ? "default" : "pointer",
        transition: "background 180ms ease, border-color 180ms ease",
      }}
    >
      {/* El signo acompaña al color; ninguno de los dos informa solo. */}
      {acierto && <Visto color={FAE.teal} />}
      {fallo && <Aspa color={FAE.coral} />}
      {revelada && <Visto color={`${FAE.teal}aa`} />}
      <span style={{ minWidth: 0, flex: 1 }}>{children}</span>
      {revelada && (
        <span style={{ fontSize: "11px", color: "rgba(248,249,250,0.5)", whiteSpace: "nowrap" }}>
          era esta
        </span>
      )}
    </button>
  );
}

/*
 * Una devolución del banco, tal cual está escrita.
 *
 * El primer carácter es ✅ o ❌ y de ahí sale el tono: no se pasa un booleano
 * aparte que pudiera contradecir al texto.
 */
export function Retro({ texto }) {
  if (!texto) return null;
  const ok = texto.startsWith("✅");
  const emoji = texto.slice(0, 2).trim();
  const resto = texto.slice(2);

  return (
    <p
      role="status"
      style={{
        margin: "12px 0 0", padding: "11px 13px", borderRadius: "12px",
        fontSize: "13px", lineHeight: 1.55,
        background: ok ? "rgba(42,157,143,0.10)" : "rgba(231,111,81,0.10)",
        border: `1px solid ${ok ? FAE.teal : FAE.coral}55`,
        color: "rgba(248,249,250,0.82)",
      }}
    >
      <span className="fae-jg-oculto">{ok ? "Correcto: " : "Incorrecto: "}</span>
      <span aria-hidden="true">{emoji}</span>
      {resto}
    </p>
  );
}

/*
 * El avance, en la lengua de la casa: un pulso por ítem. Lleno el que ya se
 * contestó, hueco el que falta, y el número escrito al lado porque contar
 * puntos en una fila de doce no es leer.
 */
export function Pulsos({ total, hechos, etiqueta = "Avance" }) {
  return (
    <div style={{ display: "flex", alignItems: "center", gap: "9px", flexWrap: "wrap" }}>
      <span style={{ display: "flex", gap: "5px" }} aria-hidden="true">
        {Array.from({ length: total }, (_, i) => (
          <span
            key={i}
            style={{
              width: "8px", height: "8px", borderRadius: "999px",
              background: i < hechos ? FAE.teal : "transparent",
              border: `1px solid ${i < hechos ? FAE.teal : "rgba(248,249,250,0.28)"}`,
            }}
          />
        ))}
      </span>
      <span style={{ fontFamily: "Sora, sans-serif", fontSize: "11.5px", fontWeight: 600, color: "rgba(248,249,250,0.5)" }}>
        {etiqueta} {hechos} de {total}
      </span>
    </div>
  );
}

/*
 * El cierre. Enseña el porcentaje con el que se registró la actividad, que es
 * el mismo número que viajó al servidor: no se recalcula aquí ni se redondea
 * otra vez.
 */
export function Cierre({ pct, children, onReiniciar, textoReiniciar = "Jugar otra vez" }) {
  return (
    <div
      className="fae-cz-entrar"
      style={{
        marginTop: "18px", padding: "16px 18px", borderRadius: "16px",
        background: "rgba(42,157,143,0.09)", border: `1px solid ${FAE.teal}55`,
      }}
    >
      <p style={{ margin: "0 0 4px", fontFamily: "Sora, sans-serif", fontSize: "11px", fontWeight: 700, letterSpacing: "0.14em", color: "rgba(248,249,250,0.5)" }}>
        RESULTADO
      </p>
      <p style={{ margin: "0 0 8px", fontFamily: "Sora, sans-serif", fontSize: "28px", fontWeight: 700, color: FAE.teal, lineHeight: 1, fontVariantNumeric: "tabular-nums" }}>
        {pct}%
      </p>
      {children}
      {onReiniciar && (
        <button
          type="button"
          onClick={onReiniciar}
          style={{
            marginTop: "12px", fontFamily: "Sora, sans-serif", fontSize: "12.5px", fontWeight: 600,
            padding: "9px 15px", borderRadius: "999px", cursor: "pointer",
            background: "transparent", border: "1px solid rgba(248,249,250,0.22)", color: "rgba(248,249,250,0.72)",
          }}
        >
          {textoReiniciar}
        </button>
      )}
    </div>
  );
}

/*
 * El enunciado de una ronda. Mismo tratamiento en los siete juegos para que se
 * lean como una familia y no como siete pantallas sueltas.
 */
export function Enunciado({ rotulo, children, acento = FAE.teal }) {
  return (
    <div
      style={{
        padding: "15px 17px", borderRadius: "16px",
        background: "rgba(10,20,34,0.45)", border: "1px solid rgba(248,249,250,0.12)",
      }}
    >
      {rotulo && (
        <p style={{ margin: "0 0 7px", fontFamily: "Sora, sans-serif", fontSize: "10.5px", fontWeight: 700, letterSpacing: "0.16em", color: acento }}>
          {rotulo}
        </p>
      )}
      <p style={{ margin: 0, fontSize: "15px", lineHeight: 1.55, color: FAE.text }}>{children}</p>
    </div>
  );
}

/** La rejilla de opciones: una columna en móvil, dos cuando hay sitio. */
export function Opciones({ children, columnas = "repeat(auto-fit, minmax(240px, 1fr))" }) {
  return (
    <div style={{ display: "grid", gridTemplateColumns: columnas, gap: "10px", marginTop: "14px" }}>
      {children}
    </div>
  );
}
