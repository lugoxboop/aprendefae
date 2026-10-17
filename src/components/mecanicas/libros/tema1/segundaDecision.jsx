import { useEffect, useRef, useState } from "react";
import { PreguntaSegunda, OpcionesSegunda } from "../b5/SegundaDecision.jsx";
import {
  Mensaje, RegionViva, RETRASO_REVELA_MS, CLASE_B5H, CSS_B5H,
} from "../b5/Devolucion.jsx";

/*
 * ═══════════════════════════════════════════════════════════════════════════
 * D4 · LA SEGUNDA DECISIÓN DE LOS CUATRO HACER DEL TEMA 1 — el armazón.
 *
 * POR QUÉ NO ES `CapaCuatroDecide`. Aquella es de Aprender: cero FP, escalera
 * de dos fallos y «Ver la respuesta». Estas cuatro son Hacer, con puntaje y
 * con las mecánicas de cada una (zonas, recuadros, barras, casillas). Lo que
 * se reutiliza de allí es el CRITERIO —consecuencia primero, veredicto
 * después, un mensaje por opción mala—, y de la casa, las primitivas: las
 * opciones de `b5/SegundaDecision.jsx` y la devolución de `b5/Devolucion.jsx`.
 *
 * UN SOLO INTENTO, porque es Hacer. Al tocar: la figura se mueve en el acto
 * —el estudiante ve lo que su respuesta implica antes de que le digan si
 * estuvo bien—, la opción tocada queda con su marca y, 0,7 s después, «Iba
 * aquí» aparece sobre la correcta (lo retrasa la propia hoja de estilos de
 * las pastillas) y la figura vuelve a lo que de verdad pasó: dejarla en el
 * retrato falso sería enseñar el error como si fuera el final.
 *
 * NO PUNTÚA. No anota en `respuestas` ni en `t.detalle`, no llama a
 * `onCompletar` y no cambia el peso de ningún ítem: el porcentaje sale igual
 * que antes de existir esto. Sí es obligatoria para avanzar — una decisión
 * que se puede saltar no es una decisión, y D4 Avanzado pide que el
 * estudiante la tome.
 *
 * El nombre no es `Opcion`: `opcion-avance.test.mjs` prohíbe que cualquier
 * archivo declare otra, para que nadie forkee la compartida. Aquí no se
 * declara ninguna; se usan las de la Célula B tal cual.
 * ═══════════════════════════════════════════════════════════════════════════
 */

/*
 * `escenaDe(id)` devuelve lo que la figura tiene que mostrar tras esa
 * elección, incluida la mala. `onPintar` la recibe; `onResuelta` avisa a la
 * pieza de que ya se puede avanzar.
 */
export default function SegundaDecisionT1({
  pregunta, opciones, correcta, porque, escenaDe, onPintar, onResuelta, columnas = 1,
}) {
  const [elegida, setElegida] = useState(null);
  const reloj = useRef(null);
  useEffect(() => () => clearTimeout(reloj.current), []);

  const fin = elegida !== null;
  const ok = fin && elegida === correcta;
  const mala = fin && !ok ? opciones.find((o) => o.id === elegida) : null;

  const elegir = (id) => {
    if (fin) return;
    setElegida(id);
    /* 1. La consecuencia, ya: la figura se mueve antes del veredicto. */
    onPintar?.(escenaDe(id));
    /* 2. Si falló, la figura vuelve a la verdad cuando sale «Iba aquí». */
    if (id !== correcta) {
      clearTimeout(reloj.current);
      reloj.current = setTimeout(() => onPintar?.(escenaDe(correcta)), RETRASO_REVELA_MS);
    }
    onResuelta?.(id === correcta);
  };

  return (
    <div data-segunda-decision className={CLASE_B5H} style={{ marginTop: "14px" }}>
      <style>{CSS_B5H}</style>
      <PreguntaSegunda texto={pregunta} />
      <OpcionesSegunda
        opciones={opciones}
        elegidas={fin ? [elegida] : []}
        correcta={correcta}
        fin={fin}
        activa={!fin}
        onElegir={elegir}
        columnas={columnas}
      />
      <RegionViva>
        {fin && <Mensaje ok={ok} texto={ok ? porque : mala?.msg ?? null} />}
      </RegionViva>
    </div>
  );
}
