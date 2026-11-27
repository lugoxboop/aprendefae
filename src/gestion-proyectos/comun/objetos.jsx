/*
 * GESTIÓN DE PROYECTOS · UN OBJETO ILUSTRADO, POR SU ID.
 *
 * Busca primero en los de la materia (ILUSTRADOS_GP, public/gestion-proyectos/
 * ilustrados/) y después en los de Macro 2026 que se reutilizan tal cual
 * (caja registradora, balanza, lupa, nube, caja de herramientas, candado,
 * cuerda…). Un id que no está en ninguno no pinta nada: nunca un rectángulo
 * dibujado a mano como protagonista (diseño §0, paso 6).
 */
import { ILUSTRADOS_GP } from "./ilustrados.js";
import { ILUSTRADOS } from "../../macro2026/comun/ilustrados.jsx";

export function fuenteObjeto(id) {
  if (ILUSTRADOS_GP[id]) return { src: `/gestion-proyectos/ilustrados/${id}.webp`, tam: ILUSTRADOS_GP[id] };
  if (ILUSTRADOS[id]) return { src: `/macro2026/ilustrados/${id}.webp`, tam: ILUSTRADOS[id] };
  return null;
}

export const hayObjeto = (id) => Boolean(id && fuenteObjeto(id));

/** El objeto a `alto` px (o a `ancho` si se pide). Decorativo por defecto. */
export function Objeto({ id, alto = 80, ancho = null, nombre = null, className = "", style = null, ...resto }) {
  const f = id ? fuenteObjeto(id) : null;
  if (!f) return null;
  const [w, h] = f.tam;
  const H = ancho ? Math.round((ancho * h) / w) : alto;
  const W = ancho ?? Math.round((alto * w) / h);
  return (
    <img
      src={f.src}
      alt={nombre ?? ""}
      width={W}
      height={H}
      decoding="async"
      draggable={false}
      data-objeto={id}
      className={className}
      style={{ display: "block", width: W, height: H, maxWidth: "100%", objectFit: "contain", ...style }}
      {...resto}
    />
  );
}
