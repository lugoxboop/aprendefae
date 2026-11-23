/*
 * H4 · ¿A quién le sirve? (pc26-h4-a-quien-sirve, Hacer, Medio, 25 FP × %).
 * Especificación de Gen, t5 §2 H4. Un tira y afloja: a la izquierda la
 * exportadora de flores, a la derecha la importadora de celulares (las dos
 * mascotas, a 120 px: el mínimo del elenco, no los 72 de §3), la cuerda con
 * el pañuelo al centro y la noticia arriba. Se arrastra el pañuelo hacia un
 * lado (o se toca a la mascota). Acierto: el pañuelo va a ese lado y la
 * mascota tira. Error: el pañuelo vuelve, borde coral, retro; se reintenta.
 * Partida: 6 de 8. Puntaje = aciertos al primer intento / 6.
 */
import { useMemo, useRef, useState } from "react";
import { FONDO, INK, INK_2 } from "../comun/colores-da.js";
import { Boton, MarcoHacer, Retro, useCronometro } from "../comun/ui.jsx";
import { azarDeLaPagina, sortear } from "../comun/azar.js";
import { MascotaRol } from "../comun/mascotas.jsx";
import { CAMBIARIA, CSS_PC } from "./comun-pc.jsx";
import { BANCO_H4, CONSIGNAS, H4, PARTIDA_H4 } from "./textos.js";

export const ID = "pc26-h4-a-quien-sirve";
export const prepararH4 = (rng = Math.random) => sortear(BANCO_H4, PARTIDA_H4, rng);
const UMBRAL_PX = 36;

const CSS = `
.pc26-h4-campo { display: grid; grid-template-columns: auto minmax(0, 1fr) auto; align-items: end; gap: 4px; }
.pc26-h4-lado { display: grid; justify-items: center; gap: 2px; padding: 2px; border: 2px solid transparent; border-radius: 12px; background: none; color: ${INK}; cursor: pointer; touch-action: manipulation; transition: transform 380ms cubic-bezier(.3,.9,.4,1); }
.pc26-h4-lado[data-tira="1"] { transform: translateX(var(--tira)); }
.pc26-h4-lado:disabled { cursor: default; }
.pc26-h4-cuerda { position: relative; height: 120px; }
.pc26-h4-cuerda::before { content: ""; position: absolute; left: -6px; right: -6px; top: 76px; height: 4px; border-radius: 2px; background: ${INK_2}; }
.pc26-h4-panuelo { position: absolute; left: 50%; top: 56px; width: 44px; height: 48px; margin-left: -22px; border-radius: 8px; border: 2px solid ${INK}; background: ${CAMBIARIA}; cursor: grab; touch-action: none; transition: transform 320ms cubic-bezier(.3,.9,.4,1); }
.pc26-h4-panuelo[data-estado="mal"] { border-color: #E76F51; border-width: 3px; }
.pc26-h4-panuelo[data-arrastre="1"] { transition: none; }
.pc26-h4-noticia { margin: 0 0 8px; padding: 10px 12px; border-radius: 12px; border: 2px solid ${INK}; background: ${FONDO}; font: 600 16px/1.35 var(--planck-font-sans, system-ui, sans-serif); }
.pc26-h4-nombre { font: 600 13px/1.2 var(--planck-font-sans, system-ui, sans-serif); text-align: center; max-width: 96px; }
@media (prefers-reduced-motion: reduce) { .pc26-h4-lado, .pc26-h4-panuelo { transition: none; } }
`;

