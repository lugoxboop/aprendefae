import { useEffect, useRef, useState } from "react";
import { barajar } from "../../../utils/barajar.js";
import { porcentaje } from "../../../data/politicaFiscal.js";
import { ITEMS_POR_PARTIDA, retroClasificacion } from "../../../data/cimientos.js";
import { Opcion, Opciones, Retro, Pulsos, Cierre, Enunciado } from "../corazon/juego.jsx";
import { Avanzar, TEXTO_CIERRE } from "./marcos.jsx";

/*
 * ═══════════════════════════════════════════════════════════════════════════
 * PRIMERA CLASIFICACIÓN — Cimientos, evaluativa. Lo comparten las tres
 * materias.
 *
 * Sin reloj, un ítem a la vez, y las tres o cuatro categorías siempre a la
 * vista. Seis de ocho por partida. Es la primera victoria del camino: se
 * responde una vez, y fallar enseña igual la respuesta y por qué.
 *
 *   pct = aciertos / 6 × 100, sin redondear por el camino (6 × 16,67 no es 100)
 *
 * Ítem = el enunciado, por su id; `respuesta` guarda la categoría que se
 * eligió cuando se falla, que es lo que le dice algo al docente.
 * ═══════════════════════════════════════════════════════════════════════════
 */

export default function PrimeraClasificacion({ banco, Marco, rotulo, titulo, acento, onCompletar }) {
  const [items, setItems] = useState(() => barajar(banco.items).slice(0, ITEMS_POR_PARTIDA));
  const [i, setI] = useState(0);
  const [elegida, setElegida] = useState(null);
  const [aciertos, setAciertos] = useState(0);
  const [terminado, setTerminado] = useState(false);

  const respondidos = useRef(new Set());
  const detalle = useRef([]);
  const inicio = useRef(Date.now());

  const item = items[i];
  const pct = porcentaje(aciertos, items.length);

  useEffect(() => {
    if (terminado) onCompletar?.(pct, Date.now() - inicio.current, detalle.current);
  }, [terminado]);

  const responder = (categoria) => {
    if (respondidos.current.has(item.id)) return;
    respondidos.current.add(item.id);
    const ok = categoria === item.respuesta;
    detalle.current.push({ item: item.id, ok, intentos: 1, respuesta: ok ? null : categoria, orden: detalle.current.length + 1 });
    if (ok) setAciertos((n) => n + 1);
    setElegida(categoria);
  };

  const avanzar = () => {
    if (!elegida) return;
    setElegida(null);
    if (i + 1 < items.length) setI(i + 1);
    else setTerminado(true);
  };

  const reiniciar = () => {
    setItems(barajar(banco.items).slice(0, ITEMS_POR_PARTIDA));
    setI(0); setElegida(null); setAciertos(0); setTerminado(false);
    respondidos.current = new Set();
    detalle.current = [];
    inicio.current = Date.now();
  };

  if (terminado) {
    return (
      <Marco rotulo={rotulo} titulo={titulo} acento={acento}>
        <Cierre pct={Math.round(pct)} onReiniciar={reiniciar} textoReiniciar="Otros seis">
          <p style={TEXTO_CIERRE}>{aciertos} de {items.length} bien clasificados.</p>
        </Cierre>
      </Marco>
    );
  }

  return (
    <Marco rotulo={rotulo} titulo={titulo} acento={acento}>
      <div style={{ marginBottom: "12px" }}>
        <Pulsos total={items.length} hechos={i + (elegida ? 1 : 0)} etiqueta="Enunciado" />
      </div>
      <Enunciado rotulo={banco.pregunta.toUpperCase()} acento={acento}>{item.texto}</Enunciado>
      <Opciones columnas="repeat(auto-fit, minmax(150px, 1fr))">
        {banco.categorias.map((c) => (
          <Opcion
            key={c.id}
            ancho
            deshabilitada={Boolean(elegida)}
            onClick={() => responder(c.id)}
            estado={!elegida ? null : c.id === elegida ? (c.id === item.respuesta ? "correcta" : "incorrecta") : c.id === item.respuesta ? "revelada" : null}
          >
            {c.nombre}
          </Opcion>
        ))}
      </Opciones>
      <Retro texto={elegida ? retroClasificacion(banco, item, elegida) : null} />
      {elegida && <Avanzar onClick={avanzar}>{i + 1 === items.length ? "Ver resultado" : "Siguiente"}</Avanzar>}
    </Marco>
  );
}
