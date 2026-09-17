import { useEffect, useRef, useState } from "react";
import { FAE } from "../../../theme.js";
import { CASO_AGUJERO, PREGUNTA_AGUJERO, OPCIONES_AGUJERO } from "../../../data/politicaFiscal.js";
import { Tesoreria, Opcion, Opciones, Retro, Cierre, Enunciado, TEXTO_CIERRE } from "./tesoreria.jsx";

/*
 * ACTIVIDAD 4 — "El agujero fiscal". Analizar · Difícil · Método de caso.
 *
 * Un caso con las cifras de la prensa que usó el profesor —el déficit, los
 * $17,1 billones en beneficios tributarios— y una sola pregunta: por qué
 * ampliar la renta y no subir el IVA. Lo que se analiza es a quién golpea cada
 * impuesto, no cuál recauda más.
 *
 * 100 % O 0 %, A PROPÓSITO. Es una sola decisión y la ficha la puntúa entera.
 *
 * Las cuatro opciones van en el orden de la ficha: no se sortean porque la
 * ficha no lo pide, y repetir no paga FP.
 */

export default function AgujeroFiscal({ onCompletar }) {
  const [elegida, setElegida] = useState(null);
  const [terminado, setTerminado] = useState(false);
  const respondida = useRef(false);
  const detalle = useRef([]);
  const inicio = useRef(Date.now());

  const opcion = OPCIONES_AGUJERO.find((o) => o.id === elegida);
  const pct = opcion?.correcta ? 100 : 0;

  useEffect(() => {
    if (terminado) onCompletar?.(pct, Date.now() - inicio.current, detalle.current);
  }, [terminado]);

  const responder = (o) => {
    if (respondida.current) return;
    respondida.current = true;
    detalle.current.push({ item: "por-que-renta", ok: o.correcta, intentos: 1, respuesta: o.correcta ? null : o.id, orden: 1 });
    setElegida(o.id);
    setTerminado(true);
  };

  const reiniciar = () => {
    setElegida(null); setTerminado(false);
    respondida.current = false;
    detalle.current = [];
    inicio.current = Date.now();
  };

  return (
    <Tesoreria rotulo="TESORERÍA · EXPEDIENTE DEL DÉFICIT" titulo="El agujero fiscal" acento={FAE.teal}>
      <Enunciado rotulo="EL CASO" acento={FAE.teal}>{CASO_AGUJERO}</Enunciado>
      <p style={{ margin: "16px 0 0", fontFamily: "Sora, sans-serif", fontSize: "15.5px", fontWeight: 700, lineHeight: 1.45, color: FAE.text }}>
        {PREGUNTA_AGUJERO}
      </p>
      <Opciones columnas="1fr">
        {OPCIONES_AGUJERO.map((o) => (
          <Opcion
            key={o.id}
            ancho
            deshabilitada={Boolean(elegida)}
            onClick={() => responder(o)}
            estado={!elegida ? null : o.id === elegida ? (o.correcta ? "correcta" : "incorrecta") : o.correcta ? "revelada" : null}
          >
            {o.texto}
          </Opcion>
        ))}
      </Opciones>
      {opcion && (
        <>
          <Retro texto={opcion.retro} />
          <Cierre pct={pct} onReiniciar={reiniciar} textoReiniciar="Leer el caso otra vez">
            <p style={TEXTO_CIERRE}>Una sola decisión: vale todo o nada, a propósito.</p>
          </Cierre>
        </>
      )}
    </Tesoreria>
  );
}
