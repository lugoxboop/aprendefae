import { useEffect, useRef, useState } from "react";
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

  /*
   * «Siguiente» está activo desde el primer instante (Levi). Tocarlo a mitad
   * de la demo la desmonta entera —AsiSeJuega limpia sus relojes al
   * desmontarse— y marca el tutorial como visto, aunque no haya terminado.
   * La partida es otra instancia, montada aparte desde el principio: no
   * hereda nada del ejemplo. El foco pasa a la consigna de la actividad, o a
   * su título si no tiene consigna.
   */
  const partida = useRef(null);
  const [enfocar, setEnfocar] = useState(false);
  const siguiente = () => {
    marcarVista(juego.id, usuarioId);
    setViendo(false);
    setEnfocar(true);
  };
  useEffect(() => {
    if (!enfocar || viendo) return;
    setEnfocar(false);
    const caja = partida.current;
    const blanco = caja?.querySelector("[data-encabezado] [data-consigna]") ?? caja?.querySelector("h1, h2, h3");
    if (!blanco) return;
    if (!blanco.hasAttribute("tabindex")) blanco.setAttribute("tabindex", "-1");
    blanco.focus({ preventScroll: false });
  }, [enfocar, viendo]);

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
        <AsiSeJuega asi={asi} Mecanica={juego.Mecanica} onSiguiente={siguiente} tituloVisible={tituloVisible} />
      )}
      <div ref={partida} hidden={viendo} data-partida>
        <juego.Mecanica
          {...presentacion}
          onCompletar={onCompletar}
          onComoSeJuega={asi ? abrir : null}
        />
      </div>
    </>
  );
}
