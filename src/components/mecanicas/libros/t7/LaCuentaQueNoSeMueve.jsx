import { useEffect, useRef, useState } from "react";
import { FAE } from "../../../../theme.js";
import { barajar, barajarDistinto } from "../../../../utils/barajar.js";
import { NEUTRO } from "../../../../data/contabilidadIntro.js";
import { Panel } from "../../salaDeControl/marco.jsx";
import { PIEZA_LA_CUENTA_QUE_NO_SE_MUEVE, BOTON } from "../../../../data/contabilidadT7_1.js";
import FiguraDosColumnas from "./FiguraDosColumnas.jsx";
import { Plegable } from "./plegable.jsx";
import { textosDelError, contarFallo } from "./escaleraAyuda.js";

/*
 * ═══════════════════════════════════════════════════════════════════════════
 * T7-1 · PIEZA 1 DE APRENDER — «La cuenta que no se mueve».
 *
 * Cuatro pantallas, una a la vez, en el orden del recorte del lote 1 de Near
 * (con las correcciones de Mello): portada, dos preguntas y resumen. Las dos
 * preguntas tienen tres estados: colocando, error y acierto.
 *
 *   · colocando  se toca una cuenta y se confirma
 *   · error      la escalera de ayuda (escaleraAyuda.js) y «Probar otra»
 *   · acierto    el texto, su «¿Por qué?» plegado (escrito aparte en los
 *                datos) y «Seguir». Lo que la figura muestra al acertar la
 *                compra («16 de abril · Compras · Debe · $5.000.000») es la
 *                tarjeta de la compra, repartida como la diseñó Watari
 *
 * Cada pantalla y cada estado lleva su pie de fuente, abajo. Las preguntas y
 * el resumen llevan además su figura (Watari, «Dos columnas del periodo»):
 * entre el caso y la pregunta, y en el resumen entre las líneas y la
 * remisión. La portada no lleva figura. Las opciones se barajan en cada
 * intento: «Probar otra» las vuelve a sortear, y nunca en el mismo orden que
 * el intento anterior.
 *
 * NO CALIFICA y no da FP: es material de Aprender. No llama a registrar_fp.
 *
 * Por qué no usa intro/UnaFrase.jsx tal cual: la v5 pide «Confirmar» antes de
 * evaluar, «Seguir» (no «Probar otra») después de un acierto y un orden nuevo
 * en cada intento, y UnaFrase evalúa al tocar, muestra «Probar otra» siempre y
 * baraja una sola vez. Cambiarla es tocar un componente compartido, así que
 * esta pieza trae su pregunta con el mismo aspecto —los mismos bordes, el
 * mismo relleno, el mismo botón de reintento— y queda anotado para el
 * coordinador.
 * ═══════════════════════════════════════════════════════════════════════════
 */

const SORA = "Sora, sans-serif";
/* Texto secundario del Tema 3 (Levi): el pie de fuente, nunca #B8C4D4. */
const APAGADO = "#A8B6C8";

const PARRAFO = { margin: 0, fontSize: "14.5px", lineHeight: 1.6, color: FAE.text, overflowWrap: "break-word" };

function boton(principal) {
  return {
    /* 44 px de alto como mínimo, el blanco de un dedo (L, tras el juego de Watari: medían 41,5). */
    alignSelf: "flex-start", minHeight: "44px", padding: "10px 18px", borderRadius: "999px", cursor: "pointer",
    fontFamily: SORA, fontSize: "13px", fontWeight: 600,
    background: principal ? "rgba(248,249,250,0.1)" : "transparent",
    border: "1px solid rgba(248,249,250,0.36)", color: FAE.text,
  };
}

function Pie({ texto }) {
  return (
    <p data-pie style={{ margin: "18px 0 0", fontSize: "12px", lineHeight: 1.45, color: APAGADO, overflowWrap: "break-word" }}>
      {texto}
    </p>
  );
}

function Parrafos({ lista }) {
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
      {lista.map((t) => <p key={t} data-texto style={PARRAFO}><Plegable texto={t} /></p>)}
    </div>
  );
}

/* ═══════════ LA PREGUNTA ═══════════ */

