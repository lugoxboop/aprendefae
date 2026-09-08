import { useEffect, useRef, useState } from "react";
import { FAE } from "../../../theme.js";
import { barajar } from "../../../utils/barajar.js";
import { REACCIONES, errorReaccion } from "../../../data/demandaAgregadaHacer.js";
import { Camaraseccion } from "./circulatorio.jsx";
import { CSS_JUEGO, Opcion, Opciones, Retro, Pulsos, Cierre, Enunciado } from "./juego.jsx";

/*
 * ACTIVIDAD 2 — "El termómetro de reacciones". Comprender · Medio.
 *
 * Doce cambios en el banco, seis por partida. Cada uno pide predecir cómo
 * reacciona el componente que toca.
 *
 * ═══════════ EL PORCENTAJE SE DIVIDE, NO SE MULTIPLICA ═══════════
 *
 * pct = aciertos / 6 × 100, con el redondeo UNA SOLA VEZ al final.
 *
 * Escribir "cada ronda vale 16,67%" y sumarlas da 100,02% con seis aciertos.
 * Es el mismo error que ya se corrigió en "Corriente de titulares": un
 * porcentaje por ítem escrito a mano nunca cierra en 100 salvo que el total
 * divida a 100 exacto. Aquí no divide, así que no se escribe.
 *
 * ═══════════ LOS ids ═══════════
 *
 * El id de la ronda, tal cual: `sube-y`, `baja-tc`... Son doce distintos en el
 * banco y se sacan seis sin repetir, así que dentro de una partida no pueden
 * chocar. Que la ronda "sube-y" y la "baja-y" sean filas separadas del panel es
 * lo que se quiere: subir y bajar la renta son dos preguntas, y confundir una
 * no dice nada de la otra.
 */

const POR_PARTIDA = 6;

export default function Termometro({ onCompletar }) {
  const [tanda, setTanda] = useState(() => barajar(REACCIONES).slice(0, POR_PARTIDA));
  const [i, setI] = useState(0);
  const [elegido, setElegido] = useState(null);
  const [aciertos, setAciertos] = useState(0);
  const [terminado, setTerminado] = useState(false);

  const detalle = useRef([]);
  const inicio = useRef(Date.now());

  const ronda = tanda[i];
  /* Un solo redondeo, sobre la división. */
  const pct = Math.round((aciertos / tanda.length) * 100);

  useEffect(() => {
    if (terminado) onCompletar?.(pct, Date.now() - inicio.current, detalle.current);
  }, [terminado]);

  const responder = (opcion) => {
    if (elegido) return;
    const ok = opcion.id === ronda.correcta;
    setElegido(opcion.id);
    if (ok) setAciertos((n) => n + 1);
    detalle.current.push({
      item: ronda.id,
      ok,
      intentos: 1,
      respuesta: ok ? null : opcion.id,
      orden: detalle.current.length + 1,
    });
  };

  const avanzar = () => {
    setElegido(null);
    if (i + 1 < tanda.length) return setI(i + 1);
    setTerminado(true);
  };

  const reiniciar = () => {
    setTanda(barajar(REACCIONES).slice(0, POR_PARTIDA));
    setI(0); setElegido(null); setAciertos(0); setTerminado(false);
    detalle.current = [];
    inicio.current = Date.now();
  };

  if (terminado) {
    return (
      <Camaraseccion rotulo="TERMÓMETRO" titulo="Lecturas tomadas" acento={FAE.coral}>
        <style>{CSS_JUEGO}</style>
        <Cierre pct={pct} onReiniciar={reiniciar} textoReiniciar="Otras seis lecturas">
          <p style={{ margin: 0, fontSize: "13px", lineHeight: 1.55, color: "rgba(248,249,250,0.68)" }}>
            {aciertos} de {tanda.length} predicciones acertadas. El banco tiene {REACCIONES.length}:
            la próxima ronda no será la misma.
          </p>
        </Cierre>
      </Camaraseccion>
    );
  }

  const retro = !elegido ? null : elegido === ronda.correcta ? ronda.acierto : errorReaccion(ronda);

  return (
    <Camaraseccion rotulo="TERMÓMETRO DE REACCIONES" titulo="¿Cómo reacciona?" acento={FAE.coral}>
      <style>{CSS_JUEGO}</style>

      <div style={{ marginBottom: "14px" }}>
        <Pulsos total={tanda.length} hechos={i + (elegido ? 1 : 0)} etiqueta="Lectura" />
      </div>

      <Enunciado rotulo="CAMBIO" acento={FAE.coral}>{ronda.cambio}</Enunciado>

      <Opciones columnas="repeat(auto-fit, minmax(180px, 1fr))">
        {ronda.opciones.map((o) => (
          <Opcion
            key={o.id}
            ancho
            deshabilitada={Boolean(elegido)}
            onClick={() => responder(o)}
            estado={
              !elegido ? null
                : o.id === elegido
                  ? (o.id === ronda.correcta ? "correcta" : "incorrecta")
                  : (o.id === ronda.correcta ? "revelada" : null)
            }
          >
            {o.texto}
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
          {i + 1 === tanda.length ? "Ver resultado" : "Siguiente lectura"}
        </button>
      )}
    </Camaraseccion>
  );
}
