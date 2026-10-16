import { ITEMS_H3, FICHA_H3 } from "../data/contabilidadT7_1_h3.js";
import { METODOS_H4, FILAS_H4, UTILIDAD_ANTES_H4, PARTE2_H4 } from "../data/contabilidadT7_1_h4.js";
import { ITEMS_H6, FICHA_H6, CIFRAS_H6 } from "../data/contabilidadT7_1_h6.js";
import { ITEMS_H5 as ITEMS_T72_H5, encabezadoDeHecho } from "../data/contabilidadT7_2_h5.js";
import { FIGURAS_H2 as FIGURAS_T73_H2 } from "../data/contabilidadT7_3_h2.js";
import { FIGURAS_H4 as FIGURAS_T73_H4 } from "../data/contabilidadT7_3_h4.js";
import { ITEMS_N4 } from "../data/contabilidadT5_n4.js";

/*
 * ═══════════════════════════════════════════════════════════════════════════
 * LA FIGURA ACUMULADA (Célula C · lote 5 de L, «la figura crece y se queda»).
 *
 * Lo que hace enganchar a «Llena el kárdex»: la figura se completa con cada
 * respuesta y sigue en pantalla. Un solo patrón para siete Hacer: la figura
 * va arriba del ítem, gana su parte AL CERRARSE cada ítem (por acierto, por
 * error o, con escalera, por su último intento), nunca antes (E8), y se queda
 * hasta el cierre. El componente, en t7/FiguraAcumulada.jsx.
 *
 * Una figura es una lista de bloques, con la forma de las figuras del Patrón
 * T7-3 (FigurasHacer), para que las de T7-3 entren tal cual:
 *
 *   { tipo: "renglones", desde, titulo?, nota?, filas: [fila] }
 *       fila: { desde?, op? ("+", "−", "×", "="), rot, v, res?, fuerte?,
 *               fuerteDesde?, texto? }  ·  o un subtítulo: { desde?, tit }
 *       `texto`: el valor es una palabra (una cuenta), va debajo del rótulo.
 *   { tipo: "asiento", desde, titulo?, lineas: [{ cuenta, lado, valor }], totales? }
 *   { tipo: "tabla", desde, columnas: [nombre], filas: [{ rot, valores, res? }] }
 *   { tipo: "plazos", desde, hasta?, ... } (la franja del Patrón T7-3)
 *
 *   desde   cuántos ítems cerrados hacen falta para que salga (1 = el ítem 1)
 *   hasta   solo la franja de plazos de T7-3 H4 lo trae (Watari): el último
 *           ítem en cuya pantalla se ve. Nada se va en el momento de responder.
 *
 * Las filas salen de lo que cada pieza ya calcula o ya muestra en el acierto.
 * Los rótulos que no existían en los datos ni en el paquete van marcados
 * [ESCRITO POR CLAUDE, NO POR LA FICHA] PENDIENTE_DE_REVISION: los escribe Near.
 * ═══════════════════════════════════════════════════════════════════════════
 */

/*
 * Lo que se ve con `cerrados` ítems cerrados. `listo`: el ítem en pantalla ya
 * se cerró (entonces `cerrados` lo cuenta). Lo que sale con el ítem que se
 * acaba de cerrar lleva `nuevo` (entra con el fundido).
 */
export function visiblesDeFigura(bloques, cerrados, listo) {
  const ahora = listo ? cerrados : null;
  const actual = listo ? cerrados : cerrados + 1;
  return bloques
    .filter((b) => (b.desde ?? 1) <= cerrados && (b.hasta == null || actual <= b.hasta))
    .map((b) => {
      const nuevo = (b.desde ?? 1) === ahora;
      if (b.tipo !== "renglones") return { ...b, nuevo };
      const filas = b.filas
        .filter((f) => (f.desde ?? b.desde ?? 1) <= cerrados)
        .map((f) => ({
          ...f,
          fuerte: Boolean(f.fuerte || (f.fuerteDesde != null && f.fuerteDesde <= cerrados)),
          nuevo: !nuevo && ((f.desde != null && f.desde === ahora) || (f.fuerteDesde != null && f.fuerteDesde === ahora)),
        }));
      return { ...b, nuevo, filas };
    });
}

/* Cuántos ítems están cerrados: los de antes y, si ya se cerró, el de ahora. */
export const cerradosDe = (i, listo) => i + (listo ? 1 : 0);

const porId = (items) => Object.fromEntries(items.map((x) => [x.id, x]));
const lineasDe = (it) => it.lineas.map((l) => ({ cuenta: l.cuenta, lado: l.lado, valor: l.valor }));

