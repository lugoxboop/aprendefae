import { useEffect, useRef, useState } from "react";
import { FAE } from "../../../theme.js";
import { barajar } from "../../../utils/barajar.js";
import { ALERTAS_MONITOR, COMPONENTES_MONITOR, retroMonitor } from "../../../data/demandaAgregadaHacer.js";
import { COMPONENTES } from "../../../data/corazonDA.js";
import { Camaraseccion } from "./circulatorio.jsx";
import { CSS_JUEGO, Opcion, Opciones, Retro, Pulsos, Cierre, Enunciado } from "./juego.jsx";

/*
 * ACTIVIDAD 7 — "Sala de monitores". Aplicar · Difícil.
 *
 * Práctica intercalada (Rohrer): veinticuatro alertas en el banco, doce por
 * partida, y hay que decir a qué componente de la DA afecta cada una.
 *
 * ═══════════ EL INTERCALADO ES LA TÉCNICA, NO EL ORDEN DE UN ARRAY ═══════════
 *
 * El banco está mezclado a mano —C, I, G, XN, C, I, G, XN…— y además se baraja
 * en cada partida. Agrupar por componente convertiría la actividad en cuatro
 * bloques de seis, que es justo lo que el intercalado evita: dentro de un
 * bloque se acierta por inercia y no por discriminar.
 *
 * ═══════════ EL PORCENTAJE ═══════════
 *
 * pct = aciertos / 12 × 100, redondeado una sola vez. Doce alertas a "8,33%"
 * escritas a mano suman 99,96 y el 100% sería inalcanzable.
 *
 * ═══════════ LOS ids ═══════════
 *
 * El id de la alerta, tal cual: `sueldo-carro`, `arancel`, `startup`… Son
 * veinticuatro distintos en el banco y se sacan doce sin repetir. No hace falta
 * prefijo: no hay dos contextos donde la misma alerta signifique cosas
 * distintas, que es la única razón por la que otras actividades lo llevan.
 */

const POR_PARTIDA = 12;

/* El tono de cada componente sale del mismo sitio que en las piezas de Aprender. */
const COLOR = Object.fromEntries(COMPONENTES.map((c) => [c.id, c.color]));

export default function SalaMonitores({ onCompletar }) {
  const [tanda, setTanda] = useState(() => barajar(ALERTAS_MONITOR).slice(0, POR_PARTIDA));
  const [i, setI] = useState(0);
  const [elegido, setElegido] = useState(null);
  const [aciertos, setAciertos] = useState(0);
  const [terminado, setTerminado] = useState(false);

  const detalle = useRef([]);
  const inicio = useRef(Date.now());

  const alerta = tanda[i];
  const pct = Math.round((aciertos / tanda.length) * 100);

  useEffect(() => {
    if (terminado) onCompletar?.(pct, Date.now() - inicio.current, detalle.current);
  }, [terminado]);

  const nombreDe = (id) => COMPONENTES_MONITOR.find((c) => c.id === id)?.nombre ?? id;

  const responder = (componente) => {
    if (elegido) return;
    const ok = componente.id === alerta.componente;
    setElegido(componente.id);
    if (ok) setAciertos((n) => n + 1);
    detalle.current.push({
      item: alerta.id,
      ok,
      intentos: 1,
      respuesta: ok ? null : componente.id,
      orden: detalle.current.length + 1,
    });
  };

  const avanzar = () => {
    setElegido(null);
    if (i + 1 < tanda.length) return setI(i + 1);
    setTerminado(true);
  };

  const reiniciar = () => {
    setTanda(barajar(ALERTAS_MONITOR).slice(0, POR_PARTIDA));
    setI(0); setElegido(null); setAciertos(0); setTerminado(false);
    detalle.current = [];
    inicio.current = Date.now();
  };

  if (terminado) {
    return (
      <Camaraseccion rotulo="SALA DE MONITORES" titulo="Turno cerrado" acento={FAE.teal}>
        <style>{CSS_JUEGO}</style>
        <Cierre pct={pct} onReiniciar={reiniciar} textoReiniciar="Otro turno">
          <p style={{ margin: 0, fontSize: "13px", lineHeight: 1.55, color: "rgba(248,249,250,0.68)" }}>
            {aciertos} de {tanda.length} alertas bien clasificadas. El banco tiene{" "}
            {ALERTAS_MONITOR.length} y salen mezcladas: dos turnos nunca son iguales.
          </p>
        </Cierre>
      </Camaraseccion>
    );
  }

  /* La devolución vive en el banco: el Repaso Diario la reutiliza tal cual. */
  const retro = !elegido ? null : retroMonitor(alerta, elegido);

  return (
    <Camaraseccion rotulo="SALA DE MONITORES" titulo="¿A qué componente afecta?" acento={FAE.teal}>
      <style>{CSS_JUEGO}</style>

      <div style={{ marginBottom: "14px" }}>
        <Pulsos total={tanda.length} hechos={i + (elegido ? 1 : 0)} etiqueta="Alerta" />
      </div>

      <Enunciado rotulo="ALERTA">{alerta.texto}</Enunciado>

      <Opciones columnas="repeat(auto-fit, minmax(150px, 1fr))">
        {COMPONENTES_MONITOR.map((c) => (
          <Opcion
            key={c.id}
            ancho
            deshabilitada={Boolean(elegido)}
            onClick={() => responder(c)}
            estado={
              !elegido ? null
                : c.id === elegido
                  ? (c.id === alerta.componente ? "correcta" : "incorrecta")
                  : (c.id === alerta.componente ? "revelada" : null)
            }
          >
            {/*
              La letra en su tono y el nombre escrito al lado: el color señala,
              nunca informa solo.
            */}
            <span style={{ display: "inline-flex", alignItems: "baseline", gap: "8px" }}>
              <span style={{ fontFamily: "Sora, sans-serif", fontSize: "17px", fontWeight: 700, color: COLOR[c.id] ?? FAE.text }}>
                {c.id}
              </span>
              <span>{c.nombre}</span>
            </span>
          </Opcion>
        ))}
      </Opciones>

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
          {i + 1 === tanda.length ? "Cerrar turno" : "Siguiente alerta"}
        </button>
      )}
    </Camaraseccion>
  );
}
