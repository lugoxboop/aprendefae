import { ROTULO_SIMULADO } from "./politicaMonetaria.js";

/*
 * ═══════════════════════════════════════════════════════════════════════════
 * POLÍTICA MONETARIA · LOS TRES INSTRUMENTOS, UNO POR ACTIVIDAD (Célula A).
 *
 *   la-tasa-que-muerde   La Tasa que Muerde      Aplicación · medio   · 25 FP
 *   repo-o-definitiva    ¿Repo o Definitiva?     Análisis   · difícil · 50 FP
 *   el-freno-del-encaje  El Freno del Encaje     Aplicación · medio   · 25 FP
 *
 * ═══════════ POR QUÉ ESTAS TRES Y NO OTRAS ═══════════
 *
 * Las dieciocho de Hacer que ya existen tocan los instrumentos por el lado de
 * QUIÉN decide (quien-decide-esto), CUÁL instrumento es (caja-de-herramientas),
 * HACIA DÓNDE se mueve la tasa (volante-de-la-tasa), A QUIÉN le pega
 * (a-quien-le-pega-la-tasa), POR DÓNDE viaja (cadena-de-transmision,
 * por-cual-arteria-entra), CUÁNDO llega (el-rezago) y CUÁNTO multiplica el
 * sistema (la-escalera-del-encaje). Ninguna pregunta por el PRECIO REAL de la
 * tasa, por la FORMA de una OMA con TES, ni por el BALANCE de un banco al que
 * le cambian el encaje. Ese es el hueco que llenan estas tres.
 *
 * ═══════════ LAS CIFRAS SON CONSTRUIDAS, Y SE DICE ═══════════
 *
 * Ninguna tasa de intervención, ningún porcentaje de encaje y ningún
 * rendimiento de TES de aquí es un dato vigente de Colombia: todos son de un
 * escenario construido, y cada pantalla lleva el rótulo «Escenario simulado»
 * a la vista. El registro con cada cifra y su cálculo está en
 * orquestador/conocimiento/registro-cifras-construidas-pm-instrumentos.md.
 *
 * Los MECANISMOS sí son estables y se afirman sin rodeos: una OMA de expansión
 * mete liquidez, un repo se deshace al vencer, subir el encaje recorta lo que
 * un banco puede prestar, y la tasa real es la nominal menos la inflación.
 *
 * ═══════════ DOS DECISIONES DE TIPO DISTINTO POR CASO (D4) ═══════════
 *
 * Cada caso pide una CLASIFICACIÓN y después una CONSECUENCIA sobre el mismo
 * caso. No son la misma pregunta dos veces: la primera lee el estado de hoy,
 * la segunda dice qué queda después de un movimiento. Y cada opción —también
 * las malas— deja la figura en un estado distinto de las otras dos, porque dos
 * opciones que se ven igual son una sola para el estudiante.
 * ═══════════════════════════════════════════════════════════════════════════
 */

export { ROTULO_SIMULADO };

/* Los dos tipos de decisión. El tipo se pinta como rótulo de la pregunta. */
export const CLASIFICACION = "clasificacion";
export const CONSECUENCIA = "consecuencia";

export const ROTULO_TIPO = {
  [CLASIFICACION]: "LEE EL ESTADO DE HOY",
  [CONSECUENCIA]: "DI QUÉ QUEDA DESPUÉS",
};

/* ═══════════════════ A · LA TASA QUE MUERDE ═══════════════════ */

/*
 * La regla de la figura: el eje va de 4 a 14 y las dos fichas —la tasa y la
 * inflación— se posan en su cifra. Lo que muerde es la DISTANCIA entre ellas,
 * así que la figura la dibuja como un tramo, no como dos números sueltos.
 */
export const EJE_TASA = { minimo: 4, maximo: 14 };

export const TASA = {
  id: "la-tasa-que-muerde",
  nombre: "La Tasa que Muerde",
  subtema: "Tasa de intervención en términos reales",
  consigna: "Pon la ficha de la tasa donde va. Después di qué queda cuando algo se mueve.",
  regla: "La tasa frena cuando queda por encima de la inflación. Si queda por debajo, el crédito sale casi regalado.",
  cierre: "La Junta fija un número, pero el freno lo pone la distancia con la inflación. Por eso la misma tasa aprieta un año y suelta el otro sin que nadie la toque.",
};

