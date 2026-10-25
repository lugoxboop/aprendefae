import { useEffect, useRef, useState } from "react";
import { barajar } from "../../../../utils/barajar.js";
import { FAE } from "../../../../theme.js";
import { USUARIOS } from "../../../../data/contabilidadIntro.js";
import { H1, RESPUESTAS_H1, LINEA_H1, ALT_H1 } from "../../../../data/contabilidadT1Hacer2.js";
import { sortearH1, evaluarH1, escenaH1, altH1 } from "../../../../contabilidad/tema1Hacer2.js";
import { puntuar, pesoDeCadaItem } from "../../../../contabilidad/tema1.js";
import { Cierre } from "../../corazon/juego.jsx";
import { TEXTO_CIERRE } from "../../bloques/marcos.jsx";
import { useTanda } from "../piezas.jsx";
import EncabezadoCompacto from "../b5/EncabezadoCompacto.jsx";
import { useVuelta } from "../b5/ConVuelta.jsx";
import {
  Pastilla, Mensaje, RegionViva, IconoCheck, IconoX, CORRECTA, TACHADA, REVELADA, CSS_B5H, CLASE_B5H,
} from "../b5/Devolucion.jsx";
import {
  SORA, INTER, SECUNDARIO, NAVY, RIEL, HUNDIDO, REPOSO, ACIERTO, FANTASMA, estiloC2, contadorDe, Avance,
  CSS_REGISTRO, CURVA,
} from "./registro.jsx";

/*
 * ═══════════════════════════════════════════════════════════════════════════
 * H1 · ¿UN DÍA, UN AÑO O DOS FOTOS? — la línea del año (P2 de Mai, 23-oct;
 * ajustes del 24-oct, §5; banco de Futaba con las correcciones de Shoko).
 *
 * Una línea del año con una foto en cada punta —el 1 de enero y el 31 de
 * diciembre— y la franja de la película en medio. Llega la pregunta de una
 * persona y el estudiante decide qué la responde: una foto, la película o
 * comparar las dos fotos. Tres preguntas distintas, tres escenas distintas.
 *
 * Los tres rótulos son fijos (Shoko): el dato `foto` ya no rotula el botón,
 * solo decide qué marco se enciende. Así el botón no repite la fecha de la
 * pregunta, que era lo que la delataba.
 *
 * Un intento. Tras responder se enciende la escena CORRECTA (el registro), y
 * lo elegido, si erró, queda con el contorno coral discontinuo. R10: antes de
 * responder no hay nada encendido. El escenario no cambia de alto.
 *
 * D8: la primera vez se juega el mazo A y la siguiente el B (useVuelta).
 * ═══════════════════════════════════════════════════════════════════════════
 */

const CSS = `
.fae-th1-luz { transition: background-color 240ms ${CURVA}, border-color 240ms ${CURVA}, opacity 240ms ${CURVA}; }
@media (prefers-reduced-motion: reduce) { .fae-th1-luz { transition: none !important; } }
`;

/* El contorno del fantasma: por fuera, para que conviva con el encendido. */
const CONTORNO_FANTASMA = { outline: `2px dashed ${FAE.coral}`, outlineOffset: "3px" };

function Marco({ cual, encendido, fantasma }) {
  return (
    <div
      data-marco={cual}
      data-encendido={encendido ? "si" : "no"}
      data-fantasma={fantasma ? "si" : undefined}
      className="fae-th1-luz"
      style={{
        flex: "none", width: "52px", height: "52px", boxSizing: "border-box", borderRadius: "6px",
        display: "flex", alignItems: "center", justifyContent: "center",
        border: `2px solid ${encendido ? FAE.text : RIEL}`, background: encendido ? NAVY : "transparent",
        fontFamily: INTER, fontSize: "12px", fontWeight: 600, color: encendido ? FAE.text : SECUNDARIO,
        ...(fantasma ? CONTORNO_FANTASMA : {}),
      }}
    >
      {LINEA_H1.foto}
    </div>
  );
}

