import { useEffect, useRef, useState } from "react";
import { barajar } from "../../../../utils/barajar.js";
import { H5, HECHOS_H5, BOTON_H5, encabezadoDeHecho, resumenH5 } from "../../../../data/contabilidadT7_2_h5.js";
import { prepararH5, evaluarH5, idLineaH5, puntuarH5, TOTAL_H5 } from "../../../../contabilidad/t7_2H5.js";
import { Pulsos, Cierre } from "../../corazon/juego.jsx";
import { TEXTO_CIERRE } from "../../bloques/marcos.jsx";
import { Responder, useTanda } from "../piezas.jsx";
import { EncabezadoHacer } from "./hacerT7.jsx";
import { CSS_T7_HACER, TEXTO, Parrafos, TarjetaPregunta, Devolucion } from "./hacerT7.jsx";
import { CasillaCifra, LineasConCuenta, ContadorConIntento } from "./armaLaLinea.jsx";
import { sinUnSoloIntento } from "../../../../contabilidad/armaLaLinea.js";
import { leerCifra } from "../../../../contabilidad/elCierreCompleto.js";
import { CONSECUENCIA_C4 as C4 } from "../../../../contabilidad/c4/t7_2_h5_c4.js";
import { CSS_C4_T72, FiguraMapaDeMangle, CuentaDeMangle, EleccionC4, useVeredictoC4 } from "./FigurasC4T7_2.jsx";
import FiguraAcumulada from "./FiguraAcumulada.jsx";
import { FIGURA_T7_2_H5, cerradosDe } from "../../../../contabilidad/figuraAcumulada.js";

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
 *
 * LOTE 3 («Arma la línea», con T7-3 H1 de molde): los ítems 2 y 5 van con
 * casilla de cifra; el 1, el 3 y el 4 se quedan en elección. En el ítem 6,
 * cada línea elige su cuenta del banco (la correcta y dos distractores de
 * Near) y su lado.
 *
 * LOTE 5 (L): arriba del ítem, la figura acumulada (FiguraAcumulada.jsx): lo
 * de cada hecho se suma al cerrar su ítem, y el asiento del hecho 4 al final.
 *
 * C4 · «TODA DECISIÓN SE PINTA» (Watari, D9; FigurasC4T7_2.jsx): debajo de
 * la pregunta, el mapa de Mangle. Cada hecho es una flecha; en los ítems de
 * cuenta, las cuentas del libro de Mangle son las opciones (viven en la
 * figura): el valor entra a la tocada y la cuenta dice qué le pasa. En los
 * de cifra, mientras se escribe la figura solo muestra la cifra (C4-1 de
 * Mello); al comprobar, la cifra entra al cálculo con lo que implica. Todo
 * antes del veredicto, que llega ESPERA_C4 después. La figura acumulada no
 * cambia.
 * ═══════════════════════════════════════════════════════════════════════════
 */