export const CASOS_TASA = [
  {
    id: "nueve-contra-once",
    titulo: "Enero",
    hecho: "La Junta deja la tasa en 9. La inflación del año va en 11. La meta sigue siendo 3.",
    base: { tasa: 9, inflacion: 11 },
    decisiones: [
      {
        id: "lectura",
        etiqueta: "¿dónde queda la tasa?",
        tipo: CLASIFICACION,
        pregunta: "¿Dónde queda la tasa frente a la inflación?",
        respuesta: "debajo",
        opciones: [
          {
            id: "debajo",
            nombre: "Por debajo de la inflación",
            lectura: "debajo",
            retro: "✅ Así es. Nueve menos once da menos dos. La tasa queda dos puntos por debajo, y el crédito sale barato.",
          },
          {
            id: "igual",
            nombre: "Justo en la inflación",
            lectura: "igual",
            retro: "❌ Igual sería si las dos cifras fueran la misma. Aquí hay dos puntos de diferencia: nueve no es once.",
          },
          {
            id: "encima",
            nombre: "Por encima de la inflación",
            lectura: "encima",
            retro: "❌ Comparaste con la meta, que es 3. La meta es a dónde quiere llegar el Banco. El freno se mide contra la inflación de hoy, que va en 11.",
          },
        ],
      },
      {
        id: "sube-punto-y-medio",
        etiqueta: "si la tasa sube punto y medio",
        tipo: CONSECUENCIA,
        pregunta: "La Junta sube la tasa un punto y medio. La inflación del año no se mueve. ¿Qué pasa con el freno?",
        respuesta: "aprieta",
        opciones: [
          {
            id: "aprieta",
            nombre: "Aprieta: la tasa se acerca a la inflación",
            estado: { tasa: 10.5, inflacion: 11 },
            retro: "✅ Bien. La tasa pasa de nueve a diez y medio. Sigue debajo de once, pero por medio punto en vez de dos.",
          },
          {
            id: "no-cambia",
            nombre: "No cambia: la inflación sigue igual",
            estado: { tasa: 9, inflacion: 11 },
            retro: "❌ Estás midiendo el freno con una sola cifra. La distancia tiene dos, y una de ellas acaba de moverse.",
          },
          {
            id: "suelta",
            nombre: "Suelta: la inflación baja el mismo mes",
            estado: { tasa: 10.5, inflacion: 9 },
            retro: "❌ Ese es el rezago, y va más lento. La tasa tarda meses en mover los precios, no el mismo mes.",
          },
        ],
      },
    ],
  },
  {
    id: "diez-contra-seis",
    titulo: "Junio",
    hecho: "La tasa está en 10. La inflación del año bajó a 6. La meta sigue siendo 3.",
    base: { tasa: 10, inflacion: 6 },
    decisiones: [
      {
        id: "lectura",
        etiqueta: "¿dónde queda la tasa?",
        tipo: CLASIFICACION,
        pregunta: "¿Dónde queda la tasa frente a la inflación?",
        respuesta: "encima",
        opciones: [
          {
            id: "debajo",
            nombre: "Por debajo de la inflación",
            lectura: "debajo",
            retro: "❌ Pusiste la ficha de la tasa a la izquierda de la inflación. Diez es más que seis: va a la derecha, y el freno está puesto.",
          },
          {
            id: "igual",
            nombre: "Justo en la inflación",
            lectura: "igual",
            retro: "❌ Igual sería si las dos cifras fueran la misma. Aquí sobran cuatro puntos de distancia.",
          },
          {
            id: "encima",
            nombre: "Por encima de la inflación",
            lectura: "encima",
            retro: "✅ Correcto. Diez menos seis da cuatro. Prestar cuesta cuatro puntos más de lo que suben los precios.",
          },
        ],
      },
      {
        id: "baja-dos",
        etiqueta: "si la tasa baja dos puntos",
        tipo: CONSECUENCIA,
        pregunta: "La Junta baja la tasa dos puntos. La inflación del año no se mueve. ¿Qué pasa con el freno?",
        respuesta: "suelta",
        opciones: [
          {
            id: "suelta",
            nombre: "Suelta: quedan dos puntos de distancia",
            estado: { tasa: 8, inflacion: 6 },
            retro: "✅ Eso es. La tasa pasa de diez a ocho y la distancia cae de cuatro a dos. El freno sigue puesto, pero flojo.",
          },
          {
            id: "se-va",
            nombre: "Se va del todo: la tasa queda debajo",
            estado: { tasa: 5, inflacion: 6 },
            retro: "❌ Te pasaste de largo. Bajar dos deja la tasa en ocho, no en cinco: todavía está encima de seis.",
          },
          {
            id: "aprieta",
            nombre: "Aprieta: bajar la tasa baja la inflación",
            estado: { tasa: 8, inflacion: 3 },
            retro: "❌ Bajar la tasa empuja los precios hacia arriba, no hacia abajo. Pusiste el efecto al revés.",
          },
        ],
      },
    ],
  },
  {
    id: "siete-contra-siete",
    titulo: "Octubre",
    hecho: "La tasa está en 7. La inflación del año también va en 7. La meta sigue siendo 3.",
    base: { tasa: 7, inflacion: 7 },
    decisiones: [
      {
        id: "lectura",
        etiqueta: "¿dónde queda la tasa?",
        tipo: CLASIFICACION,
        pregunta: "¿Dónde queda la tasa frente a la inflación?",
        respuesta: "igual",
        opciones: [
          {
            id: "debajo",
            nombre: "Por debajo de la inflación",
            lectura: "debajo",
            retro: "❌ Debajo sería con la tasa menor que la inflación. Siete y siete son la misma cifra: no hay distancia.",
          },
          {
            id: "igual",
            nombre: "Justo en la inflación",
            lectura: "igual",
            retro: "✅ Sí. Siete menos siete da cero. Prestar no cuesta más de lo que suben los precios, ni menos.",
          },
          {
            id: "encima",
            nombre: "Por encima de la inflación",
            lectura: "encima",
            retro: "❌ Encima sería con la tasa mayor que la inflación. Siete y siete son iguales: frente a la meta sí está encima, pero no es lo que se pregunta.",
          },
        ],
      },
      {
        id: "inflacion-sube",
        etiqueta: "si la inflación sube a nueve",
        tipo: CONSECUENCIA,
        pregunta: "La inflación del año sube a 9. La Junta no toca la tasa. ¿Qué pasa con el freno?",
        respuesta: "suelta-solo",
        opciones: [
          {
            id: "suelta-solo",
            nombre: "Suelta solo: la tasa queda debajo",
            estado: { tasa: 7, inflacion: 9 },
            retro: "✅ Exacto, y aquí está lo fino del tema: el freno se soltó sin que nadie decidiera nada. Se movió la otra cifra.",
          },
          {
            id: "sigue-igual",
            nombre: "Sigue igual: la Junta no tocó la tasa",
            estado: { tasa: 7, inflacion: 7 },
            retro: "❌ Crees que el freno solo cambia si la Junta lo mueve. La inflación lo mueve igual, y sin aviso.",
          },
          {
            id: "aprieta",
            nombre: "Aprieta: con más inflación la tasa pesa más",
            estado: { tasa: 9, inflacion: 7 },
            retro: "❌ Cambiaste las dos fichas de puesto. La que subió es la inflación, no la tasa, y eso suelta el freno.",
          },
        ],
      },
    ],
  },
  {
    id: "doce-contra-trece",
    titulo: "Marzo",
    hecho: "La tasa está en 12. La inflación del año va en 13. La meta sigue siendo 3.",
    base: { tasa: 12, inflacion: 13 },
    decisiones: [
      {
        id: "lectura",
        tipo: CLASIFICACION,
        etiqueta: "¿dónde queda la tasa?",
        pregunta: "¿Dónde queda la tasa frente a la inflación?",
        respuesta: "debajo",
        opciones: [
          {
            id: "debajo",
            nombre: "Por debajo de la inflación",
            lectura: "debajo",
            retro: "✅ Sí. Doce menos trece da menos uno. La tasa se ve alta y aun así no frena: queda un punto por debajo.",
          },
          {
            id: "igual",
            nombre: "Justo en la inflación",
            lectura: "igual",
            retro: "❌ Igual sería con las dos cifras iguales. Doce no es trece, aunque se parezcan: hay un punto de diferencia.",
          },
          {
            id: "encima",
            nombre: "Por encima de la inflación",
            lectura: "encima",
            retro: "❌ Miraste el tamaño de la tasa y no la distancia. Doce es una tasa alta, pero trece es más: no frena.",
          },
        ],
      },
      {
        id: "inflacion-baja",
        tipo: CONSECUENCIA,
        etiqueta: "si la inflación baja a diez",
        pregunta: "La inflación del año baja a 10. La Junta no toca la tasa. ¿Qué pasa con el freno?",
        respuesta: "aprieta-solo",
        opciones: [
          {
            id: "aprieta-solo",
            nombre: "Aprieta solo: la tasa queda encima",
            estado: { tasa: 12, inflacion: 10 },
            retro: "✅ Eso es. La Junta no movió nada y el freno se puso: la tasa pasó de estar debajo a estar dos puntos encima.",
          },
          {
            id: "sigue-igual",
            nombre: "Sigue igual: la Junta no movió la tasa",
            estado: { tasa: 12, inflacion: 13 },
            retro: "❌ Otra vez el freno medido con una sola cifra. La que se movió fue la inflación, y eso cambia la distancia.",
          },
          {
            id: "suelta",
            nombre: "Suelta: con menos inflación el crédito sale más barato",
            estado: { tasa: 9, inflacion: 10 },
            retro: "❌ Confundiste el precio de las cosas con el precio del crédito. La tasa sigue en 12: nadie la bajó.",
          },
        ],
      },
    ],
  },
  {
    id: "seis-contra-cuatro",
    titulo: "Agosto",
    hecho: "La tasa está en 6. La inflación del año va en 4. La meta sigue siendo 3.",
    base: { tasa: 6, inflacion: 4 },
    decisiones: [
      {
        id: "lectura",
        tipo: CLASIFICACION,
        etiqueta: "¿dónde queda la tasa?",
        pregunta: "¿Dónde queda la tasa frente a la inflación?",
        respuesta: "encima",
        opciones: [
          {
            id: "debajo",
            nombre: "Por debajo de la inflación",
            lectura: "debajo",
            retro: "❌ Pusiste la lectura al otro lado. Seis es más que cuatro, así que la tasa va a la derecha de la inflación.",
          },
          {
            id: "igual",
            nombre: "Justo en la inflación",
            lectura: "igual",
            retro: "❌ Igual sería con las dos cifras iguales. Entre seis y cuatro hay dos puntos de distancia.",
          },
          {
            id: "encima",
            nombre: "Por encima de la inflación",
            lectura: "encima",
            retro: "✅ Correcto. Seis menos cuatro da dos. Una tasa baja también frena, si la inflación está más abajo.",
          },
        ],
      },
      {
        id: "suben-las-dos",
        tipo: CONSECUENCIA,
        etiqueta: "si suben las dos cifras",
        pregunta: "La Junta sube la tasa un punto y la inflación sube dos. ¿Qué pasa con el freno?",
        respuesta: "suelta",
        opciones: [
          {
            id: "suelta",
            nombre: "Suelta: la distancia se cierra a un punto",
            estado: { tasa: 7, inflacion: 6 },
            retro: "✅ Bien visto. La Junta subió y el freno se soltó igual, porque la inflación subió más: de dos puntos a uno.",
          },
          {
            id: "aprieta",
            nombre: "Aprieta: la Junta subió la tasa",
            estado: { tasa: 7, inflacion: 4 },
            retro: "❌ Leíste solo la decisión de la Junta. Si la otra cifra sube más, subir la tasa no alcanza para apretar.",
          },
          {
            id: "sigue-igual",
            nombre: "Sigue igual: las dos subieron",
            estado: { tasa: 7, inflacion: 5 },
            retro: "❌ Subieron las dos, pero no lo mismo: una punto, la otra dos. Si no suben parejo, la distancia cambia.",
          },
        ],
      },
    ],
  },
];

