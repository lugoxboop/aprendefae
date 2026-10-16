import { readFileSync } from "node:fs";

/*
 * ═══════════════════════════════════════════════════════════════════════════
 * LAS CORRECCIONES OBLIGATORIAS DE MELLO A LA ENTREGA D v2 DE NEAR
 * (T7-1 H7 «¿Qué control falta?» y T5 N3 «¿Qué revisión falta?»).
 *
 * Auditoría: orquestador/conocimiento/paquetes/
 * auditoria-mello-n5-v2-y-entrega-d-v2.md, secciones 2 (H7-1, H7-2, H7-3) y
 * 3 (N3-1 a N3-4). La técnica es la de correccionesMello.mjs (que no se
 * toca): el paquete de Near se queda como llegó y las pruebas lo leen a
 * través de `paqueteDConMello()`, que cambia cada texto viejo por el de
 * Mello. Cada texto nuevo se comprueba, letra por letra, contra la auditoría,
 * y cada texto viejo tiene que estar UNA vez en el paquete.
 *
 * N3 se apoya además en la fusión de la entrega 5 (lote1-entrega5-v1.md,
 * «## 2. T5 · N3»), con la corrección de Mello a esa fusión que la D no
 * reemplaza: la glosa de Verificar (mello-entregas-4-5-6-v1.md, «N3 con lo
 * de N2»). La consigna, el acierto del caso 1 y el caso 3 que Mello corrigió
 * en la entrega 5 los reemplaza la D: no se aplican.
 *
 * H7-3 (la figura sin íconos mientras el caso está abierto) no cambia
 * ningún texto: lo comprueba la prueba de la pieza montada.
 * ═══════════════════════════════════════════════════════════════════════════
 */

const PAQ = new URL("../../../orquestador/conocimiento/paquetes/", import.meta.url);
const leer = (f) => readFileSync(new URL(f, PAQ), "utf8");

export const AUDITORIA_D = leer("auditoria-mello-n5-v2-y-entrega-d-v2.md");
const MELLO_E5 = leer("mello-entregas-4-5-6-v1.md");
const PAQUETE_D = leer("d-v2-h7-y-n3.md");
const ENTREGA5 = leer("lote1-entrega5-v1.md");

/* H7-1 · la séptima opción, la requisición (p. 209), y su pista en cada caso. */
const REQ = "Entregas solo con requisición autorizada";
const filaReq = (pista) => `\n| ${REQ} | «${pista}» |`;
export const H7_MELLO = [
  ["| `recepcion` | «Un informe de recepción» |", `| \`recepcion\` | «Un informe de recepción» |\n| \`requisicion\` | «${REQ}» |`],
  ["| Un informe de recepción | «El informe de recepción es para lo que llega, no para cuidar lo que ya está guardado.» | 87,2 |",
    `| Un informe de recepción | «El informe de recepción es para lo que llega, no para cuidar lo que ya está guardado.» | 87,2 |${filaReq("La requisición controla lo que se entrega. Quien entra de noche por la calle no pide nada.")}`],
  ["| Un informe de recepción | «El informe de recepción es para lo que llega. Aquí falta quién pague la pérdida.» | 87,2 |",
    `| Un informe de recepción | «El informe de recepción es para lo que llega. Aquí falta quién pague la pérdida.» | 87,2 |${filaReq("La requisición controla lo que se entrega. El fuego no pide permiso, y nadie paga la pérdida.")}`],
  ["| Un informe de recepción | «El informe es para lo que llega. Aquí falta saber qué hay ya en la bodega.» | 97,6 |",
    `| Un informe de recepción | «El informe es para lo que llega. Aquí falta saber qué hay ya en la bodega.» | 97,6 |${filaReq("La requisición cuida lo que sale. No dice cuánto hay en la bodega.")}`],
  ["| Un informe de recepción | «El informe es para lo que llega. Aquí la hoja ya existe y nadie la usa.» | 93,7 |",
    `| Un informe de recepción | «El informe es para lo que llega. Aquí la hoja ya existe y nadie la usa.» | 93,7 |${filaReq("La requisición cuida cada entrega. Aquí el problema es la hoja que nadie usa.")}`],
  ["| Un informe de recepción | «El informe es para lo que llega. Aquí el problema es el día que todos conocen.» | 89,8 |",
    `| Un informe de recepción | «El informe es para lo que llega. Aquí el problema es el día que todos conocen.» | 89,8 |${filaReq("La requisición cuida cada entrega. Aquí el problema es que todos conocen el día de la visita.")}`],
  ["| Revisiones al azar | «Una revisión al azar lo vería tarde, si es que lo ve. Falta algo el día en que llegan.» | 99,0 |",
    `| Revisiones al azar | «Una revisión al azar lo vería tarde, si es que lo ve. Falta algo el día en que llegan.» | 99,0 |${filaReq("La requisición es para lo que sale. Aquí el problema es lo que llega y no se anota.")}`],
  /* H7-2 · la pista de Conteos en `mismo-dia` decía «revisión», la palabra de la opción correcta. */
  ["«Ya hay una revisión cada mes. El problema es que todos saben el día.»", "«Ya hay una visita cada mes. El problema es que todos saben qué día llega.»"],
];