export default function H4AQuienSirve({ onTerminar, rng = null }) {
  const noticias = useMemo(() => prepararH4(rng ?? azarDeLaPagina()), [rng]);
  const tiempo = useCronometro();
  const [n, setN] = useState(0);
  const [intento, setIntento] = useState(1);
  const [gano, setGano] = useState(null);
  const [retro, setRetro] = useState(null);
  const [mal, setMal] = useState(0);
  const [rojo, setRojo] = useState(false);
  const [dx, setDx] = useState(0);
  const [detalle, setDetalle] = useState([]);
  const arr = useRef(null);
  const campo = useRef(null);
  const x = noticias[n];

  const elegir = (lado) => {
    if (gano) return;
    if (lado === x.gana) {
      if (intento === 1) setDetalle((d) => [...d, { item: x.id, ok: true, subtemas: x.subtemas }]);
      setGano(lado);
      setRetro(null);
      setRojo(false);
      return;
    }
    if (intento === 1) { setDetalle((d) => [...d, { item: x.id, ok: false, subtemas: x.subtemas }]); setIntento(2); }
    setRetro(x.retro);
    setMal((m) => m + 1);
    setRojo(true);
    setDx(0);
  };
  const seguir = () => {
    if (n + 1 >= noticias.length) {
      const bien = detalle.filter((d) => d.ok).length;
      onTerminar?.({ pct: Math.round((bien / noticias.length) * 100), detalle, duracionMs: tiempo() });
      return;
    }
    setN(n + 1);
    setIntento(1);
    setGano(null);
    setRetro(null);
    setRojo(false);
    setDx(0);
  };

  const ancho = campo.current?.getBoundingClientRect().width ?? 120;
  const tope = Math.max(30, ancho / 2 - 26);
  const panuX = gano ? (gano === "exportadora" ? -tope : tope) : dx;
  const lado = (id, mascota, pose, nombre, signo) => (
    <button type="button" className="pc26-h4-lado" data-lado={id} disabled={Boolean(gano)} aria-label={nombre}
      data-tira={gano === id ? "1" : "0"} style={{ "--tira": `${signo * 10}px` }} onClick={() => elegir(id)}>
      <MascotaRol id={mascota} pose={pose} alto={120} rotulo={false} />
      <span className="pc26-h4-nombre">{nombre}</span>
    </button>
  );
  return (
    <MarcoHacer id={ID} consigna={CONSIGNAS[ID]} progreso={`${n + 1} / ${noticias.length}`}>
      <style>{CSS_PC}{CSS}</style>
      <p className="pc26-h4-noticia da26-entra" key={x.id} data-noticia={x.id}>{x.texto}</p>
      <div data-figura data-gano={gano ?? ""}>
        <div className="pc26-h4-campo">
          {lado("exportadora", "exportadora-flores", "recibe-billete", H4.exportadora, -1)}
          <div className="pc26-h4-cuerda" ref={campo}>
            <button type="button" className={`pc26-h4-panuelo${rojo ? " da26-tiembla" : ""}`} key={`p${mal}`} aria-label={H4.panuelo} data-panuelo
              data-estado={rojo ? "mal" : undefined} data-arrastre={arr.current ? "1" : "0"} disabled={Boolean(gano)}
              style={{ transform: `translateX(${panuX}px)` }}
              onPointerDown={(e) => { if (gano) return; e.currentTarget.setPointerCapture?.(e.pointerId); arr.current = { x0: e.clientX }; setRojo(false); }}
              onPointerMove={(e) => { if (!arr.current) return; setDx(Math.max(-tope, Math.min(tope, e.clientX - arr.current.x0))); }}
              onPointerUp={(e) => {
                if (!arr.current) return;
                const d = e.clientX - arr.current.x0;
                arr.current = null;
                if (Math.abs(d) >= UMBRAL_PX) elegir(d < 0 ? "exportadora" : "importadora"); else setDx(0);
              }}
              onPointerCancel={() => { arr.current = null; setDx(0); }}
              onKeyDown={(e) => {
                if (e.key === "ArrowLeft") { e.preventDefault(); elegir("exportadora"); }
                if (e.key === "ArrowRight") { e.preventDefault(); elegir("importadora"); }
              }} />
          </div>
          {lado("importadora", "importadora-celulares", "paga-billete", H4.importadora, 1)}
        </div>
      </div>
      <Retro estado="mal" key={`r${mal}`}>{retro}</Retro>
      {gano && <Retro estado="bien">{gano === "exportadora" ? H4.exportadora : H4.importadora}</Retro>}
      <div className="da26-nav">
        <span />
        <Boton primario onClick={seguir} disabled={!gano} data-siguiente>{n + 1 >= noticias.length ? H4.terminar : H4.siguiente}</Boton>
      </div>
    </MarcoHacer>
  );
}