function Pregunta({ pantalla, onSeguir }) {
  const [orden, setOrden] = useState(() => barajar(pantalla.opciones));
  const [elegida, setElegida] = useState(null);
  const [confirmada, setConfirmada] = useState(null);
  /* Cuántas veces se ha fallado esta pregunta: la escalera de ayuda (escaleraAyuda.js). */
  const [fallos, setFallos] = useState(0);
  const devolucionRef = useRef(null);

  const opcion = confirmada ? pantalla.opciones.find((o) => o.id === confirmada) : null;
  const estado = !opcion ? "colocando" : opcion.correcta ? "acierto" : "error";
  const figura = estado === "error" ? pantalla.figura.error[opcion.id] : pantalla.figura[estado];
  /* Lo que dice el error. Si es la devolución de la opción y esta trae su «¿Por qué?» escrito aparte, se pliega ese. */
  const errorVisible = estado === "error" ? textosDelError(pantalla, opcion, fallos).join(" ") : null;

  useEffect(() => {
    if (estado !== "colocando") devolucionRef.current?.focus();
  }, [estado]);

  const probarOtra = () => {
    setOrden((antes) => barajarDistinto(pantalla.opciones, antes, (o) => o.id));
    setElegida(null);
    setConfirmada(null);
  };

  return (
    <div data-pregunta={pantalla.id} data-estado={estado}>
      <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
        {pantalla.enunciado.map((t) => <p key={t} data-texto data-enunciado style={PARRAFO}><Plegable texto={t} /></p>)}
      </div>

      <div style={{ marginTop: "14px" }}><FiguraDosColumnas key={figura} estado={figura} /></div>

      <p data-texto data-enunciado-pregunta style={{ ...PARRAFO, marginTop: "14px", fontFamily: SORA, fontWeight: 700, fontSize: "14px", lineHeight: 1.45 }}>
        {pantalla.pregunta}
      </p>

      <div role="group" aria-label={pantalla.pregunta} style={{ display: "flex", flexDirection: "column", gap: "7px", marginTop: "12px" }}>
        {orden.map((o) => {
          const esta = o.id === (confirmada ?? elegida);
          return (
            <button
              key={o.id}
              type="button"
              data-opcion={o.id}
              data-elegida={esta ? "si" : "no"}
              aria-pressed={esta}
              disabled={Boolean(confirmada)}
              onClick={() => setElegida(o.id)}
              style={{
                textAlign: "left", minHeight: "44px", padding: "10px 12px", borderRadius: "11px",
                cursor: confirmada ? "default" : "pointer",
                background: esta ? "rgba(184,196,212,0.12)" : "rgba(10,20,34,0.4)",
                border: `${esta ? 2 : 1}px solid ${esta ? NEUTRO : "rgba(248,249,250,0.36)"}`,
                color: FAE.text, fontSize: "13px", lineHeight: 1.45,
                opacity: confirmada && !esta ? 0.5 : 1, overflowWrap: "break-word",
              }}
            >
              {o.texto}
            </button>
          );
        })}
      </div>

      {estado === "colocando" && (
        <div style={{ display: "flex", flexDirection: "column", marginTop: "12px" }}>
          <button
            type="button"
            data-boton="confirmar"
            disabled={!elegida}
            onClick={() => { contarFallo(pantalla, elegida, setFallos); setConfirmada(elegida); }}
            style={{ ...boton(true), cursor: elegida ? "pointer" : "default", opacity: elegida ? 1 : 0.5 }}
          >
            {BOTON.confirmar}
          </button>
          <Pie texto={pantalla.pie} />
        </div>
      )}

      {estado === "error" && (
        <div ref={devolucionRef} tabIndex={-1} data-devolucion="error" aria-live="polite" style={{ marginTop: "12px", display: "flex", flexDirection: "column", outline: "none" }}>
          <p data-texto style={{
            margin: 0, padding: "11px 13px", borderRadius: "12px", fontSize: "13.5px", lineHeight: 1.55,
            color: "rgba(248,249,250,0.92)", background: "rgba(184,196,212,0.1)", borderLeft: `3px solid ${NEUTRO}`,
            overflowWrap: "break-word",
          }}>
            <Plegable texto={errorVisible} porque={errorVisible === opcion.devolucion ? opcion.porque ?? null : null} />
          </p>
          <button type="button" data-boton="probar-otra" onClick={probarOtra} style={{ ...boton(false), marginTop: "10px" }}>
            {pantalla.error.boton}
          </button>
          <Pie texto={pantalla.error.pie} />
        </div>
      )}

      {estado === "acierto" && (
        <div ref={devolucionRef} tabIndex={-1} data-devolucion="acierto" aria-live="polite" style={{ marginTop: "12px", display: "flex", flexDirection: "column", outline: "none" }}>
          <p data-texto style={{
            margin: 0, padding: "11px 13px", borderRadius: "12px", fontSize: "13.5px", lineHeight: 1.55,
            color: "rgba(248,249,250,0.92)", background: "rgba(184,196,212,0.1)", borderLeft: `3px solid ${NEUTRO}`,
            overflowWrap: "break-word",
          }}>
            <Plegable texto={pantalla.acierto.texto} porque={pantalla.acierto.porque ?? null} />
          </p>
          <button type="button" data-boton="seguir" onClick={onSeguir} style={{ ...boton(true), marginTop: "12px" }}>
            {pantalla.acierto.boton}
          </button>
          <Pie texto={pantalla.acierto.pie} />
        </div>
      )}
    </div>
  );
}

