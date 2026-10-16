import { useEffect, useState } from "react";
import { Check, X } from "lucide-react";
import { FAE } from "../../theme.js";
import { FEEDBACK } from "../../data/repasoCap5Comun.js";

/*
 * ═══════════════════════════════════════════════════════════════════════════
 * LO COMÚN DEL REPASO DEL CAPÍTULO 5 (Célula E), AL ESTÁNDAR ÚNICO DE HACER.
 *
 * Fuente: orquestador/conocimiento/prompts/disenadores-de-celula-v1.md, §4
 * (superficie, feedback, contador y botones), §5.2 (color), §5.3 (cifras) y
 * §6 (tamaños). Lo heredan r5-1 a r5-5: ninguna pieza define los suyos.
 *
 *   · la pieza va directo sobre el Panel, sin tarjeta propia; navy #1D3557
 *     es color de MARCA, nunca superficie
 *   · contorno en reposo 1 px rgba(248,249,250,.35); elegido, correcto o
 *     revelado 2 px #F8F9FA; error 2 px coral
 *   · lo que necesita contenedor (cuenta T, asiento, kárdex, panel del mes)
 *     va en el hundido: rgba(10,20,34,.45) con 1 px rgba(248,249,250,.12)
 *   · feedback: la pastilla con ícono y palabra («Correcto», «No va aquí»,
 *     «Iba aquí») y el bloque de mensaje
 *   · «Comprobar» y el avance son el Responder: pastilla teal, texto #06202A
 *   · foco: anillo de 2 px #F8F9FA separado 2 px; nada en ámbar
 *   · cifras en la pila monoespaciada con tabular-nums
 *   · nada bajo 12 px salvo la cejilla del título (10,5)
 * ═══════════════════════════════════════════════════════════════════════════
 */

export const C = {
  /* Figuras, rellenos de barra y la barra de progreso de Contabilidad (§5.2). No es acierto. */
  hecho: "#CBDCF2",
  fondo: "#0E1B2E",
  /* El Panel (§6): solo donde hace falta un fondo opaco (hojas, contador fijo). */
  panel: "#1C2939",
  atenuado: "#B8C4D4",
  /* El atenuado de texto de Contabilidad: contador y botón apagado (§4.3). */
  apagado: "#A8B6C8",
  texto: FAE.text,
  ambar: FAE.ambar,
  teal: FAE.teal,
  coral: FAE.coral,
  /* Texto coral sobre tinte coral (§4.2, §6: 4,73:1). */
  coralTexto: "#EE8266",
  /* Texto del Responder (§4.3). */
  sobreTeal: "#06202A",
};

export const INTER = "Inter, sans-serif";
export const SORA = "Sora, sans-serif";
/* §5.3: la pila monoespaciada publicada, para las cifras de cuentas, asientos, kárdex y saldos. */
export const MONO = "ui-monospace, SFMono-Regular, Menlo, Consolas, monospace";
export const CIFRA = { fontFamily: MONO, fontVariantNumeric: "tabular-nums" };

/* §4.1: la superficie. */
export const REPOSO = "1px solid rgba(248,249,250,0.35)";
export const ELEGIDO = `2px solid ${C.texto}`;
export const HUNDIDO = { background: "rgba(10,20,34,0.45)", border: "1px solid rgba(248,249,250,0.12)" };
/* El hundido visto sobre el Panel, opaco: para recortar una línea detrás de un nombre. */
export const HUNDIDO_OPACO = "#14202F";

/* §6: las marcas de interfaz a 12 px; solo la cejilla del título va a 10,5. */
export const MARCA = { fontFamily: INTER, fontSize: "12px", fontWeight: 700, letterSpacing: "0.06em", textTransform: "uppercase", color: C.atenuado };
export const CEJILLA = { ...MARCA, fontSize: "10.5px", letterSpacing: "0.12em" };
/* §4.3: «{Sustantivo} n de N», 12 px #A8B6C8, sin mayúsculas. */
export const CONTADOR = { fontFamily: INTER, fontSize: "12px", lineHeight: "16px", fontWeight: 600, color: C.apagado };
export const contador = (sustantivo, n, total) => `${sustantivo} ${n} de ${total}`;

