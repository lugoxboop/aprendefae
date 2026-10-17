import { useEffect, useRef, useState } from "react";
import { barajar } from "../../../../utils/barajar.js";
import { H6, FICHA_H6, COMPRA_RESUELTA_H6, BOTON_H6, resumenH6 } from "../../../../data/contabilidadT7_1_h6.js";
import { prepararH6, evaluarH6, idLineaH6, puntuarH6, TOTAL_H6 } from "../../../../contabilidad/t7H6.js";
import { Pulsos, Cierre } from "../../corazon/juego.jsx";
import { TEXTO_CIERRE } from "../../bloques/marcos.jsx";
import { AsientoEnLineas, Responder, useTanda } from "../piezas.jsx";
import { EncabezadoHacer } from "./hacerT7.jsx";
import { CSS_T7_HACER, Ficha, Parrafos, TarjetaPregunta, Devolucion } from "./hacerT7.jsx";
import { leerCifra } from "../../../../contabilidad/elCierreCompleto.js";
import { CONSECUENCIA_C4 as C4, escribiendoH6 } from "../../../../contabilidad/c4/t71h6_c4.js";
import { CSS_T71C4, CSS_T71_FUERA, FiguraNotaCredito } from "./c4T71.jsx";
import { EleccionC4, useVeredictoC4 } from "./FigurasC4T7_2.jsx";
import { CasillaCifra, LineasConCuenta, ContadorConIntento } from "./armaLaLinea.jsx";
import { sinUnSoloIntento } from "../../../../contabilidad/armaLaLinea.js";
import FiguraAcumulada from "./FiguraAcumulada.jsx";
import { FIGURA_T7_1_H6, cerradosDe } from "../../../../contabilidad/figuraAcumulada.js";

/*
 * ═══════════════════════════════════════════════════════════════════════════
 * T7-1 · HACER 6 · LA DEVOLUCIÓN EN DOS LIBROS (Célula C)
 *
 * Arriba, siempre a la vista: el enunciado, el asiento de la compra ya
 * resuelto en los dos libros (en modo lectura) y la ficha de la devolución.
 * Debajo, un ítem a la vez, en el orden de la tabla:
 *
 *   PREGUNTA  tres opciones barajadas, UN SOLO TOQUE; la buena se enseña
 *             (ítems 1 y 2).
 *   CIFRA     casilla de cifra (ítem 3): «Comprobar» la califica UNA vez.
 *   ASIENTO   «Arma la línea»: cuatro líneas barajadas; en cada una se elige
 *             la cuenta de su banco (la correcta y dos distractores de Near)
 *             y el lado, y «Comprobar» las califica UNA vez. Bajo cada línea
 *             mal armada, cuál era y por qué no era la elegida; las sumas
 *             (986.000 = 986.000) aparecen después de comprobar.
 *
 * Once unidades (lote 3: los ítems 4 y 6 de la v1 se quitaron, la mesa ya
 * pide esa cuenta); la forma y las piezas son las de H1-H5 (hacerT7.jsx) y
 * las de «Arma la línea» (armaLaLinea.jsx), con T7-3 H1 de molde.
 * Al terminar: onCompletar(pct, ms, detalle).
 *
 * LOTE 5 (L): arriba del ítem, la figura acumulada (FiguraAcumulada.jsx): la
 * cuenta de la devolución se arma con los ítems 1 a 3, y cada libro suma su
 * asiento al comprobarlo.
 * ═══════════════════════════════════════════════════════════════════════════
 */

/*
 * C4 · «TODA DECISIÓN SE PINTA» (Watari, sección t71-h6; precedente de #424:
 * la pieza no monta el motor). Debajo de la pregunta, la nota crédito de El
 * Nogal (FiguraNotaCredito, c4T71.jsx): al tocar una cifra, o al comprobar la
 * escrita, la cifra entra a su renglón y la nota dice qué parte de lo
 * devuelto es; el veredicto llega ESPERA_C4 después. Mientras se escribe, la
 * figura solo muestra la cifra (C4-1 de Mello). Los asientos siguen como en
 * main; la figura acumulada no cambia.
 *
 * El contrato de la figura del motor, para la prueba C5 de consecuencia-c.
 */
export const PIEZA_C4 = {
  ...C4,
  Figura: ({ estado, item, vista }) => (
    <FiguraNotaCredito estado={vista?.valor == null && vista?.borrador != null ? escribiendoH6(item, vista.borrador) : estado ?? C4.consecuencia(item, null)} />
  ),
};

