import { useEffect, useRef, useState } from "react";
import { FAE } from "../../../theme.js";
import { MEDIDAS_LINEA, SUBTEMAS, errorDeLinea } from "../../../data/nova.js";
import { EFECTOS, aplicarEfecto } from "../../../nova/estado.js";
import { ITEMS_POR_ETAPA, pctDeItems } from "../../../nova/puntuacion.js";
import { barajar } from "../../../utils/barajar.js";

/*
 * ═══════════════════════════════════════════════════════════════════════════
 * ETAPA 2 — "La Línea que se Mueve"
 * Subtema: Impacto de la política fiscal en los estados financieros
 *
 * Llega una medida y el estudiante toca, SOBRE LA PANTALLA DEL FONDO, la línea
 * que se mueve primero. Al acertar, esa línea se enciende, su cifra cuenta
 * hacia el nuevo valor y las que dependen de ella se actualizan detrás, más
 * tenues. Banco de 12, ocho por intento.
 *
 * ESTA ETAPA NO DIBUJA SU PROPIO TABLERO. Pinta el enunciado y le presta sus
 * manos al estado de resultados que ya está arriba: por eso recibe `panel`, y
 * por eso no hay aquí ninguna lista de opciones. Si hubiera una lista, el
 * estudiante elegiría de un menú en vez de leer el estado, que es el gesto que
 * la etapa quiere enseñar.
 *
 * ═══════════ EL MOMENTO DISEÑADO ═══════════
 *
 * Gastos financieros lleva todo el desafío en $0 y apagada. Con la medida del
 * costo del crédito —y solo con esa— despierta. El componente no lo decide: lo
 * decide el dato (`linea === "financieros"`), así que no hay forma de que se
 * encienda por accidente en otra.
 *
 * ═══════════ UN SOLO REINTENTO ═══════════
 *
 * Igual que la Etapa 1 y por lo mismo. Puntúa el primer intento; el reintento
 * sirve para volver a mirar con la explicación delante.
 *
 * HAY COMBINACIONES SIN TEXTO DE ERROR, y no se rellenan aquí. La ficha cubre
 * seis confusiones; las demás devuelven null y entonces se ve el aviso en
 * coral sobre la línea tocada y nada más. Escribirle una explicación a la
 * pedagogía que no la escribió sería peor que dejar el hueco a la vista.
 * ═══════════════════════════════════════════════════════════════════════════
 */

/** Las ocho del intento. */
export function repartir(banco = MEDIDAS_LINEA, cuantos = ITEMS_POR_ETAPA) {
  return barajar(banco).slice(0, cuantos);
}

