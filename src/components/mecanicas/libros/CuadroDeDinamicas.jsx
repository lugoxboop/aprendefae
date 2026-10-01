import { useEffect, useRef, useState } from "react";
import { FAE } from "../../../theme.js";
import { DEBE, HABER, COLOR_LADO, NOMBRE_TIPO } from "../../../data/contabilidad.js";
import {
  COLUMNAS, OBJETIVO, TEXTO_DE_AGRUPACION,
  CONTRAPARTIDA_DEL_INGRESO, MS_CONTRAPARTIDA,
} from "../../../data/contabilidadCuadro.js";
import {
  FILAS, FILAS_AGRUPADAS, BLOQUES, SIGNOS, MAS,
  evaluarCelda, puntuar, pesoDeCadaFila,
} from "../../../contabilidad/cuadroDinamicas.js";
import { Retro, Pulsos, Cierre } from "../corazon/juego.jsx";
import { TEXTO_CIERRE } from "../bloques/marcos.jsx";
import { Responder, useTanda } from "./piezas.jsx";
import { Encabezado } from "./tema1/encabezado.jsx";
import { CONSIGNA_TEMA2 } from "../../../data/contabilidadConsignas.js";
import {
  Ficha, FichaEnVuelo, EstilosDeVerbos, useArrastre,
  useMovimientoReducido, SOLO_LECTOR, UMBRAL_ARRASTRE,
} from "./verbos.jsx";
import { TONO_ROTULO } from "./debeHaber/piezasDebeHaber.jsx";

/*
 * ═══════════════════════════════════════════════════════════════════════════
 * A3 · EL CUADRO DE DINÁMICAS.
 *
 * El cuadro resumen del capítulo, vacío, y el estudiante lo llena. Coloca UNA
 * celda por fila —la del débito— y la del crédito se llena sola con el signo
 * contrario: ese reflejo es la lección de la mecánica, porque enseña que las
 * dos columnas no son dos reglas sino una leída de los dos lados.
 *
 * ═══════════ EL REORDENAMIENTO ES LA ACTIVIDAD ═══════════
 *
 * Lo que queda cuando termina no es un cuadro lleno: es un cuadro PARTIDO EN
 * DOS. Las seis filas se van solas a su bloque y ahí se ve que no eran seis
 * reglas que memorizar, sino dos comportamientos. Todo lo anterior existe para
 * llegar a ese movimiento.
 *
 * Por eso las filas están colocadas por su posición y no apiladas: una lista
 * apilada no se puede reordenar a la vista, y aquí ver el viaje ES el punto.
 * Con movimiento reducido el viaje dura cero, pero las tres imágenes —vacío,
 * lleno en el orden del libro, agrupado— siguen ocurriendo las tres.
 *
 * ═══════════ EL ▲ LLEGA TARDE, COMO EN TODO EL TEMA ═══════════
 *
 * El triángulo de una fila dice por dónde crece esa familia, que es
 * literalmente la respuesta. Se reserva su hueco desde el principio para que
 * nada salte, y solo se dibuja cuando la fila ya está contestada.
 *
 * ═══════════ EN UN ERROR LA CELDA QUEDA VACÍA ═══════════
 *
 * Regla absoluta de las siete. El signo equivocado no se escribe ni un
 * instante: la ficha rebota con contorno coral y la celda sigue en blanco.
 * ═══════════════════════════════════════════════════════════════════════════
 */

/* Alto de una fila y hueco que se abre entre los dos bloques al agrupar. */
const PASO = 38;
const SEPARACION = 16;

const CSS = `
@keyframes fae-a3-rebota {
  0% { transform: translateX(0); } 25% { transform: translateX(-5px); }
  55% { transform: translateX(4px); } 100% { transform: translateX(0); }
}
.fae-a3-rebota { animation: fae-a3-rebota 400ms ease-out 1; }
@keyframes fae-a3-asienta { from { opacity: 0; transform: translateY(-10px); } to { opacity: 1; transform: none; } }
.fae-a3-asienta { animation: fae-a3-asienta 300ms cubic-bezier(.26,.84,.38,1) both; }
@keyframes fae-a3-espejo { from { opacity: 0; transform: scaleX(-1); } to { opacity: 1; transform: scaleX(1); } }
.fae-a3-espejo { animation: fae-a3-espejo 400ms cubic-bezier(.3,.9,.4,1) 300ms both; }
@keyframes fae-a3-triangulo { from { opacity: 0; } to { opacity: 1; } }
.fae-a3-triangulo { animation: fae-a3-triangulo 400ms ease-out 700ms both; }
@keyframes fae-a3-pulso { 0%, 100% { opacity: 0.5; } 50% { opacity: 1; } }
.fae-a3-pulso { animation: fae-a3-pulso 2s ease-in-out infinite; }
@keyframes fae-a3-aparece { from { opacity: 0; } to { opacity: 1; } }
.fae-a3-aparece { animation: fae-a3-aparece 400ms ease-out both; }
@media (prefers-reduced-motion: reduce) {
  .fae-a3-rebota, .fae-a3-asienta, .fae-a3-espejo, .fae-a3-triangulo,
  .fae-a3-pulso, .fae-a3-aparece { animation: none !important; opacity: 1 !important; transform: none !important; }
}
`;

