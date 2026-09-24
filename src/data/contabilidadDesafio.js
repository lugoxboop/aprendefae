import { LAVADO_DE_AUTOS, SECCIONES_ESF, UBICACION_ESF } from "./contabilidad.js";

/*
 * ═══════════════════════════════════════════════════════════════════════════
 * EL CONTENIDO DE «EL CICLO COMPLETO» — el desafío del tema.
 *
 * La ficha del desafío —pesos, nombres de etapa, texto de cierre— vive en
 * contabilidadActividades.js con el resto del tema. Aquí va solo lo que las
 * cuatro etapas dicen cuando el estudiante se equivoca, que es lo voluminoso.
 *
 * ═══════════ NI UNA CIFRA, NI UN ASIENTO, NI UN SALDO ═══════════
 *
 * Este archivo no contiene la solución de ninguna etapa. Las nueve
 * transacciones ya están en contabilidad.js con su asiento correcto, y de ahí
 * salen —calculados, no copiados— el mayor de la etapa 2, los once saldos de
 * la etapa 3 y el estado de situación de la etapa 4. Lo único escrito aquí
 * son las frases.
 *
 * Los errores de la etapa 1 van POR TRANSACCIÓN porque así están escritos en
 * la ficha: cada uno nombra la confusión concreta de ese enunciado. Los de las
 * etapas 2 y 3 no se repiten: la ficha dice expresamente que ahí aplican los
 * patrones de CU-11 y CU-5, y copiarlos aquí sería una segunda versión de los
 * mismos textos esperando a separarse de la primera.
 * ═══════════════════════════════════════════════════════════════════════════
 */

/* ═══════════════ ETAPA 1 · EL LIBRO DIARIO ═══════════════ */

export const ETAPA_DIARIO = {
  acierto: "✅ Asiento correcto. Debe {total} contra haber {total} — la balanza sigue nivelada.",
  /* La que sale cuando el asiento no cuadra y ninguna confusión concreta aplica. */
  descuadre: "❌ La balanza se inclinó. Debe {debe}, haber {haber}: faltan {descuadre}.",
  /*
   * Cada entrada dice EN QUÉ SE EQUIVOCÓ, y la mecánica la reconoce mirando lo
   * que el estudiante armó contra lo que debía armar. `cuando` es el
   * reconocedor; el texto es de la ficha, palabra por palabra.
   */
  errores: [
    { id: "ene02-caja", transaccion: "ene-02", cuando: { uso: "Caja", enVezDe: "Bancos" },
      texto: "❌ El enunciado dice «depositaron en una cuenta bancaria». Eso es Bancos, no Caja. Son dos activos distintos y el libro los lleva por separado todo el ejercicio." },
    { id: "ene02-aportes", transaccion: "ene-02", cuando: { uso: "Aportes sociales", enVezDe: "Acciones" },
      texto: "❌ Esta empresa es una S.A.: su patrimonio se registra en Acciones, no en Aportes sociales. El libro usa Aportes sociales para sociedades limitadas." },
    { id: "ene03-unio", transaccion: "ene-03", cuando: { falta: "Terrenos" },
      texto: "❌ Son dos cuentas. El enunciado le da el valor del terreno a propósito ($4.000) para que separe: la construcción vale el resto, $6.000." },
    { id: "ene03-pago", transaccion: "ene-03", cuando: { falta: "Hipoteca por pagar" },
      texto: "❌ El total está bien, pero el pago no: $2.000 salieron de Bancos y $8.000 quedaron como hipoteca. Son dos cuentas distintas al haber." },
    { id: "ene04-letras", transaccion: "ene-04", cuando: { falta: "Letras por pagar" },
      texto: "❌ Falta la financiación. Del camión de $4.800 solo $800 salieron de Bancos; los otros $4.000 quedaron debiéndose en Letras por pagar." },
    { id: "ene08-bancos", transaccion: "ene-08", cuando: { uso: "Bancos", enVezDe: "Cuentas por pagar" },
      texto: "❌ Dice «todo a crédito»: no salió un peso. Lo que nace es una deuda en Cuentas por pagar." },
    { id: "ene18-lado", transaccion: "ene-18", cuando: { cuenta: "Cuentas por pagar", enElLado: "haber" },
      texto: "❌ Al revés. Pagar una deuda la reduce, y los pasivos se reducen por el debe." },
    { id: "ene25-bancos", transaccion: "ene-25", cuando: { uso: "Bancos", enVezDe: "Caja" },
      texto: "❌ Dice «las canceló de contado», sin mencionar cheque. Eso entra a Caja. Fíjese que dos días después el ejercicio consigna justamente esos $800 en el banco." },
    { id: "ene25-cifra", transaccion: "ene-25", cuando: { cifraDistintaDe: "Caja" },
      texto: "❌ Son 200 acciones a $5 de valor nominal cada una: $1.000. El valor nominal está en la transacción del 2 de enero." },
    { id: "ene26-ingreso", transaccion: "ene-26", cuando: { usoTipo: "ingreso" },
      texto: "❌ Consignar no genera ingresos: es mover plata de un bolsillo a otro. Bancos sube, Caja baja — dos activos, nada más." },
    { id: "ene30-letras", transaccion: "ene-30", cuando: { uso: "Letras por pagar", enVezDe: "Hipoteca por pagar" },
      texto: "❌ La deuda del edificio es Hipoteca por pagar. Las letras son del camión." },
  ],
  /*
   * [ESCRITO POR CLAUDE, NO POR LA FICHA — PENDIENTE DE REVISIÓN DE PEDAGOGÍA]
   * La ficha cubre once confusiones concretas y la regla general del
   * descuadre. Queda fuera el asiento que CUADRA y aun así está mal —dos
   * cuentas cambiadas por otras dos, por ejemplo—, que la balanza no delata.
   * Esta línea dice eso y nada más.
   */
  cuadraPeroNoEs: "❌ Las dos columnas suman igual, así que la balanza no se queja. Pero las cuentas no son las que pide el enunciado: vuelva a leerlo.",
};

