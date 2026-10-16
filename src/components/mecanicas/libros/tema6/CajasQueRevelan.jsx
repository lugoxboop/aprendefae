import { useCallback, useEffect, useId, useLayoutEffect, useRef, useState } from "react";
import { FAE } from "../../../../theme.js";
import { COLOR } from "../../../../data/contabilidadTema3.js";
import { useReducido } from "../tema3/DosLineas.jsx";
import EstilosT5, { CLASE_T5 } from "../tema5/EstilosT5.jsx";
import { Marca, CORRECTA, TACHADA } from "../b5/MarcasE4.jsx";
import { escalera, fallaDe, elegir, sePuedeElegir } from "./escaleraB5.js";
import { SOLO_LECTOR } from "../verbos.jsx";
import FiguraPegada, { asomarBajoLaFigura } from "./FiguraPegada.jsx";
import { ConCifras } from "./TanqueProvision.jsx";

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
 * se barajan). Sin puntaje y sin botón.
 *
 * LA ESCALERA DE AYUDA (lote C2, escaleraB5.js): con `pista`, dos intentos.
 * Al primer error, la elegida queda tachada (y no se vuelve a tocar), las
 * demás siguen activas y debajo sale la PISTA, con la forma de la
 * devolución; ni la devolución ni el texto. Sin pista, un solo intento.
 *
 * NADA DOS VECES (B5 de Futaba y §3 de Mai, enganche B1-B5): la pregunta de
 * la caja solo se ve mientras falta decidir. Al decidir (acierto o segundo
 * error) sale de la pantalla y pasa a una copia oculta con el mismo id: sigue
 * siendo el nombre del grupo de opciones (aria-labelledby). De las opciones
 * queda solo la elegida, con su marca E4 (MarcasE4.jsx): ✓, borde 2 nodo,
 * relleno navy y 1 px menos de relleno si acertó; ✕ y tachada si no. Debajo,
 * quien acierta lee el texto que se revela, con su filete y su pie; quien se
 * cierra con error lee la devolución de su opción y el pie, pero NO el texto
 * (evita dos frases casi iguales; la figura ya muestra lo correcto).
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
export { fallaDe };

/*
 * La opción de decidir (hoja 6). No es la Opcion de corazon/juego.jsx, la de
 * las pantallas de opción múltiple: aquella marca con teal y coral, lleva
 * marcador y se desactiva con disabled; esta tiene la forma de las de
 * UnaFrase, sin coral (en la capa 3 no hay patrón de error), y queda con
 * aria-disabled para no perder el foco. La comparten la capa 3 y la parada
 * de la capa 2. `estado` es el de la escalera (escaleraB5.js): una elegida
 * mala queda tachada y sin poder tocarse desde el primer error.
 */
export function OpcionDecidir({ opcion, forma, estado, correcta, reducido, onElegir }) {
  const decidida = estado.resuelta;
  const esCorrecta = decidida && opcion.id === correcta;
  const tachada = estado.tachadas.includes(opcion.id);
  const bloqueada = decidida || tachada;
  const fila = forma === "fila";
  const d = esCorrecta ? 1 : 0;
  return (
    <button
      type="button"
      data-opcion={opcion.id}
      data-marca={esCorrecta ? "correcta" : tachada ? "tachada" : decidida ? "apagada" : ""}
      aria-pressed={opcion.id === estado.ultima}
      aria-disabled={bloqueada || undefined}
      onClick={() => { if (!bloqueada) onElegir(opcion.id); }}
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
        cursor: bloqueada ? "default" : "pointer",
      }}
    >
      {/* E4 (hoja de fusiones de Mai): ya tachaba; se le suman los íconos ✓ y ✕, con su texto oculto. */}
      {(esCorrecta || tachada) ? (
        <span style={{ display: "inline-flex", alignItems: "center", gap: "5px", ...(fila ? { justifyContent: "center" } : null) }}>
          <Marca marca={esCorrecta ? CORRECTA : TACHADA} />
          <span data-texto-opcion>{opcion.texto}</span>
        </span>
      ) : <span data-texto-opcion>{opcion.texto}</span>}
    </button>
  );
}

/* Desplazamiento mínimo para que `nodo` se vea entero (Mai §4). */
const asomar = (nodo, reducido) => nodo?.scrollIntoView?.({ block: "nearest", behavior: reducido ? "auto" : "smooth" });

