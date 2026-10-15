import { useEffect, useRef, useState } from "react";
import { barajar } from "../../../../utils/barajar.js";
import { H1, FICHA_H1, FIGURAS_H1, BOTON_H1, resumenH1 } from "../../../../data/contabilidadT7_3_h1.js";
import { prepararH1, evaluarH1, idLineaH1, puntuarH1, TOTAL_H1 } from "../../../../contabilidad/t7_3H1.js";
import { Pulsos, Cierre } from "../../corazon/juego.jsx";
import { TEXTO_CIERRE } from "../../bloques/marcos.jsx";
import { Responder, useTanda } from "../piezas.jsx";
import { Encabezado } from "../tema1/encabezado.jsx";
import { FigurasHacer, CSS_T73_PATRON } from "./PatronT7_3.jsx";
import { CSS_T7_HACER, Ficha, Parrafos, TarjetaPregunta, Eleccion, Devolucion, LineasConComprobar } from "./hacerT7.jsx";

/*
 * ═══════════════════════════════════════════════════════════════════════════
 * T7-3 · HACER 1 · DESCUENTO EN LA FACTURA (Célula C)
 *
 * Arriba, siempre a la vista: el enunciado, las tarifas y la ficha de la
 * venta de Guadua. Debajo, un ítem a la vez, en el orden de la tabla:
 *
 *   CÁLCULO   tres cifras barajadas, UN SOLO TOQUE; la buena se enseña
 *             (ítems 1 a 4).
 *   ASIENTO   las cuatro líneas barajadas; se elige el lado de cada una y
 *             «Comprobar» las califica UNA vez. El texto de cada línea mal
 *             ubicada va debajo de ella, y el asiento con sus sumas
 *             (2.092.640 = 2.092.640) aparece después de comprobar.
 *
 * Ocho unidades; la forma y las piezas son las del segundo Hacer de T7-2
 * (hacerT7.jsx, sin cambiarlo). Al terminar: onCompletar(pct, ms, detalle).
 * ═══════════════════════════════════════════════════════════════════════════
 */

export default function DescuentoEnFactura({ Marco, rotulo, titulo, acento, onCompletar, items = null, onComoSeJuega = null }) {
  const t = useTanda(() => items ?? prepararH1(barajar));
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
    if (t.terminado) onCompletar?.(puntuarH1(bien), Date.now() - t.inicio.current, t.detalle.current);
  }, [t.terminado]); // eslint-disable-line react-hooks/exhaustive-deps
  useEffect(() => { if (listo) zonaBoton.current?.querySelector("button")?.focus(); }, [listo]);

  const elegir = (v) => {
    if (r) return;
    const nuevo = evaluarH1(item, v);
    t.anotar(item.id, nuevo.ok, v);
    if (nuevo.ok) setBien((n) => n + 1);
    setElegida(v);
    setR(nuevo);
  };

  const comprobar = (resultados) => {
    if (comprobado) return;
    let n = 0;
    for (const x of resultados) { t.anotar(idLineaH1(item, x.linea), x.ok, x.elegido); if (x.ok) n += 1; }
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
        <Cierre pct={Math.round(puntuarH1(bien))} onReiniciar={reiniciar} textoReiniciar="Otra vez">
          <p data-resumen style={TEXTO_CIERRE}>{resumenH1(bien, TOTAL_H1)}</p>
        </Cierre>
      </Marco>
    );
  }

  return (
    <Marco rotulo={rotulo} titulo={titulo} acento={acento}>
      <style>{CSS_T7_HACER + CSS_T73_PATRON}</style>
      <div data-t7-3-h1>
        <Encabezado consigna={H1.consigna} onComoSeJuega={onComoSeJuega} />
        <Parrafos textos={H1.enunciado} />
        <Ficha filas={FICHA_H1} />
        <FigurasHacer figuras={FIGURAS_H1} respondidos={t.i + (listo ? 1 : 0)} listo={listo} />
        <div style={{ marginBottom: "12px" }}>
          <Pulsos total={cuantos} hechos={t.i + (listo ? 1 : 0)} enCurso={t.i + 1} etiqueta="Pregunta" />
        </div>
        <TarjetaPregunta id={item.id} encabezado={item.encabezado ?? null} pregunta={item.pregunta} pie={H1.pie} tarjetaRef={tarjeta} />
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
          <Responder onClick={avanzar}>{t.i + 1 === cuantos ? BOTON_H1.verResumen : BOTON_H1.siguiente}</Responder>
        </div>
      )}
    </Marco>
  );
}
