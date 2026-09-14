import { useEffect, useRef, useState } from "react";
import { FAE } from "../../../theme.js";
import { barajar } from "../../../utils/barajar.js";
import {
  CASO_PRESUPUESTO, CASILLAS_PRESUPUESTO, PIEZAS_PRESUPUESTO, CASTIGO_SENUELO, puntuarPresupuesto,
} from "../../../data/politicaFiscal.js";
import { Tesoreria, Opcion, Opciones, Retro, Cierre, Enunciado, TEXTO_CIERRE } from "./tesoreria.jsx";

/*
 * ACTIVIDAD 6 — "Diseña el presupuesto". Crear · Experto.
 *
 * Un acueducto que colapsó y un presupuesto que no alcanza. Dos casillas, en
 * orden —qué clase de gasto es la obra y con qué se paga lo que falta— y diez
 * piezas: dos correctas y ocho señuelos.
 *
 *   primera casilla 60 % · segunda 40 % · −5 % por cada toque a un señuelo · piso 0
 *
 * EL CASTIGO ES SOLO POR SEÑUELO, como en la Cirugía de Demanda Agregada.
 * Tocar la pieza correcta de la OTRA casilla es un error de orden dentro de la
 * respuesta buena: no resta, y la devolución lo dice. La ficha no trae esa
 * frase; es de este archivo.
 *
 * Los ids son las dos casillas, `gasto` y `financiacion`: un solo caso, no hay
 * nada que prefijar.
 */

const RETRO_ORDEN = "❌ Esa pieza es buena, pero va en la otra casilla — primero se decide qué clase de gasto es la obra, y después con qué se paga.";

export default function DisenaPresupuesto({ onCompletar }) {
  const [piezas, setPiezas] = useState(() => barajar(PIEZAS_PRESUPUESTO));
  const [puestas, setPuestas] = useState({});
  const [aviso, setAviso] = useState(null);
  const [senuelos, setSenuelos] = useState(0);

  const detalle = useRef([]);
  const intentos = useRef({});
  const primerFallo = useRef({});
  const inicio = useRef(Date.now());

  const casillaActual = CASILLAS_PRESUPUESTO.find((c) => !puestas[c.id]);
  const completa = !casillaActual;
  const pct = puntuarPresupuesto(puestas, senuelos);

  useEffect(() => {
    if (completa) onCompletar?.(pct, Date.now() - inicio.current, detalle.current);
  }, [completa]);

  const tocar = (pieza) => {
    if (completa) return;
    const casilla = casillaActual.id;
    const n = (intentos.current[casilla] ?? 0) + 1;
    intentos.current[casilla] = n;

    if (pieza.papel === casilla) {
      detalle.current.push({
        item: casilla,
        ok: n === 1,
        intentos: n,
        respuesta: primerFallo.current[casilla] ?? null,
        orden: detalle.current.length + 1,
      });
      setPuestas((p) => ({ ...p, [casilla]: pieza }));
      setAviso(pieza.retro);
      return;
    }

    if (!primerFallo.current[casilla]) primerFallo.current[casilla] = pieza.id;
    if (pieza.papel === "senuelo") {
      setSenuelos((s) => s + 1);
      setAviso(pieza.retro);
    } else {
      setAviso(RETRO_ORDEN);
    }
  };

  const reiniciar = () => {
    setPiezas(barajar(PIEZAS_PRESUPUESTO));
    setPuestas({}); setAviso(null); setSenuelos(0);
    detalle.current = [];
    intentos.current = {};
    primerFallo.current = {};
    inicio.current = Date.now();
  };

  const yaPuesta = (id) => Object.values(puestas).some((p) => p.id === id);

  return (
    <Tesoreria rotulo="TESORERÍA · MESA DE PRESUPUESTO" titulo="Arma la respuesta del municipio" acento={FAE.ambar}>
      <Enunciado rotulo="EL CASO" acento={FAE.ambar}>{CASO_PRESUPUESTO}</Enunciado>

      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))", gap: "10px", marginTop: "14px" }}>
        {CASILLAS_PRESUPUESTO.map((c) => {
          const puesta = puestas[c.id];
          const activa = !puesta && casillaActual?.id === c.id;
          return (
            <div
              key={c.id}
              style={{
                padding: "13px 15px", borderRadius: "14px",
                background: puesta ? "rgba(42,157,143,0.10)" : "rgba(248,249,250,0.03)",
                border: `1px ${puesta ? "solid" : "dashed"} ${puesta ? FAE.teal : activa ? FAE.ambar : "rgba(248,249,250,0.18)"}`,
              }}
            >
              <p style={{ margin: "0 0 4px", fontFamily: "Sora, sans-serif", fontSize: "11px", fontWeight: 700, letterSpacing: "0.12em", color: puesta ? FAE.teal : activa ? FAE.ambar : "rgba(248,249,250,0.45)" }}>
                {c.rotulo} · {c.peso} %{activa ? " · AHORA" : ""}{puesta ? " · PUESTA" : ""}
              </p>
              <p style={{ margin: 0, fontSize: "13.5px", lineHeight: 1.45, color: puesta ? FAE.text : "rgba(248,249,250,0.55)" }}>
                {puesta ? puesta.texto : c.ayuda}
              </p>
            </div>
          );
        })}
      </div>

      {!completa && (
        <Opciones>
          {piezas.map((p) => (
            <Opcion key={p.id} ancho deshabilitada={yaPuesta(p.id)} onClick={() => tocar(p)} estado={yaPuesta(p.id) ? "correcta" : null}>
              {p.texto}
            </Opcion>
          ))}
        </Opciones>
      )}

      <Retro texto={aviso} />

      {completa && (
        <Cierre pct={Math.round(pct)} onReiniciar={reiniciar} textoReiniciar="Diseñarlo otra vez">
          <p style={TEXTO_CIERRE}>
            Gasto 60 % y financiación 40 %.{" "}
            {senuelos > 0
              ? `${senuelos} ${senuelos === 1 ? "señuelo tocado" : "señuelos tocados"}: −${CASTIGO_SENUELO * senuelos} puntos.`
              : "Ni un señuelo tocado."}
          </p>
        </Cierre>
      )}
    </Tesoreria>
  );
}