/* ═══════════════════ B · ¿REPO O DEFINITIVA? ═══════════════════ */

/*
 * La mesa: dos columnas (el Banco de la República y los bancos comerciales)
 * con sus TES y su plata, y debajo la tasa a un día contra la tasa del Banco.
 * `tes` son títulos que están en poder del Banco de la República; `plata`, los
 * pesos que están en el sistema bancario. `devuelve` marca la operación que se
 * deshace al vencer, que es lo único que separa un repo de una compra.
 */
export const MESA_BASE = { tes: 2, plata: 2, tasaDia: 0 };

export const REPO = {
  id: "repo-o-definitiva",
  nombre: "¿Repo o Definitiva?",
  subtema: "Operaciones de mercado abierto con TES",
  consigna: "Elige la operación que pide el caso. Después di qué queda cuando vence el plazo.",
  regla: "El repo mete o saca plata por unos días y se deshace al vencer. La compra o la venta definitiva de TES deja el cambio puesto.",
  cierre: "Las dos operaciones mueven TES y plata en el mismo momento. Lo que las separa es el plazo: el repo vuelve atrás solo, la definitiva se queda. Por eso un faltante de tres días se cubre con repo y un cambio de base, con una compra.",
};

export const CASOS_REPO = [
  {
    id: "dia-de-impuestos",
    titulo: "Día de impuestos",
    hecho: "Hoy las empresas pagan impuestos y la plata sale de los bancos. El faltante dura tres días. La tasa a un día se subió sola.",
    base: { ...MESA_BASE, tasaDia: 1 },
    decisiones: [
      {
        id: "cual-operacion",
        etiqueta: "¿qué operación?",
        tipo: CLASIFICACION,
        pregunta: "¿Qué operación pide este caso?",
        respuesta: "repo-expansion",
        opciones: [
          {
            id: "repo-expansion",
            nombre: "Repo a 7 días: el Banco compra TES y después los devuelve",
            estado: { tes: 3, plata: 3, tasaDia: 0, devuelve: true },
            retro: "✅ Correcto. El faltante dura días y el repo también. La plata entra hoy y se devuelve al vencer.",
          },
          {
            id: "compra-definitiva",
            nombre: "Compra definitiva: el Banco se queda con los TES",
            estado: { tes: 3, plata: 3, tasaDia: 0, devuelve: false },
            retro: "❌ Esa deja la plata puesta para siempre. El faltante es de tres días: después te sobra liquidez y la tasa se cae.",
          },
          {
            id: "repo-contraccion",
            nombre: "Repo de contracción: el Banco recibe la plata y entrega TES",
            estado: { tes: 1, plata: 1, tasaDia: 2, devuelve: true },
            retro: "❌ Esa va para el otro lado: le saca plata al sistema. Aquí falta plata, no sobra, y la tasa ya está arriba.",
          },
        ],
      },
      {
        id: "al-vencer",
        etiqueta: "al vencer el repo",
        tipo: CONSECUENCIA,
        pregunta: "Pasan los siete días del repo. ¿Qué queda en la mesa?",
        respuesta: "todo-vuelve",
        opciones: [
          {
            id: "todo-vuelve",
            nombre: "Los TES vuelven al banco y la plata vuelve al Banco de la República",
            estado: { tes: 2, plata: 2, tasaDia: 1, devuelve: false },
            retro: "✅ Eso es un repo: las dos patas se deshacen juntas. No queda base nueva, y si el faltante sigue, la tasa vuelve a subir.",
          },
          {
            id: "plata-se-queda",
            nombre: "Los TES vuelven al banco y la plata se queda en el sistema",
            estado: { tes: 2, plata: 3, tasaDia: 0, devuelve: false },
            retro: "❌ Si la plata se queda, eso ya es una compra definitiva. El repo no deja nada: por eso se usa para lo pasajero.",
          },
          {
            id: "tes-se-quedan",
            nombre: "Los TES se quedan en el Banco y la plata vuelve",
            estado: { tes: 3, plata: 2, tasaDia: 1, devuelve: false },
            retro: "❌ Cambiaste de lado las dos patas. En el repo el banco recompra sus TES, y lo que devuelve es la plata.",
          },
        ],
      },
    ],
  },
  {
    id: "mas-base-para-quedarse",
    titulo: "Más base",
    hecho: "La economía creció. Los bancos van a necesitar más plata, y no por unos días. El Banco quiere subir la base y dejarla ahí.",
    base: { ...MESA_BASE, tasaDia: 0 },
    decisiones: [
      {
        id: "cual-operacion",
        etiqueta: "¿qué operación?",
        tipo: CLASIFICACION,
        pregunta: "¿Qué operación pide este caso?",
        respuesta: "compra-definitiva",
        opciones: [
          {
            id: "compra-definitiva",
            nombre: "Compra definitiva: el Banco se queda con los TES",
            estado: { tes: 3, plata: 3, tasaDia: 0, devuelve: false },
            retro: "✅ Así es. El cambio tiene que quedarse, y solo la compra definitiva se queda. Los TES pasan al Banco y no vuelven.",
          },
          {
            id: "repo-expansion",
            nombre: "Repo a 7 días: el Banco compra TES y después los devuelve",
            estado: { tes: 3, plata: 3, tasaDia: 0, devuelve: true },
            retro: "❌ El repo se deshace al vencer, así que el lunes siguiente estás donde empezaste. Lo permanente no se hace con plazos.",
          },
          {
            id: "venta-definitiva",
            nombre: "Venta definitiva: el Banco entrega TES y recoge plata",
            estado: { tes: 1, plata: 1, tasaDia: 2, devuelve: false },
            retro: "❌ Esa baja la base en vez de subirla. Vender TES recoge plata del sistema, y aquí se quiere lo contrario.",
          },
        ],
      },
      {
        id: "al-mes",
        etiqueta: "un mes después",
        tipo: CONSECUENCIA,
        pregunta: "Pasa un mes desde la compra. ¿Qué queda en la mesa?",
        respuesta: "queda-puesto",
        opciones: [
          {
            id: "queda-puesto",
            nombre: "Los TES siguen en el Banco y la plata sigue en el sistema",
            estado: { tes: 3, plata: 3, tasaDia: 0, devuelve: false },
            retro: "✅ Correcto. Nadie tiene que renovar nada: la compra no vence. La base quedó un peldaño más arriba.",
          },
          {
            id: "hay-que-renovar",
            nombre: "La operación vence y el Banco la tiene que renovar cada semana",
            estado: { tes: 2, plata: 2, tasaDia: 1, devuelve: true },
            retro: "❌ Le pusiste plazo a una compra. Lo que vence y se renueva es el repo; la definitiva no tiene fecha de vuelta.",
          },
          {
            id: "tes-vuelven",
            nombre: "Los TES vuelven al banco y la plata se queda",
            estado: { tes: 2, plata: 3, tasaDia: 0, devuelve: false },
            retro: "❌ Los TES no vuelven solos: el Banco los compró y son suyos. Lo que vuelve en una pata sola es imposible.",
          },
        ],
      },
    ],
  },
  {
    id: "sobra-por-unos-dias",
    titulo: "Sobra plata",
    hecho: "El Gobierno le pagó a sus proveedores y a los bancos les sobró plata por unos días. La tasa a un día se cayó debajo de la tasa del Banco.",
    base: { ...MESA_BASE, tasaDia: -1 },
    decisiones: [
      {
        id: "cual-operacion",
        etiqueta: "¿qué operación?",
        tipo: CLASIFICACION,
        pregunta: "¿Qué operación pide este caso?",
        respuesta: "repo-contraccion",
        opciones: [
          {
            id: "repo-contraccion",
            nombre: "Repo de contracción: el Banco recibe la plata y entrega TES",
            estado: { tes: 1, plata: 1, tasaDia: 0, devuelve: true },
            retro: "✅ Bien. Lo que sobra es pasajero, así que se recoge con plazo. Al vencer, la plata vuelve a los bancos.",
          },
          {
            id: "venta-definitiva",
            nombre: "Venta definitiva: el Banco entrega TES y recoge plata",
            estado: { tes: 1, plata: 1, tasaDia: 0, devuelve: false },
            retro: "❌ Esa recoge la plata y no la devuelve. El exceso dura unos días: después dejarías al sistema corto.",
          },
          {
            id: "repo-expansion",
            nombre: "Repo a 7 días: el Banco compra TES y después los devuelve",
            estado: { tes: 3, plata: 3, tasaDia: -2, devuelve: true },
            retro: "❌ Esa mete más plata donde ya sobra, y la tasa a un día se caería todavía más lejos de la del Banco.",
          },
        ],
      },
      {
        id: "que-pasa-con-la-tasa",
        etiqueta: "la tasa a un día",
        tipo: CONSECUENCIA,
        pregunta: "El Banco recoge el exceso con el repo. ¿Qué le pasa a la tasa a un día?",
        respuesta: "vuelve-a-subir",
        opciones: [
          {
            id: "vuelve-a-subir",
            nombre: "Sube hacia la tasa del Banco: hay menos plata buscando dónde quedarse",
            estado: { tes: 1, plata: 1, tasaDia: 0, devuelve: true },
            retro: "✅ Eso es. Con menos plata de sobra, prestarse entre bancos deja de ser tan barato y la tasa a un día vuelve a su sitio.",
          },
          {
            id: "sigue-abajo",
            nombre: "Sigue abajo: la tasa a un día solo cambia si la Junta la cambia",
            estado: { tes: 1, plata: 1, tasaDia: -1, devuelve: true },
            retro: "❌ Confundes las dos tasas. La Junta fija la suya; la del mercado la mueve la plata que sobra o falta cada día.",
          },
          {
            id: "baja-mas",
            nombre: "Baja más: recoger plata deja a los bancos buscando crédito",
            estado: { tes: 1, plata: 1, tasaDia: -2, devuelve: true },
            retro: "❌ Pusiste el precio al revés. Si la plata escasea, prestarla cuesta más, no menos.",
          },
        ],
      },
    ],
  },
  {
    id: "la-base-quedo-grande",
    titulo: "Sobra para siempre",
    hecho: "El Banco les compró TES a los bancos hace años y los tiene. Hoy sobra plata de forma permanente y la tasa a un día está por debajo de la del Banco.",
    base: { tes: 3, plata: 3, tasaDia: -1 },
    decisiones: [
      {
        id: "cual-operacion",
        tipo: CLASIFICACION,
        etiqueta: "¿qué operación?",
        pregunta: "¿Qué operación pide este caso?",
        respuesta: "venta-definitiva",
        opciones: [
          {
            id: "venta-definitiva",
            nombre: "Venta definitiva: el Banco entrega TES y recoge plata",
            estado: { tes: 2, plata: 2, tasaDia: 0, devuelve: false },
            retro: "✅ Correcto. El exceso vino para quedarse, así que se recoge para siempre. Los TES vuelven a los bancos y no regresan.",
          },
          {
            id: "repo-contraccion",
            nombre: "Repo de contracción: el Banco recibe la plata por unos días",
            estado: { tes: 2, plata: 2, tasaDia: 0, devuelve: true },
            retro: "❌ Le pusiste plazo a un problema sin plazo. Al vencer, la plata vuelve y el exceso permanente sigue ahí.",
          },
          {
            id: "repo-expansion",
            nombre: "Repo de expansión: el Banco compra TES y mete plata",
            estado: { tes: 4, plata: 4, tasaDia: -2, devuelve: true },
            retro: "❌ Esa mete plata donde ya sobra, y la tasa a un día se alejaría todavía más de la del Banco.",
          },
        ],
      },
      {
        id: "al-mes",
        tipo: CONSECUENCIA,
        etiqueta: "un mes después",
        pregunta: "Pasa un mes desde la venta. ¿Qué queda en la mesa?",
        respuesta: "base-mas-baja",
        opciones: [
          {
            id: "base-mas-baja",
            nombre: "Los TES siguen en los bancos y la base quedó más baja",
            estado: { tes: 2, plata: 2, tasaDia: 0, devuelve: false },
            retro: "✅ Eso es. La venta no vence, así que nadie tiene que renovarla: la base bajó un peldaño y se queda ahí.",
          },
          {
            id: "tes-vuelven",
            nombre: "Los TES vuelven al Banco y la plata se queda fuera",
            estado: { tes: 3, plata: 2, tasaDia: 0, devuelve: false },
            retro: "❌ Los TES los compraron los bancos y son suyos. Una pata sola no se deshace: la venta movió las dos.",
          },
          {
            id: "hay-que-renovar",
            nombre: "La operación vence y el Banco la renueva cada semana",
            estado: { tes: 3, plata: 3, tasaDia: -1, devuelve: true },
            retro: "❌ Lo que vence y se renueva es el repo. Si esto venciera, al mes estarías igual que al principio.",
          },
        ],
      },
    ],
  },
  {
    id: "faltante-que-no-se-va",
    titulo: "Tres meses cortos",
    hecho: "Los bancos llevan tres meses cortos de plata y el Banco les ha renovado el repo semana a semana. El faltante no se va.",
    base: { tes: 3, plata: 3, tasaDia: 0, devuelve: true },
    decisiones: [
      {
        id: "cual-operacion",
        tipo: CLASIFICACION,
        etiqueta: "¿qué operación?",
        pregunta: "¿Qué operación pide este caso?",
        respuesta: "pasar-a-definitiva",
        opciones: [
          {
            id: "pasar-a-definitiva",
            nombre: "Compra definitiva: el faltante dejó de ser pasajero",
            estado: { tes: 3, plata: 3, tasaDia: 0, devuelve: false },
            retro: "✅ Exacto. Tres meses de renovar dicen que no era de unos días. Lo que ya es permanente se resuelve con una compra.",
          },
          {
            id: "seguir-renovando",
            nombre: "Seguir renovando el repo cada semana",
            estado: { tes: 3, plata: 3, tasaDia: 0, devuelve: true },
            retro: "❌ Sirve, pero el sistema queda colgado de una firma cada semana. La compra definitiva no pide firmas.",
          },
          {
            id: "repo-contraccion",
            nombre: "Repo de contracción: recoger plata del sistema",
            estado: { tes: 2, plata: 2, tasaDia: 2, devuelve: true },
            retro: "❌ Esa va al otro lado: le quita plata a quien ya está corto, y la tasa a un día se iría por encima de la del Banco.",
          },
        ],
      },
      {
        id: "que-cambia-en-la-mesa",
        tipo: CONSECUENCIA,
        etiqueta: "qué cambia al pasar a compra",
        pregunta: "El Banco cambia el repo por una compra definitiva. ¿Qué cambia en la mesa?",
        respuesta: "mismo-sitio-sin-plazo",
        opciones: [
          {
            id: "mismo-sitio-sin-plazo",
            nombre: "Los TES y la plata quedan donde están, pero sin fecha de vuelta",
            estado: { tes: 3, plata: 3, tasaDia: 0, devuelve: false },
            retro: "✅ Así es, y es lo fino del tema: la plata no se mueve de sitio. Lo que cambia es que deja de tener que volver.",
          },
          {
            id: "entra-mas-plata",
            nombre: "Entra más plata al sistema que con el repo",
            estado: { tes: 4, plata: 4, tasaDia: -1, devuelve: false },
            retro: "❌ Una compra no mete más plata que un repo del mismo tamaño. Lo que cambia es el plazo, no el monto.",
          },
          {
            id: "sale-la-plata",
            nombre: "La plata del repo vuelve y la compra entra después",
            estado: { tes: 2, plata: 2, tasaDia: 1, devuelve: false },
            retro: "❌ Si la plata volviera primero, el sistema quedaría corto un día. La compra reemplaza al repo sin ese hueco.",
          },
        ],
      },
    ],
  },
];

