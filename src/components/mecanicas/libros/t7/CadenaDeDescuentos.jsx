import { useEffect, useRef, useState } from "react";
import { barajar } from "../../../../utils/barajar.js";
import { H2, FICHA_H2, BOTON_H2, resumenH2 } from "../../../../data/contabilidadT7_3_h2.js";
import { prepararH2, evaluarH2, puntuarH2, TOTAL_H2 } from "../../../../contabilidad/t7_3H2.js";
import { Pulsos, Cierre } from "../../corazon/juego.jsx";
import { TEXTO_CIERRE } from "../../bloques/marcos.jsx";
import { Responder, useTanda } from "../piezas.jsx";
import { EncabezadoHacer } from "./hacerT7.jsx";
import { CSS_T73_PATRON } from "./PatronT7_3.jsx";
import FiguraAcumulada from "./FiguraAcumulada.jsx";
import { FIGURA_T7_3_H2, cerradosDe } from "../../../../contabilidad/figuraAcumulada.js";
import { CSS_T7_HACER, Ficha, Parrafos, TarjetaPregunta, Eleccion, Devolucion } from "./hacerT7.jsx";
import { ContadorConIntento } from "./armaLaLinea.jsx";
import { sinUnSoloIntento } from "../../../../contabilidad/armaLaLinea.js";

/*
 * ═══════════════════════════════════════════════════════════════════════════
 * T7-3 · HACER 2 · LA CADENA DE DESCUENTOS (Célula C)
 *
 * Arriba, siempre a la vista: el enunciado, las tarifas y la ficha de la
 * venta de Palma. Debajo, un ítem a la vez, en el orden de la tabla (el del
 * libro): tres valores barajados —en pesos, como factor o como porcentaje—,
 * UN SOLO TOQUE; la buena se enseña.
 *
 * Cinco unidades; la forma y las piezas son las del primer Hacer de T7-3
 * (hacerT7.jsx, sin cambiarlo). Al terminar: onCompletar(pct, ms, detalle).
 *
 * LOTE 5 (L): las figuras del Patrón T7-3 van en la figura acumulada
 * (FiguraAcumulada.jsx), que se queda arriba mientras se responde.
 * ═══════════════════════════════════════════════════════════════════════════
 */

export default function CadenaDeDescuentos({ Marco, rotulo, titulo, acento, onCompletar, items = null, onComoSeJuega = null }) {
  const t = useTanda(() => items ?? prepararH2(barajar));
  const [elegida, setElegida] = useState(null);
  const [r, setR] = useState(null);
  const [bien, setBien] = useState(0);
  const zonaBoton = useRef(null);
  const tarjeta = useRef(null);

  const item = t.items[t.i];
  const cuantos = t.items.length;
  const listo = Boolean(r);

  useEffect(() => {
    if (t.terminado) onCompletar?.(puntuarH2(bien), Date.now() - t.inicio.current, t.detalle.current);
  }, [t.terminado]); // eslint-disable-line react-hooks/exhaustive-deps
  useEffect(() => { if (listo) zonaBoton.current?.querySelector("button")?.focus(); }, [listo]);

  const elegir = (v) => {
    if (r) return;
    const nuevo = evaluarH2(item, v);
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
        <Cierre pct={Math.round(puntuarH2(bien))} onReiniciar={reiniciar} textoReiniciar="Otra vez">
          <p data-resumen style={TEXTO_CIERRE}>{resumenH2(bien, TOTAL_H2)}</p>
        </Cierre>
      </Marco>
    );
  }

  return (
    <Marco rotulo={rotulo} titulo={titulo} acento={acento}>
      <style>{CSS_T7_HACER + CSS_T73_PATRON}</style>
      <div data-t7-3-h2>
        <EncabezadoHacer objetivo={H2.objetivo} consigna={sinUnSoloIntento(H2.consigna)} onComoSeJuega={onComoSeJuega} />
        <Parrafos textos={H2.enunciado} />
        <Ficha filas={FICHA_H2} />
        <FiguraAcumulada figura={FIGURA_T7_3_H2} cerrados={cerradosDe(t.i, listo)} listo={listo} />
        <div style={{ marginBottom: "12px" }}>
          <ContadorConIntento>
            <Pulsos total={cuantos} hechos={t.i + (listo ? 1 : 0)} enCurso={t.i + 1} etiqueta="Pregunta" />
          </ContadorConIntento>
        </div>
        <TarjetaPregunta id={item.id} encabezado={item.encabezado ?? null} pregunta={item.pregunta} pie={H2.pie} tarjetaRef={tarjeta} />
        <Eleccion opciones={item.opciones} r={r} elegida={elegida} onElegir={elegir} etiqueta={item.pregunta} />
        <Devolucion r={r} lectorError={r && !r.ok ? `Incorrecto. Iba aquí: ${r.textoCorrecta}. ` : null} />
      </div>
      {listo && (
        <div ref={zonaBoton}>
          <Responder onClick={avanzar}>{t.i + 1 === cuantos ? BOTON_H2.verResumen : BOTON_H2.siguiente}</Responder>
        </div>
      )}
    </Marco>
  );
}
