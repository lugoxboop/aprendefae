import { useEffect, useRef, useState } from "react";
import { FAE } from "../../../../theme.js";
import { NEUTRO, NAVY_DEL_CHIP } from "../../../../data/contabilidadIntro.js";
import {
  T1_7, FLECHAS, CIERRE_T1_7, INVERSO_T1_7, ALT_T1_7, BANCO_T1_7,
} from "../../../../data/contabilidadTema1.js";
import {
  evaluarT1_7, lineaPorId, lineasDe, informeQueRecibe, puntuar, pesoDeCadaItem,
} from "../../../../contabilidad/tema1.js";
import { Retro, Pulsos, Cierre } from "../../corazon/juego.jsx";
import { TEXTO_CIERRE } from "../../bloques/marcos.jsx";
import { Responder, useTanda } from "../piezas.jsx";
import { useMovimientoReducido, SOLO_LECTOR } from "../verbos.jsx";
import { Encabezado, IdeaConTermino } from "./encabezado.jsx";

/*
 * ═══════════════════════════════════════════════════════════════════════════
 * T1-7 · LA ARTICULACIÓN
 *
 * Tres informes y cinco flechas. Todas llegan al mismo y de ese no sale
 * ninguna — y eso es lo que la actividad enseña, así que no puede estar
 * dibujado de entrada.
 *
 * ═══════════ LOS NODOS SON TODOS IGUALES ═══════════
 *
 * Mismo punto, mismo #B8C4D4, en las diez líneas. Si los de origen fueran de
 * un tono y los de destino de otro, la regla —«todas llegan al mismo
 * informe»— estaría contestada antes de tocar nada, y lo único que quedaría
 * por hacer sería emparejar.
 *
 * ═══════════ EL HILO ES MOMENTÁNEO ═══════════
 *
 * Al acertar, el hilo se dibuja y se va. Dejar las flechas acumulándose en
 * pantalla convertiría las últimas en un ejercicio de descarte: con cuatro ya
 * dibujadas, la quinta se deduce sin pensarla. Las cinco juntas se ven UNA
 * vez, al final, que es cuando esa imagen es la conclusión y no la pista.
 * ═══════════════════════════════════════════════════════════════════════════
 */

const CSS = `
@keyframes fae-t17-hilo { 0% { opacity: 0; } 25% { opacity: 1; } 75% { opacity: 1; } 100% { opacity: 0; } }
.fae-t17-hilo { animation: fae-t17-hilo 1600ms ease-in-out both; }
/* En la demo el hilo se queda: entra en un segundo y la marca, 1,5 s después. */
@keyframes fae-t17-entra { from { opacity: 0; } to { opacity: 1; } }
.fae-t17-hilo-fijo { animation: fae-t17-entra 1000ms ease-out both; }
.fae-t17-marca { animation: fae-t17-entra 400ms ease-out 2500ms both; }
@keyframes fae-t17-cierre { from { opacity: 0; } to { opacity: 1; } }
.fae-t17-cierre { animation: fae-t17-cierre 600ms ease-out both; }
@keyframes fae-t17-rebota {
  0% { transform: translateX(0); } 30% { transform: translateX(-5px); }
  60% { transform: translateX(4px); } 100% { transform: translateX(0); }
}
.fae-t17-rebota { animation: fae-t17-rebota 400ms ease-out 1; }
@media (prefers-reduced-motion: reduce) {
  .fae-t17-hilo, .fae-t17-cierre, .fae-t17-rebota, .fae-t17-hilo-fijo, .fae-t17-marca {
    animation: none !important; opacity: 1 !important; transform: none !important;
  }
}
`;

const SORA = "Sora, sans-serif";

/* El nodo. Uno solo, y el mismo para todas: no distingue origen de destino. */
function Nodo({ encendido }) {
  return (
    <span
      /*
       * `data-nodo-linea` y no `data-nodo`: la línea de avance de arriba ya usa
       * `data-nodo` para sus puntos de progreso, y una prueba que contara
       * «cuántos nodos hay» contaba los quince en vez de los diez. Lo cazó esa
       * prueba al primer intento.
       */
      data-nodo-linea
      aria-hidden="true"
      style={{
        flex: "none", width: "9px", height: "9px", borderRadius: "999px",
        background: encendido ? NEUTRO : "transparent",
        border: `1.5px solid ${NEUTRO}`,
      }}
    />
  );
}