export const SOLO_LECTOR = {
  position: "absolute", width: "1px", height: "1px", padding: 0, margin: "-1px",
  overflow: "hidden", clip: "rect(0 0 0 0)", whiteSpace: "nowrap", border: 0,
};

/* §6: el foco es el anillo de 2 px #F8F9FA separado 2 px, en todo control del repaso. */
export const CSS_FOCO = `
[data-r5] button:focus-visible, [data-r5] [tabindex]:focus-visible, [data-r5] input:focus-visible { outline: 2px solid ${C.texto}; outline-offset: 2px; }
[data-r5] input:focus { outline: 2px solid ${C.texto}; outline-offset: 2px; }
`;

/* Lo que oye el lector de pantalla delante del bloque de mensaje (§4.2). */
export const LECTOR = { acierto: "Correcto. ", error: "Incorrecto. " };

/*
 * ═══════════ LOS ESTADOS (§4.1) ═══════════
 *
 *   reposo    1 px rgba(248,249,250,.35), sin relleno
 *   ok        2 px #F8F9FA (correcto o elegido)
 *   mal       2 px coral, sobre tinte coral
 *   revelada  2 px #F8F9FA, sin discontinuo
 */
export const ESTADOS = {
  reposo: { border: REPOSO, background: "transparent" },
  ok: { border: ELEGIDO, background: "transparent" },
  mal: { border: `2px solid ${C.coral}`, background: "rgba(231,111,81,0.10)" },
  revelada: { border: ELEGIDO, background: "transparent" },
};

/* §4.2: «Iba aquí» llega 0,7 s después del error (con movimiento reducido, al instante). */
export const RETRASO_REVELADA = 700;
export function useTrasError(activo, ms = RETRASO_REVELADA) {
  const [listo, setListo] = useState(() => activo && reducidoAhora());
  useEffect(() => {
    if (!activo) { setListo(false); return undefined; }
    if (reducidoAhora()) { setListo(true); return undefined; }
    const id = setTimeout(() => setListo(true), ms);
    return () => clearTimeout(id);
  }, [activo, ms]);
  return listo;
}
function reducidoAhora() {
  try { return Boolean(window.matchMedia?.("(prefers-reduced-motion: reduce)").matches); } catch { return false; }
}

/*
 * ═══════════ LA PASTILLA (§4.2) ═══════════
 *
 * Acierto: Check #F8F9FA + «Correcto». Error: X coral + «No va aquí» (en
 * #EE8266 sobre su tinte); el lector dice «Incorrecto.». Revelada: «Iba aquí»
 * sin ícono; en casilla con cifra, «Iba aquí: {valor}». Íconos de lucide, 16
 * px, trazo 2,5.
 */
export function Pastilla({ estado, valor = null, pieza = null }) {
  if (estado !== "ok" && estado !== "mal" && estado !== "revelada") return null;
  const base = { display: "inline-flex", alignItems: "center", gap: "4px", fontFamily: INTER, fontSize: "12px", fontWeight: 700, lineHeight: "16px", whiteSpace: "nowrap" };
  const datos = { "data-veredicto": estado, ...(pieza ? { "data-marca-pieza": pieza } : {}) };
  if (estado === "ok") {
    return <span {...datos} style={{ ...base, color: C.texto }}><Check size={16} strokeWidth={2.5} color={C.texto} aria-hidden="true" />{FEEDBACK.ok}</span>;
  }
  if (estado === "mal") {
    return (
      <span {...datos} style={{ ...base, color: C.coralTexto }}>
        <X size={16} strokeWidth={2.5} color={C.coral} aria-hidden="true" />
        <span aria-hidden="true">{FEEDBACK.mal}</span>
        <span style={SOLO_LECTOR}>{FEEDBACK.lectorMal}</span>
      </span>
    );
  }
  return <span {...datos} style={{ ...base, color: C.texto }}>{valor === null ? FEEDBACK.revelada : `${FEEDBACK.revelada}: ${valor}`}</span>;
}

/* La marca de una pieza de un renglón calificado (cuenta, valor o lado): la pastilla. */
export function MarcaPieza({ estado, pieza, valor = null }) {
  return <Pastilla estado={estado} pieza={pieza} valor={valor} />;
}

