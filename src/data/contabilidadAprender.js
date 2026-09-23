import { LAVADO_DE_AUTOS } from "./contabilidad.js";

/*
 * ═══════════════════════════════════════════════════════════════════════════
 * LAS CUATRO PIEZAS DE APRENDER DE «LAS CUENTAS, EL DEBE Y EL HABER».
 *
 * Material teórico: CERO FP. No entran al catálogo del servidor, no llaman a
 * registrar_fp y su capa 4 no califica nada — la respuesta de referencia es
 * para comparar, no para corregir.
 *
 * Usan `CuatroCapas`, el componente que ya existe desde Política Monetaria, y
 * su forma de dato: { titulo, nombres, pasos, pregunta, respuesta }. Cada paso
 * lleva un `resaltar` que su Escena interpreta para encender una parte y
 * apagar el resto.
 *
 * LAS DEFINICIONES ENTRECOMILLADAS SON TEXTUALES DEL LIBRO. Están marcadas con
 * `textual: true` para que nadie las «mejore»: son la redacción que el
 * estudiante va a encontrar en el capítulo.
 * ═══════════════════════════════════════════════════════════════════════════
 */

/* ───────────────── 1 · De qué está hecha una cuenta ───────────────── */

export const DE_QUE_ESTA_HECHA = {
  id: "cu-a1-anatomia-de-una-cuenta",
  titulo: "De qué está hecha una cuenta",
  subtema: "Estructura de la cuenta T",
  nombres: [
    { termino: "Cuenta", textual: true,
      definicion: "«un sistema de registro organizado, de los aumentos o disminuciones que sufre un concepto como consecuencia de las operaciones que realiza un negocio»." },
    { termino: "Debe", definicion: "el lado izquierdo de la cuenta. Ahí se registran los débitos." },
    { termino: "Haber", definicion: "el lado derecho de la cuenta. Ahí se registran los créditos." },
    { termino: "Movimiento débito", definicion: "la suma de todos los valores registrados en el debe." },
    { termino: "Movimiento crédito", definicion: "la suma de todos los valores registrados en el haber." },
    { termino: "Saldo", definicion: "la diferencia entre los dos movimientos. Se coloca del lado que tenga el movimiento mayor." },
    { termino: "Ojo con esto desde ya",
      definicion: "debe y haber NO significan «aumenta» y «disminuye». Significan izquierda y derecha. Qué pasa con la cuenta depende del tipo de cuenta, no del lado." },
  ],
  pasos: [
    { resaltar: "encabezado",
      texto: "Toda cuenta empieza igual: un nombre arriba y una raya que parte el espacio en dos. Nada más. Esa raya es todo el sistema." },
    { resaltar: "debe",
      texto: "El lado izquierdo se llama debe. Lo que se escribe ahí es un débito. No pregunte todavía si eso es bueno o malo — por ahora es solo el lado izquierdo." },
    { resaltar: "haber",
      texto: "El lado derecho se llama haber. Lo que se escribe ahí es un crédito. Otra vez: es un lado, no un juicio. Un crédito no es ni positivo ni negativo por sí mismo." },
    { resaltar: "saldo",
      texto: "Sume cada lado por separado: 1.500 a la izquierda, 150 a la derecha. La diferencia es 1.350, y se escribe del lado que pesó más — aquí, la izquierda. Eso es el saldo." },
  ],
  /* La cuenta que el paso 4 anima: la del ejemplo del capítulo. */
  ejemplo: { cuenta: "Caja", debitos: [1000, 500], creditos: [150], saldo: 1350, lado: "debe" },
  pregunta: "Una cuenta tiene movimiento débito de $50 y movimiento crédito de $30. ¿Cuánto es el saldo y de qué lado va?",
  respuesta: "$20, y va en el debe. Es la diferencia entre los dos movimientos, y se coloca del lado que tuvo el movimiento mayor — aquí el débito.",
};

/* ───────────────── 2 · Las dos familias de cuentas ───────────────── */

