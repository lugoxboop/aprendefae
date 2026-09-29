import { useEffect, useRef, useState } from "react";
import { FAE } from "../../../theme.js";
import { barajar } from "../../../utils/barajar.js";
import { porcentaje } from "../../../data/politicaFiscal.js";
import { Opcion, Opciones, Retro, Pulsos, Cierre, Enunciado } from "../corazon/juego.jsx";
import { Avanzar, TEXTO_CIERRE, RotuloEscenario } from "./marcos.jsx";
/* Por defecto, la devolución del consejo de ministros: acierto y error de la ficha. */
import { retroConsejo } from "../../../data/bloquesAvanzados.js";

/*
 * ═══════════════════════════════════════════════════════════════════════════
 * DUELOS POR PAREJAS — Experto. «El consejo de ministros» (Política
 * Económica) y «Duelo de instrumentos» (Política Monetaria).
 *
 * Tres propuestas para una misma situación y tres duelos: de dos en dos, cuál
 * conviene más. Juntos, los tres duelos son un orden sin pedir que se ordene
 * de golpe, que es donde se adivina (Thurstone, juicio comparativo).
 *
 * Los duelos y los lados se barajan: la que gana no va siempre a la izquierda.
 *
 *   pct = duelos acertados / 3 × 100, sin redondear por el camino
 *
 * Ítem = el duelo, por su id (`a-vs-b`…); con varios casos, `<caso>:<duelo>`
 * —la A de un caso no es la A del otro—. `respuesta` es la propuesta elegida.
 *
 * Opciones: `casos` (se sortea uno por partida), `retro` (la devolución de la
 * actividad), `caso.etiqueta` (el rótulo de escenario simulado o real).
 * ═══════════════════════════════════════════════════════════════════════════
 */

const duelosDe = (caso) => barajar(caso.duelos).map((d) => ({ ...d, lados: barajar(d.par) }));

export default function DuelosRanking({ caso: casoUnico, casos, Marco, rotulo, titulo, acento, onCompletar, retro = retroConsejo }) {
  const sortear = () => (casos ? barajar(casos)[0] : casoUnico);
  const [caso, setCaso] = useState(sortear);
  const [duelos, setDuelos] = useState(() => duelosDe(caso));
  const [i, setI] = useState(0);
  const [elegida, setElegida] = useState(null);
  const [aciertos, setAciertos] = useState(0);
  const [terminado, setTerminado] = useState(false);

  const respondidos = useRef(new Set());
  const detalle = useRef([]);
  const inicio = useRef(Date.now());

  const d = duelos[i];
  const pct = porcentaje(aciertos, duelos.length);
  const letra = (x) => x.toUpperCase();
  const idItem = (duelo) => (casos ? `${caso.id}:${duelo.id}` : duelo.id);

  useEffect(() => {
    if (terminado) onCompletar?.(pct, Date.now() - inicio.current, detalle.current);
  }, [terminado]);

  const elegir = (x) => {
    if (respondidos.current.has(d.id)) return;
    respondidos.current.add(d.id);
    const ok = x === d.gana;
    detalle.current.push({ item: idItem(d), ok, intentos: 1, respuesta: x, orden: detalle.current.length + 1 });
    if (ok) setAciertos((n) => n + 1);
    setElegida(x);
  };

  const avanzar = () => {
    if (!elegida) return;
    setElegida(null);
    if (i + 1 < duelos.length) setI(i + 1);
    else setTerminado(true);
  };

  const reiniciar = () => {
    const otro = sortear();
    setCaso(otro);
    setDuelos(duelosDe(otro));
    setI(0); setElegida(null); setAciertos(0); setTerminado(false);
    respondidos.current = new Set();
    detalle.current = [];
    inicio.current = Date.now();
  };

  if (terminado) {
    return (
      <Marco rotulo={rotulo} titulo={titulo} acento={acento}>
        <Cierre pct={Math.round(pct)} onReiniciar={reiniciar} textoReiniciar="Otra ronda de duelos">
          <p style={TEXTO_CIERRE}>{aciertos} de {duelos.length} duelos. Los tres juntos dan este orden:</p>
          <ol style={{ margin: "8px 0 0", paddingLeft: "20px", display: "flex", flexDirection: "column", gap: "4px" }}>
            {caso.ranking.map((x) => (
              <li key={x} style={{ fontSize: "13px", lineHeight: 1.45, color: "rgba(248,249,250,0.82)" }}>
                <strong style={{ fontFamily: "Sora, sans-serif", color: FAE.text }}>{letra(x)}</strong> · {caso.medidas[x]}
              </li>
            ))}
          </ol>
        </Cierre>
      </Marco>
    );
  }

  return (
    <Marco rotulo={rotulo} titulo={titulo} acento={acento}>
      <div style={{ marginBottom: "12px" }}>
        <Pulsos total={duelos.length} hechos={i + (elegida ? 1 : 0)} enCurso={i + 1} etiqueta="Duelo" />
      </div>
      <Enunciado rotulo="LA SITUACIÓN" acento={acento}>{caso.caso}</Enunciado>
      {caso.etiqueta && <RotuloEscenario texto={caso.etiqueta} />}
      <p style={{ margin: "14px 0 0", fontFamily: "Sora, sans-serif", fontSize: "15px", fontWeight: 700, lineHeight: 1.4 }}>
        De estas dos, ¿cuál conviene más aquí?
      </p>
      <Opciones columnas="repeat(auto-fit, minmax(200px, 1fr))">
        {d.lados.map((x) => (
          <Opcion
            key={x}
            ancho
            deshabilitada={Boolean(elegida)}
            onClick={() => elegir(x)}
            estado={!elegida ? null : x === elegida ? (x === d.gana ? "correcta" : "incorrecta") : x === d.gana ? "revelada" : null}
          >
            <strong style={{ fontFamily: "Sora, sans-serif" }}>{letra(x)}</strong> · {caso.medidas[x]}
          </Opcion>
        ))}
      </Opciones>
      <Retro texto={elegida ? retro(d, elegida) : null} />
      {elegida && <Avanzar onClick={avanzar}>{i + 1 === duelos.length ? "Ver el orden" : "Siguiente duelo"}</Avanzar>}
    </Marco>
  );
}
