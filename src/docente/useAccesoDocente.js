import { useEffect, useState } from "react";
import { supabase } from "../lib/supabase.js";
import { accesoDocente } from "./datos.js";

/*
 * ═══════════════════════════════════════════════════════════════════════════
 * ¿ES DOCENTE, Y DE QUÉ MATERIAS? — con la respuesta guardada por sesión.
 *
 * La pregunta la hacen el atajo de la cabecera —en todas las páginas—, el
 * enlace «ver el rendimiento del grupo» de cada actividad, el perfil y el
 * propio panel. Todos pasan por aquí y comparten UNA respuesta: una llamada
 * por carga de página, no una por componente.
 *
 * ═══════════ SE VUELVE A PREGUNTAR SOLO SI CAMBIA LA CUENTA ═══════════
 *
 * Una caché con caducidad tendría que elegir un número, y cualquier número
 * estaría mal: la respuesta no cambia sola, cambia cuando alguien entra o sale.
 *
 * Antes se tiraba la caché con cualquier evento de Supabase salvo la
 * renovación del token, y eso preguntaba de más sin que se viera: Supabase
 * emite INITIAL_SESSION a cada suscriptor nuevo y SIGNED_IN al recuperar la
 * sesión guardada —al cargar y cada vez que la pestaña vuelve a primer plano
 * (GoTrueClient, _emitInitialSession y _recoverAndRefresh)—. Cada uno lanzaba
 * otra es_docente() con la misma cuenta y la misma respuesta. Ahora cuenta el
 * usuario del evento, no su nombre: si es el mismo de la respuesta guardada,
 * no ha cambiado nada.
 *
 * ═══════════ EL DEFECTO SIGUE SIENDO "NO ES DOCENTE" ═══════════
 *
 * Todo lo que decide accesoDocente() vale igual aquí: mientras no se sabe, el
 * estado es el cerrado, y una llamada que falle deja el cerrado. Un enlace que
 * no aparece no le rompe el día a nadie; uno que aparece de más enseña que
 * existe una pantalla que no debería.
 *
 * Mientras no se sabe, además, lleva `pendiente: true`. Quien solo mira
 * `esDocente` no nota la diferencia; el atajo de la cabecera la necesita para
 * no aparecer tarde —ver recordadoComoDocente, abajo—.
 * ═══════════════════════════════════════════════════════════════════════════
 */

const CERRADO = { esDocente: false, materias: [] };
const PENDIENTE = { ...CERRADO, pendiente: true };

/* La respuesta viva de esta sesión. null = todavía no se ha preguntado. */
let cache = null;
let enVuelo = null;
/*
 * De quién es la respuesta guardada, y quién dijo Supabase por última vez que
 * está dentro. undefined = aún no se sabe; null = nadie, sesión cerrada.
 */
let usuarioDeCache;
let usuarioAnunciado;
/* Quién quiere enterarse cuando la respuesta cambie. */
const suscriptores = new Set();

function avisar(valor) {
  for (const fn of suscriptores) fn(valor);
}

/**
 * ¿Este evento de Supabase obliga a volver a preguntar? Solo si cambia la
 * cuenta respecto a la de la respuesta guardada. Pura, para poder probarla.
 */
export function hayQueVolverAPreguntar(evento, usuarioDeLaRespuesta, usuarioDelEvento) {
  /* Renovar el token o editar el usuario no cambia quién eres. */
  if (evento === "TOKEN_REFRESHED" || evento === "USER_UPDATED") return false;
  /* Nadie ha preguntado todavía: la primera pregunta ya leerá la cuenta buena. */
  if (usuarioDeLaRespuesta === undefined) return false;
  return usuarioDeLaRespuesta !== usuarioDelEvento;
}

async function usuarioDeLaSesion() {
  if (!supabase) return null;
  try {
    const { data } = await supabase.auth.getSession();
    return data?.session?.user?.id ?? null;
  } catch {
    return null;
  }
}

