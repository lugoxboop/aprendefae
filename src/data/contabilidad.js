/*
 * ═══════════════════════════════════════════════════════════════════════════
 * CONTABILIDAD — el núcleo numérico del capítulo 3.
 *
 * Fuente: Mendoza Roca & Ortiz Tovar, «Contabilidad financiera para
 * contaduría y administración» (Uninorte, 2016), capítulo 3. Las cifras, los
 * nombres de cuenta y los enunciados son del libro.
 *
 * ═══════════ TRES CORRECCIONES AL LIBRO, YA RESUELTAS ═══════════
 *
 * No son criterio de quien programe: vienen decididas y se aplican en todo el
 * material. Se escriben aquí para que nadie las «arregle» de vuelta.
 *
 *   1. DOS SOCIOS APORTAN $2.000 EN TOTAL. El enunciado del libro dice que
 *      cada uno aporta $1.000 y luego totaliza mal; su propio libro diario
 *      (p. 96) registra $2.000. Manda el diario.
 *
 *   2. EL BALANCE DE LAVADO DE AUTOS ES «A 31 DE ENERO DE 20X1». El libro
 *      encabeza «31 de diciembre», pero las nueve transacciones son todas de
 *      enero. Es una errata del encabezado.
 *
 *   3. LA CUENTA DE LA HIPOTECA SE LLAMA «HIPOTECA POR PAGAR», en todo el
 *      material y en las cuatro etapas del desafío, aunque el libro diario la
 *      nombre «Obligaciones financieras (Hipoteca)» en un punto.
 *
 *      NO ES LA MISMA CUENTA QUE «OBLIGACIONES FINANCIERAS» A SECAS, que es
 *      el préstamo bancario de Comercializadora Caleja y aparece en CU-1,
 *      CU-6, CU-8 y CU-9. Confundirlas mezcla dos casos distintos.
 *
 * ═══════════ POR QUÉ ESTO ESTÁ SEPARADO DE LAS ACTIVIDADES ═══════════
 *
 * Los asientos, el mayor, los saldos y el estado de situación financiera son
 * UN solo cuerpo de datos del que beben el desafío y media docena de
 * actividades. Teniéndolo aparte, las pruebas pueden comprobar la partida
 * doble y la ecuación contable sobre la fuente, y no sobre una copia que
 * alguna actividad haya tecleado a mano.
 * ═══════════════════════════════════════════════════════════════════════════
 */

/* ───────────────────────────── el vocabulario ───────────────────────────── */

export const DEBE = "debe";
export const HABER = "haber";

/*
 * Teal el debe, ámbar el haber, en toda la materia y sin excepción. Coral no
 * aparece: significa error en todo el sitio.
 */
export const COLOR_LADO = {
  [DEBE]: "#2A9D8F",
  [HABER]: "#E9C46A",
};

export const ACTIVO = "activo";
export const PASIVO = "pasivo";
export const PATRIMONIO = "patrimonio";
export const INGRESO = "ingreso";
export const GASTO = "gasto";
export const COSTO = "costo";

export const NOMBRE_TIPO = {
  [ACTIVO]: "Activo",
  [PASIVO]: "Pasivo",
  [PATRIMONIO]: "Patrimonio",
  [INGRESO]: "Ingreso",
  [GASTO]: "Gasto",
  [COSTO]: "Costo",
};

/* Las cuentas reales sobreviven al cierre; las transitorias vuelven a cero. */
export const REALES = [ACTIVO, PASIVO, PATRIMONIO];
export const TRANSITORIAS = [INGRESO, GASTO, COSTO];

/*
 * LAS DOS REGLAS, que son todo el capítulo.
 *
 *   Activos, Gastos y Costos      nacen y aumentan por el DEBE
 *   Pasivos, Patrimonio, Ingresos nacen y aumentan por el HABER
 *
 * Se declara el lado por el que CRECE cada familia y todo lo demás se deduce:
 * el lado por el que decrece es el otro, y el saldo normal es el de su
 * crecimiento. Escribir las seis filas a mano invitaría a que una se
 * contradijera con otra.
 */
export const CRECE_POR = {
  [ACTIVO]: DEBE,
  [GASTO]: DEBE,
  [COSTO]: DEBE,
  [PASIVO]: HABER,
  [PATRIMONIO]: HABER,
  [INGRESO]: HABER,
};

