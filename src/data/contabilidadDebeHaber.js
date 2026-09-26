import { CALEJA } from "./contabilidad.js";
import { TRANSACCIONES_SUELTAS } from "./contabilidadActividades.js";

/*
 * ═══════════════════════════════════════════════════════════════════════════
 * APRENDER · «EL DEBE Y EL HABER» — el contenido.
 *
 * La pieza ataca una confusión que está documentada como estructural: creer
 * que débito significa «aumenta» y crédito «disminuye». No la corrige después
 * de que aparezca — la previene, enseñando desde el segmento central DOS
 * transacciones a la vez, las dos con un débito de $50.000, con efectos
 * opuestos.
 *
 * ═══════════ AQUÍ NO HAY NI UNA CIFRA ESCRITA A MANO ═══════════
 *
 * Las dos transacciones son `cal-3` y `cal-6` del caso de Caleja, que ya
 * estaba en contabilidad.js; los saldos previos, el efecto de cada débito y
 * el saldo de la Caja del segmento 5 se CALCULAN de ahí. Lo único escrito en
 * este archivo son las frases, y todas son de la ficha.
 *
 * Por qué importa: si alguien corrigiera una cifra del capítulo, una pieza
 * con los números transcritos seguiría enseñando los viejos —y esta pieza
 * existe justamente para que el estudiante confíe en lo que ve.
 * ═══════════════════════════════════════════════════════════════════════════
 */

/* Las dos del par: único del capítulo con idéntico monto en el débito. */
export const TRANSACCION_C = "cal-3";
export const TRANSACCION_F = "cal-6";

/* El contraejemplo obligatorio: el préstamo de $500 del ejemplo 2 (p. 89). */
export const EJEMPLO_DOS = "cu6-pagare";

/*
 * El saldo con el que la Caja llega al ejemplo 2. Es del libro (p. 90,
 * acumulado del ejemplo 1) y no sale de ninguna estructura del repo, así que
 * se declara aquí y una prueba comprueba que 1.000 + 500 da los 1.500 que la
 * capa 3 usa como saldo inicial de la Caja.
 */
export const CAJA_ANTES_DEL_EJEMPLO_DOS = 1000;

