import { useEffect, useRef, useState } from "react";
import { barajar } from "../../../../utils/barajar.js";
import { porcentaje } from "../../../../data/politicaFiscal.js";
import { Opciones, Retro, Pulsos, Cierre, Enunciado } from "../../corazon/juego.jsx";
/* E4 (hoja de fusiones de Mai): la opción de la célula, con el contrato de la compartida y sus marcas ✓ y ✕. */
import { OpcionE4 as Opcion } from "./MarcasE4.jsx";
import { Avanzar, TEXTO_CIERRE } from "../../bloques/marcos.jsx";
import { Encabezado } from "../tema1/encabezado.jsx";
import { SOLO_LECTOR } from "../verbos.jsx";
import { useReducido } from "../tema3/DosLineas.jsx";

/*
 * ═══════════════════════════════════════════════════════════════════════════
 * ELIGE UNA OPCIÓN — el patrón de «¿Por Cuál Arteria Entra?», generalizado
 * dentro de la Célula B (b5-t6-a4 «¿Qué se debita?»).
 *
 * El original (maquinas/PorCualArteria.jsx) vive en Macroeconomía y está
 * atado a sus datos; no se toca. Esta copia hace lo mismo con lo de cada
 * actividad en `config`:
 *
 *   · un hecho a la vez, sin reloj, las opciones fijas siempre a la vista,
 *     en su orden (no se barajan);
 *   · el banco entero en cada partida, barajado;
 *   · un intento por hecho; al fallar, la devolución del tipo de error y la
 *     opción correcta marcada; al acertar, la devolución de acierto;
 *   · la regla fija en pantalla, la consigna con «¿Cómo se juega?» y, si la
 *     actividad la trae, una nota fija bajo la consigna;
 *   · pct = aciertos / hechos × 100, sin redondear por el camino;
 *   · el texto de cierre y el modo demo del tutorial.
 *
 * Ítem = el hecho, por su id; `respuesta` guarda la opción elegida al fallar.
 *
 * MODO DEMO («Así se juega»): llega `items` con el ejemplo, no se baraja
 * nada, no hay encabezado y nunca se llama a `onCompletar`.
 *
 * config: { consigna, nota?, regla, opciones: [{ id, nombre }], banco,
 *           retro(hecho, elegida), cierre, alt, etiqueta, visual? }
 * `visual` es un componente que va entre el hecho y las opciones y recibe
 * { hecho, elegida, reducido } (b5-t6-a4: el asiento mínimo).
 * ═══════════════════════════════════════════════════════════════════════════
 */

const ESTILO_REGLA = {
  margin: "0 0 12px", padding: "10px 13px", borderRadius: "12px",
  fontSize: "13.5px", lineHeight: 1.5, color: "rgba(248,249,250,0.86)",
  background: "rgba(248,249,250,0.05)", border: "1px solid rgba(248,249,250,0.14)",
};
const ESTILO_NOTA = { margin: "-6px 0 12px", fontSize: "13px", lineHeight: 1.5, color: "rgba(248,249,250,0.7)" };

export default function EligeUnaOpcion({
  config, Marco, rotulo, titulo, acento, onCompletar, items = null, modoDemo = false, onComoSeJuega = null,
}) {
  const sortear = () => (items ?? barajar([...config.banco]));
  const [hechos, setHechos] = useState(sortear);
  const [i, setI] = useState(0);
  const [elegida, setElegida] = useState(null);
  const reducido = useReducido();
  const [aciertos, setAciertos] = useState(0);
  const [terminado, setTerminado] = useState(false);

  const respondidos = useRef(new Set());
  const detalle = useRef([]);
  const inicio = useRef(Date.now());

  const hecho = hechos[i];
  const pct = porcentaje(aciertos, hechos.length);

  useEffect(() => {
    if (terminado && !modoDemo) onCompletar?.(pct, Date.now() - inicio.current, detalle.current);
  }, [terminado]); // eslint-disable-line react-hooks/exhaustive-deps

  const responder = (opcion) => {
    if (respondidos.current.has(hecho.id)) return;
    respondidos.current.add(hecho.id);
    const ok = opcion === hecho.respuesta;
    detalle.current.push({ item: hecho.id, ok, intentos: 1, respuesta: ok ? null : opcion, orden: detalle.current.length + 1 });
    if (ok) setAciertos((n) => n + 1);
    setElegida(opcion);
  };

  const avanzar = () => {
    if (!elegida) return;
    setElegida(null);
    if (i + 1 < hechos.length) setI(i + 1);
    else setTerminado(true);
  };

  const reiniciar = () => {
    setHechos(sortear());
    setI(0); setElegida(null); setAciertos(0); setTerminado(false);
    respondidos.current = new Set();
    detalle.current = [];
    inicio.current = Date.now();
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

  const retro = elegida ? config.retro(hecho, elegida) : null;

  return (
    <Marco rotulo={rotulo} titulo={titulo} acento={acento}>
      {!modoDemo && <Encabezado consigna={config.consigna} onComoSeJuega={onComoSeJuega} />}
      {!modoDemo && config.nota && <p data-nota-fija style={ESTILO_NOTA}>{config.nota}</p>}
      <p data-regla style={ESTILO_REGLA}>{config.regla}</p>
      {!modoDemo && (
        <div style={{ marginBottom: "12px" }}>
          <Pulsos total={hechos.length} hechos={i + (elegida ? 1 : 0)} enCurso={i + 1} etiqueta={config.etiqueta} />
        </div>
      )}
      <div data-hecho={hecho.id}>
        <Enunciado acento={acento}>{hecho.texto}</Enunciado>
      </div>
      {/* Una columna, siempre a la vista y en el orden de Futaba (hoja de Mai). */}
      {/* Un visual propio entre el hecho y las opciones (b5-t6-a4: el asiento mínimo, hoja 4 de Mai). */}
      {config.visual && <config.visual hecho={hecho} elegida={elegida} reducido={reducido} />}
      <Opciones columnas="minmax(0, 1fr)">
        {config.opciones.map((o) => (
          <Opcion
            key={o.id}
            ancho
            deshabilitada={Boolean(elegida)}
            onClick={() => responder(o.id)}
            estado={!elegida ? null : o.id === elegida ? (o.id === hecho.respuesta ? "correcta" : "incorrecta") : o.id === hecho.respuesta ? "revelada" : null}
          >
            <span data-opcion={o.id}>{o.nombre}</span>
          </Opcion>
        ))}
      </Opciones>
      <Retro texto={retro} />
      {elegida && !modoDemo && <Avanzar onClick={avanzar}>{i + 1 === hechos.length ? "Ver resultado" : "Siguiente"}</Avanzar>}
      {!modoDemo && <p style={SOLO_LECTOR}>{config.alt}</p>}
    </Marco>
  );
}
