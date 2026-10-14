import { useEffect, useId, useRef, useState } from "react";
import { barajar } from "../../../../utils/barajar.js";
import { FAE } from "../../../../theme.js";
import { NEUTRO, NAVY_DEL_CHIP, TEXTO_ATENUADO } from "../../../../data/contabilidadIntro.js";
import {
  T5_ACT1, RENTAS, TIPOS_FIJA, FIJA, BOTON_T5_ACT1, ALT_T5_ACT1, resumenT5Act1,
} from "../../../../data/contabilidadT5Act1.js";
import {
  sortearT5Act1, evaluarT5Act1, valorDeItemT5Act1, puntuarT5Act1,
} from "../../../../contabilidad/t5Act1.js";
import { pesoDeCadaItem } from "../../../../contabilidad/tema1.js";
import { Retro, Pulsos, Cierre } from "../../corazon/juego.jsx";
import { TEXTO_CIERRE } from "../../bloques/marcos.jsx";
import { Responder, useTanda } from "../piezas.jsx";
import { SOLO_LECTOR } from "../verbos.jsx";
import { Encabezado } from "../tema1/encabezado.jsx";

/*
 * ═══════════════════════════════════════════════════════════════════════════
 * T5 · HACER 1 · ¿QUÉ RENTA DA ESTE TÍTULO? (Célula B)
 *
 * El patrón de T1-6 (EnCualEstadoAparece.jsx), replicado sin tocar el de T1:
 * una ficha, dos pestañas apiladas y, bajo «Renta fija», un panel unido con
 * «Con interés» y «Con descuento». Reintento a la mitad, 60 % el primer nivel
 * y 40 % el segundo.
 *
 * Lo propio de esta actividad (guía de Mai v2, §2): la pestaña lleva UNA
 * línea; «Renta variable» no abre panel y conserva su radio completo; el
 * segundo nivel va a 12 px; pestañas y opciones miden al menos 44 px, con el
 * texto centrado en vertical; y no hay rótulo entre los dos niveles.
 *
 * Correcciones de Shoko (PASA CON CORRECCIONES), verificadas por Sakuta
 * contra T1-6: en el segundo intento la devolución sale de lo marcado EN ESE
 * intento (salvo las fichas de nombre de renta fija, que dan la lista del
 * libro); tras un reintento acertado queda solo el ✅; la devolución va por
 * Retro, con el emoji al inicio del texto.
 * ═══════════════════════════════════════════════════════════════════════════
 */

const CSS = `
@keyframes fae-t5a1-entra { from { opacity: 0; transform: translateY(-5px); } to { opacity: 1; transform: none; } }
.fae-t5a1-entra { animation: fae-t5a1-entra 280ms ease-out both; }
@keyframes fae-t5a1-rebota {
  0% { transform: translateX(0); } 30% { transform: translateX(-5px); }
  60% { transform: translateX(4px); } 100% { transform: translateX(0); }
}
.fae-t5a1-rebota { animation: fae-t5a1-rebota 400ms ease-out 1; }
@media (prefers-reduced-motion: reduce) {
  .fae-t5a1-entra, .fae-t5a1-rebota { animation: none !important; opacity: 1 !important; transform: none !important; }
}
`;

const SORA = "Sora, sans-serif";
const INTER = "Inter, sans-serif";

/* El rótulo del botón, según lo elegido (guía §3, estado 2). */
export function rotuloDelBoton(renta, tipo) {
  if (!renta) return BOTON_T5_ACT1.nada;
  if (renta === FIJA && !tipo) return BOTON_T5_ACT1.falta;
  return BOTON_T5_ACT1.colocar;
}

