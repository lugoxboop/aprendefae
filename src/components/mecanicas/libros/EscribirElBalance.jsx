import { useEffect, useState } from "react";
import { FAE } from "../../../theme.js";
import { barajar } from "../../../utils/barajar.js";
import { porcentaje } from "../../../data/politicaFiscal.js";
import { ACTIVO, PASIVO, PATRIMONIO, NOMBRE_TIPO } from "../../../data/contabilidad.js";
import { Retro, Pulsos, Cierre } from "../corazon/juego.jsx";
import { TEXTO_CIERRE } from "../bloques/marcos.jsx";
import { Responder, useTanda } from "./piezas.jsx";
import { Ficha, FichaEnVuelo, EstilosDeVerbos, useArrastre } from "./verbos.jsx";

/*
 * ═══════════════════════════════════════════════════════════════════════════
 * ESCRIBIR EL BALANCE — la mecánica de ¿De qué familia es? (CU-2).
 *
 * Un estado de situación financiera EN BLANCO con sus tres secciones, y una
 * ficha con el nombre de una cuenta. El estudiante la lleva a su sección, y
 * cada acierto ESCRIBE el renglón: el documento se va llenando delante de él.
 *
 * ═══════════ POR QUÉ UN BALANCE Y NO TRES BOTONES ═══════════
 *
 * Porque clasificar no es el fin: el fin es que el balance diga la verdad. Con
 * tres botones, equivocarse es fallar una pregunta; con el documento delante,
 * equivocarse es escribir una deuda donde va una propiedad — y eso se ve.
 * Las dos devoluciones de error del rediseño dicen exactamente eso, y solo
 * tienen sentido si hay un documento al que estropear.
 *
 * ═══════════ SIN CIFRAS, A PROPÓSITO ═══════════
 *
 * El banco de esta actividad son doce cuentas sin monto: la ficha dice qué
 * cuenta es, no cuánto vale. Así que el balance crece en RENGLONES y no en
 * pesos. Inventar montos para que sumara algo sería meter cifras que el
 * capítulo no da, y las cifras de este tema están verificadas contra el libro.
 * Queda reportado por si Gen quiere darle montos.
 * ═══════════════════════════════════════════════════════════════════════════
 */

export const SECCIONES = [
  { id: ACTIVO, nombre: "Activo", pie: "Lo que la empresa tiene" },
  { id: PASIVO, nombre: "Pasivo", pie: "Lo que le debe a terceros" },
  { id: PATRIMONIO, nombre: "Patrimonio", pie: "Lo que es de los dueños" },
];

