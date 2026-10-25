import { DEBE, HABER, LAVADO_DE_AUTOS } from "./contabilidad.js";
import { COMPUESTAS_SUELTAS } from "./contabilidadActividades.js";

/*
 * ═══════════════════════════════════════════════════════════════════════════
 * T2 · LAS TRES HACER NUEVAS (Célula C, lotes T2-2 a T2-5, issue #471).
 *
 *   8.º  cu-cuadra-por-valor        Cuadra por valor        Medio · 25 FP
 *   9.º  cu-del-diario-al-mayor     Del diario al mayor     Medio · 25 FP
 *   10.º cu-las-que-vuelven-a-cero  Las que vuelven a cero  Fácil · 10 FP
 *
 * La forma es la de Watari (c-t2-1-watari-tres-hacer.html) y los ids, el
 * orden, el nivel y los FP los decidió L (c-t2-1-decisiones-l.md §1). Ninguno
 * reusa los cinco ids retirados en la 0043.
 *
 * LOS BANCOS SON LOS DE NEAR (c-t2-2-near-lote.md §1), LETRA POR LETRA. Lo
 * comprueba t2-tres-hacer-nuevas.test.mjs leyendo el paquete. Encima van la
 * auditoría de Mello (c-t2-3-mello-auditoria.md §2) y el delta de Near T2-4
 * (c-t2-4-near-delta.md): también letra por letra, con su prueba. Lote T2-10
 * (L, «Auditoría T2-9»): E3 de Mello T2-9 §4.1 y los textos del delta de Near
 * T2-9 (porqué de origen, acierto de «revisar», J3, pies y «Así se juega»),
 * también letra por letra. Ya no queda texto de muestra en este archivo.
 * Y VC·1, VC·3 y VC·7 de «Las que vuelven a cero», que se repetían con P2
 * (Mello T2-9 §4.2): nombres, porqués y retros de Near T2-10 (c-t2-10-near-
 * textos.md §2), con los mismos saldos.
 *
 * Las tres van `pendiente: true` en subjects.js hasta que corra la 0116.
 * ═══════════════════════════════════════════════════════════════════════════
 */


export const IDS_T2_NUEVAS = ["cu-cuadra-por-valor", "cu-del-diario-al-mayor", "cu-las-que-vuelven-a-cero"];

/* La ficha de cada una, con la forma de ACTIVIDADES (contabilidadActividades.js). */
export const FICHAS_T2_NUEVAS = [
  { id: "cu-cuadra-por-valor", nombre: "Cuadra por valor", bloque: "APLICACIÓN",
    dificultad: "medio", fpBase: 25, subtema: "Partida doble: igualdad del debe y el haber" },
  { id: "cu-del-diario-al-mayor", nombre: "Del diario al mayor", bloque: "APLICACIÓN",
    dificultad: "medio", fpBase: 25, subtema: "Libro mayor y mayorización" },
  /* [regla] por `clase`: el subtema de cada ítem sale de SUBTEMA_POR_CLASE. */
  { id: "cu-las-que-vuelven-a-cero", nombre: "Las que vuelven a cero", bloque: "CIMIENTOS",
    dificultad: "facil", fpBase: 10, subtema: "Clasificación de cuentas nominales" },
];

export const SUBTEMA_POR_CLASE = {
  real: "Clasificación de cuentas reales",
  nominal: "Clasificación de cuentas nominales",
};

/* El objetivo (H1) de cada una: Near, §1.1, §1.2 y §1.3. */
export const OBJETIVO_T2_NUEVAS = {
  "cu-cuadra-por-valor": "Al terminar, sabrás comprobar que un asiento cuadra por el valor de sus dos lados, no por el número de cuentas.",
  "cu-del-diario-al-mayor": "Al terminar, sabrás llevar cada renglón del diario a su cuenta del mayor, y encontrar de dónde salió.",
  "cu-las-que-vuelven-a-cero": "Al terminar, sabrás qué cuentas vuelven a cero en el cierre y cuáles pasan al año siguiente con su saldo.",
};

