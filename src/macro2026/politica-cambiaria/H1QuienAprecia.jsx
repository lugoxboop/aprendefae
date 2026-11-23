/*
 * H1 · ¿Quién se apreció? (pc26-h1-quien-aprecia, Hacer, Fácil, 10 FP × %).
 * Especificación de Gen, t5 §2 H1. La balanza de A1 pasa del tc inicial al
 * final; debajo, dos interruptores: el peso y el dólar, «se aprecia / se
 * deprecia». «Revisar»: el bien puesto queda con ✓; el errado, coral y su
 * retro con las cifras del ítem.
 * Partida: 5 de 6. Puntaje = interruptores correctos / 10.
 */
import { useEffect, useMemo, useState } from "react";
import { DOLAR, PESO } from "../comun/monedas.js";
import { Boton, MarcoHacer, Retro, movimientoReducido, useCronometro } from "../comun/ui.jsx";
import { azarDeLaPagina, sortear } from "../comun/azar.js";
import { Balanza, CSS_PC, fmtTc } from "./comun-pc.jsx";
import { BANCO_H1, CONSIGNAS, H1, PARTIDA_H1, retroH1 } from "./textos.js";

export const ID = "pc26-h1-quien-aprecia";
export const prepararH1 = (rng = Math.random) => sortear(BANCO_H1, PARTIDA_H1, rng);
const MONEDAS_H1 = [{ id: "peso", nombre: H1.peso, tono: PESO, simbolo: "$" }, { id: "dolar", nombre: H1.dolar, tono: DOLAR, simbolo: "USD" }];

export default function H1QuienAprecia({ onTerminar, rng = null }) {
  const items = useMemo(() => prepararH1(rng ?? azarDeLaPagina()), [rng]);
  const tiempo = useCronometro();
  const [n, setN] = useState(0);
  const [tc, setTc] = useState(items[0].a);
  const [puestas, setPuestas] = useState({});
  const [revisado, setRevisado] = useState(false);
  const [detalle, setDetalle] = useState([]);
  const q = items[n];

  /* La balanza va del tc inicial al final al entrar el ítem. */
  useEffect(() => {
    setTc(q.a);
    if (movimientoReducido()) { setTc(q.b); return undefined; }
    const t = setTimeout(() => setTc(q.b), 450);
    return () => clearTimeout(t);
  }, [q]);

  const revisar = () => {
    setRevisado(true);
    setDetalle((d) => [...d, ...MONEDAS_H1.map((m) => ({ item: `${q.id}-${m.id}`, ok: puestas[m.id] === q.correctas[m.id], subtemas: q.subtemas }))]);
  };
  const seguir = () => {
    if (n + 1 >= items.length) {
      const bien = detalle.filter((d) => d.ok).length;
      onTerminar?.({ pct: Math.round((bien / detalle.length) * 100), detalle, duracionMs: tiempo() });
      return;
    }
    setN(n + 1);
    setPuestas({});
    setRevisado(false);
  };

  const errados = revisado ? MONEDAS_H1.filter((m) => puestas[m.id] !== q.correctas[m.id]) : [];
  return (
    <MarcoHacer id={ID} consigna={CONSIGNAS[ID]} progreso={`${n + 1} / ${items.length}`}>
      <style>{CSS_PC}</style>
      <p className="pc26-contador da26-entra" key={q.id} style={{ margin: "0 0 6px" }} data-item={q.id}>
        <span>USD 1</span><b>${fmtTc(q.a)} → ${fmtTc(q.b)}</b>
      </p>
      <div data-figura>
        <Balanza tc={tc} />
      </div>
      <div style={{ display: "grid", gap: 8, marginTop: 8 }}>
        {MONEDAS_H1.map((m) => {
          const ok = revisado ? puestas[m.id] === q.correctas[m.id] : null;
          return (
            <div key={m.id} role="radiogroup" aria-label={m.nombre} data-moneda={m.id} style={{ display: "grid", gridTemplateColumns: "78px minmax(0,1fr) minmax(0,1fr)", gap: 6, alignItems: "center" }}>
              <span style={{ fontWeight: 800, color: m.tono }}>{m.simbolo} {m.nombre}{ok ? " ✓" : ""}</span>
              {["aprecia", "deprecia"].map((x) => (
                <button key={x} type="button" role="radio" aria-checked={puestas[m.id] === x} className="pc26-opcion" data-opcion={x}
                  data-estado={revisado && puestas[m.id] === x ? (ok ? "bien" : "mal") : undefined} disabled={revisado}
                  onClick={() => setPuestas((p) => ({ ...p, [m.id]: x }))}>{H1[x]}</button>
              ))}
            </div>
          );
        })}
      </div>
      {errados.map((m) => <Retro key={m.id} estado="mal" data-retro-moneda={m.id}>{retroH1(q, m.id, fmtTc)}</Retro>)}
      {revisado && errados.length === 0 && <Retro estado="bien">{H1.peso} {H1[q.correctas.peso]} · {H1.dolar} {H1[q.correctas.dolar]}</Retro>}
      <div className="da26-nav">
        <span />
        {revisado
          ? <Boton primario onClick={seguir} data-siguiente>{n + 1 >= items.length ? H1.terminar : H1.siguiente}</Boton>
          : <Boton primario onClick={revisar} disabled={!puestas.peso || !puestas.dolar} data-revisar>{H1.revisar}</Boton>}
      </div>
    </MarcoHacer>
  );
}
