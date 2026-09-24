import { DEBE, HABER, LAVADO_DE_AUTOS, mayorConSaldos } from "../data/contabilidad.js";

/*
 * ═══════════════════════════════════════════════════════════════════════════
 * SEMBRAR UN ERROR EN EL MAYOR — la aritmética de CU-12.
 *
 * El caso no trae el mayor equivocado escrito a mano: trae LA OPERACIÓN que
 * lo estropea. El mayor con error se calcula aplicando esa operación a las
 * nueve transacciones del capítulo y mayorizando otra vez.
 *
 * Por qué, y no al revés: un mayor transcrito a mano sería una segunda
 * verdad. El día que alguien corrigiera una cifra del capítulo, el caso
 * seguiría preguntando por la vieja y el estudiante «acertaría» señalando un
 * error que ya no existe. Aquí no puede pasar: el error es siempre la
 * diferencia entre el capítulo y sí mismo.
 *
 * ═══════════ LO QUE LA BALANZA NO VE ═══════════
 *
 * De los seis casos, cinco descuadran el mayor y uno NO: cambiar una cifra de
 * cuenta sin tocar ni el lado ni el valor deja los dos totales exactamente
 * iguales. Ese caso es la lección entera de la actividad —la balanza es un
 * instrumento, no un oráculo— y por eso `descuadra` se CALCULA aquí en vez de
 * declararse en el contenido: si algún día un caso cambiara de naturaleza, la
 * actividad se enteraría sola.
 * ═══════════════════════════════════════════════════════════════════════════
 */

const clonar = (t) => ({
  ...t,
  asiento: { debe: t.asiento.debe.map((l) => [...l]), haber: t.asiento.haber.map((l) => [...l]) },
});

const otroLado = (lado) => (lado === DEBE ? HABER : DEBE);

/** Dónde está la cuenta dentro del asiento, o null si no está. */
function ubicar(asiento, cuenta) {
  for (const lado of [DEBE, HABER]) {
    const k = asiento[lado].findIndex(([nombre]) => nombre === cuenta);
    if (k >= 0) return { lado, k };
  }
  return null;
}

/*
 * Las cuatro operaciones, una por tipo de error del capítulo. Cada una
 * EXIGE encontrar lo que va a estropear: una siembra que no encuentra su
 * renglón devolvería el mayor limpio, la actividad preguntaría por un error
 * inexistente y nadie se enteraría. Mejor que reviente aquí.
 */
const SIEMBRAS = {
  /* El renglón se pasa al lado contrario con su mismo valor. */
  invertirLado(asiento, { cuenta }) {
    const donde = ubicar(asiento, cuenta);
    if (!donde) throw new Error(`invertirLado: «${cuenta}» no está en el asiento`);
    const [renglon] = asiento[donde.lado].splice(donde.k, 1);
    asiento[otroLado(donde.lado)].push(renglon);
  },
  /* El renglón conserva su lado y su cuenta, y cambia de cifra. */
  cambiarValor(asiento, { cuenta, valor }) {
    const donde = ubicar(asiento, cuenta);
    if (!donde) throw new Error(`cambiarValor: «${cuenta}» no está en el asiento`);
    asiento[donde.lado][donde.k][1] = valor;
  },
  /* El renglón conserva lado y cifra, y cambia de cuenta: esta no descuadra. */
  cambiarCuenta(asiento, { de, a }) {
    const donde = ubicar(asiento, de);
    if (!donde) throw new Error(`cambiarCuenta: «${de}» no está en el asiento`);
    asiento[donde.lado][donde.k][0] = a;
  },
  /* Media transacción: una de las dos mitades nunca se anotó. */
  quitarMitad(asiento, { lado }) {
    if (asiento[lado].length === 0) throw new Error(`quitarMitad: el ${lado} ya está vacío`);
    asiento[lado].pop();
  },
};

/** Las nueve transacciones del capítulo con una estropeada. */
export function transaccionesConError(caso, transacciones = LAVADO_DE_AUTOS.transacciones) {
  const cuales = transacciones.map(clonar);
  const t = cuales.find((x) => x.id === caso.transaccion);
  if (!t) throw new Error(`la transacción «${caso.transaccion}» no existe`);
  const sembrar = SIEMBRAS[caso.siembra.clase];
  if (!sembrar) throw new Error(`no existe la siembra «${caso.siembra.clase}»`);
  sembrar(t.asiento, caso.siembra);
  return cuales;
}

/** Los dos totales del mayor y su diferencia. La balanza lee de aquí. */
export function totalesDelMayor(mayor) {
  const debe = mayor.reduce((s, c) => s + c.debitos.reduce((a, m) => a + m.valor, 0), 0);
  const haber = mayor.reduce((s, c) => s + c.creditos.reduce((a, m) => a + m.valor, 0), 0);
  return { debe, haber, descuadre: Math.abs(debe - haber), cuadra: debe === haber };
}

/**
 * El caso montado: el mayor con el error dentro, el mayor limpio para
 * comparar, y si la balanza lo delata o no.
 */
export function montarCaso(caso, transacciones = LAVADO_DE_AUTOS.transacciones) {
  const sucias = transaccionesConError(caso, transacciones);
  const mayor = mayorConSaldos(sucias);
  const totales = totalesDelMayor(mayor);
  return {
    caso,
    transacciones: sucias,
    mayor,
    limpio: mayorConSaldos(transacciones),
    totales,
    descuadra: !totales.cuadra,
  };
}

/*
 * ═══════════ EL SORTEO, Y POR QUÉ NO ES UN SORTEO LIMPIO ═══════════
 *
 * El caso que no descuadra va SIEMPRE, y va SIEMPRE DE ÚLTIMO. Las dos cosas
 * por la misma razón: es la lección de la actividad y solo se aprende después
 * de haberle cogido confianza a la balanza. Sorteado como los demás, saldría
 * en dos de cada tres intentos, y a veces de primero —antes de que la balanza
 * signifique nada—.
 *
 * Lo rejugable queda en los otros dos, que salen de los cinco restantes: diez
 * parejas posibles, cada una en dos órdenes.
 */
export const casoSinDescuadre = (casos) => casos.find((c) => !montarCaso(c).descuadra) ?? null;

export function sortearCasos(casos, cuantos, barajar) {
  const mudo = casoSinDescuadre(casos);
  if (!mudo) return barajar(casos).slice(0, cuantos);
  const resto = barajar(casos.filter((c) => c !== mudo)).slice(0, Math.max(0, cuantos - 1));
  return [...resto, mudo];
}

/* Los cuatro diagnósticos, en el orden en que el capítulo los enumera. */
export const TIPOS_DE_ERROR = [
  { id: "valor", nombre: "Valor equivocado" },
  { id: "lado", nombre: "Lado equivocado" },
  { id: "cuenta", nombre: "Cuenta equivocada" },
  { id: "falta", nombre: "Falta un registro" },
];

export const nombreDeTipo = (id) => TIPOS_DE_ERROR.find((t) => t.id === id)?.nombre ?? null;
