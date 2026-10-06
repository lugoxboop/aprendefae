import { useEffect, useRef, useState } from "react";
import { barajar } from "../../../../utils/barajar.js";
import { FAE } from "../../../../theme.js";
import { NEUTRO, NAVY_DEL_CHIP, TEXTO_ATENUADO } from "../../../../data/contabilidadIntro.js";
import { ACT1_T3, GRUPOS, ALT_ACT1_T3 } from "../../../../data/contabilidadTema3Act1.js";
import {
  sortearAct1T3, evaluarAct1T3, puntuarAct1T3, pesoDeCadaHecho,
} from "../../../../contabilidad/ingresoOCobro.js";
import { Retro, Pulsos, Cierre } from "../../corazon/juego.jsx";
import { TEXTO_CIERRE } from "../../bloques/marcos.jsx";
import { Responder, useTanda } from "../piezas.jsx";
import { SOLO_LECTOR } from "../verbos.jsx";
import { Encabezado } from "../tema1/encabezado.jsx";

/*
 * ═══════════════════════════════════════════════════════════════════════════
 * TEMA 3 · ACT. 1 · ¿INGRESO O COBRO?
 *
 * Una ficha con un hecho y el nombre de su empresa, y tres grupos apilados.
 * Se toca un grupo y se pulsa «Colocar la ficha». Un reintento, que vale la
 * mitad.
 *
 * Es el patrón visual y de interacción de T1-6 —la ficha arriba, las
 * pestañas apiladas a todo el ancho, el rebote al fallar, la retro debajo—,
 * pero en un solo nivel: aquí no hay parte que elegir dentro de un grupo.
 * Componente propio del Tema 3; T1-6 no se toca.
 *
 * ═══════════ LAS PESTAÑAS VAN APILADAS, A TODO EL ANCHO ═══════════
 *
 * El rótulo más largo, «Es ingreso, pero el dinero llega después», a 320 px
 * no cabe en una fila de tres. Apiladas, cada una tiene el ancho entero y el
 * rótulo se lee completo, sin cortes ni puntos suspensivos.
 * ═══════════════════════════════════════════════════════════════════════════
 */

const CSS = `
@keyframes fae-t3a1-rebota {
  0% { transform: translateX(0); } 30% { transform: translateX(-5px); }
  60% { transform: translateX(4px); } 100% { transform: translateX(0); }
}
.fae-t3a1-rebota { animation: fae-t3a1-rebota 400ms ease-out 1; }
@media (prefers-reduced-motion: reduce) {
  .fae-t3a1-rebota { animation: none !important; transform: none !important; }
}
`;

const SORA = "Sora, sans-serif";

