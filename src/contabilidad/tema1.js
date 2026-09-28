import {
  USUARIOS_T1_1, ZONA_DENTRO, ZONA_FUERA, ACIERTO_T1_1, ERROR_T1_1,
  EMPRESAS, CLASES, MATRIZ, ERROR_T1_2, ACIERTO_T1_2,
  CLAVE_MARCO_SERVICIOS, CLAVE_ERA_SERVICIOS, SIN_INSUMO, T1_1, T1_2,
  TRANSACCIONES_CAP2, T1_4, PARTES, SUBE, BAJA, IGUAL,
  ERROR_A_T1_4, ERROR_B_T1_4, ACIERTO_T1_4,
  T1_5, ERROR_T1_5, DESDE_EL_CORTO,
  T1_6, CONCEPTOS, PRIMERO, SEGUNDO, ERROR_T1_6, ACIERTO_T1_6, PESO_INFORME, PESO_SECCION,
  LINEAS, FLECHAS, ERROR_T1_7, ACIERTO_T1_7,
} from "../data/contabilidadTema1.js";
import { ACTIVO, PASIVO, PATRIMONIO, tipoDeCuenta, pesos } from "../data/contabilidad.js";

/*
 * ═══════════════════════════════════════════════════════════════════════════
 * TEMA 1 · T1-1 y T1-2 — la lógica.
 * ═══════════════════════════════════════════════════════════════════════════
 */

/* ═══════════════════ T1-1 · ¿DESDE DÓNDE PREGUNTAN? ═══════════════════ */

export const INTERNOS = USUARIOS_T1_1.filter((u) => u.zona === ZONA_DENTRO);
export const EXTERNOS = USUARIOS_T1_1.filter((u) => u.zona === ZONA_FUERA);

/*
 * ═══════════ EL SORTEO ES 2 + 4, Y ESA ES LA PIEZA ═══════════
 *
 * Seis de ocho, libre, puede dar cinco externos y un interno. A quien crea que
 * «interno» quiere decir «el que manda» eso le da casi todo bien sin haber
 * entendido nada: acierta los cinco externos por descarte. Con dos internos
 * garantizados, esa creencia se estrella dos veces por intento.
 */
export function sortearT1_1(barajar, cuantos = T1_1.porPartida) {
  const dentro = 2;
  const fuera = cuantos - dentro;
  if (INTERNOS.length < dentro || EXTERNOS.length < fuera) {
    throw new Error(`el banco no alcanza para ${dentro} internos y ${fuera} externos`);
  }
  return barajar([...barajar(INTERNOS).slice(0, dentro), ...barajar(EXTERNOS).slice(0, fuera)]);
}

export const PATRON_A = "A";
export const PATRON_B = "B";

/**
 * `zona` es dónde la puso el estudiante. El trazo de retorno solo se enciende
 * si acertó Y el usuario es el que cierra el ciclo — nunca en un error.
 */
export function evaluarT1_1(usuario, zona) {
  const ok = zona === usuario.zona;
  if (ok) {
    /*
     * Sin texto de repuesto. Los ocho aciertos están escritos; si alguno
     * faltara, servir un genérico se leería igual de bien y nadie notaría que
     * ese usuario perdió su devolución.
     */
    const texto = ACIERTO_T1_1[usuario.id];
    if (!texto) throw new Error(`«${usuario.id}» no tiene devolución de acierto`);
    return {
      ok,
      texto,
      patron: null,
      /*
       * Dentro o fuera es una cosa; cerrar el ciclo es otra. Un propietario
       * acierta «dentro» y NO enciende el trazo, y esa diferencia es la mitad
       * de lo que esta actividad enseña.
       */
      enciendeTrazo: usuario.cierraElCiclo === true,
    };
  }
  const patron = usuario.zona === ZONA_DENTRO ? PATRON_A : PATRON_B;
  const e = ERROR_T1_1[patron];
  return {
    ok,
    patron,
    texto: e.texto,
    escena: e.escena,
    rotulo: e.rotulo ?? null,
    /* En un error el trazo NUNCA se enciende: no es el criterio de la zona. */
    enciendeTrazo: false,
  };
}

/* ═══════════════════ T1-2 · ¿QUÉ ENTRÓ Y QUÉ SALIÓ? ═══════════════════ */

export const CLASES_IDS = CLASES.map((c) => c.id);

/*
 * ═══════════ AL MENOS UNA DE CADA CLASE ═══════════
 *
 * Cinco clases y seis ítems: entra una de cada una y la sexta es libre. Con
 * una sola empresa agropecuaria en el banco, esa salía forzada siempre y el
 * «sorteo» no sorteaba nada en esa casilla; con dos, vuelve a ser un sorteo.
 */
