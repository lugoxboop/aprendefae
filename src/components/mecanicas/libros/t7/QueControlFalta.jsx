import { useEffect, useRef, useState } from "react";
import { barajar } from "../../../../utils/barajar.js";
import { H7, BOTON_H7, resumenH7 } from "../../../../data/contabilidadT7_1_h7.js";
import { prepararH7, evaluarH7, puntuarH7, TOTAL_H7 } from "../../../../contabilidad/t7H7.js";
import { Pulsos, Cierre } from "../../corazon/juego.jsx";
import { TEXTO_CIERRE } from "../../bloques/marcos.jsx";
import { Responder, useTanda } from "../piezas.jsx";
import { Encabezado } from "../tema1/encabezado.jsx";
import { CSS_T7_HACER, TarjetaPregunta, Eleccion, Devolucion } from "./hacerT7.jsx";

/*
 * ═══════════════════════════════════════════════════════════════════════════
 * T7-1 · HACER 7 · ¿QUÉ CONTROL FALTA? (Célula C)
 *
 * El objetivo arriba (decisión de L) y la consigna. Un caso a la vez, en orden
 * aleatorio, con tres controles del libro barajados. UN SOLO TOQUE: se
 * bloquea, la elegida queda en acierto o en error y, si falló, la buena se
 * enseña. Debajo, la línea del libro, que se ve siempre (con «Correcto.»
 * delante si acertó, como H1). Coral solo para el error.
 *
 * Exploratoria: el motor paga los 10 FP al terminar; el porcentaje va para el
 * panel docente. Al terminar: onCompletar(pct, ms, detalle).
 * ═══════════════════════════════════════════════════════════════════════════
 */

export default function QueControlFalta({ Marco, rotulo, titulo, acento, onCompletar, items = null, onComoSeJuega = null }) {
  const t = useTanda(() => items ?? prepararH7(barajar));
  const [elegida, setElegida] = useState(null);
  const [r, setR] = useState(null);
  const [bien, setBien] = useState(0);
  const zonaBoton = useRef(null);
  const tarjeta = useRef(null);

  const caso = t.items[t.i];
  const cuantos = t.items.length;

  useEffect(() => {
    if (t.terminado) onCompletar?.(puntuarH7(bien), Date.now() - t.inicio.current, t.detalle.current);
  }, [t.terminado]); // eslint-disable-line react-hooks/exhaustive-deps
  useEffect(() => { if (r) zonaBoton.current?.querySelector("button")?.focus(); }, [r]);

  const elegir = (v) => {
    if (r) return;
    const nuevo = evaluarH7(caso, v);
    t.anotar(caso.id, nuevo.ok, v);
    if (nuevo.ok) setBien((n) => n + 1);
    setElegida(v);
    setR(nuevo);
  };

  const avanzar = () => {
    setElegida(null); setR(null);
    if (t.i + 1 < cuantos) { t.setI(t.i + 1); requestAnimationFrame(() => tarjeta.current?.focus()); }
    else t.setTerminado(true);
  };

  const reiniciar = () => { t.reiniciar(); setElegida(null); setR(null); setBien(0); };

  if (t.terminado) {
    return (
      <Marco rotulo={rotulo} titulo={titulo} acento={acento}>
        <Cierre pct={Math.round(puntuarH7(bien))} onReiniciar={reiniciar} textoReiniciar="Otra vez">
          <p data-resumen style={TEXTO_CIERRE}>{resumenH7(bien, TOTAL_H7)}</p>
        </Cierre>
      </Marco>
    );
  }

  return (
    <Marco rotulo={rotulo} titulo={titulo} acento={acento}>
      <style>{CSS_T7_HACER}</style>
      <div data-h7>
        <Encabezado objetivo={H7.objetivo} consigna={H7.consigna.join(" ")} onComoSeJuega={onComoSeJuega} />
        <div style={{ marginBottom: "12px" }}>
          <Pulsos total={cuantos} hechos={t.i + (r ? 1 : 0)} enCurso={t.i + 1} etiqueta="Caso" />
        </div>
        <TarjetaPregunta id={caso.id} pregunta={caso.texto} pie={caso.pie} tarjetaRef={tarjeta} />
        <Eleccion opciones={caso.opciones} r={r} elegida={elegida} onElegir={elegir} etiqueta={caso.texto} />
        <Devolucion r={r} lectorError={r && !r.ok ? `Incorrecto. El control es: ${r.textoCorrecta} ` : null} />
      </div>
      {r && (
        <div ref={zonaBoton}>
          <Responder onClick={avanzar}>{t.i + 1 === cuantos ? BOTON_H7.verResumen : BOTON_H7.siguiente}</Responder>
        </div>
      )}
    </Marco>
  );
}
