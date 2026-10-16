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
 *   · Mensaje: UNA forma de devolución, el bloque del modelo (H1): fondo
 *     neutro rgba(184,196,212,.12) también en el error, y raya de 3 px neutra
 *     o coral. Acierto: Check de lucide, «Correcto.» y el texto. Error: X de
 *     lucide y el texto; «Incorrecto.» solo para el lector de pantalla
 *   · Marca: la pastilla de un destino, con Check o X de lucide (16 px, trazo
 *     2,5) y la palabra: «Correcto», «No va aquí», «Iba aquí» o «Iba aquí:
 *     {valor}» (prompt maestro §4.2). Nada de ✓/✗ de texto
 *   · Avance: el botón de avance y «Comprobar» de los Hacer (y el «Comprobar»
 *     de A2 P5): el Responder compartido, sin cambios, teal con texto #06202A
 *     (prompt maestro §4.3; bloque P2 de Hanayama, §3.4). `data-boton` va en
 *     el envoltorio, porque Responder no acepta atributos
 *   · SeguirAprender: el «Seguir» de Aprender, el secundario neutro de
 *     CuatroCapas copiado por valor (#B8C4D4 con texto navy, 6,99:1)
 *   · LineaMarcas: la pastilla de los destinos angostos (opciones de cifra,
 *     casillas, Sube/Baja), en una línea propia debajo del grupo (P2, §3.5)
 * ═══════════════════════════════════════════════════════════════════════════
 */
import { Check, X } from "lucide-react";
import { FAE } from "../../theme.js";
import { PALABRA, LECTOR_ERROR, MARCA } from "../../data/contabilidadT4.js";
import { Responder } from "../mecanicas/libros/piezas.jsx";

export const C = {
  fondo: FAE.bg, texto: FAE.text, texto2: "#A8B6C8", neutro: "#B8C4D4", navy: FAE.navy,
  /* #3FA69A: el teal para TEXTO pequeño sobre la tarjeta (prompt maestro §5.2): 4,75:1 sobre #1F2D3D; #2A9D8F da 4,21 y falla. Rellenos y líneas siguen en #2A9D8F. */
  debe: FAE.teal, debeTexto: "#3FA69A", haber: FAE.ambar, error: FAE.coral,
  /* El contorno de un destino en reposo, y el contenedor hundido de Cuentas (prompt maestro §4.1). */
  reposo: "rgba(248,249,250,0.35)", hundido: "rgba(10,20,34,0.45)", hundidoBorde: "rgba(248,249,250,0.12)",
};

/* Los íconos de la marca y del mensaje: lucide, 16 px, trazo 2,5 (prompt maestro §4.2). */
export const IconoBien = ({ size = 16 }) => <Check size={size} strokeWidth={2.5} color={C.texto} aria-hidden="true" data-icono="check" />;
export const IconoMal = ({ size = 16 }) => <X size={size} strokeWidth={2.5} color={C.error} aria-hidden="true" data-icono="x" />;

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
.t4r-seguir { appearance: none; width: 100%; min-height: 44px; border-radius: 999px; border: 2px solid ${C.neutro}; background: ${C.neutro}; color: ${C.navy}; font: 600 14px "Sora", "Inter", sans-serif; cursor: pointer; }
[data-avance-t4] > button:focus-visible { outline: 2px solid ${C.texto}; outline-offset: 2px; }
.t4r-aviso { margin: 8px 0 0; font-size: 13px; line-height: 1.4; color: ${C.texto2}; }
.t4r-aviso:empty { margin: 0; }
.t4r-btn2 { appearance: none; min-height: 44px; border-radius: 8px; border: 1px solid ${C.neutro}; background: transparent; color: ${C.texto}; font: 600 14px "Inter", sans-serif; cursor: pointer; padding: 0 12px; white-space: nowrap; }
.t4r-btn2[aria-disabled="true"] { color: ${C.texto2}; border-color: rgba(184,196,212,0.4); cursor: default; }
.t4r-seguir:focus-visible, .t4r-btn2:focus-visible, .t4cv-col:focus-visible, .t4cv-band:focus-visible, .t4r-tab:focus-visible, .t4an-seg:focus-visible, [role="slider"]:focus-visible { outline: 2px solid ${C.texto}; outline-offset: 2px; }
.t4r-msg { display: grid; grid-template-columns: 16px minmax(0, 1fr); gap: 4px 8px; padding: 11px 13px; border-radius: 11px; border-left: 3px solid ${C.neutro}; background: rgba(184,196,212,0.12); outline: none; }
.t4r-msg-error { border-left-color: ${C.error}; }
.t4r-msg > svg { margin-top: 3px; }
.t4r-msg p { margin: 0; font-size: 15px; line-height: 22px; overflow-wrap: anywhere; }
.t4r-msg p.t4r-pg { grid-column: 2; font-size: 12px; line-height: 1.4; color: ${C.texto2}; }
.t4r-msg b { font-weight: 700; }
.t4r-marca { display: inline-flex; width: max-content; align-items: center; gap: 4px; height: 20px; padding: 0 7px; border-radius: 999px; background: ${C.fondo}; border: 1px solid ${C.texto}; color: ${C.texto}; font: 600 12px/18px "Inter", sans-serif; white-space: nowrap; pointer-events: none; }
.t4r-marca[data-marca="mal"] { border-color: ${C.error}; }
.t4r-marca > svg { flex: none; }
.t4r-linea { display: grid; min-height: 0; }
.t4r-nueva { animation: t4r-aparece .12s cubic-bezier(.3,.9,.4,1); }
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
      {ok ? <IconoBien /> : <IconoMal />}
      <p data-devolucion>
        {!ok && <span className="t4f-sr">{LECTOR_ERROR} </span>}
        {palabra && <b data-palabra>{palabra}{texto ? " " : ""}</b>}
        {texto}
      </p>
      {pagina && <p className="t4r-pg" data-pagina>{pagina}</p>}
    </div>
  );
}