export function sortearT1_2(barajar, cuantos = T1_2.porPartida) {
  const porClase = CLASES_IDS.map((c) => EMPRESAS.filter((e) => e.clase === c));
  for (const [i, lista] of porClase.entries()) {
    if (lista.length === 0) throw new Error(`no hay ninguna empresa de clase «${CLASES_IDS[i]}»`);
  }
  const elegidas = porClase.map((lista) => barajar(lista)[0]);
  const resto = EMPRESAS.filter((e) => !elegidas.includes(e));
  return barajar([...elegidas, ...barajar(resto).slice(0, cuantos - elegidas.length)]);
}

/** Qué explicación toca, mirando las DOS clases: la marcada y la real. */
export function claveDelError(marcada, real) {
  if (marcada === real) return null;
  if (marcada === "servicios") return CLAVE_MARCO_SERVICIOS;
  if (real === "servicios") return CLAVE_ERA_SERVICIOS;
  const k = MATRIZ[`${marcada}>${real}`];
  if (!k) throw new Error(`no hay explicación para «${marcada}» contra «${real}»`);
  return k;
}

export function evaluarT1_2(empresa, clase) {
  if (clase === empresa.clase) {
    const texto = ACIERTO_T1_2[empresa.id];
    if (!texto) throw new Error(`«${empresa.id}» no tiene devolución de acierto`);
    return {
      ok: true,
      texto,
      clave: null,
      /* El trazo con su etiqueta es la pista: solo aparece al acertar. */
      relacion: empresa.relacion,
    };
  }
  const clave = claveDelError(clase, empresa.clase);
  /* Los textos nuevos son fijos: ya no se rellena nada con datos del ítem. */
  return { ok: false, texto: ERROR_T1_2[clave], clave, relacion: null };
}

/** ¿Esta empresa no recibe ningún objeto? Se deduce, no se marca aparte. */
export const sinObjeto = (empresa) => empresa.entra === SIN_INSUMO;

/* ═══════════════════ T1-4 · ¿QUÉ LE PASA A CADA UNO? ═══════════════════ */

/*
 * ═══════════ EL EFECTO SE DEDUCE DEL ASIENTO ═══════════
 *
 * Nada de una tabla de «en el hecho 3 sube el activo y sube el pasivo». Esa
 * tabla es una segunda verdad: en cuanto alguien toque una cifra del asiento,
 * las dos dejan de coincidir y nada falla. Aquí el efecto sale de la partida
 * doble, que es de donde sale de verdad.
 *
 * Un activo crece por el debe; un pasivo y el patrimonio, por el haber.
 */
const CRECE_POR_EL_DEBE = { [ACTIVO]: true, [PASIVO]: false, [PATRIMONIO]: false };

export function efectoDe(transaccion) {
  const delta = { [ACTIVO]: 0, [PASIVO]: 0, [PATRIMONIO]: 0 };
  const anotar = (cuenta, valor, esDebe) => {
    const tipo = tipoDeCuenta(cuenta);
    if (!(tipo in delta)) throw new Error(`«${cuenta}» no es activo, pasivo ni patrimonio`);
    delta[tipo] += (CRECE_POR_EL_DEBE[tipo] === esDebe ? 1 : -1) * valor;
  };
  for (const [c, v] of transaccion.asiento.debe) anotar(c, v, true);
  for (const [c, v] of transaccion.asiento.haber) anotar(c, v, false);

  const signo = (n) => (n > 0 ? SUBE : n < 0 ? BAJA : IGUAL);
  return {
    [ACTIVO]: signo(delta[ACTIVO]),
    [PASIVO]: signo(delta[PASIVO]),
    [PATRIMONIO]: signo(delta[PATRIMONIO]),
    valores: delta,
  };
}

/*
 * El caso del libro al que pertenece el hecho, también deducido: si se mueve
 * el pasivo es una deuda, si se mueve el patrimonio es un aporte; y el sentido
 * lo marca el activo. De aquí salen las cuatro variantes de la explicación A y
 * los cuatro grupos del sorteo estratificado.
 */
export function casoDe(transaccion) {
  const e = efectoDe(transaccion);
  const tipo = e[PASIVO] !== IGUAL ? "deuda" : "aporte";
  const sentido = e[ACTIVO] === SUBE ? SUBE : BAJA;
  return `${tipo}-${sentido}`;
}

export const CASOS_T1_4 = [...new Set(TRANSACCIONES_CAP2.map(casoDe))];

