import { useEffect, useRef, useState } from "react";
import { barajar } from "../../../../utils/barajar.js";
import { FAE } from "../../../../theme.js";
import { ESTACIONES, NEUTRO, NAVY_DEL_CHIP, TEXTO_ATENUADO } from "../../../../data/contabilidadIntro.js";
import {
  T1_1, ZONA_DENTRO, ZONA_FUERA, ROTULO_ZONA, ROTULO_DEL_TRAZO, ALT_T1_1, SEGUNDA_T1_1,
} from "../../../../data/contabilidadTema1.js";
import {
  sortearT1_1, evaluarT1_1, puntuar, pesoDeCadaItem, INTERNOS,
  opcionesSegundaT1_1, correctaSegundaT1_1, porqueSegundaT1_1,
} from "../../../../contabilidad/tema1.js";
import SegundaDecisionT1 from "./segundaDecision.jsx";
import { Retro, Pulsos, Cierre } from "../../corazon/juego.jsx";
import { TEXTO_CIERRE } from "../../bloques/marcos.jsx";
import { Responder, useTanda } from "../piezas.jsx";
import { useMovimientoReducido, SOLO_LECTOR } from "../verbos.jsx";
import FranjaDelCiclo from "../intro/FranjaDelCiclo.jsx";
import { Encabezado } from "./encabezado.jsx";

/*
 * ═══════════════════════════════════════════════════════════════════════════
 * T1-1 · ¿DESDE DÓNDE PREGUNTAN?
 *
 * Vuelve el anillo de la pieza 1, con la estación 5 encendida: la que recibe
 * el resumen. Llega una pregunta y el estudiante decide si quien la hace
 * pertenece a la empresa o la consulta desde afuera.
 *
 * ═══════════ DOS SEÑALES QUE NO SIGNIFICAN LO MISMO ═══════════
 *
 * La zona dice si PERTENECE a la empresa. El trazo de retorno dice si su
 * decisión CAMBIA lo que la empresa hace. Un propietario está dentro y no
 * enciende el trazo; y eso no es un detalle — es la confusión que la actividad
 * ataca. Por eso el trazo no se enciende por acertar, sino solo cuando el
 * usuario es de verdad el que cierra el ciclo.
 *
 * Y EN UN ERROR NO SE ENCIENDE NUNCA. Encenderlo sería contestar con la señal
 * equivocada: el criterio de la zona no es quién decide.
 *
 * ═══════════ LAS ZONAS NO SE DISTINGUEN POR COLOR ═══════════
 *
 * Si «dentro» fuera de un tono y «fuera» de otro, la clasificación estaría
 * regalada antes de pensarla. Se distinguen por dónde están: la de dentro
 * TOCA la franja del ciclo; la de fuera está separada por un blanco real. Más
 * su rótulo escrito, que es lo que lee quien no ve la diferencia de posición.
 * ═══════════════════════════════════════════════════════════════════════════
 */

const CSS = `
@keyframes fae-t11-asienta { from { opacity: 0; transform: translateY(-8px); } to { opacity: 1; transform: none; } }
.fae-t11-asienta { animation: fae-t11-asienta 400ms cubic-bezier(.26,.84,.38,1) both; }
@keyframes fae-t11-rebota {
  0% { transform: translateX(0); } 30% { transform: translateX(-6px); }
  60% { transform: translateX(4px); } 100% { transform: translateX(0); }
}
.fae-t11-rebota { animation: fae-t11-rebota 500ms ease-out 1; }
@keyframes fae-t11-aparece { from { opacity: 0; } to { opacity: 1; } }
.fae-t11-aparece { animation: fae-t11-aparece 300ms ease-out 400ms both; }
@keyframes fae-t11-pulso { 0%, 100% { opacity: 0.6; } 50% { opacity: 1; } }
.fae-t11-pulso { animation: fae-t11-pulso 2s ease-in-out infinite; }
@media (prefers-reduced-motion: reduce) {
  .fae-t11-asienta, .fae-t11-rebota, .fae-t11-aparece, .fae-t11-pulso {
    animation: none !important; opacity: 1 !important; transform: none !important;
  }
}
`;

const SORA = "Sora, sans-serif";

