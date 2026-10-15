/*
 * ═══════════════════════════════════════════════════════════════════════════
 * T4 · LO COMÚN DEL REDISEÑO DE ENGANCHE (Célula D): A0, A1 y H1.
 *
 * Carril de la Célula D: nadie más lo usa, y no es un componente compartido.
 * Portado del prototipo de Hanayama (scratchpad hanayama/sitio/src/
 * components/t4r/comun.jsx, con los ajustes del corte de Yujiro de su §9).
 *
 *   · la paleta: la de theme.js y los dos neutros que ya usa Contabilidad.
 *     Teal y ámbar SOLO en «Debe» y «Haber»; coral solo en el error
 *   · Mensaje: UNA forma de devolución. Acierto: ✓, «Correcto.» y el texto.
 *     Error: ✗ y el texto; «Incorrecto.» solo para el lector de pantalla
 *   · Marca: la pastilla con palabra de un destino («✓ Correcto», «✗ No va
 *     aquí», «Iba aquí»): en blanco y negro se sabe cuál falló (canon E3)
 *   · SeguirHacer: el botón de seguir de un Hacer, en el neutro blanco de
 *     Aprender. NO es el Responder compartido, que es teal: en una pieza de
 *     debe y haber, el teal solo significa debe (corte de Yujiro, ajuste 1)
 * ═══════════════════════════════════════════════════════════════════════════
 */
import { FAE } from "../../theme.js";
import { PALABRA, LECTOR_ERROR, MARCA } from "../../data/contabilidadT4.js";

export const C = {
  fondo: FAE.bg, texto: FAE.text, texto2: "#A8B6C8", neutro: "#B8C4D4",
  debe: FAE.teal, haber: FAE.ambar, error: FAE.coral,
};

/* Las cifras con el formato del libro: miles con punto, sin «$». */
export const cifra = (n) => String(Math.round(n)).replace(/\B(?=(\d{3})+(?!\d))/g, ".");

