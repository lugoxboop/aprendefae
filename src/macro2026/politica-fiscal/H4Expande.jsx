/*
 * H4 · ¿Expande o contrae? (pf26-h4-expande, Hacer, Medio, 25 FP × %).
 * Especificación de Gen, t3 §2 H4. La balanza de A5 con el globo DA.
 * Paso 1: la medida se arrastra (o tocar-tocar) al plato «Expansiva» o
 * «Contraccionista». Paso 2: se toca por dónde entra: «Gasto autónomo (G o
 * TR)» o «Multiplicador (t)». «Revelar»: la balanza se inclina de verdad y el
 * globo sube o baja con el modelo de T1; si entra por t, la lupa cambia de
 * tamaño. Se califican los dos pasos, cada uno con su retro.
 * Partida: 8 de 10. Puntaje = criterios correctos / 16.
 */
import { useMemo, useState } from "react";
import { BORDE, CORAL, FONDO, INK, INK_2, SUPERFICIE_2 } from "../comun/colores-da.js";
import { BASE, modelo, multiplicador, produccion } from "../comun/modelo-da.js";
import { Boton, MarcoHacer, Retro, useCronometro } from "../comun/ui.jsx";
import { azarDeLaPagina, sortear } from "../comun/azar.js";
import { useArrastre } from "../comun/arrastre.js";
import { colorRama } from "../comun/ramas.js";
import { Balanza, CSS_A5, Lupa } from "./A5Balanza.jsx";
import { A5, BANCO_H4, CONSIGNAS, ENTRADAS_H4, H4, PARTIDA_H4, ESCENAS } from "./textos.js";

export const ID = "pf26-h4-expande";
export const prepararH4 = (rng = Math.random) => sortear(BANCO_H4, PARTIDA_H4, rng);
const FISCAL = colorRama("fiscal");

/** Lo que la medida hace de verdad en el modelo de T1 (el mismo paso que las fichas de A5). */
export function modeloDe(m) {
  const s = m.plato === "expansiva" ? 1 : -1;
  if (m.termino === "G") return modelo({ G: BASE.G + 50 * s });
  if (m.termino === "TR") return modelo({ TR: BASE.TR + 50 * s });
  return modelo({ t: Math.round((BASE.t - 0.05 * s) * 100) / 100 });
}

const CSS = `
.pf26-h4-medida { display: block; width: 100%; min-height: 56px; padding: 8px 14px; border-radius: 14px; border: 2px solid ${FISCAL}; background: ${SUPERFICIE_2}; color: ${INK}; font: 600 15px/1.3 var(--planck-font-sans, system-ui, sans-serif); text-align: center; cursor: grab; touch-action: none; -webkit-user-select: none; user-select: none; }
.pf26-h4-medida[aria-pressed="true"] { box-shadow: 0 0 0 3px ${INK}; }
.pf26-h4-puesta { margin: 0; text-align: center; font: 600 14px/1.3 var(--planck-font-sans, system-ui, sans-serif); }
.pf26-h4-entradas { display: grid; grid-template-columns: minmax(0, 1fr) minmax(0, 1fr); gap: 6px; margin-top: 6px; }
.pf26-h4-entrada { min-height: 48px; padding: 6px 8px; border-radius: 12px; border: 2px solid ${BORDE}; background: ${FONDO}; color: ${INK}; font: 600 14px/1.2 var(--planck-font-sans, system-ui, sans-serif); cursor: pointer; touch-action: manipulation; }
.pf26-h4-entrada[aria-pressed="true"] { border-color: ${INK}; background: ${SUPERFICIE_2}; }
.pf26-h4-entrada[data-estado="mal"] { border-color: ${CORAL}; }
.pf26-h4-entrada[data-estado="bien"] { border-color: ${INK}; }
.pf26-h4-pregunta { margin: 10px 0 0; font: 600 14px/1.3 var(--planck-font-sans, system-ui, sans-serif); color: ${INK_2}; }
`;

