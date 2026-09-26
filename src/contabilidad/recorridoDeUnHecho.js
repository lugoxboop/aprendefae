import { CALEJA } from "../data/contabilidad.js";
import { montarBanco } from "./armaElBalance.js";
import {
  ESTACIONES, FACTURA, USUARIOS, OPCIONES, CUENTA_RESALTADA,
} from "../data/contabilidadIntro.js";

/*
 * ═══════════════════════════════════════════════════════════════════════════
 * «EL RECORRIDO DE UN HECHO» — la aritmética.
 *
 * El hecho que recorre el anillo es una transacción de verdad del capítulo, y
 * las cuatro formas que toma después salen de ella y del mayor de Caleja. Ni
 * un número escrito a mano en toda la pieza.
 *
 * ═══════════ EL BALANCE NO SE «CORRIGE» ═══════════
 *
 * En el estado de situación financiera, Cuentas por pagar vale 15.000 y no
 * 25.000, aunque la deuda naciera en 25.000 con esta misma compra: una
 * transacción posterior canceló 10.000 de ella. Equipo de computación sí
 * sigue en 25.000, porque nada posterior lo tocó.
 *
 * Parece un descuadre y no lo es, y por eso el balance se DERIVA del mayor en
 * vez de transcribirse: así nadie puede «arreglar» ese 15.000 sin romper el
 * capítulo entero. Hay una prueba que lo exige por su nombre.
 * ═══════════════════════════════════════════════════════════════════════════
 */

/** La transacción que origina todo: la compra del computador a crédito. */
export const TRANSACCION_DEL_HECHO = "cal-2";

export function hechoDelRecorrido() {
  const t = CALEJA.transacciones.find((x) => x.id === TRANSACCION_DEL_HECHO);
  if (!t) throw new Error(`no existe la transacción «${TRANSACCION_DEL_HECHO}» de Caleja`);
  const debe = t.asiento.debe;
  const haber = t.asiento.haber;
  if (debe.length !== 1 || haber.length !== 1) {
    throw new Error("el hecho del recorrido tiene que ser un asiento simple");
  }
  return {
    transaccion: t,
    texto: t.texto,
    /* El renglón de la estación 3: dos cuentas y dos cifras, sin lados. */
    renglon: [...debe, ...haber].map(([cuenta, valor]) => ({ cuenta, valor })),
    valor: debe[0][1],
  };
}

export const HECHO = hechoDelRecorrido();

/** El balance de la estación 4, derivado del mayor. */
export const BALANCE = montarBanco("caleja");

/*
 * La factura de la estación 2. El único campo con cifra la toma del hecho;
 * los tres que el capítulo no da se quedan con su guion.
 */
export function facturaDelHecho(hecho = HECHO) {
  return FACTURA.map((c) => (c.campo === "Valor" && c.valor === null
    ? { ...c, valor: hecho.valor }
    : c));
}

/** Cuántos campos de la factura vienen de verdad del libro. */
export const camposDelLibro = (factura = facturaDelHecho()) => factura.filter((c) => c.delLibro).length;

/*
 * ═══════════ CUÁNTAS TRANSACCIONES SE JUNTARON ═══════════
 *
 * El texto de la estación 4 dice «las otras cinco transacciones del mes». Ese
 * cinco no se escribe: es cuántas tiene el caso menos la del hecho. Si el
 * capítulo ganara o perdiera una, el texto lo seguiría.
 */
export const OTRAS_TRANSACCIONES = CALEJA.transacciones.length - 1;

/* La línea del balance que se resalta, y las que quedan en segundo plano. */
export function lineaResaltada(balance = BALANCE) {
  const linea = balance.cuentas.find((c) => c.cuenta === CUENTA_RESALTADA);
  if (!linea) throw new Error(`«${CUENTA_RESALTADA}» no está en el balance de Caleja`);
  return linea;
}

/*
 * ═══════════════════════════════════════════════════════════════════════════
 * EL ESTADO DEL ANILLO EN CADA SEGMENTO
 *
 * `paso` va de 0 (nada encendido) a 5 (las cinco), y 6 es el cierre. Las
 * formas anteriores NO se apagan: quedan en su estación, porque nada se
 * pierde en el camino — y eso es justamente lo que la pieza enseña.
 * ═══════════════════════════════════════════════════════════════════════════
 */
export const PASOS = ESTACIONES.length;
export const PASO_DEL_CIERRE = PASOS + 1;

export function anilloEn(paso) {
  return ESTACIONES.map((e) => ({
    ...e,
    encendida: paso >= e.n,
    /* La forma aparece cuando la estación se enciende, y se queda. */
    conForma: paso >= e.n,
    /* Solo la recién llegada es «la que está ocurriendo ahora». */
    actual: paso === e.n,
  }));
}

/** El trazo de retorno solo se dibuja cuando el ciclo ya se cerró. */
export const retornoEn = (paso) => (paso >= PASO_DEL_CIERRE ? "encendido" : "apagado");

/*
 * ═══════════════════════════════════════════════════════════════════════════
 * LA REGLA DEL RETORNO — el corazón de la capa 3
 *
 * Los ocho usuarios consultan el mismo resumen y los ocho reciben su pregunta.
 * Lo que los separa es otra cosa: solo la decisión de la administración cambia
 * lo que la empresa HACE, así que solo ahí el trazo vuelve a la estación 1.
 *
 * Y con los otros siete el trazo queda ATENUADO, nunca invisible: que el ciclo
 * exista no depende de quién lo esté mirando. Borrarlo diría que para un
 * acreedor la contabilidad no es un ciclo, y eso es falso.
 * ═══════════════════════════════════════════════════════════════════════════
 */
export const ATENUADO = "atenuado";
export const ENCENDIDO = "encendido";

export function retornoParaUsuario(usuario) {
  if (!usuario) return ATENUADO;
  return usuario.cierraElCiclo ? ENCENDIDO : ATENUADO;
}

export const usuarioPorId = (id) => USUARIOS.find((u) => u.id === id) ?? null;

/** El único que cierra el ciclo. Se deduce del banco, no se nombra aquí. */
export const QUIEN_CIERRA = USUARIOS.filter((u) => u.cierraElCiclo);

/* Y el usuario del recorrido guiado es ese mismo: no es una elección aparte. */
export const USUARIO_DEL_RECORRIDO = QUIEN_CIERRA[0];

export const internos = () => USUARIOS.filter((u) => u.tipo === "interno");
export const externos = () => USUARIOS.filter((u) => u.tipo === "externo");

/* ═══════════════════ CAPA 4 ═══════════════════ */

export const LA_CORRECTA = OPCIONES.filter((o) => o.correcta);

export function evaluarOpcion(id) {
  const o = OPCIONES.find((x) => x.id === id);
  if (!o) throw new Error(`no existe la opción «${id}»`);
  return o;
}

/** Cuántas palabras tiene cada opción, para que ninguna delate por su largo. */
export const palabrasDe = (texto) => texto.trim().split(/\s+/).length;
