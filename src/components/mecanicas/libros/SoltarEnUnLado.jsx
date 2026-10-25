import { useEffect, useMemo, useRef, useState } from "react";
import { barajar } from "../../../utils/barajar.js";
import { FAE } from "../../../theme.js";
import { DEBE, HABER, COLOR_LADO, pesos } from "../../../data/contabilidad.js";
import { IZQUIERDA_O_DERECHA } from "../../../data/contabilidadActividades.js";
import {
  sortearEstratificado, evaluarItem, esDeActivo, ladoDelTriangulo,
  mensajeDeCierre, puntuar, VALOR_SEGUNDO,
} from "../../../contabilidad/izquierdaODerecha.js";
import { Retro, Pulsos, Cierre } from "../corazon/juego.jsx";
import { TEXTO_CIERRE } from "../bloques/marcos.jsx";
import { Responder, useTanda } from "./piezas.jsx";
import { Encabezado } from "./tema1/encabezado.jsx";
import { CONSIGNA_TEMA2 } from "../../../data/contabilidadConsignas.js";
import {
  CuentaDeValor, Ficha, FichaEnVuelo, EstilosDeVerbos, useArrastre,
  useMovimientoReducido, SOLO_LECTOR,
} from "./verbos.jsx";
/*
 * Los tonos de rótulo y el marcador nacieron en la pieza de Aprender, y son
 * del TEMA, no de ella: el encargo pide que estas siete usen el vocabulario
 * visual que allí quedó establecido, no uno parecido.
 */
import { TONO_ROTULO, MarcadorDeSaldo } from "./debeHaber/piezasDebeHaber.jsx";
/* Todo lo que se toca mide al menos esto, a lo alto y a lo ancho (Ukyo #585,
 * lote T2-12). Se gana con alto y relleno, nunca con letra: la letra no cambia. */
export const TOQUE_MINIMO = 44;

/*
 * ═══════════════════════════════════════════════════════════════════════════
 * A1 · ¿IZQUIERDA O DERECHA?
 *
 * Una cuenta T vacía con su nombre, un enunciado corto, y una ficha que el
 * estudiante lleva al lado que elija.
 *
 * ═══════════ EN UN ERROR NO SE ESCRIBE NADA ═══════════
 *
 * Regla absoluta de las siete actividades del tema, y aquí es la que manda
 * sobre la mecánica entera: al fallar, la ficha NO cae. Se detiene, vibra una
 * vez y vuelve a flotar. La columna queda como estaba.
 *
 * No es delicadeza: si la ficha cayera y luego se retirara, durante un segundo
 * habría en pantalla un registro que nunca ocurrió, con su total sumado. Esta
 * actividad enseña dónde va cada cosa; enseñar un registro falso —aunque sea
 * un instante— es enseñar lo contrario.
 *
 * Por eso se evalúa ANTES de soltar, y solo se suelta si acertó.
 *
 * ═══════════ EL ▲ LLEGA TARDE, SIEMPRE ═══════════
 *
 * El triángulo marca por dónde crece la cuenta. Es la respuesta. Así que no
 * está en pantalla mientras se pregunta: aparece al final de la secuencia de
 * acierto, o al fallar —para que el segundo intento se haga ya sabiendo.
 *
 * ═══════════ LOS IDS DE ÍTEM NO CAMBIAN ═══════════
 *
 * Diez de los doce ítems ya los jugaron estudiantes reales con este mismo
 * enunciado, y conservan su id. El detalle guardado en el servidor sigue
 * siendo legible en el panel docente. Hay una prueba que lo fija.
 * ═══════════════════════════════════════════════════════════════════════════
 */

const B = IZQUIERDA_O_DERECHA;

/* Cuánto espera la ficha quieta antes de pedir atención. */
const ESPERA_OCIOSA = 4000;

const CSS = `
@keyframes fae-a1-vibra {
  0%, 100% { transform: translateX(0); }
  25% { transform: translateX(-5px); }
  75% { transform: translateX(5px); }
}
.fae-a1-vibra { animation: fae-a1-vibra 220ms ease-in-out 1; }
@keyframes fae-a1-pulso { 0%, 100% { transform: scale(1); } 50% { transform: scale(1.03); } }
.fae-a1-pulso { animation: fae-a1-pulso 2.2s ease-in-out infinite; }
.fae-a1-pulso-fuerte { animation: fae-a1-pulso 1.1s ease-in-out infinite; }
@media (prefers-reduced-motion: reduce) {
  .fae-a1-vibra, .fae-a1-pulso, .fae-a1-pulso-fuerte { animation: none !important; }
}
`;

const ROTULO = {
  margin: "16px 0 8px", fontFamily: "Sora, sans-serif", fontSize: "10.5px",
  fontWeight: 700, letterSpacing: "0.16em",
};