const SORA = "Sora, sans-serif";

/* ═══════════════════ LO QUE SE VE DEBAJO AL FALLAR ═══════════════════ */

/*
 * La ecuación, con un término dentro de un chip neutro. El chip es el patrón
 * cerrado del tema: fondo sólido #B8C4D4 y el texto de esa palabra en navy
 * mientras está dentro. El resto de la ecuación no cambia de color.
 */
function Ecuacion({ resaltar, flechaAbajo = false }) {
  const terminos = [
    { tipo: "activo", lado: DEBE },
    { tipo: "pasivo", lado: HABER },
    { tipo: "patrimonio", lado: HABER },
  ];
  return (
    <div data-escena="ecuacion" className="fae-a3-aparece" style={{
      display: "flex", alignItems: "center", justifyContent: "center", gap: "5px",
      flexWrap: "wrap", marginTop: "10px", padding: "9px 8px", borderRadius: "11px",
      background: "rgba(10,20,34,0.4)", border: "1px solid rgba(248,249,250,0.12)",
    }}>
      {terminos.map((x, k) => {
        const marcado = x.tipo === resaltar;
        return (
          <span key={x.tipo} style={{ display: "inline-flex", alignItems: "center", gap: "5px" }}>
            {k === 1 && <span aria-hidden="true" style={{ color: "rgba(248,249,250,0.5)" }}>=</span>}
            {k === 2 && <span aria-hidden="true" style={{ color: "rgba(248,249,250,0.5)" }}>+</span>}
            <span
              data-termino={x.tipo}
              data-chip={marcado ? "si" : undefined}
              style={{
                fontFamily: SORA, fontSize: "11px", fontWeight: 700, letterSpacing: "0.08em",
                padding: "3px 7px", borderRadius: "7px",
                color: marcado ? "#1D3557" : "rgba(248,249,250,0.62)",
                background: marcado ? "#B8C4D4" : "transparent",
              }}
            >
              {NOMBRE_TIPO[x.tipo].toUpperCase()}
            </span>
            {marcado && flechaAbajo && (
              <span data-flecha="abajo" aria-hidden="true" style={{ fontSize: "12px", color: "#B8C4D4" }}>▼</span>
            )}
          </span>
        );
      })}
    </div>
  );
}

/*
 * Las dos cuentas del asiento que explica el ingreso, unidas por un arco. Es
 * la respuesta a «pero si vender hace entrar algo»: sí, y lo que entra es otra
 * cuenta. Se desvanece sola a los dos segundos para que no compita con la
 * casilla que hay que volver a intentar.
 */