function LineaDelAno({ luz, fantasma, alt }) {
  return (
    <div data-linea-ano role="img" aria-label={alt}>
      <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
        <Marco cual="enero" encendido={Boolean(luz.enero)} fantasma={Boolean(fantasma.enero)} />
        {/* La franja de la película, de foto a foto, rayada a 6 px, sobre la línea del año. */}
        <div style={{ position: "relative", flex: 1, height: "16px" }}>
          <span aria-hidden="true" style={{ position: "absolute", left: 0, right: 0, top: "7px", height: "2px", background: RIEL }} />
          <span
            data-franja-ano={luz.franja ? "encendida" : "apagada"}
            data-fantasma={fantasma.franja ? "si" : undefined}
            className="fae-th1-luz"
            style={{
              position: "absolute", inset: 0, boxSizing: "border-box", borderRadius: "3px",
              background: "repeating-linear-gradient(135deg, rgba(184,196,212,.45) 0 2px, transparent 2px 6px)",
              border: `2px solid ${luz.franja ? FAE.text : "transparent"}`,
              ...(fantasma.franja ? CONTORNO_FANTASMA : {}),
            }}
          />
        </div>
        <Marco cual="diciembre" encendido={Boolean(luz.diciembre)} fantasma={Boolean(fantasma.diciembre)} />
      </div>
      <div style={{ display: "flex", justifyContent: "space-between", marginTop: "6px", fontFamily: INTER, fontSize: "12px", color: SECUNDARIO }}>
        <span>{LINEA_H1.enero}</span>
        <span>{LINEA_H1.diciembre}</span>
      </div>
      {/* La llave, de foto a foto: un corchete de 2 px que solo se ve encendido. Su sitio está siempre. */}
      <svg data-llave={luz.llave ? "encendida" : "apagada"} viewBox="0 0 100 12" preserveAspectRatio="none" aria-hidden="true"
        style={{ display: "block", width: "100%", height: "12px", marginTop: "4px", ...(fantasma.llave ? CONTORNO_FANTASMA : {}) }}>
        <path d="M 4 1 L 4 8 L 96 8 L 96 1" fill="none" vectorEffect="non-scaling-stroke"
          stroke={luz.llave ? FAE.text : fantasma.llave ? FAE.coral : "transparent"} strokeWidth="2"
          strokeDasharray={!luz.llave && fantasma.llave ? "4 3" : "none"} />
      </svg>
    </div>
  );
}

/*
 * ═══════════ EL MODO DEMO ═══════════
 * Es este mismo componente: `items` le da el ejemplo desde afuera y `modoDemo`
 * le quita el encabezado y el avance, y no llama a `onCompletar`.
 */