/*
 * ═══════════ SEIS DE OCHO, CON LOS CUATRO CASOS DENTRO ═══════════
 *
 * Libre, seis de ocho puede dejar fuera entero uno de los cuatro casos —el
 * aporte que baja es un solo hecho, el 6—, y entonces esa explicación no la
 * lee nadie. Entra uno de cada caso y las dos restantes se sortean libres.
 */
export function sortearT1_4(barajar, cuantos = T1_4.porPartida) {
  const porCaso = CASOS_T1_4.map((c) => TRANSACCIONES_CAP2.filter((t) => casoDe(t) === c));
  for (const [i, lista] of porCaso.entries()) {
    if (lista.length === 0) throw new Error(`no hay ningún hecho del caso «${CASOS_T1_4[i]}»`);
  }
  const elegidas = porCaso.map((lista) => barajar(lista)[0]);
  const resto = TRANSACCIONES_CAP2.filter((t) => !elegidas.includes(t));
  return barajar([...elegidas, ...barajar(resto).slice(0, cuantos - elegidas.length)]);
}

/*
 * ═══════════ LA PRIORIDAD ES A > B, Y NO ES UN DETALLE ═══════════
 *
 * Quien marca «uno sube y el otro baja» cree que la ecuación es un balancín:
 * que si algo crece, algo tiene que menguar. Ese es el error que hay que
 * atacar, y se ataca aunque además haya movido la parte que no se mueve. Al
 * revés —dándole primero la B— se le corrige lo accesorio y se le deja intacta
 * la idea que lo tiene atascado.
 */
export function evaluarT1_4(transaccion, marcado) {
  const real = efectoDe(transaccion);
  const partes = PARTES.map((p) => p.id);
  const ok = partes.every((p) => marcado[p] === real[p]);
  if (ok) {
    const texto = ACIERTO_T1_4[transaccion.id];
    if (!texto) throw new Error(`«${transaccion.id}» no tiene devolución de acierto`);
    return { ok, texto, patron: null, real };
  }

  /* A · las dos que SÍ se mueven, marcadas en sentidos contrarios. */
  const seMueven = partes.filter((p) => real[p] !== IGUAL);
  const enContra = seMueven.some((p) => marcado[p] === SUBE)
    && seMueven.some((p) => marcado[p] === BAJA);
  if (enContra) {
    const caso = casoDe(transaccion);
    const texto = ERROR_A_T1_4[caso];
    if (!texto) throw new Error(`no hay explicación A para el caso «${caso}»`);
    return { ok, texto, patron: "A", caso, real, resaltar: seMueven };
  }

  /* B · la parte que no se mueve, movida. */
  const quieta = partes.find((p) => real[p] === IGUAL);
  if (quieta && marcado[quieta] !== IGUAL) {
    return { ok, texto: ERROR_B_T1_4, patron: "B", real, resaltar: [quieta] };
  }

  /*
   * Queda el caso de las dos que se mueven marcadas las dos al revés, o una
   * sola mal: no es el balancín ni es tocar la quieta. La A sirve igual —dice
   * qué pasó de verdad con las dos— y es la única de las dos que lo cuenta.
   */
  const caso = casoDe(transaccion);
  return { ok, texto: ERROR_A_T1_4[caso], patron: "A", caso, real, resaltar: seMueven };
}

/* ═══════════════════ T1-5 · LA ECUACIÓN EN MOVIMIENTO ═══════════════════ */

export const EN_CERO = { [ACTIVO]: 0, [PASIVO]: 0, [PATRIMONIO]: 0 };

/**
 * Los tres totales después de las primeras `cuantas` transacciones. Se suman
 * los efectos; no hay ninguna tabla de totales que pudiera discrepar.
 */
export function totalesTras(cuantas) {
  const acum = { ...EN_CERO };
  for (const t of TRANSACCIONES_CAP2.slice(0, cuantas)) {
    const e = efectoDe(t);
    for (const p of Object.keys(acum)) acum[p] += e.valores[p];
  }
  return acum;
}

/** Qué parte NO se mueve con este hecho: la que vale lo mismo que antes. */
export function parteQuieta(indice) {
  const antes = totalesTras(indice);
  const ahora = totalesTras(indice + 1);
  const quietas = Object.keys(antes).filter((p) => antes[p] === ahora[p]);
  if (quietas.length !== 1) {
    throw new Error(`el hecho ${indice + 1} deja ${quietas.length} partes quietas, no una`);
  }
  return quietas[0];
}

/* Desde el quinto hecho solo se piden las dos que cambian. */
export const enModoCorto = (indice) => indice + 1 >= DESDE_EL_CORTO;