/* ═══════════════ ETAPA 2 · LA MAYORIZACIÓN ═══════════════ */

export const ETAPA_MAYOR = {
  acierto: "✅ Correcto. Mayorizar no transforma nada: reordena por cuenta lo que el diario ordenó por fecha.",
};

/* ═══════════════ ETAPA 3 · LOS SALDOS ═══════════════ */

export const ETAPA_SALDOS = {
  acierto: "✅ {saldo} al {lado}. Movimiento débito {debito} menos movimiento crédito {credito}.",
};

/* ═══════════════ ETAPA 4 · EL ESTADO DE SITUACIÓN FINANCIERA ═══════════════ */

/*
 * ═══════════ DE DÓNDE SALE LA RAZÓN DE CADA ACIERTO ═══════════
 *
 * [ENSAMBLADO POR CLAUDE — PENDIENTE DE REVISIÓN DE PEDAGOGÍA]
 *
 * La ficha da la plantilla del acierto —«✅ [Cuenta] es [tipo]. [Razón
 * breve.]»— y escribe las razones dentro de los textos de error, no aparte.
 * Aquí cada sección se queda con la razón que la ficha ya escribió para ella;
 * ninguna frase es nueva, lo único decidido es a qué sección corresponde cada
 * una. Lo que falta revisar es precisamente ese reparto.
 */
export const RAZON_POR_SECCION = {
  "activo-corriente": "El efectivo es el activo corriente por excelencia — ya es dinero disponible.",
  "activo-no-corriente": "Lo corriente es lo que se vuelve efectivo o se consume dentro del año, y esto se queda años en la empresa.",
  "pasivo-corriente": "Se cancela dentro del año.",
  "pasivo-no-corriente": "El enunciado del 3 de enero dice «a cinco años». Eso la saca del año.",
  "patrimonio": "No es una deuda: representa la participación de los dueños.",
};

export const ETAPA_ESTADO = {
  acierto: "✅ {cuenta} es {seccion}. {razon}",
  errores: {
    noCorrienteEnCorriente: "❌ Lo corriente es lo que se vuelve efectivo o se consume dentro del año. Un camión, un edificio o unos muebles no: se quedan años en la empresa.",
    efectivoEnNoCorriente: "❌ El efectivo es el activo corriente por excelencia — ya es dinero disponible.",
    hipotecaEnCorriente: "❌ El enunciado del 3 de enero dice «a cinco años». Eso la saca del año, así que es pasivo no corriente.",
    letrasEnNoCorriente: "❌ Las letras del camión se cancelan mensualmente, dentro del año. Son pasivo corriente.",
    accionesEnPasivo: "❌ Las acciones no son una deuda: representan la participación de los dueños. Eso es patrimonio.",
    noCuadra: "❌ La balanza sigue inclinada. Activos {activos} contra Pasivos + Patrimonio {pasivosMasPatrimonio}. Si sus saldos de la etapa anterior estaban bien, el error está en dónde ubicó alguno.",
  },
};

/*
 * El encabezado del estado. La fecha es la corrección 3 del tema: el libro
 * encabeza «31 de diciembre» un ejercicio que ocurre entero en enero.
 */
export const ENCABEZADO_ESTADO = {
  empresa: LAVADO_DE_AUTOS.empresa,
  titulo: "Estado de situación financiera",
  fecha: "A 31 de enero de 20X1",
};

/* Las cinco secciones del estado, con las cuentas que les tocan. */
export const SECCIONES_CON_CUENTAS = SECCIONES_ESF.map((s) => ({
  ...s,
  cuentas: Object.entries(UBICACION_ESF).filter(([, donde]) => donde === s.id).map(([c]) => c),
}));
