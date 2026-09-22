import { useMemo, useRef, useState } from "react";
import { FAE, ANCHO_ESTRECHO } from "../../../theme.js";
import { BANDEJAS, COMUNICADOS, SUBTEMAS, errorDeComunicado } from "../../../data/nova.js";
import { MESES } from "../../../data/nova.js";
import { ITEMS_POR_ETAPA, pctDeItems } from "../../../nova/puntuacion.js";
import { barajar } from "../../../utils/barajar.js";

/*
 * ═══════════════════════════════════════════════════════════════════════════
 * ETAPA 1 — "¿Cobra, Gasta o Pide Prestado?"
 * Subtema: Instrumentos de política fiscal
 *
 * Comunicados oficiales que llegan a la mesa uno a uno, fechados, y tres
 * bandejas. Banco de 14, ocho por intento, orden al azar.
 *
 * SE TOCA LA BANDEJA, NO SE ARRASTRA EL COMUNICADO. Misma decisión y mismo
 * motivo que el expediente del Arca y que Arma el grupo lógico: el arrastre
 * nativo no funciona con el dedo sin una librería encima, y esto se ve sobre
 * todo en el teléfono. El comunicado sí VIAJA hacia la bandeja al soltarlo,
 * que es lo que la ficha pide que se vea.
 *
 * ═══════════ UN SOLO REINTENTO, Y NO REGALA EL PUNTO ═══════════
 *
 * Fallar rebota en coral, enseña por qué y deja el comunicado otra vez sobre la
 * mesa. Una vez. El segundo toque lo archiva pase lo que pase, y si vuelve a
 * fallar se ve la explicación de la bandeja correcta.
 *
 * El punto se lo lleva SOLO quien acierta al primer intento —la misma regla que
 * el expediente del Arca, y por lo mismo: si el reintento puntuara, bastaba con
 * probar las tres bandejas—. El reintento existe para volver a mirar con la
 * explicación delante, no para recuperar el punto.
 * ═══════════════════════════════════════════════════════════════════════════
 */

const CSS = `
@keyframes fae-nc-llega { from { opacity: 0; transform: translateY(-14px) rotate(-1.2deg); } to { opacity: 1; transform: none; } }
.fae-nc-llega { animation: fae-nc-llega 420ms cubic-bezier(.3,.9,.4,1) both; }
@keyframes fae-nc-rebote { 0%,100% { transform: translateX(0); } 25% { transform: translateX(-7px); } 75% { transform: translateX(7px); } }
.fae-nc-rebote { animation: fae-nc-rebote 380ms ease-in-out; }
@keyframes fae-nc-sello { from { opacity: 0; transform: scale(.94); } to { opacity: 1; transform: none; } }
.fae-nc-sello { animation: fae-nc-sello 380ms cubic-bezier(.3,.9,.4,1) both; }
@media (prefers-reduced-motion: reduce) { .fae-nc-llega, .fae-nc-rebote, .fae-nc-sello { animation: none !important; } }

/*
 * LAS TRES BANDEJAS SON HERMANAS, Y EN EL TELÉFONO TIENEN QUE VERSE ASÍ.
 *
 * Con una rejilla automática, a 375 px caben dos de 167 px y la tercera baja
 * sola: COBRA y GASTA arriba, PIDE PRESTADO debajo. Eso dibuja una jerarquía
 * que no existe —las tres cajas del Estado son iguales— y justo sobre la
 * tercera, que es la que menos se ve y la que más cuesta. Por debajo del
 * ancho estrecho van una bajo otra, las tres iguales.
 */
.fae-nc-bandejas { display: grid; grid-template-columns: repeat(3, 1fr); gap: 10px; }
@media (max-width: ${ANCHO_ESTRECHO}px) { .fae-nc-bandejas { grid-template-columns: 1fr; } }
`;

/** Los ocho del intento: sorteados del banco de catorce y en orden al azar. */
export function repartir(banco = COMUNICADOS, cuantos = ITEMS_POR_ETAPA) {
  return barajar(banco).slice(0, cuantos);
}