/*
 * ═══════════ LA PRIORIDAD ES A > C > B ═══════════
 *
 * A · los dos lados no dan igual. Es el error grande: se ha roto la ecuación,
 *     y mientras eso pase no tiene sentido discutir de cuánto era cada cifra.
 * C · una parte que no se movía, movida. Rompe el rastro de lo de atrás.
 * B · los dos lados dan igual pero las cifras no son las de este hecho. Es el
 *     más fino de los tres, y por eso va el último: decirlo antes que la A
 *     sería corregir el detalle con la ecuación descuadrada.
 */
export function evaluarT1_5(indice, escrito) {
  const real = totalesTras(indice + 1);
  const antes = totalesTras(indice);
  const partes = [ACTIVO, PASIVO, PATRIMONIO];
  const ok = partes.every((p) => escrito[p] === real[p]);
  if (ok) return { ok, patron: null, texto: null, real, resaltar: [] };

  /* A · la ecuación no cuadra. Lo que falta se calcula, no se estima. */
  const hueco = escrito[ACTIVO] - (escrito[PASIVO] + escrito[PATRIMONIO]);
  if (hueco !== 0) {
    return {
      ok, patron: "A", real, hueco: Math.abs(hueco),
      texto: ERROR_T1_5.A.replace("{Z}", pesos(Math.abs(hueco))),
      resaltar: partes,
    };
  }

  /* C · la parte que no se movía, movida. */
  const quieta = parteQuieta(indice);
  if (escrito[quieta] !== antes[quieta]) {
    return { ok, patron: "C", real, texto: ERROR_T1_5.C, resaltar: [quieta] };
  }

  /* B · cuadra, respeta la quieta, y aun así no son las cifras de este hecho. */
  return {
    ok, patron: "B", real, texto: ERROR_T1_5.B,
    resaltar: partes.filter((p) => escrito[p] !== real[p]),
  };
}

/* ═══════════════════ T1-6 · ¿EN CUÁL ESTADO APARECE? ═══════════════════ */

/*
 * ═══════════ LOS CUATRO GRUPOS DEL SORTEO ═══════════
 *
 * Diez de dieciséis, y los cuatro destinos posibles tienen que salir: las tres
 * secciones del primer informe y el segundo entero. Sin estratificar, la
 * única ficha de patrimonio —Reservas— se queda fuera cuatro de cada diez
 * tandas y la explicación C sobre los dueños no la lee nadie.
 *
 * Es la misma razón que en T1-2 y T1-4: que cada camino de devolución sea
 * alcanzable. No cambia qué se pregunta, solo garantiza que se pregunte.
 */
export const destinoDe = (c) => (c.informe === PRIMERO ? `${PRIMERO}-${c.seccion}` : SEGUNDO);
export const DESTINOS_T1_6 = [...new Set(CONCEPTOS.map(destinoDe))];

export function sortearT1_6(barajar, cuantos = T1_6.porPartida) {
  const porDestino = DESTINOS_T1_6.map((d) => CONCEPTOS.filter((c) => destinoDe(c) === d));
  for (const [i, lista] of porDestino.entries()) {
    if (lista.length === 0) throw new Error(`no hay ninguna ficha para «${DESTINOS_T1_6[i]}»`);
  }
  const elegidas = porDestino.map((lista) => barajar(lista)[0]);
  const resto = CONCEPTOS.filter((c) => !elegidas.includes(c));
  return barajar([...elegidas, ...barajar(resto).slice(0, cuantos - elegidas.length)]);
}

/**
 * `marcado` es { informe, seccion }. La sección va a null cuando se marcó el
 * segundo informe, que no se subdivide.
 */
export function evaluarT1_6(concepto, marcado) {
  const informeOk = marcado.informe === concepto.informe;
  const pideSeccion = concepto.informe === PRIMERO;
  const seccionOk = pideSeccion ? marcado.seccion === concepto.seccion : true;
  const ok = informeOk && seccionOk;

  if (ok) {
    const texto = ACIERTO_T1_6[concepto.id];
    if (!texto) throw new Error(`«${concepto.id}» no tiene devolución de acierto`);
    return { ok, texto, patron: null, informeOk, seccionOk };
  }
  if (!informeOk) {
    /*
     * A y B no son la misma equivocación al revés: A dice «eso pasó durante el
     * año» y B dice «eso lo sigue teniendo mañana». Cuál toca depende de dónde
     * iba DE VERDAD, no de dónde lo puso.
     */
    const patron = concepto.informe === SEGUNDO ? "A" : "B";
    return { ok, texto: ERROR_T1_6[patron], patron, informeOk, seccionOk: false };
  }
  return { ok, texto: ERROR_T1_6.C, patron: "C", informeOk, seccionOk: false };
}