export const decrecePor = (tipo) => (CRECE_POR[tipo] === DEBE ? HABER : DEBE);
export const saldoNormalDe = (tipo) => CRECE_POR[tipo];

/** Qué le pasa a una cuenta de ese tipo cuando se registra en ese lado. */
export const efectoDe = (tipo, lado) => (CRECE_POR[tipo] === lado ? "aumenta" : "disminuye");

/** El lado donde se registra un movimiento, dado el tipo y si sube o baja. */
export const ladoDe = (tipo, sube) => (sube ? CRECE_POR[tipo] : decrecePor(tipo));

/* ───────────────────────── el catálogo de cuentas ───────────────────────── */

/*
 * Toda cuenta que aparece en el tema, con su tipo. Una sola lista: si una
 * actividad nombrara una cuenta que no está aquí, la prueba lo dice.
 */
export const CUENTAS = {
  /* Activos */
  "Caja": ACTIVO,
  "Bancos": ACTIVO,
  "Cuentas por cobrar": ACTIVO,
  "Inventario de mercancías": ACTIVO,
  "Inventario": ACTIVO,
  "Depósitos en garantía": ACTIVO,
  "Terreno": ACTIVO,
  "Terrenos": ACTIVO,
  "Construcciones y edificaciones": ACTIVO,
  "Local comercial": ACTIVO,
  "Maquinaria": ACTIVO,
  "Equipo de computación": ACTIVO,
  "Equipos de oficina": ACTIVO,
  "Muebles y enseres": ACTIVO,
  "Flota y equipo de transporte": ACTIVO,
  /* Pasivos */
  "Obligaciones financieras": PASIVO,
  "Hipoteca por pagar": PASIVO,
  "Cuentas por pagar": PASIVO,
  "Documentos por pagar": PASIVO,
  "Letras por pagar": PASIVO,
  "Salarios por pagar": PASIVO,
  "Participaciones por pagar": PASIVO,
  /* Patrimonio */
  "Aportes sociales": PATRIMONIO,
  "Acciones": PATRIMONIO,
  "Reserva legal": PATRIMONIO,
  "Utilidad acumulada": PATRIMONIO,
  /* Ingresos */
  "Ingresos por servicios": INGRESO,
  "Renta por servicios": INGRESO,
  "Renta por interés": INGRESO,
  "Ingresos por ventas": INGRESO,
  "Ingresos operacionales": INGRESO,
  /* Gastos */
  "Gastos de operación": GASTO,
  "Servicios públicos": GASTO,
  "Gastos por salarios": GASTO,
  "Gastos por arriendo": GASTO,
  /* Costos */
  "Costo de ventas": COSTO,
};

export const tipoDeCuenta = (nombre) => CUENTAS[nombre] ?? null;

/* ────────────────── el caso central: Lavado de Autos Mateo S.A. ────────────────── */

/*
 * Las nueve transacciones del ejercicio de aplicación (pp. 98-101), textuales.
 * De aquí salen el desafío entero y el grueso de CU-5, CU-7, CU-8 y CU-12.
 */