/* La palabra debajo de una pieza calificada, alineada a la derecha. */
export function Veredicto({ estado, valor = null }) {
  if (estado !== "ok" && estado !== "mal" && estado !== "revelada") return null;
  return <span style={{ display: "flex", justifyContent: "flex-end", marginTop: "4px" }}><Pastilla estado={estado} valor={valor} /></span>;
}

/*
 * El acierto o el error de una pregunta en los finales (POR TEMA, la lista de
 * asientos): Check o X, sin puntos ni anillos #CBDCF2 (§4.2).
 */
export function Punto({ ok }) {
  return ok
    ? <Check data-punto="acierto" size={16} strokeWidth={2.5} color={C.texto} aria-hidden="true" style={{ flexShrink: 0 }} />
    : <X data-punto="error" size={16} strokeWidth={2.5} color={C.coral} aria-hidden="true" style={{ flexShrink: 0 }} />;
}

/*
 * ═══════════ EL BLOQUE DE MENSAJE (§4.2) ═══════════
 *
 * Fondo rgba(184,196,212,.12) y raya izquierda de 3 px: #B8C4D4 en el
 * acierto, coral en el error. `r.textos` trae uno o dos párrafos.
 */
export function Devolucion({ r, lector = LECTOR }) {
  const ok = r?.ok;
  return (
    <div aria-live="polite" data-devolucion={r ? (ok ? "acierto" : "error") : "vacia"}>
      {r && (
        <div style={{ marginTop: "14px", padding: "12px 14px", borderRadius: "12px", background: "rgba(184,196,212,0.12)", borderLeft: `3px solid ${ok ? C.atenuado : C.coral}` }}>
          {r.textos.map((t, k) => (
            <p key={k} data-parrafo-devolucion style={{ margin: k ? "10px 0 0" : 0, fontFamily: INTER, fontSize: "14px", lineHeight: 1.5, color: C.texto }}>
              {k === 0 && <span style={SOLO_LECTOR}>{ok ? lector.acierto : lector.error}</span>}
              {t}
            </p>
          ))}
        </div>
      )}
    </div>
  );
}

/*
 * ═══════════ EL RESPONDER (§4.3) ═══════════
 *
 * El de src/components/mecanicas/libros/piezas.jsx, imitado exacto: aquí
 * hacen falta `ref` (el foco baja a él) y `aria-disabled`, que el publicado no
 * tiene, y no se toca piezas.jsx. Pastilla teal de ancho completo, texto
 * #06202A en Sora 14/700; apagado, #A8B6C8 sobre rgba(248,249,250,.07).
 */
export function Responder({ children, onClick, deshabilitado = false, botonRef, etiqueta, datos = {} }) {
  return (
    <button
      ref={botonRef}
      type="button"
      onClick={deshabilitado ? undefined : onClick}
      aria-disabled={deshabilitado ? "true" : undefined}
      aria-label={etiqueta}
      {...datos}
      style={{
        marginTop: "14px", width: "100%", minHeight: "44px", padding: "13px 18px", borderRadius: "999px", border: "none",
        cursor: deshabilitado ? "default" : "pointer",
        background: deshabilitado ? "rgba(248,249,250,0.07)" : C.teal,
        color: deshabilitado ? C.apagado : C.sobreTeal,
        fontFamily: SORA, fontSize: "14px", fontWeight: 700,
      }}
    >
      {children}
    </button>
  );
}

/* «Comprobar»: solo donde la respuesta tiene varios campos o fichas (§4.3). */
export function Comprobar({ activo, onClick, dato = "comprobar" }) {
  return <Responder deshabilitado={!activo} onClick={onClick} datos={{ [`data-${dato}`]: true }}>{FEEDBACK.comprobar}</Responder>;
}

/*
 * El botón de avance: «Siguiente {sustantivo}» y, en el último, «Ver mi
 * resumen». El mismo texto en el aria-label (§4.3).
 */
export const textoDeAvance = (sustantivo, ultimo) => (ultimo ? FEEDBACK.verMiResumen : `Siguiente ${sustantivo.toLowerCase()}`);
export function BotonSiguiente({ onClick, botonRef, sustantivo, ultimo = false }) {
  const texto = textoDeAvance(sustantivo, ultimo);
  return <Responder onClick={onClick} botonRef={botonRef} etiqueta={texto} datos={{ "data-siguiente": true }}>{texto}</Responder>;
}
