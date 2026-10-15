import { useEffect, useRef, useState } from "react";
import { barajar } from "../../../../utils/barajar.js";
import { FAE } from "../../../../theme.js";
import { H2, FICHAS_H2, BOTON_H2, resumenH2 } from "../../../../data/contabilidadT7_1_h2.js";
import { prepararH2, evaluarH2, idDeLinea, puntuarH2, TOTAL_H2 } from "../../../../contabilidad/t7H2.js";
import { Pulsos, Cierre } from "../../corazon/juego.jsx";
import { TEXTO_CIERRE } from "../../bloques/marcos.jsx";
import { Responder, useTanda } from "../piezas.jsx";
import { Encabezado } from "../tema1/encabezado.jsx";
import { CSS_T7_HACER, Devolucion } from "./hacerT7.jsx";
import { CasillaCifra, LineasConCuenta, ContadorConIntento } from "./armaLaLinea.jsx";
import { sinUnSoloIntento } from "../../../../contabilidad/armaLaLinea.js";

/*
 * ═══════════════════════════════════════════════════════════════════════════
 * T7-1 · HACER 2 · ARMA LA FACTURA (Célula C)
 *
 * Arriba, siempre a la vista: el enunciado de Near y las fichas de la compra y
 * de la venta, porque cada cálculo las usa. Debajo, un ítem a la vez, en el
 * orden de la tabla:
 *
 *   CÁLCULO  la pregunta y una casilla de cifra (CasillaCifra). «Comprobar»
 *            la califica UNA vez y se bloquea. Debajo, el acierto de Near; si
 *            la cifra es la de un distractor, su retroalimentación y la
 *            respuesta; si no, la respuesta y el porqué (evaluarCifra).
 *   ASIENTO  «Arma la línea» (LineasConCuenta): cuatro líneas, barajadas; en
 *            cada una se elige la cuenta de su banco (la correcta y dos
 *            distractores de Near) y el lado. «Comprobar» las califica UNA
 *            vez; bajo cada línea mal armada, cuál era y por qué no era la
 *            elegida. Después, el asiento completo con sus sumas.
 *
 * Doce unidades, doce aciertos posibles, sin arrastre: las cifras son fijas.
 * El error va en coral, que el canon reserva para el error. Lo compartido
 * (Pulsos, Cierre, Encabezado, Responder, y las piezas de «Arma la línea» y
 * de hacerT7.jsx) se usa sin cambiarlo; lo propio es la tarjeta de la
 * pregunta y las fichas.
 *
 * LOTE 3: molde de T7-3 H1 (DescuentoEnFactura.jsx). El distintivo «Un
 * intento» junto al contador reemplaza la frase de la consigna.
 *
 * Al terminar: onCompletar(pct, ms, detalle). Evaluativa: el motor escala los
 * 25 FP con el porcentaje, con piso del 50 %.
 * ═══════════════════════════════════════════════════════════════════════════
 */

const INTER = "Inter, sans-serif";
const APAGADO = "rgba(248,249,250,0.6)";

const CSS = `
@keyframes fae-t7h2-fundido { from { opacity: 0; } to { opacity: 1; } }
.fae-t7h2-entra { animation: fae-t7h2-fundido 150ms ease-out both; }
@media (prefers-reduced-motion: reduce) { .fae-t7h2-entra { animation: none !important; } }
`;

const TEXTO = { margin: 0, fontFamily: INTER, fontSize: "15px", lineHeight: "22px", color: FAE.text };

function Fichas() {
  const ficha = (f) => (
    <div key={f.titulo} data-ficha={f.titulo} style={{ padding: "10px 12px", borderRadius: "11px", border: "1px solid rgba(248,249,250,0.12)", background: "rgba(10,20,34,0.35)" }}>
      <p style={{ margin: "0 0 6px", fontFamily: "Sora, sans-serif", fontSize: "12px", fontWeight: 700, letterSpacing: "0.12em", color: FAE.ambar }}>{f.titulo.toUpperCase()}</p>
      <dl style={{ margin: 0, display: "grid", gridTemplateColumns: "auto minmax(0, 1fr)", columnGap: "10px", rowGap: "3px" }}>
        {FICHAS_H2.campos.map((c, k) => (
          <div key={c} style={{ display: "contents" }}>
            <dt style={{ fontFamily: INTER, fontSize: "12.5px", color: APAGADO }}>{c}</dt>
            <dd style={{ margin: 0, fontFamily: INTER, fontSize: "13px", color: FAE.text, overflowWrap: "anywhere" }}>{f.valores[k]}</dd>
          </div>
        ))}
      </dl>
    </div>
  );
  return (
    <div data-fichas style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(min(100%, 220px), 1fr))", gap: "8px", margin: "0 0 14px" }}>
      {ficha(FICHAS_H2.compra)}
      {ficha(FICHAS_H2.venta)}
    </div>
  );
}