function Linea({ linea, estado, onTocar, activo }) {
  const marcado = estado === "desde" || estado === "hasta";
  return (
    <button
      type="button"
      data-linea={linea.id}
      data-estado={estado ?? undefined}
      aria-pressed={marcado}
      disabled={!activo}
      onClick={activo ? () => onTocar(linea.id) : undefined}
      style={{
        display: "flex", alignItems: "center", gap: "7px", width: "100%", boxSizing: "border-box",
        textAlign: "left", padding: "7px 9px", borderRadius: "9px",
        cursor: activo ? "pointer" : "default",
        background: marcado ? "rgba(184,196,212,0.14)" : "rgba(10,20,34,0.4)",
        border: `${marcado ? 2 : 1}px solid ${marcado ? NEUTRO : "rgba(248,249,250,0.16)"}`,
        color: FAE.text, fontSize: "11.5px", lineHeight: 1.3,
        opacity: activo || marcado ? 1 : 0.55,
      }}
    >
      <Nodo encendido={marcado} />
      <span style={{ minWidth: 0 }}>{linea.nombre}</span>
    </button>
  );
}

/*
 * ═══════════ EL MODO DEMO DE «ASÍ SE JUEGA» ═══════════
 *
 * Es este mismo componente, no una copia dibujada. `banco` le da otros
 * informes, líneas y flechas —las dos hojas de la panadería— e `items` la
 * flecha del ejemplo; `modoDemo` le quita lo que no es la zona de juego y le
 * corta la salida: no llama a `onCompletar`, así que no hay FP, ni intentos,
 * ni progreso. Una sola diferencia en cómo se ve: en la demo el hilo no se
 * va, porque la demo termina justo en él. Si la flecha trae `marca`, el hilo
 * la enseña; las del juego no traen ninguna.
 */
