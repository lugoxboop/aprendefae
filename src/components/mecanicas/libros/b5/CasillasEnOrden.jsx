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
 *     partida ya resuelto, los datos de cada parte y, si la actividad es un
 *     escenario simulado, su rótulo fijo y los pies de fuente en su forma;
 *   · pct = aciertos / casillas × 100, y el texto de cierre.
 *
 * Ítem = la casilla, por su id; `respuesta` guarda el valor elegido al fallar.
 *
 * MODO DEMO («Así se juega»): llega `items` con el ejemplo (una casilla), no
 * se baraja nada, no hay encabezado y nunca se llama a `onCompletar`.
 *
 * config: { consigna, regla | reglaTabla{ filas, pie }, nota?{ texto, pie },
 *           rotuloSimulado?, partida?, partes: [{ id, datos?{ filas, pie },
 *           casillas: [{ id, enunciado, opciones: [{ valor | texto, tipo }] }] }],
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
const CIFRA = { ...CELDA, textAlign: "right", whiteSpace: "nowrap", fontVariantNumeric: "tabular-nums" };

const textoDe = (op) => (op.valor !== undefined ? pesos(op.valor) : op.texto);
const claveDe = (op) => String(op.valor ?? op.texto);
/* Las opciones de cifras se barajan; las de texto (los grupos de una regla) van en su orden. */
const ordenar = (casillas, conBarajar) => casillas.map((c) => (conBarajar && c.opciones.every((o) => o.valor !== undefined) ? barajar(c.opciones) : c.opciones));

/* Una tabla de dos columnas (nombre | valor), con su pie en su forma. */
function Tabla({ filas, pie, marca }) {
  return (
    <div {...{ [marca]: "" }} style={{ ...ESTILO_REGLA, padding: "8px 11px" }}>
      <table style={{ width: "100%", borderCollapse: "collapse" }}>
        <tbody>
          {filas.map((f) => (
            <tr key={f.nombre} style={{ borderTop: f.total ? "none" : `1px solid ${BORDE}` }}>
              <th scope="row" style={{ ...CELDA, textAlign: "left", fontWeight: f.total ? 600 : 400 }}>{f.nombre}</th>
              <td style={{ ...CIFRA, fontWeight: f.total ? 600 : 400 }}>{f.valor}</td>
            </tr>
          ))}
        </tbody>
      </table>
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
  const pct = porcentaje(aciertos, total);
  const actual = casillas[n];
  const parte = partes.find((p) => p.id === actual.parte);
  const correcta = actual.opciones.find((o) => o.tipo === null);

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
  const esNumerica = actual.opciones.every((o) => o.valor !== undefined);

  return (
    <Marco rotulo={rotulo} titulo={titulo} acento={acento}>
      {!modoDemo && <Encabezado consigna={config.consigna} onComoSeJuega={onComoSeJuega} />}
      {config.rotuloSimulado && <div style={{ margin: "0 0 10px" }}><RotuloSimulado texto={config.rotuloSimulado} /></div>}
      {config.reglaTabla
        ? <Tabla filas={config.reglaTabla.filas} pie={config.reglaTabla.pie} marca="data-regla" />
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
      {!modoDemo && parte.datos && <Tabla filas={parte.datos.filas} pie={parte.datos.pie} marca="data-datos-parte" />}

      {resueltas.length > 0 && (
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

      <div data-hecho={actual.id}>
        <Enunciado acento={acento}>{actual.enunciado}</Enunciado>
      </div>
      <Opciones columnas={esNumerica ? "repeat(3, minmax(0, 1fr))" : "repeat(auto-fit, minmax(150px, 1fr))"}>
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
