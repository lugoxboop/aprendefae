import { useEffect, useRef, useState } from "react";
import { barajar } from "../../../utils/barajar.js";
import { porcentaje } from "../../../data/politicaFiscal.js";
import { DOS_ENTRADAS, PREGUNTAS_DOS_ENTRADAS, preguntaDe, retroDosEntradas } from "../../../data/monetariaRepaso.js";
import { Opcion, Opciones, Retro, Pulsos, Cierre, Enunciado } from "../corazon/juego.jsx";
import { Avanzar, TEXTO_CIERRE } from "../bloques/marcos.jsx";
import { Encabezado } from "../libros/tema1/encabezado.jsx";

/*
 * ═══════════════════════════════════════════════════════════════════════════
 * LAS DOS ENTRADAS — Aplicación, 25 FP.
 *
 * El patrón de «El Volante de la Tasa» (PrediccionTasa): una pregunta, dos
 * botones, un toque. Es un componente nuevo, autorizado por Levi, porque el
 * Volante tiene sus dos botones fijos para toda la partida («Subir / Bajar») y
 * un solo texto de error; aquí cambian con el tipo de pregunta:
 *
 *   dirección   una decisión  → «Hacia arriba» / «Hacia abajo»
 *   sentido     dos decisiones → «Van igual» / «Van en contra»
 *
 * Doce preguntas, 3 y 3 en cada tipo: responder todas con el mismo botón da
 * 6 de 12. Los dos botones de cada tipo cambian de lado en cada partida, como
 * en el Volante. PrediccionTasa no se toca.
 *
 *   pct = aciertos / 12 × 100, sin redondear por el camino
 *
 * Ítem = la pregunta, por su id; `respuesta` guarda lo que se eligió al fallar.
 *
 * MODO DEMO («Así se juega»): llega `items` con el ejemplo de las obras, no se
 * baraja nada, no hay encabezado y nunca se llama a `onCompletar`.
 * ═══════════════════════════════════════════════════════════════════════════
 */

/* Primero las seis de dirección, después las seis de sentido; cada grupo, barajado. */
export const ordenarPreguntas = (mezclar = barajar) => [
  ...mezclar(PREGUNTAS_DOS_ENTRADAS.filter((p) => p.tipo === "direccion")),
  ...mezclar(PREGUNTAS_DOS_ENTRADAS.filter((p) => p.tipo === "sentido")),
];

const ESTILO_DEBAJO = {
  margin: "8px 0 0", padding: "0 0 0 13px", listStyle: "none",
  display: "flex", flexDirection: "column", gap: "4px",
  fontSize: "12.5px", lineHeight: 1.5, color: "rgba(248,249,250,0.72)",
};

export default function DosEntradas({
  Marco, rotulo, titulo, acento, onCompletar, items = null, modoDemo = false, onComoSeJuega = null,
}) {
  const sortear = () => items ?? ordenarPreguntas();
  const ladosNuevos = () => (modoDemo ? {} : { direccion: barajar([0, 1]), sentido: barajar([0, 1]) });
  const [preguntas, setPreguntas] = useState(sortear);
  const [lados, setLados] = useState(ladosNuevos);
  const [i, setI] = useState(0);
  const [elegida, setElegida] = useState(null);
  const [aciertos, setAciertos] = useState(0);
  const [terminado, setTerminado] = useState(false);

  const respondidas = useRef(new Set());
  const detalle = useRef([]);
  const inicio = useRef(Date.now());

  const p = preguntas[i];
  const pct = porcentaje(aciertos, preguntas.length);

  useEffect(() => {
    if (terminado && !modoDemo) onCompletar?.(pct, Date.now() - inicio.current, detalle.current);
  }, [terminado]);

  const responder = (id) => {
    if (respondidas.current.has(p.id)) return;
    respondidas.current.add(p.id);
    const ok = id === p.correcta;
    detalle.current.push({ item: p.id, ok, intentos: 1, respuesta: ok ? null : id, orden: detalle.current.length + 1 });
    if (ok) setAciertos((n) => n + 1);
    setElegida(id);
  };

  const avanzar = () => {
    if (!elegida) return;
    setElegida(null);
    if (i + 1 < preguntas.length) setI(i + 1);
    else setTerminado(true);
  };

  const reiniciar = () => {
    setPreguntas(sortear());
    setLados(ladosNuevos());
    setI(0); setElegida(null); setAciertos(0); setTerminado(false);
    respondidas.current = new Set();
    detalle.current = [];
    inicio.current = Date.now();
  };

  if (terminado && !modoDemo) {
    return (
      <Marco rotulo={rotulo} titulo={titulo} acento={acento}>
        <Cierre pct={Math.round(pct)} onReiniciar={reiniciar} textoReiniciar="Otra tanda">
          <p data-cierre-texto style={TEXTO_CIERRE}>{DOS_ENTRADAS.cierre}</p>
        </Cierre>
      </Marco>
    );
  }

  const pregunta = preguntaDe(p);
  const orden = lados[p.tipo] ?? [0, 1];
  const opciones = orden.map((k) => pregunta.opciones[k]);
  const retro = elegida ? retroDosEntradas(p, elegida) : null;

  return (
    <Marco rotulo={rotulo} titulo={titulo} acento={acento}>
      {!modoDemo && <Encabezado objetivo={DOS_ENTRADAS.objetivo} consigna={DOS_ENTRADAS.consigna} onComoSeJuega={onComoSeJuega} />}
      {!modoDemo && (
        <div style={{ marginBottom: "12px" }}>
          <Pulsos total={preguntas.length} hechos={i + (elegida ? 1 : 0)} enCurso={i + 1} etiqueta="Pregunta" />
        </div>
      )}
      <div data-hecho data-tipo-pregunta={p.tipo}>
        <Enunciado rotulo={pregunta.pregunta.toUpperCase()} acento={acento}>{p.texto}</Enunciado>
      </div>
      <Opciones columnas="repeat(auto-fit, minmax(140px, 1fr))">
        {opciones.map((o) => (
          <Opcion
            key={o.id}
            ancho
            deshabilitada={Boolean(elegida)}
            onClick={() => responder(o.id)}
            estado={!elegida ? null : o.id === elegida ? (o.id === p.correcta ? "correcta" : "incorrecta") : o.id === p.correcta ? "revelada" : null}
          >
            {o.nombre}
          </Opcion>
        ))}
      </Opciones>
      {retro && <Retro texto={retro.linea} />}
      {retro?.debajo.length > 0 && (
        <ul data-explicaciones style={ESTILO_DEBAJO}>
          {retro.debajo.map((t) => <li key={t}>{t}</li>)}
        </ul>
      )}
      {elegida && !modoDemo && <Avanzar onClick={avanzar}>{i + 1 === preguntas.length ? "Ver resultado" : "Siguiente"}</Avanzar>}
    </Marco>
  );
}
