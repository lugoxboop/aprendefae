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

/* Consigna y decisión: entrega 2 de Futaba; la pregunta de la caja es de Mai (hoja 6), para Shoko. */
export const CONSIGNA_CAPA_3_T6_A4 = "Toca cada caso y decide cuánto se revive. Después, mira cuánta plata entra a Caja.";
export const PREGUNTA_CAPA_3_T6_A4 = "¿Cuánto se revive?";
export const OPCIONES_CAPA_3_T6_A4 = [{ id: "toda", texto: "$180.000" }, { id: "abono", texto: "$100.000" }, { id: "resto", texto: "$80.000" }];

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
    correcta: "toda",
    falla: "En el caso a paga toda la factura: se revive toda.",
  },
  {
    id: "b",
    letra: "b",
    nombre: "b · Abona $100.000 y promete pagar el resto",
    revela: "Se revive toda la deuda: $180.000. A Caja entran $100.000. Los otros $80.000 quedan en Cuentas por cobrar – clientes, como deuda pendiente.",
    pie: "Basado en el libro, p. 205",
    revive: "$180.000",
    entran: "$100.000",
    correcta: "toda",
    falla: {
      abono: "Como promete pagar el resto, la deuda vuelve completa.",
      resto: "$80.000 es lo que queda pendiente. Como lo va a pagar, la deuda vuelve completa.",
    },
  },
  {
    id: "c",
    letra: "c",
    nombre: "c · Abona $100.000 y avisa que no pagará más",
    revela: "Se revive solo lo que pagó: $100.000. A Caja entran $100.000. Los otros $80.000 siguen castigados.",
    pie: "Basado en el libro, p. 206",
    revive: "$100.000",
    entran: "$100.000",
    correcta: "abono",
    falla: {
      toda: "Como no pagará más, solo vuelve lo que abonó.",
      resto: "$80.000 es lo que no va a pagar: eso sigue castigado.",
    },
  },
];
export const FINAL_CAPA_3_T6_A4 = {
  texto: "En los casos b y c entra la misma plata. Lo que cambia es cuánto se revive, y eso depende de si el cliente va a pagar el resto.",
  pie: "Basado en el libro, pp. 205-206",
};

/* ═══════════ CAPA 4 · «EN UNA FRASE» (UnaFrase, sin cambios) ═══════════ */

export const PREGUNTA_FINAL_T6_A4 = "En el caso b, ¿dónde quedan los $80.000 que faltan?";
/* La capa 4 nueva (entrega 2 de Futaba, PASA de Shoko). En el orden de Futaba; UnaFrase las baraja una vez al cargar. */
export const OPCIONES_FINAL_T6_A4 = [
  {
    id: "b5-t6-a4-pendiente",
    texto: "En Cuentas por cobrar – clientes, como deuda pendiente.",
    correcta: true,
    feedback: "Correcto. Como promete pagar el resto, se revivió toda la deuda. Lo que todavía no paga sigue como deuda pendiente en Cuentas por cobrar – clientes.",
  },
  {
    id: "b5-t6-a4-castigados",
    texto: "Siguen castigados, como en el caso c: no se reviven.",
    correcta: false,
    feedback: "No es esa. Eso pasa en el caso c, cuando avisa que no pagará más. En el caso b promete pagar, así que la deuda volvió completa.",
  },
  {
    id: "b5-t6-a4-provision",
    texto: "En la provisión, hasta que el cliente los pague.",
    correcta: false,
    feedback: "No es esa. La provisión no guarda deudas: lo que el cliente todavía debe está en Cuentas por cobrar – clientes.",
  },
  {
    id: "b5-t6-a4-caja",
    texto: "En Caja, porque el cliente ya prometió pagarlos.",
    correcta: false,
    feedback: "No es esa. A Caja solo entra lo que paga. Una promesa no es plata.",
  },
];
/* Su pie, bajo la pregunta (UnaFrase no lleva pie: lo pinta la escena de la pieza). */
export const PIE_FINAL_T6_A4 = "Basado en el libro, p. 205";