/* ═══════════════════ C · EL FRENO DEL ENCAJE ═══════════════════ */

/*
 * El tanque de un banco: los depósitos son el alto total, la línea marca la
 * reserva exigida y el relleno, la que tiene. Al lado, la barra de lo que
 * puede prestar este mes. Todo en millones de un banco construido.
 *
 * `exigido = depositos * encaje / 100`, y una prueba lo recalcula.
 */
export const encajeExigido = (depositos, encaje) => Math.round((depositos * encaje) / 100);

export const ENCAJE = {
  id: "el-freno-del-encaje",
  nombre: "El Freno del Encaje",
  subtema: "Encaje bancario en el balance de un banco",
  consigna: "Pon la línea del encaje donde va. Después di de dónde sale la plata.",
  regla: "El encaje es la parte de los depósitos que el banco guarda y no presta. Lo que guarda sigue siendo suyo: deja de estar disponible, no desaparece.",
  cierre: "Subir el encaje no cambia el precio del crédito: cambia cuánto queda para prestar. El encaje frena por cantidad; la tasa frena por precio. El banco lo siente en dos renglones.",
};

export const CASOS_ENCAJE = [
  {
    id: "aurora-sube-el-encaje",
    titulo: "Banco Aurora",
    hecho: "Aurora tiene 4.000 en depósitos y 340 de reserva. Le quedan 260 para prestar. Hoy el encaje sube a 10 de cada 100.",
    base: { depositos: 4000, encaje: 10, reserva: 340, credito: 260 },
    decisiones: [
      {
        id: "como-queda",
        etiqueta: "¿cumple el encaje?",
        tipo: CLASIFICACION,
        pregunta: "¿Cómo queda Aurora con el encaje nuevo?",
        respuesta: "falta",
        opciones: [
          {
            id: "falta",
            nombre: "Le falta reserva",
            lectura: "falta",
            retro: "✅ Sí. Diez de cada cien sobre 4.000 piden 400. Aurora tiene 340, así que le faltan 60 para llegar a la línea.",
          },
          {
            id: "justo",
            nombre: "Cumple justo",
            lectura: "justo",
            retro: "❌ Justo sería con 400 exactos. Aurora tiene 340, y eso se queda 60 por debajo de la línea.",
          },
          {
            id: "sobra",
            nombre: "Le sobra reserva",
            lectura: "sobra",
            retro: "❌ Comparaste con el encaje viejo. Con 8 de cada 100 pedían 320 y le sobraba; con 10 piden 400 y le falta.",
          },
        ],
      },
      {
        id: "de-donde-sale",
        etiqueta: "de dónde salen los 60",
        tipo: CONSECUENCIA,
        pregunta: "Aurora cubre los 60 que le faltan con la plata que tenía lista para prestar. ¿Qué cambia?",
        respuesta: "credito-baja",
        opciones: [
          {
            id: "credito-baja",
            nombre: "La reserva sube a 400 y el crédito nuevo baja a 200",
            estado: { depositos: 4000, encaje: 10, reserva: 400, credito: 200 },
            retro: "✅ Correcto, y ese es el freno del encaje: la plata no se pierde, pero deja de estar disponible para prestar.",
          },
          {
            id: "credito-igual",
            nombre: "La reserva sube a 400 y el crédito nuevo sigue en 260",
            estado: { depositos: 4000, encaje: 10, reserva: 400, credito: 260 },
            retro: "❌ Los 60 tienen que salir de algún renglón. Si no salen del crédito, Aurora no los tiene: nadie le regala reserva.",
          },
          {
            id: "reserva-igual",
            nombre: "El crédito nuevo baja a 200 y la reserva se queda en 340",
            estado: { depositos: 4000, encaje: 10, reserva: 340, credito: 200 },
            retro: "❌ Lo que el banco aparta sí cuenta como reserva. Guardar y no prestar son la misma plata vista dos veces.",
          },
        ],
      },
    ],
  },
  {
    id: "aurora-baja-el-encaje",
    titulo: "Aurora, dos meses después",
    hecho: "El encaje baja a 8 de cada 100. Aurora sigue con 4.000 en depósitos y 400 de reserva. Tiene 200 listos para prestar.",
    base: { depositos: 4000, encaje: 8, reserva: 400, credito: 200 },
    decisiones: [
      {
        id: "como-queda",
        etiqueta: "¿cumple el encaje?",
        tipo: CLASIFICACION,
        pregunta: "¿Cómo queda Aurora con el encaje nuevo?",
        respuesta: "sobra",
        opciones: [
          {
            id: "falta",
            nombre: "Le falta reserva",
            lectura: "falta",
            retro: "❌ Pusiste la lectura debajo de la línea, y la línea bajó. Ocho de cada cien sobre 4.000 piden 320, no 400.",
          },
          {
            id: "justo",
            nombre: "Cumple justo",
            lectura: "justo",
            retro: "❌ Justo sería con 320 exactos. Aurora no movió su reserva: sigue en 400, que es 80 más de lo que piden.",
          },
          {
            id: "sobra",
            nombre: "Le sobra reserva",
            lectura: "sobra",
            retro: "✅ Así es. Ahora piden 320 y Aurora tiene 400. Le sobran 80 que estaban quietos y ya no tienen que estarlo.",
          },
        ],
      },
      {
        id: "que-hace-con-lo-que-sobra",
        etiqueta: "qué hace con los 80",
        tipo: CONSECUENCIA,
        pregunta: "¿Qué puede hacer Aurora con los 80 que le sobran?",
        respuesta: "prestarlos",
        opciones: [
          {
            id: "prestarlos",
            nombre: "Prestarlos: la reserva baja a 320 y el crédito nuevo sube a 280",
            estado: { depositos: 4000, encaje: 8, reserva: 320, credito: 280 },
            retro: "✅ Eso es. Bajar el encaje no le da plata nueva a nadie: libera la que estaba quieta. Por eso es expansivo.",
          },
          {
            id: "nada",
            nombre: "Nada: la reserva ya está guardada y no se puede mover",
            estado: { depositos: 4000, encaje: 8, reserva: 400, credito: 200 },
            retro: "❌ La reserva no es un depósito congelado: es un mínimo. Por encima del mínimo, el banco decide qué hace.",
          },
          {
            id: "devolverlos",
            nombre: "Devolverlos a los depositantes: esa plata no es del banco",
            estado: { depositos: 3920, encaje: 8, reserva: 320, credito: 200 },
            retro: "❌ Los depósitos no se devuelven porque bajó el encaje. Nadie pidió su plata: lo que cambió es cuánto hay que guardar.",
          },
        ],
      },
    ],
  },
  {
    id: "sierra-retiro",
    titulo: "Banco Sierra",
    hecho: "Sierra tiene 2.000 en depósitos y 200 de reserva. El encaje va en 10 de cada 100. Tiene 150 listos para prestar.",
    base: { depositos: 2000, encaje: 10, reserva: 200, credito: 150 },
    decisiones: [
      {
        id: "como-queda",
        etiqueta: "¿cumple el encaje?",
        tipo: CLASIFICACION,
        pregunta: "¿Cómo queda Sierra hoy?",
        respuesta: "justo",
        opciones: [
          {
            id: "falta",
            nombre: "Le falta reserva",
            lectura: "falta",
            retro: "❌ Diez de cada cien sobre 2.000 piden 200, y Sierra tiene 200. No le falta nada: está sobre la línea.",
          },
          {
            id: "justo",
            nombre: "Cumple justo",
            lectura: "justo",
            retro: "✅ Correcto. Piden 200 y tiene 200. Cumple, pero sin un peso de margen por encima de la línea.",
          },
          {
            id: "sobra",
            nombre: "Le sobra reserva",
            lectura: "sobra",
            retro: "❌ Sobrar sería tener más de 200. Sierra tiene exactamente 200: toca la línea y no la pasa.",
          },
        ],
      },
      {
        id: "retiro-de-cien",
        etiqueta: "si retiran 100",
        tipo: CONSECUENCIA,
        pregunta: "Un cliente retira 100 en efectivo. Los depósitos quedan en 1.900. ¿Qué pasa con el encaje de Sierra?",
        respuesta: "queda-corto",
        opciones: [
          {
            id: "queda-corto",
            nombre: "Queda corto: le quitan 100 de reserva y la línea solo cede 10",
            estado: { depositos: 1900, encaje: 10, reserva: 100, credito: 150 },
            retro: "✅ Exacto, y aquí está lo fino: el retiro sale entero de la reserva, pero el encaje solo cede diez de cada cien. Faltan 90.",
          },
          {
            id: "sigue-justo",
            nombre: "Sigue justo: bajan los depósitos y lo exigido baja igual",
            estado: { depositos: 1900, encaje: 10, reserva: 190, credito: 150 },
            retro: "❌ Las dos cifras no bajan a la par. El retiro se lleva 100 de reserva; lo exigido cede 10. Por eso cumplir justo es frágil.",
          },
          {
            id: "le-sobra",
            nombre: "Le sobra: con menos depósitos le piden menos reserva",
            estado: { depositos: 1900, encaje: 10, reserva: 200, credito: 150 },
            retro: "❌ Mira solo el lado de lo exigido y se olvida del otro. La reserva también se movió, y mucho más que la línea.",
          },
        ],
      },
    ],
  },
  {
    id: "nieve-sube-el-encaje",
    titulo: "Banco Nieve",
    hecho: "Nieve tiene 3.000 en depósitos y 300 de reserva. El encaje va en 10 de cada 100. Le quedan 180 para prestar.",
    base: { depositos: 3000, encaje: 10, reserva: 300, credito: 180 },
    decisiones: [
      {
        id: "como-queda",
        tipo: CLASIFICACION,
        etiqueta: "¿cumple el encaje?",
        pregunta: "¿Cómo queda Nieve hoy?",
        respuesta: "justo",
        opciones: [
          {
            id: "falta",
            nombre: "Le falta reserva",
            lectura: "falta",
            retro: "❌ Diez de cada cien sobre 3.000 piden 300, y Nieve tiene 300. Llega a la línea justo, no se queda corto.",
          },
          {
            id: "justo",
            nombre: "Cumple justo",
            lectura: "justo",
            retro: "✅ Sí. Piden 300 y tiene 300. Cumple, y sin un peso de margen: cualquier cosa que pase lo deja corto.",
          },
          {
            id: "sobra",
            nombre: "Le sobra reserva",
            lectura: "sobra",
            retro: "❌ Sobrar sería tener más de 300. Tiene exactamente 300: toca la línea y no la pasa.",
          },
        ],
      },
      {
        id: "sube-a-doce",
        tipo: CONSECUENCIA,
        etiqueta: "si el encaje sube a doce",
        pregunta: "El Banco sube el encaje a 12 de cada 100. Nieve no mueve nada todavía. ¿Cómo queda?",
        respuesta: "queda-corto",
        opciones: [
          {
            id: "queda-corto",
            nombre: "Queda corto: ahora piden 360 y tiene 300",
            estado: { depositos: 3000, encaje: 12, reserva: 300, credito: 180 },
            retro: "✅ Correcto. La línea sube a 360 y la reserva se queda en 300: le faltan 60 sin que nadie le haya tocado la plata.",
          },
          {
            id: "se-ajusta-solo",
            nombre: "Sigue justo: la reserva se ajusta al encaje nuevo",
            estado: { depositos: 3000, encaje: 12, reserva: 360, credito: 180 },
            retro: "❌ A nadie le sube la reserva por decreto. El encaje sube la línea; llegar a ella le toca al banco, y le cuesta.",
          },
          {
            id: "piden-menos",
            nombre: "Le sobra: con el encaje nuevo piden menos",
            estado: { depositos: 3000, encaje: 8, reserva: 300, credito: 180 },
            retro: "❌ Subir el encaje pide MÁS reserva, no menos. Le pusiste la línea más abajo de donde estaba.",
          },
        ],
      },
    ],
  },
  {
    id: "palma-le-sobra",
    titulo: "Banco Palma",
    hecho: "Palma tiene 5.000 en depósitos y 460 de reserva. El encaje va en 8 de cada 100. Le quedan 220 para prestar.",
    base: { depositos: 5000, encaje: 8, reserva: 460, credito: 220 },
    decisiones: [
      {
        id: "como-queda",
        tipo: CLASIFICACION,
        etiqueta: "¿cumple el encaje?",
        pregunta: "¿Cómo queda Palma hoy?",
        respuesta: "sobra",
        opciones: [
          {
            id: "falta",
            nombre: "Le falta reserva",
            lectura: "falta",
            retro: "❌ Ocho de cada cien sobre 5.000 piden 400, y Palma guarda 460. Está por encima de la línea, no por debajo.",
          },
          {
            id: "justo",
            nombre: "Cumple justo",
            lectura: "justo",
            retro: "❌ Justo sería con 400 exactos. Palma tiene 460: sesenta más de los que le piden.",
          },
          {
            id: "sobra",
            nombre: "Le sobra reserva",
            lectura: "sobra",
            retro: "✅ Así es. Piden 400 y tiene 460. Esos 60 de más están quietos sin que ninguna norma los obligue a estarlo.",
          },
        ],
      },
      {
        id: "presta-lo-que-sobra",
        tipo: CONSECUENCIA,
        etiqueta: "si presta lo que sobra",
        pregunta: "Palma presta los 60 que le sobran. ¿Qué cambia?",
        respuesta: "baja-a-la-linea",
        opciones: [
          {
            id: "baja-a-la-linea",
            nombre: "La reserva baja a 400 y el crédito nuevo sube a 280",
            estado: { depositos: 5000, encaje: 8, reserva: 400, credito: 280 },
            retro: "✅ Eso es. Puede bajar hasta la línea y ni un peso más: el encaje es un piso, no una cifra que se negocie.",
          },
          {
            id: "presta-sin-tocar",
            nombre: "El crédito nuevo sube a 280 y la reserva se queda en 460",
            estado: { depositos: 5000, encaje: 8, reserva: 460, credito: 280 },
            retro: "❌ Los 60 que presta salen de la reserva. No se puede prestar la misma plata y seguir teniéndola guardada.",
          },
          {
            id: "se-pasa-de-largo",
            nombre: "La reserva baja a 340 y el crédito nuevo sube a 340",
            estado: { depositos: 5000, encaje: 8, reserva: 340, credito: 340 },
            retro: "❌ Te pasaste de la línea. Prestar 120 deja la reserva en 340, por debajo de los 400 que le exigen: eso ya es incumplir.",
          },
        ],
      },
    ],
  },
];

/* ═══════════════ LO QUE LEE EL PANEL DOCENTE ═══════════════ */

/*
 * El id de un ítem es «caso:decision», así que la etiqueta es la pregunta de
 * un rótulo corto de esa decisión con el nombre del caso delante. Corto y no
 * la pregunta entera porque la tabla del profesor corta a los 70 caracteres, y
 * sin el caso las tres lecturas de Aurora y Sierra se leerían igual.
 */
const bancos = {
  [TASA.id]: CASOS_TASA,
  [REPO.id]: CASOS_REPO,
  [ENCAJE.id]: CASOS_ENCAJE,
};

export function itemsDe(actividadId) {
  return (bancos[actividadId] ?? []).flatMap((c) => c.decisiones.map((d) => `${c.id}:${d.id}`));
}

export function etiquetaDeInstrumento(actividadId, id) {
  const [caso, decision] = String(id ?? "").split(":");
  const c = (bancos[actividadId] ?? []).find((x) => x.id === caso);
  const d = c?.decisiones.find((x) => x.id === decision);
  return d ? `${c.titulo} · ${d.etiqueta}` : null;
}
