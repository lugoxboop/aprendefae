/*
 * ═══════════════════════════════════════════════════════════════════════════
 * T4 · H5 DE HACER — «¿Al empleado o al gasto?» (Célula D).
 *
 * Fuente: el paquete vigente de Katsumi, d4-t4-h5-v1.md (ya trae la parte de
 * H5 de d4-t4-h3-h5-a4-v2-cambios.md: el 30 de abril y el 30 de junio).
 * Copia en orquestador/conocimiento/paquetes/, el mismo blob que en main. Una
 * prueba compara cada texto de aquí contra él, letra por letra.
 *
 * Hacer · evaluativa · difícil · 50 FP. El motor compartido escala los FP con
 * los aciertos. Su fila del servidor es la migración 0204, que corre Erwin.
 *
 * Cuatro casos construidos; cada intento juega dos, uno de cada decisión
 * (cobrar al empleado / asumir como gasto), en orden barajado (D8). El
 * estudiante arma el asiento COMPLETO del reembolso con ConstructorAsiento
 * (compartido, sin cambiarlo, con cifras): cuentas, lados y valores. El
 * enunciado dice qué decidió la empresa (HD4-6). Un intento por caso.
 *
 * Las cifras: el fondo, los gastos y el efectivo de cada caso son datos
 * construidos; la suma, el faltante y el cheque SE CALCULAN. El asiento
 * correcto se arma con ellas. Los textos que nombran cifras se arman igual,
 * y una prueba los compara con el paquete.
 *
 * El error: se muestra UN mensaje, el primero de la lista de Katsumi que
 * aplique (del error conceptual al mecánico).
 * ═══════════════════════════════════════════════════════════════════════════
 */

export const H5_ID = "t4-al-empleado-o-al-gasto";

export const DEBE = "debe";
export const HABER = "haber";

export const H5 = {
  id: H5_ID,
  nombre: "¿Al empleado o al gasto?",
  objetivo: "Armar el asiento del reembolso cuando falta plata en la caja menor, según lo que decida la empresa.",
  consigna: [
    "Cada caso trae una caja menor a la que le falta plata, y lo que decidió la empresa. Arma el asiento del reembolso: cuentas, lados y valores.",
    "Antes de armarlo, calcula cuánto falta y por cuánto sale el cheque.",
  ],
};

export const EMPLEADO = "empleado";
export const GASTO = "gasto";
export const SUBTEMAS_H5 = ["Faltante cobrado al empleado", "Faltante asumido como gasto"];

/*
 * Las seis cuentas, en el orden del paquete. Los nombres con raya llevan
 * espacio duro antes de la raya y dentro del sufijo, para que el único corte
 * posible quede después de la raya (Hanayama H5 v1 §2). Esa es la única
 * diferencia con el nombre del paquete; NOMBRE_DE la deshace para comparar.
 */
const NB = " ";
const conRaya = (nombre) => nombre.replace(/ – (.+)$/, (_, sufijo) => `${NB}– ${sufijo.replace(/ /g, NB)}`);
export const GASTOS_GENERALES = "Gastos generales";
export const CXC_EMPLEADOS = conRaya("Cuentas por cobrar – empleados");
export const GASTOS_FALTANTE = conRaya("Gastos no operacionales – faltante de caja menor");
export const INGRESOS_SOBRANTE = conRaya("Ingresos no operacionales – sobrante de caja menor");
export const CAJA_MENOR = "Caja menor";
export const BANCOS = "Bancos";
export const CUENTAS_H5 = [GASTOS_GENERALES, CXC_EMPLEADOS, GASTOS_FALTANTE, INGRESOS_SOBRANTE, CAJA_MENOR, BANCOS];
/* El nombre tal como lo escribe el paquete: con espacios normales. */
export const nombreDe = (cuenta) => cuenta.replace(/ /g, " ");

/*
 * Textos de interfaz que el paquete no traía. «Confirmar el asiento» es de la
 * pantalla de Hanayama (H5 v1 §1); los demás, la convención de los Hacer de
 * T4. Katsumi los revisó: la fuente es d4-t4-h5-v1.md, «Textos de interfaz».
 * Cambió uno, FALTAN_FILAS: el mío decía «Pon al menos tres cuentas…», que
 * delataba cuántas líneas tiene el asiento.
 */
