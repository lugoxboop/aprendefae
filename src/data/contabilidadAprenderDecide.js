import { LAVADO_DE_AUTOS, pesos } from "./contabilidad.js";

/*
 * ═══════════════════════════════════════════════════════════════════════════
 * LAS DECISIONES DE LA CAPA 4 · «LAS CUENTAS, EL DEBE Y EL HABER».
 *
 * Datos puros, sin React: los pinta CapaCuatroDecide.jsx. Cada pieza trae DOS
 * decisiones de tipo distinto sobre el MISMO caso —una de clasificación y una
 * de consecuencia— porque la misma pregunta sobre otro caso no es una
 * decisión distinta (lectura estricta de D4, Miku 17-oct).
 *
 * `estado(eleccion)` devuelve lo que la figura tiene que mostrar DESPUÉS de
 * esa elección, incluida la mala: el estudiante ve lo que su respuesta
 * implica antes de que le digan si estuvo bien.
 *
 * Cada opción mala lleva su propio `msg`, atado a un error conceptual
 * distinto. No hay un «No va aquí» genérico: si el mensaje no explica cuál
 * confusión delata la opción, la opción está mal escrita.
 *
 * CERO FP: material teórico. Nada de esto llama a registrar_fp.
 * ═══════════════════════════════════════════════════════════════════════════
 */

/* ───────── 1 · De qué está hecha una cuenta ─────────
 * El caso es el de la pregunta que esta capa ya hacía: movimiento débito de
 * $50, crédito de $30. Primero de qué lado queda el saldo (clasificación);
 * después cuánto es (consecuencia). La figura es la misma cuenta en los dos
 * pasos, y cambia: primero se enciende un lado, después aparece el saldo.
 */
const CASO_A1 = { cuenta: "Una cuenta cualquiera", debitos: [{ valor: 50 }], creditos: [{ valor: 30 }] };

export const DECIDE_A1 = {
  id: "cu-a1-anatomia-de-una-cuenta",
  inicial: { ...CASO_A1, cancelar: false, lado: null },
  decisiones: [
    {
      clave: "lado",
      pregunta: "Esta cuenta tiene movimiento débito de $50 y movimiento crédito de $30. ¿De qué lado queda el saldo?",
      opciones: [
        { id: "debe", t: "En el debe, a la izquierda", correcta: true },
        { id: "haber", t: "En el haber, a la derecha",
          msg: "El saldo no se coloca del lado del movimiento menor. Va del lado que pesó más, y aquí pesó más el débito: $50 contra $30." },
        { id: "cero", t: "En ninguno: la cuenta queda en cero",
          msg: "Los dos movimientos tendrían que ser iguales para cancelarse. $50 contra $30 deja diferencia, y esa diferencia es el saldo." },
      ],
      porque: "El saldo se coloca del lado que tuvo el movimiento mayor, y aquí el mayor es el débito.",
      pista: "Compare los dos movimientos y quédese con el lado del más grande. No importa todavía cuánto es.",
      /*
       * «Queda en cero» no puede dejar la figura igual que estaba: sería la
       * única elección sin consecuencia visible. Así que se cancela de verdad
       * delante del estudiante, y lo que ve contradice lo que dijo: quedan
       * $20 en pie. Las otras dos encienden el lado que eligió.
       */
      estado: (eleccion) => (eleccion === "cero"
        ? { ...CASO_A1, cancelar: true, lado: null }
        : { ...CASO_A1, cancelar: false, lado: eleccion }),
    },
    {
      clave: "cuanto",
      pregunta: "Ya sabe de qué lado. ¿Cuánto es el saldo?",
      opciones: [
        { id: "20", t: "$20", correcta: true },
        { id: "80", t: "$80",
          msg: "Eso es la suma de los dos movimientos. El saldo es la diferencia, no la suma: por eso un lado consume al otro." },
        { id: "50", t: "$50",
          msg: "Ése es el movimiento débito entero, como si el crédito no existiera. Los $30 de la derecha ya consumieron su parte." },
      ],
      porque: "$50 menos $30. La diferencia entre los dos movimientos, del lado del mayor.",
      pista: "Reste el movimiento menor del mayor. Mire la figura: lo que queda en pie después de cancelar.",
      estado: (eleccion) => ({ ...CASO_A1, cancelar: eleccion === "20", lado: "debe" }),
    },
  ],
  cierre: "Eso es todo lo que hace una cuenta: dos lados, dos movimientos y una diferencia que se queda del lado que pesó más.",
};