export default function LaArticulacion({
  Marco, rotulo, titulo, acento, onCompletar,
  items = null, banco = null, modoDemo = false, onComoSeJuega = null,
}) {
  const reducido = useMovimientoReducido();
  const b = banco ?? BANCO_T1_7;
  const t = useTanda(() => items ?? [...b.flechas]);

  const [desde, setDesde] = useState(null);
  const [r, setR] = useState(null);
  const [intento, setIntento] = useState(0);
  const [respuestas, setRespuestas] = useState([]);
  const [hilo, setHilo] = useState(null);
  const [rebotando, setRebotando] = useState(false);
  const [inverso, setInverso] = useState(null);
  const reloj = useRef(null);
  const zonaBoton = useRef(null);

  const cuantas = t.items.length;
  const pct = puntuar(respuestas, cuantas);
  const esperandoReintento = Boolean(r && !r.ok && intento === 1);
  const puedeResponder = !r || esperandoReintento;
  const receptor = informeQueRecibe(b);

  useEffect(() => {
    if (t.terminado && !modoDemo) onCompletar?.(pct, Date.now() - t.inicio.current, t.detalle.current);
  }, [t.terminado]);
  useEffect(() => () => clearTimeout(reloj.current), []);
  useEffect(() => {
    if (r && !esperandoReintento && !modoDemo) zonaBoton.current?.querySelector("button")?.focus();
  }, [r, esperandoReintento]);

  const tocar = (id) => {
    if (!puedeResponder) return;
    if (!desde) { setDesde(id); return; }
    if (desde === id) { setDesde(null); return; }

    const nuevo = evaluarT1_7(desde, id, b);
    if (nuevo.ok) {
      /* El hilo se dibuja y se va: no se queda acumulándose en pantalla. */
      setHilo({ desde, hasta: id, marca: nuevo.flecha.marca ?? null, sello: Date.now() });
      clearTimeout(reloj.current);
      if (!modoDemo) reloj.current = setTimeout(() => setHilo(null), reducido ? 1200 : 1600);
    } else {
      setRebotando(true);
      clearTimeout(reloj.current);
      reloj.current = setTimeout(() => setRebotando(false), 420);
    }

    if (intento === 0) {
      t.anotar(`${desde}>${id}`, nuevo.ok, nuevo.ok ? null : `${desde}>${id}`);
      if (!nuevo.ok) { setR({ ...nuevo, primero: true }); setIntento(1); setDesde(null); return; }
      setRespuestas((xs) => [...xs, { id: nuevo.flecha.id, primeroOk: true }]);
      setR({ ...nuevo, primero: true }); setDesde(null);
      return;
    }
    setRespuestas((xs) => [...xs, { id: `i${t.i}`, primeroOk: false, segundoOk: nuevo.ok }]);
    setIntento(2); setR({ ...nuevo, primero: false }); setDesde(null);
  };

  const avanzar = () => {
    setR(null); setIntento(0); setDesde(null); setHilo(null); setRebotando(false);
    if (t.i + 1 < cuantas) t.setI(t.i + 1);
    else t.setTerminado(true);
  };
  const reiniciar = () => {
    t.reiniciar(); setR(null); setIntento(0); setRespuestas([]);
    setDesde(null); setHilo(null); setRebotando(false); setInverso(null);
  };

  /* ═══════════ EL CIERRE: LAS CINCO A LA VEZ, Y EL MODO INVERSO ═══════════ */
  if (t.terminado) {
    const bien = respuestas.filter((x) => x.primeroOk).length;
    return (
      <Marco rotulo={rotulo} titulo={titulo} acento={acento}>
        <style>{CSS}</style>
        <Cierre pct={Math.round(pct)} onReiniciar={reiniciar} textoReiniciar="Otra vez">
          <p style={TEXTO_CIERRE}>
            {bien} de {cuantas} al primer intento. Cada flecha valía {pesoDeCadaItem(cuantas).toFixed(2)} %.
          </p>
        </Cierre>

        <div data-cierre-flechas className="fae-t17-cierre" style={{ marginTop: "14px" }}>
          <ul style={{ margin: 0, padding: 0, listStyle: "none", display: "flex", flexDirection: "column", gap: "5px" }}>
            {FLECHAS.map((f) => (
              <li key={f.id} data-flecha-cierre={f.id} style={{
                display: "flex", flexWrap: "wrap", alignItems: "center", gap: "4px 6px",
                fontSize: "11px", color: "rgba(248,249,250,0.72)",
              }}>
                <Nodo encendido />
                <span>{lineaPorId(f.desde).nombre}</span>
                <span aria-hidden="true" style={{ color: NEUTRO }}>→</span>
                <span>{lineaPorId(f.hasta).nombre}</span>
              </li>
            ))}
          </ul>
          <p data-cierre-texto style={{
            margin: "11px 0 0", padding: "9px 11px", borderRadius: "11px",
            fontSize: "12.5px", lineHeight: 1.5, color: "rgba(248,249,250,0.82)",
            background: "rgba(184,196,212,0.1)", borderLeft: `3px solid ${NEUTRO}`,
          }}>
            {CIERRE_T1_7}
          </p>
        </div>

        {/* ═══════════ EL MODO INVERSO: TRES PREGUNTAS, SIN FP ═══════════ */}
        <div data-inverso style={{ marginTop: "16px" }}>
          <p data-rotulo-seccion style={{
            margin: "0 0 4px", fontFamily: SORA, fontSize: "10.5px",
            fontWeight: 700, letterSpacing: "0.16em", color: acento,
          }}>
            AHORA AL REVÉS
          </p>
          <p data-sin-fp style={{ margin: "0 0 9px", fontSize: "11px", color: "rgba(248,249,250,0.55)" }}>
            Estas tres no dan FP. Son para mirar la regla desde el otro lado.
          </p>
          {INVERSO_T1_7.map((q) => {
            const elegida = inverso?.[q.id] ?? null;
            const op = q.opciones.find((o) => o.id === elegida) ?? null;
            return (
              <div key={q.id} data-pregunta-inversa={q.id} style={{ marginBottom: "13px" }}>
                <p style={{
                  margin: "0 0 6px", fontFamily: SORA, fontSize: "12.5px", fontWeight: 700,
                  lineHeight: 1.35, color: FAE.text,
                }}>
                  {q.pregunta}
                </p>
                <div style={{ display: "flex", flexDirection: "column", gap: "5px" }}>
                  {q.opciones.map((o) => {
                    const esta = elegida === o.id;
                    return (
                      <button
                        key={o.id}
                        type="button"
                        data-opcion={o.id}
                        data-elegida={esta ? "si" : "no"}
                        disabled={Boolean(elegida)}
                        onClick={elegida ? undefined : () => setInverso((x) => ({ ...(x ?? {}), [q.id]: o.id }))}
                        style={{
                          textAlign: "left", padding: "8px 10px", borderRadius: "9px",
                          cursor: elegida ? "default" : "pointer",
                          background: esta ? "rgba(184,196,212,0.12)" : "rgba(10,20,34,0.4)",
                          border: `1px solid ${esta ? NEUTRO : "rgba(248,249,250,0.16)"}`,
                          color: FAE.text, fontSize: "12px", lineHeight: 1.35,
                          opacity: elegida && !esta ? 0.5 : 1,
                        }}
                      >
                        {o.texto}
                      </button>
                    );
                  })}
                </div>
                {op && <Retro texto={op.feedback} />}
              </div>
            );
          })}
        </div>
      </Marco>
    );
  }

  /*
   * El hilo, sin más. Aquí había una condición —`hilo && !r?.ok ? null :
   * hilo`— que no decía lo que yo creía: con `r` en null daba siempre null, y
   * eso tapaba que `avanzar` se hubiera olvidado de limpiarlo. `hilo` solo se
   * pone al acertar, así que no hace falta filtrarlo otra vez.
   */
  const hiloVivo = hilo;

  return (
    <Marco rotulo={rotulo} titulo={titulo} acento={acento}>
      <style>{CSS}</style>
      {!modoDemo && (
        <>
          <Encabezado objetivo={T1_7.objetivo} consigna={T1_7.consigna} onComoSeJuega={onComoSeJuega} />
          <div style={{ marginBottom: "12px" }}>
            <Pulsos total={cuantas} hechos={t.i + (r && !esperandoReintento ? 1 : 0)} enCurso={t.i + 1} etiqueta="Flecha" />
          </div>
        </>
      )}

      {/* Aquí dentro no entra el vocabulario del Tema 2. */}
      <div data-contenido>
        {!desde && !r && !modoDemo && (
          <p data-vacio style={{
            margin: "0 0 11px", padding: "9px 11px", borderRadius: "11px",
            fontSize: "12px", lineHeight: 1.45, color: "rgba(248,249,250,0.6)",
            background: "rgba(10,20,34,0.4)", border: "1px solid rgba(248,249,250,0.14)",
          }}>
            {T1_7.pregunta}
          </p>
        )}

        <div
          data-informes
          className={rebotando ? "fae-t17-rebota" : undefined}
          style={{ display: "flex", flexDirection: "column", gap: "9px" }}
        >
          {b.informes.map((inf) => (
            <div key={inf.id} data-informe={inf.id} style={{
              padding: "9px 10px", borderRadius: "11px",
              background: "rgba(10,20,34,0.3)", border: "1px solid rgba(248,249,250,0.12)",
            }}>
              <span style={{ display: "block", marginBottom: "2px" }}>
                <IdeaConTermino idea={inf.idea} termino={inf.termino} tamano={12} />
              </span>
              {inf.cuando ? (
                <p style={{ margin: "0 0 7px", fontSize: "10px", color: "rgba(248,249,250,0.5)" }}>
                  {inf.cuando}
                </p>
              ) : <span style={{ display: "block", height: "5px" }} />}
              <div style={{ display: "flex", flexDirection: "column", gap: "4px" }}>
                {lineasDe(inf.id, b).map((l) => {
                  let estado = null;
                  if (desde === l.id) estado = "desde";
                  else if (hiloVivo && hiloVivo.desde === l.id) estado = "desde";
                  else if (hiloVivo && hiloVivo.hasta === l.id) estado = "hasta";
                  return (
                    <Linea
                      key={l.id}
                      linea={l}
                      estado={estado}
                      onTocar={tocar}
                      activo={puedeResponder}
                    />
                  );
                })}
              </div>
            </div>
          ))}
        </div>

        {hiloVivo && (
          <p key={hiloVivo.sello} data-hilo className={modoDemo ? "fae-t17-hilo-fijo" : "fae-t17-hilo"} style={{
            margin: "9px 0 0", padding: "7px 10px", borderRadius: "10px",
            fontSize: "11.5px", textAlign: "center", color: NAVY_DEL_CHIP, background: NEUTRO,
            fontFamily: SORA, fontWeight: 700,
          }}>
            {lineaPorId(hiloVivo.desde, b).nombre} → {lineaPorId(hiloVivo.hasta, b).nombre}
            {hiloVivo.marca && (
              <span data-marca className="fae-t17-marca" style={{
                display: "block", marginTop: "3px", fontFamily: "Inter, sans-serif",
                fontSize: "10.5px", fontWeight: 600, letterSpacing: "0.02em",
              }}>
                {hiloVivo.marca}
              </span>
            )}
          </p>
        )}

        {esperandoReintento && (
          <p data-fallo style={{
            margin: "9px 0 0", padding: "7px 10px", borderRadius: "10px",
            fontSize: "12px", textAlign: "center", color: "rgba(248,249,250,0.75)",
            border: `1px dashed ${FAE.coral}`,
          }}>
            No se dibujó ninguna flecha.
          </p>
        )}
      </div>

      {r && <Retro texto={r.texto} />}

      {r && !esperandoReintento && !modoDemo && (
        <div ref={zonaBoton}>
          <Responder onClick={avanzar}>
            {t.i + 1 === cuantas ? "Ver el resultado" : "Siguiente flecha"}
          </Responder>
        </div>
      )}

      {!modoDemo && (
        <>
          <p style={SOLO_LECTOR}>{ALT_T1_7}</p>
          <p style={SOLO_LECTOR}>
            Las cinco flechas llegan a: {b.informes.find((x) => x.id === receptor).idea}.
          </p>
        </>
      )}
    </Marco>
  );
}
