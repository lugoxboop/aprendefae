/*
 * H2 · Empuja la curva (pc26-h2-empuja-curva, Hacer, Medio, 25 FP × %).
 * Especificación de Gen, t5 §2 H2. La gráfica de A2 con un asa en cada
 * curva (arrastre horizontal y ← → del teclado). Cuenta la curva que más se
 * movió. «Revelar»: la correcta se corre, entra quien causa el cambio (su
 * mascota u objeto, con su rol escrito) y una flecha dice si el tc sube o
 * baja. Se califican la curva y la dirección, cada una con su retro.
 * Partida: 6 de 8. Puntaje = criterios correctos / 12.
 */
import { useMemo, useState } from "react";
import { Boton, MarcoHacer, Retro, useCronometro } from "../comun/ui.jsx";
import { azarDeLaPagina, sortear } from "../comun/azar.js";
import { MascotaRol } from "../comun/mascotas.jsx";
import { Objeto } from "../comun/kit.jsx";
import { CSS_PC, GraficaDivisas, leerCurva } from "./comun-pc.jsx";
import { BANCO_H2, CONSIGNAS, H2, MODELO_DIVISAS, PARTIDA_H2 } from "./textos.js";

export const ID = "pc26-h2-empuja-curva";
export const prepararH2 = (rng = Math.random) => sortear(BANCO_H2, PARTIDA_H2, rng);
/** Dónde quedan las curvas al revelar el suceso. */
export function reveladoH2(s) {
  const d = (s.direccion === "derecha" ? 1 : -1) * MODELO_DIVISAS.corre;
  return s.curva === "oferta" ? { so: d, sd: 0 } : { so: 0, sd: d };
}

export function Causa({ causa }) {
  if (causa.mascota) {
    return causa.nombre
      ? <div style={{ display: "grid", justifyItems: "center", gap: 2 }}><MascotaRol id={causa.mascota} pose={causa.pose} alto={120} rotulo={false} /><span style={{ fontSize: 13, fontWeight: 600 }}>{causa.nombre}</span></div>
      : <MascotaRol id={causa.mascota} pose={causa.pose} alto={120} />;
  }
  return <div style={{ display: "grid", justifyItems: "center", gap: 2 }}><Objeto id={causa.objeto} alto={80} /><span style={{ fontSize: 13, fontWeight: 600 }}>{causa.nombre}</span></div>;
}

export default function H2EmpujaCurva({ onTerminar, rng = null }) {
  const sucesos = useMemo(() => prepararH2(rng ?? azarDeLaPagina()), [rng]);
  const tiempo = useCronometro();
  const [n, setN] = useState(0);
  const [so, setSo] = useState(0);
  const [sd, setSd] = useState(0);
  const [res, setRes] = useState(null);
  const [detalle, setDetalle] = useState([]);
  const s = sucesos[n];
  const resp = leerCurva(so, sd);

  const revelar = () => {
    const okCurva = resp.curva === s.curva;
    const okDir = resp.direccion === s.direccion;
    setRes({ okCurva, okDir });
    setDetalle((d) => [...d,
      { item: `${s.id}-curva`, ok: okCurva, subtemas: s.subtemas },
      { item: `${s.id}-direccion`, ok: okDir, subtemas: s.subtemas }]);
    const r = reveladoH2(s);
    setSo(r.so);
    setSd(r.sd);
  };
  const seguir = () => {
    if (n + 1 >= sucesos.length) {
      const bien = detalle.filter((d) => d.ok).length;
      onTerminar?.({ pct: Math.round((bien / detalle.length) * 100), detalle, duracionMs: tiempo() });
      return;
    }
    setN(n + 1);
    setSo(0);
    setSd(0);
    setRes(null);
  };

  return (
    <MarcoHacer id={ID} consigna={CONSIGNAS[ID]} progreso={`${n + 1} / ${sucesos.length}`}>
      <style>{CSS_PC}</style>
      <p className="pc26-contador da26-entra" key={s.id} style={{ margin: "0 0 8px", fontSize: 16 }} data-suceso={s.id}>{s.texto}</p>
      <div data-figura data-respuesta={resp ? `${resp.curva}-${resp.direccion}` : ""}>
        <GraficaDivisas so={so} sd={sd} fantasma={res ? { so: 0, sd: 0 } : null} flecha={res ? s.tc : null}
          asas={res ? {} : { oferta: setSo, demanda: setSd }} />
        {res && <div className="da26-entra" style={{ display: "flex", justifyContent: "center", marginTop: 6 }} data-causa={s.id}><Causa causa={s.causa} /></div>}
      </div>
      {res && !res.okCurva && <Retro estado="mal" data-retro-curva>{s.retroCurva}</Retro>}
      {res && !res.okDir && <Retro estado="mal" data-retro-direccion>{s.retroDireccion}</Retro>}
      {res && res.okCurva && res.okDir && <Retro estado="bien">{s.curva === "oferta" ? H2.oferta : H2.demanda} · {s.tc === "sube" ? H2.tcSube : H2.tcBaja}</Retro>}
      {res && !(res.okCurva && res.okDir) && <Retro estado="info" data-tc-revelado>{s.curva === "oferta" ? H2.oferta : H2.demanda} → {s.tc === "sube" ? H2.tcSube : H2.tcBaja}</Retro>}
      <div className="da26-nav">
        <Boton onClick={() => { setSo(0); setSd(0); }} disabled={Boolean(res) || !resp} data-reiniciar aria-label="Volver las curvas a su sitio">↺</Boton>
        {res
          ? <Boton primario onClick={seguir} data-siguiente>{n + 1 >= sucesos.length ? H2.terminar : H2.siguiente}</Boton>
          : <Boton primario onClick={revelar} disabled={!resp} data-revelar>{H2.revelar}</Boton>}
      </div>
    </MarcoHacer>
  );
}