/* Las consignas de Near, por tipo de ítem. La de «Las que vuelven a cero» lleva la cuenta. */
export const CONSIGNAS_CUADRA = {
  completar: "Escribe el valor que hace que el debe y el haber sumen lo mismo.",
  juzgar: "¿Este asiento cuadra?",
  encontrar: "Toca el renglón que descuadra el asiento.",
};
export const CONSIGNAS_DIARIO = {
  destino: "Toca la cuenta del mayor donde va el renglón marcado.",
  origen: "Toca el renglón del diario de donde salió esta línea del mayor.",
  /* La de Mello (c-t2-3-mello-auditoria.md §1.2), la que repite Near en su delta T2-4 §2. */
  revisar: "El mayor ya está pasado. Toca la línea que no coincide con el diario.",
};
export const CONSIGNA_CERO = "Llega el cierre de 20X1. ¿Qué pasa con {cuenta}?";
export const consignaCero = (cuenta) => CONSIGNA_CERO.replace("{cuenta}", cuenta.nombre);

/* La consigna que enseña «Así se juega», una por Hacer: la de Near, delta T2-9. */
export const CONSIGNA_T2_NUEVAS = {
  "cu-cuadra-por-valor": "Completa el valor que falta, di si el asiento cuadra o toca el renglón que lo descuadra. Mira los totales, no cuántas cuentas hay.",
  "cu-del-diario-al-mayor": "Lleva cada renglón a su cuenta del mayor, busca de dónde salió cada línea y encuentra la que está mal pasada. El lado se copia del diario.",
  "cu-las-que-vuelven-a-cero": "Llega el cierre del año. Decide si cada cuenta vuelve a cero o pasa al año siguiente con su saldo.",
};

/* El pie de fuente de cada Hacer (H2): Near, delta T2-9. */
export const PIE_T2_NUEVAS = {
  "cu-cuadra-por-valor": "Basado en el libro: casos de Lavado de Autos Mateo (pp. 98-101) y de Caleja. Los errores están puestos a propósito.",
  "cu-del-diario-al-mayor": "Basado en el libro: Lavado de Autos Mateo, pp. 98-101. Los errores del mayor están puestos a propósito.",
  "cu-las-que-vuelven-a-cero": "Basado en el libro: las cuentas son del libro y los saldos, simulados.",
};

/* ═══════════════════════ 8.º · CUADRA POR VALOR ═══════════════════════ */

/* Una línea del asiento con la forma de Watari: { cuenta, lado, monto }. */
const lineasDe = (asiento) => [
  ...asiento.debe.map(([cuenta, monto]) => ({ cuenta, lado: DEBE, monto })),
  ...asiento.haber.map(([cuenta, monto]) => ({ cuenta, lado: HABER, monto })),
];
const deLavado = (id) => LAVADO_DE_AUTOS.transacciones.find((t) => t.id === id).asiento;
const suelta = (id) => COMPUESTAS_SUELTAS.find((s) => s.id === id).asiento;
const conHueco = (lineas, cuenta) => lineas.map((l) => (l.cuenta === cuenta ? { ...l, monto: null } : l));
const D = (cuenta, monto) => ({ cuenta, lado: DEBE, monto });
const H = (cuenta, monto) => ({ cuenta, lado: HABER, monto });

/* El pie de la actividad (Near T2-9); J3 lleva su propia fuente, porque no tiene error puesto. */
const PIE_CUADRA = PIE_T2_NUEVAS["cu-cuadra-por-valor"];