/* Una cuenta ya trabajada, para la fila del cierre. */
function CuentaResuelta({ item, valor, destacar }) {
  const lado = item.categoria;
  const triangulo = ladoDelTriangulo(item);
  return (
    <div
      data-resuelta={item.id}
      data-triangulo-de={triangulo}
      style={{
        padding: "7px 8px", borderRadius: "10px", minWidth: 0,
        background: "rgba(10,20,34,0.45)",
        border: `1px solid ${destacar ? COLOR_LADO[triangulo] : "rgba(248,249,250,0.14)"}`,
      }}
    >
      <p style={{
        margin: "0 0 4px", fontFamily: "Sora, sans-serif", fontSize: "10px",
        fontWeight: 700, lineHeight: 1.2, color: FAE.text, textAlign: "center",
      }}>
        {item.cuenta}
      </p>
      <div style={{ display: "flex", gap: "3px" }}>
        {[DEBE, HABER].map((cual) => (
          <span key={cual} style={{
            flex: 1, textAlign: "center", fontSize: "9px", lineHeight: "12px",
            color: COLOR_LADO[cual], fontWeight: 700,
          }} aria-hidden="true">
            {triangulo === cual ? "▲" : ""}
          </span>
        ))}
      </div>
      <div style={{ display: "flex", gap: "3px", borderTop: "1px solid rgba(248,249,250,0.2)", paddingTop: "3px" }}>
        {[DEBE, HABER].map((cual) => (
          <span key={cual} style={{
            flex: 1, textAlign: "center", fontSize: "9.5px",
            fontFamily: "ui-monospace, SFMono-Regular, Menlo, Consolas, monospace",
            color: lado === cual ? TONO_ROTULO[cual] : "rgba(248,249,250,0.25)",
          }}>
            {lado === cual ? pesos(valor) : "—"}
          </span>
        ))}
      </div>
      <span style={SOLO_LECTOR}>
        {item.cuenta}: {pesos(valor)} en el {lado === DEBE ? "debe" : "haber"}. Crece por el {triangulo === DEBE ? "debe" : "haber"}.
      </span>
    </div>
  );
}

/*
 * ═══════════ EL MODO DEMO DE «ASÍ SE JUEGA» ═══════════
 *
 * Es este mismo componente, no una copia dibujada: `items` le da el ejemplo
 * desde afuera en vez de sortearlo del banco, y `modoDemo` le quita lo que no
 * es la zona de juego —la consigna, el avance, el botón de seguir— y le corta
 * la salida: no llama a `onCompletar`, así que no hay FP, ni intentos, ni
 * progreso. Cómo se juega no cambia en nada; eso es lo que se enseña.
 */