/* ═══════════ LA PIEZA ═══════════ */

export default function LaCuentaQueNoSeMueve({ pieza = PIEZA_LA_CUENTA_QUE_NO_SE_MUEVE, rotulo }) {
  const [k, setK] = useState(0);
  const pantalla = pieza.pantallas[k];
  const marcoRef = useRef(null);
  const primera = useRef(true);
  const seguir = () => setK((x) => Math.min(x + 1, pieza.pantallas.length - 1));

  /* Al pasar de pantalla el foco va a la pantalla nueva, para teclado y lector de pantalla. */
  useEffect(() => {
    if (primera.current) { primera.current = false; return; }
    marcoRef.current?.focus();
  }, [k]);

  return (
    <Panel rotulo={rotulo} titulo={pieza.titulo}>
      <div ref={marcoRef} tabIndex={-1} data-pieza={pieza.id} data-pantalla={pantalla.id} style={{ outline: "none" }}>
        {pantalla.tipo === "portada" && (
          <div style={{ display: "flex", flexDirection: "column" }}>
            <p data-texto data-objetivo style={{
              margin: 0, padding: "11px 13px", borderRadius: "12px",
              fontSize: "14px", lineHeight: 1.55, color: "rgba(248,249,250,0.88)",
              background: "rgba(42,157,143,0.08)", borderLeft: `3px solid ${FAE.teal}`, overflowWrap: "break-word",
            }}>
              {pantalla.objetivo}
            </p>
            {/* La portada no lleva figura (Watari); si los datos un día le ponen una, se pinta y la prueba lo caza. */}
            {pantalla.figura && <div style={{ marginTop: "16px" }}><FiguraDosColumnas estado={pantalla.figura} /></div>}
            <button type="button" data-boton="empezar" onClick={seguir} style={{ ...boton(true), marginTop: "14px" }}>{pantalla.boton}</button>
            <Pie texto={pantalla.pie} />
          </div>
        )}

        {pantalla.tipo === "resumen" && (
          <div style={{ display: "flex", flexDirection: "column" }}>
            <Parrafos lista={pantalla.parrafos} />
            <div style={{ marginTop: "16px" }}><FiguraDosColumnas estado={pantalla.figura} /></div>
            {pantalla.siguiente && <p data-texto data-siguiente style={{ ...PARRAFO, marginTop: "14px" }}>{pantalla.siguiente}</p>}
            {pantalla.boton && (
              <button
                type="button"
                data-boton="seguir"
                onClick={seguir}
                style={{ ...boton(true), marginTop: "14px" }}
              >
                {pantalla.boton}
              </button>
            )}
            <Pie texto={pantalla.pie} />
          </div>
        )}

        {pantalla.tipo === "pregunta" && <Pregunta key={pantalla.id} pantalla={pantalla} onSeguir={seguir} />}
      </div>
    </Panel>
  );
}