export const BOTON_H5 = { confirmar: "Confirmar el asiento", siguiente: "Siguiente caso", verResumen: "Ver mi resumen", otraVez: "Otra vez" };
export const CORRECTO = "Correcto.";
export const INCORRECTO = "Incorrecto.";
export const FALTAN_FILAS = "A cada cuenta ponle su lado y su valor. Tiene que haber al menos una al debe y una al haber.";
export const ROTULO_ASIENTO_H5 = "EL ASIENTO CORRECTO";
export const resumenH5 = (bien, cuantos) => `${bien} de ${cuantos} asientos bien armados.`;

/* ═══════════ LOS ERRORES, EN EL ORDEN DE KATSUMI ═══════════ */

export const ERRORES_H5 = [
  "toca_caja_menor", "cuenta_de_sobrante", "cuenta_del_otro_camino", "faltante_al_haber",
  "bancos_igual_a_gastos", "bancos_resta", "faltante_como_saldo_esperado", "gastos_con_otro_valor",
];

/*
 * Cuándo aplica cada error, sobre el asiento armado: una lista de
 * { cuenta, lado, valor }. Leído de la lista del paquete.
 */
function erroresQueAplican(c, lineas) {
  const de = (cuenta) => lineas.filter((l) => l.cuenta === cuenta);
  const estaCuenta = c.decision === EMPLEADO ? CXC_EMPLEADOS : GASTOS_FALTANTE;
  const otraCuenta = c.decision === EMPLEADO ? GASTOS_FALTANTE : CXC_EMPLEADOS;
  const faltantes = lineas.filter((l) => l.cuenta === estaCuenta || l.cuenta === otraCuenta);
  return {
    toca_caja_menor: de(CAJA_MENOR).length > 0,
    cuenta_de_sobrante: de(INGRESOS_SOBRANTE).length > 0,
    cuenta_del_otro_camino: de(otraCuenta).length > 0,
    faltante_al_haber: faltantes.some((l) => l.lado === HABER),
    bancos_igual_a_gastos: de(BANCOS).some((l) => l.valor === c.gastos),
    bancos_resta: de(BANCOS).some((l) => l.valor === c.gastos - c.faltante),
    faltante_como_saldo_esperado: faltantes.some((l) => l.valor === c.fondo - c.gastos),
    gastos_con_otro_valor: de(GASTOS_GENERALES).some((l) => l.valor !== c.gastos),
  };
}

/* ═══════════ LOS CASOS ═══════════ */

export const pesos = (n) => `$${String(n).replace(/\B(?=(\d{3})+(?!\d))/g, ".")}`;

/*
 * Un caso: la empresa, quien maneja la caja, el mes y su último día, la
 * decisión y los tres datos construidos. Lo demás se calcula, y los textos
 * que nombran cifras o personas se arman con ellos.
 */
