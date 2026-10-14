import { useEffect, useRef, useState } from "react";
import { H6, BOTON_H6, resumenH6 } from "../../../../data/contabilidadT7_3_h6.js";
import { prepararH6, evaluarH6, puntuarH6, TOTAL_H6 } from "../../../../contabilidad/t7_3H6.js";
import { Pulsos, Cierre } from "../../corazon/juego.jsx";
import { TEXTO_CIERRE } from "../../bloques/marcos.jsx";
import { Responder, useTanda } from "../piezas.jsx";
import { Encabezado } from "../tema1/encabezado.jsx";
import { CSS_T7_HACER, TarjetaPregunta, Eleccion, Devolucion } from "./hacerT7.jsx";
import AvisoNIC2 from "./AvisoNIC2.jsx";

/*
 * ═══════════════════════════════════════════════════════════════════════════
 * T7-3 · HACER 6 · ¿ENTRA AL COSTO? (Célula C)
 *
 * Arriba, siempre a la vista, la frase fija de la NIC 2; luego la consigna.
 * Debajo, una cosa a la vez, en el orden de la tabla, con sus tres opciones
 * en el orden de la v1 (Se suma · Se resta · No entra): UN SOLO TOQUE; la
 * buena se enseña.
 *
 * Siete unidades; las piezas son las de los Hacer de T7-3 (hacerT7.jsx, sin
 * cambiarlo). Al terminar: onCompletar(pct, ms, detalle).
 * ═══════════════════════════════════════════════════════════════════════════
 */

export default function EntraAlCosto({ Marco, rotulo, titulo, acento, onCompletar, items = null, onComoSeJuega = null }) {
  const t = useTanda(() => items ?? prepararH6());
  const [elegida, setElegida] = useState(null);
  const [r, setR] = useState(null);
  const [bien, setBien] = useState(0);
  const zonaBoton = useRef(null);
  const tarjeta = useRef(null);

  const item = t.items[t.i];
  const cuantos = t.items.length;
  const listo = Boolean(r);

  useEffect(() => {
    if (t.terminado) onCompletar?.(puntuarH6(bien), Date.now() - t.inicio.current, t.detalle.current);
  }, [t.terminado]); // eslint-disable-line react-hooks/exhaustive-deps
  useEffect(() => { if (listo) zonaBoton.current?.querySelector("button")?.focus(); }, [listo]);

  const elegir = (v) => {
    if (r) return;
    const nuevo = evaluarH6(item, v);
    t.anotar(item.id, nuevo.ok, v);
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
        <AvisoNIC2 texto={H6.aviso} />
        <Cierre pct={Math.round(puntuarH6(bien))} onReiniciar={reiniciar} textoReiniciar="Otra vez">
          <p data-resumen style={TEXTO_CIERRE}>{resumenH6(bien, TOTAL_H6)}</p>
        </Cierre>
      </Marco>
    );
  }

  return (
    <Marco rotulo={rotulo} titulo={titulo} acento={acento}>
      <style>{CSS_T7_HACER}</style>
      <div data-t7-3-h6>
        <AvisoNIC2 texto={H6.aviso} />
        <Encabezado consigna={H6.consigna} onComoSeJuega={onComoSeJuega} />
        <div style={{ marginBottom: "12px" }}>
          <Pulsos total={cuantos} hechos={t.i + (listo ? 1 : 0)} enCurso={t.i + 1} etiqueta="Pregunta" />
        </div>
        <TarjetaPregunta id={item.id} encabezado={item.encabezado ?? null} pregunta={item.pregunta} pie={H6.pie} tarjetaRef={tarjeta} />
        <Eleccion opciones={item.opciones} r={r} elegida={elegida} onElegir={elegir} etiqueta={item.pregunta} />
        <Devolucion r={r} lectorError={r && !r.ok ? `Incorrecto. La respuesta es ${r.textoCorrecta}. ` : null} />
      </div>
      {listo && (
        <div ref={zonaBoton}>
          <Responder onClick={avanzar}>{t.i + 1 === cuantos ? BOTON_H6.verResumen : BOTON_H6.siguiente}</Responder>
        </div>
      )}
    </Marco>
  );
}
