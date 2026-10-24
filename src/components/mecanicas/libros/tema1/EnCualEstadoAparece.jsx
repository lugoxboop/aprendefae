import { useEffect, useRef, useState } from "react";
import { barajar } from "../../../../utils/barajar.js";
import { FAE } from "../../../../theme.js";
import {
  T1_6, INFORMES, SECCIONES_T1_6, SECCIONES_SEGUNDO_T1_6, PRIMERO, SEGUNDO, ALT_T1_6,
} from "../../../../data/contabilidadTema1.js";
import {
  sortearT1_6, evaluarT1_6, valorDeItem, puntuarT1_6, pesoDeCadaItem, sinEmoji,
} from "../../../../contabilidad/tema1.js";
import { Cierre } from "../../corazon/juego.jsx";
import { TEXTO_CIERRE } from "../../bloques/marcos.jsx";
import { useTanda } from "../piezas.jsx";
import { SOLO_LECTOR } from "../verbos.jsx";
import EncabezadoCompacto from "../b5/EncabezadoCompacto.jsx";
import {
  Pastilla, Mensaje, RegionViva, IconoCheck, IconoX, CORRECTA, TACHADA, REVELADA, CSS_B5H, CLASE_B5H,
} from "../b5/Devolucion.jsx";
import {
  SORA, INTER, SECUNDARIO, HUNDIDO, REPOSO, ACIERTO, FANTASMA, estiloC2, contadorDe, Avance,
  CSS_REGISTRO, CLASE_APARECE,
} from "./registro.jsx";

/*
 * ═══════════════════════════════════════════════════════════════════════════
 * T1-6 · ¿EN QUÉ ESTADO APARECE? — la foto y la película se llenan (P2 de
 * Mai, 23-oct; ajustes a la auditoría de Shoko, 24-oct, §3).
 *
 * La ficha cae, con UN toque, en uno de cinco destinos: «Activo», «Pasivo» o
 * «Patrimonio», en la foto de un día (el estado de situación financiera, al
 * 31 de diciembre), o «Ingresos» o «Gastos», en la película de todo el año
 * (el estado de resultados, con su franja de tiempo). Al azar se acierta una
 * de cada cinco; con dos decisiones seguidas, la primera binaria, se acertaba
 * la mitad de las veces.
 *
 * El puntaje sigue siendo el de la llave compuesta (`informe-seccion`): el
 * informe pesa 60 y la parte 40. Un solo intento.
 *
 * El registro: tras tocar, el contador del destino CORRECTO sube y ese
 * destino queda resaltado hasta la ficha siguiente, se acierte o no. Si
 * erró, el tocado queda con el fantasma coral y ✕, y el renglón reservado
 * dice «Iba aquí: {informe} · {parte}». El escenario mide lo mismo vacío y
 * respondido: el renglón de abajo tiene su alto desde el principio.
 *
 * Los nombres de los informes son los del Aprender (Futaba, 24-oct): la vista
 * pinta `termino` y `fecha`, y deja `idea` intacta para T1-7 y cu0-a4.
 * ═══════════════════════════════════════════════════════════════════════════
 */

const CIFRA = { fontFamily: "ui-monospace, SFMono-Regular, Menlo, Consolas, monospace", fontVariantNumeric: "tabular-nums" };
const FOTO = INFORMES.find((i) => i.id === PRIMERO);
const PELICULA = INFORMES.find((i) => i.id === SEGUNDO);

/* Los cinco destinos, en el orden de la pantalla. La foto rotula con el término del libro. */
export const DESTINOS_EN_PANTALLA = [
  ...SECCIONES_T1_6.map((s) => ({ informe: PRIMERO, seccion: s.id, nombre: s.termino })),
  ...SECCIONES_SEGUNDO_T1_6.map((s) => ({ informe: SEGUNDO, seccion: s.id, nombre: s.idea })),
];
const claveDe = (d) => `${d.informe}-${d.seccion}`;
const destinoCorrecto = (c) => DESTINOS_EN_PANTALLA.find((d) => d.informe === c.informe && d.seccion === c.seccion);
const informeDe = (id) => INFORMES.find((i) => i.id === id);
const nombreLargo = (d) => `${informeDe(d.informe).termino} · ${d.nombre}`;
const fichas = (n) => `${n} ${n === 1 ? "ficha" : "fichas"}`;

/* Alto reservado del renglón «Entró: …» / «Iba aquí: …». Medido a 320 con el texto más largo (PR del lote 4). */
export const ALTO_RENGLON = 40;

