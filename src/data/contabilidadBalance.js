import { ACTIVO, PASIVO, PATRIMONIO, CALEJA, LAVADO_DE_AUTOS } from "./contabilidad.js";

/*
 * ═══════════════════════════════════════════════════════════════════════════
 * A2 · ARMA EL BALANCE — el contenido.
 *
 * El estudiante clasifica cada cuenta y VE ARMARSE el balance real de la
 * empresa, renglón a renglón. No es una pregunta sobre categorías: es un
 * documento que se llena.
 *
 * ═══════════ LAS CIFRAS NO ESTÁN AQUÍ ═══════════
 *
 * Los dos balances son los saldos de los dos casos del capítulo, y salen
 * calculados de sus transacciones —las mismas que usan las otras actividades
 * y el desafío—. Este archivo dice qué cuentas entran en cada banco y qué se
 * le responde a cada una; los números los pone el mayor.
 *
 * ═══════════ TRES SECCIONES, NO CUATRO ═══════════
 *
 * El balance del libro subdivide activo y pasivo en corriente y no corriente.
 * Aquí no: esa subdivisión es contenido del capítulo 2, que este tema no ha
 * enseñado. Pedirla sería evaluar algo que nadie explicó.
 *
 * ═══════════ EL ENCABEZADO DE LAVADO VA SIN FECHA ═══════════
 *
 * El libro encabeza «A 31 de diciembre» un ejercicio que ocurre entero en
 * enero. No se corrige por cuenta propia y no se muestra una fecha que puede
 * ser errata: en pantalla van la razón social y el nombre del estado, y nada
 * más, hasta que el profesor confirme.
 * ═══════════════════════════════════════════════════════════════════════════
 */

export const SECCIONES = [
  { id: ACTIVO, nombre: "Activo", pie: "lo que la empresa tiene" },
  { id: PASIVO, nombre: "Pasivo", pie: "lo que le debe a terceros" },
  { id: PATRIMONIO, nombre: "Patrimonio", pie: "lo que la empresa les reconoce a los socios" },
];

/*
 * Los dos bancos: un balance real cada uno, y se sortea uno por intento.
 * Solo se nombran las cuentas — el saldo de cada una lo calcula el mayor.
 */
export const BANCOS_DE_BALANCE = [
  {
    id: "caleja",
    empresa: CALEJA.empresa,
    transacciones: CALEJA.transacciones,
    /* Sí lleva fecha: el ejercicio de Caleja no tiene la errata del otro. */
    fecha: null,
    /*
     * ═══════════ POR QUÉ ESTE BALANCE DICE «TRAS LAS PRIMERAS SEIS» ═══════════
     *
     * Caleja aparece en dos capítulos y en dos momentos: en el 2 lleva ocho
     * transacciones y cierra con 465.000 de activo; en el 3 se la mira tras
     * las seis primeras, con 415.000. No es una cifra en conflicto — es la
     * misma empresa en dos fotos. Pero sin decirlo, este balance parece
     * contradecir al del capítulo 2, y el estudiante que los vea juntos no
     * tiene forma de saber cuál creer.
     */
    subtitulo: "tras las primeras seis transacciones",
    fuente: "p. 94",
  },
  {
    id: "lavado",
    empresa: LAVADO_DE_AUTOS.empresa,
    transacciones: LAVADO_DE_AUTOS.transacciones,
    fecha: null,
    fuente: "p. 101",
  },
];

/*
 * ═══════════ LA RAZÓN DE CADA ACIERTO ═══════════
 *
 * Una por cuenta, porque «✅ Activo» no enseña nada: lo que enseña es POR QUÉ
 * esa cuenta concreta es un activo. Las que la ficha nueva trae escritas van
 * tal cual; las que no, se toman del banco anterior de esta misma actividad,
 * que también las escribió Gen para esas mismas cuentas.
 *
 * Las seis marcadas abajo no tienen texto en ninguno de los dos sitios.
 */
export const RAZON_POR_CUENTA = {
  /* ── De la ficha nueva, textuales ── */
  "Caja": "✅ Activo. La plata en caja es lo más básico que una empresa puede tener.",
  "Bancos": "✅ Activo. Es plata de la empresa, solo que guardada en el banco.",
  "Terrenos": "✅ Activo. El terreno es de la empresa, aunque no se pueda gastar.",
  "Cuentas por pagar": "✅ Pasivo. Es plata que la empresa le queda debiendo a alguien de afuera.",
  "Hipoteca por pagar": "✅ Pasivo. Es una deuda respaldada con algo que la empresa tiene.",
  "Aportes sociales": "✅ Patrimonio. Es lo que pusieron los socios, no una deuda con alguien de afuera.",
  "Acciones": "✅ Patrimonio. Es lo que la empresa les reconoce a quienes compraron sus acciones.",

  /* ── Del banco anterior de esta actividad, también de Gen ── */
  "Obligaciones financieras": "✅ Pasivo. Es lo que la empresa le debe a un banco.",
  "Letras por pagar": "✅ Pasivo. Es una deuda con un papel firmado de por medio.",

  /*
   * ── [ESCRITO POR CLAUDE, NO POR LA FICHA — PENDIENTE DE REVISIÓN] ──
   *
   * Estas seis son los activos no monetarios de los dos balances, y no tienen
   * texto propio ni en la ficha nueva ni en el banco anterior. Siguen el
   * patrón de la única de su clase que sí lo tiene —Terrenos, «un bien que la
   * empresa posee»— y cada una añade lo que la distingue. Ninguna afirma nada
   * que el capítulo no diga, pero la redacción es mía.
   */
  "Equipo de computación": "✅ Activo. Es una cosa que la empresa tiene y le dura años.",
  "Maquinaria": "✅ Activo. Es una cosa que la empresa tiene, aunque no se pueda gastar.",
  "Local comercial": "✅ Activo. El local es de la empresa y le dura años.",
  "Flota y equipo de transporte": "✅ Activo. Los vehículos son de la empresa y le duran años.",
  "Muebles y enseres": "✅ Activo. Los muebles son de la empresa y le duran años.",
  "Construcciones y edificaciones": "✅ Activo. Lo construido es de la empresa y le dura años.",
};