export const LAVADO_DE_AUTOS = {
  empresa: "Lavado de Autos Mateo S.A.",
  /* Corrección 2: el libro encabeza «31 de diciembre» y las nueve son de enero. */
  corte: "A 31 de enero de 20X1",
  transacciones: [
    {
      id: "ene-02",
      fecha: "Ene 2",
      texto: "Los accionistas depositaron $5.000 en efectivo en una cuenta bancaria a nombre del negocio, por concepto de la compra de 1.000 acciones de valor nominal $5 cada una.",
      asiento: { debe: [["Bancos", 5000]], haber: [["Acciones", 5000]] },
    },
    {
      id: "ene-03",
      fecha: "Ene 3",
      texto: "Se compró un edificio y terreno por valor de $10.000, se canceló $2.000 de contado, con cheque, y el resto con una hipoteca a cinco años. El valor del terreno se estimó en $4.000.",
      asiento: {
        debe: [["Construcciones y edificaciones", 6000], ["Terrenos", 4000]],
        haber: [["Bancos", 2000], ["Hipoteca por pagar", 8000]],
      },
    },
    {
      id: "ene-04",
      fecha: "Ene 4",
      texto: "Se compró un camión de reparto por valor de $4.800: $800 de contado, pagado con cheque, y por el saldo se firmaron letras.",
      asiento: {
        debe: [["Flota y equipo de transporte", 4800]],
        haber: [["Bancos", 800], ["Letras por pagar", 4000]],
      },
    },
    {
      id: "ene-08",
      fecha: "Ene 8",
      texto: "Se compró una computadora por valor de $2.000, todo a crédito.",
      asiento: { debe: [["Equipo de computación", 2000]], haber: [["Cuentas por pagar", 2000]] },
    },
    {
      id: "ene-12",
      fecha: "Ene 12",
      texto: "Se compraron muebles y enseres por valor de $2.500. Se canceló de contado, con cheque, la suma de $500 y el saldo a crédito a 90 días.",
      asiento: {
        debe: [["Muebles y enseres", 2500]],
        haber: [["Bancos", 500], ["Cuentas por pagar", 2000]],
      },
    },
    {
      id: "ene-18",
      fecha: "Ene 18",
      texto: "Se canceló con cheque la suma de $250 de la deuda de la computadora.",
      asiento: { debe: [["Cuentas por pagar", 250]], haber: [["Bancos", 250]] },
    },
    {
      id: "ene-25",
      fecha: "Ene 25",
      texto: "Ingresó un nuevo socio al negocio, compró 200 acciones a su valor nominal y las canceló de contado.",
      asiento: { debe: [["Caja", 1000]], haber: [["Acciones", 1000]] },
    },
    {
      id: "ene-26",
      fecha: "Ene 26",
      texto: "Se consignó en la cuenta corriente la suma de $800.",
      asiento: { debe: [["Bancos", 800]], haber: [["Caja", 800]] },
    },
    {
      id: "ene-30",
      fecha: "Ene 30",
      texto: "Se canceló con cheque la suma de $400 de la deuda del edificio.",
      asiento: { debe: [["Hipoteca por pagar", 400]], haber: [["Bancos", 400]] },
    },
  ],
};

/* ─────────────── el otro caso: Comercializadora Caleja Ltda. ─────────────── */

export const CALEJA = {
  empresa: "Comercializadora Caleja Ltda.",
  transacciones: [
    {
      id: "cal-1",
      texto: "Se constituye una sociedad con tres socios, cada uno aporta $100.000.",
      asiento: { debe: [["Caja", 300000]], haber: [["Aportes sociales", 300000]] },
    },
    {
      id: "cal-2",
      texto: "Se compra a crédito un computador por $25.000.",
      asiento: { debe: [["Equipo de computación", 25000]], haber: [["Cuentas por pagar", 25000]] },
    },
    {
      id: "cal-3",
      texto: "Se compra maquinaria por $50.000 con un préstamo bancario.",
      asiento: { debe: [["Maquinaria", 50000]], haber: [["Obligaciones financieras", 50000]] },
    },
    {
      id: "cal-4",
      texto: "Cancelan $10.000 de la deuda por la compra del computador.",
      asiento: { debe: [["Cuentas por pagar", 10000]], haber: [["Caja", 10000]] },
    },
    {
      id: "cal-5",
      texto: "Ingresa un nuevo socio y aporta un local comercial por $100.000.",
      asiento: { debe: [["Local comercial", 100000]], haber: [["Aportes sociales", 100000]] },
    },
    {
      id: "cal-6",
      texto: "Un socio disminuye su aporte y le devuelven $50.000 en efectivo.",
      asiento: { debe: [["Aportes sociales", 50000]], haber: [["Caja", 50000]] },
    },
  ],
};

/* ───────────────────────────── la mayorización ───────────────────────────── */

/**
 * El libro mayor que resulta de una lista de transacciones: por cada cuenta,
 * sus débitos y sus créditos en el orden en que ocurrieron.
 *
 * SE CALCULA, NO SE TRANSCRIBE. El mayor del libro está en la p. 100 y podría
 * copiarse a mano, pero entonces habría dos verdades —los asientos y el
 * mayor— y en cuanto una se tocara dejarían de coincidir en silencio. Aquí el
 * mayor es una consecuencia de los asientos, y la prueba compara el resultado
 * contra las cifras impresas del libro.
 */
