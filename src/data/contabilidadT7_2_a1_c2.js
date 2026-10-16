import { PIEZA_LA_CUENTA_QUE_SI_SE_MUEVE as NEAR, A1_ID, BOTON, PENDIENTE_DE_REVISION } from "./contabilidadT7_2.js";

/*
 * ═══════════════════════════════════════════════════════════════════════════
 * T7-2 · A1 DE APRENDER — «La cuenta que sí se mueve», RENOVADA (Patrón de
 * enganche C2 de Watari, 16-oct-2026, con la auditoría de Mello encima).
 *
 * Fuentes (orquestador/conocimiento/paquetes/):
 *   · patron-enganche-c2-v1.html, sección «cuenta» y su código de referencia
 *   · auditoria-mello-patron-c2.md, sección 2 (Cu-1, Cu-2 y Cu-3)
 *
 * LOS TEXTOS DE NEAR NO SE COPIAN AQUÍ: salen de la pieza de hoy
 * (contabilidadT7_2.js, la entrega 2 con la línea 3 de la entrega 6), que
 * sigue siendo la fuente y su prueba la compara con el paquete de Near.
 * Aquí solo se arman en la forma de la C2:
 *   · la pantalla 2 y la 3 juntan su párrafo y su pregunta en un texto
 *   · los cinco hechos van en el orden de Watari (no se barajan): las cajas
 *     de la bodega suben y bajan con ellos (5 → 8 → 6 → 7 → 6 → 5)
 *   · las opciones, en el orden de Near (Watari no las baraja); la correcta
 *     se nombra en la pantalla (`correcta`), no en la opción
 *
 * Lo que es de Watari (rótulos de interfaz [W], que Near puede cambiar) va
 * en INTERFAZ_C2 y en las cajas de cada hecho (dibujo, no cifra: regla 3).
 *
 * MELLO:
 *   · Cu-1  Costo de la mercancía vendida aparece al acertar la pantalla 3
 *           y trae ya la venta anterior («Vende mercancía») y «Otra venta»
 *           (lo hace el componente; los rótulos salen de aquí)
 *   · Cu-2  un renglón inicial en el debe, «Saldo inicial», con las cajas
 *           del inicio: así el saldo es debe menos haber en todo momento
 *   · Cu-3  el porqué de la pantalla 3 va plegado (`porqueALaVista: false`)
 *
 * Pieza de Aprender: cero FP, no entra al catálogo.
 * ═══════════════════════════════════════════════════════════════════════════
 */

export { A1_ID };

const de = (id) => NEAR.pantallas.find((p) => p.id === id);
const LISTA = de("la-lista-del-libro");
const PERMANENTE = de("el-permanente");
const CONTEO = de("el-conteo-en-el-permanente");
const RESUMEN = de("resumen");
const junta = (...t) => t.filter(Boolean).join(" ");

/* Cajas al empezar y cuántas llenan un lado de la cuenta (dibujo, no cifra). */
export const INICIO = 5;
export const MAX = 10;

/* Los cinco hechos de Near, en el orden de Watari, con las cajas que entran o salen [W]. */
const ORDEN_Y_CAJAS = [["compra", 3], ["vende", 2], ["devuelven-clientes", 1], ["devuelve-proveedores", 1], ["consumo", 1]];
export const HECHOS = ORDEN_Y_CAJAS.map(([id, cajas]) => {
  const l = LISTA.lineas.find((x) => x.id === id);
  return { id, texto: l.texto, lado: l.lado, cajas, devolucion: l.devolucion };
});
/* El renglón de la cuenta: el texto del hecho sin el punto final [W]. */
export const renglonDe = (texto) => texto.replace(/\.$/, "");

/*
 * Rótulos de interfaz de Watari [W] (sección 4 de la C2: «Bodega», «Saldo»,
 * «Conteo», «Contar la bodega» y «Otra venta», que Near puede cambiar).
 * «Saldo inicial» es de Mello (Cu-2), con el rótulo [W]: PENDIENTE de que
 * Near lo confirme. «Entradas» y «Salidas» son los de hoy.
 */
export const INTERFAZ_C2 = {
  marca: "Pantalla {n} de {total}",
  bodega: "Bodega",
  saldo: "Saldo",
  conteo: "Conteo",
  contar: "Contar la bodega",
  otraVenta: "Otra venta",
  saldoInicial: "Saldo inicial",
  inventario: "Inventario de mercancías",
  costo: "Costo de la mercancía vendida",
  debe: "DEBE",
  haber: "HABER",
  ladoDebe: "Debe",
  ladoHaber: "Haber",
  de: "de",
  correcto: "Correcto",
  noVaAqui: "No va aquí",
  incorrecto: "Incorrecto.",
  porQue: "¿Por qué?",
  seguir: BOTON.seguir,
  siguientePieza: "Siguiente pieza",
  entradas: PENDIENTE_DE_REVISION.entradas,
  salidas: PENDIENTE_DE_REVISION.salidas,
};

const eleccion = (p) => ({
  pista: p.pista,
  opciones: p.opciones.map((o) => ({ id: o.id, t: o.texto })),
  correcta: p.opciones.find((o) => o.correcta).id,
  mal: Object.fromEntries(p.opciones.filter((o) => !o.correcta).map((o) => [o.id, o.devolucion])),
  bien: p.acierto.texto,
  porque: p.acierto.porque,
});

export const PANTALLAS_C2 = [
  { id: "portada", texto: de("portada").objetivo, boton: de("portada").boton, pie: de("portada").pie },
  {
    id: LISTA.id, texto: junta(...LISTA.parrafos, LISTA.consigna), lados: true, pista: LISTA.pista, lineas: HECHOS,
    bien: LISTA.acierto.texto, porque: LISTA.acierto.porque, porqueALaVista: false, pie: LISTA.pie,
  },
  /* Cu-3 de Mello: el porqué va plegado (Near lo tenía a la vista por la regla de L). */
  { id: PERMANENTE.id, texto: junta(...PERMANENTE.parrafos, PERMANENTE.pregunta), cmv: true, ...eleccion(PERMANENTE), porqueALaVista: false, pie: PERMANENTE.pie },
  { id: CONTEO.id, texto: junta(...CONTEO.parrafos, CONTEO.pregunta), conteo: true, ...eleccion(CONTEO), porqueALaVista: false, pie: CONTEO.pie },
  { id: RESUMEN.id, texto: "", resumen: true, boton: INTERFAZ_C2.siguientePieza, lista: RESUMEN.lista, siguiente: RESUMEN.siguiente, pie: RESUMEN.pie },
];

export const PIEZA_LA_CUENTA_C2 = {
  id: A1_ID,
  numero: NEAR.numero,
  titulo: NEAR.titulo,
  pantallas: PANTALLAS_C2,
};
