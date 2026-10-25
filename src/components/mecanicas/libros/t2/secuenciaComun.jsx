import { useEffect, useState } from "react";
import { FAE } from "../../../../theme.js";
import { HAZ_INICIAL, responderHaz, hazResuelto, mostrarCorrecto } from "../../../secuencia/secuencia.js";
import { barajar } from "../../../../utils/barajar.js";

/*
 * ═══════════════════════════════════════════════════════════════════════════
 * T2 EN SECUENCIA — las piezas de dibujo que comparten las cinco figuras.
 *
 * Es de la Célula C (t2/), no del compartido: SecuenciaAprender, secuencia.js
 * y <Veredicto /> se importan tal cual y no se copian ni se envuelven.
 *
 * Colores con rol (Watari T2-3): teal solo para DEBE; ámbar para HABER; coral
 * solo para el error, punteado; blanco para el estado correcto. Los controles
 * de la figura son neutros, de 1 px de contorno y 44 px de alto. Movimiento:
 * la curva de la casa, solo transform y opacity, una vez; con movimiento
 * reducido, el estado final.
 *
 * ═══════════ LA MARCA DEL CONTROL TOCADO (Watari T2-7) ═══════════
 *
 * La pastilla sale de la figura: la pinta <Veredicto />, y hasta #536 no
 * tiene sitio (ver contabilidadT2Secuencia.js, «La devolución»). El control
 * tocado se queda con su ícono ✓ o ✕ (forma, no solo color), borde de 2 px y
 * la palabra en su nombre accesible: «{opción}, correcto» o «{opción}, no va
 * aquí». Al segundo error, el control bueno pasa a borde blanco con ✓.
 * ═══════════════════════════════════════════════════════════════════════════
 */

export const CURVA = "cubic-bezier(.3,.9,.4,1)";
export const DEBE = FAE.teal;
export const HABER = FAE.ambar;
export const BLANCO = "#F8F9FA";
export const LINEA = "rgba(248,249,250,0.55)";
export const CONTORNO = "rgba(248,249,250,0.32)";
export const SUAVE = "rgba(248,249,250,0.8)";
export const SECUNDARIO = "#A8B6C8";

export const ESTILOS = `
@keyframes fae-t2s-entra { from { opacity: 0; transform: translateY(-10px); } to { opacity: 1; transform: none; } }
@keyframes fae-t2s-raya { from { transform: scaleY(0); } to { transform: scaleY(1); } }
@keyframes fae-t2s-cae { from { opacity: 0; transform: translateY(-8px); } to { opacity: 1; transform: none; } }
@keyframes fae-t2s-cruza { from { opacity: 0; transform: translateX(-16px); } to { opacity: 1; transform: none; } }
.fae-t2s-llega { animation: fae-t2s-entra 360ms ${CURVA} both; }
.fae-t2s-raya-baja { transform-origin: top; animation: fae-t2s-raya 420ms ${CURVA} both; }
.fae-t2s-cae { animation: fae-t2s-cae 240ms ${CURVA} both; }
.fae-t2s-cruza { animation: fae-t2s-cruza 320ms ${CURVA} both; }
.fae-t2s-gira { transition: transform 420ms ${CURVA}; }
.fae-t2s-boton { transition: transform 160ms ${CURVA}; }
.fae-t2s-boton:active:not([disabled]) { transform: scale(.97); transition-duration: 100ms; }
.fae-t2s-boton:focus-visible { outline: 2px solid #F8F9FA; outline-offset: 2px; }
@media (prefers-reduced-motion: reduce) {
  .fae-t2s-llega, .fae-t2s-raya-baja, .fae-t2s-cae, .fae-t2s-cruza { animation: none !important; }
  .fae-t2s-boton, .fae-t2s-gira { transition: none; }
}
`;

export const pesos = (n) => `${n < 0 ? "−" : ""}$${String(Math.round(Math.abs(n))).replace(/\B(?=(\d{3})+(?!\d))/g, ".")}`;
export const suma = (xs) => xs.reduce((a, b) => a + b, 0);

export const raiz = { width: "100%", fontFamily: "Inter, sans-serif", color: FAE.text };

