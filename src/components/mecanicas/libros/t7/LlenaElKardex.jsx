import { useEffect, useRef, useState } from "react";
import { barajar } from "../../../../utils/barajar.js";
import { H3, BOTON_H3, METODOS_H3, VENDIDO_H3, resumenH3 } from "../../../../data/contabilidadT7_2_h3.js";
import { prepararH3, evaluarH3, vistaKardex, puntuarH3, TOTAL_H3 } from "../../../../contabilidad/t7_2H3.js";
import { pesos } from "../../../../data/contabilidad.js";
import { Pulsos, Cierre } from "../../corazon/juego.jsx";
import { TEXTO_CIERRE } from "../../bloques/marcos.jsx";
import { Responder, useTanda } from "../piezas.jsx";
import { Encabezado } from "../tema1/encabezado.jsx";
import { CSS_T7_HACER, Parrafos, TarjetaPregunta, Eleccion, Devolucion, TEXTO } from "./hacerT7.jsx";
import Kardex from "./KardexT7_2.jsx";

/*
 * ═══════════════════════════════════════════════════════════════════════════
 * T7-2 · HACER 3 · LLENA EL KÁRDEX (Célula C)
 *
 * Arriba, siempre a la vista: el enunciado y los movimientos de mayo de
 * Laurel. Debajo, un ítem a la vez, en el orden de la tabla:
 *
 *   ÍTEMS 1 A 9   tres pestañas de kárdex (PEPS, UEPS (no válido bajo NIIF)
 *                 y Promedio ponderado). Se abre la del método del ítem; la
 *                 casilla preguntada lleva un punto. Al tocarlo aparecen las
 *                 tres cifras, barajadas: UN SOLO TOQUE, y la buena se
 *                 enseña. Las celdas que no se preguntan aparecen al
 *                 responder el ítem anterior (vistaKardex). Las pestañas de
 *                 los métodos que ya llegaron se pueden revisar; las otras
 *                 no se abren todavía.
 *   ÍTEM 10       la comparación: las tres pestañas completas y las tres
 *                 opciones a la vista. Después de responder se ven los tres
 *                 costos de lo vendido.
 *
 * Diez unidades; las piezas son las de H1 y H2 (hacerT7.jsx, sin cambiarlo).
 * Al terminar: onCompletar(pct, ms, detalle).
 * ═══════════════════════════════════════════════════════════════════════════
 */

const CSS_H3 = `
.t72h3-mov { margin: 0 0 12px; padding-left: 20px; display: grid; gap: 2px; }
.t72h3-mov li { list-style: disc; font: 400 14px/21px Inter, sans-serif; color: #F8F9FA; overflow-wrap: anywhere; }
.t72h3-tabs { display: flex; flex-wrap: wrap; gap: 6px; margin: 0 0 10px; }
.t72h3-tab { appearance: none; min-height: 44px; padding: 8px 12px; border-radius: 999px; border: 1px solid #B8C4D4; background: transparent; color: #F8F9FA; font: 500 14px/1.25 Inter, sans-serif; cursor: pointer; text-align: left; overflow-wrap: anywhere; max-width: 100%; }
.t72h3-tab[aria-selected="true"] { background: #F8F9FA; color: #0E1B2E; border-color: #F8F9FA; font-weight: 600; }
.t72h3-tab:disabled { opacity: .45; cursor: default; }
.t72h3-tab:focus-visible { outline: 2px solid #F8F9FA; outline-offset: 2px; }
.t72h3-panel { margin: 0 0 12px; }
.t72h3-totales { margin: 12px 0 0; padding: 0; display: grid; gap: 4px; }
.t72h3-totales li { list-style: none; display: flex; justify-content: space-between; gap: 12px; font: 500 15px/1.4 Inter, sans-serif; color: #F8F9FA; font-variant-numeric: tabular-nums; }
.t72h3-totales li span:first-child { overflow-wrap: anywhere; min-width: 0; }
.t72h3-totales li span:last-child { white-space: nowrap; }
`;

