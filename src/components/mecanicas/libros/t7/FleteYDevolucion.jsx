import { useEffect, useRef, useState } from "react";
import { barajar } from "../../../../utils/barajar.js";
import { H5, HECHOS_H5, BOTON_H5, encabezadoDeHecho, resumenH5 } from "../../../../data/contabilidadT7_2_h5.js";
import { prepararH5, evaluarH5, idLineaH5, puntuarH5, TOTAL_H5 } from "../../../../contabilidad/t7_2H5.js";
import { Pulsos, Cierre } from "../../corazon/juego.jsx";
import { TEXTO_CIERRE } from "../../bloques/marcos.jsx";
import { Responder, useTanda } from "../piezas.jsx";
import { Encabezado } from "../tema1/encabezado.jsx";
import { CSS_T7_HACER, TEXTO, Parrafos, TarjetaPregunta, Eleccion, Devolucion, LineasConComprobar } from "./hacerT7.jsx";
import { ContadorConIntento } from "./armaLaLinea.jsx";
import { sinUnSoloIntento } from "../../../../contabilidad/armaLaLinea.js";

/*
 * ═══════════════════════════════════════════════════════════════════════════
 * T7-2 · HACER 5 · FLETE Y DEVOLUCIÓN (Célula C)
 *
 * Arriba, siempre a la vista: el enunciado y las tarifas. Debajo, un ítem a
 * la vez, en el orden de la tabla, con su hecho encima de la pregunta:
 *
 *   ELECCIÓN  tres opciones barajadas (cuentas o cifras), UN SOLO TOQUE; la
 *             buena se enseña.
 *   ASIENTO   el ítem 6: las dos líneas barajadas; se elige el lado de cada
 *             una y «Comprobar» las califica UNA vez. El texto de cada línea
 *             mal ubicada va debajo de ella, y el asiento con sus sumas
 *             (490.000 = 490.000) aparece después de comprobar.
 *
 * Siete unidades; la forma y las piezas son las de H2 (hacerT7.jsx, sin
 * cambiarlo). Al terminar: onCompletar(pct, ms, detalle).
 * ═══════════════════════════════════════════════════════════════════════════
 */

export default function FleteYDevolucion({ Marco, rotulo, titulo, acento, onCompletar, items = null, onComoSeJuega = null }) {
  const t = useTanda(() => items ?? prepararH5(barajar));
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
    if (t.terminado) onCompletar?.(puntuarH5(bien), Date.now() - t.inicio.current, t.detalle.current);
  }, [t.terminado]); // eslint-disable-line react-hooks/exhaustive-deps
  useEffect(() => { if (listo) zonaBoton.current?.querySelector("button")?.focus(); }, [listo]);

  const elegir = (v) => {
    if (r) return;
    const nuevo = evaluarH5(item, v);
    t.anotar(item.id, nuevo.ok, v);
    if (nuevo.ok) setBien((n) => n + 1);
    setElegida(v);
    setR(nuevo);
  };

  const comprobar = (resultados) => {
    if (comprobado) return;
    let n = 0;
    for (const x of resultados) { t.anotar(idLineaH5(item, x.linea), x.ok, x.elegido); if (x.ok) n += 1; }
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
        <Cierre pct={Math.round(puntuarH5(bien))} onReiniciar={reiniciar} textoReiniciar="Otra vez">
          <p data-resumen style={TEXTO_CIERRE}>{resumenH5(bien, TOTAL_H5)}</p>
        </Cierre>
      </Marco>
    );
  }

  return (
    <Marco rotulo={rotulo} titulo={titulo} acento={acento}>
      <style>{CSS_T7_HACER}</style>
      <div data-t7-2-h5>
        <Encabezado consigna={sinUnSoloIntento(H5.consigna)} onComoSeJuega={onComoSeJuega} />
        <Parrafos textos={H5.enunciado} />
        <div style={{ marginBottom: "12px" }}>
          <ContadorConIntento>
            <Pulsos total={cuantos} hechos={t.i + (listo ? 1 : 0)} enCurso={t.i + 1} etiqueta="Pregunta" />
          </ContadorConIntento>
        </div>
        <p key={`hecho-${item.hecho}`} className="fae-t7h-entra" data-hecho={item.hecho + 1} style={{ ...TEXTO, margin: "0 0 10px" }}>{HECHOS_H5[item.hecho]}</p>
        <TarjetaPregunta id={item.id} encabezado={encabezadoDeHecho(item.hecho)} pregunta={item.pregunta} pie={H5.pie} tarjetaRef={tarjeta} />
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
          <Responder onClick={avanzar}>{t.i + 1 === cuantos ? BOTON_H5.verResumen : BOTON_H5.siguiente}</Responder>
        </div>
      )}
    </Marco>
  );
}
