import { useEffect, useRef, useState } from "react";
import { barajar } from "../../../../utils/barajar.js";
import { H4, FICHA_H4, BOTON_H4, resumenH4 } from "../../../../data/contabilidadT7_3_h4.js";
import { prepararH4, evaluarH4, idLineaH4, puntuarH4, TOTAL_H4 } from "../../../../contabilidad/t7_3H4.js";
import { Pulsos, Cierre } from "../../corazon/juego.jsx";
import { TEXTO_CIERRE } from "../../bloques/marcos.jsx";
import { Responder, useTanda } from "../piezas.jsx";
import { Encabezado } from "../tema1/encabezado.jsx";
import { CSS_T7_HACER, Ficha, Parrafos, TarjetaPregunta, Eleccion, Devolucion, LineasConComprobar } from "./hacerT7.jsx";

/*
 * ═══════════════════════════════════════════════════════════════════════════
 * T7-3 · HACER 4 · PAGÓ A TIEMPO (Célula C)
 *
 * Arriba, siempre a la vista: el enunciado, las tarifas y la ficha de la
 * venta de Totumo a Bambú. Debajo, un ítem a la vez, en el orden de la
 * tabla:
 *
 *   ELECCIÓN  cifras, el descuento que le toca o el lado del cierre; UN SOLO
 *             TOQUE; la buena se enseña.
 *   ASIENTO   el pago en el libro de Totumo y en el de Bambú: las tres líneas
 *             barajadas; «Comprobar» las califica UNA vez, y el asiento con
 *             sus sumas (2.199.375 = 2.199.375) aparece después.
 *
 * Once unidades; las piezas son las de los Hacer de T7-3 (hacerT7.jsx, sin
 * cambiarlo). Al terminar: onCompletar(pct, ms, detalle).
 * ═══════════════════════════════════════════════════════════════════════════
 */

export default function PagoATiempo({ Marco, rotulo, titulo, acento, onCompletar, items = null, onComoSeJuega = null }) {
  const t = useTanda(() => items ?? prepararH4(barajar));
  const [elegida, setElegida] = useState(null);
  const [r, setR] = useState(null);
  const [comprobado, setComprobado] = useState(false);
  const [bien, setBien] = useState(0);
  const zonaBoton = useRef(null);
  const tarjeta = useRef(null);

  const item = t.items[t.i];
  const cuantos = t.items.length;
  const listo = item && (item.tipo === "eleccion" ? Boolean(r) : comprobado);

  useEffect(() => {
    if (t.terminado) onCompletar?.(puntuarH4(bien), Date.now() - t.inicio.current, t.detalle.current);
  }, [t.terminado]); // eslint-disable-line react-hooks/exhaustive-deps
  useEffect(() => { if (listo) zonaBoton.current?.querySelector("button")?.focus(); }, [listo]);

  const elegir = (v) => {
    if (r) return;
    const nuevo = evaluarH4(item, v);
    t.anotar(item.id, nuevo.ok, v);
    if (nuevo.ok) setBien((n) => n + 1);
    setElegida(v);
    setR(nuevo);
  };

  const comprobar = (resultados) => {
    if (comprobado) return;
    let n = 0;
    for (const x of resultados) { t.anotar(idLineaH4(item, x.linea), x.ok, x.elegido); if (x.ok) n += 1; }
    setBien((b) => b + n);
    setComprobado(true);
  };

  const avanzar = () => {
    setElegida(null); setR(null); setComprobado(false);
    if (t.i + 1 < cuantos) { t.setI(t.i + 1); requestAnimationFrame(() => tarjeta.current?.focus()); }
    else t.setTerminado(true);
  };

  const reiniciar = () => { t.reiniciar(); setElegida(null); setR(null); setComprobado(false); setBien(0); };

  if (t.terminado) {
    return (
      <Marco rotulo={rotulo} titulo={titulo} acento={acento}>
        <Cierre pct={Math.round(puntuarH4(bien))} onReiniciar={reiniciar} textoReiniciar="Otra vez">
          <p data-resumen style={TEXTO_CIERRE}>{resumenH4(bien, TOTAL_H4)}</p>
        </Cierre>
      </Marco>
    );
  }

  return (
    <Marco rotulo={rotulo} titulo={titulo} acento={acento}>
      <style>{CSS_T7_HACER}</style>
      <div data-t7-3-h4>
        <Encabezado consigna={H4.consigna} onComoSeJuega={onComoSeJuega} />
        <Parrafos textos={H4.enunciado} />
        <Ficha filas={FICHA_H4} />
        <div style={{ marginBottom: "12px" }}>
          <Pulsos total={cuantos} hechos={t.i + (listo ? 1 : 0)} enCurso={t.i + 1} etiqueta="Pregunta" />
        </div>
        <TarjetaPregunta id={item.id} encabezado={item.encabezado ?? null} pregunta={item.pregunta} pie={H4.pie} tarjetaRef={tarjeta} />
        {item.tipo === "eleccion" ? (
          <>
            <Eleccion opciones={item.opciones} r={r} elegida={elegida} onElegir={elegir} etiqueta={item.pregunta} />
            <Devolucion r={r} lectorError={r && !r.ok ? `Incorrecto. La respuesta es ${r.textoCorrecta}. ` : null} />
          </>
        ) : (
          <LineasConComprobar key={item.id} lineas={item.orden.map((id) => item.lineas.find((l) => l.id === id))}
            asiento={item.lineas} onComprobar={comprobar} comprobado={comprobado} />
        )}
      </div>
      {listo && (
        <div ref={zonaBoton}>
          <Responder onClick={avanzar}>{t.i + 1 === cuantos ? BOTON_H4.verResumen : BOTON_H4.siguiente}</Responder>
        </div>
      )}
    </Marco>
  );
}