/* La raíz de cada figura: el estilo una vez y el ancho entero. */
export const Raiz = ({ children, style }) => (
  <div style={{ ...raiz, ...style }}>
    <style>{ESTILOS}</style>
    {children}
  </div>
);

/* El nombre de la cuenta sobre la barra de la T. */
export function Encabezado({ nombre, chico }) {
  return (
    <p style={{ margin: 0, padding: "0 0 2px", textAlign: "center", fontFamily: "Sora, sans-serif", fontSize: chico ? "12px" : "14px", fontWeight: 700, lineHeight: chico ? "15px" : "18px", borderBottom: `2px solid ${LINEA}`, overflowWrap: "anywhere" }}>
      {nombre}
    </p>
  );
}

/* Una cifra. `marca`: "bien" (borde blanco) o "error" (coral punteado: la figura no guarda un estado falso). */
export function Cifra({ valor, fecha, marca, clase, chico }) {
  const borde = marca === "error" ? `2px dashed ${FAE.coral}` : marca === "bien" ? `2px solid ${BLANCO}` : "2px solid transparent";
  return (
    <span className={clase} data-cifra={marca || undefined} style={{
      display: "flex", justifyContent: fecha ? "space-between" : "center", gap: "6px", padding: "0 6px", borderRadius: "6px", border: borde,
      fontSize: chico ? "12px" : "14px", lineHeight: chico ? "16px" : "20px", fontVariantNumeric: "tabular-nums", color: marca === "error" ? FAE.coral : FAE.text,
    }}>
      {fecha && <span style={{ fontSize: "12px", color: SECUNDARIO }}>{fecha}</span>}
      <span>{valor}</span>
    </span>
  );
}

/*
 * El nombre de un lado, 12 px. El color del rol (DEBE teal, HABER ámbar) va en
 * la raya de debajo y no en la letra: teal a 12 px sobre el Panel mide 4,47:1
 * (sonda de contraste, 24-oct), bajo el 4,5 que pide el texto normal.
 */
export const Rotulo = ({ lado, children }) => (
  <span style={{ display: "block", textAlign: "center", fontSize: "12px", lineHeight: "14px", fontWeight: 700, letterSpacing: "0.06em", color: FAE.text }}>
    <span style={{ borderBottom: `2px solid ${lado === "debe" ? DEBE : HABER}` }}>{children}</span>
  </span>
);

/* Los íconos de la marca: lucide Check y X, trazo 2,5, 16 px (CSS del delta T2-7). */
export function IconoMarca({ marca }) {
  if (!marca) return null;
  const mal = marca === "mal";
  return (
    <svg aria-hidden="true" viewBox="0 0 24 24" width="16" height="16" fill="none" stroke={mal ? FAE.coral : BLANCO} strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" style={{ flex: "none" }}>
      {mal ? <><path d="M18 6 6 18" /><path d="m6 6 12 12" /></> : <path d="M20 6 9 17l-5-5" />}
    </svg>
  );
}

/* «{opción}, correcto» o «{opción}, no va aquí»: la palabra va en el nombre accesible. */
export const etiquetaCon = (texto, marca) => (marca === "mal" ? `${texto}, no va aquí` : marca === "bien" || marca === "verdad" ? `${texto}, correcto` : texto);

const bordeDe = (marca, elegido) => (
  marca === "mal" ? `2px solid ${FAE.coral}`
    : marca ? `2px solid ${BLANCO}`
      : `1px solid ${elegido ? BLANCO : CONTORNO}`
);

/* Un lado de la T, o un destino. Si recibe onClick es un botón (44 px como mínimo). */
export function Lado({ onClick, etiqueta, elegido, marca, children, derecha, disabled, style }) {
  const base = {
    flex: "1 1 0", minWidth: 0, minHeight: "44px", boxSizing: "border-box", padding: "4px 4px 6px",
    display: "flex", flexDirection: "column", gap: "2px", alignItems: "stretch",
    ...(derecha ? { borderLeft: `2px solid ${LINEA}` } : {}), ...style,
  };
  if (!onClick) return <div style={base}>{children}</div>;
  return (
    <button
      type="button"
      className="fae-t2s-boton"
      onClick={onClick}
      disabled={disabled}
      aria-label={etiquetaCon(etiqueta, marca)}
      aria-pressed={elegido ? "true" : "false"}
      data-marca={marca || undefined}
      style={{
        ...base, position: "relative", cursor: disabled ? "default" : "pointer", color: FAE.text, font: "inherit",
        background: elegido ? "rgba(248,249,250,0.06)" : "transparent", border: bordeDe(marca, elegido), borderRadius: "8px",
        ...(marca ? { padding: "3px 3px 5px" } : {}),
      }}
    >
      {marca && <span style={{ position: "absolute", top: "3px", right: "3px" }}><IconoMarca marca={marca} /></span>}
      {children}
    </button>
  );
}

