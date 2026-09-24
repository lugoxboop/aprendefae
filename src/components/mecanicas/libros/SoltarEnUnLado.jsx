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
 * SOLTAR EN UN LADO — la mecánica de ¿Izquierda o Derecha? (CU-1).
 *
 * Una cuenta T vacía con su nombre, un enunciado, y una ficha que el
 * estudiante lleva al lado que elija. Al soltarla, la ficha CAE, el total de
 * esa columna SUBE contando, y el saldo se pinta del lado que ahora pesa más.
 *
 * ═══════════ POR QUÉ SOLTAR Y NO ELEGIR ENTRE DOS BOTONES ═══════════
 *
 * Porque la pregunta del capítulo no es «¿cuál de estas dos palabras?»: es
 * dónde va esto. Tocar un botón que dice «Debe» se puede acertar recordando la
 * palabra; poner la ficha en la columna izquierda obliga a mirar la cuenta.
 * Y el resultado se ve: la columna engorda, el saldo se mueve.
 *
 * Se puede arrastrar, tocar la ficha y luego el lado, o hacerlo con el
 * teclado. Las tres son la misma operación — ver `useArrastre`.
 *
 * ═══════════ LOS IDS DE ÍTEM NO CAMBIAN ═══════════
 *
 * Esta mecánica sustituye a la anterior, que ya jugaron estudiantes reales.
 * Los ítems son los mismos del mismo banco y conservan su nombre (`cu1-01`…),
 * así que el detalle que ya está guardado en el servidor sigue siendo legible
 * en el panel docente. Hay una prueba que lo fija.
 * ═══════════════════════════════════════════════════════════════════════════
 */

/* El valor de la ficha. No es del banco: el banco dice qué pasa, no cuánto. */
export const VALOR_FICHA = 500;

/*
 * ═══════════ LAS DOS DEVOLUCIONES DE ERROR ═══════════
 *
 * El rediseño las reorganiza en dos patrones conceptuales, y son distintos de
 * verdad:
 *
 *   A · soltó del lado contrario al que esa familia usa para crecer
 *   B · acertó la familia pero no leyó la dirección — puso «aumenta» donde el
 *       enunciado dice «disminuye»
 *
 * Distinguirlos necesita saber si el enunciado pedía aumentar o disminuir, y
 * eso ya está en el banco: el ítem dice su cuenta y su lado correcto, y la
 * palabra del enunciado dice la dirección.
 */
export const NOMBRE_FAMILIA = {
  activo: ["Los activos", "el debe"],
  pasivo: ["Los pasivos", "el haber"],
  patrimonio: ["El patrimonio", "el haber"],
  ingreso: ["Los ingresos", "el haber"],
  gasto: ["Los gastos", "el debe"],
  costo: ["Los costos", "el debe"],
};

export default function SoltarEnUnLado({
  banco, tipoDe, Marco, rotulo, titulo, acento, onCompletar,
}) {
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
    const r = banco.evaluar(item, puesta, tipoDe(item));
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
          <p style={TEXTO_CIERRE}>{t.aciertos} de {t.items.length} fichas puestas donde iban.</p>
        </Cierre>
      </Marco>
    );
  }

  const debitos = puesta === DEBE ? [{ valor: VALOR_FICHA }] : [];
  const creditos = puesta === HABER ? [{ valor: VALOR_FICHA }] : [];

  return (
    <Marco rotulo={rotulo} titulo={titulo} acento={acento}>
      <EstilosDeVerbos />
      <div style={{ marginBottom: "12px" }}>
        <Pulsos total={t.items.length} hechos={t.i + (retro ? 1 : 0)} etiqueta="Enunciado" />
      </div>

      <Enunciado rotulo={banco.pregunta.toUpperCase()} acento={acento}>{item.enunciado}</Enunciado>

      <div style={{ marginTop: "14px" }}>
        <CuentaDeValor
          cuenta={item.cuenta ?? item.enunciado}
          debitos={debitos}
          creditos={creditos}
          cancelar={Boolean(retro) && puesta != null}
          destinos={!retro && !puesta}
          tomada={arrastre.tomada}
          onSoltar={arrastre.soltarEn}
          recien={puesta ? VALOR_FICHA : null}
        />
      </div>

      {/*
        La ficha vive fuera de la cuenta hasta que se suelta. Una vez puesta,
        desaparece de aquí: ya está dentro, y dejarla también fuera diría que
        hay dos.
      */}
      {!puesta && (
        <div style={{ marginTop: "14px" }}>
          <p style={{
            margin: "0 0 8px", fontFamily: "Sora, sans-serif", fontSize: "10.5px",
            fontWeight: 700, letterSpacing: "0.16em", color: acento,
          }}>
            LLEVE LA FICHA AL LADO QUE CORRESPONDE
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
            {arrastre.tomada != null
              ? "Ahora toque el debe o el haber."
              : "Arrástrela, o tóquela y después toque el lado."}
          </p>
        </div>
      )}

      {retro && <Retro texto={retro.texto} />}

      {puesta && !retro && <Responder onClick={responder}>Responder</Responder>}
      {retro && (
        <Responder onClick={avanzar}>
          {t.i + 1 === t.items.length ? "Ver resultado" : "Siguiente"}
        </Responder>
      )}
      {puesta && !retro && (
        <p style={{ margin: "9px 0 0", fontSize: "12.5px", color: "rgba(248,249,250,0.45)", textAlign: "center" }}>
          La ficha quedó en el {puesta === DEBE ? "debe" : "haber"}.
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