export const PIEZA_DEBE_Y_HABER = {
  id: "cu-a5-debe-y-haber",
  titulo: "El debe y el haber",
  subtema: "Naturaleza del debe y el haber",

  objetivo: "El debe y el haber son lados de una cuenta — izquierda y derecha —, y cuál de los dos la hace crecer depende de qué tipo de cuenta sea.",

  /* ── CAPA 1 ── */
  nombres: [
    { termino: "Cuenta", textual: true,
      definicion: "«un sistema de registro organizado, de los aumentos o disminuciones que sufre un concepto como consecuencia de las operaciones que realiza un negocio»." },
    { termino: "Debe", definicion: "el lado izquierdo. Lo que se escribe ahí es un débito." },
    { termino: "Haber", definicion: "el lado derecho. Lo que se escribe ahí es un crédito." },
    { termino: "Movimiento débito y movimiento crédito",
      definicion: "la suma de todo lo registrado en cada lado." },
    { termino: "Saldo",
      definicion: "la diferencia entre los dos movimientos. Va del lado del movimiento mayor." },
    { termino: "Desde ya",
      definicion: "Debe y haber no significan «más» y «menos». Significan izquierda y derecha. Cuál de los dos hace crecer una cuenta depende del tipo de cuenta — y eso es lo que vas a ver." },
  ],

  /*
   * ── CAPA 2 ──
   *
   * Cinco segmentos, y ninguno avanza solo: cada uno se detiene al terminar y
   * espera a que el estudiante pulse. Es el efecto de información transitoria
   * (Mayer; Rey 2012) — una animación que sigue corriendo obliga a recordar lo
   * que ya pasó mientras se atiende a lo que pasa.
   */
  segmentos: [
    {
      id: "nace",
      nombre: "La cuenta nace",
      texto: "Una cuenta no es más que esto: un nombre y un espacio partido en dos. Esa raya del medio es todo el sistema.",
      representa: "la división del espacio en dos mitades, que es lo único que constituye una cuenta",
      alterno: "Cuenta T vacía, con el nombre arriba y una línea vertical que parte el espacio en dos mitades.",
    },
    {
      id: "lados",
      nombre: "Los lados se nombran por dónde están",
      texto: "El izquierdo se llama debe; el derecho, haber. Se llaman así por dónde están, no por lo que hacen — igual que «norte» no significa «bueno».",
      representa: "que el nombre del lado viene de su posición y no de un efecto",
      alterno: "La misma cuenta, ahora con el rótulo DEBE sobre la mitad izquierda y HABER sobre la derecha.",
    },
    {
      id: "dos-casos",
      nombre: "El mismo débito, efectos opuestos",
      /* Los textos de este segmento van por tiempo: ver TIEMPOS, abajo. */
      texto: "El mismo monto. El mismo lado. Dos transacciones que cuadran perfecto. Y una cuenta subió mientras la otra bajó. Fíjate dónde está el ▲ en cada una: ahí está la respuesta.",
      representa: "que un registro en el debe no tiene efecto propio; lo decide la familia de la cuenta que lo recibe, marcada por el lado donde está su ▲",
      alterno: "Dos transacciones de 50.000 al debe. En la primera, Maquinaria pasa de 0 a 50.000. En la segunda, Aportes sociales pasa de 400.000 a 350.000.",
    },
    {
      id: "causa",
      nombre: "La causa real, y el contraejemplo",
      texto: "Aquí está la razón, y es más simple de lo que parece: cada cuenta crece por el mismo lado en que vive dentro de la ecuación. El activo vive a la izquierda, así que crece por la izquierda de su cuenta — o sea, por el debe. El pasivo y el patrimonio viven a la derecha, así que crecen por el haber.",
      representa: "la correspondencia entre el lado de la ecuación donde vive la cuenta y el lado de su propia T por el que crece",
      alterno: "Maquinaria conectada al término ACTIVO del lado izquierdo de la ecuación, con su triángulo sobre el debe. Aportes sociales conectada a PATRIMONIO del lado derecho, con su triángulo sobre el haber.",
      /*
       * La parte B es OBLIGATORIA: sin ella la pieza arregla una confusión y
       * deja instalada otra —que activo y pasivo se mueven siempre en sentido
       * contrario—, que el ejemplo 2 del libro desmiente.
       */
      contraejemplo: {
        texto: "Y cuidado con una trampa: que crezcan por lados distintos no significa que se muevan en sentido contrario. Mira este préstamo del libro — sube la Caja y sube la deuda, las dos al mismo tiempo. Los dos lados de la ecuación pueden crecer juntos sin problema. Lo que cambia entre cuentas es por cuál lado crecen, no si crecen.",
        representa: "que la correspondencia de posición no implica movimiento inverso",
        alterno: "Préstamo de 500: Caja sube de 1.000 a 1.500 y Documentos por pagar nace en 500. Las dos suben al mismo tiempo.",
      },
    },
    {
      id: "saldo",
      nombre: "Dónde queda el saldo",
      texto: "Cada lado se suma por separado: 1.500 a la izquierda, 150 a la derecha. El lado chico consume al grande, y lo que queda en pie es el saldo — 1.350, del lado que sobrevivió.",
      representa: "la resta entre los dos movimientos, y la regla de que el saldo se coloca del lado del movimiento mayor",
      alterno: "Cuenta Caja con 1.500 al debe y 150 al haber. Tras cancelar, quedan 1.350 en pie del lado del debe, con el marcador de saldo debajo.",
    },
  ],

  /*
   * Los cinco tiempos del segmento central. La regla que los ordena es una y
   * no es negociable: en los tiempos 1, 2 y 3 no puede haber NINGÚN rastro de
   * la contrapartida. Si el estudiante ve que «falta algo abajo», deduce que
   * hay una segunda cuenta y se pone a razonar sobre el asiento completo en
   * vez de sobre el contraste, que es lo que la pieza mide.
   */
  tiempos: [
    { id: "caen", contrapartidas: false, enunciados: false, reaccion: false, ms: 600 },
    { id: "prediccion", contrapartidas: false, enunciados: false, reaccion: false, ms: 0 },
    { id: "reaccion", contrapartidas: false, enunciados: false, reaccion: true, ms: 800 },
    { id: "contrapartidas", contrapartidas: true, enunciados: false, reaccion: true, ms: 600 },
    { id: "enunciados", contrapartidas: true, enunciados: true, reaccion: true, ms: 300 },
  ],

  prediccion: {
    texto: "Las dos fichas ya están puestas en el debe, y las dos transacciones cuadran. ¿Las dos cuentas van a reaccionar igual?",
    opciones: [
      { id: "igual", nombre: "Sí, las dos igual" },
      { id: "distinto", nombre: "No, distinto" },
    ],
  },

  /* Lo que se dice al revelar los enunciados, en el tiempo 5. */
  textoEnunciados: "Ahora sí, mira de dónde salía cada una.",

  /*
   * La precisión que la v4.1 corrigió: decir que la ÚNICA variable es la
   * familia sería falso, porque las contrapartidas también difieren. Por eso
   * se revelan después de la predicción y no antes.
   */
  notaDeVariable: "El monto y el lado del débito son idénticos en los dos casos. Lo que cambia es la familia de la cuenta que lo recibe — y también su contrapartida, que por eso se revela después de la predicción y no antes.",

  /* ── CAPA 3 ── */
  exploracion: {
    fichas: [100, 500, 1000],
    invitacion: "Toma una ficha y suéltala en cualquiera de los dos lados.",
    avisoContrapartida: "Aquí solo estás viendo cómo reacciona una cuenta por dentro. Cada operación real tiene su contrapartida en otra cuenta — eso lo vas a armar en la siguiente pieza.",
    /*
     * Esta línea existe porque la regla de p. 87 dice QUÉ pasa con gastos e
     * ingresos pero no POR QUÉ. La derivación desde la ecuación es de Gen y
     * está marcada como tal en la nota de fuente del encargo.
     */
    lineaGastosIngresos: "Gastos e ingresos no son activos ni pasivos: afectan el patrimonio. Un gasto lo disminuye, y lo que disminuye el patrimonio se registra en el debe. Un ingreso lo aumenta, y eso va en el haber. Por eso el gasto termina creciendo por el mismo lado que un activo — pero por una razón distinta.",
    /*
     * El ▲ de cada una NO se escribe: sale de CRECE_POR, que es la regla del
     * capítulo ya codificada. Aquí solo van el nombre y el saldo de partida.
     */
    cuentas: [
      { cuenta: "Caja", saldoInicial: 1500, fuente: "p. 90, acumulado ejemplos 1 y 2" },
      { cuenta: "Aportes sociales", saldoInicial: 400000, fuente: "p. 93, antes de la transacción f" },
      { cuenta: "Gastos de operación", saldoInicial: 0, fuente: "p. 113" },
      { cuenta: "Ingresos por servicios", saldoInicial: 0, fuente: "p. 113" },
    ],
  },

  /* ── CAPA 4 ── */
  pregunta: "Las dos transacciones tenían un débito de $50.000. ¿Por qué Maquinaria subió y Aportes sociales bajó?",
  opciones: [
    {
      id: "ecuacion",
      correcta: true,
      texto: "Porque el activo vive a la izquierda de la ecuación y crece por la izquierda de su cuenta; el patrimonio vive a la derecha y crece por la derecha.",
      feedback: "Correcto. Cada cuenta crece por el mismo lado en que vive dentro de la ecuación. El débito no significa «aumentar»: significa «lado izquierdo», y a Aportes sociales el lado izquierdo la reduce.",
      visual: "ecuacion",
    },
    {
      id: "negativo",
      correcta: false,
      texto: "Porque el patrimonio es negativo: son cuentas que valen en contra.",
      feedback: "No. Un aporte de $350.000 es tan real y tan positivo como $240.000 en caja — ninguno es un número negativo. Lo que cambia no es el signo: es de qué lado de la igualdad vive cada uno, y por lo tanto por cuál lado crece.",
      visual: "ninguna-negativa",
    },
    {
      id: "saldo-previo",
      correcta: false,
      texto: "Porque una cuenta tenía mucho más saldo que la otra.",
      feedback: "El saldo previo no predice nada, y lo puedes comprobar con tres casos que ya viste. Maquinaria arrancó en 0 y subió. Caja, en el préstamo del ejemplo 2, arrancó en 1.000 — ya tenía plata — y también subió. Aportes sociales arrancó en 400.000 y bajó. Dos saldos distintos con el mismo resultado, y uno distinto con el resultado opuesto: el número no manda. Mira dónde está el ▲ de cada una y vas a ver que ese sí acierta las tres veces.",
      visual: "tres-casos",
      rotulos: {
        saldo: "El saldo previo: 0, 1.000, 400.000 — no predice.",
        triangulo: "El ▲: acierta las tres.",
      },
    },
    {
      id: "sentido-contrario",
      correcta: false,
      texto: "Porque cuando un lado de la ecuación sube, el otro tiene que bajar.",
      feedback: "Esa es la trampa del tema, y es falsa. Mira otra vez el préstamo del segmento anterior: sube la Caja y sube la deuda, las dos a la vez. Los dos lados pueden crecer juntos. Lo que cambia entre familias es por cuál lado crecen, no si crecen.",
      visual: "contraejemplo",
    },
  ],
};

/* Las cuatro cuentas de la capa 3, con el nombre que el capítulo les da. */
export const CUENTAS_DE_LA_EXPLORACION = PIEZA_DEBE_Y_HABER.exploracion.cuentas.map((c) => c.cuenta);

/* La transacción del contraejemplo, tal como está en el repo. */
export const transaccionDelEjemploDos = () =>
  TRANSACCIONES_SUELTAS.find((t) => t.id === EJEMPLO_DOS) ?? null;

export const transaccionDeCaleja = (id) => CALEJA.transacciones.find((t) => t.id === id) ?? null;