/*
 * El banco de Near, §1.1, con la auditoría de Mello (c-t2-3-mello-auditoria.md
 * §2.1, aceptada por L en «Auditoría T2-3») y el delta de Near T2-4 §1: 8 casos,
 * 2 de completar (K), 3 de juzgar (J) y 3 de encontrar (E). Se juegan los 8; el
 * orden se baraja dentro de cada tipo.
 *   - K3 pasó a juzgar como J3 («Cuadra»): con J1 y J2, que dicen «No cuadra»,
 *     la respuesta ya no es constante (H3, D5).
 *   - E1, E2 y E3 son los de Mello: tres renglones y uno solo malo, que se
 *     encuentra por el valor. Los retros de sus líneas buenas, de Near (T2-4 §1).
 *   - J1 y J2 llevan los enunciados de Mello (66,2 y 66,3).
 *   - E3 dice «del computador», igual que cal-2 y J2 (L, lote T2-4).
 * Trampas de Watari: J3 (3 contra 1 que sí cuadra), J2 (2 contra 2 que no),
 * J2 y E3 (error en el monto). Errores de Mello: traspuesto J2 y E3 (la
 * diferencia se divide por 9), lado contrario E1, omitido J1, renglón de más E2.
 *
 *   completar  { lineas (una con monto null), correcta, distractores: [{ valor, retro }], porque }
 *   juzgar     { hecho, lineas, cuadra, porque, retroMala }   retroMala = el retro de la opción mala
 *   encontrar  { hecho, lineas, linea: [índices que se aceptan], porque, retros: { índice: texto } }
 */
