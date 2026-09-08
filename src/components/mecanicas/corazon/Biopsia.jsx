import { useEffect, useRef, useState } from "react";
import { FAE } from "../../../theme.js";
import { barajar } from "../../../utils/barajar.js";
import { CASOS_BIOPSIA, PREGUNTA_BIOPSIA } from "../../../data/demandaAgregadaHacer.js";
import { Camaraseccion } from "./circulatorio.jsx";
import { CSS_JUEGO, Opcion, Opciones, Retro, Cierre, Enunciado } from "./juego.jsx";

/*
 * ACTIVIDAD 4 — "Biopsia económica". Analizar · Difícil.
 *
 * Un solo caso, una sola decisión: dos fuerzas que empujan en sentidos
 * contrarios y la pregunta de qué le pasa a la DA.
 *
 * ═══════════ 100 O 0, Y ES LA LECCIÓN ═══════════
 *
 * Lo que se enseña es que con dos fuerzas opuestas y sin números NO SE PUEDE
 * SABER cuál domina. Dar puntaje parcial a "Sube" o a "Baja" enseñaría que
 * acertar la dirección por instinto vale algo, que es exactamente lo contrario
 * de lo que la actividad quiere dejar dicho.
 *
 * ═══════════ LOS ids ═══════════
 *
 * Uno solo por partida: `biopsia:a` o `biopsia:b`. Lleva el caso porque los dos
 * enunciados son distintos —recorte de impuestos con alza de tasa, o bajada de
 * tasa con alza de impuestos— y el panel debe poder decir cuál de los dos se
 * atraviesa, aunque la respuesta correcta sea la misma.
 *
 * ═══════════ SIN REINTENTO, Y AQUÍ IMPORTA MÁS QUE EN OTRAS ═══════════
 *
 * Con tres opciones y todo o nada, dejar reintentar convertiría el 100% en
 * cuestión de tiempo. Se responde una vez; la devolución explica las tres.
 */

export default function Biopsia({ onCompletar }) {
  const [caso, setCaso] = useState(() => barajar(CASOS_BIOPSIA)[0]);
  const [opciones, setOpciones] = useState(() => barajar(caso.opciones));
  const [elegido, setElegido] = useState(null);

  const detalle = useRef([]);
  const inicio = useRef(Date.now());

  const acertado = elegido === caso.correcta;
  const pct = acertado ? 100 : 0;

  useEffect(() => {
    if (!elegido) return;
    detalle.current = [{
      item: `biopsia:${caso.id}`,
      ok: acertado,
      intentos: 1,
      respuesta: acertado ? null : elegido,
      orden: 1,
    }];
    onCompletar?.(pct, Date.now() - inicio.current, detalle.current);
  }, [elegido]);

  const reiniciar = () => {
    /* Al repetir se cambia de caso: quien vio el recorte de impuestos recibe el otro. */
    const otro = CASOS_BIOPSIA.find((c) => c.id !== caso.id) ?? caso;
    setCaso(otro);
    setOpciones(barajar(otro.opciones));
    setElegido(null);
    detalle.current = [];
    inicio.current = Date.now();
  };

  const retro = elegido ? opciones.find((o) => o.id === elegido)?.retro : null;

  return (
    <Camaraseccion rotulo="BIOPSIA" titulo="Dos fuerzas a la vez" acento={FAE.ambar}>
      <style>{CSS_JUEGO}</style>

      <Enunciado rotulo="MUESTRA" acento={FAE.ambar}>{caso.caso}</Enunciado>

      <p style={{ margin: "16px 0 0", fontFamily: "Sora, sans-serif", fontSize: "15px", fontWeight: 700, color: FAE.text }}>
        {PREGUNTA_BIOPSIA}
      </p>

      <Opciones columnas="repeat(auto-fit, minmax(210px, 1fr))">
        {opciones.map((o) => (
          <Opcion
            key={o.id}
            ancho
            deshabilitada={Boolean(elegido)}
            onClick={() => !elegido && setElegido(o.id)}
            estado={
              !elegido ? null
                : o.id === elegido
                  ? (o.id === caso.correcta ? "correcta" : "incorrecta")
                  : (o.id === caso.correcta ? "revelada" : null)
            }
          >
            {o.texto}
          </Opcion>
        ))}
      </Opciones>

      <Retro texto={retro} />

      {elegido && (
        <Cierre pct={pct} onReiniciar={reiniciar} textoReiniciar="Ver el otro caso">
          <p style={{ margin: 0, fontSize: "13px", lineHeight: 1.55, color: "rgba(248,249,250,0.68)" }}>
            Esta actividad es todo o nada a propósito: lo que enseña es que con dos fuerzas opuestas y sin
            cifras, afirmar una dirección es adivinar.
          </p>
        </Cierre>
      )}
    </Camaraseccion>
  );
}
