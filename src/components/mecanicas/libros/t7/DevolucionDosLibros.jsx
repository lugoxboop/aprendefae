import { useEffect, useRef, useState } from "react";
import { barajar } from "../../../../utils/barajar.js";
import { FAE } from "../../../../theme.js";
import { H6, FICHA_H6, COMPRA_RESUELTA_H6, BOTON_H6, resumenH6 } from "../../../../data/contabilidadT7_1_h6.js";
import { prepararH6, evaluarH6, idLineaH6, puntuarH6, TOTAL_H6 } from "../../../../contabilidad/t7H6.js";
import { Pulsos, Cierre } from "../../corazon/juego.jsx";
import { TEXTO_CIERRE } from "../../bloques/marcos.jsx";
import { AsientoEnLineas, Responder, useTanda } from "../piezas.jsx";
import { Encabezado } from "../tema1/encabezado.jsx";
import { CSS_T7_HACER, Ficha, Parrafos, TarjetaPregunta, Eleccion, Devolucion, LineasConComprobar } from "./hacerT7.jsx";

/*
 * ═══════════════════════════════════════════════════════════════════════════
 * T7-1 · HACER 6 · LA DEVOLUCIÓN EN DOS LIBROS (Célula C)
 *
 * Arriba, siempre a la vista: el enunciado, el asiento de la compra ya
 * resuelto en los dos libros (en modo lectura) y la ficha de la devolución.
 * Debajo, un ítem a la vez, en el orden de la tabla:
 *
 *   PREGUNTA  tres opciones barajadas, UN SOLO TOQUE; la buena se enseña.
 *   ASIENTO   cuatro líneas barajadas; se elige el lado de cada una y
 *             «Comprobar» las califica UNA vez. El texto de cada línea mal
 *             ubicada va debajo de ella, y las sumas (986.000 = 986.000)
 *             aparecen después de comprobar, como pide el patrón.
 *
 * Trece unidades; la forma y las piezas son las de H1-H5 (hacerT7.jsx).
 * Al terminar: onCompletar(pct, ms, detalle).
 * ═══════════════════════════════════════════════════════════════════════════
 */

export default function DevolucionDosLibros({ Marco, rotulo, titulo, acento, onCompletar, items = null, onComoSeJuega = null }) {
  const t = useTanda(() => items ?? prepararH6(barajar));
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

  const comprobar = (resultados) => {
    if (comprobado) return;
    let n = 0;
    for (const x of resultados) { t.anotar(idLineaH6(item, x.linea), x.ok, x.elegido); if (x.ok) n += 1; }
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
        <Cierre pct={Math.round(puntuarH6(bien))} onReiniciar={reiniciar} textoReiniciar="Otra vez">
          <p data-resumen style={TEXTO_CIERRE}>{resumenH6(bien, TOTAL_H6)}</p>
        </Cierre>
      </Marco>
    );
  }

  return (
    <Marco rotulo={rotulo} titulo={titulo} acento={acento}>
      <style>{CSS_T7_HACER}</style>
      <div data-h6>
        <Encabezado consigna={H6.consigna} onComoSeJuega={onComoSeJuega} />
        <Parrafos textos={H6.enunciado} />
        <div data-compra-resuelta style={{ display: "grid", gap: "8px", margin: "0 0 12px" }}>
          <AsientoEnLineas lineas={COMPRA_RESUELTA_H6.comprador} rotulo="COMPRADOR" acento={FAE.ambar} />
          <AsientoEnLineas lineas={COMPRA_RESUELTA_H6.vendedor} rotulo="VENDEDOR" acento={FAE.ambar} />
        </div>
        <Ficha filas={FICHA_H6} />
        <div style={{ marginBottom: "12px" }}>
          <Pulsos total={cuantos} hechos={t.i + (listo ? 1 : 0)} enCurso={t.i + 1} etiqueta="Pregunta" />
        </div>
        <TarjetaPregunta id={item.id} encabezado={item.encabezado ?? null} pregunta={item.pregunta} pie={H6.pie} tarjetaRef={tarjeta} />
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
          <Responder onClick={avanzar}>{t.i + 1 === cuantos ? BOTON_H6.verResumen : BOTON_H6.siguiente}</Responder>
        </div>
      )}
    </Marco>
  );
}
