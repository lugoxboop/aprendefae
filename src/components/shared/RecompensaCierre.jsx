import { useCallback, useEffect, useState } from "react";
import { FAE } from "../../theme.js";
import Medalla from "./Medalla.jsx";
import { iconoDe } from "./iconosActividad.jsx";
import { bloqueDeDificultad } from "../../hacer/bloques.js";
import { nombreDeActividad } from "../../data/subjects.js";

/*
 * ═══════════════════════════════════════════════════════════════════════════
 * EL CIERRE DE UNA ACTIVIDAD, A LA ALTURA DE SU DIFICULTAD.
 *
 *   Fácil    check + un destello
 *   Medio    check + una ráfaga corta de partículas
 *   Difícil  check + ráfaga + la silueta de la insignia empezando a asomar
 *   Experto  todo, la insignia revelada entera y un efecto breve a pantalla completa
 *
 * LA INSIGNIA ES LA DEL JUEGO DE MEDALLAS, no una celebración paralela: el
 * mismo marco de Medalla.jsx, con el nivel por dificultad —base, intermedio,
 * avanzado, élite— y dentro el icono de la actividad, el mismo de su nodo.
 *
 * NO ATRAPA A NADIE. Es una capa sin eventos de puntero (pointer-events:
 * none), no toma el foco y se va sola: el estudiante puede tocar «Jugar otra
 * vez» o volver al camino mientras suena. Tampoco el efecto a pantalla
 * completa del Experto: pasa por encima y se acaba.
 *
 * Con "reducir movimiento" no se anima nada: se ve el estado final —el check,
 * la insignia como queda— el mismo rato, y desaparece. Todos los keyframes
 * describen solo el principio; el final es el estilo normal, así que quitar
 * la animación deja el final y no hay dos sitios donde escribirlo.
 *
 * Se dispara al TERMINAR, desde la vista, y no con el aviso de FP: así lo ve
 * también quien juega sin cuenta, que no recibe FP pero sí terminó.
 * ═══════════════════════════════════════════════════════════════════════════
 */

export const RECOMPENSAS = {
  facil: { nivel: "base", destello: true, particulas: 0, insignia: null, pantalla: false, ms: 1500 },
  medio: { nivel: "intermedio", destello: false, particulas: 12, insignia: null, pantalla: false, ms: 1900 },
  dificil: { nivel: "avanzado", destello: false, particulas: 14, insignia: "silueta", pantalla: false, ms: 2500 },
  experto: { nivel: "elite", destello: true, particulas: 24, insignia: "revelada", pantalla: true, ms: 3200 },
};

/** Qué lleva el cierre de una dificultad. Una desconocida se cierra como Medio. */
export function recompensaDe(dificultad) {
  return RECOMPENSAS[dificultad] ?? RECOMPENSAS.medio;
}

const SALIDA_MS = 380;

const CSS = `
.fae-rc { position: fixed; inset: 0; pointer-events: none; z-index: 70; animation: fae-rc-salir ${SALIDA_MS}ms ease-in var(--rc-salida) forwards; }
@keyframes fae-rc-salir { to { opacity: 0; } }
.fae-rc-centro { position: absolute; left: 50%; top: 40%; width: 0; height: 0; }
/* Un disco oscuro detrás: el cierre sale encima de lo que haya —el resultado, un panel— y sin él no se leía. */
.fae-rc-fondo { position: absolute; left: 0; top: 0; width: 300px; height: 300px; margin: -150px 0 0 -150px; border-radius: 50%; background: radial-gradient(circle, rgba(10,20,34,0.88) 0%, rgba(10,20,34,0.7) 42%, rgba(10,20,34,0) 70%); animation: fae-rc-aparecer 260ms ease-out both; }
@keyframes fae-rc-aparecer { from { opacity: 0; } }
.fae-rc-check { position: absolute; left: 0; top: 0; width: 64px; height: 64px; transform: translate(-50%, -50%); animation: fae-rc-pop 420ms cubic-bezier(.3,1.5,.5,1) both; }
.fae-rc-con-insignia .fae-rc-check { width: 42px; height: 42px; left: 40px; top: 40px; }
@keyframes fae-rc-pop { from { opacity: 0; transform: translate(-50%, -50%) scale(.3); } }
.fae-rc-trazo { stroke-dasharray: 1; stroke-dashoffset: 0; animation: fae-rc-trazar 380ms ease-out 180ms both; }
@keyframes fae-rc-trazar { from { stroke-dashoffset: 1; } }
.fae-rc-destello { position: absolute; left: 0; top: 0; width: 64px; height: 64px; margin: -32px 0 0 -32px; border-radius: 50%; border: 3px solid ${FAE.teal}; opacity: 0; transform: scale(2.1); animation: fae-rc-destello 650ms ease-out both; }
@keyframes fae-rc-destello { from { opacity: .9; transform: scale(.7); } }
.fae-rc-particula { position: absolute; left: 0; top: 0; width: 8px; height: 8px; margin: -4px 0 0 -4px; border-radius: 50%; opacity: 0; transform: translate(var(--dx), var(--dy)) scale(.4); animation: fae-rc-particula 720ms cubic-bezier(.2,.8,.3,1) var(--retraso) both; }
@keyframes fae-rc-particula { from { opacity: 1; transform: translate(0, 0) scale(1); } 70% { opacity: 1; } }
.fae-rc-insignia { position: absolute; left: 0; top: 0; transform: translate(-50%, -50%); }
/* La silueta asoma de abajo arriba y se queda a medio salir: la insignia está en camino. */
.fae-rc-silueta { clip-path: inset(38% 0 0 0); animation: fae-rc-asoma 900ms ease-out 300ms both; }
@keyframes fae-rc-asoma { from { clip-path: inset(100% 0 0 0); } }
.fae-rc-revelada { animation: fae-rc-revelar 700ms cubic-bezier(.3,1.4,.5,1) 250ms both; }
@keyframes fae-rc-revelar { from { opacity: 0; transform: translate(-50%, -50%) scale(.4) rotate(-14deg); } }
.fae-rc-pantalla { position: fixed; inset: 0; opacity: 0; background: radial-gradient(circle at 50% 40%, rgba(42,157,143,0.38), rgba(42,157,143,0.08) 45%, transparent 70%); animation: fae-rc-pantalla 1100ms ease-out both; }
@keyframes fae-rc-pantalla { 0% { opacity: 0; transform: scale(.6); } 25% { opacity: 1; } 100% { opacity: 0; transform: scale(1.3); } }
.fae-rc-texto {
  position: absolute; left: 50%; top: calc(40% + 86px); transform: translateX(-50%); margin: 0; white-space: nowrap;
  font-family: Sora, sans-serif; font-weight: 700; font-size: 15px; color: #F8F9FA; text-shadow: 0 2px 10px rgba(10,20,34,0.95);
  animation: fae-rc-subir 400ms ease-out 250ms both;
}
@keyframes fae-rc-subir { from { opacity: 0; transform: translate(-50%, 8px); } }
.fae-rc-oculto { position: absolute; width: 1px; height: 1px; overflow: hidden; clip-path: inset(50%); white-space: nowrap; }
@media (prefers-reduced-motion: reduce) {
  .fae-rc, .fae-rc * { animation: none !important; }
  .fae-rc-pantalla, .fae-rc-particula, .fae-rc-destello { display: none; }
}
`;