function Destino({ d, cuenta, estado, marca, activo, onTocar }) {
  return (
    <button
      type="button"
      data-destino={claveDe(d)}
      data-estado={estado}
      aria-label={`${d.nombre}, ${fichas(cuenta)}`}
      aria-pressed={estado === FANTASMA || (marca === CORRECTA)}
      disabled={!activo}
      onClick={activo ? () => onTocar(d) : undefined}
      style={{
        minHeight: "44px", width: "100%", boxSizing: "border-box", padding: "6px 8px", borderRadius: "10px",
        display: "flex", alignItems: "center", justifyContent: "space-between", gap: "6px",
        color: FAE.text, cursor: activo ? "pointer" : "default", textAlign: "left",
        transition: "background-color 240ms cubic-bezier(.3,.9,.4,1)",
        ...estiloC2(estado),
      }}
    >
      <span style={{ display: "flex", alignItems: "center", gap: "4px", minWidth: 0 }}>
        {marca === TACHADA && <IconoX />}
        {(marca === CORRECTA || marca === REVELADA) && <IconoCheck />}
        <span style={{ fontFamily: SORA, fontSize: "13px", fontWeight: 600, lineHeight: 1.25, overflowWrap: "normal" }}>{d.nombre}</span>
      </span>
      <span
        key={cuenta}
        data-cuenta={cuenta}
        aria-hidden="true"
        className={CLASE_APARECE}
        style={{
          flex: "none", minWidth: "22px", padding: "1px 5px", boxSizing: "border-box", borderRadius: "6px",
          border: "1px solid rgba(248,249,250,0.35)", textAlign: "center",
          fontSize: "12px", lineHeight: "18px", color: FAE.text, ...CIFRA,
        }}
      >
        {cuenta}
      </span>
    </button>
  );
}

function CabezaDeInforme({ inf }) {
  return (
    <div data-cabeza-informe={inf.id} style={{ margin: "0 0 6px" }}>
      <p data-termino-informe={inf.termino} style={{ margin: 0, fontFamily: SORA, fontSize: "12px", fontWeight: 700, lineHeight: 1.3, color: FAE.text }}>
        {inf.termino}
      </p>
      {/* La fecha es el criterio de la actividad: un día exacto contra todo un periodo. */}
      <p data-linea="cuando" style={{ margin: "1px 0 0", fontFamily: INTER, fontSize: "12px", lineHeight: 1.3, color: SECUNDARIO }}>
        {inf.fecha}
      </p>
    </div>
  );
}

/*
 * ═══════════ EL MODO DEMO DE «ASÍ SE JUEGA» ═══════════
 *
 * Es este mismo componente: `items` le da el ejemplo desde afuera y `modoDemo`
 * le quita el encabezado y el avance, y no llama a `onCompletar`.
 */
