import { useEffect, useRef, useState } from "react";
import { FAE } from "../../../theme.js";
import { barajar } from "../../../utils/barajar.js";
import { CASOS_EXPANSIVA, porcentaje } from "../../../data/politicaFiscal.js";
import { Tesoreria, Opcion, Opciones, Pulsos, Cierre, Enunciado, Avanzar, TEXTO_CIERRE } from "./tesoreria.jsx";

/*
 * ACTIVIDAD 5 — "Expansiva o contractiva". Evaluar · Experto.
 *
 * Duelos por parejas, como el Triage de Demanda Agregada: en vez de pedir el
 * orden entero de tres medidas, se pregunta tres veces cuál de dos es mejor
 * PARA ESTA ECONOMÍA. Una partida juega uno de los dos casos, al azar; volver
 * a jugar pasa al otro.
 *
 * EL ARGUMENTO SE MUESTRA GANE O PIERDA: es lo que se está enseñando. Va
 * literal del banco; el "CORRECTO" / "REVISA" de arriba es de la pantalla y
 * lleva el texto escrito, no solo el color.
 *
 * Los ids llevan el caso delante —recesion:a-vs-b—: las letras A, B y C son
 * medidas contrarias en cada caso ("bajar impuestos" es B en la recesión y C
 * en el sobrecalentamiento).
 *
 * Puntuación: aciertos / 3 × 100. Tres no divide a cien —33,3 × 3 = 99,9—, así
 * que no hay porcentaje por duelo: una división al final.
 */

export default function ExpansivaContractiva({ onCompletar }) {
  const [caso, setCaso] = useState(() => barajar(CASOS_EXPANSIVA)[0]);
  const [duelos, setDuelos] = useState(() => barajar(caso.duelos));
  const [i, setI] = useState(0);
  const [elegido, setElegido] = useState(null);
  const [aciertos, setAciertos] = useState(0);
  const [terminado, setTerminado] = useState(false);

  const respondidos = useRef(new Set());
  const detalle = useRef([]);
  const inicio = useRef(Date.now());

  const duelo = duelos[i];
  const pct = porcentaje(aciertos, duelos.length);

  useEffect(() => {
    if (terminado) onCompletar?.(pct, Date.now() - inicio.current, detalle.current);
  }, [terminado]);

  const responder = (letra) => {
    const item = `${caso.id}:${duelo.id}`;
    if (respondidos.current.has(item)) return;
    respondidos.current.add(item);
    const ok = letra === duelo.gana;
    detalle.current.push({ item, ok, intentos: 1, respuesta: ok ? null : letra, orden: detalle.current.length + 1 });
    if (ok) setAciertos((n) => n + 1);
    setElegido(letra);
  };

  const avanzar = () => {
    if (!elegido) return;
    setElegido(null);
    if (i + 1 < duelos.length) setI(i + 1);
    else setTerminado(true);
  };

  const reiniciar = () => {
    const otro = CASOS_EXPANSIVA.find((c) => c.id !== caso.id) ?? caso;
    setCaso(otro);
    setDuelos(barajar(otro.duelos));
    setI(0); setElegido(null); setAciertos(0); setTerminado(false);
    respondidos.current = new Set();
    detalle.current = [];
    inicio.current = Date.now();
  };

  if (terminado) {
    return (
      <Tesoreria rotulo={`TESORERÍA · ${caso.titulo.toUpperCase()}`} titulo="El orden completo" acento={FAE.coral}>
        <Cierre pct={Math.round(pct)} onReiniciar={reiniciar} textoReiniciar="El otro caso">
          <p style={{ ...TEXTO_CIERRE, marginBottom: "8px" }}>{aciertos} de {duelos.length} duelos. De mejor a peor para esta economía:</p>
          <ol style={{ margin: 0, paddingLeft: "20px", fontSize: "13.5px", lineHeight: 1.65, color: FAE.text }}>
            {caso.ranking.map((letra) => <li key={letra}>{caso.medidas[letra]}</li>)}
          </ol>
        </Cierre>
      </Tesoreria>
    );
  }

  const acerto = elegido === duelo.gana;

  return (
    <Tesoreria rotulo={`TESORERÍA · ${caso.titulo.toUpperCase()}`} titulo="¿Cuál de las dos es mejor aquí?" acento={FAE.coral}>
      <div style={{ marginBottom: "12px" }}>
        <Pulsos total={duelos.length} hechos={i + (elegido ? 1 : 0)} etiqueta="Duelo" />
      </div>
      <Enunciado rotulo="LA ECONOMÍA" acento={FAE.coral}>{caso.caso}</Enunciado>
      <Opciones>
        {duelo.par.map((letra) => (
          <Opcion
            key={letra}
            ancho
            deshabilitada={Boolean(elegido)}
            onClick={() => responder(letra)}
            estado={!elegido ? null : letra === elegido ? (letra === duelo.gana ? "correcta" : "incorrecta") : letra === duelo.gana ? "revelada" : null}
          >
            {caso.medidas[letra]}
          </Opcion>
        ))}
      </Opciones>

      {elegido && (
        <div
          role="status"
          style={{
            marginTop: "12px", padding: "12px 14px", borderRadius: "12px",
            background: acerto ? "rgba(42,157,143,0.10)" : "rgba(231,111,81,0.10)",
            border: `1px solid ${acerto ? FAE.teal : FAE.coral}55`,
          }}
        >
          <p style={{ margin: "0 0 5px", fontFamily: "Sora, sans-serif", fontSize: "12px", fontWeight: 700, letterSpacing: "0.1em", color: acerto ? FAE.teal : FAE.coral }}>
            {acerto ? "CORRECTO" : "REVISA"} · MEJOR: {caso.medidas[duelo.gana]}
          </p>
          <p style={{ margin: 0, fontSize: "13.5px", lineHeight: 1.55, color: "rgba(248,249,250,0.85)" }}>{duelo.argumento}</p>
        </div>
      )}

      {elegido && <Avanzar onClick={avanzar}>{i + 1 === duelos.length ? "Ver resultado" : "Siguiente duelo"}</Avanzar>}
    </Tesoreria>
  );
}
