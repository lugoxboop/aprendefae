import { useEffect, useRef, useState } from "react";
import { H3, BOTON_H3, resumenH3 } from "../../../../data/contabilidadT7_3_h3.js";
import { prepararH3, evaluarH3, puntuarH3, TOTAL_H3 } from "../../../../contabilidad/t7_3H3.js";
import { Pulsos, Cierre } from "../../corazon/juego.jsx";
import { TEXTO_CIERRE } from "../../bloques/marcos.jsx";
import { Responder, useTanda } from "../piezas.jsx";
import { EncabezadoHacer } from "./hacerT7.jsx";
import { CSS_T7_HACER, TarjetaPregunta, Eleccion, Devolucion } from "./hacerT7.jsx";
import { ContadorConIntento } from "./armaLaLinea.jsx";
import { sinUnSoloIntento } from "../../../../contabilidad/armaLaLinea.js";

/*
 * ═══════════════════════════════════════════════════════════════════════════
 * T7-3 · HACER 3 · ¿COMERCIAL O CONDICIONADO? (Célula C)
 *
 * Arriba, la consigna. Debajo, un caso o una pregunta a la vez, en el orden
 * de la tabla, con sus opciones en el orden de la v1 (son las clases
 * mismas): UN SOLO TOQUE; la buena se enseña.
 *
 * Siete unidades; las piezas son las de los Hacer de T7-3 (hacerT7.jsx, sin
 * cambiarlo). Al terminar: onCompletar(pct, ms, detalle).
 * ═══════════════════════════════════════════════════════════════════════════
 */

export default function ComercialOCondicionado({ Marco, rotulo, titulo, acento, onCompletar, items = null, onComoSeJuega = null }) {
  const t = useTanda(() => items ?? prepararH3());
  const [elegida, setElegida] = useState(null);
  const [r, setR] = useState(null);
  const [bien, setBien] = useState(0);
  const zonaBoton = useRef(null);
  const tarjeta = useRef(null);

  const item = t.items[t.i];
  const cuantos = t.items.length;
  const listo = Boolean(r);

  useEffect(() => {
    if (t.terminado) onCompletar?.(puntuarH3(bien), Date.now() - t.inicio.current, t.detalle.current);
  }, [t.terminado]); // eslint-disable-line react-hooks/exhaustive-deps
  useEffect(() => { if (listo) zonaBoton.current?.querySelector("button")?.focus(); }, [listo]);

  const elegir = (v) => {
    if (r) return;
    const nuevo = evaluarH3(item, v);
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
        <Cierre pct={Math.round(puntuarH3(bien))} onReiniciar={reiniciar} textoReiniciar="Otra vez">
          <p data-resumen style={TEXTO_CIERRE}>{resumenH3(bien, TOTAL_H3)}</p>
        </Cierre>
      </Marco>
    );
  }

  return (
    <Marco rotulo={rotulo} titulo={titulo} acento={acento}>
      <style>{CSS_T7_HACER}</style>
      <div data-t7-3-h3>
        <EncabezadoHacer objetivo={H3.objetivo} consigna={sinUnSoloIntento(H3.consigna)} onComoSeJuega={onComoSeJuega} />
        <div style={{ marginBottom: "12px" }}>
          <ContadorConIntento>
            <Pulsos total={cuantos} hechos={t.i + (listo ? 1 : 0)} enCurso={t.i + 1} etiqueta="Pregunta" />
          </ContadorConIntento>
        </div>
        <TarjetaPregunta id={item.id} encabezado={item.encabezado ?? null} pregunta={item.pregunta} pie={H3.pie} tarjetaRef={tarjeta} />
        <Eleccion opciones={item.opciones} r={r} elegida={elegida} onElegir={elegir} etiqueta={item.pregunta} />
        <Devolucion r={r} lectorError={r && !r.ok ? `Incorrecto. Iba aquí: ${r.textoCorrecta}. ` : null} />
      </div>
      {listo && (
        <div ref={zonaBoton}>
          <Responder onClick={avanzar}>{t.i + 1 === cuantos ? BOTON_H3.verResumen : BOTON_H3.siguiente}</Responder>
        </div>
      )}
    </Marco>
  );
}