export const CUADRA_POR_VALOR = {
  subtema: FICHAS_T2_NUEVAS[0].subtema,
  porPartida: 8,
  casos: [
    {
      id: "cpv-k1", tipo: "completar", fuente: "cu10-computador-mitad", pie: PIE_CUADRA,
      lineas: conHueco(lineasDe(suelta("cu10-computador-mitad")), "Cuentas por pagar"),
      correcta: 750000,
      distractores: [
        { valor: 1500000, retro: "Copiaste el total del debe. Así el haber se pasa en $750.000: resta lo que ya pone Caja." },
        { valor: 2250000, retro: "Sumaste Caja en vez de restarla. Así el haber se pasa en $1.500.000." },
      ],
      porque: "El debe suma $1.500.000. En el haber ya hay $750.000 de Caja, así que la deuda es $750.000.",
    },
    {
      id: "cpv-k2", tipo: "completar", fuente: "lavado:ene-12", pie: PIE_CUADRA,
      lineas: conHueco(lineasDe(deLavado("ene-12")), "Bancos"),
      correcta: 500,
      distractores: [
        { valor: 2500, retro: "Copiaste el total del debe. Así el haber se pasa en $2.000: resta lo que ya pone Cuentas por pagar." },
        { valor: 4500, retro: "Sumaste Cuentas por pagar en vez de restarla. Así el haber se pasa en $4.000." },
      ],
      porque: "El debe suma $2.500. En el haber ya hay $2.000 de Cuentas por pagar, así que Bancos es $500.",
    },
    {
      /* Omitido: falta la línea de Caja de cu10-socio-vehiculo. El hecho es el de Mello. */
      id: "cpv-j1", tipo: "juzgar", fuente: "cu10-socio-vehiculo (omitido)", pie: PIE_CUADRA,
      hecho: "Entra un socio nuevo. Aporta un vehículo de $2.000.000 y $1.000.000 en efectivo.",
      lineas: [D("Flota y equipo de transporte", 2000000), H("Aportes sociales", 3000000)],
      cuadra: false,
      porque: "Falta un renglón. La diferencia es $1.000.000, justo el efectivo que aportó el socio y nadie anotó.",
      retroMala: "Una cuenta contra una parece pareja. Pero el debe suma $2.000.000 y el haber, $3.000.000.",
    },
    {
      /* 2 contra 2 + traspuesto. Caleja cal-2 y cal-3 en un asiento; lo construido es el 52.000. El hecho es el de Mello. */
      id: "cpv-j2", tipo: "juzgar", fuente: "caleja:cal-2+cal-3 (traspuesto)", pie: PIE_CUADRA,
      hecho: "Caleja compra un computador de $25.000 a crédito. También compra maquinaria de $50.000 con un préstamo del banco.",
      lineas: [D("Equipo de computación", 52000), D("Maquinaria", 50000), H("Cuentas por pagar", 25000), H("Obligaciones financieras", 50000)],
      cuadra: false,
      porque: "La diferencia es $27.000, y se divide justo por 9. Es la señal de dos cifras invertidas: 52.000 por 25.000.",
      retroMala: "Dos contra dos parece parejo. Pero el debe suma $102.000 y el haber, $75.000.",
    },
    {
      /*
       * Trampa 3 contra 1 que SÍ cuadra: era K3 (Mello §2.1-1). Une los aportes
       * de Lavado del 2 y del 25 de enero; el Equipo de computación es construido.
       * retroMala es el retro de «No cuadra» de Mello y el porqué, el de K3. El
       * hecho y la fuente del ítem (su pie) son los de Near, delta T2-9.
       */
      id: "cpv-j3", tipo: "juzgar", fuente: "lavado:ene-02+ene-25 (construido; era K3)",
      pie: "Basado en el libro: une los aportes de Lavado del 2 y del 25 de enero. El aporte del computador es construido.",
      hecho: "Los socios aportan $5.000 al banco, $1.000 en caja y un computador de $2.000.",
      lineas: [D("Bancos", 5000), D("Caja", 1000), D("Equipo de computación", 2000), H("Acciones", 8000)],
      cuadra: true,
      porque: "Tres cuentas contra una, y cuadra. El debe suma $8.000, así que Acciones es $8.000.",
      retroMala: "Tres cuentas contra una parece dispar. Pero el debe suma $8.000 y el haber también.",
    },
    {
      /* Lado contrario (Mello): Caja en el debe. Base cal-4; Bancos es construido. */
      id: "cpv-e1", tipo: "encontrar", fuente: "caleja:cal-4 (lado contrario; Bancos construido)", pie: PIE_CUADRA,
      hecho: "Caleja abona $10.000 a la deuda del computador. Paga $6.000 en efectivo y $4.000 con un cheque.",
      lineas: [D("Cuentas por pagar", 10000), D("Caja", 6000), H("Bancos", 4000)],
      linea: [1],
      porque: "Caja pagó, así que baja y va al haber. En el debe sobran $12.000, el doble de $6.000.",
      retros: {
        0: "Pensaste que la deuda no podía ir al debe. Abonar la baja, así que va bien ahí. Mira por dónde salió la plata.",
        2: "Pensaste que el cheque estaba mal puesto. Bancos paga $4.000 y baja, así que va en el haber. El efectivo salió igual.",
      },
    },
    {
      /* Renglón de más (Mello): Caja sobra; el aporte es el local. */
      id: "cpv-e2", tipo: "encontrar", fuente: "caleja:cal-5 (renglón de más)", pie: PIE_CUADRA,
      hecho: "Los socios aportan un local comercial de $100.000.",
      lineas: [D("Local comercial", 100000), D("Caja", 100000), H("Aportes sociales", 100000)],
      linea: [1],
      porque: "Caja no entra: el aporte fue el local y no trajo efectivo. Por eso el debe se pasa en un renglón entero.",
      retros: {
        0: "El local es el aporte de los socios, así que su renglón va. Sobra el que el hecho no nombra.",
        2: "Aportes sociales es la otra cara del aporte y va bien en el haber. Sobra un renglón que el hecho no nombra.",
      },
    },
    {
      /*
       * Traspuesto (Mello): 360 escrito 630. Mello T2-9 §4.1 (lote T2-10): el
       * cheque pasa de $650 a $760, porque el Aprender ya mostraba el pago de
       * $250 (P1·6); hecho, renglones, porqué y retro de Bancos son los suyos.
       * El retro de Hipoteca sigue siendo el de Near (T2-4 §1).
       */
      id: "cpv-e3", tipo: "encontrar", fuente: "lavado:ene-18+ene-30 (traspuesto; cheque de Mello T2-9)", pie: PIE_CUADRA,
      hecho: "Con un cheque de $760 abona $400 a la hipoteca y el resto a la deuda del computador.",
      lineas: [D("Cuentas por pagar", 630), D("Hipoteca por pagar", 400), H("Bancos", 760)],
      linea: [0],
      porque: "La deuda del computador recibe lo que queda del cheque: $360. Aquí dice $630, y la diferencia de $270 se divide por 9.",
      retros: {
        1: "Hipoteca coincide: el hecho dice $400. Resta, y mira cuánto le toca al otro abono.",
        2: "Viste que no cuadra y culpaste al total. El cheque fue de $760, y eso dice Bancos. Revisa los abonos.",
      },
    },
  ],
};

