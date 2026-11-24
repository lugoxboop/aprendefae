/*
 * H4 · El peldaño que no encaja (pe26-h4-expediente, Hacer, Difícil, 50 FP × %).
 * Especificación de Gen, t2 §2 H4. Se ve una escalera completa de seis
 * tarjetas, con una incoherente.
 * - Tocar la errada: la tarjeta se desprende y cae, y en su lugar sube la
 *   corrección con su explicación.
 * - Tocar una coherente: borde coral breve y su retro; queda marcada ✓ y se
 *   sigue buscando. La escalera solo puntúa si se acierta al primer toque.
 * Partida: 4 escaleras sorteadas de 5. Puntaje = escaleras al primer toque / 4.
 * Un ítem es el id de la escalera (e1 … e5).
 */
import { useMemo, useState } from "react";
import { CORAL, INK_2 } from "../comun/colores-da.js";
import { Boton, MarcoHacer, Retro, useCronometro } from "../comun/ui.jsx";
import { sortear, azarDeLaPagina } from "../comun/azar.js";
import Escalera, { ORDEN_PELDANOS } from "../comun/Escalera.jsx";
import { BANCO_H4, CONSIGNAS, ENUNCIADOS, PARTIDA_H4, textoPeldanoH4, ESCENAS } from "./textos.js";

export const ID = "pe26-h4-expediente";

export function prepararH4(rng = Math.random) {
  return sortear(BANCO_H4, PARTIDA_H4, rng);
}

const CSS = `
.pe26-h4 .pe26-caja[data-estado="mal"] { border-color: ${CORAL}; }
.pe26-h4 .pe26-caja[data-estado="visto"] .pe26-rot::after { content: " ✓"; }
.pe26-h4-cae { animation: pe26-h4-cae 420ms cubic-bezier(.5,0,.8,.4) both 1; display: block; }
@keyframes pe26-h4-cae { to { opacity: 0; transform: translateY(40px) rotate(-3deg); } }
.pe26-h4-sube { animation: pe26-h4-sube 420ms cubic-bezier(.3,.9,.4,1) both 1; display: block; }
@keyframes pe26-h4-sube { from { opacity: 0; transform: translateY(24px); } to { opacity: 1; transform: none; } }
.pe26-h4-expl { display: block; margin-top: 4px; font-size: 13px; line-height: 1.3; color: ${INK_2}; }
@media (prefers-reduced-motion: reduce) { .pe26-h4-cae, .pe26-h4-sube { animation: none; } }
`;

export default function H4Expediente({ onTerminar, rng = null }) {
  const escaleras = useMemo(() => prepararH4(rng ?? azarDeLaPagina()), [rng]);
  const tiempo = useCronometro();
  const [n, setN] = useState(0);
  const [vistos, setVistos] = useState(new Set());
  const [rojo, setRojo] = useState(null);
  const [hallada, setHallada] = useState(false);
  const [cayo, setCayo] = useState(false);
  const [detalle, setDetalle] = useState([]);
  const [retro, setRetro] = useState(null);
  const [mal, setMal] = useState(0);
  const e = escaleras[n];

  const tocar = (p) => {
    if (hallada || vistos.has(p)) return;
    if (p === e.errado) {
      setDetalle([...detalle, { item: e.id, ok: vistos.size === 0, subtemas: e.subtemas }]);
      setRetro(null);
      setHallada(true);
      setTimeout(() => setCayo(true), 420);
      return;
    }
    setRetro(e.peldanos[p].retro);
    setMal((m) => m + 1);
    setRojo(p);
    setTimeout(() => setRojo(null), 300);
    setVistos(new Set(vistos).add(p));
  };

  const siguiente = () => {
    if (n + 1 >= escaleras.length) {
      const bien = detalle.filter((d) => d.ok).length;
      onTerminar?.({ pct: Math.round((bien / escaleras.length) * 100), detalle, duracionMs: tiempo() });
      return;
    }
    setN(n + 1);
    setVistos(new Set());
    setHallada(false);
    setCayo(false);
    setRetro(null);
  };

  const contenido = Object.fromEntries(ORDEN_PELDANOS.map((p) => {
    const texto = textoPeldanoH4(e.peldanos[p]);
    if (p !== e.errado || !hallada) return [p, texto];
    if (!cayo) return [p, <span className="pe26-h4-cae" key="cae">{texto}</span>];
    return [p, (
      <span className="pe26-h4-sube" key="sube" data-correccion={e.sube}>
        {ENUNCIADOS[e.sube]}
        <span className="pe26-h4-expl">{e.explicacion}</span>
      </span>
    )];
  }));
  const estados = Object.fromEntries(ORDEN_PELDANOS.map((p) => [p, rojo === p ? "mal" : vistos.has(p) ? "visto" : hallada && p === e.errado && cayo ? "bien" : undefined]));

  return (
    <MarcoHacer id={ID} escena={ESCENAS[ID]} mini={{ texto: ESCENAS[ID].porRonda.todas }} consigna={CONSIGNAS[ID]} progreso={`${n + 1} / ${escaleras.length}`}>
      <style>{CSS}</style>
      <div data-figura className="pe26-h4" data-escalera-h4={e.id} key={e.id}>
        <Escalera
          contenido={contenido}
          estados={estados}
          onPeldano={hallada ? null : tocar}
          iluminados={hallada && cayo ? new Set([e.errado]) : null}
          etiqueta="La escalera: toca el peldaño que no encaja"
        />
        {hallada && cayo && (
          <div className="da26-nav da26-entra" style={{ marginTop: 12 }}>
            <span />
            <Boton primario onClick={siguiente} data-siguiente-escalera>{n + 1 >= escaleras.length ? "Terminar" : "Siguiente escalera"}</Boton>
          </div>
        )}
      </div>
      <Retro estado="mal" key={`r${mal}`}>{retro}</Retro>
    </MarcoHacer>
  );
}