/*
 * ═══════════ FILA O COLUMNA, EN VIVO (Sakuta, 15-oct; regla §2 de Mai) ═══════════
 *
 * La pieza pide «fila» y la fila se mide donde se pinta: si una opción se
 * parte (su texto ocupa más de un renglón), las opciones de TODAS las cajas
 * de la pieza pasan a columna (cada pieza tiene una sola forma). Se vuelve a
 * medir al cargar las fuentes y al cambiar el ancho, como el eje de b5-t6-a6:
 * se prueba otra vez la fila y, si se parte, columna. Lo mide la caja abierta,
 * antes de pintar (useLayoutEffect): no se ve la fila partida.
 * Devuelve [forma que se pinta, aviso para la caja, vuelta de medida].
 */
export function useFormaQueCabe(forma) {
  const [partida, setPartida] = useState(false);
  const [vuelta, setVuelta] = useState(0);
  useEffect(() => {
    if (forma !== "fila") return undefined;
    let vivo = true;
    const otraVez = () => { if (!vivo) return; setPartida(false); setVuelta((v) => v + 1); };
    document.fonts?.ready?.then(otraVez);
    window.addEventListener("resize", otraVez);
    return () => { vivo = false; window.removeEventListener("resize", otraVez); };
  }, [forma]);
  const seParte = useCallback(() => setPartida(true), []);
  return [forma === "fila" && !partida ? "fila" : "columna", seParte, vuelta];
}
/* Una opción se parte si su texto ocupa más de un renglón. */
export const seParteAlguna = (grupo) => [...grupo.querySelectorAll("[data-texto-opcion]")].some((t) => t.getClientRects().length > 1);