/* ───────── 2 · Las dos familias de cuentas ─────────
 * El caso es UNA de las seis cuentas que esta pieza tiene sobre la mesa:
 * «Ingresos por ventas». Primero a qué familia pertenece (clasificación) y
 * después qué le hace el cierre del año a su saldo (consecuencia). La segunda
 * no se puede ni formular sin la primera, porque el cierre solo vacía a las
 * transitorias: si la cuenta fuera real, la pregunta no existiría.
 *
 * La figura son los dos cajones de la capa 2 —la misma escena, no un dibujo
 * nuevo— y cada opción la deja distinta: enciende un cajón, enciende el otro,
 * o deshace el reparto y devuelve las seis cuentas a la mesa.
 */
const CUENTA_A2 = "Ingresos por ventas";

export const DECIDE_A2 = {
  id: "cu-a2-dos-familias",
  figura: "familias",
  /* «ambas» es la mesa repartida sin nadie señalado: así abre la pieza. */
  inicial: { resaltar: "ambas" },
  decisiones: [
    {
      clave: "familia",
      pregunta: `«${CUENTA_A2}» es la cuenta donde se anota lo que el negocio le cobró a sus clientes. ¿En cuál de los dos cajones va?`,
      opciones: [
        { id: "transitorias", t: "En el de las transitorias", correcta: true },
        { id: "reales", t: "En el de las reales: lo que entró es dinero de verdad",
          msg: `El dinero que entró sí es tangible, y está en Caja o en Bancos, que son reales. Pero «${CUENTA_A2}» no guarda ese dinero: mide cuánto se vendió en el periodo. Mire el cajón que encendió — la cuenta no está entre sus tres.` },
        { id: "ambos", t: "En los dos: es un ingreso y además es plata que la empresa tiene",
          msg: "Una cuenta pertenece a una sola familia, y el criterio del cierre es lo que decide: en los dos cajones a la vez, su saldo tendría que sobrevivir al 31 de diciembre y volver a cero el mismo día. Sin un cajón donde caer, las seis se quedan sobre la mesa." },
      ],
      porque: "Los ingresos nacen de las operaciones del periodo, así que se cierran con él. De ahí sus tres nombres: transitorias, nominales, de resultados.",
      pista: "No pregunte si el valor es tangible. Pregunte si su saldo sigue ahí el 1 de enero del año siguiente.",
      /*
       * Los ids son el mismo vocabulario que entiende la escena, así que las
       * dos buenas opciones encienden su cajón sin traducción. «En los dos»
       * no tiene cajón: se cae el reparto entero, que es exactamente lo que
       * la respuesta implica.
       */
      estado: (eleccion) => ({ resaltar: eleccion === "ambos" ? "raiz" : eleccion }),
    },
    {
      clave: "cierre",
      pregunta: `Es transitoria. Llega el 31 de diciembre y se cierra el ejercicio. ¿Con qué saldo arranca enero «${CUENTA_A2}»?`,
      opciones: [
        { id: "cero", t: "En cero: el periodo nuevo arranca limpio", correcta: true },
        { id: "conserva", t: "Con el mismo saldo, igual que la cuenta Caja",
          msg: "Eso es lo que hacen las reales: Caja amanece el 1 de enero con lo que tenía el 31 de diciembre. Para que los ingresos hicieran lo mismo, el calendario tendría que quedarse quieto —mire, los dos cajones siguen llenos y el año no ha cerrado— y el periodo siguiente heredaría ventas que no hizo." },
        { id: "borrada", t: "En cero, y el saldo del año anterior se borra de los libros",
          msg: "Cerrar no es borrar. El saldo se traslada al resultado del ejercicio y los renglones que lo formaron se quedan donde están; por eso el año pasado todavía se puede consultar. Mire cómo quedarían los libros si se borrara: los dos cajones en blanco." },
      ],
      porque: "Las transitorias miden el periodo, así que mueren con él. Ese es el criterio entero: el saldo que no sobrevive al cierre es de una cuenta transitoria.",
      pista: "Mire el cajón de las transitorias cuando el calendario llega al 31 de diciembre.",
      /*
       * «Conserva» NO puede dejar la figura como la dejó la decisión 1 —ahí
       * quedó el cajón de las transitorias encendido— porque entonces elegir
       * esa opción no movería nada y la decisión no se vería. Así que lo que
       * pinta es un año que no cerró: los dos cajones llenos y el calendario
       * todavía «durante el año», que es lo que su respuesta exige para ser
       * verdad. «Borrada» vacía los dos, que es como quedarían los libros.
       */
      estado: (eleccion) => ({
        resaltar: eleccion === "cero" ? "cierre" : eleccion === "conserva" ? "ambas" : "raiz",
      }),
    },
  ],
  cierre: "Dos cajones y una sola pregunta: ¿el saldo sobrevive al cierre? Si sí, es real. Si vuelve a cero, es transitoria. No hay un tercer criterio.",
};

