import { useEffect, useRef, useState } from "react";
import { barajar } from "../../../utils/barajar.js";
import { Opcion, Opciones, Retro, Cierre, Enunciado } from "../corazon/juego.jsx";
import { TEXTO_CIERRE } from "./marcos.jsx";

/*
 * ═══════════════════════════════════════════════════════════════════════════
 * UN CASO, UNA DECISIÓN — «El expediente del gabinete» (Política Económica) y
 * «El dilema del banquero central» (Política Monetaria).
 *
 * Se lee el caso, se toca una opción, una vez. Todo o nada: 100 o 0. Es la
 * misma forma que Biopsia y El agujero fiscal.
 *
 * Las opciones se barajan: la buena no vive siempre en el mismo sitio.
 *
 * Ítem = el caso, por su id (una fila por partida); `respuesta` guarda la
 * opción que se eligió, que es lo que le dice algo al docente.
 *
 * `caso.rotulo` cambia el rótulo del caso («CASO BASADO EN UN HECHO REAL»).
 * `cierre(ok)` es el texto bajo el resultado; sin él, no sale ninguno.
 * ═══════════════════════════════════════════════════════════════════════════
 */

export default function CasoUnico({ caso, Marco, rotulo, titulo, acento, onCompletar, cierre = null }) {
  const [opciones, setOpciones] = useState(() => barajar(caso.opciones));
  const [elegida, setElegida] = useState(null);
  const avisado = useRef(false);
  const inicio = useRef(Date.now());

  const ok = elegida === caso.correcta;
  const pct = ok ? 100 : 0;

  useEffect(() => {
    if (!elegida || avisado.current) return;
    avisado.current = true;
    onCompletar?.(pct, Date.now() - inicio.current, [{ item: caso.id, ok, intentos: 1, respuesta: elegida, orden: 1 }]);
  }, [elegida]);

  const reiniciar = () => {
    setOpciones(barajar(caso.opciones));
    setElegida(null);
    avisado.current = false;
    inicio.current = Date.now();
  };

  const retro = elegida ? caso.opciones.find((o) => o.id === elegida).retro : null;
  const textoCierre = elegida && cierre ? cierre(ok) : null;

  return (
    <Marco rotulo={rotulo} titulo={titulo} acento={acento}>
      <Enunciado rotulo={caso.rotulo ?? "EL CASO"} acento={acento}>{caso.caso}</Enunciado>
      <p style={{ margin: "14px 0 0", fontFamily: "Sora, sans-serif", fontSize: "15px", fontWeight: 700, lineHeight: 1.4 }}>{caso.pregunta}</p>
      <Opciones columnas="1fr">
        {opciones.map((o) => (
          <Opcion
            key={o.id}
            ancho
            deshabilitada={Boolean(elegida)}
            onClick={() => !avisado.current && setElegida(o.id)}
            estado={!elegida ? null : o.id === elegida ? (o.id === caso.correcta ? "correcta" : "incorrecta") : o.id === caso.correcta ? "revelada" : null}
          >
            {o.texto}
          </Opcion>
        ))}
      </Opciones>
      <Retro texto={retro} />
      {elegida && (
        <Cierre pct={pct} onReiniciar={reiniciar} textoReiniciar="Leer el caso otra vez">
          {textoCierre && <p style={TEXTO_CIERRE}>{textoCierre}</p>}
        </Cierre>
      )}
    </Marco>
  );
}
