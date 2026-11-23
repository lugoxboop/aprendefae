/*
 * H1 · ¿Entra o sale dinero? (pm26-h1-entra-sale, Hacer, Medio, 25 FP × %).
 * Especificación de Gen, t4 §2 H1. La ventanilla de A2 y tres medidores:
 * «Activos del BanRep», «Base monetaria» y «Dinero en la economía (M2)».
 * Cada medidor tiene un botón que alterna ↑ / ↓ / =. «Revelar» se habilita
 * con las tres puestas: la ventanilla hace la operación (el activo entra o
 * vuelve, el fajo sale o regresa; en encaje y depósitos, la cascada de A3 en
 * miniatura se acorta) y los medidores se mueven. Cada flecha errada da su
 * retro. Partida: 6 de 9. Puntaje = flechas correctas / 18.
 */
import { useMemo, useState } from "react";
import { BORDE, FONDO, INK, INK_2, SUPERFICIE_2 } from "../comun/colores-da.js";
import { Boton, MarcoHacer, Retro, useCronometro } from "../comun/ui.jsx";
import { azarDeLaPagina, sortear } from "../comun/azar.js";
import { Cascada, CSS_PM, MONETARIA } from "./comun-pm.jsx";
import { CSS_VENTANILLA, Ventanilla } from "./A2Ventanilla.jsx";
import { BANCO_H1, CONSIGNAS, FLECHAS, H1, MEDIDORES_H1, NOMBRE_FLECHA, ORDEN_FLECHAS, PARTIDA_H1 } from "./textos.js";

export const ID = "pm26-h1-entra-sale";
export const prepararH1 = (rng = Math.random) => sortear(BANCO_H1, PARTIDA_H1, rng);
const siguienteFlecha = (f) => ORDEN_FLECHAS[(ORDEN_FLECHAS.indexOf(f) + 1) % ORDEN_FLECHAS.length];
const ACTIVO_DE = { "compra-dolares": "dolar", "vende-dolares": "dolar", "vende-oro": "oro", "compra-tes": "tes", "vende-tes": "tes", presta: "pagare", "paga-credito": "pagare" };

const CSS = `
.pm26-h1-op { margin: 0 0 8px; padding: 10px 12px; border-radius: 12px; border: 2px solid ${INK}; background: ${SUPERFICIE_2}; font: 600 16px/1.35 var(--planck-font-sans, system-ui, sans-serif); }
.pm26-h1-medidores { display: grid; grid-template-columns: repeat(3, minmax(0, 1fr)); gap: 6px; margin-top: 10px; }
.pm26-h1-medidor { display: grid; justify-items: center; gap: 4px; padding: 6px 4px; border-radius: 12px; border: 2px solid ${BORDE}; background: ${FONDO}; text-align: center; font: 600 12px/1.2 var(--planck-font-sans, system-ui, sans-serif); }
.pm26-h1-medidor[data-estado="mal"] { border-color: #E76F51; }
.pm26-h1-medidor[data-estado="bien"] { border-color: ${INK}; }
.pm26-h1-barra { position: relative; width: 22px; height: 54px; border-radius: 6px; border: 1.5px solid ${INK_2}; overflow: hidden; }
.pm26-h1-barra > i { position: absolute; left: 0; right: 0; bottom: 0; height: 100%; background: ${MONETARIA}; transform-origin: bottom; transition: transform 520ms cubic-bezier(.3,.9,.4,1) 300ms; }
.pm26-h1-flecha { min-width: 56px; min-height: 48px; border-radius: 12px; border: 2px solid ${INK}; background: ${SUPERFICIE_2}; color: ${INK}; font: 700 22px/1 var(--planck-font-sans, system-ui, sans-serif); cursor: pointer; touch-action: manipulation; }
.pm26-h1-flecha[data-vacia="1"] { border-style: dashed; color: ${INK_2}; }
@media (prefers-reduced-motion: reduce) { .pm26-h1-barra > i { transition: none; } }
`;
const NIVEL = { sube: 0.85, igual: 0.55, baja: 0.3 };