/* ───────── 3 · La partida doble y las dos reglas ─────────
 * El caso es la primera transacción del capítulo —los accionistas depositan
 * el aporte en el banco—, la misma cifra que ya mueve la balanza de la capa 2.
 * Primero por qué lado entra el aumento del activo (clasificación: regla 1
 * contra regla 2) y después qué segundo renglón devuelve la balanza al centro
 * (consecuencia). La segunda pregunta solo existe porque la primera dejó la
 * balanza caída.
 *
 * La figura es la `Balanza` que ya existe, con los dos totales del asiento en
 * los platillos y el nombre de la cuenta que cargó cada uno. El nombre no es
 * adorno: es lo que deja ver lo que ninguna cifra sola dice — que un asiento
 * puede cuadrar y estar mal igual, si los dos renglones caen en la misma
 * cuenta.
 */
const ASIENTO_A3 = LAVADO_DE_AUTOS.transacciones[0].asiento;
const CUENTA_ACTIVO = ASIENTO_A3.debe[0][0];
const CUENTA_PATRIMONIO = ASIENTO_A3.haber[0][0];
const APORTE = ASIENTO_A3.debe[0][1];

export const DECIDE_A3 = {
  id: "cu-a3-partida-doble",
  figura: "balanza",
  /* Antes de la primera decisión no hay asiento: dos platillos en cero. */
  inicial: { debe: 0, haber: 0, cuentasDebe: [], cuentasHaber: [] },
  decisiones: [
    {
      clave: "lado-del-activo",
      pregunta: `Los accionistas depositan ${pesos(APORTE)} en el banco a nombre del negocio. ${CUENTA_ACTIVO} es un activo y aumenta. ¿Por qué lado se registra ese aumento?`,
      opciones: [
        { id: "debe", t: `Por el debe de ${CUENTA_ACTIVO}`, correcta: true },
        { id: "haber", t: `Por el haber de ${CUENTA_ACTIVO}`,
          msg: `Por el haber nacen y aumentan los pasivos, el patrimonio y los ingresos: ésa es la regla 2. ${CUENTA_ACTIVO} no es ninguno de los tres — es un activo, y los activos crecen por el debe.` },
        { id: "ambos", t: `Por los dos, ${pesos(APORTE)} a cada lado de ${CUENTA_ACTIVO}, para que no se desequilibre`,
          msg: `La balanza queda recta, pero mire los dos platillos: los dos dicen ${CUENTA_ACTIVO}. La partida doble pide el debe de una cuenta y el haber de OTRA; dos renglones en la misma dirían que el banco recibió y devolvió el aporte el mismo día.` },
      ],
      porque: `Regla 1: los activos nacen y aumentan por el debe. Y la balanza queda caída a propósito — con un solo renglón el asiento todavía no cuadra, y eso es justo lo que va a pedir el segundo.`,
      pista: "Pregúntese de qué familia es la cuenta. Activos, gastos y costos aumentan por la izquierda; pasivos, patrimonio e ingresos, por la derecha.",
      estado: (eleccion) => {
        if (eleccion === "haber") {
          return { debe: 0, haber: APORTE, cuentasDebe: [], cuentasHaber: [CUENTA_ACTIVO] };
        }
        if (eleccion === "ambos") {
          return { debe: APORTE, haber: APORTE, cuentasDebe: [CUENTA_ACTIVO], cuentasHaber: [CUENTA_ACTIVO] };
        }
        return { debe: APORTE, haber: 0, cuentasDebe: [CUENTA_ACTIVO], cuentasHaber: [] };
      },
    },
    {
      clave: "contrapartida",
      pregunta: `El débito a ${CUENTA_ACTIVO} ya está y la balanza quedó caída. ¿Qué segundo renglón la vuelve a nivelar?`,
      opciones: [
        { id: "haber-patrimonio", t: `${pesos(APORTE)} al haber de ${CUENTA_PATRIMONIO}`, correcta: true },
        { id: "debe-patrimonio", t: `${pesos(APORTE)} al debe de ${CUENTA_PATRIMONIO}`,
          msg: `Dos débitos no se compensan: se suman. El platillo de la izquierda pasó a ${pesos(APORTE * 2)} y la balanza se fue más hacia allá, no volvió al centro. La contrapartida de un débito es siempre un crédito.` },
        { id: "haber-activo", t: `${pesos(APORTE)} al haber de ${CUENTA_ACTIVO}, la cuenta que acabamos de debitar`,
          msg: `El total cuadra y la balanza se nivela, pero ${CUENTA_ACTIVO} queda en cero: la empresa amanecería como si el aporte nunca hubiera entrado. El crédito va en la cuenta que recibe la contrapartida, no en la que ya se debitó.` },
      ],
      porque: `El efectivo entró y, en el mismo acto, los socios ganaron un derecho sobre el negocio por ese valor: un débito en ${CUENTA_ACTIVO} y un crédito en ${CUENTA_PATRIMONIO}. La ecuación vuelve a quedar en pie.`,
      pista: `Si el activo creció, algo del otro lado de la ecuación creció con él. Pregúntese de quién son esos ${pesos(APORTE)}.`,
      estado: (eleccion) => {
        if (eleccion === "debe-patrimonio") {
          return {
            debe: APORTE * 2, haber: 0,
            cuentasDebe: [CUENTA_ACTIVO, CUENTA_PATRIMONIO], cuentasHaber: [],
          };
        }
        if (eleccion === "haber-activo") {
          return { debe: APORTE, haber: APORTE, cuentasDebe: [CUENTA_ACTIVO], cuentasHaber: [CUENTA_ACTIVO] };
        }
        return { debe: APORTE, haber: APORTE, cuentasDebe: [CUENTA_ACTIVO], cuentasHaber: [CUENTA_PATRIMONIO] };
      },
    },
  ],
  cierre: "Dos renglones, en dos cuentas, por el mismo valor. No es una formalidad de contadores: es lo único que mantiene en pie que Activos = Pasivos + Patrimonio.",
};

