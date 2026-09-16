import { useEffect, useRef, useState } from "react";
import { FAE } from "../../../theme.js";
import { barajar } from "../../../utils/barajar.js";
import { puntuarConSenuelos } from "../../../data/politicaMonetaria.js";
import { Opcion, Opciones, Retro, Cierre, Enunciado } from "../corazon/juego.jsx";
import { TEXTO_CIERRE, RotuloEscenario } from "../bloques/marcos.jsx";

/*
 * ═══════════════════════════════════════════════════════════════════════════
 * CASILLAS EN ORDEN — PM-6 «La cadena de transmisión» y PM-12 «Diseña la
 * respuesta monetaria». La misma forma que Diseña el presupuesto (Política
 * Fiscal): las casillas se llenan en orden y se toca la pieza de la casilla
 * que toca ahora.
 *
 *   pieza de esta casilla    se pone, con su devolución de acierto
 *   señuelo                  su devolución, −5 %, y se apaga: el mismo
 *                            señuelo no resta dos veces
 *   pieza de OTRA casilla    no se pone y no resta: es un error de orden
 *                            dentro de la respuesta buena
 *
 * Todas las casillas acaban bien puestas, así que "N × 20 %" se gana siempre y
 * lo único que baja la nota son los señuelos:
 *
 *   pct = max(0, 100 − 5 × señuelos tocados)
 *
 * Ítem = `<caso>:<casilla>`; ok si entró a la primera, `intentos` los toques
 * que costó, y `respuesta` la primera pieza equivocada que se tocó para ella.
 *
 * `sortear()` devuelve el caso de la partida: la cadena y sus señuelos en
 * PM-6, uno de los dos casos en PM-12.
 * ═══════════════════════════════════════════════════════════════════════════
 */

export default function CasillasEnOrden({ sortear, Marco, rotulo, titulo, acento, onCompletar }) {
  const [caso, setCaso] = useState(sortear);
  const [piezas, setPiezas] = useState(() => barajar(caso.piezas));
  const [puestas, setPuestas] = useState({});
  const [apagados, setApagados] = useState([]);
  const [aviso, setAviso] = useState(null);

  const senuelos = useRef(0);
  const detalle = useRef([]);
  const intentos = useRef({});
  const primerFallo = useRef({});
  const inicio = useRef(Date.now());
  const [, forzar] = useState(0);

  const casillaActual = caso.casillas.find((c) => !puestas[c.id]);
  const completa = !casillaActual;
  const pct = puntuarConSenuelos(senuelos.current, caso.castigo);

  useEffect(() => {
    if (completa) onCompletar?.(pct, Date.now() - inicio.current, detalle.current);
  }, [completa]);

  const tocar = (pieza) => {
    if (completa || apagados.includes(pieza.id) || Object.values(puestas).some((p) => p.id === pieza.id)) return;
    const casilla = casillaActual.id;
    const n = (intentos.current[casilla] ?? 0) + 1;
    intentos.current[casilla] = n;

    if (pieza.casilla === casilla) {
      detalle.current.push({
        item: `${caso.id}:${casilla}`,
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
    if (!pieza.casilla) {
      senuelos.current += 1;
      setApagados((a) => [...a, pieza.id]);
      setAviso(pieza.retro);
      forzar((x) => x + 1);
    } else {
      setAviso(caso.retroOrden);
    }
  };

  const reiniciar = () => {
    const otro = sortear();
    setCaso(otro);
    setPiezas(barajar(otro.piezas));
    setPuestas({}); setApagados([]); setAviso(null);
    senuelos.current = 0;
    detalle.current = [];
    intentos.current = {};
    primerFallo.current = {};
    inicio.current = Date.now();
  };

  const puesta = (id) => Object.values(puestas).some((p) => p.id === id);

  return (
    <Marco rotulo={rotulo} titulo={titulo} acento={acento}>
      <Enunciado rotulo={caso.rotuloEnunciado} acento={acento}>{caso.enunciado}</Enunciado>
      {caso.etiqueta && <RotuloEscenario texto={caso.etiqueta} />}

      <ol style={{ listStyle: "none", margin: "14px 0 0", padding: 0, display: "flex", flexDirection: "column", gap: "6px" }}>
        {caso.fija && (
          <li data-casilla-fija style={{ padding: "11px 14px", borderRadius: "13px", background: "rgba(42,157,143,0.10)", border: `1px solid ${FAE.teal}` }}>
            <p style={{ margin: "0 0 3px", fontFamily: "Sora, sans-serif", fontSize: "11px", fontWeight: 700, letterSpacing: "0.12em", color: FAE.teal }}>{caso.fija.rotulo.toUpperCase()} · PUNTO DE PARTIDA</p>
            <p style={{ margin: 0, fontSize: "13.5px", lineHeight: 1.45, color: FAE.text }}>{caso.fija.texto}</p>
          </li>
        )}
        {caso.casillas.map((c) => {
          const p = puestas[c.id];
          const activa = !p && casillaActual?.id === c.id;
          return (
            <li
              key={c.id}
              data-casilla={c.id}
              style={{
                padding: "11px 14px", borderRadius: "13px",
                background: p ? "rgba(42,157,143,0.10)" : "rgba(248,249,250,0.03)",
                border: `1px ${p ? "solid" : "dashed"} ${p ? FAE.teal : activa ? FAE.ambar : "rgba(248,249,250,0.18)"}`,
              }}
            >
              <p style={{ margin: "0 0 3px", fontFamily: "Sora, sans-serif", fontSize: "11px", fontWeight: 700, letterSpacing: "0.12em", color: p ? FAE.teal : activa ? FAE.ambar : "rgba(248,249,250,0.45)" }}>
                {c.rotulo.toUpperCase()}{activa ? " · AHORA" : ""}{p ? " · ✓" : ""}
              </p>
              <p style={{ margin: 0, fontSize: "13.5px", lineHeight: 1.45, color: p ? FAE.text : "rgba(248,249,250,0.4)" }}>{p ? p.texto : "—"}</p>
            </li>
          );
        })}
      </ol>

      <Retro texto={aviso} />

      {!completa && (
        <Opciones columnas="repeat(auto-fit, minmax(220px, 1fr))">
          {piezas.map((p) => (
            <Opcion
              key={p.id}
              ancho
              deshabilitada={puesta(p.id) || apagados.includes(p.id)}
              onClick={() => tocar(p)}
              estado={puesta(p.id) ? "correcta" : apagados.includes(p.id) ? "incorrecta" : null}
            >
              {p.texto}
              {p.simulado && <span style={{ display: "block" }}><RotuloEscenario /></span>}
            </Opcion>
          ))}
        </Opciones>
      )}

      {completa && (
        <Cierre pct={Math.round(pct)} onReiniciar={reiniciar} textoReiniciar="Otra vez">
          <p style={TEXTO_CIERRE}>
            {senuelos.current > 0
              ? `${senuelos.current} ${senuelos.current === 1 ? "señuelo tocado" : "señuelos tocados"}: −${caso.castigo * senuelos.current} puntos.`
              : "Ni un señuelo tocado."}
          </p>
        </Cierre>
      )}
    </Marco>
  );
}
