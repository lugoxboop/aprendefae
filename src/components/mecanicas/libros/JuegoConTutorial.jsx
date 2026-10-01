import { useEffect, useState } from "react";
import AsiSeJuega from "./AsiSeJuega.jsx";
import { ASI_SE_JUEGA } from "../../../data/asiSeJuega.js";
import { yaLaVio, marcarVista } from "../../../hacer/asiSeJuega.js";

/*
 * ═══════════ «ASÍ SE JUEGA» DELANTE DE LA PARTIDA ═══════════
 *
 * La primera vez que el estudiante abre una actividad en este navegador, sale
 * su «Así se juega»; después, solo con «¿Cómo se juega?». La marca se lee al
 * montar y se escribe en un efecto —no al calcular el estado, que React puede
 * repetir en desarrollo y lo daría por visto antes de enseñarlo—.
 *
 * La partida se queda montada debajo, escondida: volver a mirar cómo se juega
 * a media tanda no la reinicia.
 *
 * Vive aquí, y no en la vista del Tema 1, porque lo usan las dos vistas de
 * Contabilidad. Las props de presentación (Marco, acento, rótulo, título) solo
 * se pasan si llegan: las actividades del Tema 2 traen las suyas puestas.
 */
export default function JuegoConTutorial({
  juego, usuarioId = null, Marco, acento, rotulo, onCompletar, tituloVisible = true,
}) {
  const asi = ASI_SE_JUEGA[juego.id] ?? null;
  const [viendo, setViendo] = useState(() => Boolean(asi) && !yaLaVio(juego.id, usuarioId));

  useEffect(() => {
    if (viendo) marcarVista(juego.id, usuarioId);
  }, []);

  const abrir = () => {
    setViendo(true);
    try { globalThis.scrollTo?.(0, 0); } catch { /* sin ventana, nada que subir */ }
  };

  const presentacion = Object.fromEntries(
    Object.entries({ Marco, acento, rotulo, titulo: juego.titulo }).filter(([, v]) => v !== undefined),
  );

  return (
    <>
      {viendo && (
        <AsiSeJuega asi={asi} Mecanica={juego.Mecanica} onSiguiente={() => setViendo(false)} tituloVisible={tituloVisible} />
      )}
      <div hidden={viendo} data-partida>
        <juego.Mecanica
          {...presentacion}
          onCompletar={onCompletar}
          onComoSeJuega={asi ? abrir : null}
        />
      </div>
    </>
  );
}
