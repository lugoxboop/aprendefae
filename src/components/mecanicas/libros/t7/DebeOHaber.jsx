import { useEffect, useRef, useState } from "react";
import { barajar } from "../../../../utils/barajar.js";
import { FAE } from "../../../../theme.js";
import { H1, OPCIONES_H1, BOTON_H1, resumenH1 } from "../../../../data/contabilidadT7_2_h1.js";
import { sortearH1, evaluarH1, puntuarH1, nombreDeOpcionH1 } from "../../../../contabilidad/t7_2H1.js";
import { Opcion, Opciones, Pulsos, Cierre } from "../../corazon/juego.jsx";
import { TEXTO_CIERRE } from "../../bloques/marcos.jsx";
import { Responder, useTanda } from "../piezas.jsx";
import { SOLO_LECTOR } from "../verbos.jsx";
import { Encabezado } from "../tema1/encabezado.jsx";

/*
 * ═══════════════════════════════════════════════════════════════════════════
 * T7-2 · HACER 1 · ¿DEBE O HABER? (Célula C)
 *
 * La misma forma que H1 de T7-1 («¿Qué cuenta se mueve?»): un hecho a la vez,
 * con su pie de fuente, y debajo las dos opciones, «Debe» y «Haber», lado a
 * lado y siempre en ese orden. UN SOLO TOQUE por hecho: al tocar, las
 * opciones se bloquean, la elegida queda en acierto o en error y, si falló,
 * la buena se enseña. Debajo, la devolución: con acierto, «Correcto.» y el
 * porqué; con error, el porqué. El error va en coral.
 *
 * Todo lo que se toca es de las piezas compartidas (Opcion, Pulsos, Cierre,
 * Encabezado, Responder), sin cambiarlas.
 *
 * Al terminar: onCompletar(pct, ms, detalle). Exploratoria: el motor paga los
 * 10 FP al terminar; el porcentaje va para el panel docente.
 * ═══════════════════════════════════════════════════════════════════════════
 */

const INTER = "Inter, sans-serif";
const APAGADO = "rgba(248,249,250,0.6)";

const CSS = `
@keyframes fae-t72h1-fundido { from { opacity: 0; } to { opacity: 1; } }
.fae-t72h1-entra { animation: fae-t72h1-fundido 150ms ease-out both; }
@media (prefers-reduced-motion: reduce) { .fae-t72h1-entra { animation: none !important; } }
`;

export default function DebeOHaber({ Marco, rotulo, titulo, acento, onCompletar, items = null, onComoSeJuega = null }) {
  const t = useTanda(() => items ?? sortearH1(barajar));
  const [elegida, setElegida] = useState(null);
  const [r, setR] = useState(null);
  const [bien, setBien] = useState(0);
  const zonaBoton = useRef(null);
  const tarjeta = useRef(null);

  const item = t.items[t.i];
  const cuantos = t.items.length;

  useEffect(() => {
    if (t.terminado) onCompletar?.(puntuarH1(bien, cuantos), Date.now() - t.inicio.current, t.detalle.current);
  }, [t.terminado]); // eslint-disable-line react-hooks/exhaustive-deps
  useEffect(() => { if (r) zonaBoton.current?.querySelector("button")?.focus(); }, [r]);

  const responder = (id) => {
    if (r) return;
    const nuevo = evaluarH1(item, id);
    /* Lo que se guarda en el error es la cuenta elegida: eso le dice algo al docente. */
    t.anotar(item.id, nuevo.ok, id);
    if (nuevo.ok) setBien((n) => n + 1);
    setElegida(id);
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
        <Cierre pct={Math.round(puntuarH1(bien, cuantos))} onReiniciar={reiniciar} textoReiniciar="Otra vez">
          <p data-resumen style={TEXTO_CIERRE}>{resumenH1(bien, cuantos)}</p>
        </Cierre>
      </Marco>
    );
  }

  const estadoDe = (id) => {
    if (!r) return null;
    if (id === elegida) return r.ok ? "correcta" : "incorrecta";
    if (id === r.correcta) return "revelada";
    return null;
  };

  return (
    <Marco rotulo={rotulo} titulo={titulo} acento={acento}>
      <style>{CSS}</style>
      <div data-t7-2-h1>
        <Encabezado consigna={H1.consigna.join(" ")} onComoSeJuega={onComoSeJuega} />
        <div style={{ marginBottom: "12px" }}>
          <Pulsos total={cuantos} hechos={t.i + (r ? 1 : 0)} enCurso={t.i + 1} etiqueta="Hecho" />
        </div>

        {/* El hecho y su pie. */}
        <div key={item.id} className="fae-t72h1-entra" data-tarjeta-hecho={item.id} style={{
          margin: "0 0 12px", padding: "11px 13px", borderRadius: "11px",
          background: "rgba(184,196,212,0.12)", borderLeft: "3px solid #B8C4D4",
        }}>
          <p ref={tarjeta} tabIndex={-1} data-hecho style={{ margin: 0, fontFamily: INTER, fontSize: "15px", lineHeight: "22px", color: FAE.text, outline: "none" }}>
            {item.texto}
          </p>
          <p data-pie style={{ margin: "4px 0 0", fontFamily: INTER, fontSize: "12px", color: APAGADO }}>{item.pie}</p>
        </div>

        <div role="group" aria-label={H1.nombre}>
          <Opciones columnas="repeat(2, minmax(0, 1fr))">
            {OPCIONES_H1.map((o) => (
              <span key={o.id} data-opcion={o.id} style={{ display: "contents" }}>
                <Opcion ancho deshabilitada={Boolean(r)} estado={estadoDe(o.id)} onClick={() => responder(o.id)}>
                  {o.nombre}
                </Opcion>
              </span>
            ))}
          </Opciones>
        </div>

        {/* La devolución: región viva. */}
        <div data-retro aria-live="polite" aria-atomic="true">
          {r && (
            <div className="fae-t72h1-entra" data-panel={r.ok ? "acierto" : "error"} style={{
              marginTop: "12px", padding: "11px 13px", borderRadius: "11px",
              background: r.ok ? "rgba(184,196,212,0.13)" : "rgba(231,111,81,0.13)",
              borderLeft: `3px solid ${r.ok ? "#B8C4D4" : FAE.coral}`,
            }}>
              {!r.ok && <span style={SOLO_LECTOR}>{`Incorrecto. La respuesta es ${nombreDeOpcionH1(r.correcta)}. `}</span>}
              {r.textos.map((x) => (
                <p key={x} data-texto-retro style={{ margin: "0 0 4px", fontFamily: INTER, fontSize: "15px", lineHeight: "22px", color: FAE.text, fontWeight: x === r.textos[0] && r.ok ? 700 : 400 }}>{x}</p>
              ))}
            </div>
          )}
        </div>
      </div>

      {r && (
        <div ref={zonaBoton}>
          <Responder onClick={avanzar}>{t.i + 1 === cuantos ? BOTON_H1.verResumen : BOTON_H1.siguiente}</Responder>
        </div>
      )}
    </Marco>
  );
}