export default function FleteYDevolucion({ Marco, rotulo, titulo, acento, onCompletar, items = null, onComoSeJuega = null }) {
  const t = useTanda(() => items ?? prepararH5(barajar));
  const [elegida, setElegida] = useState(null);
  const [r, setR] = useState(null);
  const [comprobado, setComprobado] = useState(false);
  const [bien, setBien] = useState(0);
  /* C4: la cifra que se va escribiendo: la figura solo la muestra; la consecuencia llega al comprobar (C4-1 de Mello). */
  const [escrita, setEscrita] = useState(null);
  const veredicto = useVeredictoC4();
  const zonaBoton = useRef(null);
  const tarjeta = useRef(null);

  const item = t.items[t.i];
  const cuantos = t.items.length;
  const listo = item && (item.tipo === "asiento" ? comprobado : Boolean(r));

  useEffect(() => {
    if (t.terminado) onCompletar?.(puntuarH5(bien), Date.now() - t.inicio.current, t.detalle.current);
  }, [t.terminado]); // eslint-disable-line react-hooks/exhaustive-deps
  useEffect(() => { if (listo) zonaBoton.current?.querySelector("button")?.focus(); }, [listo]);

  /* C4: el toque es la consecuencia (y el único intento, que se anota ya); el veredicto llega después. */
  const elegir = (v) => {
    if (r || elegida != null) return;
    const nuevo = evaluarH5(item, v);
    t.anotar(item.id, nuevo.ok, v);
    if (nuevo.ok) setBien((n) => n + 1);
    setElegida(v);
    veredicto.programar(() => setR(nuevo));
  };

  const comprobar = (resultados) => {
    if (comprobado) return;
    let n = 0;
    for (const x of resultados) { t.anotar(idLineaH5(item, x.linea), x.ok, x.elegido); if (x.ok) n += 1; }
    setBien((b) => b + n);
    setComprobado(true);
  };

  const avanzar = () => {
    veredicto.cancelar();
    setElegida(null); setR(null); setComprobado(false); setEscrita(null);
    if (t.i + 1 < cuantos) { t.setI(t.i + 1); requestAnimationFrame(() => tarjeta.current?.focus()); }
    else t.setTerminado(true);
  };

  const reiniciar = () => { veredicto.cancelar(); t.reiniciar(); setElegida(null); setR(null); setComprobado(false); setBien(0); setEscrita(null); };

  if (t.terminado) {
    return (
      <Marco rotulo={rotulo} titulo={titulo} acento={acento}>
        <Cierre pct={Math.round(puntuarH5(bien))} onReiniciar={reiniciar} textoReiniciar="Otra vez">
          <p data-resumen style={TEXTO_CIERRE}>{resumenH5(bien, TOTAL_H5)}</p>
        </Cierre>
      </Marco>
    );
  }

  const itemC4 = C4.items.find((x) => x.id === item.id);
  const estadoC4 = item.tipo === "asiento" ? null : C4.consecuencia(itemC4, item.tipo === "cifra" ? elegida : elegida);

  return (
    <Marco rotulo={rotulo} titulo={titulo} acento={acento}>
      <style>{CSS_T7_HACER}{CSS_C4_T72}</style>
      <div data-t7-2-h5>
        <EncabezadoHacer objetivo={H5.objetivo} consigna={sinUnSoloIntento(H5.consigna)} onComoSeJuega={onComoSeJuega} />
        <Parrafos textos={H5.enunciado} />
        <FiguraAcumulada figura={FIGURA_T7_2_H5} cerrados={cerradosDe(t.i, Boolean(listo))} listo={Boolean(listo)} />
        <div style={{ marginBottom: "12px" }}>
          <ContadorConIntento>
            <Pulsos total={cuantos} hechos={t.i + (listo ? 1 : 0)} enCurso={t.i + 1} etiqueta="Pregunta" />
          </ContadorConIntento>
        </div>
        <p key={`hecho-${item.hecho}`} className="fae-t7h-entra" data-hecho={item.hecho + 1} style={{ ...TEXTO, margin: "0 0 10px" }}>{HECHOS_H5[item.hecho]}</p>
        <TarjetaPregunta id={item.id} encabezado={encabezadoDeHecho(item.hecho)} pregunta={item.pregunta} pie={H5.pie} tarjetaRef={tarjeta} />
        {estadoC4 && (
          <FiguraMapaDeMangle estado={estadoC4} item={item} escrita={item.tipo === "cifra" && elegida == null ? escrita : null}>
            {item.tipo === "eleccion" && (
              <EleccionC4 opciones={item.opciones} r={r} elegida={elegida} onElegir={elegir} etiqueta={item.pregunta}
                contenido={(o) => <CuentaDeMangle nombre={o.texto} estado={estadoC4} />} />
            )}
          </FiguraMapaDeMangle>
        )}
        {item.tipo === "eleccion" && (
          <>
            <Devolucion r={r} lectorError={r && !r.ok ? `Incorrecto. Iba aquí: ${r.textoCorrecta}. ` : null} />
          </>
        )}
        {item.tipo === "cifra" && (
          <>
            <div onInput={(e) => setEscrita(leerCifra(e.target.value))}>
              <CasillaCifra key={item.id} id={item.id} onComprobar={elegir} comprobado={elegida != null} etiqueta={item.pregunta} iba={r && !r.ok ? r.textoCorrecta : null} />
            </div>
            <Devolucion r={r} lectorError={r && !r.ok ? "Incorrecto. " : null} />
          </>
        )}
        {item.tipo === "asiento" && (
          <LineasConCuenta key={item.id} lineas={item.orden.map((id) => item.lineas.find((l) => l.id === id))}
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
