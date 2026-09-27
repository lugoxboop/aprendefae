import {
  USUARIOS_T1_1, ZONA_DENTRO, ZONA_FUERA, ACIERTO_T1_1, ACIERTO_FUERA_GENERAL, ERROR_T1_1,
  EMPRESAS, CLASES, MATRIZ, ERROR_T1_2, ACIERTO_T1_2, ACIERTO_POR_CLASE,
  CLAVE_MARCO_SERVICIOS, CLAVE_ERA_SERVICIOS, SIN_INSUMO, T1_1, T1_2,
} from "../data/contabilidadTema1.js";

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
    return {
      ok,
      texto: ACIERTO_T1_1[usuario.id] ?? ACIERTO_FUERA_GENERAL,
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
    return {
      ok: true,
      texto: ACIERTO_T1_2[empresa.id] ?? ACIERTO_POR_CLASE[empresa.clase],
      clave: null,
      /* El trazo con su etiqueta es la pista: solo aparece al acertar. */
      relacion: empresa.relacion,
    };
  }
  const clave = claveDelError(clase, empresa.clase);
  const texto = ERROR_T1_2[clave]
    /* «lo que salió NO es lo mismo» o «SÍ es lo mismo», según el caso. */
    .replace("{relacion}", empresa.relacion === "Lo mismo" ? "sí es" : "no es")
    .replace("{entra}", `«${empresa.entra}»`);
  return { ok: false, texto, clave, relacion: null };
}

/** ¿Esta empresa no recibe ningún objeto? Se deduce, no se marca aparte. */
export const sinObjeto = (empresa) => empresa.entra === SIN_INSUMO;

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
