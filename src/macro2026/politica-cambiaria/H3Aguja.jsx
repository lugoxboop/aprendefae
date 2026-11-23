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
import { DOLAR, PESO } from "../comun/monedas.js";
import { fmtDecimal } from "../comun/modelo-da.js";
import { Boton, MarcoHacer, Retro, useCronometro } from "../comun/ui.jsx";
import { azarDeLaPagina, sortear } from "../comun/azar.js";
import { MascotaRol } from "../comun/mascotas.jsx";
import { CAMBIARIA, CSS_PC, Dial, fmtVar } from "./comun-pc.jsx";
import { BANCO_H3, CONSIGNAS, H3, PARTIDA_H3, juzgarAguja } from "./textos.js";

export const ID = "pc26-h3-aguja";
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

  const fichas = [[H3.afuera, r.afuera, DOLAR], [H3.aqui, r.aqui, PESO], [H3.nominal, r.nominal, CAMBIARIA]];
  return (
    <MarcoHacer id={ID} consigna={CONSIGNAS[ID]} progreso={`${n + 1} / ${rondas.length}`}>
      <style>{CSS_PC}</style>
      <div className="da26-entra" key={r.id} style={{ display: "grid", gridTemplateColumns: "repeat(3, minmax(0,1fr))", gap: 6, marginBottom: 6 }} data-ronda={r.id}>
        {fichas.map(([t, x, tono]) => (
          <div key={t} className="pc26-chip" style={{ display: "grid", justifyItems: "center", borderRadius: 10, borderColor: tono, borderWidth: 2, borderStyle: "solid" }} data-ficha-ronda={t}>
            <span>{t}</span><b className="da26-mono">{t === H3.nominal ? fmtVar(x) : `${fmtDecimal(x, 1)} %`}</b>
          </div>
        ))}
      </div>
      <div data-figura data-juicio={res?.j ?? ""}>
        <Dial valor={aguja} onCambio={res ? null : setAguja} fantasma={res && res.j !== "bien" ? r.delta : null}
          itcrTexto={res ? `ITCR ${fmtDecimal(r.itcr, 3)}` : null} nombre={H3.arrastra} />
        {aguja == null && !res && <p className="da26-rotulo" style={{ textAlign: "center", margin: "2px 0 0", fontSize: 14 }}>{H3.arrastra}</p>}
      </div>
      <div style={{ display: "grid", gridTemplateColumns: "auto minmax(0,1fr)", gap: 8, alignItems: "center", marginTop: 8 }}>
        <MascotaRol id="exportadora-flores" pose="flores" alto={120} rotulo={false} />
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
