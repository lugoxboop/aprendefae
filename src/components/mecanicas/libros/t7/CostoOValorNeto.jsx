import { useEffect, useRef, useState } from "react";
import { barajar } from "../../../../utils/barajar.js";
import { H7, CASOS_H7, FIGURAS_H7, BOTON_H7, fichaH7, resumenH7 } from "../../../../data/contabilidadT7_3_h7.js";
import { prepararH7, evaluarH7, puntuarH7, TOTAL_H7 } from "../../../../contabilidad/t7_3H7.js";
import { Pulsos, Cierre } from "../../corazon/juego.jsx";
import { TEXTO_CIERRE } from "../../bloques/marcos.jsx";
import { Responder, useTanda } from "../piezas.jsx";
import { Encabezado } from "../tema1/encabezado.jsx";
import { CSS_T7_HACER, Ficha, Parrafos, TarjetaPregunta, Eleccion, Devolucion } from "./hacerT7.jsx";
import { FranjaNIC2, FigurasHacer, CSS_T73_PATRON } from "./PatronT7_3.jsx";
import { ContadorConIntento } from "./armaLaLinea.jsx";
import { sinUnSoloIntento } from "../../../../contabilidad/armaLaLinea.js";

/*
 * ═══════════════════════════════════════════════════════════════════════════
 * T7-3 · HACER 7 · ¿COSTO O VALOR NETO REALIZABLE? (Célula C)
 *
 * Arriba, siempre a la vista, la frase fija de la NIC 2; luego la consigna.
 * Debajo, un ítem a la vez, en el orden de la tabla, con su caso encima: el
 * texto del caso y su ficha (la de la regla 10c que propone Near), y «Caso 1»
 * a «Caso 3» como encabezado de la pregunta. Cifras barajadas: UN SOLO
 * TOQUE; la buena se enseña.
 *
 * Seis unidades; las piezas son las de los Hacer de T7-3 (hacerT7.jsx, sin
 * cambiarlo). Al terminar: onCompletar(pct, ms, detalle).
 * ═══════════════════════════════════════════════════════════════════════════
 */

export default function CostoOValorNeto({ Marco, rotulo, titulo, acento, onCompletar, items = null, onComoSeJuega = null }) {
  const t = useTanda(() => items ?? prepararH7(barajar));
  const [elegida, setElegida] = useState(null);
  const [r, setR] = useState(null);
  const [bien, setBien] = useState(0);
  const zonaBoton = useRef(null);
  const tarjeta = useRef(null);

  const item = t.items[t.i];
  const cuantos = t.items.length;
  const listo = Boolean(r);

  useEffect(() => {
    if (t.terminado) onCompletar?.(puntuarH7(bien), Date.now() - t.inicio.current, t.detalle.current);
  }, [t.terminado]); // eslint-disable-line react-hooks/exhaustive-deps
  useEffect(() => { if (listo) zonaBoton.current?.querySelector("button")?.focus(); }, [listo]);

  const elegir = (v) => {
    if (r) return;
    const nuevo = evaluarH7(item, v);
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
        <style>{CSS_T73_PATRON}</style>
        <FranjaNIC2 texto={H7.aviso} />
        <Cierre pct={Math.round(puntuarH7(bien))} onReiniciar={reiniciar} textoReiniciar="Otra vez">
          <p data-resumen style={TEXTO_CIERRE}>{resumenH7(bien, TOTAL_H7)}</p>
        </Cierre>
      </Marco>
    );
  }

  const caso = CASOS_H7[item.caso];
  return (
    <Marco rotulo={rotulo} titulo={titulo} acento={acento}>
      <style>{CSS_T7_HACER + CSS_T73_PATRON}</style>
      <div data-t7-3-h7 className="t73pt-pieza">
        <FranjaNIC2 texto={H7.aviso} />
        <Encabezado consigna={sinUnSoloIntento(H7.consigna)} onComoSeJuega={onComoSeJuega} />
        <div style={{ marginBottom: "12px" }}>
          <ContadorConIntento>
            <Pulsos total={cuantos} hechos={t.i + (listo ? 1 : 0)} enCurso={t.i + 1} etiqueta="Pregunta" />
          </ContadorConIntento>
        </div>
        <div key={`caso-${item.caso}`} className="fae-t7h-entra" data-caso={item.caso + 1}>
          <Parrafos textos={[caso.texto]} dato="caso" />
          <Ficha filas={fichaH7(caso)} />
        </div>
        <FigurasHacer figuras={FIGURAS_H7} respondidos={t.i + (listo ? 1 : 0)} listo={listo} />
        <TarjetaPregunta id={item.id} encabezado={caso.encabezado} pregunta={item.pregunta} pie={H7.pie} tarjetaRef={tarjeta} />
        <Eleccion opciones={item.opciones} r={r} elegida={elegida} onElegir={elegir} etiqueta={item.pregunta} />
        <Devolucion r={r} lectorError={r && !r.ok ? `Incorrecto. Iba aquí: ${r.textoCorrecta}. ` : null} />
      </div>
      {listo && (
        <div ref={zonaBoton}>
          <Responder onClick={avanzar}>{t.i + 1 === cuantos ? BOTON_H7.verResumen : BOTON_H7.siguiente}</Responder>
        </div>
      )}
    </Marco>
  );
}