export default function ArmaLaFactura({ Marco, rotulo, titulo, acento, onCompletar, items = null, onComoSeJuega = null }) {
  const t = useTanda(() => items ?? prepararH2(barajar));
  const [r, setR] = useState(null);
  const [comprobado, setComprobado] = useState(false);
  const [bien, setBien] = useState(0);
  const zonaBoton = useRef(null);
  const tarjeta = useRef(null);

  const item = t.items[t.i];
  const cuantos = t.items.length;
  const listo = item && (item.tipo === "asiento" ? comprobado : Boolean(r));

  useEffect(() => {
    if (t.terminado) onCompletar?.(puntuarH2(bien), Date.now() - t.inicio.current, t.detalle.current);
  }, [t.terminado]); // eslint-disable-line react-hooks/exhaustive-deps
  useEffect(() => { if (listo) zonaBoton.current?.querySelector("button")?.focus(); }, [listo]);

  const elegir = (v) => {
    if (r) return;
    const nuevo = evaluarH2(item, v);
    t.anotar(item.id, nuevo.ok, v);
    if (nuevo.ok) setBien((n) => n + 1);
    setR(nuevo);
  };

  const comprobar = (resultados) => {
    if (comprobado) return;
    let n = 0;
    for (const x of resultados) { t.anotar(idDeLinea(item, x.linea), x.ok, x.elegido); if (x.ok) n += 1; }
    setBien((b) => b + n);
    setComprobado(true);
  };

  const avanzar = () => {
    setR(null); setComprobado(false);
    if (t.i + 1 < cuantos) { t.setI(t.i + 1); requestAnimationFrame(() => tarjeta.current?.focus()); }
    else t.setTerminado(true);
  };

  const reiniciar = () => { t.reiniciar(); setR(null); setComprobado(false); setBien(0); };

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
      <style>{CSS + CSS_T7_HACER}</style>
      <div data-h2>
        <Encabezado consigna={sinUnSoloIntento(H2.consigna)} onComoSeJuega={onComoSeJuega} />
        <div data-enunciado style={{ margin: "0 0 10px" }}>
          {H2.enunciado.map((p) => <p key={p} style={{ ...TEXTO, fontSize: "14px", lineHeight: "21px", margin: "0 0 6px" }}>{p}</p>)}
        </div>
        <Fichas />
        <div style={{ marginBottom: "12px" }}>
          <ContadorConIntento>
            <Pulsos total={cuantos} hechos={t.i + (listo ? 1 : 0)} enCurso={t.i + 1} etiqueta="Pregunta" />
          </ContadorConIntento>
        </div>

        <div key={item.id} className="fae-t7h2-entra" data-item={item.id} style={{
          margin: "0 0 12px", padding: "11px 13px", borderRadius: "11px",
          background: "rgba(184,196,212,0.12)", borderLeft: "3px solid #B8C4D4",
        }}>
          <p ref={tarjeta} tabIndex={-1} data-pregunta style={{ ...TEXTO, outline: "none" }}>{item.pregunta}</p>
          <p data-pie style={{ margin: "4px 0 0", fontFamily: INTER, fontSize: "12px", color: APAGADO }}>{H2.pie}</p>
        </div>

        {item.tipo === "cifra" && (
          <>
            <CasillaCifra key={item.id} id={item.id} onComprobar={elegir} comprobado={Boolean(r)} etiqueta={item.pregunta} />
            <Devolucion r={r} lectorError={r && !r.ok ? "Incorrecto. " : null} />
          </>
        )}
        {item.tipo === "asiento" && (
          <LineasConCuenta key={`lineas-${item.id}`} lineas={item.orden.map((id) => item.lineas.find((l) => l.id === id))}
            asiento={item.lineas} onComprobar={comprobar} comprobado={comprobado} />
        )}
      </div>

      {listo && (
        <div ref={zonaBoton}>
          <Responder onClick={avanzar}>{t.i + 1 === cuantos ? BOTON_H2.verResumen : BOTON_H2.siguiente}</Responder>
        </div>
      )}
    </Marco>
  );
}
