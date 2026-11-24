/*
 * H3 · La aguja del real (pc26-h3-aguja, Hacer, Difícil, 50 FP × %).
 * Especificación de Gen, t5 §2 H3. El dial de A3 (−6 % a +6 %, paso 0,5)
 * con las tres cifras de la ronda en fichas. Paso 1: arrastrar la aguja
 * (o ← →); empieza sin aguja para no regalar el 0. Paso 2: «El exportador
 * colombiano: gana / pierde / igual», junto a la exportadora (mascota).
 * «Revisar»: la aguja correcta como fantasma y el ITCR de la ronda; la
 * retro de la aguja diagnostica el error (signo, nominal u otro).
 * Partida: 4 de 6. Puntaje = criterios correctos / 8. Tolerancia ± 0,5.
 */
import { useMemo, useState } from "react";
import { fmtDecimal } from "../comun/modelo-da.js";
import { Boton, MarcoHacer, Retro, useCronometro } from "../comun/ui.jsx";
import { azarDeLaPagina, sortear } from "../comun/azar.js";
import { CSS_PC, Dial, fmtVar } from "./comun-pc.jsx";
import { BANCO_H3, CONSIGNAS, H3, PARTIDA_H3, juzgarAguja, ESCENAS } from "./textos.js";

export const ID = "pc26-h3-aguja";
/** El mini contexto de la ronda (rediseño lote 3): las tres cifras y la nota. */
export const cifrasH3 = (r) => `${H3.afuera} ${fmtDecimal(r.afuera, 1)} % · ${H3.aqui} ${fmtDecimal(r.aqui, 1)} % · ${H3.nominal} ${fmtVar(r.nominal)}${r.nota ? ` · ${r.nota}` : ""}`;
export const prepararH3 = (rng = Math.random) => sortear(BANCO_H3, PARTIDA_H3, rng);
const RETRO_AGUJA = (r, j) => (j === "signo" ? H3.retroSigno : j === "nominal" ? H3.retroNominal : H3.retroOtro(fmtVar(r.delta)));

export default function H3Aguja({ onTerminar, rng = null }) {
  const rondas = useMemo(() => prepararH3(rng ?? azarDeLaPagina()), [rng]);
  const tiempo = useCronometro();
  const [n, setN] = useState(0);
  const [aguja, setAguja] = useState(null);
  const [exp, setExp] = useState(null);
  const [res, setRes] = useState(null);
  const [detalle, setDetalle] = useState([]);
  const r = rondas[n];

  const revisar = () => {
    const j = juzgarAguja(r, aguja);
    const okExp = exp === r.exportador;
    setRes({ j, okExp });
    setDetalle((d) => [...d,
      { item: `${r.id}-aguja`, ok: j === "bien", subtemas: r.subtemas },
      { item: `${r.id}-exportador`, ok: okExp, subtemas: r.subtemas }]);
  };
  const seguir = () => {
    if (n + 1 >= rondas.length) {
      const bien = detalle.filter((d) => d.ok).length;
      onTerminar?.({ pct: Math.round((bien / detalle.length) * 100), detalle, duracionMs: tiempo() });
      return;
    }
    setN(n + 1);
    setAguja(null);
    setExp(null);
    setRes(null);
  };

  return (
    <MarcoHacer id={ID} escena={ESCENAS[ID]} mini={{ texto: cifrasH3(r), datos: { "data-ronda": r.id } }} consigna={CONSIGNAS[ID]} progreso={`${n + 1} / ${rondas.length}`}>
      <style>{CSS_PC}</style>
      {/* Rediseño lote 3: las tres cifras de la ronda van en la franja de escena. */}
      <div data-figura data-juicio={res?.j ?? ""}>
        <Dial valor={aguja} onCambio={res ? null : setAguja} fantasma={res && res.j !== "bien" ? r.delta : null}
          itcrTexto={res ? `ITCR ${fmtDecimal(r.itcr, 3)}` : null} nombre={H3.arrastra} />
        {aguja == null && !res && <p className="da26-rotulo" style={{ textAlign: "center", margin: "2px 0 0", fontSize: 14 }}>{H3.arrastra}</p>}
      </div>
      <div style={{ marginTop: 8 }}>
        <div role="radiogroup" aria-label={H3.exportador} style={{ display: "grid", gap: 6 }}>
          <span style={{ fontWeight: 700, fontSize: 15 }}>{H3.exportador}</span>
          {Object.entries(H3.opciones).map(([id, t]) => (
            <button key={id} type="button" role="radio" aria-checked={exp === id} className="pc26-opcion" data-exportador={id} disabled={Boolean(res)}
              data-estado={res && exp === id ? (res.okExp ? "bien" : "mal") : undefined} onClick={() => setExp(id)}>{t}</button>
          ))}
        </div>
      </div>
      {res && res.j !== "bien" && <Retro estado="mal" data-retro-aguja={res.j}>{RETRO_AGUJA(r, res.j)}</Retro>}
      {res && !res.okExp && <Retro estado="mal" data-retro-exportador>{H3.retroExportador[r.exportador]}</Retro>}
      {res && res.j === "bien" && res.okExp && <Retro estado="bien">Δtcr {fmtVar(r.delta)} · {H3.retroExportador[r.exportador]}</Retro>}
      <div className="da26-nav">
        <span />
        {res
          ? <Boton primario onClick={seguir} data-siguiente>{n + 1 >= rondas.length ? H3.terminar : H3.siguiente}</Boton>
          : <Boton primario onClick={revisar} disabled={aguja == null || !exp} data-revisar>{H3.revisar}</Boton>}
      </div>
    </MarcoHacer>
  );
}