/* ───────── 4 · Del diario al mayor ─────────
 * El caso son los dos renglones de Bancos que el diario del capítulo ya trae
 * —uno al debe el primer día, otro al haber el segundo—, así que no hay cifra
 * inventada: salen de las dos primeras transacciones del lavado de autos.
 *
 * Primero en qué columna del mayor entra cada valor (clasificación) y después
 * qué saldo deja la cuenta ya mayorizada (consecuencia). La segunda es, con
 * las palabras del libro, para lo que el mayor existe: «conocer el movimiento
 * y el saldo de cada una». Y solo tiene respuesta si los valores quedaron
 * donde la primera decisión los puso.
 *
 * La figura es la cuenta T, porque lo que se pregunta es cómo queda la cuenta
 * del mayor y no cómo queda la hoja del diario.
 */
const PRIMERO_A4 = LAVADO_DE_AUTOS.transacciones[0];
const SEGUNDO_A4 = LAVADO_DE_AUTOS.transacciones[1];
const CUENTA_MAYOR = PRIMERO_A4.asiento.debe[0][0];
const AL_DEBE = PRIMERO_A4.asiento.debe[0][1];
/* El mismo nombre en el haber del segundo asiento: si el capítulo cambiara la
 * transacción, esto deja de encontrarlo en vez de inventar una cifra. */
const AL_HABER = SEGUNDO_A4.asiento.haber.find(([cuenta]) => cuenta === CUENTA_MAYOR)[1];
const SALDO_MAYOR = AL_DEBE - AL_HABER;
const BASE_A4 = { cuenta: CUENTA_MAYOR, cancelar: false, lado: null };

