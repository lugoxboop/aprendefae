import { useEffect, useId, useRef, useState } from "react";
import { FAE } from "../../../../theme.js";
import { COLOR } from "../../../../data/contabilidadTema3.js";
import { useReducido } from "../tema3/DosLineas.jsx";
import EstilosT5, { CLASE_T5 } from "../tema5/EstilosT5.jsx";

/*
 * ═══════════════════════════════════════════════════════════════════════════
 * TEMA 6 · CAPA 3 · LAS CAJAS QUE SE ABREN (Célula B).
 *
 * Las cajas de T5 · A1, sacadas de SeisHechos (pieza 1) para que la pieza 2
 * (los dos métodos) no las copie. Tocar una caja revela su texto y no se
 * vuelve a cerrar; con todas abiertas aparece el bloque final. Sin color de
 * acierto ni de error y sin teal ni ámbar: el resultado lo dice la palabra.
 * Cada caja y el bloque final llevan su pie de fuente; un pie en null no se
 * pinta. `estiloTitulo` deja que cada pieza escriba el nombre de la caja con
 * su letra (los hechos en Inter, los métodos en Sora 14/600). Con `cifras`
 * (T5 · A2), la caja cerrada muestra bajo el nombre una línea por cifra.
 * ═══════════════════════════════════════════════════════════════════════════
 */

const SORA = "Sora, sans-serif";
const INTER = "Inter, sans-serif";
const BORDES = COLOR.neutro;
const ATENUADO = "rgba(184,196,212,.50)";
export const LECTURA = { margin: 0, fontFamily: INTER, fontSize: "14px", lineHeight: 1.55, fontWeight: 400, color: FAE.text };
export const PIE = { margin: "8px 0 0", fontFamily: INTER, fontSize: "12px", lineHeight: "16px", color: COLOR.apagado };

