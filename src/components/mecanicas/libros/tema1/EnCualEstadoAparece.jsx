import { useEffect, useRef, useState } from "react";
import { barajar } from "../../../../utils/barajar.js";
import { FAE } from "../../../../theme.js";
import { NEUTRO, NAVY_DEL_CHIP } from "../../../../data/contabilidadIntro.js";
import {
  T1_6, INFORMES, SECCIONES_T1_6, PRIMERO, ALT_T1_6,
} from "../../../../data/contabilidadTema1.js";
import {
  sortearT1_6, evaluarT1_6, valorDeItem, puntuarT1_6, pesoDeCadaItem,
} from "../../../../contabilidad/tema1.js";
import { Retro, Pulsos, Cierre } from "../../corazon/juego.jsx";
import { TEXTO_CIERRE } from "../../bloques/marcos.jsx";
import { Responder, useTanda } from "../piezas.jsx";
import { SOLO_LECTOR } from "../verbos.jsx";
import { Encabezado, IdeaConTermino } from "./encabezado.jsx";

/*
 * ═══════════════════════════════════════════════════════════════════════════
 * T1-6 · ¿EN CUÁL ESTADO APARECE?
 *
 * Una ficha con un concepto y dos informes. Si va en el primero, además hay
 * que decir en qué parte.
 *
 * ═══════════ LA PESTAÑA LLEVA DOS LÍNEAS ═══════════
 *
 * La idea simple arriba y CUÁNDO debajo: «a 31 dic» contra «1 ene – 31 dic».
 * Esa segunda línea no es un adorno — es el criterio entero de la actividad.
 * Un informe es la foto de un día y el otro cuenta un año, y sin la franja de
 * tiempo a la vista la pregunta se convierte en memorizar dos listas.
 *
 * El término del libro va de rótulo DENTRO de la pestaña, en el encabezado del
 * informe. No dentro de ninguna frase, y no se quita nunca.
 *
 * ═══════════ «LO QUE GANÓ Y GASTÓ» NO SE USA ═══════════
 *
 * El segundo informe se llama «Lo que vendió y lo que gastó durante el año».
 * El nombre viejo está retirado del sitio entero.
 * ═══════════════════════════════════════════════════════════════════════════
 */

const CSS = `
@keyframes fae-t16-entra { from { opacity: 0; transform: translateY(-5px); } to { opacity: 1; transform: none; } }
.fae-t16-entra { animation: fae-t16-entra 280ms ease-out both; }
@keyframes fae-t16-rebota {
  0% { transform: translateX(0); } 30% { transform: translateX(-5px); }
  60% { transform: translateX(4px); } 100% { transform: translateX(0); }
}
.fae-t16-rebota { animation: fae-t16-rebota 400ms ease-out 1; }
@media (prefers-reduced-motion: reduce) {
  .fae-t16-entra, .fae-t16-rebota { animation: none !important; opacity: 1 !important; transform: none !important; }
}
`;

const SORA = "Sora, sans-serif";

