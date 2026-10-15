import { useEffect, useRef, useState } from "react";
import { barajar } from "../../../../utils/barajar.js";
import { porcentaje } from "../../../../data/politicaFiscal.js";
import { pesos } from "../../../../data/contabilidad.js";
import { FAE } from "../../../../theme.js";
import { Opcion, Opciones, Retro, Pulsos, Cierre, Enunciado } from "../../corazon/juego.jsx";
import { Avanzar, TEXTO_CIERRE } from "../../bloques/marcos.jsx";
import { Encabezado } from "../tema1/encabezado.jsx";
import { SOLO_LECTOR } from "../verbos.jsx";
import { RotuloSimulado, PieDeFuente } from "../tema6/FuentesT6A5.jsx";
import { useReducido } from "../tema3/DosLineas.jsx";

/*
 * ═══════════════════════════════════════════════════════════════════════════
 * CASILLAS EN ORDEN — el patrón de «La Escalera del Encaje», generalizado
 * dentro de la Célula B (b5-t6-a5 «La cuenta de la provisión» y b5-t6-a6
 * «Provisión por edades»).
 *
 * El original (EscaleraDelEncaje, en maquinas/fabricaDelDinero.jsx) vive en
 * Macroeconomía y está atado a su escalera; no se toca. Esta copia hace lo
 * mismo con lo de cada actividad en `config`:
 *
 *   · las casillas en orden, por partes; cada una con su enunciado y sus
 *     opciones (las cifras, barajadas una vez al cargar: la posición no puede
 *     delatar; los grupos de una regla, en su orden);
 *   · un intento por casilla; al fallar, la devolución del tipo de error y la
 *     opción correcta marcada;
 *   · acierte o falle, el valor correcto queda escrito en el registro de la
 *     partida, para que la casilla siguiente parta de él (Futaba: en a6 es
 *     indispensable, porque el total y el neto dependen de lo anterior);
 *   · la regla fija (un texto o una tabla), la nota bajo ella, el punto de
 *     partida ya resuelto y, si la actividad es un escenario simulado, su
 *     rótulo fijo y los pies de fuente en su forma. Con regla en tabla, los
 *     datos de la parte van dentro de ella y el rótulo, a su pie (Mai);
 *   · un visual propio, si la actividad lo trae (`visual: { Componente,
 *     anuncio }`): va encima de la casilla y hace de registro (b5-t6-a5);
 *   · las opciones, en una columna; al pasar de casilla, la página se mueve
 *     para que se vean la casilla, el rótulo y la fila que usa;
 *   · pct = aciertos / casillas × 100, y el texto de cierre.
 *
 * Ítem = la casilla, por su id; `respuesta` guarda el valor elegido al fallar.
 *
 * MODO DEMO («Así se juega»): llega `items` con el ejemplo (una casilla), no
 * se baraja nada, no hay encabezado y nunca se llama a `onCompletar`.
 *
 * config: { consigna, regla | reglaTabla{ filas[{ id, nombre, valor }], pie? }, nota?{ texto, pie },
 *           rotuloSimulado?, partida?, partes: [{ id, datos?{ filas[{ nombre, valor, total? }] },
 *           casillas: [{ id, enunciado, fila?, opciones: [{ valor | texto, tipo }] }] }],
 *           errores, cierre, alt, etiqueta }
 * Una opción con tipo null es la correcta. En el registro, cada casilla se
 * nombra con la etiqueta del contador y su número («Casilla 3»): ningún texto
 * nuevo.
 * ═══════════════════════════════════════════════════════════════════════════
 */

const SECUNDARIO = "#A8B6C8";
const BORDE = "rgba(248,249,250,0.14)";
const ESTILO_REGLA = {
  margin: "0 0 12px", padding: "10px 13px", borderRadius: "12px",
  fontSize: "13.5px", lineHeight: 1.5, color: "rgba(248,249,250,0.86)",
  background: "rgba(248,249,250,0.05)", border: `1px solid ${BORDE}`,
};
const PIE = { display: "block", margin: "6px 0 0", fontFamily: "Inter, sans-serif", fontSize: "12px", lineHeight: "16px", color: SECUNDARIO };
const CELDA = { padding: "4px 2px", fontSize: "13px", lineHeight: 1.4, color: FAE.text };
const BORDE_FUERTE = "rgba(248,249,250,0.32)";
const CIFRA = { ...CELDA, textAlign: "right", whiteSpace: "nowrap", fontVariantNumeric: "tabular-nums" };

