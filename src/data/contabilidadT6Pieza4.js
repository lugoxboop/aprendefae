/*
 * ═══════════════════════════════════════════════════════════════════════════
 * TEMA 6 · PIEZA 4 DE APRENDER — «Cuando el cliente castigado sí paga».
 *
 * Célula B. Todo el texto que lee el estudiante vive en ESTE archivo, guardado
 * entero en orquestador/conocimiento/paquetes/b5-t6-aprender4.md. Precedencia
 * (Sakuta, todo con PASA de Shoko): el original de Futaba con su paso 9
 * corregido (resalta las dos líneas de Clientes que se compensan); el diseño,
 * la guía v1 de Mai. Las marcas de auditoría no se copian.
 * ═══════════════════════════════════════════════════════════════════════════
 */

/* ═══════════ LA PIEZA (lo que lee CuatroCapas: título, objetivo y capa 1) ═══════════ */

export const PIEZA_SI_PAGA = {
  id: "b5-t6-a4-cuando-el-cliente-castigado-si-paga",
  numero: 4,
  titulo: "Cuando el cliente castigado sí paga",
  objetivo: "Vas a ver cómo se anota el pago de una deuda que ya se había castigado, según cuánto pague el cliente.",
  nombres: [
    {
      termino: "Cuenta recuperada",
      definicion: "Es una deuda que la empresa ya había castigado y que el cliente vuelve a pagar, toda o en parte.",
    },
    {
      termino: "Revivir la deuda",
      definicion: "Es volver a poner la deuda en Cuentas por cobrar – clientes. Se hace reversando el asiento del castigo. Se debita Cuentas por cobrar – clientes y se acredita Provisión para deudas incobrables.",
      delLibro: "Reversar un asiento es hacerlo al revés. Lo que se había acreditado ahora se debita. Y lo que se había debitado ahora se acredita.",
      rotuloDelLibro: "Nota",
    },
    {
      termino: "Después, el pago",
      definicion: "Después de revivir la deuda, se anota el pago como cualquier cobro: se debita Caja y se acredita Cuentas por cobrar – clientes.",
    },
    {
      termino: "Abono",
      definicion: "Es un pago de solo una parte de la deuda.",
    },
    {
      termino: "Cuánto se revive",
      definicion: "Depende de lo que haga el cliente. Si paga todo, se revive toda la deuda. Si abona una parte y promete pagar el resto, también se revive toda. Si abona una parte y avisa que no pagará más, se revive solo lo que pagó.",
      delLibro: "«…teniendo presente si el cliente paga la totalidad de la deuda o no, ya que se pueden presentar las siguientes situaciones.» (p. 203)",
    },
  ],
};

/* ═══════════ CAPA 2 · «MÍRELO FUNCIONAR» · El Torito y Pablo Moncayo, caso a ═══════════ */

/* Los rótulos de la escena (guía §3.2 y §7): fragmentos literales de los pasos. */
export const ESCENA_T6_A4 = {
  momentos: [{ fecha: "Marzo del año siguiente" }, { fecha: "Un tiempo después" }],
  castiga: "Castiga la deuda de Pablo Moncayo",
  monto: "$180.000",
  aNombre: "A nombre de Pablo Moncayo",
  vuelve: "Pablo Moncayo vuelve y paga toda la factura",
  primero: "Primero se revive la deuda",
  despues: "Después se anota el pago",
  provision: "Provisión para deudas incobrables",
  clientes: "Cuentas por cobrar – clientes",
  caja: "Caja",
  debita: "se debita",
  acredita: "se acredita",
};

/* Los 9 pasos y el cierre, cada uno con su pie de fuente (Futaba). */
export const PASOS_T6_A4 = [
  { texto: "En marzo del año siguiente, la empresa castiga la deuda de Pablo Moncayo.", pie: "Libro, p. 204" },
  { texto: "Se debita Provisión para deudas incobrables por $180.000.", pie: "Basado en el libro, p. 204" },
  { texto: "Y se acredita Cuentas por cobrar – clientes, a nombre de Pablo Moncayo.", pie: "Basado en el libro, p. 204" },
  { texto: "Un tiempo después, Pablo Moncayo vuelve y paga toda la factura.", pie: "Libro, p. 204" },
  { texto: "Primero se revive la deuda: se debita Cuentas por cobrar – clientes por $180.000.", pie: "Basado en el libro, p. 204" },
  { texto: "Y se acredita Provisión para deudas incobrables, por el mismo valor.", pie: "Basado en el libro, p. 204" },
  { texto: "Después se anota el pago: se debita Caja por $180.000.", pie: "Libro, p. 204" },
  { texto: "Y se acredita Cuentas por cobrar – clientes, por el mismo valor.", pie: "Libro, p. 204" },
  { texto: "No se anota ningún ingreso: la deuda volvió y se pagó.", pie: "Basado en el libro, p. 204" },
];
export const CIERRE_T6_A4 = {
  texto: "Primero vuelve la deuda; después se cobra, como cualquier deuda.",
  pie: "Basado en el libro, pp. 203-204",
};