export default function UnDiaOUnAno({
  Marco: MarcoDePieza, rotulo, titulo, acento, onCompletar, items = null, modoDemo = false,
}) {
  const { variante, alCompletar } = useVuelta(H1.id, onCompletar);
  const t = useTanda(() => items ?? sortearH1(barajar, variante));

  const [r, setR] = useState(null);
  const [marcada, setMarcada] = useState(null);
  const [respuestas, setRespuestas] = useState([]);
  const zonaBoton = useRef(null);

  const q = t.items[t.i];
  const cuantas = t.items.length;
  const pct = puntuar(respuestas, cuantas);

  useEffect(() => {
    if (t.terminado && !modoDemo) alCompletar(pct, Date.now() - t.inicio.current, t.detalle.current);
  }, [t.terminado]);
  useEffect(() => {
    if (r && !modoDemo) zonaBoton.current?.focus({ preventScroll: true });
  }, [r]);

  const responder = (id) => {
    if (r) return;
    const nuevo = evaluarH1(q, id);
    t.anotar(q.id, nuevo.ok, nuevo.ok ? null : id);
    setRespuestas((xs) => [...xs, { id: q.id, primeroOk: nuevo.ok }]);
    setMarcada(id);
    setR(nuevo);
  };
  const avanzar = () => {
    setR(null); setMarcada(null);
    if (t.i + 1 < cuantas) t.setI(t.i + 1);
    else t.setTerminado(true);
  };
  const reiniciar = () => { t.reiniciar(); setR(null); setMarcada(null); setRespuestas([]); };

  if (t.terminado) {
    const bien = respuestas.filter((x) => x.primeroOk).length;
    return (
      <MarcoDePieza rotulo={rotulo} titulo={titulo} acento={acento}>
        <Cierre pct={Math.round(pct)} onReiniciar={reiniciar} textoReiniciar="Otra tanda">
          <p style={TEXTO_CIERRE}>
            {bien} de {cuantas} al primer intento. Cada pregunta valía {pesoDeCadaItem(cuantas).toFixed(2)} %.
          </p>
        </Cierre>
      </MarcoDePieza>
    );
  }

  const luz = r ? escenaH1(q.respuesta, q) : {};
  const fantasma = r && !r.ok ? escenaH1(marcada, q) : {};
  const alt = r ? `${ALT_H1.reposo} ${ALT_H1[altH1(q.respuesta, q)]}` : ALT_H1.reposo;
  const quien = USUARIOS.find((u) => u.id === q.quien);

  return (
    <MarcoDePieza rotulo={rotulo} titulo={titulo} acento={acento}>
      <style>{CSS}{CSS_B5H}{CSS_REGISTRO}</style>
      <div className={CLASE_B5H} data-h1>
        {!modoDemo && (
          <EncabezadoCompacto objetivo={H1.objetivo} contador={contadorDe("Pregunta", t.i + 1, cuantas)} consigna={H1.consigna} />
        )}

        {/* Aquí dentro no entra el vocabulario del Tema 2. */}
        <div data-contenido>
          <div data-pregunta-h1={q.id} style={{
            margin: "0 0 10px", padding: "10px 12px", borderRadius: "11px",
            background: "rgba(10,20,34,0.5)", border: "1px solid rgba(248,249,250,0.18)",
          }}>
            {quien && <p data-quien={quien.id} style={{ margin: "0 0 3px", fontFamily: INTER, fontSize: "12px", color: SECUNDARIO }}>{quien.nombre}</p>}
            <p style={{ margin: 0, fontFamily: SORA, fontSize: "13px", fontWeight: 700, lineHeight: 1.4, color: FAE.text }}>
              «{q.texto}»
            </p>
          </div>

          <div data-escenario style={{ ...HUNDIDO, padding: "12px" }}>
            <LineaDelAno luz={luz} fantasma={fantasma} alt={alt} />
            <div role="group" aria-label={H1.consigna} style={{ display: "flex", flexDirection: "column", gap: "8px", marginTop: "12px" }}>
              {RESPUESTAS_H1.map((o) => {
                const estado = !r ? REPOSO : o.id === q.respuesta ? ACIERTO : o.id === marcada ? FANTASMA : REPOSO;
                const marca = !r ? null : o.id === q.respuesta ? (r.ok ? CORRECTA : REVELADA) : o.id === marcada ? TACHADA : null;
                return (
                  <button
                    key={o.id}
                    type="button"
                    data-respuesta={o.id}
                    data-estado={estado}
                    aria-pressed={marcada === o.id}
                    disabled={Boolean(r)}
                    onClick={() => responder(o.id)}
                    style={{
                      minHeight: "44px", padding: "6px 10px", borderRadius: "10px", boxSizing: "border-box",
                      display: "flex", alignItems: "center", justifyContent: "space-between", gap: "6px", textAlign: "left",
                      cursor: r ? "default" : "pointer", color: FAE.text,
                      fontFamily: SORA, fontSize: "13px", fontWeight: 600, lineHeight: 1.25,
                      ...estiloC2(estado),
                    }}
                  >
                    <span style={{ display: "flex", alignItems: "center", gap: "6px" }}>
                      {marca === TACHADA && <IconoX />}
                      {(marca === CORRECTA || marca === REVELADA) && <IconoCheck />}
                      <span>{o.texto}</span>
                    </span>
                    {marca && <Pastilla marca={marca} />}
                  </button>
                );
              })}
            </div>
          </div>
        </div>

        <RegionViva>
          {r && <Mensaje ok={r.ok} texto={r.texto} />}
        </RegionViva>

        {r && !modoDemo && (
          <Avance onClick={avanzar} refBoton={zonaBoton}>
            {t.i + 1 === cuantas ? "Ver el resultado" : "Siguiente pregunta"}
          </Avance>
        )}
      </div>
    </MarcoDePieza>
  );
}