function preguntar(reintento = false) {
  if (cache) return Promise.resolve(cache);
  if (enVuelo) return enVuelo;
  enVuelo = (async () => {
    const usuario = await usuarioDeLaSesion();
    const a = await accesoDocente().catch(() => CERRADO);
    enVuelo = null;
    /*
     * La cuenta cambió mientras se preguntaba: esta respuesta es de la
     * anterior. Se pregunta una vez más, y solo una, para no quedar en bucle
     * si la sesión y los eventos no se pusieran nunca de acuerdo.
     */
    if (!reintento && usuarioAnunciado !== undefined && usuarioAnunciado !== usuario) {
      return preguntar(true);
    }
    cache = a;
    usuarioDeCache = usuario;
    recordar(usuario, a);
    avisar(a);
    return a;
  })();
  return enVuelo;
}

/* Un solo oyente para todo el módulo, montado la primera vez que alguien pregunta. */
let escuchando = false;
function escuchar() {
  if (escuchando || !supabase) return;
  escuchando = true;
  supabase.auth.onAuthStateChange((evento, sesion) => {
    if (evento === "TOKEN_REFRESHED" || evento === "USER_UPDATED") return;
    const usuario = sesion?.user?.id ?? null;
    usuarioAnunciado = usuario;
    /* Si hay una pregunta en curso, ella misma lo comprueba al terminar. */
    if (enVuelo || !hayQueVolverAPreguntar(evento, usuarioDeCache, usuario)) return;
    cache = null;
    avisar(PENDIENTE);
    preguntar();
  });
}

/** El acceso docente de la sesión actual. Mientras no se sabe, va cerrado y `pendiente`. */
export function useAccesoDocente() {
  const [acceso, setAcceso] = useState(cache ?? PENDIENTE);

  useEffect(() => {
    let vivo = true;
    escuchar();
    const alCambiar = (valor) => { if (vivo) setAcceso(valor); };
    suscriptores.add(alCambiar);
    preguntar().then((a) => { if (vivo) setAcceso(a); });
    return () => {
      vivo = false;
      suscriptores.delete(alCambiar);
    };
  }, []);

  return acceso;
}

/*
 * ═══════════ LO ÚLTIMO QUE DIJO EL SERVIDOR, PARA ESTA CUENTA ═══════════
 *
 * El atajo de la cabecera está en todas las páginas, junto a la pastilla de la
 * cuenta. Si esperara a la respuesta, en cada carga aparecería un momento
 * después que ella, y un botón que llega tarde se lee como una página que se
 * ha roto.
 *
 * Así que se guarda en el navegador el id de la última cuenta que el servidor
 * CONFIRMÓ como docente, y el atajo se pinta a la vez que la cuenta si es esa.
 * Sigue sin ser seguridad —cada función del panel comprueba docente y materia
 * en el servidor—: es solo no hacer esperar a quien ya se sabe que lo es. Si
 * se le retira el acceso, el atajo dura lo que tarda en llegar la respuesta, y
 * se quita.
 *
 * Solo se guarda un «sí» confirmado, y solo lo borra un «no» de esa misma
 * cuenta. Cerrar sesión no lo borra, a propósito: al volver a entrar, el atajo
 * ya está.
 */
const CLAVE_RECORDADO = "fae:docente";

function recordar(usuario, a) {
  if (!usuario) return;
  try {
    if (a.esDocente) localStorage.setItem(CLAVE_RECORDADO, usuario);
    else if (localStorage.getItem(CLAVE_RECORDADO) === usuario) localStorage.removeItem(CLAVE_RECORDADO);
  } catch {
    /* Sin almacenamiento solo se pierde el adelanto: el atajo llega con la respuesta. */
  }
}

/** ¿El servidor confirmó ya a esta cuenta como docente en este navegador? */
export function recordadoComoDocente(usuario) {
  if (!usuario) return false;
  try {
    return localStorage.getItem(CLAVE_RECORDADO) === usuario;
  } catch {
    return false;
  }
}

/** Solo para las pruebas: olvidar lo aprendido. */
export function _olvidarAcceso() {
  cache = null;
  enVuelo = null;
  usuarioDeCache = undefined;
  usuarioAnunciado = undefined;
}
