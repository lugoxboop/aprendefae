/*
 * GESTIÓN DE PROYECTOS · MOTOR «DIAL» (H17, el dial de la autoridad).
 *
 * El dial de radio ilustrado con cinco posiciones, cada una con su nombre
 * escrito (no depende del ángulo). Se gira arrastrando, con las dos flechas
 * grandes, tocando el nombre o con el teclado (es un role="slider").
 * Arriba, la escena: la bolsa de presupuesto entre el gerente funcional y tú,
 * el medidor de aguja «Autoridad del director» (aguja a mano, sobre la
 * tabla 2-1) y la etiqueta de tu rol.
 * Primero se explora sin puntaje (30 s o las 5 posiciones vistas); luego el
 * reto: girar a la estructura que describe cada situación y confirmar.
 */
import { useEffect, useRef, useState } from "react";
import { Boton, Retro } from "../../../macro2026/comun/ui.jsx";
import { Personaje } from "../elenco.jsx";
import { Objeto } from "../objetos.jsx";

const CSS = `
.gp-dial-escena { display: grid; grid-template-columns: auto 1fr auto; align-items: end; gap: 4px; }
.gp-bolsa-carril { position: relative; height: 110px; }
.gp-bolsa { position: absolute; bottom: 40px; transition: left 420ms cubic-bezier(.3,.9,.4,1), transform 420ms cubic-bezier(.3,.9,.4,1); transform: translateX(-50%); }
.gp-aguja-caja { display: grid; justify-items: center; gap: 2px; margin: 8px auto 0; max-width: 260px; }
.gp-aguja-svg { width: 100%; max-width: 220px; height: auto; display: block; }
.gp-aguja-svg line { transition: transform 420ms cubic-bezier(.3,.9,.4,1); transform-origin: 110px 100px; }
.gp-etq { padding: 2px 10px; border-radius: 999px; background: #f4f5f7; color: #121418; font: 700 13px/18px var(--planck-font-sans, system-ui, sans-serif); }
.gp-dial-zona { position: relative; display: grid; place-items: center; margin: 10px auto 0; width: 210px; max-width: 100%; touch-action: none; user-select: none; -webkit-user-select: none; }
.gp-dial-zona:focus-visible { outline: 2px solid #f4f5f7; outline-offset: 4px; border-radius: 50%; }
.gp-dial-puntero { position: absolute; left: 50%; top: 50%; width: 6px; height: 46%; margin-left: -3px; border-radius: 3px; background: #f2c14e; transform-origin: 50% 0; box-shadow: 0 0 0 2px #121418; transition: transform 320ms cubic-bezier(.3,.9,.4,1); pointer-events: none; }
.gp-dial-nombres { display: grid; grid-template-columns: repeat(6, minmax(0, 1fr)); gap: 6px; margin-top: 8px; }
.gp-dial-nombres > * { grid-column: span 2; }
.gp-dial-nombres > :nth-child(4) { grid-column: 2 / span 2; }
.gp-dial-nombre { min-height: 48px; padding: 4px 2px; border-radius: 10px; border: 2px solid rgba(244,245,247,.45); background: rgba(8,16,30,.72); color: #f4f5f7; font: 600 13px/1.2 var(--planck-font-sans, system-ui, sans-serif); cursor: pointer; }
.gp-dial-nombre[aria-pressed="true"] { border-color: #f4f5f7; background: #f4f5f7; color: #121418; }
.gp-dial-nombre[data-estado="mal"] { border-color: #E76F51; }
.gp-dial-flechas { display: flex; justify-content: space-between; gap: 8px; margin-top: 8px; }
.gp-dial-flechas .da26-boton { min-width: 64px; font-size: 20px; }
@media (prefers-reduced-motion: reduce) { .gp-bolsa, .gp-aguja-svg line, .gp-dial-puntero { transition: none; } }
`;

const ANGULOS = [-64, -32, 0, 32, 64];

