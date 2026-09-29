import { useEffect, useRef, useState } from "react";
import { FAE } from "../../../theme.js";
import { barajar } from "../../../utils/barajar.js";
import { IMPUESTOS_SELLO, SELLOS, nombreSello, porcentaje, retroSello } from "../../../data/politicaFiscal.js";
import { Tesoreria, Retro, Pulsos, Cierre, Avanzar, TEXTO_CIERRE } from "./tesoreria.jsx";

/*
 * ACTIVIDAD 2 — "Directos e indirectos". Comprender · Medio.
 *
 * Un sello por impuesto: Directo, Indirecto, Tasa o tarifa o Contribución. Ya
 * no se pregunta si es un tributo —eso fue el juego 1— sino sobre qué recae.
 *
 * Los ocho salen en cada partida, en orden barajado: la ficha no pide sorteo
 * de subconjunto, y el orden de la tabla tiene un patrón que se aprendería.
 *
 * LA RESPUESTA DE CADA IMPUESTO SE LEE DEL DATO. La categoría correcta es el
 * campo `categoria` de su fila en politicaFiscal.js, y ni la mecánica ni la
 * puntuación ni la devolución la tienen escrita en otro sitio. Es lo que hace
 * que el impuesto de timbre —pendiente de confirmar con el profesor— se
 * corrija con una sola edición y sin tocar este archivo.
 *
 * Puntuación: aciertos / 8 × 100. Ocho divide a cien exacto (12,5), pero se
 * calcula igual que en los otros seis: una división al final.
 */

export default function DirectosIndirectos({ onCompletar }) {
  const [orden, setOrden] = useState(() => barajar(IMPUESTOS_SELLO));
  const [i, setI] = useState(0);
  const [sello, setSello] = useState(null);
  const [aciertos, setAciertos] = useState(0);
  const [terminado, setTerminado] = useState(false);

  const sellados = useRef(new Set());
  const detalle = useRef([]);
  const inicio = useRef(Date.now());

  const actual = orden[i];
  const pct = porcentaje(aciertos, orden.length);

  useEffect(() => {
    if (terminado) onCompletar?.(pct, Date.now() - inicio.current, detalle.current);
  }, [terminado]);

  const sellar = (categoria) => {
    if (!actual || sellados.current.has(actual.id)) return;
    sellados.current.add(actual.id);
    const ok = categoria === actual.categoria;
    detalle.current.push({
      item: actual.id,
      ok,
      intentos: 1,
      respuesta: ok ? null : categoria,
      orden: detalle.current.length + 1,
    });
    if (ok) setAciertos((n) => n + 1);
    setSello(categoria);
  };

  const avanzar = () => {
    if (!sello) return;
    setSello(null);
    if (i + 1 < orden.length) setI(i + 1);
    else setTerminado(true);
  };

  const reiniciar = () => {
    setOrden(barajar(IMPUESTOS_SELLO));
    setI(0); setSello(null); setAciertos(0); setTerminado(false);
    sellados.current = new Set();
    detalle.current = [];
    inicio.current = Date.now();
  };

  if (terminado) {
    return (
      <Tesoreria rotulo="TESORERÍA · MESA DE SELLOS" titulo="Ocho impuestos sellados" acento={FAE.teal}>
        <Cierre pct={Math.round(pct)} onReiniciar={reiniciar} textoReiniciar="Sellar otra vez">
          <p style={TEXTO_CIERRE}>{aciertos} de {orden.length} con el sello correcto.</p>
        </Cierre>
      </Tesoreria>
    );
  }

  const acerto = sello === actual.categoria;

  return (
    <Tesoreria rotulo="TESORERÍA · MESA DE SELLOS" titulo="¿Qué sello lleva este impuesto?" acento={FAE.teal}>
      <div style={{ marginBottom: "12px" }}>
        <Pulsos total={orden.length} hechos={i + (sello ? 1 : 0)} enCurso={i + 1} etiqueta="Impuesto" />
      </div>

      {/* El documento, con el sello estampado encima cuando ya se eligió. */}
      <div
        style={{
          position: "relative", padding: "20px 18px 26px", borderRadius: "10px",
          background: "#F4EFE3", color: FAE.navy, boxShadow: "0 6px 18px rgba(0,0,0,0.3)",
          minHeight: "96px",
        }}
      >
        <p style={{ margin: 0, fontFamily: "Inter, sans-serif", fontSize: "16px", fontWeight: 600, lineHeight: 1.45 }}>
          {actual.concepto}
        </p>
        {sello && (
          <span
            className="fae-ts-sello"
            style={{
              position: "absolute", right: "14px", bottom: "10px",
              display: "inline-flex", alignItems: "center", gap: "6px",
              padding: "5px 11px", borderRadius: "6px",
              border: `2.5px solid ${acerto ? FAE.teal : FAE.coral}`,
              color: acerto ? "#1f7d72" : "#b4492f",
              fontFamily: "Sora, sans-serif", fontSize: "13px", fontWeight: 800, letterSpacing: "0.08em",
            }}
          >
            {/* El signo va escrito, no solo en el color del sello. */}
            <span aria-hidden="true">{acerto ? "✓" : "✗"}</span>
            {nombreSello(sello).toUpperCase()}
          </span>
        )}
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(140px, 1fr))", gap: "8px", marginTop: "14px" }}>
        {SELLOS.map((s) => (
          <button
            key={s.id}
            type="button"
            onClick={() => sellar(s.id)}
            disabled={Boolean(sello)}
            style={{
              padding: "12px 10px", borderRadius: "12px", cursor: sello ? "default" : "pointer",
              background: "rgba(10,20,34,0.55)", border: `1.5px dashed ${sello === s.id ? (acerto ? FAE.teal : FAE.coral) : "rgba(248,249,250,0.28)"}`,
              color: FAE.text, fontFamily: "Sora, sans-serif", fontSize: "13.5px", fontWeight: 700,
              opacity: sello && sello !== s.id && s.id !== actual.categoria ? 0.5 : 1,
            }}
          >
            {s.nombre}
          </button>
        ))}
      </div>

      {sello && (
        <>
          <Retro texto={retroSello(actual, sello)} />
          <Avanzar onClick={avanzar}>{i + 1 === orden.length ? "Ver resultado" : "Siguiente impuesto"}</Avanzar>
        </>
      )}
    </Tesoreria>
  );
}