/* ═══════════ T7-1 · H3 · ¿CUÁNTO VALE LO QUE SOBRÓ? ═══════════
 * La tabla de los tres métodos se llena con cada respuesta: el rótulo de cada
 * método es su encabezado en la pieza; el promedio, con la cuenta de su
 * acierto (10 × $14.750 = $147.500). Con el ítem 5, el método del inventario
 * más alto queda en negrita.
 */
const H3 = porId(ITEMS_H3);
const [QUEDO_H3, CAJAS_H3] = FICHA_H3.find(([dato]) => dato === "Qué quedó según el conteo físico");
export const FIGURA_T7_1_H3 = [
  {
    tipo: "renglones", desde: 1,
    filas: [
      { desde: 1, rot: H3.peps.encabezado, v: H3.peps.correcta, fuerteDesde: 5 },
      { desde: 2, rot: H3.ueps.encabezado, v: H3.ueps.correcta },
      /* [ESCRITO POR CLAUDE, NO POR LA FICHA] PENDIENTE_DE_REVISION: «Costo unitario promedio» (sale de la pregunta del ítem 3). */
      { desde: 3, rot: "Costo unitario promedio", v: H3["costo-promedio"].correcta },
      { desde: 4, op: "×", rot: QUEDO_H3, v: CAJAS_H3 },
      { desde: 4, op: "=", rot: H3["costo-promedio"].encabezado, v: H3["final-promedio"].correcta, res: true },
    ],
  },
];

/* ═══════════ T7-1 · H4 · CIERRA EL MES ═══════════
 * El estado de resultados de los tres métodos, con la fila que sale al
 * confirmar, pasa a la figura al cerrar la parte 1 (en la parte 1 la tabla es
 * el ítem mismo y ya está en pantalla); las dos líneas del cierre con el
 * promedio, al comprobar la parte 2.
 */
export const FIGURA_T7_1_H4 = [
  {
    tipo: "tabla", desde: 1,
    columnas: METODOS_H4.map((m) => m.nombre),
    filas: [
      ...FILAS_H4.map((f) => ({ rot: f.nombre, valores: METODOS_H4.map((m) => m.cifras[f.id]) })),
      { rot: UTILIDAD_ANTES_H4.nombre, valores: METODOS_H4.map((m) => m.cifras.operacional), res: true },
    ],
  },
  { tipo: "asiento", desde: 2, lineas: PARTE2_H4.lineas.map((l) => ({ cuenta: l.cuenta, lado: l.lado, valor: l.valor })) },
];

/* ═══════════ T7-1 · H6 · LA DEVOLUCIÓN EN DOS LIBROS ═══════════
 * La cuenta del acierto del ítem 3 ($850.000 + $136.000 − $29.750 =
 * $956.250) se arma con los ítems 1 a 3; después, cada libro con su asiento.
 */
const H6 = porId(ITEMS_H6);
const [MONTO_H6] = FICHA_H6.find(([dato]) => dato === "Monto");
export const FIGURA_T7_1_H6 = [
  {
    tipo: "renglones", desde: 1,
    filas: [
      { desde: 1, rot: MONTO_H6, v: CIFRAS_H6.devolucion },
      /* [ESCRITO POR CLAUDE, NO POR LA FICHA] PENDIENTE_DE_REVISION: «IVA que se reversa», «Retención que se reversa», «Baja la deuda». */
      { desde: 1, op: "+", rot: "IVA que se reversa", v: H6["iva-reversa"].correcta },
      { desde: 2, op: "−", rot: "Retención que se reversa", v: H6["retencion-reversa"].correcta },
      { desde: 3, op: "=", rot: "Baja la deuda", v: H6["baja-deuda"].correcta, res: true },
    ],
  },
  { tipo: "asiento", desde: 4, titulo: H6["libro-garza"].encabezado, lineas: lineasDe(H6["libro-garza"]), totales: true },
  { tipo: "asiento", desde: 5, titulo: H6["libro-nogal"].encabezado, lineas: lineasDe(H6["libro-nogal"]), totales: true },
];

/* ═══════════ T7-2 · H5 · FLETE Y DEVOLUCIÓN ═══════════
 * Lo de cada hecho, debajo de su «Hecho n», con la respuesta de su ítem (las
 * cuentas salen de ITEMS_H5: si cambia un nombre de cuenta, la figura lo
 * sigue); el asiento del hecho 4, al comprobarlo.
 */