export const CSS_T4R = `
.t4r { display: grid; gap: 12px; min-width: 0; color: ${C.texto}; font-family: "Inter", sans-serif; font-size: 15px; line-height: 1.45; }
.t4r * { box-sizing: border-box; }
.t4r-p { margin: 0; font-size: 15px; line-height: 1.45; overflow-wrap: anywhere; }
.t4r-pie { margin: 0; font-size: 12px; line-height: 1.4; color: ${C.texto2}; overflow-wrap: anywhere; }
.t4r-sig { margin: 0; font-size: 14px; line-height: 1.4; color: ${C.texto2}; overflow-wrap: anywhere; }
.t4r-lista { margin: 0; padding-left: 22px; display: grid; gap: 4px; }
/* La hoja global del sitio quita el estilo de lista: aquí vuelven los números. */
.t4r-lista li { list-style: decimal; overflow-wrap: anywhere; }
.t4r-btn { appearance: none; min-height: 44px; width: 100%; border-radius: 8px; border: 1px solid ${C.texto}; background: ${C.texto}; color: ${C.fondo}; font: 600 15px "Inter", sans-serif; cursor: pointer; }
.t4r-btn2 { appearance: none; min-height: 44px; border-radius: 8px; border: 1px solid ${C.neutro}; background: transparent; color: ${C.texto}; font: 600 14px "Inter", sans-serif; cursor: pointer; padding: 0 12px; white-space: nowrap; }
.t4r-btn2[aria-disabled="true"] { color: ${C.texto2}; border-color: rgba(184,196,212,0.4); cursor: default; }
.t4r-btn:focus-visible, .t4r-btn2:focus-visible, .t4cv-col:focus-visible, .t4cv-band:focus-visible, .t4r-tab:focus-visible, .t4an-seg:focus-visible, [role="slider"]:focus-visible { outline: 2px solid ${C.texto}; outline-offset: 2px; }
.t4r-msg { display: grid; grid-template-columns: 16px minmax(0, 1fr); gap: 4px 8px; padding: 11px 13px; border-radius: 11px; border-left: 3px solid ${C.neutro}; background: rgba(184,196,212,0.12); outline: none; }
.t4r-msg-error { border-left-color: ${C.error}; background: rgba(231,111,81,0.13); }
.t4r-msg p { margin: 0; font-size: 15px; line-height: 22px; overflow-wrap: anywhere; }
.t4r-msg p.t4r-pg { grid-column: 2; font-size: 12px; line-height: 1.4; color: ${C.texto2}; }
.t4r-msg b { font-weight: 700; }
.t4r-marca { display: inline-flex; width: max-content; align-items: center; gap: 4px; height: 20px; padding: 0 7px; border-radius: 999px; background: ${C.fondo}; border: 1px solid ${C.texto}; color: ${C.texto}; font: 600 12px/18px "Inter", sans-serif; white-space: nowrap; pointer-events: none; }
.t4r-marca[data-marca="mal"], .t4r-marca[data-marca="cifra-mal"] { border-color: ${C.error}; }
.t4r-marca[data-marca="mal"] > span:first-child, .t4r-marca[data-marca="cifra-mal"] > span:first-child { color: ${C.error}; }
.t4r-nueva { animation: t4r-aparece .12s ease-out; }
@keyframes t4r-aparece { from { opacity: 0; } to { opacity: 1; } }
@keyframes t4r-vibra { 0%,100% { transform: translateX(0); } 25% { transform: translateX(-4px); } 75% { transform: translateX(4px); } }
.t4r-vibra { animation: t4r-vibra 220ms ease-in-out 1; }
.t4f-sr { position: absolute; width: 1px; height: 1px; padding: 0; margin: -1px; overflow: hidden; clip: rect(0 0 0 0); white-space: nowrap; border: 0; }
@media (prefers-reduced-motion: reduce) { .t4r *, .t4r *::before, .t4r *::after, .t4r-nueva, .t4r-vibra, .t4r-msg { transition: none !important; animation: none !important; } }
`;

/* La devolución, una sola forma (ver arriba). `pagina`: la línea de página, debajo del texto. */
export function Mensaje({ ok, texto, pagina = null, refFoco = null }) {
  const palabra = ok ? PALABRA.ok : PALABRA.error;
  return (
    <div
      ref={refFoco}
      tabIndex={refFoco ? -1 : undefined}
      className={`t4r-msg t4r-nueva${ok ? "" : " t4r-msg-error"}`}
      role="status"
      data-mensaje={ok ? "acierto" : "error"}
      data-panel={ok ? "acierto" : "error"}
    >
      <span aria-hidden="true" style={{ font: "700 15px/22px Inter, sans-serif", color: ok ? C.texto : C.error }}>{ok ? "✓" : "✗"}</span>
      <p data-devolucion>
        {!ok && <span className="t4f-sr">{LECTOR_ERROR} </span>}
        {palabra && <b data-palabra>{palabra}{texto ? " " : ""}</b>}
        {texto}
      </p>
      {pagina && <p className="t4r-pg" data-pagina>{pagina}</p>}
    </div>
  );
}

/* La pastilla con palabra de un destino. Es dibujo: va oculta al lector (el destino dice su estado en su aria-label). */
export function Marca({ marca }) {
  if (!marca) return null;
  const [g, t] = MARCA[marca];
  return (
    <span className="t4r-marca t4r-nueva" data-marca={marca} aria-hidden="true">
      {g && <span>{g}</span>}
      <span>{t}</span>
    </span>
  );
}

/* El botón de seguir de un Hacer del rediseño: neutro blanco, no teal. */
export function SeguirHacer({ children, onClick, refZona }) {
  return (
    <div ref={refZona} style={{ marginTop: "14px" }}>
      <button type="button" className="t4r-btn" data-boton="seguir-hacer" onClick={onClick}>{children}</button>
    </div>
  );
}