export const LAS_DOS_FAMILIAS = {
  id: "cu-a2-dos-familias",
  titulo: "Las dos familias de cuentas",
  subtema: "Clasificación de cuentas",
  nombres: [
    { termino: "Cuentas reales (o de balance)",
      definicion: "representan valores tangibles — lo que la empresa tiene y lo que debe. Permanecen en el balance durante toda la vida de la empresa. Son tres: Activo, Pasivo, Patrimonio." },
    { termino: "Cuentas nominales (o transitorias, o de resultados)",
      definicion: "nacen de las operaciones del negocio. Se cierran al final del periodo — por eso se llaman transitorias. Son tres: Ingresos, Gastos, Costos." },
    { termino: "Ingresos", textual: true,
      definicion: "«los valores que recibe una empresa por la venta de bienes o servicios»." },
    { termino: "Gastos", textual: true,
      definicion: "«los desembolsos necesarios para generar los ingresos» — salarios, arriendos." },
    { termino: "Costos", textual: true,
      definicion: "«desembolsos capitalizables» — dentro de ellos, el costo de ventas." },
  ],
  pasos: [
    { resaltar: "raiz",
      texto: "Todas las cuentas del mundo caen en una de dos familias. Solo dos." },
    { resaltar: "reales",
      texto: "Las reales son las que se quedan. Lo que la empresa tiene (activos), lo que debe (pasivos) y lo que es de los dueños (patrimonio). Al cerrar el año siguen ahí, con su saldo intacto." },
    { resaltar: "transitorias",
      texto: "Las transitorias son las que se borran. Miden qué pasó durante el periodo: qué vendió, qué gastó. Al cerrar el año se ponen en cero y arrancan de nuevo." },
    { resaltar: "cierre",
      texto: "Ese es todo el criterio: ¿el saldo sobrevive al cierre del año? Si sí, es real. Si vuelve a cero, es transitoria." },
  ],
  pregunta: "¿Por qué a las cuentas de ingresos y gastos se les llama transitorias?",
  respuesta: "Porque se cierran al final del ejercicio contable: su saldo vuelve a cero y el periodo siguiente arranca limpio. Las reales, en cambio, conservan su saldo de un año al otro.",
};

/* ───────────── 3 · La partida doble y las dos reglas ───────────── */

export const LA_PARTIDA_DOBLE = {
  id: "cu-a3-partida-doble",
  titulo: "La partida doble y las dos reglas",
  subtema: "Partida doble y ecuación contable",
  nombres: [
    { termino: "Partida doble", textual: true,
      definicion: "«cualquier transacción siempre se debe registrar dos veces, una vez en el debe de una cuenta y otra vez en el haber de otra cuenta»." },
    { termino: "Ecuación contable",
      definicion: "ACTIVOS = PASIVOS + PATRIMONIO. Si cambia algo a la izquierda, tiene que cambiar algo equivalente a la derecha." },
    { termino: "Asiento contable", definicion: "el registro de una transacción en los libros." },
    { termino: "Asiento simple", definicion: "afecta exactamente dos cuentas." },
    { termino: "Asiento compuesto",
      definicion: "afecta más de dos. Sigue cumpliendo la partida doble — lo que tiene que cuadrar es el total del debe contra el total del haber, no el número de cuentas." },
    { termino: "Regla 1",
      definicion: "Activos, Gastos y Costos se inician y aumentan por el DEBE, disminuyen por el haber. Su saldo normalmente está en el debe." },
    { termino: "Regla 2",
      definicion: "Pasivos, Patrimonio e Ingresos se inician y aumentan por el HABER, disminuyen por el debe. Su saldo normalmente está en el haber." },
  ],
  pasos: [
    { resaltar: "nivelada",
      texto: "Todo parte de aquí. La balanza está nivelada, y tiene que seguir nivelada después de cada transacción. Ese es el único mandamiento." },
    { resaltar: "inclinada",
      texto: "Si entra un activo y no pasa nada más, la balanza se cae. Por eso toda transacción se registra dos veces: una para el cambio, otra para lo que lo compensa." },
    { resaltar: "compensada",
      texto: "Eso es la partida doble. No es una regla arbitraria de los contadores: es lo único que mantiene la ecuación en pie." },
    { resaltar: "dinamicas",
      texto: "Y aquí está por qué débito no significa «aumenta». Mire la tabla: en Activos, un débito suma. En Pasivos, ese mismo débito resta. El lado es el mismo; el efecto cambia según el tipo de cuenta." },
    { resaltar: "dos-grupos",
      texto: "En vez de memorizar seis filas, memorice dos grupos. Uno crece por la izquierda, el otro por la derecha. Todo el capítulo cabe en esa frase." },
  ],
  pregunta: "¿Por qué un débito aumenta un activo pero disminuye un pasivo, si es el mismo lado?",
  respuesta: "Porque activos y pasivos están en lados opuestos de la ecuación. Para que Activos = Pasivos + Patrimonio se mantenga, lo que hace crecer un lado tiene que hacer decrecer el otro. El débito no significa «aumentar»: significa «lado izquierdo».",
};