/**
 * El cierre en pantalla. Se monta con una `key` nueva en cada disparo y se
 * desmonta solo al acabar (onFin).
 */
export default function RecompensaCierre({ dificultad, actividadId, onFin }) {
  const r = recompensaDe(dificultad);
  const Glifo = iconoDe(actividadId);
  const bloque = bloqueDeDificultad(dificultad);
  const nombre = nombreDeActividad(actividadId);

  useEffect(() => {
    const t = setTimeout(() => onFin?.(), r.ms);
    return () => clearTimeout(t);
    /* Una sola vez por disparo: la key la renueva. */
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const particulas = Array.from({ length: r.particulas }, (_, i) => {
    const angulo = (i / r.particulas) * Math.PI * 2 + (i % 2) * 0.18;
    const distancia = 74 + (i % 3) * 20 + (r.insignia ? 18 : 0);
    return {
      "--dx": `${(Math.cos(angulo) * distancia).toFixed(1)}px`,
      "--dy": `${(Math.sin(angulo) * distancia).toFixed(1)}px`,
      "--retraso": `${80 + (i % 4) * 30}ms`,
      background: i % 3 === 2 ? FAE.ambar : FAE.teal,
    };
  });

  return (
    <div
      className={`fae-rc${r.insignia ? " fae-rc-con-insignia" : ""}`}
      role="status"
      aria-live="polite"
      data-dificultad={dificultad ?? "medio"}
      style={{ "--rc-salida": `${r.ms - SALIDA_MS}ms` }}
    >
      <style>{CSS}</style>
      {r.pantalla && <div className="fae-rc-pantalla" data-pieza="pantalla" />}

      <div className="fae-rc-centro">
        <span className="fae-rc-fondo" aria-hidden="true" />
        {r.insignia && (
          <div className={`fae-rc-insignia fae-rc-${r.insignia}`} data-pieza={`insignia-${r.insignia}`}>
            <Medalla
              nivel={r.nivel}
              obtenida={r.insignia === "revelada"}
              tamano={r.insignia === "revelada" ? 132 : 116}
              glifo={Glifo ? (c) => <Glifo size={40} color={c} strokeWidth={1.7} /> : undefined}
              numero=""
            />
          </div>
        )}
        {r.destello && <span className="fae-rc-destello" data-pieza="destello" />}
        {particulas.map((estilo, i) => (
          <span key={i} className="fae-rc-particula" data-pieza="particula" style={estilo} />
        ))}
        <svg className="fae-rc-check" viewBox="0 0 64 64" aria-hidden="true" data-pieza="check">
          <circle cx="32" cy="32" r="29" fill={FAE.teal} stroke="#0E1B2E" strokeWidth="3" />
          <path className="fae-rc-trazo" pathLength="1" d="M19 33 L28 42 L45 23" fill="none" stroke="#0E1B2E" strokeWidth="6" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      </div>

      <p className="fae-rc-texto" aria-hidden="true">
        Completada{bloque ? ` · ${bloque.nombre}` : ""}
      </p>
      <span className="fae-rc-oculto">
        Actividad completada{nombre ? `: ${nombre}` : ""}{bloque ? `. Bloque ${bloque.nombre}.` : "."}
      </span>
    </div>
  );
}

/**
 * Para una vista: `const [recompensa, celebrar] = useRecompensa();`, pintar
 * `{recompensa}` y llamar `celebrar(dificultad, actividadId)` al completar.
 */
export function useRecompensa() {
  const [disparo, setDisparo] = useState(null);
  const celebrar = useCallback(
    (dificultad, actividadId) => setDisparo((d) => ({ dificultad, actividadId, n: (d?.n ?? 0) + 1 })),
    [],
  );
  const terminar = useCallback(() => setDisparo(null), []);
  const elemento = disparo ? (
    <RecompensaCierre key={disparo.n} dificultad={disparo.dificultad} actividadId={disparo.actividadId} onFin={terminar} />
  ) : null;
  return [elemento, celebrar];
}
