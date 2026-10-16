import { ICONO_POR_TEMA } from "../../data/identificadoresDeTema.js";

/*
 * ═══════════════════════════════════════════════════════════════════════════
 * EL IDENTIFICADOR VISUAL DE UN TEMA.
 *
 * Encargo de Mateo (16 oct.): hoy las nueve tarjetas de Contabilidad repiten
 * el mismo dibujo y las mismas dos píldoras, así que lo único que distingue
 * un tema de otro es un título largo. Cada tema va a tener su propio
 * identificador, y este es el ÚNICO sitio por el que entran.
 *
 * El reparto que puso Miku: Xeno define el sistema una vez (tamaño, estilo,
 * paleta y movimiento) y lo deja en el canon; el diseñador de cada célula
 * dibuja los de SUS temas dentro de ese sistema; yo integro aquí. Por eso
 * este componente no dibuja nada: busca, y si no hay, devuelve el de la
 * materia, que es lo que se ve hoy.
 *
 * QUÉ GARANTIZA ESTE SITIO, para que ninguna célula tenga que acordarse:
 *
 *   · Un tema sin identificador NO se rompe: cae en el de la materia. Las
 *     células pueden ir entrando de una en una, sin coordinarse entre ellas.
 *   · El dibujo es decorativo: el nombre accesible del tema ya lo da el
 *     aria-label de la tarjeta («Tema Las cuentas, el debe y el haber»). Un
 *     identificador que además se anunciara diría el nombre dos veces.
 *   · Movimiento reducido: si el sistema de Xeno trae microanimación, se
 *     apaga aquí para todas a la vez. Una célula no puede olvidarlo porque
 *     no es suyo.
 *
 * LO QUE AÚN NO ESTÁ, dicho de frente: el tamaño y el estilo los fija Xeno
 * y todavía no los ha entregado. Hasta entonces el identificador se pinta
 * con el mismo hueco que el ícono de hoy, y el registro está vacío a
 * propósito: no hay ningún dibujo nuevo en la plataforma hasta que exista
 * el sistema. Esto es la toma de corriente, no la lámpara.
 * ═══════════════════════════════════════════════════════════════════════════
 */

export default function IdentificadorDeTema({ tema, materia, respaldo = null }) {
  const Dibujo = (tema && ICONO_POR_TEMA[`${materia}/${tema.id}`]) || null;
  if (!Dibujo) return respaldo;
  return (
    <span
      data-identificador={tema.id}
      aria-hidden="true"
      style={{ display: "inline-flex", alignItems: "center", justifyContent: "center" }}
    >
      <Dibujo />
    </span>
  );
}
