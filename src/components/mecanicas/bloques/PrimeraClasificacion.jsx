import { useEffect, useRef, useState } from "react";
import { barajar } from "../../../utils/barajar.js";
import { porcentaje } from "../../../data/politicaFiscal.js";
import { ITEMS_POR_PARTIDA, retroClasificacion } from "../../../data/cimientos.js";
import { Opcion, Opciones, Retro, Pulsos, Cierre, Enunciado } from "../corazon/juego.jsx";
import { Avanzar, TEXTO_CIERRE, RotuloEscenario } from "./marcos.jsx";

/*
 * ═══════════════════════════════════════════════════════════════════════════
 * PRIMERA CLASIFICACIÓN — un ítem a la vez, sin reloj, las categorías siempre
 * a la vista.
 *
 * Nació para Cimientos (tres materias, seis de ocho). Política Monetaria la
 * usa también para ¿Quién decide esto?, La caja de herramientas y Corriente
 * de decisiones, con lo que cada banco declara:
 *
 *   banco.porPartida   cuántos se sortean (por defecto, 6)
 *   banco.retro        su propia devolución, (ítem, elegida) → texto
 *   ítem.simulado      la cifra no es del bloque de datos verificados: se
 *                      rotula en pantalla
 *   barajarOpciones    las categorías cambian de sitio en cada partida
 *   cae                el enunciado entra cayendo (Corriente de decisiones)
 *
 *   pct = aciertos / porPartida × 100, sin redondear por el camino
 *
 * Ítem = el enunciado, por su id; `respuesta` guarda la categoría que se
 * eligió cuando se falla, que es lo que le dice algo al docente.
 * ═══════════════════════════════════════════════════════════════════════════
 */

const CSS_CAE = `
@keyframes fae-pc-cae { from { opacity: 0; transform: translateY(-26px); } to { opacity: 1; transform: none; } }
.fae-pc-cae { animation: fae-pc-cae 380ms cubic-bezier(.3,.8,.4,1) both; }
@media (prefers-reduced-motion: reduce) { .fae-pc-cae { animation: none !important; } }
`;

export default function PrimeraClasificacion({ banco, Marco, rotulo, titulo, acento, onCompletar, barajarOpciones = false, cae = false }) {
  const cuantos = banco.porPartida ?? ITEMS_POR_PARTIDA;
  const sortear = () => barajar(banco.items).slice(0, cuantos);
  const ordenCategorias = () => (barajarOpciones ? barajar(banco.categorias) : banco.categorias);

  const [items, setItems] = useState(sortear);
  const [categorias, setCategorias] = useState(ordenCategorias);
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
    setItems(sortear());
    setCategorias(ordenCategorias());
    setI(0); setElegida(null); setAciertos(0); setTerminado(false);
    respondidos.current = new Set();
    detalle.current = [];
    inicio.current = Date.now();
  };

  if (terminado) {
    return (
      <Marco rotulo={rotulo} titulo={titulo} acento={acento}>
        <Cierre pct={Math.round(pct)} onReiniciar={reiniciar} textoReiniciar="Otra tanda">
          <p style={TEXTO_CIERRE}>{aciertos} de {items.length} bien clasificados.</p>
        </Cierre>
      </Marco>
    );
  }

  const retro = !elegida ? null : banco.retro ? banco.retro(item, elegida) : retroClasificacion(banco, item, elegida);

  return (
    <Marco rotulo={rotulo} titulo={titulo} acento={acento}>
      {cae && <style>{CSS_CAE}</style>}
      <div style={{ marginBottom: "12px" }}>
        <Pulsos total={items.length} hechos={i + (elegida ? 1 : 0)} enCurso={i + 1} etiqueta="Enunciado" />
      </div>
      <div key={item.id} className={cae ? "fae-pc-cae" : undefined}>
        <Enunciado rotulo={banco.pregunta.toUpperCase()} acento={acento}>{item.texto}</Enunciado>
        {item.simulado && <RotuloEscenario />}
      </div>
      <Opciones columnas="repeat(auto-fit, minmax(150px, 1fr))">
        {categorias.map((c) => (
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
      <Retro texto={retro} />
      {elegida && <Avanzar onClick={avanzar}>{i + 1 === items.length ? "Ver resultado" : "Siguiente"}</Avanzar>}
    </Marco>
  );
}