function caso({ n, empresa, persona, mes, dia, decision, fondo, gastos, efectivo }) {
  const suma = gastos + efectivo;
  const faltante = fondo - suma;
  const cheque = gastos + faltante;
  const [F, G, S, D, C] = [fondo, gastos, suma, faltante, cheque].map(pesos);
  const empleado = decision === EMPLEADO;
  const cuenta = empleado ? CXC_EMPLEADOS : GASTOS_FALTANTE;
  return {
    id: `h5-${n}`,
    empresa, persona, decision, fondo, gastos, efectivo, suma, faltante, cheque,
    fecha: `${dia} de ${mes}`,
    subtema: empleado ? SUBTEMAS_H5[0] : SUBTEMAS_H5[1],
    enunciado: `${empresa} tiene una caja menor de ${F}, que maneja ${persona}. Al cierre de ${mes}, los soportes suman ${G} y en la caja hay ${pesos(efectivo)}.`,
    decisionTexto: empleado
      ? `La empresa decide cobrarle el faltante de caja menor a ${persona}.`
      : `La empresa decide asumir el faltante de caja menor y no cobrárselo a ${persona}.`,
    pedido: `Arma el asiento del reembolso del ${dia} de ${mes}: cuentas, lados y valores.`,
    asiento: [
      { cuenta: GASTOS_GENERALES, lado: DEBE, valor: gastos },
      { cuenta, lado: DEBE, valor: faltante },
      { cuenta: BANCOS, lado: HABER, valor: cheque },
    ],
    acierto: empleado
      ? `Así es. Gastos generales ${G} y Cuentas por cobrar – empleados ${D} al debe; Bancos ${C} al haber. ${persona} le queda debiendo ${D} a la empresa.`
      : `Así es. Al debe van los gastos, ${G}, y el faltante de caja menor, ${D}, en su cuenta de gasto no operacional. Al haber va Bancos, por ${C}. La empresa asumió la pérdida.`,
    errores: {
      toca_caja_menor: "Caja menor no se mueve en el reembolso, ni siquiera con un faltante de caja menor. Mira el asiento de la p. 186: van Gastos generales, la cuenta del faltante y Bancos.",
      cuenta_de_sobrante: `Esa cuenta es para cuando sobra plata. Aquí falta: gastos y efectivo suman ${S}, menos que el fondo de ${F}.`,
      cuenta_del_otro_camino: empleado
        ? `La empresa decidió cobrarle a ${persona}, así que ${persona} le queda debiendo ${D}. Esa deuda va a Cuentas por cobrar – empleados.`
        : `La empresa decidió asumir la pérdida y no cobrarle a ${persona}. Los ${D} van a Gastos no operacionales – faltante de caja menor.`,
      faltante_al_haber: "La cuenta del faltante de caja menor va al debe, junto a los gastos. Lo único que va al haber es Bancos, por el cheque.",
      bancos_igual_a_gastos: `El cheque no es solo lo gastado. También repone los ${D} que faltan: ${G} más ${D} son ${C}.`,
      bancos_resta: `Falta plata, así que el cheque sale por más de lo gastado, no por menos: ${G} más ${D} son ${C}.`,
      faltante_como_saldo_esperado: `Eso es lo que debería quedar en la caja. El faltante de caja menor es lo que le falta a la suma para llegar al fondo: ${F} menos ${S}, ${D}.`,
      gastos_con_otro_valor: `Gastos generales lleva solo los gastos que tienen soporte: ${G}. El faltante de caja menor va en su propia cuenta.`,
    },
    pie: "Basado en el libro, pp. 183 y 186. Cifras construidas",
  };
}

/* Los datos construidos de Katsumi. El día es el último del mes (v2: 30 de abril y de junio). */
export const CASOS_H5 = [
  caso({ n: 1, empresa: "Ferretería La Tuerca", persona: "Julián", mes: "abril", dia: 30, decision: EMPLEADO, fondo: 400_000, gastos: 352_800, efectivo: 41_700 }),
  caso({ n: 2, empresa: "Agencia Rumbo", persona: "Marta", mes: "mayo", dia: 31, decision: GASTO, fondo: 600_000, gastos: 518_450, efectivo: 77_350 }),
  caso({ n: 3, empresa: "Panadería El Trigal", persona: "Camilo", mes: "junio", dia: 30, decision: EMPLEADO, fondo: 250_000, gastos: 197_300, efectivo: 48_900 }),
  caso({ n: 4, empresa: "Taller Rueda Libre", persona: "Diana", mes: "julio", dia: 31, decision: GASTO, fondo: 500_000, gastos: 431_600, efectivo: 59_400 }),
];

export const CIERRE_H5 = {
  texto: "El faltante de caja menor siempre hace que el cheque salga por más de lo gastado. Lo que cambia es la cuenta: si la empresa cobra, es una deuda del empleado; si asume la pérdida, es un gasto no operacional.",
  pie: "Basado en el libro, pp. 183 y 186",
};

/* ═══════════ «ASÍ SE JUEGA» (d4-t4-asi-se-juega-v1.md, H5) ═══════════ */