const textoDe = (op) => (op.valor !== undefined ? pesos(op.valor) : op.texto);
const claveDe = (op) => String(op.valor ?? op.texto);
/* Las opciones de cifras se barajan; las de texto (los grupos de una regla) van en su orden. */
const ordenar = (casillas, conBarajar) => casillas.map((c) => (conBarajar && c.opciones.every((o) => o.valor !== undefined) ? barajar(c.opciones) : c.opciones));

/* Un porcentaje va en su columna; cualquier otro valor («no se provisiona, en este ejemplo»), en una segunda línea. */
const esPorcentaje = (v) => /^\d+(,\d+)?[\s\u00A0]%$/.test(v);
const NOMBRE = { ...CELDA, textAlign: "left", fontFamily: "Sora, sans-serif", fontSize: "12.5px", fontWeight: 600 };
const MONTO = { ...CIFRA, fontFamily: "Sora, sans-serif", fontSize: "12.5px", fontWeight: 600 };
const PORCIENTO = { ...CELDA, textAlign: "right", fontFamily: "Inter, sans-serif", fontSize: "12px", fontWeight: 600, whiteSpace: "nowrap" };

/*
 * La regla en tabla, con los datos de la parte dentro (hoja de Mai, a6 §3.1):
 * una fila por grupo (nombre · lo que debe, solo si la parte trae datos ·
 * porcentaje), el total abajo bajo un filete, y al pie el rótulo del
 * escenario y el pie del porcentaje. Así el rótulo queda siempre entre la
 * tabla y la casilla. Cada fila lleva `data-fila` para el desplazamiento.
 */
function TablaRegla({ filas, pie, datos, rotulo }) {
  const montos = datos ? Object.fromEntries(datos.filas.filter((f) => !f.total).map((f) => [f.nombre, f.valor])) : null;
  const total = datos?.filas.find((f) => f.total);
  const columnas = montos ? 3 : 2;
  return (
    <div data-regla="" style={{ margin: "0 0 12px" }}>
      <div style={{ padding: "8px 10px 10px", borderRadius: "12px", border: `1px solid ${BORDE}`, background: "rgba(248,249,250,0.05)" }}>
        <table {...(montos ? { "data-datos-parte": "" } : {})} style={{ width: "100%", borderCollapse: "collapse" }}>
          <tbody>
            {filas.flatMap((f, k) => {
              const enColumna = esPorcentaje(f.valor);
              const borde = k ? { borderTop: `1px solid ${BORDE}` } : {};
              const fila = (
                <tr key={f.id} data-fila={f.id} style={borde}>
                  <th scope="row" style={NOMBRE}>{f.nombre}</th>
                  {montos && <td data-monto="" style={MONTO}>{montos[f.nombre]}</td>}
                  <td style={PORCIENTO}>{enColumna ? f.valor : ""}</td>
                </tr>
              );
              return enColumna ? [fila] : [fila, (
                <tr key={`${f.id}-valor`} data-fila={f.id}>
                  <td colSpan={columnas} style={{ ...CELDA, paddingTop: 0, textAlign: "right", fontFamily: "Inter, sans-serif", fontSize: "12px", color: SECUNDARIO }}>{f.valor}</td>
                </tr>
              )];
            })}
            {total && (
              <tr data-fila="total" data-total="" style={{ borderTop: `1px solid ${BORDE_FUERTE}` }}>
                <th scope="row" style={{ ...CELDA, textAlign: "left", fontFamily: "Inter, sans-serif", fontSize: "12px", fontWeight: 400, color: SECUNDARIO }}>{total.nombre}</th>
                <td style={MONTO}>{total.valor}</td>
                <td />
              </tr>
            )}
          </tbody>
        </table>
      </div>
      {rotulo}
      {pie && <span style={PIE}><PieDeFuente texto={pie} /></span>}
    </div>
  );
}

