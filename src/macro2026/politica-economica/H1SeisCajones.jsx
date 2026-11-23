/*
 * H1 · Seis peldaños (pe26-h1-seis-cajones, Hacer, Medio, 25 FP × %).
 * Especificación de Gen, t2 §2 H1: el enunciado cae como tarjeta y se
 * arrastra (o tocar-tocar, o teclado) a su peldaño. Acierto: encaja y el
 * peldaño se ilumina. Error: rebota, borde coral 300 ms, la retro del par
 * (verdadero → elegido) y un segundo intento que ya no suma.
 * Partida: 12 enunciados, 2 por peldaño, sorteados del banco de 42.
 * Puntaje = aciertos al primer intento / 12.
 *
 * Decisión (construccion-t2.md): si el segundo intento también yerra, la
 * tarjeta va sola a su peldaño con la retro a la vista. Los peldaños no
 * cuentan cuántas tarjetas llevan (D5: contar delataría el último par).
 */
import { useMemo, useState } from "react";
import { CORAL, FONDO, INK, INK_2 } from "../comun/colores-da.js";
import { MarcoHacer, Retro, useCronometro } from "../comun/ui.jsx";
import { barajar, sortear, azarDeLaPagina } from "../comun/azar.js";
import { useArrastre } from "../comun/arrastre.js";
import Escalera, { ORDEN_PELDANOS } from "../comun/Escalera.jsx";
import { BANCO_H1, CONSIGNAS, PARTIDA_H1_POR_PELDANO, RETRO_H1 } from "./textos.js";

export const ID = "pe26-h1-seis-cajones";

export function prepararH1(rng = Math.random) {
  const elegidas = ORDEN_PELDANOS.flatMap((p) => sortear(BANCO_H1.filter((e) => e.correcta === p), PARTIDA_H1_POR_PELDANO, rng));
  return barajar(elegidas, rng);
}

const CSS = `
.pe26-h1-tarjeta { display: block; width: 100%; min-height: 96px; padding: 10px 12px; border-radius: 12px; border: 2px solid ${INK}; background: ${FONDO}; color: ${INK}; font: 600 14px/1.35 var(--planck-font-sans, system-ui, sans-serif); text-align: left; cursor: grab; touch-action: none; -webkit-user-select: none; user-select: none; transition: transform 280ms cubic-bezier(.3,.9,.4,1), opacity 280ms cubic-bezier(.3,.9,.4,1); }
.pe26-h1-tarjeta[aria-pressed="true"] { box-shadow: 0 0 0 3px ${INK_2}; }
.pe26-h1-tarjeta[data-arrastrando="1"] { transition: none; cursor: grabbing; box-shadow: 0 10px 24px rgba(0,0,0,.5); }
.pe26-h1-tarjeta[data-estado="mal"] { border-color: ${CORAL}; }
.pe26-h1-hueco { margin-bottom: 10px; }
@media (prefers-reduced-motion: reduce) { .pe26-h1-tarjeta { transition: opacity 120ms linear; } }
`;

export default function H1SeisCajones({ onTerminar, rng = null }) {
  const tarjetas = useMemo(() => prepararH1(rng ?? azarDeLaPagina()), [rng]);
  const tiempo = useCronometro();
  const [n, setN] = useState(0);
  const [intento, setIntento] = useState(1);
  const [detalle, setDetalle] = useState([]);
  const [retro, setRetro] = useState(null);
  const [mal, setMal] = useState(0);
  const [rojo, setRojo] = useState(false);
  const [encaja, setEncaja] = useState(null);
  const t = tarjetas[n];

  const avanzar = (det, espera) => {
    setTimeout(() => {
      setEncaja(null);
      setRetro(null);
      if (n + 1 >= tarjetas.length) {
        const bien = det.filter((d) => d.ok).length;
        onTerminar?.({ pct: Math.round((bien / tarjetas.length) * 100), detalle: det, duracionMs: tiempo() });
        return;
      }
      setN(n + 1);
      setIntento(1);
    }, espera);
  };

  const soltar = (id, peldano) => {
    if (!t || encaja || id !== t.id) return;
    if (peldano === t.correcta) {
      const det = intento === 1 ? [...detalle, { item: t.id, ok: true, subtemas: t.subtemas }] : detalle;
      setDetalle(det);
      setRetro(null);
      setEncaja(peldano);
      avanzar(det, 750);
      return;
    }
    setRetro(RETRO_H1[t.correcta][peldano]);
    setMal((m) => m + 1);
    setRojo(true);
    setTimeout(() => setRojo(false), 300);
    if (intento === 1) {
      setDetalle((d) => [...d, { item: t.id, ok: false, subtemas: t.subtemas }]);
      setIntento(2);
    } else {
      setEncaja(t.correcta);
      avanzar(detalle, 2400);
    }
  };

  const { contenedor, pieza, destino } = useArrastre({ alSoltar: soltar, activo: !encaja });

  return (
    <MarcoHacer id={ID} consigna={CONSIGNAS[ID]} progreso={`${Math.min(n + 1, tarjetas.length)} / ${tarjetas.length}`}>
      <style>{CSS}</style>
      <div data-figura ref={contenedor}>
        <div className="pe26-h1-hueco">
          {t && (
            <div className="da26-entra" key={t.id}>
              <button
                type="button"
                key={`${t.id}-${mal}`}
                className={`pe26-h1-tarjeta${retro && !encaja ? " da26-tiembla" : ""}`}
                data-tarjeta={t.id}
                data-estado={rojo ? "mal" : undefined}
                aria-label={`${t.texto}. Toca la tarjeta y luego un peldaño, o arrástrala.`}
                {...pieza(t.id)}
                style={{ ...pieza(t.id).style, opacity: encaja ? 0.3 : 1 }}
              >
                {t.texto}
              </button>
            </div>
          )}
        </div>
        <Escalera
          destino={(p) => destino(p, t?.id ?? null)}
          contenido={encaja ? { [encaja]: <span className="da26-entra">{t.texto}</span> } : {}}
          iluminados={encaja ? new Set([encaja]) : null}
          estados={encaja ? { [encaja]: "bien" } : {}}
        />
      </div>
      <Retro estado="mal" key={`r${mal}`}>{retro}</Retro>
    </MarcoHacer>
  );
}
