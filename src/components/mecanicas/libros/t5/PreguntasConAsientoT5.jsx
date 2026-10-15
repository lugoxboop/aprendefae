import { useEffect, useRef, useState } from "react";
import { barajar } from "../../../../utils/barajar.js";
import { Pulsos, Cierre } from "../../corazon/juego.jsx";
import { TEXTO_CIERRE } from "../../bloques/marcos.jsx";
import { Responder, useTanda } from "../piezas.jsx";
import { Encabezado } from "../tema1/encabezado.jsx";
import { CSS_T7_HACER, Parrafos, TarjetaPregunta, Eleccion, Devolucion, LineasConComprobar } from "../t7/hacerT7.jsx";
import { CasillaCifra, LineasConCuenta, ContadorConIntento } from "../t7/armaLaLinea.jsx";
import { sinUnSoloIntento } from "../../../../contabilidad/armaLaLinea.js";

/*
 * ═══════════════════════════════════════════════════════════════════════════
 * T5 · LOS HACER CON CIFRAS DE LA CÉLULA C (N4 y N5).
 *
 * La forma de H4 de T7-3 («Pagó a tiempo»), con sus mismas piezas
 * (t7/hacerT7.jsx, sin cambiarlo). Arriba, siempre a la vista, la consigna y
 * lo demás del enunciado. Debajo, un ítem a la vez, en su orden:
 *
 *   ELECCIÓN  cifras o una respuesta corta; UN SOLO TOQUE; la buena se
 *             enseña.
 *   ASIENTO   las líneas barajadas; «Comprobar» las califica UNA vez, y el
 *             asiento con sus sumas aparece después.
 *
 * LOTE 3 («Arma la línea», armaLaLinea.jsx, con T7-3 H1 de molde): cada
 * ítem se pinta según su `tipo`. Un ítem "cifra" va con casilla de cifra. En
 * un "asiento" cuyas líneas traen `banco` (las prepara bancoDeLinea), cada
 * línea elige su cuenta del banco y su lado; si no lo traen, va la mesa de
 * antes, solo con el lado. Así una actividad que aún no pasa al lote 3 (N5)
 * no cambia.
 *
 * Un ítem puede traer `intro`, un texto que va encima de su tarjeta (la
 * pantalla intermedia de la ficha). Mientras llega el Patrón T5 de Watari.
 * Lo propio de cada actividad llega en `config`: { datos (enunciado y pie),
 * botones, preparar, evaluar, idLinea, puntuar, total, resumen, marca }.
 * Al terminar: onCompletar(pct, ms, detalle).
 * ═══════════════════════════════════════════════════════════════════════════
 */

export default function PreguntasConAsientoT5({ config, Marco, rotulo, titulo, acento, onCompletar, items = null, onComoSeJuega = null }) {
  const { datos, botones, preparar, evaluar, idLinea, puntuar, total, resumen, marca } = config;
  const t = useTanda(() => items ?? preparar(barajar));
  const [elegida, setElegida] = useState(null);
  const [r, setR] = useState(null);
  const [comprobado, setComprobado] = useState(false);
  const [bien, setBien] = useState(0);
  const zonaBoton = useRef(null);
  const tarjeta = useRef(null);

  const item = t.items[t.i];
  const cuantos = t.items.length;
  const listo = item && (item.tipo === "asiento" ? comprobado : Boolean(r));

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

  const comprobar = (resultados) => {
    if (comprobado) return;
    let n = 0;
    for (const x of resultados) { t.anotar(idLinea(item, x.linea), x.ok, x.elegido); if (x.ok) n += 1; }
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
        <Encabezado consigna={sinUnSoloIntento(consigna)} onComoSeJuega={onComoSeJuega} />
        {resto.length > 0 && <div style={{ marginBottom: "12px" }}><Parrafos textos={resto} /></div>}
        <div style={{ marginBottom: "12px" }}>
          <ContadorConIntento>
            <Pulsos total={cuantos} hechos={t.i + (listo ? 1 : 0)} enCurso={t.i + 1} etiqueta="Pregunta" />
          </ContadorConIntento>
        </div>
        {item.intro && <div style={{ marginBottom: "12px" }}><Parrafos textos={[item.intro]} dato="intro" /></div>}
        <TarjetaPregunta id={item.id} pregunta={item.pregunta} pie={datos.pie} tarjetaRef={tarjeta} />
        {item.tipo === "eleccion" && (
          <>
            <Eleccion opciones={item.opciones} r={r} elegida={elegida} onElegir={elegir} etiqueta={item.pregunta} />
            <Devolucion r={r} lectorError={r && !r.ok ? `Incorrecto. La respuesta es ${r.textoCorrecta}. ` : null} />
          </>
        )}
        {item.tipo === "cifra" && (
          <>
            <CasillaCifra key={item.id} id={item.id} onComprobar={elegir} comprobado={Boolean(r)} etiqueta={item.pregunta} />
            <Devolucion r={r} lectorError={r && !r.ok ? "Incorrecto. " : null} />
          </>
        )}
        {item.tipo === "asiento" && (item.lineas.every((l) => l.banco) ? (
          <LineasConCuenta key={item.id} lineas={item.orden.map((id) => item.lineas.find((l) => l.id === id))}
            asiento={item.lineas} onComprobar={comprobar} comprobado={comprobado} />
        ) : (
          <LineasConComprobar key={item.id} lineas={item.orden.map((id) => item.lineas.find((l) => l.id === id))}
            asiento={item.lineas} onComprobar={comprobar} comprobado={comprobado} />
        ))}
      </div>
      {listo && (
        <div ref={zonaBoton}>
          <Responder onClick={avanzar}>{t.i + 1 === cuantos ? botones.verResumen : botones.siguiente}</Responder>
        </div>
      )}
    </Marco>
  );
}