/* Un control de la figura: neutro, contorno de 1 px, 44 px. Tocado y calificado: ícono + borde de 2 px. */
export function Control({ children, etiqueta, onClick, elegido, marca, disabled, chico, style }) {
  const texto = etiqueta ?? (typeof children === "string" ? children : undefined);
  return (
    <button
      type="button"
      className="fae-t2s-boton"
      onClick={onClick}
      disabled={disabled}
      aria-label={marca && texto ? etiquetaCon(texto, marca) : undefined}
      aria-pressed={elegido === undefined ? undefined : elegido ? "true" : "false"}
      data-marca={marca || undefined}
      style={{
        flex: "1 1 0", minWidth: 0, minHeight: "44px", borderRadius: "999px", padding: marca ? "0 9px" : "0 10px", boxSizing: "border-box",
        display: "inline-flex", alignItems: "center", justifyContent: "center", gap: "6px",
        background: "transparent", color: disabled && !marca ? SECUNDARIO : FAE.text, cursor: disabled ? "default" : "pointer",
        border: bordeDe(marca, elegido), fontFamily: "Inter, sans-serif", fontSize: chico ? "13px" : "14px", lineHeight: chico ? "16px" : "18px", fontWeight: 600, ...style,
      }}
    >
      <IconoMarca marca={marca} />
      <span>{children}</span>
    </button>
  );
}

/* ═══════════ EL ORDEN BARAJADO (lote A de la auditoría T2-9 de Mello) ═══════════
 *
 * Un solo ayudante para las nueve pantallas donde el orden no significa nada
 * (P1·6, P2·4, P2·6, P2·7, P3·4, P3·7, P4·6, P4·8 y P5·6). Baraja UNA vez con
 * `barajar` (utils/barajar.js, compartido) y guarda el orden en el estado de
 * la pantalla, `orden`: una permutación de 0…n−1. SecuenciaAprender guarda ese
 * estado, así que «Anterior», un error o recargar no lo cambian; otra visita
 * (estado nuevo) baraja otra vez. Lo que enseña con su orden NO pasa por aquí:
 * debe a la izquierda y haber a la derecha, las casas y los platillos de la
 * ecuación, los cajones «Sigue» y «Vuelve a cero», y las predicciones.
 */
export const ordenValido = (orden, n) =>
  Array.isArray(orden) && orden.length === n && [...orden].sort((a, b) => a - b).every((v, i) => v === i);

export function useBarajado(estado, setEstado, n, base = HAZ_INICIAL) {
  const guardado = estado?.orden;
  const valido = ordenValido(guardado, n);
  const [nuevo] = useState(() => (valido ? guardado : barajar([...Array(n).keys()])));
  useEffect(() => {
    if (!valido) setEstado((antes) => (ordenValido(antes?.orden, n) ? antes : { ...(antes ?? base), orden: nuevo }));
  }, [valido]);
  return valido ? guardado : nuevo;
}

/** Los elementos en el orden barajado. */
export const enOrden = (xs, orden) => orden.map((i) => xs[i]);

export const Fila = ({ children, style }) => <div style={{ display: "flex", gap: "8px", marginTop: "8px", ...style }}>{children}</div>;

/* ═══════════ EL HAZ CALIFICADO DE UNA SOLA RESPUESTA ═══════════ */

/* Responde con responderHaz (del compartido) y recuerda qué se tocó. Resuelto, ya no cambia. */
export const responder = (setEstado, correcto, eleccion) =>
  setEstado((antes) => (hazResuelto(antes) ? antes : { ...(antes ?? HAZ_INICIAL), ...responderHaz(antes, correcto), eleccion }));