/*
 * El anillo de la pieza 1, compacto y con la estación 5 encendida.
 *
 * `escena` es la de la SEGUNDA decisión: hasta dónde del ciclo alcanza a ver
 * quien pregunta. Mientras no haya elegido va en null y el anillo abre como
 * siempre —la 5 encendida y las otras cuatro en reposo—, que es lo que
 * comprueba t1-actividades. Las tres escenas se ven distintas entre sí Y
 * distintas de la apertura: encender las cinco, encender solo el informe y
 * apagar las otras, o apagarlas todas.
 */
function Anillo({ retorno, reducido, resaltado, escena = null }) {
  const vista = escena?.anillo ?? null;
  const LA_DEL_INFORME = 4;
  const enciende = (n) => {
    if (vista === "todas") return true;
    if (vista === "solo-el-informe") return n === LA_DEL_INFORME;
    if (vista === "ninguna") return false;
    return n === ESTACIONES.length;
  };
  return (
    <div data-anillo style={{ display: "flex", gap: "6px", alignItems: "stretch" }}>
      <FranjaDelCiclo retorno={retorno} reducido={reducido} />
      <div style={{ flex: 1, minWidth: 0, display: "flex", flexDirection: "column", gap: "4px" }}>
        {ESTACIONES.map((e) => {
          const encendida = enciende(e.n);
          /* Lo apagado por la segunda decisión se atenúa de verdad: así «solo
             el informe» no se confunde con la apertura, donde nada está apagado. */
          const apagada = vista !== null && vista !== "todas" && !encendida;
          /*
           * Los puntos 1 a 4 van atenuados, pero la opacidad va en el borde
           * y no en la fila entera: heredada, dejaba el número en 3,0:1 y el
           * nombre en 2,2:1. El texto va en #A8B6C8 sólido, como en T1-8.
           */
          const tenue = !(encendida || resaltado);
          return (
            <div
              key={e.n}
              data-estacion={e.n}
              data-encendida={encendida ? "si" : "no"}
              data-apagada={apagada ? "si" : undefined}
              style={{
                display: "flex", gap: "6px", alignItems: "center",
                /*
                 * Solo lo apagado por la segunda decisión lleva opacidad en la
                 * fila. En reposo NO va ninguna: la atenuación de los puntos 1
                 * a 4 vive en el borde y el texto va en #A8B6C8 sólido, y hay
                 * una prueba que exige que la fila no traiga opacity.
                 */
                opacity: apagada ? 0.35 : undefined,
                padding: "5px 7px", borderRadius: "9px",
                background: resaltado ? "rgba(184,196,212,0.1)" : "transparent",
                border: `${encendida ? 2 : 1}px solid ${tenue ? "rgba(248,249,250,0.063)" : NEUTRO}`,
                transition: "border-color 300ms ease, background 300ms ease",
              }}
            >
              <span style={{
                flex: "none", width: "15px", height: "15px", borderRadius: "999px",
                border: `1px solid ${tenue ? "rgba(184,196,212,0.45)" : NEUTRO}`,
                color: tenue ? TEXTO_ATENUADO : NEUTRO, fontFamily: SORA,
                fontSize: "9px", fontWeight: 700, lineHeight: "14px", textAlign: "center",
              }}>
                {e.n}
              </span>
              <span data-nombre-estacion style={{ fontSize: "10.5px", color: encendida ? FAE.text : TEXTO_ATENUADO }}>
                {e.nombre}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
}

/*
 * ═══════════ EL MODO DEMO DE «ASÍ SE JUEGA» ═══════════
 *
 * Es este mismo componente, no una copia dibujada: `items` le da el ejemplo
 * desde afuera en vez de sortearlo del banco, y `modoDemo` le quita lo que no
 * es la zona de juego —el encabezado, el avance, el botón de seguir— y le
 * corta la salida: no llama a `onCompletar`, así que no hay FP, ni intentos,
 * ni progreso. Cómo se juega no cambia en nada; eso es lo que se enseña.
 */
export default function DesdeDondePreguntan({
  Marco, rotulo, titulo, acento, onCompletar, items = null, modoDemo = false, onComoSeJuega = null,
}) {
  const reducido = useMovimientoReducido();
  const t = useTanda(() => items ?? sortearT1_1(barajar));

  const [r, setR] = useState(null);
  const [intento, setIntento] = useState(0);
  const [respuestas, setRespuestas] = useState([]);
  const [rebotando, setRebotando] = useState(null);
  const [colocadas, setColocadas] = useState([]);
  /*
   * La segunda decisión (D4): su escena para el anillo y si ya se tomó. No
   * entra en `respuestas` ni en `t.detalle` — no puntúa — pero sí hace falta
   * para avanzar: una decisión que se puede saltar no es una decisión.
   */
  const [escenaSegunda, setEscenaSegunda] = useState(null);
  const [segundaHecha, setSegundaHecha] = useState(false);
  const reloj = useRef(null);
  const zonaBoton = useRef(null);

  const u = t.items[t.i];
  const cuantas = t.items.length;
  const pct = puntuar(respuestas, cuantas);
  const esperandoReintento = Boolean(r && !r.ok && intento === 1);
  const puedeResponder = !r || esperandoReintento;

  useEffect(() => {
    if (t.terminado && !modoDemo) onCompletar?.(pct, Date.now() - t.inicio.current, t.detalle.current);
  }, [t.terminado]);
  useEffect(() => () => clearTimeout(reloj.current), []);
  useEffect(() => {
    if (r && !esperandoReintento && !modoDemo && segundaHecha) zonaBoton.current?.querySelector("button")?.focus();
  }, [r, esperandoReintento, segundaHecha]);

  const responder = (zona) => {
    if (r && !esperandoReintento) return;
    const nuevo = evaluarT1_1(u, zona);

    if (!nuevo.ok) {
      /* La pregunta no se asienta: se detiene en el borde y vuelve a flotar. */
      setRebotando(zona);
      clearTimeout(reloj.current);
      reloj.current = setTimeout(() => setRebotando(null), 520);
    } else {
      setColocadas((xs) => [...xs, { usuario: u, zona }]);
    }

    if (intento === 0) {
      t.anotar(u.id, nuevo.ok, nuevo.ok ? null : zona);
      if (!nuevo.ok) { setR({ ...nuevo, primero: true }); setIntento(1); return; }
      setRespuestas((xs) => [...xs, { id: u.id, primeroOk: true }]);
      setR({ ...nuevo, primero: true });
      return;
    }
    setRespuestas((xs) => [...xs, { id: u.id, primeroOk: false, segundoOk: nuevo.ok }]);
    setIntento(2);
    setR({ ...nuevo, primero: false });
  };

  const avanzar = () => {
    setR(null); setIntento(0); setRebotando(null);
    setEscenaSegunda(null); setSegundaHecha(false);
    if (t.i + 1 < cuantas) t.setI(t.i + 1);
    else t.setTerminado(true);
  };
  const reiniciar = () => {
    t.reiniciar(); setR(null); setIntento(0); setRespuestas([]); setColocadas([]); setRebotando(null);
    setEscenaSegunda(null); setSegundaHecha(false);
  };

  if (t.terminado) {
    const bien = respuestas.filter((x) => x.primeroOk).length;
    return (
      <Marco rotulo={rotulo} titulo={titulo} acento={acento}>
        <style>{CSS}</style>
        <Cierre pct={Math.round(pct)} onReiniciar={reiniciar} textoReiniciar="Otra tanda">
          <p style={TEXTO_CIERRE}>
            {bien} de {cuantas} al primer intento. Cada pregunta valía {pesoDeCadaItem(cuantas).toFixed(2)} %.
          </p>
        </Cierre>
        <div style={{ marginTop: "14px" }}>
          <Anillo retorno="atenuado" reducido={reducido} />
          <ul data-colocadas style={{ margin: "12px 0 0", padding: 0, listStyle: "none", display: "flex", flexDirection: "column", gap: "5px" }}>
            {colocadas.map((c) => (
              <li key={c.usuario.id} data-colocada={c.zona} style={{ fontSize: "11.5px", color: "rgba(248,249,250,0.7)" }}>
                {c.usuario.nombre} — {ROTULO_ZONA[c.zona].toLowerCase()}
              </li>
            ))}
          </ul>
        </div>
      </Marco>
    );
  }

  const acertado = r?.ok === true;
  const zona = (cual) => {
    const esDentro = cual === ZONA_DENTRO;
    const activa = puedeResponder;
    const asentada = acertado && r && u.zona === cual;
    return (
      <button
        type="button"
        data-zona={cual}
        data-rebotando={rebotando === cual ? "si" : undefined}
        disabled={!activa}
        onClick={activa ? () => responder(cual) : undefined}
        className={rebotando === cual ? "fae-t11-rebota" : undefined}
        aria-label={ROTULO_ZONA[cual]}
        style={{
          display: "block", textAlign: "left",
          /*
           * ═══════════ NI «WIDTH: 100%» NI NADA PARECIDO ═══════════
           *
           * Llevaba `width: 100%`, y con el margen de la zona de fuera eso son
           * 100% MÁS 26 px: la caja se salía del panel y el borde punteado
           * quedaba cortado contra el filo de la pantalla. No se veía en las
           * pruebas —el DOM no se queja— ni hacía aparecer barra de scroll.
           *
           * Sin ancho declarado, el flex de arriba la estira hasta el borde y
           * el margen sale de dentro, que es lo que hay que hacer.
           */
          /* La de dentro TOCA la franja; la de fuera se separa con un blanco. */
          marginLeft: esDentro ? 0 : "26px",
          padding: "9px 10px", borderRadius: "10px", cursor: activa ? "pointer" : "default",
          background: "transparent",
          border: rebotando === cual
            ? `1px dashed ${FAE.coral}`
            : `1px solid ${esDentro ? NEUTRO : "rgba(248,249,250,0.22)"}`,
          borderStyle: esDentro ? "solid" : "dashed",
          color: FAE.text,
        }}
      >
        <span style={{ fontFamily: SORA, fontSize: "9.5px", fontWeight: 700, letterSpacing: "0.1em", color: "rgba(248,249,250,0.6)" }}>
          {ROTULO_ZONA[cual]}
        </span>
        {asentada && (
          <span data-asentada={u.id} className="fae-t11-asienta" style={{
            display: "block", marginTop: "5px", padding: "5px 7px", borderRadius: "7px",
            background: NEUTRO, color: NAVY_DEL_CHIP, fontFamily: SORA,
            fontSize: "11px", fontWeight: 700,
          }}>
            {u.nombre}
          </span>
        )}
      </button>
    );
  };

  return (
    <Marco rotulo={rotulo} titulo={titulo} acento={acento}>
      <style>{CSS}</style>
      {!modoDemo && (
        <>
          <Encabezado objetivo={T1_1.objetivo} consigna={T1_1.consigna} onComoSeJuega={onComoSeJuega} />
          <div style={{ marginBottom: "12px" }}>
            <Pulsos total={cuantas} hechos={t.i + (r && !esperandoReintento ? 1 : 0)} enCurso={t.i + 1} etiqueta="Pregunta" />
          </div>
        </>
      )}

      {/*
        ═══════ AQUÍ DENTRO NO ENTRA EL VOCABULARIO DEL TEMA 2 ═══════
        Esta marca no es decorativa: delimita el CONTENIDO de la actividad
        frente a los rótulos del marco. El teal y el ámbar siguen valiendo en
        la interfaz —encabezados, botones, navegación— y no pueden aparecer
        aquí dentro, donde todavía no significan debe ni haber. Hay una prueba
        que mira exactamente dentro de esta caja.
      */}
      <div data-contenido>
      <Anillo
        retorno={r?.enciendeTrazo ? "encendido" : "atenuado"}
        reducido={reducido}
        resaltado={r?.escena === "los-tres-internos"}
        escena={escenaSegunda}
      />
      {r?.enciendeTrazo && (
        <p data-rotulo-trazo className="fae-t11-aparece" style={{
          margin: "7px 0 0", fontSize: "11px", textAlign: "center", color: NEUTRO,
        }}>
          ↑ {ROTULO_DEL_TRAZO}
        </p>
      )}
      {r?.escena === "los-tres-internos" && (
        <p data-los-tres className="fae-t11-aparece" style={{
          margin: "7px 0 0", padding: "7px 9px", borderRadius: "9px", fontSize: "11px",
          color: "rgba(248,249,250,0.75)", background: "rgba(184,196,212,0.12)",
          borderLeft: `3px solid ${NEUTRO}`,
        }}>
          Dentro de la empresa: {INTERNOS.map((x) => x.nombre).join(", ")}.
        </p>
      )}

      {/* La pregunta, flotando hasta que se asiente. */}
      {!acertado && (
        <p
          data-pregunta={u.id}
          className={rebotando ? undefined : "fae-t11-pulso"}
          style={{
            margin: "14px 0 0", padding: "10px 12px", borderRadius: "11px",
            fontFamily: SORA, fontSize: "13px", fontWeight: 700, lineHeight: 1.4,
            color: FAE.text, background: "rgba(10,20,34,0.5)",
            border: "1px solid rgba(248,249,250,0.18)",
          }}
        >
          «{u.pregunta}»
        </p>
      )}

      {/*
        ═══════ LAS ZONAS NO SE VAN AL RESPONDER ═══════

        Salió mirándolo: al acertar, las zonas desaparecían y con ellas el
        sitio donde la pregunta tenía que asentarse. La animación principal de
        la actividad —la pregunta cayendo en su zona con el nombre de quien la
        hace— no se veía nunca, porque no quedaba dónde verla.

        Ahora se quedan, deshabilitadas. Lo que sí se va es el rótulo de la
        pregunta, que ya no pide nada.
      */}
      {/*
        Rótulo de sección: es interfaz de marca, no contenido de la actividad.
        Mientras se responde no dice nada: ahí iba la pregunta de vacío, que
        salió con el Bloque 2 de «Así se juega». Queda el espacio, para que
        las zonas no salten al aparecer el rótulo después.
      */}
      {esperandoReintento || !puedeResponder ? (
        <p data-rotulo-seccion style={{
          margin: "14px 0 8px", fontFamily: SORA, fontSize: "10.5px",
          fontWeight: 700, letterSpacing: "0.16em", color: acento,
        }}>
          {esperandoReintento ? "INTÉNTALO OTRA VEZ" : "DÓNDE QUEDÓ"}
        </p>
      ) : (
        <div style={{ height: "14px" }} />
      )}
      <div
        style={{ display: "flex", flexDirection: "column", gap: "8px" }}
        onKeyDown={(ev) => {
          if (ev.key !== "ArrowLeft" && ev.key !== "ArrowRight") return;
          ev.preventDefault();
          responder(ev.key === "ArrowLeft" ? ZONA_DENTRO : ZONA_FUERA);
        }}
      >
        {zona(ZONA_DENTRO)}
        {zona(ZONA_FUERA)}
      </div>
      {esperandoReintento && (
        <p data-fallo style={{
          margin: "9px 0 0", padding: "7px 10px", borderRadius: "10px",
          fontSize: "12px", textAlign: "center", color: "rgba(248,249,250,0.75)",
          border: `1px dashed ${FAE.coral}`,
        }}>
          La pregunta no se colocó: volvió a flotar.
        </p>
      )}

      {r?.escena === "zona-exterior" && (
        <p data-zona-exterior className="fae-t11-aparece" style={{
          margin: "9px 0 0", padding: "7px 9px", borderRadius: "9px", fontSize: "11px",
          textAlign: "center", color: "rgba(248,249,250,0.75)",
          background: "rgba(184,196,212,0.12)", borderLeft: `3px solid ${NEUTRO}`,
        }}>
          {r.rotulo}
        </p>
      )}

      </div>

      {r && <Retro texto={r.texto} />}

      {/*
        ═══════ LA SEGUNDA DECISIÓN (D4) ═══════

        La primera clasifica —¿pertenece a la empresa?—; esta pregunta la
        CONSECUENCIA de esa clasificación: hasta dónde del ciclo alcanza a ver.
        No se puede ni formular antes de la primera, y cada opción deja el
        anillo de arriba en un estado que se ve distinto.

        En la demo de «Así se juega» no sale: esa pantalla enseña el gesto de
        la primera, y su guion está escrito y probado contra eso.
      */}
      {r && !esperandoReintento && !modoDemo && (
        <SegundaDecisionT1
          pregunta={SEGUNDA_T1_1.pregunta}
          opciones={opcionesSegundaT1_1(u)}
          correcta={correctaSegundaT1_1(u)}
          porque={porqueSegundaT1_1(u)}
          escenaDe={(id) => SEGUNDA_T1_1.escena[id]}
          onPintar={setEscenaSegunda}
          onResuelta={() => setSegundaHecha(true)}
        />
      )}

      {r && !esperandoReintento && !modoDemo && segundaHecha && (
        <div ref={zonaBoton}>
          <Responder onClick={avanzar}>
            {t.i + 1 === cuantas ? "Ver el resultado" : "Siguiente pregunta"}
          </Responder>
        </div>
      )}

      {!modoDemo && <p style={SOLO_LECTOR}>{ALT_T1_1}</p>}
    </Marco>
  );
}
