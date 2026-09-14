import { FAE } from "../../theme.js";

/*
 * ═══════════════════════════════════════════════════════════════════════════
 * LA BRÚJULA DE LAS 6 PREGUNTAS — reutilizable.
 *
 * Seis puntas alrededor de un centro neutro. Se toca cualquiera, en el orden
 * que se quiera y las veces que se quiera: se enciende y despliega su
 * definición en la tarjeta del lado. Nada se bloquea.
 *
 * NO ES DE POLÍTICA FISCAL. La misma mecánica sirve después para política
 * monetaria y cambiaria con otras tarjetas, así que:
 *
 *   · las seis puntas llegan como DATO —`puntas`—, con la misma forma
 *     { id, nombre, pregunta, significado }; cambiar de política es escribir
 *     otra lista, no tocar este archivo;
 *   · el centro es neutro, sin la iconografía de la Tesorería ni de ningún
 *     otro tema;
 *   · no guarda estado: qué puntas están encendidas y cuál se ve lo decide
 *     quien la usa (`reveladas`, `activa`, `onElegir`). Por eso, dentro de una
 *     presentación, volver a esta escena no borra lo revelado.
 *
 * Para usarla en una presentación está `escenaBrujula(...)`, abajo. Fuera de
 * una, los tamaños caen a los del sitio: las variables de la presentación
 * llevan un valor por defecto.
 *
 * El color nunca va solo: una punta encendida cambia de fondo Y lleva un ✓
 * escrito, y su nombre se lee igual en las dos.
 * ═══════════════════════════════════════════════════════════════════════════
 */

export const PUNTAS_POR_BRUJULA = 6;
const CAMPOS = ["id", "nombre", "pregunta", "significado"];

/** Lo que falla en una lista de puntas, o [] si está bien. */
export function validarPuntas(puntas) {
  const errores = [];
  if (!Array.isArray(puntas)) return ["las puntas tienen que ser una lista"];
  if (puntas.length !== PUNTAS_POR_BRUJULA) errores.push(`hacen falta ${PUNTAS_POR_BRUJULA} puntas y hay ${puntas.length}`);
  const ids = new Set();
  for (const p of puntas) {
    for (const campo of CAMPOS) {
      if (typeof p?.[campo] !== "string" || !p[campo].trim()) errores.push(`${p?.id ?? "?"}: falta «${campo}»`);
    }
    if (ids.has(p?.id)) errores.push(`id repetido: ${p.id}`);
    ids.add(p?.id);
  }
  return errores;
}

/* Los seis vértices, en % de una caja cuadrada: arriba y en el sentido del reloj. */
const RADIO = 36;
const VERTICES = Array.from({ length: PUNTAS_POR_BRUJULA }, (_, k) => {
  const a = ((-90 + k * 60) * Math.PI) / 180;
  return { x: 50 + RADIO * Math.cos(a), y: 50 + RADIO * Math.sin(a) };
});

const CSS_BRUJULA = `
.fae-bj { display: grid; grid-template-columns: minmax(0, 1.05fr) minmax(0, 1fr); gap: 4vw; align-items: center; }
.fae-bj-rosa { position: relative; width: min(100%, 62vh); aspect-ratio: 1 / 1; margin: 0 auto; }
.fae-bj-dibujo { position: absolute; inset: 0; width: 100%; height: 100%; }
.fae-bj-punta {
  position: absolute; transform: translate(-50%, -50%); white-space: nowrap; cursor: pointer;
  font-family: Sora, sans-serif; font-weight: 700; font-size: var(--pres-min, 14px); line-height: 1.2;
  padding: 0.5em 0.85em; border-radius: 999px;
  background: #0E1B2E; color: #F8F9FA; border: var(--pres-borde, 2px) solid rgba(248,249,250,0.7);
  transition: background 200ms ease, color 200ms ease, border-color 200ms ease;
}
.fae-bj-encendida { background: ${FAE.ambar}; color: #0E1B2E; border-color: ${FAE.ambar}; }
.fae-bj-activa { box-shadow: 0 0 0 max(3px, 0.45vh) #F8F9FA; }
@keyframes fae-bj-encender { 0%, 100% { transform: translate(-50%, -50%) scale(1); } 45% { transform: translate(-50%, -50%) scale(1.12); } }
.fae-bj-encendida.fae-bj-activa { animation: fae-bj-encender 420ms ease-out; }
.fae-bj-tarjeta {
  min-height: 36vh; padding: 3.2vh 3vw; border-radius: 20px; box-sizing: border-box;
  background: #16263D; border: var(--pres-borde, 2px) solid rgba(248,249,250,0.4);
  display: flex; flex-direction: column; justify-content: center;
}
@keyframes fae-bj-desplegar { from { opacity: 0; clip-path: inset(0 100% 0 0); } to { opacity: 1; clip-path: inset(0 0 0 0); } }
.fae-bj-despliegue { animation: fae-bj-desplegar 460ms cubic-bezier(.3,.9,.4,1) both; }
.fae-bj-eyebrow { font-family: Sora, sans-serif; font-size: var(--pres-min, 14px); font-weight: 700; letter-spacing: 0.16em; color: ${FAE.ambar}; margin: 0 0 1.4vh; }
.fae-bj-pregunta { font-family: Sora, sans-serif; font-size: var(--pres-destacado, 19px); font-weight: 700; line-height: 1.2; margin: 0 0 2vh; color: #F8F9FA; }
.fae-bj-significado { font-size: var(--pres-lectura, 16px); line-height: 1.45; color: rgba(248,249,250,0.92); margin: 0; }
.fae-bj-vacia { font-size: var(--pres-lectura, 16px); line-height: 1.45; color: rgba(248,249,250,0.9); margin: 0; }
.fae-bj-cuenta { font-family: Sora, sans-serif; font-size: var(--pres-min, 14px); font-weight: 600; color: rgba(248,249,250,0.85); margin: 2.4vh 0 0; }
@media (orientation: portrait), (max-width: 760px) {
  .fae-bj { grid-template-columns: 1fr; gap: 18px; }
  .fae-bj-rosa { width: min(100%, 360px); }
  .fae-bj-punta { padding: 0.45em 0.65em; }
  .fae-bj-tarjeta { min-height: 0; padding: 18px; }
  .fae-bj-eyebrow { margin-bottom: 8px; } .fae-bj-pregunta { margin-bottom: 10px; } .fae-bj-cuenta { margin-top: 12px; }
}
@media (prefers-reduced-motion: reduce) {
  .fae-bj-despliegue, .fae-bj-encendida.fae-bj-activa { animation: none !important; }
}
`;

