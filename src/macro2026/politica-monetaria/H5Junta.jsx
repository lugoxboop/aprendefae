/*
 * H5 · La Junta decide (pm26-h5-junta, Hacer, Difícil, 50 FP × %).
 * Especificación de Gen, t4 §2 H5. El tablero de A6 y, encima, el termostato
 * de A7 con la lectura de la ronda; al lado, la autoridad económica (panda,
 * pose «carpeta», 120 px). La tarjeta inicial avisa: «Casos de práctica, no
 * decisiones reales de la Junta.» «Decidir»: cada palanca correcta queda con
 * ✓; cada errada se pinta coral y da su retro. Si las tres están bien, el
 * termómetro va hacia la banda con rezago (1,2 s).
 * Partida: 3 rondas, orden aleatorio. Puntaje = palancas correctas / 9.
 */
import { useEffect, useMemo, useState } from "react";
import { Boton, MarcoHacer, Retro, useCronometro } from "../comun/ui.jsx";
import { azarDeLaPagina, barajar } from "../comun/azar.js";
import { CSS_PM, Tablero, Termostato } from "./comun-pm.jsx";
import { CONSIGNAS, H5, PALANCAS, RONDAS_H5, ESCENAS } from "./textos.js";

export const ID = "pm26-h5-junta";
export const prepararH5 = (rng = Math.random) => barajar(RONDAS_H5, rng);
export const REZAGO_H5_MS = 1200;
const VACIO = {};

export default function H5Junta({ onTerminar, rng = null }) {
  const rondas = useMemo(() => prepararH5(rng ?? azarDeLaPagina()), [rng]);
  const tiempo = useCronometro();
  const [n, setN] = useState(0);
  const [pos, setPos] = useState(VACIO);
  const [decidido, setDecidido] = useState(false);
  const [enfria, setEnfria] = useState(false);
  const [detalle, setDetalle] = useState([]);
  const r = rondas[n];
  const completas = PALANCAS.every((p) => pos[p.id]);
  const todasBien = decidido && PALANCAS.every((p) => pos[p.id] === r.correctas[p.id]);
  useEffect(() => {
    if (!todasBien) return undefined;
    const t = setTimeout(() => setEnfria(true), REZAGO_H5_MS);
    return () => clearTimeout(t);
  }, [todasBien]);

  const decidir = () => {
    setDecidido(true);
    setDetalle((d) => [...d, ...PALANCAS.map((p) => ({ item: `${r.id}-${p.id}`, ok: pos[p.id] === r.correctas[p.id], subtemas: r.subtemas }))]);
  };
  const seguir = () => {
    if (n + 1 >= rondas.length) {
      const bien = detalle.filter((d) => d.ok).length;
      onTerminar?.({ pct: Math.round((bien / detalle.length) * 100), detalle, duracionMs: tiempo() });
      return;
    }
    setN(n + 1);
    setPos(VACIO);
    setDecidido(false);
    setEnfria(false);
  };

  const estado = decidido ? Object.fromEntries(PALANCAS.map((p) => [p.id, pos[p.id] === r.correctas[p.id] ? "bien" : "mal"])) : {};
  const errados = decidido ? PALANCAS.filter((p) => pos[p.id] !== r.correctas[p.id]) : [];
  const meta = r.inflacion > 4 ? 3.5 : r.inflacion < 2 ? 2.5 : r.inflacion;
  return (
    <MarcoHacer id={ID} escena={ESCENAS[ID]} mini={{ texto: r.lectura, datos: { "data-lectura": r.id } }} consigna={CONSIGNAS[ID]} progreso={`${n + 1} / ${rondas.length}`}>
      <style>{CSS_PM}</style>
      <div data-figura data-ronda={r.id}>
        {/* Rediseño lote 3: la lectura de la ronda va en la franja; el aviso es el contexto de la tarjeta de inicio. */}
        <Termostato inflacion={enfria ? meta : r.inflacion} aire={decidido && todasBien} alto={130} />
        <div style={{ marginTop: 8 }}>
          <Tablero pos={pos} onCambio={setPos} bloqueado={decidido} estado={estado} />
        </div>
      </div>
      {errados.map((p) => <Retro key={p.id} estado="mal" data-retro-palanca={p.id}>{r.retro[p.id]}</Retro>)}
      {todasBien && <Retro estado="bien">{PALANCAS.map((p) => p.posiciones[r.correctas[p.id]]).join(" · ")}</Retro>}
      <div className="da26-nav">
        <span />
        {decidido
          ? <Boton primario onClick={seguir} data-siguiente>{n + 1 >= rondas.length ? H5.terminar : H5.siguiente}</Boton>
          : <Boton primario onClick={decidir} disabled={!completas} data-decidir>{H5.decidir}</Boton>}
      </div>
    </MarcoHacer>
  );
}
