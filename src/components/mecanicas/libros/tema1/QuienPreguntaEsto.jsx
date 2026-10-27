import { useEffect, useRef, useState } from "react";
import { User } from "lucide-react";
import { barajar } from "../../../../utils/barajar.js";
import { FAE } from "../../../../theme.js";
import { H2, ASIENTOS_H2 } from "../../../../data/contabilidadT1Hacer2.js";
import { sortearH2, evaluarH2, enunciadoH2, asientoH2, mensajeH2 } from "../../../../contabilidad/tema1Hacer2.js";
import { puntuar, pesoDeCadaItem } from "../../../../contabilidad/tema1.js";
import { Cierre } from "../../corazon/juego.jsx";
import { TEXTO_CIERRE } from "../../bloques/marcos.jsx";
import { useTanda } from "../piezas.jsx";
import EncabezadoCompacto from "../b5/EncabezadoCompacto.jsx";
import { useVuelta } from "../b5/ConVuelta.jsx";
import {
  Mensaje, RegionViva, IconoCheck, IconoX, CSS_B5H, CLASE_B5H,
} from "../b5/Devolucion.jsx";
import {
  SORA, INTER, SECUNDARIO, HUNDIDO, REPOSO, ACIERTO, FANTASMA, estiloC2, contadorDe, Avance,
  CSS_REGISTRO, CLASE_ENTRA, CLASE_APARECE,
} from "./registro.jsx";

/*
 * ═══════════════════════════════════════════════════════════════════════════
 * H2 · ¿QUIÉN PREGUNTA ESTO? — la mesa de los ocho lectores (P2 de Mai,
 * 23-oct; ajustes del 24-oct, §1; banco de Futaba).
 *
 * Arriba, el propósito con que alguien lee el informe: la cita del libro, pp.
 * 11-12 (en la segunda vuelta, contado como un caso). Debajo, la mesa: ocho
 * asientos en una columna, siempre en el mismo lugar y en el mismo orden
 * —si cambiaran, la posición sería una pista—. En cada ficha solo cuatro
 * están activos, los de las opciones de Futaba; los otros cuatro, atenuados
 * (no es un error: nada de coral ni tachado).
 *
 * Un intento. El asiento correcto se enciende; si erró, el tocado queda como
 * fantasma. Debajo de la mesa, al responder, las preguntas en palabras de los
 * dos lectores —la del que eligió y la del que era—, o solo la del correcto
 * si acertó. R10: antes de responder no hay ninguna pregunta en pantalla:
 * son la pista.
 *
 * Los contadores por asiento salen de la mesa (Shoko): dejaban resolver las
 * últimas fichas por descarte. La cuenta va solo en el resumen.
 *
 * B1 · EXCEPCIÓN MARCADA (Shoko): la figura empieza bajo el propósito, que es
 * texto del libro y no se recorta. A 320 el primer asiento queda por encima
 * de 280.
 * ═══════════════════════════════════════════════════════════════════════════
 */

/*
 * La pregunta del lector que era, tras responder, en una reserva FIJA de 48 px
 * (la regla de Mai; Shoko, #539 b): la de antes crecía con el par de
 * preguntas. Cabe una, la del correcto, en tres renglones de 16 como mucho; lo
 * que se confundió lo explica la devolución de debajo.
 */
export const ALTO_RESERVA_H2 = 48;
function Preguntas({ ficha }) {
  const lectores = [ficha.correcta];
  return (
    <div data-preguntas-lectores className={CLASE_APARECE} style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
      {lectores.map((id) => {
        const a = asientoH2(id);
        return (
          <p key={id} data-pregunta-de={id} style={{ margin: 0, fontFamily: INTER, fontSize: "12px", lineHeight: "16px", color: FAE.text }}>
            <b style={{ fontWeight: 700 }}>{a.nombre}:</b> <span style={{ color: SECUNDARIO }}>«{a.pregunta}»</span>
          </p>
        );
      })}
    </div>
  );
}