/* ═══════════════════════ 9.º · DEL DIARIO AL MAYOR ═══════════════════════ */

const asientoDeLavado = (id) => {
  const t = LAVADO_DE_AUTOS.transacciones.find((x) => x.id === id);
  return { fecha: t.fecha, lineas: lineasDe(t.asiento) };
};

/* El porqué del acierto en destino, uno para todos (Near). */
export const PORQUE_DESTINO = "En el diario, este valor es de esta cuenta. El mayor lo guarda en su T, del mismo lado.";

/*
 * Los retros salen de una regla (Near): cada cuenta o renglón malo lleva la
 * letra de su plantilla y el nombre se pone al jugar.
 *   destino  A otra cuenta del mismo asiento · B una cuenta que no está en ese
 *            asiento · C una cuenta con la misma cifra
 *   origen   oA la misma cuenta en otra fecha · oB el mismo día y otra cuenta ·
 *            oC la misma cifra y otra cuenta · oD ni la cuenta ni la fecha
 * {cuenta} es la cuenta tocada (o la del renglón tocado), {fecha} la del
 * renglón tocado («8 de enero») y {cuenta del mayor} la de la línea encendida.
 */
export const PLANTILLAS_DIARIO = {
  A: "Así, {cuenta} se queda con un renglón de su vecino de asiento. El mayor junta por cuenta, no por fecha.",
  B: "Así, {cuenta} tendría un valor de un asiento donde no aparece.",
  C: "Así, {cuenta} se queda con un valor solo porque la cifra es igual. Busca la cuenta, no el número.",
  oA: "Ese renglón es de {cuenta}, pero del {fecha}. Mira la fecha de la línea del mayor.",
  oB: "Ese renglón es del mismo día, pero de {cuenta}. La línea del mayor es de {cuenta del mayor}.",
  oC: "Tiene la misma cifra, pero es de {cuenta}. Busca la cuenta, no solo el valor.",
  oD: "Ese renglón es de {cuenta}, del {fecha}: no coinciden ni la cuenta ni la fecha.",
};

/*
 * «Revisar» (el punteo), delta de Near T2-4 §2: la retro de una línea BUENA
 * tocada sale de una plantilla por tipo de error del ítem. La línea tocada
 * enciende su renglón del diario, y el cotejo (calculado) ya muestra que coinciden.
 *   Rv cuenta vecina · Rt cifra traspuesta · Rl lado contrario
 * Mello, auditoría T2-5 §2.3 (lote T2-6): sin su primera oración («Esa línea
 * coincide con su renglón del diario.»), que repetía la frase de Watari.
 */
export const PLANTILLAS_REVISAR = {
  Rv: "Busca un valor que cayó en la T de otra cuenta del mismo asiento.",
  Rt: "Compara cada cifra con la del diario, dígito por dígito.",
  Rl: "Compara el lado de cada valor con el lado que tiene en el diario.",
};
/* La frase del error en «revisar» (Watari, c-t2-4-watari-figuras.md §2): la consecuencia de tocar una línea buena. */
export const COINCIDE_REVISAR = "Esta línea coincide con su renglón en cuenta, lado y monto.";
/* La frase del acierto en «revisar», en neutro (Watari T2-4 §2; texto de Near, delta T2-9). */
export const ACIERTO_REVISAR = "Encontraste el error del mayor. Esa línea no coincide con su renglón del diario.";
/* La pastilla del veredicto en «revisar», en la fila de estado (Watari §2). */
export const IBA_REVISAR = "Iba en la línea punteada";

const FLOTA = "Flota y equipo de transporte";
const LETRAS = "Letras por pagar";
const EQUIPO = "Equipo de computación";
const CXP = "Cuentas por pagar";
const MUEBLES = "Muebles y enseres";