export default function H4Expande({ onTerminar, rng = null }) {
  const medidas = useMemo(() => prepararH4(rng ?? azarDeLaPagina()), [rng]);
  const tiempo = useCronometro();
  const [n, setN] = useState(0);
  const [plato, setPlato] = useState(null);
  const [entrada, setEntrada] = useState(null);
  const [revelado, setRevelado] = useState(false);
  const [detalle, setDetalle] = useState([]);
  const m = medidas[n];

  const { contenedor, pieza, destino } = useArrastre({ alSoltar: (_, d) => { if (!revelado) setPlato(d); }, activo: !revelado });

  const okPlato = plato === m.plato;
  const okEntrada = entrada === m.entrada;
  const revelar = () => {
    setRevelado(true);
    setDetalle((d) => [
      ...d,
      { item: `${m.id}-plato`, ok: okPlato, subtemas: m.subtemas },
      { item: `${m.id}-entrada`, ok: okEntrada, subtemas: m.subtemas },
    ]);
  };
  const seguir = () => {
    if (n + 1 >= medidas.length) {
      const bien = detalle.filter((d) => d.ok).length;
      onTerminar?.({ pct: Math.round((bien / detalle.length) * 100), detalle, duracionMs: tiempo() });
      return;
    }
    setN(n + 1);
    setPlato(null);
    setEntrada(null);
    setRevelado(false);
  };

  const p = revelado ? modeloDe(m) : modelo();
  const Y = produccion(p);
  const exp = revelado && m.plato === "expansiva" ? 1 : 0;
  const con = revelado && m.plato === "contraccionista" ? 1 : 0;

  return (
    <MarcoHacer id={ID} escena={ESCENAS[ID]} mini={{ texto: ESCENAS[ID].porRonda.todas }} consigna={CONSIGNAS[ID]} progreso={`${n + 1} / ${medidas.length}`}>
      <style>{CSS_A5}{CSS}</style>
      <div data-figura ref={contenedor} data-revelado={revelado ? "1" : "0"}>
        <Balanza exp={exp} con={con} Y={Y} destino={(d) => destino(d, m.id)} activos={revelado ? [] : ["expansiva", "contraccionista"]} />
        {!plato && (
          <div className="da26-entra" key={m.id}>
            <button type="button" className="pf26-h4-medida" data-medida={m.id} aria-label={`${m.texto}. Arrástrala a un plato, o tócala y toca el plato.`} {...pieza(m.id)}>{m.texto}</button>
          </div>
        )}
        {plato && (
          <p className="pf26-h4-puesta da26-entra" data-plato-elegido={plato}>
            {m.texto} → {plato === "expansiva" ? A5.expansiva : A5.contraccionista}
          </p>
        )}
        {plato && !revelado && (
          <button type="button" className="da26-boton" style={{ display: "block", margin: "6px auto 0" }} onClick={() => setPlato(null)} data-cambiar-plato aria-label="Cambiar de plato">↺</button>
        )}
        <p className="pf26-h4-pregunta">{H4.entrada}</p>
        <div className="pf26-h4-entradas" role="group" aria-label={H4.entrada}>
          {ENTRADAS_H4.map((e) => (
            <button key={e.id} type="button" className="pf26-h4-entrada da26-marcable" data-entrada={e.id} aria-pressed={entrada === e.id}
              data-estado={revelado && entrada === e.id ? (okEntrada ? "bien" : "mal") : undefined}
              disabled={revelado} onClick={() => setEntrada(e.id)}>{e.nombre}</button>
          ))}
        </div>
        {revelado && m.termino === "t" && <Lupa m={multiplicador(p)} />}
      </div>
      {revelado && !okPlato && <Retro estado="mal" data-retro-plato>{m.retroPlato}</Retro>}
      {revelado && !okEntrada && <Retro estado="mal" data-retro-entrada>{m.retroEntrada}</Retro>}
      {revelado && okPlato && okEntrada && <Retro estado="bien">{m.plato === "expansiva" ? A5.expansiva : A5.contraccionista} · {ENTRADAS_H4.find((e) => e.id === m.entrada).nombre}</Retro>}
      <div className="da26-nav">
        <span />
        {revelado
          ? <Boton primario onClick={seguir} data-siguiente>{n + 1 >= medidas.length ? H4.terminar : H4.siguiente}</Boton>
          : <Boton primario onClick={revelar} disabled={!plato || !entrada} data-revelar>{H4.revelar}</Boton>}
      </div>
    </MarcoHacer>
  );
}