export default function DevolucionDosLibros({ Marco, rotulo, titulo, acento, onCompletar, items = null, onComoSeJuega = null }) {
  const t = useTanda(() => items ?? prepararH6(barajar));
  const [elegida, setElegida] = useState(null);
  const [r, setR] = useState(null);
  const [comprobado, setComprobado] = useState(false);
  const [bien, setBien] = useState(0);
  /* C4: la cifra que se va escribiendo (la figura solo la muestra) y el reloj del veredicto. */
  const [escrita, setEscrita] = useState(null);
  const veredicto = useVeredictoC4();
  const zonaBoton = useRef(null);
  const tarjeta = useRef(null);

  const item = t.items[t.i];
  const cuantos = t.items.length;
  const listo = item && (item.tipo === "asiento" ? comprobado : Boolean(r));

  useEffect(() => {
    if (t.terminado) onCompletar?.(puntuarH6(bien), Date.now() - t.inicio.current, t.detalle.current);
  }, [t.terminado]); // eslint-disable-line react-hooks/exhaustive-deps
  useEffect(() => { if (listo) zonaBoton.current?.querySelector("button")?.focus(); }, [listo]);

  /* C4: el toque (o «Comprobar») es la consecuencia y el único intento, que se anota ya; el veredicto llega después. */
  const elegir = (v) => {
    if (r || elegida != null) return;
    const nuevo = evaluarH6(item, v);
    t.anotar(item.id, nuevo.ok, v);
    if (nuevo.ok) setBien((n) => n + 1);
    setElegida(v);
    veredicto.programar(() => setR(nuevo));
  };

  const comprobar = (resultados) => {
    if (comprobado) return;
    let n = 0;
    for (const x of resultados) { t.anotar(idLineaH6(item, x.linea), x.ok, x.elegido); if (x.ok) n += 1; }
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
        <Cierre pct={Math.round(puntuarH6(bien))} onReiniciar={reiniciar} textoReiniciar="Otra vez">
          <p data-resumen style={TEXTO_CIERRE}>{resumenH6(bien, TOTAL_H6)}</p>
        </Cierre>
      </Marco>
    );
  }

  const itemC4 = C4.items.find((x) => x.id === item.id);

  return (
    <Marco rotulo={rotulo} titulo={titulo} acento={acento}>
      <style>{CSS_T7_HACER}{CSS_T71C4}{CSS_T71_FUERA}</style>
      <div data-h6>
        <EncabezadoHacer objetivo={H6.objetivo} consigna={sinUnSoloIntento(H6.consigna)} onComoSeJuega={onComoSeJuega} />
        <Parrafos textos={H6.enunciado} />
        <div data-compra-resuelta style={{ display: "grid", gap: "8px", margin: "0 0 12px" }}>
          <AsientoEnLineas lineas={COMPRA_RESUELTA_H6.comprador} rotulo="COMPRADOR" acento="#A8B6C8" />
          <AsientoEnLineas lineas={COMPRA_RESUELTA_H6.vendedor} rotulo="VENDEDOR" acento="#A8B6C8" />
        </div>
        <Ficha filas={FICHA_H6} />
        <FiguraAcumulada figura={FIGURA_T7_1_H6} cerrados={cerradosDe(t.i, Boolean(listo))} listo={Boolean(listo)} />
        <div style={{ marginBottom: "12px" }}>
          <ContadorConIntento>
            <Pulsos total={cuantos} hechos={t.i + (listo ? 1 : 0)} enCurso={t.i + 1} etiqueta="Pregunta" />
          </ContadorConIntento>
        </div>
        <TarjetaPregunta id={item.id} encabezado={item.encabezado ?? null} pregunta={item.pregunta} pie={H6.pie} tarjetaRef={tarjeta} />
        {item.tipo !== "asiento" && (
          <FiguraNotaCredito estado={item.tipo === "cifra" && elegida == null && escrita != null
            ? escribiendoH6(itemC4, escrita) : C4.consecuencia(itemC4, elegida)} />
        )}
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
          <Responder onClick={avanzar}>{t.i + 1 === cuantos ? BOTON_H6.verResumen : BOTON_H6.siguiente}</Responder>
        </div>
      )}
    </Marco>
  );
}
