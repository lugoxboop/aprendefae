import { ICONO_POR_TEMA } from "../../data/identificadoresDeTema.js";

/*
 * ═══════════════════════════════════════════════════════════════════════════
 * EL IDENTIFICADOR VISUAL DE UN TEMA.
 *
 * Encargo de Mateo (16 oct.): las nueve tarjetas de Contabilidad repetían el
 * mismo dibujo y las mismas dos píldoras, así que lo único que distinguía un
 * tema de otro era un título largo.
 *
 * El reparto de Miku: Xeno define el sistema una vez (está en kit.md), el
 * diseñador de cada célula dibuja los de SUS temas, y la integración es esta,
 * una sola. Una célula SOLO añade su entrada al registro.
 *
 * QUÉ GARANTIZA ESTE SITIO, para que ninguna célula tenga que acordarse:
 *
 *   · Un tema sin identificador NO se rompe: cae en el de la materia. Las
 *     células pueden ir entrando de una en una, sin coordinarse entre ellas.
 *   · El dibujo es decorativo: el nombre accesible del tema ya lo da el
 *     aria-label de la tarjeta. Uno que se anunciara lo diría dos veces.
 *   · EL MOVIMIENTO SE APAGA AQUÍ. La regla de `transform: var(--mueve)` con
 *     hover, foco y pulsación de la tarjeta se escribe UNA vez, y su versión
 *     de movimiento reducido con ella. Un diseñador declara qué se mueve
 *     (`data-mueve` y `--mueve` en su dibujo) y no puede olvidarse de
 *     apagarlo, porque apagarlo no es suyo.
 *   · El color lo pone la tarjeta: trazo #CBDCF2 en reposo y #F8F9FA con
 *     hover, foco o pulsación; el acento, en `--fae-acento`.
 *
 * El tamaño es 64, el del sistema. El hueco de antes era de 34.
 * ═══════════════════════════════════════════════════════════════════════════
 */

export const LADO_IDENTIFICADOR = 64;

/* Se escribe una vez por página, no una por tarjeta. */
export const CSS_IDENTIFICADOR = `
.fae-identificador { color: #CBDCF2; display: inline-flex; align-items: center; justify-content: center; }
.fae-card:hover .fae-identificador,
.fae-card:focus-within .fae-identificador,
.fae-card:active .fae-identificador { color: #F8F9FA; }
.fae-identificador [data-mueve] {
  transition: transform 400ms cubic-bezier(.3,.9,.4,1);
  transform: none;
}
.fae-card:hover .fae-identificador [data-mueve],
.fae-card:focus-within .fae-identificador [data-mueve],
.fae-card:active .fae-identificador [data-mueve] { transform: var(--mueve, none); }
@media (prefers-reduced-motion: reduce) {
  .fae-identificador [data-mueve],
  .fae-card:hover .fae-identificador [data-mueve],
  .fae-card:focus-within .fae-identificador [data-mueve],
  .fae-card:active .fae-identificador [data-mueve] { transition: none; transform: none; }
}
`;

export default function IdentificadorDeTema({ tema, materia, respaldo = null, acento = null }) {
  const Dibujo = (tema && ICONO_POR_TEMA[`${materia}/${tema.id}`]) || null;
  if (!Dibujo) return respaldo;
  return (
    <span
      className="fae-identificador"
      data-identificador={tema.id}
      aria-hidden="true"
      style={{ width: `${LADO_IDENTIFICADOR}px`, height: `${LADO_IDENTIFICADOR}px`, ...(acento ? { "--fae-acento": acento } : {}) }}
    >
      <Dibujo size={LADO_IDENTIFICADOR} />
    </span>
  );
}