export default function EtapaLinea({ onTerminar, panel, banco = MEDIDAS_LINEA }) {
  const [lote] = useState(() => repartir(banco));
  const [k, setK] = useState(0);
  const [fallo, setFallo] = useState(null);
  const [resuelta, setResuelta] = useState(null);

  const intentos = useRef(0);
  const primerFallo = useRef(null);
  const aciertos = useRef(0);
  const detalle = useRef([]);

  const medida = lote[k];
  const terminada = !medida;

  /*
   * Mientras se pregunta, las líneas del estado son los botones. Al resolver se
   * apagan: tocar una línea con la respuesta ya en pantalla no significa nada.
   */
  const tocar = useRef(() => {});
  useEffect(() => {
    if (terminada) {
      panel?.({ onTocar: null, erronea: null });
      return;
    }
    panel?.({
      mes: Math.min(8, 4 + Math.floor(k / 3)),
      onTocar: resuelta ? null : (id) => tocar.current(id),
      erronea: fallo?.linea ?? null,
    });
  }, [k, resuelta, fallo, terminada, panel]);

  tocar.current = (elegida) => {
    if (terminada || resuelta) return;
    intentos.current += 1;

    if (elegida === medida.linea) {
      /* Se enciende la línea, cuenta su cifra y arrastra a las derivadas. */
      panel?.({
        movida: medida.linea,
        direccion: EFECTOS[medida.id]?.direccion ?? null,
        despierta: medida.linea === "financieros" ? true : undefined,
        aplicar: medida.id,
        erronea: null,
      });
      setFallo(null);
      setResuelta({ texto: medida.acierto });
      return;
    }

    if (!primerFallo.current) primerFallo.current = elegida;

    if (intentos.current === 1) {
      setFallo({ texto: errorDeLinea(medida.linea, elegida), linea: elegida });
      return;
    }
    /* Segundo intento fallado: se resuelve igual y se ve cuál era. */
    panel?.({
      movida: medida.linea,
      direccion: EFECTOS[medida.id]?.direccion ?? null,
      despierta: medida.linea === "financieros" ? true : undefined,
      aplicar: medida.id,
      erronea: null,
    });
    setFallo(null);
    setResuelta({ texto: medida.acierto, fallada: true });
  };

  const seguir = () => {
    const ok = intentos.current === 1;
    detalle.current.push({
      item: medida.id,
      ok,
      intentos: intentos.current,
      respuesta: primerFallo.current,
      orden: detalle.current.length + 1,
    });
    if (ok) aciertos.current += 1;
    intentos.current = 0;
    primerFallo.current = null;
    setResuelta(null);
    setFallo(null);
    panel?.({ movida: null, direccion: null });

    const siguiente = k + 1;
    if (siguiente >= lote.length) {
      onTerminar?.(pctDeItems(aciertos.current, lote.length), detalle.current);
    }
    setK(siguiente);
  };

  if (terminada) {
    return (
      <p data-etapa-hecha="2" style={{ fontSize: "14px", lineHeight: 1.6, color: "rgba(248,249,250,0.7)", margin: 0 }}>
        {aciertos.current} de {lote.length} líneas acertadas al primer intento.
      </p>
    );
  }

  return (
    <div data-etapa="2">
      <p style={{ fontFamily: "Sora, sans-serif", fontSize: "10.5px", fontWeight: 700, letterSpacing: "0.12em", color: FAE.teal, margin: "0 0 10px" }}>
        {SUBTEMAS[2].toUpperCase()}
      </p>

      <p style={{ fontSize: "14px", lineHeight: 1.6, color: "rgba(248,249,250,0.7)", margin: "0 0 14px" }}>
        Medida {k + 1} de {lote.length}. Toca arriba, en el estado de resultados, la línea que se
        mueve PRIMERO.
      </p>

      <article
        data-medida={medida.id}
        style={{
          borderRadius: "16px", padding: "15px 16px",
          background: "rgba(248,249,250,0.055)",
          border: `1px solid ${fallo ? FAE.coral : "rgba(248,249,250,0.16)"}`,
        }}
      >
        <p style={{ fontSize: "14.5px", lineHeight: 1.55, color: FAE.text, margin: 0 }}>
          {medida.texto}
        </p>
      </article>

      {fallo?.texto && (
        <p data-error style={{ fontSize: "13.5px", lineHeight: 1.6, color: FAE.coral, margin: "14px 0 0" }}>
          {fallo.texto}
        </p>
      )}

      {resuelta && (
        <div style={{ marginTop: "14px" }}>
          <p data-acierto style={{ fontSize: "13.5px", lineHeight: 1.6, color: resuelta.fallada ? "rgba(248,249,250,0.78)" : FAE.teal, margin: "0 0 12px" }}>
            {resuelta.texto}
          </p>
          <button
            type="button"
            onClick={seguir}
            style={{
              width: "100%", padding: "13px", borderRadius: "13px", cursor: "pointer",
              background: FAE.teal, border: `1px solid ${FAE.teal}`, color: FAE.bg,
              fontFamily: "Sora, sans-serif", fontSize: "14px", fontWeight: 700,
            }}
          >
            {k + 1 < lote.length ? "Siguiente medida" : "Cerrar el estado"}
          </button>
        </div>
      )}
    </div>
  );
}

/* Lo usa el orquestador para resolver `aplicar` sin conocer el banco. */
export { aplicarEfecto };
