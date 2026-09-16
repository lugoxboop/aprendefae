import { useEffect, useRef, useState } from "react";
import { FAE } from "../../../theme.js";
import { barajar } from "../../../utils/barajar.js";
import { TERMINOS_ECG, DEFINICIONES_ECG, FRAGMENTOS_ECG, retroDefinicionECG, retroFragmentoECG } from "../../../data/demandaAgregadaHacer.js";
import { Camaraseccion } from "./circulatorio.jsx";
import { CSS_JUEGO, Opcion, Opciones, Retro, Pulsos, Cierre, Enunciado } from "./juego.jsx";

/*
 * ACTIVIDAD 1 — "Lectura de electrocardiograma". Recordar · Medio.
 *
 * Dos etapas: ocho definiciones y cuatro fragmentos de la fórmula.
 *
 * ═══════════ UNA SOLA RESPUESTA POR PREGUNTA ═══════════
 *
 * No hay reintento. Es deliberado: lo que se registra en fp_detalle es el
 * acierto AL PRIMER INTENTO, que es la convención de todo el tema, y dejar
 * reintentar hasta acertar convertiría el porcentaje en una medida de
 * constancia —el mismo defecto por el que el simulador viejo era exploratoria
 * y no evaluativa—. La devolución sale igual, acierte o falle: ahí está lo que
 * se enseña.
 *
 * ═══════════ EL SORTEO SACA UNA DE CADA PAREJA ═══════════
 *
 * Las dieciséis definiciones son ocho parejas de paráfrasis. Se saca una de
 * cada pareja, no ocho al azar de dieciséis: con el sorteo ingenuo unos
 * términos saldrían dos veces y otros ninguna, y la actividad dejaría de
 * cubrir los ocho.
 *
 * ═══════════ LOS ids ═══════════
 *
 *   def:<termino>    ocho, uno por término
 *   frag:<fragmento> cuatro de seis
 *
 * Los dos prefijos hacen imposible que una etapa pise a la otra, y dentro de
 * cada etapa el id sale de una lista sin repetidos. La etapa 1 usa el TÉRMINO y
 * no la definición sorteada: las dos variantes preguntan lo mismo y separarlas
 * partiría en dos la pregunta que el docente quiere ver entera.
 */

/* Los pesos de las dos etapas. Suman 100 y se dividen, nunca se multiplican. */
const PESO_DEFINICIONES = 60;
const PESO_FRAGMENTOS = 40;
const CUANTOS_FRAGMENTOS = 4;

function sortearDefiniciones() {
  /* Una de cada pareja, y luego el orden de las ocho preguntas. */
  const porTermino = TERMINOS_ECG.map((t) => {
    const pareja = DEFINICIONES_ECG.filter((d) => d.termino === t.id);
    return barajar(pareja)[0];
  });
  return barajar(porTermino);
}

