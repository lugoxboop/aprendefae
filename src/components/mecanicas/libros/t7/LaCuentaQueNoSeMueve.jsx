import { useEffect, useRef, useState } from "react";
import { FAE } from "../../../../theme.js";
import { barajar, barajarDistinto } from "../../../../utils/barajar.js";
import { NEUTRO } from "../../../../data/contabilidadIntro.js";
import { Panel } from "../../salaDeControl/marco.jsx";
import { PIEZA_LA_CUENTA_QUE_NO_SE_MUEVE, BOTON } from "../../../../data/contabilidadT7_1.js";
import FiguraDosColumnas from "./FiguraDosColumnas.jsx";

/*
 * ═══════════════════════════════════════════════════════════════════════════
 * T7-1 · PIEZA 1 DE APRENDER — «La cuenta que no se mueve».
 *
 * Siete pantallas, una a la vez, en el orden de la v5 de Near. Las dos
 * pantallas de pregunta tienen tres estados: colocando, error y acierto.
 *
 *   · colocando  se toca una cuenta y se confirma
 *   · error      la devolución de esa cuenta y «Probar otra»
 *   · acierto    el texto, la nota y «Seguir». La línea que aparece en la v5
 *                («16 de abril · Compras · Debe $5.000.000») es la tarjeta de
 *                la compra en la figura, repartida como la diseñó Watari
 *
 * Cada pantalla y cada estado lleva su pie de fuente, abajo, con el texto de
 * la v5. De la pantalla 1 a la 6, cada estado lleva además su figura (Watari,
 * «Dos columnas del periodo»), en el lugar que le da la guía: bajo el texto en
 * las de lectura, entre la ficha y la pregunta en la 4, entre la pregunta y
 * las opciones en la 5, y entre el resumen y la remisión en la 6. La portada
 * no lleva figura. Las opciones se barajan en cada intento: «Probar otra» las vuelve a
 * sortear, y nunca en el mismo orden que el intento anterior.
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
    alignSelf: "flex-start", padding: "10px 18px", borderRadius: "999px", cursor: "pointer",
    fontFamily: SORA, fontSize: "13px", fontWeight: 600,
    background: principal ? "rgba(248,249,250,0.1)" : "transparent",
    border: "1px solid rgba(248,249,250,0.36)", color: FAE.text,
  };
}

function Pie({ texto }) {
  return (
    <p data-pie style={{ margin: "18px 0 0", fontSize: "11.5px", lineHeight: 1.45, color: APAGADO, overflowWrap: "break-word" }}>
      {texto}
    </p>
  );
}

function Parrafos({ lista }) {
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
      {lista.map((t) => <p key={t} data-texto style={PARRAFO}>{t}</p>)}
    </div>
  );
}

/* ═══════════ LA PREGUNTA ═══════════ */

function Pregunta({ pantalla, onSeguir }) {
  const [orden, setOrden] = useState(() => barajar(pantalla.opciones));
  const [elegida, setElegida] = useState(null);
  const [confirmada, setConfirmada] = useState(null);
  const devolucionRef = useRef(null);

  const opcion = confirmada ? pantalla.opciones.find((o) => o.id === confirmada) : null;
  const estado = !opcion ? "colocando" : opcion.correcta ? "acierto" : "error";
  const figura = estado === "error" ? pantalla.figura.error[opcion.id] : pantalla.figura[estado];

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
      {pantalla.enunciado && <p data-texto data-enunciado style={PARRAFO}>{pantalla.enunciado}</p>}

      {pantalla.ficha && (
        <dl data-ficha style={{
          margin: "12px 0 0", padding: "10px 12px", borderRadius: "12px",
          background: "rgba(10,20,34,0.4)", border: "1px solid rgba(248,249,250,0.14)",
          display: "flex", flexDirection: "column", gap: "6px",
        }}>
          {pantalla.ficha.map((f) => (
            <div key={f.dato} data-dato style={{ fontSize: "13px", lineHeight: 1.45, overflowWrap: "break-word" }}>
              <dt style={{ display: "inline", fontFamily: SORA, fontWeight: 600, color: APAGADO }}>{f.dato}: </dt>
              <dd style={{ display: "inline", margin: 0, color: FAE.text }}>{f.texto}</dd>
            </div>
          ))}
        </dl>
      )}

      {pantalla.enunciado && <div style={{ marginTop: "14px" }}><FiguraDosColumnas key={figura} estado={figura} /></div>}

      <p data-texto data-enunciado-pregunta style={{ ...PARRAFO, marginTop: pantalla.enunciado ? "14px" : 0, fontFamily: SORA, fontWeight: 700, fontSize: "14px", lineHeight: 1.45 }}>
        {pantalla.pregunta}
      </p>
      {!pantalla.enunciado && <div style={{ marginTop: "14px" }}><FiguraDosColumnas key={figura} estado={figura} /></div>}
      {pantalla.ayuda && (
        <p data-ayuda style={{ margin: "6px 0 0", fontSize: "12.5px", lineHeight: 1.45, color: APAGADO, overflowWrap: "break-word" }}>
          {pantalla.ayuda}
        </p>
      )}

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
                textAlign: "left", padding: "10px 12px", borderRadius: "11px",
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
            onClick={() => setConfirmada(elegida)}
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
            {opcion.devolucion}
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
            {pantalla.acierto.texto}
          </p>
          <p data-texto data-nota style={{ ...PARRAFO, marginTop: "10px", fontSize: "13px", color: "rgba(248,249,250,0.82)" }}>
            {pantalla.acierto.nota}
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

        {(pantalla.tipo === "lectura" || pantalla.tipo === "resumen") && (
          <div style={{ display: "flex", flexDirection: "column" }}>
            <Parrafos lista={pantalla.parrafos} />
            <div style={{ marginTop: "16px" }}><FiguraDosColumnas estado={pantalla.figura} /></div>
            {pantalla.siguiente && <p data-texto data-siguiente style={{ ...PARRAFO, marginTop: "14px" }}>{pantalla.siguiente}</p>}
            {pantalla.boton && (
              <button
                type="button"
                data-boton={pantalla.boton === BOTON.verElCaso ? "ver-el-caso" : "seguir"}
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