export function Caja({ caja, abierto, onAbrir, estiloTitulo = LECTURA, forma = "columna", intentos = [], onElegir = () => {}, onSeParte = () => {}, vuelta = 0, figura = null }) {
  const id = useId();
  const reducido = useReducido();
  const decide = caja.decide;
  const grupo = useRef(null);
  /* En fila, si una opción se parte, se avisa a la pieza: pasa a columna (useFormaQueCabe). */
  useLayoutEffect(() => {
    if (forma === "fila" && grupo.current && seParteAlguna(grupo.current)) onSeParte();
  }, [forma, abierto, vuelta]); // eslint-disable-line react-hooks/exhaustive-deps
  const estado = decide ? escalera(decide, intentos) : null;
  const decidida = Boolean(estado?.resuelta);
  /* El texto que se revela: sin decisión, al abrir; con decisión, solo a quien acierta (B5 de Futaba). */
  const muestraTexto = abierto && (!decide || (decidida && estado.acerto));
  const falla = estado?.falla ?? null;
  const pista = estado?.pista ?? null;
  /* Decidida, de las opciones queda solo la elegida (E4). */
  const visibles = decide ? (decidida ? decide.opciones.filter((o) => o.id === estado.ultima) : decide.opciones) : [];
  const aparece = reducido ? undefined : "b5-decide-aparece";
  const zonaDecide = useRef(null);
  const zonaPista = useRef(null);
  const zonaDevolucion = useRef(null);
  const zonaTexto = useRef(null);
  const primerRenglon = useRef(null);

  /*
   * Al abrir: la pregunta y todas las opciones. Al primer error: la pista. Al
   * cerrarse: la devolución entera, o el primer renglón del texto. Con figura
   * pegada (§2b de Mai), desde la opción elegida hasta el final de lo que se
   * lee debajo, sin quedar tapada por la figura.
   */
  useEffect(() => { if (decide && abierto && !decidida) asomar(zonaDecide.current, reducido); }, [abierto]); // eslint-disable-line react-hooks/exhaustive-deps
  useEffect(() => { if (pista) asomar(zonaPista.current, reducido); }, [pista]); // eslint-disable-line react-hooks/exhaustive-deps
  useEffect(() => {
    if (!decidida) return;
    if (figura) { asomarBajoLaFigura(figura.current, grupo.current, falla ? zonaDevolucion.current : zonaTexto.current, reducido); return; }
    asomar(falla ? zonaDevolucion.current : primerRenglon.current, reducido);
  }, [decidida]); // eslint-disable-line react-hooks/exhaustive-deps

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
              {caja.cifras.map((c) => <span key={c} style={{ ...LECTURA, display: "block" }}><ConCifras texto={c} /></span>)}
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
          {/* La pregunta, a la vista mientras falta decidir; después, solo para el lector (el mismo id: el grupo conserva su nombre). */}
          {decidida
            ? <span id={`${id}-pregunta`} data-pregunta-oculta style={SOLO_LECTOR}>{decide.pregunta}</span>
            : <p id={`${id}-pregunta`} data-pregunta style={PREGUNTA}>{decide.pregunta}</p>}
          <div ref={grupo} role="group" aria-labelledby={`${id}-pregunta`} data-opciones={forma} style={{
            display: "flex", flexDirection: forma === "fila" ? "row" : "column", gap: forma === "fila" ? "4px" : "6px", marginTop: decidida ? 0 : "8px",
          }}>
            {visibles.map((o) => (
              <OpcionDecidir key={o.id} opcion={o} forma={forma} estado={estado} correcta={decide.correcta} reducido={reducido}
                onElegir={(id) => { if (sePuedeElegir(decide, intentos, id)) onElegir(id); }} />
            ))}
          </div>
        </div>
      )}
      <div id={id} data-revela={caja.id} aria-live="polite">
        {pista && <p ref={zonaPista} data-pista className={aparece} style={DEVOLUCION}>{pista}</p>}
        {falla && (
          <div ref={zonaDevolucion}>
            <p data-devolucion className={aparece} style={DEVOLUCION}>{falla}</p>
            {/* Sin el texto que se revela, la fuente se queda: el pie, bajo la devolución. */}
            {caja.pie && <p data-pie className={aparece} style={{ ...PIE, margin: "-4px 14px 12px" }}>{caja.pie}</p>}
          </div>
        )}
        {muestraTexto && (
          <div ref={zonaTexto} className={decide ? aparece : undefined} style={{ margin: "0 14px 12px", paddingTop: "10px", borderTop: `1px solid ${ATENUADO}`, position: "relative" }}>
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

/*
 * `Figura` (§2b de Mai, T5 · A1, T5 · A2, T6 · A1 y T6 · A2): una figura
 * pequeña entre la consigna y las cajas, pegada arriba de la capa mientras se
 * recorren las cajas (FiguraPegada.jsx). Recibe `decididas` (los ids de las
 * cajas ya cerradas, en el orden en que se cerraron) y se llena siempre con
 * lo correcto; lo último que entró va resaltado.
 */
export default function CajasQueRevelan({ consigna, contexto = null, cajas, final, estiloTitulo = LECTURA, forma: pedida = "columna", atributos = {}, Figura = null }) {
  const [forma, seParte, vuelta] = useFormaQueCabe(pedida);
  const reducido = useReducido();
  const [abiertos, setAbiertos] = useState(() => new Set());
  const [elecciones, setElecciones] = useState(() => ({}));
  const bloqueFinal = useRef(null);
  const figura = useRef(null);
  const contenedor = useRef(null);
  /* El final, cuando se han cerrado todas (acierto o segundo error; sin decisión, abiertas). */
  const lista = (x) => (x.decide ? escalera(x.decide, elecciones[x.id]).resuelta : abiertos.has(x.id));
  const todos = cajas.every(lista);
  /* Las cajas cerradas, en el orden en que se cerraron (lo que la figura llena). */
  const [orden, setOrden] = useState(() => []);
  const elegirEn = (x, o) => {
    const nuevos = elegir(x.decide, elecciones[x.id] ?? [], o);
    setElecciones((e) => ({ ...e, [x.id]: nuevos }));
    if (escalera(x.decide, nuevos).resuelta) setOrden((d) => (d.includes(x.id) ? d : [...d, x.id]));
  };

  useEffect(() => {
    if (!todos) return;
    /*
     * Con figura pegada, el final se asoma sin tapar con la figura la opción
     * de la última caja: primero se ve la devolución entera (§2b de Mai).
     */
    const ultima = orden.length ? contenedor.current?.querySelector(`[data-hecho="${orden[orden.length - 1]}"] [role='group']`) : null;
    if (Figura && ultima) { asomarBajoLaFigura(figura.current, ultima, bloqueFinal.current, reducido); return; }
    bloqueFinal.current?.scrollIntoView?.({ block: "nearest", behavior: reducido ? "auto" : "smooth" });
  }, [todos]); // eslint-disable-line react-hooks/exhaustive-deps

  return (
    <div ref={contenedor} {...atributos} className={CLASE_T5}>
      <EstilosT5 />
      <p style={{ ...LECTURA, fontFamily: SORA }}>{consigna}</p>
      {contexto && <p style={{ ...LECTURA, marginTop: "12px" }}>{contexto}</p>}
      {Figura && (
        <FiguraPegada ref={figura} contenedor={contenedor}>
          <Figura decididas={orden} />
        </FiguraPegada>
      )}
      <div style={{ display: "flex", flexDirection: "column", gap: "8px", marginTop: Figura ? "4px" : "12px" }}>
        {cajas.map((x) => (
          <Caja key={x.id} caja={x} estiloTitulo={estiloTitulo} forma={forma} abierto={abiertos.has(x.id)} onAbrir={() => setAbiertos((s) => new Set(s).add(x.id))}
            intentos={elecciones[x.id]} onElegir={(o) => elegirEn(x, o)} onSeParte={seParte} vuelta={vuelta} figura={Figura ? figura : null} />
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
