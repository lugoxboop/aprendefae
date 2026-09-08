import { useEffect, useRef, useState } from "react";
import { FAE } from "../../../theme.js";
import { barajar } from "../../../utils/barajar.js";
import { CASOS_TRIAGE } from "../../../data/demandaAgregadaHacer.js";
import { Camaraseccion } from "./circulatorio.jsx";
import { CSS_JUEGO, Opcion, Opciones, Pulsos, Cierre, Enunciado } from "./juego.jsx";

/*
 * ACTIVIDAD 5 — "Triage de emergencias". Evaluar · Experto.
 *
 * Duelos por parejas (Thurstone): en vez de pedir el orden completo de tres
 * medidas, se pregunta tres veces "¿cuál de estas dos va primero?". Ordenar
 * tres cosas de golpe mide memoria de trabajo; comparar dos mide criterio.
 *
 * ═══════════ EL ARGUMENTO SE MUESTRA GANE O PIERDA ═══════════
 *
 * Es lo que se está enseñando —por qué una medida va antes que otra— y
 * ocultárselo a quien falla le quita justo la explicación que necesitaba. El
 * argumento del banco se pinta literal; el "Correcto"/"Revisa" que lo encabeza
 * es del componente y no se cuela dentro de la cita.
 *
 * ═══════════ LOS ids LLEVAN EL CASO DELANTE ═══════════
 *
 *   a:b-vs-c · a:c-vs-a · a:b-vs-a   (reactivar la DA)
 *   b:a-vs-c · b:c-vs-b · b:a-vs-b   (frenar la inflación)
 *
 * HOY NO CHOCARÍAN SIN EL PREFIJO, y conviene decirlo con exactitud: los seis
 * nombres de duelo salen distintos por cómo cayeron las parejas. Lo que el
 * prefijo evita es lo que viene después.
 *
 * Las tres medidas se llaman A, B y C en los DOS casos y son cosas contrarias:
 * la A de reactivación es "bajar la tasa" y la A de inflación es "subirla". En
 * cuanto un tercer caso repita una pareja —y con tres letras solo hay tres
 * parejas posibles— dos preguntas opuestas caerían en la misma fila del panel
 * sin que nada fallara. El prefijo cuesta seis caracteres y cierra esa puerta;
 * además hace la fila legible sola, sin ir a buscar de qué caso era.
 *
 * ═══════════ EL PORCENTAJE ═══════════
 *
 * pct = aciertos / 3 × 100, redondeado una sola vez. Tres duelos no dividen a
 * 100 exacto (33,33 × 3 = 99,99), así que no se escribe ningún porcentaje por
 * duelo.
 */

export default function Triage({ onCompletar }) {
  const [caso, setCaso] = useState(() => barajar(CASOS_TRIAGE)[0]);
  const [duelos, setDuelos] = useState(() => barajar(caso.duelos));
  const [i, setI] = useState(0);
  const [elegido, setElegido] = useState(null);
  const [aciertos, setAciertos] = useState(0);
  const [terminado, setTerminado] = useState(false);

  const detalle = useRef([]);
  const inicio = useRef(Date.now());

  const duelo = duelos[i];
  const pct = Math.round((aciertos / duelos.length) * 100);

  useEffect(() => {
    if (terminado) onCompletar?.(pct, Date.now() - inicio.current, detalle.current);
  }, [terminado]);

  const responder = (letra) => {
    if (elegido) return;
    const ok = letra === duelo.gana;
    setElegido(letra);
    if (ok) setAciertos((n) => n + 1);
    detalle.current.push({
      item: `${caso.id}:${duelo.id}`,
      ok,
      intentos: 1,
      respuesta: ok ? null : letra,
      orden: detalle.current.length + 1,
    });
  };

  const avanzar = () => {
    setElegido(null);
    if (i + 1 < duelos.length) return setI(i + 1);
    setTerminado(true);
  };

  const reiniciar = () => {
    const otro = CASOS_TRIAGE.find((c) => c.id !== caso.id) ?? caso;
    setCaso(otro);
    setDuelos(barajar(otro.duelos));
    setI(0); setElegido(null); setAciertos(0); setTerminado(false);
    detalle.current = [];
    inicio.current = Date.now();
  };

  if (terminado) {
    return (
      <Camaraseccion rotulo="TRIAGE" titulo="Prioridades fijadas" acento={FAE.coral}>
        <style>{CSS_JUEGO}</style>
        <Cierre pct={pct} onReiniciar={reiniciar} textoReiniciar="El otro caso">
          <p style={{ margin: "0 0 10px", fontSize: "13px", lineHeight: 1.55, color: "rgba(248,249,250,0.68)" }}>
            {aciertos} de {duelos.length} duelos. El orden completo de este caso es:
          </p>
          <ol style={{ margin: 0, paddingLeft: "20px", fontSize: "13px", lineHeight: 1.65, color: FAE.text }}>
            {caso.ranking.map((letra) => (
              <li key={letra}>{caso.medidas[letra]}</li>
            ))}
          </ol>
        </Cierre>
      </Camaraseccion>
    );
  }

  const acertado = elegido === duelo.gana;

  return (
    <Camaraseccion rotulo="TRIAGE DE EMERGENCIAS" titulo="¿Cuál atiendes primero?" acento={FAE.coral}>
      <style>{CSS_JUEGO}</style>

      <div style={{ marginBottom: "14px" }}>
        <Pulsos total={duelos.length} hechos={i + (elegido ? 1 : 0)} etiqueta="Duelo" />
      </div>

      <Enunciado rotulo="SITUACIÓN" acento={FAE.coral}>{caso.caso}</Enunciado>

      <Opciones>
        {duelo.par.map((letra) => (
          <Opcion
            key={letra}
            ancho
            deshabilitada={Boolean(elegido)}
            onClick={() => responder(letra)}
            estado={
              !elegido ? null
                : letra === elegido
                  ? (letra === duelo.gana ? "correcta" : "incorrecta")
                  : (letra === duelo.gana ? "revelada" : null)
            }
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
            background: acertado ? "rgba(42,157,143,0.10)" : "rgba(231,111,81,0.10)",
            border: `1px solid ${acertado ? FAE.teal : FAE.coral}55`,
          }}
        >
          <p style={{ margin: "0 0 5px", fontFamily: "Sora, sans-serif", fontSize: "11px", fontWeight: 700, letterSpacing: "0.12em", color: acertado ? FAE.teal : FAE.coral }}>
            {acertado ? "CORRECTO" : "REVISA"} · VA PRIMERO {caso.medidas[duelo.gana].toUpperCase()}
          </p>
          {/* El argumento, literal del banco. */}
          <p style={{ margin: 0, fontSize: "13px", lineHeight: 1.55, color: "rgba(248,249,250,0.82)" }}>
            {duelo.argumento}
          </p>
        </div>
      )}

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
          {i + 1 === duelos.length ? "Ver resultado" : "Siguiente duelo"}
        </button>
      )}
    </Camaraseccion>
  );
}