export const DECIDE_A4 = {
  id: "cu-a4-diario-y-mayor",
  /* La cuenta del mayor, abierta y todavía vacía. */
  inicial: { ...BASE_A4, debitos: [], creditos: [] },
  decisiones: [
    {
      clave: "columna",
      pregunta: `El diario trae dos renglones de ${CUENTA_MAYOR}: ${pesos(AL_DEBE)} en la columna debe (${PRIMERO_A4.fecha}) y ${pesos(AL_HABER)} en la columna haber (${SEGUNDO_A4.fecha}). Al mayorizar, ¿dónde entra cada valor?`,
      opciones: [
        { id: "cada-uno", t: `Cada uno en la columna que traía: ${pesos(AL_DEBE)} al debe y ${pesos(AL_HABER)} al haber`, correcta: true },
        { id: "ambos-debe", t: `Los dos al debe: los dos son movimientos de ${CUENTA_MAYOR}`,
          msg: `Mayorizar no cambia de columna: el valor del debe del diario va al debe del mayor y el del haber al haber. Lo que el mayor agrupa es la cuenta, no el lado — y mire la figura: los dos valores del mismo lado dicen que el banco solo recibió.` },
        { id: "ya-restado", t: `Uno solo: ${pesos(SALDO_MAYOR)} al debe, que es lo que queda`,
          msg: `Eso ya es el saldo, y el saldo se calcula después, con los dos movimientos escritos. Si el valor entra restado, el mayor pierde el movimiento crédito de ${pesos(AL_HABER)} y nadie puede rastrear de dónde salió la cifra.` },
      ],
      porque: "Mayorizar es reordenar, no calcular: cada valor conserva su columna y solo cambia de libro.",
      pista: "No sume ni reste todavía. Pregúntese en qué columna estaba cada valor en el diario, y déjelo en la misma.",
      estado: (eleccion) => {
        if (eleccion === "ambos-debe") {
          return { ...BASE_A4, debitos: [{ valor: AL_DEBE }, { valor: AL_HABER }], creditos: [] };
        }
        if (eleccion === "ya-restado") {
          return { ...BASE_A4, debitos: [{ valor: SALDO_MAYOR }], creditos: [] };
        }
        return { ...BASE_A4, debitos: [{ valor: AL_DEBE }], creditos: [{ valor: AL_HABER }] };
      },
    },
    {
      clave: "saldo-del-mayor",
      pregunta: `El mayor existe para conocer el movimiento y el saldo de cada cuenta. Con los dos valores ya en su columna, ¿cuál es el saldo de ${CUENTA_MAYOR}?`,
      opciones: [
        { id: "saldo", t: `${pesos(SALDO_MAYOR)} en el debe`, correcta: true },
        { id: "suma", t: `${pesos(AL_DEBE + AL_HABER)} en el debe`,
          msg: `Eso es la suma de los dos movimientos. El saldo es la diferencia: mire la columna debe, tiene ${pesos(AL_DEBE)} y no hay de dónde sacar los otros ${pesos(AL_HABER)} sin traerlos del lado contrario.` },
        { id: "ultimo", t: `${pesos(AL_HABER)} en el haber, que es el último renglón mayorizado`,
          msg: `El saldo no es el último renglón que llegó. El mayor agrupa por cuenta y no por fecha, así que el orden en que entraron los valores no decide nada: el saldo queda del lado que pesó más.` },
      ],
      porque: `La diferencia entre los dos movimientos, del lado del mayor: ${pesos(AL_DEBE)} contra ${pesos(AL_HABER)}.`,
      pista: "Enfrente los dos movimientos de la cuenta y quédese con lo que sobra, del lado donde sobró.",
      estado: (eleccion) => ({
        ...BASE_A4,
        debitos: [{ valor: AL_DEBE }],
        creditos: [{ valor: AL_HABER }],
        cancelar: eleccion === "saldo",
        lado: eleccion === "ultimo" ? "haber" : "debe",
      }),
    },
  ],
  cierre: "El diario dice cuándo pasó; el mayor, cómo quedó la cuenta. Mayorizar no agrega información: la reordena, y por eso ningún valor cambia de columna en el camino.",
};

export const DECIDE_POR_PIEZA = {
  [DECIDE_A1.id]: DECIDE_A1,
  [DECIDE_A2.id]: DECIDE_A2,
  [DECIDE_A3.id]: DECIDE_A3,
  [DECIDE_A4.id]: DECIDE_A4,
};
