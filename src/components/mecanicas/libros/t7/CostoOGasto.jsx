import { useEffect, useRef, useState } from "react";
import { barajar } from "../../../../utils/barajar.js";
import { H5, FICHA_H5, BOTON_H5, resumenH5 } from "../../../../data/contabilidadT7_1_h5.js";
import { prepararH5, evaluarH5, puntuarH5, TOTAL_H5 } from "../../../../contabilidad/t7H5.js";
import { Pulsos, Cierre } from "../../corazon/juego.jsx";
import { TEXTO_CIERRE } from "../../bloques/marcos.jsx";
import { Responder, useTanda } from "../piezas.jsx";
import { Encabezado } from "../tema1/encabezado.jsx";
import { CSS_T7_HACER, Ficha, Parrafos, TarjetaPregunta, Eleccion, Devolucion } from "./hacerT7.jsx";

/*
 * ═══════════════════════════════════════════════════════════════════════════
 * T7-1 · HACER 5 · ¿COSTO O GASTO? (Célula C)
 *
 * PARTE 1: cuatro hechos, cada uno con el par «Forma parte del costo de la
 * mercancía» / «Es un gasto». PARTE 2: el caso de El Faro —su enunciado y su
 * ficha aparecen al llegar al ítem 5 y quedan a la vista hasta el final— y
 * cuatro preguntas con tres opciones barajadas.
 *
 * UN SOLO TOQUE por ítem: se bloquea, la elegida queda en acierto o en error
 * y, si falló, la buena se enseña. Debajo, el porqué de Near. La forma y las
 * piezas son las de H1-H4 (hacerT7.jsx), sin cambiar las compartidas.
 *
 * Al terminar: onCompletar(pct, ms, detalle), con los ocho ítems.
 * ═══════════════════════════════════════════════════════════════════════════
 */

export default function CostoOGasto({ Marco, rotulo, titulo, acento, onCompletar, items = null, onComoSeJuega = null }) {
  const t = useTanda(() => items ?? prepararH5(barajar));
  const [elegida, setElegida] = useState(null);
  const [r, setR] = useState(null);
  const [bien, setBien] = useState(0);
  const zonaBoton = useRef(null);
  const tarjeta = useRef(null);

  const item = t.items[t.i];
  const cuantos = t.items.length;

  useEffect(() => {
    if (t.terminado) onCompletar?.(puntuarH5(bien), Date.now() - t.inicio.current, t.detalle.current);
  }, [t.terminado]); // eslint-disable-line react-hooks/exhaustive-deps
  useEffect(() => { if (r) zonaBoton.current?.querySelector("button")?.focus(); }, [r]);

  const elegir = (v) => {
    if (r) return;
    const nuevo = evaluarH5(item, v);
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
        <Cierre pct={Math.round(puntuarH5(bien))} onReiniciar={reiniciar} textoReiniciar="Otra vez">
          <p data-resumen style={TEXTO_CIERRE}>{resumenH5(bien, TOTAL_H5)}</p>
        </Cierre>
      </Marco>
    );
  }

  return (
    <Marco rotulo={rotulo} titulo={titulo} acento={acento}>
      <style>{CSS_T7_HACER}</style>
      <div data-h5>
        <Encabezado consigna={H5.consigna} onComoSeJuega={onComoSeJuega} />
        {item.parte === 2 && (
          <div data-caso>
            <Parrafos textos={H5.caso} dato="enunciado" />
            <Ficha filas={FICHA_H5} />
          </div>
        )}
        <div style={{ marginBottom: "12px" }}>
          <Pulsos total={cuantos} hechos={t.i + (r ? 1 : 0)} enCurso={t.i + 1} etiqueta="Pregunta" />
        </div>
        <TarjetaPregunta id={item.id} pregunta={item.pregunta} pie={H5.pie} tarjetaRef={tarjeta} />
        <Eleccion opciones={item.opciones} r={r} elegida={elegida} onElegir={elegir} etiqueta={item.pregunta} />
        <Devolucion r={r} lectorError={r && !r.ok ? `Incorrecto. La respuesta es ${r.textoCorrecta}. ` : null} />
      </div>
      {r && (
        <div ref={zonaBoton}>
          <Responder onClick={avanzar}>{t.i + 1 === cuantos ? BOTON_H5.verResumen : BOTON_H5.siguiente}</Responder>
        </div>
      )}
    </Marco>
  );
}