function AsientoDelIngreso() {
  const c = CONTRAPARTIDA_DEL_INGRESO;
  return (
    <div data-escena="contrapartida" className="fae-a3-aparece" style={{
      marginTop: "10px", padding: "9px 8px 2px", borderRadius: "11px",
      background: "rgba(10,20,34,0.4)", border: "1px solid rgba(248,249,250,0.12)",
    }}>
      <div style={{ display: "flex", gap: "10px" }}>
        {[[c.debe, DEBE], [c.haber, HABER]].map(([nombre, lado]) => (
          <div key={lado} data-t={lado} style={{ flex: "1 1 0", minWidth: 0 }}>
            <p style={{
              margin: "0 0 4px", fontFamily: SORA, fontSize: "10.5px", fontWeight: 700,
              textAlign: "center", color: FAE.text, lineHeight: 1.2,
            }}>
              {nombre}
            </p>
            <svg viewBox="0 0 40 20" aria-hidden="true" style={{ display: "block", width: "100%", height: "22px" }}>
              <rect x={lado === DEBE ? 1 : 20} y="5" width="19" height="14" fill={COLOR_LADO[lado]} opacity="0.3" />
              <line x1="1" y1="5" x2="39" y2="5" stroke={COLOR_LADO[lado]} strokeWidth="1" />
              <line x1="20" y1="5" x2="20" y2="20" stroke={COLOR_LADO[lado]} strokeWidth="1" />
            </svg>
            <p style={{
              margin: "2px 0 0", fontFamily: SORA, fontSize: "9px", fontWeight: 700,
              letterSpacing: "0.1em", textAlign: "center", color: TONO_ROTULO[lado],
            }}>
              {lado === DEBE ? COLUMNAS.debe : COLUMNAS.haber}
            </p>
          </div>
        ))}
      </div>
      {/* El arco va por debajo, del debe al haber: es un solo asiento. */}
      <svg
        data-arco viewBox="0 0 100 14" preserveAspectRatio="none" aria-hidden="true"
        style={{ display: "block", width: "100%", height: "14px", overflow: "visible" }}
      >
        <path
          d="M 25 0 Q 50 14 75 0" fill="none" stroke={COLOR_LADO[DEBE]}
          strokeWidth="0.8" strokeLinecap="round" vectorEffect="non-scaling-stroke"
        />
        <circle cx="75" cy="0" r="1.2" fill={COLOR_LADO[DEBE]} vectorEffect="non-scaling-stroke" />
      </svg>
      <p style={SOLO_LECTOR}>
        Un mismo asiento: {c.debe} se debita y {c.haber} se acredita.
      </p>
    </div>
  );
}

/* ═══════════════════ UNA CASILLA DEL CUADRO ═══════════════════ */

/*
 * El hueco del ▲ está reservado en TODAS las casillas desde el primer
 * instante, llenas o vacías. Si apareciera y empujara, la fila saltaría justo
 * cuando el estudiante está leyendo su devolución.
 */
function Celda({
  lado, signo, activa, fallada = false, rebotando = false, espejo, triangulo,
  destino = false, onClick = null,
}) {
  const cuerpo = (
    <>
      <span aria-hidden="true" style={{ display: "block", height: "11px", lineHeight: "11px" }}>
        {triangulo && (
          <span className="fae-a3-triangulo" data-triangulo={lado} style={{ fontSize: "9px", color: COLOR_LADO[lado] }}>
            ▲
          </span>
        )}
      </span>
      <span
        data-signo={signo ?? undefined}
        className={signo ? (espejo ? "fae-a3-espejo" : "fae-a3-asienta") : undefined}
        style={{
          display: "block", fontFamily: SORA, fontSize: "17px", fontWeight: 700,
          lineHeight: "20px", color: signo ? TONO_ROTULO[lado] : "rgba(248,249,250,0.2)",
        }}
      >
        {signo ?? "·"}
      </span>
    </>
  );

  const base = {
    width: "48px", flex: "none", textAlign: "center", padding: "2px 0", borderRadius: "8px",
    background: activa ? "rgba(184,196,212,0.13)" : "transparent",
    border: fallada ? `1px dashed ${FAE.coral}` : "1px solid rgba(248,249,250,0.1)",
  };

  if (!onClick) {
    return <span data-celda={lado} data-fallada={fallada ? "si" : undefined} style={{ ...base, display: "block" }}>{cuerpo}</span>;
  }
  return (
    <button
      type="button"
      data-celda={lado}
      data-fallada={fallada ? "si" : undefined}
      data-destino={destino ? lado : undefined}
      onClick={onClick}
      className={rebotando ? "fae-a3-rebota" : undefined}
      aria-label={`Casilla de ${lado === DEBE ? COLUMNAS.debe.toLowerCase() : COLUMNAS.haber.toLowerCase()}`}
      style={{ ...base, cursor: "pointer" }}
    >
      {cuerpo}
    </button>
  );
}

/* ═══════════════════ LA MECÁNICA ═══════════════════ */

/*
 * ═══════════ EL MODO DEMO DE «ASÍ SE JUEGA» ═══════════
 *
 * El cuadro no admite un ejemplo de afuera: sus seis filas son las seis
 * familias del libro y salen del módulo. La demo es el cuadro de verdad
 * resolviendo su primera fila, la de Activos. `modoDemo` le quita el
 * objetivo, la consigna, el avance y el botón de seguir, y no llama a
 * `onCompletar`: ni FP, ni intentos, ni progreso.
 */
