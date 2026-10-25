import { useEffect, useRef, useState } from "react";
import { barajar } from "../../../../utils/barajar.js";
import { FAE } from "../../../../theme.js";
import { NEUTRO, TEXTO_ATENUADO } from "../../../../data/contabilidadIntro.js";
import { ACT1_T3, GRUPOS, ALT_ACT1_T3, SEGUNDA_ACT1_T3, MARCA_ACT1_T3 } from "../../../../data/contabilidadTema3Act1.js";
import {
  sortearAct1T3, evaluarAct1T3, puntuarAct1T3, pesoDeCadaHecho, tieneSegunda, evaluarSegundaAct1T3,
} from "../../../../contabilidad/ingresoOCobro.js";
import { Retro, Pulsos, Cierre } from "../../corazon/juego.jsx";
import { TEXTO_CIERRE } from "../../bloques/marcos.jsx";
import { Responder, useTanda } from "../piezas.jsx";
import { SOLO_LECTOR } from "../verbos.jsx";
import { Encabezado } from "../tema1/encabezado.jsx";
import { useSegunda, OpcionSegunda, MensajeSegunda, mostrarTramo, pastillasTocadas } from "./segundaDecision.jsx";
import { Relieve, CSS_RELIEVE, N0, N1, N2, SECUNDARIO_N2 } from "./relieve.jsx";

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
 *
 * ═══════════ LA SEGUNDA DECISIÓN (Hanayama; textos de Katsumi) ═══════════
 *
 * En los hechos del grupo 3, al acertar el grupo (a la primera o en el
 * reintento), las pestañas ceden su lugar a «¿qué es esa plata?» y tres
 * pestañas más, con la misma forma. Un toque califica. La retro del hecho y
 * «Siguiente hecho» esperan a que se resuelva. El hecho cuenta solo si las
 * dos decisiones son correctas (Yujiro); el detalle guarda las dos.
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