export default function CasillasEnOrden({
  config, Marco, rotulo, titulo, acento, onCompletar, items = null, modoDemo = false, onComoSeJuega = null,
}) {
  const ejemplo = items?.[0] ?? null;
  const partes = ejemplo ? [{ id: "ejemplo", casillas: [ejemplo] }] : config.partes;
  const casillas = partes.flatMap((p) => p.casillas.map((c) => ({ ...c, parte: p.id })));
  const total = casillas.length;

  const [n, setN] = useState(0);
  const [elegida, setElegida] = useState(null);
  const [aciertos, setAciertos] = useState(0);
  const [respuestas, setRespuestas] = useState([]);
  const [terminado, setTerminado] = useState(false);
  const [orden, setOrden] = useState(() => ordenar(casillas, !ejemplo));
  const detalle = useRef([]);
  const inicio = useRef(Date.now());
  const casillaRef = useRef(null);
  const rotuloRef = useRef(null);
  const reducido = useReducido();
  const pct = porcentaje(aciertos, total);
  const actual = casillas[n];
  const parte = partes.find((p) => p.id === actual.parte);
  const correcta = actual.opciones.find((o) => o.tipo === null);

  /*
   * Al pasar de casilla (hoja de Mai, a6 §3.1): que se vea la casilla entera;
   * después, si cabe, el rótulo; y si cabe todo, la fila de la tabla que usa
   * la casilla (`fila`). Si no cabe, lo mínimo: la casilla y el rótulo, o la
   * casilla sola. La página se mueve lo justo, como en MaquinaPegada.
   */
  useEffect(() => {
    if (n === 0 || modoDemo || !casillaRef.current) return;
    const rect = (el) => el?.getBoundingClientRect();
    const casilla = rect(casillaRef.current);
    const rotuloR = rect(rotuloRef.current);
    const doc = casillaRef.current.ownerDocument;
    /* La fila de la tabla que usa la casilla (a6) o, con un visual propio, su renglón encendido (a5). */
    const filaR = actual.fila ? rect(doc.querySelector(`[data-regla] [data-fila="${actual.fila}"]`))
      : config.visual ? rect(doc.querySelector("[data-renglon-activo]")) : null;
    const arriba = 8;
    const abajo = window.innerHeight - 8;
    const union = (rs) => ({ top: Math.min(...rs.map((r) => r.top)), bottom: Math.max(...rs.map((r) => r.bottom)) });
    const cabe = (r) => r.bottom - r.top <= abajo - arriba;
    const candidatos = [[casilla, rotuloR, filaR], [casilla, rotuloR], [casilla]].map((rs) => rs.filter(Boolean));
    const objetivo = candidatos.map(union).find(cabe) ?? casilla;
    let delta = 0;
    if (objetivo.bottom > abajo) delta = objetivo.bottom - abajo;
    if (objetivo.top - delta < arriba) delta = objetivo.top - arriba;
    if (Math.abs(delta) > 0.5) window.scrollBy?.({ top: delta, behavior: reducido ? "auto" : "smooth" });
  }, [n]); // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    if (terminado && !modoDemo) onCompletar?.(pct, Date.now() - inicio.current, detalle.current);
  }, [terminado]); // eslint-disable-line react-hooks/exhaustive-deps

  const responder = (op) => {
    if (elegida) return;
    const ok = op.tipo === null;
    detalle.current.push({ item: actual.id, ok, intentos: 1, respuesta: ok ? null : claveDe(op), orden: detalle.current.length + 1 });
    if (ok) setAciertos((x) => x + 1);
    setRespuestas((xs) => [...xs, { id: actual.id, ok }]);
    setElegida(op);
  };
  const avanzar = () => {
    if (!elegida) return;
    setElegida(null);
    if (n + 1 < total) setN(n + 1);
    else setTerminado(true);
  };
  const reiniciar = () => {
    setN(0); setElegida(null); setAciertos(0); setRespuestas([]); setTerminado(false);
    setOrden(ordenar(casillas, !ejemplo));
    detalle.current = []; inicio.current = Date.now();
  };

  if (terminado && !modoDemo) {
    return (
      <Marco rotulo={rotulo} titulo={titulo} acento={acento}>
        <Cierre pct={Math.round(pct)} onReiniciar={reiniciar} textoReiniciar="Otra tanda">
          <p data-cierre-texto style={TEXTO_CIERRE}>{config.cierre}</p>
        </Cierre>
      </Marco>
    );
  }

  const retro = elegida && elegida.tipo ? `❌ ${config.errores[elegida.tipo]}` : null;
  /* El registro: cada casilla ya respondida, con su valor correcto y si se acertó. */
  const resueltas = casillas.slice(0, n + (elegida ? 1 : 0));

  return (
    <Marco rotulo={rotulo} titulo={titulo} acento={acento}>
      {!modoDemo && <Encabezado consigna={config.consigna} onComoSeJuega={onComoSeJuega} />}
      {config.rotuloSimulado && !config.reglaTabla && <div ref={rotuloRef} style={{ margin: "0 0 10px" }}><RotuloSimulado texto={config.rotuloSimulado} /></div>}
      {config.reglaTabla
        ? (
          <TablaRegla
            filas={config.reglaTabla.filas}
            pie={config.reglaTabla.pie}
            datos={modoDemo ? null : parte.datos}
            rotulo={config.rotuloSimulado && <div ref={rotuloRef} style={{ margin: "8px 0 0" }}><RotuloSimulado texto={config.rotuloSimulado} /></div>}
          />
        )
        : <p data-regla style={ESTILO_REGLA}>{config.regla}</p>}
      {config.nota && (
        <p data-nota-regla style={{ margin: "-4px 0 12px", fontSize: "13px", lineHeight: 1.5, color: "rgba(248,249,250,0.75)" }}>
          {config.nota.texto}
          {config.nota.pie && <span style={PIE}><PieDeFuente texto={config.nota.pie} /></span>}
        </p>
      )}
      {!modoDemo && config.partida && (
        <p data-partida style={{ margin: "0 0 12px", padding: "10px 13px", borderRadius: "12px", background: "rgba(184,196,212,0.13)", fontSize: "13.5px", lineHeight: 1.5, color: FAE.text }}>
          {config.partida}
        </p>
      )}
      {!modoDemo && (
        <div style={{ marginBottom: "12px" }}>
          <Pulsos total={total} hechos={n + (elegida ? 1 : 0)} enCurso={n + 1} etiqueta={config.etiqueta} />
        </div>
      )}

      {/* Con un visual propio (b5-t6-a5: la cuenta que se llena), el visual es el registro. */}
      {config.visual && !modoDemo && (
        <config.visual.Componente respondidas={resueltas.length} abierta={elegida ? null : n} reducido={reducido}
          anuncio={elegida ? config.visual.anuncio(n) : ""} />
      )}
      {resueltas.length > 0 && !(config.visual && !modoDemo) && (
        <ol data-registro style={{ margin: "0 0 12px", padding: 0, listStyle: "none", display: "flex", flexDirection: "column", gap: "4px" }}>
          {resueltas.map((c, k) => {
            const bien = respuestas[k]?.ok;
            return (
              <li key={c.id} data-resuelta={c.id} data-acierto={bien ? "si" : "no"} style={{ display: "flex", justifyContent: "space-between", gap: "10px", fontSize: "13px", lineHeight: 1.4, color: SECUNDARIO }}>
                <span>{`${config.etiqueta} ${k + 1}`}</span>
                <span style={{ color: FAE.text, whiteSpace: "nowrap", fontVariantNumeric: "tabular-nums" }}>
                  {textoDe(c.opciones.find((o) => o.tipo === null))} {bien ? "✓" : "✗"}
                </span>
              </li>
            );
          })}
        </ol>
      )}

      <div ref={casillaRef}>
      <div data-hecho={actual.id}>
        <Enunciado acento={acento}>{actual.enunciado}</Enunciado>
      </div>
      {/* En una columna (hoja de Mai): en fila de tres, a 320 quedan 61 px por opción y «$2.506.200» mide 83. */}
      <Opciones columnas="minmax(0, 1fr)">
        {orden[n].map((op) => (
          <Opcion
            key={claveDe(op)}
            ancho
            deshabilitada={Boolean(elegida)}
            onClick={() => responder(op)}
            estado={!elegida ? null : op === elegida ? (op.tipo === null ? "correcta" : "incorrecta") : op === correcta ? "revelada" : null}
          >
            <span data-opcion={claveDe(op)}>{textoDe(op)}</span>
          </Opcion>
        ))}
      </Opciones>
      </div>
      <Retro texto={retro} />
      {ejemplo?.resolucion && elegida && (
        <p data-resolucion style={{ margin: "12px 0 0", padding: "11px 13px", borderRadius: "12px", background: "rgba(184,196,212,0.13)", fontSize: "15px", lineHeight: "22px", color: FAE.text }}>
          {ejemplo.resolucion}
        </p>
      )}
      {elegida && !modoDemo && <Avanzar onClick={avanzar}>{n + 1 === total ? "Ver resultado" : "Siguiente"}</Avanzar>}
      {!modoDemo && <p style={SOLO_LECTOR}>{config.alt}</p>}
    </Marco>
  );
}