export default function EtapaComunicados({ onTerminar, onMover, banco = COMUNICADOS }) {
  const [lote] = useState(() => repartir(banco));
  const [k, setK] = useState(0);
  const [fallo, setFallo] = useState(null);      // { texto, bandeja } del intento fallido
  const [sello, setSello] = useState(null);      // { texto } del archivado
  const [rebotando, setRebotando] = useState(false);

  const intentos = useRef(0);
  const primerFallo = useRef(null);
  const aciertos = useRef(0);
  const detalle = useRef([]);

  const comunicado = lote[k];
  const terminada = !comunicado;
  const mes = useMemo(() => MESES[Math.min(k, MESES.length - 2)], [k]);

  const cerrarItem = (ok) => {
    detalle.current.push({
      item: comunicado.id,
      ok,
      intentos: intentos.current,
      respuesta: primerFallo.current,
      orden: detalle.current.length + 1,
    });
    if (ok) aciertos.current += 1;
    intentos.current = 0;
    primerFallo.current = null;

    const siguiente = k + 1;
    if (siguiente >= lote.length) {
      onTerminar?.(pctDeItems(aciertos.current, lote.length), detalle.current);
    }
    setK(siguiente);
  };

  const archivar = (bandeja) => {
    if (terminada || sello) return;
    intentos.current += 1;
    const acertó = bandeja === comunicado.bandeja;

    if (acertó) {
      setFallo(null);
      setSello({ texto: comunicado.acierto });
      onMover?.(comunicado);
      return;
    }

    if (!primerFallo.current) primerFallo.current = bandeja;

    /* Primer fallo: rebota, explica y vuelve a la mesa. Segundo: se cierra. */
    if (intentos.current === 1) {
      setFallo({ texto: errorDeComunicado(comunicado, bandeja), bandeja });
      setRebotando(true);
      setTimeout(() => setRebotando(false), 400);
      return;
    }
    setFallo(null);
    setSello({ texto: comunicado.acierto, fallado: true });
  };

  const seguir = () => {
    const ok = intentos.current === 1;
    setSello(null);
    setFallo(null);
    cerrarItem(ok);
  };

  if (terminada) {
    return (
      <p data-etapa-hecha="1" style={{ fontSize: "14px", lineHeight: 1.6, color: "rgba(248,249,250,0.7)", margin: 0 }}>
        {aciertos.current} de {lote.length} comunicados clasificados al primer intento.
      </p>
    );
  }

  return (
    <div data-etapa="1">
      <style>{CSS}</style>

      <p style={{ fontFamily: "Sora, sans-serif", fontSize: "10.5px", fontWeight: 700, letterSpacing: "0.12em", color: FAE.teal, margin: "0 0 10px" }}>
        {SUBTEMAS[1].toUpperCase()}
      </p>

      <p style={{ fontSize: "14px", lineHeight: 1.6, color: "rgba(248,249,250,0.7)", margin: "0 0 14px" }}>
        Comunicado {k + 1} de {lote.length}. Toca la bandeja a la que pertenece. Cuenta el primer intento.
      </p>

      {/* ------------------------------ el comunicado ------------------------------ */}
      <article
        key={comunicado.id}
        data-comunicado={comunicado.id}
        className={rebotando ? "fae-nc-rebote" : "fae-nc-llega"}
        style={{
          borderRadius: "16px", padding: "15px 16px", marginBottom: "16px",
          background: "rgba(248,249,250,0.055)",
          border: `1px solid ${rebotando ? FAE.coral : "rgba(248,249,250,0.16)"}`,
        }}
      >
        <p style={{ fontFamily: "Sora, sans-serif", fontSize: "10.5px", fontWeight: 700, letterSpacing: "0.12em", color: "rgba(248,249,250,0.45)", margin: "0 0 7px" }}>
          COMUNICADO OFICIAL · {mes.toUpperCase()}
        </p>
        <p style={{ fontSize: "14.5px", lineHeight: 1.55, color: FAE.text, margin: 0 }}>
          {comunicado.texto}
        </p>
      </article>

      {/* -------------------------------- las bandejas -------------------------------- */}
      <div className="fae-nc-bandejas">
        {BANDEJAS.map((b) => (
          <button
            key={b.id}
            type="button"
            data-bandeja={b.id}
            onClick={() => archivar(b.id)}
            disabled={Boolean(sello)}
            style={{
              padding: "16px 12px", borderRadius: "14px",
              cursor: sello ? "default" : "pointer",
              background: "rgba(248,249,250,0.04)",
              border: `1px solid ${fallo?.bandeja === b.id ? FAE.coral : "rgba(248,249,250,0.18)"}`,
              color: FAE.text, fontFamily: "Sora, sans-serif",
              fontSize: "13px", fontWeight: 700, letterSpacing: "0.08em",
              opacity: sello ? 0.45 : 1,
            }}
          >
            {b.rotulo}
          </button>
        ))}
      </div>

      {/*
        El error. Puede no haber texto: hay combinaciones que la ficha no cubre
        —ver la nota de errorDeComunicado—. Cuando no lo hay, el rebote en coral
        es toda la respuesta; no se improvisa una explicación.
      */}
      {fallo?.texto && (
        <p data-error style={{ fontSize: "13.5px", lineHeight: 1.6, color: FAE.coral, margin: "14px 0 0" }}>
          {fallo.texto}
        </p>
      )}

      {/* El sello: la explicación de la bandeja correcta y el paso al siguiente. */}
      {sello && (
        <div className="fae-nc-sello" style={{ marginTop: "14px" }}>
          <p data-acierto style={{ fontSize: "13.5px", lineHeight: 1.6, color: sello.fallado ? "rgba(248,249,250,0.78)" : FAE.teal, margin: "0 0 12px" }}>
            {sello.texto}
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
            {k + 1 < lote.length ? "Siguiente comunicado" : "Cerrar la bandeja"}
          </button>
        </div>
      )}
    </div>
  );
}
