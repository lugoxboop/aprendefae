import { useEffect, useRef, useState } from "react";
import { FAE } from "../../../theme.js";
import { barajar } from "../../../utils/barajar.js";
import {
  MEDIDAS_FLUJO, CANALES, retroFlujo, PREGUNTA_MULTIPLICADOR, OPCIONES_MULTIPLICADOR,
  PESO_ETAPA_1, PESO_ETAPA_2, puntuarFlujo,
} from "../../../data/politicaFiscal.js";
import { Tesoreria, Opcion, Opciones, Retro, Pulsos, Cierre, Enunciado, Avanzar, TEXTO_CIERRE } from "./tesoreria.jsx";

/*
 * ACTIVIDAD 3 — "Flujo de caja: ¿a quién afecta?". Aplicar · Difícil.
 *
 * Ataca el error central del tema: creer que cobrar y gastar llegan a la
 * Demanda Agregada por el mismo sitio. No: la tributación entra por el
 * Consumo o por la Inversión —a través de la renta o la utilidad que deja—, y
 * el gasto entra directo como G.
 *
 *   Etapa 1 · cuatro medidas reales, las cuatro, en orden barajado ... 60 %
 *   Etapa 2 · el multiplicador ....................................... 40 %
 *
 * Los ids llevan la etapa delante —`canal:<medida>` y `multiplicador`— para
 * que la fila del panel diga sola de qué etapa era.
 *
 * Las opciones de la etapa 2 van en el orden en que las nombra la pregunta
 * ("exactamente, más, o menos"), no con la correcta primero.
 */

const ORDEN_ETAPA_2 = ["exacto", "mas", "menos"];

export default function FlujoDeCaja({ onCompletar }) {
  const [medidas, setMedidas] = useState(() => barajar(MEDIDAS_FLUJO));
  const [etapa, setEtapa] = useState(1);
  const [i, setI] = useState(0);
  const [elegido, setElegido] = useState(null);
  const [aciertos1, setAciertos1] = useState(0);
  const [respuesta2, setRespuesta2] = useState(null);
  const [terminado, setTerminado] = useState(false);

  const respondidos = useRef(new Set());
  const detalle = useRef([]);
  const inicio = useRef(Date.now());

  const opcion2 = OPCIONES_MULTIPLICADOR.find((o) => o.id === respuesta2);
  const pct = puntuarFlujo(aciertos1, opcion2?.correcta === true);

  useEffect(() => {
    if (terminado) onCompletar?.(pct, Date.now() - inicio.current, detalle.current);
  }, [terminado]);

  const medida = medidas[i];

  const elegirCanal = (canalId) => {
    const item = `canal:${medida.id}`;
    if (respondidos.current.has(item)) return;
    respondidos.current.add(item);
    const ok = canalId === medida.canal;
    detalle.current.push({ item, ok, intentos: 1, respuesta: ok ? null : canalId, orden: detalle.current.length + 1 });
    if (ok) setAciertos1((n) => n + 1);
    setElegido(canalId);
  };

  const siguienteMedida = () => {
    if (!elegido) return;
    setElegido(null);
    if (i + 1 < medidas.length) setI(i + 1);
    else setEtapa(2);
  };

  const elegirMultiplicador = (op) => {
    if (respondidos.current.has("multiplicador")) return;
    respondidos.current.add("multiplicador");
    detalle.current.push({
      item: "multiplicador",
      ok: op.correcta,
      intentos: 1,
      respuesta: op.correcta ? null : op.id,
      orden: detalle.current.length + 1,
    });
    setRespuesta2(op.id);
  };

  const reiniciar = () => {
    setMedidas(barajar(MEDIDAS_FLUJO));
    setEtapa(1); setI(0); setElegido(null); setAciertos1(0); setRespuesta2(null); setTerminado(false);
    respondidos.current = new Set();
    detalle.current = [];
    inicio.current = Date.now();
  };

  if (terminado) {
    return (
      <Tesoreria rotulo="TESORERÍA · FLUJO DE CAJA" titulo="Los dos caminos del dinero" acento={FAE.ambar}>
        <Cierre pct={Math.round(pct)} onReiniciar={reiniciar} textoReiniciar="Otra vez">
          <p style={TEXTO_CIERRE}>
            Etapa 1: {aciertos1} de {medidas.length} canales ({PESO_ETAPA_1} % en juego). Etapa 2:{" "}
            {opcion2?.correcta ? "el multiplicador, bien" : "el multiplicador, no"} ({PESO_ETAPA_2} % en juego).
          </p>
        </Cierre>
      </Tesoreria>
    );
  }

  if (etapa === 2) {
    return (
      <Tesoreria rotulo="TESORERÍA · FLUJO DE CAJA" titulo="Etapa 2 · El multiplicador" acento={FAE.ambar}>
        <Enunciado rotulo="LA PREGUNTA" acento={FAE.ambar}>{PREGUNTA_MULTIPLICADOR}</Enunciado>
        <Opciones>
          {ORDEN_ETAPA_2.map((id) => OPCIONES_MULTIPLICADOR.find((o) => o.id === id)).map((op) => (
            <Opcion
              key={op.id}
              ancho
              deshabilitada={Boolean(respuesta2)}
              onClick={() => elegirMultiplicador(op)}
              estado={!respuesta2 ? null : op.id === respuesta2 ? (op.correcta ? "correcta" : "incorrecta") : op.correcta ? "revelada" : null}
            >
              {op.texto}
            </Opcion>
          ))}
        </Opciones>
        {opcion2 && (
          <>
            <Retro texto={opcion2.retro} />
            <Avanzar onClick={() => setTerminado(true)}>Ver resultado</Avanzar>
          </>
        )}
      </Tesoreria>
    );
  }

  return (
    <Tesoreria rotulo="TESORERÍA · FLUJO DE CAJA" titulo="Etapa 1 · ¿Por qué canal llega a la Demanda Agregada?" acento={FAE.ambar}>
      <div style={{ marginBottom: "12px" }}>
        <Pulsos total={medidas.length} hechos={i + (elegido ? 1 : 0)} enCurso={i + 1} etiqueta="Medida" />
      </div>
      <Enunciado rotulo="LA MEDIDA" acento={FAE.ambar}>{medida.medida}</Enunciado>
      <Opciones>
        {CANALES.map((c) => (
          <Opcion
            key={c.id}
            ancho
            deshabilitada={Boolean(elegido)}
            onClick={() => elegirCanal(c.id)}
            estado={!elegido ? null : c.id === elegido ? (c.id === medida.canal ? "correcta" : "incorrecta") : c.id === medida.canal ? "revelada" : null}
          >
            {c.nombre}
          </Opcion>
        ))}
      </Opciones>
      {elegido && (
        <>
          <Retro texto={retroFlujo(medida, elegido)} />
          <Avanzar onClick={siguienteMedida}>{i + 1 === medidas.length ? "Pasar a la etapa 2" : "Siguiente medida"}</Avanzar>
        </>
      )}
    </Tesoreria>
  );
}