/* La forma de una pestaña, para que la segunda decisión copie la de los grupos. */
const FORMA_PESTANA = {
  relleno: [9, 11], radio: "10px", altoMinimo: undefined,
  letra: { fontFamily: SORA, fontSize: "12.5px", fontWeight: 700, lineHeight: 1.25 },
};

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
  const pregunta = useRef(null);
  const mensaje = useRef(null);
  const zonaSegunda = useRef(null);
  const segunda = useSegunda();
  /* La respuesta del hecho, guardada hasta que se resuelva la segunda decisión. */
  const pendiente = useRef(null);

  const h = t.items[t.i];
  const cuantas = t.items.length;
  const pct = puntuarAct1T3(respuestas, cuantas);
  const esperandoReintento = Boolean(r && !r.ok && intento === 1);
  const puedeResponder = !r || esperandoReintento;
  const completo = Boolean(grupo);
  /* La segunda decisión está en pantalla: el grupo ya se acertó y el hecho la lleva. */
  const enSegunda = Boolean(r?.ok && tieneSegunda(h));
  const resuelto = Boolean(r && !esperandoReintento && (!enSegunda || segunda.lista));

  useEffect(() => {
    if (t.terminado && !modoDemo) onCompletar?.(pct, Date.now() - t.inicio.current, t.detalle.current);
  }, [t.terminado]);
  useEffect(() => () => clearTimeout(reloj.current), []);
  useEffect(() => {
    if (!resuelto || modoDemo) return;
    const boton = zonaBoton.current?.querySelector("button");
    /* Con segunda decisión, el tramo de la pastilla al mensaje o al botón (lote A). */
    if (enSegunda) mostrarTramo({ mensaje: mensaje.current, pastillas: pastillasTocadas(zonaSegunda.current), boton, enfocar: true });
    else boton?.focus();
  }, [resuelto]);
  /* Al tocar una opción mal: el tramo hasta el mensaje, sin mover el foco. */
  useEffect(() => {
    if (segunda.s && !segunda.lista && !modoDemo) mostrarTramo({ mensaje: mensaje.current, pastillas: pastillasTocadas(zonaSegunda.current) });
  }, [segunda.s]);
  useEffect(() => {
    if (enSegunda && !modoDemo) pregunta.current?.focus();
  }, [enSegunda]);

  const enviar = () => {
    if (!completo || (r && !esperandoReintento)) return;
    const nuevo = evaluarAct1T3(h, grupo);

    if (!nuevo.ok) {
      setRebotando(true);
      clearTimeout(reloj.current);
      reloj.current = setTimeout(() => setRebotando(false), 420);
    }

    const conSegunda = nuevo.ok && tieneSegunda(h);
    if (intento === 0) {
      t.anotar(h.id, nuevo.ok, nuevo.ok ? null : grupo);
      if (tieneSegunda(h)) t.detalle.current[t.detalle.current.length - 1].respuestas = { grupo };
      if (!nuevo.ok) { setR({ ...nuevo, primero: true }); setIntento(1); return; }
      const fila = { id: h.id, primeroOk: true };
      if (conSegunda) pendiente.current = fila;
      else setRespuestas((xs) => [...xs, fila]);
      setR({ ...nuevo, primero: true });
      return;
    }
    const fila = { id: h.id, primeroOk: false, segundoOk: nuevo.ok };
    if (conSegunda) pendiente.current = fila;
    else setRespuestas((xs) => [...xs, fila]);
    setIntento(2);
    setR({ ...nuevo, primero: false });
  };

  /* La segunda decisión: un toque califica. */
  const elegirSegunda = (id) => {
    const ev = evaluarSegundaAct1T3(h, id);
    if (!segunda.elegir(id, ev.ok, ev.correcta, ev.error)) return;
    const d = t.detalle.current.find((x) => x.item === h.id);
    if (d) {
      d.respuestas = { ...d.respuestas, segunda: id };
      if (!ev.ok) { d.ok = false; d.respuesta = d.respuesta ?? id; }
    }
    const fila = { ...pendiente.current, segundaOk: ev.ok };
    pendiente.current = null;
    setRespuestas((xs) => [...xs, fila]);
  };

  const avanzar = () => {
    setR(null); setIntento(0); setGrupo(null); setRebotando(false); segunda.reiniciar(); pendiente.current = null;
    if (t.i + 1 < cuantas) t.setI(t.i + 1);
    else t.setTerminado(true);
  };
  const reiniciar = () => {
    t.reiniciar(); setR(null); setIntento(0); setRespuestas([]); setGrupo(null); setRebotando(false);
    segunda.reiniciar(); pendiente.current = null;
  };

  if (t.terminado) {
    const bien = respuestas.filter((x) => x.primeroOk && x.segundaOk !== false).length;
    return (
      <Marco rotulo={rotulo} titulo={titulo} acento={acento}>
        <style>{CSS}</style>
      <style>{CSS_RELIEVE}</style>
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
      <style>{CSS_RELIEVE}</style>
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

        {/* La segunda decisión, en el lugar de los grupos y con su misma forma. */}
        {enSegunda && (
          <div data-segunda ref={zonaSegunda}>
            <p ref={pregunta} tabIndex={-1} data-pregunta-segunda style={{
              /* 6 px abajo, no 8: así la primera opción entra en B1 a 320 (Hanayama). */
              margin: "0 0 6px", fontFamily: SORA, fontSize: "14px", fontWeight: 700, lineHeight: 1.3, color: FAE.text, outline: "none",
            }}>
              {SEGUNDA_ACT1_T3.pregunta}
            </p>
            <div role="group" aria-label={SEGUNDA_ACT1_T3.pregunta} style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
              {SEGUNDA_ACT1_T3.opciones.map((o) => (
                <OpcionSegunda key={o.id} opcion={o} estado={segunda.estadoDe(o.id)} palabras={MARCA_ACT1_T3}
                  onTocar={elegirSegunda} forma={FORMA_PESTANA} />
              ))}
            </div>
            <MensajeSegunda s={segunda.s} lista={segunda.lista} devolucion={h.acierto} refMensaje={mensaje}
              letra={{ fontSize: "13px", lineHeight: 1.55 }} />
          </div>
        )}

        {/* Los tres grupos, apilados y a todo el ancho. */}
        {!enSegunda && <div data-grupos role="group" aria-label="Grupos" style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
          {GRUPOS.map((g) => {
            const activa = grupo === g.id;
            const tenue = !puedeResponder && !activa;
            /* Volumen (#4): en reposo N1 en E1 (canto N0); el elegido, N2 + filo en E2 (canto N1). El contorno plano se quita: lo pone la silueta. */
            return (
              <Relieve key={g.id} e={activa ? 4 : 3} canto={activa ? N1 : N0} filo={activa} radio="10px">
              <button
                type="button"
                className="fae-rel-cara"
                data-grupo={g.id}
                data-elegido={activa ? "si" : "no"}
                aria-pressed={activa}
                disabled={!puedeResponder}
                onClick={puedeResponder ? () => setGrupo(g.id) : undefined}
                style={{
                  display: "block", textAlign: "left", width: "100%", boxSizing: "border-box",
                  padding: "9px 11px", borderRadius: "10px",
                  cursor: puedeResponder ? "pointer" : "default",
                  background: activa ? N2 : N1,
                  borderStyle: "solid",
                  borderWidth: activa ? "2px" : "1px",
                  borderColor: activa ? NEUTRO : "transparent",
                  color: tenue ? TEXTO_ATENUADO : FAE.text,
                }}
              >
                <span data-numero style={{
                  display: "block", fontSize: "10.5px", letterSpacing: "0.06em",
                  color: activa ? SECUNDARIO_N2 : TEXTO_ATENUADO,
                }}>
                  Grupo {g.numero}
                </span>
                <span data-rotulo style={{
                  display: "block", marginTop: "2px", fontFamily: SORA, fontSize: "12.5px", fontWeight: 700, lineHeight: 1.25,
                }}>
                  {g.rotulo}
                </span>
              </button>
              </Relieve>
            );
          })}
        </div>}

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

      {/* Con segunda decisión, la devolución va en su mensaje, no aquí. */}
      {r && !enSegunda && <Retro texto={r.texto} />}

      {puedeResponder && (
        <Responder onClick={enviar} deshabilitado={!completo}>
          {completo ? "Colocar la ficha" : "Elige un grupo"}
        </Responder>
      )}
      {resuelto && !modoDemo && (
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