export default function EscribirElBalance({ banco, Marco, rotulo, titulo, acento, onCompletar }) {
  const sortear = () => barajar(banco.items).slice(0, banco.porPartida);
  const t = useTanda(sortear);
  const [puesta, setPuesta] = useState(null);
  const [retro, setRetro] = useState(null);
  /* Los renglones ya escritos, por sección. Solo entran los aciertos. */
  const [escrito, setEscrito] = useState({ [ACTIVO]: [], [PASIVO]: [], [PATRIMONIO]: [] });

  const item = t.items[t.i];
  const pct = porcentaje(t.aciertos, t.items.length);

  const arrastre = useArrastre({
    onSoltar: (_ficha, destino) => {
      if (retro || puesta || !SECCIONES.some((s) => s.id === destino)) return;
      setPuesta(destino);
    },
  });

  useEffect(() => {
    if (t.terminado) onCompletar?.(pct, Date.now() - t.inicio.current, t.detalle.current);
  }, [t.terminado]);

  const responder = () => {
    if (retro || !puesta) return;
    const r = banco.evaluar(item, puesta);
    t.anotar(item.id, r.ok, r.ok ? null : puesta);
    if (r.ok) {
      t.setAciertos((n) => n + 1);
      setEscrito((e) => ({ ...e, [puesta]: [...e[puesta], item.enunciado] }));
    }
    setRetro(r);
  };

  const avanzar = () => {
    setRetro(null); setPuesta(null); arrastre.limpiar();
    if (t.i + 1 < t.items.length) t.setI(t.i + 1);
    else t.setTerminado(true);
  };

  const reiniciar = () => {
    t.reiniciar(); setRetro(null); setPuesta(null); arrastre.limpiar();
    setEscrito({ [ACTIVO]: [], [PASIVO]: [], [PATRIMONIO]: [] });
  };

  if (t.terminado) {
    const renglones = Object.values(escrito).reduce((s, xs) => s + xs.length, 0);
    return (
      <Marco rotulo={rotulo} titulo={titulo} acento={acento}>
        <Cierre pct={Math.round(pct)} onReiniciar={reiniciar} textoReiniciar="Otra tanda">
          <p style={TEXTO_CIERRE}>
            {renglones} de {t.items.length} renglones escritos donde iban. Un balance solo dice la verdad si todos están en su sección.
          </p>
        </Cierre>
      </Marco>
    );
  }

  return (
    <Marco rotulo={rotulo} titulo={titulo} acento={acento}>
      <EstilosDeVerbos />
      <div style={{ marginBottom: "12px" }}>
        <Pulsos total={t.items.length} hechos={t.i + (retro ? 1 : 0)} etiqueta="Cuenta" />
      </div>

      <div
        data-balance
        style={{
          padding: "12px 13px", borderRadius: "14px",
          background: "rgba(10,20,34,0.45)", border: "1px solid rgba(248,249,250,0.12)",
        }}
      >
        <p style={{
          margin: "0 0 10px", fontFamily: "Sora, sans-serif", fontWeight: 700,
          fontSize: "13px", color: FAE.text, textAlign: "center",
        }}>
          Estado de situación financiera
        </p>
        <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
          {SECCIONES.map((s) => {
            const esperando = !retro && !puesta;
            /*
             * El renglon de esta vuelta se pinta mientras no esta corregido, y
             * al corregir SOLO SI ESTA MAL. Acertado ya vive en  y
             * pintarlo dos veces diria que la cuenta se escribio dos veces.
             *
             * Mal puesto se queda a la vista, en coral: el texto de la ficha
             * dice que un renglon en la seccion equivocada estropea el
             * documento entero, y eso hay que poder verlo.
             */
            const recibio = puesta === s.id && (!retro || !retro.ok);
            const malPuesto = recibio && Boolean(retro);
            return (
              <button
                key={s.id}
                type="button"
                data-destino={esperando ? s.id : undefined}
                data-seccion={s.id}
                disabled={!esperando}
                onClick={esperando ? () => arrastre.soltarEn(s.id) : undefined}
                aria-label={esperando ? `Escribir en ${s.nombre}` : `Sección ${s.nombre}`}
                style={{
                  width: "100%", boxSizing: "border-box", textAlign: "left",
                  padding: "9px 11px", borderRadius: "11px", cursor: esperando ? "pointer" : "default",
                  background: recibio ? "rgba(233,196,106,0.10)" : "rgba(14,27,46,0.42)",
                  border: `1px ${esperando ? "dashed" : "solid"} ${
                    recibio ? acento : (esperando && arrastre.tomada != null ? acento : "rgba(248,249,250,0.18)")
                  }`,
                  color: FAE.text, transition: "border-color 180ms ease, background 180ms ease",
                }}
              >
                <span style={{
                  display: "block", fontFamily: "Sora, sans-serif", fontSize: "11px",
                  fontWeight: 700, letterSpacing: "0.1em", color: acento,
                }}>
                  {s.nombre.toUpperCase()}
                </span>
                <span style={{ display: "block", fontSize: "11px", color: "rgba(248,249,250,0.45)", marginBottom: "4px" }}>
                  {s.pie}
                </span>
                {escrito[s.id].length === 0 && !recibio
                  ? <span style={{ fontSize: "12px", color: "rgba(248,249,250,0.28)" }}>—</span>
                  : (
                    <>
                      {escrito[s.id].map((nombre) => (
                        <span key={nombre} data-renglon style={{ display: "block", fontSize: "12.5px", padding: "1px 0" }}>
                          {nombre}
                        </span>
                      ))}
                      {recibio && (
                        <span
                          data-renglon-nuevo
                          className="fae-cae"
                          style={{ display: "block", fontSize: "12.5px", padding: "1px 0", color: malPuesto ? FAE.coral : acento, fontWeight: 600 }}
                        >
                          {item.enunciado}
                        </span>
                      )}
                    </>
                  )}
              </button>
            );
          })}
        </div>
      </div>

      {!puesta && (
        <div style={{ marginTop: "14px" }}>
          <p style={{
            margin: "0 0 8px", fontFamily: "Sora, sans-serif", fontSize: "10.5px",
            fontWeight: 700, letterSpacing: "0.16em", color: acento,
          }}>
            ¿EN QUÉ SECCIÓN VA ESTA CUENTA?
          </p>
          <div style={{ display: "flex", justifyContent: "center" }}>
            <div style={{ minWidth: "160px", maxWidth: "100%" }}>
              <Ficha
                valor={0}
                color={acento}
                tomada={arrastre.tomada != null}
                onClick={() => arrastre.tocar(item.id)}
                gestos={arrastre.gestos(item.id)}
                etiqueta={arrastre.tomada != null
                  ? `${item.enunciado}. Tomada: ahora elija la sección.`
                  : `Tomar ${item.enunciado}`}
                texto={item.enunciado}
              />
            </div>
          </div>
          <p style={{ margin: "9px 0 0", fontSize: "12.5px", color: "rgba(248,249,250,0.45)", textAlign: "center" }}>
            {arrastre.tomada != null ? "Ahora toque la sección." : "Arrástrela, o tóquela y después toque la sección."}
          </p>
        </div>
      )}

      {retro && <Retro texto={retro.texto} />}

      {puesta && !retro && <Responder onClick={responder}>Responder</Responder>}
      {retro && (
        <Responder onClick={avanzar}>
          {t.i + 1 === t.items.length ? "Ver resultado" : "Siguiente cuenta"}
        </Responder>
      )}
      {puesta && !retro && (
        <p style={{ margin: "9px 0 0", fontSize: "12.5px", color: "rgba(248,249,250,0.45)", textAlign: "center" }}>
          Va a quedar en {NOMBRE_TIPO[puesta]}.
          <button
            type="button"
            onClick={() => { setPuesta(null); arrastre.limpiar(); }}
            style={{
              marginLeft: "6px", background: "none", border: "none", cursor: "pointer",
              color: acento, font: "inherit", textDecoration: "underline",
            }}
          >
            Cambiar de sección
          </button>
        </p>
      )}
      <FichaEnVuelo valor={0} puntero={arrastre.puntero} texto={item.enunciado} color={acento} />
    </Marco>
  );
}