/*
 * ═══════════ LAS SEIS CONFUSIONES, UNA POR CRUCE ═══════════
 *
 * Con tres secciones hay seis formas de equivocarse, y cada una es un error
 * distinto: confundir tener con deber no es lo mismo que confundir a quién se
 * le debe. La llave es «de dónde venía → dónde lo puso».
 *
 * Se retira el atajo anterior —«los pasivos suelen llevar por pagar en el
 * nombre»— porque falla con Obligaciones financieras, que es un pasivo y no
 * lo lleva.
 */
export const ERROR_POR_CRUCE = {
  [`${ACTIVO}>${PASIVO}`]: {
    texto: "❌ Pregúntate una sola cosa: ¿la empresa lo tiene, o lo debe? Aquí lo tiene.",
    resaltar: [{ seccion: ACTIVO, rotulo: "lo que tiene" }],
  },
  [`${ACTIVO}>${PATRIMONIO}`]: {
    texto: "❌ Esto sí es una cosa que la empresa tiene. El patrimonio no son cosas: es lo que la empresa les reconoce a los socios.",
    resaltar: [{ seccion: ACTIVO, rotulo: "bienes" }, { seccion: PATRIMONIO, rotulo: "de los socios" }],
  },
  [`${PASIVO}>${ACTIVO}`]: {
    texto: "❌ Al revés: esto la empresa lo debe, no lo tiene. Es una obligación con alguien de afuera.",
    resaltar: [{ seccion: PASIVO, rotulo: "lo que debe" }],
  },
  [`${PASIVO}>${PATRIMONIO}`]: {
    texto: "❌ Casi. Las dos van del mismo lado del informe. Pero el pasivo se le debe a alguien de afuera, y el patrimonio es lo que la empresa les reconoce a los socios.",
    resaltar: [{ seccion: PASIVO, rotulo: "a terceros" }, { seccion: PATRIMONIO, rotulo: "a los socios" }],
  },
  [`${PATRIMONIO}>${ACTIVO}`]: {
    texto: "❌ El aporte de los socios no es una cosa que la empresa tenga. Es de dónde salió lo que tiene.",
    /* Si Caja ya está escrita, se resalta junto a la ficha: ahí se ve la pareja. */
    resaltar: [{ seccion: PATRIMONIO, rotulo: "de dónde salió" }],
    conectarCon: "Caja",
  },
  [`${PATRIMONIO}>${PASIVO}`]: {
    texto: "❌ Casi. Las dos van del mismo lado del informe. Pero el pasivo se le debe a alguien de afuera, y el patrimonio es lo que la empresa les reconoce a los socios.",
    resaltar: [{ seccion: PASIVO, rotulo: "a terceros" }, { seccion: PATRIMONIO, rotulo: "a los socios" }],
  },
};

export const TITULO_ESTADO = "Estado de situación financiera";

/* El separador del encabezado, para que los dos sitios lo escriban igual. */
export const SEPARADOR_ENCABEZADO = " · ";

/*
 * ═══════════ LOS ÍTEMS QUE YA JUGARON ESTUDIANTES ═══════════
 *
 * El banco anterior era una lista de doce cuentas sueltas; el nuevo son dos
 * balances. Los ítems son otros, así que los ids viejos ya no están en el
 * banco — pero sus filas siguen en el servidor, y el panel docente tiene que
 * poder leerlas. Esto es solo para eso: qué cuenta era cada id viejo.
 */
export const ITEMS_HISTORICOS = {
  "cu2-01": "Terreno",
  "cu2-02": "Obligaciones financieras",
  "cu2-03": "Aportes sociales",
  "cu2-04": "Equipos de oficina",
  "cu2-05": "Salarios por pagar",
  "cu2-06": "Inventario de mercancías",
  "cu2-07": "Depósitos en garantía",
  "cu2-08": "Cuentas por pagar",
  "cu2-09": "Caja",
  "cu2-10": "Bancos",
  "cu2-11": "Letras por pagar",
  "cu2-12": "Acciones",
};