/*
 * ═══════════ EL MODO DEMO ═══════════
 * Es este mismo componente: `items` le da el ejemplo desde afuera y `modoDemo`
 * le quita el encabezado y el avance, y no llama a `onCompletar`.
 */
export default function QuienPreguntaEsto({
  Marco, rotulo, titulo, acento, onCompletar, items = null, modoDemo = false,
}) {
  const { variante, alCompletar } = useVuelta(H2.id, onCompletar);
  const vuelta = variante ? 2 : 1;
  const t = useTanda(() => items ?? sortearH2(barajar));

  const [r, setR] = useState(null);
  const [marcado, setMarcado] = useState(null);
  const [respuestas, setRespuestas] = useState([]);
  /* Cuántos propósitos recibió cada lector (siempre el correcto): solo para el resumen. */
  const [recibidos, setRecibidos] = useState({});
  const zonaBoton = useRef(null);

  const f = t.items[t.i];
  const cuantas = t.items.length;
  const pct = puntuar(respuestas, cuantas);

  useEffect(() => {
    if (t.terminado && !modoDemo) alCompletar(pct, Date.now() - t.inicio.current, t.detalle.current);
  }, [t.terminado]);
  useEffect(() => {
    if (r && !modoDemo) zonaBoton.current?.focus({ preventScroll: true });
  }, [r]);

  const responder = (id) => {
    if (r || !f.opciones.includes(id)) return;
    const nuevo = evaluarH2(f, id, vuelta);
    t.anotar(f.id, nuevo.ok, nuevo.ok ? null : id);
    setRespuestas((xs) => [...xs, { id: f.id, primeroOk: nuevo.ok }]);
    setRecibidos((x) => ({ ...x, [f.correcta]: (x[f.correcta] ?? 0) + 1 }));
    setMarcado(id);
    setR(nuevo);
  };
  const avanzar = () => {
    setR(null); setMarcado(null);
    if (t.i + 1 < cuantas) t.setI(t.i + 1);
    else t.setTerminado(true);
  };
  const reiniciar = () => { t.reiniciar(); setR(null); setMarcado(null); setRespuestas([]); setRecibidos({}); };

  if (t.terminado) {
    const bien = respuestas.filter((x) => x.primeroOk).length;
    return (
      <Marco rotulo={rotulo} titulo={titulo} acento={acento}>
        <Cierre pct={Math.round(pct)} onReiniciar={reiniciar} textoReiniciar="Otra tanda">
          <p style={TEXTO_CIERRE}>
            {bien} de {cuantas} al primer intento. Cada propósito valía {pesoDeCadaItem(cuantas).toFixed(2)} %.
          </p>
          {/* La cuenta de cada lector va aquí, en el resumen, y no en la mesa (Shoko). */}
          <ul data-recibidos style={{ margin: "8px 0 0", padding: 0, listStyle: "none", display: "flex", flexDirection: "column", gap: "3px" }}>
            {ASIENTOS_H2.map((a) => (
              <li key={a.id} data-recibio={a.id} style={{ ...TEXTO_CIERRE, margin: 0 }}>
                {a.nombre}: {recibidos[a.id] ?? 0}
              </li>
            ))}
          </ul>
        </Cierre>
      </Marco>
    );
  }

  const estadoDe = (id) => (!r ? REPOSO : id === f.correcta ? ACIERTO : id === marcado ? FANTASMA : REPOSO);

  return (
    <Marco rotulo={rotulo} titulo={titulo} acento={acento}>
      <style>{CSS_B5H}{CSS_REGISTRO}</style>
      <div className={CLASE_B5H} data-h2>
        {!modoDemo && (
          <EncabezadoCompacto objetivo={H2.objetivo} contador={contadorDe("Propósito", t.i + 1, cuantas)} consigna={H2.consigna} />
        )}

        {/* Aquí dentro no entra el vocabulario del Tema 2. */}
        <div data-contenido>
          <div data-escenario style={{ ...HUNDIDO, padding: "10px" }}>
            {/* El propósito es la primera pieza de la figura: el papel que llega a un asiento. */}
            <p key={f.id} data-proposito={f.id} className={CLASE_ENTRA} style={{
              margin: "0 0 10px", padding: "10px 12px", borderRadius: "11px",
              fontFamily: SORA, fontSize: "13px", fontWeight: 600, lineHeight: 1.45, color: FAE.text,
              background: "rgba(10,20,34,0.5)", border: "1px solid rgba(248,249,250,0.2)",
            }}>
              {enunciadoH2(f, vuelta)}
            </p>

            {/* Una sola columna (Shoko, #539): a 320, dos columnas cortaban «El Estado y las autoridades fiscales» y «Acreedores y proveedores». */}
            {/*
              El rótulo que dice por qué cuatro asientos van atenuados (Shoko,
              #539 b: sin él, se lee como «ya usados» o reduce el campo sin
              explicarlo). El texto lo escribe Futaba (lote F); mientras no
              llegue, no se pinta nada.
            */}
            {H2.rotuloAtenuados && (
              <p data-rotulo-atenuados style={{ margin: "0 0 6px", fontFamily: INTER, fontSize: "12px", lineHeight: "16px", color: SECUNDARIO }}>
                {H2.rotuloAtenuados}
              </p>
            )}
            <div role="group" aria-label={H2.rotuloMesa} data-mesa style={{ display: "grid", gridTemplateColumns: "minmax(0, 1fr)", gap: "6px" }}>
              {ASIENTOS_H2.map((a) => {
                const activo = f.opciones.includes(a.id);
                const estado = estadoDe(a.id);
                const tocable = activo && !r;
                return (
                  <button
                    key={a.id}
                    type="button"
                    data-asiento={a.id}
                    data-activo={activo ? "si" : "no"}
                    data-estado={estado}
                    aria-disabled={!tocable}
                    tabIndex={activo ? undefined : -1}
                    onClick={() => responder(a.id)}
                    aria-label={a.nombre}
                    style={{
                      minHeight: "44px", padding: "4px 10px", borderRadius: "10px", boxSizing: "border-box",
                      display: "flex", alignItems: "center", gap: "6px", textAlign: "left",
                      cursor: tocable ? "pointer" : "default", color: FAE.text,
                      fontFamily: INTER, fontSize: "12px", fontWeight: 600, lineHeight: 1.25,
                      ...estiloC2(estado),
                      /* Atenuado: opacidad ,42 y el contorno de reposo al 14 %. No es un error. */
                      ...(activo ? {} : { opacity: 0.42, boxShadow: "inset 0 0 0 1px rgba(248,249,250,.14)" }),
                    }}
                  >
                    <span aria-hidden="true" style={{ flex: "none", display: "flex", width: "18px", justifyContent: "center" }}>
                      {r && a.id === f.correcta ? <IconoCheck /> : r && a.id === marcado ? <IconoX /> : <User size={18} strokeWidth={2} />}
                    </span>
                    <span style={{ minWidth: 0 }}>{a.nombre}</span>
                  </button>
                );
              })}
            </div>

            {/*
              Las preguntas de los lectores, solo tras responder (R10). Sin reserva
              fija (Shoko, #539): la de 124 px, la del par más largo, dejaba un
              hueco grande a 320. Aparecen en el mismo momento que la devolución,
              debajo de la mesa, así que nada de lo que ya estaba a la vista se mueve.
            */}
            <div data-renglon-preguntas style={{ height: `${ALTO_RESERVA_H2}px`, marginTop: "10px", overflow: "hidden" }}>
              {r && <Preguntas ficha={f} />}
            </div>
          </div>
        </div>

        <RegionViva>
          {r && <Mensaje ok={r.ok} texto={mensajeH2(r)} />}
        </RegionViva>

        {r && !modoDemo && (
          <Avance onClick={avanzar} refBoton={zonaBoton}>
            {t.i + 1 === cuantas ? "Ver el resultado" : "Siguiente propósito"}
          </Avance>
        )}
      </div>
    </Marco>
  );
}