export function mayorizar(transacciones) {
  const mayor = new Map();
  const anotar = (cuenta, lado, valor, fecha) => {
    if (!mayor.has(cuenta)) mayor.set(cuenta, { cuenta, tipo: tipoDeCuenta(cuenta), debitos: [], creditos: [] });
    mayor.get(cuenta)[lado === DEBE ? "debitos" : "creditos"].push({ valor, fecha });
  };
  for (const t of transacciones) {
    for (const [cuenta, valor] of t.asiento.debe) anotar(cuenta, DEBE, valor, t.fecha ?? t.id);
    for (const [cuenta, valor] of t.asiento.haber) anotar(cuenta, HABER, valor, t.fecha ?? t.id);
  }
  return [...mayor.values()];
}

/** El movimiento de cada lado y el saldo, que va del lado que pesó más. */
export function saldoDe(cuentaDelMayor) {
  const debito = cuentaDelMayor.debitos.reduce((s, m) => s + m.valor, 0);
  const credito = cuentaDelMayor.creditos.reduce((s, m) => s + m.valor, 0);
  const saldo = Math.abs(debito - credito);
  /*
   * Cuando los dos movimientos empatan el saldo es cero y no tiene lado. Hoy
   * no pasa en ninguna cuenta del tema, pero devolver «debe» por descuido
   * enseñaría algo falso.
   */
  const lado = debito === credito ? null : (debito > credito ? DEBE : HABER);
  return { debito, credito, saldo, lado };
}

/** El mayor con su saldo ya calculado, que es lo que consumen las actividades. */
export const mayorConSaldos = (transacciones) =>
  mayorizar(transacciones).map((c) => ({ ...c, ...saldoDe(c) }));

/* ─────────────────── el estado de situación financiera ─────────────────── */

/*
 * Dónde va cada cuenta del caso en el estado. Lo corriente es lo que se
 * vuelve efectivo o se consume dentro del año; la hipoteca es a cinco años y
 * las letras del camión se cancelan dentro del año.
 */
export const UBICACION_ESF = {
  "Caja": "activo-corriente",
  "Bancos": "activo-corriente",
  "Flota y equipo de transporte": "activo-no-corriente",
  "Equipo de computación": "activo-no-corriente",
  "Muebles y enseres": "activo-no-corriente",
  "Construcciones y edificaciones": "activo-no-corriente",
  "Terrenos": "activo-no-corriente",
  "Cuentas por pagar": "pasivo-corriente",
  "Letras por pagar": "pasivo-corriente",
  "Hipoteca por pagar": "pasivo-no-corriente",
  "Acciones": "patrimonio",
};

export const SECCIONES_ESF = [
  { id: "activo-corriente", nombre: "Activo corriente" },
  { id: "activo-no-corriente", nombre: "Activo no corriente" },
  { id: "pasivo-corriente", nombre: "Pasivo corriente" },
  { id: "pasivo-no-corriente", nombre: "Pasivo no corriente" },
  { id: "patrimonio", nombre: "Patrimonio" },
];

/** El estado de situación financiera que sale de un mayor con saldos. */
export function estadoDeSituacion(mayor) {
  const secciones = Object.fromEntries(SECCIONES_ESF.map((s) => [s.id, { ...s, lineas: [], total: 0 }]));
  for (const c of mayor) {
    const donde = UBICACION_ESF[c.cuenta];
    if (!donde) continue;
    secciones[donde].lineas.push({ cuenta: c.cuenta, valor: c.saldo });
    secciones[donde].total += c.saldo;
  }
  const activos = secciones["activo-corriente"].total + secciones["activo-no-corriente"].total;
  const pasivos = secciones["pasivo-corriente"].total + secciones["pasivo-no-corriente"].total;
  const patrimonio = secciones.patrimonio.total;
  return { secciones, activos, pasivos, patrimonio, pasivosMasPatrimonio: pasivos + patrimonio };
}

/* ─────────────────────────── el formato del peso ─────────────────────────── */

/*
 * Punto de miles, sin decimales, y agrupado a mano —no con toLocaleString—
 * para que la cifra salga igual en el navegador de un estudiante y en una
 * prueba, sin depender de los datos de idioma del runtime. Mismo criterio que
 * el fondo de la materia.
 */
export function pesos(valor) {
  const entero = Math.max(0, Math.round(Number(valor) || 0));
  const digitos = String(entero);
  let salida = "";
  for (let i = 0; i < digitos.length; i += 1) {
    if (i > 0 && (digitos.length - i) % 3 === 0) salida += ".";
    salida += digitos[i];
  }
  return `$${salida}`;
}
