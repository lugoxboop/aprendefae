import { useEffect, useRef, useState } from "react";
import { barajar } from "../../../../utils/barajar.js";
import { H5, CASOS_H5, FIGURAS_H5, BOTON_H5, resumenH5 } from "../../../../data/contabilidadT7_3_h5.js";
import { prepararH5, evaluarH5, idLineaH5, puntuarH5, TOTAL_H5 } from "../../../../contabilidad/t7_3H5.js";
import { Pulsos, Cierre } from "../../corazon/juego.jsx";
import { TEXTO_CIERRE } from "../../bloques/marcos.jsx";
import { Responder, useTanda } from "../piezas.jsx";
import { EncabezadoHacer } from "./hacerT7.jsx";
import { FigurasHacer, CSS_T73_PATRON } from "./PatronT7_3.jsx";
import { CSS_T7_HACER, Ficha, Parrafos, TarjetaPregunta, Devolucion } from "./hacerT7.jsx";
import { CasillaCifra, LineasConCuenta, ContadorConIntento } from "./armaLaLinea.jsx";
import { sinUnSoloIntento } from "../../../../contabilidad/armaLaLinea.js";
import { leerCifra } from "../../../../contabilidad/elCierreCompleto.js";
import { CONSECUENCIA_C4 as C4 } from "../../../../contabilidad/c4/t73h5_c4.js";
import { CSS_C4_T72, EleccionC4, useVeredictoC4 } from "./FigurasC4T7_2.jsx";
import { CSS_C4_T73H, FiguraBalanzaConteo, CuentaDePino } from "./FigurasC4T7_3.jsx";

/*
 * ═══════════════════════════════════════════════════════════════════════════
 * T7-3 · HACER 5 · AJUSTE POR CONTEO (Célula C)
 *
 * Arriba, el enunciado de Olmo. Debajo, un ítem a la vez, en el orden de la
 * tabla, con su caso encima: el texto del caso y su ficha de la regla 10b, y
 * «Caso 1» a «Caso 3» como encabezado de la pregunta.
 *
 *   ELECCIÓN  sobrante o faltante, cifras, qué pasa con el costo, la cuenta
 *             de la provisión; UN SOLO TOQUE; la buena se enseña.
 *   ASIENTO   las dos líneas de cada ajuste; «Comprobar» las califica UNA vez,
 *             y el asiento aparece después.
 *
 * Once unidades; las piezas son las de los Hacer de T7-3 (hacerT7.jsx, sin
 * cambiarlo). Al terminar: onCompletar(pct, ms, detalle).
 *
 * LOTE 3: «Arma la línea» (armaLaLinea.jsx), con T7-3 H1 de molde. Los
 * ítems 2 y 5 van con casilla de cifra; en cada asiento, cada línea elige su
 * cuenta del banco (la correcta y los dos distractores de Near) y su lado.
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
export const PIEZA_C4 = { ...C4, Figura: ({ estado, item, vista }) => <FiguraBalanzaConteo estado={estado ?? C4.consecuencia(item, null)} item={item} escrita={vista?.borrador ?? null} /> };

export default function AjustePorConteo({ Marco, rotulo, titulo, acento, onCompletar, items = null, onComoSeJuega = null }) {
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
    setEscrita(null);
    setElegida(null); setR(null); setComprobado(false);
    if (t.i + 1 < cuantos) { t.setI(t.i + 1); requestAnimationFrame(() => tarjeta.current?.focus()); }
    else t.setTerminado(true);
  };

  const reiniciar = () => { veredicto.cancelar(); setEscrita(null); t.reiniciar(); setElegida(null); setR(null); setComprobado(false); setBien(0); };

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
  const estadoC4 = item.tipo === "asiento" ? null : C4.consecuencia(itemC4, elegida == null ? null : item.tipo === "cifra" ? elegida : String(elegida));
  const escritaC4 = item.tipo === "cifra" && elegida == null ? escrita : null;

  return (
    <Marco rotulo={rotulo} titulo={titulo} acento={acento}>
      <style>{CSS_C4_T72}{CSS_C4_T73H}</style>
      <style>{CSS_T7_HACER + CSS_T73_PATRON}</style>
      <div data-t7-3-h5>
        <EncabezadoHacer objetivo={H5.objetivo} consigna={sinUnSoloIntento(H5.consigna)} onComoSeJuega={onComoSeJuega} />
        <Parrafos textos={H5.enunciado} />
        <div style={{ marginBottom: "12px" }}>
          <ContadorConIntento>
            <Pulsos total={cuantos} hechos={t.i + (listo ? 1 : 0)} enCurso={t.i + 1} etiqueta="Pregunta" />
          </ContadorConIntento>
        </div>
        <div key={`caso-${item.caso}`} className="fae-t7h-entra" data-caso={item.caso + 1}>
          <Parrafos textos={CASOS_H5[item.caso].textos} dato="caso" />
          <Ficha filas={CASOS_H5[item.caso].ficha} />
        </div>
        <FigurasHacer figuras={FIGURAS_H5} respondidos={t.i + (listo ? 1 : 0)} listo={listo} />
        <TarjetaPregunta id={item.id} encabezado={CASOS_H5[item.caso].encabezado} pregunta={item.pregunta} pie={H5.pie} tarjetaRef={tarjeta} />
        {estadoC4 && (
          <FiguraBalanzaConteo estado={estadoC4} item={item} escrita={escritaC4}>
            {item.id === "estimar-provision" && <EleccionC4 opciones={item.opciones} r={r} elegida={elegida} onElegir={elegir} etiqueta={item.pregunta} contenido={(o) => <CuentaDePino nombre={o.texto} estado={estadoC4} />} />}
          </FiguraBalanzaConteo>
        )}
        {item.tipo === "eleccion" && (
          <>
            {item.id !== "estimar-provision" && <EleccionC4 opciones={item.opciones} r={r} elegida={elegida} onElegir={elegir} etiqueta={item.pregunta} />}
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
