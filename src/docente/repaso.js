/*
 * ═══════════════════════════════════════════════════════════════════════════
 * EL REPASO QUE SALE DEL DIAGNÓSTICO
 *
 * LA REGLA ES DE KAHOOT Y SE COPIA ENTERA PORQUE ES AUDITABLE
 * En su informe, una pregunta es «difícil» si la acertó menos del 35 % de la
 * clase, y el botón de armar un juego nuevo con esas preguntas aparece solo si
 * hay al menos tres. Los dos números están publicados, así que el profesor
 * puede saber por qué le salió el botón. Un umbral secreto produce un botón
 * mágico, y de un botón mágico se desconfía.
 *
 * QUÉ HACE AQUÍ Y QUÉ NO
 * Kahoot crea la actividad. Nosotros todavía no podemos: crear una actividad
 * asignada pide una tabla de asignaciones, su política de acceso y una
 * migración, y las migraciones las corre Mateo a mano. Lo que sí se puede hoy
 * —y es la mitad del valor— es dejar el repaso ESCRITO y listo para pegar en
 * la diapositiva del lunes o en el grupo del curso, con la pregunta, cuántos
 * la fallaron y en qué se equivocan.
 *
 * El error más común va dentro a propósito: es lo mejor del informe de
 * Nearpod y lo que convierte «falló la 7» en «falló la 7 y once de ellos
 * contestaron lo mismo», que ya no es un dato, es la clase que hay que dar.
 * ═══════════════════════════════════════════════════════════════════════════
 */

/* Los dos números de Kahoot, con su nombre, para que se puedan citar. */
export const UMBRAL_DIFICIL_PCT = 35;
export const MINIMO_PARA_REPASO = 3;

/**
 * Las preguntas difíciles de una actividad, de la peor a la menos mala.
 *
 * `items` es lo que devuelve panel_items: item_id, veces, fallos, pct_fallo,
 * respuesta_top, respuesta_top_veces. `etiquetar` traduce el id al enunciado
 * legible y puede devolver null: una pregunta sin nombre sigue contando para
 * la regla —falló igual— pero se muestra por su id, porque callarla sería
 * decirle al profesor que hay menos problemas de los que hay.
 */
export function preguntasDificiles(items = [], etiquetar = () => null) {
  return items
    .map((it) => {
      const veces = Number(it.veces ?? 0);
      const fallos = Number(it.fallos ?? 0);
      /* pct_fallo viene del servidor; si faltara, se recalcula en vez de
       * descartar la pregunta por un campo ausente. */
      const pctFallo = it.pct_fallo === null || it.pct_fallo === undefined
        ? (veces > 0 ? (fallos / veces) * 100 : 0)
        : Number(it.pct_fallo);
      return {
        item_id: it.item_id,
        etiqueta: etiquetar(it.item_id) || null,
        veces,
        fallos,
        pctFallo,
        pctAcierto: 100 - pctFallo,
        respuestaTop: it.respuesta_top ?? null,
        respuestaTopVeces: Number(it.respuesta_top_veces ?? 0),
      };
    })
    .filter((p) => p.veces > 0 && p.pctAcierto < UMBRAL_DIFICIL_PCT)
    .sort((a, b) => b.pctFallo - a.pctFallo || String(a.item_id).localeCompare(String(b.item_id)));
}

/** Si hay bastantes para que valga la pena ofrecer el repaso. */
export const hayRepaso = (dificiles) => dificiles.length >= MINIMO_PARA_REPASO;

/**
 * El guion, listo para pegar.
 *
 * Texto plano y no markdown: va a parar a una diapositiva, a un WhatsApp o al
 * chat del curso, y en ninguno de los tres se renderizan los asteriscos.
 */
export function guionDeRepaso({ actividadNombre, dificiles, fecha = new Date() }) {
  const dia = fecha.toISOString().slice(0, 10);
  const lineas = [
    `Repaso · ${actividadNombre}`,
    `${dificiles.length} ${dificiles.length === 1 ? "pregunta" : "preguntas"} que la clase falló (acierto por debajo del ${UMBRAL_DIFICIL_PCT}%) · ${dia}`,
    "",
  ];

  dificiles.forEach((p, i) => {
    lineas.push(`${i + 1}. ${p.etiqueta ?? p.item_id}`);
    lineas.push(`   Acertó el ${Math.round(p.pctAcierto)}% (${p.veces - p.fallos} de ${p.veces}).`);
    if (p.respuestaTop) {
      lineas.push(`   Se equivocan sobre todo con «${p.respuestaTop}» (${p.respuestaTopVeces} ${p.respuestaTopVeces === 1 ? "vez" : "veces"}).`);
    }
    lineas.push("");
  });

  return lineas.join("\n").trimEnd();
}
