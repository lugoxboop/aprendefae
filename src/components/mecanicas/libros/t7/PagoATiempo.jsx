import { useEffect, useRef, useState } from "react";
import { barajar } from "../../../../utils/barajar.js";
import { H4, FICHA_H4, ARRIBA_H4, ITEMS_H4, BOTON_H4, resumenH4 } from "../../../../data/contabilidadT7_3_h4.js";
import { prepararH4, evaluarH4, idLineaH4, puntuarH4, TOTAL_H4 } from "../../../../contabilidad/t7_3H4.js";
import { Pulsos, Cierre } from "../../corazon/juego.jsx";
import { TEXTO_CIERRE } from "../../bloques/marcos.jsx";
import { AsientoEnLineas, Responder, useTanda } from "../piezas.jsx";
import { EncabezadoHacer } from "./hacerT7.jsx";
import { CSS_T73_PATRON } from "./PatronT7_3.jsx";
import FiguraAcumulada from "./FiguraAcumulada.jsx";
import { FIGURA_T7_3_H4, cerradosDe } from "../../../../contabilidad/figuraAcumulada.js";
import { CSS_T7_HACER, Ficha, Parrafos, TarjetaPregunta, Devolucion } from "./hacerT7.jsx";
import { CasillaCifra, LineasConCuenta, ContadorConIntento } from "./armaLaLinea.jsx";
import { sinUnSoloIntento } from "../../../../contabilidad/armaLaLinea.js";
import { leerCifra } from "../../../../contabilidad/elCierreCompleto.js";
import { CONSECUENCIA_C4 as C4 } from "../../../../contabilidad/c4/t73h4_c4.js";
import { CSS_C4_T72, EleccionC4, useVeredictoC4 } from "./FigurasC4T7_2.jsx";
import { CSS_C4_T73H, FiguraCalendarioPago } from "./FigurasC4T7_3.jsx";

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
 *
 * LOTE 3: «Arma la línea» (armaLaLinea.jsx), con T7-3 H1 de molde. Los
 * ítems 1, 3 y 4 van con casilla de cifra; en cada asiento, cada línea elige
 * su cuenta del banco (la correcta y los dos distractores de Near) y su lado.
 *
 * LOTE 5 (L): la factura, el descuento y el pago, en una sola cuenta que crece
 * en la figura acumulada (FiguraAcumulada.jsx) y se queda hasta el cierre.
 *
 * C4 · «TODA DECISIÓN SE PINTA» (Watari, D9; FigurasC4T7_3.jsx, con el
 * precedente de T7-2, #424): al tocar una opción o al comprobar una cifra,
 * la figura de la actividad pinta lo que implica, antes del veredicto; el
 * veredicto llega ESPERA_C4 después (con movimiento reducido, en el acto).
 * Mientras se escribe, la figura solo muestra la cifra (C4-1 de Mello). El
 * intento se anota en el toque. Los asientos siguen como en main.
 * ═══════════════════════════════════════════════════════════════════════════
 */
/*
 * El contrato de la figura del motor (cabecera de decisionC4.jsx), para la prueba C5 de consecuencia-c: esta pieza
 * no monta el motor, pero su Figura acepta su vista. Con una cifra que se está escribiendo, `vista.borrador` solo se
 * MUESTRA en su lugar; `estado` (la consecuencia) existe solo después de comprobar (C4-1 de Mello).
 */
export const PIEZA_C4 = { ...C4, Figura: ({ estado, item, vista }) => <FiguraCalendarioPago estado={estado ?? C4.consecuencia(item, null)} item={item} escrita={vista?.borrador ?? null} /> };

export default function PagoATiempo({ Marco, rotulo, titulo, acento, onCompletar, items = null, onComoSeJuega = null }) {
  const t = useTanda(() => items ?? prepararH4(barajar));
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
    if (t.terminado) onCompletar?.(puntuarH4(bien), Date.now() - t.inicio.current, t.detalle.current);
  }, [t.terminado]); // eslint-disable-line react-hooks/exhaustive-deps
  useEffect(() => { if (listo) zonaBoton.current?.querySelector("button")?.focus(); }, [listo]);

  /* C4: el toque es la consecuencia (y el único intento, que se anota ya); el veredicto llega después. */
  const elegir = (v) => {
    if (r || elegida != null) return;
    const nuevo = evaluarH4(item, v);
    t.anotar(item.id, nuevo.ok, v);
    if (nuevo.ok) setBien((n) => n + 1);
    setElegida(v);
    veredicto.programar(() => setR(nuevo));
  };

  const comprobar = (resultados) => {
    if (comprobado) return;
    let n = 0;
    for (const x of resultados) { t.anotar(idLineaH4(item, x.linea), x.ok, x.elegido); if (x.ok) n += 1; }
    setBien((b) => b + n);
    setComprobado(true);
  };

  const avanzar = () => {
    veredicto.cancelar();
    setEscrita(null);
    setElegida(null); setR(null); setComprobado(false);
    if (t.i + 1 < cuantos) { t.setI(t.i + 1); requestAnimationFrame(() => tarjeta.current?.focus()); }
    else t.setTerminado(true);
  };

  const reiniciar = () => { veredicto.cancelar(); setEscrita(null); t.reiniciar(); setElegida(null); setR(null); setComprobado(false); setBien(0); };

  if (t.terminado) {
    return (
      <Marco rotulo={rotulo} titulo={titulo} acento={acento}>
        <Cierre pct={Math.round(puntuarH4(bien))} onReiniciar={reiniciar} textoReiniciar="Otra vez">
          <p data-resumen style={TEXTO_CIERRE}>{resumenH4(bien, TOTAL_H4)}</p>
        </Cierre>
      </Marco>
    );
  }

  const itemC4 = C4.items.find((x) => x.id === item.id);
  const estadoC4 = item.tipo === "asiento" ? null : C4.consecuencia(itemC4, elegida == null ? null : item.tipo === "cifra" ? elegida : String(elegida));
  const escritaC4 = item.tipo === "cifra" && elegida == null ? escrita : null;

  return (
    <Marco rotulo={rotulo} titulo={titulo} acento={acento}>
      <style>{CSS_C4_T72}{CSS_C4_T73H}</style>
      <style>{CSS_T7_HACER + CSS_T73_PATRON}</style>
      <div data-t7-3-h4>
        <EncabezadoHacer objetivo={H4.objetivo} consigna={sinUnSoloIntento(H4.consigna)} onComoSeJuega={onComoSeJuega} />
        <Parrafos textos={H4.enunciado} />
        <Ficha filas={FICHA_H4} />
        <FiguraAcumulada figura={FIGURA_T7_3_H4} cerrados={cerradosDe(t.i, Boolean(listo))} listo={Boolean(listo)} />
        <div style={{ marginBottom: "12px" }}>
          <ContadorConIntento>
            <Pulsos total={cuantos} hechos={t.i + (listo ? 1 : 0)} enCurso={t.i + 1} etiqueta="Pregunta" />
          </ContadorConIntento>
        </div>
        {item.id === ARRIBA_H4.item && (
          <div data-asiento-arriba style={{ marginBottom: "12px" }}>
            <p style={{ margin: "0 0 6px", font: "600 13px/1.3 Sora, Inter, sans-serif", color: "#F8F9FA" }}>{ARRIBA_H4.titulo}</p>
            <AsientoEnLineas lineas={ITEMS_H4.find((x) => x.id === ARRIBA_H4.de).lineas.map((l) => ({ cuenta: l.cuenta, lado: l.lado, valor: l.valor }))} totales />
          </div>
        )}
        <TarjetaPregunta id={item.id} encabezado={item.encabezado ?? null} pregunta={item.pregunta} pie={H4.pie} tarjetaRef={tarjeta} />
        {estadoC4 && <FiguraCalendarioPago estado={estadoC4} item={item} escrita={escritaC4} />}
        {item.tipo === "eleccion" && (
          <>
            <EleccionC4 opciones={item.opciones} r={r} elegida={elegida} onElegir={elegir} etiqueta={item.pregunta} />
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
          <Responder onClick={avanzar}>{t.i + 1 === cuantos ? BOTON_H4.verResumen : BOTON_H4.siguiente}</Responder>
        </div>
      )}
    </Marco>
  );
}
