import { useEffect, useRef, useState } from "react";
import { barajar } from "../../../../utils/barajar.js";
import { porcentaje } from "../../../../data/politicaFiscal.js";
import { Opciones, Cierre, Enunciado } from "../../corazon/juego.jsx";
/* E4 (hoja de fusiones de Mai): la opción de la célula, con el contrato de la compartida y sus pastillas (lote 6d). */
import { OpcionE4 as Opcion } from "./MarcasE4.jsx";
import { TEXTO_CIERRE } from "../../bloques/marcos.jsx";
import { Responder } from "../piezas.jsx";
import { Mensaje, RegionViva, botonDeAvance, CSS_B5H, CLASE_B5H } from "./Devolucion.jsx";
import EncabezadoCompacto from "./EncabezadoCompacto.jsx";
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
 *           retro(hecho, elegida), veredicto?(hecho, elegida), cierre, alt, etiqueta, visual? }
 * `visual` es un componente que va entre el hecho y las opciones y recibe
 * { hecho, elegida, reducido } (b5-t6-a4: el asiento mínimo).
 *
 * LOTE 6d (estándar único de Hacer): la elegida queda «Correcto» o «No va
 * aquí» y la correcta no elegida, «Iba aquí» (un solo intento: se revela). El
 * veredicto del bloque de mensaje es el estado (elegida === respuesta), no el
 * texto. Un toque elige y califica: no hay «Comprobar». El avance es el
 * Responder compartido, «Siguiente {sustantivo del contador}» y, al final,
 * «Ver mi resumen». La regla de la demo va directo sobre el Panel.
 * ═══════════════════════════════════════════════════════════════════════════
 */

const ESTILO_REGLA = {
  margin: "0 0 12px", padding: 0,
  fontSize: "13.5px", lineHeight: 1.5, color: "rgba(248,249,250,0.86)",
};

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
  /*
   * Lote 19 (D4, P2 de Mai): la segunda decisión, opcional (`config.segunda`); sin ella, nada cambia. Sigue a
   * la primera en cada hecho, pregunta otra cosa y mueve su modelo; pista al primer error y porqué al
   * segundo (C2). Suma como una decisión más: el primer intento vale entero; el segundo, la mitad.
   */
  const segunda = config.segunda ?? null;
  const [elegidas2, setElegidas2] = useState([]);
  const [r2, setR2] = useState(null);
  const [suma2, setSuma2] = useState(0);

  const respondidos = useRef(new Set());
  const detalle = useRef([]);
  const inicio = useRef(Date.now());

  const hecho = hechos[i];
  const pct = segunda ? porcentaje(aciertos + suma2, hechos.length * 2) : porcentaje(aciertos, hechos.length);
  const fin2 = Boolean(r2) && (r2.ok || elegidas2.length >= 2);
  const correcta2 = segunda && elegida ? segunda.correcta(hecho) : null;

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

  const elegir2 = (id) => {
    if (fin2 || elegidas2.includes(id)) return;
    const intento = elegidas2.length + 1;
    const nuevo = segunda.evaluar(hecho, id, intento);
    if (intento === 1) detalle.current.push({ item: `${hecho.id}/2`, ok: nuevo.ok, intentos: 1, respuesta: nuevo.ok ? null : id, orden: detalle.current.length + 1 });
    if (nuevo.ok) setSuma2((n) => n + (intento === 1 ? 1 : 0.5));
    setElegidas2((xs) => [...xs, id]);
    setR2(nuevo);
  };

  const avanzar = () => {
    if (!elegida || (segunda && !fin2)) return;
    setElegida(null); setElegidas2([]); setR2(null);
    if (i + 1 < hechos.length) setI(i + 1);
    else setTerminado(true);
  };

  const reiniciar = () => {
    setHechos(sortear());
    setI(0); setElegida(null); setAciertos(0); setTerminado(false);
    setElegidas2([]); setR2(null); setSuma2(0);
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
  /* El veredicto es un estado de la evaluación («correcta» o «error»), nunca el texto de la devolución. */
  const ok = elegida ? (config.veredicto?.(hecho, elegida) ?? (elegida === hecho.respuesta ? "correcta" : "error")) === "correcta" : false;

  return (
    <Marco rotulo={rotulo} titulo={titulo} acento={acento}>
      <style>{CSS_B5H}</style>
      <div className={CLASE_B5H}>
      {/* Lote 6c: el encabezado compacto de la célula; la consigna y los pasos, plegados bajo «¿Cómo se juega?». */}
      {/* En la partida, la nota y la regla van plegadas con los pasos (B1: la figura en los primeros 280 px). */}
      {!modoDemo && <EncabezadoCompacto objetivo={config.objetivo} consigna={config.consigna} pasos={config.reglas ?? []}
        notas={[config.nota, config.regla].filter(Boolean)} contador={`${config.etiqueta} ${i + 1} de ${hechos.length}`} />}
      {modoDemo && <p data-regla style={ESTILO_REGLA}>{config.regla}</p>}
      {/* Un visual propio, la figura (b5-t6-a4: el asiento mínimo, hoja 4 de Mai). Lote 6c: va antes del hecho. */}
      {config.visual && <config.visual hecho={hecho} elegida={elegida} reducido={reducido} segunda={segunda ? { elegidas: elegidas2, correcta: correcta2, fin: fin2 } : null} />}
      <div data-hecho={hecho.id}>
        <Enunciado acento={acento}>{hecho.texto}</Enunciado>
      </div>
      {/* Una columna, siempre a la vista y en el orden de Futaba (hoja de Mai). */}
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
      <RegionViva>{elegida && <Mensaje ok={ok} texto={retro} />}</RegionViva>
      {segunda && elegida && !modoDemo && (
        <>
          <segunda.Vista hecho={hecho} activa={!fin2} elegidas={elegidas2} correcta={correcta2} fin={fin2} onElegir={elegir2} reducido={reducido} />
          <RegionViva>{r2 && <Mensaje ok={r2.ok} texto={r2.texto} />}</RegionViva>
        </>
      )}
      {elegida && !modoDemo && (!segunda || fin2) && <div data-boton-avanzar><Responder onClick={avanzar}>{botonDeAvance(config.etiqueta, i + 1 === hechos.length)}</Responder></div>}
      {!modoDemo && <p style={SOLO_LECTOR}>{config.alt}</p>}
      </div>
    </Marco>
  );
}
