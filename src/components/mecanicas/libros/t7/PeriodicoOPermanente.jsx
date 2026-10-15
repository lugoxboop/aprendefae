import { useEffect, useRef, useState } from "react";
import { barajar } from "../../../../utils/barajar.js";
import { H4, BOTON_H4, VERSIONES, resumenH4 } from "../../../../data/contabilidadT7_2_h4.js";
import { DEBE } from "../../../../data/contabilidad.js";
import { prepararH4, evaluarH4, puntuarH4, TOTAL_H4 } from "../../../../contabilidad/t7_2H4.js";
import { Pulsos, Cierre } from "../../corazon/juego.jsx";
import { TEXTO_CIERRE } from "../../bloques/marcos.jsx";
import { Responder, useTanda } from "../piezas.jsx";
import { Encabezado } from "../tema1/encabezado.jsx";
import { CSS_T7_HACER, LADOS_T7, Parrafos, TarjetaPregunta, Eleccion, Devolucion } from "./hacerT7.jsx";
import { ContadorConIntento } from "./armaLaLinea.jsx";
import { sinUnSoloIntento } from "../../../../contabilidad/armaLaLinea.js";

/*
 * ═══════════════════════════════════════════════════════════════════════════
 * T7-2 · HACER 4 · ¿PERIÓDICO O PERMANENTE? (Célula C)
 *
 * Arriba, el enunciado. Debajo, un ítem a la vez, en el orden de la tabla:
 * la pregunta y las dos versiones del mismo hecho, APILADAS, una sobre otra
 * (patrón 06 B), «Versión 1» arriba y «Versión 2» abajo; qué sistema queda
 * en cada una se baraja en cada intento. UN SOLO TOQUE: la tarjeta tocada
 * queda en acierto o en error y, si falló, la buena se enseña.
 *
 * Cada tarjeta es una opción de la elección compartida (hacerT7.jsx, sin
 * cambiarla): adentro va su nombre y, según el ítem, un asiento sin cifras
 * (cada línea con su lado) o un texto. Si la versión tiene dos asientos, van
 * uno debajo del otro, separados por una raya.
 *
 * Cinco unidades. Al terminar: onCompletar(pct, ms, detalle).
 * ═══════════════════════════════════════════════════════════════════════════
 */

const CSS_H4 = `
.t72h4-tarjeta { display: grid; gap: 8px; min-width: 0; }
.t72h4-nombre { display: block; font: 600 14px/1.3 Sora, Inter, sans-serif; color: #F8F9FA; }
.t72h4-texto { display: block; font: 400 15px/22px Inter, sans-serif; color: #F8F9FA; overflow-wrap: anywhere; }
.t72h4-asiento { display: grid; gap: 4px; }
.t72h4-asiento + .t72h4-asiento { padding-top: 8px; border-top: 1px solid rgba(184,196,212,0.35); }
.t72h4-linea { display: grid; grid-template-columns: minmax(0, 1fr) auto; column-gap: 12px; align-items: baseline; }
.t72h4-cuenta { font: 400 15px/21px Inter, sans-serif; color: #F8F9FA; overflow-wrap: anywhere; }
.t72h4-haber .t72h4-cuenta { padding-left: 16px; }
.t72h4-lado { font: 500 13px/21px Inter, sans-serif; color: rgba(248,249,250,0.72); white-space: nowrap; }
`;

function Tarjeta({ nombre, version }) {
  return (
    <span className="t72h4-tarjeta" data-version={nombre}>
      <span className="t72h4-nombre">{nombre}</span>
      {version.texto
        ? <span className="t72h4-texto">{version.texto}</span>
        : version.asientos.map((asiento, k) => (
          <span key={k} className="t72h4-asiento" data-asiento={k + 1}>
            {asiento.map((l) => (
              <span key={l.cuenta} className={`t72h4-linea${l.lado === DEBE ? "" : " t72h4-haber"}`} data-linea-sin-cifra={l.lado}>
                <span className="t72h4-cuenta">{l.cuenta}</span>
                <span className="t72h4-lado">{l.lado === DEBE ? LADOS_T7.debe : LADOS_T7.haber}</span>
              </span>
            ))}
          </span>
        ))}
    </span>
  );
}

export default function PeriodicoOPermanente({ Marco, rotulo, titulo, acento, onCompletar, items = null, onComoSeJuega = null }) {
  const t = useTanda(() => items ?? prepararH4(barajar));
  const [elegida, setElegida] = useState(null);
  const [r, setR] = useState(null);
  const [bien, setBien] = useState(0);
  const zonaBoton = useRef(null);
  const tarjeta = useRef(null);

  const item = t.items[t.i];
  const cuantos = t.items.length;

  useEffect(() => {
    if (t.terminado) onCompletar?.(puntuarH4(bien), Date.now() - t.inicio.current, t.detalle.current);
  }, [t.terminado]); // eslint-disable-line react-hooks/exhaustive-deps
  useEffect(() => { if (r) zonaBoton.current?.querySelector("button")?.focus(); }, [r]);

  const elegir = (s) => {
    if (r) return;
    const nuevo = evaluarH4(item, s);
    t.anotar(item.id, nuevo.ok, s);
    if (nuevo.ok) setBien((n) => n + 1);
    setElegida(s);
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
        <Cierre pct={Math.round(puntuarH4(bien))} onReiniciar={reiniciar} textoReiniciar="Otra vez">
          <p data-resumen style={TEXTO_CIERRE}>{resumenH4(bien, TOTAL_H4)}</p>
        </Cierre>
      </Marco>
    );
  }

  const opciones = item.orden.map((s, k) => ({ valor: s, texto: <Tarjeta nombre={VERSIONES[k]} version={item.versiones[s]} /> }));

  return (
    <Marco rotulo={rotulo} titulo={titulo} acento={acento}>
      <style>{CSS_T7_HACER}</style>
      <style>{CSS_H4}</style>
      <div data-t7-2-h4>
        <Encabezado consigna={sinUnSoloIntento(H4.consigna)} onComoSeJuega={onComoSeJuega} />
        <Parrafos textos={H4.enunciado} />
        <div style={{ marginBottom: "12px" }}>
          <ContadorConIntento>
            <Pulsos total={cuantos} hechos={t.i + (r ? 1 : 0)} enCurso={t.i + 1} etiqueta="Pregunta" />
          </ContadorConIntento>
        </div>
        <TarjetaPregunta id={item.id} pregunta={item.pregunta} pie={H4.pie} tarjetaRef={tarjeta} />
        <Eleccion key={item.id} opciones={opciones} r={r} elegida={elegida} onElegir={elegir} etiqueta={item.pregunta} />
        <Devolucion r={r} lectorError={r && !r.ok ? `Incorrecto. La respuesta es la ${r.textoCorrecta}. ` : null} />
      </div>
      {r && (
        <div ref={zonaBoton}>
          <Responder onClick={avanzar}>{t.i + 1 === cuantos ? BOTON_H4.verResumen : BOTON_H4.siguiente}</Responder>
        </div>
      )}
    </Marco>
  );
}
