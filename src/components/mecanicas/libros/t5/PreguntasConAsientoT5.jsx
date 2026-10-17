import { useEffect, useRef, useState } from "react";
import { X } from "lucide-react";
import { barajar } from "../../../../utils/barajar.js";
import { Pulsos, Cierre } from "../../corazon/juego.jsx";
import { TEXTO_CIERRE } from "../../bloques/marcos.jsx";
import { Responder, useTanda } from "../piezas.jsx";
import { EncabezadoHacer } from "../t7/hacerT7.jsx";
import { CSS_T7_HACER, Parrafos, TarjetaPregunta, Eleccion, Devolucion, LineasConComprobar } from "../t7/hacerT7.jsx";
import { CasillaCifra, LineasConCuenta, ContadorConIntento, DistintivoIntento } from "../t7/armaLaLinea.jsx";
import { sinUnSoloIntento, TEXTOS_ARMA } from "../../../../contabilidad/armaLaLinea.js";
import { FAE } from "../../../../theme.js";
import { SOLO_LECTOR } from "../verbos.jsx";

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
 *
 * LA ESCALERA (C2, T5 N5 v2), opcional; sin ella, todo como antes:
 *   config.escalera   casillas y asientos con escalera: al primer error, la
 *                     pista o el error reconocido y otro intento; al segundo,
 *                     la respuesta. evaluar(ítem, r, fallos) devuelve
 *                     `cerrado`. Solo el primer intento suma y va al detalle
 *                     (config.respuesta(ítem, r) da lo que se guarda). El
 *                     foco va al mensaje en cada respuesta.
 *   config.resultados un ítem "cifra" con `resultado` lleva, junto a la
 *                     casilla, estas dos opciones (Ganó o Perdió); se
 *                     comprueban juntas.
 *   config.Figura     la figura que crece, arriba: recibe { items, i, listo }.
 *   datos.consigna    la consigna aparte del enunciado (si no, es el primer
 *                     párrafo del enunciado); datos.distintivo, el texto del
 *                     distintivo junto al contador.
 * ═══════════════════════════════════════════════════════════════════════════
 */