/*
 * La pastilla con palabra de un destino. Es dibujo: va oculta al lector (el
 * destino dice su estado en su aria-label). `valor`: en una casilla con cifra,
 * «Iba aquí: {valor}». Las palabras son las de MARCA, y nada más.
 */
export function Marca({ marca, valor = null }) {
  if (!marca) return null;
  const t = marca === "era" && valor != null ? `${MARCA.era}: ${valor}` : MARCA[marca];
  return (
    <span className="t4r-marca t4r-nueva" data-marca={marca} aria-hidden="true">
      {marca === "bien" && <IconoBien />}
      {marca === "mal" && <IconoMal />}
      <span>{t}</span>
    </span>
  );
}

/*
 * El botón de avance y «Comprobar»: el Responder compartido, sin cambios (teal,
 * texto #06202A, Sora 14/700). Nunca se apaga: con algo incompleto, quien lo
 * usa muestra su aviso. `nombre` va a `data-boton` en el envoltorio.
 */
export function Avance({ children, onClick, refZona = null, nombre = "seguir-hacer" }) {
  return <div ref={refZona} data-avance-t4 data-boton={nombre}><Responder onClick={onClick}>{children}</Responder></div>;
}

/* El «Seguir» de Aprender: el secundario neutro de CuatroCapas, copiado por valor. */
export function SeguirAprender({ onClick, children, nueva = false }) {
  return <button type="button" className={`t4r-seguir${nueva ? " t4r-nueva" : ""}`} data-boton="seguir" onClick={onClick}>{children}</button>;
}

/*
 * La línea de marcas: debajo de un grupo de destinos angostos, con sus mismas
 * columnas. La pastilla empieza en el borde izquierdo de su destino (en la
 * última columna de un grupo de 3 o más, termina en su borde derecho) y puede
 * salirse de su columna; si la vecina de la izquierda también lleva pastilla,
 * baja a una segunda línea. Sin medir nada en JavaScript.
 *   marcas: { [columna]: { marca, valor? } }
 */
export function LineaMarcas({ columnas, marcas, gap = 8, reservar = false }) {
  const ks = Object.keys(marcas).filter((k) => marcas[k]?.marca).map(Number).sort((a, b) => a - b);
  if (!ks.length) return reservar ? <div className="t4r-linea" data-linea-marcas="0" aria-hidden="true" style={{ minHeight: "20px" }} /> : null;
  const fila = {};
  ks.forEach((k) => { fila[k] = marcas[k - 1]?.marca && fila[k - 1] === 1 ? 2 : 1; });
  return (
    <div className="t4r-linea" data-linea-marcas={Math.max(...Object.values(fila))} aria-hidden="true"
      style={{ gridTemplateColumns: `repeat(${columnas}, minmax(0, 1fr))`, gap: `4px ${gap}px`, minHeight: reservar ? "20px" : undefined }}>
      {ks.map((k) => (
        <div key={k} style={{ gridColumn: `${k + 1}`, gridRow: `${fila[k]}`, display: "flex", justifyContent: k === columnas - 1 && columnas > 2 ? "flex-end" : "flex-start", minWidth: 0, overflow: "visible", position: "relative", zIndex: 1 }}>
          <Marca marca={marcas[k].marca} valor={marcas[k].valor} />
        </div>
      ))}
    </div>
  );
}