/* Con la decisión (hoja 6) el chevrón se queda y gira 180° al abrir (200 ms): el nombre no cambia de renglones. */
function Chevron({ abierto = false, reducido = true }) {
  return (
    <svg aria-hidden="true" data-chevron width="20" height="20" viewBox="0 0 20 20" style={{
      flex: "0 0 auto", transform: abierto ? "rotate(180deg)" : "none", transition: reducido ? "none" : "transform 200ms ease",
    }}>
      <polyline points="5,8 10,13 15,8" fill="none" stroke={BORDES} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

/*
 * ═══════════ DECIDIR ANTES DE REVELAR (hoja 6 de Mai, entrega 2 de Futaba) ═══════════
 *
 * `caja.decide` = { pregunta, opciones: [{ id, texto }], correcta, falla }:
 * `falla` es la devolución si se elige otra (un texto para todas, o uno por
 * opción). Abierta, la caja pide la decisión: la pregunta (Sora 600 13/1,35)
 * y las opciones con la forma de las de UnaFrase, en el orden de Futaba (no
 * se barajan). Un intento, sin puntaje y sin botón: al elegir, la correcta
 * queda con el resalte de la serie (borde 2 nodo, relleno navy y 1 px menos
 * de relleno: nada se mueve), la elegida mala tachada y a opacidad entera, y
 * las demás al 0,5. Debajo, si falló, la devolución con la forma de la de
 * UnaFrase (sin coral) y, siempre, el texto de antes con su filete y su pie.
 * `forma`: «fila» (separación 4, relleno 10/3, centrado) o «columna»
 * (separación 6, relleno 10/12, a la izquierda), una por pieza.
 */
const PREGUNTA = { margin: 0, fontFamily: SORA, fontSize: "13px", fontWeight: 600, lineHeight: 1.35, color: FAE.text };
const DEVOLUCION = {
  margin: "0 14px 12px", padding: "11px 13px", borderRadius: "12px", fontFamily: INTER, fontSize: "13px", lineHeight: 1.55,
  color: "rgba(248,249,250,0.88)", background: "rgba(184,196,212,0.1)", borderLeft: `3px solid ${BORDES}`,
};
const ESTILOS_DECIDE = `
@keyframes b5-decide-aparece { from { opacity: 0; } to { opacity: 1; } }
.b5-decide-aparece { animation: b5-decide-aparece 240ms ease-out both; }
@media (prefers-reduced-motion: reduce) { .b5-decide-aparece { animation: none; } }
`;
export const fallaDe = (decide, elegida) => (elegida && elegida !== decide.correcta
  ? (typeof decide.falla === "string" ? decide.falla : decide.falla[elegida])
  : null);

function Opcion({ opcion, forma, elegida, correcta, reducido, onElegir }) {
  const decidida = elegida !== null;
  const esCorrecta = decidida && opcion.id === correcta;
  const tachada = decidida && opcion.id === elegida && !esCorrecta;
  const fila = forma === "fila";
  const d = esCorrecta ? 1 : 0;
  return (
    <button
      type="button"
      data-opcion={opcion.id}
      data-marca={!decidida ? "" : esCorrecta ? "correcta" : tachada ? "tachada" : "apagada"}
      aria-pressed={opcion.id === elegida}
      aria-disabled={decidida || undefined}
      onClick={() => { if (!decidida) onElegir(opcion.id); }}
      style={{
        ...(fila ? { flex: "1 1 0", minWidth: 0, textAlign: "center" } : { width: "100%", textAlign: "left" }),
        minHeight: "44px", boxSizing: "border-box", borderRadius: "11px",
        padding: fila ? `${10 - d}px ${3 - d}px` : `${10 - d}px ${12 - d}px`,
        border: esCorrecta ? `2px solid ${FAE.node}` : "1px solid rgba(248,249,250,0.36)",
        background: esCorrecta ? FAE.navy : "rgba(10,20,34,0.4)",
        color: FAE.text, fontFamily: INTER, fontSize: "12.5px", fontWeight: 400, lineHeight: 1.45,
        textDecoration: tachada ? "line-through" : "none", textDecorationThickness: tachada ? "1.5px" : undefined,
        opacity: decidida && !esCorrecta && !tachada ? 0.5 : 1,
        transition: reducido ? "none" : "opacity 200ms ease",
        cursor: decidida ? "default" : "pointer",
      }}
    >
      {opcion.texto}
    </button>
  );
}

/* Desplazamiento mínimo para que `nodo` se vea entero (Mai §4). */
const asomar = (nodo, reducido) => nodo?.scrollIntoView?.({ block: "nearest", behavior: reducido ? "auto" : "smooth" });

export function Caja({ caja, abierto, onAbrir, estiloTitulo = LECTURA, forma = "columna", elegida = null, onElegir = () => {} }) {
  const id = useId();
  const reducido = useReducido();
  const decide = caja.decide;
  const decidida = elegida !== null;
  const muestraTexto = abierto && (!decide || decidida);
  const falla = decide ? fallaDe(decide, elegida) : null;
  const aparece = reducido ? undefined : "b5-decide-aparece";
  const zonaDecide = useRef(null);
  const zonaDevolucion = useRef(null);
  const primerRenglon = useRef(null);

  /* Al abrir: la pregunta y todas las opciones. Al elegir: la devolución entera, o el primer renglón del texto. */
  useEffect(() => { if (decide && abierto && !decidida) asomar(zonaDecide.current, reducido); }, [abierto]); // eslint-disable-line react-hooks/exhaustive-deps
  useEffect(() => { if (decidida) asomar(falla ? zonaDevolucion.current : primerRenglon.current, reducido); }, [decidida]); // eslint-disable-line react-hooks/exhaustive-deps

  const chevron = decide ? <Chevron abierto={abierto} reducido={reducido} /> : !abierto && <Chevron />;
  return (
    <div data-hecho={caja.id} data-decidida={decide ? (decidida ? "si" : "no") : undefined} style={{ border: `1px solid ${BORDES}`, borderRadius: "12px" }}>
      {decide && <style>{ESTILOS_DECIDE}</style>}
      <button
        type="button"
        aria-expanded={abierto}
        aria-disabled={abierto || undefined}
        aria-controls={id}
        onClick={() => { if (!abierto) onAbrir(); }}
        style={{
          display: caja.cifras ? "block" : "flex", alignItems: "center", justifyContent: "space-between", gap: "8px",
          width: "100%", minHeight: "44px", padding: "12px 14px", boxSizing: "border-box",
          background: "transparent", border: "none", borderRadius: "12px", textAlign: "left",
          cursor: abierto ? "default" : "pointer", color: FAE.text,
        }}
      >
        {caja.cifras ? (
          <>
            <span style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: "8px" }}>
              <span style={estiloTitulo}>{caja.titulo}</span>
              {chevron}
            </span>
            <span data-cifras style={{ display: "block", marginTop: "4px" }}>
              {caja.cifras.map((c) => <span key={c} style={{ ...LECTURA, display: "block" }}>{c}</span>)}
            </span>
          </>
        ) : (
          <>
            <span style={estiloTitulo}>{caja.titulo}</span>
            {chevron}
          </>
        )}
      </button>
      {decide && abierto && (
        <div ref={zonaDecide} data-decide={caja.id} className={aparece} style={{ padding: "0 14px 12px" }}>
          <p id={`${id}-pregunta`} data-pregunta style={PREGUNTA}>{decide.pregunta}</p>
          <div role="group" aria-labelledby={`${id}-pregunta`} data-opciones={forma} style={{
            display: "flex", flexDirection: forma === "fila" ? "row" : "column", gap: forma === "fila" ? "4px" : "6px", marginTop: "8px",
          }}>
            {decide.opciones.map((o) => (
              <Opcion key={o.id} opcion={o} forma={forma} elegida={elegida} correcta={decide.correcta} reducido={reducido} onElegir={onElegir} />
            ))}
          </div>
        </div>
      )}
      <div id={id} data-revela={caja.id} aria-live="polite">
        {falla && <p ref={zonaDevolucion} data-devolucion className={aparece} style={DEVOLUCION}>{falla}</p>}
        {muestraTexto && (
          <div className={decide ? aparece : undefined} style={{ margin: "0 14px 12px", paddingTop: "10px", borderTop: `1px solid ${ATENUADO}`, position: "relative" }}>
            {/* El primer renglón del texto (14 × 1,55): hasta ahí se desplaza al acertar. */}
            <span ref={primerRenglon} aria-hidden="true" style={{ position: "absolute", left: 0, top: 0, width: "1px", height: "31.7px", pointerEvents: "none" }} />
            <p style={LECTURA}>{caja.revela}</p>
            {caja.pie && <p data-pie style={PIE}>{caja.pie}</p>}
          </div>
        )}
      </div>
    </div>
  );
}