export default function PreguntasConAsientoT5({ config, Marco, rotulo, titulo, acento, onCompletar, items = null, onComoSeJuega = null }) {
  const { datos, botones, preparar, evaluar, idLinea, puntuar, total, resumen, marca } = config;
  const { escalera = false, resultados = null, Figura = null, respuesta = (_it, v) => v } = config;
  const [fallos, setFallos] = useState(0);
  const [resultado, setResultado] = useState(null);
  const mensaje = useRef(null);
  const t = useTanda(() => items ?? preparar(barajar));
  const [elegida, setElegida] = useState(null);
  const [r, setR] = useState(null);
  const [comprobado, setComprobado] = useState(false);
  const [bien, setBien] = useState(0);
  const zonaBoton = useRef(null);
  const tarjeta = useRef(null);

  const item = t.items[t.i];
  const cuantos = t.items.length;
  const listo = item && (item.tipo === "asiento" ? comprobado : Boolean(r) && (!escalera || r.cerrado));

  useEffect(() => {
    if (t.terminado) onCompletar?.(puntuar(bien), Date.now() - t.inicio.current, t.detalle.current);
  }, [t.terminado]); // eslint-disable-line react-hooks/exhaustive-deps
  useEffect(() => { if (listo && !escalera) zonaBoton.current?.querySelector("button")?.focus(); }, [listo]); // eslint-disable-line react-hooks/exhaustive-deps
  /* Con escalera, el foco va al mensaje en cada respuesta: la pista, la respuesta o el acierto. */
  useEffect(() => { if (escalera && r) mensaje.current?.focus(); }, [r]); // eslint-disable-line react-hooks/exhaustive-deps

  const elegirConEscalera = (v) => {
    if (listo) return;
    const intento = fallos + 1;
    const entrada = item.resultado ? { resultado, valor: v } : v;
    const nuevo = evaluar(item, entrada, intento);
    /* Solo el primer intento suma y queda en el detalle. */
    if (intento === 1) {
      t.anotar(item.id, nuevo.ok, respuesta(item, entrada));
      if (nuevo.ok) setBien((n) => n + 1);
    }
    if (!nuevo.ok) setFallos(intento);
    setR(nuevo);
  };

  const elegir = (v) => {
    if (escalera) { elegirConEscalera(v); return; }
    if (r) return;
    const nuevo = evaluar(item, v);
    t.anotar(item.id, nuevo.ok, v);
    if (nuevo.ok) setBien((n) => n + 1);
    setElegida(v);
    setR(nuevo);
  };

  const comprobar = (resultados, info) => {
    if (comprobado) return;
    if (escalera) {
      let n = 0;
      for (const x of resultados.filter((y) => y.intento === 1)) { t.anotar(idLinea(item, x.linea), x.ok, x.elegido); if (x.ok) n += 1; }
      setBien((b) => b + n);
      if (info?.terminado) setComprobado(true);
      return;
    }
    let n = 0;
    for (const x of resultados) { t.anotar(idLinea(item, x.linea), x.ok, x.elegido); if (x.ok) n += 1; }
    setBien((b) => b + n);
    setComprobado(true);
  };

  const avanzar = () => {
    setElegida(null); setR(null); setComprobado(false); setFallos(0); setResultado(null);
    if (t.i + 1 < cuantos) { t.setI(t.i + 1); requestAnimationFrame(() => tarjeta.current?.focus()); }
    else t.setTerminado(true);
  };

  const reiniciar = () => { t.reiniciar(); setElegida(null); setR(null); setComprobado(false); setBien(0); setFallos(0); setResultado(null); };

  if (t.terminado) {
    return (
      <Marco rotulo={rotulo} titulo={titulo} acento={acento}>
        <Cierre pct={Math.round(puntuar(bien))} onReiniciar={reiniciar} textoReiniciar="Otra vez">
          <p data-resumen style={TEXTO_CIERRE}>{resumen(bien, total)}</p>
        </Cierre>
      </Marco>
    );
  }

  const [consigna, ...resto] = datos.consigna ? [datos.consigna, ...datos.enunciado] : datos.enunciado;
  return (
    <Marco rotulo={rotulo} titulo={titulo} acento={acento}>
      <style>{CSS_T7_HACER}</style>
      <div {...{ [`data-${marca}`]: true }}>
        <EncabezadoHacer objetivo={datos.objetivo} consigna={sinUnSoloIntento(consigna)} onComoSeJuega={onComoSeJuega} />
        {resto.length > 0 && <div style={{ marginBottom: "12px" }}><Parrafos textos={resto} /></div>}
        {Figura && <Figura items={t.items} i={t.i} listo={Boolean(listo)} />}
        <div style={{ marginBottom: "12px" }}>
          <DistintivoIntento.Provider value={datos.distintivo ?? TEXTOS_ARMA.unIntento}>
            <ContadorConIntento>
              <Pulsos total={cuantos} hechos={t.i + (listo ? 1 : 0)} enCurso={t.i + 1} etiqueta="Pregunta" />
            </ContadorConIntento>
          </DistintivoIntento.Provider>
        </div>
        {item.intro && <div style={{ marginBottom: "12px" }}><Parrafos textos={[item.intro]} dato="intro" /></div>}
        <TarjetaPregunta id={item.id} pregunta={item.pregunta} pie={datos.pie} tarjetaRef={tarjeta} />
        {item.tipo === "eleccion" && (
          <>
            <Eleccion opciones={item.opciones} r={r} elegida={elegida} onElegir={elegir} etiqueta={item.pregunta} />
            <Devolucion r={r} lectorError={r && !r.ok ? `Incorrecto. Iba aquí: ${r.textoCorrecta}. ` : null} />
          </>
        )}
        {item.tipo === "cifra" && !escalera && (
          <>
            <CasillaCifra key={item.id} id={item.id} onComprobar={elegir} comprobado={Boolean(r)} etiqueta={item.pregunta} iba={r && !r.ok ? r.textoCorrecta : null} />
            <Devolucion r={r} lectorError={r && !r.ok ? "Incorrecto. " : null} />
          </>
        )}
        {item.tipo === "cifra" && escalera && (
          <>
            <CasillaCifra key={item.id} id={item.id} onComprobar={elegir} comprobado={Boolean(listo)} etiqueta={item.pregunta} iba={listo && r && !r.ok ? r.textoCorrecta : null}
              extra={item.resultado && resultados ? (
                <ElegirResultado opciones={resultados} elegido={resultado} bueno={listo ? item.resultado : null}
                  deshabilitado={Boolean(listo)} onElegir={setResultado} etiqueta={item.pregunta} />
              ) : null}
              extraListo={!item.resultado || resultado !== null} />
            <div ref={mensaje} tabIndex={-1} data-mensaje-escalera style={{ outline: "none" }}>
              <Devolucion key={fallos + (listo ? 10 : 0)} r={r} lectorError={r && !r.ok ? "Incorrecto. " : null} />
            </div>
          </>
        )}
        {item.tipo === "asiento" && (item.lineas.every((l) => l.banco) ? (
          <LineasConCuenta key={item.id} lineas={item.orden.map((id) => item.lineas.find((l) => l.id === id))}
            asiento={item.lineas} onComprobar={comprobar} comprobado={comprobado} escalera={escalera} />
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

/*
 * Dos opciones de un toque junto a la casilla (Ganó o Perdió), que se pueden
 * cambiar mientras el ítem sigue abierto. Cerrado, la buena lleva ✓ y la
 * elegida mal, la X de lucide en coral: el veredicto va con forma.
 */
function ElegirResultado({ opciones, elegido, bueno, deshabilitado, onElegir, etiqueta }) {
  return (
    <div role="group" aria-label={etiqueta} data-elegir-resultado style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "10px", marginBottom: "10px" }}>
      {opciones.map((o) => {
        const esta = elegido === o.valor;
        const bien = bueno !== null && o.valor === bueno;
        const mal = bueno !== null && esta && o.valor !== bueno;
        return (
          <button key={o.valor} type="button" data-resultado={o.valor} aria-pressed={esta} disabled={deshabilitado} onClick={() => onElegir(o.valor)}
            style={{
              appearance: "none", minHeight: "44px", padding: "10px 12px", borderRadius: "12px", cursor: deshabilitado ? "default" : "pointer",
              border: `${esta || bien ? 2 : 1}px solid ${mal ? FAE.coral : esta || bien ? "#F8F9FA" : "rgba(248,249,250,0.22)"}`,
              background: esta ? "rgba(184,196,212,0.12)" : "rgba(14,27,46,0.5)", color: FAE.text,
              fontFamily: "Sora, sans-serif", fontSize: "14px", fontWeight: 600,
            }}>
            {bien && <span aria-hidden="true" style={{ marginRight: "6px" }}>✓</span>}
            {mal && <span aria-hidden="true" data-marca-mal style={{ display: "inline-flex", verticalAlign: "-3px", marginRight: "6px", color: FAE.coral }}><X size={16} strokeWidth={2.5} /></span>}
            {bien && <span style={SOLO_LECTOR}>Correcta: </span>}
            {mal && <span style={SOLO_LECTOR}>Tu respuesta, incorrecta: </span>}
            {o.texto}
          </button>
        );
      })}
    </div>
  );
}