function Aguja({ valor, texto }) {
  const giro = -90 + valor * 180;
  return (
    <div className="gp-aguja-caja" data-aguja={valor}>
      <svg className="gp-aguja-svg" viewBox="0 0 220 112" aria-hidden="true">
        <path d="M12 100a98 98 0 0 1 196 0" fill="none" stroke="rgba(244,245,247,.3)" strokeWidth="14" strokeLinecap="round" />
        <path d="M12 100a98 98 0 0 1 196 0" fill="none" stroke="#f2c14e" strokeWidth="14" strokeLinecap="round" pathLength="1" strokeDasharray={`${valor} 1`} />
        <line x1="110" y1="100" x2="110" y2="20" stroke="#f4f5f7" strokeWidth="5" strokeLinecap="round" style={{ transform: `rotate(${giro}deg)` }} />
        <circle cx="110" cy="100" r="9" fill="#f4f5f7" />
      </svg>
      <span className="da26-rotulo">Autoridad del director</span>
      <span className="gp-etq" data-autoridad>{texto}</span>
    </div>
  );
}

export default function Dial({ paso, escena = {}, alTerminar, consignaReto, onFase }) {
  const pos = paso.posiciones;
  const [i, setI] = useState(0);
  const [vistas, setVistas] = useState(() => new Set([0]));
  const [tiempo, setTiempo] = useState(false);
  const [fase, setFase] = useState("explora");
  const [r, setR] = useState(0);
  const [intento, setIntento] = useState(1);
  const [retro, setRetro] = useState(null);
  const [mal, setMal] = useState(null);
  const [golpes, setGolpes] = useState(0);
  const [hecho, setHecho] = useState(false);
  const detalle = useRef([]);
  const zona = useRef(null);
  const arrastra = useRef(false);

  useEffect(() => { const t = setTimeout(() => setTiempo(true), paso.exploracion.segundos * 1000); return () => clearTimeout(t); }, [paso.exploracion.segundos]);
  const ir = (n) => {
    const v = Math.max(0, Math.min(pos.length - 1, n));
    setI(v);
    setVistas((s) => new Set(s).add(v));
    setMal(null);
  };
  const desdePuntero = (e) => {
    const rect = zona.current.getBoundingClientRect();
    const ang = (Math.atan2(e.clientX - (rect.left + rect.width / 2), -(e.clientY - (rect.top + rect.height / 2))) * 180) / Math.PI;
    let mejor = 0;
    ANGULOS.forEach((a, k) => { if (Math.abs(a - ang) < Math.abs(ANGULOS[mejor] - ang)) mejor = k; });
    ir(mejor);
  };
  const p = pos[i];
  const puedeRetar = vistas.size >= paso.exploracion.posiciones || tiempo;
  const reto = paso.retos[r];

  const confirmar = () => {
    if (hecho) return;
    if (p.id === reto.clave) {
      if (intento === 1) detalle.current.push({ item: reto.id, ok: true, subtemas: ["gp-c2-estructuras"] });
      setRetro(null);
      setHecho(true);
      setTimeout(() => siguiente(), 900);
      return;
    }
    setRetro(reto.retro);
    setMal(i);
    setGolpes((g) => g + 1);
    if (intento === 1) { detalle.current.push({ item: reto.id, ok: false, subtemas: ["gp-c2-estructuras"], respuesta: p.id }); setIntento(2); return; }
    setHecho(true);
    ir(pos.findIndex((x) => x.id === reto.clave));
    setTimeout(() => siguiente(), 2600);
  };
  const siguiente = () => {
    if (r + 1 >= paso.retos.length) { alTerminar({ detalle: detalle.current, puntos: detalle.current.filter((d) => d.ok).length }); return; }
    setR((x) => x + 1);
    setIntento(1);
    setHecho(false);
    setRetro(null);
    setMal(null);
  };
  const bolsaIzq = p.lado === "gerente" ? "18%" : p.lado === "medio" ? "50%" : "82%";

  return (
    <div data-motor="dial">
      <style>{CSS}</style>
      {fase === "reto" && <p className="gp-contexto da26-entra" style={{ marginTop: 4 }} data-situacion={reto.id}><small>Situación {r + 1} / {paso.retos.length}</small>{reto.texto}</p>}
      <div className="gp-visual" data-visual="dial" style={{ "--gp-a": escena.fondo?.[0], "--gp-b": escena.fondo?.[1], "--gp-acento": escena.acento }}>
        <div className="gp-dial-escena">
          <Personaje quien="gerente" alto={120} />
          <div className="gp-bolsa-carril" aria-hidden="true">
            <span className="gp-bolsa" style={{ left: bolsaIzq }}><Objeto id="bolsa-dinero" alto={60} /></span>
          </div>
          <Personaje quien="tu" alto={120} animo={hecho && intento === 1 ? "feliz" : "quieta"} />
        </div>
        <p className="da26-rotulo" style={{ textAlign: "center", margin: "6px 0 0" }}>
          Presupuesto: <strong data-bolsa>{p.bolsa}</strong> · Tu rol: <strong data-rol-director>{p.rol}</strong>
        </p>
        <Aguja valor={p.aguja} texto={p.autoridad} />
        <div
          ref={zona}
          className="gp-dial-zona"
          role="slider"
          tabIndex={0}
          aria-label="Dial de la estructura"
          aria-valuemin={1}
          aria-valuemax={pos.length}
          aria-valuenow={i + 1}
          aria-valuetext={p.nombre}
          data-dial={p.id}
          onKeyDown={(e) => {
            if (e.key === "ArrowRight" || e.key === "ArrowUp") { e.preventDefault(); ir(i + 1); }
            if (e.key === "ArrowLeft" || e.key === "ArrowDown") { e.preventDefault(); ir(i - 1); }
          }}
          onPointerDown={(e) => { arrastra.current = true; e.currentTarget.setPointerCapture?.(e.pointerId); desdePuntero(e); }}
          onPointerMove={(e) => { if (arrastra.current) desdePuntero(e); }}
          onPointerUp={() => { arrastra.current = false; }}
          onPointerCancel={() => { arrastra.current = false; }}
        >
          <Objeto id="dial-radio" ancho={210} />
          <span className="gp-dial-puntero" style={{ transform: `rotate(${180 + ANGULOS[i]}deg)` }} />
        </div>
        <div className="gp-dial-flechas">
          <Boton onClick={() => ir(i - 1)} aria-label="Girar a la izquierda" data-dial-menos>‹</Boton>
          <span className="gp-etq" style={{ alignSelf: "center" }} data-posicion>{p.nombre}</span>
          <Boton onClick={() => ir(i + 1)} aria-label="Girar a la derecha" data-dial-mas>›</Boton>
        </div>
        <div className="gp-dial-nombres" role="group" aria-label="Posiciones del dial">
          {pos.map((x, k) => (
            <button key={x.id} type="button" className="gp-dial-nombre" aria-pressed={k === i} data-estado={mal === k ? "mal" : undefined} onClick={() => ir(k)}>{x.nombre}</button>
          ))}
        </div>
      </div>
      <Retro estado="mal" key={`r${golpes}`}>{retro}</Retro>
      <div className="gp-pie">
        {fase === "explora"
          ? <Boton primario disabled={!puedeRetar} onClick={() => { setFase("reto"); onFase?.(consignaReto); ir(2); }} data-ir-reto>{puedeRetar ? "Ir al reto" : `Mira las ${paso.exploracion.posiciones} posiciones (${vistas.size}/${paso.exploracion.posiciones})`}</Boton>
          : <Boton primario disabled={hecho} onClick={confirmar} data-confirmar-dial>Confirmar</Boton>}
      </div>
    </div>
  );
}
