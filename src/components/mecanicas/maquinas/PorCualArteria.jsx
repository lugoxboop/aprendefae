import { useEffect, useRef, useState } from "react";
import { barajar } from "../../../utils/barajar.js";
import { porcentaje } from "../../../data/politicaFiscal.js";
import { ARTERIA, OPCIONES_ARTERIA, ESLABONES_ARTERIA, retroArteria } from "../../../data/monetariaRepaso.js";
import { Opcion, Opciones, Retro, Pulsos, Cierre, Enunciado } from "../corazon/juego.jsx";
import { Avanzar, TEXTO_CIERRE } from "../bloques/marcos.jsx";
import { Encabezado } from "../libros/tema1/encabezado.jsx";

/*
 * ═══════════════════════════════════════════════════════════════════════════
 * ¿POR CUÁL ARTERIA ENTRA? — Análisis, 50 FP.
 *
 * El patrón de «Corriente de Decisiones» (PrimeraClasificacion): un eslabón a
 * la vez, sin reloj, las cinco opciones siempre a la vista. Es un componente
 * nuevo y no un banco más para aquel, porque aquel no tiene sitio para lo que
 * esta trae: la regla fija en pantalla, la consigna con «¿Cómo se juega?»,
 * los errores por tipo, el texto de cierre y el modo demo del tutorial.
 * PrimeraClasificacion no se toca.
 *
 *   · los 11 eslabones en cada partida, en otro orden cada vez
 *   · las opciones en su orden, porque están numeradas (Arteria 1 a 4)
 *   · un intento por eslabón
 *   · pct = aciertos / 11 × 100, sin redondear por el camino
 *
 * Ítem = el eslabón, por su id; `respuesta` guarda la opción elegida al fallar.
 *
 * MODO DEMO («Así se juega»): llega `items` con el ejemplo del hotel, no se
 * baraja nada, no hay encabezado y nunca se llama a `onCompletar`.
 * ═══════════════════════════════════════════════════════════════════════════
 */

const ESTILO_REGLA = {
  margin: "0 0 12px", padding: "10px 13px", borderRadius: "12px",
  fontSize: "13.5px", lineHeight: 1.5, color: "rgba(248,249,250,0.86)",
  background: "rgba(248,249,250,0.05)", border: "1px solid rgba(248,249,250,0.14)",
};

export default function PorCualArteria({
  Marco, rotulo, titulo, acento, onCompletar, items = null, modoDemo = false, onComoSeJuega = null,
}) {
  const sortear = () => (items ?? barajar(ESLABONES_ARTERIA));
  const [eslabones, setEslabones] = useState(sortear);
  const [i, setI] = useState(0);
  const [elegida, setElegida] = useState(null);
  const [aciertos, setAciertos] = useState(0);
  const [terminado, setTerminado] = useState(false);

  const respondidos = useRef(new Set());
  const detalle = useRef([]);
  const inicio = useRef(Date.now());

  const item = eslabones[i];
  const pct = porcentaje(aciertos, eslabones.length);

  useEffect(() => {
    if (terminado && !modoDemo) onCompletar?.(pct, Date.now() - inicio.current, detalle.current);
  }, [terminado]);

  const responder = (opcion) => {
    if (respondidos.current.has(item.id)) return;
    respondidos.current.add(item.id);
    const ok = opcion === item.respuesta;
    detalle.current.push({ item: item.id, ok, intentos: 1, respuesta: ok ? null : opcion, orden: detalle.current.length + 1 });
    if (ok) setAciertos((n) => n + 1);
    setElegida(opcion);
  };

  const avanzar = () => {
    if (!elegida) return;
    setElegida(null);
    if (i + 1 < eslabones.length) setI(i + 1);
    else setTerminado(true);
  };

  const reiniciar = () => {
    setEslabones(sortear());
    setI(0); setElegida(null); setAciertos(0); setTerminado(false);
    respondidos.current = new Set();
    detalle.current = [];
    inicio.current = Date.now();
  };

  if (terminado && !modoDemo) {
    return (
      <Marco rotulo={rotulo} titulo={titulo} acento={acento}>
        <Cierre pct={Math.round(pct)} onReiniciar={reiniciar} textoReiniciar="Otra tanda">
          <p data-cierre-texto style={TEXTO_CIERRE}>{ARTERIA.cierre}</p>
        </Cierre>
      </Marco>
    );
  }

  const retro = elegida ? retroArteria(item, elegida) : null;

  return (
    <Marco rotulo={rotulo} titulo={titulo} acento={acento}>
      {!modoDemo && <Encabezado consigna={ARTERIA.consigna} onComoSeJuega={onComoSeJuega} />}
      <p data-regla style={ESTILO_REGLA}>{ARTERIA.regla}</p>
      {!modoDemo && (
        <div style={{ marginBottom: "12px" }}>
          <Pulsos total={eslabones.length} hechos={i + (elegida ? 1 : 0)} enCurso={i + 1} etiqueta="Eslabón" />
        </div>
      )}
      <div data-hecho>
        <Enunciado acento={acento}>{item.texto}</Enunciado>
      </div>
      <Opciones columnas="repeat(auto-fit, minmax(150px, 1fr))">
        {OPCIONES_ARTERIA.map((o) => (
          <Opcion
            key={o.id}
            ancho
            deshabilitada={Boolean(elegida)}
            onClick={() => responder(o.id)}
            estado={!elegida ? null : o.id === elegida ? (o.id === item.respuesta ? "correcta" : "incorrecta") : o.id === item.respuesta ? "revelada" : null}
          >
            {o.nombre}
          </Opcion>
        ))}
      </Opciones>
      <Retro texto={retro} />
      {elegida && !modoDemo && <Avanzar onClick={avanzar}>{i + 1 === eslabones.length ? "Ver resultado" : "Siguiente"}</Avanzar>}
    </Marco>
  );
}