/* N3-1 (el caso 3, su acierto y dos pistas) y N3-3 (cinco pistas). N3-2 se resuelve con estas dos. */
export const N3_MELLO = [
  ["«Al cierre, el saldo de Inversiones – títulos no coincide con lo guardado. La diferencia viene de alguna operación del año, y nadie sabe de cuál.»",
    "«Al cierre, el saldo de Inversiones – títulos no coincide con lo guardado. Nada quedó a medias: el error está en algo que entró o salió, y nadie sabe en qué.»"],
  ["«Así es: para hallar la diferencia hay que revisar todo lo que se compró y se vendió.»", "«Así es: la diferencia se busca en los movimientos de compra y venta.»"],
  ["«Los títulos guardados pueden estar bien. La diferencia está en alguna operación del año.»", "«Los datos de cada título pueden estar bien. El error está en algo que entró o salió.»"],
  ["«Las operaciones del año ya terminaron. Hay que revisarlas todas, no una que sigue abierta.»", "«El caso dice que nada quedó a medias. El error está en algo que ya entró o salió.»"],
  ["«El bono no se compró ni se vendió este año. El problema es un dato del documento.»", "«Aquí no hay ninguna compra ni venta en juego. Mira qué se sabe del bono.»"],
  ["«No falta revisar operaciones del año. Lo que no coincide es el título guardado.»", "«Aquí no hay ninguna compra ni venta en juego. Mira lo que dicen el título y el registro.»"],
  ["«No se trata de todo el año, sino de una sola compra que no ha terminado.»", "«Examinar mira lo que ya se anotó. Fíjate en qué punto va esta compra.»"],
  ["«No se trata de todo el año, sino de una sola venta que no ha terminado.»", "«Examinar mira lo que ya se anotó. Fíjate en qué punto va esta venta.»"],
  ["«Las acciones ya no están en la empresa. Lo que falta es saber si la venta termina.»", "«Las acciones ya no están en la empresa: no queda ningún título que revisar.»"],
];

/* N3-4 · el orden fijo de los casos, leído de la auditoría. */
const ORDEN = AUDITORIA_D.match(/\*\*Orden fijo nuevo: (\d(?:, \d)+)\.\*\*/);
if (!ORDEN) throw new Error("la auditoría no trae el orden fijo de N3");
export const ORDEN_N3 = ORDEN[1].split(", ").map(Number);

/* La corrección de Mello a la fusión de la entrega 5 que sigue en pie: la glosa de Verificar. */
export const E5_MELLO = [
  ["«Revisar los datos de cada documento: quién lo emitió, el precio, cuándo vence y el número.»", "«Revisar los datos de cada documento contra los registros.»"],
];

const citas = (s) => s.match(/«[^»]+»/g) ?? [];
/* Lo nuevo de cada par: las citas que no estaban en el texto viejo (una fila añadida trae detrás la de antes). */
const nuevas = ([vieja, nueva]) => citas(nueva).filter((t) => !vieja.includes(t));
for (const par of [...H7_MELLO, ...N3_MELLO]) {
  if (!nuevas(par).length) throw new Error(`corrección sin texto nuevo: ${par[0]}`);
  for (const t of nuevas(par)) if (!AUDITORIA_D.includes(t)) throw new Error(`no está en la auditoría de Mello: ${t}`);
}
for (const par of E5_MELLO) for (const t of nuevas(par)) if (!MELLO_E5.includes(t)) throw new Error(`no está en la auditoría de Mello: ${t}`);

const aplicar = (md, pares) => pares.reduce((s, [vieja, nueva]) => {
  const veces = s.split(vieja).length - 1;
  if (veces !== 1) throw new Error(`el texto viejo está ${veces} veces en el paquete: ${vieja}`);
  return s.replace(vieja, () => nueva);
}, md);

/** La entrega D v2, con las correcciones obligatorias de Mello encima. */
export const paqueteDConMello = () => aplicar(PAQUETE_D, [...H7_MELLO, ...N3_MELLO]);
/** La fusión de N3 de la entrega 5, con la glosa de Verificar de Mello. */
export const entrega5ConMello = () => aplicar(ENTREGA5, E5_MELLO);
