import { useEffect, useRef, useState } from "react";
import { barajar } from "../../../utils/barajar.js";
import { porcentaje } from "../../../data/politicaFiscal.js";
import { Opcion, Opciones, Retro, Pulsos, Cierre, Enunciado } from "../corazon/juego.jsx";
import { Avanzar, TEXTO_CIERRE } from "../bloques/marcos.jsx";
import { Volante, CSS_MAQUINAS } from "./salaDeMaquinas.jsx";

/*
 * ═══════════════════════════════════════════════════════════════════════════
 * PM-3 · EL VOLANTE DE LA TASA — Medio.
 *
 * Un escenario; se predice si el Banco sube o baja la tasa, y SOLO DESPUÉS el
 * volante gira hacia donde de verdad va. Doce en el banco, ocho por partida,
 * y las dos opciones cambian de lado en cada partida.
 *
 *   pct = aciertos / 8 × 100, sin redondear por el camino
 *
 * Ítem = el escenario, por su id; `respuesta` guarda lo que se eligió al fallar.
 * ═══════════════════════════════════════════════════════════════════════════
 */

export default function PrediccionTasa({ banco, Marco, rotulo, titulo, acento, onCompletar }) {
  const sortear = () => barajar(banco.escenarios).slice(0, banco.porPartida);
  const [filas, setFilas] = useState(sortear);
  const [opciones, setOpciones] = useState(() => barajar(banco.opciones));
  const [i, setI] = useState(0);
  const [elegida, setElegida] = useState(null);
  const [aciertos, setAciertos] = useState(0);
  const [terminado, setTerminado] = useState(false);

  const respondidas = useRef(new Set());
  const detalle = useRef([]);
  const inicio = useRef(Date.now());

  const fila = filas[i];
  const pct = porcentaje(aciertos, filas.length);

  useEffect(() => {
    if (terminado) onCompletar?.(pct, Date.now() - inicio.current, detalle.current);
  }, [terminado]);

  const responder = (id) => {
    if (respondidas.current.has(fila.id)) return;
    respondidas.current.add(fila.id);
    const ok = id === fila.correcta;
    detalle.current.push({ item: fila.id, ok, intentos: 1, respuesta: ok ? null : id, orden: detalle.current.length + 1 });
    if (ok) setAciertos((n) => n + 1);
    setElegida(id);
  };

  const avanzar = () => {
    if (!elegida) return;
    setElegida(null);
    if (i + 1 < filas.length) setI(i + 1);
    else setTerminado(true);
  };

  const reiniciar = () => {
    setFilas(sortear());
    setOpciones(barajar(banco.opciones));
    setI(0); setElegida(null); setAciertos(0); setTerminado(false);
    respondidas.current = new Set();
    detalle.current = [];
    inicio.current = Date.now();
  };

  if (terminado) {
    return (
      <Marco rotulo={rotulo} titulo={titulo} acento={acento}>
        <Cierre pct={Math.round(pct)} onReiniciar={reiniciar} textoReiniciar="Otros ocho escenarios">
          <p style={TEXTO_CIERRE}>{aciertos} de {filas.length} bien predichos.</p>
        </Cierre>
      </Marco>
    );
  }

  /* Antes de responder, quieto. Después, hacia donde va de verdad. */
  const giro = !elegida ? 0 : fila.correcta === "subir" ? 90 : -90;
  const retro = !elegida ? null : elegida === fila.correcta ? fila.retro : banco.error;

  return (
    <Marco rotulo={rotulo} titulo={titulo} acento={acento}>
      <style>{CSS_MAQUINAS}</style>
      <div style={{ marginBottom: "12px" }}>
        <Pulsos total={filas.length} hechos={i + (elegida ? 1 : 0)} etiqueta="Escenario" />
      </div>
      <Enunciado rotulo="EL ESCENARIO" acento={acento}>{fila.texto}</Enunciado>
      <svg viewBox="0 0 160 96" width="170" height="102" aria-hidden="true" style={{ display: "block", margin: "8px auto 0" }}>
        <text x="16" y="18" style={{ fontFamily: "Sora, sans-serif", fontSize: "11px", fill: "rgba(248,249,250,0.6)" }}>Bajar</text>
        <text x="144" y="18" textAnchor="end" style={{ fontFamily: "Sora, sans-serif", fontSize: "11px", fill: "rgba(248,249,250,0.6)" }}>Subir</text>
        <Volante cx={80} cy={54} r={32} giro={giro} />
      </svg>
      <Opciones columnas="repeat(auto-fit, minmax(140px, 1fr))">
        {opciones.map((o) => (
          <Opcion
            key={o.id}
            ancho
            deshabilitada={Boolean(elegida)}
            onClick={() => responder(o.id)}
            estado={!elegida ? null : o.id === elegida ? (o.id === fila.correcta ? "correcta" : "incorrecta") : o.id === fila.correcta ? "revelada" : null}
          >
            {o.nombre}
          </Opcion>
        ))}
      </Opciones>
      <Retro texto={retro} />
      {elegida && <Avanzar onClick={avanzar}>{i + 1 === filas.length ? "Ver resultado" : "Siguiente"}</Avanzar>}
    </Marco>
  );
}