export default function Electrocardiograma({ onCompletar }) {
  const [tanda, setTanda] = useState(sortearDefiniciones);
  const [fragmentos, setFragmentos] = useState(() => barajar(FRAGMENTOS_ECG).slice(0, CUANTOS_FRAGMENTOS));
  /* El orden de las opciones se fija una vez por partida, no por pregunta. */
  const [terminos, setTerminos] = useState(() => barajar(TERMINOS_ECG));
  const [lecturas, setLecturas] = useState(() => barajar(FRAGMENTOS_ECG));

  const [etapa, setEtapa] = useState(1);
  const [i, setI] = useState(0);
  const [elegido, setElegido] = useState(null);
  const [aciertos, setAciertos] = useState({ definiciones: 0, fragmentos: 0 });
  const [terminado, setTerminado] = useState(false);

  const detalle = useRef([]);
  const inicio = useRef(Date.now());

  const definicion = tanda[i];
  const fragmento = fragmentos[i];

  const pct = Math.round(
    (aciertos.definiciones / tanda.length) * PESO_DEFINICIONES +
      (aciertos.fragmentos / fragmentos.length) * PESO_FRAGMENTOS
  );

  useEffect(() => {
    if (terminado) onCompletar?.(pct, Date.now() - inicio.current, detalle.current);
  }, [terminado]);

  const anotar = (item, ok, respuesta) => {
    detalle.current.push({
      item,
      ok,
      intentos: 1,
      respuesta: ok ? null : respuesta,
      orden: detalle.current.length + 1,
    });
  };

  const responderDefinicion = (termino) => {
    if (elegido) return;
    const ok = termino.id === definicion.termino;
    setElegido(termino.id);
    if (ok) setAciertos((a) => ({ ...a, definiciones: a.definiciones + 1 }));
    anotar(`def:${definicion.termino}`, ok, termino.id);
  };

  const responderFragmento = (opcion) => {
    if (elegido) return;
    const ok = opcion.id === fragmento.id;
    setElegido(opcion.id);
    if (ok) setAciertos((a) => ({ ...a, fragmentos: a.fragmentos + 1 }));
    anotar(`frag:${fragmento.id}`, ok, opcion.id);
  };

  const avanzar = () => {
    setElegido(null);
    if (etapa === 1) {
      if (i + 1 < tanda.length) return setI(i + 1);
      setEtapa(2);
      return setI(0);
    }
    if (i + 1 < fragmentos.length) return setI(i + 1);
    setTerminado(true);
  };

  const reiniciar = () => {
    setTanda(sortearDefiniciones());
    setFragmentos(barajar(FRAGMENTOS_ECG).slice(0, CUANTOS_FRAGMENTOS));
    setTerminos(barajar(TERMINOS_ECG));
    setLecturas(barajar(FRAGMENTOS_ECG));
    setEtapa(1); setI(0); setElegido(null);
    setAciertos({ definiciones: 0, fragmentos: 0 });
    setTerminado(false);
    detalle.current = [];
    inicio.current = Date.now();
  };

  /* ─────────────────────────── la devolución ─────────────────────────── */

  /* Las dos devoluciones viven en el banco: el Repaso Diario las reutiliza tal cual. */
  let retro = null;
  if (elegido && etapa === 1) retro = retroDefinicionECG(definicion, elegido);
  else if (elegido && etapa === 2) retro = retroFragmentoECG(fragmento, elegido);

  if (terminado) {
    return (
      <Camaraseccion rotulo="ELECTROCARDIOGRAMA" titulo="Trazo leído" acento={FAE.teal}>
        <style>{CSS_JUEGO}</style>
        <Cierre pct={pct} onReiniciar={reiniciar} textoReiniciar="Leer otro trazo">
          <p style={{ margin: 0, fontSize: "13px", lineHeight: 1.55, color: "rgba(248,249,250,0.68)" }}>
            Definiciones: {aciertos.definiciones} de {tanda.length} · Fragmentos: {aciertos.fragmentos} de{" "}
            {fragmentos.length}. Las definiciones pesan {PESO_DEFINICIONES}% y los fragmentos{" "}
            {PESO_FRAGMENTOS}%.
          </p>
        </Cierre>
      </Camaraseccion>
    );
  }

  const total = etapa === 1 ? tanda.length : fragmentos.length;

  return (
    <Camaraseccion
      rotulo={etapa === 1 ? "ETAPA 1 · LAS DEFINICIONES" : "ETAPA 2 · LA FÓRMULA"}
      titulo={etapa === 1 ? "¿De qué término es esta lectura?" : "¿Qué dice este fragmento?"}
      acento={etapa === 1 ? FAE.teal : FAE.ambar}
    >
      <style>{CSS_JUEGO}</style>

      <div style={{ marginBottom: "14px" }}>
        <Pulsos total={total} hechos={i + (elegido ? 1 : 0)} etiqueta={etapa === 1 ? "Definición" : "Fragmento"} />
      </div>

      {etapa === 1 ? (
        <>
          <Enunciado rotulo="LECTURA">{definicion.texto}</Enunciado>
          <Opciones>
            {terminos.map((t) => (
              <Opcion
                key={t.id}
                ancho
                deshabilitada={Boolean(elegido)}
                onClick={() => responderDefinicion(t)}
                estado={
                  !elegido ? null
                    : t.id === elegido
                      ? (t.id === definicion.termino ? "correcta" : "incorrecta")
                      : (t.id === definicion.termino ? "revelada" : null)
                }
              >
                {t.nombre}
              </Opcion>
            ))}
          </Opciones>
        </>
      ) : (
        <>
          <Enunciado rotulo="FRAGMENTO" acento={FAE.ambar}>
            <span style={{ fontFamily: "Sora, sans-serif", fontSize: "24px", fontWeight: 700, letterSpacing: "0.01em" }}>
              {fragmento.fragmento}
            </span>
          </Enunciado>
          <Opciones>
            {lecturas.map((f) => (
              <Opcion
                key={f.id}
                ancho
                deshabilitada={Boolean(elegido)}
                onClick={() => responderFragmento(f)}
                estado={
                  !elegido ? null
                    : f.id === elegido
                      ? (f.id === fragmento.id ? "correcta" : "incorrecta")
                      : (f.id === fragmento.id ? "revelada" : null)
                }
              >
                {f.lectura}
              </Opcion>
            ))}
          </Opciones>
        </>
      )}

      <Retro texto={retro} />

      {elegido && (
        <button
          type="button"
          onClick={avanzar}
          style={{
            marginTop: "14px", fontFamily: "Sora, sans-serif", fontSize: "13px", fontWeight: 600,
            padding: "11px 18px", borderRadius: "999px", cursor: "pointer",
            background: FAE.teal, border: "none", color: FAE.bg,
          }}
        >
          {etapa === 1 && i + 1 === tanda.length
            ? "Pasar a la fórmula"
            : etapa === 2 && i + 1 === fragmentos.length
              ? "Ver resultado"
              : "Siguiente"}
        </button>
      )}
    </Camaraseccion>
  );
}
