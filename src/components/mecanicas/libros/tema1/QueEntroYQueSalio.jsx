import { useEffect, useRef, useState } from "react";
import { barajar } from "../../../../utils/barajar.js";
import { FAE } from "../../../../theme.js";
import { NEUTRO, NAVY_DEL_CHIP } from "../../../../data/contabilidadIntro.js";
import {
  T1_2, CLASES, EMPRESAS, ROTULO_ENTRA, ROTULO_SALE, ALT_T1_2, ESCENA_ERROR, SEGUNDA_T1_2,
} from "../../../../data/contabilidadTema1.js";
import {
  sortearT1_2, evaluarT1_2, puntuar, pesoDeCadaItem, sinObjeto, sinEmoji,
  opcionesSegundaT1_2, correctaSegundaT1_2, porqueSegundaT1_2,
} from "../../../../contabilidad/tema1.js";
import { Cierre } from "../../corazon/juego.jsx";
import { TEXTO_CIERRE } from "../../bloques/marcos.jsx";
import { useTanda } from "../piezas.jsx";
import { SOLO_LECTOR } from "../verbos.jsx";
import EncabezadoCompacto from "../b5/EncabezadoCompacto.jsx";
import {
  Pastilla, Mensaje, RegionViva, IconoCheck, IconoX, CORRECTA, TACHADA, REVELADA, CSS_B5H, CLASE_B5H, RETRASO_REVELA_MS,
} from "../b5/Devolucion.jsx";
import {
  INTER, REPOSO, ACIERTO, FANTASMA, estiloC2, contadorDe, Avance, CSS_REGISTRO, CLASE_ENTRA,
} from "./registro.jsx";

/*
 * ═══════════════════════════════════════════════════════════════════════════
 * T1-2 · ¿QUÉ ENTRÓ Y QUÉ SALIÓ?
 *
 * Dos recuadros —lo que entra y lo que sale— y cinco clases. Lo que decide la
 * clase es qué le pasó adentro a lo que entró: el criterio del libro, el que
 * separa una comercial de una industrial.
 *
 * ═══════════ LA FLECHA DICE QUÉ LE PASÓ, TAMBIÉN CUANDO SE FALLA ═══════════
 *
 * Entre los dos recuadros va la relación escrita —«lo mismo»,
 * «transformado», «criado», «extraído», «no hay objeto»— y eso ES la
 * respuesta con otras palabras: antes de responder la flecha va vacía (R10).
 * Desde el lote 4 (P2 de Mai) se dibuja SIEMPRE tras responder, con la
 * relación correcta, y si se falló, al lado va la de la clase elegida,
 * tachada: así se ven las dos, la que es y la que eligió. Un intento.
 *
 * ═══════════ Y EL RECUADRO DE ENTRADA NUNCA VA VACÍO ═══════════
 *
 * Cuando no hay insumo, dice «sin insumo físico». Un hueco en blanco se lee
 * como un fallo de carga, y además esa frase es el dato: que no entre nada es
 * lo que distingue a una de servicios y a una minera.
 * ═══════════════════════════════════════════════════════════════════════════
 */

const CSS = `
@keyframes fae-t12-late { 0%, 100% { background: transparent; } 50% { background: rgba(184,196,212,0.22); } }
.fae-t12-late { animation: fae-t12-late 480ms cubic-bezier(.3,.9,.4,1) 1; }
@media (prefers-reduced-motion: reduce) {
  .fae-t12-late { animation: none !important; }
}
`;

/* El renglón de la flecha reserva dos líneas de 16 px (P2 de Mai: 32). */
export const ALTO_RELACION = 32;

const SORA = "Sora, sans-serif";

/*
 * `atenuado` lo pone la segunda decisión: un recuadro que se desvanece es lo
 * que afirma quien dice que ahí no entra nada o que ese recuadro no cuenta.
 * Se baja la opacidad y no el borde, para que el estado se mida mirando.
 */