export default function H1EntraSale({ onTerminar, rng = null }) {
  const ops = useMemo(() => prepararH1(rng ?? azarDeLaPagina()), [rng]);
  const tiempo = useCronometro();
  const [n, setN] = useState(0);
  const [puestas, setPuestas] = useState({});
  const [revelado, setRevelado] = useState(false);
  const [detalle, setDetalle] = useState([]);
  const op = ops[n];
  const completas = MEDIDORES_H1.every((m) => puestas[m.id]);

  const revelar = () => {
    setRevelado(true);
    setDetalle((d) => [...d, ...MEDIDORES_H1.map((m) => ({ item: `${op.id}-${m.id}`, ok: puestas[m.id] === op.correctas[m.id], subtemas: op.subtemas }))]);
  };
  const seguir = () => {
    if (n + 1 >= ops.length) {
      const bien = detalle.filter((d) => d.ok).length;
      onTerminar?.({ pct: Math.round((bien / detalle.length) * 100), detalle, duracionMs: tiempo() });
      return;
    }
    setN(n + 1);
    setPuestas({});
    setRevelado(false);
  };

  const mov = revelado && op.tipo !== "cascada" ? { activo: ACTIVO_DE[op.id], sentido: op.tipo === "compra" ? "entra" : "vuelve", n: n + 1 } : null;
  const errados = revelado ? MEDIDORES_H1.filter((m) => puestas[m.id] !== op.correctas[m.id]) : [];

  return (
    <MarcoHacer id={ID} consigna={CONSIGNAS[ID]} progreso={`${n + 1} / ${ops.length}`}>
      <style>{CSS_PM}{CSS_VENTANILLA}{CSS}</style>
      <p className="pm26-h1-op da26-entra" key={op.id} data-operacion={op.id}>{op.texto}</p>
      <div data-figura data-revelado={revelado ? "1" : "0"}>
        {op.tipo === "cascada"
          ? <div data-mini-cascada><Cascada encaje={revelado ? 30 : 10} visibles={7} mini etiqueta={revelado ? "La cascada se acorta" : "La cascada"} /></div>
          : <Ventanilla mov={mov} />}
        <div className="pm26-h1-medidores">
          {MEDIDORES_H1.map((m) => {
            const f = puestas[m.id];
            const ok = revelado ? f === op.correctas[m.id] : null;
            return (
              <div key={m.id} className="pm26-h1-medidor" data-medidor={m.id} data-estado={revelado ? (ok ? "bien" : "mal") : undefined}>
                <span style={{ minHeight: 30, display: "grid", placeItems: "center" }}>{m.nombre}</span>
                <span className="pm26-h1-barra" aria-hidden="true"><i style={{ transform: `scaleY(${revelado ? NIVEL[op.correctas[m.id]] : NIVEL.igual})` }} /></span>
                <button type="button" className="pm26-h1-flecha" data-flecha={m.id} data-vacia={f ? "0" : "1"} disabled={revelado}
                  aria-label={`${m.nombre}: ${f ? NOMBRE_FLECHA[f] : "sin poner"}. Toca para cambiar.`}
                  onClick={() => setPuestas((p) => ({ ...p, [m.id]: p[m.id] ? siguienteFlecha(p[m.id]) : ORDEN_FLECHAS[0] }))}>
                  {f ? FLECHAS[f] : "?"}
                </button>
                {revelado && <span data-correcta={op.correctas[m.id]}>{ok ? "✓" : FLECHAS[op.correctas[m.id]]}</span>}
              </div>
            );
          })}
        </div>
      </div>
      {errados.map((m) => <Retro key={m.id} estado="mal" data-retro-medidor={m.id}>{op.retro[m.id]}</Retro>)}
      {revelado && errados.length === 0 && <Retro estado="bien">{MEDIDORES_H1.map((m) => `${m.nombre} ${FLECHAS[op.correctas[m.id]]}`).join(" · ")}</Retro>}
      <div className="da26-nav">
        <span />
        {revelado
          ? <Boton primario onClick={seguir} data-siguiente>{n + 1 >= ops.length ? H1.terminar : H1.siguiente}</Boton>
          : <Boton primario onClick={revelar} disabled={!completas} data-revelar>{H1.revelar}</Boton>}
      </div>
    </MarcoHacer>
  );
}
