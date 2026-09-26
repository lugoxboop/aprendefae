import { useState } from "react";
import { FAE } from "../../../theme.js";
import { Panel } from "../salaDeControl/marco.jsx";

/*
 * ═══════════════════════════════════════════════════════════════════════════
 * UNA PIEZA DE APRENDER EN CUATRO CAPAS — Política Monetaria.
 *
 *   Capa 1  Primero, los nombres     las definiciones
 *   Capa 2  Mírelo funcionar         paso a paso; cada paso resalta UNA parte
 *                                    de la escena y apaga el resto
 *   Capa 3  Ahora pruebe usted       la exploración libre, sin calificar
 *   Capa 4  En una frase             una pregunta abierta y la respuesta de
 *                                    referencia, que se muestra a pedido
 *
 * Material teórico: cero FP. No llama a registrar_fp, no entra al catálogo y
 * la capa 4 no califica nada: la respuesta de referencia es para comparar, no
 * para corregir.
 * ═══════════════════════════════════════════════════════════════════════════
 */

const ROTULO_CAPA = {
  fontFamily: "Sora, sans-serif", fontSize: "11px", fontWeight: 700, letterSpacing: "0.14em",
  color: FAE.teal, margin: "0 0 10px",
};

function Capa({ numero, nombre, children }) {
  return (
    <section data-capa={numero} style={{ marginTop: numero === 1 ? 0 : "26px" }}>
      <p style={ROTULO_CAPA}>CAPA {numero} — {nombre.toUpperCase()}</p>
      {children}
    </section>
  );
}

/*
 *  llega desde fuera desde que Contabilidad usa esta pieza: el mundo
 * visual de cada materia es suyo, y una pieza de Contabilidad rotulada «SALA
 * DE MAQUINAS» diria que el estudiante esta en Politica Monetaria. El valor
 * por defecto conserva el de las tres piezas que ya existian.
 */
/*
 * ═══════════ LO QUE UNA PIEZA PUEDE TRAER SUYO ═══════════
 *
 * `Capa2` sustituye el paso-a-paso por la máquina propia de esa pieza, y
 * `pieza.opciones` cambia la capa 4 de «ver la respuesta de referencia» a un
 * selector con devolución. Los dos van apagados por defecto: las cuatro
 * piezas que ya existían no cambian ni un pixel.
 *
 * Se hizo así y no forkando el componente porque lo que comparten —el panel,
 * los rótulos de capa, la capa 1— es justo lo que hace que todas las piezas
 * de Aprender del sitio se sientan la misma cosa. Dos marcos parecidos se
 * separan en el primer retoque.
 */
export default function CuatroCapas({
  pieza, Escena, Exploracion, rotulo = "SALA DE MÁQUINAS · APRENDER",
  Capa2 = null, Capa4 = null,
}) {
  const [paso, setPaso] = useState(0);
  const [verRespuesta, setVerRespuesta] = useState(false);
  const actual = pieza.pasos?.[paso] ?? null;
  const boton = (activo) => ({
    padding: "10px 16px", borderRadius: "999px", fontFamily: "Sora, sans-serif", fontSize: "13px", fontWeight: 600,
    cursor: activo ? "pointer" : "default",
    background: "transparent", border: `1px solid ${activo ? "rgba(248,249,250,0.3)" : "rgba(248,249,250,0.1)"}`,
    color: activo ? FAE.text : "rgba(248,249,250,0.35)",
  });

  return (
    <Panel rotulo={rotulo} titulo={pieza.titulo}>
      {/* El objetivo va ANTES de la capa 1: se sabe qué se va a aprender antes de empezar. */}
      {pieza.objetivo && (
        <p data-objetivo style={{
          margin: "0 0 18px", padding: "11px 13px", borderRadius: "12px",
          fontSize: "14px", lineHeight: 1.55, color: "rgba(248,249,250,0.88)",
          background: "rgba(42,157,143,0.08)", borderLeft: `3px solid ${FAE.teal}`,
        }}>
          {pieza.objetivo}
        </p>
      )}
      <Capa numero={1} nombre="Primero, los nombres">
        <dl style={{ margin: 0, display: "flex", flexDirection: "column", gap: "9px" }}>
          {pieza.nombres.map((n) => (
            <div key={n.termino}>
              <dt style={{ display: "inline", fontFamily: "Sora, sans-serif", fontSize: "14px", fontWeight: 700, color: FAE.text }}>{n.termino}: </dt>
              <dd style={{ display: "inline", margin: 0, fontSize: "14px", lineHeight: 1.55, color: "rgba(248,249,250,0.8)" }}>{n.definicion}</dd>
            </div>
          ))}
        </dl>
      </Capa>

      <Capa numero={2} nombre="Mírelo funcionar">
        {Capa2 ? <Capa2 /> : (
          <>
            <div style={{ borderRadius: "14px", background: "rgba(10,20,34,0.45)", border: "1px solid rgba(248,249,250,0.1)", padding: "10px" }}>
              <Escena resaltar={actual.resaltar} />
            </div>
            <p style={{ margin: "12px 0 6px", fontFamily: "Sora, sans-serif", fontSize: "11.5px", fontWeight: 600, color: "rgba(248,249,250,0.55)" }}>
              Paso {paso + 1} de {pieza.pasos.length}
            </p>
            <p data-texto-paso aria-live="polite" style={{ margin: 0, fontSize: "15px", lineHeight: 1.6, color: FAE.text }}>{actual.texto}</p>
            <div style={{ display: "flex", gap: "8px", marginTop: "12px" }}>
              <button type="button" disabled={paso === 0} onClick={() => setPaso((p) => Math.max(0, p - 1))} style={boton(paso > 0)}>Anterior</button>
              <button type="button" disabled={paso === pieza.pasos.length - 1} onClick={() => setPaso((p) => Math.min(pieza.pasos.length - 1, p + 1))} style={boton(paso < pieza.pasos.length - 1)}>Siguiente</button>
            </div>
          </>
        )}
      </Capa>

      <Capa numero={3} nombre="Ahora pruebe usted">
        <Exploracion />
      </Capa>

      <Capa numero={4} nombre="En una frase">
        {Capa4 ? <Capa4 /> : (<>
        <p style={{ margin: 0, fontFamily: "Sora, sans-serif", fontSize: "15px", fontWeight: 700, lineHeight: 1.45, color: FAE.text }}>{pieza.pregunta}</p>
        {!verRespuesta ? (
          <button type="button" onClick={() => setVerRespuesta(true)} style={{ ...boton(true), marginTop: "12px" }}>
            Ver la respuesta de referencia
          </button>
        ) : (
          <p data-respuesta style={{ margin: "12px 0 0", padding: "12px 14px", borderRadius: "12px", fontSize: "14px", lineHeight: 1.55, color: "rgba(248,249,250,0.85)", background: "rgba(42,157,143,0.08)", borderLeft: `3px solid ${FAE.teal}` }}>
            {pieza.respuesta}
          </p>
        )}
        </>)}
      </Capa>
    </Panel>
  );
}