function Recuadro({ rotulo, texto, marcado, late, vacio, atenuado = false }) {
  return (
    <div
      data-recuadro={rotulo}
      data-marcado={marcado ? "si" : "no"}
      data-atenuado={atenuado ? "si" : undefined}
      className={late ? "fae-t12-late" : undefined}
      style={{
        opacity: atenuado ? 0.4 : 1,
        padding: "9px 10px", borderRadius: "11px",
        background: "rgba(10,20,34,0.45)",
        /* C2, sin salto: siempre 2 px; en reposo el contorno de 1 px va pintado por dentro. */
        border: `2px solid ${marcado ? NEUTRO : "transparent"}`,
        boxShadow: marcado ? "none" : "inset 0 0 0 1px rgba(248,249,250,0.14)",
      }}
    >
      <p style={{
        margin: "0 0 4px", fontFamily: SORA, fontSize: "12px", fontWeight: 700,
        letterSpacing: "0.1em", color: "#A8B6C8",
      }}>
        {rotulo}
      </p>
      <p data-vacio={vacio ? "si" : undefined} style={{
        margin: 0, fontSize: "12.5px", lineHeight: 1.35,
        color: vacio ? "rgba(248,249,250,0.55)" : FAE.text,
        fontStyle: vacio ? "italic" : "normal",
      }}>
        {texto}
      </p>
    </div>
  );
}

/*
 * La relación de cada clase, sacada del banco: la de las empresas de esa
 * clase («criado o cultivado» en la agropecuaria). Es lo que se tacha como
 * fantasma cuando el estudiante elige esa clase y no era.
 */
export const RELACION_DE_CLASE = Object.fromEntries(CLASES.map((c) => {
  const rels = [...new Set(EMPRESAS.filter((x) => x.clase === c.id).map((x) => x.relacion.toLowerCase()))];
  return [c.id, rels.join(" o ")];
}));

/*
 * ═══════════ LA SEGUNDA DECISIÓN DE T1-2 ═══════════
 * Con las primitivas del registro y no con `SegundaDecisionT1`, para que el
 * error se vea igual en las dos decisiones de la pieza: el contorno coral
 * discontinuo (Shoko, #535; el mismo de las otras cinco). `SegundaDecisionT1`
 * se queda como está: la usa también el Tema 3.
 *
 * Igual que aquella: la figura se mueve con lo elegido y, si fue un error,
 * vuelve a lo que de verdad pasa cuando sale «Iba aquí». No puntúa.
 */
function SegundaT1_2({ opciones, correcta, porque, onPintar, onResuelta }) {
  const [elegida, setElegida] = useState(null);
  const reloj = useRef(null);
  useEffect(() => () => clearTimeout(reloj.current), []);
  const fin = elegida !== null;
  const ok = fin && elegida === correcta;
  const mala = fin && !ok ? opciones.find((o) => o.id === elegida) : null;

  const elegir = (id) => {
    if (fin) return;
    setElegida(id);
    onPintar(SEGUNDA_T1_2.escena[id]);
    if (id !== correcta) {
      clearTimeout(reloj.current);
      reloj.current = setTimeout(() => onPintar(SEGUNDA_T1_2.escena[correcta]), RETRASO_REVELA_MS);
    }
    onResuelta(id === correcta, id);
  };

  return (
    <div data-segunda-decision style={{ marginTop: "14px" }}>
      <p data-pregunta-segunda style={{ margin: "0 0 8px", fontFamily: SORA, fontSize: "14px", fontWeight: 600, lineHeight: 1.35, color: FAE.text }}>
        {SEGUNDA_T1_2.pregunta}
      </p>
      <div role="group" aria-label={SEGUNDA_T1_2.pregunta} style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
        {opciones.map((o) => {
          const estado = !fin ? REPOSO : o.id === correcta ? ACIERTO : o.id === elegida ? FANTASMA : REPOSO;
          return (
            <button
              key={o.id}
              type="button"
              data-opcion-segunda={o.id}
              data-estado={estado}
              aria-pressed={elegida === o.id}
              disabled={fin}
              onClick={() => elegir(o.id)}
              style={{
                minHeight: "44px", padding: "6px 10px", borderRadius: "10px", boxSizing: "border-box", textAlign: "left",
                display: "flex", alignItems: "center", gap: "6px", cursor: fin ? "default" : "pointer",
                color: FAE.text, fontFamily: INTER, fontSize: "13px", lineHeight: 1.3,
                ...estiloC2(estado),
              }}
            >
              {fin && o.id === correcta && <IconoCheck />}
              {fin && o.id === elegida && o.id !== correcta && <IconoX />}
              <span>{o.texto}</span>
            </button>
          );
        })}
      </div>
      <RegionViva>
        {fin && <Mensaje ok={ok} texto={ok ? porque : mala?.msg ?? null} />}
      </RegionViva>
    </div>
  );
}

