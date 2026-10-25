/*
 * ═══════════════════════════════════════════════════════════════════════════
 * T4 · A2 «El fondo fijo» COMO SLIDES (Célula D).
 *
 * Contenido: la tabla de A2 del hilo de Katsumi, su «Lote 2» (p2), el «Texto
 * literal de las pantallas que llevaban «…»» (p3 y p5) y el porqué del
 * segundo error del «Lote 4», en orquestador/revisiones/t4-slides/
 * hilo-katsumi.md. Forma: diseno-hanayama.md §3, A2. Cifras, nombres, caso B
 * y los textos que el hilo cita como aprobados: los datos de la pieza de
 * antes (contabilidadT4A2.js, PIEZA_EL_FONDO_FIJO y su casoB) y su paquete
 * (d4-t4-a2-v3-rediseno.md). Los textos van letra por letra.
 *
 * Lo que una pantalla dice, por lugar (como en A0):
 *   titular   la idea arriba (en la 1, el objetivo D2 de la pieza: §16 b)
 *   antes     la banda antes de responder
 *   acierto   la banda al resolver bien la pantalla
 *   errores   la banda tras un error, por opción elegida
 *   porque    la banda tras el segundo error (C2, lote 4)
 *   cierre    en el Cierre: la frase, «Siguiente: «X».» y el pie
 *
 * D8, el caso B: Marta Gil (Taller Ríos), junio, fondo de 600.000. Los textos
 * del lote 4 con cifras se escriben con la plantilla del caso 1 (`porqueQueda`),
 * así la prueba los normaliza; los demás salen de PIEZA_EL_FONDO_FIJO.casoB.
 * ═══════════════════════════════════════════════════════════════════════════
 */
import {
  A2_ID, BANCOS, CAJA, CAJA_MENOR, DATOS_A2, GASTOS_GENERALES, PIEZA_EL_FONDO_FIJO,
} from "./contabilidadT4A2.js";

export { A2_ID };

/* Las cifras con el formato del libro (como `cifra` de components/t4/comun.jsx). */
const cifra = (n) => String(Math.round(n)).replace(/\B(?=(\d{3})+(?!\d))/g, ".");

const pantalla = (pieza, id) => pieza.pantallas.find((p) => p.id === id);

/* Lote 4, A2 p4, con las cifras del caso (plantilla del caso 1). */
const porqueQueda = ({ QUEDA, FONDO, GASTADO }) =>
  `Quedan $${cifra(QUEDA)}: el fondo es de $${cifra(FONDO)} y ya salieron $${cifra(GASTADO)} en gastos.`;

/* El error de p6, renglón por renglón: la cuenta que se puso en el lado que falla (contabilidadT4A2.js, errores de «y-caja-menor»). */
const ERROR_RENGLON = {
  debe: { [CAJA_MENOR]: "debeCajaMenor", [CAJA]: "debeOtra", [BANCOS]: "ambas" },
  haber: { [CAJA_MENOR]: "haberCajaMenor", [CAJA]: "haberOtra", [GASTOS_GENERALES]: "haberOtra" },
};

function slides(caso) {
  const pz = caso === 2 ? PIEZA_EL_FONDO_FIJO.casoB : PIEZA_EL_FONDO_FIJO;
  const d = DATOS_A2[caso];
  const apertura = pantalla(pz, "la-apertura");
  const gastos = pantalla(pz, "los-gastos");
  const cuanto = pantalla(pz, "cuanto-queda");
  const reembolso = pantalla(pz, "el-reembolso");
  const asiento = pantalla(pz, "y-caja-menor");
  const cierre = pantalla(pz, "subir-bajar");
  /* «El 1 de mayo, … con un cheque. Tócalo.» → la primera frase (el «Tócalo» pasa a la pregunta del lote 2). */
  const [abre] = apertura.antes[0].split(/(?<=\.) /);
  /* «Reponer lo gastado es el reembolso. El 31 de mayo, … un cheque. Tócalo.» → titular y banda, en frases. */
  const [repone, ...reponeResto] = reembolso.antes[0].split(/(?<=\.) /);
  const [preguntaAsiento] = asiento.antes[0].split(/(?<=\.) /).slice(1);
  const [antesAsiento] = asiento.antes[0].split(/(?<=\.) /);
  return {
    d,
    suma: {
      titular: PIEZA_EL_FONDO_FIJO.objetivo,
      antes: ["Pagas un gasto con el fondo.", "¿Qué pasa con la suma de billetes y soportes?"],
      opciones: [{ id: "igual", texto: "Sigue igual" }, { id: "baja", texto: "Baja" }, { id: "sube", texto: "Sube" }],
      correcta: "igual",
      /* Con el acierto (hilo, A2 p1): la definición y el rótulo de acción, que pasa a la banda (Hanayama §3). */
      acierto: [pantalla(pz, "el-fondo").despuesConAccion[0].texto, pantalla(pz, "el-fondo").rotuloAccion],
      errores: {
        baja: "Salen billetes, sí. ¿Qué entra al sobre a cambio?",
        sube: "¿Entra plata nueva al sobre cuando pagas un gasto?",
      },
      porque: "Sigue igual. Al pagar salen billetes, pero entra un soporte por el mismo valor, y la suma sigue dando el fondo.",
    },
    abre: {
      titular: "¿De qué cuenta sale?",
      antes: [abre],
      opciones: [{ id: BANCOS, texto: "Bancos" }, { id: CAJA, texto: "Caja" }, { id: CAJA_MENOR, texto: "Caja menor" }],
      correcta: BANCOS,
      acierto: ["Bancos baja y Caja menor sube: el fondo queda abierto."],
      errores: {
        [CAJA]: "¿Quién paga un cheque: la caja o el banco?",
        [CAJA_MENOR]: "Caja menor es adonde llega la plata. ¿De dónde sale?",
      },
      porque: "Sale de Bancos. Un cheque lo paga el banco: la plata llega a Caja menor y el fondo queda abierto.",
    },
    gastos: { titular: "Cada gasto deja su soporte", antes: gastos.antes },
    queda: {
      titular: cuanto.antes[0],
      antes: [],
      correcta: d.QUEDA,
      acierto: [cuanto.acierto],
      errores: cuanto.errores,
      porque: porqueQueda(d),
    },
    repone: { titular: repone, antes: reponeResto },
    asiento: {
      titular: preguntaAsiento,
      antes: [antesAsiento],
      correcta: { debe: GASTOS_GENERALES, haber: BANCOS },
      acierto: [asiento.acierto],
      errores: asiento.errores,
      porque: "Gastos generales al debe y Bancos al haber: el gasto va al debe y la plata sale del banco. Caja menor no se mueve.",
    },
    ajusta: {
      titular: cierre.antes[0],
      cierre: cierre.cierre,
      siguiente: cierre.siguiente,
      pie: cierre.pie,
    },
  };
}

export const SLIDES_A2 = { 1: slides(1), 2: slides(2) };

/* La clave del error de p6 según el lado del renglón que falla y la cuenta que se puso en él. */
export const errorRenglonA2 = (lado, cuenta) => ERROR_RENGLON[lado][cuenta] ?? "ambas";
