import { ACTIVO, PASIVO, PATRIMONIO, INGRESO, GASTO, COSTO } from "./contabilidad.js";

/*
 * ═══════════════════════════════════════════════════════════════════════════
 * A3 · EL CUADRO DE DINÁMICAS — el contenido.
 *
 * El cuadro resumen del libro (p. 87): seis familias, y qué les hace un
 * débito y qué les hace un crédito.
 *
 * ═══════════ AQUÍ NO HAY NI UN SOLO «+» NI UN SOLO «−» ═══════════
 *
 * Es lo más importante de este archivo. Las doce celdas del cuadro no están
 * escritas en ninguna parte: salen de CRECE_POR, que es la regla del capítulo
 * y la misma que usan la pieza de Aprender, las otras seis actividades y el
 * desafío. Si estuvieran tecleadas, este cuadro podría enseñar una cosa y el
 * resto del tema otra, y nada avisaría.
 *
 * Y la agrupación del final —la lección entera— tampoco está escrita: los dos
 * bloques son las familias que crecen por el debe y las que crecen por el
 * haber, preguntándoselo a la misma regla. Que el cuadro se parta en dos no
 * es una decisión de diseño: es lo que la regla dice cuando se la mira de
 * frente.
 *
 * ═══════════ SE LEVANTA EL ALCANCE RESTRINGIDO ═══════════
 *
 * Las dos primeras actividades trabajan solo con cuentas reales. Aquí entran
 * ingresos, gastos y costos a propósito: es justo donde la memorización se
 * rompe, y romperla en un cuadro que el estudiante está armando es mejor que
 * romperla en un examen.
 * ═══════════════════════════════════════════════════════════════════════════
 */

/*
 * El orden en que el libro lista las seis filas. Es lo único del cuadro que
 * se declara —un orden no se deduce de nada— y existe precisamente para que
 * el reordenamiento del final se note: las filas salen de aquí y terminan en
 * otro sitio.
 */
export const ORDEN_DEL_LIBRO = [ACTIVO, PASIVO, PATRIMONIO, INGRESO, GASTO, COSTO];

/* El cuadro nombra las familias en plural, salvo Patrimonio. */
export const NOMBRE_EN_EL_CUADRO = {
  [ACTIVO]: "Activos",
  [PASIVO]: "Pasivos",
  [PATRIMONIO]: "Patrimonio",
  [INGRESO]: "Ingresos",
  [GASTO]: "Gastos",
  [COSTO]: "Costos",
};

export const OBJETIVO = "Completa el cuadro que resume todo el capítulo: qué le hace el debe y qué le hace el haber a cada tipo de cuenta.";

export const SUBTEMA = "Reglas de registro por familia";

/*
 * ═══════════ LA DEVOLUCIÓN DE CADA FILA ═══════════
 *
 * La regla de cada fila es textual (p. 87). El POR QUÉ de ingresos, gastos y
 * costos se deriva de la ecuación de la p. 86 y es construcción de Gen, no
 * transcripción — queda anotado aquí porque el profesor lo pidió anotado.
 */
export const ACIERTO_POR_FAMILIA = {
  [ACTIVO]: "✅ Los activos crecen por el debe. Es la fila base: de aquí salen todas las demás.",
  [PASIVO]: "✅ Espejo exacto de los activos. Viven al otro lado de la ecuación, y crecen por el otro lado de la cuenta.",
  [PATRIMONIO]: "✅ Igual que el pasivo. Los dos están a la derecha de la ecuación.",
  [INGRESO]: "✅ Y esta es la fila que tumba a más gente. Los ingresos crecen por el haber, igual que el patrimonio — porque un ingreso aumenta el patrimonio.",
  [GASTO]: "✅ Los gastos van con los activos, crecen por el debe. La razón: un gasto disminuye el patrimonio, y lo que reduce el patrimonio va por el debe.",
  [COSTO]: "✅ Los costos se comportan igual que los gastos. Misma lógica, misma fila.",
};

/*
 * ═══════════ LAS CONFUSIONES ═══════════
 *
 * La ficha trae tres, y cada una viene con lo que se ve debajo del cuadro
 * mientras dura. La cuarta —fallar en la fila de los activos— NO está en la
 * ficha, y está marcada como mía.
 */
export const PATRON_POR_FAMILIA = {
  [INGRESO]: "A",
  [GASTO]: "B",
  [COSTO]: "B",
  [PASIVO]: "C",
  [PATRIMONIO]: "C",
  [ACTIVO]: "D",
};

export const ERRORES = {
  A: {
    texto: "❌ Aquí es donde casi todos se caen, y por una razón que tiene sentido: vender se siente como que algo entra. Y sí entra — pero lo que entra es la caja, y esa va al debe. El ingreso que lo explica va al haber. Son dos cuentas distintas del mismo asiento.",
    escena: "contrapartida",
  },
  B: {
    texto: "❌ Los gastos crecen por el debe, igual que los activos — pero por una razón distinta. Un gasto disminuye el patrimonio, y el patrimonio disminuye por el debe. No es que el gasto sea un activo: es que reducir el patrimonio y aumentar un activo se registran del mismo lado.",
    escena: "ecuacion",
    /* El término que se resalta es fijo: la explicación entera habla de él. */
    resaltar: PATRIMONIO,
    flechaAbajo: true,
  },
  C: {
    texto: "❌ Pasivos y Patrimonio crecen por el haber. Los dos viven a la derecha de la ecuación, y crecen por el lado derecho de la cuenta. Es la misma posición, repetida.",
    escena: "ecuacion",
    /* Aquí el término resaltado es el de la fila que se falló, no uno fijo. */
    resaltar: null,
  },
  /*
   * ── [ESCRITO POR CLAUDE, NO POR LA FICHA — PENDIENTE DE REVISIÓN] ──
   *
   * La ficha documenta tres confusiones y ninguna cubre la fila de los
   * activos, que también se puede fallar. Dejarla sin texto habría sido
   * dejar al estudiante viendo una celda vacía y ni una palabra.
   *
   * No afirma nada que el capítulo no diga: repite la regla de la fila base y
   * la posición del activo en la ecuación, que es lo que dice el acierto de
   * esa misma fila. La redacción es mía.
   */
  D: {
    texto: "❌ Un registro en el debe de una cuenta de activo la aumenta: es la fila base del cuadro. El activo vive a la izquierda de la ecuación, y crece por el lado izquierdo de la cuenta.",
    escena: "ecuacion",
    resaltar: ACTIVO,
  },
};

/* Las dos cuentas del asiento que explica el ingreso. Salen de la ficha. */
export const CONTRAPARTIDA_DEL_INGRESO = {
  debe: "Caja",
  haber: "Ingresos por servicios",
};

/* Cuánto dura en pantalla la escena del patrón A antes de desvanecerse. */
export const MS_CONTRAPARTIDA = 2000;

export const TEXTO_DE_AGRUPACION = "Mira lo que acabas de armar: no son seis reglas. Son dos. Un grupo crece por el debe, el otro por el haber. Todo el capítulo cabe ahí.";

/*
 * Rótulos de la interfaz. No son de la ficha: son las dos columnas del cuadro
 * del libro. La instrucción que iba aquí («Coloca el signo en la casilla de
 * débito», pendiente de revisión) la reemplazó la consigna de Gen, que vive
 * en `contabilidadConsignas.js`.
 */
export const COLUMNAS = { debe: "DEBE", haber: "HABER" };

/* La marca de la fila de Activos en la actividad real (Levi). */
export const MARCA_FILA_BASE = "fila base";
