import { Suspense } from "react";

/*
 * ═══════════════════════════════════════════════════════════════════════════
 * LA PREVISUALIZACIÓN DE UNA ACTIVIDAD, en el panel de su nodo.
 *
 * LA REGLA: el gesto de la miniatura es el mismo gesto que el estudiante hace
 * dentro. Nada decorativo. Una previsualización promete algo, y si enseña un
 * movimiento que la actividad no tiene, la actividad se siente más pobre de
 * lo prometido. Siluetas y formas, nunca texto real ni una respuesta.
 *
 * De dónde sale cada una:
 *   gesto    diseñado por pedagogía a partir de la mecánica real (12)
 *   clip     el propio componente de la actividad, tal cual (El tablero de
 *            decisiones: la aguja moviéndose ES la interacción)
 *   propia   el movimiento que la actividad ya tenía, en pequeño y sin texto
 *            (las cinco que lo tenían, más Déficit vs deuda)
 *   estatica el icono quieto, A PROPÓSITO (ver la razón en cada una)
 *
 * PESO. Solo se monta la del nodo tocado, nunca las 21. Y los gestos viven en
 * tres módulos, uno por tema, que se descargan la primera vez que se abre un
 * panel de ese tema: el camino no carga ni un gesto hasta que alguien toca.
 * Mientras llega, se ve el icono quieto (`respaldo`).
 * ═══════════════════════════════════════════════════════════════════════════
 */

/*
 * VACÍA DESDE EL 22-NOV-2026. Las 50 que había eran todas de Macroeconomía
 * —sus gestos vivían en previasEconomica, previasDemanda, previasFiscal y
 * previasBloques— y salieron con la materia, que se rehace desde cero (0258).
 * El mecanismo se queda: con la tabla vacía, todo nodo enseña su icono quieto
 * (`respaldo`), que es lo que ya pasaba con Contabilidad. Una actividad nueva
 * entra con { tema, tipo } aquí y su módulo en MODULOS.
 *
 * Las razones de las «estatica» (Biopsia, El agujero fiscal, El expediente del
 * gabinete, El dilema del banquero central) son criterio de pedagogía que vale
 * para el Macro nuevo: una sola decisión, un solo toque, no tiene gesto
 * repetido que animar. Están en el commit de respaldo
 * (orquestador/conocimiento/macro-2026/respaldo-retiro.md).
 */
export const PREVIAS = {};

const MODULOS = {};

/**
 * La previsualización animada de una actividad, o `respaldo` —el icono
 * quieto— si es de las estáticas, si no tiene una o mientras se descarga.
 */
export default function PreviaActividad({ actividadId, respaldo = null }) {
  const previa = PREVIAS[actividadId];
  if (!previa || previa.tipo === "estatica") return respaldo;
  const Modulo = MODULOS[previa.tema];
  return (
    <Suspense fallback={respaldo}>
      <Modulo actividadId={actividadId} />
    </Suspense>
  );
}
