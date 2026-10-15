import { readFileSync } from "node:fs";

/*
 * ═══════════════════════════════════════════════════════════════════════════
 * LAS CORRECCIONES DE MELLO A LOS PAQUETES DE NEAR (pistas del lote 2 y
 * distractores del lote 3). Auditoría: orquestador/conocimiento/paquetes/
 * mello-pistas-distractores-v1.md.
 *
 * Los paquetes de Near se quedan como llegaron. Las pruebas que comparan los
 * datos letra por letra con ellos leen el paquete a través de
 * `conCorreccionesDeMello`, que cambia cada texto viejo por el de Mello, y
 * así la comparación sigue siendo exacta. Cada texto nuevo se comprueba,
 * letra por letra, contra la auditoría.
 * ═══════════════════════════════════════════════════════════════════════════
 */

const AUDITORIA = readFileSync(new URL("../../../orquestador/conocimiento/paquetes/mello-pistas-distractores-v1.md", import.meta.url), "utf8");

/* Pistas del lote 2: «vieja» → «nueva». */
export const PISTAS_MELLO = [
  ["«Busca la cuenta que recoge lo comprado en el periodo.»", "«En el periódico, ¿qué cuenta junta en el periodo la mercancía que se trae para vender?»"],
  ["«El conteo dice cuánto vale lo que quedó en la bodega. Piensa en qué cuenta estuvo quieta todo el periodo.»", "«El conteo dice cuánto vale lo que quedó en la bodega. ¿Qué cuenta debería mostrar ese valor?»"],
  ["«Santa Martha paga el flete para traer su mercancía. Busca la cuenta que lo suma a lo comprado.»", "«Para Santa Martha, este flete es parte del costo de su mercancía. Piensa qué cuenta guarda ese costo en el periódico.»"],
  ["«Piensa en qué momento están a la mano, al mismo tiempo, la factura y la orden de compra.»", "«El libro pide que el control empiece lo antes posible. ¿Cuál de estos momentos llega primero?»"],
  ["«Ahora la empresa usa el permanente. Recuerda qué cuenta deja de estar quieta en este sistema.»", "«La mercancía que se compra es un activo. En el permanente se anota apenas entra.»"],
  ["«Piensa en lo que hay que pagar para tener la mercancía en la bodega, no en gastos de oficina.»", "«El costo incluye todo lo que hay que pagar para tener lista la mercancía. ¿Cuál de estos lo cumple?»"],
  ["«Los dos fletes valían lo mismo y se pagaron igual. ¿Qué cambió entre Santa Martha y La Popa?»", "«Compara las dos columnas de la tabla: ¿qué dato cambia de una a otra?»"],
  ["«En el periódico, unos asientos del cierre ponían al día el inventario. Busca esos.»", "«Piensa qué cuenta ya está al día cuando llega el cierre en el permanente.»"],
  ["«En los dos sistemas, ese flete se suma al costo. ¿Qué es lo distinto entre uno y otro?»", "«Compara la cuenta donde va ese flete en el periódico con las cuentas que existen en el permanente.»"],
  ["«Mira a qué cuenta fue la compra en el permanente. La devolución reversa ese mismo registro.»", "«Piensa qué cuentas existen en el permanente y cuáles no.»"],
  ["«El comercial ya viene restado en la factura. ¿Cuál de los dos ocurre después de facturar?»", "«Un descuento se registra cuando se sabe cuánto es. ¿Cuándo se sabe cada uno?»"],
  ["«El descuento condicionado no toca el IVA. Y la rebaja comercial ya se restó antes.»", "«Piensa qué parte de lo que debe Santa Martha es de la mercancía y qué parte es de otra cosa.»"],
  ["«El sobrante es la diferencia entre lo que hay en la bodega y lo que dicen los libros.»", "«El sobrante no es todo lo que hay en la bodega. ¿Qué parte de lo contado es?»"],
  ["«Santa Martha es quien recibe el descuento. Recuerda de qué lado lo anota quien lo recibe.»", "«Para quien vende, la cuenta fue al debe. Santa Martha está del otro lado del negocio.»"],
];

/* Filas del lote 3: la línea con su distractor y su retroalimentación. */
export const DISTRACTORES_MELLO = [
  ["| `ajuste-faltante` | Inventario de mercancías · H · $44.000 | Provisión para inventarios | «La provisión se usa cuando llega una pérdida que ya se había estimado. Este faltante es un ajuste por el conteo.» |", "| `ajuste-faltante` | Inventario de mercancías · H · $44.000 | Devoluciones de compras | «Olmo no le devolvió nada a un proveedor. La mercancía faltó en el conteo.» |"],
  ["| `perdida-real` | Inventario de mercancías · H · $185.000 | Costo de mercancía vendida | «Esta mercancía no se vendió: se perdió. Y esa pérdida ya se había estimado.» |", "| `perdida-real` | Inventario de mercancías · H · $185.000 | Gasto provisiones – inventarios | «Ese gasto ya se anotó al estimar la provisión. Ahora sale de los libros la mercancía perdida.» |"],
  ["| `perdida-real` | Provisión para inventarios · D · $185.000 | Costo de mercancía vendida | «Esta pérdida ya se había estimado. Se cubre con lo que se reservó para eso.» |", "| `perdida-real` | Provisión para inventarios · D · $185.000 | Costo de mercancía vendida | «Esta pérdida ya se había estimado con una provisión, y se carga a esa provisión.» |"],
  ["| `asiento-del-cobro` | Caja · D · $432.000 | Ingresos por intereses | «Esa cuenta sí se mueve en este cobro, pero en la otra línea. Un ingreso que aumenta no va al debe.» |", "| `asiento-del-cobro` | Caja · D · $432.000 | Ingresos financieros – ganancia en venta de títulos | «No se vendió ningún título. Este valor es el dinero que entra por el interés.» |"],
];

for (const [, nueva] of PISTAS_MELLO) if (!AUDITORIA.includes(nueva)) throw new Error(`no está en la auditoría de Mello: ${nueva}`);
for (const [, nueva] of DISTRACTORES_MELLO) {
  for (const texto of nueva.match(/«[^»]+»/g)) if (!AUDITORIA.includes(texto)) throw new Error(`no está en la auditoría de Mello: ${texto}`);
}

export const conCorreccionesDeMello = (md) => [...PISTAS_MELLO, ...DISTRACTORES_MELLO].reduce((s, [vieja, nueva]) => s.split(vieja).join(nueva), md);
