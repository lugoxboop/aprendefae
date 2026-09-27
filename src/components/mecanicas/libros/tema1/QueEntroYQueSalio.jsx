import { useEffect, useRef, useState } from "react";
import { barajar } from "../../../../utils/barajar.js";
import { FAE } from "../../../../theme.js";
import { NEUTRO, NAVY_DEL_CHIP } from "../../../../data/contabilidadIntro.js";
import {
  T1_2, CLASES, ROTULO_ENTRA, ROTULO_SALE, ALT_T1_2, ESCENA_ERROR,
} from "../../../../data/contabilidadTema1.js";
import {
  sortearT1_2, evaluarT1_2, puntuar, pesoDeCadaItem, sinObjeto,
} from "../../../../contabilidad/tema1.js";
import { Retro, Pulsos, Cierre } from "../../corazon/juego.jsx";
import { TEXTO_CIERRE } from "../../bloques/marcos.jsx";
import { Responder, useTanda } from "../piezas.jsx";
import { useMovimientoReducido, SOLO_LECTOR } from "../verbos.jsx";

/*
 * ═══════════════════════════════════════════════════════════════════════════
 * T1-2 · ¿QUÉ ENTRÓ Y QUÉ SALIÓ?
 *
 * Dos recuadros —lo que entra y lo que sale— y cinco clases. La pregunta no es
 * «¿qué vende esta empresa?» sino «¿qué le pasó adentro a lo que entró?», que
 * es el criterio del libro y el que separa una comercial de una industrial.
 *
 * ═══════════ EL TRAZO ES LA PISTA, Y LLEGA DESPUÉS ═══════════
 *
 * Entre los dos recuadros aparece la relación escrita —«lo mismo»,
 * «transformado», «criado», «extraído», «no hay objeto»— y eso ES la
 * respuesta con otras palabras. Solo se dibuja al acertar: enseñarla antes
 * sería contestar la pregunta.
 *
 * ═══════════ Y EL RECUADRO DE ENTRADA NUNCA VA VACÍO ═══════════
 *
 * Cuando no hay insumo, dice «sin insumo físico». Un hueco en blanco se lee
 * como un fallo de carga, y además esa frase es el dato: que no entre nada es
 * lo que distingue a una de servicios y a una minera.
 * ═══════════════════════════════════════════════════════════════════════════
 */

const CSS = `
@keyframes fae-t12-marca { from { opacity: 0; transform: scale(0.97); } to { opacity: 1; transform: none; } }
.fae-t12-marca { animation: fae-t12-marca 300ms ease-out both; }
@keyframes fae-t12-rebota {
  0% { transform: translateX(0); } 30% { transform: translateX(-5px); }
  60% { transform: translateX(4px); } 100% { transform: translateX(0); }
}
.fae-t12-rebota { animation: fae-t12-rebota 400ms ease-out 1; }
@keyframes fae-t12-trazo { from { opacity: 0; } to { opacity: 1; } }
.fae-t12-trazo { animation: fae-t12-trazo 400ms ease-out both; }
@keyframes fae-t12-late { 0%, 100% { background: transparent; } 50% { background: rgba(184,196,212,0.22); } }
.fae-t12-late { animation: fae-t12-late 900ms ease-in-out 1; }
@media (prefers-reduced-motion: reduce) {
  .fae-t12-marca, .fae-t12-rebota, .fae-t12-trazo, .fae-t12-late {
    animation: none !important; opacity: 1 !important; transform: none !important;
  }
}
`;

const SORA = "Sora, sans-serif";