/*
 * El caso de Lavado del 2 al 12 de enero (CORTE_SET_A), recortado al tope de
 * Watari (4 cuentas y 7 renglones): dos casos de Near. Cada partida juega uno
 * y se alternan por intento (D8).
 *
 * Auditoría T2-3 de Mello, aceptada por L (C1 entre ítems): se quitaron los
 * destino A1, A4, B4 y B5, que eran el inverso de un origen; los ids de los
 * que quedan no cambian. Cada caso: 3 destino, 2 origen y 2 revisar. El mayor
 * llega con los renglones de origen ya pasados, y la cuadrícula de T se baraja
 * en cada intento (H6, en la lógica).
 *
 * Los renglones se cuentan desde 0 en el orden del diario; Near los cuenta
 * desde 1 (su r4 es nuestro renglón 3).
 *   destino  { renglon, retros: { cuenta: plantilla } }
 *   origen   { renglon, porque, retros: { índice de renglón: plantilla } }
 *   revisar  { renglon, fila, error, mal: { r, cuenta, lado, monto }, porque, retros: { r: plantilla } }
 *            `mal` es la línea mal pasada, con la forma de Watari; `renglon`
 *            es su r. Una sola línea por ítem trae un campo distinto de su
 *            renglón: el cotejo se calcula comparando (cotejoDe), no se escribe.
 *            `fila` es el ítem de Near (A6…B7): los ids de «revisar» no reusan
 *            ddm-a-6/7, que ya son de origen.
 * Orden de juego: destino por fecha, origen barajados y los dos revisar al final, 1 y 2.
 * El `porque` de los cuatro de origen es el de Near, delta T2-9 (A·o1, A·o2,
 * B·o1 y B·o2): cada uno nombra la trampa del renglón que se parece.
 */