export default function EnCualEstadoAparece({ Marco, rotulo, titulo, acento, onCompletar }) {
  const t = useTanda(() => sortearT1_6(barajar));

  const [informe, setInforme] = useState(null);
  const [seccion, setSeccion] = useState(null);
  const [r, setR] = useState(null);
  const [intento, setIntento] = useState(0);
  const [respuestas, setRespuestas] = useState([]);
  const [rebotando, setRebotando] = useState(false);
  const reloj = useRef(null);
  const zonaBoton = useRef(null);

  const c = t.items[t.i];
  const cuantas = t.items.length;
  const pct = puntuarT1_6(respuestas, cuantas);
  const esperandoReintento = Boolean(r && !r.ok && intento === 1);
  const puedeResponder = !r || esperandoReintento;
  /* Con el segundo informe no hay sección que elegir: la respuesta ya está. */
  const completo = informe === PRIMERO ? Boolean(seccion) : Boolean(informe);

  useEffect(() => {
    if (t.terminado) onCompletar?.(pct, Date.now() - t.inicio.current, t.detalle.current);
  }, [t.terminado]);
  useEffect(() => () => clearTimeout(reloj.current), []);
  useEffect(() => {
    if (r && !esperandoReintento) zonaBoton.current?.querySelector("button")?.focus();
  }, [r, esperandoReintento]);

  const enviar = () => {
    if (!completo || (r && !esperandoReintento)) return;
    const marcado = { informe, seccion: informe === PRIMERO ? seccion : null };
    const nuevo = evaluarT1_6(c, marcado);
    const valor = valorDeItem(c, nuevo);

    if (!nuevo.ok) {
      setRebotando(true);
      clearTimeout(reloj.current);
      reloj.current = setTimeout(() => setRebotando(false), 420);
    }

    if (intento === 0) {
      t.anotar(c.id, nuevo.ok, nuevo.ok ? null : `${marcado.informe}${marcado.seccion ? `/${marcado.seccion}` : ""}`);
      if (!nuevo.ok) { setR({ ...nuevo, primero: true }); setIntento(1); return; }
      setRespuestas((xs) => [...xs, { id: c.id, valor, primeroOk: true }]);
      setR({ ...nuevo, primero: true });
      return;
    }
    /* En el segundo intento el ítem vale la mitad de lo que habría valido. */
    setRespuestas((xs) => [...xs, { id: c.id, valor: valor / 2, primeroOk: false, segundoOk: nuevo.ok }]);
    setIntento(2);
    setR({ ...nuevo, primero: false });
  };

  const avanzar = () => {
    setR(null); setIntento(0); setInforme(null); setSeccion(null); setRebotando(false);
    if (t.i + 1 < cuantas) t.setI(t.i + 1);
    else t.setTerminado(true);
  };
  const reiniciar = () => {
    t.reiniciar(); setR(null); setIntento(0); setRespuestas([]);
    setInforme(null); setSeccion(null); setRebotando(false);
  };

  if (t.terminado) {
    const bien = respuestas.filter((x) => x.primeroOk).length;
    return (
      <Marco rotulo={rotulo} titulo={titulo} acento={acento}>
        <style>{CSS}</style>
        <Cierre pct={Math.round(pct)} onReiniciar={reiniciar} textoReiniciar="Otra tanda">
          <p style={TEXTO_CIERRE}>
            {bien} de {cuantas} completas al primer intento. Cada ficha valía {pesoDeCadaItem(cuantas).toFixed(2)} %:
            el informe pesa {Math.round(0.6 * 100)} % y la parte {Math.round(0.4 * 100)} %.
          </p>
        </Cierre>
      </Marco>
    );
  }

  const elegirInforme = (id) => {
    if (!puedeResponder) return;
    setInforme(id);
    /* Cambiar de informe borra la sección: era del otro. */
    if (id !== PRIMERO) setSeccion(null);
  };

  return (
    <Marco rotulo={rotulo} titulo={titulo} acento={acento}>
      <style>{CSS}</style>
      <Encabezado objetivo={T1_6.objetivo} consigna={T1_6.consigna} />
      <div style={{ marginBottom: "12px" }}>
        <Pulsos total={cuantas} hechos={t.i + (r && !esperandoReintento ? 1 : 0)} enCurso={t.i + 1} etiqueta="Ficha" />
      </div>

      {/* Aquí dentro no entra el vocabulario del Tema 2. */}
      <div data-contenido>
        <p
          data-ficha={c.id}
          className={rebotando ? "fae-t16-rebota" : undefined}
          style={{
            margin: "0 0 12px", padding: "11px 13px", borderRadius: "11px",
            fontFamily: SORA, fontSize: "14px", fontWeight: 700, lineHeight: 1.3, color: FAE.text,
            background: "rgba(10,20,34,0.5)",
            border: `1px ${rebotando ? "dashed" : "solid"} ${rebotando ? FAE.coral : "rgba(248,249,250,0.2)"}`,
          }}
        >
          {c.nombre}
        </p>

        {/*
          ═══════════ LAS DOS PESTAÑAS, CADA UNA CON SUS DOS LÍNEAS ═══════════
          Apiladas y no en fila: a 375 px, dos pestañas de 160 px cada una
          parten «Lo que la empresa tiene y debe hoy» en cinco renglones.
        */}
        <div data-pestanas style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
          {INFORMES.map((inf) => {
            const activa = informe === inf.id;
            return (
              <div key={inf.id}>
                <button
                  type="button"
                  data-informe={inf.id}
                  data-elegido={activa ? "si" : "no"}
                  aria-pressed={activa}
                  disabled={!puedeResponder}
                  onClick={() => elegirInforme(inf.id)}
                  style={{
                    display: "block", textAlign: "left", width: "100%", boxSizing: "border-box",
                    padding: "9px 11px", borderRadius: activa ? "10px 10px 0 0" : "10px",
                    cursor: puedeResponder ? "pointer" : "default",
                    background: activa ? "rgba(184,196,212,0.12)" : "rgba(10,20,34,0.4)",
                    border: `${activa ? 2 : 1}px solid ${activa ? NEUTRO : "rgba(248,249,250,0.16)"}`,
                    borderBottom: activa ? "none" : undefined,
                    color: FAE.text,
                    opacity: !puedeResponder && !activa ? 0.5 : 1,
                  }}
                >
                  <span data-linea="idea" style={{
                    display: "block", fontFamily: SORA, fontSize: "12.5px", fontWeight: 700, lineHeight: 1.25,
                  }}>
                    {inf.idea}
                  </span>
                  {/* La franja de tiempo: es el criterio, no un pie de página. */}
                  <span data-linea="cuando" style={{
                    display: "block", marginTop: "2px", fontSize: "10.5px",
                    color: "rgba(248,249,250,0.55)",
                  }}>
                    {inf.cuando}
                  </span>
                </button>

                {activa && (
                  <div data-dentro={inf.id} className="fae-t16-entra" style={{
                    padding: "8px 11px 10px", borderRadius: "0 0 10px 10px",
                    background: "rgba(184,196,212,0.06)",
                    border: `2px solid ${NEUTRO}`, borderTop: "none",
                  }}>
                    {/* El término del libro, de rótulo en el encabezado del informe. */}
                    <p data-termino-informe={inf.termino} style={{
                      margin: "0 0 7px", fontSize: "10px", letterSpacing: "0.06em",
                      color: "rgba(248,249,250,0.55)",
                    }}>
                      {inf.termino}
                    </p>
                    {inf.id === PRIMERO ? (
                      <div style={{ display: "flex", flexDirection: "column", gap: "5px" }}>
                        {SECCIONES_T1_6.map((s) => {
                          const esta = seccion === s.id;
                          return (
                            <button
                              key={s.id}
                              type="button"
                              data-seccion={s.id}
                              data-marcada={esta ? "si" : "no"}
                              aria-pressed={esta}
                              disabled={!puedeResponder}
                              onClick={puedeResponder ? () => setSeccion(s.id) : undefined}
                              style={{
                                display: "block", textAlign: "left", boxSizing: "border-box",
                                padding: "7px 9px", borderRadius: "8px",
                                cursor: puedeResponder ? "pointer" : "default",
                                background: esta ? NEUTRO : "rgba(10,20,34,0.4)",
                                border: `1px solid ${esta ? NEUTRO : "rgba(248,249,250,0.18)"}`,
                              }}
                            >
                              <IdeaConTermino
                                idea={s.idea}
                                termino={s.termino}
                                tamano={11.5}
                                color={esta ? NAVY_DEL_CHIP : FAE.text}
                              />
                            </button>
                          );
                        })}
                      </div>
                    ) : (
                      <p data-sin-secciones style={{
                        margin: 0, fontSize: "11px", color: "rgba(248,249,250,0.55)",
                      }}>
                        Aquí no hay que elegir parte.
                      </p>
                    )}
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
        <Responder onClick={enviar} deshabilitado={!completo}>
          {completo ? "Colocar la ficha" : informe === PRIMERO ? "Elige en qué parte" : "Elige un informe"}
        </Responder>
      )}
      {r && !esperandoReintento && (
        <div ref={zonaBoton}>
          <Responder onClick={avanzar}>
            {t.i + 1 === cuantas ? "Ver el resultado" : "Siguiente ficha"}
          </Responder>
        </div>
      )}

      <p style={SOLO_LECTOR}>{ALT_T1_6}</p>
    </Marco>
  );
}