export default function QueRentaDa({
  Marco, rotulo, titulo, acento, onCompletar, items = null, modoDemo = false, onComoSeJuega = null,
}) {
  const t = useTanda(() => items ?? sortearT5Act1(barajar));
  const idPanel = useId();

  const [renta, setRenta] = useState(null);
  const [tipo, setTipo] = useState(null);
  const [r, setR] = useState(null);
  const [intento, setIntento] = useState(0);
  const [respuestas, setRespuestas] = useState([]);
  const [rebotando, setRebotando] = useState(false);
  const reloj = useRef(null);
  const zonaBoton = useRef(null);

  const c = t.items[t.i];
  const cuantas = t.items.length;
  const pct = puntuarT5Act1(respuestas, cuantas);
  const esperandoReintento = Boolean(r && !r.ok && intento === 1);
  const puedeResponder = !r || esperandoReintento;
  /* Con «Renta variable» no hay segundo nivel: la respuesta ya está. */
  const completo = renta === FIJA ? Boolean(tipo) : Boolean(renta);

  useEffect(() => {
    if (t.terminado && !modoDemo) onCompletar?.(pct, Date.now() - t.inicio.current, t.detalle.current);
  }, [t.terminado]); // eslint-disable-line react-hooks/exhaustive-deps
  useEffect(() => () => clearTimeout(reloj.current), []);
  useEffect(() => {
    if (r && !esperandoReintento && !modoDemo) zonaBoton.current?.querySelector("button")?.focus();
  }, [r, esperandoReintento]); // eslint-disable-line react-hooks/exhaustive-deps

  const enviar = () => {
    if (!completo || (r && !esperandoReintento)) return;
    const marcado = { renta, tipo: renta === FIJA ? tipo : null };
    const nuevo = evaluarT5Act1(c, marcado, intento === 0 ? 1 : 2);
    const valor = valorDeItemT5Act1(c, nuevo);

    if (!nuevo.ok) {
      setRebotando(true);
      clearTimeout(reloj.current);
      reloj.current = setTimeout(() => setRebotando(false), 420);
    }

    if (intento === 0) {
      t.anotar(c.id, nuevo.ok, nuevo.ok ? null : `${marcado.renta}${marcado.tipo ? `/${marcado.tipo}` : ""}`);
      if (!nuevo.ok) { setR({ ...nuevo, primero: true }); setIntento(1); return; }
      setRespuestas((xs) => [...xs, { id: c.id, valor, primeroOk: true }]);
      setR({ ...nuevo, primero: true });
      return;
    }
    /* En el segundo intento la ficha vale la mitad de lo que habría valido. */
    setRespuestas((xs) => [...xs, { id: c.id, valor: valor / 2, primeroOk: false, segundoOk: nuevo.ok }]);
    setIntento(2);
    /* setR reemplaza: tras un reintento acertado queda solo el ✅. */
    setR({ ...nuevo, primero: false });
  };

  const avanzar = () => {
    setR(null); setIntento(0); setRenta(null); setTipo(null); setRebotando(false);
    if (t.i + 1 < cuantas) t.setI(t.i + 1);
    else t.setTerminado(true);
  };
  const reiniciar = () => {
    t.reiniciar(); setR(null); setIntento(0); setRespuestas([]);
    setRenta(null); setTipo(null); setRebotando(false);
  };

  if (t.terminado) {
    const bien = respuestas.filter((x) => x.primeroOk).length;
    return (
      <Marco rotulo={rotulo} titulo={titulo} acento={acento}>
        <style>{CSS}</style>
        <Cierre pct={Math.round(pct)} onReiniciar={reiniciar} textoReiniciar="Otra tanda">
          <p data-resumen style={TEXTO_CIERRE}>
            {resumenT5Act1(bien, cuantas, pesoDeCadaItem(cuantas).toFixed(2))}
          </p>
        </Cierre>
      </Marco>
    );
  }

  /* Reglas de las pestañas (guía §2.5). */
  const elegirRenta = (id) => {
    if (!puedeResponder || id === renta) return;
    setRenta(id);
    /* Al cambiar de pestaña se borra el segundo nivel: era de la otra. */
    setTipo(null);
  };

  /* Pestaña y opción comparten el alto mínimo de 44 y el texto centrado. */
  const centrado = { display: "flex", alignItems: "center", minHeight: "44px", width: "100%", boxSizing: "border-box", textAlign: "left" };

  return (
    <Marco rotulo={rotulo} titulo={titulo} acento={acento}>
      <style>{CSS}</style>
      {!modoDemo && (
        <>
          <Encabezado objetivo={T5_ACT1.objetivo} consigna={T5_ACT1.consigna} onComoSeJuega={onComoSeJuega} />
          <div style={{ marginBottom: "12px" }}>
            <Pulsos total={cuantas} hechos={t.i + (r && !esperandoReintento ? 1 : 0)} enCurso={t.i + 1} etiqueta="Ficha" />
          </div>
        </>
      )}

      <div data-contenido>
        <p
          data-ficha={c.id}
          className={rebotando ? "fae-t5a1-rebota" : undefined}
          style={{
            margin: "0 0 12px", padding: "11px 13px", borderRadius: "11px",
            fontFamily: SORA, fontSize: "14px", fontWeight: 700, lineHeight: 1.3, color: FAE.text,
            background: "rgba(10,20,34,0.5)",
            border: `1px ${rebotando ? "dashed" : "solid"} ${rebotando ? FAE.coral : "rgba(248,249,250,0.2)"}`,
          }}
        >
          {c.texto}
        </p>

        <div data-pestanas style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
          {RENTAS.map((ren) => {
            const activa = renta === ren.id;
            const abre = ren.id === FIJA;
            const conPanel = activa && abre;
            /* Lo que ya no se puede elegir se atenúa en borde y fondo, no entero (T1-6). */
            const tenue = !puedeResponder && !activa;
            return (
              <div key={ren.id}>
                <button
                  type="button"
                  data-renta={ren.id}
                  data-elegido={activa ? "si" : "no"}
                  aria-pressed={activa}
                  aria-expanded={abre ? activa : undefined}
                  aria-controls={abre ? idPanel : undefined}
                  disabled={!puedeResponder}
                  onClick={() => elegirRenta(ren.id)}
                  style={{
                    ...centrado,
                    padding: "9px 11px", borderRadius: conPanel ? "10px 10px 0 0" : "10px",
                    cursor: puedeResponder ? "pointer" : "default",
                    background: activa ? "rgba(184,196,212,0.12)" : tenue ? "rgba(10,20,34,0.2)" : "rgba(10,20,34,0.4)",
                    borderStyle: "solid",
                    borderWidth: conPanel ? "2px 2px 0 2px" : activa ? "2px" : "1px",
                    borderColor: activa ? NEUTRO : tenue ? "rgba(248,249,250,0.08)" : "rgba(248,249,250,0.16)",
                    color: tenue ? TEXTO_ATENUADO : FAE.text,
                    fontFamily: SORA, fontSize: "12.5px", fontWeight: 700, lineHeight: 1.25,
                  }}
                >
                  <span data-rotulo-renta style={{ display: "block", whiteSpace: "nowrap" }}>{ren.rotulo}</span>
                </button>

                {conPanel && (
                  <div
                    id={idPanel}
                    role="group"
                    aria-label={ren.rotulo}
                    data-panel-fija
                    className="fae-t5a1-entra"
                    style={{
                      padding: "8px 11px 10px", borderRadius: "0 0 10px 10px",
                      background: "rgba(184,196,212,0.06)",
                      border: `2px solid ${NEUTRO}`, borderTop: "none",
                      display: "flex", flexDirection: "column", gap: "5px",
                    }}
                  >
                    {TIPOS_FIJA.map((ti) => {
                      const esta = tipo === ti.id;
                      return (
                        <button
                          key={ti.id}
                          type="button"
                          data-tipo={ti.id}
                          data-marcada={esta ? "si" : "no"}
                          aria-pressed={esta}
                          disabled={!puedeResponder}
                          onClick={puedeResponder ? () => setTipo(ti.id) : undefined}
                          style={{
                            ...centrado,
                            padding: "7px 9px", borderRadius: "8px",
                            cursor: puedeResponder ? "pointer" : "default",
                            background: esta ? NEUTRO : "rgba(10,20,34,0.4)",
                            border: `1px solid ${esta ? NEUTRO : "rgba(248,249,250,0.18)"}`,
                            color: esta ? NAVY_DEL_CHIP : FAE.text,
                            fontFamily: INTER, fontSize: "12px", lineHeight: 1.3,
                          }}
                        >
                          {ti.rotulo}
                        </button>
                      );
                    })}
                  </div>
                )}
              </div>
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
        <div data-boton-colocar>
          <Responder onClick={enviar} deshabilitado={!completo}>
            {rotuloDelBoton(renta, tipo)}
          </Responder>
        </div>
      )}
      {r && !esperandoReintento && !modoDemo && (
        <div ref={zonaBoton} data-boton-avanzar>
          <Responder onClick={avanzar}>
            {t.i + 1 === cuantas ? "Ver el resultado" : "Siguiente ficha"}
          </Responder>
        </div>
      )}

      {!modoDemo && <p style={SOLO_LECTOR}>{ALT_T5_ACT1}</p>}
    </Marco>
  );
}