export const DEL_DIARIO_AL_MAYOR = {
  subtema: FICHAS_T2_NUEVAS[1].subtema,
  casos: [
    {
      id: "ddm-a",
      empresa: LAVADO_DE_AUTOS.empresa,
      asientos: [asientoDeLavado("ene-02"), asientoDeLavado("ene-04")],
      cierre: "El diario suma $9.800 en el debe y $9.800 en el haber. El mayor suma lo mismo: son los mismos datos.",
      items: [
        { id: "ddm-a-2", tipo: "destino", renglon: 1, retros: { Bancos: "C", [FLOTA]: "B", [LETRAS]: "B" } },
        { id: "ddm-a-3", tipo: "destino", renglon: 2, retros: { Bancos: "A", [LETRAS]: "A", Acciones: "B" } },
        { id: "ddm-a-5", tipo: "destino", renglon: 4, retros: { [FLOTA]: "A", Bancos: "A", Acciones: "B" } },
        { id: "ddm-a-6", tipo: "origen", renglon: 3, retros: { 0: "oA", 2: "oB", 4: "oB", 1: "oD" },
          porque: "La línea es de Bancos, del 4 de enero, con $800 en el haber. Solo el renglón del pago desde Bancos dice eso." },
        { id: "ddm-a-7", tipo: "origen", renglon: 0, retros: { 1: "oC", 3: "oA", 2: "oD", 4: "oD" },
          porque: "La línea es de Bancos, del 2 de enero, con $5.000 en el debe. Es el aporte que entró al banco, no las Acciones del mismo día." },
        /* A6 es el de Mello (auditoría T2-5 §2.2, lote T2-6): los $4.000 caen en el haber de Bancos, no en Flota, para que A6 y A7 no caigan en la misma T (D5). */
        { id: "ddm-a-r1", fila: "A6", tipo: "revisar", error: "cuenta vecina", renglon: 4,
          mal: { r: 4, cuenta: "Bancos", lado: HABER, monto: 4000 },
          porque: "El 4 de enero, los $4.000 son de Letras por pagar. En el mayor cayeron en Bancos, su vecina de asiento.",
          retros: { 0: "Rv", 3: "Rv", 1: "Rv", 2: "Rv" } },
        { id: "ddm-a-r2", fila: "A7", tipo: "revisar", error: "cifra traspuesta", renglon: 2,
          mal: { r: 2, cuenta: FLOTA, lado: DEBE, monto: 8400 },
          porque: "El diario da $4.800 a Flota y el mayor dice $8.400. Son las mismas cifras invertidas: la diferencia, $3.600, se divide por 9.",
          retros: { 0: "Rt", 3: "Rt", 1: "Rt", 4: "Rt" } },
      ],
    },
    {
      id: "ddm-b",
      empresa: LAVADO_DE_AUTOS.empresa,
      asientos: [asientoDeLavado("ene-08"), asientoDeLavado("ene-12")],
      cierre: "El diario suma $4.500 en el debe y $4.500 en el haber. El mayor suma lo mismo: son los mismos datos.",
      items: [
        { id: "ddm-b-1", tipo: "destino", renglon: 0, retros: { [CXP]: "A", [MUEBLES]: "B", Bancos: "B" } },
        { id: "ddm-b-2", tipo: "destino", renglon: 1, retros: { [EQUIPO]: "A", [MUEBLES]: "B", Bancos: "B" } },
        { id: "ddm-b-3", tipo: "destino", renglon: 2, retros: { Bancos: "A", [CXP]: "A", [EQUIPO]: "B" } },
        { id: "ddm-b-6", tipo: "origen", renglon: 4, retros: { 1: "oA", 0: "oC", 2: "oB", 3: "oB" },
          porque: "La línea es de Cuentas por pagar, del 12 de enero. El renglón del 8 tiene la misma cuenta y la misma cifra, pero otra fecha." },
        { id: "ddm-b-7", tipo: "origen", renglon: 3, retros: { 2: "oB", 4: "oB", 0: "oD", 1: "oD" },
          porque: "La línea es de Bancos, del 12 de enero, con $500 en el haber. Es el pago de los muebles, no los muebles mismos." },
        { id: "ddm-b-r1", fila: "B6", tipo: "revisar", error: "lado contrario", renglon: 3,
          mal: { r: 3, cuenta: "Bancos", lado: DEBE, monto: 500 },
          porque: "En el diario, los $500 de Bancos están en el haber, porque el banco pagó. En el mayor quedaron en el debe.",
          retros: { 0: "Rl", 1: "Rl", 2: "Rl", 4: "Rl" } },
        { id: "ddm-b-r2", fila: "B7", tipo: "revisar", error: "cifra traspuesta", renglon: 2,
          mal: { r: 2, cuenta: MUEBLES, lado: DEBE, monto: 5200 },
          porque: "El diario da $2.500 a Muebles y enseres, y el mayor dice $5.200. Son las cifras invertidas: la diferencia, $2.700, se divide por 9.",
          retros: { 0: "Rt", 1: "Rt", 3: "Rt", 4: "Rt" } },
      ],
    },
  ],
};

/* ═══════════════════════ 10.º · LAS QUE VUELVEN A CERO ═══════════════════════ */

export const VUELVE_A_CERO = "cero";
export const PASA_CON_SALDO = "pasa";

/* Las dos opciones de Near (binaria) y la ceja de cada pantalla. */
export const OPCIONES_CERO = {
  [VUELVE_A_CERO]: "Vuelve a cero en el cierre",
  [PASA_CON_SALDO]: "Pasa al año siguiente con su saldo",
};
export const ROTULO_CERO = "Escenario simulado";

/*
 * El banco de Near, §1.3: cierre de año, no de mes (decisión de Near que L
 * aceptó). 8 cuentas: 2 ingresos, 2 gastos y 4 reales con un pasivo.
 * Lote T2-10 (Mello T2-9 §4.2, C1 con P2): VC·1, VC·3 y VC·7 son las de Near
 * T2-10 §2, con los mismos saldos; VC·7 deja de ser Costo de ventas (era el
 * único costo) y pasa a gasto. La utilidad sigue en $10.500.
 * Cada cuenta lleva su porqué y solo el retro de la opción mala que le toca
 * (`retroMala`); la familia se nombra en el retro.
 * Trampas: Cuentas por cobrar y Documentos por pagar (Near); lo pagado por
 * anticipado es activo y un cobro es Caja (Mello).
 */