/**
 * @param {object} p
 * @param {Array<{id:string, nombre:string, pregunta:string, significado:string}>} p.puntas  seis
 * @param {string[]} p.reveladas  ids ya encendidas
 * @param {string|null} p.activa  la que se ve en la tarjeta
 * @param {(id:string) => void} p.onElegir
 */
export default function Brujula({ puntas, reveladas = [], activa = null, onElegir, rotulo = "Brújula de las 6 preguntas" }) {
  const actual = puntas.find((p) => p.id === activa) ?? null;

  return (
    <div className="fae-bj">
      <style>{CSS_BRUJULA}</style>

      <div className="fae-bj-rosa" role="group" aria-label={rotulo}>
        <svg viewBox="0 0 100 100" className="fae-bj-dibujo" aria-hidden="true">
          <polygon
            points={VERTICES.map((v) => `${v.x.toFixed(2)},${v.y.toFixed(2)}`).join(" ")}
            fill="none" stroke="rgba(248,249,250,0.5)" strokeWidth="0.8" strokeLinejoin="round"
          />
          {VERTICES.map((v, k) => {
            const encendida = reveladas.includes(puntas[k]?.id);
            return (
              <line
                key={k} x1="50" y1="50" x2={v.x} y2={v.y}
                stroke={encendida ? FAE.ambar : "rgba(248,249,250,0.35)"} strokeWidth={encendida ? 1.4 : 0.7}
                strokeLinecap="round"
              />
            );
          })}
          {/* El centro, neutro: una rosa de los vientos sin nada de ningún tema. */}
          <circle cx="50" cy="50" r="10.5" fill="#0E1B2E" stroke="rgba(248,249,250,0.6)" strokeWidth="0.8" />
          <path d="M50 42 L51.8 50 L50 58 L48.2 50 Z" fill="#F8F9FA" />
          <path d="M42 50 L50 48.2 L58 50 L50 51.8 Z" fill="rgba(248,249,250,0.55)" />
        </svg>

        {puntas.map((p, k) => {
          const encendida = reveladas.includes(p.id);
          const esActiva = p.id === activa;
          return (
            <button
              key={p.id}
              type="button"
              className={`fae-bj-punta${encendida ? " fae-bj-encendida" : ""}${esActiva ? " fae-bj-activa" : ""}`}
              style={{ left: `${VERTICES[k].x}%`, top: `${VERTICES[k].y}%` }}
              aria-pressed={esActiva}
              aria-label={`${p.nombre}${encendida ? " (ya revelada)" : ""}`}
              onClick={() => onElegir?.(p.id)}
            >
              {encendida && <span aria-hidden="true">✓ </span>}
              {p.nombre}
            </button>
          );
        })}
      </div>

      <div className="fae-bj-tarjeta" aria-live="polite">
        {actual ? (
          <div key={actual.id} className="fae-bj-despliegue">
            <p className="fae-bj-eyebrow">{actual.nombre.toUpperCase()}</p>
            <p className="fae-bj-pregunta">{actual.pregunta}</p>
            <p className="fae-bj-significado">{actual.significado}</p>
          </div>
        ) : (
          <p className="fae-bj-vacia">Toca cualquier punta de la brújula, en el orden que quieras.</p>
        )}
        <p className="fae-bj-cuenta">{reveladas.length} de {puntas.length} puntas reveladas</p>
      </div>
    </div>
  );
}

/*
 * La brújula como escena de una Presentación. El mando revela las puntas en el
 * orden de la lista; el ratón o el dedo, en cualquiera. Para otra política:
 *
 *   escenaBrujula({ id: "brujula", titulo: "…", puntas: BRUJULA_MONETARIA })
 */
export function escenaBrujula({ id = "brujula", titulo, puntas, rotulo }) {
  const errores = validarPuntas(puntas);
  if (errores.length) throw new Error(`Brújula «${titulo}»: ${errores.join("; ")}`);
  const siguienteSin = (e) => puntas.find((p) => !e.reveladas.includes(p.id)) ?? null;

  return {
    id,
    titulo,
    identidad: "brujula",
    estadoInicial: { reveladas: [], activa: null },
    siguientePaso: (e) => {
      const p = siguienteSin(e);
      return p ? { reveladas: [...e.reveladas, p.id], activa: p.id } : null;
    },
    textoPaso: (e) => {
      const p = siguienteSin(e);
      return p ? `Revelar «${p.nombre}»` : null;
    },
    Componente: function EscenaBrujula({ estado, cambiar }) {
      return (
        <Brujula
          puntas={puntas}
          rotulo={rotulo ?? titulo}
          reveladas={estado.reveladas}
          activa={estado.activa}
          onElegir={(pid) =>
            cambiar((e) => ({ reveladas: e.reveladas.includes(pid) ? e.reveladas : [...e.reveladas, pid], activa: pid }))
          }
        />
      );
    },
  };
}