export default function CajasQueRevelan({ consigna, contexto = null, cajas, final, estiloTitulo = LECTURA, forma = "columna", atributos = {} }) {
  const reducido = useReducido();
  const [abiertos, setAbiertos] = useState(() => new Set());
  const [elecciones, setElecciones] = useState(() => ({}));
  const bloqueFinal = useRef(null);
  /* El final, cuando se han decidido todas (o, sin decisión, abierto todas). */
  const lista = (x) => (x.decide ? elecciones[x.id] !== undefined : abiertos.has(x.id));
  const todos = cajas.every(lista);

  useEffect(() => {
    if (todos) bloqueFinal.current?.scrollIntoView?.({ block: "nearest", behavior: reducido ? "auto" : "smooth" });
  }, [todos]); // eslint-disable-line react-hooks/exhaustive-deps

  return (
    <div {...atributos} className={CLASE_T5}>
      <EstilosT5 />
      <p style={{ ...LECTURA, fontFamily: SORA }}>{consigna}</p>
      {contexto && <p style={{ ...LECTURA, marginTop: "12px" }}>{contexto}</p>}
      <div style={{ display: "flex", flexDirection: "column", gap: "8px", marginTop: "12px" }}>
        {cajas.map((x) => (
          <Caja key={x.id} caja={x} estiloTitulo={estiloTitulo} forma={forma} abierto={abiertos.has(x.id)} onAbrir={() => setAbiertos((s) => new Set(s).add(x.id))}
            elegida={elecciones[x.id] ?? null} onElegir={(o) => setElecciones((e) => ({ ...e, [x.id]: o }))} />
        ))}
      </div>
      <div ref={bloqueFinal} data-final aria-live="polite">
        {todos && (
          <div style={{ marginTop: "16px", padding: "12px 14px", borderRadius: "12px", border: `1px solid ${BORDES}`, background: FAE.navy, display: "flex", flexDirection: "column", gap: "8px" }}>
            {(Array.isArray(final.texto) ? final.texto : [final.texto]).map((t) => <p key={t} style={LECTURA}>{t}</p>)}
            {final.pie && <p data-pie style={{ ...PIE, margin: 0 }}>{final.pie}</p>}
          </div>
        )}
      </div>
    </div>
  );
}