export default function EnCualEstadoAparece({
  Marco, rotulo, titulo, acento, onCompletar, items = null, modoDemo = false,
}) {
  const t = useTanda(() => items ?? sortearT1_6(barajar));

  const [r, setR] = useState(null);
  const [respuestas, setRespuestas] = useState([]);
  /* Cuántas fichas recibió cada destino en la tanda: siempre el correcto (el registro). */
  const [cuentas, setCuentas] = useState({});
  const zonaBoton = useRef(null);

  const c = t.items[t.i];
  const cuantas = t.items.length;
  const pct = puntuarT1_6(respuestas, cuantas);

  useEffect(() => {
    if (t.terminado && !modoDemo) onCompletar?.(pct, Date.now() - t.inicio.current, t.detalle.current);
  }, [t.terminado]);
  useEffect(() => {
    if (r && !modoDemo) zonaBoton.current?.focus();
  }, [r]);

  const tocar = (d) => {
    if (r) return;
    const marcado = { informe: d.informe, seccion: d.seccion };
    const nuevo = evaluarT1_6(c, marcado);
    const bien = destinoCorrecto(c);
    t.anotar(c.id, nuevo.ok, nuevo.ok ? null : `${d.informe}/${d.seccion}`);
    setRespuestas((xs) => [...xs, { id: c.id, valor: valorDeItem(c, nuevo), primeroOk: nuevo.ok }]);
    setCuentas((x) => ({ ...x, [claveDe(bien)]: (x[claveDe(bien)] ?? 0) + 1 }));
    setR({ ...nuevo, tocado: d, correcto: bien });
  };

  const avanzar = () => {
    setR(null);
    if (t.i + 1 < cuantas) t.setI(t.i + 1);
    else t.setTerminado(true);
  };
  const reiniciar = () => {
    t.reiniciar(); setR(null); setRespuestas([]); setCuentas({});
  };

  if (t.terminado) {
    const bien = respuestas.filter((x) => x.primeroOk).length;
    return (
      <Marco rotulo={rotulo} titulo={titulo} acento={acento}>
        <Cierre pct={Math.round(pct)} onReiniciar={reiniciar} textoReiniciar="Otra tanda">
          <p style={TEXTO_CIERRE}>
            {bien} de {cuantas} completas al primer intento. Cada ficha valía {pesoDeCadaItem(cuantas).toFixed(2)} %:
            el informe pesa {Math.round(0.6 * 100)} % y la parte {Math.round(0.4 * 100)} %.
          </p>
        </Cierre>
      </Marco>
    );
  }

  /* Estado y marca de cada destino: el correcto se resalta siempre tras tocar; el tocado mal, fantasma. */
  const estadoDe = (d) => {
    if (!r) return REPOSO;
    if (claveDe(d) === claveDe(r.correcto)) return ACIERTO;
    if (claveDe(d) === claveDe(r.tocado)) return FANTASMA;
    return REPOSO;
  };
  const marcaDe = (d) => {
    if (!r) return null;
    if (claveDe(d) === claveDe(r.correcto)) return r.ok ? CORRECTA : REVELADA;
    if (claveDe(d) === claveDe(r.tocado)) return TACHADA;
    return null;
  };
  const destino = (d) => (
    <Destino
      key={claveDe(d)}
      d={d}
      cuenta={cuentas[claveDe(d)] ?? 0}
      estado={estadoDe(d)}
      marca={marcaDe(d)}
      activo={!r}
      onTocar={tocar}
    />
  );

  return (
    <Marco rotulo={rotulo} titulo={titulo} acento={acento}>
      <style>{CSS_B5H}{CSS_REGISTRO}</style>
      <div className={CLASE_B5H} data-t16-destinos>
        {!modoDemo && (
          <EncabezadoCompacto
            objetivo={T1_6.objetivo}
            contador={contadorDe("Ficha", t.i + 1, cuantas)}
            consigna={T1_6.consigna}
          />
        )}

        {/* Aquí dentro no entra el vocabulario del Tema 2. */}
        <div data-contenido>
          <div data-escenario style={{ ...HUNDIDO, padding: "10px" }}>
            {/* La ficha es la primera pieza de la figura: es la que cae en un destino. */}
            <p data-ficha={c.id} style={{
              margin: "0 0 10px", padding: "10px 12px", borderRadius: "11px",
              fontFamily: SORA, fontSize: "14px", fontWeight: 700, lineHeight: 1.3, color: FAE.text,
              background: "rgba(10,20,34,0.5)", border: "1px solid rgba(248,249,250,0.2)",
            }}>
              {c.nombre}
            </p>

            <div style={{ display: "grid", gridTemplateColumns: "minmax(0, 1fr) minmax(0, 1fr)", gap: "8px", alignItems: "start" }}>
              <div data-informe={PRIMERO} role="group" aria-label={`${FOTO.termino}, ${FOTO.fecha}`}>
                <CabezaDeInforme inf={FOTO} />
                <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
                  {DESTINOS_EN_PANTALLA.filter((d) => d.informe === PRIMERO).map(destino)}
                </div>
              </div>
              <div data-informe={SEGUNDO} role="group" aria-label={`${PELICULA.termino}, ${PELICULA.fecha}`}>
                <CabezaDeInforme inf={PELICULA} />
                {/* La franja del tiempo: la película corre todo el año. */}
                <div data-franja aria-hidden="true" style={{
                  height: "6px", margin: "0 0 6px", borderRadius: "3px",
                  background: "repeating-linear-gradient(90deg, rgba(184,196,212,.55) 0 6px, transparent 6px 12px)",
                }} />
                <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
                  {DESTINOS_EN_PANTALLA.filter((d) => d.informe === SEGUNDO).map(destino)}
                </div>
              </div>
            </div>

            {/* El renglón reservado: a dónde entró la ficha, o a dónde iba. */}
            <div data-renglon style={{ minHeight: `${ALTO_RENGLON}px`, marginTop: "8px", display: "flex", alignItems: "center" }}>
              {r && r.ok && (
                <p data-entro className={CLASE_APARECE} style={{ margin: 0, fontFamily: INTER, fontSize: "12px", lineHeight: 1.35, color: SECUNDARIO }}>
                  Entró: {c.nombre} → {nombreLargo(r.correcto)}
                </p>
              )}
              {r && !r.ok && <Pastilla marca={REVELADA} valor={nombreLargo(r.correcto)} envuelve />}
            </div>
          </div>
        </div>

        <RegionViva>
          {r && <Mensaje ok={r.ok} texto={sinEmoji(r.texto)} />}
        </RegionViva>

        {r && !modoDemo && (
          <Avance onClick={avanzar} refBoton={zonaBoton}>
            {t.i + 1 === cuantas ? "Ver el resultado" : "Siguiente ficha"}
          </Avance>
        )}

        {!modoDemo && <p style={SOLO_LECTOR}>{ALT_T1_6}</p>}
      </div>
    </Marco>
  );
}
