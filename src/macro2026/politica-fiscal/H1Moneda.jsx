/*
 * H1 · Echa la moneda (pf26-h1-moneda, Hacer, Fácil, 10 FP × %).
 * Especificación de Gen, t3 §2 H1. Los tres buzones de A2; cada pago es una
 * moneda con su rótulo. Acierto: la moneda entra y se ve la consecuencia de
 * A2 (pozo, ticket, andén). Error: rebota con borde coral, la retro de ese
 * buzón y un segundo intento que ya no suma.
 * Partida: 8 de 11. Puntaje = aciertos al primer intento / 8.
 *
 * Decisión (construccion-t3.md, 7): si el segundo intento también yerra, la
 * moneda entra sola en su buzón con la retro a la vista, como T2 H1.
 */
import { useMemo, useState } from "react";
import { CORAL, FONDO, INK, INK_2 } from "../comun/colores-da.js";
import { Boton, MarcoHacer, Retro, useCronometro } from "../comun/ui.jsx";
import { azarDeLaPagina, sortear } from "../comun/azar.js";
import { useArrastre } from "../comun/arrastre.js";
import { ORDEN_TRIBUTOS, TRIBUTOS, tonoTributo } from "../comun/tributos.js";
import { BuzonIlustrado } from "../comun/ilustrados.jsx";
import { Objeto } from "../comun/kit.jsx";
import { CSS_A2, Escena } from "./A2Buzones.jsx";
import { BANCO_H1, CONSIGNAS, PARTIDA_H1, ESCENAS } from "./textos.js";

export const ID = "pf26-h1-moneda";
export const prepararH1 = (rng = Math.random) => sortear(BANCO_H1, PARTIDA_H1, rng);

const CSS = `
.pf26-h1-moneda { display: flex; align-items: center; gap: 10px; width: 100%; min-height: 64px; padding: 8px 14px 8px 8px; border-radius: 999px; border: 2px solid ${INK}; background: ${FONDO}; color: ${INK}; font: 600 15px/1.3 var(--planck-font-sans, system-ui, sans-serif); text-align: left; cursor: grab; touch-action: none; -webkit-user-select: none; user-select: none; transition: transform 280ms cubic-bezier(.3,.9,.4,1), opacity 280ms cubic-bezier(.3,.9,.4,1); }
.pf26-h1-moneda[aria-pressed="true"] { box-shadow: 0 0 0 3px ${INK_2}; }
.pf26-h1-moneda[data-arrastrando="1"] { transition: none; cursor: grabbing; }
.pf26-h1-moneda[data-estado="mal"] { border-color: ${CORAL}; }
.pf26-h1-hueco { min-height: 72px; }
`;

export default function H1Moneda({ onTerminar, rng = null }) {
  const pagos = useMemo(() => prepararH1(rng ?? azarDeLaPagina()), [rng]);
  const tiempo = useCronometro();
  const [n, setN] = useState(0);
  const [intento, setIntento] = useState(1);
  const [detalle, setDetalle] = useState([]);
  const [retro, setRetro] = useState(null);
  const [mal, setMal] = useState(0);
  const [rojo, setRojo] = useState(false);
  const [entro, setEntro] = useState(null);
  const t = pagos[n];

  const soltar = (id, buzon) => {
    if (!t || entro || id !== t.id) return;
    if (buzon === t.correcta) {
      if (intento === 1) setDetalle((d) => [...d, { item: t.id, ok: true, subtemas: t.subtemas }]);
      setRetro(null);
      setEntro(buzon);
      return;
    }
    setRetro(t.retro[buzon]);
    setMal((m) => m + 1);
    setRojo(true);
    setTimeout(() => setRojo(false), 300);
    if (intento === 1) {
      setDetalle((d) => [...d, { item: t.id, ok: false, subtemas: t.subtemas }]);
      setIntento(2);
    } else {
      setEntro(t.correcta);
    }
  };

  const seguir = () => {
    if (n + 1 >= pagos.length) {
      const bien = detalle.filter((d) => d.ok).length;
      onTerminar?.({ pct: Math.round((bien / pagos.length) * 100), detalle, duracionMs: tiempo() });
      return;
    }
    setN(n + 1);
    setIntento(1);
    setEntro(null);
    setRetro(null);
  };

  const { contenedor, pieza, destino } = useArrastre({ alSoltar: soltar, activo: !entro });
  const props = pieza(t.id);

  return (
    <MarcoHacer id={ID} escena={ESCENAS[ID]} mini={{ texto: ESCENAS[ID].porRonda.todas }} consigna={CONSIGNAS[ID]} progreso={`${n + 1} / ${pagos.length}`}>
      <style>{CSS_A2}{CSS}</style>
      <div data-figura ref={contenedor}>
        <div className="pf26-h1-hueco">
          {!entro && (
            <div className="da26-entra" key={t.id}>
              <button
                type="button" key={`${t.id}-${mal}`}
                className={`pf26-h1-moneda${retro ? " da26-tiembla" : ""}`}
                data-moneda={t.id}
                data-estado={rojo ? "mal" : undefined}
                aria-label={`${t.texto}. Arrástrala a un buzón, o tócala y toca el buzón.`}
                {...props}
              >
                <Objeto id="moneda" alto={44} />
                <span>{t.texto}</span>
              </button>
            </div>
          )}
          {entro && <p className="da26-entra" style={{ margin: 0, padding: "8px 4px", fontSize: 15, fontWeight: 600 }} data-pago-echado>{t.texto} → {TRIBUTOS[entro].nombre}</p>}
        </div>
        <div className="pf26-a2-buzones" role="group" aria-label="Los tres buzones">
          {ORDEN_TRIBUTOS.map((b) => (
            <button key={b} type="button" className="pf26-a2-buzon" data-buzon={b} style={{ "--tono": tonoTributo(b) }}
              aria-label={`Echar en ${TRIBUTOS[b].nombre}`} disabled={Boolean(entro)} {...destino(b, t.id)}>
              <BuzonIlustrado tributo={b} alto={62} abierto={entro === b} />
              <span>{TRIBUTOS[b].nombre}</span>
            </button>
          ))}
        </div>
        {entro && (
          <div className="pf26-a2-escena" data-escena={entro}>
            <div key={`${t.id}-e`} className="da26-entra"><Escena tipo={entro} /></div>
          </div>
        )}
      </div>
      <Retro estado="mal" key={`r${mal}`}>{retro}</Retro>
      <div className="da26-nav">
        <span />
        <Boton primario onClick={seguir} disabled={!entro} data-siguiente>{n + 1 >= pagos.length ? "Terminar" : "Siguiente pago"}</Boton>
      </div>
    </MarcoHacer>
  );
}