/* ═══════════ CAPA 3 · «AHORA PRUEBE USTED» · los tres casos, con la misma deuda ═══════════ */

export const CONSIGNA_CAPA_3_T6_A4 = "Toca cada caso y mira cuánto se revive y cuánta plata entra a Caja.";

/* El tablero (guía §4.1): sus dos cabeceras; cada caso llena su fila al abrirse. */
export const TABLERO_T6_A4 = { revive: "Se revive", entran: "A Caja entran" };
export const CASOS_T6_A4 = [
  {
    id: "a",
    letra: "a",
    nombre: "a · Paga toda la factura",
    revela: "Se revive toda la deuda: $180.000. A Caja entran $180.000.",
    pie: "Libro, p. 204",
    revive: "$180.000",
    entran: "$180.000",
  },
  {
    id: "b",
    letra: "b",
    nombre: "b · Abona $100.000 y promete pagar el resto",
    revela: "Se revive toda la deuda: $180.000. A Caja entran $100.000. Los otros $80.000 quedan en Cuentas por cobrar – clientes, como deuda pendiente.",
    pie: "Basado en el libro, p. 205",
    revive: "$180.000",
    entran: "$100.000",
  },
  {
    id: "c",
    letra: "c",
    nombre: "c · Abona $100.000 y avisa que no pagará más",
    revela: "Se revive solo lo que pagó: $100.000. A Caja entran $100.000. Los otros $80.000 siguen castigados.",
    pie: "Basado en el libro, p. 206",
    revive: "$100.000",
    entran: "$100.000",
  },
];
export const FINAL_CAPA_3_T6_A4 = {
  texto: "En los casos b y c entra la misma plata. Lo que cambia es cuánto se revive, y eso depende de si el cliente va a pagar el resto.",
  pie: "Basado en el libro, pp. 205-206",
};

/* ═══════════ CAPA 4 · «EN UNA FRASE» (UnaFrase, sin cambios) ═══════════ */

export const PREGUNTA_FINAL_T6_A4 = "Pablo Moncayo abona $100.000 y avisa que no pagará más. ¿Por cuánto se revive su deuda?";
/* En el orden de Futaba; UnaFrase las baraja una vez al cargar. */
export const OPCIONES_FINAL_T6_A4 = [
  {
    id: "b5-t6-a4-cien",
    texto: "Por $100.000, solo la parte que sí pagó.",
    correcta: true,
    feedback: "Correcto. Como no pagará más, se revive solo lo que pagó. Los otros $80.000 siguen castigados.",
  },
  {
    id: "b5-t6-a4-toda",
    texto: "Por $180.000, toda la deuda castigada.",
    correcta: false,
    feedback: "No es esa. Toda la deuda se revive cuando el cliente paga todo o promete pagar el resto. Aquí avisó que no pagará más.",
  },
  {
    id: "b5-t6-a4-ochenta",
    texto: "Por $80.000, lo que le falta pagar.",
    correcta: false,
    feedback: "No es esa. Esos $80.000 no se van a pagar, así que siguen castigados. Se revive lo que sí pagó.",
  },
  {
    id: "b5-t6-a4-ingreso",
    texto: "Por nada: el pago va directo a un ingreso.",
    correcta: false,
    feedback: "No es esa. En el libro no hay ningún ingreso: primero se revive la deuda y después se anota el pago.",
  },
];

/* ═══════════ CAPA 2: LA PARADA (hoja 7 de Mai, entrega 3 de Futaba) ═══════════ */

/*
 * T6 · A4 no se fusiona (Mai §1: cualquiera de las tres fusiones sube el
 * texto reservado y el último paso deja de caber a 320). La predicción va
 * entre el paso 4 («vuelve y paga») y el 5.
 */
export const PARADA_T6_A4 = {
  antes: 5,
  pregunta: "Pablo Moncayo vuelve y paga. ¿Qué se anota primero?",
  opciones: [{ id: "revivir", texto: "Revivir la deuda" }, { id: "caja", texto: "La plata que entra a Caja" }],
  correcta: "revivir",
  falla: "Primero se reversa el castigo, para que la deuda vuelva. Después se anota el pago.",
  pie: "Basado en el libro, p. 204",
  resaltados: ["vuelve"],
};