/* ───────────────── 4 · Del diario al mayor ───────────────── */

export const DEL_DIARIO_AL_MAYOR = {
  id: "cu-a4-diario-y-mayor",
  titulo: "Del diario al mayor",
  subtema: "Libro diario y libro mayor",
  nombres: [
    { termino: "Libro diario",
      definicion: "donde se registran todos los hechos y operaciones, en orden cronológico. Se le conoce como «libro de registro de asientos originales», porque cada transacción se anota ahí primero." },
    { termino: "Sus columnas",
      definicion: "Fecha · Detalle · Debe · Haber. En el detalle va primero la cuenta debitada, y debajo, un poco más a la derecha, la acreditada, con una breve explicación." },
    { termino: "Libro mayor", textual: true,
      definicion: "«el más importante en cualquier contabilidad». Agrupa todas las transacciones por cuenta, para conocer el movimiento y el saldo de cada una." },
    { termino: "Mayorización",
      definicion: "pasar los registros del diario al mayor. El valor del debe del diario va a la columna debe del mayor, y el del haber a la del haber." },
    { termino: "La diferencia en una frase",
      definicion: "el diario ordena por tiempo; el mayor ordena por cuenta. Son los mismos datos vistos de dos formas." },
  ],
  pasos: [
    { resaltar: "hoja-vacia",
      texto: "El diario es una lista cronológica. Todo lo que pasa entra aquí primero, en el orden en que pasó, sin importar de qué cuenta se trate." },
    { resaltar: "asiento",
      texto: "Fíjese en la sangría: la cuenta acreditada va corrida a la derecha. Es una convención visual que permite leer un asiento de un vistazo." },
    { resaltar: "mayorizar",
      texto: "Mayorizar es esto: tomar cada valor del diario y llevarlo a la cuenta que le corresponde. No se calcula nada nuevo — se reordena." },
    { resaltar: "dos-vistas",
      texto: "Los mismos datos, dos ordenamientos. El diario responde «¿qué pasó el 3 de enero?». El mayor responde «¿cómo quedó la cuenta Bancos?». Necesita los dos." },
  ],
  /*
   * El asiento que anima el paso 2 es el del 1 de julio del libro: no
   * pertenece a ninguno de los dos casos del tema, así que va escrito aquí.
   * Es la corrección 1 en su forma original: dos socios, $2.000 en total.
   */
  asientoDeEjemplo: {
    fecha: "1 de julio",
    debe: [["Caja", 2000]],
    haber: [["Aportes sociales", 2000]],
    nota: "Aporte inicial de los socios pagado en efectivo",
  },
  /* La vista partida de la capa 3 arranca con las transacciones del caso. */
  diarioDeEjemplo: LAVADO_DE_AUTOS.transacciones.slice(0, 4),
  pregunta: "¿En cuál de los dos libros se registra una transacción primero, y por qué?",
  respuesta: "En el libro diario. Por eso se llama libro de asientos originales: es el registro cronológico de lo que ocurrió. El mayor viene después, reordenando esos mismos datos por cuenta.",
};

export const PIEZAS_APRENDER = [
  DE_QUE_ESTA_HECHA,
  LAS_DOS_FAMILIAS,
  LA_PARTIDA_DOBLE,
  DEL_DIARIO_AL_MAYOR,
];