export const PASOS_H5 = [
  "Lee el caso y lo que decidió la empresa.",
  "Calcula cuánto falta y por cuánto sale el cheque.",
  "Arma el asiento del reembolso: cuentas, lados y valores. Tienes un intento.",
];
export const ALT_H5 = "Faltan $4.000. Gastos generales va al debe por $251.000 y Cuentas por cobrar – empleados al debe por $4.000. Bancos va al haber por $255.000.";
/*
 * El caso construido del paquete, sin empresa ni nombre: fondo 300.000,
 * soportes 251.000, efectivo 45.000, la empresa cobra. No es ninguno de los
 * cuatro.
 * El paquete trae su texto entero en una frase; la demo lo usa como
 * enunciado, sin decisión ni pedido aparte (la frase ya dice qué decidió la
 * empresa). Su acierto es el texto alternativo de Katsumi. Ella lo aprobó
 * (d4-t4-h5-v1.md, «Textos de interfaz», demo de Así se juega).
 */
const DEMO = caso({ n: "demo", empresa: "", persona: "quien la maneja", mes: "", dia: "", decision: EMPLEADO, fondo: 300_000, gastos: 251_000, efectivo: 45_000 });
export const EJEMPLO_H5 = {
  ...DEMO,
  id: "demo",
  enunciado: "Una caja menor de $300.000. Los soportes suman $251.000 y en la caja hay $45.000. La empresa decide cobrarle el faltante de caja menor a quien la maneja.",
  decisionTexto: null,
  pedido: null,
  acierto: ALT_H5,
};

/* ═══════════ LA LÓGICA, SIN REACT ═══════════ */

/* Dos casos por intento: uno de cada decisión, al azar entre sus dos, en orden barajado. */
export function sortearH5(barajar, azar = Math.random) {
  const uno = (d) => { const dos = CASOS_H5.filter((c) => c.decision === d); return dos[Math.floor(azar() * dos.length) % dos.length]; };
  return barajar([uno(EMPLEADO), uno(GASTO)]);
}

/*
 * El asiento armado, de las filas del constructor: las que tienen cuenta,
 * lado y una cifra que se lee. Está listo con AL MENOS DOS así, una al debe
 * y otra al haber, y ninguna a medias. NUNCA exige tres: el error central de
 * H5 es armar solo Gastos generales y Bancos, y quien lo comete tiene que
 * poder confirmar para ver su mensaje (bancos_igual_a_gastos). El aviso no
 * gasta intento.
 */
export function lineasDe(filas, leerCifra) {
  return filas.filter((f) => f.cuenta).map((f) => ({ cuenta: f.cuenta, lado: f.lado, valor: leerCifra(f.valor) }));
}
export const estaListoH5 = (filas, leerCifra) => {
  const ls = lineasDe(filas, leerCifra);
  return ls.length >= 2 && ls.every((l) => l.lado && l.valor !== null)
    && ls.some((l) => l.lado === DEBE) && ls.some((l) => l.lado === HABER);
};

export function evaluarH5(c, filas, leerCifra) {
  const lineas = lineasDe(filas, leerCifra);
  const igual = (a, b) => a.cuenta === b.cuenta && a.lado === b.lado && a.valor === b.valor;
  const ok = lineas.length === c.asiento.length && c.asiento.every((l) => lineas.some((x) => igual(x, l)));
  const aplican = erroresQueAplican(c, lineas);
  const primero = ok ? null : ERRORES_H5.find((e) => aplican[e]) ?? null;
  return {
    ok,
    error: primero,
    /* Si ningún error con nombre aplica (por ejemplo, una cifra mal sumada), se muestra el asiento correcto sin mensaje propio. */
    texto: ok ? c.acierto : primero ? c.errores[primero] : null,
    estados: filas.map((f) => (f.cuenta ? (c.asiento.some((l) => igual(l, { cuenta: f.cuenta, lado: f.lado, valor: leerCifra(f.valor) })) ? "correcta" : "incorrecta") : null)),
    respuesta: lineas.map((l) => `${l.lado === DEBE ? "D" : "H"} ${nombreDe(l.cuenta)} ${l.valor}`).join(" · "),
  };
}

/* Evaluativa: el motor escala los 50 FP con este porcentaje. */
export const puntuarH5 = (aciertos, cuantos) => (cuantos ? (aciertos / cuantos) * 100 : 0);

/* Para el panel docente: el ítem se lee por la empresa y la decisión. */
export const casoDeItemH5 = (id) => {
  const c = CASOS_H5.find((x) => x.id === id);
  return c ? `${c.empresa} · ${c.subtema}` : null;
};
