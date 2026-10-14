import { lazy, Suspense } from "react";

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

export const PREVIAS = {
  /* Política Económica */
  "diagnostico-en-vivo": { tema: "economica", tipo: "propia" },
  "arma-grupo-logico": { tema: "economica", tipo: "gesto" },
  "tablero-decisiones": { tema: "economica", tipo: "clip" },
  "quien-gana-quien-pierde": { tema: "economica", tipo: "gesto" },
  "corriente-titulares": { tema: "economica", tipo: "propia" },
  /*
   * Identificada: su animación es la respuesta del sistema (la onda al
   * transmitir), no el gesto del estudiante (elegir y ordenar fragmentos).
   * Se queda por ser su movimiento propio y real; en revisión de pedagogía.
   */
  "explica-la-politica": { tema: "economica", tipo: "propia" },
  "simulador-de-crisis": { tema: "economica", tipo: "gesto" },

  /* Demanda Agregada */
  "electrocardiograma": { tema: "demanda", tipo: "gesto" },
  "termometro-reacciones": { tema: "demanda", tipo: "gesto" },
  "banco-transfusiones": { tema: "demanda", tipo: "gesto" },
  "biopsia-economica": {
    tipo: "estatica",
    /*
     * NO ES UN OLVIDO. Biopsia es una sola pregunta: el estudiante lee el caso
     * y toca una opción, una vez. No hay una acción repetida de la que sacar un
     * movimiento honesto. Pedagogía probó dos flechas empujando en sentidos
     * contrarios y la descartó: eso ilustra el CONTENIDO del caso —las señales
     * encontradas—, no el GESTO del estudiante. No le pongas una animación.
     */
    razon: "Una sola pregunta, un solo toque: no hay gesto repetido que animar. Dos flechas opuestas ilustrarían el contenido del caso, no el gesto.",
  },
  "triage-emergencias": { tema: "demanda", tipo: "gesto" },
  "cirugia-reconstruccion": { tema: "demanda", tipo: "gesto" },
  "sala-monitores": { tema: "demanda", tipo: "gesto" },

  /* Política Fiscal */
  "clasificador-tesoro": { tema: "fiscal", tipo: "propia" },
  "directos-indirectos": { tema: "fiscal", tipo: "propia" },
  "flujo-de-caja": { tema: "fiscal", tipo: "gesto" },
  "agujero-fiscal": {
    tipo: "estatica",
    /*
     * NO ES UN OLVIDO, y el mismo razonamiento que Biopsia, no un caso aparte
     * por el nombre. Se leen el caso y cuatro opciones y se toca una, una vez.
     * Pedagogía probó un hueco llenándose —literal al nombre— y lo descartó:
     * prometería arrastrar y llenar, una interacción que la actividad no
     * tiene. Es exactamente la miniatura que miente. No le pongas una animación.
     */
    razon: "Una sola decisión, un solo toque: no hay gesto repetido que animar. Un hueco llenándose prometería arrastrar y llenar, que la actividad no tiene.",
  },
  "expansiva-contractiva": { tema: "fiscal", tipo: "gesto" },
  "disena-presupuesto": { tema: "fiscal", tipo: "gesto" },
  /*
   * No está en la ficha de pedagogía, que cubrió las quince sin movimiento
   * propio. Esta sí lo tiene —el papel que cae, cada vez más rápido— y se
   * miniaturiza como las otras "propias", con sus cuatro bandejas para que no
   * sea el Clasificador repetido.
   */
  "deficit-vs-deuda": { tema: "fiscal", tipo: "propia" },

  /*
   * Los quince de la 0030, en su propio módulo (previasBloques.jsx): la mitad
   * comparten gesto entre temas a propósito, y repartirlos obligaría a copiar.
   */
  "memorama-tesoro": { tema: "bloques", tipo: "gesto" },
  "que-rama-es": { tema: "bloques", tipo: "gesto" },
  "se-acerca-o-se-aleja": { tema: "bloques", tipo: "gesto" },
  "expediente-gabinete": {
    tipo: "estatica",
    /*
     * NO ES UN OLVIDO, y es el mismo criterio que Biopsia y El agujero fiscal:
     * se lee un caso y se toca una opción, una vez. La ficha traía un gesto —la
     * carpeta que se entreabre— y se llegó a hacer; se quitó para que las tres
     * actividades de una sola decisión se traten igual. Tres con el mismo
     * criterio es coherencia; dos y una excepción, un descuido. No le pongas
     * una animación.
     */
    razon: "Una sola decisión, un solo toque: no hay gesto repetido que animar. Mismo criterio que Biopsia y El agujero fiscal; una carpeta que se abre ilustraría leer, no decidir.",
  },
  "consejo-ministros": { tema: "bloques", tipo: "gesto" },
  "memorama-corazon": { tema: "bloques", tipo: "gesto" },
  "cual-componente": { tema: "bloques", tipo: "gesto" },
  "quien-beneficia-auge": { tema: "bloques", tipo: "gesto" },
  "explica-paciente": { tema: "bloques", tipo: "gesto" },
  "sala-espera-llena": { tema: "bloques", tipo: "gesto" },
  "memorama-tesoreria": { tema: "bloques", tipo: "gesto" },
  "cobra-gasta-o-pide": { tema: "bloques", tipo: "gesto" },
  "quien-afecta-ajuste": { tema: "bloques", tipo: "gesto" },
  "explica-contribuyente": { tema: "bloques", tipo: "gesto" },
  "comite-presupuesto": { tema: "bloques", tipo: "gesto" },

  /* Política Monetaria (0031): en el mismo módulo, porque seis comparten gesto con otras. */
  "memorama-banco-central": { tema: "bloques", tipo: "gesto" },
  "quien-decide-esto": { tema: "bloques", tipo: "gesto" },
  "volante-de-la-tasa": { tema: "bloques", tipo: "gesto" },
  "caja-de-herramientas": { tema: "bloques", tipo: "gesto" },
  "a-quien-le-pega-la-tasa": { tema: "bloques", tipo: "gesto" },
  "cadena-de-transmision": { tema: "bloques", tipo: "gesto" },
  "explicaselo-a-un-deudor": { tema: "bloques", tipo: "gesto" },
  "corriente-de-decisiones": { tema: "bloques", tipo: "gesto" },
  /* Las dos nuevas reusan el gesto de su hermana (Xeno): misma mecánica, mismo gesto. */
  "por-cual-arteria-entra": { tema: "bloques", tipo: "gesto" },
  "las-dos-entradas": { tema: "bloques", tipo: "gesto" },
  "el-rezago": { tema: "bloques", tipo: "gesto" },
  "crea-o-cambia-de-manos": { tema: "bloques", tipo: "gesto" },
  "la-escalera-del-encaje": { tema: "bloques", tipo: "gesto" },
  "dilema-banquero-central": {
    tipo: "estatica",
    /*
     * NO ES UN OLVIDO: decisión explícita de la ficha. Una sola pregunta,
     * 100 % o 0 %, la misma forma que Biopsia, El agujero fiscal y El
     * expediente del gabinete. No le pongas una animación aunque el resto del
     * bloque la tenga.
     */
    razon: "Una sola pregunta, 100 % o 0 %: no hay gesto repetido del cual derivar movimiento honesto, y animarla prometería una interacción que la actividad no tiene.",
  },
  "duelo-de-instrumentos": { tema: "bloques", tipo: "gesto" },
  "disena-respuesta-monetaria": { tema: "bloques", tipo: "gesto" },
};

const MODULOS = {
  economica: lazy(() => import("./previasEconomica.jsx")),
  demanda: lazy(() => import("./previasDemanda.jsx")),
  fiscal: lazy(() => import("./previasFiscal.jsx")),
  bloques: lazy(() => import("./previasBloques.jsx")),
};

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