export const LAS_QUE_VUELVEN_A_CERO = {
  subtema: FICHAS_T2_NUEVAS[2].subtema,
  caso: {
    empresa: "Lavado de Autos Mateo S.A.",
    anio: "20X1",
    anioSiguiente: "20X2",
    mes: "diciembre de 20X1",
    mesSiguiente: "enero de 20X2",
    /* El periodo de la caja de utilidad («= Utilidad del año»): sale de aquí, no del componente (Mello H2). */
    periodo: "año",
    cuentas: [
      { id: "lvc-ingresos-intereses", nombre: "Ingresos por intereses", clase: "nominal", familia: "ingreso", saldo: 12000,
        porque: "Es un ingreso: mide los intereses que la empresa ganó en el año. Al cierre, su saldo pasa a Ganancias y pérdidas.",
        retroMala: "Así, 20X2 empezaría con intereses que se ganaron en 20X1. Es un ingreso, y se cierra." },
      { id: "lvc-cuentas-por-cobrar", nombre: "Cuentas por cobrar", clase: "real", familia: "activo", saldo: 3000,
        porque: "Es lo que los clientes te deben. Esa plata sigue por cobrar el 1 de enero.",
        retroMala: "Así, los clientes dejarían de deberte el 1 de enero. Es un activo, y su saldo pasa." },
      { id: "lvc-gastos-arriendo", nombre: "Gastos por arriendo", clase: "nominal", familia: "gasto", saldo: 5000,
        porque: "Es un gasto del año. Se paga cada mes y aun así se cierra, porque mide el año.",
        retroMala: "Pagarlo cada mes no lo deja abierto. Es un gasto: mide el año y vuelve a cero." },
      { id: "lvc-documentos-por-pagar", nombre: "Documentos por pagar", clase: "real", familia: "pasivo", saldo: 2500,
        porque: "Es una deuda firmada. La deuda no se borra con el cierre: sigue en 20X2.",
        retroMala: "Así, la deuda desaparecería con el cierre. Es un pasivo, y su saldo pasa." },
      { id: "lvc-ingresos-ventas", nombre: "Ingresos por ventas", clase: "nominal", familia: "ingreso", saldo: 8000,
        porque: "Es un ingreso del año. Su saldo se va a Ganancias y pérdidas y la cuenta queda en $0.",
        retroMala: "Así, las ventas de 20X1 se sumarían a las de 20X2. Un ingreso mide un solo año." },
      /*
       * El nombre es el de L (T2-2, hueco 2) y los textos, los del delta de
       * Near T2-3 §2 (VC·6), que ya no dependen del nombre.
       */
      { id: "lvc-seguros-anticipado", nombre: "Seguros pagados por anticipado", clase: "real", familia: "activo", saldo: 1200,
        porque: "Es un activo: un seguro que ya pagaste y que te cubre en 20X2. Sigue el 1 de enero.",
        retroMala: "Así, perderías un seguro que ya pagaste y que aún te cubre. Es un activo, no un gasto." },
      { id: "lvc-gasto-venta-fletes", nombre: "Gasto de venta – fletes", clase: "nominal", familia: "gasto", saldo: 4500,
        porque: "Es un gasto: lo que costó llevar lo vendido en el año. Se cierra como los demás gastos.",
        retroMala: "Así, 20X2 cargaría con los fletes de lo que se vendió en 20X1. Es un gasto, y se cierra." },
      { id: "lvc-caja", nombre: "Caja", clase: "real", familia: "activo", saldo: 6000,
        porque: "Es el dinero que hay en la caja, también el que cobraste. Cobrar no es un ingreso: es Caja, y su saldo pasa.",
        retroMala: "Así, en 20X2 Caja diría $0, y el dinero sigue ahí. Lo cobrado es Caja, no un ingreso." },
    ],
  },
  /* El puente con el desafío (Near). Ingresos $20.000 − gastos $9.500 = $10.500. */
  textoFinal: "El cierre deja la utilidad del año, $10.500, lista para pasar al patrimonio. Con eso empieza El Ciclo Completo.",
};
