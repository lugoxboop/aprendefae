import { ACTIVO, PASIVO, PATRIMONIO, tipoDeCuenta, mayorConSaldos } from "../data/contabilidad.js";
import {
  BANCOS_DE_BALANCE, SECCIONES, RAZON_POR_CUENTA, ERROR_POR_CRUCE, ITEMS_HISTORICOS,
} from "../data/contabilidadBalance.js";

/*
 * ═══════════════════════════════════════════════════════════════════════════
 * A2 · ARMA EL BALANCE — la aritmética.
 *
 * Cada banco es un balance real, y sale de mayorizar las transacciones de su
 * caso. Ni un saldo transcrito: si mañana alguien corrigiera una cifra del
 * capítulo, este balance la seguiría — y el de aquí no podría decir una cosa
 * distinta de la que dicen El Saldo de la Cuenta o el desafío.
 *
 * ═══════════ LA SECCIÓN SALE DEL CATÁLOGO ═══════════
 *
 * Que Caja sea activo no se declara aquí: lo dice tipoDeCuenta, que es el
 * catálogo del capítulo. Declararlo otra vez sería una segunda verdad, y esta
 * actividad existe precisamente para enseñar cuál es la primera.
 * ═══════════════════════════════════════════════════════════════════════════
 */

export { SECCIONES };

const slug = (texto) => texto
  .toLowerCase()
  .normalize("NFD").replace(/\p{Mark}/gu, "")
  .replace(/[^a-z0-9]+/g, "-")
  .replace(/(^-|-$)/g, "");

/**
 * Un banco montado: sus cuentas con su saldo y su sección, en el orden en que
 * el mayor las abre.
 */
export function montarBanco(id) {
  const banco = BANCOS_DE_BALANCE.find((b) => b.id === id);
  if (!banco) throw new Error(`no existe el banco «${id}»`);

  const cuentas = mayorConSaldos(banco.transacciones).map((c) => {
    const seccion = tipoDeCuenta(c.cuenta);
    if (!SECCIONES.some((s) => s.id === seccion)) {
      /*
       * Un balance no lleva ingresos ni gastos. Si alguna vez entrara uno por
       * un cambio en el caso, es mejor que reviente aquí que dibujar un
       * documento que no existe.
       */
      throw new Error(`«${c.cuenta}» es ${seccion} y no cabe en un balance`);
    }
    return {
      id: `cu2-${banco.id}-${slug(c.cuenta)}`,
      cuenta: c.cuenta,
      valor: c.saldo,
      seccion,
      acierto: RAZON_POR_CUENTA[c.cuenta] ?? null,
    };
  });

  const totalDe = (s) => cuentas.filter((c) => c.seccion === s).reduce((t, c) => t + c.valor, 0);
  const activos = totalDe(ACTIVO);
  const pasivos = totalDe(PASIVO);
  const patrimonio = totalDe(PATRIMONIO);

  return {
    id: banco.id,
    empresa: banco.empresa,
    fecha: banco.fecha,
    /* En qué momento de la empresa está hecha la foto, cuando hace falta decirlo. */
    subtitulo: banco.subtitulo ?? null,
    cuentas,
    activos,
    pasivos,
    patrimonio,
    pasivosMasPatrimonio: pasivos + patrimonio,
    cuadra: activos === pasivos + patrimonio,
  };
}

/** Los dos balances, montados una vez. */
export const BALANCES = BANCOS_DE_BALANCE.map((b) => montarBanco(b.id));

/*
 * La devolución. El acierto es la razón de ESA cuenta; el error, el cruce
 * concreto —de dónde venía a dónde la puso—, que con tres secciones son seis.
 */
export function evaluarUbicacion(item, puesta) {
  const ok = puesta === item.seccion;
  if (ok) return { ok, texto: item.acierto, cruce: null };
  const cruce = `${item.seccion}>${puesta}`;
  const e = ERROR_POR_CRUCE[cruce];
  if (!e) throw new Error(`no hay devolución para el cruce «${cruce}»`);
  return { ok, texto: e.texto, cruce, resaltar: e.resaltar, conectarCon: e.conectarCon ?? null };
}

/*
 * Cada cuenta vale lo mismo, y cuánto depende del banco que salió: siete
 * cuentas reparten el 100 % de otra forma que once. El reintento vale la
 * mitad, como en el resto del tema.
 */
export const VALOR_SEGUNDO = 0.5;

export function puntuar(respuestas, cuantas) {
  if (!cuantas) return 0;
  const suma = respuestas.reduce((s, r) => {
    if (r.primeroOk) return s + 1;
    if (r.segundoOk) return s + VALOR_SEGUNDO;
    return s;
  }, 0);
  return (suma / cuantas) * 100;
}

/** Lo que valía cada cuenta, para poder decirlo en pantalla. */
export const pesoDeCadaCuenta = (cuantas) => (cuantas ? 100 / cuantas : 0);

/* Qué cuenta era cada id del banco anterior, para el panel docente. */
export const cuentaHistorica = (id) => ITEMS_HISTORICOS[id] ?? null;