/** Lo que muestra la figura: la verdad (acierto o dos errores) o el error a la vista. */
export const leerHaz = (estado) => {
  const e = estado ?? HAZ_INICIAL;
  const verdad = e.ok || mostrarCorrecto(e);
  return { e, resuelto: hazResuelto(e), verdad, error: !verdad && e.ultimo === "error" };
};

/** La marca de una opción: la tocada lleva ✓ o ✕; con dos errores, la buena pasa a borde blanco. */
export function marcaDe(estado, opcion, buena) {
  const e = estado ?? HAZ_INICIAL;
  if (e.eleccion === opcion && e.ultimo) return e.ok ? "bien" : "mal";
  if (mostrarCorrecto(e) && opcion === buena) return "verdad";
  return null;
}

/* ═══════════ EL HAZ DE VARIAS FICHAS (escalera por ficha) ═══════════
 *
 * P2·7 (seis cuentas), P3·3 (dos), P4·5 (tres familias) y P5·5 (cuatro
 * líneas). Cada ficha lleva su propio Haz con responderHaz, y la pantalla se
 * resuelve cuando todas lo están: `resuelta: colaResuelta`, que es
 * hazResuelto aplicado a cada ficha. Arriba se copia el Haz de la última
 * ficha respondida (intentos, ok, ultimo), así <Veredicto /> y mensajeDe()
 * leen el estado de esa ficha sin saber que hay varias.
 */
export const colaInicial = (n) => ({ ...HAZ_INICIAL, cola: Array.from({ length: n }, () => HAZ_INICIAL), destinos: Array(n).fill(null), item: null, eleccion: null });

export const colaResuelta = (estado) => Array.isArray(estado?.cola) && estado.cola.length > 0 && estado.cola.every(hazResuelto);

/* La ficha en juego. Con `orden` (P2·7, barajada) se sigue ese orden; el índice es siempre el de la lista original. */
export const fichaActual = (estado) => {
  const cola = estado?.cola ?? [];
  const orden = ordenValido(estado?.orden, cola.length) ? estado.orden : [...cola.keys()];
  return orden.find((i) => !hazResuelto(cola[i])) ?? -1;
};

export function responderCola(setEstado, esCorrecto, destino) {
  setEstado((antes) => {
    const k = fichaActual(antes);
    if (k < 0) return antes;
    const r = responderHaz(antes.cola[k], esCorrecto(k, destino));
    const cola = antes.cola.map((x, i) => (i === k ? r : x));
    const destinos = antes.destinos.map((x, i) => (i === k ? destino : x));
    return { ...antes, cola, destinos, item: k, eleccion: destino, intentos: r.intentos, ok: r.ok, ultimo: r.ultimo };
  });
}

/** La marca de un destino en la escalera: la de la última ficha respondida, si sigue a la vista. */
export function marcaDestino(estado, destino, buenoDe) {
  if (!estado || estado.item === null || estado.item === undefined) return null;
  const k = estado.item;
  const r = estado.cola[k];
  if (estado.eleccion === destino && r.ultimo) return r.ok ? "bien" : "mal";
  if (mostrarCorrecto(r) && destino === buenoDe(k)) return "verdad";
  return null;
}

/* ═══════════ LA DEVOLUCIÓN, PARA LA BANDA DE #536 ═══════════
 *
 * Lo que <Veredicto /> y la frase de consecuencia dirían ahora mismo, como
 * datos. La figura no lo pinta (no cabe en su alto: Watari T2-7); la prueba lo
 * lee, y la banda de #536 lo pintará. `pantalla.devolucion(estado)` devuelve
 * { pista, porque, consecuencia } de la ficha o la opción en juego.
 */
export function mensajeDe(pantalla, estado) {
  if (!estado?.ultimo) return null;
  if (estado.ultimo === "acierto") return { palabra: "Correcto" };
  const d = pantalla.devolucion?.(estado) ?? {};
  if (mostrarCorrecto(estado)) return { palabra: "No va aquí", porque: d.porque ?? null };
  return { palabra: "No va aquí", consecuencia: d.consecuencia ?? null, pista: d.pista ?? null };
}