/*
 * El informe pesa 60 y la sección 40. Las fichas del segundo informe no tienen
 * sección que acertar, así que valen entero al acertar el informe: dejarlas en
 * 60 sería descontarles una pregunta que no se les hizo.
 */
export function valorDeItem(concepto, r) {
  if (!r.informeOk) return 0;
  if (concepto.informe === SEGUNDO) return 1;
  return PESO_INFORME + (r.seccionOk ? PESO_SECCION : 0);
}

export function puntuarT1_6(respuestas, cuantas) {
  if (!cuantas) return 0;
  return (respuestas.reduce((s, x) => s + x.valor, 0) / cuantas) * 100;
}

/* ═══════════════════ T1-7 · LA ARTICULACIÓN ═══════════════════ */

export const lineaPorId = (id) => LINEAS.find((l) => l.id === id) ?? null;
export const lineasDe = (informe) => LINEAS.filter((l) => l.informe === informe);

/* El informe al que llegan todas y del que no sale ninguna, deducido. */
export const informeQueRecibe = () => {
  const llegan = new Set(FLECHAS.map((f) => lineaPorId(f.hasta).informe));
  const salen = new Set(FLECHAS.map((f) => lineaPorId(f.desde).informe));
  const soloRecibe = [...llegan].filter((i) => !salen.has(i));
  if (soloRecibe.length !== 1) {
    throw new Error(`hay ${soloRecibe.length} informes que solo reciben, y tiene que haber uno`);
  }
  return soloRecibe[0];
};

export const flechaEntre = (desde, hasta) => FLECHAS.find((f) => f.desde === desde && f.hasta === hasta) ?? null;

/*
 * La devolución de una flecha, en su propia función y no en línea dentro de
 * `evaluarT1_7`. Así se puede pedir la de una flecha que no existe y comprobar
 * que se cae en vez de servir un genérico — dentro de `evaluarT1_7` no se
 * podía, porque la flecha la resuelve él mismo y nunca llega una inventada.
 * Sobrevivió un mutante por eso.
 */
export function aciertoDeFlecha(id) {
  const texto = ACIERTO_T1_7[id];
  if (!texto) throw new Error(`«${id}» no tiene devolución de acierto`);
  return texto;
}

/*
 * ═══════════ LA PRIORIDAD ES C > B > A ═══════════
 *
 * C · unió los dos informes que no se hablan entre ellos. Es el error de
 *     concepto: no ha visto que todo converge en el tercero.
 * B · la pareja es buena y la dibujó al revés. Ya vio la relación; le falta el
 *     sentido.
 * A · esas dos no se pasan nada. Es el más común y el que menos dice, y por
 *     eso va el último: si el estudiante cometió el error de concepto, decirle
 *     «esas dos no se pasan nada» es verdad y no le sirve de nada.
 */
export function evaluarT1_7(desdeId, hastaId) {
  const desde = lineaPorId(desdeId);
  const hasta = lineaPorId(hastaId);
  if (!desde || !hasta) throw new Error("una de las dos líneas no existe");

  const buena = flechaEntre(desdeId, hastaId);
  if (buena) return { ok: true, flecha: buena, texto: aciertoDeFlecha(buena.id), patron: null };

  const receptor = informeQueRecibe();
  /* C · ninguna de las dos está en el informe que recibe. */
  if (desde.informe !== receptor && hasta.informe !== receptor) {
    return { ok: false, flecha: null, texto: ERROR_T1_7.C, patron: "C" };
  }
  /* B · la misma pareja existe, pero al revés. */
  const alReves = flechaEntre(hastaId, desdeId);
  if (alReves) {
    return { ok: false, flecha: null, texto: ERROR_T1_7.B, patron: "B", deberiaSer: alReves };
  }
  return { ok: false, flecha: null, texto: ERROR_T1_7.A, patron: "A" };
}

/* ═══════════════════ PUNTAJE, IGUAL EN LAS DOS ═══════════════════ */

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

export const pesoDeCadaItem = (cuantas) => (cuantas ? 100 / cuantas : 0);

/* Para el panel docente. */
export const preguntaDeUsuario = (id) => USUARIOS_T1_1.find((u) => u.id === id)?.pregunta ?? null;
export const empresaDeItem = (id) => {
  const e = EMPRESAS.find((x) => x.id === id);
  return e ? `${e.empresa}: ${e.entra} → ${e.sale}` : null;
};
