import { useEffect, useRef, useState } from "react";
import { Pulsos, Cierre } from "../../corazon/juego.jsx";
import { TEXTO_CIERRE } from "../../bloques/marcos.jsx";
import { Responder, useTanda } from "../piezas.jsx";
import { EncabezadoHacer } from "../t7/hacerT7.jsx";
import { CSS_T7_HACER, TarjetaPregunta, Eleccion, Devolucion, Parrafos } from "../t7/hacerT7.jsx";
import { ContadorConIntento } from "../t7/armaLaLinea.jsx";
import { sinUnSoloIntento } from "../../../../contabilidad/armaLaLinea.js";

/*
 * ═══════════════════════════════════════════════════════════════════════════
 * T5 · LOS HACER DE UN SOLO TOQUE DE LA CÉLULA C (N1 y N3).
 *
 * La forma de H3 de T7-3 («¿Comercial o condicionado?»), con sus mismas
 * piezas (t7/hacerT7.jsx, sin cambiarlo): arriba, la consigna y lo demás del
 * enunciado; debajo, un ítem a la vez, en su orden. UN SOLO TOQUE; la buena
 * se enseña. Un ítem puede traer `intro`, un texto que va encima de su
 * tarjeta (la pantalla de la ficha antes de un bloque).
 *
 * Mientras llega el Patrón T5 de Watari. Lo propio de cada actividad llega en
 * `config`: { datos (enunciado y pie), botones, preparar, evaluar, puntuar,
 * total, resumen, marca }. Al terminar: onCompletar(pct, ms, detalle).
 * ═══════════════════════════════════════════════════════════════════════════
 */

export default function UnToqueT5({ config, Marco, rotulo, titulo, acento, onCompletar, items = null, onComoSeJuega = null }) {
  const { datos, botones, preparar, evaluar, puntuar, total, resumen, marca } = config;
  const t = useTanda(() => items ?? preparar());
  const [elegida, setElegida] = useState(null);
  const [r, setR] = useState(null);
  const [bien, setBien] = useState(0);
  const zonaBoton = useRef(null);
  const tarjeta = useRef(null);

  const item = t.items[t.i];
  const cuantos = t.items.length;
  const listo = Boolean(r);

  useEffect(() => {
    if (t.terminado) onCompletar?.(puntuar(bien), Date.now() - t.inicio.current, t.detalle.current);
  }, [t.terminado]); // eslint-disable-line react-hooks/exhaustive-deps
  useEffect(() => { if (listo) zonaBoton.current?.querySelector("button")?.focus(); }, [listo]);

  const elegir = (v) => {
    if (r) return;
    const nuevo = evaluar(item, v);
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
        <Cierre pct={Math.round(puntuar(bien))} onReiniciar={reiniciar} textoReiniciar="Otra vez">
          <p data-resumen style={TEXTO_CIERRE}>{resumen(bien, total)}</p>
        </Cierre>
      </Marco>
    );
  }

  const [consigna, ...resto] = datos.enunciado;
  return (
    <Marco rotulo={rotulo} titulo={titulo} acento={acento}>
      <style>{CSS_T7_HACER}</style>
      <div {...{ [`data-${marca}`]: true }}>
        <EncabezadoHacer objetivo={datos.objetivo} consigna={sinUnSoloIntento(consigna)} onComoSeJuega={onComoSeJuega} />
        {resto.length > 0 && <div style={{ marginBottom: "12px" }}><Parrafos textos={resto} /></div>}
        <div style={{ marginBottom: "12px" }}>
          <ContadorConIntento>
            <Pulsos total={cuantos} hechos={t.i + (listo ? 1 : 0)} enCurso={t.i + 1} etiqueta="Pregunta" />
          </ContadorConIntento>
        </div>
        {item.intro && <div style={{ marginBottom: "12px" }}><Parrafos textos={[item.intro]} dato="intro" /></div>}
        <TarjetaPregunta id={item.id} pregunta={item.pregunta} pie={datos.pie} tarjetaRef={tarjeta} />
        <Eleccion opciones={item.opciones} r={r} elegida={elegida} onElegir={elegir} etiqueta={item.pregunta} />
        <Devolucion r={r} lectorError={r && !r.ok ? `Incorrecto. Iba aquí: ${r.textoCorrecta}. ` : null} />
      </div>
      {listo && (
        <div ref={zonaBoton}>
          <Responder onClick={avanzar}>{t.i + 1 === cuantos ? botones.verResumen : botones.siguiente}</Responder>
        </div>
      )}
    </Marco>
  );
}