export default function LlenaElKardex({ Marco, rotulo, titulo, acento, onCompletar, items = null, onComoSeJuega = null }) {
  const t = useTanda(() => items ?? prepararH3(barajar));
  const [elegida, setElegida] = useState(null);
  const [r, setR] = useState(null);
  const [abierta, setAbierta] = useState(false);
  const [pestana, setPestana] = useState(METODOS_H3[0].id);
  const [bien, setBien] = useState(0);
  const zonaBoton = useRef(null);
  const tarjeta = useRef(null);
  const opciones = useRef(null);

  const item = t.items[t.i];
  const cuantos = t.items.length;
  const conPunto = item?.tipo === "casilla";
  const verOpciones = !conPunto || abierta || Boolean(r);

  useEffect(() => {
    if (t.terminado) onCompletar?.(puntuarH3(bien), Date.now() - t.inicio.current, t.detalle.current);
  }, [t.terminado]); // eslint-disable-line react-hooks/exhaustive-deps
  useEffect(() => { if (r) zonaBoton.current?.querySelector("button")?.focus(); }, [r]);
  useEffect(() => { if (abierta && !r) opciones.current?.querySelector("button")?.focus(); }, [abierta]); // eslint-disable-line react-hooks/exhaustive-deps

  const elegir = (v) => {
    if (r) return;
    const nuevo = evaluarH3(item, v);
    t.anotar(item.id, nuevo.ok, v);
    if (nuevo.ok) setBien((n) => n + 1);
    setElegida(v);
    setR(nuevo);
  };

  const avanzar = () => {
    setElegida(null); setR(null); setAbierta(false);
    if (t.i + 1 < cuantos) {
      const sigue = t.items[t.i + 1];
      if (sigue.metodo) setPestana(sigue.metodo);
      t.setI(t.i + 1);
      requestAnimationFrame(() => tarjeta.current?.focus());
    } else t.setTerminado(true);
  };

  const reiniciar = () => {
    t.reiniciar(); setElegida(null); setR(null); setAbierta(false); setPestana(METODOS_H3[0].id); setBien(0);
  };

  if (t.terminado) {
    return (
      <Marco rotulo={rotulo} titulo={titulo} acento={acento}>
        <Cierre pct={Math.round(puntuarH3(bien))} onReiniciar={reiniciar} textoReiniciar="Otra vez">
          <p data-resumen style={TEXTO_CIERRE}>{resumenH3(bien, TOTAL_H3)}</p>
        </Cierre>
      </Marco>
    );
  }

  const vistas = Object.fromEntries(METODOS_H3.map((m) => [m.id, vistaKardex(m.id, t.i, Boolean(r))]));
  const vista = vistas[pestana];

  return (
    <Marco rotulo={rotulo} titulo={titulo} acento={acento}>
      <style>{CSS_T7_HACER}</style>
      <style>{CSS_H3}</style>
      <div data-t7-2-h3>
        <Encabezado consigna={H3.consigna} onComoSeJuega={onComoSeJuega} />
        <Parrafos textos={H3.enunciado} />
        <ul className="t72h3-mov" data-movimientos>
          {H3.movimientos.map((m) => <li key={m}>{m}</li>)}
        </ul>
        <div style={{ marginBottom: "12px" }}>
          <Pulsos total={cuantos} hechos={t.i + (r ? 1 : 0)} enCurso={t.i + 1} etiqueta="Pregunta" />
        </div>
        <TarjetaPregunta id={item.id} pregunta={item.pregunta} pie={H3.pie} tarjetaRef={tarjeta} />

        <div className="t72h3-tabs" role="tablist" aria-label="Kárdex">
          {METODOS_H3.map((m) => (
            <button key={m.id} type="button" role="tab" id={`t72h3-tab-${m.id}`} aria-controls="t72h3-panel"
              className="t72h3-tab" data-pestana={m.id} aria-selected={pestana === m.id}
              disabled={!vistas[m.id]} onClick={() => setPestana(m.id)}>
              {m.nombre}
            </button>
          ))}
        </div>
        <div className="t72h3-panel" role="tabpanel" id="t72h3-panel" aria-labelledby={`t72h3-tab-${pestana}`} data-panel-kardex={pestana}>
          {vista && (
            <Kardex key={`${pestana}-${t.i}`} kardex={vista}
              pregunta={conPunto && !r && vista.punto === item.id
                ? { etiqueta: item.pregunta, abierta, onPunto: () => setAbierta(true) }
                : null} />
          )}
        </div>

        {verOpciones && (
          <div ref={opciones}>
            <Eleccion opciones={item.opciones} r={r} elegida={elegida} onElegir={elegir} etiqueta={item.pregunta} />
          </div>
        )}
        <Devolucion r={r} lectorError={r && !r.ok ? `Incorrecto. La respuesta es ${r.textoCorrecta}. ` : null} />
        {r && item.tipo === "metodo" && (
          <ul className="t72h3-totales" data-totales>
            {METODOS_H3.map((m) => (
              <li key={m.id} data-total-metodo={m.id} style={TEXTO}><span>{m.nombre}</span><span>{pesos(VENDIDO_H3[m.id])}</span></li>
            ))}
          </ul>
        )}
      </div>
      {r && (
        <div ref={zonaBoton}>
          <Responder onClick={avanzar}>{t.i + 1 === cuantos ? BOTON_H3.verResumen : BOTON_H3.siguiente}</Responder>
        </div>
      )}
    </Marco>
  );
}
