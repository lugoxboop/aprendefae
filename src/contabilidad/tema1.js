import {
  USUARIOS_T1_1, ZONA_DENTRO, ZONA_FUERA, ACIERTO_T1_1, ERROR_T1_1,
  EMPRESAS, CLASES, MATRIZ, ERROR_T1_2, ACIERTO_T1_2,
  CLAVE_MARCO_SERVICIOS, CLAVE_ERA_SERVICIOS, SIN_INSUMO, T1_1, T1_2,
  TRANSACCIONES_CAP2, T1_4, PARTES, SUBE, BAJA, IGUAL,
  ERROR_A_T1_4, ERROR_B_T1_4, ACIERTO_T1_4,
  T1_5, ERROR_T1_5, DESDE_EL_CORTO,
  T1_6, CONCEPTOS, PRIMERO, SEGUNDO, ERROR_T1_6, ACIERTO_T1_6, PESO_INFORME, PESO_SECCION,
  ERROR_T1_7, BANCO_T1_7,
  T1_8, PUNTOS_T1_8, SITUACIONES_T1_8, ACIERTO_T1_8, ERROR_T1_8, PREDICCION_T1_8,
  CONTADOR_T1_8, CONTADOR_UNO_T1_8,
  SEGUNDA_T1_1, SEGUNDA_T1_2, SEGUNDA_T1_4, SEGUNDA_T1_5,
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
    /* El ejemplo de «Así se juega» no es del banco: trae su propia devolución. */
    const texto = usuario.acierto ?? ACIERTO_T1_1[usuario.id];
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
    /* El ejemplo de «Así se juega» no es del banco: trae su propia devolución. */
    const texto = empresa.acierto ?? ACIERTO_T1_2[empresa.id];
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
    /* Un hecho de fuera del banco —el ejemplo de «Así se juega»— trae el suyo. */
    const texto = transaccion.acierto ?? ACIERTO_T1_4[transaccion.id];
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

/*
 * Los totales después de un hecho suelto, partiendo de donde se diga. Lo usa
 * el ejemplo de «Así se juega», que no está en el recorrido de ocho: parte de
 * su propio estado y no de la suma de los hechos del banco.
 */
export function totalesDesde(antes, hecho) {
  const e = efectoDe(hecho);
  return Object.fromEntries(Object.keys(antes).map((p) => [p, antes[p] + e.valores[p]]));
}

function quietaEntre(antes, ahora, cual) {
  const quietas = Object.keys(antes).filter((p) => antes[p] === ahora[p]);
  if (quietas.length !== 1) {
    throw new Error(`el hecho ${cual} deja ${quietas.length} partes quietas, no una`);
  }
  return quietas[0];
}

/** Qué parte NO se mueve con este hecho: la que vale lo mismo que antes. */
export function parteQuieta(indice) {
  return quietaEntre(totalesTras(indice), totalesTras(indice + 1), indice + 1);
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
export function evaluarT1_5(indice, escrito, ejemplo = null) {
  /* `ejemplo` ({ hecho, antes }) solo lo pasa la demo de «Así se juega». */
  const antes = ejemplo ? ejemplo.antes : totalesTras(indice);
  const real = ejemplo ? totalesDesde(ejemplo.antes, ejemplo.hecho) : totalesTras(indice + 1);
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
  const quieta = quietaEntre(antes, real, ejemplo ? ejemplo.hecho.id : indice + 1);
  if (escrito[quieta] !== antes[quieta]) {
    return { ok, patron: "C", real, texto: ERROR_T1_5.C, resaltar: [quieta] };
  }

  /* B · cuadra, respeta la quieta, y aun así no son las cifras de este hecho. */
  return {
    ok, patron: "B", real, texto: ERROR_T1_5.B,
    resaltar: partes.filter((p) => escrito[p] !== real[p]),
  };
}

/*
 * ═══════════ T1-5 CON LAS DOS TORRES (P2 de Mai) ═══════════
 *
 * Dos decisiones por hecho, en vez de tres cifras: cuál parte no se mueve, y
 * con cuánto queda cada una de las otras dos. La segunda se pide SIEMPRE sobre
 * las dos que de verdad se mueven, aunque la primera haya fallado: así cada
 * una se califica por su lado y el registro guarda las dos.
 */

/* El total más alto del recorrido (tras el hecho 7). La escala es fija para los 8: este valor mide 150 px. */
export const TOPE_TORRES_T1_5 = 475000;
export const ALTO_TORRE_T1_5 = 150;
export const altoDeTorre = (valor) => (Math.max(0, valor) * ALTO_TORRE_T1_5) / TOPE_TORRES_T1_5;

/** Qué hace un hecho, partiendo de `antes`: cuál se queda, cuáles se mueven, cuánto y hacia dónde. */
export function movimientoT1_5(antes, hecho) {
  const despues = totalesDesde(antes, hecho);
  const quieta = quietaEntre(antes, despues, hecho.id);
  const mueven = [ACTIVO, PASIVO, PATRIMONIO].filter((p) => p !== quieta);
  const delta = (p) => despues[p] - antes[p];
  const monto = Math.abs(delta(mueven[0]));
  if (Math.abs(delta(mueven[1])) !== monto) throw new Error(`el hecho ${hecho.id} no mueve sus dos partes por el mismo valor`);
  return { antes, despues, quieta, mueven, monto, signos: Object.fromEntries(mueven.map((p) => [p, Math.sign(delta(p))])) };
}

/*
 * ═══════════ LA DECISIÓN 2 ES EL TOTAL NUEVO (auditoría de Shoko, 23-oct) ═══════════
 *
 * Con «+ monto» y «− monto» el estudiante decidía solo el sentido: era la
 * pregunta de t1-4 otra vez (C6). Ahora elige con cuánto queda cada parte que
 * se mueve, entre tres: el total anterior más el monto, el total anterior
 * menos el monto, y el monto solo (confundir el movimiento con el saldo).
 *
 * Cuando dos de las tres dan la misma cifra (total anterior en cero: el monto
 * solo ES el total nuevo) se deja una sola. Van de menor a mayor, para que la
 * posición no delate la correcta. Las negativas (hecho 3, el pasivo: 25.000 −
 * 50.000) se dejan: es la cifra que da restar donde había que sumar.
 */
export function opcionesTotalT1_5(mov, parte) {
  const valores = [mov.antes[parte] + mov.monto, mov.antes[parte] - mov.monto, mov.monto];
  return [...new Set(valores)].sort((a, b) => a - b);
}

/*
 * Califica las dos decisiones. `totales` trae la cifra elegida para cada
 * parte que de verdad se mueve. La devolución sigue la ficha (§3): si falló
 * la primera, C; si no, con la segunda mal, A cuando los lados no darían
 * igual ({Z} es la diferencia) y B cuando darían igual con otras cifras.
 *
 * `elegido` son los totales que habría dado lo que eligió el estudiante: de
 * ahí sale el fantasma, solo en la torre que difiere de la correcta.
 */
export function evaluarTorresT1_5(mov, quietaElegida, totales) {
  const quietaOk = quietaElegida === mov.quieta;
  const totalesOk = Object.fromEntries(mov.mueven.map((p) => [p, totales[p] === mov.despues[p]]));
  const direccionOk = mov.mueven.every((p) => totalesOk[p]);
  const elegido = { ...mov.antes };
  for (const p of mov.mueven) elegido[p] = totales[p] ?? mov.antes[p];
  const fantasma = {
    izquierda: elegido[ACTIVO] !== mov.despues[ACTIVO],
    derecha: elegido[PASIVO] !== mov.despues[PASIVO] || elegido[PATRIMONIO] !== mov.despues[PATRIMONIO],
  };
  const base = { ok: quietaOk && direccionOk, quietaOk, direccionOk, totalesOk, elegido, real: mov.despues, fantasma };
  if (!quietaOk) return { ...base, patron: "C", texto: ERROR_T1_5.C };
  if (!direccionOk) {
    const hueco = Math.abs(elegido[ACTIVO] - (elegido[PASIVO] + elegido[PATRIMONIO]));
    if (hueco) return { ...base, patron: "A", hueco, texto: ERROR_T1_5.A.replace("{Z}", pesos(hueco)) };
    return { ...base, patron: "B", texto: ERROR_T1_5.B };
  }
  return { ...base, patron: null, texto: null };
}

/* El emoji de veredicto con que abren los textos publicados (❌, ✅) no se pinta: el veredicto lo dicen la marca y la palabra. */
export const sinEmoji = (texto) => (texto ?? "").replace(/^[\u2705\u274C\u2714\u2716]\uFE0F?\s*/u, "");

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
    /* El ejemplo de «Así se juega» no es del banco: trae su propia devolución. */
    const texto = concepto.acierto ?? ACIERTO_T1_6[concepto.id];
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

/*
 * Todas reciben el banco al final, con el de verdad por defecto. Solo la demo
 * de «Así se juega» pasa otro: el juego no cambia en nada.
 */
export const lineaPorId = (id, banco = BANCO_T1_7) => banco.lineas.find((l) => l.id === id) ?? null;
export const lineasDe = (informe, banco = BANCO_T1_7) => banco.lineas.filter((l) => l.informe === informe);

/* El informe al que llegan todas y del que no sale ninguna, deducido. */
export const informeQueRecibe = (banco = BANCO_T1_7) => {
  const llegan = new Set(banco.flechas.map((f) => lineaPorId(f.hasta, banco).informe));
  const salen = new Set(banco.flechas.map((f) => lineaPorId(f.desde, banco).informe));
  const soloRecibe = [...llegan].filter((i) => !salen.has(i));
  if (soloRecibe.length !== 1) {
    throw new Error(`hay ${soloRecibe.length} informes que solo reciben, y tiene que haber uno`);
  }
  return soloRecibe[0];
};

export const flechaEntre = (desde, hasta, banco = BANCO_T1_7) =>
  banco.flechas.find((f) => f.desde === desde && f.hasta === hasta) ?? null;

/*
 * La devolución de una flecha, en su propia función y no en línea dentro de
 * `evaluarT1_7`. Así se puede pedir la de una flecha que no existe y comprobar
 * que se cae en vez de servir un genérico — dentro de `evaluarT1_7` no se
 * podía, porque la flecha la resuelve él mismo y nunca llega una inventada.
 * Sobrevivió un mutante por eso.
 */
export function aciertoDeFlecha(id, banco = BANCO_T1_7) {
  const texto = banco.aciertos[id];
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
export function evaluarT1_7(desdeId, hastaId, banco = BANCO_T1_7) {
  const desde = lineaPorId(desdeId, banco);
  const hasta = lineaPorId(hastaId, banco);
  if (!desde || !hasta) throw new Error("una de las dos líneas no existe");

  const buena = flechaEntre(desdeId, hastaId, banco);
  if (buena) return { ok: true, flecha: buena, texto: aciertoDeFlecha(buena.id, banco), patron: null };

  const receptor = informeQueRecibe(banco);
  /* C · ninguna de las dos está en el informe que recibe. */
  if (desde.informe !== receptor && hasta.informe !== receptor) {
    return { ok: false, flecha: null, texto: ERROR_T1_7.C, patron: "C" };
  }
  /* B · la misma pareja existe, pero al revés. */
  const alReves = flechaEntre(hastaId, desdeId, banco);
  if (alReves) {
    return { ok: false, flecha: null, texto: ERROR_T1_7.B, patron: "B", deberiaSer: alReves };
  }
  return { ok: false, flecha: null, texto: ERROR_T1_7.A, patron: "A" };
}

/* ═══════════════════ T1-8 · ¿DÓNDE SE ROMPIÓ? ═══════════════════ */

export const TOTAL_PUNTOS = PUNTOS_T1_8.length;
export const PRIMER_PUNTO = PUNTOS_T1_8[0].n;

/*
 * ═══════════ EL PUNTO 1 NO SE PUEDE TOCAR ═══════════
 *
 * Es la actividad de la empresa: o la empresa hace algo, o no hay ciclo del
 * que hablar. Nunca es la respuesta, así que ofrecerlo sería una trampa sin
 * valor. Los tocables se deducen del anillo, no se enumeran.
 */
export const TOCABLES_T1_8 = PUNTOS_T1_8.filter((p) => p.n !== PRIMER_PUNTO).map((p) => p.n);
export const esTocable = (n) => TOCABLES_T1_8.includes(n);

export const situacionPorId = (id) => SITUACIONES_T1_8.find((s) => s.id === id) ?? null;
export const puntoPorN = (n) => PUNTOS_T1_8.find((p) => p.n === n) ?? null;

/*
 * ═══════════ EL PUNTO ROTO TAMBIÉN SE APAGA ═══════════
 *
 * Regla de Levi y Mateo: el punto donde se rompe el ciclo cuenta como
 * apagado, igual que los de después. Si no queda papel, el papel no pasó; el
 * hecho no llegó ahí. Así ya no hay ninguna situación con cero apagados: la
 * del punto 5 apaga el 5 y, además, la flecha de vuelta.
 *
 *   se rompe en 2 → 2, 3, 4, 5      se rompe en 4 → 4, 5
 *   se rompe en 3 → 3, 4, 5         se rompe en 5 → 5 (+ la flecha)
 *
 * A cuántos puntos no llega el hecho, DEDUCIDO: el roto y los que siguen.
 */
export const noAlcanzados = (rompe) => TOTAL_PUNTOS - rompe + 1;

/** Los puntos que se apagan, en el orden en que se apagan: el roto primero. */
export const apagadosDe = (rompe) => PUNTOS_T1_8.filter((p) => p.n >= rompe).map((p) => p.n);

/** Solo en el punto 5 se apaga la flecha de vuelta, y es lo único que se apaga. */
export const apagaLaFlecha = (rompe) => rompe === TOTAL_PUNTOS;

/*
 * El texto del contador para `n` puntos apagados. El número es lo único que
 * cambia; con uno solo, la frase va en singular entera («Se apagó 1 punto.»).
 * Con la regla del punto roto apagado nunca hay cero: pedirlo es un error.
 */
export function textoDelContador(n) {
  if (!(n >= 1)) throw new Error(`no hay contador para ${n} puntos apagados`);
  return n === 1 ? CONTADOR_UNO_T1_8 : CONTADOR_T1_8.replace("[N]", String(n));
}

/*
 * ═══════════ UNA DE CADA PUNTO, Y UNA AL AZAR ═══════════
 *
 * Cinco de ocho, libre, puede dejar fuera entero el punto 5 —y con él la
 * flecha apagada, que es la lección central—. Entra una situación de cada
 * punto tocable y la quinta sale del resto.
 */
export function sortearT1_8(barajar, cuantos = T1_8.porPartida) {
  const porPunto = TOCABLES_T1_8.map((n) => SITUACIONES_T1_8.filter((s) => s.rompe === n));
  for (const [i, lista] of porPunto.entries()) {
    if (lista.length === 0) throw new Error(`no hay ninguna situación que se rompa en el punto ${TOCABLES_T1_8[i]}`);
  }
  const elegidas = porPunto.map((lista) => barajar(lista)[0]);
  const resto = SITUACIONES_T1_8.filter((s) => !elegidas.includes(s));
  return barajar([...elegidas, ...barajar(resto).slice(0, cuantos - elegidas.length)]);
}

/*
 * ═══════════ LA REGLA ES DETERMINÍSTICA ═══════════
 *
 * El número tocado contra el correcto. Antes es A, después es B. Nada más.
 *
 * Y en un error NO corre la cascada ni se apaga nada: una cascada desde el
 * punto equivocado enseñaría algo falso. Lo único que cambia en el anillo es
 * el punto tocado —parpadea; en la B, además, se atenúa con su rótulo, que es
 * verdad: ese hecho no llegó ahí—.
 */
export function evaluarT1_8(situacion, tocado) {
  if (!esTocable(tocado)) throw new Error(`el punto ${tocado} no se puede tocar`);
  const rompe = situacion.rompe;
  if (tocado === rompe) {
    const texto = ACIERTO_T1_8[rompe];
    if (!texto) throw new Error(`el punto ${rompe} no tiene devolución de acierto`);
    return {
      ok: true, patron: null, texto, rompe,
      noAlcanzados: noAlcanzados(rompe),
      apagados: apagadosDe(rompe),
      flechaApagada: apagaLaFlecha(rompe),
    };
  }
  const patron = tocado < rompe ? "A" : "B";
  return {
    ok: false, patron, texto: ERROR_T1_8[patron], tocado,
    /* Solo la B marca el punto: ese hecho no llegó ahí. La A no revela nada. */
    atenuado: patron === "B" ? tocado : null,
  };
}

/** La predicción no puntúa: solo dice si coincidió, para elegir el cierre. */
export function evaluarPrediccion(situacion, elegido) {
  if (!PREDICCION_T1_8.opciones.includes(elegido)) throw new Error(`«${elegido}» no es una opción de la predicción`);
  const acerto = elegido === noAlcanzados(situacion.rompe);
  return { acerto, texto: acerto ? PREDICCION_T1_8.acerto : PREDICCION_T1_8.fallo };
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

/*
 * ═══════════════════ PARA EL PANEL DOCENTE ═══════════════════
 *
 * Qué pregunta le tocó a cada ítem, dicho en palabras. Sin esto el profesor ve
 * el id crudo —«cal-4», «c6-11»— y no puede leer en qué se equivocó su curso,
 * que es para lo único que sirve el panel. Hay una prueba que exige una regla
 * por cada actividad publicada, y es la que avisó cuando estas cuatro salieron
 * del cajón.
 */
export const preguntaDeUsuario = (id) => USUARIOS_T1_1.find((u) => u.id === id)?.pregunta ?? null;
export const empresaDeItem = (id) => {
  const e = EMPRESAS.find((x) => x.id === id);
  return e ? `${e.empresa}: ${e.entra} → ${e.sale}` : null;
};

/* T1-4 y T1-5 comparten banco: el ítem es la transacción, y se lee tal cual. */
/*
 * T1-5 con las torres guarda dos ítems por hecho, «cal-2:quieta» y
 * «cal-2:direccion»; los registros viejos traen el id solo. Los dos se leen
 * como el hecho.
 */
export const hechoDeItem = (id) => TRANSACCIONES_CAP2.find((t) => t.id === String(id).split(":")[0])?.texto ?? null;

/* T1-8: la situación que había que leer. */
export const situacionDeItem = (id) => situacionPorId(id)?.texto ?? null;

/* T1-6: la ficha que había que colocar. */
export const conceptoDeItem = (id) => CONCEPTOS.find((c) => c.id === id)?.nombre ?? null;

/*
 * T1-7: el ítem es la pareja que dibujó, «desde>hasta», así que la etiqueta
 * tiene que nombrar las DOS líneas. Con una sola, dos errores distintos —unir
 * A con B y unir A con C— se leerían igual en el panel.
 */
export const flechaDeItem = (id) => {
  const [desde, hasta] = String(id).split(">");
  const a = lineaPorId(desde);
  const b = lineaPorId(hasta);
  return a && b ? `${a.nombre} → ${b.nombre}` : null;
};

/*
 * ═══════════════════════════════════════════════════════════════════════════
 * D4 · LA SEGUNDA DECISIÓN DE LOS CUATRO HACER — la lógica.
 *
 * Qué es la correcta, qué dice el mensaje de cada mala y en qué estado deja la
 * figura cada opción. Todo se DEDUCE del caso (del usuario, de la empresa, del
 * asiento), nunca de una tabla paralela que pudiera desincronizarse del banco.
 *
 * Nada de aquí entra en `puntuar`: la segunda decisión no cambia el porcentaje
 * de nadie. Está arriba, en el comentario de los datos, el porqué.
 * ═══════════════════════════════════════════════════════════════════════════
 */

/* ───────── T1-1 ───────── */

/** Lo que alcanza a ver depende de si pertenece a la empresa, y de nada más. */
export const correctaSegundaT1_1 = (usuario) => (usuario.zona === ZONA_DENTRO ? "todo" : "informe");

export function opcionesSegundaT1_1(usuario) {
  const correcta = correctaSegundaT1_1(usuario);
  return SEGUNDA_T1_1.opciones.map((o) => ({ ...o, msg: o.id === correcta ? null : o.msg }));
}

export const porqueSegundaT1_1 = (usuario) => SEGUNDA_T1_1.porque[correctaSegundaT1_1(usuario)];

/* ───────── T1-2 ───────── */

/**
 * Si no entra ninguna cosa, no hay nada que doblar; si entra algo, hay que
 * doblarlo. El criterio es el mismo `sinObjeto` que pinta el recuadro vacío,
 * así que no puede decir una cosa el recuadro y otra la devolución.
 */
export const correctaSegundaT1_2 = (empresa) => (sinObjeto(empresa) ? "sin-insumo" : "doblar");

export function opcionesSegundaT1_2(empresa) {
  const correcta = correctaSegundaT1_2(empresa);
  return SEGUNDA_T1_2.opciones.map((o) => ({ ...o, msg: o.id === correcta ? null : o.msg }));
}

export const porqueSegundaT1_2 = (empresa) => SEGUNDA_T1_2.porque[correctaSegundaT1_2(empresa)];

/* ───────── T1-4 ───────── */

/* La igualdad aguanta con cualquier hecho: eso es lo que la actividad enseña. */
export const CORRECTA_SEGUNDA_T1_4 = "sigue";

export const opcionesSegundaT1_4 = () => SEGUNDA_T1_4.opciones;

export function porqueSegundaT1_4(transaccion) {
  const e = efectoDe(transaccion);
  return SEGUNDA_T1_4.porque[e[ACTIVO] === SUBE ? "sube" : "baja"];
}

/**
 * Las tres barras repintadas con lo que cada opción AFIRMA. La correcta pinta
 * lo que de verdad pasó y enciende las tres partes —los dos lados a la vez—;
 * el balancín pone la otra parte en contra del activo; «un lado solo» la deja
 * quieta. Los tres retratos se diferencian pareja por pareja: por los altos de
 * las barras y por cuáles quedan resaltadas.
 */
export function escenaSegundaT1_4(transaccion, opcion) {
  const real = efectoDe(transaccion);
  const partes = PARTES.map((p) => p.id);
  const seMueven = partes.filter((p) => real[p] !== IGUAL);
  const otra = seMueven.find((p) => p !== ACTIVO);
  const contrario = (x) => (x === SUBE ? BAJA : SUBE);

  if (opcion === CORRECTA_SEGUNDA_T1_4) {
    return { barras: { ...real, valores: undefined }, resaltar: partes };
  }
  if (opcion === "balancin") {
    return {
      barras: { ...real, valores: undefined, [otra]: contrario(real[otra]) },
      resaltar: seMueven,
    };
  }
  /* «un-lado»: el otro lado ni se entera. */
  return { barras: { ...real, valores: undefined, [otra]: IGUAL }, resaltar: [ACTIVO] };
}

/* ───────── T1-5 ───────── */

/** La parte quieta es la correcta, y ya la sabe deducir `parteQuieta`. */
export const correctaSegundaT1_5 = (indice) => parteQuieta(indice);

/**
 * Una opción por parte. El mensaje de cada mala nombra la confusión de ESA
 * parte —el activo es lo que entra y sale, el pasivo es la deuda, el
 * patrimonio es lo de los dueños— y se rellena con el sentido real del hecho.
 */
export function opcionesSegundaT1_5(indice, hecho = null) {
  const t = hecho ?? TRANSACCIONES_CAP2[indice];
  const real = efectoDe(t);
  const correcta = indice === null ? null : correctaSegundaT1_5(indice);
  return PARTES.map((p) => {
    if (p.id === correcta) return { id: p.id, texto: p.idea, msg: null };
    const plantilla = SEGUNDA_T1_5.msg[p.id];
    const sentido = SEGUNDA_T1_5.sentido[p.id]?.[real[p.id] === SUBE ? "sube" : "baja"];
    return { id: p.id, texto: p.idea, msg: sentido ? plantilla.replace("[SENTIDO]", sentido) : plantilla };
  });
}

export const escenaSegundaT1_5 = (parte) => ({ quieta: parte });