export default function SoltarEnUnLado({
  Marco, rotulo, titulo, acento, onCompletar, items = null, modoDemo = false, onComoSeJuega = null,
}) {
  const reducido = useMovimientoReducido();
  const sortear = () => items ?? sortearEstratificado(barajar);
  const t = useTanda(sortear);

  /* Lo respondido, en orden, con los dos intentos de cada ítem. */
  const [respuestas, setRespuestas] = useState([]);
  const [retro, setRetro] = useState(null);
  /* Cuántos intentos lleva el ítem en curso: 0 o 1. Solo hay un reintento. */
  const [intento, setIntento] = useState(0);
  const [vibrando, setVibrando] = useState(false);
  const [ocioso, setOcioso] = useState(false);
  const relojOcio = useRef(null);
  const relojVibra = useRef(null);

  const item = t.items[t.i];

  /*
   * El valor de la ficha cambia por ítem y NO decide nada. Es deliberado:
   * refuerza que el lado lo elige la familia de la cuenta, no el tamaño.
   */
  const valor = useMemo(
    /* El ejemplo de «Así se juega» trae su ficha; el banco la toma del ciclo. */
    () => item.valorFicha ?? B.valoresDeFicha[t.i % B.valoresDeFicha.length],
    [t.i, item],
  );

  /* La ficha solo entra en la columna cuando la respuesta fue correcta. */
  const acertado = retro?.ok === true;
  const enDebe = acertado && item.categoria === DEBE ? [{ valor }] : [];
  const enHaber = acertado && item.categoria === HABER ? [{ valor }] : [];

  /* El ▲ se revela al responder, nunca antes. */
  const triangulo = retro ? ladoDelTriangulo(item) : null;

  const pct = puntuar(respuestas);

  useEffect(() => {
    if (t.terminado && !modoDemo) onCompletar?.(pct, Date.now() - t.inicio.current, t.detalle.current);
  }, [t.terminado]);

  /* La ficha quieta pide atención a los 4 s. */
  useEffect(() => {
    clearTimeout(relojOcio.current);
    setOcioso(false);
    if (retro || reducido) return undefined;
    relojOcio.current = setTimeout(() => setOcioso(true), ESPERA_OCIOSA);
    return () => clearTimeout(relojOcio.current);
  }, [t.i, retro, intento, reducido]);

  useEffect(() => () => { clearTimeout(relojOcio.current); clearTimeout(relojVibra.current); }, []);

  const arrastre = useArrastre({
    onSoltar: (_ficha, destino) => {
      if (destino === DEBE || destino === HABER) responder(destino);
    },
  });

  const responder = (lado) => {
    /*
     * Se puede responder cuando no hay devolución en pantalla, y TAMBIÉN
     * cuando la que hay es el primer fallo de este ítem — que es justamente
     * el reintento. Sin esta segunda condición el reintento era imposible:
     * la devolución del fallo bloqueaba el clic siguiente y el estudiante se
     * quedaba mirando un botón que no hacía nada. Se vio probándolo.
     */
    if (retro && !(retro.primero && !retro.ok)) return;
    const r = evaluarItem(item, lado);

    if (!r.ok) {
      /*
       * El fallo NO escribe. La ficha vibra y vuelve; la columna no se entera.
       * El ▲ sí se revela, porque el segundo intento se hace sabiendo.
       */
      if (!reducido) {
        setVibrando(true);
        clearTimeout(relojVibra.current);
        relojVibra.current = setTimeout(() => setVibrando(false), 500);
      }
      arrastre.limpiar();
    }

    if (intento === 0) {
      t.anotar(item.id, r.ok, r.ok ? null : lado);
      if (!r.ok) { setRetro({ ...r, primero: true }); setIntento(1); return; }
      setRespuestas((xs) => [...xs, { id: item.id, esActivo: esDeActivo(item), primeroOk: true, segundoOk: false }]);
      setRetro({ ...r, primero: true });
      return;
    }

    /* Segundo y último intento: vale la mitad, y ya no se vuelve a preguntar. */
    setRespuestas((xs) => [...xs, { id: item.id, esActivo: esDeActivo(item), primeroOk: false, segundoOk: r.ok }]);
    setRetro({ ...r, primero: false, ultimo: true });
  };

  const avanzar = () => {
    setRetro(null); setIntento(0); setVibrando(false); arrastre.limpiar();
    if (t.i + 1 < t.items.length) t.setI(t.i + 1);
    else t.setTerminado(true);
  };

  const reiniciar = () => {
    t.reiniciar(); setRetro(null); setIntento(0); setRespuestas([]); setVibrando(false); arrastre.limpiar();
  };

  /* Se sigue preguntando mientras el fallo sea el primero de ese ítem. */
  const esperandoReintento = retro && !retro.ok && retro.primero;

  if (t.terminado) {
    const cierre = mensajeDeCierre(respuestas);
    const porId = new Map(t.items.map((x, k) => [x.id, B.valoresDeFicha[k % B.valoresDeFicha.length]]));
    const bloque = (activos) => t.items.filter((x) => esDeActivo(x) === activos);
    const bien = respuestas.filter((r) => r.primeroOk).length;

    return (
      <Marco rotulo={rotulo} titulo={titulo} acento={acento}>
        <style>{CSS}</style>
        <Cierre pct={Math.round(pct)} onReiniciar={reiniciar} textoReiniciar="Otra tanda">
          <p style={TEXTO_CIERRE}>
            {bien} de {t.items.length} al primer intento. Estas son las cuentas que trabajaste, con el lado por el que crece cada una.
          </p>
        </Cierre>

        {/*
          Las ocho en fila, agrupadas por el lado de su ▲. Agrupar no es
          decoración: es la lección —dos bloques, no ocho casos— y es lo que
          hace legible el mensaje de patrón cuando sale.
        */}
        <div data-fila-final style={{ marginTop: "14px" }}>
          {[true, false].map((activos) => (
            <div key={String(activos)} style={{ marginBottom: "10px" }}>
              <p style={{ ...ROTULO, margin: "0 0 6px", color: TONO_ROTULO[activos ? DEBE : HABER] }}>
                {activos ? "▲ AL DEBE" : "▲ AL HABER"}
              </p>
              <div style={{ display: "grid", gridTemplateColumns: "repeat(2, 1fr)", gap: "6px" }}>
                {bloque(activos).map((x) => (
                  <CuentaResuelta key={x.id} item={x} valor={porId.get(x.id)} destacar={Boolean(cierre)} />
                ))}
              </div>
            </div>
          ))}
        </div>

        {cierre && <p data-mensaje-patron style={{ ...TEXTO_CIERRE, marginTop: "10px" }}>{cierre}</p>}
      </Marco>
    );
  }

  return (
    <Marco rotulo={rotulo} titulo={titulo} acento={acento}>
      <style>{CSS}</style>
      <EstilosDeVerbos />
      {!modoDemo && (
        <>
          <Encabezado consigna={CONSIGNA_TEMA2["cu-izquierda-o-derecha"]} onComoSeJuega={onComoSeJuega} />
          <div style={{ marginBottom: "12px" }}>
            <Pulsos total={t.items.length} hechos={t.i + (retro && !esperandoReintento ? 1 : 0)} enCurso={t.i + 1} etiqueta="Registro" />
          </div>
        </>
      )}

      {/* El enunciado: dos palabras, la cuenta y qué le pasa. */}
      <p data-enunciado style={{
        margin: "0 0 12px", padding: "11px 13px", borderRadius: "12px",
        fontFamily: "Sora, sans-serif", fontSize: "16px", fontWeight: 700,
        color: FAE.text, textAlign: "center",
        background: "rgba(10,20,34,0.45)", border: `1px solid ${acento}44`,
      }}>
        {item.enunciado}
      </p>

      <CuentaDeValor
        cuenta={item.cuenta}
        debitos={enDebe}
        creditos={enHaber}
        destinos={!retro || esperandoReintento}
        tomada={arrastre.tomada}
        onSoltar={responder}
        recien={acertado ? valor : null}
        triangulo={triangulo}
        flechas
        tonoRotulo={TONO_ROTULO}
        alto={110}
      />
      <MarcadorDeSaldo lado={acertado ? item.categoria : null} cifra={valor} />

      {(!retro || esperandoReintento) && (
        <>
          <p style={{ ...ROTULO, color: acento }}>
            {esperandoReintento ? "INTÉNTALO OTRA VEZ, YA CON EL ▲ A LA VISTA" : "LLEVA LA FICHA AL LADO QUE CORRESPONDE"}
          </p>
          <div
            className={vibrando ? "fae-a1-vibra" : ocioso ? "fae-a1-pulso-fuerte" : "fae-a1-pulso"}
            style={{ maxWidth: "170px", margin: "0 auto" }}
            onKeyDown={(e) => {
              if (e.key !== "ArrowLeft" && e.key !== "ArrowRight") return;
              e.preventDefault();
              responder(e.key === "ArrowLeft" ? DEBE : HABER);
            }}
          >
            <Ficha
              valor={valor}
              alto={TOQUE_MINIMO}
              lado={DEBE}
              color="rgba(248,249,250,0.55)"
              tomada={arrastre.tomada === valor}
              onClick={() => arrastre.tocar(valor)}
              gestos={arrastre.gestos(valor)}
              etiqueta={`Ficha de ${pesos(valor)}. Con la ficha tomada, flecha izquierda la lleva al debe y flecha derecha al haber.`}
            />
          </div>
          <FichaEnVuelo valor={arrastre.tomada ?? 0} lado={DEBE} puntero={arrastre.puntero} />
          {/* El contorno coral solo mientras dura el fallo. Nada quedó escrito. */}
          {esperandoReintento && (
            <p data-fallo style={{
              margin: "9px 0 0", padding: "7px 10px", borderRadius: "10px",
              fontSize: "12px", textAlign: "center", color: "rgba(248,249,250,0.75)",
              border: `1px dashed ${FAE.coral}`,
            }}>
              Ese registro no ocurrió: la ficha volvió.
            </p>
          )}
        </>
      )}

      {retro && <Retro texto={retro.texto} />}

      {retro && !esperandoReintento && !modoDemo && (
        <Responder onClick={avanzar}>
          {t.i + 1 === t.items.length ? "Ver resultado" : "Siguiente registro"}
        </Responder>
      )}

      {retro && !retro.ok && retro.ultimo && (
        <p style={{ margin: "9px 0 0", fontSize: "12px", color: "rgba(248,249,250,0.45)", textAlign: "center" }}>
          Un solo reintento por registro.
        </p>
      )}

      {/* La versión sin movimiento no pierde nada: esto lo dice. */}
      <p style={SOLO_LECTOR}>
        Cuenta {item.cuenta}. {acertado
          ? `La ficha de ${pesos(valor)} queda registrada en el lado ${item.categoria === DEBE ? "izquierdo, el debe" : "derecho, el haber"}. El total de ese lado marca ${pesos(valor)} y el marcador de saldo se ubica bajo esa columna. Un triángulo sobre el ${ladoDelTriangulo(item) === DEBE ? "debe" : "haber"} indica que ${item.cuenta} crece por ese lado.`
          : "La cuenta está vacía y la ficha espera a que elijas un lado."}
      </p>
    </Marco>
  );
}

export { VALOR_SEGUNDO };