const T72 = ITEMS_T72_H5;
const desdeDe = (id) => T72.findIndex((x) => x.id === id) + 1;
const H5 = porId(T72);
export const FIGURA_T7_2_H5 = [
  {
    tipo: "renglones", desde: 1,
    filas: [
      { desde: desdeDe("flete-del-comprador"), tit: encabezadoDeHecho(0) },
      /* [ESCRITO POR CLAUDE, NO POR LA FICHA] PENDIENTE_DE_REVISION: «Cuenta del flete», «Pago a la transportadora», «Va al haber», «Baja la deuda con el proveedor». */
      { desde: desdeDe("flete-del-comprador"), rot: "Cuenta del flete", v: H5["flete-del-comprador"].correcta, texto: true },
      { desde: desdeDe("pago-a-la-transportadora"), rot: "Pago a la transportadora", v: H5["pago-a-la-transportadora"].correcta },
      { desde: desdeDe("flete-del-vendedor"), tit: encabezadoDeHecho(1) },
      { desde: desdeDe("flete-del-vendedor"), rot: "Cuenta del flete", v: H5["flete-del-vendedor"].correcta, texto: true },
      { desde: desdeDe("devolucion-de-compras"), tit: encabezadoDeHecho(2) },
      { desde: desdeDe("devolucion-de-compras"), rot: "Va al haber", v: H5["devolucion-de-compras"].correcta, texto: true },
      { desde: desdeDe("baja-con-el-proveedor"), rot: "Baja la deuda con el proveedor", v: H5["baja-con-el-proveedor"].correcta },
    ],
  },
  {
    tipo: "asiento", desde: desdeDe("devolucion-de-ventas"), titulo: encabezadoDeHecho(H5["devolucion-de-ventas"].hecho),
    lineas: lineasDe(H5["devolucion-de-ventas"]), totales: true,
  },
];

/* ═══════════ T7-3 · H2 · LA CADENA DE DESCUENTOS ═══════════
 * Ya crecía así (Patrón T7-3): sus figuras, tal cual.
 */
export const FIGURA_T7_3_H2 = FIGURAS_T73_H2;

/* ═══════════ T7-3 · H4 · PAGÓ A TIEMPO ═══════════
 * Los renglones de la factura, del descuento y del pago, en UNA sola cuenta
 * que crece: cada parte con su título de Watari como subtítulo y sus filas,
 * después de su ítem. La franja de plazos sigue como la dejó Watari (del
 * ítem 2 al 3).
 */
export function unaSolaCuenta(figuras) {
  const renglones = figuras.filter((f) => f.tipo === "renglones");
  const [primera] = renglones;
  return [
    ...figuras.filter((f) => f.tipo !== "renglones" && f.desde < primera.desde),
    {
      tipo: "renglones", desde: primera.desde,
      filas: renglones.flatMap((f) => [{ desde: f.desde, tit: f.titulo }, ...f.filas.map((x) => ({ ...x, desde: x.desde ?? f.desde }))]),
    },
    ...figuras.filter((f) => f.tipo !== "renglones" && f.desde >= primera.desde),
  ];
}
export const FIGURA_T7_3_H4 = unaSolaCuenta(FIGURAS_T73_H4);

/* ═══════════ T5 · N4 · EL INTERÉS DEL PERIODO ═══════════
 * La cuenta de intereses crece trimestre a trimestre: cada cuánto se cobra,
 * el interés del primero y su asiento; la base y el interés del segundo.
 */
const N4 = porId(ITEMS_N4);
const desdeN4 = (id) => ITEMS_N4.findIndex((x) => x.id === id) + 1;
export const FIGURA_T5_N4 = [
  {
    tipo: "renglones", desde: 1,
    filas: [
      /* [ESCRITO POR CLAUDE, NO POR LA FICHA] PENDIENTE_DE_REVISION: «Cobra el interés», «Interés del primer trimestre». */
      { desde: desdeN4("cada-cuanto"), rot: "Cobra el interés", v: N4["cada-cuanto"].correcta, texto: true },
      { desde: desdeN4("primer-trimestre"), rot: "Interés del primer trimestre", v: N4["primer-trimestre"].correcta },
    ],
  },
  { tipo: "asiento", desde: desdeN4("asiento-del-cobro"), lineas: lineasDe(N4["asiento-del-cobro"]), totales: true },
  {
    tipo: "renglones", desde: desdeN4("base-del-segundo"),
    filas: [
      /* [ESCRITO POR CLAUDE, NO POR LA FICHA] PENDIENTE_DE_REVISION: «Base del segundo trimestre», «Interés del segundo trimestre». */
      { desde: desdeN4("base-del-segundo"), rot: "Base del segundo trimestre", v: N4["base-del-segundo"].correcta },
      { desde: desdeN4("segundo-trimestre"), rot: "Interés del segundo trimestre", v: N4["segundo-trimestre"].correcta },
    ],
  },
];