/*
 * ═══════════ EL MODO DEMO DE «ASÍ SE JUEGA» ═══════════
 *
 * Es este mismo componente: `items` le da el ejemplo desde afuera y `modoDemo`
 * le quita el encabezado, la segunda decisión y el avance, y no llama a
 * `onCompletar`.
 */
export default function QueEntroYQueSalio({
  Marco, rotulo, titulo, acento, onCompletar, items = null, modoDemo = false,
}) {
  const t = useTanda(() => items ?? sortearT1_2(barajar));

  const [r, setR] = useState(null);
  const [respuestas, setRespuestas] = useState([]);
  const [marcada, setMarcada] = useState(null);
  /* La segunda decisión (D4): su escena para los dos recuadros. No puntúa. */
  const [escenaSegunda, setEscenaSegunda] = useState(null);
  const [segundaHecha, setSegundaHecha] = useState(false);
  const [segundaElegida, setSegundaElegida] = useState(null);
  const zonaBoton = useRef(null);

  const e = t.items[t.i];
  const cuantas = t.items.length;
  const pct = puntuar(respuestas, cuantas);

  useEffect(() => {
    if (t.terminado && !modoDemo) onCompletar?.(pct, Date.now() - t.inicio.current, t.detalle.current);
  }, [t.terminado]);
  useEffect(() => {
    if (r && !modoDemo && segundaHecha) zonaBoton.current?.focus();
  }, [r, segundaHecha]);

  /* Un intento: tocar la clase es responder. */
  const responder = (clase) => {
    if (r) return;
    const nuevo = evaluarT1_2(e, clase);
    setMarcada(clase);
    t.anotar(e.id, nuevo.ok, nuevo.ok ? null : clase);
    setRespuestas((xs) => [...xs, { id: e.id, primeroOk: nuevo.ok }]);
    setR(nuevo);
  };

  const avanzar = () => {
    setR(null); setMarcada(null);
    setEscenaSegunda(null); setSegundaHecha(false); setSegundaElegida(null);
    if (t.i + 1 < cuantas) t.setI(t.i + 1);
    else t.setTerminado(true);
  };
  const reiniciar = () => {
    t.reiniciar(); setR(null); setRespuestas([]); setMarcada(null);
    setEscenaSegunda(null); setSegundaHecha(false); setSegundaElegida(null);
  };

  if (t.terminado) {
    const bien = respuestas.filter((x) => x.primeroOk).length;
    return (
      <Marco rotulo={rotulo} titulo={titulo} acento={acento}>
        <Cierre pct={Math.round(pct)} onReiniciar={reiniciar} textoReiniciar="Otra tanda">
          <p style={TEXTO_CIERRE}>
            {bien} de {cuantas} al primer intento. Cada empresa valía {pesoDeCadaItem(cuantas).toFixed(2)} %.
          </p>
        </Cierre>
      </Marco>
    );
  }

  /*
   * En el error E se resalta el objeto que SÍ existe; en el G, el recuadro de
   * entrada que dice «sin insumo físico». Los demás resaltan los dos a la vez.
   * Con la segunda decisión, manda ella.
   */
  const escena = r && !r.ok ? ESCENA_ERROR[r.clave] ?? "los-dos" : null;
  const esc = escenaSegunda;
  const marcaEntra = esc ? esc.entra === "marcado" : Boolean(r?.ok) || escena === "los-dos" || escena === "entra-vacio";
  const marcaSale = esc ? esc.sale === "marcado" : Boolean(r?.ok) || escena === "los-dos" || escena === "objeto";
  const trazoCortado = esc?.trazo === "cortado";
  const textoSegunda = segundaElegida ? opcionesSegundaT1_2(e).find((o) => o.id === segundaElegida)?.msg ?? "" : "";
  const mandaAMirarEntra = /ENTRA/.test(`${r?.texto ?? ""} ${textoSegunda}`);
  const trazoTenue = esc?.trazo === "vacio";

  const estadoDe = (id) => {
    if (!r) return REPOSO;
    if (id === e.clase) return ACIERTO;
    if (id === marcada) return FANTASMA;
    return REPOSO;
  };
  const marcaDe = (id) => {
    if (!r) return null;
    if (id === e.clase) return r.ok ? CORRECTA : REVELADA;
    if (id === marcada) return TACHADA;
    return null;
  };

  return (
    <Marco rotulo={rotulo} titulo={titulo} acento={acento}>
      <style>{CSS}{CSS_B5H}{CSS_REGISTRO}</style>
      <div className={CLASE_B5H} data-t12>
        {!modoDemo && (
          <EncabezadoCompacto
            objetivo={T1_2.objetivo}
            contador={contadorDe("Empresa", t.i + 1, cuantas)}
            consigna={T1_2.consigna}
          />
        )}

        {/*
          ═══════ AQUÍ DENTRO NO ENTRA EL VOCABULARIO DEL TEMA 2 ═══════
          Ni teal ni ámbar: todavía no significan debe ni haber. Hay una prueba
          que mira exactamente dentro de esta caja.
        */}
        <div data-contenido>
          <p data-empresa={e.id} style={{
            margin: "0 0 11px", fontFamily: SORA, fontSize: "14px", fontWeight: 700, color: FAE.text,
          }}>
            {e.empresa}
          </p>

          {/* Apilados: son secuenciales, y la flecha con su relación va entre los dos. */}
          <div data-escenario style={{ display: "flex", flexDirection: "column", gap: "4px" }}>
            <Recuadro
              rotulo={ROTULO_ENTRA}
              texto={e.entra}
              marcado={marcaEntra}
              late={escena === "entra-vacio"}
              vacio={sinObjeto(e)}
              /*
                ENTRA no se atenúa mientras en pantalla haya una devolución que
                manda a mirarlo («Mira el cuadro de ENTRA»; Shoko, #535 b): el
                único elemento al que apunta el auto-rescate no puede quedar apagado.
              */
              atenuado={esc?.entra === "atenuado" && !mandaAMirarEntra}
            />

            {/*
              La flecha. Antes de responder va vacía (R10: la relación es la
              respuesta con otras palabras). Después, SIEMPRE la relación
              correcta —el registro—, y si erró, al lado la de la clase que
              eligió, tachada y en coral discontinuo. El renglón reserva dos
              líneas: la escena no crece al responder.
            */}
            <div data-flecha style={{
              minHeight: `${ALTO_RELACION}px`, display: "flex", flexWrap: "wrap", alignItems: "center", justifyContent: "center", gap: "4px 8px",
            }}>
              {r ? (
                <>
                  <span data-trazo={e.relacion} data-trazo-estado={esc?.trazo ?? undefined} className={CLASE_ENTRA} style={{
                    padding: "2px 8px", borderRadius: "7px", background: NEUTRO, color: NAVY_DEL_CHIP,
                    fontFamily: INTER, fontSize: "12px", fontWeight: 600, lineHeight: "16px",
                    opacity: trazoTenue ? 0.35 : 1,
                    textDecoration: trazoCortado ? "line-through" : "none",
                    outline: trazoCortado ? `2px solid ${FAE.coral}` : "none",
                  }}>
                    ↓ {e.relacion.toLowerCase()}
                  </span>
                  {!r.ok && (
                    <span data-trazo-fantasma={marcada} className={CLASE_ENTRA} style={{
                      display: "inline-flex", alignItems: "center", gap: "4px",
                      padding: "1px 7px", borderRadius: "7px", border: `2px dashed ${FAE.coral}`,
                      color: FAE.text, fontFamily: INTER, fontSize: "12px", fontWeight: 600, lineHeight: "16px",
                    }}>
                      <IconoX />
                      <s>{RELACION_DE_CLASE[marcada]}</s>
                    </span>
                  )}
                </>
              ) : (
                <span aria-hidden="true" style={{ color: "rgba(248,249,250,0.3)", fontSize: "14px" }}>↓</span>
              )}
            </div>

            <Recuadro
              rotulo={ROTULO_SALE}
              texto={e.sale}
              marcado={marcaSale}
              late={escena === "objeto"}
              vacio={false}
              atenuado={esc?.sale === "atenuado"}
            />
          </div>

          {/* La pregunta, en neutro y sin mayúsculas: el ámbar es solo del haber (Shoko). */}
          <p data-pregunta-clase style={{
            margin: "14px 0 8px", fontFamily: SORA, fontSize: "14px", fontWeight: 600, lineHeight: 1.35, color: FAE.text,
          }}>
            {T1_2.pregunta}
          </p>

          <div role="group" aria-label={T1_2.pregunta} style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
            {CLASES.map((c) => {
              const m = marcaDe(c.id);
              return (
                <button
                  key={c.id}
                  type="button"
                  data-clase={c.id}
                  data-marcada={marcada === c.id ? "si" : "no"}
                  data-estado={estadoDe(c.id)}
                  aria-pressed={marcada === c.id}
                  disabled={Boolean(r)}
                  onClick={r ? undefined : () => responder(c.id)}
                  style={{
                    display: "flex", alignItems: "center", justifyContent: "space-between", gap: "6px",
                    textAlign: "left", minHeight: "44px", padding: "5px 9px", borderRadius: "10px", boxSizing: "border-box",
                    cursor: r ? "default" : "pointer", color: FAE.text,
                    fontFamily: INTER, fontSize: "13px", lineHeight: 1.25,
                    ...estiloC2(estadoDe(c.id)),
                  }}
                >
                  <span style={{ minWidth: 0 }}>{c.nombre}</span>
                  {m && <Pastilla marca={m} />}
                </button>
              );
            })}
          </div>
        </div>

        <RegionViva>
          {r && <Mensaje ok={r.ok} texto={sinEmoji(r.texto)} />}
        </RegionViva>

        {/*
          ═══════ LA SEGUNDA DECISIÓN (D4) ═══════
          La primera clasifica la empresa; esta pregunta la CONSECUENCIA de esa
          clase. Sale tras la primera, se acierte o no. En la demo no sale.
        */}
        {r && !modoDemo && (
          <SegundaT1_2
            key={e.id}
            opciones={opcionesSegundaT1_2(e)}
            correcta={correctaSegundaT1_2(e)}
            porque={porqueSegundaT1_2(e)}
            onPintar={setEscenaSegunda}
            onResuelta={(_, id) => { setSegundaHecha(true); setSegundaElegida(id); }}
          />
        )}

        {r && !modoDemo && segundaHecha && (
          <Avance onClick={avanzar} refBoton={zonaBoton}>
            {t.i + 1 === cuantas ? "Ver el resultado" : "Siguiente empresa"}
          </Avance>
        )}

        {!modoDemo && <p style={SOLO_LECTOR}>{ALT_T1_2}</p>}
      </div>
    </Marco>
  );
}
