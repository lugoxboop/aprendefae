import { useEffect, useState } from "react";
import { barajar } from "../../../utils/barajar.js";
import { porcentaje } from "../../../data/politicaFiscal.js";
import { DEBE, HABER, COLOR_LADO } from "../../../data/contabilidad.js";
import { Retro, Pulsos, Cierre, Enunciado } from "../corazon/juego.jsx";
import { TEXTO_CIERRE } from "../bloques/marcos.jsx";
import { Responder, useTanda } from "./piezas.jsx";
import { CuentaDeValor, Ficha, FichaEnVuelo, EstilosDeVerbos, useArrastre } from "./verbos.jsx";

/*
 * ═══════════════════════════════════════════════════════════════════════════
 * LA CONTRAPARTIDA — la mecánica de ¿Se Debita o se Acredita? (CU-4).
 *
 * La transacción arriba, la cuenta preguntada abajo y vacía, y una ficha. El
 * estudiante la lleva al debe o al haber.
 *
 * ═══════════ LA OTRA CUENTA SOLO APARECE SI ACIERTA ═══════════
 *
 * Al acertar, la contrapartida SE MATERIALIZA al lado y el asiento queda
 * completo delante de él: ahí es cuando la partida doble deja de ser una frase.
 *
 * Si falla, NO se materializa nada, y esa es la decisión que importa. Enseñar
 * la otra cuenta a quien acaba de equivocarse le regala la lógica: vería que
 * «Caja va al haber» y deduciría que la suya iba al debe sin haberlo razonado.
 * La devolución explica el error; la contrapartida es la recompensa de haberlo
 * pensado.
 * ═══════════════════════════════════════════════════════════════════════════
 */

export const VALOR_FICHA = 500;

export default function LaContrapartida({ banco, Marco, rotulo, titulo, acento, onCompletar }) {
  const sortear = () => barajar(banco.items).slice(0, banco.porPartida);
  const t = useTanda(sortear);
  const [puesta, setPuesta] = useState(null);
  const [retro, setRetro] = useState(null);

  const item = t.items[t.i];
  const pct = porcentaje(t.aciertos, t.items.length);

  const arrastre = useArrastre({
    onSoltar: (_ficha, destino) => {
      if (retro || puesta || (destino !== DEBE && destino !== HABER)) return;
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
    if (r.ok) t.setAciertos((n) => n + 1);
    setRetro(r);
  };

  const avanzar = () => {
    setRetro(null); setPuesta(null); arrastre.limpiar();
    if (t.i + 1 < t.items.length) t.setI(t.i + 1);
    else t.setTerminado(true);
  };

  const reiniciar = () => { t.reiniciar(); setRetro(null); setPuesta(null); arrastre.limpiar(); };

  if (t.terminado) {
    return (
      <Marco rotulo={rotulo} titulo={titulo} acento={acento}>
        <Cierre pct={Math.round(pct)} onReiniciar={reiniciar} textoReiniciar="Otra tanda">
          <p style={TEXTO_CIERRE}>{t.aciertos} de {t.items.length} cuentas movidas del lado que iban.</p>
        </Cierre>
      </Marco>
    );
  }

  const debitos = puesta === DEBE ? [{ valor: VALOR_FICHA }] : [];
  const creditos = puesta === HABER ? [{ valor: VALOR_FICHA }] : [];
  /* La otra mitad del asiento: solo existe en pantalla si acertó. */
  const materializa = Boolean(retro?.ok) && item.contrapartida;
  const ladoContrario = item.categoria === DEBE ? HABER : DEBE;

  return (
    <Marco rotulo={rotulo} titulo={titulo} acento={acento}>
      <EstilosDeVerbos />
      <div style={{ marginBottom: "12px" }}>
        <Pulsos total={t.items.length} hechos={t.i + (retro ? 1 : 0)} enCurso={t.i + 1} etiqueta="Transacción" />
      </div>

      <Enunciado rotulo="LA TRANSACCIÓN" acento={acento}>{item.enunciado}</Enunciado>

      <div style={{ display: "flex", flexDirection: "column", gap: "10px", marginTop: "14px" }}>
        <CuentaDeValor
          cuenta={item.cuenta}
          debitos={debitos}
          creditos={creditos}
          destinos={!retro && !puesta}
          tomada={arrastre.tomada}
          onSoltar={arrastre.soltarEn}
          recien={puesta ? VALOR_FICHA : null}
          alto={96}
        />

        {materializa && (
          <>
            {/*
              El arco que une las dos mitades. Se dibuja cuando el asiento está
              completo, que es el momento en que la partida doble es visible en
              vez de enunciada.
            */}
            <div aria-hidden="true" style={{ textAlign: "center", color: acento, fontSize: "16px", lineHeight: 1 }}>
              ↓
            </div>
            <div className="fae-cae">
              <CuentaDeValor
                cuenta={item.contrapartida}
                debitos={ladoContrario === DEBE ? [{ valor: VALOR_FICHA }] : []}
                creditos={ladoContrario === HABER ? [{ valor: VALOR_FICHA }] : []}
                alto={96}
              />
            </div>
            <p style={{ margin: 0, fontSize: "12.5px", color: "rgba(248,249,250,0.55)", textAlign: "center" }}>
              El asiento completo: dos cuentas, una a cada lado.
            </p>
          </>
        )}
      </div>

      {!puesta && (
        <div style={{ marginTop: "14px" }}>
          <p style={{
            margin: "0 0 8px", fontFamily: "Sora, sans-serif", fontSize: "10.5px",
            fontWeight: 700, letterSpacing: "0.16em", color: acento,
          }}>
            ¿SE DEBITA O SE ACREDITA {item.cuenta.toUpperCase()}?
          </p>
          <div style={{ display: "flex", justifyContent: "center" }}>
            <div style={{ width: "108px" }}>
              <Ficha
                valor={VALOR_FICHA}
                lado={DEBE}
                tomada={arrastre.tomada != null}
                onClick={() => arrastre.tocar(VALOR_FICHA)}
                gestos={arrastre.gestos(VALOR_FICHA)}
                etiqueta={arrastre.tomada != null
                  ? "Ficha tomada. Ahora elija el debe o el haber."
                  : "Tomar la ficha"}
              />
            </div>
          </div>
          <p style={{ margin: "9px 0 0", fontSize: "12.5px", color: "rgba(248,249,250,0.45)", textAlign: "center" }}>
            {arrastre.tomada != null ? "Ahora toque el debe o el haber." : "Arrástrela, o tóquela y después toque el lado."}
          </p>
        </div>
      )}

      {retro && <Retro texto={retro.texto} />}

      {puesta && !retro && <Responder onClick={responder}>Responder</Responder>}
      {retro && (
        <Responder onClick={avanzar}>
          {t.i + 1 === t.items.length ? "Ver resultado" : "Siguiente transacción"}
        </Responder>
      )}
      {puesta && !retro && (
        <p style={{ margin: "9px 0 0", fontSize: "12.5px", color: "rgba(248,249,250,0.45)", textAlign: "center" }}>
          Quedó en el {puesta === DEBE ? "debe" : "haber"}.
          <button
            type="button"
            onClick={() => { setPuesta(null); arrastre.limpiar(); }}
            style={{
              marginLeft: "6px", background: "none", border: "none", cursor: "pointer",
              color: COLOR_LADO[puesta], font: "inherit", textDecoration: "underline",
            }}
          >
            Cambiarla de lado
          </button>
        </p>
      )}
      <FichaEnVuelo valor={VALOR_FICHA} lado={DEBE} puntero={arrastre.puntero} />
    </Marco>
  );
}