export default function IngresoOCobro({
  Marco, rotulo, titulo, acento, onCompletar, items = null, modoDemo = false, onComoSeJuega = null,
}) {
  const t = useTanda(() => items ?? sortearAct1T3(barajar));

  const [grupo, setGrupo] = useState(null);
  const [r, setR] = useState(null);
  const [intento, setIntento] = useState(0);
  const [respuestas, setRespuestas] = useState([]);
  const [rebotando, setRebotando] = useState(false);
  const reloj = useRef(null);
  const zonaBoton = useRef(null);

  const h = t.items[t.i];
  const cuantas = t.items.length;
  const pct = puntuarAct1T3(respuestas, cuantas);
  const esperandoReintento = Boolean(r && !r.ok && intento === 1);
  const puedeResponder = !r || esperandoReintento;
  const completo = Boolean(grupo);

  useEffect(() => {
    if (t.terminado && !modoDemo) onCompletar?.(pct, Date.now() - t.inicio.current, t.detalle.current);
  }, [t.terminado]);
  useEffect(() => () => clearTimeout(reloj.current), []);
  useEffect(() => {
    if (r && !esperandoReintento && !modoDemo) zonaBoton.current?.querySelector("button")?.focus();
  }, [r, esperandoReintento]);

  const enviar = () => {
    if (!completo || (r && !esperandoReintento)) return;
    const nuevo = evaluarAct1T3(h, grupo);

    if (!nuevo.ok) {
      setRebotando(true);
      clearTimeout(reloj.current);
      reloj.current = setTimeout(() => setRebotando(false), 420);
    }

    if (intento === 0) {
      t.anotar(h.id, nuevo.ok, nuevo.ok ? null : grupo);
      if (!nuevo.ok) { setR({ ...nuevo, primero: true }); setIntento(1); return; }
      setRespuestas((xs) => [...xs, { id: h.id, primeroOk: true }]);
      setR({ ...nuevo, primero: true });
      return;
    }
    setRespuestas((xs) => [...xs, { id: h.id, primeroOk: false, segundoOk: nuevo.ok }]);
    setIntento(2);
    setR({ ...nuevo, primero: false });
  };

  const avanzar = () => {
    setR(null); setIntento(0); setGrupo(null); setRebotando(false);
    if (t.i + 1 < cuantas) t.setI(t.i + 1);
    else t.setTerminado(true);
  };
  const reiniciar = () => {
    t.reiniciar(); setR(null); setIntento(0); setRespuestas([]); setGrupo(null); setRebotando(false);
  };

  if (t.terminado) {
    const bien = respuestas.filter((x) => x.primeroOk).length;
    return (
      <Marco rotulo={rotulo} titulo={titulo} acento={acento}>
        <style>{CSS}</style>
        <Cierre pct={Math.round(pct)} onReiniciar={reiniciar} textoReiniciar="Otra tanda">
          <p style={TEXTO_CIERRE}>
            {bien} de {cuantas} al primer intento. Cada hecho valía {pesoDeCadaHecho(cuantas).toFixed(2)} %.
          </p>
        </Cierre>
      </Marco>
    );
  }

  return (
    <Marco rotulo={rotulo} titulo={titulo} acento={acento}>
      <style>{CSS}</style>
      {!modoDemo && (
        <>
          <Encabezado consigna={ACT1_T3.consigna} onComoSeJuega={onComoSeJuega} />
          <div style={{ marginBottom: "12px" }}>
            <Pulsos total={cuantas} hechos={t.i + (r && !esperandoReintento ? 1 : 0)} enCurso={t.i + 1} etiqueta="Hecho" />
          </div>
        </>
      )}

      <div data-contenido>
        {/* La ficha: el nombre de la empresa arriba, siempre visible, y el hecho. */}
        <div
          data-ficha={h.id}
          className={rebotando ? "fae-t3a1-rebota" : undefined}
          style={{
            margin: "0 0 12px", padding: "10px 13px", borderRadius: "11px",
            background: "rgba(10,20,34,0.5)",
            border: `1px ${rebotando ? "dashed" : "solid"} ${rebotando ? FAE.coral : "rgba(248,249,250,0.2)"}`,
          }}
        >
          <p data-empresa style={{
            margin: "0 0 3px", fontSize: "10.5px", letterSpacing: "0.06em", color: TEXTO_ATENUADO,
          }}>
            {h.empresa}
          </p>
          <p data-hecho style={{
            margin: 0, fontFamily: SORA, fontSize: "14px", fontWeight: 700, lineHeight: 1.3, color: FAE.text,
          }}>
            {h.texto}
          </p>
        </div>

        {/* Los tres grupos, apilados y a todo el ancho. */}
        <div data-grupos role="group" aria-label="Grupos" style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
          {GRUPOS.map((g) => {
            const activa = grupo === g.id;
            const tenue = !puedeResponder && !activa;
            return (
              <button
                key={g.id}
                type="button"
                data-grupo={g.id}
                data-elegido={activa ? "si" : "no"}
                aria-pressed={activa}
                disabled={!puedeResponder}
                onClick={puedeResponder ? () => setGrupo(g.id) : undefined}
                style={{
                  display: "block", textAlign: "left", width: "100%", boxSizing: "border-box",
                  padding: "9px 11px", borderRadius: "10px",
                  cursor: puedeResponder ? "pointer" : "default",
                  background: activa ? NEUTRO : tenue ? "rgba(10,20,34,0.2)" : "rgba(10,20,34,0.4)",
                  borderStyle: "solid",
                  borderWidth: activa ? "2px" : "1px",
                  borderColor: activa ? NEUTRO : tenue ? "rgba(248,249,250,0.08)" : "rgba(248,249,250,0.16)",
                  color: activa ? NAVY_DEL_CHIP : tenue ? TEXTO_ATENUADO : FAE.text,
                }}
              >
                <span data-numero style={{
                  display: "block", fontSize: "10.5px", letterSpacing: "0.06em",
                  color: activa ? NAVY_DEL_CHIP : TEXTO_ATENUADO,
                }}>
                  Grupo {g.numero}
                </span>
                <span data-rotulo style={{
                  display: "block", marginTop: "2px", fontFamily: SORA, fontSize: "12.5px", fontWeight: 700, lineHeight: 1.25,
                }}>
                  {g.rotulo}
                </span>
              </button>
            );
          })}
        </div>

        {esperandoReintento && (
          <p data-fallo style={{
            margin: "9px 0 0", padding: "7px 10px", borderRadius: "10px",
            fontSize: "12px", textAlign: "center", color: "rgba(248,249,250,0.75)",
            border: `1px dashed ${FAE.coral}`,
          }}>
            La ficha no se colocó.
          </p>
        )}
      </div>

      {r && <Retro texto={r.texto} />}

      {puedeResponder && (
        <Responder onClick={enviar} deshabilitado={!completo}>
          {completo ? "Colocar la ficha" : "Elige un grupo"}
        </Responder>
      )}
      {r && !esperandoReintento && !modoDemo && (
        <div ref={zonaBoton}>
          <Responder onClick={avanzar}>
            {t.i + 1 === cuantas ? "Ver el resultado" : "Siguiente hecho"}
          </Responder>
        </div>
      )}

      {!modoDemo && <p style={SOLO_LECTOR}>{ALT_ACT1_T3}</p>}
    </Marco>
  );
}