export default function CuadroDeDinamicas({
  Marco, rotulo, titulo, acento, onCompletar, modoDemo = false, onComoSeJuega = null,
}) {
  const reducido = useMovimientoReducido();
  const t = useTanda(() => FILAS);

  /* Lo colocado, por familia. Solo el acierto escribe aquí. */
  const [puestas, setPuestas] = useState({});
  const [retro, setRetro] = useState(null);
  const [intento, setIntento] = useState(0);
  const [respuestas, setRespuestas] = useState([]);
  const [rebotando, setRebotando] = useState(false);
  const [agrupado, setAgrupado] = useState(false);
  const [escenaViva, setEscenaViva] = useState(true);
  const relojRebote = useRef(null);
  const relojEscena = useRef(null);
  const zonaBoton = useRef(null);
  const origen = useRef(null);
  const arrastrado = useRef(false);

  const fila = t.items[t.i];
  const cuantas = t.items.length;
  const pct = puntuar(respuestas, cuantas);
  const esperandoReintento = Boolean(retro && !retro.ok && retro.primero);

  useEffect(() => {
    if (t.terminado && !modoDemo) onCompletar?.(pct, Date.now() - t.inicio.current, t.detalle.current);
  }, [t.terminado]);

  useEffect(() => () => { clearTimeout(relojRebote.current); clearTimeout(relojEscena.current); }, []);

  /* El foco avanza solo al botón cuando la fila queda resuelta. */
  useEffect(() => {
    if (retro && !esperandoReintento && !modoDemo) zonaBoton.current?.querySelector("button")?.focus();
  }, [retro, esperandoReintento]);

  const responder = (signo) => {
    /* Se responde si no hay devolución, o si la que hay es el primer fallo. */
    if (retro && !esperandoReintento) return;
    const r = evaluarCelda(fila, signo);

    if (!r.ok) {
      /*
       * La casilla no se llena: el signo equivocado no se escribe nunca. El
       * temblor es lo único que se apaga con movimiento reducido; el contorno
       * coral lo pinta `fallada`, porque el color no es una animación sino la
       * marca de que eso falló, y se queda puesto mientras dure el reintento.
       */
      if (!reducido) {
        setRebotando(true);
        clearTimeout(relojRebote.current);
        relojRebote.current = setTimeout(() => setRebotando(false), 420);
      }
      setEscenaViva(true);
      clearTimeout(relojEscena.current);
      if (r.escena === "contrapartida") {
        relojEscena.current = setTimeout(() => setEscenaViva(false), MS_CONTRAPARTIDA);
      }
      arrastre.limpiar();
    } else {
      setPuestas((p) => ({ ...p, [fila.tipo]: signo }));
    }

    if (intento === 0) {
      t.anotar(fila.id, r.ok, r.ok ? null : signo);
      if (!r.ok) { setRetro({ ...r, primero: true }); setIntento(1); return; }
      setRespuestas((xs) => [...xs, { id: fila.id, primeroOk: true }]);
      setRetro({ ...r, primero: true });
      return;
    }
    setRespuestas((xs) => [...xs, { id: fila.id, primeroOk: false, segundoOk: r.ok }]);
    setRetro({ ...r, primero: false });
  };

  const arrastre = useArrastre({
    onSoltar: (signo, destino) => { if (destino === DEBE) responder(signo); },
  });

  /*
   * Tocar la ficha responde, porque solo hay una casilla activa y pedir un
   * segundo toque sobre el único destino posible no añade nada. Pero un
   * arrastre termina en un click del navegador, así que se mide el
   * desplazamiento con el mismo umbral del arrastre y ese click se ignora.
   */
  const gestosDeFicha = (signo) => {
    const g = arrastre.gestos(signo);
    return {
      ...g,
      onPointerDown: (e) => { origen.current = { x: e.clientX, y: e.clientY }; arrastrado.current = false; g.onPointerDown(e); },
      onPointerMove: (e) => {
        g.onPointerMove(e);
        if (origen.current && Math.hypot(e.clientX - origen.current.x, e.clientY - origen.current.y) > UMBRAL_ARRASTRE) {
          arrastrado.current = true;
        }
      },
      onPointerUp: (e) => { origen.current = null; g.onPointerUp(e); },
      onPointerCancel: (e) => { origen.current = null; g.onPointerCancel(e); },
    };
  };
  const tocarFicha = (signo) => {
    if (arrastrado.current) { arrastrado.current = false; return; }
    responder(signo);
  };

  const avanzar = () => {
    setRetro(null); setIntento(0); setRebotando(false); setEscenaViva(true); arrastre.limpiar();
    clearTimeout(relojEscena.current);
    if (t.i + 1 < cuantas) { t.setI(t.i + 1); return; }
    /* La última fila resuelta dispara el reordenamiento, que es el final. */
    setAgrupado(true);
  };

  const reiniciar = () => {
    t.reiniciar(); setRetro(null); setIntento(0); setPuestas({}); setRespuestas([]);
    setRebotando(false); setAgrupado(false); setEscenaViva(true); arrastre.limpiar();
  };

  const cerrado = t.terminado;
  const orden = agrupado ? FILAS_AGRUPADAS : FILAS;
  const alto = PASO * FILAS.length + (agrupado ? SEPARACION : 0);
  const puedeResponder = !agrupado && (!retro || esperandoReintento);

  /* ── El cuadro ── */
  const cuadro = (
    <div data-cuadro data-agrupado={agrupado ? "si" : "no"} style={{
      padding: "11px 12px", borderRadius: "14px",
      background: "rgba(10,20,34,0.45)", border: "1px solid rgba(248,249,250,0.12)",
    }}>
      <div style={{ display: "flex", alignItems: "flex-end", gap: "8px", marginBottom: "7px" }}>
        <span style={{ flex: 1, minWidth: 0 }} />
        {[[DEBE, COLUMNAS.debe], [HABER, COLUMNAS.haber]].map(([lado, nombre]) => (
          <span key={lado} data-columna={lado} style={{
            width: "48px", flex: "none", textAlign: "center", fontFamily: SORA,
            fontSize: "9px", fontWeight: 700, letterSpacing: "0.1em", color: TONO_ROTULO[lado],
          }}>
            {nombre}
          </span>
        ))}
      </div>

      <div style={{
        position: "relative", height: `${alto}px`,
        transition: reducido ? "none" : "height 900ms cubic-bezier(.3,.9,.4,1)",
      }}>
        {orden.map((f, k) => {
          const puesto = puestas[f.tipo] ?? null;
          const resuelta = puesto !== null;
          const activa = !cerrado && !agrupado && f.tipo === fila?.tipo;
          /* Al agrupar, el segundo bloque baja: ese hueco ES la lección. */
          const arriba = k * PASO + (agrupado && k >= BLOQUES[0].filas.length ? SEPARACION : 0);
          return (
            <div
              key={f.tipo}
              data-fila={f.tipo}
              style={{
                position: "absolute", left: 0, right: 0, top: `${arriba}px`, height: `${PASO - 4}px`,
                display: "flex", alignItems: "center", gap: "8px",
                padding: "0 4px", borderRadius: "9px",
                background: resuelta ? `${COLOR_LADO[f.creceP]}14` : "transparent",
                transition: reducido ? "none" : "top 900ms cubic-bezier(.3,.9,.4,1), background 400ms ease",
              }}
            >
              <span style={{
                flex: 1, minWidth: 0, fontSize: "12.5px", color: FAE.text,
                overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap",
              }}>
                {f.nombre}
              </span>
              <Celda
                lado={DEBE}
                signo={puesto}
                activa={activa && !agrupado}
                fallada={activa && esperandoReintento}
                rebotando={rebotando && activa}
                espejo={false}
                triangulo={resuelta && f.creceP === DEBE}
                destino={activa && puedeResponder}
                onClick={activa && puedeResponder && arrastre.tomada ? () => responder(arrastre.tomada) : null}
              />
              <Celda
                lado={HABER}
                signo={resuelta ? f.credito : null}
                activa={false}
                rebotando={false}
                espejo
                triangulo={resuelta && f.creceP === HABER}
              />
            </div>
          );
        })}
      </div>
    </div>
  );

  const agrupacion = (
    <p data-agrupacion className="fae-a3-aparece" style={{
      margin: "12px 0 0", padding: "10px 12px", borderRadius: "11px", fontSize: "13px",
      lineHeight: 1.5, color: FAE.text,
      background: "rgba(184,196,212,0.13)", borderLeft: "3px solid #B8C4D4",
    }}>
      {TEXTO_DE_AGRUPACION}
    </p>
  );

  if (cerrado) {
    const bien = respuestas.filter((r) => r.primeroOk).length;
    return (
      <Marco rotulo={rotulo} titulo={titulo} acento={acento}>
        <style>{CSS}</style>
        <Cierre pct={Math.round(pct)} onReiniciar={reiniciar} textoReiniciar="Otra vez">
          <p style={TEXTO_CIERRE}>
            {bien} de {cuantas} al primer intento. Cada fila valía {pesoDeCadaFila(cuantas).toFixed(2)} %.
          </p>
        </Cierre>
        <div style={{ marginTop: "14px" }}>{cuadro}</div>
        {agrupacion}
      </Marco>
    );
  }

  return (
    <Marco rotulo={rotulo} titulo={titulo} acento={acento}>
      <style>{CSS}</style>
      <EstilosDeVerbos />
      {!modoDemo && (
        <>
          {/* El objetivo, y debajo la consigna de Gen con «¿Cómo se juega?». */}
          <Encabezado
            objetivo={agrupado ? null : OBJETIVO}
            consigna={CONSIGNA_TEMA2["cu-cuadro-dinamicas"]}
            onComoSeJuega={onComoSeJuega}
          />
          <div style={{ marginBottom: "12px" }}>
            {/* Al agrupar ya no queda fila activa: el avance está completo. */}
            <Pulsos
              total={cuantas}
              hechos={agrupado ? cuantas : t.i + (retro && !esperandoReintento ? 1 : 0)}
              etiqueta="Fila"
            />
          </div>
        </>
      )}

      {cuadro}

      {agrupado ? (
        <>
          {agrupacion}
          <Responder onClick={() => t.setTerminado(true)}>Ver el resultado</Responder>
        </>
      ) : (
        <>
          {puedeResponder && (
            <>
              {/* La instrucción ya la da la consigna de arriba; aquí solo el reintento. */}
              {esperandoReintento ? (
                <p style={{
                  margin: "16px 0 8px", fontFamily: SORA, fontSize: "10.5px",
                  fontWeight: 700, letterSpacing: "0.16em", color: acento,
                }}>
                  INTÉNTALO OTRA VEZ
                </p>
              ) : <div style={{ height: "14px" }} />}
              <div
                style={{ display: "flex", gap: "10px" }}
                onKeyDown={(e) => {
                  if (e.key !== "ArrowLeft" && e.key !== "ArrowRight") return;
                  e.preventDefault();
                  const fichas = [...e.currentTarget.querySelectorAll("button")];
                  const k = fichas.indexOf(document.activeElement);
                  const paso = e.key === "ArrowRight" ? 1 : -1;
                  fichas[(Math.max(0, k) + paso + fichas.length) % fichas.length]?.focus();
                }}
              >
                {SIGNOS.map((s) => (
                  <div key={s} className={rebotando ? undefined : "fae-a3-pulso"} style={{ flex: "1 1 0" }}>
                    <Ficha
                      valor={1}
                      alto={40}
                      lado={s === MAS ? DEBE : HABER}
                      texto={s}
                      color="rgba(248,249,250,0.5)"
                      tomada={arrastre.tomada === s}
                      onClick={() => tocarFicha(s)}
                      gestos={gestosDeFicha(s)}
                      etiqueta={`Colocar ${s === MAS ? "más" : "menos"} en la casilla de ${COLUMNAS.debe.toLowerCase()} de ${fila.nombre}. Las flechas izquierda y derecha cambian de ficha.`}
                    />
                  </div>
                ))}
              </div>
              <FichaEnVuelo
                valor={1}
                texto={arrastre.tomada}
                lado={arrastre.tomada === MAS ? DEBE : HABER}
                puntero={arrastre.puntero}
              />
              {esperandoReintento && (
                <p data-fallo style={{
                  margin: "9px 0 0", padding: "7px 10px", borderRadius: "10px",
                  fontSize: "12px", textAlign: "center", color: "rgba(248,249,250,0.75)",
                  border: `1px dashed ${FAE.coral}`,
                }}>
                  La casilla sigue vacía: no se escribió ningún signo.
                </p>
              )}
            </>
          )}

          {retro && <Retro texto={retro.texto} />}

          {retro && !retro.ok && escenaViva && retro.escena === "ecuacion" && (
            <Ecuacion resaltar={retro.resaltar} flechaAbajo={retro.flechaAbajo} />
          )}
          {retro && !retro.ok && escenaViva && retro.escena === "contrapartida" && <AsientoDelIngreso />}

          {retro && !esperandoReintento && !modoDemo && (
            <div ref={zonaBoton}>
              <Responder onClick={avanzar}>
                {t.i + 1 === cuantas ? "Ver el cuadro completo" : "Siguiente fila"}
              </Responder>
            </div>
          )}
        </>
      )}
    </Marco>
  );
}