function Recuadro({ rotulo, texto, marcado, late, vacio }) {
  return (
    <div
      data-recuadro={rotulo}
      data-marcado={marcado ? "si" : "no"}
      className={late ? "fae-t12-late" : undefined}
      style={{
        padding: "9px 10px", borderRadius: "11px",
        background: "rgba(10,20,34,0.45)",
        border: `${marcado ? 2 : 1}px solid ${marcado ? NEUTRO : "rgba(248,249,250,0.14)"}`,
      }}
    >
      <p style={{
        margin: "0 0 4px", fontFamily: SORA, fontSize: "9px", fontWeight: 700,
        letterSpacing: "0.14em", color: "rgba(248,249,250,0.5)",
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

export default function QueEntroYQueSalio({ Marco, rotulo, titulo, acento, onCompletar }) {
  const reducido = useMovimientoReducido();
  const t = useTanda(() => sortearT1_2(barajar));

  const [r, setR] = useState(null);
  const [intento, setIntento] = useState(0);
  const [respuestas, setRespuestas] = useState([]);
  const [marcada, setMarcada] = useState(null);
  const [rebotando, setRebotando] = useState(null);
  const reloj = useRef(null);
  const zonaBoton = useRef(null);

  const e = t.items[t.i];
  const cuantas = t.items.length;
  const pct = puntuar(respuestas, cuantas);
  const esperandoReintento = Boolean(r && !r.ok && intento === 1);
  const puedeResponder = !r || esperandoReintento;

  useEffect(() => {
    if (t.terminado) onCompletar?.(pct, Date.now() - t.inicio.current, t.detalle.current);
  }, [t.terminado]);
  useEffect(() => () => clearTimeout(reloj.current), []);
  useEffect(() => {
    if (r && !esperandoReintento) zonaBoton.current?.querySelector("button")?.focus();
  }, [r, esperandoReintento]);

  const responder = (clase) => {
    if (r && !esperandoReintento) return;
    const nuevo = evaluarT1_2(e, clase);

    if (!nuevo.ok) {
      /* La clase se desmarca: no queda ninguna elección falsa en pantalla. */
      setMarcada(null);
      setRebotando(clase);
      clearTimeout(reloj.current);
      reloj.current = setTimeout(() => setRebotando(null), 420);
    } else {
      setMarcada(clase);
    }

    if (intento === 0) {
      t.anotar(e.id, nuevo.ok, nuevo.ok ? null : clase);
      if (!nuevo.ok) { setR({ ...nuevo, primero: true }); setIntento(1); return; }
      setRespuestas((xs) => [...xs, { id: e.id, primeroOk: true }]);
      setR({ ...nuevo, primero: true });
      return;
    }
    setRespuestas((xs) => [...xs, { id: e.id, primeroOk: false, segundoOk: nuevo.ok }]);
    setIntento(2);
    setR({ ...nuevo, primero: false });
  };

  const avanzar = () => {
    setR(null); setIntento(0); setMarcada(null); setRebotando(null);
    if (t.i + 1 < cuantas) t.setI(t.i + 1);
    else t.setTerminado(true);
  };
  const reiniciar = () => {
    t.reiniciar(); setR(null); setIntento(0); setRespuestas([]); setMarcada(null); setRebotando(null);
  };

  if (t.terminado) {
    const bien = respuestas.filter((x) => x.primeroOk).length;
    return (
      <Marco rotulo={rotulo} titulo={titulo} acento={acento}>
        <style>{CSS}</style>
        <Cierre pct={Math.round(pct)} onReiniciar={reiniciar} textoReiniciar="Otra tanda">
          <p style={TEXTO_CIERRE}>
            {bien} de {cuantas} al primer intento. Cada empresa valía {pesoDeCadaItem(cuantas).toFixed(2)} %.
          </p>
        </Cierre>
      </Marco>
    );
  }

  const acertado = r?.ok === true;
  /*
   * En el error E se resalta el objeto que SÍ existe; en el G, el recuadro de
   * entrada que dice «sin insumo físico». Los demás resaltan los dos a la vez.
   */
  const escena = r && !r.ok ? ESCENA_ERROR[r.clave] ?? "los-dos" : null;
  const marcaEntra = acertado || escena === "los-dos" || escena === "entra-vacio";
  const marcaSale = acertado || escena === "los-dos" || escena === "objeto";

  return (
    <Marco rotulo={rotulo} titulo={titulo} acento={acento}>
      <style>{CSS}</style>
      <div style={{ marginBottom: "12px" }}>
        <Pulsos total={cuantas} hechos={t.i + (r && !esperandoReintento ? 1 : 0)} etiqueta="Empresa" />
      </div>

      {/*
        ═══════ AQUÍ DENTRO NO ENTRA EL VOCABULARIO DEL TEMA 2 ═══════
        Esta marca no es decorativa: delimita el CONTENIDO de la actividad
        frente a los rótulos del marco. El teal y el ámbar siguen valiendo en
        la interfaz —encabezados, botones, navegación— y no pueden aparecer
        aquí dentro, donde todavía no significan debe ni haber. Hay una prueba
        que mira exactamente dentro de esta caja.
      */}
      <div data-contenido>
      <p data-empresa={e.id} style={{
        margin: "0 0 11px", fontFamily: SORA, fontSize: "14px", fontWeight: 700, color: FAE.text,
      }}>
        {e.empresa}
      </p>

      {/* Apilados: son secuenciales, y el trazo va entre los dos. */}
      <div style={{ display: "flex", flexDirection: "column", gap: "4px" }}>
        <Recuadro
          rotulo={ROTULO_ENTRA}
          texto={e.entra}
          marcado={marcaEntra}
          late={escena === "entra-vacio"}
          vacio={sinObjeto(e)}
        />

        <div style={{ minHeight: "26px", display: "flex", alignItems: "center", justifyContent: "center" }}>
          {acertado ? (
            <span data-trazo={e.relacion} className="fae-t12-trazo" style={{
              padding: "2px 8px", borderRadius: "7px", background: NEUTRO, color: NAVY_DEL_CHIP,
              fontFamily: SORA, fontSize: "10.5px", fontWeight: 700,
            }}>
              ↓ {e.relacion.toLowerCase()}
            </span>
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
        />
      </div>

      {/* Rótulo de sección: es interfaz de marca, no contenido de la actividad. */}
      <p data-rotulo-seccion style={{
        margin: "14px 0 8px", fontFamily: SORA, fontSize: "10.5px",
        fontWeight: 700, letterSpacing: "0.16em", color: acento,
      }}>
        {esperandoReintento ? "INTÉNTALO OTRA VEZ" : T1_2.pregunta.toUpperCase()}
      </p>

      <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
        {CLASES.map((c) => {
          const esta = marcada === c.id;
          const rebota = rebotando === c.id;
          return (
            <button
              key={c.id}
              type="button"
              data-clase={c.id}
              data-marcada={esta ? "si" : "no"}
              disabled={!puedeResponder}
              onClick={puedeResponder ? () => responder(c.id) : undefined}
              className={rebota ? "fae-t12-rebota" : esta ? "fae-t12-marca" : undefined}
              style={{
                textAlign: "left", padding: "9px 11px", borderRadius: "10px",
                cursor: puedeResponder ? "pointer" : "default",
                background: esta ? "rgba(184,196,212,0.12)" : "rgba(10,20,34,0.4)",
                border: rebota
                  ? `1px dashed ${FAE.coral}`
                  : `${esta ? 2 : 1}px solid ${esta ? NEUTRO : "rgba(248,249,250,0.16)"}`,
                color: FAE.text, fontSize: "12.5px",
                opacity: !puedeResponder && !esta ? 0.5 : 1,
              }}
            >
              {c.nombre}
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
          Ninguna clase quedó marcada.
        </p>
      )}

      </div>

      {r && <Retro texto={r.texto} />}

      {r && !esperandoReintento && (
        <div ref={zonaBoton}>
          <Responder onClick={avanzar}>
            {t.i + 1 === cuantas ? "Ver el resultado" : "Siguiente empresa"}
          </Responder>
        </div>
      )}

      <p style={SOLO_LECTOR}>{ALT_T1_2}</p>
    </Marco>
  );
}
